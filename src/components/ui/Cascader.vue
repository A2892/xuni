<template>
  <div 
    class="cascader"
    :class="[
      `cascader--${size}`,
      { 
        'cascader--disabled': disabled,
        'cascader--multiple': multiple
      }
    ]"
    ref="containerRef"
  >
    <div 
      class="cascader__input"
      :class="{ 'cascader__input--focused': visible }"
      @click="toggleDropdown"
    >
      <!-- 多选标签 -->
      <div v-if="multiple && selectedLabels.length > 0" class="cascader__tags">
        <span 
          v-for="(label, index) in selectedLabels.slice(0, maxTagCount)"
          :key="index"
          class="cascader__tag"
        >
          {{ label }}
          <IconLib 
            name="close" 
            :size="12" 
            class="cascader__tag-close"
            @click.stop="removeTag(index)"
          />
        </span>
        <span v-if="selectedLabels.length > maxTagCount" class="cascader__tag cascader__tag--more">
          +{{ selectedLabels.length - maxTagCount }}
        </span>
      </div>
      
      <!-- 单选显示 -->
      <span v-else-if="!multiple && displayLabel" class="cascader__label">
        {{ displayLabel }}
      </span>
      
      <!-- 占位符 -->
      <span v-else class="cascader__placeholder">{{ placeholder }}</span>
      
      <!-- 图标 -->
      <div class="cascader__icons">
        <IconLib 
          v-if="clearable && hasValue && !disabled"
          name="close" 
          :size="14" 
          class="cascader__clear"
          @click.stop="handleClear"
        />
        <IconLib 
          name="chevron-down" 
          :size="14" 
          class="cascader__arrow"
          :class="{ 'cascader__arrow--up': visible }"
        />
      </div>
    </div>
    
    <Teleport to="body">
      <Transition name="cascader-dropdown">
        <div 
          v-if="visible"
          class="cascader__dropdown"
          ref="dropdownRef"
          :style="dropdownStyle"
        >
          <div class="cascader__menus">
            <ul 
              v-for="(menu, menuIndex) in menus"
              :key="menuIndex"
              class="cascader__menu"
            >
              <li
                v-for="option in menu"
                :key="option.value"
                class="cascader__option"
                :class="{
                  'cascader__option--active': isOptionSelected(option, menuIndex),
                  'cascader__option--disabled': option.disabled,
                  'cascader__option--expanded': isExpanded(option, menuIndex)
                }"
                @click="handleOptionClick(option, menuIndex)"
              >
                <Checkbox 
                  v-if="multiple"
                  :modelValue="isChecked(option)"
                  :indeterminate="isIndeterminate(option)"
                  @click.stop
                  @update:modelValue="handleCheckChange(option, $event)"
                />
                <span class="cascader__option-label">{{ option.label }}</span>
                <IconLib 
                  v-if="option.children && option.children.length"
                  name="chevron-right" 
                  :size="12" 
                  class="cascader__option-arrow"
                />
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'
import Checkbox from './Checkbox.vue'

interface CascaderOption {
  value: string | number
  label: string
  disabled?: boolean
  children?: CascaderOption[]
}

interface Props {
  // 绑定值
  modelValue?: (string | number)[] | (string | number)[][]
  // 选项数据
  options?: CascaderOption[]
  // 占位符
  placeholder?: string
  // 禁用
  disabled?: boolean
  // 可清空
  clearable?: boolean
  // 多选
  multiple?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 是否可选任意一级
  checkStrictly?: boolean
  // 分隔符
  separator?: string
  // 最大标签数
  maxTagCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  clearable: true,
  multiple: false,
  size: 'default',
  checkStrictly: false,
  separator: ' / ',
  maxTagCount: 3
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[] | (string | number)[][] | null): void
  (e: 'change', value: (string | number)[] | (string | number)[][] | null): void
}>()

const containerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const visible = ref(false)

// 展开的路径
const expandedPath = ref<CascaderOption[]>([])

// 下拉菜单样式
const dropdownStyle = ref({})

// 是否有值
const hasValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0
  }
  return Array.isArray(props.modelValue) && props.modelValue.length > 0
})

// 显示的菜单列表
const menus = computed(() => {
  const result: CascaderOption[][] = [props.options]
  
  for (const option of expandedPath.value) {
    if (option.children && option.children.length) {
      result.push(option.children)
    }
  }
  
  return result
})

// 显示标签 (单选)
const displayLabel = computed(() => {
  if (props.multiple || !props.modelValue || !props.modelValue.length) {
    return ''
  }
  
  const labels: string[] = []
  let currentOptions = props.options
  
  for (const value of props.modelValue as (string | number)[]) {
    const option = currentOptions.find(o => o.value === value)
    if (option) {
      labels.push(option.label)
      currentOptions = option.children || []
    }
  }
  
  return labels.join(props.separator)
})

// 显示标签列表 (多选)
const selectedLabels = computed(() => {
  if (!props.multiple || !props.modelValue) return []
  
  return (props.modelValue as (string | number)[][]).map(path => {
    const labels: string[] = []
    let currentOptions = props.options
    
    for (const value of path) {
      const option = currentOptions.find(o => o.value === value)
      if (option) {
        labels.push(option.label)
        currentOptions = option.children || []
      }
    }
    
    return labels.join(props.separator)
  })
})

// 切换下拉
function toggleDropdown() {
  if (props.disabled) return
  visible.value = !visible.value
}

// 选项是否选中
function isOptionSelected(option: CascaderOption, menuIndex: number): boolean {
  if (!props.modelValue || !props.modelValue.length) return false
  
  if (props.multiple) {
    // 多选模式
    return (props.modelValue as (string | number)[][]).some(path => {
      return path[menuIndex] === option.value
    })
  } else {
    // 单选模式
    return (props.modelValue as (string | number)[])[menuIndex] === option.value
  }
}

// 选项是否展开
function isExpanded(option: CascaderOption, menuIndex: number): boolean {
  return expandedPath.value[menuIndex]?.value === option.value
}

// 多选 - 是否选中
function isChecked(option: CascaderOption): boolean {
  if (!props.multiple || !props.modelValue) return false
  // 简化实现
  return false
}

// 多选 - 是否半选
function isIndeterminate(option: CascaderOption): boolean {
  return false
}

// 点击选项
function handleOptionClick(option: CascaderOption, menuIndex: number) {
  if (option.disabled) return
  
  // 更新展开路径
  expandedPath.value = expandedPath.value.slice(0, menuIndex)
  expandedPath.value.push(option)
  
  // 如果没有子选项或启用了可选任意级别
  if (!option.children || !option.children.length || props.checkStrictly) {
    if (!props.multiple) {
      // 单选直接选中
      const path = expandedPath.value.map(o => o.value)
      emit('update:modelValue', path)
      emit('change', path)
      visible.value = false
    }
  }
}

// 多选 - 勾选变化
function handleCheckChange(option: CascaderOption, checked: boolean) {
  // 多选逻辑
}

// 清空
function handleClear() {
  expandedPath.value = []
  emit('update:modelValue', props.multiple ? [] : null)
  emit('change', props.multiple ? [] : null)
}

// 移除标签
function removeTag(index: number) {
  if (!props.multiple || !props.modelValue) return
  
  const newValue = [...(props.modelValue as (string | number)[][])]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// 更新下拉位置
function updateDropdownPosition() {
  if (!containerRef.value || !visible.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.bottom + 4}px`,
    minWidth: `${rect.width}px`,
    zIndex: 2000
  }
}

// 点击外部关闭
function handleClickOutside(e: MouseEvent) {
  if (!containerRef.value?.contains(e.target as Node) &&
      !dropdownRef.value?.contains(e.target as Node)) {
    visible.value = false
  }
}

watch(visible, (val) => {
  if (val) {
    nextTick(updateDropdownPosition)
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', updateDropdownPosition)
  } else {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', updateDropdownPosition)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateDropdownPosition)
})
</script>

<style scoped>
.cascader {
  position: relative;
  display: inline-block;
  width: 240px;
}

.cascader__input {
  display: flex;
  align-items: center;
  padding: 0 30px 0 12px;
  min-height: 32px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--bg-color, #fff);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
}

.cascader__input:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.cascader__input--focused {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.1);
}

.cascader__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: var(--text-color, #303133);
}

.cascader__placeholder {
  flex: 1;
  color: var(--text-secondary, #c0c4cc);
  font-size: 14px;
}

.cascader__icons {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cascader__clear {
  color: var(--text-secondary, #c0c4cc);
  cursor: pointer;
  transition: color 0.2s;
}

.cascader__clear:hover {
  color: var(--text-color, #606266);
}

.cascader__arrow {
  color: var(--text-secondary, #c0c4cc);
  transition: transform 0.2s;
}

.cascader__arrow--up {
  transform: rotate(180deg);
}

/* 标签 */
.cascader__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 2px 0;
}

.cascader__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--bg-hover, #f5f7fa);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-color, #606266);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cascader__tag--more {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

.cascader__tag-close {
  cursor: pointer;
  transition: color 0.2s;
}

.cascader__tag-close:hover {
  color: var(--primary-color, #4B6EF5);
}

/* 尺寸 */
.cascader--small .cascader__input {
  min-height: 24px;
  font-size: 12px;
}

.cascader--large .cascader__input {
  min-height: 40px;
  font-size: 16px;
}

/* 禁用 */
.cascader--disabled .cascader__input {
  background: var(--disabled-bg, #f5f7fa);
  cursor: not-allowed;
}

/* 下拉面板 */
.cascader__dropdown {
  background: var(--bg-color, #fff);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color, #e4e7ed);
}

.cascader__menus {
  display: flex;
}

.cascader__menu {
  list-style: none;
  padding: 8px 0;
  margin: 0;
  min-width: 180px;
  max-height: 280px;
  overflow-y: auto;
}

.cascader__menu + .cascader__menu {
  border-left: 1px solid var(--border-color, #e4e7ed);
}

.cascader__option {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-color, #303133);
  cursor: pointer;
  transition: background 0.2s;
}

.cascader__option:hover {
  background: var(--bg-hover, #f5f7fa);
}

.cascader__option--active {
  color: var(--primary-color, #4B6EF5);
  font-weight: 500;
}

.cascader__option--expanded {
  background: var(--bg-hover, #f5f7fa);
}

.cascader__option--disabled {
  color: var(--text-disabled, #c0c4cc);
  cursor: not-allowed;
}

.cascader__option-label {
  flex: 1;
}

.cascader__option-arrow {
  color: var(--text-secondary, #909399);
  margin-left: 8px;
}

/* 动画 */
.cascader-dropdown-enter-active,
.cascader-dropdown-leave-active {
  transition: all 0.2s ease;
}

.cascader-dropdown-enter-from,
.cascader-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
