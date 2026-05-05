<template>
  <div 
    ref="dropdownRef"
    class="dropdown-wrapper"
    :class="{ 'is-open': isOpen }"
  >
    <!-- 触发器 -->
    <div 
      ref="triggerRef"
      class="dropdown-trigger"
      @click="toggle"
    >
      <slot name="trigger">
        <button type="button" class="default-trigger">
          {{ label }}
          <IconLib :name="isOpen ? 'chevron-up' : 'chevron-down'" :size="16" />
        </button>
      </slot>
    </div>
    
    <!-- 下拉内容 -->
    <Teleport to="body" :disabled="!teleport">
      <transition name="dropdown-transition">
        <div 
          v-if="isOpen"
          ref="menuRef"
          class="dropdown-menu"
          :class="[`placement-${placement}`]"
          :style="menuStyle"
        >
          <!-- 搜索框 -->
          <div v-if="searchable" class="dropdown-search">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              :placeholder="searchPlaceholder"
              @click.stop
            />
            <IconLib name="search" :size="16" class="search-icon" />
          </div>
          
          <!-- 菜单项 -->
          <div class="dropdown-content" :style="{ maxHeight }">
            <slot :items="filteredItems" :close="close">
              <template v-if="filteredItems.length > 0">
                <div
                  v-for="(item, index) in filteredItems"
                  :key="item.key || index"
                  class="dropdown-item"
                  :class="{ 
                    'is-active': isActive(item),
                    'is-disabled': item.disabled,
                    'is-divider': item.divider
                  }"
                  @click="handleSelect(item)"
                >
                  <template v-if="!item.divider">
                    <IconLib v-if="item.icon" :name="item.icon" :size="18" class="item-icon" />
                    <span class="item-label">{{ item.label }}</span>
                    <span v-if="item.badge" class="item-badge">{{ item.badge }}</span>
                    <IconLib v-if="item.children" name="chevron-right" :size="16" class="item-arrow" />
                    <IconLib v-if="isActive(item) && !item.children" name="check" :size="16" class="item-check" />
                  </template>
                </div>
              </template>
              <div v-else class="dropdown-empty">
                <IconLib name="inbox" :size="32" />
                <span>{{ emptyText }}</span>
              </div>
            </slot>
          </div>
          
          <!-- 底部操作 -->
          <div v-if="$slots.footer" class="dropdown-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface MenuItem {
  key?: string | number
  label: string
  value?: any
  icon?: string
  badge?: string | number
  disabled?: boolean
  divider?: boolean
  children?: MenuItem[]
}

interface Props {
  modelValue?: any
  items?: MenuItem[]
  label?: string
  placeholder?: string
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top'
  trigger?: 'click' | 'hover'
  searchable?: boolean
  searchPlaceholder?: string
  multiple?: boolean
  closeOnSelect?: boolean
  disabled?: boolean
  teleport?: boolean
  maxHeight?: string
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  placeholder: '请选择',
  placement: 'bottom-start',
  trigger: 'click',
  searchable: false,
  searchPlaceholder: '搜索...',
  multiple: false,
  closeOnSelect: true,
  disabled: false,
  teleport: true,
  maxHeight: '240px',
  emptyText: '暂无数据'
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  select: [item: MenuItem]
  open: []
  close: []
}>()

// 状态
const dropdownRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const menuRef = ref<HTMLElement>()
const searchInputRef = ref<HTMLInputElement>()
const isOpen = ref(false)
const searchQuery = ref('')
const menuStyle = ref<Record<string, string>>({})

// 过滤后的菜单项
const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items
  
  const query = searchQuery.value.toLowerCase()
  return props.items.filter(item => {
    if (item.divider) return false
    return item.label.toLowerCase().includes(query)
  })
})

// 检查是否激活
const isActive = (item: MenuItem) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(item.value ?? item.key)
  }
  return props.modelValue === (item.value ?? item.key)
}

// 计算菜单位置
const updatePosition = () => {
  if (!triggerRef.value || !props.teleport) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const scrollY = window.scrollY
  const scrollX = window.scrollX
  
  let top: number
  let left: number
  
  switch (props.placement) {
    case 'bottom-start':
      top = triggerRect.bottom + scrollY + 4
      left = triggerRect.left + scrollX
      break
    case 'bottom-end':
      top = triggerRect.bottom + scrollY + 4
      left = triggerRect.right + scrollX
      break
    case 'bottom':
      top = triggerRect.bottom + scrollY + 4
      left = triggerRect.left + scrollX + triggerRect.width / 2
      break
    case 'top-start':
      top = triggerRect.top + scrollY - 4
      left = triggerRect.left + scrollX
      break
    case 'top-end':
      top = triggerRect.top + scrollY - 4
      left = triggerRect.right + scrollX
      break
    case 'top':
      top = triggerRect.top + scrollY - 4
      left = triggerRect.left + scrollX + triggerRect.width / 2
      break
    default:
      top = triggerRect.bottom + scrollY + 4
      left = triggerRect.left + scrollX
  }
  
  menuStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${triggerRect.width}px`
  }
}

// 切换打开状态
const toggle = () => {
  if (props.disabled) return
  isOpen.value ? close() : open()
}

// 打开
const open = () => {
  isOpen.value = true
  emit('open')
  
  nextTick(() => {
    updatePosition()
    if (props.searchable && searchInputRef.value) {
      searchInputRef.value.focus()
    }
  })
}

// 关闭
const close = () => {
  isOpen.value = false
  searchQuery.value = ''
  emit('close')
}

// 选择项
const handleSelect = (item: MenuItem) => {
  if (item.disabled || item.divider) return
  
  const value = item.value ?? item.key
  
  if (props.multiple && Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    const index = newValue.indexOf(value)
    if (index > -1) {
      newValue.splice(index, 1)
    } else {
      newValue.push(value)
    }
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', value)
  }
  
  emit('select', item)
  
  if (props.closeOnSelect && !props.multiple) {
    close()
  }
}

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (!isOpen.value) return
  
  const target = e.target as HTMLElement
  if (
    dropdownRef.value?.contains(target) ||
    menuRef.value?.contains(target)
  ) {
    return
  }
  
  close()
}

// 监听窗口变化
const handleResize = () => {
  if (isOpen.value) {
    updatePosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize, true)
})

// 暴露方法
defineExpose({
  open,
  close,
  toggle
})
</script>

<style scoped>
.dropdown-wrapper {
  position: relative;
  display: inline-block;
}

/* 默认触发器 */
.default-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.9375rem;
  color: var(--text-primary, #1a1a1a);
  background: var(--bg-primary, #fff);
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.default-trigger:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.is-open .default-trigger {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

/* 下拉菜单 */
.dropdown-menu {
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
}

/* 非Teleport时的定位 */
.dropdown-wrapper:not(.teleport) .dropdown-menu {
  position: absolute;
  min-width: 180px;
}

.placement-bottom-start .dropdown-menu,
.dropdown-wrapper:not(.teleport) .placement-bottom-start {
  top: 100%;
  left: 0;
  margin-top: 4px;
}

.placement-bottom-end .dropdown-menu,
.dropdown-wrapper:not(.teleport) .placement-bottom-end {
  top: 100%;
  right: 0;
  margin-top: 4px;
}

.placement-top-start .dropdown-menu,
.dropdown-wrapper:not(.teleport) .placement-top-start {
  bottom: 100%;
  left: 0;
  margin-bottom: 4px;
}

.placement-top-end .dropdown-menu,
.dropdown-wrapper:not(.teleport) .placement-top-end {
  bottom: 100%;
  right: 0;
  margin-bottom: 4px;
}

/* 搜索框 */
.dropdown-search {
  position: relative;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  font-size: 0.875rem;
  color: var(--text-primary, #1a1a1a);
  background: var(--bg-secondary, #f5f5f5);
  border: none;
  border-radius: 6px;
  outline: none;
}

.search-input:focus {
  background: var(--bg-tertiary, #e5e7eb);
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary, #999);
}

/* 内容区域 */
.dropdown-content {
  overflow-y: auto;
  padding: 0.5rem 0;
}

/* 菜单项 */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  font-size: 0.9375rem;
  color: var(--text-primary, #1a1a1a);
  cursor: pointer;
  transition: background 0.15s ease;
}

.dropdown-item:hover:not(.is-disabled):not(.is-divider) {
  background: var(--bg-hover, #f3f4f6);
}

.dropdown-item.is-active {
  color: var(--primary-color, #4B6EF5);
  background: rgba(75, 110, 245, 0.05);
}

.dropdown-item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-item.is-divider {
  height: 1px;
  margin: 0.5rem 0;
  padding: 0;
  background: var(--border-color, #e5e7eb);
  cursor: default;
}

.item-icon {
  flex-shrink: 0;
  color: var(--text-secondary, #666);
}

.dropdown-item.is-active .item-icon {
  color: var(--primary-color, #4B6EF5);
}

.item-label {
  flex: 1;
}

.item-badge {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--bg-tertiary, #e5e7eb);
  border-radius: 10px;
  color: var(--text-secondary, #666);
}

.item-arrow,
.item-check {
  flex-shrink: 0;
  color: var(--text-tertiary, #999);
}

.item-check {
  color: var(--primary-color, #4B6EF5);
}

/* 空状态 */
.dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  color: var(--text-tertiary, #999);
}

/* 底部 */
.dropdown-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
}

/* 过渡动画 */
.dropdown-transition-enter-active,
.dropdown-transition-leave-active {
  transition: all 0.2s ease;
}

.dropdown-transition-enter-from,
.dropdown-transition-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.placement-top-start .dropdown-transition-enter-from,
.placement-top-start .dropdown-transition-leave-to,
.placement-top-end .dropdown-transition-enter-from,
.placement-top-end .dropdown-transition-leave-to,
.placement-top .dropdown-transition-enter-from,
.placement-top .dropdown-transition-leave-to {
  transform: translateY(8px);
}
</style>
