<template>
  <div class="mentions" :class="{ 'mentions--focused': isFocused }">
    <div 
      ref="editorRef"
      class="mentions__editor"
      contenteditable
      @input="handleInput"
      @keydown="handleKeyDown"
      @focus="handleFocus"
      @blur="handleBlur"
      @click="handleClick"
    ></div>
    
    <div v-if="!hasContent" class="mentions__placeholder">
      {{ placeholder }}
    </div>
    
    <!-- 下拉建议 -->
    <Teleport to="body">
      <Transition name="mentions-dropdown">
        <div 
          v-if="showSuggestions && filteredOptions.length > 0"
          class="mentions__dropdown"
          ref="dropdownRef"
          :style="dropdownStyle"
        >
          <div
            v-for="(option, index) in filteredOptions"
            :key="option.value"
            class="mentions__option"
            :class="{ 'mentions__option--active': index === activeIndex }"
            @click="selectOption(option)"
            @mouseenter="activeIndex = index"
          >
            <img 
              v-if="option.avatar" 
              :src="option.avatar" 
              class="mentions__avatar"
            />
            <div class="mentions__option-info">
              <span class="mentions__option-label">{{ option.label }}</span>
              <span v-if="option.description" class="mentions__option-desc">
                {{ option.description }}
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface MentionOption {
  value: string
  label: string
  avatar?: string
  description?: string
}

interface Props {
  // 值
  modelValue?: string
  // 占位符
  placeholder?: string
  // 触发字符
  prefix?: string | string[]
  // 选项
  options?: MentionOption[]
  // 是否禁用
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '输入 @ 提及用户',
  prefix: '@',
  options: () => [],
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'select', option: MentionOption): void
  (e: 'search', query: string, prefix: string): void
}>()

const editorRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()

const isFocused = ref(false)
const hasContent = ref(false)
const showSuggestions = ref(false)
const searchQuery = ref('')
const activeIndex = ref(0)
const currentPrefix = ref('')
const dropdownStyle = ref({})

// 触发字符数组
const prefixes = computed(() => 
  Array.isArray(props.prefix) ? props.prefix : [props.prefix]
)

// 过滤选项
const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options.slice(0, 10)
  
  const query = searchQuery.value.toLowerCase()
  return props.options
    .filter(opt => 
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
    )
    .slice(0, 10)
})

// 输入处理
function handleInput(e: Event) {
  const target = e.target as HTMLElement
  const text = target.textContent || ''
  
  hasContent.value = text.length > 0
  emit('update:modelValue', text)
  emit('change', text)
  
  // 检测是否触发提及
  checkMention()
}

// 检测提及
function checkMention() {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return
  
  const range = selection.getRangeAt(0)
  const text = range.startContainer.textContent || ''
  const cursorPos = range.startOffset
  
  // 向前查找触发字符
  let foundPrefix = ''
  let startPos = -1
  
  for (let i = cursorPos - 1; i >= 0; i--) {
    const char = text[i]
    
    // 遇到空格或换行，停止
    if (char === ' ' || char === '\n') break
    
    // 检查是否是触发字符
    for (const prefix of prefixes.value) {
      if (text.substring(i, i + prefix.length) === prefix) {
        foundPrefix = prefix
        startPos = i
        break
      }
    }
    
    if (foundPrefix) break
  }
  
  if (foundPrefix && startPos >= 0) {
    const query = text.substring(startPos + foundPrefix.length, cursorPos)
    currentPrefix.value = foundPrefix
    searchQuery.value = query
    showSuggestions.value = true
    activeIndex.value = 0
    
    emit('search', query, foundPrefix)
    updateDropdownPosition()
  } else {
    showSuggestions.value = false
  }
}

// 更新下拉位置
function updateDropdownPosition() {
  nextTick(() => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return
    
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    
    dropdownStyle.value = {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.bottom + 4}px`,
      zIndex: 2000
    }
  })
}

// 键盘事件
function handleKeyDown(e: KeyboardEvent) {
  if (!showSuggestions.value) return
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % filteredOptions.value.length
      break
      
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
      break
      
    case 'Enter':
      e.preventDefault()
      if (filteredOptions.value[activeIndex.value]) {
        selectOption(filteredOptions.value[activeIndex.value])
      }
      break
      
    case 'Escape':
      showSuggestions.value = false
      break
  }
}

// 选择选项
function selectOption(option: MentionOption) {
  const editor = editorRef.value
  if (!editor) return
  
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return
  
  const range = selection.getRangeAt(0)
  const text = range.startContainer.textContent || ''
  const cursorPos = range.startOffset
  
  // 查找触发字符位置
  let startPos = -1
  for (let i = cursorPos - 1; i >= 0; i--) {
    if (text.substring(i, i + currentPrefix.value.length) === currentPrefix.value) {
      startPos = i
      break
    }
  }
  
  if (startPos >= 0) {
    // 删除触发字符和查询文本
    const before = text.substring(0, startPos)
    const after = text.substring(cursorPos)
    
    // 创建提及元素
    const mention = `${currentPrefix.value}${option.label}`
    range.startContainer.textContent = before + mention + ' ' + after
    
    // 移动光标
    range.setStart(range.startContainer, before.length + mention.length + 1)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  
  showSuggestions.value = false
  emit('select', option)
  
  // 更新值
  emit('update:modelValue', editor.textContent || '')
}

function handleFocus() {
  isFocused.value = true
}

function handleBlur() {
  isFocused.value = false
  // 延迟关闭，允许点击选项
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function handleClick() {
  checkMention()
}

// 初始化内容
watch(() => props.modelValue, (val) => {
  if (editorRef.value && editorRef.value.textContent !== val) {
    editorRef.value.textContent = val
    hasContent.value = val.length > 0
  }
}, { immediate: true })

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.textContent = props.modelValue
    hasContent.value = props.modelValue.length > 0
  }
})
</script>

<style scoped>
.mentions {
  position: relative;
  min-height: 80px;
  padding: 12px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 8px;
  background: var(--bg-color, #fff);
  transition: border-color 0.2s;
}

.mentions--focused {
  border-color: var(--primary-color, #4B6EF5);
}

.mentions__editor {
  min-height: 56px;
  outline: none;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color, #303133);
}

.mentions__editor:empty::before {
  content: '';
}

.mentions__placeholder {
  position: absolute;
  top: 12px;
  left: 12px;
  color: var(--text-placeholder, #c0c4cc);
  pointer-events: none;
}

/* 下拉框 */
.mentions__dropdown {
  min-width: 200px;
  max-height: 240px;
  overflow-y: auto;
  background: var(--bg-color, #fff);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
}

.mentions__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mentions__option:hover,
.mentions__option--active {
  background: var(--bg-hover, #f5f7fa);
}

.mentions__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.mentions__option-info {
  flex: 1;
  min-width: 0;
}

.mentions__option-label {
  display: block;
  font-size: 14px;
  color: var(--text-color, #303133);
}

.mentions__option-desc {
  display: block;
  font-size: 12px;
  color: var(--text-secondary, #909399);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 动画 */
.mentions-dropdown-enter-active,
.mentions-dropdown-leave-active {
  transition: all 0.2s ease;
}

.mentions-dropdown-enter-from,
.mentions-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
