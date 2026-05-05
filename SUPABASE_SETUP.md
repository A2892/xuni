# Supabase 数据库表结构

请在 Supabase 中创建以下表：

## saved_documents 表

```sql
CREATE TABLE saved_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  document_type TEXT NOT NULL CHECK (document_type IN ('transcript', 'admission', 'schedule', 'enrollment', 'student_id')),
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_saved_documents_user_id ON saved_documents(user_id);
CREATE INDEX idx_saved_documents_document_type ON saved_documents(document_type);
CREATE INDEX idx_saved_documents_updated_at ON saved_documents(updated_at DESC);

-- 启用行级安全 (RLS)
ALTER TABLE saved_documents ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的数据（如果没有用户认证系统，可以暂时允许所有访问）
CREATE POLICY "Enable all access for all users" ON saved_documents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ⚠️ 注意：如果在 Supabase 仪表板中看到 “Multiple Permissive Policies” 警告
--  可以运行仓库中的清理脚本来移除同一表/同一角色/同一动作 下的多余策略（优先保留名包含 "unified" 的策略）：
--   psql -d <database> -f scripts/fix_multiple_permissive_policies.sql
-- 或者在 Supabase SQL 编辑器中粘贴并运行 `scripts/fix_multiple_permissive_policies.sql` 的内容。
-- 该脚本会检测重复策略并删除冗余项，运行完后请刷新 Supabase 仪表板确认告警已消失。

-- 如果有用户认证系统，使用以下策略替代上面的策略：
-- CREATE POLICY "Users can view own documents" ON saved_documents
--   FOR SELECT
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert own documents" ON saved_documents
--   FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own documents" ON saved_documents
--   FOR UPDATE
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own documents" ON saved_documents
--   FOR DELETE
--   USING (auth.uid() = user_id);
```

## 环境变量配置

在项目根目录创建 `.env` 文件并添加：

```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

## 已完成的功能

1. ✅ **成绩单页面** (TranscriptView.vue) - 已添加 SaveLoadPanel
2. ✅ **录取通知书页面** (AdmissionView.vue) - 已添加 SaveLoadPanel
3. ⏳ **课程表页面** (ScheduleView.vue) - 需要手动添加
4. ⏳ **在读证明页面** (EnrollmentView.vue) - 需要手动添加
5. ⏳ **学生证页面** (StudentIDView.vue) - 需要手动添加

## 为剩余页面添加保存加载功能的步骤

### 1. 课程表页面 (ScheduleView.vue)

在 `<script setup>` 部分添加：

```typescript
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'

// 在脚本末尾添加数据管理函数
const getScheduleData = () => {
  return {
    courses: courses.value,
    designOptions: designOptions.value,
    displayOptions: displayOptions.value,
    universityInfo: store.universityInfo,
    studentInfo: store.studentInfo
  }
}

const setScheduleData = (data: any) => {
  if (data.courses) courses.value = data.courses
  if (data.designOptions) designOptions.value = { ...designOptions.value, ...data.designOptions }
  if (data.displayOptions) displayOptions.value = { ...displayOptions.value, ...data.displayOptions }
  if (data.universityInfo) store.updateUniversityInfo(data.universityInfo)
  if (data.studentInfo) store.updateStudentInfo(data.studentInfo)
}
```

在模板的 `info` 标签页内容开头添加：

```vue
<div v-if="activeSubTab === 'info'" class="info-content">
  <!-- 数据管理面板 -->
  <SaveLoadPanel 
    document-type="schedule"
    :get-data="getScheduleData"
    :set-data="setScheduleData"
  />
  
  <!-- 原有内容 -->
  ...
</div>
```

### 2. 在读证明页面 (EnrollmentView.vue)

在 `<script setup>` 部分添加：

```typescript
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'

// 在脚本末尾添加数据管理函数
const getEnrollmentData = () => {
  return {
    designSettings: designSettings.value,
    universityInfo: store.universityInfo,
    studentInfo: store.studentInfo
  }
}

const setEnrollmentData = (data: any) => {
  if (data.designSettings) designSettings.value = { ...designSettings.value, ...data.designSettings }
  if (data.universityInfo) store.updateUniversityInfo(data.universityInfo)
  if (data.studentInfo) store.updateStudentInfo(data.studentInfo)
}
```

在模板的 `info` 标签页内容开头添加：

```vue
<div v-if="activeSubTab === 'info'" class="info-content">
  <!-- 数据管理面板 -->
  <SaveLoadPanel 
    document-type="enrollment"
    :get-data="getEnrollmentData"
    :set-data="setEnrollmentData"
  />
  
  <!-- 原有内容 -->
  ...
</div>
```

### 3. 学生证页面 (StudentIDView.vue)

在 `<script setup>` 部分添加：

```typescript
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'

// 在脚本末尾添加数据管理函数
const getStudentIDData = () => {
  return {
    universityInfo: store.universityInfo,
    studentInfo: store.studentInfo,
    studentPhoto: store.studentPhoto,
    idCardStyle: store.idCardStyle,
    backsideSettings: {
      backsideTitle: backsideTitle.value,
      termsOfUse: termsOfUse.value,
      lostCardInfo: lostCardInfo.value,
      accessPrivileges: accessPrivileges.value,
      logoOpacity: logoOpacity.value
    }
  }
}

const setStudentIDData = (data: any) => {
  if (data.universityInfo) store.updateUniversityInfo(data.universityInfo)
  if (data.studentInfo) store.updateStudentInfo(data.studentInfo)
  if (data.studentPhoto) store.updateStudentPhoto(data.studentPhoto)
  if (data.idCardStyle) store.updateIDCardStyle(data.idCardStyle)
  if (data.backsideSettings) {
    backsideTitle.value = data.backsideSettings.backsideTitle
    termsOfUse.value = data.backsideSettings.termsOfUse
    lostCardInfo.value = data.backsideSettings.lostCardInfo
    accessPrivileges.value = data.backsideSettings.accessPrivileges
    logoOpacity.value = data.backsideSettings.logoOpacity
  }
}
```

在模板的 `证件信息` 标签页内容开头添加：

```vue
<div v-if="activeSubTab === '证件信息'" class="info-content">
  <!-- 数据管理面板 -->
  <SaveLoadPanel 
    document-type="student_id"
    :get-data="getStudentIDData"
    :set-data="setStudentIDData"
  />
  
  <!-- 原有内容 -->
  ...
</div>
```

## 使用说明

1. **保存数据**：
   - 在输入框中输入保存名称
   - 点击"保存"按钮将当前数据保存到 Supabase
   - 如果已选择了一个已保存的项目，点击"更新"会更新该项目

2. **加载数据**：
   - 从下拉列表中选择已保存的数据
   - 点击"加载"按钮应用该数据到当前页面

3. **删除数据**：
   - 从下拉列表中选择要删除的数据
   - 点击"删除"按钮（确认后删除）

## 注意事项

1. 确保已在 Supabase 中创建了 `saved_documents` 表
2. 确保 `.env` 文件中配置了正确的 Supabase 凭据
3. 数据以 JSONB 格式存储，支持复杂的嵌套结构
4. 每个页面的数据相互独立，通过 `document_type` 区分
