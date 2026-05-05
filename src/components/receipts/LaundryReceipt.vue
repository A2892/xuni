<template>
  <div class="laundry-receipt" :class="`size-${previewSize}`">
    <div class="receipt-paper">
      <!-- 洗衣店头部 -->
      <div class="laundry-header">
        <div class="header-bubbles">
          <span>🫧</span>
          <span>🧺</span>
          <span>🫧</span>
        </div>
        <h1>{{ store.data.merchantName || '洁净洗衣店' }}</h1>
        <p class="store-slogan">{{ store.data.branchName || '专业洗护 品质保证' }}</p>
      </div>

      <div class="store-contact">
        <p>📍 {{ store.data.merchantAddress || '朝阳区望京街88号' }}</p>
        <p>📞 {{ store.data.merchantPhone || '010-66668888' }}</p>
        <p>⏰ 营业时间: {{ store.data.businessHours || '08:00-21:00' }}</p>
      </div>

      <div class="wave-divider">
        <svg viewBox="0 0 100 10" preserveAspectRatio="none">
          <path d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5" fill="none" stroke="#5dade2" stroke-width="1"/>
        </svg>
      </div>

      <!-- 取衣单号 - 重要突出显示 -->
      <div class="pickup-section">
        <div class="pickup-badge">
          <span class="pickup-label">取衣单号</span>
          <span class="pickup-number">{{ store.data.orderNumber || 'XY-' + store.data.receiptNumber.slice(-6) }}</span>
        </div>
        <p class="pickup-notice">⚠️ 请凭此单号取衣</p>
      </div>

      <!-- 客户信息 -->
      <div class="customer-section">
        <div class="info-row">
          <span class="label">客户姓名:</span>
          <span class="value">{{ store.data.customerName || '顾客' }}</span>
        </div>
        <div class="info-row">
          <span class="label">联系电话:</span>
          <span class="value">{{ store.data.customerPhone || '138****8888' }}</span>
        </div>
        <div class="info-row">
          <span class="label">送洗日期:</span>
          <span class="value">{{ store.data.date }} {{ store.data.time }}</span>
        </div>
        <div class="info-row highlight">
          <span class="label">预计取衣:</span>
          <span class="value">{{ getPickupDate() }}</span>
        </div>
      </div>

      <div class="bubbles-divider">
        ○ ● ○ ● ○ ● ○ ● ○ ● ○
      </div>

      <!-- 衣物明细 -->
      <div class="items-section">
        <div class="section-header">
          <span class="header-icon">👔</span>
          <span>洗护清单</span>
        </div>
        <div v-for="(item, index) in store.data.items" :key="item.id" class="laundry-item">
          <div class="item-number">{{ index + 1 }}</div>
          <div class="item-content">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-tags">
              <span v-if="item.category" class="service-tag">{{ item.category }}</span>
              <span v-if="item.notes" class="note-tag">{{ item.notes }}</span>
            </div>
          </div>
          <div class="item-price">
            <span v-if="item.quantity > 1" class="qty">×{{ item.quantity }}</span>
            <span class="amount">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
          </div>
        </div>
      </div>

      <div class="summary-divider"></div>

      <!-- 金额汇总 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>衣物数量:</span>
          <span>{{ totalItems }} 件</span>
        </div>
        <div class="summary-row">
          <span>洗护费用:</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="summary-row discount">
          <span>会员优惠:</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="summary-row total">
          <span>应付金额:</span>
          <span class="total-amount">{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <!-- 支付状态 -->
      <div class="payment-section">
        <div class="payment-status paid">
          <span class="status-icon">✓</span>
          <span>已付款</span>
          <span class="payment-method">{{ store.data.paymentMethod }}</span>
        </div>
      </div>

      <!-- 会员信息 -->
      <div v-if="store.data.membershipId" class="member-section">
        <div class="member-card">
          <div class="card-left">
            <span class="member-icon">🎫</span>
            <div class="member-info">
              <span class="member-level">{{ store.data.membershipLevel || '洗衣会员' }}</span>
              <span class="member-id">{{ store.data.membershipId }}</span>
            </div>
          </div>
          <div v-if="store.data.pointsEarned" class="card-right">
            <span class="points">+{{ store.data.pointsEarned }}积分</span>
          </div>
        </div>
      </div>

      <div class="wave-divider">
        <svg viewBox="0 0 100 10" preserveAspectRatio="none">
          <path d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5" fill="none" stroke="#5dade2" stroke-width="1"/>
        </svg>
      </div>

      <!-- 温馨提示 -->
      <div class="tips-section">
        <div class="tips-header">📋 取衣须知</div>
        <ul class="tips-list">
          <li>请凭取衣单号领取衣物</li>
          <li>超过30天未取将收取保管费</li>
          <li>取衣时请当面检查</li>
          <li>如有问题请于24小时内联系</li>
        </ul>
      </div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <div class="qr-section">
          <div class="qr-box">📱</div>
          <span>扫码查看洗护进度</span>
        </div>
        <div class="barcode-section">
          <div class="barcode">*{{ store.data.receiptNumber }}*</div>
        </div>
        <p class="footer-message">{{ store.data.footerMessage || '洁净如新，呵护您的每一件衣物' }}</p>
        <div class="footer-decoration">
          🫧 ～ 谢谢惠顾 ～ 🫧
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReceiptStore } from '@/stores/receipt'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'

withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useReceiptStore()

const totalItems = computed(() => {
  return store.data.items.reduce((sum, item) => sum + item.quantity, 0)
})

const getPickupDate = () => {
  const date = new Date(store.data.date)
  date.setDate(date.getDate() + 3)
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}
</script>

<style scoped>
.laundry-receipt {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.receipt-paper {
  width: 300px;
  background: linear-gradient(180deg, #e8f6fc 0%, #fff 15%);
  padding: 24px 20px;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(93, 173, 226, 0.2);
  position: relative;
}

.laundry-header {
  text-align: center;
  margin-bottom: 16px;
}

.header-bubbles {
  font-size: 24px;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.laundry-header h1 {
  font-size: 20px;
  margin: 0;
  color: #2980b9;
  font-weight: 700;
}

.store-slogan {
  font-size: 11px;
  color: #5dade2;
  margin: 6px 0 0;
}

.store-contact {
  text-align: center;
  font-size: 11px;
  color: #777;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8fcff;
  border-radius: 8px;
}

.store-contact p {
  margin: 3px 0;
}

.wave-divider {
  height: 12px;
  margin: 12px 0;
}

.wave-divider svg {
  width: 100%;
  height: 100%;
}

.pickup-section {
  text-align: center;
  margin-bottom: 16px;
}

.pickup-badge {
  display: inline-block;
  background: linear-gradient(135deg, #2980b9, #5dade2);
  padding: 12px 24px;
  border-radius: 12px;
  color: #fff;
}

.pickup-label {
  display: block;
  font-size: 10px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.pickup-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
}

.pickup-notice {
  font-size: 11px;
  color: #e74c3c;
  margin: 8px 0 0;
}

.customer-section {
  background: #f8fcff;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 5px 0;
}

.info-row .label {
  color: #888;
}

.info-row .value {
  color: #333;
}

.info-row.highlight {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed #d4e6f1;
}

.info-row.highlight .value {
  color: #e74c3c;
  font-weight: 600;
}

.bubbles-divider {
  text-align: center;
  color: #5dade2;
  font-size: 10px;
  margin: 12px 0;
  letter-spacing: 2px;
}

.items-section {
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #2980b9;
  margin-bottom: 10px;
}

.header-icon {
  font-size: 14px;
}

.laundry-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 6px;
  border: 1px solid #e8f4fc;
}

.item-number {
  width: 22px;
  height: 22px;
  background: #5dade2;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
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
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.service-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: #e8f4fc;
  color: #2980b9;
  border-radius: 4px;
}

.note-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: #fff8e6;
  color: #f39c12;
  border-radius: 4px;
}

.item-price {
  text-align: right;
}

.qty {
  display: block;
  font-size: 10px;
  color: #888;
}

.amount {
  font-size: 13px;
  font-weight: 600;
  color: #2980b9;
}

.summary-divider {
  border-top: 2px dashed #5dade2;
  margin: 12px 0;
}

.summary-section {
  margin-bottom: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 5px 0;
  color: #555;
}

.summary-row.discount {
  color: #27ae60;
}

.summary-row.total {
  font-size: 15px;
  font-weight: 700;
  color: #2980b9;
  padding-top: 8px;
  border-top: 1px solid #e8f4fc;
}

.total-amount {
  font-size: 20px;
}

.payment-section {
  margin-bottom: 12px;
}

.payment-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
}

.payment-status.paid {
  background: #e8f8f5;
  color: #27ae60;
}

.status-icon {
  font-size: 14px;
}

.payment-method {
  margin-left: auto;
  font-size: 11px;
  color: #888;
}

.member-section {
  margin-bottom: 12px;
}

.member-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: linear-gradient(135deg, #e8f4fc, #fff);
  border: 1px solid #d4e6f1;
  border-radius: 10px;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-icon {
  font-size: 20px;
}

.member-level {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #2980b9;
}

.member-id {
  display: block;
  font-size: 10px;
  color: #888;
}

.points {
  font-size: 12px;
  color: #f39c12;
  font-weight: 600;
}

.tips-section {
  background: #fff8e6;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.tips-header {
  font-size: 12px;
  font-weight: 600;
  color: #e67e22;
  margin-bottom: 8px;
}

.tips-list {
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
  color: #666;
}

.tips-list li {
  margin: 4px 0;
}

.receipt-footer {
  text-align: center;
}

.qr-section {
  margin-bottom: 10px;
}

.qr-box {
  width: 60px;
  height: 60px;
  background: #f8fcff;
  border: 1px solid #d4e6f1;
  border-radius: 8px;
  margin: 0 auto 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.qr-section span {
  font-size: 10px;
  color: #888;
}

.barcode-section {
  margin-bottom: 8px;
}

.barcode {
  font-family: 'Libre Barcode 39', 'Courier New', monospace;
  font-size: 26px;
}

.footer-message {
  font-size: 11px;
  color: #2980b9;
  margin: 8px 0;
}

.footer-decoration {
  font-size: 11px;
  color: #bbb;
  margin-top: 8px;
}
</style>
