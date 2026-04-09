#!/usr/bin/env bash
# Import v1 production backup JSON into v2 database.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
python -m app.seed.migrate_v1 --backup-path "../../ebookanakstore/production_backup"
