# 学生照片库和资料管理数据库配置

## 1. 创建 student_media 表（学生媒体库）

在 Supabase SQL Editor 中执行以下 SQL：

```sql
-- 创建学生媒体表
CREATE TABLE student_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
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
CREATE INDEX idx_student_media_user_id ON student_media(user_id);
CREATE INDEX idx_student_media_type ON student_media(type);
CREATE INDEX idx_student_media_student_id ON student_media(student_id);
CREATE INDEX idx_student_media_created_at ON student_media(created_at DESC);

-- 启用行级安全 (RLS)
ALTER TABLE student_media ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有用户访问（如果有认证系统，建议修改为基于 user_id 的策略）
CREATE POLICY "Enable all access for student media" ON student_media
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## 2. 创建 student_profiles 表（学生档案）

```sql
-- 创建学生档案表
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  major TEXT,
  school TEXT,
  enrollment_date DATE,
  expected_graduation DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_student_profiles_student_id ON student_profiles(student_id);
CREATE INDEX idx_student_profiles_name ON student_profiles(student_name);

-- 启用行级安全 (RLS)
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Enable all access for student profiles" ON student_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## 3. 创建 student_documents 表（学生文档）

```sql
-- 创建学生文档表
CREATE TABLE student_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'student_id', 'enrollment', 'transcript', 'degree', 'diploma', 
    'scholarship', 'recommendation', 'internship', 'admission', 'other'
  )),
  document_name TEXT NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  data JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_student_documents_student_id ON student_documents(student_id);
CREATE INDEX idx_student_documents_type ON student_documents(document_type);
CREATE INDEX idx_student_documents_status ON student_documents(status);
CREATE INDEX idx_student_documents_updated_at ON student_documents(updated_at DESC);

-- 启用行级安全 (RLS)
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Enable all access for student documents" ON student_documents
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## 4. 创建 Storage Bucket

在 Supabase Dashboard 中：
1. 进入 Storage 部分
2. 创建新的 bucket，名称为：`student-media`
3. 设置为 Public bucket（或根据需求设置为 Private）

### 在 SQL Editor 中配置 Storage：

```sql
-- 创建 student-media 存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-media', 'student-media', true);

-- 设置存储策略：允许所有用户上传
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'student-media');

-- 允许所有用户读取
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-media');

-- 允许所有用户删除（建议在生产环境中限制为文件所有者）
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'student-media');

-- 如果有认证系统，使用以下策略：
-- CREATE POLICY "Users can upload own files"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'student-media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 5. 环境变量

确保 `.env` 文件包含：

```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

## 6. 文件存储结构

文件将按以下路径存储：
```
student-media/
  photos/
    {timestamp}_{filename}
  videos/
    {timestamp}_{filename}
  thumbnails/
    {timestamp}_{filename}
  thumbnails/
    {timestamp}_{filename}
  documents/
    {student_id}/
      {document_type}_{timestamp}.{ext}
```

## 7. 数据表关系

- **student_profiles**: 存储学生的基本信息
- **student_documents**: 存储学生的各类文档记录
- **student_media**: 存储学生的照片和视频

文档关系：
- `student_documents.student_id` 关联到 `student_profiles.student_id`
- `student_media.student_id` 可以关联到 `student_profiles.student_id`
- `student_profiles.photo_url` 可以引用 `student_media.url`


### student_profiles 表
- `id`: 主键 UUID
- `student_id`: 学号（唯一）
- `student_name`: 学生姓名
- `email`: 邮箱
- `phone`: 电话
- `photo_url`: 照片URL
- `major`: 专业
- `school`: 学院
- `enrollment_date`: 入学日期
- `expected_graduation`: 预计毕业日期
- `created_at`: 创建时间
- `updated_at`: 更新时间

### student_documents 表
- `id`: 主键 UUID
- `student_id`: 学号
- `student_name`: 学生姓名
- `document_type`: 文档类型
- `document_name`: 文档名称
- `file_url`: 文件URL
- `thumbnail_url`: 缩略图URL
- `data`: 文档数据（JSONB）
- `status`: 状态（draft/completed/archived）
- `tags`: 标签数组
- `notes`: 备注
- `created_at`: 创建时间
- `updated_at`: 更新时间
## 8. 功能说明

### 学生档案管理
- 创建和编辑学生基本信息
- 上传学生照片（从照片库选择或本地上传）
- 查看学生的所有文档

### 文档管理
- 添加各类文档（学生证、在读证明、成绩单等）
- 上传文档文件（PDF、Word、图片等）
- 标签分类和状态管理
- 文档搜索和筛选

### 照片库
- 上传学生照片和视频
- 按学生分类管理
- 在各个文档生成器中直接选择使用

## 9. 数据库字段说明

- `id`: 主键 UUID
- `user_id`: 用户ID（如果有认证系统）
- `type`: 媒体类型（photo 或 video）
- `file_name`: 原始文件名
- `file_size`: 文件大小（字节）
- `storage_path`: Storage 中的路径
- `url`: 公开访问 URL
- `thumbnail_url`: 缩略图 URL（视频用）
- `student_name`: 学生姓名
- `student_id`: 学号
- `description`: 描述
- `tags`: 标签数组
- `created_at`: 创建时间
- `updated_at`: 更新时间
