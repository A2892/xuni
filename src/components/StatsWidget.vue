<template>
  <div class="stats-widget">
    <div class="widget-header" v-if="title">
      <h3>{{ title }}</h3>
      <slot name="actions"></slot>
    </div>

    <div class="stats-grid" :class="[`cols-${columns}`]">
      <div 
        v-for="stat in stats"
        :key="stat.id"
        class="stat-card"
        :class="[`variant-${variant}`, { 'is-clickable': stat.clickable }]"
        @click="stat.clickable && $emit('click', stat)"
      >
        <!-- 图标 -->
        <div 
          class="stat-icon"
          :style="{ backgroundColor: stat.color + '15', color: stat.color }"
          v-if="stat.icon"
        >
          <IconLib :name="stat.icon" :size="24" />
        </div>

        <!-- 内容 -->
        <div class="stat-content">
          <span class="stat-label">{{ stat.label }}</span>
          <div class="stat-value-row">
            <span class="stat-value" :class="{ 'is-loading': loading }">
              <template v-if="!loading">
                {{ formatValue(stat.value, stat.format) }}
              </template>
            </span>
            <span 
              v-if="stat.suffix && !loading"
              class="stat-suffix"
            >
              {{ stat.suffix }}
            </span>
          </div>

          <!-- 趋势 -->
          <div class="stat-trend" v-if="stat.trend !== undefined && !loading">
            <span 
              class="trend-badge"
              :class="getTrendClass(stat.trend, stat.trendReversed)"
            >
              <IconLib 
                :name="stat.trend >= 0 ? 'trending-up' : 'trending-down'" 
                :size="14" 
              />
              {{ Math.abs(stat.trend) }}%
            </span>
            <span class="trend-label">{{ stat.trendLabel || '较上期' }}</span>
          </div>
        </div>

        <!-- 迷你图表 -->
        <div class="stat-chart" v-if="stat.sparkline && !loading">
          <svg :viewBox="`0 0 ${stat.sparkline.length * 10} 40`" preserveAspectRatio="none">
            <polyline
              :points="getSparklinePoints(stat.sparkline)"
              fill="none"
              :stroke="stat.color || 'var(--primary-color)'"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <!-- 进度条 -->
        <div class="stat-progress" v-if="stat.progress !== undefined && !loading">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ 
                width: `${Math.min(stat.progress, 100)}%`,
                backgroundColor: stat.color || 'var(--primary-color)'
              }"
            ></div>
          </div>
          <span class="progress-text">{{ stat.progress }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconLib from './icons/IconLibrary.vue'

interface Stat {
  id: string
  label: string
  value: number | string
  icon?: string
  color?: string
  suffix?: string
  format?: 'number' | 'currency' | 'percent' | 'compact'
  trend?: number
  trendLabel?: string
  trendReversed?: boolean
  sparkline?: number[]
  progress?: number
  clickable?: boolean
}

const props = withDefaults(defineProps<{
  stats: Stat[]
  title?: string
  columns?: 2 | 3 | 4
  variant?: 'default' | 'compact' | 'bordered'
  loading?: boolean
}>(), {
  columns: 4,
  variant: 'default',
  loading: false
})

defineEmits<{
  click: [stat: Stat]
}>()

// 格式化值
const formatValue = (value: number | string, format?: string): string => {
  if (typeof value === 'string') return value
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('zh-CN', { 
        style: 'currency', 
        currency: 'CNY',
        minimumFractionDigits: 0
      }).format(value)
    case 'percent':
      return value + '%'
    case 'compact':
      if (value >= 100000000) {
        return (value / 100000000).toFixed(1) + '亿'
      }
      if (value >= 10000) {
        return (value / 10000).toFixed(1) + '万'
      }
      return formatNumber(value)
    case 'number':
    default:
      return formatNumber(value)
  }
}

// 数字格式化
const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN')
}

// 获取趋势类名
const getTrendClass = (trend: number, reversed?: boolean): string => {
  const isPositive = trend >= 0
  const isGood = reversed ? !isPositive : isPositive
  return isGood ? 'trend-up' : 'trend-down'
}

// 获取迷你图表点
const getSparklinePoints = (data: number[]): string => {
  if (!data || data.length === 0) return ''
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  return data
    .map((value, index) => {
      const x = index * 10
      const y = 40 - ((value - min) / range) * 36 - 2
      return `${x},${y}`
    })
    .join(' ')
}
</script>

<style scoped>
.stats-widget {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
}

/* 头部 */
.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.widget-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

/* 网格布局 */
.stats-grid {
  display: grid;
  gap: 1rem;
}

.stats-grid.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.stats-grid.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.stats-grid.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 1024px) {
  .stats-grid.cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid.cols-3,
  .stats-grid.cols-4 {
    grid-template-columns: 1fr;
  }
}

/* 统计卡片 */
.stat-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  background: var(--bg-color-secondary, #f9fafb);
  transition: all 0.2s ease;
}

.stat-card.is-clickable {
  cursor: pointer;
}

.stat-card.is-clickable:hover {
  background: var(--bg-color-tertiary, #f3f4f6);
}

.stat-card.variant-bordered {
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
}

.stat-card.variant-compact {
  padding: 0.75rem;
  gap: 0.75rem;
}

/* 图标 */
.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-card.variant-compact .stat-icon {
  width: 40px;
  height: 40px;
}

/* 内容 */
.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
  margin-bottom: 0.25rem;
}

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-card.variant-compact .stat-value {
  font-size: 1.25rem;
}

.stat-value.is-loading {
  width: 80px;
  height: 1.5rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.stat-suffix {
  font-size: 0.875rem;
  color: var(--text-color-secondary, #666);
}

/* 趋势 */
.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 4px;
}

.trend-badge.trend-up {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.trend-badge.trend-down {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.trend-label {
  font-size: 0.75rem;
  color: var(--text-color-muted, #9ca3af);
}

/* 迷你图表 */
.stat-chart {
  width: 60px;
  height: 40px;
  flex-shrink: 0;
  align-self: flex-end;
}

.stat-chart svg {
  width: 100%;
  height: 100%;
}

/* 进度条 */
.stat-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--border-color, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-color-secondary, #666);
  min-width: 2.5em;
}

/* 动画 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
