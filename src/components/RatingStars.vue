<template>
  <div class="rating-stars" :class="{ readonly, disabled }">
    <div 
      class="stars-wrapper"
      @mouseleave="handleMouseLeave"
    >
      <span
        v-for="star in maxStars"
        :key="star"
        class="star"
        :class="{
          filled: star <= displayValue,
          half: allowHalf && star - 0.5 === displayValue,
          hovered: hoverValue > 0 && star <= hoverValue
        }"
        @mouseenter="handleMouseEnter(star)"
        @click="handleClick(star)"
      >
        <IconLib 
          :name="getStarIcon(star)" 
          :size="size" 
          :style="{ color: getStarColor(star) }"
        />
        
        <!-- 半星区域 -->
        <span 
          v-if="allowHalf"
          class="half-star-area"
          @mouseenter.stop="handleMouseEnter(star - 0.5)"
          @click.stop="handleClick(star - 0.5)"
        ></span>
      </span>
    </div>
    
    <!-- 显示数值 -->
    <span v-if="showValue" class="rating-value">
      {{ displayValue.toFixed(allowHalf ? 1 : 0) }}
    </span>
    
    <!-- 显示文字 -->
    <span v-if="showText && texts && texts.length > 0" class="rating-text">
      {{ getRatingText() }}
    </span>
    
    <!-- 评分数量 -->
    <span v-if="count !== undefined" class="rating-count">
      ({{ count }})
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Props
interface Props {
  modelValue?: number
  maxStars?: number
  size?: number
  color?: string
  emptyColor?: string
  readonly?: boolean
  disabled?: boolean
  allowHalf?: boolean
  allowClear?: boolean
  showValue?: boolean
  showText?: boolean
  texts?: string[]
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  maxStars: 5,
  size: 24,
  color: '#fadb14',
  emptyColor: '#e0e0e0',
  readonly: false,
  disabled: false,
  allowHalf: false,
  allowClear: true,
  showValue: false,
  showText: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: number]
  'change': [value: number]
  'hover': [value: number]
}>()

// State
const hoverValue = ref(0)

// Computed
const displayValue = computed(() => {
  return hoverValue.value > 0 ? hoverValue.value : props.modelValue
})

// Methods
function getStarIcon(star: number): string {
  if (props.allowHalf && star - 0.5 === displayValue.value) {
    return 'star-half'
  }
  return star <= displayValue.value ? 'star-fill' : 'star'
}

function getStarColor(star: number): string {
  if (star <= displayValue.value || (props.allowHalf && star - 0.5 === displayValue.value)) {
    return props.color
  }
  return props.emptyColor
}

function getRatingText(): string {
  if (!props.texts || props.texts.length === 0) return ''
  
  const index = Math.ceil(displayValue.value) - 1
  return props.texts[Math.max(0, Math.min(index, props.texts.length - 1))] || ''
}

function handleMouseEnter(value: number) {
  if (props.readonly || props.disabled) return
  hoverValue.value = value
  emit('hover', value)
}

function handleMouseLeave() {
  hoverValue.value = 0
}

function handleClick(value: number) {
  if (props.readonly || props.disabled) return
  
  let newValue = value
  
  // 允许清除：再次点击相同值时清零
  if (props.allowClear && value === props.modelValue) {
    newValue = 0
  }
  
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.rating-stars {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.rating-stars.readonly {
  pointer-events: none;
}

.rating-stars.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.stars-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star:hover {
  transform: scale(1.1);
}

.star :deep(svg) {
  transition: color 0.15s;
}

.half-star-area {
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 1;
}

.rating-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.rating-text {
  font-size: 14px;
  color: #666;
}

.rating-count {
  font-size: 13px;
  color: #999;
}
</style>
