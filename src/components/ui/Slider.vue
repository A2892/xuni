<template>
  <div class="slider" :class="sliderClasses">
    <!-- 轨道 -->
    <div 
      ref="trackRef"
      class="slider__track"
      @click="handleTrackClick"
    >
      <!-- 已选范围 -->
      <div class="slider__fill" :style="fillStyle"></div>
      
      <!-- 刻度 (可选) -->
      <div v-if="showStops" class="slider__stops">
        <span 
          v-for="stop in stops" 
          :key="stop"
          class="slider__stop"
          :style="{ left: `${stop}%` }"
        ></span>
      </div>
      
      <!-- 拖动按钮 (单值) -->
      <div 
        v-if="!range"
        class="slider__handle"
        :style="{ left: `${percentage}%` }"
        @mousedown="handleMouseDown($event, 'single')"
        @touchstart="handleTouchStart($event, 'single')"
      >
        <slot name="handle">
          <div class="slider__handle-inner">
            <span v-if="showTooltip" class="slider__tooltip">
              {{ formatValue(modelValue as number) }}
            </span>
          </div>
        </slot>
      </div>
      
      <!-- 拖动按钮 (范围) -->
      <template v-else>
        <div 
          class="slider__handle"
          :style="{ left: `${startPercentage}%` }"
          @mousedown="handleMouseDown($event, 'start')"
          @touchstart="handleTouchStart($event, 'start')"
        >
          <div class="slider__handle-inner">
            <span v-if="showTooltip" class="slider__tooltip">
              {{ formatValue((modelValue as [number, number])[0]) }}
            </span>
          </div>
        </div>
        
        <div 
          class="slider__handle"
          :style="{ left: `${endPercentage}%` }"
          @mousedown="handleMouseDown($event, 'end')"
          @touchstart="handleTouchStart($event, 'end')"
        >
          <div class="slider__handle-inner">
            <span v-if="showTooltip" class="slider__tooltip">
              {{ formatValue((modelValue as [number, number])[1]) }}
            </span>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 标签 -->
    <div v-if="marks && Object.keys(marks).length" class="slider__marks">
      <span 
        v-for="(label, value) in marks" 
        :key="value"
        class="slider__mark"
        :style="{ left: `${valueToPercent(Number(value))}%` }"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  // 值
  modelValue?: number | [number, number]
  // 最小值
  min?: number
  // 最大值
  max?: number
  // 步长
  step?: number
  // 是否禁用
  disabled?: boolean
  // 是否为范围选择
  range?: boolean
  // 是否显示刻度
  showStops?: boolean
  // 是否显示提示
  showTooltip?: boolean
  // 标记
  marks?: Record<number, string>
  // 格式化函数
  formatter?: (value: number) => string
  // 是否垂直
  vertical?: boolean
  // 垂直高度
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  range: false,
  showStops: false,
  showTooltip: true,
  vertical: false,
  height: 200
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | [number, number]): void
  (e: 'change', value: number | [number, number]): void
}>()

const trackRef = ref<HTMLElement>()
const dragging = ref<'single' | 'start' | 'end' | null>(null)

// 刻度
const stops = computed(() => {
  if (!props.showStops) return []
  
  const result: number[] = []
  const stepCount = (props.max - props.min) / props.step
  
  for (let i = 1; i < stepCount; i++) {
    result.push((i / stepCount) * 100)
  }
  
  return result
})

// 百分比 (单值)
const percentage = computed(() => {
  const value = props.modelValue as number
  return valueToPercent(value)
})

// 百分比 (范围 - 开始)
const startPercentage = computed(() => {
  const value = (props.modelValue as [number, number])[0]
  return valueToPercent(value)
})

// 百分比 (范围 - 结束)
const endPercentage = computed(() => {
  const value = (props.modelValue as [number, number])[1]
  return valueToPercent(value)
})

// 填充样式
const fillStyle = computed(() => {
  if (props.range) {
    return {
      left: `${startPercentage.value}%`,
      width: `${endPercentage.value - startPercentage.value}%`
    }
  }
  return {
    left: '0%',
    width: `${percentage.value}%`
  }
})

const sliderClasses = computed(() => [
  {
    'slider--disabled': props.disabled,
    'slider--vertical': props.vertical
  }
])

// 值转百分比
function valueToPercent(value: number): number {
  return ((value - props.min) / (props.max - props.min)) * 100
}

// 百分比转值
function percentToValue(percent: number): number {
  const raw = (percent / 100) * (props.max - props.min) + props.min
  // 步进对齐
  const stepped = Math.round(raw / props.step) * props.step
  return Math.min(Math.max(stepped, props.min), props.max)
}

// 格式化值
function formatValue(value: number): string {
  if (props.formatter) {
    return props.formatter(value)
  }
  return String(value)
}

// 获取百分比位置
function getPercentFromEvent(event: MouseEvent | Touch): number {
  const track = trackRef.value
  if (!track) return 0
  
  const rect = track.getBoundingClientRect()
  const offset = event.clientX - rect.left
  const percent = (offset / rect.width) * 100
  
  return Math.min(Math.max(percent, 0), 100)
}

// 更新值
function updateValue(percent: number, type: 'single' | 'start' | 'end') {
  const newValue = percentToValue(percent)
  
  if (props.range) {
    const [start, end] = props.modelValue as [number, number]
    let newRange: [number, number]
    
    if (type === 'start') {
      newRange = [Math.min(newValue, end), end]
    } else {
      newRange = [start, Math.max(newValue, start)]
    }
    
    emit('update:modelValue', newRange)
  } else {
    emit('update:modelValue', newValue)
  }
}

// 点击轨道
function handleTrackClick(event: MouseEvent) {
  if (props.disabled) return
  
  const percent = getPercentFromEvent(event)
  const newValue = percentToValue(percent)
  
  if (props.range) {
    const [start, end] = props.modelValue as [number, number]
    const mid = (start + end) / 2
    
    if (newValue < mid) {
      emit('update:modelValue', [newValue, end])
    } else {
      emit('update:modelValue', [start, newValue])
    }
  } else {
    emit('update:modelValue', newValue)
  }
  
  emit('change', props.modelValue!)
}

// 鼠标拖动
function handleMouseDown(event: MouseEvent, type: 'single' | 'start' | 'end') {
  if (props.disabled) return
  
  event.preventDefault()
  dragging.value = type
  
  const handleMouseMove = (e: MouseEvent) => {
    const percent = getPercentFromEvent(e)
    updateValue(percent, type)
  }
  
  const handleMouseUp = () => {
    dragging.value = null
    emit('change', props.modelValue!)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 触摸拖动
function handleTouchStart(event: TouchEvent, type: 'single' | 'start' | 'end') {
  if (props.disabled) return
  
  event.preventDefault()
  dragging.value = type
  
  const handleTouchMove = (e: TouchEvent) => {
    const percent = getPercentFromEvent(e.touches[0])
    updateValue(percent, type)
  }
  
  const handleTouchEnd = () => {
    dragging.value = null
    emit('change', props.modelValue!)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
  
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
}
</script>

<style scoped>
.slider {
  padding: 8px 0;
}

.slider--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider--disabled .slider__track {
  pointer-events: none;
}

/* 轨道 */
.slider__track {
  position: relative;
  height: 6px;
  background: var(--bg-secondary, #e4e7ed);
  border-radius: 3px;
  cursor: pointer;
}

/* 填充 */
.slider__fill {
  position: absolute;
  height: 100%;
  background: var(--primary-color, #4B6EF5);
  border-radius: 3px;
  transition: width 0.1s, left 0.1s;
}

/* 刻度 */
.slider__stops {
  position: absolute;
  inset: 0;
}

.slider__stop {
  position: absolute;
  top: 50%;
  width: 4px;
  height: 4px;
  margin-left: -2px;
  background: #fff;
  border-radius: 50%;
  transform: translateY(-50%);
}

/* 拖动按钮 */
.slider__handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.slider__handle-inner {
  width: 20px;
  height: 20px;
  background: #fff;
  border: 2px solid var(--primary-color, #4B6EF5);
  border-radius: 50%;
  cursor: grab;
  transition: all 0.2s;
}

.slider__handle-inner:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(75, 110, 245, 0.2);
}

.slider__handle:active .slider__handle-inner {
  cursor: grabbing;
}

/* 提示 */
.slider__tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: var(--text-color, #303133);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  margin-bottom: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
}

.slider__tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -4px;
  border: 4px solid transparent;
  border-top-color: var(--text-color, #303133);
}

.slider__handle:hover .slider__tooltip {
  opacity: 1;
  visibility: visible;
}

/* 标记 */
.slider__marks {
  position: relative;
  margin-top: 8px;
}

.slider__mark {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

/* 垂直模式 */
.slider--vertical {
  display: inline-flex;
  height: var(--slider-height, 200px);
  padding: 0 8px;
}

.slider--vertical .slider__track {
  width: 6px;
  height: 100%;
}

.slider--vertical .slider__fill {
  width: 100%;
  top: auto;
  bottom: 0;
}

.slider--vertical .slider__handle {
  left: 50%;
  top: auto;
  transform: translate(-50%, 50%);
}
</style>
