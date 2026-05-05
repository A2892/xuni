<template>
  <div 
    class="file-card"
    :class="[
      `variant-${variant}`,
      { 
        'is-selected': selected,
        'is-clickable': clickable
      }
    ]"
    @click="handleClick"
  >
    <!-- 选择框 -->
    <div class="card-select" v-if="selectable" @click.stop>
      <input 
        type="checkbox"
        :checked="selected"
        @change="$emit('select', !selected)"
        class="select-checkbox"
      />
    </div>

    <!-- 文件图标/预览 -->
    <div class="card-preview">
      <img 
        v-if="preview && isImage"
        :src="preview"
        :alt="name"
        class="preview-image"
      />
      <div 
        v-else
        class="preview-placeholder"
        :style="{ backgroundColor: getFileColor(type) + '15' }"
      >
        <IconLib :name="getFileIcon(type)" :size="variant === 'compact' ? 20 : 28" :style="{ color: getFileColor(type) }" />
      </div>
      <span class="file-extension" v-if="extension && variant !== 'compact'">
        .{{ extension }}
      </span>
    </div>

    <!-- 文件信息 -->
    <div class="card-info">
      <div class="info-main">
        <h4 class="file-name" :title="name">{{ displayName }}</h4>
        <p class="file-meta">
          <span class="meta-size">{{ formatSize(size) }}</span>
          <span class="meta-dot" v-if="date">•</span>
          <span class="meta-date" v-if="date">{{ formatDate(date) }}</span>
        </p>
      </div>

      <!-- 标签 -->
      <div class="file-tags" v-if="tags && tags.length > 0 && variant !== 'compact'">
        <span 
          v-for="tag in tags.slice(0, 2)"
          :key="tag"
          class="file-tag"
        >
          {{ tag }}
        </span>
        <span v-if="tags.length > 2" class="file-tag more">+{{ tags.length - 2 }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions" v-if="showActions">
      <button 
        class="action-btn"
        @click.stop="$emit('preview')"
        title="预览"
      >
        <IconLib name="eye" :size="16" />
      </button>
      <button 
        class="action-btn"
        @click.stop="$emit('download')"
        title="下载"
      >
        <IconLib name="download" :size="16" />
      </button>
      <div class="action-more">
        <button 
          class="action-btn"
          @click.stop="showMenu = !showMenu"
          title="更多"
        >
          <IconLib name="more-vertical" :size="16" />
        </button>
        <div class="dropdown-menu" v-if="showMenu" @click.stop>
          <button @click="handleAction('rename')">
            <IconLib name="edit-3" :size="14" />
            重命名
          </button>
          <button @click="handleAction('copy')">
            <IconLib name="copy" :size="14" />
            复制
          </button>
          <button @click="handleAction('move')">
            <IconLib name="folder" :size="14" />
            移动
          </button>
          <button @click="handleAction('share')">
            <IconLib name="share-2" :size="14" />
            分享
          </button>
          <div class="menu-divider"></div>
          <button class="danger" @click="handleAction('delete')">
            <IconLib name="trash-2" :size="14" />
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 状态标识 -->
    <div class="card-status" v-if="status">
      <span class="status-badge" :class="`status-${status}`">
        <IconLib v-if="status === 'uploading'" name="loader" :size="12" class="spin" />
        <IconLib v-else-if="status === 'success'" name="check" :size="12" />
        <IconLib v-else-if="status === 'error'" name="x" :size="12" />
        <IconLib v-else-if="status === 'syncing'" name="refresh-cw" :size="12" class="spin" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconLib from './icons/IconLibrary.vue'

type FileType = 'image' | 'video' | 'audio' | 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'archive' | 'code' | 'other'

const props = withDefaults(defineProps<{
  name: string
  size: number
  type?: FileType
  extension?: string
  preview?: string
  date?: Date | string
  tags?: string[]
  status?: 'uploading' | 'success' | 'error' | 'syncing'
  selected?: boolean
  selectable?: boolean
  clickable?: boolean
  showActions?: boolean
  variant?: 'default' | 'compact' | 'grid'
}>(), {
  type: 'other',
  selected: false,
  selectable: false,
  clickable: true,
  showActions: true,
  variant: 'default'
})

const emit = defineEmits<{
  click: []
  select: [selected: boolean]
  preview: []
  download: []
  action: [action: string]
}>()

const showMenu = ref(false)

// 是否为图片类型
const isImage = computed(() => {
  return props.type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(props.extension || '')
})

// 显示名称（截断）
const displayName = computed(() => {
  const maxLength = props.variant === 'compact' ? 20 : 30
  if (props.name.length > maxLength) {
    return props.name.slice(0, maxLength - 3) + '...'
  }
  return props.name
})

// 获取文件图标
const getFileIcon = (type: FileType): string => {
  const icons: Record<FileType, string> = {
    image: 'image',
    video: 'video',
    audio: 'music',
    document: 'file-text',
    spreadsheet: 'table',
    presentation: 'monitor',
    pdf: 'file-text',
    archive: 'archive',
    code: 'code',
    other: 'file'
  }
  return icons[type] || 'file'
}

// 获取文件颜色
const getFileColor = (type: FileType): string => {
  const colors: Record<FileType, string> = {
    image: '#4B6EF5',
    video: '#ef4444',
    audio: '#8b5cf6',
    document: '#3b82f6',
    spreadsheet: '#10b981',
    presentation: '#f59e0b',
    pdf: '#ef4444',
    archive: '#6b7280',
    code: '#6C5CE7',
    other: '#9ca3af'
  }
  return colors[type] || '#9ca3af'
}

// 格式化大小
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

// 处理点击
const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

// 处理操作
const handleAction = (action: string) => {
  showMenu.value = false
  emit('action', action)
}

// 点击外部关闭菜单
const handleClickOutside = (e: MouseEvent) => {
  showMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.file-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.file-card.is-clickable {
  cursor: pointer;
}

.file-card.is-clickable:hover {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.file-card.is-selected {
  background: var(--primary-color-light, #eff1ff);
  border-color: var(--primary-color, #4B6EF5);
}

/* 网格变体 */
.file-card.variant-grid {
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.file-card.variant-grid .card-preview {
  width: 100%;
  aspect-ratio: 4/3;
  margin: 0;
}

.file-card.variant-grid .preview-image {
  width: 100%;
  height: 100%;
}

.file-card.variant-grid .preview-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.file-card.variant-grid .card-info {
  padding: 0.75rem;
  width: 100%;
}

/* 紧凑变体 */
.file-card.variant-compact {
  padding: 0.5rem;
  gap: 0.5rem;
}

/* 选择框 */
.card-select {
  flex-shrink: 0;
}

.select-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color, #4B6EF5);
}

/* 预览 */
.card-preview {
  position: relative;
  flex-shrink: 0;
}

.preview-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
}

.file-card.variant-compact .preview-image,
.file-card.variant-compact .preview-placeholder {
  width: 36px;
  height: 36px;
}

.file-extension {
  position: absolute;
  bottom: -4px;
  right: -4px;
  padding: 0.125rem 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
  color: var(--text-color-secondary, #666);
}

/* 信息 */
.card-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-card.variant-compact .file-name {
  font-size: 0.875rem;
}

.file-meta {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
}

.meta-dot {
  margin: 0 0.25rem;
}

/* 标签 */
.file-tags {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.file-tag {
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 4px;
  color: var(--text-color-secondary, #666);
}

.file-tag.more {
  background: var(--primary-color-light, #eff1ff);
  color: var(--primary-color, #4B6EF5);
}

/* 操作 */
.card-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
  color: var(--primary-color, #4B6EF5);
}

.action-more {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 140px;
  padding: 0.375rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.dropdown-menu button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-menu button:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

.dropdown-menu button.danger {
  color: #ef4444;
}

.dropdown-menu button.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.menu-divider {
  margin: 0.25rem 0;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

/* 状态 */
.card-status {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.status-badge.status-uploading {
  background: rgba(75, 110, 245, 0.1);
  color: #4B6EF5;
}

.status-badge.status-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.status-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge.status-syncing {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

/* 动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
