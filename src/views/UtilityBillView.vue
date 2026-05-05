<template>
  <div class="utility-bill-view">
    <div class="view-content">
      <div class="edit-panel">
        <div class="panel-header">
          <div class="header-row">
            <div class="header-text">
              <h2>� {{ t('bill.title') }}</h2>
              <p>{{ t('bill.subtitle') }}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
        <div class="tabs">
          <button v-for="tab in localizedTabs" :key="tab.key" :class="['tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">{{ tab.label }}</button>
        </div>
        <div class="tab-content">
          <div v-show="activeTab === 'bill'" class="form-section">
            <!-- 账单类型选择 -->
            <div class="form-group">
              <label>{{ t('bill.billType') }}</label>
              <select v-model="selectedBillType" @change="store.applyBillTypePreset(selectedBillType)" class="form-select">
                <option v-for="(preset, typeKey) in billTypePresets" :key="typeKey" :value="typeKey">
                  {{ preset.icon }} {{ preset.name }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('bill.billNumber') }}</label>
                <input v-model="store.billNumber" type="text" />
              </div>
              <div class="form-group">
                <label>{{ t('bill.accountNumber') }}</label>
                <input v-model="store.customer.accountNumber" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('bill.billDate') }}</label>
                <input v-model="store.billDate" type="date" />
              </div>
              <div class="form-group">
                <label>{{ t('bill.dueDate') }}</label>
                <input v-model="store.dueDate" type="date" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('bill.periodStart') }}</label>
                <input v-model="store.billPeriod.startDate" type="date" />
              </div>
              <div class="form-group">
                <label>{{ t('bill.periodEnd') }}</label>
                <input v-model="store.billPeriod.endDate" type="date" />
              </div>
            </div>
          </div>
          <div v-show="activeTab === 'provider'" class="form-section">
            <div class="form-group">
              <label>{{ t('bill.providerName') }}</label>
              <input v-model="store.provider.name" type="text" />
            </div>
            <div class="form-group">
              <label>{{ t('bill.providerTagline') }}</label>
              <input v-model="store.provider.tagline" type="text" placeholder="Your Trusted Energy Partner" />
            </div>
            <div class="form-group">
              <label>{{ t('bill.providerLogo') }}</label>
              <div class="logo-actions">
                <PhotoSelector v-model="store.provider.logo" />
                <span class="or-divider">或</span>
                <input type="file" accept="image/*" @change="handleLogoUpload" />
              </div>
              <div v-if="store.provider.logo" class="image-preview">
                <img :src="store.provider.logo" />
                <button @click="store.provider.logo = ''" class="btn-remove">{{ t('common.delete') }}</button>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('bill.providerAddress') }}</label>
              <textarea v-model="store.provider.address" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('bill.customerService') }}</label>
                <input v-model="store.provider.phone" type="text" />
              </div>
              <div class="form-group">
                <label>{{ t('bill.website') }}</label>
                <input v-model="store.provider.website" type="text" />
              </div>
            </div>
          </div>
          <div v-show="activeTab === 'customer'" class="form-section">
            <div class="form-group">
              <label>{{ t('bill.customerName') }}</label>
              <input v-model="store.customer.name" type="text" />
            </div>
            <div class="form-group">
              <label>{{ t('bill.serviceAddress') }}</label>
              <textarea v-model="store.customer.address" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('bill.city') }}</label>
                <input v-model="store.customer.city" type="text" />
              </div>
              <div class="form-group">
                <label>{{ t('bill.zipCode') }}</label>
                <input v-model="store.customer.zip" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('bill.customerPhone') }}</label>
                <input v-model="store.customer.phone" type="text" />
              </div>
              <div class="form-group">
                <label>{{ t('common.email') }}</label>
                <input v-model="store.customer.email" type="email" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('bill.meterNumber') }}</label>
              <input v-model="store.customer.meterNumber" type="text" />
            </div>
          </div>
          <div v-show="activeTab === 'usage'" class="form-section">
            <!-- 用量历史编辑 -->
            <h4>� 用量历史 (Usage History)</h4>
            <div class="usage-history-grid">
              <div v-for="(item, index) in store.usageHistory" :key="index" class="usage-item">
                <select v-model.number="item.month" class="usage-month">
                  <option v-for="(m, i) in monthOptions" :key="i" :value="i+1">{{ m }}</option>
                </select>
                <input v-model.number="item.usage" type="number" placeholder="用量" class="usage-value" />
                <button @click="store.removeUsageMonth(index)" class="btn-remove-sm">×</button>
              </div>
            </div>
            <button @click="store.addUsageMonth()" class="btn-add" style="margin-bottom: 16px;">+ 添加月份</button>
            
            <div class="usage-stats-row">
              <div class="stat-box">
                <span class="stat-label">月均用量</span>
                <span class="stat-value">{{ store.averageUsage }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">环比变化</span>
                <span class="stat-value" :class="usageChangePercent >= 0 ? 'up' : 'down'">
                  {{ usageChangePercent >= 0 ? '+' : '' }}{{ usageChangePercent }}%
                </span>
              </div>
            </div>


            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
            
            <!-- 上传导入区域 -->
            <ItemsUploader 
              type="utilityBill" 
              :bill-type="store.billType"
              @import="handleChargesImport"
            />
            
            <h4>{{ t('bill.chargeDetails') }}</h4>
            <div v-for="(charge, index) in store.charges" :key="index" class="item-row charge-row">
              <input v-model="charge.description" :placeholder="t('bill.chargeName')" class="flex-2" />
              <input v-model.number="charge.usage" type="number" :placeholder="t('bill.usage')" class="flex-1" @input="autoCalcAmount(charge)" />
              <input v-model="charge.unit" :placeholder="t('bill.unit')" class="flex-1" />
              <input v-model.number="charge.rate" type="number" :placeholder="t('bill.unitPrice')" step="0.0001" class="flex-1" @input="autoCalcAmount(charge)" />
              <input :value="charge.amount.toFixed(2)" type="text" :placeholder="t('bill.amount')" class="flex-1" readonly style="background: #f3f4f6;" />
              <button @click="store.charges.splice(index, 1)" class="btn-remove-sm">×</button>
            </div>
            <button @click="store.addCharge()" class="btn-add">{{ t('bill.addCharge') }}</button>
            
            <div class="form-row" style="margin-top: 16px;">
              <div class="form-group">
                <label>税率 (%)</label>
                <input v-model.number="store.taxRate" type="number" step="0.1" min="0" max="100" />
              </div>
              <div class="form-group">
                <label>{{ t('bill.taxes') }} (自动计算)</label>
                <input :value="store.taxes.toFixed(2)" type="text" readonly style="background: #f3f4f6;" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('bill.serviceFees') }}</label>
              <input v-model.number="store.serviceFees" type="number" step="0.01" />
            </div>
            <div class="form-row" style="margin-top: 12px; align-items: center; gap: 12px;">
              <div class="form-group" style="flex: 1; min-width: 200px;">
                <label>Total Usage</label>
                <div style="display:flex; gap:8px; align-items:center;">
                  <input v-model.number="editableTotalInput" type="number" class="form-input" style="width:140px;" />
                  <span style="min-width:40px;">{{ store.settings.language === 'zh' ? (store.billType === 'electricity' ? 'kWh' : billTypePresets[store.billType].unit) : (store.billType === 'electricity' ? 'kWh' : billTypePresets[store.billType].unit) }}</span>
                  <button @click="resetManualTotal" class="btn-reset">重置</button>
                </div>
              </div>
            </div>
            <div class="summary-box" style="margin-top: 8px;">
              <div class="summary-row">
                <span>小计:</span>
                <span>{{ store.formatCurrency(store.currentCharges) }}</span>
              </div>
              <div class="summary-row">
                <span>税费 ({{ store.taxRate }}%):</span>
                <span>{{ store.formatCurrency(store.taxes) }}</span>
              </div>
              <div class="summary-row">
                <span>服务费:</span>
                <span>{{ store.formatCurrency(store.serviceFees) }}</span>
              </div>
              <div class="summary-row total">
                <strong>{{ t('bill.totalDue') }}:</strong>
                <strong>{{ store.formatCurrency(store.totalAmountDue) }}</strong>
              </div>
            </div>
          </div>
          
          <!-- 支付选项卡 -->
          <div v-show="activeTab === 'payment'" class="form-section">
            <div v-if="!store.paymentCompleted.isPaid" class="payment-form">
              <h4>💳 支付信息</h4>
              <div class="payment-summary">
                <div class="payment-amount">
                  <span class="label">应付金额</span>
                  <span class="amount">{{ store.formatCurrency(store.totalAmountDue) }}</span>
                </div>
                <div class="payment-due">
                  <span class="label">截止日期</span>
                  <span class="date">{{ store.dueDate }}</span>
                </div>
              </div>
              
              <!-- 支付账户信息 -->
              <div class="payment-account-info">
                <h5>📋 账户信息</h5>
                <div class="account-info-grid">
                  <div class="info-item">
                    <span class="info-label">账户名称</span>
                    <span class="info-value">{{ store.customer.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">账户编号</span>
                    <span class="info-value">{{ store.customer.accountNumber }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">服务商</span>
                    <span class="info-value">{{ store.provider.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">账单周期</span>
                    <span class="info-value">{{ store.billPeriod.startDate }} 至 {{ store.billPeriod.endDate }}</span>
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
                  <label class="section-label">🏦 选择银行卡</label>
                  <div class="bank-cards-grid">
                    <div 
                      v-for="card in bankCards" 
                      :key="card.id"
                      :class="['bank-card-item', { active: bankCardInfo.cardNumber === card.cardNumber }]"
                      @click="selectBankCard(card)"
                    >
                      <div class="card-header">
                        <span class="card-brand" :class="'brand-' + card.type.toLowerCase()">{{ card.type }}</span>
                      </div>
                      <div class="card-body">
                        <span class="card-bank">{{ card.bankName }}</span>
                        <span class="card-number">•••• {{ card.cardNumber }}</span>
                      </div>
                      <span v-if="bankCardInfo.cardNumber === card.cardNumber" class="card-selected">✓</span>
                    </div>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>银行名称</label>
                      <input v-model="bankCardInfo.bankName" type="text" placeholder="Bank Name" />
                    </div>
                    <div class="form-group">
                      <label>卡号后四位</label>
                      <input v-model="bankCardInfo.cardNumber" type="text" placeholder="Last 4 digits" maxlength="4" />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>持卡人姓名</label>
                      <input v-model="bankCardInfo.cardHolder" type="text" placeholder="Card Holder Name" />
                    </div>
                    <div class="form-group">
                      <label>有效期</label>
                      <input v-model="bankCardInfo.expiry" type="text" placeholder="MM/YY" />
                    </div>
                  </div>
                </div>
              
              <div class="form-group">
                <label>付款人姓名</label>
                <input v-model="payerName" type="text" :placeholder="store.customer.name" />
              </div>
              
              <button @click="processPayment" class="btn-pay">
                ✅ 确认支付 {{ store.formatCurrency(store.totalAmountDue) }}
              </button>
            </div>
            
            <!-- 支付完成后的界面 -->
            <div v-else class="payment-completed">
              <!-- 可下载的收据区域（包含成功提示） -->
              <div :class="['downloadable-receipt-wrapper', `receipt-size-${receiptSize}`]">
                <div id="utility-payment-receipt" class="receipt-download-content">
                  <div v-if="includeSuccessHeader" class="success-header">
                    <div class="success-icon">✅</div>
                    <h3>支付成功!</h3>
                    <p>感谢您的付款</p>
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
                      <span class="label">账单编号</span>
                      <span class="value">{{ store.billNumber }}</span>
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
                      <span class="value">{{ getPaymentMethodLabel(store.paymentCompleted.paymentMethod) }}<template v-if="paidCardInfo"> ****{{ paidCardInfo.cardNumber }}</template></span>
                    </div>
                    <div v-if="paidCardInfo" class="receipt-row">
                      <span class="label">付款账户</span>
                      <span class="value">{{ paidCardInfo.bankName }}</span>
                    </div>
                    <div class="receipt-row">
                      <span class="label">服务商</span>
                      <span class="value">{{ store.provider.name }}</span>
                    </div>
                    <div class="receipt-row">
                      <span class="label">账户号码</span>
                      <span class="value">{{ store.customer.accountNumber }}</span>
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
              
            <div class="receipt-actions">
              <label class="include-header-option">
                <input type="checkbox" v-model="includeSuccessHeader" />
                <span>包含成功提示 ✅</span>
              </label>
              <div class="size-download-row">
                <PreviewSizeSelector v-model="receiptSize" />
                <button @click="downloadReceipt" class="btn-download-receipt">📥 下载收据</button>
              </div>
              <button @click="resetPaymentStatus" class="btn-reset">🔄 重新生成账单</button>
            </div>
          </div>
          </div>
          
          <div v-show="activeTab === 'settings'" class="form-section">
            <h4>{{ t('bill.templateSelect') }}</h4>
            <div class="template-grid">
              <div v-for="tpl in templateOptionsLocal" :key="tpl.id" :class="['template-card', { active: store.settings.template === tpl.id }]" @click="store.settings.template = tpl.id">
                <span>{{ tpl.name }}</span>
              </div>
            </div>
            <div class="form-row" style="margin-top: 16px;">
              <div class="form-group">
                <label>{{ t('bill.primaryColor') }}</label>
                <input v-model="store.settings.primaryColor" type="color" />
              </div>
              <div class="form-group">
                <label>{{ t('bill.currency') }}</label>
                <CurrencySelector v-model="store.settings.currency" />
              </div>
            </div>
            <div class="form-group" style="margin-top: 16px;">
              <label>预览语言</label>
              <select v-model="store.settings.language">
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
            <h4 style="margin-top: 20px;">{{ t('bill.displayOptions') }}</h4>
            <div class="options-grid">
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showUsageChart" /> {{ t('bill.showUsageChart') }}</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showPaymentOptions" /> {{ t('bill.showPaymentOptions') }}</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showBarcode" /> {{ t('bill.showBarcode') }}</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showQRCode" /> 显示二维码</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showLateFee" /> {{ t('bill.showLateFee') }}</label>
            </div>
            <h4 style="margin-top: 20px;">{{ t('bill.history') }}</h4>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('bill.previousBalance') }}</label>
                <input v-model.number="store.previousBalance" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label>{{ t('bill.payments') }}</label>
                <input v-model.number="store.payments" type="number" step="0.01" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('bill.lateFee') }}</label>
              <input v-model.number="store.lateFee" type="number" step="0.01" />
            </div>
          </div>
          
          <!-- 设计选项卡 -->
          <div v-show="activeTab === 'design'" class="form-section">
            <!-- 水印设置 -->
            <h4>�️ 水印设置</h4>
            <label class="checkbox-option" style="margin-bottom: 12px;">
              <input type="checkbox" v-model="store.designSettings.watermarkEnabled" /> 启用水印
            </label>
            <template v-if="store.designSettings.watermarkEnabled">
              <div class="form-group">
                <label>水印文字</label>
                <input type="text" v-model="store.designSettings.watermarkText" placeholder="OFFICIAL DOCUMENT" />
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
              <div class="form-group">
                <label>水印字体</label>
                <select v-model="store.designSettings.watermarkFontFamily">
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
            </template>
            
            <!-- 字体设置 -->
            <h4 style="margin-top: 20px;">🔤 字体设置</h4>
            <div class="form-group">
              <label>主字体</label>
              <select v-model="store.designSettings.fontFamily">
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                <option value="'SimSun', serif">宋体</option>
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
                  <option value="double">双线</option>
                </select>
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
                <label>条形码内容</label>
                <input type="text" v-model="store.barcodeSettings.barcodeContent" :placeholder="store.billNumber" />
              </div>
            </template>
            
            <!-- 二维码设置 -->
            <h4 style="margin-top: 20px;">📱 二维码设置</h4>
            <label class="checkbox-option" style="margin-bottom: 12px;">
              <input type="checkbox" v-model="store.barcodeSettings.useCustomQR" /> 使用自定义二维码图片
            </label>
            <template v-if="store.barcodeSettings.useCustomQR">
              <div class="form-group">
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
          </div>

          <!-- 数据管理 -->
          <div v-show="activeTab === 'data'" class="form-section">
            <SaveLoadPanel 
              document-type="utility_bill"
              :get-data="() => store.$state"
              :set-data="(data: any) => store.$patch(data)"
            />
          </div>
        </div>
      </div>
      <div class="preview-panel">
        <div class="preview-toolbar">
          <span>{{ t('bill.billPreview') }}</span>
          <div class="toolbar-actions">
            <PreviewSizeSelector v-model="previewSize" />
            <button @click="showEmailModal = true" class="btn-email">📧 {{ t('common.email') }}</button>
            <button @click="showDownloadPanel = true" class="btn-download">📥 {{ t('common.export') }}</button>
          </div>
        </div>
        <div class="preview-container">
          <UtilityBillPreview ref="previewRef" :preview-size="previewSize" />
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`UtilityBill_${store.billNumber}`"
      :default-subject="`${t('bill.billSubject')} - ${store.provider.name}`"
      preview-selector=".utility-bill-preview"
      @close="showEmailModal = false"
    />
    
    <!-- 下载面板 -->
    <DownloadPanel
      :visible="showDownloadPanel"
      :preview-selector="store.paymentCompleted.isPaid ? '.preview-container .payment-receipt' : '.preview-container .bill'"
      :default-file-name="store.paymentCompleted.isPaid ? `PaymentReceipt_${store.paymentCompleted.confirmationNumber}` : `UtilityBill_${store.billNumber}`"
      @close="showDownloadPanel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUtilityBillStore, billTypePresets } from '@/stores/utilityBill'
import UtilityBillPreview from '@/components/UtilityBillPreview.vue'
import EmailModal from '@/components/EmailModal.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ItemsUploader from '@/components/ItemsUploader.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import PreviewSizeSelector, { type PreviewSize } from '@/components/PreviewSizeSelector.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import CurrencySelector from '@/components/CurrencySelector.vue'
import { useI18n } from '@/utils/i18n'
import html2canvas from 'html2canvas'

const store = useUtilityBillStore()
const { t, currentLanguage } = useI18n()
const activeTab = ref('bill')
const previewRef = ref()
const showEmailModal = ref(false)
const showDownloadPanel = ref(false)
const previewSize = ref<PreviewSize>('original')

// 账单类型选择
const selectedBillType = ref(store.billType || 'electricity')

// 独立的收据尺寸控制（用于左边支付完成界面）
const receiptSize = ref<PreviewSize>('original')
const includeSuccessHeader = ref(true) // 是否包含绿色勾选成功提示

// 支付相关
const selectedPaymentMethod = ref('credit_card')
const payerName = ref('')
const showPaymentMethods = ref(false)

// 支付方式分类
const paymentCategories = [
  { key: 'card', label: '💳 银行卡支付' },
  { key: 'bank', label: '🏦 银行转账' },
  { key: 'digital', label: '📱 数字钱包' },
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

// 银行卡信息
const bankCardInfo = ref({
  bankName: 'Chase Bank',
  cardNumber: '4567',
  cardHolder: 'Robert Anderson',
  expiry: '12/28'
})

const bankCards = ref([
  { id: 1, bankName: 'Chase Bank', cardNumber: '4567', cardHolder: 'Robert Anderson', expiry: '12/28', icon: '💳', type: 'Visa' },
  { id: 2, bankName: 'Bank of America', cardNumber: '8899', cardHolder: 'Robert Anderson', expiry: '10/27', icon: '💳', type: 'Mastercard' },
  { id: 3, bankName: 'Wells Fargo', cardNumber: '1234', cardHolder: 'Robert Anderson', expiry: '05/29', icon: '💳', type: 'Visa' },
  { id: 4, bankName: 'Citi Bank', cardNumber: '5678', cardHolder: 'Robert Anderson', expiry: '08/26', icon: '💳', type: 'Amex' },
  { id: 5, bankName: 'Capital One', cardNumber: '9012', cardHolder: 'Robert Anderson', expiry: '03/27', icon: '💳', type: 'Visa' },
  { id: 6, bankName: 'US Bank', cardNumber: '3456', cardHolder: 'Robert Anderson', expiry: '11/28', icon: '💳', type: 'Mastercard' },
  { id: 7, bankName: 'PNC Bank', cardNumber: '7890', cardHolder: 'Robert Anderson', expiry: '06/29', icon: '💳', type: 'Visa' },
  { id: 8, bankName: 'TD Bank', cardNumber: '2345', cardHolder: 'Robert Anderson', expiry: '09/27', icon: '💳', type: 'Mastercard' }
])

const selectBankCard = (card: any) => {
  bankCardInfo.value = { ...card }
}

const paymentMethods = [
  // 银行卡支付
  { value: 'credit_card', label: '信用卡', icon: '💳', category: 'card', desc: 'Visa / Mastercard / Amex' },
  { value: 'debit_card', label: '借记卡', icon: '💳', category: 'card', desc: '储蓄卡即时扣款' },
  // 银行转账
  { value: 'bank_transfer', label: '银行转账', icon: '🏦', category: 'bank', desc: 'ACH / Wire Transfer' },
  { value: 'ach', label: 'ACH转账', icon: '🔄', category: 'bank', desc: '1-3个工作日到账' },
  { value: 'wire', label: '电汇', icon: '🔗', category: 'bank', desc: '当日到账' },
  // 数字钱包
  { value: 'alipay', label: '支付宝', icon: '🔵', category: 'digital', desc: '支付宝账户支付' },
  { value: 'wechat', label: '微信支付', icon: '🟢', category: 'digital', desc: '微信钱包支付' },
  { value: 'apple_pay', label: 'Apple Pay', icon: '🍎', category: 'digital', desc: 'iPhone快捷支付' },
  { value: 'google_pay', label: 'Google Pay', icon: '🔷', category: 'digital', desc: 'Android快捷支付' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️', category: 'digital', desc: 'PayPal账户支付' },
  { value: 'venmo', label: 'Venmo', icon: '📲', category: 'digital', desc: 'Venmo社交支付' },
  { value: 'zelle', label: 'Zelle', icon: '⚡', category: 'digital', desc: '银行间即时转账' },
  // 其他方式
  { value: 'autopay', label: '自动扣款', icon: '🔄', category: 'other', desc: '设置自动付款' },
  { value: 'check', label: '支票', icon: '📝', category: 'other', desc: '邮寄纸质支票' },
  { value: 'cash', label: '现金', icon: '💵', category: 'other', desc: '营业厅现金支付' },
  { value: 'money_order', label: '汇票', icon: '📄', category: 'other', desc: '银行汇票支付' }
]

const getPaymentMethodLabel = (method: string) => {
  return paymentMethods.find(m => m.value === method)?.label || method
}

// 用量变化百分比
const usageChangePercent = computed(() => {
  if (store.usageHistory.length < 2) return 0
  const current = store.usageHistory[store.usageHistory.length - 1]?.usage || 0
  const previous = store.usageHistory[store.usageHistory.length - 2]?.usage || 0
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
})

// 月份选择项（本地化）——使用全局语言设置 `currentLanguage`
const monthOptions = computed(() => {
  return currentLanguage.value === 'zh'
    ? ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
})

// 可编辑的总用量（左侧编辑区使用）
const editableTotalInput = computed<number>({
  get() {
    // 如果用户手动覆盖，优先返回手动值，否则返回 store 的自动计算值
    return Number(store.manualTotalUsage ?? store.totalUsage)
  },
  set(v: number) {
    if (!Number.isFinite(Number(v))) {
      store.manualTotalUsage = null
    } else {
      store.manualTotalUsage = Math.round(Number(v))
    }
  }
})

const resetManualTotal = () => {
  store.manualTotalUsage = null
}

// 自动计算费用金额
const autoCalcAmount = (charge: any) => {
  if (charge.usage && charge.rate) {
    charge.amount = Number((charge.usage * charge.rate).toFixed(2))
  }
}

// 保存支付时的银行卡信息
const paidCardInfo = ref<{bankName: string, cardNumber: string} | null>(null)

// 处理支付
const processPayment = () => {
  store.paymentCompleted.payerName = payerName.value || store.customer.name
  // 保存银行卡信息
  if (['credit_card', 'debit_card'].includes(selectedPaymentMethod.value)) {
    paidCardInfo.value = {
      bankName: bankCardInfo.value.bankName,
      cardNumber: bankCardInfo.value.cardNumber
    }
  }
  store.completePayment(selectedPaymentMethod.value)
}

// 重置支付状态
const resetPaymentStatus = () => {
  store.resetPayment()
  payerName.value = ''
  paidCardInfo.value = null
}

// 独立下载收据函数（直接下载左边支付成功界面的收据）
const downloadReceipt = async () => {
  const element = document.getElementById('utility-payment-receipt')
  if (!element) {
    console.error('找不到收据元素')
    return
  }
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    const link = document.createElement('a')
    link.download = `UtilityBillReceipt_${store.paymentCompleted.confirmationNumber}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('下载收据失败:', error)
  }
}

const localizedTabs = computed(() => [
  { key: 'bill', label: t('bill.billInfo') },
  { key: 'provider', label: t('bill.provider') },
  { key: 'customer', label: t('bill.customer') },
  { key: 'usage', label: t('bill.usageCharges') },
  { key: 'payment', label: '💳 支付' },
  { key: 'settings', label: t('common.settings') },
  { key: 'design', label: '设计' },
  { key: 'data', label: '数据管理' }
])

const templateOptionsLocal = computed(() => [
  { id: 'modern', name: t('bill.templateModern') },
  { id: 'classic', name: t('bill.templateClassic') },
  { id: 'utility', name: t('bill.templateUtility') },
  { id: 'minimal', name: t('bill.templateMinimal') }
])

const handleLogoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.provider.logo = e.target?.result as string }
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

const handleQRUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.barcodeSettings.customQRImage = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const handleChargesImport = (data: any[]) => {
  // 清空现有费用项目
  store.charges = []
  // 导入新费用项目
  data.forEach(row => {
    store.addCharge()
    const charge = store.charges[store.charges.length - 1]
    charge.description = row.description || row['费用名称'] || ''
    charge.usage = parseFloat(row.usage || row['用量'] || 0)
    charge.unit = row.unit || row['单位'] || ''
    charge.rate = parseFloat(row.rate || row['单价'] || 0)
    charge.amount = parseFloat(row.amount || row['金额'] || 0) || (charge.usage * charge.rate)
  })
}
</script>

<style scoped>
.utility-bill-view { height: 100%; display: flex; flex-direction: column; }
.view-content { flex: 1; display: flex; gap: 24px; padding: 24px; overflow: hidden; }
.edit-panel { flex: 5; min-width: 0; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; overflow: hidden; }
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
.form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
h4 { margin: 0 0 12px 0; font-size: 14px; color: #374151; }
.image-preview { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
.image-preview img { width: 80px; height: 50px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
.btn-remove { padding: 4px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
.item-row { display: flex; gap: 8px; margin-bottom: 8px; }
.item-row input { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
.item-row input:first-child { flex: 2; }
.btn-remove-sm { width: 32px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 18px; }
.btn-add { padding: 10px; background: #eff6ff; color: #2563eb; border: 1px dashed #2563eb; border-radius: 8px; font-size: 13px; cursor: pointer; width: 100%; }
.summary-box { padding: 12px 16px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border-radius: 8px; }
.template-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.template-card { padding: 12px 8px; border: 2px solid #e5e7eb; border-radius: 8px; text-align: center; font-size: 12px; cursor: pointer; }
.template-card:hover { border-color: #2563eb; }
.template-card.active { border-color: #2563eb; background: #eff6ff; }
.bill-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.bill-type-card { padding: 12px 8px; border: 2px solid #e5e7eb; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bill-type-card:hover { border-color: #2563eb; background: #f8fafc; }
.bill-type-card.active { border-color: #2563eb; background: #eff6ff; }
.bill-type-card .type-icon { font-size: 24px; }
.bill-type-card .type-name { font-size: 12px; color: #374151; }
.options-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.checkbox-option { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
.preview-panel { flex: 5; min-width: 0; display: flex; flex-direction: column; background: #f1f5f9; border-radius: 16px; overflow: hidden; }
.preview-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-bottom: 1px solid #e5e7eb; }
.preview-toolbar span { font-size: 14px; font-weight: 600; }
.toolbar-actions { display: flex; gap: 10px; }
.btn-email { padding: 10px 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-email:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
.btn-download { padding: 10px 20px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.preview-container { flex: 1; padding: 24px; overflow: auto; display: flex; justify-content: center; align-items: flex-start; }

/* 用量历史编辑样式 */
.usage-history-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
.usage-item { display: flex; gap: 4px; align-items: center; }
.usage-item .usage-month { width: 60px; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; text-align: center; }
.usage-item .usage-value { flex: 1; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
.usage-stats-row { display: flex; gap: 12px; margin-bottom: 8px; }
.stat-box { flex: 1; padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
.stat-box .stat-label { display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px; }
.stat-box .stat-value { display: block; font-size: 18px; font-weight: 700; color: #1f2937; }
.stat-box .stat-value.up { color: #dc2626; }
.stat-box .stat-value.down { color: #16a34a; }

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
  gap: 8px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.saved-card-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.saved-card-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 1px #3b82f6;
}

.card-icon-wrapper {
  width: 32px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 12px;
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

/* 汇总框样式增强 */
.summary-box .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
.summary-box .summary-row.total { border-top: 1px solid rgba(255,255,255,0.3); margin-top: 8px; padding-top: 8px; font-size: 15px; }

/* 支付相关样式 */
.payment-form { max-width: 100%; }
.payment-summary { display: flex; gap: 16px; margin-bottom: 20px; }
.payment-amount, .payment-due { flex: 1; padding: 16px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 12px; text-align: center; }
.payment-amount .label, .payment-due .label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.payment-amount .amount { display: block; font-size: 28px; font-weight: 700; color: #2563eb; }
.payment-due .date { display: block; font-size: 16px; font-weight: 600; color: #1f2937; }

.payment-methods { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.method-card { display: flex; flex-direction: column; align-items: center; padding: 12px 8px; border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.method-card:hover { border-color: #2563eb; background: #f8fafc; }
.method-card.active { border-color: #2563eb; background: #eff6ff; }
.method-card input { display: none; }
.method-icon { font-size: 24px; margin-bottom: 4px; }
.method-name { font-size: 11px; color: #374151; font-weight: 500; }

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

/* 银行卡网格样式 */
.bank-card-selection {
  margin-top: 16px;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.bank-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.bank-card-item {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 14px;
  background: linear-gradient(135deg, #fafafa, #f0f0f0);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.bank-card-item:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.bank-card-item.active {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #2563eb;
}

.bank-card-item .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.bank-card-item .card-icon {
  font-size: 20px;
}

.bank-card-item .card-type {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  padding: 2px 8px;
  background: white;
  border-radius: 4px;
  text-transform: uppercase;
}

.bank-card-item .card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bank-card-item .card-bank {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.bank-card-item .card-number {
  font-size: 11px;
  color: #64748b;
  font-family: monospace;
}

.bank-card-item .card-selected {
  position: absolute;
  top: 8px;
  right: 8px;
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

/* 账户信息卡片样式 */
.payment-account-info {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 20px;
}

.payment-account-info h5 {
  margin: 0 0 14px 0;
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.account-info-grid {
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

.btn-pay { width: 100%; padding: 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px; transition: all 0.2s; }
.btn-pay:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4); }

/* 支付完成界面 */
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
</style>
