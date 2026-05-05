-- 为使用自定义认证（非 Supabase Auth）的应用启用 RLS
-- 允许匿名用户（anon）访问所有数据
-- 适用于通过 admin_users 表进行用户名+密码认证的场景

-- 1. student_media 表
ALTER TABLE IF EXISTS public.student_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_media_anon_access" ON public.student_media;
-- NOTE: Enabling anonymous access is dangerous in production. Below we provide a safer default
-- which grants full admin access to authenticated admins and an owner-based policy if `user_id` exists.
-- If you truly need anon access for custom auth/testing, uncomment the CREATE POLICY block below.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_media' AND policyname='student_media_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "student_media_admin_all" ON public.student_media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name='student_media' AND column_name='user_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_media' AND policyname='student_media_user_own') THEN
      EXECUTE $sql$CREATE POLICY "student_media_user_own" ON public.student_media FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
    END IF;
  END IF;
END$$;

-- Example (UNSAFE): allow anon access to all rows (commented)
-- CREATE POLICY "student_media_anon_access" ON public.student_media
-- FOR ALL
-- TO anon
-- USING (true)
-- WITH CHECK (true);

-- 2. saved_documents 表
ALTER TABLE IF EXISTS public.saved_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saved_documents_anon_access" ON public.saved_documents;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='saved_documents' AND policyname='saved_documents_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "saved_documents_admin_all" ON public.saved_documents FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name='saved_documents' AND column_name='user_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='saved_documents' AND policyname='saved_documents_user_own') THEN
      EXECUTE $sql$CREATE POLICY "saved_documents_user_own" ON public.saved_documents FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
    END IF;
  END IF;
END$$;

-- Example (UNSAFE): allow anon access to all rows (commented)
-- CREATE POLICY "saved_documents_anon_access" ON public.saved_documents FOR ALL TO anon USING (true) WITH CHECK (true);

-- 3. courses 表
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_anon_access" ON public.courses;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='courses' AND policyname='courses_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "courses_admin_all" ON public.courses FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

-- Example (UNSAFE): create anon permissive policy
-- CREATE POLICY "courses_anon_access" ON public.courses FOR ALL TO anon USING (true) WITH CHECK (true);

-- 4. universities 表
ALTER TABLE IF EXISTS public.universities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "universities_anon_access" ON public.universities;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='universities' AND policyname='universities_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "universities_admin_all" ON public.universities FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

-- Example (UNSAFE): create anon permissive policy
-- CREATE POLICY "universities_anon_access" ON public.universities FOR ALL TO anon USING (true) WITH CHECK (true);

-- 5. student_profiles 表
ALTER TABLE IF EXISTS public.student_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_profiles_anon_access" ON public.student_profiles;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_profiles' AND policyname='student_profiles_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "student_profiles_admin_all" ON public.student_profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name='student_profiles' AND column_name='user_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_profiles' AND policyname='student_profiles_user_own') THEN
      EXECUTE $sql$CREATE POLICY "student_profiles_user_own" ON public.student_profiles FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
    END IF;
  END IF;
END$$;

-- Example (UNSAFE): create anon permissive policy
-- CREATE POLICY "student_profiles_anon_access" ON public.student_profiles FOR ALL TO anon USING (true) WITH CHECK (true);

-- 6. student_documents 表
ALTER TABLE IF EXISTS public.student_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_documents_anon_access" ON public.student_documents;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_documents' AND policyname='student_documents_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "student_documents_admin_all" ON public.student_documents FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name='student_documents' AND column_name='user_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_documents' AND policyname='student_documents_user_own') THEN
      EXECUTE $sql$CREATE POLICY "student_documents_user_own" ON public.student_documents FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
    END IF;
  END IF;
END$$;

-- Example (UNSAFE): create anon permissive policy
-- CREATE POLICY "student_documents_anon_access" ON public.student_documents FOR ALL TO anon USING (true) WITH CHECK (true);

-- 7. user_roles 表（如果存在）
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "user_roles_anon_access" ON public.user_roles;
        EXECUTE 'CREATE POLICY "user_roles_admin_all" ON public.user_roles
          FOR ALL
          TO authenticated
          USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''))
          WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = ''admin''))';
  END IF;
END $$;

-- 8. admin_users 表
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_users_anon_access" ON public.admin_users;
-- admin_users should not be accessible by anon; restrict to admins only
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_users' AND policyname='admin_users_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "admin_users_admin_all" ON public.admin_users FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

-- Example (UNSAFE): allow anon access (commented)
-- CREATE POLICY "admin_users_anon_access" ON public.admin_users FOR ALL TO anon USING (true) WITH CHECK (true);

-- 验证 RLS 状态
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('student_media', 'saved_documents', 'courses', 'universities', 
                  'student_profiles', 'student_documents', 'user_roles', 'admin_users')
ORDER BY tablename;

-- 显示数据统计
SELECT 'student_media' as table_name, COUNT(*) as row_count FROM public.student_media
UNION ALL
SELECT 'saved_documents', COUNT(*) FROM public.saved_documents
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'universities', COUNT(*) FROM public.universities
UNION ALL
SELECT 'student_profiles', COUNT(*) FROM public.student_profiles
UNION ALL
SELECT 'student_documents', COUNT(*) FROM public.student_documents;
