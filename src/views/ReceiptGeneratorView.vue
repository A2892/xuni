<template>
  <div class="page-view">
    <div class="view-content">
      <div class="edit-panel">
        <!-- 收据类型选择 -->
        <div class="type-selection">
          <h3 class="section-title">选择收据类型</h3>
          <div class="form-group">
            <select v-model="selectedReceiptType" class="form-select">
              <option v-for="(config, type) in receiptTypeConfigs" :key="type" :value="type">
                {{ config.icon }} {{ config.name }} - {{ config.description }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab" :class="['tab', { active: activeTab === tab }]" @click="activeTab = tab">{{ tab }}</button>
        </div>

        <!-- 基本信息 -->
        <div v-show="activeTab === '基本信息'" class="form-section">
          <div class="form-row">
            <div class="form-group">
              <label>商户名称</label>
              <input v-model="store.data.merchantName" type="text" />
            </div>
            <div class="form-group">
              <label>英文名称</label>
              <input v-model="store.data.merchantNameEn" type="text" placeholder="可选" />
            </div>
          </div>
          <div class="form-group">
            <label>分店/门店名称</label>
            <input v-model="store.data.branchName" type="text" placeholder="如：旗舰店" />
          </div>
          <div class="form-group">
            <label>商户地址</label>
            <input v-model="store.data.merchantAddress" type="text" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="store.data.merchantPhone" type="text" />
            </div>
            <div class="form-group">
              <label>收据编号</label>
              <input v-model="store.data.receiptNumber" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>交易日期</label>
              <input v-model="store.data.date" type="date" />
            </div>
            <div class="form-group">
              <label>交易时间</label>
              <input v-model="store.data.time" type="time" />
            </div>
          </div>
          <div class="form-group">
            <label>收银员/服务员</label>
            <input v-model="store.data.cashier" type="text" />
          </div>

          <!-- 调试面板 (仅在金额异常时帮助排查) -->
          <div class="subsection-title" style="color: #e74c3c;">🔧 诊断面板 (如果金额不对，请检查此处)</div>
          <div class="debug-info" style="background: #fff5f5; padding: 12px; border-radius: 8px; border: 1px solid #feb2b2; font-family: monospace; font-size: 11px;">
            <div>配送费: {{ store.data.deliveryFee }}</div>
            <div>打包费: {{ store.data.packagingFee }}</div>
            <div>小费: {{ store.data.tip }}</div>
            <div>固定服务费: {{ store.data.serviceFee }}</div>
            <button @click="store.resetReceipt()" style="margin-top: 10px; background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
              🚨 强制重置所有数据
            </button>
          </div>

          <!-- 餐厅特有字段 -->
          <template v-if="isRestaurantType">
            <div class="form-row">
              <div class="form-group">
                <label>桌号</label>
                <input v-model="store.data.tableNumber" type="text" placeholder="如：A12" />
              </div>
              <div class="form-group">
                <label>用餐人数</label>
                <input v-model.number="store.data.guestCount" type="number" min="1" />
              </div>
            </div>
          </template>

          <!-- 酒店特有字段 -->
          <template v-if="store.data.receiptType === 'hotel'">
            <div class="form-row">
              <div class="form-group">
                <label>房间号</label>
                <input v-model="store.data.roomNumber" type="text" />
              </div>
              <div class="form-group">
                <label>房型</label>
                <input v-model="store.data.roomType" type="text" placeholder="豪华套房" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>入住日期</label>
                <input v-model="store.data.checkInDate" type="date" />
              </div>
              <div class="form-group">
                <label>退房日期</label>
                <input v-model="store.data.checkOutDate" type="date" />
              </div>
            </div>
            <div class="form-group">
              <label>宾客姓名</label>
              <input v-model="store.data.customerName" type="text" />
            </div>
          </template>

          <!-- 咖啡厅特有字段 -->
          <template v-if="store.data.receiptType === 'cafe'">
            <div class="form-row">
              <div class="form-group">
                <label>订单类型</label>
                <select v-model="store.data.orderType">
                  <option value="堂食">堂食</option>
                  <option value="外带">外带</option>
                  <option value="外卖">外卖</option>
                </select>
              </div>
              <div class="form-group">
                <label>取餐号</label>
                <input v-model="store.data.pickupNumber" type="text" placeholder="如：A88" />
              </div>
            </div>
          </template>
        </div>

        <!-- 商品明细 -->
        <div v-show="activeTab === '商品明细'" class="form-section">
          <!-- 上传导入区域 -->
          <ItemsUploader 
            type="receipt" 
            @import="handleItemsImport"
          />
          
          <div class="items-list">
            <div v-for="(item, index) in store.data.items" :key="item.id" class="item-card">
              <div class="item-header-row">
                <input v-model="item.name" type="text" placeholder="商品名称" class="item-name-input" />
                <button @click="store.removeItem(item.id)" class="btn-remove">×</button>
              </div>
              <input v-if="showEnglishName" v-model="item.nameEn" type="text" placeholder="英文名称（可选）" class="item-name-en" />
              <div class="item-row">
                <input v-model.number="item.quantity" type="number" placeholder="数量" class="item-qty" min="1" />
                <input v-model.number="item.unitPrice" type="number" placeholder="单价" class="item-price" step="0.01" />
              </div>
              <div class="item-row">
                <input v-model="item.sku" type="text" placeholder="SKU/条码" class="item-sku" />
                <select v-model="item.category" class="item-category">
                  <option value="">分类</option>
                  <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <input v-model="item.notes" type="text" placeholder="备注（如：大杯/加冰/少糖）" class="item-notes" />
              <div v-if="showDiscount" class="item-row">
                <input v-model.number="item.originalPrice" type="number" placeholder="原价" class="item-original" step="0.01" />
                <input v-model.number="item.discount" type="number" placeholder="折扣金额" class="item-discount-input" step="0.01" />
              </div>
            </div>
          </div>
          <button @click="store.addItem()" class="btn-add">+ 添加商品</button>
        </div>

        <!-- 支付信息 -->
        <div v-show="activeTab === '支付信息'" class="form-section">
          <!-- 货币选择 -->
          <div class="form-group">
            <label>货币类型</label>
            <select v-model="selectedCurrency" @change="store.setCurrency(selectedCurrency)">
              <option v-for="currency in currencyOptions" :key="currency.code" :value="currency.code">
                {{ currency.symbol }} {{ currency.nameCn }} ({{ currency.code }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>支付方式</label>
            <select v-model="store.data.paymentMethod">
              <option v-for="method in paymentMethodOptions" :key="method.value" :value="method.value">
                {{ method.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group" v-if="selectedPaymentMethod?.showCardInput">
            <label>卡类型</label>
            <select v-model="store.data.cardType">
              <option v-for="cardType in selectedPaymentMethod.cardTypes" :key="cardType" :value="cardType">
                {{ cardType }}
              </option>
            </select>
          </div>
          <div class="form-group" v-if="selectedPaymentMethod?.showCardInput">
            <label>卡号后四位</label>
            <input v-model="store.data.cardLast4" type="text" maxlength="4" placeholder="如：1234" />
          </div>
          <div class="form-group" v-if="selectedPaymentMethod?.showCardInput">
            <label>授权码</label>
            <input v-model="store.data.approvalCode" type="text" placeholder="可选" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>折扣金额</label>
              <input v-model.number="store.data.discount" type="number" step="0.01" />
            </div>
            <div class="form-group">
              <label>折扣码</label>
              <input v-model="store.data.discountCode" type="text" placeholder="如：VIP20" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>税率 (%)</label>
              <input v-model.number="store.data.taxRate" type="number" step="0.1" />
            </div>
            <div class="form-group" v-if="isRestaurantType">
              <label>服务费 (%)</label>
              <input v-model.number="store.data.serviceChargeRate" type="number" step="0.1" />
            </div>
          </div>

          <div class="form-row" v-if="isRestaurantType">
            <div class="form-group">
              <label>配送费</label>
              <input v-model.number="store.data.deliveryFee" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label>打包费</label>
              <input v-model.number="store.data.packagingFee" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label>小费</label>
              <input v-model.number="store.data.tip" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <!-- 会员信息 -->
          <div class="subsection-title">会员信息</div>
          <div class="form-row">
            <div class="form-group">
              <label>会员卡号</label>
              <input v-model="store.data.membershipId" type="text" />
            </div>
            <div class="form-group">
              <label>会员等级</label>
              <input v-model="store.data.membershipLevel" type="text" placeholder="如：VIP Gold" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>本次积分</label>
              <input v-model.number="store.data.pointsEarned" type="number" />
            </div>
            <div class="form-group">
              <label>累计积分</label>
              <input v-model.number="store.data.memberPoints" type="number" />
            </div>
          </div>

          <!-- 签名设置 -->
          <div class="subsection-title">宾客签名</div>
          <div class="form-group">
            <label>签名方式</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="store.data.signatureType" value="text" />
                文字输入
              </label>
              <label class="radio-label">
                <input type="radio" v-model="store.data.signatureType" value="image" />
                图片上传
              </label>
            </div>
          </div>
          
          <div v-if="store.data.signatureType === 'text'" class="signature-text-options">
            <div class="form-group">
              <label>签名内容</label>
              <input v-model="store.data.signatureText" type="text" placeholder="输入姓名" />
            </div>
            <div class="form-group">
              <label>签名字体</label>
              <select v-model="store.data.signatureFont">
                <option value="Dancing Script">Dancing Script</option>
                <option value="Great Vibes">Great Vibes</option>
                <option value="Sacramento">Sacramento</option>
                <option value="Homemade Apple">Homemade Apple</option>
                <option value="Caveat">Caveat</option>
                <option value="Ma Shan Zheng">马善政毛笔</option>
                <option value="Zhi Mang Xing">志莽行书</option>
              </select>
            </div>
          </div>
          
          <div v-else class="signature-image-upload">
            <div class="form-group">
              <label>上传签名图片</label>
              <input type="file" accept="image/*" @change="handleSignatureUpload" />
              <div v-if="store.data.signatureImage" class="signature-preview">
                <img :src="store.data.signatureImage" alt="Signature Preview" />
                <button @click="store.data.signatureImage = ''" class="btn-remove-img">删除</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 设计设置 -->
        <div v-show="activeTab === '设计设置'" class="form-section">
          <div class="subsection-title">🎨 颜色设置</div>
          <div class="form-row">
            <div class="form-group">
              <label>主色调</label>
              <div class="color-input-group">
                <input type="color" v-model="store.designSettings.primaryColor" />
                <input type="text" v-model="store.designSettings.primaryColor" />
              </div>
            </div>
            <div class="form-group">
              <label>副色调</label>
              <div class="color-input-group">
                <input type="color" v-model="store.designSettings.secondaryColor" />
                <input type="text" v-model="store.designSettings.secondaryColor" />
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>强调色</label>
              <div class="color-input-group">
                <input type="color" v-model="store.designSettings.accentColor" />
                <input type="text" v-model="store.designSettings.accentColor" />
              </div>
            </div>
            <div class="form-group">
              <label>文字颜色</label>
              <div class="color-input-group">
                <input type="color" v-model="store.designSettings.textColor" />
                <input type="text" v-model="store.designSettings.textColor" />
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>背景颜色</label>
              <div class="color-input-group">
                <input type="color" v-model="store.designSettings.backgroundColor" />
                <input type="text" v-model="store.designSettings.backgroundColor" />
              </div>
            </div>
            <div class="form-group">
              <label>边框颜色</label>
              <div class="color-input-group">
                <input type="color" v-model="store.designSettings.borderColor" />
                <input type="text" v-model="store.designSettings.borderColor" />
              </div>
            </div>
          </div>
          
          <div class="color-presets">
            <span class="preset-label">预设配色:</span>
            <button v-for="preset in colorPresets" :key="preset.name" class="preset-btn" @click="applyColorPreset(preset)" :style="{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }">
              {{ preset.name }}
            </button>
          </div>

          <div class="subsection-title">📐 样式设置</div>
          <div class="form-row">
            <div class="form-group">
              <label>头部样式</label>
              <select v-model="store.designSettings.headerStyle">
                <option value="simple">简约</option>
                <option value="elegant">优雅</option>
                <option value="modern">现代</option>
                <option value="classic">经典</option>
              </select>
            </div>
            <div class="form-group">
              <label>纸张风格</label>
              <select v-model="store.designSettings.paperStyle">
                <option value="white">纯白</option>
                <option value="cream">米色</option>
                <option value="thermal">热敏纸</option>
                <option value="premium">高档纸</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>字体</label>
              <select v-model="store.designSettings.fontFamily">
                <option value="system-ui">系统默认</option>
                <option value="'PingFang SC', sans-serif">苹方</option>
                <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                <option value="'Noto Sans SC', sans-serif">思源黑体</option>
                <option value="'Courier New', monospace">等宽字体</option>
                <option value="Georgia, serif">衬线字体</option>
              </select>
            </div>
            <div class="form-group">
              <label>字号 (px)</label>
              <input type="number" v-model.number="store.designSettings.fontSize" min="10" max="18" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>圆角 (px)</label>
              <input type="number" v-model.number="store.designSettings.roundedCorners" min="0" max="20" />
            </div>
            <div class="form-group">
              <label>边框宽度 (px)</label>
              <input type="number" v-model.number="store.designSettings.borderWidth" min="0" max="5" />
            </div>
          </div>
          <div class="form-group">
            <label>边框样式</label>
            <select v-model="store.designSettings.borderStyle">
              <option value="solid">实线</option>
              <option value="dashed">虚线</option>
              <option value="dotted">点线</option>
              <option value="double">双线</option>
            </select>
          </div>
          <div class="checkbox-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.designSettings.showLogo" />
              显示Logo
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.designSettings.showBorder" />
              显示边框
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.designSettings.showShadow" />
              显示阴影
            </label>
          </div>
        </div>

        <!-- 更多设置 -->
        <div v-show="activeTab === '更多设置'" class="form-section">
          <div class="form-group">
            <label>页脚提示语</label>
            <textarea v-model="store.data.footerMessage" rows="2" :placeholder="currentTypeConfig?.defaultFooter"></textarea>
          </div>
          <div class="form-group">
            <label>退换货政策</label>
            <textarea v-model="store.data.returnPolicy" rows="2" placeholder="可选"></textarea>
          </div>
          <div class="form-group">
            <label>商户网站</label>
            <input v-model="store.data.merchantWebsite" type="text" placeholder="www.example.com" />
          </div>
          <div class="form-group">
            <label>商户邮箱</label>
            <input v-model="store.data.merchantEmail" type="email" />
          </div>
          <div class="form-group" v-if="store.data.receiptType === 'cafe'">
            <label>WiFi 名称</label>
            <input v-model="store.data.wifiName" type="text" />
          </div>
          <div class="form-group" v-if="store.data.receiptType === 'cafe'">
            <label>WiFi 密码</label>
            <input v-model="store.data.wifiPassword" type="text" />
          </div>
          <div class="form-group">
            <label>营业时间</label>
            <input v-model="store.data.businessHours" type="text" placeholder="09:00-22:00" />
          </div>

          <!-- 条形码设置 -->
          <h4 style="margin-top: 20px;">📊 条形码设置</h4>
          <div class="checkbox-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.barcodeSettings.showBarcode" />
              显示条形码
            </label>
          </div>
          <template v-if="store.barcodeSettings.showBarcode">
            <label class="checkbox-option" style="margin-bottom: 12px;">
              <input type="checkbox" v-model="store.barcodeSettings.useCustomBarcode" /> 使用自定义图片
            </label>
            <template v-if="store.barcodeSettings.useCustomBarcode">
              <div class="form-group">
                <label>上传条形码图片</label>
                <div class="logo-actions">
                  <PhotoSelector v-model="store.barcodeSettings.customBarcodeImage" />
                  <span class="or-divider">或</span>
                  <input type="file" accept="image/*" @change="handleBarcodeUpload" />
                </div>
              </div>
              <div v-if="store.barcodeSettings.customBarcodeImage" class="image-preview">
                <img :src="store.barcodeSettings.customBarcodeImage" />
                <button @click="store.barcodeSettings.customBarcodeImage = ''" class="btn-remove">删除</button>
              </div>
            </template>
            <template v-else>
              <div class="form-group">
                <label>条形码内容 (留空使用收据编号)</label>
                <input type="text" v-model="store.barcodeSettings.barcodeContent" :placeholder="store.data.receiptNumber" />
              </div>
            </template>
          </template>
        </div>

        <!-- 数据管理 -->
        <div v-show="activeTab === '数据管理'" class="form-section">
          <SaveLoadPanel 
            document-type="receipt"
            :get-data="() => ({ data: store.data, designSettings: store.designSettings })"
            :set-data="(saved: any) => { Object.assign(store.data, saved.data); Object.assign(store.designSettings, saved.designSettings); }"
          />
        </div>
      </div>

      <div class="preview-panel">
        <div class="preview-header">
          <h2>收据预览</h2>
          <div class="preview-controls">
            <PreviewSizeSelector v-model="previewSize" />
            <button @click="showDownloadPanel = true" class="btn-download">📥 下载</button>
          </div>
        </div>
        <div class="preview-info">
          <span class="type-badge">
            <span class="badge-icon">{{ currentTypeConfig?.icon }}</span>
            {{ currentTypeConfig?.name }}
          </span>
          <span class="total-badge">合计: {{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
        <div id="receipt-preview" class="preview-content" :class="`preview-${previewSize}`">
          <MultiTypeReceiptPreview :preview-size="previewSize" />
        </div>
      </div>
    </div>
    
    <!-- 下载面板 -->
    <DownloadPanel
      :visible="showDownloadPanel"
      :preview-selector="receiptDownloadSelector"
      :default-file-name="`Receipt_${store.data.receiptNumber}`"
      @close="showDownloadPanel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import PreviewSizeSelector from '@/components/PreviewSizeSelector.vue'
import MultiTypeReceiptPreview from '@/components/MultiTypeReceiptPreview.vue'
import ItemsUploader from '@/components/ItemsUploader.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import { useReceiptStore, receiptTypeConfigs, currencyOptions, paymentMethodOptions, type ReceiptType } from '@/stores/receipt'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'

const store = useReceiptStore()
const activeTab = ref('基本信息')
const tabs = ['基本信息', '商品明细', '支付信息', '设计设置', '更多设置', '数据管理']
const previewSize = ref<PreviewSize>('original')
const selectedCurrency = ref(store.data.currency)
const showDownloadPanel = ref(false)

// 收据类型选择
const selectedReceiptType = computed({
  get: () => store.data.receiptType || 'general',
  set: (val) => store.setType(val)
})

// 根据收据类型返回正确的下载选择器
const receiptDownloadSelector = computed(() => {
  // 直接获取预览容器内的第一个子元素，这样更通用且能捕获完整的背景和边框
  return '#receipt-preview > div'
})

// 当前选中的支付方式配置
const selectedPaymentMethod = computed(() => 
  paymentMethodOptions.find(m => m.value === store.data.paymentMethod)
)

// 颜色预设
const colorPresets = [
  { name: '经典黑', primary: '#2c3e50', secondary: '#34495e', accent: '#3498db', text: '#333333', bg: '#ffffff' },
  { name: '商务蓝', primary: '#1a5276', secondary: '#2980b9', accent: '#3498db', text: '#2c3e50', bg: '#ffffff' },
  { name: '优雅紫', primary: '#5b2c6f', secondary: '#8e44ad', accent: '#9b59b6', text: '#4a4a4a', bg: '#faf9fb' },
  { name: '清新绿', primary: '#1e8449', secondary: '#27ae60', accent: '#2ecc71', text: '#2d3436', bg: '#f9fff9' },
  { name: '暖意橙', primary: '#d35400', secondary: '#e67e22', accent: '#f39c12', text: '#2c2c2c', bg: '#fffaf5' },
  { name: '玫瑰金', primary: '#b76e79', secondary: '#c9a0a0', accent: '#e8c4c4', text: '#5a4a4a', bg: '#fef9f9' },
  { name: '深海蓝', primary: '#0c2461', secondary: '#1e3799', accent: '#4a69bd', text: '#2c3e50', bg: '#f5f7fa' },
  { name: '墨绿', primary: '#1b4332', secondary: '#2d6a4f', accent: '#40916c', text: '#1b1b1b', bg: '#f8faf8' }
]

// 应用颜色预设
const applyColorPreset = (preset: typeof colorPresets[0]) => {
  store.designSettings.primaryColor = preset.primary
  store.designSettings.secondaryColor = preset.secondary
  store.designSettings.accentColor = preset.accent
  store.designSettings.textColor = preset.text
  store.designSettings.backgroundColor = preset.bg
}

// 当前类型配置
const currentTypeConfig = computed(() => receiptTypeConfigs[store.data.receiptType])

// 是否是餐厅类型
const isRestaurantType = computed(() => 
  ['luxury-restaurant', 'casual-restaurant', 'cafe'].includes(store.data.receiptType)
)

// 是否显示英文名称
const showEnglishName = computed(() => 
  ['luxury-mall', 'luxury-restaurant', 'hotel', 'cafe'].includes(store.data.receiptType)
)

// 是否显示折扣
const showDiscount = computed(() => 
  ['luxury-mall', 'supermarket'].includes(store.data.receiptType)
)

// 分类选项
const categoryOptions = computed(() => {
  const type = store.data.receiptType
  if (type === 'luxury-mall') return ['服饰', '美妆', '箱包', '珠宝', '家居', '其他']
  if (type === 'luxury-restaurant' || type === 'casual-restaurant') return ['主菜', '前菜', '甜点', '饮品', '酒水', '其他']
  if (type === 'supermarket') return ['食品', '饮料', '日用品', '生鲜', '零食', '其他']
  if (type === 'cafe') return ['咖啡', '茶饮', '特调', '甜点', '轻食', '其他']
  if (type === 'hotel') return ['房费', '餐饮', '客房服务', '迷你吧', '洗衣', '其他']
  return ['其他']
})

// 监听金额相关数据的变化，自动更新合计
watch(
  [
    () => store.data.items,
    () => store.data.discount, 
    () => store.data.taxRate, 
    () => store.data.serviceChargeRate, 
    () => store.data.serviceFee,
    () => store.data.deliveryFee,
    () => store.data.packagingFee,
    () => store.data.tip
  ], 
  ([,, , rate]) => {
    // 如果设置了百分比服务费，清空固定值服务费，防止重复计算或干扰
    if (Number(rate) > 0) {
      store.data.serviceFee = 0
    }
    store.updateTotals()
  },
  { deep: true }
)

// 处理商品导入
const handleItemsImport = (data: any[]) => {
  // 清空现有商品
  store.data.items = []
  // 导入新商品
  data.forEach(row => {
    store.addItem()
    const item = store.data.items[store.data.items.length - 1]
    if (item) {
      item.name = row.name || ''
      item.nameEn = row.nameEn || ''
      item.quantity = parseFloat(row.quantity || 1) || 1
      item.unitPrice = parseFloat(row.unitPrice || 0) || 0
      item.sku = row.sku || ''
      item.category = row.category || ''
      item.notes = row.notes || ''
    }
  })
}

const handleSignatureUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.data.signatureImage = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const handleBarcodeUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.barcodeSettings.customBarcodeImage = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.page-view { padding: 20px; }
.view-content { display: flex; gap: 24px; }
.edit-panel { flex: 6; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.preview-panel { flex: 4; min-width: 0; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); display: flex; flex-direction: column; align-items: center; }

/* 类型选择 */
.type-selection { background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.section-title { font-size: 14px; font-weight: 600; margin: 0 0 12px; color: #333; }
.type-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.type-card { display: flex; flex-direction: column; align-items: center; padding: 10px 6px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: center; min-height: 80px; }
.type-card:hover { border-color: #999; background: #fafafa; }
.type-card.active { border-color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); }
.type-icon { font-size: 20px; margin-bottom: 4px; }
.type-name { font-size: 11px; font-weight: 600; color: #333; }
.type-desc { font-size: 9px; color: #888; margin-top: 2px; line-height: 1.2; }

/* 预览头部 */
.preview-header { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 12px; }
.preview-header h2 { margin: 0; font-size: 18px; }
.preview-controls { display: flex; gap: 12px; align-items: center; }
.preview-info { display: flex; gap: 12px; margin-bottom: 16px; }
.type-badge { display: flex; align-items: center; gap: 6px; background: #f0f0f0; padding: 6px 12px; border-radius: 20px; font-size: 13px; }
.badge-icon { font-size: 16px; }
.total-badge { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }

/* 预览内容 */
.preview-content { display: flex; justify-content: center; padding: 20px; background: #f5f5f5; border-radius: 8px; min-height: 400px; width: 100%; overflow: auto; }
.preview-content.preview-mobile { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.preview-content.preview-desktop { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }

/* Tabs */
.tabs { display: flex; gap: 8px; }
.tab { flex: 1; padding: 10px 12px; border: none; background: #f0f0f0; border-radius: 8px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
.tab.active { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; }

/* 表单 */
.form-section { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 12px; color: #666; font-weight: 500; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #2c3e50; outline: none; }
.form-group textarea { resize: vertical; }
.subsection-title { font-size: 12px; font-weight: 600; color: #888; margin: 16px 0 12px; padding-top: 12px; border-top: 1px dashed #e0e0e0; }

/* 商品列表 */
.items-list { display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; margin-bottom: 12px; padding-right: 4px; }
.item-card { background: #f8f9fa; padding: 12px; border-radius: 10px; border: 1px solid #e9ecef; }
.item-header-row { display: flex; gap: 8px; margin-bottom: 8px; }
.item-name-input { flex: 1; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-weight: 500; }
.item-name-en { width: 100%; padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 11px; margin-bottom: 8px; color: #666; }
.item-notes { width: 100%; padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 11px; color: #666; margin-top: 8px; }
.item-card .item-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
.item-card .item-row:last-child { margin-bottom: 0; }
.item-card input, .item-card select { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; }
.btn-remove { width: 26px; height: 26px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; line-height: 1; flex-shrink: 0; }
.btn-remove:hover { background: #ee3344; }
.btn-add { width: 100%; padding: 12px; background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: opacity 0.2s; }

.btn-download {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-download:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.2);
}

.btn-download svg {
  width: 16px;
  height: 16px;
}
.btn-add:hover { opacity: 0.9; }

/* 支付方式网格 */
.payment-methods-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.payment-method-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: #fafafa; }
.payment-method-card:hover { border-color: #999; background: white; }
.payment-method-card.active { border-color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); }
.method-icon { font-size: 20px; }
.method-label { font-size: 10px; color: #555; text-align: center; line-height: 1.2; }

/* 颜色输入组 */
.color-input-group { display: flex; gap: 8px; align-items: center; }
.color-input-group input[type="color"] { width: 40px; height: 32px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; padding: 2px; }
.color-input-group input[type="text"] { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; font-family: monospace; }

/* 颜色预设 */
.color-presets { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; align-items: center; }
.preset-label { font-size: 12px; color: #666; margin-right: 4px; }
.preset-btn { padding: 6px 12px; border: none; border-radius: 16px; color: white; font-size: 11px; cursor: pointer; transition: all 0.2s; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
.preset-btn:hover { transform: scale(1.05); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }

/* 复选框行 */
.checkbox-row { display: flex; gap: 20px; margin-top: 12px; flex-wrap: wrap; }
.checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; cursor: pointer; }
.checkbox-label input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }

/* 签名设置 */
.radio-group { display: flex; gap: 16px; margin-bottom: 12px; }
.radio-label { display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; }
.signature-preview { margin-top: 10px; position: relative; display: inline-block; }
.signature-preview img { max-width: 200px; max-height: 100px; border: 1px solid #ddd; border-radius: 4px; }
.btn-remove-img { position: absolute; top: -8px; right: -8px; background: #ff4757; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
</style>
