<template>
  <div class="radio-group" :class="[`radio-group--${direction}`, { 'radio-group--button': type === 'button' }]">
    <label
      v-for="option in options"
      :key="option.value"
      class="radio"
      :class="[
        `radio--${size}`,
        `radio--${type}`,
        { 'radio--checked': modelValue === option.value },
        { 'radio--disabled': disabled || option.disabled }
      ]"
    >
      <input
        type="radio"
        class="radio__input"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        :disabled="disabled || option.disabled"
        @change="handleChange(option.value)"
      />
      <span v-if="type === 'default'" class="radio__indicator" />
      <span class="radio__label">
        <slot :option="option">{{ option.label }}</slot>
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
export interface RadioOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

interface Props {
  // 绑定值
  modelValue?: string | number | boolean
  // 选项
  options: RadioOption[]
  // 单选框名称
  name?: string
  // 是否禁用
  disabled?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 排列方向
  direction?: 'horizontal' | 'vertical'
  // 类型
  type?: 'default' | 'button'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'default',
  direction: 'horizontal',
  type: 'default'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean): void
  (e: 'change', value: string | number | boolean): void
}>()

// 处理变化
function handleChange(value: string | number | boolean) {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.radio-group {
  display: inline-flex;
  gap: 16px;
}

.radio-group--vertical {
  flex-direction: column;
  gap: 12px;
}

.radio-group--button {
  gap: 0;
}

.radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.radio--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.radio__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* 默认样式 */
.radio--default .radio__indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 2px solid #d9d9d9;
  border-radius: 50%;
  background: #fff;
  transition: all 0.2s;
  flex-shrink: 0;
}

.radio--default.radio--small .radio__indicator {
  width: 14px;
  height: 14px;
}

.radio--default.radio--large .radio__indicator {
  width: 20px;
  height: 20px;
}

.radio--default:hover:not(.radio--disabled) .radio__indicator {
  border-color: var(--primary-color, #4B6EF5);
}

.radio--default.radio--checked .radio__indicator {
  border-color: var(--primary-color, #4B6EF5);
}

.radio--default.radio--checked .radio__indicator::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color, #4B6EF5);
}

.radio--default.radio--small.radio--checked .radio__indicator::after {
  width: 6px;
  height: 6px;
}

.radio--default.radio--large.radio--checked .radio__indicator::after {
  width: 10px;
  height: 10px;
}

.radio--default .radio__label {
  font-size: 14px;
  color: #333;
  line-height: 1;
}

.radio--default.radio--small .radio__label {
  font-size: 12px;
}

.radio--default.radio--large .radio__label {
  font-size: 16px;
}

.radio--default.radio--disabled .radio__label {
  color: #999;
}

/* 按钮样式 */
.radio--button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #333;
  font-size: 14px;
  transition: all 0.2s;
  margin-left: -1px;
}

.radio--button:first-child {
  margin-left: 0;
  border-radius: 4px 0 0 4px;
}

.radio--button:last-child {
  border-radius: 0 4px 4px 0;
}

.radio--button.radio--small {
  padding: 4px 12px;
  font-size: 12px;
}

.radio--button.radio--large {
  padding: 12px 20px;
  font-size: 16px;
}

.radio--button:hover:not(.radio--disabled) {
  color: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  z-index: 1;
}

.radio--button.radio--checked {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
  z-index: 2;
}

.radio--button.radio--disabled {
  background: #f5f5f5;
  color: #999;
}

.radio--button .radio__label {
  font-size: inherit;
  color: inherit;
}
</style>
