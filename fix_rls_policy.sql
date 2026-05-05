-- 修复 RLS 策略，允许所有操作
-- 请在 Supabase SQL Editor 中执行此脚本

-- 首先删除所有现有策略
DROP POLICY IF EXISTS "Enable all access for all users" ON saved_documents;
DROP POLICY IF EXISTS "Users can view own documents" ON saved_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON saved_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON saved_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON saved_documents;

-- 禁用 RLS（如果不需要用户认证）
ALTER TABLE saved_documents DISABLE ROW LEVEL SECURITY;

-- 或者，如果要保留RLS但允许所有访问，使用以下策略：
-- ALTER TABLE saved_documents ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all for anonymous users"
-- ON saved_documents
-- FOR ALL
-- TO anon, authenticated
-- USING (true)
-- WITH CHECK (true);
