<template>
  <div class="barcode-qr-uploader">
    <div class="upload-section">
      <label class="section-label">{{ label }}</label>
      <div class="upload-options">
        <label class="upload-type" :class="{ active: uploadType === 'auto' }">
          <input type="radio" v-model="uploadType" value="auto" />
          <span>自动生成</span>
        </label>
        <label class="upload-type" :class="{ active: uploadType === 'upload' }">
          <input type="radio" v-model="uploadType" value="upload" />
          <span>上传图片</span>
        </label>
      </div>
    </div>
    
    <div v-if="uploadType === 'auto'" class="auto-generate">
      <div class="form-group">
        <label>{{ type === 'qr' ? '二维码内容' : '条形码内容' }}</label>
        <input 
          type="text" 
          v-model="codeContent" 
          :placeholder="type === 'qr' ? '输入链接或文字' : '输入数字或编码'"
          @input="handleContentChange"
        />
      </div>
      <div v-if="type === 'barcode'" class="form-group">
        <label>条形码格式</label>
        <select v-model="barcodeFormat" @change="handleContentChange">
          <option value="CODE128">CODE128</option>
          <option value="CODE39">CODE39</option>
          <option value="EAN13">EAN13</option>
          <option value="EAN8">EAN8</option>
          <option value="UPC">UPC</option>
        </select>
      </div>
      <div class="preview-box" v-if="generatedImage">
        <img :src="generatedImage" :alt="type === 'qr' ? 'QR Code' : 'Barcode'" />
      </div>
    </div>
    
    <div v-else class="upload-area">
      <input 
        type="file" 
        :id="inputId"
        accept="image/*" 
        @change="handleUpload" 
        class="file-input"
      />
      <label :for="inputId" class="upload-label">
        <span class="upload-icon">{{ type === 'qr' ? '📱' : '|||' }}</span>
        <span class="upload-text">{{ uploadedImage ? '更换图片' : '点击上传' }}</span>
      </label>
      <div v-if="uploadedImage" class="preview-box">
        <img :src="uploadedImage" :alt="type === 'qr' ? 'QR Code' : 'Barcode'" />
        <button @click="removeUpload" class="btn-remove">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
  type: 'qr' | 'barcode'
  label: string
  modelValue?: string
  defaultContent?: string
}>()

const emit = defineEmits(['update:modelValue'])

const inputId = computed(() => `upload-${props.type}-${Math.random().toString(36).substr(2, 9)}`)
const uploadType = ref<'auto' | 'upload'>('auto')
const codeContent = ref(props.defaultContent || '')
const barcodeFormat = ref('CODE128')
const generatedImage = ref('')
const uploadedImage = ref('')

// 简单的条形码SVG生成
const generateBarcodeSVG = (content: string): string => {
  const bars = content.split('').map((char, i) => {
    const width = (char.charCodeAt(0) % 3) + 1
    return `<rect x="${i * 4}" y="0" width="${width}" height="50" fill="black"/>`
  }).join('')
  
  const totalWidth = content.length * 4
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 60" width="${totalWidth}" height="60">
    <rect x="0" y="0" width="${totalWidth}" height="60" fill="white"/>
    ${bars}
    <text x="${totalWidth/2}" y="58" text-anchor="middle" font-size="8" font-family="monospace">${content}</text>
  </svg>`
  
  return 'data:image/svg+xml;base64,' + btoa(svg)
}

// 简单的QR码占位图生成
const generateQRPlaceholder = (content: string): string => {
  const size = 120
  const modules = 21 // QR码模块数
  const moduleSize = size / modules
  
  let rects = ''
  // 生成伪随机模块（基于内容hash）
  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      const hash = (content.charCodeAt((i + j) % content.length) || 0) + i * j
      if (hash % 3 !== 0) {
        rects += `<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
      }
    }
  }
  
  // 添加定位图案
  const cornerSize = moduleSize * 7
  const corners = [
    { x: 0, y: 0 },
    { x: size - cornerSize, y: 0 },
    { x: 0, y: size - cornerSize }
  ]
  
  corners.forEach(pos => {
    rects += `<rect x="${pos.x}" y="${pos.y}" width="${cornerSize}" height="${cornerSize}" fill="black"/>`
    rects += `<rect x="${pos.x + moduleSize}" y="${pos.y + moduleSize}" width="${cornerSize - moduleSize * 2}" height="${cornerSize - moduleSize * 2}" fill="white"/>`
    rects += `<rect x="${pos.x + moduleSize * 2}" y="${pos.y + moduleSize * 2}" width="${cornerSize - moduleSize * 4}" height="${cornerSize - moduleSize * 4}" fill="black"/>`
  })
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect x="0" y="0" width="${size}" height="${size}" fill="white"/>
    ${rects}
  </svg>`
  
  return 'data:image/svg+xml;base64,' + btoa(svg)
}

const handleContentChange = () => {
  if (!codeContent.value) {
    generatedImage.value = ''
    emit('update:modelValue', '')
    return
  }
  
  if (props.type === 'barcode') {
    generatedImage.value = generateBarcodeSVG(codeContent.value)
  } else {
    generatedImage.value = generateQRPlaceholder(codeContent.value)
  }
  
  emit('update:modelValue', generatedImage.value)
}

const handleUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string
      emit('update:modelValue', uploadedImage.value)
    }
    reader.readAsDataURL(file)
  }
}

const removeUpload = () => {
  uploadedImage.value = ''
  emit('update:modelValue', '')
}

watch(uploadType, (newVal) => {
  if (newVal === 'auto' && generatedImage.value) {
    emit('update:modelValue', generatedImage.value)
  } else if (newVal === 'upload' && uploadedImage.value) {
    emit('update:modelValue', uploadedImage.value)
  } else {
    emit('update:modelValue', '')
  }
})

onMounted(() => {
  if (props.defaultContent) {
    handleContentChange()
  }
})
</script>

<style scoped>
.barcode-qr-uploader {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.upload-options {
  display: flex;
  gap: 12px;
}

.upload-type {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.upload-type:hover {
  border-color: #2563eb;
}

.upload-type.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.upload-type input {
  display: none;
}

.auto-generate {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  color: #6b7280;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
}

.preview-box {
  position: relative;
  display: inline-flex;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  justify-content: center;
}

.preview-box img {
  max-width: 150px;
  max-height: 80px;
  object-fit: contain;
}

.upload-area {
  position: relative;
}

.file-input {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-label:hover {
  border-color: #2563eb;
  background: #f8fafc;
}

.upload-icon {
  font-size: 24px;
}

.upload-text {
  font-size: 13px;
  color: #6b7280;
}

.btn-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}
</style>
