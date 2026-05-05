<template>
  <div 
    class="tree"
    :class="{ 'tree--checkable': checkable }"
  >
    <TreeNode
      v-for="node in treeData"
      :key="node.key"
      :node="node"
      :level="0"
      :expanded-keys="expandedKeys"
      :selected-keys="selectedKeys"
      :checked-keys="checkedKeys"
      :checkable="checkable"
      :selectable="selectable"
      :show-icon="showIcon"
      :default-expand-all="defaultExpandAll"
      :indent="indent"
      @expand="handleExpand"
      @select="handleSelect"
      @check="handleCheck"
    >
      <template #title="slotProps">
        <slot name="title" v-bind="slotProps">
          {{ slotProps.node.title }}
        </slot>
      </template>
      
      <template #icon="slotProps">
        <slot name="icon" v-bind="slotProps" />
      </template>
    </TreeNode>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import TreeNode from './TreeNode.vue'

export interface TreeNodeData {
  key: string | number
  title: string
  icon?: string
  disabled?: boolean
  isLeaf?: boolean
  children?: TreeNodeData[]
  [key: string]: any
}

interface Props {
  // 树数据
  treeData?: TreeNodeData[]
  // 展开的节点 keys
  expandedKeys?: (string | number)[]
  // 选中的节点 keys
  selectedKeys?: (string | number)[]
  // 勾选的节点 keys
  checkedKeys?: (string | number)[]
  // 是否可勾选
  checkable?: boolean
  // 是否可选择
  selectable?: boolean
  // 是否显示图标
  showIcon?: boolean
  // 默认展开所有
  defaultExpandAll?: boolean
  // 缩进
  indent?: number
  // 是否显示连线
  showLine?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  treeData: () => [],
  expandedKeys: () => [],
  selectedKeys: () => [],
  checkedKeys: () => [],
  checkable: false,
  selectable: true,
  showIcon: false,
  defaultExpandAll: false,
  indent: 24,
  showLine: false
})

const emit = defineEmits<{
  (e: 'update:expandedKeys', keys: (string | number)[]): void
  (e: 'update:selectedKeys', keys: (string | number)[]): void
  (e: 'update:checkedKeys', keys: (string | number)[]): void
  (e: 'expand', keys: (string | number)[], node: TreeNodeData): void
  (e: 'select', keys: (string | number)[], node: TreeNodeData): void
  (e: 'check', keys: (string | number)[], node: TreeNodeData, checked: boolean): void
}>()

// 内部展开状态
const internalExpandedKeys = ref<(string | number)[]>([...props.expandedKeys])
const internalSelectedKeys = ref<(string | number)[]>([...props.selectedKeys])
const internalCheckedKeys = ref<(string | number)[]>([...props.checkedKeys])

// 计算展开的 keys
const expandedKeys = computed({
  get: () => props.expandedKeys.length ? props.expandedKeys : internalExpandedKeys.value,
  set: (val) => {
    internalExpandedKeys.value = val
    emit('update:expandedKeys', val)
  }
})

const selectedKeys = computed({
  get: () => props.selectedKeys.length ? props.selectedKeys : internalSelectedKeys.value,
  set: (val) => {
    internalSelectedKeys.value = val
    emit('update:selectedKeys', val)
  }
})

const checkedKeys = computed({
  get: () => props.checkedKeys.length ? props.checkedKeys : internalCheckedKeys.value,
  set: (val) => {
    internalCheckedKeys.value = val
    emit('update:checkedKeys', val)
  }
})

// 展开/折叠
function handleExpand(node: TreeNodeData) {
  const key = node.key
  const keys = [...expandedKeys.value]
  const index = keys.indexOf(key)
  
  if (index > -1) {
    keys.splice(index, 1)
  } else {
    keys.push(key)
  }
  
  expandedKeys.value = keys
  emit('expand', keys, node)
}

// 选择
function handleSelect(node: TreeNodeData) {
  if (!props.selectable || node.disabled) return
  
  const keys = [node.key]
  selectedKeys.value = keys
  emit('select', keys, node)
}

// 勾选
function handleCheck(node: TreeNodeData, checked: boolean) {
  if (!props.checkable || node.disabled) return
  
  const keys = [...checkedKeys.value]
  const index = keys.indexOf(node.key)
  
  if (checked && index === -1) {
    keys.push(node.key)
  } else if (!checked && index > -1) {
    keys.splice(index, 1)
  }
  
  checkedKeys.value = keys
  emit('check', keys, node, checked)
}

// 默认展开所有
if (props.defaultExpandAll) {
  const getAllKeys = (nodes: TreeNodeData[]): (string | number)[] => {
    const keys: (string | number)[] = []
    const traverse = (list: TreeNodeData[]) => {
      list.forEach(node => {
        if (node.children?.length) {
          keys.push(node.key)
          traverse(node.children)
        }
      })
    }
    traverse(nodes)
    return keys
  }
  
  internalExpandedKeys.value = getAllKeys(props.treeData)
}

// 提供给子组件
provide('treeProps', props)
</script>

<style scoped>
.tree {
  font-size: 14px;
  color: var(--text-color, #303133);
}
</style>
