<template>
  <div class="collapse">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, watch, computed } from 'vue'

interface Props {
  modelValue?: string | string[]
  accordion?: boolean
  bordered?: boolean
  ghost?: boolean
  expandIconPosition?: 'start' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accordion: false,
  bordered: true,
  ghost: false,
  expandIconPosition: 'start'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  change: [key: string | string[]]
}>()

// 当前激活的面板
const activeKeys = ref<string[]>(
  Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : []
)

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  activeKeys.value = Array.isArray(val) ? val : val ? [val] : []
})

// 判断面板是否激活
const isActive = (key: string) => {
  return activeKeys.value.includes(key)
}

// 切换面板
const toggle = (key: string) => {
  if (props.accordion) {
    // 手风琴模式
    activeKeys.value = isActive(key) ? [] : [key]
  } else {
    // 普通模式
    if (isActive(key)) {
      activeKeys.value = activeKeys.value.filter(k => k !== key)
    } else {
      activeKeys.value = [...activeKeys.value, key]
    }
  }
  
  const value = props.accordion 
    ? (activeKeys.value[0] || '') 
    : activeKeys.value
  
  emit('update:modelValue', value)
  emit('change', value)
}

// 提供给子组件的上下文
provide('collapse', {
  activeKeys,
  toggle,
  isActive,
  bordered: computed(() => props.bordered),
  ghost: computed(() => props.ghost),
  expandIconPosition: computed(() => props.expandIconPosition)
})
</script>

<style scoped>
.collapse {
  border-radius: 8px;
  background-color: #fafafa;
}
</style>
