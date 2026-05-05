# CockroachDB 迁移技术参考

## 快速参考：如何在现有视图中使用 CockroachDB 服务

### 方案 1: 使用 cockroachdbService（推荐）

这是最直接和类型安全的方式：

```typescript
import { getAllStudentProfiles, saveStudentProfile, getDataStats } from '@/utils/cockroachdbService'

export default {
  async setup() {
    // 获取所有学生
    const result = await getAllStudentProfiles()
    const students = result.data || []
    
    // 保存学生信息（创建或更新）
    const saveResult = await saveStudentProfile({
      student_id: '2024001',
      student_name: '张三',
      email: 'zhangsan@example.com',
      phone: '+1234567890',
      school: '清华大学',
      college: '计算机学院',
      major: '计算机科学',
      enrollment_date: '2024-09-01',
      expected_graduation: '2028-06-30',
      photo_url: 'https://example.com/photo.jpg'
    })
    
    if (saveResult.success) {
      console.log('保存成功')
    }
    
    // 获取统计信息
    const stats = await getDataStats()
    console.log(`学生总数: ${stats.student_profiles}`)
    
    return { students }
  }
}
```

### 方案 2: 使用 Supabase 兼容 API

如果需要保持与现有 Supabase 代码的兼容，使用包装的 API：

```typescript
import { cockroachdb } from '@/lib/cockroachdb'

// 查询数据
const { data, error } = await cockroachdb
  .from('student_profiles')
  .select('*')
  .order('created_at', { ascending: false })

// 插入数据
const { data: newRecord, error: insertError } = await cockroachdb
  .from('student_profiles')
  .insert([{ 
    student_name: '李四',
    student_id: '2024002'
  }])

// 更新数据
const { error: updateError } = await cockroachdb
  .from('student_profiles')
  .update({ student_name: '新名字' })
  .eq('id', 'uuid-value')

// 删除数据
const { error: deleteError } = await cockroachdb
  .from('student_profiles')
  .delete()
  .eq('id', 'uuid-value')
```

---

## 核心 API 参考

### cockroachdbService 方法

#### 学生信息

```typescript
// 获取所有学生
getAllStudentProfiles(): Promise<ServiceResult<StudentProfile[]>>

// 获取单个学生
getStudentProfile(studentId: string): Promise<ServiceResult<StudentProfile>>

// 创建或更新学生
saveStudentProfile(data: Partial<StudentProfile>): Promise<ServiceResult<StudentProfile>>

// 删除学生
deleteStudentProfile(studentId: string): Promise<ServiceResult<void>>
```

**StudentProfile 类型**:
```typescript
interface StudentProfile {
  id: string (UUID)
  student_id: string (学号)
  student_name: string (学生姓名)
  email: string (电子邮箱)
  phone: string (电话号码)
  school: string (学校)
  college: string (学院)
  major: string (专业)
  enrollment_date: string (入学日期)
  expected_graduation: string (预期毕业日期)
  photo_url: string (照片 URL)
  created_at: string (创建时间)
  updated_at: string (更新时间)
}
```

#### 媒体文件

```typescript
// 获取学生媒体
getStudentMedia(studentId: string, options?: QueryOptions): Promise<ServiceResult<StudentMedia[]>>

// 创建媒体记录
createMediaRecord(data: CreateMediaInput): Promise<ServiceResult<StudentMedia>>

// 删除媒体文件
deleteMediaFile(mediaId: string): Promise<ServiceResult<void>>
```

#### 文档

```typescript
// 获取学生文档
getStudentDocuments(studentId: string): Promise<ServiceResult<StudentDocument[]>>

// 创建文档记录
createDocumentRecord(data: CreateDocumentInput): Promise<ServiceResult<StudentDocument>>

// 删除文档
deleteDocument(docId: string): Promise<ServiceResult<void>>
```

#### 已保存的表单

```typescript
// 获取已保存的表单
getSavedDocuments(userId: string): Promise<ServiceResult<SavedDocument[]>>

// 保存新表单
saveSavedDocument(data: CreateSavedDocInput): Promise<ServiceResult<SavedDocument>>
```

#### 统计信息

```typescript
// 获取数据统计
getDataStats(): Promise<DataStats>

// 返回:
interface DataStats {
  student_profiles: number
  student_media: number
  student_documents: number
  saved_documents: number
}
```

---

## 在 Vue 组件中的使用示例

### 示例 1: 学生列表组件

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAllStudentProfiles, deleteStudentProfile } from '@/utils/cockroachdbService'
import { useRouter } from 'vue-router'

const router = useRouter()
const students = ref([])
const searchQuery = ref('')
const loading = ref(false)

const filteredStudents = computed(() => {
  return students.value.filter(student => 
    student.student_name.includes(searchQuery.value) ||
    student.student_id.includes(searchQuery.value)
  )
})

async function loadStudents() {
  loading.value = true
  try {
    const result = await getAllStudentProfiles()
    if (result.success) {
      students.value = result.data || []
    } else {
      console.error('加载失败:', result.error)
    }
  } finally {
    loading.value = false
  }
}

async function handleDelete(studentId: string) {
  if (confirm('确定要删除此学生吗？')) {
    const result = await deleteStudentProfile(studentId)
    if (result.success) {
      loadStudents() // 重新加载列表
    }
  }
}

function handleEdit(studentId: string) {
  router.push({ 
    name: 'student-form-edit', 
    params: { studentId } 
  })
}

onMounted(() => {
  loadStudents()
})
</script>

<template>
  <div>
    <h1>学生列表</h1>
    
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        placeholder="搜索学号或姓名"
        type="text"
      />
    </div>
    
    <div v-if="loading" class="loading">正在加载...</div>
    
    <div v-else-if="filteredStudents.length === 0" class="empty">
      没有找到学生
    </div>
    
    <div v-else class="student-grid">
      <div 
        v-for="student in filteredStudents" 
        :key="student.id"
        class="student-card"
      >
        <h3>{{ student.student_name }}</h3>
        <p>学号: {{ student.student_id }}</p>
        <p>邮箱: {{ student.email }}</p>
        <p>专业: {{ student.major }}</p>
        
        <div class="actions">
          <button @click="handleEdit(student.id)">编辑</button>
          <button @click="handleDelete(student.id)" class="danger">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.student-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
}

button.danger {
  background-color: #dc3545;
}
</style>
```

### 示例 2: 学生表单组件

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { saveStudentProfile, getStudentProfile } from '@/utils/cockroachdbService'

const route = useRoute()
const router = useRouter()

const form = ref({
  student_id: '',
  student_name: '',
  email: '',
  phone: '',
  school: '',
  college: '',
  major: '',
  enrollment_date: '',
  expected_graduation: '',
  photo_url: ''
})

const isEditMode = computed(() => !!route.params.studentId)
const loading = ref(false)
const message = ref({ type: '', text: '' })

async function loadStudent() {
  if (!isEditMode.value) return
  
  loading.value = true
  const studentId = route.params.studentId as string
  const result = await getStudentProfile(studentId)
  
  if (result.success && result.data) {
    form.value = { ...form.value, ...result.data }
  }
  loading.value = false
}

async function submitForm() {
  loading.value = true
  try {
    const result = await saveStudentProfile(form.value)
    
    if (result.success) {
      message.value = { 
        type: 'success', 
        text: isEditMode.value ? '学生信息已更新' : '学生已创建' 
      }
      
      setTimeout(() => {
        router.push({ name: 'student-list' })
      }, 1500)
    } else {
      message.value = { 
        type: 'error', 
        text: result.error || '保存失败' 
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStudent()
})
</script>

<template>
  <div class="form-container">
    <h1>{{ isEditMode ? '编辑学生' : '新建学生' }}</h1>
    
    <div v-if="message.text" :class="['message', message.type]">
      {{ message.text }}
    </div>
    
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label>学号</label>
        <input 
          v-model="form.student_id"
          :disabled="isEditMode"
          required
        />
      </div>
      
      <div class="form-group">
        <label>姓名</label>
        <input 
          v-model="form.student_name"
          required
        />
      </div>
      
      <div class="form-group">
        <label>邮箱</label>
        <input 
          v-model="form.email"
          type="email"
        />
      </div>
      
      <div class="form-group">
        <label>电话</label>
        <input 
          v-model="form.phone"
        />
      </div>
      
      <div class="form-group">
        <label>学校</label>
        <input 
          v-model="form.school"
        />
      </div>
      
      <div class="form-group">
        <label>学院</label>
        <input 
          v-model="form.college"
        />
      </div>
      
      <div class="form-group">
        <label>专业</label>
        <input 
          v-model="form.major"
        />
      </div>
      
      <div class="form-group">
        <label>入学日期</label>
        <input 
          v-model="form.enrollment_date"
          type="date"
        />
      </div>
      
      <div class="form-group">
        <label>预期毕业日期</label>
        <input 
          v-model="form.expected_graduation"
          type="date"
        />
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? '保存中...' : (isEditMode ? '更新' : '创建') }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.message {
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
```

---

## 从 Supabase 迁移检查清单

如果项目中还有其他使用 Supabase 的代码，使用以下清单逐步迁移：

### 第 1 步: 识别 Supabase 使用
```bash
# 在项目中搜索 Supabase 导入
grep -r "from '@/lib/supabase'" src/
grep -r "import.*supabase" src/
```

### 第 2 步: 更新导入

**文件**: `src/views/StudentIDView.vue` (如果存在的话)
```typescript
// ❌ 旧方式
import { supabase } from '@/lib/supabase'

// ✅ 新方式
import { getAllStudentProfiles, saveStudentProfile } from '@/utils/cockroachdbService'
```

### 第 3 步: 更新 API 调用

**从 Supabase 迁移到 CockroachDB**:

```typescript
// ❌ 旧 Supabase 代码
async function loadProfiles() {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) console.error(error)
  return data
}

// ✅ 新 CockroachDB 代码
async function loadProfiles() {
  const result = await getAllStudentProfiles()
  return result.data || []
}
```

### 第 4 步: 更新认证

**认证使用**:
```typescript
// ❌ 旧方式（Supabase Auth）
import { useAuthStore } from '@/stores/auth'

// ✅ 新方式（CockroachDB Auth）
import { useAuthStore } from '@/stores/auth-new'
```

有关完整的迁移大纲，请参见 `COCKROACHDB_MIGRATION_COMPLETE.md`。

---

## 性能优化提示

### 1. 使用查询选项过滤和排序
```typescript
const result = await cockroachdb.query(`
  SELECT * FROM student_profiles 
  WHERE major = $1 
  ORDER BY created_at DESC 
  LIMIT $2 OFFSET $3`,
  [major, limit, offset]
)
```

### 2. 实现分页
```typescript
const pageSize = 20
const page = 1
const offset = (page - 1) * pageSize

const result = await cockroachdb.query(`
  SELECT * FROM student_profiles 
  LIMIT $1 OFFSET $2`,
  [pageSize, offset]
)
```

### 3. 缓存频繁查询的数据
```typescript
import { ref, computed } from 'vue'

const statsCache = ref(null)
const statsCacheTime = ref(null)

async function getDataStats() {
  const now = Date.now()
  
  // 5分钟缓存
  if (statsCache.value && now - statsCacheTime.value < 5 * 60 * 1000) {
    return statsCache.value
  }
  
  const stats = await cockroachdbService.getDataStats()
  statsCache.value = stats
  statsCacheTime.value = now
  
  return stats
}
```

---

## 故障排除和调试

### 启用查询日志
在 `src/lib/cockroachdb.ts` 中：
```typescript
async query(sql: string, params?: any[]): Promise<QueryResult> {
  console.log('SQL:', sql)
  console.log('Params:', params)
  
  try {
    const result = await client.query(sql, params)
    console.log('Result rows:', result.rows.length)
    return result
  } catch (error) {
    console.error('Query error:', error)
    throw error
  }
}
```

### 检查数据类型
```typescript
// 确保传入的数据类型正确
const profile = {
  student_id: String(data.student_id),  // 确保是字符串
  phone: data.phone || null,             // 处理空值
  enrollment_date: new Date(data.enrollment_date).toISOString(), // ISO 日期格式
}
```

### 验证数据库连接
```bash
# 在终端中测试
psql "postgresql://xhuni:password@tall-clam-21927.j77.cockroachlabs.cloud:26257/xn1?sslmode=verify-full" -c "SELECT version();"
```

---

## 扩展指南

### 添加新表
1. 在 CockroachDB 中创建表
2. 在 `src/types/index.ts` 中定义 TypeScript 类型
3. 在 `src/utils/cockroachdbService.ts` 中添加服务方法
4. 在组件中使用新服务

### 添加新字段到现有表
```sql
-- 在 CockroachDB 中执行
ALTER TABLE student_profiles ADD COLUMN new_field VARCHAR(255);
```

然后更新 TypeScript 类型和服务方法。

---

## 相关文档

- 📖 [完整迁移总结](./COCKROACHDB_MIGRATION_COMPLETE.md)
- 📚 [CockroachDB 官方文档](https://www.cockroachlabs.com/docs)
- 🐘 [PostgreSQL 文档](https://www.postgresql.org/docs)
- 🔐 [认证系统详情](./COCKROACHDB_MIGRATION_COMPLETE.md#-认证系统)

---

**最后更新**: 2026-02-13  
**版本**: 1.0
