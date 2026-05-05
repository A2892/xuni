-- RLS性能优化脚本
-- 将 auth.uid() 改为 (SELECT auth.uid()) 以提升查询性能

-- 1. 优化 saved_documents 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_documents') THEN
    DROP POLICY IF EXISTS "saved_documents_select_own" ON public.saved_documents;
    DROP POLICY IF EXISTS "saved_documents_insert_own" ON public.saved_documents;
    DROP POLICY IF EXISTS "saved_documents_update_own" ON public.saved_documents;
    DROP POLICY IF EXISTS "saved_documents_delete_own" ON public.saved_documents;
    DROP POLICY IF EXISTS "saved_documents_admin_all" ON public.saved_documents;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'saved_documents' AND column_name = 'user_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_documents' AND policyname ILIKE '%unified%') THEN
        EXECUTE 'CREATE POLICY "saved_documents_admin_all" ON public.saved_documents
          FOR ALL
          USING (public.is_admin())';
        
        EXECUTE 'CREATE POLICY "saved_documents_select_own" ON public.saved_documents
          FOR SELECT
          USING ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "saved_documents_insert_own" ON public.saved_documents
          FOR INSERT
          WITH CHECK ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "saved_documents_update_own" ON public.saved_documents
          FOR UPDATE
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "saved_documents_delete_own" ON public.saved_documents
          FOR DELETE
          USING ((SELECT auth.uid()) = user_id)';
      END IF;
      
      RAISE NOTICE 'Optimized policies for saved_documents';
    END IF;
  END IF;
END $$;

-- 2. 优化 courses 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    DROP POLICY IF EXISTS "courses_select_own" ON public.courses;
    DROP POLICY IF EXISTS "courses_insert_own" ON public.courses;
    DROP POLICY IF EXISTS "courses_update_own" ON public.courses;
    DROP POLICY IF EXISTS "courses_delete_own" ON public.courses;
    DROP POLICY IF EXISTS "courses_admin_all" ON public.courses;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'user_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'courses' AND policyname ILIKE '%unified%') THEN
        EXECUTE 'CREATE POLICY "courses_admin_all" ON public.courses
          FOR ALL
          USING (public.is_admin())';
        
        EXECUTE 'CREATE POLICY "courses_select_own" ON public.courses
          FOR SELECT
          USING ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "courses_insert_own" ON public.courses
          FOR INSERT
          WITH CHECK ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "courses_update_own" ON public.courses
          FOR UPDATE
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "courses_delete_own" ON public.courses
          FOR DELETE
          USING ((SELECT auth.uid()) = user_id)';
      END IF;
      
      RAISE NOTICE 'Optimized policies for courses';
    END IF;
  END IF;
END $$;

-- 3. 优化 universities 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'universities') THEN
    DROP POLICY IF EXISTS "universities_select_own" ON public.universities;
    DROP POLICY IF EXISTS "universities_insert_own" ON public.universities;
    DROP POLICY IF EXISTS "universities_update_own" ON public.universities;
    DROP POLICY IF EXISTS "universities_delete_own" ON public.universities;
    DROP POLICY IF EXISTS "universities_admin_all" ON public.universities;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'universities' AND column_name = 'user_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'universities' AND policyname ILIKE '%unified%') THEN
        EXECUTE 'CREATE POLICY "universities_admin_all" ON public.universities
          FOR ALL
          USING (public.is_admin())';
        
        EXECUTE 'CREATE POLICY "universities_select_own" ON public.universities
          FOR SELECT
          USING ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "universities_insert_own" ON public.universities
          FOR INSERT
          WITH CHECK ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "universities_update_own" ON public.universities
          FOR UPDATE
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "universities_delete_own" ON public.universities
          FOR DELETE
          USING ((SELECT auth.uid()) = user_id)';
      END IF;
      
      RAISE NOTICE 'Optimized policies for universities';
    END IF;
  END IF;
END $$;

-- 4. 优化 student_profiles 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_profiles') THEN
    DROP POLICY IF EXISTS "student_profiles_admin_all" ON public.student_profiles;
    DROP POLICY IF EXISTS "student_profiles_user_own" ON public.student_profiles;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'user_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_profiles' AND policyname ILIKE '%unified%') THEN
        EXECUTE 'CREATE POLICY "student_profiles_admin_all" ON public.student_profiles
          FOR ALL
          USING (public.is_admin())';
        
        EXECUTE 'CREATE POLICY "student_profiles_user_own" ON public.student_profiles
          FOR ALL
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id)';
      END IF;
      
      RAISE NOTICE 'Optimized policies for student_profiles';
    END IF;
  END IF;
END $$;

-- 5. 优化 student_documents 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_documents') THEN
    DROP POLICY IF EXISTS "student_documents_admin_all" ON public.student_documents;
    DROP POLICY IF EXISTS "student_documents_user_own" ON public.student_documents;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_documents' AND column_name = 'user_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_documents' AND policyname ILIKE '%unified%') THEN
        EXECUTE 'CREATE POLICY "student_documents_admin_all" ON public.student_documents
          FOR ALL
          USING (public.is_admin())';
        
        EXECUTE 'CREATE POLICY "student_documents_user_own" ON public.student_documents
          FOR ALL
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id)';
      END IF;
      
      RAISE NOTICE 'Optimized policies for student_documents';
    END IF;
  END IF;
END $$;

-- 6. 优化 student_media 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_media') THEN
    DROP POLICY IF EXISTS "student_media_admin_all" ON public.student_media;
    DROP POLICY IF EXISTS "student_media_user_own" ON public.student_media;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_media' AND column_name = 'user_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_media' AND policyname ILIKE '%unified%') THEN
        EXECUTE 'CREATE POLICY "student_media_admin_all" ON public.student_media
          FOR ALL
          USING (public.is_admin())';
        
        EXECUTE 'CREATE POLICY "student_media_user_own" ON public.student_media
          FOR ALL
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id)';
      END IF;
      
      RAISE NOTICE 'Optimized policies for student_media';
    END IF;
  END IF;
END $$;

-- 7. 优化 students 表的策略（如果存在）
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students') THEN
    DROP POLICY IF EXISTS "students_select_own" ON public.students;
    DROP POLICY IF EXISTS "students_insert_own" ON public.students;
    DROP POLICY IF EXISTS "students_update_own" ON public.students;
    DROP POLICY IF EXISTS "students_delete_own" ON public.students;
    DROP POLICY IF EXISTS "students_admin_all" ON public.students;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'user_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'students' AND policyname ILIKE '%unified%') THEN
        EXECUTE 'CREATE POLICY "students_admin_all" ON public.students
          FOR ALL
          USING (public.is_admin())';
        
        EXECUTE 'CREATE POLICY "students_select_own" ON public.students
          FOR SELECT
          USING ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "students_insert_own" ON public.students
          FOR INSERT
          WITH CHECK ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "students_update_own" ON public.students
          FOR UPDATE
          USING ((SELECT auth.uid()) = user_id)
          WITH CHECK ((SELECT auth.uid()) = user_id)';
        
        EXECUTE 'CREATE POLICY "students_delete_own" ON public.students
          FOR DELETE
          USING ((SELECT auth.uid()) = user_id)';
      END IF;
      
      RAISE NOTICE 'Optimized policies for students';
    END IF;
  END IF;
END $$;

-- 8. 优化 user_roles 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
    
    EXECUTE 'CREATE POLICY "user_roles_select_own" ON public.user_roles
      FOR SELECT
      USING ((SELECT auth.uid()) = user_id)';
    
    EXECUTE 'CREATE POLICY "user_roles_admin_all" ON public.user_roles
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = (SELECT auth.uid()) AND role = ''admin''
        )
      )';
    
    RAISE NOTICE 'Optimized policies for user_roles';
  END IF;
END $$;

-- 验证所有策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
