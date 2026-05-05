<template>
  <div class="payment-preview" :class="[data.platform, data.template, data.deviceType]">
    <!-- 微信支付 -->
    <div v-if="data.platform === 'wechat'" class="wechat-screen">
      <!-- 状态栏 -->
      <div class="status-bar">
        <span class="time">{{ data.currentTime }}</span>
        <div class="status-icons">
          <span class="signal">
            <span v-for="i in 4" :key="i" :class="['bar', { active: i <= data.signalStrength }]"></span>
          </span>
          <span v-if="data.wifiEnabled" class="wifi">📶</span>
          <span class="battery">
            <span class="battery-level" :style="{ width: data.batteryLevel + '%' }"></span>
            {{ data.batteryLevel }}%
          </span>
        </div>
      </div>
      
      <!-- 导航栏 -->
      <div class="nav-bar">
        <span class="back">‹</span>
        <span class="title">{{ data.paymentType === 'redpacket' ? '微信红包' : '转账详情' }}</span>
        <span class="more">⋯</span>
      </div>
      
      <!-- 内容区域 -->
      <div class="content">
        <!-- 红包样式 -->
        <template v-if="data.paymentType === 'redpacket'">
          <div class="redpacket-card">
            <div class="redpacket-header">
              <div class="avatar">
                <img v-if="data.senderAvatar" :src="data.senderAvatar" />
                <span v-else>{{ data.senderName.charAt(0) }}</span>
              </div>
              <p class="sender-name">{{ data.senderName }}的红包</p>
            </div>
            <div class="redpacket-amount">
              <span class="symbol">¥</span>
              <span class="number">{{ data.amount.toFixed(2) }}</span>
            </div>
            <p class="redpacket-message">{{ data.redpacketMessage }}</p>
            <p class="redpacket-status">已存入零钱，可直接消费</p>
          </div>
        </template>
        
        <!-- 转账样式 -->
        <template v-else>
          <div class="transfer-card">
            <div class="status-icon" :class="data.status">
              <span v-if="data.status === 'success'">✓</span>
              <span v-else-if="data.status === 'pending'">⏳</span>
              <span v-else>✕</span>
            </div>
            <p class="status-text">
              {{ data.status === 'success' ? '转账成功' : data.status === 'pending' ? '待收款' : '转账失败' }}
            </p>
            <div class="amount-display">
              <span class="symbol">¥</span>
              <span class="amount">{{ data.amount.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="detail-list">
            <div class="detail-item">
              <span class="label">收款方</span>
              <span class="value">{{ data.receiverName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">转账时间</span>
              <span class="value">{{ data.paymentTime }}</span>
            </div>
            <div class="detail-item" v-if="data.showRemarks && data.remarks">
              <span class="label">转账说明</span>
              <span class="value">{{ data.remarks }}</span>
            </div>
            <div class="detail-item" v-if="data.showTransactionId">
              <span class="label">交易单号</span>
              <span class="value small">{{ data.transactionId }}</span>
            </div>
          </div>
        </template>
      </div>
      
      <!-- 底部操作 -->
      <div class="bottom-actions">
        <button class="action-btn primary" v-if="data.status === 'pending'">立即收款</button>
        <button class="action-btn">转账记录</button>
      </div>
    </div>
    
    <!-- 支付宝 -->
    <div v-else-if="data.platform === 'alipay'" class="alipay-screen">
      <div class="status-bar light">
        <span class="time">{{ data.currentTime }}</span>
        <div class="status-icons">
          <span class="signal">
            <span v-for="i in 4" :key="i" :class="['bar', { active: i <= data.signalStrength }]"></span>
          </span>
          <span class="battery">{{ data.batteryLevel }}%</span>
        </div>
      </div>
      
      <div class="nav-bar">
        <span class="back">‹</span>
        <span class="title">账单详情</span>
      </div>
      
      <div class="content">
        <div class="alipay-card">
          <div class="card-header" :class="data.status">
            <span class="icon">{{ data.status === 'success' ? '✓' : data.status === 'pending' ? '⏳' : '✕' }}</span>
            <span class="text">{{ data.status === 'success' ? '交易成功' : data.status === 'pending' ? '等待付款' : '交易失败' }}</span>
          </div>
          <div class="amount-section">
            <span class="label">{{ data.paymentType === 'refund' ? '退款金额' : '支付金额' }}</span>
            <div class="amount">
              <span class="sign">{{ data.paymentType === 'refund' ? '+' : '-' }}</span>
              <span class="number">{{ data.amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-item">
            <span class="label">商品说明</span>
            <span class="value">{{ data.remarks || '转账' }}</span>
          </div>
          <div class="info-item">
            <span class="label">收款方</span>
            <span class="value">{{ data.receiverName }}</span>
          </div>
          <div class="info-item">
            <span class="label">付款方式</span>
            <span class="value">{{ data.senderBank || '余额' }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间</span>
            <span class="value">{{ data.paymentTime }}</span>
          </div>
          <div class="info-item" v-if="data.showTransactionId">
            <span class="label">订单号</span>
            <span class="value small">{{ data.transactionId }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Apple Pay -->
    <div v-else-if="data.platform === 'apple-pay'" class="apple-pay-screen">
      <div class="status-bar dark">
        <span class="time">{{ data.currentTime }}</span>
        <div class="status-icons">
          <span class="signal">
            <span v-for="i in 4" :key="i" class="bar active"></span>
          </span>
          <span class="battery">{{ data.batteryLevel }}%</span>
        </div>
      </div>
      
      <div class="content">
        <div class="apple-card">
          <div class="check-icon">✓</div>
          <h2>Done</h2>
          <div class="amount">{{ store.formatAmount }}</div>
          <p class="merchant">{{ data.merchantName || data.receiverName }}</p>
        </div>
        
        <div class="card-info">
          <div class="card-visual">
            <span class="card-brand">Apple Pay</span>
            <span class="card-number">{{ data.cardNumber }}</span>
          </div>
        </div>
        
        <div class="transaction-info">
          <div class="info-row">
            <span>Transaction ID</span>
            <span>{{ data.transactionId }}</span>
          </div>
          <div class="info-row">
            <span>Date</span>
            <span>{{ data.paymentTime }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Visa/Mastercard -->
    <div v-else-if="data.platform === 'visa' || data.platform === 'mastercard'" class="card-screen">
      <div class="receipt-paper">
        <div class="receipt-header">
          <h1 class="merchant-name">{{ data.merchantName || 'MERCHANT' }}</h1>
          <p class="merchant-address">{{ data.remarks }}</p>
        </div>
        
        <div class="receipt-divider">================================</div>
        
        <div class="receipt-body">
          <div class="receipt-row">
            <span>{{ data.platform === 'visa' ? 'VISA' : 'MASTERCARD' }}</span>
            <span>{{ data.cardType === 'credit' ? 'CREDIT' : 'DEBIT' }}</span>
          </div>
          <div class="receipt-row">
            <span>CARD NUMBER</span>
            <span>{{ data.cardNumber }}</span>
          </div>
          <div class="receipt-row">
            <span>DATE/TIME</span>
            <span>{{ data.paymentTime }}</span>
          </div>
          <div class="receipt-row">
            <span>AUTH CODE</span>
            <span>{{ data.authCode || '------' }}</span>
          </div>
        </div>
        
        <div class="receipt-divider">--------------------------------</div>
        
        <div class="receipt-amount">
          <span>TOTAL</span>
          <span class="total">{{ store.formatAmount }}</span>
        </div>
        
        <div class="receipt-status" :class="data.status">
          {{ data.status === 'success' ? 'APPROVED' : data.status === 'pending' ? 'PENDING' : 'DECLINED' }}
        </div>
        
        <div class="receipt-footer">
          <p>TRANSACTION ID: {{ data.transactionId }}</p>
          <p v-if="data.merchantId">MERCHANT ID: {{ data.merchantId }}</p>
          <p v-if="data.terminalId">TERMINAL ID: {{ data.terminalId }}</p>
        </div>
        
        <div class="receipt-thank">THANK YOU</div>
      </div>
    </div>
    
    <!-- 银联 -->
    <div v-else-if="data.platform === 'unionpay'" class="unionpay-screen">
      <div class="status-bar">
        <span class="time">{{ data.currentTime }}</span>
        <div class="status-icons">
          <span class="battery">{{ data.batteryLevel }}%</span>
        </div>
      </div>
      
      <div class="nav-bar red">
        <span class="back">‹</span>
        <span class="title">交易详情</span>
      </div>
      
      <div class="content">
        <div class="unionpay-card">
          <div class="status-badge" :class="data.status">
            {{ data.status === 'success' ? '交易成功' : data.status === 'pending' ? '处理中' : '交易失败' }}
          </div>
          <div class="amount-display">
            <span class="currency">¥</span>
            <span class="amount">{{ data.amount.toFixed(2) }}</span>
          </div>
          <p class="card-info">{{ data.cardNumber }} | {{ data.senderBank || '银联卡' }}</p>
        </div>
        
        <div class="detail-card">
          <div class="detail-row">
            <span class="label">商户名称</span>
            <span class="value">{{ data.merchantName || data.receiverName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">交易类型</span>
            <span class="value">消费</span>
          </div>
          <div class="detail-row">
            <span class="label">交易时间</span>
            <span class="value">{{ data.paymentTime }}</span>
          </div>
          <div class="detail-row" v-if="data.showTransactionId">
            <span class="label">交易流水号</span>
            <span class="value small">{{ data.transactionId }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- PayPal -->
    <div v-else-if="data.platform === 'paypal'" class="paypal-screen">
      <div class="status-bar light">
        <span class="time">{{ data.currentTime }}</span>
        <div class="status-icons">
          <span class="battery">{{ data.batteryLevel }}%</span>
        </div>
      </div>
      
      <div class="nav-bar blue">
        <span class="back">←</span>
        <span class="title">Transaction Details</span>
      </div>
      
      <div class="content">
        <div class="paypal-card">
          <div class="status-icon" :class="data.status">
            {{ data.status === 'success' ? '✓' : data.status === 'pending' ? '⏳' : '✕' }}
          </div>
          <h2 class="status-text">
            {{ data.status === 'success' ? 'Payment Sent' : data.status === 'pending' ? 'Pending' : 'Failed' }}
          </h2>
          <div class="amount">{{ store.formatAmount }}</div>
          <p class="recipient">To: {{ data.receiverName }}</p>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <span class="label">Transaction ID</span>
            <span class="value">{{ data.transactionId }}</span>
          </div>
          <div class="info-row">
            <span class="label">Date</span>
            <span class="value">{{ data.paymentTime }}</span>
          </div>
          <div class="info-row" v-if="data.remarks">
            <span class="label">Note</span>
            <span class="value">{{ data.remarks }}</span>
          </div>
          <div class="info-row" v-if="data.showServiceFee && data.serviceFee > 0">
            <span class="label">Fee</span>
            <span class="value">{{ currencies.find(c => c.id === data.currency)?.symbol }}{{ data.serviceFee.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePaymentScreenshotStore, currencies } from '@/stores/paymentScreenshot'

const store = usePaymentScreenshotStore()
const data = store.data
</script>

<style scoped>
.payment-preview {
  width: 375px;
  min-height: 667px;
  margin: 0 auto;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  position: relative;
}

.payment-preview.iphone {
  border: 12px solid #1a1a1a;
}

.payment-preview.android {
  border: 8px solid #333;
  border-radius: 20px;
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px 8px;
  font-size: 14px;
  font-weight: 500;
}

.status-bar.light {
  background: #fff;
  color: #000;
}

.status-bar.dark {
  background: #000;
  color: #fff;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.signal {
  display: flex;
  gap: 2px;
  align-items: flex-end;
}

.signal .bar {
  width: 4px;
  background: #ccc;
  border-radius: 1px;
}

.signal .bar:nth-child(1) { height: 6px; }
.signal .bar:nth-child(2) { height: 9px; }
.signal .bar:nth-child(3) { height: 12px; }
.signal .bar:nth-child(4) { height: 15px; }

.signal .bar.active {
  background: currentColor;
}

.battery {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 17px;
  font-weight: 600;
}

.nav-bar .back {
  font-size: 24px;
  cursor: pointer;
}

/* ===== 微信支付样式 ===== */
.wechat-screen {
  background: #EDEDED;
  min-height: 100%;
}

.wechat-screen .status-bar {
  background: #EDEDED;
  color: #000;
}

.wechat-screen .nav-bar {
  background: #EDEDED;
  border-bottom: 1px solid #ddd;
}

.wechat-screen .content {
  padding: 20px 16px;
}

.wechat-screen .transfer-card {
  background: #fff;
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 12px;
}

.wechat-screen .status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 30px;
  color: #fff;
}

.wechat-screen .status-icon.success {
  background: #07C160;
}

.wechat-screen .status-icon.pending {
  background: #FFA500;
}

.wechat-screen .status-icon.failed {
  background: #FA5151;
}

.wechat-screen .status-text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
}

.wechat-screen .amount-display {
  font-size: 40px;
  font-weight: 500;
}

.wechat-screen .amount-display .symbol {
  font-size: 24px;
  margin-right: 4px;
}

.wechat-screen .detail-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.wechat-screen .detail-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 15px;
}

.wechat-screen .detail-item .label {
  color: #888;
}

.wechat-screen .detail-item .value.small {
  font-size: 12px;
  color: #999;
}

/* 红包样式 */
.wechat-screen .redpacket-card {
  background: linear-gradient(135deg, #FA5151 0%, #C9453B 100%);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  color: #fff;
}

.wechat-screen .redpacket-header {
  margin-bottom: 20px;
}

.wechat-screen .redpacket-header .avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  overflow: hidden;
}

.wechat-screen .redpacket-header .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wechat-screen .redpacket-amount {
  font-size: 50px;
  font-weight: 500;
  margin: 20px 0;
}

.wechat-screen .redpacket-amount .symbol {
  font-size: 28px;
}

.wechat-screen .redpacket-message {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 16px;
}

.wechat-screen .redpacket-status {
  font-size: 13px;
  opacity: 0.8;
}

.wechat-screen .bottom-actions {
  padding: 20px 16px;
}

.wechat-screen .action-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 10px;
  cursor: pointer;
}

.wechat-screen .action-btn.primary {
  background: #07C160;
  color: #fff;
}

.wechat-screen .action-btn:not(.primary) {
  background: #fff;
  color: #333;
}

/* ===== 支付宝样式 ===== */
.alipay-screen {
  background: #f5f5f5;
  min-height: 100%;
}

.alipay-screen .status-bar {
  background: #1677FF;
  color: #fff;
}

.alipay-screen .nav-bar {
  background: #1677FF;
  color: #fff;
}

.alipay-screen .content {
  padding: 16px;
}

.alipay-screen .alipay-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.alipay-screen .card-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}

.alipay-screen .card-header.success {
  background: #00B578;
}

.alipay-screen .card-header.pending {
  background: #FF8F1F;
}

.alipay-screen .card-header.failed {
  background: #FA2C19;
}

.alipay-screen .card-header .icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.alipay-screen .card-header .text {
  font-size: 18px;
  font-weight: 500;
}

.alipay-screen .amount-section {
  padding: 20px;
  text-align: center;
}

.alipay-screen .amount-section .label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.alipay-screen .amount-section .amount {
  font-size: 36px;
  font-weight: 600;
}

.alipay-screen .amount-section .sign {
  font-size: 24px;
  margin-right: 4px;
}

.alipay-screen .info-card {
  background: #fff;
  border-radius: 12px;
  padding: 4px 0;
}

.alipay-screen .info-item {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  font-size: 14px;
}

.alipay-screen .info-item .label {
  color: #999;
}

.alipay-screen .info-item .value.small {
  font-size: 12px;
  color: #999;
}

/* ===== Apple Pay 样式 ===== */
.apple-pay-screen {
  background: #000;
  color: #fff;
  min-height: 100%;
}

.apple-pay-screen .content {
  padding: 40px 20px;
  text-align: center;
}

.apple-pay-screen .apple-card {
  margin-bottom: 40px;
}

.apple-pay-screen .check-icon {
  width: 80px;
  height: 80px;
  border: 4px solid #34C759;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 40px;
  color: #34C759;
}

.apple-pay-screen h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
}

.apple-pay-screen .amount {
  font-size: 48px;
  font-weight: 300;
  margin-bottom: 12px;
}

.apple-pay-screen .merchant {
  font-size: 18px;
  color: #999;
}

.apple-pay-screen .card-info {
  margin-bottom: 40px;
}

.apple-pay-screen .card-visual {
  background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
  border-radius: 12px;
  padding: 20px;
  text-align: left;
}

.apple-pay-screen .card-brand {
  display: block;
  font-size: 14px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.apple-pay-screen .card-number {
  font-size: 16px;
  letter-spacing: 2px;
}

.apple-pay-screen .transaction-info {
  text-align: left;
}

.apple-pay-screen .info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #333;
  font-size: 14px;
}

.apple-pay-screen .info-row span:first-child {
  color: #999;
}

/* ===== Visa/Mastercard 收据样式 ===== */
.card-screen {
  background: #f5f5f5;
  padding: 20px;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.receipt-paper {
  background: #fff;
  width: 100%;
  padding: 30px 20px;
  font-family: 'Courier New', monospace;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.receipt-header {
  text-align: center;
  margin-bottom: 20px;
}

.receipt-header .merchant-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px;
}

.receipt-header .merchant-address {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.receipt-divider {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin: 16px 0;
}

.receipt-body .receipt-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin: 8px 0;
}

.receipt-amount {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0;
}

.receipt-status {
  text-align: center;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  margin: 16px 0;
  border: 2px solid;
}

.receipt-status.success {
  color: #28a745;
  border-color: #28a745;
}

.receipt-status.pending {
  color: #ffc107;
  border-color: #ffc107;
}

.receipt-status.failed {
  color: #dc3545;
  border-color: #dc3545;
}

.receipt-footer {
  font-size: 11px;
  color: #666;
  text-align: center;
  margin-top: 20px;
}

.receipt-footer p {
  margin: 4px 0;
}

.receipt-thank {
  text-align: center;
  font-size: 14px;
  margin-top: 20px;
  font-weight: bold;
}

/* ===== 银联样式 ===== */
.unionpay-screen {
  background: #f5f5f5;
  min-height: 100%;
}

.unionpay-screen .status-bar {
  background: #E21836;
  color: #fff;
}

.unionpay-screen .nav-bar.red {
  background: #E21836;
  color: #fff;
}

.unionpay-screen .content {
  padding: 16px;
}

.unionpay-screen .unionpay-card {
  background: linear-gradient(135deg, #E21836 0%, #C41230 100%);
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  text-align: center;
  margin-bottom: 16px;
}

.unionpay-screen .status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 16px;
}

.unionpay-screen .status-badge.success {
  background: rgba(255,255,255,0.2);
}

.unionpay-screen .amount-display {
  font-size: 40px;
  font-weight: 500;
  margin-bottom: 12px;
}

.unionpay-screen .amount-display .currency {
  font-size: 24px;
}

.unionpay-screen .card-info {
  font-size: 13px;
  opacity: 0.9;
}

.unionpay-screen .detail-card {
  background: #fff;
  border-radius: 12px;
}

.unionpay-screen .detail-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
}

.unionpay-screen .detail-row .label {
  color: #999;
}

.unionpay-screen .detail-row .value.small {
  font-size: 12px;
  color: #999;
}

/* ===== PayPal 样式 ===== */
.paypal-screen {
  background: #f5f5f5;
  min-height: 100%;
}

.paypal-screen .status-bar {
  background: #003087;
  color: #fff;
}

.paypal-screen .nav-bar.blue {
  background: #003087;
  color: #fff;
}

.paypal-screen .content {
  padding: 20px;
}

.paypal-screen .paypal-card {
  background: #fff;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 16px;
}

.paypal-screen .status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 28px;
  color: #fff;
}

.paypal-screen .status-icon.success {
  background: #00BA88;
}

.paypal-screen .status-icon.pending {
  background: #FFB800;
}

.paypal-screen .status-icon.failed {
  background: #FF4D4D;
}

.paypal-screen .status-text {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.paypal-screen .amount {
  font-size: 36px;
  font-weight: 300;
  margin-bottom: 8px;
}

.paypal-screen .recipient {
  font-size: 14px;
  color: #666;
}

.paypal-screen .info-section {
  background: #fff;
  border-radius: 12px;
}

.paypal-screen .info-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
}

.paypal-screen .info-row .label {
  color: #666;
}
</style>
