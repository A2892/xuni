<script setup lang="ts">
import { ref } from 'vue'
import { useSealStore } from '@/stores/seal'
import OfficialSealPreview from '@/components/OfficialSealPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'

const store = useSealStore()
const activeTab = ref('基本信息')

const tabs = ['基本信息', '样式设置', '高级选项', '数据管理']

const sealTypes = ['行政章', '公章', '财务专用章', '合同专用章', '发票专用章', '业务专用章']
const sealShapes = [
  { value: 'circular', label: '圆形' },
  { value: 'ellipse', label: '椭圆形' },
  { value: 'square', label: '方形' }
]
const textArrangements = [
  { value: 'circular', label: '环形排列' },
  { value: 'horizontal', label: '横向排列' }
]
const fontFamilies = ['宋体', '黑体', '楷体', '仿宋']
const inkEffects = [
  { value: 'normal', label: '正常' },
  { value: 'stamp', label: '盖章效果' },
  { value: 'faded', label: '褪色效果' }
]

// 导出官印为PNG
const downloadSeal = () => {
  const svg = document.querySelector('.official-seal') as SVGElement
  if (!svg) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const scaleFactor = 4 // 高清导出
  canvas.width = store.sealInfo.sealSize * scaleFactor
  canvas.height = store.sealInfo.sealSize * scaleFactor

  const data = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  img.onload = () => {
    ctx.scale(scaleFactor, scaleFactor)
    ctx.drawImage(img, 0, 0)
    
    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a')
        link.download = `${store.sealInfo.organizationName}-官印.png`
        link.href = URL.createObjectURL(blob)
        link.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  }
  img.src = url
}

// 导出为SVG
const downloadSVG = () => {
  const svg = document.querySelector('.official-seal') as SVGElement
  if (!svg) return

  const data = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.download = `${store.sealInfo.organizationName}-官印.svg`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

// 应用预设
const applyPreset = (preset: any) => {
  store.applyPreset(preset)
}

// 重置为默认
const resetToDefault = () => {
  if (confirm('确定要重置为默认设置吗？')) {
    store.resetToDefault()
  }
}
</script>

<template>
  <div class="seal-view">
    <div class="content-wrapper">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <div class="panel-header">
          <h2>官印生成器</h2>
          <p>创建真实的中国官方印章</p>
        </div>

        <!-- 标签页导航 -->
        <div class="tab-navigation">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="['tab-btn', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <!-- 基本信息 -->
        <div v-show="activeTab === '基本信息'" class="tab-content">
          <div class="form-group">
            <label>单位名称 *</label>
            <input
              v-model="store.sealInfo.organizationName"
              type="text"
              placeholder="请输入单位名称"
              maxlength="30"
            />
            <small>{{ store.sealInfo.organizationName.length }}/30</small>
          </div>

          <div class="form-group">
            <label>印章类型</label>
            <select v-model="store.sealInfo.sealType">
              <option v-for="type in sealTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>印章编号</label>
            <input
              v-model="store.sealInfo.sealNumber"
              type="text"
              placeholder="NO.123456789"
            />
          </div>

          <div class="form-group">
            <label>底部文字</label>
            <input
              v-model="store.sealInfo.bottomText"
              type="text"
              placeholder="可选，如：财务专用章"
            />
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input v-model="store.sealInfo.showStar" type="checkbox" />
              显示五角星
            </label>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input v-model="store.sealInfo.showSerialNumber" type="checkbox" />
              显示编号
            </label>
          </div>

          <!-- 预设模板 -->
          <div class="presets-section">
            <h3>快速预设 - 中国学校</h3>
            <div class="preset-buttons">
              <button
                v-for="preset in store.presetSeals.slice(0, 4)"
                :key="preset.name"
                class="preset-btn"
                @click="applyPreset(preset)"
              >
                {{ preset.name }}
              </button>
            </div>
          </div>

          <div class="presets-section">
            <h3>快速预设 - 英国大学</h3>
            <div class="preset-buttons uk-presets">
              <button
                v-for="preset in store.presetSeals.slice(4)"
                :key="preset.name"
                class="preset-btn uk-preset-btn"
                @click="applyPreset(preset)"
              >
                {{ preset.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- 样式设置 -->
        <div v-show="activeTab === '样式设置'" class="tab-content">
          <div class="form-group">
            <label>印章形状</label>
            <select v-model="store.sealInfo.sealShape">
              <option v-for="shape in sealShapes" :key="shape.value" :value="shape.value">
                {{ shape.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>印章尺寸: {{ store.sealInfo.sealSize }}px</label>
            <input
              v-model.number="store.sealInfo.sealSize"
              type="range"
              min="150"
              max="400"
              step="10"
            />
          </div>

          <div class="form-group">
            <label>外圆直径: {{ store.sealInfo.outerDiameter }}px</label>
            <input
              v-model.number="store.sealInfo.outerDiameter"
              type="range"
              min="120"
              max="380"
              step="5"
            />
          </div>

          <div class="form-group">
            <label>内圆直径: {{ store.sealInfo.innerDiameter }}px</label>
            <input
              v-model.number="store.sealInfo.innerDiameter"
              type="range"
              min="100"
              max="360"
              step="5"
            />
          </div>

          <div class="form-group">
            <label>边框宽度: {{ store.sealInfo.borderWidth }}px</label>
            <input
              v-model.number="store.sealInfo.borderWidth"
              type="range"
              min="1"
              max="8"
              step="0.5"
            />
          </div>

          <div class="form-group">
            <label>五角星大小: {{ store.sealInfo.starSize }}px</label>
            <input
              v-model.number="store.sealInfo.starSize"
              type="range"
              min="15"
              max="60"
              step="1"
            />
          </div>

          <div class="form-group">
            <label>边框颜色</label>
            <div class="color-input-group">
              <input
                v-model="store.sealInfo.borderColor"
                type="color"
              />
              <input
                v-model="store.sealInfo.borderColor"
                type="text"
                placeholder="#D32F2F"
              />
            </div>
          </div>

          <div class="form-group">
            <label>文字颜色</label>
            <div class="color-input-group">
              <input
                v-model="store.sealInfo.textColor"
                type="color"
              />
              <input
                v-model="store.sealInfo.textColor"
                type="text"
                placeholder="#D32F2F"
              />
            </div>
          </div>

          <div class="form-group">
            <label>星形颜色</label>
            <div class="color-input-group">
              <input
                v-model="store.sealInfo.starColor"
                type="color"
              />
              <input
                v-model="store.sealInfo.starColor"
                type="text"
                placeholder="#D32F2F"
              />
            </div>
          </div>
        </div>

        <!-- 高级选项 -->
        <div v-show="activeTab === '高级选项'" class="tab-content">
          <div class="form-group">
            <label>文字大小: {{ store.sealInfo.fontSize }}px</label>
            <input
              v-model.number="store.sealInfo.fontSize"
              type="range"
              min="12"
              max="28"
              step="1"
            />
          </div>

          <div class="form-group">
            <label>文字排列</label>
            <select v-model="store.sealInfo.textArrangement">
              <option v-for="arr in textArrangements" :key="arr.value" :value="arr.value">
                {{ arr.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>字体</label>
            <select v-model="store.sealInfo.fontFamily">
              <option v-for="font in fontFamilies" :key="font" :value="font">
                {{ font }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>墨迹效果</label>
            <select v-model="store.sealInfo.inkEffect">
              <option v-for="effect in inkEffects" :key="effect.value" :value="effect.value">
                {{ effect.label }}
              </option>
            </select>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input v-model="store.sealInfo.enableEmbossEffect" type="checkbox" />
              启用浮雕效果
            </label>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input v-model="store.sealInfo.enableTexture" type="checkbox" />
              启用纹理效果
            </label>
          </div>

          <div v-if="store.sealInfo.enableTexture" class="form-group">
            <label>纹理强度: {{ store.sealInfo.textureOpacity }}%</label>
            <input
              v-model.number="store.sealInfo.textureOpacity"
              type="range"
              min="0"
              max="50"
              step="5"
            />
          </div>

          <div class="form-group">
            <label>旋转角度: {{ store.sealInfo.rotationAngle }}°</label>
            <input
              v-model.number="store.sealInfo.rotationAngle"
              type="range"
              min="0"
              max="360"
              step="5"
            />
          </div>
        </div>

        <!-- 数据管理 -->
        <div v-show="activeTab === '数据管理'" class="tab-content">
          <SaveLoadPanel 
            document-type="official_seal"
            :get-data="() => store.$state"
            :set-data="(data: any) => store.$patch(data)"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="btn-primary" @click="downloadSeal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            导出为PNG
          </button>
          <button class="btn-secondary" @click="downloadSVG">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            导出为SVG
          </button>
          <button class="btn-outline" @click="resetToDefault">
            重置设置
          </button>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>实时预览</h3>
          <div class="preview-tips">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>实时预览官印效果和文档使用示例</span>
          </div>
        </div>
        
        <OfficialSealPreview />
      </div>
    </div>
  </div>
</template>

<style scoped>
.seal-view {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #f8f9fa;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

/* 配置面板 */
.config-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.panel-header {
  background: linear-gradient(135deg, #D32F2F 0%, #C62828 100%);
  color: white;
  padding: 24px;
}

.panel-header h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 600;
}

.panel-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.tab-navigation {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.tab-btn {
  flex: 1;
  padding: 14px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab-btn:hover {
  color: #D32F2F;
  background: rgba(211, 47, 47, 0.05);
}

.tab-btn.active {
  color: #D32F2F;
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #D32F2F;
}

.tab-content {
  padding: 24px;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input[type="text"]:focus,
.form-group select:focus {
  outline: none;
  border-color: #D32F2F;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
}

.form-group input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.form-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #D32F2F;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.form-group input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #D32F2F;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.form-group small {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.color-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-input-group input[type="color"] {
  width: 50px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.color-input-group input[type="text"] {
  flex: 1;
}

/* 预设模板 */
.presets-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.presets-section h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.preset-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.uk-presets {
  grid-template-columns: repeat(2, 1fr);
}

.preset-btn {
  padding: 10px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #D32F2F;
  color: white;
  border-color: #D32F2F;
}

.uk-preset-btn:hover {
  background: #003E74;
  border-color: #003E74;
}

/* 操作按钮 */
.action-buttons {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-buttons button {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: #D32F2F;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #B71C1C;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.btn-secondary {
  background: #666;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background: #555;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-outline {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  border-color: #D32F2F;
  color: #D32F2F;
  background: rgba(211, 47, 47, 0.05);
}

/* 预览面板 */
.preview-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 24px;
  height: fit-content;
}

.preview-header {
  margin-bottom: 24px;
}

.preview-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.preview-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #e3f2fd;
  border-radius: 8px;
  color: #1976d2;
  font-size: 13px;
}

.preview-tips svg {
  flex-shrink: 0;
}

/* 滚动条样式 */
.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}

@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .config-panel {
    position: static;
  }
}
</style>
