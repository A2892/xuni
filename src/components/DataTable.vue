<script setup lang="ts">
/**
 * 数据表格组件
 * 支持排序、筛选、分页和自定义列
 */
import { ref, computed, watch } from 'vue'
import IconLibrary from './icons/IconLibrary.vue'

interface Column {
  key: string
  title: string
  width?: string | number
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  render?: (row: any, index: number) => any
}

interface SortState {
  key: string
  order: 'asc' | 'desc'
}

const props = withDefaults(defineProps<{
  columns: Column[]
  data: any[]
  loading?: boolean
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  emptyText?: string
  rowKey?: string
}>(), {
  loading: false,
  striped: true,
  bordered: false,
  hoverable: true,
  selectable: false,
  pagination: true,
  pageSize: 10,
  emptyText: '暂无数据',
  rowKey: 'id'
})

const emit = defineEmits<{
  'row-click': [row: any, index: number]
  'selection-change': [selectedRows: any[]]
  'sort-change': [sortState: SortState | null]
}>()

// 状态
const currentPage = ref(1)
const sortState = ref<SortState | null>(null)
const selectedKeys = ref<Set<any>>(new Set())

// 排序后的数据
const sortedData = computed(() => {
  if (!sortState.value) return props.data
  
  const { key, order } = sortState.value
  return [...props.data].sort((a, b) => {
    const valueA = a[key]
    const valueB = b[key]
    
    if (valueA === valueB) return 0
    if (valueA === null || valueA === undefined) return 1
    if (valueB === null || valueB === undefined) return -1
    
    const comparison = valueA < valueB ? -1 : 1
    return order === 'asc' ? comparison : -comparison
  })
})

// 分页后的数据
const paginatedData = computed(() => {
  if (!props.pagination) return sortedData.value
  
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return sortedData.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(props.data.length / props.pageSize)
})

// 是否全选
const isAllSelected = computed(() => {
  if (paginatedData.value.length === 0) return false
  return paginatedData.value.every(row => selectedKeys.value.has(row[props.rowKey]))
})

// 是否部分选择
const isIndeterminate = computed(() => {
  const selected = paginatedData.value.filter(row => selectedKeys.value.has(row[props.rowKey]))
  return selected.length > 0 && selected.length < paginatedData.value.length
})

// 选中的行
const selectedRows = computed(() => {
  return props.data.filter(row => selectedKeys.value.has(row[props.rowKey]))
})

// 排序处理
function handleSort(column: Column) {
  if (!column.sortable) return
  
  if (sortState.value?.key === column.key) {
    if (sortState.value.order === 'asc') {
      sortState.value = { key: column.key, order: 'desc' }
    } else {
      sortState.value = null
    }
  } else {
    sortState.value = { key: column.key, order: 'asc' }
  }
  
  emit('sort-change', sortState.value)
}

// 获取排序图标
function getSortIcon(column: Column): string {
  if (sortState.value?.key !== column.key) return 'chevron-down'
  return sortState.value.order === 'asc' ? 'chevron-up' : 'chevron-down'
}

// 行点击
function handleRowClick(row: any, index: number) {
  emit('row-click', row, index)
}

// 选择处理
function handleSelectAll() {
  if (isAllSelected.value) {
    paginatedData.value.forEach(row => {
      selectedKeys.value.delete(row[props.rowKey])
    })
  } else {
    paginatedData.value.forEach(row => {
      selectedKeys.value.add(row[props.rowKey])
    })
  }
  emit('selection-change', selectedRows.value)
}

function handleSelectRow(row: any) {
  const key = row[props.rowKey]
  if (selectedKeys.value.has(key)) {
    selectedKeys.value.delete(key)
  } else {
    selectedKeys.value.add(key)
  }
  emit('selection-change', selectedRows.value)
}

// 分页处理
function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// 获取对齐样式
function getAlignClass(align?: string): string {
  if (!align) return 'text-left'
  return `text-${align}`
}

// 监听数据变化重置页码
watch(() => props.data, () => {
  currentPage.value = 1
  selectedKeys.value.clear()
})
</script>

<template>
  <div class="data-table-wrapper">
    <div :class="['data-table', { 'data-table--bordered': bordered }]">
      <table>
        <thead>
          <tr>
            <!-- 选择列 -->
            <th v-if="selectable" class="selection-cell">
              <input 
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="handleSelectAll"
              />
            </th>
            
            <!-- 数据列 -->
            <th 
              v-for="column in columns" 
              :key="column.key"
              :class="[getAlignClass(column.align), { sortable: column.sortable }]"
              :style="{ width: typeof column.width === 'number' ? `${column.width}px` : column.width }"
              @click="handleSort(column)"
            >
              <div class="th-content">
                <span>{{ column.title }}</span>
                <span v-if="column.sortable" class="sort-icon">
                  <IconLibrary 
                    :name="getSortIcon(column)" 
                    :size="14"
                    :class="{ active: sortState?.key === column.key }"
                  />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        
        <tbody>
          <!-- 加载状态 -->
          <tr v-if="loading" class="loading-row">
            <td :colspan="selectable ? columns.length + 1 : columns.length">
              <div class="loading-content">
                <IconLibrary name="loader" :size="24" class="spin" />
                <span>加载中...</span>
              </div>
            </td>
          </tr>
          
          <!-- 空数据 -->
          <tr v-else-if="paginatedData.length === 0" class="empty-row">
            <td :colspan="selectable ? columns.length + 1 : columns.length">
              <div class="empty-content">
                <IconLibrary name="folder-open" :size="48" color="#D1D5DB" />
                <span>{{ emptyText }}</span>
              </div>
            </td>
          </tr>
          
          <!-- 数据行 -->
          <tr 
            v-else
            v-for="(row, index) in paginatedData" 
            :key="row[rowKey] || index"
            :class="[
              { 'stripe': striped && index % 2 === 1 },
              { 'hoverable': hoverable },
              { 'selected': selectedKeys.has(row[rowKey]) }
            ]"
            @click="handleRowClick(row, index)"
          >
            <!-- 选择列 -->
            <td v-if="selectable" class="selection-cell" @click.stop>
              <input 
                type="checkbox"
                :checked="selectedKeys.has(row[rowKey])"
                @change="handleSelectRow(row)"
              />
            </td>
            
            <!-- 数据列 -->
            <td 
              v-for="column in columns" 
              :key="column.key"
              :class="getAlignClass(column.align)"
            >
              <slot :name="column.key" :row="row" :index="index" :value="row[column.key]">
                {{ column.render ? column.render(row, index) : row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页 -->
    <div v-if="pagination && totalPages > 1" class="pagination">
      <div class="pagination-info">
        共 {{ data.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
      </div>
      
      <div class="pagination-buttons">
        <button 
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          <IconLibrary name="arrow-left" :size="14" />
          <IconLibrary name="arrow-left" :size="14" style="margin-left: -8px" />
        </button>
        
        <button 
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <IconLibrary name="arrow-left" :size="14" />
        </button>
        
        <template v-for="page in totalPages" :key="page">
          <button 
            v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
            :class="['page-btn', { active: page === currentPage }]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span 
            v-else-if="page === currentPage - 2 || page === currentPage + 2" 
            class="page-ellipsis"
          >
            ...
          </span>
        </template>
        
        <button 
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <IconLibrary name="arrow-right" :size="14" />
        </button>
        
        <button 
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          <IconLibrary name="arrow-right" :size="14" />
          <IconLibrary name="arrow-right" :size="14" style="margin-left: -8px" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table-wrapper {
  width: 100%;
}

.data-table {
  width: 100%;
  overflow-x: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table--bordered {
  border: 1px solid #E5E7EB;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: #F9FAFB;
}

th {
  padding: 12px 16px;
  font-weight: 600;
  color: #374151;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
  white-space: nowrap;
}

th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

th.sortable:hover {
  background: #F3F4F6;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-icon {
  display: flex;
  color: #9CA3AF;
  transition: color 0.2s;
}

.sort-icon.active {
  color: #4B6EF5;
}

td {
  padding: 12px 16px;
  color: #4B5563;
  border-bottom: 1px solid #F3F4F6;
}

tr:last-child td {
  border-bottom: none;
}

.stripe {
  background: #F9FAFB;
}

.hoverable {
  cursor: pointer;
  transition: background 0.15s;
}

.hoverable:hover {
  background: #EFF6FF;
}

.selected {
  background: #DBEAFE !important;
}

.selection-cell {
  width: 48px;
  text-align: center;
}

.selection-cell input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #4B6EF5;
}

.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* 加载和空状态 */
.loading-row td,
.empty-row td {
  padding: 48px 16px;
}

.loading-content,
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #9CA3AF;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  font-size: 13px;
  color: #6B7280;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  color: #374151;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #4B6EF5;
  color: #4B6EF5;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background: linear-gradient(135deg, #4B6EF5 0%, #6C5CE7 100%);
  border-color: transparent;
  color: white;
}

.page-ellipsis {
  color: #9CA3AF;
  padding: 0 4px;
}

/* 响应式 */
@media (max-width: 640px) {
  th, td {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .pagination {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination-info {
    text-align: center;
  }
  
  .pagination-buttons {
    justify-content: center;
  }
}
</style>
