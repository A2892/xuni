<template>
  <div class="tree-select" ref="containerRef">
    <!-- 选择器 -->
    <div
      class="tree-select-selector"
      :class="{
        'tree-select-focused': focused,
        'tree-select-disabled': disabled,
        'tree-select-multiple': multiple,
        [`tree-select-${size}`]: size !== 'default'
      }"
      @click="toggleDropdown"
    >
      <!-- 单选 -->
      <template v-if="!multiple">
        <span v-if="selectedLabel" class="tree-select-value">{{ selectedLabel }}</span>
        <span v-else class="tree-select-placeholder">{{ placeholder }}</span>
      </template>
      
      <!-- 多选 -->
      <template v-else>
        <div v-if="selectedItems.length > 0" class="tree-select-tags">
          <span
            v-for="item in displayedTags"
            :key="item.value"
            class="tree-select-tag"
          >
            {{ item.label }}
            <span class="tree-select-tag-close" @click.stop="removeTag(item.value)">
              <IconLib name="close" :size="12" />
            </span>
          </span>
          <span v-if="selectedItems.length > maxTagCount" class="tree-select-tag tree-select-tag-max">
            +{{ selectedItems.length - maxTagCount }}
          </span>
        </div>
        <span v-else class="tree-select-placeholder">{{ placeholder }}</span>
      </template>
      
      <!-- 箭头 -->
      <span class="tree-select-arrow" :class="{ 'tree-select-arrow-open': dropdownVisible }">
        <IconLib name="chevron-down" :size="14" />
      </span>
      
      <!-- 清除按钮 -->
      <span
        v-if="allowClear && (multiple ? selectedItems.length > 0 : selectedValue)"
        class="tree-select-clear"
        @click.stop="handleClear"
      >
        <IconLib name="close-circle" :size="14" />
      </span>
    </div>
    
    <!-- 下拉面板 -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="dropdownVisible"
          class="tree-select-dropdown"
          :style="dropdownStyle"
          ref="dropdownRef"
        >
          <!-- 搜索框 -->
          <div v-if="showSearch" class="tree-select-search">
            <input
              ref="searchInputRef"
              v-model="searchValue"
              class="tree-select-search-input"
              placeholder="搜索..."
              @click.stop
            />
          </div>
          
          <!-- 树形列表 -->
          <div class="tree-select-tree">
            <TreeSelectNode
              v-for="node in filteredTreeData"
              :key="node.value"
              :node="node"
              :selected-value="selectedValue"
              :selected-values="selectedValues"
              :multiple="multiple"
              :checkable="checkable"
              :expanded-keys="expandedKeys"
              :search-value="searchValue"
              @select="handleSelect"
              @check="handleCheck"
              @expand="handleExpand"
            />
          </div>
          
          <!-- 空状态 -->
          <div v-if="filteredTreeData.length === 0" class="tree-select-empty">
            暂无数据
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'
import TreeSelectNode from './TreeSelectNode.vue'

interface TreeNode {
  value: string | number
  label: string
  children?: TreeNode[]
  disabled?: boolean
  isLeaf?: boolean
  [key: string]: any
}

interface Props {
  modelValue?: string | number | (string | number)[]
  treeData?: TreeNode[]
  placeholder?: string
  disabled?: boolean
  multiple?: boolean
  checkable?: boolean
  showSearch?: boolean
  allowClear?: boolean
  size?: 'small' | 'default' | 'large'
  maxTagCount?: number
  treeDefaultExpandAll?: boolean
  treeDefaultExpandedKeys?: (string | number)[]
}

const props = withDefaults(defineProps<Props>(), {
  treeData: () => [],
  placeholder: '请选择',
  disabled: false,
  multiple: false,
  checkable: false,
  showSearch: false,
  allowClear: false,
  size: 'default',
  maxTagCount: 3,
  treeDefaultExpandAll: false,
  treeDefaultExpandedKeys: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[] | undefined]
  change: [value: string | number | (string | number)[] | undefined, label: string | string[]]
  search: [value: string]
}>()

const containerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const searchInputRef = ref<HTMLInputElement>()
const focused = ref(false)
const dropdownVisible = ref(false)
const searchValue = ref('')
const dropdownStyle = ref<Record<string, string>>({})
const expandedKeys = ref<(string | number)[]>(
  props.treeDefaultExpandAll 
    ? getAllKeys(props.treeData) 
    : [...props.treeDefaultExpandedKeys]
)

// 获取所有节点 key
function getAllKeys(data: TreeNode[]): (string | number)[] {
  const keys: (string | number)[] = []
  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      keys.push(node.value)
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  traverse(data)
  return keys
}

// 扁平化树数据
const flattenTree = computed(() => {
  const result: TreeNode[] = []
  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      result.push(node)
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  traverse(props.treeData)
  return result
})

// 单选值
const selectedValue = computed(() => {
  if (props.multiple) return undefined
  return props.modelValue as string | number | undefined
})

// 多选值
const selectedValues = computed(() => {
  if (!props.multiple) return []
  return (props.modelValue || []) as (string | number)[]
})

// 选中的标签
const selectedLabel = computed(() => {
  if (props.multiple) return ''
  const node = flattenTree.value.find(n => n.value === selectedValue.value)
  return node?.label || ''
})

// 多选选中项
const selectedItems = computed(() => {
  return selectedValues.value
    .map(v => flattenTree.value.find(n => n.value === v))
    .filter(Boolean) as TreeNode[]
})

// 显示的标签
const displayedTags = computed(() => {
  return selectedItems.value.slice(0, props.maxTagCount)
})

// 过滤后的树数据
const filteredTreeData = computed(() => {
  if (!searchValue.value) return props.treeData
  
  const search = searchValue.value.toLowerCase()
  
  const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.reduce<TreeNode[]>((acc, node) => {
      const match = node.label.toLowerCase().includes(search)
      const filteredChildren = node.children ? filterNodes(node.children) : []
      
      if (match || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        })
      }
      
      return acc
    }, [])
  }
  
  return filterNodes(props.treeData)
})

// 更新下拉框位置
const updateDropdownPosition = () => {
  if (!containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`,
    zIndex: '1050'
  }
}

// 切换下拉框
const toggleDropdown = () => {
  if (props.disabled) return
  
  dropdownVisible.value = !dropdownVisible.value
  focused.value = dropdownVisible.value
  
  if (dropdownVisible.value) {
    updateDropdownPosition()
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

// 处理选择
const handleSelect = (node: TreeNode) => {
  if (node.disabled) return
  
  if (props.multiple) {
    const values = [...selectedValues.value]
    const index = values.indexOf(node.value)
    
    if (index === -1) {
      values.push(node.value)
    } else {
      values.splice(index, 1)
    }
    
    emit('update:modelValue', values)
    emit('change', values, values.map(v => flattenTree.value.find(n => n.value === v)?.label || ''))
  } else {
    emit('update:modelValue', node.value)
    emit('change', node.value, node.label)
    dropdownVisible.value = false
    focused.value = false
  }
}

// 处理勾选
const handleCheck = (node: TreeNode, checked: boolean) => {
  handleSelect(node)
}

// 处理展开
const handleExpand = (key: string | number) => {
  const index = expandedKeys.value.indexOf(key)
  if (index === -1) {
    expandedKeys.value.push(key)
  } else {
    expandedKeys.value.splice(index, 1)
  }
}

// 移除标签
const removeTag = (value: string | number) => {
  const values = selectedValues.value.filter(v => v !== value)
  emit('update:modelValue', values)
  emit('change', values, values.map(v => flattenTree.value.find(n => n.value === v)?.label || ''))
}

// 清除
const handleClear = () => {
  if (props.multiple) {
    emit('update:modelValue', [])
    emit('change', [], [])
  } else {
    emit('update:modelValue', undefined)
    emit('change', undefined, '')
  }
}

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (!containerRef.value?.contains(e.target as Node) &&
      !dropdownRef.value?.contains(e.target as Node)) {
    dropdownVisible.value = false
    focused.value = false
  }
}

// 监听搜索
watch(searchValue, (val) => {
  emit('search', val)
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateDropdownPosition)
  window.addEventListener('scroll', updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition)
})
</script>

<style scoped>
.tree-select {
  position: relative;
  display: inline-block;
  width: 100%;
}

.tree-select-selector {
  display: flex;
  align-items: center;
  min-height: 36px;
  padding: 4px 32px 4px 12px;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tree-select-selector:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.tree-select-focused .tree-select-selector,
.tree-select-focused {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.1);
}

.tree-select-disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.5;
}

.tree-select-small .tree-select-selector {
  min-height: 28px;
  padding: 2px 28px 2px 8px;
  font-size: 12px;
}

.tree-select-large .tree-select-selector {
  min-height: 44px;
  padding: 6px 36px 6px 16px;
  font-size: 16px;
}

.tree-select-value {
  flex: 1;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-select-placeholder {
  flex: 1;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.25);
}

/* 多选标签 */
.tree-select-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.tree-select-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.tree-select-tag-close {
  display: flex;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
}

.tree-select-tag-close:hover {
  color: rgba(0, 0, 0, 0.88);
}

.tree-select-tag-max {
  background-color: rgba(0, 0, 0, 0.06);
}

/* 箭头 */
.tree-select-arrow {
  position: absolute;
  right: 12px;
  color: rgba(0, 0, 0, 0.25);
  transition: transform 0.2s;
}

.tree-select-arrow-open {
  transform: rotate(180deg);
}

/* 清除按钮 */
.tree-select-clear {
  position: absolute;
  right: 32px;
  color: rgba(0, 0, 0, 0.25);
  opacity: 0;
  cursor: pointer;
  transition: all 0.2s;
}

.tree-select:hover .tree-select-clear {
  opacity: 1;
}

.tree-select-clear:hover {
  color: rgba(0, 0, 0, 0.45);
}

/* 下拉面板 */
.tree-select-dropdown {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08),
              0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
  max-height: 300px;
  overflow-y: auto;
}

/* 搜索框 */
.tree-select-search {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.tree-select-search-input {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.tree-select-search-input:focus {
  border-color: var(--primary-color, #4B6EF5);
}

/* 树列表 */
.tree-select-tree {
  padding: 4px 0;
}

/* 空状态 */
.tree-select-empty {
  padding: 24px;
  text-align: center;
  color: rgba(0, 0, 0, 0.25);
}

/* 动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
