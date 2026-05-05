<template>
  <div 
    class="alert"
    :class="[
      `alert--${type}`,
      { 'alert--with-icon': showIcon },
      { 'alert--with-description': description || $slots.description },
      { 'alert--banner': banner },
      { 'alert--center': center }
    ]"
    v-show="visible"
  >
    <!-- 图标 -->
    <span v-if="showIcon" class="alert__icon">
      <slot name="icon">
        <IconLib :name="iconName" :size="iconSize" />
      </slot>
    </span>
    
    <!-- 内容区域 -->
    <div class="alert__content">
      <!-- 标题 -->
      <div v-if="title || $slots.title" class="alert__title">
        <slot name="title">{{ title }}</slot>
      </div>
      
      <!-- 描述 -->
      <div v-if="description || $slots.description" class="alert__description">
        <slot name="description">{{ description }}</slot>
      </div>
      
      <!-- 默认插槽 -->
      <div v-if="$slots.default && !title && !description" class="alert__message">
        <slot />
      </div>
    </div>
    
    <!-- 关闭按钮 -->
    <button 
      v-if="closable" 
      class="alert__close"
      @click="handleClose"
      type="button"
      aria-label="关闭"
    >
      <slot name="close">
        <IconLib :name="closeIcon || 'x'" :size="14" />
      </slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 类型
  type?: 'success' | 'warning' | 'error' | 'info'
  // 标题
  title?: string
  // 描述
  description?: string
  // 是否可关闭
  closable?: boolean
  // 关闭图标
  closeIcon?: string
  // 是否显示图标
  showIcon?: boolean
  // 自定义图标
  icon?: string
  // 是否为横幅模式
  banner?: boolean
  // 是否居中
  center?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  closable: false,
  showIcon: false,
  banner: false,
  center: false
})

const emit = defineEmits<{
  (e: 'close', event: MouseEvent): void
}>()

const visible = ref(true)

// 图标名称
const iconName = computed(() => {
  if (props.icon) return props.icon
  
  switch (props.type) {
    case 'success':
      return 'check-circle'
    case 'warning':
      return 'alert-triangle'
    case 'error':
      return 'x-circle'
    default:
      return 'info'
  }
})

// 图标大小
const iconSize = computed(() => {
  return props.description ? 24 : 16
})

// 关闭处理
function handleClose(event: MouseEvent) {
  visible.value = false
  emit('close', event)
}
</script>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
}

.alert--banner {
  border-radius: 0;
}

.alert--center {
  justify-content: center;
  text-align: center;
}

/* 类型样式 */
.alert--success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.alert--success .alert__icon {
  color: #52c41a;
}

.alert--warning {
  background: #fffbe6;
  border: 1px solid #ffe58f;
}

.alert--warning .alert__icon {
  color: #faad14;
}

.alert--error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

.alert--error .alert__icon {
  color: #ff4d4f;
}

.alert--info {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}

.alert--info .alert__icon {
  color: var(--primary-color, #4B6EF5);
}

/* 图标 */
.alert__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  line-height: 1;
}

.alert--with-description .alert__icon {
  padding-top: 2px;
}

/* 内容 */
.alert__content {
  flex: 1;
  min-width: 0;
}

.alert__title {
  font-weight: 500;
  color: #333;
}

.alert--with-description .alert__title {
  margin-bottom: 4px;
  font-size: 16px;
}

.alert__description {
  color: #666;
}

.alert__message {
  color: #333;
}

/* 关闭按钮 */
.alert__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.alert__close:hover {
  color: #666;
}
</style>
