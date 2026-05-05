<template>
  <div 
    class="alert" 
    :class="[
      `alert--${type}`,
      `alert--${variant}`,
      { 'alert--closable': closable, 'is-closed': closed }
    ]"
    role="alert"
  >
    <!-- 图标 -->
    <div class="alert-icon">
      <IconLib :name="iconName" :size="20" />
    </div>
    
    <!-- 内容区域 -->
    <div class="alert-content">
      <div v-if="title" class="alert-title">{{ title }}</div>
      <div class="alert-message">
        <slot>{{ message }}</slot>
      </div>
      <div v-if="$slots.actions" class="alert-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <!-- 关闭按钮 -->
    <button 
      v-if="closable"
      type="button"
      class="alert-close"
      @click="handleClose"
      aria-label="关闭"
    >
      <IconLib name="x" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  type?: 'info' | 'success' | 'warning' | 'error'
  variant?: 'light' | 'filled' | 'outlined' | 'minimal'
  title?: string
  message?: string
  closable?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  variant: 'light'
})

const emit = defineEmits<{
  close: []
}>()

const closed = ref(false)

const iconName = computed(() => {
  if (props.icon) return props.icon
  
  const icons = {
    info: 'info-circle',
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'x-circle'
  }
  return icons[props.type]
})

const handleClose = () => {
  closed.value = true
  emit('close')
}
</script>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.alert.is-closed {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
}

.alert-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-message {
  font-size: 0.9375rem;
  line-height: 1.5;
}

.alert-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.alert-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.alert-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

/* Light 变体 */
.alert--light.alert--info {
  background: #e8f4fd;
  color: #1976d2;
}

.alert--light.alert--success {
  background: #e6f7ed;
  color: #0e9f5e;
}

.alert--light.alert--warning {
  background: #fef7e6;
  color: #e6a23c;
}

.alert--light.alert--error {
  background: #fde8e8;
  color: #dc3545;
}

/* Filled 变体 */
.alert--filled.alert--info {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: #fff;
}

.alert--filled.alert--success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}

.alert--filled.alert--warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.alert--filled.alert--error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
}

.alert--filled .alert-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Outlined 变体 */
.alert--outlined {
  background: transparent;
  border-width: 1px;
  border-style: solid;
}

.alert--outlined.alert--info {
  border-color: #2196f3;
  color: #1976d2;
}

.alert--outlined.alert--success {
  border-color: #10b981;
  color: #059669;
}

.alert--outlined.alert--warning {
  border-color: #f59e0b;
  color: #d97706;
}

.alert--outlined.alert--error {
  border-color: #ef4444;
  color: #dc2626;
}

/* Minimal 变体 */
.alert--minimal {
  padding: 0.75rem 0;
  background: transparent;
  border-radius: 0;
  border-bottom: 1px solid;
}

.alert--minimal.alert--info {
  border-color: rgba(33, 150, 243, 0.3);
  color: #1976d2;
}

.alert--minimal.alert--success {
  border-color: rgba(16, 185, 129, 0.3);
  color: #059669;
}

.alert--minimal.alert--warning {
  border-color: rgba(245, 158, 11, 0.3);
  color: #d97706;
}

.alert--minimal.alert--error {
  border-color: rgba(239, 68, 68, 0.3);
  color: #dc2626;
}
</style>
