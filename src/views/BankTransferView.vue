<template>
  <div class="bank-transfer-view">
    <div class="page-header">
      <h1>🏦 银行转账截图生成器</h1>
      <p class="description">生成工商、建设、农业、中国、招商等银行APP截图</p>
    </div>

    <div class="main-content">
      <!-- 左侧编辑面板 -->
      <div class="edit-panel">
        <!-- 银行选择 -->
        <div class="bank-selector">
          <button 
            v-for="bank in banks" 
            :key="bank.id"
            :class="['bank-btn', { active: store.data.bank === bank.id }]"
            :style="{ '--bank-color': bank.color }"
            @click="store.setBankDefaults(bank.id as any)"
          >
            <span class="bank-icon">{{ bank.icon }}</span>
            <span class="bank-name">{{ bank.shortName }}</span>
          </button>
        </div>

        <!-- 类型选择 -->
        <div class="type-selector">
          <button 
            v-for="type in transferTypes"
            :key="type.id"
            :class="['type-btn', { active: store.data.transferType === type.id }]"
            @click="store.data.transferType = type.id as any"
          >
            {{ type.icon }} {{ type.label }}
          </button>
        </div>

        <div class="tabs">
          <button 
            v-for="tab in currentTabs" 
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 转账信息 -->
          <div v-show="activeTab === 'transfer'" class="form-section">
            <h3>💰 转账信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>转账金额</label>
                <input type="number" v-model.number="store.data.amount" step="0.01" />
              </div>
              <div class="form-group">
                <label>货币类型</label>
                <CurrencySelector v-model="store.data.currency" />
              </div>
            </div>

            <div class="form-group">
              <label>转账状态</label>
              <div class="status-options">
                <button 
                  :class="['status-btn success', { active: store.data.status === 'success' }]"
                  @click="store.data.status = 'success'"
                >✓ 成功</button>
                <button 
                  :class="['status-btn pending', { active: store.data.status === 'pending' }]"
                  @click="store.data.status = 'pending'"
                >⏳ 待处理</button>
                <button 
                  :class="['status-btn processing', { active: store.data.status === 'processing' }]"
                  @click="store.data.status = 'processing'"
                >⟳ 处理中</button>
                <button 
                  :class="['status-btn failed', { active: store.data.status === 'failed' }]"
                  @click="store.data.status = 'failed'"
                >✕ 失败</button>
              </div>
            </div>

            <div class="form-group">
              <label>转账备注</label>
              <input type="text" v-model="store.data.remarks" placeholder="转账备注" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>转账时间</label>
                <input type="text" v-model="store.data.transactionTime" />
              </div>
              <div class="form-group">
                <label>手续费</label>
                <input type="number" v-model.number="store.data.fee" step="0.01" />
              </div>
            </div>
          </div>

          <!-- 收款方 -->
          <div v-show="activeTab === 'receiver'" class="form-section">
            <h3>📥 收款方信息</h3>
            
            <div class="form-group">
              <label>收款人姓名</label>
              <input type="text" v-model="store.data.receiverName" placeholder="张*三" />
            </div>
            <div class="form-group">
              <label>收款银行</label>
              <input type="text" v-model="store.data.receiverBank" />
            </div>
            <div class="form-group">
              <label>收款账号 (显示)</label>
              <input type="text" v-model="store.data.receiverAccount" placeholder="6225 **** **** 8888" />
            </div>
          </div>

          <!-- 付款方 -->
          <div v-show="activeTab === 'sender'" class="form-section">
            <h3>📤 付款方信息</h3>
            
            <div class="form-group">
              <label>付款人姓名</label>
              <input type="text" v-model="store.data.senderName" placeholder="李*四" />
            </div>
            <div class="form-group">
              <label>付款银行</label>
              <input type="text" v-model="store.data.senderBank" />
            </div>
            <div class="form-group">
              <label>付款账号 (显示)</label>
              <input type="text" v-model="store.data.senderAccount" placeholder="6225 **** **** 6666" />
            </div>
          </div>

          <!-- 交易信息 -->
          <div v-show="activeTab === 'transaction'" class="form-section">
            <h3>📋 交易信息</h3>
            
            <div class="form-group">
              <label>交易流水号</label>
              <div class="input-with-btn">
                <input type="text" v-model="store.data.transactionId" />
                <button @click="store.refreshTransactionId()">🎲</button>
              </div>
            </div>
            <div class="form-group">
              <label>订单编号</label>
              <input type="text" v-model="store.data.orderNo" />
            </div>
            <div class="form-group">
              <label>转账渠道</label>
              <input type="text" v-model="store.data.transferChannel" />
            </div>
          </div>

          <!-- 余额信息 -->
          <div v-show="activeTab === 'balance'" class="form-section">
            <h3>💰 余额信息</h3>
            
            <div class="form-group">
              <label>账户余额</label>
              <input type="number" v-model.number="store.data.balanceAmount" step="0.01" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>可用余额</label>
                <input type="number" v-model.number="store.data.availableAmount" step="0.01" />
              </div>
              <div class="form-group">
                <label>冻结金额</label>
                <input type="number" v-model.number="store.data.frozenAmount" step="0.01" />
              </div>
            </div>
          </div>

          <!-- 账单明细 -->
          <div v-show="activeTab === 'bill'" class="form-section">
            <div class="section-header">
              <h3>📋 账单明细</h3>
              <button class="btn-add" @click="store.addBillItem()">+ 添加记录</button>
            </div>
            
            <div class="form-group">
              <label>账单月份</label>
              <input type="month" v-model="store.data.billMonth" />
            </div>

            <div v-for="(item, index) in store.data.billItems" :key="index" class="bill-item-card">
              <div class="bill-item-header">
                <span class="item-index">#{{ index + 1 }}</span>
                <select v-model="item.type" style="width: 80px;">
                  <option value="income">收入</option>
                  <option value="expense">支出</option>
                </select>
                <button class="btn-remove" @click="store.removeBillItem(index)">×</button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>日期时间</label>
                  <input type="text" v-model="item.date" placeholder="01-15 10:30" />
                </div>
                <div class="form-group">
                  <label>金额</label>
                  <input type="number" v-model.number="item.amount" step="0.01" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>描述</label>
                  <input type="text" v-model="item.description" />
                </div>
                <div class="form-group">
                  <label>余额</label>
                  <input type="number" v-model.number="item.balance" step="0.01" />
                </div>
              </div>
            </div>
          </div>

          <!-- 设备设置 -->
          <div v-show="activeTab === 'settings'" class="form-section">
            <h3>📱 设备设置</h3>
            
            <div class="form-group">
              <label>设备类型</label>
              <div class="device-options">
                <button 
                  :class="['device-btn', { active: store.data.deviceType === 'iphone' }]"
                  @click="store.data.deviceType = 'iphone'"
                >📱 iPhone</button>
                <button 
                  :class="['device-btn', { active: store.data.deviceType === 'android' }]"
                  @click="store.data.deviceType = 'android'"
                >🤖 Android</button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>显示时间</label>
                <input type="text" v-model="store.data.showTime" />
              </div>
              <div class="form-group">
                <label>电量 (%)</label>
                <input type="number" v-model.number="store.data.showBattery" min="0" max="100" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>信号强度 (1-4)</label>
                <input type="number" v-model.number="store.data.showSignal" min="1" max="4" />
              </div>
            </div>

            <div class="toggle-group">
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.showWifi" />
                <span>显示WiFi图标</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.darkMode" />
                <span>深色模式</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.showTransactionId" />
                <span>显示交易流水号</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.showFee" />
                <span>显示手续费</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.showRemarks" />
                <span>显示备注</span>
              </label>
            </div>

            <div class="form-group">
              <label>导出质量</label>
              <select v-model="exportQuality">
                <option value="1">标准 (1x)</option>
                <option value="2">高清 (2x)</option>
                <option value="3">超清 (3x)</option>
              </select>
            </div>

            <button class="btn-reset" @click="store.reset()">重置所有设置</button>
          </div>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>实时预览</h3>
          <div class="preview-actions">
            <button class="btn-download" @click="downloadImage">📥 下载图片</button>
            <button class="btn-download secondary" @click="downloadPDF">📄 下载PDF</button>
          </div>
        </div>
        <div class="preview-container">
          <div ref="previewRef" class="preview-wrapper">
            <BankTransferPreview />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBankTransferStore, banks, transferTypes, currencies } from '@/stores/bankTransfer'
import BankTransferPreview from '@/components/BankTransferPreview.vue'
import CurrencySelector from '@/components/CurrencySelector.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useBankTransferStore()
const activeTab = ref('transfer')
const previewRef = ref<HTMLElement | null>(null)
const exportQuality = ref('2')

const currentTabs = computed(() => {
  if (store.data.transferType === 'transfer') {
    return [
      { id: 'transfer', label: '💰 转账' },
      { id: 'receiver', label: '📥 收款方' },
      { id: 'sender', label: '📤 付款方' },
      { id: 'transaction', label: '📋 交易' },
      { id: 'settings', label: '⚙️ 设置' }
    ]
  } else if (store.data.transferType === 'receipt') {
    return [
      { id: 'transfer', label: '💰 收款' },
      { id: 'sender', label: '📤 付款方' },
      { id: 'receiver', label: '📥 收款方' },
      { id: 'transaction', label: '📋 交易' },
      { id: 'settings', label: '⚙️ 设置' }
    ]
  } else if (store.data.transferType === 'balance') {
    return [
      { id: 'balance', label: '💰 余额' },
      { id: 'sender', label: '📤 账户' },
      { id: 'settings', label: '⚙️ 设置' }
    ]
  } else if (store.data.transferType === 'bill') {
    return [
      { id: 'bill', label: '📋 账单' },
      { id: 'sender', label: '📤 账户' },
      { id: 'settings', label: '⚙️ 设置' }
    ]
  }
  return [{ id: 'settings', label: '⚙️ 设置' }]
})

const downloadImage = async () => {
  if (!previewRef.value) return
  const scale = parseInt(exportQuality.value)
  const canvas = await html2canvas(previewRef.value, {
    scale,
    useCORS: true,
    backgroundColor: null
  })
  const link = document.createElement('a')
  link.download = `bank-${store.data.bank}-${store.data.transferType}-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const downloadPDF = async () => {
  if (!previewRef.value) return
  const scale = parseInt(exportQuality.value)
  const canvas = await html2canvas(previewRef.value, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`bank-${store.data.bank}-${store.data.transferType}-${Date.now()}.pdf`)
}
</script>

<style scoped>
.bank-transfer-view {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.75rem;
  margin: 0 0 8px 0;
  color: #1e293b;
}

.description {
  color: #64748b;
  margin: 0;
}

.main-content {
  display: flex;
  gap: 24px;
}

.edit-panel {
  width: 480px;
  flex-shrink: 0;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-height: calc(100vh - 150px);
  overflow-y: auto;
}

.preview-panel {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

/* 银行选择器 */
.bank-selector {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin-bottom: 16px;
}

.bank-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.bank-btn:hover {
  border-color: var(--bank-color);
  background: color-mix(in srgb, var(--bank-color) 10%, white);
}

.bank-btn.active {
  border-color: var(--bank-color);
  background: color-mix(in srgb, var(--bank-color) 15%, white);
}

.bank-icon {
  font-size: 18px;
}

.bank-name {
  font-size: 9px;
  font-weight: 600;
  color: #475569;
}

/* 类型选择器 */
.type-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.type-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: #4B6EF5;
}

.type-btn.active {
  border-color: #4B6EF5;
  background: #EEF2FF;
  color: #4B6EF5;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #334155;
}

.tab-btn.active {
  background: white;
  color: #4B6EF5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 表单样式 */
.form-section {
  margin-bottom: 20px;
}

.form-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
}

.btn-add {
  padding: 6px 12px;
  border: 1px dashed #4B6EF5;
  border-radius: 6px;
  background: white;
  color: #4B6EF5;
  font-size: 12px;
  cursor: pointer;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  flex: 1;
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4B6EF5;
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn input {
  flex: 1;
}

.input-with-btn button {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

/* 状态选项 */
.status-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.status-btn.success.active {
  border-color: #22c55e;
  background: #dcfce7;
  color: #16a34a;
}

.status-btn.pending.active {
  border-color: #f59e0b;
  background: #fef3c7;
  color: #d97706;
}

.status-btn.processing.active {
  border-color: #3b82f6;
  background: #dbeafe;
  color: #2563eb;
}

.status-btn.failed.active {
  border-color: #ef4444;
  background: #fee2e2;
  color: #dc2626;
}

/* 账单项卡片 */
.bill-item-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.bill-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.item-index {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}

.btn-remove {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
}

/* 设备选项 */
.device-options {
  display: flex;
  gap: 8px;
}

.device-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.device-btn.active {
  border-color: #4B6EF5;
  background: #EEF2FF;
  color: #4B6EF5;
}

/* 开关组 */
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.toggle-item span {
  font-size: 13px;
}

/* 重置按钮 */
.btn-reset {
  width: 100%;
  padding: 12px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 16px;
}

.btn-reset:hover {
  background: #e2e8f0;
}

/* 预览区 */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.btn-download {
  padding: 8px 16px;
  border: none;
  background: linear-gradient(135deg, #4B6EF5, #6C5CE7);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-download:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
}

.btn-download.secondary {
  background: white;
  color: #4B6EF5;
  border: 1px solid #4B6EF5;
}

.preview-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  overflow-y: auto;
}
</style>
