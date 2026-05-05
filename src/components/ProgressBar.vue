<template>
  <div class="progress-wrapper" :class="[`size-${size}`, `type-${type}`]">
    <!-- 标签 -->
    <div v-if="showLabel || $slots.label" class="progress-label">
      <slot name="label">
        <span class="label-text">{{ label }}</span>
      </slot>
      <span v-if="showPercent" class="label-percent">{{ displayPercent }}%</span>
    </div>
    
    <!-- 线性进度条 -->
    <div v-if="type === 'line'" class="progress-line">
      <div class="progress-track">
        <div 
          class="progress-fill"
          :class="statusClass"
          :style="fillStyle"
        >
          <div v-if="striped" class="progress-stripes" :class="{ animated: animated }"></div>
        </div>
      </div>
      
      <!-- 内部文字 -->
      <span v-if="textInside && showPercent" class="text-inside">
        {{ displayPercent }}%
      </span>
    </div>
    
    <!-- 圆形进度条 -->
    <div v-else-if="type === 'circle'" class="progress-circle" :style="circleWrapperStyle">
      <svg :viewBox="`0 0 ${circleSize} ${circleSize}`" class="circle-svg">
        <!-- 背景圆环 -->
        <circle
          class="circle-track"
          :cx="circleSize / 2"
          :cy="circleSize / 2"
          :r="radius"
          fill="none"
          :stroke-width="strokeWidth"
        />
        <!-- 进度圆环 -->
        <circle
          class="circle-fill"
          :class="statusClass"
          :cx="circleSize / 2"
          :cy="circleSize / 2"
          :r="radius"
          fill="none"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          stroke-linecap="round"
          :style="{ transition: `stroke-dashoffset ${duration}ms ease` }"
        />
      </svg>
      
      <!-- 中心内容 -->
      <div class="circle-content">
        <slot name="center">
          <span v-if="showPercent" class="circle-percent">{{ displayPercent }}%</span>
          <span v-if="label" class="circle-label">{{ label }}</span>
        </slot>
      </div>
    </div>
    
    <!-- 仪表盘进度条 -->
    <div v-else-if="type === 'dashboard'" class="progress-dashboard" :style="circleWrapperStyle">
      <svg :viewBox="`0 0 ${circleSize} ${circleSize}`" class="dashboard-svg">
        <!-- 背景弧 -->
        <path
          class="dashboard-track"
          :d="dashboardPath"
          fill="none"
          :stroke-width="strokeWidth"
        />
        <!-- 进度弧 -->
        <path
          class="dashboard-fill"
          :class="statusClass"
          :d="dashboardPath"
          fill="none"
          :stroke-width="strokeWidth"
          :stroke-dasharray="dashboardCircumference"
          :stroke-dashoffset="dashboardOffset"
          stroke-linecap="round"
          :style="{ transition: `stroke-dashoffset ${duration}ms ease` }"
        />
      </svg>
      
      <!-- 中心内容 -->
      <div class="dashboard-content">
        <slot name="center">
          <span v-if="showPercent" class="dashboard-percent">{{ displayPercent }}%</span>
          <span v-if="label" class="dashboard-label">{{ label }}</span>
        </slot>
      </div>
    </div>
    
    <!-- 步骤进度条 -->
    <div v-else-if="type === 'steps'" class="progress-steps">
      <div 
        v-for="step in steps"
        :key="step"
        class="step-item"
        :class="{ 
          'is-active': step <= currentStep,
          'is-current': step === currentStep
        }"
      >
        <div class="step-indicator">
          <IconLib v-if="step < currentStep" name="check" :size="16" />
          <span v-else>{{ step }}</span>
        </div>
        <div v-if="step < totalSteps" class="step-connector">
          <div class="connector-fill" :style="getConnectorStyle(step)"></div>
        </div>
      </div>
    </div>
    
    <!-- 底部描述 -->
    <div v-if="$slots.description" class="progress-description">
      <slot name="description"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  percent?: number
  type?: 'line' | 'circle' | 'dashboard' | 'steps'
  size?: 'small' | 'medium' | 'large'
  status?: 'primary' | 'success' | 'warning' | 'danger'
  label?: string
  showLabel?: boolean
  showPercent?: boolean
  textInside?: boolean
  striped?: boolean
  animated?: boolean
  strokeWidth?: number
  width?: number
  duration?: number
  totalSteps?: number
  currentStep?: number
  color?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  percent: 0,
  type: 'line',
  size: 'medium',
  status: 'primary',
  showLabel: false,
  showPercent: true,
  textInside: false,
  striped: false,
  animated: false,
  strokeWidth: 8,
  width: 120,
  duration: 500,
  totalSteps: 4,
  currentStep: 1
})

// 显示百分比
const displayPercent = computed(() => {
  return Math.min(100, Math.max(0, Math.round(props.percent)))
})

// 状态类
const statusClass = computed(() => {
  if (props.percent >= 100) return 'status-success'
  return `status-${props.status}`
})

// 线性进度条填充样式
const fillStyle = computed(() => {
  const style: Record<string, string> = {
    width: `${displayPercent.value}%`,
    transition: `width ${props.duration}ms ease`
  }
  
  if (props.color) {
    if (Array.isArray(props.color)) {
      style.background = `linear-gradient(90deg, ${props.color.join(', ')})`
    } else {
      style.background = props.color
    }
  }
  
  return style
})

// 圆形相关计算
const circleSize = computed(() => props.width)
const radius = computed(() => (circleSize.value - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => {
  return circumference.value * (1 - displayPercent.value / 100)
})

const circleWrapperStyle = computed(() => ({
  width: `${circleSize.value}px`,
  height: `${circleSize.value}px`
}))

// 仪表盘相关计算
const dashboardCircumference = computed(() => Math.PI * radius.value * 1.5) // 270度弧
const dashboardOffset = computed(() => {
  return dashboardCircumference.value * (1 - displayPercent.value / 100)
})

const dashboardPath = computed(() => {
  const cx = circleSize.value / 2
  const cy = circleSize.value / 2
  const r = radius.value
  
  // 起始角度 135度，结束角度 405度（270度弧）
  const startAngle = 135 * (Math.PI / 180)
  const endAngle = 405 * (Math.PI / 180)
  
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  
  return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`
})

// 步骤进度条
const steps = computed(() => {
  return Array.from({ length: props.totalSteps }, (_, i) => i + 1)
})

const getConnectorStyle = (step: number) => {
  if (step < props.currentStep) {
    return { width: '100%' }
  }
  if (step === props.currentStep) {
    return { width: `${(props.percent % 100)}%` }
  }
  return { width: '0%' }
}
</script>

<style scoped>
.progress-wrapper {
  width: 100%;
}

/* 标签 */
.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.label-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #1a1a1a);
}

.label-percent {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary, #666);
}

/* 线性进度条 */
.progress-line {
  position: relative;
}

.progress-track {
  position: relative;
  height: 8px;
  background: var(--bg-tertiary, #e5e7eb);
  border-radius: 4px;
  overflow: hidden;
}

.size-small .progress-track {
  height: 4px;
}

.size-large .progress-track {
  height: 12px;
}

.progress-fill {
  position: relative;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill.status-primary {
  background: linear-gradient(90deg, var(--primary-color, #4B6EF5), var(--secondary-color, #6C5CE7));
}

.progress-fill.status-success {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-fill.status-warning {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-fill.status-danger {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

/* 条纹效果 */
.progress-stripes {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.progress-stripes.animated {
  animation: stripes 1s linear infinite;
}

@keyframes stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

/* 内部文字 */
.text-inside {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 圆形进度条 */
.progress-circle,
.progress-dashboard {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.circle-svg,
.dashboard-svg {
  transform: rotate(-90deg);
}

.circle-track,
.dashboard-track {
  stroke: var(--bg-tertiary, #e5e7eb);
}

.circle-fill,
.dashboard-fill {
  stroke: var(--primary-color, #4B6EF5);
}

.circle-fill.status-success,
.dashboard-fill.status-success {
  stroke: #10b981;
}

.circle-fill.status-warning,
.dashboard-fill.status-warning {
  stroke: #f59e0b;
}

.circle-fill.status-danger,
.dashboard-fill.status-danger {
  stroke: #ef4444;
}

.circle-content,
.dashboard-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.circle-percent,
.dashboard-percent {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
}

.circle-label,
.dashboard-label {
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
  margin-top: 0.25rem;
}

/* 步骤进度条 */
.progress-steps {
  display: flex;
  align-items: center;
}

.step-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.step-item:last-child {
  flex: none;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--bg-tertiary, #e5e7eb);
  color: var(--text-secondary, #666);
  transition: all 0.3s ease;
}

.step-item.is-active .step-indicator {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

.step-item.is-current .step-indicator {
  box-shadow: 0 0 0 4px rgba(75, 110, 245, 0.2);
}

.step-connector {
  flex: 1;
  height: 4px;
  margin: 0 0.5rem;
  background: var(--bg-tertiary, #e5e7eb);
  border-radius: 2px;
  overflow: hidden;
}

.connector-fill {
  height: 100%;
  background: var(--primary-color, #4B6EF5);
  transition: width 0.3s ease;
}

/* 尺寸 */
.size-small .step-indicator {
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
}

.size-small .step-connector {
  height: 2px;
}

.size-large .step-indicator {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}

.size-large .step-connector {
  height: 6px;
}

/* 描述 */
.progress-description {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary, #999);
}
</style>
