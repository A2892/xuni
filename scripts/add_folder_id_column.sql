-- 为 student_documents 表添加 folder_id 字段
-- 用于支持文档的文件夹分类功能

-- 添加 folder_id 字段
ALTER TABLE student_documents
ADD COLUMN IF NOT EXISTS folder_id TEXT;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_student_documents_folder_id ON student_documents(folder_id);

-- 同时为 student_media 表添加 folder_id 字段（如果需要）
ALTER TABLE student_media
ADD COLUMN IF NOT EXISTS folder_id TEXT;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_student_media_folder_id ON student_media(folder_id);
