<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useWatermarkStore } from '@/stores/watermark'
import { downloadAsPDFWithOptions } from '@/utils/documentGenerator'
import { useStudentStore } from '@/stores/student'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import EmailModal from '@/components/EmailModal.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

const store = useStudentStore()
const activeSubTab = ref('data')
const showDownloadPanel = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)
const sealInput = ref<HTMLInputElement | null>(null)
const showEmailModal = ref(false)
const qrCanvas = ref<HTMLCanvasElement>()
const barcodeRef = ref<SVGElement>()

// 设计设置状态
const designSettings = ref({
  // 颜色设置
  headerColor: '#1e40af',
  textColor: '#000000',
  backgroundColor: '#4f46e5',
  detailsBoxColor: '#ffffff',
  nextStepsBoxColor: '#FFFBF0',
  
  // 字体设置
  fontFamily: 'Georgia',
  fontSize: 14,
  fontWeight: 500,
  
  // 水印设置
  enableWatermark: true,
  watermarkText: 'OFFICIAL ADMISSION',
  watermarkColor: '#000000',
  watermarkSize: 14,
  watermarkOpacity: 3,
  watermarkRotation: -30,
  fullScreenWatermark: false,
  watermarkSpacingX: 80,
  watermarkSpacingY: 40,
  watermarkFontFamily: 'Arial',
  watermarkOverlay: false,
  
  // 边框设置
  enableBorder: true,
  borderColor: '#1e40af',
  borderStyle: 'solid',
  borderWidth: 1,
  
  // 二维码设置
  qrCodeEnabled: false,
  qrCodeImage: '',
  qrCodeSource: 'generate' as 'generate' | 'upload' | 'gallery',
  qrCodeContent: '',
  
  // 条形码设置
  barcodeEnabled: false,
  barcodeImage: '',
  barcodeSource: 'generate' as 'generate' | 'upload' | 'gallery',
  barcodeContent: '',
  
  // 签名设置
  signatureSource: 'text' as 'text' | 'upload' | 'gallery',
  signatureImage: '',
  signatureFont: 'Brush Script MT, cursive',
  signatureFontSize: 24
})

// 全局水印设置
const watermark = useWatermarkStore()

const setSubTab = (tab: string) => {
  activeSubTab.value = tab
}

function downloadAdmission() {
  showDownloadPanel.value = true
}

// 数据管理函数
const getAdmissionData = () => {
  return {
    admissionLetter: store.admissionLetter,
    designSettings: designSettings.value,
    universityInfo: store.universityInfo,
    studentInfo: store.studentInfo
  }
}

const setAdmissionData = (data: any) => {
  if (data.admissionLetter) store.updateAdmissionLetter(data.admissionLetter)
  if (data.designSettings) designSettings.value = { ...designSettings.value, ...data.designSettings }
  if (data.universityInfo) store.updateUniversityInfo(data.universityInfo)
  if (data.studentInfo) store.updateStudentInfo(data.studentInfo)
}

const handleLogoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.universityInfo.logo = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleSealUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.admissionLetter.sealImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 上传二维码图片
const handleQRCodeUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      designSettings.value.qrCodeImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 上传条形码图片
const handleBarcodeUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      designSettings.value.barcodeImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 上传签名图片
const handleSignatureUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      designSettings.value.signatureImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 生成二维码
const generateQRCode = async () => {
  if (!qrCanvas.value || designSettings.value.qrCodeSource !== 'generate') return
  
  const content = designSettings.value.qrCodeContent || 
    `https://verify.university.edu/admission/${store.studentInfo.studentId}`
  
  try {
    await QRCode.toCanvas(qrCanvas.value, content, {
      width: 80,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (err) {
    console.error('QR Code generation failed:', err)
  }
}

// 生成条形码
const generateBarcode = () => {
  if (!barcodeRef.value || designSettings.value.barcodeSource !== 'generate') return
  
  nextTick(() => {
    try {
      const content = designSettings.value.barcodeContent || store.studentInfo.studentId || 'ADM2023001'
      JsBarcode(barcodeRef.value, content, {
        format: 'CODE128',
        width: 1.5,
        height: 40,
        displayValue: false,
        margin: 0
      })
    } catch (err) {
      console.error('Barcode generation failed:', err)
    }
  })
}

onMounted(() => {
  if (designSettings.value.qrCodeEnabled && designSettings.value.qrCodeSource === 'generate') {
    generateQRCode()
  }
  if (designSettings.value.barcodeEnabled && designSettings.value.barcodeSource === 'generate') {
    generateBarcode()
  }
})

watch(() => [designSettings.value.qrCodeEnabled, designSettings.value.qrCodeSource, designSettings.value.qrCodeContent], () => {
  if (designSettings.value.qrCodeEnabled && designSettings.value.qrCodeSource === 'generate') {
    generateQRCode()
  }
})

watch(() => [designSettings.value.barcodeEnabled, designSettings.value.barcodeSource, designSettings.value.barcodeContent], () => {
  if (designSettings.value.barcodeEnabled && designSettings.value.barcodeSource === 'generate') {
    generateBarcode()
  }
})
</script>

<template>
  <div class="admission-page">
    <div class="sub-tabs">
      <div class="sub-tab" :class="{ active: activeSubTab === 'data' }" @click="setSubTab('data')">录取信息</div>
      <div class="sub-tab" :class="{ active: activeSubTab === 'design' }" @click="setSubTab('design')">设计调整</div>
      <div class="sub-tab" :class="{ active: activeSubTab === 'preview' }" @click="setSubTab('preview')">预览</div>
    </div>

    <div class="page-container">
      <!-- 数据管理页面 -->
      <div v-if="activeSubTab === 'data'" class="form-section full-width">
        <!-- 数据管理面板 -->
        <SaveLoadPanel 
          document-type="admission"
          :get-data="getAdmissionData"
          :set-data="setAdmissionData"
        />
        
        <div class="form-content">
          <section class="form-group">
            <h3>大学信息</h3>
            <div class="form-row">
              <div class="form-field">
                <label>大学名称</label>
                <input v-model="store.universityInfo.name" type="text" placeholder="International University" />
              </div>
              <div class="form-field">
                <label>大学标志</label>
                <div class="logo-upload">
                  <div class="logo-preview">
                    <img v-if="store.universityInfo.logo" :src="store.universityInfo.logo" alt="Logo" />
                    <button v-if="store.universityInfo.logo" class="btn-remove-overlay" @click="store.universityInfo.logo = ''" title="删除">✕</button>
                  </div>
                  <input type="file" ref="logoInput" accept="image/*" style="display: none" @change="handleLogoUpload" />
                  <div class="logo-actions">
                    <PhotoSelector v-model="store.universityInfo.logo" />
                    <span class="or-divider">或</span>
                    <button type="button" class="upload-btn" @click="logoInput?.click()">本地上传</button>
                  </div>
                  <span class="upload-hint">推荐尺寸：200x200像素</span>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>大学地址</label>
                <input v-model="store.universityInfo.address" type="text" />
              </div>
              <div class="form-field">
                <label>联系电话</label>
                <input v-model="store.universityInfo.phone" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field full">
                <label>网站</label>
                <input v-model="store.universityInfo.website" type="text" />
              </div>
            </div>
          </section>

          <section class="form-group">
            <h3>学生信息</h3>
            <div class="form-row">
              <div class="form-field">
                <label>学生姓名</label>
                <input v-model="store.studentInfo.name" type="text" />
              </div>
              <div class="form-field">
                <label>学生 ID</label>
                <input v-model="store.studentInfo.studentId" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field full">
                <label>专业名称</label>
                <input v-model="store.studentInfo.major" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field full">
                <label>学生邮箱</label>
                <input type="text" placeholder="emily.johnson@student.edu" />
              </div>
            </div>
          </section>

          <section class="form-group">
            <h3>录取信息</h3>
            <div class="form-row">
              <div class="form-field">
                <label>专业名称</label>
                <input v-model="store.admissionLetter.major" type="text" />
              </div>
              <div class="form-field">
                <label>院系名称</label>
                <input v-model="store.admissionLetter.department" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>学位类型</label>
                <select v-model="store.admissionLetter.degreeType">
                  <option>Bachelor's Degree</option>
                  <option>Master's Degree</option>
                  <option>Doctoral Degree</option>
                </select>
              </div>
              <div class="form-field">
                <label>录取日期</label>
                <input v-model="store.admissionLetter.admissionDate" type="date" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>开学日期</label>
                <input v-model="store.admissionLetter.startDate" type="date" />
              </div>
              <div class="form-field">
                <label>学制</label>
                <input v-model="store.admissionLetter.duration" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field full">
                <label>奖学金信息</label>
                <input v-model="store.admissionLetter.scholarship" type="text" />
              </div>
            </div>
          </section>

          <section class="form-group">
            <h3>信件内容</h3>
            <div class="form-field">
              <label>通知书标题</label>
              <input v-model="store.admissionLetter.letterTitle" type="text" />
            </div>
            <div class="form-field">
              <label>通知书正文</label>
              <textarea v-model="store.admissionLetter.bodyText" rows="4"></textarea>
            </div>
            <div class="form-field">
              <label>祝贺语</label>
              <textarea v-model="store.admissionLetter.congratulations" rows="2"></textarea>
            </div>
            <div class="form-field">
              <label>后续步骤</label>
              <textarea v-model="store.admissionLetter.nextSteps" rows="4"></textarea>
            </div>
          </section>

          <section class="form-group">
            <h3>签名信息</h3>
            <div class="form-row">
              <div class="form-field">
                <label>签名日期</label>
                <input v-model="store.admissionLetter.signatureDate" type="date" />
              </div>
              <div class="form-field">
                <label>官印类别</label>
                <select v-model="store.admissionLetter.sealType">
                  <option value="">无</option>
                  <option>All Packers</option>
                  <option>Classic Seal</option>
                  <option>Modern Emblem</option>
                  <option>Traditional Crest</option>
                  <option>Academic Shield</option>
                  <option>University Seal</option>
                  <option>Official Stamp</option>
                </select>
              </div>
            </div>
            <div class="form-row" v-if="store.admissionLetter.sealType">
              <div class="form-field">
                <label>官印文字</label>
                <input v-model="store.admissionLetter.sealText" type="text" placeholder="请输入官印显示的文字" />
              </div>
              <div class="form-field">
                <label>上传官印图片</label>
                <div class="logo-upload">
                  <div class="logo-preview">
                    <img v-if="store.admissionLetter.sealImage" :src="store.admissionLetter.sealImage" alt="Seal" />
                    <button v-if="store.admissionLetter.sealImage" class="btn-remove-overlay" @click="store.admissionLetter.sealImage = ''" title="删除">✕</button>
                  </div>
                  <input type="file" ref="sealInput" accept="image/*" style="display: none" @change="handleSealUpload" />
                  <div class="logo-actions">
                    <PhotoSelector v-model="store.admissionLetter.sealImage" />
                    <span class="or-divider">或</span>
                    <button type="button" class="upload-btn" @click="sealInput?.click()">本地上传</button>
                  </div>
                  <span class="upload-hint">推荐尺寸：100x100像素</span>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>签名人姓名</label>
                <input v-model="store.admissionLetter.dean" type="text" />
              </div>
              <div class="form-field">
                <label>签名人头衔</label>
                <input v-model="store.admissionLetter.deanTitle" type="text" />
              </div>
            </div>
            
            <!-- 签名设置 -->
            <div class="form-row">
              <div class="form-field full">
                <label>签名来源</label>
                <div class="radio-group">
                  <label>
                    <input type="radio" v-model="designSettings.signatureSource" value="text" />
                    文字签名
                  </label>
                  <label>
                    <input type="radio" v-model="designSettings.signatureSource" value="upload" />
                    上传图片
                  </label>
                  <label>
                    <input type="radio" v-model="designSettings.signatureSource" value="gallery" />
                    从图库选择
                  </label>
                </div>
              </div>
            </div>
            
            <div v-if="designSettings.signatureSource === 'text'" class="form-row">
              <div class="form-field">
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
              <div class="form-field">
                <label>签名大小: {{ designSettings.signatureFontSize }}px</label>
                <input type="range" v-model.number="designSettings.signatureFontSize" min="16" max="48" step="2" />
              </div>
            </div>
            
            <div v-if="designSettings.signatureSource === 'upload'" class="form-row">
              <div class="form-field full">
                <label>上传签名图片</label>
                <div class="upload-area" @click="($refs.signatureInput as HTMLInputElement)?.click()">
                  <input type="file" ref="signatureInput" accept="image/*" @change="handleSignatureUpload" hidden />
                  <div v-if="designSettings.signatureImage" class="preview-image">
                    <img :src="designSettings.signatureImage" alt="签名预览" />
                    <button class="remove-btn" @click.stop="designSettings.signatureImage = ''">×</button>
                  </div>
                  <div v-else class="upload-placeholder">
                    <span>📝</span>
                    <span>点击上传签名图片</span>
                  </div>
                </div>
                <span class="upload-hint">推荐透明背景PNG格式，尺寸：200x100像素</span>
              </div>
            </div>
            
            <div v-if="designSettings.signatureSource === 'gallery'" class="form-row">
              <div class="form-field full">
                <label>从图库选择签名</label>
                <PhotoSelector
                  v-model="designSettings.signatureImage"
                  :default-category="'signatures'"
                  :show-only-category="true"
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 设计调整页面 -->
      <div v-if="activeSubTab === 'design'" class="design-section full-width">
        <div class="form-content">
          <section class="form-group">
            <h3>颜色设置</h3>
            <div class="form-row">
              <div class="form-field">
                <label>标题颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.headerColor" />
                  <input type="text" v-model="designSettings.headerColor" />
                </div>
              </div>
              <div class="form-field">
                <label>文本颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.textColor" />
                  <input type="text" v-model="designSettings.textColor" />
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>强调颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.backgroundColor" />
                  <input type="text" v-model="designSettings.backgroundColor" />
                </div>
              </div>
              <div class="form-field">
                <label>背景颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.detailsBoxColor" />
                  <input type="text" v-model="designSettings.detailsBoxColor" />
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field full">
                <label>Next Steps框背景颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.nextStepsBoxColor" />
                  <input type="text" v-model="designSettings.nextStepsBoxColor" />
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field full">
                <label>字体</label>
                <select v-model="designSettings.fontFamily">
                  <option value="Georgia">Georgia (推荐)</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>字体大小: {{ designSettings.fontSize }}px</label>
                <input type="range" v-model.number="designSettings.fontSize" min="10" max="20" />
              </div>
              <div class="form-field">
                <label>字体粗细</label>
                <select v-model.number="designSettings.fontWeight">
                  <option :value="300">细体 (Light)</option>
                  <option :value="400">常规 (Normal) 推荐</option>
                  <option :value="500">中等 (Medium)</option>
                  <option :value="600">半粗 (Semi-Bold)</option>
                  <option :value="700">粗体 (Bold)</option>
                </select>
              </div>
            </div>
          </section>

          <section class="form-group">
            <h3>水印设置</h3>
            <div class="toggle-field">
              <label class="toggle-label">
                <input type="checkbox" v-model="designSettings.enableWatermark" class="toggle-input" />
                <span class="toggle-switch"></span>
                <span>启用水印</span>
              </label>
            </div>
            <div v-if="designSettings.enableWatermark">
              <div class="toggle-field">
                <label class="toggle-label">
                  <input type="checkbox" v-model="designSettings.fullScreenWatermark" class="toggle-input" />
                  <span class="toggle-switch"></span>
                  <span>全屏水印</span>
                </label>
              </div>
              <div class="form-field">
                <label>水印文本</label>
                <input v-model="designSettings.watermarkText" type="text" />
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>水印字体</label>
                  <select v-model="designSettings.watermarkFontFamily">
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>水印颜色</label>
                  <div class="color-input">
                    <input type="color" v-model="designSettings.watermarkColor" />
                    <input type="text" v-model="designSettings.watermarkColor" />
                  </div>
                </div>
                <div class="form-field">
                  <label>水印透明度: {{ designSettings.watermarkOpacity }}%</label>
                  <input type="range" v-model.number="designSettings.watermarkOpacity" min="1" max="20" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>水印大小: {{ designSettings.watermarkSize }}px</label>
                  <input type="range" v-model.number="designSettings.watermarkSize" min="10" max="40" />
                </div>
                <div class="form-field">
                  <label>水印角度: {{ designSettings.watermarkRotation }}°</label>
                  <input type="range" v-model.number="designSettings.watermarkRotation" min="-90" max="90" />
                </div>
              </div>
              <div v-if="designSettings.fullScreenWatermark" class="form-row">
                <div class="form-field">
                  <label>水平间距: {{ designSettings.watermarkSpacingX }}px</label>
                  <input type="range" v-model.number="designSettings.watermarkSpacingX" min="20" max="200" />
                </div>
                <div class="form-field">
                  <label>垂直间距: {{ designSettings.watermarkSpacingY }}px</label>
                  <input type="range" v-model.number="designSettings.watermarkSpacingY" min="20" max="200" />
                </div>
              </div>
            </div>
          </section>

          <section class="form-group">
            <h3>边框设置</h3>
            <div class="toggle-field">
              <label class="toggle-label">
                <input type="checkbox" v-model="designSettings.enableBorder" class="toggle-input" />
                <span class="toggle-switch"></span>
                <span>启用边框</span>
              </label>
            </div>
            <div v-if="designSettings.enableBorder">
              <div class="form-row">
                <div class="form-field">
                  <label>边框颜色</label>
                  <div class="color-input">
                    <input type="color" v-model="designSettings.borderColor" />
                    <input type="text" v-model="designSettings.borderColor" />
                  </div>
                </div>
                <div class="form-field">
                  <label>边框样式</label>
                  <select v-model="designSettings.borderStyle">
                    <option value="solid">实线 (Solid)</option>
                    <option value="dashed">虚线 (Dashed)</option>
                    <option value="dotted">点线 (Dotted)</option>
                    <option value="double">双线 (Double)</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field full">
                  <label>边框粗细: {{ designSettings.borderWidth }}px (推荐为1px)</label>
                  <input type="range" v-model.number="designSettings.borderWidth" min="1" max="5" />
                </div>
              </div>
            </div>
          </section>

          <section class="form-group">
            <h3>📱 扫码/条码验证设置</h3>
            
            <!-- 二维码设置 -->
            <div class="toggle-field">
              <label class="toggle-label">
                <input type="checkbox" v-model="designSettings.qrCodeEnabled" class="toggle-input" />
                <span class="toggle-switch"></span>
                <span>启用二维码</span>
              </label>
            </div>
            <div v-if="designSettings.qrCodeEnabled" style="margin-top: 12px;">
              <div class="form-row">
                <div class="form-field full">
                  <label>二维码来源</label>
                  <div class="radio-group-inline">
                    <label><input type="radio" v-model="designSettings.qrCodeSource" value="generate" /> 自动生成</label>
                    <label><input type="radio" v-model="designSettings.qrCodeSource" value="upload" /> 上传图片</label>
                    <label><input type="radio" v-model="designSettings.qrCodeSource" value="gallery" /> 照片库</label>
                  </div>
                </div>
              </div>
              <div v-if="designSettings.qrCodeSource === 'upload'" class="form-row">
                <div class="form-field full">
                  <label>上传二维码图片</label>
                  <input type="file" accept="image/*" @change="handleQRCodeUpload" />
                  <div v-if="designSettings.qrCodeImage" class="image-preview-sm">
                    <img :src="designSettings.qrCodeImage" alt="二维码" />
                    <button @click="designSettings.qrCodeImage = ''" class="btn-remove-sm">删除</button>
                  </div>
                </div>
              </div>
              <div v-else-if="designSettings.qrCodeSource === 'gallery'" class="form-row">
                <div class="form-field full">
                  <label>从照片库选择</label>
                  <PhotoSelector v-model="designSettings.qrCodeImage" />
                </div>
              </div>
              <div v-else class="form-row">
                <div class="form-field full">
                  <label>二维码内容 (留空自动生成)</label>
                  <input v-model="designSettings.qrCodeContent" type="text" placeholder="https://verify.university.edu/..." />
                </div>
              </div>
            </div>
            
            <!-- 条形码设置 -->
            <div class="toggle-field" style="margin-top: 16px;">
              <label class="toggle-label">
                <input type="checkbox" v-model="designSettings.barcodeEnabled" class="toggle-input" />
                <span class="toggle-switch"></span>
                <span>启用条形码</span>
              </label>
            </div>
            <div v-if="designSettings.barcodeEnabled" style="margin-top: 12px;">
              <div class="form-row">
                <div class="form-field full">
                  <label>条形码来源</label>
                  <div class="radio-group-inline">
                    <label><input type="radio" v-model="designSettings.barcodeSource" value="generate" /> 自动生成</label>
                    <label><input type="radio" v-model="designSettings.barcodeSource" value="upload" /> 上传图片</label>
                    <label><input type="radio" v-model="designSettings.barcodeSource" value="gallery" /> 照片库</label>
                  </div>
                </div>
              </div>
              <div v-if="designSettings.barcodeSource === 'upload'" class="form-row">
                <div class="form-field full">
                  <label>上传条形码图片</label>
                  <input type="file" accept="image/*" @change="handleBarcodeUpload" />
                  <div v-if="designSettings.barcodeImage" class="image-preview-sm">
                    <img :src="designSettings.barcodeImage" alt="条形码" style="max-width: 180px; max-height: 60px;" />
                    <button @click="designSettings.barcodeImage = ''" class="btn-remove-sm">删除</button>
                  </div>
                </div>
              </div>
              <div v-else-if="designSettings.barcodeSource === 'gallery'" class="form-row">
                <div class="form-field full">
                  <label>从照片库选择</label>
                  <PhotoSelector v-model="designSettings.barcodeImage" />
                </div>
              </div>
              <div v-else class="form-row">
                <div class="form-field full">
                  <label>条形码内容 (留空使用学号)</label>
                  <input v-model="designSettings.barcodeContent" type="text" :placeholder="store.studentInfo.studentId" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 预览页面 -->
      <div v-if="activeSubTab === 'preview'" class="preview-page full-width">
        <div class="preview-header">
          <h2>录取通知书预览</h2>
          <div class="preview-actions">
            <button class="email-btn" @click="showEmailModal = true">📧 发送邮件</button>
            <button class="download-btn" @click="downloadAdmission">📥 导出</button>

            <DownloadPanel
              :visible="showDownloadPanel"
              :preview-selector="'.admission-letter'"
              :default-file-name="`Admission_${store.studentInfo.name || Date.now()}`"
              :default-format="'png'"
              :default-quality="3"
              @close="showDownloadPanel = false"
            />
          </div>
        </div>
        
        <div class="admission-letter" :style="{
          fontFamily: designSettings.fontFamily,
          fontSize: designSettings.fontSize + 'px',
          fontWeight: designSettings.fontWeight,
          color: designSettings.textColor,
          borderColor: designSettings.enableBorder ? designSettings.borderColor : 'transparent',
          borderStyle: designSettings.enableBorder ? designSettings.borderStyle : 'solid',
          borderWidth: designSettings.enableBorder ? designSettings.borderWidth + 'px' : '0',
          position: 'relative'
        }">
          <!-- 水印 -->
          <div v-if="designSettings.enableWatermark" class="watermark-container" :class="{ 'fullscreen': designSettings.fullScreenWatermark }" :style="{
            zIndex: watermark.settings.watermarkOverlay ? 10 : 1,
            columnGap: designSettings.fullScreenWatermark ? designSettings.watermarkSpacingX + 'px' : '0',
            rowGap: designSettings.fullScreenWatermark ? designSettings.watermarkSpacingY + 'px' : '0'
          }">
            <template v-if="designSettings.fullScreenWatermark">
              <div v-for="i in 50" :key="i" class="watermark-text watermark-repeat" :style="{
                color: designSettings.watermarkColor,
                opacity: designSettings.watermarkOpacity / 100,
                fontSize: designSettings.watermarkSize + 'px',
                transform: `rotate(${designSettings.watermarkRotation}deg)`,
                fontFamily: designSettings.watermarkFontFamily
              }">
                {{ designSettings.watermarkText }}
              </div>
            </template>
            <div v-else class="watermark-text" :style="{
              color: designSettings.watermarkColor,
              opacity: designSettings.watermarkOpacity / 100,
              fontSize: designSettings.watermarkSize + 'px',
              transform: `rotate(${designSettings.watermarkRotation}deg)`,
              fontFamily: designSettings.watermarkFontFamily
            }">
              {{ designSettings.watermarkText }}
            </div>
          </div>

          <div class="letter-header" :style="{ borderBottomColor: designSettings.headerColor }">
            <div class="university-seal">
              <img v-if="store.universityInfo.logo" :src="store.universityInfo.logo" alt="University Seal" style="max-width: 600px; max-height: 600px; width: auto; height: auto; object-fit: contain;" />
              <svg v-else width="70" height="70" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r="32" stroke="#4B6EF5" stroke-width="2" fill="none"/>
                <circle cx="35" cy="35" r="25" stroke="#4B6EF5" stroke-width="1.5" fill="none"/>
                <path d="M35 10 L35 60 M10 35 L60 35" stroke="#4B6EF5" stroke-width="1.5"/>
              </svg>
            </div>
            <div class="university-name">{{ store.universityInfo.name }}</div>
            <div class="university-address">{{ store.universityInfo.address }}</div>
            <div class="university-contact">{{ store.universityInfo.phone }}<br>{{ store.universityInfo.website }}</div>
          </div>

          <div class="letter-title" :style="{ color: designSettings.headerColor }">
            {{ store.admissionLetter.letterTitle }}
          </div>

          <div class="letter-meta">
            <p><strong>Date:</strong> {{ store.admissionLetter.admissionDate }}</p>
            <p><strong>To:</strong> {{ store.studentInfo.name }}</p>
            <p><strong>Student ID:</strong> {{ store.studentInfo.studentId }}</p>
            <p><strong>Address:</strong> 456 Student Street, Boston, MA 02116</p>
          </div>

          <div class="salutation">
            {{ store.admissionLetter.greeting }}
          </div>

          <div class="letter-body">
            <p style="white-space: pre-line;">{{ store.admissionLetter.bodyText }}</p>

            <div class="admission-details" :style="{ 
              backgroundColor: designSettings.detailsBoxColor,
              borderLeftColor: designSettings.backgroundColor 
            }">
              <h4 :style="{ color: designSettings.headerColor }">Admission Details</h4>
              <p><strong>Program:</strong> {{ store.admissionLetter.major }}</p>
              <p><strong>Department:</strong> {{ store.admissionLetter.department }}</p>
              <p><strong>Degree:</strong> {{ store.admissionLetter.degreeType }}</p>
              <p><strong>Duration:</strong> {{ store.admissionLetter.duration }}</p>
              <p><strong>Start Date:</strong> {{ store.admissionLetter.startDate }}</p>
              <p><strong>Scholarship:</strong> {{ store.admissionLetter.scholarship }}</p>
            </div>

            <p style="white-space: pre-line;">{{ store.admissionLetter.congratulations }}</p>

            <div class="next-steps" :style="{ backgroundColor: designSettings.nextStepsBoxColor }">
              <h4>Next Steps</h4>
              <p style="white-space: pre-line;">{{ store.admissionLetter.nextSteps }}</p>
            </div>
          </div>

          <div class="signature-section">
            <div class="signature">
              <div class="signature-seal" v-if="store.admissionLetter.sealType">
                <!-- 上传的官印图片优先显示 -->
                <img v-if="store.admissionLetter.sealImage" :src="store.admissionLetter.sealImage" class="uploaded-seal" alt="Official Seal" />
                <!-- All Packers -->
                <svg v-else-if="store.admissionLetter.sealType === 'All Packers'" width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="28" stroke="#8B4513" stroke-width="2" fill="none" opacity="0.3"/>
                  <circle cx="30" cy="30" r="22" stroke="#8B4513" stroke-width="1.5" fill="none" opacity="0.3"/>
                  <path d="M20 30 L40 30 M30 20 L30 40" stroke="#8B4513" stroke-width="1.5" opacity="0.3"/>
                  <text x="30" y="52" font-size="6" text-anchor="middle" fill="#8B4513" opacity="0.3" font-weight="600">{{ store.admissionLetter.sealText || 'OFFICIAL SEAL' }}</text>
                </svg>
                <!-- Classic Seal -->
                <svg v-else-if="store.admissionLetter.sealType === 'Classic Seal'" width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="28" stroke="#B8860B" stroke-width="2" fill="none" opacity="0.4"/>
                  <polygon points="30,10 35,25 50,25 38,35 43,50 30,40 17,50 22,35 10,25 25,25" stroke="#B8860B" fill="none" stroke-width="1.5" opacity="0.4"/>
                  <text x="30" y="8" font-size="5" text-anchor="middle" fill="#B8860B" opacity="0.4" font-weight="600">{{ store.admissionLetter.sealText || 'CLASSIC' }}</text>
                </svg>
                <!-- Modern Emblem -->
                <svg v-else-if="store.admissionLetter.sealType === 'Modern Emblem'" width="60" height="60" viewBox="0 0 60 60">
                  <rect x="8" y="8" width="44" height="44" rx="5" stroke="#4169E1" stroke-width="2" fill="none" opacity="0.3"/>
                  <circle cx="30" cy="30" r="15" stroke="#4169E1" stroke-width="1.5" fill="none" opacity="0.3"/>
                  <text x="30" y="33" font-size="6" text-anchor="middle" fill="#4169E1" opacity="0.3" font-weight="600">{{ store.admissionLetter.sealText || 'EMBLEM' }}</text>
                </svg>
                <!-- Traditional Crest -->
                <svg v-else-if="store.admissionLetter.sealType === 'Traditional Crest'" width="60" height="60" viewBox="0 0 60 60">
                  <path d="M30,10 L45,25 L45,45 L30,55 L15,45 L15,25 Z" stroke="#8B0000" stroke-width="2" fill="none" opacity="0.3"/>
                  <circle cx="30" cy="32" r="12" stroke="#8B0000" stroke-width="1.5" fill="none" opacity="0.3"/>
                  <text x="30" y="35" font-size="5" text-anchor="middle" fill="#8B0000" opacity="0.3" font-weight="600">{{ store.admissionLetter.sealText || 'CREST' }}</text>
                </svg>
                <!-- Academic Shield -->
                <svg v-else-if="store.admissionLetter.sealType === 'Academic Shield'" width="60" height="60" viewBox="0 0 60 60">
                  <path d="M30,8 L48,18 L48,35 L30,52 L12,35 L12,18 Z" stroke="#2F4F4F" stroke-width="2" fill="none" opacity="0.3"/>
                  <path d="M20 30 L28 38 L40 22" stroke="#2F4F4F" stroke-width="2" fill="none" opacity="0.3"/>
                  <text x="30" y="48" font-size="5" text-anchor="middle" fill="#2F4F4F" opacity="0.3" font-weight="600">{{ store.admissionLetter.sealText || 'ACADEMIC' }}</text>
                </svg>
                <!-- University Seal -->
                <svg v-else-if="store.admissionLetter.sealType === 'University Seal'" width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="28" stroke="#000080" stroke-width="2.5" fill="none" opacity="0.3"/>
                  <circle cx="30" cy="30" r="20" stroke="#000080" stroke-width="1" fill="none" opacity="0.3"/>
                  <rect x="25" y="22" width="10" height="16" stroke="#000080" stroke-width="1" fill="none" opacity="0.3"/>
                  <text x="30" y="50" font-size="5" text-anchor="middle" fill="#000080" opacity="0.3" font-weight="600">{{ store.admissionLetter.sealText || 'UNIVERSITY' }}</text>
                </svg>
                <!-- Official Stamp -->
                <svg v-else width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="25" stroke="#DC143C" stroke-width="3" fill="none" opacity="0.3"/>
                  <text x="30" y="32" font-size="8" text-anchor="middle" fill="#DC143C" opacity="0.4" font-weight="700">{{ store.admissionLetter.sealText || 'OFFICIAL' }}</text>
                  <text x="30" y="40" font-size="6" text-anchor="middle" fill="#DC143C" opacity="0.4" font-weight="600">STAMP</text>
                </svg>
              </div>
              <template v-if="designSettings.signatureSource === 'text'">
                <div class="signature-image" :style="{ fontFamily: designSettings.signatureFont, fontSize: designSettings.signatureFontSize + 'px' }">{{ store.admissionLetter.dean }}</div>
              </template>
              <template v-else-if="(designSettings.signatureSource === 'upload' || designSettings.signatureSource === 'gallery') && designSettings.signatureImage">
                <img :src="designSettings.signatureImage" alt="签名" class="signature-img" />
              </template>
              <template v-else>
                <div class="signature-image" :style="{ fontFamily: designSettings.signatureFont, fontSize: designSettings.signatureFontSize + 'px' }">{{ store.admissionLetter.dean }}</div>
              </template>
              <div class="signature-title">{{ store.admissionLetter.deanTitle }}</div>
              <div class="signature-title">{{ store.universityInfo.name }}</div>
            </div>
          </div>
          
          <!-- 条形码和二维码区域 -->
          <div v-if="designSettings.qrCodeEnabled || designSettings.barcodeEnabled" class="codes-section">
            <!-- 条形码 -->
            <div v-if="designSettings.barcodeEnabled" class="barcode-area">
              <img v-if="(designSettings.barcodeSource === 'upload' || designSettings.barcodeSource === 'gallery') && designSettings.barcodeImage" 
                   :src="designSettings.barcodeImage" 
                   alt="Barcode" 
                   class="uploaded-barcode" />
              <template v-else>
                <svg ref="barcodeRef" class="generated-barcode"></svg>
                <span class="barcode-text">{{ designSettings.barcodeContent || store.studentInfo.studentId }}</span>
              </template>
            </div>
            <!-- 二维码 -->
            <div v-if="designSettings.qrCodeEnabled" class="qr-area">
              <img v-if="(designSettings.qrCodeSource === 'upload' || designSettings.qrCodeSource === 'gallery') && designSettings.qrCodeImage" 
                   :src="designSettings.qrCodeImage" 
                   alt="QR Code" 
                   class="uploaded-qrcode" />
              <canvas v-else ref="qrCanvas" class="generated-qrcode"></canvas>
              <span class="qr-label">Scan to Verify</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`Admission_${store.studentInfo.name}`"
      :default-subject="`录取通知书 - ${store.studentInfo.name}`"
      preview-selector=".admission-letter"
      @close="showEmailModal = false"
    />
  </div>
</template>

<style scoped>
.admission-page {
  min-height: calc(100vh - 180px);
  overflow: visible;
  background: white;
  border-radius: 8px;
}

.sub-tabs {
  display: flex;
  border-bottom: 1px solid #E0E0E0;
  background-color: #FAFAFA;
  padding: 0 24px;
}

.sub-tab {
  padding: 14px 24px;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.sub-tab:hover {
  color: #4B6EF5;
}

.sub-tab.active {
  color: #4B6EF5;
  background-color: white;
  border-bottom-color: #4B6EF5;
  font-weight: 500;
}

.page-container {
  width: 100%;
  min-height: 100%;
  max-width: 100%;
}

.form-section,
.design-section,
.preview-page {
  overflow: visible;
}

.full-width {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.form-section {
  background: white;
  display: flex;
  flex-direction: column;
}

.form-content {
  padding: 24px;
}

.design-section .form-content {
  max-width: 100%;
  padding: 24px 48px;
}

.form-group {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #F0F0F0;
}

.form-group:last-child {
  border-bottom: none;
}

.form-group h3 {
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
  color: #666;
  font-weight: 500;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #DDD;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.logo-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-preview {
  width: 60px;
  height: 60px;
  border: 2px dashed #DDD;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8F9FA;
  overflow: hidden;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-btn {
  padding: 8px 20px;
  background: #2C3E50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.upload-btn:hover {
  background: #1a252f;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.color-input {
  display: flex;
  gap: 8px;
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
  margin-bottom: 20px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #2C3E50;
}

.toggle-input {
  display: none;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: #DDD;
  border-radius: 12px;
  transition: background 0.3s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-input:checked + .toggle-switch {
  background: #4B6EF5;
}

.toggle-input:checked + .toggle-switch::after {
  transform: translateX(20px);
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #E0E0E0;
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4B6EF5;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4B6EF5;
  cursor: pointer;
  border: none;
}

.preview-page {
  background: #F5F5F5;
  padding: 24px;
  overflow-y: auto;
  max-height: calc(100vh - 240px);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 48px;
}

.preview-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #2C3E50;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.preview-actions select {
  padding: 10px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  color: #2C3E50;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-actions select.format-type {
  min-width: 100px;
  font-weight: 600;
}

.preview-actions select.style-selector {
  min-width: 200px;
}

.style-selector {
  padding: 8px 16px;
  border: 1px solid #DDD;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.email-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.email-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: #2C3E50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.download-btn:hover {
  background: #1a252f;
}

.preview-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  position: sticky;
  top: 24px;
}

.admission-letter {
  background: white;
  padding: 48px;
  border: 1px solid #E0E0E0;
  line-height: 1.6;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.watermark-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.watermark-text {
  position: absolute;
  transform-origin: center;
  white-space: nowrap;
  font-weight: 700;
  letter-spacing: 2px;
  user-select: none;
  top: 50%;
  left: 50%;
  margin-left: -50%;
  margin-top: -10px;
}

.watermark-container.fullscreen {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(10, 1fr);
  padding: 20px;
  align-items: center;
  justify-items: center;
}

.watermark-repeat {
  position: relative;
  top: auto;
  left: auto;
  margin: 0;
}

.letter-header,
.letter-title,
.letter-meta,
.salutation,
.letter-body {
  position: relative;
  z-index: 1;
}

.letter-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 3px double #4B6EF5;
}

.university-seal {
  margin: 0 auto 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.university-name {
  font-size: 26px;
  font-weight: 700;
  color: #2C3E50;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.university-address,
.university-contact {
  font-size: 13px;
  color: #666;
  margin: 3px 0;
  line-height: 1.5;
}

.letter-title {
  font-size: 26px;
  font-weight: 700;
  text-align: center;
  color: #2C5AA0;
  margin: 24px 0;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 8px;
}

.letter-meta {
  margin-bottom: 28px;
  line-height: 1.8;
}

.letter-meta p {
  color: #2C3E50;
  margin: 6px 0;
}

.letter-meta strong {
  font-weight: 600;
  color: #000;
}

.salutation {
  color: #2C3E50;
  margin-bottom: 20px;
}

.letter-body {
  color: #2C3E50;
  text-align: justify;
  line-height: 1.8;
}

.letter-body p {
  margin-bottom: 18px;
}

.admission-details {
  background: #F5F6FA;
  padding: 24px;
  border-left: 4px solid #2C5AA0;
  margin: 24px 0;
  border-radius: 2px;
}

.admission-details h4 {
  font-size: 16px;
  color: #2C5AA0;
  font-weight: 700;
  margin-bottom: 16px;
}

.admission-details p {
  margin: 8px 0;
  line-height: 1.6;
}

.admission-details strong {
  font-weight: 600;
  color: #000;
  min-width: 120px;
  display: inline-block;
}

.next-steps {
  margin: 24px 0;
  padding: 20px 24px;
  background: #FFFBF0;
  border-left: 4px solid #F59E0B;
  border-radius: 2px;
}

.next-steps h4 {
  font-size: 15px;
  color: #2C3E50;
  font-weight: 700;
  margin-bottom: 12px;
}

.next-steps p {
  line-height: 1.8;
}

.letter-body ol {
  margin-left: 20px;
  margin-bottom: 16px;
}

.letter-body li {
  margin-bottom: 8px;
}

.signature-section {
  margin-top: 48px;
  display: flex;
  justify-content: flex-end;
}

.signature {
  text-align: center;
  min-width: 280px;
  padding: 24px;
  position: relative;
}

.signature-seal {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0.4;
}

.uploaded-seal {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.signature-image {
  font-family: 'Brush Script MT', cursive;
  font-size: 32px;
  color: #000;
  margin-bottom: 16px;
  font-weight: 400;
}

.signature-img {
  max-width: 200px;
  max-height: 80px;
  object-fit: contain;
  margin-bottom: 16px;
}

.signature-name {
  font-size: 16px;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 8px;
}

.signature-title {
  font-size: 14px;
  color: #2C3E50;
  margin: 4px 0;
}

/* 条形码和二维码区域 */
.codes-section {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 40px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #ddd;
}

.barcode-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.barcode-area .uploaded-barcode {
  height: 50px;
  width: auto;
  max-width: 200px;
  object-fit: contain;
}

.barcode-area .generated-barcode {
  height: 50px;
  width: auto;
}

.barcode-area .barcode-text {
  font-size: 11px;
  margin-top: 4px;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  color: #333;
}

.qr-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-area .uploaded-qrcode {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.qr-area .generated-qrcode {
  width: 70px !important;
  height: 70px !important;
}

.qr-area .qr-label {
  margin-top: 4px;
  font-size: 9px;
  color: #666;
}

/* 单选按钮组内联样式 */
.radio-group-inline {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.radio-group-inline label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  cursor: pointer;
}

.image-preview-sm {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
}

.image-preview-sm img {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
  border-radius: 4px;
}

.btn-remove-sm {
  padding: 4px 8px;
  font-size: 11px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
