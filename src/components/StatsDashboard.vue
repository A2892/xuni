<template>
  <div class="stats-dashboard">
    <h3 class="dashboard-title">
      <span class="title-icon">📊</span>
      数据概览
    </h3>

    <div class="stats-grid">
      <!-- 核心数据卡片 -->
      <div 
        v-for="stat in mainStats" 
        :key="stat.label"
        class="stat-card"
        :class="stat.variant"
      >
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-content">
          <div class="stat-value" :class="{ 'trend-up': stat.trend > 0, 'trend-down': stat.trend < 0 }">
            {{ formatValue(stat.value, stat.format) }}
          </div>
          <div class="stat-label">{{ stat.label }}</div>
          <div v-if="stat.trend !== undefined" class="stat-trend" :class="{ positive: stat.trend > 0, negative: stat.trend < 0 }">
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 分类统计 -->
    <div v-if="categoryStats && categoryStats.length > 0" class="category-section">
      <h4 class="section-subtitle">分类统计</h4>
      <div class="category-list">
        <div 
          v-for="(cat, index) in categoryStats" 
          :key="index"
          class="category-item"
        >
          <div class="category-header">
            <span class="category-name">{{ cat.name }}</span>
            <span class="category-value">{{ formatValue(cat.value, cat.format || 'number') }}</span>
          </div>
          <div class="category-bar">
            <div 
              class="category-fill" 
              :style="{ 
                width: `${(cat.value / maxCategoryValue) * 100}%`,
                background: getBarColor(index)
              }"
            ></div>
          </div>
          <div class="category-percent">{{ ((cat.value / totalCategoryValue) * 100).toFixed(1) }}%</div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div v-if="quickActions && quickActions.length > 0" class="quick-actions">
      <button 
        v-for="action in quickActions" 
        :key="action.label"
        class="action-btn"
        @click="$emit('action', action.id)"
      >
        <span class="action-icon">{{ action.icon }}</span>
        {{ action.label }}
      </button>
    </div>

    <!-- 最近活动 -->
    <div v-if="recentActivities && recentActivities.length > 0" class="recent-section">
      <h4 class="section-subtitle">最近活动</h4>
      <div class="activity-list">
        <div 
          v-for="(activity, index) in recentActivities.slice(0, 5)" 
          :key="index"
          class="activity-item"
        >
          <span class="activity-icon">{{ activity.icon }}</span>
          <span class="activity-text">{{ activity.text }}</span>
          <span class="activity-time">{{ activity.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface StatItem {
  icon: string
  label: string
  value: number
  format?: 'number' | 'currency' | 'percent'
  trend?: number
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

interface CategoryItem {
  name: string
  value: number
  format?: 'number' | 'currency'
}

interface QuickAction {
  id: string
  icon: string
  label: string
}

interface Activity {
  icon: string
  text: string
  time: string
}

const props = withDefaults(defineProps<{
  mainStats?: StatItem[]
  categoryStats?: CategoryItem[]
  quickActions?: QuickAction[]
  recentActivities?: Activity[]
  currency?: string
}>(), {
  mainStats: () => [],
  categoryStats: () => [],
  quickActions: () => [],
  recentActivities: () => [],
  currency: 'CNY'
})

defineEmits(['action'])

const maxCategoryValue = computed(() => {
  if (!props.categoryStats || props.categoryStats.length === 0) return 1
  return Math.max(...props.categoryStats.map(c => c.value))
})

const totalCategoryValue = computed(() => {
  if (!props.categoryStats || props.categoryStats.length === 0) return 1
  return props.categoryStats.reduce((sum, c) => sum + c.value, 0)
})

const formatValue = (value: number, format?: string) => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: props.currency
      }).format(value)
    case 'percent':
      return `${value.toFixed(1)}%`
    default:
      return new Intl.NumberFormat('zh-CN').format(value)
  }
}

const barColors = [
  'linear-gradient(90deg, #667eea, #764ba2)',
  'linear-gradient(90deg, #11998e, #38ef7d)',
  'linear-gradient(90deg, #ee0979, #ff6a00)',
  'linear-gradient(90deg, #4facfe, #00f2fe)',
  'linear-gradient(90deg, #fa709a, #fee140)',
  'linear-gradient(90deg, #a8edea, #fed6e3)'
]

const getBarColor = (index: number) => barColors[index % barColors.length]
</script>

<style scoped>
.stats-dashboard {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.title-icon {
  font-size: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
  border-radius: 10px;
  border: 1px solid #eee;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.stat-card.success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  color: white;
}

.stat-card.warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
}

.stat-card.danger {
  background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
  border: none;
  color: white;
}

.stat-icon {
  font-size: 24px;
  opacity: 0.9;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.stat-trend {
  font-size: 11px;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.stat-trend.positive {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.stat-trend.negative {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.stat-card.primary .stat-trend.positive,
.stat-card.success .stat-trend.positive,
.stat-card.warning .stat-trend.positive,
.stat-card.danger .stat-trend.positive {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.section-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.category-section {
  margin-bottom: 20px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  grid-column: 1 / -1;
}

.category-name {
  font-size: 13px;
  color: #333;
}

.category-value {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
}

.category-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.category-percent {
  font-size: 11px;
  color: #999;
  text-align: right;
  min-width: 40px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.action-icon {
  font-size: 14px;
}

.recent-section {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 12px;
}

.activity-icon {
  font-size: 14px;
}

.activity-text {
  flex: 1;
  color: #333;
}

.activity-time {
  color: #999;
  font-size: 11px;
}
</style>
