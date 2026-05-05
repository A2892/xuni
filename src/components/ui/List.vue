<template>
  <div
    class="list"
    :class="{
      'list-bordered': bordered,
      'list-split': split,
      [`list-${size}`]: size !== 'default'
    }"
  >
    <!-- Header -->
    <div v-if="$slots.header || header" class="list-header">
      <slot name="header">{{ header }}</slot>
    </div>
    
    <!-- 内容 -->
    <div ref="listRef" class="list-content" :style="contentStyle">
      <template v-if="virtual && itemHeight">
        <!-- 虚拟滚动 -->
        <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
          <div
            v-for="(item, index) in visibleItems"
            :key="getKey(item, startIndex + index)"
            class="list-item"
            :style="{
              position: 'absolute',
              top: `${(startIndex + index) * itemHeight}px`,
              width: '100%'
            }"
          >
            <slot name="renderItem" :item="item" :index="startIndex + index">
              <ListItem>{{ item }}</ListItem>
            </slot>
          </div>
        </div>
      </template>
      <template v-else>
        <!-- 普通列表 -->
        <div
          v-for="(item, index) in dataSource"
          :key="getKey(item, index)"
          class="list-item"
        >
          <slot name="renderItem" :item="item" :index="index">
            <ListItem>{{ item }}</ListItem>
          </slot>
        </div>
      </template>
      
      <!-- 空状态 -->
      <div v-if="dataSource.length === 0" class="list-empty">
        <slot name="empty">
          <div class="list-empty-content">
            <IconLib name="inbox" :size="48" />
            <span>暂无数据</span>
          </div>
        </slot>
      </div>
    </div>
    
    <!-- 加载更多 -->
    <div v-if="loading" class="list-loading">
      <slot name="loadMore">
        <div class="list-loading-content">
          <div class="list-loading-spinner" />
          <span>加载中...</span>
        </div>
      </slot>
    </div>
    
    <!-- Footer -->
    <div v-if="$slots.footer || footer" class="list-footer">
      <slot name="footer">{{ footer }}</slot>
    </div>
    
    <!-- 分页 -->
    <div v-if="pagination" class="list-pagination">
      <Pagination
        v-bind="paginationProps"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// 内联 ListItem 组件
const ListItem = {
  template: `<div class="list-item-content"><slot /></div>`
}

interface Props {
  dataSource: any[]
  bordered?: boolean
  split?: boolean
  size?: 'small' | 'default' | 'large'
  header?: string
  footer?: string
  loading?: boolean
  pagination?: boolean | object
  rowKey?: string | ((item: any) => string | number)
  virtual?: boolean
  itemHeight?: number
  height?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => [],
  bordered: false,
  split: true,
  size: 'default',
  header: '',
  footer: '',
  loading: false,
  pagination: false,
  rowKey: 'id',
  virtual: false,
  itemHeight: 0,
  height: 400
})

const emit = defineEmits<{
  pageChange: [page: number, pageSize: number]
}>()

const listRef = ref<HTMLElement>()
const scrollTop = ref(0)
const visibleCount = ref(10)

// 内容区样式
const contentStyle = computed(() => {
  if (props.virtual && props.height) {
    return {
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      overflow: 'auto'
    }
  }
  return {}
})

// 获取 key
const getKey = (item: any, index: number) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(item)
  }
  return item[props.rowKey] ?? index
}

// 虚拟滚动相关
const totalHeight = computed(() => {
  return props.dataSource.length * props.itemHeight
})

const startIndex = computed(() => {
  if (!props.virtual || !props.itemHeight) return 0
  return Math.floor(scrollTop.value / props.itemHeight)
})

const visibleItems = computed(() => {
  if (!props.virtual) return props.dataSource
  
  const start = Math.max(0, startIndex.value - 5)
  const end = Math.min(props.dataSource.length, startIndex.value + visibleCount.value + 5)
  return props.dataSource.slice(start, end)
})

// 分页配置
const paginationProps = computed(() => {
  if (typeof props.pagination === 'object') {
    return props.pagination
  }
  return {
    total: props.dataSource.length,
    pageSize: 10,
    current: 1
  }
})

// 滚动处理
const handleScroll = () => {
  if (listRef.value) {
    scrollTop.value = listRef.value.scrollTop
  }
}

// 分页变化
const handlePageChange = (page: number, pageSize: number) => {
  emit('pageChange', page, pageSize)
}

// 计算可见数量
const calcVisibleCount = () => {
  if (props.virtual && props.itemHeight && listRef.value) {
    const height = typeof props.height === 'number' 
      ? props.height 
      : listRef.value.clientHeight
    visibleCount.value = Math.ceil(height / props.itemHeight) + 1
  }
}

onMounted(() => {
  if (props.virtual) {
    listRef.value?.addEventListener('scroll', handleScroll)
    calcVisibleCount()
  }
})

onUnmounted(() => {
  if (props.virtual) {
    listRef.value?.removeEventListener('scroll', handleScroll)
  }
})

watch(() => [props.height, props.itemHeight], () => {
  calcVisibleCount()
})
</script>

<style scoped>
.list {
  background-color: #fff;
}

.list-bordered {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
}

.list-header,
.list-footer {
  padding: 12px 24px;
  background-color: #fafafa;
}

.list-bordered .list-header {
  border-bottom: 1px solid #d9d9d9;
}

.list-bordered .list-footer {
  border-top: 1px solid #d9d9d9;
}

.list-content {
  position: relative;
}

.list-item {
  padding: 12px 24px;
}

.list-split .list-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

/* 尺寸 */
.list-small .list-item {
  padding: 8px 16px;
}

.list-large .list-item {
  padding: 16px 24px;
}

/* 空状态 */
.list-empty {
  padding: 48px 0;
}

.list-empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(0, 0, 0, 0.25);
}

/* 加载中 */
.list-loading {
  padding: 16px;
  text-align: center;
}

.list-loading-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(0, 0, 0, 0.45);
}

.list-loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e8e8e8;
  border-top-color: var(--primary-color, #4B6EF5);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 分页 */
.list-pagination {
  padding: 16px;
  text-align: right;
}

/* ListItem */
:deep(.list-item-content) {
  display: flex;
  align-items: center;
}
</style>
