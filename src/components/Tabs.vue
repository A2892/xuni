<template>
  <div class="tabs" :class="[`tabs-${type}`, `tabs-${position}`]">
    <!-- 标签头部 -->
    <div class="tabs-nav" ref="navRef">
      <div class="tabs-nav-wrap">
        <div 
          v-for="(tab, index) in tabs"
          :key="tab.key"
          class="tabs-tab"
          :class="{
            'is-active': tab.key === modelValue,
            'is-disabled': tab.disabled
          }"
          @click="handleSelect(tab)"
        >
          <IconLib v-if="tab.icon" :name="tab.icon" :size="16" class="tab-icon" />
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.badge !== undefined" class="tab-badge">{{ tab.badge }}</span>
          <button 
            v-if="closable && tabs.length > 1"
            class="tab-close"
            @click.stop="handleClose(tab, index)"
          >
            <IconLib name="x" :size="12" />
          </button>
        </div>
        
        <!-- 添加按钮 -->
        <button 
          v-if="addable"
          class="tabs-add"
          @click="handleAdd"
        >
          <IconLib name="plus" :size="14" />
        </button>
      </div>
      
      <!-- 活动指示器 -->
      <div 
        v-if="type === 'line'"
        class="tabs-ink-bar"
        :style="inkBarStyle"
      ></div>
    </div>
    
    <!-- 标签内容 -->
    <div class="tabs-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, provide } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
interface TabItem {
  key: string | number
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

// Props
interface Props {
  tabs: TabItem[]
  modelValue: string | number
  type?: 'line' | 'card' | 'segment'
  position?: 'top' | 'bottom' | 'left' | 'right'
  closable?: boolean
  addable?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'line',
  position: 'top',
  closable: false,
  addable: false,
  animated: true
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [key: string | number]
  'change': [key: string | number]
  'close': [tab: TabItem, index: number]
  'add': []
}>()

// Refs
const navRef = ref<HTMLElement | null>(null)

// State
const inkBarStyle = ref<Record<string, string>>({})

// Methods
function handleSelect(tab: TabItem) {
  if (tab.disabled) return
  
  emit('update:modelValue', tab.key)
  emit('change', tab.key)
}

function handleClose(tab: TabItem, index: number) {
  emit('close', tab, index)
}

function handleAdd() {
  emit('add')
}

function updateInkBar() {
  if (props.type !== 'line' || !navRef.value) return
  
  nextTick(() => {
    const activeTab = navRef.value?.querySelector('.tabs-tab.is-active') as HTMLElement
    if (activeTab) {
      const isVertical = props.position === 'left' || props.position === 'right'
      
      if (isVertical) {
        inkBarStyle.value = {
          top: `${activeTab.offsetTop}px`,
          height: `${activeTab.offsetHeight}px`
        }
      } else {
        inkBarStyle.value = {
          left: `${activeTab.offsetLeft}px`,
          width: `${activeTab.offsetWidth}px`
        }
      }
    }
  })
}

// Watch
watch(() => props.modelValue, () => {
  updateInkBar()
})

watch(() => props.tabs, () => {
  updateInkBar()
}, { deep: true })

// Lifecycle
onMounted(() => {
  updateInkBar()
})

// Provide
provide('activeTab', computed(() => props.modelValue))
</script>

<style scoped>
.tabs {
  display: flex;
  flex-direction: column;
}

/* 位置 */
.tabs-top {
  flex-direction: column;
}

.tabs-bottom {
  flex-direction: column-reverse;
}

.tabs-left {
  flex-direction: row;
}

.tabs-right {
  flex-direction: row-reverse;
}

/* 导航 */
.tabs-nav {
  position: relative;
  display: flex;
  border-bottom: 1px solid #e8e8e8;
}

.tabs-left .tabs-nav,
.tabs-right .tabs-nav {
  flex-direction: column;
  border-bottom: none;
  border-right: 1px solid #e8e8e8;
}

.tabs-right .tabs-nav {
  border-right: none;
  border-left: 1px solid #e8e8e8;
}

.tabs-bottom .tabs-nav {
  border-bottom: none;
  border-top: 1px solid #e8e8e8;
}

.tabs-nav-wrap {
  display: flex;
  gap: 4px;
}

.tabs-left .tabs-nav-wrap,
.tabs-right .tabs-nav-wrap {
  flex-direction: column;
}

/* 标签项 */
.tabs-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s;
  white-space: nowrap;
}

.tabs-left .tabs-tab,
.tabs-right .tabs-tab {
  border-radius: 4px 0 0 4px;
}

.tabs-right .tabs-tab {
  border-radius: 0 4px 4px 0;
}

.tabs-tab:hover {
  color: var(--primary-color, #4B6EF5);
}

.tabs-tab.is-active {
  color: var(--primary-color, #4B6EF5);
  font-weight: 500;
}

.tabs-tab.is-disabled {
  color: #ccc;
  cursor: not-allowed;
}

.tab-icon {
  flex-shrink: 0;
}

.tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  background: #ff4d4f;
  color: white;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 4px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
}

.tab-close:hover {
  background: #f0f0f0;
  color: #666;
}

/* 指示条 */
.tabs-ink-bar {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--primary-color, #4B6EF5);
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.tabs-left .tabs-ink-bar,
.tabs-right .tabs-ink-bar {
  width: 2px;
  height: auto;
  right: 0;
  bottom: auto;
}

.tabs-right .tabs-ink-bar {
  right: auto;
  left: 0;
}

/* 添加按钮 */
.tabs-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: auto 8px;
  background: none;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.tabs-add:hover {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

/* 卡片类型 */
.tabs-card .tabs-nav {
  border-bottom: none;
  background: #fafafa;
  padding: 4px;
  border-radius: 8px;
  gap: 4px;
}

.tabs-card .tabs-tab {
  background: transparent;
  border-radius: 6px;
}

.tabs-card .tabs-tab.is-active {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tabs-card .tabs-ink-bar {
  display: none;
}

/* 分段类型 */
.tabs-segment .tabs-nav {
  border-bottom: none;
  background: #f0f0f0;
  padding: 2px;
  border-radius: 8px;
  gap: 0;
}

.tabs-segment .tabs-tab {
  flex: 1;
  justify-content: center;
  border-radius: 6px;
  padding: 8px 16px;
}

.tabs-segment .tabs-tab.is-active {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tabs-segment .tabs-ink-bar {
  display: none;
}

/* 内容区域 */
.tabs-content {
  flex: 1;
  padding: 16px 0;
}

.tabs-left .tabs-content,
.tabs-right .tabs-content {
  padding: 0 16px;
}
</style>
