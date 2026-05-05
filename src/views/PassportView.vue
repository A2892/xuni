<script setup lang="ts">
import { ref } from 'vue'
import { usePassportStore } from '@/stores/passport'
import PassportPreview from '@/components/PassportPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import { downloadAsPDFWithOptions } from '@/utils/documentGenerator'

const store = usePassportStore()
const activeTab = ref('输入字段')

const tabs = ['输入字段', '上传文件', '数据管理']

// 文件上传
const photoInput = ref<HTMLInputElement>()
const signatureInput = ref<HTMLInputElement>()

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      store.updatePassportInfo({ photo: result })
    }
    reader.readAsDataURL(file)
  }
}

const handleSignatureUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      store.updatePassportInfo({ signature: result })
    }
    reader.readAsDataURL(file)
  }
}

const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const triggerSignatureUpload = () => {
  signatureInput.value?.click()
}

// 下载护照
const downloadPassport = async () => {
  const previewElement = document.querySelector('.german-passport') as HTMLElement
  if (!previewElement) return

  try {
    await downloadAsPDFWithOptions(previewElement, `德国护照-${store.passportInfo.surname}`, {
      scale: 3,
      backgroundColor: '#8B0000'
    })
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败，请重试')
  }
}
</script>

<template>
  <div class="passport-view">
    <div class="content-wrapper">
      <!-- 左侧表单面板 -->
      <div class="form-panel">
        <div class="panel-header">
          <h2>🇩🇪 德国护照生成器</h2>
          <p>在线生成德国护照 - 快速便捷</p>
        </div>

        <!-- 标签切换 -->
        <div class="tab-navigation">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="['tab-btn', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <!-- 输入字段 -->
        <div v-show="activeTab === '输入字段'" class="tab-content">
          <div class="form-section">
            <h3>基本信息</h3>
            
            <div class="form-group">
              <label>姓 (Surname) *</label>
              <input
                v-model="store.passportInfo.surname"
                type="text"
                placeholder="MUSTERMANN"
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label>名 (Given Names) *</label>
              <input
                v-model="store.passportInfo.givenNames"
                type="text"
                placeholder="ERIKA"
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label>国籍 (Nationality)</label>
              <input
                v-model="store.passportInfo.nationality"
                type="text"
                placeholder="DEUTSCH"
                class="input-field"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>出生日期</label>
                <input
                  v-model="store.passportInfo.dateOfBirth"
                  type="text"
                  placeholder="12.08.1964"
                  class="input-field"
                />
              </div>

              <div class="form-group">
                <label>性别 (M/F)</label>
                <input
                  v-model="store.passportInfo.sex"
                  type="text"
                  placeholder="F"
                  maxlength="1"
                  class="input-field"
                />
              </div>
            </div>

            <div class="form-group">
              <label>出生地点</label>
              <input
                v-model="store.passportInfo.placeOfBirth"
                type="text"
                placeholder="BERLIN"
                class="input-field"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>护照信息</h3>
            
            <div class="form-group">
              <label>护照号码 (1个字母 + 7位数字) *</label>
              <input
                v-model="store.passportInfo.passportNumber"
                type="text"
                placeholder="C01X0006H"
                maxlength="9"
                class="input-field"
              />
              <small>格式: C01X0006H</small>
            </div>

            <div class="form-group">
              <label>护照类型</label>
              <select v-model="store.passportInfo.passportType" class="input-field">
                <option value="P">P - 普通护照</option>
                <option value="D">D - 外交护照</option>
                <option value="S">S - 公务护照</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>签发日期</label>
                <input
                  v-model="store.passportInfo.dateOfIssue"
                  type="text"
                  placeholder="01.08.2020"
                  class="input-field"
                />
              </div>

              <div class="form-group">
                <label>到期日期</label>
                <input
                  v-model="store.passportInfo.dateOfExpiry"
                  type="text"
                  placeholder="31.07.2030"
                  class="input-field"
                />
              </div>
            </div>

            <div class="form-group">
              <label>签发机关</label>
              <input
                v-model="store.passportInfo.authority"
                type="text"
                placeholder="BUNDESDRUCKEREI GMBH"
                class="input-field"
              />
            </div>
          </div>
        </div>

        <!-- 上传文件 -->
        <div v-show="activeTab === '上传文件'" class="tab-content">
          <div class="upload-section">
            <h3>上传照片</h3>
            <div class="upload-area" @click="triggerPhotoUpload">
              <input
                ref="photoInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handlePhotoUpload"
              />
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p v-if="!store.passportInfo.photo">点击上传照片</p>
              <p v-else class="uploaded">✓ 照片已上传</p>
              <small>建议尺寸: 35mm x 45mm</small>
            </div>
          </div>

          <div class="upload-section">
            <h3>上传签名</h3>
            <div class="upload-area" @click="triggerSignatureUpload">
              <input
                ref="signatureInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleSignatureUpload"
              />
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
              <p v-if="!store.passportInfo.signature">点击上传签名</p>
              <p v-else class="uploaded">✓ 签名已上传</p>
              <small>透明背景的签名图片</small>
            </div>
          </div>

          <div class="tips-box">
            <h4>📝 温馨提示</h4>
            <ul>
              <li>照片要求: 白色背景, 35mm x 45mm</li>
              <li>签名图片建议使用透明背景PNG格式</li>
              <li>所有日期格式: DD.MM.YYYY (如 01.08.2020)</li>
              <li>护照号格式: 1个字母 + 7位数字 (如 C01X0006H)</li>
            </ul>
          </div>
        </div>

        <!-- 数据管理 -->
        <div v-show="activeTab === '数据管理'" class="tab-content">
          <SaveLoadPanel 
            document-type="passport"
            :get-data="() => store.$state"
            :set-data="(data: any) => store.$patch(data)"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="btn-download" @click="downloadPassport">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载护照
          </button>
          <button class="btn-reset" @click="store.resetToDefault()">
            重置表单
          </button>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>实时预览</h3>
          <div class="price-tag">
            <span class="currency">$</span>
            <span class="amount">8.99</span>
          </div>
        </div>
        
        <PassportPreview />
      </div>
    </div>
  </div>
</template>

<style scoped>
.passport-view {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 24px;
  align-items: start;
}

/* 左侧表单面板 */
.form-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  overflow: hidden;
  position: sticky;
  top: 24px;
}

.panel-header {
  background: linear-gradient(135deg, #000 0%, #333 100%);
  color: white;
  padding: 24px;
  text-align: center;
}

.panel-header h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 700;
}

.panel-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.tab-navigation {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.tab-btn {
  flex: 1;
  padding: 16px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab-btn:hover {
  color: #000;
  background: rgba(0,0,0,0.05);
}

.tab-btn.active {
  color: #000;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #000;
}

.tab-content {
  padding: 24px;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #000;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.form-group small {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.input-field:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-section h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #000;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #000;
  background: #f0f0f0;
}

.upload-area svg {
  color: #999;
  margin-bottom: 12px;
}

.upload-area p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.upload-area .uploaded {
  color: #28a745;
  font-weight: 600;
}

.upload-area small {
  color: #999;
  font-size: 12px;
}

.tips-box {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.tips-box h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #856404;
}

.tips-box ul {
  margin: 0;
  padding-left: 20px;
}

.tips-box li {
  font-size: 12px;
  color: #856404;
  margin-bottom: 6px;
}

.action-buttons {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8f9fa;
}

.action-buttons button {
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
}

.btn-download {
  background: linear-gradient(135deg, #000 0%, #333 100%);
  color: white;
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.btn-reset {
  background: white;
  color: #666;
  border: 2px solid #e0e0e0;
}

.btn-reset:hover {
  border-color: #000;
  color: #000;
}

/* 右侧预览面板 */
.preview-panel {
  background: transparent;
  border-radius: 16px;
  padding: 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

.preview-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.price-tag {
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.currency {
  font-size: 16px;
  color: #666;
  font-weight: 600;
}

.amount {
  font-size: 24px;
  font-weight: 700;
  color: #000;
  margin-left: 4px;
}

/* 滚动条 */
.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}

@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .form-panel {
    position: static;
  }
}
</style>
