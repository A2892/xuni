<template>
  <div class="pagination" :class="[`pagination--${size}`, `pagination--${variant}`]">
    <!-- 总数信息 -->
    <div v-if="showTotal" class="pagination-total">
      共 <span class="total-count">{{ total }}</span> 条
    </div>
    
    <!-- 每页数量 -->
    <div v-if="showSizeChanger" class="pagination-size">
      <select v-model="internalPageSize" class="size-select" @change="handleSizeChange">
        <option v-for="size in pageSizes" :key="size" :value="size">{{ size }} 条/页</option>
      </select>
    </div>
    
    <!-- 分页控件 -->
    <div class="pagination-controls">
      <!-- 上一页 -->
      <button 
        type="button"
        class="pagination-btn pagination-prev"
        :disabled="currentPage <= 1"
        @click="changePage(currentPage - 1)"
        :title="prevText"
      >
        <IconLib name="chevron-left" :size="16" />
        <span v-if="showPrevNextText">{{ prevText }}</span>
      </button>
      
      <!-- 页码 -->
      <template v-for="page in pageNumbers" :key="page">
        <span v-if="page === 'prev-more'" class="pagination-more" @click="jumpPrev">
          <IconLib name="more-horizontal" :size="16" class="more-icon" />
          <IconLib name="chevrons-left" :size="16" class="jump-icon" />
        </span>
        <span v-else-if="page === 'next-more'" class="pagination-more" @click="jumpNext">
          <IconLib name="more-horizontal" :size="16" class="more-icon" />
          <IconLib name="chevrons-right" :size="16" class="jump-icon" />
        </span>
        <button 
          v-else
          type="button"
          class="pagination-btn pagination-number"
          :class="{ 'is-active': page === currentPage }"
          @click="changePage(page as number)"
        >
          {{ page }}
        </button>
      </template>
      
      <!-- 下一页 -->
      <button 
        type="button"
        class="pagination-btn pagination-next"
        :disabled="currentPage >= totalPages"
        @click="changePage(currentPage + 1)"
        :title="nextText"
      >
        <span v-if="showPrevNextText">{{ nextText }}</span>
        <IconLib name="chevron-right" :size="16" />
      </button>
    </div>
    
    <!-- 跳转 -->
    <div v-if="showQuickJumper" class="pagination-jumper">
      <span>前往</span>
      <input 
        type="number"
        v-model.number="jumpPage"
        class="jumper-input"
        min="1"
        :max="totalPages"
        @keyup.enter="handleJump"
      />
      <span>页</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Props {
  total: number
  pageSize?: number
  modelValue?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'simple' | 'minimal'
  pageSizes?: number[]
  showTotal?: boolean
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showPrevNextText?: boolean
  prevText?: string
  nextText?: string
  maxPages?: number
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  modelValue: 1,
  size: 'md',
  variant: 'default',
  pageSizes: () => [10, 20, 50, 100],
  showTotal: true,
  prevText: '上一页',
  nextText: '下一页',
  maxPages: 7
})

const emit = defineEmits<{
  'update:modelValue': [page: number]
  'update:pageSize': [size: number]
  change: [page: number, pageSize: number]
}>()

const currentPage = ref(props.modelValue)
const internalPageSize = ref(props.pageSize)
const jumpPage = ref<number | null>(null)

// 总页数
const totalPages = computed(() => Math.ceil(props.total / internalPageSize.value))

// 页码数组
const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  const max = props.maxPages
  
  if (total <= max) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }
  
  const half = Math.floor(max / 2)
  let start = Math.max(2, current - half)
  let end = Math.min(total - 1, current + half)
  
  if (current <= half + 1) {
    end = max - 1
  }
  if (current >= total - half) {
    start = total - max + 2
  }
  
  pages.push(1)
  
  if (start > 2) {
    pages.push('prev-more')
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  if (end < total - 1) {
    pages.push('next-more')
  }
  
  pages.push(total)
  
  return pages
})

// 切换页码
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  
  currentPage.value = page
  emit('update:modelValue', page)
  emit('change', page, internalPageSize.value)
}

// 快速跳转
const jumpPrev = () => {
  changePage(Math.max(1, currentPage.value - 5))
}

const jumpNext = () => {
  changePage(Math.min(totalPages.value, currentPage.value + 5))
}

// 输入跳转
const handleJump = () => {
  if (jumpPage.value && jumpPage.value >= 1 && jumpPage.value <= totalPages.value) {
    changePage(jumpPage.value)
    jumpPage.value = null
  }
}

// 改变每页数量
const handleSizeChange = () => {
  emit('update:pageSize', internalPageSize.value)
  currentPage.value = 1
  emit('update:modelValue', 1)
  emit('change', 1, internalPageSize.value)
}

// 监听外部变化
watch(() => props.modelValue, (val) => {
  currentPage.value = val
})

watch(() => props.pageSize, (val) => {
  internalPageSize.value = val
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* 尺寸 */
.pagination--sm {
  font-size: 0.8125rem;
}

.pagination--sm .pagination-btn {
  min-width: 28px;
  height: 28px;
}

.pagination--md {
  font-size: 0.875rem;
}

.pagination--md .pagination-btn {
  min-width: 32px;
  height: 32px;
}

.pagination--lg {
  font-size: 0.9375rem;
}

.pagination--lg .pagination-btn {
  min-width: 40px;
  height: 40px;
}

/* 总数 */
.pagination-total {
  color: var(--text-color-secondary, #666);
}

.total-count {
  font-weight: 600;
  color: var(--text-color-primary, #333);
}

/* 每页数量 */
.size-select {
  padding: 0.375rem 0.75rem;
  font-size: inherit;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
}

.size-select:focus {
  border-color: var(--primary-color, #4B6EF5);
}

/* 控件 */
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0 0.5rem;
  font-size: inherit;
  font-weight: 500;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  color: var(--text-color-primary, #333);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled):not(.is-active) {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

.pagination-btn.is-active {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 更多 */
.pagination-more {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  color: var(--text-color-muted, #9ca3af);
  cursor: pointer;
}

.pagination-more .jump-icon {
  display: none;
}

.pagination-more:hover {
  color: var(--primary-color, #4B6EF5);
}

.pagination-more:hover .more-icon {
  display: none;
}

.pagination-more:hover .jump-icon {
  display: block;
}

/* 跳转 */
.pagination-jumper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-secondary, #666);
}

.jumper-input {
  width: 50px;
  padding: 0.375rem 0.5rem;
  font-size: inherit;
  text-align: center;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s ease;
  -moz-appearance: textfield;
}

.jumper-input::-webkit-outer-spin-button,
.jumper-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.jumper-input:focus {
  border-color: var(--primary-color, #4B6EF5);
}

/* Simple 变体 */
.pagination--simple .pagination-controls {
  gap: 0.5rem;
}

.pagination--simple .pagination-number {
  display: none;
}

.pagination--simple .pagination-more {
  display: none;
}

/* Minimal 变体 */
.pagination--minimal .pagination-btn {
  background: transparent;
  border: none;
}

.pagination--minimal .pagination-btn:hover:not(:disabled):not(.is-active) {
  background: var(--bg-color-secondary, #f3f4f6);
}

.pagination--minimal .pagination-btn.is-active {
  background: var(--primary-color-light, #e8edfd);
  color: var(--primary-color, #4B6EF5);
}
</style>
