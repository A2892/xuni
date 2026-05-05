<script setup lang="ts">
/**
 * 模态框组件
 * 支持多种尺寸、动画和自定义内容
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import IconLibrary from './icons/IconLibrary.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  closable?: boolean
  maskClosable?: boolean
  showFooter?: boolean
  confirmText?: string
  cancelText?: string
  confirmLoading?: boolean
  confirmType?: 'primary' | 'danger' | 'success'
  centered?: boolean
  persistent?: boolean
}>(), {
  size: 'medium',
  closable: true,
  maskClosable: true,
  showFooter: true,
  confirmText: '确定',
  cancelText: '取消',
  confirmLoading: false,
  confirmType: 'primary',
  centered: true,
  persistent: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
  'open': []
  'close': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const sizeClass = computed(() => `modal--${props.size}`)

const confirmButtonClass = computed(() => {
  const typeClasses = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    success: 'btn-success'
  }
  return typeClasses[props.confirmType]
})

function handleClose() {
  if (!props.persistent) {
    visible.value = false
    emit('close')
  }
}

function handleMaskClick() {
  if (props.maskClosable) {
    handleClose()
  }
}

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  handleClose()
  emit('cancel')
}

// ESC键关闭
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && visible.value && props.closable) {
    handleClose()
  }
}

// 监听显示状态
watch(() => props.modelValue, (val) => {
  if (val) {
    emit('open')
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="handleMaskClick">
        <Transition name="modal-scale" appear>
          <div :class="['modal', sizeClass, { 'modal--centered': centered }]">
            <!-- 头部 -->
            <div v-if="title || closable || $slots.header" class="modal-header">
              <slot name="header">
                <h3 class="modal-title">{{ title }}</h3>
              </slot>
              <button 
                v-if="closable" 
                class="modal-close"
                @click="handleClose"
                aria-label="关闭"
              >
                <IconLibrary name="close" :size="20" />
              </button>
            </div>
            
            <!-- 内容 -->
            <div class="modal-body">
              <slot />
            </div>
            
            <!-- 底部 -->
            <div v-if="showFooter || $slots.footer" class="modal-footer">
              <slot name="footer">
                <button 
                  class="btn btn-secondary"
                  @click="handleCancel"
                >
                  {{ cancelText }}
                </button>
                <button 
                  :class="['btn', confirmButtonClass]"
                  :disabled="confirmLoading"
                  @click="handleConfirm"
                >
                  <IconLibrary 
                    v-if="confirmLoading" 
                    name="loader" 
                    :size="16" 
                    class="spin" 
                  />
                  {{ confirmText }}
                </button>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 16px;
  z-index: 9999;
  overflow-y: auto;
}

.modal--centered {
  margin: auto;
}

.modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 96px);
  position: relative;
}

/* 尺寸 */
.modal--small {
  width: 100%;
  max-width: 400px;
}

.modal--medium {
  width: 100%;
  max-width: 560px;
}

.modal--large {
  width: 100%;
  max-width: 800px;
}

.modal--full {
  width: calc(100% - 32px);
  height: calc(100vh - 96px);
  max-width: none;
}

/* 头部 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #F3F4F6;
  color: #374151;
}

/* 内容 */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* 底部 */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
  flex-shrink: 0;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #F3F4F6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #E5E7EB;
}

.btn-primary {
  background: linear-gradient(135deg, #4B6EF5 0%, #6C5CE7 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* 加载动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  animation: scaleIn 0.3s ease-out;
}

.modal-scale-leave-active {
  animation: scaleOut 0.2s ease-in;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* 响应式 */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 16px;
    align-items: flex-end;
  }
  
  .modal {
    border-radius: 16px 16px 0 0;
    max-height: 90vh;
    width: 100%;
    max-width: 100%;
  }
  
  .modal--centered {
    margin: 0;
    margin-top: auto;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 12px 20px;
    flex-direction: column-reverse;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
}
</style>
