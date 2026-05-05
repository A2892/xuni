<template>
  <div class="tooltip-wrapper" @mouseenter="show" @mouseleave="hide" @focus="show" @blur="hide">
    <slot></slot>
    
    <Teleport to="body">
      <transition name="tooltip-fade">
        <div 
          v-if="visible"
          ref="tooltipRef"
          class="tooltip"
          :class="[`tooltip--${placement}`, `tooltip--${theme}`]"
          :style="tooltipStyle"
          role="tooltip"
        >
          <div class="tooltip-content">
            <slot name="content">{{ content }}</slot>
          </div>
          <div class="tooltip-arrow"></div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  theme?: 'dark' | 'light'
  delay?: number
  disabled?: boolean
  maxWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  theme: 'dark',
  delay: 100,
  maxWidth: 250
})

const visible = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
const position = ref({ top: 0, left: 0 })
let delayTimer: ReturnType<typeof setTimeout> | null = null
let triggerEl: HTMLElement | null = null

const tooltipStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  maxWidth: `${props.maxWidth}px`
}))

const updatePosition = async () => {
  await nextTick()
  
  if (!triggerEl || !tooltipRef.value) return
  
  const triggerRect = triggerEl.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const gap = 8
  
  let top = 0
  let left = 0
  
  switch (props.placement) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - gap
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + gap
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.left - tooltipRect.width - gap
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.right + gap
      break
  }
  
  // 边界检测
  const padding = 8
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  if (left < padding) left = padding
  if (left + tooltipRect.width > viewportWidth - padding) {
    left = viewportWidth - tooltipRect.width - padding
  }
  if (top < padding) top = padding
  if (top + tooltipRect.height > viewportHeight - padding) {
    top = viewportHeight - tooltipRect.height - padding
  }
  
  position.value = { top, left }
}

const show = (event: Event) => {
  if (props.disabled) return
  
  triggerEl = event.currentTarget as HTMLElement
  
  if (delayTimer) clearTimeout(delayTimer)
  
  delayTimer = setTimeout(() => {
    visible.value = true
    updatePosition()
  }, props.delay)
}

const hide = () => {
  if (delayTimer) {
    clearTimeout(delayTimer)
    delayTimer = null
  }
  visible.value = false
}

onMounted(() => {
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
  if (delayTimer) clearTimeout(delayTimer)
})
</script>

<style scoped>
.tooltip-wrapper {
  display: inline-flex;
}

.tooltip {
  position: fixed;
  z-index: 10001;
  pointer-events: none;
}

.tooltip-content {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  line-height: 1.4;
  border-radius: 6px;
  word-wrap: break-word;
}

.tooltip-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  transform: rotate(45deg);
}

/* Dark 主题 */
.tooltip--dark .tooltip-content {
  background: #1f2937;
  color: #fff;
}

.tooltip--dark .tooltip-arrow {
  background: #1f2937;
}

/* Light 主题 */
.tooltip--light .tooltip-content {
  background: #fff;
  color: #374151;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
}

.tooltip--light .tooltip-arrow {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-left: none;
}

/* 位置 */
.tooltip--top .tooltip-arrow {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

.tooltip--bottom .tooltip-arrow {
  top: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

.tooltip--left .tooltip-arrow {
  right: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.tooltip--right .tooltip-arrow {
  left: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

/* 过渡动画 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.15s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
