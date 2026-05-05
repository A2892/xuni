<template>
  <Teleport to="body">
    <transition name="drawer">
      <div 
        v-if="modelValue" 
        class="drawer-overlay"
        @click="handleOverlayClick"
      >
        <div 
          class="drawer-container"
          :class="[`position-${position}`, `size-${size}`]"
          :style="drawerStyle"
          @click.stop
        >
          <!-- 头部 -->
          <div v-if="showHeader" class="drawer-header">
            <slot name="header">
              <h3 class="drawer-title">{{ title }}</h3>
              <p v-if="description" class="drawer-description">{{ description }}</p>
            </slot>
            <button 
              v-if="closable"
              type="button" 
              class="close-btn"
              @click="close"
            >
              <IconLib name="x" :size="20" />
            </button>
          </div>
          
          <!-- 内容 -->
          <div class="drawer-body" :class="{ 'no-padding': noPadding }">
            <slot></slot>
          </div>
          
          <!-- 底部 -->
          <div v-if="$slots.footer || showFooter" class="drawer-footer">
            <slot name="footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="close"
              >
                {{ cancelText }}
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                :disabled="confirmLoading"
                @click="handleConfirm"
              >
                <span v-if="confirmLoading" class="loading-spinner"></span>
                {{ confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  modelValue: boolean
  title?: string
  description?: string
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'small' | 'medium' | 'large' | 'full'
  width?: string
  height?: string
  showHeader?: boolean
  showFooter?: boolean
  closable?: boolean
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
  confirmText?: string
  cancelText?: string
  confirmLoading?: boolean
  noPadding?: boolean
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  position: 'right',
  size: 'medium',
  showHeader: true,
  showFooter: false,
  closable: true,
  closeOnOverlay: true,
  closeOnEsc: true,
  confirmText: '确定',
  cancelText: '取消',
  confirmLoading: false,
  noPadding: false,
  zIndex: 1000
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  confirm: []
}>()

// 抽屉样式
const drawerStyle = computed(() => {
  const styles: Record<string, string> = {
    '--drawer-z-index': String(props.zIndex)
  }
  
  if (props.width && (props.position === 'left' || props.position === 'right')) {
    styles.width = props.width
  }
  
  if (props.height && (props.position === 'top' || props.position === 'bottom')) {
    styles.height = props.height
  }
  
  return styles
})

// 关闭抽屉
const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

// 处理确认
const handleConfirm = () => {
  emit('confirm')
}

// 处理ESC键
const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnEsc && props.modelValue) {
    close()
  }
}

// 锁定body滚动
watch(() => props.modelValue, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--drawer-z-index, 1000);
  backdrop-filter: blur(2px);
}

.drawer-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, #fff);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: calc(var(--drawer-z-index, 1000) + 1);
}

/* 位置 */
.drawer-container.position-left {
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 0 16px 16px 0;
}

.drawer-container.position-right {
  right: 0;
  top: 0;
  bottom: 0;
  border-radius: 16px 0 0 16px;
}

.drawer-container.position-top {
  top: 0;
  left: 0;
  right: 0;
  border-radius: 0 0 16px 16px;
}

.drawer-container.position-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 16px 16px 0 0;
}

/* 尺寸 - 左右 */
.position-left.size-small,
.position-right.size-small {
  width: 320px;
}

.position-left.size-medium,
.position-right.size-medium {
  width: 480px;
}

.position-left.size-large,
.position-right.size-large {
  width: 640px;
}

.position-left.size-full,
.position-right.size-full {
  width: 100%;
}

/* 尺寸 - 上下 */
.position-top.size-small,
.position-bottom.size-small {
  height: 240px;
}

.position-top.size-medium,
.position-bottom.size-medium {
  height: 360px;
}

.position-top.size-large,
.position-bottom.size-large {
  height: 480px;
}

.position-top.size-full,
.position-bottom.size-full {
  height: 100%;
}

/* 头部 */
.drawer-header {
  position: relative;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.drawer-title {
  margin: 0;
  padding-right: 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.drawer-description {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-tertiary, #999);
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary, #1a1a1a);
  background: var(--bg-hover, #f3f4f6);
}

/* 内容 */
.drawer-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.drawer-body.no-padding {
  padding: 0;
}

/* 底部 */
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--primary-color, #4B6EF5), var(--secondary-color, #6C5CE7));
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
}

.btn-secondary {
  color: var(--text-primary, #1a1a1a);
  background: var(--bg-tertiary, #e5e7eb);
}

.btn-secondary:hover:not(:disabled) {
  background: #d1d5db;
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 过渡动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .drawer-container,
.drawer-leave-active .drawer-container {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

/* 左侧抽屉 */
.drawer-enter-from .position-left,
.drawer-leave-to .position-left {
  transform: translateX(-100%);
}

/* 右侧抽屉 */
.drawer-enter-from .position-right,
.drawer-leave-to .position-right {
  transform: translateX(100%);
}

/* 顶部抽屉 */
.drawer-enter-from .position-top,
.drawer-leave-to .position-top {
  transform: translateY(-100%);
}

/* 底部抽屉 */
.drawer-enter-from .position-bottom,
.drawer-leave-to .position-bottom {
  transform: translateY(100%);
}

/* 响应式 */
@media (max-width: 640px) {
  .position-left.size-medium,
  .position-right.size-medium,
  .position-left.size-large,
  .position-right.size-large {
    width: 100%;
    border-radius: 0;
  }
}
</style>
