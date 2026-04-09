# Migration from v1

How v1 data + features land in v2.

## What we keep from v1

- The ebook catalog (`production_backup/ebooks.json`, `ebook_exclusive.json`).
- Site settings (`production_backup/site_settings.json`).
- Cloudinary URLs — unchanged, the CDN paths still work.
- Google Drive download links — unchanged.
- Midtrans account, server key, client key — unchanged.
- Brand — fully rebranded as **Pelangi Pintar** with a new palette, logo, and mascot (Huto).

## What we drop

- MongoDB + Motor → Postgres + SQLAlchemy.
- CRA + craco + react-router → Next.js 14 App Router.
- Two ebook collections → one unified `products` table.
- The 925-line `AdminDashboard.jsx` → per-entity pages under `src/app/admin/*/page.tsx`.
- **Mini-games are retired.** The `minigames.json` source is no longer imported, the
  `minigame` product type has been removed from all schemas and API surfaces, and the
  `GameAccessToken` table is gone. Any existing `product_type='minigame'` rows on the
  prod Postgres are defensively filtered out at the API layer and should be manually
  cleaned up.

## Field mapping

| v1 JSON key           | v2 column                  | Notes                             |
| --------------------- | -------------------------- | --------------------------------- |
| `id`                  | `products.id`              | same int                          |
| `title`               | `title`                    |                                   |
| `category`            | `category`                 |                                   |
| `ageGroup`            | `age_group`                |                                   |
| `ageLabel`            | `age_label`                |                                   |
| `description`         | `description`              |                                   |
| `price`               | `price`                    | int IDR                           |
| `fileName`            | `file_name`                |                                   |
| `coverColor`          | `cover_color`              |                                   |
| `pages[].page`        | `product_pages.page_number`|                                   |
| `pages[].color`       | `product_pages.color`      |                                   |
| `pages[].imageUrl`    | `product_pages.image_url`  |                                   |
| `isBonus`             | `is_bonus`                 |                                   |
| `driveDownloadLink`   | `drive_download_link`      |                                   |
| `productType`         | `product_type`             | discriminator (`ebook` \| `ebook_exclusive`) |
| `thumbnailUrl`        | `thumbnail_url`            |                                   |
| `hasAudio`            | `has_audio`                | exclusive only                    |
| `hasInteractive`      | `has_interactive`          | exclusive only                    |

**Dropped v1 fields (minigame-only, no longer in the schema):** `gameUrl`, `icon`,
`accessDuration`. If they appear in `production_backup/minigames.json` they are simply
ignored — the seeder no longer processes that file at all.

Orders are **not** migrated — v1 orders stay in MongoDB as historical reference, v2 starts fresh with an empty `orders` table.

## How to run the migration

From inside `backend/`:

```bash
python -m app.seed.migrate_v1 --backup-path ../../ebookanakstore/production_backup
```

Or use the shell wrapper:

```bash
./scripts/migrate-v1-data.sh
```

Output:

```
Imported: {'ebook': 38, 'ebook_exclusive': 6, 'settings': 9}
```

The script is idempotent — re-running it deletes and reinserts each matching `id`.

## Cutover plan

1. **Freeze v1 catalog edits.** Announce to stakeholders.
2. Export fresh `production_backup/*.json` from the v1 MongoDB.
3. Deploy v2 backend and run the migration against a fresh Postgres.
4. Deploy v2 frontend.
5. Point `ebookanak.store` DNS at Vercel (v2 frontend).
6. Point Midtrans webhook at the v2 backend URL.
7. Smoke test: open the store, place a test order in Midtrans sandbox, confirm webhook → `success`.
8. Monitor for 24 hours, then archive v1 code at `../ebookanakstore/` (read-only tag).
