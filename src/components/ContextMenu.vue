<template>
  <div 
    class="context-menu"
    v-show="visible"
    :style="menuStyle"
    @contextmenu.prevent
  >
    <template v-for="(item, index) in items" :key="index">
      <!-- 分隔线 -->
      <div v-if="item.type === 'divider'" class="menu-divider"></div>
      
      <!-- 子菜单 -->
      <div 
        v-else-if="item.children && item.children.length > 0"
        class="menu-item has-submenu"
        :class="{ disabled: item.disabled }"
        @mouseenter="openSubmenu(index, $event)"
        @mouseleave="closeSubmenu"
      >
        <div class="item-content">
          <IconLib v-if="item.icon" :name="item.icon" :size="16" class="item-icon" />
          <span class="item-label">{{ item.label }}</span>
          <IconLib name="chevron-right" :size="14" class="submenu-arrow" />
        </div>
        
        <!-- 子菜单 -->
        <transition name="submenu">
          <div 
            v-if="activeSubmenu === index"
            class="submenu"
            :style="submenuStyle"
          >
            <template v-for="(child, childIndex) in item.children" :key="childIndex">
              <div 
                v-if="child.type === 'divider'" 
                class="menu-divider"
              ></div>
              <div 
                v-else
                class="menu-item"
                :class="{ disabled: child.disabled }"
                @click="handleItemClick(child)"
              >
                <div class="item-content">
                  <IconLib v-if="child.icon" :name="child.icon" :size="16" class="item-icon" />
                  <span class="item-label">{{ child.label }}</span>
                  <span v-if="child.shortcut" class="item-shortcut">{{ child.shortcut }}</span>
                </div>
              </div>
            </template>
          </div>
        </transition>
      </div>
      
      <!-- 普通菜单项 -->
      <div 
        v-else
        class="menu-item"
        :class="{ disabled: item.disabled }"
        @click="handleItemClick(item)"
      >
        <div class="item-content">
          <IconLib v-if="item.icon" :name="item.icon" :size="16" class="item-icon" />
          <span v-if="item.checked !== undefined" class="item-check">
            <IconLib v-if="item.checked" name="check" :size="14" />
          </span>
          <span class="item-label">{{ item.label }}</span>
          <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
interface MenuItem {
  label?: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  checked?: boolean
  type?: 'item' | 'divider'
  action?: () => void
  children?: MenuItem[]
}

// Props
interface Props {
  items: MenuItem[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  select: [item: MenuItem]
  close: []
}>()

// State
const visible = ref(false)
const position = ref({ x: 0, y: 0 })
const activeSubmenu = ref<number | null>(null)
const submenuPosition = ref<'right' | 'left'>('right')

// Computed
const menuStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`
}))

const submenuStyle = computed(() => ({
  [submenuPosition.value]: '100%'
}))

// Methods
function show(x: number, y: number) {
  position.value = { x, y }
  visible.value = true
  
  // 确保菜单在视口内
  nextTick(() => {
    adjustPosition()
  })
}

function hide() {
  visible.value = false
  activeSubmenu.value = null
  emit('close')
}

function adjustPosition() {
  const menu = document.querySelector('.context-menu') as HTMLElement
  if (!menu) return
  
  const rect = menu.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let { x, y } = position.value
  
  // 水平方向调整
  if (x + rect.width > viewportWidth) {
    x = viewportWidth - rect.width - 8
  }
  
  // 垂直方向调整
  if (y + rect.height > viewportHeight) {
    y = viewportHeight - rect.height - 8
  }
  
  // 确保不超出左上角
  x = Math.max(8, x)
  y = Math.max(8, y)
  
  position.value = { x, y }
}

function openSubmenu(index: number, event: MouseEvent) {
  const item = props.items[index]
  if (item.disabled) return
  
  activeSubmenu.value = index
  
  // 检测子菜单方向
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  
  submenuPosition.value = rect.right + 200 > viewportWidth ? 'left' : 'right'
}

function closeSubmenu() {
  // 延迟关闭，以便鼠标可以移动到子菜单
  setTimeout(() => {
    const hoveredSubmenu = document.querySelector('.submenu:hover')
    if (!hoveredSubmenu) {
      activeSubmenu.value = null
    }
  }, 100)
}

function handleItemClick(item: MenuItem) {
  if (item.disabled) return
  
  if (item.action) {
    item.action()
  }
  
  emit('select', item)
  hide()
}

// 点击外部关闭
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.context-menu')) {
    hide()
  }
}

// 滚动时关闭
function handleScroll() {
  hide()
}

// 按 ESC 关闭
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    hide()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('scroll', handleScroll, true)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('scroll', handleScroll, true)
  document.removeEventListener('keydown', handleKeydown)
})

// Expose methods
defineExpose({
  show,
  hide
})
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 180px;
  max-width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 6px 0;
  animation: menuFadeIn 0.15s ease;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.menu-item {
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover:not(.disabled) {
  background: #f5f5f5;
}

.menu-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.item-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 10px;
}

.item-icon {
  color: #666;
  flex-shrink: 0;
}

.item-check {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color, #4B6EF5);
}

.item-label {
  flex: 1;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-shortcut {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.submenu-arrow {
  color: #999;
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  background: #e8e8e8;
  margin: 6px 12px;
}

/* 子菜单 */
.has-submenu {
  position: relative;
}

.submenu {
  position: absolute;
  top: -6px;
  min-width: 160px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 6px 0;
}

.submenu.right {
  margin-left: 4px;
}

.submenu.left {
  margin-right: 4px;
}

/* 子菜单动画 */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.15s ease;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
