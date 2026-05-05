<template>
  <div
    class="image-container"
    :class="{
      'image-container-error': hasError,
      'image-container-loading': loading
    }"
    :style="containerStyle"
  >
    <!-- 加载中 -->
    <div v-if="loading && !hasError" class="image-placeholder">
      <slot name="placeholder">
        <div class="image-loading">
          <div class="image-loading-spinner" />
        </div>
      </slot>
    </div>
    
    <!-- 加载失败 -->
    <div v-else-if="hasError" class="image-placeholder">
      <slot name="error">
        <div class="image-error">
          <IconLib name="image" :size="32" />
          <span>{{ fallbackText }}</span>
        </div>
      </slot>
    </div>
    
    <!-- 图片 -->
    <img
      v-show="!loading && !hasError"
      ref="imgRef"
      class="image"
      :class="{ 'image-preview': preview }"
      :src="currentSrc"
      :alt="alt"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
      @click="handlePreview"
    />
    
    <!-- 预览遮罩 -->
    <div v-if="preview && !loading && !hasError" class="image-mask">
      <IconLib name="eye" :size="20" />
      <span>预览</span>
    </div>
  </div>
  
  <!-- 图片预览 -->
  <Teleport to="body">
    <Transition name="preview">
      <div v-if="showPreview" class="image-preview-overlay" @click="closePreview">
        <div class="image-preview-toolbar">
          <button class="preview-btn" @click.stop="handleRotate(-90)" title="逆时针旋转">
            <IconLib name="rotate-left" :size="20" />
          </button>
          <button class="preview-btn" @click.stop="handleRotate(90)" title="顺时针旋转">
            <IconLib name="rotate-right" :size="20" />
          </button>
          <button class="preview-btn" @click.stop="handleZoom(-0.2)" title="缩小">
            <IconLib name="zoom-out" :size="20" />
          </button>
          <button class="preview-btn" @click.stop="handleZoom(0.2)" title="放大">
            <IconLib name="zoom-in" :size="20" />
          </button>
          <button class="preview-btn" @click.stop="handleReset" title="重置">
            <IconLib name="refresh" :size="20" />
          </button>
          <button class="preview-btn" @click.stop="closePreview" title="关闭">
            <IconLib name="close" :size="20" />
          </button>
        </div>
        <img
          class="preview-image"
          :src="previewSrc || currentSrc"
          :style="previewImageStyle"
          @click.stop
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  lazy?: boolean
  preview?: boolean
  previewSrc?: string
  fallback?: string
  fallbackText?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  fit: 'cover',
  lazy: false,
  preview: false,
  previewSrc: '',
  fallback: '',
  fallbackText: '加载失败',
  placeholder: ''
})

const emit = defineEmits<{
  load: [e: Event]
  error: [e: Event]
}>()

const imgRef = ref<HTMLImageElement>()
const loading = ref(true)
const hasError = ref(false)
const showPreview = ref(false)
const currentSrc = ref(props.placeholder || props.src)

// 预览状态
const previewRotate = ref(0)
const previewScale = ref(1)

// 容器样式
const containerStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  return style
})

// 图片样式
const imageStyle = computed(() => ({
  objectFit: props.fit
}))

// 预览图片样式
const previewImageStyle = computed(() => ({
  transform: `rotate(${previewRotate.value}deg) scale(${previewScale.value})`
}))

// 加载成功
const handleLoad = (e: Event) => {
  loading.value = false
  hasError.value = false
  emit('load', e)
}

// 加载失败
const handleError = (e: Event) => {
  loading.value = false
  
  if (props.fallback && currentSrc.value !== props.fallback) {
    currentSrc.value = props.fallback
    loading.value = true
  } else {
    hasError.value = true
  }
  
  emit('error', e)
}

// 打开预览
const handlePreview = () => {
  if (props.preview && !hasError.value) {
    showPreview.value = true
    previewRotate.value = 0
    previewScale.value = 1
    document.body.style.overflow = 'hidden'
  }
}

// 关闭预览
const closePreview = () => {
  showPreview.value = false
  document.body.style.overflow = ''
}

// 旋转
const handleRotate = (deg: number) => {
  previewRotate.value += deg
}

// 缩放
const handleZoom = (delta: number) => {
  const newScale = previewScale.value + delta
  if (newScale >= 0.2 && newScale <= 5) {
    previewScale.value = newScale
  }
}

// 重置
const handleReset = () => {
  previewRotate.value = 0
  previewScale.value = 1
}

// 懒加载
const lazyLoad = () => {
  if (!props.lazy || !imgRef.value) {
    currentSrc.value = props.src
    return
  }
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      currentSrc.value = props.src
      observer.disconnect()
    }
  })
  
  observer.observe(imgRef.value)
}

// 监听 src 变化
watch(() => props.src, (newSrc) => {
  loading.value = true
  hasError.value = false
  currentSrc.value = props.placeholder || newSrc
  
  if (!props.lazy) {
    currentSrc.value = newSrc
  }
})

onMounted(() => {
  lazyLoad()
})
</script>

<style scoped>
.image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.image {
  display: block;
  width: 100%;
  height: 100%;
}

.image-preview {
  cursor: pointer;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e8e8e8;
  border-top-color: var(--primary-color, #4B6EF5);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(0, 0, 0, 0.25);
  font-size: 12px;
}

/* 预览遮罩 */
.image-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
}

.image-container:hover .image-mask {
  opacity: 1;
}

/* 预览层 */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-toolbar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 24px;
}

.preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.preview-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  transition: transform 0.3s;
}

/* 动画 */
.preview-enter-active,
.preview-leave-active {
  transition: opacity 0.3s;
}

.preview-enter-from,
.preview-leave-to {
  opacity: 0;
}
</style>
