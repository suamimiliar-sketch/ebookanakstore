# Deploy

Two-service deploy: Next.js on **Vercel**, FastAPI + Postgres on **Railway**.

## Prereqs

- GitHub repo with `ebookanakstore-v2/` at root (or push just this folder as a standalone repo).
- Accounts: Vercel, Railway (or Fly.io), Midtrans, Cloudinary.

## 1. Backend (Railway)

1. **New project → Deploy from GitHub repo → select this repo**.
2. Set **root directory** to `backend/`.
3. Railway auto-detects the `Dockerfile`.
4. **Add Postgres plugin**. It will inject `DATABASE_URL` automatically. Make sure it uses the `postgresql+psycopg://` scheme — edit the var if needed.
5. Add env vars (copy from `backend/.env.example`):
   - `JWT_SECRET` — `openssl rand -hex 32`
   - `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`
   - `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`
   - `CLOUDINARY_*`
   - `CORS_ORIGINS=https://ebookanak.store,https://www.ebookanak.store`
6. Deploy. Note the public URL, e.g. `https://ebookanak-api.up.railway.app`.
7. Health check: `GET /api/health`.
8. Seed data from a Railway shell:
   ```
   python -m app.seed.migrate_v1 --backup-path ./production_backup
   ```
   (Upload the JSON backup first, or include it in the Docker image.)

## 2. Frontend (Vercel)

1. **New project → Import repo**.
2. Set **root directory** to `frontend/`.
3. Framework preset: **Next.js**.
4. Env vars:
   - `NEXT_PUBLIC_API_URL=https://ebookanak-api.up.railway.app`
   - `NEXT_PUBLIC_SITE_URL=https://ebookanak.store`
   - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=<your client key>`
5. Build. Attach the custom domain `ebookanak.store`.

## 3. Midtrans webhook

In the Midtrans dashboard → **Settings → Configuration → Payment Notification URL**:

```
https://ebookanak-api.up.railway.app/api/v1/webhooks/midtrans
```

## 4. Smoke test

```
curl https://ebookanak-api.up.railway.app/api/health
curl https://ebookanak-api.up.railway.app/api/v1/products
open https://ebookanak.store
```

Log in at `https://ebookanak.store/admin/login` with the bootstrap credentials.
**Change the password immediately.**

## Rollback

- **Frontend**: Vercel → Deployments → pick a previous green deploy → "Promote".
- **Backend**: Railway → Deployments → pick previous → "Redeploy".
- **Database**: Railway Postgres has daily backups on paid tier. Restore via the plugin UI.
