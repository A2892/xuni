<template>
  <div class="space" :class="spaceClasses" :style="spaceStyle">
    <template v-for="(child, index) in validChildren" :key="index">
      <div class="space__item" :style="itemStyle">
        <component :is="child" />
      </div>
      
      <!-- 分隔符 -->
      <div 
        v-if="split && index < validChildren.length - 1" 
        class="space__split"
      >
        <slot name="split">
          <span>{{ split }}</span>
        </slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots, VNode } from 'vue'

type SizeType = 'small' | 'middle' | 'large' | number

interface Props {
  // 对齐方式
  align?: 'start' | 'end' | 'center' | 'baseline'
  // 方向
  direction?: 'horizontal' | 'vertical'
  // 间距大小
  size?: SizeType | [SizeType, SizeType]
  // 是否自动换行 (仅 horizontal)
  wrap?: boolean
  // 分隔符
  split?: string
}

const props = withDefaults(defineProps<Props>(), {
  align: 'center',
  direction: 'horizontal',
  size: 'small',
  wrap: false
})

const slots = useSlots()

// 尺寸映射
const sizeMap: Record<string, number> = {
  small: 8,
  middle: 16,
  large: 24
}

// 获取实际尺寸
function getSize(size: SizeType): number {
  if (typeof size === 'number') return size
  return sizeMap[size] || sizeMap.small
}

// 水平和垂直间距
const [horizontalSize, verticalSize] = computed(() => {
  if (Array.isArray(props.size)) {
    return [getSize(props.size[0]), getSize(props.size[1])]
  }
  const s = getSize(props.size)
  return [s, s]
}).value

// 过滤有效子元素
const validChildren = computed(() => {
  const children: VNode[] = []
  const defaultSlot = slots.default?.()
  
  if (defaultSlot) {
    defaultSlot.forEach(child => {
      if (child.type === Symbol.for('v-fgt')) {
        // Fragment
        if (Array.isArray(child.children)) {
          children.push(...(child.children as VNode[]))
        }
      } else if (child.type !== Comment) {
        children.push(child)
      }
    })
  }
  
  return children
})

const spaceClasses = computed(() => [
  `space--${props.direction}`,
  `space--align-${props.align}`,
  {
    'space--wrap': props.wrap
  }
])

const spaceStyle = computed(() => {
  if (props.direction === 'horizontal') {
    return {
      gap: `${verticalSize}px ${horizontalSize}px`
    }
  }
  return {
    gap: `${verticalSize}px`
  }
})

const itemStyle = computed(() => ({}))
</script>

<style scoped>
.space {
  display: inline-flex;
}

/* 方向 */
.space--horizontal {
  flex-direction: row;
}

.space--vertical {
  flex-direction: column;
}

/* 对齐 */
.space--align-start {
  align-items: flex-start;
}

.space--align-end {
  align-items: flex-end;
}

.space--align-center {
  align-items: center;
}

.space--align-baseline {
  align-items: baseline;
}

/* 换行 */
.space--wrap {
  flex-wrap: wrap;
}

/* 分隔符 */
.space__split {
  color: var(--text-secondary, #909399);
}
</style>
