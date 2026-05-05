<template>
  <div class="avatar" :class="[`avatar--${size}`, `avatar--${shape}`]" :style="avatarStyle">
    <!-- 图片 -->
    <img 
      v-if="src && !error" 
      :src="src" 
      :alt="alt"
      class="avatar-image"
      @error="handleError"
      @load="handleLoad"
    />
    
    <!-- 文字 -->
    <span v-else-if="text" class="avatar-text">{{ displayText }}</span>
    
    <!-- 图标 -->
    <IconLib v-else :name="icon" :size="iconSize" class="avatar-icon" />
    
    <!-- 状态指示器 -->
    <span 
      v-if="status" 
      class="avatar-status"
      :class="`avatar-status--${status}`"
    ></span>
    
    <!-- 角标 -->
    <span v-if="badge !== undefined" class="avatar-badge">
      {{ badge > 99 ? '99+' : badge }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  src?: string
  alt?: string
  text?: string
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  shape?: 'circle' | 'square' | 'rounded'
  status?: 'online' | 'offline' | 'busy' | 'away'
  badge?: number
  bgColor?: string
  textColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'user',
  size: 'md',
  shape: 'circle',
  alt: '头像'
})

const error = ref(false)

const sizeMap: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80
}

const actualSize = computed(() => {
  if (typeof props.size === 'number') return props.size
  return sizeMap[props.size] || 40
})

const iconSize = computed(() => Math.floor(actualSize.value * 0.5))

const displayText = computed(() => {
  if (!props.text) return ''
  // 取首字母或中文首字
  const str = props.text.trim()
  if (/[\u4e00-\u9fa5]/.test(str)) {
    return str.slice(0, 2)
  }
  return str.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})

// 根据文字生成背景色
const generateColor = (text: string): string => {
  const colors = [
    '#4B6EF5', '#6C5CE7', '#00CEC9', '#FDCB6E', 
    '#E17055', '#74B9FF', '#FF7675', '#A29BFE',
    '#55EFC4', '#FAB1A0', '#81ECEC', '#DFE6E9'
  ]
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const avatarStyle = computed(() => {
  const styles: Record<string, string> = {
    width: `${actualSize.value}px`,
    height: `${actualSize.value}px`,
    fontSize: `${Math.floor(actualSize.value * 0.4)}px`
  }
  
  if (!props.src || error.value) {
    styles.backgroundColor = props.bgColor || generateColor(props.text || 'default')
    styles.color = props.textColor || '#fff'
  }
  
  return styles
})

const handleError = () => {
  error.value = true
}

const handleLoad = () => {
  error.value = false
}
</script>

<style scoped>
.avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  font-weight: 500;
  user-select: none;
}

.avatar--circle {
  border-radius: 50%;
}

.avatar--square {
  border-radius: 0;
}

.avatar--rounded {
  border-radius: 8px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  line-height: 1;
  letter-spacing: -0.02em;
}

.avatar-icon {
  color: inherit;
}

/* 状态指示器 */
.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  min-width: 8px;
  min-height: 8px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-sizing: content-box;
}

.avatar-status--online {
  background: #10b981;
}

.avatar-status--offline {
  background: #9ca3af;
}

.avatar-status--busy {
  background: #ef4444;
}

.avatar-status--away {
  background: #f59e0b;
}

/* 角标 */
.avatar-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  border: 2px solid #fff;
  box-sizing: content-box;
}
</style>
