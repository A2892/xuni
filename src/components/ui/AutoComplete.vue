<template>
  <div class="auto-complete" ref="containerRef">
    <input
      ref="inputRef"
      type="text"
      class="auto-complete-input"
      :class="{
        'auto-complete-input-focused': focused,
        'auto-complete-input-disabled': disabled,
        [`auto-complete-input-${size}`]: size !== 'default'
      }"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="showDropdown && filteredOptions.length > 0"
          class="auto-complete-dropdown"
          :style="dropdownStyle"
          ref="dropdownRef"
        >
          <div
            v-for="(option, index) in filteredOptions"
            :key="option.value"
            class="auto-complete-option"
            :class="{
              'auto-complete-option-active': activeIndex === index,
              'auto-complete-option-disabled': option.disabled
            }"
            @click="handleSelect(option)"
            @mouseenter="activeIndex = index"
          >
            <slot name="option" :option="option" :index="index">
              <span v-if="option.label" v-html="highlightMatch(option.label)" />
              <span v-else v-html="highlightMatch(String(option.value))" />
            </slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface Option {
  value: string | number
  label?: string
  disabled?: boolean
  [key: string]: any
}

interface Props {
  modelValue: string
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  size?: 'small' | 'default' | 'large'
  allowClear?: boolean
  filterOption?: boolean | ((inputValue: string, option: Option) => boolean)
  defaultActiveFirstOption?: boolean
  backfill?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: '',
  disabled: false,
  size: 'default',
  allowClear: false,
  filterOption: true,
  defaultActiveFirstOption: true,
  backfill: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [value: string | number, option: Option]
  search: [value: string]
  blur: [e: FocusEvent]
  focus: [e: FocusEvent]
}>()

const containerRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const dropdownRef = ref<HTMLElement>()
const focused = ref(false)
const showDropdown = ref(false)
const activeIndex = ref(-1)
const dropdownStyle = ref<Record<string, string>>({})

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!props.filterOption) {
    return props.options
  }
  
  const input = props.modelValue.toLowerCase()
  if (!input) {
    return props.options
  }
  
  return props.options.filter(option => {
    if (typeof props.filterOption === 'function') {
      return props.filterOption(props.modelValue, option)
    }
    
    const label = option.label || String(option.value)
    return label.toLowerCase().includes(input)
  })
})

// 高亮匹配文本
const highlightMatch = (text: string) => {
  if (!props.modelValue) return text
  
  const regex = new RegExp(`(${escapeRegExp(props.modelValue)})`, 'gi')
  return text.replace(regex, '<span class="auto-complete-highlight">$1</span>')
}

const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 更新下拉框位置
const updateDropdownPosition = () => {
  if (!containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '1050'
  }
}

// 输入处理
const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
  emit('search', value)
  showDropdown.value = true
  activeIndex.value = props.defaultActiveFirstOption ? 0 : -1
}

// 聚焦
const handleFocus = (e: FocusEvent) => {
  focused.value = true
  showDropdown.value = true
  updateDropdownPosition()
  emit('focus', e)
}

// 失焦
const handleBlur = (e: FocusEvent) => {
  // 延迟关闭，允许点击选项
  setTimeout(() => {
    focused.value = false
    showDropdown.value = false
  }, 150)
  emit('blur', e)
}

// 键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  const optionsCount = filteredOptions.value.length
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % optionsCount
      if (props.backfill && filteredOptions.value[activeIndex.value]) {
        emit('update:modelValue', String(filteredOptions.value[activeIndex.value].value))
      }
      break
    
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + optionsCount) % optionsCount
      if (props.backfill && filteredOptions.value[activeIndex.value]) {
        emit('update:modelValue', String(filteredOptions.value[activeIndex.value].value))
      }
      break
    
    case 'Enter':
      e.preventDefault()
      if (activeIndex.value >= 0 && filteredOptions.value[activeIndex.value]) {
        handleSelect(filteredOptions.value[activeIndex.value])
      }
      break
    
    case 'Escape':
      showDropdown.value = false
      break
  }
}

// 选择选项
const handleSelect = (option: Option) => {
  if (option.disabled) return
  
  emit('update:modelValue', String(option.value))
  emit('select', option.value, option)
  showDropdown.value = false
  inputRef.value?.blur()
}

// 监听窗口变化
const handleResize = () => {
  if (showDropdown.value) {
    updateDropdownPosition()
  }
}

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (!containerRef.value?.contains(e.target as Node) &&
      !dropdownRef.value?.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize)
  document.removeEventListener('click', handleClickOutside)
})

// 监听选项变化，重置 activeIndex
watch(() => filteredOptions.value, () => {
  if (props.defaultActiveFirstOption && filteredOptions.value.length > 0) {
    activeIndex.value = 0
  } else {
    activeIndex.value = -1
  }
})
</script>

<style scoped>
.auto-complete {
  position: relative;
  display: inline-block;
  width: 100%;
}

.auto-complete-input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s;
}

.auto-complete-input:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.auto-complete-input-focused {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.1);
}

.auto-complete-input-disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.5;
}

.auto-complete-input-small {
  height: 28px;
  font-size: 12px;
}

.auto-complete-input-large {
  height: 44px;
  font-size: 16px;
}

.auto-complete-dropdown {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08),
              0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
  max-height: 256px;
  overflow-y: auto;
  padding: 4px;
}

.auto-complete-option {
  padding: 8px 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.auto-complete-option:hover,
.auto-complete-option-active {
  background-color: rgba(0, 0, 0, 0.04);
}

.auto-complete-option-disabled {
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
}

.auto-complete-option-disabled:hover {
  background-color: transparent;
}

:deep(.auto-complete-highlight) {
  color: var(--primary-color, #4B6EF5);
  font-weight: 600;
}

/* 动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
