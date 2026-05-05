<template>
  <div class="bank-report-preview" :class="`size-${previewSize}`" :style="{ '--primary-color': reportTheme.primary, '--secondary-color': reportTheme.secondary }">
    <div class="report-container" style="position:relative;">
      <!-- 水印层（背景/覆盖两层） -->
      <div v-if="showWatermarkLayer" class="watermark-layer-below" :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }">
        <DiagonalWatermark
          v-if="diagEnabled && !diagOverlayFlag"
          :key="'diag-report-'+diagKey"
          :lineWidth="diagWidth"
          :lineSpacing="diagSpacing"
          :color="diagColor"
          :opacity="diagOpacity / 100"
          :rotation="diagRotation"
          :overlay="false"
        />
        <FullScreenWatermark
          v-if="fullEnabled && !fullOverlayFlag"
          :text="bankStore.settings.fullScreenWatermarkText ?? watermark.settings.fullScreenWatermarkText"
          :fontSize="bankStore.settings.fullScreenWatermarkSize ?? watermark.settings.fullScreenWatermarkSize ?? 48"
          :spacing="bankStore.settings.fullScreenWatermarkSpacing ?? watermark.settings.fullScreenWatermarkSpacing ?? bankStore.settings.watermarkSpacingX ?? 200"
          :rotation="bankStore.settings.fullScreenWatermarkAngle ?? bankStore.settings.fullScreenWatermarkRotation ?? watermark.settings.fullScreenWatermarkAngle ?? watermark.settings.fullScreenWatermarkRotation ?? -45"
          :color="bankStore.settings.fullScreenWatermarkColor ?? watermark.settings.fullScreenWatermarkColor ?? '#000000'"
          :opacity="((bankStore.settings.fullScreenWatermarkOpacity ?? watermark.settings.fullScreenWatermarkOpacity) || 8) / 100"
          :fontFamily="bankStore.settings.fullScreenWatermarkFontFamily ?? watermark.settings.fullScreenWatermarkFontFamily ?? 'Times New Roman'"
          :overlay="false"
        />
        <div v-if="textEnabled && !textOverlayFlag" class="single-watermark" :style="textBaseStyle">{{ bankStore.settings.textWatermarkText ?? watermark.settings.textWatermarkText }}</div>
      </div>

      <div v-if="showWatermarkLayer" class="watermark-layer-above" :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 60 }">
        <DiagonalWatermark
          v-if="diagEnabled && diagOverlayFlag"
          :key="'diag-report-overlay-'+diagKey"
          :lineWidth="diagWidth"
          :lineSpacing="diagSpacing"
          :color="diagColor"
          :opacity="diagOpacity / 100"
          :rotation="diagRotation"
          :overlay="true"
        />
        <FullScreenWatermark
          v-if="fullEnabled && fullOverlayFlag"
          :text="bankStore.settings.fullScreenWatermarkText ?? watermark.settings.fullScreenWatermarkText"
          :fontSize="bankStore.settings.fullScreenWatermarkSize ?? watermark.settings.fullScreenWatermarkSize ?? 48"
          :spacing="bankStore.settings.fullScreenWatermarkSpacing ?? watermark.settings.fullScreenWatermarkSpacing ?? bankStore.settings.watermarkSpacingX ?? 200"
          :rotation="bankStore.settings.fullScreenWatermarkAngle ?? bankStore.settings.fullScreenWatermarkRotation ?? watermark.settings.fullScreenWatermarkAngle ?? watermark.settings.fullScreenWatermarkRotation ?? -45"
          :color="bankStore.settings.fullScreenWatermarkColor ?? watermark.settings.fullScreenWatermarkColor ?? '#000000'"
          :opacity="((bankStore.settings.fullScreenWatermarkOpacity ?? watermark.settings.fullScreenWatermarkOpacity) || 8) / 100"
          :fontFamily="bankStore.settings.fullScreenWatermarkFontFamily ?? watermark.settings.fullScreenWatermarkFontFamily ?? 'Times New Roman'"
          :overlay="true"
        />
        <div v-if="textEnabled && textOverlayFlag" class="single-watermark overlay" :style="textOverlayStyle">{{ bankStore.settings.textWatermarkText ?? watermark.settings.textWatermarkText }}</div>
      </div>
      <!-- 报告封面/头部 -->
      <div class="report-header">
        <div class="header-decoration"></div>
        <div class="header-content">
          <h1 class="report-title">{{ displayTitle }}</h1>
          <p class="report-subtitle">{{ bankStore.cardInfo.bank }}</p>
          <div class="report-period-badge">
            <span class="period-text">{{ periodDisplay }}</span>
          </div>
        </div>
        <div class="header-info">
          <div class="info-item">
            <span class="info-label">Account Holder</span>
            <span class="info-value">{{ bankStore.cardInfo.cardHolder }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Account Number</span>
            <span class="info-value">{{ bankStore.cardInfo.cardNumber }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Generated</span>
            <span class="info-value">{{ generatedDate }}</span>
          </div>
        </div>
      </div>

      <!-- 账户详情卡片 -->
      <div class="account-details-section">
        <div class="account-details-card">
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Card Holder</span>
              <span class="detail-value bold">{{ bankStore.cardInfo.cardHolder }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Card Number</span>
              <span class="detail-value bold">{{ bankStore.cardInfo.cardNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Card Type</span>
              <span class="detail-value bold">{{ formatCardType(bankStore.cardInfo.cardType) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Expiry Date</span>
              <span class="detail-value bold">{{ bankStore.cardInfo.expiryDate || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Account Type</span>
              <span class="detail-value bold">{{ bankStore.cardInfo.accountType || 'Checking Account' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="detail-value bold status-active">{{ bankStore.cardInfo.status || 'Active' }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">IBAN</span>
              <span class="detail-value bold">{{ bankStore.cardInfo.iban || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">SWIFT/BIC</span>
              <span class="detail-value bold">{{ bankStore.cardInfo.swift || 'N/A' }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">Billing Address</span>
              <span class="detail-value bold">{{ bankStore.cardInfo.billingAddress || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Income & Expense Summary -->
      <div v-if="reportOptions.showSummary" class="report-section">
        <h2 class="section-title">Financial Overview</h2>
        <div class="summary-cards">
          <div class="summary-card income-card">
            <div class="card-content">
              <div class="card-label">Total Income</div>
              <div class="card-value"><span class="amount">{{ formatCurrency(periodStats.totalIncome) }}</span></div>
              <div class="card-count">{{ periodStats.incomeCount }} transactions</div>
            </div>
          </div>
          <div class="summary-card expense-card">
            <div class="card-content">
              <div class="card-label">Total Expense</div>
              <div class="card-value"><span class="amount">{{ formatCurrency(periodStats.totalExpense) }}</span></div>
              <div class="card-count">{{ periodStats.expenseCount }} transactions</div>
            </div>
          </div>
          <div class="summary-card net-card" :class="{ positive: periodStats.netAmount >= 0 }">
            <div class="card-content">
              <div class="card-label">Net Balance</div>
              <div class="card-value"><span class="sign">{{ periodStats.netAmount >= 0 ? '+' : '-' }}</span><span class="amount">{{ formatCurrency(Math.abs(periodStats.netAmount)) }}</span></div>
              <div class="card-count">{{ periodStats.totalCount }} total</div>
            </div>
          </div>
          <div class="summary-card avg-card">
            <div class="card-content">
              <div class="card-label">Daily Average</div>
              <div class="card-value"><span class="amount">{{ formatCurrency(periodStats.dailyAverage) }}</span></div>
              <div class="card-count">{{ periodStats.dayCount }} days</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend Chart -->
      <div v-if="reportOptions.showTrends" class="report-section">
        <h2 class="section-title">{{ reportType === 'annual' ? 'Monthly Trends' : 'Daily Trends' }}</h2>
        <div class="trend-chart">
          <div class="chart-bars">
            <div 
              v-for="(item, index) in trendData" 
              :key="index" 
              class="chart-bar-group"
            >
              <div class="bar-wrapper">
                <div 
                  class="bar income-bar" 
                  :style="{ height: `${(item.income / maxTrendValue) * 100}%` }"
                  :title="`Income: ${formatCurrency(item.income)}`"
                ></div>
                <div 
                  class="bar expense-bar" 
                  :style="{ height: `${(item.expense / maxTrendValue) * 100}%` }"
                  :title="`Expense: ${formatCurrency(item.expense)}`"
                ></div>
              </div>
              <div class="bar-label">{{ item.label }}</div>
            </div>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-color income"></span>Income</span>
            <span class="legend-item"><span class="legend-color expense"></span>Expense</span>
          </div>
        </div>
      </div>

      <!-- Category Analysis -->
      <div v-if="reportOptions.showCategories" class="report-section">
        <h2 class="section-title">Expense Categories</h2>
        <div class="categories-grid">
          <div class="category-chart">
            <div class="donut-chart">
              <svg viewBox="0 0 100 100">
                <circle 
                  v-for="(cat, index) in categoryData" 
                  :key="cat.category"
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  :stroke="categoryColors[index % categoryColors.length]"
                  stroke-width="20"
                  :stroke-dasharray="`${cat.percentage * 2.51} 251`"
                  :stroke-dashoffset="-categoryOffset(index)"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div class="donut-center">
                <div class="donut-total">{{ formatCurrency(periodStats.totalExpense) }}</div>
                <div class="donut-label">Total Expense</div>
              </div>
            </div>
          </div>
          <div class="category-list">
            <div v-for="(cat, index) in categoryData" :key="cat.category" class="category-item">
              <div class="category-color" :style="{ backgroundColor: categoryColors[index % categoryColors.length] }"></div>
              <div class="category-info">
                <div class="category-name">{{ cat.category }}</div>
                <div class="category-amount">{{ formatCurrency(cat.amount) }}</div>
              </div>
              <div class="category-percentage">{{ cat.percentage.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Merchants -->
      <div v-if="reportOptions.showTopMerchants" class="report-section">
        <h2 class="section-title">Top Merchants</h2>
        <div class="merchants-list">
          <div v-for="(merchant, index) in topMerchants" :key="merchant.name" class="merchant-item">
            <div class="merchant-info">
              <div class="merchant-name">{{ merchant.name }}</div>
              <div class="merchant-category">{{ merchant.category }}</div>
            </div>
            <div class="merchant-stats">
              <div class="merchant-amount">{{ formatCurrency(merchant.amount) }}</div>
              <div class="merchant-count">{{ merchant.count }} txns</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Insights -->
      <div v-if="reportOptions.showInsights" class="report-section">
        <h2 class="section-title">Financial Insights</h2>
        <div class="insights-grid">
          <div class="insight-card">
            <div class="insight-title">Largest Expense</div>
            <div class="insight-value">{{ formatCurrency(insights.largestExpense.amount) }}</div>
            <div class="insight-desc">{{ insights.largestExpense.merchant || '-' }}</div>
          </div>
          <div class="insight-card">
            <div class="insight-title">Largest Income</div>
            <div class="insight-value">{{ formatCurrency(insights.largestIncome.amount) }}</div>
            <div class="insight-desc">{{ insights.largestIncome.merchant || '-' }}</div>
          </div>
          <div class="insight-card">
            <div class="insight-title">Busiest Day</div>
            <div class="insight-value">{{ insights.busiestDay.count }} txns</div>
            <div class="insight-desc">{{ insights.busiestDay.date || 'No data' }}</div>
          </div>
          <div class="insight-card">
            <div class="insight-title">Avg. Transaction</div>
            <div class="insight-value">{{ formatCurrency(insights.averageTransaction) }}</div>
            <div class="insight-desc">All transactions</div>
          </div>
        </div>
      </div>

      <!-- Report Footer -->
      <div class="report-footer">
        <div class="footer-line"></div>
        <p class="footer-text">{{ footerText }}</p>
        <p class="footer-generated">{{ footerGenerated }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBankStore } from '@/stores/bank'
import { useWatermarkStore } from '@/stores/watermark'
import FullScreenWatermark from '@/components/FullScreenWatermark.vue'
import DiagonalWatermark from '@/components/DiagonalWatermark.vue'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
  reportType: 'annual' | 'monthly' | 'custom'
  reportYear: number
  reportMonth: number
  reportStartDate: string
  reportEndDate: string
  reportOptions: {
    showSummary: boolean
    showTrends: boolean
    showCategories: boolean
    showTopMerchants: boolean
    showComparison: boolean
    showInsights: boolean
  }
  reportTitle: string
  reportTheme: {
    primary: string
    secondary: string
  }
  footerText?: string
  footerGenerated?: string
}>(), {
  previewSize: 'original'
})

const bankStore = useBankStore()
const watermark = useWatermarkStore()

const categoryColors = [
  '#48c774', '#8b5cf6', '#4facfe', '#667eea', '#f093fb', '#30cfd0', '#10b981', '#6366f1',
  '#fa709a', '#ef4444', '#ec4899', '#84cc16', '#f59e0b', '#dc2626', '#0891b2', '#3b82f6',
  '#a8edea', '#ffdd57', '#3273dc', '#b5b5b5'
]

// 打印模式
const isPrintMode = ref(false)
const enablePrintMode = () => { isPrintMode.value = true }
const disablePrintMode = () => { isPrintMode.value = false }
defineExpose({ enablePrintMode, disablePrintMode })

// --- 水印支持（仅使用页面级设置，不回退到全局 watermark.store）
const diagEnabled = computed(() => Boolean(bankStore?.settings?.diagonalWatermarkEnabled))
const diagWidth = computed(() => Number((bankStore?.settings as any)?.diagonalLineWidth ?? 20))
const diagSpacing = computed(() => Number((bankStore?.settings as any)?.diagonalLineSpacing ?? 40))
const diagColor = computed(() => String((bankStore?.settings as any)?.diagonalLineColor ?? '#000000'))
const diagOpacity = computed(() => Number((bankStore?.settings as any)?.diagonalLineOpacity ?? 5))
const diagRotation = computed(() => Number((bankStore?.settings as any)?.diagonalLineRotation ?? -30))
const diagKey = ref(0)
watch([diagEnabled, diagWidth, diagSpacing, diagColor, diagOpacity, diagRotation], () => { diagKey.value++ })

const textEnabled = computed(() => Boolean(bankStore?.settings?.textWatermarkEnabled ?? watermark?.settings?.textWatermarkEnabled))
const fullEnabled = computed(() => Boolean(bankStore?.settings?.fullScreenWatermarkEnabled ?? bankStore?.settings?.fullScreenWatermark ?? watermark?.settings?.fullScreenWatermarkEnabled ?? watermark?.settings?.fullScreenWatermark))

const diagOverlayFlag = computed(() => Boolean((bankStore?.settings as any)?.diagonalOverlay ?? false))
const textOverlayFlag = computed(() => Boolean((bankStore?.settings as any)?.textWatermarkOverlay ?? watermark?.settings?.textWatermarkOverlay ?? watermark?.settings?.textOverlay))
const fullOverlayFlag = computed(() => Boolean((bankStore?.settings as any)?.fullScreenWatermarkOverlay ?? (bankStore?.settings as any)?.fullOverlay ?? watermark?.settings?.fullScreenWatermarkOverlay ?? watermark?.settings?.fullOverlay))

const anyEnabled = computed(() => Boolean(diagEnabled.value || textEnabled.value || fullEnabled.value))
const showWatermarkLayer = computed(() => {
  const explicit = bankStore?.settings?.showWatermark
  if (explicit === false) return false
  return Boolean(anyEnabled.value)
})

const textBaseStyle = computed(() => ({
  position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${(bankStore.settings.textWatermarkRotation ?? watermark.settings.textWatermarkRotation) || 0}deg)`,
  opacity: ((bankStore.settings.textWatermarkOpacity ?? watermark.settings.textWatermarkOpacity) || 0) / 100,
  color: bankStore.settings.textWatermarkColor ?? watermark.settings.textWatermarkColor,
  fontSize: `${(bankStore.settings.textWatermarkSize ?? watermark.settings.textWatermarkSize ?? 14) * 2}px`, fontWeight: 'bold', fontFamily: (bankStore.settings.textWatermarkFontFamily ?? watermark.settings.textWatermarkFontFamily) || 'Arial', whiteSpace: 'nowrap', userSelect: 'none', zIndex: 1, mixBlendMode: 'multiply'
}))

const textOverlayStyle = computed(() => ({
  ...textBaseStyle.value,
  zIndex: 100, mixBlendMode: 'normal'
}))

// Default footer values
const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
const generatedDateTime = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

const footerText = computed(() => props.footerText || `This report is automatically generated for reference only. Statement Period: ${periodDisplay.value}`)
const footerGenerated = computed(() => props.footerGenerated || `Generated: ${generatedDateTime}`)

// Report Title
const displayTitle = computed(() => {
  if (props.reportTitle) return props.reportTitle
  if (props.reportType === 'annual') return `${props.reportYear} Annual Financial Report`
  if (props.reportType === 'monthly') return `${getMonthName(props.reportMonth)} ${props.reportYear} Financial Report`
  return 'Custom Period Financial Report'
})

// Month name helper
const getMonthName = (month: number) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return months[month - 1] || ''
}

// Period Display
const periodDisplay = computed(() => {
  if (props.reportType === 'annual') {
    return `Jan 1, ${props.reportYear} - Dec 31, ${props.reportYear}`
  }
  if (props.reportType === 'monthly') {
    const lastDay = new Date(props.reportYear, props.reportMonth, 0).getDate()
    return `${getMonthName(props.reportMonth)} 1 - ${getMonthName(props.reportMonth)} ${lastDay}, ${props.reportYear}`
  }
  return `${props.reportStartDate} - ${props.reportEndDate}`
})

// 获取时间范围内的交易
const filteredTransactions = computed(() => {
  let startDate: Date, endDate: Date
  
  if (props.reportType === 'annual') {
    startDate = new Date(props.reportYear, 0, 1)
    endDate = new Date(props.reportYear, 11, 31, 23, 59, 59)
  } else if (props.reportType === 'monthly') {
    startDate = new Date(props.reportYear, props.reportMonth - 1, 1)
    endDate = new Date(props.reportYear, props.reportMonth, 0, 23, 59, 59)
  } else {
    startDate = new Date(props.reportStartDate)
    endDate = new Date(props.reportEndDate)
    endDate.setHours(23, 59, 59)
  }
  
  return bankStore.allTransactions.filter(t => {
    const date = new Date(t.date)
    return date >= startDate && date <= endDate
  })
})

// 统计数据
const periodStats = computed(() => {
  const transactions = filteredTransactions.value
  const income = transactions.filter(t => t.amount > 0)
  const expense = transactions.filter(t => t.amount < 0)
  
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = Math.abs(expense.reduce((sum, t) => sum + t.amount, 0))
  
  // 计算天数
  let dayCount = 1
  if (props.reportType === 'annual') {
    dayCount = 365
  } else if (props.reportType === 'monthly') {
    dayCount = new Date(props.reportYear, props.reportMonth, 0).getDate()
  } else if (props.reportStartDate && props.reportEndDate) {
    const start = new Date(props.reportStartDate)
    const end = new Date(props.reportEndDate)
    dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }
  
  return {
    totalIncome,
    totalExpense,
    netAmount: totalIncome - totalExpense,
    incomeCount: income.length,
    expenseCount: expense.length,
    totalCount: transactions.length,
    dailyAverage: dayCount > 0 ? totalExpense / dayCount : 0,
    dayCount
  }
})

// 趋势数据
const trendData = computed(() => {
  const transactions = filteredTransactions.value
  const data: Array<{ label: string; income: number; expense: number }> = []
  
  if (props.reportType === 'annual') {
    // 按月分组
    for (let m = 1; m <= 12; m++) {
      const monthTx = transactions.filter(t => {
        const date = new Date(t.date)
        return date.getMonth() + 1 === m
      })
      data.push({
        label: `${m}月`,
        income: monthTx.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
        expense: Math.abs(monthTx.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
      })
    }
  } else {
    // 按周分组（最多显示5周）
    const weeks = new Map<string, { income: number; expense: number }>()
    transactions.forEach(t => {
      const date = new Date(t.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`
      
      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, { income: 0, expense: 0 })
      }
      const week = weeks.get(weekKey)!
      if (t.amount > 0) {
        week.income += t.amount
      } else {
        week.expense += Math.abs(t.amount)
      }
    })
    
    Array.from(weeks.entries()).slice(-5).forEach(([label, values]) => {
      data.push({ label, ...values })
    })
  }
  
  return data
})

const maxTrendValue = computed(() => {
  const max = Math.max(
    ...trendData.value.map(d => Math.max(d.income, d.expense))
  )
  return max || 1
})

// 分类数据
const categoryData = computed(() => {
  const transactions = filteredTransactions.value.filter(t => t.amount < 0)
  const categoryMap = new Map<string, number>()
  
  transactions.forEach(t => {
    const cat = t.category || 'Other'
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount))
  })
  
  const total = periodStats.value.totalExpense || 1
  
  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
})

const categoryOffset = (index: number) => {
  let offset = 0
  for (let i = 0; i < index; i++) {
    const cat = categoryData.value[i]
    if (cat) {
      offset += cat.percentage * 2.51
    }
  }
  return offset
}

// 热门商户
const topMerchants = computed(() => {
  const transactions = filteredTransactions.value.filter(t => t.amount < 0)
  const merchantMap = new Map<string, { amount: number; count: number; category: string }>()
  
  transactions.forEach(t => {
    const name = t.merchant
    if (!merchantMap.has(name)) {
      merchantMap.set(name, { amount: 0, count: 0, category: t.category })
    }
    const m = merchantMap.get(name)!
    m.amount += Math.abs(t.amount)
    m.count++
  })
  
  return Array.from(merchantMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
})

// 洞察数据
const insights = computed(() => {
  const transactions = filteredTransactions.value
  const expenses = transactions.filter(t => t.amount < 0)
  const incomes = transactions.filter(t => t.amount > 0)
  
  // 最大支出
  const largestExpense = expenses.length > 0 
    ? expenses.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max)
    : { amount: 0, merchant: '-' }
  
  // 最大收入
  const largestIncome = incomes.length > 0
    ? incomes.reduce((max, t) => t.amount > max.amount ? t : max)
    : { amount: 0, merchant: '-' }
  
  // 最活跃日
  const dayCount = new Map<string, number>()
  transactions.forEach(t => {
    dayCount.set(t.date, (dayCount.get(t.date) || 0) + 1)
  })
  const busiestDay = Array.from(dayCount.entries())
    .sort((a, b) => b[1] - a[1])[0] || ['无数据', 0]
  
  // 平均交易额
  const avgAmount = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length
    : 0
  
  return {
    largestExpense: { amount: Math.abs(largestExpense.amount), merchant: largestExpense.merchant },
    largestIncome: { amount: largestIncome.amount, merchant: largestIncome.merchant },
    busiestDay: { date: busiestDay[0], count: busiestDay[1] },
    averageTransaction: avgAmount
  }
})

const formatCurrency = (amount: number) => {
  const currency = bankStore.cardInfo.currency || 'USD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount)
}

const translateCategory = (category: string) => {
  const translations: Record<string, string> = {
    'Shopping': '购物',
    'Food & Dining': '餐饮',
    'Transportation': '交通',
    'Entertainment': '娱乐',
    'Travel': '旅行',
    'Utilities': '公用事业',
    'Income': '收入',
    'Interest': '利息',
    'Cash Withdrawal': '取现',
    'Housing': '住房',
    'Groceries': '日用杂货',
    'Other': '其他'
  }
  return translations[category] || category
}

const formatCardType = (type: string) => {
  const typeMap: Record<string, string> = {
    'visa': 'Visa',
    'mastercard': 'Mastercard',
    'amex': 'American Express',
    'unionpay': 'UnionPay'
  }
  return typeMap[type?.toLowerCase()] || type || 'Visa'
}
</script>

<style scoped>
.bank-report-preview {
  background: #f5f7fa;
  min-height: 100%;
  padding: 20px;
}

.report-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* 报告头部 */
.report-header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 24px 40px;
  position: relative;
  overflow: hidden;
}

.header-decoration {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}

.header-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.report-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.report-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 12px 0;
}

.report-period-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.2);
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
}

.header-info {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.info-item {
  text-align: center;
}

.info-label {
  font-size: 11px;
  opacity: 0.8;
  display: block;
  margin-bottom: 2px;
}

.info-value {
  font-size: 13px;
  font-weight: 600;
}

/* 账户详情卡片 */
.account-details-section {
  padding: 20px 30px;
}

.account-details-card {
  background: #fafbfc;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px 24px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 32px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-label {
  font-size: 11px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-value {
  font-size: 14px;
  color: #212529;
}

.detail-value.bold {
  font-weight: 600;
}

.detail-value.status-active {
  color: #28a745;
}

/* 区块标题 */
.report-section {
  padding: 30px 40px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 24px 0;
}

.section-icon {
  font-size: 24px;
}

/* 汇总卡片 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-radius: 12px;
  background: #f8f9fa;
}

.summary-card .card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
  font-weight: bold;
}

.income-card .card-icon {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.expense-card .card-icon {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.net-card .card-icon {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.net-card.positive .card-icon {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.avg-card .card-icon {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.card-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.card-value {
  font-size: 18px;
  font-weight: 700;
  color: #212529;
}

.card-count {
  font-size: 11px;
  color: #adb5bd;
  margin-top: 2px;
}

/* 趋势图表 */
.trend-chart {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  gap: 8px;
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 60px;
}

.bar-wrapper {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 160px;
}

.bar {
  width: 20px;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
}

.income-bar {
  background: linear-gradient(180deg, #28a745, #20c997);
}

.expense-bar {
  background: linear-gradient(180deg, #dc3545, #fd7e14);
}

.bar-label {
  font-size: 11px;
  color: #6c757d;
  margin-top: 8px;
  text-align: center;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6c757d;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-color.income {
  background: #28a745;
}

.legend-color.expense {
  background: #dc3545;
}

/* 分类分析 */
.categories-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 30px;
  align-items: center;
}

.donut-chart {
  position: relative;
  width: 180px;
  height: 180px;
}

.donut-chart svg {
  width: 100%;
  height: 100%;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-total {
  font-size: 16px;
  font-weight: 700;
  color: #212529;
}

.donut-label {
  font-size: 11px;
  color: #6c757d;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 14px;
  color: #212529;
}

.category-amount {
  font-size: 12px;
  color: #6c757d;
}

.category-percentage {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  min-width: 50px;
  text-align: right;
}

/* 热门商户 */
.merchants-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.merchant-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

/* merchant-rank removed — numeric badges no longer shown */

.merchant-info {
  flex: 1;
}

/* Summary card value inline styling to keep sign and amount on one line */
.summary-cards .card-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.summary-cards .card-value .sign { font-size: 18px; margin-right: 4px; opacity: 0.95 }
.summary-cards .card-value .amount { font-size: 20px; font-weight: 700 }

.merchant-name {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
}

.merchant-category {
  font-size: 12px;
  color: #6c757d;
}

.merchant-stats {
  text-align: right;
}

.merchant-amount {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
}

.merchant-count {
  font-size: 11px;
  color: #6c757d;
}

/* 洞察卡片 */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.insight-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.insight-icon {
  font-size: 28px;
  margin-bottom: 12px;
}

.insight-title {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
}

.insight-value {
  font-size: 18px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 4px;
}

.insight-desc {
  font-size: 11px;
  color: #adb5bd;
}

/* 报告页脚 */
.report-footer {
  padding: 30px 40px;
  text-align: center;
}

.footer-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  margin: 0 auto 20px;
  border-radius: 2px;
}

.footer-text {
  font-size: 12px;
  color: #6c757d;
  margin: 0 0 8px 0;
}

.footer-generated {
  font-size: 11px;
  color: #adb5bd;
  margin: 0;
}

/* 响应式 */
@media (max-width: 800px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .insights-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-info {
    flex-direction: column;
    gap: 16px;
  }
}

/* 手机尺寸 */
.bank-report-preview.size-mobile {
  width: 375px;
}

.size-mobile .report-container {
  padding: 16px;
}

.size-mobile .report-title {
  font-size: 22px;
}

.size-mobile .summary-cards {
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.size-mobile .summary-card {
  padding: 14px;
}

.size-mobile .card-value {
  font-size: 18px;
}

.size-mobile .categories-grid {
  grid-template-columns: 1fr;
}

.size-mobile .header-info {
  flex-direction: column;
  gap: 12px;
}

/* iPhone 尺寸 */
.bank-report-preview.size-iphone {
  width: 393px;
}

.size-iphone .report-container {
  padding: 18px;
}

.size-iphone .report-title {
  font-size: 24px;
}

.size-iphone .summary-cards {
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.size-iphone .summary-card {
  padding: 16px;
}

.size-iphone .card-value {
  font-size: 20px;
}

.size-iphone .categories-grid {
  grid-template-columns: 1fr;
}

.size-iphone .header-info {
  flex-direction: column;
  gap: 14px;
}

/* 桌面尺寸 */
.bank-report-preview.size-desktop {
  width: 900px;
}

.size-desktop .report-container {
  padding: 50px;
}

.size-desktop .summary-cards {
  grid-template-columns: repeat(4, 1fr);
}
</style>
