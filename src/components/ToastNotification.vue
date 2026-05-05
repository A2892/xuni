<script setup lang="ts">
/**
 * 通知/Toast组件
 * 支持多种类型、位置和自定义配置
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconLibrary from './icons/IconLibrary.vue'

interface ToastItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration: number
  showClose?: boolean
  action?: {
    text: string
    handler: () => void
  }
}

const props = withDefaults(defineProps<{
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
}>(), {
  position: 'top-right',
  maxToasts: 5
})

const toasts = ref<ToastItem[]>([])
const timers = new Map<string, ReturnType<typeof setTimeout>>()

const positionClass = computed(() => `toast-container--${props.position}`)

// 图标映射
const iconMap = {
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'info'
}

// 颜色映射
const colorMap = {
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6'
}

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function show(options: Omit<ToastItem, 'id'> | string) {
  const toast: ToastItem = typeof options === 'string' 
    ? { id: generateId(), type: 'info', title: options, duration: 3000 }
    : { ...options, id: generateId() }
  
  // 限制最大数量
  if (toasts.value.length >= props.maxToasts) {
    const oldest = toasts.value[0]
    remove(oldest.id)
  }
  
  toasts.value.push(toast)
  
  // 自动关闭
  if (toast.duration > 0) {
    const timer = setTimeout(() => {
      remove(toast.id)
    }, toast.duration)
    timers.set(toast.id, timer)
  }
  
  return toast.id
}

function remove(id: string) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
  }
}

function success(title: string, message?: string, duration = 3000) {
  return show({ type: 'success', title, message, duration, showClose: true })
}

function error(title: string, message?: string, duration = 5000) {
  return show({ type: 'error', title, message, duration, showClose: true })
}

function warning(title: string, message?: string, duration = 4000) {
  return show({ type: 'warning', title, message, duration, showClose: true })
}

function info(title: string, message?: string, duration = 3000) {
  return show({ type: 'info', title, message, duration, showClose: true })
}

function clear() {
  toasts.value = []
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
}

// 暴露方法
defineExpose({
  show,
  success,
  error,
  warning,
  info,
  remove,
  clear
})

// 清理定时器
onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer))
})
</script>

<template>
  <Teleport to="body">
    <div :class="['toast-container', positionClass]">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast-item', `toast-item--${toast.type}`]"
        >
          <div class="toast-icon" :style="{ color: colorMap[toast.type] }">
            <IconLibrary :name="iconMap[toast.type]" :size="20" />
          </div>
          
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
            <button 
              v-if="toast.action" 
              class="toast-action"
              @click="toast.action.handler"
            >
              {{ toast.action.text }}
            </button>
          </div>
          
          <button 
            v-if="toast.showClose" 
            class="toast-close"
            @click="remove(toast.id)"
          >
            <IconLibrary name="close" :size="16" />
          </button>
          
          <!-- 进度条 -->
          <div 
            v-if="toast.duration > 0"
            class="toast-progress"
            :style="{ 
              backgroundColor: colorMap[toast.type],
              animationDuration: `${toast.duration}ms`
            }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  max-width: 400px;
  width: 100%;
  padding: 16px;
}

.toast-container--top-right {
  top: 0;
  right: 0;
}

.toast-container--top-left {
  top: 0;
  left: 0;
}

.toast-container--bottom-right {
  bottom: 0;
  right: 0;
  flex-direction: column-reverse;
}

.toast-container--bottom-left {
  bottom: 0;
  left: 0;
  flex-direction: column-reverse;
}

.toast-container--top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container--bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column-reverse;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.toast-item--success {
  border-left: 4px solid #10B981;
}

.toast-item--error {
  border-left: 4px solid #EF4444;
}

.toast-item--warning {
  border-left: 4px solid #F59E0B;
}

.toast-item--info {
  border-left: 4px solid #3B82F6;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.4;
}

.toast-message {
  font-size: 13px;
  color: #6B7280;
  margin-top: 4px;
  line-height: 1.5;
}

.toast-action {
  margin-top: 8px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #3B82F6;
  background: #EFF6FF;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.toast-action:hover {
  background: #DBEAFE;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #9CA3AF;
  cursor: pointer;
  transition: all 0.2s;
}

.toast-close:hover {
  background: #F3F4F6;
  color: #6B7280;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  animation: progress linear forwards;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* 过渡动画 */
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* 响应式 */
@media (max-width: 480px) {
  .toast-container {
    max-width: 100%;
    padding: 12px;
  }
  
  .toast-item {
    padding: 12px;
  }
}
</style>
