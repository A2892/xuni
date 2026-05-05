<template>
  <div class="export-options">
    <!-- 头部 -->
    <div class="export-header">
      <h2>
        <IconLib name="download" :size="24" />
        导出选项
      </h2>
      <p>配置并导出您的文档</p>
    </div>

    <!-- 预览区域 -->
    <div class="preview-section">
      <div class="preview-card">
        <div class="preview-image">
          <slot name="preview">
            <div class="preview-placeholder">
              <IconLib name="file-text" :size="48" />
              <span>文档预览</span>
            </div>
          </slot>
        </div>
        <div class="preview-info">
          <h3>{{ documentName }}</h3>
          <div class="info-meta">
            <span>{{ formatFileSize(estimatedSize) }}</span>
            <span class="dot">•</span>
            <span>{{ width }} × {{ height }} px</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 格式选择 -->
    <div class="option-section">
      <h3 class="section-title">导出格式</h3>
      <div class="format-grid">
        <button 
          v-for="format in formats"
          :key="format.value"
          class="format-card"
          :class="{ 'is-selected': selectedFormat === format.value }"
          @click="selectedFormat = format.value"
        >
          <div class="format-icon" :style="{ backgroundColor: format.color }">
            <IconLib :name="format.icon" :size="24" />
          </div>
          <div class="format-info">
            <span class="format-name">{{ format.name }}</span>
            <span class="format-desc">{{ format.description }}</span>
          </div>
          <div class="format-check" v-if="selectedFormat === format.value">
            <IconLib name="check" :size="16" />
          </div>
        </button>
      </div>
    </div>

    <!-- 质量设置 -->
    <div class="option-section" v-if="showQualityOption">
      <h3 class="section-title">图片质量</h3>
      <div class="quality-control">
        <div class="quality-presets">
          <button 
            v-for="preset in qualityPresets"
            :key="preset.value"
            class="preset-btn"
            :class="{ 'is-active': quality === preset.value }"
            @click="quality = preset.value"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="quality-slider">
          <input 
            type="range"
            v-model.number="quality"
            min="10"
            max="100"
            class="slider"
          />
          <span class="slider-value">{{ quality }}%</span>
        </div>
        <div class="quality-info">
          <span class="info-label">预计文件大小：</span>
          <span class="info-value">{{ formatFileSize(estimatedSize) }}</span>
        </div>
      </div>
    </div>

    <!-- 尺寸设置 -->
    <div class="option-section">
      <h3 class="section-title">输出尺寸</h3>
      <div class="size-control">
        <div class="size-presets">
          <button 
            v-for="preset in sizePresets"
            :key="preset.value"
            class="preset-btn"
            :class="{ 'is-active': sizeScale === preset.value }"
            @click="sizeScale = preset.value"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="size-custom">
          <div class="input-group">
            <label>宽度</label>
            <div class="input-with-unit">
              <input type="number" v-model.number="width" min="100" max="4096" />
              <span>px</span>
            </div>
          </div>
          <button class="link-btn" :class="{ 'is-linked': lockRatio }" @click="lockRatio = !lockRatio">
            <IconLib :name="lockRatio ? 'lock' : 'unlock'" :size="16" />
          </button>
          <div class="input-group">
            <label>高度</label>
            <div class="input-with-unit">
              <input type="number" v-model.number="height" min="100" max="4096" />
              <span>px</span>
            </div>
          </div>
        </div>
        <div class="dpi-control">
          <label>分辨率 (DPI)</label>
          <select v-model.number="dpi">
            <option :value="72">72 DPI（屏幕）</option>
            <option :value="150">150 DPI（一般打印）</option>
            <option :value="300">300 DPI（高质量打印）</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 高级选项 -->
    <div class="option-section">
      <button class="advanced-toggle" @click="showAdvanced = !showAdvanced">
        <span>高级选项</span>
        <IconLib :name="showAdvanced ? 'chevron-up' : 'chevron-down'" :size="18" />
      </button>
      
      <transition name="expand">
        <div v-if="showAdvanced" class="advanced-options">
          <div class="option-row">
            <span>透明背景</span>
            <button 
              class="toggle-switch"
              :class="{ 'is-on': transparentBg }"
              @click="transparentBg = !transparentBg"
              :disabled="selectedFormat === 'jpg'"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>
          
          <div class="option-row">
            <span>添加水印</span>
            <button 
              class="toggle-switch"
              :class="{ 'is-on': addWatermark }"
              @click="addWatermark = !addWatermark"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>
          
          <div v-if="addWatermark" class="watermark-settings">
            <input 
              type="text"
              v-model="watermarkText"
              placeholder="水印文字"
              class="watermark-input"
            />
            <div class="watermark-position">
              <button 
                v-for="pos in watermarkPositions"
                :key="pos.value"
                class="position-btn"
                :class="{ 'is-active': watermarkPosition === pos.value }"
                @click="watermarkPosition = pos.value"
                :title="pos.label"
              >
                <div class="position-dot"></div>
              </button>
            </div>
          </div>
          
          <div class="option-row">
            <span>嵌入元数据</span>
            <button 
              class="toggle-switch"
              :class="{ 'is-on': embedMetadata }"
              @click="embedMetadata = !embedMetadata"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>

          <div class="option-row">
            <span>颜色配置文件</span>
            <select v-model="colorProfile" class="inline-select">
              <option value="srgb">sRGB</option>
              <option value="adobe-rgb">Adobe RGB</option>
              <option value="display-p3">Display P3</option>
            </select>
          </div>
        </div>
      </transition>
    </div>

    <!-- 导出按钮 -->
    <div class="export-actions">
      <button class="btn btn-outline" @click="$emit('cancel')">
        取消
      </button>
      <button class="btn btn-primary" @click="handleExport" :disabled="isExporting">
        <IconLib v-if="isExporting" name="loader" :size="18" class="spin" />
        <IconLib v-else name="download" :size="18" />
        {{ isExporting ? '导出中...' : '导出文档' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from './icons/IconLibrary.vue'

const props = defineProps<{
  documentName?: string
  initialWidth?: number
  initialHeight?: number
}>()

const emit = defineEmits<{
  export: [options: ExportConfig]
  cancel: []
}>()

interface ExportConfig {
  format: string
  quality: number
  width: number
  height: number
  dpi: number
  transparentBg: boolean
  addWatermark: boolean
  watermarkText: string
  watermarkPosition: string
  embedMetadata: boolean
  colorProfile: string
}

// 格式选项
const formats = [
  { value: 'png', name: 'PNG', description: '无损压缩，支持透明', icon: 'image', color: '#4B6EF5' },
  { value: 'jpg', name: 'JPG', description: '小文件，适合照片', icon: 'image', color: '#10b981' },
  { value: 'pdf', name: 'PDF', description: '便于打印分享', icon: 'file-text', color: '#ef4444' },
  { value: 'svg', name: 'SVG', description: '矢量图，可无限缩放', icon: 'code', color: '#f59e0b' }
]

// 质量预设
const qualityPresets = [
  { value: 60, label: '低' },
  { value: 80, label: '中' },
  { value: 90, label: '高' },
  { value: 100, label: '最佳' }
]

// 尺寸预设
const sizePresets = [
  { value: 0.5, label: '50%' },
  { value: 1, label: '100%' },
  { value: 1.5, label: '150%' },
  { value: 2, label: '200%' }
]

// 水印位置
const watermarkPositions = [
  { value: 'top-left', label: '左上' },
  { value: 'top-center', label: '上中' },
  { value: 'top-right', label: '右上' },
  { value: 'center-left', label: '左中' },
  { value: 'center', label: '中心' },
  { value: 'center-right', label: '右中' },
  { value: 'bottom-left', label: '左下' },
  { value: 'bottom-center', label: '下中' },
  { value: 'bottom-right', label: '右下' }
]

// 状态
const selectedFormat = ref('png')
const quality = ref(90)
const width = ref(props.initialWidth || 800)
const height = ref(props.initialHeight || 600)
const sizeScale = ref(1)
const dpi = ref(150)
const lockRatio = ref(true)
const showAdvanced = ref(false)
const transparentBg = ref(false)
const addWatermark = ref(false)
const watermarkText = ref('')
const watermarkPosition = ref('bottom-right')
const embedMetadata = ref(true)
const colorProfile = ref('srgb')
const isExporting = ref(false)

// 原始尺寸
const originalWidth = props.initialWidth || 800
const originalHeight = props.initialHeight || 600
const aspectRatio = originalWidth / originalHeight

// 显示质量选项（仅 JPG）
const showQualityOption = computed(() => {
  return selectedFormat.value === 'jpg' || selectedFormat.value === 'png'
})

// 预估文件大小
const estimatedSize = computed(() => {
  const pixels = width.value * height.value
  let baseSize = pixels * 4 // RGBA

  switch (selectedFormat.value) {
    case 'jpg':
      return Math.round(baseSize * (quality.value / 100) * 0.1)
    case 'png':
      return Math.round(baseSize * 0.3)
    case 'pdf':
      return Math.round(baseSize * 0.25)
    case 'svg':
      return Math.round(pixels * 0.01)
    default:
      return baseSize
  }
})

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 监听尺寸比例变化
watch(sizeScale, (scale) => {
  width.value = Math.round(originalWidth * scale)
  height.value = Math.round(originalHeight * scale)
})

// 锁定比例时同步尺寸
watch(width, (newWidth, oldWidth) => {
  if (lockRatio.value && oldWidth !== newWidth) {
    height.value = Math.round(newWidth / aspectRatio)
  }
})

watch(height, (newHeight, oldHeight) => {
  if (lockRatio.value && oldHeight !== newHeight) {
    width.value = Math.round(newHeight * aspectRatio)
  }
})

// 导出处理
const handleExport = async () => {
  isExporting.value = true
  
  const config: ExportConfig = {
    format: selectedFormat.value,
    quality: quality.value,
    width: width.value,
    height: height.value,
    dpi: dpi.value,
    transparentBg: transparentBg.value,
    addWatermark: addWatermark.value,
    watermarkText: watermarkText.value,
    watermarkPosition: watermarkPosition.value,
    embedMetadata: embedMetadata.value,
    colorProfile: colorProfile.value
  }
  
  // 模拟导出延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  emit('export', config)
  isExporting.value = false
}
</script>

<style scoped>
.export-options {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

/* 头部 */
.export-header {
  margin-bottom: 2rem;
}

.export-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
}

.export-header p {
  margin: 0.5rem 0 0;
  color: var(--text-color-secondary, #666);
}

/* 预览区域 */
.preview-section {
  margin-bottom: 2rem;
}

.preview-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-color-secondary, #f9fafb);
  border-radius: 12px;
}

.preview-image {
  width: 120px;
  height: 90px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color-muted, #9ca3af);
}

.preview-placeholder span {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.preview-info h3 {
  margin: 0;
  font-size: 1rem;
}

.info-meta {
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
}

.info-meta .dot {
  margin: 0 0.5rem;
}

/* 选项区域 */
.option-section {
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
}

/* 格式选择 */
.format-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.format-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #fff;
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.format-card:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.format-card.is-selected {
  border-color: var(--primary-color, #4B6EF5);
  background: var(--primary-color-light, #eff1ff);
}

.format-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  color: #fff;
  flex-shrink: 0;
}

.format-info {
  flex: 1;
  min-width: 0;
}

.format-name {
  display: block;
  font-weight: 600;
}

.format-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
}

.format-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--primary-color, #4B6EF5);
  border-radius: 50%;
  color: #fff;
}

/* 质量控制 */
.quality-control {
  background: var(--bg-color-secondary, #f9fafb);
  border-radius: 10px;
  padding: 1rem;
}

.quality-presets,
.size-presets {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preset-btn {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.8125rem;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.preset-btn.is-active {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.quality-slider {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider {
  flex: 1;
  height: 4px;
  appearance: none;
  background: var(--border-color, #d1d5db);
  border-radius: 2px;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  appearance: none;
  background: var(--primary-color, #4B6EF5);
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  min-width: 3em;
  font-weight: 600;
  text-align: right;
}

.quality-info {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  font-size: 0.8125rem;
}

.info-label {
  color: var(--text-color-secondary, #666);
}

.info-value {
  font-weight: 600;
}

/* 尺寸控制 */
.size-control {
  background: var(--bg-color-secondary, #f9fafb);
  border-radius: 10px;
  padding: 1rem;
}

.size-custom {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
}

.input-with-unit {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  overflow: hidden;
}

.input-with-unit input {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: none;
  outline: none;
  width: 100%;
}

.input-with-unit span {
  padding: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
  background: var(--bg-color-secondary, #f3f4f6);
}

.link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-color-muted, #9ca3af);
}

.link-btn.is-linked {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.dpi-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dpi-control label {
  font-size: 0.875rem;
}

.dpi-control select {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

/* 高级选项 */
.advanced-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  background: var(--bg-color-secondary, #f9fafb);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.advanced-toggle:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.advanced-options {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-color-secondary, #f9fafb);
  border-radius: 10px;
}

.option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.option-row:last-child {
  border-bottom: none;
}

.option-row span {
  font-size: 0.9375rem;
}

.toggle-switch {
  position: relative;
  width: 40px;
  height: 22px;
  padding: 0;
  background: var(--border-color, #d1d5db);
  border: none;
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.is-on {
  background: var(--primary-color, #4B6EF5);
}

.toggle-switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-switch.is-on .toggle-slider {
  left: 20px;
}

.inline-select {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background: #fff;
}

/* 水印设置 */
.watermark-settings {
  padding: 0.75rem 0;
}

.watermark-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.watermark-position {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  width: 80px;
  margin: 0 auto;
}

.position-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
  cursor: pointer;
}

.position-btn.is-active {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
}

.position-dot {
  width: 6px;
  height: 6px;
  background: var(--text-color-muted, #9ca3af);
  border-radius: 50%;
}

.position-btn.is-active .position-dot {
  background: #fff;
}

/* 导出按钮 */
.export-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

/* 动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-color, #4B6EF5);
  border: 1px solid var(--primary-color, #4B6EF5);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-color-dark, #3a5ce4);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-color-primary, #333);
}

.btn-outline:hover {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}
</style>
