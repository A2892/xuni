-- 检查管理员账号和数据状态

-- 1. 检查所有注册用户
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. 检查 user_roles 表中的管理员
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    u.email,
    ur.created_at
FROM public.user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
ORDER BY ur.created_at DESC;

-- 3. 检查各表的数据数量
SELECT 'student_media' as table_name, COUNT(*) as count FROM public.student_media
UNION ALL
SELECT 'saved_documents', COUNT(*) FROM public.saved_documents
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'universities', COUNT(*) FROM public.universities
UNION ALL
SELECT 'student_profiles', COUNT(*) FROM public.student_profiles
UNION ALL
SELECT 'student_documents', COUNT(*) FROM public.student_documents
UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles;

-- 4. 检查当前RLS状态
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('student_media', 'saved_documents', 'courses', 'universities', 'student_profiles', 'student_documents', 'user_roles')
ORDER BY tablename;

-- 5. 检查现有的RLS策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
