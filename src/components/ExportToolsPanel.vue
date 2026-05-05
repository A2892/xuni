<template>
  <div class="export-tools-panel">
    <h3 class="panel-title">📥 导出工具</h3>
    
    <div class="export-options">
      <!-- 格式选择 -->
      <div class="option-group">
        <label>导出格式</label>
        <div class="format-buttons">
          <button 
            v-for="format in formats" 
            :key="format.value"
            :class="['format-btn', { active: selectedFormat === format.value }]"
            @click="selectedFormat = format.value"
          >
            <span class="format-icon">{{ format.icon }}</span>
            <span class="format-name">{{ format.label }}</span>
          </button>
        </div>
      </div>

      <!-- 质量选择 -->
      <div v-if="selectedFormat === 'png' || selectedFormat === 'jpg'" class="option-group">
        <label>图片质量</label>
        <select v-model="quality">
          <option value="1">标准 (1x)</option>
          <option value="2">高清 (2x)</option>
          <option value="3">超清 (3x)</option>
          <option value="4">最高 (4x)</option>
        </select>
      </div>

      <!-- PDF 选项 -->
      <div v-if="selectedFormat === 'pdf'" class="option-group">
        <label>页面方向</label>
        <div class="orientation-buttons">
          <button 
            :class="['orient-btn', { active: pdfOrientation === 'portrait' }]"
            @click="pdfOrientation = 'portrait'"
          >
            📄 纵向
          </button>
          <button 
            :class="['orient-btn', { active: pdfOrientation === 'landscape' }]"
            @click="pdfOrientation = 'landscape'"
          >
            📃 横向
          </button>
        </div>
      </div>

      <!-- 文件名 -->
      <div class="option-group">
        <label>文件名</label>
        <input 
          v-model="fileName" 
          type="text" 
          placeholder="输入文件名（不含扩展名）"
        />
      </div>

      <!-- 导出按钮 -->
      <div class="export-actions">
        <button 
          @click="handleExport" 
          class="btn-export"
          :disabled="isExporting"
        >
          {{ isExporting ? '导出中...' : '立即导出' }}
        </button>
        <button 
          @click="handleCopy" 
          class="btn-copy"
          :disabled="isCopying || selectedFormat !== 'png'"
          v-if="selectedFormat === 'png'"
        >
          {{ isCopying ? '复制中...' : '复制到剪贴板' }}
        </button>
      </div>
    </div>

    <!-- 导出历史 -->
    <div v-if="exportHistory.length > 0" class="export-history">
      <h4>最近导出</h4>
      <div class="history-list">
        <div v-for="(item, index) in exportHistory.slice(0, 5)" :key="index" class="history-item">
          <span class="history-icon">{{ getFormatIcon(item.format) }}</span>
          <span class="history-name">{{ item.name }}</span>
          <span class="history-time">{{ formatTime(item.time) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const props = defineProps<{
  targetRef: any
  defaultFileName?: string
}>()

const emit = defineEmits(['export-start', 'export-complete', 'export-error'])

const formats = [
  { value: 'png', label: 'PNG', icon: '🖼️' },
  { value: 'jpg', label: 'JPG', icon: '📷' },
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'svg', label: 'SVG', icon: '🎨' }
]

const selectedFormat = ref('png')
const quality = ref('2')
const pdfOrientation = ref<'portrait' | 'landscape'>('portrait')
const fileName = ref(props.defaultFileName || 'export')
const isExporting = ref(false)
const isCopying = ref(false)

interface ExportHistoryItem {
  name: string
  format: string
  time: Date
}

const exportHistory = ref<ExportHistoryItem[]>([])

const getFormatIcon = (format: string) => {
  return formats.find(f => f.value === format)?.icon || '📁'
}

const formatTime = (time: Date) => {
  return new Date(time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const handleExport = async () => {
  if (!props.targetRef) {
    console.error('No target element provided')
    return
  }

  isExporting.value = true
  emit('export-start')

  try {
    const element = props.targetRef.$el || props.targetRef

    if (selectedFormat.value === 'png' || selectedFormat.value === 'jpg') {
      await exportImage(element)
    } else if (selectedFormat.value === 'pdf') {
      await exportPDF(element)
    } else if (selectedFormat.value === 'svg') {
      await exportSVG(element)
    }

    exportHistory.value.unshift({
      name: `${fileName.value}.${selectedFormat.value}`,
      format: selectedFormat.value,
      time: new Date()
    })

    emit('export-complete')
  } catch (error) {
    console.error('Export failed:', error)
    emit('export-error', error)
  } finally {
    isExporting.value = false
  }
}

const exportImage = async (element: HTMLElement) => {
  const scale = parseInt(quality.value)
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  })

  const link = document.createElement('a')
  link.download = `${fileName.value}.${selectedFormat.value}`
  
  if (selectedFormat.value === 'jpg') {
    link.href = canvas.toDataURL('image/jpeg', 0.95)
  } else {
    link.href = canvas.toDataURL('image/png')
  }
  
  link.click()
}

const exportPDF = async (element: HTMLElement) => {
  const scale = 2
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  })

  const imgData = canvas.toDataURL('image/png')
  const imgWidth = canvas.width
  const imgHeight = canvas.height

  const pdf = new jsPDF({
    orientation: pdfOrientation.value,
    unit: 'px',
    format: [imgWidth / scale, imgHeight / scale]
  })

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth / scale, imgHeight / scale)
  pdf.save(`${fileName.value}.pdf`)
}

const exportSVG = async (element: HTMLElement) => {
  // 简单的 SVG 导出 - 将 HTML 转换为 SVG foreignObject
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  
  const rect = element.getBoundingClientRect()
  svg.setAttribute('width', String(rect.width))
  svg.setAttribute('height', String(rect.height))
  svg.setAttribute('xmlns', svgNS)

  const foreignObject = document.createElementNS(svgNS, 'foreignObject')
  foreignObject.setAttribute('width', '100%')
  foreignObject.setAttribute('height', '100%')
  foreignObject.innerHTML = element.outerHTML

  svg.appendChild(foreignObject)

  const svgData = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.download = `${fileName.value}.svg`
  link.href = url
  link.click()

  URL.revokeObjectURL(url)
}

const handleCopy = async () => {
  if (!props.targetRef) return

  isCopying.value = true
  
  try {
    const element = props.targetRef.$el || props.targetRef
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    canvas.toBlob(async (blob) => {
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        alert('已复制到剪贴板！')
      }
    }, 'image/png')
  } catch (error) {
    console.error('Copy failed:', error)
    alert('复制失败，请重试')
  } finally {
    isCopying.value = false
  }
}
</script>

<style scoped>
.export-tools-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-group label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.format-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.format-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.format-btn:hover {
  background: #e9ecef;
}

.format-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
}

.format-icon {
  font-size: 20px;
}

.format-name {
  font-size: 11px;
  font-weight: 500;
  color: #333;
}

.orientation-buttons {
  display: flex;
  gap: 8px;
}

.orient-btn {
  flex: 1;
  padding: 10px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.orient-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
}

.option-group input,
.option-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
  transition: border-color 0.2s;
}

.option-group input:focus,
.option-group select:focus {
  outline: none;
  border-color: #667eea;
}

.export-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-export {
  flex: 1;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-copy {
  padding: 12px 20px;
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-copy:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-history {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.export-history h4 {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin: 0 0 12px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 12px;
}

.history-icon {
  font-size: 14px;
}

.history-name {
  flex: 1;
  color: #333;
  font-weight: 500;
}

.history-time {
  color: #999;
}
</style>
