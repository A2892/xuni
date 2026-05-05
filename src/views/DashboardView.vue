<template>
  <div class="dashboard-view">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1>
            <IconLib name="dashboard" :size="32" />
            数据统计仪表盘
          </h1>
          <p class="subtitle">实时监控您的文档使用情况和数据分析，助力高效工作</p>
        </div>
        <div class="welcome-actions">
          <button class="btn-primary" @click="refreshStats">
            <IconLib name="refresh" :size="18" />
            刷新数据
          </button>
          <button class="btn-secondary" @click="exportAllData">
            <IconLib name="download" :size="18" />
            导出报告
          </button>
        </div>
      </div>
      <div class="welcome-decoration"></div>
    </div>

    <!-- 统计卡片网格 -->
    <div class="stats-grid">
      <div class="stat-card stat-card--primary">
        <div class="stat-card__icon">
          <IconLib name="file-text" :size="28" />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">
            <span class="number">{{ animatedTotal }}</span>
          </div>
          <div class="stat-card__label">总文档数</div>
          <div class="stat-card__trend trend-up">
            <IconLib name="trending-up" :size="14" />
            <span>+{{ stats.recentActivity.lastDay }} 今日</span>
          </div>
        </div>
        <div class="stat-card__bg"></div>
      </div>
      
      <div class="stat-card stat-card--success">
        <div class="stat-card__icon">
          <IconLib name="calendar" :size="28" />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">
            <span class="number">{{ animatedWeek }}</span>
          </div>
          <div class="stat-card__label">本周活跃</div>
          <div class="stat-card__trend">
            <IconLib name="clock" :size="14" />
            <span>近7天数据</span>
          </div>
        </div>
        <div class="stat-card__bg"></div>
      </div>
      
      <div class="stat-card stat-card--warning">
        <div class="stat-card__icon">
          <IconLib name="folder" :size="28" />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">
            <span class="number">{{ Object.keys(stats.byType).length }}</span>
          </div>
          <div class="stat-card__label">文档类型</div>
          <div class="stat-card__trend">
            <IconLib name="layout" :size="14" />
            <span>多样化管理</span>
          </div>
        </div>
        <div class="stat-card__bg"></div>
      </div>
      
      <div class="stat-card stat-card--info">
        <div class="stat-card__icon">
          <IconLib name="bar-chart" :size="28" />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">
            <span class="number">{{ animatedMonth }}</span>
          </div>
          <div class="stat-card__label">本月生成</div>
          <div class="stat-card__trend trend-up">
            <IconLib name="trending-up" :size="14" />
            <span>效率提升</span>
          </div>
        </div>
        <div class="stat-card__bg"></div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content-grid">
      <!-- 文档类型分布 -->
      <div class="panel chart-panel">
        <div class="panel__header">
          <h2>
            <IconLib name="pie-chart" :size="20" />
            文档类型分布
          </h2>
          <div class="panel__actions">
            <button class="icon-btn" title="更多选项">
              <IconLib name="more-horizontal" :size="18" />
            </button>
          </div>
        </div>
        <div class="panel__body">
          <div class="chart-container" v-if="Object.keys(stats.byType).length > 0">
            <!-- 环形图 -->
            <div class="donut-chart">
              <svg viewBox="0 0 200 200" class="donut-svg">
                <circle 
                  v-for="(segment, index) in chartSegments" 
                  :key="index"
                  class="donut-segment"
                  cx="100" 
                  cy="100" 
                  r="80"
                  :stroke="segment.color"
                  :stroke-dasharray="segment.dashArray"
                  :stroke-dashoffset="segment.offset"
                  fill="none"
                  stroke-width="24"
                  :style="{ animationDelay: `${index * 0.1}s` }"
                />
              </svg>
              <div class="donut-center">
                <div class="donut-total">{{ stats.totalDocuments }}</div>
                <div class="donut-label">总计</div>
              </div>
            </div>
            <!-- 图例 -->
            <div class="chart-legend">
              <div 
                v-for="(count, type) in stats.byType" 
                :key="type"
                class="legend-item"
              >
                <span class="legend-color" :style="{ background: getTypeColor(type) }"></span>
                <span class="legend-label">{{ getTypeLabel(type) }}</span>
                <span class="legend-value">{{ count }}</span>
                <span class="legend-percent">{{ getPercent(count) }}%</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <IconLib name="folder-open" :size="48" color="#D1D5DB" />
            <p>暂无文档数据</p>
            <button class="btn-link" @click="$router.push('/')">创建第一个文档</button>
          </div>
        </div>
      </div>

      <!-- 最近活动时间线 -->
      <div class="panel activity-panel">
        <div class="panel__header">
          <h2>
            <IconLib name="clock" :size="20" />
            近期活动
          </h2>
          <span class="badge">近7天</span>
        </div>
        <div class="panel__body">
          <div class="activity-timeline" v-if="Object.keys(recentDates).length > 0">
            <div 
              v-for="(count, date, index) in recentDates" 
              :key="date"
              class="timeline-item"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="timeline-marker">
                <div class="marker-dot" :class="{ 'marker-dot--active': index === 0 }"></div>
                <div class="marker-line" v-if="index < Object.keys(recentDates).length - 1"></div>
              </div>
              <div class="timeline-content">
                <div class="timeline-date">{{ formatDateFull(date) }}</div>
                <div class="timeline-stats">
                  <span class="timeline-count">{{ count }}</span>
                  <span class="timeline-label">份文档</span>
                </div>
                <div class="timeline-bar">
                  <div 
                    class="timeline-bar-fill" 
                    :style="{ width: getActivityBarWidth(count) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <IconLib name="calendar" :size="48" color="#D1D5DB" />
            <p>暂无活动记录</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作区域 -->
    <div class="panel quick-actions-panel">
      <div class="panel__header">
        <h2>
          <IconLib name="zap" :size="20" />
          快速操作
        </h2>
      </div>
      <div class="panel__body">
        <div class="quick-actions-grid">
          <button class="quick-action-card" @click="$router.push('/')">
            <div class="action-icon action-icon--primary">
              <IconLib name="id-card" :size="24" />
            </div>
            <div class="action-info">
              <span class="action-title">学生证</span>
              <span class="action-desc">创建虚拟学生证件</span>
            </div>
            <IconLib name="arrow-right" :size="18" class="action-arrow" />
          </button>
          
          <button class="quick-action-card" @click="$router.push('/transcript')">
            <div class="action-icon action-icon--success">
              <IconLib name="transcript" :size="24" />
            </div>
            <div class="action-info">
              <span class="action-title">成绩单</span>
              <span class="action-desc">生成学业成绩报告</span>
            </div>
            <IconLib name="arrow-right" :size="18" class="action-arrow" />
          </button>
          
          <button class="quick-action-card" @click="$router.push('/bank-statement')">
            <div class="action-icon action-icon--warning">
              <IconLib name="bank" :size="24" />
            </div>
            <div class="action-info">
              <span class="action-title">银行对账单</span>
              <span class="action-desc">创建财务流水记录</span>
            </div>
            <IconLib name="arrow-right" :size="18" class="action-arrow" />
          </button>
          
          <button class="quick-action-card" @click="$router.push('/invoice')">
            <div class="action-icon action-icon--info">
              <IconLib name="invoice" :size="24" />
            </div>
            <div class="action-info">
              <span class="action-title">发票</span>
              <span class="action-desc">生成电子发票凭证</span>
            </div>
            <IconLib name="arrow-right" :size="18" class="action-arrow" />
          </button>
          
          <button class="quick-action-card" @click="$router.push('/certificate')">
            <div class="action-icon action-icon--purple">
              <IconLib name="certificate" :size="24" />
            </div>
            <div class="action-info">
              <span class="action-title">证书</span>
              <span class="action-desc">制作专业资质证书</span>
            </div>
            <IconLib name="arrow-right" :size="18" class="action-arrow" />
          </button>
          
          <button class="quick-action-card" @click="$router.push('/flight')">
            <div class="action-icon action-icon--cyan">
              <IconLib name="plane" :size="24" />
            </div>
            <div class="action-info">
              <span class="action-title">机票</span>
              <span class="action-desc">创建航班行程单</span>
            </div>
            <IconLib name="arrow-right" :size="18" class="action-arrow" />
          </button>
        </div>
      </div>
    </div>

    <!-- 数据洞察区域 -->
    <div class="insights-grid">
      <div class="insight-card insight-card--gradient">
        <div class="insight-icon">
          <IconLib name="trending-up" :size="24" />
        </div>
        <div class="insight-content">
          <div class="insight-title">使用趋势</div>
          <div class="insight-text">{{ getTrendInsight() }}</div>
        </div>
      </div>
      
      <div class="insight-card insight-card--gradient-2">
        <div class="insight-icon">
          <IconLib name="star" :size="24" />
        </div>
        <div class="insight-content">
          <div class="insight-title">最常用文档</div>
          <div class="insight-text">{{ getMostUsedType() }}</div>
        </div>
      </div>
      
      <div class="insight-card insight-card--gradient-3">
        <div class="insight-icon">
          <IconLib name="info" :size="24" />
        </div>
        <div class="insight-content">
          <div class="insight-title">智能建议</div>
          <div class="insight-text">{{ getSuggestion() }}</div>
        </div>
      </div>
    </div>

    <!-- 系统状态 -->
    <div class="panel system-status-panel">
      <div class="panel__header">
        <h2>
          <IconLib name="shield-check" :size="20" />
          系统状态
        </h2>
        <span class="status-badge status-badge--online">
          <span class="status-dot"></span>
          运行正常
        </span>
      </div>
      <div class="panel__body">
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">存储空间</div>
            <div class="status-bar">
              <div class="status-bar-fill" style="width: 35%"></div>
            </div>
            <div class="status-value">35% 已使用</div>
          </div>
          <div class="status-item">
            <div class="status-label">API 调用</div>
            <div class="status-bar">
              <div class="status-bar-fill status-bar-fill--success" style="width: 68%"></div>
            </div>
            <div class="status-value">68% 本月配额</div>
          </div>
          <div class="status-item">
            <div class="status-label">数据备份</div>
            <div class="status-bar">
              <div class="status-bar-fill status-bar-fill--info" style="width: 100%"></div>
            </div>
            <div class="status-value">已同步</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSavedDocuments } from '@/utils/dataService'
import { calculateStats, type DataStats } from '@/utils/exportHelper'
import { exportDocuments } from '@/utils/exportHelper'
import IconLib from '@/components/icons/IconLibrary.vue'

const router = useRouter()

const stats = ref<DataStats>({
  totalDocuments: 0,
  byType: {},
  byDate: {},
  recentActivity: { lastDay: 0, lastWeek: 0, lastMonth: 0 }
})

const documents = ref<any[]>([])
const loading = ref(true)

// 动画数字
const animatedTotal = ref(0)
const animatedWeek = ref(0)
const animatedMonth = ref(0)

// 文档类型标签映射
const typeLabels: Record<string, string> = {
  transcript: '成绩单',
  admission: '录取通知书',
  schedule: '课程表',
  enrollment: '在读证明',
  student_id: '学生证',
  driver: '驾驶证',
  'student-record': '学生档案',
  academic_report: '学业报告',
  bank_statement: '银行对账单',
  invoice: '发票',
  certificate: '证书',
  utility_bill: '账单',
  flight: '机票',
  hotel: '酒店',
  passport: '护照',
  payslip: '工资单',
  resume: '简历',
  medical_report: '医疗报告',
  tax_form: '税务表单',
  wechat: '微信',
  qq: 'QQ',
  business_card: '名片',
  official_seal: '公章',
  stock_statement: '股票持仓',
  fund_statement: '基金持仓',
  insurance: '保险',
  loan_statement: '贷款',
  wealth_report: '净值报告',
  budget_report: '预算报告',
  credit_card: '信用卡',
  income_certificate: '收入证明',
  expense_report: '支出报告',
  crypto_portfolio: '加密货币'
}

// 类型颜色映射 - 使用更专业的色彩体系
const typeColors: Record<string, string> = {
  transcript: '#6366F1',
  admission: '#8B5CF6',
  schedule: '#EC4899',
  enrollment: '#14B8A6',
  student_id: '#3B82F6',
  bank_statement: '#10B981',
  invoice: '#F59E0B',
  certificate: '#EF4444',
  utility_bill: '#6B7280',
  flight: '#0EA5E9',
  hotel: '#8B5CF6',
  passport: '#1D4ED8',
  default: '#64748B'
}

const getTypeLabel = (type: string) => typeLabels[type] || type
const getTypeColor = (type: string) => typeColors[type] || typeColors.default

const maxCount = computed(() => Math.max(...Object.values(stats.value.byType), 1))
const getBarWidth = (count: number) => (count / maxCount.value) * 100

// 计算百分比
const getPercent = (count: number) => {
  if (stats.value.totalDocuments === 0) return 0
  return Math.round((count / stats.value.totalDocuments) * 100)
}

// 图表数据计算
const chartSegments = computed(() => {
  const entries = Object.entries(stats.value.byType)
  if (entries.length === 0) return []
  
  const total = entries.reduce((sum, [_, count]) => sum + count, 0)
  const circumference = 2 * Math.PI * 80 // r = 80
  let accumulatedOffset = 0
  
  return entries.map(([type, count], index) => {
    const percentage = count / total
    const dashLength = circumference * percentage
    const gapLength = circumference - dashLength
    const offset = -accumulatedOffset + circumference / 4 // 从顶部开始
    
    accumulatedOffset += dashLength
    
    return {
      type,
      count,
      percentage,
      color: getTypeColor(type),
      dashArray: `${dashLength} ${gapLength}`,
      offset
    }
  })
})

// 最大活动数（用于计算进度条宽度）
const maxActivityCount = computed(() => {
  const counts = Object.values(stats.value.byDate)
  return Math.max(...counts, 1)
})

const getActivityBarWidth = (count: number) => {
  return (count / maxActivityCount.value) * 100
}

const recentDates = computed(() => {
  const sorted = Object.entries(stats.value.byDate)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7)
  return Object.fromEntries(sorted)
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const formatDateFull = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })
}

// 数字动画函数
function animateNumber(from: number, to: number, duration: number, callback: (val: number) => void) {
  const startTime = performance.now()
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用 easeOutQuart 缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 4)
    const current = Math.round(from + (to - from) * easeProgress)
    
    callback(current)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  requestAnimationFrame(animate)
}

// 监听统计数据变化，触发动画
watch(() => stats.value.totalDocuments, (newVal) => {
  animateNumber(0, newVal, 800, (val) => { animatedTotal.value = val })
})

watch(() => stats.value.recentActivity.lastWeek, (newVal) => {
  animateNumber(0, newVal, 800, (val) => { animatedWeek.value = val })
})

watch(() => stats.value.recentActivity.lastMonth, (newVal) => {
  animateNumber(0, newVal, 800, (val) => { animatedMonth.value = val })
})

const getTrendInsight = () => {
  const { lastDay, lastWeek, lastMonth } = stats.value.recentActivity
  if (lastDay > 5) return '今日活跃度很高！继续保持！'
  if (lastWeek > 20) return '本周生成了大量文档，效率很高！'
  if (lastMonth > 50) return '本月文档生成量达到新高！'
  return '开始创建更多文档吧！'
}

const getMostUsedType = () => {
  const entries = Object.entries(stats.value.byType)
  if (entries.length === 0) return '暂无数据'
  const sorted = entries.sort((a, b) => b[1] - a[1])
  const [type, count] = sorted[0]
  return `${getTypeLabel(type)} (${count}次)`
}

const getSuggestion = () => {
  if (stats.value.totalDocuments === 0) {
    return '开始创建您的第一个文档吧！'
  }
  if (Object.keys(stats.value.byType).length < 3) {
    return '尝试探索更多文档类型，丰富您的使用体验'
  }
  return '您已经是资深用户了！可以尝试使用模板功能提高效率'
}

const loadStats = async () => {
  loading.value = true
  try {
    const result = await getSavedDocuments()
    if (result.success) {
      documents.value = result.data
      stats.value = calculateStats(result.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

const exportAllData = () => {
  if (documents.value.length === 0) {
    alert('暂无数据可导出')
    return
  }
  exportDocuments(documents.value, { format: 'json', includeMetadata: true })
}

const refreshStats = () => {
  loadStats()
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard-view {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

/* ============ 欢迎横幅 ============ */
.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, #4B6EF5 0%, #6C5CE7 50%, #8B5CF6 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 28px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(75, 110, 245, 0.3);
}

.welcome-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.welcome-text h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.welcome-text .subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  margin: 0;
}

.welcome-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #4B6EF5;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.welcome-decoration {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

/* ============ 统计卡片 ============ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.stat-card__icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  flex-shrink: 0;
}

.stat-card--primary .stat-card__icon {
  background: linear-gradient(135deg, #4B6EF5 0%, #6C5CE7 100%);
  color: white;
}

.stat-card--success .stat-card__icon {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
}

.stat-card--warning .stat-card__icon {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
}

.stat-card--info .stat-card__icon {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: white;
}

.stat-card__content {
  flex: 1;
  min-width: 0;
}

.stat-card__value {
  margin-bottom: 4px;
}

.stat-card__value .number {
  font-size: 32px;
  font-weight: 700;
  color: #1F2937;
  line-height: 1;
}

.stat-card__label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
}

.stat-card__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6B7280;
}

.stat-card__trend.trend-up {
  color: #10B981;
}

.stat-card__bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.05;
  transform: translate(30%, -30%);
}

.stat-card--primary .stat-card__bg {
  background: #4B6EF5;
}

.stat-card--success .stat-card__bg {
  background: #10B981;
}

.stat-card--warning .stat-card__bg {
  background: #F59E0B;
}

.stat-card--info .stat-card__bg {
  background: #3B82F6;
}

/* ============ 面板通用样式 ============ */
.panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #F3F4F6;
}

.panel__header h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.panel__actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  border: none;
  border-radius: 8px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #F3F4F6;
  color: #374151;
}

.badge {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  background: #F3F4F6;
  border-radius: 20px;
}

.panel__body {
  padding: 24px;
}

/* ============ 主内容网格 ============ */
.main-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 28px;
}

/* ============ 图表面板 ============ */
.chart-container {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

.donut-chart {
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-segment {
  animation: donutAppear 0.8s ease-out forwards;
  opacity: 0;
}

@keyframes donutAppear {
  to {
    opacity: 1;
  }
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-total {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
}

.donut-label {
  font-size: 13px;
  color: #6B7280;
}

.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #F9FAFB;
  border-radius: 8px;
  transition: background 0.2s;
}

.legend-item:hover {
  background: #F3F4F6;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 13px;
  color: #374151;
}

.legend-value {
  font-size: 13px;
  font-weight: 600;
  color: #1F2937;
}

.legend-percent {
  font-size: 12px;
  color: #6B7280;
  width: 40px;
  text-align: right;
}

/* ============ 活动时间线 ============ */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 16px;
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
}

.marker-dot {
  width: 12px;
  height: 12px;
  background: #E5E7EB;
  border-radius: 50%;
  flex-shrink: 0;
}

.marker-dot--active {
  background: linear-gradient(135deg, #4B6EF5 0%, #6C5CE7 100%);
  box-shadow: 0 0 0 4px rgba(75, 110, 245, 0.2);
}

.marker-line {
  width: 2px;
  flex: 1;
  background: #E5E7EB;
  min-height: 30px;
}

.timeline-content {
  flex: 1;
  padding-bottom: 20px;
}

.timeline-date {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.timeline-stats {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.timeline-count {
  font-size: 20px;
  font-weight: 700;
  color: #4B6EF5;
}

.timeline-label {
  font-size: 13px;
  color: #6B7280;
}

.timeline-bar {
  height: 6px;
  background: #F3F4F6;
  border-radius: 3px;
  overflow: hidden;
}

.timeline-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4B6EF5 0%, #6C5CE7 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* ============ 快速操作 ============ */
.quick-actions-panel {
  margin-bottom: 28px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.quick-action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #F9FAFB;
  border: 1px solid #F3F4F6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.quick-action-card:hover {
  background: white;
  border-color: #E5E7EB;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.action-icon--primary {
  background: linear-gradient(135deg, rgba(75, 110, 245, 0.1) 0%, rgba(108, 92, 231, 0.1) 100%);
  color: #4B6EF5;
}

.action-icon--success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  color: #10B981;
}

.action-icon--warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
  color: #F59E0B;
}

.action-icon--info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  color: #3B82F6;
}

.action-icon--purple {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  color: #8B5CF6;
}

.action-icon--cyan {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(2, 132, 199, 0.1) 100%);
  color: #0EA5E9;
}

.action-info {
  flex: 1;
  min-width: 0;
}

.action-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 2px;
}

.action-desc {
  display: block;
  font-size: 13px;
  color: #6B7280;
}

.action-arrow {
  color: #9CA3AF;
  transition: transform 0.2s, color 0.2s;
}

.quick-action-card:hover .action-arrow {
  color: #4B6EF5;
  transform: translateX(4px);
}

/* ============ 数据洞察 ============ */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.insight-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  color: white;
}

.insight-card--gradient {
  background: linear-gradient(135deg, #4B6EF5 0%, #6C5CE7 100%);
}

.insight-card--gradient-2 {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.insight-card--gradient-3 {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.insight-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 4px;
}

.insight-text {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
}

/* ============ 系统状态 ============ */
.system-status-panel .panel__header {
  border-bottom: none;
  padding-bottom: 8px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
}

.status-badge--online {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10B981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-label {
  font-size: 13px;
  color: #6B7280;
}

.status-bar {
  height: 8px;
  background: #F3F4F6;
  border-radius: 4px;
  overflow: hidden;
}

.status-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4B6EF5 0%, #6C5CE7 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.status-bar-fill--success {
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
}

.status-bar-fill--info {
  background: linear-gradient(90deg, #3B82F6 0%, #2563EB 100%);
}

.status-value {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* ============ 空状态 ============ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-state p {
  margin: 12px 0 16px;
  font-size: 14px;
  color: #6B7280;
}

.btn-link {
  color: #4B6EF5;
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.btn-link:hover {
  color: #3B5BD9;
}

/* ============ 响应式 ============ */
@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    flex-direction: column;
    align-items: center;
  }
  
  .chart-legend {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 16px;
  }
  
  .welcome-banner {
    padding: 24px;
  }
  
  .welcome-text h1 {
    font-size: 22px;
  }
  
  .welcome-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-primary,
  .btn-secondary {
    justify-content: center;
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card__value .number {
    font-size: 24px;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .insights-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
