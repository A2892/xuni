<template>
  <div class="comment" :class="{ 'comment-nested': nested }">
    <div class="comment-inner">
      <!-- 头像 -->
      <div class="comment-avatar">
        <slot name="avatar">
          <img
            v-if="avatar"
            :src="avatar"
            :alt="author"
            class="comment-avatar-img"
          />
          <div v-else class="comment-avatar-placeholder">
            {{ authorInitial }}
          </div>
        </slot>
      </div>
      
      <!-- 内容区 -->
      <div class="comment-content">
        <!-- 作者和时间 -->
        <div class="comment-header">
          <span class="comment-author">
            <slot name="author">{{ author }}</slot>
          </span>
          <span v-if="datetime" class="comment-datetime">
            <slot name="datetime">{{ datetime }}</slot>
          </span>
        </div>
        
        <!-- 评论内容 -->
        <div class="comment-body">
          <slot />
        </div>
        
        <!-- 操作区 -->
        <div v-if="$slots.actions" class="comment-actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
    
    <!-- 嵌套评论 -->
    <div v-if="$slots.nested" class="comment-nested-list">
      <slot name="nested" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  author?: string
  avatar?: string
  datetime?: string
  nested?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  author: '',
  avatar: '',
  datetime: '',
  nested: false
})

// 作者首字母
const authorInitial = computed(() => {
  return props.author ? props.author.charAt(0).toUpperCase() : 'U'
})
</script>

<style scoped>
.comment {
  position: relative;
}

.comment-nested {
  margin-left: 44px;
}

.comment-inner {
  display: flex;
  gap: 12px;
  padding: 16px 0;
}

.comment:not(:last-child) .comment-inner {
  border-bottom: 1px solid #f0f0f0;
}

/* 头像 */
.comment-avatar {
  flex-shrink: 0;
}

.comment-avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color, #4B6EF5), var(--secondary-color, #6C5CE7));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
}

/* 内容 */
.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}

.comment-datetime {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.comment-body {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.6;
  word-break: break-word;
}

/* 操作区 */
.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.comment-actions :deep(> *) {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.comment-actions :deep(> *:hover) {
  color: var(--primary-color, #4B6EF5);
}

/* 嵌套评论 */
.comment-nested-list {
  padding-left: 44px;
}
</style>
