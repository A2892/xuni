<template>
  <div class="uk-evisa-view">
    <!-- 左侧编辑面板 -->
    <div class="edit-panel">
      <div class="panel-header">
        <h2>🇬🇧 英国电子签证生成器</h2>
        <p class="subtitle">UK eVisa Generator</p>
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

      <!-- 数据管理 -->
      <div class="data-management-section">
        <SaveLoadPanel 
          document-type="uk_evisa" 
          :get-data="() => store.data" 
          :set-data="(data: any) => Object.assign(store.data, data)" 
        />
      </div>

      <!-- 基本信息 -->
      <div v-show="activeTab === 'basic'" class="tab-content">
        <div class="form-section">
          <h3>📋 个人信息</h3>
          
          <div class="photo-upload-section">
            <div class="photo-preview">
              <img v-if="store.data.photo" :src="store.data.photo" alt="Photo" />
              <div v-else class="photo-placeholder">
                <span>📷</span>
                <span>上传照片</span>
              </div>
            </div>
            <input type="file" ref="photoInput" accept="image/*" @change="handlePhotoUpload" style="display: none" />
            <div class="photo-actions">
              <button class="btn-secondary" @click="($refs.photoInput as HTMLInputElement).click()">
                选择照片
              </button>
              <button v-if="store.data.photo" class="btn-danger-sm" @click="store.data.photo = ''">
                移除
              </button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>姓氏 (Surname) *</label>
              <input v-model="store.data.surname" type="text" placeholder="ZHANG" />
            </div>
            <div class="form-group">
              <label>名字 (Given Names) *</label>
              <input v-model="store.data.givenNames" type="text" placeholder="SAN" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>出生日期 *</label>
              <input v-model="store.data.dateOfBirth" type="date" />
            </div>
            <div class="form-group">
              <label>性别</label>
              <select v-model="store.data.sex">
                <option value="M">男 (M)</option>
                <option value="F">女 (F)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>国籍 (Nationality) *</label>
            <input v-model="store.data.nationality" type="text" placeholder="China" />
          </div>
        </div>

        <div class="form-section">
          <h3>🛂 护照信息</h3>
          
          <div class="form-group">
            <label>护照号码 *</label>
            <input v-model="store.data.passportNumber" type="text" placeholder="E12345678" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>护照类型</label>
              <select v-model="store.data.passportType">
                <option value="P">普通护照 (P)</option>
                <option value="D">外交护照 (D)</option>
                <option value="S">公务护照 (S)</option>
              </select>
            </div>
            <div class="form-group">
              <label>签发国家代码</label>
              <input v-model="store.data.passportCountry" type="text" placeholder="CHN" />
            </div>
          </div>
        </div>
      </div>

      <!-- 签证信息 -->
      <div v-show="activeTab === 'visa'" class="tab-content">
        <div class="form-section">
          <h3>📑 签证类型</h3>
          
          <div class="form-group">
            <label>签证类别 *</label>
            <select v-model="store.data.visaType" @change="updateVisaCategory">
              <option v-for="(type, key) in visaTypeOptions" :key="key" :value="key">
                {{ type.icon }} {{ type.name }} ({{ type.code }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>签证状态</label>
            <select v-model="store.data.visaStatus">
              <option value="valid">有效 (Valid)</option>
              <option value="expired">已过期 (Expired)</option>
              <option value="cancelled">已取消 (Cancelled)</option>
            </select>
          </div>

          <div class="form-group">
            <label>电子签证号码</label>
            <div class="input-with-button">
              <input v-model="store.data.evisaNumber" type="text" placeholder="UK-2024-123456789" />
              <button class="btn-icon" @click="store.generateEvisaNumber()" title="生成签证号">
                🔄
              </button>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📅 有效期</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>签发日期</label>
              <input v-model="store.data.issueDate" type="date" />
            </div>
            <div class="form-group">
              <label>到期日期</label>
              <input v-model="store.data.expiryDate" type="date" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>有效期从</label>
              <input v-model="store.data.validFrom" type="date" />
            </div>
            <div class="form-group">
              <label>有效期至</label>
              <input v-model="store.data.validUntil" type="date" />
            </div>
          </div>

          <div class="validity-info">
            <div class="info-badge" :class="store.data.visaStatus">
              <span class="badge-label">状态:</span>
              <span class="badge-value">{{ store.getStatusLabel.value }}</span>
            </div>
            <div class="info-badge days">
              <span class="badge-label">剩余天数:</span>
              <span class="badge-value">{{ store.getDaysRemaining.value }} 天</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🔐 生物识别信息</h3>
          
          <div class="form-group">
            <label>生物识别号码</label>
            <input v-model="store.data.biometricNumber" type="text" placeholder="BIO123456789UK" />
          </div>

          <div class="form-group">
            <label>生物识别采集日期</label>
            <input v-model="store.data.biometricDate" type="date" />
          </div>
        </div>
      </div>

      <!-- 担保人信息 -->
      <div v-show="activeTab === 'sponsor'" class="tab-content">
        <div class="form-section">
          <h3>🏫 担保人信息</h3>
          <p class="section-note">适用于学生签证或工作签证</p>
          
          <div class="form-group">
            <label>担保人名称</label>
            <input v-model="store.data.sponsor" type="text" placeholder="University of London" />
          </div>

          <div class="form-group">
            <label>担保人许可证号</label>
            <input v-model="store.data.sponsorLicenseNumber" type="text" placeholder="SPONSOR12345" />
          </div>

          <div v-if="store.data.visaType === 'student'" class="form-group">
            <label>课程名称</label>
            <input v-model="store.data.courseTitle" type="text" placeholder="MSc Computer Science" />
          </div>

          <div v-if="store.data.visaType === 'work'" class="form-group">
            <label>雇主名称</label>
            <input v-model="store.data.employerName" type="text" placeholder="Company Name" />
          </div>
        </div>

        <div class="form-section">
          <h3>🏠 英国地址</h3>
          
          <div class="form-group">
            <label>地址</label>
            <input v-model="store.data.ukAddress" type="text" placeholder="123 London Road, London" />
          </div>

          <div class="form-group">
            <label>邮编</label>
            <input v-model="store.data.ukPostcode" type="text" placeholder="SW1A 1AA" />
          </div>
        </div>
      </div>

      <!-- 权限和条件 -->
      <div v-show="activeTab === 'conditions'" class="tab-content">
        <div class="form-section">
          <h3>✓ 权限设置</h3>
          
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.data.workAllowed" />
              <span>允许工作 (Work Permitted)</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.data.studyAllowed" />
              <span>允许学习 (Study Permitted)</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.data.publicFundsAllowed" />
              <span>允许公共资金 (Public Funds Allowed)</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3>📝 签证条件</h3>
          
          <div class="conditions-editor">
            <div v-for="(condition, index) in store.data.conditions" :key="index" class="condition-item">
              <input v-model="store.data.conditions[index]" type="text" class="condition-input" />
              <button class="btn-danger-sm" @click="removeCondition(index)">删除</button>
            </div>
            <button class="btn-secondary" @click="addCondition">+ 添加条件</button>
          </div>
        </div>

        <div class="form-section">
          <h3>📋 备注</h3>
          
          <div class="form-group">
            <textarea v-model="store.data.remarks" rows="4" placeholder="输入备注信息..."></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>🔗 分享码</h3>
          <p class="section-note">用于在线验证移民身份</p>
          
          <div class="form-group">
            <div class="input-with-button">
              <input v-model="store.data.shareCode" type="text" placeholder="ABC123DEF456" />
              <button class="btn-icon" @click="store.generateShareCode()" title="生成分享码">
                🔄
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 设计设置 -->
      <div v-show="activeTab === 'design'" class="tab-content">
        <div class="form-section">
          <h3>🎨 显示选项</h3>
          
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.designSettings.showPhoto" />
              <span>显示照片</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.designSettings.showQRCode" />
              <span>显示二维码</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.designSettings.showBiometric" />
              <span>显示生物识别信息</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.designSettings.showConditions" />
              <span>显示条件和限制</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3>💧 水印设置</h3>
          
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="store.designSettings.showWatermark" />
              <span>启用水印</span>
            </label>
          </div>

          <div v-if="store.designSettings.showWatermark">
            <div class="form-group">
              <label>水印文字</label>
              <input v-model="store.designSettings.watermarkText" type="text" />
            </div>

            <div class="form-group">
              <label>不透明度: {{ store.designSettings.watermarkOpacity }}%</label>
              <input 
                v-model.number="store.designSettings.watermarkOpacity" 
                type="range" 
                min="5" 
                max="30" 
                step="1" 
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🎯 其他设置</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>背景颜色</label>
              <input v-model="store.designSettings.backgroundColor" type="color" />
            </div>
            <div class="form-group">
              <label>强调色</label>
              <input v-model="store.designSettings.accentColor" type="color" />
            </div>
          </div>

          <div class="form-group">
            <label>字体大小: {{ store.designSettings.fontSize }}px</label>
            <input 
              v-model.number="store.designSettings.fontSize" 
              type="range" 
              min="12" 
              max="18" 
              step="1" 
            />
          </div>
        </div>

        <div class="form-section">
          <h3>🔄 快速操作</h3>
          <div class="action-buttons">
            <button class="btn-secondary" @click="store.resetData()">重置数据</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧预览面板 -->
    <div class="preview-panel">
      <div class="preview-header">
        <h3>预览</h3>
        <div class="preview-actions">
          <button class="btn-primary" @click="downloadEvisa">
            <span>📥</span>
            下载
          </button>
        </div>
      </div>
      <div class="preview-content">
        <UKEvisaPreview />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUKEvisaStore, visaTypeOptions } from '@/stores/ukEvisa'
import UKEvisaPreview from '@/components/UKEvisaPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import html2canvas from 'html2canvas'

const store = useUKEvisaStore()

const activeTab = ref('basic')
const photoInput = ref<HTMLInputElement>()

const tabs = [
  { id: 'basic', label: '基本信息', icon: '👤' },
  { id: 'visa', label: '签证信息', icon: '🛂' },
  { id: 'sponsor', label: '担保人', icon: '🏫' },
  { id: 'conditions', label: '权限条件', icon: '✓' },
  { id: 'design', label: '设计', icon: '🎨' }
]

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.data.photo = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const updateVisaCategory = () => {
  const selectedType = visaTypeOptions[store.data.visaType as keyof typeof visaTypeOptions]
  if (selectedType) {
    store.data.visaCategory = selectedType.code
  }
}

const addCondition = () => {
  store.data.conditions.push('')
}

const removeCondition = (index: number) => {
  store.data.conditions.splice(index, 1)
}

const downloadEvisa = async () => {
  const previewElement = document.querySelector('.uk-evisa-preview') as HTMLElement
  if (!previewElement) return

  try {
    const canvas = await html2canvas(previewElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false
    })

    const link = document.createElement('a')
    link.download = `UK-eVisa-${store.data.evisaNumber}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败，请重试')
  }
}
</script>

<style scoped>
.uk-evisa-view {
  display: flex;
  gap: 30px;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 左侧编辑面板 */
.edit-panel {
  flex: 1;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  max-height: calc(100vh - 40px);
}

.panel-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.panel-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* 选项卡 */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-btn {
  flex: 1;
  min-width: 90px;
  padding: 10px 12px;
  background: #f3f4f6;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.tab-btn.active {
  background: #9e1b34;
  color: white;
  border-color: #7a1529;
}

.tab-icon {
  font-size: 16px;
}

/* 数据管理 */
.data-management-section {
  margin-bottom: 20px;
}

/* 表单区域 */
.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.section-note {
  font-size: 12px;
  color: #6b7280;
  margin: -8px 0 12px 0;
  font-style: italic;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #9e1b34;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.input-with-button {
  display: flex;
  gap: 8px;
}

.input-with-button input {
  flex: 1;
}

.btn-icon {
  padding: 10px 14px;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e5e7eb;
  transform: rotate(180deg);
}

/* 照片上传 */
.photo-upload-section {
  margin-bottom: 16px;
  text-align: center;
}

.photo-preview {
  width: 150px;
  height: 180px;
  margin: 0 auto 12px;
  border: 3px solid #9e1b34;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 40px;
  color: #9ca3af;
}

.photo-placeholder span:last-child {
  font-size: 12px;
}

.photo-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 按钮 */
.btn-secondary {
  padding: 8px 16px;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger-sm {
  padding: 8px 16px;
  background: #fee2e2;
  border: 2px solid #fecaca;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger-sm:hover {
  background: #fecaca;
}

/* 复选框组 */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.checkbox-label:hover {
  background: #f3f4f6;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 条件编辑器 */
.conditions-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.condition-item {
  display: flex;
  gap: 8px;
}

.condition-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
}

/* 有效期信息 */
.validity-info {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.info-badge {
  flex: 1;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  text-align: center;
}

.info-badge.valid {
  border-color: #10b981;
  background: #d1fae5;
}

.info-badge.expired {
  border-color: #ef4444;
  background: #fee2e2;
}

.info-badge.days {
  border-color: #3b82f6;
  background: #dbeafe;
}

.badge-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.badge-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .btn-secondary {
  flex: 1;
  padding: 12px;
}

/* 右侧预览面板 */
.preview-panel {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  max-height: calc(100vh - 40px);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.preview-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #9e1b34;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #7a1529;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(158, 27, 52, 0.3);
}

.preview-content {
  display: flex;
  justify-content: center;
}

/* 响应式 */
@media (max-width: 1200px) {
  .uk-evisa-view {
    flex-direction: column;
  }

  .edit-panel,
  .preview-panel {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .tabs {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
