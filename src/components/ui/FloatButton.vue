<template>
  <button
    type="button"
    class="float-button"
    :class="[
      `float-button--${type}`,
      `float-button--${shape}`,
      {
        'float-button--badge': badge
      }
    ]"
    :style="positionStyle"
    @click="handleClick"
  >
    <span v-if="badge" class="float-button__badge">
      {{ badge > 99 ? '99+' : badge }}
    </span>
    
    <span class="float-button__icon">
      <slot name="icon">
        <IconLib :name="icon || 'plus'" :size="iconSize" />
      </slot>
    </span>
    
    <span v-if="$slots.default || tooltip" class="float-button__content">
      <slot>{{ tooltip }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 类型
  type?: 'primary' | 'default'
  // 形状
  shape?: 'circle' | 'square'
  // 图标
  icon?: string
  // 图标大小
  iconSize?: number
  // 提示文字
  tooltip?: string
  // 角标数字
  badge?: number
  // 距离右侧
  right?: number
  // 距离底部
  bottom?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  shape: 'circle',
  iconSize: 24,
  right: 24,
  bottom: 24
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const positionStyle = computed(() => ({
  right: `${props.right}px`,
  bottom: `${props.bottom}px`
}))

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<style scoped>
.float-button {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* 形状 */
.float-button--circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

.float-button--square {
  width: 56px;
  height: 56px;
  border-radius: 12px;
}

/* 类型 */
.float-button--primary {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

.float-button--primary:hover {
  background: var(--primary-hover, #3b5de7);
  transform: scale(1.05);
}

.float-button--default {
  background: var(--bg-color, #fff);
  color: var(--text-color, #303133);
}

.float-button--default:hover {
  color: var(--primary-color, #4B6EF5);
  transform: scale(1.05);
}

/* 图标 */
.float-button__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 内容 */
.float-button__content {
  font-size: 12px;
  margin-top: 2px;
  max-width: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 角标 */
.float-button__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  border-radius: 10px;
}
</style>
