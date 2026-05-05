<template>
  <div
    class="tree-select-node"
    :class="{ 'tree-select-node-disabled': node.disabled }"
    :style="{ paddingLeft: `${level * 20}px` }"
  >
    <div
      class="tree-select-node-content"
      :class="{
        'tree-select-node-selected': isSelected,
        'tree-select-node-matched': isMatched
      }"
      @click="handleClick"
    >
      <!-- 展开箭头 -->
      <span
        v-if="hasChildren"
        class="tree-select-node-arrow"
        :class="{ 'tree-select-node-arrow-open': isExpanded }"
        @click.stop="handleExpand"
      >
        <IconLib name="chevron-right" :size="12" />
      </span>
      <span v-else class="tree-select-node-arrow-placeholder" />
      
      <!-- 复选框 -->
      <span
        v-if="multiple && checkable"
        class="tree-select-node-checkbox"
        :class="{
          'tree-select-node-checkbox-checked': isChecked,
          'tree-select-node-checkbox-indeterminate': isIndeterminate
        }"
        @click.stop="handleCheck"
      >
        <IconLib v-if="isChecked" name="check" :size="12" />
        <span v-else-if="isIndeterminate" class="tree-select-node-checkbox-indeterminate-mark" />
      </span>
      
      <!-- 图标 -->
      <span v-if="node.icon" class="tree-select-node-icon">
        <IconLib :name="node.icon" :size="14" />
      </span>
      
      <!-- 标签 -->
      <span class="tree-select-node-label" v-html="highlightedLabel" />
    </div>
    
    <!-- 子节点 -->
    <Transition name="tree-expand">
      <div v-show="isExpanded && hasChildren" class="tree-select-node-children">
        <TreeSelectNode
          v-for="child in node.children"
          :key="child.value"
          :node="child"
          :level="level + 1"
          :selected-value="selectedValue"
          :selected-values="selectedValues"
          :multiple="multiple"
          :checkable="checkable"
          :expanded-keys="expandedKeys"
          :search-value="searchValue"
          @select="$emit('select', $event)"
          @check="$emit('check', $event.node, $event.checked)"
          @expand="$emit('expand', $event)"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface TreeNode {
  value: string | number
  label: string
  children?: TreeNode[]
  disabled?: boolean
  isLeaf?: boolean
  icon?: string
  [key: string]: any
}

interface Props {
  node: TreeNode
  level?: number
  selectedValue?: string | number
  selectedValues?: (string | number)[]
  multiple?: boolean
  checkable?: boolean
  expandedKeys?: (string | number)[]
  searchValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  selectedValues: () => [],
  multiple: false,
  checkable: false,
  expandedKeys: () => [],
  searchValue: ''
})

const emit = defineEmits<{
  select: [node: TreeNode]
  check: [{ node: TreeNode; checked: boolean }]
  expand: [key: string | number]
}>()

// 是否有子节点
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

// 是否展开
const isExpanded = computed(() => {
  return props.expandedKeys.includes(props.node.value)
})

// 是否选中（单选）
const isSelected = computed(() => {
  if (props.multiple) {
    return props.selectedValues.includes(props.node.value)
  }
  return props.selectedValue === props.node.value
})

// 是否勾选（多选）
const isChecked = computed(() => {
  return props.selectedValues.includes(props.node.value)
})

// 是否半选
const isIndeterminate = computed(() => {
  if (!hasChildren.value || !props.checkable) return false
  
  const getAllChildValues = (node: TreeNode): (string | number)[] => {
    const values: (string | number)[] = []
    if (node.children) {
      node.children.forEach(child => {
        values.push(child.value)
        values.push(...getAllChildValues(child))
      })
    }
    return values
  }
  
  const childValues = getAllChildValues(props.node)
  const checkedCount = childValues.filter(v => props.selectedValues.includes(v)).length
  
  return checkedCount > 0 && checkedCount < childValues.length
})

// 是否匹配搜索
const isMatched = computed(() => {
  if (!props.searchValue) return false
  return props.node.label.toLowerCase().includes(props.searchValue.toLowerCase())
})

// 高亮后的标签
const highlightedLabel = computed(() => {
  if (!props.searchValue) return props.node.label
  
  const regex = new RegExp(`(${escapeRegExp(props.searchValue)})`, 'gi')
  return props.node.label.replace(regex, '<span class="tree-select-highlight">$1</span>')
})

const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 点击节点
const handleClick = () => {
  if (props.node.disabled) return
  emit('select', props.node)
}

// 点击复选框
const handleCheck = () => {
  if (props.node.disabled) return
  emit('check', { node: props.node, checked: !isChecked.value })
}

// 展开/折叠
const handleExpand = () => {
  emit('expand', props.node.value)
}
</script>

<style scoped>
.tree-select-node {
  font-size: 14px;
}

.tree-select-node-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tree-select-node-content {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 0 4px;
}

.tree-select-node-content:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.tree-select-node-selected {
  background-color: rgba(75, 110, 245, 0.1);
}

.tree-select-node-matched {
  font-weight: 500;
}

.tree-select-node-disabled .tree-select-node-content {
  cursor: not-allowed;
}

.tree-select-node-disabled .tree-select-node-content:hover {
  background-color: transparent;
}

/* 箭头 */
.tree-select-node-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  color: rgba(0, 0, 0, 0.45);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.tree-select-node-arrow-open {
  transform: rotate(90deg);
}

.tree-select-node-arrow-placeholder {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  flex-shrink: 0;
}

/* 复选框 */
.tree-select-node-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.2s;
  flex-shrink: 0;
}

.tree-select-node-checkbox-checked {
  background-color: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.tree-select-node-checkbox-indeterminate {
  border-color: var(--primary-color, #4B6EF5);
}

.tree-select-node-checkbox-indeterminate-mark {
  width: 8px;
  height: 2px;
  background-color: var(--primary-color, #4B6EF5);
}

/* 图标 */
.tree-select-node-icon {
  display: flex;
  align-items: center;
  margin-right: 8px;
  color: rgba(0, 0, 0, 0.45);
}

/* 标签 */
.tree-select-node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.88);
}

:deep(.tree-select-highlight) {
  color: var(--primary-color, #4B6EF5);
  font-weight: 600;
}

/* 子节点 */
.tree-select-node-children {
  overflow: hidden;
}

/* 展开动画 */
.tree-expand-enter-active,
.tree-expand-leave-active {
  transition: all 0.2s;
}

.tree-expand-enter-from,
.tree-expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
