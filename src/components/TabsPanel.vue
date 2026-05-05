<template>
  <div class="tabs-container" :class="[`variant-${variant}`, `size-${size}`]">
    <!-- 标签头部 -->
    <div class="tabs-header" role="tablist">
      <div class="tabs-nav" ref="tabsNavRef">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.key || index"
          :ref="el => setTabRef(el, index)"
          class="tab-item"
          :class="{ 
            'is-active': modelValue === (tab.key || index),
            'is-disabled': tab.disabled 
          }"
          role="tab"
          :aria-selected="modelValue === (tab.key || index)"
          :disabled="tab.disabled"
          @click="selectTab(tab.key || index)"
        >
          <IconLib v-if="tab.icon" :name="tab.icon" :size="18" class="tab-icon" />
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.badge" class="tab-badge" :class="tab.badgeType || 'default'">
            {{ tab.badge }}
          </span>
          <button 
            v-if="closable && !tab.unclosable"
            type="button"
            class="tab-close"
            @click.stop="closeTab(tab.key || index)"
          >
            <IconLib name="x" :size="14" />
          </button>
        </button>
        
        <!-- 添加按钮 -->
        <button 
          v-if="addable"
          type="button"
          class="tab-add"
          @click="$emit('add')"
        >
          <IconLib name="plus" :size="18" />
        </button>
        
        <!-- 活动指示器 -->
        <div 
          v-if="variant !== 'card'" 
          class="tab-indicator"
          :style="indicatorStyle"
        ></div>
      </div>
      
      <!-- 额外操作 -->
      <div v-if="$slots.extra" class="tabs-extra">
        <slot name="extra"></slot>
      </div>
    </div>
    
    <!-- 标签内容 -->
    <div class="tabs-content">
      <transition :name="animated ? 'tab-slide' : ''" mode="out-in">
        <div :key="modelValue" class="tab-pane">
          <slot></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Tab {
  key?: string | number
  label: string
  icon?: string
  badge?: string | number
  badgeType?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  unclosable?: boolean
}

interface Props {
  modelValue: string | number
  tabs: Tab[]
  variant?: 'line' | 'card' | 'pills' | 'segment'
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  closable?: boolean
  addable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'line',
  size: 'medium',
  animated: true,
  closable: false,
  addable: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  close: [key: string | number]
  add: []
}>()

// 引用
const tabsNavRef = ref<HTMLElement>()
const tabRefs = ref<(HTMLElement | null)[]>([])

// 指示器样式
const indicatorStyle = ref({
  left: '0px',
  width: '0px'
})

// 设置标签引用
const setTabRef = (el: any, index: number) => {
  tabRefs.value[index] = el
}

// 更新指示器位置
const updateIndicator = () => {
  nextTick(() => {
    const activeIndex = props.tabs.findIndex((tab, index) => 
      (tab.key || index) === props.modelValue
    )
    
    if (activeIndex >= 0 && tabRefs.value[activeIndex]) {
      const activeTab = tabRefs.value[activeIndex]
      const nav = tabsNavRef.value
      
      if (activeTab && nav) {
        const navRect = nav.getBoundingClientRect()
        const tabRect = activeTab.getBoundingClientRect()
        
        indicatorStyle.value = {
          left: `${tabRect.left - navRect.left}px`,
          width: `${tabRect.width}px`
        }
      }
    }
  })
}

// 选择标签
const selectTab = (key: string | number) => {
  const tab = props.tabs.find((t, index) => (t.key || index) === key)
  if (tab?.disabled) return
  
  emit('update:modelValue', key)
}

// 关闭标签
const closeTab = (key: string | number) => {
  emit('close', key)
}

// 监听变化
watch(() => props.modelValue, updateIndicator)
watch(() => props.tabs, updateIndicator, { deep: true })

onMounted(() => {
  updateIndicator()
  
  // 监听窗口大小变化
  window.addEventListener('resize', updateIndicator)
})
</script>

<style scoped>
.tabs-container {
  width: 100%;
}

/* 标签头部 */
.tabs-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tabs-nav {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}

/* 标签项 */
.tab-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-secondary, #666);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-item:hover:not(.is-disabled) {
  color: var(--text-primary, #1a1a1a);
}

.tab-item.is-active {
  color: var(--primary-color, #4B6EF5);
}

.tab-item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-icon {
  flex-shrink: 0;
}

/* 标签徽章 */
.tab-badge {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
}

.tab-badge.default {
  background: var(--bg-tertiary, #e5e7eb);
  color: var(--text-secondary, #666);
}

.tab-badge.primary {
  background: rgba(75, 110, 245, 0.1);
  color: var(--primary-color, #4B6EF5);
}

.tab-badge.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.tab-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.tab-badge.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* 关闭按钮 */
.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 0.25rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-tertiary, #999);
  transition: all 0.2s ease;
}

.tab-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* 添加按钮 */
.tab-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px dashed var(--border-color, #d1d5db);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-tertiary, #999);
  transition: all 0.2s ease;
}

.tab-add:hover {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

/* 活动指示器 */
.tab-indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--primary-color, #4B6EF5);
  border-radius: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 变体 - 线性 */
.tabs-container.variant-line .tabs-nav {
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

/* 变体 - 卡片 */
.tabs-container.variant-card .tab-item {
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 8px 8px 0 0;
  margin-right: 2px;
}

.tabs-container.variant-card .tab-item.is-active {
  background: var(--bg-primary, #fff);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

/* 变体 - 胶囊 */
.tabs-container.variant-pills .tabs-nav {
  background: var(--bg-secondary, #f5f5f5);
  padding: 0.25rem;
  border-radius: 10px;
}

.tabs-container.variant-pills .tab-item {
  border-radius: 8px;
}

.tabs-container.variant-pills .tab-item.is-active {
  background: var(--bg-primary, #fff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tabs-container.variant-pills .tab-indicator {
  display: none;
}

/* 变体 - 分段 */
.tabs-container.variant-segment .tabs-nav {
  background: var(--bg-secondary, #f5f5f5);
  padding: 0.25rem;
  border-radius: 10px;
}

.tabs-container.variant-segment .tab-item {
  flex: 1;
  justify-content: center;
  border-radius: 8px;
}

.tabs-container.variant-segment .tab-item.is-active {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

.tabs-container.variant-segment .tab-indicator {
  display: none;
}

/* 尺寸 */
.tabs-container.size-small .tab-item {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.tabs-container.size-large .tab-item {
  padding: 1rem 1.25rem;
  font-size: 1rem;
}

/* 额外内容 */
.tabs-extra {
  flex-shrink: 0;
}

/* 标签内容 */
.tabs-content {
  position: relative;
}

/* 过渡动画 */
.tab-slide-enter-active,
.tab-slide-leave-active {
  transition: all 0.3s ease;
}

.tab-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.tab-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
