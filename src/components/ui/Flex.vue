<template>
  <div class="flex" :style="flexStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, CSSProperties } from 'vue'

type FlexAlign = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
type FlexJustify = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse'
type GapSize = 'small' | 'middle' | 'large' | number | [number, number]

interface Props {
  // 主轴对齐
  justify?: FlexJustify
  // 交叉轴对齐
  align?: FlexAlign
  // 换行
  wrap?: FlexWrap
  // 方向
  direction?: FlexDirection
  // 间距
  gap?: GapSize
  // 是否为 inline-flex
  inline?: boolean
  // 是否充满
  flex?: number | string
  // 是否垂直
  vertical?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  justify: 'flex-start',
  align: 'stretch',
  wrap: 'nowrap',
  direction: 'row',
  inline: false
})

// 间距映射
const gapMap: Record<string, number> = {
  small: 8,
  middle: 16,
  large: 24
}

const flexStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    display: props.inline ? 'inline-flex' : 'flex',
    flexDirection: props.vertical ? 'column' : props.direction,
    justifyContent: props.justify,
    alignItems: props.align,
    flexWrap: props.wrap
  }
  
  // 处理间距
  if (props.gap !== undefined) {
    if (typeof props.gap === 'number') {
      styles.gap = `${props.gap}px`
    } else if (typeof props.gap === 'string') {
      styles.gap = `${gapMap[props.gap] || 8}px`
    } else if (Array.isArray(props.gap)) {
      styles.gap = `${props.gap[1]}px ${props.gap[0]}px`
    }
  }
  
  // 处理 flex
  if (props.flex !== undefined) {
    styles.flex = typeof props.flex === 'number' ? props.flex : props.flex
  }
  
  return styles
})
</script>

<style scoped>
.flex {
  min-width: 0;
}
</style>
