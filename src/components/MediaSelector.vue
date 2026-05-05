<template>
  <div class="media-selector">
    <button class="selector-trigger" @click="showModal = true" :title="buttonText">
      <span v-if="!selectedMedia" class="trigger-placeholder">
        {{ icon }} {{ buttonText }}
      </span>
      <div v-else class="trigger-preview">
        <img :src="selectedMedia.url" :alt="selectedMedia.fileName" />
        <span class="trigger-filename">{{ selectedMedia.fileName }}</span>
      </div>
    </button>

    <!-- 模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="close-btn" @click="showModal = false">✕</button>
        </div>

        <div class="modal-body">
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
                {{ selectedStudent }}
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

          <!-- 搜索 -->
          <div class="search-section">
            <input 
              v-model="searchQuery"
              type="text" 
              :placeholder="searchPlaceholder"
              class="search-input"
            />
            <div class="filter-tabs">
              <button 
                :class="['filter-tab', { active: filterType === 'all' }]"
                @click="filterType = 'all'"
              >
                全部
              </button>
              <button 
                v-for="typeFilter in availableTypeFilters"
                :key="typeFilter.key"
                :class="['filter-tab', { active: filterType === typeFilter.key }]"
                @click="filterType = typeFilter.key"
              >
                {{ typeFilter.label }}
              </button>
            </div>
          </div>

          <!-- 全部媒体模式（直接显示所有照片） -->
          <div v-if="props.showAllMedia" class="content-area">
            <div v-if="allMediaItems.length > 0" class="media-grid">
              <div 
                v-for="media in allMediaItems" 
                :key="media.id"
                :class="['media-card', { selected: selectedMediaId === media.id }]"
                @click="selectMedia(media)"
              >
                <div class="media-thumb">
                  <img :src="media.url" :alt="media.fileName" />
                </div>
                <div class="media-info">
                  <p class="media-name" :title="media.fileName">{{ media.fileName }}</p>
                </div>
                <div v-if="selectedMediaId === media.id" class="selected-badge">✓</div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📁</div>
              <p>暂无媒体文件</p>
              <p class="empty-hint">请先到"学生照片"页面上传照片</p>
            </div>
          </div>

          <!-- 学生文件夹列表（根目录） -->
          <div v-else-if="!selectedStudent" class="content-area">
            <div v-if="studentFoldersList.length > 0" class="folder-grid">
              <div 
                v-for="student in filteredStudentFolders" 
                :key="student.studentId"
                class="folder-card"
                @click="selectStudentFolder(student)"
              >
                <div class="folder-icon">📂</div>
                <div class="folder-info">
                  <h4>{{ student.studentName }}</h4>
                  <p>{{ student.items.length }} 张照片 · {{ student.subfolders.length }} 个文件夹</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📁</div>
              <p>暂无学生照片</p>
            </div>
          </div>

          <!-- 文件夹和媒体内容 -->
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

            <!-- 媒体网格 -->
            <div v-if="currentMediaItems.length > 0" class="section">
              <h5 class="section-title">🖼️ 照片</h5>
              <div class="media-grid">
                <div 
                  v-for="item in currentMediaItems" 
                  :key="item.id"
                  :class="['media-item', { selected: selectedMediaId === item.id }]"
                  @click="selectMedia(item)"
                >
                  <img :src="item.url" :alt="item.fileName" />
                  <div class="media-overlay">
                    <div class="media-info">
                      <p class="media-name">{{ item.fileName }}</p>
                      <p v-if="item.studentName" class="student-name">{{ item.studentName }}</p>
                    </div>
                    <div v-if="selectedMediaId === item.id" class="selected-badge">
                      ✓ 已选择
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="currentSubfolders.length === 0 && currentMediaItems.length === 0" class="empty-state">
              <div class="empty-icon">{{ emptyIcon }}</div>
              <p>{{ searchQuery ? '未找到匹配的文件' : emptyMessage }}</p>
              <p class="empty-hint">
                {{ searchQuery ? '尝试使用其他关键词' : emptyHint }}
              </p>
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
            :disabled="!selectedMediaId"
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
          <button class="btn-secondary" @click="showNewFolderDialog = false">取消</button>
          <button class="btn-primary" @click="createFolder" :disabled="!newFolderName.trim()">创建</button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMediaStore } from '@/stores/media'
import type { MediaItem, MediaFolder } from '@/types/media'

type MediaType = 'photo' | 'logo' | 'qrcode' | 'barcode' | 'stamp' | 'signature' | 'all'

interface Props {
  modelValue?: string
  type?: MediaType
  studentId?: string
  showAllMedia?: boolean
  buttonText?: string
  modalTitle?: string
  icon?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'media-selected', media: MediaItem): void
}

interface StudentFolderInfo {
  studentId: string
  studentName: string
  items: MediaItem[]
  subfolders: MediaFolder[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'all',
  showAllMedia: false,
  buttonText: '从媒体库选择',
  modalTitle: '选择媒体文件',
  icon: '📁'
})

const emit = defineEmits<Emits>()

const mediaStore = useMediaStore()
const showModal = ref(false)
const searchQuery = ref('')
const filterType = ref<string>('all')
const selectedMediaId = ref<string>('')

// 文件夹层级相关
const selectedStudent = ref<string | null>(null)
const selectedStudentId = ref<string | null>(null)
const currentFolder = ref<MediaFolder | null>(null)
const showNewFolderDialog = ref(false)
const newFolderName = ref('')
const folderMenuVisible = ref(false)
const folderMenuPosition = ref({ x: 0, y: 0 })
const selectedFolderForMenu = ref<MediaFolder | null>(null)

// 类型过滤器配置
const typeFilterConfig: Record<string, { label: string; types: string[] }> = {
  photo: { label: '照片', types: ['photo'] },
  logo: { label: 'Logo', types: ['logo', 'photo'] },
  qrcode: { label: '二维码', types: ['qrcode', 'photo'] },
  barcode: { label: '条形码', types: ['barcode', 'photo'] },
  stamp: { label: '印章', types: ['stamp', 'photo'] },
  signature: { label: '签名', types: ['signature', 'photo'] }
}

// 可用的类型过滤器
const availableTypeFilters = computed(() => {
  if (props.type === 'all') {
    return [
      { key: 'photo', label: '照片' },
      { key: 'logo', label: 'Logo' },
      { key: 'qrcode', label: '二维码' },
      { key: 'barcode', label: '条形码' },
      { key: 'stamp', label: '印章' },
      { key: 'signature', label: '签名' }
    ]
  }
  return []
})

// 搜索占位符
const searchPlaceholder = computed(() => {
  const typeMap: Record<string, string> = {
    photo: '搜索学生照片...',
    logo: '搜索 Logo...',
    qrcode: '搜索二维码...',
    barcode: '搜索条形码...',
    stamp: '搜索印章...',
    signature: '搜索签名...',
    all: '搜索文件名...'
  }
  return typeMap[props.type] || '搜索文件名...'
})

// 空状态图标
const emptyIcon = computed(() => {
  const iconMap: Record<string, string> = {
    photo: '📷',
    logo: '🏢',
    qrcode: '📱',
    barcode: '📊',
    stamp: '🔴',
    signature: '✍️',
    all: '📁'
  }
  return iconMap[props.type] || '📁'
})

// 空状态消息
const emptyMessage = computed(() => {
  const msgMap: Record<string, string> = {
    photo: '此文件夹中还没有照片',
    logo: '还没有上传 Logo',
    qrcode: '还没有上传二维码',
    barcode: '还没有上传条形码',
    stamp: '还没有上传印章',
    signature: '还没有上传签名',
    all: '此文件夹中还没有文件'
  }
  return msgMap[props.type] || '此文件夹中还没有文件'
})

// 空状态提示
const emptyHint = computed(() => {
  return '请先上传相关文件到媒体库'
})

// 加载媒体文件
onMounted(async () => {
  await mediaStore.loadMediaItems()
  mediaStore.loadFoldersFromLocal()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 当前选中的媒体
const selectedMedia = computed(() => {
  if (!props.modelValue) return null
  return mediaStore.items.find(item => item.url === props.modelValue)
})

// 所有媒体项（用于 showAllMedia 模式）
const allMediaItems = computed((): MediaItem[] => {
  let items = mediaStore.items
  
  // 类型过滤
  const typeConfig = typeFilterConfig[props.type]
  if (props.type !== 'all' && typeConfig) {
    const allowedTypes = typeConfig.types
    items = items.filter(item => allowedTypes.includes(item.type))
  }
  
  // filterType 过滤
  const filterConfig = typeFilterConfig[filterType.value]
  if (filterType.value !== 'all' && filterConfig) {
    const allowedTypes = filterConfig.types
    items = items.filter(item => allowedTypes.includes(item.type))
  }
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.fileName.toLowerCase().includes(query) ||
      (item.studentName && item.studentName.toLowerCase().includes(query)) ||
      (item.studentId && item.studentId.toLowerCase().includes(query))
    )
  }
  
  return items
})

// 按学生分组的文件夹列表
const studentFoldersList = computed((): StudentFolderInfo[] => {
  const folderMap = new Map<string, StudentFolderInfo>()
  
  // 先按学生分组媒体项目
  mediaStore.items.forEach(item => {
    if (!item.studentId) return
    
    const key = item.studentId
    if (!folderMap.has(key)) {
      folderMap.set(key, {
        studentId: item.studentId,
        studentName: item.studentName || item.studentId,
        items: [],
        subfolders: []
      })
    }
    
    const folder = folderMap.get(key)!
    folder.items.push(item)
  })
  
  // 添加根级文件夹
  mediaStore.folders
    .filter(f => !f.parentId)
    .forEach(folder => {
      if (folder.studentId && folderMap.has(folder.studentId)) {
        folderMap.get(folder.studentId)!.subfolders.push(folder)
      }
    })
  
  return Array.from(folderMap.values())
})

// 过滤学生文件夹
const filteredStudentFolders = computed(() => {
  if (!searchQuery.value) return studentFoldersList.value
  
  const query = searchQuery.value.toLowerCase()
  return studentFoldersList.value.filter(s => 
    s.studentName.toLowerCase().includes(query) ||
    s.studentId.toLowerCase().includes(query)
  )
})

// 当前子文件夹
const currentSubfolders = computed(() => {
  if (!selectedStudentId.value) return []
  
  const parentId = currentFolder.value?.id || null
  return mediaStore.folders.filter(f => 
    f.studentId === selectedStudentId.value && 
    f.parentId === parentId
  )
})

// 当前媒体项目
const currentMediaItems = computed(() => {
  if (!selectedStudentId.value) return []
  
  let items = mediaStore.items.filter(item => item.studentId === selectedStudentId.value)
  
  // 按文件夹过滤
  const currentFolderId = currentFolder.value?.id || null
  items = items.filter(item => (item.folderId || null) === currentFolderId)
  
  // 按类型过滤
  if (props.type !== 'all') {
    const config = typeFilterConfig[props.type]
    if (config) {
      items = items.filter(item => config.types.includes(item.type))
    }
  } else if (filterType.value !== 'all') {
    const config = typeFilterConfig[filterType.value]
    if (config) {
      items = items.filter(item => config.types.includes(item.type))
    }
  }
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.fileName.toLowerCase().includes(query)
    )
  }
  
  return items
})

// 面包屑导航
const folderBreadcrumbs = computed(() => {
  const breadcrumbs: MediaFolder[] = []
  let current = currentFolder.value
  
  while (current) {
    breadcrumbs.unshift(current)
    current = mediaStore.folders.find(f => f.id === current!.parentId) || null
  }
  
  return breadcrumbs
})

// 导航函数
const navigateToRoot = () => {
  selectedStudent.value = null
  selectedStudentId.value = null
  currentFolder.value = null
  selectedMediaId.value = ''
}

const navigateToStudent = () => {
  currentFolder.value = null
  selectedMediaId.value = ''
}

const navigateToFolder = (folder: MediaFolder) => {
  currentFolder.value = folder
  selectedMediaId.value = ''
}

const selectStudentFolder = (student: StudentFolderInfo) => {
  selectedStudent.value = student.studentName
  selectedStudentId.value = student.studentId
  currentFolder.value = null
  selectedMediaId.value = ''
}

const enterFolder = (folder: MediaFolder) => {
  currentFolder.value = folder
  selectedMediaId.value = ''
}

const selectMedia = (media: MediaItem) => {
  selectedMediaId.value = media.id
}

const confirmSelection = () => {
  const media = mediaStore.items.find(item => item.id === selectedMediaId.value)
  if (media) {
    emit('update:modelValue', media.url)
    emit('media-selected', media)
    showModal.value = false
  }
}

// 创建文件夹
const createFolder = () => {
  if (!newFolderName.value.trim() || !selectedStudentId.value) return
  
  const newFolder: MediaFolder = {
    id: `media_folder_${Date.now()}`,
    name: newFolderName.value.trim(),
    parentId: currentFolder.value?.id,
    path: currentFolder.value ? `${currentFolder.value.path}/${newFolderName.value.trim()}` : newFolderName.value.trim(),
    createdAt: new Date().toISOString(),
    studentId: selectedStudentId.value,
    studentName: selectedStudent.value || '',
    itemCount: 0
  }
  
  mediaStore.addFolder(newFolder)
  
  newFolderName.value = ''
  showNewFolderDialog.value = false
}

// 文件夹菜单
const showFolderMenu = (folder: MediaFolder, event: MouseEvent) => {
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
    mediaStore.renameFolder(selectedFolderForMenu.value.id, newName.trim())
  }
  closeFolderMenu()
}

const deleteSelectedFolder = () => {
  if (!selectedFolderForMenu.value) return
  
  if (confirm(`确定要删除文件夹"${selectedFolderForMenu.value.name}"吗？`)) {
    mediaStore.removeFolder(selectedFolderForMenu.value.id)
  }
  closeFolderMenu()
}

const getFolderItemCount = (folderId: string): number => {
  const items = mediaStore.items.filter(i => i.folderId === folderId).length
  const subfolders = mediaStore.folders.filter(f => f.parentId === folderId).length
  return items + subfolders
}

const handleClickOutside = () => {
  if (folderMenuVisible.value) {
    closeFolderMenu()
  }
}
</script>

<style scoped>
.media-selector {
  width: 100%;
}

.selector-trigger {
  width: 100%;
  min-height: 44px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selector-trigger:hover {
  border-color: #4B6EF5;
  background: #f0f4ff;
}

.trigger-placeholder {
  font-size: 14px;
  color: #666;
}

.trigger-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.trigger-preview img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.trigger-filename {
  flex: 1;
  font-size: 13px;
  color: #333;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  padding: 24px;
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
  color: #4B6EF5;
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
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #4B6EF5;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  border-color: #4B6EF5;
  color: #4B6EF5;
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

.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
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

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
  background: #f5f5f5;
}

.media-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.media-item.selected {
  border-color: #4B6EF5;
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.2);
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.media-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 12px 8px 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.media-item:hover .media-overlay,
.media-item.selected .media-overlay {
  opacity: 1;
}

.media-info {
  font-size: 11px;
  color: white;
}

.media-name {
  margin: 0 0 2px 0;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-name {
  margin: 0;
  opacity: 0.9;
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
  z-index: 2100;
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
  box-sizing: border-box;
}

.dialog-input:focus {
  outline: none;
  border-color: #4B6EF5;
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
  z-index: 2200;
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

@media (max-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
  
  .folder-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
