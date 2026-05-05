<template>
  <div class="school-transcript-preview" :class="[data.template, data.language]" :style="{
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
    <!-- 自定义水印（重新实现：简洁可靠的内联 SVG 条纹） -->
    <div v-if="designSettings.watermarkEnabled" class="watermark-layer" ref="containerRef" :style="{ zIndex: watermarkLayerZIndex }">
      <svg v-if="designSettings.watermarkType === 'diagonal'" xmlns="http://www.w3.org/2000/svg" :width="measuredWidth" :height="measuredHeight" preserveAspectRatio="none" :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: watermarkLayerZIndex }">
        <defs>
          <pattern :id="diagPatternId" patternUnits="userSpaceOnUse" :width="Number(designSettings.watermarkStripeSpacing || 40)" :height="Number(designSettings.watermarkStripeSpacing || 40)" :patternTransform="`translate(${(designSettings.watermarkStripeSpacing||40)/2} ${(designSettings.watermarkStripeSpacing||40)/2}) rotate(${designSettings.watermarkStripeRotation||-30}) translate(${-(designSettings.watermarkStripeSpacing||40)/2} ${-(designSettings.watermarkStripeSpacing||40)/2})`">
            <rect :x="((designSettings.watermarkStripeSpacing||40) - (designSettings.watermarkStripeWidth||20))/2" :y="-(designSettings.watermarkStripeSpacing||40)" :width="designSettings.watermarkStripeWidth||20" :height="(designSettings.watermarkStripeSpacing||40)*3" :fill="designSettings.watermarkStripeColor || '#000'" :fill-opacity="(designSettings.watermarkStripeOpacity||10)/100" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" :fill="`url(#${diagPatternId})`" />
      </svg>

      <template v-else-if="designSettings.watermarkType === 'fullscreen'">
        <span v-for="i in watermarkCount" :key="i" class="watermark-text" :style="{ color: designSettings.watermarkColor, opacity: designSettings.watermarkOpacity / 100 }">{{ designSettings.watermarkText }}</span>
      </template>

      <span v-else class="watermark-center" :style="{ color: designSettings.watermarkColor, opacity: designSettings.watermarkOpacity / 100 }">{{ designSettings.watermarkText }}</span>
    </div>
    <!-- 调试徽章：显示 runtime watermark 设置，便于定位为何未显示 -->
    <div class="watermark-debug-badge" aria-hidden="true">{{ debugBadgeText }}</div>
    <!-- 可选强制可见的开发覆盖层（通过 URL ?forceWatermark=1 启用） -->
    <div v-if="devForceShow" class="dev-force-watermark" aria-hidden="true"></div>
    
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
          <div class="doc-title">
            <span class="cn">学 生 成 绩 单</span>
            <span class="en">OFFICIAL TRANSCRIPT</span>
          </div>
        </div>
      </div>
      
      <div class="student-info-section">
        <h3 class="section-title">学生基本信息 / Student Information</h3>
        <div class="student-info-wrapper">
          <div class="student-photo" v-if="data.studentPhoto">
            <img :src="data.studentPhoto" alt="学生照片" @error="($event.target as HTMLImageElement).parentElement!.style.display = 'none'" />
          </div>
          <div class="info-grid" :class="{ 'with-photo': data.studentPhoto }">
            <div class="info-item">
              <span class="label">姓名 Name:</span>
              <span class="value" :style="{ fontFamily: data.studentNameFont }">{{ data.studentName }} ({{ data.studentNameEn }})</span>
            </div>
            <div class="info-item">
              <span class="label">学号 Student ID:</span>
              <span class="value">{{ data.studentId }}</span>
            </div>
            <div class="info-item">
              <span class="label">性别 Gender:</span>
              <span class="value">{{ data.gender === 'male' ? '男 Male' : '女 Female' }}</span>
            </div>
            <div class="info-item">
              <span class="label">出生日期 Birth Date:</span>
              <span class="value">{{ data.birthDate }}</span>
            </div>
            <div class="info-item">
              <span class="label">学院 Faculty:</span>
              <span class="value">{{ data.faculty }}</span>
            </div>
            <div class="info-item">
              <span class="label">专业 Major:</span>
              <span class="value">{{ data.major }}</span>
            </div>
            <div class="info-item">
              <span class="label">年级 Grade:</span>
              <span class="value">{{ data.grade }}</span>
            </div>
            <div class="info-item">
              <span class="label">学制 Duration:</span>
              <span class="value">{{ data.educationLevel === 'undergraduate' ? '四年制本科' : (data.educationLevel === 'master' ? '三年制硕士' : '四年制博士') }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grades-section">
        <h3 class="section-title">成绩记录 / Academic Record</h3>
        <table class="grades-table">
          <thead>
            <tr>
              <th>课程代码<br>Code</th>
              <th>课程名称<br>Course Name</th>
              <th>学分<br>Credits</th>
              <th>学时<br>Hours</th>
              <th>成绩<br>Score</th>
              <th>绩点<br>GPA</th>
              <th>学期<br>Semester</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in data.courses" :key="course.id">
              <td>{{ course.code }}</td>
              <td class="course-name">
                {{ course.name }}<br>
                <span class="en-name">{{ course.nameEn }}</span>
              </td>
              <td>{{ course.credits }}</td>
              <td>{{ course.hours }}</td>
              <td class="score">{{ course.score }}</td>
              <td>{{ course.gradePoint.toFixed(1) }}</td>
              <td>{{ course.semester }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="summary-section">
        <h3 class="section-title">成绩汇总 / Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">应修学分 Total Credits Required:</span>
            <span class="value">{{ data.totalCredits }}</span>
          </div>
          <div class="summary-item">
            <span class="label">已修学分 Credits Earned:</span>
            <span class="value">{{ store.calculatedEarnedCredits }}</span>
          </div>
          <div class="summary-item highlight">
            <span class="label">平均绩点 GPA:</span>
            <span class="value">{{ store.calculatedGPA.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">平均成绩 Average Score:</span>
            <span class="value">{{ store.calculatedAvgScore.toFixed(1) }}</span>
          </div>
          <div class="summary-item" v-if="data.showRanking">
            <span class="label">专业排名 Ranking:</span>
            <span class="value">{{ data.ranking }}</span>
          </div>
        </div>
      </div>
      
      <div class="footer-section">
        <div class="issue-info">
          <p>编号 No.: {{ data.serialNumber }}</p>
          <p>发证日期 Issue Date: {{ data.issueDate }}</p>
        </div>
        
        <!-- 印章区域 -->
        <div class="seal-area" v-if="designSettings.stampEnabled">
          <img v-if="designSettings.stampSource === 'upload' && designSettings.stampImage" 
               :src="designSettings.stampImage" 
               alt="印章" 
               class="uploaded-stamp"
               :style="{ transform: 'rotate(' + designSettings.stampRotation + 'deg)' }" />
          <div v-else class="seal" :style="{ color: designSettings.stampColor, borderColor: designSettings.stampColor }">
            <span>{{ data.schoolName }}</span>
            <span>{{ designSettings.stampType === 'official' ? '公章' : designSettings.stampType === 'academic' ? '教务处' : '注册中心' }}</span>
          </div>
        </div>
        
        <!-- 签章区域 -->
        <div class="signature" v-if="designSettings.signatureEnabled">
          <p>教务处长签章:</p>
          <img v-if="designSettings.signatureSource === 'upload' && designSettings.signatureImage" 
               :src="designSettings.signatureImage" 
               alt="签章" 
               class="uploaded-signature" />
          <template v-else>
            <div v-if="data.useRegistrarImage && data.registrarImage">
               <img :src="data.registrarImage" class="registrar-signature-img" style="max-height: 50px; object-fit: contain;" />
            </div>
            <p v-else class="signature-name" :style="{ fontFamily: data.registrarNameFont }">{{ data.registrarName }}</p>
            <p class="signature-title">{{ data.registrarTitle }}</p>
          </template>
        </div>
        
        <!-- 二维码区域 -->
        <div class="qr-area" v-if="designSettings.qrCodeEnabled">
          <img v-if="designSettings.qrCodeSource === 'upload' && designSettings.qrCodeImage" 
               :src="designSettings.qrCodeImage" 
               alt="扫码查验" 
               class="uploaded-qrcode" />
          <canvas v-else ref="qrCanvas" class="generated-qrcode"></canvas>
          <span class="qr-label">扫码验证</span>
        </div>
      </div>
      
      <div class="bottom-note">
        <p>本成绩单由{{ data.schoolName }}教务处出具，加盖公章有效。</p>
        <p>This transcript is issued by the Academic Affairs Office of {{ data.schoolNameEn }}.</p>
      </div>
    </div>
    
    <!-- 现代模板 -->
    <div v-else-if="data.template === 'modern'" class="template-modern">
      <div class="modern-header">
        <div class="school-brand">
          <div class="logo-circle" v-if="data.schoolLogo">
            <img :src="data.schoolLogo" alt="logo" />
          </div>
          <div class="brand-text">
            <h1>{{ data.schoolName }}</h1>
            <p>{{ data.schoolNameEn }}</p>
          </div>
        </div>
        <div class="doc-badge">
          <span class="badge-text">OFFICIAL</span>
          <span class="badge-title">TRANSCRIPT</span>
        </div>
      </div>
      
      <div class="student-card">
        <div class="card-header">
          <h2>{{ data.studentName }}</h2>
          <span class="student-id">{{ data.studentId }}</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="icon">🎓</span>
            <span>{{ data.major }} | {{ data.majorEn }}</span>
          </div>
          <div class="info-row">
            <span class="icon">🏛️</span>
            <span>{{ data.faculty }}</span>
          </div>
          <div class="info-row">
            <span class="icon">📅</span>
            <span>{{ data.enrollmentDate }} - {{ data.expectedGraduation }}</span>
          </div>
        </div>
      </div>
      
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ store.calculatedGPA.toFixed(2) }}</span>
          <span class="stat-label">GPA</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ store.calculatedAvgScore.toFixed(1) }}</span>
          <span class="stat-label">平均分</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ store.calculatedEarnedCredits }}</span>
          <span class="stat-label">已修学分</span>
        </div>
        <div class="stat-card" v-if="data.showRanking">
          <span class="stat-value">{{ data.ranking }}</span>
          <span class="stat-label">专业排名</span>
        </div>
      </div>
      
      <div class="modern-grades">
        <h3>📚 成绩记录</h3>
        <div class="grade-list">
          <div v-for="course in data.courses" :key="course.id" class="grade-item">
            <div class="course-info">
              <span class="course-code">{{ course.code }}</span>
              <span class="course-name">{{ course.name }}</span>
            </div>
            <div class="course-score" :class="getScoreClass(course.score)">
              {{ course.score }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="modern-footer">
        <div class="issue-stamp">
          <span>{{ data.serialNumber }}</span>
          <span>{{ data.issueDate }}</span>
        </div>
      </div>
    </div>
    
    <!-- 双语模板 -->
    <div v-else class="template-bilingual">
      <div class="bilingual-header">
        <div class="header-cn">
          <h1>{{ data.schoolName }}</h1>
          <h2>学生成绩单</h2>
        </div>
        <div class="header-divider"></div>
        <div class="header-en">
          <h1>{{ data.schoolNameEn }}</h1>
          <h2>Official Transcript</h2>
        </div>
      </div>
      
      <div class="bilingual-content">
        <div class="column-cn">
          <div class="info-block">
            <h4>学生信息</h4>
            <p><strong>姓名:</strong> {{ data.studentName }}</p>
            <p><strong>学号:</strong> {{ data.studentId }}</p>
            <p><strong>学院:</strong> {{ data.faculty }}</p>
            <p><strong>专业:</strong> {{ data.major }}</p>
            <p><strong>入学日期:</strong> {{ data.enrollmentDate }}</p>
          </div>
        </div>
        <div class="column-en">
          <div class="info-block">
            <h4>Student Information</h4>
            <p><strong>Name:</strong> {{ data.studentNameEn }}</p>
            <p><strong>Student ID:</strong> {{ data.studentId }}</p>
            <p><strong>Faculty:</strong> {{ data.facultyEn }}</p>
            <p><strong>Major:</strong> {{ data.majorEn }}</p>
            <p><strong>Enrollment:</strong> {{ data.enrollmentDate }}</p>
          </div>
        </div>
      </div>
      
      <table class="bilingual-table">
        <thead>
          <tr>
            <th>代码/Code</th>
            <th>课程名称/Course Name</th>
            <th>学分/Credits</th>
            <th>成绩/Score</th>
            <th>绩点/GPA</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in data.courses" :key="course.id">
            <td>{{ course.code }}</td>
            <td>{{ course.name }} / {{ course.nameEn }}</td>
            <td>{{ course.credits }}</td>
            <td>{{ course.score }}</td>
            <td>{{ course.gradePoint.toFixed(1) }}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="bilingual-summary">
        <div class="summary-cn">
          <p>累计绩点: <strong>{{ store.calculatedGPA.toFixed(2) }}</strong></p>
          <p>已修学分: <strong>{{ store.calculatedEarnedCredits }}</strong></p>
        </div>
        <div class="summary-en">
          <p>Cumulative GPA: <strong>{{ store.calculatedGPA.toFixed(2) }}</strong></p>
          <p>Credits Earned: <strong>{{ store.calculatedEarnedCredits }}</strong></p>
        </div>
      </div>
      
      <div class="bilingual-footer">
        <p>发证日期 / Issue Date: {{ data.issueDate }}</p>
        <p>编号 / No.: {{ data.serialNumber }}</p>
        <div class="seal-placeholder" v-if="data.showSeal">
          {{ data.schoolName }}教务处
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { useSchoolTranscriptStore } from '@/stores/schoolTranscript'
import { useWatermarkStore } from '@/stores/watermark'
import QRCode from 'qrcode'

const store = useSchoolTranscriptStore()
const data = store.data
const designSettings = store.designSettings
const qrCanvas = ref<HTMLCanvasElement>()
const containerRef = ref<HTMLElement | null>(null)
const watermark = useWatermarkStore()
const measuredWidth = ref<number>(794)
const measuredHeight = ref<number>(1123)
const watermarkLayerZIndex = computed(() => (designSettings.watermarkOverlayDiagonal || designSettings.watermarkOverlayFullscreen || designSettings.watermarkOverlayText) ? 3 : 1)
// 唯一 pattern id，避免多个实例冲突（用于斜线内联 SVG pattern）
const diagPatternId = ref('diag-' + Math.random().toString(36).slice(2, 8))
let resizeObserver: ResizeObserver | null = null
const devForceShow = ref(false)

function logWatermarkState(label = '') {
  nextTick(() => {
    try {
      const enabled = Boolean(designSettings.watermarkEnabled)
      const type = designSettings.watermarkType
      const w = measuredWidth.value
      const h = measuredHeight.value
      const container = containerRef.value
      const svg = container?.querySelector('svg') as SVGElement | null
      const svgExists = !!svg
      const svgDisplay = svg ? getComputedStyle(svg).display : 'none'
      // eslint-disable-next-line no-console
      console.info('[WatermarkDebug]', label, { enabled, type, w, h, svgExists, svgDisplay, diagPatternId: diagPatternId.value })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[WatermarkDebug] probe failed', e)
    }
  })
}

const debugBadgeText = computed(() => {
  return `watermarkEnabled:${designSettings.watermarkEnabled ? 'true' : 'false'} · type:${designSettings.watermarkType} · width:${designSettings.watermarkStripeWidth} spacing:${designSettings.watermarkStripeSpacing}`
})

onMounted(() => {
  nextTick(() => {
    if (containerRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measuredWidth.value = containerRef.value?.clientWidth || measuredWidth.value
        measuredHeight.value = containerRef.value?.clientHeight || measuredHeight.value
      })
      resizeObserver.observe(containerRef.value)
      measuredWidth.value = containerRef.value.clientWidth || measuredWidth.value
      measuredHeight.value = containerRef.value.clientHeight || measuredHeight.value
    }
    // dev: 强制显示覆盖层，通过 URL 参数 ?forceWatermark=1
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('forceWatermark') === '1') devForceShow.value = true
    } catch (e) {
      devForceShow.value = false
    }
    logWatermarkState('mounted')
  })
})

watch(() => [designSettings.watermarkEnabled, designSettings.watermarkType, designSettings.watermarkStripeWidth, designSettings.watermarkStripeSpacing], () => {
  logWatermarkState('settings-changed')
}, { deep: false })

onBeforeUnmount(() => {
  if (resizeObserver && containerRef.value) resizeObserver.unobserve(containerRef.value)
  resizeObserver = null
})

const watermarkCount = computed(() => {
  if (!designSettings.watermarkEnabled || designSettings.watermarkType !== 'fullscreen') return 0
  const spacing = (designSettings as any).watermarkSpacing || (designSettings as any).watermarkSpacingX || 200
  const padding = 40
  const cols = Math.max(1, Math.ceil((measuredWidth.value - padding * 2) / spacing))
  const rows = Math.max(1, Math.ceil((measuredHeight.value - padding * 2) / spacing))
  return cols * rows
})

const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'medium'
  if (score >= 60) return 'pass'
  return 'fail'
}

// 生成二维码
const generateQRCode = async () => {
  if (!qrCanvas.value || designSettings.qrCodeSource === 'upload') return
  
  const content = designSettings.qrCodeContent || 
    `https://verify.edu.cn/transcript/${data.serialNumber}?student=${data.studentId}`
  
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

onMounted(() => {
  if (designSettings.qrCodeEnabled && designSettings.qrCodeSource === 'generate') {
    generateQRCode()
  }
})

watch(() => [designSettings.qrCodeEnabled, designSettings.qrCodeSource, designSettings.qrCodeContent, data.serialNumber], () => {
  if (designSettings.qrCodeEnabled && designSettings.qrCodeSource === 'generate') {
    generateQRCode()
  }
})
</script>

<style scoped>
.school-transcript-preview {
  background: #fff;
  color: #333;
  font-family: 'SimSun', 'Songti SC', serif;
  position: relative;
}

/* 英文内容使用英文字体 */
.school-transcript-preview .en,
.school-transcript-preview .school-name-en,
.school-transcript-preview [class*="-en"],
.school-transcript-preview .major-en {
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
  padding-top: 100px; /* 避开学校名称 */
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
  padding: 40px;
  min-height: 800px;
  position: relative;
  border: 2px solid #8B0000;
}

.template-official .watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 120px;
  color: rgba(139, 0, 0, 0.03);
  white-space: nowrap;
  pointer-events: none;
  z-index: 0;
}

.template-official .header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.template-official .school-logo {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.template-official .school-name {
  font-size: 28px;
  color: #8B0000;
  margin: 0;
  letter-spacing: 8px;
}

.template-official .school-name-en {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
  font-family: 'Times New Roman', serif;
}

.template-official .doc-title {
  margin-top: 20px;
  border-top: 2px solid #8B0000;
  border-bottom: 2px solid #8B0000;
  padding: 15px 0;
}

.template-official .doc-title .cn {
  display: block;
  font-size: 24px;
  letter-spacing: 16px;
  color: #8B0000;
  font-weight: bold;
}

.template-official .doc-title .en {
  display: block;
  font-size: 14px;
  color: #666;
  margin-top: 5px;
  font-family: 'Times New Roman', serif;
  letter-spacing: 4px;
}

.template-official .section-title {
  font-size: 14px;
  color: #8B0000;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
  margin: 20px 0 15px;
}

.template-official .student-info-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.template-official .student-photo {
  width: 90px;
  height: 120px;
  flex-shrink: 0;
  border: 2px solid #8B0000;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-official .student-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-official .student-photo .photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 10px;
}

.template-official .student-photo .photo-placeholder .placeholder-icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.template-official .info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
  flex: 1;
}

.template-official .info-grid.with-photo {
  grid-template-columns: 1fr;
}

.template-official .info-item {
  display: flex;
  font-size: 12px;
}

.template-official .info-item .label {
  color: #666;
  min-width: 140px;
}

.template-official .info-item .value {
  font-weight: 500;
}

.template-official .grades-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-top: 10px;
}

.template-official .grades-table th,
.template-official .grades-table td {
  border: 1px solid #ddd;
  padding: 8px 6px;
  text-align: center;
}

.template-official .grades-table th {
  background: #f5f5f5;
  font-weight: 600;
  font-size: 10px;
  line-height: 1.4;
}

.template-official .grades-table .course-name {
  text-align: left;
  max-width: 200px;
}

.template-official .grades-table .en-name {
  font-size: 9px;
  color: #888;
  font-family: Arial, sans-serif;
}

.template-official .grades-table .score {
  font-weight: bold;
  color: #8B0000;
}

.template-official .summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.template-official .summary-item {
  text-align: center;
}

.template-official .summary-item .label {
  display: block;
  font-size: 10px;
  color: #666;
}

.template-official .summary-item .value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-top: 4px;
}

.template-official .summary-item.highlight .value {
  color: #8B0000;
  font-size: 22px;
}

.template-official .footer-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px dashed #ddd;
}

.template-official .issue-info {
  font-size: 11px;
  color: #666;
}

.template-official .seal-area .seal {
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

.template-official .seal-area .uploaded-stamp {
  max-width: 120px;
  max-height: 120px;
  object-fit: contain;
}

.template-official .signature {
  text-align: right;
  font-size: 12px;
}

.template-official .signature-name {
  font-size: 16px;
  font-family: 'KaiTi', cursive;
  margin: 8px 0 4px;
}

.template-official .signature .uploaded-signature {
  max-width: 150px;
  max-height: 60px;
  object-fit: contain;
  margin-top: 5px;
}

.template-official .qr-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.template-official .qr-area .uploaded-qrcode,
.template-official .qr-area .generated-qrcode {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.template-official .qr-area .qr-label {
  font-size: 10px;
  color: #666;
}

.template-official .qr-area .qr-placeholder {
  width: 60px;
  height: 60px;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #999;
}

.template-official .bottom-note {
  margin-top: 30px;
  font-size: 10px;
  color: #888;
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

/* 现代模板 */
.template-modern {
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 700px;
}

.template-modern .modern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.template-modern .school-brand {
  display: flex;
  align-items: center;
  gap: 15px;
}

.template-modern .logo-circle {
  width: 50px;
  height: 50px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.template-modern .logo-circle img {
  width: 35px;
  height: 35px;
}

.template-modern .brand-text h1 {
  margin: 0;
  font-size: 20px;
  color: #fff;
}

.template-modern .brand-text p {
  margin: 2px 0 0;
  font-size: 11px;
  color: rgba(255,255,255,0.8);
}

.template-modern .doc-badge {
  background: rgba(255,255,255,0.2);
  padding: 12px 20px;
  border-radius: 12px;
  text-align: center;
}

.template-modern .doc-badge .badge-text {
  display: block;
  font-size: 10px;
  color: rgba(255,255,255,0.9);
  letter-spacing: 2px;
}

.template-modern .doc-badge .badge-title {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin-top: 2px;
}

.template-modern .student-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.template-modern .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.template-modern .card-header h2 {
  margin: 0;
  font-size: 22px;
  color: #333;
}

.template-modern .student-id {
  background: #f0f0f0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: #666;
}

.template-modern .info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 13px;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
}

.template-modern .info-row:last-child {
  border: none;
}

.template-modern .stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.template-modern .stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
}

.template-modern .stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.template-modern .stat-label {
  font-size: 11px;
  color: #888;
  margin-top: 4px;
}

.template-modern .modern-grades {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
}

.template-modern .modern-grades h3 {
  margin: 0 0 15px;
  font-size: 16px;
}

.template-modern .grade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.template-modern .course-code {
  font-size: 11px;
  color: #999;
  margin-right: 10px;
}

.template-modern .course-name {
  font-size: 13px;
  color: #333;
}

.template-modern .course-score {
  font-size: 16px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
}

.template-modern .course-score.excellent {
  background: #e8f5e9;
  color: #2e7d32;
}

.template-modern .course-score.good {
  background: #e3f2fd;
  color: #1565c0;
}

.template-modern .course-score.medium {
  background: #fff3e0;
  color: #ef6c00;
}

.template-modern .course-score.pass {
  background: #fce4ec;
  color: #c2185b;
}

.template-modern .modern-footer {
  text-align: center;
  margin-top: 20px;
  color: rgba(255,255,255,0.8);
  font-size: 11px;
}

/* 双语模板 */
.template-bilingual {
  padding: 35px;
  min-height: 750px;
}

.template-bilingual .bilingual-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
}

.template-bilingual .header-cn,
.template-bilingual .header-en {
  text-align: center;
}

.template-bilingual .header-cn h1 {
  font-size: 24px;
  color: #1a237e;
  margin: 0;
}

.template-bilingual .header-en h1 {
  font-size: 18px;
  color: #333;
  margin: 0;
  font-family: 'Times New Roman', serif;
}

.template-bilingual .header-cn h2,
.template-bilingual .header-en h2 {
  font-size: 16px;
  font-weight: normal;
  color: #666;
  margin: 8px 0 0;
}

.template-bilingual .header-divider {
  width: 2px;
  height: 60px;
  background: linear-gradient(to bottom, transparent, #1a237e, transparent);
}

.template-bilingual .bilingual-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.template-bilingual .info-block {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.template-bilingual .info-block h4 {
  margin: 0 0 12px;
  color: #1a237e;
  font-size: 14px;
}

.template-bilingual .info-block p {
  margin: 6px 0;
  font-size: 12px;
}

.template-bilingual .bilingual-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-bottom: 20px;
}

.template-bilingual .bilingual-table th,
.template-bilingual .bilingual-table td {
  border: 1px solid #ddd;
  padding: 10px 8px;
  text-align: center;
}

.template-bilingual .bilingual-table th {
  background: #1a237e;
  color: #fff;
  font-size: 10px;
}

.template-bilingual .bilingual-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  background: #e8eaf6;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.template-bilingual .bilingual-summary p {
  margin: 5px 0;
  font-size: 13px;
}

.template-bilingual .bilingual-footer {
  text-align: center;
  font-size: 11px;
  color: #666;
}

.template-bilingual .seal-placeholder {
  display: inline-block;
  margin-top: 15px;
  padding: 15px 25px;
  border: 2px solid #1a237e;
  border-radius: 50%;
  color: #1a237e;
  font-size: 10px;
  transform: rotate(-10deg);
}

.watermark-debug-badge {
  position: absolute;
  left: 8px;
  top: 8px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 6px;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.95;
}

.dev-force-watermark {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  background-image: repeating-linear-gradient(-30deg, rgba(255,0,0,0.12) 0 8px, transparent 8px 40px);
}
</style>
