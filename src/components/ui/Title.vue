<template>
  <component 
    :is="tag"
    class="title"
    :class="[
      `title--h${level}`,
      type && `title--${type}`,
      { 
        'title--ellipsis': ellipsis,
        'title--copyable': copyable
      }
    ]"
    :style="titleStyle"
  >
    <slot />
    <button 
      v-if="copyable"
      type="button"
      class="title__copy"
      :title="copied ? '已复制' : '复制'"
      @click="handleCopy"
    >
      <IconLib :name="copied ? 'check' : 'copy'" :size="14" />
    </button>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 标题级别 1-5
  level?: 1 | 2 | 3 | 4 | 5
  // 类型
  type?: 'secondary' | 'success' | 'warning' | 'danger'
  // 省略号
  ellipsis?: boolean | { rows?: number }
  // 可复制
  copyable?: boolean | { text?: string }
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  ellipsis: false,
  copyable: false
})

const slots = useSlots()
const copied = ref(false)

// 标签名
const tag = computed(() => `h${props.level}`)

// 标题样式
const titleStyle = computed(() => {
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

// 复制处理
async function handleCopy() {
  try {
    let text = ''
    
    if (typeof props.copyable === 'object' && props.copyable.text) {
      text = props.copyable.text
    } else {
      // 获取插槽内容的文本
      text = document.querySelector('.title')?.textContent || ''
    }
    
    await navigator.clipboard.writeText(text.trim())
    copied.value = true
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.title {
  margin: 0;
  color: var(--text-color, #303133);
  font-weight: 600;
  line-height: 1.4;
}

/* 级别 */
.title--h1 {
  font-size: 32px;
  margin-bottom: 20px;
}

.title--h2 {
  font-size: 26px;
  margin-bottom: 18px;
}

.title--h3 {
  font-size: 22px;
  margin-bottom: 16px;
}

.title--h4 {
  font-size: 18px;
  margin-bottom: 14px;
}

.title--h5 {
  font-size: 16px;
  margin-bottom: 12px;
}

/* 类型 */
.title--secondary {
  color: var(--text-secondary, #909399);
}

.title--success {
  color: var(--success-color, #67c23a);
}

.title--warning {
  color: var(--warning-color, #e6a23c);
}

.title--danger {
  color: var(--danger-color, #f56c6c);
}

/* 省略 */
.title--ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 可复制 */
.title--copyable {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.title__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #909399);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.title__copy:hover {
  color: var(--primary-color, #4B6EF5);
  background: var(--bg-hover, #f5f7fa);
}
</style>
