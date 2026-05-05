<script setup lang="ts">
import { ref } from 'vue'
import { downloadAsPDFWithOptions } from '@/utils/documentGenerator'
import { useStudentStore } from '@/stores/student'
import StudentIDPreview from '@/components/StudentIDPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import MediaSelector from '@/components/MediaSelector.vue'
import EmailModal from '@/components/EmailModal.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'

const store = useStudentStore()
const activeSubTab = ref('证件信息')
const activeDesignTab = ref('基本设置')
const showEmailModal = ref(false)
const showDownloadPanel = ref(false)

const subTabs = ['证件信息', '设计选项']
const designTabs = ['基本设置', '媒体设置', '水印设置', '背面设置']

// Template refs
const photoInput = ref<HTMLInputElement>()
const logoInput = ref<HTMLInputElement>()
const bgInput = ref<HTMLInputElement>()
const backsideLogoInput = ref<HTMLInputElement>()

// 背面设置的本地状态（这些不需要影响预览卡片）
const backsideTitle = ref('Student ID Card Information')
const termsOfUse = ref('This card must be carried while on campus. Violation of university policies may result in card revocation.')
const lostCardInfo = ref('If found, please return to the University Lost & Found Office or call the number below.')
const accessPrivileges = ref('Library, Cafeteria, Dormitory, Computer Labs')
const logoOpacity = ref(70)

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      store.updateStudentPhoto({ url: result })
    }
    reader.readAsDataURL(file)
  }
}

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      // 存储Logo到store
      store.universityInfo.logo = result
    }
    reader.readAsDataURL(file)
  }
}

const handleBackgroundUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      store.updateIDCardStyle({ backgroundImage: result })
    }
    reader.readAsDataURL(file)
  }
}

const handleBacksideLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      store.updateUniversityInfo({ backsideLogo: result })
    }
    reader.readAsDataURL(file)
  }
}

const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const triggerLogoUpload = () => {
  logoInput.value?.click()
}

const triggerBgUpload = () => {
  bgInput.value?.click()
}



// 数据管理函数
const getStudentIDData = () => {
  return {
    universityInfo: store.universityInfo,
    studentInfo: store.studentInfo,
    studentPhoto: store.studentPhoto,
    idCardStyle: store.idCardStyle,
    backsideSettings: {
      backsideTitle: backsideTitle.value,
      termsOfUse: termsOfUse.value,
      lostCardInfo: lostCardInfo.value,
      accessPrivileges: accessPrivileges.value,
      logoOpacity: logoOpacity.value
    }
  }
}

const setStudentIDData = (data: any) => {
  if (data.universityInfo) store.updateUniversityInfo(data.universityInfo)
  if (data.studentInfo) store.updateStudentInfo(data.studentInfo)
  if (data.studentPhoto) store.updateStudentPhoto(data.studentPhoto)
  if (data.idCardStyle) store.updateIDCardStyle(data.idCardStyle)
  if (data.backsideSettings) {
    backsideTitle.value = data.backsideSettings.backsideTitle
    termsOfUse.value = data.backsideSettings.termsOfUse
    lostCardInfo.value = data.backsideSettings.lostCardInfo
    accessPrivileges.value = data.backsideSettings.accessPrivileges
    logoOpacity.value = data.backsideSettings.logoOpacity
  }
}
</script>

<template>
  <div class="student-id-page">
    <div class="sub-tabs">
      <button
        v-for="tab in subTabs"
        :key="tab"
        :class="['sub-tab', { active: activeSubTab === tab }]"
        @click="activeSubTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div class="page-container">
      <div class="form-section">
        <div class="form-content panel-card">
          <div v-if="activeSubTab === '证件信息'" class="tab-panel">
            <!-- 数据管理面板 -->
            <SaveLoadPanel 
              document-type="student_id"
              :get-data="getStudentIDData"
              :set-data="setStudentIDData"
            />
            
            <section class="form-group">
              <h3 class="section-title">证件信息</h3>
              
              <div class="form-row">
                <div class="form-field">
                  <label>姓名</label>
                  <input v-model="store.studentInfo.name" type="text" placeholder="Emily Johnson" />
                </div>
                <div class="form-field">
                  <label>学号</label>
                  <input v-model="store.studentInfo.studentId" type="text" placeholder="2023001001" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>学院</label>
                  <input v-model="store.studentInfo.school" type="text" placeholder="School of Computer Science" />
                </div>
                <div class="form-field">
                  <label>学位类型</label>
                  <select v-model="store.studentInfo.degree">
                    <option>Bachelor</option>
                    <option>Master</option>
                    <option>PhD</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>入学年份</label>
                  <select v-model="store.studentInfo.enrollmentYear">
                    <option>2020</option>
                    <option>2021</option>
                    <option>2022</option>
                    <option>2023</option>
                    <option>2024</option>
                    <option>2025</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>有效期至</label>
                  <input v-model="store.studentInfo.expiryDate" type="date" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>Card No.</label>
                  <input v-model="store.studentInfo.cardNo" type="text" placeholder="C83108113" />
                </div>
              </div>
            </section>

            <section class="form-group">
              <h3 class="section-title">学校信息</h3>
              
              <div class="form-row">
                <div class="form-field">
                  <label>学校名称</label>
                  <input v-model="store.universityInfo.name" type="text" placeholder="International University" />
                </div>
                <div class="form-field">
                  <label>学校网址</label>
                  <input v-model="store.universityInfo.website" type="text" placeholder="www.university.edu" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field full">
                  <label>学校地址</label>
                  <input v-model="store.universityInfo.address" type="text" placeholder="123 University Avenue, Boston, MA 02138" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>联系方式</label>
                  <input v-model="store.universityInfo.phone" type="text" placeholder="(617) 555-1234" />
                </div>
                <div class="form-field">
                  <label>官方签名</label>
                  <input v-model="store.universityInfo.signature" type="text" placeholder="S. Davis" />
                </div>
              </div>
            </section>
          </div>

          <div v-if="activeSubTab === '设计选项'" class="tab-panel design-options">
            <div class="design-tabs">
              <button
                v-for="tab in designTabs"
                :key="tab"
                :class="['design-tab', { active: activeDesignTab === tab }]"
                @click="activeDesignTab = tab"
              >
                {{ tab }}
              </button>
            </div>

            <div v-if="activeDesignTab === '基本设置'" class="design-content">
              <section class="form-group">
                <div class="form-row">
                  <div class="form-field">
                    <label>卡片方向</label>
                    <select v-model="store.idCardStyle.cardOrientation">
                      <option>Landscape (Credit Card Size)</option>
                      <option>Portrait (Vertical)</option>
                    </select>
                    <p class="help-text">选择卡片的显示方向（横向或竖向）</p>
                  </div>
                  <div class="form-field">
                    <label>卡片风格</label>
                    <select v-model="store.idCardStyle.cardStyle">
                      <option>Modern</option>
                      <option>Classic</option>
                      <option>Minimal</option>
                    </select>
                    <p class="help-text">选择卡片的视觉风格</p>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>卡片颜色</label>
                    <div class="color-input">
                      <input type="color" v-model="store.idCardStyle.cardColor" />
                      <input type="text" v-model="store.idCardStyle.cardColor" placeholder="#7987b4" />
                    </div>
                  </div>
                  <div class="form-field">
                    <label>文字颜色</label>
                    <div class="color-input">
                      <input type="color" v-model="store.idCardStyle.textColor" />
                      <input type="text" v-model="store.idCardStyle.textColor" placeholder="#ffffff" />
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>验证码类型</label>
                    <select v-model="store.idCardStyle.barcodeType">
                      <option>Barcode</option>
                      <option>QR Code</option>
                      <option>None</option>
                    </select>
                    <p class="help-text">选择卡片上显示的验证码类型</p>
                  </div>
                  <div class="form-field">
                    <label>真实贴图效果</label>
                    <div class="toggle-field">
                      <label class="switch">
                        <input type="checkbox" v-model="store.idCardStyle.enableRealisticEffect" />
                        <span class="slider"></span>
                      </label>
                      <span class="toggle-label">启用真实卡片贴图效果</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div v-if="activeDesignTab === '媒体设置'" class="design-content">
              <section class="form-group">
                <h3 class="section-title">学生照片</h3>
                <div class="photo-selector-wrapper">
                  <PhotoSelector 
                    v-model="store.studentPhoto.url"
                    :student-id="store.studentInfo.studentId"
                  />
                </div>
                <div class="divider-text">或</div>
                <div class="upload-area">
                  <button class="upload-btn secondary" @click="triggerPhotoUpload">💾 本地上传照片</button>
                  <input ref="photoInput" type="file" accept="image/*" style="display:none" @change="handlePhotoUpload" />
                  <p class="help-text">从照片库选择或本地上传证件照，尺寸最好为3:4</p>
                </div>
                <div v-if="store.studentPhoto.url" class="image-preview" style="position: relative; margin-top: 10px;">
                  <img :src="store.studentPhoto.url" style="max-width: 150px; max-height: 180px; object-fit: contain; border: 2px solid #ddd; border-radius: 4px; padding: 4px;" />
                  <button @click="store.updateStudentPhoto({ url: '' })" class="btn-remove-overlay" title="删除照片">×</button>
                </div>
              </section>

              <section class="form-group">
                <h3 class="section-title">上传Logo</h3>
                <div class="upload-area">
                  <div class="logo-preview">
                    <img v-if="store.universityInfo.logo" :src="store.universityInfo.logo" alt="Logo" style="width:100%;height:100%;object-fit:contain;" />
                    <svg v-else width="60" height="60" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="#4B6EF5" opacity="0.2"/>
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#4B6EF5" stroke-width="2"/>
                      <text x="50" y="58" text-anchor="middle" font-size="24" fill="#4B6EF5" font-weight="bold">IU</text>
                    </svg>
                  </div>
                  <MediaSelector 
                    v-model="store.universityInfo.logo"
                    type="logo"
                    button-text="从媒体库选择"
                    modal-title="选择 Logo"
                    icon="🏢"
                  />
                  <div class="upload-divider">或</div>
                  <button class="upload-btn" @click="triggerLogoUpload">本地上传Logo</button>
                  <input ref="logoInput" type="file" accept="image/*" style="display:none" @change="handleLogoUpload" />
                  <p class="help-text">上传学校或组织的Logo</p>
                </div>
              </section>

              <section class="form-group">
                <h3 class="section-title">上传背景图片</h3>
                <div class="upload-area">
                  <div class="background-preview">
                    <svg width="60" height="60" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#6C5CE7" opacity="0.3"/>
                      <text x="50" y="58" text-anchor="middle" font-size="28" fill="#6C5CE7" font-weight="bold">CSN</text>
                    </svg>
                  </div>
                  <button class="upload-btn" @click="triggerBgUpload">选择背景</button>
                  <input ref="bgInput" type="file" accept="image/*" style="display:none" @change="handleBackgroundUpload" />
                  <p class="help-text">上传卡片的背景图片</p>
                </div>
              </section>

              <section class="form-group">
                <h3 class="section-title">背景透明度: {{ store.idCardStyle.backgroundOpacity }}%</h3>
                <div class="slider-container">
                  <input type="range" min="0" max="100" v-model.number="store.idCardStyle.backgroundOpacity" />
                  <span>{{ store.idCardStyle.backgroundOpacity }}%</span>
                </div>
                <p class="help-text">调整背景图片的透明度</p>
              </section>
            </div>

            <div v-if="activeDesignTab === '水印设置'" class="design-content">
              <section class="form-group">
                <div class="toggle-field full">
                  <div style="display:flex;align-items:center;gap:12px;">
                    <label class="switch">
                      <input type="checkbox" v-model="store.idCardStyle.enableWatermark" />
                      <span class="slider"></span>
                    </label>
                    <span class="toggle-label">启用水印</span>
                  </div>
                  <p class="help-text">在卡片上显示半透明水印</p>
                </div>
              </section>

              <section class="form-group">
                <div class="form-row">
                  <div class="form-field">
                    <label>水印文本</label>
                    <input type="text" v-model="store.idCardStyle.watermarkText" placeholder="AUTHENTIC" />
                  </div>
                  <div class="form-field">
                    <label>水印颜色</label>
                    <div class="color-input">
                      <input type="color" v-model="store.idCardStyle.watermarkColor" />
                      <input type="text" v-model="store.idCardStyle.watermarkColor" placeholder="#000000" />
                    </div>

                    <div class="form-field">
                      <label>水印字体</label>
                      <select v-model="store.idCardStyle.watermarkFontFamily">
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="'Brush Script MT', cursive">Brush Script</option>
                      </select>
                    </div>
                  </div>
                </div>
                <p class="help-text">显示在卡片上的水印文本</p>
              </section>

              <section class="form-group">
                <label>水印大小: {{ store.idCardStyle.watermarkSize }}px</label>
                <div class="slider-container">
                  <input type="range" min="8" max="48" v-model.number="store.idCardStyle.watermarkSize" />
                  <span>{{ store.idCardStyle.watermarkSize }}px</span>
                </div>
              </section>

              <section class="form-group">
                <label>水印旋转: {{ store.idCardStyle.watermarkRotation }}°</label>
                <div class="slider-container">
                  <input type="range" min="-90" max="90" v-model.number="store.idCardStyle.watermarkRotation" />
                  <span>{{ store.idCardStyle.watermarkRotation }}°</span>
                </div>
              </section>

              <section class="form-group">
                <label>水印透明度: {{ store.idCardStyle.watermarkOpacity }}%</label>
                <div class="slider-container">
                  <input type="range" min="0" max="100" v-model.number="store.idCardStyle.watermarkOpacity" />
                  <span>{{ store.idCardStyle.watermarkOpacity }}%</span>
                </div>
              </section>
            </div>

            <div v-if="activeDesignTab === '背面设置'" class="design-content">
              <section class="form-group">
                <div class="toggle-field full">
                  <div style="display:flex;align-items:center;gap:12px;">
                    <label class="switch">
                      <input type="checkbox" v-model="store.idCardStyle.enableBackside" />
                      <span class="slider"></span>
                    </label>
                    <span class="toggle-label">启用背面</span>
                  </div>
                  <p class="help-text">生成卡片的背面信息</p>
                </div>
              </section>

              <section class="form-group">
                <label>背面标题</label>
                <input type="text" v-model="store.universityInfo.backsideTitle" placeholder="Student ID Card Information" />
              </section>

              <section class="form-group">
                <label>使用条款</label>
                <textarea 
                  v-model="store.universityInfo.termsOfUse" 
                  rows="3"
                  placeholder="This card must be carried while on campus. Violation of university policies may result in card revocation."
                ></textarea>
              </section>

              <section class="form-group">
                <label>丢失卡片信息</label>
                <textarea 
                  v-model="store.universityInfo.lostCardInfo" 
                  rows="2"
                  placeholder="If found, please return to the University Lost & Found Office or call the number below."
                ></textarea>
              </section>

              <section class="form-group">
                <label>访问权限清单</label>
                <textarea 
                  v-model="store.universityInfo.accessPrivileges" 
                  rows="2"
                  placeholder="Library, Cafeteria, Dormitory, Computer Labs, Gym"
                ></textarea>
              </section>

              <section class="form-group">
                <h3 class="section-title">背面Logo</h3>
                <div class="upload-area">
                  <div class="logo-preview">
                    <img v-if="store.universityInfo.backsideLogo" :src="store.universityInfo.backsideLogo" alt="backside logo" style="width:100%;height:100%;object-fit:contain;" />
                    <svg v-else width="60" height="60" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="#4B6EF5" opacity="0.2"/>
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#4B6EF5" stroke-width="2"/>
                      <text x="50" y="58" text-anchor="middle" font-size="24" fill="#4B6EF5" font-weight="bold">IU</text>
                    </svg>
                  </div>
                  <button class="upload-btn" @click="() => backsideLogoInput?.value?.click()">选择背面Logo</button>
                  <input ref="backsideLogoInput" type="file" accept="image/*" style="display:none" @change="handleBacksideLogoUpload" />
                  <p class="help-text">上传卡片背面显示的Logo</p>
                </div>
              </section>

              <section class="form-group">
                <label>Logo透明度: {{ store.universityInfo.backsideLogoOpacity }}%</label>
                <div class="slider-container">
                  <input type="range" min="0" max="100" v-model.number="store.universityInfo.backsideLogoOpacity" />
                  <span>{{ store.universityInfo.backsideLogoOpacity }}%</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div class="preview-section">
        <StudentIDPreview />
      </div>
    </div>

    <div class="action-bar">
      <div class="actions">
        <button class="email-btn" @click="showEmailModal = true">📧 发送邮件</button>
        <button class="download-btn" @click="showDownloadPanel = true">📥 导出</button>
      </div>

      <DownloadPanel
        :visible="showDownloadPanel"
        :preview-selector="'.id-cards'"
        :default-file-name="`StudentID_${store.studentInfo.name || Date.now()}`"
        :default-format="'png'"
        :default-quality="4"
        @close="showDownloadPanel = false"
      />
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`StudentID_${store.studentInfo.name}`"
      :default-subject="`学生证 - ${store.studentInfo.name}`"
      preview-selector=".id-cards"
      @close="showEmailModal = false"
    />
  </div>
</template>

<style scoped>
.student-id-page {
  width: 100%;
}

.sub-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
}

.sub-tab {
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.sub-tab.active {
  color: #4B6EF5;
  border-bottom-color: #4B6EF5;
}

.page-container {
  display: grid;
  grid-template-columns: 520px 1fr;
  gap: 24px;
  width: 100%;
}

.form-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.form-content {
  padding: 24px;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  border-bottom: 1px solid #F0F0F0;
  padding-bottom: 20px;
}

.form-group:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #DDD;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
  width: 100%;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #4B6EF5;
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.form-field textarea {
  resize: vertical;
  min-height: 60px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.photo-preview, 
.logo-preview, 
.background-preview {
  width: 100px;
  height: 100px;
  background: #F8F9FA;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #DDD;
  font-size: 32px;
  overflow: hidden;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  background: #4B6EF5;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.upload-btn:hover {
  background: #3B5ED8;
}

.help-text {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 4px;
}

.upload-divider {
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  margin: 4px 0;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.slider-container input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #E0E0E0;
  outline: none;
  -webkit-appearance: none;
}

.slider-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4B6EF5;
  cursor: pointer;
}

.slider-container input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4B6EF5;
  cursor: pointer;
  border: none;
}

.slider-container span {
  min-width: 50px;
  text-align: right;
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.preview-section {
  position: sticky;
  top: 24px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
}

.format-select {
  display: flex;
  align-items: center;
  gap: 12px;
}

.format-select select {
  padding: 10px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  color: #2C3E50;
  background: white;
  cursor: pointer;
  min-width: 200px;
  transition: all 0.3s;
}

.format-select select.format-type {
  min-width: 100px;
  font-weight: 600;
}

.format-select select:hover {
  border-color: #4B6EF5;
}

.format-select select:focus {
  outline: none;
  border-color: #4B6EF5;
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.email-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.email-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.email-btn svg {
  width: 20px;
  height: 20px;
}

.download-btn {
  background: #1a202c;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.download-btn:hover {
  background: #2d3748;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.download-btn svg {
  width: 20px;
  height: 20px;
}

.design-options {
  gap: 0;
}

.design-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid #E0E0E0;
  padding-bottom: 0;
}

.design-tab {
  background: none;
  border: none;
  padding: 10px 18px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.design-tab.active {
  color: #4B6EF5;
  border-bottom-color: #4B6EF5;
}

.design-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.color-input {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input input[type="color"] {
  width: 50px;
  height: 38px;
  border: 1px solid #DDD;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.color-input input[type="text"] {
  flex: 1;
}

.toggle-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-field.full {
  grid-column: 1 / -1;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.switch .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.switch input:checked + .slider {
  background-color: #4B6EF5;
}

.switch input:checked + .slider:before {
  transform: translateX(24px);
}

.toggle-label {
  font-size: 14px;
  color: #2C3E50;
  font-weight: 500;
}

.photo-selector-wrapper {
  margin-bottom: 16px;
}

.divider-text {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin: 16px 0;
  position: relative;
}

.divider-text::before,
.divider-text::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #e0e0e0;
}

.divider-text::before {
  left: 0;
}

.divider-text::after {
  right: 0;
}

.upload-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.upload-btn.secondary:hover {
  background: #e0e0e0;
}
</style>
