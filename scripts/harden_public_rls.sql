-- Harden common public RLS policies across multiple tables
-- Drops permissive/anonymous/public policies and creates admin+owner policies

-- WARNING: Run on staging first. This will DROP policies whose names match common permissive patterns.

DO $$
BEGIN
  -- Tables to harden
  PERFORM 1;
END$$;

-- Helper block for each table
-- student_media
DO $$
BEGIN
  DROP POLICY IF EXISTS "public_access" ON public.student_media;
  DROP POLICY IF EXISTS "public" ON public.student_media;
  DROP POLICY IF EXISTS "student_media_anon_access" ON public.student_media;
  DROP POLICY IF EXISTS "Anyone can view media" ON public.student_media;
  DROP POLICY IF EXISTS "Anyone can insert media" ON public.student_media;
  DROP POLICY IF EXISTS "Anyone can update media" ON public.student_media;
  DROP POLICY IF EXISTS "Anyone can delete media" ON public.student_media;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_media' AND policyname='student_media_admin_all'
    ) THEN
      EXECUTE $sql$CREATE POLICY "student_media_admin_all" ON public.student_media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
    END IF;

  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema='public' AND table_name='student_media' AND column_name='user_id'
  ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_media' AND policyname='student_media_user_own'
      ) THEN
        EXECUTE $sql$CREATE POLICY "student_media_user_own" ON public.student_media FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
      END IF;
  END IF;
END$$;

-- saved_documents
DO $$
BEGIN
  DROP POLICY IF EXISTS "public_access" ON public.saved_documents;
  DROP POLICY IF EXISTS "saved_documents_anon_access" ON public.saved_documents;

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
END$$;

-- courses
DO $$
BEGIN
  DROP POLICY IF EXISTS "courses_anon_access" ON public.courses;
  DROP POLICY IF EXISTS "public_access" ON public.courses;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='courses' AND policyname='courses_admin_all'
    ) THEN
      EXECUTE $sql$CREATE POLICY "courses_admin_all" ON public.courses FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
    END IF;
END$$;

-- universities
DO $$
BEGIN
  DROP POLICY IF EXISTS "universities_anon_access" ON public.universities;
  DROP POLICY IF EXISTS "public_access" ON public.universities;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='universities' AND policyname='universities_admin_all'
    ) THEN
      EXECUTE $sql$CREATE POLICY "universities_admin_all" ON public.universities FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
    END IF;
END$$;

-- student_profiles
DO $$
BEGIN
  DROP POLICY IF EXISTS "student_profiles_anon_access" ON public.student_profiles;
  DROP POLICY IF EXISTS "public_access" ON public.student_profiles;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_profiles' AND policyname='student_profiles_admin_all'
    ) THEN
      EXECUTE $sql$CREATE POLICY "student_profiles_admin_all" ON public.student_profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
    END IF;

  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema='public' AND table_name='student_profiles' AND column_name='user_id'
  ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='student_profiles' AND policyname='student_profiles_user_own'
      ) THEN
        EXECUTE $sql$CREATE POLICY "student_profiles_user_own" ON public.student_profiles FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);$sql$;
      END IF;
  END IF;
END$$;

-- student_documents
DO $$
BEGIN
  DROP POLICY IF EXISTS "student_documents_anon_access" ON public.student_documents;
  DROP POLICY IF EXISTS "public_access" ON public.student_documents;

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
END$$;

-- user_roles
DO $$
BEGIN
  DROP POLICY IF EXISTS "user_roles_anon_access" ON public.user_roles;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles_admin_all'
    ) THEN
      EXECUTE $sql$CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));$sql$;
    END IF;
END$$;

-- admin_users
DO $$
BEGIN
  DROP POLICY IF EXISTS "admin_users_anon_access" ON public.admin_users;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_users' AND policyname='admin_users_admin_all'
    ) THEN
      EXECUTE $sql$CREATE POLICY "admin_users_admin_all" ON public.admin_users FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
    END IF;
END$$;

-- students (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='students') THEN
    DROP POLICY IF EXISTS "Enable all for students" ON public.students;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='students' AND policyname='students_admin_all'
    ) THEN
      EXECUTE $sql$CREATE POLICY "students_admin_all" ON public.students FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());$sql$;
    END IF;
  END IF;
END$$;

-- Verify
SELECT schemaname, tablename, policyname, permissive, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename IN (
  'student_media','saved_documents','courses','universities','student_profiles','student_documents','user_roles','admin_users','students'
) ORDER BY tablename, policyname;
