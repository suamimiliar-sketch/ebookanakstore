"""Import v1 production_backup JSON files into v2 Postgres.

Usage:
    python -m app.seed.migrate_v1 [--backup-path ../ebookanakstore/production_backup]

Safe to re-run: upserts by id.
"""
import argparse
import json
import sys
from pathlib import Path

from app.db.base import Base, SessionLocal, engine
from app.models import Product, ProductPage, SiteSetting


def _upsert_product(db, data: dict, product_type: str) -> None:
    existing = db.query(Product).filter(Product.id == data["id"]).first()
    if existing:
        db.delete(existing)
        db.commit()
    p = Product(
        id=data["id"],
        product_type=product_type,
        title=data.get("title", ""),
        category=data.get("category", "Uncategorized"),
        age_group=data.get("ageGroup", "all"),
        age_label=data.get("ageLabel"),
        description=data.get("description", ""),
        price=int(data.get("price", 0)),
        file_name=data.get("fileName"),
        cover_color=data.get("coverColor"),
        drive_download_link=data.get("driveDownloadLink"),
        is_bonus=bool(data.get("isBonus", False)),
        thumbnail_url=data.get("thumbnailUrl"),
        game_url=data.get("gameUrl"),
        icon=data.get("icon"),
        access_duration_hours=int(data.get("accessDuration", 24)),
        has_audio=bool(data.get("hasAudio", False)),
        has_interactive=bool(data.get("hasInteractive", False)),
        is_active=True,
    )
    for pg in (data.get("pages") or []):
        p.pages.append(ProductPage(
            page_number=pg.get("page", 0),
            color=pg.get("color"),
            image_url=pg.get("imageUrl"),
        ))
    db.add(p)


def run(backup_path: Path) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    imported = {"ebook": 0, "minigame": 0, "ebook_exclusive": 0, "settings": 0}
    try:
        ebooks = backup_path / "ebooks.json"
        if ebooks.exists():
            for item in json.loads(ebooks.read_text(encoding="utf-8")):
                _upsert_product(db, item, "ebook")
                imported["ebook"] += 1

        exclusive = backup_path / "ebook_exclusive.json"
        if exclusive.exists():
            for item in json.loads(exclusive.read_text(encoding="utf-8")):
                _upsert_product(db, item, "ebook_exclusive")
                imported["ebook_exclusive"] += 1

        minis = backup_path / "minigames.json"
        if minis.exists():
            for item in json.loads(minis.read_text(encoding="utf-8")):
                _upsert_product(db, item, "minigame")
                imported["minigame"] += 1

        settings_file = backup_path / "site_settings.json"
        if settings_file.exists():
            payload = json.loads(settings_file.read_text(encoding="utf-8"))
            for k, v in payload.items():
                existing = db.query(SiteSetting).filter(SiteSetting.key == k).first()
                if existing:
                    existing.value = v if isinstance(v, dict) else {"value": v}
                else:
                    db.add(SiteSetting(key=k, value=v if isinstance(v, dict) else {"value": v}))
                imported["settings"] += 1

        db.commit()
    finally:
        db.close()

    print("Imported:", imported)


def main() -> None:
    parser = argparse.ArgumentParser()
    here = Path(__file__).resolve()
    default = here.parents[3].parent / "ebookanakstore" / "production_backup"
    parser.add_argument("--backup-path", type=Path, default=default)
    args = parser.parse_args()

    if not args.backup_path.exists():
        print(f"Backup path not found: {args.backup_path}", file=sys.stderr)
        sys.exit(1)
    run(args.backup_path)


if __name__ == "__main__":
    main()
