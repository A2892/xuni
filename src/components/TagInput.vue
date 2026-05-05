<template>
  <div class="tag-input" :class="{ 'is-focused': isFocused, 'is-disabled': disabled }">
    <div class="tag-list">
      <TransitionGroup name="tag">
        <span 
          v-for="(tag, index) in modelValue"
          :key="tag"
          class="tag"
          :class="getTagClass(tag)"
          :style="getTagStyle(tag)"
        >
          <span class="tag-text">{{ tag }}</span>
          <button 
            v-if="!disabled && !readonly"
            class="tag-remove"
            @click="removeTag(index)"
          >
            <IconLib name="x" :size="12" />
          </button>
        </span>
      </TransitionGroup>
      
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        :disabled="disabled"
        :readonly="readonly"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
      />
    </div>
    
    <!-- 建议列表 -->
    <Transition name="dropdown">
      <div 
        v-if="showSuggestions && filteredSuggestions.length > 0"
        class="tag-suggestions"
      >
        <div
          v-for="(suggestion, index) in filteredSuggestions"
          :key="suggestion"
          class="suggestion-item"
          :class="{ 'is-active': index === activeIndex }"
          @click="selectSuggestion(suggestion)"
          @mouseenter="activeIndex = index"
        >
          {{ suggestion }}
        </div>
      </div>
    </Transition>
    
    <!-- 字数限制 -->
    <span v-if="maxTags" class="tag-count">
      {{ modelValue.length }} / {{ maxTags }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
type TagColor = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

// Props
interface Props {
  modelValue: string[]
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  maxTags?: number
  maxLength?: number
  allowDuplicates?: boolean
  addOnBlur?: boolean
  separators?: string[]
  suggestions?: string[]
  validateTag?: (tag: string) => boolean
  tagColor?: TagColor | ((tag: string) => TagColor)
  customColors?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '输入后按回车添加标签',
  disabled: false,
  readonly: false,
  allowDuplicates: false,
  addOnBlur: false,
  separators: () => [',', ';', '，', '；'],
  suggestions: () => [],
  tagColor: 'default'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [tags: string[]]
  'add': [tag: string]
  'remove': [tag: string, index: number]
  'invalid': [tag: string, reason: string]
}>()

// Refs
const inputRef = ref<HTMLInputElement | null>(null)

// State
const inputValue = ref('')
const isFocused = ref(false)
const showSuggestions = ref(false)
const activeIndex = ref(0)

// Computed
const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) return []
  
  const query = inputValue.value.toLowerCase()
  return props.suggestions
    .filter(s => 
      s.toLowerCase().includes(query) && 
      (props.allowDuplicates || !props.modelValue.includes(s))
    )
    .slice(0, 10)
})

// Methods
function addTag(tag: string) {
  const trimmed = tag.trim()
  
  if (!trimmed) return
  
  // 验证
  if (props.maxTags && props.modelValue.length >= props.maxTags) {
    emit('invalid', trimmed, '已达到最大标签数')
    return
  }
  
  if (props.maxLength && trimmed.length > props.maxLength) {
    emit('invalid', trimmed, '标签长度超出限制')
    return
  }
  
  if (!props.allowDuplicates && props.modelValue.includes(trimmed)) {
    emit('invalid', trimmed, '标签已存在')
    return
  }
  
  if (props.validateTag && !props.validateTag(trimmed)) {
    emit('invalid', trimmed, '标签验证失败')
    return
  }
  
  emit('update:modelValue', [...props.modelValue, trimmed])
  emit('add', trimmed)
  inputValue.value = ''
  activeIndex.value = 0
}

function removeTag(index: number) {
  const tag = props.modelValue[index]
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
  emit('remove', tag, index)
  
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    
    if (filteredSuggestions.value.length > 0 && showSuggestions.value) {
      selectSuggestion(filteredSuggestions.value[activeIndex.value])
    } else {
      addTag(inputValue.value)
    }
  } else if (e.key === 'Backspace' && !inputValue.value && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  } else if (e.key === 'ArrowDown' && showSuggestions.value) {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, filteredSuggestions.value.length - 1)
  } else if (e.key === 'ArrowUp' && showSuggestions.value) {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Escape') {
    showSuggestions.value = false
  }
}

function handleInput() {
  // 检查分隔符
  const value = inputValue.value
  for (const separator of props.separators) {
    if (value.includes(separator)) {
      const parts = value.split(separator)
      parts.forEach(part => {
        if (part.trim()) {
          addTag(part)
        }
      })
      inputValue.value = ''
      return
    }
  }
  
  showSuggestions.value = true
  activeIndex.value = 0
}

function handleFocus() {
  isFocused.value = true
  showSuggestions.value = true
}

function handleBlur() {
  isFocused.value = false
  
  setTimeout(() => {
    showSuggestions.value = false
    
    if (props.addOnBlur && inputValue.value.trim()) {
      addTag(inputValue.value)
    }
  }, 150)
}

function selectSuggestion(suggestion: string) {
  addTag(suggestion)
  showSuggestions.value = false
  inputRef.value?.focus()
}

function getTagClass(tag: string): string {
  if (typeof props.tagColor === 'function') {
    return `tag-${props.tagColor(tag)}`
  }
  return `tag-${props.tagColor}`
}

function getTagStyle(tag: string): Record<string, string> {
  if (props.customColors && props.customColors[tag]) {
    return {
      backgroundColor: props.customColors[tag],
      color: 'white'
    }
  }
  return {}
}

// Watch
watch(filteredSuggestions, () => {
  activeIndex.value = 0
})

// Expose
defineExpose({
  focus: () => inputRef.value?.focus(),
  clear: () => {
    inputValue.value = ''
    emit('update:modelValue', [])
  }
})
</script>

<style scoped>
.tag-input {
  position: relative;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 6px 8px;
  transition: all 0.2s;
}

.tag-input.is-focused {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.tag-input.is-disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1;
  background: #f0f0f0;
  color: #333;
  transition: all 0.2s;
}

.tag-text {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: inherit;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.tag-remove:hover {
  opacity: 1;
}

/* 标签颜色 */
.tag-primary {
  background: rgba(75, 110, 245, 0.1);
  color: var(--primary-color, #4B6EF5);
}

.tag-success {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.tag-warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.tag-danger {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.tag-info {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

/* 输入框 */
.tag-list input {
  flex: 1;
  min-width: 80px;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px 0;
  background: transparent;
}

.tag-list input::placeholder {
  color: #999;
}

.is-disabled input {
  cursor: not-allowed;
}

/* 建议列表 */
.tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.suggestion-item:hover,
.suggestion-item.is-active {
  background: #f5f5f5;
}

/* 计数 */
.tag-count {
  position: absolute;
  right: 8px;
  bottom: -20px;
  font-size: 12px;
  color: #999;
}

/* 动画 */
.tag-enter-active,
.tag-leave-active {
  transition: all 0.2s;
}

.tag-enter-from,
.tag-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
