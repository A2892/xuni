-- 合并RLS策略脚本
-- 每个操作只创建一个策略，使用OR条件：要么是admin，要么是own user

-- 1. 合并 saved_documents 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_documents') THEN
    -- 删除所有旧策略
    DROP POLICY IF EXISTS "saved_documents_select_own" ON public.saved_documents;
    DROP POLICY IF EXISTS "saved_documents_insert_own" ON public.saved_documents;
    DROP POLICY IF EXISTS "saved_documents_update_own" ON public.saved_documents;
    DROP POLICY IF EXISTS "saved_documents_delete_own" ON public.saved_documents;
    DROP POLICY IF EXISTS "saved_documents_admin_all" ON public.saved_documents;
    DROP POLICY IF EXISTS "saved_documents_policy" ON public.saved_documents;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'saved_documents' AND column_name = 'user_id') THEN
      -- 创建单一策略：admin或owner都可以访问
      EXECUTE 'CREATE POLICY "saved_documents_policy" ON public.saved_documents
        FOR ALL
        USING (public.is_admin() OR (SELECT auth.uid()) = user_id)
        WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = user_id)';
      
      RAISE NOTICE 'Merged policy for saved_documents';
    END IF;
  END IF;
END $$;

-- 2. 合并 courses 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    DROP POLICY IF EXISTS "courses_select_own" ON public.courses;
    DROP POLICY IF EXISTS "courses_insert_own" ON public.courses;
    DROP POLICY IF EXISTS "courses_update_own" ON public.courses;
    DROP POLICY IF EXISTS "courses_delete_own" ON public.courses;
    DROP POLICY IF EXISTS "courses_admin_all" ON public.courses;
    DROP POLICY IF EXISTS "courses_policy" ON public.courses;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'user_id') THEN
      EXECUTE 'CREATE POLICY "courses_policy" ON public.courses
        FOR ALL
        USING (public.is_admin() OR (SELECT auth.uid()) = user_id)
        WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = user_id)';
      
      RAISE NOTICE 'Merged policy for courses';
    END IF;
  END IF;
END $$;

-- 3. 合并 universities 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'universities') THEN
    DROP POLICY IF EXISTS "universities_select_own" ON public.universities;
    DROP POLICY IF EXISTS "universities_insert_own" ON public.universities;
    DROP POLICY IF EXISTS "universities_update_own" ON public.universities;
    DROP POLICY IF EXISTS "universities_delete_own" ON public.universities;
    DROP POLICY IF EXISTS "universities_admin_all" ON public.universities;
    DROP POLICY IF EXISTS "universities_policy" ON public.universities;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'universities' AND column_name = 'user_id') THEN
      EXECUTE 'CREATE POLICY "universities_policy" ON public.universities
        FOR ALL
        USING (public.is_admin() OR (SELECT auth.uid()) = user_id)
        WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = user_id)';
      
      RAISE NOTICE 'Merged policy for universities';
    END IF;
  END IF;
END $$;

-- 4. 合并 student_profiles 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_profiles') THEN
    DROP POLICY IF EXISTS "student_profiles_admin_all" ON public.student_profiles;
    DROP POLICY IF EXISTS "student_profiles_user_own" ON public.student_profiles;
    DROP POLICY IF EXISTS "student_profiles_policy" ON public.student_profiles;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'user_id') THEN
      EXECUTE 'CREATE POLICY "student_profiles_policy" ON public.student_profiles
        FOR ALL
        USING (public.is_admin() OR (SELECT auth.uid()) = user_id)
        WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = user_id)';
      
      RAISE NOTICE 'Merged policy for student_profiles';
    END IF;
  END IF;
END $$;

-- 5. 合并 student_documents 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_documents') THEN
    DROP POLICY IF EXISTS "student_documents_admin_all" ON public.student_documents;
    DROP POLICY IF EXISTS "student_documents_user_own" ON public.student_documents;
    DROP POLICY IF EXISTS "student_documents_policy" ON public.student_documents;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_documents' AND column_name = 'user_id') THEN
      EXECUTE 'CREATE POLICY "student_documents_policy" ON public.student_documents
        FOR ALL
        USING (public.is_admin() OR (SELECT auth.uid()) = user_id)
        WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = user_id)';
      
      RAISE NOTICE 'Merged policy for student_documents';
    END IF;
  END IF;
END $$;

-- 6. 合并 student_media 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_media') THEN
    DROP POLICY IF EXISTS "student_media_admin_all" ON public.student_media;
    DROP POLICY IF EXISTS "student_media_user_own" ON public.student_media;
    DROP POLICY IF EXISTS "student_media_policy" ON public.student_media;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_media' AND column_name = 'user_id') THEN
      EXECUTE 'CREATE POLICY "student_media_policy" ON public.student_media
        FOR ALL
        USING (public.is_admin() OR (SELECT auth.uid()) = user_id)
        WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = user_id)';
      
      RAISE NOTICE 'Merged policy for student_media';
    END IF;
  END IF;
END $$;

-- 7. 合并 students 表的策略（如果存在）
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students') THEN
    DROP POLICY IF EXISTS "students_select_own" ON public.students;
    DROP POLICY IF EXISTS "students_insert_own" ON public.students;
    DROP POLICY IF EXISTS "students_update_own" ON public.students;
    DROP POLICY IF EXISTS "students_delete_own" ON public.students;
    DROP POLICY IF EXISTS "students_admin_all" ON public.students;
    DROP POLICY IF EXISTS "students_policy" ON public.students;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'user_id') THEN
      EXECUTE 'CREATE POLICY "students_policy" ON public.students
        FOR ALL
        USING (public.is_admin() OR (SELECT auth.uid()) = user_id)
        WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = user_id)';
      
      RAISE NOTICE 'Merged policy for students';
    END IF;
  END IF;
END $$;

-- 8. 合并 user_roles 表的策略
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_delete_policy" ON public.user_roles;
    DROP POLICY IF EXISTS "user_roles_modify_policy" ON public.user_roles;
    
    -- 所有用户可以查看自己的角色
    EXECUTE 'CREATE POLICY "user_roles_select_policy" ON public.user_roles
      FOR SELECT
      USING ((SELECT auth.uid()) = user_id)';
    
    -- 只有管理员可以插入角色
    EXECUTE 'CREATE POLICY "user_roles_insert_policy" ON public.user_roles
      FOR INSERT
      WITH CHECK (public.is_admin())';
    
    -- 只有管理员可以更新角色
    EXECUTE 'CREATE POLICY "user_roles_update_policy" ON public.user_roles
      FOR UPDATE
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
    
    -- 只有管理员可以删除角色
    EXECUTE 'CREATE POLICY "user_roles_delete_policy" ON public.user_roles
      FOR DELETE
      USING (public.is_admin())';
    
    RAISE NOTICE 'Merged policies for user_roles';
  END IF;
END $$;

-- 验证所有策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
