<template>
  <div class="parking-receipt" :class="`size-${previewSize}`">
    <div class="receipt-paper">
      <!-- 停车场头部 -->
      <div class="parking-header">
        <div class="header-icon">🅿️</div>
        <div class="header-info">
          <h1>{{ store.data.merchantName || '阳光停车场' }}</h1>
          <p>{{ store.data.branchName || '24小时自助缴费' }}</p>
        </div>
      </div>

      <div class="location-bar">
        <p>📍 {{ store.data.merchantAddress || '朝阳区CBD中心B2层' }}</p>
        <p>📞 {{ store.data.merchantPhone || '400-888-8888' }}</p>
      </div>

      <div class="striped-divider"></div>

      <!-- 车辆信息 -->
      <div class="vehicle-section">
        <div class="vehicle-plate-display">
          <div class="plate-badge" :class="getPlateColor(store.data.customerName || '京A88888')">
            <span class="plate-text">{{ store.data.customerName || '京A88888' }}</span>
          </div>
        </div>
      </div>

      <!-- 停车时段 -->
      <div class="time-section">
        <div class="time-card entry">
          <div class="time-icon">🚗→</div>
          <div class="time-info">
            <span class="time-label">入场时间</span>
            <span class="time-value">{{ store.data.checkInDate || store.data.date }} {{ store.data.time || '09:30' }}</span>
          </div>
        </div>
        <div class="time-arrow">⬇️</div>
        <div class="time-card exit">
          <div class="time-icon">→🚗</div>
          <div class="time-info">
            <span class="time-label">出场时间</span>
            <span class="time-value">{{ store.data.checkOutDate || store.data.date }} {{ getCurrentTime() }}</span>
          </div>
        </div>
      </div>

      <!-- 停车时长 -->
      <div class="duration-section">
        <div class="duration-display">
          <span class="duration-label">停车时长</span>
          <span class="duration-value">{{ store.data.nights || 2 }}小时{{ store.data.guestCount || 35 }}分钟</span>
        </div>
      </div>

      <div class="dotted-line"></div>

      <!-- 费用明细 -->
      <div class="fee-section">
        <div class="section-header">💰 费用明细</div>
        <div v-for="item in store.data.items" :key="item.id" class="fee-row">
          <span class="fee-name">{{ item.name }}</span>
          <span class="fee-detail">{{ item.quantity }}{{ item.unit || '小时' }} × {{ store.formatCurrency(item.unitPrice) }}</span>
          <span class="fee-amount">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
        </div>
      </div>

      <div class="double-line"></div>

      <!-- 金额汇总 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>停车费合计</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="summary-row discount">
          <span>优惠减免</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="summary-row total">
          <span>应付金额</span>
          <span class="total-amount">{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <div class="dotted-line"></div>

      <!-- 支付信息 -->
      <div class="payment-section">
        <div class="payment-row">
          <span>支付方式</span>
          <span>{{ store.data.paymentMethod }}</span>
        </div>
        <div class="payment-row">
          <span>交易单号</span>
          <span>{{ store.data.receiptNumber }}</span>
        </div>
        <div class="payment-row">
          <span>支付时间</span>
          <span>{{ store.data.date }} {{ getCurrentTime() }}</span>
        </div>
      </div>

      <!-- 优惠信息 -->
      <div v-if="store.data.discountCode" class="discount-section">
        <div class="discount-badge">
          <span class="discount-icon">🎫</span>
          <span>已使用优惠券: {{ store.data.discountCode }}</span>
        </div>
      </div>

      <div class="striped-divider"></div>

      <!-- 温馨提示 -->
      <div class="tips-section">
        <p>⏱️ 请在15分钟内驶离</p>
        <p>🚙 超时将重新计费</p>
        <p>📞 如需帮助请拨打服务热线</p>
      </div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <div class="barcode-section">
          <div class="barcode">||| || ||| | || ||| || | ||</div>
          <span>{{ store.data.receiptNumber }}</span>
        </div>
        <p class="footer-message">{{ store.data.footerMessage || '感谢使用，驾驶安全！' }}</p>
        <div class="footer-icons">
          🚗 安全出行 文明驾驶 🚗
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

const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

const getPlateColor = (plate: string) => {
  if (plate.startsWith('京') || plate.startsWith('沪') || plate.startsWith('粤')) {
    return 'plate-blue'
  }
  if (plate.includes('电') || plate.includes('F')) {
    return 'plate-green'
  }
  return 'plate-blue'
}
</script>

<style scoped>
.parking-receipt {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.receipt-paper {
  width: 280px;
  background: #fff;
  padding: 20px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  border-left: 4px solid #3498db;
}

.parking-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.header-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info h1 {
  font-size: 18px;
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
}

.header-info p {
  font-size: 11px;
  margin: 4px 0 0;
  color: #888;
}

.location-bar {
  font-size: 11px;
  color: #666;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 12px;
}

.location-bar p {
  margin: 3px 0;
}

.striped-divider {
  height: 8px;
  background: repeating-linear-gradient(
    45deg,
    #f39c12,
    #f39c12 10px,
    #2c3e50 10px,
    #2c3e50 20px
  );
  margin: 12px -16px;
}

.vehicle-section {
  padding: 16px 0;
  text-align: center;
}

.vehicle-plate-display {
  display: inline-block;
}

.plate-badge {
  padding: 10px 24px;
  border-radius: 6px;
  display: inline-block;
  border: 2px solid;
}

.plate-blue {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-color: #1a5276;
}

.plate-green {
  background: linear-gradient(135deg, #27ae60, #1e8449);
  border-color: #145a32;
}

.plate-text {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 3px;
  font-family: 'Courier New', monospace;
}

.time-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.time-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
}

.time-card.entry {
  background: linear-gradient(90deg, #e8f6f3 0%, #fff 100%);
  border-left: 3px solid #27ae60;
}

.time-card.exit {
  background: linear-gradient(90deg, #fdf2e9 0%, #fff 100%);
  border-left: 3px solid #e74c3c;
}

.time-icon {
  font-size: 20px;
}

.time-info {
  display: flex;
  flex-direction: column;
}

.time-label {
  font-size: 10px;
  color: #888;
}

.time-value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.time-arrow {
  font-size: 14px;
}

.duration-section {
  margin-bottom: 12px;
}

.duration-display {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  padding: 14px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.duration-label {
  font-size: 13px;
  opacity: 0.9;
}

.duration-value {
  font-size: 18px;
  font-weight: 700;
}

.dotted-line {
  border-top: 1px dashed #ccc;
  margin: 12px 0;
}

.fee-section {
  margin-bottom: 12px;
}

.section-header {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin: 6px 0;
  padding: 6px 0;
  border-bottom: 1px dotted #f0f0f0;
}

.fee-name {
  flex: 1;
  color: #333;
}

.fee-detail {
  color: #888;
  font-size: 11px;
  margin-right: 12px;
}

.fee-amount {
  font-weight: 600;
  color: #2c3e50;
}

.double-line {
  border-top: 3px double #3498db;
  margin: 12px 0;
}

.summary-section {
  margin-bottom: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin: 6px 0;
}

.summary-row.discount {
  color: #27ae60;
}

.summary-row.total {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
  padding-top: 8px;
  border-top: 1px solid #ddd;
}

.total-amount {
  font-size: 22px;
  color: #e74c3c;
}

.payment-section {
  margin-bottom: 12px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin: 4px 0;
  color: #666;
}

.discount-section {
  margin-bottom: 12px;
}

.discount-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #e8f8f5;
  border-radius: 6px;
  font-size: 11px;
  color: #27ae60;
}

.discount-icon {
  font-size: 14px;
}

.tips-section {
  font-size: 11px;
  color: #666;
  padding: 10px;
  background: #fff8e6;
  border-radius: 6px;
  margin-bottom: 12px;
}

.tips-section p {
  margin: 4px 0;
}

.receipt-footer {
  text-align: center;
}

.barcode-section {
  margin-bottom: 10px;
}

.barcode {
  font-family: 'Libre Barcode 39', 'Courier New', monospace;
  font-size: 32px;
  letter-spacing: 1px;
}

.barcode-section span {
  display: block;
  font-size: 10px;
  color: #888;
  margin-top: 4px;
}

.footer-message {
  font-size: 12px;
  color: #3498db;
  margin: 8px 0;
  font-weight: 500;
}

.footer-icons {
  font-size: 11px;
  color: #ccc;
  margin-top: 8px;
}
</style>
