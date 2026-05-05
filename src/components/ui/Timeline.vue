<template>
  <div 
    class="timeline"
    :class="[
      `timeline--${mode}`,
      { 'timeline--reverse': reverse }
    ]"
  >
    <div 
      v-for="(item, index) in items"
      :key="index"
      class="timeline__item"
      :class="{ 'timeline__item--pending': pending && index === items.length - 1 }"
    >
      <!-- 轴线 -->
      <div class="timeline__tail"></div>
      
      <!-- 节点 -->
      <div 
        class="timeline__node"
        :class="[
          `timeline__node--${item.color || 'primary'}`,
          { 'timeline__node--hollow': item.hollow }
        ]"
      >
        <slot name="dot" :item="item" :index="index">
          <IconLib 
            v-if="item.icon" 
            :name="item.icon" 
            :size="14"
          />
        </slot>
      </div>
      
      <!-- 内容 -->
      <div class="timeline__content">
        <div v-if="item.label" class="timeline__label">
          {{ item.label }}
        </div>
        <div class="timeline__body">
          <slot :item="item" :index="index">
            <div v-if="item.title" class="timeline__title">{{ item.title }}</div>
            <div v-if="item.content" class="timeline__text">{{ item.content }}</div>
          </slot>
        </div>
      </div>
    </div>
    
    <!-- 待处理节点 -->
    <div v-if="pending" class="timeline__item timeline__item--pending">
      <div class="timeline__tail timeline__tail--pending"></div>
      <div class="timeline__node timeline__node--pending">
        <IconLib name="loading" :size="14" class="timeline__pending-icon" />
      </div>
      <div class="timeline__content">
        <slot name="pending">
          <span class="timeline__pending-text">{{ pendingText }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconLib from '@/components/icons/IconLibrary.vue'

interface TimelineItem {
  title?: string
  content?: string
  label?: string
  icon?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'
  hollow?: boolean
}

interface Props {
  // 时间轴数据
  items?: TimelineItem[]
  // 展示模式
  mode?: 'left' | 'right' | 'alternate'
  // 是否逆序
  reverse?: boolean
  // 是否显示待处理状态
  pending?: boolean
  // 待处理文字
  pendingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  mode: 'left',
  reverse: false,
  pending: false,
  pendingText: '加载中...'
})
</script>

<style scoped>
.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
}

.timeline__item {
  position: relative;
  padding-bottom: 24px;
  display: flex;
  align-items: flex-start;
}

.timeline__item:last-child {
  padding-bottom: 0;
}

.timeline__item:last-child .timeline__tail {
  display: none;
}

/* 轴线 */
.timeline__tail {
  position: absolute;
  left: 5px;
  top: 12px;
  width: 2px;
  height: calc(100% - 12px);
  background: var(--border-color, #e4e7ed);
}

.timeline__tail--pending {
  border-left: 2px dashed var(--border-color, #e4e7ed);
  background: transparent;
}

/* 节点 */
.timeline__node {
  position: relative;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  background: var(--bg-color, #fff);
}

.timeline__node--primary {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

.timeline__node--success {
  background: var(--success-color, #67c23a);
  color: #fff;
}

.timeline__node--warning {
  background: var(--warning-color, #e6a23c);
  color: #fff;
}

.timeline__node--danger {
  background: var(--danger-color, #f56c6c);
  color: #fff;
}

.timeline__node--info {
  background: var(--info-color, #909399);
  color: #fff;
}

.timeline__node--gray {
  background: var(--border-color, #e4e7ed);
}

.timeline__node--hollow {
  background: transparent;
  border: 2px solid var(--primary-color, #4B6EF5);
}

.timeline__node--hollow.timeline__node--success {
  border-color: var(--success-color, #67c23a);
}

.timeline__node--hollow.timeline__node--warning {
  border-color: var(--warning-color, #e6a23c);
}

.timeline__node--hollow.timeline__node--danger {
  border-color: var(--danger-color, #f56c6c);
}

.timeline__node--pending {
  background: transparent;
}

.timeline__pending-icon {
  animation: spin 1s linear infinite;
  color: var(--primary-color, #4B6EF5);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 内容 */
.timeline__content {
  flex: 1;
  margin-left: 16px;
  min-width: 0;
}

.timeline__label {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin-bottom: 4px;
}

.timeline__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #303133);
  margin-bottom: 4px;
}

.timeline__text {
  font-size: 14px;
  color: var(--text-secondary, #606266);
  line-height: 1.5;
}

.timeline__pending-text {
  font-size: 14px;
  color: var(--text-secondary, #909399);
}

/* 右侧模式 */
.timeline--right .timeline__item {
  flex-direction: row-reverse;
}

.timeline--right .timeline__tail {
  left: auto;
  right: 5px;
}

.timeline--right .timeline__content {
  margin-left: 0;
  margin-right: 16px;
  text-align: right;
}

/* 交替模式 */
.timeline--alternate .timeline__item {
  justify-content: center;
}

.timeline--alternate .timeline__tail {
  left: 50%;
  transform: translateX(-50%);
}

.timeline--alternate .timeline__node {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.timeline--alternate .timeline__content {
  width: calc(50% - 24px);
  margin-left: 0;
}

.timeline--alternate .timeline__item:nth-child(odd) .timeline__content {
  margin-right: calc(50% + 24px);
  text-align: right;
}

.timeline--alternate .timeline__item:nth-child(even) .timeline__content {
  margin-left: calc(50% + 24px);
  text-align: left;
}
</style>
