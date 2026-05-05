<template>
  <nav class="breadcrumb" :class="{ 'breadcrumb--wrap': wrap }">
    <ol class="breadcrumb__list">
      <li 
        v-for="(item, index) in items" 
        :key="index"
        class="breadcrumb__item"
        :class="{ 
          'breadcrumb__item--active': index === items.length - 1,
          'breadcrumb__item--disabled': item.disabled
        }"
      >
        <!-- 分隔符 -->
        <span v-if="index > 0" class="breadcrumb__separator">
          <slot name="separator">
            <IconLib :name="separatorIcon" :size="14" />
          </slot>
        </span>
        
        <!-- 面包屑项 -->
        <template v-if="item.disabled || index === items.length - 1">
          <span class="breadcrumb__link breadcrumb__link--text">
            <IconLib v-if="item.icon" :name="item.icon" :size="14" class="breadcrumb__icon" />
            <span>{{ item.label }}</span>
          </span>
        </template>
        
        <template v-else-if="item.to">
          <router-link :to="item.to" class="breadcrumb__link">
            <IconLib v-if="item.icon" :name="item.icon" :size="14" class="breadcrumb__icon" />
            <span>{{ item.label }}</span>
          </router-link>
        </template>
        
        <template v-else-if="item.href">
          <a :href="item.href" class="breadcrumb__link" :target="item.target">
            <IconLib v-if="item.icon" :name="item.icon" :size="14" class="breadcrumb__icon" />
            <span>{{ item.label }}</span>
          </a>
        </template>
        
        <template v-else>
          <span 
            class="breadcrumb__link" 
            :class="{ 'breadcrumb__link--clickable': item.onClick }"
            @click="handleClick(item, index)"
          >
            <IconLib v-if="item.icon" :name="item.icon" :size="14" class="breadcrumb__icon" />
            <span>{{ item.label }}</span>
          </span>
        </template>
        
        <!-- 下拉菜单 -->
        <div v-if="item.children && item.children.length > 0" class="breadcrumb__dropdown">
          <button 
            class="breadcrumb__dropdown-trigger"
            @click="toggleDropdown(index)"
          >
            <IconLib name="chevron-down" :size="12" />
          </button>
          
          <Transition name="breadcrumb-dropdown">
            <div 
              v-if="openDropdown === index" 
              class="breadcrumb__dropdown-menu"
              v-click-outside="() => openDropdown = -1"
            >
              <div
                v-for="(child, childIndex) in item.children"
                :key="childIndex"
                class="breadcrumb__dropdown-item"
                :class="{ 'breadcrumb__dropdown-item--disabled': child.disabled }"
                @click="handleChildClick(child, index, childIndex)"
              >
                <IconLib v-if="child.icon" :name="child.icon" :size="14" />
                <span>{{ child.label }}</span>
              </div>
            </div>
          </Transition>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { ref, type Directive } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

export interface BreadcrumbItem {
  label: string
  icon?: string
  to?: string | object
  href?: string
  target?: string
  disabled?: boolean
  onClick?: () => void
  children?: BreadcrumbItem[]
}

interface Props {
  // 面包屑项
  items: BreadcrumbItem[]
  // 分隔符图标
  separatorIcon?: string
  // 是否换行
  wrap?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  separatorIcon: 'chevron-right',
  wrap: false
})

const emit = defineEmits<{
  (e: 'click', item: BreadcrumbItem, index: number): void
  (e: 'child-click', item: BreadcrumbItem, parentIndex: number, childIndex: number): void
}>()

const openDropdown = ref(-1)

// 点击面包屑项
function handleClick(item: BreadcrumbItem, index: number) {
  if (item.disabled) return
  
  if (item.onClick) {
    item.onClick()
  }
  
  emit('click', item, index)
}

// 点击下拉项
function handleChildClick(child: BreadcrumbItem, parentIndex: number, childIndex: number) {
  if (child.disabled) return
  
  if (child.onClick) {
    child.onClick()
  }
  
  emit('child-click', child, parentIndex, childIndex)
  openDropdown.value = -1
}

// 切换下拉菜单
function toggleDropdown(index: number) {
  openDropdown.value = openDropdown.value === index ? -1 : index
}

// 点击外部关闭指令
const vClickOutside: Directive = {
  mounted(el, binding) {
    el._clickOutside = (event: MouseEvent) => {
      if (!el.contains(event.target as Node)) {
        binding.value()
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}
</script>

<style scoped>
.breadcrumb {
  display: block;
  font-size: 14px;
}

.breadcrumb__list {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb--wrap .breadcrumb__list {
  flex-wrap: wrap;
}

.breadcrumb__item {
  display: flex;
  align-items: center;
}

.breadcrumb__separator {
  display: flex;
  align-items: center;
  margin: 0 8px;
  color: #999;
}

.breadcrumb__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb__link:hover:not(.breadcrumb__link--text) {
  color: var(--primary-color, #4B6EF5);
}

.breadcrumb__link--clickable {
  cursor: pointer;
}

.breadcrumb__link--text {
  cursor: default;
}

.breadcrumb__item--active .breadcrumb__link {
  color: #333;
  font-weight: 500;
}

.breadcrumb__item--disabled .breadcrumb__link {
  color: #999;
  cursor: not-allowed;
}

.breadcrumb__icon {
  flex-shrink: 0;
}

/* 下拉菜单 */
.breadcrumb__dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.breadcrumb__dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.breadcrumb__dropdown-trigger:hover {
  background: #f0f0f0;
  color: #666;
}

.breadcrumb__dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 120px;
  margin-top: 4px;
  padding: 4px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 6px 16px 0 rgba(0, 0, 0, 0.08),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.breadcrumb__dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.breadcrumb__dropdown-item:hover:not(.breadcrumb__dropdown-item--disabled) {
  background: #f5f5f5;
}

.breadcrumb__dropdown-item--disabled {
  color: #999;
  cursor: not-allowed;
}

/* 动画 */
.breadcrumb-dropdown-enter-active,
.breadcrumb-dropdown-leave-active {
  transition: all 0.2s ease;
}

.breadcrumb-dropdown-enter-from,
.breadcrumb-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
