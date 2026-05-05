<template>
  <div class="pharmacy-receipt" :class="`size-${previewSize}`">
    <div class="receipt-paper">
      <!-- 药店头部 -->
      <div class="pharmacy-header">
        <div class="header-top">
          <div class="pharmacy-logo">
            <span class="logo-icon">💊</span>
            <span class="cross-icon">+</span>
          </div>
          <div class="pharmacy-info">
            <h1>{{ store.data.merchantName || '仁和大药房' }}</h1>
            <p class="pharmacy-type">医保定点药店</p>
          </div>
        </div>
        <div class="pharmacy-contact">
          <p>{{ store.data.merchantAddress || '北京市朝阳区xxx路88号' }}</p>
          <p>咨询热线: {{ store.data.merchantPhone || '010-12345678' }}</p>
          <p>营业时间: {{ store.data.businessHours || '08:00-22:00' }}</p>
        </div>
      </div>

      <div class="green-divider"></div>

      <!-- 交易信息 -->
      <div class="transaction-info">
        <div class="info-row">
          <span>小票号:</span>
          <span>{{ store.data.receiptNumber }}</span>
        </div>
        <div class="info-row">
          <span>日期:</span>
          <span>{{ store.data.date }} {{ store.data.time }}</span>
        </div>
        <div class="info-row">
          <span>收银员:</span>
          <span>{{ store.data.cashier }}</span>
        </div>
      </div>

      <div class="dashed-divider"></div>

      <!-- 药品明细 -->
      <div class="medicine-section">
        <div class="section-header">
          <span>💊 药品明细</span>
        </div>
        <div v-for="(item, index) in store.data.items" :key="item.id" class="medicine-item">
          <div class="medicine-header">
            <span class="medicine-index">{{ index + 1 }}</span>
            <span class="medicine-name">{{ item.name }}</span>
            <span v-if="isMedicalInsurance(item)" class="yb-tag">医保</span>
          </div>
          <div class="medicine-details">
            <div class="detail-row">
              <span class="spec">{{ item.notes || '规格: 10mg*24片/盒' }}</span>
            </div>
            <div class="detail-row">
              <span>{{ store.formatCurrency(item.unitPrice) }} × {{ item.quantity }}{{ item.unit || '盒' }}</span>
              <span class="item-total">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
            </div>
          </div>
          <div v-if="item.category" class="usage-info">
            <span class="usage-label">用法:</span>
            <span>{{ item.category }}</span>
          </div>
        </div>
      </div>

      <div class="double-green-line"></div>

      <!-- 金额汇总 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>药品数量:</span>
          <span>{{ totalQuantity }} 件</span>
        </div>
        <div class="summary-row">
          <span>商品合计:</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="summary-row discount">
          <span>会员优惠:</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="summary-row total">
          <span>应付金额:</span>
          <span class="amount">{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <div class="dashed-divider"></div>

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
      </div>

      <!-- 医保信息 -->
      <div v-if="store.data.membershipId" class="insurance-section">
        <div class="insurance-header">🏥 医保信息</div>
        <div class="insurance-row">
          <span>医保卡号:</span>
          <span>{{ store.data.membershipId }}</span>
        </div>
        <div v-if="store.data.memberPoints" class="insurance-row">
          <span>医保支付:</span>
          <span class="insurance-amount">{{ store.formatCurrency(store.data.memberPoints) }}</span>
        </div>
      </div>

      <div class="dashed-divider"></div>

      <!-- 温馨提示 -->
      <div class="notice-section">
        <div class="notice-header">⚠️ 用药须知</div>
        <ul class="notice-list">
          <li>请按药品说明书或医嘱服用</li>
          <li>请将药品放置在儿童不能接触的地方</li>
          <li>如有不适请及时就医</li>
        </ul>
      </div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <div class="qr-section">
          <div class="qr-placeholder">📱</div>
          <span>扫码查看用药指南</span>
        </div>
        <div class="barcode">
          *{{ store.data.receiptNumber }}*
        </div>
        <p class="footer-message">{{ store.data.footerMessage || '健康生活，从这里开始' }}</p>
        <p class="pharmacist">执业药师: 张药师 (证号: 2019xxxxx)</p>
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

const totalQuantity = computed(() => {
  return store.data.items.reduce((sum, item) => sum + item.quantity, 0)
})

const isMedicalInsurance = (item: any) => {
  return item.sku?.includes('YB') || item.name?.includes('医保')
}
</script>

<style scoped>
.pharmacy-receipt {
  font-family: 'PingFang SC', 'SimHei', sans-serif;
}

.receipt-paper {
  width: 300px;
  background: #fff;
  padding: 20px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  border-top: 4px solid #27ae60;
}

.pharmacy-header {
  text-align: center;
  margin-bottom: 12px;
}

.header-top {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.pharmacy-logo {
  position: relative;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 24px;
}

.cross-icon {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #e74c3c;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pharmacy-info h1 {
  font-size: 18px;
  margin: 0;
  color: #27ae60;
  font-weight: 700;
}

.pharmacy-type {
  font-size: 11px;
  color: #fff;
  background: #27ae60;
  padding: 2px 8px;
  border-radius: 10px;
  margin: 4px 0 0;
  display: inline-block;
}

.pharmacy-contact {
  font-size: 11px;
  color: #666;
  background: #f8f8f8;
  padding: 8px;
  border-radius: 4px;
}

.pharmacy-contact p {
  margin: 3px 0;
}

.green-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #27ae60, transparent);
  margin: 12px 0;
}

.transaction-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 4px 0;
  color: #555;
}

.dashed-divider {
  border-top: 1px dashed #ccc;
  margin: 12px 0;
}

.medicine-section {
  margin-bottom: 12px;
}

.section-header {
  font-size: 13px;
  font-weight: 600;
  color: #27ae60;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e8f5e9;
}

.medicine-item {
  background: #f9fdf9;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 3px solid #27ae60;
}

.medicine-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.medicine-index {
  width: 18px;
  height: 18px;
  background: #27ae60;
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medicine-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.yb-tag {
  background: #3498db;
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.medicine-details {
  padding-left: 26px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
  margin: 3px 0;
}

.spec {
  color: #888;
  font-size: 10px;
}

.item-total {
  font-weight: 600;
  color: #333;
}

.usage-info {
  margin-top: 6px;
  padding: 4px 8px;
  background: #fff3cd;
  border-radius: 3px;
  font-size: 10px;
  margin-left: 26px;
}

.usage-label {
  color: #856404;
  font-weight: 500;
}

.double-green-line {
  border-top: 3px double #27ae60;
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
}

.summary-row.discount {
  color: #e74c3c;
}

.summary-row.total {
  font-size: 15px;
  font-weight: 700;
  color: #27ae60;
  padding-top: 8px;
  border-top: 1px solid #ddd;
}

.summary-row .amount {
  font-size: 18px;
}

.payment-section {
  margin-bottom: 10px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 4px 0;
}

.insurance-section {
  background: #e3f2fd;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 10px;
}

.insurance-header {
  font-size: 12px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
}

.insurance-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin: 4px 0;
}

.insurance-amount {
  color: #1976d2;
  font-weight: 600;
}

.notice-section {
  background: #fff8e1;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.notice-header {
  font-size: 12px;
  font-weight: 600;
  color: #f57c00;
  margin-bottom: 6px;
}

.notice-list {
  margin: 0;
  padding-left: 16px;
  font-size: 10px;
  color: #666;
}

.notice-list li {
  margin: 3px 0;
}

.receipt-footer {
  text-align: center;
}

.qr-section {
  margin-bottom: 10px;
}

.qr-placeholder {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.barcode {
  font-family: 'Libre Barcode 39', 'Courier New', monospace;
  font-size: 28px;
  margin: 8px 0;
}

.footer-message {
  font-size: 12px;
  color: #27ae60;
  margin: 8px 0;
  font-weight: 500;
}

.pharmacist {
  font-size: 10px;
  color: #999;
  margin: 4px 0;
}
</style>
