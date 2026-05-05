<template>
  <div 
    class="file-uploader"
    :class="{ 
      'is-dragging': isDragging, 
      'has-files': files.length > 0,
      'is-disabled': disabled
    }"
    @dragenter.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <!-- 上传区域 -->
    <div v-if="!files.length || multiple" class="upload-zone" @click="triggerFileInput">
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        class="file-input"
        @change="handleFileChange"
      />
      
      <div class="upload-content">
        <div class="upload-icon" :class="{ 'animate-bounce': isDragging }">
          <IconLib :name="isDragging ? 'download' : 'upload-cloud'" :size="48" />
        </div>
        <div class="upload-text">
          <p class="main-text">
            <span v-if="isDragging">释放文件以上传</span>
            <span v-else>
              点击或拖拽文件到此处上传
            </span>
          </p>
          <p class="sub-text">
            {{ acceptText }}
            <template v-if="maxSize">，最大 {{ formatFileSize(maxSize * 1024 * 1024) }}</template>
          </p>
        </div>
      </div>
    </div>
    
    <!-- 文件列表 -->
    <transition-group 
      v-if="files.length > 0" 
      name="file-list" 
      tag="div" 
      class="file-list"
    >
      <div 
        v-for="(file, index) in files" 
        :key="file.id"
        class="file-item"
        :class="{ 'has-error': file.error, 'is-uploading': file.uploading }"
      >
        <!-- 文件预览 -->
        <div class="file-preview">
          <img 
            v-if="file.preview && isImage(file.file)" 
            :src="file.preview" 
            :alt="file.file.name"
            class="preview-image"
          />
          <div v-else class="file-type-icon">
            <IconLib :name="getFileIcon(file.file)" :size="24" />
          </div>
        </div>
        
        <!-- 文件信息 -->
        <div class="file-info">
          <div class="file-name" :title="file.file.name">
            {{ truncateFileName(file.file.name) }}
          </div>
          <div class="file-meta">
            <span class="file-size">{{ formatFileSize(file.file.size) }}</span>
            <span v-if="file.uploading" class="file-progress">
              {{ file.progress }}%
            </span>
            <span v-else-if="file.error" class="file-error">
              {{ file.error }}
            </span>
            <span v-else-if="file.uploaded" class="file-success">
              <IconLib name="check-circle" :size="14" />
              已上传
            </span>
          </div>
          
          <!-- 上传进度条 -->
          <div v-if="file.uploading" class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${file.progress}%` }"
            ></div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="file-actions">
          <button 
            v-if="file.error"
            type="button"
            class="action-btn retry"
            title="重试"
            @click="retryUpload(index)"
          >
            <IconLib name="rotate-cw" :size="16" />
          </button>
          <button 
            type="button"
            class="action-btn remove"
            title="删除"
            @click="removeFile(index)"
          >
            <IconLib name="x" :size="16" />
          </button>
        </div>
      </div>
    </transition-group>
    
    <!-- 底部操作 -->
    <div v-if="files.length > 0 && showActions" class="uploader-footer">
      <div class="file-count">
        已选择 {{ files.length }} 个文件
        <span v-if="totalSize > 0">，共 {{ formatFileSize(totalSize) }}</span>
      </div>
      <div class="footer-actions">
        <button 
          v-if="multiple"
          type="button" 
          class="btn btn-secondary"
          @click="triggerFileInput"
        >
          <IconLib name="plus" :size="16" />
          添加更多
        </button>
        <button 
          type="button" 
          class="btn btn-secondary"
          @click="clearAll"
        >
          <IconLib name="trash-2" :size="16" />
          清空全部
        </button>
        <button 
          v-if="showUploadButton && !autoUpload"
          type="button" 
          class="btn btn-primary"
          :disabled="uploading || !hasUnuploadedFiles"
          @click="uploadAll"
        >
          <IconLib name="upload" :size="16" />
          开始上传
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface FileItem {
  id: string
  file: File
  preview?: string
  uploading: boolean
  uploaded: boolean
  progress: number
  error?: string
}

interface Props {
  accept?: string
  multiple?: boolean
  maxSize?: number // MB
  maxFiles?: number
  autoUpload?: boolean
  showActions?: boolean
  showUploadButton?: boolean
  disabled?: boolean
  uploadFn?: (file: File, onProgress: (progress: number) => void) => Promise<string>
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*/*',
  multiple: false,
  maxFiles: 10,
  autoUpload: false,
  showActions: true,
  showUploadButton: true,
  disabled: false
})

const emit = defineEmits<{
  change: [files: File[]]
  upload: [result: { file: File; url: string }]
  error: [error: { file: File; message: string }]
  remove: [file: File]
}>()

// 状态
const fileInputRef = ref<HTMLInputElement>()
const files = ref<FileItem[]>([])
const isDragging = ref(false)
const uploading = ref(false)

// 计算属性
const totalSize = computed(() => {
  return files.value.reduce((sum, f) => sum + f.file.size, 0)
})

const hasUnuploadedFiles = computed(() => {
  return files.value.some(f => !f.uploaded && !f.error)
})

const acceptText = computed(() => {
  if (props.accept === '*/*') return '支持所有文件类型'
  
  const types = props.accept.split(',').map(t => t.trim())
  const names: string[] = []
  
  types.forEach(type => {
    if (type.startsWith('.')) {
      names.push(type.toUpperCase().slice(1))
    } else if (type.startsWith('image/')) {
      names.push('图片')
    } else if (type.startsWith('video/')) {
      names.push('视频')
    } else if (type.startsWith('audio/')) {
      names.push('音频')
    } else if (type.includes('pdf')) {
      names.push('PDF')
    } else if (type.includes('word') || type.includes('document')) {
      names.push('Word')
    } else if (type.includes('excel') || type.includes('spreadsheet')) {
      names.push('Excel')
    }
  })
  
  const unique = [...new Set(names)]
  return `支持 ${unique.join('、')} 格式`
})

// 方法
const triggerFileInput = () => {
  if (!props.disabled) {
    fileInputRef.value?.click()
  }
}

const generateId = () => {
  return Math.random().toString(36).substring(2, 11)
}

const handleDragEnter = () => {
  if (!props.disabled) {
    isDragging.value = true
  }
}

const handleDragLeave = (e: DragEvent) => {
  // 检查是否真的离开了上传区域
  const target = e.relatedTarget as HTMLElement
  if (!target || !e.currentTarget || !(e.currentTarget as HTMLElement).contains(target)) {
    isDragging.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (props.disabled) return
  
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles) {
    processFiles(Array.from(droppedFiles))
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectedFiles = target.files
  if (selectedFiles) {
    processFiles(Array.from(selectedFiles))
    // 清空input，以便可以重新选择相同的文件
    target.value = ''
  }
}

const processFiles = async (newFiles: File[]) => {
  for (const file of newFiles) {
    // 检查文件数量限制
    if (files.value.length >= props.maxFiles) {
      emit('error', { file, message: `最多只能上传 ${props.maxFiles} 个文件` })
      continue
    }
    
    // 检查文件大小
    if (props.maxSize && file.size > props.maxSize * 1024 * 1024) {
      emit('error', { file, message: `文件大小不能超过 ${props.maxSize}MB` })
      continue
    }
    
    // 检查文件类型
    if (!isFileAccepted(file)) {
      emit('error', { file, message: '不支持的文件类型' })
      continue
    }
    
    // 创建预览
    let preview: string | undefined
    if (isImage(file)) {
      preview = URL.createObjectURL(file)
    }
    
    const fileItem: FileItem = {
      id: generateId(),
      file,
      preview,
      uploading: false,
      uploaded: false,
      progress: 0
    }
    
    files.value.push(fileItem)
    
    // 自动上传
    if (props.autoUpload && props.uploadFn) {
      uploadFile(files.value.length - 1)
    }
  }
  
  emit('change', files.value.map(f => f.file))
}

const isFileAccepted = (file: File): boolean => {
  if (props.accept === '*/*') return true
  
  const types = props.accept.split(',').map(t => t.trim())
  return types.some(type => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase())
    }
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type
  })
}

const isImage = (file: File): boolean => {
  return file.type.startsWith('image/')
}

const getFileIcon = (file: File): string => {
  const type = file.type
  const name = file.name.toLowerCase()
  
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'music'
  if (type.includes('pdf')) return 'file-text'
  if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return 'file-text'
  if (type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return 'file-spreadsheet'
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'archive'
  if (type.includes('json') || type.includes('javascript') || type.includes('typescript')) return 'file-code'
  
  return 'file'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const truncateFileName = (name: string, maxLength: number = 30): string => {
  if (name.length <= maxLength) return name
  
  const ext = name.lastIndexOf('.')
  if (ext > 0 && name.length - ext < 8) {
    const extension = name.slice(ext)
    const baseName = name.slice(0, ext)
    const truncated = baseName.slice(0, maxLength - extension.length - 3)
    return `${truncated}...${extension}`
  }
  
  return name.slice(0, maxLength - 3) + '...'
}

const uploadFile = async (index: number) => {
  const fileItem = files.value[index]
  if (!fileItem || !props.uploadFn || fileItem.uploading || fileItem.uploaded) return
  
  fileItem.uploading = true
  fileItem.error = undefined
  
  try {
    const url = await props.uploadFn(fileItem.file, (progress) => {
      fileItem.progress = progress
    })
    
    fileItem.uploaded = true
    emit('upload', { file: fileItem.file, url })
  } catch (error: any) {
    fileItem.error = error.message || '上传失败'
    emit('error', { file: fileItem.file, message: fileItem.error })
  } finally {
    fileItem.uploading = false
  }
}

const uploadAll = async () => {
  uploading.value = true
  
  for (let i = 0; i < files.value.length; i++) {
    if (!files.value[i].uploaded && !files.value[i].error) {
      await uploadFile(i)
    }
  }
  
  uploading.value = false
}

const retryUpload = (index: number) => {
  const fileItem = files.value[index]
  if (fileItem) {
    fileItem.error = undefined
    fileItem.progress = 0
    uploadFile(index)
  }
}

const removeFile = (index: number) => {
  const fileItem = files.value[index]
  if (fileItem) {
    if (fileItem.preview) {
      URL.revokeObjectURL(fileItem.preview)
    }
    emit('remove', fileItem.file)
    files.value.splice(index, 1)
    emit('change', files.value.map(f => f.file))
  }
}

const clearAll = () => {
  files.value.forEach(f => {
    if (f.preview) {
      URL.revokeObjectURL(f.preview)
    }
  })
  files.value = []
  emit('change', [])
}

// 暴露方法
defineExpose({
  triggerFileInput,
  uploadAll,
  clearAll,
  files
})
</script>

<style scoped>
.file-uploader {
  width: 100%;
}

/* 上传区域 */
.upload-zone {
  position: relative;
  padding: 2rem;
  border: 2px dashed var(--border-color, #d1d5db);
  border-radius: 12px;
  background: var(--bg-secondary, #f9fafb);
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: var(--primary-color, #4B6EF5);
  background: rgba(75, 110, 245, 0.05);
}

.is-dragging .upload-zone {
  border-color: var(--primary-color, #4B6EF5);
  background: rgba(75, 110, 245, 0.1);
  transform: scale(1.01);
}

.is-disabled .upload-zone {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.upload-icon {
  margin-bottom: 1rem;
  color: var(--primary-color, #4B6EF5);
}

.upload-icon.animate-bounce {
  animation: bounce 0.5s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.upload-text .main-text {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary, #1a1a1a);
}

.upload-text .sub-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
}

/* 文件列表 */
.file-list {
  margin-top: 1rem;
}

.has-files .upload-zone {
  padding: 1.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.file-item:hover {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-item.has-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.file-item.is-uploading {
  border-color: var(--primary-color, #4B6EF5);
}

/* 文件预览 */
.file-preview {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-secondary, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-type-icon {
  color: var(--text-tertiary, #999);
}

/* 文件信息 */
.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
}

.file-size {
  color: var(--text-tertiary, #999);
}

.file-progress {
  color: var(--primary-color, #4B6EF5);
  font-weight: 500;
}

.file-error {
  color: #ef4444;
}

.file-success {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #10b981;
}

/* 进度条 */
.progress-bar {
  margin-top: 0.5rem;
  height: 4px;
  background: var(--bg-tertiary, #e5e7eb);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color, #4B6EF5), var(--secondary-color, #6C5CE7));
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 操作按钮 */
.file-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.action-btn.retry {
  color: var(--primary-color, #4B6EF5);
}

.action-btn.retry:hover {
  background: rgba(75, 110, 245, 0.1);
}

.action-btn.remove {
  color: var(--text-tertiary, #999);
}

.action-btn.remove:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 底部操作 */
.uploader-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.file-count {
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
}

.footer-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--primary-color, #4B6EF5), var(--secondary-color, #6C5CE7));
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
}

.btn-secondary {
  color: var(--text-primary, #1a1a1a);
  background: var(--bg-secondary, #f5f5f5);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary, #e5e7eb);
}

/* 列表动画 */
.file-list-enter-active,
.file-list-leave-active {
  transition: all 0.3s ease;
}

.file-list-enter-from,
.file-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.file-list-move {
  transition: transform 0.3s ease;
}
</style>
