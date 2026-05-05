<template>
  <div 
    class="select"
    :class="[
      `select--${size}`,
      { 'select--disabled': disabled },
      { 'select--clearable': clearable && hasValue },
      { 'select--multiple': multiple },
      { 'select--open': isOpen },
      { 'select--focus': isFocused }
    ]"
    ref="selectRef"
    @click="handleClick"
  >
    <!-- 选择器触发器 -->
    <div class="select__trigger">
      <!-- 前缀图标 -->
      <span v-if="prefixIcon" class="select__prefix">
        <IconLib :name="prefixIcon" :size="16" />
      </span>
      
      <!-- 多选标签 -->
      <div v-if="multiple" class="select__tags">
        <TransitionGroup name="select-tag">
          <span 
            v-for="item in selectedItems" 
            :key="item.value"
            class="select__tag"
          >
            <span class="select__tag-text">{{ item.label }}</span>
            <IconLib 
              name="x" 
              :size="12" 
              class="select__tag-close"
              @click.stop="removeTag(item)"
            />
          </span>
        </TransitionGroup>
        
        <!-- 搜索输入 -->
        <input
          v-if="filterable"
          ref="inputRef"
          v-model="searchQuery"
          class="select__search-input"
          :placeholder="selectedItems.length === 0 ? placeholder : ''"
          :disabled="disabled"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleSearch"
        />
        <span 
          v-else-if="selectedItems.length === 0" 
          class="select__placeholder"
        >
          {{ placeholder }}
        </span>
      </div>
      
      <!-- 单选显示 -->
      <template v-else>
        <input
          v-if="filterable"
          ref="inputRef"
          v-model="searchQuery"
          class="select__input"
          :placeholder="selectedLabel || placeholder"
          :disabled="disabled"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleSearch"
        />
        <span 
          v-else-if="selectedLabel" 
          class="select__selected"
        >
          {{ selectedLabel }}
        </span>
        <span v-else class="select__placeholder">
          {{ placeholder }}
        </span>
      </template>
      
      <!-- 后缀图标 -->
      <span class="select__suffix">
        <!-- 清除按钮 -->
        <IconLib
          v-if="clearable && hasValue"
          name="x-circle"
          :size="16"
          class="select__clear"
          @click.stop="handleClear"
        />
        <!-- 加载中 -->
        <span v-else-if="loading" class="select__loading">
          <IconLib name="loader" :size="16" class="select__loading-icon" />
        </span>
        <!-- 箭头 -->
        <IconLib
          v-else
          name="chevron-down"
          :size="16"
          class="select__arrow"
          :class="{ 'select__arrow--open': isOpen }"
        />
      </span>
    </div>
    
    <!-- 下拉面板 -->
    <Teleport to="body">
      <Transition name="select-dropdown">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="select__dropdown"
          :style="dropdownStyle"
        >
          <!-- 空状态 -->
          <div v-if="filteredOptions.length === 0" class="select__empty">
            <IconLib name="inbox" :size="32" />
            <span>{{ emptyText }}</span>
          </div>
          
          <!-- 选项列表 -->
          <div v-else class="select__options">
            <template v-for="option in filteredOptions" :key="option.value">
              <!-- 分组 -->
              <div v-if="option.isGroup" class="select__group">
                <div class="select__group-label">{{ option.label }}</div>
                <div
                  v-for="child in option.children"
                  :key="child.value"
                  class="select__option"
                  :class="{
                    'select__option--selected': isSelected(child),
                    'select__option--disabled': child.disabled,
                    'select__option--hover': hoverIndex === getOptionIndex(child)
                  }"
                  @click.stop="handleSelect(child)"
                  @mouseenter="hoverIndex = getOptionIndex(child)"
                >
                  <span class="select__option-label">{{ child.label }}</span>
                  <IconLib 
                    v-if="multiple && isSelected(child)" 
                    name="check" 
                    :size="14" 
                    class="select__option-check" 
                  />
                </div>
              </div>
              
              <!-- 普通选项 -->
              <div
                v-else
                class="select__option"
                :class="{
                  'select__option--selected': isSelected(option),
                  'select__option--disabled': option.disabled,
                  'select__option--hover': hoverIndex === getOptionIndex(option)
                }"
                @click.stop="handleSelect(option)"
                @mouseenter="hoverIndex = getOptionIndex(option)"
              >
                <span class="select__option-label">{{ option.label }}</span>
                <IconLib 
                  v-if="multiple && isSelected(option)" 
                  name="check" 
                  :size="14" 
                  class="select__option-check" 
                />
              </div>
            </template>
          </div>
          
          <!-- 底部插槽 -->
          <div v-if="$slots.footer" class="select__footer">
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  isGroup?: boolean
  children?: SelectOption[]
}

interface Props {
  // 绑定值
  modelValue?: string | number | (string | number)[]
  // 选项
  options: SelectOption[]
  // 占位符
  placeholder?: string
  // 是否禁用
  disabled?: boolean
  // 是否可清除
  clearable?: boolean
  // 是否多选
  multiple?: boolean
  // 是否可搜索
  filterable?: boolean
  // 是否远程搜索
  remote?: boolean
  // 远程搜索方法
  remoteMethod?: (query: string) => void
  // 是否加载中
  loading?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 前缀图标
  prefixIcon?: string
  // 空状态文本
  emptyText?: string
  // 多选时最多显示的标签数
  maxTagCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  clearable: false,
  multiple: false,
  filterable: false,
  remote: false,
  loading: false,
  size: 'default',
  emptyText: '无数据'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any): void
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'visible-change', visible: boolean): void
  (e: 'remove-tag', value: string | number): void
}>()

const selectRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()

const isOpen = ref(false)
const isFocused = ref(false)
const searchQuery = ref('')
const hoverIndex = ref(-1)
const dropdownStyle = ref<Record<string, string>>({})

// 扁平化选项列表（用于索引计算）
const flatOptions = computed(() => {
  const flat: SelectOption[] = []
  props.options.forEach(option => {
    if (option.isGroup && option.children) {
      flat.push(...option.children)
    } else {
      flat.push(option)
    }
  })
  return flat
})

// 获取选项索引
function getOptionIndex(option: SelectOption): number {
  return flatOptions.value.findIndex(o => o.value === option.value)
}

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!searchQuery.value || props.remote) {
    return props.options
  }
  
  const query = searchQuery.value.toLowerCase()
  
  return props.options.reduce<SelectOption[]>((acc, option) => {
    if (option.isGroup && option.children) {
      const filteredChildren = option.children.filter(child =>
        child.label.toLowerCase().includes(query)
      )
      if (filteredChildren.length > 0) {
        acc.push({ ...option, children: filteredChildren })
      }
    } else if (option.label.toLowerCase().includes(query)) {
      acc.push(option)
    }
    return acc
  }, [])
})

// 是否有值
const hasValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0
  }
  return props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== ''
})

// 选中的选项
const selectedItems = computed(() => {
  if (!props.multiple) return []
  
  const values = Array.isArray(props.modelValue) ? props.modelValue : []
  return values.map(value => {
    const option = flatOptions.value.find(o => o.value === value)
    return option || { label: String(value), value }
  })
})

// 选中的标签（单选）
const selectedLabel = computed(() => {
  if (props.multiple) return ''
  
  const option = flatOptions.value.find(o => o.value === props.modelValue)
  return option?.label || ''
})

// 是否选中
function isSelected(option: SelectOption): boolean {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(option.value)
  }
  return props.modelValue === option.value
}

// 更新下拉框位置
function updateDropdownPosition() {
  if (!selectRef.value) return
  
  const rect = selectRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const dropdownHeight = 256 // 最大高度
  
  // 判断是否需要向上展开
  const showAbove = rect.bottom + dropdownHeight > viewportHeight && rect.top > dropdownHeight
  
  dropdownStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    ...(showAbove
      ? { bottom: `${viewportHeight - rect.top + 4}px` }
      : { top: `${rect.bottom + 4}px` }
    )
  }
}

// 打开下拉框
function openDropdown() {
  if (props.disabled) return
  
  isOpen.value = true
  updateDropdownPosition()
  emit('visible-change', true)
  
  nextTick(() => {
    if (props.filterable) {
      inputRef.value?.focus()
    }
  })
}

// 关闭下拉框
function closeDropdown() {
  isOpen.value = false
  searchQuery.value = ''
  hoverIndex.value = -1
  emit('visible-change', false)
}

// 点击触发器
function handleClick() {
  if (props.disabled) return
  
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

// 选择选项
function handleSelect(option: SelectOption) {
  if (option.disabled) return
  
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = values.indexOf(option.value)
    
    if (index !== -1) {
      values.splice(index, 1)
    } else {
      values.push(option.value)
    }
    
    emit('update:modelValue', values)
    emit('change', values)
  } else {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    closeDropdown()
  }
}

// 移除标签
function removeTag(option: SelectOption) {
  if (props.disabled) return
  
  const values = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const index = values.indexOf(option.value)
  
  if (index !== -1) {
    values.splice(index, 1)
    emit('update:modelValue', values)
    emit('change', values)
    emit('remove-tag', option.value)
  }
}

// 清除
function handleClear() {
  if (props.multiple) {
    emit('update:modelValue', [])
    emit('change', [])
  } else {
    emit('update:modelValue', undefined)
    emit('change', undefined)
  }
  emit('clear')
}

// 搜索
function handleSearch() {
  if (props.remote && props.remoteMethod) {
    props.remoteMethod(searchQuery.value)
  }
}

// 聚焦
function handleFocus(e: FocusEvent) {
  isFocused.value = true
  emit('focus', e)
  
  if (!isOpen.value) {
    openDropdown()
  }
}

// 失焦
function handleBlur(e: FocusEvent) {
  isFocused.value = false
  emit('blur', e)
}

// 点击外部关闭
function handleClickOutside(e: MouseEvent) {
  if (
    selectRef.value &&
    !selectRef.value.contains(e.target as Node) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(e.target as Node)
  ) {
    closeDropdown()
  }
}

// 键盘导航
function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  
  const enabledOptions = flatOptions.value.filter(o => !o.disabled)
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      hoverIndex.value = Math.min(hoverIndex.value + 1, enabledOptions.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      hoverIndex.value = Math.max(hoverIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      if (hoverIndex.value >= 0 && hoverIndex.value < flatOptions.value.length) {
        handleSelect(flatOptions.value[hoverIndex.value])
      }
      break
    case 'Escape':
      closeDropdown()
      break
  }
}

// 监听窗口滚动和调整大小
function handleScrollResize() {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScrollResize, true)
  window.addEventListener('resize', handleScrollResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScrollResize, true)
  window.removeEventListener('resize', handleScrollResize)
})

// 暴露方法
defineExpose({
  focus: () => {
    if (props.filterable) {
      inputRef.value?.focus()
    } else {
      openDropdown()
    }
  },
  blur: () => {
    inputRef.value?.blur()
    closeDropdown()
  }
})
</script>

<style scoped>
.select {
  position: relative;
  display: inline-block;
  width: 100%;
  font-size: 14px;
}

.select--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.select--disabled .select__trigger {
  background: #f5f5f5;
  cursor: not-allowed;
}

.select__trigger {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 32px 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.select--small .select__trigger {
  min-height: 24px;
  padding: 2px 28px 2px 8px;
  font-size: 12px;
}

.select--large .select__trigger {
  min-height: 40px;
  padding: 6px 36px 6px 14px;
  font-size: 16px;
}

.select__trigger:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.select--focus .select__trigger,
.select--open .select__trigger {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.2);
}

.select__prefix {
  display: flex;
  align-items: center;
  margin-right: 8px;
  color: #999;
}

.select__suffix {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: #999;
}

.select__arrow {
  transition: transform 0.2s;
}

.select__arrow--open {
  transform: rotate(180deg);
}

.select__clear {
  cursor: pointer;
  transition: color 0.2s;
}

.select__clear:hover {
  color: #666;
}

.select__loading {
  display: flex;
  align-items: center;
}

.select__loading-icon {
  animation: select-spin 1s linear infinite;
}

@keyframes select-spin {
  to {
    transform: rotate(360deg);
  }
}

.select__placeholder {
  color: #999;
}

.select__selected {
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: inherit;
  color: #333;
}

.select__input::placeholder {
  color: #999;
}

/* 多选 */
.select__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.select__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 2px;
  font-size: 12px;
}

.select__tag-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select__tag-close {
  flex-shrink: 0;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.select__tag-close:hover {
  color: #666;
}

.select__search-input {
  flex: 1;
  min-width: 20px;
  border: none;
  outline: none;
  background: transparent;
  font-size: inherit;
}

/* 下拉框 */
.select__dropdown {
  z-index: 1000;
  max-height: 256px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 
              0 6px 16px 0 rgba(0, 0, 0, 0.08),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.select__options {
  max-height: 256px;
  overflow-y: auto;
  padding: 4px 0;
}

.select__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  color: #999;
}

.select__group {
  padding: 0;
}

.select__group-label {
  padding: 8px 12px 4px;
  font-size: 12px;
  color: #999;
}

.select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.select__option--hover,
.select__option:hover:not(.select__option--disabled) {
  background: #f5f5f5;
}

.select__option--selected {
  color: var(--primary-color, #4B6EF5);
  font-weight: 500;
}

.select__option--disabled {
  color: #999;
  cursor: not-allowed;
}

.select__option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select__option-check {
  flex-shrink: 0;
  color: var(--primary-color, #4B6EF5);
}

.select__footer {
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
}

/* 动画 */
.select-dropdown-enter-active,
.select-dropdown-leave-active {
  transition: all 0.2s ease;
}

.select-dropdown-enter-from,
.select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.select-tag-enter-active,
.select-tag-leave-active {
  transition: all 0.2s ease;
}

.select-tag-enter-from,
.select-tag-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
