-- 更新 saved_documents 表的 document_type 检查约束
-- 添加对新文档类型的支持：包括金融功能和生成工具

-- 首先删除旧的检查约束
ALTER TABLE saved_documents DROP CONSTRAINT IF EXISTS saved_documents_document_type_check;

-- 添加新的检查约束，包含所有支持的文档类型
ALTER TABLE saved_documents ADD CONSTRAINT saved_documents_document_type_check 
CHECK (document_type IN (
  -- 原有类型
  'transcript', 
  'admission', 
  'schedule', 
  'enrollment', 
  'student_id', 
  'driver', 
  'student-record', 
  'academic_report', 
  'bank_statement',
  -- 文档类型
  'invoice',
  'certificate',
  'utility_bill',
  'flight',
  'hotel',
  'passport',
  'payslip',
  'resume',
  'medical_report',
  'tax_form',
  'wechat',
  'qq',
  'business_card',
  'official_seal',
  -- 金融汇总功能 (新增)
  'stock_statement',
  'fund_statement',
  'insurance',
  'loan_statement',
  'wealth_report',
  'budget_report',
  'credit_card',
  'income_certificate',
  'expense_report',
  'crypto_portfolio',
  -- 生成工具 (新增)
  'qrcode',
  'barcode',
  'signature',
  'watermark',
  'avatar',
  'receipt',
  'contract',
  'certificate_gen',
  'address',
  'fake_data'
));

-- 为新的文档类型添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_saved_documents_document_type ON saved_documents(document_type);

-- 添加分类索引优化查询
CREATE INDEX IF NOT EXISTS idx_saved_documents_user_type ON saved_documents(user_id, document_type);
CREATE INDEX IF NOT EXISTS idx_saved_documents_updated ON saved_documents(updated_at DESC);

-- 输出成功消息
DO $$
BEGIN
  RAISE NOTICE '✅ document_type 检查约束已更新，现在支持以下类型：';
  RAISE NOTICE '   📚 学生类: transcript, admission, schedule, enrollment, student_id, driver, student-record, academic_report';
  RAISE NOTICE '   💰 金融类: bank_statement, stock_statement, fund_statement, insurance, loan_statement, wealth_report, budget_report, credit_card, income_certificate, expense_report, crypto_portfolio';
  RAISE NOTICE '   📄 文档类: invoice, certificate, utility_bill, flight, hotel, passport, payslip, resume, medical_report, tax_form';
  RAISE NOTICE '   💬 社交类: wechat, qq, business_card, official_seal';
  RAISE NOTICE '   🛠️ 工具类: qrcode, barcode, signature, watermark, avatar, receipt, contract, certificate_gen, address, fake_data';
END $$;
