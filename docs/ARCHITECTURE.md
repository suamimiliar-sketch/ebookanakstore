# Architecture

## System diagram

```
        ┌──────────────────────────┐       ┌────────────────────────┐
        │   Mobile (Android/iOS)   │       │     Desktop browser    │
        │  Installed PWA / Chrome  │       │                        │
        └─────────────┬────────────┘       └────────────┬───────────┘
                      │  HTTPS                          │
                      ▼                                 ▼
             ┌────────────────────────────────────────────────┐
             │        Next.js 14 App Router (Vercel)          │
             │   ─ Server Components (RSC) for public pages   │
             │   ─ Client Components for cart, checkout, admin│
             │   ─ /api/backend/* proxies to FastAPI          │
             │   ─ manifest.webmanifest → PWA                 │
             └──────────────────────┬─────────────────────────┘
                                    │ JSON REST
                                    ▼
             ┌────────────────────────────────────────────────┐
             │        FastAPI service (Railway / Fly)         │
             │   ─ /api/v1/products   (public)                │
             │   ─ /api/v1/orders     (public)                │
             │   ─ /api/v1/settings   (public read)           │
             │   ─ /api/v1/admin/*    (JWT-guarded)           │
             │   ─ /api/v1/webhooks/midtrans                  │
             └──────┬───────────────┬─────────────────┬───────┘
                    │               │                 │
                    ▼               ▼                 ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │  Postgres    │  │  Midtrans    │  │  Cloudinary  │
          │ (products,   │  │  Snap API    │  │ (thumbnails, │
          │  orders,     │  │              │  │  page images)│
          │  admins,     │  └──────────────┘  └──────────────┘
          │  settings)   │
          └──────────────┘
```

## Layers

**Frontend (Next.js 14)**

- **App Router** separates `(public)` (storefront) from `/admin` (dashboard).
- Public pages are RSC — product list and detail are rendered on the server for SEO and instant first paint.
- Client islands: Header cart badge, `ProductCard` add-to-cart, checkout form, admin CRUD.
- State: `zustand` with persistence for cart + admin auth token.
- Styling: Tailwind + shadcn-style primitives (`Button`, `Input`, `Badge`). No Inter, uses Fraunces (display) + Plus Jakarta Sans (body) per BMO aesthetic.
- Installable PWA via `manifest.webmanifest` + `viewport-fit=cover` + safe-area CSS for notched iOS devices.

**Backend (FastAPI)**

- Single-file app (`app/main.py`) boots from `lifespan`:
  1. Create tables via `Base.metadata.create_all` (Alembic is wired but not required for local).
  2. Bootstrap the first admin from `.env` if the table is empty.
- Layered per entity: `models/`, `schemas/`, `services/`, `api/v1/*`.
- Auth: JWT with bcrypt password hashing (`passlib`). Admin routes mount with `dependencies=[Depends(get_current_admin)]`.
- Payments: `services/midtrans.py` exposes `create_snap_token`. Falls back to a mock token when keys are unset so dev + CI run without touching Midtrans.
- Webhooks: `api/v1/webhooks.py` verifies SHA-512 signature before updating `Order.payment_status`.

**Data**

- Postgres in prod, SQLite fallback for local dev via `DATABASE_URL`.
- Both remaining product types (`ebook`, `ebook_exclusive`) share one `products` table with type-specific nullable columns. This avoids v1's multi-collection sprawl. The `minigame` type has been retired; see DATA-MODEL.md for the retirement notes.
- `product_pages` is a child table for preview images.
- `site_settings` is a key/JSON table — any editable site block is one row.

## Request flow: checkout

1. Client posts `POST /api/v1/orders` with email, name, and an array of item refs.
2. `orders.create_order` resolves each `product_id`, computes totals via `services/pricing.py` (bundle discount rule), persists an `Order` + `OrderItem` rows as `pending`.
3. Calls Midtrans `/snap/v1/transactions` with the totals → receives `token` + `redirect_url`.
4. Persists `snap_token` on the order, returns it to the client.
5. Client opens the Snap redirect; user pays.
6. Midtrans calls `POST /api/v1/webhooks/midtrans` with the status. Signature is verified; order status is flipped to `success` / `failed`; `paid_at` set.
7. Post-success: notification service (stubbed) emails the Drive download link / game URL.
