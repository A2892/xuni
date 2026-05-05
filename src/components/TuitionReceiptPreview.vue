<template>
  <div class="tuition-receipt-preview" :class="[`template-${store.settings.template}`, `size-${previewSize}`]">
    <div class="receipt-document" :style="documentStyle">
      <!-- 水印 -->
      <div v-if="store.designSettings.watermarkEnabled" class="watermark-layer" :class="store.designSettings.watermarkType || 'center'">
        <template v-if="store.designSettings.watermarkType === 'fullscreen'">
          <span v-for="i in 20" :key="i" class="watermark-text" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
            {{ store.designSettings.watermarkText }}
          </span>
        </template>
        <span v-else class="watermark-center" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
          {{ store.designSettings.watermarkText }}
        </span>
      </div>

      <!-- 页眉 -->
      <header class="receipt-header">
        <div class="header-left">
          <div v-if="store.settings.showLogo" class="school-logo">
            <img v-if="store.school.logo" :src="store.school.logo" alt="School Logo" />
            <div v-else class="default-logo">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="38" :stroke="store.settings.primaryColor" stroke-width="2" fill="white"/>
                <path d="M40 15 L55 25 L55 45 Q55 55 40 65 Q25 55 25 45 L25 25 Z" :fill="store.settings.primaryColor"/>
                <rect x="32" y="30" width="16" height="20" fill="white" rx="1"/>
                <line x1="36" y1="35" x2="44" y2="35" stroke="#ccc" stroke-width="1"/>
                <line x1="36" y1="39" x2="44" y2="39" stroke="#ccc" stroke-width="1"/>
                <line x1="36" y1="43" x2="44" y2="43" stroke="#ccc" stroke-width="1"/>
              </svg>
            </div>
          </div>
          <div class="school-info">
            <h1 class="school-name">{{ store.school.name }}</h1>
            <p v-if="store.school.nameCn" class="school-name-cn">{{ store.school.nameCn }}</p>
            <p class="school-address">{{ store.school.address }}</p>
          </div>
        </div>
        <div class="header-right">
          <div class="receipt-title">
            <h2>{{ store.settings.language === 'zh' ? '学费收据' : 'TUITION RECEIPT' }}</h2>
          </div>
          <div class="receipt-meta">
            <div class="meta-item">
              <div class="label">{{ store.t('receiptNo') }}:</div>
              <div class="value">{{ store.receipt.number }}</div>
            </div>
            <div class="meta-item">
              <div class="label">{{ store.t('issueDate') }}:</div>
              <div class="value">{{ formatDate(store.receipt.issueDate) }}</div>
            </div>
            <div class="meta-item">
              <div class="label">{{ store.t('academicYear') }}:</div>
              <div class="value">{{ store.receipt.academicYear }}</div>
            </div>
          </div>
          <!-- 状态标签 -->
          <div class="status-badge" :class="store.receipt.status">
            {{ statusText }}
          </div>
        </div>
      </header>

      <!-- 学生信息 -->
      <section class="student-section">
        <h3 class="section-title">{{ store.t('studentInfo') }}</h3>
        <div class="student-content">
          <div v-if="store.student.photo" class="student-photo">
            <img :src="store.student.photo" alt="Student Photo" />
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">{{ store.t('studentId') }}:</span>
              <span class="value">{{ store.student.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ store.t('name') }}:</span>
              <span class="value">{{ store.student.name }} <span v-if="store.student.nameCn">({{ store.student.nameCn }})</span></span>
            </div>
            <div class="info-item">
              <span class="label">{{ store.t('programme') }}:</span>
              <span class="value">{{ store.student.programme }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ store.t('faculty') }}:</span>
              <span class="value">{{ store.student.faculty }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ store.t('yearLevel') }}:</span>
              <span class="value">Year {{ store.student.yearLevel }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ store.t('semester') }}:</span>
              <span class="value">{{ store.receipt.semester }} {{ store.receipt.academicYear }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 费用明细 -->
      <section class="fees-section">
        <h3 class="section-title">{{ store.t('feeDetails') }}</h3>
        <table class="fees-table">
          <thead>
            <tr>
              <th>{{ store.t('category') }}</th>
              <th>{{ store.t('description') }}</th>
              <th class="amount">{{ store.t('amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.feeItems" :key="item.id">
              <td>{{ item.category }}</td>
              <td>{{ item.description }}</td>
              <td class="amount">{{ store.formatCurrency(item.amount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="subtotal-row">
              <td colspan="2">{{ store.t('subtotal') }}</td>
              <td class="amount">{{ store.formatCurrency(store.subtotal) }}</td>
            </tr>
            <tr v-if="store.discounts.scholarship > 0" class="discount-row">
              <td colspan="2">{{ store.t('scholarship') }}: {{ store.discounts.scholarshipName }}</td>
              <td class="amount discount">-{{ store.formatCurrency(store.discounts.scholarship) }}</td>
            </tr>
            <tr v-if="store.discounts.earlyPayment > 0" class="discount-row">
              <td colspan="2">{{ store.t('discount') }}</td>
              <td class="amount discount">-{{ store.formatCurrency(store.discounts.earlyPayment) }}</td>
            </tr>
            <tr v-if="store.discounts.other > 0" class="discount-row">
              <td colspan="2">{{ store.discounts.otherDescription || store.t('discount') }}</td>
              <td class="amount discount">-{{ store.formatCurrency(store.discounts.other) }}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2">{{ store.t('totalDue') }}</td>
              <td class="amount total">{{ store.formatCurrency(store.totalDue) }}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <!-- 支付记录 -->
      <section v-if="store.settings.showPaymentHistory && store.payments.length > 0" class="payment-section">
        <h3 class="section-title">{{ store.t('paymentHistory') }}</h3>
        <table class="payment-table">
          <thead>
            <tr>
              <th>{{ store.t('date') }}</th>
              <th>{{ store.t('method') }}</th>
              <th>{{ store.t('reference') }}</th>
              <th class="amount">{{ store.t('amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in store.payments" :key="payment.id">
              <td>{{ formatDate(payment.date) }}</td>
              <td>{{ payment.method }}</td>
              <td>{{ payment.reference }}</td>
              <td class="amount paid">{{ store.formatCurrency(payment.amount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-paid-row">
              <td colspan="3">{{ store.t('totalPaid') }}</td>
              <td class="amount paid">{{ store.formatCurrency(store.totalPaid) }}</td>
            </tr>
            <tr class="balance-row" :class="{ 'has-balance': store.balance > 0 }">
              <td colspan="3">{{ store.t('balance') }}</td>
              <td class="amount">{{ store.formatCurrency(store.balance) }}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <!-- 付款信息 -->
      <section class="payment-info-section">
        <h3 class="section-title">Payment Information / 付款信息</h3>
        <div class="payment-info-grid">
          <div class="payment-method">
            <h4>Bank Transfer Details</h4>
            <p><strong>Bank:</strong> {{ store.school.name }} Finance Office</p>
            <p><strong>Account:</strong> Finance Department</p>
            <p><strong>Reference:</strong> {{ store.student.id }}</p>
          </div>
          <div class="contact-info">
            <h4>Contact Information</h4>
            <p><strong>Email:</strong> {{ store.school.email }}</p>
            <p><strong>Phone:</strong> {{ store.school.phone }}</p>
            <p><strong>Website:</strong> {{ store.school.website }}</p>
          </div>
        </div>
      </section>

      <!-- 页脚 -->
      <footer class="receipt-footer">
        <div class="footer-left">
          <p class="notice">{{ store.designSettings.footerNoticeEn }} {{ store.school.name }}.</p>
          <p class="notice">{{ store.designSettings.footerNoticeCn }}</p>
          <p class="tax-id" v-if="store.school.taxId">{{ store.designSettings.footerTaxLabel }}: {{ store.school.taxId }}</p>
        </div>
        <div class="footer-right">
          <!-- 条形码 -->
          <div v-if="store.settings.showBarcode" class="barcode-section">
            <img v-if="store.settings.barcodeSource === 'upload' && store.settings.barcodeImage" 
                 :src="store.settings.barcodeImage" 
                 class="custom-barcode-img" 
                 alt="Barcode" />
            <template v-else>
              <svg ref="barcodeRef" class="barcode-svg"></svg>
              <span class="barcode-text">{{ store.settings.barcodeContent || store.receipt.number }}</span>
            </template>
          </div>
          <!-- 二维码 -->
          <div v-if="store.settings.showQR" class="qr-code">
            <img v-if="store.settings.qrSource === 'upload' && store.settings.qrImage" 
                 :src="store.settings.qrImage" 
                 class="custom-qr-img" 
                 alt="QR Code" />
            <template v-else>
              <canvas ref="qrCanvas" width="80" height="80"></canvas>
            </template>
            <span>Verify Receipt</span>
          </div>
          <!-- 上传的印章图片 -->
          <img v-if="store.designSettings.stampEnabled && store.designSettings.stampSource === 'upload' && store.designSettings.stampImage" 
               :src="store.designSettings.stampImage" 
               alt="印章" 
               class="uploaded-stamp"
               :style="{ transform: `rotate(${store.designSettings.stampRotation}deg)` }" />
          <!-- 生成的印章 -->
          <div v-else-if="store.designSettings.stampEnabled" class="receipt-stamp" :style="{ transform: `rotate(${store.designSettings.stampRotation}deg)` }">
            <svg viewBox="0 0 120 120" class="stamp-svg">
              <defs>
                <path id="circle-path" d="M 60, 60 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
              </defs>
              <circle cx="60" cy="60" r="55" fill="none" :stroke="store.designSettings.stampColor" stroke-width="3" opacity="0.8"/>
              <circle cx="60" cy="60" r="48" fill="none" :stroke="store.designSettings.stampColor" stroke-width="1.5" opacity="0.6"/>
              <text text-anchor="middle" :fill="store.designSettings.stampColor" font-size="11" font-weight="bold">
                <textPath href="#circle-path" startOffset="50%">
                  {{ store.school.name.toUpperCase() }}
                </textPath>
              </text>
              <text x="60" y="55" text-anchor="middle" :fill="store.designSettings.stampColor" font-size="16" font-weight="bold">
                {{ store.designSettings.stampText || 'RECEIVED' }}
              </text>
              <text x="60" y="72" text-anchor="middle" :fill="store.designSettings.stampColor" font-size="10">
                {{ formatDate(store.receipt.issueDate) }}
              </text>
              <line x1="20" y1="60" x2="100" y2="60" :stroke="store.designSettings.stampColor" stroke-width="1" opacity="0.4"/>
            </svg>
          </div>
        </div>
      </footer>

      <!-- 签章区 -->
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p>Authorized Signature</p>
          <p class="signature-title">Finance Office</p>
        </div>
        <div class="stamp-area">
          <div class="official-stamp">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" :stroke="store.settings.primaryColor" stroke-width="2"/>
              <circle cx="50" cy="50" r="38" fill="none" :stroke="store.settings.primaryColor" stroke-width="1"/>
              <text x="50" y="35" text-anchor="middle" :fill="store.settings.primaryColor" font-size="8" font-weight="bold">{{ store.school.name.split(' ').slice(0, 2).join(' ') }}</text>
              <text x="50" y="50" text-anchor="middle" :fill="store.settings.primaryColor" font-size="10" font-weight="bold">FINANCE</text>
              <text x="50" y="65" text-anchor="middle" :fill="store.settings.primaryColor" font-size="8">OFFICE</text>
              <text x="50" y="80" text-anchor="middle" :fill="store.settings.primaryColor" font-size="6">★ OFFICIAL ★</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref, nextTick } from 'vue'
import { useTuitionReceiptStore } from '@/stores/tuitionReceipt'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

const props = defineProps<{
  previewSize?: string
}>()

const store = useTuitionReceiptStore()
const qrCanvas = ref<HTMLCanvasElement>()
const barcodeRef = ref<SVGElement>()

const documentStyle = computed(() => ({
  borderColor: store.designSettings.borderEnabled ? store.designSettings.borderColor : 'transparent',
  borderWidth: store.designSettings.borderEnabled ? `${store.designSettings.borderWidth}px` : '0',
  fontFamily: store.designSettings.fontFamily
}))

const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    paid: store.t('statusPaid'),
    pending: store.t('statusPending'),
    overdue: store.t('statusOverdue'),
    partial: store.t('statusPartial')
  }
  return statusMap[store.receipt.status] || store.receipt.status
})

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// 渲染条形码
const renderBarcode = () => {
  if (!barcodeRef.value) return
  if (store.settings.barcodeSource === 'upload' && store.settings.barcodeImage) return
  
  const content = store.settings.barcodeContent || store.receipt.number || '0000000000'
  try {
    JsBarcode(barcodeRef.value, content, {
      format: 'CODE128',
      width: 1.5,
      height: 40,
      displayValue: false,
      margin: 0
    })
  } catch (error) {
    console.error('Barcode generation failed:', error)
  }
}

const generateQRCode = async () => {
  if (!qrCanvas.value) return
  if (store.settings.qrSource === 'upload' && store.settings.qrImage) return
  
  const qrData = {
    type: 'tuition_receipt',
    receiptNo: store.receipt.number,
    school: store.school.name,
    student: store.student.id,
    amount: store.totalDue,
    date: store.receipt.issueDate,
    verifyUrl: `https://verify.university.edu/receipt/${store.receipt.number}`
  }
  
  try {
    await QRCode.toCanvas(qrCanvas.value, JSON.stringify(qrData), {
      width: 80,
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
    generateQRCode()
  })
})

watch(
  () => [
    store.receipt.number,
    store.receipt.issueDate,
    store.totalDue,
    store.settings.showBarcode,
    store.settings.showQR,
    store.settings.barcodeSource,
    store.settings.barcodeContent,
    store.settings.qrSource
  ],
  () => {
    nextTick(() => {
      nextTick(() => {
        renderBarcode()
        generateQRCode()
      })
    })
  },
  { deep: true }
)
</script>

<style scoped>
.tuition-receipt-preview {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #f0f2f5;
}

.receipt-document {
  width: 210mm;
  min-height: 297mm;
  background: white;
  padding: 25px 35px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  position: relative;
  border-style: solid;
  border-radius: 2px;
}

/* 尺寸调整 */
.size-mobile .receipt-document { transform: scale(0.38); transform-origin: top center; }
.size-iphone .receipt-document { transform: scale(0.48); transform-origin: top center; }
.size-desktop .receipt-document { transform: scale(0.68); transform-origin: top center; }

/* 水印 */
.watermark-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}

.watermark-layer.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.watermark-layer.fullscreen {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  gap: 30px;
  padding: 20px;
}

.watermark-center {
  font-size: 80px;
  font-weight: bold;
  color: #000;
  transform: rotate(-30deg);
  white-space: nowrap;
  opacity: 0.08;
}

.watermark-text {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  transform: rotate(-30deg);
  white-space: nowrap;
}

/* 页眉 */
.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 15px;
  border-bottom: 3px solid #003d82;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.school-logo {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.school-logo img, .default-logo svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.school-info {
  flex: 1;
}

.school-name {
  font-size: 22px;
  font-weight: 700;
  color: #003d82;
  margin: 0 0 3px 0;
  line-height: 1.2;
}

.school-name-cn {
  font-size: 13px;
  color: #555;
  margin: 0 0 4px 0;
}

.school-address {
  font-size: 10px;
  color: #666;
  margin: 0;
}

.header-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.receipt-title h2 {
  font-size: 20px;
  color: #003d82;
  margin: 0;
  letter-spacing: 3px;
  font-weight: 600;
}

.receipt-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 5px;
}

.meta-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  line-height: 1.4;
}

.meta-item .label {
  font-size: 10px;
  color: #888;
}

.meta-item .value {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

/* 状态标签 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  padding: 5px 14px;
  font-size: 11px;
  font-weight: bold;
  border-radius: 20px;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.status-badge.paid {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.status-badge.pending {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.status-badge.overdue {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.status-badge.partial {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

/* 通用区块 */
.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #003d82;
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 学生信息 */
.student-section {
  margin-bottom: 20px;
  background: #fafbfc;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.student-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.info-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 40px;
}

.student-photo {
  width: 80px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.student-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-item .label {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-item .value {
  font-size: 12px;
  color: #1a1a1a;
  font-weight: 600;
}

/* 费用表格 */
.fees-section {
  margin-bottom: 20px;
}

.fees-table, .payment-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 11px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.fees-table th, .payment-table th {
  background: linear-gradient(135deg, #003d82, #0052a3);
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  color: white;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fees-table td, .payment-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
  color: #4b5563;
  background: white;
}

.fees-table tbody tr:hover td {
  background: #f8fafc;
}

.fees-table .amount, .payment-table .amount {
  text-align: right;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  font-size: 11px;
}

.fees-table tfoot td {
  font-weight: 600;
}

.subtotal-row td {
  background: #f8fafc !important;
  border-top: 2px solid #e5e7eb;
  color: #374151;
}

.discount-row td {
  background: #f0fdf4 !important;
}

.discount-row .discount {
  color: #059669;
  font-weight: 600;
}

.total-row td {
  background: linear-gradient(135deg, #003d82, #0052a3) !important;
  color: white;
  font-size: 12px;
  padding: 12px 14px;
}

.total-row .total {
  color: white;
  font-size: 14px;
  font-weight: 700;
}

/* 支付记录 */
.payment-section {
  margin-bottom: 25px;
}

.paid {
  color: #10b981;
}

.total-paid-row td {
  background: #f0fdf4;
  font-weight: 600;
}

.balance-row td {
  background: #f8fafc;
  font-weight: 600;
}

.balance-row.has-balance td {
  background: #fef2f2;
  color: #dc2626;
}

/* 付款信息 */
.payment-info-section {
  margin-bottom: 20px;
}

.payment-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.payment-method, .contact-info {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 10px;
  border: 1px solid #e2e8f0;
}

.payment-method h4, .contact-info h4 {
  font-size: 11px;
  color: #003d82;
  margin: 0 0 8px 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.payment-method p, .contact-info p {
  margin: 4px 0;
  color: #4b5563;
  line-height: 1.5;
}

/* 页脚 */
.receipt-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 15px;
  border-top: 2px solid #e5e7eb;
  margin-top: 15px;
}

.footer-left {
  flex: 1;
  max-width: 60%;
}

.notice {
  font-size: 9px;
  color: #888;
  margin: 2px 0;
  line-height: 1.4;
}

.tax-id {
  font-size: 9px;
  color: #555;
  margin-top: 6px;
  font-weight: 500;
}

.qr-code {
  text-align: center;
}

.qr-code canvas {
  display: block;
  margin: 0 auto 4px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 4px;
  background: white;
}

.qr-code .custom-qr-img {
  display: block;
  margin: 0 auto 4px;
  width: 80px;
  height: 80px;
  object-fit: contain;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 4px;
  background: white;
}

.qr-code span {
  font-size: 8px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 条形码样式 */
.barcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.barcode-svg {
  max-width: 120px;
  height: 40px;
}

.custom-barcode-img {
  max-width: 120px;
  max-height: 45px;
  object-fit: contain;
}

.barcode-text {
  font-size: 8px;
  color: #888;
  font-family: 'SF Mono', 'Courier New', monospace;
  margin-top: 2px;
}

.receipt-stamp {
  width: 90px;
  height: 90px;
  display: inline-block;
  margin-left: 15px;
  transition: transform 0.3s ease;
}

.uploaded-stamp {
  max-width: 90px;
  max-height: 90px;
  object-fit: contain;
  margin-left: 15px;
}

.stamp-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.footer-right {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

/* 签章区 */
.signature-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
}

.signature-box {
  text-align: center;
  padding: 0 20px;
}

.signature-line {
  width: 140px;
  border-bottom: 1px solid #333;
  margin-bottom: 6px;
}

.signature-box p {
  font-size: 9px;
  color: #666;
  margin: 2px 0;
}

.signature-title {
  font-weight: 600;
  color: #003d82 !important;
}

.stamp-area {
  width: 70px;
  height: 70px;
  opacity: 0.75;
}

.official-stamp svg {
  width: 100%;
  height: 100%;
}

/* 模板变体 - 现代风格 */
.template-modern .receipt-header {
  border-bottom-color: #003d82;
}

/* 模板变体 - 经典风格 */
.template-classic .receipt-document {
  background: #fffef5;
}

.template-classic .receipt-header {
  border-bottom: 3px double #003d82;
}

.template-classic .section-title {
  font-family: 'Times New Roman', serif;
}

/* 模板变体 - 简约风格 */
.template-minimal .receipt-header {
  border-bottom: 1px solid #e5e7eb;
}

.template-minimal .status-badge {
  border-radius: 0;
}

.template-minimal .fees-table th {
  background: white;
  border-bottom: 2px solid #333;
}
</style>
