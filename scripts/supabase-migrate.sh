#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-schema}"
LOCAL_DATABASE_URL="${LOCAL_DATABASE_URL:-postgres://postgres:postgres@localhost:5433/prestasi_app}"

if [[ -z "${SUPABASE_DATABASE_URL:-}" ]]; then
  cat <<'USAGE'
Missing SUPABASE_DATABASE_URL.

Usage:
  SUPABASE_DATABASE_URL="postgresql://..." npm run supabase:migrate
  SUPABASE_DATABASE_URL="postgresql://..." npm run supabase:migrate:seed
  SUPABASE_DATABASE_URL="postgresql://..." npm run supabase:copy-local

Tip:
  Copy the Supabase Session Pooler or Direct connection string from Supabase Dashboard > Connect.
USAGE
  exit 1
fi

export DATABASE_URL="$SUPABASE_DATABASE_URL"

case "$MODE" in
  schema)
    echo "Applying Drizzle migrations to Supabase..."
    npx drizzle-kit migrate
    ;;

  schema-seed)
    echo "Applying Drizzle migrations to Supabase..."
    npx drizzle-kit migrate
    echo "Seeding Supabase with demo data..."
    npm run db:seed
    ;;

  copy-local)
    if ! command -v pg_dump >/dev/null 2>&1 || ! command -v pg_restore >/dev/null 2>&1; then
      echo "pg_dump and pg_restore are required. Install PostgreSQL client tools first."
      exit 1
    fi

    dump_dir="$(mktemp -d)"
    dump_file="$dump_dir/prestasi_app.dump"

    echo "Dumping local database..."
    pg_dump "$LOCAL_DATABASE_URL" \
      --format=custom \
      --no-owner \
      --no-privileges \
      --schema=public \
      --file="$dump_file"

    echo "Restoring local dump to Supabase..."
    pg_restore \
      --dbname="$DATABASE_URL" \
      --no-owner \
      --no-privileges \
      --verbose \
      "$dump_file"

    rm -rf "$dump_dir"
    ;;

  *)
    echo "Unknown mode: $MODE"
    echo "Use one of: schema, schema-seed, copy-local"
    exit 1
    ;;
esac

echo "Done."
