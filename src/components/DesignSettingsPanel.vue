<template>
  <div class="design-settings-panel">
    <!-- 水印设置 -->
    <div class="settings-section">
      <div class="section-header" @click="toggleSection('watermark')">
        <span class="section-icon">💧</span>
        <span class="section-title">水印设置</span>
        <span class="toggle-icon">{{ expandedSections.watermark ? '▼' : '▶' }}</span>
      </div>
      <div v-show="expandedSections.watermark" class="section-content">
        <label class="checkbox-option">
          <input type="checkbox" v-model="settings.watermarkEnabled" />
          <span>启用水印</span>
        </label>
        <template v-if="settings.watermarkEnabled">
          <div class="form-group">
            <label>水印文字</label>
            <input type="text" v-model="settings.watermarkText" placeholder="OFFICIAL DOCUMENT" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>颜色</label>
              <input type="color" v-model="settings.watermarkColor" />
            </div>
            <div class="form-group">
              <label>透明度: {{ settings.watermarkOpacity }}%</label>
              <input type="range" v-model.number="settings.watermarkOpacity" min="5" max="50" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>字号</label>
              <input type="number" v-model.number="settings.watermarkSize" min="20" max="100" />
            </div>
            <div class="form-group">
              <label>角度</label>
              <input type="number" v-model.number="settings.watermarkAngle" min="-90" max="90" />
            </div>
          </div>
          <div class="form-group">
            <label>水印字体</label>
            <select v-model="settings.watermarkFontFamily">
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>
          <div class="form-group">
            <label class="checkbox-option">

              <span>覆盖文本（水印显示在内容上方）</span>
            </label>
          </div>
        </template>
      </div>
    </div>

    <!-- 字体设置 -->
    <div class="settings-section">
      <div class="section-header" @click="toggleSection('font')">
        <span class="section-icon">🔤</span>
        <span class="section-title">字体设置</span>
        <span class="toggle-icon">{{ expandedSections.font ? '▼' : '▶' }}</span>
      </div>
      <div v-show="expandedSections.font" class="section-content">
        <div class="form-group">
          <label>主字体</label>
          <select v-model="settings.fontFamily">
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
            <option value="'SimSun', serif">宋体</option>
            <option value="'PingFang SC', sans-serif">苹方</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>文字颜色</label>
            <input type="color" v-model="settings.textColor" />
          </div>
          <div class="form-group">
            <label>标题颜色</label>
            <input type="color" v-model="settings.titleColor" />
          </div>
        </div>
        <div class="form-group">
          <label>背景颜色</label>
          <input type="color" v-model="settings.bgColor" />
        </div>
      </div>
    </div>

    <!-- 边框设置 -->
    <div class="settings-section">
      <div class="section-header" @click="toggleSection('border')">
        <span class="section-icon">🔲</span>
        <span class="section-title">边框设置</span>
        <span class="toggle-icon">{{ expandedSections.border ? '▼' : '▶' }}</span>
      </div>
      <div v-show="expandedSections.border" class="section-content">
        <label class="checkbox-option">
          <input type="checkbox" v-model="settings.borderEnabled" />
          <span>启用边框</span>
        </label>
        <template v-if="settings.borderEnabled">
          <div class="form-row">
            <div class="form-group">
              <label>边框颜色</label>
              <input type="color" v-model="settings.borderColor" />
            </div>
            <div class="form-group">
              <label>边框宽度</label>
              <input type="number" v-model.number="settings.borderWidth" min="1" max="10" />
            </div>
          </div>
          <div class="form-group">
            <label>边框样式</label>
            <select v-model="settings.borderStyle">
              <option value="solid">实线</option>
              <option value="dashed">虚线</option>
              <option value="dotted">点线</option>
              <option value="double">双线</option>
              <option value="groove">凹槽</option>
              <option value="ridge">凸起</option>
            </select>
          </div>
        </template>
      </div>
    </div>

    <!-- 官印设置 -->
    <div class="settings-section">
      <div class="section-header" @click="toggleSection('seal')">
        <span class="section-icon">🔴</span>
        <span class="section-title">官印设置</span>
        <span class="toggle-icon">{{ expandedSections.seal ? '▼' : '▶' }}</span>
      </div>
      <div v-show="expandedSections.seal" class="section-content">
        <label class="checkbox-option">
          <input type="checkbox" v-model="settings.sealEnabled" />
          <span>显示官印</span>
        </label>
        <template v-if="settings.sealEnabled">
          <div class="form-group">
            <label>印章类型</label>
            <select v-model="settings.sealType">
              <option value="circle">圆形印章</option>
              <option value="square">方形印章</option>
              <option value="oval">椭圆印章</option>
              <option value="custom">自定义图片</option>
            </select>
          </div>
          <template v-if="settings.sealType !== 'custom'">
            <div class="form-group">
              <label>印章文字</label>
              <input type="text" v-model="settings.sealText" placeholder="OFFICIAL SEAL" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>印章颜色</label>
                <input type="color" v-model="settings.sealColor" />
              </div>
              <div class="form-group">
                <label>印章大小</label>
                <input type="number" v-model.number="settings.sealSize" min="60" max="200" />
              </div>
            </div>
            <div class="form-group">
              <label>透明度: {{ settings.sealOpacity }}%</label>
              <input type="range" v-model.number="settings.sealOpacity" min="30" max="100" />
            </div>
          </template>
          <template v-else>
            <div class="form-group">
              <label>上传印章图片</label>
              <input type="file" accept="image/*" @change="handleSealUpload" />
            </div>
            <div v-if="settings.sealImage" class="seal-preview">
              <img :src="settings.sealImage" />
              <button @click="settings.sealImage = ''" class="btn-remove">删除</button>
            </div>
          </template>
          <div class="form-group">
            <label>印章位置</label>
            <select v-model="settings.sealPosition">
              <option value="bottom-right">右下角</option>
              <option value="bottom-left">左下角</option>
              <option value="bottom-center">底部居中</option>
              <option value="center">居中</option>
            </select>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

export interface DesignSettings {
  // 水印
  watermarkEnabled: boolean
  watermarkText: string
  watermarkColor: string
  watermarkOpacity: number
  watermarkSize: number
  watermarkAngle: number
  watermarkFontFamily: string
  watermarkOverlay?: boolean
  // 字体
  fontFamily: string
  textColor: string
  titleColor: string
  bgColor: string
  
  // 边框
  borderEnabled: boolean
  borderColor: string
  borderWidth: number
  borderStyle: string
  
  // 官印
  sealEnabled: boolean
  sealType: 'circle' | 'square' | 'oval' | 'custom'
  sealText: string
  sealColor: string
  sealSize: number
  sealOpacity: number
  sealImage: string
  sealPosition: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center'
}

const props = defineProps<{
  modelValue: DesignSettings
}>()

const emit = defineEmits(['update:modelValue'])

const defaultSettings: DesignSettings = {
  watermarkEnabled: false,
  watermarkText: 'OFFICIAL DOCUMENT',
  watermarkColor: '#cccccc',
  watermarkOpacity: 15,
  watermarkSize: 48,
  watermarkAngle: -30,
  watermarkFontFamily: 'Arial',
  watermarkOverlay: false,
  fontFamily: 'Arial, sans-serif',
  textColor: '#1f2937',
  titleColor: '#1e40af',
  bgColor: '#ffffff',
  borderEnabled: true,
  borderColor: '#1e40af',
  borderWidth: 2,
  borderStyle: 'solid',
  sealEnabled: false,
  sealType: 'circle',
  sealText: 'OFFICIAL SEAL',
  sealColor: '#dc2626',
  sealSize: 100,
  sealOpacity: 80,
  sealImage: '',
  sealPosition: 'bottom-right'
}

const settings = reactive<DesignSettings>({
  ...defaultSettings,
  ...props.modelValue
})

const expandedSections = reactive({
  watermark: true,
  font: false,
  border: false,
  seal: false
})

const toggleSection = (section: keyof typeof expandedSections) => {
  expandedSections[section] = !expandedSections[section]
}

const handleSealUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      settings.sealImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

watch(settings, (newVal) => {
  emit('update:modelValue', { ...newVal })
}, { deep: true })
</script>

<style scoped>
.design-settings-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-section {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f9fafb;
  cursor: pointer;
  user-select: none;
}

.section-header:hover {
  background: #f3f4f6;
}

.section-icon {
  font-size: 16px;
}

.section-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.toggle-icon {
  font-size: 10px;
  color: #6b7280;
}

.section-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

.form-group input[type="color"] {
  width: 100%;
  height: 36px;
  padding: 4px;
}

.form-group input[type="range"] {
  width: 100%;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}

.seal-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.seal-preview img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.btn-remove {
  padding: 6px 12px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
</style>
