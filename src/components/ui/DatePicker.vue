<template>
  <div 
    class="date-picker"
    :class="[
      `date-picker--${size}`,
      { 'date-picker--disabled': disabled }
    ]"
    ref="containerRef"
  >
    <div 
      class="date-picker__input"
      :class="{ 'date-picker__input--focused': visible }"
      @click="handleInputClick"
    >
      <IconLib name="calendar" :size="16" class="date-picker__icon" />
      <input
        type="text"
        readonly
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="visible = !disabled"
      />
      <IconLib 
        v-if="clearable && modelValue && !disabled"
        name="close" 
        :size="14" 
        class="date-picker__clear"
        @click.stop="handleClear"
      />
    </div>
    
    <Teleport to="body">
      <Transition name="date-picker-dropdown">
        <div 
          v-if="visible"
          class="date-picker__dropdown"
          ref="dropdownRef"
          :style="dropdownStyle"
        >
          <!-- 日期面板 -->
          <div v-if="type === 'date' || type === 'datetime'" class="date-picker__panel">
            <!-- 头部 -->
            <div class="date-picker__header">
              <button type="button" @click="prevYear" class="date-picker__nav">
                <IconLib name="chevrons-left" :size="14" />
              </button>
              <button type="button" @click="prevMonth" class="date-picker__nav">
                <IconLib name="chevron-left" :size="14" />
              </button>
              <span class="date-picker__title">
                {{ currentYear }}年 {{ currentMonth + 1 }}月
              </span>
              <button type="button" @click="nextMonth" class="date-picker__nav">
                <IconLib name="chevron-right" :size="14" />
              </button>
              <button type="button" @click="nextYear" class="date-picker__nav">
                <IconLib name="chevrons-right" :size="14" />
              </button>
            </div>
            
            <!-- 星期头 -->
            <div class="date-picker__weekdays">
              <span v-for="day in weekdays" :key="day">{{ day }}</span>
            </div>
            
            <!-- 日期格子 -->
            <div class="date-picker__days">
              <button
                v-for="day in days"
                :key="day.key"
                type="button"
                class="date-picker__day"
                :class="{
                  'date-picker__day--other': !day.currentMonth,
                  'date-picker__day--today': day.isToday,
                  'date-picker__day--selected': day.isSelected,
                  'date-picker__day--disabled': day.disabled
                }"
                :disabled="day.disabled"
                @click="selectDate(day)"
              >
                {{ day.day }}
              </button>
            </div>
            
            <!-- 时间选择 -->
            <div v-if="type === 'datetime'" class="date-picker__time">
              <input
                type="text"
                v-model="timeValue"
                placeholder="00:00:00"
                @change="handleTimeChange"
              />
            </div>
            
            <!-- 底部操作 -->
            <div class="date-picker__footer">
              <button type="button" class="date-picker__btn" @click="selectToday">
                今天
              </button>
              <button type="button" class="date-picker__btn date-picker__btn--primary" @click="confirm">
                确定
              </button>
            </div>
          </div>
          
          <!-- 月份面板 -->
          <div v-else-if="type === 'month'" class="date-picker__panel">
            <div class="date-picker__header">
              <button type="button" @click="currentYear--" class="date-picker__nav">
                <IconLib name="chevron-left" :size="14" />
              </button>
              <span class="date-picker__title">{{ currentYear }}年</span>
              <button type="button" @click="currentYear++" class="date-picker__nav">
                <IconLib name="chevron-right" :size="14" />
              </button>
            </div>
            <div class="date-picker__months">
              <button
                v-for="month in 12"
                :key="month"
                type="button"
                class="date-picker__month"
                :class="{ 'date-picker__month--selected': isMonthSelected(month - 1) }"
                @click="selectMonth(month - 1)"
              >
                {{ month }}月
              </button>
            </div>
          </div>
          
          <!-- 年份面板 -->
          <div v-else-if="type === 'year'" class="date-picker__panel">
            <div class="date-picker__header">
              <button type="button" @click="yearRange -= 12" class="date-picker__nav">
                <IconLib name="chevron-left" :size="14" />
              </button>
              <span class="date-picker__title">{{ yearRange }} - {{ yearRange + 11 }}</span>
              <button type="button" @click="yearRange += 12" class="date-picker__nav">
                <IconLib name="chevron-right" :size="14" />
              </button>
            </div>
            <div class="date-picker__years">
              <button
                v-for="year in 12"
                :key="year"
                type="button"
                class="date-picker__year"
                :class="{ 'date-picker__year--selected': isYearSelected(yearRange + year - 1) }"
                @click="selectYear(yearRange + year - 1)"
              >
                {{ yearRange + year - 1 }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 绑定值
  modelValue?: string | Date | null
  // 类型
  type?: 'date' | 'datetime' | 'month' | 'year'
  // 占位符
  placeholder?: string
  // 格式化
  format?: string
  // 值格式化
  valueFormat?: string
  // 禁用
  disabled?: boolean
  // 可清空
  clearable?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 禁用日期
  disabledDate?: (date: Date) => boolean
  // 默认时间
  defaultTime?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'date',
  placeholder: '请选择日期',
  format: 'YYYY-MM-DD',
  disabled: false,
  clearable: true,
  size: 'default'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | Date | null): void
  (e: 'change', value: string | Date | null): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const containerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const visible = ref(false)

// 当前视图的年月
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const yearRange = ref(Math.floor(new Date().getFullYear() / 12) * 12)
const timeValue = ref(props.defaultTime || '00:00:00')

// 选中的日期
const selectedDate = ref<Date | null>(null)

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 下拉菜单样式
const dropdownStyle = ref({})

// 初始化选中日期
watch(() => props.modelValue, (value) => {
  if (value) {
    const date = value instanceof Date ? value : new Date(value)
    if (!isNaN(date.getTime())) {
      selectedDate.value = date
      currentYear.value = date.getFullYear()
      currentMonth.value = date.getMonth()
      if (props.type === 'datetime') {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')
        timeValue.value = `${hours}:${minutes}:${seconds}`
      }
    }
  } else {
    selectedDate.value = null
  }
}, { immediate: true })

// 显示值
const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  return formatDate(selectedDate.value, props.format)
})

// 日期格式化
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('HH', hours.toString().padStart(2, '0'))
    .replace('mm', minutes.toString().padStart(2, '0'))
    .replace('ss', seconds.toString().padStart(2, '0'))
}

// 生成日期数组
const days = computed(() => {
  const result: any[] = []
  const year = currentYear.value
  const month = currentMonth.value
  
  // 当月第一天
  const firstDay = new Date(year, month, 1)
  // 当月最后一天
  const lastDay = new Date(year, month + 1, 0)
  // 上月最后一天
  const prevLastDay = new Date(year, month, 0)
  
  // 上月天数
  const prevDays = firstDay.getDay()
  for (let i = prevDays - 1; i >= 0; i--) {
    const day = prevLastDay.getDate() - i
    const date = new Date(year, month - 1, day)
    result.push({
      key: `prev-${day}`,
      day,
      date,
      currentMonth: false,
      isToday: isSameDay(date, new Date()),
      isSelected: selectedDate.value && isSameDay(date, selectedDate.value),
      disabled: props.disabledDate ? props.disabledDate(date) : false
    })
  }
  
  // 当月天数
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    result.push({
      key: `current-${day}`,
      day,
      date,
      currentMonth: true,
      isToday: isSameDay(date, new Date()),
      isSelected: selectedDate.value && isSameDay(date, selectedDate.value),
      disabled: props.disabledDate ? props.disabledDate(date) : false
    })
  }
  
  // 下月天数 (补齐42天)
  const remainDays = 42 - result.length
  for (let day = 1; day <= remainDays; day++) {
    const date = new Date(year, month + 1, day)
    result.push({
      key: `next-${day}`,
      day,
      date,
      currentMonth: false,
      isToday: isSameDay(date, new Date()),
      isSelected: selectedDate.value && isSameDay(date, selectedDate.value),
      disabled: props.disabledDate ? props.disabledDate(date) : false
    })
  }
  
  return result
})

// 判断是否同一天
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate()
}

// 上一年
function prevYear() {
  currentYear.value--
}

// 下一年
function nextYear() {
  currentYear.value++
}

// 上一月
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

// 下一月
function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// 选择日期
function selectDate(day: any) {
  if (day.disabled) return
  selectedDate.value = day.date
  
  if (props.type === 'date') {
    confirm()
  }
}

// 选择今天
function selectToday() {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
  selectedDate.value = today
  confirm()
}

// 确认选择
function confirm() {
  if (selectedDate.value) {
    if (props.type === 'datetime') {
      const [hours, minutes, seconds] = timeValue.value.split(':').map(Number)
      selectedDate.value.setHours(hours || 0, minutes || 0, seconds || 0)
    }
    
    const value = props.valueFormat 
      ? formatDate(selectedDate.value, props.valueFormat)
      : selectedDate.value
    
    emit('update:modelValue', value)
    emit('change', value)
  }
  visible.value = false
}

// 时间变化
function handleTimeChange() {
  // 验证时间格式
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
  if (!timeRegex.test(timeValue.value)) {
    timeValue.value = '00:00:00'
  }
}

// 月份选中
function isMonthSelected(month: number): boolean {
  if (!selectedDate.value) return false
  return selectedDate.value.getFullYear() === currentYear.value &&
         selectedDate.value.getMonth() === month
}

// 选择月份
function selectMonth(month: number) {
  const date = new Date(currentYear.value, month, 1)
  selectedDate.value = date
  emit('update:modelValue', props.valueFormat 
    ? formatDate(date, props.valueFormat)
    : date
  )
  emit('change', date)
  visible.value = false
}

// 年份选中
function isYearSelected(year: number): boolean {
  if (!selectedDate.value) return false
  return selectedDate.value.getFullYear() === year
}

// 选择年份
function selectYear(year: number) {
  const date = new Date(year, 0, 1)
  selectedDate.value = date
  emit('update:modelValue', props.valueFormat 
    ? formatDate(date, props.valueFormat)
    : date
  )
  emit('change', date)
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
  selectedDate.value = null
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
    nextTick(updateDropdownPosition)
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
.date-picker {
  position: relative;
  display: inline-block;
  width: 220px;
}

.date-picker__input {
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

.date-picker__input:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.date-picker__input--focused {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.1);
}

.date-picker__icon {
  color: var(--text-secondary, #909399);
  margin-right: 8px;
}

.date-picker__input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-color, #303133);
  cursor: pointer;
}

.date-picker__input input::placeholder {
  color: var(--text-secondary, #c0c4cc);
}

.date-picker__clear {
  color: var(--text-secondary, #c0c4cc);
  cursor: pointer;
  transition: color 0.2s;
}

.date-picker__clear:hover {
  color: var(--text-color, #606266);
}

/* 尺寸 */
.date-picker--small .date-picker__input {
  height: 24px;
  font-size: 12px;
}

.date-picker--large .date-picker__input {
  height: 40px;
  font-size: 16px;
}

/* 禁用 */
.date-picker--disabled .date-picker__input {
  background: var(--disabled-bg, #f5f7fa);
  cursor: not-allowed;
}

.date-picker--disabled .date-picker__input input {
  cursor: not-allowed;
  color: var(--text-disabled, #c0c4cc);
}

/* 下拉面板 */
.date-picker__dropdown {
  background: var(--bg-color, #fff);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color, #e4e7ed);
  user-select: none;
}

.date-picker__panel {
  padding: 12px;
  min-width: 280px;
}

/* 头部 */
.date-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.date-picker__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary, #909399);
  transition: all 0.2s;
}

.date-picker__nav:hover {
  background: var(--bg-hover, #f5f7fa);
  color: var(--primary-color, #4B6EF5);
}

.date-picker__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #303133);
}

/* 星期 */
.date-picker__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color, #ebeef5);
  margin-bottom: 8px;
}

.date-picker__weekdays span {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  line-height: 32px;
}

/* 日期格子 */
.date-picker__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.date-picker__day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-color, #303133);
  cursor: pointer;
  transition: all 0.2s;
}

.date-picker__day:hover:not(:disabled) {
  background: var(--bg-hover, #f5f7fa);
}

.date-picker__day--other {
  color: var(--text-secondary, #c0c4cc);
}

.date-picker__day--today {
  color: var(--primary-color, #4B6EF5);
  font-weight: 600;
}

.date-picker__day--selected {
  background: var(--primary-color, #4B6EF5) !important;
  color: #fff !important;
}

.date-picker__day--disabled {
  color: var(--text-disabled, #c0c4cc);
  cursor: not-allowed;
  background: var(--disabled-bg, #f5f7fa);
}

/* 时间 */
.date-picker__time {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #ebeef5);
}

.date-picker__time input {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

/* 底部 */
.date-picker__footer {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #ebeef5);
}

.date-picker__btn {
  padding: 4px 12px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: #fff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.date-picker__btn:hover {
  color: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
}

.date-picker__btn--primary {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.date-picker__btn--primary:hover {
  background: var(--primary-hover, #3b5de7);
  border-color: var(--primary-hover, #3b5de7);
  color: #fff;
}

/* 月份/年份选择 */
.date-picker__months,
.date-picker__years {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.date-picker__month,
.date-picker__year {
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.date-picker__month:hover,
.date-picker__year:hover {
  background: var(--bg-hover, #f5f7fa);
}

.date-picker__month--selected,
.date-picker__year--selected {
  background: var(--primary-color, #4B6EF5) !important;
  color: #fff;
}

/* 动画 */
.date-picker-dropdown-enter-active,
.date-picker-dropdown-leave-active {
  transition: all 0.2s ease;
}

.date-picker-dropdown-enter-from,
.date-picker-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
