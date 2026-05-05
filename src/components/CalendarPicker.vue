<template>
  <div class="calendar-picker">
    <!-- 头部 -->
    <div class="calendar-header">
      <button class="nav-btn" @click="prevMonth">
        <IconLib name="chevron-left" :size="16" />
      </button>
      
      <div class="header-title">
        <button class="year-month-btn" @click="toggleYearPicker">
          {{ currentYear }} 年
        </button>
        <button class="year-month-btn" @click="toggleMonthPicker">
          {{ currentMonth + 1 }} 月
        </button>
      </div>
      
      <button class="nav-btn" @click="nextMonth">
        <IconLib name="chevron-right" :size="16" />
      </button>
    </div>
    
    <!-- 年份选择器 -->
    <transition name="fade">
      <div v-if="showYearPicker" class="year-picker">
        <div class="picker-header">
          <button @click="yearRange -= 12">
            <IconLib name="chevron-left" :size="14" />
          </button>
          <span>{{ yearRange }} - {{ yearRange + 11 }}</span>
          <button @click="yearRange += 12">
            <IconLib name="chevron-right" :size="14" />
          </button>
        </div>
        <div class="year-grid">
          <button 
            v-for="year in yearOptions" 
            :key="year"
            :class="['year-item', { active: year === currentYear }]"
            @click="selectYear(year)"
          >
            {{ year }}
          </button>
        </div>
      </div>
    </transition>
    
    <!-- 月份选择器 -->
    <transition name="fade">
      <div v-if="showMonthPicker" class="month-picker">
        <div class="month-grid">
          <button 
            v-for="(month, index) in months" 
            :key="index"
            :class="['month-item', { active: index === currentMonth }]"
            @click="selectMonth(index)"
          >
            {{ month }}
          </button>
        </div>
      </div>
    </transition>
    
    <!-- 日历主体 -->
    <div v-show="!showYearPicker && !showMonthPicker" class="calendar-body">
      <!-- 星期标题 -->
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>
      
      <!-- 日期网格 -->
      <div class="days-grid">
        <button
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="[
            'day-cell',
            {
              'other-month': day.isOtherMonth,
              'today': day.isToday,
              'selected': isSelected(day.date),
              'in-range': isInRange(day.date),
              'range-start': isRangeStart(day.date),
              'range-end': isRangeEnd(day.date),
              'disabled': day.disabled
            }
          ]"
          :disabled="day.disabled"
          @click="selectDate(day.date)"
          @mouseenter="handleDayHover(day.date)"
        >
          {{ day.day }}
        </button>
      </div>
    </div>
    
    <!-- 时间选择器 -->
    <div v-if="showTime && !showYearPicker && !showMonthPicker" class="time-picker">
      <div class="time-input">
        <input 
          type="number" 
          v-model.number="selectedHour" 
          min="0" 
          max="23"
          @change="updateTime"
        />
        <span>:</span>
        <input 
          type="number" 
          v-model.number="selectedMinute" 
          min="0" 
          max="59"
          @change="updateTime"
        />
        <span v-if="showSeconds">:</span>
        <input 
          v-if="showSeconds"
          type="number" 
          v-model.number="selectedSecond" 
          min="0" 
          max="59"
          @change="updateTime"
        />
      </div>
    </div>
    
    <!-- 快捷选项 -->
    <div v-if="shortcuts && shortcuts.length > 0" class="shortcuts">
      <button 
        v-for="shortcut in shortcuts" 
        :key="shortcut.label"
        class="shortcut-btn"
        @click="applyShortcut(shortcut)"
      >
        {{ shortcut.label }}
      </button>
    </div>
    
    <!-- 底部操作 -->
    <div v-if="showFooter" class="calendar-footer">
      <button class="btn btn-text" @click="selectToday">今天</button>
      <button class="btn btn-text" @click="clear">清除</button>
      <button v-if="range" class="btn btn-primary" @click="confirm">确定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
interface DateShortcut {
  label: string
  value: Date | [Date, Date]
}

// Props
interface Props {
  modelValue?: Date | [Date | null, Date | null] | null
  range?: boolean
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[] | ((date: Date) => boolean)
  showTime?: boolean
  showSeconds?: boolean
  showFooter?: boolean
  shortcuts?: DateShortcut[]
  weekStart?: 0 | 1  // 0 = 周日, 1 = 周一
}

const props = withDefaults(defineProps<Props>(), {
  range: false,
  showTime: false,
  showSeconds: false,
  showFooter: true,
  weekStart: 1
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: Date | [Date | null, Date | null] | null]
  'select': [date: Date]
  'range-select': [range: [Date, Date]]
}>()

// Constants
const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const weekdaysSun = ['日', '一', '二', '三', '四', '五', '六']
const weekdaysMon = ['一', '二', '三', '四', '五', '六', '日']

// State
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const showYearPicker = ref(false)
const showMonthPicker = ref(false)
const yearRange = ref(Math.floor(new Date().getFullYear() / 12) * 12)

const selectedDate = ref<Date | null>(null)
const rangeStart = ref<Date | null>(null)
const rangeEnd = ref<Date | null>(null)
const hoverDate = ref<Date | null>(null)

const selectedHour = ref(0)
const selectedMinute = ref(0)
const selectedSecond = ref(0)

// Computed
const weekdays = computed(() => props.weekStart === 0 ? weekdaysSun : weekdaysMon)

const yearOptions = computed(() => {
  const years: number[] = []
  for (let i = 0; i < 12; i++) {
    years.push(yearRange.value + i)
  }
  return years
})

const calendarDays = computed(() => {
  const days: Array<{
    day: number
    date: Date
    isOtherMonth: boolean
    isToday: boolean
    disabled: boolean
  }> = []
  
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  
  // 调整第一天是周几
  let startWeekday = firstDay.getDay()
  if (props.weekStart === 1) {
    startWeekday = startWeekday === 0 ? 6 : startWeekday - 1
  }
  
  // 上个月的天数
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  
  // 填充上个月的日期
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(currentYear.value, currentMonth.value - 1, day)
    days.push({
      day,
      date,
      isOtherMonth: true,
      isToday: false,
      disabled: isDateDisabled(date)
    })
  }
  
  // 本月日期
  const today = new Date()
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear.value, currentMonth.value, day)
    const isToday = 
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    
    days.push({
      day,
      date,
      isOtherMonth: false,
      isToday,
      disabled: isDateDisabled(date)
    })
  }
  
  // 填充下个月的日期
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, day)
    days.push({
      day,
      date,
      isOtherMonth: true,
      isToday: false,
      disabled: isDateDisabled(date)
    })
  }
  
  return days
})

// Methods
function isDateDisabled(date: Date): boolean {
  if (props.minDate && date < props.minDate) return true
  if (props.maxDate && date > props.maxDate) return true
  
  if (props.disabledDates) {
    if (typeof props.disabledDates === 'function') {
      return props.disabledDates(date)
    }
    return props.disabledDates.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    )
  }
  
  return false
}

function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function isSelected(date: Date): boolean {
  if (props.range) {
    return isSameDay(date, rangeStart.value) || isSameDay(date, rangeEnd.value)
  }
  return isSameDay(date, selectedDate.value)
}

function isInRange(date: Date): boolean {
  if (!props.range) return false
  
  const start = rangeStart.value
  const end = rangeEnd.value || hoverDate.value
  
  if (!start || !end) return false
  
  const time = date.getTime()
  const startTime = Math.min(start.getTime(), end.getTime())
  const endTime = Math.max(start.getTime(), end.getTime())
  
  return time > startTime && time < endTime
}

function isRangeStart(date: Date): boolean {
  if (!props.range || !rangeStart.value) return false
  return isSameDay(date, rangeStart.value)
}

function isRangeEnd(date: Date): boolean {
  if (!props.range) return false
  const end = rangeEnd.value || hoverDate.value
  return isSameDay(date, end)
}

function selectDate(date: Date) {
  if (props.range) {
    if (!rangeStart.value || (rangeStart.value && rangeEnd.value)) {
      rangeStart.value = date
      rangeEnd.value = null
    } else {
      if (date < rangeStart.value) {
        rangeEnd.value = rangeStart.value
        rangeStart.value = date
      } else {
        rangeEnd.value = date
      }
      emit('range-select', [rangeStart.value, rangeEnd.value])
    }
  } else {
    selectedDate.value = date
    emit('select', date)
    emit('update:modelValue', date)
  }
}

function handleDayHover(date: Date) {
  if (props.range && rangeStart.value && !rangeEnd.value) {
    hoverDate.value = date
  }
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function toggleYearPicker() {
  showYearPicker.value = !showYearPicker.value
  showMonthPicker.value = false
}

function toggleMonthPicker() {
  showMonthPicker.value = !showMonthPicker.value
  showYearPicker.value = false
}

function selectYear(year: number) {
  currentYear.value = year
  showYearPicker.value = false
}

function selectMonth(month: number) {
  currentMonth.value = month
  showMonthPicker.value = false
}

function selectToday() {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
  
  if (!props.range) {
    selectDate(today)
  }
}

function clear() {
  selectedDate.value = null
  rangeStart.value = null
  rangeEnd.value = null
  emit('update:modelValue', null)
}

function confirm() {
  if (props.range && rangeStart.value && rangeEnd.value) {
    emit('update:modelValue', [rangeStart.value, rangeEnd.value])
  }
}

function updateTime() {
  if (selectedDate.value) {
    const newDate = new Date(selectedDate.value)
    newDate.setHours(selectedHour.value, selectedMinute.value, selectedSecond.value)
    selectedDate.value = newDate
    emit('update:modelValue', newDate)
  }
}

function applyShortcut(shortcut: DateShortcut) {
  if (Array.isArray(shortcut.value)) {
    rangeStart.value = shortcut.value[0]
    rangeEnd.value = shortcut.value[1]
    emit('update:modelValue', [shortcut.value[0], shortcut.value[1]])
  } else {
    selectDate(shortcut.value)
  }
}

// Initialize
watch(() => props.modelValue, (value) => {
  if (value) {
    if (Array.isArray(value)) {
      rangeStart.value = value[0]
      rangeEnd.value = value[1]
      if (value[0]) {
        currentYear.value = value[0].getFullYear()
        currentMonth.value = value[0].getMonth()
      }
    } else {
      selectedDate.value = value
      currentYear.value = value.getFullYear()
      currentMonth.value = value.getMonth()
      selectedHour.value = value.getHours()
      selectedMinute.value = value.getMinutes()
      selectedSecond.value = value.getSeconds()
    }
  }
}, { immediate: true })
</script>

<style scoped>
.calendar-picker {
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px;
  user-select: none;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 4px;
}

.year-month-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.year-month-btn:hover {
  background: #f5f5f5;
}

/* 年份选择器 */
.year-picker,
.month-picker {
  padding: 8px 0;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
}

.picker-header button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #666;
  cursor: pointer;
}

.picker-header button:hover {
  background: #f5f5f5;
}

.year-grid,
.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.year-item,
.month-item {
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.year-item:hover,
.month-item:hover {
  background: #f5f5f5;
}

.year-item.active,
.month-item.active {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

/* 星期标题 */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

/* 日期网格 */
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  position: relative;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.day-cell:hover:not(:disabled) {
  background: #f5f5f5;
}

.day-cell.other-month {
  color: #ccc;
}

.day-cell.today {
  font-weight: 600;
  color: var(--primary-color, #4B6EF5);
}

.day-cell.selected {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.day-cell.in-range {
  background: rgba(75, 110, 245, 0.1);
  border-radius: 0;
}

.day-cell.range-start {
  border-radius: 6px 0 0 6px;
}

.day-cell.range-end {
  border-radius: 0 6px 6px 0;
}

.day-cell.disabled {
  color: #ccc;
  cursor: not-allowed;
}

/* 时间选择器 */
.time-picker {
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
}

.time-input {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.time-input input {
  width: 40px;
  padding: 6px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.time-input input:focus {
  outline: none;
  border-color: var(--primary-color, #4B6EF5);
}

.time-input span {
  color: #666;
}

/* 快捷选项 */
.shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
}

.shortcut-btn {
  padding: 4px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.shortcut-btn:hover {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

/* 底部操作 */
.calendar-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-text {
  background: transparent;
  color: #666;
}

.btn-text:hover {
  color: var(--primary-color, #4B6EF5);
}

.btn-primary {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
