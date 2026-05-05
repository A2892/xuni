-- 将管理员账号迁移到 Supabase Auth
-- 步骤1：修改 admin_users 表结构，添加 user_id 字段

-- 1. 添加 user_id 列（如果不存在）
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- 3. 查看当前的管理员账号
SELECT id, username, full_name, role, user_id FROM public.admin_users;

-- ============================================================================
-- 步骤2：手动操作 - 在 Supabase Dashboard 创建 Auth 用户
-- ============================================================================
-- 
-- 对于每个管理员账号：
-- 1. 进入 Supabase Dashboard > Authentication > Users
-- 2. 点击 "Add User"
-- 3. 填写：
--    - Email: admin@yourdomain.com (使用真实邮箱或测试邮箱)
--    - Password: admin8888 (或你想要的密码)
--    - Auto Confirm User: ✓ (勾选，否则需要邮箱验证)
-- 4. 点击 "Create user"
-- 5. 复制创建的用户 ID
--
-- ============================================================================

-- 步骤3：将 Auth 用户 ID 关联到 admin_users 表
-- 执行前请先替换 'AUTH用户ID' 和 'admin' 为实际值

-- 示例：更新第一个管理员账号
-- UPDATE public.admin_users 
-- SET user_id = 'AUTH用户ID'
-- WHERE username = 'admin';

-- 示例：更新第二个管理员账号
-- UPDATE public.admin_users 
-- SET user_id = 'AUTH用户ID'
-- WHERE username = '系统管理员';

-- 验证关联结果
SELECT 
    a.id,
    a.username,
    a.full_name,
    a.user_id,
    u.email,
    u.created_at as auth_created_at
FROM public.admin_users a
LEFT JOIN auth.users u ON a.user_id = u.id
ORDER BY a.created_at;

-- ============================================================================
-- 步骤4：创建新的辅助函数（检查是否为管理员）
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 步骤5：启用 RLS 并创建基于 Auth 的策略
-- ============================================================================

-- 1. student_media 表
ALTER TABLE IF EXISTS public.student_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_media_anon_access" ON public.student_media;
DROP POLICY IF EXISTS "student_media_admin_access" ON public.student_media;
CREATE POLICY "student_media_admin_access" ON public.student_media
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. saved_documents 表
ALTER TABLE IF EXISTS public.saved_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saved_documents_anon_access" ON public.saved_documents;
DROP POLICY IF EXISTS "saved_documents_admin_access" ON public.saved_documents;
CREATE POLICY "saved_documents_admin_access" ON public.saved_documents
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. courses 表
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_anon_access" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_access" ON public.courses;
CREATE POLICY "courses_admin_access" ON public.courses
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. universities 表
ALTER TABLE IF EXISTS public.universities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "universities_anon_access" ON public.universities;
DROP POLICY IF EXISTS "universities_admin_access" ON public.universities;
CREATE POLICY "universities_admin_access" ON public.universities
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. student_profiles 表
ALTER TABLE IF EXISTS public.student_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_profiles_anon_access" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_admin_access" ON public.student_profiles;
CREATE POLICY "student_profiles_admin_access" ON public.student_profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. student_documents 表
ALTER TABLE IF EXISTS public.student_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_documents_anon_access" ON public.student_documents;
DROP POLICY IF EXISTS "student_documents_admin_access" ON public.student_documents;
CREATE POLICY "student_documents_admin_access" ON public.student_documents
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. admin_users 表
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_users_anon_access" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_admin_access" ON public.admin_users;
CREATE POLICY "admin_users_admin_access" ON public.admin_users
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 验证策略创建成功
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
