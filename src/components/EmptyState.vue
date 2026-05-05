<template>
  <div class="empty-state" :class="[`size-${size}`]">
    <!-- 图标或插图 -->
    <div class="empty-icon" :class="iconColorClass">
      <slot name="icon">
        <IconLib :name="icon" :size="iconSize" />
      </slot>
    </div>
    
    <!-- 标题 -->
    <h3 v-if="title" class="empty-title">{{ title }}</h3>
    
    <!-- 描述 -->
    <p v-if="description" class="empty-description">{{ description }}</p>
    
    <!-- 自定义内容 -->
    <div v-if="$slots.default" class="empty-content">
      <slot></slot>
    </div>
    
    <!-- 操作按钮 -->
    <div v-if="$slots.action || actionText" class="empty-action">
      <slot name="action">
        <button 
          type="button" 
          class="action-btn"
          @click="$emit('action')"
        >
          <IconLib v-if="actionIcon" :name="actionIcon" :size="18" />
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  icon?: string
  title?: string
  description?: string
  actionText?: string
  actionIcon?: string
  size?: 'small' | 'medium' | 'large'
  type?: 'default' | 'search' | 'error' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  size: 'medium',
  type: 'default'
})

defineEmits<{
  action: []
}>()

// 图标尺寸
const iconSize = computed(() => {
  const sizes = { small: 40, medium: 56, large: 72 }
  return sizes[props.size]
})

// 图标颜色类
const iconColorClass = computed(() => `type-${props.type}`)
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.empty-state.size-small {
  padding: 2rem 1.5rem;
}

.empty-state.size-large {
  padding: 4rem 2rem;
}

/* 图标 */
.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin-bottom: 1.5rem;
  border-radius: 50%;
  background: var(--bg-secondary, #f5f5f5);
}

.empty-state.size-small .empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
}

.empty-state.size-large .empty-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 2rem;
}

.empty-icon.type-default {
  color: var(--text-tertiary, #999);
}

.empty-icon.type-search {
  color: var(--primary-color, #4B6EF5);
  background: rgba(75, 110, 245, 0.1);
}

.empty-icon.type-error {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.empty-icon.type-success {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

/* 标题 */
.empty-title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.empty-state.size-small .empty-title {
  font-size: 1rem;
}

.empty-state.size-large .empty-title {
  font-size: 1.25rem;
}

/* 描述 */
.empty-description {
  margin: 0;
  max-width: 320px;
  font-size: 0.9375rem;
  color: var(--text-secondary, #666);
  line-height: 1.5;
}

.empty-state.size-small .empty-description {
  font-size: 0.875rem;
}

/* 自定义内容 */
.empty-content {
  margin-top: 1rem;
}

/* 操作按钮 */
.empty-action {
  margin-top: 1.5rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, var(--primary-color, #4B6EF5), var(--secondary-color, #6C5CE7));
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
}
</style>
