<template>
  <div class="quick-download">
    <button class="download-btn" @click="showOptions = !showOptions" :disabled="downloading">
      {{ downloading ? '导出中...' : '📥 导出' }}
    </button>
    
    <div v-if="showOptions" class="download-options">
      <button @click="download('png')" class="option-btn">
        <span class="icon">🖼️</span>
        <span>PNG 高清</span>
      </button>
      <button @click="download('jpg')" class="option-btn">
        <span class="icon">📷</span>
        <span>JPG 压缩</span>
      </button>
      <button @click="download('pdf')" class="option-btn">
        <span class="icon">📄</span>
        <span>PDF 文档</span>
      </button>
    </div>
    
    <div v-if="showOptions" class="options-backdrop" @click="showOptions = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const props = withDefaults(defineProps<{
  targetId: string
  filename?: string
  scale?: number
}>(), {
  filename: 'export',
  scale: 3
})

const showOptions = ref(false)
const downloading = ref(false)

const download = async (format: 'png' | 'jpg' | 'pdf') => {
  const element = document.getElementById(props.targetId)
  if (!element) {
    alert('找不到预览元素')
    return
  }
  
  downloading.value = true
  showOptions.value = false
  
  try {
    const canvas = await html2canvas(element, {
      scale: props.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const baseFilename = `${props.filename}_${timestamp}`
    
    if (format === 'pdf') {
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgRatio = canvas.height / canvas.width
      
      let imgWidth = pageWidth - 20
      let imgHeight = imgWidth * imgRatio
      
      // 如果图片高度超出页面，则缩放
      if (imgHeight > pageHeight - 20) {
        imgHeight = pageHeight - 20
        imgWidth = imgHeight / imgRatio
      }
      
      const x = (pageWidth - imgWidth) / 2
      const y = (pageHeight - imgHeight) / 2
      
      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight)
      pdf.save(`${baseFilename}.pdf`)
    } else {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      const quality = format === 'png' ? 1.0 : 0.92
      const dataUrl = canvas.toDataURL(mimeType, quality)
      
      const link = document.createElement('a')
      link.download = `${baseFilename}.${format}`
      link.href = dataUrl
      link.click()
    }
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.quick-download {
  position: relative;
  display: inline-block;
}

.download-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.download-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.download-options {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
  min-width: 160px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.option-btn:hover {
  background-color: #f5f7fa;
}

.option-btn .icon {
  font-size: 18px;
}

.options-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}
</style>
