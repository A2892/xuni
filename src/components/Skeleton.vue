<template>
  <div 
    class="skeleton"
    :class="[
      `skeleton-${variant}`,
      { 'is-animated': animated }
    ]"
    :style="skeletonStyle"
  >
    <template v-if="variant === 'card'">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    </template>
    
    <template v-else-if="variant === 'list'">
      <div 
        v-for="i in count" 
        :key="i" 
        class="skeleton-list-item"
      >
        <div v-if="avatar" class="skeleton-avatar" :class="`avatar-${avatarShape}`"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>
    </template>
    
    <template v-else-if="variant === 'table'">
      <div class="skeleton-table">
        <div class="skeleton-table-header">
          <div v-for="i in columns" :key="i" class="skeleton-cell"></div>
        </div>
        <div 
          v-for="row in rows" 
          :key="row" 
          class="skeleton-table-row"
        >
          <div v-for="col in columns" :key="col" class="skeleton-cell"></div>
        </div>
      </div>
    </template>
    
    <template v-else-if="variant === 'article'">
      <div class="skeleton-article">
        <div class="skeleton-article-header">
          <div class="skeleton-title large"></div>
          <div class="skeleton-meta">
            <div class="skeleton-avatar small"></div>
            <div class="skeleton-text short"></div>
          </div>
        </div>
        <div class="skeleton-article-image"></div>
        <div class="skeleton-article-body">
          <div v-for="i in 5" :key="i" class="skeleton-text" :class="{ short: i === 5 }"></div>
        </div>
      </div>
    </template>
    
    <template v-else-if="variant === 'profile'">
      <div class="skeleton-profile">
        <div class="skeleton-avatar large"></div>
        <div class="skeleton-profile-info">
          <div class="skeleton-title"></div>
          <div class="skeleton-text short"></div>
          <div class="skeleton-text shorter"></div>
        </div>
      </div>
    </template>
    
    <template v-else>
      <!-- 默认: text, circle, rect -->
      <div 
        class="skeleton-item"
        :class="`skeleton-${variant}`"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  variant?: 'text' | 'circle' | 'rect' | 'card' | 'list' | 'table' | 'article' | 'profile'
  width?: string | number
  height?: string | number
  count?: number
  animated?: boolean
  avatar?: boolean
  avatarShape?: 'circle' | 'square'
  rows?: number
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  count: 3,
  animated: true,
  avatar: true,
  avatarShape: 'circle',
  rows: 5,
  columns: 4
})

// Computed
const skeletonStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  return style
})
</script>

<style scoped>
.skeleton {
  --skeleton-bg: #e9e9e9;
  --skeleton-highlight: #f5f5f5;
}

.skeleton-item {
  background: var(--skeleton-bg);
  border-radius: 4px;
}

.skeleton-text {
  height: 16px;
  background: var(--skeleton-bg);
  border-radius: 4px;
  width: 100%;
}

.skeleton-text.short {
  width: 60%;
}

.skeleton-text.shorter {
  width: 40%;
}

.skeleton-title {
  height: 20px;
  background: var(--skeleton-bg);
  border-radius: 4px;
  width: 50%;
  margin-bottom: 12px;
}

.skeleton-title.large {
  height: 28px;
  width: 70%;
}

.skeleton-circle {
  border-radius: 50%;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  background: var(--skeleton-bg);
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-avatar.avatar-square {
  border-radius: 8px;
}

.skeleton-avatar.small {
  width: 24px;
  height: 24px;
}

.skeleton-avatar.large {
  width: 80px;
  height: 80px;
}

/* Card */
.skeleton-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.skeleton-card .skeleton-image {
  height: 200px;
  background: var(--skeleton-bg);
}

.skeleton-card .skeleton-content {
  padding: 16px;
}

.skeleton-card .skeleton-text {
  margin-top: 12px;
}

/* List */
.skeleton-list .skeleton-list-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  gap: 12px;
}

.skeleton-list .skeleton-list-item + .skeleton-list-item {
  border-top: 1px solid #f0f0f0;
}

.skeleton-list .skeleton-list-content {
  flex: 1;
}

.skeleton-list .skeleton-list-content .skeleton-title {
  margin-bottom: 8px;
}

/* Table */
.skeleton-table {
  width: 100%;
}

.skeleton-table-header {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 2px solid #f0f0f0;
}

.skeleton-table-row {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-cell {
  flex: 1;
  height: 16px;
  background: var(--skeleton-bg);
  border-radius: 4px;
}

/* Article */
.skeleton-article .skeleton-article-header {
  margin-bottom: 24px;
}

.skeleton-article .skeleton-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.skeleton-article .skeleton-article-image {
  height: 300px;
  background: var(--skeleton-bg);
  border-radius: 8px;
  margin-bottom: 24px;
}

.skeleton-article .skeleton-article-body .skeleton-text {
  margin-bottom: 12px;
}

/* Profile */
.skeleton-profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

.skeleton-profile .skeleton-profile-info {
  flex: 1;
}

.skeleton-profile .skeleton-profile-info .skeleton-text {
  margin-top: 8px;
}

/* 动画 */
.is-animated .skeleton-item,
.is-animated .skeleton-text,
.is-animated .skeleton-title,
.is-animated .skeleton-avatar,
.is-animated .skeleton-image,
.is-animated .skeleton-article-image,
.is-animated .skeleton-cell {
  background: linear-gradient(
    90deg,
    var(--skeleton-bg) 25%,
    var(--skeleton-highlight) 50%,
    var(--skeleton-bg) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
