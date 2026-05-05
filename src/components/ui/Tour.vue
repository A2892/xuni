<template>
  <div 
    class="tour-mask"
    v-if="visible"
  >
    <!-- 遮罩层 (带镂空) -->
    <svg class="tour-mask__svg" width="100%" height="100%">
      <defs>
        <mask id="tour-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect 
            v-if="highlightRect"
            :x="highlightRect.x - padding"
            :y="highlightRect.y - padding"
            :width="highlightRect.width + padding * 2"
            :height="highlightRect.height + padding * 2"
            :rx="borderRadius"
            fill="black"
          />
        </mask>
      </defs>
      <rect 
        x="0" 
        y="0" 
        width="100%" 
        height="100%" 
        fill="rgba(0, 0, 0, 0.5)"
        mask="url(#tour-mask)"
      />
    </svg>
    
    <!-- 高亮边框 -->
    <div 
      v-if="highlightRect"
      class="tour-mask__highlight"
      :style="highlightStyle"
    ></div>
    
    <!-- 引导卡片 -->
    <div 
      class="tour-card"
      :style="cardStyle"
      ref="cardRef"
    >
      <div v-if="currentStep?.cover" class="tour-card__cover">
        <img :src="currentStep.cover" :alt="currentStep.title" />
      </div>
      
      <div class="tour-card__content">
        <div v-if="currentStep?.title" class="tour-card__title">
          {{ currentStep.title }}
        </div>
        <div v-if="currentStep?.description" class="tour-card__description">
          {{ currentStep.description }}
        </div>
      </div>
      
      <div class="tour-card__footer">
        <div class="tour-card__indicators">
          <span 
            v-for="(_, index) in steps" 
            :key="index"
            class="tour-card__indicator"
            :class="{ 'tour-card__indicator--active': index === currentIndex }"
            @click="goToStep(index)"
          ></span>
        </div>
        
        <div class="tour-card__actions">
          <button 
            v-if="currentIndex > 0"
            type="button" 
            class="tour-card__btn"
            @click="prev"
          >
            上一步
          </button>
          <button 
            type="button" 
            class="tour-card__btn tour-card__btn--primary"
            @click="nextOrFinish"
          >
            {{ isLastStep ? finishText : nextText }}
          </button>
        </div>
      </div>
      
      <!-- 关闭按钮 -->
      <button 
        v-if="closable"
        type="button"
        class="tour-card__close"
        @click="close"
      >
        <IconLib name="close" :size="14" />
      </button>
      
      <!-- 箭头 -->
      <div 
        class="tour-card__arrow"
        :class="`tour-card__arrow--${placement}`"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface TourStep {
  // 目标元素选择器
  target: string | HTMLElement
  // 标题
  title?: string
  // 描述
  description?: string
  // 封面图
  cover?: string
  // 弹出位置
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

interface Props {
  // 是否显示
  visible?: boolean
  // 步骤列表
  steps?: TourStep[]
  // 当前步骤
  current?: number
  // 可关闭
  closable?: boolean
  // 内边距
  padding?: number
  // 圆角
  borderRadius?: number
  // 下一步按钮文字
  nextText?: string
  // 完成按钮文字
  finishText?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  steps: () => [],
  current: 0,
  closable: true,
  padding: 8,
  borderRadius: 8,
  nextText: '下一步',
  finishText: '完成'
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:current', value: number): void
  (e: 'change', current: number): void
  (e: 'finish'): void
  (e: 'close'): void
}>()

const cardRef = ref<HTMLElement>()
const currentIndex = ref(props.current)
const highlightRect = ref<DOMRect | null>(null)
const placement = ref<'top' | 'bottom' | 'left' | 'right'>('bottom')

// 当前步骤
const currentStep = computed(() => props.steps[currentIndex.value])

// 是否最后一步
const isLastStep = computed(() => currentIndex.value === props.steps.length - 1)

// 高亮样式
const highlightStyle = computed(() => {
  if (!highlightRect.value) return {}
  
  return {
    left: `${highlightRect.value.x - props.padding}px`,
    top: `${highlightRect.value.y - props.padding}px`,
    width: `${highlightRect.value.width + props.padding * 2}px`,
    height: `${highlightRect.value.height + props.padding * 2}px`,
    borderRadius: `${props.borderRadius}px`
  }
})

// 卡片样式
const cardStyle = computed(() => {
  if (!highlightRect.value) return { display: 'none' }
  
  const gap = 16
  const rect = highlightRect.value
  
  let left = 0
  let top = 0
  
  switch (placement.value) {
    case 'top':
      left = rect.x + rect.width / 2
      top = rect.y - props.padding - gap
      break
    case 'bottom':
      left = rect.x + rect.width / 2
      top = rect.y + rect.height + props.padding + gap
      break
    case 'left':
      left = rect.x - props.padding - gap
      top = rect.y + rect.height / 2
      break
    case 'right':
      left = rect.x + rect.width + props.padding + gap
      top = rect.y + rect.height / 2
      break
  }
  
  const transform = placement.value === 'top' || placement.value === 'bottom'
    ? 'translateX(-50%)'
    : 'translateY(-50%)'
  
  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: placement.value === 'top' ? 'translate(-50%, -100%)' : transform
  }
})

// 获取目标元素
function getTargetElement(target: string | HTMLElement): HTMLElement | null {
  if (typeof target === 'string') {
    return document.querySelector(target)
  }
  return target
}

// 更新位置
function updatePosition() {
  const step = currentStep.value
  if (!step) {
    highlightRect.value = null
    return
  }
  
  const targetEl = getTargetElement(step.target)
  if (!targetEl) {
    highlightRect.value = null
    return
  }
  
  highlightRect.value = targetEl.getBoundingClientRect()
  placement.value = step.placement || 'bottom'
  
  // 滚动目标元素到视图中
  targetEl.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
}

// 下一步
function next() {
  if (currentIndex.value < props.steps.length - 1) {
    currentIndex.value++
    emit('update:current', currentIndex.value)
    emit('change', currentIndex.value)
    nextTick(updatePosition)
  }
}

// 上一步
function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    emit('update:current', currentIndex.value)
    emit('change', currentIndex.value)
    nextTick(updatePosition)
  }
}

// 跳转到指定步骤
function goToStep(index: number) {
  currentIndex.value = index
  emit('update:current', currentIndex.value)
  emit('change', currentIndex.value)
  nextTick(updatePosition)
}

// 下一步或完成
function nextOrFinish() {
  if (isLastStep.value) {
    finish()
  } else {
    next()
  }
}

// 完成
function finish() {
  emit('update:visible', false)
  emit('finish')
}

// 关闭
function close() {
  emit('update:visible', false)
  emit('close')
}

// 监听显示状态
watch(() => props.visible, (val) => {
  if (val) {
    currentIndex.value = props.current
    nextTick(updatePosition)
    document.body.style.overflow = 'hidden'
    window.addEventListener('resize', updatePosition)
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('resize', updatePosition)
  }
})

// 监听 current 属性
watch(() => props.current, (val) => {
  currentIndex.value = val
  nextTick(updatePosition)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('resize', updatePosition)
})
</script>

<style scoped>
.tour-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
}

.tour-mask__svg {
  position: absolute;
  inset: 0;
}

.tour-mask__highlight {
  position: fixed;
  border: 2px solid var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  transition: all 0.3s ease;
}

/* 引导卡片 */
.tour-card {
  position: fixed;
  width: 320px;
  background: var(--bg-color, #fff);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  z-index: 2001;
  transition: all 0.3s ease;
}

.tour-card__cover {
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.tour-card__cover img {
  display: block;
  width: 100%;
  height: auto;
}

.tour-card__content {
  padding: 16px 20px;
}

.tour-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color, #303133);
  margin-bottom: 8px;
}

.tour-card__description {
  font-size: 14px;
  color: var(--text-secondary, #606266);
  line-height: 1.6;
}

.tour-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--border-color, #e4e7ed);
}

.tour-card__indicators {
  display: flex;
  gap: 6px;
}

.tour-card__indicator {
  width: 8px;
  height: 8px;
  background: var(--border-color, #dcdfe6);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.tour-card__indicator--active {
  width: 20px;
  border-radius: 4px;
  background: var(--primary-color, #4B6EF5);
}

.tour-card__actions {
  display: flex;
  gap: 8px;
}

.tour-card__btn {
  padding: 6px 16px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: #fff;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tour-card__btn:hover {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.tour-card__btn--primary {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.tour-card__btn--primary:hover {
  background: var(--primary-hover, #3b5de7);
  border-color: var(--primary-hover, #3b5de7);
  color: #fff;
}

.tour-card__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary, #909399);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.tour-card__close:hover {
  background: var(--bg-hover, #f5f7fa);
  color: var(--text-color, #606266);
}

/* 箭头 */
.tour-card__arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--bg-color, #fff);
  transform: rotate(45deg);
}

.tour-card__arrow--top {
  bottom: -6px;
  left: 50%;
  margin-left: -6px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
}

.tour-card__arrow--bottom {
  top: -6px;
  left: 50%;
  margin-left: -6px;
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
}

.tour-card__arrow--left {
  right: -6px;
  top: 50%;
  margin-top: -6px;
  box-shadow: 2px -2px 4px rgba(0, 0, 0, 0.05);
}

.tour-card__arrow--right {
  left: -6px;
  top: 50%;
  margin-top: -6px;
  box-shadow: -2px 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
