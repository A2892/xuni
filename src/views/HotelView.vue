<template>
  <div class="hotel-view">
    <div class="view-content">
      <div class="edit-panel">
        <div class="panel-header">
          <div class="header-row">
            <div class="header-text">
              <h2>🏨 {{ t('hotel.title') }}</h2>
              <p>{{ t('hotel.subtitle') }}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
        <div class="tabs">
          <button v-for="tab in localizedTabs" :key="tab.key" :class="['tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">{{ tab.label }}</button>
        </div>
        <div class="tab-content">
          <div v-show="activeTab === 'hotel'" class="form-section">
            <div class="form-group">
              <label>{{ t('hotel.hotelName') }}</label>
              <input v-model="store.hotel.name" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('hotel.starRating') }}</label>
                <select v-model.number="store.hotel.stars">
                  <option :value="3">⭐⭐⭐</option>
                  <option :value="4">⭐⭐⭐⭐</option>
                  <option :value="5">⭐⭐⭐⭐⭐</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ t('hotel.confirmationNumber') }}</label>
                <input v-model="store.confirmationNumber" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('hotel.hotelLogo') }}</label>
              <div class="upload-with-selector">
                <MediaSelector 
                  v-model="store.hotel.logo"
                  type="logo"
                  :show-all-media="true"
                  button-text="从媒体库选择"
                  modal-title="选择酒店 Logo"
                  icon="🏨"
                />
                <div class="upload-divider">或</div>
                <input type="file" accept="image/*" @change="handleLogoUpload" />
              </div>
              <div v-if="store.hotel.logo" class="image-preview">
                <img :src="store.hotel.logo" />
                <button @click="store.hotel.logo = ''" class="btn-remove">{{ t('common.delete') }}</button>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('hotel.address') }}</label>
              <textarea v-model="store.hotel.address" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('hotel.phone') }}</label>
                <input v-model="store.hotel.phone" type="text" />
              </div>
              <div class="form-group">
                <label>{{ t('common.email') }}</label>
                <input v-model="store.hotel.email" type="email" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('hotel.website') }}</label>
              <input v-model="store.hotel.website" type="text" />
            </div>
          </div>
          <div v-show="activeTab === 'guest'" class="form-section">
            <div class="form-group">
              <label>{{ t('hotel.guestName') }}</label>
              <input v-model="store.guest.name" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('hotel.phone') }}</label>
                <input v-model="store.guest.phone" type="text" />
              </div>
              <div class="form-group">
                <label>{{ t('common.email') }}</label>
                <input v-model="store.guest.email" type="email" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('hotel.idNumber') }}</label>
              <input v-model="store.guest.idNumber" type="text" />
            </div>
            <div class="form-group">
              <label>{{ t('hotel.address') }}</label>
              <textarea v-model="store.guest.address" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>{{ t('hotel.specialRequests') }}</label>
              <textarea v-model="store.guest.specialRequests" rows="2" :placeholder="t('hotel.specialRequestsPlaceholder')"></textarea>
            </div>
          </div>
          <div v-show="activeTab === 'reservation'" class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('hotel.checkIn') }}</label>
                <input v-model="store.reservation.checkIn" type="date" />
              </div>
              <div class="form-group">
                <label>{{ t('hotel.checkOut') }}</label>
                <input v-model="store.reservation.checkOut" type="date" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('hotel.roomType') }}</label>
                <select v-model="store.reservation.roomType">
                  <option value="standard">{{ t('hotel.roomStandard') }}</option>
                  <option value="deluxe">{{ t('hotel.roomDeluxe') }}</option>
                  <option value="suite">{{ t('hotel.roomSuite') }}</option>
                  <option value="executive">{{ t('hotel.roomExecutive') }}</option>
                  <option value="presidential">{{ t('hotel.roomPresidential') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ t('hotel.roomCount') }}</label>
                <input v-model.number="store.reservation.roomCount" type="number" min="1" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('hotel.adultsCount') }}</label>
                <input v-model.number="store.reservation.adults" type="number" min="1" />
              </div>
              <div class="form-group">
                <label>{{ t('hotel.childrenCount') }}</label>
                <input v-model.number="store.reservation.children" type="number" min="0" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('hotel.roomNumber') }}</label>
              <input v-model="store.reservation.roomNumber" type="text" placeholder="1201" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('hotel.pricePerNight') }}</label>
                <input v-model.number="store.reservation.ratePerNight" type="number" />
              </div>
              <div class="form-group">
                <label>{{ t('hotel.breakfastIncluded') }}</label>
                <select v-model="store.reservation.breakfastIncluded">
                  <option :value="true">{{ t('hotel.withBreakfast') }}</option>
                  <option :value="false">{{ t('hotel.withoutBreakfast') }}</option>
                </select>
              </div>
            </div>
          </div>
          <div v-show="activeTab === 'payment'" class="form-section">
            <!-- 支付前的界面 -->
            <template v-if="!store.payment.isPaid">
              <h4>💰 费用明细</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>税率 (%)</label>
                  <input v-model.number="store.fees.taxRate" type="number" step="0.1" min="0" />
                </div>
                <div class="form-group">
                  <label>服务费率 (%)</label>
                  <input v-model.number="store.fees.serviceFeeRate" type="number" step="0.1" min="0" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>城市税 (每晚/每间)</label>
                  <input v-model.number="store.fees.cityTax" type="number" step="0.01" min="0" />
                </div>
                <div class="form-group">
                  <label>度假费 (每晚)</label>
                  <input v-model.number="store.fees.resortFee" type="number" step="0.01" min="0" />
                </div>
              </div>
              
              <h4 style="margin-top: 20px;">💳 支付信息</h4>

              <div class="form-row">
                <div class="form-group">
                  <label>货币</label>
                  <CurrencySelector v-model="store.payment.currency" />
                </div>
              </div>

              <!-- 预订信息概览 -->
              <div class="booking-summary-card">
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="summary-label">酒店</span>
                    <span class="summary-value">{{ store.hotel.name }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">入住日期</span>
                    <span class="summary-value">{{ store.reservation.checkIn }} - {{ store.reservation.checkOut }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">房间</span>
                    <span class="summary-value">{{ store.reservation.roomType }} x {{ store.reservation.rooms }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">入住人</span>
                    <span class="summary-value">{{ store.guest.name }}</span>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label>{{ t('hotel.paymentMethod') }}</label>
                <!-- 折叠式支付方式选择器 -->
                <div class="payment-method-selector">
                  <div class="selected-method" @click="showPaymentMethods = !showPaymentMethods">
                    <div class="method-display">
                      <div class="method-details">
                        <span class="method-name">{{ selectedMethodInfo.label }}</span>
                        <span class="method-desc">{{ selectedMethodInfo.desc }}</span>
                      </div>
                    </div>
                    <span class="dropdown-arrow" :class="{ open: showPaymentMethods }">▼</span>
                  </div>
                  <transition name="slide">
                    <div v-show="showPaymentMethods" class="payment-methods-dropdown">
                      <div class="methods-category" v-for="category in paymentCategories" :key="category.key">
                        <div class="category-header">{{ category.label }}</div>
                        <div class="methods-grid">
                          <div 
                            v-for="method in getMethodsByCategory(category.key)" 
                            :key="method.value"
                            :class="['method-option', { active: store.payment.method === method.value }]"
                            @click="selectPaymentMethod(method.value)"
                          >
                            <div class="method-info">
                              <span class="method-name">{{ method.label }}</span>
                              <span class="method-desc">{{ method.desc }}</span>
                            </div>
                            <span v-if="store.payment.method === method.value" class="check-mark">✓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- 银行卡选择 -->
              <div v-if="['credit', 'debit'].includes(store.payment.method)" class="bank-card-selection">
                <label style="font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 8px; display: block;">选择银行卡</label>
                <div class="bank-card-grid">
                  <div 
                    v-for="card in bankCards" 
                    :key="card.id"
                    :class="['saved-card-item', { active: bankCardInfo.selectedCardId === card.id }]"
                    @click="bankCardInfo.selectedCardId = card.id"
                  >
                    <div class="card-icon-wrapper">
                      <span class="card-brand" :class="'brand-' + card.type.toLowerCase()">{{ card.type }}</span>
                    </div>
                    <div class="card-info">
                      <span class="card-bank">{{ card.bank }}</span>
                      <span class="card-number">•••• {{ card.last4 }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 银行卡信息编辑 -->
                <div v-if="selectedCardInfo" class="card-edit-section">
                  <div class="form-row">
                    <div class="form-group">
                      <label>银行名称</label>
                      <input v-model="selectedCardInfo.bank" type="text" />
                    </div>
                    <div class="form-group">
                      <label>卡号后四位</label>
                      <input v-model="selectedCardInfo.last4" type="text" maxlength="4" />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>持卡人姓名</label>
                      <input v-model="bankCardInfo.cardHolder" type="text" />
                    </div>
                    <div class="form-group">
                      <label>有效期</label>
                      <input type="text" placeholder="MM/YY" maxlength="5" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>{{ t('hotel.paymentStatus') }}</label>
                <select v-model="store.payment.status">
                  <option value="fully_paid">全部支付</option>
                  <option value="paid">{{ t('hotel.paid') }}</option>
                  <option value="pending">{{ t('hotel.paymentPending') }}</option>
                  <option value="partial">{{ t('hotel.partiallyPaid') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ t('hotel.amountPaid') }}</label>
                <input v-model.number="store.payment.amountPaid" type="number" />
              </div>
              
              <div class="summary-box">
                <div class="summary-row"><span>{{ t('hotel.roomCharges') }} ({{ store.nights }} {{ t('hotel.nights') }}):</span> <strong>{{ store.formatCurrency(store.totalRoomCharge) }}</strong></div>
                <div class="summary-row"><span>税费 ({{ store.fees.taxRate }}%):</span> <span>{{ store.formatCurrency(store.taxAmount) }}</span></div>
                <div class="summary-row"><span>服务费 ({{ store.fees.serviceFeeRate }}%):</span> <span>{{ store.formatCurrency(store.serviceFeeAmount) }}</span></div>
                <div class="summary-row" v-if="store.cityTaxAmount > 0"><span>城市税:</span> <span>{{ store.formatCurrency(store.cityTaxAmount) }}</span></div>
                <div class="summary-row" v-if="store.resortFeeAmount > 0"><span>度假费:</span> <span>{{ store.formatCurrency(store.resortFeeAmount) }}</span></div>
                <div class="summary-row total"><span>{{ t('hotel.totalAmount') }}:</span> <strong>{{ store.formatCurrency(store.totalAmount) }}</strong></div>
              </div>
              
              <button @click="processPayment" class="btn-pay">
                ✅ 确认支付 {{ store.formatCurrency(store.totalAmount) }}
              </button>
            </template>
            
            <!-- 支付完成后的界面 -->
            <template v-else>
              <div class="payment-completed">
                <!-- 可下载的收据区域（包含成功提示） -->
                <div class="downloadable-receipt-wrapper" :class="`receipt-size-${receiptSize}`">
                  <div id="hotel-payment-receipt" class="receipt-download-content">
                    <div v-if="includeSuccessHeader" class="success-header">
                      <div class="success-icon">✅</div>
                      <h3>支付成功!</h3>
                      <p>感谢您的预订</p>
                    </div>
                    <div class="receipt-card">
                    <div class="receipt-header">
                      <span class="receipt-title">支付收据</span>
                      <span class="receipt-badge">已支付</span>
                    </div>
                    
                    <div class="receipt-body">
                      <div class="receipt-row">
                        <span class="label">确认号</span>
                        <span class="value confirmation">{{ store.payment.confirmationNumber }}</span>
                      </div>
                      <div class="receipt-row">
                        <span class="label">预订编号</span>
                        <span class="value">{{ store.confirmationNumber }}</span>
                      </div>
                      <div class="receipt-row">
                        <span class="label">付款人</span>
                        <span class="value">{{ store.payment.payerName }}</span>
                      </div>
                      <div class="receipt-row">
                        <span class="label">支付日期</span>
                        <span class="value">{{ store.payment.paidDate }}</span>
                      </div>
                      <div class="receipt-row">
                        <span class="label">支付方式</span>
                        <span class="value">{{ getPaymentMethodLabel(store.payment.method) }}<template v-if="paidCardInfo"> ****{{ paidCardInfo.last4 }}</template></span>
                      </div>
                      <div v-if="paidCardInfo" class="receipt-row">
                        <span class="label">银行</span>
                        <span class="value">{{ paidCardInfo.bank }}</span>
                      </div>
                      <div class="receipt-row">
                        <span class="label">酒店</span>
                        <span class="value">{{ store.hotel.name }}</span>
                      </div>
                      <div class="receipt-row">
                        <span class="label">入住日期</span>
                        <span class="value">{{ store.reservation.checkIn }} - {{ store.reservation.checkOut }}</span>
                      </div>
                      <hr />
                      <div class="receipt-row">
                        <span class="label">房费</span>
                        <span class="value">{{ store.formatCurrency(store.totalRoomCharge) }}</span>
                      </div>
                      <div class="receipt-row">
                        <span class="label">税费及服务费</span>
                        <span class="value">{{ store.formatCurrency(store.totalFees) }}</span>
                      </div>
                      <div class="receipt-row total">
                        <span class="label">支付金额</span>
                        <span class="value amount">{{ store.formatCurrency(store.payment.amountPaid) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                
              <div class="receipt-actions">
                <label class="include-header-option">
                  <input type="checkbox" v-model="includeSuccessHeader" />
                  <span>包含成功提示 ✅</span>
                </label>
                <div class="size-download-row">
                  <PreviewSizeSelector v-model="receiptSize" />
                  <button @click="downloadReceipt" class="btn-download-receipt">📥 下载收据</button>
                </div>
                <button @click="resetPaymentStatus" class="btn-reset">🔄 重新生成预订</button>
              </div>
            </div>
            </template>
          </div>
          <div v-show="activeTab === 'settings'" class="form-section">
            <h4>{{ t('hotel.templateSelect') }}</h4>
            <div class="template-grid">
              <div v-for="tpl in templateOptionsLocal" :key="tpl.id" :class="['template-card', { active: store.settings.template === tpl.id }]" @click="store.settings.template = tpl.id">
                <span>{{ tpl.name }}</span>
              </div>
            </div>
            <h4 style="margin-top: 20px;">{{ t('hotel.colorSettings') }}</h4>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('hotel.primaryColor') }}</label>
                <input v-model="store.settings.primaryColor" type="color" />
              </div>
              <div class="form-group">
                <label>预览语言</label>
                <select v-model="store.settings.language">
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
            <h4 style="margin-top: 20px;">{{ t('hotel.displayOptions') }}</h4>
            <div class="options-grid">
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showLogo" /> {{ t('hotel.showLogo') }}</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showQR" /> {{ t('hotel.showQRCode') }}</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showBarcode" /> 显示条形码</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showPolicies" /> {{ t('hotel.showPolicies') }}</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showAmenities" /> {{ t('hotel.showAmenities') }}</label>
            </div>
          </div>
          
          <!-- 设计选项卡 -->
          <div v-show="activeTab === 'design'" class="form-section">
            <!-- 水印设置 -->
            <h4>💧 水印设置</h4>
            <label class="checkbox-option" style="margin-bottom: 12px;">
              <input type="checkbox" v-model="store.designSettings.watermarkEnabled" /> 启用水印
            </label>
            <template v-if="store.designSettings.watermarkEnabled">
              <div class="form-group">
                <label>水印文字</label>
                <input type="text" v-model="store.designSettings.watermarkText" placeholder="CONFIRMED" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>颜色</label>
                  <input type="color" v-model="store.designSettings.watermarkColor" />
                </div>
                <div class="form-group">
                  <label>透明度: {{ store.designSettings.watermarkOpacity }}%</label>
                  <input type="range" v-model.number="store.designSettings.watermarkOpacity" min="5" max="50" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>字号</label>
                  <input type="number" v-model.number="store.designSettings.watermarkSize" min="20" max="100" />
                </div>
                <div class="form-group">
                  <label>角度</label>
                  <input type="number" v-model.number="store.designSettings.watermarkAngle" min="-90" max="90" />
                </div>
              </div>
            </template>
            
            <!-- 字体设置 -->
            <h4 style="margin-top: 20px;">🔤 字体设置</h4>
            <div class="form-group">
              <label>主字体</label>
              <select v-model="store.designSettings.fontFamily">
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
              </select>
            </div>
            <div class="form-group">
              <label>文字颜色</label>
              <input type="color" v-model="store.designSettings.textColor" />
            </div>
            
            <!-- 边框设置 -->
            <h4 style="margin-top: 20px;">🔲 边框设置</h4>
            <label class="checkbox-option" style="margin-bottom: 12px;">
              <input type="checkbox" v-model="store.designSettings.borderEnabled" /> 启用边框
            </label>
            <template v-if="store.designSettings.borderEnabled">
              <div class="form-row">
                <div class="form-group">
                  <label>边框颜色</label>
                  <input type="color" v-model="store.designSettings.borderColor" />
                </div>
                <div class="form-group">
                  <label>边框宽度</label>
                  <input type="number" v-model.number="store.designSettings.borderWidth" min="1" max="10" />
                </div>
              </div>
              <div class="form-group">
                <label>边框样式</label>
                <select v-model="store.designSettings.borderStyle">
                  <option value="solid">实线</option>
                  <option value="dashed">虚线</option>
                  <option value="dotted">点线</option>
                </select>
              </div>
            </template>
            
            <!-- 二维码设置 -->
            <h4 style="margin-top: 20px;">📱 二维码设置</h4>
            <label class="checkbox-option" style="margin-bottom: 12px;">
              <input type="checkbox" v-model="store.qrSettings.useCustomQR" /> 使用自定义二维码图片
            </label>
            <template v-if="store.qrSettings.useCustomQR">
              <div class="form-group">
                <label>上传二维码图片</label>
                <div class="upload-with-selector">
                  <MediaSelector 
                    v-model="store.qrSettings.customQRImage"
                    type="qrcode"
                    button-text="从媒体库选择"
                    modal-title="选择二维码"
                    icon="📱"
                  />
                  <div class="upload-divider">或</div>
                  <input type="file" accept="image/*" @change="handleQRUpload" />
                </div>
              </div>
              <div v-if="store.qrSettings.customQRImage" class="image-preview">
                <img :src="store.qrSettings.customQRImage" />
                <button @click="store.qrSettings.customQRImage = ''" class="btn-remove">删除</button>
              </div>
            </template>
            <template v-else>
              <div class="form-group">
                <label>二维码内容</label>
                <input type="text" v-model="store.qrSettings.qrContent" :placeholder="store.confirmationNumber" />
              </div>
            </template>
            
            <!-- 条形码设置 -->
            <h4 style="margin-top: 20px;">📊 条形码设置</h4>
            <label class="checkbox-option" style="margin-bottom: 12px;">
              <input type="checkbox" v-model="store.barcodeSettings.useCustomBarcode" /> 使用自定义条形码图片
            </label>
            <template v-if="store.barcodeSettings.useCustomBarcode">
              <div class="form-group">
                <label>上传条形码图片</label>
                <div class="upload-with-selector">
                  <MediaSelector 
                    v-model="store.barcodeSettings.customBarcodeImage"
                    type="barcode"
                    button-text="从媒体库选择"
                    modal-title="选择条形码"
                    icon="📊"
                  />
                  <div class="upload-divider">或</div>
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
                <label>条形码内容</label>
                <input type="text" v-model="store.barcodeSettings.barcodeContent" :placeholder="store.confirmationNumber" />
              </div>
            </template>
          </div>

          <!-- 数据管理 -->
          <div v-show="activeTab === 'data'" class="form-section">
            <SaveLoadPanel 
              document-type="hotel"
              :get-data="() => store.$state"
              :set-data="(data: any) => store.$patch(data)"
            />
          </div>
        </div>
      </div>
      <div class="preview-panel">
        <div class="preview-toolbar">
          <span>{{ t('hotel.reservationPreview') }}</span>
          <div class="toolbar-actions">
            <PreviewSizeSelector v-model="previewSize" />
            <button @click="showEmailModal = true" class="btn-email">📧 {{ t('common.email') }}</button>
            <button @click="showDownloadPanel = true" class="btn-download">📥 {{ t('common.export') }}</button>
          </div>
        </div>
        <div class="preview-container">
          <HotelPreview ref="previewRef" :preview-size="previewSize" />
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`Hotel_${store.confirmationNumber}`"
      :default-subject="`酒店预订确认 - ${store.hotel.name}`"
      preview-selector=".hotel-preview"
      @close="showEmailModal = false"
    />
    
    <!-- 下载面板 -->
    <DownloadPanel
      :visible="showDownloadPanel"
      :preview-selector="'.preview-container .hotel-preview'"
      :default-file-name="store.payment.isPaid ? `HotelReceipt_${store.payment.confirmationNumber}` : `HotelBooking_${store.confirmationNumber}`"
      @close="showDownloadPanel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHotelStore } from '@/stores/hotel'
import HotelPreview from '@/components/HotelPreview.vue'
import EmailModal from '@/components/EmailModal.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import PreviewSizeSelector, { type PreviewSize } from '@/components/PreviewSizeSelector.vue'
import MediaSelector from '@/components/MediaSelector.vue'
import CurrencySelector from '@/components/CurrencySelector.vue'
import { useI18n } from '@/utils/i18n'
import html2canvas from 'html2canvas'

const store = useHotelStore()
const { t, currentLanguage } = useI18n()
const activeTab = ref('hotel')
const previewRef = ref()
const showEmailModal = ref(false)
const showDownloadPanel = ref(false)
const previewSize = ref<PreviewSize>('original')

// 独立的收据尺寸状态
const receiptSize = ref<PreviewSize>('original')
const includeSuccessHeader = ref(true) // 是否包含绿色勾选成功提示

// 下载左侧收据
const downloadReceipt = async () => {
  const element = document.getElementById('hotel-payment-receipt')
  if (!element) {
    alert('找不到收据元素')
    return
  }
  
  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    const link = document.createElement('a')
    link.download = `HotelReceipt_${store.payment.confirmationNumber}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败，请重试')
  }
}

// 支付方式折叠控制
const showPaymentMethods = ref(false)

// 支付方式分类
const paymentCategories = [
  { key: 'card', label: '💳 银行卡' },
  { key: 'digital', label: '📱 数字钱包' },
  { key: 'bank', label: '🏦 银行转账' },
  { key: 'other', label: '📋 其他方式' }
]

// 当前选中的支付方式信息
const selectedMethodInfo = computed(() => {
  return paymentMethods.find(m => m.value === store.payment.method) || paymentMethods[0]
})

// 根据分类获取支付方式
const getMethodsByCategory = (category: string) => {
  return paymentMethods.filter(m => m.category === category)
}

// 选择支付方式
const selectPaymentMethod = (value: string) => {
  store.payment.method = value
  showPaymentMethods.value = false
}

// 支付方式选项
const paymentMethods = [
  // 银行卡
  { value: 'credit', label: 'Credit Card', icon: '💳', category: 'card', desc: 'Visa / Mastercard / Amex' },
  { value: 'debit', label: 'Debit Card', icon: '💳', category: 'card', desc: 'Instant deduction' },
  // 数字钱包
  { value: 'alipay', label: 'Alipay', icon: '🔵', category: 'digital', desc: 'Alipay account' },
  { value: 'wechat', label: 'WeChat Pay', icon: '🟢', category: 'digital', desc: 'WeChat wallet' },
  { value: 'apple', label: 'Apple Pay', icon: '🍎', category: 'digital', desc: 'iPhone quick pay' },
  { value: 'google', label: 'Google Pay', icon: '🔷', category: 'digital', desc: 'Android quick pay' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️', category: 'digital', desc: 'PayPal account' },
  { value: 'samsung', label: 'Samsung Pay', icon: '📱', category: 'digital', desc: 'Samsung mobile pay' },
  // 银行转账
  { value: 'bank', label: 'Bank Transfer', icon: '🏦', category: 'bank', desc: 'Direct bank transfer' },
  { value: 'wire', label: 'Wire Transfer', icon: '🔗', category: 'bank', desc: 'International wire' },
  // 其他
  { value: 'cash', label: 'Cash', icon: '💵', category: 'other', desc: 'Pay at hotel' },
  { value: 'points', label: 'Loyalty Points', icon: '⭐', category: 'other', desc: 'Use reward points' },
  { value: 'voucher', label: 'Gift Voucher', icon: '🎟️', category: 'other', desc: 'Gift card/voucher' },
  { value: 'crypto', label: 'Cryptocurrency', icon: '₿', category: 'other', desc: 'BTC / ETH / USDT' }
]

// 银行卡列表（响应式，可编辑）
const bankCards = ref([
  { id: 'visa-chase', type: 'Visa', bank: 'Chase', last4: '4242', color: '#1a1f71' },
  { id: 'mc-boa', type: 'Mastercard', bank: 'Bank of America', last4: '8888', color: '#e31837' },
  { id: 'amex-plat', type: 'Amex', bank: 'American Express', last4: '1005', color: '#2e77bc' },
  { id: 'visa-citi', type: 'Visa', bank: 'Citi', last4: '1234', color: '#003b70' },
  { id: 'mc-hsbc', type: 'Mastercard', bank: 'HSBC', last4: '5678', color: '#db0011' },
  { id: 'visa-wells', type: 'Visa', bank: 'Wells Fargo', last4: '9012', color: '#cd1409' },
  { id: 'disc-cap', type: 'Discover', bank: 'Capital One', last4: '3456', color: '#ff6600' },
  { id: 'visa-usb', type: 'Visa', bank: 'US Bank', last4: '7890', color: '#0072ce' }
])

// 获取选中的银行卡信息
const selectedCardInfo = computed(() => {
  return bankCards.value.find(c => c.id === bankCardInfo.value.selectedCardId)
})

const bankCardInfo = ref({
  selectedCardId: 'visa-chase',
  cardHolder: 'JOHN DOE'
})

// 支付方式标签
const paymentMethodLabels: Record<string, string> = {
  credit: 'Credit Card',
  debit: 'Debit Card',
  cash: 'Cash',
  bank: 'Bank Transfer',
  alipay: 'Alipay',
  wechat: 'WeChat Pay',
  paypal: 'PayPal',
  crypto: 'Cryptocurrency',
  apple: 'Apple Pay',
  google: 'Google Pay'
}

const getPaymentMethodLabel = (method: string) => {
  return paymentMethodLabels[method] || method
}

// 保存支付时的银行卡信息
const paidCardInfo = ref<{type: string, bank: string, last4: string} | null>(null)

// 处理支付
const processPayment = () => {
  // 保存银行卡信息
  if (selectedCardInfo.value) {
    paidCardInfo.value = {
      type: selectedCardInfo.value.type,
      bank: selectedCardInfo.value.bank,
      last4: selectedCardInfo.value.last4
    }
  }
  store.completePayment()
}

// 重置支付状态
const resetPaymentStatus = () => {
  store.resetPayment()
  paidCardInfo.value = null
}

const localizedTabs = computed(() => [
  { key: 'hotel', label: t('hotel.hotelInfo') },
  { key: 'guest', label: t('hotel.guestInfo') },
  { key: 'reservation', label: t('hotel.reservationDetails') },
  { key: 'payment', label: t('hotel.paymentInfo') },
  { key: 'settings', label: t('common.settings') },
  { key: 'design', label: '设计' },
  { key: 'data', label: '数据管理' }
])

const templateOptionsLocal = computed(() => [
  { id: 'luxury', name: t('hotel.templateLuxury') },
  { id: 'modern', name: t('hotel.templateModern') },
  { id: 'classic', name: t('hotel.templateClassic') },
  { id: 'minimal', name: t('hotel.templateMinimal') }
])

const handleLogoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.hotel.logo = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const handleQRUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.qrSettings.customQRImage = e.target?.result as string }
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
.hotel-view { height: 100%; display: flex; flex-direction: column; }
.view-content { flex: 1; display: flex; gap: 24px; padding: 24px; overflow: hidden; }
.edit-panel { flex: 5.5; min-width: 0; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; overflow: hidden; }
.panel-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.panel-header h2 { margin: 0 0 4px 0; font-size: 20px; }
.panel-header p { margin: 0; font-size: 13px; color: #6b7280; }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; }
.header-text { flex: 1; }
.tabs { display: flex; gap: 4px; padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; overflow-x: auto; }
.tab { padding: 8px 12px; border: none; background: transparent; color: #6b7280; font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; white-space: nowrap; }
.tab:hover { background: #e5e7eb; }
.tab.active { background: #2563eb; color: white; }
.tab-content { flex: 1; padding: 20px; overflow-y: auto; }
.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #374151; }
.form-group input, .form-group select, .form-group textarea { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.upload-with-selector { display: flex; flex-direction: column; gap: 8px; }
.upload-divider { text-align: center; color: #9ca3af; font-size: 12px; margin: 4px 0; }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
h4 { margin: 0 0 12px 0; font-size: 14px; color: #374151; }
.image-preview { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
.image-preview img { width: 80px; height: 50px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
.btn-remove { padding: 4px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
.summary-box { padding: 16px; background: #f9fafb; border-radius: 8px; margin-top: 16px; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
.summary-row:last-child { margin-bottom: 0; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 16px; }
.template-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.template-card { padding: 12px 8px; border: 2px solid #e5e7eb; border-radius: 8px; text-align: center; font-size: 12px; cursor: pointer; }
.template-card:hover { border-color: #2563eb; }
.template-card.active { border-color: #2563eb; background: #eff6ff; }
.options-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.checkbox-option { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
.preview-panel { flex: 4.5; min-width: 0; display: flex; flex-direction: column; background: #f1f5f9; border-radius: 16px; overflow: hidden; }
.preview-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-bottom: 1px solid #e5e7eb; }
.preview-toolbar span { font-size: 14px; font-weight: 600; }
.toolbar-actions { display: flex; gap: 10px; }
.btn-email { padding: 10px 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.btn-download { padding: 10px 20px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.preview-container { flex: 1; padding: 24px; overflow: auto; display: flex; justify-content: center; align-items: flex-start; }

/* 支付按钮样式 */
.btn-pay { width: 100%; padding: 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px; transition: all 0.2s; }
.btn-pay:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4); }

/* 支付完成界面样式 */
.payment-completed { text-align: center; }
.success-header { margin-bottom: 24px; }
.success-icon { font-size: 64px; margin-bottom: 12px; }
.success-header h3 { margin: 0 0 4px; font-size: 24px; color: #10b981; }
.success-header p { margin: 0; color: #6b7280; }

.receipt-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; text-align: left; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.receipt-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; }
.receipt-title { font-size: 16px; font-weight: 600; }
.receipt-badge { padding: 4px 12px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 12px; }
.receipt-body { padding: 20px; }
.receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.receipt-row:last-child { border-bottom: none; }
.receipt-row .label { color: #6b7280; font-size: 13px; }
.receipt-row .value { font-weight: 500; font-size: 13px; color: #1f2937; }
.receipt-row .value.confirmation { font-family: monospace; color: #2563eb; font-weight: 700; }
.receipt-row.total { background: #f8fafc; margin: 12px -20px -20px; padding: 16px 20px; border-radius: 0 0 12px 12px; }
.receipt-row.total .value.amount { font-size: 20px; color: #10b981; font-weight: 700; }
.receipt-body hr { border: none; border-top: 1px dashed #e5e7eb; margin: 12px 0; }

.receipt-actions { margin-top: 20px; display: flex; flex-direction: column; gap: 12px; }
.include-header-option { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; cursor: pointer; padding: 8px 12px; background: #e0f2fe; border-radius: 8px; transition: all 0.2s; }
.include-header-option:hover { background: #bae6fd; }
.include-header-option input { width: 16px; height: 16px; accent-color: #10b981; }
.size-download-row { display: flex; align-items: center; justify-content: center; gap: 12px; }
.btn-download-receipt { padding: 10px 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-download-receipt:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
.btn-reset { padding: 12px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-reset:hover { background: #e5e7eb; }

/* 汇总框增强 */
.summary-box .summary-row.total { border-top: 2px solid #e5e7eb; margin-top: 8px; padding-top: 12px; }

/* 收据尺寸样式 */
.downloadable-receipt-wrapper { width: 100%; transition: all 0.3s ease; }
.downloadable-receipt-wrapper.receipt-size-mobile { max-width: 320px; margin: 0 auto; }
.downloadable-receipt-wrapper.receipt-size-iphone { max-width: 375px; margin: 0 auto; }
.downloadable-receipt-wrapper.receipt-size-desktop { max-width: 500px; margin: 0 auto; }
.downloadable-receipt-wrapper.receipt-size-original { max-width: 100%; }

/* 收据下载内容包装（包含成功提示+收据卡片） */
.receipt-download-content { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.receipt-download-content .success-header { margin-bottom: 20px; }
.receipt-download-content .receipt-card { margin: 0; }

.bank-card-selection {
  margin-top: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.bank-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.saved-card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  height: 80px;
}

.saved-card-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.saved-card-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 2px #3b82f6;
}

.card-icon-wrapper {
  width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 20px;
  flex-shrink: 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.card-bank {
  font-weight: 600;
  font-size: 15px;
  color: #1e293b;
}

.card-number {
  font-size: 13px;
  color: #64748b;
  font-family: monospace;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-bank {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.card-number {
  font-size: 11px;
  color: #64748b;
}

/* 预订概览卡片 */
.booking-summary-card {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.summary-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

/* 折叠式支付方式选择器样式 */
.payment-method-selector {
  position: relative;
}

.selected-method {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.selected-method:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.method-display {
  display: flex;
  align-items: center;
  gap: 14px;
}

.method-display .method-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 10px;
}

.method-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.method-display .method-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.method-display .method-desc {
  font-size: 12px;
  color: #64748b;
}

.dropdown-arrow {
  font-size: 12px;
  color: #64748b;
  transition: transform 0.2s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.payment-methods-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
  z-index: 100;
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.methods-category {
  margin-bottom: 12px;
}

.methods-category:last-child {
  margin-bottom: 0;
}

.category-header {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  background: #fafafa;
}

.method-option:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  transform: translateX(4px);
}

.method-option.active {
  background: #eff6ff;
  border-color: #2563eb;
}

.method-option .method-icon {
  font-size: 22px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.method-option .method-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.method-option .method-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.method-option .method-desc {
  font-size: 11px;
  color: #64748b;
}

.method-option .check-mark {
  width: 20px;
  height: 20px;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

/* 过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
