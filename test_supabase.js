import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfeekvcpbepotwulfbrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZWVrdmNwYmVwb3R3dWxmYnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTY5MjQsImV4cCI6MjA4MjMzMjkyNH0.awAs3X2YY5GfWQb5zqII2UPs07S1DuMoDvHe71btgyE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('测试Supabase连接...');
  
  // 测试连接并创建表
  try {
    const { data, error } = await supabase.from('saved_documents').select('count');
    if (error) {
      console.log('表可能还不存在，错误:', error.message);
      console.log('\n请在Supabase SQL编辑器中执行以下SQL创建表：\n');
      console.log(`
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS saved_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  document_type TEXT NOT NULL CHECK (document_type IN ('transcript', 'admission', 'schedule', 'enrollment', 'student_id', 'driver')),
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_documents_user_id ON saved_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_documents_document_type ON saved_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_saved_documents_updated_at ON saved_documents(updated_at DESC);

ALTER TABLE saved_documents ENABLE ROW LEVEL SECURITY;

-- 安全提示：不要创建宽松的 "USING (true)" 策略到生产环境。
-- 如需快速测试，请在 staging 环境运行仓库中的 RLS hardening 脚本：
-- scripts/fix_student_documents_rls.sql 或 scripts/harden_public_rls.sql
      `);
    } else {
      console.log('✅ 数据库连接成功！表已存在。');
      console.log('当前记录数:', data);
    }
  } catch (err) {
    console.error('连接错误:', err);
  }
}

testConnection();
