<template>
  <div class="student-form-container">
    <div class="form-wrapper">
      <h1>{{ isEditMode ? '编辑学生档案' : '创建新学生档案' }}</h1>
      
      <form @submit.prevent="submitForm">
        <!-- 基本信息部分 -->
        <fieldset>
          <legend>基本信息</legend>
          
          <div class="form-group">
            <label for="student_id">学号 <span class="required">*</span></label>
            <input 
              id="student_id"
              v-model="form.student_id" 
              type="text" 
              required 
              placeholder="请输入学号"
              :disabled="isEditMode"
            />
          </div>

          <div class="form-group">
            <label for="student_name">姓名 <span class="required">*</span></label>
            <input 
              id="student_name"
              v-model="form.student_name" 
              type="text" 
              required 
              placeholder="请输入学生姓名"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">邮箱</label>
              <input 
                id="email"
                v-model="form.email" 
                type="email" 
                placeholder="请输入邮箱地址"
              />
            </div>

            <div class="form-group">
              <label for="phone">电话</label>
              <input 
                id="phone"
                v-model="form.phone" 
                type="tel" 
                placeholder="请输入电话号码"
              />
            </div>
          </div>
        </fieldset>

        <!-- 学位信息部分 -->
        <fieldset>
          <legend>学位信息</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="school">学校</label>
              <input 
                id="school"
                v-model="form.school" 
                type="text" 
                placeholder="请输入学校名称"
              />
            </div>

            <div class="form-group">
              <label for="college">学院</label>
              <input 
                id="college"
                v-model="form.college" 
                type="text" 
                placeholder="请输入学院名称"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="major">专业</label>
              <input 
                id="major"
                v-model="form.major" 
                type="text" 
                placeholder="请输入专业"
              />
            </div>

            <div class="form-group">
              <label for="enrollment_date">入学日期</label>
              <input 
                id="enrollment_date"
                v-model="form.enrollment_date" 
                type="date"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="expected_graduation">预期毕业日期</label>
            <input 
              id="expected_graduation"
              v-model="form.expected_graduation" 
              type="date"
            />
          </div>
        </fieldset>

        <!-- 照片部分 -->
        <fieldset>
          <legend>个人照片</legend>
          
          <div class="form-group">
            <label for="photo_url">照片 URL</label>
            <input 
              id="photo_url"
              v-model="form.photo_url" 
              type="url" 
              placeholder="请输入照片 URL"
            />
            
            <div v-if="form.photo_url" class="photo-preview">
              <img :src="form.photo_url" :alt="form.student_name" />
            </div>
          </div>
        </fieldset>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '处理中...' : (isEditMode ? '更新' : '创建') }}
          </button>
          <button type="button" class="btn btn-secondary" @click="resetForm">
            重置
          </button>
          <button type="button" class="btn btn-cancel" @click="goBack">
            返回
          </button>
        </div>

        <!-- 错误和成功消息 -->
        <div v-if="successMessage" class="alert alert-success">
          ✅ {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="alert alert-error">
          ❌ {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getStudentProfile, saveStudentProfile } from '@/utils/cockroachdbService'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isEditMode = ref(false)

const form = reactive({
  id: '',
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

// 初始化表单
onMounted(async () => {
  const studentId = route.params.studentId as string
  
  if (studentId) {
    isEditMode.value = true
    await loadStudentData(studentId)
  }
})

// 加载学生数据
async function loadStudentData(studentId: string) {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const result = await getStudentProfile(studentId)
    
    if (result.data) {
      const student = result.data
      form.id = student.id
      form.student_id = student.student_id
      form.student_name = student.student_name
      form.email = student.email || ''
      form.phone = student.phone || ''
      form.school = student.school || ''
      form.college = student.college || ''
      form.major = student.major || ''
      form.enrollment_date = student.enrollment_date || ''
      form.expected_graduation = student.expected_graduation || ''
      form.photo_url = student.photo_url || ''
    } else {
      errorMessage.value = '无法加载学生数据'
    }
  } catch (error: any) {
    errorMessage.value = `加载失败: ${error.message}`
  } finally {
    loading.value = false
  }
}

// 提交表单
async function submitForm() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    // 验证必填字段
    if (!form.student_id || !form.student_name) {
      errorMessage.value = '请填写所有必填字段'
      loading.value = false
      return
    }
    
    const result = await saveStudentProfile({
      ...form,
      id: form.id || undefined
    })
    
    if (result.error) {
      errorMessage.value = `保存失败: ${result.error}`
    } else {
      successMessage.value = `学生档案${isEditMode.value ? '更新' : '创建'}成功！`
      
      // 2 秒后返回列表页面
      setTimeout(() => {
        router.push('/student-list')
      }, 2000)
    }
  } catch (error: any) {
    errorMessage.value = `操作失败: ${error.message}`
  } finally {
    loading.value = false
  }
}

// 重置表单
function resetForm() {
  form.student_id = ''
  form.student_name = ''
  form.email = ''
  form.phone = ''
  form.school = ''
  form.college = ''
  form.major = ''
  form.enrollment_date = ''
  form.expected_graduation = ''
  form.photo_url = ''
  errorMessage.value = ''
  successMessage.value = ''
}

// 返回
function goBack() {
  router.back()
}
</script>

<style scoped>
.student-form-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.form-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 800px;
}

h1 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

fieldset {
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

legend {
  color: #667eea;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0 1rem;
  margin-left: -1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

label {
  color: #333;
  font-weight: 500;
  font-size: 0.95rem;
}

.required {
  color: #e74c3c;
}

input {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.photo-preview {
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
  max-width: 300px;
}

.photo-preview img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-cancel {
  background-color: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-cancel:hover {
  background-color: #f5f8ff;
}

.alert {
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  font-weight: 500;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
