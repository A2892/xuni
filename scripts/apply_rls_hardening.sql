-- One-shot RLS hardening migration
-- WARNING: Run on a staging copy first. This script backs up current policies,
-- ensures `public.is_admin()` exists, attempts to map `admin_users.user_id` to
-- auth.users, fixes `student_documents` and `saved_documents`, then applies
-- conservative admin+owner policies to common tables.

-- 0) Notes: paste this into Supabase SQL Editor and run on staging.

-- 1) Backup current public policies into `public.rls_policies_backup`
CREATE SCHEMA IF NOT EXISTS public;
CREATE TABLE IF NOT EXISTS public.rls_policies_backup (
  schemaname text,
  tablename text,
  policyname text,
  permissive text,
  cmd text,
  roles text[]
);
TRUNCATE public.rls_policies_backup;
INSERT INTO public.rls_policies_backup(schemaname, tablename, policyname, permissive, cmd, roles)
SELECT schemaname, tablename, policyname, permissive::text, cmd, roles FROM pg_policies WHERE schemaname = 'public';

-- 2) Ensure public.is_admin() exists (secure SECURITY DEFINER with fixed search_path)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'is_admin' AND n.nspname = 'public'
  ) THEN
    EXECUTE $sql$
    CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path = public, pg_temp AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid() AND au.role = 'admin'
      );
    $$;
    $sql$;
  END IF;
END$$;

-- 3) Add user_id to admin_users if missing, and attempt to auto-map by matching username->auth.users.email
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='admin_users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admin_users' AND column_name='user_id'
    ) THEN
      ALTER TABLE public.admin_users ADD COLUMN user_id uuid;
    END IF;
  END IF;
END$$;

-- Try to map admin_users.username => auth.users.email
UPDATE public.admin_users au
SET user_id = u.id
FROM auth.users u
WHERE au.username = u.email AND au.user_id IS NULL;

-- Show count of unmapped admin_users for manual review
SELECT count(*) AS unmapped_admin_users FROM public.admin_users WHERE user_id IS NULL;

-- 4) Fix student_documents (drop permissive/anon policies and create admin+owner policies)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='student_documents') THEN
    DROP POLICY IF EXISTS "student_documents_anon_access" ON public.student_documents;
    DROP POLICY IF EXISTS "public_access" ON public.student_documents;
    DROP POLICY IF EXISTS "Enable all access for all users" ON public.student_documents;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_documents' AND policyname='student_documents_admin_all'
    ) THEN
      EXECUTE $sql$CREATE POLICY "student_documents_admin_all" ON public.student_documents FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
    END IF;

    IF EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema='public' AND table_name='student_documents' AND column_name='user_id'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_documents' AND policyname='student_documents_user_own'
      ) THEN
        EXECUTE $sql$CREATE POLICY "student_documents_user_own" ON public.student_documents FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
      END IF;
    END IF;
  END IF;
END$$;

-- 5) Fix saved_documents (based on your create_saved_documents.sql)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='saved_documents') THEN
    DROP POLICY IF EXISTS "Enable all access for all users" ON public.saved_documents;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='saved_documents' AND policyname='saved_documents_admin_all'
    ) THEN
      EXECUTE $sql$CREATE POLICY "saved_documents_admin_all" ON public.saved_documents FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
    END IF;

    IF EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema='public' AND table_name='saved_documents' AND column_name='user_id'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='saved_documents' AND policyname='saved_documents_user_own'
      ) THEN
        EXECUTE $sql$CREATE POLICY "saved_documents_user_own" ON public.saved_documents FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
      END IF;
    END IF;
  END IF;
END$$;

-- 6) General hardening for common tables (student_media, courses, universities, student_profiles, user_roles, admin_users, students)
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN ARRAY['student_media','courses','universities','student_profiles','user_roles','admin_users','students'] LOOP
    -- drop common permissive policy names if present
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "public_access" ON public.%I', tbl);
    EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "public" ON public.%I', tbl);
    EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "anon_access" ON public.%I', tbl);
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- create admin_all if missing
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=tbl || '_admin_all') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', tbl || '_admin_all', tbl);
    END IF;

    -- create user_own if table has user_id
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name=tbl AND column_name='user_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=tbl || '_user_own') THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)', tbl || '_user_own', tbl);
      END IF;
    END IF;
  END LOOP;
END$$;

-- 7) Final verification: show current public policies
SELECT schemaname, tablename, policyname, permissive, cmd FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;

-- End of migration
