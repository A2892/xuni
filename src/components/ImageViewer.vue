<template>
  <Teleport to="body">
    <Transition name="image-preview">
      <div 
        v-if="visible"
        class="image-preview-overlay"
        @click.self="close"
      >
        <!-- 工具栏 -->
        <div class="preview-toolbar">
          <div class="toolbar-left">
            <span class="image-info" v-if="currentImage">
              {{ currentIndex + 1 }} / {{ images.length }}
              <span class="separator" v-if="currentImage.name">•</span>
              <span class="image-name" v-if="currentImage.name">{{ currentImage.name }}</span>
            </span>
          </div>
          <div class="toolbar-right">
            <button class="tool-btn" @click="zoomOut" :disabled="scale <= 0.5" title="缩小">
              <IconLib name="zoom-out" :size="18" />
            </button>
            <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
            <button class="tool-btn" @click="zoomIn" :disabled="scale >= 3" title="放大">
              <IconLib name="zoom-in" :size="18" />
            </button>
            <div class="toolbar-divider"></div>
            <button class="tool-btn" @click="rotateLeft" title="向左旋转">
              <IconLib name="rotate-ccw" :size="18" />
            </button>
            <button class="tool-btn" @click="rotateRight" title="向右旋转">
              <IconLib name="rotate-cw" :size="18" />
            </button>
            <div class="toolbar-divider"></div>
            <button class="tool-btn" @click="resetTransform" title="重置">
              <IconLib name="maximize-2" :size="18" />
            </button>
            <button class="tool-btn" @click="download" title="下载">
              <IconLib name="download" :size="18" />
            </button>
            <div class="toolbar-divider"></div>
            <button class="tool-btn close-btn" @click="close" title="关闭">
              <IconLib name="x" :size="20" />
            </button>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="preview-content" ref="contentRef">
          <!-- 上一张按钮 -->
          <button 
            class="nav-btn prev"
            v-if="images.length > 1"
            :disabled="!loop && currentIndex === 0"
            @click="prev"
          >
            <IconLib name="chevron-left" :size="24" />
          </button>

          <!-- 图片容器 -->
          <div 
            class="image-container"
            @wheel="handleWheel"
            @mousedown="startDrag"
            @touchstart="handleTouchStart"
          >
            <Transition :name="transitionName" mode="out-in">
              <div 
                :key="currentIndex"
                class="image-wrapper"
                :style="imageStyle"
              >
                <img 
                  :src="currentImage?.url || currentImage"
                  :alt="currentImage?.name || '预览图片'"
                  @load="handleImageLoad"
                  @error="handleImageError"
                  draggable="false"
                />
                <!-- 加载状态 -->
                <div class="loading-state" v-if="loading">
                  <IconLib name="loader" :size="32" class="spin" />
                </div>
                <!-- 错误状态 -->
                <div class="error-state" v-if="error">
                  <IconLib name="image-off" :size="48" />
                  <p>图片加载失败</p>
                </div>
              </div>
            </Transition>
          </div>

          <!-- 下一张按钮 -->
          <button 
            class="nav-btn next"
            v-if="images.length > 1"
            :disabled="!loop && currentIndex === images.length - 1"
            @click="next"
          >
            <IconLib name="chevron-right" :size="24" />
          </button>
        </div>

        <!-- 缩略图列表 -->
        <div class="thumbnail-strip" v-if="showThumbnails && images.length > 1">
          <div class="thumbnail-container" ref="thumbnailRef">
            <button 
              v-for="(img, index) in images"
              :key="index"
              class="thumbnail"
              :class="{ active: index === currentIndex }"
              @click="goTo(index)"
            >
              <img :src="typeof img === 'string' ? img : img.url" :alt="`缩略图 ${index + 1}`" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import IconLib from './icons/IconLibrary.vue'

type ImageItem = string | { url: string; name?: string }

const props = withDefaults(defineProps<{
  modelValue?: boolean
  images?: ImageItem[]
  initialIndex?: number
  loop?: boolean
  showThumbnails?: boolean
  zoomStep?: number
}>(), {
  modelValue: false,
  images: () => [],
  initialIndex: 0,
  loop: true,
  showThumbnails: true,
  zoomStep: 0.25
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'change': [index: number]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const contentRef = ref<HTMLElement>()
const thumbnailRef = ref<HTMLElement>()
const currentIndex = ref(props.initialIndex)
const scale = ref(1)
const rotation = ref(0)
const translateX = ref(0)
const translateY = ref(0)
const loading = ref(false)
const error = ref(false)
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const transitionName = ref('slide-left')

// 当前图片
const currentImage = computed(() => {
  const img = props.images[currentIndex.value]
  return typeof img === 'string' ? { url: img } : img
})

// 图片样式
const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value}) rotate(${rotation.value}deg)`,
  cursor: isDragging.value ? 'grabbing' : (scale.value > 1 ? 'grab' : 'default')
}))

// 放大
const zoomIn = () => {
  scale.value = Math.min(3, scale.value + props.zoomStep)
}

// 缩小
const zoomOut = () => {
  scale.value = Math.max(0.5, scale.value - props.zoomStep)
}

// 向左旋转
const rotateLeft = () => {
  rotation.value -= 90
}

// 向右旋转
const rotateRight = () => {
  rotation.value += 90
}

// 重置变换
const resetTransform = () => {
  scale.value = 1
  rotation.value = 0
  translateX.value = 0
  translateY.value = 0
}

// 下载图片
const download = () => {
  if (!currentImage.value) return
  
  const link = document.createElement('a')
  link.href = currentImage.value.url
  link.download = currentImage.value.name || `image-${currentIndex.value + 1}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 上一张
const prev = () => {
  if (!props.loop && currentIndex.value === 0) return
  
  transitionName.value = 'slide-right'
  currentIndex.value = currentIndex.value === 0 
    ? props.images.length - 1 
    : currentIndex.value - 1
  resetTransform()
  emit('change', currentIndex.value)
}

// 下一张
const next = () => {
  if (!props.loop && currentIndex.value === props.images.length - 1) return
  
  transitionName.value = 'slide-left'
  currentIndex.value = currentIndex.value === props.images.length - 1 
    ? 0 
    : currentIndex.value + 1
  resetTransform()
  emit('change', currentIndex.value)
}

// 跳转到指定图片
const goTo = (index: number) => {
  if (index === currentIndex.value) return
  
  transitionName.value = index > currentIndex.value ? 'slide-left' : 'slide-right'
  currentIndex.value = index
  resetTransform()
  emit('change', index)
}

// 关闭预览
const close = () => {
  visible.value = false
  resetTransform()
}

// 处理滚轮缩放
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// 开始拖拽
const startDrag = (e: MouseEvent) => {
  if (scale.value <= 1) return
  
  isDragging.value = true
  startPos.value = {
    x: e.clientX - translateX.value,
    y: e.clientY - translateY.value
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 拖拽中
const handleDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  translateX.value = e.clientX - startPos.value.x
  translateY.value = e.clientY - startPos.value.y
}

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 触摸开始
let lastTouchDistance = 0
const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    // 双指缩放
    lastTouchDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
  } else if (e.touches.length === 1 && scale.value > 1) {
    // 单指拖拽
    isDragging.value = true
    startPos.value = {
      x: e.touches[0].clientX - translateX.value,
      y: e.touches[0].clientY - translateY.value
    }
  }
}

// 图片加载完成
const handleImageLoad = () => {
  loading.value = false
  error.value = false
}

// 图片加载失败
const handleImageError = () => {
  loading.value = false
  error.value = true
}

// 键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (!visible.value) return
  
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prev()
      break
    case 'ArrowRight':
      next()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case '0':
      resetTransform()
      break
  }
}

// 监听显示状态
watch(visible, (val) => {
  if (val) {
    currentIndex.value = props.initialIndex
    resetTransform()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 监听索引变化，滚动缩略图
watch(currentIndex, () => {
  if (thumbnailRef.value) {
    const activeThumb = thumbnailRef.value.querySelector('.thumbnail.active')
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.image-preview-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
}

/* 工具栏 */
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.5);
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.image-info {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.separator {
  margin: 0 0.5rem;
}

.image-name {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-btn.close-btn:hover {
  background: rgba(239, 68, 68, 0.8);
}

.zoom-level {
  min-width: 48px;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 0.375rem;
}

/* 主内容区 */
.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 导航按钮 */
.nav-btn {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.05);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn.prev {
  left: 1rem;
}

.nav-btn.next {
  right: 1rem;
}

/* 图片容器 */
.image-container {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper {
  position: relative;
  transition: transform 0.1s ease;
}

.image-wrapper img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  user-select: none;
}

/* 加载状态 */
.loading-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
}

.error-state p {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
}

/* 缩略图列表 */
.thumbnail-strip {
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
}

.thumbnail-container {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  overflow-x: auto;
  padding: 0.25rem;
}

.thumbnail {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  padding: 0;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

.thumbnail.active {
  border-color: var(--primary-color, #4B6EF5);
}

/* 动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 入场/出场动画 */
.image-preview-enter-active,
.image-preview-leave-active {
  transition: opacity 0.3s ease;
}

.image-preview-enter-from,
.image-preview-leave-to {
  opacity: 0;
}

/* 切换动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

/* 响应式 */
@media (max-width: 640px) {
  .nav-btn {
    width: 40px;
    height: 40px;
  }

  .nav-btn.prev {
    left: 0.5rem;
  }

  .nav-btn.next {
    right: 0.5rem;
  }

  .image-name {
    display: none;
  }

  .thumbnail {
    width: 48px;
    height: 48px;
  }
}
</style>
