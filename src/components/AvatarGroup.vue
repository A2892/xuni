<template>
  <div class="avatar-group" :class="{ 'avatar-group--stack': stack }">
    <div class="avatar-list" :style="{ '--offset': `${offset}px` }">
      <slot></slot>
      
      <!-- 超出数量显示 -->
      <div 
        v-if="excess > 0" 
        class="avatar avatar-excess"
        :style="excessStyle"
      >
        <span class="excess-text">+{{ excess }}</span>
      </div>
    </div>
    
    <!-- 添加按钮 -->
    <button 
      v-if="addable" 
      type="button"
      class="avatar avatar-add"
      :style="addStyle"
      @click="$emit('add')"
    >
      <IconLib name="plus" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  stack?: boolean
  offset?: number
  addable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 5,
  size: 'md',
  stack: true,
  offset: -8
})

defineEmits<{
  add: []
}>()

const slots = useSlots()

const sizeMap: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80
}

const actualSize = computed(() => {
  if (typeof props.size === 'number') return props.size
  return sizeMap[props.size] || 40
})

const excess = computed(() => {
  const defaultSlot = slots.default?.()
  if (!defaultSlot) return 0
  return Math.max(0, defaultSlot.length - props.max)
})

const excessStyle = computed(() => ({
  width: `${actualSize.value}px`,
  height: `${actualSize.value}px`,
  fontSize: `${Math.floor(actualSize.value * 0.35)}px`
}))

const addStyle = computed(() => ({
  width: `${actualSize.value}px`,
  height: `${actualSize.value}px`
}))
</script>

<style scoped>
.avatar-group {
  display: inline-flex;
  align-items: center;
}

.avatar-list {
  display: flex;
  align-items: center;
}

.avatar-group--stack .avatar-list > :deep(*:not(:first-child)) {
  margin-left: var(--offset, -8px);
}

.avatar-group--stack .avatar-list > :deep(*) {
  border: 2px solid #fff;
  box-sizing: content-box;
}

.avatar-group--stack .avatar-list > :deep(*:hover) {
  z-index: 1;
  transform: translateY(-2px);
}

.avatar-excess {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color-secondary, #e5e7eb);
  color: var(--text-color-secondary, #666);
  border-radius: 50%;
  font-weight: 500;
  border: 2px solid #fff;
  box-sizing: content-box;
}

.excess-text {
  line-height: 1;
}

.avatar-add {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color-secondary, #f3f4f6);
  border: 2px dashed var(--border-color, #d1d5db);
  border-radius: 50%;
  color: var(--text-color-muted, #9ca3af);
  cursor: pointer;
  margin-left: 0.5rem;
  transition: all 0.2s ease;
}

.avatar-add:hover {
  background: var(--primary-color-light, #e8edfd);
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}
</style>
