<template>
  <div class="search-box" :class="{ 'is-focused': isFocused, 'has-value': !!modelValue }">
    <div class="search-input-wrapper">
      <IconLib name="search" :size="18" class="search-icon" />
      <input
        ref="inputRef"
        :value="modelValue"
        type="text"
        class="search-input"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.enter="handleSearch"
        @keydown.esc="handleClear"
      />
      <button 
        v-if="modelValue && clearable" 
        type="button" 
        class="clear-btn"
        @click="handleClear"
      >
        <IconLib name="x" :size="16" />
      </button>
      <button 
        v-if="showButton" 
        type="button" 
        class="search-btn"
        :disabled="!modelValue"
        @click="handleSearch"
      >
        {{ buttonText }}
      </button>
    </div>
    
    <!-- 搜索建议 -->
    <transition name="dropdown">
      <div 
        v-if="showSuggestions && suggestions.length > 0" 
        class="suggestions-dropdown"
      >
        <div 
          v-for="(item, index) in suggestions" 
          :key="index"
          class="suggestion-item"
          :class="{ 'is-active': activeIndex === index }"
          @click="selectSuggestion(item)"
          @mouseenter="activeIndex = index"
        >
          <IconLib :name="item.icon || 'clock'" :size="16" class="suggestion-icon" />
          <span class="suggestion-text">{{ item.text }}</span>
          <span v-if="item.type" class="suggestion-type">{{ item.type }}</span>
        </div>
      </div>
    </transition>
    
    <!-- 搜索历史 -->
    <transition name="dropdown">
      <div 
        v-if="showHistory && history.length > 0 && isFocused && !modelValue" 
        class="history-dropdown"
      >
        <div class="history-header">
          <span>搜索历史</span>
          <button type="button" class="clear-history" @click="clearHistory">
            清空
          </button>
        </div>
        <div 
          v-for="(item, index) in history" 
          :key="index"
          class="history-item"
          @click="selectHistory(item)"
        >
          <IconLib name="clock" :size="14" />
          <span>{{ item }}</span>
          <button 
            type="button" 
            class="remove-history"
            @click.stop="removeHistory(index)"
          >
            <IconLib name="x" :size="14" />
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Suggestion {
  text: string
  icon?: string
  type?: string
  data?: any
}

interface Props {
  modelValue?: string
  placeholder?: string
  clearable?: boolean
  showButton?: boolean
  buttonText?: string
  suggestions?: Suggestion[]
  showHistory?: boolean
  maxHistory?: number
  debounce?: number
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索...',
  clearable: true,
  showButton: false,
  buttonText: '搜索',
  suggestions: () => [],
  showHistory: true,
  maxHistory: 10,
  debounce: 300,
  storageKey: 'search-history'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  clear: []
  select: [item: Suggestion]
}>()

// 状态
const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const activeIndex = ref(-1)
const showSuggestions = ref(false)
const history = ref<string[]>([])
let debounceTimer: number | null = null

// 加载搜索历史
const loadHistory = () => {
  try {
    const stored = localStorage.getItem(props.storageKey)
    if (stored) {
      history.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load search history:', e)
  }
}

// 保存搜索历史
const saveHistory = () => {
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(history.value))
  } catch (e) {
    console.error('Failed to save search history:', e)
  }
}

// 添加到历史
const addToHistory = (text: string) => {
  if (!text.trim()) return
  
  // 移除已存在的相同项
  const index = history.value.indexOf(text)
  if (index > -1) {
    history.value.splice(index, 1)
  }
  
  // 添加到开头
  history.value.unshift(text)
  
  // 限制数量
  if (history.value.length > props.maxHistory) {
    history.value = history.value.slice(0, props.maxHistory)
  }
  
  saveHistory()
}

// 处理输入
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value
  emit('update:modelValue', value)
  
  // 防抖
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = window.setTimeout(() => {
    showSuggestions.value = value.length > 0 && props.suggestions.length > 0
    activeIndex.value = -1
  }, props.debounce)
}

// 处理聚焦
const handleFocus = () => {
  isFocused.value = true
}

// 处理失焦
const handleBlur = () => {
  // 延迟关闭，以便可以点击下拉项
  setTimeout(() => {
    isFocused.value = false
    showSuggestions.value = false
  }, 200)
}

// 处理搜索
const handleSearch = () => {
  if (props.modelValue) {
    addToHistory(props.modelValue)
    emit('search', props.modelValue)
  }
}

// 处理清除
const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

// 选择建议
const selectSuggestion = (item: Suggestion) => {
  emit('update:modelValue', item.text)
  emit('select', item)
  addToHistory(item.text)
  showSuggestions.value = false
}

// 选择历史
const selectHistory = (text: string) => {
  emit('update:modelValue', text)
  emit('search', text)
}

// 移除历史项
const removeHistory = (index: number) => {
  history.value.splice(index, 1)
  saveHistory()
}

// 清空历史
const clearHistory = () => {
  history.value = []
  saveHistory()
}

// 聚焦方法
const focus = () => {
  inputRef.value?.focus()
}

// 初始化
loadHistory()

// 监听建议变化
watch(() => props.suggestions, (newVal) => {
  if (newVal.length > 0 && props.modelValue) {
    showSuggestions.value = true
  }
})

defineExpose({
  focus
})
</script>

<style scoped>
.search-box {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-input, #fff);
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.search-box.is-focused .search-input-wrapper {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  color: var(--text-tertiary, #999);
  pointer-events: none;
  transition: color 0.2s ease;
}

.search-box.is-focused .search-icon {
  color: var(--primary-color, #4B6EF5);
}

.search-input {
  flex: 1;
  padding: 0.75rem 0.875rem 0.75rem 2.75rem;
  font-size: 0.9375rem;
  color: var(--text-primary, #1a1a1a);
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-placeholder, #9ca3af);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  margin-right: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary, #999);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  color: var(--text-primary, #1a1a1a);
  background: var(--bg-hover, #f3f4f6);
}

.search-btn {
  padding: 0.625rem 1.25rem;
  margin: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, var(--primary-color, #4B6EF5), var(--secondary-color, #6C5CE7));
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 下拉菜单 */
.suggestions-dropdown,
.history-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item,
.history-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.suggestion-item:hover,
.suggestion-item.is-active,
.history-item:hover {
  background: var(--bg-hover, #f3f4f6);
}

.suggestion-icon {
  color: var(--text-tertiary, #999);
}

.suggestion-text {
  flex: 1;
  font-size: 0.9375rem;
  color: var(--text-primary, #1a1a1a);
}

.suggestion-type {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: var(--bg-tertiary, #e5e7eb);
  border-radius: 4px;
  color: var(--text-secondary, #666);
}

/* 历史记录 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  font-size: 0.8125rem;
  color: var(--text-secondary, #666);
}

.clear-history {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: var(--text-tertiary, #999);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-history:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.history-item {
  font-size: 0.875rem;
  color: var(--text-primary, #1a1a1a);
}

.history-item svg {
  color: var(--text-tertiary, #999);
}

.history-item span {
  flex: 1;
}

.remove-history {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary, #999);
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s ease;
}

.history-item:hover .remove-history {
  opacity: 1;
}

.remove-history:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 下拉动画 */
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
