<template>
  <span 
    v-if="visible"
    class="tag" 
    :class="tagClasses"
    :style="tagStyle"
  >
    <span v-if="icon || $slots.icon" class="tag__icon">
      <slot name="icon">
        <IconLib v-if="icon" :name="icon" :size="12" />
      </slot>
    </span>
    
    <span class="tag__content">
      <slot />
    </span>
    
    <button
      v-if="closable"
      type="button"
      class="tag__close"
      @click.stop="handleClose"
    >
      <IconLib name="close" :size="10" />
    </button>
  </span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 类型
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 是否可关闭
  closable?: boolean
  // 是否有边框
  bordered?: boolean
  // 图标
  icon?: string
  // 自定义颜色
  color?: string
  // 是否圆形
  round?: boolean
  // 是否点击样式
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'default',
  closable: false,
  bordered: true,
  round: false,
  clickable: false
})

const emit = defineEmits<{
  (e: 'close', event: MouseEvent): void
}>()

const visible = ref(true)

const tagClasses = computed(() => [
  `tag--${props.type}`,
  `tag--${props.size}`,
  {
    'tag--bordered': props.bordered,
    'tag--round': props.round,
    'tag--clickable': props.clickable,
    'tag--custom': props.color
  }
])

const tagStyle = computed(() => {
  if (!props.color) return {}
  
  return {
    '--tag-color': props.color,
    '--tag-bg': `${props.color}10`,
    '--tag-border': `${props.color}30`
  }
})

function handleClose(event: MouseEvent) {
  visible.value = false
  emit('close', event)
}
</script>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  border-radius: 4px;
  transition: all 0.2s;
}

/* 尺寸 */
.tag--small {
  padding: 2px 6px;
  font-size: 11px;
}

.tag--default {
  padding: 4px 8px;
}

.tag--large {
  padding: 6px 10px;
  font-size: 13px;
}

/* 圆形 */
.tag--round {
  border-radius: 100px;
}

/* 可点击 */
.tag--clickable {
  cursor: pointer;
}

/* 类型 */
.tag--default {
  background: var(--bg-secondary, #f5f7fa);
  color: var(--text-color, #606266);
}

.tag--bordered.tag--default {
  border: 1px solid var(--border-color, #e4e7ed);
}

.tag--primary {
  background: var(--primary-light, #ecf5ff);
  color: var(--primary-color, #4B6EF5);
}

.tag--bordered.tag--primary {
  border: 1px solid var(--primary-border, #b3d4fc);
}

.tag--success {
  background: #f0f9eb;
  color: #67c23a;
}

.tag--bordered.tag--success {
  border: 1px solid #c2e7b0;
}

.tag--warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.tag--bordered.tag--warning {
  border: 1px solid #f5dab1;
}

.tag--danger {
  background: #fef0f0;
  color: #f56c6c;
}

.tag--bordered.tag--danger {
  border: 1px solid #fbc4c4;
}

.tag--info {
  background: #f4f4f5;
  color: #909399;
}

.tag--bordered.tag--info {
  border: 1px solid #d3d4d6;
}

/* 自定义颜色 */
.tag--custom {
  background: var(--tag-bg);
  color: var(--tag-color);
}

.tag--bordered.tag--custom {
  border: 1px solid var(--tag-border);
}

/* 图标 */
.tag__icon {
  display: flex;
  align-items: center;
}

/* 关闭按钮 */
.tag__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-left: 2px;
  margin-right: -2px;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.6;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.tag__close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
</style>
