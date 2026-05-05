<template>
  <component 
    :is="tag" 
    class="col"
    :class="colClass"
    :style="colStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { rowContextKey, type RowContext } from './Row.vue'

interface Props {
  // 栅格占位格数
  span?: number
  // 栅格左侧间隔格数
  offset?: number
  // 栅格向右移动格数
  push?: number
  // 栅格向左移动格数
  pull?: number
  // 自定义元素标签
  tag?: string
  // 弹性布局属性
  flex?: number | string
  // 响应式属性
  xs?: number | { span?: number; offset?: number; push?: number; pull?: number }
  sm?: number | { span?: number; offset?: number; push?: number; pull?: number }
  md?: number | { span?: number; offset?: number; push?: number; pull?: number }
  lg?: number | { span?: number; offset?: number; push?: number; pull?: number }
  xl?: number | { span?: number; offset?: number; push?: number; pull?: number }
  xxl?: number | { span?: number; offset?: number; push?: number; pull?: number }
}

const props = withDefaults(defineProps<Props>(), {
  span: 24,
  offset: 0,
  push: 0,
  pull: 0,
  tag: 'div'
})

const rowContext = inject<RowContext>(rowContextKey, { gutter: 0 })

// 计算类名
const colClass = computed(() => {
  const classes: string[] = []
  
  // 基础样式
  if (props.span) {
    classes.push(`col-${props.span}`)
  }
  
  if (props.offset) {
    classes.push(`col-offset-${props.offset}`)
  }
  
  if (props.push) {
    classes.push(`col-push-${props.push}`)
  }
  
  if (props.pull) {
    classes.push(`col-pull-${props.pull}`)
  }
  
  // 响应式样式
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const
  sizes.forEach(size => {
    const sizeProps = props[size]
    if (typeof sizeProps === 'number') {
      classes.push(`col-${size}-${sizeProps}`)
    } else if (typeof sizeProps === 'object') {
      if (sizeProps.span) {
        classes.push(`col-${size}-${sizeProps.span}`)
      }
      if (sizeProps.offset) {
        classes.push(`col-${size}-offset-${sizeProps.offset}`)
      }
      if (sizeProps.push) {
        classes.push(`col-${size}-push-${sizeProps.push}`)
      }
      if (sizeProps.pull) {
        classes.push(`col-${size}-pull-${sizeProps.pull}`)
      }
    }
  })
  
  return classes
})

// 计算样式
const colStyle = computed(() => {
  const style: Record<string, string> = {}
  
  // 间隔
  const [horizontalGutter, verticalGutter] = Array.isArray(rowContext.gutter)
    ? rowContext.gutter
    : [rowContext.gutter, rowContext.gutter]
  
  if (horizontalGutter > 0) {
    style.paddingLeft = `${horizontalGutter / 2}px`
    style.paddingRight = `${horizontalGutter / 2}px`
  }
  
  if (verticalGutter > 0) {
    style.paddingTop = `${verticalGutter / 2}px`
    style.paddingBottom = `${verticalGutter / 2}px`
  }
  
  // 弹性布局
  if (props.flex) {
    if (typeof props.flex === 'number') {
      style.flex = `${props.flex} ${props.flex} auto`
    } else {
      style.flex = props.flex
    }
  }
  
  return style
})
</script>

<style scoped>
.col {
  position: relative;
  box-sizing: border-box;
}

/* 生成基础栅格 */
.col-0 {
  display: none;
}

.col-1 { flex: 0 0 4.166667%; max-width: 4.166667%; }
.col-2 { flex: 0 0 8.333333%; max-width: 8.333333%; }
.col-3 { flex: 0 0 12.5%; max-width: 12.5%; }
.col-4 { flex: 0 0 16.666667%; max-width: 16.666667%; }
.col-5 { flex: 0 0 20.833333%; max-width: 20.833333%; }
.col-6 { flex: 0 0 25%; max-width: 25%; }
.col-7 { flex: 0 0 29.166667%; max-width: 29.166667%; }
.col-8 { flex: 0 0 33.333333%; max-width: 33.333333%; }
.col-9 { flex: 0 0 37.5%; max-width: 37.5%; }
.col-10 { flex: 0 0 41.666667%; max-width: 41.666667%; }
.col-11 { flex: 0 0 45.833333%; max-width: 45.833333%; }
.col-12 { flex: 0 0 50%; max-width: 50%; }
.col-13 { flex: 0 0 54.166667%; max-width: 54.166667%; }
.col-14 { flex: 0 0 58.333333%; max-width: 58.333333%; }
.col-15 { flex: 0 0 62.5%; max-width: 62.5%; }
.col-16 { flex: 0 0 66.666667%; max-width: 66.666667%; }
.col-17 { flex: 0 0 70.833333%; max-width: 70.833333%; }
.col-18 { flex: 0 0 75%; max-width: 75%; }
.col-19 { flex: 0 0 79.166667%; max-width: 79.166667%; }
.col-20 { flex: 0 0 83.333333%; max-width: 83.333333%; }
.col-21 { flex: 0 0 87.5%; max-width: 87.5%; }
.col-22 { flex: 0 0 91.666667%; max-width: 91.666667%; }
.col-23 { flex: 0 0 95.833333%; max-width: 95.833333%; }
.col-24 { flex: 0 0 100%; max-width: 100%; }

/* 偏移 */
.col-offset-1 { margin-left: 4.166667%; }
.col-offset-2 { margin-left: 8.333333%; }
.col-offset-3 { margin-left: 12.5%; }
.col-offset-4 { margin-left: 16.666667%; }
.col-offset-5 { margin-left: 20.833333%; }
.col-offset-6 { margin-left: 25%; }
.col-offset-7 { margin-left: 29.166667%; }
.col-offset-8 { margin-left: 33.333333%; }
.col-offset-9 { margin-left: 37.5%; }
.col-offset-10 { margin-left: 41.666667%; }
.col-offset-11 { margin-left: 45.833333%; }
.col-offset-12 { margin-left: 50%; }

/* 推移 */
.col-push-1 { left: 4.166667%; }
.col-push-2 { left: 8.333333%; }
.col-push-3 { left: 12.5%; }
.col-push-4 { left: 16.666667%; }
.col-push-5 { left: 20.833333%; }
.col-push-6 { left: 25%; }

.col-pull-1 { right: 4.166667%; }
.col-pull-2 { right: 8.333333%; }
.col-pull-3 { right: 12.5%; }
.col-pull-4 { right: 16.666667%; }
.col-pull-5 { right: 20.833333%; }
.col-pull-6 { right: 25%; }

/* 响应式 - xs: <576px */
@media (max-width: 575.98px) {
  .col-xs-1 { flex: 0 0 4.166667%; max-width: 4.166667%; }
  .col-xs-2 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .col-xs-3 { flex: 0 0 12.5%; max-width: 12.5%; }
  .col-xs-4 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .col-xs-6 { flex: 0 0 25%; max-width: 25%; }
  .col-xs-8 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-xs-12 { flex: 0 0 50%; max-width: 50%; }
  .col-xs-16 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .col-xs-18 { flex: 0 0 75%; max-width: 75%; }
  .col-xs-24 { flex: 0 0 100%; max-width: 100%; }
}

/* 响应式 - sm: >=576px */
@media (min-width: 576px) {
  .col-sm-1 { flex: 0 0 4.166667%; max-width: 4.166667%; }
  .col-sm-2 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .col-sm-3 { flex: 0 0 12.5%; max-width: 12.5%; }
  .col-sm-4 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .col-sm-6 { flex: 0 0 25%; max-width: 25%; }
  .col-sm-8 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-sm-12 { flex: 0 0 50%; max-width: 50%; }
  .col-sm-16 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .col-sm-18 { flex: 0 0 75%; max-width: 75%; }
  .col-sm-24 { flex: 0 0 100%; max-width: 100%; }
}

/* 响应式 - md: >=768px */
@media (min-width: 768px) {
  .col-md-1 { flex: 0 0 4.166667%; max-width: 4.166667%; }
  .col-md-2 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .col-md-3 { flex: 0 0 12.5%; max-width: 12.5%; }
  .col-md-4 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .col-md-6 { flex: 0 0 25%; max-width: 25%; }
  .col-md-8 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-md-12 { flex: 0 0 50%; max-width: 50%; }
  .col-md-16 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .col-md-18 { flex: 0 0 75%; max-width: 75%; }
  .col-md-24 { flex: 0 0 100%; max-width: 100%; }
}

/* 响应式 - lg: >=992px */
@media (min-width: 992px) {
  .col-lg-1 { flex: 0 0 4.166667%; max-width: 4.166667%; }
  .col-lg-2 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .col-lg-3 { flex: 0 0 12.5%; max-width: 12.5%; }
  .col-lg-4 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .col-lg-6 { flex: 0 0 25%; max-width: 25%; }
  .col-lg-8 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-lg-12 { flex: 0 0 50%; max-width: 50%; }
  .col-lg-16 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .col-lg-18 { flex: 0 0 75%; max-width: 75%; }
  .col-lg-24 { flex: 0 0 100%; max-width: 100%; }
}

/* 响应式 - xl: >=1200px */
@media (min-width: 1200px) {
  .col-xl-1 { flex: 0 0 4.166667%; max-width: 4.166667%; }
  .col-xl-2 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .col-xl-3 { flex: 0 0 12.5%; max-width: 12.5%; }
  .col-xl-4 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .col-xl-6 { flex: 0 0 25%; max-width: 25%; }
  .col-xl-8 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-xl-12 { flex: 0 0 50%; max-width: 50%; }
  .col-xl-16 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .col-xl-18 { flex: 0 0 75%; max-width: 75%; }
  .col-xl-24 { flex: 0 0 100%; max-width: 100%; }
}

/* 响应式 - xxl: >=1600px */
@media (min-width: 1600px) {
  .col-xxl-1 { flex: 0 0 4.166667%; max-width: 4.166667%; }
  .col-xxl-2 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .col-xxl-3 { flex: 0 0 12.5%; max-width: 12.5%; }
  .col-xxl-4 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .col-xxl-6 { flex: 0 0 25%; max-width: 25%; }
  .col-xxl-8 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-xxl-12 { flex: 0 0 50%; max-width: 50%; }
  .col-xxl-16 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .col-xxl-18 { flex: 0 0 75%; max-width: 75%; }
  .col-xxl-24 { flex: 0 0 100%; max-width: 100%; }
}
</style>
