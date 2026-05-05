-- Create saved_documents table and permissive policies for initial testing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS saved_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  document_type TEXT NOT NULL CHECK (document_type IN (
    'transcript', 'admission', 'schedule', 'enrollment', 'student_id', 'driver', 'student-record', 'academic_report', 'bank_statement',
    'invoice', 'certificate', 'utility_bill', 'flight', 'hotel', 'passport', 'payslip', 'resume', 
    'medical_report', 'tax_form', 'wechat', 'qq', 'business_card', 'official_seal'
  )),
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_documents_user_id ON saved_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_documents_document_type ON saved_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_saved_documents_updated_at ON saved_documents(updated_at DESC);

-- Enable row level security (optional) and create permissive policy for initial testing
ALTER TABLE saved_documents ENABLE ROW LEVEL SECURITY;
-- 建议（安全）策略：管理员+所有者组合
ALTER TABLE saved_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.saved_documents;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='saved_documents' AND policyname='saved_documents_admin_all') THEN
    EXECUTE $sql$CREATE POLICY "saved_documents_admin_all" ON public.saved_documents FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name='saved_documents' AND column_name='user_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='saved_documents' AND policyname='saved_documents_user_own') THEN
      EXECUTE $sql$CREATE POLICY "saved_documents_user_own" ON public.saved_documents FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
    END IF;
  END IF;
END$$;
