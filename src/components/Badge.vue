<template>
  <span 
    class="badge"
    :class="[
      `badge-${type}`,
      `badge-${size}`,
      { 
        'badge-dot': dot,
        'badge-outline': outline,
        'badge-pill': pill
      }
    ]"
    :style="badgeStyle"
  >
    <span v-if="!dot" class="badge-content">
      <IconLib v-if="icon" :name="icon" :size="iconSize" />
      <slot>{{ displayValue }}</slot>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Props
interface Props {
  value?: string | number
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'small' | 'medium' | 'large'
  max?: number
  dot?: boolean
  outline?: boolean
  pill?: boolean
  icon?: string
  color?: string
  backgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  max: 99,
  dot: false,
  outline: false,
  pill: true
})

// Computed
const iconSize = computed(() => {
  const sizes = { small: 10, medium: 12, large: 14 }
  return sizes[props.size]
})

const displayValue = computed(() => {
  if (props.value === undefined || props.value === null) return ''
  
  const num = Number(props.value)
  if (!isNaN(num) && props.max && num > props.max) {
    return `${props.max}+`
  }
  
  return props.value
})

const badgeStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.color) {
    style.color = props.color
  }
  
  if (props.backgroundColor) {
    style.backgroundColor = props.backgroundColor
    if (props.outline) {
      style.borderColor = props.backgroundColor
      style.backgroundColor = 'transparent'
      style.color = props.backgroundColor
    }
  }
  
  return style
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  white-space: nowrap;
  vertical-align: middle;
}

/* 尺寸 */
.badge-small {
  height: 18px;
  min-width: 18px;
  padding: 0 6px;
  font-size: 11px;
}

.badge-medium {
  height: 22px;
  min-width: 22px;
  padding: 0 8px;
  font-size: 12px;
}

.badge-large {
  height: 26px;
  min-width: 26px;
  padding: 0 10px;
  font-size: 13px;
}

/* 类型 */
.badge-default {
  background: #f0f0f0;
  color: #666;
}

.badge-primary {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.badge-success {
  background: #52c41a;
  color: white;
}

.badge-warning {
  background: #faad14;
  color: white;
}

.badge-danger {
  background: #ff4d4f;
  color: white;
}

.badge-info {
  background: #1890ff;
  color: white;
}

/* 轮廓样式 */
.badge-outline {
  background: transparent;
  border: 1px solid currentColor;
}

.badge-outline.badge-default {
  border-color: #d9d9d9;
  color: #666;
}

.badge-outline.badge-primary {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.badge-outline.badge-success {
  border-color: #52c41a;
  color: #52c41a;
}

.badge-outline.badge-warning {
  border-color: #faad14;
  color: #faad14;
}

.badge-outline.badge-danger {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.badge-outline.badge-info {
  border-color: #1890ff;
  color: #1890ff;
}

/* 圆角 */
.badge-pill {
  border-radius: 100px;
}

.badge:not(.badge-pill) {
  border-radius: 4px;
}

/* 圆点 */
.badge-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  padding: 0;
  border-radius: 50%;
}

.badge-dot.badge-small {
  width: 6px;
  height: 6px;
  min-width: 6px;
}

.badge-dot.badge-large {
  width: 10px;
  height: 10px;
  min-width: 10px;
}

/* 内容 */
.badge-content {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
