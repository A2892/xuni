-- 创建学生媒体表（如果不存在）
CREATE TABLE IF NOT EXISTS student_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  student_name TEXT,
  student_id TEXT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建学生档案表（如果不存在）
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  major TEXT,
  college TEXT,
  email TEXT,
  phone TEXT,
  enrollment_date DATE,
  expected_graduation_date DATE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建学生文档表（如果不存在）
CREATE TABLE IF NOT EXISTS student_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  folder_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引 - student_media
CREATE INDEX IF NOT EXISTS idx_student_media_student_id ON student_media(student_id);
CREATE INDEX IF NOT EXISTS idx_student_media_student_name ON student_media(student_name);
CREATE INDEX IF NOT EXISTS idx_student_media_created_at ON student_media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_media_type ON student_media(type);

-- 创建索引 - student_profiles
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON student_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_name ON student_profiles(student_name);
CREATE INDEX IF NOT EXISTS idx_student_profiles_created_at ON student_profiles(created_at DESC);

-- 创建索引 - student_documents
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_type ON student_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_student_documents_folder_id ON student_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_created_at ON student_documents(created_at DESC);

-- 启用行级安全（RLS） - student_media
ALTER TABLE student_media ENABLE ROW LEVEL SECURITY;

-- 启用行级安全（RLS） - student_profiles
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- 启用行级安全（RLS） - student_documents
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- 创建或替换辅助函数（用于管理员检查）
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 删除旧的宽松策略并创建更严格的管理员/所有者策略（student_media）
DROP POLICY IF EXISTS "Anyone can view media" ON public.student_media;
DROP POLICY IF EXISTS "Anyone can insert media" ON public.student_media;
DROP POLICY IF EXISTS "Anyone can update media" ON public.student_media;
DROP POLICY IF EXISTS "Anyone can delete media" ON public.student_media;

CREATE POLICY "student_media_admin_all" ON public.student_media
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_media' AND column_name = 'user_id'
  ) THEN
    CREATE POLICY "student_media_user_own" ON public.student_media
      FOR ALL
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END$$;

-- student_profiles: 默认只允许管理员全部操作，普通用户可插入（根据需要可调整）
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Anyone can delete profiles" ON public.student_profiles;

CREATE POLICY "student_profiles_admin_all" ON public.student_profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 如果存在 user_id，可以添加所有者策略
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'user_id'
  ) THEN
    CREATE POLICY "student_profiles_user_own" ON public.student_profiles
      FOR ALL
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END$$;

-- student_documents: 管理员策略 + 若有 user_id 则创建所有者策略
DROP POLICY IF EXISTS "Anyone can view documents" ON public.student_documents;
DROP POLICY IF EXISTS "Anyone can insert documents" ON public.student_documents;
DROP POLICY IF EXISTS "Anyone can update documents" ON public.student_documents;
DROP POLICY IF EXISTS "Anyone can delete documents" ON public.student_documents;

CREATE POLICY "student_documents_admin_all" ON public.student_documents
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_documents' AND column_name = 'user_id'
  ) THEN
    CREATE POLICY "student_documents_user_own" ON public.student_documents
      FOR ALL
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END$$;
