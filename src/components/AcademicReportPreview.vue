<template>
  <div class="academic-report-preview">
    <div 
      ref="containerRef"
      :class="reportStyleClasses"
      :style="containerStyle"
    >
      <!-- 页面级水印：拆分为下层（背景）与上层（覆盖）两部分，只有被设置为覆盖的水印会渲染到上层 -->
      <div v-if="anyWatermarkEnabled">
        <!-- 下层：背景水印（在内容之下） -->
        <div class="watermark-layer watermark-layer-below" :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }">
          <DiagonalWatermark
            v-if="diagEnabled && !diagOverlayActive"
            :key="'diag-below-'+diagKey"
            :lineWidth="diagWidth"
            :lineSpacing="diagSpacing"
            :color="diagColor"
            :opacity="diagOpacity / 100"
            :rotation="diagRotation"
            :overlay="false"
          />

          <!-- 全屏背景（非覆盖时渲染在下层） -->
          <div v-if="effectiveFullEnabled && !fullOverlayActive" :key="`fs-below-${effectiveFullAngle}`" class="fullscreen-watermark" :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }">
            <div v-if="effectiveFullBackground && effectiveFullBackground.backgroundImage" class="fullscreen-bg" :style="effectiveFullBackground"></div>
            <div v-for="(p, idx) in fullGridPositions" :key="`fs-grid-below-${idx}`" :style="{
                position: 'absolute',
                left: p.x + 'px',
                top: p.y + 'px',
                transform: `translate(-50%, -50%) rotate(${effectiveFullAngle}deg)`,
                color: effectiveFullColor,
                opacity: (effectiveFullOpacity / 100),
                fontSize: effectiveFullSize + 'px',
                fontFamily: effectiveFullFont,
                whiteSpace: 'nowrap',
                userSelect: 'none',
                pointerEvents: 'none'
            }">{{ effectiveFullText }}</div>
          </div>

          <!-- 文本水印（非覆盖时渲染在下层） -->
          <template v-if="textEnabledLocal && !textOverlayActive">
            <div :style="{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${textRotationLocal}deg)`,
              opacity: textOpacityLocal / 100,
              color: textColorLocal,
              fontSize: `${textSizeLocal}px`,
              fontWeight: 'bold',
              fontFamily: textFontLocal,
              whiteSpace: 'nowrap',
              userSelect: 'none',
              pointerEvents: 'none',
              zIndex: 1
            }">{{ textTextLocal }}</div>
          </template>
        </div>

        <!-- 上层：覆盖水印（在内容之上，仅渲染被标记为 overlay 的水印） -->
        <div class="watermark-layer watermark-layer-above" :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, overflow: 'hidden' }">
          <DiagonalWatermark
            v-if="diagEnabled && diagOverlayActive"
            :key="'diag-above-'+diagKey"
            :lineWidth="diagWidth"
            :lineSpacing="diagSpacing"
            :color="diagColor"
            :opacity="diagOpacity / 100"
            :rotation="diagRotation"
            :overlay="true"
          />

          <!-- 全屏（覆盖） -->
          <div v-if="effectiveFullEnabled && fullOverlayActive" :key="`fs-above-${effectiveFullAngle}`" class="fullscreen-watermark" :style="{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }">
            <div v-if="effectiveFullBackground && effectiveFullBackground.backgroundImage" class="fullscreen-bg" :style="effectiveFullBackground"></div>
            <div v-for="(p, idx) in fullGridPositions" :key="`fs-grid-above-${idx}`" :style="{
                position: 'absolute',
                left: p.x + 'px',
                top: p.y + 'px',
                transform: `translate(-50%, -50%) rotate(${effectiveFullAngle}deg)`,
                color: effectiveFullColor,
                opacity: (effectiveFullOpacity / 100),
                fontSize: effectiveFullSize + 'px',
                fontFamily: effectiveFullFont,
                whiteSpace: 'nowrap',
                userSelect: 'none',
                pointerEvents: 'none'
            }">{{ effectiveFullText }}</div>
          </div>

          <!-- 文本水印（覆盖） -->
          <template v-if="textEnabledLocal && textOverlayActive">
            <div :style="{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${textRotationLocal}deg)`,
              opacity: textOpacityLocal / 100,
              color: textColorLocal,
              fontSize: `${textSizeLocal}px`,
              fontWeight: 'bold',
              fontFamily: textFontLocal,
              whiteSpace: 'nowrap',
              userSelect: 'none',
              pointerEvents: 'none',
              zIndex: 3
            }">{{ textTextLocal }}</div>
          </template>
        </div>
      </div>
      <!-- 内容层 -->

      <!-- 备注：overlay 实现已移除，水印现在始终渲染在预览容器内 -->
      <div :style="{ position: 'relative', zIndex: contentZIndex }">
      <!-- 页眉 -->
        <div 
          class="report-header" 
          :style="{ 
            background: reportInfo.headerColor,
            borderBottom: `4px solid ${reportInfo.headerColor}`
          }"
        >
          <div class="header-content">
            <div class="seal-section-top" v-if="reportInfo.sealImage">
              <img 
                :src="reportInfo.sealImage" 
                alt="Official Seal" 
                class="official-seal-top"
              />
            </div>
            <div class="title-section-centered">
              <div class="logo-wrapper" v-if="reportInfo.universityLogo || reportInfo.logoImage">
                <img 
                  :src="reportInfo.universityLogo || reportInfo.logoImage" 
                  alt="University Logo" 
                  class="university-logo-centered"
                />
              </div>
              <h1 class="report-title-centered">{{ reportInfo.universityName || 'ACADEMIC PROGRESS REPORT' }}</h1>
              <p class="report-subtitle-centered">{{ reportInfo.universityAddress || reportInfo.department }}</p>
              <p v-if="reportInfo.universityPhone" class="university-contact-centered">{{ reportInfo.universityPhone }} | {{ reportInfo.universityWebsite }}</p>
            </div>
          </div>
        </div>
      <!-- 水印层（已移至页面内容容器内以限制范围） -->
          <!-- Student information section (layout matches provided screenshot) -->
          <div class="student-info-section" v-if="reportInfo">
            <div class="student-photo-wrapper" v-if="reportInfo.studentPhoto">
              <img :src="reportInfo.studentPhoto" alt="Student Photo" class="student-photo" />
            </div>
            <div class="student-info-content">
              <div class="info-row">
                <div class="info-item">
                  <div class="label">Student Name:</div>
                  <div class="value">{{ reportInfo.studentName || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="label">Student ID:</div>
                  <div class="value">{{ reportInfo.studentId || '-' }}</div>
                </div>
              </div>

              <div class="info-row">
                <div class="info-item">
                  <div class="label">Program:</div>
                  <div class="value">{{ reportInfo.program || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="label">Academic Year:</div>
                  <div class="value">{{ reportInfo.academicYear || '-' }}</div>
                </div>
              </div>

              <div class="info-row">
                <div class="info-item">
                  <div class="label">Report Date:</div>
                  <div class="value">{{ reportInfo.reportDate ? formatDate(reportInfo.reportDate) : '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="label">Class Rank:</div>
                  <div class="value">{{ reportInfo.rank ? (reportInfo.rank + (reportInfo.totalStudents ? ' / ' + reportInfo.totalStudents : '')) : '-' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Academic Performance Summary -->
          <div class="section">
            <h2 class="section-title" :style="{ borderColor: reportInfo.accentColor }">ACADEMIC PERFORMANCE SUMMARY</h2>
            <div class="performance-grid">
              <div class="performance-card" :style="{ borderLeftColor: reportInfo.accentColor }">
                <div class="performance-label">CURRENT TERM GPA</div>
                <div class="performance-value">{{ reportInfo.currentGPA || reportInfo.gpa || '-' }}</div>
              </div>
              <div class="performance-card" :style="{ borderLeftColor: reportInfo.accentColor }">
                <div class="performance-label">CUMULATIVE GPA</div>
                <div class="performance-value">{{ reportInfo.cumulativeGPA || '-' }}</div>
              </div>
              <div class="performance-card" :style="{ borderLeftColor: reportInfo.accentColor }">
                <div class="performance-label">CREDITS COMPLETED</div>
                <div class="performance-value">{{ (reportInfo.completedCredits != null ? reportInfo.completedCredits : '-') }}{{ reportInfo.totalCredits ? ' / ' + reportInfo.totalCredits : '' }}</div>
              </div>
              <div class="performance-card" :style="{ borderLeftColor: reportInfo.accentColor }">
                <div class="performance-label">ACADEMIC STANDING</div>
                <div class="performance-value">{{ reportInfo.academicStanding || '-' }}</div>
              </div>
            </div>

            <div class="performance-details" style="margin-top:16px;">
              <div class="detail-item">
                <div class="detail-label">Performance Level</div>
                <div class="detail-value">{{ reportInfo.performanceLevel || '-' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Attendance Rate</div>
                <div class="detail-value">{{ reportInfo.attendanceRate || '-' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Class Rank</div>
                <div class="detail-value">{{ reportInfo.rank ? (reportInfo.rank + (reportInfo.totalStudents ? ' / ' + reportInfo.totalStudents : '')) : '-' }}</div>
              </div>
            </div>
          </div>

          <!-- Outstanding Course Performance -->
        <div class="section">
          <h2 class="section-title" :style="{ borderColor: reportInfo.accentColor }">
            Outstanding Course Performance
          </h2>
          <div class="courses-table">
            <table>
              <thead :style="{ background: reportInfo.headerColor }">
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Semester</th>
                  <th>Credits</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(course, index) in reportInfo.excellentCourses" :key="index">
                  <td>{{ course.courseCode || '-' }}</td>
                  <td>{{ course.courseName }}</td>
                  <td>{{ course.semester }}</td>
                  <td>{{ course.credits }}</td>
                  <td><strong :style="{ color: reportInfo.primaryColor }">{{ course.grade }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 学术荣誉与成就 -->
        <div class="section">
          <h2 class="section-title" :style="{ borderColor: reportInfo.accentColor }">
            Academic Honors & Achievements
          </h2>
          <div class="achievements-list">
            <div 
              v-for="(achievement, index) in reportInfo.achievements" 
              :key="index" 
              class="achievement-item"
              :style="{ borderLeftColor: reportInfo.accentColor }"
            >
              <div class="achievement-header">
                <h3 class="achievement-title">{{ achievement.title }}</h3>
                <span class="achievement-date">{{ achievement.date }}</span>
              </div>
              <p class="achievement-desc">{{ achievement.description }}</p>
            </div>
          </div>
        </div>

        <!-- 改进领域与建议 -->
        <div class="section" v-if="reportInfo.improvementAreas.length > 0">
          <h2 class="section-title" :style="{ borderColor: reportInfo.accentColor }">
            Areas for Development
          </h2>
          <div class="improvement-list">
            <div 
              v-for="(item, index) in reportInfo.improvementAreas" 
              :key="index" 
              class="improvement-item"
            >
              <div class="improvement-area">
                <strong>{{ item.area }}</strong>
              </div>
              <div class="improvement-recommendation" :style="{ color: reportInfo.textColor }">{{ item.recommendation }}</div>
            </div>
          </div>
        </div>

        <!-- 学期目标 -->
        <div class="section">
          <h2 class="section-title" :style="{ borderColor: reportInfo.accentColor }">
            Academic Goals & Progress
          </h2>
          <div class="goals-list">
            <div 
              v-for="(goal, index) in reportInfo.goals" 
              :key="index" 
              class="goal-item"
            >
              <span class="goal-text">{{ goal.goal }}</span>
              <span 
                class="goal-status" 
                :style="{ 
                  background: getStatusColor(goal.status),
                  color: 'white'
                }"
              >
                {{ goal.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- 导师评语 -->
        <div class="section">
          <h2 class="section-title" :style="{ borderColor: reportInfo.accentColor }">
            Academic Advisor's Comments
          </h2>
          <div class="comments-box">
            <p class="comment-text">{{ reportInfo.advisorComments }}</p>
            <div class="signature-section">
              <div class="signature-line">
                <img 
                  v-if="reportInfo.advisorSignature" 
                  :src="reportInfo.advisorSignature" 
                  alt="Advisor Signature" 
                  class="signature-img"
                />
                <div class="signature-info">
                  <div class="signature-name">{{ reportInfo.advisorName }}</div>
                  <div class="signature-title">{{ reportInfo.advisorTitle }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 院长评语 -->
        <div class="section">
          <h2 class="section-title" :style="{ borderColor: reportInfo.accentColor }">
            Dean's Comments
          </h2>
          <div class="comments-box">
            <p class="comment-text">{{ reportInfo.deanComments }}</p>
            <div class="signature-section">
              <div class="signature-line">
                <img 
                  v-if="reportInfo.deanSignature" 
                  :src="reportInfo.deanSignature" 
                  alt="Dean Signature" 
                  class="signature-img"
                />
                <div class="signature-info">
                  <div class="signature-name">{{ reportInfo.deanName }}</div>
                  <div class="signature-title">{{ reportInfo.deanTitle }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 推荐建议 -->
        <div class="section">
          <h2 class="section-title" :style="{ borderColor: reportInfo.accentColor }">
            Recommendations for Continued Success
          </h2>
          <div class="recommendations-box">
            <p class="recommendation-text">{{ reportInfo.recommendations }}</p>
          </div>
        </div>

        <!-- 页脚 -->
        <div class="report-footer" :style="{ borderTopColor: reportInfo.accentColor }">
          <div class="footer-content">
            <div class="footer-left">
              <p class="footer-text">
                This document is an official academic record issued by {{ reportInfo.department }}.
                <br />
                For verification purposes, please contact the Registrar's Office.
              </p>
              <p class="footer-confidential">
                CONFIDENTIAL DOCUMENT - FOR STUDENT USE ONLY
              </p>
            </div>
          </div>
          
          <!-- 条形码和二维码区域 - 独立行 -->
          <div v-if="reportInfo.showBarcode || reportInfo.showQR" class="footer-codes-section">
            <!-- 条形码 -->
            <div v-if="reportInfo.showBarcode" class="barcode-section">
              <img v-if="reportInfo.barcodeSource === 'upload' && reportInfo.barcodeImage" 
                   :src="reportInfo.barcodeImage" 
                   class="custom-barcode-img" 
                   alt="Barcode" />
              <template v-else>
                <svg ref="barcodeRef" class="barcode-svg"></svg>
                <span class="barcode-text">{{ reportInfo.barcodeContent || reportInfo.studentId }}</span>
              </template>
            </div>
            <!-- 二维码 -->
            <div v-if="reportInfo.showQR" class="qr-section">
              <img v-if="reportInfo.qrSource === 'upload' && reportInfo.qrImage" 
                   :src="reportInfo.qrImage" 
                   class="custom-qr-img" 
                   alt="QR Code" />
              <template v-else>
                <canvas ref="qrCanvas" width="80" height="80" class="qr-canvas"></canvas>
              </template>
              <span class="qr-text">Scan to Verify</span>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useAcademicStore } from '@/stores/academic'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import { useWatermarkStore } from '@/stores/watermark'
import DiagonalWatermark from '@/components/DiagonalWatermark.vue'

const academicStore = useAcademicStore()
const reportInfo = computed(() => academicStore.reportInfo)
const watermark = useWatermarkStore()

function hexToRgba(hex: string, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`
  const h = hex.replace('#','')
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r},${g},${b},${alpha})`
}

const fullScreenBackground = computed(() => {
  // 只有在页面级或全局任一开启时才生成平铺背景
  const enabled = Boolean((watermark?.settings?.fullScreenWatermarkEnabled) || (reportInfo.value?.fullScreenWatermark))
  if (!enabled) return {}

  const size = (watermark?.settings?.fullScreenWatermarkSize) || reportInfo.value?.fullScreenWatermarkSize || (watermark?.settings?.watermarkSize) || reportInfo.value?.watermarkSize || 24
  const gap = (watermark?.settings?.fullScreenWatermarkSpacing) || reportInfo.value?.fullScreenWatermarkSpacing || reportInfo.value?.watermarkSpacingX || 200
  const cell = Math.max(40, size * 2)
  const bgSize = Math.max(40, cell + gap)
  const angle = (watermark?.settings?.fullScreenWatermarkAngle) ?? reportInfo.value?.fullScreenWatermarkAngle ?? 0
  const colorHex = (watermark?.settings?.fullScreenWatermarkColor) || reportInfo.value?.fullScreenWatermarkColor || (watermark?.settings?.watermarkColor) || reportInfo.value?.watermarkColor || '#000000'
  const opacityVal = ((watermark?.settings?.fullScreenWatermarkOpacity) ?? reportInfo.value?.fullScreenWatermarkOpacity ?? (watermark?.settings?.watermarkOpacity) ?? reportInfo.value?.watermarkOpacity ?? 10) / 100
  const text = (
    (watermark?.settings?.fullScreenWatermarkText) || reportInfo.value?.fullScreenWatermarkText || (watermark?.settings?.fullText) || (watermark?.settings?.textWatermarkText) || reportInfo.value?.textWatermarkText || reportInfo.value?.watermarkText || ''
  )
  const font = (watermark?.settings?.fullScreenWatermarkFontFamily) || reportInfo.value?.fullScreenWatermarkFontFamily || (watermark?.settings?.fullScreenWatermarkFont) || (watermark?.settings?.watermarkFont) || reportInfo.value?.watermarkFont || reportInfo.value?.watermarkFontFamily || 'Arial'

  // Use explicit fill (hex) + fill-opacity for better cross-browser support; quote font-family
  const safeFont = font.replace(/"/g, "'")
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${bgSize}' height='${bgSize}' viewBox='0 0 ${bgSize} ${bgSize}'>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='${size}' fill='${colorHex}' fill-opacity='${opacityVal}' transform='rotate(${angle}, ${bgSize/2}, ${bgSize/2})' style="font-family: ${safeFont};">${text}</text>` +
    `</svg>`

  const encoded = encodeURIComponent(svg)
  return {
    backgroundImage: `url("data:image/svg+xml;utf8,${encoded}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: `${bgSize}px ${bgSize}px`,
    backgroundPosition: 'center'
  }
})

// 对于斜线水印，只使用 reportInfo 的页面级设置（不回退到全局 watermark.store）
const diagEnabled = computed(() => Boolean(reportInfo.value?.diagonalWatermarkEnabled))
const diagWidth = computed(() => (reportInfo.value?.diagonalLineWidth) ?? 20)
const diagSpacing = computed(() => (reportInfo.value?.diagonalLineSpacing) ?? 40)
const diagColor = computed(() => (reportInfo.value?.diagonalLineColor) ?? '#000000')
const diagOpacity = computed(() => (reportInfo.value?.diagonalLineOpacity) ?? 5)
const diagRotation = computed(() => (reportInfo.value?.diagonalLineRotation) ?? -30)
// 斜线覆盖文本开关：当为 true 时把斜线水印显示在内容之上（覆盖文本）
const diagOverlayActive = computed(() => Boolean((reportInfo.value?.diagonalOverlay) ?? false))

// 调试输出已移除

// full-screen debug
const fullEnabledGlobal = computed(() => (watermark?.settings?.fullScreenWatermarkEnabled) ?? false)
const fullEnabledReport = computed(() => reportInfo.value?.fullScreenWatermark ?? false)
// 聚合读取：优先使用页面级（reportInfo），回退到全局 watermark.settings
function pick(keys: string[], fallback: any) {
  for (const k of keys) {
    const pageVal = reportInfo.value && (reportInfo.value as any)[k]
    if (pageVal !== undefined) return pageVal
    const globalVal = watermark && watermark.settings && (watermark.settings as any)[k]
    if (globalVal !== undefined) return globalVal
  }
  return fallback
}

const effectiveFullEnabled = computed(() => {
  // 更宽松的启用检测：接受页面级 boolean 开关、页面级文本（非空则视为启用）、全局设置或 designSettings
  try {
    const pageBool = reportInfo.value?.fullScreenWatermarkEnabled
    const pageText = reportInfo.value?.fullScreenWatermark || reportInfo.value?.fullScreenWatermarkText
    if (pageBool !== undefined) return Boolean(pageBool)
    if (pageText !== undefined && pageText !== null && String(pageText).trim() !== '') return true

    const global = watermark?.settings
    if (global) {
      if (global.fullScreenWatermarkEnabled !== undefined) return Boolean(global.fullScreenWatermarkEnabled)
      if (global.fullScreenWatermark !== undefined && String(global.fullScreenWatermark).trim() !== '') return true
    }

    // 兼容 designSettings 命名空间
    // @ts-ignore
    const ds = (reportInfo.value && (reportInfo.value as any).designSettings) || (window as any).designSettings
    if (ds) {
      if (ds.fullScreenWatermarkEnabled !== undefined) return Boolean(ds.fullScreenWatermarkEnabled)
      if (ds.fullScreenWatermark !== undefined && String(ds.fullScreenWatermark).trim() !== '') return true
    }
  } catch (e) {}
  return false
})
const effectiveFullText = computed(() => String(pick(['fullScreenWatermarkText','fullScreenWatermarkText','watermarkText'], '')))
const effectiveFullSize = computed(() => Number(pick(['fullScreenWatermarkSize','fullScreenWatermarkSize','watermarkSize'], 24)))
const effectiveFullOpacity = computed(() => Number(pick(['fullScreenWatermarkOpacity','fullScreenWatermarkOpacity','watermarkOpacity'], 10)))
const effectiveFullColor = computed(() => String(pick(['fullScreenWatermarkColor','fullScreenWatermarkColor','watermarkColor'], '#000000')))
const effectiveFullGap = computed(() => Number(pick(['fullScreenWatermarkSpacing','fullScreenWatermarkSpacing','watermarkSpacingX','watermarkSpacingY'], 200)))
const effectiveFullFont = computed(() => String(pick(['fullScreenWatermarkFontFamily','fullScreenWatermarkFont','watermarkFont','textWatermarkFontFamily'], 'Arial')))
// Accept multiple possible key names for angle (legacy + rotation variants)
const effectiveFullAngle = computed(() => Number(pick([
  'fullScreenWatermarkAngle',
  'fullScreenWatermarkRotation',
  'fullScreenWatermarkRotate'
], -30)))

// 生成用于背景的 SVG data-URL（使用 effectiveFull* 值，保证响应设置面板）
const effectiveFullBackground = computed(() => {
  if (!effectiveFullEnabled.value) return {}

  const size = Math.max(8, effectiveFullSize.value)
  const gap = Math.max(20, effectiveFullGap.value || 200)
  const cell = Math.max(40, size * 2)
  const bgSize = Math.max(40, cell + gap)
  const angle = effectiveFullAngle.value || 0
  const color = effectiveFullColor.value || '#000000'
  const opacity = (Number(effectiveFullOpacity.value) || 10) / 100
  const text = (effectiveFullText.value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const font = (effectiveFullFont.value || 'Arial').replace(/"/g, "'")

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${bgSize}' height='${bgSize}' viewBox='0 0 ${bgSize} ${bgSize}'>` +
    `<rect width='100%' height='100%' fill='transparent' />` +
    `<g transform='translate(${bgSize / 2}, ${bgSize / 2}) rotate(${angle})'>` +
    `<text x='0' y='0' text-anchor='middle' dominant-baseline='middle' font-size='${size}' fill='${color}' fill-opacity='${opacity}' style="font-family: ${font};">${text}</text>` +
    `</g>` +
    `</svg>`

  const encoded = encodeURIComponent(svg)
    return {
      backgroundImage: `url("data:image/svg+xml;utf8,${encoded}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: `${bgSize}px ${bgSize}px`,
      backgroundPosition: 'center',
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: (watermarkLayerZIndex && (watermarkLayerZIndex as any).value) ? (watermarkLayerZIndex as any).value : 1
    }
})

// DOM 网格位置（总是基于容器大小与 spacing 计算），避免对旧字段不敏感的问题
const fullGridPositions = computed(() => {
  if (!effectiveFullEnabled.value) return []
  const positions: { x: number; y: number }[] = []
  const containerWidth = measuredWidth.value || 794
  const containerHeight = measuredHeight.value || 1123
  const spacing = Math.max(20, effectiveFullGap.value || 200)
  const cols = Math.ceil(containerWidth / spacing) + 2
  const rows = Math.ceil(containerHeight / spacing) + 2

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({ x: c * spacing - Math.floor(spacing / 2), y: r * spacing - Math.floor(spacing / 2) })
    }
  }

  return positions
})

// 文字水印（优先使用 reportInfo 的页面级字段，回退到全局，使用安全访问）
const textEnabledLocal = computed(() => (reportInfo.value?.textWatermarkEnabled) ?? (watermark?.settings?.textWatermarkEnabled) ?? false)
const textSizeLocal = computed(() => (reportInfo.value?.textWatermarkSize) ?? (watermark?.settings?.textWatermarkSize) ?? 14)
const textColorLocal = computed(() => (reportInfo.value?.textWatermarkColor) ?? (watermark?.settings?.textWatermarkColor) ?? '#000000')
const textOpacityLocal = computed(() => (reportInfo.value?.textWatermarkOpacity) ?? (watermark?.settings?.textWatermarkOpacity) ?? 5)
const textRotationLocal = computed(() => (reportInfo.value?.textWatermarkRotation) ?? (watermark?.settings?.textWatermarkRotation) ?? -30)
const textFontLocal = computed(() => (reportInfo.value?.textWatermarkFontFamily) ?? (watermark?.settings?.textWatermarkFontFamily) ?? 'Arial')
const textTextLocal = computed(() => (reportInfo.value?.textWatermarkText) ?? (watermark?.settings?.textWatermarkText) ?? '')

// Force re-render key for diagonal watermark when related values change (helps inline-style updates)
const diagKey = ref(0)
watch([
  diagEnabled,
  diagWidth,
  diagSpacing,
  diagColor,
  diagOpacity,
  diagRotation
], () => {
  diagKey.value++
})

// 是否显示任何水印层（安全访问）
const anyWatermarkEnabled = computed(() => Boolean(
  reportInfo.value?.enableWatermark ||
  reportInfo.value?.textWatermarkEnabled ||
  reportInfo.value?.fullScreenWatermark ||
  reportInfo.value?.diagonalWatermarkEnabled ||
  watermark?.settings?.textWatermarkEnabled ||
  watermark?.settings?.fullScreenWatermarkEnabled
))

// 已移除 overlay 相关的全局/页面开关

// 全屏覆盖开关：仅在显式 overlay 标志为 true 时才认为是覆盖，避免因存在水印文本而自动变为覆盖
const fullOverlayActive = computed(() => {
  try {
    if (reportInfo.value) {
      if (reportInfo.value.fullScreenWatermarkOverlay !== undefined) return Boolean(reportInfo.value.fullScreenWatermarkOverlay)
      if (reportInfo.value.watermarkOverlay !== undefined) return Boolean(reportInfo.value.watermarkOverlay)
    }
    if (watermark && watermark.settings) {
      if (watermark.settings.fullScreenWatermarkOverlay !== undefined) return Boolean(watermark.settings.fullScreenWatermarkOverlay)
      if (watermark.settings.watermarkOverlay !== undefined) return Boolean(watermark.settings.watermarkOverlay)
    }
  } catch (e) {}
  return false
})

// 文字水印覆盖开关
const textOverlayActive = computed(() => {
  try {
    if (reportInfo.value && reportInfo.value.textWatermarkOverlay !== undefined) return Boolean(reportInfo.value.textWatermarkOverlay)
    if (watermark && watermark.settings && watermark.settings.textWatermarkOverlay !== undefined) return Boolean(watermark.settings.textWatermarkOverlay)
    // 兼容通用 watermarkOverlay 字段
    if (reportInfo.value && reportInfo.value.watermarkOverlay !== undefined) return Boolean(reportInfo.value.watermarkOverlay)
    if (watermark && watermark.settings && watermark.settings.watermarkOverlay !== undefined) return Boolean(watermark.settings.watermarkOverlay)
  } catch (e) {}
  return false
})

// 计算 z-index：任一 overlay 开启时把水印置于内容之上
const watermarkLayerZIndex = computed(() => (fullOverlayActive.value || diagOverlayActive.value || textOverlayActive.value) ? 3 : 1)
const contentZIndex = computed(() => (fullOverlayActive.value || diagOverlayActive.value || textOverlayActive.value) ? 1 : 2)

// 条形码和二维码引用
const barcodeRef = ref<SVGElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const measuredWidth = ref<number>(794)
const measuredHeight = ref<number>(1123)
let resizeObserver: ResizeObserver | null = null

// overlay 定位与相关函数已移除

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
  })
})

onBeforeUnmount(() => {
  if (resizeObserver && containerRef.value) resizeObserver.unobserve(containerRef.value)
  resizeObserver = null
})

// debug 开关，方便在运行时打开/关闭可视化（调试完成后可设为 false）


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
  })
})

onBeforeUnmount(() => {
  if (resizeObserver && containerRef.value) resizeObserver.unobserve(containerRef.value)
  resizeObserver = null
})

// 渲染条形码
const renderBarcode = () => {
  if (!reportInfo.value.showBarcode || reportInfo.value.barcodeSource === 'upload') return
  
  nextTick(() => {
    if (barcodeRef.value) {
      try {
        JsBarcode(barcodeRef.value, reportInfo.value.barcodeContent || reportInfo.value.studentId || '12345678', {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: false,
          margin: 0,
          background: "transparent",
          lineColor: "#000000"
        })
      } catch (e) {
        console.error('Barcode render error:', e)
      }
    }
  })
}

// 渲染二维码
const renderQRCode = () => {
  if (!reportInfo.value.showQR || reportInfo.value.qrSource === 'upload') return

  nextTick(() => {
    if (qrCanvas.value) {
      try {
        const content = reportInfo.value.qrContent || 
                       `Student: ${reportInfo.value.studentName}\nID: ${reportInfo.value.studentId}\nGPA: ${reportInfo.value.gpa}`
        
        QRCode.toCanvas(qrCanvas.value, content, {
          width: 80,
          margin: 0,
          color: {
            dark: '#000000',
            light: '#00000000'
          }
        }, (error) => {
          if (error) console.error('QR render error:', error)
        })
      } catch (e) {
        console.error('QR render error:', e)
      }
    }
  })
}

// 监听变化重新渲染
watch(() => [
  reportInfo.value.showBarcode,
  reportInfo.value.barcodeSource,
  reportInfo.value.barcodeContent,
  reportInfo.value.studentId
], () => {
  renderBarcode()
})

watch(() => [
  reportInfo.value.showQR,
  reportInfo.value.qrSource,
  reportInfo.value.qrContent,
  reportInfo.value.studentName,
  reportInfo.value.gpa
], () => {
  renderQRCode()
})

onMounted(() => {
  renderBarcode()
  renderQRCode()
})

// 清理：如果之前运行时残留了注入到 body 的预览覆盖元素，移除它（防止重复斜线水印）
onMounted(() => {
  try {
    if (typeof document !== 'undefined') {
      const old = document.getElementById('preview-overlay')
      if (old && old.parentElement) old.parentElement.removeChild(old)
    }
  } catch (e) {}
})

// 已移除单独角度变化日志

// Watch full-screen related values and log updates to help live debugging
// 已移除 full-screen 设置变化的开发日志

// 报告风格样式计算
const reportStyleClasses = computed(() => {
  const style = reportInfo.value.reportStyle
  const classes = ['report-container']
  
  if (style === 'Harvard Style') classes.push('style-harvard')
  else if (style === 'Oxford Style') classes.push('style-oxford')
  else if (style === 'MIT Style') classes.push('style-mit')
  else if (style === 'Stanford Style') classes.push('style-stanford')
  else if (style === 'Cambridge Style') classes.push('style-cambridge')
  
  return classes.join(' ')
})

// 边框样式计算
const containerStyle = computed(() => {
  const style: any = {
    fontFamily: reportInfo.value.fontFamily,
    position: 'relative',
    overflow: 'hidden'
  }
  
  // 边框设置
  if (reportInfo.value.borderEnabled) {
    const decorativeBorderStyle = reportInfo.value.decorativeBorderStyle
    const borderWidth = reportInfo.value.borderWidth
    const borderColor = reportInfo.value.borderColor
    
    if (decorativeBorderStyle === 'Classic') {
      style.border = `${borderWidth}px solid ${borderColor}`
      style.boxShadow = 'inset 0 0 0 4px white, 0 0 20px rgba(0, 0, 0, 0.1)'
    } else if (decorativeBorderStyle === 'Modern') {
      style.border = `${borderWidth}px solid ${borderColor}`
      style.borderRadius = '8px'
      style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.12)'
    } else if (decorativeBorderStyle === 'Elegant') {
      style.border = `${borderWidth}px double ${borderColor}`
      style.boxShadow = 'inset 0 0 0 8px white, inset 0 0 0 ${borderWidth + 8}px ${borderColor}, 0 0 20px rgba(0, 0, 0, 0.1)'
    } else if (decorativeBorderStyle === 'Minimal') {
      style.borderTop = `${borderWidth * 2}px solid ${borderColor}`
      style.borderBottom = `${borderWidth * 2}px solid ${borderColor}`
      style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)'
    } else {
      const cssStyle = reportInfo.value.borderStyle || 'solid'
      style.border = `${borderWidth}px ${cssStyle} ${borderColor}`
    }
  } else {
    style.border = 'none'
  }
  
  return style
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// 全屏水印计算
// 全屏水印是否启用（页面级或全局任一）
const fullScreenEnabledAny = computed(() => Boolean((watermark?.settings?.fullScreenWatermarkEnabled) || reportInfo.value?.fullScreenWatermark))

const watermarkCount = computed(() => {
  if (!fullScreenEnabledAny.value) return 0
  const containerWidth = measuredWidth.value || 794
  const containerHeight = measuredHeight.value || 1123
  const spacingX = (reportInfo.value?.watermarkSpacingX) || (watermark?.settings?.fullScreenWatermarkSpacing) || reportInfo.value?.fullScreenWatermarkSpacing || 200
  const spacingY = (reportInfo.value?.watermarkSpacingY) || (watermark?.settings?.fullScreenWatermarkSpacing) || reportInfo.value?.fullScreenWatermarkSpacing || 200
  const cols = Math.ceil(containerWidth / spacingX) + 2
  const rows = Math.ceil(containerHeight / spacingY) + 2
  return cols * rows
})

const watermarkPositions = computed(() => {
  if (!fullScreenEnabledAny.value) return []
  const positions: { x: number; y: number }[] = []
  const containerWidth = measuredWidth.value || 794
  const containerHeight = measuredHeight.value || 1123
  const spacingX = (reportInfo.value?.watermarkSpacingX) || (watermark?.settings?.fullScreenWatermarkSpacing) || reportInfo.value?.fullScreenWatermarkSpacing || 200
  const spacingY = (reportInfo.value?.watermarkSpacingY) || (watermark?.settings?.fullScreenWatermarkSpacing) || reportInfo.value?.fullScreenWatermarkSpacing || 200
  const cols = Math.ceil(containerWidth / spacingX) + 2
  const rows = Math.ceil(containerHeight / spacingY) + 2

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({
        x: col * spacingX - Math.floor(spacingX / 2),
        y: row * spacingY - Math.floor(spacingY / 2)
      })
    }
  }

  return positions
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Completed': '#28a745',
    'In Progress': '#007bff',
    'On Track': '#17a2b8',
    'Planned': '#6c757d',
    'At Risk': '#ffc107',
    'Overdue': '#dc3545'
  }
  return colors[status] || '#6c757d'
}

// 测试函数已移除
</script>

<style scoped>
.academic-report-preview {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #f5f5f5;
}

.report-container {
  width: 210mm;
  min-height: 297mm;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  padding: 30mm 25mm;
}

/* 报告风格样式 */
.style-harvard .section-title {
  font-family: 'Georgia', serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
}

.style-harvard .report-title-centered {
  font-family: 'Georgia', serif;
  letter-spacing: 3px;
}

.style-oxford .section-title {
  font-family: 'Times New Roman', serif;
  font-style: italic;
  border-bottom: 3px double;
}

.style-oxford .performance-card {
  border-radius: 0;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.style-mit .section-title {
  font-family: 'Arial', sans-serif;
  font-weight: 300;
  font-size: 28px;
  border-left: 6px solid;
  padding-left: 15px;
}

.style-mit .performance-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.style-stanford .section-title {
  font-family: 'Helvetica', sans-serif;
  color: #8C1515;
  font-weight: 600;
  text-align: center;
  border: none;
  border-bottom: 2px solid #8C1515;
}

.style-stanford .performance-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
  border-left: 4px solid #8C1515;
}

.style-cambridge .section-title {
  font-family: 'Garamond', serif;
  text-align: center;
  padding: 12px 0;
  background: linear-gradient(to right, transparent, #f0f0f0, transparent);
  border: none;
}

.style-cambridge .report-header {
  background: linear-gradient(135deg, #003366 0%, #004080 100%) !important;
}

.style-cambridge .performance-card {
  border: 2px solid #003366;
  border-radius: 4px;
}

/* 页眉样式 */
.report-header {
  margin: -30mm -25mm 30px -25mm;
  padding: 15px 25mm;
  color: white;
  border-bottom: 4px solid;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  padding: 5px 0;
}

.seal-section-top {
  position: absolute;
  right: 20px;
  top: 20px;
}

.official-seal-top {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  opacity: 0.95;
}

.title-section-centered {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-wrapper {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.university-logo-centered {
  max-width: 200px;
  max-height: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: brightness(1.2) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  transition: transform 0.3s ease;
}

.university-logo-centered:hover {
  transform: scale(1.05);
}

.report-title-centered {
  font-size: 36px;
  font-weight: bold;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
}

.report-subtitle-centered {
  font-size: 16px;
  margin: 0;
  opacity: 0.95;
  font-weight: 400;
  line-height: 1.4;
}

.university-contact-centered {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

/* 学生信息区域 */
.student-info-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 30px 40px;
  border-radius: 12px;
  border-left: 6px solid;
  margin-bottom: 35px;
  display: flex;
  gap: 35px;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.student-info-section .label {
  font-weight: 800;
  font-size: 16px;
  color: #2c3e50;
}

.student-photo-wrapper {
  flex-shrink: 0;
}

.student-photo {
  max-width: 160px;
  max-height: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  display: block;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.student-info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 35px;
  margin-bottom: 0;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.info-item .label {
  font-weight: 700;
  color: #2c3e50;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.info-item .value {
  color: #34495e;
  font-weight: 500;
  font-size: 15px;
}

/* 章节样式 */
.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 3px solid;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 表现卡片 */
.performance-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.performance-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 5px solid;
  text-align: center;
}

.performance-label {
  font-size: 13px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.performance-value {
  font-size: 32px;
  font-weight: bold;
}

.performance-details {
  display: flex;
  gap: 30px;
  padding: 15px 20px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
}

.detail-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-weight: 600;
  color: #495057;
}

.detail-value {
  font-weight: bold;
  font-size: 18px;
}

/* 课程表格 */
.courses-table {
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.courses-table table {
  width: 100%;
  border-collapse: collapse;
}

.courses-table thead {
  color: white;
}

.courses-table th {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.courses-table td {
  padding: 12px;
  border-top: 1px solid #dee2e6;
  text-align: center;
}

.courses-table tbody tr:hover {
  background: #f8f9fa;
}

/* 成就列表 */
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid;
}

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.achievement-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.achievement-date {
  font-size: 13px;
  color: #6c757d;
  font-style: italic;
}

.achievement-desc {
  margin: 0;
  color: #495057;
  line-height: 1.6;
}

/* 改进建议 */
.improvement-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.improvement-item {
  padding: 15px;
  background: #fff9e6;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.improvement-area {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 15px;
}

.improvement-recommendation {
  color: #495057;
  line-height: 1.6;
}

/* 目标列表 */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.goal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.goal-text {
  flex: 1;
  font-weight: 500;
}

.goal-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 评语框 */
.comments-box {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #dee2e6;
}

.comment-text {
  margin: 0 0 20px 0;
  line-height: 1.8;
  color: #212529;
  text-align: justify;
}

.signature-section {
  margin-top: 30px;
}

.signature-line {
  display: flex;
  align-items: center;
  gap: 20px;
}

.signature-img {
  width: 150px;
  height: 60px;
  object-fit: contain;
}

.signature-info {
  flex: 1;
}

.signature-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.signature-title {
  font-size: 14px;
  color: #6c757d;
  font-style: italic;
}

/* 推荐建议 */
.recommendations-box {
  background: #e7f3ff;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.recommendation-text {
  margin: 0;
  line-height: 1.8;
  color: #212529;
  text-align: justify;
}

/* 页脚 */
.report-footer {
  margin: 40px -25mm -30mm -25mm;
  padding: 20px 25mm;
  border-top: 3px solid;
  background: #f8f9fa;
  position: relative;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.footer-left {
  text-align: center;
}

.footer-text {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #6c757d;
  line-height: 1.6;
}

.footer-confidential {
  margin: 0;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* 条形码和二维码独立区域 */
.footer-codes-section {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 30px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #dee2e6;
}

.barcode-section, .qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-barcode-img {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.barcode-svg {
  height: 50px;
  width: auto;
}

.barcode-text {
  font-size: 11px;
  margin-top: 4px;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 1px;
}

.custom-qr-img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.qr-canvas {
  width: 70px !important;
  height: 70px !important;
}

.qr-text {
  font-size: 9px;
  margin-top: 4px;
  color: #666;
}

/* 斜线水印样式 */
.diagonal-watermark { position: absolute; inset: 0; pointer-events: none; display: block; }

/* overlay teleport 专用：确保位于页面最上层（rendered in body） */
.diagonal-overlay-teleport {
  pointer-events: none;
}

.diagonal-overlay-teleport .diagonal-watermark { pointer-events: none; display: block; }

.watermark-debug {
  position: absolute;
  right: 8px;
  top: 8px;
  background: rgba(255,255,255,0.9);
  color: #111;
  font-size: 12px;
  padding: 8px;
  border-radius: 6px;
  max-width: 320px;
  max-height: 220px;
  overflow: auto;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

/* Teleport overlay 专用样式，确保在 body 中正确覆盖 */
.overlay-bridge-teleport {
  pointer-events: none;
  will-change: transform;
  z-index: 2147483646 !important; /* 强制最高层级 */
}

.overlay-bridge-teleport .diagonal-watermark { pointer-events: none; display: block; }

/* 调试边框样式 */
.overlay-debug-box {
  pointer-events: none;
}


.watermark-live-debug {
  position: absolute;
  left: 8px;
  top: 8px;
  background: rgba(255,255,255,0.95);
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  color: #111;
  z-index: 60;
  max-width: 220px;
  pointer-events: auto;
}
.watermark-live-debug .wm-pre {
  background: #f7f7f9;
  padding: 6px;
  border-radius: 4px;
  max-height: 120px;
  overflow: auto;
}
.btn-test-wm {
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  pointer-events: auto;
}

.force-overlay {
  position: absolute;
  inset: 0;
  display:flex;
  align-items:center;
  justify-content:center;
  pointer-events: none;
  z-index: 9999;
  color: #ff0000;
  font-size: 64px;
  font-weight: 800;
  opacity: 0.95;
  text-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transform: rotate(-15deg);
}

.overlay-bridge {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}


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

@media print {
  .academic-report-preview {
    padding: 0;
    background: white;
  }
  
  .report-container {
    box-shadow: none;
  }
}
</style>
