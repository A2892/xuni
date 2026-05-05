<template>
  <div 
    class="countdown"
    :class="[
      `countdown--${size}`,
      { 'countdown--finished': isFinished }
    ]"
  >
    <slot v-bind="{ days, hours, minutes, seconds, milliseconds, isFinished }">
      <span v-if="showDays && days > 0" class="countdown__block">
        <span class="countdown__value">{{ formatValue(days) }}</span>
        <span class="countdown__label">天</span>
      </span>
      <span v-if="showDays && days > 0" class="countdown__separator">{{ separator }}</span>
      
      <span class="countdown__block">
        <span class="countdown__value">{{ formatValue(hours) }}</span>
        <span class="countdown__label">时</span>
      </span>
      <span class="countdown__separator">{{ separator }}</span>
      
      <span class="countdown__block">
        <span class="countdown__value">{{ formatValue(minutes) }}</span>
        <span class="countdown__label">分</span>
      </span>
      <span class="countdown__separator">{{ separator }}</span>
      
      <span class="countdown__block">
        <span class="countdown__value">{{ formatValue(seconds) }}</span>
        <span class="countdown__label">秒</span>
      </span>
      
      <template v-if="showMilliseconds">
        <span class="countdown__separator">.</span>
        <span class="countdown__block countdown__block--ms">
          <span class="countdown__value">{{ formatValue(milliseconds, 3) }}</span>
        </span>
      </template>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  // 目标时间 (时间戳或 Date)
  value: number | Date
  // 是否显示天数
  showDays?: boolean
  // 是否显示毫秒
  showMilliseconds?: boolean
  // 分隔符
  separator?: string
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 自动开始
  autoStart?: boolean
  // 更新间隔 (毫秒)
  interval?: number
}

const props = withDefaults(defineProps<Props>(), {
  showDays: true,
  showMilliseconds: false,
  separator: ':',
  size: 'default',
  autoStart: true,
  interval: 1000
})

const emit = defineEmits<{
  (e: 'finish'): void
  (e: 'change', time: { days: number; hours: number; minutes: number; seconds: number; milliseconds: number }): void
}>()

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const milliseconds = ref(0)
const isFinished = ref(false)

let timerId: ReturnType<typeof setTimeout> | null = null

// 目标时间戳
const targetTime = computed(() => {
  return props.value instanceof Date 
    ? props.value.getTime() 
    : props.value
})

// 格式化数值
function formatValue(value: number, length: number = 2): string {
  return String(value).padStart(length, '0')
}

// 更新倒计时
function updateCountdown() {
  const now = Date.now()
  let diff = targetTime.value - now
  
  if (diff <= 0) {
    diff = 0
    isFinished.value = true
    stop()
    emit('finish')
  }
  
  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
  milliseconds.value = diff % 1000
  
  emit('change', {
    days: days.value,
    hours: hours.value,
    minutes: minutes.value,
    seconds: seconds.value,
    milliseconds: milliseconds.value
  })
}

// 开始倒计时
function start() {
  if (timerId) return
  
  isFinished.value = false
  updateCountdown()
  
  const interval = props.showMilliseconds ? Math.min(props.interval, 50) : props.interval
  
  timerId = setInterval(updateCountdown, interval)
}

// 停止倒计时
function stop() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

// 重置倒计时
function reset() {
  stop()
  isFinished.value = false
  updateCountdown()
}

// 监听目标时间变化
watch(targetTime, () => {
  reset()
  if (props.autoStart) {
    start()
  }
})

onMounted(() => {
  if (props.autoStart) {
    start()
  }
})

onUnmounted(() => {
  stop()
})

// 暴露方法
defineExpose({
  start,
  stop,
  reset
})
</script>

<style scoped>
.countdown {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.countdown__block {
  display: inline-flex;
  align-items: baseline;
}

.countdown__value {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  font-weight: 600;
  color: var(--text-color, #303133);
}

.countdown__label {
  font-size: 0.75em;
  color: var(--text-secondary, #909399);
  margin-left: 2px;
}

.countdown__separator {
  color: var(--text-secondary, #909399);
}

.countdown__block--ms .countdown__value {
  font-size: 0.8em;
}

/* 尺寸 */
.countdown--small .countdown__value {
  font-size: 14px;
}

.countdown--default .countdown__value {
  font-size: 20px;
}

.countdown--large .countdown__value {
  font-size: 28px;
}

/* 完成状态 */
.countdown--finished .countdown__value {
  color: var(--success-color, #67c23a);
}
</style>
