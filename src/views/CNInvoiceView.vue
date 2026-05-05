<template>
  <div class="cn-invoice-view">
    <!-- 左侧编辑面板 -->
    <div class="edit-panel">
      <div class="panel-header">
        <h2>🧾 国内发票生成器</h2>
        <p class="subtitle">支持增值税普通/专用发票</p>
      </div>

      <!-- 选项卡 -->
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- 发票类型 -->
      <div v-show="activeTab === 'type'" class="tab-content">
        <div class="form-section">
          <h3>选择发票类型</h3>
          <div class="form-group">
            <select v-model="store.data.invoiceType" class="form-select">
              <option v-for="(type, key) in invoiceTypes" :key="key" :value="key">
                {{ key === 'normal' ? '【普】' : key === 'special' ? '【专】' : key === 'electronic' ? '【电】' : '【卷】' }} {{ type.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>发票编号</h3>
          <div class="form-row">
            <div class="form-group">
              <label>发票代码</label>
              <input v-model="store.data.invoiceCode" type="text" />
            </div>
            <div class="form-group">
              <label>发票号码</label>
              <div class="input-with-btn">
                <input v-model="store.data.invoiceNumber" type="text" />
                <button @click="store.generateInvoiceNumber()">🎲</button>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开票日期</label>
              <input v-model="store.data.invoiceDate" type="date" />
            </div>
            <div class="form-group">
              <label>机器编号</label>
              <input v-model="store.data.machineCode" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>校验码</label>
            <div class="input-with-btn">
              <input v-model="store.data.checkCode" type="text" />
              <button @click="store.generateCheckCode()">🎲</button>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>模板样式</h3>
          <div class="template-btns">
            <button 
              v-for="template in templates" 
              :key="template.value"
              :class="['template-btn', { active: store.data.template === template.value }]"
              @click="store.data.template = template.value"
            >
              {{ template.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 购买方信息 -->
      <div v-show="activeTab === 'buyer'" class="tab-content">
        <div class="form-section">
          <h3>🏢 购买方信息</h3>
          <div class="form-group">
            <label>名称</label>
            <input v-model="store.data.buyerName" type="text" placeholder="公司名称" />
          </div>
          <div class="form-group">
            <label>纳税人识别号</label>
            <input v-model="store.data.buyerTaxNumber" type="text" placeholder="统一社会信用代码" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>地址</label>
              <input v-model="store.data.buyerAddress" type="text" placeholder="公司地址" />
            </div>
            <div class="form-group">
              <label>电话</label>
              <input v-model="store.data.buyerPhone" type="text" placeholder="联系电话" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开户行</label>
              <input v-model="store.data.buyerBank" type="text" placeholder="开户银行" />
            </div>
            <div class="form-group">
              <label>账号</label>
              <input v-model="store.data.buyerAccount" type="text" placeholder="银行账号" />
            </div>
          </div>
        </div>

        <div class="quick-fill">
          <h4>快速填充</h4>
          <div class="quick-btns">
            <button @click="fillBuyerTemplate('tech')">科技公司</button>
            <button @click="fillBuyerTemplate('trade')">贸易公司</button>
            <button @click="fillBuyerTemplate('retail')">零售公司</button>
          </div>
        </div>
      </div>

      <!-- 销售方信息 -->
      <div v-show="activeTab === 'seller'" class="tab-content">
        <div class="form-section">
          <h3>🏭 销售方信息</h3>
          <div class="form-group">
            <label>名称</label>
            <input v-model="store.data.sellerName" type="text" placeholder="公司名称" />
          </div>
          <div class="form-group">
            <label>纳税人识别号</label>
            <input v-model="store.data.sellerTaxNumber" type="text" placeholder="统一社会信用代码" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>地址</label>
              <input v-model="store.data.sellerAddress" type="text" placeholder="公司地址" />
            </div>
            <div class="form-group">
              <label>电话</label>
              <input v-model="store.data.sellerPhone" type="text" placeholder="联系电话" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开户行</label>
              <input v-model="store.data.sellerBank" type="text" placeholder="开户银行" />
            </div>
            <div class="form-group">
              <label>账号</label>
              <input v-model="store.data.sellerAccount" type="text" placeholder="银行账号" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>开票人员</h3>
          <div class="form-row three-col">
            <div class="form-group">
              <label>收款人</label>
              <input v-model="store.data.payee" type="text" />
            </div>
            <div class="form-group">
              <label>复核</label>
              <input v-model="store.data.reviewer" type="text" />
            </div>
            <div class="form-group">
              <label>开票人</label>
              <input v-model="store.data.drawer" type="text" />
            </div>
          </div>
        </div>
      </div>

      <!-- 商品明细 -->
      <div v-show="activeTab === 'items'" class="tab-content">
        <div class="form-section">
          <div class="section-header">
            <h3>📦 商品明细</h3>
            <button class="btn-add" @click="store.addItem()">+ 添加商品</button>
          </div>

          <div v-for="(item, index) in store.data.items" :key="item.id" class="item-card">
            <div class="item-header">
              <span class="item-number">商品 {{ index + 1 }}</span>
              <button class="btn-remove" @click="store.removeItem(item.id)">×</button>
            </div>
            <div class="form-row">
              <div class="form-group flex-2">
                <label>名称</label>
                <input v-model="item.name" type="text" placeholder="商品名称" />
              </div>
              <div class="form-group">
                <label>规格</label>
                <input v-model="item.spec" type="text" placeholder="规格型号" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>单位</label>
                <input v-model="item.unit" type="text" placeholder="件/箱/个" />
              </div>
              <div class="form-group">
                <label>数量</label>
                <input v-model.number="item.quantity" type="number" @change="store.calculateItemAmount(item)" />
              </div>
              <div class="form-group">
                <label>单价</label>
                <input v-model.number="item.unitPrice" type="number" step="0.01" @change="store.calculateItemAmount(item)" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>税率(%)</label>
                <select v-model.number="item.taxRate" @change="store.calculateItemAmount(item)">
                  <option :value="0">0%</option>
                  <option :value="1">1%</option>
                  <option :value="3">3%</option>
                  <option :value="6">6%</option>
                  <option :value="9">9%</option>
                  <option :value="13">13%</option>
                </select>
              </div>
              <div class="form-group">
                <label>金额</label>
                <input :value="item.amount.toFixed(2)" type="text" disabled class="computed-field" />
              </div>
              <div class="form-group">
                <label>税额</label>
                <input :value="item.taxAmount.toFixed(2)" type="text" disabled class="computed-field" />
              </div>
            </div>
          </div>

          <div v-if="store.data.items.length === 0" class="empty-items">
            <p>暂无商品，点击上方按钮添加</p>
          </div>

          <div class="totals-summary">
            <div class="total-item">
              <span>金额合计:</span>
              <span class="total-value">¥{{ store.calculatedTotal.toFixed(2) }}</span>
            </div>
            <div class="total-item">
              <span>税额合计:</span>
              <span class="total-value">¥{{ store.calculatedTax.toFixed(2) }}</span>
            </div>
            <div class="total-item highlight">
              <span>价税合计:</span>
              <span class="total-value">¥{{ store.totalWithTax.toFixed(2) }}</span>
            </div>
            <div class="total-item">
              <span>大写金额:</span>
              <span class="total-words">{{ store.data.totalAmountInWords }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 设置 -->
      <div v-show="activeTab === 'settings'" class="tab-content">
        <div class="form-section">
          <h3>⚙️ 显示设置</h3>
          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showQRCode" />
              <span>显示二维码</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showTaxDetails" />
              <span>显示税额详情</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3>📝 备注</h3>
          <textarea v-model="store.data.remarks" rows="3" placeholder="发票备注信息"></textarea>
        </div>

        <div class="form-section">
          <h3>📥 数据管理</h3>
          <SaveLoadPanel 
            document-type="invoice" 
            :get-data="() => store.data" 
            :set-data="(data: any) => Object.assign(store.data, data)" 
          />
        </div>

        <div class="form-section">
          <button class="btn-reset" @click="store.reset()">重置为默认值</button>
        </div>
      </div>
    </div>

    <!-- 右侧预览区 -->
    <div class="preview-panel">
      <div class="preview-header">
        <h3>发票预览</h3>
        <div class="preview-actions">
          <button class="btn-download" @click="downloadImage">📥 下载PNG</button>
          <button class="btn-download" @click="downloadPDF">📄 下载PDF</button>
        </div>
      </div>
      <div class="preview-container">
        <div ref="previewRef" class="preview-wrapper">
          <CNInvoicePreview />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCNInvoiceStore, invoiceTypes } from '@/stores/cnInvoice'
import CNInvoicePreview from '@/components/CNInvoicePreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useCNInvoiceStore()
const activeTab = ref('type')
const previewRef = ref<HTMLElement | null>(null)

const tabs = [
  { id: 'type', label: '类型', icon: '📋' },
  { id: 'buyer', label: '购买方', icon: '🏢' },
  { id: 'seller', label: '销售方', icon: '🏭' },
  { id: 'items', label: '商品', icon: '📦' },
  { id: 'settings', label: '设置', icon: '⚙️' }
]

const templates = [
  { value: 'standard', label: '标准模板' },
  { value: 'electronic', label: '电子发票' },
  { value: 'simplified', label: '简化模板' }
]

const fillBuyerTemplate = (type: string) => {
  const templates: Record<string, any> = {
    tech: {
      buyerName: '北京智慧科技有限公司',
      buyerTaxNumber: '91110108MA01ABCDE',
      buyerAddress: '北京市海淀区中关村科技园区',
      buyerPhone: '010-88888888',
      buyerBank: '中国工商银行北京中关村支行',
      buyerAccount: '0200001234567890123'
    },
    trade: {
      buyerName: '上海环球贸易有限公司',
      buyerTaxNumber: '91310115MA01FGHIJ',
      buyerAddress: '上海市浦东新区自贸区',
      buyerPhone: '021-66666666',
      buyerBank: '中国建设银行上海浦东支行',
      buyerAccount: '31001234567890123456'
    },
    retail: {
      buyerName: '广州天河零售有限公司',
      buyerTaxNumber: '91440106MA01KLMNO',
      buyerAddress: '广州市天河区天河路385号',
      buyerPhone: '020-55555555',
      buyerBank: '中国农业银行广州天河支行',
      buyerAccount: '44001234567890123789'
    }
  }
  Object.assign(store.data, templates[type])
}

const downloadImage = async () => {
  if (!previewRef.value) return
  const canvas = await html2canvas(previewRef.value, { 
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  const link = document.createElement('a')
  link.download = `invoice-${store.data.invoiceNumber}-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const downloadPDF = async () => {
  if (!previewRef.value) return
  const canvas = await html2canvas(previewRef.value, { 
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`invoice-${store.data.invoiceNumber}-${Date.now()}.pdf`)
}
</script>

<style scoped>
.cn-invoice-view {
  display: flex;
  height: 100%;
  gap: 24px;
  padding: 24px;
  background: var(--bg-secondary);
}

.edit-panel {
  width: 450px;
  flex-shrink: 0;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.panel-header h2 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.tabs {
  display: flex;
  gap: 8px;
  margin: 20px 0;
  padding: 4px;
  background: var(--bg-secondary);
  border-radius: 12px;
  flex-wrap: wrap;
}

.tab-btn {
  flex: 1;
  min-width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 8px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--bg-primary);
}

.tab-btn.active {
  background: var(--bg-primary);
  color: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-icon {
  font-size: 1rem;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.section-header h3 {
  margin: 0;
  padding: 0;
  border: 0;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.type-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.type-card:hover {
  transform: translateY(-2px);
}

.type-card.selected {
  border-color: var(--primary-color);
  background: var(--primary-bg);
}

.type-badge {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
}

.type-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.template-btns {
  display: flex;
  gap: 10px;
}

.template-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.template-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  color: var(--primary-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-row.three-col {
  grid-template-columns: 1fr 1fr 1fr;
}

.form-group {
  margin-bottom: 12px;
}

.form-group.flex-2 {
  grid-column: span 1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.computed-field {
  background: #f0f0f0 !important;
  color: #666;
}

.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn input {
  flex: 1;
}

.input-with-btn button {
  padding: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
}

.quick-fill {
  margin-top: 16px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.quick-fill h4 {
  margin: 0 0 10px 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.quick-btns {
  display: flex;
  gap: 8px;
}

.quick-btns button {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.quick-btns button:hover {
  border-color: var(--primary-color);
}

.btn-add {
  padding: 8px 16px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.item-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-number {
  font-weight: 600;
  color: var(--primary-color);
}

.btn-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
}

.empty-items {
  text-align: center;
  padding: 32px;
  color: var(--text-tertiary);
}

.totals-summary {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.total-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.875rem;
}

.total-item.highlight {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid var(--border-color);
  font-weight: 600;
}

.total-value {
  font-weight: 600;
  color: var(--primary-color);
}

.total-words {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.toggle-item input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
}

.btn-reset {
  width: 100%;
  padding: 12px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
}

.btn-reset:hover {
  background: #fee2e2;
  color: #dc2626;
}

.preview-panel {
  flex: 1;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-header h3 {
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.btn-download {
  padding: 10px 16px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  overflow: auto;
}
</style>
