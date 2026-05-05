<template>
  <div class="supermarket-receipt" :class="`size-${previewSize}`" :style="receiptStyle">
    <div class="receipt-paper" :class="`paper-${store.designSettings.paperStyle}`" :style="paperStyle">
      <!-- 商店头部 -->
      <div class="store-header" :style="headerStyle">
        <div class="store-logo">🛒</div>
        <h1 class="store-name">{{ store.data.merchantName }}</h1>
        <p class="store-slogan">{{ store.data.slogan || '新鲜每一天 Fresh Everyday' }}</p>
        <p class="store-address">{{ store.data.merchantAddress }}</p>
        <p class="store-phone">电话: {{ store.data.merchantPhone }}</p>
      </div>

      <div class="dotted-line"></div>

      <!-- 交易信息 -->
      <div class="transaction-header">
        <div class="tx-row">
          <span>收银机号: {{ store.data.terminalId || 'POS-01' }}</span>
          <span>单号: {{ store.data.receiptNumber }}</span>
        </div>
        <div class="tx-row">
          <span>收银员: {{ store.data.cashier }}</span>
          <span>{{ store.data.date }} {{ store.data.time }}</span>
        </div>
      </div>

      <div class="double-line"></div>

      <!-- 商品清单 -->
      <div class="items-list">
        <div class="list-header">
          <span class="col-name">商品名称</span>
          <span class="col-qty">数量</span>
          <span class="col-price">单价</span>
          <span class="col-total">金额</span>
        </div>
        <div class="dotted-line thin"></div>
        
        <div v-for="(item, index) in store.data.items" :key="item.id" class="item-row">
          <div class="item-name-row">
            <span class="item-index">{{ index + 1 }}.</span>
            <span class="item-name">{{ item.name }}</span>
            <span v-if="item.sku" class="item-barcode">{{ item.sku }}</span>
          </div>
          <div class="item-calc-row">
            <span class="item-qty">{{ item.quantity }}{{ item.unit || '' }}</span>
            <span class="item-price">{{ store.formatCurrency(item.unitPrice) }}</span>
            <span class="item-total">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
          </div>
          <div v-if="item.discount && item.discount > 0" class="item-discount">
            优惠: -{{ store.formatCurrency(item.discount) }}
          </div>
        </div>
      </div>

      <div class="double-line"></div>

      <!-- 汇总区域 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>商品数量:</span>
          <span>{{ totalQuantity }} 件</span>
        </div>
        <div class="summary-row">
          <span>商品金额:</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="summary-row discount">
          <span>优惠金额:</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="summary-row total">
          <span>应付金额:</span>
          <span>{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <div class="dotted-line"></div>

      <!-- 支付信息 -->
      <div class="payment-section">
        <div class="payment-row">
          <span>支付方式:</span>
          <span>{{ store.data.paymentMethod }}</span>
        </div>
        <div class="payment-row">
          <span>实付金额:</span>
          <span>{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
        <div v-if="store.data.change && store.data.change > 0" class="payment-row">
          <span>找零:</span>
          <span>{{ store.formatCurrency(store.data.change || 0) }}</span>
        </div>
        <div v-if="store.data.cardLast4" class="payment-row">
          <span>卡号:</span>
          <span>**** **** **** {{ store.data.cardLast4 }}</span>
        </div>
      </div>

      <!-- 会员信息 -->
      <div v-if="store.data.membershipId" class="member-section">
        <div class="dotted-line"></div>
        <div class="member-info">
          <span>会员卡号: {{ store.data.membershipId }}</span>
          <span v-if="store.data.pointsEarned">本次积分: +{{ store.data.pointsEarned }}</span>
          <span v-if="store.data.memberPoints">累计积分: {{ store.data.memberPoints }}</span>
        </div>
      </div>

      <div class="dotted-line"></div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <p class="footer-notice">{{ store.data.footerMessage || '请凭小票在7日内办理退换货' }}</p>
        <p class="footer-notice">售后电话: {{ store.data.merchantPhone }}</p>
        
        <div class="barcode-area">
          <div class="barcode-placeholder">
            *{{ store.data.receiptNumber }}*
          </div>
          <span class="barcode-number">{{ store.data.receiptNumber }}</span>
        </div>

        <div class="qr-row">
          <div class="qr-item">
            <img v-if="memberQr" :src="memberQr" class="qr-img" alt="会员码" />
            <span>会员注册</span>
          </div>
          <div class="qr-item">
            <img v-if="invoiceQr" :src="invoiceQr" class="qr-img" alt="发票码" />
            <span>电子发票</span>
          </div>
        </div>

        <p class="thank-you">***  欢迎再次光临  ***</p>
      </div>

      <!-- 撕纸效果 -->
      <div class="tear-edge"></div>
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

const totalQuantity = computed(() => {
  return store.data.items.reduce((sum, item) => sum + item.quantity, 0)
})

const memberQr = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent('https://member.example.com')}`
})

const invoiceQr = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`https://invoice.example.com/${store.data.receiptNumber}`)}`
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
  boxShadow: store.designSettings.showShadow ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
}))

const headerStyle = computed(() => ({
  // Header specific styles if needed
}))
</script>

<style scoped>
.supermarket-receipt {
  width: 280px;
  font-family: var(--font-family, 'Courier New', 'SimHei', monospace);
}

.receipt-paper {
  background: #fff;
  padding: 16px 12px;
  position: relative;
}

.store-header {
  text-align: center;
  margin-bottom: 12px;
}

.store-logo {
  font-size: 36px;
  margin-bottom: 8px;
}

.store-name {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  letter-spacing: 2px;
  color: var(--primary-color, inherit);
}

.store-slogan {
  font-size: 10px;
  color: #666;
  margin: 4px 0;
}

.store-address, .store-phone {
  font-size: 10px;
  color: #333;
  margin: 2px 0;
}

.dotted-line {
  border-bottom: 1px dashed #999;
  margin: 10px 0;
}

.dotted-line.thin {
  margin: 6px 0;
  border-color: #ccc;
}

.double-line {
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  height: 4px;
  margin: 10px 0;
}

.transaction-header {
  font-size: 10px;
  margin-bottom: 8px;
}

.tx-row {
  display: flex;
  justify-content: space-between;
  margin: 2px 0;
}

.items-list {
  margin: 8px 0;
}

.list-header {
  display: grid;
  grid-template-columns: 1fr 40px 50px 50px;
  font-size: 10px;
  font-weight: bold;
  color: #333;
}

.item-row {
  padding: 6px 0;
  border-bottom: 1px dotted #eee;
}

.item-row:last-child {
  border-bottom: none;
}

.item-name-row {
  display: flex;
  gap: 4px;
  font-size: 11px;
  margin-bottom: 2px;
}

.item-index {
  color: #999;
  min-width: 20px;
}

.item-name {
  flex: 1;
  font-weight: 500;
}

.item-barcode {
  font-size: 9px;
  color: #999;
}

.item-calc-row {
  display: grid;
  grid-template-columns: 1fr 40px 50px 50px;
  font-size: 10px;
  padding-left: 20px;
}

.item-qty {
  color: #666;
}

.item-price {
  text-align: right;
  color: #666;
}

.item-total {
  text-align: right;
  font-weight: 500;
}

.item-discount {
  font-size: 10px;
  color: #e74c3c;
  padding-left: 20px;
}

.summary-section {
  margin: 10px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  padding: 3px 0;
}

.summary-row.discount {
  color: #e74c3c;
}

.summary-row.total {
  font-size: 14px;
  font-weight: bold;
  padding: 8px 0;
  border-top: 1px dashed #333;
  margin-top: 6px;
}

.payment-section {
  margin: 10px 0;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  padding: 2px 0;
}

.member-section {
  margin: 10px 0;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  color: #666;
}

.receipt-footer {
  text-align: center;
  margin-top: 12px;
}

.footer-notice {
  font-size: 9px;
  color: #666;
  margin: 2px 0;
}

.barcode-area {
  margin: 12px 0;
}

.barcode-placeholder {
  font-family: 'Libre Barcode 39', monospace;
  font-size: 32px;
  letter-spacing: -2px;
  line-height: 1;
}

.barcode-number {
  font-size: 9px;
  display: block;
  margin-top: 4px;
}

.qr-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 12px 0;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.qr-img {
  width: 50px;
  height: 50px;
}

.qr-item span {
  font-size: 9px;
  color: #666;
}

.thank-you {
  font-size: 12px;
  font-weight: bold;
  margin-top: 12px;
  letter-spacing: 1px;
}

.tear-edge {
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(135deg, #fff 25%, transparent 25%),
              linear-gradient(225deg, #fff 25%, transparent 25%);
  background-size: 8px 8px;
}

/* 手机尺寸 */
.supermarket-receipt.size-mobile {
  width: 260px;
  font-size: 9px;
}

.size-mobile .store-name {
  font-size: 18px;
}

.size-mobile .receipt-paper {
  padding: 12px 10px;
}

/* 电脑尺寸 */
.supermarket-receipt.size-desktop {
  width: 360px;
}

.size-desktop .receipt-paper {
  padding: 24px 20px;
}

.size-desktop .store-name {
  font-size: 24px;
}

.size-desktop .item-name-row {
  font-size: 13px;
}

.size-desktop .summary-row.total {
  font-size: 16px;
}
</style>
