<template>
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div
        v-if="visible"
        ref="tooltipRef"
        class="tooltip"
        :class="[
          `tooltip--${effect}`,
          `tooltip--${actualPlacement}`
        ]"
        :style="tooltipStyle"
        role="tooltip"
      >
        <div class="tooltip__content">
          <slot name="content">{{ content }}</slot>
        </div>
        <div class="tooltip__arrow" :style="arrowStyle" />
      </div>
    </Transition>
  </Teleport>
  
  <div
    ref="triggerRef"
    class="tooltip__trigger"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="handleClick"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

type Placement = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'

interface Props {
  // 提示内容
  content?: string
  // 位置
  placement?: Placement
  // 触发方式
  trigger?: 'hover' | 'click' | 'focus' | 'manual'
  // 是否禁用
  disabled?: boolean
  // 显示延迟
  showDelay?: number
  // 隐藏延迟
  hideDelay?: number
  // 效果
  effect?: 'dark' | 'light'
  // 是否显示箭头
  showArrow?: boolean
  // 偏移量
  offset?: number
  // 手动控制显示
  modelValue?: boolean
  // 最大宽度
  maxWidth?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  trigger: 'hover',
  disabled: false,
  showDelay: 0,
  hideDelay: 100,
  effect: 'dark',
  showArrow: true,
  offset: 8
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'show'): void
  (e: 'hide'): void
}>()

const triggerRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
const visible = ref(false)
const actualPlacement = ref<Placement>(props.placement)
const tooltipStyle = ref<Record<string, string>>({})
const arrowStyle = ref<Record<string, string>>({})

let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

// 更新位置
function updatePosition() {
  if (!triggerRef.value || !tooltipRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  
  let placement = props.placement
  let top = 0
  let left = 0
  
  // 计算位置
  const offset = props.offset + (props.showArrow ? 6 : 0)
  
  switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
      top = triggerRect.top - tooltipRect.height - offset
      break
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      top = triggerRect.bottom + offset
      break
    case 'left':
    case 'left-start':
    case 'left-end':
      left = triggerRect.left - tooltipRect.width - offset
      break
    case 'right':
    case 'right-start':
    case 'right-end':
      left = triggerRect.right + offset
      break
  }
  
  // 水平位置
  if (placement.startsWith('top') || placement.startsWith('bottom')) {
    if (placement.endsWith('-start')) {
      left = triggerRect.left
    } else if (placement.endsWith('-end')) {
      left = triggerRect.right - tooltipRect.width
    } else {
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
    }
  }
  
  // 垂直位置
  if (placement.startsWith('left') || placement.startsWith('right')) {
    if (placement.endsWith('-start')) {
      top = triggerRect.top
    } else if (placement.endsWith('-end')) {
      top = triggerRect.bottom - tooltipRect.height
    } else {
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
    }
  }
  
  // 边界检测和自动翻转
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // 检测是否超出视口
  if (top < 0 && placement.startsWith('top')) {
    placement = placement.replace('top', 'bottom') as Placement
    top = triggerRect.bottom + offset
  } else if (top + tooltipRect.height > viewportHeight && placement.startsWith('bottom')) {
    placement = placement.replace('bottom', 'top') as Placement
    top = triggerRect.top - tooltipRect.height - offset
  }
  
  if (left < 0 && placement.startsWith('left')) {
    placement = placement.replace('left', 'right') as Placement
    left = triggerRect.right + offset
  } else if (left + tooltipRect.width > viewportWidth && placement.startsWith('right')) {
    placement = placement.replace('right', 'left') as Placement
    left = triggerRect.left - tooltipRect.width - offset
  }
  
  // 确保不超出视口
  left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8))
  top = Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8))
  
  actualPlacement.value = placement
  
  tooltipStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
    ...(props.maxWidth ? { maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth } : {})
  }
  
  // 计算箭头位置
  updateArrowPosition(triggerRect, tooltipRect, left, top)
}

// 更新箭头位置
function updateArrowPosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  tooltipLeft: number,
  tooltipTop: number
) {
  const style: Record<string, string> = {}
  const placement = actualPlacement.value
  
  if (placement.startsWith('top') || placement.startsWith('bottom')) {
    const triggerCenter = triggerRect.left + triggerRect.width / 2
    const arrowLeft = triggerCenter - tooltipLeft
    style.left = `${Math.max(10, Math.min(arrowLeft, tooltipRect.width - 10))}px`
  }
  
  if (placement.startsWith('left') || placement.startsWith('right')) {
    const triggerCenter = triggerRect.top + triggerRect.height / 2
    const arrowTop = triggerCenter - tooltipTop
    style.top = `${Math.max(10, Math.min(arrowTop, tooltipRect.height - 10))}px`
  }
  
  arrowStyle.value = style
}

// 显示
function show() {
  if (props.disabled) return
  
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  
  if (props.showDelay) {
    showTimer = setTimeout(() => {
      visible.value = true
      nextTick(updatePosition)
      emit('show')
    }, props.showDelay)
  } else {
    visible.value = true
    nextTick(updatePosition)
    emit('show')
  }
}

// 隐藏
function hide() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
  
  if (props.hideDelay) {
    hideTimer = setTimeout(() => {
      visible.value = false
      emit('hide')
    }, props.hideDelay)
  } else {
    visible.value = false
    emit('hide')
  }
}

// 事件处理
function handleMouseEnter() {
  if (props.trigger === 'hover') {
    show()
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover') {
    hide()
  }
}

function handleFocus() {
  if (props.trigger === 'focus') {
    show()
  }
}

function handleBlur() {
  if (props.trigger === 'focus') {
    hide()
  }
}

function handleClick() {
  if (props.trigger === 'click') {
    if (visible.value) {
      hide()
    } else {
      show()
    }
  }
}

// 监听 modelValue
watch(() => props.modelValue, (val) => {
  if (props.trigger === 'manual') {
    if (val) {
      show()
    } else {
      hide()
    }
  }
})

// 监听 visible 变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 监听窗口事件
function handleScroll() {
  if (visible.value) {
    updatePosition()
  }
}

function handleResize() {
  if (visible.value) {
    updatePosition()
  }
}

function handleClickOutside(e: MouseEvent) {
  if (
    props.trigger === 'click' &&
    visible.value &&
    triggerRef.value &&
    !triggerRef.value.contains(e.target as Node) &&
    tooltipRef.value &&
    !tooltipRef.value.contains(e.target as Node)
  ) {
    hide()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
  
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
})

// 暴露方法
defineExpose({
  show,
  hide,
  updatePosition
})
</script>

<style scoped>
.tooltip__trigger {
  display: inline-block;
}

.tooltip {
  z-index: 2000;
  max-width: 300px;
  word-wrap: break-word;
}

.tooltip__content {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
}

/* 深色主题 */
.tooltip--dark .tooltip__content {
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
}

.tooltip--dark .tooltip__arrow {
  border-color: rgba(0, 0, 0, 0.85);
}

/* 浅色主题 */
.tooltip--light .tooltip__content {
  background: #fff;
  color: #333;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 6px 16px 0 rgba(0, 0, 0, 0.08),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.tooltip--light .tooltip__arrow {
  border-color: #fff;
}

/* 箭头 */
.tooltip__arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
}

/* 箭头位置 */
.tooltip--top .tooltip__arrow,
.tooltip--top-start .tooltip__arrow,
.tooltip--top-end .tooltip__arrow {
  bottom: -4px;
}

.tooltip--dark.tooltip--top .tooltip__arrow,
.tooltip--dark.tooltip--top-start .tooltip__arrow,
.tooltip--dark.tooltip--top-end .tooltip__arrow {
  background: rgba(0, 0, 0, 0.85);
}

.tooltip--light.tooltip--top .tooltip__arrow,
.tooltip--light.tooltip--top-start .tooltip__arrow,
.tooltip--light.tooltip--top-end .tooltip__arrow {
  background: #fff;
  box-shadow: 3px 3px 7px rgba(0, 0, 0, 0.07);
}

.tooltip--bottom .tooltip__arrow,
.tooltip--bottom-start .tooltip__arrow,
.tooltip--bottom-end .tooltip__arrow {
  top: -4px;
}

.tooltip--dark.tooltip--bottom .tooltip__arrow,
.tooltip--dark.tooltip--bottom-start .tooltip__arrow,
.tooltip--dark.tooltip--bottom-end .tooltip__arrow {
  background: rgba(0, 0, 0, 0.85);
}

.tooltip--light.tooltip--bottom .tooltip__arrow,
.tooltip--light.tooltip--bottom-start .tooltip__arrow,
.tooltip--light.tooltip--bottom-end .tooltip__arrow {
  background: #fff;
  box-shadow: -1px -1px 4px rgba(0, 0, 0, 0.03);
}

.tooltip--left .tooltip__arrow,
.tooltip--left-start .tooltip__arrow,
.tooltip--left-end .tooltip__arrow {
  right: -4px;
}

.tooltip--dark.tooltip--left .tooltip__arrow,
.tooltip--dark.tooltip--left-start .tooltip__arrow,
.tooltip--dark.tooltip--left-end .tooltip__arrow {
  background: rgba(0, 0, 0, 0.85);
}

.tooltip--light.tooltip--left .tooltip__arrow,
.tooltip--light.tooltip--left-start .tooltip__arrow,
.tooltip--light.tooltip--left-end .tooltip__arrow {
  background: #fff;
  box-shadow: 3px -3px 7px rgba(0, 0, 0, 0.07);
}

.tooltip--right .tooltip__arrow,
.tooltip--right-start .tooltip__arrow,
.tooltip--right-end .tooltip__arrow {
  left: -4px;
}

.tooltip--dark.tooltip--right .tooltip__arrow,
.tooltip--dark.tooltip--right-start .tooltip__arrow,
.tooltip--dark.tooltip--right-end .tooltip__arrow {
  background: rgba(0, 0, 0, 0.85);
}

.tooltip--light.tooltip--right .tooltip__arrow,
.tooltip--light.tooltip--right-start .tooltip__arrow,
.tooltip--light.tooltip--right-end .tooltip__arrow {
  background: #fff;
  box-shadow: -3px 3px 7px rgba(0, 0, 0, 0.07);
}

/* 动画 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
