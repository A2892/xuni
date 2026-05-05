#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command not found: $1"
    exit 1
  fi
}

mask_url() {
  local url="$1"
  echo "$url" | sed -E 's#(postgres(ql)?://[^:]+:)[^@]+#\1***#'
}

SRC_URL="${COCKROACHDB_URL:-${VITE_COCKROACHDB_URL:-}}"
DST_URL="${SUPABASE_DB_URL:-${VITE_SUPABASE_DB_URL:-}}"
TARGET_SSL_CERT="${SUPABASE_DB_SSL_ROOT_CERT:-${DB_SSL_ROOT_CERT:-}}"

if [[ -n "$TARGET_SSL_CERT" && "$TARGET_SSL_CERT" != /* ]]; then
  TARGET_SSL_CERT="$ROOT_DIR/$TARGET_SSL_CERT"
fi

if [[ -z "$SRC_URL" ]]; then
  echo "Error: source CockroachDB URL is missing. Set COCKROACHDB_URL or VITE_COCKROACHDB_URL."
  exit 1
fi

if [[ -z "$DST_URL" ]]; then
  echo "Error: target Supabase URL is missing. Set SUPABASE_DB_URL."
  exit 1
fi

require_cmd psql
require_cmd pg_dump

dst_psql() {
  if [[ -n "$TARGET_SSL_CERT" ]]; then
    PGSSLMODE=verify-full PGSSLROOTCERT="$TARGET_SSL_CERT" psql "$DST_URL" "$@"
  else
    psql "$DST_URL" "$@"
  fi
}

echo "Source: $(mask_url "$SRC_URL")"
echo "Target: $(mask_url "$DST_URL")"

if [[ -z "$TARGET_SSL_CERT" && "$DST_URL" == *"pooler.supabase.com"* ]]; then
  require_cmd openssl

  cert_dir="$ROOT_DIR/scripts/migration/certs"
  mkdir -p "$cert_dir"
  TARGET_SSL_CERT="$cert_dir/supabase-pooler-chain.pem"

  if [[ ! -s "$TARGET_SSL_CERT" ]]; then
    dst_host="$(echo "$DST_URL" | sed -E 's#^postgres(ql)?://[^@]+@([^:/?]+).*#\2#')"
    dst_port="$(echo "$DST_URL" | sed -nE 's#^postgres(ql)?://[^@]+@[^:/?]+:([0-9]+).*#\2#p')"
    if [[ -z "$dst_port" ]]; then dst_port="5432"; fi

    openssl s_client -starttls postgres -showcerts -connect "${dst_host}:${dst_port}" -servername "$dst_host" </dev/null 2>/dev/null \
      | awk '/BEGIN CERTIFICATE/,/END CERTIFICATE/{print}' > "$TARGET_SSL_CERT"
  fi

  echo "Using generated Supabase CA chain: $TARGET_SSL_CERT"
fi

echo "Checking connectivity..."
if ! psql "$SRC_URL" -Atc "select 1" >/dev/null 2>&1; then
  echo "Error: cannot connect to source CockroachDB."
  exit 1
fi

if ! dst_psql -Atc "select 1" >/dev/null 2>&1; then
  echo "Error: cannot connect to target Supabase PostgreSQL."
  echo "Hint: if your network cannot reach db.<project-ref>.supabase.co:5432 (often IPv6-only),"
  echo "      set SUPABASE_DB_URL to the Supabase Transaction Pooler connection string and retry."
  exit 1
fi

echo "Checking source and target table lists..."
SOURCE_TABLES="$(psql "$SRC_URL" -Atc "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name;")"
TARGET_TABLES="$(dst_psql -Atc "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name;")"

if [[ -z "$SOURCE_TABLES" ]]; then
  echo "Error: no public tables found in source database."
  exit 1
fi

COMMON_TABLES="$(comm -12 <(printf '%s\n' "$SOURCE_TABLES") <(printf '%s\n' "$TARGET_TABLES"))"
MISSING_IN_TARGET="$(comm -23 <(printf '%s\n' "$SOURCE_TABLES") <(printf '%s\n' "$TARGET_TABLES"))"

INIT_SQL="$ROOT_DIR/scripts/migration/0-init-supabase-from-cockroach.sql"
if [[ -n "$MISSING_IN_TARGET" && -f "$INIT_SQL" ]]; then
  echo "Target is missing source tables. Applying init SQL: $INIT_SQL"
  dst_psql -v ON_ERROR_STOP=1 -f "$INIT_SQL"

  TARGET_TABLES="$(dst_psql -Atc "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name;")"
  COMMON_TABLES="$(comm -12 <(printf '%s\n' "$SOURCE_TABLES") <(printf '%s\n' "$TARGET_TABLES"))"
  MISSING_IN_TARGET="$(comm -23 <(printf '%s\n' "$SOURCE_TABLES") <(printf '%s\n' "$TARGET_TABLES"))"
fi

if [[ -z "$COMMON_TABLES" ]]; then
  echo "Error: no common public tables between source and target."
  exit 1
fi

echo "Tables to migrate:"
printf '  - %s\n' $COMMON_TABLES

if [[ -n "$MISSING_IN_TARGET" ]]; then
  echo "Warning: these source tables do not exist in target and will be skipped:"
  printf '  - %s\n' $MISSING_IN_TARGET
fi

echo "Truncating target tables before import..."
truncate_sql_parts=()
while IFS= read -r table_name; do
  escaped_table_name="${table_name//\"/\"\"}"
  truncate_sql_parts+=("\"$escaped_table_name\"")
done <<< "$COMMON_TABLES"

truncate_sql="$(IFS=,; echo "${truncate_sql_parts[*]}")"
dst_psql -v ON_ERROR_STOP=1 -c "TRUNCATE TABLE ${truncate_sql} RESTART IDENTITY CASCADE;"

echo "Dumping source data and importing to target..."
DUMP_ARGS=("$SRC_URL" --data-only --inserts --column-inserts --no-owner --no-privileges)
while IFS= read -r table_name; do
  DUMP_ARGS+=(--table="public.$table_name")
done <<< "$COMMON_TABLES"

if [[ -n "$TARGET_SSL_CERT" ]]; then
  pg_dump "${DUMP_ARGS[@]}" | PGSSLMODE=verify-full PGSSLROOTCERT="$TARGET_SSL_CERT" psql "$DST_URL" -v ON_ERROR_STOP=1
else
  pg_dump "${DUMP_ARGS[@]}" | psql "$DST_URL" -v ON_ERROR_STOP=1
fi

echo "Verifying row counts..."
printf '%-28s | %-10s | %-10s | %s\n' "table" "source" "target" "status"
printf '%-28s-+-%-10s-+-%-10s-+-%s\n' "----------------------------" "----------" "----------" "------"

mismatch=0
while IFS= read -r table_name; do
  src_count="$(psql "$SRC_URL" -Atc "select count(*) from \"$table_name\";")"
  dst_count="$(dst_psql -Atc "select count(*) from \"$table_name\";")"
  status="OK"
  if [[ "$src_count" != "$dst_count" ]]; then
    status="MISMATCH"
    mismatch=1
  fi

  printf '%-28s | %-10s | %-10s | %s\n' "$table_name" "$src_count" "$dst_count" "$status"
done <<< "$COMMON_TABLES"

if [[ "$mismatch" -ne 0 ]]; then
  echo "Migration completed with row-count mismatches. Please review the report above."
  exit 1
fi

echo "Migration completed successfully. Source and target row counts match."
