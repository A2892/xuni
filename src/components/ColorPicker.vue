<template>
  <div 
    class="color-picker"
    ref="pickerRef"
  >
    <!-- 触发器 -->
    <div class="picker-trigger" @click="togglePicker">
      <div 
        class="color-preview" 
        :style="{ background: selectedColor }"
      ></div>
      <span v-if="showValue" class="color-value">{{ selectedColor }}</span>
      <IconLib name="chevron-down" :size="14" />
    </div>
    
    <!-- 下拉面板 -->
    <transition name="dropdown">
      <div v-if="isOpen" class="picker-dropdown">
        <!-- 颜色板 -->
        <div 
          class="color-panel"
          ref="panelRef"
          @mousedown="handlePanelMouseDown"
        >
          <div 
            class="panel-background"
            :style="{ background: `hsl(${hue}, 100%, 50%)` }"
          ></div>
          <div class="panel-white"></div>
          <div class="panel-black"></div>
          <div 
            class="panel-cursor"
            :style="{ 
              left: `${saturation}%`, 
              top: `${100 - brightness}%` 
            }"
          ></div>
        </div>
        
        <!-- 色相滑块 -->
        <div 
          class="hue-slider"
          ref="hueRef"
          @mousedown="handleHueMouseDown"
        >
          <div 
            class="hue-cursor"
            :style="{ left: `${(hue / 360) * 100}%` }"
          ></div>
        </div>
        
        <!-- 透明度滑块 -->
        <div 
          v-if="showAlpha"
          class="alpha-slider"
          ref="alphaRef"
          @mousedown="handleAlphaMouseDown"
        >
          <div 
            class="alpha-gradient"
            :style="{ 
              background: `linear-gradient(to right, transparent, ${opaqueColor})` 
            }"
          ></div>
          <div 
            class="alpha-cursor"
            :style="{ left: `${alpha * 100}%` }"
          ></div>
        </div>
        
        <!-- 输入框 -->
        <div class="color-inputs">
          <div class="input-group">
            <input 
              type="text" 
              :value="hexValue"
              @input="handleHexInput"
              @blur="handleHexBlur"
              class="hex-input"
              maxlength="7"
            />
            <span class="input-label">HEX</span>
          </div>
          
          <div class="rgb-inputs">
            <div class="input-group">
              <input 
                type="number" 
                :value="rgb.r" 
                @input="handleRgbInput('r', $event)"
                min="0" 
                max="255"
              />
              <span class="input-label">R</span>
            </div>
            <div class="input-group">
              <input 
                type="number" 
                :value="rgb.g" 
                @input="handleRgbInput('g', $event)"
                min="0" 
                max="255"
              />
              <span class="input-label">G</span>
            </div>
            <div class="input-group">
              <input 
                type="number" 
                :value="rgb.b" 
                @input="handleRgbInput('b', $event)"
                min="0" 
                max="255"
              />
              <span class="input-label">B</span>
            </div>
            <div v-if="showAlpha" class="input-group">
              <input 
                type="number" 
                :value="Math.round(alpha * 100)" 
                @input="handleAlphaInput"
                min="0" 
                max="100"
              />
              <span class="input-label">A</span>
            </div>
          </div>
        </div>
        
        <!-- 预设颜色 -->
        <div v-if="presets && presets.length > 0" class="color-presets">
          <div 
            v-for="preset in presets" 
            :key="preset"
            class="preset-color"
            :class="{ active: preset.toLowerCase() === hexValue.toLowerCase() }"
            :style="{ background: preset }"
            @click="selectPreset(preset)"
          ></div>
        </div>
        
        <!-- 最近使用 -->
        <div v-if="recentColors.length > 0" class="recent-colors">
          <div class="recent-label">最近使用</div>
          <div class="recent-list">
            <div 
              v-for="color in recentColors" 
              :key="color"
              class="preset-color"
              :style="{ background: color }"
              @click="selectPreset(color)"
            ></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Props
interface Props {
  modelValue?: string
  showAlpha?: boolean
  showValue?: boolean
  presets?: string[]
  maxRecent?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#4B6EF5',
  showAlpha: false,
  showValue: true,
  presets: () => [
    '#ff4d4f', '#fa8c16', '#fadb14', '#52c41a', '#13c2c2',
    '#1890ff', '#722ed1', '#eb2f96', '#000000', '#ffffff'
  ],
  maxRecent: 8,
  disabled: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

// Refs
const pickerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const hueRef = ref<HTMLElement | null>(null)
const alphaRef = ref<HTMLElement | null>(null)

// State
const isOpen = ref(false)
const hue = ref(0)
const saturation = ref(100)
const brightness = ref(100)
const alpha = ref(1)
const recentColors = ref<string[]>([])
const hexValue = ref(props.modelValue)

// Computed
const rgb = computed(() => {
  return hsbToRgb(hue.value, saturation.value, brightness.value)
})

const selectedColor = computed(() => {
  if (props.showAlpha && alpha.value < 1) {
    return `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, ${alpha.value})`
  }
  return rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b)
})

const opaqueColor = computed(() => {
  return rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b)
})

// Methods
function togglePicker() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function closePicker() {
  isOpen.value = false
}

// 颜色转换函数
function hsbToRgb(h: number, s: number, b: number): { r: number; g: number; b: number } {
  s = s / 100
  b = b / 100
  
  const k = (n: number) => (n + h / 60) % 6
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)))
  
  return {
    r: Math.round(f(5) * 255),
    g: Math.round(f(3) * 255),
    b: Math.round(f(1) * 255)
  }
}

function rgbToHsb(r: number, g: number, b: number): { h: number; s: number; b: number } {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  return { h: h * 360, s: s * 100, b: v * 100 }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function setColorFromHex(hex: string) {
  const rgbValue = hexToRgb(hex)
  if (rgbValue) {
    const hsb = rgbToHsb(rgbValue.r, rgbValue.g, rgbValue.b)
    hue.value = hsb.h
    saturation.value = hsb.s
    brightness.value = hsb.b
    hexValue.value = hex
  }
}

// 面板拖动
function handlePanelMouseDown(e: MouseEvent) {
  updateFromPanel(e)
  
  const handleMove = (e: MouseEvent) => updateFromPanel(e)
  const handleUp = () => {
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleUp)
    emitChange()
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleUp)
}

function updateFromPanel(e: MouseEvent) {
  if (!panelRef.value) return
  
  const rect = panelRef.value.getBoundingClientRect()
  let x = (e.clientX - rect.left) / rect.width * 100
  let y = (e.clientY - rect.top) / rect.height * 100
  
  x = Math.max(0, Math.min(100, x))
  y = Math.max(0, Math.min(100, y))
  
  saturation.value = x
  brightness.value = 100 - y
  hexValue.value = selectedColor.value
}

// 色相拖动
function handleHueMouseDown(e: MouseEvent) {
  updateFromHue(e)
  
  const handleMove = (e: MouseEvent) => updateFromHue(e)
  const handleUp = () => {
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleUp)
    emitChange()
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleUp)
}

function updateFromHue(e: MouseEvent) {
  if (!hueRef.value) return
  
  const rect = hueRef.value.getBoundingClientRect()
  let x = (e.clientX - rect.left) / rect.width
  
  x = Math.max(0, Math.min(1, x))
  hue.value = x * 360
  hexValue.value = selectedColor.value
}

// 透明度拖动
function handleAlphaMouseDown(e: MouseEvent) {
  updateFromAlpha(e)
  
  const handleMove = (e: MouseEvent) => updateFromAlpha(e)
  const handleUp = () => {
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleUp)
    emitChange()
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleUp)
}

function updateFromAlpha(e: MouseEvent) {
  if (!alphaRef.value) return
  
  const rect = alphaRef.value.getBoundingClientRect()
  let x = (e.clientX - rect.left) / rect.width
  
  alpha.value = Math.max(0, Math.min(1, x))
}

// 输入框处理
function handleHexInput(e: Event) {
  const input = e.target as HTMLInputElement
  let value = input.value
  
  if (!value.startsWith('#')) {
    value = '#' + value
  }
  
  hexValue.value = value
}

function handleHexBlur() {
  if (/^#[0-9A-Fa-f]{6}$/.test(hexValue.value)) {
    setColorFromHex(hexValue.value)
    emitChange()
  } else {
    hexValue.value = selectedColor.value
  }
}

function handleRgbInput(channel: 'r' | 'g' | 'b', e: Event) {
  const input = e.target as HTMLInputElement
  let value = parseInt(input.value) || 0
  value = Math.max(0, Math.min(255, value))
  
  const newRgb = { ...rgb.value, [channel]: value }
  const hsb = rgbToHsb(newRgb.r, newRgb.g, newRgb.b)
  
  hue.value = hsb.h
  saturation.value = hsb.s
  brightness.value = hsb.b
  hexValue.value = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
  emitChange()
}

function handleAlphaInput(e: Event) {
  const input = e.target as HTMLInputElement
  let value = parseInt(input.value) || 0
  value = Math.max(0, Math.min(100, value))
  alpha.value = value / 100
  emitChange()
}

function selectPreset(color: string) {
  setColorFromHex(color)
  emitChange()
}

function emitChange() {
  const color = selectedColor.value
  emit('update:modelValue', color)
  emit('change', color)
  addToRecent(color)
}

function addToRecent(color: string) {
  const index = recentColors.value.indexOf(color)
  if (index > -1) {
    recentColors.value.splice(index, 1)
  }
  recentColors.value.unshift(color)
  if (recentColors.value.length > props.maxRecent) {
    recentColors.value.pop()
  }
}

// 点击外部关闭
function handleClickOutside(e: MouseEvent) {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    closePicker()
  }
}

// Lifecycle
onMounted(() => {
  setColorFromHex(props.modelValue)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch
watch(() => props.modelValue, (newValue) => {
  if (newValue !== selectedColor.value) {
    setColorFromHex(newValue)
  }
})
</script>

<style scoped>
.color-picker {
  position: relative;
  display: inline-block;
}

.picker-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.picker-trigger:hover {
  border-color: #ccc;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-value {
  font-size: 13px;
  color: #333;
  font-family: monospace;
  text-transform: uppercase;
}

.picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 260px;
}

/* 颜色板 */
.color-panel {
  position: relative;
  width: 100%;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  cursor: crosshair;
}

.panel-background {
  position: absolute;
  inset: 0;
}

.panel-white {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, white, transparent);
}

.panel-black {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, black, transparent);
}

.panel-cursor {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 色相滑块 */
.hue-slider {
  position: relative;
  width: 100%;
  height: 12px;
  border-radius: 6px;
  margin-top: 12px;
  background: linear-gradient(to right, 
    #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000
  );
  cursor: pointer;
}

.hue-cursor {
  position: absolute;
  top: -2px;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  transform: translateX(-50%);
}

/* 透明度滑块 */
.alpha-slider {
  position: relative;
  width: 100%;
  height: 12px;
  border-radius: 6px;
  margin-top: 12px;
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  cursor: pointer;
}

.alpha-gradient {
  position: absolute;
  inset: 0;
  border-radius: 6px;
}

.alpha-cursor {
  position: absolute;
  top: -2px;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  transform: translateX(-50%);
}

/* 输入框 */
.color-inputs {
  margin-top: 16px;
}

.hex-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-family: monospace;
  text-align: center;
  text-transform: uppercase;
}

.rgb-inputs {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.input-group input {
  width: 100%;
  padding: 6px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary-color, #4B6EF5);
}

.input-label {
  font-size: 11px;
  color: #999;
}

/* 预设颜色 */
.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.preset-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.preset-color:hover {
  transform: scale(1.1);
}

.preset-color.active {
  box-shadow: 0 0 0 2px var(--primary-color, #4B6EF5);
}

/* 最近使用 */
.recent-colors {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.recent-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
