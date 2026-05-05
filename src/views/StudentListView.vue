<template>
  <div class="student-list-container">
    <div class="list-header">
      <h1>学生档案管理</h1>
      <button class="btn btn-primary" @click="createNew">
        ➕ 创建新学生档案
      </button>
    </div>

    <!-- 统计信息 -->
    <div v-if="stats" class="stats-card">
      <div class="stat-item">
        <span class="stat-label">学生档案</span>
        <span class="stat-value">{{ stats.student_profiles }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">媒体文件</span>
        <span class="stat-value">{{ stats.student_media }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">文档</span>
        <span class="stat-value">{{ stats.student_documents }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已保存文档</span>
        <span class="stat-value">{{ stats.saved_documents }}</span>
      </div>
    </div>

    <!-- 搜索和过滤 -->
    <div class="search-bar">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="搜索学号或姓名..."
        class="search-input"
      />
      <select v-model="filterMajor" class="filter-select">
        <option value="">全部专业</option>
        <option value="计算机科学">计算机科学</option>
        <option value="软件工程">软件工程</option>
        <option value="数据科学">数据科学</option>
        <option value="其他">其他</option>
      </select>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      ⏳ 加载中...
    </div>

    <!-- 错误消息 -->
    <div v-if="errorMessage" class="alert alert-error">
      ❌ {{ errorMessage }}
    </div>

    <!-- 学生列表 -->
    <div v-if="!loading && filteredStudents.length > 0" class="students-grid">
      <div 
        v-for="student in filteredStudents" 
        :key="student.id"
        class="student-card"
      >
        <div class="student-header">
          <div class="student-photo">
            <img 
              v-if="student.photo_url" 
              :src="student.photo_url" 
              :alt="student.student_name"
            />
            <div v-else class="photo-placeholder">
              📷
            </div>
          </div>
          <div class="student-info">
            <h3>{{ student.student_name }}</h3>
            <p class="student-id">ID: {{ student.student_id }}</p>
          </div>
        </div>

        <div class="student-details">
          <div class="detail-row">
            <span class="label">学院:</span>
            <span class="value">{{ student.college || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">专业:</span>
            <span class="value">{{ student.major || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">邮箱:</span>
            <span class="value">{{ student.email || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">电话:</span>
            <span class="value">{{ student.phone || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">入学:</span>
            <span class="value">{{ formatDate(student.enrollment_date) }}</span>
          </div>
        </div>

        <div class="student-actions">
          <button class="btn btn-small btn-primary" @click="editStudent(student)">
            ✏️ 编辑
          </button>
          <button class="btn btn-small btn-danger" @click="deleteStudent(student)">
            🗑️ 删除
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredStudents.length === 0" class="empty-state">
      <p>📭 没有找到学生档案</p>
      <button class="btn btn-primary" @click="createNew">
        创建第一个学生档案
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllStudentProfiles, getDataStats } from '@/utils/cockroachdbService'

const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const students = ref<any[]>([])
const stats = ref<any>(null)
const searchQuery = ref('')
const filterMajor = ref('')

// 过滤学生列表
const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchSearch = 
      student.student_name.includes(searchQuery.value) ||
      student.student_id.includes(searchQuery.value)
    
    const matchMajor = !filterMajor.value || student.major === filterMajor.value
    
    return matchSearch && matchMajor
  })
})

// 加载数据
onMounted(async () => {
  await loadStudents()
  await loadStats()
})

// 加载学生列表
async function loadStudents() {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const result = await getAllStudentProfiles()
    
    if (result.error) {
      errorMessage.value = `加载失败: ${result.error}`
    } else {
      students.value = result.data || []
    }
  } catch (error: any) {
    errorMessage.value = `加载失败: ${error.message}`
  } finally {
    loading.value = false
  }
}

// 加载统计信息
async function loadStats() {
  try {
    const statsData = await getDataStats()
    if (statsData) {
      stats.value = statsData
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

// 创建新学生
function createNew() {
  router.push('/student-form')
}

// 编辑学生
function editStudent(student: any) {
  router.push(`/student-form/${student.student_id}`)
}

// 删除学生（示例，实际中应有确认）
async function deleteStudent(student: any) {
  if (confirm(`确定要删除 ${student.student_name} 的档案吗？`)) {
    // TODO: 实现删除逻辑
    console.log('删除:', student.id)
  }
}

// 格式化日期
function formatDate(dateString: string | undefined) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.student-list-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.list-header h1 {
  color: white;
  font-size: 2rem;
  margin: 0;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.stat-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.search-input,
.filter-select {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}

.loading {
  text-align: center;
  color: white;
  font-size: 1.2rem;
  padding: 3rem;
}

.alert {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
}

.student-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.student-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.student-header {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.student-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  font-size: 2rem;
}

.student-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.student-info h3 {
  margin: 0;
  font-size: 1.2rem;
}

.student-id {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.student-details {
  flex: 1;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.detail-row .label {
  font-weight: 600;
  color: #667eea;
}

.detail-row .value {
  color: #666;
  text-align: right;
}

.student-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #f9f9f9;
}

.btn-small {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-small.btn-primary {
  background: #667eea;
  color: white;
}

.btn-small.btn-primary:hover {
  background: #5568d3;
}

.btn-small.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-small.btn-danger:hover {
  background: #c0392b;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: white;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.empty-state p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}
</style>
