<template>
  <div class="invoice-preview" :class="[store.settings.template, `size-${previewSize}`]" :style="invoiceStyle">
    <div class="invoice-container" ref="invoiceContainer">
      <!-- 水印 -->
      <div v-if="store.designSettings.watermarkEnabled" class="watermark-layer">
        <span 
          class="watermark-text"
          :style="{
            color: store.designSettings.watermarkColor,
            opacity: store.designSettings.watermarkOpacity / 100,
            fontSize: store.designSettings.watermarkSize + 'px',
            transform: `rotate(${store.designSettings.watermarkAngle}deg)`,
            fontFamily: store.designSettings.watermarkFontFamily
          }"
        >{{ store.designSettings.watermarkText || 'INVOICE' }}</span>
      </div>
      <!-- Header -->
      <div class="invoice-header" :style="store.settings.template === 'modern' ? { background: metaGridBackground } : null">
        <div class="header-top">
          <div class="company-brand">
            <img v-if="store.settings.showLogo && store.company.logo" :src="store.company.logo" alt="Logo" class="company-logo" />
            <div class="company-identity">
              <h1>{{ store.company.name }}</h1>
              <div class="company-contact">
                <span v-if="store.company.phone" class="contact-item">
                  <SvgIcon name="phone" :size="11" /> {{ store.company.phone }}
                </span>
                <span v-if="store.company.email" class="contact-item">
                  <SvgIcon name="mail" :size="11" /> {{ store.company.email }}
                </span>
                <span v-if="store.company.website" class="contact-item">
                  <SvgIcon name="globe" :size="11" /> {{ store.company.website }}
                </span>
              </div>
            </div>
          </div>
          <div class="invoice-title-badge">
            <h2>{{ t('invoice') }}</h2>
            <div class="invoice-badge" :class="store.status">{{ statusLabels[store.status] }}</div>
          </div>
        </div>
        <div class="header-details">
          <div class="company-address">
            <p v-if="store.company.address">{{ store.company.address }}</p>
            <p v-if="store.company.city">{{ store.company.city }}<span v-if="store.company.state">, {{ store.company.state }}</span> {{ store.company.zip }}</p>
            <p v-if="store.company.country">{{ store.company.country }}</p>
            <p v-if="store.company.taxId" class="tax-id">{{ t('taxId') }}: {{ store.company.taxId }}</p>
          </div>
          <div class="invoice-meta-grid">
            <div class="meta-card">
              <span class="meta-label">{{ t('invoiceNumber') }}</span>
              <span class="meta-value highlight">{{ store.invoiceNumber }}</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">{{ t('issueDate') }}</span>
              <span class="meta-value">{{ formatDate(store.invoiceDate) }}</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">{{ t('dueDate') }}</span>
              <span class="meta-value accent">{{ formatDate(store.dueDate) }}</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">{{ t('currency') }}</span>
              <span class="meta-value">{{ store.currency }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing Section -->
      <div class="billing-section">
        <div class="billing-card bill-to">
          <div class="billing-icon"><SvgIcon name="send" :size="20" /></div>
          <h3>{{ t('billTo') }}</h3>
          <p class="primary-name">{{ store.client.name }}</p>
          <p v-if="store.client.company" class="company-name">{{ store.client.company }}</p>
          <p v-if="store.client.address">{{ store.client.address }}</p>
          <p v-if="store.client.city">{{ store.client.city }}, {{ store.client.state }} {{ store.client.zip }}</p>
          <p v-if="store.client.country">{{ store.client.country }}</p>
          <p v-if="store.client.phone" class="contact-info"><SvgIcon name="phone" :size="12" /> {{ store.client.phone }}</p>
          <p v-if="store.client.email" class="contact-info"><SvgIcon name="mail" :size="12" /> {{ store.client.email }}</p>
          <p v-if="store.client.taxId" class="tax-info">{{ t('taxId') }}: {{ store.client.taxId }}</p>
        </div>
        
        <div v-if="store.settings.showBankDetails" class="billing-card payment-details">
          <div class="billing-icon"><SvgIcon name="bank" :size="20" /></div>
          <h3>{{ t('paymentInfo') }}</h3>
          <div class="payment-grid">
            <div class="payment-item">
              <span class="payment-label">{{ t('bankName') }}</span>
              <span class="payment-value">{{ store.paymentInfo.bankName }}</span>
            </div>
            <div class="payment-item">
              <span class="payment-label">{{ t('accountNumber') }}</span>
              <span class="payment-value">{{ store.paymentInfo.accountNumber }}</span>
            </div>
            <div class="payment-item" v-if="store.paymentInfo.routingNumber">
              <span class="payment-label">{{ t('routingNumber') }}</span>
              <span class="payment-value">{{ store.paymentInfo.routingNumber }}</span>
            </div>
            <div class="payment-item" v-if="store.paymentInfo.swiftCode">
              <span class="payment-label">{{ t('swiftBic') }}</span>
              <span class="payment-value">{{ store.paymentInfo.swiftCode }}</span>
            </div>
            <div class="payment-item" v-if="store.paymentInfo.iban">
              <span class="payment-label">IBAN</span>
              <span class="payment-value">{{ store.paymentInfo.iban }}</span>
            </div>
            <div class="payment-item" v-if="store.paymentInfo.paypalEmail">
              <span class="payment-label">PayPal</span>
              <span class="payment-value">{{ store.paymentInfo.paypalEmail }}</span>
            </div>
            <div class="payment-item full-width" v-if="store.paymentInfo.otherPaymentMethod">
              <span class="payment-label">{{ t('otherPayment') }}</span>
              <span class="payment-value">{{ store.paymentInfo.otherPaymentMethod }}</span>
            </div>
          </div>
          <p v-if="store.paymentInfo.paymentNotes" class="payment-notes">{{ store.paymentInfo.paymentNotes }}</p>
        </div>
      </div>

      <!-- Items Table -->
      <div class="items-section">
        <h3 class="section-title">{{ t('invoiceItems') }}</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th class="col-no">#</th>
              <th class="col-sku">SKU</th>
              <th class="col-desc">{{ t('description') }}</th>
              <th class="col-qty">{{ t('qty') }}</th>
              <th class="col-unit">{{ t('unit') }}</th>
              <th class="col-price">{{ t('unitPrice') }}</th>
              <th v-if="hasDiscount" class="col-discount">{{ t('discount') }}</th>
              <th v-if="store.settings.showTaxBreakdown" class="col-tax">{{ t('tax') }}</th>
              <th class="col-amount">{{ t('amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in store.items" :key="item.id">
              <td class="center">{{ index + 1 }}</td>
              <td class="sku">{{ item.sku || '-' }}</td>
              <td class="description">
                <span class="item-name">{{ item.description }}</span>
                <span v-if="item.category" class="item-category">{{ item.category }}</span>
                <span v-if="item.notes" class="item-notes">{{ item.notes }}</span>
              </td>
              <td class="center">{{ item.quantity }}</td>
              <td class="center unit">{{ getUnitLabel(item.unit) }}</td>
              <td class="right">{{ store.formatCurrency(item.unitPrice) }}</td>
              <td v-if="hasDiscount" class="center">
                <span v-if="item.discount > 0" class="discount-badge">-{{ item.discount }}%</span>
                <span v-else>-</span>
              </td>
              <td v-if="store.settings.showTaxBreakdown" class="center">{{ item.tax }}%</td>
              <td class="right amount">{{ store.formatCurrency(calculateItemAmount(item)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Section -->
      <div class="summary-section">
        <div class="summary-notes" v-if="store.notes || store.terms">
          <div v-if="store.notes" class="notes-box">
            <h4><SvgIcon name="note" :size="14" /> {{ t('notes') }}</h4>
            <p>{{ store.notes }}</p>
          </div>
          <div v-if="store.terms" class="terms-box">
            <h4><SvgIcon name="clipboard" :size="14" /> {{ t('termsConditions') }}</h4>
            <p>{{ store.terms }}</p>
          </div>
        </div>
        
        <div class="totals-section">
          <div class="totals-box">
            <div class="total-row">
              <span>{{ t('subtotal') }}</span>
              <span>{{ store.formatCurrency(store.subtotal) }}</span>
            </div>
            <div v-if="store.discountTotal > 0" class="total-row discount">
              <span>{{ t('discount') }}</span>
              <span class="discount-amount">-{{ store.formatCurrency(store.discountTotal) }}</span>
            </div>
            <div class="total-row tax">
              <span>{{ t('tax') }} ({{ averageTaxRate.toFixed(1) }}%)</span>
              <span>{{ store.formatCurrency(store.taxTotal) }}</span>
            </div>
            <div class="total-row grand-total">
              <span>{{ t('totalDue') }}</span>
              <span class="grand-total-amount">{{ store.formatCurrency(store.total) }}</span>
            </div>
            <div class="amount-in-words">
              <span class="words-label">{{ t('amountInWords') }}:</span>
              <span class="words-value">{{ numberToWords(store.total) }} {{ store.currency }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- QR Code & Payment Info -->
      <div v-if="store.settings.showBankDetails" class="payment-section">
        <div class="payment-reminder">
          <div class="reminder-icon"><SvgIcon name="alert" :size="18" /></div>
          <div class="reminder-text">
            <strong>{{ t('paymentReminder') }}</strong>
            <p>{{ t('paymentReminderText') }} {{ formatDate(store.dueDate) }}. {{ t('includeInvoice') }} <strong>{{ store.invoiceNumber }}</strong> {{ t('inPaymentRef') }}</p>
          </div>
        </div>
      </div>

      <!-- 条形码/二维码区域 -->
      <div v-if="store.barcodeSettings.showBarcode || store.barcodeSettings.showQRCode" class="barcode-section">
        <div class="barcode-container">
          <template v-if="store.barcodeSettings.useCustomBarcode">
            <img v-if="store.barcodeSettings.showBarcode && store.barcodeSettings.customBarcodeImage" 
                 :src="store.barcodeSettings.customBarcodeImage" 
                 alt="条形码" 
                 class="custom-barcode-img" />
            <img v-if="store.barcodeSettings.showQRCode && store.barcodeSettings.customQRImage" 
                 :src="store.barcodeSettings.customQRImage" 
                 alt="二维码" 
                 class="custom-qr-img" />
          </template>
          <template v-else>
            <div v-if="store.barcodeSettings.showBarcode" class="barcode-wrapper">
              <svg ref="barcodeRef"></svg>
            </div>
            <div v-if="store.barcodeSettings.showQRCode" class="qr-wrapper">
              <canvas ref="qrRef"></canvas>
            </div>
          </template>
        </div>
      </div>

      <!-- Footer -->
      <div class="invoice-footer">
        <div class="footer-content">
          <div class="footer-left">
            <p class="thank-you">{{ t('thankYou') }}</p>
            <p v-if="store.company.website" class="website"><SvgIcon name="globe" :size="12" /> {{ store.company.website }}</p>
          </div>
          <div class="footer-right">
            <p class="page-info">{{ t('page') }} 1 {{ t('of') }} 1</p>
            <p class="generated">{{ t('generated') }}: {{ currentDateTime }}</p>
          </div>
        </div>
        <div class="footer-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useInvoiceStore, type InvoiceItem } from '@/stores/invoice'
import SvgIcon from '@/components/icons/SvgIcons.vue'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import { mix } from '@/utils/color'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useInvoiceStore()
const invoiceContainer = ref()
const barcodeRef = ref<SVGElement>()
const qrRef = ref<HTMLCanvasElement>()

// 条形码内容
const barcodeContent = computed(() => {
  return store.barcodeSettings.barcodeContent || store.invoiceNumber
})

// 渲染条形码
const renderBarcode = () => {
  if (!barcodeRef.value || store.barcodeSettings.useCustomBarcode) return
  try {
    JsBarcode(barcodeRef.value, barcodeContent.value, {
      format: 'CODE128',
      width: 1.5,
      height: 40,
      displayValue: true,
      fontSize: 10,
      margin: 5,
      background: 'transparent'
    })
  } catch (e) {
    console.error('Barcode render error:', e)
  }
}

// 渲染二维码
const renderQRCode = async () => {
  if (!qrRef.value || store.barcodeSettings.useCustomBarcode) return
  try {
    await QRCode.toCanvas(qrRef.value, barcodeContent.value, {
      width: 80,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (e) {
    console.error('QR render error:', e)
  }
}

// 监听变化重新渲染
watch([barcodeContent, () => store.barcodeSettings.showBarcode, () => store.barcodeSettings.showQRCode, () => store.barcodeSettings.useCustomBarcode], () => {
  // 使用双重nextTick确保DOM完全渲染后再进行操作
  nextTick(() => {
    nextTick(() => {
      if (store.barcodeSettings.showBarcode && !store.barcodeSettings.useCustomBarcode && barcodeContent.value) {
        renderBarcode()
      }
      if (store.barcodeSettings.showQRCode && !store.barcodeSettings.useCustomBarcode && barcodeContent.value) {
        renderQRCode()
      }
    })
  })
}, { immediate: true })

onMounted(() => {
  // 延迟渲染以确保DOM完全准备好
  setTimeout(() => {
    if (store.barcodeSettings.showBarcode && !store.barcodeSettings.useCustomBarcode) {
      renderBarcode()
    }
    if (store.barcodeSettings.showQRCode && !store.barcodeSettings.useCustomBarcode) {
      renderQRCode()
    }
  }, 100)
})

// 计算发票样式
const invoiceStyle = computed(() => ({
  '--primary-color': store.settings.primaryColor,
  fontFamily: store.designSettings.fontFamily,
  color: store.designSettings.textColor,
  border: store.designSettings.borderEnabled 
    ? `${store.designSettings.borderWidth}px ${store.designSettings.borderStyle} ${store.designSettings.borderColor}` 
    : 'none'
}))

const metaGridBackground = computed(() => {
  const primary = store.settings.primaryColor || '#2563eb'
  const mixed = mix(primary, '#1e3a5f', 0.8)
  return `linear-gradient(135deg, ${primary}, ${mixed})`
})

// 多语言翻译
const translations = {
  en: {
    invoice: 'INVOICE',
    taxId: 'Tax ID',
    invoiceNumber: 'Invoice Number',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    currency: 'Currency',
    billTo: 'Bill To',
    paymentInfo: 'Payment Information',
    bankName: 'Bank Name',
    accountNumber: 'Account Number',
    routingNumber: 'Routing Number',
    swiftBic: 'SWIFT/BIC',
    otherPayment: 'Other Payment',
    invoiceItems: 'Invoice Items',
    description: 'Description',
    qty: 'Qty',
    unitPrice: 'Unit Price',
    discount: 'Discount',
    tax: 'Tax',
    amount: 'Amount',
    notes: 'Notes',
    termsConditions: 'Terms & Conditions',
    subtotal: 'Subtotal',
    totalDue: 'Total Due',
    amountInWords: 'Amount in words',
    paymentReminder: 'Payment Reminder',
    paymentReminderText: 'Please make payment by',
    includeInvoice: 'Include invoice number',
    inPaymentRef: 'in payment reference.',
    thankYou: 'Thank you for your business!',
    page: 'Page',
    of: 'of',
    generated: 'Generated',
    draft: 'DRAFT',
    sent: 'SENT',
    paid: 'PAID',
    overdue: 'OVERDUE',
    cancelled: 'CANCELLED',
    unit: 'Unit'
  },
  zh: {
    invoice: '发票',
    taxId: '税号',
    invoiceNumber: '发票号码',
    issueDate: '开票日期',
    dueDate: '付款日期',
    currency: '货币',
    billTo: '收款方',
    paymentInfo: '付款信息',
    bankName: '银行名称',
    accountNumber: '账户号码',
    routingNumber: '路由号码',
    swiftBic: 'SWIFT/BIC',
    otherPayment: '其他付款方式',
    invoiceItems: '发票项目',
    description: '描述',
    qty: '数量',
    unitPrice: '单价',
    discount: '折扣',
    tax: '税率',
    amount: '金额',
    notes: '备注',
    termsConditions: '条款与条件',
    subtotal: '小计',
    totalDue: '应付总额',
    amountInWords: '大写金额',
    paymentReminder: '付款提醒',
    paymentReminderText: '请在以下日期前付款',
    includeInvoice: '请在付款备注中注明发票号',
    inPaymentRef: '。',
    thankYou: '感谢您的惠顾！',
    page: '第',
    of: '页，共',
    generated: '生成时间',
    draft: '草稿',
    sent: '已发送',
    paid: '已付款',
    overdue: '已逾期',
    cancelled: '已取消',
    unit: '单位'
  }
}

const t = (key: keyof typeof translations.en) => {
  return translations[store.settings.language]?.[key] || translations.en[key]
}

// 单位标签映射
const unitLabels: Record<string, { en: string; zh: string }> = {
  pcs: { en: 'pcs', zh: '件' },
  unit: { en: 'unit', zh: '单位' },
  hour: { en: 'hr', zh: '小时' },
  day: { en: 'day', zh: '天' },
  month: { en: 'mo', zh: '月' },
  year: { en: 'yr', zh: '年' },
  kg: { en: 'kg', zh: '公斤' },
  lot: { en: 'lot', zh: '批' },
  set: { en: 'set', zh: '套' },
  box: { en: 'box', zh: '箱' },
  package: { en: 'pkg', zh: '包' },
  project: { en: 'proj', zh: '项目' },
  service: { en: 'svc', zh: '服务' },
  license: { en: 'lic', zh: '许可' },
  serving: { en: 'srv', zh: '份' },
  bottle: { en: 'btl', zh: '瓶' },
  visit: { en: 'visit', zh: '次' },
  test: { en: 'test', zh: '检测' },
  scan: { en: 'scan', zh: '扫描' },
  prescription: { en: 'Rx', zh: '处方' },
  semester: { en: 'sem', zh: '学期' },
  session: { en: 'sess', zh: '场次' },
  inspection: { en: 'insp', zh: '检查' },
  plan: { en: 'plan', zh: '计划' }
}

const getUnitLabel = (unit: string) => {
  const label = unitLabels[unit]
  if (label) {
    return store.settings.language === 'zh' ? label.zh : label.en
  }
  return unit
}

const statusLabels = computed(() => ({
  draft: t('draft'),
  sent: t('sent'),
  paid: t('paid'),
  overdue: t('overdue'),
  cancelled: t('cancelled')
}))

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const currentDateTime = computed(() => {
  return new Date().toLocaleString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  })
})

const hasDiscount = computed(() => {
  return store.items.some(item => item.discount > 0)
})

const averageTaxRate = computed(() => {
  if (store.items.length === 0) return 0
  const totalTax = store.items.reduce((sum, item) => sum + item.tax, 0)
  return totalTax / store.items.length
})

const calculateItemAmount = (item: InvoiceItem) => {
  const subtotal = item.quantity * item.unitPrice
  const discountAmount = subtotal * (item.discount / 100)
  return subtotal - discountAmount
}

// Number to words conversion
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const scales = ['', 'Thousand', 'Million', 'Billion']

  if (num === 0) return 'Zero'
  if (num < 0) return 'Negative ' + numberToWords(-num)

  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)

  const convertGroup = (n: number): string => {
    if (n === 0) return ''
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertGroup(n % 100) : '')
  }

  let result = ''
  let scaleIndex = 0
  let n = intPart

  while (n > 0) {
    const group = n % 1000
    if (group !== 0) {
      const groupWords = convertGroup(group)
      result = groupWords + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + (result ? ' ' + result : '')
    }
    n = Math.floor(n / 1000)
    scaleIndex++
  }

  if (decPart > 0) {
    result += ' and ' + decPart + '/100'
  }

  return result || 'Zero'
}

// Expose for print mode
const isPrintMode = ref(false)
defineExpose({
  enablePrintMode: () => { isPrintMode.value = true },
  disablePrintMode: () => { isPrintMode.value = false }
})
</script>

<style scoped>
.invoice-preview {
  width: 210mm;
  min-height: 297mm;
  background: white;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  color: #1f2937;
  --primary-color: #2563eb;
  position: relative;
  overflow: hidden;
}

.invoice-container {
  padding: 36px 40px;
  position: relative;
}

/* 水印 */
.watermark-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.watermark-text {
  font-weight: bold;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 4px;
}

/* Header */
.invoice-header {
  margin-bottom: 28px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);
}

.company-brand {
  display: flex;
  gap: 14px;
  align-items: center;
}

.company-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.company-identity h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
}

.company-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.contact-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #6b7280;
}

.invoice-title-badge {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.invoice-title-badge h2 {
  font-size: 28px;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
  letter-spacing: 4px;
  line-height: 1;
}

.invoice-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.invoice-badge.draft { background: #f3f4f6; color: #6b7280; }
.invoice-badge.sent { background: #dbeafe; color: #1d4ed8; }
.invoice-badge.paid { background: #d1fae5; color: #059669; }
.invoice-badge.overdue { background: #fee2e2; color: #dc2626; }
.invoice-badge.cancelled { background: #e5e7eb; color: #9ca3af; text-decoration: line-through; }

.header-details {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

.company-address {
  flex: 1;
}

.company-address p {
  margin: 2px 0;
  color: #6b7280;
  font-size: 11px;
  line-height: 1.5;
}

.company-address .tax-id {
  margin-top: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 10px;
}

.invoice-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  background: v-bind(metaGridBackground);
  padding: 14px 16px;
  border-radius: 10px;
  min-width: 240px;
}

.meta-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 9px;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.meta-value.highlight {
  color: #fef08a;
}

.meta-value.accent {
  color: #86efac;
}

/* Billing Section */
.billing-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 28px;
}

.billing-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  position: relative;
}

.billing-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 20px;
  opacity: 0.5;
}

.billing-card h3 {
  font-size: 11px;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.billing-card .primary-name {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.billing-card .company-name {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  margin: 0 0 8px 0;
}

.billing-card p {
  margin: 3px 0;
  color: #6b7280;
  font-size: 11px;
}

.billing-card .contact-info {
  margin-top: 8px;
}

.billing-card .tax-info {
  margin-top: 8px;
  font-weight: 500;
  color: #374151;
}

.payment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.payment-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.payment-item.full-width {
  grid-column: span 2;
}

.payment-label {
  font-size: 10px;
  color: #9ca3af;
  text-transform: uppercase;
}

.payment-value {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  font-family: 'SF Mono', 'Monaco', monospace;
}

.payment-notes {
  margin-top: 12px;
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
  padding-top: 8px;
  border-top: 1px dashed #e5e7eb;
}

/* Items Section */
.items-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 12px;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.items-table th {
  background: var(--primary-color);
  color: white;
  padding: 14px 16px;
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.items-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.items-table tbody tr:last-child td {
  border-bottom: none;
}

.items-table tbody tr:nth-child(even) {
  background: #f9fafb;
}

.items-table .center { text-align: center; }
.items-table .right { text-align: right; }

.col-no { width: 4%; }
.col-sku { width: 10%; }
.col-desc { width: 28%; }
.col-qty { width: 7%; }
.col-unit { width: 7%; }
.col-price { width: 12%; }
.col-discount { width: 8%; }
.col-tax { width: 8%; }
.col-amount { width: 12%; }

.sku {
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 10px;
  color: #6b7280;
}

.unit {
  font-size: 11px;
  color: #6b7280;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
  display: block;
}

.item-category {
  display: block;
  font-size: 10px;
  color: #9ca3af;
  margin-top: 2px;
}

.item-notes {
  display: block;
  font-size: 10px;
  color: #6b7280;
  font-style: italic;
  margin-top: 2px;
}

.discount-badge {
  display: inline-block;
  background: #fef3c7;
  color: #d97706;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.amount {
  font-weight: 600;
  color: #1f2937;
}

/* Summary Section */
.summary-section {
  display: flex;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 24px;
}

.summary-notes {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notes-box, .terms-box {
  background: #f9fafb;
  border-radius: 10px;
  padding: 16px;
  border-left: 3px solid var(--primary-color);
}

.notes-box h4, .terms-box h4 {
  font-size: 11px;
  color: var(--primary-color);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.notes-box p, .terms-box p {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

/* Totals */
.totals-section {
  width: 280px;
  min-width: 280px;
}

.totals-box {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 13px;
  border-bottom: 1px dashed #e5e7eb;
}

.total-row:last-of-type {
  border-bottom: none;
}

.total-row.discount .discount-amount {
  color: #059669;
  font-weight: 500;
}

.total-row.grand-total {
  border-top: 2px solid var(--primary-color);
  border-bottom: none;
  margin-top: 8px;
  padding-top: 16px;
}

.grand-total-amount {
  font-size: 22px;
  font-weight: 800;
  color: var(--primary-color);
}

.amount-in-words {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 10px;
}

.words-label {
  color: #9ca3af;
  display: block;
  margin-bottom: 4px;
}

.words-value {
  color: #4b5563;
  font-style: italic;
}

/* Payment Section */
.payment-section {
  margin-bottom: 24px;
}

.payment-reminder {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 10px;
  padding: 16px;
}

.reminder-icon {
  font-size: 20px;
}

.reminder-text strong {
  display: block;
  color: #92400e;
  font-size: 12px;
  margin-bottom: 4px;
}

.reminder-text p {
  margin: 0;
  color: #a16207;
  font-size: 11px;
  line-height: 1.5;
}

/* Footer */
.invoice-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}

.footer-left .thank-you {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 4px 0;
}

.footer-left .website {
  font-size: 11px;
  color: #6b7280;
  margin: 0;
}

.footer-right {
  text-align: right;
}

.footer-right p {
  font-size: 10px;
  color: #9ca3af;
  margin: 2px 0;
}

.footer-bar {
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), transparent);
  border-radius: 2px;
}

/* Template Variations */
.modern .invoice-header {
  background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 70%, black));
  margin: -36px -40px 32px -40px;
  padding: 36px 40px 28px;
  border-radius: 0 0 0 0;
}

.modern .header-top {
  border-bottom-color: rgba(255,255,255,0.3);
}

.modern .company-identity h1,
.modern .invoice-title-badge h2 {
  color: white;
}

.modern .company-address p,
.modern .contact-item {
  color: rgba(255,255,255,0.8);
}

.modern .company-address .tax-id {
  color: rgba(255,255,255,0.95);
}

.modern .invoice-badge {
  background: rgba(255,255,255,0.2);
  color: white;
}

.modern .invoice-meta-grid {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
}

.minimal .header-top {
  border-bottom: 1px solid #e5e7eb;
}

.minimal .invoice-meta-grid {
  background: #f9fafb;
}

.minimal .meta-label {
  color: #6b7280;
}

.minimal .meta-value {
  color: #1f2937;
}

.minimal .meta-value.highlight,
.minimal .meta-value.accent {
  color: var(--primary-color);
}

.minimal .items-table th {
  background: #f9fafb;
  color: #374151;
}

.minimal .totals-box {
  background: white;
  border: 1px solid #e5e7eb;
}

.corporate .header-top {
  border-bottom: 3px solid #1f2937;
}

.corporate .invoice-title-badge h2 {
  color: #1f2937;
}

.corporate .invoice-meta-grid {
  background: #0f172a;
}

.corporate .items-table th {
  background: #1f2937;
}

.creative .invoice-header {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  margin: -36px -40px 32px -40px;
  padding: 36px 40px 28px;
  border-radius: 0 0 24px 24px;
}

.creative .header-top {
  border-bottom-color: rgba(255,255,255,0.3);
}

.creative .company-identity h1,
.creative .invoice-title-badge h2 {
  color: white;
}

.creative .company-address p,
.creative .contact-item {
  color: rgba(255,255,255,0.8);
}

.creative .company-address .tax-id {
  color: rgba(255,255,255,0.95);
}

.creative .invoice-badge {
  background: rgba(255,255,255,0.2);
  color: white;
}

.creative .invoice-meta-grid {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}

.creative .billing-card {
  border-radius: 16px;
}

.creative .items-table {
  border-radius: 16px;
}

/* Classic template - 经典商务风格 */
.classic .invoice-preview {
  background: #fffbf5;
}
.classic .header-top {
  border-bottom: 3px double #1f2937;
  padding-bottom: 16px;
}
.classic .company-identity h1 {
  font-family: 'Georgia', 'Times New Roman', serif;
  letter-spacing: 1px;
}
.classic .invoice-title-badge h2 {
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #1f2937;
  letter-spacing: 6px;
}
.classic .invoice-badge {
  border-radius: 4px;
}
.classic .invoice-meta-grid {
  background: #374151;
  border-radius: 0;
}
.classic .billing-card {
  border-radius: 0;
  border: 1px solid #d1d5db;
  background: white;
}
.classic .items-table {
  border-radius: 0;
  border: 1px solid #d1d5db;
}
.classic .items-table th {
  background: #374151;
}
.classic .notes-box, .classic .terms-box {
  border-radius: 0;
  border-left: 4px solid #374151;
  background: white;
}
.classic .totals-box {
  border-radius: 0;
  border: 2px solid #374151;
  background: white;
}
.classic .footer-bar {
  background: #374151;
  border-radius: 0;
  height: 3px;
}

/* Corporate template - 正式企业风格 */
.corporate .invoice-preview {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}
.corporate .company-identity h1 {
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
}
.corporate .invoice-title-badge h2 {
  font-weight: 900;
  letter-spacing: 4px;
}
.corporate .invoice-badge {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 10px;
}
.corporate .billing-card {
  border: 1px solid #e5e7eb;
  background: white;
}
.corporate .section-title {
  color: #0f172a;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 8px;
  margin-bottom: 16px;
}
.corporate .totals-box {
  background: #0f172a;
  color: white;
  border: none;
}
.corporate .totals-box .total-row {
  border-color: rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.9);
}
.corporate .totals-box .grand-total {
  border-top-color: white;
}
.corporate .totals-box .grand-total-amount {
  color: #22c55e;
}
.corporate .totals-box .words-label {
  color: rgba(255,255,255,0.5);
}
.corporate .totals-box .words-value {
  color: rgba(255,255,255,0.7);
}
.corporate .footer-bar {
  height: 6px;
  background: linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

/* Creative template - 创意设计风格 (additional) */
.creative .invoice-preview {
  background: linear-gradient(180deg, #faf5ff 0%, #f3e8ff 100%);
}
.creative .billing-card {
  background: white;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.1);
}
.creative .billing-card h3 {
  color: #7c3aed;
}
.creative .items-table th {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
}
.creative .section-title {
  color: #7c3aed;
}
.creative .notes-box, .creative .terms-box {
  border-left-color: #a78bfa;
  background: white;
}
.creative .notes-box h4, .creative .terms-box h4 {
  color: #7c3aed;
}
.creative .totals-box {
  background: white;
  border: 2px solid #e9d5ff;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.1);
}
.creative .totals-box .grand-total {
  border-top-color: #c084fc;
}
.creative .totals-box .grand-total-amount {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.creative .payment-reminder {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: none;
  border-radius: 16px;
}
.creative .footer-bar {
  height: 6px;
  background: linear-gradient(90deg, #7c3aed, #a78bfa, #c084fc, #e879f9);
  border-radius: 3px;
}

/* ==================== 响应式预览尺寸 ==================== */

/* 手机尺寸 - 375px 宽度，重新设计布局 */
.invoice-preview.size-mobile {
  width: 375px;
  min-height: auto;
  font-size: 11px;
}

.size-mobile .invoice-container {
  padding: 16px;
}

.size-mobile .invoice-header {
  margin-bottom: 16px;
}

.size-mobile .header-top {
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.size-mobile .company-brand {
  gap: 10px;
}

.size-mobile .company-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.size-mobile .company-identity h1 {
  font-size: 16px;
  margin-bottom: 4px;
}

.size-mobile .company-contact {
  flex-direction: column;
  gap: 4px;
}

.size-mobile .contact-item {
  font-size: 9px;
}

.size-mobile .invoice-title-badge {
  align-items: flex-start;
  width: 100%;
}

.size-mobile .invoice-title-badge h2 {
  font-size: 20px;
}

.size-mobile .invoice-badge {
  font-size: 9px;
  padding: 3px 8px;
}

.size-mobile .header-details {
  flex-direction: column;
  gap: 12px;
}

.size-mobile .company-address p {
  font-size: 10px;
  margin: 2px 0;
}

.size-mobile .invoice-meta-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.size-mobile .meta-card {
  padding: 8px;
}

.size-mobile .meta-label {
  font-size: 9px;
}

.size-mobile .meta-value {
  font-size: 12px;
}

.size-mobile .billing-section {
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.size-mobile .billing-card {
  padding: 12px;
}

.size-mobile .billing-card h3 {
  font-size: 12px;
  margin-bottom: 8px;
}

.size-mobile .billing-icon {
  width: 28px;
  height: 28px;
}

.size-mobile .primary-name {
  font-size: 13px;
}

.size-mobile .billing-card p {
  font-size: 10px;
}

.size-mobile .payment-grid {
  grid-template-columns: 1fr;
  gap: 6px;
}

.size-mobile .payment-label {
  font-size: 9px;
}

.size-mobile .payment-value {
  font-size: 11px;
}

/* 手机尺寸表格 - 卡片式布局 */
.size-mobile .items-section {
  margin-bottom: 16px;
}

.size-mobile .section-title {
  font-size: 13px;
  margin-bottom: 10px;
}

.size-mobile .items-table {
  display: block;
}

.size-mobile .items-table thead {
  display: none;
}

.size-mobile .items-table tbody {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.size-mobile .items-table tr {
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #e5e7eb;
}

.size-mobile .items-table td {
  padding: 2px 0;
  text-align: left !important;
  border: none;
}

.size-mobile .items-table td.description {
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 4px;
}

.size-mobile .items-table td.amount {
  font-size: 13px;
  color: #2563eb;
  font-weight: 700;
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px dashed #d1d5db;
}

.size-mobile .items-table td:before {
  content: attr(data-label);
  font-size: 9px;
  color: #6b7280;
  display: block;
}

.size-mobile .summary-section {
  flex-direction: column;
  gap: 12px;
}

.size-mobile .summary-notes {
  width: 100%;
}

.size-mobile .notes-box,
.size-mobile .terms-box {
  padding: 10px;
  font-size: 10px;
}

.size-mobile .notes-box h4,
.size-mobile .terms-box h4 {
  font-size: 11px;
}

.size-mobile .totals-section {
  width: 100%;
}

.size-mobile .totals-box {
  padding: 12px;
}

.size-mobile .total-row {
  font-size: 11px;
  padding: 6px 0;
}

.size-mobile .grand-total {
  font-size: 14px !important;
}

.size-mobile .grand-total-amount {
  font-size: 18px !important;
}

.size-mobile .amount-in-words {
  font-size: 9px;
  padding: 8px;
  margin-top: 8px;
}

.size-mobile .payment-section {
  margin: 12px 0;
}

.size-mobile .payment-reminder {
  padding: 10px;
  flex-direction: column;
  gap: 8px;
}

.size-mobile .reminder-text strong {
  font-size: 11px;
}

.size-mobile .reminder-text p {
  font-size: 10px;
}

.size-mobile .invoice-footer {
  padding-top: 12px;
}

.size-mobile .footer-content {
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.size-mobile .footer-left,
.size-mobile .footer-right {
  text-align: center;
}

.size-mobile .thank-you {
  font-size: 12px;
}

.size-mobile .footer-right p {
  font-size: 9px;
}

/* 电脑尺寸 - 横向宽屏布局 */
.invoice-preview.size-desktop {
  width: 900px;
  min-height: auto;
  font-size: 13px;
}

.size-desktop .invoice-container {
  padding: 32px 40px;
}

.size-desktop .header-top {
  align-items: center;
}

.size-desktop .company-logo {
  width: 64px;
  height: 64px;
}

.size-desktop .company-identity h1 {
  font-size: 24px;
}

.size-desktop .invoice-title-badge h2 {
  font-size: 32px;
}

.size-desktop .header-details {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 24px;
  align-items: start;
}

.size-desktop .invoice-meta-grid {
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.size-desktop .meta-card {
  padding: 14px;
}

.size-desktop .meta-value {
  font-size: 16px;
}

.size-desktop .billing-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.size-desktop .billing-card {
  padding: 20px;
}

.size-desktop .billing-card h3 {
  font-size: 15px;
}

.size-desktop .payment-grid {
  grid-template-columns: repeat(2, 1fr);
}

.size-desktop .items-table th {
  padding: 14px 10px;
  font-size: 12px;
}

.size-desktop .items-table td {
  padding: 14px 10px;
  font-size: 13px;
}

.size-desktop .summary-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
  align-items: start;
}

.size-desktop .totals-box {
  padding: 20px;
}

.size-desktop .total-row {
  font-size: 14px;
}

.size-desktop .grand-total-amount {
  font-size: 26px !important;
}

.size-desktop .footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 原尺寸保持不变 */
.invoice-preview.size-original {
  width: 210mm;
  min-height: 297mm;
}

/* 条形码/二维码区域 */
.barcode-section {
  margin-top: 20px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.barcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.barcode-wrapper svg {
  max-width: 200px;
  height: auto;
}

.qr-wrapper canvas {
  max-width: 80px;
  max-height: 80px;
}

.custom-barcode-img {
  max-width: 200px;
  max-height: 60px;
  object-fit: contain;
}

.custom-qr-img {
  max-width: 80px;
  max-height: 80px;
  object-fit: contain;
}
</style>
