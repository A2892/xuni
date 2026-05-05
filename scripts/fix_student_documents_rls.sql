-- Fix multiple permissive RLS policies on student_documents
-- Drops permissive policies and creates a secure admin + owner policy set.

DO $$
DECLARE rec record;
BEGIN
  FOR rec IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'student_documents'
      AND (permissive::text IN ('t','true','TRUE','1','permissive','PERMISSIVE'))
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.student_documents', rec.policyname);
  END LOOP;
END$$;

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.student_documents ENABLE ROW LEVEL SECURITY;

-- Ensure helper function exists (safe to replace)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Create secure policies: admin_all and (optionally) owner-based policy
DO $$
BEGIN
  DROP POLICY IF EXISTS "student_documents_admin_all" ON public.student_documents;
  DROP POLICY IF EXISTS "student_documents_user_own" ON public.student_documents;

  CREATE POLICY "student_documents_admin_all" ON public.student_documents
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_documents' AND column_name = 'user_id'
  ) THEN
    CREATE POLICY "student_documents_user_own" ON public.student_documents
      FOR ALL
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END$$;

-- Report resulting policies for verification
SELECT schemaname, tablename, policyname, permissive, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'student_documents'
ORDER BY policyname;
