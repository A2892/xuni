<template>
  <div class="consolidated-preview" :class="`size-${previewSize}`">
    <div class="statement-page" style="position:relative;">
      <!-- 水印层（背景/覆盖两层） -->
      <div v-if="showWatermarkLayer" class="watermark-layer-below" :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }">
        <DiagonalWatermark
          v-if="diagEnabled && !diagOverlayFlag"
          :key="'diag-con-'+diagKey"
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
          :key="'diag-con-overlay-'+diagKey"
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
      <!-- 银行Logo和头部 -->
      <div class="statement-header">
        <div class="header-content-wrapper">
          <div class="bank-logo-container">
            <img v-if="bankStore.settings.showLogo && bankStore.settings.logoUrl" :src="bankStore.settings.logoUrl" alt="Bank Logo" class="bank-logo-img" />
          </div>
          <div class="bank-info-center">
            <h1 class="bank-title">{{ bankStore.cardInfo.bank }}</h1>
            <p class="statement-subtitle">{{ bankStore.settings.language === 'en' ? 'CONSOLIDATED STATEMENT' : '汇总对账单' }}</p>
            <p v-if="bankStore.cardInfo.branch" class="branch-text">{{ bankStore.cardInfo.branch }}</p>
          </div>
          <div class="statement-period-right">
            <div class="period-label">{{ bankStore.settings.language === 'en' ? 'Statement Period' : '账单周期' }}</div>
            <div class="period-value">{{ bankStore.settings.statementPeriod }}</div>
          </div>
        </div>

          <!-- 每张银行卡使用情况（表格展示） -->
          <div v-if="perCardStats.length > 0" class="per-card-usage">
            <h2 class="per-card-title">{{ bankStore.settings.language === 'en' ? 'Per-Card Usage' : '每张银行卡使用情况' }}</h2>
            <table class="per-card-table">
              <thead>
                <tr>
                  <th>{{ bankStore.settings.language === 'en' ? 'Bank' : '银行' }}</th>
                  <th>{{ bankStore.settings.language === 'en' ? 'Card' : '卡号' }}</th>
                  <th class="text-center">{{ bankStore.settings.language === 'en' ? 'Transactions' : '交易数' }}</th>
                  <th class="text-right">{{ bankStore.settings.language === 'en' ? 'Income' : '收入' }}</th>
                  <th class="text-right">{{ bankStore.settings.language === 'en' ? 'Expenses' : '支出' }}</th>
                  <th class="text-right">{{ bankStore.settings.language === 'en' ? 'Net' : '净额' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="card in perCardStats" :key="card.id">
                  <td>{{ card.bank }}</td>
                  <td>**** {{ card.last4 }}</td>
                  <td class="text-center">{{ card.count }}</td>
                  <td class="text-right income">{{ card.income >= 0 ? '+' : '' }}{{ formatCurrency(card.income) }}</td>
                  <td class="text-right expense">{{ card.expense >= 0 ? '-' : '' }}{{ formatCurrency(card.expense) }}</td>
                  <td class="text-right">{{ formatCurrency(card.net) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>

      <!-- 账户汇总 -->
      <div class="accounts-summary">
        <h2>{{ bankStore.settings.language === 'en' ? 'Accounts Summary' : '账户汇总' }}</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Total Accounts' : '账户数量' }}</div>
            <div class="summary-value">{{ bankStore.accounts.length || 1 }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Total Transactions' : '交易笔数' }}</div>
            <div class="summary-value">{{ bankStore.transactions.length }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Total Income' : '总收入' }}</div>
            <div class="summary-value income"><span class="sign">+</span><span class="amount">{{ formatCurrency(bankStore.totalIncome) }}</span></div>
          </div>
          <div class="summary-item">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Total Expenses' : '总支出' }}</div>
            <div class="summary-value expense"><span class="sign">-</span><span class="amount">{{ formatCurrency(bankStore.totalSpent) }}</span></div>
          </div>
          <div class="summary-item highlight">
            <div class="summary-label">{{ bankStore.settings.language === 'en' ? 'Net Balance' : '净余额' }}</div>
            <div class="summary-value">{{ formatCurrency(bankStore.calculatedClosingBalance) }}</div>
          </div>
        </div>
      </div>

      <!-- 交易明细/图表 -->
      <div class="transactions-section">
        <div class="transactions-header-row">
          <h2>{{ bankStore.settings.language === 'en' ? 'Transaction Details' : '交易明细' }}</h2>
          <div class="display-toggle" role="tablist" aria-label="Display mode">
            <button :class="{ active: displayMode === 'table' }" @click="setDisplayMode('table')">Table</button>
            <button :class="{ active: displayMode === 'chart' }" @click="setDisplayMode('chart')">Chart</button>
          </div>
        </div>

        <template v-if="displayMode === 'table'">
          <table class="transactions-table">
            <thead>
              <tr>
                <th>{{ bankStore.settings.language === 'en' ? 'Date' : '日期' }}</th>
                <th>{{ bankStore.settings.language === 'en' ? 'Description' : '描述' }}</th>
                <th>{{ bankStore.settings.language === 'en' ? 'Category' : '类别' }}</th>
                <th class="amount-header">{{ bankStore.settings.language === 'en' ? 'Amount' : '金额' }}</th>
                <th>{{ bankStore.settings.language === 'en' ? 'Status' : '状态' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in allTransactionsSorted" :key="transaction.id">
                <td>{{ formatDate(transaction.date) }}</td>
                <td>
                  <div class="merchant-name">{{ transaction.merchant }}</div>
                  <div v-if="transaction.location" class="merchant-location">{{ transaction.location }}</div>
                </td>
                <td>{{ translateCategory(transaction.category) }}</td>
                <td class="amount-cell" :class="transaction.amount < 0 ? 'expense' : 'income'">
                  <span class="amount-inline"><span class="sign">{{ transaction.amount < 0 ? '-' : '+' }}</span><span class="num">{{ formatCurrency(Math.abs(transaction.amount)) }}</span></span>
                </td>
                <td>
                  <span class="status-badge" :class="`status-${transaction.status}`">
                    {{ translateStatus(transaction.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </template>

        <template v-else>
          <div class="charts-overview">
            <div class="charts-left">
              <div class="pie-wrapper">
                <svg class="pie-chart" width="220" height="220" xmlns="http://www.w3.org/2000/svg" viewBox="-1.1 -1.1 2.2 2.2" style="transform: rotate(-90deg)"><path v-for="(slice, index) in pieChartData" :key="index" :d="slice.path" :fill="slice.color" stroke="white" stroke-width="0.02" /></svg>
                <div class="pie-center">{{ currencySymbol }}<div class="pie-total">{{ formatCurrency(totalExpense) }}</div></div>
              </div>
            </div>
            <div class="charts-right">
              <div class="legend">
                <div v-for="(c, idx) in categoriesList" :key="c.category" class="legend-item">
                  <span class="legend-color" :style="{ background: palette[idx % palette.length] }"></span>
                  <div class="legend-label">
                    <div class="legend-name">{{ c.category }}</div>
                    <div class="legend-meta">{{ formatCurrency(c.amount) }} · {{ ((c.amount/totalExpense)*100).toFixed(1) }}%</div>
                  </div>
                </div>
              </div>
              <div class="bars">
                <div v-for="(c, idx) in categoriesList.slice(0,8)" :key="c.category" class="bar-row">
                  <div class="bar-label">{{ c.category }}</div>
                  <div class="bar-visual"><div class="bar-fill" :style="{ width: (c.amount/totalExpense*100) + '%', background: palette[idx % palette.length] }"></div></div>
                  <div class="bar-value">{{ formatCurrency(c.amount) }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>

      </div>

      <!-- 页脚 -->
      <div class="statement-footer">
        <div class="footer-content">
          <div class="footer-left">
            <p>{{ bankStore.settings.footerText }}</p>
          </div>
          
          <div class="footer-right">
            <!-- 条形码 -->
            <div v-if="bankStore.settings.showBarcode" class="barcode-section">
              <img v-if="bankStore.settings.barcodeSource === 'upload' && bankStore.settings.barcodeImage" 
                   :src="bankStore.settings.barcodeImage" 
                   class="custom-barcode-img" 
                   alt="Barcode" />
              <template v-else>
                <svg xmlns="http://www.w3.org/2000/svg" ref="barcodeRef" class="barcode-svg" version="1.1"></svg>
                <span class="barcode-text">{{ bankStore.settings.barcodeContent || 'CONSOLIDATED' }}</span>
              </template>
            </div>
            <!-- 二维码 -->
            <div v-if="bankStore.settings.showQR" class="qr-section">
              <img v-if="bankStore.settings.qrSource === 'upload' && bankStore.settings.qrImage" 
                   :src="bankStore.settings.qrImage" 
                   class="custom-qr-img" 
                   alt="QR Code" />
              <template v-else>
                <canvas ref="qrCanvas" width="80" height="80" class="qr-canvas"></canvas>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useBankStore } from '@/stores/bank'
import { useWatermarkStore } from '@/stores/watermark'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import FullScreenWatermark from '@/components/FullScreenWatermark.vue'
import DiagonalWatermark from '@/components/DiagonalWatermark.vue'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const bankStore = useBankStore()
const watermark = useWatermarkStore()

// 条形码和二维码引用
const barcodeRef = ref<SVGElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)

// 渲染条形码
const renderBarcode = () => {
  if (!bankStore.settings.showBarcode || bankStore.settings.barcodeSource === 'upload') return
  
  nextTick(() => {
    if (barcodeRef.value) {
      try {
        JsBarcode(barcodeRef.value, bankStore.settings.barcodeContent || 'CONSOLIDATED', {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: false,
          margin: 0,
          background: "transparent",
          lineColor: "#000000"
        })
      } catch (e) {
        console.error('Barcode render error:', e)
      }
    }
  })
}

// 渲染二维码
const renderQRCode = () => {
  if (!bankStore.settings.showQR || bankStore.settings.qrSource === 'upload') return

  nextTick(() => {
    if (qrCanvas.value) {
      try {
        const content = bankStore.settings.qrContent || 
                       `Consolidated Statement\nAccounts: ${bankStore.accounts.length}\nTotal Balance: ${bankStore.calculatedClosingBalance}`
        
        QRCode.toCanvas(qrCanvas.value, content, {
          width: 80,
          margin: 0,
          color: {
            dark: '#000000',
            light: '#00000000'
          }
        }, (error) => {
          if (error) console.error('QR render error:', error)
        })
      } catch (e) {
        console.error('QR render error:', e)
      }
    }
  })
}

// 监听变化重新渲染
watch(() => [
  bankStore.settings.showBarcode,
  bankStore.settings.barcodeSource,
  bankStore.settings.barcodeContent
], () => {
  renderBarcode()
})

watch(() => [
  bankStore.settings.showQR,
  bankStore.settings.qrSource,
  bankStore.settings.qrContent,
  bankStore.accounts.length,
  bankStore.calculatedClosingBalance
], () => {
  renderQRCode()
})

onMounted(() => {
  renderBarcode()
  renderQRCode()
})

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


const sortedTransactions = computed(() => {
  return [...bankStore.transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})

// 全部账户交易（按时间排序）
const allTransactionsSorted = computed(() => {
  return bankStore.allTransactions ? [...bankStore.allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []
})

const allTransactions = computed(() => bankStore.allTransactions || [])

// 展示模式（'table' | 'chart'）由设置控制，导出/打印也应该使用该设置
const displayMode = computed<string>({
  get: () => (bankStore.settings?.consolidatedDisplayMode as any) || 'table',
  set: (v: string) => {
    bankStore.updateSettings({ consolidatedDisplayMode: v })
  }
})

const setDisplayMode = (mode: 'table' | 'chart') => {
  displayMode.value = mode
}

// 聚合支出按类别（只统计支出金额）
const categoriesAgg = computed(() => {
  const map: Record<string, number> = {}
  allTransactions.value.forEach(t => {
    if (t.amount < 0) {
      const cat = t.category || 'Other'
      map[cat] = (map[cat] || 0) + Math.abs(t.amount)
    }
  })
  return Object.keys(map).map(k => ({ category: k, amount: map[k] }))
})

const totalExpense = computed(() => categoriesAgg.value.reduce((s, c) => s + c.amount, 0))

// 排序后的类别列表
const categoriesList = computed(() => categoriesAgg.value.sort((a, b) => b.amount - a.amount))

// 调色板
const palette = ['#2b6cb0', '#38a169', '#e53e3e', '#d69e2e', '#805ad5', '#dd6b20', '#3182ce', '#4a5568']

const pieChartData = computed(() => {
  const total = totalExpense.value || 1
  if (totalExpense.value === 0) return []
  let cumulativePercent = 0
  
  return categoriesList.value.map((c, i) => {
    const percent = c.amount / total
    if (percent >= 0.999) {
      return {
        color: palette[i % palette.length],
        path: 'M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z'
      }
    }
    
    const startX = Math.cos(2 * Math.PI * cumulativePercent)
    const startY = Math.sin(2 * Math.PI * cumulativePercent)
    cumulativePercent += percent
    const endX = Math.cos(2 * Math.PI * cumulativePercent)
    const endY = Math.sin(2 * Math.PI * cumulativePercent)
    const largeArcFlag = percent > 0.5 ? 1 : 0
    
    const path = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
    return { color: palette[i % palette.length], path }
  })
})

const currencySymbol = computed(() => {
  // 简单从主账户 currency 推断符号（可扩展）
  const cur = (bankStore.cardInfo && bankStore.cardInfo.currency) || 'USD'
  return cur === 'USD' ? '$' : cur === 'GBP' ? '£' : cur
})

// 每张银行卡使用情况统计（使用编辑区的数据：当前主账户 + accounts 列表）
const perCardStats = computed(() => {
  const list: Array<{ id: string; cardInfo: any; transactions: any[] }> = []
  // 包含当前主账户（如果存在）
  if (bankStore.cardInfo && (bankStore.cardInfo.cardNumber || (bankStore.transactions && bankStore.transactions.length > 0))) {
    list.push({ id: 'main', cardInfo: bankStore.cardInfo, transactions: bankStore.transactions || [] })
  }
  // 然后包含 accounts 列表中的账户
  (bankStore.accounts || []).forEach(acc => {
    list.push({ id: acc.id || Math.random().toString(36).slice(2,8), cardInfo: acc.cardInfo || {}, transactions: acc.transactions || [] })
  })

  return list.map(acc => {
    const related = acc.transactions || []
    const income = related.filter(r => r.amount > 0).reduce((s, r) => s + r.amount, 0)
    const expense = Math.abs(related.filter(r => r.amount < 0).reduce((s, r) => s + r.amount, 0))
    const net = income - expense
    return {
      id: acc.id,
      bank: acc.cardInfo?.bank || 'Bank',
      last4: (acc.cardInfo?.cardNumber || '').slice(-4) || '----',
      count: related.length,
      income,
      expense,
      net
    }
  })
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: bankStore.cardInfo.currency || 'USD'
  }).format(amount)
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return bankStore.settings.language === 'en' 
    ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const translateCategory = (category: string) => {
  if (bankStore.settings.language === 'en') return category
  const translations: Record<string, string> = {
    'Income': '收入', 'Housing': '住房', 'Shopping': '购物',
    'Food & Dining': '餐饮', 'Travel': '旅行', 'Transportation': '交通',
    'Entertainment': '娱乐', 'Utilities': '公用事业', 'Other': '其他'
  }
  return translations[category] || category
}

const translateStatus = (status: string) => {
  if (bankStore.settings.language === 'en') return status
  const translations: Record<string, string> = {
    'completed': '已完成', 'pending': '处理中', 'failed': '失败'
  }
  return translations[status] || status
}
</script>

<style scoped>
.consolidated-preview {
  background: white;
  padding: 20px;
  min-height: 100%;
}

.statement-page {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
}

  .per-card-usage { margin: 18px 0 22px }
  .per-card-title { font-size: 16px; margin-bottom: 10px }
  .per-card-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 13px }
  .per-card-table thead th { background: #f7fafc; padding: 10px 8px; text-align: center; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0 }
  .per-card-table thead th.text-right { text-align: right }
  .per-card-table thead th.text-center { text-align: center }
  .per-card-table td { padding: 12px 8px; border-bottom: 1px solid #eef2f6; vertical-align: middle }
  .per-card-table .text-right { text-align: right }
  .per-card-table .text-center { text-align: center }
  .per-card-table .income { color: #38a169 }
  .per-card-table .expense { color: #e53e3e }

  /* legacy card styles left for safety (not used when table is shown) */
  .cards-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 18px; align-items:start; max-width: 980px; margin: 0 auto }
  .usage-card { background:#ffffff; border:1px solid #eef2f6; border-radius:10px; padding:12px; display:flex; flex-direction:column; justify-content:space-between; min-height:120px; box-shadow: 0 6px 14px rgba(16,24,40,0.04); overflow:hidden }
  .usage-card:hover { transform: translateY(-4px); transition: transform .18s ease; box-shadow: 0 10px 24px rgba(16,24,40,0.06) }
  .usage-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px }
  .bank-name { font-weight:700; color:#0f2b4a; font-size:13px }
  .card-last4 { color:#718096; font-size:11px }
  .usage-metrics { display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-bottom:10px }
  .metric { background:#fbfdff; padding:10px; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:64px; box-shadow: inset 0 0 0 1px rgba(16,24,40,0.01) }
  .metric-label { font-size:11px; color:#6b7280; margin-bottom:6px }
  .metric-value { font-size:14px; font-weight:700; line-height:1 }
  .metric-value.income { color:#059669 }
  .metric-value.expense { color:#dc2626 }
  .usage-net { margin-top:6px; padding-top:10px; border-top:1px solid #eef2f6; display:flex; justify-content:flex-start; align-items:center; gap:12px }
  .net-label { color:#6b7280; font-size:11px }
  .net-value { font-weight:700; color:#0f2b4a; font-size:14px }

  @media (max-width: 1100px) {
    .cards-grid { grid-template-columns: repeat(2, 1fr); max-width: 760px }
  }

  @media (max-width: 640px) {
    .cards-grid { grid-template-columns: 1fr; max-width: 420px }
    .usage-metrics { grid-template-columns: 1fr; }
    .usage-card { min-height:unset }
  }

.statement-header {
  border-bottom: 3px solid #1a365d;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.header-content-wrapper {
  display: grid;
  grid-template-columns: 150px 1fr 150px;
  align-items: center;
  gap: 12px;
}

.bank-logo-container {
  width: 150px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.bank-logo-img {
  max-height: 60px;
  max-width: 150px;
  object-fit: contain;
}

.bank-info-center {
  text-align: center;
  padding: 0 20px;
}

.bank-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a365d;
  margin: 0 0 8px 0;
}

.statement-subtitle {
  font-size: 16px;
  color: #4a5568;
  letter-spacing: 2px;
  margin: 0 0 4px 0;
}

.branch-text {
  font-size: 12px;
  color: #718096;
  margin: 0;
}

.statement-period-right {
  text-align: right;
  width: 150px;
}

.period-label {
  font-size: 11px;
  color: #718096;
  text-transform: uppercase;
}

.period-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a365d;
}

.accounts-summary, .transactions-section {
  margin-bottom: 30px;
}

.accounts-summary h2, .transactions-section h2 {
  font-size: 16px;
  color: #1a365d;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.summary-item {
  background: #f7fafc;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.summary-item.highlight {
  background: linear-gradient(135deg, #1a365d, #2d3748);
  color: white;
}

.summary-item.highlight .summary-label {
  color: rgba(255,255,255,0.8);
}

.summary-label {
  font-size: 11px;
  color: #718096;
  text-transform: uppercase;
  margin-bottom: 4px;
}

  .summary-value {
    font-size: 18px;
    font-weight: 700;
    color: #1a365d;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .summary-value .sign { font-size: 14px; opacity: 0.95; margin-right: 2px }
  .summary-value .amount { font-size: 18px; font-weight: 700 }

.summary-item.highlight .summary-value {
  color: white;
}

.summary-value.income {
  color: #38a169;
}

.summary-value.expense {
  color: #e53e3e;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.transactions-header-row { display:flex; justify-content:space-between; align-items:center }
.display-toggle { display:inline-flex; gap:8px; border-radius:8px; background: #fff; padding: 4px }
.display-toggle button { background: transparent; border: 1px solid #e2e8f0; padding:6px 10px; border-radius:6px; cursor:pointer; color:#475569 }
.display-toggle button.active { background: var(--primary, #1a365d); color: white; border-color: transparent }

.transactions-table th {
  background: #f7fafc;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}
.transactions-table th.amount-header { text-align: center }

.transactions-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.transactions-table .amount-cell { white-space: nowrap; font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; text-align: center }
.transactions-table .amount-inline { display: inline-flex; align-items: center; gap: 4px; justify-content: center }
.transactions-table .amount-inline .sign { opacity: 0.95; margin-right: 2px; }

.merchant-name {
  font-weight: 500;
  color: #2d3748;
}

.merchant-location {
  font-size: 11px;
  color: #718096;
}

.text-right {
  text-align: right;
}

.income {
  color: #38a169;
}

.expense {
  color: #e53e3e;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-completed {
  background: #c6f6d5;
  color: #276749;
}

.status-pending {
  background: #feebc8;
  color: #c05621;
}

.status-failed {
  background: #fed7d7;
  color: #c53030;
}

.statement-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.footer-left {
  flex: 1;
  text-align: left;
  color: #718096;
  font-size: 11px;
}

.footer-right {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.barcode-section, .qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-barcode-img {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.barcode-svg {
  height: 40px;
  width: auto;
}

.barcode-text {
  font-size: 10px;
  margin-top: 2px;
  font-family: 'Courier New', Courier, monospace;
}

.custom-qr-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.qr-canvas {
  width: 60px !important;
  height: 60px !important;
}

/* charts */
.charts-overview { display:flex; gap:20px; align-items:flex-start; margin-top: 8px }
.charts-left { width: 280px; display:flex; align-items:center; justify-content:center }
.pie-wrapper { position: relative; width: 220px; height: 220px }
.pie-chart { width: 220px; height: 220px; border-radius: 50%; box-shadow: inset 0 0 0 6px rgba(255,255,255,0.9) }
.pie-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); text-align:center; pointer-events:none }
.pie-total { font-size: 16px; font-weight:700; color:#1a365d }
.charts-right { flex: 1 }
.legend { display:flex; flex-direction:column; gap:8px; margin-bottom: 12px }
.legend-item { display:flex; gap:12px; align-items:center }
.legend-color { width: 14px; height: 14px; border-radius:3px; flex-shrink:0 }
.legend-label { display:flex; flex-direction:column }
.legend-name { font-weight:600; color:#2d3748 }
.legend-meta { font-size:12px; color:#718096 }
.bars { display:flex; flex-direction:column; gap:10px }
.bar-row { display:flex; align-items:center; gap:12px }
.bar-label { width: 140px; font-size:13px; color:#4a5568 }
.bar-visual { background:#f1f5f9; height:10px; flex:1; border-radius:6px; overflow:hidden }
.bar-fill { height:100%; }
.bar-value { width:90px; text-align:right; font-weight:600 }

/* 手机尺寸 */
.consolidated-preview.size-mobile {
  width: 375px;
}

.size-mobile .statement-page {
  padding: 16px;
  max-width: 100%;
}

.size-mobile .header-content-wrapper {
  grid-template-columns: 60px 1fr 80px;
}
.size-mobile .bank-logo-img { max-height: 40px }

.size-mobile .bank-title {
  font-size: 18px;
}

.size-mobile .statement-subtitle {
  font-size: 12px;
}

.size-mobile .summary-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.size-mobile .summary-item {
  padding: 12px;
}

.size-mobile .summary-value {
  font-size: 16px;
}

.size-mobile .transactions-table {
  font-size: 11px;
}

.size-mobile .transactions-table th,
.size-mobile .transactions-table td {
  padding: 8px 6px;
}

/* iPhone 尺寸 */
.consolidated-preview.size-iphone {
  width: 393px;
}

.size-iphone .statement-page {
  padding: 18px;
  max-width: 100%;
}

.size-iphone .header-content-wrapper {
  grid-template-columns: 70px 1fr 90px;
}
.size-iphone .bank-logo-img { max-height: 44px }

.size-iphone .bank-title {
  font-size: 20px;
}

.size-iphone .statement-subtitle {
  font-size: 13px;
}

.size-iphone .summary-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.size-iphone .summary-item {
  padding: 14px;
}

.size-iphone .summary-value {
  font-size: 18px;
}

.size-iphone .transactions-table {
  font-size: 12px;
}

.size-iphone .transactions-table th,
.size-iphone .transactions-table td {
  padding: 10px 8px;
}

/* 桌面尺寸 */
.consolidated-preview.size-desktop {
  width: 900px;
}

.size-desktop .statement-page {
  padding: 50px;
}

.size-desktop .summary-grid {
  grid-template-columns: repeat(5, 1fr);
}
</style>
