<template>
  <div 
    class="dropdown"
    :class="{ 'is-open': isOpen }"
    ref="dropdownRef"
  >
    <div 
      class="dropdown-trigger"
      @click="handleTriggerClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <slot name="trigger">
        <button class="dropdown-button">
          {{ placeholder }}
          <IconLib name="chevron-down" :size="14" class="dropdown-arrow" />
        </button>
      </slot>
    </div>
    
    <Teleport to="body" :disabled="!appendToBody">
      <Transition name="dropdown">
        <div 
          v-if="isOpen"
          class="dropdown-menu"
          :class="`dropdown-${placement}`"
          :style="menuStyle"
          ref="menuRef"
          @mouseenter="handleMenuEnter"
          @mouseleave="handleMenuLeave"
        >
          <div class="dropdown-content">
            <slot>
              <template v-for="(item, index) in items" :key="item.key || index">
                <!-- 分割线 -->
                <div v-if="item.type === 'divider'" class="dropdown-divider"></div>
                
                <!-- 分组标题 -->
                <div v-else-if="item.type === 'group'" class="dropdown-group">
                  <div class="dropdown-group-title">{{ item.label }}</div>
                  <div 
                    v-for="(child, cIndex) in item.children"
                    :key="child.key || cIndex"
                    class="dropdown-item"
                    :class="{ 
                      'is-disabled': child.disabled,
                      'is-danger': child.danger
                    }"
                    @click="handleSelect(child)"
                  >
                    <IconLib v-if="child.icon" :name="child.icon" :size="16" class="item-icon" />
                    <span class="item-label">{{ child.label }}</span>
                    <span v-if="child.shortcut" class="item-shortcut">{{ child.shortcut }}</span>
                  </div>
                </div>
                
                <!-- 普通菜单项 -->
                <div 
                  v-else
                  class="dropdown-item"
                  :class="{ 
                    'is-disabled': item.disabled,
                    'is-danger': item.danger,
                    'is-active': item.key === activeKey
                  }"
                  @click="handleSelect(item)"
                >
                  <IconLib v-if="item.icon" :name="item.icon" :size="16" class="item-icon" />
                  <span class="item-label">{{ item.label }}</span>
                  <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
                  <IconLib v-if="item.children" name="chevron-right" :size="12" class="item-arrow" />
                </div>
              </template>
            </slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
interface DropdownItem {
  key?: string | number
  label?: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  type?: 'item' | 'divider' | 'group'
  children?: DropdownItem[]
}

type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'
type Trigger = 'click' | 'hover'

// Props
interface Props {
  items?: DropdownItem[]
  placeholder?: string
  placement?: Placement
  trigger?: Trigger
  disabled?: boolean
  hideOnClick?: boolean
  activeKey?: string | number
  appendToBody?: boolean
  offset?: number
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  placeholder: '下拉菜单',
  placement: 'bottom-start',
  trigger: 'click',
  disabled: false,
  hideOnClick: true,
  appendToBody: true,
  offset: 4,
  zIndex: 1000
})

// Emits
const emit = defineEmits<{
  'select': [item: DropdownItem]
  'open': []
  'close': []
}>()

// Refs
const dropdownRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

// State
const isOpen = ref(false)
const position = ref({ top: 0, left: 0 })
let hoverTimer: ReturnType<typeof setTimeout> | null = null

// Computed
const menuStyle = computed(() => {
  if (!props.appendToBody) return {}
  
  return {
    position: 'absolute' as const,
    top: `${position.value.top}px`,
    left: `${position.value.left}px`,
    zIndex: props.zIndex
  }
})

// Methods
function open() {
  if (props.disabled) return
  
  isOpen.value = true
  emit('open')
  
  if (props.appendToBody) {
    nextTick(() => {
      updatePosition()
    })
  }
}

function close() {
  isOpen.value = false
  emit('close')
}

function toggle() {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

function updatePosition() {
  if (!dropdownRef.value || !menuRef.value) return
  
  const triggerRect = dropdownRef.value.getBoundingClientRect()
  const menuRect = menuRef.value.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  
  let top = 0
  let left = 0
  
  const [vertical, horizontal] = props.placement.split('-')
  
  // 垂直位置
  if (vertical === 'bottom') {
    top = triggerRect.bottom + scrollTop + props.offset
  } else {
    top = triggerRect.top + scrollTop - menuRect.height - props.offset
  }
  
  // 水平位置
  if (horizontal === 'start' || !horizontal) {
    left = triggerRect.left + scrollLeft
  } else if (horizontal === 'end') {
    left = triggerRect.right + scrollLeft - menuRect.width
  } else {
    left = triggerRect.left + scrollLeft + (triggerRect.width - menuRect.width) / 2
  }
  
  // 边界检测
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  if (left + menuRect.width > viewportWidth + scrollLeft - 10) {
    left = viewportWidth + scrollLeft - menuRect.width - 10
  }
  if (left < scrollLeft + 10) {
    left = scrollLeft + 10
  }
  if (top + menuRect.height > viewportHeight + scrollTop - 10) {
    top = triggerRect.top + scrollTop - menuRect.height - props.offset
  }
  
  position.value = { top, left }
}

function handleTriggerClick() {
  if (props.trigger === 'click') {
    toggle()
  }
}

function handleMouseEnter() {
  if (props.trigger === 'hover') {
    clearTimer()
    hoverTimer = setTimeout(() => {
      open()
    }, 100)
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover') {
    clearTimer()
    hoverTimer = setTimeout(() => {
      close()
    }, 150)
  }
}

function handleMenuEnter() {
  if (props.trigger === 'hover') {
    clearTimer()
  }
}

function handleMenuLeave() {
  if (props.trigger === 'hover') {
    clearTimer()
    hoverTimer = setTimeout(() => {
      close()
    }, 150)
  }
}

function clearTimer() {
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
}

function handleSelect(item: DropdownItem) {
  if (item.disabled) return
  
  emit('select', item)
  
  if (props.hideOnClick) {
    close()
  }
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  
  if (
    dropdownRef.value?.contains(target) ||
    menuRef.value?.contains(target)
  ) {
    return
  }
  
  close()
}

// Watch
watch(isOpen, (val) => {
  if (val) {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
  } else {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', updatePosition)
    window.removeEventListener('scroll', updatePosition, true)
  }
})

// Lifecycle
onUnmounted(() => {
  clearTimer()
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})

// Expose
defineExpose({
  open,
  close,
  toggle
})
</script>

<style scoped>
.dropdown {
  display: inline-block;
  position: relative;
}

.dropdown-trigger {
  cursor: pointer;
}

.dropdown-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-button:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.dropdown-arrow {
  transition: transform 0.2s;
}

.is-open .dropdown-arrow {
  transform: rotate(180deg);
}

/* 菜单 */
.dropdown-menu {
  min-width: 160px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dropdown-content {
  padding: 4px 0;
}

/* 菜单项 */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.is-active {
  color: var(--primary-color, #4B6EF5);
  background: rgba(75, 110, 245, 0.1);
}

.dropdown-item.is-disabled {
  color: #ccc;
  cursor: not-allowed;
}

.dropdown-item.is-disabled:hover {
  background: transparent;
}

.dropdown-item.is-danger {
  color: #ff4d4f;
}

.dropdown-item.is-danger:hover {
  background: rgba(255, 77, 79, 0.1);
}

.item-icon {
  color: inherit;
  flex-shrink: 0;
}

.item-label {
  flex: 1;
}

.item-shortcut {
  font-size: 12px;
  color: #999;
}

.item-arrow {
  color: #999;
}

/* 分割线 */
.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}

/* 分组 */
.dropdown-group-title {
  padding: 8px 12px 4px;
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

/* 动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-top .dropdown-enter-from,
.dropdown-top .dropdown-leave-to,
.dropdown-top-start .dropdown-enter-from,
.dropdown-top-start .dropdown-leave-to,
.dropdown-top-end .dropdown-enter-from,
.dropdown-top-end .dropdown-leave-to {
  transform: translateY(10px);
}
</style>
