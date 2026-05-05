<template>
  <div class="receipt-preview" ref="previewRef">
    <div class="receipt-paper" :class="paperStyle">
      <!-- 热敏打印机风格 -->
      <div v-if="paperStyle === 'thermal'" class="thermal-receipt">
        <div class="receipt-header">
          <div v-if="showLogo && logoUrl" class="store-logo">
            <img :src="logoUrl" alt="Logo" />
          </div>
          <h1 class="store-name">{{ storeName }}</h1>
          <p class="store-address">{{ storeAddress }}</p>
          <p class="store-phone">Tel: {{ storePhone }}</p>
        </div>

        <div class="receipt-divider dashed"></div>

        <div class="receipt-info">
          <div class="info-row">
            <span>单号:</span>
            <span>{{ receiptNumber }}</span>
          </div>
          <div class="info-row">
            <span>日期:</span>
            <span>{{ formatDateTime(receiptDate) }}</span>
          </div>
          <div class="info-row">
            <span>收银员:</span>
            <span>{{ cashierName }}</span>
          </div>
        </div>

        <div class="receipt-divider dashed"></div>

        <div class="receipt-items">
          <div v-for="(item, index) in items" :key="index" class="item-row">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-details">
              <span class="item-qty">x{{ item.quantity }}</span>
              <span class="item-price">{{ formatCurrency(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <div class="receipt-divider solid"></div>

        <div class="receipt-totals">
          <div class="total-row">
            <span>小计:</span>
            <span>{{ formatCurrency(subtotal) }}</span>
          </div>
          <div v-if="discount > 0" class="total-row discount">
            <span>优惠:</span>
            <span>-{{ formatCurrency(discount) }}</span>
          </div>
          <div v-if="taxRate > 0" class="total-row">
            <span>税费 ({{ taxRate }}%):</span>
            <span>{{ formatCurrency(taxAmount) }}</span>
          </div>
          <div class="total-row grand-total">
            <span>合计:</span>
            <span>{{ formatCurrency(grandTotal) }}</span>
          </div>
        </div>

        <div class="receipt-divider dashed"></div>

        <div class="payment-info">
          <div class="payment-row">
            <span>支付方式:</span>
            <span>{{ paymentMethod }}</span>
          </div>
          <div class="payment-row">
            <span>实付:</span>
            <span>{{ formatCurrency(amountPaid) }}</span>
          </div>
          <div v-if="change > 0" class="payment-row">
            <span>找零:</span>
            <span>{{ formatCurrency(change) }}</span>
          </div>
        </div>

        <div class="receipt-divider dashed"></div>

        <div class="receipt-footer">
          <p class="thank-you">{{ thankYouMessage }}</p>
          <div v-if="showQRCode" class="qr-code">
            <div class="qr-placeholder">
              <span>扫码关注</span>
            </div>
          </div>
          <p v-if="footerNote" class="footer-note">{{ footerNote }}</p>
        </div>

        <!-- 撕纸边缘效果 -->
        <div class="paper-tear"></div>
      </div>

      <!-- 标准收据风格 -->
      <div v-else class="standard-receipt">
        <header class="receipt-header">
          <div v-if="showLogo && logoUrl" class="store-logo">
            <img :src="logoUrl" alt="Logo" />
          </div>
          <div class="store-info">
            <h1>{{ storeName }}</h1>
            <p>{{ storeAddress }}</p>
            <p>电话: {{ storePhone }}</p>
          </div>
        </header>

        <div class="receipt-title">
          <h2>销售收据 / Sales Receipt</h2>
        </div>

        <div class="receipt-meta">
          <div class="meta-item">
            <label>收据号码:</label>
            <span>{{ receiptNumber }}</span>
          </div>
          <div class="meta-item">
            <label>日期时间:</label>
            <span>{{ formatDateTime(receiptDate) }}</span>
          </div>
          <div class="meta-item">
            <label>收银员:</label>
            <span>{{ cashierName }}</span>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>商品名称</th>
              <th>单价</th>
              <th>数量</th>
              <th>金额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="index">
              <td>{{ item.name }}</td>
              <td>{{ formatCurrency(item.price) }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ formatCurrency(item.price * item.quantity) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-line">
            <span>小计:</span>
            <span>{{ formatCurrency(subtotal) }}</span>
          </div>
          <div v-if="discount > 0" class="total-line discount">
            <span>折扣优惠:</span>
            <span>-{{ formatCurrency(discount) }}</span>
          </div>
          <div v-if="taxRate > 0" class="total-line">
            <span>税费 ({{ taxRate }}%):</span>
            <span>{{ formatCurrency(taxAmount) }}</span>
          </div>
          <div class="total-line grand">
            <span>应付金额:</span>
            <span>{{ formatCurrency(grandTotal) }}</span>
          </div>
        </div>

        <div class="payment-section">
          <h3>支付信息</h3>
          <div class="payment-detail">
            <span>支付方式: {{ paymentMethod }}</span>
            <span>实付金额: {{ formatCurrency(amountPaid) }}</span>
          </div>
          <div v-if="change > 0" class="change-info">
            找零: {{ formatCurrency(change) }}
          </div>
        </div>

        <footer class="receipt-footer">
          <p class="thank-message">{{ thankYouMessage }}</p>
          <p v-if="footerNote" class="note">{{ footerNote }}</p>
          <div v-if="showQRCode" class="qr-section">
            <div class="qr-placeholder"></div>
            <span>扫码评价</span>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ReceiptItem {
  name: string
  price: number
  quantity: number
}

const props = withDefaults(defineProps<{
  paperStyle?: 'thermal' | 'standard'
  storeName?: string
  storeAddress?: string
  storePhone?: string
  showLogo?: boolean
  logoUrl?: string
  receiptNumber?: string
  receiptDate?: string
  cashierName?: string
  items?: ReceiptItem[]
  discount?: number
  taxRate?: number
  paymentMethod?: string
  amountPaid?: number
  thankYouMessage?: string
  footerNote?: string
  showQRCode?: boolean
  currency?: string
}>(), {
  paperStyle: 'thermal',
  storeName: '便利超市',
  storeAddress: '上海市浦东新区张江高科技园区',
  storePhone: '021-12345678',
  showLogo: false,
  logoUrl: '',
  receiptNumber: 'RC20260102001',
  receiptDate: new Date().toISOString(),
  cashierName: '张三',
  items: () => [
    { name: '可口可乐 500ml', price: 3.5, quantity: 2 },
    { name: '康师傅方便面', price: 4.5, quantity: 1 },
    { name: '乐事薯片 原味', price: 8.9, quantity: 1 },
    { name: '纸巾抽纸 3包装', price: 12.9, quantity: 1 }
  ],
  discount: 0,
  taxRate: 0,
  paymentMethod: '微信支付',
  amountPaid: 50,
  thankYouMessage: '感谢您的光临，欢迎再次惠顾！',
  footerNote: '',
  showQRCode: true,
  currency: 'CNY'
})

const previewRef = ref()

const subtotal = computed(() => {
  return props.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const taxAmount = computed(() => {
  return (subtotal.value - props.discount) * (props.taxRate / 100)
})

const grandTotal = computed(() => {
  return subtotal.value - props.discount + taxAmount.value
})

const change = computed(() => {
  return Math.max(0, props.amountPaid - grandTotal.value)
})

const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: props.currency,
    minimumFractionDigits: 2
  })
  return formatter.format(value)
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

defineExpose({ previewRef })
</script>

<style scoped>
.receipt-preview {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #e8e8e8;
  min-height: 100%;
}

.receipt-paper {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 热敏打印机风格 */
.receipt-paper.thermal {
  width: 300px;
  font-family: 'Courier New', monospace;
}

.thermal-receipt {
  padding: 16px;
}

.thermal-receipt .receipt-header {
  text-align: center;
  margin-bottom: 12px;
}

.thermal-receipt .store-logo {
  margin-bottom: 8px;
}

.thermal-receipt .store-logo img {
  max-width: 80px;
  max-height: 40px;
}

.thermal-receipt .store-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 4px 0;
}

.thermal-receipt .store-address,
.thermal-receipt .store-phone {
  font-size: 11px;
  margin: 2px 0;
  color: #333;
}

.receipt-divider {
  margin: 12px 0;
}

.receipt-divider.dashed {
  border-top: 1px dashed #333;
}

.receipt-divider.solid {
  border-top: 2px solid #333;
}

.receipt-info .info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 4px 0;
}

.receipt-items .item-row {
  margin: 8px 0;
}

.item-name {
  font-size: 12px;
  font-weight: 500;
}

.item-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #555;
  padding-left: 12px;
}

.receipt-totals .total-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 4px 0;
}

.total-row.discount {
  color: #e74c3c;
}

.total-row.grand-total {
  font-size: 16px;
  font-weight: bold;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #333;
}

.payment-info .payment-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 4px 0;
}

.receipt-footer {
  text-align: center;
  margin-top: 12px;
}

.thank-you {
  font-size: 12px;
  margin: 8px 0;
}

.qr-code {
  margin: 12px 0;
}

.qr-placeholder {
  width: 80px;
  height: 80px;
  border: 2px solid #333;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  background: repeating-linear-gradient(
    45deg,
    #f0f0f0,
    #f0f0f0 5px,
    #fff 5px,
    #fff 10px
  );
}

.footer-note {
  font-size: 10px;
  color: #666;
  margin-top: 8px;
}

.paper-tear {
  height: 8px;
  background: linear-gradient(
    135deg,
    transparent 33.33%,
    white 33.33%,
    white 66.67%,
    transparent 66.67%
  );
  background-size: 8px 100%;
  margin-top: 16px;
}

/* 标准收据风格 */
.receipt-paper.standard {
  width: 400px;
  font-family: 'Arial', sans-serif;
}

.standard-receipt {
  padding: 30px;
}

.standard-receipt .receipt-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #333;
  margin-bottom: 20px;
}

.standard-receipt .store-logo img {
  max-width: 60px;
  max-height: 60px;
}

.standard-receipt .store-info h1 {
  font-size: 20px;
  margin: 0 0 4px 0;
}

.standard-receipt .store-info p {
  font-size: 12px;
  margin: 2px 0;
  color: #555;
}

.receipt-title {
  text-align: center;
  margin-bottom: 20px;
}

.receipt-title h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.receipt-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 4px;
}

.meta-item {
  font-size: 12px;
}

.meta-item label {
  color: #666;
  display: block;
  margin-bottom: 2px;
}

.meta-item span {
  font-weight: 500;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.items-table th {
  background: #f0f0f0;
  padding: 10px 8px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

.items-table th:last-child {
  text-align: right;
}

.items-table td {
  padding: 10px 8px;
  font-size: 12px;
  border-bottom: 1px solid #eee;
}

.items-table td:last-child {
  text-align: right;
}

.totals-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 4px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin: 6px 0;
}

.total-line.discount {
  color: #e74c3c;
}

.total-line.grand {
  font-size: 18px;
  font-weight: bold;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #ddd;
}

.payment-section {
  margin-bottom: 20px;
}

.payment-section h3 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #333;
}

.payment-detail {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 10px;
  background: #e8f5e9;
  border-radius: 4px;
}

.change-info {
  text-align: right;
  font-size: 12px;
  margin-top: 8px;
  color: #666;
}

.standard-receipt .receipt-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px dashed #ddd;
}

.thank-message {
  font-size: 14px;
  color: #333;
  margin: 0 0 8px 0;
}

.note {
  font-size: 11px;
  color: #888;
}

.qr-section {
  margin-top: 16px;
}

.qr-section .qr-placeholder {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  margin: 0 auto 4px;
}

.qr-section span {
  font-size: 10px;
  color: #888;
}
</style>
