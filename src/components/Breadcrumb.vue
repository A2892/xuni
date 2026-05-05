<template>
  <nav class="breadcrumb" :class="`breadcrumb--${variant}`" aria-label="面包屑导航">
    <ol class="breadcrumb-list">
      <li 
        v-for="(item, index) in items" 
        :key="item.path || index"
        class="breadcrumb-item"
        :class="{ 'is-current': index === items.length - 1 }"
      >
        <!-- 分隔符 -->
        <span v-if="index > 0" class="breadcrumb-separator">
          <IconLib v-if="separatorIcon" :name="separatorIcon" :size="14" />
          <template v-else>{{ separator }}</template>
        </span>
        
        <!-- 链接或文本 -->
        <template v-if="index === items.length - 1">
          <span class="breadcrumb-text" :title="item.label">
            <IconLib v-if="item.icon" :name="item.icon" :size="16" class="breadcrumb-icon" />
            <span class="breadcrumb-label">{{ item.label }}</span>
          </span>
        </template>
        <template v-else>
          <router-link 
            v-if="item.path" 
            :to="item.path"
            class="breadcrumb-link"
            :title="item.label"
          >
            <IconLib v-if="item.icon" :name="item.icon" :size="16" class="breadcrumb-icon" />
            <span class="breadcrumb-label">{{ item.label }}</span>
          </router-link>
          <span v-else class="breadcrumb-text" :title="item.label">
            <IconLib v-if="item.icon" :name="item.icon" :size="16" class="breadcrumb-icon" />
            <span class="breadcrumb-label">{{ item.label }}</span>
          </span>
        </template>
      </li>
    </ol>
    
    <!-- 右侧操作区 -->
    <div v-if="$slots.actions" class="breadcrumb-actions">
      <slot name="actions"></slot>
    </div>
  </nav>
</template>

<script setup lang="ts">
import IconLib from './icons/IconLibrary.vue'

interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
}

interface Props {
  items: BreadcrumbItem[]
  separator?: string
  separatorIcon?: string
  variant?: 'default' | 'arrow' | 'slash' | 'dot'
}

withDefaults(defineProps<Props>(), {
  separator: '/',
  variant: 'default'
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 0.875rem;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  color: var(--text-color-secondary, #666);
}

.breadcrumb-item.is-current {
  color: var(--text-color-primary, #333);
  font-weight: 500;
}

.breadcrumb-separator {
  display: flex;
  align-items: center;
  margin: 0 0.5rem;
  color: var(--text-color-muted, #999);
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: inherit;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  margin: -0.25rem -0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--primary-color, #4B6EF5);
  background: rgba(75, 110, 245, 0.08);
}

.breadcrumb-text {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  margin: -0.25rem -0.5rem;
}

.breadcrumb-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.breadcrumb-label {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.breadcrumb-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 箭头变体 */
.breadcrumb--arrow .breadcrumb-item:not(:first-child)::before {
  content: '';
  display: none;
}

.breadcrumb--arrow .breadcrumb-separator {
  margin: 0 0.25rem;
}

.breadcrumb--arrow .breadcrumb-link,
.breadcrumb--arrow .breadcrumb-text {
  padding: 0.375rem 0.75rem;
  background: var(--bg-color-secondary, #f5f5f5);
  border-radius: 4px;
  position: relative;
}

.breadcrumb--arrow .breadcrumb-item:not(:last-child) .breadcrumb-link::after,
.breadcrumb--arrow .breadcrumb-item:not(:last-child) .breadcrumb-text::after {
  content: '';
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: var(--bg-color-secondary, #f5f5f5);
  z-index: 1;
}

.breadcrumb--arrow .breadcrumb-item.is-current .breadcrumb-text {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

.breadcrumb--arrow .breadcrumb-item.is-current .breadcrumb-text::after {
  border-left-color: var(--primary-color, #4B6EF5);
}

/* 斜杠变体 */
.breadcrumb--slash .breadcrumb-separator {
  font-size: 1rem;
  color: var(--text-color-muted, #ccc);
}

/* 点变体 */
.breadcrumb--dot .breadcrumb-separator::after {
  content: '•';
  font-size: 0.75rem;
}

.breadcrumb--dot .breadcrumb-separator > * {
  display: none;
}

/* 响应式 */
@media (max-width: 640px) {
  .breadcrumb-label {
    max-width: 100px;
  }
  
  .breadcrumb-item:not(:first-child):not(:last-child) .breadcrumb-label {
    display: none;
  }
  
  .breadcrumb-item:not(:first-child):not(:last-child) .breadcrumb-link,
  .breadcrumb-item:not(:first-child):not(:last-child) .breadcrumb-text {
    padding: 0.25rem;
  }
}
</style>
