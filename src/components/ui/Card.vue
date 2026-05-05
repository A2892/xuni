<template>
  <div 
    class="card" 
    :class="[
      { 'card--bordered': bordered },
      { 'card--hoverable': hoverable },
      { 'card--loading': loading },
      { 'card--shadow': shadow !== 'never' },
      `card--shadow-${shadow}`
    ]"
    :style="bodyStyle"
  >
    <!-- 封面 -->
    <div v-if="$slots.cover" class="card__cover">
      <slot name="cover" />
    </div>
    
    <!-- 头部 -->
    <div v-if="title || $slots.title || extra || $slots.extra" class="card__header">
      <div class="card__header-wrapper">
        <!-- 头像 -->
        <div v-if="$slots.avatar" class="card__avatar">
          <slot name="avatar" />
        </div>
        
        <div class="card__header-content">
          <!-- 标题 -->
          <div class="card__title">
            <slot name="title">{{ title }}</slot>
          </div>
          
          <!-- 描述 -->
          <div v-if="description || $slots.description" class="card__description">
            <slot name="description">{{ description }}</slot>
          </div>
        </div>
      </div>
      
      <!-- 额外操作 -->
      <div v-if="extra || $slots.extra" class="card__extra">
        <slot name="extra">{{ extra }}</slot>
      </div>
    </div>
    
    <!-- 内容 -->
    <div class="card__body" :style="bodyStyle">
      <slot />
      
      <!-- 加载遮罩 -->
      <div v-if="loading" class="card__loading-overlay">
        <div class="card__loading-spinner" />
      </div>
    </div>
    
    <!-- 操作栏 -->
    <div v-if="$slots.actions" class="card__actions">
      <slot name="actions" />
    </div>
    
    <!-- 底部 -->
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // 标题
  title?: string
  // 描述
  description?: string
  // 额外内容
  extra?: string
  // 是否有边框
  bordered?: boolean
  // 是否可悬停
  hoverable?: boolean
  // 是否加载中
  loading?: boolean
  // 阴影显示时机
  shadow?: 'always' | 'hover' | 'never'
  // 内容区样式
  bodyStyle?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  hoverable: false,
  loading: false,
  shadow: 'always'
})
</script>

<style scoped>
.card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.card--bordered {
  border: 1px solid #e8e8e8;
}

.card--shadow {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
              0 1px 6px -1px rgba(0, 0, 0, 0.02),
              0 2px 4px 0 rgba(0, 0, 0, 0.02);
}

.card--shadow-hover {
  box-shadow: none;
}

.card--shadow-hover:hover {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
              0 3px 6px 0 rgba(0, 0, 0, 0.12),
              0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

.card--shadow-always {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
              0 3px 6px 0 rgba(0, 0, 0, 0.12),
              0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

.card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
              0 3px 6px 0 rgba(0, 0, 0, 0.12),
              0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

.card__cover {
  margin: -1px -1px 0;
  overflow: hidden;
}

.card__cover img {
  display: block;
  width: 100%;
  height: auto;
}

.card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card__header-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.card__avatar {
  flex-shrink: 0;
}

.card__header-content {
  flex: 1;
  min-width: 0;
}

.card__title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__description {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__extra {
  flex-shrink: 0;
  color: var(--primary-color, #4B6EF5);
  font-size: 14px;
  cursor: pointer;
}

.card__body {
  position: relative;
  padding: 16px;
}

.card--loading .card__body {
  min-height: 100px;
  pointer-events: none;
}

.card__loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
}

.card__loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f0f0f0;
  border-top-color: var(--primary-color, #4B6EF5);
  border-radius: 50%;
  animation: card-spin 0.8s linear infinite;
}

@keyframes card-spin {
  to {
    transform: rotate(360deg);
  }
}

.card__actions {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.card__actions > :deep(*) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.card__actions > :deep(*):hover {
  color: var(--primary-color, #4B6EF5);
  background: #fafafa;
}

.card__actions > :deep(*):not(:last-child) {
  border-right: 1px solid #f0f0f0;
}

.card__footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}
</style>
