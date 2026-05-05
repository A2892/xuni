-- CockroachDB 数据库初始化脚本
-- 创建所有必需的表和索引，使其与 Supabase PostgreSQL 兼容

-- ============================================================================
-- 1. 创建扩展（如适用）
-- ============================================================================

-- CockroachDB 内置 UUID 支持，无需特殊扩展


-- ============================================================================
-- 2. 创建学生档案表
-- ============================================================================

DROP TABLE IF EXISTS student_profiles CASCADE;
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  major TEXT,
  college TEXT,
  email TEXT,
  phone TEXT,
  enrollment_date DATE,
  expected_graduation_date DATE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_student_profiles_student_id ON student_profiles(student_id);
CREATE INDEX idx_student_profiles_student_name ON student_profiles(student_name);
CREATE INDEX idx_student_profiles_created_at ON student_profiles(created_at DESC);


-- ============================================================================
-- 3. 创建学生媒体表
-- ============================================================================

DROP TABLE IF EXISTS student_media CASCADE;
CREATE TABLE student_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
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
  folder_id TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_student_media_student_id ON student_media(student_id);
CREATE INDEX idx_student_media_student_name ON student_media(student_name);
CREATE INDEX idx_student_media_created_at ON student_media(created_at DESC);
CREATE INDEX idx_student_media_type ON student_media(type);
CREATE INDEX idx_student_media_folder_id ON student_media(folder_id);
CREATE INDEX idx_student_media_deleted_at ON student_media(deleted_at);


-- ============================================================================
-- 4. 创建学生文档表
-- ============================================================================

DROP TABLE IF EXISTS student_documents CASCADE;
CREATE TABLE student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  folder_id TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_student_documents_student_id ON student_documents(student_id);
CREATE INDEX idx_student_documents_type ON student_documents(document_type);
CREATE INDEX idx_student_documents_folder_id ON student_documents(folder_id);
CREATE INDEX idx_student_documents_created_at ON student_documents(created_at DESC);
CREATE INDEX idx_student_documents_deleted_at ON student_documents(deleted_at);


-- ============================================================================
-- 5. 创建保存的文档表
-- ============================================================================

DROP TABLE IF EXISTS saved_documents CASCADE;
CREATE TABLE saved_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  document_type TEXT NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saved_documents_user_id ON saved_documents(user_id);
CREATE INDEX idx_saved_documents_document_type ON saved_documents(document_type);
CREATE INDEX idx_saved_documents_updated_at ON saved_documents(updated_at DESC);


-- ============================================================================
-- 6. 创建管理员用户表
-- ============================================================================

DROP TABLE IF EXISTS admin_users CASCADE;
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);


-- ============================================================================
-- 7. 创建用户角色表（如果需要）
-- ============================================================================

DROP TABLE IF EXISTS user_roles CASCADE;
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);


-- ============================================================================
-- 8. 创建课程表（如果需要）
-- ============================================================================

DROP TABLE IF EXISTS courses CASCADE;
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID,
  code TEXT,
  name TEXT,
  instructor TEXT,
  credits INTEGER,
  grade TEXT,
  semester TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_courses_student_id ON courses(student_id);
CREATE INDEX idx_courses_semester ON courses(semester);


-- ============================================================================
-- 9. 创建大学表（如果需要）
-- ============================================================================

DROP TABLE IF EXISTS universities CASCADE;
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_universities_name ON universities(name);


-- ============================================================================
-- 10. 创建学生表（如果需要）
-- ============================================================================

DROP TABLE IF EXISTS students CASCADE;
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  student_id TEXT UNIQUE,
  major TEXT,
  enrollment_date DATE,
  expected_graduation DATE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_name ON students(name);


-- ============================================================================
-- 11. 创建辅助函数（CockroachDB 兼容版本）
-- ============================================================================

-- CockroachDB 与 PostgreSQL 在函数方面有差异
-- 这里创建基本的 is_admin 函数
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- 注：此函数在 CockroachDB 中可能需要调整
  -- 因为 CockroachDB 不完全支持 auth.uid() 等 Supabase 函数
  RETURN FALSE; -- 默认返回 false，需要手动配置
END;
$$ LANGUAGE PL/pgsql;


-- ============================================================================
-- 12. 初始化完成
-- ============================================================================

-- 显示所有已创建的表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
