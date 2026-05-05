-- 彻底清理并重建student_media表的策略

-- 获取student_media表的所有现有策略并删除
DO $$ 
DECLARE
  policy_rec RECORD;
BEGIN
  -- 删除student_media表的所有策略
  FOR policy_rec IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'student_media'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.student_media', policy_rec.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_rec.policyname;
  END LOOP;
  
  -- 创建新的单一策略
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_media' AND column_name = 'user_id') THEN
    EXECUTE 'CREATE POLICY "student_media_policy" ON public.student_media
      FOR ALL
      USING (public.is_admin() OR (SELECT auth.uid()) = user_id)
      WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = user_id)';
    
    RAISE NOTICE 'Created single policy for student_media';
  END IF;
END $$;

-- 同样清理其他可能有问题的表
DO $$ 
DECLARE
  policy_rec RECORD;
  table_list TEXT[] := ARRAY['saved_documents', 'courses', 'universities', 'student_profiles', 'student_documents', 'students'];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY table_list
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
      -- 删除该表的所有策略
      FOR policy_rec IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = tbl
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_rec.policyname, tbl);
      END LOOP;
      
      -- 重新创建单一策略（如果有user_id列）
      IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'user_id') THEN
        EXECUTE format('CREATE POLICY "%s_policy" ON public.%I
          FOR ALL
          USING (public.is_admin() OR (SELECT auth.uid()) = user_id)
          WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = user_id)', tbl, tbl);
        
        RAISE NOTICE 'Created policy for %', tbl;
      END IF;
    END IF;
  END LOOP;
END $$;

-- 验证结果
SELECT 
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ') as policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('saved_documents', 'courses', 'universities', 'student_profiles', 'student_documents', 'student_media', 'students', 'user_roles')
GROUP BY tablename
ORDER BY tablename;
