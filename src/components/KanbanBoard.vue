<template>
  <div class="kanban-board">
    <!-- 看板头部 -->
    <div class="board-header" v-if="showHeader">
      <div class="header-left">
        <h2 class="board-title" v-if="title">{{ title }}</h2>
        <span class="task-count">{{ totalTasks }} 个任务</span>
      </div>
      <div class="header-right">
        <slot name="header-actions">
          <div class="view-toggle">
            <button 
              class="toggle-btn"
              :class="{ active: viewMode === 'board' }"
              @click="viewMode = 'board'"
            >
              <IconLib name="columns" :size="16" />
            </button>
            <button 
              class="toggle-btn"
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
            >
              <IconLib name="list" :size="16" />
            </button>
          </div>
          <button class="add-column-btn" @click="showAddColumn = true">
            <IconLib name="plus" :size="16" />
            添加列表
          </button>
        </slot>
      </div>
    </div>

    <!-- 看板内容 - 面板视图 -->
    <div class="board-columns" v-if="viewMode === 'board'" ref="columnsRef">
      <div 
        v-for="column in columns"
        :key="column.id"
        class="kanban-column"
        :class="{ 'drag-over': dragOverColumn === column.id }"
        @dragover.prevent="handleColumnDragOver($event, column)"
        @dragleave="dragOverColumn = null"
        @drop="handleColumnDrop($event, column)"
      >
        <!-- 列头 -->
        <div class="column-header" :style="{ borderTopColor: column.color }">
          <div class="column-info">
            <span class="column-title">{{ column.title }}</span>
            <span class="column-count">{{ column.cards.length }}</span>
          </div>
          <div class="column-actions">
            <button class="action-btn" @click="handleAddCard(column)">
              <IconLib name="plus" :size="16" />
            </button>
            <button class="action-btn" @click="showColumnMenu(column)">
              <IconLib name="more-horizontal" :size="16" />
            </button>
          </div>
        </div>

        <!-- 卡片列表 -->
        <div class="column-cards">
          <TransitionGroup name="card-list" tag="div" class="cards-container">
            <div 
              v-for="card in column.cards"
              :key="card.id"
              class="kanban-card"
              :class="{ dragging: draggedCard?.id === card.id }"
              draggable="true"
              @dragstart="handleCardDragStart($event, card, column)"
              @dragend="handleCardDragEnd"
              @click="$emit('card-click', card)"
            >
              <!-- 卡片标签 -->
              <div class="card-labels" v-if="card.labels && card.labels.length">
                <span 
                  v-for="label in card.labels"
                  :key="label.id"
                  class="card-label"
                  :style="{ backgroundColor: label.color }"
                  :title="label.name"
                ></span>
              </div>

              <!-- 卡片标题 -->
              <h4 class="card-title">{{ card.title }}</h4>

              <!-- 卡片描述 -->
              <p class="card-description" v-if="card.description">
                {{ truncateText(card.description, 80) }}
              </p>

              <!-- 卡片封面 -->
              <div class="card-cover" v-if="card.cover">
                <img :src="card.cover" :alt="card.title" />
              </div>

              <!-- 卡片元数据 -->
              <div class="card-meta" v-if="hasCardMeta(card)">
                <div class="meta-item" v-if="card.dueDate">
                  <IconLib name="calendar" :size="12" />
                  <span :class="{ overdue: isOverdue(card.dueDate) }">
                    {{ formatDate(card.dueDate) }}
                  </span>
                </div>
                <div class="meta-item" v-if="card.comments">
                  <IconLib name="message-circle" :size="12" />
                  <span>{{ card.comments }}</span>
                </div>
                <div class="meta-item" v-if="card.attachments">
                  <IconLib name="paperclip" :size="12" />
                  <span>{{ card.attachments }}</span>
                </div>
                <div class="meta-item" v-if="card.checklist">
                  <IconLib name="check-square" :size="12" />
                  <span>{{ card.checklist.done }}/{{ card.checklist.total }}</span>
                </div>
              </div>

              <!-- 卡片成员 -->
              <div class="card-members" v-if="card.members && card.members.length">
                <div 
                  v-for="member in card.members.slice(0, 3)"
                  :key="member.id"
                  class="member-avatar"
                  :title="member.name"
                >
                  <img v-if="member.avatar" :src="member.avatar" :alt="member.name" />
                  <span v-else>{{ member.name.charAt(0) }}</span>
                </div>
                <div class="member-more" v-if="card.members.length > 3">
                  +{{ card.members.length - 3 }}
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- 添加卡片按钮 -->
        <button class="add-card-btn" @click="handleAddCard(column)">
          <IconLib name="plus" :size="14" />
          添加卡片
        </button>
      </div>

      <!-- 添加列表按钮 -->
      <div class="add-column" v-if="!showAddColumn">
        <button class="add-column-trigger" @click="showAddColumn = true">
          <IconLib name="plus" :size="16" />
          添加列表
        </button>
      </div>

      <!-- 添加列表输入框 -->
      <div class="add-column-form" v-else>
        <input 
          v-model="newColumnTitle"
          type="text"
          placeholder="输入列表标题..."
          ref="newColumnInput"
          @keyup.enter="addColumn"
          @keyup.escape="cancelAddColumn"
        />
        <div class="form-actions">
          <button class="save-btn" @click="addColumn">添加</button>
          <button class="cancel-btn" @click="cancelAddColumn">
            <IconLib name="x" :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div class="board-list" v-else>
      <div 
        v-for="column in columns"
        :key="column.id"
        class="list-group"
      >
        <div class="list-header" :style="{ borderLeftColor: column.color }">
          <span class="list-title">{{ column.title }}</span>
          <span class="list-count">{{ column.cards.length }}</span>
        </div>
        <div class="list-items">
          <div 
            v-for="card in column.cards"
            :key="card.id"
            class="list-item"
            @click="$emit('card-click', card)"
          >
            <div class="item-main">
              <div class="item-labels" v-if="card.labels && card.labels.length">
                <span 
                  v-for="label in card.labels"
                  :key="label.id"
                  class="item-label"
                  :style="{ backgroundColor: label.color }"
                >
                  {{ label.name }}
                </span>
              </div>
              <h4 class="item-title">{{ card.title }}</h4>
            </div>
            <div class="item-meta">
              <span class="meta-date" v-if="card.dueDate" :class="{ overdue: isOverdue(card.dueDate) }">
                {{ formatDate(card.dueDate) }}
              </span>
              <div class="item-members" v-if="card.members && card.members.length">
                <div 
                  v-for="member in card.members.slice(0, 2)"
                  :key="member.id"
                  class="member-avatar small"
                >
                  <img v-if="member.avatar" :src="member.avatar" :alt="member.name" />
                  <span v-else>{{ member.name.charAt(0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Label {
  id: string
  name: string
  color: string
}

interface Member {
  id: string
  name: string
  avatar?: string
}

interface Card {
  id: string
  title: string
  description?: string
  cover?: string
  labels?: Label[]
  members?: Member[]
  dueDate?: Date | string
  comments?: number
  attachments?: number
  checklist?: {
    done: number
    total: number
  }
}

interface Column {
  id: string
  title: string
  color?: string
  cards: Card[]
}

const props = withDefaults(defineProps<{
  columns?: Column[]
  title?: string
  showHeader?: boolean
}>(), {
  columns: () => [],
  showHeader: true
})

const emit = defineEmits<{
  'card-click': [card: Card]
  'card-move': [payload: { cardId: string; fromColumn: string; toColumn: string; newIndex: number }]
  'add-card': [column: Column]
  'add-column': [title: string]
  'update:columns': [columns: Column[]]
}>()

const columnsRef = ref<HTMLElement>()
const newColumnInput = ref<HTMLInputElement>()
const viewMode = ref<'board' | 'list'>('board')
const showAddColumn = ref(false)
const newColumnTitle = ref('')
const draggedCard = ref<Card | null>(null)
const draggedFromColumn = ref<Column | null>(null)
const dragOverColumn = ref<string | null>(null)

// 计算总任务数
const totalTasks = computed(() => {
  return props.columns.reduce((sum, col) => sum + col.cards.length, 0)
})

// 截断文本
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 格式化日期
const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 判断是否过期
const isOverdue = (date: Date | string): boolean => {
  return new Date(date) < new Date()
}

// 判断卡片是否有元数据
const hasCardMeta = (card: Card): boolean => {
  return !!(card.dueDate || card.comments || card.attachments || card.checklist)
}

// 开始拖拽卡片
const handleCardDragStart = (e: DragEvent, card: Card, column: Column) => {
  draggedCard.value = card
  draggedFromColumn.value = column
  
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', card.id)
  }
}

// 结束拖拽
const handleCardDragEnd = () => {
  draggedCard.value = null
  draggedFromColumn.value = null
  dragOverColumn.value = null
}

// 列拖放悬停
const handleColumnDragOver = (e: DragEvent, column: Column) => {
  e.preventDefault()
  dragOverColumn.value = column.id
}

// 放置到列
const handleColumnDrop = (e: DragEvent, column: Column) => {
  e.preventDefault()
  
  if (!draggedCard.value || !draggedFromColumn.value) return
  if (draggedFromColumn.value.id === column.id) return
  
  emit('card-move', {
    cardId: draggedCard.value.id,
    fromColumn: draggedFromColumn.value.id,
    toColumn: column.id,
    newIndex: column.cards.length
  })
  
  dragOverColumn.value = null
}

// 添加卡片
const handleAddCard = (column: Column) => {
  emit('add-card', column)
}

// 添加列表
const addColumn = () => {
  if (!newColumnTitle.value.trim()) return
  
  emit('add-column', newColumnTitle.value)
  newColumnTitle.value = ''
  showAddColumn.value = false
}

// 取消添加列表
const cancelAddColumn = () => {
  showAddColumn.value = false
  newColumnTitle.value = ''
}

// 显示列菜单
const showColumnMenu = (column: Column) => {
  // 实现列菜单逻辑
  console.log('Show column menu:', column)
}

// 监听显示添加列表
watch(showAddColumn, async (val) => {
  if (val) {
    await nextTick()
    newColumnInput.value?.focus()
  }
})
</script>

<style scoped>
.kanban-board {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 12px;
  overflow: hidden;
}

/* 头部 */
.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.board-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.task-count {
  font-size: 0.875rem;
  color: var(--text-color-secondary, #666);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.view-toggle {
  display: flex;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 6px;
  padding: 0.25rem;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
}

.toggle-btn.active {
  background: #fff;
  color: var(--primary-color, #4B6EF5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-column-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  background: var(--primary-color, #4B6EF5);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.add-column-btn:hover {
  background: var(--primary-color-dark, #3b5bd5);
}

/* 看板列 */
.board-columns {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
  overflow-x: auto;
}

.kanban-column {
  flex-shrink: 0;
  width: 280px;
  max-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.kanban-column.drag-over {
  background: var(--primary-color-light, #eff1ff);
}

/* 列头 */
.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  border-top: 3px solid var(--primary-color, #4B6EF5);
  border-radius: 10px 10px 0 0;
}

.column-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.column-title {
  font-weight: 600;
  font-size: 0.9375rem;
}

.column-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 10px;
  color: var(--text-color-secondary, #666);
}

.column-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.kanban-column:hover .column-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
}

.action-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

/* 卡片列表 */
.column-cards {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 卡片 */
.kanban-card {
  padding: 0.75rem;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.kanban-card:hover {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.kanban-card.dragging {
  opacity: 0.5;
}

.card-labels {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.card-label {
  width: 28px;
  height: 8px;
  border-radius: 4px;
}

.card-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

.card-description {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
  line-height: 1.5;
}

.card-cover {
  margin: 0.5rem -0.75rem;
  border-radius: 0;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--text-color-secondary, #666);
}

.meta-item .overdue {
  color: #ef4444;
}

.card-members {
  display: flex;
  margin-top: 0.75rem;
  margin-left: auto;
}

.member-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: -6px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: var(--primary-color, #4B6EF5);
  overflow: hidden;
  font-size: 0.625rem;
  font-weight: 600;
  color: #fff;
}

.member-avatar:first-child {
  margin-left: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: -6px;
  border-radius: 50%;
  background: var(--bg-color-secondary, #f3f4f6);
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--text-color-secondary, #666);
}

/* 添加卡片按钮 */
.add-card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.625rem;
  margin-top: auto;
  font-size: 0.8125rem;
  background: transparent;
  border: none;
  border-top: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-card-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
  color: var(--primary-color, #4B6EF5);
}

/* 添加列表 */
.add-column {
  flex-shrink: 0;
  width: 280px;
}

.add-column-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.6);
  border: 2px dashed var(--border-color, #e5e7eb);
  border-radius: 10px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-column-trigger:hover {
  background: #fff;
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.add-column-form {
  flex-shrink: 0;
  width: 280px;
  padding: 0.75rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.add-column-form input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  outline: none;
}

.add-column-form input:focus {
  border-color: var(--primary-color, #4B6EF5);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.save-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  background: var(--primary-color, #4B6EF5);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  background: transparent;
  border: none;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
}

/* 列表视图 */
.board-list {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.list-group {
  margin-bottom: 1.5rem;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border-left: 3px solid var(--primary-color, #4B6EF5);
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.list-title {
  font-weight: 600;
}

.list-count {
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 10px;
  color: var(--text-color-secondary, #666);
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-item:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-labels {
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}

.item-label {
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  color: #fff;
  border-radius: 3px;
}

.item-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.meta-date {
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
}

.meta-date.overdue {
  color: #ef4444;
}

.item-members {
  display: flex;
}

.member-avatar.small {
  width: 20px;
  height: 20px;
  font-size: 0.5rem;
}

/* 卡片列表动画 */
.card-list-move,
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.3s ease;
}

.card-list-enter-from,
.card-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.card-list-leave-active {
  position: absolute;
}
</style>
