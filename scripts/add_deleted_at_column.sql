-- 为 student_documents 表添加 deleted_at 列以支持软删除（回收站功能）
-- 在 Supabase SQL Editor 中执行此脚本

-- 添加 deleted_at 列
ALTER TABLE student_documents 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 为 student_media 表也添加 deleted_at 列（如果还没有的话）
ALTER TABLE student_media 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 创建索引以加速查询未删除的文档
CREATE INDEX IF NOT EXISTS idx_student_documents_deleted_at 
ON student_documents (deleted_at) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_student_media_deleted_at 
ON student_media (deleted_at) 
WHERE deleted_at IS NULL;

-- 验证列已添加
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_documents' AND column_name = 'deleted_at';

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_media' AND column_name = 'deleted_at';
