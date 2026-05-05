<template>
  <div class="page-header" :class="{ 'page-header-ghost': ghost }">
    <!-- 面包屑 -->
    <div v-if="breadcrumbs.length > 0" class="page-header-breadcrumb">
      <nav class="breadcrumb">
        <ol class="breadcrumb-list">
          <li
            v-for="(item, index) in breadcrumbs"
            :key="index"
            class="breadcrumb-item"
          >
            <a
              v-if="item.href && index < breadcrumbs.length - 1"
              :href="item.href"
              class="breadcrumb-link"
            >
              {{ item.title }}
            </a>
            <span v-else class="breadcrumb-text">{{ item.title }}</span>
            <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">/</span>
          </li>
        </ol>
      </nav>
    </div>
    
    <!-- 头部内容 -->
    <div class="page-header-heading">
      <!-- 返回按钮 -->
      <div v-if="onBack" class="page-header-back" @click="handleBack">
        <IconLib name="arrow-left" :size="16" />
      </div>
      
      <!-- 头像 -->
      <div v-if="avatar || $slots.avatar" class="page-header-avatar">
        <slot name="avatar">
          <img :src="avatar" :alt="title" class="page-header-avatar-img" />
        </slot>
      </div>
      
      <!-- 标题区 -->
      <div class="page-header-title-view">
        <span class="page-header-title">
          <slot name="title">{{ title }}</slot>
        </span>
        <span v-if="subTitle || $slots.subTitle" class="page-header-subtitle">
          <slot name="subTitle">{{ subTitle }}</slot>
        </span>
        <div v-if="tags.length > 0 || $slots.tags" class="page-header-tags">
          <slot name="tags">
            <span
              v-for="(tag, index) in tags"
              :key="index"
              class="page-header-tag"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.label }}
            </span>
          </slot>
        </div>
      </div>
      
      <!-- 额外内容 -->
      <div v-if="$slots.extra" class="page-header-extra">
        <slot name="extra" />
      </div>
    </div>
    
    <!-- 内容区 -->
    <div v-if="$slots.default" class="page-header-content">
      <slot />
    </div>
    
    <!-- 底部 -->
    <div v-if="$slots.footer" class="page-header-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconLib from '@/components/icons/IconLibrary.vue'

interface BreadcrumbItem {
  title: string
  href?: string
}

interface TagItem {
  label: string
  color?: string
}

interface Props {
  title?: string
  subTitle?: string
  ghost?: boolean
  avatar?: string
  breadcrumbs?: BreadcrumbItem[]
  tags?: TagItem[]
  onBack?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subTitle: '',
  ghost: false,
  avatar: '',
  breadcrumbs: () => [],
  tags: () => [],
  onBack: undefined
})

const handleBack = () => {
  props.onBack?.()
}
</script>

<style scoped>
.page-header {
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.page-header-ghost {
  background-color: transparent;
  border-bottom: none;
}

/* 面包屑 */
.page-header-breadcrumb {
  margin-bottom: 12px;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 14px;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
}

.breadcrumb-link {
  color: rgba(0, 0, 0, 0.45);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--primary-color, #4B6EF5);
}

.breadcrumb-text {
  color: rgba(0, 0, 0, 0.88);
}

.breadcrumb-separator {
  margin: 0 8px;
  color: rgba(0, 0, 0, 0.45);
}

/* 头部 */
.page-header-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.88);
  border-radius: 4px;
  transition: all 0.2s;
}

.page-header-back:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.page-header-avatar {
  flex-shrink: 0;
}

.page-header-avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.page-header-title-view {
  flex: 1;
  min-width: 0;
}

.page-header-title {
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  line-height: 32px;
  display: inline-block;
}

.page-header-subtitle {
  margin-left: 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

.page-header-tags {
  display: inline-flex;
  gap: 8px;
  margin-left: 12px;
  vertical-align: middle;
}

.page-header-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: #fff;
  background-color: var(--primary-color, #4B6EF5);
  border-radius: 4px;
}

.page-header-extra {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}

/* 内容区 */
.page-header-content {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.page-header-ghost .page-header-content {
  border-top: none;
}

/* 底部 */
.page-header-footer {
  margin-top: 16px;
}
</style>
