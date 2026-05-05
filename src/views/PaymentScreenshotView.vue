<template>
  <div class="payment-view">
    <div class="page-header">
      <h1>💳 支付截图生成器</h1>
      <p class="description">生成微信、支付宝、Apple Pay、银行卡等支付凭证截图</p>
    </div>

    <div class="main-content">
      <!-- 左侧编辑面板 -->
      <div class="edit-panel">
        <!-- 平台选择 -->
        <div class="platform-selector">
          <button 
            v-for="platform in paymentPlatforms" 
            :key="platform.id"
            :class="['platform-btn', { active: store.data.platform === platform.id }]"
            :style="{ '--platform-color': platform.color }"
            @click="store.setPlatformDefaults(platform.id)"
          >
            <span class="platform-icon">{{ platform.icon }}</span>
            <span class="platform-name">{{ platform.label }}</span>
          </button>
        </div>

        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 支付信息 -->
          <div v-show="activeTab === 'payment'" class="form-section">
            <h3>💰 支付信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>金额</label>
                <input type="number" v-model.number="store.data.amount" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>货币</label>
                <CurrencySelector v-model="store.data.currency" />
              </div>
            </div>

            <div class="form-group">
              <label>支付类型</label>
              <div class="type-options">
                <button 
                  v-for="type in paymentTypes" 
                  :key="type.id"
                  :class="['type-btn', { active: store.data.paymentType === type.id }]"
                  @click="store.data.paymentType = type.id"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>支付状态</label>
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
                  :class="['status-btn failed', { active: store.data.status === 'failed' }]"
                  @click="store.data.status = 'failed'"
                >✕ 失败</button>
              </div>
            </div>

            <div class="form-group">
              <label>备注/说明</label>
              <input type="text" v-model="store.data.remarks" placeholder="转账说明或商品描述" />
            </div>

            <div class="form-group" v-if="store.data.paymentType === 'redpacket'">
              <label>红包祝福语</label>
              <input type="text" v-model="store.data.redpacketMessage" placeholder="恭喜发财" />
            </div>
          </div>

          <!-- 收付款方 -->
          <div v-show="activeTab === 'parties'" class="form-section">
            <h3>👥 收付款方信息</h3>
            
            <div class="party-card">
              <h4>收款方</h4>
              <div class="form-group">
                <label>姓名/名称</label>
                <input type="text" v-model="store.data.receiverName" placeholder="收款人姓名" />
              </div>
              <div class="form-group">
                <label>账号</label>
                <input type="text" v-model="store.data.receiverAccount" placeholder="收款账号" />
              </div>
              <div class="form-group">
                <label>头像</label>
                <div class="avatar-upload" @click="uploadAvatar('receiver')">
                  <input type="file" ref="receiverAvatarInput" accept="image/*" @change="onAvatarChange($event, 'receiver')" hidden />
                  <img v-if="store.data.receiverAvatar" :src="store.data.receiverAvatar" />
                  <span v-else>+</span>
                </div>
              </div>
            </div>

            <div class="party-card">
              <h4>付款方</h4>
              <div class="form-group">
                <label>姓名/名称</label>
                <input type="text" v-model="store.data.senderName" placeholder="付款人姓名" />
              </div>
              <div class="form-group">
                <label>账号/银行</label>
                <input type="text" v-model="store.data.senderBank" placeholder="付款账号或银行" />
              </div>
              <div class="form-group">
                <label>头像</label>
                <div class="avatar-upload" @click="uploadAvatar('sender')">
                  <input type="file" ref="senderAvatarInput" accept="image/*" @change="onAvatarChange($event, 'sender')" hidden />
                  <img v-if="store.data.senderAvatar" :src="store.data.senderAvatar" />
                  <span v-else>+</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 交易信息 -->
          <div v-show="activeTab === 'transaction'" class="form-section">
            <h3>📋 交易信息</h3>
            
            <div class="form-group">
              <label>交易单号</label>
              <div class="input-with-btn">
                <input type="text" v-model="store.data.transactionId" placeholder="交易单号" />
                <button class="gen-btn" @click="store.generateTransactionId()">生成</button>
              </div>
            </div>

            <div class="form-group">
              <label>订单号</label>
              <div class="input-with-btn">
                <input type="text" v-model="store.data.orderNumber" placeholder="订单号" />
                <button class="gen-btn" @click="store.generateOrderNumber()">生成</button>
              </div>
            </div>

            <div class="form-group">
              <label>支付时间</label>
              <div class="input-with-btn">
                <input type="text" v-model="store.data.paymentTime" placeholder="支付时间" />
                <button class="gen-btn" @click="store.setCurrentTime()">当前</button>
              </div>
            </div>

            <!-- 银行卡特有 -->
            <template v-if="['visa', 'mastercard', 'unionpay'].includes(store.data.platform)">
              <div class="form-group">
                <label>卡号 (后四位)</label>
                <input type="text" v-model="store.data.cardNumber" placeholder="**** **** **** 1234" />
              </div>
              <div class="form-group">
                <label>授权码</label>
                <div class="input-with-btn">
                  <input type="text" v-model="store.data.authCode" placeholder="授权码" />
                  <button class="gen-btn" @click="store.generateAuthCode()">生成</button>
                </div>
              </div>
              <div class="form-group">
                <label>商户名称</label>
                <input type="text" v-model="store.data.merchantName" placeholder="商户名称" />
              </div>
              <div class="form-group">
                <label>商户ID</label>
                <input type="text" v-model="store.data.merchantId" placeholder="商户ID" />
              </div>
            </template>
          </div>

          <!-- 显示设置 -->
          <div v-show="activeTab === 'display'" class="form-section">
            <h3>📱 显示设置</h3>
            
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
                >📱 Android</button>
              </div>
            </div>

            <div class="form-group">
              <label>状态栏时间</label>
              <input type="text" v-model="store.data.currentTime" placeholder="09:41" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>电量 {{ store.data.batteryLevel }}%</label>
                <input type="range" v-model.number="store.data.batteryLevel" min="0" max="100" />
              </div>
              <div class="form-group">
                <label>信号 {{ store.data.signalStrength }}</label>
                <input type="range" v-model.number="store.data.signalStrength" min="0" max="4" />
              </div>
            </div>

            <div class="form-group">
              <label>显示选项</label>
              <div class="checkbox-group">
                <label class="checkbox">
                  <input type="checkbox" v-model="store.data.showTransactionId" />
                  <span>显示交易单号</span>
                </label>
                <label class="checkbox">
                  <input type="checkbox" v-model="store.data.showRemarks" />
                  <span>显示备注</span>
                </label>
                <label class="checkbox">
                  <input type="checkbox" v-model="store.data.wifiEnabled" />
                  <span>显示WiFi图标</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>📄 预览效果</h3>
          <div class="preview-actions">
            <div class="quality-select">
              <label>质量:</label>
              <select v-model="downloadQuality">
                <option value="1">标准 (1x)</option>
                <option value="2">高清 (2x)</option>
                <option value="3">超清 (3x)</option>
              </select>
            </div>
            <button class="action-btn" @click="downloadAsImage">
              <span>🖼️</span> 图片
            </button>
            <button class="action-btn" @click="downloadAsPDF">
              <span>📥</span> PDF
            </button>
            <button class="action-btn primary" @click="saveToDatabase">
              <span>☁️</span> 保存
            </button>
          </div>
        </div>
        <div class="preview-container">
          <div ref="previewRef">
            <PaymentScreenshotPreview />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePaymentScreenshotStore, paymentPlatforms, paymentTypes, currencies } from '@/stores/paymentScreenshot'
import PaymentScreenshotPreview from '@/components/PaymentScreenshotPreview.vue'
import CurrencySelector from '@/components/CurrencySelector.vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const store = usePaymentScreenshotStore()

const activeTab = ref('payment')
const downloadQuality = ref('2')
const previewRef = ref<HTMLElement>()
const receiverAvatarInput = ref<HTMLInputElement>()
const senderAvatarInput = ref<HTMLInputElement>()

const tabs = [
  { id: 'payment', label: '💰 支付' },
  { id: 'parties', label: '👥 收付方' },
  { id: 'transaction', label: '📋 交易' },
  { id: 'display', label: '📱 显示' },
]

const uploadAvatar = (type: 'receiver' | 'sender') => {
  if (type === 'receiver') {
    receiverAvatarInput.value?.click()
  } else {
    senderAvatarInput.value?.click()
  }
}

const onAvatarChange = (e: Event, type: 'receiver' | 'sender') => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (type === 'receiver') {
        store.data.receiverAvatar = ev.target?.result as string
      } else {
        store.data.senderAvatar = ev.target?.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

const downloadAsImage = async () => {
  if (!previewRef.value) return
  
  const canvas = await html2canvas(previewRef.value, {
    scale: parseInt(downloadQuality.value),
    useCORS: true,
    backgroundColor: null
  })
  
  const link = document.createElement('a')
  link.download = `支付截图_${store.data.platform}_${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const downloadAsPDF = async () => {
  if (!previewRef.value) return
  
  const canvas = await html2canvas(previewRef.value, {
    scale: parseInt(downloadQuality.value),
    useCORS: true,
    backgroundColor: '#fff'
  })
  
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.9
  const imgX = (pdfWidth - imgWidth * ratio) / 2
  const imgY = 20
  
  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
  pdf.save(`支付截图_${store.data.platform}_${Date.now()}.pdf`)
}

const saveToDatabase = () => {
  // TODO: 实现保存到数据库
  alert('保存功能开发中...')
}
</script>

<style scoped>
.payment-view {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  margin: 0 0 8px;
}

.page-header .description {
  color: #666;
  margin: 0;
}

.main-content {
  display: flex;
  gap: 24px;
}

.edit-panel {
  width: 450px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* 平台选择器 */
.platform-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.platform-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.platform-btn:hover {
  border-color: var(--platform-color);
}

.platform-btn.active {
  border-color: var(--platform-color);
  background: color-mix(in srgb, var(--platform-color) 10%, white);
}

.platform-icon {
  font-size: 24px;
}

.platform-name {
  font-size: 11px;
  color: #666;
}

.platform-btn.active .platform-name {
  color: var(--platform-color);
  font-weight: 600;
}

/* 标签页 */
.tabs {
  display: flex;
  padding: 12px 16px;
  gap: 8px;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e9ecef;
}

.tab-btn.active {
  background: #1677FF;
  color: #fff;
}

.tab-content {
  padding: 20px;
  max-height: calc(100vh - 350px);
  overflow-y: auto;
}

.form-section h3 {
  font-size: 15px;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #1677FF;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1677FF;
}

.form-group input[type="range"] {
  padding: 0;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

/* 类型选项 */
.type-options,
.status-options,
.device-options {
  display: flex;
  gap: 8px;
}

.type-btn,
.device-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.type-btn:hover,
.device-btn:hover {
  border-color: #1677FF;
}

.type-btn.active,
.device-btn.active {
  border-color: #1677FF;
  background: #e6f4ff;
  color: #1677FF;
}

.status-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.status-btn.success { border-color: #52c41a; color: #52c41a; }
.status-btn.pending { border-color: #faad14; color: #faad14; }
.status-btn.failed { border-color: #ff4d4f; color: #ff4d4f; }

.status-btn.active {
  color: #fff !important;
}

.status-btn.success.active { background: #52c41a; }
.status-btn.pending.active { background: #faad14; }
.status-btn.failed.active { background: #ff4d4f; }

/* 收付款方卡片 */
.party-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.party-card h4 {
  font-size: 14px;
  margin: 0 0 12px;
  color: #1677FF;
}

.avatar-upload {
  width: 60px;
  height: 60px;
  border: 2px dashed #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  font-size: 24px;
  color: #ccc;
  transition: all 0.2s;
}

.avatar-upload:hover {
  border-color: #1677FF;
  color: #1677FF;
}

.avatar-upload img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 输入框带按钮 */
.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn input {
  flex: 1;
}

.gen-btn {
  padding: 10px 16px;
  background: #1677FF;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
}

.gen-btn:hover {
  background: #0958d9;
}

/* 复选框 */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox input {
  width: 18px;
  height: 18px;
}

/* 预览面板 */
.preview-panel {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.preview-header h3 {
  font-size: 16px;
  margin: 0;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quality-select {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.quality-select select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #1677FF;
  color: #1677FF;
}

.action-btn.primary {
  background: #1677FF;
  border-color: #1677FF;
  color: #fff;
}

.action-btn.primary:hover {
  background: #0958d9;
}

.preview-container {
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 600px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
}
</style>
