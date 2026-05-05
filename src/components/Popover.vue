<template>
  <div 
    class="popover-trigger"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="handleClick"
    ref="triggerRef"
  >
    <slot></slot>
  </div>
  
  <Teleport to="body">
    <Transition name="popover">
      <div 
        v-if="visible"
        class="popover"
        :class="[`popover-${placement}`, { 'has-arrow': showArrow }]"
        :style="popoverStyle"
        ref="popoverRef"
        @mouseenter="handlePopoverEnter"
        @mouseleave="handlePopoverLeave"
      >
        <!-- 箭头 -->
        <div v-if="showArrow" class="popover-arrow"></div>
        
        <!-- 标题 -->
        <div v-if="title || $slots.title" class="popover-title">
          <slot name="title">{{ title }}</slot>
        </div>
        
        <!-- 内容 -->
        <div class="popover-content">
          <slot name="content">{{ content }}</slot>
        </div>
        
        <!-- 确认模式 -->
        <div v-if="confirm" class="popover-actions">
          <button class="btn-cancel" @click="handleCancel">{{ cancelText }}</button>
          <button class="btn-confirm" @click="handleConfirm">{{ confirmText }}</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// Types
type Placement = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'

type Trigger = 'hover' | 'click' | 'focus' | 'manual'

// Props
interface Props {
  title?: string
  content?: string
  placement?: Placement
  trigger?: Trigger
  showArrow?: boolean
  offset?: number
  delay?: number
  hideDelay?: number
  disabled?: boolean
  width?: string | number
  maxWidth?: string | number
  confirm?: boolean
  confirmText?: string
  cancelText?: string
  appendToBody?: boolean
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  content: '',
  placement: 'top',
  trigger: 'hover',
  showArrow: true,
  offset: 8,
  delay: 100,
  hideDelay: 100,
  disabled: false,
  maxWidth: 300,
  confirm: false,
  confirmText: '确定',
  cancelText: '取消',
  appendToBody: true,
  zIndex: 2000
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'show': []
  'hide': []
  'confirm': []
  'cancel': []
}>()

// Refs
const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)

// State
const visible = ref(false)
const position = ref({ top: 0, left: 0 })
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

// Computed
const popoverStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  width: props.width ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : 'auto',
  maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
  zIndex: props.zIndex
}))

// Methods
function show() {
  if (props.disabled) return
  
  clearTimers()
  showTimer = setTimeout(() => {
    visible.value = true
    emit('update:visible', true)
    emit('show')
    
    nextTick(() => {
      updatePosition()
    })
  }, props.delay)
}

function hide() {
  clearTimers()
  hideTimer = setTimeout(() => {
    visible.value = false
    emit('update:visible', false)
    emit('hide')
  }, props.hideDelay)
}

function toggle() {
  if (visible.value) {
    hide()
  } else {
    show()
  }
}

function clearTimers() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function updatePosition() {
  if (!triggerRef.value || !popoverRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popoverRect = popoverRef.value.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  
  let top = 0
  let left = 0
  
  const basePlacement = props.placement.split('-')[0]
  const alignment = props.placement.split('-')[1]
  
  // 计算基础位置
  switch (basePlacement) {
    case 'top':
      top = triggerRect.top + scrollTop - popoverRect.height - props.offset
      left = triggerRect.left + scrollLeft + (triggerRect.width - popoverRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + scrollTop + props.offset
      left = triggerRect.left + scrollLeft + (triggerRect.width - popoverRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + scrollTop + (triggerRect.height - popoverRect.height) / 2
      left = triggerRect.left + scrollLeft - popoverRect.width - props.offset
      break
    case 'right':
      top = triggerRect.top + scrollTop + (triggerRect.height - popoverRect.height) / 2
      left = triggerRect.right + scrollLeft + props.offset
      break
  }
  
  // 处理对齐
  if (alignment === 'start') {
    if (basePlacement === 'top' || basePlacement === 'bottom') {
      left = triggerRect.left + scrollLeft
    } else {
      top = triggerRect.top + scrollTop
    }
  } else if (alignment === 'end') {
    if (basePlacement === 'top' || basePlacement === 'bottom') {
      left = triggerRect.right + scrollLeft - popoverRect.width
    } else {
      top = triggerRect.bottom + scrollTop - popoverRect.height
    }
  }
  
  // 边界检测
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // 右边界
  if (left + popoverRect.width > viewportWidth + scrollLeft - 10) {
    left = viewportWidth + scrollLeft - popoverRect.width - 10
  }
  // 左边界
  if (left < scrollLeft + 10) {
    left = scrollLeft + 10
  }
  // 下边界
  if (top + popoverRect.height > viewportHeight + scrollTop - 10) {
    top = viewportHeight + scrollTop - popoverRect.height - 10
  }
  // 上边界
  if (top < scrollTop + 10) {
    top = scrollTop + 10
  }
  
  position.value = { top, left }
}

// Event handlers
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
    toggle()
  }
}

function handlePopoverEnter() {
  if (props.trigger === 'hover') {
    clearTimers()
  }
}

function handlePopoverLeave() {
  if (props.trigger === 'hover') {
    hide()
  }
}

function handleConfirm() {
  emit('confirm')
  hide()
}

function handleCancel() {
  emit('cancel')
  hide()
}

function handleClickOutside(e: MouseEvent) {
  if (props.trigger !== 'click') return
  
  const target = e.target as Node
  if (
    triggerRef.value?.contains(target) ||
    popoverRef.value?.contains(target)
  ) {
    return
  }
  
  hide()
}

// Watch
watch(visible, (val) => {
  if (val) {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
  } else {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', updatePosition)
    window.removeEventListener('scroll', updatePosition, true)
  }
})

// Lifecycle
onUnmounted(() => {
  clearTimers()
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})

// Expose
defineExpose({
  show,
  hide,
  toggle,
  updatePosition
})
</script>

<style scoped>
.popover-trigger {
  display: inline-block;
}

.popover {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 12px 16px;
  font-size: 14px;
}

.popover-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  transform: rotate(45deg);
}

/* 箭头位置 */
.popover-top .popover-arrow,
.popover-top-start .popover-arrow,
.popover-top-end .popover-arrow {
  bottom: -4px;
  left: 50%;
  margin-left: -4px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.08);
}

.popover-top-start .popover-arrow {
  left: 16px;
}

.popover-top-end .popover-arrow {
  left: auto;
  right: 16px;
}

.popover-bottom .popover-arrow,
.popover-bottom-start .popover-arrow,
.popover-bottom-end .popover-arrow {
  top: -4px;
  left: 50%;
  margin-left: -4px;
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.08);
}

.popover-bottom-start .popover-arrow {
  left: 16px;
}

.popover-bottom-end .popover-arrow {
  left: auto;
  right: 16px;
}

.popover-left .popover-arrow,
.popover-left-start .popover-arrow,
.popover-left-end .popover-arrow {
  right: -4px;
  top: 50%;
  margin-top: -4px;
  box-shadow: 2px -2px 4px rgba(0, 0, 0, 0.08);
}

.popover-left-start .popover-arrow {
  top: 12px;
}

.popover-left-end .popover-arrow {
  top: auto;
  bottom: 12px;
}

.popover-right .popover-arrow,
.popover-right-start .popover-arrow,
.popover-right-end .popover-arrow {
  left: -4px;
  top: 50%;
  margin-top: -4px;
  box-shadow: -2px 2px 4px rgba(0, 0, 0, 0.08);
}

.popover-right-start .popover-arrow {
  top: 12px;
}

.popover-right-end .popover-arrow {
  top: auto;
  bottom: 12px;
}

.popover-title {
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.popover-content {
  color: #666;
  line-height: 1.5;
}

.popover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.popover-actions button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  border: none;
  color: #666;
}

.btn-cancel:hover {
  background: #e8e8e8;
}

.btn-confirm {
  background: var(--primary-color, #4B6EF5);
  border: none;
  color: white;
}

.btn-confirm:hover {
  opacity: 0.9;
}

/* 动画 */
.popover-enter-active,
.popover-leave-active {
  transition: all 0.2s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
