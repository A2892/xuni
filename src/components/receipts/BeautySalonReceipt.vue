<template>
  <div class="beauty-receipt" :class="`size-${previewSize}`">
    <div class="receipt-card">
      <!-- 优雅的头部设计 -->
      <div class="salon-header">
        <div class="decorative-line left"></div>
        <div class="salon-logo">💇</div>
        <div class="decorative-line right"></div>
      </div>
      
      <div class="salon-name">
        <h1>{{ store.data.merchantName || '悦颜美容美发' }}</h1>
        <p class="salon-slogan">✨ {{ store.data.branchName || 'Beauty & Style' }} ✨</p>
      </div>

      <div class="contact-info">
        <p>📍 {{ store.data.merchantAddress || '朝阳区三里屯SOHO' }}</p>
        <p>📞 {{ store.data.merchantPhone || '010-88888888' }}</p>
      </div>

      <div class="elegant-divider">
        <span>♦</span>
      </div>

      <!-- 客户信息 -->
      <div class="customer-section">
        <div class="section-title">💝 客户信息</div>
        <div class="customer-info">
          <div class="info-item">
            <span class="label">客户</span>
            <span class="value">{{ store.data.customerName || '尊贵会员' }}</span>
          </div>
          <div class="info-item">
            <span class="label">日期</span>
            <span class="value">{{ store.data.date }}</span>
          </div>
          <div v-if="store.data.cashier" class="info-item">
            <span class="label">技师</span>
            <span class="value stylist">{{ store.data.cashier }}</span>
          </div>
        </div>
      </div>

      <!-- 服务项目 -->
      <div class="services-section">
        <div class="section-title">💆 服务项目</div>
        <div v-for="item in store.data.items" :key="item.id" class="service-item">
          <div class="service-header">
            <span class="service-icon">{{ getServiceIcon(item.category) }}</span>
            <span class="service-name">{{ item.name }}</span>
          </div>
          <div class="service-details">
            <div v-if="item.notes" class="service-desc">{{ item.notes }}</div>
            <div class="service-price-row">
              <span v-if="item.quantity > 1">{{ item.quantity }} 次</span>
              <span class="service-price">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="wavy-divider"></div>

      <!-- 金额信息 -->
      <div class="amount-section">
        <div class="amount-row">
          <span>服务合计</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="amount-row discount">
          <span>会员优惠</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="amount-row total">
          <span>实付金额</span>
          <span class="total-amount">{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-badge">
        <span>{{ store.data.paymentMethod }}</span>
      </div>

      <!-- 会员信息 -->
      <div v-if="store.data.membershipId" class="membership-section">
        <div class="membership-card">
          <div class="card-header">
            <span class="crown">👑</span>
            <span>{{ store.data.membershipLevel || 'VIP会员' }}</span>
          </div>
          <div class="card-number">{{ store.data.membershipId }}</div>
          <div class="card-points">
            <span v-if="store.data.pointsEarned">本次积分 +{{ store.data.pointsEarned }}</span>
            <span v-if="store.data.memberPoints">累计积分 {{ store.data.memberPoints }}</span>
          </div>
        </div>
      </div>

      <div class="elegant-divider">
        <span>♦</span>
      </div>

      <!-- 预约提醒 -->
      <div class="reminder-section">
        <div class="reminder-header">📅 下次预约</div>
        <p class="reminder-text">建议您在 <strong>30天</strong> 后进行下次护理</p>
        <p class="reminder-tel">预约热线: {{ store.data.merchantPhone || '010-88888888' }}</p>
      </div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <div class="qr-row">
          <div class="qr-item">
            <div class="qr-box">💅</div>
            <span>关注公众号</span>
          </div>
          <div class="qr-item">
            <div class="qr-box">🎁</div>
            <span>会员专享</span>
          </div>
        </div>
        <p class="receipt-number">No. {{ store.data.receiptNumber }}</p>
        <p class="footer-message">{{ store.data.footerMessage || '美丽从这里开始 Beauty Starts Here' }}</p>
        <div class="decorative-footer">
          ～ Thank You ～
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReceiptStore } from '@/stores/receipt'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'

withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useReceiptStore()

const getServiceIcon = (category?: string) => {
  const icons: Record<string, string> = {
    '美发': '💇',
    '美容': '💆',
    '美甲': '💅',
    'SPA': '🧖',
    '护理': '✨',
    '染发': '🎨',
    '造型': '💫'
  }
  return icons[category || ''] || '💎'
}
</script>

<style scoped>
.beauty-receipt {
  font-family: 'PingFang SC', 'Georgia', serif;
}

.receipt-card {
  width: 300px;
  background: linear-gradient(180deg, #fff5f8 0%, #fff 30%);
  padding: 24px 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(219, 112, 147, 0.15);
  position: relative;
  overflow: hidden;
}

.receipt-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b9d, #c44569, #ff6b9d);
}

.salon-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.decorative-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #c44569, transparent);
}

.salon-logo {
  font-size: 36px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff6b9d, #c44569);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(196, 69, 105, 0.3);
}

.salon-name {
  text-align: center;
  margin-bottom: 12px;
}

.salon-name h1 {
  font-size: 20px;
  margin: 0;
  color: #c44569;
  font-weight: 600;
}

.salon-slogan {
  font-size: 11px;
  color: #999;
  margin: 6px 0 0;
  letter-spacing: 2px;
}

.contact-info {
  text-align: center;
  font-size: 11px;
  color: #888;
  margin-bottom: 16px;
}

.contact-info p {
  margin: 3px 0;
}

.elegant-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
}

.elegant-divider::before,
.elegant-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0c3cf, transparent);
}

.elegant-divider span {
  padding: 0 12px;
  color: #c44569;
  font-size: 10px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #c44569;
  margin-bottom: 10px;
}

.customer-section {
  margin-bottom: 16px;
}

.customer-info {
  background: #fdf2f5;
  padding: 12px;
  border-radius: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 5px 0;
}

.info-item .label {
  color: #999;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}

.info-item .stylist {
  color: #c44569;
}

.services-section {
  margin-bottom: 16px;
}

.service-item {
  background: #fff;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  border: 1px solid #f5e1e8;
}

.service-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.service-icon {
  font-size: 16px;
}

.service-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.service-details {
  padding-left: 24px;
}

.service-desc {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.service-price-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.service-price {
  font-weight: 600;
  color: #c44569;
}

.wavy-divider {
  height: 8px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10'%3E%3Cpath d='M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5' fill='none' stroke='%23f5e1e8' stroke-width='1'/%3E%3C/svg%3E") repeat-x;
  margin: 16px 0;
}

.amount-section {
  margin-bottom: 12px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin: 6px 0;
  color: #555;
}

.amount-row.discount {
  color: #27ae60;
}

.amount-row.total {
  font-size: 16px;
  font-weight: 700;
  color: #c44569;
  padding-top: 10px;
  border-top: 1px dashed #e0c3cf;
}

.total-amount {
  font-size: 22px;
}

.payment-badge {
  text-align: center;
  margin: 12px 0;
}

.payment-badge span {
  display: inline-block;
  padding: 6px 20px;
  background: linear-gradient(135deg, #fdf2f5, #fff);
  border: 1px solid #f5e1e8;
  border-radius: 20px;
  font-size: 12px;
  color: #666;
}

.membership-section {
  margin: 16px 0;
}

.membership-card {
  background: linear-gradient(135deg, #c44569, #ff6b9d);
  padding: 14px;
  border-radius: 12px;
  color: #fff;
  text-align: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 6px;
}

.crown {
  font-size: 16px;
}

.card-number {
  font-size: 11px;
  opacity: 0.9;
  letter-spacing: 1px;
}

.card-points {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
  font-size: 10px;
  opacity: 0.9;
}

.reminder-section {
  background: #fdf8f9;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 16px;
}

.reminder-header {
  font-size: 12px;
  font-weight: 600;
  color: #c44569;
  margin-bottom: 6px;
}

.reminder-text {
  font-size: 11px;
  color: #666;
  margin: 4px 0;
}

.reminder-text strong {
  color: #c44569;
}

.reminder-tel {
  font-size: 11px;
  color: #888;
  margin: 4px 0;
}

.receipt-footer {
  text-align: center;
}

.qr-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.qr-box {
  width: 50px;
  height: 50px;
  background: #fdf2f5;
  border: 1px solid #f5e1e8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.qr-item span {
  font-size: 9px;
  color: #999;
}

.receipt-number {
  font-size: 10px;
  color: #ccc;
  margin: 8px 0;
}

.footer-message {
  font-size: 11px;
  color: #c44569;
  margin: 6px 0;
  font-style: italic;
}

.decorative-footer {
  font-size: 12px;
  color: #ddd;
  margin-top: 10px;
  letter-spacing: 2px;
}
</style>
