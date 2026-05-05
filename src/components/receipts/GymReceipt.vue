<template>
  <div class="gym-receipt" :class="`size-${previewSize}`">
    <div class="receipt-paper">
      <!-- 运动风格头部 -->
      <div class="gym-header">
        <div class="header-bg">
          <div class="gym-logo">🏋️</div>
        </div>
        <h1 class="gym-name">{{ store.data.merchantName || '力量健身俱乐部' }}</h1>
        <p class="gym-slogan">{{ store.data.branchName || 'Power Up Your Life' }}</p>
      </div>

      <div class="contact-bar">
        <span>📍 {{ store.data.merchantAddress || '朝阳区建国路88号' }}</span>
        <span>📞 {{ store.data.merchantPhone || '010-66666666' }}</span>
      </div>

      <div class="energetic-divider"></div>

      <!-- 会员信息 -->
      <div class="member-card-section">
        <div class="member-card">
          <div class="card-left">
            <div class="member-avatar">💪</div>
            <div class="member-info">
              <span class="member-name">{{ store.data.customerName || '健身达人' }}</span>
              <span class="member-level">{{ store.data.membershipLevel || '年卡会员' }}</span>
            </div>
          </div>
          <div class="card-right">
            <span class="card-number">{{ store.data.membershipId || 'GYM2024001' }}</span>
          </div>
        </div>
      </div>

      <!-- 交易信息 -->
      <div class="transaction-section">
        <div class="tx-row">
          <span>单据号</span>
          <span>{{ store.data.receiptNumber }}</span>
        </div>
        <div class="tx-row">
          <span>日期</span>
          <span>{{ store.data.date }} {{ store.data.time }}</span>
        </div>
        <div class="tx-row">
          <span>前台</span>
          <span>{{ store.data.cashier }}</span>
        </div>
      </div>

      <div class="sport-divider">
        <span class="sport-icon">⚡</span>
      </div>

      <!-- 消费项目 -->
      <div class="items-section">
        <div class="section-header">
          <span class="header-icon">📋</span>
          <span>消费明细</span>
        </div>
        <div v-for="item in store.data.items" :key="item.id" class="item-card">
          <div class="item-icon">{{ getItemIcon(item.category) }}</div>
          <div class="item-content">
            <div class="item-name">{{ item.name }}</div>
            <div v-if="item.notes" class="item-desc">{{ item.notes }}</div>
            <div v-if="item.category" class="item-meta">
              <span class="meta-tag">{{ item.category }}</span>
              <span v-if="item.quantity > 1">x{{ item.quantity }}</span>
            </div>
          </div>
          <div class="item-price">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</div>
        </div>
      </div>

      <div class="progress-divider">
        <div class="progress-bar">
          <div class="progress-fill" style="width: 100%"></div>
        </div>
      </div>

      <!-- 金额信息 -->
      <div class="amount-section">
        <div class="amount-row">
          <span>项目合计</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="amount-row discount">
          <span>会员优惠</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="amount-row total">
          <span>实付金额</span>
          <span class="total-value">{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="payment-section">
        <div class="payment-method">
          <span class="method-label">支付方式</span>
          <span class="method-value">{{ store.data.paymentMethod }}</span>
        </div>
      </div>

      <!-- 积分信息 -->
      <div v-if="store.data.pointsEarned" class="points-section">
        <div class="points-earned">
          <span class="points-icon">🎯</span>
          <span>本次获得 <strong>{{ store.data.pointsEarned }}</strong> 积分</span>
        </div>
        <div v-if="store.data.memberPoints" class="points-total">
          累计积分: {{ store.data.memberPoints }}
        </div>
      </div>

      <div class="energetic-divider"></div>

      <!-- 温馨提示 -->
      <div class="tips-section">
        <div class="tips-header">💡 温馨提示</div>
        <ul class="tips-list">
          <li>请携带会员卡入场</li>
          <li>运动前请做好热身</li>
          <li>器材使用后请归位</li>
        </ul>
      </div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <div class="qr-area">
          <div class="qr-box">📱</div>
          <span>扫码预约课程</span>
        </div>
        <div class="barcode">*{{ store.data.receiptNumber }}*</div>
        <p class="footer-message">{{ store.data.footerMessage || '坚持锻炼，遇见更好的自己！' }}</p>
        <div class="footer-decoration">
          ═══ KEEP MOVING ═══
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

const getItemIcon = (category?: string) => {
  const icons: Record<string, string> = {
    '会员卡': '💳',
    '私教课': '🏃',
    '团课': '🧘',
    '游泳': '🏊',
    '器材': '🏋️',
    '饮品': '🥤',
    '装备': '👟',
    '储物柜': '🔐'
  }
  return icons[category || ''] || '⭐'
}
</script>

<style scoped>
.gym-receipt {
  font-family: 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.receipt-paper {
  width: 300px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.gym-header {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  padding: 24px 20px 20px;
  text-align: center;
  position: relative;
}

.header-bg {
  margin-bottom: 12px;
}

.gym-logo {
  font-size: 40px;
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.gym-name {
  font-size: 20px;
  color: #fff;
  margin: 0;
  font-weight: 700;
}

.gym-slogan {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin: 6px 0 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.contact-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 10px 16px;
  background: #f0f4f8;
  font-size: 10px;
  color: #666;
}

.energetic-divider {
  height: 4px;
  background: linear-gradient(90deg, #f39c12, #e74c3c, #9b59b6, #3498db);
}

.member-card-section {
  padding: 16px;
}

.member-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #2a5298, #1e3c72);
  padding: 12px 16px;
  border-radius: 10px;
  color: #fff;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-avatar {
  font-size: 24px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.member-level {
  display: block;
  font-size: 10px;
  opacity: 0.8;
  margin-top: 2px;
}

.card-number {
  font-size: 10px;
  opacity: 0.7;
}

.transaction-section {
  padding: 0 16px 16px;
}

.tx-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 5px 0;
  color: #666;
}

.sport-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  background: #f8f9fa;
}

.sport-icon {
  font-size: 16px;
  padding: 0 20px;
}

.items-section {
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e3c72;
  margin-bottom: 12px;
}

.header-icon {
  font-size: 16px;
}

.item-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 8px;
}

.item-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.item-desc {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.meta-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: #e8f4fd;
  color: #2980b9;
  border-radius: 4px;
}

.item-price {
  font-size: 14px;
  font-weight: 600;
  color: #1e3c72;
}

.progress-divider {
  padding: 12px 16px;
}

.progress-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 2px;
}

.amount-section {
  padding: 0 16px 16px;
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
  color: #1e3c72;
  padding-top: 10px;
  border-top: 1px dashed #ddd;
}

.total-value {
  font-size: 20px;
}

.payment-section {
  padding: 0 16px 16px;
}

.payment-method {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  background: #e8f4fd;
  border-radius: 8px;
  font-size: 12px;
}

.method-label {
  color: #666;
}

.method-value {
  color: #2980b9;
  font-weight: 500;
}

.points-section {
  margin: 0 16px 16px;
  padding: 12px;
  background: linear-gradient(135deg, #fff8e1, #fff3cd);
  border-radius: 10px;
  text-align: center;
}

.points-earned {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #f39c12;
}

.points-earned strong {
  font-size: 18px;
  color: #e67e22;
}

.points-total {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.tips-section {
  padding: 0 16px 16px;
}

.tips-header {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  font-size: 11px;
  color: #888;
}

.tips-list li {
  margin: 3px 0;
}

.receipt-footer {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
}

.qr-area {
  margin-bottom: 12px;
}

.qr-box {
  width: 60px;
  height: 60px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 0 auto 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.qr-area span {
  font-size: 10px;
  color: #888;
}

.barcode {
  font-family: 'Libre Barcode 39', 'Courier New', monospace;
  font-size: 28px;
  margin: 8px 0;
}

.footer-message {
  font-size: 12px;
  color: #1e3c72;
  margin: 8px 0;
  font-weight: 500;
}

.footer-decoration {
  font-size: 10px;
  color: #ccc;
  letter-spacing: 2px;
  margin-top: 8px;
}
</style>
