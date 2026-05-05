-- ============================================
-- 数据库安全性修复脚本（完全修复版）
-- 解决Supabase Dashboard中显示的所有安全问题
-- ============================================

-- 1. 为 saved_documents 表启用 RLS（如果表存在且有user_id列）
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_documents') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'saved_documents' AND column_name = 'user_id') THEN
      ALTER TABLE public.saved_documents ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "saved_documents_select_own" ON public.saved_documents;
      DROP POLICY IF EXISTS "saved_documents_insert_own" ON public.saved_documents;
      DROP POLICY IF EXISTS "saved_documents_update_own" ON public.saved_documents;
      DROP POLICY IF EXISTS "saved_documents_delete_own" ON public.saved_documents;
      DROP POLICY IF EXISTS "saved_documents_admin_all" ON public.saved_documents;
      
      EXECUTE 'CREATE POLICY "saved_documents_select_own" ON public.saved_documents
        FOR SELECT
        USING (auth.uid() = user_id)';
      
      EXECUTE 'CREATE POLICY "saved_documents_insert_own" ON public.saved_documents
        FOR INSERT
        WITH CHECK (auth.uid() = user_id)';
      
      EXECUTE 'CREATE POLICY "saved_documents_update_own" ON public.saved_documents
        FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)';
      
      EXECUTE 'CREATE POLICY "saved_documents_delete_own" ON public.saved_documents
        FOR DELETE
        USING (auth.uid() = user_id)';
      
      RAISE NOTICE 'RLS policies created for saved_documents';
    ELSE
      RAISE NOTICE 'Skipping saved_documents: user_id column does not exist';
    END IF;
  ELSE
    RAISE NOTICE 'Skipping saved_documents: table does not exist';
  END IF;
END $$;

-- 2. 为 courses 表启用 RLS（如果表存在且有user_id列）
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'user_id') THEN
      ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "courses_select_own" ON public.courses;
      DROP POLICY IF EXISTS "courses_insert_own" ON public.courses;
      DROP POLICY IF EXISTS "courses_update_own" ON public.courses;
      DROP POLICY IF EXISTS "courses_delete_own" ON public.courses;
      DROP POLICY IF EXISTS "courses_admin_all" ON public.courses;
      
      EXECUTE 'CREATE POLICY "courses_select_own" ON public.courses
        FOR SELECT
        USING (auth.uid() = user_id)';
      
      EXECUTE 'CREATE POLICY "courses_insert_own" ON public.courses
        FOR INSERT
        WITH CHECK (auth.uid() = user_id)';
      
      EXECUTE 'CREATE POLICY "courses_update_own" ON public.courses
        FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)';
      
      EXECUTE 'CREATE POLICY "courses_delete_own" ON public.courses
        FOR DELETE
        USING (auth.uid() = user_id)';
      
      RAISE NOTICE 'RLS policies created for courses';
    ELSE
      RAISE NOTICE 'Skipping courses: user_id column does not exist';
    END IF;
  ELSE
    RAISE NOTICE 'Skipping courses: table does not exist';
  END IF;
END $$;

-- 3. 为 universities 表启用 RLS（如果表存在且有user_id列）
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'universities') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'universities' AND column_name = 'user_id') THEN
      ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "universities_select_own" ON public.universities;
      DROP POLICY IF EXISTS "universities_insert_own" ON public.universities;
      DROP POLICY IF EXISTS "universities_update_own" ON public.universities;
      DROP POLICY IF EXISTS "universities_delete_own" ON public.universities;
      DROP POLICY IF EXISTS "universities_admin_all" ON public.universities;
      
      EXECUTE 'CREATE POLICY "universities_select_own" ON public.universities
        FOR SELECT
        USING (auth.uid() = user_id)';
      
      EXECUTE 'CREATE POLICY "universities_insert_own" ON public.universities
        FOR INSERT
        WITH CHECK (auth.uid() = user_id)';
      
      EXECUTE 'CREATE POLICY "universities_update_own" ON public.universities
        FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)';
      
      EXECUTE 'CREATE POLICY "universities_delete_own" ON public.universities
        FOR DELETE
        USING (auth.uid() = user_id)';
      
      RAISE NOTICE 'RLS policies created for universities';
    ELSE
      RAISE NOTICE 'Skipping universities: user_id column does not exist';
    END IF;
  ELSE
    RAISE NOTICE 'Skipping universities: table does not exist';
  END IF;
END $$;

-- 4. 创建用户角色表（如果不存在）
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 为 user_roles 表启用 RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;

-- 用户可以查看自己的角色
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 只有管理员可以修改角色
CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 5. 创建辅助函数：检查用户是否为管理员
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 为学生相关表添加管理员访问权限
DO $$ 
BEGIN
  -- student_profiles
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_profiles') THEN
    ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "student_profiles_admin_all" ON public.student_profiles;
    DROP POLICY IF EXISTS "student_profiles_user_own" ON public.student_profiles;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'user_id') THEN
      EXECUTE 'CREATE POLICY "student_profiles_admin_all" ON public.student_profiles
        FOR ALL
        USING (public.is_admin())';
      
      EXECUTE 'CREATE POLICY "student_profiles_user_own" ON public.student_profiles
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)';
      
      RAISE NOTICE 'RLS policies created for student_profiles';
    ELSE
      RAISE NOTICE 'Skipping student_profiles: user_id column does not exist';
    END IF;
  END IF;
  
  -- student_documents
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_documents') THEN
    ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "student_documents_admin_all" ON public.student_documents;
    DROP POLICY IF EXISTS "student_documents_user_own" ON public.student_documents;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_documents' AND column_name = 'user_id') THEN
      EXECUTE 'CREATE POLICY "student_documents_admin_all" ON public.student_documents
        FOR ALL
        USING (public.is_admin())';
      
      EXECUTE 'CREATE POLICY "student_documents_user_own" ON public.student_documents
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)';
      
      RAISE NOTICE 'RLS policies created for student_documents';
    ELSE
      RAISE NOTICE 'Skipping student_documents: user_id column does not exist';
    END IF;
  END IF;
  
  -- student_media
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_media') THEN
    ALTER TABLE public.student_media ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "student_media_admin_all" ON public.student_media;
    DROP POLICY IF EXISTS "student_media_user_own" ON public.student_media;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_media' AND column_name = 'user_id') THEN
      EXECUTE 'CREATE POLICY "student_media_admin_all" ON public.student_media
        FOR ALL
        USING (public.is_admin())';
      
      EXECUTE 'CREATE POLICY "student_media_user_own" ON public.student_media
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)';
      
      RAISE NOTICE 'RLS policies created for student_media';
    ELSE
      RAISE NOTICE 'Skipping student_media: user_id column does not exist';
    END IF;
  END IF;
END $$;

-- 7. 修复 fn_set_updated_at 函数的可变性
DROP FUNCTION IF EXISTS public.fn_set_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. 为所有需要的表重新创建 updated_at 触发器
DO $$ 
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('saved_documents', 'courses', 'universities', 'student_profiles', 'student_documents', 'student_media')
  LOOP
    -- 检查表是否有 updated_at 列
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tbl_name AND column_name = 'updated_at') THEN
      EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', tbl_name);
      
      EXECUTE format('
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.fn_set_updated_at()
      ', tbl_name);
      
      RAISE NOTICE 'Trigger created for %', tbl_name;
    END IF;
  END LOOP;
END $$;

-- 9. 为有user_id的表创建管理员专用策略
DO $$ 
BEGIN
  -- saved_documents
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_documents') 
     AND EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'saved_documents' AND column_name = 'user_id') THEN
    DROP POLICY IF EXISTS "saved_documents_admin_all" ON public.saved_documents;
    EXECUTE 'CREATE POLICY "saved_documents_admin_all" ON public.saved_documents
      FOR ALL
      USING (public.is_admin())';
    RAISE NOTICE 'Admin policy created for saved_documents';
  END IF;
  
  -- courses
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses')
     AND EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'user_id') THEN
    DROP POLICY IF EXISTS "courses_admin_all" ON public.courses;
    EXECUTE 'CREATE POLICY "courses_admin_all" ON public.courses
      FOR ALL
      USING (public.is_admin())';
    RAISE NOTICE 'Admin policy created for courses';
  END IF;
  
  -- universities
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'universities')
     AND EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'universities' AND column_name = 'user_id') THEN
    DROP POLICY IF EXISTS "universities_admin_all" ON public.universities;
    EXECUTE 'CREATE POLICY "universities_admin_all" ON public.universities
      FOR ALL
      USING (public.is_admin())';
    RAISE NOTICE 'Admin policy created for universities';
  END IF;
END $$;

-- 10. 创建一个默认管理员账号的函数（需要手动调用）
CREATE OR REPLACE FUNCTION public.create_admin_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin';
  
  RAISE NOTICE 'User % set as admin', target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 执行完成提示
-- ============================================

-- 查看当前所有表的RLS状态
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 查看所有策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 使用说明
-- ============================================
-- 
-- 执行完脚本后，运行以下命令设置管理员：
-- 
-- 方法1：将当前登录用户设置为管理员
-- SELECT public.create_admin_user(auth.uid());
-- 
-- 方法2：指定特定用户ID为管理员
-- SELECT public.create_admin_user('用户的UUID');
-- 
-- ============================================
