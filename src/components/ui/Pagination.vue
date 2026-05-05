<template>
  <nav 
    class="pagination"
    :class="[
      `pagination--${size}`,
      { 'pagination--simple': simple },
      { 'pagination--disabled': disabled }
    ]"
    aria-label="分页导航"
  >
    <!-- 总数显示 -->
    <span v-if="showTotal && !simple" class="pagination__total">
      {{ totalText || `共 ${total} 条` }}
    </span>
    
    <!-- 每页条数选择 -->
    <div v-if="showSizeChanger && !simple" class="pagination__size-changer">
      <select 
        :value="pageSize" 
        @change="handleSizeChange"
        :disabled="disabled"
      >
        <option 
          v-for="size in pageSizeOptions" 
          :key="size" 
          :value="size"
        >
          {{ size }} 条/页
        </option>
      </select>
    </div>
    
    <!-- 上一页 -->
    <button
      class="pagination__btn pagination__prev"
      :disabled="disabled || currentPage <= 1"
      @click="handlePrev"
      :title="'上一页'"
    >
      <IconLib name="chevron-left" :size="size === 'small' ? 14 : 16" />
    </button>
    
    <!-- 简洁模式 -->
    <template v-if="simple">
      <span class="pagination__simple-pager">
        <input
          type="text"
          :value="currentPage"
          @change="handleInputChange"
          @keyup.enter="handleInputChange"
          :disabled="disabled"
        />
        <span class="pagination__simple-separator">/</span>
        <span>{{ totalPages }}</span>
      </span>
    </template>
    
    <!-- 完整分页器 -->
    <template v-else>
      <ul class="pagination__list">
        <!-- 第一页 -->
        <li v-if="showFirstPage">
          <button
            class="pagination__item"
            :class="{ 'pagination__item--active': currentPage === 1 }"
            :disabled="disabled"
            @click="handlePageClick(1)"
          >
            1
          </button>
        </li>
        
        <!-- 前省略号 -->
        <li v-if="showPrevEllipsis" class="pagination__ellipsis">
          <button
            class="pagination__jump pagination__jump--prev"
            :disabled="disabled"
            @click="handleJumpPrev"
            @mouseenter="prevEllipsisHover = true"
            @mouseleave="prevEllipsisHover = false"
          >
            <IconLib 
              :name="prevEllipsisHover ? 'chevrons-left' : 'more-horizontal'" 
              :size="14" 
            />
          </button>
        </li>
        
        <!-- 页码 -->
        <li v-for="page in displayPages" :key="page">
          <button
            class="pagination__item"
            :class="{ 'pagination__item--active': currentPage === page }"
            :disabled="disabled"
            @click="handlePageClick(page)"
          >
            {{ page }}
          </button>
        </li>
        
        <!-- 后省略号 -->
        <li v-if="showNextEllipsis" class="pagination__ellipsis">
          <button
            class="pagination__jump pagination__jump--next"
            :disabled="disabled"
            @click="handleJumpNext"
            @mouseenter="nextEllipsisHover = true"
            @mouseleave="nextEllipsisHover = false"
          >
            <IconLib 
              :name="nextEllipsisHover ? 'chevrons-right' : 'more-horizontal'" 
              :size="14" 
            />
          </button>
        </li>
        
        <!-- 最后一页 -->
        <li v-if="showLastPage">
          <button
            class="pagination__item"
            :class="{ 'pagination__item--active': currentPage === totalPages }"
            :disabled="disabled"
            @click="handlePageClick(totalPages)"
          >
            {{ totalPages }}
          </button>
        </li>
      </ul>
    </template>
    
    <!-- 下一页 -->
    <button
      class="pagination__btn pagination__next"
      :disabled="disabled || currentPage >= totalPages"
      @click="handleNext"
      :title="'下一页'"
    >
      <IconLib name="chevron-right" :size="size === 'small' ? 14 : 16" />
    </button>
    
    <!-- 快速跳转 -->
    <div v-if="showQuickJumper && !simple" class="pagination__quick-jumper">
      <span>跳至</span>
      <input
        type="text"
        :value="jumpPage"
        @input="jumpPage = ($event.target as HTMLInputElement).value"
        @keyup.enter="handleQuickJump"
        @blur="handleQuickJump"
        :disabled="disabled"
      />
      <span>页</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

interface Props {
  // 当前页
  current?: number
  // 每页条数
  pageSize?: number
  // 总数
  total: number
  // 显示的页码数量
  pagerCount?: number
  // 是否简洁模式
  simple?: boolean
  // 尺寸
  size?: 'small' | 'default' | 'large'
  // 是否禁用
  disabled?: boolean
  // 显示总数
  showTotal?: boolean
  // 自定义总数文本
  totalText?: string
  // 显示每页条数选择器
  showSizeChanger?: boolean
  // 每页条数选项
  pageSizeOptions?: number[]
  // 显示快速跳转
  showQuickJumper?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  current: 1,
  pageSize: 10,
  pagerCount: 7,
  simple: false,
  size: 'default',
  disabled: false,
  showTotal: false,
  showSizeChanger: false,
  pageSizeOptions: () => [10, 20, 50, 100],
  showQuickJumper: false
})

const emit = defineEmits<{
  (e: 'update:current', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'change', page: number, pageSize: number): void
  (e: 'pageSizeChange', size: number): void
}>()

const currentPage = ref(props.current)
const jumpPage = ref('')
const prevEllipsisHover = ref(false)
const nextEllipsisHover = ref(false)

// 计算总页数
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.total / props.pageSize))
})

// 计算显示的页码
const displayPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const count = props.pagerCount
  const halfCount = Math.floor((count - 2) / 2)
  
  let start = Math.max(2, current - halfCount)
  let end = Math.min(total - 1, start + count - 3)
  
  if (end - start < count - 3) {
    start = Math.max(2, end - count + 3)
  }
  
  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 是否显示第一页
const showFirstPage = computed(() => {
  return totalPages.value > 0
})

// 是否显示最后一页
const showLastPage = computed(() => {
  return totalPages.value > 1
})

// 是否显示前省略号
const showPrevEllipsis = computed(() => {
  return displayPages.value.length > 0 && displayPages.value[0] > 2
})

// 是否显示后省略号
const showNextEllipsis = computed(() => {
  return displayPages.value.length > 0 && 
    displayPages.value[displayPages.value.length - 1] < totalPages.value - 1
})

// 监听 props 变化
watch(() => props.current, (val) => {
  currentPage.value = val
})

watch(() => props.total, () => {
  // 总数变化时，确保当前页不超过总页数
  if (currentPage.value > totalPages.value) {
    changePage(totalPages.value)
  }
})

// 切换页码
function changePage(page: number) {
  if (page < 1) page = 1
  if (page > totalPages.value) page = totalPages.value
  
  if (page !== currentPage.value) {
    currentPage.value = page
    emit('update:current', page)
    emit('change', page, props.pageSize)
  }
}

// 上一页
function handlePrev() {
  if (currentPage.value > 1) {
    changePage(currentPage.value - 1)
  }
}

// 下一页
function handleNext() {
  if (currentPage.value < totalPages.value) {
    changePage(currentPage.value + 1)
  }
}

// 点击页码
function handlePageClick(page: number) {
  changePage(page)
}

// 向前跳转
function handleJumpPrev() {
  const jumpCount = props.pagerCount - 2
  changePage(Math.max(1, currentPage.value - jumpCount))
}

// 向后跳转
function handleJumpNext() {
  const jumpCount = props.pagerCount - 2
  changePage(Math.min(totalPages.value, currentPage.value + jumpCount))
}

// 快速跳转
function handleQuickJump() {
  const page = parseInt(jumpPage.value)
  if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
    changePage(page)
  }
  jumpPage.value = ''
}

// 简洁模式输入
function handleInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const page = parseInt(input.value)
  if (!isNaN(page)) {
    changePage(page)
  }
  input.value = currentPage.value.toString()
}

// 每页条数变化
function handleSizeChange(event: Event) {
  const select = event.target as HTMLSelectElement
  const size = parseInt(select.value)
  emit('update:pageSize', size)
  emit('pageSizeChange', size)
  
  // 重新计算当前页
  const newTotalPages = Math.ceil(props.total / size)
  if (currentPage.value > newTotalPages) {
    changePage(newTotalPages)
  } else {
    emit('change', currentPage.value, size)
  }
}

// 暴露方法
defineExpose({
  currentPage,
  totalPages,
  goTo: changePage,
  prev: handlePrev,
  next: handleNext
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  user-select: none;
}

.pagination--small {
  font-size: 12px;
  gap: 6px;
}

.pagination--large {
  font-size: 16px;
  gap: 10px;
}

.pagination--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.pagination__total {
  color: #666;
  white-space: nowrap;
}

.pagination__size-changer select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: inherit;
}

.pagination__size-changer select:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.pagination__size-changer select:focus {
  outline: none;
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.2);
}

.pagination__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination--small .pagination__btn {
  width: 24px;
  height: 24px;
}

.pagination--large .pagination__btn {
  width: 40px;
  height: 40px;
}

.pagination__btn:hover:not(:disabled) {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.pagination__btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination__list {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.pagination__item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: inherit;
}

.pagination--small .pagination__item {
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
}

.pagination--large .pagination__item {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
}

.pagination__item:hover:not(:disabled) {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.pagination__item--active {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.pagination__item--active:hover:not(:disabled) {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
  opacity: 0.9;
}

.pagination__item:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination__ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination__jump {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.pagination--small .pagination__jump {
  width: 24px;
  height: 24px;
}

.pagination--large .pagination__jump {
  width: 40px;
  height: 40px;
}

.pagination__jump:hover:not(:disabled) {
  color: var(--primary-color, #4B6EF5);
}

.pagination__simple-pager {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination__simple-pager input {
  width: 50px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  text-align: center;
  font-size: inherit;
}

.pagination--small .pagination__simple-pager input {
  width: 40px;
  height: 24px;
}

.pagination--large .pagination__simple-pager input {
  width: 60px;
  height: 40px;
}

.pagination__simple-pager input:focus {
  outline: none;
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.2);
}

.pagination__simple-separator {
  color: #999;
}

.pagination__quick-jumper {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.pagination__quick-jumper input {
  width: 50px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  text-align: center;
  font-size: inherit;
}

.pagination--small .pagination__quick-jumper input {
  width: 40px;
  height: 24px;
}

.pagination--large .pagination__quick-jumper input {
  width: 60px;
  height: 40px;
}

.pagination__quick-jumper input:focus {
  outline: none;
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 2px rgba(75, 110, 245, 0.2);
}
</style>
