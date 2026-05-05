<template>
  <div 
    class="transfer"
    :class="[
      `transfer--${size}`,
      { 'transfer--disabled': disabled }
    ]"
  >
    <!-- 左侧面板 -->
    <div class="transfer__panel">
      <div class="transfer__header">
        <Checkbox
          :modelValue="leftAllChecked"
          :indeterminate="leftIndeterminate"
          :disabled="disabled"
          @update:modelValue="handleLeftAllCheck"
        >
          {{ leftTitle }}
        </Checkbox>
        <span class="transfer__count">
          {{ leftCheckedCount }}/{{ leftData.length }}
        </span>
      </div>
      
      <div v-if="filterable" class="transfer__filter">
        <Input
          v-model="leftFilterValue"
          :placeholder="filterPlaceholder"
          size="small"
          clearable
        />
      </div>
      
      <div class="transfer__body">
        <div
          v-for="item in filteredLeftData"
          :key="item[valueKey]"
          class="transfer__item"
          :class="{ 
            'transfer__item--checked': leftChecked.has(item[valueKey]),
            'transfer__item--disabled': item.disabled
          }"
          @click="handleLeftItemClick(item)"
        >
          <Checkbox
            :modelValue="leftChecked.has(item[valueKey])"
            :disabled="item.disabled || disabled"
            @click.stop
            @update:modelValue="handleLeftCheck(item, $event)"
          />
          <span class="transfer__item-label">
            {{ item[labelKey] }}
          </span>
        </div>
        
        <div v-if="filteredLeftData.length === 0" class="transfer__empty">
          暂无数据
        </div>
      </div>
      
      <div v-if="$slots.leftFooter" class="transfer__footer">
        <slot name="leftFooter" />
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="transfer__buttons">
      <button
        type="button"
        class="transfer__button"
        :disabled="disabled || leftChecked.size === 0"
        @click="moveToRight"
      >
        <IconLib name="chevron-right" :size="14" />
      </button>
      <button
        type="button"
        class="transfer__button"
        :disabled="disabled || rightChecked.size === 0"
        @click="moveToLeft"
      >
        <IconLib name="chevron-left" :size="14" />
      </button>
    </div>
    
    <!-- 右侧面板 -->
    <div class="transfer__panel">
      <div class="transfer__header">
        <Checkbox
          :modelValue="rightAllChecked"
          :indeterminate="rightIndeterminate"
          :disabled="disabled"
          @update:modelValue="handleRightAllCheck"
        >
          {{ rightTitle }}
        </Checkbox>
        <span class="transfer__count">
          {{ rightCheckedCount }}/{{ rightData.length }}
        </span>
      </div>
      
      <div v-if="filterable" class="transfer__filter">
        <Input
          v-model="rightFilterValue"
          :placeholder="filterPlaceholder"
          size="small"
          clearable
        />
      </div>
      
      <div class="transfer__body">
        <div
          v-for="item in filteredRightData"
          :key="item[valueKey]"
          class="transfer__item"
          :class="{ 
            'transfer__item--checked': rightChecked.has(item[valueKey]),
            'transfer__item--disabled': item.disabled
          }"
          @click="handleRightItemClick(item)"
        >
          <Checkbox
            :modelValue="rightChecked.has(item[valueKey])"
            :disabled="item.disabled || disabled"
            @click.stop
            @update:modelValue="handleRightCheck(item, $event)"
          />
          <span class="transfer__item-label">
            {{ item[labelKey] }}
          </span>
        </div>
        
        <div v-if="filteredRightData.length === 0" class="transfer__empty">
          暂无数据
        </div>
      </div>
      
      <div v-if="$slots.rightFooter" class="transfer__footer">
        <slot name="rightFooter" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'
import Checkbox from './Checkbox.vue'
import Input from './Input.vue'

interface TransferItem {
  [key: string]: any
  disabled?: boolean
}

interface Props {
  // 绑定值 (右侧列表的 key 数组)
  modelValue?: (string | number)[]
  // 数据源
  data?: TransferItem[]
  // 禁用
  disabled?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 左侧标题
  leftTitle?: string
  // 右侧标题
  rightTitle?: string
  // 是否可搜索
  filterable?: boolean
  // 搜索占位符
  filterPlaceholder?: string
  // 自定义搜索方法
  filterMethod?: (query: string, item: TransferItem) => boolean
  // key 字段名
  valueKey?: string
  // label 字段名
  labelKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  data: () => [],
  disabled: false,
  size: 'default',
  leftTitle: '列表1',
  rightTitle: '列表2',
  filterable: false,
  filterPlaceholder: '请输入搜索内容',
  valueKey: 'key',
  labelKey: 'label'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void
  (e: 'change', value: (string | number)[], direction: 'left' | 'right', movedKeys: (string | number)[]): void
}>()

// 左右选中的 keys
const leftChecked = ref(new Set<string | number>())
const rightChecked = ref(new Set<string | number>())

// 搜索值
const leftFilterValue = ref('')
const rightFilterValue = ref('')

// 左侧数据 (未选中的)
const leftData = computed(() => {
  const selected = new Set(props.modelValue)
  return props.data.filter(item => !selected.has(item[props.valueKey]))
})

// 右侧数据 (已选中的)
const rightData = computed(() => {
  const selected = new Set(props.modelValue)
  return props.data.filter(item => selected.has(item[props.valueKey]))
})

// 过滤后的左侧数据
const filteredLeftData = computed(() => {
  if (!leftFilterValue.value) return leftData.value
  
  if (props.filterMethod) {
    return leftData.value.filter(item => props.filterMethod!(leftFilterValue.value, item))
  }
  
  const query = leftFilterValue.value.toLowerCase()
  return leftData.value.filter(item => 
    String(item[props.labelKey]).toLowerCase().includes(query)
  )
})

// 过滤后的右侧数据
const filteredRightData = computed(() => {
  if (!rightFilterValue.value) return rightData.value
  
  if (props.filterMethod) {
    return rightData.value.filter(item => props.filterMethod!(rightFilterValue.value, item))
  }
  
  const query = rightFilterValue.value.toLowerCase()
  return rightData.value.filter(item => 
    String(item[props.labelKey]).toLowerCase().includes(query)
  )
})

// 左侧选中数量
const leftCheckedCount = computed(() => {
  return [...leftChecked.value].filter(key => 
    leftData.value.some(item => item[props.valueKey] === key)
  ).length
})

// 右侧选中数量
const rightCheckedCount = computed(() => {
  return [...rightChecked.value].filter(key => 
    rightData.value.some(item => item[props.valueKey] === key)
  ).length
})

// 左侧全选状态
const leftAllChecked = computed(() => {
  const available = leftData.value.filter(item => !item.disabled)
  return available.length > 0 && available.every(item => leftChecked.value.has(item[props.valueKey]))
})

// 左侧半选状态
const leftIndeterminate = computed(() => {
  const available = leftData.value.filter(item => !item.disabled)
  const checkedCount = available.filter(item => leftChecked.value.has(item[props.valueKey])).length
  return checkedCount > 0 && checkedCount < available.length
})

// 右侧全选状态
const rightAllChecked = computed(() => {
  const available = rightData.value.filter(item => !item.disabled)
  return available.length > 0 && available.every(item => rightChecked.value.has(item[props.valueKey]))
})

// 右侧半选状态
const rightIndeterminate = computed(() => {
  const available = rightData.value.filter(item => !item.disabled)
  const checkedCount = available.filter(item => rightChecked.value.has(item[props.valueKey])).length
  return checkedCount > 0 && checkedCount < available.length
})

// 左侧全选
function handleLeftAllCheck(checked: boolean) {
  leftChecked.value.clear()
  if (checked) {
    leftData.value
      .filter(item => !item.disabled)
      .forEach(item => leftChecked.value.add(item[props.valueKey]))
  }
}

// 右侧全选
function handleRightAllCheck(checked: boolean) {
  rightChecked.value.clear()
  if (checked) {
    rightData.value
      .filter(item => !item.disabled)
      .forEach(item => rightChecked.value.add(item[props.valueKey]))
  }
}

// 左侧单项选中
function handleLeftCheck(item: TransferItem, checked: boolean) {
  if (item.disabled) return
  
  if (checked) {
    leftChecked.value.add(item[props.valueKey])
  } else {
    leftChecked.value.delete(item[props.valueKey])
  }
}

// 右侧单项选中
function handleRightCheck(item: TransferItem, checked: boolean) {
  if (item.disabled) return
  
  if (checked) {
    rightChecked.value.add(item[props.valueKey])
  } else {
    rightChecked.value.delete(item[props.valueKey])
  }
}

// 左侧项点击
function handleLeftItemClick(item: TransferItem) {
  if (item.disabled || props.disabled) return
  
  const key = item[props.valueKey]
  if (leftChecked.value.has(key)) {
    leftChecked.value.delete(key)
  } else {
    leftChecked.value.add(key)
  }
}

// 右侧项点击
function handleRightItemClick(item: TransferItem) {
  if (item.disabled || props.disabled) return
  
  const key = item[props.valueKey]
  if (rightChecked.value.has(key)) {
    rightChecked.value.delete(key)
  } else {
    rightChecked.value.add(key)
  }
}

// 移到右侧
function moveToRight() {
  const movedKeys = [...leftChecked.value]
  const newValue = [...props.modelValue, ...movedKeys]
  
  emit('update:modelValue', newValue)
  emit('change', newValue, 'right', movedKeys)
  
  leftChecked.value.clear()
}

// 移到左侧
function moveToLeft() {
  const movedKeys = [...rightChecked.value]
  const removedSet = new Set(movedKeys)
  const newValue = props.modelValue.filter(key => !removedSet.has(key))
  
  emit('update:modelValue', newValue)
  emit('change', newValue, 'left', movedKeys)
  
  rightChecked.value.clear()
}

// 清理失效的选中项
watch(() => props.modelValue, () => {
  // 清理左侧已不存在的选中项
  const leftKeys = new Set(leftData.value.map(item => item[props.valueKey]))
  for (const key of leftChecked.value) {
    if (!leftKeys.has(key)) {
      leftChecked.value.delete(key)
    }
  }
  
  // 清理右侧已不存在的选中项
  const rightKeys = new Set(rightData.value.map(item => item[props.valueKey]))
  for (const key of rightChecked.value) {
    if (!rightKeys.has(key)) {
      rightChecked.value.delete(key)
    }
  }
}, { deep: true })
</script>

<style scoped>
.transfer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.transfer__panel {
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 300px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 8px;
  background: var(--bg-color, #fff);
  overflow: hidden;
}

.transfer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-hover, #f5f7fa);
  border-bottom: 1px solid var(--border-color, #e4e7ed);
}

.transfer__count {
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

.transfer__filter {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color, #e4e7ed);
}

.transfer__body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.transfer__item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.transfer__item:hover:not(.transfer__item--disabled) {
  background: var(--bg-hover, #f5f7fa);
}

.transfer__item--checked {
  background: rgba(75, 110, 245, 0.05);
}

.transfer__item--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.transfer__item-label {
  margin-left: 8px;
  font-size: 14px;
  color: var(--text-color, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transfer__empty {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary, #909399);
  font-size: 14px;
}

.transfer__footer {
  padding: 8px 12px;
  border-top: 1px solid var(--border-color, #e4e7ed);
}

/* 操作按钮 */
.transfer__buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transfer__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--bg-color, #fff);
  color: var(--text-secondary, #606266);
  cursor: pointer;
  transition: all 0.2s;
}

.transfer__button:hover:not(:disabled) {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.transfer__button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 尺寸 */
.transfer--small .transfer__panel {
  width: 160px;
  height: 240px;
}

.transfer--small .transfer__item {
  padding: 6px 12px;
}

.transfer--small .transfer__item-label {
  font-size: 12px;
}

.transfer--large .transfer__panel {
  width: 250px;
  height: 360px;
}

/* 禁用 */
.transfer--disabled .transfer__panel {
  background: var(--disabled-bg, #f5f7fa);
}
</style>
