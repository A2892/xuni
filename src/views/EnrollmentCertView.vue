<template>
  <div class="enrollment-cert-view">
    <div class="edit-panel">
      <div class="panel-header">
        <h2>📋 在读证明生成器</h2>
        <p class="subtitle">学籍在读状态证明</p>
      </div>

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
          document-type="enrollment_cert" 
          :get-data="() => store.data" 
          :set-data="(data: any) => Object.assign(store.data, data)" 
        />
      </div>

      <!-- 学校信息 -->
      <div v-show="activeTab === 'school'" class="tab-content">
        <div class="form-section">
          <h3>🏫 学校信息</h3>
          <div class="form-group">
            <label>学校名称 (中文)</label>
            <input v-model="store.data.schoolName" type="text" />
          </div>
          <div class="form-group">
            <label>学校名称 (英文)</label>
            <input v-model="store.data.schoolNameEn" type="text" />
          </div>
          <div class="form-group">
            <label>学校地址</label>
            <input v-model="store.data.schoolAddress" type="text" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="store.data.schoolPhone" type="text" />
            </div>
            <div class="form-group">
              <label>学校代码</label>
              <input v-model="store.data.schoolCode" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>学校Logo</label>
            <div class="logo-actions">
              <PhotoSelector v-model="store.data.schoolLogo" />
              <span class="or-divider">或</span>
              <input type="file" accept="image/*" @change="handleLogoUpload" />
            </div>
          </div>
        </div>

        <div class="quick-fill">
          <h4>快速填充学校</h4>
          <div class="quick-btns">
            <button @click="store.setSchoolTemplate('pku')">北京大学</button>
            <button @click="store.setSchoolTemplate('thu')">清华大学</button>
            <button @click="store.setSchoolTemplate('fdu')">复旦大学</button>
          </div>
        </div>
      </div>

      <!-- 学生信息 -->
      <div v-show="activeTab === 'student'" class="tab-content">
        <div class="form-section">
          <h3>👤 基本信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>姓名 (中文)</label>
              <input v-model="store.data.studentName" type="text" />
            </div>
            <div class="form-group">
              <label>姓名 (英文)</label>
              <input v-model="store.data.studentNameEn" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>姓名字体</label>
            <select v-model="store.data.studentNameFont">
              <option value="SimSun">宋体 (SimSun)</option>
              <option value="SimHei">黑体 (SimHei)</option>
              <option value="KaiTi">楷体 (KaiTi)</option>
              <option value="FangSong">仿宋 (FangSong)</option>
              <option value="Microsoft YaHei">微软雅黑 (Microsoft YaHei)</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>学号</label>
              <input v-model="store.data.studentId" type="text" />
            </div>
            <div class="form-group">
              <label>性别</label>
              <select v-model="store.data.gender">
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>出生日期</label>
              <input v-model="store.data.birthDate" type="date" />
            </div>
            <div class="form-group">
              <label>身份证号</label>
              <input v-model="store.data.idNumber" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>照片</label>
            <input type="file" accept="image/*" @change="handlePhotoUpload" />
          </div>
        </div>

        <div class="form-section">
          <h3>🎓 学籍信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>学院 (中文)</label>
              <input v-model="store.data.faculty" type="text" />
            </div>
            <div class="form-group">
              <label>学院 (英文)</label>
              <input v-model="store.data.facultyEn" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>专业 (中文)</label>
              <input v-model="store.data.major" type="text" />
            </div>
            <div class="form-group">
              <label>专业 (英文)</label>
              <input v-model="store.data.majorEn" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>年级</label>
              <input v-model="store.data.grade" type="text" />
            </div>
            <div class="form-group">
              <label>班级</label>
              <input v-model="store.data.classNo" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>入学日期</label>
              <input v-model="store.data.enrollmentDate" type="date" />
            </div>
            <div class="form-group">
              <label>预计毕业</label>
              <input v-model="store.data.expectedGraduation" type="date" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>学历层次</label>
              <select v-model="store.data.educationLevel">
                <option v-for="level in educationLevels" :key="level.value" :value="level.value">
                  {{ level.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>学习形式</label>
              <select v-model="store.data.studyMode">
                <option value="fulltime">全日制</option>
                <option value="parttime">非全日制</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>学籍状态</label>
            <select v-model="store.data.studentStatus">
              <option v-for="status in studentStatuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 证明信息 -->
      <div v-show="activeTab === 'cert'" class="tab-content">
        <div class="form-section">
          <h3>📝 证明用途</h3>
          <div class="purpose-btns">
            <button 
              v-for="purpose in purposes" 
              :key="purpose.value"
              :class="['purpose-btn', { active: store.data.purpose === purpose.label }]"
              @click="store.setPurposeTemplate(purpose.value)"
            >
              {{ purpose.icon }} {{ purpose.label }}
            </button>
          </div>
          <div class="form-group">
            <label>自定义用途</label>
            <input v-model="store.data.purpose" type="text" />
          </div>
        </div>

        <div class="form-section">
          <h3>📄 证明详情</h3>
          <div class="form-row">
            <div class="form-group">
              <label>证明编号</label>
              <div class="input-with-btn">
                <input v-model="store.data.serialNumber" type="text" />
                <button @click="store.generateSerialNumber()">🎲</button>
              </div>
            </div>
            <div class="form-group">
              <label>发证日期</label>
              <input v-model="store.data.issueDate" type="date" />
            </div>
          </div>
          <div class="form-group">
            <label>有效期至</label>
            <input v-model="store.data.validUntil" type="date" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>签发人姓名</label>
              <input v-model="store.data.registrarName" type="text" />
            </div>
            <div class="form-group">
              <label>签发人职务</label>
              <input v-model="store.data.registrarTitle" type="text" />
            </div>
          </div>
        </div>
      </div>

      <!-- 设计 -->
      <div v-show="activeTab === 'design'" class="tab-content">
        <div class="form-section">
          <h3>🎨 水印设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.watermarkEnabled" />
              <span>启用水印</span>
            </label>
          </div>
          <div v-if="designSettings.watermarkEnabled" class="design-group">
            <div class="form-row">
              <div class="form-group">
                <label>水印文字</label>
                <input v-model="designSettings.watermarkText" type="text" placeholder="OFFICIAL" />
              </div>
              <div class="form-group">
                <label>透明度 (%)</label>
                <input v-model.number="designSettings.watermarkOpacity" type="range" min="1" max="30" />
                <span class="range-value">{{ designSettings.watermarkOpacity }}%</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>水印颜色</label>
                <input v-model="designSettings.watermarkColor" type="color" />
              </div>
              <div class="form-group">
                <label>水印类型</label>
                <div class="radio-group horizontal">
                  <label class="radio-item">
                    <input type="radio" v-model="designSettings.watermarkType" value="center" />
                    <span>居中水印</span>
                  </label>
                  <label class="radio-item">
                    <input type="radio" v-model="designSettings.watermarkType" value="fullscreen" />
                    <span>全屏水印</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🖼️ 边框设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.borderEnabled" />
              <span>启用边框</span>
            </label>
          </div>
          <div v-if="designSettings.borderEnabled" class="design-group">
            <div class="form-row">
              <div class="form-group">
                <label>边框样式</label>
                <select v-model="designSettings.borderStyle">
                  <option value="solid">实线</option>
                  <option value="double">双线</option>
                  <option value="dashed">虚线</option>
                  <option value="ornate">花纹边框</option>
                </select>
              </div>
              <div class="form-group">
                <label>边框颜色</label>
                <input v-model="designSettings.borderColor" type="color" />
              </div>
            </div>
            <div class="form-group">
              <label>边框宽度 (px)</label>
              <input v-model.number="designSettings.borderWidth" type="range" min="1" max="10" />
              <span class="range-value">{{ designSettings.borderWidth }}px</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🔖 印章设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.stampEnabled" />
              <span>启用印章</span>
            </label>
          </div>
          <div v-if="designSettings.stampEnabled" class="design-group">
            <div class="form-group">
              <label>印章来源</label>
              <div class="radio-group">
                <label><input type="radio" v-model="designSettings.stampSource" value="generate" /> 自动生成</label>
                <label><input type="radio" v-model="designSettings.stampSource" value="upload" /> 上传图片</label>
              </div>
            </div>
            <div v-if="designSettings.stampSource === 'upload'" class="form-group">
              <label>上传印章图片</label>
              <input type="file" accept="image/*" @change="handleStampUpload" />
              <div v-if="designSettings.stampImage" class="image-preview">
                <img :src="designSettings.stampImage" alt="印章" style="max-width: 100px; max-height: 100px;" />
                <button @click="designSettings.stampImage = ''" class="btn-remove-sm">删除</button>
              </div>
            </div>
            <div v-else>
              <div class="form-row">
                <div class="form-group">
                  <label>印章类型</label>
                  <select v-model="designSettings.stampType">
                    <option value="official">学校公章</option>
                    <option value="academic">教务处章</option>
                    <option value="registrar">学籍管理章</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>印章颜色</label>
                  <input v-model="designSettings.stampColor" type="color" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>旋转角度</label>
                  <input v-model.number="designSettings.stampRotation" type="range" min="-30" max="30" />
                  <span class="range-value">{{ designSettings.stampRotation }}°</span>
                </div>
                <div class="form-group">
                  <label>印章文字</label>
                  <input v-model="designSettings.stampText" type="text" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>✍️ 签章设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.signatureEnabled" />
              <span>启用签章</span>
            </label>
          </div>
          <div v-if="designSettings.signatureEnabled" class="design-group">
            <div class="form-group">
              <label>签章来源</label>
              <div class="radio-group">
                <label><input type="radio" v-model="designSettings.signatureSource" value="generate" /> 使用文字</label>
                <label><input type="radio" v-model="designSettings.signatureSource" value="upload" /> 上传图片</label>
                <label><input type="radio" v-model="designSettings.signatureSource" value="gallery" /> 从图库选择</label>
              </div>
            </div>
            <div v-if="designSettings.signatureSource === 'generate'" class="form-group">
              <label>签名字体</label>
              <select v-model="designSettings.signatureFont">
                <option value="Brush Script MT, cursive">Brush Script MT (手写)</option>
                <option value="Lucida Handwriting, cursive">Lucida Handwriting</option>
                <option value="Segoe Script, cursive">Segoe Script</option>
                <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                <option value="Pacifico, cursive">Pacifico</option>
                <option value="Dancing Script, cursive">Dancing Script</option>
                <option value="Great Vibes, cursive">Great Vibes</option>
                <option value="Sacramento, cursive">Sacramento</option>
                <option value="Georgia, serif">Georgia (正式)</option>
                <option value="Times New Roman, serif">Times New Roman</option>
              </select>
            </div>
            <div v-if="designSettings.signatureSource === 'generate'" class="form-group">
              <label>签名大小: {{ designSettings.signatureFontSize }}px</label>
              <input type="range" v-model.number="designSettings.signatureFontSize" min="16" max="48" step="2" />
            </div>
            <div v-if="designSettings.signatureSource === 'upload'" class="form-group">
              <label>上传签章图片</label>
              <input type="file" accept="image/*" @change="handleSignatureUpload" />
              <div v-if="designSettings.signatureImage" class="image-preview">
                <img :src="designSettings.signatureImage" alt="签章" style="max-width: 150px; max-height: 60px;" />
                <button @click="designSettings.signatureImage = ''" class="btn-remove-sm">删除</button>
              </div>
              <span class="upload-hint">推荐透明背景PNG格式，尺寸：200x100像素</span>
            </div>
            <div v-if="designSettings.signatureSource === 'gallery'" class="form-group">
              <label>从图库选择签章</label>
              <PhotoSelector
                v-model="designSettings.signatureImage"
                :default-category="'signatures'"
                :show-only-category="true"
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📱 扫码/条码查验设置</h3>
          
          <!-- 二维码设置 -->
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.qrCodeEnabled" />
              <span>启用二维码</span>
            </label>
          </div>
          <div v-if="designSettings.qrCodeEnabled" class="design-group">
            <div class="form-group">
              <label>二维码来源</label>
              <div class="radio-group">
                <label><input type="radio" v-model="designSettings.qrCodeSource" value="generate" /> 自动生成</label>
                <label><input type="radio" v-model="designSettings.qrCodeSource" value="upload" /> 上传图片</label>
                <label><input type="radio" v-model="designSettings.qrCodeSource" value="gallery" /> 照片库选择</label>
              </div>
            </div>
            <div v-if="designSettings.qrCodeSource === 'upload'" class="form-group">
              <label>上传二维码图片</label>
              <div class="logo-actions">
                <input type="file" accept="image/*" @change="handleQRCodeUpload" />
              </div>
              <div v-if="designSettings.qrCodeImage" class="image-preview">
                <img :src="designSettings.qrCodeImage" alt="二维码" style="max-width: 100px; max-height: 100px;" />
                <button @click="designSettings.qrCodeImage = ''" class="btn-remove-sm">删除</button>
              </div>
            </div>
            <div v-else-if="designSettings.qrCodeSource === 'gallery'" class="form-group">
              <label>从照片库选择</label>
              <PhotoSelector v-model="designSettings.qrCodeImage" />
            </div>
            <div v-else class="form-group">
              <label>二维码内容 (留空自动生成验证链接)</label>
              <input v-model="designSettings.qrCodeContent" type="text" placeholder="https://verify.edu.cn/..." />
            </div>
          </div>
          
          <!-- 条形码设置 -->
          <div class="form-group" style="margin-top: 16px;">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.barcodeEnabled" />
              <span>启用条形码</span>
            </label>
          </div>
          <div v-if="designSettings.barcodeEnabled" class="design-group">
            <div class="form-group">
              <label>条形码来源</label>
              <div class="radio-group">
                <label><input type="radio" v-model="designSettings.barcodeSource" value="generate" /> 自动生成</label>
                <label><input type="radio" v-model="designSettings.barcodeSource" value="upload" /> 上传图片</label>
                <label><input type="radio" v-model="designSettings.barcodeSource" value="gallery" /> 照片库选择</label>
              </div>
            </div>
            <div v-if="designSettings.barcodeSource === 'upload'" class="form-group">
              <label>上传条形码图片</label>
              <div class="logo-actions">
                <input type="file" accept="image/*" @change="handleBarcodeUpload" />
              </div>
              <div v-if="designSettings.barcodeImage" class="image-preview">
                <img :src="designSettings.barcodeImage" alt="条形码" style="max-width: 150px; max-height: 60px;" />
                <button @click="designSettings.barcodeImage = ''" class="btn-remove-sm">删除</button>
              </div>
            </div>
            <div v-else-if="designSettings.barcodeSource === 'gallery'" class="form-group">
              <label>从照片库选择</label>
              <PhotoSelector v-model="designSettings.barcodeImage" />
            </div>
            <div v-else class="form-group">
              <label>条形码内容 (留空使用学号)</label>
              <input v-model="designSettings.barcodeContent" type="text" :placeholder="store.data.studentId" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>✒️ 字体设置</h3>
          <div class="form-row">
            <div class="form-group">
              <label>中文字体</label>
              <select v-model="designSettings.fontFamilyCN">
                <option value="'SimSun', serif">宋体</option>
                <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                <option value="'SimHei', sans-serif">黑体</option>
                <option value="'KaiTi', serif">楷体</option>
                <option value="'FangSong', serif">仿宋</option>
              </select>
            </div>
            <div class="form-group">
              <label>英文字体</label>
              <select v-model="designSettings.fontFamilyEN">
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Helvetica Neue', sans-serif">Helvetica</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 设置 -->
      <div v-show="activeTab === 'settings'" class="tab-content">
        <div class="form-section">
          <h3>🎨 模板样式</h3>
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
          <h3>🌐 语言设置</h3>
          <div class="language-btns">
            <button 
              v-for="lang in languages" 
              :key="lang.value"
              :class="['lang-btn', { active: store.data.language === lang.value }]"
              @click="store.data.language = lang.value"
            >
              {{ lang.label }}
            </button>
          </div>
        </div>

        <div class="form-section">
          <h3>⚙️ 显示设置</h3>
          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showSeal" />
              <span>显示学校公章</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showQRCode" />
              <span>显示验证二维码</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showPhoto" />
              <span>显示学生照片</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <button class="btn-reset" @click="store.reset()">重置为默认值</button>
        </div>
      </div>
    </div>

    <div class="preview-panel">
      <div class="preview-header">
        <h3>证明预览</h3>
        <div class="preview-actions">
          <button class="btn-download" @click="showDownloadPanel = true">📥 导出</button>
        </div>
      </div>
      <div class="preview-container">
        <div ref="previewRef" class="preview-wrapper">
          <EnrollmentCertPreview />
        </div>
      </div>
      <DownloadPanel
        :visible="showDownloadPanel"
        :preview-selector="'.enrollment-cert-preview'"
        :default-file-name="`EnrollmentCert_${store.data.studentId || Date.now()}`"
        :default-format="'png'"
        :default-quality="3"
        @close="showDownloadPanel = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEnrollmentCertStore, educationLevels, studentStatuses } from '@/stores/enrollmentCert'
import EnrollmentCertPreview from '@/components/EnrollmentCertPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'

const store = useEnrollmentCertStore()
const activeTab = ref('school')
const previewRef = ref<HTMLElement | null>(null)

// 使用 store 中的设计设置
const designSettings = store.designSettings
const showDownloadPanel = ref(false)

const tabs = [
  { id: 'school', label: '学校', icon: '🏫' },
  { id: 'student', label: '学生', icon: '👤' },
  { id: 'cert', label: '证明', icon: '📄' },
  { id: 'design', label: '设计', icon: '🎨' },
  { id: 'settings', label: '设置', icon: '⚙️' }
]

const templates = [
  { value: 'official', label: '官方风格', icon: '📜' },
  { value: 'modern', label: '现代风格', icon: '✨' },
  { value: 'bilingual', label: '双语风格', icon: '🌐' }
]

const languages = [
  { value: 'chinese', label: '中文' },
  { value: 'english', label: '英文' },
  { value: 'bilingual', label: '中英双语' }
]

const purposes = [
  { value: 'visa', label: '办理出国签证', icon: '✈️' },
  { value: 'work', label: '求职就业', icon: '💼' },
  { value: 'loan', label: '申请助学贷款', icon: '💰' },
  { value: 'travel', label: '购买学生票', icon: '🎫' },
  { value: 'other', label: '其他用途', icon: '📋' }
]

const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.data.schoolLogo = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const handlePhotoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.data.photo = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 上传印章图片
const handleStampUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      designSettings.stampImage = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 上传签章图片
const handleSignatureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      designSettings.signatureImage = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 上传二维码图片
const handleQRCodeUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      designSettings.qrCodeImage = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 上传条形码图片
const handleBarcodeUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      designSettings.barcodeImage = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}


</script>

<style scoped>
.enrollment-cert-view {
  display: flex;
  height: 100%;
  gap: 24px;
  padding: 24px;
  background: var(--bg-secondary);
}

.edit-panel {
  flex: 5.5;
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
  gap: 4px;
  padding: 10px 8px;
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
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
}

.form-group input:focus,
.form-group select:focus {
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

.purpose-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.purpose-btn {
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.purpose-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  color: var(--primary-color);
}

.template-btns,
.language-btns {
  display: flex;
  gap: 10px;
}

.template-btn,
.lang-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.template-btn.active,
.lang-btn.active {
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

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}

.radio-group input[type="radio"] {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--primary-color);
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
  flex: 4.5;
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
  align-items: flex-start;
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
</style>
