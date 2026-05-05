<template>
  <div class="enrollment-cert-preview" :class="[data.template, data.language]" :style="{
    fontFamily: designSettings.fontFamilyCN,
    '--font-en': designSettings.fontFamilyEN,
    '--border-color': designSettings.borderColor,
    '--border-width': designSettings.borderWidth + 'px',
    '--border-style': designSettings.borderStyle,
    '--stamp-color': designSettings.stampColor,
    '--stamp-rotation': designSettings.stampRotation + 'deg',
    '--watermark-color': designSettings.watermarkColor,
    '--watermark-opacity': designSettings.watermarkOpacity / 100
  }">
    <!-- 自定义水印 -->
    <div v-if="designSettings.watermarkEnabled" class="watermark-layer" :class="designSettings.watermarkType || 'center'">
      <template v-if="designSettings.watermarkType === 'fullscreen'">
        <span v-for="i in 20" :key="i" class="watermark-text" :style="{
          color: designSettings.watermarkColor,
          opacity: designSettings.watermarkOpacity / 100
        }">{{ designSettings.watermarkText }}</span>
      </template>
      <span v-else class="watermark-center" :style="{
        color: designSettings.watermarkColor,
        opacity: designSettings.watermarkOpacity / 100
      }">{{ designSettings.watermarkText }}</span>
    </div>
    
    <!-- 边框装饰 -->
    <div v-if="designSettings.borderEnabled" class="custom-border" :class="'border-' + designSettings.borderStyle"></div>
    
    <!-- 官方模板 -->
    <div v-if="data.template === 'official'" class="template-official">
      <div class="watermark">{{ data.schoolName }}</div>
      
      <div class="header">
        <div class="logo-area" v-if="data.schoolLogo">
          <img :src="data.schoolLogo" alt="logo" class="school-logo" />
        </div>
        <div class="school-info">
          <h1 class="school-name">{{ data.schoolName }}</h1>
          <h2 class="school-name-en">{{ data.schoolNameEn }}</h2>
        </div>
      </div>
      
      <div class="doc-title">
        <span class="cn">在 读 证 明</span>
        <span class="en">CERTIFICATE OF ENROLLMENT</span>
      </div>
      
      <div class="serial-number">
        编号 No.: {{ data.serialNumber }}
      </div>
      
      <div class="content-section">
        <div class="photo-area" v-if="data.showPhoto && data.photo">
          <img :src="data.photo" alt="photo" />
        </div>
        
        <div class="cert-content">
          <p class="cn-content">
            兹证明 <span class="highlight" :style="{ fontFamily: data.studentNameFont }">{{ data.studentName }}</span>，
            {{ data.gender === 'male' ? '男' : '女' }}，
            <span v-if="data.birthDate">{{ data.birthDate }} 出生，</span>
            身份证号 <span class="highlight">{{ data.idNumber }}</span>，
            系我校 <span class="highlight">{{ data.faculty }}</span>
            <span class="highlight">{{ data.major }}</span> 专业
            <span class="highlight">{{ data.grade }}</span> 学生，
            学号 <span class="highlight">{{ data.studentId }}</span>。
          </p>
          <p class="cn-content">
            该生于 <span class="highlight">{{ data.enrollmentDate }}</span> 入学，
            学制{{ getStudyYears() }}年，
            预计 <span class="highlight">{{ data.expectedGraduation }}</span> 毕业。
            目前学籍状态为<span class="highlight">{{ getStatusLabel() }}</span>，
            学历层次为<span class="highlight">{{ getEducationLabel() }}</span>，
            学习形式为<span class="highlight">{{ data.studyMode === 'fulltime' ? '全日制' : '非全日制' }}</span>。
          </p>
          <p class="cn-content" v-if="data.purpose">
            本证明仅用于{{ data.purpose }}，特此证明。
          </p>
          
          <div class="divider"></div>
          
          <p class="en-content" v-if="data.language !== 'chinese'">
            This is to certify that <span class="highlight">{{ data.studentNameEn }}</span>, 
            {{ data.gender === 'male' ? 'male' : 'female' }}, 
            ID Number: <span class="highlight">{{ data.idNumber }}</span>, 
            is currently a {{ getEducationLabelEn() }} student majoring in 
            <span class="highlight">{{ data.majorEn }}</span> 
            at <span class="highlight">{{ data.facultyEn }}</span> of our university.
          </p>
          <p class="en-content" v-if="data.language !== 'chinese'">
            Student ID: <span class="highlight">{{ data.studentId }}</span>. 
            Enrolled on <span class="highlight">{{ data.enrollmentDate }}</span>, 
            expected to graduate in <span class="highlight">{{ data.expectedGraduation }}</span>.
            Current status: <span class="highlight">{{ getStatusLabelEn() }}</span>.
          </p>
        </div>
      </div>
      
      <div class="footer-section">
        <div class="validity">
          <p>发证日期 Issue Date: {{ data.issueDate }}</p>
          <p>有效期至 Valid Until: {{ data.validUntil }}</p>
        </div>
        
        <div class="seal-signature">
          <!-- 印章区域 -->
          <div class="seal-area" v-if="designSettings.stampEnabled">
            <img v-if="designSettings.stampSource === 'upload' && designSettings.stampImage" 
                 :src="designSettings.stampImage" 
                 alt="印章" 
                 class="uploaded-stamp"
                 :style="{ transform: 'rotate(' + designSettings.stampRotation + 'deg)' }" />
            <div v-else class="seal" :style="{ color: designSettings.stampColor, borderColor: designSettings.stampColor }">
              <span>{{ data.schoolName }}</span>
              <span>{{ designSettings.stampType === 'official' ? '公章' : designSettings.stampType === 'academic' ? '教务处' : '学籍管理' }}</span>
            </div>
          </div>
          
          <!-- 签章区域 -->
          <div class="signature" v-if="designSettings.signatureEnabled">
            <p>{{ data.registrarTitle }}:</p>
            <img v-if="(designSettings.signatureSource === 'upload' || designSettings.signatureSource === 'gallery') && designSettings.signatureImage" 
                 :src="designSettings.signatureImage" 
                 alt="签章" 
                 class="uploaded-signature" />
            <p v-else class="signature-name" :style="{ fontFamily: designSettings.signatureFont, fontSize: designSettings.signatureFontSize + 'px' }">{{ data.registrarName }}</p>
          </div>
        </div>
        
        <!-- 条形码和二维码区域 -->
        <div class="codes-area" v-if="designSettings.qrCodeEnabled || designSettings.barcodeEnabled">
          <!-- 条形码 -->
          <div class="barcode-area" v-if="designSettings.barcodeEnabled">
            <img v-if="(designSettings.barcodeSource === 'upload' || designSettings.barcodeSource === 'gallery') && designSettings.barcodeImage" 
                 :src="designSettings.barcodeImage" 
                 alt="条形码" 
                 class="uploaded-barcode" />
            <template v-else>
              <svg ref="barcodeRef" class="generated-barcode"></svg>
              <span class="barcode-text">{{ designSettings.barcodeContent || data.studentId }}</span>
            </template>
          </div>
          <!-- 二维码 -->
          <div class="qr-area" v-if="designSettings.qrCodeEnabled">
            <img v-if="(designSettings.qrCodeSource === 'upload' || designSettings.qrCodeSource === 'gallery') && designSettings.qrCodeImage" 
                 :src="designSettings.qrCodeImage" 
                 alt="扫码查验" 
                 class="uploaded-qrcode" />
            <canvas v-else ref="qrCanvas" class="generated-qrcode"></canvas>
            <div class="qr-label">
              <span>扫码验证</span>
              <span>Scan to verify</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="contact-info">
        <p>地址 Address: {{ data.schoolAddress }}</p>
        <p>电话 Tel: {{ data.schoolPhone }} | 学校代码 Code: {{ data.schoolCode }}</p>
      </div>
    </div>
    
    <!-- 现代模板 -->
    <div v-else-if="data.template === 'modern'" class="template-modern">
      <div class="modern-header">
        <div class="brand">
          <div class="logo" v-if="data.schoolLogo">
            <img :src="data.schoolLogo" alt="logo" />
          </div>
          <div class="brand-text">
            <h1>{{ data.schoolName }}</h1>
            <p>{{ data.schoolNameEn }}</p>
          </div>
        </div>
        <div class="cert-badge">
          <span class="badge-icon">📜</span>
          <span class="badge-text">在读证明</span>
        </div>
      </div>
      
      <div class="student-card">
        <div class="card-photo" v-if="data.showPhoto && data.photo">
          <img :src="data.photo" alt="photo" />
        </div>
        <div class="card-info">
          <h2>{{ data.studentName }}</h2>
          <p class="en-name">{{ data.studentNameEn }}</p>
          <div class="info-tags">
            <span class="tag">{{ data.studentId }}</span>
            <span class="tag">{{ data.major }}</span>
            <span class="tag status">{{ getStatusLabel() }}</span>
          </div>
        </div>
      </div>
      
      <div class="info-grid">
        <div class="info-item">
          <span class="icon">🏛️</span>
          <div class="info-content">
            <span class="label">学院</span>
            <span class="value">{{ data.faculty }}</span>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">📅</span>
          <div class="info-content">
            <span class="label">入学日期</span>
            <span class="value">{{ data.enrollmentDate }}</span>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">🎓</span>
          <div class="info-content">
            <span class="label">学历层次</span>
            <span class="value">{{ getEducationLabel() }}</span>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">⏰</span>
          <div class="info-content">
            <span class="label">预计毕业</span>
            <span class="value">{{ data.expectedGraduation }}</span>
          </div>
        </div>
      </div>
      
      <div class="cert-statement">
        <p>本证明确认上述学生目前为我校{{ data.studyMode === 'fulltime' ? '全日制' : '非全日制' }}在读学生。</p>
        <p class="en" v-if="data.language !== 'chinese'">
          This certificate confirms that the above-mentioned student is currently enrolled as a {{ data.studyMode === 'fulltime' ? 'full-time' : 'part-time' }} student at our university.
        </p>
      </div>
      
      <div class="modern-footer">
        <div class="validity-badge">
          <span>有效期至</span>
          <strong>{{ data.validUntil }}</strong>
        </div>
        <div class="serial">{{ data.serialNumber }}</div>
      </div>
    </div>
    
    <!-- 双语模板 -->
    <div v-else class="template-bilingual">
      <div class="bilingual-header">
        <h1 class="cn">{{ data.schoolName }}</h1>
        <h1 class="en">{{ data.schoolNameEn }}</h1>
        <div class="title-divider"></div>
        <h2 class="cn">在读证明</h2>
        <h2 class="en">Certificate of Enrollment</h2>
      </div>
      
      <div class="bilingual-body">
        <div class="column cn-column">
          <h3>学生信息</h3>
          <table class="info-table">
            <tr><td>姓名:</td><td>{{ data.studentName }}</td></tr>
            <tr><td>性别:</td><td>{{ data.gender === 'male' ? '男' : '女' }}</td></tr>
            <tr><td>学号:</td><td>{{ data.studentId }}</td></tr>
            <tr><td>学院:</td><td>{{ data.faculty }}</td></tr>
            <tr><td>专业:</td><td>{{ data.major }}</td></tr>
            <tr><td>年级:</td><td>{{ data.grade }}</td></tr>
            <tr><td>学历:</td><td>{{ getEducationLabel() }}</td></tr>
            <tr><td>学籍状态:</td><td>{{ getStatusLabel() }}</td></tr>
            <tr><td>入学日期:</td><td>{{ data.enrollmentDate }}</td></tr>
            <tr><td>预计毕业:</td><td>{{ data.expectedGraduation }}</td></tr>
          </table>
        </div>
        
        <div class="column en-column">
          <h3>Student Information</h3>
          <table class="info-table">
            <tr><td>Name:</td><td>{{ data.studentNameEn }}</td></tr>
            <tr><td>Gender:</td><td>{{ data.gender === 'male' ? 'Male' : 'Female' }}</td></tr>
            <tr><td>Student ID:</td><td>{{ data.studentId }}</td></tr>
            <tr><td>Faculty:</td><td>{{ data.facultyEn }}</td></tr>
            <tr><td>Major:</td><td>{{ data.majorEn }}</td></tr>
            <tr><td>Grade:</td><td>{{ data.grade }}</td></tr>
            <tr><td>Degree:</td><td>{{ getEducationLabelEn() }}</td></tr>
            <tr><td>Status:</td><td>{{ getStatusLabelEn() }}</td></tr>
            <tr><td>Enrollment:</td><td>{{ data.enrollmentDate }}</td></tr>
            <tr><td>Expected Grad:</td><td>{{ data.expectedGraduation }}</td></tr>
          </table>
        </div>
      </div>
      
      <div class="bilingual-footer">
        <div class="cert-info">
          <p>证书编号 No.: {{ data.serialNumber }}</p>
          <p>发证日期 Issue Date: {{ data.issueDate }}</p>
          <p>有效期至 Valid Until: {{ data.validUntil }}</p>
        </div>
        <div class="seal-area" v-if="data.showSeal">
          <div class="seal">教务处</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useEnrollmentCertStore, educationLevels, studentStatuses } from '@/stores/enrollmentCert'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

const store = useEnrollmentCertStore()
const data = store.data
const designSettings = store.designSettings
const qrCanvas = ref<HTMLCanvasElement>()
const barcodeRef = ref<SVGElement>()

const getStudyYears = () => {
  if (data.educationLevel === 'undergraduate') return '4'
  if (data.educationLevel === 'master') return '3'
  return '4'
}

const getEducationLabel = () => {
  return educationLevels.find(l => l.value === data.educationLevel)?.label || ''
}

const getEducationLabelEn = () => {
  return educationLevels.find(l => l.value === data.educationLevel)?.labelEn || ''
}

const getStatusLabel = () => {
  return studentStatuses.find(s => s.value === data.studentStatus)?.label || ''
}

const getStatusLabelEn = () => {
  return studentStatuses.find(s => s.value === data.studentStatus)?.labelEn || ''
}

// 生成二维码
const generateQRCode = async () => {
  if (!qrCanvas.value || designSettings.qrCodeSource === 'upload' || designSettings.qrCodeSource === 'gallery') return
  
  const content = designSettings.qrCodeContent || 
    `https://verify.edu.cn/cert/${data.serialNumber}?student=${data.studentId}`
  
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
  if (!barcodeRef.value || designSettings.barcodeSource === 'upload' || designSettings.barcodeSource === 'gallery') return
  
  nextTick(() => {
    try {
      const content = designSettings.barcodeContent || data.studentId || '0000000000'
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
  if (designSettings.qrCodeEnabled && designSettings.qrCodeSource === 'generate') {
    generateQRCode()
  }
  if (designSettings.barcodeEnabled && designSettings.barcodeSource === 'generate') {
    generateBarcode()
  }
})

watch(() => [designSettings.qrCodeEnabled, designSettings.qrCodeSource, designSettings.qrCodeContent, data.serialNumber], () => {
  if (designSettings.qrCodeEnabled && designSettings.qrCodeSource === 'generate') {
    generateQRCode()
  }
})

watch(() => [designSettings.barcodeEnabled, designSettings.barcodeSource, designSettings.barcodeContent, data.studentId], () => {
  if (designSettings.barcodeEnabled && designSettings.barcodeSource === 'generate') {
    generateBarcode()
  }
})
</script>

<style scoped>
.enrollment-cert-preview {
  background: #fff;
  color: #333;
  font-family: 'SimSun', 'Songti SC', serif;
  position: relative;
}

/* 英文内容使用英文字体 */
.enrollment-cert-preview .en,
.enrollment-cert-preview .en-column,
.enrollment-cert-preview [class*="-en"] {
  font-family: var(--font-en, 'Times New Roman', serif);
}

/* 自定义水印 */
.watermark-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}

.watermark-layer.center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
}

.watermark-layer.fullscreen {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  gap: 30px;
  padding: 80px 20px 20px 20px;
}

.watermark-center {
  font-size: 60px;
  font-weight: bold;
  transform: rotate(-30deg);
  white-space: nowrap;
  letter-spacing: 10px;
}

.watermark-text {
  font-size: 16px;
  font-weight: bold;
  transform: rotate(-30deg);
  white-space: nowrap;
}

/* 自定义边框 */
.custom-border {
  position: absolute;
  inset: 8px;
  pointer-events: none;
  z-index: 50;
}

.custom-border.border-solid {
  border: var(--border-width) solid var(--border-color);
}

.custom-border.border-double {
  border: var(--border-width) double var(--border-color);
}

.custom-border.border-dashed {
  border: var(--border-width) dashed var(--border-color);
}

.custom-border.border-ornate {
  border: var(--border-width) solid var(--border-color);
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139,0,0,0.1) 10px, rgba(139,0,0,0.1) 20px);
}

/* 自定义印章 */
.custom-stamp {
  position: absolute;
  bottom: 80px;
  right: 80px;
  width: 100px;
  height: 100px;
  border: 3px solid;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  font-weight: bold;
}

.custom-stamp .stamp-inner {
  text-align: center;
  font-size: 14px;
  line-height: 1.2;
}

/* 官方模板 */
.template-official {
  padding: 50px;
  min-height: 700px;
  position: relative;
  border: 3px double #8B0000;
}

.template-official .watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 100px;
  color: rgba(139, 0, 0, 0.03);
  white-space: nowrap;
  pointer-events: none;
}

.template-official .header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.template-official .school-logo {
  width: 70px;
  height: 70px;
}

.template-official .school-name {
  font-size: 32px;
  color: #8B0000;
  margin: 0;
  letter-spacing: 4px;
}

.template-official .school-name-en {
  font-size: 14px;
  color: #666;
  margin: 8px 0 0;
  font-family: 'Times New Roman', serif;
}

.template-official .doc-title {
  text-align: center;
  margin: 30px 0;
  border-top: 2px solid #8B0000;
  border-bottom: 2px solid #8B0000;
  padding: 20px 0;
}

.template-official .doc-title .cn {
  display: block;
  font-size: 28px;
  letter-spacing: 20px;
  color: #8B0000;
  font-weight: bold;
}

.template-official .doc-title .en {
  display: block;
  font-size: 14px;
  color: #666;
  margin-top: 8px;
  font-family: 'Times New Roman', serif;
  letter-spacing: 3px;
}

.template-official .serial-number {
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-bottom: 20px;
}

.template-official .content-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.template-official .photo-area {
  width: 100px;
  flex-shrink: 0;
}

.template-official .photo-area img {
  width: 100%;
  border: 1px solid #ddd;
}

.template-official .cert-content {
  flex: 1;
}

.template-official .cn-content {
  font-size: 14px;
  line-height: 2.2;
  text-indent: 2em;
  margin: 0 0 15px;
}

.template-official .en-content {
  font-size: 12px;
  line-height: 1.8;
  color: #555;
  font-family: 'Times New Roman', serif;
  margin: 0 0 10px;
}

.template-official .highlight {
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.template-official .divider {
  height: 1px;
  background: #ddd;
  margin: 20px 0;
}

.template-official .footer-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px dashed #ccc;
}

.template-official .validity {
  font-size: 12px;
  color: #666;
}

.template-official .seal-signature {
  display: flex;
  gap: 30px;
  align-items: flex-end;
}

.template-official .seal {
  width: 100px;
  height: 100px;
  border: 3px solid #8B0000;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8B0000;
  font-size: 12px;
  transform: rotate(-15deg);
  opacity: 0.8;
}

.template-official .signature {
  text-align: right;
  font-size: 12px;
}

.template-official .signature-name {
  font-size: 18px;
  font-family: 'KaiTi', cursive;
  margin-top: 8px;
}

/* 条形码和二维码区域 */
.template-official .codes-area {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 30px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
}

.template-official .barcode-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.template-official .barcode-area .uploaded-barcode {
  height: 50px;
  width: auto;
  max-width: 180px;
  object-fit: contain;
}

.template-official .barcode-area .generated-barcode {
  height: 50px;
  width: auto;
}

.template-official .barcode-area .barcode-text {
  font-size: 11px;
  margin-top: 4px;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  color: #333;
}

.template-official .qr-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.template-official .qr-area .uploaded-qrcode {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.template-official .qr-area .generated-qrcode {
  width: 70px !important;
  height: 70px !important;
}

.template-official .qr-area .qr-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4px;
  font-size: 9px;
  color: #666;
}

.template-official .qr-area .qr-placeholder {
  width: 70px;
  height: 70px;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #999;
}

.template-official .contact-info {
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 10px;
  color: #888;
  text-align: center;
}

/* 现代模板 */
.template-modern {
  padding: 30px;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  min-height: 600px;
  color: #fff;
}

.template-modern .modern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.template-modern .brand {
  display: flex;
  align-items: center;
  gap: 15px;
}

.template-modern .logo img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
}

.template-modern .brand-text h1 {
  margin: 0;
  font-size: 22px;
}

.template-modern .brand-text p {
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.8;
}

.template-modern .cert-badge {
  background: rgba(255,255,255,0.15);
  padding: 15px 25px;
  border-radius: 12px;
  text-align: center;
}

.template-modern .badge-icon {
  font-size: 24px;
  display: block;
}

.template-modern .badge-text {
  font-size: 14px;
  margin-top: 4px;
}

.template-modern .student-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 20px;
  color: #333;
  margin-bottom: 20px;
}

.template-modern .card-photo {
  width: 80px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.template-modern .card-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-modern .card-info h2 {
  margin: 0;
  font-size: 24px;
}

.template-modern .en-name {
  color: #666;
  font-size: 14px;
  margin: 4px 0 12px;
}

.template-modern .info-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.template-modern .tag {
  background: #e3f2fd;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: #1565c0;
}

.template-modern .tag.status {
  background: #c8e6c9;
  color: #2e7d32;
}

.template-modern .info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.template-modern .info-item {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-modern .info-item .icon {
  font-size: 24px;
}

.template-modern .info-content .label {
  display: block;
  font-size: 11px;
  opacity: 0.8;
}

.template-modern .info-content .value {
  font-size: 14px;
  font-weight: 500;
}

.template-modern .cert-statement {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.template-modern .cert-statement p {
  margin: 0 0 8px;
  font-size: 14px;
}

.template-modern .cert-statement .en {
  font-size: 12px;
  opacity: 0.9;
}

.template-modern .modern-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-modern .validity-badge {
  background: rgba(255,255,255,0.2);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 12px;
}

.template-modern .validity-badge strong {
  display: block;
  font-size: 16px;
  margin-top: 4px;
}

.template-modern .serial {
  font-size: 11px;
  opacity: 0.7;
}

/* 双语模板 */
.template-bilingual {
  padding: 40px;
  min-height: 650px;
}

.template-bilingual .bilingual-header {
  text-align: center;
  margin-bottom: 30px;
}

.template-bilingual .bilingual-header h1.cn {
  font-size: 28px;
  color: #1a237e;
  margin: 0;
}

.template-bilingual .bilingual-header h1.en {
  font-size: 18px;
  color: #333;
  margin: 8px 0 0;
  font-family: 'Times New Roman', serif;
}

.template-bilingual .title-divider {
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #1a237e, #0d47a1);
  margin: 20px auto;
}

.template-bilingual .bilingual-header h2.cn {
  font-size: 22px;
  color: #1a237e;
  margin: 0;
  letter-spacing: 8px;
}

.template-bilingual .bilingual-header h2.en {
  font-size: 14px;
  color: #666;
  margin: 8px 0 0;
  font-weight: normal;
}

.template-bilingual .bilingual-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.template-bilingual .column h3 {
  font-size: 14px;
  color: #1a237e;
  margin: 0 0 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
}

.template-bilingual .info-table {
  width: 100%;
  font-size: 12px;
}

.template-bilingual .info-table td {
  padding: 6px 0;
}

.template-bilingual .info-table td:first-child {
  width: 80px;
  color: #666;
}

.template-bilingual .bilingual-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.template-bilingual .cert-info {
  font-size: 11px;
  color: #666;
}

.template-bilingual .cert-info p {
  margin: 4px 0;
}

.template-bilingual .seal {
  width: 80px;
  height: 80px;
  border: 2px solid #1a237e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a237e;
  font-size: 14px;
  transform: rotate(-10deg);
}

/* 上传的印章图片 */
.uploaded-stamp {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
}

/* 上传的签名图片 */
.uploaded-signature {
  max-width: 120px;
  max-height: 50px;
  object-fit: contain;
}

/* 上传的二维码图片 */
.uploaded-qrcode {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

/* 生成的二维码 */
.generated-qrcode {
  width: 80px !important;
  height: 80px !important;
}
</style>
