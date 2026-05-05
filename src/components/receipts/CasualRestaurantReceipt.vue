<template>
  <div class="casual-restaurant-receipt" :class="`size-${previewSize}`" :style="receiptStyle">
    <div class="receipt-paper" :class="`paper-${store.designSettings.paperStyle}`" :style="paperStyle">
      <!-- 餐厅头部 -->
      <div class="restaurant-header" :style="headerStyle">
        <div class="restaurant-icon">🍜</div>
        <h1 class="restaurant-name">{{ store.data.merchantName }}</h1>
        <p class="restaurant-type">{{ store.data.cuisineType || '中式餐饮' }}</p>
      </div>

      <div class="wave-divider">〰〰〰〰〰〰〰〰〰〰〰〰</div>

      <!-- 就餐信息 -->
      <div class="order-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">桌号</span>
            <span class="value">{{ store.data.tableNumber || 'A12' }}</span>
          </div>
          <div class="info-item">
            <span class="label">人数</span>
            <span class="value">{{ store.data.guestCount || 2 }}位</span>
          </div>
          <div class="info-item">
            <span class="label">服务员</span>
            <span class="value">{{ store.data.cashier }}</span>
          </div>
          <div class="info-item">
            <span class="label">单号</span>
            <span class="value">{{ store.data.receiptNumber }}</span>
          </div>
        </div>
        <div class="time-info">
          <span>{{ store.data.date }}</span>
          <span>{{ store.data.time }}</span>
        </div>
      </div>

      <div class="section-header">
        <span>—— 点餐明细 ——</span>
      </div>

      <!-- 菜品列表 -->
      <div class="food-list">
        <div v-for="item in store.data.items" :key="item.id" class="food-item">
          <div class="food-main">
            <span class="food-name">
              {{ item.name }}
              <span v-if="item.category" class="food-tag">{{ item.category }}</span>
            </span>
            <span class="food-price">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
          </div>
          <div class="food-details">
            <span class="food-spec">{{ item.notes || '标准' }}</span>
            <span class="food-qty">x{{ item.quantity }}</span>
            <span class="food-unit-price">{{ store.formatCurrency(item.unitPrice) }}/份</span>
          </div>
        </div>
      </div>

      <!-- 加料/备注 -->
      <div v-if="store.data.specialRequests" class="special-requests">
        <span class="request-label">📝 备注:</span>
        <span class="request-text">{{ store.data.specialRequests }}</span>
      </div>

      <div class="wave-divider">〰〰〰〰〰〰〰〰〰〰〰〰</div>

      <!-- 费用汇总 -->
      <div class="bill-section">
        <div class="bill-row">
          <span>餐品小计</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.packagingFee" class="bill-row">
          <span>打包费</span>
          <span>{{ store.formatCurrency(store.data.packagingFee) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="bill-row discount">
          <span>
            优惠
            <span v-if="store.data.discountCode" class="discount-code">({{ store.data.discountCode }})</span>
          </span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="bill-row total">
          <span>合计</span>
          <span>{{ store.formatCurrency(totalAmount) }}</span>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="payment-info">
        <div class="payment-badge">
          <span class="badge-icon">✓</span>
          <span>已支付</span>
        </div>
        <div class="payment-method">
          {{ store.data.paymentMethod }}
          <span v-if="store.data.cardLast4">(*{{ store.data.cardLast4 }})</span>
        </div>
      </div>

      <!-- 评价提示 -->
      <div class="review-section">
        <p class="review-text">{{ store.data.footerMessage || '好吃就告诉朋友，不好吃就告诉我们' }}</p>
        <div class="stars-row">
          <span v-for="i in 5" :key="i" class="star-empty">☆</span>
        </div>
      </div>

      <div class="dashed-line"></div>

      <!-- 页脚信息 -->
      <div class="footer-section">
        <div class="contact-info">
          <p>📍 {{ store.data.merchantAddress }}</p>
          <p>📞 {{ store.data.merchantPhone }}</p>
          <p v-if="store.data.businessHours">🕐 营业时间: {{ store.data.businessHours }}</p>
        </div>

        <div class="qr-area">
          <img v-if="qrCode" :src="qrCode" class="qr-code" alt="QR" />
          <p class="qr-hint">扫码点餐/外卖</p>
        </div>

        <p class="footer-text">谢谢惠顾 欢迎下次光临</p>
        <p class="receipt-number">NO.{{ store.data.receiptNumber }}</p>
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

const totalAmount = computed(() => {
  let total = store.calculatedGrandTotal
  if (store.data.packagingFee) {
    total += store.data.packagingFee
  }
  return total
})

const qrCode = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent('https://order.example.com')}`
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
  boxShadow: store.designSettings.showShadow ? '0 2px 12px rgba(0,0,0,0.08)' : 'none'
}))

const headerStyle = computed(() => ({
  // Header specific styles if needed
}))
</script>

<style scoped>
.casual-restaurant-receipt {
  width: 300px;
  font-family: var(--font-family, 'PingFang SC', 'Microsoft YaHei', sans-serif);
}

.receipt-paper {
  background: linear-gradient(180deg, #fff9f0 0%, #fff 50%, #fff9f0 100%);
  padding: 20px 16px;
  border-radius: 8px;
}

.restaurant-header {
  text-align: center;
  margin-bottom: 16px;
}

.restaurant-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.restaurant-name {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: var(--primary-color, #c0392b);
}

.restaurant-type {
  font-size: 12px;
  color: #888;
  margin: 4px 0 0;
}

.wave-divider {
  text-align: center;
  font-size: 10px;
  color: #ddd;
  letter-spacing: -2px;
  margin: 12px 0;
}

.order-info {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item .label {
  font-size: 10px;
  color: #999;
}

.info-item .value {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
  padding-top: 8px;
  border-top: 1px dashed #eee;
}

.section-header {
  text-align: center;
  font-size: 12px;
  color: var(--primary-color, #c0392b);
  margin: 16px 0 12px;
}

.food-list {
  margin-bottom: 12px;
}

.food-item {
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
}

.food-item:last-child {
  border-bottom: none;
}

.food-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.food-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.food-tag {
  font-size: 10px;
  background: #fff3e0;
  color: #e65100;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 6px;
}

.food-price {
  font-size: 14px;
  font-weight: 500;
  color: #c0392b;
}

.food-details {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 11px;
  color: #999;
}

.special-requests {
  background: #fff8e1;
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  margin: 12px 0;
}

.request-label {
  color: #f57c00;
  margin-right: 8px;
}

.request-text {
  color: #666;
}

.bill-section {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
}

.bill-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.bill-row.discount {
  color: #27ae60;
}

.discount-code {
  font-size: 11px;
  color: #888;
}

.bill-row.total {
  font-size: 16px;
  font-weight: 600;
  color: #c0392b;
  border-top: 1px solid #eee;
  margin-top: 8px;
  padding-top: 12px;
}

.payment-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 16px 0;
}

.payment-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #e8f5e9;
  color: #2e7d32;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-icon {
  font-size: 14px;
}

.payment-method {
  font-size: 12px;
  color: #666;
}

.review-section {
  text-align: center;
  background: #fafafa;
  padding: 12px;
  border-radius: 8px;
  margin: 12px 0;
}

.review-text {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px;
}

.stars-row {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.star-empty {
  font-size: 20px;
  color: #ffc107;
}

.dashed-line {
  border-bottom: 1px dashed #ddd;
  margin: 16px 0;
}

.footer-section {
  text-align: center;
}

.contact-info {
  margin-bottom: 12px;
}

.contact-info p {
  font-size: 10px;
  color: #888;
  margin: 3px 0;
}

.qr-area {
  margin: 12px 0;
}

.qr-code {
  width: 60px;
  height: 60px;
}

.qr-hint {
  font-size: 10px;
  color: #999;
  margin: 4px 0 0;
}

.footer-text {
  font-size: 13px;
  color: #c0392b;
  margin: 12px 0 4px;
  font-weight: 500;
}

.receipt-number {
  font-size: 10px;
  color: #ccc;
  margin: 0;
}

/* 手机尺寸 */
.casual-restaurant-receipt.size-mobile {
  width: 280px;
}

.size-mobile .receipt-paper {
  padding: 16px 12px;
}

.size-mobile .restaurant-name {
  font-size: 20px;
}

.size-mobile .info-grid {
  gap: 8px;
}

/* 电脑尺寸 */
.casual-restaurant-receipt.size-desktop {
  width: 400px;
}

.size-desktop .receipt-paper {
  padding: 28px 24px;
}

.size-desktop .restaurant-name {
  font-size: 26px;
}

.size-desktop .food-name {
  font-size: 15px;
}

.size-desktop .bill-row.total {
  font-size: 18px;
}
</style>
