<template>
  <div class="comment-section">
    <!-- 头部 -->
    <div class="section-header">
      <h3 class="section-title">
        <IconLib name="message-circle" :size="20" />
        {{ title }}
        <span class="comment-count">({{ totalComments }})</span>
      </h3>
      
      <div class="header-actions">
        <select v-model="sortBy" class="sort-select">
          <option value="newest">最新优先</option>
          <option value="oldest">最早优先</option>
          <option value="likes">最热优先</option>
        </select>
      </div>
    </div>
    
    <!-- 评论输入框 -->
    <div v-if="!readonly" class="comment-input-box">
      <div class="input-avatar">
        <img v-if="currentUser?.avatar" :src="currentUser.avatar" :alt="currentUser.name" />
        <div v-else class="avatar-placeholder">
          {{ currentUser?.name?.charAt(0) || 'U' }}
        </div>
      </div>
      
      <div class="input-content">
        <textarea
          v-model="newComment"
          :placeholder="replyingTo ? `回复 @${replyingTo.user.name}` : placeholder"
          :rows="3"
          @keydown.ctrl.enter="submitComment"
          @keydown.meta.enter="submitComment"
        ></textarea>
        
        <div class="input-actions">
          <div class="input-tools">
            <button class="tool-btn" @click="insertEmoji" title="表情">
              <IconLib name="smile" :size="18" />
            </button>
            <button v-if="allowAttachment" class="tool-btn" @click="triggerUpload" title="附件">
              <IconLib name="paperclip" :size="18" />
            </button>
            <input 
              ref="fileInputRef"
              type="file" 
              hidden 
              @change="handleFileSelect"
              :accept="acceptTypes"
            />
          </div>
          
          <div class="submit-actions">
            <button 
              v-if="replyingTo" 
              class="btn btn-text"
              @click="cancelReply"
            >
              取消回复
            </button>
            <button 
              class="btn btn-primary"
              :disabled="!newComment.trim() || submitting"
              @click="submitComment"
            >
              <span v-if="submitting" class="spinner"></span>
              {{ replyingTo ? '回复' : '发表评论' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 评论列表 -->
    <div class="comment-list">
      <template v-if="sortedComments.length > 0">
        <div 
          v-for="comment in sortedComments" 
          :key="comment.id"
          class="comment-item"
        >
          <CommentCard 
            :comment="comment"
            :current-user="currentUser"
            :readonly="readonly"
            :allow-replies="allowReplies"
            @reply="handleReply"
            @like="handleLike"
            @delete="handleDelete"
            @edit="handleEdit"
          />
          
          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
            <div 
              v-for="reply in comment.replies" 
              :key="reply.id"
              class="reply-item"
            >
              <CommentCard 
                :comment="reply"
                :current-user="currentUser"
                :readonly="readonly"
                :is-reply="true"
                @reply="handleReply($event, comment)"
                @like="handleLike"
                @delete="handleDelete"
                @edit="handleEdit"
              />
            </div>
            
            <!-- 加载更多回复 -->
            <button 
              v-if="comment.replyCount && comment.replyCount > comment.replies.length"
              class="load-more-replies"
              @click="loadMoreReplies(comment)"
            >
              查看更多 {{ comment.replyCount - comment.replies.length }} 条回复
            </button>
          </div>
        </div>
        
        <!-- 加载更多评论 -->
        <div v-if="hasMore" class="load-more">
          <button 
            class="btn btn-secondary"
            :disabled="loading"
            @click="loadMore"
          >
            <span v-if="loading" class="spinner"></span>
            加载更多评论
          </button>
        </div>
      </template>
      
      <!-- 空状态 -->
      <div v-else class="empty-state">
        <IconLib name="message-circle" :size="48" />
        <p>暂无评论</p>
        <p class="hint">成为第一个评论的人吧！</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'
import CommentCard from './CommentCard.vue'

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
  replies?: Comment[]
  replyCount?: number
  parentId?: string
  replyTo?: User
}

// Props
interface Props {
  comments: Comment[]
  currentUser?: User
  title?: string
  placeholder?: string
  readonly?: boolean
  allowReplies?: boolean
  allowAttachment?: boolean
  acceptTypes?: string
  hasMore?: boolean
  loading?: boolean
  totalComments?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '评论',
  placeholder: '写下你的评论...',
  readonly: false,
  allowReplies: true,
  allowAttachment: false,
  acceptTypes: 'image/*',
  hasMore: false,
  loading: false,
  totalComments: 0
})

// Emits
const emit = defineEmits<{
  submit: [content: string, parentId?: string, replyTo?: User]
  like: [comment: Comment]
  delete: [comment: Comment]
  edit: [comment: Comment, newContent: string]
  loadMore: []
  loadMoreReplies: [comment: Comment]
  uploadFile: [file: File]
}>()

// Refs
const fileInputRef = ref<HTMLInputElement | null>(null)

// State
const newComment = ref('')
const sortBy = ref<'newest' | 'oldest' | 'likes'>('newest')
const replyingTo = ref<Comment | null>(null)
const parentComment = ref<Comment | null>(null)
const submitting = ref(false)

// Computed
const sortedComments = computed(() => {
  const comments = [...props.comments]
  
  switch (sortBy.value) {
    case 'newest':
      return comments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    case 'oldest':
      return comments.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case 'likes':
      return comments.sort((a, b) => b.likes - a.likes)
    default:
      return comments
  }
})

// Methods
function handleReply(comment: Comment, parent?: Comment) {
  replyingTo.value = comment
  parentComment.value = parent || comment
  // 聚焦输入框
  const textarea = document.querySelector('.comment-input-box textarea') as HTMLTextAreaElement
  textarea?.focus()
}

function cancelReply() {
  replyingTo.value = null
  parentComment.value = null
}

async function submitComment() {
  if (!newComment.value.trim() || submitting.value) return
  
  submitting.value = true
  
  try {
    emit(
      'submit', 
      newComment.value.trim(),
      parentComment.value?.id,
      replyingTo.value?.user
    )
    
    newComment.value = ''
    cancelReply()
  } finally {
    submitting.value = false
  }
}

function handleLike(comment: Comment) {
  emit('like', comment)
}

function handleDelete(comment: Comment) {
  emit('delete', comment)
}

function handleEdit(comment: Comment, newContent: string) {
  emit('edit', comment, newContent)
}

function loadMore() {
  emit('loadMore')
}

function loadMoreReplies(comment: Comment) {
  emit('loadMoreReplies', comment)
}

function insertEmoji() {
  // TODO: 实现表情选择器
  newComment.value += '😊'
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('uploadFile', file)
  }
  input.value = ''
}
</script>

<style scoped>
.comment-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.comment-count {
  font-weight: 400;
  color: #999;
}

.sort-select {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
}

/* 评论输入框 */
.comment-input-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.input-avatar {
  flex-shrink: 0;
}

.input-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color, #4B6EF5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.input-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-content textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  background: white;
  transition: border-color 0.2s;
}

.input-content textarea:focus {
  outline: none;
  border-color: var(--primary-color, #4B6EF5);
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.input-tools {
  display: flex;
  gap: 4px;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.submit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-text {
  background: transparent;
  color: #666;
  padding: 8px 12px;
}

.btn-text:hover:not(:disabled) {
  color: #333;
}

.btn-primary {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e8e8e8;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.replies-list {
  margin-left: 52px;
  padding-left: 16px;
  border-left: 2px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.load-more-replies {
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--primary-color, #4B6EF5);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.load-more-replies:hover {
  text-decoration: underline;
}

.load-more {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  color: #999;
}

.empty-state p {
  margin: 8px 0 0;
}

.empty-state .hint {
  font-size: 13px;
  color: #bbb;
}
</style>
