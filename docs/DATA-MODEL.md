# Data Model

## ERD

```
┌──────────────────┐      ┌──────────────────┐
│   admin_users    │      │   site_settings  │
│──────────────────│      │──────────────────│
│ id PK            │      │ key PK (string)  │
│ email (uniq)     │      │ value JSON       │
│ password_hash    │      │ updated_at       │
│ name             │      └──────────────────┘
│ is_active        │
│ created_at       │
└──────────────────┘

┌──────────────────┐ 1    N ┌──────────────────┐
│     products     │────────│  product_pages   │
│──────────────────│        │──────────────────│
│ id PK            │        │ id PK            │
│ product_type     │        │ product_id FK    │
│ title            │        │ page_number      │
│ category         │        │ color            │
│ age_group        │        │ image_url        │
│ age_label        │        └──────────────────┘
│ description      │
│ price            │
│ file_name        │        ┌──────────────────┐ 1    N ┌──────────────────┐
│ cover_color      │        │      orders      │────────│   order_items    │
│ drive_download…  │        │──────────────────│        │──────────────────│
│ is_bonus         │        │ id PK            │        │ id PK            │
│ thumbnail_url    │        │ order_id (uniq)  │        │ order_id FK      │
│ has_audio        │        │ customer_email   │        │ product_id       │
│ has_interactive  │        │ customer_name    │        │ product_type     │
│ is_active        │        │ customer_phone   │        │ title            │
│ created_at       │        │ subtotal         │        │ quantity         │
│ updated_at       │        │ discount         │        │ price            │
└──────────────────┘        │ total            │        │ drive_download…  │
                            │ bundle_applied   │        └──────────────────┘
                            │ payment_status   │
                            │ midtrans_*       │
                            │ snap_token       │
                            │ notion_download… │
                            │ created_at       │
                            │ updated_at       │
                            │ paid_at          │
                            └──────────────────┘
```

> **Retired:** `game_access_tokens` table and the `minigame` product type were removed
> when the store pivoted to ebook-only. Any orphaned columns that may still exist on
> prod Postgres (`products.game_url`, `products.icon`, `products.access_duration_hours`,
> `order_items.game_url`, `order_items.access_token`) are no longer referenced by code
> and can be dropped at leisure.

## Key design choices

**One `products` table for both ebook types**
v1 had three Mongo collections (`ebooks`, `minigames`, `ebook_exclusive`) with overlapping fields. v2 originally merged all three and discriminated on `product_type`. After the minigame retirement, v2 keeps the same unified table — it now only serves `ebook` and `ebook_exclusive`, but the single-table shape still pays off with one admin CRUD, one public listing query, and one search index.

**Denormalized order items**
`order_items` copies `title`, `price`, and `drive_download_link` from the product at purchase time. This way receipts stay historically accurate even if the product is later edited or deleted.

**`site_settings` is key-value JSON**
Hero copy, testimonials, FAQ entries, footer text — anything the owner wants to edit without a deploy lands here. Public reads are unauthenticated, writes require admin JWT.

**Integer prices in IDR**
Prices are stored as `int` rupiah (e.g. `10000` = Rp 10.000). No floats, no currency conversion needed.
