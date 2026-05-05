<template>
  <span 
    class="text"
    :class="[
      type && `text--${type}`,
      { 
        'text--strong': strong,
        'text--italic': italic,
        'text--underline': underline,
        'text--delete': delete_,
        'text--code': code,
        'text--mark': mark,
        'text--keyboard': keyboard,
        'text--disabled': disabled,
        'text--ellipsis': ellipsis
      }
    ]"
    :style="textStyle"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 类型
  type?: 'secondary' | 'success' | 'warning' | 'danger' | 'primary'
  // 加粗
  strong?: boolean
  // 斜体
  italic?: boolean
  // 下划线
  underline?: boolean
  // 删除线
  delete_?: boolean
  // 代码样式
  code?: boolean
  // 标记样式
  mark?: boolean
  // 键盘样式
  keyboard?: boolean
  // 禁用状态
  disabled?: boolean
  // 省略号
  ellipsis?: boolean | { rows?: number }
  // 可复制
  copyable?: boolean
  // 可编辑
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  strong: false,
  italic: false,
  underline: false,
  delete_: false,
  code: false,
  mark: false,
  keyboard: false,
  disabled: false,
  ellipsis: false
})

// 文本样式
const textStyle = computed(() => {
  if (props.ellipsis && typeof props.ellipsis === 'object' && props.ellipsis.rows) {
    return {
      display: '-webkit-box',
      WebkitLineClamp: props.ellipsis.rows,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }
  return {}
})
</script>

<style scoped>
.text {
  display: inline;
  line-height: 1.6;
}

/* 类型 */
.text--secondary {
  color: var(--text-secondary, #909399);
}

.text--success {
  color: var(--success-color, #67c23a);
}

.text--warning {
  color: var(--warning-color, #e6a23c);
}

.text--danger {
  color: var(--danger-color, #f56c6c);
}

.text--primary {
  color: var(--primary-color, #4B6EF5);
}

/* 样式 */
.text--strong {
  font-weight: 600;
}

.text--italic {
  font-style: italic;
}

.text--underline {
  text-decoration: underline;
}

.text--delete {
  text-decoration: line-through;
}

.text--code {
  margin: 0 4px;
  padding: 2px 6px;
  font-size: 0.9em;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  background: var(--bg-hover, #f5f7fa);
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 4px;
}

.text--mark {
  padding: 0 4px;
  background: #ffe58f;
}

.text--keyboard {
  margin: 0 4px;
  padding: 2px 6px;
  font-size: 0.9em;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  background: var(--bg-hover, #f5f7fa);
  border: 1px solid var(--border-color, #d9d9d9);
  border-bottom-width: 2px;
  border-radius: 4px;
}

.text--disabled {
  color: var(--text-disabled, #c0c4cc);
  cursor: not-allowed;
  user-select: none;
}

.text--ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
