<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue"
        class="modal-overlay"
        :style="{ zIndex }"
        @click.self="handleOverlayClick"
        @keydown.esc="handleEsc"
      >
        <div 
          class="modal"
          :class="[`modal-${size}`, { 'modal-centered': centered, 'modal-fullscreen': fullscreen }]"
          role="dialog"
          aria-modal="true"
          ref="modalRef"
        >
          <!-- 头部 -->
          <div v-if="showHeader" class="modal-header">
            <slot name="header">
              <h3 class="modal-title">{{ title }}</h3>
            </slot>
            <button 
              v-if="closable"
              class="modal-close"
              @click="handleClose"
            >
              <IconLib name="x" :size="20" />
            </button>
          </div>
          
          <!-- 内容 -->
          <div class="modal-body" :style="bodyStyle">
            <slot></slot>
          </div>
          
          <!-- 底部 -->
          <div v-if="showFooter" class="modal-footer">
            <slot name="footer">
              <button 
                v-if="showCancel"
                class="btn btn-cancel"
                :disabled="cancelDisabled"
                @click="handleCancel"
              >
                {{ cancelText }}
              </button>
              <button 
                v-if="showConfirm"
                class="btn btn-confirm"
                :disabled="confirmDisabled"
                :class="{ 'is-loading': confirmLoading }"
                @click="handleConfirm"
              >
                <IconLib v-if="confirmLoading" name="loader" :size="14" class="spin" />
                {{ confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Props
interface Props {
  modelValue: boolean
  title?: string
  size?: 'small' | 'default' | 'large' | 'xlarge'
  width?: string | number
  maxHeight?: string | number
  centered?: boolean
  fullscreen?: boolean
  closable?: boolean
  maskClosable?: boolean
  escClosable?: boolean
  showHeader?: boolean
  showFooter?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelText?: string
  confirmText?: string
  cancelDisabled?: boolean
  confirmDisabled?: boolean
  confirmLoading?: boolean
  lockScroll?: boolean
  zIndex?: number
  destroyOnClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'default',
  centered: true,
  fullscreen: false,
  closable: true,
  maskClosable: true,
  escClosable: true,
  showHeader: true,
  showFooter: true,
  showCancel: true,
  showConfirm: true,
  cancelText: '取消',
  confirmText: '确定',
  cancelDisabled: false,
  confirmDisabled: false,
  confirmLoading: false,
  lockScroll: true,
  zIndex: 1000,
  destroyOnClose: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open': []
  'close': []
  'cancel': []
  'confirm': []
  'opened': []
  'closed': []
}>()

// Refs
const modalRef = ref<HTMLElement | null>(null)

// Computed
const bodyStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
    style.overflowY = 'auto'
  }
  
  return style
})

// Methods
function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleCancel() {
  emit('cancel')
  handleClose()
}

function handleConfirm() {
  emit('confirm')
}

function handleOverlayClick() {
  if (props.maskClosable) {
    handleClose()
  }
}

function handleEsc(e: KeyboardEvent) {
  if (props.escClosable && e.key === 'Escape') {
    handleClose()
  }
}

// Watch
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    emit('open')
    
    if (props.lockScroll) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '15px' // 防止滚动条跳动
    }
    
    nextTick(() => {
      modalRef.value?.focus()
      emit('opened')
    })
  } else {
    if (props.lockScroll) {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    
    nextTick(() => {
      emit('closed')
    })
  }
})

// Lifecycle
onUnmounted(() => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 50px 16px;
  overflow-y: auto;
}

.modal-centered .modal-overlay,
.modal {
  display: flex;
  flex-direction: column;
}

.modal-overlay:has(.modal-centered) {
  align-items: center;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 100%;
  max-height: calc(100vh - 100px);
  overflow: hidden;
}

/* 尺寸 */
.modal-small {
  width: 400px;
}

.modal-default {
  width: 520px;
}

.modal-large {
  width: 720px;
}

.modal-xlarge {
  width: 960px;
}

.modal-fullscreen {
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
  margin: 0;
}

/* 头部 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

/* 内容 */
.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #666;
}

.btn-cancel:hover:not(:disabled) {
  background: #e8e8e8;
}

.btn-confirm {
  background: var(--primary-color, #4B6EF5);
  border: none;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.is-loading {
  pointer-events: none;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}
</style>
