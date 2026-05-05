<template>
  <span class="avatar" :class="avatarClasses" :style="avatarStyle">
    <!-- 图片 -->
    <img 
      v-if="src && !hasError" 
      :src="src" 
      :alt="alt"
      @error="handleError"
      @load="handleLoad"
    />
    
    <!-- 图标 -->
    <IconLib 
      v-else-if="icon" 
      :name="icon" 
      :size="iconSize"
    />
    
    <!-- 文字 -->
    <span v-else class="avatar__text" :style="textStyle">
      <slot>{{ avatarText }}</slot>
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

type AvatarSize = 'small' | 'default' | 'large' | number
type AvatarShape = 'circle' | 'square'

interface Props {
  // 图片地址
  src?: string
  // 替代文本
  alt?: string
  // 形状
  shape?: AvatarShape
  // 尺寸
  size?: AvatarSize
  // 图标
  icon?: string
  // 背景色
  bgColor?: string
  // 文字颜色
  textColor?: string
  // 适配方式
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
}

const props = withDefaults(defineProps<Props>(), {
  shape: 'circle',
  size: 'default',
  fit: 'cover'
})

const emit = defineEmits<{
  (e: 'error', event: Event): void
  (e: 'load', event: Event): void
}>()

const hasError = ref(false)

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

// 图标尺寸
const iconSize = computed(() => Math.round(actualSize.value * 0.5))

// 文字尺寸
const textSize = computed(() => Math.round(actualSize.value * 0.4))

// 头像文字 (取第一个字符)
const avatarText = computed(() => {
  if (props.alt) {
    return props.alt.charAt(0).toUpperCase()
  }
  return ''
})

const avatarClasses = computed(() => [
  `avatar--${props.shape}`,
  {
    'avatar--image': props.src && !hasError.value
  }
])

const avatarStyle = computed(() => ({
  width: `${actualSize.value}px`,
  height: `${actualSize.value}px`,
  fontSize: `${textSize.value}px`,
  backgroundColor: props.bgColor || undefined,
  color: props.textColor || undefined,
  '--avatar-fit': props.fit
}))

const textStyle = computed(() => ({
  lineHeight: `${actualSize.value}px`
}))

function handleError(event: Event) {
  hasError.value = true
  emit('error', event)
}

function handleLoad(event: Event) {
  emit('load', event)
}
</script>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-secondary, #e5e7eb);
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  vertical-align: middle;
  white-space: nowrap;
  user-select: none;
}

/* 形状 */
.avatar--circle {
  border-radius: 50%;
}

.avatar--square {
  border-radius: 6px;
}

/* 图片 */
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: var(--avatar-fit, cover);
}

/* 文字 */
.avatar__text {
  text-align: center;
}
</style>
