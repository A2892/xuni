<template>
  <div class="utility-bill-preview" :class="[store.settings.template, `size-${previewSize}`]">
    <!-- 支付完成后显示收据 -->
    <div v-if="store.paymentCompleted.isPaid" class="payment-receipt" :style="billStyles">
      <div class="receipt-letterhead">
        <div class="provider-brand">
          <img v-if="store.provider.logo" :src="store.provider.logo" class="logo" alt="Provider Logo" />
          <div class="provider-details">
            <h1>{{ store.provider.name || 'Utility Company' }}</h1>
            <p class="tagline">{{ store.provider.tagline || 'Your Trusted Energy Partner' }}</p>
          </div>
        </div>
        <div class="receipt-title-block">
          <div class="paid-badge">✓ PAID</div>
          <h2>PAYMENT RECEIPT</h2>
        </div>
      </div>
      
      <div class="receipt-confirmation">
        <span class="conf-label">Confirmation Number</span>
        <span class="conf-number">{{ store.paymentCompleted.confirmationNumber }}</span>
      </div>
      
      <div class="receipt-details-grid">
        <div class="detail-section">
          <h3>Account Information</h3>
          <div class="detail-row">
            <span class="label">Account Number</span>
            <span class="value">{{ store.customer.accountNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Account Holder</span>
            <span class="value">{{ store.customer.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Service Address</span>
            <span class="value">{{ store.customer.address }}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>Payment Details</h3>
          <div class="detail-row">
            <span class="label">Payment Date</span>
            <span class="value">{{ formatDate(store.paymentCompleted.paidDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Payment Method</span>
            <span class="value">{{ getPaymentMethodLabel(store.paymentCompleted.paymentMethod) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Paid By</span>
            <span class="value">{{ store.paymentCompleted.payerName }}</span>
          </div>
        </div>
      </div>
      
      <div class="receipt-bill-ref">
        <h3>Bill Reference</h3>
        <div class="ref-grid">
          <div class="ref-item">
            <span class="label">Bill Number</span>
            <span class="value">{{ store.billNumber }}</span>
          </div>
          <div class="ref-item">
            <span class="label">Bill Date</span>
            <span class="value">{{ formatDate(store.billDate) }}</span>
          </div>
          <div class="ref-item">
            <span class="label">Service Period</span>
            <span class="value">{{ formatDate(store.billPeriod.startDate) }} - {{ formatDate(store.billPeriod.endDate) }}</span>
          </div>
          <div class="ref-item">
            <span class="label">Service Type</span>
            <span class="value">{{ billTypeLabel }}</span>
          </div>
        </div>
      </div>
      
      <div class="receipt-amount-box">
        <div class="amount-row">
          <span>Original Amount Due</span>
          <span>{{ store.formatCurrency(store.paymentCompleted.paidAmount) }}</span>
        </div>
        <div class="amount-row total">
          <span>Amount Paid</span>
          <span class="paid-amount">{{ store.formatCurrency(store.paymentCompleted.paidAmount) }}</span>
        </div>
        <div class="amount-row balance">
          <span>Remaining Balance</span>
          <span class="zero">{{ store.formatCurrency(0) }}</span>
        </div>
      </div>
      
      <div class="receipt-footer">
        <p class="thank-you">Thank you for your payment!</p>
        <p class="footer-info">{{ store.provider.name }} · {{ store.provider.phone }} · {{ store.provider.website }}</p>
        <p class="footer-note">Please keep this receipt for your records. For questions, contact customer service.</p>
      </div>
      
      <!-- 水印 -->
      <div v-if="store.designSettings.watermarkEnabled" class="watermark-layer">
        <div class="watermark-pattern" :style="watermarkStyle">
          <span v-for="i in 20" :key="i">{{ store.designSettings.watermarkText }}</span>
        </div>
      </div>
    </div>
    
    <!-- 未支付时显示账单 -->
    <div v-else class="bill" :style="billStyles">
      <!-- Letterhead -->
      <div class="letterhead" :style="{ background: letterheadBackground }">
        <div class="provider-brand">
          <img v-if="store.provider.logo" :src="store.provider.logo" class="logo" alt="Provider Logo" />
          <div class="provider-details">
            <h1>{{ store.provider.name || 'Utility Company' }}</h1>
            <p class="tagline">{{ store.provider.tagline || 'Your Trusted Energy Partner' }}</p>
          </div>
        </div>
        <div class="document-title">
          <span class="bill-type-badge">{{ billTypeLabel }}</span>
          <h2>{{ t('statementOfAccount') }}</h2>
          <p class="bill-number">{{ t('invoiceNo') }} {{ store.billNumber }}</p>
        </div>
      </div>

      <!-- Account Summary Bar -->
      <div class="account-bar">
        <div class="bar-item">
          <div class="bar-content">
            <span class="bar-label">{{ t('accountNumber') }}</span>
            <span class="bar-value">{{ store.customer.accountNumber }}</span>
          </div>
        </div>
        <div class="bar-item">
          <div class="bar-content">
            <span class="bar-label">{{ t('statementDate') }}</span>
            <span class="bar-value">{{ formatDate(store.billDate) }}</span>
          </div>
        </div>
        <div class="bar-item">
          <div class="bar-content">
            <span class="bar-label">{{ t('dueDate') }}</span>
            <span class="bar-value due">{{ formatDate(store.dueDate) }}</span>
          </div>
        </div>
        <div class="bar-item highlight">
          <div class="bar-content">
            <span class="bar-label">{{ t('amountDue') }}</span>
            <span class="bar-value amount">{{ store.formatCurrency(store.totalAmountDue) }}</span>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="content-grid">
        <div class="customer-panel">
          <div class="panel-header">
            <h3>{{ t('serviceAddress') }}</h3>
          </div>
          <div class="customer-info">
            <p class="customer-name">{{ store.customer.name }}</p>
            <p class="customer-address">
              {{ store.customer.address }}<br>
              {{ store.customer.city }}, {{ store.customer.state }} {{ store.customer.zip }}
            </p>
            <div class="customer-contact">
              <span v-if="store.customer.phone">{{ store.customer.phone }}</span>
              <span v-if="store.customer.email">{{ store.customer.email }}</span>
            </div>
          </div>
        </div>
        <div class="meter-panel">
          <div class="panel-header">
            <h3>{{ t('meterInfo') }}</h3>
          </div>
          <div class="meter-details">
            <div class="meter-row">
              <span class="meter-label">{{ t('meterNumber') }}</span>
              <span class="meter-value">{{ store.customer.meterNumber }}</span>
            </div>
            <div class="meter-row">
              <span class="meter-label">{{ t('servicePeriod') }}</span>
              <span class="meter-value">{{ formatDate(store.billPeriod.startDate) }} - {{ formatDate(store.billPeriod.endDate) }}</span>
            </div>
            <div class="meter-row">
              <span class="meter-label">{{ t('daysInPeriod') }}</span>
              <span class="meter-value">{{ billingDays }} {{ t('days') }}</span>
            </div>
            <div class="meter-row highlight">
              <span class="meter-label">{{ t('totalUsage') }}</span>
              <span class="meter-value">{{ formattedTotalUsage }} {{ primaryUnit }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Comparison -->
      <div v-if="store.settings.showUsageChart && store.usageHistory.length > 0" class="usage-section">
        <div class="section-header">
          <h3>{{ t('usageHistory') }}</h3>
        </div>
        <div class="usage-content">
          <div class="usage-chart">
            <div class="chart-container">
              <div v-for="(h, i) in store.usageHistory" :key="i" class="chart-bar-wrapper">
                <div class="chart-bar" :style="{ height: `${Math.max(3, (h.usage / maxUsage) * 55)}px`, background: chartBarBackground }"></div>
                <span class="chart-label">{{ monthLabels[h.month - 1] }}</span>
              </div>
            </div>
          </div>
          <div class="usage-stats">
            <div class="stat-item">
              <span class="stat-value">{{ store.averageUsage }}</span>
              <span class="stat-label">{{ t('avgMonthly') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-value" :class="usageChange >= 0 ? 'up' : 'down'">{{ usageChange >= 0 ? '+' : '' }}{{ usageChange }}%</span>
              <span class="stat-label">{{ t('vsLastMonth') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charges Breakdown -->
      <div class="charges-section">
        <div class="section-header">
          <h3>{{ t('chargesBreakdown') }}</h3>
        </div>
        <table class="charges-table">
          <thead>
            <tr>
              <th class="col-desc">{{ t('description') }}</th>
              <th class="col-usage">{{ t('usage') }}</th>
              <th class="col-rate">{{ t('rate') }}</th>
              <th class="col-amount">{{ t('amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="charge in store.charges" :key="charge.id" class="charge-row">
              <td class="col-desc">{{ charge.description }}</td>
              <td class="col-usage">{{ charge.usage }} {{ charge.unit }}</td>
              <td class="col-rate">{{ store.formatCurrency(charge.rate) }}/{{ charge.unit }}</td>
              <td class="col-amount">{{ store.formatCurrency(charge.amount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="subtotal-row">
              <td colspan="3">{{ t('subtotal') }}</td>
              <td class="col-amount">{{ store.formatCurrency(store.currentCharges) }}</td>
            </tr>
            <tr v-if="store.taxes > 0" class="fee-row">
              <td colspan="3">{{ t('taxesGovFees') }}</td>
              <td class="col-amount">{{ store.formatCurrency(store.taxes) }}</td>
            </tr>
            <tr v-if="store.serviceFees > 0" class="fee-row">
              <td colspan="3">{{ t('serviceFees') }}</td>
              <td class="col-amount">{{ store.formatCurrency(store.serviceFees) }}</td>
            </tr>
            <tr v-if="store.previousBalance !== 0" class="balance-row">
              <td colspan="3">{{ t('prevBalance') }}</td>
              <td class="col-amount">{{ store.formatCurrency(store.previousBalance) }}</td>
            </tr>
            <tr v-if="store.payments !== 0" class="payment-row">
              <td colspan="3">{{ t('paymentsReceived') }}</td>
              <td class="col-amount credit">-{{ store.formatCurrency(store.payments) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Total Due Box -->
      <div class="total-due-section">
        <div class="total-box" :style="{ background: totalBoxBackground }">
          <div class="total-label">
            <span class="total-text">{{ t('totalAmountDue') }}</span>
            <span class="due-date">{{ t('payBy') }} {{ formatDate(store.dueDate) }}</span>
          </div>
          <div class="total-amount">{{ store.formatCurrency(store.totalAmountDue) }}</div>
        </div>
        <div v-if="store.settings.showLateFee" class="late-notice">
          <span>{{ t('lateFee') }} {{ store.formatCurrency(store.lateFee || 15) }} {{ t('afterDueDate') }}</span>
        </div>
      </div>

      <!-- Payment Options -->
      <div v-if="store.settings.showPaymentOptions" class="payment-options">
        <div class="section-header">
          <h3>{{ t('paymentOptions') }}</h3>
        </div>
        <div class="options-grid">
          <div class="option-card">
            <span class="option-title">{{ t('online') }}</span>
            <span class="option-desc">{{ store.provider.website }}</span>
          </div>
          <div class="option-card">
            <span class="option-title">{{ t('phoneOpt') }}</span>
            <span class="option-desc">{{ store.provider.phone }}</span>
          </div>
          <div class="option-card">
            <span class="option-title">{{ t('autoPay') }}</span>
            <span class="option-desc">{{ t('setUpAuto') }}</span>
          </div>
          <div class="option-card">
            <span class="option-title">{{ t('mail') }}</span>
            <span class="option-desc">{{ t('sendCheck') }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bill-footer">
        <div class="footer-left">
          <p class="footer-address">{{ store.provider.name }} · {{ store.provider.address }}</p>
          <p class="footer-contact">{{ t('customerService') }}: {{ store.provider.phone }} · {{ store.provider.website }}</p>
        </div>
        <div class="footer-right">
          <div v-if="store.settings.showBarcode" class="barcode-section">
            <!-- 自定义条形码图片 -->
            <img v-if="store.barcodeSettings.useCustomBarcode && store.barcodeSettings.customBarcodeImage" 
                 :src="store.barcodeSettings.customBarcodeImage" 
                 class="custom-barcode-img" 
                 alt="Barcode" />
            <!-- 自动生成条形码 -->
            <template v-else>
              <svg ref="barcodeRef" class="barcode-svg"></svg>
              <span class="barcode-number">{{ store.barcodeSettings.barcodeContent || store.billNumber }}</span>
            </template>
          </div>
          <!-- QR Code 部分 -->
          <div v-if="store.settings.showQRCode" class="qr-section">
            <img v-if="store.barcodeSettings.useCustomQR && store.barcodeSettings.customQRImage" 
                 :src="store.barcodeSettings.customQRImage" 
                 class="custom-qr-img" 
                 alt="QR Code" />
            <template v-else>
              <canvas ref="qrCanvas" width="60" height="60" class="qr-canvas"></canvas>
              <span class="qr-text">Scan to Pay</span>
            </template>
          </div>
        </div>
      </div>
      
      <!-- 水印 -->
      <div v-if="store.designSettings.watermarkEnabled" class="watermark-layer">
        <div class="watermark-pattern" :style="watermarkStyle">
          <span v-for="i in 20" :key="i">{{ store.designSettings.watermarkText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useUtilityBillStore } from '@/stores/utilityBill'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import { mix } from '@/utils/color'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useUtilityBillStore()
const barcodeRef = ref<SVGElement>()
const qrCanvas = ref<HTMLCanvasElement>()

// 计算渐变背景色，替代 CSS color-mix 以兼容 html2canvas
const letterheadBackground = computed(() => {
  const primary = store.settings.primaryColor || '#0066cc'
  // color-mix(in srgb, primary 75%, #1e3a5f) -> 25% #1e3a5f
  const mixed = mix(primary, '#1e3a5f', 0.25)
  return `linear-gradient(135deg, ${primary}, ${mixed})`
})

const chartBarBackground = computed(() => {
  const primary = store.settings.primaryColor || '#0066cc'
  // color-mix(in srgb, primary 50%, #93c5fd) -> 50% #93c5fd
  const mixed = mix(primary, '#93c5fd', 0.5)
  return `linear-gradient(to top, ${primary}, ${mixed})`
})

const totalBoxBackground = computed(() => letterheadBackground.value)

// 渲染条形码
const renderBarcode = () => {
  if (!barcodeRef.value) return
  if (store.barcodeSettings.useCustomBarcode && store.barcodeSettings.customBarcodeImage) return
  
  const content = store.barcodeSettings.barcodeContent || store.billNumber || '0000000000'
  try {
    JsBarcode(barcodeRef.value, content, {
      format: 'CODE128',
      width: 1.5,
      height: 35,
      displayValue: false,
      margin: 0
    })
  } catch (error) {
    console.error('Barcode generation failed:', error)
  }
}

// 渲染二维码
const renderQRCode = async () => {
  if (!qrCanvas.value) return
  if (store.barcodeSettings.useCustomQR && store.barcodeSettings.customQRImage) return
  
  const qrData = {
    type: 'utility_bill',
    billNo: store.billNumber,
    provider: store.provider.name,
    amount: store.totalDue,
    dueDate: store.dueDate,
    account: store.customer.accountNumber
  }
  
  try {
    await QRCode.toCanvas(qrCanvas.value, JSON.stringify(qrData), {
      width: 60,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (error) {
    console.error('QR Code generation failed:', error)
  }
}

onMounted(() => {
  nextTick(() => {
    renderBarcode()
    renderQRCode()
  })
})

watch(
  () => [
    store.settings.showBarcode,
    store.settings.showQRCode,
    store.barcodeSettings.useCustomBarcode,
    store.barcodeSettings.barcodeContent,
    store.barcodeSettings.useCustomQR,
    store.barcodeSettings.customQRImage,
    store.billNumber,
    store.totalAmountDue
  ],
  () => {
    nextTick(() => {
      nextTick(() => {
        renderBarcode()
        renderQRCode()
      })
    })
  },
  { deep: true }
)

// 账单样式
const billStyles = computed(() => {
  const styles: Record<string, string> = {
    '--primary': store.settings.primaryColor,
    '--accent': store.settings.accentColor,
    fontFamily: store.designSettings.fontFamily,
    color: store.designSettings.textColor
  }
  
  if (store.designSettings.borderEnabled) {
    styles.border = `${store.designSettings.borderWidth}px ${store.designSettings.borderStyle} ${store.designSettings.borderColor}`
  }
  
  return styles
})

// 水印样式
const watermarkStyle = computed(() => ({
  '--watermark-color': store.designSettings.watermarkColor,
  '--watermark-opacity': store.designSettings.watermarkOpacity / 100,
  '--watermark-size': `${store.designSettings.watermarkSize}px`,
  '--watermark-angle': `${store.designSettings.watermarkAngle}deg`,
  '--watermark-font': store.designSettings.watermarkFontFamily
}))

// 多语言翻译
const translations = {
  en: {
    statementOfAccount: 'STATEMENT OF ACCOUNT',
    invoiceNo: 'Invoice No.',
    accountNumber: 'Account Number',
    statementDate: 'Statement Date',
    dueDate: 'Due Date',
    amountDue: 'Amount Due',
    serviceAddress: 'Service Address',
    meterInfo: 'Meter Information',
    meterNumber: 'Meter Number',
    servicePeriod: 'Service Period',
    daysInPeriod: 'Days in Period',
    days: 'days',
    totalUsage: 'Total Usage',
    usageHistory: 'Usage History',
    avgMonthly: 'Avg Monthly',
    vsLastMonth: 'vs Last Month',
    chargesBreakdown: 'Charges Breakdown',
    description: 'Description',
    usage: 'Usage',
    rate: 'Rate',
    amount: 'Amount',
    subtotal: 'Subtotal',
    taxesGovFees: 'Taxes & Government Fees',
    serviceFees: 'Service Fees',
    prevBalance: 'Previous Balance',
    paymentsReceived: 'Payments Received',
    totalAmountDue: 'TOTAL AMOUNT DUE',
    payBy: 'Pay by',
    lateFee: 'Late fee of',
    afterDueDate: 'will be charged after due date',
    paymentOptions: 'Payment Options',
    online: 'Online',
    visitWebsite: 'Visit our website',
    autoPay: 'Auto Pay',
    setUpAuto: 'Set up automatic',
    mail: 'Mail',
    sendCheck: 'Send check',
    phoneOpt: 'Phone',
    callToPay: 'Call to pay',
    electricity: 'Electric',
    water: 'Water',
    gas: 'Natural Gas',
    internet: 'Internet',
    phoneType: 'Telephone',
    combined: 'Combined',
    customerService: 'Customer Service'
  },
  zh: {
    statementOfAccount: '账单明细',
    invoiceNo: '账单编号',
    accountNumber: '账户号码',
    statementDate: '账单日期',
    dueDate: '付款截止日',
    amountDue: '应付金额',
    serviceAddress: '服务地址',
    meterInfo: '电表信息',
    meterNumber: '电表号码',
    servicePeriod: '服务周期',
    daysInPeriod: '周期天数',
    days: '天',
    totalUsage: '总用量',
    usageHistory: '用量历史',
    avgMonthly: '月均用量',
    vsLastMonth: '环比上月',
    chargesBreakdown: '费用明细',
    description: '描述',
    usage: '用量',
    rate: '费率',
    amount: '金额',
    subtotal: '小计',
    taxesGovFees: '税费及政府费用',
    serviceFees: '服务费',
    prevBalance: '上期余额',
    paymentsReceived: '已收款项',
    totalAmountDue: '应付总额',
    payBy: '请于以下日期前付款',
    lateFee: '逾期将加收',
    afterDueDate: '滞纳金',
    paymentOptions: '支付方式',
    online: '在线支付',
    visitWebsite: '访问网站',
    autoPay: '自动扣款',
    setUpAuto: '设置自动付款',
    mail: '邮寄',
    sendCheck: '寄送支票',
    phoneOpt: '电话',
    callToPay: '致电支付',
    electricity: '电费',
    water: '水费',
    gas: '燃气',
    internet: '网络',
    phoneType: '电话',
    combined: '综合',
    customerService: '客户服务'
  }
}

import { useI18n } from '@/utils/i18n'
const { currentLanguage } = useI18n()

const t = (key: keyof typeof translations.en) => {
  const lang = currentLanguage.value || store.settings.language
  return (translations as any)[lang]?.[key] || translations.en[key]
}

// 支付方式标签
const paymentMethodLabels: Record<string, string> = {
  credit_card: 'Credit Card',
  bank_transfer: 'Bank Transfer',
  online: 'Online Payment',
  cash: 'Cash',
  check: 'Check'
}

const getPaymentMethodLabel = (method: string) => {
  return paymentMethodLabels[method] || method
}

const billTypeLabel = computed(() => {
  const labels: Record<string, keyof typeof translations.en> = { 
    electricity: 'electricity', 
    water: 'water', 
    gas: 'gas', 
    internet: 'internet', 
    phone: 'phoneType', 
    combined: 'combined' 
  }
  return t(labels[store.billType] || 'electricity')
})

const primaryUnit = computed(() => {
  const units: Record<string, string> = { electricity: 'kWh', water: 'gal', gas: 'therm', internet: 'GB', phone: 'min', combined: 'units' }
  return units[store.billType] || 'units'
})

// 直接从费用明细中累加相同单位的用量，确保预览与明细一致
// 计算基于费用明细的自动总用量（数字），不格式化
const previewSumNumber = computed(() => {
  const main = (primaryUnit.value || '').toString().toLowerCase()
  const keywords = main === 'kwh' ? ['kwh', '度'] : [main]
  return store.charges.reduce((sum: number, c: any) => {
    const u = (c.unit || '').toString().toLowerCase()
    const usageNum = Number(c.usage)
    const matched = keywords.some(k => k && u.includes(k))
    return matched && Number.isFinite(usageNum) ? sum + usageNum : sum
  }, 0)
})

// 可编辑的总用量（绑定到 store.manualTotalUsage，如果为 null 则使用自动计算值）
const editableTotal = computed<number>({
  get() {
    return Number(store.manualTotalUsage ?? previewSumNumber.value)
  },
  set(v: number) {
    if (!Number.isFinite(v)) {
      store.manualTotalUsage = null
    } else {
      store.manualTotalUsage = Math.round(v)
    }
  }
})

const formattedTotalUsage = computed(() => {
  const n = Number(editableTotal.value || 0)
  return Number.isFinite(n) ? n.toLocaleString() : '0'
})

const resetTotalUsage = () => {
  store.manualTotalUsage = null
}

const maxUsage = computed(() => {
  if (store.usageHistory.length === 0) return 1
  return Math.max(...store.usageHistory.map(h => h.usage), 1)
})

const billingDays = computed(() => {
  const start = new Date(store.billPeriod.startDate)
  const end = new Date(store.billPeriod.endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
})

// 本地化月份标签（短）
const monthLabels = computed(() => {
  // 预览中固定显示英文月份
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
})

const usageChange = computed(() => {
  if (store.usageHistory.length < 2) return 0
  const currentItem = store.usageHistory[store.usageHistory.length - 1]
  const previousItem = store.usageHistory[store.usageHistory.length - 2]
  if (!currentItem || !previousItem) return 0
  const current = currentItem.usage
  const previous = previousItem.usage
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const locale = store.settings.language === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.utility-bill-preview { display: flex; justify-content: center; padding: 16px; }
.bill { width: 620px; background: white; font-family: 'Segoe UI', -apple-system, sans-serif; box-shadow: 0 1px 10px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; font-size: 12px; line-height: 1.5; color: #1e293b; }

.letterhead { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 28px; color: white; background: v-bind(letterheadBackground); }
.provider-brand { display: flex; align-items: center; gap: 14px; }
.logo { height: 40px; width: auto; }
.logo-placeholder { width: 40px; height: 40px; background: rgba(255,255,255,0.15); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; }
.provider-details h1 { margin: 0; font-size: 17px; font-weight: 600; }
.provider-details .tagline { margin: 2px 0 0; font-size: 10px; opacity: 0.8; }
.document-title { text-align: right; }
.bill-type-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: 500; margin-bottom: 4px; }
.document-title h2 { margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }
.document-title .bill-number { margin: 3px 0 0; font-size: 11px; opacity: 0.85; font-family: 'SF Mono', 'Courier New', monospace; }

.account-bar { display: grid; grid-template-columns: repeat(4, 1fr); background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.bar-item { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-right: 1px solid #e2e8f0; }
.bar-item:last-child { border-right: none; }
.bar-item.highlight { background: var(--primary, #0066cc); color: white; }
.bar-content { display: flex; flex-direction: column; }
.bar-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; opacity: 0.7; }
.bar-value { font-size: 12px; font-weight: 600; }
.bar-value.due { color: #dc2626; }
.bar-item.highlight .bar-value.due { color: #fef08a; }
.bar-value.amount { font-size: 13px; }

.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #e2e8f0; margin: 16px 20px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
.customer-panel, .meter-panel { background: white; padding: 14px; }
.panel-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.panel-header h3 { margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; color: var(--primary, #0066cc); font-weight: 600; }
.customer-name { margin: 0 0 3px; font-size: 14px; font-weight: 600; color: #0f172a; }
.customer-address { margin: 0 0 8px; color: #475569; font-size: 11px; }
.customer-contact { display: flex; flex-direction: column; gap: 1px; font-size: 11px; color: #64748b; }
.meter-details { display: flex; flex-direction: column; gap: 6px; }
.meter-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #e2e8f0; }
.meter-row:last-child { border-bottom: none; }
.meter-row.highlight { background: #f0f9ff; margin: 0 -14px; padding: 6px 14px; border-bottom: none; }
.meter-label { color: #64748b; font-size: 11px; }
.meter-value { font-weight: 500; font-size: 11px; }
.meter-row.highlight .meter-value { color: var(--primary, #0066cc); font-weight: 700; font-size: 13px; }

.usage-section { margin: 16px 20px; background: #f8fafc; border-radius: 6px; padding: 14px; }
.section-header { margin-bottom: 12px; }
.section-header h3 { margin: 0; font-size: 11px; color: #334155; font-weight: 600; }
.usage-content { display: flex; gap: 20px; align-items: flex-end; }
.usage-chart { flex: 1; }
.chart-container { display: flex; justify-content: space-around; align-items: flex-end; height: 70px; }
.chart-bar-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: 32px; height: 100%; }
.chart-bar { width: 20px; border-radius: 3px 3px 0 0; min-height: 3px; transition: height 0.3s ease; background: v-bind(chartBarBackground); }
.chart-label { font-size: 9px; color: #64748b; margin-top: 4px; flex-shrink: 0; }
.usage-stats { display: flex; flex-direction: column; gap: 8px; min-width: 90px; }
.stat-item { text-align: center; padding: 6px; background: white; border-radius: 4px; }
.stat-value { display: block; font-size: 15px; font-weight: 700; color: #0f172a; }
.stat-value.up { color: #dc2626; }
.stat-value.down { color: #16a34a; }
.stat-label { display: block; font-size: 9px; color: #64748b; }

.charges-section { margin: 16px 20px; }
.charges-table { width: 100%; border-collapse: collapse; }
.charges-table th { text-align: left; padding: 8px 10px; background: #f1f5f9; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
.charges-table td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
.col-desc { width: 45%; }
.col-usage, .col-rate { width: 18%; }
.col-amount { width: 19%; text-align: right; font-family: 'SF Mono', 'Courier New', monospace; }
.charges-table th.col-amount { text-align: right; }
.subtotal-row td { font-weight: 600; background: #f8fafc; border-top: 2px solid #e2e8f0; }
.fee-row td { color: #64748b; font-size: 11px; }
.payment-row .credit { color: #16a34a; }

.total-due-section { margin: 16px 20px; }
.total-box { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-radius: 6px; color: white; }
.total-label { display: flex; flex-direction: column; }
.total-text { font-size: 12px; font-weight: 500; }
.due-date { font-size: 10px; opacity: 0.85; margin-top: 1px; }
.total-amount { font-size: 24px; font-weight: 700; font-family: 'SF Mono', 'Courier New', monospace; }
.late-notice { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding: 8px 12px; background: #fef3c7; border-radius: 4px; font-size: 10px; color: #92400e; }

.payment-options { margin: 16px 20px; }
.options-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.option-card { display: flex; flex-direction: column; align-items: center; padding: 10px 8px; background: #f8fafc; border-radius: 6px; text-align: center; border: 1px solid #e2e8f0; }
.option-title { font-size: 10px; font-weight: 600; color: #334155; }
.option-desc { font-size: 9px; color: #64748b; margin-top: 1px; }

.bill-footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 16px 20px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
.footer-left { max-width: 60%; }
.footer-address, .footer-contact { margin: 0; font-size: 10px; color: #64748b; }
.footer-contact { margin-top: 2px; }
.footer-right { display: flex; gap: 16px; align-items: flex-end; }
.barcode-section { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
.barcode { display: flex; justify-content: flex-end; align-items: flex-end; height: 24px; gap: 1px; }
.bar { background: #1e293b; height: 100%; }
.barcode-number { display: block; font-size: 9px; color: #64748b; font-family: 'SF Mono', 'Courier New', monospace; margin-top: 2px; }
.barcode-svg { max-width: 120px; height: 35px; }
.custom-barcode-img { max-width: 120px; max-height: 40px; object-fit: contain; }

/* QR Code 样式 */
.qr-section { display: flex; flex-direction: column; align-items: center; }
.qr-canvas { width: 60px; height: 60px; border: 1px solid #e2e8f0; border-radius: 4px; }
.custom-qr-img { width: 60px; height: 60px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 4px; }
.qr-text { font-size: 8px; color: #64748b; margin-top: 2px; }

/* 水印样式 */
.watermark-layer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; overflow: hidden; z-index: 10; }
.watermark-pattern { position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 80px; transform: rotate(var(--watermark-angle, -30deg)); }
.watermark-pattern span { font-size: var(--watermark-size, 48px); color: var(--watermark-color, #cccccc); opacity: var(--watermark-opacity, 0.15); font-family: var(--watermark-font, Arial); white-space: nowrap; font-weight: bold; }
.bill { position: relative; overflow: hidden; }

.utility-bill-preview.minimal .bill { box-shadow: none; }
.utility-bill-preview.minimal .letterhead { background: white; color: #1e293b; border-bottom: 2px solid var(--primary, #0066cc); }
.utility-bill-preview.minimal .bill-type-badge { background: var(--primary, #0066cc); color: white; }
.utility-bill-preview.classic .letterhead { background: #1e293b; }
.utility-bill-preview.classic .total-box { background: #1e293b; }

/* 支付收据样式 */
.payment-receipt { width: 620px; background: white; font-family: 'Segoe UI', -apple-system, sans-serif; box-shadow: 0 1px 10px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; font-size: 12px; line-height: 1.5; color: #1e293b; position: relative; overflow: hidden; }

.receipt-letterhead { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 28px; background: linear-gradient(135deg, #10b981, #059669); color: white; }
.receipt-title-block { text-align: right; }
.paid-badge { display: inline-block; background: rgba(255,255,255,0.25); padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; margin-bottom: 6px; letter-spacing: 1px; }
.receipt-title-block h2 { margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; }

.receipt-confirmation { text-align: center; padding: 20px; background: #f0fdf4; border-bottom: 1px solid #bbf7d0; }
.conf-label { display: block; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.conf-number { display: block; font-size: 22px; font-weight: 700; color: #10b981; font-family: 'SF Mono', 'Courier New', monospace; letter-spacing: 1px; }

.receipt-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #e2e8f0; margin: 16px 20px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
.detail-section { background: white; padding: 14px; }
.detail-section h3 { margin: 0 0 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; color: #10b981; font-weight: 600; }
.detail-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #e2e8f0; }
.detail-row:last-child { border-bottom: none; }
.detail-row .label { color: #64748b; font-size: 11px; }
.detail-row .value { font-weight: 500; font-size: 11px; text-align: right; max-width: 60%; }

.receipt-bill-ref { margin: 16px 20px; padding: 14px; background: #f8fafc; border-radius: 6px; }
.receipt-bill-ref h3 { margin: 0 0 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; color: #64748b; font-weight: 600; }
.ref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ref-item { display: flex; flex-direction: column; }
.ref-item .label { font-size: 10px; color: #94a3b8; }
.ref-item .value { font-size: 12px; font-weight: 500; }

.receipt-amount-box { margin: 16px 20px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 6px; padding: 16px; color: white; }
.amount-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
.amount-row.total { border-top: 1px solid rgba(255,255,255,0.2); margin-top: 8px; padding-top: 12px; font-size: 14px; font-weight: 600; }
.paid-amount { font-size: 20px; font-weight: 700; }
.amount-row.balance { opacity: 0.85; font-size: 11px; }
.amount-row .zero { color: #bbf7d0; }

.receipt-footer { text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
.thank-you { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #10b981; }
.footer-info { margin: 0 0 4px; font-size: 10px; color: #64748b; }
.footer-note { margin: 0; font-size: 9px; color: #94a3b8; }

/* 手机尺寸 - 375px */
.utility-bill-preview.size-mobile .bill,
.utility-bill-preview.size-mobile .payment-receipt { width: 375px; font-size: 10px; }
.size-mobile .letterhead { padding: 16px; flex-direction: column; gap: 12px; }
.size-mobile .provider-details h1 { font-size: 14px; }
.size-mobile .document-title { text-align: left; }
.size-mobile .account-bar { grid-template-columns: 1fr 1fr; }
.size-mobile .bar-item { padding: 8px 10px; }
.size-mobile .bar-value { font-size: 11px; }
.size-mobile .content-grid { grid-template-columns: 1fr; margin: 12px 14px; }
.size-mobile .usage-section { margin: 12px 14px; padding: 10px; }
.size-mobile .usage-content { flex-direction: column; gap: 12px; }
.size-mobile .chart-container { height: 50px; }
.size-mobile .usage-stats { flex-direction: row; justify-content: space-around; }
.size-mobile .charges-section { margin: 12px 14px; }
.size-mobile .charges-table th, .size-mobile .charges-table td { padding: 6px 8px; font-size: 10px; }
.size-mobile .total-due-section { margin: 12px 14px; }
.size-mobile .total-box { padding: 12px 14px; }
.size-mobile .total-amount { font-size: 20px; }
.size-mobile .payment-options { margin: 12px 14px; }
.size-mobile .options-grid { grid-template-columns: 1fr 1fr; }
.size-mobile .bill-footer { padding: 12px 14px; flex-direction: column; gap: 10px; }
.size-mobile .footer-left { max-width: 100%; }
.size-mobile .receipt-letterhead { padding: 16px; flex-direction: column; gap: 12px; }
.size-mobile .receipt-details-grid { grid-template-columns: 1fr; margin: 12px 14px; }
.size-mobile .receipt-bill-ref { margin: 12px 14px; }
.size-mobile .ref-grid { grid-template-columns: 1fr; gap: 8px; }
.size-mobile .receipt-amount-box { margin: 12px 14px; }
.size-mobile .receipt-footer { padding: 14px; }

/* 电脑尺寸 - 900px */
.utility-bill-preview.size-desktop .bill,
.utility-bill-preview.size-desktop .payment-receipt { width: 900px; font-size: 14px; }
.size-desktop .letterhead { padding: 32px 36px; }
.size-desktop .provider-details h1 { font-size: 22px; }
.size-desktop .bar-item { padding: 16px 18px; }
.size-desktop .bar-value { font-size: 15px; }
.size-desktop .content-grid { margin: 24px 28px; }
.size-desktop .customer-panel, .size-desktop .meter-panel { padding: 20px; }
.size-desktop .customer-name { font-size: 18px; }
.size-desktop .usage-section { margin: 24px 28px; padding: 20px; }
.size-desktop .chart-container { height: 100px; }
.size-desktop .stat-value { font-size: 20px; }
.size-desktop .charges-section { margin: 24px 28px; }
.size-desktop .charges-table th, .size-desktop .charges-table td { padding: 12px 14px; font-size: 13px; }
.size-desktop .total-due-section { margin: 24px 28px; }
.size-desktop .total-box { padding: 24px 28px; }
.size-desktop .total-amount { font-size: 32px; }
.size-desktop .payment-options { margin: 24px 28px; }
.size-desktop .bill-footer { padding: 24px 28px; }
.size-desktop .receipt-letterhead { padding: 32px 36px; }
.size-desktop .receipt-details-grid { margin: 24px 28px; }
.size-desktop .detail-section { padding: 20px; }
.size-desktop .receipt-bill-ref { margin: 24px 28px; padding: 20px; }
.size-desktop .receipt-amount-box { margin: 24px 28px; padding: 24px; }
.size-desktop .paid-amount { font-size: 28px; }
.size-desktop .receipt-footer { padding: 28px; }

/* 原尺寸 */
.utility-bill-preview.size-original .bill,
.utility-bill-preview.size-original .payment-receipt { width: 620px; }
</style>
