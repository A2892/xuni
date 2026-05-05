<template>
  <form class="smart-form" :class="formClasses" @submit.prevent="handleSubmit">
    <div v-if="title || $slots.header" class="form-header">
      <slot name="header">
        <h3 v-if="title" class="form-title">{{ title }}</h3>
        <p v-if="description" class="form-description">{{ description }}</p>
      </slot>
    </div>
    
    <div class="form-body">
      <div class="form-grid" :style="gridStyle">
        <slot></slot>
      </div>
    </div>
    
    <div v-if="$slots.footer || showActions" class="form-footer">
      <slot name="footer">
        <div class="form-actions">
          <button 
            v-if="showReset" 
            type="button" 
            class="btn btn-secondary"
            :disabled="isSubmitting"
            @click="handleReset"
          >
            <IconLib name="rotate-ccw" :size="18" />
            {{ resetText }}
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="isSubmitting || (validateOnSubmit && !isFormValid)"
          >
            <template v-if="isSubmitting">
              <span class="loading-spinner"></span>
              {{ submittingText }}
            </template>
            <template v-else>
              <IconLib :name="submitIcon" :size="18" />
              {{ submitText }}
            </template>
          </button>
        </div>
      </slot>
    </div>
    
    <!-- 全局错误提示 -->
    <transition name="error-fade">
      <div v-if="globalError" class="global-error">
        <IconLib name="alert-triangle" :size="18" />
        <span>{{ globalError }}</span>
        <button type="button" class="close-error" @click="globalError = ''">
          <IconLib name="x" :size="16" />
        </button>
      </div>
    </transition>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, provide, reactive, watch } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  title?: string
  description?: string
  layout?: 'vertical' | 'horizontal' | 'inline'
  columns?: number
  gap?: string
  showActions?: boolean
  showReset?: boolean
  submitText?: string
  submittingText?: string
  submitIcon?: string
  resetText?: string
  validateOnSubmit?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
  columns: 1,
  gap: '1rem',
  showActions: true,
  showReset: false,
  submitText: '提交',
  submittingText: '提交中...',
  submitIcon: 'check',
  resetText: '重置',
  validateOnSubmit: true,
  disabled: false
})

const emit = defineEmits<{
  submit: [formData: Record<string, any>]
  reset: []
  'validation-error': [errors: Record<string, string[]>]
}>()

// 状态
const isSubmitting = ref(false)
const globalError = ref('')
const formFields = reactive<Map<string, any>>(new Map())

// 表单是否有效
const isFormValid = computed(() => {
  for (const field of formFields.values()) {
    if (field.hasError) return false
  }
  return true
})

// 表单类名
const formClasses = computed(() => ({
  [`layout-${props.layout}`]: true,
  'is-submitting': isSubmitting.value,
  'is-disabled': props.disabled
}))

// 网格样式
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
  gap: props.gap
}))

// 注册字段
const registerField = (name: string, field: any) => {
  formFields.set(name, field)
}

// 注销字段
const unregisterField = (name: string) => {
  formFields.delete(name)
}

// 提供给子组件
provide('form', {
  registerField,
  unregisterField,
  disabled: computed(() => props.disabled)
})

// 验证所有字段
const validateAll = async (): Promise<boolean> => {
  let isValid = true
  const errors: Record<string, string[]> = {}
  
  for (const [name, field] of formFields) {
    if (field.validate) {
      const valid = field.validate()
      if (!valid) {
        isValid = false
        if (field.errors) {
          errors[name] = field.errors
        }
      }
    }
  }
  
  if (!isValid) {
    emit('validation-error', errors)
  }
  
  return isValid
}

// 重置所有字段
const resetAll = () => {
  for (const field of formFields.values()) {
    if (field.clearValidation) {
      field.clearValidation()
    }
  }
  globalError.value = ''
}

// 处理提交
const handleSubmit = async () => {
  if (props.disabled || isSubmitting.value) return
  
  globalError.value = ''
  
  if (props.validateOnSubmit) {
    const isValid = await validateAll()
    if (!isValid) {
      globalError.value = '请检查并修正表单中的错误'
      return
    }
  }
  
  isSubmitting.value = true
  
  try {
    // 收集表单数据
    const formData: Record<string, any> = {}
    // 这里可以通过子组件收集数据
    emit('submit', formData)
  } catch (error: any) {
    globalError.value = error.message || '提交失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}

// 处理重置
const handleReset = () => {
  resetAll()
  emit('reset')
}

// 设置全局错误
const setError = (message: string) => {
  globalError.value = message
}

// 设置提交状态
const setSubmitting = (value: boolean) => {
  isSubmitting.value = value
}

// 暴露方法
defineExpose({
  validateAll,
  resetAll,
  setError,
  setSubmitting,
  isSubmitting,
  isFormValid
})
</script>

<style scoped>
.smart-form {
  position: relative;
}

/* 表单头部 */
.form-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.form-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.form-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
}

/* 表单主体 */
.form-body {
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
}

/* 表单底部 */
.form-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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
  border-radius: 0.5rem;
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
  background: var(--bg-secondary, #f5f5f5);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary, #e5e7eb);
}

/* 加载动画 */
.loading-spinner {
  width: 18px;
  height: 18px;
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

/* 全局错误 */
.global-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.875rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
}

.global-error span {
  flex: 1;
}

.close-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #dc2626;
  border-radius: 0.25rem;
  transition: background 0.2s ease;
}

.close-error:hover {
  background: rgba(220, 38, 38, 0.1);
}

/* 布局变体 - 水平布局 */
.smart-form.layout-horizontal :deep(.form-field) {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: start;
  gap: 1rem;
}

.smart-form.layout-horizontal :deep(.field-label) {
  text-align: right;
  padding-top: 0.625rem;
  margin-bottom: 0;
}

/* 布局变体 - 内联布局 */
.smart-form.layout-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.smart-form.layout-inline .form-body {
  flex: 1;
  margin-bottom: 0;
}

.smart-form.layout-inline .form-footer {
  border-top: none;
  padding-top: 0;
}

.smart-form.layout-inline :deep(.form-field) {
  margin-bottom: 0;
}

/* 禁用状态 */
.smart-form.is-disabled {
  opacity: 0.7;
  pointer-events: none;
}

/* 动画 */
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.3s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
