<template>
  <div class="activity-timeline">
    <div class="timeline-header" v-if="title">
      <h3>
        <IconLib name="activity" :size="20" />
        {{ title }}
      </h3>
      <div class="header-actions" v-if="$slots.actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="timeline-content">
      <div 
        v-for="(group, groupIndex) in groupedActivities"
        :key="groupIndex"
        class="timeline-group"
      >
        <!-- 日期分组标题 -->
        <div class="group-date" v-if="showDateGroups">
          <span>{{ group.date }}</span>
        </div>

        <!-- 活动列表 -->
        <div class="timeline-items">
          <div 
            v-for="(activity, index) in group.items"
            :key="activity.id"
            class="timeline-item"
            :class="{ 'is-last': index === group.items.length - 1 }"
          >
            <!-- 时间线 -->
            <div class="item-line">
              <div 
                class="item-dot"
                :class="[
                  `type-${activity.type}`,
                  { 'has-avatar': activity.avatar }
                ]"
              >
                <img v-if="activity.avatar" :src="activity.avatar" :alt="activity.user" />
                <IconLib v-else :name="getActivityIcon(activity.type)" :size="14" />
              </div>
            </div>

            <!-- 内容 -->
            <div class="item-content">
              <div class="item-header">
                <span class="item-user" v-if="activity.user">{{ activity.user }}</span>
                <span class="item-action">{{ activity.action }}</span>
                <span class="item-target" v-if="activity.target" @click="handleTargetClick(activity)">
                  {{ activity.target }}
                </span>
              </div>

              <div class="item-description" v-if="activity.description">
                {{ activity.description }}
              </div>

              <!-- 附加内容 -->
              <div class="item-extra" v-if="activity.extra">
                <slot name="extra" :activity="activity">
                  <div class="extra-content" v-if="activity.extra.type === 'preview'">
                    <div class="preview-card">
                      <img v-if="activity.extra.image" :src="activity.extra.image" :alt="activity.extra.title" />
                      <div class="preview-info">
                        <span class="preview-title">{{ activity.extra.title }}</span>
                        <span class="preview-desc">{{ activity.extra.description }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="extra-content" v-else-if="activity.extra.type === 'code'">
                    <pre class="code-block"><code>{{ activity.extra.code }}</code></pre>
                  </div>
                  <div class="extra-content" v-else-if="activity.extra.type === 'diff'">
                    <div class="diff-block">
                      <div class="diff-line diff-remove" v-if="activity.extra.removed">
                        <span class="diff-sign">-</span>
                        <span>{{ activity.extra.removed }}</span>
                      </div>
                      <div class="diff-line diff-add" v-if="activity.extra.added">
                        <span class="diff-sign">+</span>
                        <span>{{ activity.extra.added }}</span>
                      </div>
                    </div>
                  </div>
                </slot>
              </div>

              <div class="item-footer">
                <span class="item-time">
                  <IconLib name="clock" :size="12" />
                  {{ formatTime(activity.timestamp) }}
                </span>
                <div class="item-actions" v-if="showActions">
                  <button class="action-btn" @click="$emit('like', activity)" title="点赞">
                    <IconLib name="thumbs-up" :size="14" />
                    <span v-if="activity.likes">{{ activity.likes }}</span>
                  </button>
                  <button class="action-btn" @click="$emit('comment', activity)" title="评论">
                    <IconLib name="message-circle" :size="14" />
                    <span v-if="activity.comments">{{ activity.comments }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="timeline-footer" v-if="hasMore">
        <button class="load-more-btn" @click="$emit('loadMore')" :disabled="loading">
          <IconLib v-if="loading" name="loader" :size="16" class="spin" />
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="activities.length === 0">
        <IconLib name="inbox" :size="40" />
        <p>暂无活动记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface ActivityExtra {
  type: 'preview' | 'code' | 'diff' | 'custom'
  image?: string
  title?: string
  description?: string
  code?: string
  removed?: string
  added?: string
  [key: string]: any
}

interface Activity {
  id: string
  type: 'create' | 'update' | 'delete' | 'comment' | 'share' | 'upload' | 'download' | 'login' | 'other'
  user?: string
  avatar?: string
  action: string
  target?: string
  targetId?: string
  description?: string
  extra?: ActivityExtra
  timestamp: Date | string
  likes?: number
  comments?: number
}

const props = withDefaults(defineProps<{
  activities: Activity[]
  title?: string
  showDateGroups?: boolean
  showActions?: boolean
  hasMore?: boolean
  loading?: boolean
}>(), {
  showDateGroups: true,
  showActions: false,
  hasMore: false,
  loading: false
})

const emit = defineEmits<{
  like: [activity: Activity]
  comment: [activity: Activity]
  targetClick: [activity: Activity]
  loadMore: []
}>()

// 按日期分组
const groupedActivities = computed(() => {
  if (!props.showDateGroups) {
    return [{ date: '', items: props.activities }]
  }

  const groups: { date: string; items: Activity[] }[] = []
  const dateMap = new Map<string, Activity[]>()

  props.activities.forEach(activity => {
    const date = formatDateGroup(activity.timestamp)
    if (!dateMap.has(date)) {
      dateMap.set(date, [])
    }
    dateMap.get(date)!.push(activity)
  })

  dateMap.forEach((items, date) => {
    groups.push({ date, items })
  })

  return groups
})

// 格式化日期分组
const formatDateGroup = (timestamp: Date | string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric'
  })
}

// 格式化时间
const formatTime = (timestamp: Date | string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取活动图标
const getActivityIcon = (type: Activity['type']): string => {
  const icons: Record<string, string> = {
    create: 'plus',
    update: 'edit',
    delete: 'trash',
    comment: 'message-circle',
    share: 'share-2',
    upload: 'upload',
    download: 'download',
    login: 'log-in',
    other: 'activity'
  }
  return icons[type] || 'activity'
}

// 处理目标点击
const handleTargetClick = (activity: Activity) => {
  emit('targetClick', activity)
}
</script>

<style scoped>
.activity-timeline {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

/* 头部 */
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.timeline-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1rem;
}

/* 内容 */
.timeline-content {
  padding: 1rem 0;
}

/* 日期分组 */
.group-date {
  padding: 0.5rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color-secondary, #666);
  text-transform: uppercase;
}

/* 时间线项 */
.timeline-item {
  display: flex;
  padding: 0.75rem 1.25rem;
  transition: background 0.2s ease;
}

.timeline-item:hover {
  background: var(--bg-color-secondary, #f9fafb);
}

/* 时间线 */
.item-line {
  position: relative;
  width: 36px;
  flex-shrink: 0;
}

.item-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 50%;
  color: var(--text-color-secondary, #666);
}

.item-dot.has-avatar {
  padding: 0;
  overflow: hidden;
}

.item-dot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-dot.type-create {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.item-dot.type-update {
  background: rgba(75, 110, 245, 0.1);
  color: #4B6EF5;
}

.item-dot.type-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.item-dot.type-comment {
  background: rgba(108, 92, 231, 0.1);
  color: #6C5CE7;
}

.item-dot.type-share {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.item-dot.type-upload {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}

.timeline-item:not(.is-last) .item-line::after {
  content: '';
  position: absolute;
  left: 13px;
  top: 32px;
  bottom: -12px;
  width: 2px;
  background: var(--border-color, #e5e7eb);
}

/* 内容 */
.item-content {
  flex: 1;
  min-width: 0;
  padding-left: 0.75rem;
}

.item-header {
  font-size: 0.9375rem;
  line-height: 1.5;
}

.item-user {
  font-weight: 600;
}

.item-action {
  color: var(--text-color-secondary, #666);
}

.item-target {
  color: var(--primary-color, #4B6EF5);
  cursor: pointer;
}

.item-target:hover {
  text-decoration: underline;
}

.item-description {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary, #666);
  line-height: 1.5;
}

/* 附加内容 */
.item-extra {
  margin-top: 0.75rem;
}

.preview-card {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-color-secondary, #f9fafb);
  border-radius: 8px;
  max-width: 300px;
}

.preview-card img {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.preview-desc {
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
}

.code-block {
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  background: var(--bg-color-secondary, #f9fafb);
  border-radius: 8px;
  overflow-x: auto;
}

.code-block code {
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
}

.diff-block {
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 0.8125rem;
  background: var(--bg-color-secondary, #f9fafb);
  border-radius: 8px;
  overflow: hidden;
}

.diff-line {
  display: flex;
  padding: 0.375rem 0.75rem;
}

.diff-sign {
  width: 1.5em;
  font-weight: 600;
}

.diff-remove {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.diff-add {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

/* 底部 */
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.item-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-color-muted, #9ca3af);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-color-muted, #9ca3af);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
  color: var(--primary-color, #4B6EF5);
}

/* 加载更多 */
.timeline-footer {
  padding: 1rem;
  text-align: center;
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border: none;
  border-radius: 6px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--bg-color-tertiary, #e5e7eb);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  color: var(--text-color-muted, #9ca3af);
}

.empty-state p {
  margin: 0.75rem 0 0;
}

/* 动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
