<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="visible"
        class="confirm-modal__wrapper"
        @click.self="handleWrapperClick"
      >
        <div 
          class="confirm-modal"
          :class="[`confirm-modal--${type}`]"
        >
          <!-- 图标 -->
          <div class="confirm-modal__icon">
            <IconLib :name="iconName" :size="48" />
          </div>
          
          <!-- 标题 -->
          <div class="confirm-modal__title">{{ title }}</div>
          
          <!-- 内容 -->
          <div v-if="content" class="confirm-modal__content">{{ content }}</div>
          
          <!-- 按钮 -->
          <div class="confirm-modal__footer">
            <button 
              v-if="showCancel"
              type="button" 
              class="confirm-modal__btn confirm-modal__btn--cancel"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button 
              type="button" 
              class="confirm-modal__btn confirm-modal__btn--confirm"
              :class="[`confirm-modal__btn--${type}`]"
              :disabled="loading"
              @click="handleConfirm"
            >
              <span v-if="loading" class="confirm-modal__loading">
                <IconLib name="loader" :size="14" class="spin" />
              </span>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 可见性
  visible?: boolean
  // 类型
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm'
  // 标题
  title?: string
  // 内容
  content?: string
  // 确认按钮文字
  confirmText?: string
  // 取消按钮文字
  cancelText?: string
  // 是否显示取消按钮
  showCancel?: boolean
  // 点击遮罩关闭
  maskClosable?: boolean
  // 加载状态
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  type: 'info',
  title: '提示',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  maskClosable: false,
  loading: false
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

// 图标映射
const iconName = computed(() => {
  const icons: Record<string, string> = {
    info: 'info',
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'x-circle',
    confirm: 'help-circle'
  }
  return icons[props.type] || 'info'
})

// 点击遮罩
function handleWrapperClick() {
  if (props.maskClosable) {
    emit('update:visible', false)
    emit('cancel')
  }
}

// 确认
function handleConfirm() {
  if (props.loading) return
  emit('confirm')
}

// 取消
function handleCancel() {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped>
.confirm-modal__wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2000;
}

.confirm-modal {
  background: var(--bg-color, #fff);
  border-radius: 12px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16);
}

.confirm-modal__icon {
  margin-bottom: 16px;
}

.confirm-modal--info .confirm-modal__icon {
  color: var(--primary-color, #4B6EF5);
}

.confirm-modal--success .confirm-modal__icon {
  color: #67c23a;
}

.confirm-modal--warning .confirm-modal__icon {
  color: #e6a23c;
}

.confirm-modal--error .confirm-modal__icon {
  color: #f56c6c;
}

.confirm-modal--confirm .confirm-modal__icon {
  color: #e6a23c;
}

.confirm-modal__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #303133);
  margin-bottom: 8px;
}

.confirm-modal__content {
  font-size: 14px;
  color: var(--text-secondary, #606266);
  line-height: 1.6;
  margin-bottom: 24px;
}

.confirm-modal__footer {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-modal__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 100px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-modal__btn--cancel {
  border: 1px solid var(--border-color, #dcdfe6);
  background: #fff;
  color: var(--text-color, #606266);
}

.confirm-modal__btn--cancel:hover {
  color: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
}

.confirm-modal__btn--confirm {
  border: none;
  color: #fff;
}

.confirm-modal__btn--info,
.confirm-modal__btn--confirm {
  background: var(--primary-color, #4B6EF5);
}

.confirm-modal__btn--info:hover,
.confirm-modal__btn--confirm:hover {
  background: var(--primary-hover, #3b5de7);
}

.confirm-modal__btn--success {
  background: #67c23a;
}

.confirm-modal__btn--success:hover {
  background: #5daf34;
}

.confirm-modal__btn--warning {
  background: #e6a23c;
}

.confirm-modal__btn--warning:hover {
  background: #d9952f;
}

.confirm-modal__btn--error {
  background: #f56c6c;
}

.confirm-modal__btn--error:hover {
  background: #f25a5a;
}

.confirm-modal__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-modal__loading {
  display: flex;
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

.modal-enter-active .confirm-modal,
.modal-leave-active .confirm-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirm-modal {
  transform: scale(0.9);
}

.modal-leave-to .confirm-modal {
  transform: scale(0.9);
}
</style>
