#!/usr/bin/env bash
# Boot backend + frontend together for local dev.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ Starting FastAPI on :8000"
(cd "$ROOT/backend" && uvicorn app.main:app --reload --port 8000) &
API_PID=$!

echo "→ Starting Next.js on :3000"
(cd "$ROOT/frontend" && npm run dev) &
WEB_PID=$!

trap "kill $API_PID $WEB_PID 2>/dev/null || true" EXIT
wait
