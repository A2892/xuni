<template>
  <div class="cn-bill-preview" :class="[`template-${store.data.template}`, `type-${store.data.billType}`]" :style="previewStyle">
    <!-- 水印 -->
    <div v-if="store.designSettings.watermarkEnabled" class="watermark-layer" :class="store.designSettings.watermarkType">
      <template v-if="store.designSettings.watermarkType === 'fullscreen'">
        <span v-for="i in 20" :key="i" class="watermark-text" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
          {{ store.designSettings.watermarkText }}
        </span>
      </template>
      <span v-else class="watermark-center" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
        {{ store.designSettings.watermarkText }}
      </span>
    </div>
    
    <!-- 边框 -->
    <div v-if="store.designSettings.borderEnabled" class="custom-border" :style="{
      border: store.designSettings.borderWidth + 'px solid ' + store.designSettings.borderColor
    }"></div>
    
    <!-- 标准模板 -->
    <div v-if="store.data.template === 'standard'" class="bill-standard">
      <!-- 账单头部 -->
      <div class="bill-header">
        <div class="header-icon">{{ billTypes[store.data.billType].icon }}</div>
        <div class="header-info">
          <div class="bill-title">{{ billTypes[store.data.billType].name }}</div>
          <div class="bill-month">{{ store.formatMonth(store.data.billMonth) }}</div>
        </div>
        <div class="header-status" :class="store.data.paymentStatus">
          {{ paymentStatusText }}
        </div>
      </div>

      <!-- 供应商信息 -->
      <div class="provider-section">
        <div class="provider-name">{{ store.data.providerName }}</div>
        <div class="provider-hotline">服务热线: {{ store.data.providerHotline }}</div>
      </div>

      <!-- 用户信息 -->
      <div class="user-section">
        <div class="section-title">📋 用户信息</div>
        <div class="user-grid">
          <div class="user-item">
            <span class="label">户名:</span>
            <span class="value">{{ store.data.userName }}</span>
          </div>
          <div class="user-item">
            <span class="label">户号:</span>
            <span class="value user-number">{{ store.data.userNumber }}</span>
          </div>
          <div class="user-item full">
            <span class="label">地址:</span>
            <span class="value">{{ store.data.userAddress }}</span>
          </div>
        </div>
      </div>

      <!-- 费用明细 -->
      <div class="detail-section">
        <div class="section-title">📊 费用明细</div>
        <table class="detail-table">
          <thead>
            <tr>
              <th>项目</th>
              <th>上期读数</th>
              <th>本期读数</th>
              <th>用量</th>
              <th>单价</th>
              <th>金额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.data.items" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.previousReading }}</td>
              <td>{{ item.currentReading }}</td>
              <td>{{ item.usage }} {{ item.unit || primaryUnit }}</td>
              <td>¥{{ item.unitPrice.toFixed(4) }}</td>
              <td class="amount">¥{{ item.amount.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 用量图表 -->
      <div v-if="store.data.showUsageChart" class="usage-chart">
        <div class="chart-title">本期用量: {{ store.totalUsage }} {{ primaryUnit }}</div>
        <div class="chart-bar">
          <div class="bar-fill" :style="{ width: Math.min(store.totalUsage / 5, 100) + '%', background: billTypes[store.data.billType].color }"></div>
        </div>
      </div>

      <!-- 金额汇总 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>本期费用小计</span>
          <span>¥{{ store.data.subtotal.toFixed(2) }}</span>
        </div>
        <div v-if="store.data.previousBalance !== 0" class="summary-row">
          <span>上期余额</span>
          <span :class="{ negative: store.data.previousBalance < 0 }">
            {{ store.data.previousBalance > 0 ? '+' : '' }}¥{{ store.data.previousBalance.toFixed(2) }}
          </span>
        </div>
        <div v-if="store.data.lateFee > 0" class="summary-row">
          <span>滞纳金</span>
          <span class="late-fee">+¥{{ store.data.lateFee.toFixed(2) }}</span>
        </div>
        <div v-if="store.data.adjustment !== 0" class="summary-row">
          <span>调整金额</span>
          <span>{{ store.data.adjustment > 0 ? '+' : '' }}¥{{ store.data.adjustment.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>应缴金额</span>
          <span class="total-amount">¥{{ store.data.totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 缴费信息 -->
      <div class="payment-section">
        <div class="payment-info">
          <div class="payment-item">
            <span class="label">账单日期:</span>
            <span>{{ store.formatDate(store.data.issueDate) }}</span>
          </div>
          <div class="payment-item">
            <span class="label">缴费期限:</span>
            <span class="due-date">{{ store.formatDate(store.data.dueDate) }}</span>
          </div>
        </div>
        <div class="payment-notice">
          逾期缴费将按日加收 {{ store.data.billType === 'electricity' ? '0.1%' : '0.05%' }} 滞纳金
        </div>
      </div>

      <!-- 条形码 -->
      <div v-if="store.data.showBarcode" class="barcode-section">
        <template v-if="store.designSettings.barcodeSource === 'upload' && store.designSettings.barcodeImage">
          <img :src="store.designSettings.barcodeImage" alt="条形码" class="barcode-image" />
        </template>
        <template v-else>
          <canvas ref="barcodeCanvas" class="barcode-canvas"></canvas>
        </template>
      </div>

      <!-- 二维码 -->
      <div v-if="store.data.showQRCode" class="qrcode-section">
        <template v-if="store.designSettings.qrCodeSource === 'upload' && store.designSettings.qrCodeImage">
          <img :src="store.designSettings.qrCodeImage" alt="二维码" class="qrcode-image" />
        </template>
        <template v-else>
          <canvas ref="qrCanvas" class="qrcode-canvas"></canvas>
        </template>
        <div class="qrcode-tip">扫码支付</div>
      </div>

      <!-- 备注 -->
      <div v-if="store.data.remarks" class="remarks-section">
        <div class="remarks-label">备注:</div>
        <div class="remarks-text">{{ store.data.remarks }}</div>
      </div>
    </div>

    <!-- 现代模板 -->
    <div v-else-if="store.data.template === 'modern'" class="bill-modern">
      <div class="modern-header" :style="{ background: billTypes[store.data.billType].color }">
        <div class="modern-icon">{{ billTypes[store.data.billType].icon }}</div>
        <div class="modern-title">
          <div class="title-main">{{ billTypes[store.data.billType].name }}</div>
          <div class="title-sub">{{ store.formatMonth(store.data.billMonth) }}</div>
        </div>
        <div class="modern-status" :class="store.data.paymentStatus">
          {{ paymentStatusText }}
        </div>
      </div>

      <div class="modern-amount-card">
        <div class="amount-label">应缴金额</div>
        <div class="amount-value">¥{{ store.data.totalAmount.toFixed(2) }}</div>
        <div class="amount-deadline">请于 {{ store.formatDate(store.data.dueDate) }} 前缴费</div>
      </div>

      <div class="modern-user-card">
        <div class="user-avatar">{{ store.data.userName.charAt(0) }}</div>
        <div class="user-details">
          <div class="user-name">{{ store.data.userName }}</div>
          <div class="user-number">户号: {{ store.data.userNumber }}</div>
        </div>
      </div>

      <div class="modern-usage">
        <div class="usage-label">本期用量</div>
        <div class="usage-value">
          <span class="number">{{ store.totalUsage }}</span>
          <span class="unit">{{ primaryUnit }}</span>
        </div>
        <div class="usage-bar">
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: Math.min(store.totalUsage / 5, 100) + '%', background: billTypes[store.data.billType].color }"></div>
          </div>
        </div>
      </div>

      <div class="modern-details">
        <div class="detail-item" v-for="item in store.data.items" :key="item.id">
          <span class="detail-name">{{ item.name }}</span>
          <span class="detail-amount">¥{{ item.amount.toFixed(2) }}</span>
        </div>
        <div class="detail-item total">
          <span class="detail-name">合计</span>
          <span class="detail-amount">¥{{ store.data.subtotal.toFixed(2) }}</span>
        </div>
      </div>

      <div class="modern-footer">
        <div class="provider-info">
          <span>{{ store.data.providerName }}</span>
          <span>{{ store.data.providerHotline }}</span>
        </div>
      </div>
    </div>

    <!-- 简约模板 -->
    <div v-else class="bill-minimal">
      <div class="minimal-header">
        <span class="minimal-icon">{{ billTypes[store.data.billType].icon }}</span>
        <span class="minimal-title">{{ billTypes[store.data.billType].name }}</span>
        <span class="minimal-month">{{ store.formatMonth(store.data.billMonth) }}</span>
      </div>

      <div class="minimal-user">
        <div>{{ store.data.userName }} | {{ store.data.userNumber }}</div>
        <div class="address">{{ store.data.userAddress }}</div>
      </div>

      <div class="minimal-amount">
        <div class="amount-label">应缴金额</div>
        <div class="amount-value" :style="{ color: billTypes[store.data.billType].color }">
          ¥{{ store.data.totalAmount.toFixed(2) }}
        </div>
      </div>

      <div class="minimal-details">
        <div class="detail-row" v-for="item in store.data.items" :key="item.id">
          <span>{{ item.name }}: {{ item.usage }} {{ item.unit || primaryUnit }}</span>
          <span>¥{{ item.amount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="minimal-footer">
        <div>缴费期限: {{ store.formatDate(store.data.dueDate) }}</div>
        <div>服务热线: {{ store.data.providerHotline }}</div>
      </div>
    </div>

    <!-- 印章 -->
    <div v-if="store.designSettings.stampEnabled" class="stamp-container">
      <template v-if="store.designSettings.stampSource === 'upload' && store.designSettings.stampImage">
        <img :src="store.designSettings.stampImage" alt="印章" class="stamp-image" />
      </template>
      <template v-else>
        <div class="stamp-generated" :style="{ color: store.designSettings.stampColor, borderColor: store.designSettings.stampColor }">
          {{ store.designSettings.stampText }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useCNBillStore, billTypes } from '@/stores/cnBill'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

const store = useCNBillStore()
const qrCanvas = ref<HTMLCanvasElement>()
const barcodeCanvas = ref<HTMLCanvasElement>()

const previewStyle = computed(() => ({
  '--border-color': store.designSettings.borderColor,
  '--border-width': store.designSettings.borderWidth + 'px'
}))

const paymentStatusText = computed(() => {
  const statusMap = {
    unpaid: '待缴费',
    paid: '已缴费',
    overdue: '已逾期'
  }
  return statusMap[store.data.paymentStatus]
})

// 优先使用项目中声明的单位（例如 kWh），否则使用账单模板的默认单位
const primaryUnit = computed(() => {
  const units = store.data.items.map(i => i.unit).filter(Boolean)
  if (units.length) {
    if (store.data.billType === 'electricity') {
      if (units.includes('kWh')) return 'kWh'
      if (units.includes('度')) return '度'
    }
    return units[0]
  }
  return billTypes[store.data.billType].unit
})

// 生成真实二维码
const generateQRCode = async () => {
  if (!qrCanvas.value || store.designSettings.qrCodeSource === 'upload') return
  
  const content = store.designSettings.qrCodeContent || 
    `https://pay.example.com/bill/${store.data.billNumber}?amount=${store.calculatedTotal}`
  
  try {
    await QRCode.toCanvas(qrCanvas.value, content, {
      width: 80,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (err) {
    console.error('QR Code generation failed:', err)
  }
}

// 生成真实条形码
const generateBarcode = () => {
  if (!barcodeCanvas.value || store.designSettings.barcodeSource === 'upload') return
  
  const content = store.designSettings.barcodeContent || store.data.billNumber
  
  try {
    JsBarcode(barcodeCanvas.value, content, {
      format: 'CODE128',
      width: 1.5,
      height: 40,
      displayValue: true,
      fontSize: 12,
      margin: 5
    })
  } catch (err) {
    console.error('Barcode generation failed:', err)
  }
}

onMounted(() => {
  generateQRCode()
  generateBarcode()
})

watch(() => [store.designSettings.qrCodeSource, store.designSettings.qrCodeContent, store.data.billNumber], () => {
  generateQRCode()
})

watch(() => [store.designSettings.barcodeSource, store.designSettings.barcodeContent, store.data.billNumber], () => {
  generateBarcode()
})
</script>

<style scoped>
.cn-bill-preview {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #fff;
  width: 450px;
  position: relative;
}

/* 标准模板 */
.bill-standard {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.bill-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
  border-bottom: 1px solid #e0e0e0;
}

.header-icon {
  font-size: 40px;
  margin-right: 16px;
}

.header-info {
  flex: 1;
}

.bill-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.bill-month {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.header-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.header-status.unpaid {
  background: #fff3e0;
  color: #e65100;
}

.header-status.paid {
  background: #e8f5e9;
  color: #2e7d32;
}

.header-status.overdue {
  background: #ffebee;
  color: #c62828;
}

.provider-section {
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.provider-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.provider-hotline {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.user-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.user-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.user-item {
  font-size: 13px;
}

.user-item.full {
  grid-column: span 2;
}

.user-item .label {
  color: #888;
  margin-right: 8px;
}

.user-item .value {
  color: #333;
}

.user-number {
  font-family: monospace;
  letter-spacing: 1px;
}

.detail-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.detail-table th,
.detail-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.detail-table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #666;
}

.detail-table td.amount {
  font-weight: 600;
  color: #333;
}

.usage-chart {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.chart-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.chart-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.summary-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: #666;
}

.summary-row.total {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px dashed #ddd;
  font-weight: 600;
  color: #333;
}

.total-amount {
  font-size: 20px;
  color: #e65100;
}

.late-fee {
  color: #c62828;
}

.negative {
  color: #2e7d32;
}

.payment-section {
  padding: 16px 20px;
  background: #fff8e1;
  border-bottom: 1px solid #e0e0e0;
}

.payment-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.payment-item {
  font-size: 12px;
}

.payment-item .label {
  color: #888;
  margin-right: 4px;
}

.due-date {
  font-weight: 600;
  color: #e65100;
}

.payment-notice {
  font-size: 11px;
  color: #888;
}

.barcode-section {
  padding: 16px 20px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.barcode {
  display: flex;
  justify-content: center;
  gap: 1px;
  height: 40px;
  margin-bottom: 8px;
}

.barcode-bar {
  background: #000;
  height: 100%;
}

.barcode-number {
  font-size: 12px;
  font-family: monospace;
  color: #666;
}

.remarks-section {
  padding: 12px 20px;
  font-size: 12px;
}

.remarks-label {
  color: #888;
  margin-bottom: 4px;
}

.remarks-text {
  color: #666;
}

/* 现代模板 */
.bill-modern {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.modern-header {
  display: flex;
  align-items: center;
  padding: 24px;
  color: #fff;
}

.modern-icon {
  font-size: 36px;
  margin-right: 16px;
  filter: grayscale(1) brightness(10);
}

.modern-title {
  flex: 1;
}

.title-main {
  font-size: 20px;
  font-weight: bold;
}

.title-sub {
  font-size: 14px;
  opacity: 0.9;
}

.modern-status {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.modern-amount-card {
  margin: -20px 20px 20px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.amount-label {
  font-size: 14px;
  color: #888;
}

.amount-value {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin: 8px 0;
}

.amount-deadline {
  font-size: 12px;
  color: #e65100;
}

.modern-user-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #f5f5f5;
  margin: 0 20px 16px;
  border-radius: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  margin-right: 16px;
}

.user-details .user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-details .user-number {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.modern-usage {
  padding: 16px 20px;
}

.usage-label {
  font-size: 12px;
  color: #888;
}

.usage-value {
  margin: 8px 0;
}

.usage-value .number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.usage-value .unit {
  font-size: 14px;
  color: #888;
  margin-left: 4px;
}

.usage-bar .bar-track {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.modern-details {
  padding: 0 20px 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.detail-item.total {
  border-bottom: none;
  font-weight: 600;
  color: #333;
}

.detail-name {
  color: #666;
}

.detail-amount {
  color: #333;
}

.modern-footer {
  padding: 16px 20px;
  background: #f5f5f5;
}

.provider-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
}

/* 简约模板 */
.bill-minimal {
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.minimal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 16px;
}

.minimal-icon {
  font-size: 24px;
}

.minimal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.minimal-month {
  margin-left: auto;
  font-size: 14px;
  color: #888;
}

.minimal-user {
  margin-bottom: 16px;
  font-size: 14px;
  color: #333;
}

.minimal-user .address {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.minimal-amount {
  text-align: center;
  padding: 20px 0;
  border-top: 1px dashed #ddd;
  border-bottom: 1px dashed #ddd;
  margin-bottom: 16px;
}

.minimal-amount .amount-label {
  font-size: 12px;
  color: #888;
}

.minimal-amount .amount-value {
  font-size: 32px;
  font-weight: bold;
  margin-top: 8px;
}

.minimal-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: #666;
}

.minimal-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #888;
}

/* 水印样式 */
.watermark-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}

.watermark-layer.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.watermark-layer.fullscreen {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  gap: 30px;
  padding: 20px;
}

.watermark-center {
  font-size: 48px;
  font-weight: bold;
  color: #ff0000;
  transform: rotate(-30deg);
  white-space: nowrap;
}

.watermark-text {
  font-size: 16px;
  font-weight: bold;
  color: #ff0000;
  transform: rotate(-30deg);
  white-space: nowrap;
}

/* 边框样式 */
.custom-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 99;
}

/* 条形码样式 */
.barcode-section {
  text-align: center;
  padding: 16px 0;
  border-top: 1px dashed #ddd;
  margin-top: 16px;
}

.barcode-canvas {
  max-width: 100%;
  height: auto;
}

.barcode-image {
  max-width: 200px;
  height: auto;
}

/* 二维码样式 */
.qrcode-section {
  text-align: center;
  padding: 16px 0;
  border-top: 1px dashed #ddd;
  margin-top: 16px;
}

.qrcode-canvas {
  width: 80px;
  height: 80px;
}

.qrcode-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.qrcode-tip {
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}

/* 印章样式 */
.stamp-container {
  position: absolute;
  bottom: 60px;
  right: 40px;
  z-index: 50;
}

.stamp-generated {
  width: 80px;
  height: 80px;
  border: 3px solid currentColor;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  transform: rotate(-15deg);
}

.stamp-image {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
}
</style>
