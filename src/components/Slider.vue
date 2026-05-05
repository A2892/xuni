<template>
  <div class="slider-wrapper" :class="{ 'is-disabled': disabled }">
    <div 
      ref="trackRef"
      class="slider-track"
      @click="handleTrackClick"
    >
      <!-- 已填充轨道 -->
      <div 
        class="slider-fill" 
        :style="{ width: `${percentage}%` }"
      ></div>
      
      <!-- 刻度标记 -->
      <div v-if="showMarks && marks.length > 0" class="slider-marks">
        <div 
          v-for="mark in marks" 
          :key="mark.value"
          class="slider-mark"
          :class="{ 'is-active': modelValue >= mark.value }"
          :style="{ left: `${getMarkPosition(mark.value)}%` }"
        >
          <div class="mark-dot"></div>
          <span v-if="mark.label" class="mark-label">{{ mark.label }}</span>
        </div>
      </div>
      
      <!-- 滑块 -->
      <div 
        class="slider-thumb"
        :style="{ left: `${percentage}%` }"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <div class="thumb-handle">
          <div v-if="showTooltip && isDragging" class="thumb-tooltip">{{ displayValue }}</div>
        </div>
      </div>
    </div>
    
    <!-- 输入框 -->
    <div v-if="showInput" class="slider-input">
      <input 
        type="number"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        class="input-field"
        @input="handleInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Mark {
  value: number
  label?: string
}

interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showTooltip?: boolean
  showInput?: boolean
  showMarks?: boolean
  marks?: Mark[]
  formatTooltip?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  showTooltip: true,
  marks: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const trackRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

// 百分比
const percentage = computed(() => {
  const range = props.max - props.min
  return ((props.modelValue - props.min) / range) * 100
})

// 显示值
const displayValue = computed(() => {
  if (props.formatTooltip) {
    return props.formatTooltip(props.modelValue)
  }
  return props.modelValue
})

// 获取刻度位置
const getMarkPosition = (value: number) => {
  const range = props.max - props.min
  return ((value - props.min) / range) * 100
}

// 计算值
const calculateValue = (clientX: number) => {
  if (!trackRef.value) return props.modelValue
  
  const rect = trackRef.value.getBoundingClientRect()
  const offsetX = clientX - rect.left
  const percentage = Math.max(0, Math.min(1, offsetX / rect.width))
  
  const range = props.max - props.min
  let value = props.min + percentage * range
  
  // 对齐步长
  value = Math.round(value / props.step) * props.step
  value = Math.max(props.min, Math.min(props.max, value))
  
  return value
}

// 更新值
const updateValue = (value: number) => {
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
    emit('change', value)
  }
}

// 轨道点击
const handleTrackClick = (event: MouseEvent) => {
  if (props.disabled) return
  const value = calculateValue(event.clientX)
  updateValue(value)
}

// 开始拖动
const startDrag = (event: MouseEvent | TouchEvent) => {
  if (props.disabled) return
  
  event.preventDefault()
  isDragging.value = true
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('touchend', stopDrag)
}

// 拖动中
const handleDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const value = calculateValue(clientX)
  updateValue(value)
}

// 停止拖动
const stopDrag = () => {
  isDragging.value = false
  
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
}

// 输入框
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = parseFloat(target.value)
  
  if (isNaN(value)) return
  
  value = Math.max(props.min, Math.min(props.max, value))
  updateValue(value)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider-wrapper.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* 轨道 */
.slider-track {
  position: relative;
  flex: 1;
  height: 6px;
  background: var(--bg-color-secondary, #e5e7eb);
  border-radius: 3px;
  cursor: pointer;
}

.slider-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--primary-color, #4B6EF5);
  border-radius: 3px;
  transition: width 0.1s ease;
}

/* 滑块 */
.slider-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.thumb-handle {
  position: relative;
  width: 18px;
  height: 18px;
  background: #fff;
  border: 2px solid var(--primary-color, #4B6EF5);
  border-radius: 50%;
  cursor: grab;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.thumb-handle:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 10px rgba(75, 110, 245, 0.3);
}

.thumb-handle:active {
  cursor: grabbing;
}

/* 提示 */
.thumb-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--text-color-primary, #333);
  color: #fff;
  border-radius: 4px;
  white-space: nowrap;
}

.thumb-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--text-color-primary, #333);
}

/* 刻度 */
.slider-marks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
}

.slider-mark {
  position: absolute;
  top: 50%;
  transform: translateX(-50%);
}

.mark-dot {
  width: 8px;
  height: 8px;
  background: #fff;
  border: 2px solid var(--bg-color-secondary, #e5e7eb);
  border-radius: 50%;
  transform: translateY(-50%);
  transition: border-color 0.2s ease;
}

.slider-mark.is-active .mark-dot {
  border-color: var(--primary-color, #4B6EF5);
}

.mark-label {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
  white-space: nowrap;
}

/* 输入框 */
.slider-input {
  flex-shrink: 0;
}

.input-field {
  width: 60px;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  text-align: center;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s ease;
  -moz-appearance: textfield;
}

.input-field::-webkit-outer-spin-button,
.input-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-field:focus {
  border-color: var(--primary-color, #4B6EF5);
}
</style>
