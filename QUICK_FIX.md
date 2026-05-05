# 🚀 快速修复数据库问题

## 问题
错误信息：`Could not find the table 'public.student_profiles' in the schema cache`

这说明数据库表还没有创建。

## ✅ 解决方案（3步）

### 第1步：打开 Supabase SQL Editor
1. 访问：https://gfeekvcpbepotwulfbrg.supabase.co
2. 点击左侧菜单的 **"SQL Editor"**
3. 点击右上角 **"New Query"** 按钮

### 第2步：复制并执行 SQL
复制下面的 SQL 代码，粘贴到 SQL Editor 中，然后点击 **"Run"** 按钮：

```sql
-- 创建管理员用户表
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- 启用 RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Anyone can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can delete admin users" ON admin_users;
-- 创建更安全的访问策略：仅管理员可读写；允许首次插入管理员当表为空
CREATE POLICY "admin_users_admin_all" ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 允许首次插入（当表为空）以便初始化管理员账号
CREATE POLICY "admin_users_allow_initial_insert" ON public.admin_users
  FOR INSERT
  WITH CHECK (NOT EXISTS (SELECT 1 FROM public.admin_users));

-- 插入默认管理员账号（用户名: admin, 密码: admin123）
-- ⚠️ 生产环境请立即修改密码！
INSERT INTO admin_users (username, password, full_name, role, status)
VALUES ('admin', 'admin123', '系统管理员', 'admin', 'active')
ON CONFLICT (username) DO NOTHING;

-- 创建学生档案表
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  major TEXT,
  school TEXT,
  college TEXT,
  email TEXT,
  phone TEXT,
  enrollment_date TEXT,
  expected_graduation TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON student_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_name ON student_profiles(student_name);

-- 启用 RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
-- 创建或替换辅助函数（用于管理员检查）
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

-- 删除旧策略（如果存在）并创建更严格的策略（student_profiles）
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Anyone can delete profiles" ON public.student_profiles;

CREATE POLICY "student_profiles_admin_all" ON public.student_profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 如果存在 user_id，可创建所有者策略
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name='student_profiles' AND column_name='user_id') THEN
    CREATE POLICY "student_profiles_user_own" ON public.student_profiles FOR ALL
      USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END$$;

-- 创建学生媒体表
CREATE TABLE IF NOT EXISTS student_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  student_name TEXT,
  student_id TEXT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_student_media_student_id ON student_media(student_id);
CREATE INDEX IF NOT EXISTS idx_student_media_student_name ON student_media(student_name);

-- 启用 RLS
ALTER TABLE student_media ENABLE ROW LEVEL SECURITY;
-- 删除旧策略（如果存在）并创建更严格的策略（student_media）
DROP POLICY IF EXISTS "Anyone can view media" ON public.student_media;
DROP POLICY IF EXISTS "Anyone can insert media" ON public.student_media;
DROP POLICY IF EXISTS "Anyone can update media" ON public.student_media;
DROP POLICY IF EXISTS "Anyone can delete media" ON public.student_media;

CREATE POLICY "student_media_admin_all" ON public.student_media FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name='student_media' AND column_name='user_id') THEN
    CREATE POLICY "student_media_user_own" ON public.student_media FOR ALL
      USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END$$;

-- 创建学生文档表
CREATE TABLE IF NOT EXISTS student_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT,
  student_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_student_name ON student_documents(student_name);

-- 启用 RLS
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
-- 删除旧策略（如果存在）并创建更严格的策略（student_documents）
DROP POLICY IF EXISTS "Anyone can view documents" ON public.student_documents;
DROP POLICY IF EXISTS "Anyone can insert documents" ON public.student_documents;
DROP POLICY IF EXISTS "Anyone can update documents" ON public.student_documents;
DROP POLICY IF EXISTS "Anyone can delete documents" ON public.student_documents;

CREATE POLICY "student_documents_admin_all" ON public.student_documents FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name='student_documents' AND column_name='user_id') THEN
    CREATE POLICY "student_documents_user_own" ON public.student_documents FOR ALL
      USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END$$;
```

### 第3步：创建 Storage Buckets
在 Supabase 中创建两个存储桶：

1. 点击左侧菜单的 **"Storage"**
2. 点击 **"Create a new bucket"**
3. 创建第一个桶：
   - Name: `student-media`
   - Public: ✅ 勾选 "Public bucket"
   - 点击 "Create bucket"
4. 创建第二个桶：
   - Name: `student-documents`
   - Public: ✅ 勾选 "Public bucket"
   - 点击 "Create bucket"

### 第4步：验证表已创建
1. 点击左侧菜单的 **"Table Editor"**
2. 应该能看到三个表：
   - ✅ `student_profiles`
   - ✅ `student_media`
   - ✅ `student_documents`

### 第4步：刷新网页
回到你的应用页面（localhost:5173/student-profile），刷新浏览器，再次尝试创建学生档案。

## ⚠️ 如果还有问题

如果执行 SQL 时出现错误，请：
1. 截图错误信息
2. 检查是否已经创建了这些表（在 Table Editor 中查看）
3. 如果表已存在但策略有问题，可以先删除表再重新创建

## 💡 提示
- SQL 执行成功后会显示 "Success. No rows returned"
- 创建表后不需要重启开发服务器
- 只需要刷新浏览器页面即可
