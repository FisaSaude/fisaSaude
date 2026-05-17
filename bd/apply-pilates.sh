#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-root}"
if [[ -z "${DB_PASSWORD:-}" ]]; then
  echo "Defina DB_PASSWORD (ex.: export DB_PASSWORD='sua_senha')" >&2
  exit 1
fi
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" < "$ROOT/pilates.sql"
echo "Schema pilates aplicado com sucesso."
