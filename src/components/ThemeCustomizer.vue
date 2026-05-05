<template>
  <div class="theme-customizer">
    <!-- 触发按钮 -->
    <button class="customizer-trigger" @click="isOpen = !isOpen" :class="{ 'is-open': isOpen }">
      <IconLib name="settings" :size="20" />
    </button>

    <!-- 面板 -->
    <transition name="slide">
      <div v-if="isOpen" class="customizer-panel">
        <div class="panel-header">
          <h3>主题设置</h3>
          <button class="close-btn" @click="isOpen = false">
            <IconLib name="x" :size="18" />
          </button>
        </div>

        <div class="panel-content">
          <!-- 主题模式 -->
          <div class="setting-section">
            <h4>主题模式</h4>
            <div class="theme-modes">
              <button 
                v-for="mode in themeModes"
                :key="mode.value"
                class="mode-card"
                :class="{ 'is-active': currentTheme === mode.value }"
                @click="setTheme(mode.value)"
              >
                <div class="mode-preview" :class="mode.value">
                  <div class="preview-sidebar"></div>
                  <div class="preview-content">
                    <div class="preview-line"></div>
                    <div class="preview-line short"></div>
                  </div>
                </div>
                <span>{{ mode.label }}</span>
              </button>
            </div>
          </div>

          <!-- 主色调 -->
          <div class="setting-section">
            <h4>主色调</h4>
            <div class="color-presets">
              <button 
                v-for="color in colorPresets"
                :key="color.value"
                class="color-preset"
                :class="{ 'is-active': primaryColor === color.value }"
                :style="{ '--preset-color': color.value }"
                @click="setPrimaryColor(color.value)"
                :title="color.label"
              >
                <IconLib v-if="primaryColor === color.value" name="check" :size="14" />
              </button>
            </div>
            <div class="custom-color">
              <label>自定义颜色</label>
              <div class="color-input-wrapper">
                <input 
                  type="color" 
                  v-model="customColor"
                  @change="setPrimaryColor(customColor)"
                  class="color-picker"
                />
                <input 
                  type="text" 
                  v-model="customColor"
                  @change="setPrimaryColor(customColor)"
                  class="color-text"
                  placeholder="#4B6EF5"
                />
              </div>
            </div>
          </div>

          <!-- 圆角大小 -->
          <div class="setting-section">
            <h4>圆角大小</h4>
            <div class="radius-options">
              <button 
                v-for="radius in radiusOptions"
                :key="radius.value"
                class="radius-option"
                :class="{ 'is-active': borderRadius === radius.value }"
                @click="setBorderRadius(radius.value)"
              >
                <div class="radius-preview" :style="{ borderRadius: radius.value + 'px' }"></div>
                <span>{{ radius.label }}</span>
              </button>
            </div>
          </div>

          <!-- 布局 -->
          <div class="setting-section">
            <h4>布局模式</h4>
            <div class="layout-options">
              <button 
                v-for="layout in layoutOptions"
                :key="layout.value"
                class="layout-option"
                :class="{ 'is-active': currentLayout === layout.value }"
                @click="setLayout(layout.value)"
              >
                <div class="layout-preview" :class="layout.value">
                  <div class="layout-sidebar" v-if="layout.value !== 'top'"></div>
                  <div class="layout-header" v-if="layout.value === 'top'"></div>
                  <div class="layout-main"></div>
                </div>
                <span>{{ layout.label }}</span>
              </button>
            </div>
          </div>

          <!-- 动画效果 -->
          <div class="setting-section">
            <h4>动画效果</h4>
            <div class="toggle-setting">
              <span>启用过渡动画</span>
              <button 
                class="toggle-switch"
                :class="{ 'is-on': enableAnimation }"
                @click="toggleAnimation"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
            <div class="toggle-setting">
              <span>页面切换动画</span>
              <button 
                class="toggle-switch"
                :class="{ 'is-on': pageTransition }"
                @click="togglePageTransition"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>

          <!-- 其他选项 -->
          <div class="setting-section">
            <h4>其他选项</h4>
            <div class="toggle-setting">
              <span>显示侧边栏</span>
              <button 
                class="toggle-switch"
                :class="{ 'is-on': showSidebar }"
                @click="showSidebar = !showSidebar"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
            <div class="toggle-setting">
              <span>固定头部</span>
              <button 
                class="toggle-switch"
                :class="{ 'is-on': fixedHeader }"
                @click="fixedHeader = !fixedHeader"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
            <div class="toggle-setting">
              <span>紧凑模式</span>
              <button 
                class="toggle-switch"
                :class="{ 'is-on': compactMode }"
                @click="compactMode = !compactMode"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <button class="btn btn-outline" @click="resetTheme">
            <IconLib name="refresh-cw" :size="16" />
            重置
          </button>
          <button class="btn btn-primary" @click="saveTheme">
            <IconLib name="check" :size="16" />
            保存
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import IconLib from './icons/IconLibrary.vue'

// 状态
const isOpen = ref(false)
const currentTheme = ref('light')
const primaryColor = ref('#4B6EF5')
const customColor = ref('#4B6EF5')
const borderRadius = ref(8)
const currentLayout = ref('sidebar')
const enableAnimation = ref(true)
const pageTransition = ref(true)
const showSidebar = ref(true)
const fixedHeader = ref(true)
const compactMode = ref(false)

// 主题模式选项
const themeModes = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' }
]

// 颜色预设
const colorPresets = [
  { value: '#4B6EF5', label: '默认蓝' },
  { value: '#6C5CE7', label: '紫罗兰' },
  { value: '#10b981', label: '翠绿' },
  { value: '#14b8a6', label: '青色' },
  { value: '#f59e0b', label: '琥珀' },
  { value: '#ef4444', label: '红色' },
  { value: '#ec4899', label: '粉红' },
  { value: '#8b5cf6', label: '紫色' },
  { value: '#06b6d4', label: '青蓝' },
  { value: '#84cc16', label: '柠檬' }
]

// 圆角选项
const radiusOptions = [
  { value: 0, label: '无' },
  { value: 4, label: '小' },
  { value: 8, label: '中' },
  { value: 12, label: '大' },
  { value: 16, label: '超大' }
]

// 布局选项
const layoutOptions = [
  { value: 'sidebar', label: '侧边栏' },
  { value: 'top', label: '顶部导航' },
  { value: 'mini', label: '迷你侧栏' }
]

// 方法
const setTheme = (theme: string) => {
  currentTheme.value = theme
  document.documentElement.setAttribute('data-theme', theme)
}

const setPrimaryColor = (color: string) => {
  primaryColor.value = color
  customColor.value = color
  document.documentElement.style.setProperty('--primary-color', color)
  // 计算派生颜色
  document.documentElement.style.setProperty('--primary-color-light', `${color}15`)
  document.documentElement.style.setProperty('--primary-color-dark', adjustColor(color, -20))
}

const setBorderRadius = (radius: number) => {
  borderRadius.value = radius
  document.documentElement.style.setProperty('--border-radius', `${radius}px`)
}

const setLayout = (layout: string) => {
  currentLayout.value = layout
  document.documentElement.setAttribute('data-layout', layout)
}

const toggleAnimation = () => {
  enableAnimation.value = !enableAnimation.value
  document.documentElement.classList.toggle('no-animation', !enableAnimation.value)
}

const togglePageTransition = () => {
  pageTransition.value = !pageTransition.value
}

const resetTheme = () => {
  setTheme('light')
  setPrimaryColor('#4B6EF5')
  setBorderRadius(8)
  setLayout('sidebar')
  enableAnimation.value = true
  pageTransition.value = true
  showSidebar.value = true
  fixedHeader.value = true
  compactMode.value = false
}

const saveTheme = () => {
  const settings = {
    theme: currentTheme.value,
    primaryColor: primaryColor.value,
    borderRadius: borderRadius.value,
    layout: currentLayout.value,
    enableAnimation: enableAnimation.value,
    pageTransition: pageTransition.value,
    showSidebar: showSidebar.value,
    fixedHeader: fixedHeader.value,
    compactMode: compactMode.value
  }
  localStorage.setItem('theme-settings', JSON.stringify(settings))
  isOpen.value = false
}

// 颜色调整工具
const adjustColor = (color: string, amount: number): string => {
  const clamp = (num: number) => Math.min(255, Math.max(0, num))
  const hex = color.replace('#', '')
  const r = clamp(parseInt(hex.slice(0, 2), 16) + amount)
  const g = clamp(parseInt(hex.slice(2, 4), 16) + amount)
  const b = clamp(parseInt(hex.slice(4, 6), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 加载保存的设置
onMounted(() => {
  const saved = localStorage.getItem('theme-settings')
  if (saved) {
    const settings = JSON.parse(saved)
    setTheme(settings.theme || 'light')
    setPrimaryColor(settings.primaryColor || '#4B6EF5')
    setBorderRadius(settings.borderRadius || 8)
    setLayout(settings.layout || 'sidebar')
    enableAnimation.value = settings.enableAnimation ?? true
    pageTransition.value = settings.pageTransition ?? true
    showSidebar.value = settings.showSidebar ?? true
    fixedHeader.value = settings.fixedHeader ?? true
    compactMode.value = settings.compactMode ?? false
  }
})
</script>

<style scoped>
.theme-customizer {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
}

/* 触发按钮 */
.customizer-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--primary-color, #4B6EF5);
  border: none;
  border-radius: 8px 0 0 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

.customizer-trigger:hover {
  background: var(--primary-color-dark, #3a5ce4);
}

.customizer-trigger.is-open {
  animation: none;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 面板 */
.customizer-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 320px;
  height: 100vh;
  background: #fff;
  box-shadow: -4px 0 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.panel-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* 设置分区 */
.setting-section {
  margin-bottom: 1.5rem;
}

.setting-section h4 {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary, #666);
}

/* 主题模式 */
.theme-modes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-card:hover {
  background: var(--bg-color-tertiary, #e5e7eb);
}

.mode-card.is-active {
  border-color: var(--primary-color, #4B6EF5);
  background: var(--primary-color-light, #eff1ff);
}

.mode-preview {
  width: 100%;
  height: 40px;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
}

.mode-preview.light {
  background: #f9fafb;
}

.mode-preview.dark {
  background: #1f2937;
}

.mode-preview.system {
  background: linear-gradient(135deg, #f9fafb 50%, #1f2937 50%);
}

.preview-sidebar {
  width: 30%;
  background: rgba(0, 0, 0, 0.1);
}

.preview-content {
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.preview-line {
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.preview-line.short {
  width: 60%;
}

.mode-card span {
  font-size: 0.75rem;
}

/* 颜色预设 */
.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.color-preset {
  width: 28px;
  height: 28px;
  background: var(--preset-color);
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.2s ease;
}

.color-preset:hover {
  transform: scale(1.1);
}

.color-preset.is-active {
  border-color: #fff;
  box-shadow: 0 0 0 2px var(--preset-color);
}

.custom-color {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.custom-color label {
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
}

.color-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.color-picker {
  width: 40px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-text {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  outline: none;
}

/* 圆角选项 */
.radius-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

.radius-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radius-option:hover {
  background: var(--bg-color-tertiary, #e5e7eb);
}

.radius-option.is-active {
  border-color: var(--primary-color, #4B6EF5);
}

.radius-preview {
  width: 24px;
  height: 24px;
  background: var(--primary-color, #4B6EF5);
}

.radius-option span {
  font-size: 0.6875rem;
}

/* 布局选项 */
.layout-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.layout-option:hover {
  background: var(--bg-color-tertiary, #e5e7eb);
}

.layout-option.is-active {
  border-color: var(--primary-color, #4B6EF5);
}

.layout-preview {
  width: 100%;
  height: 36px;
  display: flex;
  gap: 2px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.layout-preview.top {
  flex-direction: column;
}

.layout-sidebar {
  width: 25%;
  background: var(--primary-color, #4B6EF5);
}

.layout-preview.mini .layout-sidebar {
  width: 15%;
}

.layout-header {
  height: 8px;
  background: var(--primary-color, #4B6EF5);
}

.layout-main {
  flex: 1;
  background: var(--bg-color-secondary, #f3f4f6);
}

.layout-option span {
  font-size: 0.75rem;
}

/* 开关设置 */
.toggle-setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.toggle-setting span {
  font-size: 0.875rem;
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

/* 底部 */
.panel-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.panel-footer .btn {
  flex: 1;
}

/* 过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color, #4B6EF5);
  border: 1px solid var(--primary-color, #4B6EF5);
  color: #fff;
}

.btn-primary:hover {
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
