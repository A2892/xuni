<template>
  <div 
    class="skeleton"
    :class="skeletonClasses"
    :style="skeletonStyle"
  >
    <template v-if="loading">
      <!-- 头像 -->
      <div v-if="avatar" class="skeleton__avatar" :style="avatarStyle"></div>
      
      <!-- 内容 -->
      <div class="skeleton__content">
        <div 
          v-if="title"
          class="skeleton__title"
          :style="titleStyle"
        ></div>
        
        <div 
          v-for="n in rows"
          :key="n"
          class="skeleton__row"
          :style="getRowStyle(n)"
        ></div>
      </div>
    </template>
    
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 是否加载中
  loading?: boolean
  // 是否显示动画
  animated?: boolean
  // 是否显示头像
  avatar?: boolean
  // 头像大小
  avatarSize?: number | 'small' | 'default' | 'large'
  // 头像形状
  avatarShape?: 'circle' | 'square'
  // 是否显示标题
  title?: boolean
  // 标题宽度
  titleWidth?: number | string
  // 段落行数
  rows?: number
  // 段落宽度 (数组对应每行)
  rowWidth?: number | string | (number | string)[]
  // 是否圆形
  round?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: true,
  animated: true,
  avatar: false,
  avatarSize: 'default',
  avatarShape: 'circle',
  title: true,
  titleWidth: '38%',
  rows: 3,
  round: false
})

// 头像尺寸映射
const avatarSizeMap: Record<string, number> = {
  small: 32,
  default: 40,
  large: 48
}

const actualAvatarSize = computed(() => {
  if (typeof props.avatarSize === 'number') return props.avatarSize
  return avatarSizeMap[props.avatarSize] || 40
})

const skeletonClasses = computed(() => [
  {
    'skeleton--animated': props.animated,
    'skeleton--round': props.round,
    'skeleton--with-avatar': props.avatar
  }
])

const skeletonStyle = computed(() => ({}))

const avatarStyle = computed(() => ({
  width: `${actualAvatarSize.value}px`,
  height: `${actualAvatarSize.value}px`,
  borderRadius: props.avatarShape === 'circle' ? '50%' : '4px'
}))

const titleStyle = computed(() => ({
  width: typeof props.titleWidth === 'number' 
    ? `${props.titleWidth}px` 
    : props.titleWidth
}))

function getRowStyle(index: number) {
  let width: string | number = '100%'
  
  if (Array.isArray(props.rowWidth)) {
    width = props.rowWidth[index - 1] || '100%'
  } else if (props.rowWidth) {
    width = props.rowWidth
  } else if (index === props.rows) {
    // 最后一行默认 60%
    width = '60%'
  }
  
  return {
    width: typeof width === 'number' ? `${width}px` : width
  }
}
</script>

<style scoped>
.skeleton {
  width: 100%;
}

.skeleton--with-avatar {
  display: flex;
  gap: 16px;
}

/* 头像 */
.skeleton__avatar {
  flex-shrink: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

/* 内容 */
.skeleton__content {
  flex: 1;
  min-width: 0;
}

/* 标题 */
.skeleton__title {
  height: 20px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
}

/* 段落行 */
.skeleton__row {
  height: 16px;
  margin-top: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
}

.skeleton__row:first-child {
  margin-top: 0;
}

/* 圆角 */
.skeleton--round .skeleton__title,
.skeleton--round .skeleton__row {
  border-radius: 100px;
}

/* 动画 */
.skeleton--animated .skeleton__avatar,
.skeleton--animated .skeleton__title,
.skeleton--animated .skeleton__row {
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
