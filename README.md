# ebookanakstore v2 — Pelangi Pintar

Production-grade rebuild of **ebookanak.store**, now branded as **Pelangi Pintar** — an
Indonesian digital storefront selling printable ebooks and exclusive content for kids
ages 0–8. Smart, colorful, and joyful learning.

This v2 is a full rewrite on a modern, mobile-first, professionally architected stack.

---

## Why v2

The original (`../ebookanakstore/`) was a CRA + FastAPI + MongoDB app. It works, but:

- CRA is EOL and hard to ship a true PWA / mobile-wrapped build from.
- MongoDB was overkill for a catalog with ~40 SKUs and relational orders.
- Admin UX was a single 900-line `AdminDashboard.jsx`.
- No clean workflow for staging / CI / data migrations.

v2 fixes all four.

---

## Stack

| Layer          | Tech                                                   |
| -------------- | ------------------------------------------------------ |
| Frontend       | **Next.js 14** (App Router) + TypeScript + Tailwind + shadcn/ui |
| Mobile         | Responsive PWA (installable on Android & iOS) — single codebase |
| Backend        | **FastAPI** + SQLAlchemy 2.0 + Pydantic v2              |
| Database       | **PostgreSQL** (SQLite fallback for local dev)         |
| Auth           | JWT (admin) + session cookies                          |
| Payments       | Midtrans Snap                                          |
| Media          | Cloudinary                                             |
| Deploy         | Vercel (frontend) + Railway/Fly.io (backend + Postgres) |
| CI/CD          | GitHub Actions                                         |

See `docs/ARCHITECTURE.md` for the full diagram.

---

## Folder map

```
ebookanakstore-v2/
├── backend/                  FastAPI service
│   ├── app/
│   │   ├── api/v1/           versioned REST endpoints
│   │   ├── core/             config, security, logging
│   │   ├── db/               SQLAlchemy engine + session
│   │   ├── models/           ORM models
│   │   ├── schemas/          Pydantic request/response schemas
│   │   ├── services/         Midtrans, Cloudinary, email, tokens
│   │   └── seed/             data migration from v1 production_backup
│   ├── alembic/              migrations (generated on first run)
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                 Next.js 14 app
│   ├── src/
│   │   ├── app/              App Router
│   │   │   ├── (public)/     public storefront
│   │   │   │   ├── page.tsx            home
│   │   │   │   ├── katalog/page.tsx    catalog
│   │   │   │   ├── produk/[id]/page.tsx product detail
│   │   │   │   └── checkout/page.tsx   checkout
│   │   │   ├── admin/        admin dashboard (protected)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx            overview
│   │   │   │   ├── produk/page.tsx     product CRUD
│   │   │   │   ├── pesanan/page.tsx    orders
│   │   │   │   └── pengaturan/page.tsx site settings
│   │   │   └── api/          Next route handlers (BFF proxies)
│   │   ├── components/       ui/ layout/ sections/ admin/
│   │   ├── lib/              api client, auth, utils
│   │   ├── hooks/
│   │   ├── types/
│   │   └── styles/globals.css
│   ├── public/               icons, manifest.json, favicon, og images
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/
│   ├── ARCHITECTURE.md       system diagram + request flow
│   ├── WORKFLOW.md           dev → staging → prod workflow
│   ├── DATA-MODEL.md         ERD + schema reference
│   ├── DEPLOY.md             step-by-step deploy guide
│   └── MIGRATION-FROM-V1.md  how v1 data lands in v2
│
├── scripts/
│   ├── dev.sh                one-shot local dev (backend + frontend)
│   ├── migrate-v1-data.py    pulls from ../ebookanakstore/production_backup/
│   └── seed-admin.py         create initial admin user
│
└── .github/workflows/
    ├── backend-ci.yml
    └── frontend-ci.yml
```

---

## Quick start

```bash
# 1. Backend
cd backend
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed.migrate_v1   # imports ebooks, games, settings from v1 backup
uvicorn app.main:app --reload --port 8000

# 2. Frontend (separate terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                      # http://localhost:3000
```

Admin login lives at `http://localhost:3000/admin/login`. Default creds are printed by
`scripts/seed-admin.py` on first run.

---

## What's different from v1

| Concern        | v1                        | v2                                         |
| -------------- | ------------------------- | ------------------------------------------ |
| Frontend       | CRA + craco               | Next.js 14 App Router                      |
| Routing        | `react-router-dom` client | File-system routes + RSC                   |
| Mobile         | Responsive only           | PWA + installable + offline catalog        |
| Database       | MongoDB (Motor)           | Postgres (SQLAlchemy 2.0)                  |
| Admin UI       | 1 × 925-line file         | Split per-entity pages with shadcn Tables  |
| Image mgmt     | manual Cloudinary URLs    | signed uploads from admin                  |
| Tests          | none                      | pytest + Playwright smoke                  |
| CI             | none                      | GitHub Actions                             |

See `docs/MIGRATION-FROM-V1.md` for the migration path.

---

## Ownership

Product Director domain. See `/BMO/CLAUDE.md` for company routing rules.
