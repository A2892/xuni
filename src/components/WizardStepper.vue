<template>
  <div class="wizard-stepper">
    <!-- 步骤指示器 -->
    <div class="steps-indicator" :class="[`layout-${layout}`, `variant-${variant}`]">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        :class="[
          'step-item',
          { 
            completed: index < currentStep,
            active: index === currentStep,
            disabled: index > currentStep && !allowSkip
          }
        ]"
        @click="handleStepClick(index)"
      >
        <!-- 步骤连接线 -->
        <div v-if="index > 0" class="step-line">
          <div 
            class="line-progress" 
            :style="{ 
              width: index <= currentStep ? '100%' : '0%' 
            }"
          ></div>
        </div>
        
        <!-- 步骤图标 -->
        <div class="step-icon">
          <template v-if="index < currentStep">
            <IconLib name="check" :size="16" />
          </template>
          <template v-else-if="step.icon">
            <IconLib :name="step.icon" :size="18" />
          </template>
          <template v-else>
            {{ index + 1 }}
          </template>
        </div>
        
        <!-- 步骤信息 -->
        <div v-if="layout !== 'compact'" class="step-info">
          <div class="step-title">{{ step.title }}</div>
          <div v-if="step.description" class="step-description">
            {{ step.description }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 步骤内容 -->
    <div class="step-content">
      <transition :name="transitionName" mode="out-in">
        <div :key="currentStep" class="content-wrapper">
          <slot :name="`step-${currentStep}`" :step="currentStepData">
            <div class="default-content">
              <h2>{{ currentStepData?.title }}</h2>
              <p>{{ currentStepData?.description }}</p>
            </div>
          </slot>
        </div>
      </transition>
    </div>
    
    <!-- 操作按钮 -->
    <div v-if="showNavigation" class="step-actions">
      <button 
        v-if="currentStep > 0"
        class="btn btn-secondary"
        @click="prevStep"
        :disabled="loading"
      >
        <IconLib name="chevron-left" :size="16" />
        {{ prevText }}
      </button>
      
      <div class="action-spacer"></div>
      
      <slot name="extra-actions"></slot>
      
      <button 
        v-if="currentStep < steps.length - 1"
        class="btn btn-primary"
        @click="nextStep"
        :disabled="loading || !canProceed"
      >
        <span v-if="loading" class="spinner"></span>
        {{ nextText }}
        <IconLib v-if="!loading" name="chevron-right" :size="16" />
      </button>
      
      <button 
        v-else
        class="btn btn-success"
        @click="handleComplete"
        :disabled="loading || !canProceed"
      >
        <span v-if="loading" class="spinner"></span>
        {{ completeText }}
        <IconLib v-if="!loading" name="check" :size="16" />
      </button>
    </div>
    
    <!-- 进度条 -->
    <div v-if="showProgress" class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
interface Step {
  title: string
  description?: string
  icon?: string
  validate?: () => boolean | Promise<boolean>
}

// Props
interface Props {
  steps: Step[]
  modelValue?: number
  layout?: 'horizontal' | 'vertical' | 'compact'
  variant?: 'default' | 'dots' | 'simple'
  allowSkip?: boolean
  showNavigation?: boolean
  showProgress?: boolean
  loading?: boolean
  canProceed?: boolean
  prevText?: string
  nextText?: string
  completeText?: string
  transition?: 'slide' | 'fade' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  layout: 'horizontal',
  variant: 'default',
  allowSkip: false,
  showNavigation: true,
  showProgress: false,
  loading: false,
  canProceed: true,
  prevText: '上一步',
  nextText: '下一步',
  completeText: '完成',
  transition: 'slide'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [step: number]
  'step-change': [from: number, to: number]
  'step-click': [step: number]
  'complete': []
  'validate': [step: number, valid: boolean]
}>()

// State
const currentStep = ref(props.modelValue)
const direction = ref<'forward' | 'backward'>('forward')

// Computed
const currentStepData = computed(() => props.steps[currentStep.value])

const progress = computed(() => {
  return ((currentStep.value + 1) / props.steps.length) * 100
})

const transitionName = computed(() => {
  if (props.transition === 'none') return ''
  if (props.transition === 'fade') return 'fade'
  return direction.value === 'forward' ? 'slide-left' : 'slide-right'
})

// Methods
async function validateStep(step: number): Promise<boolean> {
  const stepData = props.steps[step]
  if (!stepData.validate) return true
  
  try {
    const result = await stepData.validate()
    emit('validate', step, result)
    return result
  } catch {
    emit('validate', step, false)
    return false
  }
}

async function goToStep(step: number): Promise<boolean> {
  if (step < 0 || step >= props.steps.length) return false
  if (step === currentStep.value) return false
  
  // 如果向前跳，需要验证当前步骤
  if (step > currentStep.value && !props.allowSkip) {
    const isValid = await validateStep(currentStep.value)
    if (!isValid) return false
  }
  
  direction.value = step > currentStep.value ? 'forward' : 'backward'
  const oldStep = currentStep.value
  currentStep.value = step
  
  emit('update:modelValue', step)
  emit('step-change', oldStep, step)
  
  return true
}

async function nextStep() {
  if (props.loading) return
  await goToStep(currentStep.value + 1)
}

function prevStep() {
  if (props.loading) return
  goToStep(currentStep.value - 1)
}

function handleStepClick(index: number) {
  emit('step-click', index)
  if (index <= currentStep.value || props.allowSkip) {
    goToStep(index)
  }
}

async function handleComplete() {
  if (props.loading) return
  
  const isValid = await validateStep(currentStep.value)
  if (isValid) {
    emit('complete')
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue !== currentStep.value) {
    direction.value = newValue > currentStep.value ? 'forward' : 'backward'
    currentStep.value = newValue
  }
})

// Expose methods
defineExpose({
  goToStep,
  nextStep,
  prevStep,
  validateStep,
  currentStep
})
</script>

<style scoped>
.wizard-stepper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 步骤指示器 - 水平布局 */
.steps-indicator.layout-horizontal {
  display: flex;
  align-items: flex-start;
}

.steps-indicator.layout-horizontal .step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.steps-indicator.layout-horizontal .step-line {
  position: absolute;
  top: 18px;
  right: 50%;
  width: 100%;
  height: 2px;
  background: #e0e0e0;
}

.steps-indicator.layout-horizontal .step-item:first-child .step-line {
  display: none;
}

/* 步骤指示器 - 垂直布局 */
.steps-indicator.layout-vertical {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.steps-indicator.layout-vertical .step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;
}

.steps-indicator.layout-vertical .step-line {
  position: absolute;
  left: 18px;
  top: 0;
  width: 2px;
  height: 100%;
  background: #e0e0e0;
}

.steps-indicator.layout-vertical .step-item:first-child .step-line {
  display: none;
}

/* 步骤指示器 - 紧凑布局 */
.steps-indicator.layout-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.steps-indicator.layout-compact .step-item {
  display: flex;
  align-items: center;
}

.steps-indicator.layout-compact .step-line {
  width: 24px;
  height: 2px;
  background: #e0e0e0;
}

/* 步骤图标 */
.step-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #999;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}

.step-item.active .step-icon {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: white;
}

.step-item.completed .step-icon {
  background: #52c41a;
  border-color: #52c41a;
  color: white;
}

/* 步骤信息 */
.step-info {
  text-align: center;
  margin-top: 8px;
}

.layout-vertical .step-info {
  text-align: left;
  margin-top: 0;
  flex: 1;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  color: #999;
  transition: color 0.3s;
}

.step-item.active .step-title,
.step-item.completed .step-title {
  color: #333;
}

.step-description {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 进度线 */
.line-progress {
  height: 100%;
  background: var(--primary-color, #4B6EF5);
  transition: width 0.3s;
}

.layout-vertical .line-progress {
  width: 100% !important;
  height: 0;
  transition: height 0.3s;
}

.layout-vertical .step-item.completed .line-progress,
.layout-vertical .step-item.active .line-progress {
  height: 100%;
}

/* 点状变体 */
.variant-dots .step-icon {
  width: 12px;
  height: 12px;
  font-size: 0;
}

.variant-dots .step-icon :deep(svg) {
  display: none;
}

/* 简洁变体 */
.variant-simple .step-icon {
  border: none;
  background: transparent;
}

.variant-simple .step-item.active .step-icon {
  background: transparent;
  color: var(--primary-color, #4B6EF5);
}

.variant-simple .step-item.completed .step-icon {
  background: transparent;
  color: #52c41a;
}

/* 点击效果 */
.step-item:not(.disabled) {
  cursor: pointer;
}

.step-item:not(.disabled):hover .step-icon {
  transform: scale(1.1);
}

.step-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 步骤内容 */
.step-content {
  min-height: 200px;
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  width: 100%;
}

.default-content {
  text-align: center;
  padding: 40px;
}

.default-content h2 {
  margin: 0 0 12px;
  font-size: 24px;
  color: #333;
}

.default-content p {
  margin: 0;
  color: #666;
}

/* 操作按钮 */
.step-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-spacer {
  flex: 1;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover:not(:disabled) {
  background: #e8e8e8;
}

.btn-primary {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-success {
  background: #52c41a;
  color: white;
}

.btn-success:hover:not(:disabled) {
  opacity: 0.9;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 进度条 */
.progress-bar {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color, #4B6EF5);
  transition: width 0.3s;
}

/* 过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
