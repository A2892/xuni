<template>
  <div 
    class="image-preview"
    :class="{ 'image-preview--error': hasError }"
    :style="containerStyle"
    @click="handleClick"
  >
    <!-- 加载中 -->
    <div v-if="loading" class="image-preview__loading">
      <IconLib name="loader" :size="24" class="spin" />
    </div>
    
    <!-- 图片 -->
    <img
      v-show="!loading && !hasError"
      ref="imgRef"
      :src="src"
      :alt="alt"
      class="image-preview__img"
      :style="imgStyle"
      @load="handleLoad"
      @error="handleError"
    />
    
    <!-- 错误状态 -->
    <div v-if="hasError" class="image-preview__error">
      <slot name="error">
        <IconLib name="image" :size="32" />
        <span>加载失败</span>
      </slot>
    </div>
    
    <!-- 预览遮罩 -->
    <div v-if="preview && !loading && !hasError" class="image-preview__mask">
      <IconLib name="eye" :size="20" />
      <span>预览</span>
    </div>
    
    <!-- 全屏预览 -->
    <Teleport to="body">
      <Transition name="preview">
        <div 
          v-if="showPreview"
          class="image-preview__viewer"
          @click="closePreview"
        >
          <div class="image-preview__viewer-header">
            <span class="image-preview__viewer-title">{{ alt || '图片预览' }}</span>
            <div class="image-preview__viewer-actions">
              <button type="button" @click.stop="zoomIn" title="放大">
                <IconLib name="zoom-in" :size="18" />
              </button>
              <button type="button" @click.stop="zoomOut" title="缩小">
                <IconLib name="zoom-out" :size="18" />
              </button>
              <button type="button" @click.stop="rotateLeft" title="逆时针旋转">
                <IconLib name="rotate-ccw" :size="18" />
              </button>
              <button type="button" @click.stop="rotateRight" title="顺时针旋转">
                <IconLib name="rotate-cw" :size="18" />
              </button>
              <button type="button" @click.stop="resetTransform" title="重置">
                <IconLib name="maximize" :size="18" />
              </button>
              <button type="button" @click="closePreview" title="关闭">
                <IconLib name="close" :size="18" />
              </button>
            </div>
          </div>
          
          <div 
            class="image-preview__viewer-content"
            @click.stop
          >
            <img
              :src="src"
              :alt="alt"
              :style="previewImgStyle"
              @mousedown="handleMouseDown"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 图片地址
  src: string
  // 替代文本
  alt?: string
  // 宽度
  width?: string | number
  // 高度
  height?: string | number
  // 填充模式
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  // 是否可预览
  preview?: boolean
  // 是否懒加载
  lazy?: boolean
  // 预览图片列表
  previewList?: string[]
  // 初始预览索引
  initialIndex?: number
  // 圆角
  borderRadius?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  fit: 'cover',
  preview: true,
  lazy: false
})

const emit = defineEmits<{
  (e: 'load', event: Event): void
  (e: 'error', event: Event): void
  (e: 'preview'): void
}>()

const imgRef = ref<HTMLImageElement>()
const loading = ref(true)
const hasError = ref(false)
const showPreview = ref(false)

// 预览变换状态
const scale = ref(1)
const rotate = ref(0)
const translateX = ref(0)
const translateY = ref(0)

// 容器样式
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  borderRadius: typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
}))

// 图片样式
const imgStyle = computed(() => ({
  objectFit: props.fit
}))

// 预览图片样式
const previewImgStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value}) rotate(${rotate.value}deg)`,
  transition: isDragging.value ? 'none' : 'transform 0.3s ease'
}))

// 图片加载成功
function handleLoad(e: Event) {
  loading.value = false
  hasError.value = false
  emit('load', e)
}

// 图片加载失败
function handleError(e: Event) {
  loading.value = false
  hasError.value = true
  emit('error', e)
}

// 点击图片
function handleClick() {
  if (props.preview && !hasError.value && !loading.value) {
    showPreview.value = true
    emit('preview')
    document.body.style.overflow = 'hidden'
  }
}

// 关闭预览
function closePreview() {
  showPreview.value = false
  resetTransform()
  document.body.style.overflow = ''
}

// 放大
function zoomIn() {
  scale.value = Math.min(scale.value + 0.25, 5)
}

// 缩小
function zoomOut() {
  scale.value = Math.max(scale.value - 0.25, 0.25)
}

// 逆时针旋转
function rotateLeft() {
  rotate.value -= 90
}

// 顺时针旋转
function rotateRight() {
  rotate.value += 90
}

// 重置变换
function resetTransform() {
  scale.value = 1
  rotate.value = 0
  translateX.value = 0
  translateY.value = 0
}

// 拖拽相关
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

function handleMouseDown(e: MouseEvent) {
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - translateX.value,
    y: e.clientY - translateY.value
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  
  translateX.value = e.clientX - dragStart.value.x
  translateY.value = e.clientY - dragStart.value.y
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 键盘事件
function handleKeyDown(e: KeyboardEvent) {
  if (!showPreview.value) return
  
  switch (e.key) {
    case 'Escape':
      closePreview()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case 'ArrowLeft':
      rotateLeft()
      break
    case 'ArrowRight':
      rotateRight()
      break
  }
}

// 监听 src 变化重置状态
watch(() => props.src, () => {
  loading.value = true
  hasError.value = false
})

// 监听预览状态添加/移除键盘事件
watch(showPreview, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeyDown)
  } else {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.image-preview {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background: var(--bg-hover, #f5f7fa);
}

.image-preview__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #909399);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.image-preview__img {
  display: block;
  width: 100%;
  height: 100%;
}

.image-preview__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary, #909399);
  font-size: 12px;
}

.image-preview__mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.3s;
}

.image-preview:hover .image-preview__mask {
  opacity: 1;
}

/* 预览查看器 */
.image-preview__viewer {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
}

.image-preview__viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  color: #fff;
}

.image-preview__viewer-title {
  font-size: 16px;
}

.image-preview__viewer-actions {
  display: flex;
  gap: 8px;
}

.image-preview__viewer-actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.image-preview__viewer-actions button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.image-preview__viewer-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-preview__viewer-content img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  cursor: move;
  user-select: none;
}

/* 动画 */
.preview-enter-active,
.preview-leave-active {
  transition: opacity 0.3s ease;
}

.preview-enter-from,
.preview-leave-to {
  opacity: 0;
}
</style>
