<template>
  <div
    class="collapse-panel"
    :class="{
      'collapse-panel-active': active,
      'collapse-panel-disabled': disabled,
      'collapse-panel-bordered': collapseContext?.bordered.value,
      'collapse-panel-ghost': collapseContext?.ghost.value
    }"
  >
    <div
      class="collapse-header"
      :class="{ 'collapse-header-icon-end': collapseContext?.expandIconPosition.value === 'end' }"
      @click="handleClick"
    >
      <span class="collapse-expand-icon" :class="{ 'collapse-expand-icon-active': active }">
        <slot name="expandIcon">
          <IconLib name="chevron-right" :size="14" />
        </slot>
      </span>
      <span class="collapse-header-text">
        <slot name="header">{{ header }}</slot>
      </span>
      <span v-if="extra || $slots.extra" class="collapse-extra" @click.stop>
        <slot name="extra">{{ extra }}</slot>
      </span>
    </div>
    <Transition
      name="collapse-content"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div v-show="active" class="collapse-content-wrapper">
        <div class="collapse-content">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ComputedRef, Ref } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface CollapseContext {
  activeKeys: Ref<string[]>
  toggle: (key: string) => void
  isActive: (key: string) => boolean
  bordered: ComputedRef<boolean>
  ghost: ComputedRef<boolean>
  expandIconPosition: ComputedRef<'start' | 'end'>
}

interface Props {
  name: string
  header?: string
  extra?: string
  disabled?: boolean
  showArrow?: boolean
  forceRender?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  header: '',
  extra: '',
  disabled: false,
  showArrow: true,
  forceRender: false
})

const collapseContext = inject<CollapseContext>('collapse')

// 是否激活
const active = computed(() => {
  return collapseContext?.isActive(props.name) ?? false
})

// 点击处理
const handleClick = () => {
  if (props.disabled) return
  collapseContext?.toggle(props.name)
}

// 展开动画
const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.overflow = 'hidden'
  // 强制重绘
  void element.offsetHeight
  element.style.height = `${element.scrollHeight}px`
}

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = ''
  element.style.overflow = ''
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  element.style.overflow = 'hidden'
  // 强制重绘
  void element.offsetHeight
  element.style.height = '0'
}

const onAfterLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = ''
  element.style.overflow = ''
}
</script>

<style scoped>
.collapse-panel {
  border-bottom: 1px solid #d9d9d9;
}

.collapse-panel:last-child {
  border-bottom: none;
}

.collapse-panel-bordered {
  border: 1px solid #d9d9d9;
  border-bottom: none;
}

.collapse-panel-bordered:first-child {
  border-radius: 8px 8px 0 0;
}

.collapse-panel-bordered:last-child {
  border-bottom: 1px solid #d9d9d9;
  border-radius: 0 0 8px 8px;
}

.collapse-panel-bordered:only-child {
  border-radius: 8px;
}

.collapse-panel-ghost {
  border: none;
  background: transparent;
}

.collapse-panel-ghost .collapse-header {
  background: transparent;
}

.collapse-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fafafa;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.collapse-header:hover {
  background-color: #f5f5f5;
}

.collapse-panel-disabled .collapse-header {
  cursor: not-allowed;
  opacity: 0.5;
}

.collapse-panel-disabled .collapse-header:hover {
  background-color: #fafafa;
}

.collapse-header-icon-end {
  flex-direction: row-reverse;
}

.collapse-header-icon-end .collapse-expand-icon {
  margin-left: auto;
  margin-right: 0;
}

.collapse-expand-icon {
  display: flex;
  align-items: center;
  margin-right: 12px;
  color: rgba(0, 0, 0, 0.45);
  transition: transform 0.2s;
}

.collapse-expand-icon-active {
  transform: rotate(90deg);
}

.collapse-header-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}

.collapse-extra {
  margin-left: auto;
  color: rgba(0, 0, 0, 0.45);
}

.collapse-content-wrapper {
  overflow: hidden;
}

.collapse-content {
  padding: 16px;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.65);
}

/* 动画 */
.collapse-content-enter-active,
.collapse-content-leave-active {
  transition: height 0.2s ease-in-out;
}
</style>
