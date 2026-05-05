<template>
  <div class="cn-hotel-preview" :class="[`template-${store.data.template}`]" :style="previewStyle">
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
      border: `${store.designSettings.borderWidth}px solid ${store.designSettings.borderColor}`
    }"></div>

    <!-- 豪华模板 -->
    <div v-if="store.data.template === 'luxury'" class="hotel-luxury">
      <!-- 酒店头部 -->
      <div class="hotel-header">
        <div class="hotel-logo" v-if="store.data.showLogo">
          <div class="logo-stars">
            <span v-for="i in store.data.hotelStar" :key="i" class="star">★</span>
          </div>
          <div class="logo-icon">🏨</div>
        </div>
        <div class="hotel-info">
          <div class="hotel-name">{{ store.data.hotelName }}</div>
          <div class="hotel-name-en">{{ store.data.hotelNameEn }}</div>
          <div class="hotel-contact">
            <span>{{ store.data.hotelAddress }}</span>
            <span>电话: {{ store.data.hotelPhone }}</span>
          </div>
        </div>
      </div>

      <!-- 账单标题 -->
      <div class="bill-title">
        <div class="title-cn">住宿账单</div>
        <div class="title-en">GUEST FOLIO</div>
      </div>

      <!-- 预订信息 -->
      <div class="booking-section">
        <div class="booking-row">
          <div class="booking-item">
            <span class="label">确认号 Confirmation:</span>
            <span class="value">{{ store.data.confirmationNumber }}</span>
          </div>
          <div class="booking-item">
            <span class="label">账单号 Folio:</span>
            <span class="value">{{ store.data.folioNumber }}</span>
          </div>
        </div>
      </div>

      <!-- 客人信息 -->
      <div class="guest-section">
        <div class="section-title">
          <span class="icon">👤</span>
          <span>宾客信息 Guest Information</span>
        </div>
        <div class="guest-grid">
          <div class="guest-item">
            <span class="label">姓名 Name:</span>
            <span class="value">{{ store.data.guestName }} / {{ store.data.guestNameEn }}</span>
          </div>
          <div class="guest-item">
            <span class="label">公司 Company:</span>
            <span class="value">{{ store.data.guestCompany || '-' }}</span>
          </div>
          <div class="guest-item">
            <span class="label">证件号 ID:</span>
            <span class="value">{{ store.data.guestIdNumber }}</span>
          </div>
          <div class="guest-item">
            <span class="label">联系方式 Contact:</span>
            <span class="value">{{ store.data.guestPhone }}</span>
          </div>
        </div>
      </div>

      <!-- 入住信息 -->
      <div class="stay-section">
        <div class="section-title">
          <span class="icon">🛏️</span>
          <span>入住信息 Stay Details</span>
        </div>
        <div class="stay-grid">
          <div class="stay-card check-in">
            <div class="stay-label">入住 Check-in</div>
            <div class="stay-date">{{ store.formatDate(store.data.checkInDate, 'short') }}</div>
            <div class="stay-time">{{ store.data.checkInTime }}</div>
          </div>
          <div class="stay-nights">
            <div class="nights-number">{{ store.data.nights }}</div>
            <div class="nights-label">晚 Nights</div>
          </div>
          <div class="stay-card check-out">
            <div class="stay-label">退房 Check-out</div>
            <div class="stay-date">{{ store.formatDate(store.data.checkOutDate, 'short') }}</div>
            <div class="stay-time">{{ store.data.checkOutTime }}</div>
          </div>
        </div>
        <div class="room-info">
          <span class="room-type">{{ store.data.roomType }}</span>
          <span class="room-number">房号: {{ store.data.roomNumber }}</span>
          <span class="guest-count">{{ store.data.guests }}位宾客</span>
        </div>
      </div>

      <!-- 费用明细 -->
      <div class="charges-section">
        <div class="section-title">
          <span class="icon">📋</span>
          <span>费用明细 Charges</span>
        </div>
        <table class="charges-table">
          <thead>
            <tr>
              <th>日期 Date</th>
              <th>项目 Description</th>
              <th>数量 Qty</th>
              <th>单价 Price</th>
              <th>金额 Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="charge in store.data.charges" :key="charge.id">
              <td>{{ store.formatDate(charge.date, 'short') }}</td>
              <td>
                <span class="charge-category" :style="{ color: chargeCategories[charge.category].color }">
                  {{ chargeCategories[charge.category].icon }}
                </span>
                {{ charge.description }}
              </td>
              <td>{{ charge.quantity }}</td>
              <td>¥{{ charge.unitPrice.toFixed(2) }}</td>
              <td class="amount">¥{{ charge.amount.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 金额汇总 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>小计 Subtotal</span>
          <span>¥{{ store.calculatedSubtotal.toFixed(2) }}</span>
        </div>
        <div v-if="store.data.serviceChargeRate > 0" class="summary-row">
          <span>服务费 Service ({{ store.data.serviceChargeRate }}%)</span>
          <span>¥{{ store.calculatedServiceCharge.toFixed(2) }}</span>
        </div>
        <div v-if="store.data.taxRate > 0" class="summary-row">
          <span>税费 Tax ({{ store.data.taxRate }}%)</span>
          <span>¥{{ store.calculatedTaxes.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>总计 Total</span>
          <span class="total-amount">¥{{ store.calculatedTotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>已付 Paid</span>
          <span class="paid-amount">-¥{{ store.data.paidAmount.toFixed(2) }}</span>
        </div>
        <div class="summary-row balance">
          <span>余额 Balance</span>
          <span class="balance-amount" :class="{ negative: store.calculatedBalance < 0 }">
            ¥{{ store.calculatedBalance.toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- 支付状态 -->
      <div class="payment-status" :class="store.data.paymentStatus">
        {{ paymentStatusText }}
      </div>

      <!-- 二维码 - 根据支付状态显示不同内容 -->
      <div v-if="store.data.showQRCode" class="qr-section">
        <canvas ref="luxuryQrCanvas" class="luxury-qr-canvas"></canvas>
        <div class="qr-text">{{ store.data.paymentStatus === 'paid' ? '扫码查看电子账单' : '扫码支付' }}</div>
      </div>

      <!-- 页脚 -->
      <div class="hotel-footer">
        <div class="footer-text">感谢您的惠顾，期待再次为您服务</div>
        <div class="footer-text-en">Thank you for staying with us</div>
      </div>
    </div>

    <!-- 商务模板 -->
    <div v-else-if="store.data.template === 'business'" class="hotel-business">
      <div class="business-header">
        <div class="header-left">
          <div class="hotel-name">{{ store.data.hotelName }}</div>
          <div class="hotel-address">{{ store.data.hotelAddress }}</div>
          <div class="hotel-phone">Tel: {{ store.data.hotelPhone }}</div>
        </div>
        <div class="header-right">
          <div class="folio-number">账单号: {{ store.data.folioNumber }}</div>
          <div class="print-date">打印日期: {{ new Date().toLocaleDateString('zh-CN') }}</div>
        </div>
      </div>

      <div class="business-title">住宿结算单</div>

      <div class="business-info">
        <div class="info-block">
          <div class="block-title">宾客信息</div>
          <div class="info-row">
            <span class="label">姓名:</span>
            <span class="value">{{ store.data.guestName }}</span>
          </div>
          <div class="info-row">
            <span class="label">公司:</span>
            <span class="value">{{ store.data.guestCompany || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">证件:</span>
            <span class="value">{{ store.data.guestIdNumber }}</span>
          </div>
        </div>
        <div class="info-block">
          <div class="block-title">入住信息</div>
          <div class="info-row">
            <span class="label">入住:</span>
            <span class="value">{{ store.formatDate(store.data.checkInDate) }}</span>
          </div>
          <div class="info-row">
            <span class="label">退房:</span>
            <span class="value">{{ store.formatDate(store.data.checkOutDate) }}</span>
          </div>
          <div class="info-row">
            <span class="label">房间:</span>
            <span class="value">{{ store.data.roomType }} ({{ store.data.roomNumber }})</span>
          </div>
        </div>
      </div>

      <table class="business-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>项目</th>
            <th>数量</th>
            <th>单价</th>
            <th>金额</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="charge in store.data.charges" :key="charge.id">
            <td>{{ charge.date }}</td>
            <td>{{ charge.description }}</td>
            <td>{{ charge.quantity }}</td>
            <td>{{ charge.unitPrice.toFixed(2) }}</td>
            <td>{{ charge.amount.toFixed(2) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4">小计</td>
            <td>{{ store.calculatedSubtotal.toFixed(2) }}</td>
          </tr>
          <tr v-if="store.data.serviceChargeRate > 0">
            <td colspan="4">服务费 ({{ store.data.serviceChargeRate }}%)</td>
            <td>{{ store.calculatedServiceCharge.toFixed(2) }}</td>
          </tr>
          <tr v-if="store.data.taxRate > 0">
            <td colspan="4">税费 ({{ store.data.taxRate }}%)</td>
            <td>{{ store.calculatedTaxes.toFixed(2) }}</td>
          </tr>
          <tr class="total-row">
            <td colspan="4">合计</td>
            <td>¥{{ store.calculatedTotal.toFixed(2) }}</td>
          </tr>
        </tfoot>
      </table>

      <div class="business-payment">
        <div class="payment-row">
          <span>已付金额:</span>
          <span>¥{{ store.data.paidAmount.toFixed(2) }}</span>
        </div>
        <div class="payment-row balance">
          <span>应付余额:</span>
          <span>¥{{ store.calculatedBalance.toFixed(2) }}</span>
        </div>
      </div>

      <div class="business-footer">
        <div class="signature-area">
          <div class="signature-line">
            <span>宾客签名:</span>
            <span class="line"></span>
          </div>
          <div class="signature-line">
            <span>前台签名:</span>
            <span class="line"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 简约模板 -->
    <div v-else class="hotel-minimal">
      <div class="minimal-header">
        <div class="hotel-name">{{ store.data.hotelName }}</div>
        <div class="hotel-stars">
          <span v-for="i in store.data.hotelStar" :key="i">★</span>
        </div>
      </div>

      <div class="minimal-guest">
        <span class="guest-name">{{ store.data.guestName }}</span>
        <span class="room-info">{{ store.data.roomType }} · {{ store.data.roomNumber }}</span>
      </div>

      <div class="minimal-dates">
        <div class="date-item">
          <span class="date-label">入住</span>
          <span class="date-value">{{ store.formatDate(store.data.checkInDate, 'short') }}</span>
        </div>
        <div class="date-divider">→</div>
        <div class="date-item">
          <span class="date-label">退房</span>
          <span class="date-value">{{ store.formatDate(store.data.checkOutDate, 'short') }}</span>
        </div>
        <div class="nights-badge">{{ store.data.nights }}晚</div>
      </div>

      <div class="minimal-charges">
        <div v-for="charge in store.data.charges" :key="charge.id" class="charge-item">
          <span>{{ charge.description }}</span>
          <span>¥{{ charge.amount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="minimal-total">
        <div class="total-label">应付金额</div>
        <div class="total-value">¥{{ store.calculatedBalance.toFixed(2) }}</div>
      </div>

      <div class="minimal-footer">
        <span>账单号: {{ store.data.folioNumber }}</span>
        <span>{{ store.data.hotelPhone }}</span>
      </div>
    </div>

    <!-- 底部二维码/条形码区域 - 统一逻辑（豪华模板有自己的二维码区域，此处不显示） -->
    <div v-if="(store.data.showQRCode || store.data.showBarcode) && store.data.template !== 'luxury'" class="code-section">
      <!-- 已结清：只显示电子账单二维码 -->
      <template v-if="store.data.paymentStatus === 'paid'">
        <div v-if="store.data.showQRCode" class="qrcode-section centered">
          <template v-if="store.designSettings.qrCodeSource === 'upload' && store.designSettings.qrCodeImage">
            <img :src="store.designSettings.qrCodeImage" alt="二维码" class="qrcode-image" />
          </template>
          <template v-else>
            <canvas ref="qrCanvas" class="qrcode-canvas"></canvas>
          </template>
          <div class="qrcode-tip">扫码查看电子账单</div>
        </div>
      </template>
      
      <!-- 未结清/部分结算：显示条形码和支付二维码 -->
      <template v-else>
        <!-- 条形码 -->
        <div v-if="store.data.showBarcode" class="barcode-section">
          <template v-if="store.designSettings.barcodeSource === 'upload' && store.designSettings.barcodeImage">
            <img :src="store.designSettings.barcodeImage" alt="条形码" class="barcode-image" />
          </template>
          <template v-else>
            <canvas ref="barcodeCanvas" class="barcode-canvas"></canvas>
          </template>
        </div>
        
        <!-- 支付二维码 -->
        <div v-if="store.data.showQRCode" class="qrcode-section">
          <template v-if="store.designSettings.qrCodeSource === 'upload' && store.designSettings.qrCodeImage">
            <img :src="store.designSettings.qrCodeImage" alt="二维码" class="qrcode-image" />
          </template>
          <template v-else>
            <canvas ref="qrCanvas" class="qrcode-canvas"></canvas>
          </template>
          <div class="qrcode-tip">扫码支付</div>
        </div>
      </template>
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
import { useCNHotelStore, chargeCategories } from '@/stores/cnHotel'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

const store = useCNHotelStore()
const qrCanvas = ref<HTMLCanvasElement>()
const barcodeCanvas = ref<HTMLCanvasElement>()
const luxuryQrCanvas = ref<HTMLCanvasElement>()

const previewStyle = computed(() => ({
  '--border-color': store.designSettings.borderColor,
  '--border-width': store.designSettings.borderWidth + 'px'
}))

const paymentStatusText = computed(() => {
  const statusMap = {
    unpaid: '待结算',
    partial: '部分结算',
    paid: '已结清'
  }
  return statusMap[store.data.paymentStatus]
})

// 生成真实二维码
const generateQRCode = async () => {
  if (!qrCanvas.value || store.designSettings.qrCodeSource === 'upload') return
  
  const content = store.designSettings.qrCodeContent || 
    `https://hotel.example.com/folio/${store.data.folioNumber}?amount=${store.calculatedTotal}`
  
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
  
  const content = store.designSettings.barcodeContent || store.data.folioNumber
  
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

// 生成豪华模板二维码
const generateLuxuryQRCode = async () => {
  if (!luxuryQrCanvas.value) return
  
  const content = `https://hotel.example.com/bill/${store.data.folioNumber}`
  
  try {
    await QRCode.toCanvas(luxuryQrCanvas.value, content, {
      width: 60,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (err) {
    console.error('Luxury QR Code generation failed:', err)
  }
}

onMounted(() => {
  generateQRCode()
  generateBarcode()
  generateLuxuryQRCode()
})

watch(() => [store.designSettings.qrCodeSource, store.designSettings.qrCodeContent, store.data.folioNumber], () => {
  generateQRCode()
  generateLuxuryQRCode()
})

watch(() => [store.designSettings.barcodeSource, store.designSettings.barcodeContent, store.data.folioNumber], () => {
  generateBarcode()
})
</script>

<style scoped>
.cn-hotel-preview {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #fff;
  position: relative;
  width: 500px;
}

/* 豪华模板 */
.hotel-luxury {
  border: 2px solid #c9a227;
  background: linear-gradient(to bottom, #fdfcf9, #fff);
}

.hotel-header {
  display: flex;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
}

.hotel-logo {
  text-align: center;
  margin-right: 20px;
}

.logo-stars {
  color: #c9a227;
  font-size: 12px;
  letter-spacing: 2px;
}

.logo-icon {
  font-size: 40px;
  margin-top: 4px;
}

.hotel-info {
  flex: 1;
}

.hotel-name {
  font-size: 22px;
  font-weight: bold;
  color: #c9a227;
  letter-spacing: 2px;
}

.hotel-name-en {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
  letter-spacing: 1px;
}

.hotel-contact {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.bill-title {
  text-align: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.title-cn {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  letter-spacing: 4px;
}

.title-en {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.booking-section {
  padding: 12px 20px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}

.booking-row {
  display: flex;
  justify-content: space-between;
}

.booking-item {
  font-size: 12px;
}

.booking-item .label {
  color: #888;
}

.booking-item .value {
  font-family: monospace;
  color: #333;
  font-weight: 600;
}

.guest-section,
.stay-section,
.charges-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.section-title .icon {
  font-size: 16px;
}

.guest-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.guest-item {
  font-size: 12px;
}

.guest-item .label {
  color: #888;
  display: block;
  margin-bottom: 2px;
}

.guest-item .value {
  color: #333;
  font-weight: 500;
}

.stay-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
}

.stay-card {
  text-align: center;
  padding: 12px 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.stay-label {
  font-size: 11px;
  color: #888;
}

.stay-date {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 4px 0;
}

.stay-time {
  font-size: 12px;
  color: #666;
}

.stay-nights {
  text-align: center;
}

.nights-number {
  font-size: 28px;
  font-weight: bold;
  color: #c9a227;
}

.nights-label {
  font-size: 11px;
  color: #888;
}

.room-info {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
}

.room-type {
  color: #333;
  font-weight: 500;
}

.room-number {
  color: #c9a227;
  font-weight: 600;
}

.guest-count {
  color: #666;
}

.charges-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.charges-table th,
.charges-table td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.charges-table th {
  font-weight: 600;
  color: #666;
  background: #fafafa;
}

.charges-table td.amount {
  font-weight: 600;
  text-align: right;
}

.charge-category {
  margin-right: 4px;
}

.summary-section {
  padding: 16px 20px;
  background: #fafafa;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: #666;
}

.summary-row.total {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 2px solid #e0e0e0;
  font-weight: bold;
  color: #333;
}

.total-amount {
  font-size: 18px;
  color: #c9a227;
}

.paid-amount {
  color: #4caf50;
}

.summary-row.balance {
  padding-top: 8px;
  font-weight: 600;
}

.balance-amount {
  font-size: 16px;
  color: #e65100;
}

.balance-amount.negative {
  color: #4caf50;
}

.payment-status {
  text-align: center;
  padding: 8px;
  font-size: 14px;
  font-weight: 600;
  margin: 16px 20px;
  border-radius: 20px;
}

.payment-status.unpaid {
  background: #fff3e0;
  color: #e65100;
}

.payment-status.partial {
  background: #e3f2fd;
  color: #1976d2;
}

.payment-status.paid {
  background: #e8f5e9;
  color: #2e7d32;
}

.qr-section {
  text-align: center;
  padding: 16px;
  border-top: 1px dashed #ddd;
}

.luxury-qr-canvas {
  width: 60px;
  height: 60px;
}

.qr-text {
  font-size: 11px;
  color: #888;
  margin-top: 8px;
}

.hotel-footer {
  padding: 16px;
  text-align: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
}

.footer-text {
  font-size: 13px;
  color: #c9a227;
}

.footer-text-en {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

/* 商务模板 */
.hotel-business {
  padding: 24px;
  border: 1px solid #ddd;
}

.business-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 2px solid #333;
  margin-bottom: 16px;
}

.header-left .hotel-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-left .hotel-address,
.header-left .hotel-phone {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.header-right {
  text-align: right;
  font-size: 12px;
  color: #666;
}

.business-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.business-info {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.info-block {
  flex: 1;
}

.block-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 8px;
}

.info-row {
  font-size: 12px;
  margin-bottom: 6px;
}

.info-row .label {
  color: #888;
  margin-right: 8px;
}

.info-row .value {
  color: #333;
}

.business-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-bottom: 16px;
}

.business-table th,
.business-table td {
  padding: 10px 8px;
  border: 1px solid #ddd;
  text-align: center;
}

.business-table th {
  background: #f5f5f5;
  font-weight: 600;
}

.business-table tfoot td {
  background: #fafafa;
}

.total-row td {
  font-weight: bold;
  background: #f0f0f0 !important;
}

.business-payment {
  text-align: right;
  margin-bottom: 24px;
}

.payment-row {
  font-size: 14px;
  margin-bottom: 8px;
}

.payment-row.balance {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.business-footer {
  border-top: 1px solid #ddd;
  padding-top: 16px;
}

.signature-area {
  display: flex;
  justify-content: space-between;
}

.signature-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.signature-line .line {
  width: 120px;
  border-bottom: 1px solid #333;
}

/* 简约模板 */
.hotel-minimal {
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.minimal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.minimal-header .hotel-name {
  font-size: 18px;
  font-weight: bold;
}

.hotel-stars {
  color: #ffd700;
  font-size: 12px;
}

.minimal-guest {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  margin-bottom: 16px;
}

.guest-name {
  font-size: 16px;
  font-weight: 600;
}

.room-info {
  font-size: 13px;
  opacity: 0.9;
}

.minimal-dates {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.date-item {
  text-align: center;
}

.date-label {
  font-size: 11px;
  opacity: 0.8;
  display: block;
}

.date-value {
  font-size: 16px;
  font-weight: 600;
}

.date-divider {
  font-size: 20px;
  opacity: 0.6;
}

.nights-badge {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 13px;
}

.minimal-charges {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.charge-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.charge-item:last-child {
  border-bottom: none;
}

.minimal-total {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  color: #333;
  margin-bottom: 16px;
}

.total-label {
  font-size: 12px;
  color: #666;
}

.total-value {
  font-size: 28px;
  font-weight: bold;
  color: #764ba2;
}

.minimal-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  opacity: 0.8;
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

/* 底部二维码/条形码区域 */
.code-section {
  padding: 20px;
  border-top: 1px dashed #ddd;
  margin-top: 16px;
  background: #fafafa;
}

/* 条形码样式 */
.barcode-section {
  text-align: center;
  padding: 12px 0;
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
  padding: 12px 0;
}

.qrcode-section.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  color: #666;
  margin-top: 8px;
  font-weight: 500;
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
