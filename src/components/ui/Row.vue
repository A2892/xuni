<template>
  <component 
    :is="tag" 
    class="row" 
    :class="{ 'row--wrap': wrap }"
    :style="rowStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, provide, type InjectionKey } from 'vue'

export interface RowContext {
  gutter: number | [number, number]
}

export const rowContextKey: InjectionKey<RowContext> = Symbol('rowContext')

interface Props {
  // 栅格间隔
  gutter?: number | [number, number]
  // 水平排列方式
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
  // 垂直排列方式
  align?: 'top' | 'middle' | 'bottom' | 'stretch'
  // 是否自动换行
  wrap?: boolean
  // 自定义元素标签
  tag?: string
}

const props = withDefaults(defineProps<Props>(), {
  gutter: 0,
  justify: 'start',
  align: 'top',
  wrap: true,
  tag: 'div'
})

// 计算样式
const rowStyle = computed(() => {
  const style: Record<string, string> = {}
  
  // 间隔
  const [horizontalGutter, verticalGutter] = Array.isArray(props.gutter)
    ? props.gutter
    : [props.gutter, props.gutter]
  
  if (horizontalGutter > 0) {
    style.marginLeft = `-${horizontalGutter / 2}px`
    style.marginRight = `-${horizontalGutter / 2}px`
  }
  
  if (verticalGutter > 0) {
    style.marginTop = `-${verticalGutter / 2}px`
    style.marginBottom = `-${verticalGutter / 2}px`
  }
  
  // 对齐方式
  const justifyMap: Record<string, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    'space-around': 'space-around',
    'space-between': 'space-between',
    'space-evenly': 'space-evenly'
  }
  
  const alignMap: Record<string, string> = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
    stretch: 'stretch'
  }
  
  style.justifyContent = justifyMap[props.justify] || 'flex-start'
  style.alignItems = alignMap[props.align] || 'flex-start'
  
  return style
})

// 提供给子组件
provide(rowContextKey, {
  gutter: props.gutter
})
</script>

<style scoped>
.row {
  display: flex;
  flex-flow: row wrap;
}

.row--wrap {
  flex-wrap: wrap;
}
</style>
