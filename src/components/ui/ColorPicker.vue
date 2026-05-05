<template>
  <div class="color-picker" :class="{ 'color-picker--disabled': disabled }">
    <!-- 触发器 -->
    <div 
      class="color-picker__trigger"
      :style="{ backgroundColor: modelValue }"
      @click="togglePanel"
    >
      <span v-if="showAlpha" class="color-picker__alpha-bg"></span>
    </div>
    
    <!-- 下拉面板 -->
    <Teleport to="body">
      <Transition name="color-picker-dropdown">
        <div 
          v-if="isOpen"
          class="color-picker__panel"
          ref="panelRef"
          :style="panelStyle"
        >
          <!-- 颜色选择区 -->
          <div 
            class="color-picker__saturation"
            ref="saturationRef"
            :style="{ backgroundColor: hueColor }"
            @mousedown="handleSaturationMouseDown"
          >
            <div class="color-picker__saturation-white"></div>
            <div class="color-picker__saturation-black"></div>
            <div 
              class="color-picker__saturation-cursor"
              :style="cursorStyle"
            ></div>
          </div>
          
          <!-- 控制条 -->
          <div class="color-picker__controls">
            <!-- 色相条 -->
            <div 
              class="color-picker__hue"
              ref="hueRef"
              @mousedown="handleHueMouseDown"
            >
              <div 
                class="color-picker__hue-cursor"
                :style="{ left: `${(hue / 360) * 100}%` }"
              ></div>
            </div>
            
            <!-- 透明度条 -->
            <div 
              v-if="showAlpha"
              class="color-picker__alpha"
              ref="alphaRef"
              @mousedown="handleAlphaMouseDown"
            >
              <div 
                class="color-picker__alpha-bar"
                :style="{ background: alphaGradient }"
              ></div>
              <div 
                class="color-picker__alpha-cursor"
                :style="{ left: `${alpha * 100}%` }"
              ></div>
            </div>
          </div>
          
          <!-- 预览和输入 -->
          <div class="color-picker__bottom">
            <div 
              class="color-picker__preview"
              :style="{ backgroundColor: currentColor }"
            >
              <span class="color-picker__alpha-bg"></span>
            </div>
            
            <input 
              type="text"
              class="color-picker__input"
              :value="inputValue"
              @input="handleInput"
              @blur="handleInputBlur"
            />
          </div>
          
          <!-- 预设颜色 -->
          <div v-if="presets.length" class="color-picker__presets">
            <div
              v-for="color in presets"
              :key="color"
              class="color-picker__preset"
              :style="{ backgroundColor: color }"
              @click="selectPreset(color)"
            ></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  // 颜色值
  modelValue?: string
  // 是否禁用
  disabled?: boolean
  // 是否显示透明度
  showAlpha?: boolean
  // 预设颜色
  presets?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#4B6EF5',
  disabled: false,
  showAlpha: false,
  presets: () => [
    '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1',
    '#1e90ff', '#c71585', '#ff69b4', '#808080', '#000000'
  ]
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const panelRef = ref<HTMLElement>()
const saturationRef = ref<HTMLElement>()
const hueRef = ref<HTMLElement>()
const alphaRef = ref<HTMLElement>()

const isOpen = ref(false)
const panelStyle = ref({})
const inputValue = ref('')

// 颜色状态
const hue = ref(0)
const saturation = ref(100)
const lightness = ref(50)
const alpha = ref(1)

// 解析初始颜色
function parseColor(color: string) {
  // HEX
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    
    const { h, s, l } = rgbToHsl(r, g, b)
    hue.value = h
    saturation.value = s
    lightness.value = l
    
    if (hex.length === 8) {
      alpha.value = parseInt(hex.slice(6, 8), 16) / 255
    }
  }
}

// RGB 转 HSL
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// HSL 转 RGB
function hslToRgb(h: number, s: number, l: number) {
  h /= 360
  s /= 100
  l /= 100
  
  let r: number, g: number, b: number
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

// 纯色相颜色
const hueColor = computed(() => {
  return `hsl(${hue.value}, 100%, 50%)`
})

// 当前颜色
const currentColor = computed(() => {
  const { r, g, b } = hslToRgb(hue.value, saturation.value, lightness.value)
  if (props.showAlpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha.value})`
  }
  return rgbToHex(r, g, b)
})

// RGB 转 HEX
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// 透明度渐变
const alphaGradient = computed(() => {
  const { r, g, b } = hslToRgb(hue.value, saturation.value, lightness.value)
  return `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0), rgba(${r}, ${g}, ${b}, 1))`
})

// 光标位置
const cursorStyle = computed(() => ({
  left: `${saturation.value}%`,
  top: `${100 - lightness.value}%`
}))

// 切换面板
function togglePanel() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    nextTick(updatePanelPosition)
  }
}

// 更新面板位置
function updatePanelPosition() {
  // 简化实现：固定在右侧
  panelStyle.value = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2000
  }
}

// 饱和度选择
function handleSaturationMouseDown(event: MouseEvent) {
  const el = saturationRef.value
  if (!el) return
  
  const updateSaturation = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    
    saturation.value = Math.round(x * 100)
    lightness.value = Math.round((1 - y) * 100)
    updateColor()
  }
  
  updateSaturation(event)
  
  const handleMouseMove = (e: MouseEvent) => updateSaturation(e)
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 色相选择
function handleHueMouseDown(event: MouseEvent) {
  const el = hueRef.value
  if (!el) return
  
  const updateHue = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    hue.value = Math.round(x * 360)
    updateColor()
  }
  
  updateHue(event)
  
  const handleMouseMove = (e: MouseEvent) => updateHue(e)
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 透明度选择
function handleAlphaMouseDown(event: MouseEvent) {
  const el = alphaRef.value
  if (!el) return
  
  const updateAlpha = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    alpha.value = Math.round(x * 100) / 100
    updateColor()
  }
  
  updateAlpha(event)
  
  const handleMouseMove = (e: MouseEvent) => updateAlpha(e)
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 更新颜色
function updateColor() {
  emit('update:modelValue', currentColor.value)
  emit('change', currentColor.value)
  inputValue.value = currentColor.value
}

// 输入处理
function handleInput(e: Event) {
  inputValue.value = (e.target as HTMLInputElement).value
}

function handleInputBlur() {
  if (inputValue.value.match(/^#[0-9a-fA-F]{6}$/)) {
    parseColor(inputValue.value)
    updateColor()
  } else {
    inputValue.value = currentColor.value
  }
}

// 选择预设
function selectPreset(color: string) {
  parseColor(color)
  updateColor()
}

// 点击外部关闭
function handleClickOutside(event: MouseEvent) {
  if (panelRef.value && !panelRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// 初始化
watch(() => props.modelValue, (val) => {
  parseColor(val)
  inputValue.value = val
}, { immediate: true })

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.color-picker {
  display: inline-block;
}

.color-picker--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.color-picker__trigger {
  position: relative;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
}

.color-picker__alpha-bg {
  position: absolute;
  inset: 0;
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJElEQVQoU2NkYGD4z4AKGFFEMDR8ABEeQDZBRGGBBpgEBQAeNgcBP5rXyAAAAABJRU5ErkJggg==');
  z-index: -1;
}

/* 面板 */
.color-picker__panel {
  width: 280px;
  background: var(--bg-color, #fff);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 12px;
}

/* 饱和度选择区 */
.color-picker__saturation {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 4px;
  cursor: crosshair;
}

.color-picker__saturation-white {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
  border-radius: 4px;
}

.color-picker__saturation-black {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
  border-radius: 4px;
}

.color-picker__saturation-cursor {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 控制条 */
.color-picker__controls {
  margin-top: 12px;
}

.color-picker__hue,
.color-picker__alpha {
  position: relative;
  height: 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 8px;
}

.color-picker__hue {
  background: linear-gradient(
    to right,
    #ff0000 0%,
    #ffff00 17%,
    #00ff00 33%,
    #00ffff 50%,
    #0000ff 67%,
    #ff00ff 83%,
    #ff0000 100%
  );
}

.color-picker__alpha {
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJElEQVQoU2NkYGD4z4AKGFFEMDR8ABEeQDZBRGGBBpgEBQAeNgcBP5rXyAAAAABJRU5ErkJggg==');
}

.color-picker__alpha-bar {
  position: absolute;
  inset: 0;
  border-radius: 6px;
}

.color-picker__hue-cursor,
.color-picker__alpha-cursor {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: #fff;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 底部 */
.color-picker__bottom {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.color-picker__preview {
  position: relative;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 4px;
  overflow: hidden;
}

.color-picker__input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 4px;
  font-size: 14px;
  font-family: monospace;
}

.color-picker__input:focus {
  outline: none;
  border-color: var(--primary-color, #4B6EF5);
}

/* 预设 */
.color-picker__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e4e7ed);
}

.color-picker__preset {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-picker__preset:hover {
  transform: scale(1.2);
}

/* 动画 */
.color-picker-dropdown-enter-active,
.color-picker-dropdown-leave-active {
  transition: all 0.2s ease;
}

.color-picker-dropdown-enter-from,
.color-picker-dropdown-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>
