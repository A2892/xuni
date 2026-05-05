<template>
  <div class="table-wrapper" :class="wrapperClasses">
    <!-- 表头固定容器 -->
    <div v-if="sticky" class="table__header-wrapper" ref="headerWrapperRef">
      <table class="table" :class="tableClasses">
        <colgroup>
          <col 
            v-for="(col, index) in displayColumns" 
            :key="index"
            :style="{ width: col.width ? `${col.width}px` : 'auto' }"
          />
        </colgroup>
        <thead>
          <tr>
            <th 
              v-if="selectable"
              class="table__cell table__cell--checkbox"
            >
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
              />
            </th>
            <th
              v-for="col in displayColumns"
              :key="col.key"
              class="table__cell table__cell--header"
              :class="getHeaderCellClass(col)"
              @click="col.sortable && handleSort(col.key)"
            >
              <div class="table__cell-content">
                <span>{{ col.title }}</span>
                <span v-if="col.sortable" class="table__sort-icon">
                  <IconLib 
                    :name="getSortIcon(col.key)" 
                    :size="14"
                    :class="{ 'table__sort-icon--active': sortKey === col.key }"
                  />
                </span>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>
    
    <!-- 表格主体 -->
    <div class="table__body-wrapper" ref="bodyWrapperRef" @scroll="handleScroll">
      <table class="table" :class="tableClasses">
        <colgroup>
          <col 
            v-for="(col, index) in displayColumns" 
            :key="index"
            :style="{ width: col.width ? `${col.width}px` : 'auto' }"
          />
        </colgroup>
        
        <!-- 非固定表头 -->
        <thead v-if="!sticky">
          <tr>
            <th 
              v-if="selectable"
              class="table__cell table__cell--checkbox"
            >
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
              />
            </th>
            <th
              v-for="col in displayColumns"
              :key="col.key"
              class="table__cell table__cell--header"
              :class="getHeaderCellClass(col)"
              @click="col.sortable && handleSort(col.key)"
            >
              <div class="table__cell-content">
                <span>{{ col.title }}</span>
                <span v-if="col.sortable" class="table__sort-icon">
                  <IconLib 
                    :name="getSortIcon(col.key)" 
                    :size="14"
                    :class="{ 'table__sort-icon--active': sortKey === col.key }"
                  />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        
        <tbody>
          <!-- 加载中 -->
          <tr v-if="loading" class="table__row--loading">
            <td :colspan="totalColumns" class="table__cell--center">
              <IconLib name="loading" :size="20" class="table__loading-icon" />
              <span>加载中...</span>
            </td>
          </tr>
          
          <!-- 空数据 -->
          <tr v-else-if="sortedData.length === 0" class="table__row--empty">
            <td :colspan="totalColumns" class="table__cell--center">
              <slot name="empty">
                <div class="table__empty">
                  <IconLib name="inbox" :size="48" />
                  <p>暂无数据</p>
                </div>
              </slot>
            </td>
          </tr>
          
          <!-- 数据行 -->
          <template v-else>
            <tr
              v-for="(row, rowIndex) in sortedData"
              :key="getRowKey(row, rowIndex)"
              class="table__row"
              :class="getRowClass(row, rowIndex)"
              @click="$emit('row-click', row, rowIndex)"
            >
              <td 
                v-if="selectable"
                class="table__cell table__cell--checkbox"
              >
                <input 
                  type="checkbox" 
                  :checked="isRowSelected(row)"
                  @change="toggleSelect(row)"
                />
              </td>
              <td
                v-for="col in displayColumns"
                :key="col.key"
                class="table__cell"
                :class="getCellClass(col, row)"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="getCellValue(row, col.key)" :index="rowIndex">
                  {{ getCellValue(row, col.key) }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    
    <!-- 分页 -->
    <div v-if="pagination" class="table__pagination">
      <span class="table__pagination-total">共 {{ total }} 条</span>
      <div class="table__pagination-pages">
        <button 
          type="button"
          class="table__pagination-btn"
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
        >
          <IconLib name="left" :size="14" />
        </button>
        
        <template v-for="page in displayPages" :key="page">
          <span v-if="page === '...'" class="table__pagination-ellipsis">...</span>
          <button
            v-else
            type="button"
            class="table__pagination-btn"
            :class="{ 'table__pagination-btn--active': page === currentPage }"
            @click="changePage(page as number)"
          >
            {{ page }}
          </button>
        </template>
        
        <button 
          type="button"
          class="table__pagination-btn"
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
        >
          <IconLib name="right" :size="14" />
        </button>
      </div>
      
      <select 
        class="table__pagination-size"
        :value="pageSize"
        @change="changePageSize(Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="size in pageSizes" :key="size" :value="size">
          {{ size }} 条/页
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface TableColumn {
  key: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  fixed?: 'left' | 'right'
  ellipsis?: boolean
  className?: string
}

interface Props {
  // 表格数据
  data?: Record<string, any>[]
  // 列配置
  columns?: TableColumn[]
  // 行 key
  rowKey?: string | ((row: Record<string, any>) => string | number)
  // 是否可选择
  selectable?: boolean
  // 选中的行
  selectedRows?: Record<string, any>[]
  // 是否有边框
  bordered?: boolean
  // 是否有条纹
  striped?: boolean
  // 是否可悬停高亮
  hoverable?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 是否加载中
  loading?: boolean
  // 是否固定表头
  sticky?: boolean
  // 最大高度
  maxHeight?: number
  // 是否显示分页
  pagination?: boolean
  // 总数
  total?: number
  // 当前页
  page?: number
  // 每页条数
  pageSize?: number
  // 每页条数选项
  pageSizes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  selectable: false,
  selectedRows: () => [],
  bordered: false,
  striped: false,
  hoverable: true,
  size: 'default',
  loading: false,
  sticky: false,
  pagination: false,
  total: 0,
  page: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100]
})

const emit = defineEmits<{
  (e: 'update:selectedRows', rows: Record<string, any>[]): void
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'sort', key: string, order: 'asc' | 'desc' | null): void
  (e: 'row-click', row: Record<string, any>, index: number): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
}>()

const headerWrapperRef = ref<HTMLElement>()
const bodyWrapperRef = ref<HTMLElement>()

// 排序
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc' | null>(null)

// 分页
const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

// 显示的列
const displayColumns = computed(() => props.columns)

// 总列数
const totalColumns = computed(() => 
  displayColumns.value.length + (props.selectable ? 1 : 0)
)

// 排序后的数据
const sortedData = computed(() => {
  let result = [...props.data]
  
  if (sortKey.value && sortOrder.value) {
    result.sort((a, b) => {
      const aVal = getCellValue(a, sortKey.value!)
      const bVal = getCellValue(b, sortKey.value!)
      
      let comparison = 0
      if (aVal < bVal) comparison = -1
      if (aVal > bVal) comparison = 1
      
      return sortOrder.value === 'desc' ? -comparison : comparison
    })
  }
  
  return result
})

// 总页数
const totalPages = computed(() => 
  Math.ceil(props.total / currentPageSize.value)
)

// 显示的页码
const displayPages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    
    if (current > 4) {
      pages.push('...')
    }
    
    const start = Math.max(2, current - 2)
    const end = Math.min(total - 1, current + 2)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 3) {
      pages.push('...')
    }
    
    pages.push(total)
  }
  
  return pages
})

// 选中状态
const isAllSelected = computed(() => 
  props.data.length > 0 && 
  props.selectedRows.length === props.data.length
)

const isIndeterminate = computed(() => 
  props.selectedRows.length > 0 && 
  props.selectedRows.length < props.data.length
)

// 类名
const wrapperClasses = computed(() => [
  `table-wrapper--${props.size}`,
  {
    'table-wrapper--sticky': props.sticky
  }
])

const tableClasses = computed(() => [
  {
    'table--bordered': props.bordered,
    'table--striped': props.striped,
    'table--hoverable': props.hoverable
  }
])

// 获取行 key
function getRowKey(row: Record<string, any>, index: number): string | number {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  if (props.rowKey && row[props.rowKey] !== undefined) {
    return row[props.rowKey]
  }
  return index
}

// 获取单元格值
function getCellValue(row: Record<string, any>, key: string): any {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

// 获取行类名
function getRowClass(row: Record<string, any>, index: number) {
  return {
    'table__row--selected': isRowSelected(row)
  }
}

// 获取表头单元格类名
function getHeaderCellClass(col: TableColumn) {
  return [
    col.className,
    `table__cell--${col.align || 'left'}`,
    {
      'table__cell--sortable': col.sortable
    }
  ]
}

// 获取单元格类名
function getCellClass(col: TableColumn, row: Record<string, any>) {
  return [
    col.className,
    `table__cell--${col.align || 'left'}`,
    {
      'table__cell--ellipsis': col.ellipsis
    }
  ]
}

// 获取排序图标
function getSortIcon(key: string) {
  if (sortKey.value !== key) return 'sort'
  return sortOrder.value === 'asc' ? 'sort-asc' : 'sort-desc'
}

// 处理排序
function handleSort(key: string) {
  if (sortKey.value === key) {
    if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
    } else if (sortOrder.value === 'desc') {
      sortKey.value = null
      sortOrder.value = null
    }
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  
  emit('sort', sortKey.value || key, sortOrder.value)
}

// 选择相关
function isRowSelected(row: Record<string, any>) {
  return props.selectedRows.some(
    selected => getRowKey(selected, -1) === getRowKey(row, -1)
  )
}

function toggleSelect(row: Record<string, any>) {
  const newSelected = isRowSelected(row)
    ? props.selectedRows.filter(
        selected => getRowKey(selected, -1) !== getRowKey(row, -1)
      )
    : [...props.selectedRows, row]
  
  emit('update:selectedRows', newSelected)
}

function toggleSelectAll() {
  const newSelected = isAllSelected.value ? [] : [...props.data]
  emit('update:selectedRows', newSelected)
}

// 分页相关
function changePage(page: number) {
  currentPage.value = page
  emit('update:page', page)
  emit('page-change', page)
}

function changePageSize(size: number) {
  currentPageSize.value = size
  currentPage.value = 1
  emit('update:pageSize', size)
  emit('update:page', 1)
  emit('size-change', size)
}

// 滚动同步
function handleScroll() {
  if (headerWrapperRef.value && bodyWrapperRef.value) {
    headerWrapperRef.value.scrollLeft = bodyWrapperRef.value.scrollLeft
  }
}

// 监听 props 变化
watch(() => props.page, (val) => {
  currentPage.value = val
})

watch(() => props.pageSize, (val) => {
  currentPageSize.value = val
})
</script>

<style scoped>
.table-wrapper {
  width: 100%;
  background: var(--bg-color, #fff);
  border-radius: 8px;
  overflow: hidden;
}

.table-wrapper--sticky {
  display: flex;
  flex-direction: column;
}

.table__header-wrapper {
  overflow: hidden;
  border-bottom: 1px solid var(--border-color, #e4e7ed);
}

.table__body-wrapper {
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* 单元格 */
.table__cell {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #e4e7ed);
  text-align: left;
  font-size: 14px;
  color: var(--text-color, #303133);
}

.table__cell--header {
  background: var(--bg-secondary, #fafafa);
  font-weight: 500;
  color: var(--text-color, #303133);
}

.table__cell--left { text-align: left; }
.table__cell--center { text-align: center; }
.table__cell--right { text-align: right; }

.table__cell--checkbox {
  width: 48px;
  text-align: center;
}

.table__cell--ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table__cell--sortable {
  cursor: pointer;
  user-select: none;
}

.table__cell--sortable:hover {
  background: var(--bg-hover, #f5f7fa);
}

.table__cell-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 排序图标 */
.table__sort-icon {
  color: var(--text-secondary, #909399);
  transition: color 0.2s;
}

.table__sort-icon--active {
  color: var(--primary-color, #4B6EF5);
}

/* 行样式 */
.table__row--selected {
  background: var(--primary-light, #ecf5ff);
}

.table--striped tbody tr:nth-child(even) {
  background: var(--bg-secondary, #fafafa);
}

.table--hoverable tbody tr:hover {
  background: var(--bg-hover, #f5f7fa);
}

.table--bordered .table__cell {
  border: 1px solid var(--border-color, #e4e7ed);
}

/* 空状态 */
.table__empty {
  padding: 48px;
  text-align: center;
  color: var(--text-secondary, #909399);
}

.table__empty p {
  margin-top: 8px;
}

/* 加载中 */
.table__loading-icon {
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 分页 */
.table__pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-color, #e4e7ed);
}

.table__pagination-total {
  font-size: 14px;
  color: var(--text-secondary, #606266);
}

.table__pagination-pages {
  display: flex;
  gap: 4px;
}

.table__pagination-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.table__pagination-btn:hover:not(:disabled) {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.table__pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.table__pagination-btn--active {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.table__pagination-ellipsis {
  padding: 0 8px;
  line-height: 32px;
  color: var(--text-secondary, #909399);
}

.table__pagination-size {
  padding: 6px 8px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

/* 尺寸 */
.table-wrapper--small .table__cell {
  padding: 8px 12px;
  font-size: 13px;
}

.table-wrapper--large .table__cell {
  padding: 16px 20px;
  font-size: 15px;
}
</style>
