-- Initialize target CockroachDB schema to match current source tables.
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT,
  student_id TEXT,
  major TEXT,
  school TEXT,
  college TEXT,
  email TEXT,
  phone TEXT,
  enrollment_date TEXT,
  expected_graduation TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.student_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  type TEXT,
  file_name TEXT,
  file_size BIGINT,
  storage_path TEXT,
  url TEXT,
  thumbnail_url TEXT,
  student_name TEXT,
  student_id TEXT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  folder_id TEXT,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT,
  student_id TEXT,
  document_type TEXT,
  document_name TEXT,
  file_url TEXT,
  file_size BIGINT,
  status TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  folder_id TEXT,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.saved_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  document_type TEXT,
  name TEXT,
  data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT,
  password TEXT,
  full_name TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id TEXT
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.file_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  file_data BYTES NOT NULL,
  content_type TEXT DEFAULT 'application/octet-stream',
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_chunked BOOL DEFAULT false,
  total_chunks BIGINT DEFAULT 1,
  chunk_size BIGINT
);

CREATE TABLE IF NOT EXISTS public.file_chunks (
  file_id UUID NOT NULL,
  chunk_index BIGINT NOT NULL,
  chunk_data BYTES NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (file_id, chunk_index)
);

CREATE UNIQUE INDEX IF NOT EXISTS file_storage_bucket_path_key ON public.file_storage (bucket, path);

CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON public.student_profiles (student_id);
CREATE INDEX IF NOT EXISTS idx_student_media_student_id ON public.student_media (student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON public.student_documents (student_id);
