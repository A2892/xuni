-- 添加学业报告文档类型支持
-- 此脚本为 saved_documents 表的 document_type 字段添加 'academic_report' 类型

-- 如果你的数据库中 document_type 有 CHECK 约束，需要先删除并重新创建
-- 这里我们假设没有严格的 CHECK 约束，或者需要手动更新

-- 如果有 CHECK 约束，使用类似以下的语句更新：
-- ALTER TABLE saved_documents DROP CONSTRAINT IF EXISTS saved_documents_document_type_check;
-- ALTER TABLE saved_documents ADD CONSTRAINT saved_documents_document_type_check 
--   CHECK (document_type IN ('transcript', 'admission', 'schedule', 'enrollment', 'student_id', 'driver', 'student-record', 'academic_report'));

-- 如果使用 enum 类型，则需要添加新值：
-- ALTER TYPE document_type_enum ADD VALUE IF NOT EXISTS 'academic_report';

-- 注意：实际执行前请根据你的数据库架构调整此脚本
-- 如果 document_type 只是普通的 varchar/text 字段，则无需任何修改，直接可以使用 'academic_report'

-- 验证：插入一条测试数据（可选）
-- INSERT INTO saved_documents (document_type, name, data) 
-- VALUES ('academic_report', 'Test Academic Report', '{"test": true}');

-- 说明：
-- 由于 Supabase 中 document_type 通常定义为 text 类型，
-- 无需特殊的数据库迁移即可支持新的文档类型 'academic_report'
-- 此文件仅作为记录和参考使用
