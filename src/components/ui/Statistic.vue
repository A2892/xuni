<template>
  <div class="statistic" :class="{ 'statistic--loading': loading }">
    <!-- 标题 -->
    <div v-if="title || $slots.title" class="statistic__title">
      <slot name="title">{{ title }}</slot>
    </div>
    
    <!-- 数值 -->
    <div class="statistic__content">
      <!-- 前缀 -->
      <span v-if="prefix || $slots.prefix" class="statistic__prefix">
        <slot name="prefix">{{ prefix }}</slot>
      </span>
      
      <!-- 数值 -->
      <span class="statistic__value" :class="valueClass" :style="valueStyle">
        <template v-if="loading">
          <span class="statistic__skeleton" />
        </template>
        <template v-else-if="countUp && typeof value === 'number'">
          <span ref="countUpRef">{{ formattedValue }}</span>
        </template>
        <template v-else>
          {{ formattedValue }}
        </template>
      </span>
      
      <!-- 后缀 -->
      <span v-if="suffix || $slots.suffix" class="statistic__suffix">
        <slot name="suffix">{{ suffix }}</slot>
      </span>
    </div>
    
    <!-- 趋势 -->
    <div v-if="trend || $slots.trend" class="statistic__trend">
      <slot name="trend">
        <span 
          class="statistic__trend-value"
          :class="{
            'statistic__trend-value--up': trend && trend > 0,
            'statistic__trend-value--down': trend && trend < 0
          }"
        >
          <IconLib 
            v-if="trend && trend !== 0"
            :name="trend > 0 ? 'trending-up' : 'trending-down'" 
            :size="14" 
          />
          <span>{{ Math.abs(trend || 0) }}%</span>
        </span>
        <span v-if="trendLabel" class="statistic__trend-label">{{ trendLabel }}</span>
      </slot>
    </div>
    
    <!-- 描述 -->
    <div v-if="description || $slots.description" class="statistic__description">
      <slot name="description">{{ description }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 标题
  title?: string
  // 数值
  value?: number | string
  // 精度
  precision?: number
  // 前缀
  prefix?: string
  // 后缀
  suffix?: string
  // 分组分隔符
  groupSeparator?: string
  // 小数点
  decimalSeparator?: string
  // 数值样式类
  valueClass?: string | object | string[]
  // 数值样式
  valueStyle?: Record<string, string>
  // 趋势值（百分比）
  trend?: number
  // 趋势标签
  trendLabel?: string
  // 描述
  description?: string
  // 是否加载中
  loading?: boolean
  // 是否使用数字滚动动画
  countUp?: boolean
  // 动画时长
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  precision: 0,
  groupSeparator: ',',
  decimalSeparator: '.',
  loading: false,
  countUp: false,
  duration: 2000
})

const countUpRef = ref<HTMLElement>()
const displayValue = ref(0)

// 格式化数值
const formattedValue = computed(() => {
  const val = props.countUp && typeof props.value === 'number' 
    ? displayValue.value 
    : props.value
  
  if (typeof val !== 'number') {
    return val
  }
  
  // 处理精度
  const fixed = val.toFixed(props.precision)
  
  // 分割整数和小数部分
  const [intPart, decPart] = fixed.split('.')
  
  // 添加千分位分隔符
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, props.groupSeparator)
  
  // 组合结果
  if (decPart) {
    return `${formattedInt}${props.decimalSeparator}${decPart}`
  }
  
  return formattedInt
})

// 数字滚动动画
function animateValue(start: number, end: number, duration: number) {
  const startTime = performance.now()
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用 easeOutExpo 缓动函数
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    
    displayValue.value = start + (end - start) * easeProgress
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

// 监听值变化
watch(() => props.value, (newVal, oldVal) => {
  if (props.countUp && typeof newVal === 'number') {
    const start = typeof oldVal === 'number' ? oldVal : 0
    animateValue(start, newVal, props.duration)
  }
}, { immediate: true })

onMounted(() => {
  if (props.countUp && typeof props.value === 'number') {
    animateValue(0, props.value, props.duration)
  }
})
</script>

<style scoped>
.statistic {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.statistic--loading .statistic__value {
  color: transparent;
}

.statistic__title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.statistic__content {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.statistic__prefix {
  font-size: 16px;
  color: #333;
}

.statistic__value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  position: relative;
}

.statistic__skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: statistic-skeleton 1.5s ease infinite;
  border-radius: 4px;
}

@keyframes statistic-skeleton {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.statistic__suffix {
  font-size: 16px;
  color: #333;
}

.statistic__trend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.statistic__trend-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.statistic__trend-value--up {
  color: #52c41a;
}

.statistic__trend-value--down {
  color: #ff4d4f;
}

.statistic__trend-label {
  color: #999;
}

.statistic__description {
  font-size: 12px;
  color: #999;
}
</style>
