<template>
  <button
    class="button"
    :class="[
      `button--${type}`,
      `button--${size}`,
      `button--${shape}`,
      { 'button--disabled': disabled || loading },
      { 'button--loading': loading },
      { 'button--block': block },
      { 'button--ghost': ghost },
      { 'button--plain': plain },
      { 'button--dashed': dashed }
    ]"
    :type="nativeType"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- 加载图标 -->
    <span v-if="loading" class="button__loading">
      <IconLib name="loader" :size="iconSize" class="button__loading-icon" />
    </span>
    
    <!-- 前置图标 -->
    <IconLib
      v-if="icon && !loading"
      :name="icon"
      :size="iconSize"
      class="button__icon"
    />
    
    <!-- 内容 -->
    <span v-if="$slots.default" class="button__content">
      <slot />
    </span>
    
    <!-- 后置图标 -->
    <IconLib
      v-if="suffixIcon"
      :name="suffixIcon"
      :size="iconSize"
      class="button__icon"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 按钮类型
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'link'
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 形状
  shape?: 'default' | 'round' | 'circle' | 'square'
  // 原生类型
  nativeType?: 'button' | 'submit' | 'reset'
  // 是否禁用
  disabled?: boolean
  // 是否加载中
  loading?: boolean
  // 是否块级元素
  block?: boolean
  // 是否幽灵按钮
  ghost?: boolean
  // 是否朴素按钮
  plain?: boolean
  // 是否虚线边框
  dashed?: boolean
  // 前置图标
  icon?: string
  // 后置图标
  suffixIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'default',
  shape: 'default',
  nativeType: 'button',
  disabled: false,
  loading: false,
  block: false,
  ghost: false,
  plain: false,
  dashed: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

// 图标大小
const iconSize = computed(() => {
  switch (props.size) {
    case 'small': return 14
    case 'large': return 18
    default: return 16
  }
})

// 点击处理
function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  outline: none;
}

/* 尺寸 */
.button--small {
  padding: 4px 12px;
  font-size: 12px;
}

.button--large {
  padding: 12px 20px;
  font-size: 16px;
}

/* 形状 */
.button--round {
  border-radius: 32px;
}

.button--circle {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
}

.button--circle.button--small {
  width: 24px;
  height: 24px;
}

.button--circle.button--large {
  width: 40px;
  height: 40px;
}

.button--square {
  width: 32px;
  height: 32px;
  padding: 0;
}

.button--square.button--small {
  width: 24px;
  height: 24px;
}

.button--square.button--large {
  width: 40px;
  height: 40px;
}

/* 块级 */
.button--block {
  display: flex;
  width: 100%;
}

/* 默认类型 */
.button--default {
  background: #fff;
  border-color: #d9d9d9;
  color: #333;
}

.button--default:hover:not(.button--disabled) {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.button--default:active:not(.button--disabled) {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

/* 主要类型 */
.button--primary {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.button--primary:hover:not(.button--disabled) {
  background: #6b8af7;
  border-color: #6b8af7;
}

.button--primary:active:not(.button--disabled) {
  background: #3a5bd9;
  border-color: #3a5bd9;
}

/* 成功类型 */
.button--success {
  background: #52c41a;
  border-color: #52c41a;
  color: #fff;
}

.button--success:hover:not(.button--disabled) {
  background: #73d13d;
  border-color: #73d13d;
}

.button--success:active:not(.button--disabled) {
  background: #389e0d;
  border-color: #389e0d;
}

/* 警告类型 */
.button--warning {
  background: #faad14;
  border-color: #faad14;
  color: #fff;
}

.button--warning:hover:not(.button--disabled) {
  background: #ffc53d;
  border-color: #ffc53d;
}

.button--warning:active:not(.button--disabled) {
  background: #d48806;
  border-color: #d48806;
}

/* 危险类型 */
.button--danger {
  background: #ff4d4f;
  border-color: #ff4d4f;
  color: #fff;
}

.button--danger:hover:not(.button--disabled) {
  background: #ff7875;
  border-color: #ff7875;
}

.button--danger:active:not(.button--disabled) {
  background: #d9363e;
  border-color: #d9363e;
}

/* 信息类型 */
.button--info {
  background: #909399;
  border-color: #909399;
  color: #fff;
}

.button--info:hover:not(.button--disabled) {
  background: #a6a9ad;
  border-color: #a6a9ad;
}

.button--info:active:not(.button--disabled) {
  background: #82848a;
  border-color: #82848a;
}

/* 文本类型 */
.button--text {
  background: transparent;
  border-color: transparent;
  color: #333;
  padding-left: 0;
  padding-right: 0;
}

.button--text:hover:not(.button--disabled) {
  color: var(--primary-color, #4B6EF5);
  background: transparent;
}

/* 链接类型 */
.button--link {
  background: transparent;
  border-color: transparent;
  color: var(--primary-color, #4B6EF5);
  padding-left: 0;
  padding-right: 0;
}

.button--link:hover:not(.button--disabled) {
  color: #6b8af7;
}

/* 朴素按钮 */
.button--plain.button--primary {
  background: rgba(75, 110, 245, 0.1);
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.button--plain.button--primary:hover:not(.button--disabled) {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

.button--plain.button--success {
  background: rgba(82, 196, 26, 0.1);
  border-color: #52c41a;
  color: #52c41a;
}

.button--plain.button--success:hover:not(.button--disabled) {
  background: #52c41a;
  color: #fff;
}

.button--plain.button--warning {
  background: rgba(250, 173, 20, 0.1);
  border-color: #faad14;
  color: #faad14;
}

.button--plain.button--warning:hover:not(.button--disabled) {
  background: #faad14;
  color: #fff;
}

.button--plain.button--danger {
  background: rgba(255, 77, 79, 0.1);
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.button--plain.button--danger:hover:not(.button--disabled) {
  background: #ff4d4f;
  color: #fff;
}

/* 幽灵按钮 */
.button--ghost {
  background: transparent;
}

.button--ghost.button--primary {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.button--ghost.button--primary:hover:not(.button--disabled) {
  background: rgba(75, 110, 245, 0.1);
}

/* 虚线边框 */
.button--dashed {
  border-style: dashed;
}

/* 禁用状态 */
.button--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 加载状态 */
.button__loading {
  display: flex;
  align-items: center;
}

.button__loading-icon {
  animation: button-spin 1s linear infinite;
}

@keyframes button-spin {
  to {
    transform: rotate(360deg);
  }
}

.button__icon {
  flex-shrink: 0;
}

.button__content {
  display: inline-flex;
  align-items: center;
}
</style>
