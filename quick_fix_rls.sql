-- 快速修复RLS和函数问题

-- 1. 确保所有表都启用RLS
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. 修复 is_admin 函数的 search_path
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 3. 修复 fn_set_updated_at 函数的 search_path
DROP FUNCTION IF EXISTS public.fn_set_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 4. 修复 create_admin_user 函数的 search_path
DROP FUNCTION IF EXISTS public.create_admin_user(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.create_admin_user(target_user_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin';
  
  RAISE NOTICE 'User % set as admin', target_user_id;
END;
$$;

-- 5. 重新创建所有触发器
DROP TRIGGER IF EXISTS set_updated_at ON public.saved_documents;
DROP TRIGGER IF EXISTS set_updated_at ON public.courses;
DROP TRIGGER IF EXISTS set_updated_at ON public.universities;
DROP TRIGGER IF EXISTS set_updated_at ON public.student_profiles;
DROP TRIGGER IF EXISTS set_updated_at ON public.student_documents;
DROP TRIGGER IF EXISTS set_updated_at ON public.student_media;

-- 只为有 updated_at 列的表创建触发器
DO $$ 
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('saved_documents', 'courses', 'universities', 'student_profiles', 'student_documents', 'student_media')
  LOOP
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = tbl_name 
      AND column_name = 'updated_at'
    ) THEN
      EXECUTE format('
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.fn_set_updated_at()
      ', tbl_name);
      
      RAISE NOTICE 'Trigger created for %', tbl_name;
    END IF;
  END LOOP;
END $$;

-- 验证RLS状态
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('courses', 'universities', 'saved_documents', 'student_profiles', 'student_documents', 'student_media', 'user_roles')
ORDER BY tablename;
