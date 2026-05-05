<template>
  <div class="calendar" :class="{ 'calendar-fullscreen': fullscreen }">
    <!-- Header -->
    <div class="calendar-header">
      <div class="calendar-header-left">
        <button class="calendar-btn" @click="prevYear" title="上一年">
          <IconLib name="chevrons-left" :size="16" />
        </button>
        <button v-if="mode === 'month'" class="calendar-btn" @click="prevMonth" title="上一月">
          <IconLib name="chevron-left" :size="16" />
        </button>
      </div>
      
      <div class="calendar-title">
        <span class="calendar-year" @click="mode = 'year'">{{ currentYear }}年</span>
        <span v-if="mode === 'month'" class="calendar-month" @click="mode = 'month'">
          {{ currentMonth }}月
        </span>
      </div>
      
      <div class="calendar-header-right">
        <button v-if="mode === 'month'" class="calendar-btn" @click="nextMonth" title="下一月">
          <IconLib name="chevron-right" :size="16" />
        </button>
        <button class="calendar-btn" @click="nextYear" title="下一年">
          <IconLib name="chevrons-right" :size="16" />
        </button>
      </div>
      
      <div class="calendar-mode-switch">
        <button
          class="calendar-mode-btn"
          :class="{ active: mode === 'month' }"
          @click="mode = 'month'"
        >
          月
        </button>
        <button
          class="calendar-mode-btn"
          :class="{ active: mode === 'year' }"
          @click="mode = 'year'"
        >
          年
        </button>
      </div>
    </div>
    
    <!-- 月视图 -->
    <div v-if="mode === 'month'" class="calendar-body">
      <div class="calendar-weekdays">
        <div v-for="day in weekDays" :key="day" class="calendar-weekday">
          {{ day }}
        </div>
      </div>
      
      <div class="calendar-dates">
        <div
          v-for="(date, index) in calendarDates"
          :key="index"
          class="calendar-date"
          :class="{
            'calendar-date-other': !date.currentMonth,
            'calendar-date-today': date.isToday,
            'calendar-date-selected': isSelected(date.date)
          }"
          @click="selectDate(date.date)"
        >
          <div class="calendar-date-value">{{ date.day }}</div>
          <div v-if="getCellData(date.date)" class="calendar-date-content">
            <slot name="dateCellRender" :date="date.date">
              {{ getCellData(date.date) }}
            </slot>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 年视图 -->
    <div v-else class="calendar-body calendar-year-body">
      <div
        v-for="month in 12"
        :key="month"
        class="calendar-month-cell"
        :class="{
          'calendar-month-cell-current': month === new Date().getMonth() + 1 && currentYear === new Date().getFullYear(),
          'calendar-month-cell-selected': month === selectedMonth
        }"
        @click="selectMonth(month)"
      >
        {{ month }}月
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  modelValue?: Date
  fullscreen?: boolean
  mode?: 'month' | 'year'
  dateCellRender?: (date: Date) => any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => new Date(),
  fullscreen: false,
  mode: 'month'
})

const emit = defineEmits<{
  'update:modelValue': [date: Date]
  select: [date: Date]
  panelChange: [date: Date, mode: 'month' | 'year']
}>()

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentDate = ref(new Date(props.modelValue))
const mode = ref<'month' | 'year'>(props.mode)
const selectedMonth = ref(currentDate.value.getMonth() + 1)

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

// 日历日期数据
const calendarDates = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value - 1
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const dates: { day: number; date: Date; currentMonth: boolean; isToday: boolean }[] = []
  
  // 上月补齐
  const startDay = firstDay.getDay()
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    dates.push({
      day: date.getDate(),
      date,
      currentMonth: false,
      isToday: false
    })
  }
  
  // 当月
  const today = new Date()
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    dates.push({
      day: i,
      date,
      currentMonth: true,
      isToday: isSameDay(date, today)
    })
  }
  
  // 下月补齐
  const endDay = lastDay.getDay()
  for (let i = 1; i < 7 - endDay; i++) {
    const date = new Date(year, month + 1, i)
    dates.push({
      day: i,
      date,
      currentMonth: false,
      isToday: false
    })
  }
  
  return dates
})

// 判断是否同一天
const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}

// 判断是否选中
const isSelected = (date: Date) => {
  return isSameDay(date, props.modelValue)
}

// 获取单元格数据
const getCellData = (date: Date) => {
  if (props.dateCellRender) {
    return props.dateCellRender(date)
  }
  return null
}

// 导航
const prevYear = () => {
  currentDate.value = new Date(currentYear.value - 1, currentMonth.value - 1, 1)
  emit('panelChange', currentDate.value, mode.value)
}

const nextYear = () => {
  currentDate.value = new Date(currentYear.value + 1, currentMonth.value - 1, 1)
  emit('panelChange', currentDate.value, mode.value)
}

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
  emit('panelChange', currentDate.value, mode.value)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
  emit('panelChange', currentDate.value, mode.value)
}

// 选择日期
const selectDate = (date: Date) => {
  emit('update:modelValue', date)
  emit('select', date)
}

// 选择月份
const selectMonth = (month: number) => {
  selectedMonth.value = month
  currentDate.value = new Date(currentYear.value, month - 1, 1)
  mode.value = 'month'
  emit('panelChange', currentDate.value, 'month')
}

// 监听外部值变化
watch(() => props.modelValue, (val) => {
  currentDate.value = new Date(val)
})
</script>

<style scoped>
.calendar {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  overflow: hidden;
}

.calendar-fullscreen {
  border: none;
}

/* Header */
.calendar-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.calendar-header-left,
.calendar-header-right {
  display: flex;
  gap: 4px;
}

.calendar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.65);
  transition: all 0.2s;
}

.calendar-btn:hover {
  color: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
}

.calendar-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}

.calendar-year,
.calendar-month {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.calendar-year:hover,
.calendar-month:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.calendar-mode-switch {
  display: flex;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.calendar-mode-btn {
  padding: 4px 12px;
  border: none;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  transition: all 0.2s;
}

.calendar-mode-btn:first-child {
  border-right: 1px solid #d9d9d9;
}

.calendar-mode-btn.active {
  background-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

/* Body */
.calendar-body {
  padding: 8px;
}

/* 周 */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.calendar-weekday {
  text-align: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  padding: 8px 0;
}

/* 日期 */
.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-date {
  min-height: 60px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calendar-date:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.calendar-date-value {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
}

.calendar-date-other .calendar-date-value {
  color: rgba(0, 0, 0, 0.25);
}

.calendar-date-today .calendar-date-value {
  color: var(--primary-color, #4B6EF5);
  font-weight: 600;
}

.calendar-date-selected {
  background-color: rgba(75, 110, 245, 0.1);
}

.calendar-date-content {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

/* 年视图 */
.calendar-year-body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
}

.calendar-month-cell {
  padding: 16px;
  text-align: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-month-cell:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.calendar-month-cell-current {
  color: var(--primary-color, #4B6EF5);
  font-weight: 500;
}

.calendar-month-cell-selected {
  background-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

/* 全屏模式 */
.calendar-fullscreen .calendar-date {
  min-height: 100px;
}
</style>
