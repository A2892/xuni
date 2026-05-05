<template>
  <div class="cn-hotel-view">
    <!-- 左侧编辑面板 -->
    <div class="edit-panel">
      <div class="panel-header">
        <h2>� 国内酒店账单生成器</h2>
        <p class="subtitle">住宿结算单/消费明细</p>
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
          document-type="cn_hotel" 
          :get-data="() => store.data" 
          :set-data="(data: any) => Object.assign(store.data, data)" 
        />
      </div>

      <!-- 酒店信息 -->
      <div v-show="activeTab === 'hotel'" class="tab-content">
        <div class="form-section">
          <h3>� 酒店信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>酒店名称</label>
              <input v-model="store.data.hotelName" type="text" placeholder="酒店中文名" />
            </div>
            <div class="form-group">
              <label>星级</label>
              <select v-model.number="store.data.hotelStar">
                <option :value="5">五星级 ★★★★★</option>
                <option :value="4">四星级 ★★★★</option>
                <option :value="3">三星级 ★★★</option>
                <option :value="2">二星级 ★★</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>英文名称</label>
            <input v-model="store.data.hotelNameEn" type="text" placeholder="HOTEL NAME" />
          </div>
          <div class="form-group">
            <label>酒店地址</label>
            <input v-model="store.data.hotelAddress" type="text" placeholder="详细地址" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="store.data.hotelPhone" type="text" />
            </div>
            <div class="form-group">
              <label>传真</label>
              <input v-model="store.data.hotelFax" type="text" />
            </div>
          </div>
        </div>

        <div class="quick-fill">
          <h4>快速填充酒店</h4>
          <div class="quick-btns">
            <button @click="store.setHotelTemplate('luxury')">豪华酒店</button>
            <button @click="store.setHotelTemplate('business')">商务酒店</button>
            <button @click="store.setHotelTemplate('resort')">度假酒店</button>
          </div>
        </div>

        <div class="form-section">
          <h3>� 预订编号</h3>
          <div class="form-row">
            <div class="form-group">
              <label>确认号</label>
              <div class="input-with-btn">
                <input v-model="store.data.confirmationNumber" type="text" />
                <button @click="store.generateConfirmationNumber()">🎲</button>
              </div>
            </div>
            <div class="form-group">
              <label>账单号</label>
              <div class="input-with-btn">
                <input v-model="store.data.folioNumber" type="text" />
                <button @click="store.generateFolioNumber()">🎲</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 宾客信息 -->
      <div v-show="activeTab === 'guest'" class="tab-content">
        <div class="form-section">
          <h3>👤 宾客信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>姓名 (中文)</label>
              <input v-model="store.data.guestName" type="text" placeholder="张三" />
            </div>
            <div class="form-group">
              <label>姓名 (英文)</label>
              <input v-model="store.data.guestNameEn" type="text" placeholder="ZHANG SAN" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>证件类型</label>
              <select v-model="store.data.guestIdType">
                <option value="id_card">身份证</option>
                <option value="passport">护照</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label>证件号码</label>
              <input v-model="store.data.guestIdNumber" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="store.data.guestPhone" type="text" />
            </div>
            <div class="form-group">
              <label>电子邮箱</label>
              <input v-model="store.data.guestEmail" type="email" />
            </div>
          </div>
          <div class="form-group">
            <label>公司名称</label>
            <input v-model="store.data.guestCompany" type="text" placeholder="可选" />
          </div>
        </div>
      </div>

      <!-- 入住信息 -->
      <div v-show="activeTab === 'stay'" class="tab-content">
        <div class="form-section">
          <h3>�️ 入住信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>入住日期</label>
              <input v-model="store.data.checkInDate" type="date" @change="store.updateTotals()" />
            </div>
            <div class="form-group">
              <label>入住时间</label>
              <input v-model="store.data.checkInTime" type="time" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>退房日期</label>
              <input v-model="store.data.checkOutDate" type="date" @change="store.updateTotals()" />
            </div>
            <div class="form-group">
              <label>退房时间</label>
              <input v-model="store.data.checkOutTime" type="time" />
            </div>
          </div>
          <div class="stay-summary">
            <div class="stay-item">
              <span class="stay-label">入住天数</span>
              <span class="stay-value">{{ store.calculatedNights }} 晚</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>房型</label>
              <select v-model="store.data.roomType">
                <option v-for="type in roomTypes" :key="type.value" :value="type.label">
                  {{ type.label }} ({{ type.labelEn }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>房号</label>
              <input v-model="store.data.roomNumber" type="text" placeholder="1808" />
            </div>
          </div>
          <div class="form-group">
            <label>入住人数</label>
            <input v-model.number="store.data.guests" type="number" min="1" />
          </div>
        </div>
      </div>

      <!-- 费用明细 -->
      <div v-show="activeTab === 'charges'" class="tab-content">
        <div class="form-section">
          <div class="section-header">
            <h3>� 费用明细</h3>
            <div class="add-btns">
              <button class="btn-add-category" @click="store.addCharge('room')">+房费</button>
              <button class="btn-add-category" @click="store.addCharge('food')">+餐饮</button>
              <button class="btn-add-category" @click="store.addCharge('service')">+服务</button>
              <button class="btn-add-category" @click="store.addCharge('other')">+其他</button>
            </div>
          </div>

          <div v-for="(charge, index) in store.data.charges" :key="charge.id" class="charge-card">
            <div class="charge-header">
              <span class="charge-category" :style="{ background: chargeCategories[charge.category].color }">
                {{ chargeCategories[charge.category].icon }} {{ chargeCategories[charge.category].name }}
              </span>
              <button class="btn-remove" @click="store.removeCharge(charge.id)">×</button>
            </div>
            <div class="form-row">
              <div class="form-group flex-2">
                <label>项目描述</label>
                <input v-model="charge.description" type="text" placeholder="费用项目名称" />
              </div>
              <div class="form-group">
                <label>日期</label>
                <input v-model="charge.date" type="date" />
              </div>
            </div>
            <div class="form-row three-col">
              <div class="form-group">
                <label>数量</label>
                <input v-model.number="charge.quantity" type="number" @change="store.calculateChargeAmount(charge)" />
              </div>
              <div class="form-group">
                <label>单价</label>
                <input v-model.number="charge.unitPrice" type="number" @change="store.calculateChargeAmount(charge)" />
              </div>
              <div class="form-group">
                <label>金额</label>
                <input :value="charge.amount.toFixed(2)" type="text" disabled class="computed-field" />
              </div>
            </div>
          </div>

          <div v-if="store.data.charges.length === 0" class="empty-charges">
            <p>暂无费用项目，点击上方按钮添加</p>
          </div>

          <div class="totals-section">
            <h4>金额汇总</h4>
            <div class="form-row">
              <div class="form-group">
                <label>服务费率 (%)</label>
                <input v-model.number="store.data.serviceChargeRate" type="number" @change="store.updateTotals()" />
              </div>
              <div class="form-group">
                <label>税率 (%)</label>
                <input v-model.number="store.data.taxRate" type="number" @change="store.updateTotals()" />
              </div>
            </div>
            <div class="summary-display">
              <div class="summary-row">
                <span>费用小计:</span>
                <span>¥{{ store.calculatedSubtotal.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>服务费:</span>
                <span>¥{{ store.calculatedServiceCharge.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>税费:</span>
                <span>¥{{ store.calculatedTaxes.toFixed(2) }}</span>
              </div>
              <div class="summary-row total">
                <span>总计:</span>
                <span>¥{{ store.calculatedTotal.toFixed(2) }}</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>已付金额</label>
                <input v-model.number="store.data.paidAmount" type="number" @change="store.updateTotals()" />
              </div>
              <div class="form-group">
                <label>应付余额</label>
                <input :value="store.calculatedBalance.toFixed(2)" type="text" disabled class="computed-field highlight" />
              </div>
            </div>
            <div class="form-group">
              <label>支付状态</label>
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
        </div>
      </div>

      <!-- 设计 -->
      <div v-show="activeTab === 'design'" class="tab-content">
        <div class="form-section">
          <h3>🖌️ 水印设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.watermarkEnabled" />
              <span>启用水印</span>
            </label>
          </div>
          <div v-if="store.designSettings.watermarkEnabled" class="design-group">
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
            <div class="form-row">
              <div class="form-group">
                <label>水印类型</label>
                <div class="radio-group horizontal">
                  <label class="radio-item">
                    <input type="radio" v-model="store.designSettings.watermarkType" value="center" />
                    <span>居中水印</span>
                  </label>
                  <label class="radio-item">
                    <input type="radio" v-model="store.designSettings.watermarkType" value="fullscreen" />
                    <span>全屏水印</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>⭐ 二维码设置</h3>
          <div class="form-group">
            <label>二维码来源</label>
            <div class="radio-group horizontal">
              <label class="radio-item">
                <input type="radio" v-model="store.designSettings.qrCodeSource" value="generate" />
                <span>自动生成</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="store.designSettings.qrCodeSource" value="upload" />
                <span>上传图片</span>
              </label>
            </div>
          </div>
          <div v-if="store.designSettings.qrCodeSource === 'generate'" class="design-group">
            <div class="form-group">
              <label>二维码内容</label>
              <input v-model="store.designSettings.qrCodeContent" type="text" placeholder="酒店链接或订单号" />
            </div>
          </div>
          <div v-else class="design-group">
            <div class="form-group">
              <label>上传二维码</label>
              <div class="logo-actions">
                <PhotoSelector v-model="store.designSettings.qrCodeImage" />
                <span class="or-divider">或</span>
                <input type="file" accept="image/*" @change="handleQRCodeUpload" />
              </div>
              <img v-if="store.designSettings.qrCodeImage" :src="store.designSettings.qrCodeImage" class="preview-image" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>≡ 条形码设置</h3>
          <div class="form-group">
            <label>条形码来源</label>
            <div class="radio-group horizontal">
              <label class="radio-item">
                <input type="radio" v-model="store.designSettings.barcodeSource" value="generate" />
                <span>自动生成</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="store.designSettings.barcodeSource" value="upload" />
                <span>上传图片</span>
              </label>
            </div>
          </div>
          <div v-if="store.designSettings.barcodeSource === 'generate'" class="design-group">
            <div class="form-group">
              <label>条形码内容</label>
              <input v-model="store.designSettings.barcodeContent" type="text" placeholder="账单编号" />
            </div>
          </div>
          <div v-else class="design-group">
            <div class="form-group">
              <label>上传条形码</label>
              <div class="logo-actions">
                <PhotoSelector v-model="store.designSettings.barcodeImage" />
                <span class="or-divider">或</span>
                <input type="file" accept="image/*" @change="handleBarcodeUpload" />
              </div>
              <img v-if="store.designSettings.barcodeImage" :src="store.designSettings.barcodeImage" class="preview-image barcode" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>⭕ 印章设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.stampEnabled" />
              <span>启用印章</span>
            </label>
          </div>
          <div v-if="store.designSettings.stampEnabled" class="design-group">
            <div class="form-group">
              <label>印章来源</label>
              <div class="radio-group horizontal">
                <label class="radio-item">
                  <input type="radio" v-model="store.designSettings.stampSource" value="generate" />
                  <span>自动生成</span>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="store.designSettings.stampSource" value="upload" />
                  <span>上传图片</span>
                </label>
              </div>
            </div>
            <div v-if="store.designSettings.stampSource === 'generate'" class="design-group">
              <div class="form-row">
                <div class="form-group">
                  <label>印章文字</label>
                  <input v-model="store.designSettings.stampText" type="text" placeholder="已结清" />
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
                <input type="file" accept="image/*" @change="handleStampUpload" />
                <img v-if="store.designSettings.stampImage" :src="store.designSettings.stampImage" class="preview-image stamp" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>□ 边框设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.borderEnabled" />
              <span>显示边框</span>
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
                <input v-model.number="store.designSettings.borderWidth" type="number" min="1" max="10" />
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
          <h3>� 结算金额</h3>
          <div class="payment-amount">
            <span class="amount-label">应付金额</span>
            <span class="amount-value">¥{{ store.calculatedTotal.toFixed(2) }}</span>
          </div>
        </div>

        <div class="form-section">
          <button class="btn-pay" @click="showPaymentModal = true">
            立即结算
          </button>
        </div>
      </div>

      <!-- 设置 -->
      <div v-show="activeTab === 'settings'" class="tab-content">
        <div class="form-section">
          <h3>🖌️ 模板样式</h3>
          <div class="template-btns">
            <button 
              v-for="template in templates" 
              :key="template.value"
              :class="['template-btn', { active: store.data.template === template.value }]"
              @click="store.data.template = template.value"
            >
              {{ template.icon }} {{ template.label }}
            </button>
          </div>
        </div>

        <div class="form-section">
          <h3>⚙️ 显示设置</h3>
          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showLogo" />
              <span>显示酒店Logo</span>
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
        </div>

        <div class="form-section">
          <h3>✍️ 备注</h3>
          <textarea v-model="store.data.remarks" rows="2" placeholder="账单备注"></textarea>
          <textarea v-model="store.data.specialRequests" rows="2" placeholder="特殊要求" class="mt-2"></textarea>
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
          <button class="btn-download" @click="showDownloadPanel = true">📥 导出</button>
        </div>
      </div>
      <div class="preview-container">
        <div ref="previewRef" class="preview-wrapper">
          <CNHotelPreview />
        </div>
      </div>
    </div>
    
    <!-- 下载面板 -->
    <DownloadPanel
      :visible="showDownloadPanel"
      preview-selector=".preview-wrapper"
      :default-file-name="`HotelBill_${store.data.folioNumber}`"
      :default-quality="downloadQuality"
      @close="showDownloadPanel = false"
    />

    <!-- 支付弹窗 -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
      <div class="payment-modal" ref="paymentModalRef">
        <div class="modal-header">
          <h3>确认结算</h3>
          <button class="close-btn" @click="showPaymentModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="payment-info">
            <div class="info-row">
              <span>酒店名称</span>
              <span>{{ store.data.hotelName }}</span>
            </div>
            <div class="info-row">
              <span>宾客姓名</span>
              <span>{{ store.data.guestName }}</span>
            </div>
            <div class="info-row">
              <span>入住日期</span>
              <span>{{ store.data.checkInDate }} - {{ store.data.checkOutDate }}</span>
            </div>
            <div class="info-row total">
              <span>结算金额</span>
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
        <h3>结算成功！</h3>
        <p>{{ store.data.hotelName }}账单已结清</p>
        <div class="success-details">
          <div class="detail-row">
            <span>交易单号</span>
            <span>{{ transactionId }}</span>
          </div>
          <div class="detail-row">
            <span>结算金额</span>
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
            <span>结算时间</span>
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
import { ref, reactive, watch } from 'vue'
import { useCNHotelStore, roomTypes, chargeCategories } from '@/stores/cnHotel'
import CNHotelPreview from '@/components/CNHotelPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

const store = useCNHotelStore()
const activeTab = ref('hotel')
const previewRef = ref<HTMLElement | null>(null)
const paymentQRRef = ref<HTMLCanvasElement | null>(null)
const paymentModalRef = ref<HTMLElement | null>(null)
const successModalRef = ref<HTMLElement | null>(null)
const showDownloadPanel = ref(false)

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
    const content = `pay://${selectedPaymentMethod.value}?amount=${store.calculatedTotal}&folio=${store.data.folioNumber}`
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
  link.download = `结算信息_${store.data.guestName}.png`
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
  
  const fileName = `结算成功_${transactionId.value}`
  
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

const tabs = [
  { id: 'hotel', label: '酒店', icon: '�' },
  { id: 'guest', label: '宾客', icon: '👤' },
  { id: 'stay', label: '入住', icon: '🛎️' },
  { id: 'charges', label: '费用', icon: '💵' },
  { id: 'design', label: '设计', icon: '🖌️' },
  { id: 'payment', label: '支付', icon: '💳' },
  { id: 'settings', label: '设置', icon: '⚙️' }
]

const templates = [
  { value: 'luxury', label: '豪华风格', icon: '⭐' },
  { value: 'business', label: '商务风格', icon: '📑' },
  { value: 'minimal', label: '简约风格', icon: '◻️' }
]

const paymentStatuses = [
  { value: 'unpaid', label: '待结算' },
  { value: 'partial', label: '部分结算' },
  { value: 'paid', label: '已结清' }
]

const downloadImage = async () => {
  if (!previewRef.value) return
  const canvas = await html2canvas(previewRef.value, { 
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  const link = document.createElement('a')
  link.download = `hotel-bill-${store.data.folioNumber}-${Date.now()}.png`
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
    format: 'a4'
  })
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`hotel-bill-${store.data.folioNumber}-${Date.now()}.pdf`)
}
</script>

<style scoped>
.cn-hotel-view {
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
  gap: 6px;
  margin: 20px 0;
  padding: 4px;
  background: var(--bg-secondary);
  border-radius: 12px;
  flex-wrap: wrap;
}

.data-management-section {
  margin: 0 20px 16px;
}

.tab-btn {
  flex: 1;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 6px;
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
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.section-header h3 {
  margin: 0;
  padding: 0;
  border: 0;
}

.add-btns {
  display: flex;
  gap: 6px;
}

.btn-add-category {
  padding: 6px 10px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.btn-add-category:hover {
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

.computed-field.highlight {
  background: var(--primary-bg) !important;
  color: var(--primary-color);
  font-weight: 600;
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
  margin-bottom: 16px;
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

.stay-summary {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: var(--primary-bg);
  border-radius: 12px;
  margin-bottom: 16px;
}

.stay-item {
  text-align: center;
}

.stay-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.stay-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.charge-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.charge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.charge-category {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  color: #fff;
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

.empty-charges {
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

.summary-display {
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.summary-row.total {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed var(--border-color);
  font-weight: 600;
  font-size: 1rem;
  color: var(--primary-color);
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

.status-btn.partial.active {
  border-color: #1976d2;
  background: #e3f2fd;
  color: #1976d2;
}

.status-btn.paid.active {
  border-color: #2e7d32;
  background: #e8f5e9;
  color: #2e7d32;
}

.template-btns {
  display: flex;
  gap: 10px;
}

.template-btn {
  flex: 1;
  padding: 12px;
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

.mt-2 {
  margin-top: 8px;
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
