<template>
  <div class="electronics-receipt" :class="`size-${previewSize}`">
    <div class="receipt-paper">
      <!-- 科技感头部 -->
      <div class="tech-header">
        <div class="header-glow"></div>
        <div class="store-logo">📱</div>
        <h1>{{ store.data.merchantName || '数码科技城' }}</h1>
        <p class="store-subtitle">{{ store.data.branchName || 'Digital Technology Store' }}</p>
      </div>

      <div class="contact-strip">
        <span>📍 {{ store.data.merchantAddress || '中关村数码广场A座' }}</span>
        <span>📞 {{ store.data.merchantPhone || '400-888-8888' }}</span>
      </div>

      <div class="tech-divider">
        <div class="divider-line"></div>
        <span class="divider-icon">⚡</span>
        <div class="divider-line"></div>
      </div>

      <!-- 交易信息 -->
      <div class="transaction-section">
        <div class="tx-grid">
          <div class="tx-item">
            <span class="tx-label">订单号</span>
            <span class="tx-value">{{ store.data.receiptNumber }}</span>
          </div>
          <div class="tx-item">
            <span class="tx-label">日期</span>
            <span class="tx-value">{{ store.data.date }}</span>
          </div>
          <div class="tx-item">
            <span class="tx-label">时间</span>
            <span class="tx-value">{{ store.data.time }}</span>
          </div>
          <div class="tx-item">
            <span class="tx-label">销售员</span>
            <span class="tx-value">{{ store.data.cashier }}</span>
          </div>
        </div>
      </div>

      <!-- 产品明细 -->
      <div class="products-section">
        <div class="section-header">
          <span class="header-icon">🛒</span>
          <span>购买产品</span>
        </div>
        <div v-for="item in store.data.items" :key="item.id" class="product-card">
          <div class="product-icon">{{ getProductIcon(item.category) }}</div>
          <div class="product-info">
            <div class="product-name">{{ item.name }}</div>
            <div v-if="item.notes" class="product-spec">{{ item.notes }}</div>
            <div class="product-codes">
              <span v-if="item.sku" class="sku-tag">SN: {{ item.sku }}</span>
              <span v-if="item.category" class="category-tag">{{ item.category }}</span>
            </div>
          </div>
          <div class="product-price">
            <div class="price-qty">
              <span v-if="item.quantity > 1">{{ item.quantity }} ×</span>
              {{ store.formatCurrency(item.unitPrice) }}
            </div>
            <div class="price-total">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</div>
          </div>
        </div>
      </div>

      <div class="neon-divider"></div>

      <!-- 金额汇总 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>商品合计</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="summary-row discount">
          <span>优惠金额</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div v-if="store.data.taxRate > 0" class="summary-row">
          <span>税费 ({{ store.data.taxRate }}%)</span>
          <span>{{ store.formatCurrency(store.calculatedTaxAmount) }}</span>
        </div>
        <div class="summary-row total">
          <span>实付金额</span>
          <span class="total-amount">{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="payment-section">
        <div class="payment-badge">
          <span class="payment-icon">💳</span>
          <span>{{ store.data.paymentMethod }}</span>
        </div>
        <div v-if="store.data.cardLast4" class="card-info">
          卡号: **** **** **** {{ store.data.cardLast4 }}
        </div>
      </div>

      <div class="tech-divider">
        <div class="divider-line"></div>
        <span class="divider-icon">🔒</span>
        <div class="divider-line"></div>
      </div>

      <!-- 保修信息 -->
      <div class="warranty-section">
        <div class="warranty-header">
          <span class="warranty-icon">🛡️</span>
          <span>质保信息</span>
        </div>
        <div class="warranty-content">
          <div class="warranty-item">
            <span class="label">保修期限:</span>
            <span class="value">{{ store.data.warrantyInfo || '12个月' }}</span>
          </div>
          <div class="warranty-item">
            <span class="label">保修起始:</span>
            <span class="value">{{ store.data.date }}</span>
          </div>
          <div class="warranty-item">
            <span class="label">售后热线:</span>
            <span class="value highlight">400-888-8888</span>
          </div>
        </div>
        <div class="warranty-notice">
          ⚠️ 请妥善保管此收据作为保修凭证
        </div>
      </div>

      <!-- 延保服务 -->
      <div v-if="store.data.membershipId" class="extended-warranty">
        <div class="extend-badge">
          <span class="badge-icon">⭐</span>
          <span>已购买延保服务</span>
        </div>
        <div class="extend-info">
          延保编号: {{ store.data.membershipId }}
        </div>
      </div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <div class="qr-row">
          <div class="qr-item">
            <div class="qr-box">📱</div>
            <span>产品注册</span>
          </div>
          <div class="qr-item">
            <div class="qr-box">🔧</div>
            <span>售后服务</span>
          </div>
        </div>
        <div class="barcode-section">
          <div class="barcode">||| || ||| | || ||| || | ||</div>
          <span>{{ store.data.receiptNumber }}</span>
        </div>
        <p class="footer-message">{{ store.data.footerMessage || '感谢购买！享受科技带来的便利生活' }}</p>
        <div class="footer-tech">
          ━━━ THANK YOU ━━━
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

const getProductIcon = (category?: string) => {
  const icons: Record<string, string> = {
    '手机': '📱',
    '电脑': '💻',
    '平板': '📟',
    '耳机': '🎧',
    '相机': '📷',
    '手表': '⌚',
    '配件': '🔌',
    '存储': '💾',
    '家电': '🖥️'
  }
  return icons[category || ''] || '📦'
}
</script>

<style scoped>
.electronics-receipt {
  font-family: 'PingFang SC', 'SF Pro Display', sans-serif;
}

.receipt-paper {
  width: 320px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 20%, #0f0f23 100%);
  padding: 24px 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.receipt-paper::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.tech-header {
  text-align: center;
  margin-bottom: 16px;
  position: relative;
}

.header-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(52, 152, 219, 0.3) 0%, transparent 70%);
  border-radius: 50%;
}

.store-logo {
  font-size: 48px;
  margin-bottom: 12px;
  position: relative;
}

.tech-header h1 {
  font-size: 20px;
  margin: 0;
  color: #fff;
  font-weight: 700;
}

.store-subtitle {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 0 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.contact-strip {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.tech-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #3498db, transparent);
}

.divider-icon {
  font-size: 12px;
  color: #3498db;
}

.transaction-section {
  margin-bottom: 16px;
}

.tx-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.tx-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 10px;
  border-radius: 6px;
}

.tx-label {
  display: block;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
}

.tx-value {
  font-size: 11px;
  color: #fff;
}

.products-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #3498db;
  margin-bottom: 12px;
}

.header-icon {
  font-size: 14px;
}

.product-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 8px;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.product-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.product-spec {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.product-codes {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.sku-tag {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
  font-family: monospace;
}

.category-tag {
  font-size: 9px;
  padding: 1px 6px;
  background: rgba(52, 152, 219, 0.3);
  border-radius: 3px;
  color: #3498db;
}

.product-price {
  text-align: right;
}

.price-qty {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2px;
}

.price-total {
  font-size: 14px;
  font-weight: 600;
  color: #3498db;
}

.neon-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #3498db, #9b59b6, #3498db, transparent);
  margin: 16px 0;
  box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
}

.summary-section {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 6px 0;
  color: rgba(255, 255, 255, 0.8);
}

.summary-row.discount {
  color: #2ecc71;
}

.summary-row.total {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 10px;
}

.total-amount {
  font-size: 22px;
  color: #3498db;
}

.payment-section {
  text-align: center;
  margin-bottom: 16px;
}

.payment-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(155, 89, 182, 0.2));
  border: 1px solid rgba(52, 152, 219, 0.3);
  border-radius: 20px;
  font-size: 12px;
}

.payment-icon {
  font-size: 14px;
}

.card-info {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
}

.warranty-section {
  background: rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.warranty-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #2ecc71;
  margin-bottom: 10px;
}

.warranty-icon {
  font-size: 14px;
}

.warranty-content {
  font-size: 11px;
}

.warranty-item {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
}

.warranty-item .label {
  color: rgba(255, 255, 255, 0.6);
}

.warranty-item .value {
  color: #fff;
}

.warranty-item .highlight {
  color: #2ecc71;
}

.warranty-notice {
  margin-top: 10px;
  padding: 6px 8px;
  background: rgba(241, 196, 15, 0.1);
  border-radius: 4px;
  font-size: 10px;
  color: #f1c40f;
  text-align: center;
}

.extended-warranty {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.2), rgba(52, 152, 219, 0.2));
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
  text-align: center;
}

.extend-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #9b59b6;
  margin-bottom: 4px;
}

.badge-icon {
  font-size: 14px;
}

.extend-info {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.qr-item span {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
}

.barcode-section {
  margin-bottom: 10px;
}

.barcode {
  font-family: 'Libre Barcode 39', 'Courier New', monospace;
  font-size: 28px;
  color: #fff;
}

.barcode-section span {
  display: block;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

.footer-message {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin: 8px 0;
}

.footer-tech {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 3px;
  margin-top: 8px;
}
</style>
