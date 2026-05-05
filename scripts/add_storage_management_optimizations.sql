-- Storage management and security optimization for CockroachDB
-- Usage:
--   psql "$COCKROACHDB_URL" -f scripts/add_storage_management_optimizations.sql

-- Improve storage query performance for dashboard and management APIs.
CREATE INDEX IF NOT EXISTS idx_file_storage_bucket_created_at
ON file_storage (bucket, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_storage_created_at
ON file_storage (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_storage_file_size
ON file_storage (file_size DESC);

CREATE INDEX IF NOT EXISTS idx_file_chunks_file_id
ON file_chunks (file_id);

-- Keep planner stats fresh for large media datasets.
ANALYZE file_storage;
ANALYZE file_chunks;
