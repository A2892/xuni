<template>
  <div 
    class="time-picker"
    :class="[
      `time-picker--${size}`,
      { 'time-picker--disabled': disabled }
    ]"
    ref="containerRef"
  >
    <div 
      class="time-picker__input"
      :class="{ 'time-picker__input--focused': visible }"
      @click="handleInputClick"
    >
      <IconLib name="clock" :size="16" class="time-picker__icon" />
      <input
        type="text"
        readonly
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
      />
      <IconLib 
        v-if="clearable && modelValue && !disabled"
        name="close" 
        :size="14" 
        class="time-picker__clear"
        @click.stop="handleClear"
      />
    </div>
    
    <Teleport to="body">
      <Transition name="time-picker-dropdown">
        <div 
          v-if="visible"
          class="time-picker__dropdown"
          ref="dropdownRef"
          :style="dropdownStyle"
        >
          <div class="time-picker__panel">
            <!-- 小时列 -->
            <div class="time-picker__spinner" ref="hourSpinner">
              <ul class="time-picker__list">
                <li 
                  v-for="hour in hours"
                  :key="hour"
                  class="time-picker__item"
                  :class="{
                    'time-picker__item--active': hour === selectedHour,
                    'time-picker__item--disabled': isHourDisabled(hour)
                  }"
                  @click="selectHour(hour)"
                >
                  {{ hour.toString().padStart(2, '0') }}
                </li>
              </ul>
            </div>
            
            <!-- 分钟列 -->
            <div class="time-picker__spinner" ref="minuteSpinner">
              <ul class="time-picker__list">
                <li 
                  v-for="minute in minutes"
                  :key="minute"
                  class="time-picker__item"
                  :class="{
                    'time-picker__item--active': minute === selectedMinute,
                    'time-picker__item--disabled': isMinuteDisabled(minute)
                  }"
                  @click="selectMinute(minute)"
                >
                  {{ minute.toString().padStart(2, '0') }}
                </li>
              </ul>
            </div>
            
            <!-- 秒钟列 (可选) -->
            <div v-if="showSeconds" class="time-picker__spinner" ref="secondSpinner">
              <ul class="time-picker__list">
                <li 
                  v-for="second in seconds"
                  :key="second"
                  class="time-picker__item"
                  :class="{
                    'time-picker__item--active': second === selectedSecond,
                    'time-picker__item--disabled': isSecondDisabled(second)
                  }"
                  @click="selectSecond(second)"
                >
                  {{ second.toString().padStart(2, '0') }}
                </li>
              </ul>
            </div>
          </div>
          
          <div class="time-picker__footer">
            <button type="button" class="time-picker__btn" @click="selectNow">
              此刻
            </button>
            <button type="button" class="time-picker__btn time-picker__btn--primary" @click="confirm">
              确定
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 绑定值
  modelValue?: string | null
  // 占位符
  placeholder?: string
  // 格式化
  format?: string
  // 禁用
  disabled?: boolean
  // 可清空
  clearable?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 显示秒钟
  showSeconds?: boolean
  // 小时步长
  hourStep?: number
  // 分钟步长
  minuteStep?: number
  // 秒钟步长
  secondStep?: number
  // 禁用小时
  disabledHours?: () => number[]
  // 禁用分钟
  disabledMinutes?: (hour: number) => number[]
  // 禁用秒钟
  disabledSeconds?: (hour: number, minute: number) => number[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择时间',
  format: 'HH:mm:ss',
  disabled: false,
  clearable: true,
  size: 'default',
  showSeconds: true,
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'change', value: string | null): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const containerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const hourSpinner = ref<HTMLElement>()
const minuteSpinner = ref<HTMLElement>()
const secondSpinner = ref<HTMLElement>()

const visible = ref(false)

// 选中的时间
const selectedHour = ref(0)
const selectedMinute = ref(0)
const selectedSecond = ref(0)

// 下拉菜单样式
const dropdownStyle = ref({})

// 生成小时数组
const hours = computed(() => {
  const result: number[] = []
  for (let i = 0; i < 24; i += props.hourStep) {
    result.push(i)
  }
  return result
})

// 生成分钟数组
const minutes = computed(() => {
  const result: number[] = []
  for (let i = 0; i < 60; i += props.minuteStep) {
    result.push(i)
  }
  return result
})

// 生成秒钟数组
const seconds = computed(() => {
  const result: number[] = []
  for (let i = 0; i < 60; i += props.secondStep) {
    result.push(i)
  }
  return result
})

// 显示值
const displayValue = computed(() => {
  if (props.modelValue) {
    return props.modelValue
  }
  return ''
})

// 解析时间字符串
function parseTime(value: string): [number, number, number] {
  const parts = value.split(':').map(Number)
  return [
    parts[0] || 0,
    parts[1] || 0,
    parts[2] || 0
  ]
}

// 初始化选中时间
watch(() => props.modelValue, (value) => {
  if (value) {
    const [h, m, s] = parseTime(value)
    selectedHour.value = h
    selectedMinute.value = m
    selectedSecond.value = s
  }
}, { immediate: true })

// 选择小时
function selectHour(hour: number) {
  if (isHourDisabled(hour)) return
  selectedHour.value = hour
}

// 选择分钟
function selectMinute(minute: number) {
  if (isMinuteDisabled(minute)) return
  selectedMinute.value = minute
}

// 选择秒钟
function selectSecond(second: number) {
  if (isSecondDisabled(second)) return
  selectedSecond.value = second
}

// 小时是否禁用
function isHourDisabled(hour: number): boolean {
  if (!props.disabledHours) return false
  return props.disabledHours().includes(hour)
}

// 分钟是否禁用
function isMinuteDisabled(minute: number): boolean {
  if (!props.disabledMinutes) return false
  return props.disabledMinutes(selectedHour.value).includes(minute)
}

// 秒钟是否禁用
function isSecondDisabled(second: number): boolean {
  if (!props.disabledSeconds) return false
  return props.disabledSeconds(selectedHour.value, selectedMinute.value).includes(second)
}

// 选择当前时间
function selectNow() {
  const now = new Date()
  selectedHour.value = now.getHours()
  selectedMinute.value = now.getMinutes()
  selectedSecond.value = now.getSeconds()
  confirm()
}

// 确认选择
function confirm() {
  const hour = selectedHour.value.toString().padStart(2, '0')
  const minute = selectedMinute.value.toString().padStart(2, '0')
  const second = selectedSecond.value.toString().padStart(2, '0')
  
  let value = `${hour}:${minute}`
  if (props.showSeconds) {
    value += `:${second}`
  }
  
  emit('update:modelValue', value)
  emit('change', value)
  visible.value = false
}

// 输入框点击
function handleInputClick() {
  if (!props.disabled) {
    visible.value = true
    emit('focus')
  }
}

// 清空
function handleClear() {
  emit('update:modelValue', null)
  emit('change', null)
}

// 更新下拉位置
function updateDropdownPosition() {
  if (!containerRef.value || !visible.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.bottom + 4}px`,
    zIndex: 2000
  }
}

// 滚动到选中项
function scrollToSelected() {
  nextTick(() => {
    scrollToActive(hourSpinner.value, selectedHour.value, hours.value)
    scrollToActive(minuteSpinner.value, selectedMinute.value, minutes.value)
    if (props.showSeconds) {
      scrollToActive(secondSpinner.value, selectedSecond.value, seconds.value)
    }
  })
}

// 滚动到激活项
function scrollToActive(container: HTMLElement | undefined, value: number, list: number[]) {
  if (!container) return
  const index = list.indexOf(value)
  if (index !== -1) {
    container.scrollTop = index * 32
  }
}

// 点击外部关闭
function handleClickOutside(e: MouseEvent) {
  if (!containerRef.value?.contains(e.target as Node) &&
      !dropdownRef.value?.contains(e.target as Node)) {
    visible.value = false
    emit('blur')
  }
}

watch(visible, (val) => {
  if (val) {
    nextTick(() => {
      updateDropdownPosition()
      scrollToSelected()
    })
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)
  } else {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', updateDropdownPosition)
    window.removeEventListener('scroll', updateDropdownPosition, true)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
})
</script>

<style scoped>
.time-picker {
  position: relative;
  display: inline-block;
  width: 140px;
}

.time-picker__input {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 32px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--bg-color, #fff);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.time-picker__input:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.time-picker__input--focused {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.1);
}

.time-picker__icon {
  color: var(--text-secondary, #909399);
  margin-right: 8px;
}

.time-picker__input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-color, #303133);
  cursor: pointer;
  width: 100%;
}

.time-picker__input input::placeholder {
  color: var(--text-secondary, #c0c4cc);
}

.time-picker__clear {
  color: var(--text-secondary, #c0c4cc);
  cursor: pointer;
  transition: color 0.2s;
}

.time-picker__clear:hover {
  color: var(--text-color, #606266);
}

/* 尺寸 */
.time-picker--small .time-picker__input {
  height: 24px;
  font-size: 12px;
}

.time-picker--large .time-picker__input {
  height: 40px;
  font-size: 16px;
}

/* 禁用 */
.time-picker--disabled .time-picker__input {
  background: var(--disabled-bg, #f5f7fa);
  cursor: not-allowed;
}

.time-picker--disabled .time-picker__input input {
  cursor: not-allowed;
  color: var(--text-disabled, #c0c4cc);
}

/* 下拉面板 */
.time-picker__dropdown {
  background: var(--bg-color, #fff);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color, #e4e7ed);
  user-select: none;
}

.time-picker__panel {
  display: flex;
  height: 200px;
}

.time-picker__spinner {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.time-picker__spinner::before,
.time-picker__spinner::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 84px;
  pointer-events: none;
  z-index: 1;
}

.time-picker__spinner::before {
  top: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0));
}

.time-picker__spinner::after {
  bottom: 0;
  background: linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0));
}

.time-picker__list {
  list-style: none;
  padding: 84px 0;
  margin: 0;
  overflow-y: auto;
  height: 100%;
  scrollbar-width: none;
}

.time-picker__list::-webkit-scrollbar {
  display: none;
}

.time-picker__spinner + .time-picker__spinner {
  border-left: 1px solid var(--border-color, #e4e7ed);
}

.time-picker__item {
  height: 32px;
  line-height: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--text-color, #303133);
  cursor: pointer;
  transition: all 0.2s;
}

.time-picker__item:hover:not(.time-picker__item--disabled) {
  background: var(--bg-hover, #f5f7fa);
}

.time-picker__item--active {
  font-weight: 600;
  color: var(--primary-color, #4B6EF5);
  background: rgba(75, 110, 245, 0.1);
}

.time-picker__item--disabled {
  color: var(--text-disabled, #c0c4cc);
  cursor: not-allowed;
}

/* 底部 */
.time-picker__footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid var(--border-color, #e4e7ed);
}

.time-picker__btn {
  padding: 4px 12px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: #fff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.time-picker__btn:hover {
  color: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
}

.time-picker__btn--primary {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.time-picker__btn--primary:hover {
  background: var(--primary-hover, #3b5de7);
  border-color: var(--primary-hover, #3b5de7);
  color: #fff;
}

/* 动画 */
.time-picker-dropdown-enter-active,
.time-picker-dropdown-leave-active {
  transition: all 0.2s ease;
}

.time-picker-dropdown-enter-from,
.time-picker-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
