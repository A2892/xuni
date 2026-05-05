<template>
  <div class="carousel" :class="carouselClasses">
    <!-- 幻灯片容器 -->
    <div 
      ref="trackRef"
      class="carousel__track"
      :style="trackStyle"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div 
        v-for="(item, index) in slides" 
        :key="index"
        class="carousel__slide"
        :class="{ 'carousel__slide--active': index === currentIndex }"
      >
        <slot name="item" :item="item" :index="index">
          <img v-if="typeof item === 'string'" :src="item" alt="" />
        </slot>
      </div>
    </div>
    
    <!-- 箭头导航 -->
    <template v-if="arrows">
      <button 
        type="button"
        class="carousel__arrow carousel__arrow--prev"
        :disabled="!loop && currentIndex === 0"
        @click="prev"
      >
        <IconLib name="left" :size="20" />
      </button>
      <button 
        type="button"
        class="carousel__arrow carousel__arrow--next"
        :disabled="!loop && currentIndex === slides.length - 1"
        @click="next"
      >
        <IconLib name="right" :size="20" />
      </button>
    </template>
    
    <!-- 指示器 -->
    <div v-if="dots" class="carousel__dots" :class="`carousel__dots--${dotPosition}`">
      <button
        v-for="(_, index) in slides"
        :key="index"
        type="button"
        class="carousel__dot"
        :class="{ 'carousel__dot--active': index === currentIndex }"
        @click="goTo(index)"
      >
        <span v-if="dotType === 'number'">{{ index + 1 }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 幻灯片数据
  slides?: any[]
  // 当前索引
  modelValue?: number
  // 自动播放
  autoplay?: boolean
  // 自动播放间隔 (ms)
  interval?: number
  // 切换动画时长 (ms)
  duration?: number
  // 是否循环
  loop?: boolean
  // 是否显示箭头
  arrows?: boolean
  // 是否显示指示器
  dots?: boolean
  // 指示器位置
  dotPosition?: 'bottom' | 'top' | 'left' | 'right'
  // 指示器类型
  dotType?: 'dot' | 'line' | 'number'
  // 方向
  direction?: 'horizontal' | 'vertical'
  // 动画效果
  effect?: 'slide' | 'fade' | 'card'
  // 暂停于悬停
  pauseOnHover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  slides: () => [],
  modelValue: 0,
  autoplay: false,
  interval: 3000,
  duration: 500,
  loop: true,
  arrows: true,
  dots: true,
  dotPosition: 'bottom',
  dotType: 'dot',
  direction: 'horizontal',
  effect: 'slide',
  pauseOnHover: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', index: number): void
  (e: 'change', index: number): void
}>()

const trackRef = ref<HTMLElement>()
const currentIndex = ref(props.modelValue)
const isAnimating = ref(false)
const isPaused = ref(false)
let autoplayTimer: number | null = null

// 触摸相关
let touchStartX = 0
let touchStartY = 0
let touchStartTime = 0

const carouselClasses = computed(() => [
  `carousel--${props.direction}`,
  `carousel--${props.effect}`
])

const trackStyle = computed(() => {
  if (props.effect === 'slide') {
    const offset = props.direction === 'horizontal'
      ? `translateX(-${currentIndex.value * 100}%)`
      : `translateY(-${currentIndex.value * 100}%)`
    
    return {
      transform: offset,
      transition: isAnimating.value ? `transform ${props.duration}ms ease` : 'none'
    }
  }
  
  return {}
})

// 跳转到指定位置
function goTo(index: number) {
  if (isAnimating.value) return
  
  let targetIndex = index
  
  if (props.loop) {
    if (index < 0) {
      targetIndex = props.slides.length - 1
    } else if (index >= props.slides.length) {
      targetIndex = 0
    }
  } else {
    targetIndex = Math.max(0, Math.min(index, props.slides.length - 1))
  }
  
  if (targetIndex === currentIndex.value) return
  
  isAnimating.value = true
  currentIndex.value = targetIndex
  emit('update:modelValue', targetIndex)
  emit('change', targetIndex)
  
  setTimeout(() => {
    isAnimating.value = false
  }, props.duration)
}

// 下一张
function next() {
  goTo(currentIndex.value + 1)
}

// 上一张
function prev() {
  goTo(currentIndex.value - 1)
}

// 开始自动播放
function startAutoplay() {
  if (!props.autoplay || autoplayTimer) return
  
  autoplayTimer = window.setInterval(() => {
    if (!isPaused.value) {
      next()
    }
  }, props.interval)
}

// 停止自动播放
function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

// 暂停 (悬停时)
function pause() {
  if (props.pauseOnHover) {
    isPaused.value = true
  }
}

// 恢复
function resume() {
  isPaused.value = false
}

// 触摸事件
function handleTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0].clientX
  touchStartY = event.touches[0].clientY
  touchStartTime = Date.now()
}

function handleTouchMove(event: TouchEvent) {
  // 可以添加跟随手指的效果
}

function handleTouchEnd(event: TouchEvent) {
  const touchEndX = event.changedTouches[0].clientX
  const touchEndY = event.changedTouches[0].clientY
  const touchDuration = Date.now() - touchStartTime
  
  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY
  
  // 滑动距离阈值和时间阈值
  const threshold = 50
  const timeThreshold = 300
  
  if (props.direction === 'horizontal') {
    if (Math.abs(deltaX) > threshold && touchDuration < timeThreshold) {
      if (deltaX > 0) {
        prev()
      } else {
        next()
      }
    }
  } else {
    if (Math.abs(deltaY) > threshold && touchDuration < timeThreshold) {
      if (deltaY > 0) {
        prev()
      } else {
        next()
      }
    }
  }
}

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  if (val !== currentIndex.value) {
    goTo(val)
  }
})

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})

// 导出方法
defineExpose({
  next,
  prev,
  goTo,
  pause,
  resume
})
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel__track {
  display: flex;
  height: 100%;
}

.carousel--vertical .carousel__track {
  flex-direction: column;
}

.carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
}

.carousel__slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 淡入淡出效果 */
.carousel--fade .carousel__track {
  position: relative;
}

.carousel--fade .carousel__slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.carousel--fade .carousel__slide--active {
  opacity: 1;
}

/* 箭头 */
.carousel__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.carousel__arrow:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.5);
}

.carousel__arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel__arrow--prev {
  left: 16px;
}

.carousel__arrow--next {
  right: 16px;
}

/* 垂直模式箭头 */
.carousel--vertical .carousel__arrow {
  transform: translateX(-50%) rotate(90deg);
  left: 50%;
  top: auto;
}

.carousel--vertical .carousel__arrow--prev {
  top: 16px;
}

.carousel--vertical .carousel__arrow--next {
  bottom: 16px;
  top: auto;
}

/* 指示器 */
.carousel__dots {
  position: absolute;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.carousel__dots--bottom {
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
}

.carousel__dots--top {
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
}

.carousel__dots--left {
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.carousel__dots--right {
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.carousel__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.carousel__dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

.carousel__dot--active {
  width: 24px;
  border-radius: 4px;
  background: #fff;
}

/* 垂直模式指示器 */
.carousel--vertical .carousel__dots--bottom,
.carousel--vertical .carousel__dots--top {
  flex-direction: column;
}

.carousel--vertical .carousel__dot--active {
  width: 8px;
  height: 24px;
}
</style>
