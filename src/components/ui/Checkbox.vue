<template>
  <div class="checkbox-group" :class="{ 'checkbox-group--vertical': vertical }">
    <label
      v-for="option in options"
      :key="option.value"
      class="checkbox"
      :class="[
        `checkbox--${size}`,
        { 'checkbox--checked': isChecked(option.value) },
        { 'checkbox--disabled': disabled || option.disabled },
        { 'checkbox--indeterminate': indeterminate && option.value === indeterminateValue }
      ]"
    >
      <input
        type="checkbox"
        class="checkbox__input"
        :value="option.value"
        :checked="isChecked(option.value)"
        :disabled="disabled || option.disabled"
        @change="handleChange(option.value, $event)"
      />
      <span class="checkbox__indicator">
        <svg 
          v-if="isChecked(option.value)" 
          class="checkbox__icon checkbox__icon--check" 
          viewBox="0 0 16 16"
        >
          <path d="M13.5 4.5l-7 7L3 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg 
          v-else-if="indeterminate && option.value === indeterminateValue" 
          class="checkbox__icon checkbox__icon--indeterminate" 
          viewBox="0 0 16 16"
        >
          <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="checkbox__label">
        <slot :option="option">{{ option.label }}</slot>
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface CheckboxOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

interface Props {
  // 绑定值
  modelValue?: (string | number | boolean)[]
  // 选项
  options: CheckboxOption[]
  // 是否禁用
  disabled?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 是否垂直排列
  vertical?: boolean
  // 是否半选状态
  indeterminate?: boolean
  // 半选状态的值
  indeterminateValue?: string | number | boolean
  // 最小选中数量
  min?: number
  // 最大选中数量
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false,
  size: 'default',
  vertical: false,
  indeterminate: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number | boolean)[]): void
  (e: 'change', value: (string | number | boolean)[]): void
}>()

// 是否选中
function isChecked(value: string | number | boolean): boolean {
  return props.modelValue.includes(value)
}

// 处理变化
function handleChange(value: string | number | boolean, event: Event) {
  const target = event.target as HTMLInputElement
  const checked = target.checked
  
  let newValue = [...props.modelValue]
  
  if (checked) {
    // 检查最大数量限制
    if (props.max !== undefined && newValue.length >= props.max) {
      target.checked = false
      return
    }
    newValue.push(value)
  } else {
    // 检查最小数量限制
    if (props.min !== undefined && newValue.length <= props.min) {
      target.checked = true
      return
    }
    newValue = newValue.filter(v => v !== value)
  }
  
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.checkbox-group--vertical {
  flex-direction: column;
  gap: 12px;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox__indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 2px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox--small .checkbox__indicator {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.checkbox--large .checkbox__indicator {
  width: 20px;
  height: 20px;
  border-radius: 5px;
}

.checkbox:hover:not(.checkbox--disabled) .checkbox__indicator {
  border-color: var(--primary-color, #4B6EF5);
}

.checkbox--checked .checkbox__indicator {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
}

.checkbox--indeterminate .checkbox__indicator {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
}

.checkbox__icon {
  width: 10px;
  height: 10px;
  color: #fff;
}

.checkbox--small .checkbox__icon {
  width: 8px;
  height: 8px;
}

.checkbox--large .checkbox__icon {
  width: 12px;
  height: 12px;
}

.checkbox__label {
  font-size: 14px;
  color: #333;
  line-height: 1;
}

.checkbox--small .checkbox__label {
  font-size: 12px;
}

.checkbox--large .checkbox__label {
  font-size: 16px;
}

.checkbox--disabled .checkbox__label {
  color: #999;
}
</style>
