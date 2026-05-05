-- 快速创建必需的表

-- 1. 创建学生档案表
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

-- 2. 创建学生媒体表
CREATE TABLE IF NOT EXISTS student_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 3. 创建学生文档表
CREATE TABLE IF NOT EXISTS student_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 启用行级安全并创建公开访问策略
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- 删除已存在的策略
DROP POLICY IF EXISTS "public_access" ON student_profiles;
DROP POLICY IF EXISTS "public_access" ON student_media;
DROP POLICY IF EXISTS "public_access" ON student_documents;
-- 删除已存在的宽松策略
DROP POLICY IF EXISTS "public_access" ON public.student_profiles;
DROP POLICY IF EXISTS "public_access" ON public.student_media;
DROP POLICY IF EXISTS "public_access" ON public.student_documents;

-- 推荐：使用管理员 + 所有者 策略替代宽松策略
-- 依赖：请先确保存在 public.is_admin() 辅助函数（见 scripts/fix_student_documents_rls.sql）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_profiles' AND policyname='student_profiles_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "student_profiles_admin_all" ON public.student_profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'user_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_profiles' AND policyname='student_profiles_user_own') THEN
      EXECUTE $sql$CREATE POLICY "student_profiles_user_own" ON public.student_profiles FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
    END IF;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_media' AND policyname='student_media_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "student_media_admin_all" ON public.student_media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_media' AND column_name = 'user_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_media' AND policyname='student_media_user_own') THEN
      EXECUTE $sql$CREATE POLICY "student_media_user_own" ON public.student_media FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
    END IF;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_documents' AND policyname='student_documents_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "student_documents_admin_all" ON public.student_documents FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_documents' AND column_name = 'user_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_documents' AND policyname='student_documents_user_own') THEN
      EXECUTE $sql$CREATE POLICY "student_documents_user_own" ON public.student_documents FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
    END IF;
  END IF;
END$$;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON student_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_media_student_id ON student_media(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);
