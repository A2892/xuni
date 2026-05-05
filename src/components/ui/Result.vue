<template>
  <div 
    class="result"
    :class="[
      `result--${status}`,
      { 'result--centered': centered }
    ]"
  >
    <!-- 图标 -->
    <div class="result__icon">
      <slot name="icon">
        <div class="result__icon-wrapper" :class="`result__icon-wrapper--${status}`">
          <IconLib :name="iconName" :size="iconSize" />
        </div>
      </slot>
    </div>
    
    <!-- 标题 -->
    <div v-if="title || $slots.title" class="result__title">
      <slot name="title">{{ title }}</slot>
    </div>
    
    <!-- 副标题 -->
    <div v-if="subTitle || $slots.subTitle" class="result__subtitle">
      <slot name="subTitle">{{ subTitle }}</slot>
    </div>
    
    <!-- 额外内容 -->
    <div v-if="$slots.extra" class="result__extra">
      <slot name="extra" />
    </div>
    
    <!-- 操作按钮 -->
    <div v-if="$slots.default" class="result__actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 状态
  status?: 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500'
  // 标题
  title?: string
  // 副标题
  subTitle?: string
  // 自定义图标
  icon?: string
  // 是否居中
  centered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'info',
  centered: true
})

// 图标名称
const iconName = computed(() => {
  if (props.icon) return props.icon
  
  switch (props.status) {
    case 'success':
      return 'check-circle'
    case 'error':
      return 'x-circle'
    case 'warning':
      return 'alert-triangle'
    case '403':
      return 'lock'
    case '404':
      return 'search'
    case '500':
      return 'alert-octagon'
    default:
      return 'info'
  }
})

// 图标大小
const iconSize = computed(() => {
  return ['403', '404', '500'].includes(props.status) ? 64 : 48
})
</script>

<style scoped>
.result {
  padding: 48px 32px;
}

.result--centered {
  text-align: center;
}

.result__icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.result__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
}

.result__icon-wrapper--success {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.result__icon-wrapper--error {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.result__icon-wrapper--warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.result__icon-wrapper--info {
  background: rgba(75, 110, 245, 0.1);
  color: var(--primary-color, #4B6EF5);
}

.result__icon-wrapper--403,
.result__icon-wrapper--404,
.result__icon-wrapper--500 {
  width: 100px;
  height: 100px;
  background: #f5f5f5;
  color: #999;
}

.result__title {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
}

.result__subtitle {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
}

.result__extra {
  margin-bottom: 24px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
}

.result__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
