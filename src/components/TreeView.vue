<template>
  <div 
    class="tree-view"
    @dragover.prevent
    @drop="handleDrop"
  >
    <div v-if="searchable" class="tree-search">
      <input 
        v-model="searchQuery"
        type="text"
        :placeholder="searchPlaceholder"
        @input="handleSearch"
      />
      <IconLib name="search" :size="16" class="search-icon" />
    </div>
    
    <div class="tree-content" ref="treeRef">
      <TreeNode
        v-for="node in filteredNodes"
        :key="node.id"
        :node="node"
        :level="0"
        :selected-ids="selectedIds"
        :expanded-ids="expandedIds"
        :checkable="checkable"
        :checked-ids="checkedIds"
        :half-checked-ids="halfCheckedIds"
        :draggable="draggable"
        :icon-field="iconField"
        :label-field="labelField"
        :children-field="childrenField"
        @select="handleSelect"
        @expand="handleExpand"
        @check="handleCheck"
        @drag-start="handleDragStart"
        @drag-over="handleDragOver"
        @drag-end="handleDragEnd"
      >
        <template #icon="{ node: n }">
          <slot name="icon" :node="n"></slot>
        </template>
        <template #label="{ node: n }">
          <slot name="label" :node="n"></slot>
        </template>
        <template #extra="{ node: n }">
          <slot name="extra" :node="n"></slot>
        </template>
      </TreeNode>
      
      <div v-if="filteredNodes.length === 0" class="tree-empty">
        <IconLib name="folder-open" :size="32" />
        <p>{{ emptyText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'
import TreeNode from './TreeNode.vue'

// Types
interface TreeNodeData {
  id: string | number
  [key: string]: any
}

// Props
interface Props {
  data: TreeNodeData[]
  selectedIds?: (string | number)[]
  expandedIds?: (string | number)[]
  defaultExpandAll?: boolean
  checkable?: boolean
  checkedIds?: (string | number)[]
  draggable?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  emptyText?: string
  iconField?: string
  labelField?: string
  childrenField?: string
  multiple?: boolean
  accordion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: () => [],
  expandedIds: () => [],
  defaultExpandAll: false,
  checkable: false,
  checkedIds: () => [],
  draggable: false,
  searchable: false,
  searchPlaceholder: '搜索...',
  emptyText: '暂无数据',
  iconField: 'icon',
  labelField: 'label',
  childrenField: 'children',
  multiple: false,
  accordion: false
})

// Emits
const emit = defineEmits<{
  'update:selectedIds': [ids: (string | number)[]]
  'update:expandedIds': [ids: (string | number)[]]
  'update:checkedIds': [ids: (string | number)[]]
  'select': [node: TreeNodeData, selected: boolean]
  'expand': [node: TreeNodeData, expanded: boolean]
  'check': [node: TreeNodeData, checked: boolean]
  'drop': [dragNode: TreeNodeData, dropNode: TreeNodeData, position: 'before' | 'after' | 'inside']
}>()

// Refs
const treeRef = ref<HTMLElement | null>(null)

// State
const searchQuery = ref('')
const internalSelectedIds = ref<Set<string | number>>(new Set(props.selectedIds))
const internalExpandedIds = ref<Set<string | number>>(new Set(props.expandedIds))
const internalCheckedIds = ref<Set<string | number>>(new Set(props.checkedIds))
const halfCheckedIds = ref<Set<string | number>>(new Set())
const dragNode = ref<TreeNodeData | null>(null)

// Computed
const selectedIds = computed(() => Array.from(internalSelectedIds.value))
const expandedIds = computed(() => Array.from(internalExpandedIds.value))
const checkedIds = computed(() => Array.from(internalCheckedIds.value))

const filteredNodes = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.data
  }
  
  return filterNodes(props.data, searchQuery.value.toLowerCase())
})

// Methods
function filterNodes(nodes: TreeNodeData[], query: string): TreeNodeData[] {
  const result: TreeNodeData[] = []
  
  for (const node of nodes) {
    const label = node[props.labelField] as string
    const children = node[props.childrenField] as TreeNodeData[] | undefined
    
    if (label.toLowerCase().includes(query)) {
      result.push(node)
    } else if (children && children.length > 0) {
      const filteredChildren = filterNodes(children, query)
      if (filteredChildren.length > 0) {
        result.push({
          ...node,
          [props.childrenField]: filteredChildren
        })
      }
    }
  }
  
  return result
}

function handleSelect(node: TreeNodeData) {
  const id = node.id
  const isSelected = internalSelectedIds.value.has(id)
  
  if (props.multiple) {
    if (isSelected) {
      internalSelectedIds.value.delete(id)
    } else {
      internalSelectedIds.value.add(id)
    }
  } else {
    internalSelectedIds.value.clear()
    if (!isSelected) {
      internalSelectedIds.value.add(id)
    }
  }
  
  emit('update:selectedIds', selectedIds.value)
  emit('select', node, !isSelected)
}

function handleExpand(node: TreeNodeData) {
  const id = node.id
  const isExpanded = internalExpandedIds.value.has(id)
  
  if (props.accordion) {
    // 手风琴模式：同级只能展开一个
    const siblings = findSiblings(props.data, id)
    siblings.forEach(siblingId => {
      internalExpandedIds.value.delete(siblingId)
    })
  }
  
  if (isExpanded) {
    internalExpandedIds.value.delete(id)
  } else {
    internalExpandedIds.value.add(id)
  }
  
  emit('update:expandedIds', expandedIds.value)
  emit('expand', node, !isExpanded)
}

function findSiblings(nodes: TreeNodeData[], targetId: string | number, parent: TreeNodeData[] = nodes): (string | number)[] {
  for (const node of nodes) {
    if (node.id === targetId) {
      return parent.map(n => n.id).filter(id => id !== targetId)
    }
    
    const children = node[props.childrenField] as TreeNodeData[] | undefined
    if (children && children.length > 0) {
      const result = findSiblings(children, targetId, children)
      if (result.length > 0) {
        return result
      }
    }
  }
  
  return []
}

function handleCheck(node: TreeNodeData, checked: boolean) {
  const id = node.id
  
  if (checked) {
    internalCheckedIds.value.add(id)
    // 同时选中所有子节点
    checkChildren(node, true)
  } else {
    internalCheckedIds.value.delete(id)
    // 同时取消所有子节点
    checkChildren(node, false)
  }
  
  // 更新父节点状态
  updateParentCheckState(props.data, id)
  
  emit('update:checkedIds', checkedIds.value)
  emit('check', node, checked)
}

function checkChildren(node: TreeNodeData, checked: boolean) {
  const children = node[props.childrenField] as TreeNodeData[] | undefined
  if (!children) return
  
  for (const child of children) {
    if (checked) {
      internalCheckedIds.value.add(child.id)
    } else {
      internalCheckedIds.value.delete(child.id)
    }
    checkChildren(child, checked)
  }
}

function updateParentCheckState(nodes: TreeNodeData[], targetId: string | number, parent?: TreeNodeData) {
  for (const node of nodes) {
    const children = node[props.childrenField] as TreeNodeData[] | undefined
    
    if (children && children.length > 0) {
      // 检查是否是目标节点的父节点
      if (children.some(child => child.id === targetId)) {
        updateNodeCheckState(node)
        if (parent) {
          updateParentCheckState(props.data, node.id)
        }
        return
      }
      
      updateParentCheckState(children, targetId, node)
    }
  }
}

function updateNodeCheckState(node: TreeNodeData) {
  const children = node[props.childrenField] as TreeNodeData[] | undefined
  if (!children || children.length === 0) return
  
  const checkedCount = children.filter(child => internalCheckedIds.value.has(child.id)).length
  const halfCheckedCount = children.filter(child => halfCheckedIds.value.has(child.id)).length
  
  if (checkedCount === 0 && halfCheckedCount === 0) {
    internalCheckedIds.value.delete(node.id)
    halfCheckedIds.value.delete(node.id)
  } else if (checkedCount === children.length) {
    internalCheckedIds.value.add(node.id)
    halfCheckedIds.value.delete(node.id)
  } else {
    internalCheckedIds.value.delete(node.id)
    halfCheckedIds.value.add(node.id)
  }
}

function handleSearch() {
  // 搜索时展开匹配节点的父节点
  if (searchQuery.value.trim()) {
    expandMatchedParents(props.data, searchQuery.value.toLowerCase())
  }
}

function expandMatchedParents(nodes: TreeNodeData[], query: string): boolean {
  let hasMatch = false
  
  for (const node of nodes) {
    const label = node[props.labelField] as string
    const children = node[props.childrenField] as TreeNodeData[] | undefined
    
    if (label.toLowerCase().includes(query)) {
      hasMatch = true
    }
    
    if (children && children.length > 0) {
      if (expandMatchedParents(children, query)) {
        internalExpandedIds.value.add(node.id)
        hasMatch = true
      }
    }
  }
  
  return hasMatch
}

// 拖拽处理
function handleDragStart(node: TreeNodeData) {
  dragNode.value = node
}

function handleDragOver(node: TreeNodeData) {
  // 拖拽悬停处理
}

function handleDragEnd() {
  dragNode.value = null
}

function handleDrop(e: DragEvent) {
  // 拖放处理
}

// 初始化展开所有节点
function expandAll() {
  const collectIds = (nodes: TreeNodeData[]) => {
    for (const node of nodes) {
      internalExpandedIds.value.add(node.id)
      const children = node[props.childrenField] as TreeNodeData[] | undefined
      if (children && children.length > 0) {
        collectIds(children)
      }
    }
  }
  collectIds(props.data)
}

function collapseAll() {
  internalExpandedIds.value.clear()
}

// Watch
watch(() => props.selectedIds, (newIds) => {
  internalSelectedIds.value = new Set(newIds)
})

watch(() => props.expandedIds, (newIds) => {
  internalExpandedIds.value = new Set(newIds)
})

watch(() => props.checkedIds, (newIds) => {
  internalCheckedIds.value = new Set(newIds)
})

// 默认展开所有
if (props.defaultExpandAll) {
  expandAll()
}

// Expose
defineExpose({
  expandAll,
  collapseAll,
  getSelectedNodes: () => selectedIds.value,
  getCheckedNodes: () => checkedIds.value
})
</script>

<style scoped>
.tree-view {
  background: white;
  border-radius: 8px;
}

.tree-search {
  position: relative;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.tree-search input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.tree-search input:focus {
  outline: none;
  border-color: var(--primary-color, #4B6EF5);
}

.search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.tree-content {
  padding: 8px 0;
  max-height: 400px;
  overflow-y: auto;
}

.tree-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
}

.tree-empty p {
  margin: 12px 0 0;
  font-size: 14px;
}
</style>
