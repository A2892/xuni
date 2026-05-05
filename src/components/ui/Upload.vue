<template>
  <div 
    class="upload"
    :class="[
      `upload--${listType}`,
      { 'upload--disabled': disabled },
      { 'upload--drag': drag },
      { 'upload--drag-over': isDragOver }
    ]"
  >
    <!-- 拖拽上传区域 -->
    <div
      v-if="drag"
      class="upload__dragger"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="handleClick"
    >
      <slot name="drag">
        <div class="upload__dragger-content">
          <IconLib name="upload-cloud" :size="48" class="upload__icon" />
          <p class="upload__text">将文件拖到此处，或<em>点击上传</em></p>
          <p v-if="tip" class="upload__tip">{{ tip }}</p>
        </div>
      </slot>
    </div>
    
    <!-- 普通上传按钮 -->
    <div v-else class="upload__trigger" @click="handleClick">
      <slot>
        <button class="upload__btn" :disabled="disabled">
          <IconLib name="upload" :size="16" />
          <span>{{ buttonText }}</span>
        </button>
      </slot>
    </div>
    
    <!-- 隐藏的 input -->
    <input
      ref="inputRef"
      type="file"
      class="upload__input"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="handleInputChange"
    />
    
    <!-- 提示文字 -->
    <p v-if="tip && !drag" class="upload__tip">{{ tip }}</p>
    
    <!-- 文件列表 -->
    <div 
      v-if="showFileList && fileList.length > 0" 
      class="upload__file-list"
      :class="`upload__file-list--${listType}`"
    >
      <TransitionGroup name="upload-file">
        <div
          v-for="file in fileList"
          :key="file.uid"
          class="upload__file-item"
          :class="{
            'upload__file-item--error': file.status === 'error',
            'upload__file-item--success': file.status === 'success',
            'upload__file-item--uploading': file.status === 'uploading'
          }"
        >
          <!-- 图片预览模式 -->
          <template v-if="listType === 'picture' || listType === 'picture-card'">
            <div class="upload__file-thumbnail">
              <img 
                v-if="file.url || file.thumbUrl" 
                :src="file.thumbUrl || file.url" 
                :alt="file.name" 
              />
              <div v-else class="upload__file-placeholder">
                <IconLib :name="getFileIcon(file)" :size="24" />
              </div>
            </div>
          </template>
          
          <!-- 文件图标 -->
          <IconLib 
            v-if="listType === 'text'" 
            :name="getFileIcon(file)" 
            :size="16" 
            class="upload__file-icon" 
          />
          
          <!-- 文件信息 -->
          <div class="upload__file-info">
            <span class="upload__file-name" :title="file.name">
              {{ file.name }}
            </span>
            <span v-if="showFileSize && file.size" class="upload__file-size">
              {{ formatFileSize(file.size) }}
            </span>
          </div>
          
          <!-- 上传进度 -->
          <div v-if="file.status === 'uploading'" class="upload__file-progress">
            <div 
              class="upload__file-progress-bar" 
              :style="{ width: `${file.percent || 0}%` }"
            />
          </div>
          
          <!-- 状态图标 -->
          <div class="upload__file-status">
            <IconLib 
              v-if="file.status === 'success'" 
              name="check-circle" 
              :size="16" 
              class="upload__status-icon upload__status-icon--success" 
            />
            <IconLib 
              v-else-if="file.status === 'error'" 
              name="alert-circle" 
              :size="16" 
              class="upload__status-icon upload__status-icon--error" 
            />
            <div 
              v-else-if="file.status === 'uploading'" 
              class="upload__loading"
            />
          </div>
          
          <!-- 操作按钮 -->
          <div class="upload__file-actions">
            <button
              v-if="file.url && (listType === 'picture' || listType === 'picture-card')"
              class="upload__action-btn"
              @click="handlePreview(file)"
              title="预览"
            >
              <IconLib name="eye" :size="14" />
            </button>
            <button
              class="upload__action-btn upload__action-btn--delete"
              @click="handleRemove(file)"
              title="删除"
            >
              <IconLib name="x" :size="14" />
            </button>
          </div>
        </div>
      </TransitionGroup>
      
      <!-- 图片卡片模式上传按钮 -->
      <div 
        v-if="listType === 'picture-card' && (!limit || fileList.length < limit)"
        class="upload__file-item upload__file-item--add"
        @click="handleClick"
      >
        <IconLib name="plus" :size="24" />
        <span>上传</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

export interface UploadFile {
  uid: string
  name: string
  size?: number
  type?: string
  status: 'ready' | 'uploading' | 'success' | 'error'
  percent?: number
  url?: string
  thumbUrl?: string
  raw?: File
  response?: any
  error?: any
}

interface Props {
  // 已上传的文件列表
  modelValue?: UploadFile[]
  // 上传地址
  action?: string
  // 请求头
  headers?: Record<string, string>
  // 上传时附带的额外参数
  data?: Record<string, any>
  // 上传的文件字段名
  name?: string
  // 是否支持多选
  multiple?: boolean
  // 接受的文件类型
  accept?: string
  // 最大文件数
  limit?: number
  // 最大文件大小（字节）
  maxSize?: number
  // 是否禁用
  disabled?: boolean
  // 是否显示文件列表
  showFileList?: boolean
  // 是否显示文件大小
  showFileSize?: boolean
  // 列表类型
  listType?: 'text' | 'picture' | 'picture-card'
  // 是否启用拖拽上传
  drag?: boolean
  // 上传按钮文字
  buttonText?: string
  // 提示文字
  tip?: string
  // 是否自动上传
  autoUpload?: boolean
  // 是否携带 cookie
  withCredentials?: boolean
  // 自定义上传函数
  customRequest?: (options: CustomRequestOptions) => void
  // 上传前钩子
  beforeUpload?: (file: File) => boolean | Promise<boolean | File>
}

export interface CustomRequestOptions {
  file: File
  onProgress: (percent: number) => void
  onSuccess: (response: any) => void
  onError: (error: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  name: 'file',
  multiple: false,
  disabled: false,
  showFileList: true,
  showFileSize: true,
  listType: 'text',
  drag: false,
  buttonText: '点击上传',
  autoUpload: true,
  withCredentials: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', files: UploadFile[]): void
  (e: 'change', file: UploadFile, fileList: UploadFile[]): void
  (e: 'success', response: any, file: UploadFile, fileList: UploadFile[]): void
  (e: 'error', error: any, file: UploadFile, fileList: UploadFile[]): void
  (e: 'progress', percent: number, file: UploadFile, fileList: UploadFile[]): void
  (e: 'remove', file: UploadFile, fileList: UploadFile[]): void
  (e: 'preview', file: UploadFile): void
  (e: 'exceed', files: File[], fileList: UploadFile[]): void
}>()

const inputRef = ref<HTMLInputElement>()
const isDragOver = ref(false)
const fileList = ref<UploadFile[]>([...props.modelValue])
let uploadId = 0

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  fileList.value = [...val]
}, { deep: true })

// 生成唯一 ID
function generateUid(): string {
  return `upload-${Date.now()}-${++uploadId}`
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB'
}

// 获取文件图标
function getFileIcon(file: UploadFile): string {
  const type = file.type || ''
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'music'
  if (type.includes('pdf')) return 'file-text'
  if (type.includes('word') || type.includes('document')) return 'file-text'
  if (type.includes('excel') || type.includes('sheet')) return 'table'
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'archive'
  return 'file'
}

// 点击上传
function handleClick() {
  if (props.disabled) return
  inputRef.value?.click()
}

// 文件输入变化
async function handleInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  
  if (files.length === 0) return
  
  // 重置 input
  input.value = ''
  
  await handleFiles(files)
}

// 处理文件
async function handleFiles(files: File[]) {
  // 检查数量限制
  if (props.limit && fileList.value.length + files.length > props.limit) {
    emit('exceed', files, fileList.value)
    return
  }
  
  for (const file of files) {
    // 检查文件大小
    if (props.maxSize && file.size > props.maxSize) {
      console.warn(`文件 ${file.name} 超过大小限制`)
      continue
    }
    
    // 上传前钩子
    if (props.beforeUpload) {
      try {
        const result = await props.beforeUpload(file)
        if (result === false) continue
        if (result instanceof File) {
          await processFile(result)
          continue
        }
      } catch {
        continue
      }
    }
    
    await processFile(file)
  }
}

// 处理单个文件
async function processFile(file: File) {
  const uploadFile: UploadFile = {
    uid: generateUid(),
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'ready',
    percent: 0,
    raw: file
  }
  
  // 生成预览图
  if (file.type.startsWith('image/')) {
    uploadFile.thumbUrl = URL.createObjectURL(file)
  }
  
  fileList.value.push(uploadFile)
  emit('update:modelValue', fileList.value)
  emit('change', uploadFile, fileList.value)
  
  // 自动上传
  if (props.autoUpload) {
    await uploadFile_(uploadFile)
  }
}

// 上传文件
async function uploadFile_(file: UploadFile) {
  if (!file.raw) return
  
  file.status = 'uploading'
  
  const onProgress = (percent: number) => {
    file.percent = percent
    emit('progress', percent, file, fileList.value)
  }
  
  const onSuccess = (response: any) => {
    file.status = 'success'
    file.response = response
    file.percent = 100
    emit('success', response, file, fileList.value)
    emit('update:modelValue', fileList.value)
    emit('change', file, fileList.value)
  }
  
  const onError = (error: any) => {
    file.status = 'error'
    file.error = error
    emit('error', error, file, fileList.value)
    emit('change', file, fileList.value)
  }
  
  // 自定义上传
  if (props.customRequest) {
    props.customRequest({
      file: file.raw,
      onProgress,
      onSuccess,
      onError
    })
    return
  }
  
  // 默认 XHR 上传
  if (!props.action) {
    onError(new Error('No upload action specified'))
    return
  }
  
  const formData = new FormData()
  formData.append(props.name, file.raw)
  
  // 添加额外参数
  if (props.data) {
    Object.entries(props.data).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }
  
  const xhr = new XMLHttpRequest()
  
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      onProgress(Math.round((e.loaded / e.total) * 100))
    }
  })
  
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const response = JSON.parse(xhr.responseText)
        onSuccess(response)
      } catch {
        onSuccess(xhr.responseText)
      }
    } else {
      onError(new Error(`Upload failed with status ${xhr.status}`))
    }
  })
  
  xhr.addEventListener('error', () => {
    onError(new Error('Upload failed'))
  })
  
  xhr.open('POST', props.action)
  
  // 设置请求头
  if (props.headers) {
    Object.entries(props.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })
  }
  
  xhr.withCredentials = props.withCredentials
  xhr.send(formData)
}

// 删除文件
function handleRemove(file: UploadFile) {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index !== -1) {
    // 释放预览 URL
    if (file.thumbUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(file.thumbUrl)
    }
    
    fileList.value.splice(index, 1)
    emit('update:modelValue', fileList.value)
    emit('remove', file, fileList.value)
  }
}

// 预览文件
function handlePreview(file: UploadFile) {
  emit('preview', file)
}

// 拖拽事件
function handleDragEnter(e: DragEvent) {
  if (props.disabled) return
  isDragOver.value = true
}

function handleDragOver(e: DragEvent) {
  if (props.disabled) return
  isDragOver.value = true
}

function handleDragLeave(e: DragEvent) {
  isDragOver.value = false
}

async function handleDrop(e: DragEvent) {
  if (props.disabled) return
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  await handleFiles(files)
}

// 手动上传
function submit() {
  fileList.value
    .filter(file => file.status === 'ready')
    .forEach(file => uploadFile_(file))
}

// 清空文件列表
function clearFiles() {
  fileList.value.forEach(file => {
    if (file.thumbUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(file.thumbUrl)
    }
  })
  fileList.value = []
  emit('update:modelValue', fileList.value)
}

// 暴露方法
defineExpose({
  submit,
  clearFiles,
  fileList
})
</script>

<style scoped>
.upload {
  display: inline-block;
}

.upload--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload__input {
  display: none;
}

.upload__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload__btn:hover:not(:disabled) {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.upload__btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.upload__tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

/* 拖拽上传 */
.upload__dragger {
  padding: 32px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload__dragger:hover,
.upload--drag-over .upload__dragger {
  border-color: var(--primary-color, #4B6EF5);
  background: rgba(75, 110, 245, 0.05);
}

.upload__dragger-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload__icon {
  color: #999;
}

.upload__text {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.upload__text em {
  color: var(--primary-color, #4B6EF5);
  font-style: normal;
}

/* 文件列表 */
.upload__file-list {
  margin-top: 12px;
}

.upload__file-list--text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload__file-list--picture {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload__file-list--picture-card {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload__file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fff;
  transition: all 0.2s;
}

.upload__file-item:hover {
  background: #f5f5f5;
}

.upload__file-item--error {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.upload__file-item--success {
  border-color: #52c41a;
}

/* 图片卡片模式 */
.upload__file-list--picture-card .upload__file-item {
  flex-direction: column;
  justify-content: center;
  width: 104px;
  height: 104px;
  padding: 8px;
  position: relative;
}

.upload__file-list--picture-card .upload__file-item--add {
  border-style: dashed;
  cursor: pointer;
  color: #999;
}

.upload__file-list--picture-card .upload__file-item--add:hover {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.upload__file-thumbnail {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
}

.upload__file-list--picture-card .upload__file-thumbnail {
  width: 100%;
  height: 100%;
}

.upload__file-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload__file-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
}

.upload__file-icon {
  flex-shrink: 0;
  color: #999;
}

.upload__file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.upload__file-list--picture-card .upload__file-info {
  display: none;
}

.upload__file-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload__file-size {
  font-size: 12px;
  color: #999;
}

.upload__file-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #e8e8e8;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
}

.upload__file-progress-bar {
  height: 100%;
  background: var(--primary-color, #4B6EF5);
  transition: width 0.2s;
}

.upload__file-status {
  flex-shrink: 0;
}

.upload__status-icon--success {
  color: #52c41a;
}

.upload__status-icon--error {
  color: #ff4d4f;
}

.upload__loading {
  width: 16px;
  height: 16px;
  border: 2px solid #e8e8e8;
  border-top-color: var(--primary-color, #4B6EF5);
  border-radius: 50%;
  animation: upload-spin 0.8s linear infinite;
}

@keyframes upload-spin {
  to {
    transform: rotate(360deg);
  }
}

.upload__file-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.upload__file-list--picture-card .upload__file-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.upload__file-list--picture-card .upload__file-item:hover .upload__file-actions {
  opacity: 1;
}

.upload__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.upload__action-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.upload__action-btn--delete:hover {
  background: #fff2f0;
  color: #ff4d4f;
}

.upload__file-list--picture-card .upload__action-btn {
  color: #fff;
}

.upload__file-list--picture-card .upload__action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* 动画 */
.upload-file-enter-active,
.upload-file-leave-active {
  transition: all 0.3s ease;
}

.upload-file-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.upload-file-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
