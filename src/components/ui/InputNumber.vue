<template>
  <div 
    class="input-number"
    :class="[
      `input-number--${size}`,
      { 
        'input-number--disabled': disabled,
        'input-number--controls-right': controlsPosition === 'right'
      }
    ]"
  >
    <!-- 左侧减少按钮 -->
    <button 
      v-if="controlsPosition !== 'right'"
      type="button"
      class="input-number__decrease"
      :disabled="disabled || currentValue <= min"
      @click="decrease"
    >
      <IconLib name="minus" :size="14" />
    </button>
    
    <div class="input-number__wrapper">
      <input
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        @input="handleInput"
        @blur="handleBlur"
        @keydown.up.prevent="increase"
        @keydown.down.prevent="decrease"
      />
    </div>
    
    <!-- 左侧增加按钮 -->
    <button 
      v-if="controlsPosition !== 'right'"
      type="button"
      class="input-number__increase"
      :disabled="disabled || currentValue >= max"
      @click="increase"
    >
      <IconLib name="plus" :size="14" />
    </button>
    
    <!-- 右侧控制按钮 -->
    <div v-if="controlsPosition === 'right'" class="input-number__controls-right">
      <button 
        type="button"
        class="input-number__control-btn"
        :disabled="disabled || currentValue >= max"
        @click="increase"
      >
        <IconLib name="chevron-up" :size="12" />
      </button>
      <button 
        type="button"
        class="input-number__control-btn"
        :disabled="disabled || currentValue <= min"
        @click="decrease"
      >
        <IconLib name="chevron-down" :size="12" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 绑定值
  modelValue?: number | null
  // 最小值
  min?: number
  // 最大值
  max?: number
  // 步长
  step?: number
  // 精度
  precision?: number
  // 占位符
  placeholder?: string
  // 禁用
  disabled?: boolean
  // 只读
  readonly?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 控制按钮位置
  controlsPosition?: 'both' | 'right'
  // 是否显示千分位分隔符
  formatter?: (value: number) => string
  // 解析器
  parser?: (value: string) => number
}

const props = withDefaults(defineProps<Props>(), {
  min: -Infinity,
  max: Infinity,
  step: 1,
  disabled: false,
  readonly: false,
  size: 'default',
  controlsPosition: 'both'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', value: number | null, oldValue: number | null): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const currentValue = ref<number>(props.modelValue ?? 0)
const userInput = ref<string | null>(null)

// 显示值
const displayValue = computed(() => {
  if (userInput.value !== null) {
    return userInput.value
  }
  
  const val = currentValue.value
  if (val === null || val === undefined || isNaN(val)) {
    return ''
  }
  
  // 格式化
  if (props.formatter) {
    return props.formatter(val)
  }
  
  // 精度处理
  if (props.precision !== undefined) {
    return val.toFixed(props.precision)
  }
  
  return String(val)
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== currentValue.value) {
    currentValue.value = newVal ?? 0
  }
})

// 设置当前值
function setCurrentValue(val: number | null) {
  const oldValue = currentValue.value
  
  if (val === null || isNaN(val)) {
    currentValue.value = 0
    emit('update:modelValue', null)
    emit('change', null, oldValue)
    return
  }
  
  // 精度处理
  if (props.precision !== undefined) {
    val = parseFloat(val.toFixed(props.precision))
  }
  
  // 范围限制
  if (val >= props.max) {
    val = props.max
  }
  if (val <= props.min) {
    val = props.min
  }
  
  currentValue.value = val
  emit('update:modelValue', val)
  
  if (val !== oldValue) {
    emit('change', val, oldValue)
  }
}

// 增加
function increase() {
  if (props.disabled || props.readonly || currentValue.value >= props.max) return
  
  const newVal = currentValue.value + props.step
  setCurrentValue(newVal)
}

// 减少
function decrease() {
  if (props.disabled || props.readonly || currentValue.value <= props.min) return
  
  const newVal = currentValue.value - props.step
  setCurrentValue(newVal)
}

// 处理输入
function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  userInput.value = target.value
}

// 处理失焦
function handleBlur(e: FocusEvent) {
  let value = userInput.value
  
  if (value !== null) {
    // 解析
    if (props.parser) {
      value = String(props.parser(value))
    }
    
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''))
    setCurrentValue(parsed)
  }
  
  userInput.value = null
  emit('blur', e)
}
</script>

<style scoped>
.input-number {
  display: inline-flex;
  align-items: stretch;
  width: 150px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--bg-color, #fff);
  transition: border-color 0.2s;
}

.input-number:hover:not(.input-number--disabled) {
  border-color: var(--primary-color, #4B6EF5);
}

.input-number:focus-within:not(.input-number--disabled) {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.1);
}

/* 减少按钮 */
.input-number__decrease,
.input-number__increase {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #909399);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.input-number__decrease:hover:not(:disabled),
.input-number__increase:hover:not(:disabled) {
  color: var(--primary-color, #4B6EF5);
  background: var(--bg-hover, #f5f7fa);
}

.input-number__decrease:disabled,
.input-number__increase:disabled {
  color: var(--text-disabled, #c0c4cc);
  cursor: not-allowed;
}

.input-number__decrease {
  border-right: 1px solid var(--border-color, #dcdfe6);
  border-radius: 6px 0 0 6px;
}

.input-number__increase {
  border-left: 1px solid var(--border-color, #dcdfe6);
  border-radius: 0 6px 6px 0;
}

/* 输入框 */
.input-number__wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.input-number__wrapper input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  text-align: center;
  font-size: 14px;
  color: var(--text-color, #303133);
  padding: 0 8px;
}

.input-number__wrapper input::placeholder {
  color: var(--text-secondary, #c0c4cc);
}

/* 尺寸 */
.input-number--small {
  height: 24px;
}

.input-number--small .input-number__decrease,
.input-number--small .input-number__increase {
  width: 28px;
}

.input-number--small .input-number__wrapper input {
  font-size: 12px;
}

.input-number--default {
  height: 32px;
}

.input-number--large {
  height: 40px;
}

.input-number--large .input-number__decrease,
.input-number--large .input-number__increase {
  width: 44px;
}

.input-number--large .input-number__wrapper input {
  font-size: 16px;
}

/* 禁用 */
.input-number--disabled {
  background: var(--disabled-bg, #f5f7fa);
  cursor: not-allowed;
}

.input-number--disabled input {
  cursor: not-allowed;
  color: var(--text-disabled, #c0c4cc);
}

/* 右侧控制按钮 */
.input-number--controls-right {
  border-radius: 6px;
}

.input-number--controls-right .input-number__wrapper {
  padding-left: 12px;
}

.input-number--controls-right .input-number__wrapper input {
  text-align: left;
}

.input-number__controls-right {
  display: flex;
  flex-direction: column;
  width: 28px;
  border-left: 1px solid var(--border-color, #dcdfe6);
}

.input-number__control-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary, #909399);
  cursor: pointer;
  transition: all 0.2s;
}

.input-number__control-btn:hover:not(:disabled) {
  color: var(--primary-color, #4B6EF5);
  background: var(--bg-hover, #f5f7fa);
}

.input-number__control-btn:disabled {
  color: var(--text-disabled, #c0c4cc);
  cursor: not-allowed;
}

.input-number__control-btn:first-child {
  border-bottom: 1px solid var(--border-color, #dcdfe6);
  border-radius: 0 6px 0 0;
}

.input-number__control-btn:last-child {
  border-radius: 0 0 6px 0;
}
</style>
