<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="command-overlay" @click.self="close">
        <div class="command-dialog" ref="dialogRef">
          <!-- 搜索输入框 -->
          <div class="command-input-wrapper">
            <IconLib name="search" :size="20" class="search-icon" />
            <input 
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="搜索命令、页面或操作..."
              class="command-input"
              @keydown="handleKeyDown"
            />
            <kbd class="shortcut-hint">ESC 关闭</kbd>
          </div>

          <!-- 快捷操作 -->
          <div class="quick-actions" v-if="!query">
            <button 
              v-for="action in quickActions"
              :key="action.id"
              class="quick-action"
              @click="executeAction(action)"
            >
              <IconLib :name="action.icon" :size="16" />
              {{ action.label }}
            </button>
          </div>

          <!-- 搜索结果 -->
          <div class="command-results" v-if="filteredResults.length > 0">
            <div 
              v-for="(group, groupName) in groupedResults"
              :key="groupName"
              class="result-group"
            >
              <div class="group-label">{{ groupName }}</div>
              <div 
                v-for="(item, index) in group"
                :key="item.id"
                class="result-item"
                :class="{ active: activeIndex === getGlobalIndex(groupName, index) }"
                @click="selectItem(item)"
                @mouseenter="activeIndex = getGlobalIndex(groupName, index)"
              >
                <div class="item-icon" :style="{ backgroundColor: item.color + '15' }">
                  <IconLib :name="item.icon" :size="16" :style="{ color: item.color }" />
                </div>
                <div class="item-content">
                  <div class="item-title" v-html="highlightMatch(item.title)"></div>
                  <div class="item-description" v-if="item.description">
                    {{ item.description }}
                  </div>
                </div>
                <div class="item-meta" v-if="item.shortcut">
                  <kbd v-for="key in item.shortcut.split('+')" :key="key">{{ key }}</kbd>
                </div>
                <IconLib name="corner-down-left" :size="14" class="item-enter" />
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div class="empty-state" v-else-if="query">
            <IconLib name="search" :size="32" />
            <p>未找到匹配的结果</p>
            <span>尝试其他关键词或浏览全部命令</span>
          </div>

          <!-- 最近使用 -->
          <div class="recent-section" v-if="!query && recentItems.length > 0">
            <div class="section-header">
              <span>最近使用</span>
              <button class="clear-btn" @click="clearRecent">清除</button>
            </div>
            <div 
              v-for="item in recentItems"
              :key="item.id"
              class="result-item"
              @click="selectItem(item)"
            >
              <div class="item-icon" :style="{ backgroundColor: item.color + '15' }">
                <IconLib :name="item.icon" :size="16" :style="{ color: item.color }" />
              </div>
              <div class="item-content">
                <div class="item-title">{{ item.title }}</div>
              </div>
              <IconLib name="clock" :size="14" class="recent-icon" />
            </div>
          </div>

          <!-- 底部提示 -->
          <div class="command-footer">
            <div class="footer-hint">
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <span>选择</span>
            </div>
            <div class="footer-hint">
              <kbd>↵</kbd>
              <span>确认</span>
            </div>
            <div class="footer-hint">
              <kbd>Tab</kbd>
              <span>自动补全</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: string
  color?: string
  shortcut?: string
  category: string
  action: () => void
}

const props = withDefaults(defineProps<{
  modelValue?: boolean
  commands?: CommandItem[]
}>(), {
  modelValue: false,
  commands: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select': [item: CommandItem]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const inputRef = ref<HTMLInputElement>()
const dialogRef = ref<HTMLElement>()
const query = ref('')
const activeIndex = ref(0)
const recentItems = ref<CommandItem[]>([])

// 默认命令列表
const defaultCommands: CommandItem[] = [
  // 页面导航
  { id: 'nav-home', title: '首页', description: '返回仪表板首页', icon: 'home', color: '#4B6EF5', category: '页面', action: () => console.log('Go home'), shortcut: 'Cmd+H' },
  { id: 'nav-generator', title: '生成器', description: '打开证件生成器', icon: 'credit-card', color: '#6C5CE7', category: '页面', action: () => console.log('Go generator') },
  { id: 'nav-templates', title: '模板库', description: '浏览和管理模板', icon: 'layout', color: '#10b981', category: '页面', action: () => console.log('Go templates') },
  { id: 'nav-settings', title: '设置', description: '系统设置和偏好', icon: 'settings', color: '#f59e0b', category: '页面', action: () => console.log('Go settings'), shortcut: 'Cmd+,' },
  
  // 操作
  { id: 'action-new', title: '新建文档', description: '创建新的证件文档', icon: 'plus', color: '#4B6EF5', category: '操作', action: () => console.log('New doc'), shortcut: 'Cmd+N' },
  { id: 'action-export', title: '导出', description: '导出当前文档', icon: 'download', color: '#10b981', category: '操作', action: () => console.log('Export'), shortcut: 'Cmd+E' },
  { id: 'action-save', title: '保存', description: '保存当前更改', icon: 'save', color: '#3b82f6', category: '操作', action: () => console.log('Save'), shortcut: 'Cmd+S' },
  { id: 'action-print', title: '打印', description: '打印当前文档', icon: 'printer', color: '#8b5cf6', category: '操作', action: () => console.log('Print'), shortcut: 'Cmd+P' },
  { id: 'action-share', title: '分享', description: '分享当前文档', icon: 'share-2', color: '#ec4899', category: '操作', action: () => console.log('Share') },
  
  // 编辑
  { id: 'edit-undo', title: '撤销', description: '撤销上一步操作', icon: 'rotate-ccw', color: '#6b7280', category: '编辑', action: () => console.log('Undo'), shortcut: 'Cmd+Z' },
  { id: 'edit-redo', title: '重做', description: '重做上一步操作', icon: 'rotate-cw', color: '#6b7280', category: '编辑', action: () => console.log('Redo'), shortcut: 'Cmd+Shift+Z' },
  { id: 'edit-copy', title: '复制', description: '复制选中内容', icon: 'copy', color: '#6b7280', category: '编辑', action: () => console.log('Copy'), shortcut: 'Cmd+C' },
  { id: 'edit-paste', title: '粘贴', description: '粘贴内容', icon: 'clipboard', color: '#6b7280', category: '编辑', action: () => console.log('Paste'), shortcut: 'Cmd+V' },
  
  // 视图
  { id: 'view-zoom-in', title: '放大', description: '放大视图', icon: 'zoom-in', color: '#4B6EF5', category: '视图', action: () => console.log('Zoom in'), shortcut: 'Cmd+=' },
  { id: 'view-zoom-out', title: '缩小', description: '缩小视图', icon: 'zoom-out', color: '#4B6EF5', category: '视图', action: () => console.log('Zoom out'), shortcut: 'Cmd+-' },
  { id: 'view-fullscreen', title: '全屏', description: '切换全屏模式', icon: 'maximize', color: '#4B6EF5', category: '视图', action: () => console.log('Fullscreen'), shortcut: 'F11' },
  { id: 'view-dark', title: '深色模式', description: '切换深色主题', icon: 'moon', color: '#6C5CE7', category: '视图', action: () => console.log('Dark mode') },
  
  // 帮助
  { id: 'help-docs', title: '帮助文档', description: '查看使用指南', icon: 'book', color: '#10b981', category: '帮助', action: () => console.log('Docs'), shortcut: 'F1' },
  { id: 'help-shortcuts', title: '快捷键', description: '查看所有快捷键', icon: 'command', color: '#f59e0b', category: '帮助', action: () => console.log('Shortcuts'), shortcut: '?' },
  { id: 'help-feedback', title: '反馈', description: '提交反馈或建议', icon: 'message-circle', color: '#ec4899', category: '帮助', action: () => console.log('Feedback') },
]

// 合并命令
const allCommands = computed(() => {
  return [...defaultCommands, ...props.commands]
})

// 过滤结果
const filteredResults = computed(() => {
  if (!query.value) return []
  
  const q = query.value.toLowerCase()
  return allCommands.value.filter(item => {
    return item.title.toLowerCase().includes(q) ||
           item.description?.toLowerCase().includes(q) ||
           item.category.toLowerCase().includes(q)
  })
})

// 分组结果
const groupedResults = computed(() => {
  const groups: Record<string, CommandItem[]> = {}
  filteredResults.value.forEach(item => {
    if (!groups[item.category]) {
      groups[item.category] = []
    }
    groups[item.category].push(item)
  })
  return groups
})

// 快捷操作
const quickActions = [
  { id: 'q-new', label: '新建', icon: 'plus', action: () => console.log('New') },
  { id: 'q-open', label: '打开', icon: 'folder', action: () => console.log('Open') },
  { id: 'q-recent', label: '最近', icon: 'clock', action: () => console.log('Recent') },
  { id: 'q-templates', label: '模板', icon: 'layout', action: () => console.log('Templates') },
]

// 获取全局索引
const getGlobalIndex = (groupName: string, localIndex: number): number => {
  let index = 0
  for (const [name, items] of Object.entries(groupedResults.value)) {
    if (name === groupName) {
      return index + localIndex
    }
    index += items.length
  }
  return index
}

// 高亮匹配文字
const highlightMatch = (text: string): string => {
  if (!query.value) return text
  const regex = new RegExp(`(${query.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 选择项目
const selectItem = (item: CommandItem) => {
  // 添加到最近使用
  const index = recentItems.value.findIndex(r => r.id === item.id)
  if (index > -1) {
    recentItems.value.splice(index, 1)
  }
  recentItems.value.unshift(item)
  if (recentItems.value.length > 5) {
    recentItems.value.pop()
  }
  
  // 执行操作
  item.action()
  emit('select', item)
  close()
}

// 执行快捷操作
const executeAction = (action: { action: () => void }) => {
  action.action()
  close()
}

// 清除最近使用
const clearRecent = () => {
  recentItems.value = []
}

// 关闭
const close = () => {
  visible.value = false
  query.value = ''
  activeIndex.value = 0
}

// 键盘导航
const handleKeyDown = (e: KeyboardEvent) => {
  const total = filteredResults.value.length
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % (total || 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + (total || 1)) % (total || 1)
      break
    case 'Enter':
      e.preventDefault()
      if (filteredResults.value[activeIndex.value]) {
        selectItem(filteredResults.value[activeIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      close()
      break
    case 'Tab':
      e.preventDefault()
      if (filteredResults.value[activeIndex.value]) {
        query.value = filteredResults.value[activeIndex.value].title
      }
      break
  }
}

// 全局快捷键
const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    visible.value = !visible.value
  }
}

// 监听可见性变化
watch(visible, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>

<style scoped>
.command-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  padding-top: 15vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
}

.command-dialog {
  width: 100%;
  max-width: 580px;
  max-height: 65vh;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 搜索输入框 */
.command-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.search-icon {
  color: var(--text-color-secondary, #666);
  flex-shrink: 0;
}

.command-input {
  flex: 1;
  padding: 0;
  font-size: 1rem;
  border: none;
  outline: none;
  background: transparent;
}

.command-input::placeholder {
  color: var(--text-color-secondary, #666);
}

.shortcut-hint {
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  font-family: inherit;
  background: var(--bg-color-secondary, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
  color: var(--text-color-secondary, #666);
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action:hover {
  background: var(--primary-color-light, #eff1ff);
  color: var(--primary-color, #4B6EF5);
}

/* 搜索结果 */
.command-results {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.result-group {
  margin-bottom: 0.5rem;
}

.group-label {
  padding: 0.5rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color-secondary, #666);
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.result-item:hover,
.result-item.active {
  background: var(--bg-color-secondary, #f3f4f6);
}

.result-item.active {
  background: var(--primary-color-light, #eff1ff);
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.item-title :deep(mark) {
  background: rgba(75, 110, 245, 0.2);
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}

.item-description {
  font-size: 0.75rem;
  color: var(--text-color-secondary, #666);
  margin-top: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  gap: 0.25rem;
}

.item-meta kbd {
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  font-family: inherit;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
  color: var(--text-color-secondary, #666);
}

.item-enter {
  opacity: 0;
  color: var(--text-color-secondary, #666);
  transition: opacity 0.15s ease;
}

.result-item.active .item-enter {
  opacity: 1;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-color-secondary, #666);
}

.empty-state p {
  margin: 0.75rem 0 0.25rem;
  font-weight: 500;
  color: var(--text-color, #333);
}

.empty-state span {
  font-size: 0.8125rem;
}

/* 最近使用 */
.recent-section {
  padding: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
}

.section-header span {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color-secondary, #666);
}

.clear-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
}

.clear-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

.recent-icon {
  color: var(--text-color-secondary, #666);
}

/* 底部 */
.command-footer {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-color-secondary, #f9fafb);
}

.footer-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  color: var(--text-color-secondary, #666);
}

.footer-hint kbd {
  padding: 0.125rem 0.375rem;
  font-family: inherit;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
  box-shadow: 0 1px 0 var(--border-color, #e5e7eb);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-active .command-dialog,
.fade-leave-active .command-dialog {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .command-dialog,
.fade-leave-to .command-dialog {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}
</style>
