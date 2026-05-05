<template>
  <Teleport to="body">
    <transition name="toast-fade">
      <div v-if="visible" class="toast-container" :class="`toast-container--${position}`">
        <div 
          class="toast"
          :class="[`toast--${type}`, { 'toast--with-progress': showProgress }]"
          role="alert"
        >
          <!-- 图标 -->
          <div class="toast-icon">
            <IconLib :name="iconName" :size="20" />
          </div>
          
          <!-- 内容 -->
          <div class="toast-content">
            <div v-if="title" class="toast-title">{{ title }}</div>
            <div class="toast-message">{{ message }}</div>
          </div>
          
          <!-- 关闭按钮 -->
          <button 
            v-if="closable"
            type="button"
            class="toast-close"
            @click="close"
            aria-label="关闭"
          >
            <IconLib name="x" :size="16" />
          </button>
          
          <!-- 进度条 -->
          <div 
            v-if="showProgress && duration > 0" 
            class="toast-progress"
            :style="{ animationDuration: `${duration}ms` }"
          ></div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'
  closable?: boolean
  showProgress?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  position: 'top-right',
  closable: true,
  showProgress: true
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

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

const close = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  setTimeout(() => emit('close'), 300)
}

onMounted(() => {
  visible.value = true
  if (props.duration > 0) {
    timer = setTimeout(close, props.duration)
  }
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
}

.toast-container--top-right {
  top: 1rem;
  right: 1rem;
}

.toast-container--top-left {
  top: 1rem;
  left: 1rem;
}

.toast-container--top-center {
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container--bottom-right {
  bottom: 1rem;
  right: 1rem;
}

.toast-container--bottom-left {
  bottom: 1rem;
  left: 1rem;
}

.toast-container--bottom-center {
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 300px;
  max-width: 450px;
  padding: 1rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  pointer-events: all;
  position: relative;
  overflow: hidden;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
  color: var(--text-color-primary, #333);
}

.toast-message {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-color-secondary, #666);
}

.toast-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-color-muted, #999);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: var(--bg-color-secondary, #f5f5f5);
  color: var(--text-color-primary, #333);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  opacity: 0.3;
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* 类型样式 */
.toast--info {
  border-left: 4px solid #2196f3;
}

.toast--info .toast-icon {
  color: #2196f3;
}

.toast--success {
  border-left: 4px solid #10b981;
}

.toast--success .toast-icon {
  color: #10b981;
}

.toast--warning {
  border-left: 4px solid #f59e0b;
}

.toast--warning .toast-icon {
  color: #f59e0b;
}

.toast--error {
  border-left: 4px solid #ef4444;
}

.toast--error .toast-icon {
  color: #ef4444;
}

/* 过渡动画 */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-container--top-left .toast-fade-enter-from,
.toast-container--top-left .toast-fade-leave-to,
.toast-container--bottom-left .toast-fade-enter-from,
.toast-container--bottom-left .toast-fade-leave-to {
  transform: translateX(-100%);
}

.toast-container--top-center .toast-fade-enter-from,
.toast-container--top-center .toast-fade-leave-to {
  transform: translateY(-100%);
}

.toast-container--bottom-center .toast-fade-enter-from,
.toast-container--bottom-center .toast-fade-leave-to {
  transform: translateY(100%);
}
</style>
