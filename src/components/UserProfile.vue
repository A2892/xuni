<template>
  <div class="user-profile-card" :class="[`size-${size}`, { 'with-border': border }]">
    <!-- 头像 -->
    <div class="avatar-section">
      <div class="avatar" :class="{ online: isOnline }">
        <img 
          v-if="avatar"
          :src="avatar"
          :alt="name"
          class="avatar-image"
        />
        <span v-else class="avatar-text" :style="{ backgroundColor: avatarColor }">
          {{ initials }}
        </span>
        <span class="status-dot" v-if="showStatus" :class="statusClass"></span>
      </div>
      <button 
        v-if="editable && size !== 'small'"
        class="avatar-edit-btn"
        @click="$emit('edit-avatar')"
      >
        <IconLib name="camera" :size="14" />
      </button>
    </div>

    <!-- 用户信息 -->
    <div class="user-info">
      <div class="user-header">
        <h4 class="user-name">
          {{ name }}
          <IconLib 
            v-if="verified" 
            name="check-circle" 
            :size="14" 
            class="verified-badge"
          />
        </h4>
        <span class="user-role" v-if="role && size !== 'small'">{{ role }}</span>
      </div>
      
      <p class="user-handle" v-if="handle && size !== 'small'">@{{ handle }}</p>
      
      <p class="user-bio" v-if="bio && size === 'large'">{{ bio }}</p>

      <!-- 统计数据 -->
      <div class="user-stats" v-if="stats && size === 'large'">
        <div class="stat-item" v-for="stat in stats" :key="stat.label">
          <span class="stat-value">{{ formatNumber(stat.value) }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>

      <!-- 标签 -->
      <div class="user-tags" v-if="tags && tags.length > 0 && size !== 'small'">
        <span 
          v-for="tag in tags.slice(0, 3)"
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
        <span v-if="tags.length > 3" class="tag more">+{{ tags.length - 3 }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="user-actions" v-if="showActions">
      <button 
        v-if="followable"
        class="action-btn primary"
        :class="{ following: isFollowing }"
        @click="handleFollow"
      >
        <IconLib :name="isFollowing ? 'user-check' : 'user-plus'" :size="14" />
        {{ isFollowing ? '已关注' : '关注' }}
      </button>
      <button 
        v-if="messageable"
        class="action-btn secondary"
        @click="$emit('message')"
      >
        <IconLib name="message-circle" :size="14" />
        <span v-if="size !== 'small'">私信</span>
      </button>
      <div class="more-actions" v-if="size === 'large'">
        <button class="action-btn icon-only" @click="showMenu = !showMenu">
          <IconLib name="more-horizontal" :size="16" />
        </button>
        <div class="dropdown-menu" v-if="showMenu" @click.stop>
          <button @click="handleAction('share')">
            <IconLib name="share-2" :size="14" />
            分享主页
          </button>
          <button @click="handleAction('copy')">
            <IconLib name="link" :size="14" />
            复制链接
          </button>
          <button @click="handleAction('block')" class="danger">
            <IconLib name="slash" :size="14" />
            屏蔽用户
          </button>
          <button @click="handleAction('report')" class="danger">
            <IconLib name="flag" :size="14" />
            举报
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface StatItem {
  label: string
  value: number
}

const props = withDefaults(defineProps<{
  name: string
  avatar?: string
  handle?: string
  role?: string
  bio?: string
  tags?: string[]
  stats?: StatItem[]
  verified?: boolean
  isOnline?: boolean
  isFollowing?: boolean
  status?: 'online' | 'away' | 'busy' | 'offline'
  showStatus?: boolean
  showActions?: boolean
  followable?: boolean
  messageable?: boolean
  editable?: boolean
  border?: boolean
  size?: 'small' | 'medium' | 'large'
}>(), {
  verified: false,
  isOnline: false,
  isFollowing: false,
  status: 'offline',
  showStatus: false,
  showActions: false,
  followable: false,
  messageable: false,
  editable: false,
  border: false,
  size: 'medium'
})

const emit = defineEmits<{
  follow: [following: boolean]
  message: []
  'edit-avatar': []
  action: [action: string]
}>()

const showMenu = ref(false)

// 计算首字母
const initials = computed(() => {
  return props.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

// 生成头像背景色
const avatarColor = computed(() => {
  const colors = [
    '#4B6EF5', '#6C5CE7', '#10b981', '#f59e0b', 
    '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6'
  ]
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
})

// 状态样式
const statusClass = computed(() => {
  if (props.showStatus && props.status) {
    return `status-${props.status}`
  }
  return props.isOnline ? 'status-online' : 'status-offline'
})

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return String(num)
}

// 处理关注
const handleFollow = () => {
  emit('follow', !props.isFollowing)
}

// 处理操作
const handleAction = (action: string) => {
  showMenu.value = false
  emit('action', action)
}

// 点击外部关闭菜单
const handleClickOutside = () => {
  showMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-profile-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border-radius: 12px;
}

.user-profile-card.with-border {
  border: 1px solid var(--border-color, #e5e7eb);
}

/* 尺寸变体 */
.user-profile-card.size-small {
  gap: 0.75rem;
  padding: 0.75rem;
}

.user-profile-card.size-large {
  flex-direction: column;
  text-align: center;
  padding: 1.5rem;
}

/* 头像 */
.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
}

.size-small .avatar-image,
.size-small .avatar-text {
  width: 36px;
  height: 36px;
  font-size: 0.875rem;
}

.size-large .avatar-image,
.size-large .avatar-text {
  width: 80px;
  height: 80px;
  font-size: 1.5rem;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.size-small .status-dot {
  width: 10px;
  height: 10px;
}

.size-large .status-dot {
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-width: 3px;
}

.status-dot.status-online {
  background: #10b981;
}

.status-dot.status-away {
  background: #f59e0b;
}

.status-dot.status-busy {
  background: #ef4444;
}

.status-dot.status-offline {
  background: #9ca3af;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-edit-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
  color: var(--primary-color, #4B6EF5);
}

/* 用户信息 */
.user-info {
  flex: 1;
  min-width: 0;
}

.size-large .user-info {
  width: 100%;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.size-large .user-header {
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.size-small .user-name {
  font-size: 0.875rem;
}

.size-large .user-name {
  font-size: 1.25rem;
}

.verified-badge {
  color: var(--primary-color, #4B6EF5);
}

.user-role {
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 500;
  background: var(--primary-color-light, #eff1ff);
  border-radius: 4px;
  color: var(--primary-color, #4B6EF5);
}

.user-handle {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
}

.user-bio {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-color-secondary, #666);
}

/* 统计 */
.user-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
}

/* 标签 */
.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.75rem;
}

.size-large .user-tags {
  justify-content: center;
}

.tag {
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 4px;
  color: var(--text-color-secondary, #666);
}

.tag.more {
  background: var(--primary-color-light, #eff1ff);
  color: var(--primary-color, #4B6EF5);
}

/* 操作按钮 */
.user-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.size-large .user-actions {
  width: 100%;
  justify-content: center;
  margin-top: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

.action-btn.primary:hover {
  background: var(--primary-color-dark, #3b5bd5);
}

.action-btn.primary.following {
  background: var(--bg-color-secondary, #f3f4f6);
  color: var(--text-color, #333);
}

.action-btn.secondary {
  background: var(--bg-color-secondary, #f3f4f6);
  color: var(--text-color, #333);
}

.action-btn.secondary:hover {
  background: var(--border-color, #e5e7eb);
}

.action-btn.icon-only {
  padding: 0.5rem;
}

.size-small .action-btn {
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
}

/* 更多操作 */
.more-actions {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 150px;
  padding: 0.375rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.dropdown-menu button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-menu button:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

.dropdown-menu button.danger {
  color: #ef4444;
}

.dropdown-menu button.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>
