# Supabase 数据库配置指南

## 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - Name: `student-documents` (或任意名称)
   - Database Password: 设置一个强密码（请记住）
   - Region: 选择离你最近的区域
5. 点击 "Create new project" 等待项目创建完成（约2分钟）

## 2. 获取API密钥

项目创建完成后：

1. 进入项目控制台
2. 点击左侧菜单的 "Settings" → "API"
3. 找到以下信息：
   - **Project URL**: 形如 `https://xxxxx.supabase.co`
   - **anon public**: 公开密钥，形如 `eyJhbG...`

## 3. 配置本地环境

在项目根目录创建 `.env` 文件：

```bash
# 复制 .env.example 并填入你的信息
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 信息：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. 创建 Storage Bucket

1. 在 Supabase 控制台，点击左侧 "Storage"
2. 点击 "Create a new bucket"
3. 填写：
   - Name: `student-media`
   - Public bucket: ✅ **勾选**（允许公开访问）
4. 点击 "Create bucket"

## 5. 创建数据库表

在 Supabase 控制台：

1. 点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制粘贴以下SQL并执行：

```sql
-- 创建学生媒体表
CREATE TABLE IF NOT EXISTS student_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_student_media_created_at ON student_media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_media_type ON student_media(type);

-- 启用行级安全（RLS）
ALTER TABLE student_media ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取
CREATE POLICY "Anyone can view media"
  ON student_media FOR SELECT
  USING (true);

-- 创建策略：允许所有人插入（因为我们可能没有认证）
CREATE POLICY "Anyone can insert media"
  ON student_media FOR INSERT
  WITH CHECK (true);

-- 创建策略：允许所有人更新
CREATE POLICY "Anyone can update media"
  ON student_media FOR UPDATE
  USING (true);

-- 创建策略：允许所有人删除
CREATE POLICY "Anyone can delete media"
  ON student_media FOR DELETE
  USING (true);
```

## 6. 配置 Storage 权限

1. 在 Supabase 控制台，点击 "Storage" → "Policies"
2. 选择 `student-media` bucket
3. 点击 "New Policy"
4. 选择 "Create a policy from scratch"
5. 创建以下4个策略：

### 策略 1: 允许上传
```
Policy name: Anyone can upload files
Allowed operation: INSERT
Policy definition: true
```

### 策略 2: 允许查看
```
Policy name: Anyone can view files
Allowed operation: SELECT
Policy definition: true
```

### 策略 3: 允许更新
```
Policy name: Anyone can update files
Allowed operation: UPDATE
Policy definition: true
```

### 策略 4: 允许删除
```
Policy name: Anyone can delete files
Allowed operation: DELETE
Policy definition: true
```

## 7. 测试配置

保存 `.env` 文件后，重启开发服务器：

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

现在尝试上传照片，应该可以成功上传到 Supabase 了！

## 故障排除

### 问题1: "Error: Bucket not found"
- 检查 bucket 名称是否为 `student-media`
- 确认 bucket 已设置为 public

### 问题2: "Error: Row-level security policy violated"
- 确认已执行所有 SQL 策略创建语句
- 在 SQL Editor 中运行策略创建SQL

### 问题3: "Error: Storage: Object name is empty"
- 检查文件上传代码
- 确认文件路径格式正确

### 问题4: 上传成功但无法显示图片
- 检查 Storage bucket 是否设置为 public
- 检查获取的 public URL 是否正确

## 备注

- 如果不配置 Supabase，系统会自动使用本地存储（localStorage）
- 本地存储有大小限制（约5-10MB），不适合大量照片
- 建议配置 Supabase 以获得最佳体验
