-- 更新 saved_documents 表的 document_type 约束，添加 'driver' 和 'student-record' 类型

-- 删除旧的约束
ALTER TABLE saved_documents 
DROP CONSTRAINT IF EXISTS saved_documents_document_type_check;

-- 添加新的约束，包含所有文档类型
ALTER TABLE saved_documents 
ADD CONSTRAINT saved_documents_document_type_check 
CHECK (document_type IN ('transcript', 'admission', 'schedule', 'enrollment', 'student_id', 'driver', 'student-record'));

-- 验证约束已更新
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'saved_documents'::regclass 
AND conname = 'saved_documents_document_type_check';
