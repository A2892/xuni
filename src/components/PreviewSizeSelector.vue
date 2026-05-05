<template>
  <div class="preview-size-selector">
    <label>预览尺寸</label>
    <div class="size-buttons">
      <button 
        v-for="size in sizes" 
        :key="size.value"
        :class="['size-btn', { active: modelValue === size.value }]"
        @click="$emit('update:modelValue', size.value)"
        :title="size.tooltip"
      >
        <span class="size-icon">{{ size.icon }}</span>
        <span class="size-label">{{ size.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export type PreviewSize = 'mobile' | 'desktop' | 'original' | 'iphone'

defineProps<{
  modelValue: PreviewSize
}>()

defineEmits<{
  'update:modelValue': [value: PreviewSize]
}>()

const sizes = [
  { value: 'mobile' as PreviewSize, label: '手机', icon: '📱', tooltip: '手机尺寸 (375px)' },
  { value: 'iphone' as PreviewSize, label: 'iPhone', icon: '', tooltip: 'iPhone 17 Pro 截图 (393px)' },
  { value: 'desktop' as PreviewSize, label: '电脑', icon: '💻', tooltip: '电脑尺寸 (900px)' },
  { value: 'original' as PreviewSize, label: '原尺寸', icon: '📄', tooltip: '原始尺寸' }
]
</script>

<style scoped>
.preview-size-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-size-selector label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.size-buttons {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  padding: 3px;
  border-radius: 8px;
}

.size-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.size-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.size-icon {
  font-size: 14px;
}

.size-label {
  font-size: 12px;
}
</style>
