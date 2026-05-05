<template>
  <div 
    class="copy-text"
    :class="{ 
      'copy-text--block': block,
      'copy-text--copied': copied
    }"
    @click="handleCopy"
  >
    <span class="copy-text__content">
      <slot>{{ text }}</slot>
    </span>
    <span class="copy-text__icon" :title="copied ? '已复制' : '点击复制'">
      <IconLib :name="copied ? 'check' : 'copy'" :size="14" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 要复制的文本
  text?: string
  // 复制成功提示
  successText?: string
  // 是否块级显示
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  successText: '已复制',
  block: false
})

const emit = defineEmits<{
  (e: 'copy', text: string): void
  (e: 'success', text: string): void
  (e: 'error', error: Error): void
}>()

const copied = ref(false)

// 复制处理
async function handleCopy() {
  try {
    const textToCopy = props.text || document.querySelector('.copy-text__content')?.textContent || ''
    
    await navigator.clipboard.writeText(textToCopy.trim())
    
    copied.value = true
    emit('copy', textToCopy)
    emit('success', textToCopy)
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    emit('error', error as Error)
    console.error('复制失败:', error)
  }
}
</script>

<style scoped>
.copy-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.2s;
}

.copy-text:hover {
  color: var(--primary-color, #4B6EF5);
}

.copy-text--block {
  display: flex;
  width: 100%;
}

.copy-text__content {
  flex: 1;
}

.copy-text__icon {
  display: flex;
  align-items: center;
  color: var(--text-secondary, #909399);
  transition: color 0.2s;
}

.copy-text:hover .copy-text__icon {
  color: var(--primary-color, #4B6EF5);
}

.copy-text--copied .copy-text__icon {
  color: var(--success-color, #67c23a);
}
</style>
