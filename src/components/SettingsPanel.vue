<template>
  <div class="settings-panel">
    <!-- 头部 -->
    <div class="settings-header">
      <h2>
        <IconLib name="settings" :size="24" />
        系统设置
      </h2>
      <p>配置您的使用偏好和系统选项</p>
    </div>

    <!-- 设置分组 -->
    <div class="settings-groups">
      <!-- 外观设置 -->
      <div class="settings-group">
        <div class="group-header">
          <IconLib name="sun" :size="20" />
          <div class="group-info">
            <h3>外观设置</h3>
            <p>自定义界面外观和主题</p>
          </div>
        </div>
        
        <div class="group-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">主题模式</span>
              <span class="label-desc">选择界面显示主题</span>
            </div>
            <div class="setting-control">
              <div class="theme-selector">
                <button 
                  v-for="theme in themes"
                  :key="theme.value"
                  class="theme-option"
                  :class="{ 'is-active': settings.theme === theme.value }"
                  @click="settings.theme = theme.value"
                >
                  <IconLib :name="theme.icon" :size="18" />
                  <span>{{ theme.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">主色调</span>
              <span class="label-desc">设置界面主要颜色</span>
            </div>
            <div class="setting-control">
              <div class="color-selector">
                <button 
                  v-for="color in colors"
                  :key="color.value"
                  class="color-option"
                  :class="{ 'is-active': settings.primaryColor === color.value }"
                  :style="{ backgroundColor: color.value }"
                  @click="settings.primaryColor = color.value"
                  :title="color.label"
                ></button>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">字体大小</span>
              <span class="label-desc">调整界面文字大小</span>
            </div>
            <div class="setting-control">
              <div class="size-selector">
                <button 
                  v-for="size in fontSizes"
                  :key="size.value"
                  class="size-option"
                  :class="{ 'is-active': settings.fontSize === size.value }"
                  @click="settings.fontSize = size.value"
                >
                  {{ size.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">紧凑模式</span>
              <span class="label-desc">减少界面元素间距</span>
            </div>
            <div class="setting-control">
              <button 
                class="toggle-switch"
                :class="{ 'is-on': settings.compactMode }"
                @click="settings.compactMode = !settings.compactMode"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 导出设置 -->
      <div class="settings-group">
        <div class="group-header">
          <IconLib name="download" :size="20" />
          <div class="group-info">
            <h3>导出设置</h3>
            <p>配置默认导出选项</p>
          </div>
        </div>
        
        <div class="group-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">默认导出格式</span>
              <span class="label-desc">设置首选的文件格式</span>
            </div>
            <div class="setting-control">
              <select v-model="settings.exportFormat" class="setting-select">
                <option value="png">PNG 图片</option>
                <option value="jpg">JPG 图片</option>
                <option value="pdf">PDF 文档</option>
                <option value="svg">SVG 矢量图</option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">图片质量</span>
              <span class="label-desc">导出图片的压缩质量</span>
            </div>
            <div class="setting-control">
              <div class="quality-slider">
                <input 
                  type="range" 
                  v-model.number="settings.imageQuality" 
                  min="60" 
                  max="100"
                  class="slider-input"
                />
                <span class="slider-value">{{ settings.imageQuality }}%</span>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">输出分辨率</span>
              <span class="label-desc">设置导出图片的DPI</span>
            </div>
            <div class="setting-control">
              <div class="size-selector">
                <button 
                  v-for="dpi in dpiOptions"
                  :key="dpi.value"
                  class="size-option"
                  :class="{ 'is-active': settings.outputDpi === dpi.value }"
                  @click="settings.outputDpi = dpi.value"
                >
                  {{ dpi.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">自动添加水印</span>
              <span class="label-desc">在导出的文档上添加水印</span>
            </div>
            <div class="setting-control">
              <button 
                class="toggle-switch"
                :class="{ 'is-on': settings.addWatermark }"
                @click="settings.addWatermark = !settings.addWatermark"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="settings-group">
        <div class="group-header">
          <IconLib name="bell" :size="20" />
          <div class="group-info">
            <h3>通知设置</h3>
            <p>管理系统通知和提醒</p>
          </div>
        </div>
        
        <div class="group-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">导出完成通知</span>
              <span class="label-desc">文档导出完成时显示通知</span>
            </div>
            <div class="setting-control">
              <button 
                class="toggle-switch"
                :class="{ 'is-on': settings.exportNotification }"
                @click="settings.exportNotification = !settings.exportNotification"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">错误提示音</span>
              <span class="label-desc">发生错误时播放提示音</span>
            </div>
            <div class="setting-control">
              <button 
                class="toggle-switch"
                :class="{ 'is-on': settings.errorSound }"
                @click="settings.errorSound = !settings.errorSound"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">自动保存草稿</span>
              <span class="label-desc">定期自动保存当前工作</span>
            </div>
            <div class="setting-control">
              <button 
                class="toggle-switch"
                :class="{ 'is-on': settings.autoSave }"
                @click="settings.autoSave = !settings.autoSave"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>

          <div v-if="settings.autoSave" class="setting-item sub-item">
            <div class="setting-label">
              <span class="label-text">自动保存间隔</span>
              <span class="label-desc">每隔多久自动保存一次</span>
            </div>
            <div class="setting-control">
              <select v-model.number="settings.autoSaveInterval" class="setting-select">
                <option :value="30">30 秒</option>
                <option :value="60">1 分钟</option>
                <option :value="180">3 分钟</option>
                <option :value="300">5 分钟</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据与隐私 -->
      <div class="settings-group">
        <div class="group-header">
          <IconLib name="shield" :size="20" />
          <div class="group-info">
            <h3>数据与隐私</h3>
            <p>管理您的数据和隐私设置</p>
          </div>
        </div>
        
        <div class="group-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">记住历史记录</span>
              <span class="label-desc">保存最近生成的文档记录</span>
            </div>
            <div class="setting-control">
              <button 
                class="toggle-switch"
                :class="{ 'is-on': settings.saveHistory }"
                @click="settings.saveHistory = !settings.saveHistory"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">发送使用统计</span>
              <span class="label-desc">帮助我们改进产品体验</span>
            </div>
            <div class="setting-control">
              <button 
                class="toggle-switch"
                :class="{ 'is-on': settings.analytics }"
                @click="settings.analytics = !settings.analytics"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">清除本地数据</span>
              <span class="label-desc">删除所有本地存储的数据</span>
            </div>
            <div class="setting-control">
              <button class="btn btn-danger" @click="clearLocalData">
                <IconLib name="trash" :size="16" />
                清除数据
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷键 -->
      <div class="settings-group">
        <div class="group-header">
          <IconLib name="zap" :size="20" />
          <div class="group-info">
            <h3>快捷键</h3>
            <p>查看和自定义快捷键</p>
          </div>
        </div>
        
        <div class="group-content">
          <div class="shortcuts-list">
            <div class="shortcut-item" v-for="shortcut in shortcuts" :key="shortcut.action">
              <span class="shortcut-action">{{ shortcut.action }}</span>
              <div class="shortcut-keys">
                <kbd v-for="(key, index) in shortcut.keys" :key="index">{{ key }}</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="settings-footer">
      <button class="btn btn-outline" @click="resetSettings">
        <IconLib name="refresh-cw" :size="16" />
        恢复默认
      </button>
      <button class="btn btn-primary" @click="saveSettings">
        <IconLib name="check" :size="16" />
        保存设置
      </button>
    </div>

    <!-- 恢复默认确认对话框 -->
    <ConfirmDialog
      v-model:visible="showResetDialog"
      type="warning"
      title="确认恢复默认"
      message="确定要恢复默认设置吗？当前设置将丢失。"
      confirm-text="确认恢复"
      cancel-text="取消"
      @confirm="handleResetConfirmed"
      @cancel="showResetDialog = false"
    />

    <!-- 清除数据确认对话框 -->
    <ConfirmDialog
      v-model:visible="showClearDataDialog"
      type="danger"
      title="确认清除数据"
      message="确定要清除所有本地数据吗？此操作不可恢复。"
      confirm-text="确认清除"
      cancel-text="取消"
      @confirm="handleClearDataConfirmed"
      @cancel="showClearDataDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import IconLib from './icons/IconLibrary.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

// 确认对话框状态
const showResetDialog = ref(false)
const showClearDataDialog = ref(false)

// 主题选项
const themes = [
  { value: 'light', label: '浅色', icon: 'sun' },
  { value: 'dark', label: '深色', icon: 'moon' },
  { value: 'system', label: '跟随系统', icon: 'monitor' }
]

// 颜色选项
const colors = [
  { value: '#4B6EF5', label: '蓝色' },
  { value: '#6C5CE7', label: '紫色' },
  { value: '#10b981', label: '绿色' },
  { value: '#f59e0b', label: '橙色' },
  { value: '#ef4444', label: '红色' },
  { value: '#ec4899', label: '粉色' }
]

// 字体大小选项
const fontSizes = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' }
]

// DPI 选项
const dpiOptions = [
  { value: 72, label: '72 DPI' },
  { value: 150, label: '150 DPI' },
  { value: 300, label: '300 DPI' }
]

// 快捷键列表
const shortcuts = [
  { action: '新建文档', keys: ['⌘', 'N'] },
  { action: '保存', keys: ['⌘', 'S'] },
  { action: '导出', keys: ['⌘', 'E'] },
  { action: '撤销', keys: ['⌘', 'Z'] },
  { action: '重做', keys: ['⌘', '⇧', 'Z'] },
  { action: '放大', keys: ['⌘', '+'] },
  { action: '缩小', keys: ['⌘', '-'] },
  { action: '重置缩放', keys: ['⌘', '0'] }
]

// 设置状态
const settings = reactive({
  theme: 'light',
  primaryColor: '#4B6EF5',
  fontSize: 'medium',
  compactMode: false,
  exportFormat: 'png',
  imageQuality: 90,
  outputDpi: 150,
  addWatermark: false,
  exportNotification: true,
  errorSound: true,
  autoSave: true,
  autoSaveInterval: 60,
  saveHistory: true,
  analytics: true
})

// 从本地存储加载设置
const loadSettings = () => {
  const saved = localStorage.getItem('user-settings')
  if (saved) {
    Object.assign(settings, JSON.parse(saved))
  }
}

// 保存设置
const saveSettings = () => {
  localStorage.setItem('user-settings', JSON.stringify(settings))
  // 显示保存成功提示
  alert('设置已保存')
}

// 恢复默认设置
const resetSettings = () => {
  showResetDialog.value = true
}

const handleResetConfirmed = () => {
  showResetDialog.value = false
  Object.assign(settings, {
    theme: 'light',
    primaryColor: '#4B6EF5',
    fontSize: 'medium',
    compactMode: false,
    exportFormat: 'png',
    imageQuality: 90,
    outputDpi: 150,
    addWatermark: false,
    exportNotification: true,
    errorSound: true,
    autoSave: true,
    autoSaveInterval: 60,
    saveHistory: true,
    analytics: true
  })
}

// 清除本地数据
const clearLocalData = () => {
  showClearDataDialog.value = true
}

const handleClearDataConfirmed = () => {
  showClearDataDialog.value = false
  localStorage.clear()
  sessionStorage.clear()
}

// 初始化加载
loadSettings()
</script>

<style scoped>
.settings-panel {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

/* 头部 */
.settings-header {
  margin-bottom: 2rem;
}

.settings-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
}

.settings-header p {
  margin: 0.5rem 0 0;
  color: var(--text-color-secondary, #666);
}

/* 设置分组 */
.settings-groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-group {
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-color-secondary, #f9fafb);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.group-header > :first-child {
  color: var(--primary-color, #4B6EF5);
  margin-top: 0.125rem;
}

.group-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.group-info p {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
}

.group-content {
  padding: 0.5rem 0;
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
}

.setting-item.sub-item {
  padding-left: 2.5rem;
  background: var(--bg-color-secondary, #f9fafb);
}

.setting-label {
  flex: 1;
  min-width: 0;
}

.label-text {
  display: block;
  font-weight: 500;
}

.label-desc {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
}

.setting-control {
  flex-shrink: 0;
  margin-left: 1rem;
}

/* 主题选择器 */
.theme-selector {
  display: flex;
  gap: 0.5rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background: var(--bg-color-tertiary, #e5e7eb);
}

.theme-option.is-active {
  background: var(--primary-color-light, #eff1ff);
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

/* 颜色选择器 */
.color-selector {
  display: flex;
  gap: 0.5rem;
}

.color-option {
  width: 28px;
  height: 28px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.is-active {
  border-color: #fff;
  box-shadow: 0 0 0 2px currentColor;
}

/* 尺寸选择器 */
.size-selector {
  display: flex;
  background: var(--bg-color-secondary, #f3f4f6);
  padding: 0.25rem;
  border-radius: 6px;
}

.size-option {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-option:hover {
  background: rgba(255, 255, 255, 0.5);
}

.size-option.is-active {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 开关按钮 */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  padding: 0;
  background: var(--border-color, #d1d5db);
  border: none;
  border-radius: 12px;
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
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-switch.is-on .toggle-slider {
  left: 22px;
}

/* 下拉选择 */
.setting-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background: #fff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 0.5rem center;
  background-size: 1.25em 1.25em;
  appearance: none;
  cursor: pointer;
}

/* 质量滑块 */
.quality-slider {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 180px;
}

.slider-input {
  flex: 1;
  height: 4px;
  appearance: none;
  background: var(--border-color, #d1d5db);
  border-radius: 2px;
  cursor: pointer;
}

.slider-input::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  appearance: none;
  background: var(--primary-color, #4B6EF5);
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  min-width: 3em;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: right;
}

/* 快捷键列表 */
.shortcuts-list {
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem 1rem;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.shortcut-action {
  font-size: 0.875rem;
}

.shortcut-keys {
  display: flex;
  gap: 0.25rem;
}

.shortcut-keys kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-family: inherit;
  background: var(--bg-color-secondary, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
}

/* 底部操作 */
.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
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

.btn-danger {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
}

.btn-danger:hover {
  background: #ef4444;
  color: #fff;
}
</style>
