<template>
  <div 
    class="progress"
    :class="[
      `progress-${type}`,
      `progress-${size}`,
      `progress-${status}`,
      { 'progress-striped': striped, 'progress-animated': animated }
    ]"
  >
    <!-- 线形进度条 -->
    <template v-if="type === 'line'">
      <div class="progress-bar-wrap">
        <div class="progress-bar">
          <div 
            class="progress-bar-inner"
            :style="{ width: `${percent}%`, background: strokeColor }"
          ></div>
        </div>
        
        <span v-if="showInfo" class="progress-text">
          <template v-if="status === 'success'">
            <IconLib name="check-circle" :size="textSize" />
          </template>
          <template v-else-if="status === 'error'">
            <IconLib name="x-circle" :size="textSize" />
          </template>
          <template v-else>
            <slot name="format" :percent="percent">
              {{ format ? format(percent) : `${percent}%` }}
            </slot>
          </template>
        </span>
      </div>
    </template>
    
    <!-- 圆形进度条 -->
    <template v-else-if="type === 'circle' || type === 'dashboard'">
      <svg 
        class="progress-circle"
        :width="width"
        :height="width"
        :viewBox="`0 0 ${width} ${width}`"
      >
        <!-- 背景轨道 -->
        <circle
          class="progress-circle-track"
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="strokeWidth"
          fill="none"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="type === 'dashboard' ? circumference * 0.25 : 0"
          :transform="type === 'dashboard' ? `rotate(135 ${center} ${center})` : ''"
        />
        
        <!-- 进度 -->
        <circle
          class="progress-circle-inner"
          :cx="center"
          :cy="center"
          :r="radius"
          :stroke-width="strokeWidth"
          :stroke="strokeColor || getStatusColor()"
          fill="none"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          :transform="type === 'dashboard' ? `rotate(135 ${center} ${center})` : `rotate(-90 ${center} ${center})`"
          stroke-linecap="round"
        />
      </svg>
      
      <div class="progress-circle-content">
        <slot name="default">
          <template v-if="status === 'success'">
            <IconLib name="check" :size="iconSize" class="status-icon success" />
          </template>
          <template v-else-if="status === 'error'">
            <IconLib name="x" :size="iconSize" class="status-icon error" />
          </template>
          <template v-else-if="showInfo">
            <span class="progress-circle-text">
              <slot name="format" :percent="percent">
                {{ format ? format(percent) : `${percent}%` }}
              </slot>
            </span>
          </template>
        </slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Props
interface Props {
  percent: number
  type?: 'line' | 'circle' | 'dashboard'
  size?: 'small' | 'default' | 'large'
  status?: 'normal' | 'success' | 'error' | 'active'
  strokeWidth?: number
  strokeColor?: string
  trailColor?: string
  width?: number
  showInfo?: boolean
  striped?: boolean
  animated?: boolean
  format?: (percent: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  percent: 0,
  type: 'line',
  size: 'default',
  status: 'normal',
  strokeWidth: 8,
  width: 120,
  showInfo: true,
  striped: false,
  animated: false
})

// Computed
const center = computed(() => props.width / 2)
const radius = computed(() => (props.width - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

const progressOffset = computed(() => {
  const total = props.type === 'dashboard' ? circumference.value * 0.75 : circumference.value
  const progress = Math.max(0, Math.min(100, props.percent)) / 100
  return total * (1 - progress)
})

const textSize = computed(() => {
  const sizes = { small: 12, default: 14, large: 16 }
  return sizes[props.size]
})

const iconSize = computed(() => {
  return props.width * 0.3
})

// Methods
function getStatusColor(): string {
  switch (props.status) {
    case 'success': return '#52c41a'
    case 'error': return '#ff4d4f'
    default: return 'var(--primary-color, #4B6EF5)'
  }
}
</script>

<style scoped>
.progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-circle,
.progress-dashboard {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 线形进度条 */
.progress-line {
  width: 100%;
}

.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 100px;
  overflow: hidden;
}

.progress-bar-inner {
  height: 100%;
  background: var(--primary-color, #4B6EF5);
  border-radius: 100px;
  transition: width 0.3s;
}

/* 尺寸 */
.progress-small .progress-bar {
  height: 4px;
}

.progress-large .progress-bar {
  height: 12px;
}

/* 状态 */
.progress-success .progress-bar-inner {
  background: #52c41a;
}

.progress-error .progress-bar-inner {
  background: #ff4d4f;
}

.progress-active .progress-bar-inner {
  position: relative;
}

.progress-active .progress-bar-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: progress-active 2s ease infinite;
}

@keyframes progress-active {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 条纹 */
.progress-striped .progress-bar-inner {
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

.progress-striped.progress-animated .progress-bar-inner {
  animation: progress-striped 1s linear infinite;
}

@keyframes progress-striped {
  0% { background-position: 1rem 0; }
  100% { background-position: 0 0; }
}

/* 文字 */
.progress-text {
  flex-shrink: 0;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.progress-success .progress-text {
  color: #52c41a;
}

.progress-error .progress-text {
  color: #ff4d4f;
}

/* 圆形进度条 */
.progress-circle {
  position: relative;
}

.progress-circle-track {
  stroke: v-bind('trailColor || "#f0f0f0"');
}

.progress-circle-inner {
  transition: stroke-dashoffset 0.3s;
}

.progress-circle-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-circle-text {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.progress-small .progress-circle-text {
  font-size: 16px;
}

.progress-large .progress-circle-text {
  font-size: 32px;
}

.status-icon {
  color: #999;
}

.status-icon.success {
  color: #52c41a;
}

.status-icon.error {
  color: #ff4d4f;
}
</style>
