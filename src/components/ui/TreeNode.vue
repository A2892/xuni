<template>
  <div 
    class="tree-node"
    :class="nodeClasses"
  >
    <div 
      class="tree-node__content"
      :style="contentStyle"
      @click="handleClick"
    >
      <!-- 展开图标 -->
      <span 
        class="tree-node__expand"
        :class="{ 'tree-node__expand--expanded': isExpanded }"
        @click.stop="handleExpand"
      >
        <IconLib 
          v-if="!node.isLeaf && hasChildren" 
          name="right" 
          :size="12"
        />
      </span>
      
      <!-- 勾选框 -->
      <span v-if="checkable" class="tree-node__checkbox" @click.stop="handleCheck">
        <input 
          type="checkbox" 
          :checked="isChecked"
          :disabled="node.disabled"
        />
      </span>
      
      <!-- 图标 -->
      <span v-if="showIcon" class="tree-node__icon">
        <slot name="icon" :node="node">
          <IconLib 
            :name="node.icon || (hasChildren ? 'folder' : 'file')" 
            :size="16"
          />
        </slot>
      </span>
      
      <!-- 标题 -->
      <span class="tree-node__title">
        <slot name="title" :node="node">
          {{ node.title }}
        </slot>
      </span>
    </div>
    
    <!-- 子节点 -->
    <Transition name="tree-expand">
      <div v-if="hasChildren && isExpanded" class="tree-node__children">
        <TreeNode
          v-for="child in node.children"
          :key="child.key"
          :node="child"
          :level="level + 1"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedKeys"
          :checked-keys="checkedKeys"
          :checkable="checkable"
          :selectable="selectable"
          :show-icon="showIcon"
          :indent="indent"
          @expand="$emit('expand', $event)"
          @select="$emit('select', $event)"
          @check="$emit('check', $event)"
        >
          <template #title="slotProps">
            <slot name="title" v-bind="slotProps" />
          </template>
          
          <template #icon="slotProps">
            <slot name="icon" v-bind="slotProps" />
          </template>
        </TreeNode>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface TreeNodeData {
  key: string | number
  title: string
  icon?: string
  disabled?: boolean
  isLeaf?: boolean
  children?: TreeNodeData[]
  [key: string]: any
}

interface Props {
  node: TreeNodeData
  level: number
  expandedKeys: (string | number)[]
  selectedKeys: (string | number)[]
  checkedKeys: (string | number)[]
  checkable: boolean
  selectable: boolean
  showIcon: boolean
  indent: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'expand', node: TreeNodeData): void
  (e: 'select', node: TreeNodeData): void
  (e: 'check', node: TreeNodeData, checked: boolean): void
}>()

const hasChildren = computed(() => 
  props.node.children && props.node.children.length > 0
)

const isExpanded = computed(() => 
  props.expandedKeys.includes(props.node.key)
)

const isSelected = computed(() => 
  props.selectedKeys.includes(props.node.key)
)

const isChecked = computed(() => 
  props.checkedKeys.includes(props.node.key)
)

const nodeClasses = computed(() => [
  {
    'tree-node--expanded': isExpanded.value,
    'tree-node--selected': isSelected.value,
    'tree-node--checked': isChecked.value,
    'tree-node--disabled': props.node.disabled,
    'tree-node--leaf': props.node.isLeaf || !hasChildren.value
  }
])

const contentStyle = computed(() => ({
  paddingLeft: `${props.level * props.indent}px`
}))

function handleExpand() {
  if (hasChildren.value) {
    emit('expand', props.node)
  }
}

function handleClick() {
  if (props.selectable && !props.node.disabled) {
    emit('select', props.node)
  }
}

function handleCheck() {
  if (props.checkable && !props.node.disabled) {
    emit('check', props.node, !isChecked.value)
  }
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.tree-node__content {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tree-node__content:hover {
  background: var(--bg-hover, #f5f7fa);
}

.tree-node--selected > .tree-node__content {
  background: var(--primary-light, #ecf5ff);
}

.tree-node--disabled > .tree-node__content {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 展开图标 */
.tree-node__expand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  color: var(--text-secondary, #909399);
  transition: transform 0.2s;
}

.tree-node__expand--expanded {
  transform: rotate(90deg);
}

/* 勾选框 */
.tree-node__checkbox {
  display: flex;
  align-items: center;
  margin-right: 4px;
}

.tree-node__checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* 图标 */
.tree-node__icon {
  display: flex;
  align-items: center;
  margin-right: 6px;
  color: var(--text-secondary, #909399);
}

/* 标题 */
.tree-node__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 子节点 */
.tree-node__children {
  overflow: hidden;
}

/* 展开动画 */
.tree-expand-enter-active,
.tree-expand-leave-active {
  transition: all 0.2s ease;
}

.tree-expand-enter-from,
.tree-expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
