<template>
  <div 
    class="virtual-list"
    :style="{ height: `${height}px` }"
    @scroll="handleScroll"
    ref="containerRef"
  >
    <div 
      class="virtual-list-phantom"
      :style="{ height: `${totalHeight}px` }"
    ></div>
    
    <div 
      class="virtual-list-content"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="item in visibleItems"
        :key="getItemKey(item.data)"
        class="virtual-list-item"
        :style="{ height: getItemHeight(item.data) + 'px' }"
      >
        <slot :item="item.data" :index="item.index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'

// Props
interface Props {
  items: any[]
  height: number
  itemHeight: number | ((item: any, index: number) => number)
  buffer?: number
  keyField?: string
}

const props = withDefaults(defineProps<Props>(), {
  buffer: 5,
  keyField: 'id'
})

// Emits
const emit = defineEmits<{
  'scroll': [scrollTop: number]
  'reach-top': []
  'reach-bottom': []
}>()

// Refs
const containerRef = ref<HTMLElement | null>(null)

// State
const scrollTop = ref(0)
const positions = ref<{ index: number; top: number; bottom: number; height: number }[]>([])

// Computed
const isFixedHeight = computed(() => typeof props.itemHeight === 'number')

const estimatedItemHeight = computed(() => {
  if (isFixedHeight.value) {
    return props.itemHeight as number
  }
  
  // 动态高度时使用位置缓存的平均值
  if (positions.value.length > 0) {
    const totalHeight = positions.value.reduce((sum, pos) => sum + pos.height, 0)
    return totalHeight / positions.value.length
  }
  
  return 50 // 默认估算高度
})

const totalHeight = computed(() => {
  if (isFixedHeight.value) {
    return props.items.length * (props.itemHeight as number)
  }
  
  // 动态高度
  if (positions.value.length > 0) {
    return positions.value[positions.value.length - 1]?.bottom || 0
  }
  
  return props.items.length * estimatedItemHeight.value
})

const visibleCount = computed(() => {
  return Math.ceil(props.height / estimatedItemHeight.value) + props.buffer * 2
})

const startIndex = computed(() => {
  if (isFixedHeight.value) {
    return Math.max(0, Math.floor(scrollTop.value / (props.itemHeight as number)) - props.buffer)
  }
  
  // 二分查找
  return binarySearch(positions.value, scrollTop.value) - props.buffer
})

const endIndex = computed(() => {
  return Math.min(props.items.length, startIndex.value + visibleCount.value)
})

const offsetY = computed(() => {
  if (isFixedHeight.value) {
    return startIndex.value * (props.itemHeight as number)
  }
  
  if (startIndex.value >= 0 && positions.value[startIndex.value]) {
    return positions.value[startIndex.value].top
  }
  
  return 0
})

const visibleItems = computed(() => {
  const start = Math.max(0, startIndex.value)
  const end = Math.min(props.items.length, endIndex.value)
  
  return props.items.slice(start, end).map((item, i) => ({
    data: item,
    index: start + i
  }))
})

// Methods
function getItemKey(item: any): string | number {
  if (typeof item === 'object' && item !== null) {
    return item[props.keyField] ?? JSON.stringify(item)
  }
  return String(item)
}

function getItemHeight(item: any): number {
  if (isFixedHeight.value) {
    return props.itemHeight as number
  }
  
  const index = props.items.indexOf(item)
  if (positions.value[index]) {
    return positions.value[index].height
  }
  
  if (typeof props.itemHeight === 'function') {
    return props.itemHeight(item, index)
  }
  
  return estimatedItemHeight.value
}

function binarySearch(positions: { top: number }[], value: number): number {
  let start = 0
  let end = positions.length - 1
  let result = 0
  
  while (start <= end) {
    const mid = Math.floor((start + end) / 2)
    const midValue = positions[mid]?.top ?? 0
    
    if (midValue <= value) {
      result = mid
      start = mid + 1
    } else {
      end = mid - 1
    }
  }
  
  return result
}

function initPositions() {
  if (isFixedHeight.value) return
  
  positions.value = props.items.map((item, index) => {
    const height = typeof props.itemHeight === 'function'
      ? props.itemHeight(item, index)
      : estimatedItemHeight.value
    
    return {
      index,
      height,
      top: index === 0 ? 0 : positions.value[index - 1]?.bottom ?? index * height,
      bottom: index === 0 ? height : (positions.value[index - 1]?.bottom ?? index * height) + height
    }
  })
}

function updatePositions() {
  if (isFixedHeight.value) return
  
  nextTick(() => {
    const contentEl = containerRef.value?.querySelector('.virtual-list-content')
    if (!contentEl) return
    
    const items = contentEl.querySelectorAll('.virtual-list-item')
    const start = Math.max(0, startIndex.value)
    
    items.forEach((node, i) => {
      const index = start + i
      const rect = node.getBoundingClientRect()
      const height = rect.height
      
      if (positions.value[index]) {
        const oldHeight = positions.value[index].height
        const diff = height - oldHeight
        
        if (diff !== 0) {
          positions.value[index].height = height
          positions.value[index].bottom = positions.value[index].top + height
          
          // 更新后续项的位置
          for (let j = index + 1; j < positions.value.length; j++) {
            positions.value[j].top = positions.value[j - 1].bottom
            positions.value[j].bottom = positions.value[j].top + positions.value[j].height
          }
        }
      }
    })
  })
}

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop
  
  emit('scroll', scrollTop.value)
  
  // 触顶检测
  if (scrollTop.value === 0) {
    emit('reach-top')
  }
  
  // 触底检测
  if (target.scrollHeight - target.scrollTop - target.clientHeight < 1) {
    emit('reach-bottom')
  }
  
  updatePositions()
}

function scrollTo(offset: number) {
  if (containerRef.value) {
    containerRef.value.scrollTop = offset
  }
}

function scrollToIndex(index: number, behavior: ScrollBehavior = 'auto') {
  if (isFixedHeight.value) {
    scrollTo(index * (props.itemHeight as number))
  } else if (positions.value[index]) {
    const top = positions.value[index].top
    if (containerRef.value) {
      containerRef.value.scrollTo({ top, behavior })
    }
  }
}

function scrollToTop(behavior: ScrollBehavior = 'auto') {
  if (containerRef.value) {
    containerRef.value.scrollTo({ top: 0, behavior })
  }
}

function scrollToBottom(behavior: ScrollBehavior = 'auto') {
  if (containerRef.value) {
    containerRef.value.scrollTo({ top: totalHeight.value, behavior })
  }
}

// Watch
watch(() => props.items, () => {
  initPositions()
}, { deep: true })

watch(visibleItems, () => {
  updatePositions()
})

// Lifecycle
onMounted(() => {
  initPositions()
})

// Expose
defineExpose({
  scrollTo,
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  getScrollTop: () => scrollTop.value
})
</script>

<style scoped>
.virtual-list {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.virtual-list-phantom {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-list-item {
  box-sizing: border-box;
}
</style>
