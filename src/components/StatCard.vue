<template>
  <div 
    class="stat-card"
    :class="[`variant-${variant}`, `size-${size}`, { 'is-clickable': clickable, 'is-loading': loading }]"
    @click="handleClick"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    
    <!-- 图标 -->
    <div v-if="icon" class="stat-icon" :class="iconColorClass">
      <IconLib :name="icon" :size="iconSize" />
    </div>
    
    <!-- 内容 -->
    <div class="stat-content">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">
        <span v-if="prefix" class="value-prefix">{{ prefix }}</span>
        <span class="value-number">{{ formattedValue }}</span>
        <span v-if="suffix" class="value-suffix">{{ suffix }}</span>
      </div>
      
      <!-- 变化趋势 -->
      <div v-if="change !== undefined" class="stat-change" :class="changeColorClass">
        <IconLib :name="changeIcon" :size="14" />
        <span>{{ Math.abs(change) }}%</span>
        <span v-if="changeLabel" class="change-label">{{ changeLabel }}</span>
      </div>
      
      <!-- 附加信息 -->
      <div v-if="$slots.extra || description" class="stat-extra">
        <slot name="extra">
          {{ description }}
        </slot>
      </div>
    </div>
    
    <!-- 进度条 -->
    <div v-if="progress !== undefined" class="stat-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: `${Math.min(progress, 100)}%` }"
        ></div>
      </div>
      <span class="progress-text">{{ progress }}%</span>
    </div>
    
    <!-- 迷你图表 -->
    <div v-if="sparkline && sparkline.length > 0" class="stat-sparkline">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" class="sparkline-svg">
        <path :d="sparklinePath" fill="none" stroke="currentColor" stroke-width="2"/>
        <path :d="sparklineAreaPath" fill="currentColor" opacity="0.1"/>
      </svg>
    </div>
    
    <!-- 操作按钮 -->
    <div v-if="$slots.action" class="stat-action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  label: string
  value: number | string
  icon?: string
  prefix?: string
  suffix?: string
  description?: string
  change?: number
  changeLabel?: string
  progress?: number
  sparkline?: number[]
  variant?: 'default' | 'gradient' | 'outlined' | 'filled'
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  clickable?: boolean
  animate?: boolean
  format?: 'number' | 'currency' | 'percent' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  color: 'primary',
  size: 'medium',
  loading: false,
  clickable: false,
  animate: true,
  format: 'number'
})

const emit = defineEmits<{
  click: []
}>()

// 图标尺寸
const iconSize = computed(() => {
  const sizes = { small: 20, medium: 24, large: 28 }
  return sizes[props.size]
})

// 图标颜色类
const iconColorClass = computed(() => `color-${props.color}`)

// 变化图标
const changeIcon = computed(() => {
  if (props.change === undefined) return 'minus'
  return props.change >= 0 ? 'trending-up' : 'trending-down'
})

// 变化颜色类
const changeColorClass = computed(() => {
  if (props.change === undefined) return ''
  return props.change >= 0 ? 'positive' : 'negative'
})

// 格式化值
const formattedValue = computed(() => {
  const val = typeof props.value === 'number' ? props.value : parseFloat(props.value) || 0
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 0
      }).format(val)
    case 'percent':
      return `${val.toFixed(1)}%`
    case 'compact':
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
      return val.toString()
    default:
      return val.toLocaleString()
  }
})

// 迷你图表路径
const sparklinePath = computed(() => {
  if (!props.sparkline || props.sparkline.length === 0) return ''
  
  const data = props.sparkline
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 30 - ((value - min) / range) * 26 - 2
    return `${x},${y}`
  })
  
  return `M${points.join(' L')}`
})

// 迷你图表区域路径
const sparklineAreaPath = computed(() => {
  if (!props.sparkline || props.sparkline.length === 0) return ''
  
  const data = props.sparkline
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 30 - ((value - min) / range) * 26 - 2
    return `${x},${y}`
  })
  
  return `M0,30 L0,${points[0].split(',')[1]} L${points.join(' L')} L100,30 Z`
})

// 点击处理
const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: var(--bg-primary, #fff);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card.is-clickable {
  cursor: pointer;
}

.stat-card.is-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 变体 - 渐变 */
.stat-card.variant-gradient {
  background: linear-gradient(135deg, var(--primary-color, #4B6EF5) 0%, var(--secondary-color, #6C5CE7) 100%);
  color: #fff;
}

.stat-card.variant-gradient .stat-label,
.stat-card.variant-gradient .stat-extra,
.stat-card.variant-gradient .change-label {
  color: rgba(255, 255, 255, 0.8);
}

.stat-card.variant-gradient .stat-icon {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* 变体 - 边框 */
.stat-card.variant-outlined {
  background: transparent;
  border: 1.5px solid var(--border-color, #e5e7eb);
  box-shadow: none;
}

/* 变体 - 填充 */
.stat-card.variant-filled {
  background: var(--bg-secondary, #f5f5f5);
  box-shadow: none;
}

/* 尺寸 */
.stat-card.size-small {
  padding: 1rem;
}

.stat-card.size-large {
  padding: 1.5rem;
}

/* 图标 */
.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.stat-card.size-small .stat-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 0.75rem;
}

.stat-card.size-large .stat-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 1.25rem;
}

.stat-icon.color-primary {
  background: rgba(75, 110, 245, 0.1);
  color: var(--primary-color, #4B6EF5);
}

.stat-icon.color-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-icon.color-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-icon.color-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-icon.color-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

/* 内容 */
.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #666);
  margin-bottom: 0.375rem;
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
  line-height: 1.2;
}

.stat-card.size-small .stat-value {
  font-size: 1.5rem;
}

.stat-card.size-large .stat-value {
  font-size: 2rem;
}

.value-prefix,
.value-suffix {
  font-size: 0.875em;
  font-weight: 500;
  color: var(--text-secondary, #666);
}

/* 变化趋势 */
.stat-change {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 6px;
}

.stat-change.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-change.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.change-label {
  color: var(--text-tertiary, #999);
  font-weight: 400;
  margin-left: 0.25rem;
}

/* 附加信息 */
.stat-extra {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary, #999);
}

/* 进度条 */
.stat-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-tertiary, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color, #4B6EF5), var(--secondary-color, #6C5CE7));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary, #666);
  min-width: 40px;
}

/* 迷你图表 */
.stat-sparkline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  opacity: 0.6;
}

.sparkline-svg {
  width: 100%;
  height: 100%;
  color: var(--primary-color, #4B6EF5);
}

/* 操作按钮 */
.stat-action {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

/* 加载状态 */
.stat-card.is-loading {
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color, #e5e7eb);
  border-top-color: var(--primary-color, #4B6EF5);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
