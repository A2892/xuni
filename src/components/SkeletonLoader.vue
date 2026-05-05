<template>
  <div class="skeleton-wrapper" :class="[`skeleton-${type}`, { animated: animate }]">
    <!-- 文本骨架 -->
    <template v-if="type === 'text'">
      <div 
        v-for="i in lines" 
        :key="i" 
        class="skeleton-line"
        :style="{ 
          width: getLineWidth(i),
          height: `${height}px`
        }"
      ></div>
    </template>
    
    <!-- 头像骨架 -->
    <template v-else-if="type === 'avatar'">
      <div 
        class="skeleton-avatar" 
        :class="[`size-${size}`, shape]"
        :style="avatarStyle"
      ></div>
    </template>
    
    <!-- 图片骨架 -->
    <template v-else-if="type === 'image'">
      <div 
        class="skeleton-image"
        :style="imageStyle"
      >
        <svg class="image-placeholder" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" fill="currentColor" opacity="0.1"/>
          <path d="M4 5h16v14H4V5zm2 12l4-5 3 4 2-2.5 3 3.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <circle cx="15" cy="9" r="2" fill="currentColor" opacity="0.3"/>
        </svg>
      </div>
    </template>
    
    <!-- 按钮骨架 -->
    <template v-else-if="type === 'button'">
      <div 
        class="skeleton-button"
        :class="[`size-${size}`]"
        :style="{ width: width || 'auto' }"
      ></div>
    </template>
    
    <!-- 卡片骨架 -->
    <template v-else-if="type === 'card'">
      <div class="skeleton-card">
        <div v-if="showImage" class="card-image skeleton-box"></div>
        <div class="card-content">
          <div class="skeleton-line title" style="width: 60%"></div>
          <div class="skeleton-line" style="width: 100%"></div>
          <div class="skeleton-line" style="width: 80%"></div>
          <div v-if="showActions" class="card-actions">
            <div class="skeleton-button size-small"></div>
            <div class="skeleton-button size-small"></div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- 列表骨架 -->
    <template v-else-if="type === 'list'">
      <div 
        v-for="i in count" 
        :key="i" 
        class="skeleton-list-item"
      >
        <div v-if="showAvatar" class="skeleton-avatar size-medium circle"></div>
        <div class="list-content">
          <div class="skeleton-line" style="width: 40%"></div>
          <div class="skeleton-line small" style="width: 70%"></div>
        </div>
      </div>
    </template>
    
    <!-- 表格骨架 -->
    <template v-else-if="type === 'table'">
      <div class="skeleton-table">
        <div class="table-header">
          <div 
            v-for="col in columns" 
            :key="col" 
            class="skeleton-box header-cell"
          ></div>
        </div>
        <div 
          v-for="row in rows" 
          :key="row" 
          class="table-row"
        >
          <div 
            v-for="col in columns" 
            :key="`${row}-${col}`" 
            class="skeleton-box cell"
          ></div>
        </div>
      </div>
    </template>
    
    <!-- 表单骨架 -->
    <template v-else-if="type === 'form'">
      <div class="skeleton-form">
        <div v-for="i in fields" :key="i" class="form-field-skeleton">
          <div class="skeleton-line label" style="width: 100px"></div>
          <div class="skeleton-input"></div>
        </div>
        <div class="form-actions-skeleton">
          <div class="skeleton-button size-large" style="width: 120px"></div>
        </div>
      </div>
    </template>
    
    <!-- 通用矩形骨架 -->
    <template v-else>
      <div 
        class="skeleton-box"
        :style="{ width: width || '100%', height: height ? `${height}px` : '1rem' }"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'avatar' | 'image' | 'button' | 'card' | 'list' | 'table' | 'form' | 'box'
  lines?: number
  count?: number
  columns?: number
  rows?: number
  fields?: number
  width?: string
  height?: number
  size?: 'small' | 'medium' | 'large'
  shape?: 'circle' | 'square' | 'rounded'
  animate?: boolean
  showImage?: boolean
  showAvatar?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  lines: 3,
  count: 5,
  columns: 4,
  rows: 5,
  fields: 4,
  height: 16,
  size: 'medium',
  shape: 'circle',
  animate: true,
  showImage: true,
  showAvatar: true,
  showActions: true
})

// 获取每行宽度
const getLineWidth = (index: number) => {
  if (index === props.lines) return '60%'
  if (index === 1) return '90%'
  return `${70 + Math.random() * 20}%`
}

// 头像样式
const avatarStyle = computed(() => {
  const sizes = {
    small: 32,
    medium: 48,
    large: 64
  }
  const size = sizes[props.size]
  return {
    width: `${size}px`,
    height: `${size}px`
  }
})

// 图片样式
const imageStyle = computed(() => ({
  width: props.width || '100%',
  height: props.height ? `${props.height}px` : '200px'
}))
</script>

<style scoped>
.skeleton-wrapper {
  --skeleton-base: #e5e7eb;
  --skeleton-shine: #f3f4f6;
}

/* 动画 */
.skeleton-wrapper.animated .skeleton-line,
.skeleton-wrapper.animated .skeleton-box,
.skeleton-wrapper.animated .skeleton-avatar,
.skeleton-wrapper.animated .skeleton-image,
.skeleton-wrapper.animated .skeleton-button,
.skeleton-wrapper.animated .skeleton-input {
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 25%,
    var(--skeleton-shine) 50%,
    var(--skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 基础元素 */
.skeleton-line,
.skeleton-box {
  background: var(--skeleton-base);
  border-radius: 4px;
}

.skeleton-line {
  margin-bottom: 0.75rem;
}

.skeleton-line:last-child {
  margin-bottom: 0;
}

.skeleton-line.title {
  height: 24px;
  margin-bottom: 1rem;
}

.skeleton-line.small {
  height: 12px;
}

/* 头像 */
.skeleton-avatar {
  background: var(--skeleton-base);
  flex-shrink: 0;
}

.skeleton-avatar.circle {
  border-radius: 50%;
}

.skeleton-avatar.square {
  border-radius: 4px;
}

.skeleton-avatar.rounded {
  border-radius: 8px;
}

.skeleton-avatar.size-small {
  width: 32px;
  height: 32px;
}

.skeleton-avatar.size-medium {
  width: 48px;
  height: 48px;
}

.skeleton-avatar.size-large {
  width: 64px;
  height: 64px;
}

/* 图片 */
.skeleton-image {
  background: var(--skeleton-base);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 48px;
  height: 48px;
  color: #9ca3af;
}

/* 按钮 */
.skeleton-button {
  background: var(--skeleton-base);
  border-radius: 6px;
  display: inline-block;
}

.skeleton-button.size-small {
  width: 60px;
  height: 32px;
}

.skeleton-button.size-medium {
  width: 80px;
  height: 38px;
}

.skeleton-button.size-large {
  width: 100px;
  height: 44px;
}

/* 卡片 */
.skeleton-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-card .card-image {
  height: 160px;
  border-radius: 0;
}

.skeleton-card .card-content {
  padding: 1rem;
}

.skeleton-card .card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--skeleton-base);
}

/* 列表 */
.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--skeleton-base);
}

.skeleton-list-item:last-child {
  border-bottom: none;
}

.skeleton-list-item .list-content {
  flex: 1;
}

.skeleton-list-item .skeleton-line {
  margin-bottom: 0.5rem;
}

.skeleton-list-item .skeleton-line:last-child {
  margin-bottom: 0;
}

/* 表格 */
.skeleton-table {
  border: 1px solid var(--skeleton-base);
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-table .table-header {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid var(--skeleton-base);
}

.skeleton-table .table-row {
  display: flex;
  border-bottom: 1px solid var(--skeleton-base);
}

.skeleton-table .table-row:last-child {
  border-bottom: none;
}

.skeleton-table .header-cell,
.skeleton-table .cell {
  flex: 1;
  height: 20px;
  margin: 12px;
  border-radius: 4px;
}

.skeleton-table .header-cell {
  height: 16px;
}

/* 表单 */
.skeleton-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field-skeleton .label {
  height: 14px;
  margin-bottom: 0;
}

.skeleton-input {
  height: 42px;
  background: var(--skeleton-base);
  border-radius: 6px;
}

.form-actions-skeleton {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}
</style>
