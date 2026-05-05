<template>
  <button
    type="button"
    class="back-top"
    :class="{ 'back-top--visible': visible }"
    :style="positionStyle"
    @click="scrollToTop"
  >
    <slot>
      <IconLib name="arrow-up" :size="20" />
    </slot>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 滚动高度达到此参数值才出现
  visibilityHeight?: number
  // 距离页面右部的距离
  right?: number
  // 距离页面底部的距离
  bottom?: number
  // 滚动目标
  target?: string | HTMLElement
  // 动画时长
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  visibilityHeight: 400,
  right: 40,
  bottom: 40,
  duration: 300
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const visible = ref(false)
let targetElement: HTMLElement | Window = window

// 位置样式
const positionStyle = computed(() => ({
  right: `${props.right}px`,
  bottom: `${props.bottom}px`
}))

// 获取滚动位置
function getScrollTop(): number {
  if (targetElement === window) {
    return document.documentElement.scrollTop || document.body.scrollTop
  }
  return (targetElement as HTMLElement).scrollTop
}

// 设置滚动位置
function setScrollTop(value: number): void {
  if (targetElement === window) {
    document.documentElement.scrollTop = value
    document.body.scrollTop = value
  } else {
    (targetElement as HTMLElement).scrollTop = value
  }
}

// 滚动事件处理
function handleScroll() {
  visible.value = getScrollTop() >= props.visibilityHeight
}

// 滚动到顶部
function scrollToTop(event: MouseEvent) {
  emit('click', event)
  
  const startTime = Date.now()
  const startTop = getScrollTop()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    
    // easeOutCubic 缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    const currentTop = startTop * (1 - easeProgress)
    
    setScrollTop(currentTop)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

// 获取目标元素
function getTargetElement(): HTMLElement | Window {
  if (!props.target) {
    return window
  }
  
  if (typeof props.target === 'string') {
    return document.querySelector(props.target) || window
  }
  
  return props.target
}

onMounted(() => {
  targetElement = getTargetElement()
  
  if (targetElement === window) {
    window.addEventListener('scroll', handleScroll, { passive: true })
  } else {
    (targetElement as HTMLElement).addEventListener('scroll', handleScroll, { passive: true })
  }
  
  // 初始检查
  handleScroll()
})

onUnmounted(() => {
  if (targetElement === window) {
    window.removeEventListener('scroll', handleScroll)
  } else {
    (targetElement as HTMLElement).removeEventListener('scroll', handleScroll)
  }
})

// 暴露方法
defineExpose({
  scrollToTop
})
</script>

<style scoped>
.back-top {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-color, #fff);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: var(--text-secondary, #606266);
  cursor: pointer;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.back-top:hover {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(75, 110, 245, 0.3);
}

.back-top--visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
</style>
