"""Match products on the backend to Google Drive share links.

Source of truth:
    scripts/ingest-preview.json  - produced by ingest-pdfs.py --dry-run; contains
                                   authoritative product -> source_pdfs mapping.
    scripts/drive-links.txt      - filename <TAB> drive_id (one per line).

Matching strategy (exact, not fuzzy):
    For each product in the backend:
        1. Find its entry in ingest-preview.json by exact title match.
        2. For each pdf in source_pdfs, look up its basename in the drive-links table.
        3. Pick the first hit as the product's share link.
        4. If no pdf basename is in the table, report unmatched.

Run:
    python scripts/match-drive-links.py                  # dry-run
    python scripts/match-drive-links.py --apply          # PATCH backend
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from pathlib import Path

import requests

REPO_ROOT = Path(__file__).resolve().parent.parent
PREVIEW_JSON = REPO_ROOT / "scripts" / "ingest-preview.json"
LINKS_FILE = REPO_ROOT / "scripts" / "drive-links.txt"

API_URL = os.environ.get("API_URL", "https://ebookanakstore-production.up.railway.app")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@ebookanak.store")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = re.sub(r"\.pdf$", "", s, flags=re.I)
    s = re.sub(r"[^\w\s]", " ", s.lower())
    s = re.sub(r"\s+", " ", s).strip()
    return s


def load_links() -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for line in LINKS_FILE.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        if len(parts) != 2:
            continue
        fname, fid = parts[0].strip(), parts[1].strip()
        if not fname.lower().endswith(".pdf"):
            continue
        out.setdefault(norm(fname), []).append(fid)
    return out


# Aliases: if a local PDF was renamed after ingest, map its NEW basename to the
# OLD basename that still exists in drive-links.txt.
BASENAME_ALIASES = {
    "pencil control book for kids.pdf": "File...pdf",
}


def load_preview() -> dict[str, list[str]]:
    """title (normalized) -> list of pdf basenames (with aliases applied)."""
    data = json.loads(PREVIEW_JSON.read_text(encoding="utf-8"))
    out: dict[str, list[str]] = {}
    for p in data:
        basenames = []
        for x in p["source_pdfs"]:
            bn = Path(x.replace("\\", "/")).name
            basenames.append(BASENAME_ALIASES.get(bn.lower(), bn))
        out[norm(p["title"])] = basenames
    return out


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


def build_share_url(drive_id: str) -> str:
    return f"https://drive.google.com/file/d/{drive_id}/view?usp=sharing"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    if not ADMIN_PASSWORD:
        print("ADMIN_PASSWORD env var required", file=sys.stderr)
        sys.exit(2)

    links = load_links()
    preview = load_preview()
    print(f"drive-links.txt: {len(links)} unique PDF basenames "
          f"({sum(len(v) for v in links.values())} entries)")
    print(f"ingest-preview.json: {len(preview)} products\n")

    token = login()
    products = list_products(token)
    print(f"Backend has {len(products)} products\n")

    matched: list[tuple[dict, str, str]] = []   # (product, matched_basename, drive_id)
    unmatched: list[tuple[dict, list[str], str]] = []

    # Track how many times each basename has been used so duplicates get distinct ids.
    used: dict[str, int] = {}

    # Process products in a stable order (by id asc) so duplicate assignment is deterministic
    for p in sorted(products, key=lambda x: x["id"]):
        key = norm(p["title"])
        basenames = preview.get(key)
        if not basenames:
            unmatched.append((p, [], "no preview entry"))
            continue

        found_id = None
        found_name = None
        for bn in basenames:
            bn_key = norm(bn)
            ids = links.get(bn_key)
            if not ids:
                continue
            idx = used.get(bn_key, 0)
            if idx < len(ids):
                found_id = ids[idx]
                found_name = bn
                used[bn_key] = idx + 1
                break
            # all dupes already consumed — still use last one but flag
            found_id = ids[-1]
            found_name = bn + " (reused)"
            break

        if found_id:
            matched.append((p, found_name, found_id))
        else:
            unmatched.append((p, basenames, "none of the source PDFs are in drive-links.txt"))

    print("=" * 120)
    print(f"MATCHED: {len(matched)} / {len(products)}")
    print("=" * 120)
    for p, bn, fid in matched:
        print(f"  id={p['id']:>3}  {p['title'][:55]:<55}  <- {bn[:50]:<50}  {fid}")

    print()
    print("=" * 120)
    print(f"UNMATCHED: {len(unmatched)} / {len(products)}")
    print("=" * 120)
    for p, basenames, reason in unmatched:
        print(f"  id={p['id']:>3}  {p['title'][:55]:<55}  ({reason})")
        for bn in basenames:
            print(f"       source pdf: {bn}")

    if args.apply and matched:
        print("\n--- APPLYING patches ---")
        ok = fail = skip = 0
        for p, bn, fid in matched:
            url = build_share_url(fid)
            if p.get("drive_download_link") == url:
                skip += 1
                continue
            try:
                patch_product(token, p["id"], {"drive_download_link": url})
                print(f"  ok   id={p['id']}")
                ok += 1
            except Exception as e:
                print(f"  FAIL id={p['id']}: {e}")
                fail += 1
        print(f"\n{ok} patched, {skip} already set, {fail} failed")
    elif not args.apply:
        print("\n(dry run — pass --apply to patch the backend)")


if __name__ == "__main__":
    main()
