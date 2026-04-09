"""Scan source-pdfs/ and ingest as products.

Modes:
    python scripts/ingest-pdfs.py --dry-run           # scan + print table only
    python scripts/ingest-pdfs.py --ingest --email ADMIN --password PASS

Rules (see README in top of file):
    * Ebook Ekslusif/<file>.pdf          -> product_type=ebook_exclusive, flat 35k
    * Level Usia X/<category>/<product dir>/**.pdf  -> one product per product-dir
    * Level Usia X/<category>/<file>.pdf            -> one product per flat pdf
    * Category = the folder directly under the "Level Usia" folder
    * Thumbnail = first page of first PDF rendered via PyMuPDF -> Cloudinary
    * Tags      = naive keywords extracted from the first 2 pages of text
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Iterable

try:
    import fitz  # PyMuPDF
except ImportError:
    print("pip install pymupdf", file=sys.stderr)
    sys.exit(1)

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = REPO_ROOT / "source-pdfs"
ENV_FILE = REPO_ROOT / "backend" / ".env"

SKIP_EXT = {".rtf", ".epub", ".txt", ".png", ".jpg", ".jpeg", ".gif", ".webp"}
SKIP_DIR_NAMES = {"cover", "png file", "png files", "jpg", "jpeg", "images"}

EKSKLUSIF_DIR = "Ebook Ekslusif"
LEVEL_PREFIX = "Level Usia"

EKSKLUSIF_PRICE = 35000


def tier_price_ebook(pages: int) -> int:
    if pages <= 10:
        return 10000
    if pages <= 25:
        return 15000
    return 20000


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


@dataclass
class Product:
    title: str
    product_type: str           # ebook | ebook_exclusive
    category: str
    age_group: str              # "3-4" | "5-6" | "7-9" | "all"
    age_label: str              # "3-4 Tahun" | "Semua Usia"
    description: str
    price: int
    page_count: int             # local only, for tier pricing + display
    tags: list[str]             # local only, merged into description on send
    source_pdfs: list[str]      # local only
    thumbnail_url: str = ""
    is_active: bool = True

    def to_api(self) -> dict:
        """Build the payload for POST /api/v1/admin/products (matches ProductCreate schema)."""
        desc = self.description
        if self.tags:
            desc = f"{desc}\n\nTag: {', '.join(self.tags)}"
        return {
            "product_type": self.product_type,
            "title": self.title,
            "category": self.category,
            "age_group": self.age_group,
            "age_label": self.age_label,
            "description": desc,
            "price": self.price,
            "thumbnail_url": self.thumbnail_url or None,
            "is_active": self.is_active,
            "pages": [],
        }


def is_pdf(p: Path) -> bool:
    return p.suffix.lower() == ".pdf"


def should_skip_dir(p: Path) -> bool:
    return p.name.lower() in SKIP_DIR_NAMES


def collect_pdfs_in_tree(root: Path) -> list[Path]:
    """Return every .pdf under root (recursive), skipping cover/png dirs."""
    out: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dp = Path(dirpath)
        # prune skip dirs in-place
        dirnames[:] = [d for d in dirnames if d.lower() not in SKIP_DIR_NAMES]
        for f in filenames:
            fp = dp / f
            if is_pdf(fp):
                out.append(fp)
    return sorted(out)


def pdf_page_count(p: Path) -> int:
    try:
        with fitz.open(p) as doc:
            return doc.page_count
    except Exception:
        return 0


def pdf_first_text(p: Path, max_chars: int = 2000) -> str:
    try:
        with fitz.open(p) as doc:
            chunks = []
            for i, page in enumerate(doc):
                if i >= 2:
                    break
                chunks.append(page.get_text("text"))
            return " ".join(chunks)[:max_chars]
    except Exception:
        return ""


def extract_tags(text: str, title: str, max_tags: int = 8) -> list[str]:
    """Naive keyword extraction. Lowercase, >=4 chars, not a stopword, ranked by freq."""
    stop = {
        "yang", "dan", "atau", "dari", "untuk", "dengan", "pada", "ini", "itu",
        "the", "and", "for", "with", "from", "that", "this", "are", "was", "were",
        "you", "your", "our", "have", "has", "will", "can", "into", "over", "under",
        "their", "they", "them", "but", "not", "its", "his", "her", "she", "his",
    }
    words = re.findall(r"[a-zA-Zà-ÿ]{4,}", (title + " " + text).lower())
    freq: dict[str, int] = {}
    for w in words:
        if w in stop:
            continue
        freq[w] = freq.get(w, 0) + 1
    ranked = sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))
    return [w for w, _ in ranked[:max_tags]]


def clean_title(name: str) -> str:
    # strip extension, strip "(1)"-style suffixes, replace separators
    stem = Path(name).stem
    stem = re.sub(r"\s*\(\d+\)\s*", " ", stem)
    stem = re.sub(r"[_\-]+", " ", stem)
    stem = re.sub(r"\s+", " ", stem).strip()
    return stem.title()


def parse_age(level_folder: str) -> tuple[str, str]:
    """'Level Usia 3-4 (Early Learning)' -> ('3-4', '3-4 Tahun')"""
    m = re.search(r"(\d+)\s*-\s*(\d+)", level_folder)
    if not m:
        return "", ""
    age = f"{m.group(1)}-{m.group(2)}"
    return age, f"{age} Tahun"


def build_description(title: str, category: str, age_label: str, text: str) -> str:
    head = f"{title}"
    bits = []
    if category:
        bits.append(f"Kategori: {category}")
    if age_label:
        bits.append(f"Untuk anak usia {age_label}")
    teaser = text.strip().replace("\n", " ")[:280]
    parts = [head]
    if bits:
        parts.append(" • ".join(bits))
    if teaser:
        parts.append(teaser)
    return "\n".join(parts)


def scan() -> list[Product]:
    products: list[Product] = []
    if not SOURCE_DIR.exists():
        print(f"Missing: {SOURCE_DIR}", file=sys.stderr)
        return products

    # 1) Ebook Ekslusif
    ek_dir = SOURCE_DIR / EKSKLUSIF_DIR
    if ek_dir.exists():
        for f in sorted(ek_dir.iterdir()):
            if not f.is_file() or not is_pdf(f):
                continue
            pages = pdf_page_count(f)
            text = pdf_first_text(f)
            title = clean_title(f.name)
            products.append(Product(
                title=title,
                product_type="ebook_exclusive",
                category="Premium Bundle",
                age_group="all",
                age_label="Semua Usia",
                description=build_description(title, "Premium Bundle", "Semua Usia", text),
                price=EKSKLUSIF_PRICE,
                page_count=pages,
                tags=extract_tags(text, title),
                source_pdfs=[str(f.relative_to(SOURCE_DIR))],
            ))

    # 2) Level Usia X-Y folders
    for level_dir in sorted(SOURCE_DIR.iterdir()):
        if not level_dir.is_dir() or not level_dir.name.startswith(LEVEL_PREFIX):
            continue
        age, age_label = parse_age(level_dir.name)

        for category_dir in sorted(level_dir.iterdir()):
            if not category_dir.is_dir():
                continue
            category = category_dir.name

            # Decide: is this category a flat PDF list OR a collection of product subfolders?
            direct_pdfs = [p for p in category_dir.iterdir() if p.is_file() and is_pdf(p)]
            product_subdirs = [p for p in category_dir.iterdir() if p.is_dir() and not should_skip_dir(p)]

            # Flat PDFs -> each is one product
            for f in sorted(direct_pdfs):
                pages = pdf_page_count(f)
                text = pdf_first_text(f)
                title = clean_title(f.name)
                products.append(Product(
                    title=title,
                    product_type="ebook",
                    category=category,
                    age_group=age,
                    age_label=age_label,
                    description=build_description(title, category, age_label, text),
                    price=tier_price_ebook(pages),
                    page_count=pages,
                    tags=extract_tags(text, title),
                    source_pdfs=[str(f.relative_to(SOURCE_DIR))],
                ))

            # Product subfolders -> one product per subfolder
            for pdir in sorted(product_subdirs):
                pdfs = collect_pdfs_in_tree(pdir)
                if not pdfs:
                    continue
                total_pages = sum(pdf_page_count(p) for p in pdfs)
                main_pdf = pdfs[0]
                text = pdf_first_text(main_pdf)
                title = clean_title(pdir.name)
                products.append(Product(
                    title=title,
                    product_type="ebook",
                    category=category,
                    age_group=age,
                    age_label=age_label,
                    description=build_description(title, category, age_label, text),
                    price=tier_price_ebook(total_pages),
                    page_count=total_pages,
                    tags=extract_tags(text, title),
                    source_pdfs=[str(p.relative_to(SOURCE_DIR)) for p in pdfs],
                ))

    return products


def print_table(products: list[Product]) -> None:
    from textwrap import shorten
    print()
    print(f"{'#':>3}  {'Type':<17}  {'Age':<5}  {'Cat':<22}  {'Pgs':>4}  {'Price':>9}  Title")
    print("-" * 120)
    for i, p in enumerate(products, 1):
        print(
            f"{i:>3}  {p.product_type:<17}  {p.age_group:<5}  "
            f"{shorten(p.category, 22, placeholder='…'):<22}  "
            f"{p.page_count:>4}  {p.price:>9,}  {shorten(p.title, 55, placeholder='…')}"
        )
    print("-" * 120)
    print(f"Total: {len(products)} products")
    by_type: dict[str, int] = {}
    revenue = 0
    for p in products:
        by_type[p.product_type] = by_type.get(p.product_type, 0) + 1
        revenue += p.price
    print(f"By type: {by_type}")
    print(f"Sum of all prices (if 1 unit each): Rp {revenue:,}")


def render_thumbnail(pdf_path: Path, out_path: Path, dpi: int = 120) -> bool:
    try:
        with fitz.open(pdf_path) as doc:
            if doc.page_count == 0:
                return False
            page = doc.load_page(0)
            mat = fitz.Matrix(dpi / 72, dpi / 72)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            pix.save(str(out_path))
            return True
    except Exception as e:
        print(f"thumb fail {pdf_path}: {e}", file=sys.stderr)
        return False


def upload_cloudinary(img_path: Path, public_id: str, env: dict[str, str]) -> str:
    import cloudinary
    import cloudinary.uploader
    cloudinary.config(
        cloud_name=env.get("CLOUDINARY_CLOUD_NAME"),
        api_key=env.get("CLOUDINARY_API_KEY"),
        api_secret=env.get("CLOUDINARY_API_SECRET"),
        secure=True,
    )
    res = cloudinary.uploader.upload(
        str(img_path),
        public_id=public_id,
        folder="ebookanakstore/thumbnails",
        overwrite=True,
        resource_type="image",
    )
    return res.get("secure_url", "")


def slugify(s: str) -> str:
    s = re.sub(r"[^\w\s-]", "", s.lower())
    s = re.sub(r"[\s_-]+", "-", s).strip("-")
    return s or "product"


def login(api_url: str, email: str, password: str) -> str:
    import requests
    r = requests.post(f"{api_url}/api/v1/admin/auth/login", json={"email": email, "password": password}, timeout=30)
    r.raise_for_status()
    return r.json()["access_token"]


def create_product(api_url: str, token: str, body: dict) -> dict:
    import requests
    r = requests.post(
        f"{api_url}/api/v1/admin/products",
        headers={"Authorization": f"Bearer {token}"},
        json=body,
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Scan and print only, do not upload or POST")
    ap.add_argument("--ingest", action="store_true", help="Render thumbs, upload to Cloudinary, POST to admin API")
    ap.add_argument("--api-url", default=os.environ.get("API_URL", ""))
    ap.add_argument("--email", default=os.environ.get("ADMIN_EMAIL", ""))
    ap.add_argument("--password", default=os.environ.get("ADMIN_PASSWORD", ""))
    ap.add_argument("--limit", type=int, default=0, help="Only process first N products (debug)")
    ap.add_argument("--save-json", default="", help="Write scan result to this JSON file")
    args = ap.parse_args()

    products = scan()
    if args.limit:
        products = products[: args.limit]

    print_table(products)

    if args.save_json:
        Path(args.save_json).write_text(
            json.dumps([asdict(p) for p in products], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"Wrote {args.save_json}")

    if args.dry_run or not args.ingest:
        print("\n(dry-run — no uploads, no API calls)")
        return

    if not args.api_url or not args.email or not args.password:
        print("--ingest requires --api-url, --email, --password (or env vars)", file=sys.stderr)
        sys.exit(2)

    env = load_env(ENV_FILE)
    tmp_dir = REPO_ROOT / ".tmp-thumbs"
    tmp_dir.mkdir(exist_ok=True)

    print(f"\nLogging in to {args.api_url} as {args.email}...")
    token = login(args.api_url, args.email, args.password)
    print("OK")

    for i, p in enumerate(products, 1):
        print(f"\n[{i}/{len(products)}] {p.title}")
        main_pdf = SOURCE_DIR / p.source_pdfs[0]
        slug = slugify(p.title)
        thumb_path = tmp_dir / f"{slug}.png"
        if render_thumbnail(main_pdf, thumb_path):
            try:
                p.thumbnail_url = upload_cloudinary(thumb_path, slug, env)
                print(f"  thumb: {p.thumbnail_url}")
            except Exception as e:
                print(f"  cloudinary fail: {e}")
        else:
            print("  thumb render failed, skipping image")

        try:
            created = create_product(args.api_url, token, p.to_api())
            print(f"  created id={created.get('id')}")
        except Exception as e:
            print(f"  POST failed: {e}")

    print("\nDone.")


if __name__ == "__main__":
    main()
