<template>
  <div class="student-profile-page">
    <!-- 直接显示文档管理 -->
    <div class="documents-view">
      <StudentDocumentsGallery />
    </div>

    <!-- 旧的文档管理视图（已弃用） -->
    <div v-if="false" class="old-documents-view">
      <div class="toolbar">
        <div class="filters">
          <select v-model="selectedStudentFilter" class="filter-select">
            <option value="">所有学生</option>
            <option v-for="profile in profiles" :key="profile.id" :value="profile.student_id">
              {{ profile.student_name }} ({{ profile.student_id }})
            </option>
          </select>
          <select v-model="selectedTypeFilter" class="filter-select">
            <option value="">所有类型</option>
            <option v-for="(label, type) in DOCUMENT_TYPE_LABELS" :key="type" :value="type">
              {{ label }}
            </option>
          </select>
          <select v-model="selectedStatusFilter" class="filter-select">
            <option value="">所有状态</option>
            <option value="draft">草稿</option>
            <option value="completed">已完成</option>
            <option value="archived">已归档</option>
          </select>
        </div>
        <div class="toolbar-right">
          <button 
            :class="['btn-group-toggle', { active: groupByStudent }]"
            @click="groupByStudent = !groupByStudent"
          >
            👥 {{ groupByStudent ? '取消分组' : '按学生分组' }}
          </button>
          <button class="btn-primary" @click="showCreateDocument = true">
            ➕ 添加文档
          </button>
        </div>
      </div>

      <!-- 按学生分组视图 -->
      <div v-if="groupByStudent && groupedDocuments.length > 0" class="student-document-groups">
        <div v-for="group in groupedDocuments" :key="group.studentId" class="student-doc-group">
          <div class="group-header">
            <div class="group-title">
              <div class="group-avatar">
                <img v-if="group.profile?.photo_url" :src="group.profile.photo_url" :alt="group.studentName" />
                <span v-else class="avatar-placeholder">{{ group.studentName.charAt(0) }}</span>
              </div>
              <div>
                <h3>{{ group.studentName }}</h3>
                <span class="group-student-id">学号: {{ group.studentId }}</span>
              </div>
            </div>
            <div class="group-stats">
              <span class="group-stat">📄 {{ group.totalDocs }} 份文档</span>
              <span v-if="group.draftCount > 0" class="group-stat draft">📝 {{ group.draftCount }} 草稿</span>
              <span v-if="group.completedCount > 0" class="group-stat completed">✅ {{ group.completedCount }} 已完成</span>
              <span v-if="group.archivedCount > 0" class="group-stat archived">📦 {{ group.archivedCount }} 已归档</span>
            </div>
          </div>
          
          <div class="group-documents">
            <div 
              v-for="doc in group.documents" 
              :key="doc.id"
              class="document-card"
            >
              <div class="doc-icon">
                {{ getDocumentIcon(doc.document_type) }}
              </div>
              <div class="doc-info">
                <h4>{{ doc.document_name }}</h4>
                <div class="doc-meta">
                  <span class="doc-type">{{ DOCUMENT_TYPE_LABELS[doc.document_type] }}</span>
                  <span>·</span>
                  <span>{{ formatDate(doc.updated_at) }}</span>
                </div>
                <div v-if="doc.tags && doc.tags.length" class="doc-tags">
                  <span v-for="tag in doc.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
              <div class="doc-status">
                <span :class="['status-badge', doc.status]">
                  {{ getStatusLabel(doc.status) }}
                </span>
              </div>
              <div class="doc-actions">
                <button class="btn-icon" @click="viewDocument(doc)" title="查看">
                  👁️
                </button>
                <button class="btn-icon" @click="editDocument(doc)" title="编辑">
                  ✏️
                </button>
                <button class="btn-icon danger" @click="deleteDocument(doc.id)" title="删除">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 普通列表视图 -->
      <div v-else-if="filteredDocuments.length > 0" class="documents-list">
        <div 
          v-for="doc in filteredDocuments" 
          :key="doc.id"
          class="document-card"
        >
          <div class="doc-icon">
            {{ getDocumentIcon(doc.document_type) }}
          </div>
          <div class="doc-info">
            <h4>{{ doc.document_name }}</h4>
            <div class="doc-meta">
              <span class="doc-type">{{ DOCUMENT_TYPE_LABELS[doc.document_type] }}</span>
              <span>·</span>
              <span>{{ doc.student_name }} ({{ doc.student_id }})</span>
              <span>·</span>
              <span>{{ formatDate(doc.updated_at) }}</span>
            </div>
            <div v-if="doc.tags && doc.tags.length" class="doc-tags">
              <span v-for="tag in doc.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
          <div class="doc-status">
            <span :class="['status-badge', doc.status]">
              {{ getStatusLabel(doc.status) }}
            </span>
          </div>
          <div class="doc-actions">
            <button class="btn-icon" @click="viewDocument(doc)" title="查看">
              👁️
            </button>
            <button class="btn-icon" @click="editDocument(doc)" title="编辑">
              ✏️
            </button>
            <button class="btn-icon danger" @click="deleteDocument(doc.id)" title="删除">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📄</div>
        <p>没有找到文档</p>
        <button class="btn-primary" @click="showCreateDocument = true">
          添加第一份文档
        </button>
      </div>
    </div>

    <!-- 创建/编辑学生档案模态框 -->
    <div v-if="showCreateProfile || selectedProfile" class="modal-overlay" @click="closeProfileModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedProfile ? '编辑学生档案' : '新建学生档案' }}</h3>
          <button class="close-btn" @click="closeProfileModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-field">
              <label>姓名 *</label>
              <input v-model="profileForm.student_name" type="text" placeholder="张三" />
            </div>
            <div class="form-field">
              <label>学号 *</label>
              <input v-model="profileForm.student_id" type="text" placeholder="2024001001" :disabled="!!selectedProfile" />
            </div>
            <div class="form-field">
              <label>专业</label>
              <input v-model="profileForm.major" type="text" placeholder="计算机科学与技术" />
            </div>
            <div class="form-field">
              <label>学院</label>
              <input v-model="profileForm.school" type="text" placeholder="计算机学院" />
            </div>
            <div class="form-field">
              <label>邮箱</label>
              <input v-model="profileForm.email" type="email" placeholder="student@example.com" />
            </div>
            <div class="form-field">
              <label>电话</label>
              <input v-model="profileForm.phone" type="tel" placeholder="13800138000" />
            </div>
            <div class="form-field">
              <label>入学日期</label>
              <input v-model="profileForm.enrollment_date" type="date" />
            </div>
            <div class="form-field">
              <label>预计毕业日期</label>
              <input v-model="profileForm.expected_graduation" type="date" />
            </div>
            <div class="form-field full-width">
              <label>学生照片</label>
              <PhotoSelector 
                v-model="profileForm.photo_url"
                :student-id="profileForm.student_id"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeProfileModal">取消</button>
          <button class="btn-primary" @click="saveProfile" :disabled="!profileForm.student_name || !profileForm.student_id">
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑文档模态框 -->
    <div v-if="showCreateDocument || selectedDocument" class="modal-overlay" @click="closeDocumentModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedDocument ? '编辑文档' : '添加文档' }}</h3>
          <button class="close-btn" @click="closeDocumentModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-field">
              <label>学生 *</label>
              <select v-model="documentForm.student_id" @change="updateStudentName" :disabled="!!selectedDocument">
                <option value="">选择学生</option>
                <option v-for="profile in profiles" :key="profile.id" :value="profile.student_id">
                  {{ profile.student_name }} ({{ profile.student_id }})
                </option>
              </select>
            </div>
            <div class="form-field">
              <label>文档类型 *</label>
              <select v-model="documentForm.document_type">
                <option value="">选择类型</option>
                <option v-for="(label, type) in DOCUMENT_TYPE_LABELS" :key="type" :value="type">
                  {{ label }}
                </option>
              </select>
            </div>
            <div class="form-field full-width">
              <label>文档名称 *</label>
              <input v-model="documentForm.document_name" type="text" placeholder="2024年春季学期在读证明" />
            </div>
            <div class="form-field">
              <label>状态</label>
              <select v-model="documentForm.status">
                <option value="draft">草稿</option>
                <option value="completed">已完成</option>
                <option value="archived">已归档</option>
              </select>
            </div>
            <div class="form-field full-width">
              <label>标签（用逗号分隔）</label>
              <input v-model="tagsInput" type="text" placeholder="2024,春季,在读" />
            </div>
            <div class="form-field full-width">
              <label>备注</label>
              <textarea v-model="documentForm.notes" rows="3" placeholder="添加备注信息"></textarea>
            </div>
            <div class="form-field full-width">
              <label>上传文档文件</label>
              <input type="file" @change="handleDocumentFileUpload" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              <p v-if="documentForm.file_url" class="file-info">
                已上传: <a :href="documentForm.file_url" target="_blank">查看文件</a>
              </p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDocumentModal">取消</button>
          <button class="btn-primary" @click="saveDocument" :disabled="!isDocumentFormValid">
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 查看文档详情模态框 -->
    <div v-if="viewingDocument" class="modal-overlay" @click="viewingDocument = null">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ viewingDocument.document_name }}</h3>
          <button class="close-btn" @click="viewingDocument = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="document-details">
            <div class="detail-row">
              <span class="label">文档类型:</span>
              <span>{{ DOCUMENT_TYPE_LABELS[viewingDocument.document_type] }}</span>
            </div>
            <div class="detail-row">
              <span class="label">学生:</span>
              <span>{{ viewingDocument.student_name }} ({{ viewingDocument.student_id }})</span>
            </div>
            <div class="detail-row">
              <span class="label">状态:</span>
              <span :class="['status-badge', viewingDocument.status]">
                {{ getStatusLabel(viewingDocument.status) }}
              </span>
            </div>
            <div v-if="viewingDocument.tags && viewingDocument.tags.length" class="detail-row">
              <span class="label">标签:</span>
              <div class="tags-display">
                <span v-for="tag in viewingDocument.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <div v-if="viewingDocument.notes" class="detail-row">
              <span class="label">备注:</span>
              <p>{{ viewingDocument.notes }}</p>
            </div>
            <div class="detail-row">
              <span class="label">创建时间:</span>
              <span>{{ formatDate(viewingDocument.created_at) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">更新时间:</span>
              <span>{{ formatDate(viewingDocument.updated_at) }}</span>
            </div>
            <div v-if="viewingDocument.file_url" class="detail-row">
              <span class="label">文档文件:</span>
              <a :href="viewingDocument.file_url" target="_blank" class="file-link">
                📎 查看文件
              </a>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="viewingDocument = null">关闭</button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:visible="showDeleteDocDialog"
      type="danger"
      title="确认删除文档"
      message="确定要删除这份文档吗？此操作不可恢复。"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="handleDeleteDocConfirmed"
      @cancel="showDeleteDocDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StudentDocumentsGallery from '@/components/StudentDocumentsGallery.vue'
import type { StudentProfile, StudentDocument } from '@/types/student'
import { DOCUMENT_TYPE_LABELS } from '@/types/student'
import {
  getAllStudentProfiles,
  getStudentDocuments,
  saveStudentProfile,
  saveStudentDocument,
  deleteStudentDocument,
  uploadDocumentFile
} from '@/utils/studentProfileService'
import { supabase } from '@/lib/supabase'
import PhotoSelector from '@/components/PhotoSelector.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const activeMainTab = ref<'profiles' | 'documents'>('profiles')
const searchQuery = ref('')
const selectedStudentFilter = ref('')
const selectedTypeFilter = ref('')
const selectedStatusFilter = ref('')
const groupByStudent = ref(false)

const profiles = ref<StudentProfile[]>([])
const documents = ref<StudentDocument[]>([])
const documentCounts = ref<Record<string, number>>({})

const showCreateProfile = ref(false)
const showCreateDocument = ref(false)
const selectedProfile = ref<StudentProfile | null>(null)
const selectedDocument = ref<StudentDocument | null>(null)
const viewingDocument = ref<StudentDocument | null>(null)
const showDeleteDocDialog = ref(false)
const docIdToDelete = ref('')

const profileForm = ref({
  student_id: '',
  student_name: '',
  email: '',
  phone: '',
  photo_url: '',
  major: '',
  school: '',
  enrollment_date: '',
  expected_graduation: ''
})

const documentForm = ref({
  student_id: '',
  student_name: '',
  document_type: '' as StudentDocument['document_type'] | '',
  document_name: '',
  file_url: '',
  status: 'draft' as StudentDocument['status'],
  tags: [] as string[],
  notes: ''
})

const tagsInput = ref('')
const uploadingFile = ref(false)

// 加载数据
onMounted(async () => {
  await loadProfiles()
  await loadAllDocuments()
})

const loadProfiles = async () => {
  profiles.value = await getAllStudentProfiles()
  // 统计每个学生的文档数量
  for (const profile of profiles.value) {
    const docs = await getStudentDocuments(profile.student_id)
    documentCounts.value[profile.student_id] = docs.length
  }
}

const loadAllDocuments = async () => {
  const allDocs: StudentDocument[] = []
  for (const profile of profiles.value) {
    const docs = await getStudentDocuments(profile.student_id)
    allDocs.push(...docs)
  }
  documents.value = allDocs
}

// 过滤
const filteredProfiles = computed(() => {
  if (!searchQuery.value) return profiles.value
  const query = searchQuery.value.toLowerCase()
  return profiles.value.filter(p => 
    p.student_name.toLowerCase().includes(query) ||
    p.student_id.toLowerCase().includes(query)
  )
})

const filteredDocuments = computed(() => {
  let docs = documents.value
  if (selectedStudentFilter.value) {
    docs = docs.filter(d => d.student_id === selectedStudentFilter.value)
  }
  if (selectedTypeFilter.value) {
    docs = docs.filter(d => d.document_type === selectedTypeFilter.value)
  }
  if (selectedStatusFilter.value) {
    docs = docs.filter(d => d.status === selectedStatusFilter.value)
  }
  return docs
})

const groupedDocuments = computed(() => {
  const groups = new Map<string, StudentDocument[]>()
  
  filteredDocuments.value.forEach(doc => {
    const key = doc.student_id
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(doc)
  })
  
  return Array.from(groups.entries())
    .map(([studentId, docs]) => {
      const profile = profiles.value.find(p => p.student_id === studentId)
      return {
        studentId,
        studentName: docs[0].student_name,
        profile,
        documents: docs.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ),
        totalDocs: docs.length,
        draftCount: docs.filter(d => d.status === 'draft').length,
        completedCount: docs.filter(d => d.status === 'completed').length,
        archivedCount: docs.filter(d => d.status === 'archived').length
      }
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName, 'zh-CN'))
})

const isDocumentFormValid = computed(() => {
  return documentForm.value.student_id && 
         documentForm.value.document_type && 
         documentForm.value.document_name
})

// 操作
const selectProfile = (profile: StudentProfile) => {
  selectedProfile.value = profile
  profileForm.value = {
    student_id: profile.student_id,
    student_name: profile.student_name,
    email: profile.email || '',
    phone: profile.phone || '',
    photo_url: profile.photo_url || '',
    major: profile.major || '',
    school: profile.school || '',
    enrollment_date: profile.enrollment_date || '',
    expected_graduation: profile.expected_graduation || ''
  }
}

const closeProfileModal = () => {
  showCreateProfile.value = false
  selectedProfile.value = null
  profileForm.value = {
    student_id: '',
    student_name: '',
    email: '',
    phone: '',
    photo_url: '',
    major: '',
    school: '',
    enrollment_date: '',
    expected_graduation: ''
  }
}

const saveProfile = async () => {
  const result = await saveStudentProfile(profileForm.value)
  if (result.success) {
    await loadProfiles()
    closeProfileModal()
    alert('保存成功！')
  } else {
    alert('保存失败: ' + (result.error?.message || '未知错误'))
  }
}

// 删除学生档案
const deleteProfile = async (profile: StudentProfile) => {
  if (!confirm(`确定要删除学生档案 "${profile.student_name}" 吗？\n\n该学生的所有文档也将被删除。`)) {
    return
  }
  
  try {
    // 删除该学生的所有文档
    const { error: docsError } = await supabase
      .from('student_documents')
      .delete()
      .eq('student_id', profile.student_id)
    
    if (docsError) {
      console.warn('删除文档失败:', docsError)
    }
    
    // 删除学生档案
    const { error: profileError } = await supabase
      .from('student_profiles')
      .delete()
      .eq('id', profile.id)
    
    if (profileError) throw profileError
    
    alert('✅ 学生档案已删除')
    await loadProfiles()
    await loadAllDocuments()
  } catch (error) {
    console.error('删除学生档案失败:', error)
    alert('删除失败，请重试')
  }
}

const updateStudentName = () => {
  const profile = profiles.value.find(p => p.student_id === documentForm.value.student_id)
  if (profile) {
    documentForm.value.student_name = profile.student_name
  }
}

const closeDocumentModal = () => {
  showCreateDocument.value = false
  selectedDocument.value = null
  documentForm.value = {
    student_id: '',
    student_name: '',
    document_type: '',
    document_name: '',
    file_url: '',
    status: 'draft',
    tags: [],
    notes: ''
  }
  tagsInput.value = ''
}

const editDocument = (doc: StudentDocument) => {
  selectedDocument.value = doc
  documentForm.value = {
    student_id: doc.student_id,
    student_name: doc.student_name,
    document_type: doc.document_type,
    document_name: doc.document_name,
    file_url: doc.file_url || '',
    status: doc.status,
    tags: doc.tags || [],
    notes: doc.notes || ''
  }
  tagsInput.value = doc.tags?.join(', ') || ''
}

const saveDocument = async () => {
  const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t)
  const docData = {
    ...documentForm.value,
    tags,
    id: selectedDocument.value?.id
  }
  
  const result = await saveStudentDocument(docData)
  if (result.success) {
    await loadAllDocuments()
    closeDocumentModal()
    alert('保存成功！')
  } else {
    alert('保存失败: ' + (result.error?.message || '未知错误'))
  }
}

const handleDocumentFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!documentForm.value.student_id) {
    alert('请先选择学生')
    return
  }

  uploadingFile.value = true
  try {
    const result = await uploadDocumentFile(
      file, 
      documentForm.value.student_id,
      documentForm.value.document_type || 'other'
    )
    if (result.success && result.url) {
      documentForm.value.file_url = result.url
      alert('文件上传成功！')
    } else {
      alert('文件上传失败')
    }
  } finally {
    uploadingFile.value = false
  }
}

const viewDocument = (doc: StudentDocument) => {
  viewingDocument.value = doc
}

const deleteDocument = async (id: string) => {
  docIdToDelete.value = id
  showDeleteDocDialog.value = true
}

const handleDeleteDocConfirmed = async () => {
  showDeleteDocDialog.value = false
  if (!docIdToDelete.value) return
  
  const result = await deleteStudentDocument(docIdToDelete.value)
  if (result.success) {
    await loadAllDocuments()
  } else {
    alert('删除失败')
  }
  docIdToDelete.value = ''
}

// 工具函数
const getDocumentCount = (studentId: string) => {
  return documentCounts.value[studentId] || 0
}

const getDocumentIcon = (type: StudentDocument['document_type']) => {
  const icons: Record<StudentDocument['document_type'], string> = {
    student_id: '🆔',
    enrollment: '📝',
    transcript: '📊',
    degree: '🎓',
    diploma: '📜',
    scholarship: '🏆',
    recommendation: '✉️',
    internship: '💼',
    admission: '🎉',
    other: '📄'
  }
  return icons[type]
}

const getStatusLabel = (status: StudentDocument['status']) => {
  const labels = {
    draft: '草稿',
    completed: '已完成',
    archived: '已归档'
  }
  return labels[status]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.student-profile-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  margin: 0 0 8px 0;
  color: #333;
}

.page-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.main-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.main-tab {
  flex: 1;
  padding: 12px 20px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.main-tab:hover {
  background: #f5f5f5;
  border-color: #4B6EF5;
  color: #4B6EF5;
}

.main-tab.active {
  background: #4B6EF5;
  color: white;
  border-color: #4B6EF5;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-group-toggle {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-group-toggle:hover {
  border-color: #42b983;
  background: #f0fdf7;
}

.btn-group-toggle.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.student-document-groups {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.student-doc-group {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.student-doc-group .group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.group-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.group-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.group-avatar .avatar-placeholder {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.group-title h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.group-student-id {
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
}

.group-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.group-stat {
  padding: 6px 12px;
  background: #f8f8f8;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.group-stat.draft {
  background: #fff3cd;
  color: #856404;
}

.group-stat.completed {
  background: #d4edda;
  color: #155724;
}

.group-stat.archived {
  background: #e2e3e5;
  color: #383d41;
}

.group-documents {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #4B6EF5;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #4B6EF5;
}

.btn-primary {
  padding: 12px 24px;
  background: #4B6EF5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
  background: #3d5cd4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  padding: 12px 24px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

/* 档案网格 */
.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.profile-actions-top {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.profile-card:hover .profile-actions-top {
  opacity: 1;
}

.btn-icon-small {
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon-small:hover {
  background: #e0e0e0;
}

.btn-icon-small.danger:hover {
  background: #ffebee;
  color: #f44336;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 36px;
  font-weight: 600;
  color: #4B6EF5;
}

.profile-info {
  text-align: center;
}

.profile-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.student-id {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
  font-family: monospace;
}

.major {
  margin: 4px 0;
  font-size: 14px;
  color: #555;
}

.school {
  margin: 4px 0;
  font-size: 13px;
  color: #888;
}

.profile-stats {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.stat {
  font-size: 14px;
  color: #666;
}

/* 文档列表 */
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: box-shadow 0.2s;
}

.document-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.doc-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
}

.doc-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.doc-type {
  color: #4B6EF5;
  font-weight: 500;
}

.doc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.doc-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.draft {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.archived {
  background: #e5e7eb;
  color: #374151;
}

.doc-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e0e0e0;
}

.btn-icon.danger:hover {
  background: #fee2e2;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 16px;
  color: #999;
  margin: 0 0 24px 0;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #4B6EF5;
}

.form-field input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.file-info {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}

.file-link {
  color: #4B6EF5;
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

/* 文档详情 */
.document-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.detail-row .label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .profiles-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .document-card {
    flex-wrap: wrap;
  }
  
  .doc-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
