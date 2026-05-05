-- 添加新的文档类型到数据库约束
-- 执行此脚本以支持：国内酒店、签证、国内账单、国内成绩单、国内在读证明、国内推荐信

-- 删除旧的约束
ALTER TABLE saved_documents DROP CONSTRAINT IF EXISTS saved_documents_document_type_check;

-- 添加新的约束，包含所有文档类型
ALTER TABLE saved_documents ADD CONSTRAINT saved_documents_document_type_check 
CHECK (document_type IN (
  -- 学生类
  'transcript', 
  'admission', 
  'schedule', 
  'enrollment', 
  'student_id', 
  'driver', 
  'student-record', 
  'academic_report',
  'school_transcript',
  'enrollment_cert',
  'recommendation_letter',
  -- 金融类
  'bank_statement',
  'stock_statement',
  'stock',
  'fund_statement',
  'fund',
  'insurance',
  'loan_statement',
  'loan',
  'wealth_report',
  'wealth',
  'budget_report',
  'budget',
  'credit_card',
  'income_certificate',
  'income',
  'expense_report',
  'expense',
  'crypto_portfolio',
  'crypto',
  -- 文档类
  'invoice',
  'certificate',
  'utility_bill',
  'cn_bill',
  'flight',
  'hotel',
  'cn_hotel',
  'passport',
  'visa',
  'payslip',
  'resume',
  'medical_report',
  'tax_form',
  -- 社交类
  'wechat',
  'qq',
  'business_card',
  'official_seal',
  -- 工具类
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

-- 验证约束已更新
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'saved_documents_document_type_check';
