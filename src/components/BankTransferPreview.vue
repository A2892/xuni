<template>
  <div class="bank-transfer-preview" :class="[data.bank, { dark: data.darkMode }]">
    <div class="device-frame" :class="data.deviceType">
      <!-- 状态栏 -->
      <div class="status-bar">
        <div class="status-left">
          <span class="time">{{ data.showTime }}</span>
        </div>
        <div class="status-center">
          <div v-if="data.deviceType === 'iphone'" class="notch"></div>
        </div>
        <div class="status-right">
          <div class="signal-bars">
            <span v-for="i in 4" :key="i" :class="{ active: i <= data.showSignal }"></span>
          </div>
          <span v-if="data.showWifi" class="wifi-icon">📶</span>
          <span class="battery">{{ data.showBattery }}%</span>
        </div>
      </div>

      <!-- 银行导航栏 -->
      <div class="bank-header" :style="{ background: getBankColor() }">
        <button class="back-btn">‹</button>
        <span class="header-title">{{ getHeaderTitle() }}</span>
        <button class="more-btn">⋯</button>
      </div>

      <!-- 转账成功界面 -->
      <template v-if="data.transferType === 'transfer'">
        <div class="transfer-result">
          <!-- 成功图标 -->
          <div class="result-icon" :class="data.status">
            <template v-if="data.status === 'success'">✓</template>
            <template v-else-if="data.status === 'pending'">⏳</template>
            <template v-else-if="data.status === 'processing'">⟳</template>
            <template v-else>✕</template>
          </div>
          
          <h2 class="result-title">{{ getStatusTitle() }}</h2>
          
          <!-- 金额 -->
          <div class="amount-display">
            <span class="currency">{{ getCurrencySymbol() }}</span>
            <span class="amount-value">{{ formatAmount(data.amount) }}</span>
          </div>

          <!-- 收款人信息 -->
          <div class="transfer-info-card">
            <div class="info-row">
              <span class="label">收款人</span>
              <span class="value">{{ data.receiverName }}</span>
            </div>
            <div class="info-row">
              <span class="label">收款银行</span>
              <span class="value">{{ data.receiverBank }}</span>
            </div>
            <div class="info-row">
              <span class="label">收款账号</span>
              <span class="value">{{ data.receiverAccount }}</span>
            </div>
          </div>

          <!-- 交易详情 -->
          <div class="transfer-details">
            <div v-if="data.showRemarks && data.remarks" class="detail-row">
              <span class="label">转账备注</span>
              <span class="value">{{ data.remarks }}</span>
            </div>
            <div class="detail-row">
              <span class="label">付款账户</span>
              <span class="value">{{ data.senderAccount }}</span>
            </div>
            <div class="detail-row">
              <span class="label">转账时间</span>
              <span class="value">{{ data.transactionTime }}</span>
            </div>
            <div v-if="data.showTransactionId" class="detail-row">
              <span class="label">交易流水号</span>
              <span class="value small">{{ data.transactionId }}</span>
            </div>
            <div v-if="data.showFee && data.fee > 0" class="detail-row">
              <span class="label">手续费</span>
              <span class="value">{{ getCurrencySymbol() }}{{ data.fee.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="action-buttons">
            <button class="btn-primary">完成</button>
            <button class="btn-secondary">查看详情</button>
          </div>
        </div>
      </template>

      <!-- 收款记录界面 -->
      <template v-else-if="data.transferType === 'receipt'">
        <div class="receipt-result">
          <div class="result-icon success">📥</div>
          <h2 class="result-title">收款成功</h2>
          
          <div class="amount-display incoming">
            <span class="amount-prefix">+</span>
            <span class="currency">{{ getCurrencySymbol() }}</span>
            <span class="amount-value">{{ formatAmount(data.amount) }}</span>
          </div>

          <div class="transfer-info-card">
            <div class="info-row">
              <span class="label">付款人</span>
              <span class="value">{{ data.senderName }}</span>
            </div>
            <div class="info-row">
              <span class="label">付款银行</span>
              <span class="value">{{ data.senderBank }}</span>
            </div>
            <div class="info-row">
              <span class="label">付款账号</span>
              <span class="value">{{ data.senderAccountMasked }}</span>
            </div>
          </div>

          <div class="transfer-details">
            <div v-if="data.remarks" class="detail-row">
              <span class="label">附言</span>
              <span class="value">{{ data.remarks }}</span>
            </div>
            <div class="detail-row">
              <span class="label">收款账户</span>
              <span class="value">{{ data.receiverAccount }}</span>
            </div>
            <div class="detail-row">
              <span class="label">到账时间</span>
              <span class="value">{{ data.transactionTime }}</span>
            </div>
            <div v-if="data.showTransactionId" class="detail-row">
              <span class="label">交易流水号</span>
              <span class="value small">{{ data.transactionId }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 余额查询界面 -->
      <template v-else-if="data.transferType === 'balance'">
        <div class="balance-view">
          <!-- 账户卡片 -->
          <div class="account-card" :style="{ background: getBankGradient() }">
            <div class="card-header">
              <span class="bank-name">{{ getCurrentBankName() }}</span>
              <span class="card-type">储蓄账户</span>
            </div>
            <div class="card-number">{{ data.senderAccount }}</div>
            <div class="card-balance">
              <span class="balance-label">账户余额</span>
              <div class="balance-amount">
                <span class="currency">{{ getCurrencySymbol() }}</span>
                <span class="amount">{{ formatAmount(data.balanceAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- 余额详情 -->
          <div class="balance-details">
            <div class="balance-row">
              <span class="label">可用余额</span>
              <span class="value">{{ getCurrencySymbol() }}{{ formatAmount(data.availableAmount) }}</span>
            </div>
            <div class="balance-row">
              <span class="label">冻结金额</span>
              <span class="value">{{ getCurrencySymbol() }}{{ formatAmount(data.frozenAmount) }}</span>
            </div>
            <div class="balance-row">
              <span class="label">查询时间</span>
              <span class="value">{{ data.transactionTime }}</span>
            </div>
          </div>

          <!-- 快捷功能 -->
          <div class="quick-actions">
            <button class="quick-btn">
              <span class="icon">↗️</span>
              <span class="text">转账</span>
            </button>
            <button class="quick-btn">
              <span class="icon">📋</span>
              <span class="text">账单</span>
            </button>
            <button class="quick-btn">
              <span class="icon">💳</span>
              <span class="text">卡管理</span>
            </button>
          </div>
        </div>
      </template>

      <!-- 账单明细界面 -->
      <template v-else-if="data.transferType === 'bill'">
        <div class="bill-view">
          <!-- 月份选择 -->
          <div class="month-selector">
            <span class="month-text">{{ formatMonth(data.billMonth) }}</span>
            <span class="arrow">▾</span>
          </div>

          <!-- 账单汇总 -->
          <div class="bill-summary">
            <div class="summary-item income">
              <span class="label">收入</span>
              <span class="value">+{{ getCurrencySymbol() }}{{ formatAmount(getTotalIncome()) }}</span>
            </div>
            <div class="summary-item expense">
              <span class="label">支出</span>
              <span class="value">-{{ getCurrencySymbol() }}{{ formatAmount(getTotalExpense()) }}</span>
            </div>
          </div>

          <!-- 交易列表 -->
          <div class="bill-list">
            <div 
              v-for="(item, index) in data.billItems" 
              :key="index"
              class="bill-item"
            >
              <div class="item-left">
                <span :class="['item-icon', item.type]">
                  {{ item.type === 'income' ? '📥' : '📤' }}
                </span>
                <div class="item-info">
                  <span class="item-desc">{{ item.description }}</span>
                  <span class="item-date">{{ item.date }}</span>
                </div>
              </div>
              <div class="item-right">
                <span :class="['item-amount', item.type]">
                  {{ item.type === 'income' ? '+' : '-' }}{{ getCurrencySymbol() }}{{ formatAmount(item.amount) }}
                </span>
                <span class="item-balance">余额 {{ getCurrencySymbol() }}{{ formatAmount(item.balance) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBankTransferStore, banks, currencies } from '@/stores/bankTransfer'

const store = useBankTransferStore()
const data = store.data

const getBankColor = () => {
  const bank = banks.find(b => b.id === data.bank)
  return bank ? bank.color : '#C8102E'
}

const getBankGradient = () => {
  const color = getBankColor()
  return `linear-gradient(135deg, ${color}, ${adjustColor(color, -30)})`
}

const adjustColor = (color: string, amount: number) => {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
  return `rgb(${r}, ${g}, ${b})`
}

const getCurrentBankName = () => {
  const bank = banks.find(b => b.id === data.bank)
  return bank ? bank.label : '银行'
}

const getHeaderTitle = () => {
  const titles: Record<string, string> = {
    transfer: '转账结果',
    receipt: '收款详情',
    balance: '账户查询',
    bill: '交易明细'
  }
  return titles[data.transferType] || '银行'
}

const getStatusTitle = () => {
  const titles: Record<string, string> = {
    success: '转账成功',
    pending: '等待处理',
    processing: '处理中',
    failed: '转账失败'
  }
  return titles[data.status] || '转账成功'
}

const getCurrencySymbol = () => {
  const currency = currencies.find(c => c.id === data.currency)
  return currency ? currency.symbol : '¥'
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatMonth = (month: string) => {
  const [year, m] = month.split('-')
  return `${year}年${parseInt(m)}月`
}

const getTotalIncome = () => {
  return data.billItems.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
}

const getTotalExpense = () => {
  return data.billItems.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
}
</script>

<style scoped>
.bank-transfer-preview {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.device-frame {
  width: 375px;
  background: #f5f5f5;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.device-frame.iphone {
  border: 8px solid #1a1a1a;
}

.device-frame.android {
  border: 6px solid #333;
  border-radius: 30px;
}

/* 状态栏 */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: white;
  font-size: 12px;
  font-weight: 600;
}

.dark .status-bar {
  background: #1a1a1a;
  color: white;
}

.status-center .notch {
  width: 100px;
  height: 25px;
  background: black;
  border-radius: 0 0 20px 20px;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.signal-bars {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  height: 10px;
}

.signal-bars span {
  width: 3px;
  background: #ccc;
  border-radius: 1px;
}

.signal-bars span:nth-child(1) { height: 4px; }
.signal-bars span:nth-child(2) { height: 6px; }
.signal-bars span:nth-child(3) { height: 8px; }
.signal-bars span:nth-child(4) { height: 10px; }

.signal-bars span.active {
  background: #333;
}

/* 银行导航栏 */
.bank-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: white;
}

.back-btn, .more-btn {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
}

/* 转账成功界面 */
.transfer-result {
  padding: 32px 24px;
  background: white;
  min-height: 500px;
}

.result-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
}

.result-icon.success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.result-icon.pending {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.result-icon.processing {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.result-icon.failed {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.result-title {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: #333;
}

.amount-display {
  text-align: center;
  margin-bottom: 32px;
}

.amount-display .currency {
  font-size: 24px;
  font-weight: 500;
  color: #333;
}

.amount-display .amount-value {
  font-size: 40px;
  font-weight: 700;
  color: #333;
}

.amount-display.incoming .amount-prefix {
  font-size: 32px;
  color: #22c55e;
}

.amount-display.incoming .currency,
.amount-display.incoming .amount-value {
  color: #22c55e;
}

/* 转账信息卡片 */
.transfer-info-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  color: #64748b;
  font-size: 14px;
}

.info-row .value {
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
}

/* 交易详情 */
.transfer-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.detail-row .label {
  color: #94a3b8;
}

.detail-row .value {
  color: #64748b;
}

.detail-row .value.small {
  font-size: 11px;
  font-family: monospace;
}

/* 按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #C8102E, #a00d24);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.cmb .btn-primary {
  background: linear-gradient(135deg, #C8102E, #a00d24);
}

.icbc .btn-primary {
  background: linear-gradient(135deg, #C41E3A, #9a1830);
}

.ccb .btn-primary {
  background: linear-gradient(135deg, #003399, #002266);
}

.abc .btn-primary {
  background: linear-gradient(135deg, #00A651, #007a3d);
}

.btn-secondary {
  width: 100%;
  padding: 14px;
  background: white;
  color: #64748b;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

/* 收款结果 */
.receipt-result {
  padding: 32px 24px;
  background: white;
  min-height: 500px;
}

/* 余额查询 */
.balance-view {
  padding: 20px;
  background: #f5f5f5;
  min-height: 500px;
}

.account-card {
  border-radius: 16px;
  padding: 24px;
  color: white;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.bank-name {
  font-size: 16px;
  font-weight: 600;
}

.card-type {
  font-size: 12px;
  opacity: 0.8;
}

.card-number {
  font-size: 18px;
  letter-spacing: 2px;
  margin-bottom: 24px;
  font-family: monospace;
}

.card-balance {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.balance-label {
  font-size: 12px;
  opacity: 0.8;
}

.balance-amount {
  display: flex;
  align-items: baseline;
}

.balance-amount .currency {
  font-size: 20px;
  margin-right: 4px;
}

.balance-amount .amount {
  font-size: 32px;
  font-weight: 700;
}

.balance-details {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.balance-row:last-child {
  border-bottom: none;
}

.balance-row .label {
  color: #64748b;
}

.balance-row .value {
  font-weight: 500;
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
}

.quick-btn .icon {
  font-size: 24px;
}

.quick-btn .text {
  font-size: 13px;
  color: #64748b;
}

/* 账单明细 */
.bill-view {
  background: white;
  min-height: 500px;
}

.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #f8fafc;
}

.month-text {
  font-size: 16px;
  font-weight: 600;
}

.bill-summary {
  display: flex;
  padding: 20px;
  gap: 20px;
}

.summary-item {
  flex: 1;
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.summary-item .label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 600;
}

.summary-item.income .value {
  color: #22c55e;
}

.summary-item.expense .value {
  color: #ef4444;
}

.bill-list {
  padding: 0 16px;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.item-icon.income {
  background: #dcfce7;
}

.item-icon.expense {
  background: #fee2e2;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-desc {
  font-size: 14px;
  font-weight: 500;
}

.item-date {
  font-size: 12px;
  color: #94a3b8;
}

.item-right {
  text-align: right;
}

.item-amount {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.item-amount.income {
  color: #22c55e;
}

.item-amount.expense {
  color: #ef4444;
}

.item-balance {
  font-size: 11px;
  color: #94a3b8;
}
</style>
