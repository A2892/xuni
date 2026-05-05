<template>
  <Teleport to="body">
    <transition name="confirm-fade">
      <div v-if="visible" class="confirm-overlay" @click="handleOverlayClick">
        <transition name="confirm-scale">
          <div v-if="visible" class="confirm-dialog" :class="[`type-${type}`]" @click.stop>
            <!-- 图标 -->
            <div class="confirm-icon" :class="iconColorClass">
              <IconLib :name="iconName" :size="28" />
            </div>
            
            <!-- 内容 -->
            <div class="confirm-content">
              <h3 v-if="title" class="confirm-title">{{ title }}</h3>
              <p v-if="message" class="confirm-message">{{ message }}</p>
              <slot></slot>
            </div>
            
            <!-- 输入框（用于prompt类型） -->
            <div v-if="showInput" class="confirm-input">
              <input
                ref="inputRef"
                v-model="inputValue"
                type="text"
                class="input-field"
                :placeholder="inputPlaceholder"
                @keydown.enter="handleConfirm"
              />
            </div>
            
            <!-- 按钮 -->
            <div class="confirm-actions">
              <button 
                v-if="showCancel"
                type="button"
                class="btn btn-cancel"
                :disabled="loading"
                @click="handleCancel"
              >
                {{ cancelText }}
              </button>
              <button 
                type="button"
                class="btn btn-confirm"
                :class="confirmButtonClass"
                :disabled="loading || (showInput && !inputValue)"
                @click="handleConfirm"
              >
                <span v-if="loading" class="loading-spinner"></span>
                {{ confirmText }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  visible: boolean
  type?: 'info' | 'success' | 'warning' | 'danger' | 'confirm'
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  showInput?: boolean
  inputPlaceholder?: string
  inputDefault?: string
  closeOnOverlay?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'confirm',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  showInput: false,
  inputPlaceholder: '请输入...',
  inputDefault: '',
  closeOnOverlay: true,
  loading: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value?: string]
  cancel: []
}>()

// 输入值
const inputRef = ref<HTMLInputElement>()
const inputValue = ref(props.inputDefault)

// 图标名称
const iconName = computed(() => {
  const icons = {
    info: 'info',
    success: 'check-circle',
    warning: 'alert-triangle',
    danger: 'alert-circle',
    confirm: 'help-circle'
  }
  return icons[props.type]
})

// 图标颜色类
const iconColorClass = computed(() => `icon-${props.type}`)

// 确认按钮类
const confirmButtonClass = computed(() => {
  if (props.type === 'danger') return 'btn-danger'
  if (props.type === 'warning') return 'btn-warning'
  return 'btn-primary'
})

// 关闭对话框
const close = () => {
  emit('update:visible', false)
}

// 处理确认
const handleConfirm = () => {
  if (props.loading) return
  if (props.showInput && !inputValue.value) return
  
  emit('confirm', props.showInput ? inputValue.value : undefined)
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  close()
}

// 处理遮罩点击
const handleOverlayClick = () => {
  if (props.closeOnOverlay && !props.loading) {
    handleCancel()
  }
}

// 监听显示状态
watch(() => props.visible, (visible) => {
  if (visible) {
    inputValue.value = props.inputDefault
    document.body.style.overflow = 'hidden'
    
    if (props.showInput) {
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 2000;
}

.confirm-dialog {
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  background: var(--bg-primary, #fff);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
}

/* 图标 */
.confirm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 1rem;
  border-radius: 50%;
}

.confirm-icon.icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.confirm-icon.icon-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.confirm-icon.icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.confirm-icon.icon-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.confirm-icon.icon-confirm {
  background: rgba(75, 110, 245, 0.1);
  color: var(--primary-color, #4B6EF5);
}

/* 内容 */
.confirm-content {
  margin-bottom: 1.5rem;
}

.confirm-title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.confirm-message {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-secondary, #666);
  line-height: 1.5;
}

/* 输入框 */
.confirm-input {
  margin-bottom: 1.5rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  color: var(--text-primary, #1a1a1a);
  background: var(--bg-secondary, #f5f5f5);
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

/* 按钮 */
.confirm-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
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

.btn-cancel {
  color: var(--text-primary, #1a1a1a);
  background: var(--bg-tertiary, #e5e7eb);
}

.btn-cancel:hover:not(:disabled) {
  background: #d1d5db;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--primary-color, #4B6EF5), var(--secondary-color, #6C5CE7));
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
}

.btn-danger {
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-warning {
  color: #fff;
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.btn-warning:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.3s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-scale-enter-active,
.confirm-scale-leave-active {
  transition: all 0.3s ease;
}

.confirm-scale-enter-from,
.confirm-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
