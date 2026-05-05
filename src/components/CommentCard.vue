<template>
  <div class="comment-card" :class="{ 'is-reply': isReply }">
    <!-- 用户头像 -->
    <div class="comment-avatar">
      <img v-if="comment.user.avatar" :src="comment.user.avatar" :alt="comment.user.name" />
      <div v-else class="avatar-placeholder">
        {{ comment.user.name.charAt(0) }}
      </div>
    </div>
    
    <!-- 评论内容 -->
    <div class="comment-content">
      <div class="comment-header">
        <span class="user-name">{{ comment.user.name }}</span>
        <span v-if="comment.replyTo" class="reply-to">
          回复 <span class="target-user">@{{ comment.replyTo.name }}</span>
        </span>
        <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
        <span v-if="comment.updatedAt" class="edited-badge">(已编辑)</span>
      </div>
      
      <!-- 编辑模式 -->
      <div v-if="isEditing" class="edit-mode">
        <textarea v-model="editContent" rows="3"></textarea>
        <div class="edit-actions">
          <button class="btn btn-text" @click="cancelEdit">取消</button>
          <button class="btn btn-primary" @click="saveEdit">保存</button>
        </div>
      </div>
      
      <!-- 显示模式 -->
      <template v-else>
        <div class="comment-text">{{ comment.content }}</div>
        
        <div class="comment-actions">
          <button 
            class="action-btn"
            :class="{ active: comment.liked }"
            @click="handleLike"
          >
            <IconLib :name="comment.liked ? 'heart-fill' : 'heart'" :size="14" />
            <span v-if="comment.likes > 0">{{ comment.likes }}</span>
          </button>
          
          <button 
            v-if="!readonly && allowReplies"
            class="action-btn"
            @click="handleReply"
          >
            <IconLib name="message-circle" :size="14" />
            回复
          </button>
          
          <!-- 更多操作 -->
          <div v-if="isOwner" class="more-actions">
            <button class="action-btn" @click="toggleMenu">
              <IconLib name="more-horizontal" :size="14" />
            </button>
            
            <transition name="fade">
              <div v-if="showMenu" class="action-menu">
                <button @click="startEdit">
                  <IconLib name="edit" :size="14" />
                  编辑
                </button>
                <button class="danger" @click="handleDelete">
                  <IconLib name="trash" :size="14" />
                  删除
                </button>
              </div>
            </transition>
          </div>
        </div>
      </template>
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:visible="showDeleteConfirmDialog"
      type="danger"
      title="确认删除"
      message="确定要删除这条评论吗？此操作不可恢复。"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="handleDeleteConfirmed"
      @cancel="showDeleteConfirmDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

// Types
interface User {
  id: string
  name: string
  avatar?: string
}

interface Comment {
  id: string
  content: string
  user: User
  createdAt: string | Date
  updatedAt?: string | Date
  likes: number
  liked?: boolean
  replyTo?: User
}

// Props
interface Props {
  comment: Comment
  currentUser?: User
  readonly?: boolean
  isReply?: boolean
  allowReplies?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  isReply: false,
  allowReplies: true
})

// Emits
const emit = defineEmits<{
  reply: [comment: Comment]
  like: [comment: Comment]
  delete: [comment: Comment]
  edit: [comment: Comment, newContent: string]
}>()

// State
const showMenu = ref(false)
const isEditing = ref(false)
const editContent = ref('')
const showDeleteConfirmDialog = ref(false)

// Computed
const isOwner = computed(() => {
  return props.currentUser?.id === props.comment.user.id
})

// Methods
function formatTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function handleLike() {
  emit('like', props.comment)
}

function handleReply() {
  emit('reply', props.comment)
}

function handleDelete() {
  showMenu.value = false
  showDeleteConfirmDialog.value = true
}

function handleDeleteConfirmed() {
  showDeleteConfirmDialog.value = false
  emit('delete', props.comment)
}

function startEdit() {
  showMenu.value = false
  editContent.value = props.comment.content
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  editContent.value = ''
}

function saveEdit() {
  if (editContent.value.trim()) {
    emit('edit', props.comment, editContent.value.trim())
    isEditing.value = false
  }
}

// 点击外部关闭菜单
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.more-actions')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.comment-card {
  display: flex;
  gap: 12px;
}

.comment-card.is-reply {
  padding: 8px 0;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.is-reply .comment-avatar img {
  width: 32px;
  height: 32px;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.is-reply .avatar-placeholder {
  width: 32px;
  height: 32px;
  font-size: 13px;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.reply-to {
  font-size: 13px;
  color: #999;
}

.target-user {
  color: var(--primary-color, #4B6EF5);
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.edited-badge {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #999;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  color: #666;
  background: #f5f5f5;
}

.action-btn.active {
  color: #ff4757;
}

.more-actions {
  position: relative;
  margin-left: auto;
}

.action-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 10;
  min-width: 100px;
}

.action-menu button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.action-menu button:hover {
  background: #f5f5f5;
}

.action-menu button.danger {
  color: #ff4757;
}

.action-menu button.danger:hover {
  background: #fff5f5;
}

/* 编辑模式 */
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-mode textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.edit-mode textarea:focus {
  outline: none;
  border-color: var(--primary-color, #4B6EF5);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-text {
  background: transparent;
  color: #666;
}

.btn-text:hover {
  color: #333;
}

.btn-primary {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
