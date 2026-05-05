<template>
  <div 
    class="watermark"
    ref="containerRef"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  // 水印内容
  content?: string | string[]
  // 字体颜色
  fontColor?: string
  // 字体大小
  fontSize?: number
  // 字体
  fontFamily?: string
  // 字体粗细
  fontWeight?: string | number
  // 旋转角度
  rotate?: number
  // 水平间距
  gapX?: number
  // 垂直间距
  gapY?: number
  // 偏移量 X
  offsetX?: number
  // 偏移量 Y
  offsetY?: number
  // 宽度
  width?: number
  // 高度
  height?: number
  // z-index
  zIndex?: number
  // 图片水印
  image?: string
  // 图片宽度
  imageWidth?: number
  // 图片高度
  imageHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  fontColor: 'rgba(0, 0, 0, 0.15)',
  fontSize: 14,
  fontFamily: 'sans-serif',
  fontWeight: 'normal',
  rotate: -22,
  gapX: 100,
  gapY: 100,
  offsetX: 0,
  offsetY: 0,
  width: 120,
  height: 64,
  zIndex: 9
})

const containerRef = ref<HTMLElement>()
let watermarkDiv: HTMLDivElement | null = null
let observer: MutationObserver | null = null

// 创建水印
function createWatermark(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  const ratio = window.devicePixelRatio || 1
  const canvasWidth = (props.width + props.gapX) * ratio
  const canvasHeight = (props.height + props.gapY) * ratio
  
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  canvas.style.width = `${canvasWidth / ratio}px`
  canvas.style.height = `${canvasHeight / ratio}px`
  
  ctx.scale(ratio, ratio)
  ctx.translate(props.width / 2, props.height / 2)
  ctx.rotate((props.rotate * Math.PI) / 180)
  
  if (props.image) {
    // 图片水印
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = props.image
    img.onload = () => {
      const imgWidth = props.imageWidth || props.width
      const imgHeight = props.imageHeight || props.height
      ctx.drawImage(
        img,
        -imgWidth / 2,
        -imgHeight / 2,
        imgWidth,
        imgHeight
      )
      renderWatermark(canvas.toDataURL())
    }
    return ''
  } else {
    // 文字水印
    ctx.font = `${props.fontWeight} ${props.fontSize}px ${props.fontFamily}`
    ctx.fillStyle = props.fontColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const contents = Array.isArray(props.content) ? props.content : [props.content]
    const lineHeight = props.fontSize * 1.5
    const startY = -(contents.length - 1) * lineHeight / 2
    
    contents.forEach((line, index) => {
      ctx.fillText(line, 0, startY + index * lineHeight)
    })
    
    return canvas.toDataURL()
  }
}

// 渲染水印
function renderWatermark(base64Url?: string) {
  if (!containerRef.value) return
  
  const url = base64Url || createWatermark()
  if (!url) return
  
  // 移除旧的水印
  if (watermarkDiv) {
    watermarkDiv.remove()
  }
  
  // 创建新的水印容器
  watermarkDiv = document.createElement('div')
  watermarkDiv.setAttribute('data-watermark', 'true')
  watermarkDiv.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-repeat: repeat;
    background-image: url(${url});
    background-position: ${props.offsetX}px ${props.offsetY}px;
    z-index: ${props.zIndex};
  `
  
  containerRef.value.style.position = 'relative'
  containerRef.value.appendChild(watermarkDiv)
}

// 监听 DOM 变化防止水印被删除
function setupObserver() {
  if (!containerRef.value) return
  
  observer = new MutationObserver((mutations) => {
    let needRerender = false
    
    mutations.forEach((mutation) => {
      // 检查是否删除了水印元素
      if (mutation.type === 'childList') {
        mutation.removedNodes.forEach((node) => {
          if (node === watermarkDiv) {
            needRerender = true
          }
        })
      }
      
      // 检查水印元素的属性是否被修改
      if (mutation.type === 'attributes' && 
          mutation.target === watermarkDiv) {
        needRerender = true
      }
    })
    
    if (needRerender) {
      renderWatermark()
    }
  })
  
  observer.observe(containerRef.value, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  })
}

// 监听属性变化
watch(
  () => [
    props.content,
    props.fontColor,
    props.fontSize,
    props.fontFamily,
    props.fontWeight,
    props.rotate,
    props.gapX,
    props.gapY,
    props.offsetX,
    props.offsetY,
    props.width,
    props.height,
    props.image
  ],
  () => {
    renderWatermark()
  },
  { deep: true }
)

onMounted(() => {
  renderWatermark()
  setupObserver()
})

onUnmounted(() => {
  observer?.disconnect()
  watermarkDiv?.remove()
})
</script>

<style scoped>
.watermark {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
