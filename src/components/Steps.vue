<template>
  <div class="steps" :class="[`steps-${direction}`, `steps-${size}`]">
    <div 
      v-for="(step, index) in steps"
      :key="index"
      class="step-item"
      :class="{
        'is-active': index === current,
        'is-completed': index < current,
        'is-error': step.status === 'error',
        'is-waiting': index > current,
        'is-clickable': clickable && index <= current + 1
      }"
      @click="handleClick(index)"
    >
      <!-- 连接线 -->
      <div v-if="index < steps.length - 1" class="step-line">
        <div class="step-line-inner" :style="getLineStyle(index)"></div>
      </div>
      
      <!-- 图标 -->
      <div class="step-icon">
        <slot :name="`icon-${index}`" :step="step" :index="index">
          <template v-if="step.status === 'error'">
            <IconLib name="x" :size="iconSize" />
          </template>
          <template v-else-if="index < current">
            <IconLib v-if="finishIcon" :name="finishIcon" :size="iconSize" />
            <IconLib v-else name="check" :size="iconSize" />
          </template>
          <template v-else-if="step.icon">
            <IconLib :name="step.icon" :size="iconSize" />
          </template>
          <template v-else>
            <span class="step-number">{{ index + 1 }}</span>
          </template>
        </slot>
      </div>
      
      <!-- 内容 -->
      <div class="step-content">
        <div class="step-title">
          <slot :name="`title-${index}`" :step="step" :index="index">
            {{ step.title }}
          </slot>
        </div>
        <div v-if="step.description" class="step-description">
          <slot :name="`description-${index}`" :step="step" :index="index">
            {{ step.description }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
interface StepItem {
  title: string
  description?: string
  icon?: string
  status?: 'wait' | 'process' | 'finish' | 'error'
}

// Props
interface Props {
  steps: StepItem[]
  current: number
  direction?: 'horizontal' | 'vertical'
  size?: 'small' | 'default' | 'large'
  clickable?: boolean
  finishIcon?: string
  progressDot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  current: 0,
  direction: 'horizontal',
  size: 'default',
  clickable: false,
  progressDot: false
})

// Emits
const emit = defineEmits<{
  'update:current': [index: number]
  'change': [index: number]
}>()

// Computed
const iconSize = computed(() => {
  const sizes = { small: 14, default: 16, large: 20 }
  return sizes[props.size]
})

// Methods
function getLineStyle(index: number): Record<string, string> {
  if (index < props.current) {
    return { width: '100%' }
  }
  return {}
}

function handleClick(index: number) {
  if (!props.clickable) return
  if (index > props.current + 1) return
  
  emit('update:current', index)
  emit('change', index)
}
</script>

<style scoped>
.steps {
  display: flex;
}

/* 水平方向 */
.steps-horizontal {
  flex-direction: row;
}

.steps-horizontal .step-item {
  flex: 1;
  position: relative;
}

.steps-horizontal .step-line {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #e8e8e8;
}

.steps-horizontal .step-line-inner {
  height: 100%;
  background: var(--primary-color, #4B6EF5);
  transition: width 0.3s;
}

.steps-horizontal .step-content {
  text-align: center;
}

/* 垂直方向 */
.steps-vertical {
  flex-direction: column;
}

.steps-vertical .step-item {
  position: relative;
  padding-bottom: 24px;
}

.steps-vertical .step-item:last-child {
  padding-bottom: 0;
}

.steps-vertical .step-line {
  position: absolute;
  top: 36px;
  left: 15px;
  width: 2px;
  height: calc(100% - 24px);
  background: #e8e8e8;
}

.steps-vertical .step-line-inner {
  width: 100%;
  background: var(--primary-color, #4B6EF5);
  transition: height 0.3s;
}

.steps-vertical .step-item {
  display: flex;
  gap: 12px;
}

.steps-vertical .step-content {
  flex: 1;
  padding-top: 4px;
}

/* 步骤图标 */
.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #e8e8e8;
  color: #999;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
  margin: 0 auto 8px;
}

.steps-vertical .step-icon {
  margin: 0;
  flex-shrink: 0;
}

.step-number {
  line-height: 1;
}

/* 状态：当前 */
.step-item.is-active .step-icon {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.step-item.is-active .step-title {
  color: var(--primary-color, #4B6EF5);
}

/* 状态：已完成 */
.step-item.is-completed .step-icon {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: white;
}

/* 状态：错误 */
.step-item.is-error .step-icon {
  background: #ff4d4f;
  border-color: #ff4d4f;
  color: white;
}

.step-item.is-error .step-title {
  color: #ff4d4f;
}

/* 状态：可点击 */
.step-item.is-clickable {
  cursor: pointer;
}

.step-item.is-clickable:hover .step-icon {
  border-color: var(--primary-color, #4B6EF5);
}

/* 内容 */
.step-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: color 0.3s;
}

.step-item.is-waiting .step-title {
  color: #999;
}

.step-description {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 尺寸：小 */
.steps-small .step-icon {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.steps-small.steps-horizontal .step-line {
  top: 12px;
}

.steps-small.steps-vertical .step-line {
  top: 28px;
  left: 11px;
}

.steps-small .step-title {
  font-size: 13px;
}

.steps-small .step-description {
  font-size: 11px;
}

/* 尺寸：大 */
.steps-large .step-icon {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.steps-large.steps-horizontal .step-line {
  top: 20px;
}

.steps-large.steps-vertical .step-line {
  top: 44px;
  left: 19px;
}

.steps-large .step-title {
  font-size: 16px;
}

.steps-large .step-description {
  font-size: 13px;
}
</style>
