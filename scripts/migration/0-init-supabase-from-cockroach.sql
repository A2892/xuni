-- Initialize Supabase schema to match current CockroachDB source tables.
-- Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text,
  student_id text,
  major text,
  school text,
  college text,
  email text,
  phone text,
  enrollment_date text,
  expected_graduation text,
  photo_url text,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.student_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  type text,
  file_name text,
  file_size bigint,
  storage_path text,
  url text,
  thumbnail_url text,
  student_name text,
  student_id text,
  description text,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz,
  folder_id text,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.student_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text,
  student_id text,
  document_type text,
  document_name text,
  file_url text,
  file_size bigint,
  status text,
  notes text,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz,
  folder_id text,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.saved_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  document_type text,
  name text,
  data jsonb,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text,
  password text,
  full_name text,
  role text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  user_id text
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  role text,
  created_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.file_storage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  path text NOT NULL,
  file_data bytea NOT NULL,
  content_type text DEFAULT 'application/octet-stream',
  file_size bigint,
  created_at timestamptz DEFAULT now(),
  is_chunked boolean DEFAULT false,
  total_chunks bigint DEFAULT 1,
  chunk_size bigint
);

CREATE TABLE IF NOT EXISTS public.file_chunks (
  file_id uuid NOT NULL,
  chunk_index bigint NOT NULL,
  chunk_data bytea NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (file_id, chunk_index)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'file_storage_bucket_path_key'
      AND conrelid = 'public.file_storage'::regclass
  ) THEN
    ALTER TABLE public.file_storage
      ADD CONSTRAINT file_storage_bucket_path_key UNIQUE (bucket, path);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON public.student_profiles (student_id);
CREATE INDEX IF NOT EXISTS idx_student_media_student_id ON public.student_media (student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON public.student_documents (student_id);
