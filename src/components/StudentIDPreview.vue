<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useStudentStore } from '@/stores/student'
import JsBarcode from 'jsbarcode'

const store = useStudentStore()
const barcodeCanvasRef = ref<HTMLCanvasElement | null>(null)

// 计算属性获取当前设计选项
const cardStyle = computed(() => store.idCardStyle)
// 计算卡片背景样式，优先使用背景图，其次使用卡片颜色，支持透明度
const cardBackgroundStyle = computed(() => {
  const style: Record<string, string> = {}
  const bgImg = cardStyle.value.backgroundImage
  const color = cardStyle.value.cardColor || cardStyle.value.color || '#4B6EF5'
  const opacity = typeof cardStyle.value.backgroundOpacity === 'number' ? cardStyle.value.backgroundOpacity : 100

  if (bgImg) {
    style.backgroundImage = `url(${bgImg})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style.backgroundRepeat = 'no-repeat'
  } else {
    // 如果需要透明度，将颜色转换为 rgba（假设传入为 #rrggbb）
    const hex = color.replace('#', '')
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0,2),16)
      const g = parseInt(hex.substring(2,4),16)
      const b = parseInt(hex.substring(4,6),16)
      style.background = `rgba(${r}, ${g}, ${b}, ${opacity/100})`
    } else {
      style.background = color
    }
  }

  return style
})

// 背景透明度样式，用于::after伪元素
const cardBackgroundOpacity = computed(() => 
  typeof cardStyle.value.backgroundOpacity === 'number' ? cardStyle.value.backgroundOpacity / 100 : 1
)

// 文字颜色样式
const textColorStyle = computed(() => ({
  color: cardStyle.value.textColor || 'inherit'
}))

// 卡片方向样式
const cardOrientationClass = computed(() => {
  return cardStyle.value.cardOrientation === 'Portrait (Vertical)' ? 'portrait' : 'landscape'
})
// 监听并注入颜色变量供 CSS 使用，便于根据 `idCardStyle.textColor` 调整排版色彩
const watermarkStyle = computed(() => ({
  color: cardStyle.value.watermarkColor || '#000000',
  fontSize: `${cardStyle.value.watermarkSize || 14}px`,
  transform: `rotate(${cardStyle.value.watermarkRotation || -30}deg)`,
  opacity: (cardStyle.value.watermarkOpacity || 4) / 100,
  fontFamily: cardStyle.value.watermarkFontFamily || 'Arial'
}))

const updateBarcode = () => {
  setTimeout(() => {
    const canvas = barcodeCanvasRef.value
    const id = store.studentInfo.studentId
    
    console.log('updateBarcode - canvas:', !!canvas, 'id:', id)
    
    if (!id || !canvas) {
      console.warn('Missing requirements:', { hasCanvas: !!canvas, id })
      return
    }

    try {
      // 设置 canvas 尺寸
      canvas.width = 240
      canvas.height = 45
      
      // 生成条形码
      JsBarcode(canvas, id, {
        format: 'CODE128',
        width: 2,
        height: 38,
        displayValue: false,
        margin: 0,
        lineColor: '#000000',
        background: 'transparent'
      })
      
      console.log('✓ Barcode rendered successfully to canvas')
    } catch (e) {
      console.error('✗ Barcode render failed:', e)
    }
  }, 150)
}

onMounted(() => {
  console.log('Component mounted, studentId:', store.studentInfo.studentId)
  updateBarcode()
  
  setTimeout(() => {
    updateBarcode()
  }, 300)
})

// 监听学号变化重新生成条形码
watch(() => store.studentInfo.studentId, (newId) => {
  console.log('StudentId changed to:', newId)
  nextTick(() => updateBarcode())
}, { flush: 'post' })

// 当样式（背景/大小）变化时也尝试重新生成条码，避免渲染时机问题
watch(() => cardBackgroundStyle.value, () => {
  nextTick(() => updateBarcode())
}, { flush: 'post' })
</script>

<template>
  <div class="id-card-preview">
    <div class="preview-label">学生证预览</div>

    <div class="id-cards">
      <!-- FRONT -->
      <div class="id-card front" :class="cardOrientationClass">
        <div class="card-background" :style="{ ...cardBackgroundStyle, opacity: cardBackgroundOpacity }"></div>
        <div class="student-id-badge">STUDENT ID</div>
        <div v-if="store.idCardStyle.enableWatermark" class="watermark" :style="watermarkStyle">
          {{ store.idCardStyle.watermarkText || 'AUTHENTIC' }}
        </div>
        <div class="card-inner" :style="textColorStyle">
          <div class="front-left">
            <div class="uni-header">
              <img v-if="store.universityInfo.logo" :src="store.universityInfo.logo" alt="University Logo" class="uni-logo" />
              <div class="uni-title">{{ store.universityInfo.name || 'International University' }}</div>
            </div>
            <div class="student-name-big">{{ store.studentInfo.name || 'Emily Johnson' }}</div>
            <div class="student-meta">{{ store.studentInfo.school || store.studentInfo.major || 'School of Computer Science' }}</div>
            <div class="student-meta">{{ store.studentInfo.degree || 'Bachelor' }}</div>

            <div class="signature-section">
              <div class="signature-font">{{ store.universityInfo.signature || 'S. Davis' }}</div>
              <div class="signature-line"></div>
              <div class="issuer-title">Registrar's Office</div>
            </div>

            <div class="barcode-section">
              <div class="student-id-red">{{ store.studentInfo.studentId || '2023001001' }}</div>
              <canvas v-if="store.idCardStyle.barcodeType !== 'None'" ref="barcodeCanvasRef" class="barcode-canvas"></canvas>
            </div>
          </div>

          <div class="front-right">
            <div class="photo-block">
              <img v-if="store.studentPhoto.url" :src="store.studentPhoto.url" alt="Student Photo" />
            </div>
            <div class="meta-info">
              <div class="meta-line">Enrolled: <strong>{{ store.studentInfo.enrollmentYear || new Date(store.studentInfo.enrollmentDate || Date.now()).getFullYear() }}</strong></div>
              <div class="meta-line">Expiry: <strong>{{ store.studentInfo.expiryDate || store.studentInfo.expectedGraduation || '2029-12-30' }}</strong></div>
              <div class="meta-line">Card No. <strong>{{ store.studentInfo.cardNo || store.studentInfo.cardNumber || '' }}</strong></div>
            </div>
          </div>
        </div>
      </div>
      

      <!-- BACK -->
      <div v-if="store.idCardStyle.enableBackside" class="id-card back" :class="cardOrientationClass">
        <div class="card-background" :style="{ ...cardBackgroundStyle, opacity: cardBackgroundOpacity }"></div>
        <div class="back-inner" :style="textColorStyle">
          <div class="back-header-row">
            <div class="back-header">{{ store.universityInfo.name || 'International University' }}</div>
            <div class="back-logo-inline">
              <img v-if="store.universityInfo.logo" :src="store.universityInfo.logo" alt="University Logo" />
            </div>
          </div>
          <div class="back-body">
            <div class="terms">
              <h4>{{ store.universityInfo.backsideTitle || 'TERMS OF USE' }}</h4>
              <p>{{ store.universityInfo.termsOfUse || 'This card must be carried while on campus. Violation of university policies may result in card revocation.' }}</p>
              <h4>LOST CARD</h4>
              <p>{{ store.universityInfo.lostCardInfo || 'If found, please return to the University Lost & Found Office or call the number below.' }}</p>
            </div>
            <div class="access">
              <h4>ACCESS PRIVILEGES</h4>
              <p>{{ store.universityInfo.accessPrivileges || 'Library, Cafeteria, Dormitory, Computer Labs, Gym' }}</p>
              <h4>EMERGENCY CONTACT</h4>
              <p>{{ store.universityInfo.phone || '(617) 555-4321' }}</p>
              <h4>CONTACT INFO</h4>
              <p>{{ store.universityInfo.address || '123 University Avenue, Boston, MA 02115' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局排版变量 */
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --muted: #6b7280;
  --muted-2: #64748b;
  --heading: #0f172a;
  --brand-1: #1e40af;
  --card-bg: #ffffff;
}

.id-card-preview {
  --card-width: 480px;
  --card-height: 300px;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

/* 卡片方向 */
.id-card.portrait {
  --card-width: 300px;
  --card-height: 450px;
}

.id-card.landscape {
  --card-width: 480px;
  --card-height: 300px;
}

.preview-label {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 12px;
  font-weight: 600;
}

.id-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.id-card {
  background: linear-gradient(135deg, #dce3f5 0%, #d8e0f5 100%);
  border-radius: 12px;
  padding: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: var(--card-width);
  height: var(--card-height);
  box-sizing: border-box;
}

/* 背景层 */
.card-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* 斜向条纹背景 */
.id-card.front::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.08) 0px,
    rgba(255, 255, 255, 0.08) 15px,
    transparent 15px,
    transparent 30px,
    rgba(0, 0, 0, 0.02) 30px,
    rgba(0, 0, 0, 0.02) 45px,
    transparent 45px,
    transparent 60px
  );
  pointer-events: none;
  z-index: 0;
}

.id-card.back::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    135deg, 
    rgba(0, 0, 0, 0.02) 0 18px, 
    rgba(255, 255, 255, 0.01) 18px 36px
  );
  pointer-events: none;
  z-index: 0;
}

/* Student ID 标签 */
.student-id-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #2563eb;
  color: white;
  padding: 5px 14px;
  border-radius: 0 12px 0 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

/* 卡片内容 */
.card-inner {
  display: flex;
  gap: 16px;
  padding: 16px;
  position: relative;
  z-index: 1;
  height: 100%;
  box-sizing: border-box;
}

/* 竖向布局调整 */
.id-card.portrait .card-inner {
  flex-direction: column;
  gap: 12px;
}

.front-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.id-card.portrait .front-left {
  flex: initial;
}

.front-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  padding-top: 50px;
}

.id-card.portrait .front-right {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: 0;
  width: 100%;
}

/* 大学标题区域 - 包含logo和名称 */
.uni-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.uni-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
}

/* 大学名称 */
.uni-title {
  font-family: var(--font-sans);
  font-size: 17px;
  color: #1e40af;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* 学生姓名 */
.student-name-big {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 3px 0;
  line-height: 1.1;
}

/* 学生元信息 */
.student-meta {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
  line-height: 1.4;
}

/* 签名区域 */
.signature-section {
  margin-top: 8px;
  margin-bottom: 4px;
}

.signature-font {
  font-family: 'Allura', 'Great Vibes', 'Snell Roundhand', 'Brush Script MT', cursive;
  font-size: 24px;
  color: #0f172a;
  margin-bottom: 3px;
  font-weight: 700;
  line-height: 1;
}

.signature-line {
  width: 120px;
  height: 1px;
  background: #0f172a;
  margin: 4px 0;
}

.issuer-title {
  font-size: 11px;
  color: #64748b;
}

/* 条形码区域 */
.barcode-section {
  margin-top: auto;
  padding-top: 8px;
}

.id-card.portrait .barcode-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.student-id-red {
  color: #dc2626;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-size: 16px;
  margin-bottom: 3px;
}

.barcode-canvas {
  width: 240px !important;
  height: 45px !important;
  display: block !important;
}

/* 照片 */
.photo-block {
  width: 95px;
  height: 120px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.id-card.portrait .photo-block {
  width: 110px;
  height: 140px;
  flex-shrink: 0;
}

.photo-block img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右侧信息 */
.meta-info {
  text-align: right;
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
  margin-top: 16px;
}

.id-card.portrait .meta-info {
  text-align: left;
  margin-top: 8px;
  flex: 1;
}

.meta-line {
  margin-bottom: 3px;
}

.meta-info strong {
  color: #0f172a;
  font-weight: 600;
}

/* 水印样式 */
.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  font-weight: 900;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  letter-spacing: 0.2em;
  z-index: 5;
  font-family: var(--font-sans);
}

/* 背面 */
.id-card.back {
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.back-inner {
  padding: 16px;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.back-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.back-header {
  font-weight: 800;
  font-size: 16px;
  color: var(--heading);
  text-align: left;
  flex: 1;
}

.back-logo-inline {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-logo-inline img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.back-body {
  display: flex;
  gap: 16px;
  flex: 1;
}

.id-card.portrait .back-body {
  flex-direction: column;
  gap: 12px;
}

.back-body .terms,
.back-body .access {
  flex: 1;
  font-size: 10px;
  color: var(--muted);
  line-height: 1.5;
}

.id-card.portrait .back-body .terms,
.id-card.portrait .back-body .access {
  flex: initial;
}

.back-body h4 {
  font-size: 11px;
  font-weight: 700;
  color: var(--heading);
  margin: 10px 0 4px 0;
  letter-spacing: 0.03em;
}

.back-body h4:first-child {
  margin-top: 0;
}

.back-body p {
  margin: 0 0 8px 0;
}
</style>
