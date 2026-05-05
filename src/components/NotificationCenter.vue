<template>
  <div class="notification-center">
    <!-- 触发按钮 -->
    <button 
      class="notification-trigger"
      :class="{ 'has-unread': unreadCount > 0 }"
      @click="isOpen = !isOpen"
    >
      <IconLib name="bell" :size="20" />
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <!-- 下拉面板 -->
    <transition name="dropdown">
      <div v-if="isOpen" class="notification-panel">
        <div class="panel-header">
          <h3>通知中心</h3>
          <div class="header-actions">
            <button 
              v-if="unreadCount > 0"
              class="action-btn"
              @click="markAllAsRead"
              title="全部标为已读"
            >
              <IconLib name="check-circle" :size="18" />
            </button>
            <button class="action-btn" @click="openSettings" title="设置">
              <IconLib name="settings" :size="18" />
            </button>
          </div>
        </div>

        <!-- 筛选标签 -->
        <div class="panel-tabs">
          <button 
            v-for="tab in tabs"
            :key="tab.value"
            class="tab-btn"
            :class="{ 'is-active': activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <!-- 通知列表 -->
        <div class="panel-content" ref="scrollContainer">
          <template v-if="filteredNotifications.length > 0">
            <div 
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="notification-item"
              :class="{ 
                'is-unread': !notification.read,
                [`type-${notification.type}`]: true
              }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-icon" :class="notification.type">
                <IconLib :name="getIcon(notification.type)" :size="18" />
              </div>
              <div class="notification-body">
                <p class="notification-title">{{ notification.title }}</p>
                <p class="notification-message">{{ notification.message }}</p>
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
              <div class="notification-actions">
                <button 
                  v-if="!notification.read"
                  class="item-action"
                  @click.stop="markAsRead(notification)"
                  title="标为已读"
                >
                  <IconLib name="check" :size="14" />
                </button>
                <button 
                  class="item-action"
                  @click.stop="removeNotification(notification)"
                  title="删除"
                >
                  <IconLib name="x" :size="14" />
                </button>
              </div>
            </div>
          </template>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <IconLib name="inbox" :size="40" />
            <p>暂无通知</p>
          </div>

          <!-- 加载更多 -->
          <button 
            v-if="hasMore && filteredNotifications.length > 0"
            class="load-more-btn"
            @click="loadMore"
            :disabled="isLoading"
          >
            {{ isLoading ? '加载中...' : '加载更多' }}
          </button>
        </div>

        <!-- 底部操作 -->
        <div class="panel-footer">
          <button class="clear-btn" @click="clearAll">
            <IconLib name="trash-2" :size="16" />
            清空全部
          </button>
        </div>
      </div>
    </transition>

    <!-- 点击外部关闭 -->
    <div v-if="isOpen" class="overlay" @click="isOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: Date
  action?: () => void
}

const emit = defineEmits<{
  click: [notification: Notification]
  openSettings: []
}>()

// 状态
const isOpen = ref(false)
const activeTab = ref('all')
const isLoading = ref(false)
const hasMore = ref(true)

// 模拟通知数据
const notifications = ref<Notification[]>([
  {
    id: '1',
    type: 'success',
    title: '导出成功',
    message: '您的文档已成功导出为 PDF 格式',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: '2',
    type: 'info',
    title: '系统更新',
    message: '新版本 1.2.0 已发布，包含多项功能改进',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '3',
    type: 'warning',
    title: '存储空间不足',
    message: '您的存储空间即将用尽，请及时清理',
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '4',
    type: 'error',
    title: '上传失败',
    message: '文件上传失败，请检查网络连接后重试',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    type: 'success',
    title: '批量处理完成',
    message: '已成功处理 25 个文档',
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
])

// 标签页
const tabs = computed(() => [
  { value: 'all', label: '全部', count: notifications.value.length },
  { value: 'unread', label: '未读', count: unreadCount.value },
  { value: 'success', label: '成功', count: notifications.value.filter(n => n.type === 'success').length },
  { value: 'warning', label: '警告', count: notifications.value.filter(n => n.type === 'warning' || n.type === 'error').length }
])

// 未读数量
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// 筛选通知
const filteredNotifications = computed(() => {
  switch (activeTab.value) {
    case 'unread':
      return notifications.value.filter(n => !n.read)
    case 'success':
      return notifications.value.filter(n => n.type === 'success')
    case 'warning':
      return notifications.value.filter(n => n.type === 'warning' || n.type === 'error')
    default:
      return notifications.value
  }
})

// 获取图标
const getIcon = (type: string): string => {
  switch (type) {
    case 'success': return 'check-circle'
    case 'warning': return 'alert-triangle'
    case 'error': return 'x-circle'
    default: return 'info'
  }
}

// 格式化时间
const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 标记已读
const markAsRead = (notification: Notification) => {
  notification.read = true
}

// 全部标为已读
const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

// 删除通知
const removeNotification = (notification: Notification) => {
  const index = notifications.value.findIndex(n => n.id === notification.id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 清空全部
const clearAll = () => {
  if (confirm('确定要清空所有通知吗？')) {
    notifications.value = []
  }
}

// 加载更多
const loadMore = async () => {
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  // 模拟加载
  hasMore.value = false
  isLoading.value = false
}

// 点击通知
const handleNotificationClick = (notification: Notification) => {
  markAsRead(notification)
  emit('click', notification)
  if (notification.action) {
    notification.action()
  }
}

// 打开设置
const openSettings = () => {
  emit('openSettings')
  isOpen.value = false
}

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.notification-center')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法
defineExpose({
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    notifications.value.unshift({
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date()
    })
  }
})
</script>

<style scoped>
.notification-center {
  position: relative;
}

/* 触发按钮 */
.notification-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-trigger:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

.notification-trigger.has-unread {
  color: var(--primary-color, #4B6EF5);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 18px;
  background: #ef4444;
  color: #fff;
  border-radius: 9px;
}

/* 下拉面板 */
.notification-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
  color: var(--primary-color, #4B6EF5);
}

/* 标签页 */
.panel-tabs {
  display: flex;
  padding: 0 1.25rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 0;
  margin-right: 1.25rem;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--primary-color, #4B6EF5);
}

.tab-btn.is-active {
  color: var(--primary-color, #4B6EF5);
  border-bottom-color: var(--primary-color, #4B6EF5);
}

.tab-count {
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 10px;
}

.tab-btn.is-active .tab-count {
  background: var(--primary-color-light, #eff1ff);
  color: var(--primary-color, #4B6EF5);
}

/* 内容区 */
.panel-content {
  max-height: 400px;
  overflow-y: auto;
}

/* 通知项 */
.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.notification-item:hover {
  background: var(--bg-color-secondary, #f9fafb);
}

.notification-item.is-unread {
  background: var(--primary-color-light, #eff1ff);
}

.notification-item.is-unread:hover {
  background: rgba(75, 110, 245, 0.15);
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-icon.info {
  background: rgba(75, 110, 245, 0.1);
  color: #4B6EF5;
}

.notification-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.notification-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.notification-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.notification-message {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-color-muted, #9ca3af);
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.item-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
  color: var(--text-color-muted, #9ca3af);
  cursor: pointer;
  transition: all 0.2s ease;
}

.item-action:hover {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
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

/* 加载更多 */
.load-more-btn {
  display: block;
  width: 100%;
  padding: 0.75rem;
  font-size: 0.875rem;
  background: var(--bg-color-secondary, #f9fafb);
  border: none;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--bg-color-tertiary, #e5e7eb);
}

.load-more-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 底部 */
.panel-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* 遮罩 */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

/* 过渡动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
