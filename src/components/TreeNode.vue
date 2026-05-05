<template>
  <div 
    class="tree-node"
    :class="{ 
      'is-expanded': isExpanded,
      'is-selected': isSelected,
      'is-dragging': isDragging
    }"
    :style="{ paddingLeft: `${level * 20}px` }"
    @dragstart="handleDragStart"
    @dragover="handleDragOver"
    @dragend="handleDragEnd"
    :draggable="draggable"
  >
    <div 
      class="node-content"
      @click="handleClick"
    >
      <!-- 展开/折叠箭头 -->
      <span 
        class="node-arrow"
        :class="{ 'has-children': hasChildren }"
        @click.stop="handleExpand"
      >
        <IconLib 
          v-if="hasChildren" 
          name="chevron-right" 
          :size="14" 
          :class="{ 'rotated': isExpanded }"
        />
      </span>
      
      <!-- 复选框 -->
      <span v-if="checkable" class="node-checkbox" @click.stop="handleCheck">
        <IconLib 
          :name="checkIcon" 
          :size="16" 
          :class="{ 
            'checked': isChecked,
            'half-checked': isHalfChecked
          }"
        />
      </span>
      
      <!-- 图标 -->
      <span class="node-icon">
        <slot name="icon" :node="node">
          <IconLib 
            :name="nodeIcon" 
            :size="16"
          />
        </slot>
      </span>
      
      <!-- 标签 -->
      <span class="node-label">
        <slot name="label" :node="node">
          {{ node[labelField] }}
        </slot>
      </span>
      
      <!-- 额外内容 -->
      <span class="node-extra">
        <slot name="extra" :node="node"></slot>
      </span>
    </div>
    
    <!-- 子节点 -->
    <Transition name="expand">
      <div v-if="hasChildren && isExpanded" class="node-children">
        <TreeNode
          v-for="child in children"
          :key="child.id"
          :node="child"
          :level="level + 1"
          :selected-ids="selectedIds"
          :expanded-ids="expandedIds"
          :checkable="checkable"
          :checked-ids="checkedIds"
          :half-checked-ids="halfCheckedIds"
          :draggable="draggable"
          :icon-field="iconField"
          :label-field="labelField"
          :children-field="childrenField"
          @select="$emit('select', $event)"
          @expand="$emit('expand', $event)"
          @check="(n, c) => $emit('check', n, c)"
          @drag-start="$emit('drag-start', $event)"
          @drag-over="$emit('drag-over', $event)"
          @drag-end="$emit('drag-end')"
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
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
interface TreeNodeData {
  id: string | number
  [key: string]: any
}

// Props
interface Props {
  node: TreeNodeData
  level: number
  selectedIds: (string | number)[]
  expandedIds: (string | number)[]
  checkable: boolean
  checkedIds: (string | number)[]
  halfCheckedIds: Set<string | number>
  draggable: boolean
  iconField: string
  labelField: string
  childrenField: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'select': [node: TreeNodeData]
  'expand': [node: TreeNodeData]
  'check': [node: TreeNodeData, checked: boolean]
  'drag-start': [node: TreeNodeData]
  'drag-over': [node: TreeNodeData]
  'drag-end': []
}>()

// State
const isDragging = ref(false)

// Computed
const children = computed(() => {
  return props.node[props.childrenField] as TreeNodeData[] | undefined
})

const hasChildren = computed(() => {
  return children.value && children.value.length > 0
})

const isExpanded = computed(() => {
  return props.expandedIds.includes(props.node.id)
})

const isSelected = computed(() => {
  return props.selectedIds.includes(props.node.id)
})

const isChecked = computed(() => {
  return props.checkedIds.includes(props.node.id)
})

const isHalfChecked = computed(() => {
  return props.halfCheckedIds.has(props.node.id)
})

const checkIcon = computed(() => {
  if (isChecked.value) return 'check-square'
  if (isHalfChecked.value) return 'minus-square'
  return 'square'
})

const nodeIcon = computed(() => {
  if (props.node[props.iconField]) {
    return props.node[props.iconField]
  }
  
  if (hasChildren.value) {
    return isExpanded.value ? 'folder-open' : 'folder'
  }
  
  return 'file'
})

// Methods
function handleClick() {
  emit('select', props.node)
}

function handleExpand() {
  if (hasChildren.value) {
    emit('expand', props.node)
  }
}

function handleCheck() {
  emit('check', props.node, !isChecked.value)
}

function handleDragStart(e: DragEvent) {
  if (!props.draggable) return
  
  isDragging.value = true
  emit('drag-start', props.node)
  
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(props.node.id))
  }
}

function handleDragOver(e: DragEvent) {
  if (!props.draggable) return
  
  e.preventDefault()
  emit('drag-over', props.node)
}

function handleDragEnd() {
  isDragging.value = false
  emit('drag-end')
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.node-content:hover {
  background: #f5f5f5;
}

.is-selected > .node-content {
  background: rgba(75, 110, 245, 0.1);
  color: var(--primary-color, #4B6EF5);
}

.is-dragging > .node-content {
  opacity: 0.5;
}

.node-arrow {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-arrow.has-children {
  cursor: pointer;
}

.node-arrow :deep(svg) {
  transition: transform 0.2s;
}

.node-arrow :deep(svg.rotated) {
  transform: rotate(90deg);
}

.node-checkbox {
  margin-right: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.node-checkbox :deep(svg) {
  color: #ccc;
  transition: color 0.2s;
}

.node-checkbox :deep(svg.checked) {
  color: var(--primary-color, #4B6EF5);
}

.node-checkbox :deep(svg.half-checked) {
  color: var(--primary-color, #4B6EF5);
}

.node-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
  color: #666;
}

.is-selected .node-icon {
  color: var(--primary-color, #4B6EF5);
}

.node-label {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-extra {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s;
}

.node-content:hover .node-extra {
  opacity: 1;
}

.node-children {
  overflow: hidden;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease-out;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
