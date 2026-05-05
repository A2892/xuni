<template>
  <div class="keyboard-shortcuts" :class="{ 'is-open': isOpen }">
    <!-- 触发按钮（可选） -->
    <slot name="trigger" :open="open">
      <button class="shortcut-trigger" @click="open" title="键盘快捷键 (?)">
        <IconLib name="zap" :size="18" />
      </button>
    </slot>

    <!-- 弹窗 -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="isOpen" class="modal-overlay" @click.self="close">
          <div class="shortcuts-modal">
            <div class="modal-header">
              <h2>
                <IconLib name="zap" :size="22" />
                键盘快捷键
              </h2>
              <button class="close-btn" @click="close">
                <IconLib name="x" :size="20" />
              </button>
            </div>

            <!-- 搜索 -->
            <div class="modal-search">
              <IconLib name="search" :size="18" class="search-icon" />
              <input 
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                placeholder="搜索快捷键..."
                class="search-input"
              />
            </div>

            <!-- 快捷键列表 -->
            <div class="modal-content">
              <div 
                v-for="group in filteredGroups"
                :key="group.name"
                class="shortcut-group"
              >
                <h3 class="group-title">{{ group.name }}</h3>
                <div class="shortcuts-list">
                  <div 
                    v-for="shortcut in group.shortcuts"
                    :key="shortcut.action"
                    class="shortcut-item"
                  >
                    <span class="shortcut-action">{{ shortcut.action }}</span>
                    <div class="shortcut-keys">
                      <template v-for="(key, index) in shortcut.keys" :key="index">
                        <kbd>{{ key }}</kbd>
                        <span v-if="index < shortcut.keys.length - 1" class="key-separator">+</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="filteredGroups.length === 0" class="empty-state">
                <IconLib name="search" :size="32" />
                <p>未找到匹配的快捷键</p>
              </div>
            </div>

            <!-- 底部提示 -->
            <div class="modal-footer">
              <span class="tip">
                <kbd>?</kbd> 打开此窗口
              </span>
              <span class="tip">
                <kbd>Esc</kbd> 关闭
              </span>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Shortcut {
  action: string
  keys: string[]
  handler?: () => void
}

interface ShortcutGroup {
  name: string
  shortcuts: Shortcut[]
}

const props = defineProps<{
  customShortcuts?: ShortcutGroup[]
}>()

const emit = defineEmits<{
  open: []
  close: []
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

// 默认快捷键组
const defaultShortcutGroups: ShortcutGroup[] = [
  {
    name: '通用',
    shortcuts: [
      { action: '打开快捷键帮助', keys: ['?'] },
      { action: '保存当前文档', keys: ['⌘', 'S'] },
      { action: '新建文档', keys: ['⌘', 'N'] },
      { action: '打开文档', keys: ['⌘', 'O'] },
      { action: '关闭当前标签', keys: ['⌘', 'W'] },
      { action: '全屏模式', keys: ['⌘', 'Enter'] }
    ]
  },
  {
    name: '编辑',
    shortcuts: [
      { action: '撤销', keys: ['⌘', 'Z'] },
      { action: '重做', keys: ['⌘', '⇧', 'Z'] },
      { action: '复制', keys: ['⌘', 'C'] },
      { action: '粘贴', keys: ['⌘', 'V'] },
      { action: '剪切', keys: ['⌘', 'X'] },
      { action: '全选', keys: ['⌘', 'A'] },
      { action: '查找', keys: ['⌘', 'F'] },
      { action: '替换', keys: ['⌘', 'H'] }
    ]
  },
  {
    name: '视图',
    shortcuts: [
      { action: '放大', keys: ['⌘', '+'] },
      { action: '缩小', keys: ['⌘', '-'] },
      { action: '重置缩放', keys: ['⌘', '0'] },
      { action: '切换侧边栏', keys: ['⌘', 'B'] },
      { action: '切换预览面板', keys: ['⌘', 'P'] },
      { action: '显示网格', keys: ['⌘', 'G'] }
    ]
  },
  {
    name: '导出',
    shortcuts: [
      { action: '导出为 PNG', keys: ['⌘', 'E'] },
      { action: '导出为 PDF', keys: ['⌘', '⇧', 'E'] },
      { action: '打印', keys: ['⌘', 'P'] },
      { action: '批量导出', keys: ['⌘', '⇧', 'B'] }
    ]
  },
  {
    name: '导航',
    shortcuts: [
      { action: '下一个文档', keys: ['⌘', '→'] },
      { action: '上一个文档', keys: ['⌘', '←'] },
      { action: '跳转到首页', keys: ['⌘', 'Home'] },
      { action: '打开设置', keys: ['⌘', ','] },
      { action: '打开帮助', keys: ['⌘', '?'] }
    ]
  }
]

// 合并自定义快捷键
const shortcutGroups = computed(() => {
  if (props.customShortcuts && props.customShortcuts.length > 0) {
    return props.customShortcuts
  }
  return defaultShortcutGroups
})

// 过滤快捷键
const filteredGroups = computed(() => {
  if (!searchQuery.value) return shortcutGroups.value
  
  const query = searchQuery.value.toLowerCase()
  return shortcutGroups.value
    .map(group => ({
      ...group,
      shortcuts: group.shortcuts.filter(s => 
        s.action.toLowerCase().includes(query) ||
        s.keys.some(k => k.toLowerCase().includes(query))
      )
    }))
    .filter(group => group.shortcuts.length > 0)
})

// 打开弹窗
const open = () => {
  isOpen.value = true
  emit('open')
  nextTick(() => {
    searchInput.value?.focus()
  })
}

// 关闭弹窗
const close = () => {
  isOpen.value = false
  searchQuery.value = ''
  emit('close')
}

// 键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  // 按 ? 打开
  if (e.key === '?' && !isOpen.value) {
    e.preventDefault()
    open()
    return
  }
  
  // 按 Esc 关闭
  if (e.key === 'Escape' && isOpen.value) {
    e.preventDefault()
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// 暴露方法
defineExpose({ open, close })
</script>

<style scoped>
.keyboard-shortcuts {
  display: inline-block;
}

.shortcut-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--bg-color-secondary, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.shortcut-trigger:hover {
  background: var(--primary-color-light, #eff1ff);
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

/* 弹窗遮罩 */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
}

/* 弹窗内容 */
.shortcuts-modal {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.modal-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

/* 搜索 */
.modal-search {
  position: relative;
  padding: 1rem 1.5rem;
  background: var(--bg-color-secondary, #f9fafb);
}

.search-icon {
  position: absolute;
  left: 2.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-muted, #9ca3af);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  font-size: 0.9375rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: #fff;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

/* 内容区 */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

/* 快捷键组 */
.shortcut-group {
  margin-bottom: 1.5rem;
}

.shortcut-group:last-child {
  margin-bottom: 0;
}

.group-title {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary, #666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.shortcuts-list {
  display: grid;
  gap: 0.25rem;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.shortcut-item:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

.shortcut-action {
  font-size: 0.9375rem;
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.shortcut-keys kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-weight: 500;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.key-separator {
  font-size: 0.75rem;
  color: var(--text-color-muted, #9ca3af);
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

/* 底部 */
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 1.5rem;
  background: var(--bg-color-secondary, #f9fafb);
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
}

.tip kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 3px;
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .shortcuts-modal,
.modal-fade-leave-active .shortcuts-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .shortcuts-modal,
.modal-fade-leave-to .shortcuts-modal {
  transform: scale(0.95);
  opacity: 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .shortcuts-modal {
    max-height: 90vh;
    margin: 1rem;
  }
  
  .modal-header,
  .modal-search,
  .modal-content {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .search-icon {
    left: 1.75rem;
  }
  
  .shortcut-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
