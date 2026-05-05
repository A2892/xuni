<template>
  <div class="delivery-order-view">
    <div class="page-header">
      <h1>📦 外卖/快递订单生成器</h1>
      <p class="description">生成美团、饿了么、滴滴、顺丰等平台订单截图</p>
    </div>

    <div class="main-content">
      <!-- 左侧编辑面板 -->
      <div class="edit-panel">
        <!-- 平台选择 -->
        <div class="platform-selector">
          <button 
            v-for="platform in deliveryPlatforms" 
            :key="platform.id"
            :class="['platform-btn', { active: store.data.platform === platform.id }]"
            :style="{ '--platform-color': platform.color }"
            @click="store.setPlatformDefaults(platform.id as any)"
          >
            <span class="platform-icon">{{ platform.icon }}</span>
            <span class="platform-name">{{ platform.label }}</span>
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
          <!-- 基本信息 -->
          <div v-show="activeTab === 'basic'" class="form-section">
            <h3>📋 基本信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>订单编号</label>
                <div class="input-with-btn">
                  <input type="text" v-model="store.data.orderId" />
                  <button @click="store.data.orderId = store.generateOrderId()">🎲</button>
                </div>
              </div>
              <div class="form-group">
                <label>订单状态</label>
                <select v-model="store.data.orderStatus">
                  <option v-for="status in orderStatuses" :key="status.id" :value="status.id">
                    {{ status.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>下单时间</label>
                <input type="text" v-model="store.data.orderTime" />
              </div>
              <div class="form-group">
                <label>支付时间</label>
                <input type="text" v-model="store.data.payTime" />
              </div>
            </div>

            <div class="form-group">
              <label>支付方式</label>
              <div class="payment-options">
                <button 
                  v-for="method in paymentMethods"
                  :key="method.id"
                  :class="['payment-btn', { active: store.data.paymentMethod === method.id }]"
                  @click="store.data.paymentMethod = method.id as any"
                >
                  {{ method.icon }} {{ method.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- 商家/商品 (外卖/电商) -->
          <div v-show="activeTab === 'merchant'" class="form-section">
            <h3>🏪 商家信息</h3>
            
            <div class="form-group">
              <label>商家名称</label>
              <input type="text" v-model="store.data.merchantName" />
            </div>
            <div class="form-group">
              <label>商家地址</label>
              <input type="text" v-model="store.data.merchantAddress" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>商家电话</label>
                <input type="text" v-model="store.data.merchantPhone" />
              </div>
              <div class="form-group">
                <label>商家评分</label>
                <input type="number" v-model.number="store.data.merchantRating" step="0.1" min="0" max="5" />
              </div>
            </div>
            <div class="form-group">
              <label>商家Logo</label>
              <input type="file" accept="image/*" @change="handleMerchantLogo" />
            </div>
          </div>

          <!-- 商品列表 -->
          <div v-show="activeTab === 'items'" class="form-section">
            <div class="section-header">
              <h3>🛒 商品列表</h3>
              <button class="btn-add" @click="store.addItem()">+ 添加商品</button>
            </div>
            
            <div v-for="(item, index) in store.data.items" :key="item.id" class="item-card">
              <div class="item-header">
                <span class="item-index">#{{ index + 1 }}</span>
                <button class="btn-remove" @click="store.removeItem(item.id)">×</button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>商品名称</label>
                  <input type="text" v-model="item.name" />
                </div>
                <div class="form-group">
                  <label>规格</label>
                  <input type="text" v-model="item.specs" placeholder="大份/冰/少糖" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>单价</label>
                  <input type="number" v-model.number="item.price" step="0.01" @change="store.recalculateTotal()" />
                </div>
                <div class="form-group">
                  <label>数量</label>
                  <input type="number" v-model.number="item.quantity" min="1" @change="store.recalculateTotal()" />
                </div>
              </div>
            </div>

            <div v-if="store.data.items.length === 0" class="empty-state">
              <p>暂无商品，点击上方按钮添加</p>
            </div>
          </div>

          <!-- 费用明细 -->
          <div v-show="activeTab === 'price'" class="form-section">
            <h3>💰 费用明细</h3>
            
            <div class="price-summary">
              <div class="summary-row">
                <span>商品小计</span>
                <span class="auto-calc">¥{{ store.data.subtotal.toFixed(2) }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>配送费</label>
                <input type="number" v-model.number="store.data.deliveryFee" step="0.01" @change="store.recalculateTotal()" />
              </div>
              <div class="form-group">
                <label>打包费</label>
                <input type="number" v-model.number="store.data.packingFee" step="0.01" @change="store.recalculateTotal()" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>优惠券抵扣</label>
                <input type="number" v-model.number="store.data.couponDiscount" step="0.01" @change="store.recalculateTotal()" />
              </div>
              <div class="form-group">
                <label>红包抵扣</label>
                <input type="number" v-model.number="store.data.redpacketDiscount" step="0.01" @change="store.recalculateTotal()" />
              </div>
            </div>

            <div class="total-display">
              <span>实付金额</span>
              <span class="total-amount">¥{{ store.data.totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 收货信息 -->
          <div v-show="activeTab === 'receiver'" class="form-section">
            <h3>📍 收货信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>收货人</label>
                <input type="text" v-model="store.data.receiverName" />
              </div>
              <div class="form-group">
                <label>联系电话</label>
                <input type="text" v-model="store.data.receiverPhone" />
              </div>
            </div>
            <div class="form-group">
              <label>收货地址</label>
              <textarea v-model="store.data.receiverAddress" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>预计送达</label>
                <input type="text" v-model="store.data.deliveryTime" />
              </div>
              <div class="form-group">
                <label>配送距离</label>
                <input type="text" v-model="store.data.deliveryDistance" />
              </div>
            </div>
          </div>

          <!-- 骑手/司机信息 -->
          <div v-show="activeTab === 'rider'" class="form-section">
            <h3>🚴 {{ store.data.orderType === 'ride' ? '司机信息' : '骑手信息' }}</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>姓名</label>
                <input type="text" v-model="store.data.riderName" />
              </div>
              <div class="form-group">
                <label>联系电话</label>
                <input type="text" v-model="store.data.riderPhone" />
              </div>
            </div>
            <div class="form-group">
              <label>头像</label>
              <input type="file" accept="image/*" @change="handleRiderAvatar" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ store.data.orderType === 'ride' ? '车型' : '交通工具' }}</label>
                <input type="text" v-model="store.data.vehicleInfo" />
              </div>
              <div class="form-group">
                <label>车牌号</label>
                <input type="text" v-model="store.data.plateNumber" />
              </div>
            </div>
          </div>

          <!-- 快递信息 -->
          <div v-show="activeTab === 'express'" class="form-section">
            <h3>📦 快递信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>运单号</label>
                <div class="input-with-btn">
                  <input type="text" v-model="store.data.trackingNo" />
                  <button @click="store.data.trackingNo = store.generateTrackingNo()">🎲</button>
                </div>
              </div>
              <div class="form-group">
                <label>快递公司</label>
                <select v-model="store.data.expressCompany">
                  <option v-for="company in expressCompanies" :key="company.id" :value="company.label">
                    {{ company.label }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>包裹重量</label>
                <input type="text" v-model="store.data.weight" />
              </div>
              <div class="form-group">
                <label>当前状态</label>
                <input type="text" v-model="store.data.expressStatus" />
              </div>
            </div>

            <div class="tracking-editor">
              <div class="tracking-header">
                <h4>物流轨迹</h4>
                <button class="btn-add" @click="store.addTrackingHistory()">+ 添加记录</button>
              </div>
              <div v-for="(track, index) in store.data.trackingHistory" :key="index" class="track-row">
                <input type="text" v-model="track.time" placeholder="时间" style="width: 130px;" />
                <input type="text" v-model="track.status" placeholder="状态" style="flex: 1;" />
                <input type="text" v-model="track.location" placeholder="位置" style="width: 100px;" />
                <button class="btn-remove-small" @click="store.removeTrackingHistory(index)">×</button>
              </div>
            </div>
          </div>

          <!-- 行程信息 (打车) -->
          <div v-show="activeTab === 'trip'" class="form-section">
            <h3>🚗 行程信息</h3>
            
            <div class="form-group">
              <label>上车地点</label>
              <input type="text" v-model="store.data.pickupLocation" />
            </div>
            <div class="form-group">
              <label>下车地点</label>
              <input type="text" v-model="store.data.dropoffLocation" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>行程距离</label>
                <input type="text" v-model="store.data.tripDistance" />
              </div>
              <div class="form-group">
                <label>行程时长</label>
                <input type="text" v-model="store.data.tripDuration" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>车型</label>
                <select v-model="store.data.carType">
                  <option>快车</option>
                  <option>舒适型</option>
                  <option>优享型</option>
                  <option>专车</option>
                  <option>豪华型</option>
                </select>
              </div>
              <div class="form-group">
                <label>行程路线</label>
                <input type="text" v-model="store.data.tripRoute" placeholder="西二环 → 机场高速" />
              </div>
            </div>
          </div>

          <!-- 设置 -->
          <div v-show="activeTab === 'settings'" class="form-section">
            <h3>⚙️ 设备设置</h3>
            
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
                <input type="checkbox" v-model="store.data.darkMode" />
                <span>深色模式</span>
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
            <DeliveryOrderPreview />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDeliveryOrderStore, deliveryPlatforms, orderStatuses, paymentMethods, expressCompanies } from '@/stores/deliveryOrder'
import DeliveryOrderPreview from '@/components/DeliveryOrderPreview.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useDeliveryOrderStore()
const activeTab = ref('basic')
const previewRef = ref<HTMLElement | null>(null)
const exportQuality = ref('2')

const currentTabs = computed(() => {
  const baseTabs = [
    { id: 'basic', label: '📋 基本' },
    { id: 'settings', label: '⚙️ 设置' }
  ]

  if (store.data.orderType === 'food') {
    return [
      { id: 'basic', label: '📋 基本' },
      { id: 'merchant', label: '🏪 商家' },
      { id: 'items', label: '🛒 商品' },
      { id: 'price', label: '💰 费用' },
      { id: 'receiver', label: '📍 收货' },
      { id: 'rider', label: '🚴 骑手' },
      { id: 'settings', label: '⚙️ 设置' }
    ]
  } else if (store.data.orderType === 'express') {
    return [
      { id: 'basic', label: '📋 基本' },
      { id: 'express', label: '📦 快递' },
      { id: 'receiver', label: '📍 收发' },
      { id: 'settings', label: '⚙️ 设置' }
    ]
  } else if (store.data.orderType === 'ride') {
    return [
      { id: 'basic', label: '📋 基本' },
      { id: 'trip', label: '🚗 行程' },
      { id: 'rider', label: '👨 司机' },
      { id: 'price', label: '💰 费用' },
      { id: 'settings', label: '⚙️ 设置' }
    ]
  } else if (store.data.orderType === 'shopping') {
    return [
      { id: 'basic', label: '📋 基本' },
      { id: 'merchant', label: '🏪 店铺' },
      { id: 'items', label: '🛒 商品' },
      { id: 'price', label: '💰 费用' },
      { id: 'receiver', label: '📍 收货' },
      { id: 'settings', label: '⚙️ 设置' }
    ]
  }

  return baseTabs
})

const handleMerchantLogo = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.data.merchantLogo = ev.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const handleRiderAvatar = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.data.riderAvatar = ev.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const downloadImage = async () => {
  if (!previewRef.value) return
  const scale = parseInt(exportQuality.value)
  const canvas = await html2canvas(previewRef.value, {
    scale,
    useCORS: true,
    backgroundColor: null
  })
  const link = document.createElement('a')
  link.download = `order-${store.data.platform}-${store.data.orderId}.png`
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
  pdf.save(`order-${store.data.platform}-${store.data.orderId}.pdf`)
}
</script>

<style scoped>
.delivery-order-view {
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
  width: 500px;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.platform-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
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
  font-size: 20px;
}

.platform-name {
  font-size: 10px;
  font-weight: 600;
  color: #475569;
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
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
  white-space: nowrap;
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

/* 支付方式选项 */
.payment-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.payment-btn {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.payment-btn.active {
  border-color: #4B6EF5;
  background: #EEF2FF;
  color: #4B6EF5;
}

/* 商品卡片 */
.item-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-index {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
}

/* 价格汇总 */
.price-summary {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.auto-calc {
  color: #64748b;
}

.total-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #4B6EF5, #6C5CE7);
  border-radius: 12px;
  color: white;
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
}

/* 物流轨迹编辑器 */
.tracking-editor {
  margin-top: 16px;
}

.tracking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tracking-header h4 {
  margin: 0;
  font-size: 13px;
}

.track-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.track-row input {
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
}

.btn-remove-small {
  width: 28px;
  height: 28px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
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

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 32px;
  color: #94a3b8;
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
