<template>
  <div class="switch-wrapper" :class="{ 'is-disabled': disabled }">
    <label class="switch-label" v-if="label && labelPosition === 'left'">{{ label }}</label>
    
    <button
      type="button"
      role="switch"
      class="switch"
      :class="[
        `switch--${size}`,
        { 'is-checked': modelValue, 'is-loading': loading }
      ]"
      :style="switchStyle"
      :disabled="disabled || loading"
      :aria-checked="modelValue"
      @click="toggle"
    >
      <span class="switch-track">
        <span v-if="showIcon" class="switch-icon switch-icon--on">
          <IconLib name="check" :size="iconSize" />
        </span>
        <span v-if="showIcon" class="switch-icon switch-icon--off">
          <IconLib name="x" :size="iconSize" />
        </span>
      </span>
      
      <span class="switch-thumb">
        <IconLib v-if="loading" name="loader" :size="thumbIconSize" class="switch-loader" />
        <IconLib v-else-if="thumbIcon" :name="thumbIcon" :size="thumbIconSize" />
      </span>
    </button>
    
    <label class="switch-label" v-if="label && labelPosition === 'right'">{{ label }}</label>
    
    <!-- 内联文字 -->
    <span v-if="inlineText" class="switch-inline-text">
      {{ modelValue ? activeText : inactiveText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  modelValue?: boolean
  label?: string
  labelPosition?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  activeColor?: string
  inactiveColor?: string
  activeText?: string
  inactiveText?: string
  inlineText?: boolean
  showIcon?: boolean
  thumbIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  labelPosition: 'left',
  size: 'md',
  activeText: '开启',
  inactiveText: '关闭'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const sizeConfig = computed(() => {
  const configs = {
    sm: { width: 28, height: 16, thumb: 12, icon: 8 },
    md: { width: 40, height: 22, thumb: 18, icon: 10 },
    lg: { width: 52, height: 28, thumb: 24, icon: 12 }
  }
  return configs[props.size]
})

const iconSize = computed(() => sizeConfig.value.icon)
const thumbIconSize = computed(() => sizeConfig.value.icon)

const switchStyle = computed(() => ({
  '--switch-width': `${sizeConfig.value.width}px`,
  '--switch-height': `${sizeConfig.value.height}px`,
  '--switch-thumb-size': `${sizeConfig.value.thumb}px`,
  '--switch-active-color': props.activeColor || 'var(--primary-color, #4B6EF5)',
  '--switch-inactive-color': props.inactiveColor || '#d1d5db'
}))

const toggle = () => {
  if (props.disabled || props.loading) return
  
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.switch-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.switch-wrapper.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-label {
  font-size: 0.875rem;
  color: var(--text-color-primary, #333);
  cursor: pointer;
}

.switch-wrapper.is-disabled .switch-label {
  cursor: not-allowed;
}

.switch {
  position: relative;
  display: inline-flex;
  width: var(--switch-width);
  height: var(--switch-height);
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.switch:disabled {
  cursor: not-allowed;
}

.switch-track {
  position: absolute;
  inset: 0;
  background: var(--switch-inactive-color);
  border-radius: calc(var(--switch-height) / 2);
  transition: background-color 0.2s ease;
  overflow: hidden;
}

.switch.is-checked .switch-track {
  background: var(--switch-active-color);
}

.switch-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  transition: opacity 0.2s ease;
}

.switch-icon--on {
  left: 4px;
  opacity: 0;
}

.switch-icon--off {
  right: 4px;
  opacity: 0.6;
}

.switch.is-checked .switch-icon--on {
  opacity: 1;
}

.switch.is-checked .switch-icon--off {
  opacity: 0;
}

.switch-thumb {
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translateY(-50%);
  width: var(--switch-thumb-size);
  height: var(--switch-thumb-size);
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: left 0.2s ease;
  color: var(--text-color-muted, #9ca3af);
}

.switch.is-checked .switch-thumb {
  left: calc(var(--switch-width) - var(--switch-thumb-size) - 2px);
  color: var(--switch-active-color);
}

.switch-loader {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.switch-inline-text {
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
  min-width: 2.5rem;
}
</style>
