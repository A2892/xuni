<template>
  <div class="tuition-receipt-view">
    <div class="view-content">
      <!-- 左侧编辑面板 -->
      <div class="edit-panel">
        <div class="panel-header">
          <div class="header-row">
            <div class="header-text">
              <h2>🎓 学费收据生成器</h2>
              <p>Tuition Receipt Generator</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
        
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab.key" :class="['tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
            {{ tab.label }}
          </button>
        </div>
        
        <div class="tab-content">
          <!-- 学校信息 -->
          <div v-show="activeTab === 'school'" class="form-section">
            <div class="form-group">
              <label>学校名称 (英文)</label>
              <input v-model="store.school.name" type="text" />
            </div>
            <div class="form-group">
              <label>学校名称 (中文)</label>
              <input v-model="store.school.nameCn" type="text" />
            </div>
            <div class="form-group">
              <label>学校Logo</label>
              <div class="logo-actions">
                <PhotoSelector v-model="store.school.logo" />
                <span class="or-divider">或</span>
                <input type="file" accept="image/*" @change="handleLogoUpload" />
              </div>
              <div v-if="store.school.logo" class="image-preview">
                <img :src="store.school.logo" />
                <button @click="store.school.logo = ''" class="btn-remove">删除</button>
              </div>
            </div>
            <div class="form-group">
              <label>学校地址</label>
              <textarea v-model="store.school.address" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>联系电话</label>
                <input v-model="store.school.phone" type="text" />
              </div>
              <div class="form-group">
                <label>电子邮箱</label>
                <input v-model="store.school.email" type="email" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>网站</label>
                <input v-model="store.school.website" type="text" />
              </div>
              <div class="form-group">
                <label>税号</label>
                <input v-model="store.school.taxId" type="text" />
              </div>
            </div>
          </div>

          <!-- 学生信息 -->
          <div v-show="activeTab === 'student'" class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>学号</label>
                <input v-model="store.student.id" type="text" />
              </div>
              <div class="form-group">
                <label>年级</label>
                <select v-model="store.student.yearLevel">
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                  <option value="postgrad">Postgraduate</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>学生照片</label>
              <PhotoSelector 
                v-model="store.student.photo"
                :student-id="store.student.id"
                @photo-selected="handlePhotoSelected"
              />
              <div class="photo-upload-container" style="margin-top: 10px;">
                <div v-if="store.student.photo" class="current-photo">
                  <img :src="store.student.photo" alt="Student Photo" />
                  <button @click="store.student.photo = ''" class="btn-remove-photo">×</button>
                </div>
                <div class="photo-actions">
                  <div class="upload-btn-wrapper">
                    <button class="btn-upload">本地上传</button>
                    <input type="file" accept="image/*" @change="handlePhotoUpload" />
                  </div>
                  <button @click="showPhotoLibrary = !showPhotoLibrary" class="btn-library">
                    {{ showPhotoLibrary ? '关闭头像' : '选择头像' }}
                  </button>
                </div>
              </div>
              
              <div v-if="showPhotoLibrary" class="photo-library">
                <div v-for="(photo, index) in photoLibrary" :key="index" 
                     class="library-item" @click="selectPhoto(photo)">
                  <img :src="photo" />
                </div>
              </div>
              <p class="help-text" style="margin-top: 5px; font-size: 12px; color: #666;">从照片库选择或本地上传照片</p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>学生姓名 (英文)</label>
                <input v-model="store.student.name" type="text" />
              </div>
              <div class="form-group">
                <label>学生姓名 (中文)</label>
                <input v-model="store.student.nameCn" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>专业 (英文)</label>
              <input v-model="store.student.programme" type="text" />
            </div>
            <div class="form-group">
              <label>专业 (中文)</label>
              <input v-model="store.student.programmeCn" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>学院 (英文)</label>
                <input v-model="store.student.faculty" type="text" />
              </div>
              <div class="form-group">
                <label>学院 (中文)</label>
                <input v-model="store.student.facultyCn" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>学生邮箱</label>
                <input v-model="store.student.email" type="email" />
              </div>
              <div class="form-group">
                <label>联系电话</label>
                <input v-model="store.student.phone" type="text" />
              </div>
            </div>
          </div>

          <!-- 收据信息 -->
          <div v-show="activeTab === 'receipt'" class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>收据编号</label>
                <div class="input-with-button">
                  <input v-model="store.receipt.number" type="text" />
                  <button @click="store.generateReceiptNumber" class="btn-generate">生成</button>
                </div>
              </div>
              <div class="form-group">
                <label>开具日期</label>
                <input v-model="store.receipt.issueDate" type="date" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>学年</label>
                <input v-model="store.receipt.academicYear" type="text" placeholder="2025-2026" />
              </div>
              <div class="form-group">
                <label>学期</label>
                <select v-model="store.receipt.semester">
                  <option value="Fall">Fall / 秋季</option>
                  <option value="Spring">Spring / 春季</option>
                  <option value="Summer">Summer / 夏季</option>
                  <option value="Full Year">Full Year / 全年</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>截止日期</label>
                <input v-model="store.receipt.dueDate" type="date" />
              </div>
              <div class="form-group">
                <label>支付状态</label>
                <select v-model="store.receipt.status">
                  <option value="paid">已支付 (Paid)</option>
                  <option value="pending">待支付 (Pending)</option>
                  <option value="partial">部分支付 (Partial)</option>
                  <option value="overdue">逾期 (Overdue)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 费用明细 -->
          <div v-show="activeTab === 'fees'" class="form-section">
            <div class="section-header">
              <h4>费用项目</h4>
              <div class="header-actions">
                <StudentDocumentPicker 
                  button-text="从资料管理导入"
                  title="从资料管理选择学费数据"
                  :accept="['xlsx', 'xls', 'csv', 'pdf', 'docx', 'jpg', 'jpeg', 'png']"
                  @select="handleDocumentSelect"
                />
                <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" style="display: none" @change="handleImportFees" />
                <button @click="$refs.fileInput.click()" class="btn-import">📥 导入</button>
                <button @click="exportFeesTemplate" class="btn-export">📤 导出模板</button>
              </div>
            </div>
            <div v-for="(item, index) in store.feeItems" :key="item.id" class="fee-item-row">
              <div class="fee-item-fields">
                <select v-model="item.category" class="category-select">
                  <option value="Tuition Fee">学费 Tuition Fee</option>
                  <option value="Registration Fee">注册费 Registration Fee</option>
                  <option value="Technology Fee">技术费 Technology Fee</option>
                  <option value="Library Fee">图书馆费 Library Fee</option>
                  <option value="Student Activity Fee">活动费 Activity Fee</option>
                  <option value="Lab Fee">实验室费 Lab Fee</option>
                  <option value="Insurance Fee">保险费 Insurance Fee</option>
                  <option value="Housing Fee">住宿费 Housing Fee</option>
                  <option value="Meal Plan">餐饮费 Meal Plan</option>
                  <option value="Other Fee">其他费用 Other Fee</option>
                </select>
                <input v-model="item.description" placeholder="费用说明" class="description-input" />
                <input v-model.number="item.amount" type="number" placeholder="金额" class="amount-input" />
                <button @click="store.removeFeeItem(item.id)" class="btn-remove-sm">×</button>
              </div>
            </div>
            <button @click="store.addFeeItem" class="btn-add">+ 添加费用项目</button>

            <div class="summary-box">
              <div class="summary-row">
                <span>小计:</span>
                <span>{{ store.formatCurrency(store.subtotal) }}</span>
              </div>
              <div class="summary-row total">
                <strong>应付总额:</strong>
                <strong>{{ store.formatCurrency(store.totalDue) }}</strong>
              </div>
            </div>

            <h4 style="margin-top: 20px;">折扣与奖学金</h4>
            <div class="form-row">
              <div class="form-group">
                <label>奖学金金额</label>
                <input v-model.number="store.discounts.scholarship" type="number" />
              </div>
              <div class="form-group">
                <label>奖学金名称</label>
                <input v-model="store.discounts.scholarshipName" type="text" placeholder="Merit Scholarship" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>提前缴费优惠</label>
                <input v-model.number="store.discounts.earlyPayment" type="number" />
              </div>
              <div class="form-group">
                <label>其他折扣</label>
                <input v-model.number="store.discounts.other" type="number" />
              </div>
            </div>
          </div>

          <!-- 支付记录 -->
          <div v-show="activeTab === 'payments'" class="form-section">
            <div class="section-header">
              <h4>支付记录</h4>
              <button v-if="store.balance > 0" @click="store.openPaymentModal()" class="btn-pay-now">
                💳 立即支付
              </button>
            </div>
            <div v-for="(payment, index) in store.payments" :key="payment.id" class="payment-item-row">
              <div class="payment-item-fields">
                <input v-model="payment.date" type="date" class="date-input" />
                <select v-model="payment.method" class="method-select">
                  <option value="Bank Transfer">银行转账</option>
                  <option value="Credit Card">信用卡</option>
                  <option value="Debit Card">借记卡</option>
                  <option value="Check">支票</option>
                  <option value="Cash">现金</option>
                  <option value="Online Payment">在线支付</option>
                </select>
                <input v-model="payment.reference" placeholder="参考号" class="reference-input" />
                <input v-model.number="payment.amount" type="number" placeholder="金额" class="amount-input" />
                <button @click="store.removePayment(payment.id)" class="btn-remove-sm">×</button>
              </div>
            </div>
            <button @click="store.addPayment" class="btn-add">+ 添加支付记录</button>

            <div class="summary-box" style="margin-top: 20px;">
              <div class="summary-row">
                <span>应付总额:</span>
                <span>{{ store.formatCurrency(store.totalDue) }}</span>
              </div>
              <div class="summary-row">
                <span>已付金额:</span>
                <span class="paid">{{ store.formatCurrency(store.totalPaid) }}</span>
              </div>
              <div class="summary-row total" :class="{ overdue: store.balance > 0 }">
                <strong>余额:</strong>
                <strong>{{ store.formatCurrency(store.balance) }}</strong>
              </div>
            </div>
          </div>

          <!-- 设计 -->
          <div v-show="activeTab === 'design'" class="form-section">
            <h4>🎨 水印设置</h4>
            <div class="form-group">
              <label class="checkbox-option">
                <input type="checkbox" v-model="store.designSettings.watermarkEnabled" />
                启用水印
              </label>
            </div>
            <div v-if="store.designSettings.watermarkEnabled" class="design-group">
              <div class="form-row">
                <div class="form-group">
                  <label>水印文字</label>
                  <input v-model="store.designSettings.watermarkText" type="text" placeholder="OFFICIAL" />
                </div>
                <div class="form-group">
                  <label>透明度 (%)</label>
                  <input v-model.number="store.designSettings.watermarkOpacity" type="range" min="1" max="30" />
                  <span class="range-value">{{ store.designSettings.watermarkOpacity }}%</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>水印颜色</label>
                  <input v-model="store.designSettings.watermarkColor" type="color" />
                </div>
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

            <h4 style="margin-top: 20px;">🖼️ 边框设置</h4>
            <div class="form-group">
              <label class="checkbox-option">
                <input type="checkbox" v-model="store.designSettings.borderEnabled" />
                启用边框
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

            <h4 style="margin-top: 20px;">🔖 印章设置</h4>
            <div class="form-group">
              <label class="checkbox-option">
                <input type="checkbox" v-model="store.designSettings.stampEnabled" />
                启用印章
              </label>
            </div>
            <div v-if="store.designSettings.stampEnabled" class="design-group">
              <div class="form-group">
                <label>印章来源</label>
                <div class="radio-group">
                  <label><input type="radio" v-model="store.designSettings.stampSource" value="generate" /> 自动生成</label>
                  <label><input type="radio" v-model="store.designSettings.stampSource" value="upload" /> 上传图片</label>
                </div>
              </div>
              <div v-if="store.designSettings.stampSource === 'upload'" class="form-group">
                <label>上传印章图片</label>
                <div class="logo-actions">
                  <PhotoSelector v-model="store.designSettings.stampImage" />
                  <span class="or-divider">或</span>
                  <input type="file" accept="image/*" @change="handleStampUpload" />
                </div>
                <div v-if="store.designSettings.stampImage" class="image-preview">
                  <img :src="store.designSettings.stampImage" alt="印章" style="max-width: 100px; max-height: 100px;" />
                  <button @click="store.designSettings.stampImage = ''" class="btn-remove-sm">删除</button>
                </div>
              </div>
              <template v-if="store.designSettings.stampSource === 'generate'">
                <div class="form-row">
                  <div class="form-group">
                    <label>印章类型</label>
                    <select v-model="store.designSettings.stampType">
                      <option value="official">官方印章</option>
                      <option value="financial">财务专用</option>
                      <option value="received">收讫印章</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>印章颜色</label>
                    <input v-model="store.designSettings.stampColor" type="color" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>印章文字</label>
                    <input v-model="store.designSettings.stampText" type="text" placeholder="RECEIVED" />
                  </div>
                </div>
              </template>
              <div class="form-row">
                <div class="form-group">
                  <label>旋转角度</label>
                  <input v-model.number="store.designSettings.stampRotation" type="range" min="-45" max="45" />
                  <span class="range-value">{{ store.designSettings.stampRotation }}°</span>
                </div>
              </div>
            </div>

            <h4 style="margin-top: 20px;">📝 页脚文字设置</h4>
            <div class="design-group">
              <div class="form-group">
                <label>英文说明</label>
                <input v-model="store.designSettings.footerNoticeEn" type="text" placeholder="This is an official tuition receipt issued by" />
              </div>
              <div class="form-group">
                <label>中文说明</label>
                <input v-model="store.designSettings.footerNoticeCn" type="text" placeholder="本收据为官方出具的学费收据。" />
              </div>
              <div class="form-group">
                <label>税号标签</label>
                <input v-model="store.designSettings.footerTaxLabel" type="text" placeholder="Tax ID" />
              </div>
            </div>

            <h4 style="margin-top: 20px;">✒️ 字体设置</h4>
            <div class="form-group">
              <label>字体</label>
              <select v-model="store.designSettings.fontFamily">
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="'Helvetica Neue', sans-serif">Helvetica</option>
              </select>
            </div>
          </div>

          <!-- 设置 -->
          <div v-show="activeTab === 'settings'" class="form-section">
            <h4>模板选择</h4>
            <div class="template-grid">
              <div v-for="tpl in templates" :key="tpl.id" :class="['template-card', { active: store.settings.template === tpl.id }]" @click="store.settings.template = tpl.id">
                <span>{{ tpl.name }}</span>
              </div>
            </div>

            <h4 style="margin-top: 20px;">颜色设置</h4>
            <div class="form-row">
              <div class="form-group">
                <label>主色调</label>
                <input v-model="store.settings.primaryColor" type="color" />
              </div>
              <div class="form-group">
                <label>辅助色</label>
                <input v-model="store.settings.secondaryColor" type="color" />
              </div>
            </div>

            <h4 style="margin-top: 20px;">货币设置</h4>
            <div class="form-row">
              <div class="form-group">
                <label>货币</label>
                <CurrencySelector v-model="store.settings.currency" @update:modelValue="updateCurrencySymbol" />
              </div>
              <!-- 货币符号由所选货币提供，移除手动输入 -->
            </div>

            <h4 style="margin-top: 20px;">语言设置</h4>
            <div class="form-group">
              <label>显示语言</label>
              <select v-model="store.settings.language">
                <option value="en">English (英文)</option>
                <option value="zh">中文 (Chinese)</option>
              </select>
            </div>

            <h4 style="margin-top: 20px;">显示选项</h4>
            <div class="options-grid">
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showLogo" /> 显示学校Logo</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showQR" /> 显示二维码</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showBarcode" /> 显示条形码</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showPaymentHistory" /> 显示支付记录</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showScholarship" /> 显示奖学金</label>
            </div>

            <!-- 二维码设置 -->
            <div v-if="store.settings.showQR" class="design-group" style="margin-top: 16px;">
              <h4>📱 二维码设置</h4>
              <div class="form-group">
                <label>二维码来源</label>
                <div class="radio-group">
                  <label><input type="radio" v-model="store.settings.qrSource" value="generate" /> 自动生成</label>
                  <label><input type="radio" v-model="store.settings.qrSource" value="upload" /> 上传图片</label>
                </div>
              </div>
              <div v-if="store.settings.qrSource === 'upload'" class="form-group">
                <label>上传二维码图片</label>
                <div class="logo-actions">
                  <PhotoSelector v-model="store.settings.qrImage" />
                  <span class="or-divider">或</span>
                  <input type="file" accept="image/*" @change="handleQRUpload" />
                </div>
                <div v-if="store.settings.qrImage" class="image-preview">
                  <img :src="store.settings.qrImage" alt="二维码" style="max-width: 100px; max-height: 100px;" />
                  <button @click="store.settings.qrImage = ''" class="btn-remove-sm">删除</button>
                </div>
              </div>
              <div v-else class="form-group">
                <label>二维码内容 (留空使用收据编号)</label>
                <input v-model="store.settings.qrContent" type="text" placeholder="https://verify.school.edu/receipt/..." />
              </div>
            </div>
            
            <!-- 条形码设置 -->
            <div v-if="store.settings.showBarcode" class="design-group" style="margin-top: 16px;">
              <h4>📊 条形码设置</h4>
              <div class="form-group">
                <label>条形码来源</label>
                <div class="radio-group">
                  <label><input type="radio" v-model="store.settings.barcodeSource" value="generate" /> 自动生成</label>
                  <label><input type="radio" v-model="store.settings.barcodeSource" value="upload" /> 上传图片</label>
                </div>
              </div>
              <div v-if="store.settings.barcodeSource === 'upload'" class="form-group">
                <label>上传条形码图片</label>
                <div class="logo-actions">
                  <PhotoSelector v-model="store.settings.barcodeImage" />
                  <span class="or-divider">或</span>
                  <input type="file" accept="image/*" @change="handleBarcodeUpload" />
                </div>
                <div v-if="store.settings.barcodeImage" class="image-preview">
                  <img :src="store.settings.barcodeImage" alt="条形码" style="max-width: 150px; max-height: 60px;" />
                  <button @click="store.settings.barcodeImage = ''" class="btn-remove-sm">删除</button>
                </div>
              </div>
              <div v-else class="form-group">
                <label>条形码内容 (留空使用收据编号)</label>
                <input v-model="store.settings.barcodeContent" type="text" placeholder="收据编号或自定义内容" />
              </div>
            </div>
          </div>

          <!-- 数据管理 -->
          <div v-show="activeTab === 'data'" class="form-section">
            <SaveLoadPanel
              document-type="tuition_receipt"
              :get-data="() => ({ school: store.school, student: store.student, receipt: store.receipt, feeItems: store.feeItems, payments: store.payments, discounts: store.discounts, settings: store.settings })"
              :set-data="loadData"
            />
          </div>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-toolbar">
          <span>学费收据预览</span>
          <div class="toolbar-actions">
            <PreviewSizeSelector v-model="previewSize" />
            <button @click="showEmailModal = true" class="btn-email">📧 发送</button>
            <button @click="showDownloadPanel = true" class="btn-download">📥 下载</button>
          </div>
        </div>
        <div class="preview-container">
          <TuitionReceiptPreview ref="previewRef" :preview-size="previewSize" />
        </div>
      </div>
    </div>

    <!-- 邮件弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`TuitionReceipt_${store.receipt.number}`"
      :default-subject="`Tuition Receipt - ${store.school.name}`"
      preview-selector=".tuition-receipt-preview .receipt-document"
      @close="showEmailModal = false"
    />

    <!-- 下载面板 -->
    <DownloadPanel
      :visible="showDownloadPanel"
      preview-selector=".tuition-receipt-preview .receipt-document"
      :default-file-name="`TuitionReceipt_${store.receipt.number}`"
      @close="showDownloadPanel = false"
    />

    <!-- 支付弹窗 -->
    <Teleport to="body">
      <div v-if="store.paymentUI.showPaymentModal" class="modal-overlay" @click.self="store.paymentUI.showPaymentModal = false">
        <div class="payment-modal">
          <div class="modal-header">
            <h3>💳 在线支付</h3>
            <button class="btn-close" @click="store.paymentUI.showPaymentModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="payment-amount-display">
              <span class="label">应付金额</span>
              <span class="amount">{{ store.formatCurrency(store.balance) }}</span>
            </div>

            <div class="payment-methods">
              <h4>选择支付方式</h4>
              <div class="payment-method-grid">
                <label class="payment-method-card" :class="{ active: store.paymentUI.selectedPaymentMethod === 'bank_transfer' }">
                  <input type="radio" v-model="store.paymentUI.selectedPaymentMethod" value="bank_transfer" />
                  <div class="method-icon">🏦</div>
                  <div class="method-name">银行转账</div>
                </label>
                <label class="payment-method-card" :class="{ active: store.paymentUI.selectedPaymentMethod === 'credit_card' }">
                  <input type="radio" v-model="store.paymentUI.selectedPaymentMethod" value="credit_card" />
                  <div class="method-icon">💳</div>
                  <div class="method-name">信用卡</div>
                </label>
                <label class="payment-method-card" :class="{ active: store.paymentUI.selectedPaymentMethod === 'debit_card' }">
                  <input type="radio" v-model="store.paymentUI.selectedPaymentMethod" value="debit_card" />
                  <div class="method-icon">💵</div>
                  <div class="method-name">借记卡</div>
                </label>
                <label class="payment-method-card" :class="{ active: store.paymentUI.selectedPaymentMethod === 'online_payment' }">
                  <input type="radio" v-model="store.paymentUI.selectedPaymentMethod" value="online_payment" />
                  <div class="method-icon">📱</div>
                  <div class="method-name">在线支付</div>
                </label>
              </div>
            </div>

            <div class="payment-form">
              <div class="form-group">
                <label>支付金额</label>
                <input v-model.number="store.paymentUI.paymentAmount" type="number" :max="store.balance" />
              </div>
              <div class="form-group">
                <label>备注（可选）</label>
                <input v-model="store.paymentUI.paymentReference" type="text" placeholder="输入支付备注" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="store.paymentUI.showPaymentModal = false">取消</button>
            <button class="btn-confirm-payment" @click="store.processPayment()">
              确认支付 {{ store.formatCurrency(store.paymentUI.paymentAmount || store.balance) }}
            </button>
          </div>
        </div>
      </div>

      <!-- 支付成功弹窗 -->
      <div v-if="store.paymentUI.showSuccessModal" class="modal-overlay" @click.self="store.paymentUI.showSuccessModal = false">
        <div class="success-modal">
          <div class="success-icon">✓</div>
          <h3>支付成功!</h3>
          <p>您的学费已成功支付</p>
          <div class="success-details">
            <div class="detail-row">
              <span>支付金额:</span>
              <strong>{{ store.formatCurrency(store.payments[store.payments.length - 1]?.amount || 0) }}</strong>
            </div>
            <div class="detail-row">
              <span>支付方式:</span>
              <strong>{{ store.payments[store.payments.length - 1]?.method }}</strong>
            </div>
            <div class="detail-row">
              <span>参考号:</span>
              <strong>{{ store.payments[store.payments.length - 1]?.reference }}</strong>
            </div>
          </div>
          <button class="btn-success-close" @click="store.paymentUI.showSuccessModal = false">完成</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTuitionReceiptStore } from '@/stores/tuitionReceipt'
import TuitionReceiptPreview from '@/components/TuitionReceiptPreview.vue'
import EmailModal from '@/components/EmailModal.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import PreviewSizeSelector, { type PreviewSize } from '@/components/PreviewSizeSelector.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import StudentDocumentPicker from '@/components/StudentDocumentPicker.vue'
import type { MediaItem } from '@/types/media'
import * as XLSX from 'xlsx'
import CurrencySelector from '@/components/CurrencySelector.vue'
import { sharedCurrencies } from '@/lib/currencies'

const store = useTuitionReceiptStore()
const activeTab = ref('school')
const previewRef = ref()
const showEmailModal = ref(false)
const showDownloadPanel = ref(false)
const previewSize = ref<PreviewSize>('original')

const tabs = [
  { key: 'school', label: '学校信息' },
  { key: 'student', label: '学生信息' },
  { key: 'receipt', label: '收据信息' },
  { key: 'fees', label: '费用明细' },
  { key: 'payments', label: '支付记录' },
  { key: 'design', label: '设计' },
  { key: 'settings', label: '设置' },
  { key: 'data', label: '数据管理' }
]

const templates = [
  { id: 'modern', name: '现代风格' },
  { id: 'classic', name: '经典风格' },
  { id: 'minimal', name: '简约风格' }
]

const showPhotoLibrary = ref(false)
const photoLibrary = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
]

const handlePhotoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => { 
      store.student.photo = event.target?.result as string 
    }
    reader.readAsDataURL(file)
  }
}

// 照片库选择
const handlePhotoSelected = (photo: MediaItem) => {
  store.student.photo = photo.url
}

const selectPhoto = (photo: string) => {
  store.student.photo = photo
  showPhotoLibrary.value = false
}

const handleLogoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => { store.school.logo = event.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const handleStampUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => { store.designSettings.stampImage = ev.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const handleQRUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => { store.settings.qrImage = ev.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const handleBarcodeUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => { store.settings.barcodeImage = ev.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const updateCurrencySymbol = () => {
  const code = store.settings.currency
  const found = sharedCurrencies.find(c => c.code === code)
  store.settings.currencySymbol = found?.symbol || code || '$'
}

const loadData = (data: any) => {
  if (data.school) Object.assign(store.school, data.school)
  if (data.student) Object.assign(store.student, data.student)
  if (data.receipt) Object.assign(store.receipt, data.receipt)
  if (data.feeItems) store.feeItems = data.feeItems
  if (data.payments) store.payments = data.payments
  if (data.discounts) Object.assign(store.discounts, data.discounts)
  if (data.settings) Object.assign(store.settings, data.settings)
}

const fileInput = ref<HTMLInputElement>()

// 导出费用模板 (XLSX格式)
const exportFeesTemplate = () => {
  const template = [
    { Category: 'Tuition Fee', Description: 'Example: Undergraduate Tuition Fee - Spring 2026', Amount: 15000 },
    { Category: 'Registration Fee', Description: 'Example: Annual Registration Fee', Amount: 500 },
    { Category: 'Library Fee', Description: 'Example: Library Access Fee', Amount: 200 },
    { Category: 'Technology Fee', Description: 'Example: IT Services Fee', Amount: 350 }
  ]
  
  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '费用明细')
  
  // 设置列宽
  ws['!cols'] = [
    { wch: 20 },
    { wch: 50 },
    { wch: 12 }
  ]
  
  XLSX.writeFile(wb, '学费收据费用模板.xlsx')
}

// 处理从资料管理选择的文档
async function handleDocumentSelect(document: any) {
  if (!document) return
  
  try {
    if (document.file_url) {
      // 尝试下载并解析文件
      const response = await fetch(document.file_url)
      const blob = await response.blob()
      const file = new File([blob], document.file_name || 'document', { type: blob.type })
      
      // 模拟事件对象来复用现有的处理函数
      const fakeEvent = {
        target: { 
          files: [file],
          value: ''
        }
      } as unknown as Event
      
      await handleImportFees(fakeEvent)
    } else {
      alert('该文档没有可解析的文件')
    }
  } catch (e) {
    console.error('处理文档失败:', e)
    alert('解析文档失败，请确保文件格式正确')
  }
}

// 导入费用明细 (支持XLSX和CSV)
const handleImportFees = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  try {
    const fileName = file.name.toLowerCase()
    
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // 解析 Excel 文件
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      if (jsonData.length === 0) {
        alert('文件中没有有效数据')
        return
      }
      
      const importedFees = jsonData.map((row: any, index: number) => ({
        id: Date.now() + index + '',
        category: row['Category'] || row['category'] || row['类别'] || '',
        description: row['Description'] || row['description'] || row['描述'] || '',
        amount: parseFloat(row['Amount'] || row['amount'] || row['金额'] || 0) || 0
      }))
      
      store.feeItems = importedFees
      alert(`成功导入 ${importedFees.length} 条费用记录`)
    } else {
      // 解析 CSV 文件
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      // 跳过表头
      const dataLines = lines.slice(1)
      const importedFees = dataLines.map((line, index) => {
        const matches = line.match(/(?:"([^"]*)"|([^,]+)),(?:"([^"]*)"|([^,]+)),([^,]+)/)
        if (matches) {
          return {
            id: Date.now() + index + '',
            category: matches[1] || matches[2] || '',
            description: matches[3] || matches[4] || '',
            amount: parseFloat(matches[5]) || 0
          }
        }
        return null
      }).filter(Boolean)
      
      if (importedFees.length > 0) {
        store.feeItems = importedFees as any[]
        alert(`成功导入 ${importedFees.length} 条费用记录`)
      }
    }
  } catch (error) {
    console.error('解析文件失败:', error)
    alert('解析文件失败，请检查文件格式')
  }
  
  // 重置input
  if (e.target) (e.target as HTMLInputElement).value = ''
}

</script>

<style scoped>
.tuition-receipt-view { height: 100%; display: flex; flex-direction: column; }
.view-content { flex: 1; display: flex; gap: 20px; padding: 20px; overflow: hidden; }

.edit-panel { flex: 4; min-width: 0; display: flex; flex-direction: column; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden; }
.panel-header { padding: 20px; background: linear-gradient(135deg, #003d82, #0066cc); color: white; }
.header-row { display: flex; justify-content: space-between; align-items: center; }
.header-text h2 { margin: 0; font-size: 20px; }
.header-text p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }

.tabs { display: flex; flex-wrap: wrap; gap: 4px; padding: 12px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
.tab { padding: 8px 14px; background: transparent; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; color: #64748b; transition: all 0.2s; }
.tab:hover { background: #e2e8f0; color: #334155; }
.tab.active { background: #003d82; color: white; }

.tab-content { flex: 1; overflow-y: auto; padding: 20px; }
.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #374151; }
.form-group input, .form-group select, .form-group textarea { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #003d82; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.input-with-button { display: flex; gap: 8px; }
.input-with-button input { flex: 1; }
.btn-generate { padding: 10px 16px; background: #003d82; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }

.image-preview { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
.image-preview img { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
.btn-remove { padding: 6px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }

.fee-item-row, .payment-item-row { margin-bottom: 12px; }
.fee-item-fields, .payment-item-fields { display: flex; gap: 8px; align-items: center; }
.category-select { width: 140px; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
.description-input { flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
.amount-input { width: 100px; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; text-align: right; }
.date-input { width: 130px; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
.method-select { width: 120px; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
.reference-input { flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
.btn-remove-sm { width: 28px; height: 28px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }

.btn-add { padding: 10px; background: #f0f9ff; color: #0369a1; border: 1px dashed #0369a1; border-radius: 8px; cursor: pointer; font-size: 13px; }

.summary-box { background: linear-gradient(135deg, #003d82, #0066cc); color: white; padding: 16px; border-radius: 12px; margin-top: 16px; }
.summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
.summary-row.total { border-top: 1px solid rgba(255,255,255,0.3); margin-top: 8px; padding-top: 12px; font-size: 16px; }
.summary-row .paid { color: #86efac; }
.summary-row.overdue strong { color: #fca5a5; }

.template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.template-card { padding: 16px; background: #f8fafc; border: 2px solid transparent; border-radius: 10px; text-align: center; cursor: pointer; transition: all 0.2s; font-size: 13px; }
.template-card:hover { border-color: #003d82; }
.template-card.active { border-color: #003d82; background: #eff6ff; }

.options-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.checkbox-option { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }

.preview-panel { flex: 6; min-width: 0; display: flex; flex-direction: column; background: #f1f5f9; border-radius: 16px; overflow: hidden; }
.preview-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-bottom: 1px solid #e5e7eb; }
.preview-toolbar span { font-size: 14px; font-weight: 600; }
.toolbar-actions { display: flex; gap: 10px; }
.btn-email { padding: 10px 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.btn-download { padding: 10px 20px; background: linear-gradient(135deg, #003d82, #0066cc); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.preview-container { flex: 1; padding: 20px; overflow: auto; display: flex; justify-content: center; align-items: flex-start; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.section-header h4 { margin: 0; }
.header-actions { display: flex; gap: 8px; }
.btn-import, .btn-export { padding: 8px 12px; background: #f0f9ff; color: #0369a1; border: 1px solid #0369a1; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.btn-import:hover, .btn-export:hover { background: #0369a1; color: white; }
.btn-pay-now { padding: 10px 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }

.design-group { background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 12px; }
.range-value { font-size: 12px; color: #64748b; margin-left: 8px; }
input[type="range"] { width: 100%; }

.radio-group { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
.radio-group label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; }
.radio-group input[type="radio"] { width: 16px; height: 16px; margin: 0; accent-color: #003d82; }

.image-preview { margin-top: 10px; display: flex; align-items: center; gap: 10px; }
.btn-remove-sm { padding: 4px 8px; background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; }

/* 支付弹窗 */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.payment-modal, .success-modal { background: white; border-radius: 16px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 18px; }
.btn-close { width: 32px; height: 32px; border: none; background: #fee2e2; color: #dc2626; border-radius: 50%; font-size: 20px; cursor: pointer; }
.modal-body { padding: 24px; }
.payment-amount-display { background: linear-gradient(135deg, #003d82, #0066cc); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px; }
.payment-amount-display .label { font-size: 14px; opacity: 0.9; display: block; margin-bottom: 8px; }
.payment-amount-display .amount { font-size: 32px; font-weight: bold; }

.payment-methods h4 { font-size: 14px; margin: 0 0 12px; color: #374151; }
.payment-method-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
.payment-method-card { position: relative; padding: 16px; border: 2px solid #e5e7eb; border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s; }
.payment-method-card input[type="radio"] { position: absolute; opacity: 0; }
.payment-method-card:hover { border-color: #003d82; }
.payment-method-card.active { border-color: #003d82; background: #eff6ff; }
.method-icon { font-size: 32px; margin-bottom: 8px; }
.method-name { font-size: 13px; font-weight: 500; color: #374151; }

.payment-form { margin-top: 20px; }
.payment-form .form-group { margin-bottom: 16px; }

.modal-footer { padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end; }
.btn-cancel { padding: 10px 20px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; cursor: pointer; }
.btn-confirm-payment { padding: 10px 24px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* 成功弹窗 */
.success-modal { padding: 40px; text-align: center; max-width: 400px; }
.success-icon { width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; }
.success-modal h3 { margin: 0 0 8px; font-size: 24px; color: #111827; }
.success-modal p { margin: 0 0 24px; color: #6b7280; }
.success-details { background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: left; }
.detail-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
.detail-row span { color: #6b7280; }
.detail-row strong { color: #111827; }
.btn-success-close { width: 100%; padding: 12px; background: linear-gradient(135deg, #003d82, #0066cc); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }

/* Photo Upload Styles */
.photo-upload-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 5px;
}

.current-photo {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.current-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-photo {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.photo-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-btn-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.btn-upload {
  border: 1px solid #d1d5db;
  color: #374151;
  background-color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  width: 100%;
}

.upload-btn-wrapper input[type=file] {
  font-size: 100px;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
}

.btn-library {
  border: 1px solid #003d82;
  color: #003d82;
  background-color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.btn-library:hover {
  background-color: #f0f9ff;
}

.photo-library {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.library-item {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  background: white;
}

.library-item:hover {
  border-color: #003d82;
  transform: scale(1.05);
}

.library-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

</style>
