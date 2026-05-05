<template>
  <div class="cafe-receipt" :class="`size-${previewSize}`" :style="receiptStyle">
    <div class="receipt-paper" :class="`paper-${store.designSettings.paperStyle}`" :style="paperStyle">
      <!-- 咖啡厅头部 -->
      <div class="cafe-header" :style="headerStyle">
        <div class="cafe-logo">☕</div>
        <h1 class="cafe-name">{{ store.data.merchantName }}</h1>
        <p class="cafe-tagline">{{ store.data.slogan || 'Freshly Brewed, Carefully Crafted' }}</p>
      </div>

      <div class="bean-divider">
        <span>◆ ◆ ◆</span>
      </div>

      <!-- 订单信息 -->
      <div class="order-header">
        <div class="order-type">
          <span class="type-badge">{{ store.data.orderType || '堂食' }}</span>
        </div>
        <div class="order-details">
          <span>Order #{{ store.data.receiptNumber }}</span>
          <span>{{ store.data.date }} {{ store.data.time }}</span>
          <span>Barista: {{ store.data.cashier }}</span>
        </div>
      </div>

      <!-- 取餐号 -->
      <div v-if="store.data.pickupNumber" class="pickup-number">
        <span class="pickup-label">取餐号 / PICKUP</span>
        <span class="pickup-value">{{ store.data.pickupNumber }}</span>
      </div>

      <div class="line-divider"></div>

      <!-- 饮品列表 -->
      <div class="drinks-list">
        <div v-for="item in store.data.items" :key="item.id" class="drink-item">
          <div class="drink-header">
            <div class="drink-info">
              <span class="drink-name">{{ item.name }}</span>
              <span v-if="item.nameEn" class="drink-name-en">{{ item.nameEn }}</span>
            </div>
            <span class="drink-price">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
          </div>
          <div class="drink-customization">
            <span v-if="item.notes" class="customization">{{ item.notes }}</span>
            <span class="qty">x{{ item.quantity }}</span>
          </div>
          <div v-if="item.category" class="drink-size">
            <span class="size-tag">{{ item.category }}</span>
          </div>
        </div>
      </div>

      <div class="line-divider"></div>

      <!-- 金额区域 -->
      <div class="amount-section">
        <div class="amount-row">
          <span>Subtotal / 小计</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="amount-row discount">
          <span>{{ store.data.discountCode ? `优惠 (${store.data.discountCode})` : 'Discount' }}</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="amount-row total">
          <span>Total / 合计</span>
          <span>{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <!-- 支付状态 -->
      <div class="payment-status">
        <span class="status-icon">✓</span>
        <span class="status-text">{{ store.data.paymentMethod }} - Paid</span>
      </div>

      <!-- 积分信息 -->
      <div v-if="store.data.pointsEarned" class="points-section">
        <div class="points-row">
          <span class="coffee-icon">☕</span>
          <span>本次获得 {{ store.data.pointsEarned }} 杯印花</span>
        </div>
        <div v-if="store.data.memberPoints" class="points-row small">
          <span>累计印花: {{ store.data.memberPoints }}/10 (集满10杯送1杯)</span>
        </div>
      </div>

      <div class="bean-divider">
        <span>◆ ◆ ◆</span>
      </div>

      <!-- WiFi信息 -->
      <div class="wifi-section">
        <div class="wifi-icon">📶</div>
        <div class="wifi-info">
          <p class="wifi-label">WiFi</p>
          <p class="wifi-name">{{ store.data.wifiName || 'CoffeeShop_Guest' }}</p>
          <p class="wifi-password">Password: {{ store.data.wifiPassword || 'coffee123' }}</p>
        </div>
      </div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <p class="footer-message">{{ store.data.footerMessage || '每一杯都是用心之作' }}</p>
        
        <div class="social-section">
          <p class="social-text">关注我们 Follow Us</p>
          <div class="social-icons">
            <span>📷</span>
            <span>💬</span>
            <span>📱</span>
          </div>
        </div>

        <div class="qr-section">
          <img v-if="qrCode" :src="qrCode" class="qr-code" alt="QR" />
          <p class="qr-hint">扫码点单 / Order Online</p>
        </div>

        <div class="store-info">
          <p>{{ store.data.merchantAddress }}</p>
          <p>{{ store.data.merchantPhone }}</p>
          <p v-if="store.data.businessHours">{{ store.data.businessHours }}</p>
        </div>

        <p class="thank-you">Thanks a Latte! 💛</p>
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

const qrCode = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent('https://cafe.example.com/order')}`
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
  boxShadow: store.designSettings.showShadow ? '0 4px 16px rgba(139, 90, 43, 0.1)' : 'none'
}))

const headerStyle = computed(() => ({
  // Cafe header specific styles if needed
}))
</script>

<style scoped>
.cafe-receipt {
  width: 300px;
  font-family: var(--font-family, 'Nunito', 'PingFang SC', sans-serif);
}

.receipt-paper {
  background: linear-gradient(180deg, #faf7f2 0%, #fff 100%);
  padding: 24px 20px;
  border-radius: 12px;
}

.cafe-header {
  text-align: center;
  margin-bottom: 20px;
}

.cafe-logo {
  font-size: 48px;
  margin-bottom: 8px;
}

.cafe-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color, #5d4037);
  margin: 0;
  letter-spacing: 1px;
}

.cafe-tagline {
  font-size: 11px;
  color: #8d6e63;
  margin: 6px 0 0;
  font-style: italic;
}

.bean-divider {
  text-align: center;
  color: #bcaaa4;
  margin: 16px 0;
  font-size: 10px;
  letter-spacing: 4px;
}

.order-header {
  margin-bottom: 16px;
}

.order-type {
  text-align: center;
  margin-bottom: 10px;
}

.type-badge {
  display: inline-block;
  background: var(--primary-color, linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%));
  color: white;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.order-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #8d6e63;
}

.pickup-number {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  text-align: center;
  padding: 16px;
  border-radius: 12px;
  margin: 16px 0;
}

.pickup-label {
  display: block;
  font-size: 10px;
  color: #8d6e63;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.pickup-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary-color, #5d4037);
}

.line-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #d7ccc8, transparent);
  margin: 16px 0;
}

.drinks-list {
  margin: 16px 0;
}

.drink-item {
  padding: 12px 0;
  border-bottom: 1px dashed #e0e0e0;
}

.drink-item:last-child {
  border-bottom: none;
}

.drink-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.drink-info {
  display: flex;
  flex-direction: column;
}

.drink-name {
  font-size: 14px;
  font-weight: 600;
  color: #5d4037;
}

.drink-name-en {
  font-size: 10px;
  color: #a1887f;
  margin-top: 2px;
}

.drink-price {
  font-size: 14px;
  font-weight: 600;
  color: #6d4c41;
}

.drink-customization {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: #8d6e63;
}

.customization {
  background: #efebe9;
  padding: 2px 8px;
  border-radius: 10px;
}

.drink-size {
  margin-top: 4px;
}

.size-tag {
  font-size: 10px;
  background: #d7ccc8;
  color: #5d4037;
  padding: 2px 8px;
  border-radius: 8px;
}

.amount-section {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
  color: #6d4c41;
}

.amount-row.discount {
  color: #43a047;
}

.amount-row.total {
  font-size: 16px;
  font-weight: 700;
  color: #5d4037;
  border-top: 1px solid #efebe9;
  margin-top: 8px;
  padding-top: 12px;
}

.payment-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #e8f5e9;
  padding: 10px;
  border-radius: 20px;
  margin: 12px 0;
}

.status-icon {
  color: #43a047;
  font-weight: bold;
}

.status-text {
  font-size: 12px;
  color: #2e7d32;
}

.points-section {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  padding: 12px;
  border-radius: 10px;
  margin: 12px 0;
}

.points-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #e65100;
}

.points-row.small {
  font-size: 10px;
  color: #ff8f00;
  margin-top: 6px;
  padding-left: 24px;
}

.coffee-icon {
  font-size: 16px;
}

.wifi-section {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 10px;
  margin: 16px 0;
}

.wifi-icon {
  font-size: 24px;
}

.wifi-info {
  flex: 1;
}

.wifi-info p {
  margin: 2px 0;
}

.wifi-label {
  font-size: 10px;
  color: #999;
}

.wifi-name {
  font-size: 13px;
  font-weight: 600;
  color: #5d4037;
}

.wifi-password {
  font-size: 11px;
  color: #8d6e63;
}

.receipt-footer {
  text-align: center;
  margin-top: 20px;
}

.footer-message {
  font-size: 12px;
  color: #8d6e63;
  font-style: italic;
  margin: 0 0 12px;
}

.social-section {
  margin: 12px 0;
}

.social-text {
  font-size: 10px;
  color: #a1887f;
  margin: 0 0 6px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 18px;
}

.qr-section {
  margin: 16px 0;
}

.qr-code {
  width: 70px;
  height: 70px;
  border-radius: 8px;
}

.qr-hint {
  font-size: 10px;
  color: #a1887f;
  margin: 6px 0 0;
}

.store-info {
  margin: 12px 0;
}

.store-info p {
  font-size: 10px;
  color: #a1887f;
  margin: 2px 0;
}

.thank-you {
  font-size: 14px;
  color: #6d4c41;
  font-weight: 600;
  margin: 12px 0 0;
}

/* 手机尺寸 */
.cafe-receipt.size-mobile {
  width: 280px;
}

.size-mobile .receipt-paper {
  padding: 18px 14px;
}

.size-mobile .cafe-name {
  font-size: 20px;
}

.size-mobile .pickup-value {
  font-size: 30px;
}

/* 电脑尺寸 */
.cafe-receipt.size-desktop {
  width: 380px;
}

.size-desktop .receipt-paper {
  padding: 32px 28px;
}

.size-desktop .cafe-name {
  font-size: 28px;
}

.size-desktop .drink-name {
  font-size: 15px;
}

.size-desktop .amount-row.total {
  font-size: 18px;
}
</style>
