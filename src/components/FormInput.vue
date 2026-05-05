<template>
  <div class="form-field" :class="fieldClasses">
    <!-- 标签 -->
    <label v-if="label" :for="inputId" class="field-label">
      <span class="label-text">{{ label }}</span>
      <span v-if="required" class="required-mark">*</span>
      <span v-if="optional" class="optional-mark">(选填)</span>
    </label>
    
    <!-- 输入区域 -->
    <div class="input-wrapper" :class="{ 'has-prefix': $slots.prefix || prefixIcon, 'has-suffix': $slots.suffix || suffixIcon || clearable || showPasswordToggle }">
      <!-- 前缀 -->
      <div v-if="$slots.prefix || prefixIcon" class="input-prefix">
        <slot name="prefix">
          <IconLib v-if="prefixIcon" :name="prefixIcon" :size="18" />
        </slot>
      </div>
      
      <!-- 输入框 -->
      <template v-if="type === 'textarea'">
        <textarea
          :id="inputId"
          ref="inputRef"
          v-model="internalValue"
          class="field-input textarea"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :rows="rows"
          :maxlength="maxlength"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
        ></textarea>
      </template>
      
      <template v-else-if="type === 'select'">
        <select
          :id="inputId"
          ref="inputRef"
          v-model="internalValue"
          class="field-input select"
          :disabled="disabled"
          @focus="handleFocus"
          @blur="handleBlur"
          @change="handleInput"
        >
          <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
          <option 
            v-for="option in options" 
            :key="option.value" 
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </select>
        <div class="select-arrow">
          <IconLib name="chevron-down" :size="16" />
        </div>
      </template>
      
      <template v-else>
        <input
          :id="inputId"
          ref="inputRef"
          v-model="internalValue"
          class="field-input"
          :type="computedType"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :min="min"
          :max="max"
          :step="step"
          :autocomplete="autocomplete"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
          @keydown.enter="$emit('enter', $event)"
        />
      </template>
      
      <!-- 后缀 -->
      <div v-if="$slots.suffix || suffixIcon || clearable || showPasswordToggle" class="input-suffix">
        <!-- 清除按钮 -->
        <button 
          v-if="clearable && internalValue && !disabled" 
          type="button"
          class="clear-btn"
          @click="handleClear"
        >
          <IconLib name="x" :size="16" />
        </button>
        
        <!-- 密码切换 -->
        <button 
          v-if="showPasswordToggle && type === 'password'" 
          type="button"
          class="password-toggle"
          @click="togglePasswordVisibility"
        >
          <IconLib :name="passwordVisible ? 'eye-off' : 'eye'" :size="18" />
        </button>
        
        <slot name="suffix">
          <IconLib v-if="suffixIcon" :name="suffixIcon" :size="18" />
        </slot>
      </div>
    </div>
    
    <!-- 字符计数 -->
    <div v-if="showCount && maxlength" class="char-count">
      {{ (internalValue || '').length }} / {{ maxlength }}
    </div>
    
    <!-- 密码强度指示器 -->
    <div v-if="showStrength && type === 'password' && internalValue" class="password-strength">
      <div class="strength-bar">
        <div 
          class="strength-fill" 
          :class="passwordStrength.level"
          :style="{ width: `${(passwordStrength.score / 8) * 100}%` }"
        ></div>
      </div>
      <span class="strength-text" :class="passwordStrength.level">
        {{ strengthLabels[passwordStrength.level] }}
      </span>
    </div>
    
    <!-- 帮助文本 -->
    <div v-if="helpText && !hasError" class="help-text">
      <IconLib name="info" :size="14" />
      {{ helpText }}
    </div>
    
    <!-- 错误消息 -->
    <transition name="error-slide">
      <div v-if="hasError" class="error-message">
        <IconLib name="alert-circle" :size="14" />
        {{ errorMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import IconLib from './icons/IconLibrary.vue'
import { validateField, ValidationRule, calculatePasswordStrength } from '@/utils/validation'

interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  label?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'date' | 'time' | 'datetime-local'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  optional?: boolean
  clearable?: boolean
  showPasswordToggle?: boolean
  showCount?: boolean
  showStrength?: boolean
  size?: 'small' | 'medium' | 'large'
  maxlength?: number
  rows?: number
  min?: number | string
  max?: number | string
  step?: number | string
  autocomplete?: string
  prefixIcon?: string
  suffixIcon?: string
  helpText?: string
  error?: string
  rules?: ValidationRule[]
  validateOnBlur?: boolean
  validateOnInput?: boolean
  options?: SelectOption[]
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'medium',
  rows: 4,
  validateOnBlur: true,
  validateOnInput: false,
  options: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'input': [value: string | number]
  'enter': [event: KeyboardEvent]
  'clear': []
  'validation': [result: { valid: boolean; errors: string[] }]
}>()

// 状态
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>()
const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)
const isFocused = ref(false)
const passwordVisible = ref(false)
const localError = ref('')

// 内部值
const internalValue = computed({
  get: () => props.modelValue ?? '',
  set: (value) => emit('update:modelValue', value)
})

// 密码强度
const passwordStrength = computed(() => {
  if (props.type !== 'password' || !internalValue.value) {
    return { score: 0, level: 'weak' as const, feedback: [] }
  }
  return calculatePasswordStrength(String(internalValue.value))
})

// 强度标签
const strengthLabels = {
  weak: '弱',
  medium: '中',
  strong: '强',
  'very-strong': '非常强'
}

// 计算输入类型
const computedType = computed(() => {
  if (props.type === 'password') {
    return passwordVisible.value ? 'text' : 'password'
  }
  return props.type
})

// 是否有错误
const hasError = computed(() => {
  return !!(props.error || localError.value)
})

// 错误消息
const errorMessage = computed(() => {
  return props.error || localError.value
})

// 字段类名
const fieldClasses = computed(() => ({
  [`size-${props.size}`]: true,
  'is-focused': isFocused.value,
  'is-disabled': props.disabled,
  'is-readonly': props.readonly,
  'has-error': hasError.value,
  'has-value': !!internalValue.value
}))

// 验证方法
const validate = (): boolean => {
  if (!props.rules || props.rules.length === 0) {
    localError.value = ''
    return true
  }
  
  const result = validateField(internalValue.value, props.rules)
  localError.value = result.errors[0] || ''
  emit('validation', result)
  return result.valid
}

// 处理聚焦
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

// 处理失焦
const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
  
  if (props.validateOnBlur) {
    validate()
  }
}

// 处理输入
const handleInput = () => {
  emit('input', internalValue.value)
  
  if (props.validateOnInput) {
    validate()
  }
  
  // 清除之前的错误
  if (localError.value && props.validateOnBlur) {
    localError.value = ''
  }
}

// 清除值
const handleClear = () => {
  internalValue.value = ''
  localError.value = ''
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 切换密码可见性
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

// 聚焦输入框
const focus = () => {
  inputRef.value?.focus()
}

// 失焦输入框
const blur = () => {
  inputRef.value?.blur()
}

// 清除验证状态
const clearValidation = () => {
  localError.value = ''
}

// 自动聚焦
onMounted(() => {
  if (props.autofocus) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

// 暴露方法
defineExpose({
  validate,
  focus,
  blur,
  clearValidation
})
</script>

<style scoped>
.form-field {
  position: relative;
  margin-bottom: 1rem;
}

/* 标签 */
.field-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #1a1a1a);
}

.required-mark {
  color: #ef4444;
}

.optional-mark {
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
  font-weight: 400;
}

/* 输入区域 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  color: var(--text-primary, #1a1a1a);
  background: var(--bg-input, #fff);
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s ease;
}

.field-input::placeholder {
  color: var(--text-placeholder, #9ca3af);
}

.field-input:hover:not(:disabled) {
  border-color: var(--border-hover, #d1d5db);
}

.field-input:focus {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.field-input:disabled {
  background: var(--bg-disabled, #f5f5f5);
  cursor: not-allowed;
  opacity: 0.7;
}

/* 文本域 */
.field-input.textarea {
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
}

/* 下拉选择 */
.field-input.select {
  appearance: none;
  cursor: pointer;
  padding-right: 2.5rem;
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-secondary, #666);
}

/* 前后缀 */
.input-prefix,
.input-suffix {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-secondary, #666);
}

.input-prefix {
  position: absolute;
  left: 0.75rem;
}

.input-suffix {
  position: absolute;
  right: 0.75rem;
}

.input-wrapper.has-prefix .field-input {
  padding-left: 2.5rem;
}

.input-wrapper.has-suffix .field-input {
  padding-right: 2.5rem;
}

/* 清除按钮和密码切换 */
.clear-btn,
.password-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary, #999);
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.clear-btn:hover,
.password-toggle:hover {
  color: var(--text-primary, #1a1a1a);
  background: var(--bg-hover, #f3f4f6);
}

/* 字符计数 */
.char-count {
  position: absolute;
  right: 0;
  bottom: -1.25rem;
  font-size: 0.75rem;
  color: var(--text-tertiary, #999);
}

/* 密码强度 */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary, #e5e7eb);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.strong {
  background: #10b981;
}

.strength-fill.very-strong {
  background: #059669;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
}

.strength-text.weak {
  color: #ef4444;
}

.strength-text.medium {
  color: #f59e0b;
}

.strength-text.strong {
  color: #10b981;
}

.strength-text.very-strong {
  color: #059669;
}

/* 帮助文本 */
.help-text {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-secondary, #666);
}

/* 错误消息 */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: #ef4444;
}

/* 错误状态 */
.form-field.has-error .field-input {
  border-color: #ef4444;
}

.form-field.has-error .field-input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* 尺寸变体 */
.form-field.size-small .field-input {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.form-field.size-large .field-input {
  padding: 0.875rem 1rem;
  font-size: 1rem;
}

/* 动画 */
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.2s ease;
}

.error-slide-enter-from,
.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
