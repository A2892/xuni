-- 临时禁用所有表的 RLS 以恢复数据访问
-- 用于开发测试环境，不适用于生产环境

-- 禁用所有表的 RLS
ALTER TABLE IF EXISTS public.saved_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.universities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles DISABLE ROW LEVEL SECURITY;

-- 验证数据是否存在
SELECT 'saved_documents' as table_name, COUNT(*) as count FROM public.saved_documents
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'universities', COUNT(*) FROM public.universities
UNION ALL
SELECT 'student_profiles', COUNT(*) FROM public.student_profiles
UNION ALL
SELECT 'student_documents', COUNT(*) FROM public.student_documents
UNION ALL
SELECT 'student_media', COUNT(*) FROM public.student_media
UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles;
