<template>
  <div 
    class="divider"
    :class="[
      `divider--${direction}`,
      `divider--${contentPosition}`,
      { 'divider--dashed': dashed },
      { 'divider--plain': plain }
    ]"
    :style="dividerStyle"
  >
    <span v-if="$slots.default || text" class="divider__text">
      <slot>{{ text }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 方向
  direction?: 'horizontal' | 'vertical'
  // 分割线内容位置
  contentPosition?: 'left' | 'center' | 'right'
  // 是否虚线
  dashed?: boolean
  // 文字是否为普通样式
  plain?: boolean
  // 分割线文字
  text?: string
  // 分割线颜色
  borderColor?: string
  // 分割线样式
  borderStyle?: string
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  contentPosition: 'center',
  dashed: false,
  plain: false
})

const dividerStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.borderColor) {
    style['--divider-color'] = props.borderColor
  }
  
  if (props.borderStyle) {
    style['--divider-style'] = props.borderStyle
  }
  
  return style
})
</script>

<style scoped>
.divider {
  --divider-color: #e8e8e8;
  --divider-style: solid;
}

/* 水平分割线 */
.divider--horizontal {
  display: flex;
  align-items: center;
  clear: both;
  width: 100%;
  min-width: 100%;
  margin: 24px 0;
}

.divider--horizontal::before,
.divider--horizontal::after {
  content: '';
  flex: 1;
  height: 0;
  border-top: 1px var(--divider-style) var(--divider-color);
}

.divider--horizontal.divider--dashed::before,
.divider--horizontal.divider--dashed::after {
  border-top-style: dashed;
}

.divider--horizontal .divider__text {
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.divider--horizontal.divider--plain .divider__text {
  font-weight: normal;
  font-size: 14px;
  color: #666;
}

/* 内容位置 */
.divider--horizontal.divider--left::before {
  flex: 0 0 5%;
  max-width: 5%;
}

.divider--horizontal.divider--left::after {
  flex: 1;
}

.divider--horizontal.divider--right::before {
  flex: 1;
}

.divider--horizontal.divider--right::after {
  flex: 0 0 5%;
  max-width: 5%;
}

/* 无内容时 */
.divider--horizontal:not(:has(.divider__text))::before {
  flex: 1;
}

.divider--horizontal:not(:has(.divider__text))::after {
  display: none;
}

/* 垂直分割线 */
.divider--vertical {
  display: inline-block;
  position: relative;
  vertical-align: middle;
  height: 1em;
  margin: 0 8px;
  border-left: 1px var(--divider-style) var(--divider-color);
}

.divider--vertical.divider--dashed {
  border-left-style: dashed;
}
</style>
