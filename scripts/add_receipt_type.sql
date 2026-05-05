-- 添加 receipt 类型到 saved_documents 表
-- 运行此脚本以支持收据数据保存

-- 首先删除旧的约束（如果存在）
ALTER TABLE saved_documents DROP CONSTRAINT IF EXISTS saved_documents_document_type_check;

-- 添加新的约束，包含所有支持的文档类型
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
  -- 学校生成类
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
  'bank_transfer',
  'consolidated_statement',
  -- 文档类
  'invoice',
  'cn_invoice',
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
  -- 收据类
  'receipt',
  'tuition_receipt',
  'shopping_receipt',
  'dining_receipt',
  'transport_receipt',
  'medical_receipt',
  'service_receipt',
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
  'contract',
  'certificate_gen',
  'address',
  'fake_data'
));

-- 或者，如果你想完全移除约束（更灵活但不太安全）：
-- ALTER TABLE saved_documents DROP CONSTRAINT IF EXISTS saved_documents_document_type_check;
