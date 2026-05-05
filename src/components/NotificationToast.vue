<template>
  <transition name="notification">
    <div 
      v-if="visible"
      :class="['notification', `notification-${type}`, `position-${position}`]"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <!-- 图标 -->
      <div class="notification-icon">
        <IconLib :name="iconName" :size="20" />
      </div>
      
      <!-- 内容 -->
      <div class="notification-content">
        <div v-if="title" class="notification-title">{{ title }}</div>
        <div class="notification-message">{{ message }}</div>
        
        <!-- 操作按钮 -->
        <div v-if="actions && actions.length > 0" class="notification-actions">
          <button 
            v-for="(action, index) in actions" 
            :key="index"
            :class="['action-btn', action.type || 'default']"
            @click="handleAction(action)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
      
      <!-- 关闭按钮 -->
      <button 
        v-if="closable" 
        class="close-btn"
        @click="close"
      >
        <IconLib name="x" :size="16" />
      </button>
      
      <!-- 进度条 -->
      <div 
        v-if="showProgress && duration > 0" 
        class="notification-progress"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
interface NotificationAction {
  label: string
  type?: 'default' | 'primary'
  handler?: () => void
}

// Props
interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number  // 0 表示不自动关闭
  closable?: boolean
  showProgress?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  actions?: NotificationAction[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 4500,
  closable: true,
  showProgress: true,
  position: 'top-right'
})

// Emits
const emit = defineEmits<{
  close: []
  action: [action: NotificationAction]
}>()

// State
const visible = ref(false)
const progress = ref(100)
const timerId = ref<number | null>(null)
const startTime = ref(0)
const remainingTime = ref(0)

// Computed
const iconName = computed(() => {
  const icons: Record<string, string> = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-triangle',
    info: 'info'
  }
  return icons[props.type] || 'info'
})

// Methods
function startTimer() {
  if (props.duration <= 0) return
  
  remainingTime.value = props.duration
  startTime.value = Date.now()
  
  const tick = () => {
    const elapsed = Date.now() - startTime.value
    const remaining = remainingTime.value - elapsed
    
    if (remaining <= 0) {
      close()
    } else {
      progress.value = (remaining / props.duration) * 100
      timerId.value = window.requestAnimationFrame(tick)
    }
  }
  
  timerId.value = window.requestAnimationFrame(tick)
}

function pauseTimer() {
  if (timerId.value !== null) {
    cancelAnimationFrame(timerId.value)
    timerId.value = null
    remainingTime.value = remainingTime.value - (Date.now() - startTime.value)
  }
}

function resumeTimer() {
  if (props.duration > 0 && remainingTime.value > 0) {
    startTime.value = Date.now()
    startTimer()
  }
}

function close() {
  visible.value = false
  if (timerId.value !== null) {
    cancelAnimationFrame(timerId.value)
    timerId.value = null
  }
  emit('close')
}

function handleAction(action: NotificationAction) {
  action.handler?.()
  emit('action', action)
  close()
}

// Lifecycle
onMounted(() => {
  visible.value = true
  startTimer()
})

onUnmounted(() => {
  if (timerId.value !== null) {
    cancelAnimationFrame(timerId.value)
  }
})

// Expose
defineExpose({
  close
})
</script>

<style scoped>
.notification {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 400px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 类型样式 */
.notification-success .notification-icon {
  color: #52c41a;
}

.notification-error .notification-icon {
  color: #ff4d4f;
}

.notification-warning .notification-icon {
  color: #faad14;
}

.notification-info .notification-icon {
  color: var(--primary-color, #4B6EF5);
}

/* 图标 */
.notification-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

/* 内容 */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  word-break: break-word;
}

/* 操作按钮 */
.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.default {
  background: #f5f5f5;
  color: #666;
}

.action-btn.default:hover {
  background: #e8e8e8;
}

.action-btn.primary {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.action-btn.primary:hover {
  opacity: 0.9;
}

/* 关闭按钮 */
.close-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

/* 进度条 */
.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  opacity: 0.3;
  transition: width 0.1s linear;
}

.notification-success .notification-progress {
  background: #52c41a;
}

.notification-error .notification-progress {
  background: #ff4d4f;
}

.notification-warning .notification-progress {
  background: #faad14;
}

.notification-info .notification-progress {
  background: var(--primary-color, #4B6EF5);
}

/* 位置 */
.position-top-right {
  position: fixed;
  top: 20px;
  right: 20px;
}

.position-top-left {
  position: fixed;
  top: 20px;
  left: 20px;
}

.position-bottom-right {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.position-bottom-left {
  position: fixed;
  bottom: 20px;
  left: 20px;
}

.position-top-center {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.position-bottom-center {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

/* 动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.position-top-right.notification-enter-from,
.position-top-right.notification-leave-to,
.position-bottom-right.notification-enter-from,
.position-bottom-right.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.position-top-left.notification-enter-from,
.position-top-left.notification-leave-to,
.position-bottom-left.notification-enter-from,
.position-bottom-left.notification-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.position-top-center.notification-enter-from,
.position-top-center.notification-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.position-bottom-center.notification-enter-from,
.position-bottom-center.notification-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
