<template>
  <div 
    class="input"
    :class="[
      `input--${size}`,
      `input--${status}`,
      { 'input--disabled': disabled },
      { 'input--readonly': readonly },
      { 'input--focused': isFocused },
      { 'input--has-prefix': $slots.prefix || prefixIcon },
      { 'input--has-suffix': $slots.suffix || suffixIcon || clearable || showPassword || showCount }
    ]"
  >
    <!-- 前置内容 -->
    <span v-if="$slots.prepend" class="input__prepend">
      <slot name="prepend" />
    </span>
    
    <div class="input__wrapper">
      <!-- 前缀 -->
      <span v-if="$slots.prefix || prefixIcon" class="input__prefix">
        <slot name="prefix">
          <IconLib v-if="prefixIcon" :name="prefixIcon" :size="16" />
        </slot>
      </span>
      
      <!-- 输入框 -->
      <input
        v-if="type !== 'textarea'"
        ref="inputRef"
        class="input__inner"
        :type="showPasswordVisible ? 'text' : type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :name="name"
        :form="form"
        :inputmode="inputmode"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @keydown="handleKeydown"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
      />
      
      <!-- 文本域 -->
      <textarea
        v-else
        ref="textareaRef"
        class="input__inner input__textarea"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :rows="rows"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :name="name"
        :form="form"
        :style="textareaStyle"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @keydown="handleKeydown"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
      />
      
      <!-- 后缀 -->
      <span v-if="hasSuffix" class="input__suffix">
        <!-- 清除按钮 -->
        <IconLib
          v-if="clearable && modelValue"
          name="x-circle"
          :size="16"
          class="input__clear"
          @click.stop="handleClear"
        />
        
        <!-- 密码切换 -->
        <IconLib
          v-if="showPassword && type === 'password'"
          :name="showPasswordVisible ? 'eye-off' : 'eye'"
          :size="16"
          class="input__password-toggle"
          @click.stop="togglePassword"
        />
        
        <!-- 字数统计 -->
        <span v-if="showCount && maxlength" class="input__count">
          {{ String(modelValue || '').length }} / {{ maxlength }}
        </span>
        
        <!-- 自定义后缀 -->
        <slot name="suffix">
          <IconLib v-if="suffixIcon" :name="suffixIcon" :size="16" />
        </slot>
      </span>
    </div>
    
    <!-- 后置内容 -->
    <span v-if="$slots.append" class="input__append">
      <slot name="append" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 绑定值
  modelValue?: string | number
  // 类型
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'textarea'
  // 占位符
  placeholder?: string
  // 是否禁用
  disabled?: boolean
  // 是否只读
  readonly?: boolean
  // 是否可清除
  clearable?: boolean
  // 是否显示密码切换
  showPassword?: boolean
  // 是否显示字数统计
  showCount?: boolean
  // 最大长度
  maxlength?: number
  // 最小长度
  minlength?: number
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 状态
  status?: 'default' | 'success' | 'warning' | 'error'
  // 前缀图标
  prefixIcon?: string
  // 后缀图标
  suffixIcon?: string
  // 自动完成
  autocomplete?: string
  // 自动聚焦
  autofocus?: boolean
  // 输入框名称
  name?: string
  // 表单 ID
  form?: string
  // 输入模式
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  // 文本域行数
  rows?: number
  // 是否自适应高度
  autosize?: boolean | { minRows?: number; maxRows?: number }
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  clearable: false,
  showPassword: false,
  showCount: false,
  size: 'default',
  status: 'default',
  autocomplete: 'off',
  autofocus: false,
  rows: 3,
  autosize: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'input', value: string | number): void
  (e: 'change', value: string | number): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

const inputRef = ref<HTMLInputElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const isFocused = ref(false)
const isComposing = ref(false)
const showPasswordVisible = ref(false)

// 是否有后缀
const hasSuffix = computed(() => {
  return props.clearable || 
    props.showPassword || 
    props.showCount || 
    props.suffixIcon || 
    !!emit
})

// 文本域样式
const textareaStyle = computed(() => {
  if (!props.autosize || props.type !== 'textarea') {
    return {}
  }
  
  return {
    resize: 'none' as const
  }
})

// 处理输入
function handleInput(event: Event) {
  if (isComposing.value) return
  
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  if (props.type === 'number') {
    value = value === '' ? '' : Number(value)
  }
  
  emit('update:modelValue', value)
  emit('input', value)
  
  // 自适应高度
  if (props.autosize && props.type === 'textarea') {
    nextTick(() => adjustTextareaHeight())
  }
}

// 处理聚焦
function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

// 处理失焦
function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}

// 处理变化
function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  if (props.type === 'number') {
    value = value === '' ? '' : Number(value)
  }
  
  emit('change', value)
}

// 处理清除
function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  focus()
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event)
}

// 处理中文输入
function handleCompositionStart() {
  isComposing.value = true
}

function handleCompositionEnd(event: CompositionEvent) {
  isComposing.value = false
  handleInput(event)
}

// 切换密码显示
function togglePassword() {
  showPasswordVisible.value = !showPasswordVisible.value
}

// 调整文本域高度
function adjustTextareaHeight() {
  const textarea = textareaRef.value
  if (!textarea) return
  
  textarea.style.height = 'auto'
  
  let height = textarea.scrollHeight
  
  if (typeof props.autosize === 'object') {
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24
    const { minRows, maxRows } = props.autosize
    
    if (minRows) {
      height = Math.max(height, minRows * lineHeight)
    }
    if (maxRows) {
      height = Math.min(height, maxRows * lineHeight)
    }
  }
  
  textarea.style.height = `${height}px`
}

// 聚焦
function focus() {
  (inputRef.value || textareaRef.value)?.focus()
}

// 失焦
function blur() {
  (inputRef.value || textareaRef.value)?.blur()
}

// 选中
function select() {
  (inputRef.value || textareaRef.value)?.select()
}

// 监听自适应高度
watch(() => props.modelValue, () => {
  if (props.autosize && props.type === 'textarea') {
    nextTick(() => adjustTextareaHeight())
  }
})

onMounted(() => {
  if (props.autosize && props.type === 'textarea') {
    adjustTextareaHeight()
  }
})

// 暴露方法
defineExpose({
  focus,
  blur,
  select,
  inputRef,
  textareaRef
})
</script>

<style scoped>
.input {
  display: inline-flex;
  width: 100%;
  font-size: 14px;
}

.input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.input__inner {
  width: 100%;
  height: 32px;
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: inherit;
  line-height: 1.5;
  transition: all 0.2s;
  outline: none;
}

.input--small .input__inner {
  height: 24px;
  padding: 2px 8px;
  font-size: 12px;
}

.input--large .input__inner {
  height: 40px;
  padding: 6px 14px;
  font-size: 16px;
}

.input__inner:hover:not(:disabled) {
  border-color: var(--primary-color, #4B6EF5);
}

.input--focused .input__inner {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.2);
}

.input__inner:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.input__inner::placeholder {
  color: #999;
}

/* 状态 */
.input--success .input__inner {
  border-color: #52c41a;
}

.input--success.input--focused .input__inner {
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

.input--warning .input__inner {
  border-color: #faad14;
}

.input--warning.input--focused .input__inner {
  box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
}

.input--error .input__inner {
  border-color: #ff4d4f;
}

.input--error.input--focused .input__inner {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

/* 前缀后缀 */
.input--has-prefix .input__inner {
  padding-left: 32px;
}

.input--small.input--has-prefix .input__inner {
  padding-left: 28px;
}

.input--large.input--has-prefix .input__inner {
  padding-left: 38px;
}

.input--has-suffix .input__inner {
  padding-right: 32px;
}

.input--small.input--has-suffix .input__inner {
  padding-right: 28px;
}

.input--large.input--has-suffix .input__inner {
  padding-right: 38px;
}

.input__prefix,
.input__suffix {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
}

.input__prefix {
  left: 10px;
}

.input__suffix {
  right: 10px;
}

.input__clear,
.input__password-toggle {
  cursor: pointer;
  transition: color 0.2s;
}

.input__clear:hover,
.input__password-toggle:hover {
  color: #666;
}

.input__count {
  font-size: 12px;
  color: #999;
}

/* 前置后置 */
.input__prepend,
.input__append {
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  color: #666;
  white-space: nowrap;
}

.input__prepend {
  border-right: none;
  border-radius: 4px 0 0 4px;
}

.input__append {
  border-left: none;
  border-radius: 0 4px 4px 0;
}

.input:has(.input__prepend) .input__inner {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.input:has(.input__append) .input__inner {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

/* 文本域 */
.input__textarea {
  min-height: 80px;
  height: auto;
  padding: 8px 12px;
  resize: vertical;
}

.input--has-suffix .input__textarea {
  padding-right: 60px;
}

.input:has(.input__textarea) .input__suffix {
  top: 8px;
  transform: none;
}
</style>
