<template>
  <div 
    class="segmented"
    :class="[
      `segmented--${size}`,
      { 
        'segmented--block': block,
        'segmented--disabled': disabled
      }
    ]"
    role="radiogroup"
  >
    <div 
      class="segmented__indicator"
      :style="indicatorStyle"
    ></div>
    
    <div
      v-for="(option, index) in normalizedOptions"
      :key="option.value"
      ref="itemRefs"
      class="segmented__item"
      :class="{
        'segmented__item--selected': modelValue === option.value,
        'segmented__item--disabled': option.disabled || disabled
      }"
      role="radio"
      :aria-checked="modelValue === option.value"
      @click="handleSelect(option, index)"
    >
      <span v-if="option.icon" class="segmented__icon">
        <IconLib :name="option.icon" :size="14" />
      </span>
      <span class="segmented__label">{{ option.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface SegmentedOption {
  label: string
  value: string | number
  icon?: string
  disabled?: boolean
}

interface Props {
  // 绑定值
  modelValue?: string | number
  // 选项
  options?: (string | number | SegmentedOption)[]
  // 是否撑满
  block?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 禁用
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  block: false,
  size: 'default',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

const itemRefs = ref<HTMLElement[]>([])
const indicatorStyle = ref({})

// 规范化选项
const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return {
        label: String(option),
        value: option
      }
    }
    return option
  }) as SegmentedOption[]
})

// 当前选中索引
const selectedIndex = computed(() => {
  return normalizedOptions.value.findIndex(option => option.value === props.modelValue)
})

// 更新指示器位置
function updateIndicator() {
  nextTick(() => {
    const index = selectedIndex.value
    if (index === -1 || !itemRefs.value[index]) {
      indicatorStyle.value = { opacity: 0 }
      return
    }
    
    const item = itemRefs.value[index]
    indicatorStyle.value = {
      width: `${item.offsetWidth}px`,
      transform: `translateX(${item.offsetLeft}px)`,
      opacity: 1
    }
  })
}

// 选择处理
function handleSelect(option: SegmentedOption, index: number) {
  if (option.disabled || props.disabled) return
  
  emit('update:modelValue', option.value)
  emit('change', option.value)
}

// 监听选中值变化
watch(selectedIndex, updateIndicator, { immediate: true })

onMounted(updateIndicator)
</script>

<style scoped>
.segmented {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  padding: 2px;
  background: var(--bg-hover, #f5f7fa);
  border-radius: 8px;
  gap: 2px;
}

.segmented__indicator {
  position: absolute;
  top: 2px;
  left: 0;
  height: calc(100% - 4px);
  background: var(--bg-color, #fff);
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.segmented__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 16px;
  font-size: 14px;
  color: var(--text-secondary, #606266);
  cursor: pointer;
  transition: color 0.2s;
  z-index: 1;
  user-select: none;
}

.segmented__item:hover:not(.segmented__item--disabled) {
  color: var(--text-color, #303133);
}

.segmented__item--selected {
  color: var(--text-color, #303133);
  font-weight: 500;
}

.segmented__item--disabled {
  color: var(--text-disabled, #c0c4cc);
  cursor: not-allowed;
}

.segmented__icon {
  display: flex;
  align-items: center;
}

.segmented__label {
  white-space: nowrap;
}

/* 撑满 */
.segmented--block {
  display: flex;
  width: 100%;
}

.segmented--block .segmented__item {
  flex: 1;
}

/* 尺寸 */
.segmented--small {
  border-radius: 6px;
}

.segmented--small .segmented__indicator {
  border-radius: 4px;
}

.segmented--small .segmented__item {
  padding: 4px 12px;
  font-size: 12px;
}

.segmented--large {
  border-radius: 10px;
}

.segmented--large .segmented__indicator {
  border-radius: 8px;
}

.segmented--large .segmented__item {
  padding: 10px 24px;
  font-size: 16px;
}

/* 禁用 */
.segmented--disabled {
  opacity: 0.6;
}

.segmented--disabled .segmented__item {
  cursor: not-allowed;
}
</style>
