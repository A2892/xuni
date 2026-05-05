<template>
  <svg class="fullscreen-watermark-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" :style="svgStyle">
    <defs>
      <pattern :id="patternId" patternUnits="userSpaceOnUse" :width="tileSize" :height="tileSize">
        <g :transform="patternTransform">
          <text v-if="hasText" x="0" y="0" text-anchor="middle" dominant-baseline="middle"
            :font-size="fontSize" :fill="color" :fill-opacity="opacity" :font-family="fontFamily">
            {{ text }}
          </text>
          <g v-else>
            <rect :x="-tileSize/2" :y="-tileSize/2" :width="tileSize" :height="tileSize" :fill="color" :fill-opacity="opacity" />
          </g>
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" :fill="fillUrl" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  fontSize: { type: Number, default: 48 },
  spacing: { type: Number, default: 200 },
  rotation: { type: Number, default: -45 },
  color: { type: String, default: '#000000' },
  opacity: { type: Number, default: 0.08 },
  fontFamily: { type: String, default: 'Times New Roman' },
  overlay: { type: Boolean, default: false }
})

const uid = Math.random().toString(36).slice(2, 9)
const patternId = `fs-wm-${uid}`

const text = computed(() => props.text || '')
const fontSize = computed(() => Math.max(8, Number(props.fontSize) || 48))
const spacing = computed(() => Math.max(40, Number(props.spacing) || 200))
const rotation = computed(() => Number(props.rotation) || -45)
const color = computed(() => props.color || '#000000')
const opacity = computed(() => (typeof props.opacity === 'number' ? props.opacity : 0.08))
const fontFamily = computed(() => props.fontFamily || 'Times New Roman')

// tile size: ensure text fits inside tile comfortably
const tileSize = computed(() => Math.max(fontSize.value * 2, spacing.value))

const svgStyle = computed(() => ({
  position: 'absolute',
  inset: '0px',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  // 不要在 SVG 内使用极大 z-index，父容器（Teleport）控制堆叠顺序
  zIndex: 0,
  mixBlendMode: props.overlay ? 'normal' : 'multiply',
  '--fs-wm-color': color.value,
  '--fs-wm-opacity': String(opacity.value),
  '--fs-wm-font-size': `${fontSize.value}px`,
  '--fs-wm-spacing': `${spacing.value}px`,
  '--fs-wm-rotation': `${rotation.value}deg`
}))

const hasText = computed(() => (text.value || '').toString().trim().length > 0)

const patternTransform = computed(() => `translate(${tileSize.value/2},${tileSize.value/2}) rotate(${rotation.value})`)
const fillUrl = computed(() => `url(#${patternId})`)
</script>

<style scoped>
.fullscreen-watermark-svg { display: block }
</style>
  pointerEvents: 'none',
