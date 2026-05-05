<template>
  <svg
    :class="['diagonal-watermark-svg','diagonal-watermark']"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    :style="svgStyle"
  >
    <defs>
      <pattern :id="patternId" patternUnits="userSpaceOnUse" :width="lineSpacing" :height="lineSpacing" :patternTransform="patternTransform">
        <!-- 把条带居中放置在 cell 中，并扩大高度以避免旋转后出现空隙 -->
        <rect :x="(lineSpacing - lineWidth) / 2" :y="-lineSpacing" :width="lineWidth" :height="lineSpacing * 3" :fill="fillColor" />
      </pattern>
    </defs>
    <!-- 使用 patternTransform 做旋转（比对 rect 做旋转更稳定），移除 rect-level rotate -->
    <rect width="100%" height="100%" :fill="`url(#${patternId})`" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  color: { type: String, default: '#000000' },
  opacity: { type: Number, default: 0.06 }, // 更低的不透明度，默认 6%
  lineWidth: { type: Number, default: 4 }, // 更窄的默认线条宽度（改为 4px）
  lineSpacing: { type: Number, default: 120 }, // 更大的默认间距（改为 120px）
  rotation: { type: Number, default: -30 },
  overlay: { type: Boolean, default: false }
})

// 将 hex + alpha 转为 rgba 字符串（兼容 #rgb/#rrggbb 和 rgb/rgba）
function hexToRgba(hex: string, a: number) {
  try {
    if (!hex) return `rgba(0,0,0,${a})`
    hex = hex.trim()
    // 支持 rgb(...) 和 rgba(...) 直接传回带 alpha 的字符串
    const rgbMatch = hex.match(/rgba?\(([^)]+)\)/i)
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map(p => parseFloat(p.trim()))
      return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`
    }
    let h = hex.replace('#', '')
    if (h.length === 3) h = h.split('').map(c => c + c).join('')
    const bigint = parseInt(h, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r},${g},${b},${a})`
  } catch (e) {
    return `rgba(0,0,0,${a})`
  }
}

// 唯一 id 以避免多实例时 pattern 冲突
const uid = Math.random().toString(36).slice(2, 9)
const patternId = `diag-stripe-${uid}`

const lineWidth = computed(() => Number(props.lineWidth) || 20)
const lineSpacing = computed(() => Math.max(4, Number(props.lineSpacing) || 40))
const color = computed(() => props.color || '#000000')
const opacity = computed(() => (typeof props.opacity === 'number' ? props.opacity : 0.1))
const rotation = computed(() => Number(props.rotation) || -30)

// 将 pattern 的旋转以 cell 中心为基准：translate(center) rotate(angle) translate(-center)
const patternTransform = computed(() => `translate(${lineSpacing.value/2} ${lineSpacing.value/2}) rotate(${rotation.value}) translate(${-lineSpacing.value/2} ${-lineSpacing.value/2})`)

// 预置一些便于导出读取的 CSS 变量，DownloadPanel 的回退逻辑会读取它们
  const svgStyle = computed(() => ({
  position: 'absolute',
  inset: '0px',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  // overlay 模式时使用更高 z-index 以确保覆盖内容；非 overlay 保持在内容下方 (1)
  zIndex: props.overlay ? 4 : 1,
  // overlay 时直接显示（normal），否则使用轻度混合以减少对内容遮挡
  mixBlendMode: props.overlay ? 'normal' : 'multiply',
  '--line-color': color.value,
  '--line-opacity': String(opacity.value),
  '--line-width': `${lineWidth.value}px`,
  '--line-spacing': `${lineSpacing.value}px`,
  '--line-rotation': `${rotation.value}deg`
}))

// 计算最终填充颜色（把 alpha 合并进 rgba）
const fillColor = computed(() => hexToRgba(color.value, opacity.value))
</script>

<style scoped>
.diagonal-watermark-svg { display: block; }
</style>
