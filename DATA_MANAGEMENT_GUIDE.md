# 数据管理功能使用说明

## 已完成的功能

所有页面已添加保存/加载数据功能：

✅ **成绩单页面** (TranscriptView.vue)
✅ **录取通知书页面** (AdmissionView.vue)
✅ **课程表页面** (ScheduleView.vue)
✅ **在读证明页面** (EnrollmentView.vue)
✅ **学生证页面** (StudentIDView.vue)

## 快速开始

### 1. 配置 Supabase

在 Supabase 中创建数据库表：

```sql
CREATE TABLE saved_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type TEXT NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用所有用户访问（临时策略）
ALTER TABLE saved_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access" ON saved_documents
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 3. 使用数据管理面板

每个页面的第一个标签页都有数据管理面板：

#### 保存数据
1. 填写或编辑页面内容
2. 在"数据管理"面板输入框输入保存名称（例如："张三的成绩单"）
3. 点击"保存"按钮

#### 加载数据
1. 从下拉列表中选择之前保存的数据
2. 点击"加载"按钮
3. 所有相关信息将自动填充到页面

#### 更新数据
1. 从下拉列表选择要更新的数据
2. 修改页面内容
3. 点击"更新"按钮

#### 删除数据
1. 从下拉列表选择要删除的数据
2. 点击"删除"按钮
3. 确认删除操作

## 保存的数据内容

### 成绩单 (transcript)
- 课程列表
- 设计设置（颜色、字体、水印等）
- 大学信息
- 学生信息

### 录取通知书 (admission)
- 录取信息
- 设计设置
- 大学信息
- 学生信息

### 课程表 (schedule)
- 课程列表
- 设计选项
- 显示选项
- 大学和学生信息

### 在读证明 (enrollment)
- 设计设置
- 大学信息
- 学生信息

### 学生证 (student_id)
- 大学信息
- 学生信息
- 照片设置
- 证件样式
- 背面设置

## 注意事项

1. **数据独立性**：每个页面的数据互相独立，不会相互影响
2. **实时保存**：数据即时保存到 Supabase 云端
3. **自动更新时间**：每次保存或更新都会记录时间戳
4. **多设备访问**：数据保存在云端，可在不同设备访问（需要相同的 Supabase 配置）

## 故障排除

### 保存失败
- 检查 `.env` 文件配置是否正确
- 确认 Supabase 项目是否正常运行
- 查看浏览器控制台错误信息

### 加载失败
- 确认数据是否已成功保存
- 检查网络连接
- 刷新页面重试

### 数据显示不完整
- 确保保存时所有必要字段都已填写
- 检查数据结构是否匹配

## 开发者信息

相关文件：
- `src/utils/dataService.ts` - 数据服务函数
- `src/components/SaveLoadPanel.vue` - 保存加载面板组件
- `src/lib/supabase.ts` - Supabase 客户端配置

如需帮助，请查看 `SUPABASE_SETUP.md` 文件了解更多详情。
