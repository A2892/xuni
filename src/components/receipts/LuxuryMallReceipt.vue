<template>
  <div class="luxury-mall-receipt" :class="`size-${previewSize}`" :style="receiptStyle">
    <div class="receipt-container" :class="`paper-${store.designSettings.paperStyle}`" :style="paperStyle">
      <!-- 头部品牌区 -->
      <div class="receipt-header" :style="headerStyle">
        <div v-if="store.data.merchantLogo" class="brand-logo">
          <img :src="store.data.merchantLogo" alt="Brand Logo" />
        </div>
        <div class="brand-info">
          <h1 class="brand-name">{{ store.data.merchantName }}</h1>
          <p v-if="store.data.merchantNameEn" class="brand-name-en">{{ store.data.merchantNameEn }}</p>
          <p class="branch-name">{{ store.data.branchName || '旗舰店 Flagship Store' }}</p>
        </div>
      </div>

      <div class="elegant-divider"></div>

      <!-- 交易信息 -->
      <div class="transaction-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Receipt No. / 收据编号</span>
            <span class="value">{{ store.data.receiptNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">Date / 日期</span>
            <span class="value">{{ formatDate(store.data.date) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Time / 时间</span>
            <span class="value">{{ store.data.time }}</span>
          </div>
          <div class="info-item">
            <span class="label">Sales Associate / 销售顾问</span>
            <span class="value">{{ store.data.cashier }}</span>
          </div>
        </div>
      </div>

      <!-- VIP 会员信息 -->
      <div v-if="store.data.membershipId" class="vip-section">
        <div class="vip-badge">
          <span class="vip-icon">👑</span>
          <span class="vip-level">{{ store.data.membershipLevel || 'VIP Member' }}</span>
        </div>
        <div class="vip-info">
          <span>会员编号: {{ store.data.membershipId }}</span>
          <span v-if="store.data.memberPoints">当前积分: {{ store.data.memberPoints }}</span>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- 商品明细 -->
      <div class="items-section">
        <h3 class="section-title">Purchase Details / 购买明细</h3>
        <div class="items-list">
          <div v-for="item in store.data.items" :key="item.id" class="luxury-item">
            <div class="item-main">
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span v-if="item.nameEn" class="item-name-en">{{ item.nameEn }}</span>
                <span v-if="item.sku" class="item-sku">SKU: {{ item.sku }}</span>
              </div>
              <div class="item-price-info">
                <span v-if="item.originalPrice && item.originalPrice > item.unitPrice" class="original-price">
                  {{ store.formatCurrency(item.originalPrice) }}
                </span>
                <span class="unit-price">{{ store.formatCurrency(item.unitPrice) }}</span>
              </div>
            </div>
            <div class="item-quantity">
              <span>Qty / 数量: {{ item.quantity }}</span>
              <span class="item-total">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- 金额汇总 -->
      <div class="totals-section">
        <div class="total-row">
          <span>Subtotal / 小计</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="total-row discount">
          <span>Discount / 折扣 {{ store.data.discountCode ? `(${store.data.discountCode})` : '' }}</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div v-if="store.data.taxRate > 0" class="total-row">
          <span>Tax / 税费 ({{ store.data.taxRate }}%)</span>
          <span>{{ store.formatCurrency(store.calculatedTaxAmount) }}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total / 合计</span>
          <span>{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <!-- 积分信息 -->
      <div v-if="store.data.pointsEarned" class="points-earned">
        <span class="points-icon">⭐</span>
        <span>本次消费获得 {{ store.data.pointsEarned }} 积分 / Points Earned: {{ store.data.pointsEarned }}</span>
      </div>

      <div class="section-divider"></div>

      <!-- 支付信息 -->
      <div class="payment-section">
        <h3 class="section-title">Payment / 支付信息</h3>
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
          <div class="payment-row">
            <span>Amount Paid / 支付金额</span>
            <span class="paid-amount">{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
          </div>
        </div>
      </div>

      <div class="elegant-divider"></div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <p class="footer-message">{{ store.data.footerMessage || defaultFooter }}</p>
        
        <div class="policy-section">
          <h4>Return & Exchange Policy / 退换货政策</h4>
          <p>{{ store.data.returnPolicy || '请在购买后7日内凭此收据办理退换货。特殊商品（如化妆品、内衣等）不支持无理由退换。' }}</p>
          <p>Returns and exchanges are accepted within 7 days with original receipt.</p>
        </div>

        <div class="store-contact">
          <p>{{ store.data.merchantAddress }}</p>
          <p>Tel: {{ store.data.merchantPhone }}</p>
          <p v-if="store.data.merchantEmail">Email: {{ store.data.merchantEmail }}</p>
          <p v-if="store.data.merchantWebsite">{{ store.data.merchantWebsite }}</p>
        </div>

        <div class="qr-section">
          <div class="qr-code">
            <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code" />
            <div v-else class="qr-placeholder"></div>
          </div>
          <span class="qr-hint">Scan for membership / 扫码关注会员</span>
        </div>

        <p class="thank-you">Thank You for Shopping With Us</p>
        <p class="thank-you-cn">感谢您的惠顾</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReceiptStore, receiptTypeConfigs } from '@/stores/receipt'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useReceiptStore()

const defaultFooter = receiptTypeConfigs['luxury-mall'].defaultFooter

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const qrCodeUrl = computed(() => {
  const data = `https://shop.example.com/member?receipt=${store.data.receiptNumber}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(data)}`
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
  borderBottom: `1px solid ${store.designSettings.primaryColor}`
}))
</script>

<style scoped>
.luxury-mall-receipt {
  width: 320px;
  font-family: var(--font-family, 'Georgia', 'Times New Roman', serif);
  color: #1a1a1a;
  margin: 0 auto;
}

.receipt-container {
  background: linear-gradient(180deg, #fefefe 0%, #f9f9f9 100%);
  padding: 32px 24px;
}

.receipt-header {
  text-align: center;
  margin-bottom: 24px;
}

.brand-logo img {
  max-height: 60px;
  margin-bottom: 12px;
}

.brand-name {
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 4px;
  margin: 0;
  text-transform: uppercase;
}

.brand-name-en {
  font-size: 11px;
  letter-spacing: 2px;
  color: #666;
  margin: 4px 0;
}

.branch-name {
  font-size: 12px;
  color: #888;
  margin: 8px 0 0;
}

.elegant-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary-color, #ccc), transparent);
  margin: 20px 0;
}

.section-divider {
  height: 1px;
  background: #e5e5e5;
  margin: 16px 0;
}

.transaction-info {
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item .label {
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-size: 12px;
  color: #333;
  margin-top: 2px;
}

.vip-section {
  background: linear-gradient(135deg, #f5e6d3 0%, #ece0d1 100%);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.vip-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.vip-icon {
  font-size: 18px;
}

.vip-level {
  font-size: 14px;
  font-weight: 600;
  color: #8b6914;
}

.vip-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

.section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin: 0 0 12px 0;
  font-weight: 400;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.luxury-item {
  padding-bottom: 12px;
  border-bottom: 1px dashed #e0e0e0;
}

.luxury-item:last-child {
  border-bottom: none;
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 13px;
  font-weight: 500;
}

.item-name-en {
  font-size: 10px;
  color: #888;
}

.item-sku {
  font-size: 9px;
  color: #aaa;
  margin-top: 2px;
}

.item-price-info {
  text-align: right;
}

.original-price {
  font-size: 10px;
  color: #999;
  text-decoration: line-through;
  display: block;
}

.unit-price {
  font-size: 13px;
}

.item-quantity {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
}

.item-total {
  font-weight: 500;
  color: #333;
}

.totals-section {
  margin-top: 16px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
}

.total-row.discount {
  color: #c0392b;
}

.total-row.grand-total {
  font-size: 16px;
  font-weight: 600;
  border-top: 1px solid var(--primary-color, #333);
  margin-top: 8px;
  padding-top: 12px;
  color: var(--accent-color, inherit);
}

.points-earned {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef9e7;
  padding: 10px;
  border-radius: 4px;
  font-size: 11px;
  color: #b7950b;
  margin-top: 12px;
}

.payment-section {
  margin-top: 16px;
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
}

.paid-amount {
  font-weight: 600;
  font-size: 13px;
}

.receipt-footer {
  margin-top: 24px;
  text-align: center;
}

.footer-message {
  font-size: 11px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.policy-section {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  text-align: left;
}

.policy-section h4 {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px 0;
  color: #666;
}

.policy-section p {
  font-size: 10px;
  color: #888;
  margin: 4px 0;
  line-height: 1.5;
}

.store-contact {
  margin-bottom: 16px;
}

.store-contact p {
  font-size: 10px;
  color: #888;
  margin: 2px 0;
}

.qr-section {
  margin: 16px 0;
}

.qr-code img, .qr-placeholder {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: block;
}

.qr-placeholder {
  background: #f0f0f0;
  border: 1px dashed #ccc;
}

.qr-hint {
  font-size: 9px;
  color: #aaa;
  display: block;
  margin-top: 6px;
}

.thank-you {
  font-size: 12px;
  letter-spacing: 1px;
  margin: 8px 0 4px;
  font-style: italic;
}

.thank-you-cn {
  font-size: 11px;
  color: #888;
  margin: 0;
}

/* 手机尺寸 */
.luxury-mall-receipt.size-mobile {
  width: 300px;
  font-size: 10px;
}

.size-mobile .receipt-container {
  padding: 20px 16px;
}

.size-mobile .brand-name {
  font-size: 18px;
  letter-spacing: 2px;
}

.size-mobile .info-grid {
  grid-template-columns: 1fr;
  gap: 8px;
}

/* 电脑尺寸 */
.luxury-mall-receipt.size-desktop {
  width: 450px;
}

.size-desktop .receipt-container {
  padding: 40px 32px;
}

.size-desktop .brand-name {
  font-size: 26px;
}

.size-desktop .item-name {
  font-size: 14px;
}

.size-desktop .total-row.grand-total {
  font-size: 18px;
}
</style>
