<template>
  <div class="list-item" :class="{ 'list-item-clickable': $attrs.onClick }">
    <div v-if="$slots.extra" class="list-item-extra">
      <slot name="extra" />
    </div>
    
    <div class="list-item-main">
      <div v-if="$slots.avatar || avatar" class="list-item-avatar">
        <slot name="avatar">
          <img :src="avatar" :alt="title" class="list-item-avatar-img" />
        </slot>
      </div>
      
      <div class="list-item-content">
        <div class="list-item-meta">
          <div v-if="title || $slots.title" class="list-item-title">
            <slot name="title">{{ title }}</slot>
          </div>
          <div v-if="description || $slots.description" class="list-item-description">
            <slot name="description">{{ description }}</slot>
          </div>
        </div>
        
        <div v-if="$slots.default" class="list-item-body">
          <slot />
        </div>
      </div>
      
      <div v-if="$slots.actions" class="list-item-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  avatar?: string
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  avatar: '',
  title: '',
  description: ''
})
</script>

<style scoped>
.list-item {
  display: flex;
  flex-direction: column;
}

.list-item-clickable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.list-item-clickable:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.list-item-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.list-item-avatar {
  flex-shrink: 0;
}

.list-item-avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.list-item-content {
  flex: 1;
  min-width: 0;
}

.list-item-meta {
  margin-bottom: 4px;
}

.list-item-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
  line-height: 1.5;
}

.list-item-description {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.5;
}

.list-item-body {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}

.list-item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.list-item-extra {
  margin-bottom: 16px;
}

/* Actions 样式 */
.list-item-actions :deep(> *) {
  color: var(--primary-color, #4B6EF5);
  cursor: pointer;
  font-size: 14px;
}

.list-item-actions :deep(> *:hover) {
  opacity: 0.8;
}

.list-item-actions :deep(> *::after) {
  content: '';
  display: inline-block;
  width: 1px;
  height: 14px;
  background-color: #d9d9d9;
  margin-left: 8px;
  vertical-align: middle;
}

.list-item-actions :deep(> *:last-child::after) {
  display: none;
}
</style>
