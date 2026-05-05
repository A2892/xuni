<template>
  <div class="empty" :class="`empty--${size}`">
    <!-- 图片 -->
    <div class="empty__image">
      <slot name="image">
        <component :is="imageComponent" v-if="imageComponent" />
        <img v-else-if="image" :src="image" :alt="description || '暂无数据'" />
        <svg v-else viewBox="0 0 64 41" class="empty__default-image">
          <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
            <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7"/>
            <g fill-rule="nonzero" stroke="#d9d9d9">
              <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"/>
              <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"/>
            </g>
          </g>
        </svg>
      </slot>
    </div>
    
    <!-- 描述文字 -->
    <div v-if="description || $slots.description" class="empty__description">
      <slot name="description">{{ description }}</slot>
    </div>
    
    <!-- 操作区域 -->
    <div v-if="$slots.default" class="empty__footer">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

interface Props {
  // 自定义图片
  image?: string
  // 图片组件
  imageComponent?: Component
  // 图片样式
  imageStyle?: Record<string, string>
  // 描述文字
  description?: string
  // 尺寸
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  size: 'default'
})
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.empty--small {
  padding: 16px 8px;
}

.empty--large {
  padding: 48px 24px;
}

.empty__image {
  margin-bottom: 8px;
}

.empty--small .empty__image {
  margin-bottom: 4px;
}

.empty--large .empty__image {
  margin-bottom: 12px;
}

.empty__image img {
  max-width: 100%;
  height: auto;
}

.empty--small .empty__image img,
.empty--small .empty__default-image {
  width: 48px;
  height: auto;
}

.empty--default .empty__image img,
.empty--default .empty__default-image,
.empty__default-image {
  width: 64px;
  height: auto;
}

.empty--large .empty__image img,
.empty--large .empty__default-image {
  width: 96px;
  height: auto;
}

.empty__description {
  color: #999;
  font-size: 14px;
  line-height: 1.5;
}

.empty--small .empty__description {
  font-size: 12px;
}

.empty--large .empty__description {
  font-size: 16px;
}

.empty__footer {
  margin-top: 16px;
}

.empty--small .empty__footer {
  margin-top: 8px;
}

.empty--large .empty__footer {
  margin-top: 24px;
}
</style>
