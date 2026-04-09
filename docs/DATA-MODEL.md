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
│ game_url         │        │ customer_email   │        │ product_id       │
│ icon             │        │ customer_name    │        │ product_type     │
│ access_duration  │        │ customer_phone   │        │ title            │
│ has_audio        │        │ subtotal         │        │ quantity         │
│ has_interactive  │        │ discount         │        │ price            │
│ is_active        │        │ total            │        │ drive_download…  │
│ created_at       │        │ bundle_applied   │        │ game_url         │
│ updated_at       │        │ payment_status   │        │ access_token     │
└──────────────────┘        │ midtrans_*       │        └──────────────────┘
                            │ snap_token       │
                            │ notion_download… │
                            │ created_at       │
                            │ updated_at       │
                            │ paid_at          │
                            └──────────────────┘

┌──────────────────────┐
│  game_access_tokens  │
│──────────────────────│
│ id PK                │
│ token (uniq)         │
│ game_id              │
│ order_id             │
│ customer_email       │
│ customer_name        │
│ game_url             │
│ created_at           │
│ expires_at           │
│ is_active            │
│ access_count         │
└──────────────────────┘
```

## Key design choices

**One `products` table for all three types**
v1 had three Mongo collections (`ebooks`, `minigames`, `ebook_exclusive`) with overlapping fields. v2 merges them and discriminates on `product_type`. The trade-off: a few columns are always nullable (e.g. `game_url` is `NULL` for ebooks). The gain: one admin CRUD, one public listing query, one search index.

**Denormalized order items**
`order_items` copies `title`, `price`, `drive_download_link`, and `game_url` from the product at purchase time. This way receipts stay historically accurate even if the product is later edited or deleted.

**`site_settings` is key-value JSON**
Hero copy, testimonials, FAQ entries, footer text — anything the owner wants to edit without a deploy lands here. Public reads are unauthenticated, writes require admin JWT.

**Integer prices in IDR**
Prices are stored as `int` rupiah (e.g. `10000` = Rp 10.000). No floats, no currency conversion needed.
