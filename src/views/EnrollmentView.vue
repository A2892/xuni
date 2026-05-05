<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useWatermarkStore } from '@/stores/watermark'
import { useStudentStore } from '@/stores/student'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import DownloadPanel from '@/components/DownloadPanel.vue' 
import PhotoSelector from '@/components/PhotoSelector.vue'
import EmailModal from '@/components/EmailModal.vue'

const store = useStudentStore()
const showEmailModal = ref(false)
const showDownloadPanel = ref(false)

// 子标签状态
const activeSubTab = ref<'info' | 'design' | 'preview'>('info')
const activeDesignTab = ref<'basic' | 'watermark' | 'pattern' | 'border'>('basic')

// 设计设置
const designSettings = ref({
  // 基本设置
  paperColor: '#ffffff',
  borderColor: '#1e40af',
  textColor: '#000000',
  fontFamily: 'Times New Roman',
  exportQuality: '超高清 (推荐)',
  exportFormat: 'PNG',
  // 官印设置
  sealType: '',
  sealText: 'OFFICIAL SEAL',
  sealImage: '',
  
  // 边框设置
  borderEnabled: true,
  borderStyle: 'Solid',
  
  // 斜线水印设置
  diagonalWatermarkEnabled: false,
  diagonalLineWidth: 20,
  diagonalLineSpacing: 40,
  diagonalLineColor: '#000000',
  diagonalLineOpacity: 5,
  diagonalLineRotation: -30,
  
  // 文字水印设置
  textWatermarkEnabled: false,
  textWatermarkText: 'OFFICIAL DOCUMENT',
  textWatermarkSize: 14,
  textWatermarkColor: '#000000',
  textWatermarkOpacity: 5,
  textWatermarkRotation: -30,
  textWatermarkFontFamily: 'Times New Roman',
  
  // 全屏水印设置
  fullScreenWatermarkEnabled: false,
  fullScreenWatermarkText: 'OFFICIAL DOCUMENT',
  fullScreenWatermarkSize: 14,
  fullScreenWatermarkColor: '#000000',
  fullScreenWatermarkAngle: -45,
  fullScreenWatermarkOpacity: 5,
  fullScreenWatermarkSpacing: 200,
  fullScreenWatermarkFontFamily: 'Times New Roman',
  watermarkOverlay: false,
  // per-type overlay flags
  watermarkOverlayDiagonal: false,
  watermarkOverlayFullscreen: false,
  watermarkOverlayText: false,
  
  // 花纹设置
  cornerPatternEnabled: false,
  cornerPattern: 'Corner Pattern',
  cornerPosition: 'All Positions',
  cornerColor: '#1e40af',
  cornerOpacity: 15,
  cornerSize: 30
})

// 唯一 pattern id，避免多个实例冲突
const diagPatternId = ref('diag-' + Math.random().toString(36).slice(2, 8))

// 水印容器测量（使全屏水印覆盖可变高度/宽度）
const certificateRef = ref<HTMLElement | null>(null)
const measuredWidth = ref(794)
const measuredHeight = ref(1123)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    if (certificateRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measuredWidth.value = certificateRef.value?.clientWidth || measuredWidth.value
        measuredHeight.value = certificateRef.value?.clientHeight || measuredHeight.value
      })
      resizeObserver.observe(certificateRef.value)
      measuredWidth.value = certificateRef.value.clientWidth || measuredWidth.value
      measuredHeight.value = certificateRef.value.clientHeight || measuredHeight.value
    }
  })
})

onBeforeUnmount(() => {
  if (resizeObserver && certificateRef.value) resizeObserver.unobserve(certificateRef.value)
  resizeObserver = null
})

const watermark = useWatermarkStore()

// 双向同步：保持本地 `designSettings` 与全局 `watermark.settings` 的水印相关字段一致
let __syncingWatermark = false
watch(
  designSettings,
  (newVal) => {
    if (__syncingWatermark) return
    __syncingWatermark = true
    try {
      const keys = [
        'diagonalWatermarkEnabled','diagonalLineWidth','diagonalLineSpacing','diagonalLineColor','diagonalLineOpacity','diagonalLineRotation',
        'textWatermarkEnabled','textWatermarkText','textWatermarkSize','textWatermarkColor','textWatermarkOpacity','textWatermarkRotation','textWatermarkFontFamily',
        'fullScreenWatermarkEnabled','fullScreenWatermarkText','fullScreenWatermarkSize','fullScreenWatermarkColor','fullScreenWatermarkOpacity','fullScreenWatermarkSpacing','fullScreenWatermarkFontFamily','fullScreenWatermarkAngle',
        'watermarkOverlay','watermarkOverlayDiagonal','watermarkOverlayFullscreen','watermarkOverlayText'
      ]
      for (const k of keys) {
        if (newVal[k] !== undefined) watermark.settings[k] = newVal[k]
      }
    } finally { __syncingWatermark = false }
  },
  { deep: true, immediate: true }
)

watch(
  () => watermark.settings,
  (newVal) => {
    if (__syncingWatermark) return
    __syncingWatermark = true
    try {
      const keys = [
        'diagonalWatermarkEnabled','diagonalLineWidth','diagonalLineSpacing','diagonalLineColor','diagonalLineOpacity','diagonalLineRotation',
        'textWatermarkEnabled','textWatermarkText','textWatermarkSize','textWatermarkColor','textWatermarkOpacity','textWatermarkRotation','textWatermarkFontFamily',
        'fullScreenWatermarkEnabled','fullScreenWatermarkText','fullScreenWatermarkSize','fullScreenWatermarkColor','fullScreenWatermarkOpacity','fullScreenWatermarkSpacing','fullScreenWatermarkFontFamily','fullScreenWatermarkAngle',
          'watermarkOverlay','watermarkOverlayDiagonal','watermarkOverlayFullscreen','watermarkOverlayText'
      ]
      for (const k of keys) {
        if (newVal[k] !== undefined) designSettings.value[k] = newVal[k]
      }
    } finally { __syncingWatermark = false }
  },
  { deep: true }
)

const fullWatermarkCount = computed(() => {
  if (!watermark.settings.fullScreenWatermarkEnabled) return 0
  const spacing = watermark.settings.fullScreenWatermarkSpacing || 200
  const padding = 40 // from CSS .fullscreen-watermark padding
  const cols = Math.max(1, Math.ceil((measuredWidth.value - padding * 2) / spacing))
  const rows = Math.max(1, Math.ceil((measuredHeight.value - padding * 2) / spacing))
  return cols * rows
})

// 将花纹名称转换为类名
const cornerClassName = (name: string) => {
  return name ? name.toLowerCase().replace(/\s+/g, '-') : ''
}

// 在读证明特有的数据
const certificateData = ref({
  title: 'Certificate of Enrollment',
  bodyText: 'This is to certify that the above-named student is currently enrolled as a student in good standing at International University. The student is making satisfactory progress towards their degree.',
  issueDate: 'December 26, 2025',
  validity: '6 months',
  issuerTitle: 'Registrar',
  issuerName: 'Jane Smith',
  // 签名设置
  signatureSource: 'text', // 'text' | 'image'
  signatureImage: '',
  signatureFont: 'Dancing Script',
  signatureFontSize: 24,
  contactInfo: 'For verification of this certificate, please contact the Office of the Registrar at registrar@internationaluniversity.edu or call +1 (617) 555-1234.',
  studyMode: 'Full-time',
  currentYear: 'First Year'
})

// 处理Logo上传
const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        store.universityInfo.logo = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 处理官印图片上传（在在读证明中）
const handleSealUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        designSettings.value.sealImage = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 处理签名图片上传
const handleSignatureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        certificateData.value.signatureImage = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 处理学生照片上传
const handlePhotoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        store.studentPhoto.url = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

// Download is handled by DownloadPanel component now.

// 格式化日期（兼容 undefined）
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 角落花纹内联样式生成器
const cornerStyle = (pos: string) => {
  const size = designSettings.value.cornerSize + 'px'
  const color = designSettings.value.cornerColor
  const opacity = (designSettings.value.cornerOpacity || 0) / 100
  const thickness = Math.max(2, Math.round(designSettings.value.cornerSize / 12)) + 'px'
  const base: Record<string, string | number> = {
    width: size,
    height: size,
    opacity,
    position: 'absolute',
    boxSizing: 'border-box',
    color // allow CSS patterns to use currentColor
  }

  if (pos === 'top-left') Object.assign(base, { top: '12px', left: '12px', borderTop: `${thickness} solid ${color}`, borderLeft: `${thickness} solid ${color}`, borderRight: 'none', borderBottom: 'none' })
  if (pos === 'top-right') Object.assign(base, { top: '12px', right: '12px', borderTop: `${thickness} solid ${color}`, borderRight: `${thickness} solid ${color}`, borderLeft: 'none', borderBottom: 'none' })
  if (pos === 'bottom-left') Object.assign(base, { bottom: '12px', left: '12px', borderBottom: `${thickness} solid ${color}`, borderLeft: `${thickness} solid ${color}`, borderTop: 'none', borderRight: 'none' })
  if (pos === 'bottom-right') Object.assign(base, { bottom: '12px', right: '12px', borderBottom: `${thickness} solid ${color}`, borderRight: `${thickness} solid ${color}`, borderTop: 'none', borderLeft: 'none' })

  return base
}

// 数据管理函数
const getEnrollmentData = () => {
  return {
    designSettings: designSettings.value,
    universityInfo: store.universityInfo,
    studentInfo: store.studentInfo
  }
}

const setEnrollmentData = (data: any) => {
  if (data.designSettings) designSettings.value = { ...designSettings.value, ...data.designSettings }
  if (data.universityInfo) store.updateUniversityInfo(data.universityInfo)
  if (data.studentInfo) store.updateStudentInfo(data.studentInfo)
}
</script>

<template>
  <div class="enrollment-page">
    <!-- 子标签 -->
    <div class="sub-tabs">
      <button :class="{ active: activeSubTab === 'info' }" @click="activeSubTab = 'info'">证明信息</button>
      <button :class="{ active: activeSubTab === 'design' }" @click="activeSubTab = 'design'">设计调整</button>
    </div>

    <div class="page-container">
      <!-- 左侧编辑区域 - 证明信息 -->
      <div v-if="activeSubTab === 'info'" class="editor-section">
        <!-- 数据管理面板 -->
        <SaveLoadPanel 
          document-type="enrollment"
          :get-data="getEnrollmentData"
          :set-data="setEnrollmentData"
        />
        
        <h2>证明信息</h2>
        
        <section class="form-group">
          <h3>大学信息</h3>
          <div class="form-row">
            <div class="form-field">
              <label>大学名称</label>
              <input v-model="store.universityInfo.name" type="text" placeholder="International University" />
            </div>
            <div class="form-field">
              <label>大学标志</label>
              <div class="logo-upload-compact">
                <div class="logo-preview-box" v-if="store.universityInfo.logo">
                  <img :src="store.universityInfo.logo" alt="Logo" />
                  <button class="btn-remove-overlay" @click="store.universityInfo.logo = ''" title="删除">✕</button>
                </div>
                <div class="logo-placeholder" v-else></div>
                <div class="logo-actions">
                  <PhotoSelector v-model="store.universityInfo.logo" />
                  <span class="or-divider">或</span>
                  <label class="upload-btn-small">
                    本地上传
                    <input type="file" accept="image/*" @change="handleLogoUpload" hidden />
                  </label>
                </div>
                <span class="hint">上传学校或组织的Logo</span>
              </div>
            </div>
          </div>
        </section>

        <section class="form-group">
          <h3>证明标题</h3>
          <div class="form-field full-width">
            <input v-model="certificateData.title" type="text" />
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
              <label>学生ID</label>
              <input v-model="store.studentInfo.studentId" type="text" />
            </div>
          </div>
          
          <div class="form-field full-width">
            <label>学生照片</label>
            <PhotoSelector 
              v-model="store.studentPhoto.url"
              :student-id="store.studentInfo.studentId"
            />
            <div class="divider-text">或</div>
            <div class="photo-upload-row">
              <label class="upload-btn-dark secondary">
                💾 本地上传照片
                <input type="file" accept="image/*" @change="handlePhotoUpload" hidden />
              </label>
              <span class="hint">从照片库选择或本地上传正面免冠照片，建议尺寸3:4</span>
            </div>
            <div v-if="store.studentPhoto.url" class="image-preview" style="position: relative; margin-top: 10px;">
              <img :src="store.studentPhoto.url" style="max-width: 150px; max-height: 180px; object-fit: contain; border: 2px solid #ddd; border-radius: 4px; padding: 4px;" />
              <button @click="store.studentPhoto.url = ''" class="btn-remove-overlay" title="删除照片">×</button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>出生日期</label>
              <input v-model="store.studentInfo.enrollmentDate" type="date" placeholder="YYYY/MM/DD" /> <!-- 借用 enrollmentDate 暂存出生日期，或者应该在 store 加个 birthDate -->
            </div>
            <div class="form-field">
              <label>国籍</label>
              <input type="text" value="United States" /> <!-- 暂时硬编码，store里没有国籍 -->
            </div>
          </div>
        </section>

        <section class="form-group">
          <h3>学术信息</h3>
          <div class="form-row">
            <div class="form-field">
              <label>院系</label>
              <input v-model="store.studentInfo.school" type="text" />
            </div>
            <div class="form-field">
              <label>专业</label>
              <input v-model="store.studentInfo.major" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>学位类型</label>
              <select v-model="store.studentInfo.degree">
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div class="form-field">
              <label>学习模式</label>
              <select v-model="certificateData.studyMode">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>入学日期</label>
              <input v-model="store.studentInfo.enrollmentYear" type="date" />
            </div>
            <div class="form-field">
              <label>预计毕业日期</label>
              <input v-model="store.studentInfo.expectedGraduation" type="date" />
            </div>
          </div>
          <div class="form-field full-width">
            <label>当前学年</label>
            <input v-model="certificateData.currentYear" type="text" />
          </div>
        </section>

        <section class="form-group">
          <h3>证明内容</h3>
          <div class="form-field full-width">
            <label>证明文本</label>
            <textarea v-model="certificateData.bodyText" rows="4"></textarea>
          </div>
        </section>

        <section class="form-group">
          <h3>签发信息</h3>
          <div class="form-row">
            <div class="form-field">
              <label>签发日期</label>
              <input v-model="certificateData.issueDate" type="text" />
            </div>
            <div class="form-field">
              <label>有效期限</label>
              <input v-model="certificateData.validity" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>签发人职位</label>
              <input v-model="certificateData.issuerTitle" type="text" />
            </div>
            <div class="form-field full-width">
              <label>签发人签名</label>
              <div class="signature-controls" style="background: #f9fafb; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <div class="radio-group" style="margin-bottom: 10px; display: flex; gap: 15px;">
                  <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;"><input type="radio" v-model="certificateData.signatureSource" value="text" /> 文字生成</label>
                  <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;"><input type="radio" v-model="certificateData.signatureSource" value="image" /> 图片上传</label>
                </div>
                
                <div v-if="certificateData.signatureSource === 'text'" class="signature-text-options">
                  <input v-model="certificateData.issuerName" type="text" placeholder="输入签名内容" style="margin-bottom: 8px; width: 100%;" />
                  <div class="font-selector" style="display: flex; gap: 10px;">
                    <select v-model="certificateData.signatureFont" style="flex: 1;">
                      <option value="Dancing Script">Dancing Script</option>
                      <option value="Great Vibes">Great Vibes</option>
                      <option value="Sacramento">Sacramento</option>
                      <option value="Pacifico">Pacifico</option>
                      <option value="Brush Script MT">Brush Script MT</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                    <input type="number" v-model="certificateData.signatureFontSize" style="width: 80px;" title="字体大小" placeholder="Size" />
                  </div>
                </div>
                
                <div v-if="certificateData.signatureSource === 'image'" class="signature-image-options">
                  <div class="logo-upload-compact">
                    <div class="logo-preview-box" v-if="certificateData.signatureImage" style="height: 80px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px dashed #ccc; margin-bottom: 8px; position: relative;">
                      <img :src="certificateData.signatureImage" alt="Signature" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
                      <button class="btn-remove-overlay" @click="certificateData.signatureImage = ''" title="删除" style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer;">✕</button>
                    </div>
                    <div class="logo-actions" style="display: flex; align-items: center; gap: 10px;">
                      <PhotoSelector v-model="certificateData.signatureImage" :default-category="'signatures'" />
                      <span class="or-divider">或</span>
                      <label class="upload-btn-small" style="cursor: pointer; color: #2563eb;">
                        本地上传
                        <input type="file" accept="image/*" @change="handleSignatureUpload" hidden />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="form-group">
          <h3>联系信息</h3>
          <div class="form-field full-width">
            <label>联系方式</label>
            <textarea v-model="certificateData.contactInfo" rows="2"></textarea>
          </div>
        </section>
      </div>

      <!-- 左侧编辑区域 - 设计调整 -->
      <div v-else-if="activeSubTab === 'design'" class="editor-section">
        <h2>设计选项</h2>

        <!-- 设计标签 -->
        <div class="design-tabs">
          <button :class="{ active: activeDesignTab === 'basic' }" @click="activeDesignTab = 'basic'">基本设置</button>
          <button :class="{ active: activeDesignTab === 'watermark' }" @click="activeDesignTab = 'watermark'">水印设置</button>
          <button :class="{ active: activeDesignTab === 'pattern' }" @click="activeDesignTab = 'pattern'">花纹设置</button>
          <button :class="{ active: activeDesignTab === 'border' }" @click="activeDesignTab = 'border'">边框设置</button>
        </div>

        <!-- 基本设置 -->
        <div v-if="activeDesignTab === 'basic'">
          <section class="form-group">
            <div class="form-row">
              <div class="form-field">
                <label>纸张颜色</label>
                <div class="color-input">
                  <input v-model="designSettings.paperColor" type="color" />
                  <input v-model="designSettings.paperColor" type="text" />
                </div>
              </div>
              <div class="form-field">
                <label>标题颜色</label>
                <div class="color-input">
                  <input v-model="designSettings.borderColor" type="color" />
                  <input v-model="designSettings.borderColor" type="text" />
                </div>
              </div>
            </div>
          </section>

          <section class="form-group">
            <div class="form-row">
              <div class="form-field">
                <label>正文文字颜色</label>
                <div class="color-input">
                  <input v-model="designSettings.textColor" type="color" />
                  <input v-model="designSettings.textColor" type="text" />
                </div>
              </div>
              <div class="form-field">
                <label>字体</label>
                <select v-model="designSettings.fontFamily">
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
              </div>
            </div>
          </section>

          <section class="form-group">
            <label>导出质量</label>
            <select v-model="designSettings.exportQuality">
              <option value="超高清 (推荐)">超高清 (推荐)</option>
              <option value="高清">高清</option>
              <option value="标准">标准</option>
            </select>
          </section>

          <section class="form-group">
            <h3>官印设置</h3>
            <div class="form-row">
              <div class="form-field">
                <label>官印类别</label>
                <select v-model="designSettings.sealType">
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
              <div class="form-field">
                <label>官印文字</label>
                <input v-model="designSettings.sealText" type="text" />
              </div>
            </div>

            <div class="form-row" v-if="designSettings.sealType">
              <div class="form-field">
                <label>上传官印图片</label>
                <div class="logo-upload">
                  <div class="logo-preview">
                    <img v-if="designSettings.sealImage" :src="designSettings.sealImage" alt="Seal" />
                    <button v-if="designSettings.sealImage" class="btn-remove-overlay" @click="designSettings.sealImage = ''" title="删除">✕</button>
                  </div>
                  <div class="logo-actions">
                    <PhotoSelector v-model="designSettings.sealImage" />
                    <span class="or-divider">或</span>
                    <label class="upload-btn-small">
                      本地上传
                      <input type="file" accept="image/*" @change="handleSealUpload" hidden />
                    </label>
                  </div>
                  <span class="upload-hint">推荐尺寸：100x100像素</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 水印设置 -->
        <div v-else-if="activeDesignTab === 'watermark'">
          <div class="toggle-section">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.diagonalWatermarkEnabled" class="toggle-input">
              <span class="toggle-text">启用水印</span>
            </label>
          </div>

          <div class="hint-box">
            水印可以增强证书的安全性和正式性，您可以同时启用斜线和文字水印。
          </div>

          <!-- 斜线水印 -->
          <section class="form-group">
            <div class="subsection-header">
              <h4>斜线水印</h4>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designSettings.diagonalWatermarkEnabled" class="toggle-input">
              </label>
            </div>
            <p class="hint-text">绘制斜线看重复，不干扰主要内容</p>

            <div class="form-field">
              <label>线条宽度 ({{ designSettings.diagonalLineWidth }}px)</label>
              <input type="range" v-model.number="designSettings.diagonalLineWidth" min="1" max="50" step="1">
            </div>

            <div class="form-field">
              <label>线条间距 ({{ designSettings.diagonalLineSpacing }}px)</label>
              <input type="range" v-model.number="designSettings.diagonalLineSpacing" min="20" max="100" step="5">
              <p class="hint-text">线条间距由水平距离自动计算得出</p>
            </div>

            <div class="form-field">
              <label>斜线颜色</label>
              <div class="color-input">
                <input v-model="designSettings.diagonalLineColor" type="color" />
                <input v-model="designSettings.diagonalLineColor" type="text" />
              </div>
              <p class="hint-text">请不使用纯色或与纸张颜色同近的颜色</p>
            </div>

            <div class="form-field">
              <label>斜线不透明度 ({{ designSettings.diagonalLineOpacity }}%)</label>
              <input type="range" v-model.number="designSettings.diagonalLineOpacity" min="1" max="30" step="1">
            </div>

            <div class="form-field">
              <label>斜线角度 ({{ designSettings.diagonalLineRotation }}°)</label>
              <div class="angle-slider">
                <span>左斜</span>
                <input type="range" v-model.number="designSettings.diagonalLineRotation" min="-90" max="90" step="5">
                <span>右斜</span>
              </div>
            </div>
            <div class="form-field">
              <label>覆盖文本（斜线水印显示在内容上方）</label>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designSettings.watermarkOverlayDiagonal" class="toggle-input">
              </label>
            </div>
          </section>

          <!-- 文字水印 -->
          <section class="form-group">
            <div class="subsection-header">
              <h4>文字水印</h4>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designSettings.textWatermarkEnabled" class="toggle-input">
              </label>
            </div>
            <p class="hint-text">添加重复文字水印，增强辨识度</p>

            <div class="form-field">
              <label>水印文字</label>
              <input type="text" v-model="designSettings.textWatermarkText" placeholder="OFFICIAL DOCUMENT">
            </div>

            <div class="form-field">
              <label>文字大小 ({{ designSettings.textWatermarkSize }}px)</label>
              <input type="range" v-model.number="designSettings.textWatermarkSize" min="8" max="32" step="1">
            </div>

            <div class="form-field">
              <label>水印字体</label>
              <select v-model="designSettings.textWatermarkFontFamily">
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Helvetica">Helvetica</option>
                <option value="'Allura', cursive">Allura (Script)</option>
                <option value="'Brush Script MT', cursive">Brush Script</option>
              </select>
            </div>

            <div class="form-field">
              <label>文字颜色</label>
              <div class="color-input">
                <input v-model="designSettings.textWatermarkColor" type="color" />
                <input v-model="designSettings.textWatermarkColor" type="text" />
              </div>
              <p class="hint-text">请不使用纯色或与纸张颜色同近的颜色</p>
            </div>

            <div class="form-field">
              <label>文字不透明度 ({{ designSettings.textWatermarkOpacity }}%)</label>
              <input type="range" v-model.number="designSettings.textWatermarkOpacity" min="1" max="30" step="1">
            </div>

            <div class="form-field">
              <label>文字角度 ({{ designSettings.textWatermarkRotation }}°)</label>
              <div class="angle-slider">
                <span>左斜</span>
                <input type="range" v-model.number="designSettings.textWatermarkRotation" min="-90" max="90" step="5">
                <span>右斜</span>
              </div>
            </div>
            <div class="form-field">
              <label>覆盖文本（文字水印显示在内容上方）</label>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designSettings.watermarkOverlayText" class="toggle-input">
              </label>
            </div>
          </section>

          <!-- 全屏水印 -->
          <section class="form-group">
            <div class="subsection-header">
              <h4>全屏水印</h4>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designSettings.fullScreenWatermarkEnabled" class="toggle-input">
              </label>
            </div>
            <p class="hint-text">在整个证书上重复显示水印文字，增强视觉效果</p>

            <div class="form-field">
              <label>水印文字</label>
              <input type="text" v-model="designSettings.fullScreenWatermarkText" placeholder="OFFICIAL DOCUMENT">
            </div>

            <div class="form-field">
              <label>文字大小 ({{ designSettings.fullScreenWatermarkSize }}px)</label>
              <input type="range" v-model.number="designSettings.fullScreenWatermarkSize" min="8" max="32" step="1">
            </div>

            <div class="form-field">
              <label>水印字体</label>
              <select v-model="designSettings.fullScreenWatermarkFontFamily">
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Helvetica">Helvetica</option>
                <option value="'Allura', cursive">Allura (Script)</option>
                <option value="'Brush Script MT', cursive">Brush Script</option>
              </select>
            </div>

            <div class="form-field">
              <label>文字颜色</label>
              <div class="color-input">
                <input v-model="designSettings.fullScreenWatermarkColor" type="color" />
                <input v-model="designSettings.fullScreenWatermarkColor" type="text" />
              </div>
              <p class="hint-text">请不使用纯色或与纸张颜色同近的颜色</p>
            </div>

            <div class="form-field">
              <label>文字不透明度 ({{ designSettings.fullScreenWatermarkOpacity }}%)</label>
              <input type="range" v-model.number="designSettings.fullScreenWatermarkOpacity" min="1" max="30" step="1">
            </div>

            <div class="form-field">
              <label>水印角度 ({{ designSettings.fullScreenWatermarkAngle }}°)</label>
              <div class="angle-slider">
                <span>左斜</span>
                <input type="range" v-model.number="designSettings.fullScreenWatermarkAngle" min="-90" max="90" step="1">
                <span>右斜</span>
              </div>
            </div>

            <div class="form-field">
              <label>水印间距 ({{ designSettings.fullScreenWatermarkSpacing }}px)</label>
              <input type="range" v-model.number="designSettings.fullScreenWatermarkSpacing" min="100" max="400" step="10">
              <p class="hint-text">调节水印之间的水平和垂直间距</p>
            </div>
            <div class="form-field">
              <label>覆盖文本（全屏水印显示在内容上方）</label>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designSettings.watermarkOverlayFullscreen" class="toggle-input">
              </label>
            </div>
          </section>

          <!-- 水印应用提示 -->
          <div class="tips-section">
            <h4>水印应用提示：</h4>
            <ul>
              <li>文字水印适合在较重要的证书上使用，增加权威性</li>
              <li>斜线水印适合作为背景元素，不干扰主要内容</li>
              <li>水印颜色建议选择与背景有区别的颜色，不要同视觉转线至-15%效果最佳</li>
              <li>调整水印角度可以优化水印覆盖效果，一般建议使用-30°至-45°</li>
              <li>两种水印可以同时使用，但注意不要让水印过多影响正文内容</li>
            </ul>
          </div>
        </div>

        <!-- 花纹设置 -->
        <div v-else-if="activeDesignTab === 'pattern'">
          <div class="toggle-section">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.cornerPatternEnabled" class="toggle-input">
              <span class="toggle-text">启用装饰花纹</span>
            </label>
          </div>

          <section class="form-group">
            <div class="form-row">
              <div class="form-field">
                <label>花纹类型</label>
                <select v-model="designSettings.cornerPattern">
                  <option value="Corner Pattern">Corner Pattern</option>
                  <option value="Elegant">Elegant</option>
                  <option value="Classic">Classic</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Filigree">Filigree</option>
                  <option value="Geometric">Geometric</option>
                  <option value="Ornate">Ornate</option>
                </select>
              </div>
              <div class="form-field">
                <label>花纹位置</label>
                <select v-model="designSettings.cornerPosition">
                  <option value="All Positions">All Positions</option>
                  <option value="Top Corners">Top Corners</option>
                  <option value="Bottom Corners">Bottom Corners</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label>花纹颜色</label>
              <div class="color-input">
                <input v-model="designSettings.cornerColor" type="color" />
                <input v-model="designSettings.cornerColor" type="text" />
              </div>
            </div>

            <div class="form-field">
              <label>花纹不透明度 ({{ designSettings.cornerOpacity }}%)</label>
              <input type="range" v-model.number="designSettings.cornerOpacity" min="5" max="50" step="5">
            </div>

            <div class="form-field">
              <label>花纹大小 ({{ designSettings.cornerSize }}px)</label>
              <input type="range" v-model.number="designSettings.cornerSize" min="20" max="80" step="5">
            </div>
          </section>
        </div>

        <!-- 边框设置 -->
        <div v-else-if="activeDesignTab === 'border'">
          <div class="toggle-section">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.borderEnabled" class="toggle-input">
              <span class="toggle-text">启用边框</span>
            </label>
          </div>

          <section class="form-group">
            <div class="form-field">
              <label>边框颜色</label>
              <div class="color-input">
                <input v-model="designSettings.borderColor" type="color" />
                <input v-model="designSettings.borderColor" type="text" />
              </div>
            </div>

              <div class="form-field">
                <label>边框样式</label>
                <select v-model="designSettings.borderStyle">
                  <option value="Solid">Solid</option>
                  <option value="Dashed">Dashed</option>
                  <option value="Double">Double</option>
                  <option value="Groove">Groove</option>
                  <option value="Ridge">Ridge</option>
                  <option value="Rounded">Rounded</option>
                  <option value="Ornate">Ornate</option>
                </select>
              </div>
          </section>
        </div>
      </div>

      <!-- 右侧预览区域 -->
      <div class="preview-section">
        <h2>证书预览</h2>
        <div class="preview-wrapper">
          <div class="paper-tag">A4纸范围</div>
          <div ref="certificateRef" class="certificate-preview" :style="{ backgroundColor: designSettings.paperColor, fontFamily: designSettings.fontFamily }">
            <!-- 斜线水印（简化实现：直接在预览 DOM 中渲染，便于预览与导出） -->
            <svg v-if="designSettings.diagonalWatermarkEnabled"
                :style="{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: designSettings.watermarkOverlayDiagonal ? 100 : 50,
                mixBlendMode: designSettings.watermarkOverlayDiagonal ? 'normal' : 'multiply'
              }"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern :id="diagPatternId" patternUnits="userSpaceOnUse" :width="Number(designSettings.diagonalLineSpacing || 40)" :height="Number(designSettings.diagonalLineSpacing || 40)" :patternTransform="`translate(${(designSettings.diagonalLineSpacing||40)/2} ${(designSettings.diagonalLineSpacing||40)/2}) rotate(${designSettings.diagonalLineRotation||-30}) translate(${-(designSettings.diagonalLineSpacing||40)/2} ${-(designSettings.diagonalLineSpacing||40)/2})`">
                  <rect :x="( (designSettings.diagonalLineSpacing||40) - (designSettings.diagonalLineWidth||20) )/2" :y="-(designSettings.diagonalLineSpacing||40)" :width="designSettings.diagonalLineWidth||20" :height="(designSettings.diagonalLineSpacing||40)*3" :fill="designSettings.diagonalLineColor || '#000'" :fill-opacity="(designSettings.diagonalLineOpacity||5)/100" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" :fill="`url(#${diagPatternId})`" />
            </svg>
            
            <!-- 文字水印层 -->
            <div v-if="designSettings.textWatermarkEnabled" class="text-watermark"
              :style="{
                zIndex: watermark.settings.watermarkOverlayText ? 10 : 1,
                '--text-color': watermark.settings.textWatermarkColor,
                '--text-opacity': watermark.settings.textWatermarkOpacity / 100,
                '--text-size': watermark.settings.textWatermarkSize + 'px',
                '--text-rotation': watermark.settings.textWatermarkRotation + 'deg',
                '--watermark-text': `'${watermark.settings.textWatermarkText}'`,
                '--text-font': watermark.settings.textWatermarkFontFamily
              }"></div>
            
            <!-- 全屏水印层 -->
            <div v-if="watermark.settings.fullScreenWatermarkEnabled" class="fullscreen-watermark"
              :style="{
                zIndex: watermark.settings.watermarkOverlayFullscreen ? 10 : 1,
                '--watermark-spacing': watermark.settings.fullScreenWatermarkSpacing + 'px'
              }">
              <div v-for="i in fullWatermarkCount" :key="i" class="watermark-item"
                :style="{
                  color: watermark.settings.fullScreenWatermarkColor,
                  opacity: watermark.settings.fullScreenWatermarkOpacity / 100,
                  fontSize: watermark.settings.fullScreenWatermarkSize + 'px',
                  fontFamily: watermark.settings.fullScreenWatermarkFontFamily,
                  transform: `rotate(${watermark.settings.fullScreenWatermarkAngle ?? watermark.settings.textWatermarkRotation ?? 0}deg)`
                }">
                {{ watermark.settings.fullScreenWatermarkText }}
              </div>
            </div>

            <!-- 角落花纹（根据设置渲染四角或部分角） -->
            <div v-if="designSettings.cornerPatternEnabled" class="corner-patterns">
              <div v-if="designSettings.cornerPosition === 'All Positions' || designSettings.cornerPosition === 'Top Corners'" :style="cornerStyle('top-left')" :class="['corner top-left', cornerClassName(designSettings.cornerPattern)]"></div>
              <div v-if="designSettings.cornerPosition === 'All Positions' || designSettings.cornerPosition === 'Top Corners'" :style="cornerStyle('top-right')" :class="['corner top-right', cornerClassName(designSettings.cornerPattern)]"></div>
              <div v-if="designSettings.cornerPosition === 'All Positions' || designSettings.cornerPosition === 'Bottom Corners'" :style="cornerStyle('bottom-left')" :class="['corner bottom-left', cornerClassName(designSettings.cornerPattern)]"></div>
              <div v-if="designSettings.cornerPosition === 'All Positions' || designSettings.cornerPosition === 'Bottom Corners'" :style="cornerStyle('bottom-right')" :class="['corner bottom-right', cornerClassName(designSettings.cornerPattern)]"></div>
            </div>

            <div class="certificate-border" :class="{ ornate: designSettings.borderStyle === 'Ornate', rounded: designSettings.borderStyle === 'Rounded', groove: designSettings.borderStyle === 'Groove', ridge: designSettings.borderStyle === 'Ridge' }" :style="{ borderColor: designSettings.borderColor, borderStyle: designSettings.borderEnabled ? designSettings.borderStyle.toLowerCase() : 'none', borderWidth: designSettings.borderEnabled ? (designSettings.borderStyle === 'Double' ? '4px' : '2px') : '0', borderRadius: designSettings.borderStyle === 'Rounded' ? '12px' : '4px' }">
              <div class="certificate-header">
                <div class="header-logo" v-if="store.universityInfo.logo">
                  <img :src="store.universityInfo.logo" alt="Logo" />
                </div>
                <div class="header-logo-placeholder" v-else></div>
                <div class="header-university" :style="{ color: designSettings.borderColor }">{{ store.universityInfo.name }}</div>
              </div>

              <div class="certificate-title" :style="{ color: designSettings.borderColor }">{{ certificateData.title.toUpperCase() }}</div>

              <div class="certificate-body" :style="{ color: designSettings.textColor }">
                <div class="student-details-row">
                  <div class="details-text">
                    <p><strong>Name:</strong> {{ store.studentInfo.name }}</p>
                    <p><strong>Student ID:</strong> {{ store.studentInfo.studentId }}</p>
                    <p><strong>Date of Birth:</strong> May 15, 1998</p> <!-- 暂时硬编码 -->
                    <p><strong>Nationality:</strong> United States</p> <!-- 暂时硬编码 -->
                  </div>
                  <div class="student-photo-box">
                    <img v-if="store.studentPhoto.url" :src="store.studentPhoto.url" alt="Student Photo" />
                    <div v-else class="photo-placeholder"></div>
                  </div>
                </div>

                <div class="academic-details">
                  <p><strong>Faculty/School:</strong> {{ store.studentInfo.school }}</p>
                  <p><strong>Major:</strong> {{ store.studentInfo.major }}</p>
                  <p><strong>Degree Type:</strong> {{ store.studentInfo.degree }}</p>
                  <p><strong>Study Mode:</strong> {{ certificateData.studyMode }}</p>
                  <p><strong>Enrollment Date:</strong> {{ formatDate(store.studentInfo.enrollmentYear) }}</p>
                  <p><strong>Expected Graduation Date:</strong> {{ formatDate(store.studentInfo.expectedGraduation) }}</p>
                  <p><strong>Current Year:</strong> {{ certificateData.currentYear }}</p>
                </div>

                <div class="certificate-text">
                  {{ certificateData.bodyText }}
                </div>
              </div>

              <div class="certificate-footer">
                <div class="signature-section" :style="{ borderTopColor: designSettings.borderColor }">
                  <div class="issue-info">
                    <p><strong>Issue Date:</strong> {{ certificateData.issueDate }}</p>
                    <p><strong>Validity:</strong> {{ certificateData.validity }}</p>
                  </div>
                  <div class="signature-block">
                    <div v-if="certificateData.signatureSource === 'image' && certificateData.signatureImage" class="signature-image-container" style="display: flex; justify-content: flex-end; margin-bottom: -10px;">
                      <img :src="certificateData.signatureImage" alt="Signature" class="signature-img" style="max-height: 60px; max-width: 180px; object-fit: contain;" />
                    </div>
                    <div v-else class="signature-font" :style="{ fontFamily: certificateData.signatureFont, fontSize: certificateData.signatureFontSize + 'px' }">
                      {{ certificateData.issuerName }}
                    </div>
                    <div class="signature-line"></div>
                    <div class="issuer-title">{{ certificateData.issuerTitle }}</div>
                  </div>
                  <div class="signature-seal" v-if="designSettings.sealType || designSettings.sealImage">
                    <img v-if="designSettings.sealImage" :src="designSettings.sealImage" class="uploaded-seal" alt="Official Seal" />
                    <svg v-else-if="designSettings.sealType === 'All Packers'" width="60" height="60" viewBox="0 0 60 60">
                      <text x="30" y="52" font-size="6" text-anchor="middle" fill="#8B4513" opacity="0.3" font-weight="600">{{ designSettings.sealText || 'OFFICIAL SEAL' }}</text>
                    </svg>
                    <svg v-else-if="designSettings.sealType === 'Classic Seal'" width="60" height="60" viewBox="0 0 60 60">
                      <text x="30" y="8" font-size="5" text-anchor="middle" fill="#B8860B" opacity="0.4" font-weight="600">{{ designSettings.sealText || 'CLASSIC' }}</text>
                    </svg>
                    <svg v-else-if="designSettings.sealType === 'University Seal'" width="60" height="60" viewBox="0 0 60 60">
                      <text x="30" y="50" font-size="5" text-anchor="middle" fill="#000080" opacity="0.3" font-weight="600">{{ designSettings.sealText || 'UNIVERSITY' }}</text>
                    </svg>
                  </div>
                </div>

                  <!-- 中间分隔线（示例样式） -->
                  <div class="mid-divider" :style="{ backgroundColor: designSettings.borderColor }"></div>

                <div class="contact-section" :style="{ '--accent': designSettings.borderColor }">
                  <p>{{ certificateData.contactInfo }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-email" @click="showEmailModal = true">📧 发送邮件</button>
          <button class="btn-primary" @click="showDownloadPanel = true">📥 导出</button>
        </div>
        <p class="disclaimer">提示：导出的图片包含证书的所有元素，包括水印和背景</p>

        <DownloadPanel
          :visible="showDownloadPanel"
          :preview-selector="'.certificate-preview'"
          :default-file-name="`EnrollmentCert_${store.studentInfo.studentId || Date.now()}`"
          :default-format="'png'"
          :default-quality="3"
          @close="showDownloadPanel = false"
        />
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`Enrollment_${store.studentInfo.name}`"
      :default-subject="`在读证明 - ${store.studentInfo.name}`"
      preview-selector=".enrollment-certificate"
      @close="showEmailModal = false"
    />
  </div>
</template>

<style scoped>
.enrollment-page {
  padding: 0;
  background-color: #f9fafb;
  min-height: 100vh;
}

/* 子标签 */
.sub-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 0;
  background: white;
  border-bottom: 2px solid #E5E7EB;
  padding: 0 24px;
}

.sub-tabs button {
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: #6B7280;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s;
}

.sub-tabs button.active {
  color: #4B6EF5;
  border-bottom-color: #4B6EF5;
}

.sub-tabs button:hover {
  color: #4B6EF5;
}

.page-container {
  display: flex;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  align-items: flex-start;
}

.editor-section {
  flex: 4.5;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 650px;
  height: fit-content;
}

.preview-section {
  flex: 5.5;
  display: flex;
  flex-direction: column;
  max-width: 900px;
}

h2 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 24px;
}

h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 32px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full-width {
  width: 100%;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

input, select, textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4b6ef5;
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.1);
}

/* 设计标签 */
.design-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.design-tabs button {
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s;
}

.design-tabs button.active {
  background: #4b6ef5;
  color: white;
  border-color: #4b6ef5;
}

.design-tabs button:hover {
  background: #e5e7eb;
}

.design-tabs button.active:hover {
  background: #3b5ee5;
}

/* 颜色输入（图二样式） */
.color-input {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 小方块色盘 */
.color-input input[type="color"] {
  width: 44px;
  height: 30px;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  flex: 0 0 auto;
}

.color-input input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 4px;
  border-radius: 8px;
}

.color-input input[type="color"]::-webkit-color-swatch {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

/* 十六进制输入框 */
.color-input input[type="text"] {
  width: 120px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  flex: 0 0 auto;
}

/* Logo Upload */
.logo-upload-compact {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-preview-box {
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-placeholder {
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.upload-btn-small {
  padding: 6px 12px;
  background: #1f2937;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
}

/* Photo Upload */
.photo-upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-btn-dark {
  padding: 8px 16px;
  background: #1f2937;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.upload-btn-dark.secondary {
  background: #f5f5f5;
  color: #666;
}

.upload-btn-dark.secondary:hover {
  background: #e0e0e0;
}

.divider-text {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin: 12px 0;
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

.hint-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* Preview */
.preview-wrapper {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  position: relative;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-top: 35px;
}

.paper-tag {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: #4b6ef5;
  color: white;
  padding: 6px 20px;
  border-radius: 6px;
  font-size: 13px;
  white-space: nowrap;
  z-index: 10;
  font-weight: 500;
}

.certificate-preview {
  width: 700px;
  height: auto;
  min-height: 980px;
  background: white;
  padding: 35px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  position: relative;
  border: 1.5px dashed rgba(17, 24, 39, 0.12); /* A4 轻薄虚线边框（对比度提高，确保可见） */
  z-index: 2;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  border-radius: 4px;
}

/* 角落花纹容器与样式 */
.corner-patterns {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 4; /* 高于水印层 */
}

.corner {
  pointer-events: none;
  z-index: 4;
  background: transparent;
}

/* 花纹风格变体 */
.corner.minimal {
  border-color: currentColor;
}

.corner.elegant {
  border-color: currentColor;
  border-width: 2px;
  border-style: solid;
  filter: drop-shadow(0 0 0 rgba(0,0,0,0));
}

.corner.classic {
  border-color: currentColor;
  border-width: 3px;
  border-style: solid;
}

.corner.geometric {
  border: none;
  background-image: radial-gradient(circle at 20% 20%, currentColor 15%, transparent 16%), radial-gradient(circle at 80% 80%, currentColor 15%, transparent 16%);
  background-size: 12px 12px;
  background-repeat: no-repeat;
}

.corner.filigree {
  border: none;
}

.corner.filigree::after {
  content: '';
  position: absolute;
  inset: 2px;
  background-image: radial-gradient(circle at 20% 20%, currentColor 12%, transparent 13%), radial-gradient(circle at 80% 80%, currentColor 12%, transparent 13%);
  opacity: inherit;
  background-size: 60% 60%;
  background-repeat: no-repeat;
}

.corner.ornate {
  border: none;
}

.corner.ornate::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: conic-gradient(from 45deg at 0% 0%, currentColor 0deg, transparent 45deg), conic-gradient(from -45deg at 100% 0%, currentColor 0deg, transparent 45deg);
  opacity: inherit;
  background-size: 60% 60%;
  background-repeat: no-repeat;
}

/* 边框样式变体 */
.certificate-border.groove { border-style: groove !important; }
.certificate-border.ridge { border-style: ridge !important; }
.certificate-border.rounded { border-radius: 12px !important; }
.certificate-border.ornate { position: relative; }
.certificate-border.ornate::before { content: ''; position: absolute; inset: 12px; border: 2px solid currentColor; pointer-events: none; border-radius: 6px; opacity: 0.9; }

.certificate-border {
  width: 100%;
  height: 100%;
  border: 2px solid #1e40af;
  border-style: solid;
  border-width: 2px;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.certificate-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #000;
}

.header-logo {
  width: 60px;
  height: 60px;
}

.header-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.header-logo-placeholder {
  width: 60px;
  height: 60px;
  background: #f3f4f6;
}

.header-university {
  font-size: 26px;
  font-weight: 700;
  color: #1e40af;
  font-family: serif;
  margin-top: 8px;
}

.certificate-title {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 30px;
  font-family: serif;
  letter-spacing: 2px;
}

.certificate-body {
  flex: 1;
}

.student-details-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.details-text p {
  margin: 6px 0;
  font-size: 15px;
  color: #111827;
}

.details-text p strong {
  font-weight: 700;
}

.student-photo-box {
  width: 90px;
  height: 120px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-photo-box img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.academic-details {
  margin-bottom: 30px;
}

.academic-details p {
  margin: 6px 0;
  font-size: 15px;
  color: #111827;
}

.academic-details p strong {
  font-weight: 700;
}

.certificate-text {
  font-size: 15px;
  line-height: 1.8;
  color: #374151;
  text-align: justify;
  margin-bottom: 30px;
}

.certificate-footer {
  margin-top: auto;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 18px;
  padding-top: 16px;
  border-top: 2px solid #1e40af; /* 颜色由行内样式覆盖 */
}

.issue-info p {
  margin: 4px 0;
  font-size: 15px;
  color: #111827;
}

.issue-info p strong {
  font-weight: 700;
}

.signature-block {
  text-align: right;
}

.signature-line {
  border-top: 1px solid #111827; /* 黑色细线，贴合签名 */
  margin: 4px 0 8px;
}

.signature-font {
  font-family: 'Allura', 'Great Vibes', 'Snell Roundhand', 'Brush Script MT', cursive;
  font-size: 22px;
  font-weight: 400;
  color: #111827;
  margin-bottom: 2px;
}

.issuer-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}

/* 中间分隔线 */
.mid-divider {
  height: 2px;
  width: 100%;
  margin: 12px 0 16px;
  border-radius: 0;
  background: #1e40af; /* 颜色由行内样式覆盖，与上方线条保持一致 */
}

.contact-section {
  position: relative;
  text-align: center;
  background: transparent;
  padding: 16px 0 0 0;
  margin: 0;
  width: 100%;
  border: none;
  box-shadow: none;
}

.contact-section::before,
.contact-section::after { display: none; }

.divider { display: none; }

.contact-section p {
  font-size: 14px;
  color: #374151;
  max-width: 100%;
  margin: 0 auto;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.btn-primary {
  padding: 10px 24px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-email {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-email:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  padding: 10px 24px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.disclaimer {
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
}

/* 斜线水印样式已移除 */

.text-watermark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}

.text-watermark::before {
  content: var(--watermark-text);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(var(--text-rotation));
  font-size: var(--text-size);
  color: var(--text-color);
  opacity: var(--text-opacity);
  font-family: var(--text-font);
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: 4px;
}

/* 多个水印文字实例 */
.text-watermark::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  transform: translate(-25%, -25%);
  background-image: 
    repeating-linear-gradient(
      var(--text-rotation),
      transparent 0,
      transparent 150px,
      transparent 150px,
      transparent 300px
    );
}

/* 全屏水印 */
.fullscreen-watermark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  padding: 40px;
  gap: var(--watermark-spacing, 200px);
}

.watermark-item {
  transform: rotate(-30deg);
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: 2px;
  user-select: none;
}

/* 设计选项样式增强 */
.toggle-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
}

.toggle-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.toggle-text {
  color: #111827;
}

.hint-box {
  padding: 12px;
  background: #eff6ff;
  border-left: 3px solid #4b6ef5;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
  margin-bottom: 20px;
  line-height: 1.5;
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.subsection-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.toggle-label-inline {
  display: flex;
  align-items: center;
}

.angle-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.angle-slider span {
  font-size: 12px;
  color: #6b7280;
  min-width: 30px;
}

.angle-slider input[type="range"] {
  flex: 1;
}

.tips-section {
  margin-top: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.tips-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.tips-section li {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 8px;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  padding: 0;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4b6ef5;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4b6ef5;
  cursor: pointer;
  border: none;
}
</style>