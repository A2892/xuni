<template>
  <div 
    class="drawer-overlay"
    :class="{ 'is-visible': modelValue }"
    @click.self="handleOverlayClick"
  >
    <Transition :name="`drawer-${placement}`">
      <div 
        v-if="modelValue"
        class="drawer"
        :class="[
          `drawer-${placement}`,
          `drawer-${size}`,
          { 'has-footer': $slots.footer }
        ]"
        :style="drawerStyle"
      >
        <!-- 头部 -->
        <div class="drawer-header" v-if="showHeader">
          <slot name="header">
            <h3 class="drawer-title">{{ title }}</h3>
            <p v-if="subtitle" class="drawer-subtitle">{{ subtitle }}</p>
          </slot>
          <button 
            v-if="closable"
            class="drawer-close"
            @click="handleClose"
          >
            <IconLib name="x" :size="20" />
          </button>
        </div>
        
        <!-- 内容 -->
        <div class="drawer-body">
          <slot></slot>
        </div>
        
        <!-- 底部 -->
        <div class="drawer-footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Props
interface Props {
  modelValue: boolean
  title?: string
  subtitle?: string
  placement?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'small' | 'default' | 'large'
  width?: string | number
  height?: string | number
  closable?: boolean
  maskClosable?: boolean
  showHeader?: boolean
  destroyOnClose?: boolean
  lockScroll?: boolean
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  placement: 'right',
  size: 'default',
  closable: true,
  maskClosable: true,
  showHeader: true,
  destroyOnClose: false,
  lockScroll: true,
  zIndex: 1000
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open': []
  'close': []
  'opened': []
  'closed': []
}>()

// Computed
const sizeMap = {
  small: {
    horizontal: '300px',
    vertical: '200px'
  },
  default: {
    horizontal: '400px',
    vertical: '300px'
  },
  large: {
    horizontal: '600px',
    vertical: '400px'
  }
}

const drawerStyle = computed(() => {
  const style: Record<string, string> = {
    zIndex: String(props.zIndex)
  }
  
  const isHorizontal = props.placement === 'left' || props.placement === 'right'
  
  if (props.width && isHorizontal) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height && !isHorizontal) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  return style
})

// Methods
function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleOverlayClick() {
  if (props.maskClosable) {
    handleClose()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closable && props.modelValue) {
    handleClose()
  }
}

// Watch
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    emit('open')
    
    if (props.lockScroll) {
      document.body.style.overflow = 'hidden'
    }
  } else {
    if (props.lockScroll) {
      document.body.style.overflow = ''
    }
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  z-index: v-bind('zIndex');
}

.drawer-overlay.is-visible {
  opacity: 1;
  visibility: visible;
}

.drawer {
  position: fixed;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
}

/* 位置 */
.drawer-right {
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
}

.drawer-left {
  top: 0;
  left: 0;
  bottom: 0;
  width: 400px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.drawer-top {
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.drawer-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
}

/* 尺寸 */
.drawer-right.drawer-small,
.drawer-left.drawer-small {
  width: 300px;
}

.drawer-right.drawer-large,
.drawer-left.drawer-large {
  width: 600px;
}

.drawer-top.drawer-small,
.drawer-bottom.drawer-small {
  height: 200px;
}

.drawer-top.drawer-large,
.drawer-bottom.drawer-large {
  height: 400px;
}

/* 头部 */
.drawer-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.drawer-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  padding-right: 32px;
}

.drawer-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #666;
}

.drawer-close {
  position: absolute;
  right: 16px;
  top: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-close:hover {
  background: #f5f5f5;
  color: #333;
}

/* 内容 */
.drawer-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 底部 */
.drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 动画 */
.drawer-right-enter-active,
.drawer-right-leave-active,
.drawer-left-enter-active,
.drawer-left-leave-active,
.drawer-top-enter-active,
.drawer-top-leave-active,
.drawer-bottom-enter-active,
.drawer-bottom-leave-active {
  transition: transform 0.3s ease;
}

.drawer-right-enter-from,
.drawer-right-leave-to {
  transform: translateX(100%);
}

.drawer-left-enter-from,
.drawer-left-leave-to {
  transform: translateX(-100%);
}

.drawer-top-enter-from,
.drawer-top-leave-to {
  transform: translateY(-100%);
}

.drawer-bottom-enter-from,
.drawer-bottom-leave-to {
  transform: translateY(100%);
}
</style>
