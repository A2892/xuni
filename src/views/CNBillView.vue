<template>
  <div class="cn-bill-view">
    <!-- 左侧编辑面板 -->
    <div class="edit-panel">
      <div class="panel-header">
        <h2>📄 国内账单生成器</h2>
        <p class="subtitle">水电燃气/物业/话费账单</p>
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

      <!-- 数据管理 - 放在顶部 -->
      <div class="data-management-section">
        <SaveLoadPanel 
          document-type="cn_bill" 
          :get-data="() => store.data" 
          :set-data="(data: any) => Object.assign(store.data, data)" 
        />
      </div>

      <!-- 账单类型 -->
      <div v-show="activeTab === 'type'" class="tab-content">
        <div class="form-section">
          <h3>选择账单类型</h3>
          <div class="form-group">
            <select v-model="store.data.billType" @change="selectBillType(store.data.billType)" class="form-select">
              <option v-for="(type, key) in billTypes" :key="key" :value="key">
                {{ type.icon }} {{ type.name }} (单位: {{ type.unit }})
              </option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>账单信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>账单号码</label>
              <div class="input-with-btn">
                <input v-model="store.data.billNumber" type="text" />
                <button @click="store.generateBillNumber()">🎲</button>
              </div>
            </div>
            <div class="form-group">
              <label>账单月份</label>
              <input v-model="store.data.billMonth" type="month" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>出账日期</label>
              <input v-model="store.data.issueDate" type="date" />
            </div>
            <div class="form-group">
              <label>缴费期限</label>
              <input v-model="store.data.dueDate" type="date" />
            </div>
          </div>
          <div class="form-group">
            <label>缴费状态</label>
            <div class="status-btns">
              <button 
                v-for="status in paymentStatuses" 
                :key="status.value"
                :class="['status-btn', status.value, { active: store.data.paymentStatus === status.value }]"
                @click="store.data.paymentStatus = status.value"
              >
                {{ status.label }}
              </button>
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

      <!-- 用户信息 -->
      <div v-show="activeTab === 'user'" class="tab-content">
        <div class="form-section">
          <h3>👤 用户信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>户名</label>
              <input v-model="store.data.userName" type="text" placeholder="用户姓名" />
            </div>
            <div class="form-group">
              <label>户号</label>
              <input v-model="store.data.userNumber" type="text" placeholder="用户编号" />
            </div>
          </div>
          <div class="form-group">
            <label>用户地址</label>
            <input v-model="store.data.userAddress" type="text" placeholder="详细地址" />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input v-model="store.data.userPhone" type="text" placeholder="手机号码" />
          </div>
        </div>

        <div class="form-section">
          <h3>🏢 供应商信息</h3>
          <div class="form-group">
            <label>供应商名称</label>
            <input v-model="store.data.providerName" type="text" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="store.data.providerPhone" type="text" />
            </div>
            <div class="form-group">
              <label>服务热线</label>
              <input v-model="store.data.providerHotline" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>供应商地址</label>
            <input v-model="store.data.providerAddress" type="text" />
          </div>
        </div>
      </div>

      <!-- 费用明细 -->
      <div v-show="activeTab === 'items'" class="tab-content">
        <div class="form-section">
          <div class="section-header">
            <h3>📊 费用明细</h3>
            <div class="header-actions">
              <button class="btn-template" @click="downloadItemsTemplate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                下载Excel模板
              </button>
              <label class="btn-upload">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                上传Excel
                <input type="file" ref="itemsFileInput" @change="handleItemsFileUpload" accept=".xlsx,.xls,.csv" class="hidden-input" />
              </label>
              <button class="btn-add" @click="store.addItem()">+ 添加项目</button>
            </div>
          </div>

          <div v-for="(item, index) in store.data.items" :key="item.id" class="item-card">
            <div class="item-header">
              <span class="item-number">项目 {{ index + 1 }}</span>
              <button class="btn-remove" @click="store.removeItem(item.id)">×</button>
            </div>
            <div class="form-row">
              <div class="form-group flex-2">
                <label>项目名称</label>
                <input v-model="item.name" type="text" placeholder="如: 峰时电量" />
              </div>
              <div class="form-group">
                <label>计费周期</label>
                <input v-model="item.period" type="month" />
              </div>
            </div>
            <div class="form-row three-col">
              <div class="form-group">
                <label>上期读数</label>
                <input v-model.number="item.previousReading" type="number" @change="store.calculateItemAmount(item)" />
              </div>
              <div class="form-group">
                <label>本期读数</label>
                <input v-model.number="item.currentReading" type="number" @change="store.calculateItemAmount(item)" />
              </div>
              <div class="form-group">
                <label>用量</label>
                <input v-model.number="item.usage" type="number" @change="store.calculateItemAmount(item)" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>单价 (元)</label>
                <input v-model.number="item.unitPrice" type="number" step="0.0001" @change="store.calculateItemAmount(item)" />
              </div>
              <div class="form-group">
                <label>单位</label>
                <input v-model="item.unit" type="text" placeholder="kWh / 天 / 固定" @change="store.calculateItemAmount(item)" />
              </div>
              <div class="form-group">
                <label>金额</label>
                <input :value="item.amount.toFixed(2)" type="text" disabled class="computed-field" />
              </div>
            </div>
          </div>

          <div v-if="store.data.items.length === 0" class="empty-items">
            <p>暂无项目，点击上方按钮添加</p>
          </div>

          <div class="totals-section">
            <h4>金额汇总</h4>
            <div class="form-row">
              <div class="form-group">
                <label>本期小计</label>
                <input :value="store.calculatedSubtotal.toFixed(2)" type="text" disabled class="computed-field" />
              </div>
              <div class="form-group">
                <label>上期余额</label>
                <input v-model.number="store.data.previousBalance" type="number" step="0.01" @change="store.updateTotals()" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>滞纳金</label>
                <input v-model.number="store.data.lateFee" type="number" step="0.01" @change="store.updateTotals()" />
              </div>
              <div class="form-group">
                <label>调整金额</label>
                <input v-model.number="store.data.adjustment" type="number" step="0.01" @change="store.updateTotals()" />
              </div>
            </div>
            <div class="total-display">
              <span>应缴金额:</span>
              <span class="total-value">¥{{ store.calculatedTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 设计 -->
      <div v-show="activeTab === 'design'" class="tab-content">
        <div class="form-section">
          <h3>🎨 水印设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.watermarkEnabled" />
              <span>启用水印</span>
            </label>
          </div>
          <div v-if="store.designSettings.watermarkEnabled" class="design-group">
            <div class="form-group">
              <label>水印类型</label>
              <div class="radio-group">
                <label><input type="radio" v-model="store.designSettings.watermarkType" value="center" /> 居中水印</label>
                <label><input type="radio" v-model="store.designSettings.watermarkType" value="fullscreen" /> 全屏水印</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>水印文字</label>
                <input v-model="store.designSettings.watermarkText" type="text" placeholder="PAID" />
              </div>
              <div class="form-group">
                <label>透明度 (%)</label>
                <input v-model.number="store.designSettings.watermarkOpacity" type="range" min="1" max="30" />
                <span class="range-value">{{ store.designSettings.watermarkOpacity }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🖼️ 边框设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.borderEnabled" />
              <span>启用边框</span>
            </label>
          </div>
          <div v-if="store.designSettings.borderEnabled" class="design-group">
            <div class="form-row">
              <div class="form-group">
                <label>边框颜色</label>
                <input v-model="store.designSettings.borderColor" type="color" />
              </div>
              <div class="form-group">
                <label>边框宽度 (px)</label>
                <input v-model.number="store.designSettings.borderWidth" type="range" min="1" max="5" />
                <span class="range-value">{{ store.designSettings.borderWidth }}px</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📱 二维码设置</h3>
          <div class="form-group">
            <label>二维码来源</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="store.designSettings.qrCodeSource" value="generate" />
                自动生成
              </label>
              <label class="radio-item">
                <input type="radio" v-model="store.designSettings.qrCodeSource" value="upload" />
                上传图片
              </label>
            </div>
          </div>
          <div v-if="store.designSettings.qrCodeSource === 'generate'" class="design-group">
            <div class="form-group">
              <label>二维码内容 (留空自动生成)</label>
              <input v-model="store.designSettings.qrCodeContent" type="text" placeholder="缴费链接或账单号" />
            </div>
          </div>
          <div v-else class="design-group">
            <div class="form-group">
              <label>上传二维码</label>
              <div class="upload-with-selector">
                <MediaSelector 
                  v-model="store.designSettings.qrCodeImage"
                  type="qrcode"
                  button-text="从媒体库选择"
                  modal-title="选择二维码"
                  icon="📱"
                />
                <div class="upload-divider">或</div>
                <input type="file" accept="image/*" @change="handleQRCodeUpload" />
              </div>
              <img v-if="store.designSettings.qrCodeImage" :src="store.designSettings.qrCodeImage" class="preview-image" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📊 条形码设置</h3>
          <div class="form-group">
            <label>条形码来源</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="store.designSettings.barcodeSource" value="generate" />
                自动生成
              </label>
              <label class="radio-item">
                <input type="radio" v-model="store.designSettings.barcodeSource" value="upload" />
                上传图片
              </label>
            </div>
          </div>
          <div v-if="store.designSettings.barcodeSource === 'generate'" class="design-group">
            <div class="form-group">
              <label>条形码内容 (留空使用账单号)</label>
              <input v-model="store.designSettings.barcodeContent" type="text" placeholder="账单编号" />
            </div>
          </div>
          <div v-else class="design-group">
            <div class="form-group">
              <label>上传条形码</label>
              <div class="upload-with-selector">
                <PhotoSelector v-model="store.designSettings.barcodeImage" />
                <div class="upload-divider">或</div>
                <MediaSelector 
                  v-model="store.designSettings.barcodeImage"
                  type="barcode"
                  button-text="从媒体库选择"
                  modal-title="选择条形码"
                  icon="📊"
                />
                <div class="upload-divider">或</div>
                <input type="file" accept="image/*" @change="handleBarcodeUpload" />
              </div>
              <img v-if="store.designSettings.barcodeImage" :src="store.designSettings.barcodeImage" class="preview-image barcode" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🔖 印章设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.stampEnabled" />
              <span>启用印章</span>
            </label>
          </div>
          <div v-if="store.designSettings.stampEnabled" class="design-group">
            <div class="form-group">
              <label>印章来源</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input type="radio" v-model="store.designSettings.stampSource" value="generate" />
                  自动生成
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="store.designSettings.stampSource" value="upload" />
                  上传图片
                </label>
              </div>
            </div>
            <div v-if="store.designSettings.stampSource === 'generate'" class="design-group">
              <div class="form-row">
                <div class="form-group">
                  <label>印章文字</label>
                  <input v-model="store.designSettings.stampText" type="text" placeholder="已缴费" />
                </div>
                <div class="form-group">
                  <label>印章颜色</label>
                  <input v-model="store.designSettings.stampColor" type="color" />
                </div>
              </div>
            </div>
            <div v-else class="design-group">
              <div class="form-group">
                <label>上传印章</label>
                <div class="upload-with-selector">
                  <MediaSelector 
                    v-model="store.designSettings.stampImage"
                    type="stamp"
                    button-text="从媒体库选择"
                    modal-title="选择印章"
                    icon="🔴"
                  />
                  <div class="upload-divider">或</div>
                  <input type="file" accept="image/*" @change="handleStampUpload" />
                </div>
                <img v-if="store.designSettings.stampImage" :src="store.designSettings.stampImage" class="preview-image stamp" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 支付 -->
      <div v-show="activeTab === 'payment'" class="tab-content">
        <div class="form-section">
          <h3>💳 支付方式</h3>
          <div class="payment-methods">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              :class="['payment-method', { selected: selectedPaymentMethod === method.id }]"
              @click="selectedPaymentMethod = method.id"
            >
              <span class="method-icon">{{ method.icon }}</span>
              <span class="method-name">{{ method.name }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>💰 缴费金额</h3>
          <div class="payment-amount">
            <span class="amount-label">应缴金额</span>
            <span class="amount-value">¥{{ store.calculatedTotal.toFixed(2) }}</span>
          </div>
        </div>

        <div class="form-section">
          <button class="btn-pay" @click="showPaymentModal = true">
            立即缴费
          </button>
        </div>
      </div>

      <!-- 设置 -->
      <div v-show="activeTab === 'settings'" class="tab-content">
        <div class="form-section">
          <h3>⚙️ 显示设置</h3>
          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showBarcode" />
              <span>显示条形码</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showQRCode" />
              <span>显示二维码</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showUsageChart" />
              <span>显示用量图表</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3>📝 备注</h3>
          <textarea v-model="store.data.remarks" rows="3" placeholder="账单备注信息"></textarea>
        </div>

        <div class="form-section">
          <button class="btn-reset" @click="store.reset()">重置为默认值</button>
        </div>
      </div>
    </div>

    <!-- 右侧预览区 -->
    <div class="preview-panel">
      <div class="preview-header">
        <h3>账单预览</h3>
        <div class="preview-actions">
          <button class="btn-download-panel" @click="showDownloadPanel = true">⬇ 下载</button>
        </div>
      </div>
      <div class="preview-container">
        <div ref="previewRef" class="preview-wrapper">
          <CNBillPreview />
        </div>
      </div>
    </div>
    
    <!-- 下载面板 -->
    <DownloadPanel
      :visible="showDownloadPanel"
      :preview-selector="'.cn-bill-preview'"
      :default-file-name="'cn-bill-' + store.data.billType"
      :default-format="downloadFormat"
      :default-quality="downloadQuality"
      @close="showDownloadPanel = false"
    />

    <!-- 支付弹窗 -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
      <div class="payment-modal" ref="paymentModalRef">
        <div class="modal-header">
          <h3>确认缴费</h3>
          <button class="close-btn" @click="showPaymentModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="payment-info">
            <div class="info-row">
              <span>账单类型</span>
              <span>{{ billTypes[store.data.billType]?.name }}</span>
            </div>
            <div class="info-row">
              <span>账单月份</span>
              <span>{{ store.data.billMonth }}</span>
            </div>
            <div class="info-row">
              <span>户名</span>
              <span>{{ store.data.userName }}</span>
            </div>
            <div class="info-row total">
              <span>缴费金额</span>
              <span class="amount">¥{{ store.calculatedTotal.toFixed(2) }}</span>
            </div>
          </div>
          <div class="payment-qr">
            <canvas ref="paymentQRRef" class="qr-canvas"></canvas>
            <p>请使用{{ paymentMethods.find(m => m.id === selectedPaymentMethod)?.name }}扫码支付</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-download" @click="downloadPaymentModal">📥 下载</button>
          <button class="btn-cancel" @click="showPaymentModal = false">取消</button>
          <button class="btn-confirm" @click="processPayment">确认已支付</button>
        </div>
      </div>
    </div>

    <!-- 支付成功弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="showSuccessModal = false">
      <div class="success-modal" ref="successModalRef">
        <div class="success-icon">✅</div>
        <h3>缴费成功！</h3>
        <p>您的{{ billTypes[store.data.billType]?.name }}账单已缴费成功</p>
        <div class="success-details">
          <div class="detail-row">
            <span>交易单号</span>
            <span>{{ transactionId }}</span>
          </div>
          <div class="detail-row">
            <span>缴费金额</span>
            <span class="amount">¥{{ store.calculatedTotal.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span>支付方式</span>
            <input type="text" v-model="paymentMethodDisplay" class="time-input" />
          </div>
          <div class="detail-row" v-if="['unionpay', 'visa', 'mastercard', 'amex'].includes(selectedPaymentMethod)">
            <span>付款卡号</span>
            <input type="text" v-model="cardNumber" class="time-input" placeholder="**** **** **** 1234" />
          </div>
          <div class="detail-row" v-if="['unionpay', 'visa', 'mastercard', 'amex'].includes(selectedPaymentMethod)">
            <span>发卡银行</span>
            <input type="text" v-model="cardBank" class="time-input" placeholder="工商银行" />
          </div>
          <div class="detail-row">
            <span>缴费时间</span>
            <input type="text" v-model="paymentTime" class="time-input" />
          </div>
        </div>
        <div class="download-options">
          <div class="option-group">
            <label>格式:</label>
            <select v-model="downloadFormat">
              <option value="png">PNG 图片</option>
              <option value="jpg">JPG 图片</option>
              <option value="pdf">PDF 文档</option>
            </select>
          </div>
          <div class="option-group">
            <label>质量:</label>
            <select v-model="downloadQuality">
              <option :value="1">标准</option>
              <option :value="2">高清</option>
              <option :value="3">超清</option>
            </select>
          </div>
        </div>
        <div class="success-actions">
          <button class="btn-download" @click="downloadSuccessModal">📥 下载凭证</button>
          <button class="btn-done" @click="showSuccessModal = false">完成</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useCNBillStore, billTypes } from '@/stores/cnBill'
import CNBillPreview from '@/components/CNBillPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'
import MediaSelector from '@/components/MediaSelector.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'

const store = useCNBillStore()
const activeTab = ref('type')
const previewRef = ref<HTMLElement | null>(null)
const paymentQRRef = ref<HTMLCanvasElement | null>(null)
const paymentModalRef = ref<HTMLElement | null>(null)
const successModalRef = ref<HTMLElement | null>(null)
const showDownloadPanel = ref(false)
const itemsFileInput = ref<HTMLInputElement | null>(null)

// 支付相关
const showPaymentModal = ref(false)
const showSuccessModal = ref(false)
const selectedPaymentMethod = ref('wechat')
const transactionId = ref('')
const paymentTime = ref('')
const paymentMethodDisplay = ref('')
const cardNumber = ref('')
const cardBank = ref('')

// 下载设置
const downloadFormat = ref('png')
const downloadQuality = ref(2)

const paymentMethods = [
  { id: 'wechat', name: '微信支付', icon: '💚' },
  { id: 'alipay', name: '支付宝', icon: '💙' },
  { id: 'unionpay', name: '银联卡', icon: '💳' },
  { id: 'visa', name: 'Visa', icon: '💳' },
  { id: 'mastercard', name: 'Mastercard', icon: '💳' },
  { id: 'amex', name: 'American Express', icon: '💳' },
  { id: 'cash', name: '现金', icon: '💵' }
]

// 生成支付二维码
const generatePaymentQR = async () => {
  if (paymentQRRef.value && showPaymentModal.value) {
    const content = `pay://${selectedPaymentMethod.value}?amount=${store.calculatedTotal}&bill=${store.data.billNumber}`
    await QRCode.toCanvas(paymentQRRef.value, content, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
  }
}

watch(showPaymentModal, (val) => {
  if (val) {
    setTimeout(generatePaymentQR, 100)
  }
})

watch(selectedPaymentMethod, () => {
  if (showPaymentModal.value) {
    generatePaymentQR()
  }
})

// 处理支付
const processPayment = () => {
  transactionId.value = 'TXN' + Date.now().toString().slice(-12)
  paymentTime.value = new Date().toLocaleString('zh-CN')
  paymentMethodDisplay.value = paymentMethods.find(m => m.id === selectedPaymentMethod.value)?.name || ''
  // 设置默认卡号
  if (['unionpay', 'visa', 'mastercard', 'amex'].includes(selectedPaymentMethod.value)) {
    cardNumber.value = '**** **** **** ' + Math.floor(1000 + Math.random() * 9000)
    cardBank.value = selectedPaymentMethod.value === 'unionpay' ? '中国工商银行' : 
                     selectedPaymentMethod.value === 'visa' ? 'Visa' : 
                     selectedPaymentMethod.value === 'mastercard' ? 'Mastercard' : 'American Express'
  }
  store.data.paymentStatus = 'paid'
  showPaymentModal.value = false
  showSuccessModal.value = true
}

// 下载支付模态框
const downloadPaymentModal = async () => {
  if (!paymentModalRef.value) return
  const canvas = await html2canvas(paymentModalRef.value, {
    backgroundColor: '#ffffff',
    scale: 2
  })
  const link = document.createElement('a')
  link.download = `缴费信息_${store.data.billMonth}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// 下载成功模态框
const downloadSuccessModal = async () => {
  if (!successModalRef.value) return
  const canvas = await html2canvas(successModalRef.value, {
    backgroundColor: '#ffffff',
    scale: downloadQuality.value
  })
  
  const fileName = `缴费成功_${transactionId.value}`
  
  if (downloadFormat.value === 'pdf') {
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'l' : 'p',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${fileName}.pdf`)
  } else {
    const link = document.createElement('a')
    link.download = `${fileName}.${downloadFormat.value}`
    link.href = canvas.toDataURL(`image/${downloadFormat.value === 'jpg' ? 'jpeg' : 'png'}`)
    link.click()
  }
}

// 上传处理函数
const handleQRCodeUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.designSettings.qrCodeImage = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleBarcodeUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.designSettings.barcodeImage = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleStampUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.designSettings.stampImage = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 费用明细Excel模板下载
const downloadItemsTemplate = () => {
  const billType = store.data.billType
  const unit = billTypes[billType]?.unit || '度'
  
  const templateData = [
    { 项目名称: '峰时用量', 计费周期: '2024-01', 上期读数: 1000, 本期读数: 1200, 单价: 0.5483 },
    { 项目名称: '谷时用量', 计费周期: '2024-01', 上期读数: 500, 本期读数: 600, 单价: 0.3083 },
    { 项目名称: '平时用量', 计费周期: '2024-01', 上期读数: 800, 本期读数: 950, 单价: 0.4283 }
  ]
  
  const ws = XLSX.utils.json_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '费用明细')
  
  // 设置列宽
  ws['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 }
  ]
  
  const typeNames: Record<string, string> = {
    electricity: '电费',
    water: '水费',
    gas: '燃气',
    property: '物业费',
    phone: '话费',
    internet: '宽带'
  }
  
  XLSX.writeFile(wb, `${typeNames[billType] || '账单'}明细模板.xlsx`)
}

// 费用明细Excel上传解析
const handleItemsFileUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    
    if (jsonData.length === 0) {
      alert('文件中没有有效数据')
      return
    }
    
    // 解析并导入数据
    const newItems = jsonData.map((row: any, index: number) => {
      const name = row['项目名称'] || row['name'] || row['Name'] || `项目${index + 1}`
      const period = row['计费周期'] || row['period'] || row['Period'] || new Date().toISOString().slice(0, 7)
      const previousReading = parseFloat(row['上期读数'] || row['previousReading'] || row['Previous Reading'] || 0)
      const currentReading = parseFloat(row['本期读数'] || row['currentReading'] || row['Current Reading'] || 0)
      const unitPrice = parseFloat(row['单价'] || row['unitPrice'] || row['Unit Price'] || 0)
      const usage = currentReading - previousReading
      const amount = usage * unitPrice
      
      return {
        id: Date.now().toString() + index,
        name,
        period,
        previousReading,
        currentReading,
        usage,
        unitPrice,
        amount
      }
    })
    
    // 替换当前项目
    store.data.items = newItems
    store.updateTotals()
    
    alert(`成功导入 ${newItems.length} 条费用项目`)
  } catch (error) {
    console.error('解析Excel文件失败:', error)
    alert('解析文件失败，请检查文件格式')
  }
  
  // 重置文件输入
  if (itemsFileInput.value) {
    itemsFileInput.value.value = ''
  }
}

const tabs = [
  { id: 'type', label: '类型', icon: '📋' },
  { id: 'user', label: '用户', icon: '👤' },
  { id: 'items', label: '明细', icon: '📊' },
  { id: 'design', label: '设计', icon: '🎨' },
  { id: 'payment', label: '支付', icon: '💳' },
  { id: 'settings', label: '设置', icon: '⚙️' }
]

const templates = [
  { value: 'standard', label: '标准模板' },
  { value: 'modern', label: '现代风格' },
  { value: 'minimal', label: '简约风格' }
]

const paymentStatuses = [
  { value: 'unpaid', label: '待缴费' },
  { value: 'paid', label: '已缴费' },
  { value: 'overdue', label: '已逾期' }
]

const selectBillType = (type: 'electricity' | 'water' | 'gas' | 'property' | 'phone' | 'internet') => {
  store.data.billType = type
  store.setProviderByType()
}

const downloadImage = async () => {
  if (!previewRef.value) return
  const canvas = await html2canvas(previewRef.value, { 
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  const link = document.createElement('a')
  link.download = `bill-${store.data.billType}-${store.data.billMonth}-${Date.now()}.png`
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
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  })
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`bill-${store.data.billType}-${store.data.billMonth}-${Date.now()}.pdf`)
}
</script>

<style scoped>
.cn-bill-view {
  display: flex;
  height: 100%;
  gap: 24px;
  padding: 24px;
  background: var(--bg-secondary);
}

.edit-panel {
  flex: 6;
  min-width: 0;
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
}

.data-management-section {
  margin: 0 20px 16px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
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

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-template {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-template:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-upload {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.btn-upload .hidden-input {
  display: none;
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

.type-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  filter: grayscale(1) brightness(10);
}

.type-info .type-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.type-info .type-unit {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.status-btns {
  display: flex;
  gap: 10px;
}

.status-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.status-btn.unpaid.active {
  border-color: #e65100;
  background: #fff3e0;
  color: #e65100;
}

.status-btn.paid.active {
  border-color: #2e7d32;
  background: #e8f5e9;
  color: #2e7d32;
}

.status-btn.overdue.active {
  border-color: #c62828;
  background: #ffebee;
  color: #c62828;
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

.totals-section {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.totals-section h4 {
  margin: 0 0 12px 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.total-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--primary-bg);
  border-radius: 8px;
  margin-top: 12px;
  font-weight: 600;
}

.total-value {
  font-size: 1.25rem;
  color: var(--primary-color);
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
  flex: 4;
  min-width: 0;
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

.btn-download-panel {
  padding: 10px 20px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download-panel:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
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

/* 设计功能样式 */
.design-group {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-top: 8px;
}

.upload-with-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-divider {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  margin: 4px 0;
}

.range-value {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-left: 8px;
}

input[type="range"] {
  width: 100%;
  accent-color: var(--primary-color);
}

input[type="color"] {
  width: 100%;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.preview-image {
  max-width: 120px;
  max-height: 120px;
  margin-top: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.preview-image.barcode {
  max-width: 200px;
  max-height: 60px;
}

.preview-image.stamp {
  max-width: 80px;
  max-height: 80px;
}

/* 支付功能样式 */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method.selected {
  border-color: var(--primary-color);
  background: var(--primary-bg);
}

.method-icon {
  font-size: 1.5rem;
}

.method-name {
  font-weight: 500;
}

.payment-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.amount-label {
  color: var(--text-secondary);
}

.amount-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.btn-pay {
  width: 100%;
  padding: 16px;
  border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-pay:hover {
  transform: scale(1.02);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.payment-modal {
  background: white;
  border-radius: 16px;
  width: 420px;
  max-width: 90%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

.modal-body {
  padding: 20px;
}

.payment-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.info-row.total {
  border-bottom: none;
  padding-top: 16px;
  font-weight: bold;
}

.info-row .amount {
  color: #dc2626;
  font-size: 1.25rem;
}

.payment-qr {
  text-align: center;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.qr-canvas {
  margin-bottom: 10px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-cancel {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.btn-confirm {
  background: var(--primary-color);
  color: white;
}

/* 成功弹窗 */
.success-modal {
  background: white;
  border-radius: 16px;
  width: 380px;
  max-width: 90%;
  padding: 40px;
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.success-modal h3 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
}

.success-modal p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.success-details {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.detail-row .amount {
  color: #22c55e;
  font-weight: bold;
}

.detail-row .time-input {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.9rem;
  width: 180px;
  text-align: right;
}

.success-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.download-options {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.download-options .option-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-options label {
  font-size: 0.85rem;
  color: #666;
}

.download-options select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.85rem;
  background: white;
}

.btn-download {
  padding: 10px 20px;
  border: 1px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download:hover {
  background: var(--primary-color);
  color: white;
}

.btn-done {
  flex: 1;
  padding: 14px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
