"""Upload revised ebook_exclusive thumbnails to Cloudinary and PATCH backend.

Source images: source-pdfs/Ebook Ekslusif/thumbnail ekslusif/
Mapping: filename -> backend product id (resolved by title match below).
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import requests

REPO_ROOT = Path(__file__).resolve().parent.parent
THUMB_DIR = REPO_ROOT / "source-pdfs" / "Ebook Ekslusif" / "thumbnail ekslusif"
ENV_FILE = REPO_ROOT / "backend" / ".env"

API_URL = os.environ.get("API_URL", "https://ebookanakstore-production.up.railway.app")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@ebookanak.store")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")

# filename in thumbnail ekslusif/ -> substring to find in product title (lowercased)
THUMB_TO_TITLE_HINT = {
    "education resources.jpg": "education resources",
    "kids worksheet bundle.jpg": "kids worksheet bundle",
    "kindergartden workbook canva template.jpg": "kindegarden workbook",
    "preschool activity learning bundle.jpg": "pre school activity",
    "preschool learning bundle.jpg": "preschool learning bundle",
    "toonanimals.png": "toonimal",
    "ultimate childrens activity bundle.jpg": "ultimate children",
}


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


def login() -> str:
    r = requests.post(
        f"{API_URL}/api/v1/admin/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["access_token"]


def list_products(token: str) -> list[dict]:
    r = requests.get(
        f"{API_URL}/api/v1/admin/products",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def patch_product(token: str, pid: int, body: dict) -> None:
    r = requests.patch(
        f"{API_URL}/api/v1/admin/products/{pid}",
        headers={"Authorization": f"Bearer {token}"},
        json=body,
        timeout=30,
    )
    r.raise_for_status()


MAX_BYTES = 10 * 1024 * 1024


def maybe_shrink(img_path: Path) -> Path:
    """If file > 10MB, downscale + recompress to a tmp jpg under the limit."""
    if img_path.stat().st_size <= MAX_BYTES:
        return img_path
    from PIL import Image
    tmp = img_path.with_suffix(".shrunk.jpg")
    im = Image.open(img_path).convert("RGB")
    max_dim = 2000
    if max(im.size) > max_dim:
        ratio = max_dim / max(im.size)
        im = im.resize((int(im.size[0] * ratio), int(im.size[1] * ratio)), Image.LANCZOS)
    im.save(tmp, "JPEG", quality=85, optimize=True)
    print(f"  shrunk {img_path.name}: {img_path.stat().st_size//1024}KB -> {tmp.stat().st_size//1024}KB")
    return tmp


def upload_cloudinary(img_path: Path, public_id: str, env: dict[str, str]) -> str:
    import cloudinary
    import cloudinary.uploader
    cloudinary.config(
        cloud_name=env.get("CLOUDINARY_CLOUD_NAME"),
        api_key=env.get("CLOUDINARY_API_KEY"),
        api_secret=env.get("CLOUDINARY_API_SECRET"),
        secure=True,
    )
    upload_path = maybe_shrink(img_path)
    res = cloudinary.uploader.upload(
        str(upload_path),
        public_id=public_id,
        folder="ebookanakstore/thumbnails",
        overwrite=True,
        resource_type="image",
    )
    if upload_path != img_path:
        try:
            upload_path.unlink()
        except OSError:
            pass
    return res.get("secure_url", "")


def main() -> None:
    if not ADMIN_PASSWORD:
        print("ADMIN_PASSWORD env var required", file=sys.stderr)
        sys.exit(2)

    env = load_env(ENV_FILE)
    if not env.get("CLOUDINARY_CLOUD_NAME"):
        print("Cloudinary creds missing in backend/.env", file=sys.stderr)
        sys.exit(2)

    token = login()
    products = list_products(token)
    excl = [p for p in products if p["product_type"] == "ebook_exclusive"]
    print(f"Backend has {len(excl)} ebook_exclusive products")

    for fname, hint in THUMB_TO_TITLE_HINT.items():
        img = THUMB_DIR / fname
        if not img.exists():
            print(f"  MISS file: {fname}")
            continue
        match = next((p for p in excl if hint in p["title"].lower()), None)
        if not match:
            print(f"  MISS product: {fname} (hint='{hint}')")
            continue
        public_id = f"exclusive-{match['id']}-{img.stem.replace(' ', '-').lower()}"
        url = upload_cloudinary(img, public_id, env)
        print(f"  uploaded {fname} -> {url}")
        patch_product(token, match["id"], {"thumbnail_url": url})
        print(f"  patched id={match['id']} ({match['title']})")


if __name__ == "__main__":
    main()
