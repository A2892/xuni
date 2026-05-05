<template>
  <div
    class="steps"
    :class="[
      `steps-${direction}`,
      `steps-${size}`,
      `steps-${labelPlacement}`,
      { 'steps-dot': progressDot }
    ]"
  >
    <div
      v-for="(step, index) in items"
      :key="index"
      class="step"
      :class="getStepClass(index)"
      @click="handleStepClick(index)"
    >
      <!-- 图标/数字 -->
      <div class="step-icon-container">
        <span v-if="progressDot" class="step-dot" />
        <span v-else class="step-icon">
          <slot :name="`icon-${index}`">
            <template v-if="getStepStatus(index) === 'finish'">
              <IconLib name="check" :size="16" />
            </template>
            <template v-else-if="getStepStatus(index) === 'error'">
              <IconLib name="close" :size="16" />
            </template>
            <template v-else-if="step.icon">
              <IconLib :name="step.icon" :size="16" />
            </template>
            <template v-else>
              {{ index + 1 }}
            </template>
          </slot>
        </span>
        <!-- 连接线 -->
        <div v-if="index < items.length - 1" class="step-tail">
          <div class="step-tail-inner" :style="getTailStyle(index)" />
        </div>
      </div>
      
      <!-- 内容 -->
      <div class="step-content">
        <div class="step-title">
          {{ step.title }}
          <span v-if="step.subTitle" class="step-subtitle">{{ step.subTitle }}</span>
        </div>
        <div v-if="step.description" class="step-description">
          {{ step.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface StepItem {
  title: string
  subTitle?: string
  description?: string
  icon?: string
  status?: 'wait' | 'process' | 'finish' | 'error'
  disabled?: boolean
}

interface Props {
  current?: number
  items?: StepItem[]
  direction?: 'horizontal' | 'vertical'
  labelPlacement?: 'horizontal' | 'vertical'
  progressDot?: boolean
  size?: 'default' | 'small'
  status?: 'wait' | 'process' | 'finish' | 'error'
  percent?: number
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  current: 0,
  items: () => [],
  direction: 'horizontal',
  labelPlacement: 'horizontal',
  progressDot: false,
  size: 'default',
  status: 'process',
  percent: 0,
  clickable: false
})

const emit = defineEmits<{
  'update:current': [step: number]
  change: [step: number]
}>()

// 获取步骤状态
const getStepStatus = (index: number): 'wait' | 'process' | 'finish' | 'error' => {
  const item = props.items[index]
  
  // 如果步骤有自定义状态，使用自定义状态
  if (item.status) return item.status
  
  // 根据当前步骤判断状态
  if (index < props.current) return 'finish'
  if (index === props.current) return props.status
  return 'wait'
}

// 获取步骤类名
const getStepClass = (index: number) => {
  const status = getStepStatus(index)
  return [
    `step-${status}`,
    {
      'step-clickable': props.clickable && !props.items[index].disabled
    }
  ]
}

// 获取连接线样式（用于进度）
const getTailStyle = (index: number) => {
  const status = getStepStatus(index)
  
  if (status === 'finish') {
    return { width: '100%' }
  }
  
  if (status === 'process' && props.percent > 0) {
    return { width: `${props.percent}%` }
  }
  
  return { width: '0%' }
}

// 点击步骤
const handleStepClick = (index: number) => {
  if (!props.clickable || props.items[index].disabled) return
  
  emit('update:current', index)
  emit('change', index)
}
</script>

<style scoped>
.steps {
  display: flex;
  width: 100%;
}

.steps-vertical {
  flex-direction: column;
}

.steps-horizontal {
  flex-direction: row;
}

/* 单个步骤 */
.step {
  flex: 1;
  position: relative;
  display: flex;
  vertical-align: top;
}

.steps-horizontal .step {
  flex-direction: column;
}

.steps-horizontal.steps-label-horizontal .step {
  flex-direction: row;
}

.steps-vertical .step {
  flex: none;
  flex-direction: row;
  padding-bottom: 24px;
}

.step-clickable {
  cursor: pointer;
}

/* 图标容器 */
.step-icon-container {
  position: relative;
  display: flex;
  align-items: center;
}

.steps-horizontal .step-icon-container {
  margin-right: 8px;
}

.steps-horizontal:not(.steps-label-horizontal) .step-icon-container {
  margin: 0 auto 8px;
}

.steps-vertical .step-icon-container {
  flex-direction: column;
  margin-right: 16px;
}

/* 图标 */
.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.25);
  background-color: #fff;
  color: rgba(0, 0, 0, 0.25);
  transition: all 0.3s;
}

.steps-small .step-icon {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

/* 点状 */
.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.25);
  transition: all 0.3s;
}

/* 连接线 */
.step-tail {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.step-tail-inner {
  height: 100%;
  width: 0;
  background-color: var(--primary-color, #4B6EF5);
  transition: width 0.3s;
}

.steps-horizontal .step-tail {
  top: 50%;
  left: 100%;
  width: calc(100% - 32px);
  height: 1px;
  margin-left: 8px;
  transform: translateY(-50%);
}

.steps-horizontal:not(.steps-label-horizontal) .step-tail {
  top: 16px;
  left: calc(50% + 20px);
  width: calc(100% - 40px);
  margin-left: 0;
  transform: none;
}

.steps-vertical .step-tail {
  top: 40px;
  left: 16px;
  width: 1px;
  height: calc(100% - 40px);
  transform: translateX(-50%);
}

.steps-vertical .step-tail-inner {
  width: 100%;
  height: 0;
}

/* 内容 */
.step-content {
  flex: 1;
  min-width: 0;
}

.steps-horizontal:not(.steps-label-horizontal) .step-content {
  text-align: center;
}

.step-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.45);
  line-height: 32px;
  transition: color 0.3s;
}

.steps-small .step-title {
  font-size: 14px;
  line-height: 24px;
}

.step-subtitle {
  margin-left: 8px;
  font-size: 14px;
  font-weight: normal;
  color: rgba(0, 0, 0, 0.45);
}

.step-description {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
}

/* 状态样式 */
.step-process .step-icon {
  border-color: var(--primary-color, #4B6EF5);
  background-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.step-process .step-dot {
  background-color: var(--primary-color, #4B6EF5);
}

.step-process .step-title {
  color: rgba(0, 0, 0, 0.88);
}

.step-finish .step-icon {
  border-color: var(--primary-color, #4B6EF5);
  background-color: #fff;
  color: var(--primary-color, #4B6EF5);
}

.step-finish .step-dot {
  background-color: var(--primary-color, #4B6EF5);
}

.step-finish .step-title {
  color: rgba(0, 0, 0, 0.45);
}

.step-error .step-icon {
  border-color: #ff4d4f;
  background-color: #fff;
  color: #ff4d4f;
}

.step-error .step-dot {
  background-color: #ff4d4f;
}

.step-error .step-title {
  color: #ff4d4f;
}
</style>
