<template>
  <div class="flight-view">
    <div class="view-content">
      <div class="edit-panel">
        <div class="panel-header">
          <div class="header-row">
            <div class="header-text">
              <h2>✈️ {{ t('flight.title') }}</h2>
              <p>{{ t('flight.subtitle') }}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
        <div class="tabs">
          <button v-for="tab in localizedTabs" :key="tab.key" :class="['tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">{{ tab.label }}</button>
        </div>
        <div class="tab-content">
          <div v-show="activeTab === 'booking'" class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('flight.bookingReference') }}</label>
                <input v-model="store.bookingReference" type="text" placeholder="ABC123" />
              </div>
              <div class="form-group">
                <label>{{ t('flight.bookingDate') }}</label>
                <input v-model="store.bookingDate" type="date" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('flight.ticketNumber') }}</label>
                <input v-model="store.ticketNumber" type="text" />
              </div>
              <div class="form-group">
                <label>{{ t('flight.eTicketNumber') }}</label>
                <input v-model="store.eTicketNumber" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('flight.status') }}</label>
              <select v-model="store.status">
                <option value="confirmed">{{ t('flight.confirmed') }}</option>
                <option value="pending">{{ t('flight.pending') }}</option>
                <option value="cancelled">{{ t('flight.cancelled') }}</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('flight.contactPhone') }}</label>
                <input v-model="store.contactInfo.phone" type="text" />
              </div>
              <div class="form-group">
                <label>{{ t('flight.contactEmail') }}</label>
                <input v-model="store.contactInfo.email" type="email" />
              </div>
            </div>
          </div>
          <div v-show="activeTab === 'passenger'" class="form-section">
            <!-- 上传导入区域 -->
            <ItemsUploader 
              type="flight" 
              @import="handlePassengersImport"
            />
            
            <div v-for="(passenger, index) in store.passengers" :key="passenger.id" class="passenger-item">
              <div class="passenger-header">
                <span>{{ t('flight.passenger') }} {{ index + 1 }}</span>
                <button v-if="store.passengers.length > 1" @click="store.passengers.splice(index, 1)" class="btn-remove-sm">×</button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.firstName') }}</label>
                  <input v-model="passenger.firstName" type="text" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.lastName') }}</label>
                  <input v-model="passenger.lastName" type="text" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.salutation') }}</label>
                  <select v-model="passenger.title">
                    <option value="MR">{{ t('flight.title_mr') }}</option>
                    <option value="MS">{{ t('flight.title_ms') }}</option>
                    <option value="MRS">{{ t('flight.title_mrs') }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('flight.dateOfBirth') }}</label>
                  <input v-model="passenger.dateOfBirth" type="date" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.passportNumber') }}</label>
                  <input v-model="passenger.passportNumber" type="text" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.nationality') }}</label>
                  <input v-model="passenger.nationality" type="text" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.seatPreference') }}</label>
                  <select v-model="passenger.seatPreference">
                    <option value="Window">{{ t('flight.window') }}</option>
                    <option value="Aisle">{{ t('flight.aisle') }}</option>
                    <option value="Any">{{ t('flight.noPreference') }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('flight.mealPreference') }}</label>
                  <select v-model="passenger.mealPreference">
                    <option value="Regular">{{ t('flight.mealRegular') }}</option>
                    <option value="Vegetarian">{{ t('flight.mealVegetarian') }}</option>
                    <option value="Vegan">{{ t('flight.mealVegan') }}</option>
                    <option value="Halal">{{ t('flight.mealHalal') }}</option>
                    <option value="Kosher">{{ t('flight.mealKosher') }}</option>
                    <option value="Asian Vegetarian">{{ t('flight.mealAsianVeg') }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>{{ t('flight.frequentFlyer') }}</label>
                <input v-model="passenger.frequentFlyerNumber" type="text" />
              </div>
            </div>
            <button @click="addPassenger" class="btn-add">{{ t('flight.addPassenger') }}</button>
          </div>
          <div v-show="activeTab === 'flight'" class="form-section">
            <!-- 航班信息批量导入 -->
            <ItemsUploader 
              type="flightSegment" 
              @import="handleFlightsImport"
            />
            
            <div v-for="(flight, index) in store.flights" :key="flight.id" class="flight-item">
              <div class="flight-header">
                <span>{{ t('flight.segment') }} {{ index + 1 }}</span>
                <button v-if="store.flights.length > 1" @click="store.flights.splice(index, 1)" class="btn-remove-sm" title="删除航段">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.flightNumber') }}</label>
                  <input v-model="flight.flightNumber" type="text" placeholder="CA123" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.airline') }}</label>
                  <input v-model="flight.airline" type="text" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.aircraft') }}</label>
                  <input v-model="flight.aircraft" type="text" placeholder="Boeing 777" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.class') }}</label>
                  <select v-model="flight.class">
                    <option value="economy">{{ t('flight.economy') }}</option>
                    <option value="premium-economy">{{ t('flight.premiumEconomy') }}</option>
                    <option value="business">{{ t('flight.business') }}</option>
                    <option value="first">{{ t('flight.first') }}</option>
                  </select>
                </div>
              </div>
              <h5 style="margin: 16px 0 8px; color: #374151;">{{ t('flight.departureInfo') }}</h5>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.departureCity') }}</label>
                  <input v-model="flight.departureCity" type="text" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.airportCode') }}</label>
                  <input v-model="flight.departureAirport" type="text" placeholder="PEK" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.terminal') }}</label>
                  <input v-model="flight.departureTerminal" type="text" placeholder="T3" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.gate') }}</label>
                  <input v-model="flight.departureGate" type="text" placeholder="G12" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.departureDate') }}</label>
                  <input v-model="flight.departureDate" type="date" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.departureTime') }}</label>
                  <input v-model="flight.departureTime" type="time" />
                </div>
              </div>
              <h5 style="margin: 16px 0 8px; color: #374151;">{{ t('flight.arrivalInfo') }}</h5>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.arrivalCity') }}</label>
                  <input v-model="flight.arrivalCity" type="text" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.airportCode') }}</label>
                  <input v-model="flight.arrivalAirport" type="text" placeholder="LAX" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.terminal') }}</label>
                  <input v-model="flight.arrivalTerminal" type="text" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.flightDuration') }}</label>
                  <input v-model="flight.duration" type="text" placeholder="12h 30m" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.arrivalDate') }}</label>
                  <input v-model="flight.arrivalDate" type="date" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.arrivalTime') }}</label>
                  <input v-model="flight.arrivalTime" type="time" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('flight.seatNumber') }}</label>
                  <input v-model="flight.seatNumber" type="text" placeholder="5A" />
                </div>
                <div class="form-group">
                  <label>{{ t('flight.baggage') }}</label>
                  <input v-model="flight.baggage" type="text" placeholder="2 x 23kg" />
                </div>
              </div>
            </div>
            <button @click="addFlight" class="btn-add">{{ t('flight.addSegment') }}</button>
          </div>
          
          <!-- 支付选项卡 -->
          <div v-show="activeTab === 'payment'" class="form-section">
            <div v-if="!store.paymentCompleted.isPaid" class="payment-form">
              <h4>💳 机票支付</h4>
              <div class="payment-summary">
                <div class="payment-amount">
                  <span class="label">应付总额</span>
                  <span class="amount">{{ store.formatCurrency(store.paymentInfo.totalAmount) }}</span>
                </div>
              </div>
              
              <!-- 价格明细 -->
              <div class="price-breakdown">
                <h5>价格明细</h5>
                <div class="breakdown-row">
                  <span>基础票价</span>
                  <span>{{ store.formatCurrency(store.paymentInfo.baseFare) }}</span>
                </div>
                <div class="breakdown-row">
                  <span>税费</span>
                  <span>{{ store.formatCurrency(store.paymentInfo.taxes) }}</span>
                </div>
                <div class="breakdown-row">
                  <span>服务费</span>
                  <span>{{ store.formatCurrency(store.paymentInfo.serviceFee) }}</span>
                </div>
                <div class="breakdown-row">
                  <span>燃油附加费</span>
                  <span>{{ store.formatCurrency(store.paymentInfo.surcharge) }}</span>
                </div>
                <div class="breakdown-row total">
                  <strong>合计</strong>
                  <strong>{{ store.formatCurrency(store.paymentInfo.totalAmount) }}</strong>
                </div>
              </div>
              
              <!-- 乘客信息概览 -->
              <div class="booking-info-card">
                <h5>✈️ 预订信息</h5>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">预订编号</span>
                    <span class="info-value">{{ store.bookingReference }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">乘客</span>
                    <span class="info-value">{{ store.passengers.length }} 人</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">航段</span>
                    <span class="info-value">{{ store.flights.length }} 段</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">行程</span>
                    <span class="info-value">{{ store.flights[0]?.departureCity }} → {{ store.flights[store.flights.length - 1]?.arrivalCity }}</span>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label>支付方式</label>
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
                            :class="['method-option', { active: selectedPaymentMethod === method.value }]"
                            @click="selectPaymentMethod(method.value)"
                          >
                            <div class="method-info">
                              <span class="method-name">{{ method.label }}</span>
                              <span class="method-desc">{{ method.desc }}</span>
                            </div>
                            <span v-if="selectedPaymentMethod === method.value" class="check-mark">✓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- 银行卡选择 -->
              <div v-if="selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card'" class="bank-card-selection">
                <label class="section-label">💳 选择银行卡</label>
                <div class="bank-card-grid">
                  <div 
                    v-for="card in bankCards" 
                    :key="card.id"
                    :class="['bank-card-item', { active: selectedBankCard === card.id }]"
                    @click="selectedBankCard = card.id"
                  >
                    <div class="card-brand" :class="'brand-' + card.type.toLowerCase()">
                      {{ card.type }}
                    </div>
                    <div class="card-details">
                      <span class="card-bank">{{ card.bank }}</span>
                      <span class="card-number">•••• {{ card.last4 }}</span>
                    </div>
                    <span v-if="selectedBankCard === card.id" class="card-check">✓</span>
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
                      <input v-model="payerName" type="text" :placeholder="store.passengers[0]?.firstName + ' ' + store.passengers[0]?.lastName" />
                    </div>
                    <div class="form-group">
                      <label>有效期</label>
                      <input type="text" placeholder="MM/YY" maxlength="5" />
                    </div>
                  </div>
                </div>
              </div>
              
              <button @click="processPayment" class="btn-pay">
                ✅ 确认支付 {{ store.formatCurrency(store.paymentInfo.totalAmount) }}
              </button>
            </div>
            
            <!-- 支付完成后的界面 -->
            <div v-else class="payment-completed">
              <!-- 可下载的收据区域（包含成功提示） -->
              <div class="receipt-download-content">
                <div v-if="includeSuccessHeader" class="success-header">
                  <div class="success-icon">✅</div>
                  <h3>支付成功!</h3>
                  <p>您的机票已成功付款</p>
                </div>
                <div class="receipt-card">
                <div class="receipt-header">
                  <span class="receipt-title">支付收据</span>
                  <span class="receipt-badge">已支付</span>
                </div>
                
                <div class="receipt-body">
                  <div class="receipt-row">
                    <span class="label">确认号</span>
                    <span class="value confirmation">{{ store.paymentCompleted.confirmationNumber }}</span>
                  </div>
                  <div class="receipt-row">
                    <span class="label">预订编号</span>
                    <span class="value">{{ store.bookingReference }}</span>
                  </div>
                  <div class="receipt-row">
                    <span class="label">付款人</span>
                    <span class="value">{{ store.paymentCompleted.payerName }}</span>
                  </div>
                  <div class="receipt-row">
                    <span class="label">支付日期</span>
                    <span class="value">{{ store.paymentCompleted.paidDate }}</span>
                  </div>
                  <div class="receipt-row">
                    <span class="label">支付方式</span>
                    <span class="value">{{ getPaymentMethodLabel(store.paymentCompleted.paymentMethod) }}<template v-if="paidCardInfo"> ****{{ paidCardInfo.last4 }}</template></span>
                  </div>
                  <div v-if="paidCardInfo" class="receipt-row">
                    <span class="label">银行</span>
                    <span class="value">{{ paidCardInfo.bank }}</span>
                  </div>
                  <div class="receipt-row">
                    <span class="label">行程</span>
                    <span class="value">{{ store.flights[0]?.departureCity }} → {{ store.flights[store.flights.length - 1]?.arrivalCity }}</span>
                  </div>
                  <div class="receipt-row">
                    <span class="label">乘客</span>
                    <span class="value">{{ store.passengers.length }} 人</span>
                  </div>
                  <hr />
                  <div class="receipt-row total">
                    <span class="label">支付金额</span>
                    <span class="value amount">{{ store.formatCurrency(store.paymentCompleted.paidAmount) }}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
              
            <div class="receipt-export-panel">
              <h4>📥 下载收据</h4>
              <label class="include-header-option">
                <input type="checkbox" v-model="includeSuccessHeader" />
                <span>包含成功提示 ✅</span>
              </label>
              <div class="export-controls-inline">
                <PreviewSizeSelector v-model="receiptPreviewSize" />
                <div class="export-options-inline">
                  <select v-model="receiptExportFormat" class="format-select">
                    <option value="PDF">PDF</option>
                    <option value="PNG">PNG</option>
                    <option value="JPEG">JPEG</option>
                  </select>
                  <select v-model="receiptExportQuality" class="quality-select">
                    <option value="标准质量">标准质量</option>
                    <option value="高清质量">高清质量</option>
                    <option value="超高清">超高清</option>
                    <option value="最高质量">最高质量</option>
                  </select>
                  <button @click="downloadReceipt" class="btn-download-receipt" :disabled="isExportingReceipt">
                    {{ isExportingReceipt ? '生成中...' : '下载收据' }}
                  </button>
                </div>
              </div>
            </div>
            
            <div class="receipt-actions">
              <button @click="resetPaymentStatus" class="btn-reset">🔄 重新生成行程</button>
            </div>
          </div>
          
          <div v-show="activeTab === 'settings'" class="form-section">
            <h4>{{ t('flight.templateSelect') }}</h4>
            <div class="template-grid">
              <div v-for="tpl in templateOptions" :key="tpl.id" :class="['template-card', { active: store.settings.template === tpl.id }]" @click="store.settings.template = tpl.id">
                <span>{{ tpl.name }}</span>
              </div>
            </div>
            <h4 style="margin-top: 20px;">{{ t('flight.colorSettings') }}</h4>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('flight.primaryColor') }}</label>
                <input v-model="store.settings.primaryColor" type="color" />
              </div>
              <div class="form-group">
                <label>{{ t('flight.secondaryColor') }}</label>
                <input v-model="store.settings.secondaryColor" type="color" />
              </div>
            </div>
            <div class="form-group" style="margin-top: 12px;">
              <label>预览语言</label>
              <select v-model="store.settings.language">
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
            <div class="form-group" style="margin-top: 12px;">
              <label>{{ t('flight.airlineLogo') }}</label>
              <div class="logo-actions">
                <PhotoSelector v-model="store.settings.airlineLogo" />
                <span class="or-divider">或</span>
                <input type="file" accept="image/*" @change="handleAirlineLogoUpload" />
              </div>
              <div v-if="store.settings.airlineLogo" class="image-preview">
                <img :src="store.settings.airlineLogo" />
                <button @click="store.settings.airlineLogo = ''" class="btn-remove">{{ t('common.delete') }}</button>
              </div>
            </div>
            <h4 style="margin-top: 20px;">{{ t('flight.displayOptions') }}</h4>
            <div class="options-grid">
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showBarcode" /> {{ t('flight.showBarcode') }}</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showQRCode" /> {{ t('flight.showQRCode') }}</label>
            </div>
            <h4 style="margin-top: 20px;">{{ t('flight.paymentInfo') }}</h4>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('flight.totalAmount') }}</label>
                <input v-model.number="store.paymentInfo.totalAmount" type="number" />
              </div>
              <div class="form-group">
                <label>{{ t('flight.currency') }}</label>
                <CurrencySelector v-model="store.paymentInfo.currency" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('flight.paymentMethod') }}</label>
                <input v-model="store.paymentInfo.paymentMethod" type="text" placeholder="Visa ****4567" />
              </div>
              <div class="form-group">
                <label>{{ t('flight.paymentDate') }}</label>
                <input v-model="store.paymentInfo.paymentDate" type="date" />
              </div>
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
                <input type="text" v-model="store.designSettings.watermarkText" placeholder="E-TICKET" />
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
            
            <!-- 条形码设置 -->
            <h4 style="margin-top: 20px;">📊 条形码/二维码设置</h4>
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
              <div class="form-group" style="margin-top: 12px;">
                <label>上传二维码图片</label>
                <div class="logo-actions">
                  <PhotoSelector v-model="store.barcodeSettings.customQRImage" />
                  <span class="or-divider">或</span>
                  <input type="file" accept="image/*" @change="handleQRUpload" />
                </div>
              </div>
              <div v-if="store.barcodeSettings.customQRImage" class="image-preview">
                <img :src="store.barcodeSettings.customQRImage" />
                <button @click="store.barcodeSettings.customQRImage = ''" class="btn-remove">删除</button>
              </div>
            </template>
            <template v-else>
              <div class="form-group">
                <label>条形码内容</label>
                <input type="text" v-model="store.barcodeSettings.barcodeContent" :placeholder="store.bookingReference" />
              </div>
            </template>
          </div>

          <!-- 数据管理 -->
          <div v-show="activeTab === 'data'" class="form-section">
            <SaveLoadPanel 
              document-type="flight"
              :get-data="() => store.$state"
              :set-data="(data: any) => store.$patch(data)"
            />
          </div>
        </div>
      </div>
      <div class="preview-panel">
        <div class="preview-toolbar">
          <span>{{ t('flight.itineraryPreview') }}</span>
          <div class="toolbar-actions">
            <PreviewSizeSelector v-model="previewSize" />
            <button @click="showEmailModal = true" class="btn-email">📧 {{ t('flight.sendEmail') }}</button>
            <button @click="showDownloadPanel = true" class="btn-download">📥 {{ t('common.export') }}</button>
          </div>
        </div>
        <div class="preview-container">
          <FlightPreview ref="previewRef" :preview-size="previewSize" />
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`Flight_${store.bookingReference}`"
      :default-subject="`航班行程 - ${store.bookingReference}`"
      preview-selector=".flight-preview"
      @close="showEmailModal = false"
    />
    
    <!-- 下载面板 -->
    <DownloadPanel
      :visible="showDownloadPanel"
      :preview-selector="store.paymentCompleted.isPaid ? '.preview-container .flight-preview .payment-receipt' : '.preview-container .flight-preview .itinerary'"
      :default-file-name="store.paymentCompleted.isPaid ? `FlightReceipt_${store.bookingReference}` : `FlightItinerary_${store.bookingReference}`"
      @close="showDownloadPanel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFlightStore } from '@/stores/flight'
import FlightPreview from '@/components/FlightPreview.vue'
import EmailModal from '@/components/EmailModal.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ItemsUploader from '@/components/ItemsUploader.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import PreviewSizeSelector, { type PreviewSize } from '@/components/PreviewSizeSelector.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import CurrencySelector from '@/components/CurrencySelector.vue'
import { useI18n } from '@/utils/i18n'

const { t, currentLanguage } = useI18n()
const store = useFlightStore()
const activeTab = ref('booking')
const localizedTabs = computed(() => [
  { key: 'booking', label: t('flight.bookingInfo') },
  { key: 'passenger', label: t('flight.passengerInfo') },
  { key: 'flight', label: t('flight.flightInfo') },
  { key: 'payment', label: '💳 支付' },
  { key: 'settings', label: t('common.settings') },
  { key: 'design', label: '设计' },
  { key: 'data', label: '数据管理' }
])
const previewRef = ref()
const showEmailModal = ref(false)
const showDownloadPanel = ref(false)
const previewSize = ref<PreviewSize>('original')

// 收据下载相关
const receiptPreviewSize = ref<PreviewSize>('original')
const receiptExportFormat = ref('PDF')
const receiptExportQuality = ref('高清质量')
const isExportingReceipt = ref(false)
const includeSuccessHeader = ref(true) // 是否包含绿色勾选成功提示

// 支付相关
const selectedPaymentMethod = ref('credit_card')
const payerName = ref('')
const showPaymentMethods = ref(false)
const selectedBankCard = ref('visa-chase')

// 支付方式分类
const paymentCategories = [
  { key: 'card', label: '💳 银行卡' },
  { key: 'digital', label: '📱 数字钱包' },
  { key: 'bank', label: '🏦 银行转账' },
  { key: 'other', label: '📋 其他方式' }
]

// 当前选中的支付方式信息
const selectedMethodInfo = computed(() => {
  return paymentMethods.find(m => m.value === selectedPaymentMethod.value) || paymentMethods[0]
})

// 根据分类获取支付方式
const getMethodsByCategory = (category: string) => {
  return paymentMethods.filter(m => m.category === category)
}

// 选择支付方式
const selectPaymentMethod = (value: string) => {
  selectedPaymentMethod.value = value
  showPaymentMethods.value = false
}

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
  return bankCards.value.find(c => c.id === selectedBankCard.value)
})

const paymentMethods = [
  // 银行卡
  { value: 'credit_card', label: '信用卡', icon: '💳', category: 'card', desc: 'Visa / Mastercard / Amex' },
  { value: 'debit_card', label: '借记卡', icon: '💳', category: 'card', desc: '储蓄卡即时扣款' },
  // 数字钱包
  { value: 'alipay', label: '支付宝', icon: '🔵', category: 'digital', desc: '支付宝账户支付' },
  { value: 'wechat', label: '微信支付', icon: '🟢', category: 'digital', desc: '微信钱包支付' },
  { value: 'apple_pay', label: 'Apple Pay', icon: '🍎', category: 'digital', desc: 'iPhone快捷支付' },
  { value: 'google_pay', label: 'Google Pay', icon: '🔷', category: 'digital', desc: 'Android快捷支付' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️', category: 'digital', desc: 'PayPal账户支付' },
  { value: 'samsung_pay', label: 'Samsung Pay', icon: '📱', category: 'digital', desc: 'Samsung手机支付' },
  // 银行转账
  { value: 'bank_transfer', label: '银行转账', icon: '🏦', category: 'bank', desc: '直接银行转账' },
  { value: 'wire', label: '电汇', icon: '🔗', category: 'bank', desc: '国际电汇转账' },
  // 其他
  { value: 'miles', label: '里程数抵扣', icon: '✈️', category: 'other', desc: '使用飞行里程' },
  { value: 'voucher', label: '代金券', icon: '🎟️', category: 'other', desc: '使用代金券支付' },
  { value: 'installment', label: '分期付款', icon: '📅', category: 'other', desc: '3/6/12期免息' }
]

const getPaymentMethodLabel = (method: string) => {
  return paymentMethods.find(m => m.value === method)?.label || method
}

// 保存支付时的银行卡信息
const paidCardInfo = ref<{type: string, bank: string, last4: string} | null>(null)

const processPayment = () => {
  const name = payerName.value || (store.passengers[0]?.firstName + ' ' + store.passengers[0]?.lastName)
  // 保存银行卡信息
  if (selectedCardInfo.value) {
    paidCardInfo.value = {
      type: selectedCardInfo.value.type,
      bank: selectedCardInfo.value.bank,
      last4: selectedCardInfo.value.last4
    }
  }
  store.completePayment(selectedPaymentMethod.value, name)
}

const resetPaymentStatus = () => {
  store.resetPayment()
  selectedPaymentMethod.value = 'credit_card'
  payerName.value = ''
  paidCardInfo.value = null
}

// 下载收据
const downloadReceipt = async () => {
  const receiptElement = document.querySelector('.receipt-download-content')
  if (!receiptElement) {
    alert('找不到收据元素')
    return
  }
  
  isExportingReceipt.value = true
  try {
    const { default: html2canvas } = await import('html2canvas')
    const { default: jsPDF } = await import('jspdf')
    
    const qualitySettings: Record<string, { scale: number; quality: number }> = {
      '标准质量': { scale: 2, quality: 0.85 },
      '高清质量': { scale: 3, quality: 0.92 },
      '超高清': { scale: 4, quality: 0.95 },
      '最高质量': { scale: 5, quality: 1.0 }
    }
    
    const settings = qualitySettings[receiptExportQuality.value] || qualitySettings['高清质量']
    
    const canvas = await html2canvas(receiptElement as HTMLElement, { 
      scale: settings.scale, 
      useCORS: true, 
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true
    })
    
    const filename = `Flight_Receipt_${store.bookingReference}`
    
    if (receiptExportFormat.value === 'PDF') {
      const imgData = canvas.toDataURL('image/png', settings.quality)
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${filename}.pdf`)
    } else if (receiptExportFormat.value === 'PNG') {
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvas.toDataURL('image/png', settings.quality)
      link.click()
    } else if (receiptExportFormat.value === 'JPEG') {
      const link = document.createElement('a')
      link.download = `${filename}.jpg`
      link.href = canvas.toDataURL('image/jpeg', settings.quality)
      link.click()
    }
  } catch (error) {
    console.error('Receipt export failed:', error)
    alert('收据导出失败，请重试')
  } finally {
    isExportingReceipt.value = false
  }
}

const templateOptions = [
  { id: 'airline' as const, name: '航司风格' },
  { id: 'modern' as const, name: '现代' },
  { id: 'minimal' as const, name: '简约' },
  { id: 'detailed' as const, name: '详细' }
]

const handleAirlineLogoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.settings.airlineLogo = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const addPassenger = () => {
  store.passengers.push({
    id: Date.now().toString(),
    firstName: '',
    lastName: '',
    title: 'MR',
    dateOfBirth: '',
    passportNumber: '',
    nationality: '',
    frequentFlyerNumber: '',
    seatPreference: 'Any',
    mealPreference: 'Regular',
    specialAssistance: ''
  })
}

const addFlight = () => {
  store.flights.push({
    id: Date.now().toString(),
    flightNumber: '',
    airline: 'Air China',
    airlineLogo: '',
    aircraft: '',
    departureAirport: '',
    departureCity: '',
    departureTime: '',
    departureDate: '',
    departureTerminal: '',
    departureGate: '',
    arrivalAirport: '',
    arrivalCity: '',
    arrivalTime: '',
    arrivalDate: '',
    arrivalTerminal: '',
    duration: '',
    class: 'economy',
    status: 'confirmed',
    seatNumber: '',
    meal: '',
    baggage: ''
  })
}

const handleBarcodeUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.barcodeSettings.customBarcodeImage = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const handleQRUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.barcodeSettings.customQRImage = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const handlePassengersImport = (data: any[]) => {
  // 清空现有乘客
  store.passengers = []
  // 导入新乘客
  data.forEach(row => {
    store.passengers.push({
      id: Date.now().toString() + Math.random(),
      firstName: row.firstName || row['名'] || '',
      lastName: row.lastName || row['姓'] || '',
      title: row.title || row['称谓'] || 'MR',
      dateOfBirth: row.dateOfBirth || row['出生日期'] || '',
      passportNumber: row.passportNumber || row['护照号'] || '',
      nationality: row.nationality || row['国籍'] || '',
      frequentFlyerNumber: row.frequentFlyerNumber || row['常旅客号'] || '',
      seatPreference: row.seatPreference || row['座位偏好'] || 'Any',
      mealPreference: row.mealPreference || row['餐食偏好'] || 'Regular',
      specialAssistance: row.specialAssistance || row['特殊服务'] || ''
    })
  })
}

const handleFlightsImport = (data: any[]) => {
  // 清空现有航班
  store.flights = []
  // 导入新航班
  data.forEach(row => {
    store.flights.push({
      id: Date.now().toString() + Math.random(),
      flightNumber: row.flightNumber || row['航班号'] || '',
      airline: row.airline || row['航空公司'] || '',
      airlineLogo: '',
      aircraft: row.aircraft || row['机型'] || '',
      departureAirport: row.departureAirport || row['出发机场'] || '',
      departureCity: row.departureCity || row['出发城市'] || '',
      departureTime: row.departureTime || row['出发时间'] || '',
      departureDate: row.departureDate || row['出发日期'] || '',
      departureTerminal: row.departureTerminal || row['出发航站楼'] || '',
      departureGate: row.departureGate || row['登机口'] || '',
      arrivalAirport: row.arrivalAirport || row['到达机场'] || '',
      arrivalCity: row.arrivalCity || row['到达城市'] || '',
      arrivalTime: row.arrivalTime || row['到达时间'] || '',
      arrivalDate: row.arrivalDate || row['到达日期'] || '',
      arrivalTerminal: row.arrivalTerminal || row['到达航站楼'] || '',
      duration: row.duration || row['飞行时长'] || '',
      class: row.class || row['舱位'] || 'economy',
      status: 'confirmed',
      seatNumber: row.seatNumber || row['座位号'] || '',
      meal: row.meal || row['餐食'] || 'Regular',
      baggage: row.baggage || row['行李'] || '1 x 23kg',
      layoverDuration: row.layoverDuration || ''
    })
  })
}
</script>

<style scoped>
.flight-view { height: 100%; display: flex; flex-direction: column; }
.view-content { flex: 1; display: flex; gap: 24px; padding: 24px; overflow: hidden; }
.edit-panel { flex: 6; min-width: 0; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; overflow: hidden; }
.panel-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.panel-header h2 { margin: 0 0 4px 0; font-size: 20px; }
.panel-header p { margin: 0; font-size: 13px; color: #6b7280; }
.tabs { display: flex; gap: 4px; padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; overflow-x: auto; }
.tab { padding: 8px 14px; border: none; background: transparent; color: #6b7280; font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; white-space: nowrap; }
.tab:hover { background: #e5e7eb; }
.tab.active { background: #2563eb; color: white; }
.tab-content { flex: 1; padding: 20px; overflow-y: auto; }
.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #374151; }
.form-group input, .form-group select { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
h4 { margin: 0 0 12px 0; font-size: 14px; color: #374151; }
.passenger-item, .flight-item { padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px; }
.passenger-header, .flight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #374151; }
.btn-remove-sm { width: 28px; height: 28px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
.btn-add { padding: 10px; background: #eff6ff; color: #2563eb; border: 1px dashed #2563eb; border-radius: 8px; font-size: 13px; cursor: pointer; width: 100%; }
.template-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.template-card { padding: 12px 8px; border: 2px solid #e5e7eb; border-radius: 8px; text-align: center; font-size: 12px; cursor: pointer; }
.template-card:hover { border-color: #2563eb; }
.template-card.active { border-color: #2563eb; background: #eff6ff; }
.options-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.checkbox-option { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
.image-preview { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
.image-preview img { width: 80px; height: 50px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
.btn-remove { padding: 4px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
.preview-panel { flex: 4; min-width: 0; display: flex; flex-direction: column; background: #f1f5f9; border-radius: 16px; overflow: hidden; }
.preview-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-bottom: 1px solid #e5e7eb; }
.preview-toolbar span { font-size: 14px; font-weight: 600; }
.toolbar-actions { display: flex; gap: 10px; }
.btn-email { padding: 10px 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.btn-download { padding: 10px 20px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.preview-container { flex: 1; padding: 24px; overflow: auto; display: flex; justify-content: center; align-items: flex-start; }

/* 支付相关样式 */
.payment-form { max-width: 500px; }
.payment-summary { background: linear-gradient(135deg, #003366, #0066cc); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
.payment-summary .payment-amount { text-align: center; }
.payment-summary .label { font-size: 13px; opacity: 0.9; display: block; margin-bottom: 4px; }
.payment-summary .amount { font-size: 32px; font-weight: 700; }

.price-breakdown { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
.price-breakdown h5 { margin: 0 0 12px 0; font-size: 14px; color: #374151; }
.breakdown-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
.breakdown-row:last-child { border-bottom: none; }
.breakdown-row.total { color: #1f2937; font-weight: 600; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 8px; }

.payment-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.method-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.method-card:hover { border-color: #2563eb; }
.method-card.active { border-color: #2563eb; background: #eff6ff; }
.method-card input { display: none; }
.method-icon { font-size: 24px; }
.method-name { font-size: 12px; font-weight: 500; }

/* 预订信息卡片 */
.booking-info-card {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 20px;
}

.booking-info-card h5 {
  margin: 0 0 14px 0;
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.info-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
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

/* 银行卡选择样式 */
.bank-card-selection {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.section-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.bank-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.bank-card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.bank-card-item:hover {
  border-color: #2563eb;
  background: #f8fafc;
}

.bank-card-item.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.card-brand {
  font-size: 11px;
  font-weight: 700;
  width: 50px;
  text-align: center;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 4px;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
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

.card-check {
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

.btn-pay { width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px; transition: transform 0.2s; }
.btn-pay:hover { transform: translateY(-2px); }

.payment-completed { text-align: center; }
.success-header { margin-bottom: 24px; }
.success-icon { font-size: 64px; margin-bottom: 12px; }
.success-header h3 { font-size: 24px; color: #10b981; margin: 0 0 8px 0; }
.success-header p { color: #6b7280; margin: 0; }

.receipt-card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; text-align: left; max-width: 400px; margin: 0 auto; }
.receipt-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: linear-gradient(135deg, #003366, #0066cc); color: white; }
.receipt-title { font-weight: 600; }
.receipt-badge { background: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
.receipt-body { padding: 20px; }
.receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.receipt-row:last-child { border-bottom: none; }
.receipt-row .label { color: #6b7280; font-size: 13px; }
.receipt-row .value { font-weight: 500; color: #1f2937; font-size: 13px; }
.receipt-row .value.confirmation { color: #2563eb; font-family: monospace; font-weight: 600; }
.receipt-row .value.amount { color: #10b981; font-size: 18px; font-weight: 700; }
.receipt-row.total { margin-top: 8px; padding-top: 16px; border-top: 2px solid #e5e7eb; }
.receipt-row hr { width: 100%; border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }

.receipt-actions { margin-top: 20px; }
.btn-reset { padding: 12px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.btn-reset:hover { background: #e5e7eb; }

/* 收据导出面板样式 */
.receipt-export-panel { width: 100%; max-width: 400px; background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px auto 0; text-align: left; }
.receipt-export-panel h4 { margin: 0 0 12px 0; font-size: 14px; color: #374151; }
.include-header-option { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; cursor: pointer; margin-bottom: 12px; padding: 8px 12px; background: #e0f2fe; border-radius: 8px; transition: all 0.2s; }
.include-header-option:hover { background: #bae6fd; }
.include-header-option input { width: 16px; height: 16px; accent-color: #10b981; }
.export-controls-inline { display: flex; flex-direction: column; gap: 12px; }
.export-options-inline { display: flex; gap: 8px; flex-wrap: wrap; }
.export-options-inline .format-select,
.export-options-inline .quality-select { flex: 1; min-width: 100px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; background: white; cursor: pointer; }
.btn-download-receipt { padding: 8px 16px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-download-receipt:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); }
.btn-download-receipt:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* 收据下载内容包装（包含成功提示+收据卡片） */
.receipt-download-content { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 400px; margin: 0 auto; }
.receipt-download-content .success-header { margin-bottom: 20px; }
.receipt-download-content .receipt-card { margin: 0; max-width: 100%; box-shadow: none; }
</style>
