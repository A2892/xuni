<template>
  <div class="luxury-restaurant-receipt" :class="`size-${previewSize}`">
    <div class="receipt-container">
      <!-- 餐厅品牌头部 -->
      <div class="receipt-header">
        <div v-if="store.data.merchantLogo" class="restaurant-logo">
          <img :src="store.data.merchantLogo" alt="Restaurant Logo" />
        </div>
        <div class="brand-area">
          <h1 class="restaurant-name">{{ store.data.merchantName }}</h1>
          <p v-if="store.data.merchantNameEn" class="restaurant-name-en">{{ store.data.merchantNameEn }}</p>
          <div class="restaurant-rating" v-if="store.data.rating">
            <span v-for="i in 5" :key="i" class="star">{{ i <= store.data.rating ? '★' : '☆' }}</span>
            <span class="rating-text">Fine Dining</span>
          </div>
        </div>
      </div>

      <div class="decorative-line"></div>

      <!-- 用餐信息 -->
      <div class="dining-info">
        <div class="info-card">
          <div class="info-row">
            <span class="icon">📅</span>
            <div class="info-content">
              <span class="label">Date / 日期</span>
              <span class="value">{{ formatDate(store.data.date) }}</span>
            </div>
          </div>
          <div class="info-row">
            <span class="icon">⏰</span>
            <div class="info-content">
              <span class="label">Time / 时间</span>
              <span class="value">{{ store.data.time }}</span>
            </div>
          </div>
          <div class="info-row">
            <span class="icon">🪑</span>
            <div class="info-content">
              <span class="label">Table / 桌号</span>
              <span class="value">{{ store.data.tableNumber || 'A1' }}</span>
            </div>
          </div>
          <div class="info-row">
            <span class="icon">👥</span>
            <div class="info-content">
              <span class="label">Guests / 人数</span>
              <span class="value">{{ store.data.guestCount || 1 }}</span>
            </div>
          </div>
          <div class="info-row">
            <span class="icon">👨‍🍳</span>
            <div class="info-content">
              <span class="label">Server / 服务员</span>
              <span class="value">{{ store.data.cashier }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-title-line">
        <span class="title-text">— Menu Items / 菜品明细 —</span>
        <div style="font-size: 8px; color: rgba(255,255,255,0.2);">Count: {{ store.data.items.length }} | Subtotal: {{ store.calculatedSubtotal }}</div>
      </div>

      <!-- 菜品明细 -->
      <div class="menu-items">
        <div v-for="item in store.data.items" :key="item.id" class="menu-item">
          <div class="item-header">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-price">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
          </div>
          <div class="item-details">
            <span v-if="item.nameEn" class="item-name-en">{{ item.nameEn }}</span>
            <span class="item-qty">× {{ item.quantity }}</span>
            <span v-if="item.notes" class="item-notes">({{ item.notes }})</span>
          </div>
        </div>
      </div>

      <div class="decorative-line short"></div>

      <!-- 金额明细 -->
      <div class="bill-summary">
        <div class="summary-row">
          <span>Food Subtotal / 餐品小计</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.serviceChargeRate" class="summary-row">
          <span>Service Charge / 服务费 ({{ store.data.serviceChargeRate }}%)</span>
          <span>{{ store.formatCurrency(store.calculatedServiceFee) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="summary-row discount">
          <span>{{ store.data.discountCode ? `Discount (${store.data.discountCode})` : 'Discount / 优惠' }}</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div v-if="store.data.taxRate > 0" class="summary-row">
          <span>Tax / 税费 ({{ store.data.taxRate }}%)</span>
          <span>{{ store.formatCurrency(store.calculatedTaxAmount) }}</span>
        </div>
        <div v-if="store.data.deliveryFee" class="summary-row">
          <span>Delivery Fee / 配送费</span>
          <span>{{ store.formatCurrency(store.data.deliveryFee) }}</span>
        </div>
        <div v-if="store.data.packagingFee" class="summary-row">
          <span>Packaging Fee / 打包费</span>
          <span>{{ store.formatCurrency(store.data.packagingFee) }}</span>
        </div>
        <div v-if="store.data.tip" class="summary-row">
          <span>Gratuity / 小费</span>
          <span>{{ store.formatCurrency(store.data.tip) }}</span>
        </div>
        <div class="summary-row total">
          <span>>>> CHECKOUT TOTAL <<<</span>
          <span>{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="payment-info">
        <div class="payment-header">
          <span class="check-icon">✓</span>
          <span>Payment Complete / 支付成功</span>
        </div>
        <div class="payment-details">
          <div class="detail-row">
            <span>Method / 支付方式</span>
            <span>{{ store.data.paymentMethod }}</span>
          </div>
          <div v-if="store.data.cardLast4" class="detail-row">
            <span>Card / 卡号</span>
            <span>**** {{ store.data.cardLast4 }}</span>
          </div>
          <div class="detail-row">
            <span>Receipt No. / 单号</span>
            <span>{{ store.data.receiptNumber }}</span>
          </div>
        </div>
      </div>

      <!-- 餐厅页脚 -->
      <div class="receipt-footer">
        <div class="footer-message">
          <p>{{ store.data.footerMessage || '感谢您的光临，期待再次为您服务' }}</p>
          <p class="en">Thank you for dining with us</p>
        </div>

        <div class="contact-section">
          <div class="contact-item">
            <span class="icon">📍</span>
            <span>{{ store.data.merchantAddress }}</span>
          </div>
          <div class="contact-item">
            <span class="icon">📞</span>
            <span>{{ store.data.merchantPhone }}</span>
          </div>
          <div v-if="store.data.merchantWebsite" class="contact-item">
            <span class="icon">🌐</span>
            <span>{{ store.data.merchantWebsite }}</span>
          </div>
        </div>

        <div class="qr-area">
          <img v-if="qrCodeUrl" :src="qrCodeUrl" class="qr-code" alt="QR" />
          <p class="qr-text">Scan for menu & reservations</p>
          <p class="qr-text-cn">扫码查看菜单及预约</p>
        </div>

        <div class="signature-area">
          <p class="signature-line">Guest Signature / 宾客签名</p>
          <div class="signature-box">
            <span v-if="store.data.signatureType === 'text' && store.data.signatureText" class="signature-text" :style="{ fontFamily: store.data.signatureFont }">{{ store.data.signatureText }}</span>
            <img v-else-if="store.data.signatureType === 'image' && store.data.signatureImage" :src="store.data.signatureImage" class="signature-img" alt="Signature" />
          </div>
        </div>
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const qrCodeUrl = computed(() => {
  const data = `https://restaurant.example.com/menu?table=${store.data.tableNumber}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(data)}`
})
</script>

<style scoped>
.luxury-restaurant-receipt {
  width: 340px;
  background: linear-gradient(180deg, #2c1810 0%, #1a0f0a 100%);
  color: #f5e6d3;
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
}

.receipt-container {
  padding: 30px 24px;
}

.receipt-header {
  text-align: center;
  margin-bottom: 20px;
}

.restaurant-logo img {
  max-height: 70px;
  margin-bottom: 12px;
  filter: brightness(1.1);
}

.restaurant-name {
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 3px;
  margin: 0;
  color: #d4af37;
  text-transform: uppercase;
}

.restaurant-name-en {
  font-size: 11px;
  letter-spacing: 2px;
  color: #c9a962;
  margin: 6px 0;
  font-style: italic;
}

.restaurant-rating {
  margin-top: 10px;
}

.star {
  color: #d4af37;
  font-size: 14px;
}

.rating-text {
  display: block;
  font-size: 10px;
  color: #a0826d;
  margin-top: 4px;
  letter-spacing: 2px;
}

.decorative-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
  margin: 20px 0;
}

.decorative-line.short {
  width: 60%;
  margin: 16px auto;
}

.dining-info {
  margin-bottom: 20px;
}

.info-card {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  padding: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-content .label {
  font-size: 9px;
  color: #a0826d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-content .value {
  font-size: 13px;
  color: #f5e6d3;
}

.section-title-line {
  text-align: center;
  margin: 20px 0;
}

.title-text {
  font-size: 11px;
  letter-spacing: 2px;
  color: #d4af37;
}

.menu-items {
  margin-bottom: 16px;
}

.menu-item {
  padding: 14px 0;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}

.menu-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.item-name {
  font-size: 15px;
  color: #f5e6d3;
  font-weight: 500;
  flex: 1;
}

.item-price {
  font-size: 15px;
  color: #d4af37;
  font-weight: 500;
  white-space: nowrap;
  text-align: right;
}

.item-details {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 11px;
  color: #a0826d;
  line-height: 1.5;
}

.item-name-en {
  font-style: italic;
  flex-basis: 100%;
  color: #c9a962;
}

.item-qty {
  background: rgba(212, 175, 55, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
}

.item-notes {
  font-style: italic;
  color: #c9a962;
}

.bill-summary {
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
  color: #c9a962;
}

.summary-row.discount {
  color: #e74c3c;
}

.summary-row.total {
  border-top: 1px solid #d4af37;
  margin-top: 8px;
  padding-top: 12px;
  font-size: 16px;
  color: #d4af37;
  font-weight: 500;
}

.payment-info {
  background: rgba(212, 175, 55, 0.15);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #4caf50;
}

.check-icon {
  background: #4caf50;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #a0826d;
}

.receipt-footer {
  text-align: center;
}

.footer-message p {
  margin: 4px 0;
  font-size: 12px;
  color: #c9a962;
  line-height: 1.5;
}

.footer-message .en {
  font-style: italic;
  font-size: 11px;
  color: #a0826d;
}

.contact-section {
  margin: 20px 0;
  padding: 12px;
  background: rgba(0,0,0,0.2);
  border-radius: 6px;
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 10px;
  color: #a0826d;
  margin: 4px 0;
}

.qr-area {
  margin: 16px 0;
}

.qr-code {
  width: 70px;
  height: 70px;
  padding: 4px;
  background: white;
  border-radius: 4px;
}

.qr-text, .qr-text-cn {
  font-size: 9px;
  color: #a0826d;
  margin: 4px 0;
}

.signature-area {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed rgba(212, 175, 55, 0.3);
}

.signature-line {
  font-size: 10px;
  color: #a0826d;
  margin-bottom: 8px;
}

.signature-box {
  min-height: 40px;
  border-bottom: 1px solid #a0826d;
  margin: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signature-text {
  font-size: 24px;
  color: #d4af37;
  transform: rotate(-2deg);
}

.signature-img {
  max-height: 50px;
  max-width: 80%;
}

/* 手机尺寸 */
.luxury-restaurant-receipt.size-mobile {
  width: 300px;
}

.size-mobile .receipt-container {
  padding: 20px 16px;
}

.size-mobile .restaurant-name {
  font-size: 20px;
  letter-spacing: 2px;
}

.size-mobile .info-card {
  padding: 12px;
}

/* 电脑尺寸 */
.luxury-restaurant-receipt.size-desktop {
  width: 480px;
}

.size-desktop .receipt-container {
  padding: 40px 32px;
}

.size-desktop .restaurant-name {
  font-size: 28px;
}

.size-desktop .item-name {
  font-size: 15px;
}

.size-desktop .summary-row.total {
  font-size: 18px;
}
</style>
