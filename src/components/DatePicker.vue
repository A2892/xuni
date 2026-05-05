<template>
  <div class="date-picker" :class="{ 'is-open': isOpen, 'is-disabled': disabled }">
    <!-- 输入框 -->
    <div class="picker-input" @click="toggle">
      <IconLib name="calendar" :size="18" class="input-icon" />
      <input 
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        readonly
        class="input-field"
      />
      <button 
        v-if="modelValue && clearable" 
        type="button"
        class="clear-btn"
        @click.stop="clear"
      >
        <IconLib name="x" :size="14" />
      </button>
    </div>
    
    <!-- 下拉面板 -->
    <Teleport to="body">
      <transition name="dropdown-fade">
        <div 
          v-if="isOpen"
          ref="panelRef"
          class="picker-panel"
          :style="panelStyle"
        >
          <!-- 头部导航 -->
          <div class="panel-header">
            <button type="button" class="nav-btn" @click="prevMonth">
              <IconLib name="chevron-left" :size="16" />
            </button>
            <div class="header-title">
              <button type="button" class="title-btn" @click="showYearPanel = true">
                {{ viewYear }} 年
              </button>
              <button type="button" class="title-btn" @click="showMonthPanel = true">
                {{ viewMonth + 1 }} 月
              </button>
            </div>
            <button type="button" class="nav-btn" @click="nextMonth">
              <IconLib name="chevron-right" :size="16" />
            </button>
          </div>
          
          <!-- 日期面板 -->
          <div v-if="!showYearPanel && !showMonthPanel" class="date-panel">
            <!-- 星期标题 -->
            <div class="weekdays">
              <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
            </div>
            
            <!-- 日期网格 -->
            <div class="date-grid">
              <button 
                v-for="date in calendarDates" 
                :key="date.key"
                type="button"
                class="date-cell"
                :class="{
                  'is-other-month': !date.isCurrentMonth,
                  'is-today': date.isToday,
                  'is-selected': date.isSelected,
                  'is-disabled': date.isDisabled
                }"
                :disabled="date.isDisabled"
                @click="selectDate(date.date)"
              >
                {{ date.day }}
              </button>
            </div>
          </div>
          
          <!-- 月份面板 -->
          <div v-else-if="showMonthPanel" class="month-panel">
            <button 
              v-for="(month, index) in months" 
              :key="month"
              type="button"
              class="month-cell"
              :class="{ 'is-selected': index === viewMonth }"
              @click="selectMonth(index)"
            >
              {{ month }}
            </button>
          </div>
          
          <!-- 年份面板 -->
          <div v-else-if="showYearPanel" class="year-panel">
            <div class="year-nav">
              <button type="button" class="nav-btn" @click="yearRangeStart -= 12">
                <IconLib name="chevrons-left" :size="16" />
              </button>
              <span class="year-range">{{ yearRangeStart }} - {{ yearRangeStart + 11 }}</span>
              <button type="button" class="nav-btn" @click="yearRangeStart += 12">
                <IconLib name="chevrons-right" :size="16" />
              </button>
            </div>
            <div class="year-grid">
              <button 
                v-for="year in yearRange" 
                :key="year"
                type="button"
                class="year-cell"
                :class="{ 'is-selected': year === viewYear }"
                @click="selectYear(year)"
              >
                {{ year }}
              </button>
            </div>
          </div>
          
          <!-- 底部 -->
          <div class="panel-footer">
            <button type="button" class="footer-btn" @click="selectToday">今天</button>
            <button type="button" class="footer-btn footer-btn--primary" @click="confirm">确定</button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  modelValue?: string | Date | null
  placeholder?: string
  format?: string
  disabled?: boolean
  clearable?: boolean
  minDate?: string | Date
  maxDate?: string | Date
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '选择日期',
  format: 'YYYY-MM-DD',
  clearable: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  change: [value: string | null]
}>()

const isOpen = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref({})
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())
const showYearPanel = ref(false)
const showMonthPanel = ref(false)
const yearRangeStart = ref(Math.floor(new Date().getFullYear() / 12) * 12)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

// 当前选中日期
const selectedDate = computed(() => {
  if (!props.modelValue) return null
  const d = new Date(props.modelValue)
  return isNaN(d.getTime()) ? null : d
})

// 显示值
const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  return formatDate(selectedDate.value, props.format)
})

// 年份范围
const yearRange = computed(() => {
  const years: number[] = []
  for (let i = 0; i < 12; i++) {
    years.push(yearRangeStart.value + i)
  }
  return years
})

// 日历日期
const calendarDates = computed(() => {
  const dates: any[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0)
  
  // 上月补齐
  const startDay = firstDay.getDay()
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(viewYear.value, viewMonth.value, -i)
    dates.push(createDateCell(date, false, today))
  }
  
  // 当月日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(viewYear.value, viewMonth.value, i)
    dates.push(createDateCell(date, true, today))
  }
  
  // 下月补齐
  const remaining = 42 - dates.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(viewYear.value, viewMonth.value + 1, i)
    dates.push(createDateCell(date, false, today))
  }
  
  return dates
})

const createDateCell = (date: Date, isCurrentMonth: boolean, today: Date) => {
  const isToday = date.getTime() === today.getTime()
  const isSelected = selectedDate.value && date.getTime() === selectedDate.value.setHours(0, 0, 0, 0)
  
  let isDisabled = false
  if (props.minDate) {
    const min = new Date(props.minDate)
    min.setHours(0, 0, 0, 0)
    if (date < min) isDisabled = true
  }
  if (props.maxDate) {
    const max = new Date(props.maxDate)
    max.setHours(23, 59, 59, 999)
    if (date > max) isDisabled = true
  }
  
  return {
    date,
    day: date.getDate(),
    key: date.toISOString(),
    isCurrentMonth,
    isToday,
    isSelected,
    isDisabled
  }
}

// 格式化日期
const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', String(month).padStart(2, '0'))
    .replace('DD', String(day).padStart(2, '0'))
    .replace('M', String(month))
    .replace('D', String(day))
}

// 打开/关闭
const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    updatePanelPosition()
    if (selectedDate.value) {
      viewYear.value = selectedDate.value.getFullYear()
      viewMonth.value = selectedDate.value.getMonth()
    }
  }
}

const close = () => {
  isOpen.value = false
  showYearPanel.value = false
  showMonthPanel.value = false
}

// 更新面板位置
const updatePanelPosition = async () => {
  await nextTick()
  // 简单实现：固定在输入框下方
  panelStyle.value = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10002
  }
}

// 月份导航
const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

// 选择
const selectDate = (date: Date) => {
  const value = formatDate(date, props.format)
  emit('update:modelValue', value)
  emit('change', value)
}

const selectMonth = (month: number) => {
  viewMonth.value = month
  showMonthPanel.value = false
}

const selectYear = (year: number) => {
  viewYear.value = year
  showYearPanel.value = false
}

const selectToday = () => {
  const today = new Date()
  viewYear.value = today.getFullYear()
  viewMonth.value = today.getMonth()
  selectDate(today)
}

const confirm = () => {
  close()
}

const clear = () => {
  emit('update:modelValue', null)
  emit('change', null)
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && panelRef.value && !panelRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.date-picker {
  position: relative;
  display: inline-block;
  width: 200px;
}

.date-picker.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* 输入框 */
.picker-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.picker-input:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.date-picker.is-open .picker-input {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.input-icon {
  color: var(--text-color-muted, #9ca3af);
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-color-primary, #333);
  cursor: pointer;
}

.input-field::placeholder {
  color: var(--text-color-muted, #9ca3af);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background: var(--bg-color-secondary, #f3f4f6);
  border: none;
  border-radius: 50%;
  color: var(--text-color-muted, #9ca3af);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--bg-color-tertiary, #e5e7eb);
  color: var(--text-color-primary, #333);
}

/* 面板 */
.picker-panel {
  width: 280px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
  color: var(--text-color-primary, #333);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-color-primary, #333);
  cursor: pointer;
  transition: all 0.2s ease;
}

.title-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

/* 日期面板 */
.date-panel {
  padding: 0.5rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.25rem;
}

.weekday {
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  color: var(--text-color-muted, #9ca3af);
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.date-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin: auto;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-cell:hover:not(:disabled) {
  background: var(--bg-color-secondary, #f3f4f6);
}

.date-cell.is-other-month {
  color: var(--text-color-muted, #d1d5db);
}

.date-cell.is-today {
  border: 1px solid var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.date-cell.is-selected {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

.date-cell.is-disabled {
  color: var(--text-color-muted, #d1d5db);
  cursor: not-allowed;
}

/* 月份面板 */
.month-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 1rem;
}

.month-cell {
  padding: 0.75rem;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.month-cell:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

.month-cell.is-selected {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

/* 年份面板 */
.year-panel {
  padding: 1rem;
}

.year-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.year-range {
  font-weight: 600;
  color: var(--text-color-primary, #333);
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.year-cell {
  padding: 0.75rem;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.year-cell:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

.year-cell.is-selected {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

/* 底部 */
.panel-footer {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.footer-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-btn:hover {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.footer-btn--primary {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.footer-btn--primary:hover {
  background: var(--primary-color-dark, #3a5ce4);
}

/* 过渡动画 */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}
</style>
