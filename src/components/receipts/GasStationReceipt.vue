<template>
  <div class="gas-station-receipt" :class="`size-${previewSize}`">
    <div class="receipt-paper">
      <!-- 加油站头部 -->
      <div class="station-header">
        <div class="brand-section">
          <div class="brand-logo">⛽</div>
          <div class="brand-info">
            <h1>{{ store.data.merchantName || '中石化加油站' }}</h1>
            <p class="station-id">{{ store.data.branchName || '第888站' }}</p>
          </div>
        </div>
        <div class="header-badge">
          <span class="badge-text">发票联</span>
        </div>
      </div>

      <div class="station-address">
        <p>📍 {{ store.data.merchantAddress || '北京市朝阳区xxx路123号' }}</p>
        <p>📞 {{ store.data.merchantPhone || '010-12345678' }}</p>
      </div>

      <div class="thick-divider"></div>

      <!-- 交易信息 -->
      <div class="transaction-info">
        <div class="info-row">
          <span>交易流水号:</span>
          <span>{{ store.data.receiptNumber }}</span>
        </div>
        <div class="info-row">
          <span>加油时间:</span>
          <span>{{ store.data.date }} {{ store.data.time }}</span>
        </div>
        <div class="info-row">
          <span>加油员:</span>
          <span>{{ store.data.cashier || '李工' }}</span>
        </div>
        <div v-if="store.data.terminalId" class="info-row">
          <span>油枪号:</span>
          <span>{{ store.data.terminalId }}</span>
        </div>
      </div>

      <div class="dotted-divider"></div>

      <!-- 车辆信息 -->
      <div v-if="store.data.customerName" class="vehicle-info">
        <div class="vehicle-plate">
          <span class="plate-label">车牌号</span>
          <span class="plate-number">{{ store.data.customerName }}</span>
        </div>
      </div>

      <!-- 加油明细 -->
      <div class="fuel-section">
        <div class="fuel-header">
          <span>⛽ 加油明细</span>
        </div>
        <div v-for="item in store.data.items" :key="item.id" class="fuel-item">
          <div class="fuel-type">
            <span class="fuel-badge" :class="getFuelClass(item.name)">{{ getFuelGrade(item.name) }}</span>
            <span class="fuel-name">{{ item.name }}</span>
          </div>
          <div class="fuel-details">
            <div class="detail-row">
              <span>单价</span>
              <span>{{ store.formatCurrency(item.unitPrice) }}/升</span>
            </div>
            <div class="detail-row">
              <span>加油量</span>
              <span class="fuel-amount">{{ item.quantity.toFixed(2) }} 升</span>
            </div>
            <div class="detail-row total">
              <span>金额</span>
              <span>{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="double-line"></div>

      <!-- 金额汇总 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>商品合计:</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="summary-row discount">
          <span>优惠金额:</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="summary-row grand-total">
          <span>实付金额:</span>
          <span class="amount">{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <div class="dotted-divider"></div>

      <!-- 支付信息 -->
      <div class="payment-section">
        <div class="payment-row">
          <span>支付方式:</span>
          <span>{{ store.data.paymentMethod }}</span>
        </div>
        <div v-if="store.data.cardLast4" class="payment-row">
          <span>卡号:</span>
          <span>**** **** **** {{ store.data.cardLast4 }}</span>
        </div>
      </div>

      <!-- 会员信息 -->
      <div v-if="store.data.membershipId" class="member-section">
        <div class="member-row">
          <span>会员卡号:</span>
          <span>{{ store.data.membershipId }}</span>
        </div>
        <div v-if="store.data.pointsEarned" class="member-row">
          <span>本次积分:</span>
          <span class="points">+{{ store.data.pointsEarned }}</span>
        </div>
      </div>

      <div class="dotted-divider"></div>

      <!-- 温馨提示 -->
      <div class="notice-section">
        <p>⚠️ 加油时请熄火、禁止吸烟</p>
        <p>🚗 感谢您的光临，一路平安！</p>
      </div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <div class="barcode-section">
          <div class="barcode">*{{ store.data.receiptNumber }}*</div>
        </div>
        <p class="service-hotline">服务热线: 95105988</p>
        <p class="footer-note">{{ store.data.footerMessage || '发票可在加油后3日内开具电子发票' }}</p>
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

const getFuelGrade = (name: string) => {
  if (name.includes('92')) return '92#'
  if (name.includes('95')) return '95#'
  if (name.includes('98')) return '98#'
  if (name.includes('0号') || name.includes('柴油')) return '0#'
  return '汽油'
}

const getFuelClass = (name: string) => {
  if (name.includes('92')) return 'grade-92'
  if (name.includes('95')) return 'grade-95'
  if (name.includes('98')) return 'grade-98'
  if (name.includes('柴油')) return 'grade-diesel'
  return 'grade-92'
}
</script>

<style scoped>
.gas-station-receipt {
  font-family: 'PingFang SC', 'SimHei', sans-serif;
}

.receipt-paper {
  width: 300px;
  background: #fff;
  padding: 20px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  font-size: 36px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-info h1 {
  font-size: 16px;
  margin: 0;
  color: #c0392b;
  font-weight: 700;
}

.station-id {
  font-size: 11px;
  color: #666;
  margin: 4px 0 0;
}

.header-badge {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  padding: 4px 10px;
  border-radius: 4px;
}

.badge-text {
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}

.station-address {
  font-size: 11px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8f8f8;
  border-radius: 4px;
}

.station-address p {
  margin: 3px 0;
}

.thick-divider {
  height: 3px;
  background: linear-gradient(90deg, #e74c3c, #f39c12, #e74c3c);
  margin: 12px 0;
}

.transaction-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 5px 0;
  color: #444;
}

.dotted-divider {
  border-top: 1px dashed #ccc;
  margin: 12px 0;
}

.vehicle-info {
  margin-bottom: 12px;
}

.vehicle-plate {
  background: linear-gradient(135deg, #3498db, #2980b9);
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plate-label {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
}

.plate-number {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.fuel-section {
  margin-bottom: 12px;
}

.fuel-header {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

.fuel-item {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.fuel-type {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.fuel-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.grade-92 { background: #27ae60; }
.grade-95 { background: #f39c12; }
.grade-98 { background: #e74c3c; }
.grade-diesel { background: #2c3e50; }

.fuel-name {
  font-size: 13px;
  font-weight: 500;
}

.fuel-details {
  padding-left: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 4px 0;
  color: #666;
}

.detail-row.total {
  font-weight: 600;
  color: #333;
  padding-top: 6px;
  border-top: 1px dashed #ddd;
}

.fuel-amount {
  color: #e74c3c;
  font-weight: 600;
}

.double-line {
  border-top: 3px double #c0392b;
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

.summary-row.grand-total {
  font-size: 16px;
  font-weight: 700;
  color: #c0392b;
  padding-top: 8px;
  border-top: 1px solid #ddd;
}

.summary-row .amount {
  font-size: 20px;
}

.payment-section {
  margin-bottom: 10px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 4px 0;
  color: #555;
}

.member-section {
  background: #fff8e6;
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.member-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 3px 0;
}

.member-row .points {
  color: #f39c12;
  font-weight: 600;
}

.notice-section {
  font-size: 11px;
  color: #888;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 12px;
}

.notice-section p {
  margin: 4px 0;
}

.receipt-footer {
  text-align: center;
}

.barcode-section {
  margin-bottom: 8px;
}

.barcode {
  font-family: 'Libre Barcode 39', 'Courier New', monospace;
  font-size: 28px;
  letter-spacing: 1px;
}

.service-hotline {
  font-size: 12px;
  color: #c0392b;
  margin: 8px 0;
  font-weight: 600;
}

.footer-note {
  font-size: 10px;
  color: #999;
  margin: 4px 0;
}
</style>
