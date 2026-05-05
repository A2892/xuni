<template>
  <div class="avatar-group" :style="groupStyle">
    <slot />
    
    <!-- 更多头像 -->
    <span 
      v-if="surplus > 0" 
      class="avatar-group__surplus"
      :style="surplusStyle"
    >
      +{{ surplus }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'

type AvatarSize = 'small' | 'default' | 'large' | number

interface Props {
  // 头像尺寸
  size?: AvatarSize
  // 最大显示数
  max?: number
  // 总数 (用于计算 surplus)
  total?: number
  // 形状
  shape?: 'circle' | 'square'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  max: 5,
  shape: 'circle'
})

// 尺寸映射
const sizeMap: Record<string, number> = {
  small: 24,
  default: 40,
  large: 56
}

// 获取实际尺寸
const actualSize = computed(() => {
  if (typeof props.size === 'number') return props.size
  return sizeMap[props.size] || sizeMap.default
})

// 超出数量
const surplus = computed(() => {
  if (props.total !== undefined && props.total > props.max) {
    return props.total - props.max
  }
  return 0
})

// 负边距 (头像重叠)
const overlapOffset = computed(() => -actualSize.value * 0.3)

const groupStyle = computed(() => ({
  '--avatar-size': `${actualSize.value}px`,
  '--avatar-overlap': `${overlapOffset.value}px`
}))

const surplusStyle = computed(() => ({
  width: `${actualSize.value}px`,
  height: `${actualSize.value}px`,
  fontSize: `${actualSize.value * 0.35}px`,
  borderRadius: props.shape === 'circle' ? '50%' : '6px'
}))

// 向子组件提供配置
provide('avatarGroupContext', {
  size: props.size,
  shape: props.shape
})
</script>

<style scoped>
.avatar-group {
  display: inline-flex;
  align-items: center;
}

.avatar-group :deep(.avatar) {
  border: 2px solid #fff;
  box-sizing: content-box;
}

.avatar-group :deep(.avatar:not(:first-child)) {
  margin-left: var(--avatar-overlap, -12px);
}

.avatar-group__surplus {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary, #e5e7eb);
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  border: 2px solid #fff;
  box-sizing: content-box;
  margin-left: var(--avatar-overlap, -12px);
}
</style>
