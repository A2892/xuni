<template>
  <Teleport to="body">
    <Transition name="drawer-mask">
      <div
        v-if="modelValue"
        class="drawer-mask"
        :style="{ zIndex: zIndex - 1 }"
        @click="handleMaskClick"
      />
    </Transition>
    <Transition :name="`drawer-${placement}`">
      <div
        v-if="modelValue"
        class="drawer"
        :class="[
          `drawer-${placement}`,
          { 'drawer-with-header': showHeader }
        ]"
        :style="drawerStyle"
      >
        <!-- Header -->
        <div v-if="showHeader" class="drawer-header">
          <div class="drawer-title">
            <slot name="title">{{ title }}</slot>
          </div>
          <button
            v-if="closable"
            class="drawer-close"
            @click="handleClose"
          >
            <IconLib name="close" :size="18" />
          </button>
        </div>
        
        <!-- Body -->
        <div class="drawer-body" :style="bodyStyle">
          <slot />
        </div>
        
        <!-- Footer -->
        <div v-if="$slots.footer" class="drawer-footer">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  modelValue: boolean
  title?: string
  placement?: 'left' | 'right' | 'top' | 'bottom'
  width?: number | string
  height?: number | string
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  zIndex?: number
  bodyStyle?: Record<string, string>
  destroyOnClose?: boolean
  lockScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  placement: 'right',
  width: 378,
  height: 378,
  closable: true,
  maskClosable: true,
  keyboard: true,
  zIndex: 1000,
  bodyStyle: () => ({}),
  destroyOnClose: false,
  lockScroll: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

// 是否显示头部
const showHeader = computed(() => {
  return props.title || props.closable
})

// 抽屉样式
const drawerStyle = computed(() => {
  const style: Record<string, string | number> = {
    zIndex: props.zIndex
  }
  
  if (props.placement === 'left' || props.placement === 'right') {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  } else {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  return style
})

// 处理遮罩点击
const handleMaskClick = () => {
  if (props.maskClosable) {
    handleClose()
  }
}

// 关闭
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.keyboard && props.modelValue) {
    handleClose()
  }
}

// 锁定滚动
let originalOverflow = ''

const lockBodyScroll = () => {
  if (props.lockScroll) {
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
}

const unlockBodyScroll = () => {
  if (props.lockScroll) {
    document.body.style.overflow = originalOverflow
  }
}

// 监听显示状态
watch(() => props.modelValue, (val) => {
  if (val) {
    lockBodyScroll()
  } else {
    unlockBodyScroll()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  if (props.modelValue) {
    lockBodyScroll()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  unlockBodyScroll()
})
</script>

<style scoped>
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

.drawer {
  position: fixed;
  background-color: #fff;
  box-shadow: -6px 0 16px rgba(0, 0, 0, 0.08), -3px 0 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

/* 位置 */
.drawer-right {
  top: 0;
  right: 0;
  bottom: 0;
}

.drawer-left {
  top: 0;
  left: 0;
  bottom: 0;
  box-shadow: 6px 0 16px rgba(0, 0, 0, 0.08), 3px 0 6px rgba(0, 0, 0, 0.05);
}

.drawer-top {
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.05);
}

.drawer-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.08), 0 -3px 6px rgba(0, 0, 0, 0.05);
}

/* Header */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.drawer-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}

.drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  transition: all 0.2s;
}

.drawer-close:hover {
  color: rgba(0, 0, 0, 0.88);
  background-color: rgba(0, 0, 0, 0.04);
}

/* Body */
.drawer-body {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

/* Footer */
.drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

/* 动画 - 遮罩 */
.drawer-mask-enter-active,
.drawer-mask-leave-active {
  transition: opacity 0.3s;
}

.drawer-mask-enter-from,
.drawer-mask-leave-to {
  opacity: 0;
}

/* 动画 - 右侧 */
.drawer-right-enter-active,
.drawer-right-leave-active {
  transition: transform 0.3s;
}

.drawer-right-enter-from,
.drawer-right-leave-to {
  transform: translateX(100%);
}

/* 动画 - 左侧 */
.drawer-left-enter-active,
.drawer-left-leave-active {
  transition: transform 0.3s;
}

.drawer-left-enter-from,
.drawer-left-leave-to {
  transform: translateX(-100%);
}

/* 动画 - 顶部 */
.drawer-top-enter-active,
.drawer-top-leave-active {
  transition: transform 0.3s;
}

.drawer-top-enter-from,
.drawer-top-leave-to {
  transform: translateY(-100%);
}

/* 动画 - 底部 */
.drawer-bottom-enter-active,
.drawer-bottom-leave-active {
  transition: transform 0.3s;
}

.drawer-bottom-enter-from,
.drawer-bottom-leave-to {
  transform: translateY(100%);
}
</style>
