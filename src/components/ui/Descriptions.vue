<template>
  <div 
    class="descriptions"
    :class="[
      `descriptions--${size}`,
      `descriptions--${layout}`,
      { 'descriptions--bordered': bordered }
    ]"
  >
    <div v-if="title || $slots.title || extra || $slots.extra" class="descriptions__header">
      <div class="descriptions__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="extra || $slots.extra" class="descriptions__extra">
        <slot name="extra">{{ extra }}</slot>
      </div>
    </div>
    
    <div class="descriptions__body">
      <table class="descriptions__table">
        <tbody>
          <tr 
            v-for="(row, rowIndex) in rows" 
            :key="rowIndex"
            class="descriptions__row"
          >
            <template v-for="(item, colIndex) in row" :key="colIndex">
              <th 
                class="descriptions__label"
                :style="{ width: labelWidth }"
              >
                {{ item.label }}
                <span v-if="colon">:</span>
              </th>
              <td 
                class="descriptions__content"
                :colspan="item.span > 1 ? item.span * 2 - 1 : 1"
              >
                <slot :name="item.name" v-bind="item">
                  {{ item.value }}
                </slot>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface DescriptionItem {
  label: string
  value?: string | number
  span?: number
  name?: string
}

interface Props {
  // 标题
  title?: string
  // 额外内容
  extra?: string
  // 列数
  column?: number
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 是否显示边框
  bordered?: boolean
  // 布局
  layout?: 'horizontal' | 'vertical'
  // 标签宽度
  labelWidth?: string
  // 是否显示冒号
  colon?: boolean
  // 描述项
  items?: DescriptionItem[]
}

const props = withDefaults(defineProps<Props>(), {
  column: 3,
  size: 'default',
  bordered: false,
  layout: 'horizontal',
  colon: true,
  items: () => []
})

// 计算行
const rows = computed(() => {
  const result: DescriptionItem[][] = []
  let currentRow: DescriptionItem[] = []
  let currentSpan = 0
  
  for (const item of props.items) {
    const span = item.span || 1
    
    // 如果当前行放不下
    if (currentSpan + span > props.column) {
      if (currentRow.length > 0) {
        result.push(currentRow)
      }
      currentRow = []
      currentSpan = 0
    }
    
    currentRow.push({ ...item, span })
    currentSpan += span
    
    // 如果当前行满了
    if (currentSpan >= props.column) {
      result.push(currentRow)
      currentRow = []
      currentSpan = 0
    }
  }
  
  // 处理最后一行
  if (currentRow.length > 0) {
    result.push(currentRow)
  }
  
  return result
})
</script>

<style scoped>
.descriptions {
  width: 100%;
}

.descriptions__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.descriptions__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color, #303133);
}

.descriptions__extra {
  color: var(--text-secondary, #606266);
}

.descriptions__body {
  width: 100%;
}

.descriptions__table {
  width: 100%;
  border-collapse: collapse;
}

.descriptions__row {
  border-bottom: 1px solid var(--border-color, #e4e7ed);
}

.descriptions__label {
  padding: 12px 16px;
  background: var(--bg-hover, #fafafa);
  font-weight: 500;
  color: var(--text-color, #303133);
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
}

.descriptions__content {
  padding: 12px 16px;
  color: var(--text-secondary, #606266);
  word-break: break-word;
  vertical-align: top;
}

/* 边框样式 */
.descriptions--bordered .descriptions__table {
  border: 1px solid var(--border-color, #e4e7ed);
}

.descriptions--bordered .descriptions__label,
.descriptions--bordered .descriptions__content {
  border: 1px solid var(--border-color, #e4e7ed);
}

/* 垂直布局 */
.descriptions--vertical .descriptions__label,
.descriptions--vertical .descriptions__content {
  display: block;
  width: 100%;
  padding: 8px 16px;
}

.descriptions--vertical .descriptions__label {
  padding-bottom: 4px;
}

.descriptions--vertical .descriptions__content {
  padding-top: 4px;
}

/* 尺寸 */
.descriptions--small .descriptions__label,
.descriptions--small .descriptions__content {
  padding: 8px 12px;
  font-size: 13px;
}

.descriptions--large .descriptions__label,
.descriptions--large .descriptions__content {
  padding: 16px 20px;
  font-size: 15px;
}

/* 无边框样式 */
.descriptions:not(.descriptions--bordered) .descriptions__label {
  background: transparent;
  padding-left: 0;
}

.descriptions:not(.descriptions--bordered) .descriptions__content {
  padding-left: 8px;
}

.descriptions:not(.descriptions--bordered) .descriptions__row:last-child {
  border-bottom: none;
}
</style>
