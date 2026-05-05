# 数据库连接设置完成指南

## ✅ 你的Supabase配置信息

- **项目URL**: https://gfeekvcpbepotwulfbrg.supabase.co
- **状态**: 已配置 ✓

## 📋 完成数据库设置的步骤

### 步骤1: 创建数据库表

1. 访问你的Supabase项目: https://gfeekvcpbepotwulfbrg.supabase.co
2. 点击左侧菜单 **SQL Editor**
3. 点击 **New Query**
4. 打开项目根目录的 `setup_database.sql` 文件
5. 复制全部内容并粘贴到SQL编辑器
6. 点击 **Run** 执行SQL
7. 看到成功消息后，表格就创建好了

### 步骤2: 创建Storage Bucket

1. 在Supabase控制台，点击左侧 **Storage**
2. 点击 **Create a new bucket**
3. 填写信息：
   - **Name**: `student-media`
   - **Public bucket**: ✅ **必须勾选**（允许公开访问照片）
4. 点击 **Create bucket**

### 步骤3: 配置Storage权限

1. 点击 **Storage** → **Policies** 
2. 选择 `student-media` bucket
3. 点击 **New Policy** 创建以下4个策略：

#### 策略1: 允许上传
```
Policy name: Allow public upload
Allowed operation: INSERT
Target roles: public
Policy definition: true
```

#### 策略2: 允许查看  
```
Policy name: Allow public select
Allowed operation: SELECT
Target roles: public
Policy definition: true
```

#### 策略3: 允许更新
```
Policy name: Allow public update
Allowed operation: UPDATE
Target roles: public
Policy definition: true
```

#### 策略4: 允许删除
```
Policy name: Allow public delete
Allowed operation: DELETE
Target roles: public
Policy definition: true
```

### 步骤4: 重启开发服务器

完成上述设置后，在终端执行：

```bash
# 如果服务器正在运行，先按 Ctrl+C 停止
# 然后重新启动
npm run dev
```

## 🎯 测试数据库连接

设置完成后，打开浏览器：

1. 访问 http://localhost:5173
2. 进入 **学生照片** 页面
3. 点击 **上传** 标签
4. 上传一张测试照片，填写学生姓名
5. 点击上传按钮
6. 查看浏览器控制台（F12），应该看到：
   - "开始上传文件到 Supabase Storage: photos/..."
   - "Storage上传成功"
   - "数据库保存成功"

## 📸 使用文件夹功能

上传照片后：
- 相同学生名的照片会自动归入同一个文件夹📁
- 在 **照片库** 标签查看所有学生的照片文件夹
- 每个文件夹显示该学生的照片数、视频数和总大小
- 点击照片可以预览

## 🗂️ 学生档案管理

在 **资料管理** 页面：
- 可以创建学生档案（姓名、学号、专业等）
- 管理学生的各类文档（学生证、在读证明等）
- 按学生文件夹方式查看所有文档
- 文档也会自动分组显示

## ⚠️ 常见问题

### 问题1: 上传失败显示"数据库未配置"
- 检查 `.env` 文件是否正确填写了URL和KEY
- 重启开发服务器

### 问题2: 上传成功但看不到图片
- 检查Storage bucket是否设置为public
- 检查是否创建了4个Storage策略

### 问题3: "Table not found" 错误
- 确认已执行 setup_database.sql
- 在SQL Editor中运行: `SELECT * FROM student_media LIMIT 1;`
- 如果报错，重新执行步骤1

### 问题4: "Row Level Security" 错误
- 确认已创建所有4个RLS策略
- 重新执行 setup_database.sql 中的策略创建部分

## 💡 提示

- 所有照片都存储在云端，永久有效
- 支持照片和视频格式
- 单个文件最大50MB
- 照片会自动按学生分类到文件夹
- 可以为每张照片添加描述和标签
- 支持搜索和筛选功能

完成设置后，你就可以开始使用完整的学生照片和档案管理功能了！🎉
