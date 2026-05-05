<template>
  <div class="tag" :class="[`tag--${type}`, `tag--${size}`, `tag--${variant}`, { 'is-clickable': clickable }]" @click="handleClick">
    <!-- 图标 -->
    <IconLib v-if="icon" :name="icon" :size="iconSize" class="tag-icon" />
    
    <!-- 内容 -->
    <span class="tag-content">
      <slot>{{ label }}</slot>
    </span>
    
    <!-- 关闭按钮 -->
    <button 
      v-if="closable"
      type="button"
      class="tag-close"
      @click.stop="$emit('close')"
      aria-label="删除"
    >
      <IconLib name="x" :size="12" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  label?: string
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'filled' | 'light' | 'outlined' | 'ghost'
  icon?: string
  closable?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'md',
  variant: 'light'
})

const emit = defineEmits<{
  click: []
  close: []
}>()

const iconSize = computed(() => {
  const sizes = { sm: 12, md: 14, lg: 16 }
  return sizes[props.size]
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tag.is-clickable {
  cursor: pointer;
}

/* 尺寸 */
.tag--sm {
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
}

.tag--md {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.tag--lg {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.tag-icon {
  flex-shrink: 0;
}

.tag-content {
  line-height: 1.3;
}

.tag-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  margin-left: 0.125rem;
  margin-right: -0.125rem;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.tag-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

/* Light 变体 */
.tag--light.tag--default {
  background: #f3f4f6;
  color: #374151;
}

.tag--light.tag--primary {
  background: #e8edfd;
  color: #4B6EF5;
}

.tag--light.tag--success {
  background: #d1fae5;
  color: #059669;
}

.tag--light.tag--warning {
  background: #fef3c7;
  color: #d97706;
}

.tag--light.tag--danger {
  background: #fee2e2;
  color: #dc2626;
}

.tag--light.tag--info {
  background: #dbeafe;
  color: #2563eb;
}

/* Filled 变体 */
.tag--filled.tag--default {
  background: #6b7280;
  color: #fff;
}

.tag--filled.tag--primary {
  background: #4B6EF5;
  color: #fff;
}

.tag--filled.tag--success {
  background: #10b981;
  color: #fff;
}

.tag--filled.tag--warning {
  background: #f59e0b;
  color: #fff;
}

.tag--filled.tag--danger {
  background: #ef4444;
  color: #fff;
}

.tag--filled.tag--info {
  background: #3b82f6;
  color: #fff;
}

.tag--filled .tag-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Outlined 变体 */
.tag--outlined {
  background: transparent;
  border: 1px solid;
}

.tag--outlined.tag--default {
  border-color: #d1d5db;
  color: #6b7280;
}

.tag--outlined.tag--primary {
  border-color: #4B6EF5;
  color: #4B6EF5;
}

.tag--outlined.tag--success {
  border-color: #10b981;
  color: #10b981;
}

.tag--outlined.tag--warning {
  border-color: #f59e0b;
  color: #f59e0b;
}

.tag--outlined.tag--danger {
  border-color: #ef4444;
  color: #ef4444;
}

.tag--outlined.tag--info {
  border-color: #3b82f6;
  color: #3b82f6;
}

/* Ghost 变体 */
.tag--ghost {
  background: transparent;
}

.tag--ghost.tag--default {
  color: #6b7280;
}

.tag--ghost.tag--primary {
  color: #4B6EF5;
}

.tag--ghost.tag--success {
  color: #10b981;
}

.tag--ghost.tag--warning {
  color: #f59e0b;
}

.tag--ghost.tag--danger {
  color: #ef4444;
}

.tag--ghost.tag--info {
  color: #3b82f6;
}

.tag--ghost.is-clickable:hover {
  background: rgba(0, 0, 0, 0.05);
}
</style>
