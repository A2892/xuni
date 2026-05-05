<template>
  <div class="bank-statement-view">
    <div class="view-content">
      <!-- 左侧：编辑面板 -->
      <div class="edit-panel">
        <SaveLoadPanel 
          document-type="bank_statement" 
          :get-data="() => bankStore.$state" 
          :set-data="(data) => bankStore.$patch(data)"
        />
        
        <!-- 视图模式切换 -->
        <div class="view-mode-selector">
          <button 
            :class="['mode-btn', { active: bankStore.viewMode === 'single' }]"
            @click="bankStore.setViewMode('single')"
          >
            单个账户
          </button>
          <button 
            :class="['mode-btn', { active: bankStore.viewMode === 'consolidated' }]"
            @click="bankStore.setViewMode('consolidated')"
          >
            汇总对账单
          </button>
          <button 
            :class="['mode-btn', { active: bankStore.viewMode === 'report' }]"
            @click="bankStore.setViewMode('report')"
          >
            📊 报告
          </button>
        </div>
        
        <div class="tabs">
          <button
            v-for="tab in currentTabs"
            :key="tab"
            :class="['tab', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 报告设置标签页 -->
          <div v-show="activeTab === '报告设置' && bankStore.viewMode === 'report'" class="form-section">
            <h4>📊 报告类型</h4>
            <div class="report-type-selector">
              <label class="report-type-option" :class="{ active: reportType === 'annual' }">
                <input type="radio" v-model="reportType" value="annual" />
                <div class="option-content">
                  <span class="option-icon">📅</span>
                  <span class="option-label">年度报告</span>
                </div>
              </label>
              <label class="report-type-option" :class="{ active: reportType === 'monthly' }">
                <input type="radio" v-model="reportType" value="monthly" />
                <div class="option-content">
                  <span class="option-icon">🗓️</span>
                  <span class="option-label">月度报告</span>
                </div>
              </label>
              <label class="report-type-option" :class="{ active: reportType === 'custom' }">
                <input type="radio" v-model="reportType" value="custom" />
                <div class="option-content">
                  <span class="option-icon">⚙️</span>
                  <span class="option-label">自定义时段</span>
                </div>
              </label>
            </div>

            <div class="report-period-config">
              <div v-if="reportType === 'annual'" class="form-group">
                <label>选择年份</label>
                <select v-model="reportYear">
                  <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
                </select>
              </div>
              
              <div v-if="reportType === 'monthly'" class="form-row">
                <div class="form-group">
                  <label>选择年份</label>
                  <select v-model="reportYear">
                    <option v-for="year in availableYears" :key="year" :value="year">{{ year }}年</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>选择月份</label>
                  <select v-model="reportMonth">
                    <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
                  </select>
                </div>
              </div>
              
              <div v-if="reportType === 'custom'" class="form-row">
                <div class="form-group">
                  <label>开始日期</label>
                  <input type="date" v-model="reportStartDate" />
                </div>
                <div class="form-group">
                  <label>结束日期</label>
                  <input type="date" v-model="reportEndDate" />
                </div>
              </div>
            </div>

            <h4 style="margin-top: 20px;">📈 报告内容</h4>
            <div class="report-options">
              <label class="checkbox-option">
                <input type="checkbox" v-model="reportOptions.showSummary" />
                <span>收支汇总</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="reportOptions.showTrends" />
                <span>趋势图表</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="reportOptions.showCategories" />
                <span>分类分析</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="reportOptions.showTopMerchants" />
                <span>热门商户</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="reportOptions.showComparison" />
                <span>同期对比</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="reportOptions.showInsights" />
                <span>财务洞察</span>
              </label>
            </div>

            <h4 style="margin-top: 20px;">🎨 报告样式</h4>
            <div class="form-group">
              <label>报告标题</label>
              <input type="text" v-model="reportTitle" placeholder="输入自定义标题" />
            </div>
            <div class="form-group">
              <label>主题颜色</label>
              <div class="color-presets">
                <button 
                  v-for="color in colorPresets" 
                  :key="color.primary" 
                  class="color-preset-btn"
                  :class="{ active: reportTheme.primary === color.primary }"
                  :style="{ background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})` }"
                  @click="reportTheme = color"
                ></button>
              </div>
            </div>

            <h4 style="margin-top: 20px;">📝 页脚设置</h4>
            <div class="form-group">
              <label>页脚说明文本</label>
              <textarea v-model="reportFooterText" rows="2" placeholder="This report is automatically generated for reference only."></textarea>
            </div>
            <div class="form-group">
              <label>生成信息</label>
              <input type="text" v-model="reportFooterGenerated" placeholder="Generated: Jan 1, 2024, 12:00 PM" />
            </div>
          </div>
          <!-- 汇总管理标签页 -->
          <div v-show="activeTab === '账户管理'" class="form-section">
            <div class="accounts-manager">
              <h4>当前账户 (主账户)</h4>
              <div class="current-account-card">
                <div class="account-info">
                  <div class="account-name">{{ bankStore.cardInfo.bank }} - {{ bankStore.cardInfo.cardHolder }}</div>
                  <div class="account-number">{{ bankStore.cardInfo.cardNumber }}</div>
                </div>
              </div>
              
              <h4 style="margin-top: 20px;">其他账户</h4>
              <div v-if="bankStore.accounts.length === 0" class="empty-state">
                暂无其他账户，点击下方按钮添加
              </div>
              <div v-else class="accounts-list">
                <div v-for="account in bankStore.accounts" :key="account.id" class="account-card">
                  <div class="account-info">
                    <div class="account-name">{{ account.cardInfo.bank }} - {{ account.cardInfo.cardHolder }}</div>
                    <div class="account-number">{{ account.cardInfo.cardNumber }}</div>
                    <div class="account-stats">
                      {{ account.transactions.length }} 笔交易
                    </div>
                  </div>
                  <div class="account-actions">
                    <button @click="editAccount(account)" class="btn-edit-small">编辑</button>
                    <button @click="removeAccount(account.id)" class="btn-remove-small">删除</button>
                  </div>
                </div>
              </div>
              <button @click="showAddAccountModal = true" class="btn-add-account">+ 添加新账户</button>
            </div>
          </div>
          
          <!-- 卡片信息标签页 -->
          <div v-show="activeTab === '卡片信息'" class="form-section">
            <div class="form-group">
              <label>卡号</label>
              <input v-model="bankStore.cardInfo.cardNumber" type="text" placeholder="4532 **** **** 1234" />
            </div>
            <div class="form-group">
              <label>持卡人</label>
              <input v-model="bankStore.cardInfo.cardHolder" type="text" placeholder="ZHANG SAN" />
            </div>
            <div class="form-group">
              <label>持卡人照片</label>
              <PhotoSelector 
                v-model="bankStore.cardInfo.cardHolderPhoto"
                @photo-selected="handlePhotoSelected"
              />
              <div style="margin-top: 10px;">
                <input type="file" accept="image/*" @change="handlePhotoUpload" />
                <p class="help-text" style="margin-top: 5px; font-size: 12px; color: #666;">从照片库选择或本地上传</p>
              </div>
              <div v-if="bankStore.cardInfo.cardHolderPhoto" class="photo-preview">
                <img :src="bankStore.cardInfo.cardHolderPhoto" alt="Card Holder" />
                <button @click="bankStore.cardInfo.cardHolderPhoto = ''" class="btn-remove-photo">删除</button>
              </div>
            </div>
            <div class="form-group">
              <label>发卡银行</label>
              <input v-model="bankStore.cardInfo.bank" type="text" placeholder="Chase Bank" />
            </div>
            <div class="form-group">
              <label>分行名称</label>
              <input v-model="bankStore.cardInfo.branch" type="text" placeholder="New York Main Branch" />
            </div>
            <div class="form-group">
              <label>银行地址</label>
              <input v-model="bankStore.cardInfo.bankAddress" type="text" placeholder="270 Park Avenue, New York, NY 10017" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>银行电话</label>
                <input v-model="bankStore.cardInfo.bankPhone" type="text" placeholder="1-800-935-9935" />
              </div>
              <div class="form-group">
                <label>银行网站</label>
                <input v-model="bankStore.cardInfo.bankWebsite" type="text" placeholder="www.chase.com" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>账户类型</label>
                <input v-model="bankStore.cardInfo.accountType" type="text" placeholder="Checking Account" />
              </div>
              <div class="form-group">
                <label>账户状态</label>
                <input v-model="bankStore.cardInfo.status" type="text" placeholder="Active" />
              </div>
            </div>
            <div class="form-group">
              <label>IBAN</label>
              <input v-model="bankStore.cardInfo.iban" type="text" placeholder="US12 3456 7890 1234 5678" />
            </div>
            <div class="form-group">
              <label>SWIFT/BIC</label>
              <input v-model="bankStore.cardInfo.swift" type="text" placeholder="CHASUS33" />
            </div>
            <div class="form-group">
              <label>卡类型</label>
              <select v-model="bankStore.cardInfo.cardType">
                <optgroup label="Visa">
                  <option value="visa">Visa</option>
                  <option value="visa_infinite">Visa Infinite</option>
                  <option value="visa_signature">Visa Signature</option>
                  <option value="visa_platinum">Visa Platinum</option>
                  <option value="visa_gold">Visa Gold</option>
                  <option value="visa_debit">Visa Debit</option>
                </optgroup>
                <optgroup label="Mastercard">
                  <option value="mastercard">Mastercard</option>
                  <option value="mastercard_world_elite">Mastercard World Elite</option>
                  <option value="mastercard_world">Mastercard World</option>
                  <option value="mastercard_platinum">Mastercard Platinum</option>
                  <option value="mastercard_gold">Mastercard Gold</option>
                </optgroup>
                <optgroup label="American Express">
                  <option value="amex">American Express</option>
                  <option value="amex_centurion">Amex Centurion (黑卡)</option>
                  <option value="amex_platinum">Amex Platinum</option>
                  <option value="amex_gold">Amex Gold</option>
                  <option value="amex_green">Amex Green</option>
                </optgroup>
                <optgroup label="银联 UnionPay">
                  <option value="unionpay">银联</option>
                  <option value="unionpay_diamond">银联钻石卡</option>
                  <option value="unionpay_platinum">银联白金卡</option>
                </optgroup>
                <optgroup label="其他">
                  <option value="discover">Discover</option>
                  <option value="diners">Diners Club</option>
                  <option value="jcb">JCB</option>
                </optgroup>
              </select>
            </div>
            <div class="form-group">
              <label>有效期</label>
              <input v-model="bankStore.cardInfo.expiryDate" type="text" placeholder="12/2025" />
            </div>
            <div class="form-group">
              <label>账单地址</label>
              <textarea v-model="bankStore.cardInfo.billingAddress" rows="2" placeholder="123 Main St, New York, NY 10001, USA"></textarea>
            </div>
            <div class="form-group">
              <label>货币</label>
              <CurrencySelector v-model="bankStore.cardInfo.currency" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>期初余额 
                  <button 
                    @click="handleAutoFillOpeningBalance" 
                    class="auto-fill-btn" 
                    title="自动填充：基于上月或去年同期的期末余额"
                    :disabled="isAutoFilling"
                  >
                    {{ isAutoFilling ? '计算中...' : '🔄 自动计算' }}
                  </button>
                </label>
                <input v-model.number="bankStore.cardInfo.openingBalance" type="number" step="0.01" />
                <small v-if="openingBalanceHint" :class="['balance-hint', openingBalanceHintType]">{{ openingBalanceHint }}</small>
              </div>
              <div class="form-group">
                <label>期末余额 <span style="font-size: 11px; color: #6b7280; font-weight: normal;">(自动计算)</span></label>
                <input :value="bankStore.calculatedClosingBalance.toFixed(2)" type="text" readonly style="background: #f3f4f6; cursor: not-allowed;" />
                <small style="color: #6b7280; font-size: 11px; margin-top: 4px;">期初 + 收入 + 利息 - 支出</small>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>本期利息</label>
                <input v-model.number="bankStore.cardInfo.interestEarned" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label>年度累计利息 (YTD)</label>
                <input v-model.number="bankStore.cardInfo.interestYTD" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <!-- 交易记录标签页 -->
          <div v-show="activeTab === '交易记录'" class="form-section">
            <!-- Import/Export Section -->
            <div class="import-export-section" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px dashed #ced4da;">
              <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #495057;">批量导入/导出</h4>
              <div class="action-buttons" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                <button @click="downloadTemplate" class="btn-secondary" style="padding: 8px 12px; font-size: 13px; background: white; border: 1px solid #ced4da; border-radius: 4px; cursor: pointer;">
                  📥 下载Excel模版
                </button>
                <StudentDocumentPicker 
                  button-text="从资料管理导入"
                  title="从资料管理选择银行账单"
                  :accept="['pdf', 'xlsx', 'xls', 'docx', 'jpg', 'jpeg', 'png']"
                  @select="handleDocumentSelect"
                />
                <label class="btn-secondary" style="padding: 8px 12px; font-size: 13px; background: white; border: 1px solid #ced4da; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center;">
                  <span v-if="isProcessing">🔄 处理中...</span>
                  <span v-else>📤 上传文件识别 (Excel/PDF/Word/图片)</span>
                  <input type="file" @change="handleFileUpload" accept=".xlsx,.xls,.pdf,.docx,.png,.jpg,.jpeg" style="display: none;" :disabled="isProcessing" />
                </label>
                <button @click="handleClearAllTransactions" class="btn-danger" style="padding: 8px 12px; font-size: 13px; background: #ff4d4f; color: white; border: 1px solid #ff4d4f; border-radius: 4px; cursor: pointer;" v-if="bankStore.transactions.length > 0">
                  🗑️ 一键删除所有交易
                </button>
              </div>
            </div>

            <div class="transactions-list">
              <div v-for="(transaction, index) in bankStore.allTransactions" :key="transaction.id" class="transaction-item">
                <div class="transaction-header">
                  <span class="transaction-number">交易 #{{ index + 1 }}</span>
                  <div class="header-actions">
                    <button @click="toggleTransactionDetails(transaction.id)" class="btn-toggle-details">
                      {{ expandedTransactions.includes(transaction.id) ? '📖 收起详情' : '📋 展开详情' }}
                    </button>
                    <button @click="bankStore.removeTransaction(transaction.id)" class="btn-remove">删除</button>
                  </div>
                </div>
                
                <!-- 基本信息 -->
                <div class="form-row">
                  <div class="form-group">
                    <label>日期</label>
                    <input v-model="transaction.date" type="date" />
                  </div>
                  <div class="form-group">
                    <label>时间</label>
                    <input v-model="transaction.time" type="time" step="1" placeholder="14:30:00" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>商户名称</label>
                    <input v-model="transaction.merchant" type="text" placeholder="Amazon.com" />
                  </div>
                  <div class="form-group">
                    <label>金额</label>
                    <input v-model.number="transaction.amount" type="number" step="0.01" />
                  </div>
                  <div class="form-group">
                    <label>卡号后四位</label>
                    <input v-model="transaction.cardNumber" type="text" placeholder="1234" maxlength="4" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>交易地点</label>
                    <input v-model="transaction.location" type="text" placeholder="New York, NY" />
                  </div>
                  <div class="form-group">
                    <label>交易代码</label>
                    <input v-model="transaction.code" type="text" placeholder="POS/ATM/TRF" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>类别</label>
                    <select v-model="transaction.category">
                      <option value="Income">收入 (Income)</option>
                      <option value="Housing">住房 (Housing)</option>
                      <option value="Auto & Transport">汽车与交通 (Auto & Transport)</option>
                      <option value="Shopping">购物 (Shopping)</option>
                      <option value="Food & Dining">餐饮 (Food & Dining)</option>
                      <option value="Travel">旅行 (Travel)</option>
                      <option value="Groceries">超市杂货 (Groceries)</option>
                      <option value="Electronics">电子产品 (Electronics)</option>
                      <option value="Entertainment">娱乐 (Entertainment)</option>
                      <option value="Health & Fitness">健康健身 (Health & Fitness)</option>
                      <option value="Personal Care">个人护理 (Personal Care)</option>
                      <option value="Home & Garden">家居 (Home & Garden)</option>
                      <option value="Services">服务 (Services)</option>
                      <option value="Charity">慈善 (Charity)</option>
                      <option value="Education">教育 (Education)</option>
                      <option value="Transportation">交通 (Transportation)</option>
                      <option value="Utilities">公用事业 (Utilities)</option>
                      <option value="Cash Withdrawal">取现 (Cash Withdrawal)</option>
                      <option value="Interest">利息 (Interest)</option>
                      <option value="Transfer">转账 (Transfer)</option>
                      <option value="Fee">手续费 (Fee)</option>
                      <option value="Refund">退款 (Refund)</option>
                      <option value="Other">其他 (Other)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>状态</label>
                    <select v-model="transaction.status">
                      <option value="completed">已完成 (Completed)</option>
                      <option value="pending">处理中 (Pending)</option>
                      <option value="failed">失败 (Failed)</option>
                    </select>
                  </div>
                </div>
                
                <!-- 展开的详细信息 -->
                <div v-if="expandedTransactions.includes(transaction.id)" class="transaction-details-expanded">
                  <div class="details-section">
                    <h5>📍 交易位置与渠道</h5>
                    <div class="form-row">
                      <div class="form-group">
                        <label>交易地点</label>
                        <input v-model="transaction.location" type="text" placeholder="New York, NY" />
                      </div>
                      <div class="form-group">
                        <label>交易渠道</label>
                        <select v-model="transaction.channel">
                          <option value="atm">ATM 自动取款机</option>
                          <option value="pos">POS 刷卡消费</option>
                          <option value="online">网上银行</option>
                          <option value="mobile">手机银行</option>
                          <option value="branch">柜台办理</option>
                          <option value="wire">电汇</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div class="details-section">
                    <h5>💳 卡片与交易类型</h5>
                    <div class="form-row">
                      <div class="form-group">
                        <label>交易类型</label>
                        <select v-model="transaction.transactionType">
                          <option value="debit">借记 (Debit)</option>
                          <option value="credit">贷记 (Credit)</option>
                          <option value="transfer">转账 (Transfer)</option>
                          <option value="fee">手续费 (Fee)</option>
                          <option value="interest">利息 (Interest)</option>
                          <option value="refund">退款 (Refund)</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>交易代码</label>
                        <input v-model="transaction.code" type="text" placeholder="POS/ATM/TRF" />
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>卡类型</label>
                        <input v-model="transaction.cardType" type="text" placeholder="Visa" />
                      </div>
                      <div class="form-group">
                        <label>卡号后四位</label>
                        <input v-model="transaction.cardNumber" type="text" placeholder="1234" maxlength="4" />
                      </div>
                    </div>
                  </div>
                  
                  <div class="details-section">
                    <h5>🏦 对方账户信息</h5>
                    <div class="form-row">
                      <div class="form-group">
                        <label>对方账户名</label>
                        <input v-model="transaction.counterpartyName" type="text" placeholder="张三" />
                      </div>
                      <div class="form-group">
                        <label>对方账号</label>
                        <input v-model="transaction.counterpartyAccount" type="text" placeholder="****5678" />
                      </div>
                    </div>
                  </div>
                  
                  <div class="details-section">
                    <h5>📝 交易详情</h5>
                    <div class="form-row">
                      <div class="form-group">
                        <label>参考号</label>
                        <input v-model="transaction.referenceNumber" type="text" placeholder="TXN20240115143215" />
                      </div>
                      <div class="form-group">
                        <label>交易后余额</label>
                        <input v-model.number="transaction.balanceAfter" type="number" step="0.01" placeholder="4910.01" />
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>手续费</label>
                        <input v-model.number="transaction.fee" type="number" step="0.01" placeholder="0.00" />
                      </div>
                      <div class="form-group">
                        <label>汇率 (外币)</label>
                        <input v-model.number="transaction.exchangeRate" type="number" step="0.0001" placeholder="1.0000" />
                      </div>
                    </div>
                    <div class="form-group">
                      <label>交易描述</label>
                      <input v-model="transaction.description" type="text" placeholder="Electronics - Wireless Headphones" />
                    </div>
                    <div class="form-group">
                      <label>备注</label>
                      <textarea v-model="transaction.notes" rows="2" placeholder="添加交易备注..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button @click="addNewTransaction" class="btn-add-transaction">+ 添加交易记录</button>
          </div>

          <!-- 设置标签页 -->
          <div v-show="activeTab === '设置'" class="form-section">
            <div class="form-group">
              <label>账单周期类型</label>
              <select v-model="bankStore.settings.periodType">
                <option value="monthly">月度账单</option>
                <option value="yearly">年度账单</option>
                <option value="custom">自定义时间段</option>
              </select>
            </div>
            <div v-if="bankStore.settings.periodType === 'monthly'" class="form-group">
              <label>选择月份</label>
              <input v-model="bankStore.settings.statementPeriod" type="month" />
            </div>
            <div v-else-if="bankStore.settings.periodType === 'yearly'" class="form-group">
              <label>选择年份</label>
              <input v-model="bankStore.settings.statementPeriod" type="number" min="2000" max="2099" placeholder="2024" />
            </div>
            <div v-else class="form-row">
              <div class="form-group">
                <label>开始日期</label>
                <input v-model="bankStore.settings.customStartDate" type="date" />
              </div>
              <div class="form-group">
                <label>结束日期</label>
                <input v-model="bankStore.settings.customEndDate" type="date" />
              </div>
            </div>
            <div class="form-group">
              <label>日期格式</label>
              <select v-model="bankStore.settings.dateFormat">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div class="form-group">
              <label>语言</label>
              <select v-model="bankStore.settings.language">
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
            <div class="form-group">
              <label>银行公告/备注</label>
              <textarea v-model="bankStore.settings.bankMessage" rows="3" placeholder="IMPORTANT: Please review your statement..."></textarea>
            </div>
            <div class="form-group">
              <label>页脚声明文字</label>
              <input v-model="bankStore.settings.footerText" type="text" placeholder="This is an official bank statement..." />
            </div>
            <div class="form-group">
              <label>页脚联系方式</label>
              <input v-model="bankStore.settings.footerContact" type="text" placeholder="For inquiries, please contact..." />
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="bankStore.settings.showLogo" type="checkbox" />
                显示银行Logo
              </label>
            </div>
            <div v-if="bankStore.settings.showLogo" class="form-group">
              <label>上传Logo</label>
              <div class="logo-actions">
                <PhotoSelector v-model="bankStore.settings.logoUrl" />
                <span class="or-divider">或</span>
                <input type="file" accept="image/*" @change="handleLogoUpload" />
              </div>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="bankStore.settings.showWatermark" type="checkbox" />
                显示水印
              </label>
            </div>
            <div v-if="bankStore.settings.showWatermark" class="form-group">
              <label>水印文字</label>
              <input v-model="bankStore.settings.watermarkText" type="text" />
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="bankStore.settings.includeSummary" type="checkbox" />
                包含账单摘要
              </label>
            </div>
            <div class="form-group">
              <label>汇总对账单显示模式</label>
              <div class="display-mode-options">
                <label class="mode-option" :class="{ active: bankStore.settings.consolidatedDisplayMode === 'detail' }">
                  <input type="radio" v-model="bankStore.settings.consolidatedDisplayMode" value="detail" />
                  <span class="mode-icon">📋</span>
                  <span class="mode-text">明细视图</span>
                  <span class="mode-desc">显示所有交易记录</span>
                </label>
                <label class="mode-option" :class="{ active: bankStore.settings.consolidatedDisplayMode === 'summary' }">
                  <input type="radio" v-model="bankStore.settings.consolidatedDisplayMode" value="summary" />
                  <span class="mode-icon">📊</span>
                  <span class="mode-text">汇总视图</span>
                  <span class="mode-desc">按月份/类别/卡片汇总</span>
                </label>
              </div>
            </div>
          </div>
          <!-- 设计选项标签页 -->
          <div v-show="activeTab === '设计选项'" class="form-section">
            <div class="form-group">
              <label>字体</label>
              <select v-model="bankStore.settings.fontFamily">
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>主色调</label>
                <input v-model="bankStore.settings.primaryColor" type="color" />
              </div>
              <div class="form-group">
                <label>次色调</label>
                <input v-model="bankStore.settings.secondaryColor" type="color" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>字体大小 (px)</label>
                <input v-model.number="bankStore.settings.fontSize" type="number" min="10" max="24" />
              </div>
              <div class="form-group">
                <label>行高</label>
                <input v-model.number="bankStore.settings.lineHeight" type="number" step="0.1" min="1" max="3" />
              </div>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="bankStore.settings.showCharts" type="checkbox" />
                显示图表 (曲线图 & 饼状图)
              </label>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="bankStore.settings.showBorder" type="checkbox" />
                显示边框
              </label>
            </div>
            <div v-if="bankStore.settings.showBorder" class="form-row">
              <div class="form-group">
                <label>边框颜色</label>
                <input v-model="bankStore.settings.borderColor" type="color" />
              </div>
              <div class="form-group">
                <label>边框宽度 (px)</label>
                <input v-model.number="bankStore.settings.borderWidth" type="number" min="1" max="10" />
              </div>
            </div>
            <div v-if="bankStore.settings.showBorder" class="form-group">
              <label>边框样式</label>
              <select v-model="bankStore.settings.borderStyle">
                <option value="solid">实线 (Solid)</option>
                <option value="dashed">虚线 (Dashed)</option>
                <option value="dotted">点线 (Dotted)</option>
                <option value="double">双线 (Double)</option>
                <option value="groove">凹槽 (Groove)</option>
                <option value="ridge">脊状 (Ridge)</option>
              </select>
            </div>

            <h4 style="margin-top: 20px; margin-bottom: 10px; border-top: 1px solid #eee; padding-top: 15px;">条形码与二维码</h4>
            
            <!-- 条形码设置 -->
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="bankStore.settings.showBarcode">
                显示条形码
              </label>
            </div>
            
            <div v-if="bankStore.settings.showBarcode" class="nested-settings">
              <div class="form-group">
                <label>来源</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="bankStore.settings.barcodeSource" value="generated">
                    自动生成
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="bankStore.settings.barcodeSource" value="upload">
                    上传图片
                  </label>
                </div>
              </div>
              
              <div v-if="bankStore.settings.barcodeSource === 'generated'" class="form-group">
                <label>内容</label>
                <input type="text" v-model="bankStore.settings.barcodeContent" placeholder="默认使用账号">
              </div>
              
              <div v-else class="form-group">
                <label>上传条形码</label>
                <div class="upload-controls">
                  <PhotoSelector 
                    :current-photo="bankStore.settings.barcodeImage" 
                    @update:photo="(val) => bankStore.settings.barcodeImage = val" 
                  />
                  <label class="btn-local-upload">
                    📂 本地上传
                    <input type="file" accept="image/*" @change="handleBarcodeUpload" style="display: none" />
                  </label>
                </div>
              </div>
            </div>

            <!-- 二维码设置 -->
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="bankStore.settings.showQR">
                显示二维码
              </label>
            </div>
            
            <div v-if="bankStore.settings.showQR" class="nested-settings">
              <div class="form-group">
                <label>来源</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="bankStore.settings.qrSource" value="generated">
                    自动生成
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="bankStore.settings.qrSource" value="upload">
                    上传图片
                  </label>
                </div>
              </div>
              
              <div v-if="bankStore.settings.qrSource === 'generated'" class="form-group">
                <label>内容</label>
                <input type="text" v-model="bankStore.settings.qrContent" placeholder="默认包含账户信息">
              </div>
              
              <div v-else class="form-group">
                <label>上传二维码</label>
                <div class="upload-controls">
                  <PhotoSelector 
                    :current-photo="bankStore.settings.qrImage" 
                    @update:photo="(val) => bankStore.settings.qrImage = val" 
                  />
                  <label class="btn-local-upload">
                    📂 本地上传
                    <input type="file" accept="image/*" @change="handleQRUpload" style="display: none" />
                  </label>
                </div>
              </div>
            </div>

            <!-- 水印设置已移至独立标签页 -->
          </div>

          <!-- 水印设置标签页 -->
          <div v-show="activeTab === '水印设置'" class="form-section">
            <h4 style="margin-top: 6px; margin-bottom: 10px;">水印设置</h4>
            <div class="form-group">
              <WatermarkSettingsPanel :model="bankStore.settings" />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>📄 预览</h3>
          <div class="export-controls">
            <PreviewSizeSelector v-model="previewSize" />
            <select v-model="exportFormat" class="format-select">
              <option value="PNG">PNG图片</option>
              <option value="PDF">PDF文件</option>
            </select>
            <select v-model="exportQuality" class="quality-select">
              <option value="标准质量 (较小文件)">标准质量</option>
              <option value="高清质量">高清质量</option>
              <option value="超高清 (推荐)">超高清</option>
              <option value="最高质量 (大文件)">最高质量</option>
            </select>
            <button @click="showEmailModal = true" class="btn-email">📧 邮件</button>
            <button @click="showDownloadPanel = true" class="btn-export">📥 导出</button>

            <DownloadPanel
              :visible="showDownloadPanel"
              :preview-selector="'#statement-download-area'"
              :default-file-name="`BankStatement_${bankStore.cardInfo.bank || Date.now()}`"
              :default-format="'pdf'"
              :default-quality="4"
              @close="showDownloadPanel = false"
            />
          </div>
        </div>
        
        <!-- 预览内容区域 -->
        <div class="preview-content-area" :class="`preview-mode-${previewSize}`">
          <!-- iPhone 模式 -->
          <IPhoneFrame v-if="previewSize === 'iphone'" :show-status-bar="true" :show-home-indicator="true">
            <div id="statement-download-area" class="statement-content-iphone">
              <BankStatementPreview v-if="bankStore.viewMode === 'single'" ref="previewRef" preview-size="iphone" />
              <ConsolidatedStatementPreview v-else-if="bankStore.viewMode === 'consolidated'" ref="previewRef" preview-size="iphone" />
              <BankReportPreview 
                v-else 
                ref="previewRef"
                preview-size="iphone"
                :report-type="reportType"
                :report-year="reportYear"
                :report-month="reportMonth"
                :report-start-date="reportStartDate"
                :report-end-date="reportEndDate"
                :report-options="reportOptions"
                :report-title="reportTitle"
                :report-theme="reportTheme"
                :footer-text="reportFooterText"
                :footer-generated="reportFooterGenerated"
              />
            </div>
          </IPhoneFrame>
          
          <!-- 普通模式 -->
          <div v-else id="statement-download-area" class="statement-content-normal">
            <BankStatementPreview v-if="bankStore.viewMode === 'single'" ref="previewRef" :preview-size="previewSize" />
            <ConsolidatedStatementPreview v-else-if="bankStore.viewMode === 'consolidated'" ref="previewRef" :preview-size="previewSize" />
            <BankReportPreview 
              v-else 
              ref="previewRef"
              :preview-size="previewSize"
              :report-type="reportType"
              :report-year="reportYear"
              :report-month="reportMonth"
              :report-start-date="reportStartDate"
              :report-end-date="reportEndDate"
              :report-options="reportOptions"
              :report-title="reportTitle"
              :report-theme="reportTheme"
              :footer-text="reportFooterText"
              :footer-generated="reportFooterGenerated"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`BankStatement_${bankStore.cardInfo.cardHolder}`"
      :default-subject="`银行对账单 - ${bankStore.cardInfo.bank}`"
      preview-selector=".bank-statement-preview, .consolidated-preview, .bank-report-preview"
      @close="showEmailModal = false"
    />
    
    <!-- 添加账户弹窗 -->
    <div v-if="showAddAccountModal" class="modal-overlay" @click="showAddAccountModal = false">
      <div class="modal-content" @click.stop>
        <h3>添加新账户</h3>
        <p class="modal-desc">可以通过保存当前账户数据，然后修改卡片信息创建新账户</p>
        <div class="modal-actions">
          <button @click="addNewAccount" class="btn-primary">添加当前账户</button>
          <button @click="showAddAccountModal = false" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 删除账户确认对话框 -->
    <ConfirmDialog
      v-model:visible="showDeleteAccountDialog"
      type="danger"
      title="确认删除账户"
      message="确定要删除此账户吗？此操作不可恢复。"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="handleDeleteAccountConfirmed"
      @cancel="showDeleteAccountDialog = false"
    />

    <!-- 切换账户确认对话框 -->
    <ConfirmDialog
      v-model:visible="showSwitchAccountDialog"
      type="warning"
      title="确认切换账户"
      message="切换账户将把当前正在编辑的账户保存到「其他账户」列表中，是否继续？"
      confirm-text="确认切换"
      cancel-text="取消"
      @confirm="handleSwitchAccountConfirmed"
      @cancel="showSwitchAccountDialog = false"
    />

    <!-- 清空交易记录确认对话框 -->
    <ConfirmDialog
      v-model:visible="showClearTransactionsDialog"
      type="danger"
      title="确认清空交易记录"
      :message="`确定要删除所有 ${bankStore.transactions.length} 条交易记录吗？此操作不可恢复。`"
      confirm-text="确认清空"
      cancel-text="取消"
      @confirm="handleClearTransactionsConfirmed"
      @cancel="showClearTransactionsDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBankStore } from '@/stores/bank'
import BankStatementPreview from '@/components/BankStatementPreview.vue'
import ConsolidatedStatementPreview from '@/components/ConsolidatedStatementPreview.vue'
import BankReportPreview from '@/components/BankReportPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import EmailModal from '@/components/EmailModal.vue'
import PreviewSizeSelector, { type PreviewSize } from '@/components/PreviewSizeSelector.vue'
import IPhoneFrame from '@/components/IPhoneFrame.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import StudentDocumentPicker from '@/components/StudentDocumentPicker.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import WatermarkSettingsPanel from '@/components/WatermarkSettingsPanel.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import CurrencySelector from '@/components/CurrencySelector.vue'
import { downloadTransactionTemplate, parseBankStatementFile } from '@/utils/bankStatementParser'
import { getSavedDocuments } from '@/utils/dataService'
import type { MediaItem } from '@/types/media'

const bankStore = useBankStore()
const activeTab = ref('卡片信息')
const mainTabs = ['账户管理', '卡片信息', '交易记录', '设置', '设计选项', '水印设置']
const reportTabs = ['报告设置', '卡片信息', '交易记录', '水印设置']
const showEmailModal = ref(false)
const previewSize = ref<PreviewSize>('original')

// 确认对话框状态
const showDeleteAccountDialog = ref(false)
const showClearTransactionsDialog = ref(false)
const showSwitchAccountDialog = ref(false)
const accountToDelete = ref('')
const accountToSwitch = ref<any>(null)

// 交易记录详情展开状态
const expandedTransactions = ref<string[]>([])
const toggleTransactionDetails = (id: string) => {
  const index = expandedTransactions.value.indexOf(id)
  if (index === -1) {
    expandedTransactions.value.push(id)
  } else {
    expandedTransactions.value.splice(index, 1)
  }
}

// 期初余额自动计算相关
const isAutoFilling = ref(false)
const openingBalanceHint = ref('')
const openingBalanceHintType = ref<'success' | 'warning' | 'error'>('success')

// 自动填充期初余额
const handleAutoFillOpeningBalance = async () => {
  if (!bankStore.settings.statementPeriod) {
    openingBalanceHint.value = '请先设置账单期间（在"设置"标签页）'
    openingBalanceHintType.value = 'warning'
    return
  }

  if (!bankStore.cardInfo.cardNumber) {
    openingBalanceHint.value = '请先设置卡号'
    openingBalanceHintType.value = 'warning'
    return
  }

  isAutoFilling.value = true
  openingBalanceHint.value = ''
  
  try {
    // 获取所有已保存的银行对账单数据
    const result = await getSavedDocuments('bank_statement')
    
    if (!result.success) {
      openingBalanceHint.value = '获取历史数据失败'
      openingBalanceHintType.value = 'error'
      return
    }

    const savedDocs = result.data || []
    
    // 调用 store 的自动填充方法
    const fillResult = await bankStore.autoFillOpeningBalance(savedDocs)
    
    openingBalanceHint.value = fillResult.message
    openingBalanceHintType.value = fillResult.success ? 'success' : 'warning'
    
    // 5秒后清除提示
    setTimeout(() => {
      openingBalanceHint.value = ''
    }, 8000)
  } catch (error) {
    console.error('自动填充期初余额失败:', error)
    openingBalanceHint.value = '计算失败，请重试'
    openingBalanceHintType.value = 'error'
  } finally {
    isAutoFilling.value = false
  }
}

// 根据视图模式动态切换标签页
const currentTabs = computed(() => {
  if (bankStore.viewMode === 'report') {
    return reportTabs
  }
  return mainTabs
})

// 监听视图模式变化，自动切换到合适的标签页
watch(() => bankStore.viewMode, (newMode) => {
  if (newMode === 'report') {
    activeTab.value = '报告设置'
  } else if (!mainTabs.includes(activeTab.value)) {
    activeTab.value = '卡片信息'
  }
})

const previewRef = ref()
const isProcessing = ref(false)
const showDownloadPanel = ref(false)
const showAddAccountModal = ref(false)

// 导出选项（模板中引用，确保已定义以避免 Vue 警告）
const exportFormat = ref('PNG')
const exportQuality = ref('高清质量')

// 报告相关配置
const reportType = ref<'annual' | 'monthly' | 'custom'>('monthly')
const reportYear = ref(new Date().getFullYear())
const reportMonth = ref(new Date().getMonth() + 1)
const reportStartDate = ref('')
const reportEndDate = ref('')
const reportTitle = ref('')
const reportOptions = ref({
  showSummary: true,
  showTrends: true,
  showCategories: true,
  showTopMerchants: true,
  showComparison: false,
  showInsights: true
})
const reportTheme = ref({
  primary: '#667eea',
  secondary: '#764ba2'
})

// 页脚设置
const reportFooterText = ref('')
const reportFooterGenerated = ref('')
// 可用年份
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push(i)
  }
  return years
})

// 颜色预设
const colorPresets = [
  { primary: '#667eea', secondary: '#764ba2' },
  { primary: '#11998e', secondary: '#38ef7d' },
  { primary: '#ee0979', secondary: '#ff6a00' },
  { primary: '#2193b0', secondary: '#6dd5ed' },
  { primary: '#8E2DE2', secondary: '#4A00E0' },
  { primary: '#000428', secondary: '#004e92' }
]

const removeAccount = (accountId: string) => {
  accountToDelete.value = accountId
  showDeleteAccountDialog.value = true
}

const handleDeleteAccountConfirmed = () => {
  showDeleteAccountDialog.value = false
  if (accountToDelete.value) {
    bankStore.removeAccount(accountToDelete.value)
    accountToDelete.value = ''
  }
}

const editAccount = (account: any) => {
  accountToSwitch.value = account
  showSwitchAccountDialog.value = true
}

const handleSwitchAccountConfirmed = () => {
  showSwitchAccountDialog.value = false
  if (accountToSwitch.value) {
    // 1. 保存当前账户到列表
    bankStore.addAccount(
      { ...bankStore.cardInfo },
      [...bankStore.transactions]
    )
    
    // 2. 加载选中的账户
    bankStore.cardInfo = { ...accountToSwitch.value.cardInfo }
    bankStore.transactions = [...accountToSwitch.value.transactions]
    
    // 3. 从列表中移除选中的账户
    bankStore.removeAccount(accountToSwitch.value.id)
    
    // 4. 切换到卡片信息标签页，方便用户开始编辑
    activeTab.value = '卡片信息'
    accountToSwitch.value = null
  }
}

const addNewAccount = () => {
  // 将当前账户信息添加到账户列表
  bankStore.addAccount(
    { ...bankStore.cardInfo },
    [...bankStore.transactions]
  )
  showAddAccountModal.value = false
  alert('账户已添加！现在可以修改当前卡片信息创建新账户')
}

const downloadTemplate = () => {
  downloadTransactionTemplate()
}

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  const file = input.files[0]
  isProcessing.value = true
  
  try {
    const result = await parseBankStatementFile(file)
    const transactions = result.transactions || []
    const detectedCardNumber = result.detectedCardNumber
    const detectedCardType = result.detectedCardType
    const detectedAccounts = result.detectedAccounts || []

    // 新增：检测到多个账户时自动添加
    if (detectedAccounts.length > 1) {
      let addedCount = 0
      let isFirstAccount = true
      let primaryAccountLast4 = '' // 记录主账户的后4位
      
      detectedAccounts.forEach(account => {
          const last4 = account.cardNumber.slice(-4)
        const formattedCardNumber = `**** **** **** ${last4}`
        
        // 第一个识别到的账户设为主账户
        if (isFirstAccount && account.transactions.length > 0) {
          isFirstAccount = false
          primaryAccountLast4 = last4
          
          // 如果这个账户之前在 accounts 列表中，先移除它
          const existingInAccounts = bankStore.accounts.findIndex(acc => {
            const accLast4 = acc.cardInfo.cardNumber.replace(/[^\d]/g, '').slice(-4)
            return accLast4 === last4
          })
          if (existingInAccounts !== -1) {
            bankStore.removeAccount(bankStore.accounts[existingInAccounts].id)
          }
          
          // 设置为主账户（当前账户）
          bankStore.cardInfo.cardNumber = formattedCardNumber
          bankStore.cardInfo.cardType = (account.cardType || 'visa') as 'visa' | 'mastercard' | 'amex' | 'unionpay'
          bankStore.cardInfo.closingBalance = account.transactions.reduce((sum, t) => sum + t.amount, 0)
          
          // 清空当前交易并添加该账户的交易
          bankStore.clearAllTransactions()
          account.transactions.forEach(t => bankStore.addTransaction(t))
          return
        }
        
        // 检查这个账户是否与主账户重复
        if (last4 === primaryAccountLast4) {
          return // 跳过与主账户重复的账户
        }
        
        // 检查这个账户是否已存在于 accounts 列表中
        const existingAccount = bankStore.accounts.find(acc => {
          const accLast4 = acc.cardInfo.cardNumber.replace(/[^\d]/g, '').slice(-4)
          return accLast4 === last4
        })
        
        if (!existingAccount && account.transactions.length > 0) {
          // 创建新账户
          const newCardInfo = {
            cardNumber: formattedCardNumber,
            cardHolder: bankStore.cardInfo.cardHolder || 'Card Holder',
            bank: bankStore.cardInfo.bank || 'Bank',
            cardType: (account.cardType || 'visa') as 'visa' | 'mastercard' | 'amex' | 'unionpay',
            expiryDate: '12/2025',
            billingAddress: bankStore.cardInfo.billingAddress || 'Address',
            currency: 'USD',
            openingBalance: 0,
            closingBalance: account.transactions.reduce((sum, t) => sum + t.amount, 0)
          }
          
          bankStore.addAccount(newCardInfo, account.transactions)
          addedCount++
        }
      })
      
      if (addedCount > 0) {
        alert(`检测到 ${detectedAccounts.length} 个账户，第一个账户已设为主账户，其余 ${addedCount} 个新账户已添加到账户管理中。\n总共导入 ${transactions.length} 条交易记录。`)
      } else {
        alert(`检测到 ${detectedAccounts.length} 个账户，第一个账户已设为主账户。\n总共导入 ${transactions.length} 条交易记录。`)
      }
      
      return
    }

    // 原有逻辑：单账户处理
    if (detectedCardNumber) {
      const last4 = detectedCardNumber.slice(-4)
      bankStore.cardInfo.cardNumber = bankStore.cardInfo.cardNumber || ''
      // 更新显示为掩码形式，例如 **** **** **** 1234
      bankStore.cardInfo.cardNumber = `**** **** **** ${last4}`
    }
    if (detectedCardType) {
      bankStore.cardInfo.cardType = detectedCardType as any
    }

    if (transactions.length === 0) {
      alert('未识别到有效交易记录，请检查文件格式')
    } else {
      // 如果是单账户模式，只导入与当前账户匹配的账单信息
      if (bankStore.viewMode === 'single') {
        const currentDigits = String(bankStore.cardInfo.cardNumber || '').replace(/\D/g, '')
        const currentLast4 = currentDigits.slice(-4)
        const matchLast4 = detectedCardNumber ? detectedCardNumber.slice(-4) === currentLast4 : null
        const matchType = detectedCardType ? (String(detectedCardType).toLowerCase() === String(bankStore.cardInfo.cardType).toLowerCase()) : null

        if ((matchLast4 === true || matchLast4 === null) && (matchType === true || matchType === null)) {
          transactions.forEach(t => bankStore.addTransaction(t))
          alert(`成功导入 ${transactions.length} 条交易记录`)          
        } else {
          // 给用户选项：替换当前账户信息并导入，或取消
          const pickedLast4 = detectedCardNumber ? detectedCardNumber.slice(-4) : '未知'
          const pickedType = detectedCardType || '未知'
          if (confirm(`识别到卡号后4位 ${pickedLast4}，卡组织 ${pickedType}。是否将当前账户切换为此卡并导入该账单？`)) {
            // 切换当前卡信息并替换交易
            bankStore.cardInfo.cardNumber = detectedCardNumber ? `**** **** **** ${detectedCardNumber.slice(-4)}` : bankStore.cardInfo.cardNumber
            if (detectedCardType) bankStore.cardInfo.cardType = detectedCardType as any
            bankStore.clearAllTransactions()
            transactions.forEach(t => bankStore.addTransaction(t))
            alert(`已切换账户并导入 ${transactions.length} 条交易记录`)
          } else {
            alert('已取消导入（单账户模式下不匹配当前卡信息）')
          }
        }
      } else {
        // 汇总模式：直接导入
        transactions.forEach(t => bankStore.addTransaction(t))
        alert(`成功导入 ${transactions.length} 条交易记录`)
      }
    }
  } catch (error) {
    console.error(error)
    alert('文件解析失败: ' + (error as Error).message)
  } finally {
    isProcessing.value = false
    input.value = ''
  }
}

const handleClearAllTransactions = () => {
  showClearTransactionsDialog.value = true
}

// 从资料管理选择文档导入
const handleDocumentSelect = async (doc: any) => {
  if (!doc.file_url) {
    alert('文档链接无效')
    return
  }
  
  try {
    isProcessing.value = true
    
    // 获取文件
    const response = await fetch(doc.file_url)
    const blob = await response.blob()
    const file = new File([blob], doc.document_name, { type: blob.type })
    
    // 模拟文件上传事件
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    
    const mockEvent = {
      target: { files: dataTransfer.files, value: '' }
    } as unknown as Event
    
    await handleFileUpload(mockEvent)
  } catch (error) {
    console.error('从资料管理导入失败:', error)
    alert('导入失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

// 处理条形码上传
const handleBarcodeUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      bankStore.settings.barcodeImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 处理二维码上传
const handleQRUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      bankStore.settings.qrImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleClearTransactionsConfirmed = () => {
  showClearTransactionsDialog.value = false
  bankStore.clearAllTransactions()
}

const addNewTransaction = () => {
  bankStore.addTransaction({
    date: new Date().toISOString().split('T')[0],
    merchant: '新商户',
    category: 'Shopping',
    amount: -10.00,
    currency: bankStore.cardInfo.currency,
    status: 'completed',
    location: 'Online',
    code: 'POS',
    paymentMethod: `${bankStore.cardInfo.cardType} ${bankStore.cardInfo.cardNumber.slice(-4)}`
  })
}

const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        bankStore.settings.logoUrl = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

const handlePhotoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        bankStore.cardInfo.cardHolderPhoto = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 照片库选择
const handlePhotoSelected = (photo: MediaItem) => {
  bankStore.cardInfo.cardHolderPhoto = photo.url
}

function downloadBankStatement() {
  showDownloadPanel.value = true
}
</script>

<style scoped>
.bank-statement-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.photo-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.photo-preview img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.btn-remove-photo {
  padding: 4px 8px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.view-content {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

.edit-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  flex-direction: row;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
}

.tab {
  padding: 15px 20px;
  background: none;
  border: none;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab:hover {
  background: #e9ecef;
}

.tab.active {
  background: white;
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  /* 全部显示，无滚动 */
}

.form-section {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

/* 显示模式选项 */
.display-mode-options {
  display: flex;
  gap: 12px;
}

.mode-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.mode-option input[type="radio"] {
  display: none;
}

.mode-option:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.mode-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.mode-option .mode-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.mode-option .mode-text {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
}

.mode-option .mode-desc {
  font-size: 11px;
  color: #6b7280;
}

.transactions-list {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.transaction-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.transaction-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-toggle-details {
  padding: 4px 12px;
  background: #e9ecef;
  color: #495057;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-details:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.transaction-number {
  font-weight: 600;
  color: #495057;
}

.btn-edit-small {
  padding: 4px 12px;
  background: #ffc107;
  color: #212529;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 8px;
}

.btn-edit-small:hover {
  background: #e0a800;
}

.btn-remove {
  padding: 4px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #c82333;
}

.btn-add-transaction {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-transaction:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 交易详情展开区域样式 */
.transaction-details-expanded {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #ced4da;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.details-section {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.details-section h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 6px;
}

.details-section .form-row {
  margin-bottom: 8px;
}

.details-section .form-row:last-child {
  margin-bottom: 0;
}

.details-section .form-group textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 13px;
  resize: vertical;
  min-height: 60px;
}

.details-section .form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.preview-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
  flex-shrink: 0;
}

/* 预览内容区域 */
.preview-content-area {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.preview-content-area.preview-mode-mobile {
  background: linear-gradient(to bottom, #1a1a2e, #16213e);
  padding: 40px 20px;
}

.preview-content-area.preview-mode-iphone {
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
  padding: 30px;
  min-height: 600px;
  align-items: flex-start;
}

.preview-content-area.preview-mode-desktop {
  background: #e2e8f0;
  padding: 30px;
}

.preview-content-area.preview-mode-original {
  background: #f8f9fa;
}

.statement-content-iphone {
  width: 100%;
  background: #fff;
  min-height: 100%;
  overflow: hidden;
}

.statement-content-normal {
  display: inline-block;
  min-width: 800px;
}

.preview-header h3 {
  margin: 0;
  color: #212529;
  font-size: 18px;
}

.export-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.format-select,
.quality-select {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-select:hover,
.quality-select:hover {
  border-color: #667eea;
}

.format-select:focus,
.quality-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.format-select option,
.quality-select option {
  padding: 8px;
}

.btn-export {
  padding: 8px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.preview-container {
  /* 全部显示，无滚动 */
  background: #f5f5f5;
}

/* 视图模式选择器 */
.view-mode-selector {
  display: flex;
  gap: 0;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.mode-btn {
  flex: 1;
  padding: 10px 15px;
  background: white;
  border: 1px solid #dee2e6;
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-btn:first-child {
  border-radius: 6px 0 0 6px;
  border-right: none;
}

.mode-btn:last-child {
  border-radius: 0 6px 6px 0;
}

.mode-btn:hover {
  background: #f8f9fa;
}

.mode-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

/* 账户管理 */
.accounts-manager h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #495057;
  font-weight: 600;
}

.current-account-card,
.account-card {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-bottom: 10px;
}

.current-account-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: #667eea;
}

.account-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-info {
  flex: 1;
}

.account-name {
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
}

.account-number {
  font-size: 12px;
  color: #6c757d;
  font-family: monospace;
}

.account-stats {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.btn-remove-small {
  padding: 4px 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}

.btn-add-account {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 15px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
}

.accounts-list {
  max-height: 300px;
  overflow-y: auto;
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

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 10px 0;
  color: #212529;
  font-size: 20px;
}

.modal-desc {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

/* 报告设置样式 */
.report-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.report-type-option {
  flex: 1;
  cursor: pointer;
}

.report-type-option input {
  display: none;
}

.report-type-option .option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.report-type-option.active .option-content {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-color: #667eea;
}

.report-type-option:hover .option-content {
  border-color: #adb5bd;
}

.option-icon {
  font-size: 24px;
}

.option-label {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
}

.report-period-config {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.report-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.checkbox-option:hover {
  background: #e9ecef;
}

.checkbox-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.checkbox-option span {
  font-size: 13px;
  color: #495057;
}

.color-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-preset-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-preset-btn:hover {
  transform: scale(1.1);
}

.color-preset-btn.active {
  border-color: #212529;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #212529;
}

/* 期初余额自动计算按钮 */
.auto-fill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  margin-left: 8px;
  font-size: 11px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.auto-fill-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.auto-fill-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Radio Group Styles */
.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: normal;
  font-size: 14px;
}

.radio-label input[type="radio"] {
  margin: 0;
}

/* Upload Controls */
.upload-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-local-upload {
  display: inline-block;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  text-align: center;
  color: #495057;
  transition: all 0.2s;
}

.btn-local-upload:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.balance-hint {
  display: block;
  font-size: 11px;
  margin-top: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  animation: fadeIn 0.3s ease;
}

.balance-hint.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.balance-hint.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.balance-hint.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1200px) {
  .view-content {
    grid-template-columns: 1fr;
  }
}
</style>
