<template>
  <div class="print-preview">
    <!-- 工具栏 -->
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" @click="zoomOut" :disabled="zoom <= 50">
          <IconLib name="minus" :size="16" />
        </button>
        <span class="zoom-value">{{ zoom }}%</span>
        <button class="tool-btn" @click="zoomIn" :disabled="zoom >= 200">
          <IconLib name="plus" :size="16" />
        </button>
        <button class="tool-btn" @click="resetZoom">
          <IconLib name="refresh" :size="16" />
        </button>
      </div>
      
      <div class="toolbar-center">
        <select v-model="paperSize" class="paper-select">
          <option value="a4">A4 (210 × 297 mm)</option>
          <option value="a3">A3 (297 × 420 mm)</option>
          <option value="a5">A5 (148 × 210 mm)</option>
          <option value="letter">Letter (8.5 × 11 in)</option>
          <option value="legal">Legal (8.5 × 14 in)</option>
        </select>
        
        <div class="orientation-btns">
          <button 
            :class="['orient-btn', { active: orientation === 'portrait' }]"
            @click="orientation = 'portrait'"
          >
            <IconLib name="file" :size="14" />
            纵向
          </button>
          <button 
            :class="['orient-btn', { active: orientation === 'landscape' }]"
            @click="orientation = 'landscape'"
          >
            <IconLib name="file" :size="14" style="transform: rotate(90deg)" />
            横向
          </button>
        </div>
      </div>
      
      <div class="toolbar-right">
        <button class="tool-btn" @click="toggleColorMode">
          <IconLib :name="colorMode === 'color' ? 'palette' : 'moon'" :size="16" />
          {{ colorMode === 'color' ? '彩色' : '灰度' }}
        </button>
        <button class="primary-btn" @click="handlePrint">
          <IconLib name="printer" :size="16" />
          打印
        </button>
      </div>
    </div>
    
    <!-- 预览区域 -->
    <div class="preview-container" ref="containerRef">
      <div 
        class="preview-pages"
        :style="{ transform: `scale(${zoom / 100})` }"
      >
        <!-- 页面 -->
        <div 
          v-for="page in totalPages" 
          :key="page"
          :class="['preview-page', paperSize, orientation, colorMode]"
          :style="pageStyles"
        >
          <!-- 页眉 -->
          <div v-if="showHeader" class="page-header">
            <div class="header-left">{{ headerLeft }}</div>
            <div class="header-center">{{ headerCenter }}</div>
            <div class="header-right">{{ headerRight }}</div>
          </div>
          
          <!-- 内容 -->
          <div class="page-content">
            <slot :page="page" :totalPages="totalPages">
              <div class="content-placeholder">
                <p>第 {{ page }} 页</p>
                <p class="hint">打印内容将显示在此处</p>
              </div>
            </slot>
          </div>
          
          <!-- 页脚 -->
          <div v-if="showFooter" class="page-footer">
            <div class="footer-left">{{ footerLeft }}</div>
            <div class="footer-center">
              {{ showPageNumber ? `第 ${page} 页 / 共 ${totalPages} 页` : footerCenter }}
            </div>
            <div class="footer-right">{{ footerRight }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 页面导航 -->
    <div v-if="totalPages > 1" class="page-navigation">
      <button 
        class="nav-btn" 
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
      >
        <IconLib name="chevron-left" :size="16" />
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        class="nav-btn" 
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
      >
        <IconLib name="chevron-right" :size="16" />
      </button>
    </div>
    
    <!-- 设置面板 -->
    <transition name="slide">
      <div v-if="showSettings" class="settings-panel">
        <div class="settings-header">
          <h3>打印设置</h3>
          <button class="close-btn" @click="showSettings = false">
            <IconLib name="x" :size="18" />
          </button>
        </div>
        
        <div class="settings-body">
          <!-- 边距设置 -->
          <div class="setting-group">
            <label class="setting-label">页边距</label>
            <div class="margin-inputs">
              <div class="margin-input">
                <span>上</span>
                <input type="number" v-model.number="margins.top" min="0" max="50" />
                <span>mm</span>
              </div>
              <div class="margin-input">
                <span>下</span>
                <input type="number" v-model.number="margins.bottom" min="0" max="50" />
                <span>mm</span>
              </div>
              <div class="margin-input">
                <span>左</span>
                <input type="number" v-model.number="margins.left" min="0" max="50" />
                <span>mm</span>
              </div>
              <div class="margin-input">
                <span>右</span>
                <input type="number" v-model.number="margins.right" min="0" max="50" />
                <span>mm</span>
              </div>
            </div>
          </div>
          
          <!-- 页眉页脚 -->
          <div class="setting-group">
            <label class="setting-label">
              <input type="checkbox" v-model="showHeader" />
              显示页眉
            </label>
            <div v-if="showHeader" class="header-inputs">
              <input v-model="headerLeft" placeholder="左侧" />
              <input v-model="headerCenter" placeholder="中间" />
              <input v-model="headerRight" placeholder="右侧" />
            </div>
          </div>
          
          <div class="setting-group">
            <label class="setting-label">
              <input type="checkbox" v-model="showFooter" />
              显示页脚
            </label>
            <div v-if="showFooter" class="footer-inputs">
              <label>
                <input type="checkbox" v-model="showPageNumber" />
                显示页码
              </label>
            </div>
          </div>
          
          <!-- 打印选项 -->
          <div class="setting-group">
            <label class="setting-label">打印选项</label>
            <div class="print-options">
              <label>
                <input type="checkbox" v-model="printBackground" />
                打印背景颜色和图像
              </label>
              <label>
                <input type="checkbox" v-model="shrinkToFit" />
                缩小以适应页面
              </label>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 设置按钮 -->
    <button class="settings-trigger" @click="showSettings = !showSettings">
      <IconLib name="settings" :size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Props
interface Props {
  totalPages?: number
  defaultZoom?: number
  defaultPaperSize?: 'a4' | 'a3' | 'a5' | 'letter' | 'legal'
  defaultOrientation?: 'portrait' | 'landscape'
}

const props = withDefaults(defineProps<Props>(), {
  totalPages: 1,
  defaultZoom: 100,
  defaultPaperSize: 'a4',
  defaultOrientation: 'portrait'
})

// Emits
const emit = defineEmits<{
  print: []
  pageChange: [page: number]
  settingsChange: [settings: PrintSettings]
}>()

// Types
interface PrintSettings {
  paperSize: string
  orientation: string
  margins: { top: number; bottom: number; left: number; right: number }
  colorMode: string
  showHeader: boolean
  showFooter: boolean
  printBackground: boolean
  shrinkToFit: boolean
}

// Refs
const containerRef = ref<HTMLElement | null>(null)

// State
const zoom = ref(props.defaultZoom)
const paperSize = ref(props.defaultPaperSize)
const orientation = ref(props.defaultOrientation)
const colorMode = ref<'color' | 'grayscale'>('color')
const currentPage = ref(1)
const showSettings = ref(false)

const margins = ref({
  top: 20,
  bottom: 20,
  left: 20,
  right: 20
})

const showHeader = ref(false)
const headerLeft = ref('')
const headerCenter = ref('')
const headerRight = ref('')

const showFooter = ref(true)
const footerLeft = ref('')
const footerCenter = ref('')
const footerRight = ref('')
const showPageNumber = ref(true)

const printBackground = ref(true)
const shrinkToFit = ref(false)

// Computed
const pageStyles = computed(() => {
  return {
    padding: `${margins.value.top}mm ${margins.value.right}mm ${margins.value.bottom}mm ${margins.value.left}mm`
  }
})

// Methods
function zoomIn() {
  zoom.value = Math.min(200, zoom.value + 10)
}

function zoomOut() {
  zoom.value = Math.max(50, zoom.value - 10)
}

function resetZoom() {
  zoom.value = 100
}

function toggleColorMode() {
  colorMode.value = colorMode.value === 'color' ? 'grayscale' : 'color'
}

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages) {
    currentPage.value = page
    emit('pageChange', page)
  }
}

function handlePrint() {
  emit('print')
  
  // 创建打印样式
  const printStyles = document.createElement('style')
  printStyles.id = 'print-styles'
  printStyles.textContent = `
    @media print {
      body * {
        visibility: hidden;
      }
      .preview-page, .preview-page * {
        visibility: visible;
      }
      .preview-page {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }
      @page {
        size: ${paperSize.value} ${orientation.value};
        margin: ${margins.value.top}mm ${margins.value.right}mm ${margins.value.bottom}mm ${margins.value.left}mm;
      }
    }
  `
  
  document.head.appendChild(printStyles)
  window.print()
  
  setTimeout(() => {
    document.head.removeChild(printStyles)
  }, 1000)
}

// Watchers
watch(
  [paperSize, orientation, margins, colorMode, showHeader, showFooter, printBackground, shrinkToFit],
  () => {
    emit('settingsChange', {
      paperSize: paperSize.value,
      orientation: orientation.value,
      margins: margins.value,
      colorMode: colorMode.value,
      showHeader: showHeader.value,
      showFooter: showFooter.value,
      printBackground: printBackground.value,
      shrinkToFit: shrinkToFit.value
    })
  },
  { deep: true }
)
</script>

<style scoped>
.print-preview {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  gap: 16px;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: all 0.2s;
}

.tool-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-value {
  min-width: 50px;
  text-align: center;
  font-size: 13px;
  color: #666;
}

.paper-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
}

.orientation-btns {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.orient-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
}

.orient-btn:first-child {
  border-right: 1px solid #e0e0e0;
}

.orient-btn.active {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: var(--primary-color, #4B6EF5);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  opacity: 0.9;
}

.preview-container {
  flex: 1;
  overflow: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
}

.preview-pages {
  display: flex;
  flex-direction: column;
  gap: 24px;
  transform-origin: top center;
  transition: transform 0.2s;
}

.preview-page {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 纸张尺寸 */
.preview-page.a4.portrait {
  width: 210mm;
  min-height: 297mm;
}

.preview-page.a4.landscape {
  width: 297mm;
  min-height: 210mm;
}

.preview-page.a3.portrait {
  width: 297mm;
  min-height: 420mm;
}

.preview-page.a3.landscape {
  width: 420mm;
  min-height: 297mm;
}

.preview-page.a5.portrait {
  width: 148mm;
  min-height: 210mm;
}

.preview-page.a5.landscape {
  width: 210mm;
  min-height: 148mm;
}

.preview-page.letter.portrait {
  width: 8.5in;
  min-height: 11in;
}

.preview-page.letter.landscape {
  width: 11in;
  min-height: 8.5in;
}

.preview-page.legal.portrait {
  width: 8.5in;
  min-height: 14in;
}

.preview-page.legal.landscape {
  width: 14in;
  min-height: 8.5in;
}

/* 灰度模式 */
.preview-page.grayscale {
  filter: grayscale(100%);
}

.page-header,
.page-footer {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
  padding: 8px 0;
}

.page-header {
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
}

.page-footer {
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
  padding-top: 16px;
}

.page-content {
  flex: 1;
  min-height: 0;
}

.content-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
}

.content-placeholder .hint {
  font-size: 12px;
  margin-top: 8px;
}

.page-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #f5f5f5;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #666;
}

.settings-trigger {
  position: absolute;
  right: 24px;
  bottom: 80px;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: var(--primary-color, #4B6EF5);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-trigger:hover {
  transform: scale(1.05);
}

.settings-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.settings-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  background: #f5f5f5;
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.margin-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.margin-input {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.margin-input input {
  width: 50px;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
}

.header-inputs,
.footer-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-inputs input {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
}

.print-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.print-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

@media print {
  .preview-toolbar,
  .page-navigation,
  .settings-trigger,
  .settings-panel {
    display: none !important;
  }
  
  .preview-container {
    padding: 0;
    overflow: visible;
  }
  
  .preview-pages {
    transform: none !important;
  }
  
  .preview-page {
    box-shadow: none;
    page-break-after: always;
  }
}
</style>
