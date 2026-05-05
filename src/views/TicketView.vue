<template>
  <div class="ticket-view">
    <div class="page-header">
      <h1>🎫 火车票/机票截图生成器</h1>
      <p class="description">生成12306、携程、去哪儿等平台的订单截图</p>
    </div>

    <div class="main-content">
      <!-- 左侧编辑面板 -->
      <div class="edit-panel">
        <!-- 平台选择 -->
        <div class="platform-selector">
          <button 
            v-for="platform in ticketPlatforms" 
            :key="platform.id"
            :class="['platform-btn', { active: store.data.platform === platform.id }]"
            :style="{ '--platform-color': platform.color }"
            @click="store.setPlatformDefaults(platform.id as any)"
          >
            <span class="platform-icon">{{ platform.icon }}</span>
            <span class="platform-name">{{ platform.name }}</span>
          </button>
        </div>

        <!-- 票型选择 -->
        <div class="type-selector">
          <button 
            v-for="type in ticketTypes"
            :key="type.id"
            :class="['type-btn', { active: store.data.ticketType === type.id }]"
            @click="store.setTicketTypeDefaults(type.id as any)"
          >
            {{ type.icon }} {{ type.label }}
          </button>
        </div>

        <!-- 标签页 -->
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
          <!-- 行程信息 -->
          <div v-show="activeTab === 'trip'" class="form-section">
            <h3>🚄 行程信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>车次/航班号</label>
                <input type="text" v-model="store.data.trainNo" />
              </div>
              <div class="form-group" v-if="store.data.ticketType === 'train'">
                <label>车型</label>
                <select v-model="store.data.trainType">
                  <option v-for="type in trainTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
                </select>
              </div>
              <div class="form-group" v-else>
                <label>航空公司/类型</label>
                <input type="text" v-model="store.data.trainType" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>出发站/机场</label>
                <input type="text" v-model="store.data.departureStation" />
              </div>
              <div class="form-group">
                <label>到达站/机场</label>
                <input type="text" v-model="store.data.arrivalStation" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>出发城市</label>
                <input type="text" v-model="store.data.departureCity" />
              </div>
              <div class="form-group">
                <label>到达城市</label>
                <input type="text" v-model="store.data.arrivalCity" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>出发日期</label>
                <input type="date" v-model="store.data.departureDate" />
              </div>
              <div class="form-group">
                <label>到达日期</label>
                <input type="date" v-model="store.data.arrivalDate" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>出发时间</label>
                <input type="text" v-model="store.data.departureTime" placeholder="08:00" />
              </div>
              <div class="form-group">
                <label>到达时间</label>
                <input type="text" v-model="store.data.arrivalTime" placeholder="12:35" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>行程时长</label>
                <input type="text" v-model="store.data.duration" />
              </div>
              <div class="form-group">
                <label>里程数</label>
                <input type="text" v-model="store.data.distance" />
              </div>
            </div>
          </div>

          <!-- 座位信息 -->
          <div v-show="activeTab === 'seat'" class="form-section">
            <h3>💺 座位信息</h3>
            
            <div class="form-group">
              <label>座位类型</label>
              <select v-model="store.data.seatType">
                <option v-for="seat in seatTypes" :key="seat.id" :value="seat.name">{{ seat.name }}</option>
              </select>
            </div>

            <div class="form-row" v-if="store.data.ticketType === 'train'">
              <div class="form-group">
                <label>车厢号</label>
                <input type="text" v-model="store.data.carriage" placeholder="08" />
              </div>
              <div class="form-group">
                <label>座位号</label>
                <input type="text" v-model="store.data.seatNo" placeholder="05A" />
              </div>
            </div>
          </div>

          <!-- 乘客信息 -->
          <div v-show="activeTab === 'passenger'" class="form-section">
            <h3>👤 乘客信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>乘客姓名</label>
                <input type="text" v-model="store.data.passengerName" placeholder="张*明" />
              </div>
              <div class="form-group">
                <label>乘客类型</label>
                <select v-model="store.data.passengerType">
                  <option value="成人">成人</option>
                  <option value="儿童">儿童</option>
                  <option value="学生">学生</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>证件类型</label>
                <select v-model="store.data.idType">
                  <option value="身份证">身份证</option>
                  <option value="护照">护照</option>
                  <option value="港澳通行证">港澳通行证</option>
                </select>
              </div>
              <div class="form-group">
                <label>证件号码</label>
                <input type="text" v-model="store.data.idNumber" placeholder="110***********1234" />
              </div>
            </div>

            <div class="form-group">
              <label>手机号码</label>
              <input type="text" v-model="store.data.phone" placeholder="138****8888" />
            </div>
          </div>

          <!-- 订单信息 -->
          <div v-show="activeTab === 'order'" class="form-section">
            <h3>📋 订单信息</h3>
            
            <div class="form-group">
              <label>订单编号</label>
              <div class="input-with-btn">
                <input type="text" v-model="store.data.orderNo" />
                <button @click="store.refreshOrderNo()">🎲</button>
              </div>
            </div>

            <div class="form-group">
              <label>取票号</label>
              <div class="input-with-btn">
                <input type="text" v-model="store.data.ticketNo" />
                <button @click="store.refreshTicketNo()">🎲</button>
              </div>
            </div>

            <div class="form-group">
              <label>订单状态</label>
              <div class="status-options">
                <button 
                  v-for="status in orderStatuses"
                  :key="status.id"
                  :class="['status-btn', { active: store.data.orderStatus === status.id }]"
                  :style="{ '--status-color': status.color }"
                  @click="store.data.orderStatus = status.id as any"
                >{{ status.label }}</button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>支付方式</label>
                <select v-model="store.data.paymentMethod">
                  <option value="微信支付">微信支付</option>
                  <option value="支付宝">支付宝</option>
                  <option value="银行卡">银行卡</option>
                  <option value="Apple Pay">Apple Pay</option>
                </select>
              </div>
              <div class="form-group">
                <label>支付时间</label>
                <input type="text" v-model="store.data.paymentTime" />
              </div>
            </div>
          </div>

          <!-- 价格信息 -->
          <div v-show="activeTab === 'price'" class="form-section">
            <h3>💰 价格信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>票价</label>
                <input type="number" v-model.number="store.data.ticketPrice" step="0.01" @change="store.recalculateTotal()" />
              </div>
              <div class="form-group">
                <label>服务费</label>
                <input type="number" v-model.number="store.data.serviceFee" step="0.01" @change="store.recalculateTotal()" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>保险费</label>
                <input type="number" v-model.number="store.data.insuranceFee" step="0.01" @change="store.recalculateTotal()" />
              </div>
              <div class="form-group">
                <label>合计金额</label>
                <input type="number" v-model.number="store.data.totalPrice" step="0.01" readonly style="background: #f1f5f9;" />
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
                <input type="checkbox" v-model="store.data.showQRCode" />
                <span>显示二维码</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.showBarcode" />
                <span>显示条形码</span>
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
            <TicketPreview />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTicketStore, ticketPlatforms, ticketTypes, trainTypes, seatTypes, orderStatuses } from '@/stores/ticket'
import TicketPreview from '@/components/TicketPreview.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useTicketStore()
const activeTab = ref('trip')
const previewRef = ref<HTMLElement | null>(null)
const exportQuality = ref('2')

const currentTabs = computed(() => {
  return [
    { id: 'trip', label: '🚄 行程' },
    { id: 'seat', label: '💺 座位' },
    { id: 'passenger', label: '👤 乘客' },
    { id: 'order', label: '📋 订单' },
    { id: 'price', label: '💰 价格' },
    { id: 'settings', label: '⚙️ 设置' }
  ]
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
  link.download = `ticket-${store.data.platform}-${store.data.trainNo}-${Date.now()}.png`
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
  pdf.save(`ticket-${store.data.platform}-${store.data.trainNo}-${Date.now()}.pdf`)
}
</script>

<style scoped>
.ticket-view {
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

/* 平台选择器 */
.platform-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.platform-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.platform-btn:hover {
  border-color: var(--platform-color);
  background: color-mix(in srgb, var(--platform-color) 10%, white);
}

.platform-btn.active {
  border-color: var(--platform-color);
  background: color-mix(in srgb, var(--platform-color) 15%, white);
}

.platform-icon {
  font-size: 24px;
}

.platform-name {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}

/* 票型选择器 */
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
  font-size: 13px;
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
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
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
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.status-btn.active {
  border-color: var(--status-color);
  background: color-mix(in srgb, var(--status-color) 15%, white);
  color: var(--status-color);
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
