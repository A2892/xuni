<template>
  <div class="collapse" :class="{ 'collapse-bordered': bordered }">
    <div
      v-for="(item, index) in items"
      :key="item.key || index"
      class="collapse-item"
      :class="{ 
        'is-active': isActive(item.key || index),
        'is-disabled': item.disabled
      }"
    >
      <!-- 头部 -->
      <div 
        class="collapse-header"
        @click="handleToggle(item.key || index, item)"
      >
        <span class="collapse-arrow" :class="{ 'arrow-right': arrowPosition === 'right' }">
          <IconLib 
            :name="expandIcon" 
            :size="14"
            class="arrow-icon"
          />
        </span>
        
        <div class="collapse-title">
          <slot :name="`title-${item.key || index}`" :item="item" :index="index">
            <IconLib v-if="item.icon" :name="item.icon" :size="16" class="title-icon" />
            {{ item.title }}
          </slot>
        </div>
        
        <div class="collapse-extra" v-if="item.extra || $slots[`extra-${item.key || index}`]">
          <slot :name="`extra-${item.key || index}`" :item="item" :index="index">
            {{ item.extra }}
          </slot>
        </div>
      </div>
      
      <!-- 内容 -->
      <Transition
        name="collapse"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <div 
          v-show="isActive(item.key || index)"
          class="collapse-content"
        >
          <div class="collapse-body">
            <slot :name="item.key || index" :item="item" :index="index">
              {{ item.content }}
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
interface CollapseItem {
  key?: string | number
  title: string
  content?: string
  icon?: string
  extra?: string
  disabled?: boolean
}

// Props
interface Props {
  items: CollapseItem[]
  modelValue?: (string | number)[]
  accordion?: boolean
  bordered?: boolean
  expandIcon?: string
  arrowPosition?: 'left' | 'right'
  destroyOnHide?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accordion: false,
  bordered: false,
  expandIcon: 'chevron-down',
  arrowPosition: 'left',
  destroyOnHide: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [keys: (string | number)[]]
  'change': [keys: (string | number)[], item: CollapseItem]
}>()

// State
const activeKeys = ref<Set<string | number>>(new Set(props.modelValue))

// Methods
function isActive(key: string | number): boolean {
  return activeKeys.value.has(key)
}

function handleToggle(key: string | number, item: CollapseItem) {
  if (item.disabled) return
  
  if (props.accordion) {
    // 手风琴模式：只能展开一个
    if (activeKeys.value.has(key)) {
      activeKeys.value.clear()
    } else {
      activeKeys.value.clear()
      activeKeys.value.add(key)
    }
  } else {
    if (activeKeys.value.has(key)) {
      activeKeys.value.delete(key)
    } else {
      activeKeys.value.add(key)
    }
  }
  
  const keys = Array.from(activeKeys.value)
  emit('update:modelValue', keys)
  emit('change', keys, item)
}

// 动画处理
function onEnter(el: HTMLElement) {
  el.style.height = '0'
  el.style.overflow = 'hidden'
  // 强制重绘
  void el.offsetHeight
  el.style.height = el.scrollHeight + 'px'
}

function onAfterEnter(el: HTMLElement) {
  el.style.height = ''
  el.style.overflow = ''
}

function onLeave(el: HTMLElement) {
  el.style.height = el.scrollHeight + 'px'
  el.style.overflow = 'hidden'
  // 强制重绘
  void el.offsetHeight
  el.style.height = '0'
}

function onAfterLeave(el: HTMLElement) {
  el.style.height = ''
  el.style.overflow = ''
}

// Watch
watch(() => props.modelValue, (newKeys) => {
  activeKeys.value = new Set(newKeys)
})

// Expose
defineExpose({
  expandAll: () => {
    if (!props.accordion) {
      props.items.forEach((item, index) => {
        if (!item.disabled) {
          activeKeys.value.add(item.key || index)
        }
      })
      emit('update:modelValue', Array.from(activeKeys.value))
    }
  },
  collapseAll: () => {
    activeKeys.value.clear()
    emit('update:modelValue', [])
  },
  toggle: (key: string | number) => {
    const item = props.items.find((i, idx) => (i.key || idx) === key)
    if (item) {
      handleToggle(key, item)
    }
  }
})
</script>

<style scoped>
.collapse {
  background: white;
  border-radius: 8px;
}

.collapse-bordered {
  border: 1px solid #e8e8e8;
}

.collapse-bordered .collapse-item + .collapse-item {
  border-top: 1px solid #e8e8e8;
}

.collapse-item {
  overflow: hidden;
}

.collapse-item:first-child .collapse-header {
  border-radius: 8px 8px 0 0;
}

.collapse-item:last-child .collapse-header {
  border-radius: 0 0 8px 8px;
}

.collapse-item:only-child .collapse-header {
  border-radius: 8px;
}

.collapse-item.is-active:last-child .collapse-header,
.collapse-item.is-active:only-child .collapse-header {
  border-radius: 0;
}

/* 头部 */
.collapse-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  background: #fafafa;
  transition: background 0.2s;
}

.collapse-header:hover {
  background: #f5f5f5;
}

.collapse-item.is-disabled .collapse-header {
  cursor: not-allowed;
  opacity: 0.5;
}

.collapse-item.is-disabled .collapse-header:hover {
  background: #fafafa;
}

.collapse-item.is-active .collapse-header {
  background: white;
}

/* 箭头 */
.collapse-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.collapse-arrow.arrow-right {
  order: 99;
  margin-left: auto;
}

.arrow-icon {
  transition: transform 0.3s;
}

.collapse-item.is-active .arrow-icon {
  transform: rotate(180deg);
}

.collapse-arrow.arrow-right .arrow-icon {
  transform: rotate(-90deg);
}

.collapse-item.is-active .collapse-arrow.arrow-right .arrow-icon {
  transform: rotate(0deg);
}

/* 标题 */
.collapse-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #666;
}

/* 额外内容 */
.collapse-extra {
  font-size: 13px;
  color: #999;
}

/* 内容 */
.collapse-content {
  overflow: hidden;
  transition: height 0.3s ease;
}

.collapse-body {
  padding: 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  background: white;
}

.collapse-bordered .collapse-body {
  border-top: 1px solid #e8e8e8;
}

/* 动画 */
.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.3s ease;
}
</style>
