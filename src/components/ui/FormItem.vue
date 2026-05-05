<template>
  <div 
    class="form-item"
    :class="[
      `form-item--${labelPosition}`,
      { 'form-item--required': isRequired },
      { 'form-item--error': hasError },
      { 'form-item--success': validateState === 'success' },
      { 'form-item--validating': validateState === 'validating' }
    ]"
  >
    <!-- 标签 -->
    <label 
      v-if="label || $slots.label" 
      class="form-item__label"
      :style="labelStyle"
    >
      <slot name="label">{{ label }}</slot>
      <span v-if="isRequired && showRequiredMark" class="form-item__required-mark">*</span>
    </label>
    
    <!-- 内容 -->
    <div class="form-item__content">
      <div class="form-item__control">
        <slot />
      </div>
      
      <!-- 错误信息 -->
      <Transition name="form-error">
        <div v-if="hasError && showMessage" class="form-item__error">
          <IconLib name="alert-circle" :size="14" />
          <span>{{ errorMessage }}</span>
        </div>
      </Transition>
      
      <!-- 帮助信息 -->
      <div v-if="help && !hasError" class="form-item__help">
        {{ help }}
      </div>
      
      <!-- 额外内容 -->
      <div v-if="$slots.extra" class="form-item__extra">
        <slot name="extra" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, provide, watch, onMounted, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

export interface FormItemRule {
  required?: boolean
  message?: string
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | Promise<boolean>
  trigger?: 'blur' | 'change' | 'submit'
}

interface Props {
  // 标签文本
  label?: string
  // 字段名
  prop?: string
  // 验证规则
  rules?: FormItemRule[]
  // 标签宽度
  labelWidth?: string | number
  // 标签位置
  labelPosition?: 'left' | 'right' | 'top'
  // 是否必填
  required?: boolean
  // 是否显示必填标记
  showRequiredMark?: boolean
  // 是否显示错误信息
  showMessage?: boolean
  // 帮助信息
  help?: string
}

const props = withDefaults(defineProps<Props>(), {
  labelPosition: 'right',
  showRequiredMark: true,
  showMessage: true
})

const emit = defineEmits<{
  (e: 'validate', valid: boolean): void
}>()

// 注入表单上下文
const formContext = inject<any>('formContext', null)

// 验证状态
const validateState = ref<'' | 'success' | 'error' | 'validating'>('')
const errorMessage = ref('')

// 是否必填
const isRequired = computed(() => {
  if (props.required !== undefined) return props.required
  
  const rules = props.rules || formContext?.rules?.[props.prop || ''] || []
  return rules.some((rule: FormItemRule) => rule.required)
})

// 是否有错误
const hasError = computed(() => validateState.value === 'error')

// 标签样式
const labelStyle = computed(() => {
  const width = props.labelWidth || formContext?.labelWidth
  if (!width) return {}
  
  return {
    width: typeof width === 'number' ? `${width}px` : width
  }
})

// 获取字段值
function getFieldValue() {
  if (!props.prop || !formContext?.model) return undefined
  
  const path = props.prop.split('.')
  let value = formContext.model
  
  for (const key of path) {
    if (value === undefined || value === null) return undefined
    value = value[key]
  }
  
  return value
}

// 验证单个规则
async function validateRule(rule: FormItemRule, value: any): Promise<boolean> {
  // 必填验证
  if (rule.required) {
    if (value === undefined || value === null || value === '') {
      errorMessage.value = rule.message || '该字段为必填项'
      return false
    }
    if (Array.isArray(value) && value.length === 0) {
      errorMessage.value = rule.message || '请至少选择一项'
      return false
    }
  }
  
  // 空值跳过后续验证
  if (value === undefined || value === null || value === '') {
    return true
  }
  
  // 长度验证
  if (rule.min !== undefined && String(value).length < rule.min) {
    errorMessage.value = rule.message || `长度不能少于 ${rule.min} 个字符`
    return false
  }
  
  if (rule.max !== undefined && String(value).length > rule.max) {
    errorMessage.value = rule.message || `长度不能超过 ${rule.max} 个字符`
    return false
  }
  
  // 正则验证
  if (rule.pattern && !rule.pattern.test(String(value))) {
    errorMessage.value = rule.message || '格式不正确'
    return false
  }
  
  // 自定义验证
  if (rule.validator) {
    try {
      const result = await rule.validator(value)
      if (!result) {
        errorMessage.value = rule.message || '验证失败'
        return false
      }
    } catch (error) {
      errorMessage.value = rule.message || '验证出错'
      return false
    }
  }
  
  return true
}

// 验证字段
async function validate(trigger?: string): Promise<boolean> {
  const rules = props.rules || formContext?.rules?.[props.prop || ''] || []
  
  if (rules.length === 0) {
    validateState.value = ''
    return true
  }
  
  const value = getFieldValue()
  
  // 过滤触发方式
  const activeRules = trigger
    ? rules.filter((rule: FormItemRule) => !rule.trigger || rule.trigger === trigger)
    : rules
  
  if (activeRules.length === 0) {
    return true
  }
  
  validateState.value = 'validating'
  errorMessage.value = ''
  
  for (const rule of activeRules) {
    const valid = await validateRule(rule, value)
    if (!valid) {
      validateState.value = 'error'
      emit('validate', false)
      return false
    }
  }
  
  validateState.value = 'success'
  errorMessage.value = ''
  emit('validate', true)
  return true
}

// 重置验证状态
function resetField() {
  validateState.value = ''
  errorMessage.value = ''
}

// 清除验证
function clearValidate() {
  validateState.value = ''
  errorMessage.value = ''
}

// 注册到表单
const formItemContext = {
  prop: props.prop,
  validate,
  resetField,
  clearValidate
}

provide('formItemContext', formItemContext)

onMounted(() => {
  if (props.prop && formContext?.addField) {
    formContext.addField(formItemContext)
  }
})

onUnmounted(() => {
  if (props.prop && formContext?.removeField) {
    formContext.removeField(formItemContext)
  }
})

// 暴露方法
defineExpose({
  validate,
  resetField,
  clearValidate,
  validateState
})
</script>

<style scoped>
.form-item {
  display: flex;
  margin-bottom: 22px;
}

.form-item--top {
  flex-direction: column;
}

.form-item__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-right: 12px;
  font-size: 14px;
  color: #333;
  line-height: 32px;
  white-space: nowrap;
}

.form-item--top .form-item__label {
  padding-right: 0;
  padding-bottom: 8px;
  line-height: 1;
}

.form-item--left .form-item__label {
  justify-content: flex-start;
}

.form-item--right .form-item__label {
  justify-content: flex-end;
}

.form-item__required-mark {
  color: #ff4d4f;
}

.form-item__content {
  flex: 1;
  position: relative;
}

.form-item__control {
  position: relative;
}

.form-item__error {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
  line-height: 1.5;
}

.form-item__help {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

.form-item__extra {
  margin-top: 4px;
}

/* 状态样式 */
.form-item--error :deep(input),
.form-item--error :deep(textarea),
.form-item--error :deep(.select__trigger) {
  border-color: #ff4d4f !important;
}

.form-item--error :deep(input:focus),
.form-item--error :deep(textarea:focus),
.form-item--error :deep(.select--focus .select__trigger) {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
}

.form-item--success :deep(input),
.form-item--success :deep(textarea),
.form-item--success :deep(.select__trigger) {
  border-color: #52c41a !important;
}

/* 动画 */
.form-error-enter-active,
.form-error-leave-active {
  transition: all 0.2s ease;
}

.form-error-enter-from,
.form-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
