<template>
  <span
    class="badge"
    :class="{ 'badge-standalone': standalone }"
  >
    <slot />
    <Transition name="badge">
      <sup
        v-if="showBadge"
        class="badge-count"
        :class="[
          `badge-${status}`,
          {
            'badge-dot': dot,
            'badge-offset': hasOffset
          }
        ]"
        :style="badgeStyle"
        :title="title || String(displayCount)"
      >
        <template v-if="!dot">
          {{ displayCount }}
        </template>
      </sup>
    </Transition>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  count?: number | string
  overflowCount?: number
  dot?: boolean
  showZero?: boolean
  offset?: [number, number]
  status?: 'default' | 'success' | 'processing' | 'warning' | 'error'
  color?: string
  text?: string
  title?: string
  size?: 'default' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  overflowCount: 99,
  dot: false,
  showZero: false,
  offset: undefined,
  status: 'default',
  color: '',
  text: '',
  title: '',
  size: 'default'
})

// 是否独立使用（没有子元素）
const standalone = computed(() => {
  return false // 由 slot 决定
})

// 是否显示徽章
const showBadge = computed(() => {
  if (props.dot) return true
  if (props.text) return true
  
  const num = Number(props.count)
  return props.showZero ? true : num > 0
})

// 显示的数值
const displayCount = computed(() => {
  if (props.text) return props.text
  
  const num = Number(props.count)
  if (isNaN(num)) return props.count
  
  if (num > props.overflowCount) {
    return `${props.overflowCount}+`
  }
  
  return num
})

// 是否有偏移
const hasOffset = computed(() => {
  return props.offset && props.offset.length === 2
})

// 徽章样式
const badgeStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.color) {
    style.backgroundColor = props.color
  }
  
  if (props.offset) {
    style.marginTop = `${props.offset[1]}px`
    style.marginRight = `${-props.offset[0]}px`
  }
  
  if (props.size === 'small') {
    style.fontSize = '10px'
    style.height = '14px'
    style.lineHeight = '14px'
    style.padding = props.dot ? '0' : '0 4px'
    style.minWidth = props.dot ? '6px' : '14px'
  }
  
  return style
})
</script>

<style scoped>
.badge {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
}

.badge-standalone {
  display: inline-block;
}

.badge-count {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  transform-origin: 100% 0;
  z-index: 1;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  background-color: #ff4d4f;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #fff;
}

.badge-dot {
  min-width: 8px;
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: 50%;
}

/* 状态颜色 */
.badge-default {
  background-color: #ff4d4f;
}

.badge-success {
  background-color: #52c41a;
}

.badge-processing {
  background-color: #1890ff;
}

.badge-warning {
  background-color: #faad14;
}

.badge-error {
  background-color: #ff4d4f;
}

/* 动画 */
.badge-enter-active,
.badge-leave-active {
  transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46);
}

.badge-enter-from,
.badge-leave-to {
  opacity: 0;
  transform: translate(50%, -50%) scale(0);
}

/* Processing 动画 */
.badge-processing::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background-color: inherit;
  animation: badge-processing 1.2s infinite ease-in-out;
}

@keyframes badge-processing {
  0% {
    opacity: 0.6;
    transform: scale(0.8);
  }
  100% {
    opacity: 0;
    transform: scale(2.4);
  }
}
</style>
