<template>
  <div class="download-panel" v-if="visible">
    <div class="download-overlay" @click="$emit('close')"></div>
    <div class="download-modal">
      <div class="modal-header">
        <h3>📥 导出设置</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>导出格式</label>
          <div class="format-options">
            <label class="format-option" :class="{ active: format === 'png' }">
              <input type="radio" v-model="format" value="png" />
              <span class="format-icon">🖼️</span>
              <span class="format-name">PNG</span>
              <span class="format-desc">高清图片</span>
            </label>
            <label class="format-option" :class="{ active: format === 'jpg' }">
              <input type="radio" v-model="format" value="jpg" />
              <span class="format-icon">📷</span>
              <span class="format-name">JPG</span>
              <span class="format-desc">压缩图片</span>
            </label>
            <label class="format-option" :class="{ active: format === 'pdf' }">
              <input type="radio" v-model="format" value="pdf" />
              <span class="format-icon">📄</span>
              <span class="format-name">PDF</span>
              <span class="format-desc">可打印文档</span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label>导出质量</label>
          <div class="quality-options">
            <label class="quality-option" :class="{ active: quality === 'standard' }">
              <input type="radio" v-model="quality" value="standard" />
              <span class="quality-name">标准</span>
              <span class="quality-desc">scale: 2x, 适合屏幕显示</span>
            </label>
            <label class="quality-option" :class="{ active: quality === 'high' }">
              <input type="radio" v-model="quality" value="high" />
              <span class="quality-name">高清</span>
              <span class="quality-desc">scale: 3x, 适合打印</span>
            </label>
            <label class="quality-option" :class="{ active: quality === 'ultra' }">
              <input type="radio" v-model="quality" value="ultra" />
              <span class="quality-name">超高清</span>
              <span class="quality-desc">scale: 4x, 最佳质量</span>
            </label>
            <label class="quality-option" :class="{ active: quality === 'max' }">
              <input type="radio" v-model="quality" value="max" />
              <span class="quality-name">最高</span>
              <span class="quality-desc">scale: 5x, 大文件</span>
            </label>
          </div>
        </div>
        
        <div v-if="format === 'jpg'" class="form-group">
          <label>JPEG 压缩质量: {{ jpegQuality }}%</label>
          <input type="range" v-model.number="jpegQuality" min="50" max="100" step="5" class="slider" />
          <div class="slider-labels">
            <span>较小文件</span>
            <span>最佳质量</span>
          </div>
        </div>
        
        <div class="form-group">
          <label>文件名</label>
          <input type="text" v-model="fileName" class="filename-input" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">取消</button>
        <button class="btn-download" @click="handleDownload" :disabled="downloading">
          {{ downloading ? '导出中...' : '立即导出' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// 调试开关：默认关闭。打开会使用醒目红条以便调试导出覆盖层是否被捕获。
const FORCE_VISIBLE_FALLBACK = false

const props = defineProps<{
  visible: boolean
  previewSelector: string
  defaultFileName: string
  defaultFormat?: 'png'|'jpg'|'pdf'
  defaultQuality?: 'standard'|'high'|'ultra'|'max' | number
}>()

const emit = defineEmits(['close'])

const format = ref<'png' | 'jpg' | 'pdf'>('png')
const quality = ref<'standard' | 'high' | 'ultra' | 'max'>('high')
const jpegQuality = ref(90)
const fileName = ref(props.defaultFileName)
const downloading = ref(false)

watch(() => props.defaultFileName, (newVal) => {
  fileName.value = newVal
})

// Helper: map numeric scales to keys
const numericQualityToKey = (n: number) => {
  if (n >= 5) return 'max'
  if (n >= 4) return 'ultra'
  if (n >= 3) return 'high'
  return 'standard'
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    fileName.value = props.defaultFileName
    // Apply defaults for format/quality if provided by the host page
    if (props.defaultFormat) format.value = props.defaultFormat
    if (props.defaultQuality !== undefined) {
      if (typeof props.defaultQuality === 'number') {
        quality.value = numericQualityToKey(props.defaultQuality) as any
      } else {
        quality.value = props.defaultQuality as any
      }
    }
  }
})

const qualitySettings = {
  standard: { scale: 2, quality: 0.85 },
  high: { scale: 3, quality: 0.92 },
  ultra: { scale: 4, quality: 0.95 },
  max: { scale: 5, quality: 1.0 }
}

// 统一的导出处理函数
const finalizeExport = async (canvas: HTMLCanvasElement, element: HTMLElement, settings: any) => {
  if (format.value === 'pdf') {
    let exportCanvas: HTMLCanvasElement = canvas
    try {
      const elemW = Math.round((element.getBoundingClientRect().width || element.offsetWidth) * (settings.scale || 1))
      if (exportCanvas.width > elemW + 2) {
        exportCanvas = cropCanvasToWidth(exportCanvas, elemW)
      }
    } catch (e) { console.debug('[DownloadPanel] crop to element width failed', e) }

    exportCanvas = trimCanvasWhitespace(exportCanvas)
    exportCanvas = removeRightGrayStrip(exportCanvas)
    const pdfCanvas = scaleDownAndCenter(exportCanvas, 0.999, 0, 0)

    const pdfPxWidth = pdfCanvas.width
    const pdfPxHeight = pdfCanvas.height
    const ptPerPx = 72 / 96
    const pdfWidthPt = pdfPxWidth * ptPerPx
    const pdfHeightPt = pdfPxHeight * ptPerPx

    const pdf = new jsPDF({ unit: 'pt', format: [pdfWidthPt, pdfHeightPt] })
    const imgData = pdfCanvas.toDataURL('image/png', 1.0)
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidthPt, pdfHeightPt)
    pdf.save(`${fileName.value}.pdf`)
  } else if (format.value === 'jpg' || format.value === 'png') {
    let exportCanvas: HTMLCanvasElement = canvas
    try {
      const elemW = Math.round((element.getBoundingClientRect().width || element.offsetWidth) * (settings.scale || 1))
      if (exportCanvas.width > elemW + 2) {
        exportCanvas = cropCanvasToWidth(exportCanvas, elemW)
      }
    } catch (e) { console.debug('[DownloadPanel] crop to element width failed', e) }

    exportCanvas = trimCanvasWhitespace(exportCanvas)
    exportCanvas = removeRightGrayStrip(exportCanvas)
    exportCanvas = scaleDownAndCenter(exportCanvas, 0.995, 8, 0)

    const newCanvas = document.createElement('canvas')
    newCanvas.width = exportCanvas.width
    newCanvas.height = exportCanvas.height
    const newCtx = newCanvas.getContext('2d')
    if (newCtx) {
      newCtx.fillStyle = '#ffffff'
      newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height)
      newCtx.drawImage(exportCanvas, 0, 0)
    }

    const mimeType = format.value === 'jpg' ? 'image/jpeg' : 'image/png'
    const qualityValue = format.value === 'jpg' ? jpegQuality.value / 100 : 1.0
    newCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileName.value}.${format.value}`
        a.click()
        URL.revokeObjectURL(url)
      }
    }, mimeType, qualityValue)
  }
}

// 裁剪画布周围的纯白背景，返回新的裁剪后的 canvas
const trimCanvasWhitespace = (srcCanvas: HTMLCanvasElement) => {
  try {
    const ctx = srcCanvas.getContext('2d')
    if (!ctx) return srcCanvas
    const w = srcCanvas.width
    const h = srcCanvas.height
    const imgData = ctx.getImageData(0, 0, w, h)
    const data = imgData.data

    const isContentPixel = (i: number) => {
      const r = data[i]
      const g = data[i+1]
      const b = data[i+2]
      const a = data[i+3]
      if (a > 16) {
        if (Math.abs(r - 255) > 10 || Math.abs(g - 255) > 10 || Math.abs(b - 255) > 10) return true
      }
      return false
    }

    let top = 0
    let bottom = h - 1
    let left = 0
    let right = w - 1
    let found = false

    // top
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (isContentPixel((y * w + x) * 4)) { top = y; found = true; break }
      }
      if (found) break
    }
    // bottom
    found = false
    for (let y = h - 1; y >= 0; y--) {
      for (let x = 0; x < w; x++) {
        if (isContentPixel((y * w + x) * 4)) { bottom = y; found = true; break }
      }
      if (found) break
    }
    // left
    found = false
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        if (isContentPixel((y * w + x) * 4)) { left = x; found = true; break }
      }
      if (found) break
    }
    // right
    found = false
    for (let x = w - 1; x >= 0; x--) {
      for (let y = 0; y < h; y++) {
        if (isContentPixel((y * w + x) * 4)) { right = x; found = true; break }
      }
      if (found) break
    }

    const cropW = right - left + 1
    const cropH = bottom - top + 1
    if (cropW <= 0 || cropH <= 0) return srcCanvas

    // 如果裁剪后宽度与原始宽度相等（即没有右侧白边），直接返回原画布以避免额外复制
    if (cropW === w && cropH === h) return srcCanvas

    const out = document.createElement('canvas')
    out.width = cropW
    out.height = cropH
    const outCtx = out.getContext('2d')
    if (!outCtx) return srcCanvas
    outCtx.putImageData(ctx.getImageData(left, top, cropW, cropH), 0, 0)
    return out
  } catch (e) {
    console.debug('[DownloadPanel] trimCanvasWhitespace failed', e)
    return srcCanvas
  }
}

// 根据期望的像素宽度裁剪画布（裁掉右侧多余部分）
const cropCanvasToWidth = (srcCanvas: HTMLCanvasElement, desiredWidthPx: number) => {
  try {
    if (srcCanvas.width <= desiredWidthPx) return srcCanvas
    const out = document.createElement('canvas')
    out.width = desiredWidthPx
    out.height = srcCanvas.height
    const ctx = out.getContext('2d')
    if (!ctx) return srcCanvas
    // drawImage(source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(srcCanvas, 0, 0, desiredWidthPx, srcCanvas.height, 0, 0, desiredWidthPx, srcCanvas.height)
    return out
  } catch (e) {
    console.debug('[DownloadPanel] cropCanvasToWidth failed', e)
    return srcCanvas
  }
}

// 检测并移除右侧近白/浅灰均匀条带（例如 PDF 渲染或半像素缩放残留）
const removeRightGrayStrip = (srcCanvas: HTMLCanvasElement, brightnessThreshold = 248) => {
  try {
    const ctx = srcCanvas.getContext('2d')
    if (!ctx) return srcCanvas
    const w = srcCanvas.width
    const h = srcCanvas.height

    // 以步长采样行来降低计算量
    const sampleStep = Math.max(1, Math.floor(h / 120))
    let newRight = w - 1
    outer: for (let x = w - 1; x >= 0; x--) {
      let sum = 0
      let count = 0
      for (let y = 0; y < h; y += sampleStep) {
        const data = ctx.getImageData(x, y, 1, 1).data
        const r = data[0], g = data[1], b = data[2], a = data[3]
        // 如果像素透明或接近白色，则视为背景
        if (a <= 16) { sum += 255; count++; continue }
        const brightness = (r + g + b) / 3
        sum += brightness
        count++
        // 如果这个像素明显不是白色，说明到达内容区域
        if (brightness < brightnessThreshold) {
          break outer
        }
      }
      // 如果循环没有 break，说明这列基本接近白，继续检查下一列
      newRight = x - 1
    }

    const cropW = Math.max(1, newRight + 1)
    if (cropW >= w) return srcCanvas

    const out = document.createElement('canvas')
    out.width = cropW
    out.height = h
    const outCtx = out.getContext('2d')
    if (!outCtx) return srcCanvas
    outCtx.drawImage(srcCanvas, 0, 0, cropW, h, 0, 0, cropW, h)
    return out
  } catch (e) {
    console.debug('[DownloadPanel] removeRightGrayStrip failed', e)
    return srcCanvas
  }
}

// 将画布内容按指定比例微缩并居中绘制到相同大小的白底画布上
const scaleDownAndCenter = (srcCanvas: HTMLCanvasElement, scale = 0.997, offsetY = 0, offsetX = 0) => {
  try {
    const w = srcCanvas.width
    const h = srcCanvas.height
    const out = document.createElement('canvas')
    out.width = w
    out.height = h
    const ctx = out.getContext('2d')
    if (!ctx) return srcCanvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    const drawW = Math.max(1, Math.floor(w * scale))
    const drawH = Math.max(1, Math.floor(h * scale))
    const dx = Math.floor((w - drawW) / 2 + (offsetX || 0))
    const dy = Math.floor((h - drawH) / 2 + (offsetY || 0))
    ctx.drawImage(srcCanvas, 0, 0, w, h, dx, dy, drawW, drawH)
    return out
  } catch (e) {
    console.debug('[DownloadPanel] scaleDownAndCenter failed', e)
    return srcCanvas
  }
}

const handleDownload = async () => {
  console.log('[DownloadPanel] 查找元素:', props.previewSelector)
  let element = document.querySelector(props.previewSelector) as HTMLElement

  if (!element) {
    console.error('[DownloadPanel] 找不到元素:', props.previewSelector)
    alert('找不到预览元素，请确保预览区域已正确渲染')
    return
  }
  
  console.log('[DownloadPanel] 找到元素:', element, {
    width: element.offsetWidth,
    height: element.offsetHeight
  })
  
  await doDownload(element)
}

const doDownload = async (element: HTMLElement) => {
  downloading.value = true
  
  try {
    const settings = qualitySettings[quality.value]
    
    // 确保元素在可视区域内
    element.scrollIntoView({ block: 'start', behavior: 'instant' })
    
    // 等待渲染稳定
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 获取元素的实际渲染尺寸
    const rect = element.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(element)
    
    console.debug('[DownloadPanel] 元素信息', {
      selector: props.previewSelector,
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      rectWidth: rect.width,
      rectHeight: rect.height,
      position: computedStyle.position,
      overflow: computedStyle.overflow
    })
    
    // 计算实际需要渲染的宽高
    const renderWidth = Math.max(element.offsetWidth, element.scrollWidth, rect.width)
    const renderHeight = Math.max(element.offsetHeight, element.scrollHeight, rect.height)
    
    if (renderWidth < 50 || renderHeight < 50) {
      console.error('[DownloadPanel] 元素尺寸过小', { renderWidth, renderHeight })
      alert('预览元素尺寸异常，请刷新页面后重试')
      downloading.value = false
      return
    }

    // 使用 html2canvas 渲染
    const canvas = await html2canvas(element, {
      scale: settings.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true, // 启用日志以便调试
      width: renderWidth,
      height: renderHeight,
      windowWidth: Math.max(document.documentElement.clientWidth, renderWidth + 100),
      windowHeight: Math.max(document.documentElement.clientHeight, renderHeight + 100),
      foreignObjectRendering: false // 禁用 foreignObject 以提高兼容性
    })

    console.debug('[DownloadPanel] 画布已创建', { 
      canvasWidth: canvas.width, 
      canvasHeight: canvas.height,
      expectedWidth: renderWidth * settings.scale,
      expectedHeight: renderHeight * settings.scale
    })

    // 检查画布是否有效（不为空白）
    let hasContent = false
    try {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const imgData = ctx.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height))
        let nonWhitePixels = 0
        for (let i = 0; i < imgData.data.length; i += 4) {
          const r = imgData.data[i]
          const g = imgData.data[i + 1]
          const b = imgData.data[i + 2]
          const a = imgData.data[i + 3]
          // 检查是否有非白色像素
          if (a > 10 && (r < 250 || g < 250 || b < 250)) {
            nonWhitePixels++
          }
        }
        hasContent = nonWhitePixels > 20
        console.debug('[DownloadPanel] 画布内容检查', { nonWhitePixels, hasContent })
      }
    } catch (e) {
      console.warn('[DownloadPanel] 无法检查画布内容', e)
      hasContent = true // 假设有内容
    }
    
    if (!hasContent) {
      console.warn('[DownloadPanel] 警告：画布内容可能为空，但会尝试导出')
    }
    
    if (canvas.width < 10 || canvas.height < 10) {
      console.error('[DownloadPanel] 导出尺寸异常', {width: canvas.width, height: canvas.height})
      alert('导出失败：无法正确捕获内容。请检查预览面板后重试。')
      downloading.value = false
      return
    }

    // 导出
    await finalizeExport(canvas, element, settings)
    
    downloading.value = false
    emit('close')
  } catch (error) {
    console.error('[DownloadPanel] 导出失败:', error)
    alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'))
    downloading.value = false
  }
}
</script>

<style scoped>
.download-panel {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.download-modal {
  position: relative;
  width: 480px;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.close-btn:hover {
  background: #e5e7eb;
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group > label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.format-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.format-option {
  position: relative;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.format-option:hover {
  border-color: #2563eb;
}

.format-option.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.format-option input {
  position: absolute;
  opacity: 0;
}

.format-icon {
  display: block;
  font-size: 24px;
  margin-bottom: 8px;
}

.format-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.format-desc {
  display: block;
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.quality-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quality-option {
  position: relative;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.quality-option:hover {
  border-color: #2563eb;
}

.quality-option.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.quality-option input {
  position: absolute;
  opacity: 0;
}

.quality-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.quality-desc {
  display: block;
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: #9ca3af;
}

.filename-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.filename-input:focus {
  outline: none;
  border-color: #2563eb;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-cancel {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-download {
  flex: 2;
  padding: 12px 20px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
