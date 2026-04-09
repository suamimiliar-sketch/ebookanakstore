# Workflow

End-to-end dev → staging → production flow for ebookanakstore-v2.

## Branching

```
main           ← production (auto-deploys to Vercel + Railway prod)
├── staging    ← staging environment
└── feat/*     ← short-lived feature branches opened off staging
```

Rules:

1. No direct pushes to `main`. Every change lands via PR from `staging`.
2. Feature branches merge into `staging` once CI (`backend-ci` + `frontend-ci`) is green.
3. A human review is required for anything touching `backend/app/api/v1/webhooks.py`, `orders.py`, or payment logic.

## Local dev loop

```
┌──────────┐      git checkout -b feat/my-thing
│ Developer│────▶ ./scripts/dev.sh            # backend on :8000, frontend on :3000
└──────────┘      edit code
                  pytest / npm run typecheck
                  git commit -m "feat: …"
                  gh pr create --base staging
```

`./scripts/dev.sh` spins up both services with hot-reload. Env files are loaded from `backend/.env` and `frontend/.env.local`.

## Data seeding

First-time setup:

```bash
# 1. Create an admin
python scripts/seed-admin.py admin@ebookanak.store 's3cret!'

# 2. Import v1 production backup
./scripts/migrate-v1-data.sh
```

The migrate script is idempotent — safe to re-run after editing JSON.

## CI

Two GitHub Actions workflows run in parallel:

| Workflow        | Triggers on           | Does                                |
| --------------- | --------------------- | ----------------------------------- |
| `backend-ci`    | changes in `backend/` | `pytest` against SQLite in-memory   |
| `frontend-ci`   | changes in `frontend/`| `next build` + `tsc --noEmit`       |

Both must be green before merging to `staging`.

## Deploy pipelines

### Frontend — Vercel

- Project root: `frontend/`
- Build command: `npm run build`
- Output: `.next`
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_SITE_URL`
- Preview deployments on every PR; production auto-deploy on `main`.

### Backend — Railway (or Fly.io)

- Dockerfile at `backend/Dockerfile`
- Env: everything from `backend/.env.example`
- Persistent Postgres addon — `DATABASE_URL` is injected automatically.
- Migrations run on boot via the `lifespan` handler.

### Webhook registration

After the backend is live, set the Midtrans payment-notification URL to:

```
https://<api-host>/api/v1/webhooks/midtrans
```

## Monitoring & rollback

- **Health**: `GET /api/health` returns `{ ok, env, version }`. Use it as the Railway healthcheck.
- **Logs**: both Vercel and Railway give tail-the-logs out of the box.
- **Rollback**: Vercel → "Promote previous deployment". Railway → redeploy previous image tag.

## Admin workflows

### Add a new product

1. `/admin/login`
2. Sidebar → **Produk** → **Tambah**
3. Fill the form (title, type, category, age, price, Google Drive link, thumbnail URL).
4. Save. Product appears instantly on `/katalog` (cached 2 min).

### Edit hero / testimonials / FAQ

1. `/admin/pengaturan`
2. Pick the setting key (`hero`, `testimonials`, `faq`).
3. Edit the JSON blob.
4. Save — public pages revalidate on the next hit.

### Fulfill a paid order

Orders flip to `success` automatically via the webhook. The notification service
then emails the buyer the Drive download link. If you need to manually re-send:
`/admin/pesanan` → open order → "Kirim ulang".

## Cross-domain (company-wide) workflow

ebookanakstore-v2 lives inside the `PRODUCT` domain of BMO (see `/BMO/CLAUDE.md`).
When a product launch happens:

1. **CEO** writes the brief.
2. **Product Director** adds/updates SKUs via the admin dashboard.
3. **Creative Director** picks up the updated catalog and runs `/create-content`
   (see `/BMO/CREATIVE/creative-team-claude/CLAUDE.md`) to produce 6-variant funnel content.
4. **Platform Specialist** optimizes for distribution.
5. **CEO** approves; Product Director toggles the SKU `is_active = true` — it goes live.
