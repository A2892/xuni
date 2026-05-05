-- 诊断管理员认证问题

-- 1. 检查当前登录的用户ID（需要在登录状态下执行）
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. 检查 admin_users 表的数据
SELECT * FROM public.admin_users;

-- 3. 检查 admin_users 表的结构
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'admin_users'
ORDER BY ordinal_position;

-- 4. 临时禁用所有表的 RLS 来查看数据是否存在
ALTER TABLE IF EXISTS public.student_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.universities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_documents DISABLE ROW LEVEL SECURITY;

-- 5. 检查数据是否存在
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
