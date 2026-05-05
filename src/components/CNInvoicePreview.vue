<template>
  <div class="cn-invoice-preview" :class="[`template-${store.data.template}`, `type-${store.data.invoiceType}`]">
    <!-- 标准发票模板 -->
    <div v-if="store.data.template === 'standard'" class="invoice-standard">
      <!-- 发票头部 -->
      <div class="invoice-header">
        <div class="header-left">
          <div class="invoice-code-section">
            <div class="code-row">
              <span class="code-label">发票代码:</span>
              <span class="code-value">{{ store.data.invoiceCode }}</span>
            </div>
            <div class="code-row">
              <span class="code-label">发票号码:</span>
              <span class="code-value invoice-number">{{ store.data.invoiceNumber }}</span>
            </div>
            <div class="code-row">
              <span class="code-label">开票日期:</span>
              <span class="code-value">{{ store.formatDate(store.data.invoiceDate) }}</span>
            </div>
          </div>
        </div>
        
        <div class="header-center">
          <div class="invoice-title">
            <div class="title-main">{{ invoiceTypes[store.data.invoiceType].name }}</div>
            <div class="title-sub">{{ store.data.invoiceType === 'electronic' ? '(电子)' : '' }}</div>
          </div>
        </div>
        
        <div class="header-right">
          <div v-if="store.data.showQRCode" class="qr-code-area">
            <div class="qr-placeholder">
              <div class="qr-grid">
                <div v-for="i in 25" :key="i" 
                     class="qr-cell" 
                     :class="{ filled: Math.random() > 0.5 }">
                </div>
              </div>
            </div>
            <div class="check-code">校验码: {{ store.data.checkCode.substring(0, 10) }}...</div>
          </div>
        </div>
      </div>

      <!-- 购买方信息 -->
      <div class="buyer-section section-box">
        <div class="section-label">购买方</div>
        <div class="section-content">
          <div class="info-row">
            <span class="info-label">名 称:</span>
            <span class="info-value">{{ store.data.buyerName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">纳税人识别号:</span>
            <span class="info-value tax-number">{{ store.data.buyerTaxNumber }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">地址、电话:</span>
            <span class="info-value">{{ store.data.buyerAddress }} {{ store.data.buyerPhone }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">开户行及账号:</span>
            <span class="info-value">{{ store.data.buyerBank }} {{ store.data.buyerAccount }}</span>
          </div>
        </div>
        <div class="section-password">
          <div class="password-label">密码区</div>
          <div class="password-content">
            <div class="password-line" v-for="i in 4" :key="i">
              {{ generatePasswordLine() }}
            </div>
          </div>
        </div>
      </div>

      <!-- 商品明细 -->
      <div class="items-section">
        <table class="items-table">
          <thead>
            <tr>
              <th class="col-name">货物或应税劳务、服务名称</th>
              <th class="col-spec">规格型号</th>
              <th class="col-unit">单位</th>
              <th class="col-qty">数量</th>
              <th class="col-price">单价</th>
              <th class="col-amount">金额</th>
              <th class="col-rate" v-if="store.data.showTaxDetails">税率</th>
              <th class="col-tax" v-if="store.data.showTaxDetails">税额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.data.items" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.spec }}</td>
              <td>{{ item.unit }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unitPrice.toFixed(2) }}</td>
              <td>{{ item.amount.toFixed(2) }}</td>
              <td v-if="store.data.showTaxDetails">{{ item.taxRate }}%</td>
              <td v-if="store.data.showTaxDetails">{{ item.taxAmount.toFixed(2) }}</td>
            </tr>
            <!-- 空行填充 -->
            <tr v-for="i in Math.max(0, 4 - store.data.items.length)" :key="'empty-' + i" class="empty-row">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td v-if="store.data.showTaxDetails"></td>
              <td v-if="store.data.showTaxDetails"></td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td>合 计</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>¥{{ store.calculatedTotal.toFixed(2) }}</td>
              <td v-if="store.data.showTaxDetails"></td>
              <td v-if="store.data.showTaxDetails">¥{{ store.calculatedTax.toFixed(2) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 价税合计 -->
      <div class="total-section">
        <div class="total-words">
          <span class="total-label">价税合计（大写）</span>
          <span class="total-value-words">{{ store.data.totalAmountInWords }}</span>
        </div>
        <div class="total-number">
          <span class="total-label">（小写）</span>
          <span class="total-value-number">¥{{ store.totalWithTax.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 销售方信息 -->
      <div class="seller-section section-box">
        <div class="section-label">销售方</div>
        <div class="section-content">
          <div class="info-row">
            <span class="info-label">名 称:</span>
            <span class="info-value">{{ store.data.sellerName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">纳税人识别号:</span>
            <span class="info-value tax-number">{{ store.data.sellerTaxNumber }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">地址、电话:</span>
            <span class="info-value">{{ store.data.sellerAddress }} {{ store.data.sellerPhone }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">开户行及账号:</span>
            <span class="info-value">{{ store.data.sellerBank }} {{ store.data.sellerAccount }}</span>
          </div>
        </div>
        <div class="section-remarks">
          <div class="remarks-label">备注</div>
          <div class="remarks-content">{{ store.data.remarks }}</div>
        </div>
      </div>

      <!-- 发票底部 -->
      <div class="invoice-footer">
        <div class="footer-item">
          <span class="footer-label">收款人:</span>
          <span class="footer-value">{{ store.data.payee }}</span>
        </div>
        <div class="footer-item">
          <span class="footer-label">复核:</span>
          <span class="footer-value">{{ store.data.reviewer }}</span>
        </div>
        <div class="footer-item">
          <span class="footer-label">开票人:</span>
          <span class="footer-value">{{ store.data.drawer }}</span>
        </div>
        <div class="footer-item">
          <span class="footer-label">销售方:(章)</span>
          <div class="stamp-area">
            <div class="stamp-circle">{{ store.data.sellerName.substring(0, 6) }}</div>
          </div>
        </div>
      </div>

      <!-- 机器编号 -->
      <div class="machine-code">
        机器编号: {{ store.data.machineCode }}
      </div>
    </div>

    <!-- 电子发票模板 -->
    <div v-else-if="store.data.template === 'electronic'" class="invoice-electronic">
      <div class="e-header">
        <div class="e-logo">📄</div>
        <div class="e-title">
          <div class="e-title-main">{{ invoiceTypes[store.data.invoiceType].name }}</div>
          <div class="e-title-sub">电子版</div>
        </div>
        <div class="e-qr" v-if="store.data.showQRCode">
          <div class="qr-placeholder small">
            <div class="qr-grid">
              <div v-for="i in 16" :key="i" 
                   class="qr-cell" 
                   :class="{ filled: Math.random() > 0.5 }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="e-info-bar">
        <span>发票代码: {{ store.data.invoiceCode }}</span>
        <span>发票号码: {{ store.data.invoiceNumber }}</span>
        <span>开票日期: {{ store.formatDate(store.data.invoiceDate) }}</span>
      </div>

      <div class="e-parties">
        <div class="e-party buyer">
          <div class="e-party-title">购买方</div>
          <div class="e-party-name">{{ store.data.buyerName }}</div>
          <div class="e-party-tax">{{ store.data.buyerTaxNumber }}</div>
        </div>
        <div class="e-arrow">→</div>
        <div class="e-party seller">
          <div class="e-party-title">销售方</div>
          <div class="e-party-name">{{ store.data.sellerName }}</div>
          <div class="e-party-tax">{{ store.data.sellerTaxNumber }}</div>
        </div>
      </div>

      <div class="e-items">
        <table class="e-table">
          <thead>
            <tr>
              <th>项目名称</th>
              <th>数量</th>
              <th>单价</th>
              <th>金额</th>
              <th v-if="store.data.showTaxDetails">税额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.data.items" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>¥{{ item.unitPrice.toFixed(2) }}</td>
              <td>¥{{ item.amount.toFixed(2) }}</td>
              <td v-if="store.data.showTaxDetails">¥{{ item.taxAmount.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="e-total">
        <div class="e-total-row">
          <span class="e-total-label">价税合计</span>
          <span class="e-total-value">¥{{ store.totalWithTax.toFixed(2) }}</span>
        </div>
        <div class="e-total-words">{{ store.data.totalAmountInWords }}</div>
      </div>

      <div class="e-footer">
        <div class="e-check">校验码: {{ store.data.checkCode }}</div>
        <div class="e-drawer">开票人: {{ store.data.drawer }}</div>
      </div>
    </div>

    <!-- 简化模板 -->
    <div v-else class="invoice-simplified">
      <div class="s-header">
        <div class="s-title">{{ invoiceTypes[store.data.invoiceType].name }}</div>
        <div class="s-info">
          <div>No. {{ store.data.invoiceNumber }}</div>
          <div>{{ store.formatDate(store.data.invoiceDate) }}</div>
        </div>
      </div>

      <div class="s-parties">
        <div class="s-party">
          <span class="s-label">购买方:</span>
          <span class="s-value">{{ store.data.buyerName }}</span>
        </div>
        <div class="s-party">
          <span class="s-label">销售方:</span>
          <span class="s-value">{{ store.data.sellerName }}</span>
        </div>
      </div>

      <div class="s-items">
        <div v-for="item in store.data.items" :key="item.id" class="s-item">
          <span class="s-item-name">{{ item.name }}</span>
          <span class="s-item-amount">¥{{ item.amount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="s-total">
        <div class="s-total-label">合计金额</div>
        <div class="s-total-value">¥{{ store.totalWithTax.toFixed(2) }}</div>
        <div class="s-total-words">{{ store.data.totalAmountInWords }}</div>
      </div>

      <div class="s-footer">
        <span>开票人: {{ store.data.drawer }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCNInvoiceStore, invoiceTypes } from '@/stores/cnInvoice'

const store = useCNInvoiceStore()

const generatePasswordLine = () => {
  const chars = '0123456789<>+-*/'
  return Array.from({ length: 27 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
</script>

<style scoped>
.cn-invoice-preview {
  font-family: '宋体', 'SimSun', serif;
  background: #fff;
  width: 700px;
}

/* 发票类型颜色 */
.type-normal { --invoice-color: #0066cc; }
.type-special { --invoice-color: #cc0000; }
.type-electronic { --invoice-color: #009900; }
.type-roll { --invoice-color: #666666; }

/* 标准发票样式 */
.invoice-standard {
  border: 2px solid var(--invoice-color);
  padding: 16px;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--invoice-color);
}

.code-row {
  font-size: 12px;
  margin-bottom: 4px;
}

.code-label {
  color: #666;
}

.code-value {
  font-weight: bold;
  color: #000;
  margin-left: 8px;
}

.invoice-number {
  color: var(--invoice-color);
  font-size: 14px;
}

.invoice-title {
  text-align: center;
}

.title-main {
  font-size: 22px;
  font-weight: bold;
  color: var(--invoice-color);
  letter-spacing: 4px;
}

.title-sub {
  font-size: 12px;
  color: #666;
}

.qr-code-area {
  text-align: center;
}

.qr-placeholder {
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.qr-placeholder.small {
  width: 60px;
  height: 60px;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  width: 70%;
  height: 70%;
}

.qr-cell {
  background: #fff;
}

.qr-cell.filled {
  background: #000;
}

.check-code {
  font-size: 10px;
  color: #666;
}

.section-box {
  display: flex;
  border: 1px solid #ddd;
  margin-bottom: 8px;
}

.section-label {
  writing-mode: vertical-rl;
  text-orientation: upright;
  background: #f5f5f5;
  padding: 8px 4px;
  font-size: 14px;
  font-weight: bold;
  border-right: 1px solid #ddd;
  letter-spacing: 4px;
}

.section-content {
  flex: 1;
  padding: 8px 12px;
}

.info-row {
  font-size: 12px;
  margin-bottom: 4px;
  line-height: 1.6;
}

.info-label {
  color: #666;
  margin-right: 8px;
}

.info-value {
  color: #000;
}

.tax-number {
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.section-password {
  width: 180px;
  border-left: 1px solid #ddd;
  padding: 8px;
}

.password-label {
  font-size: 12px;
  text-align: center;
  margin-bottom: 4px;
  color: #666;
}

.password-content {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  line-height: 1.4;
  word-break: break-all;
}

.password-line {
  color: #333;
}

.section-remarks {
  width: 150px;
  border-left: 1px solid #ddd;
  padding: 8px;
}

.remarks-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.remarks-content {
  font-size: 11px;
  color: #333;
}

/* 商品明细表格 */
.items-section {
  margin-bottom: 8px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.items-table th,
.items-table td {
  border: 1px solid #ddd;
  padding: 6px 8px;
  text-align: center;
}

.items-table th {
  background: #f5f5f5;
  font-weight: bold;
}

.col-name { width: 30%; text-align: left; }
.col-spec { width: 12%; }
.col-unit { width: 8%; }
.col-qty { width: 10%; }
.col-price { width: 12%; }
.col-amount { width: 12%; }
.col-rate { width: 8%; }
.col-tax { width: 10%; }

.empty-row td {
  height: 24px;
}

.total-row td {
  font-weight: bold;
  background: #fafafa;
}

/* 价税合计 */
.total-section {
  display: flex;
  border: 1px solid #ddd;
  margin-bottom: 8px;
}

.total-words {
  flex: 1;
  padding: 8px 12px;
  border-right: 1px solid #ddd;
  display: flex;
  align-items: center;
}

.total-label {
  font-size: 12px;
  color: #666;
  margin-right: 8px;
}

.total-value-words {
  font-size: 14px;
  font-weight: bold;
  color: var(--invoice-color);
}

.total-number {
  width: 200px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
}

.total-value-number {
  font-size: 16px;
  font-weight: bold;
  color: var(--invoice-color);
}

/* 发票底部 */
.invoice-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid #ddd;
  font-size: 12px;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-label {
  color: #666;
}

.footer-value {
  color: #000;
}

.stamp-area {
  width: 60px;
  height: 60px;
  position: relative;
}

.stamp-circle {
  width: 100%;
  height: 100%;
  border: 2px solid #cc0000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cc0000;
  font-size: 10px;
  transform: rotate(-15deg);
  text-align: center;
  font-weight: bold;
}

.machine-code {
  text-align: center;
  font-size: 10px;
  color: #999;
  margin-top: 8px;
}

/* 电子发票样式 */
.invoice-electronic {
  padding: 20px;
  background: linear-gradient(135deg, #f8fff8 0%, #fff 100%);
  border: 2px solid var(--invoice-color);
  border-radius: 8px;
}

.e-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--invoice-color);
}

.e-logo {
  font-size: 32px;
}

.e-title {
  flex: 1;
}

.e-title-main {
  font-size: 20px;
  font-weight: bold;
  color: var(--invoice-color);
}

.e-title-sub {
  font-size: 12px;
  color: #666;
}

.e-info-bar {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 12px;
}

.e-parties {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.e-party {
  flex: 1;
  padding: 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.e-party-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.e-party-name {
  font-size: 14px;
  font-weight: bold;
  color: #000;
}

.e-party-tax {
  font-size: 11px;
  color: #666;
  font-family: monospace;
}

.e-arrow {
  font-size: 24px;
  color: var(--invoice-color);
}

.e-items {
  margin-bottom: 16px;
}

.e-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.e-table th,
.e-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}

.e-table th {
  background: var(--invoice-color);
  color: #fff;
}

.e-total {
  background: var(--invoice-color);
  color: #fff;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 12px;
}

.e-total-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.e-total-label {
  font-size: 14px;
}

.e-total-value {
  font-size: 24px;
  font-weight: bold;
}

.e-total-words {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.9;
}

.e-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
}

/* 简化模板样式 */
.invoice-simplified {
  padding: 20px;
  border: 1px solid #ddd;
}

.s-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--invoice-color);
}

.s-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--invoice-color);
}

.s-info {
  text-align: right;
  font-size: 12px;
  color: #666;
}

.s-parties {
  margin-bottom: 16px;
}

.s-party {
  margin-bottom: 8px;
  font-size: 13px;
}

.s-label {
  color: #666;
}

.s-value {
  font-weight: bold;
}

.s-items {
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 12px 0;
  margin-bottom: 16px;
}

.s-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.s-total {
  text-align: right;
  margin-bottom: 16px;
}

.s-total-label {
  font-size: 12px;
  color: #666;
}

.s-total-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--invoice-color);
}

.s-total-words {
  font-size: 12px;
  color: #666;
}

.s-footer {
  font-size: 11px;
  color: #666;
  text-align: right;
}
</style>
