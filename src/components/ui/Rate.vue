<template>
  <div class="rate" :class="{ 'rate--disabled': disabled }">
    <template v-for="n in count" :key="n">
      <div 
        class="rate__item"
        @click="handleClick(n)"
        @mouseenter="handleMouseEnter(n)"
        @mouseleave="handleMouseLeave"
      >
        <!-- 允许半选 -->
        <div 
          v-if="allowHalf" 
          class="rate__half"
          @click.stop="handleClick(n - 0.5)"
          @mouseenter.stop="handleMouseEnter(n - 0.5)"
        >
          <IconLib 
            :name="icon"
            :size="iconSize"
            :class="getStarClass(n - 0.5)"
          />
        </div>
        
        <IconLib 
          :name="icon"
          :size="iconSize"
          :class="getStarClass(n)"
        />
        
        <!-- 字符模式 -->
        <span v-if="character" class="rate__character">
          {{ character }}
        </span>
      </div>
    </template>
    
    <!-- 辅助文字 -->
    <span v-if="showText || $slots.default" class="rate__text">
      <slot :value="currentValue">
        {{ texts[Math.ceil(currentValue) - 1] || currentValue }}
      </slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 值 (v-model)
  modelValue?: number
  // 星星数量
  count?: number
  // 图标
  icon?: string
  // 图标大小
  iconSize?: number
  // 是否禁用
  disabled?: boolean
  // 是否允许半选
  allowHalf?: boolean
  // 是否显示文字
  showText?: boolean
  // 各分数对应的文字
  texts?: string[]
  // 是否可清除
  clearable?: boolean
  // 自定义字符
  character?: string
  // 选中颜色
  activeColor?: string
  // 未选中颜色
  voidColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  count: 5,
  icon: 'star',
  iconSize: 24,
  disabled: false,
  allowHalf: false,
  showText: false,
  texts: () => ['极差', '失望', '一般', '满意', '惊喜'],
  clearable: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
  (e: 'hover-change', value: number): void
}>()

const hoverValue = ref(0)

const currentValue = computed(() => 
  hoverValue.value || props.modelValue
)

// 获取星星类名
function getStarClass(index: number) {
  const value = currentValue.value
  
  if (index <= value) {
    return 'rate__icon--active'
  }
  
  return 'rate__icon--void'
}

function handleClick(value: number) {
  if (props.disabled) return
  
  // 可清除: 再次点击相同值清空
  if (props.clearable && value === props.modelValue) {
    value = 0
  }
  
  emit('update:modelValue', value)
  emit('change', value)
}

function handleMouseEnter(value: number) {
  if (props.disabled) return
  hoverValue.value = value
  emit('hover-change', value)
}

function handleMouseLeave() {
  if (props.disabled) return
  hoverValue.value = 0
}
</script>

<style scoped>
.rate {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rate--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rate--disabled .rate__item {
  pointer-events: none;
}

.rate__item {
  position: relative;
  display: inline-flex;
  cursor: pointer;
  transition: transform 0.1s;
}

.rate__item:hover {
  transform: scale(1.1);
}

/* 半选 */
.rate__half {
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

/* 图标状态 */
.rate__icon--active {
  color: var(--warning-color, #fadb14);
}

.rate__icon--void {
  color: var(--border-color, #e4e7ed);
}

/* 字符 */
.rate__character {
  font-size: 20px;
  line-height: 1;
}

/* 文字 */
.rate__text {
  margin-left: 8px;
  font-size: 14px;
  color: var(--text-secondary, #606266);
}
</style>
