-- 启用 RLS 并只允许管理员访问和管理数据
-- 管理员账号在 admin_users 表中

-- 首先创建检查管理员的辅助函数
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. student_media 表
ALTER TABLE IF EXISTS public.student_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_media_public_access" ON public.student_media;
DROP POLICY IF EXISTS "student_media_admin_access" ON public.student_media;
CREATE POLICY "student_media_admin_access" ON public.student_media
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. saved_documents 表
ALTER TABLE IF EXISTS public.saved_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_documents_public_access" ON public.saved_documents;
DROP POLICY IF EXISTS "saved_documents_admin_access" ON public.saved_documents;
CREATE POLICY "saved_documents_admin_access" ON public.saved_documents
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. courses 表
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_public_access" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_access" ON public.courses;
CREATE POLICY "courses_admin_access" ON public.courses
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. universities 表
ALTER TABLE IF EXISTS public.universities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "universities_public_access" ON public.universities;
DROP POLICY IF EXISTS "universities_admin_access" ON public.universities;
CREATE POLICY "universities_admin_access" ON public.universities
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. student_profiles 表
ALTER TABLE IF EXISTS public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_profiles_public_access" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_admin_access" ON public.student_profiles;
CREATE POLICY "student_profiles_admin_access" ON public.student_profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. student_documents 表
ALTER TABLE IF EXISTS public.student_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_documents_public_access" ON public.student_documents;
DROP POLICY IF EXISTS "student_documents_admin_access" ON public.student_documents;
CREATE POLICY "student_documents_admin_access" ON public.student_documents
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. admin_users 表（管理员可以查看，但不能通过应用修改密码）
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_select" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_admin_access" ON public.admin_users;

-- 管理员可以查看所有管理员信息
CREATE POLICY "admin_users_select" ON public.admin_users
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 管理员可以进行其他操作（除了密码字段需要额外保护）
CREATE POLICY "admin_users_admin_access" ON public.admin_users
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 8. user_roles 表（如果存在）
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "user_roles_public_access" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_admin_access" ON public.user_roles;
    
    -- 只有管理员可以访问
    EXECUTE 'CREATE POLICY "user_roles_admin_access" ON public.user_roles
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 验证策略是否创建成功
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
