<template>
  <div class="hotel-receipt" :class="`size-${previewSize}`" :style="receiptStyle">
    <div class="receipt-container" :class="`paper-${store.designSettings.paperStyle}`" :style="paperStyle">
      <!-- 酒店头部 -->
      <div class="hotel-header" :style="headerStyle">
        <div v-if="store.data.merchantLogo" class="hotel-logo">
          <img :src="store.data.merchantLogo" alt="Hotel Logo" />
        </div>
        <div v-else class="hotel-icon">🏨</div>
        <h1 class="hotel-name">{{ store.data.merchantName }}</h1>
        <p v-if="store.data.merchantNameEn" class="hotel-name-en">{{ store.data.merchantNameEn }}</p>
        <div class="hotel-stars">
          <span v-for="i in (store.data.rating || 5)" :key="i">★</span>
        </div>
      </div>

      <div class="elegant-line"></div>

      <!-- 账单标题 -->
      <div class="bill-title">
        <h2>GUEST FOLIO</h2>
        <p>宾客账单</p>
      </div>

      <!-- 入住信息 -->
      <div class="stay-info">
        <div class="info-section">
          <h3 class="section-title">Guest Information / 宾客信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Guest Name / 宾客姓名</span>
              <span class="value">{{ store.data.customerName || 'Mr./Ms. Guest' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Room Number / 房间号</span>
              <span class="value">{{ store.data.roomNumber || '888' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Room Type / 房型</span>
              <span class="value">{{ store.data.roomType || '豪华套房 Deluxe Suite' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Check-in / 入住日期</span>
              <span class="value">{{ store.data.checkInDate || store.data.date }}</span>
            </div>
            <div class="info-item">
              <span class="label">Check-out / 退房日期</span>
              <span class="value">{{ store.data.checkOutDate || store.data.date }}</span>
            </div>
            <div class="info-item">
              <span class="label">Nights / 入住晚数</span>
              <span class="value">{{ store.data.nights || 1 }} Night(s)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-line"></div>

      <!-- 费用明细 -->
      <div class="charges-section">
        <h3 class="section-title">Charges Detail / 费用明细</h3>
        <div class="charges-table">
          <div class="table-header">
            <span class="col-date">Date</span>
            <span class="col-desc">Description</span>
            <span class="col-amount">Amount</span>
          </div>
          <div v-for="item in store.data.items" :key="item.id" class="table-row">
            <span class="col-date">{{ item.date || store.data.date }}</span>
            <div class="col-desc">
              <span class="desc-main">{{ item.name }}</span>
              <span v-if="item.nameEn" class="desc-en">{{ item.nameEn }}</span>
              <span v-if="item.notes" class="desc-notes">{{ item.notes }}</span>
            </div>
            <span class="col-amount">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
          </div>
        </div>
      </div>

      <div class="section-line"></div>

      <!-- 费用汇总 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>Room Charges / 房费</span>
          <span>{{ store.formatCurrency(roomTotal) }}</span>
        </div>
        <div v-if="serviceCharges > 0" class="summary-row">
          <span>F&B Charges / 餐饮费</span>
          <span>{{ store.formatCurrency(serviceCharges) }}</span>
        </div>
        <div v-if="otherCharges > 0" class="summary-row">
          <span>Other Services / 其他服务</span>
          <span>{{ store.formatCurrency(otherCharges) }}</span>
        </div>
        <div class="summary-row subtotal">
          <span>Subtotal / 小计</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.serviceChargeRate" class="summary-row">
          <span>Service Charge / 服务费 ({{ store.data.serviceChargeRate }}%)</span>
          <span>{{ store.formatCurrency(serviceChargeAmount) }}</span>
        </div>
        <div v-if="store.data.taxRate > 0" class="summary-row">
          <span>Tax / 税费 ({{ store.data.taxRate }}%)</span>
          <span>{{ store.formatCurrency(store.calculatedTaxAmount) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="summary-row discount">
          <span>Discount / 折扣 {{ store.data.discountCode ? `(${store.data.discountCode})` : '' }}</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="summary-row total">
          <span>Total Amount / 总金额</span>
          <span>{{ store.formatCurrency(grandTotal) }}</span>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="payment-section">
        <h3 class="section-title">Payment / 付款信息</h3>
        <div class="payment-details">
          <div class="payment-row">
            <span>Payment Method / 支付方式</span>
            <span>{{ store.data.paymentMethod }}</span>
          </div>
          <div v-if="store.data.cardLast4" class="payment-row">
            <span>Card Number / 卡号</span>
            <span>**** **** **** {{ store.data.cardLast4 }}</span>
          </div>
          <div v-if="store.data.approvalCode" class="payment-row">
            <span>Authorization Code / 授权码</span>
            <span>{{ store.data.approvalCode }}</span>
          </div>
          <div class="payment-row paid">
            <span>Amount Paid / 已付金额</span>
            <span>{{ store.formatCurrency(grandTotal) }}</span>
          </div>
          <div class="payment-row balance">
            <span>Balance Due / 余额</span>
            <span>{{ store.formatCurrency(0) }}</span>
          </div>
        </div>
      </div>

      <div class="elegant-line"></div>

      <!-- 签名区 -->
      <div class="signature-section">
        <div class="signature-box">
          <p class="signature-label">Guest Signature / 宾客签名</p>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box">
          <p class="signature-label">Front Desk / 前台</p>
          <div class="signature-line"></div>
        </div>
      </div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <p class="folio-number">Folio No: {{ store.data.receiptNumber }}</p>
        <p class="timestamp">{{ store.data.date }} {{ store.data.time }}</p>
        <p class="cashier">Printed by: {{ store.data.cashier }}</p>

        <div class="contact-info">
          <p>{{ store.data.merchantAddress }}</p>
          <p>Tel: {{ store.data.merchantPhone }}</p>
          <p v-if="store.data.merchantEmail">Email: {{ store.data.merchantEmail }}</p>
          <p v-if="store.data.merchantWebsite">{{ store.data.merchantWebsite }}</p>
        </div>

        <p class="thank-message">{{ store.data.footerMessage || '感谢您的入住，期待再次为您服务' }}</p>
        <p class="thank-message-en">Thank you for staying with us</p>
        <p class="thank-message-en">We look forward to welcoming you again</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReceiptStore } from '@/stores/receipt'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useReceiptStore()

const roomTotal = computed(() => {
  return store.data.items
    .filter(item => item.category === '房费' || item.category === 'Room')
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
})

const serviceCharges = computed(() => {
  return store.data.items
    .filter(item => item.category === '餐饮' || item.category === 'F&B')
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
})

const otherCharges = computed(() => {
  return store.data.items
    .filter(item => !['房费', 'Room', '餐饮', 'F&B'].includes(item.category || ''))
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
})

const serviceChargeAmount = computed(() => {
  return store.data.serviceChargeRate 
    ? store.calculatedSubtotal * store.data.serviceChargeRate / 100 
    : 0
})

const grandTotal = computed(() => {
  return store.calculatedGrandTotal + serviceChargeAmount.value
})

const receiptStyle = computed(() => ({
  '--primary-color': store.designSettings.primaryColor,
  '--font-family': store.designSettings.fontFamily,
  '--accent-color': store.designSettings.accentColor
}))

const paperStyle = computed(() => ({
  backgroundColor: store.designSettings.backgroundColor,
  borderRadius: `${store.designSettings.roundedCorners}px`,
  border: store.designSettings.showBorder 
    ? `${store.designSettings.borderWidth}px ${store.designSettings.borderStyle} ${store.designSettings.borderColor}` 
    : 'none',
  boxShadow: store.designSettings.showShadow ? '0 4px 20px rgba(0,0,0,0.1)' : 'none'
}))

const headerStyle = computed(() => ({
  // Header specific styles if needed
}))
</script>

<style scoped>
.hotel-receipt {
  width: 380px;
  font-family: var(--font-family, 'Palatino Linotype', 'Georgia', serif);
  color: #2c3e50;
}

.receipt-container {
  padding: 32px 28px;
  border: 1px solid var(--primary-color, #d4af37);
}

.hotel-header {
  text-align: center;
  margin-bottom: 24px;
}

.hotel-logo img {
  max-height: 80px;
  margin-bottom: 12px;
}

.hotel-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.hotel-name {
  font-size: 26px;
  font-weight: 400;
  letter-spacing: 3px;
  margin: 0;
  color: #1a1a1a;
  text-transform: uppercase;
}

.hotel-name-en {
  font-size: 12px;
  letter-spacing: 2px;
  color: #666;
  margin: 6px 0;
}

.hotel-stars {
  color: var(--primary-color, #d4af37);
  font-size: 14px;
  letter-spacing: 2px;
  margin-top: 8px;
}

.elegant-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary-color, #d4af37), transparent);
  margin: 24px 0;
}

.section-line {
  height: 1px;
  background: #e0e0e0;
  margin: 20px 0;
}

.bill-title {
  text-align: center;
  margin-bottom: 20px;
}

.bill-title h2 {
  font-size: 18px;
  letter-spacing: 4px;
  margin: 0;
  font-weight: 400;
}

.bill-title p {
  font-size: 12px;
  color: #888;
  margin: 4px 0 0;
}

.section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin: 0 0 16px;
  font-weight: 400;
}

.stay-info {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item .label {
  font-size: 9px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-size: 13px;
  color: #333;
  margin-top: 4px;
}

.charges-section {
  margin: 20px 0;
}

.charges-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 70px 1fr 80px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.table-row {
  display: grid;
  grid-template-columns: 70px 1fr 80px;
  padding: 10px 0;
  border-bottom: 1px dotted #eee;
  font-size: 12px;
}

.col-date {
  color: #888;
  font-size: 10px;
}

.col-desc {
  display: flex;
  flex-direction: column;
}

.desc-main {
  color: #333;
}

.desc-en {
  font-size: 10px;
  color: #888;
  font-style: italic;
}

.desc-notes {
  font-size: 9px;
  color: #999;
  margin-top: 2px;
}

.col-amount {
  text-align: right;
  color: #333;
}

.summary-section {
  margin: 20px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
}

.summary-row.subtotal {
  border-top: 1px solid #e0e0e0;
  margin-top: 8px;
  padding-top: 12px;
}

.summary-row.discount {
  color: #27ae60;
}

.summary-row.total {
  font-size: 16px;
  font-weight: 600;
  border-top: 2px solid #d4af37;
  margin-top: 10px;
  padding-top: 14px;
  color: #1a1a1a;
}

.payment-section {
  margin: 20px 0;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
}

.payment-row.paid {
  font-weight: 500;
  color: #333;
}

.payment-row.balance {
  color: #27ae60;
  font-weight: 500;
}

.signature-section {
  display: flex;
  gap: 24px;
  margin: 24px 0;
}

.signature-box {
  flex: 1;
}

.signature-label {
  font-size: 9px;
  color: #999;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.signature-line {
  border-bottom: 1px solid #333;
  height: 40px;
}

.receipt-footer {
  text-align: center;
  margin-top: 24px;
}

.folio-number, .timestamp, .cashier {
  font-size: 10px;
  color: #888;
  margin: 2px 0;
}

.contact-info {
  margin: 16px 0;
}

.contact-info p {
  font-size: 10px;
  color: #888;
  margin: 2px 0;
}

.thank-message {
  font-size: 12px;
  color: #333;
  margin: 12px 0 4px;
}

.thank-message-en {
  font-size: 11px;
  color: #888;
  font-style: italic;
  margin: 2px 0;
}

/* 手机尺寸 */
.hotel-receipt.size-mobile {
  width: 320px;
}

.size-mobile .receipt-container {
  padding: 24px 20px;
}

.size-mobile .hotel-name {
  font-size: 22px;
  letter-spacing: 2px;
}

.size-mobile .info-grid {
  grid-template-columns: 1fr;
  gap: 10px;
}

.size-mobile .table-header,
.size-mobile .table-row {
  grid-template-columns: 60px 1fr 60px;
}

/* 电脑尺寸 */
.hotel-receipt.size-desktop {
  width: 500px;
}

.size-desktop .receipt-container {
  padding: 40px 36px;
}

.size-desktop .hotel-name {
  font-size: 30px;
}

.size-desktop .summary-row.total {
  font-size: 18px;
}
</style>
