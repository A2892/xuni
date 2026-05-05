<template>
  <div class="photo-selector">
    <button class="selector-trigger" @click="showModal = true">
      <span v-if="!selectedPhoto" class="trigger-placeholder">
        📸 从照片库选择
      </span>
      <div v-else class="trigger-preview">
        <img :src="selectedPhoto.url" :alt="selectedPhoto.fileName" />
        <span class="trigger-filename">{{ selectedPhoto.fileName }}</span>
      </div>
    </button>

    <!-- 模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ props.modalTitle || '选择照片' }}</h3>
          <button class="close-btn" @click="showModal = false">✕</button>
        </div>

        <div class="modal-body">
          <!-- 面包屑导航 -->
          <div class="breadcrumb-nav">
            <span 
              class="breadcrumb-item root"
              :class="{ active: !currentStudentId }"
              @click="navigateToRoot"
            >
              🏠 全部学生
            </span>
            <template v-if="currentStudentId">
              <span class="breadcrumb-separator">›</span>
              <span 
                class="breadcrumb-item"
                :class="{ active: !currentFolder }"
                @click="navigateToStudent"
              >
                {{ currentStudentName }}
              </span>
            </template>
            <template v-for="(crumb, index) in folderBreadcrumbs" :key="crumb.id">
              <span class="breadcrumb-separator">›</span>
              <span 
                class="breadcrumb-item"
                :class="{ active: index === folderBreadcrumbs.length - 1 }"
                @click="navigateToFolder(crumb)"
              >
                {{ crumb.name }}
              </span>
            </template>
          </div>

          <!-- 搜索 -->
          <div class="search-section">
            <input 
              v-model="searchQuery"
              type="text" 
              :placeholder="currentStudentId ? '搜索照片...' : '搜索学生姓名或学号...'"
              class="search-input"
            />
            <div v-if="!currentStudentId && studentId" class="filter-tabs">
              <button 
                :class="['filter-tab', { active: filterType === 'all' }]"
                @click="filterType = 'all'"
              >
                全部照片
              </button>
              <button 
                :class="['filter-tab', { active: filterType === 'student' }]"
                @click="filterToCurrentStudent"
              >
                当前学生
              </button>
            </div>
          </div>

          <!-- 显示所有照片模式 -->
          <div v-if="props.showAllPhotos" class="content-view">
            <div v-if="allPhotos.length > 0" class="section">
              <div class="photo-grid">
                <div 
                  v-for="photo in allPhotos" 
                  :key="photo.id"
                  :class="['photo-item', { selected: selectedPhotoId === photo.id }]"
                  @click="selectPhoto(photo)"
                >
                  <img :src="photo.url" :alt="photo.fileName" />
                  <div class="photo-overlay">
                    <div class="photo-info">
                      <p class="photo-name">{{ photo.fileName }}</p>
                    </div>
                    <div v-if="selectedPhotoId === photo.id" class="selected-badge">
                      ✓ 已选择
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📷</div>
              <p>暂无学生照片</p>
              <p class="empty-hint">请先到"学生照片"页面上传照片</p>
            </div>
          </div>

          <!-- 学生文件夹列表（根目录） -->
          <div v-else-if="!currentStudentId" class="folder-view">
            <div v-if="filteredStudentFolders.length > 0" class="folder-grid">
              <div 
                v-for="student in filteredStudentFolders" 
                :key="student.studentId"
                class="folder-card"
                @click="enterStudentFolder(student)"
              >
                <div class="folder-icon">📂</div>
                <div class="folder-info">
                  <h4>{{ student.studentName }}</h4>
                  <p>{{ student.photoCount }} 张照片</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📁</div>
              <p>{{ searchQuery ? '未找到匹配的学生' : '照片库中还没有照片' }}</p>
              <p class="empty-hint">请先到"学生照片"页面上传照片</p>
            </div>
          </div>

          <!-- 文件夹内容视图 -->
          <div v-else class="content-view">
            <!-- 子文件夹列表 -->
            <div v-if="currentSubfolders.length > 0" class="section">
              <h5 class="section-title">📁 文件夹</h5>
              <div class="folder-grid small">
                <div 
                  v-for="folder in currentSubfolders" 
                  :key="folder.id"
                  class="folder-card small"
                  @click="enterFolder(folder)"
                >
                  <div class="folder-icon">📂</div>
                  <div class="folder-info">
                    <h4>{{ folder.name }}</h4>
                    <p>{{ getFolderItemCount(folder.id) }} 个项目</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 照片网格 -->
            <div v-if="currentPhotos.length > 0" class="section">
              <h5 v-if="currentSubfolders.length > 0" class="section-title">🖼️ 照片</h5>
              <div class="photo-grid">
                <div 
                  v-for="photo in currentPhotos" 
                  :key="photo.id"
                  :class="['photo-item', { selected: selectedPhotoId === photo.id }]"
                  @click="selectPhoto(photo)"
                >
                  <img :src="photo.url" :alt="photo.fileName" />
                  <div class="photo-overlay">
                    <div class="photo-info">
                      <p class="photo-name">{{ photo.fileName }}</p>
                    </div>
                    <div v-if="selectedPhotoId === photo.id" class="selected-badge">
                      ✓ 已选择
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="currentSubfolders.length === 0 && currentPhotos.length === 0" class="empty-state">
              <div class="empty-icon">📷</div>
              <p>{{ searchQuery ? '未找到匹配的照片' : '此文件夹中没有照片' }}</p>
              <p class="empty-hint">{{ searchQuery ? '尝试使用其他关键词' : '请先上传照片' }}</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showModal = false">
            取消
          </button>
          <button 
            class="btn-primary" 
            @click="confirmSelection"
            :disabled="!selectedPhotoId"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMediaStore } from '@/stores/media'
import type { MediaItem, MediaFolder } from '@/types/media'

interface Props {
  modelValue?: string
  studentId?: string
  showAllPhotos?: boolean
  modalTitle?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'photo-selected', photo: MediaItem): void
}

interface StudentFolderInfo {
  studentId: string
  studentName: string
  photoCount: number
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const mediaStore = useMediaStore()
const showModal = ref(false)
const searchQuery = ref('')
const filterType = ref<'all' | 'student'>('all')
const selectedPhotoId = ref<string>('')

// 文件夹导航状态
const currentStudentId = ref<string | null>(null)
const currentStudentName = ref<string>('')
const currentFolder = ref<MediaFolder | null>(null)

// 加载媒体文件
onMounted(async () => {
  // 强制重新加载数据
  mediaStore.isLoaded = false
  await mediaStore.loadMediaItems()
  mediaStore.loadFoldersFromLocal()
  console.log('PhotoSelector loaded:', mediaStore.items.length, 'items')
})

// 当前选中的照片
const selectedPhoto = computed(() => {
  if (!props.modelValue) return null
  return mediaStore.items.find(item => item.url === props.modelValue)
})

// 所有照片（用于 showAllPhotos 模式）
const allPhotos = computed((): MediaItem[] => {
  let photos = mediaStore.items.filter(item => item.type === 'photo')
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    photos = photos.filter(p => 
      p.fileName.toLowerCase().includes(query) ||
      (p.studentName && p.studentName.toLowerCase().includes(query)) ||
      (p.studentId && p.studentId.toLowerCase().includes(query))
    )
  }
  
  return photos
})

// 按学生分组的文件夹列表
const studentFoldersList = computed((): StudentFolderInfo[] => {
  const folderMap = new Map<string, StudentFolderInfo>()
  
  // 包含有 studentId 或 studentName 的照片
  mediaStore.items
    .filter(item => item.type === 'photo' && (item.studentId || item.studentName))
    .forEach(item => {
      // 使用 studentName 作为主键，因为它更可靠
      const key = item.studentName || item.studentId || 'unknown'
      if (!folderMap.has(key)) {
        folderMap.set(key, {
          studentId: item.studentId || item.studentName || '',
          studentName: item.studentName || item.studentId || '未知学生',
          photoCount: 0
        })
      }
      folderMap.get(key)!.photoCount++
    })
  
  return Array.from(folderMap.values()).sort((a, b) => 
    a.studentName.localeCompare(b.studentName, 'zh-CN')
  )
})

// 过滤后的学生文件夹
const filteredStudentFolders = computed(() => {
  if (!searchQuery.value) return studentFoldersList.value
  
  const query = searchQuery.value.toLowerCase()
  return studentFoldersList.value.filter(s => 
    s.studentName.toLowerCase().includes(query) ||
    s.studentId.toLowerCase().includes(query)
  )
})

// 当前子文件夹
const currentSubfolders = computed((): MediaFolder[] => {
  if (!currentStudentId.value) return []
  
  const parentId = currentFolder.value?.id || null
  return mediaStore.folders.filter(f => 
    (f.studentId === currentStudentId.value || f.studentName === currentStudentName.value) && 
    (parentId ? f.parentId === parentId : !f.parentId)
  )
})

// 当前照片列表
const currentPhotos = computed((): MediaItem[] => {
  if (!currentStudentId.value && !currentStudentName.value) return []
  
  let photos = mediaStore.items.filter(item => {
    if (item.type !== 'photo') return false
    
    // 匹配学生ID或学生名称
    const matchId = currentStudentId.value && item.studentId === currentStudentId.value
    const matchName = currentStudentName.value && item.studentName === currentStudentName.value
    const matchIdAsName = currentStudentId.value && item.studentName === currentStudentId.value
    const matchNameAsId = currentStudentName.value && item.studentId === currentStudentName.value
    
    return matchId || matchName || matchIdAsName || matchNameAsId
  })
  
  // 按文件夹过滤
  const currentFolderId = currentFolder.value?.id || null
  photos = photos.filter(p => (p.folderId || null) === currentFolderId)
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    photos = photos.filter(p => 
      p.fileName.toLowerCase().includes(query)
    )
  }
  
  console.log('currentPhotos:', photos.length, 'for student:', currentStudentName.value)
  return photos
})

// 面包屑导航
const folderBreadcrumbs = computed((): MediaFolder[] => {
  const breadcrumbs: MediaFolder[] = []
  let current = currentFolder.value
  
  while (current) {
    breadcrumbs.unshift(current)
    current = mediaStore.folders.find(f => f.id === current!.parentId) || null
  }
  
  return breadcrumbs
})

// 获取文件夹项目数量
const getFolderItemCount = (folderId: string): number => {
  const photos = mediaStore.items.filter(i => i.folderId === folderId).length
  const subfolders = mediaStore.folders.filter(f => f.parentId === folderId).length
  return photos + subfolders
}

// 导航函数
const navigateToRoot = () => {
  currentStudentId.value = null
  currentStudentName.value = ''
  currentFolder.value = null
  searchQuery.value = ''
}

const navigateToStudent = () => {
  currentFolder.value = null
  searchQuery.value = ''
}

const navigateToFolder = (folder: MediaFolder) => {
  const breadcrumbIndex = folderBreadcrumbs.value.findIndex(f => f.id === folder.id)
  if (breadcrumbIndex < folderBreadcrumbs.value.length - 1) {
    currentFolder.value = folder
  }
}

const enterStudentFolder = (student: StudentFolderInfo) => {
  console.log('进入学生文件夹:', student.studentName, student.studentId)
  currentStudentId.value = student.studentId || student.studentName
  currentStudentName.value = student.studentName
  currentFolder.value = null
  searchQuery.value = ''
}

const enterFolder = (folder: MediaFolder) => {
  currentFolder.value = folder
}

const filterToCurrentStudent = () => {
  filterType.value = 'student'
  if (props.studentId) {
    const student = studentFoldersList.value.find(s => s.studentId === props.studentId)
    if (student) {
      enterStudentFolder(student)
    }
  }
}

const selectPhoto = (photo: MediaItem) => {
  selectedPhotoId.value = photo.id
}

const confirmSelection = () => {
  const photo = mediaStore.items.find(item => item.id === selectedPhotoId.value)
  if (photo) {
    emit('update:modelValue', photo.url)
    emit('photo-selected', photo)
    showModal.value = false
  }
}
</script>

<style scoped>
.photo-selector {
  width: 100%;
}

.selector-trigger {
  width: 100%;
  min-height: 120px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selector-trigger:hover {
  border-color: #4B6EF5;
  background: #f0f4ff;
}

.trigger-placeholder {
  font-size: 16px;
  color: #666;
}

.trigger-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.trigger-preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.trigger-filename {
  flex: 1;
  font-size: 14px;
  color: #333;
  text-align: left;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
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
  padding: 20px 24px;
}

/* 面包屑导航 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.breadcrumb-item {
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

.breadcrumb-item:hover {
  background: #e9ecef;
  color: #4B6EF5;
}

.breadcrumb-item.active {
  font-weight: 600;
  color: #4B6EF5;
  cursor: default;
}

.breadcrumb-item.root {
  font-weight: 500;
}

.breadcrumb-separator {
  color: #adb5bd;
  font-size: 14px;
}

/* 搜索 */
.search-section {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #4B6EF5;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #f5f5f5;
}

.filter-tab.active {
  background: #4B6EF5;
  color: white;
  border-color: #4B6EF5;
}

/* 文件夹网格 */
.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.folder-grid.small {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.folder-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.folder-card:hover {
  border-color: #4B6EF5;
  background: #f0f4ff;
  transform: translateY(-2px);
}

.folder-card.small {
  padding: 12px;
}

.folder-icon {
  font-size: 32px;
}

.folder-card.small .folder-icon {
  font-size: 24px;
}

.folder-info h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.folder-card.small .folder-info h4 {
  font-size: 14px;
}

.folder-info p {
  margin: 0;
  font-size: 13px;
  color: #888;
}

/* 区块标题 */
.section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

/* 照片网格 */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.photo-item {
  position: relative;
  aspect-ratio: 3/4;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.photo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.photo-item.selected {
  border-color: #4B6EF5;
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.2);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 24px 8px 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-item:hover .photo-overlay,
.photo-item.selected .photo-overlay {
  opacity: 1;
}

.photo-info {
  font-size: 12px;
  color: white;
}

.photo-name {
  margin: 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #4B6EF5;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 8px 0;
  font-size: 16px;
}

.empty-hint {
  font-size: 14px !important;
  color: #bbb !important;
}

/* 底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary,
.btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4B6EF5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3d5cd4;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .folder-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
}
</style>
