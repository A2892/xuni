<template>
  <div class="upload-panel">
    <div class="upload-area" @dragover.prevent @drop="handleDrop">
      <input 
        ref="fileInput"
        type="file" 
        multiple
        accept="image/*,video/*"
        @change="handleFileSelect"
        style="display: none"
      />
      
      <div class="upload-content" @click="triggerFileSelect">
        <div class="upload-icon">📤</div>
        <h3>上传照片或视频</h3>
        <p>点击选择文件或拖拽文件到此处</p>
        <p class="upload-hint">支持 JPG、PNG、GIF、MP4、MOV 等格式</p>
      </div>
    </div>

    <div class="cloud-status-card">
      <div class="cloud-status-header">
        <h3>云数据库存储状态</h3>
        <button class="refresh-btn" @click="loadCloudStorageStats" :disabled="cloudStatusLoading">
          {{ cloudStatusLoading ? '刷新中...' : '刷新' }}
        </button>
      </div>

      <div v-if="cloudStatusError" class="cloud-status-error">{{ cloudStatusError }}</div>

      <template v-else>
        <div class="cloud-status-summary">
          <div class="summary-item">
            <span class="summary-label">总文件数</span>
            <span class="summary-value">{{ cloudSummary.totalFiles }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">总容量</span>
            <span class="summary-value">{{ formatBytes(cloudSummary.totalBytes) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">分片文件</span>
            <span class="summary-value">{{ cloudSummary.chunkedFiles }}</span>
          </div>
          <div class="summary-item" :class="{ warning: cloudSummary.orphanChunks > 0 }">
            <span class="summary-label">孤儿分片</span>
            <span class="summary-value">{{ cloudSummary.orphanChunks }}</span>
          </div>
        </div>

        <div class="bucket-list" v-if="bucketStats.length > 0">
          <div class="bucket-row" v-for="bucket in bucketStats" :key="bucket.bucket">
            <div class="bucket-name">{{ bucket.bucket }}</div>
            <div class="bucket-meta">{{ bucket.files }} 文件</div>
            <div class="bucket-meta">{{ formatBytes(bucket.totalBytes) }}</div>
          </div>
        </div>

        <div class="cloud-status-footer">
          <span>最近上传: {{ formatTime(cloudSummary.lastUploadAt) }}</span>
          <span>最后同步: {{ formatTime(lastCloudSyncAt) }}</span>
        </div>
      </template>
    </div>

    <!-- 上传表单 -->
    <div v-if="pendingFiles.length > 0" class="upload-form">
      <h3>待上传文件 ({{ pendingFiles.length }})</h3>
      
      <!-- 学生选择区 -->
      <div class="student-selector">
        <label>👨‍🎓 选择学生（批量应用）</label>
        <div class="selector-row">
          <select v-model="selectedStudentId" class="student-select" @change="applyStudentToAll">
            <option value="">选择已有学生或手动输入</option>
            <option v-for="student in students" :key="student.student_id" :value="student.student_id">
              {{ student.student_name }} - {{ student.student_id }}
            </option>
          </select>
          <button class="btn-apply" @click="applyStudentToAll" :disabled="!selectedStudentId">
            应用到所有文件
          </button>
        </div>
      </div>
      
      <div class="pending-files">
        <div v-for="(file, index) in pendingFiles" :key="index" class="pending-file">
          <div class="file-preview">
            <img v-if="file.type.startsWith('image/')" :src="file.preview" alt="Preview" />
            <video v-else :src="file.preview"></video>
          </div>
          
          <div class="file-details">
            <select 
              v-model="file.selectedStudentId" 
              class="input-field small"
              @change="applyStudentToFile(index)"
            >
              <option value="">选择学生或手动输入</option>
              <option v-for="student in students" :key="student.student_id" :value="student.student_id">
                {{ student.student_name }} - {{ student.student_id }}
              </option>
            </select>
            <input 
              v-model="file.metadata.studentName"
              type="text"
              placeholder="学生姓名（必填）"
              class="input-field small"
            />
            <input 
              v-model="file.metadata.studentId"
              type="text"
              placeholder="学号（可选）"
              class="input-field small"
            />
            <textarea
              v-model="file.metadata.description"
              placeholder="描述（可选）"
              class="input-field small"
              rows="2"
            ></textarea>
            <input 
              v-model="file.metadata.tags"
              type="text"
              placeholder="标签，用逗号分隔（可选）"
              class="input-field small"
            />
          </div>
          
          <button class="remove-file-btn" @click="removePendingFile(index)">
            ✕
          </button>
        </div>
      </div>
      
      <div class="upload-actions">
        <button class="btn-secondary" @click="clearPendingFiles">
          取消全部
        </button>
        <button class="btn-primary" @click="uploadFiles" :disabled="isUploading">
          {{ isUploading ? '上传中...' : `上传 ${pendingFiles.length} 个文件` }}
        </button>
      </div>
      
      <div v-if="uploadProgress > 0" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <span class="progress-text">{{ uploadProgress }}%</span>
      </div>

      <div v-if="isUploading && currentUploadFileName" class="upload-detail">
        <span class="upload-file">当前文件: {{ currentUploadFileName }}</span>
        <span class="upload-file-progress">文件进度: {{ currentFileProgress }}%</span>
        <span class="upload-chunk" v-if="currentChunkText">{{ currentChunkText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMediaStore } from '@/stores/media'
import { uploadMediaFile } from '@/utils/mediaService'
import { getStudentProfiles } from '@/utils/studentProfileService'
import type { MediaItem } from '@/types/media'
import type { StudentProfile } from '@/types/student'

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : ''
const MAX_MEDIA_FILE_SIZE = Number(import.meta.env.VITE_MAX_MEDIA_FILE_SIZE || 5 * 1024 * 1024 * 1024)

interface CloudStorageSummary {
  totalFiles: number
  totalBytes: number
  chunkedFiles: number
  orphanChunks: number
  lastUploadAt: string | null
}

interface CloudBucketStat {
  bucket: string
  files: number
  totalBytes: number
  chunkedFiles: number
  lastUploadAt: string | null
}

interface PendingFile {
  file: File
  preview: string
  type: string
  selectedStudentId?: string
  metadata: {
    studentName?: string
    studentId?: string
    description?: string
    tags?: string
  }
}

const mediaStore = useMediaStore()
const fileInput = ref<HTMLInputElement>()
const pendingFiles = ref<PendingFile[]>([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const currentUploadFileName = ref('')
const currentFileProgress = ref(0)
const currentChunkText = ref('')
const students = ref<StudentProfile[]>([])
const selectedStudentId = ref('')
const cloudStatusLoading = ref(false)
const cloudStatusError = ref('')
const lastCloudSyncAt = ref<string | null>(null)
const cloudSummary = ref<CloudStorageSummary>({
  totalFiles: 0,
  totalBytes: 0,
  chunkedFiles: 0,
  orphanChunks: 0,
  lastUploadAt: null
})
const bucketStats = ref<CloudBucketStat[]>([])
let cloudStatusTimer: number | null = null

// 加载学生列表
onMounted(async () => {
  const result = await getStudentProfiles()
  if (result.success && result.data) {
    students.value = result.data
  }

  await loadCloudStorageStats()
  cloudStatusTimer = window.setInterval(() => {
    loadCloudStorageStats()
  }, 30000)
})

onUnmounted(() => {
  pendingFiles.value.forEach((pending) => {
    if (pending.preview.startsWith('blob:')) {
      URL.revokeObjectURL(pending.preview)
    }
  })

  if (cloudStatusTimer !== null) {
    window.clearInterval(cloudStatusTimer)
    cloudStatusTimer = null
  }
})

const loadCloudStorageStats = async () => {
  cloudStatusLoading.value = true
  cloudStatusError.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/api/storage/stats`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.error || `状态请求失败 (${response.status})`)
    }

    cloudSummary.value = {
      totalFiles: Number(result.data?.summary?.totalFiles || 0),
      totalBytes: Number(result.data?.summary?.totalBytes || 0),
      chunkedFiles: Number(result.data?.summary?.chunkedFiles || 0),
      orphanChunks: Number(result.data?.summary?.orphanChunks || 0),
      lastUploadAt: result.data?.summary?.lastUploadAt || null
    }

    bucketStats.value = (result.data?.buckets || []).map((bucket: any) => ({
      bucket: String(bucket.bucket || ''),
      files: Number(bucket.files || 0),
      totalBytes: Number(bucket.totalBytes || 0),
      chunkedFiles: Number(bucket.chunkedFiles || 0),
      lastUploadAt: bucket.lastUploadAt || null
    }))

    lastCloudSyncAt.value = new Date().toISOString()
  } catch (error: any) {
    cloudStatusError.value = error?.message || '无法获取云数据库状态'
  } finally {
    cloudStatusLoading.value = false
  }
}

const formatBytes = (bytes: number) => {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const size = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, size)
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[Math.min(size, units.length - 1)]}`
}

const formatTime = (isoTime: string | null) => {
  if (!isoTime) return '暂无'
  const date = new Date(isoTime)
  if (Number.isNaN(date.getTime())) return '暂无'
  return date.toLocaleString('zh-CN', { hour12: false })
}

// 应用学生信息到所有文件
const applyStudentToAll = () => {
  if (!selectedStudentId.value) return
  
  const student = students.value.find(s => s.student_id === selectedStudentId.value)
  if (student) {
    pendingFiles.value.forEach(file => {
      file.selectedStudentId = student.student_id
      file.metadata.studentName = student.student_name
      file.metadata.studentId = student.student_id
    })
  }
}

// 应用学生信息到单个文件
const applyStudentToFile = (index: number) => {
  const file = pendingFiles.value[index]
  if (!file.selectedStudentId) return
  
  const student = students.value.find(s => s.student_id === file.selectedStudentId)
  if (student) {
    file.metadata.studentName = student.student_name
    file.metadata.studentId = student.student_id
  }
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  addFiles(files)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer?.files || [])
  addFiles(files)
}

const addFiles = async (files: File[]) => {
  for (const file of files) {
    // 检查文件类型
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert(`文件 ${file.name} 不是支持的格式`)
      continue
    }
    
    // 检查文件大小（默认上限 5GB，可通过 VITE_MAX_MEDIA_FILE_SIZE 调整）
    if (file.size > MAX_MEDIA_FILE_SIZE) {
      alert(`文件 ${file.name} 超过大小限制（当前上限 ${formatBytes(MAX_MEDIA_FILE_SIZE)}）`)
      continue
    }
    
    // 创建预览
    const preview = await createPreview(file)
    
    pendingFiles.value.push({
      file,
      preview,
      type: file.type,
      metadata: {
        studentName: '',
        studentId: '',
        description: '',
        tags: ''
      }
    })
  }
}

const createPreview = (file: File): Promise<string> => {
  return Promise.resolve(URL.createObjectURL(file))
}

const removePendingFile = (index: number) => {
  const pending = pendingFiles.value[index]
  if (pending?.preview?.startsWith('blob:')) {
    URL.revokeObjectURL(pending.preview)
  }
  pendingFiles.value.splice(index, 1)
}

const clearPendingFiles = () => {
  if (confirm('确定要取消所有待上传文件吗？')) {
    pendingFiles.value.forEach((pending) => {
      if (pending.preview.startsWith('blob:')) {
        URL.revokeObjectURL(pending.preview)
      }
    })
    pendingFiles.value = []
  }
}

const uploadFiles = async () => {
  if (pendingFiles.value.length === 0) return
  
  isUploading.value = true
  uploadProgress.value = 0
  currentUploadFileName.value = ''
  currentFileProgress.value = 0
  currentChunkText.value = ''
  
  try {
    const total = pendingFiles.value.length
    let successCount = 0
    let failCount = 0
    
    for (let i = 0; i < total; i++) {
      const pending = pendingFiles.value[i]
      
      try {
        // 上传到 Supabase
        const result = await uploadMediaFile(pending.file, {
          studentName: pending.metadata.studentName,
          studentId: pending.metadata.studentId,
          description: pending.metadata.description,
          tags: pending.metadata.tags 
            ? pending.metadata.tags.split(',').map(t => t.trim()).filter(t => t)
            : []
        }, {
          onProgress: (progress) => {
            currentUploadFileName.value = pending.file.name
            currentFileProgress.value = progress.percent
            currentChunkText.value = '上传模式: 单次直传'
            uploadProgress.value = Math.round(((i + progress.percent / 100) / total) * 100)
          }
        })
        
        if (result.success && result.data) {
          // 添加到存储
          mediaStore.addMediaItem(result.data)
          successCount++
        } else {
          console.error(`文件 ${pending.file.name} 上传失败:`, result.message)
          failCount++
        }
      } catch (error) {
        console.error(`文件 ${pending.file.name} 上传失败:`, error)
        failCount++
      }
      
      // 兜底更新进度（防止某些浏览器未触发 upload progress）
      uploadProgress.value = Math.max(uploadProgress.value, Math.round(((i + 1) / total) * 100))
    }
    
    // 显示结果
    if (failCount > 0) {
      alert(`上传完成！成功 ${successCount} 个，失败 ${failCount} 个`)
    } else {
      alert(`成功上传 ${successCount} 个文件！`)
    }
    
    // 清空待上传列表
    pendingFiles.value.forEach((pending) => {
      if (pending.preview.startsWith('blob:')) {
        URL.revokeObjectURL(pending.preview)
      }
    })
    pendingFiles.value = []
    uploadProgress.value = 0
    currentUploadFileName.value = ''
    currentFileProgress.value = 0
    currentChunkText.value = ''
    
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  } finally {
    isUploading.value = false
    currentUploadFileName.value = ''
    currentFileProgress.value = 0
    currentChunkText.value = ''
  }
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
</script>

<style scoped>
.upload-panel {
  padding: 20px;
}

.upload-area {
  border: 3px dashed #ddd;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  background: #fafafa;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #4B6EF5;
  background: #f0f4ff;
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.upload-content h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.upload-content p {
  margin: 8px 0;
  color: #666;
  font-size: 16px;
}

.upload-hint {
  font-size: 14px !important;
  color: #999 !important;
}

.upload-form {
  margin-top: 30px;
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.upload-form h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
}

.student-selector {
  margin-bottom: 24px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 12px;
  border: 2px solid #42b983;
}

.student-selector label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.selector-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.student-select {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.student-select:focus {
  outline: none;
  border-color: #42b983;
}

.btn-apply {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-apply:hover:not(:disabled) {
  background: #35a372;
}

.btn-apply:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pending-files {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.pending-file {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.file-preview {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  flex-shrink: 0;
}

.file-preview img,
.file-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-field.small {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input-field.small:focus {
  outline: none;
  border-color: #4B6EF5;
}

textarea.input-field.small {
  resize: vertical;
  min-height: 60px;
}

.remove-file-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-file-btn:hover {
  background: #ff4444;
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
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

.upload-progress {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4B6EF5;
  transition: width 0.3s;
}

.progress-text {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  min-width: 45px;
}

.upload-detail {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f5f7ff;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #4a5568;
}

.upload-file {
  font-weight: 600;
  color: #2d3748;
}

.upload-file-progress,
.upload-chunk {
  color: #4B6EF5;
}

.cloud-status-card {
  margin-top: 20px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #d7e2ff;
  background: linear-gradient(180deg, #f7faff 0%, #f1f6ff 100%);
}

.cloud-status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cloud-status-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2a44;
}

.refresh-btn {
  border: 1px solid #8aa6ff;
  background: #ffffff;
  color: #2c5bff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.refresh-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.cloud-status-error {
  font-size: 13px;
  color: #c53030;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  padding: 10px 12px;
  border-radius: 8px;
}

.cloud-status-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.summary-item {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #dde6ff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item.warning {
  border-color: #f6ad55;
  background: #fffaf0;
}

.summary-label {
  font-size: 12px;
  color: #5a6885;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: #1f2a44;
}

.bucket-list {
  margin-top: 12px;
  background: #ffffff;
  border: 1px solid #dde6ff;
  border-radius: 10px;
  overflow: hidden;
}

.bucket-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 12px;
  padding: 9px 12px;
  border-bottom: 1px solid #edf2ff;
}

.bucket-row:last-child {
  border-bottom: none;
}

.bucket-name {
  font-weight: 600;
  color: #2d3748;
}

.bucket-meta {
  color: #4a5568;
  font-size: 13px;
}

.cloud-status-footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  color: #667189;
  font-size: 12px;
}

@media (max-width: 768px) {
  .cloud-status-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bucket-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .cloud-status-footer {
    flex-direction: column;
  }

  .pending-file {
    flex-direction: column;
  }
  
  .file-preview {
    width: 100%;
    height: 200px;
  }
  
  .upload-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
