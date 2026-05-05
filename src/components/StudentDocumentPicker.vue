<template>
  <div class="student-document-picker">
    <button class="picker-btn" @click="showModal = true" :title="title">
      <span class="btn-icon">📁</span>
      <span>{{ buttonText }}</span>
    </button>

    <!-- 选择弹窗 -->
    <div v-if="showModal" class="picker-modal-overlay" @click="showModal = false">
      <div class="picker-modal" @click.stop>
        <div class="picker-header">
          <h3>从资料管理选择文档</h3>
          <button class="close-btn" @click="showModal = false">✕</button>
        </div>

        <div class="picker-body">
          <!-- 面包屑导航 -->
          <div class="breadcrumb-nav">
            <span 
              class="breadcrumb-item root"
              @click="navigateToRoot"
            >
              🏠 全部学生
            </span>
            <template v-if="selectedStudent">
              <span class="breadcrumb-separator">›</span>
              <span 
                class="breadcrumb-item"
                :class="{ active: !currentFolder }"
                @click="navigateToStudent"
              >
                {{ selectedStudent.studentName }}
              </span>
            </template>
            <template v-for="(folder, index) in folderBreadcrumbs" :key="folder.id">
              <span class="breadcrumb-separator">›</span>
              <span 
                class="breadcrumb-item"
                :class="{ active: index === folderBreadcrumbs.length - 1 }"
                @click="navigateToFolder(folder)"
              >
                {{ folder.name }}
              </span>
            </template>
          </div>

          <!-- 搜索栏 -->
          <div class="search-bar">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索文件夹或文档名称..."
              class="search-input"
            />
          </div>

          <!-- 学生选择（根目录） -->
          <div v-if="!selectedStudent" class="content-area">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              加载中...
            </div>
            <div v-else-if="filteredStudents.length === 0" class="empty-state">
              <div class="empty-icon">📁</div>
              <p>暂无学生档案</p>
            </div>
            <div v-else class="folder-grid">
              <div 
                v-for="student in filteredStudents" 
                :key="student.studentId"
                class="folder-card"
                @click="selectStudent(student)"
              >
                <div class="folder-icon">📂</div>
                <div class="folder-info">
                  <h4>{{ student.studentName }}</h4>
                  <p>{{ student.documents.length }} 份文档 · {{ student.subfolders?.length || 0 }} 个文件夹</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 文件夹和文档列表 -->
          <div v-else class="content-area">
            <!-- 新建文件夹按钮 -->
            <div class="action-bar">
              <button class="action-btn" @click="showNewFolderDialog = true">
                📁 新建文件夹
              </button>
            </div>

            <!-- 子文件夹 -->
            <div v-if="currentSubfolders.length > 0" class="section">
              <h5 class="section-title">📁 文件夹</h5>
              <div class="folder-grid">
                <div 
                  v-for="folder in currentSubfolders" 
                  :key="folder.id"
                  class="folder-card"
                  @click="enterFolder(folder)"
                >
                  <div class="folder-icon">📂</div>
                  <div class="folder-info">
                    <h4>{{ folder.name }}</h4>
                    <p>{{ getFolderItemCount(folder.id) }} 个项目</p>
                  </div>
                  <button class="folder-menu-btn" @click.stop="showFolderMenu(folder, $event)">⋮</button>
                </div>
              </div>
            </div>

            <!-- 文档列表 -->
            <div v-if="currentDocuments.length > 0" class="section">
              <h5 class="section-title">📄 文件</h5>
              <div class="document-grid">
                <div 
                  v-for="doc in currentDocuments" 
                  :key="doc.id"
                  class="document-card"
                  :class="{ 'selected': selectedDocument?.id === doc.id }"
                  @click="selectDocument(doc)"
                >
                  <div class="document-icon">
                    {{ getDocumentIcon(doc.document_name) }}
                  </div>
                  <div class="document-info">
                    <h4 :title="doc.document_name">{{ doc.document_name }}</h4>
                    <p>{{ formatFileSize(doc.file_size) }} · {{ formatDate(doc.created_at) }}</p>
                  </div>
                  <div class="document-actions">
                    <button class="preview-btn" @click.stop="openPreview(doc)" title="预览">👁️</button>
                    <button class="download-btn" @click.stop="downloadDocument(doc)" title="下载">⬇️</button>
                  </div>
                  <div v-if="selectedDocument?.id === doc.id" class="check-mark">✓</div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="currentSubfolders.length === 0 && currentDocuments.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>此文件夹为空</p>
              <p class="empty-hint">点击"新建文件夹"创建子文件夹</p>
            </div>
          </div>
        </div>

        <div class="picker-footer">
          <button class="cancel-btn" @click="showModal = false">取消</button>
          <button 
            class="confirm-btn" 
            :disabled="!selectedDocument"
            @click="confirmSelection"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>

    <!-- 新建文件夹对话框 -->
    <div v-if="showNewFolderDialog" class="dialog-overlay" @click="showNewFolderDialog = false">
      <div class="dialog" @click.stop>
        <h4>新建文件夹</h4>
        <input 
          v-model="newFolderName" 
          type="text" 
          placeholder="请输入文件夹名称"
          class="dialog-input"
          @keyup.enter="createFolder"
        />
        <div class="dialog-actions">
          <button class="cancel-btn" @click="showNewFolderDialog = false">取消</button>
          <button class="confirm-btn" @click="createFolder" :disabled="!newFolderName.trim()">创建</button>
        </div>
      </div>
    </div>

    <!-- 文件夹菜单 -->
    <div 
      v-if="folderMenuVisible" 
      class="folder-menu"
      :style="{ top: folderMenuPosition.y + 'px', left: folderMenuPosition.x + 'px' }"
      @click.stop
    >
      <button @click="renameSelectedFolder">✏️ 重命名</button>
      <button @click="deleteSelectedFolder" class="danger">🗑️ 删除</button>
    </div>

    <!-- 文件预览模态框 -->
    <div v-if="showPreviewModal" class="preview-modal-overlay" @click="closePreview">
      <div class="preview-modal" @click.stop>
        <div class="preview-header">
          <h3>{{ previewingDocument?.document_name }}</h3>
          <div class="preview-header-actions">
            <button class="preview-action-btn" @click="downloadPreviewDocument" title="下载">
              ⬇️ 下载
            </button>
            <button class="close-btn" @click="closePreview">✕</button>
          </div>
        </div>
        <div class="preview-content">
          <!-- 图片预览 -->
          <img 
            v-if="isImageFile(previewingDocument?.document_name)" 
            :src="previewingDocument?.file_url" 
            :alt="previewingDocument?.document_name"
            class="preview-image"
          />
          <!-- PDF预览 -->
          <iframe 
            v-else-if="isPdfFile(previewingDocument?.document_name)"
            :src="`https://docs.google.com/viewer?url=${encodeURIComponent(previewingDocument?.file_url || '')}&embedded=true`"
            class="preview-pdf"
            frameborder="0"
          ></iframe>
          <!-- 其他文件类型 -->
          <div v-else class="preview-unsupported">
            <div class="file-icon-large">{{ getDocumentIcon(previewingDocument?.document_name || '') }}</div>
            <p>{{ previewingDocument?.document_name }}</p>
            <p class="hint">此文件类型不支持在线预览</p>
            <button class="download-large-btn" @click="downloadPreviewDocument">
              ⬇️ 下载文件
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'

interface StudentDocument {
  id: string
  student_id: string
  student_name: string
  document_type: string
  document_name: string
  file_url: string
  file_size?: number
  created_at: string
  folder_id?: string
}

interface DocFolder {
  id: string
  name: string
  parentId: string | null
  studentId: string
  createdAt: string
}

interface StudentFolder {
  studentId: string
  studentName: string
  documents: StudentDocument[]
  subfolders?: DocFolder[]
}

const props = withDefaults(defineProps<{
  buttonText?: string
  title?: string
  accept?: string[]
}>(), {
  buttonText: '从资料管理选择',
  title: '从资料管理选择文档',
  accept: () => []
})

const emit = defineEmits<{
  (e: 'select', doc: StudentDocument): void
}>()

const showModal = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const allDocuments = ref<StudentDocument[]>([])
const allFolders = ref<DocFolder[]>([])
const selectedStudent = ref<StudentFolder | null>(null)
const selectedDocument = ref<StudentDocument | null>(null)
const currentFolder = ref<DocFolder | null>(null)

// 新建文件夹
const showNewFolderDialog = ref(false)
const newFolderName = ref('')

// 文件夹菜单
const folderMenuVisible = ref(false)
const folderMenuPosition = ref({ x: 0, y: 0 })
const selectedFolderForMenu = ref<DocFolder | null>(null)

// 文件预览
const showPreviewModal = ref(false)
const previewingDocument = ref<StudentDocument | null>(null)

// 按学生分组
const studentFolders = computed(() => {
  const folderMap = new Map<string, StudentFolder>()
  
  allDocuments.value.forEach(doc => {
    const key = doc.student_id
    if (!folderMap.has(key)) {
      folderMap.set(key, {
        studentName: doc.student_name || doc.student_id,
        studentId: doc.student_id,
        documents: [],
        subfolders: []
      })
    }
    
    const folder = folderMap.get(key)!
    folder.documents.push(doc)
  })

  // 添加文件夹信息
  allFolders.value.forEach(folder => {
    const studentFolder = folderMap.get(folder.studentId)
    if (studentFolder) {
      if (!studentFolder.subfolders) studentFolder.subfolders = []
      if (!folder.parentId) {
        studentFolder.subfolders.push(folder)
      }
    }
  })
  
  return Array.from(folderMap.values())
})

// 过滤学生
const filteredStudents = computed(() => {
  if (!searchQuery.value) return studentFolders.value
  
  const query = searchQuery.value.toLowerCase()
  return studentFolders.value.filter(s => 
    s.studentName.toLowerCase().includes(query) ||
    s.studentId.toLowerCase().includes(query)
  )
})

// 当前子文件夹
const currentSubfolders = computed(() => {
  if (!selectedStudent.value) return []
  
  const parentId = currentFolder.value?.id || null
  return allFolders.value.filter(f => 
    f.studentId === selectedStudent.value!.studentId && 
    f.parentId === parentId
  )
})

// 当前文档
const currentDocuments = computed(() => {
  if (!selectedStudent.value) return []
  
  let docs = selectedStudent.value.documents.filter(doc => {
    const docFolderId = doc.folder_id || null
    const currentFolderId = currentFolder.value?.id || null
    return docFolderId === currentFolderId
  })
  
  // 按文件类型过滤
  if (props.accept && props.accept.length > 0) {
    docs = docs.filter(doc => {
      const ext = doc.document_name.split('.').pop()?.toLowerCase() || ''
      return props.accept.includes(ext)
    })
  }
  
  // 按搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    docs = docs.filter(d => d.document_name.toLowerCase().includes(query))
  }
  
  return docs
})

// 面包屑导航
const folderBreadcrumbs = computed(() => {
  const breadcrumbs: DocFolder[] = []
  let current = currentFolder.value
  
  while (current) {
    breadcrumbs.unshift(current)
    current = allFolders.value.find(f => f.id === current!.parentId) || null
  }
  
  return breadcrumbs
})

// 加载所有文档
const loadDocuments = async () => {
  if (!supabase) return
  
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('student_documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    allDocuments.value = data || []
    
    // 加载文件夹
    loadFolders()
  } catch (error) {
    console.error('加载文档失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载文件夹（从 localStorage）
const loadFolders = () => {
  try {
    // 使用与 StudentDocumentsGallery 相同的 key
    const saved = localStorage.getItem('studentDocSubfolders')
    if (saved) {
      allFolders.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载文件夹失败:', e)
  }
}

// 保存文件夹
const saveFolders = () => {
  // 使用与 StudentDocumentsGallery 相同的 key
  localStorage.setItem('studentDocSubfolders', JSON.stringify(allFolders.value))
}

// 导航函数
const navigateToRoot = () => {
  selectedStudent.value = null
  currentFolder.value = null
  selectedDocument.value = null
}

const navigateToStudent = () => {
  currentFolder.value = null
  selectedDocument.value = null
}

const navigateToFolder = (folder: DocFolder) => {
  currentFolder.value = folder
  selectedDocument.value = null
}

const selectStudent = (student: StudentFolder) => {
  selectedStudent.value = student
  currentFolder.value = null
  selectedDocument.value = null
}

const enterFolder = (folder: DocFolder) => {
  currentFolder.value = folder
  selectedDocument.value = null
}

const selectDocument = (doc: StudentDocument) => {
  selectedDocument.value = doc
}

const confirmSelection = () => {
  if (selectedDocument.value) {
    emit('select', selectedDocument.value)
    showModal.value = false
    selectedStudent.value = null
    currentFolder.value = null
    selectedDocument.value = null
  }
}

// 文件预览功能
const openPreview = (doc: StudentDocument) => {
  previewingDocument.value = doc
  showPreviewModal.value = true
}

const closePreview = () => {
  showPreviewModal.value = false
  previewingDocument.value = null
}

const downloadDocument = async (doc: StudentDocument) => {
  try {
    const response = await fetch(doc.file_url)
    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = doc.document_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败，请重试')
  }
}

const downloadPreviewDocument = () => {
  if (previewingDocument.value) {
    downloadDocument(previewingDocument.value)
  }
}

const isImageFile = (fileName?: string): boolean => {
  if (!fileName) return false
  const ext = fileName.toLowerCase().split('.').pop()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext || '')
}

const isPdfFile = (fileName?: string): boolean => {
  if (!fileName) return false
  return fileName.toLowerCase().endsWith('.pdf')
}

// 创建文件夹
const createFolder = () => {
  if (!newFolderName.value.trim() || !selectedStudent.value) return
  
  const newFolder: DocFolder = {
    id: `folder_${Date.now()}`,
    name: newFolderName.value.trim(),
    parentId: currentFolder.value?.id || null,
    studentId: selectedStudent.value.studentId,
    createdAt: new Date().toISOString()
  }
  
  allFolders.value.push(newFolder)
  saveFolders()
  
  newFolderName.value = ''
  showNewFolderDialog.value = false
}

// 文件夹菜单
const showFolderMenu = (folder: DocFolder, event: MouseEvent) => {
  selectedFolderForMenu.value = folder
  folderMenuPosition.value = { x: event.clientX, y: event.clientY }
  folderMenuVisible.value = true
}

const closeFolderMenu = () => {
  folderMenuVisible.value = false
  selectedFolderForMenu.value = null
}

const renameSelectedFolder = () => {
  if (!selectedFolderForMenu.value) return
  
  const newName = prompt('请输入新名称', selectedFolderForMenu.value.name)
  if (newName && newName.trim()) {
    selectedFolderForMenu.value.name = newName.trim()
    saveFolders()
  }
  closeFolderMenu()
}

const deleteSelectedFolder = () => {
  if (!selectedFolderForMenu.value) return
  
  if (confirm(`确定要删除文件夹"${selectedFolderForMenu.value.name}"吗？`)) {
    const deleteRecursive = (folderId: string) => {
      // 删除子文件夹
      const subFolders = allFolders.value.filter(f => f.parentId === folderId)
      subFolders.forEach(sf => deleteRecursive(sf.id))
      
      // 删除文件夹
      const index = allFolders.value.findIndex(f => f.id === folderId)
      if (index !== -1) {
        allFolders.value.splice(index, 1)
      }
    }
    
    deleteRecursive(selectedFolderForMenu.value.id)
    saveFolders()
  }
  closeFolderMenu()
}

const getFolderItemCount = (folderId: string): number => {
  const docs = allDocuments.value.filter(d => d.folder_id === folderId).length
  const subfolders = allFolders.value.filter(f => f.parentId === folderId).length
  return docs + subfolders
}

// 工具函数
const getDocumentIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const iconMap: Record<string, string> = {
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'xls': '📗',
    'xlsx': '📗',
    'ppt': '📙',
    'pptx': '📙',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'mp4': '🎬',
    'avi': '🎬',
    'mov': '🎬',
    'mp3': '🎵',
    'wav': '🎵',
    'zip': '📦',
    'rar': '📦',
    '7z': '📦',
    'txt': '📝'
  }
  return iconMap[ext] || '📄'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return ''
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 点击外部关闭菜单
const handleClickOutside = () => {
  if (folderMenuVisible.value) {
    closeFolderMenu()
  }
}

// 生命周期
watch(showModal, (val) => {
  if (val) {
    loadDocuments()
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.student-document-picker {
  display: inline-block;
}

.picker-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.picker-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  font-size: 16px;
}

.picker-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.picker-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.picker-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.picker-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

/* 面包屑导航 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  margin-bottom: 16px;
}

.breadcrumb-item {
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.breadcrumb-item:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.breadcrumb-item.root {
  font-weight: 500;
}

.breadcrumb-item.active {
  color: #667eea;
  font-weight: 600;
  cursor: default;
}

.breadcrumb-item.active:hover {
  background: transparent;
}

.breadcrumb-separator {
  color: #9ca3af;
  font-size: 14px;
}

.search-bar {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.content-area {
  min-height: 300px;
}

.action-bar {
  margin-bottom: 16px;
}

.action-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
  border-color: #667eea;
  color: #667eea;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.folder-grid,
.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.folder-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.folder-card:hover {
  background: #fef9c3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(253, 224, 71, 0.3);
}

.folder-icon {
  font-size: 32px;
}

.folder-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #1f2937;
}

.folder-info p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.folder-menu-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.folder-card:hover .folder-menu-btn {
  opacity: 1;
}

.folder-menu-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.document-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  position: relative;
}

.document-card:hover {
  background: #f3f4f6;
  border-color: #667eea;
}

.document-card.selected {
  background: #ede9fe;
  border-color: #8b5cf6;
}

.document-icon {
  font-size: 28px;
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-info p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.check-mark {
  width: 24px;
  height: 24px;
  background: #8b5cf6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

/* 文档操作按钮 */
.document-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.document-card:hover .document-actions {
  opacity: 1;
}

.preview-btn,
.download-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  background: rgba(139, 92, 246, 0.1);
}

.preview-btn:hover,
.download-btn:hover {
  background: rgba(139, 92, 246, 0.2);
  transform: scale(1.1);
}

/* 文件预览模态框 */
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.preview-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.preview-header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.preview-action-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.preview-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.preview-content {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f9fafb;
  min-height: 400px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.preview-pdf {
  width: 100%;
  height: 70vh;
  border: none;
  border-radius: 8px;
}

.preview-unsupported {
  text-align: center;
  padding: 40px;
}

.file-icon-large {
  font-size: 64px;
  margin-bottom: 16px;
}

.preview-unsupported p {
  margin: 8px 0;
  color: #374151;
}

.preview-unsupported .hint {
  color: #9ca3af;
  font-size: 14px;
}

.download-large-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.download-large-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-hint {
  font-size: 13px;
  margin-top: 8px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.dialog h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1f2937;
}

.dialog-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.dialog-input:focus {
  outline: none;
  border-color: #667eea;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 文件夹菜单 */
.folder-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 1200;
  min-width: 120px;
}

.folder-menu button {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  border-radius: 6px;
  transition: background 0.2s;
}

.folder-menu button:hover {
  background: #f3f4f6;
}

.folder-menu button.danger {
  color: #ef4444;
}

.folder-menu button.danger:hover {
  background: #fef2f2;
}
</style>
