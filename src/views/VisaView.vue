<template>
  <div class="visa-view">
    <!-- 左侧编辑面板 -->
    <div class="edit-panel">
      <div class="panel-header">
        <div>
          <h2>🛂 签证生成器</h2>
          <p class="subtitle">支持多国签证模板</p>
        </div>
        <div class="header-shortcuts">
          <button class="btn-secondary" @click="goToVisaWorkflow('/visa-center')">签证中心</button>
          <button class="btn-secondary" @click="goToVisaWorkflow('/visa-checklist')">材料清单</button>
          <button class="btn-secondary" @click="goToVisaWorkflow('/visa-progress')">进度追踪</button>
        </div>
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
          document-type="visa" 
          :get-data="() => store.data" 
          :set-data="(data: any) => Object.assign(store.data, data)" 
        />
      </div>

      <!-- 模板选择 -->
      <div v-show="activeTab === 'template'" class="tab-content">
        <div class="form-section">
          <h3>选择签证模板</h3>
          <div class="form-group">
            <select v-model="store.data.template" @change="selectVisaTemplate(store.data.template)" class="form-select">
              <option v-for="(template, key) in visaTemplates" :key="key" :value="key">
                {{ getFlag(key) }} {{ template.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>签证类型</h3>
          <div class="form-group">
            <select v-model="store.data.visaType" @change="store.selectVisaType(store.data.visaType)" class="form-select">
              <option v-for="type in currentVisaTypeOptions" :key="type.key" :value="type.key">
                {{ type.icon }} {{ type.code }} - {{ type.name }}
              </option>
            </select>
          </div>
          <div class="form-note">
            {{ store.currentVisaTypeOption.duration }} · {{ store.currentVisaTypeOption.purpose }} · {{ store.currentVisaTypeOption.annotation }}
          </div>
        </div>

        <div class="form-section">
          <h3>入境次数</h3>
          <div class="entry-type-btns">
            <button 
              v-for="entry in entryTypes" 
              :key="entry.value"
              :class="['entry-btn', { active: store.data.entryType === entry.value }]"
              @click="store.data.entryType = entry.value"
            >
              {{ entry.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 持有人信息 -->
      <div v-show="activeTab === 'holder'" class="tab-content">
        <div class="form-section">
          <h3>👤 持有人信息</h3>
          
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
              <label>姓氏 (Surname)</label>
              <input v-model="store.data.surname" type="text" placeholder="ZHANG" />
            </div>
            <div class="form-group">
              <label>名字 (Given Names)</label>
              <input v-model="store.data.givenNames" type="text" placeholder="SAN" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>国籍 (Nationality)</label>
              <select v-model="store.data.nationality">
                <option v-for="country in countries" :key="country.code" :value="country.code">
                  {{ country.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>性别 (Sex)</label>
              <select v-model="store.data.sex">
                <option value="M">男 (M)</option>
                <option value="F">女 (F)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>出生日期</label>
              <input v-model="store.data.dateOfBirth" type="date" />
            </div>
            <div class="form-group">
              <label>护照号码</label>
              <input v-model="store.data.passportNumber" type="text" placeholder="E12345678" />
            </div>
          </div>
        </div>
      </div>

      <!-- 签证信息 -->
      <div v-show="activeTab === 'visa'" class="tab-content">
        <div class="form-section">
          <h3>📋 签证信息</h3>

          <div class="form-row">
            <div class="form-group">
              <label>签证号码</label>
              <div class="input-with-btn">
                <input v-model="store.data.visaNumber" type="text" />
                <button class="btn-generate" @click="generateVisaNumber">🎲</button>
              </div>
            </div>
            <div class="form-group">
              <label>控制号码</label>
              <div class="input-with-btn">
                <input v-model="store.data.controlNumber" type="text" />
                <button class="btn-generate" @click="generateControlNumber">🎲</button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>签证类别代码</label>
              <input v-model="store.data.visaClass" type="text" placeholder="B-2" />
            </div>
            <div class="form-group">
              <label>停留期限</label>
              <input v-model="store.data.duration" type="text" placeholder="10 YEARS" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>签发国家</label>
              <input v-model="store.data.issuingCountry" type="text" placeholder="UNITED STATES" />
            </div>
            <div class="form-group">
              <label>签发地点</label>
              <input v-model="store.data.issuingPost" type="text" placeholder="BEIJING" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>签发日期</label>
              <input v-model="store.data.issueDate" type="date" />
            </div>
            <div class="form-group">
              <label>有效期开始</label>
              <input v-model="store.data.validFrom" type="date" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>有效期截止</label>
              <input v-model="store.data.expiryDate" type="date" />
            </div>
          </div>

          <div class="form-group">
            <label>目的/Purpose</label>
            <input v-model="store.data.purpose" type="text" placeholder="TOURISM/BUSINESS" />
          </div>

          <div class="form-group">
            <label>备注 (Annotation)</label>
            <textarea v-model="store.data.annotation" rows="2" placeholder="MULTIPLE ENTRY"></textarea>
          </div>
        </div>
      </div>

      <!-- 设计功能 -->
      <div v-show="activeTab === 'design'" class="tab-content">
        <div class="form-section">
          <h3>🎨 水印设置</h3>
          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.watermarkEnabled" />
              <span class="toggle-label">启用水印</span>
            </label>
          </div>
          <div v-if="store.designSettings.watermarkEnabled" class="sub-form">
            <div class="form-group">
              <label>水印文字</label>
              <input v-model="store.designSettings.watermarkText" type="text" placeholder="SPECIMEN" />
            </div>
            <div class="form-group">
              <label>透明度 ({{ store.designSettings.watermarkOpacity }}%)</label>
              <input v-model.number="store.designSettings.watermarkOpacity" type="range" min="1" max="30" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🔒 安全特征</h3>
          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.securityPatternEnabled" />
              <span class="toggle-label">启用安全图案</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.hologramEffect" />
              <span class="toggle-label">全息效果</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.stampEnabled" />
              <span class="toggle-label">显示印章</span>
            </label>
          </div>
          <div v-if="store.designSettings.stampEnabled" class="sub-form">
            <div class="form-group">
              <label>印章来源</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input type="radio" v-model="stampSource" value="generate" />
                  自动生成
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="stampSource" value="upload" />
                  上传图片
                </label>
              </div>
            </div>
            <div v-if="stampSource === 'generate'" class="form-group">
              <label>印章旋转角度</label>
              <input v-model.number="store.designSettings.stampRotation" type="range" min="-45" max="45" />
              <span class="range-value">{{ store.designSettings.stampRotation }}°</span>
            </div>
            <div v-else class="form-group">
              <label>上传印章图片</label>
              <input type="file" accept="image/*" @change="handleStampUpload" />
              <img v-if="store.data.stampImage" :src="store.data.stampImage" class="preview-image stamp" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📱 二维码设置</h3>
          <div class="form-group">
            <label>二维码来源</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="qrCodeSource" value="generate" />
                自动生成
              </label>
              <label class="radio-item">
                <input type="radio" v-model="qrCodeSource" value="upload" />
                上传图片
              </label>
            </div>
          </div>
          <div v-if="qrCodeSource === 'generate'" class="sub-form">
            <div class="form-group">
              <label>二维码内容</label>
              <input v-model="store.data.qrCodeText" type="text" placeholder="签证验证链接" />
            </div>
          </div>
          <div v-else class="sub-form">
            <div class="form-group">
              <label>上传二维码</label>
              <input type="file" accept="image/*" @change="handleQRCodeUpload" />
              <img v-if="store.data.qrCodeImage" :src="store.data.qrCodeImage" class="preview-image" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>✍️ 签名设置</h3>
          <div class="form-group">
            <label>签名来源</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="signatureSource" value="text" />
                文字签名
              </label>
              <label class="radio-item">
                <input type="radio" v-model="signatureSource" value="upload" />
                上传图片
              </label>
            </div>
          </div>
          <div v-if="signatureSource === 'text'" class="sub-form">
            <div class="form-group">
              <label>签名文字</label>
              <input v-model="store.data.signatureText" type="text" placeholder="Official Signature" />
            </div>
          </div>
          <div v-else class="sub-form">
            <div class="form-group">
              <label>上传签名图片</label>
              <input type="file" accept="image/*" @change="handleSignatureUpload" />
              <img v-if="store.data.signatureImage" :src="store.data.signatureImage" class="preview-image signature" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🖼️ 边框设置</h3>
          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.designSettings.borderEnabled" />
              <span class="toggle-label">启用边框</span>
            </label>
          </div>
          <div v-if="store.designSettings.borderEnabled" class="sub-form">
            <div class="form-group">
              <label>边框样式</label>
              <select v-model="store.designSettings.borderStyle">
                <option value="solid">实线</option>
                <option value="double">双线</option>
                <option value="guilloche">花纹边框</option>
              </select>
            </div>
            <div class="form-group">
              <label>边框宽度</label>
              <input v-model.number="store.designSettings.borderWidth" type="number" min="1" max="10" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>✒️ 字体设置</h3>
          <div class="form-group">
            <label>字体</label>
            <select v-model="store.designSettings.fontFamily">
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Helvetica Neue', sans-serif">Helvetica</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 显示设置 -->
      <div v-show="activeTab === 'settings'" class="tab-content">
        <div class="form-section">
          <h3>🌐 语言设置</h3>
          <div class="form-group">
            <label>显示语言</label>
            <select v-model="store.settings.language">
              <option value="en">English (英文)</option>
              <option value="zh">中文 (Chinese)</option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>⚙️ 显示设置</h3>

          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showMRZ" />
              <span class="toggle-label">显示机读区 (MRZ)</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showBarcode" />
              <span class="toggle-label">显示条形码</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showHologram" />
              <span class="toggle-label">显示全息图效果</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.settings.showQRCode" />
              <span class="toggle-label">显示验证二维码</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.settings.showSecurityFeatures" />
              <span class="toggle-label">显示安全特征</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3> 重置</h3>
          <button class="btn-reset" @click="store.reset()">
            重置为默认值
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧预览区 -->
    <div class="preview-panel">
      <div class="preview-header">
        <h3>预览</h3>
        <div class="preview-actions">
          <button class="btn-download" @click="showDownloadPanel = true">📥 导出</button>
        </div>
      </div> 
      <div class="preview-container">
        <div ref="previewRef" class="preview-wrapper">
          <VisaPreview />
        </div>
      </div>

      <DownloadPanel
        :visible="showDownloadPanel"
        :preview-selector="'.preview-container .preview-wrapper'"
        :default-file-name="`visa-${store.data.template}-${Date.now()}`"
        :default-format="'png'"
        :default-quality="3"
        @close="showDownloadPanel = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVisaStore, visaTemplates, visaTypeOptionsByTemplate, type VisaData } from '@/stores/visa'
import VisaPreview from '@/components/VisaPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import DownloadPanel from '@/components/DownloadPanel.vue' 

const router = useRouter()
const store = useVisaStore()
const activeTab = ref('template')
const previewRef = ref<HTMLElement | null>(null)
const showDownloadPanel = ref(false)
const photoInput = ref<HTMLInputElement | null>(null)

const currentVisaTypeOptions = computed(() => visaTypeOptionsByTemplate[store.data.template])

// 上传相关
const stampSource = ref<'generate' | 'upload'>('generate')
const qrCodeSource = ref<'generate' | 'upload'>('generate')
const signatureSource = ref<'text' | 'upload'>('text')

// 上传处理函数
const handleStampUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.data.stampImage = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleQRCodeUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.data.qrCodeImage = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleSignatureUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.data.signatureImage = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const tabs = [
  { id: 'template', label: '模板', icon: '🎨' },
  { id: 'holder', label: '持有人', icon: '👤' },
  { id: 'visa', label: '签证', icon: '📋' },
  { id: 'design', label: '设计', icon: '🖌️' },
  { id: 'settings', label: '设置', icon: '⚙️' }
]

const entryTypes = [
  { value: 'single', label: '单次' },
  { value: 'double', label: '两次' },
  { value: 'multiple', label: '多次' }
]

const countries = [
  { code: 'CHINA', name: '中国 CHINA' },
  { code: 'JAPAN', name: '日本 JAPAN' },
  { code: 'KOREA', name: '韩国 KOREA' },
  { code: 'USA', name: '美国 USA' },
  { code: 'UK', name: '英国 UK' },
  { code: 'CANADA', name: '加拿大 CANADA' },
  { code: 'AUSTRALIA', name: '澳大利亚 AUSTRALIA' },
  { code: 'GERMANY', name: '德国 GERMANY' },
  { code: 'FRANCE', name: '法国 FRANCE' },
  { code: 'INDIA', name: '印度 INDIA' },
  { code: 'BRAZIL', name: '巴西 BRAZIL' },
  { code: 'RUSSIA', name: '俄罗斯 RUSSIA' }
]

const getFlag = (template: string) => {
  const flags: Record<string, string> = {
    us: '🇺🇸',
    uk: '🇬🇧',
    schengen: '🇪🇺',
    canada: '🇨🇦',
    australia: '🇦🇺',
    japan: '🇯🇵',
    china: '🇨🇳'
  }
  return flags[template] || '🏳️'
}

const selectVisaTemplate = (template: VisaData['template']) => {
  store.selectTemplate(template)
}

const generateVisaNumber = () => {
  store.data.visaNumber = store.generateVisaNumber(store.data.template)
}

const generateControlNumber = () => {
  store.data.controlNumber = store.generateControlNumber(store.data.template)
}

const handlePhotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.data.photo = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const goToVisaWorkflow = (path: string) => {
  router.push(path)
}

// Download now handled by DownloadPanel (统一导出面板)
</script>

<style scoped>
.visa-view {
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

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.panel-header h2 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.header-shortcuts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.tab-content {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: var(--text-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.template-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-card.selected {
  border-color: var(--primary-color);
  background: var(--primary-bg);
}

.template-color {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-flag {
  font-size: 24px;
}

.template-name {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.visa-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.visa-type-card {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 12px 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.visa-type-card:hover {
  background: var(--bg-primary);
}

.visa-type-card.selected {
  border-color: var(--primary-color);
  background: var(--primary-bg);
}

.type-icon {
  font-size: 20px;
  display: block;
}

.type-code {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
  display: block;
  margin: 4px 0;
}

.type-name {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.entry-type-btns {
  display: flex;
  gap: 10px;
}

.entry-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.entry-btn:hover {
  border-color: var(--primary-color);
}

.entry-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  color: var(--primary-color);
  font-weight: 600;
}

.photo-upload-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.photo-preview {
  width: 100px;
  height: 130px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-color);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-preview .photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

.photo-placeholder span:first-child {
  font-size: 24px;
  margin-bottom: 4px;
}

.photo-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-secondary {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--bg-primary);
  border-color: var(--primary-color);
}

.btn-danger-sm {
  padding: 6px 12px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-group {
  margin-bottom: 12px;
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
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn input {
  flex: 1;
}

.btn-generate {
  padding: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-generate:hover {
  background: var(--primary-bg);
  border-color: var(--primary-color);
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

.toggle-label {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.btn-reset {
  width: 100%;
  padding: 12px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #fee2e2;
  color: #dc2626;
}

.sub-form {
  margin-top: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.sub-form .form-group {
  margin-bottom: 12px;
}

.sub-form .form-group:last-child {
  margin-bottom: 0;
}

.range-value {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 8px;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  appearance: none;
  background: #e2e8f0;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
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
  font-size: 1.125rem;
  color: var(--text-primary);
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
  font-weight: 500;
  transition: all 0.2s;
}

.btn-download:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.preview-container {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  overflow: auto;
}

.preview-wrapper {
  transform-origin: center center;
}

/* 上传图片样式 */
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

.preview-image.stamp {
  max-width: 80px;
  max-height: 80px;
}

.preview-image.signature {
  max-width: 150px;
  max-height: 50px;
}

@media (max-width: 980px) {
  .panel-header {
    flex-direction: column;
  }

  .header-shortcuts {
    width: 100%;
  }

  .header-shortcuts .btn-secondary {
    flex: 1;
    min-width: 130px;
  }
}

/* CSS变量回退 */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --border-color: #e2e8f0;
  --primary-color: #6366f1;
  --primary-bg: rgba(99, 102, 241, 0.1);
  --primary-rgb: 99, 102, 241;
}
</style>
