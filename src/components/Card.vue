<template>
  <div 
    class="card" 
    :class="[
      `card--${variant}`,
      { 
        'is-hoverable': hoverable, 
        'is-clickable': clickable,
        'is-loading': loading,
        'is-selected': selected
      }
    ]"
    @click="handleClick"
  >
    <!-- 加载遮罩 -->
    <div v-if="loading" class="card-loading-overlay">
      <IconLib name="loader" :size="24" class="card-spinner" />
    </div>
    
    <!-- 封面图 -->
    <div v-if="cover || $slots.cover" class="card-cover">
      <slot name="cover">
        <img :src="cover" :alt="title" class="card-cover-image" />
      </slot>
    </div>
    
    <!-- 头部 -->
    <div v-if="title || $slots.header || $slots.extra" class="card-header">
      <div class="card-header-main">
        <slot name="header">
          <div v-if="icon" class="card-icon">
            <IconLib :name="icon" :size="20" />
          </div>
          <div class="card-header-content">
            <h3 class="card-title">{{ title }}</h3>
            <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
          </div>
        </slot>
      </div>
      <div v-if="$slots.extra" class="card-extra">
        <slot name="extra"></slot>
      </div>
    </div>
    
    <!-- 内容 -->
    <div v-if="$slots.default" class="card-body" :class="{ 'card-body--no-padding': noPadding }">
      <slot></slot>
    </div>
    
    <!-- 底部 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
    
    <!-- 角标 -->
    <div v-if="badge" class="card-badge">{{ badge }}</div>
    
    <!-- 选中状态 -->
    <div v-if="selected" class="card-selected-indicator">
      <IconLib name="check" :size="14" />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconLib from './icons/IconLibrary.vue'

interface Props {
  title?: string
  subtitle?: string
  icon?: string
  cover?: string
  variant?: 'default' | 'outlined' | 'elevated' | 'filled'
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
  selected?: boolean
  noPadding?: boolean
  badge?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 变体 */
.card--default {
  border: 1px solid var(--border-color, #e5e7eb);
}

.card--outlined {
  border: 2px solid var(--border-color, #e5e7eb);
  background: transparent;
}

.card--elevated {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card--filled {
  border: none;
  background: var(--bg-color-secondary, #f9fafb);
}

/* 交互状态 */
.card.is-hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card.is-clickable {
  cursor: pointer;
}

.card.is-selected {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.15);
}

/* 加载遮罩 */
.card-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.card-spinner {
  animation: spin 1s linear infinite;
  color: var(--primary-color, #4B6EF5);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 封面 */
.card-cover {
  position: relative;
  overflow: hidden;
}

.card-cover-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* 头部 */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1rem 0;
}

.card-header-main {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color-light, #e8edfd);
  color: var(--primary-color, #4B6EF5);
  border-radius: 10px;
  flex-shrink: 0;
}

.card-header-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-primary, #333);
  line-height: 1.4;
}

.card-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
  line-height: 1.4;
}

.card-extra {
  flex-shrink: 0;
}

/* 内容 */
.card-body {
  padding: 1rem;
}

.card-body--no-padding {
  padding: 0;
}

/* 底部 */
.card-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-color-secondary, #f9fafb);
}

/* 角标 */
.card-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--primary-color, #4B6EF5);
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 600;
  border-radius: 4px;
}

/* 选中指示器 */
.card-selected-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--primary-color, #4B6EF5);
  color: #fff;
  border-radius: 50%;
}
</style>
