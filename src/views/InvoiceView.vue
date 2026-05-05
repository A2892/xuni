<template>
  <div class="invoice-view">
    <div class="view-content">
      <div class="edit-panel">
        <div class="panel-header">
          <h2>🧾 发票生成器</h2>
          <p>创建专业商业发票</p>
        </div>
        
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab" :class="['tab', { active: activeTab === tab }]" @click="activeTab = tab">
            {{ tab }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 发票信息 -->
          <div v-show="activeTab === '发票信息'" class="form-section">
            <!-- 发票类型选择 -->
            <div class="form-group">
              <div class="invoice-type-header" @click="showInvoiceTypes = !showInvoiceTypes">
                <label>发票类型: <span class="current-type">{{ currentInvoiceTypeLabel }}</span></label>
                <span class="toggle-icon">{{ showInvoiceTypes ? '▲' : '▼' }}</span>
              </div>
              <div v-show="showInvoiceTypes" class="invoice-type-grid">
                <div 
                  v-for="(preset, typeKey) in invoiceTypePresets" 
                  :key="typeKey"
                  :class="['invoice-type-card', { active: store.invoiceType === typeKey }]"
                  @click="store.applyInvoiceTypePreset(typeKey); showInvoiceTypes = false"
                >
                  <span class="type-icon">{{ preset.icon }}</span>
                  <span class="type-name">{{ preset.name }}</span>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>发票编号</label>
                <div class="input-with-btn">
                  <input v-model="store.invoiceNumber" type="text" />
                  <button @click="store.generateInvoiceNumber" class="btn-generate">生成</button>
                </div>
              </div>
              <div class="form-group">
                <label>状态</label>
                <select v-model="store.status">
                  <option value="draft">草稿</option>
                  <option value="sent">已发送</option>
                  <option value="paid">已支付</option>
                  <option value="overdue">逾期</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>发票日期</label>
                <input v-model="store.invoiceDate" type="date" />
              </div>
              <div class="form-group">
                <label>到期日期</label>
                <input v-model="store.dueDate" type="date" />
              </div>
            </div>
            <div class="form-group">
              <label>货币</label>
              <CurrencySelector v-model="store.currency" />
            </div>
          </div>

          <!-- 公司信息 -->
          <div v-show="activeTab === '公司信息'" class="form-section">
            <div class="form-group">
              <label>公司Logo</label>
              <div class="upload-with-selector">
                <MediaSelector 
                  v-model="store.company.logo"
                  type="logo"
                  :show-all-media="true"
                  button-text="从媒体库选择"
                  modal-title="选择 Logo"
                  icon="🏢"
                />
                <div class="upload-divider">或</div>
                <input type="file" accept="image/*" @change="handleLogoUpload" />
              </div>
            </div>
            <div class="form-group">
              <label>公司名称</label>
              <input v-model="store.company.name" type="text" />
            </div>
            <div class="form-group">
              <label>地址</label>
              <input v-model="store.company.address" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>城市</label>
                <input v-model="store.company.city" type="text" />
              </div>
              <div class="form-group">
                <label>州/省</label>
                <input v-model="store.company.state" type="text" />
              </div>
              <div class="form-group">
                <label>邮编</label>
                <input v-model="store.company.zip" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>电话</label>
                <input v-model="store.company.phone" type="text" />
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input v-model="store.company.email" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>网站</label>
              <input v-model="store.company.website" type="text" />
            </div>
            <div class="form-group">
              <label>税号</label>
              <input v-model="store.company.taxId" type="text" />
            </div>
            <h4>银行信息</h4>
            <div class="form-group">
              <label>银行名称</label>
              <input v-model="store.company.bankName" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>账户号码</label>
                <input v-model="store.company.bankAccount" type="text" />
              </div>
              <div class="form-group">
                <label>Routing Number</label>
                <input v-model="store.company.bankRouting" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>SWIFT Code</label>
              <input v-model="store.company.swiftCode" type="text" />
            </div>
          </div>

          <!-- 客户信息 -->
          <div v-show="activeTab === '客户信息'" class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>客户姓名</label>
                <input v-model="store.client.name" type="text" />
              </div>
              <div class="form-group">
                <label>公司名称</label>
                <input v-model="store.client.company" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>地址</label>
              <input v-model="store.client.address" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>城市</label>
                <input v-model="store.client.city" type="text" />
              </div>
              <div class="form-group">
                <label>州/省</label>
                <input v-model="store.client.state" type="text" />
              </div>
              <div class="form-group">
                <label>邮编</label>
                <input v-model="store.client.zip" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>电话</label>
                <input v-model="store.client.phone" type="text" />
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input v-model="store.client.email" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>税号</label>
              <input v-model="store.client.taxId" type="text" />
            </div>
          </div>

          <!-- 项目明细 -->
          <div v-show="activeTab === '项目明细'" class="form-section">
            <!-- 上传导入区域 -->
            <ItemsUploader 
              type="invoice" 
              @import="handleItemsImport"
            />
            
            <div class="items-list">
              <div v-for="(item, index) in store.items" :key="item.id" class="item-card">
                <div class="item-header">
                  <span>项目 {{ index + 1 }}</span>
                  <div class="item-actions">
                    <button @click="store.duplicateItem(item.id)" class="btn-duplicate" title="复制">📋</button>
                    <button @click="store.removeItem(item.id)" class="btn-remove">删除</button>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group" style="flex: 1;">
                    <label>SKU/产品编号</label>
                    <input v-model="item.sku" type="text" placeholder="SKU-001" />
                  </div>
                  <div class="form-group" style="flex: 2;">
                    <label>分类</label>
                    <input v-model="item.category" type="text" placeholder="产品分类" list="category-list" />
                    <datalist id="category-list">
                      <option value="Services">服务</option>
                      <option value="Products">产品</option>
                      <option value="Consulting">咨询</option>
                      <option value="Software">软件</option>
                      <option value="Hardware">硬件</option>
                      <option value="Subscription">订阅</option>
                      <option value="Maintenance">维护</option>
                      <option value="Shipping">运输</option>
                      <option value="Other">其他</option>
                    </datalist>
                  </div>
                </div>
                <div class="form-group">
                  <label>描述</label>
                  <input v-model="item.description" type="text" placeholder="服务或产品描述" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>数量</label>
                    <input v-model.number="item.quantity" type="number" min="1" step="1" />
                  </div>
                  <div class="form-group">
                    <label>单位</label>
                    <select v-model="item.unit">
                      <option value="pcs">件/个</option>
                      <option value="unit">单位</option>
                      <option value="hour">小时</option>
                      <option value="day">天</option>
                      <option value="month">月</option>
                      <option value="year">年</option>
                      <option value="kg">公斤</option>
                      <option value="lot">批</option>
                      <option value="set">套</option>
                      <option value="box">箱</option>
                      <option value="package">包装</option>
                      <option value="project">项目</option>
                      <option value="service">服务</option>
                      <option value="license">许可证</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>单价</label>
                    <input v-model.number="item.unitPrice" type="number" step="0.01" min="0" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>税率 (%)</label>
                    <input v-model.number="item.tax" type="number" step="0.1" min="0" max="100" />
                  </div>
                  <div class="form-group">
                    <label>折扣 (%)</label>
                    <input v-model.number="item.discount" type="number" step="0.1" min="0" max="100" />
                  </div>
                </div>
                <div class="form-group">
                  <label>备注</label>
                  <input v-model="item.notes" type="text" placeholder="项目备注（可选）" />
                </div>
                <div class="item-total">
                  <span class="item-subtotal">小计: {{ store.formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100)) }}</span>
                  <span class="item-tax">含税: {{ store.formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100) * (1 + item.tax / 100)) }}</span>
                </div>
              </div>
            </div>
            <button @click="store.addItem" class="btn-add-item">+ 添加项目</button>
            
            <div class="totals-summary">
              <div class="summary-row">
                <span>小计</span>
                <span>{{ store.formatCurrency(store.subtotal) }}</span>
              </div>
              <div class="summary-row">
                <span>折扣</span>
                <span>-{{ store.formatCurrency(store.discountTotal) }}</span>
              </div>
              <div class="summary-row">
                <span>税费</span>
                <span>{{ store.formatCurrency(store.taxTotal) }}</span>
              </div>
              <div class="summary-row total">
                <span>总计</span>
                <span>{{ store.formatCurrency(store.total) }}</span>
              </div>
            </div>
          </div>

          <!-- 付款信息 -->
          <div v-show="activeTab === '付款信息'" class="form-section">
            <div class="section-header">
              <h4>💳 银行转账信息</h4>
              <button @click="store.syncPaymentInfoFromCompany" class="btn-sync" title="从公司信息同步">
                🔄 从公司信息同步
              </button>
            </div>
            <div class="form-group">
              <label>银行名称</label>
              <input v-model="store.paymentInfo.bankName" type="text" placeholder="Chase Bank" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>账户号码</label>
                <input v-model="store.paymentInfo.accountNumber" type="text" placeholder="****4567" />
              </div>
              <div class="form-group">
                <label>Routing Number</label>
                <input v-model="store.paymentInfo.routingNumber" type="text" placeholder="021000021" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>SWIFT/BIC</label>
                <input v-model="store.paymentInfo.swiftCode" type="text" placeholder="CHASUS33" />
              </div>
              <div class="form-group">
                <label>IBAN (可选)</label>
                <input v-model="store.paymentInfo.iban" type="text" placeholder="GB82 WEST 1234 5698 7654 32" />
              </div>
            </div>
            
            <h4 style="margin-top: 24px;">📱 其他付款方式</h4>
            <div class="form-group">
              <label>PayPal 邮箱</label>
              <input v-model="store.paymentInfo.paypalEmail" type="email" placeholder="payment@company.com" />
            </div>
            <div class="form-group">
              <label>其他付款方式</label>
              <input v-model="store.paymentInfo.otherPaymentMethod" type="text" placeholder="Venmo, Zelle, 支付宝等" />
            </div>
            <div class="form-group">
              <label>付款说明</label>
              <textarea v-model="store.paymentInfo.paymentNotes" rows="3" placeholder="请在转账时备注发票编号..."></textarea>
            </div>
          </div>

          <!-- 支付选项卡 -->
          <div v-show="activeTab === '💳 支付'" class="form-section">
            <div v-if="!store.paymentCompleted.isPaid" class="payment-form">
              <h4>💳 发票支付</h4>
              <div class="payment-summary">
                <div class="payment-amount">
                  <span class="label">应付总额</span>
                  <span class="amount">{{ store.formatCurrency(store.total) }}</span>
                </div>
                <div class="payment-due">
                  <span class="label">到期日期</span>
                  <span class="date">{{ store.dueDate }}</span>
                </div>
              </div>
              
              <!-- 价格明细 -->
              <div class="price-breakdown">
                <h5>价格明细</h5>
                <div class="breakdown-row">
                  <span>小计</span>
                  <span>{{ store.formatCurrency(store.subtotal) }}</span>
                </div>
                <div class="breakdown-row">
                  <span>折扣</span>
                  <span>-{{ store.formatCurrency(store.discountTotal) }}</span>
                </div>
                <div class="breakdown-row">
                  <span>税费</span>
                  <span>{{ store.formatCurrency(store.taxTotal) }}</span>
                </div>
                <div class="breakdown-row total">
                  <strong>合计</strong>
                  <strong>{{ store.formatCurrency(store.total) }}</strong>
                </div>
              </div>
              
              <div class="form-group">
                <label>支付方式</label>
                <!-- 折叠式支付方式选择器 -->
                <div class="payment-method-selector">
                  <div class="selected-method" @click="showPaymentMethods = !showPaymentMethods">
                    <div class="method-display">
                      <span class="method-name">{{ selectedMethodInfo.label }}</span>
                    </div>
                    <span class="dropdown-arrow" :class="{ open: showPaymentMethods }">▼</span>
                  </div>
                  <transition name="slide">
                    <div v-show="showPaymentMethods" class="payment-methods-dropdown">
                      <div class="methods-grid">
                        <div 
                          v-for="method in paymentMethods" 
                          :key="method.value"
                          :class="['method-option', { active: selectedPaymentMethod === method.value }]"
                          @click="selectPaymentMethod(method.value)"
                        >
                          <span class="method-name">{{ method.label }}</span>
                          <span v-if="selectedPaymentMethod === method.value" class="check-mark">✓</span>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>

                <!-- 银行卡选择 -->
                <div v-if="selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card'" class="bank-card-selection">
                  <label style="margin-bottom: 10px; display: block;">选择银行卡</label>
                  <div class="saved-cards">
                    <div 
                      v-for="card in bankCards" 
                      :key="card.id"
                      :class="['saved-card-item', { active: bankCardInfo.cardNumber === card.cardNumber }]"
                      @click="selectBankCard(card)"
                    >
                      <span class="card-brand" :class="'brand-' + (card.type || 'visa').toLowerCase()">{{ card.type || 'Visa' }}</span>
                      <div class="card-info">
                        <span class="card-name">{{ card.bankName }}</span>
                        <span class="card-number">•••• {{ card.cardNumber }}</span>
                      </div>
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
              </div>
              
              <div class="form-group">
                <label>付款人姓名</label>
                <input v-model="payerName" type="text" :placeholder="store.client.name" />
              </div>
              
              <button @click="processPayment" class="btn-pay">
                ✅ 确认支付 {{ store.formatCurrency(store.total) }}
              </button>
            </div>
            
            <!-- 支付完成后的界面 -->
            <div v-else class="payment-completed">
              <div class="receipt-export-panel">
                <h4>📥 下载收据</h4>
                <label class="include-header-option">
                  <input type="checkbox" v-model="includeSuccessHeader" />
                  <span>包含成功提示 ✅</span>
                </label>
                <div class="export-controls-inline">
                  <PreviewSizeSelector v-model="receiptPreviewSize" />
                  <div class="export-options-inline">
                    <button @click="showDownloadPanel = true" class="btn-download-receipt">{{ isExportingReceipt ? '生成中...' : '下载收据' }}</button>

                    <DownloadPanel
                      :visible="showDownloadPanel"
                      :preview-selector="'#receipt-download-area'"
                      :default-file-name="`Receipt_${store.invoiceNumber || Date.now()}`"
                      :default-format="'png'"
                      :default-quality="4"
                      @close="showDownloadPanel = false"
                    />
                  </div>
                </div>
              </div>

              <!-- 收据预览区域 -->
              <div class="receipt-preview-container" :class="`preview-size-${receiptPreviewSize}`">
                <!-- iPhone 框架模式 -->
                <IPhoneFrame v-if="receiptPreviewSize === 'iphone'" :show-status-bar="true" :show-home-indicator="true">
                  <div id="receipt-download-area" class="receipt-content-iphone">
                    <div v-if="includeSuccessHeader" class="success-header">
                      <div class="success-icon">✅</div>
                      <h3>支付成功!</h3>
                      <p>发票已支付完成</p>
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
                          <span class="label">发票编号</span>
                          <span class="value">{{ store.invoiceNumber }}</span>
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
                          <span class="label">收款方</span>
                          <span class="value">{{ store.company.name }}</span>
                        </div>
                        <div class="receipt-row">
                          <span class="label">客户</span>
                          <span class="value">{{ store.client.name }}</span>
                        </div>
                        <hr />
                        <div class="receipt-row total">
                          <span class="label">支付金额</span>
                          <span class="value amount">{{ store.formatCurrency(store.paymentCompleted.paidAmount) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </IPhoneFrame>
                
                <!-- 普通模式 -->
                <div v-else id="receipt-download-area" class="receipt-content-normal" :class="`size-${receiptPreviewSize}`">
                  <div v-if="includeSuccessHeader" class="success-header">
                    <div class="success-icon">✅</div>
                    <h3>支付成功!</h3>
                    <p>发票已支付完成</p>
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
                        <span class="label">发票编号</span>
                        <span class="value">{{ store.invoiceNumber }}</span>
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
                        <span class="value">{{ getPaymentMethodLabel(store.paymentCompleted.paymentMethod) }}</span>
                      </div>
                      <div v-if="store.paymentCompleted.paymentMethod === 'credit_card' || store.paymentCompleted.paymentMethod === 'debit_card'" class="receipt-row">
                        <span class="label">付款账户</span>
                        <span class="value">{{ bankCardInfo.bankName }} ({{ bankCardInfo.cardNumber }})</span>
                      </div>
                      <div class="receipt-row">
                        <span class="label">收款方</span>
                        <span class="value">{{ store.company.name }}</span>
                      </div>
                      <div class="receipt-row">
                        <span class="label">客户</span>
                        <span class="value">{{ store.client.name }}</span>
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
                <button @click="resetPaymentStatus" class="btn-reset">🔄 重新生成发票</button>
              </div>
            </div>
          </div>

          <!-- 备注条款 -->
          <div v-show="activeTab === '备注条款'" class="form-section">
            <div class="form-group">
              <label>备注</label>
              <textarea v-model="store.notes" rows="4" placeholder="感谢您的惠顾！"></textarea>
            </div>
            <div class="form-group">
              <label>付款条款</label>
              <textarea v-model="store.terms" rows="6" placeholder="付款条款和条件..."></textarea>
            </div>
          </div>

          <!-- 设置 -->
          <div v-show="activeTab === '设置'" class="form-section">
            <h4>模板选择</h4>
            <div class="template-grid">
              <div v-for="template in templates" :key="template.id" :class="['template-card', { active: store.settings.template === template.id }]" @click="store.settings.template = template.id">
                <div class="template-preview" :style="{ background: template.color }">{{ template.name }}</div>
              </div>
            </div>
            <div class="form-row" style="margin-top: 20px;">
              <div class="form-group">
                <label>主题色</label>
                <input v-model="store.settings.primaryColor" type="color" />
              </div>
              <div class="form-group">
                <label>预览语言</label>
                <select v-model="store.settings.language">
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </div>
              <div class="form-group">
                <label>默认发票货币</label>
                <div style="display:flex;align-items:center;gap:8px;">
                  <CurrencySelector v-model="store.settings.defaultInvoiceCurrency" />
                  <button class="btn" @click="applyDefaultCurrency">应用到当前发票</button>
                </div>
              </div>
            </div>
            <div class="options-grid">
              <label class="checkbox-option">
                <input type="checkbox" v-model="store.settings.showLogo" /> 显示Logo
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="store.settings.showBankDetails" /> 显示银行信息
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="store.settings.showTaxBreakdown" /> 显示税费明细
              </label>
            </div>
          </div>

          <!-- 设计 -->
          <div v-show="activeTab === '设计'" class="form-section">
            <!-- 水印设置 -->
            <h4>💧 水印设置</h4>
            <label class="checkbox-option" style="margin-bottom: 12px;">
              <input type="checkbox" v-model="store.designSettings.watermarkEnabled" /> 启用水印
            </label>
            <template v-if="store.designSettings.watermarkEnabled">
              <div class="form-group">
                <label>水印文字</label>
                <input type="text" v-model="store.designSettings.watermarkText" placeholder="INVOICE" />
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
                <option value="'Georgia', serif">Georgia</option>
                <option value="'Helvetica Neue', sans-serif">Helvetica</option>
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
            
            <!-- 条形码/二维码设置 -->
            <h4 style="margin-top: 20px;">📊 条形码/二维码</h4>
            <div class="options-grid" style="margin-bottom: 12px;">
              <label class="checkbox-option">
                <input type="checkbox" v-model="store.barcodeSettings.showBarcode" /> 显示条形码
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="store.barcodeSettings.showQRCode" /> 显示二维码
              </label>
            </div>
            <label class="checkbox-option" style="margin-bottom: 12px;">
              <input type="checkbox" v-model="store.barcodeSettings.useCustomBarcode" /> 使用自定义图片
            </label>
            <template v-if="store.barcodeSettings.useCustomBarcode">
              <div class="form-group">
                <label>上传条形码图片</label>
                <div class="upload-with-selector">
                  <PhotoSelector v-model="store.barcodeSettings.customBarcodeImage" />
                  <div class="upload-divider">或</div>
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
              <div class="form-group" style="margin-top: 12px;">
                <label>上传二维码图片</label>
                <div class="upload-with-selector">
                  <PhotoSelector v-model="store.barcodeSettings.customQRImage" />
                  <div class="upload-divider">或</div>
                  <MediaSelector 
                    v-model="store.barcodeSettings.customQRImage"
                    type="qrcode"
                    button-text="从媒体库选择"
                    modal-title="选择二维码"
                    icon="📱"
                  />
                  <div class="upload-divider">或</div>
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
                <input type="text" v-model="store.barcodeSettings.barcodeContent" :placeholder="store.invoiceNumber" />
              </div>
            </template>
          </div>

          <!-- 数据管理 -->
          <div v-show="activeTab === '数据管理'" class="form-section">
            <SaveLoadPanel 
              document-type="invoice"
              :get-data="() => store.$state"
              :set-data="(data: any) => store.$patch(data)"
            />
          </div>
        </div>
      </div>

      <div class="preview-panel">
        <div class="preview-toolbar">
          <span>发票预览</span>
          <div class="toolbar-actions">
            <PreviewSizeSelector v-model="previewSize" />
            <button @click="showEmailModal = true" class="btn-email">
              📧 发送邮件
            </button>
            <div class="export-options">
              <button @click="showDownloadPanel = true" class="btn-download">{{ isExporting ? '生成中...' : '📥 导出' }}</button>

              <DownloadPanel
                :visible="showDownloadPanel"
                :preview-selector="'.invoice-preview, .preview-container .invoice-preview'"
                :default-file-name="`Invoice_${store.invoiceNumber || Date.now()}`"
                :default-format="'pdf'"
                :default-quality="4"
                @close="showDownloadPanel = false"
              />
            </div>
          </div>
        </div>
        <div class="preview-container">
          <InvoicePreview ref="previewRef" :preview-size="previewSize" :key="store.currency" />
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`Invoice_${store.invoiceNumber}`"
      :default-subject="`发票 ${store.invoiceNumber} - ${store.company.name}`"
      preview-selector=".invoice-preview, .preview-container .invoice-preview"
      @close="showEmailModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { watch, nextTick } from 'vue'
import { useInvoiceStore, invoiceTypePresets, currencyOptions, type InvoiceType } from '@/stores/invoice'
import InvoicePreview from '@/components/InvoicePreview.vue'
import CurrencySelector from '@/components/CurrencySelector.vue'
import PreviewSizeSelector, { type PreviewSize } from '@/components/PreviewSizeSelector.vue'
import EmailModal from '@/components/EmailModal.vue'
import ItemsUploader from '@/components/ItemsUploader.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import IPhoneFrame from '@/components/IPhoneFrame.vue'
import MediaSelector from '@/components/MediaSelector.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useInvoiceStore()
const activeTab = ref('发票信息')
const tabs = ['发票信息', '公司信息', '客户信息', '项目明细', '付款信息', '💳 支付', '备注条款', '设置', '设计', '数据管理']
const previewRef = ref()
const isExporting = ref(false)
const showEmailModal = ref(false)
const showDownloadPanel = ref(false)
const exportFormat = ref('PDF')
const exportQuality = ref('高清质量')
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

// 当前选中的支付方式信息
const selectedMethodInfo = computed(() => {
  return paymentMethods.find(m => m.value === selectedPaymentMethod.value) || paymentMethods[0]
})

// 选择支付方式
const selectPaymentMethod = (value: string) => {
  selectedPaymentMethod.value = value
  showPaymentMethods.value = false
}

const showInvoiceTypes = ref(false)
const currentInvoiceTypeLabel = computed(() => {
  return invoiceTypePresets[store.invoiceType]?.name || '选择发票类型'
})

// 银行卡信息
const bankCardInfo = ref({
  bankName: 'Chase Bank',
  cardNumber: '4567',
  cardHolder: 'Jane Doe',
  expiry: '12/28'
})

const bankCards = ref([
  { id: 1, bankName: 'Chase Bank', cardNumber: '4567', cardHolder: 'Jane Doe', expiry: '12/28', icon: '💳', type: 'Visa' },
  { id: 2, bankName: 'Bank of America', cardNumber: '8899', cardHolder: 'Jane Doe', expiry: '10/27', icon: '💳', type: 'Mastercard' },
  { id: 3, bankName: 'Wells Fargo', cardNumber: '1234', cardHolder: 'Jane Doe', expiry: '05/29', icon: '💳', type: 'Visa' },
  { id: 4, bankName: 'Citi Bank', cardNumber: '5678', cardHolder: 'Jane Doe', expiry: '08/26', icon: '💳', type: 'Amex' },
  { id: 5, bankName: 'Capital One', cardNumber: '9012', cardHolder: 'Jane Doe', expiry: '03/27', icon: '💳', type: 'Visa' },
  { id: 6, bankName: 'US Bank', cardNumber: '3456', cardHolder: 'Jane Doe', expiry: '11/28', icon: '💳', type: 'Mastercard' },
  { id: 7, bankName: 'PNC Bank', cardNumber: '7890', cardHolder: 'Jane Doe', expiry: '06/29', icon: '💳', type: 'Visa' },
  { id: 8, bankName: 'TD Bank', cardNumber: '2345', cardHolder: 'Jane Doe', expiry: '09/27', icon: '💳', type: 'Mastercard' }
])

const selectBankCard = (card: any) => {
  bankCardInfo.value = { ...card }
}

const paymentMethods = [
  { value: 'credit_card', label: '信用卡', icon: '💳', category: 'card' },
  { value: 'debit_card', label: '借记卡', icon: '💳', category: 'card' },
  { value: 'bank_transfer', label: '银行转账', icon: '🏦', category: 'bank' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️', category: 'digital' },
  { value: 'venmo', label: 'Venmo', icon: '📱', category: 'digital' },
  { value: 'zelle', label: 'Zelle', icon: '⚡', category: 'digital' },
  { value: 'alipay', label: '支付宝', icon: '🔵', category: 'digital' },
  { value: 'wechat', label: '微信支付', icon: '🟢', category: 'digital' },
  { value: 'apple_pay', label: 'Apple Pay', icon: '🍎', category: 'digital' },
  { value: 'google_pay', label: 'Google Pay', icon: '🔷', category: 'digital' },
  { value: 'check', label: '支票', icon: '📝', category: 'other' },
  { value: 'cash', label: '现金', icon: '💵', category: 'other' },
  { value: 'crypto', label: '加密货币', icon: '₿', category: 'other' },
  { value: 'wire', label: '电汇', icon: '🔗', category: 'bank' }
]

const getPaymentMethodLabel = (method: string) => {
  return paymentMethods.find(m => m.value === method)?.label || method
}

// 保存支付时的银行卡信息
const paidCardInfo = ref<{bankName: string, cardNumber: string} | null>(null)

const processPayment = () => {
  const name = payerName.value || store.client.name
  // 保存银行卡信息
  if (['credit_card', 'debit_card'].includes(selectedPaymentMethod.value)) {
    paidCardInfo.value = {
      bankName: bankCardInfo.value.bankName,
      cardNumber: bankCardInfo.value.cardNumber
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

// Apply default invoice currency from settings to current invoice
const applyDefaultCurrency = () => {
  try {
    console.log('Applying defaultInvoiceCurrency', store.settings.defaultInvoiceCurrency, 'current', store.currency)
    store.currency = store.settings.defaultInvoiceCurrency || store.currency
    console.log('Applied currency ->', store.currency)
    // force nextTick to ensure preview remount via key
    nextTick(() => {})
  } catch (e) {
    console.error('applyDefaultCurrency error', e)
  }
}

// Automatically apply when settings.defaultInvoiceCurrency changes (helps debugging)
watch(() => store.settings.defaultInvoiceCurrency, (val, oldVal) => {
  console.log('settings.defaultInvoiceCurrency changed', oldVal, '->', val)
  if (val && val !== store.currency) {
    store.currency = val
    // small tick to ensure components update
    nextTick(() => console.log('store.currency updated to', store.currency))
  }
})

const templates = [
  { id: 'modern', name: 'Modern', color: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
  { id: 'classic', name: 'Classic', color: 'linear-gradient(135deg, #1f2937, #374151)' },
  { id: 'minimal', name: 'Minimal', color: 'linear-gradient(135deg, #6b7280, #9ca3af)' },
  { id: 'corporate', name: 'Corporate', color: 'linear-gradient(135deg, #0f766e, #14b8a6)' },
  { id: 'creative', name: 'Creative', color: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }
]

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.company.logo = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleItemsImport = (data: any[]) => {
  // 清空现有项目
  store.items = []
  // 导入新项目
  data.forEach(row => {
    store.addItem()
    const item = store.items[store.items.length - 1]
    item.description = row.description || row['描述'] || ''
    item.quantity = parseFloat(row.quantity || row['数量'] || 1)
    item.unitPrice = parseFloat(row.unitPrice || row.price || row['单价'] || 0)
    item.tax = parseFloat(row.tax || row['税率'] || 0)
    item.discount = parseFloat(row.discount || row['折扣'] || 0)
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

function downloadInvoice() {
  showDownloadPanel.value = true
}
// 下载收据
const downloadReceipt = async () => {
  // 选择包含支付成功和收据的完整区域
  // 使用统一导出面板处理收据导出
  showDownloadPanel.value = true
}
</script>

<style scoped>
.invoice-view { height: 100%; display: flex; flex-direction: column; }
.view-content { flex: 1; display: flex; gap: 24px; padding: 24px; overflow: hidden; }
.edit-panel { flex: 4; min-width: 300px; max-width: 45%; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; overflow: hidden; }
.preview-panel { flex: 6; }
.panel-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.panel-header h2 { margin: 0 0 4px 0; font-size: 20px; }
.panel-header p { margin: 0; font-size: 13px; color: #6b7280; }
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
.input-with-btn { display: flex; gap: 8px; }
.input-with-btn input { flex: 1; }
.btn-generate { padding: 10px 16px; background: #e5e7eb; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
.item-card { background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #e5e7eb; }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; }
.btn-remove { padding: 4px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
.image-preview { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
.image-preview img { width: 80px; height: 50px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
.item-total { text-align: right; font-weight: 600; color: #2563eb; margin-top: 8px; }
.btn-add-item { width: 100%; padding: 12px; border: 2px dashed #d1d5db; background: transparent; color: #6b7280; font-size: 14px; border-radius: 12px; cursor: pointer; }
.btn-add-item:hover { border-color: #2563eb; color: #2563eb; }
.totals-summary { margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 12px; }
.summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
.summary-row.total { border-top: 2px solid #e5e7eb; margin-top: 8px; padding-top: 16px; font-size: 18px; font-weight: 700; color: #2563eb; }
.template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.template-card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 8px; cursor: pointer; }
.template-card.active { border-color: #2563eb; }
.template-preview { height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px; }
.options-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
.checkbox-option { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
h4 { margin: 20px 0 12px 0; font-size: 14px; color: #374151; }

/* 付款信息区域样式 */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.section-header h4 { margin: 0; }
.btn-sync { padding: 6px 12px; background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.btn-sync:hover { background: #e0f2fe; border-color: #7dd3fc; }

/* 发票类型选择器样式 */
.invoice-type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.invoice-type-card { display: flex; flex-direction: column; align-items: center; padding: 12px 8px; border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: center; }
.invoice-type-card:hover { border-color: #2563eb; background: #f8fafc; }
.invoice-type-card.active { border-color: #2563eb; background: #eff6ff; }
.invoice-type-card .type-icon { font-size: 24px; margin-bottom: 4px; }
.invoice-type-card .type-name { font-size: 11px; font-weight: 500; color: #374151; }
.preview-panel { flex: 1; display: flex; flex-direction: column; background: #f1f5f9; border-radius: 16px; overflow: hidden; }
.preview-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-bottom: 1px solid #e5e7eb; }
.preview-toolbar span { font-size: 14px; font-weight: 600; }
.toolbar-actions { display: flex; gap: 10px; }
.btn-email { padding: 10px 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-email:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
.export-options { display: flex; gap: 8px; align-items: center; }
.format-select, .quality-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; background: white; cursor: pointer; }
.format-select:focus, .quality-select:focus { outline: none; border-color: #2563eb; }
.btn-download { padding: 10px 20px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-download:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); }
.btn-download:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.preview-container { flex: 1; padding: 24px; overflow: auto; display: flex; justify-content: center; }

/* 支付功能样式 */
.payment-form { display: flex; flex-direction: column; gap: 20px; }
.payment-summary { background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 16px; padding: 24px; }
.payment-summary h3 { font-size: 18px; color: #1e293b; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.price-breakdown { display: flex; flex-direction: column; gap: 12px; }
.price-row { display: flex; justify-content: space-between; font-size: 14px; color: #64748b; }
.price-row.total { font-size: 20px; font-weight: 700; color: #2563eb; border-top: 2px solid #cbd5e1; padding-top: 12px; margin-top: 8px; }

/* 折叠式支付方式选择器样式 */
.payment-method-selector {
  position: relative;
}

.selected-method {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.selected-method:hover {
  border-color: #2563eb;
  background: #f8fafc;
}

.method-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-display .method-icon {
  font-size: 24px;
}

.method-display .method-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
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
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
  padding: 12px;
  max-height: 320px;
  overflow-y: auto;
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.method-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  background: #f8fafc;
}

.method-option:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  transform: translateY(-2px);
}

.method-option.active {
  background: #eff6ff;
  border-color: #2563eb;
}

.method-option .method-icon {
  font-size: 24px;
}

.method-option .method-name {
  font-size: 11px;
  font-weight: 500;
  color: #475569;
  text-align: center;
}

.method-option .check-mark {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
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

.payment-methods h4 { font-size: 14px; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.method-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.method-card:hover { border-color: #2563eb; background: #f8fafc; transform: translateY(-2px); }
.method-card.selected { border-color: #2563eb; background: #eff6ff; }
.method-card .method-icon { font-size: 28px; }
.method-card .method-name { font-size: 12px; font-weight: 500; color: #475569; }
.payer-info { margin-top: 20px; }
.payer-info label { font-size: 13px; font-weight: 500; color: #374151; display: block; margin-bottom: 6px; }
.payer-info input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
.btn-pay { width: 100%; padding: 16px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 20px; }
.btn-pay:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4); }
.btn-pay:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
.payment-completed { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 20px; }
.success-animation { font-size: 64px; animation: successPop 0.5s ease-out; }
@keyframes successPop { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
.payment-completed h3 { font-size: 24px; color: #16a34a; margin: 0; }
.receipt-card { width: 100%; max-width: 400px; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
.receipt-header { text-align: center; padding-bottom: 16px; border-bottom: 2px dashed #e5e7eb; margin-bottom: 16px; }
.receipt-header h4 { font-size: 18px; color: #1e293b; margin: 0 0 4px 0; }
.receipt-header p { font-size: 12px; color: #64748b; margin: 0; }
.receipt-details { display: flex; flex-direction: column; gap: 12px; }
.receipt-row { display: flex; justify-content: space-between; font-size: 14px; }
.receipt-row .label { color: #64748b; }
.receipt-row .value { color: #1e293b; font-weight: 500; }
.receipt-row.total { font-size: 18px; font-weight: 700; color: #2563eb; border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 8px; }
.payment-actions { display: flex; gap: 12px; width: 100%; max-width: 400px; }
.payment-actions .btn { flex: 1; padding: 12px; border: none; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-new-payment { background: #f1f5f9; color: #475569; }
.btn-new-payment:hover { background: #e2e8f0; }
.btn-download-receipt { padding: 8px 16px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-download-receipt:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); }
.btn-download-receipt:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* 收据导出面板样式 */
.receipt-export-panel { width: 100%; background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.receipt-export-panel h4 { margin: 0 0 12px 0; font-size: 14px; color: #374151; }
.include-header-option { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; cursor: pointer; margin-bottom: 12px; padding: 8px 12px; background: #e0f2fe; border-radius: 8px; transition: all 0.2s; }
.include-header-option:hover { background: #bae6fd; }
.include-header-option input { width: 16px; height: 16px; accent-color: #10b981; }
.export-controls-inline { display: flex; flex-direction: column; gap: 12px; }
.export-options-inline { display: flex; gap: 8px; flex-wrap: wrap; }
.export-options-inline .format-select,
.export-options-inline .quality-select { flex: 1; min-width: 100px; }

/* 收据预览容器样式 */
.receipt-preview-container { 
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #f1f5f9;
  border-radius: 12px;
  overflow: auto;
}

.receipt-preview-container.preview-size-mobile { 
  background: linear-gradient(to bottom, #1a1a2e, #16213e);
  padding: 40px 20px;
}

.receipt-preview-container.preview-size-iphone { 
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
  padding: 30px;
  min-height: 600px;
  align-items: flex-start;
}

.receipt-preview-container.preview-size-desktop { 
  background: #e2e8f0;
  padding: 30px;
}

/* 收据内容样式 - iPhone模式 */
.receipt-content-iphone {
  width: 100%;
  background: #f8fafc;
  min-height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 收据内容样式 - 普通模式 */
.receipt-content-normal {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.receipt-content-normal.size-mobile {
  width: 375px;
  max-width: 100%;
  transform: scale(1);
  border-radius: 24px;
  box-shadow: 0 0 0 8px #1a1a2e, 0 20px 60px rgba(0,0,0,0.4);
}

.receipt-content-normal.size-desktop {
  width: 600px;
  max-width: 100%;
  padding: 40px;
}

.receipt-content-normal.size-original {
  width: auto;
  min-width: 360px;
  max-width: 450px;
}

/* 成功头部样式 */
.receipt-content-iphone .success-header,
.receipt-content-normal .success-header {
  text-align: center;
  padding: 16px 0;
}

.receipt-content-iphone .success-icon,
.receipt-content-normal .success-icon {
  font-size: 56px;
  margin-bottom: 12px;
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.receipt-content-iphone .success-header h3,
.receipt-content-normal .success-header h3 {
  font-size: 22px;
  color: #16a34a;
  margin: 0 0 4px 0;
}

.receipt-content-iphone .success-header p,
.receipt-content-normal .success-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* 收据卡片样式 */
.receipt-content-iphone .receipt-card,
.receipt-content-normal .receipt-card {
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.receipt-content-iphone .receipt-card .receipt-header,
.receipt-content-normal .receipt-card .receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e5e7eb;
  margin-bottom: 16px;
}

.receipt-content-iphone .receipt-card .receipt-title,
.receipt-content-normal .receipt-card .receipt-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.receipt-content-iphone .receipt-card .receipt-badge,
.receipt-content-normal .receipt-card .receipt-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #16a34a;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
}

.receipt-content-iphone .receipt-card .receipt-body,
.receipt-content-normal .receipt-card .receipt-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.receipt-content-iphone .receipt-card .receipt-row,
.receipt-content-normal .receipt-card .receipt-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.receipt-content-iphone .receipt-card .receipt-row .label,
.receipt-content-normal .receipt-card .receipt-row .label {
  color: #64748b;
}

.receipt-content-iphone .receipt-card .receipt-row .value,
.receipt-content-normal .receipt-card .receipt-row .value {
  color: #1e293b;
  font-weight: 500;
  text-align: right;
}

.receipt-content-iphone .receipt-card .receipt-row .value.confirmation,
.receipt-content-normal .receipt-card .receipt-row .value.confirmation {
  font-family: 'SF Mono', 'Monaco', monospace;
  color: #2563eb;
}

.receipt-content-iphone .receipt-card .receipt-row.total,
.receipt-content-normal .receipt-card .receipt-row.total {
  font-size: 16px;
  font-weight: 600;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 2px solid #e5e7eb;
}

.receipt-content-iphone .receipt-card .receipt-row .value.amount,
.receipt-content-normal .receipt-card .receipt-row .value.amount {
  color: #16a34a;
  font-size: 18px;
}

.receipt-content-iphone .receipt-card hr,
.receipt-content-normal .receipt-card hr {
  border: none;
  border-top: 1px dashed #e5e7eb;
  margin: 8px 0;
}

/* 收据操作按钮 */
.receipt-actions {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.btn-reset {
  padding: 12px 24px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.invoice-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.invoice-type-header:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.invoice-type-header label {
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-type {
  font-weight: 600;
  color: #2563eb;
}

.toggle-icon {
  font-size: 12px;
  color: #64748b;
}

.bank-card-selection {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.saved-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.saved-card-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.saved-card-item:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.saved-card-item.active {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.card-icon {
  font-size: 20px;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-name {
  font-weight: 500;
  font-size: 14px;
  color: #1e293b;
}

.card-number {
  font-size: 12px;
  color: #64748b;
}
</style>
