<template>
  <div 
    class="affix"
    :class="{ 'affix--fixed': isFixed }"
    :style="rootStyle"
    ref="rootRef"
  >
    <div class="affix__content" :style="affixStyle">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  // 距离窗口顶部达到指定偏移量后触发
  offsetTop?: number
  // 距离窗口底部达到指定偏移量后触发
  offsetBottom?: number
  // 指定容器
  target?: string | HTMLElement
  // z-index
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  offsetTop: 0,
  zIndex: 100
})

const emit = defineEmits<{
  (e: 'change', fixed: boolean): void
}>()

const rootRef = ref<HTMLElement>()
const isFixed = ref(false)

// 原始位置信息
const rootRect = ref({
  top: 0,
  left: 0,
  width: 0,
  height: 0
})

// 容器元素
let container: HTMLElement | Window = window

// 根元素样式 (占位)
const rootStyle = computed(() => {
  if (!isFixed.value) return {}
  return {
    width: `${rootRect.value.width}px`,
    height: `${rootRect.value.height}px`
  }
})

// 固定元素样式
const affixStyle = computed(() => {
  if (!isFixed.value) return {}
  
  const style: Record<string, string> = {
    position: 'fixed',
    width: `${rootRect.value.width}px`,
    zIndex: String(props.zIndex)
  }
  
  if (props.offsetBottom !== undefined) {
    style.bottom = `${props.offsetBottom}px`
  } else {
    style.top = `${props.offsetTop}px`
  }
  
  // 保持水平位置
  style.left = `${rootRect.value.left}px`
  
  return style
})

// 更新位置信息
function updatePosition() {
  if (!rootRef.value) return
  
  const rect = rootRef.value.getBoundingClientRect()
  
  // 只在非固定状态下更新原始位置
  if (!isFixed.value) {
    rootRect.value = {
      top: rect.top + window.scrollY,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  }
}

// 检查是否应该固定
function checkFixed() {
  if (!rootRef.value) return
  
  const scrollTop = container === window 
    ? document.documentElement.scrollTop || document.body.scrollTop
    : (container as HTMLElement).scrollTop
  
  const viewportHeight = window.innerHeight
  
  let shouldFix = false
  
  if (props.offsetBottom !== undefined) {
    // 固定到底部
    const elementBottom = rootRect.value.top + rootRect.value.height
    const triggerPoint = scrollTop + viewportHeight - props.offsetBottom
    shouldFix = elementBottom > triggerPoint
  } else {
    // 固定到顶部
    shouldFix = rootRect.value.top - props.offsetTop < scrollTop
  }
  
  if (shouldFix !== isFixed.value) {
    isFixed.value = shouldFix
    emit('change', shouldFix)
  }
}

// 滚动处理
function handleScroll() {
  requestAnimationFrame(() => {
    if (!isFixed.value) {
      updatePosition()
    }
    checkFixed()
  })
}

// 窗口大小变化
function handleResize() {
  isFixed.value = false
  nextTick(() => {
    updatePosition()
    checkFixed()
  })
}

// 获取容器元素
function getContainer(): HTMLElement | Window {
  if (!props.target) return window
  
  if (typeof props.target === 'string') {
    return document.querySelector(props.target) || window
  }
  
  return props.target
}

onMounted(() => {
  container = getContainer()
  
  updatePosition()
  
  if (container === window) {
    window.addEventListener('scroll', handleScroll, { passive: true })
  } else {
    (container as HTMLElement).addEventListener('scroll', handleScroll, { passive: true })
  }
  
  window.addEventListener('resize', handleResize)
  
  // 初始检查
  nextTick(checkFixed)
})

onUnmounted(() => {
  if (container === window) {
    window.removeEventListener('scroll', handleScroll)
  } else {
    (container as HTMLElement).removeEventListener('scroll', handleScroll)
  }
  
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.affix {
  display: inline-block;
}

.affix__content {
  transition: none;
}

.affix--fixed .affix__content {
  /* 固定时的基础样式 */
}
</style>
