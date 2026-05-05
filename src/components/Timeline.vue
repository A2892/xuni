<template>
  <div class="timeline" :class="[`timeline-${mode}`, `timeline-${size}`]">
    <div 
      v-for="(item, index) in items"
      :key="item.id || index"
      class="timeline-item"
      :class="{ 
        'is-active': index === activeIndex,
        'is-pending': item.pending
      }"
    >
      <!-- 连接线 -->
      <div class="timeline-line" v-if="index < items.length - 1"></div>
      
      <!-- 节点 -->
      <div class="timeline-node" :style="getNodeStyle(item)">
        <slot name="dot" :item="item" :index="index">
          <IconLib 
            v-if="item.icon"
            :name="item.icon"
            :size="nodeIconSize"
          />
          <span v-else-if="numbered" class="node-number">{{ index + 1 }}</span>
        </slot>
      </div>
      
      <!-- 内容 -->
      <div class="timeline-content">
        <!-- 时间（可选） -->
        <div v-if="item.time" class="timeline-time">
          <slot name="time" :item="item" :index="index">
            {{ formatTime(item.time) }}
          </slot>
        </div>
        
        <!-- 卡片 -->
        <div class="timeline-card" v-if="!plain">
          <div class="timeline-header" v-if="item.title || item.label">
            <h4 class="timeline-title">
              <slot name="title" :item="item" :index="index">
                {{ item.title || item.label }}
              </slot>
            </h4>
            <span v-if="item.tag" class="timeline-tag" :class="`tag-${item.tagType || 'default'}`">
              {{ item.tag }}
            </span>
          </div>
          
          <div class="timeline-body" v-if="item.content || item.description || $slots.content">
            <slot name="content" :item="item" :index="index">
              {{ item.content || item.description }}
            </slot>
          </div>
          
          <div class="timeline-footer" v-if="item.footer || $slots.footer">
            <slot name="footer" :item="item" :index="index">
              {{ item.footer }}
            </slot>
          </div>
        </div>
        
        <!-- 简约模式 -->
        <div class="timeline-simple" v-else>
          <span class="timeline-label">{{ item.title || item.label }}</span>
          <span class="timeline-desc" v-if="item.content || item.description">
            {{ item.content || item.description }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconLib from '@/components/icons/IconLibrary.vue'

// Types
interface TimelineItem {
  id?: string | number
  title?: string
  label?: string
  content?: string
  description?: string
  time?: string | Date
  icon?: string
  color?: string
  tag?: string
  tagType?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  footer?: string
  pending?: boolean
}

// Props
interface Props {
  items: TimelineItem[]
  mode?: 'left' | 'right' | 'alternate' | 'center'
  size?: 'small' | 'medium' | 'large'
  activeIndex?: number
  numbered?: boolean
  plain?: boolean
  reverse?: boolean
  nodeColor?: string
  lineColor?: string
  timeFormat?: string | ((time: string | Date) => string)
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'left',
  size: 'medium',
  activeIndex: -1,
  numbered: false,
  plain: false,
  reverse: false,
  nodeColor: '',
  lineColor: ''
})

// Computed
const nodeIconSize = computed(() => {
  const sizes = { small: 12, medium: 14, large: 16 }
  return sizes[props.size]
})

// Methods
function getNodeStyle(item: TimelineItem): Record<string, string> {
  const style: Record<string, string> = {}
  
  const color = item.color || props.nodeColor
  if (color) {
    style.backgroundColor = color
    style.borderColor = color
  }
  
  return style
}

function formatTime(time: string | Date): string {
  if (props.timeFormat) {
    if (typeof props.timeFormat === 'function') {
      return props.timeFormat(time)
    }
    // 简单格式化
    const date = time instanceof Date ? time : new Date(time)
    return formatDate(date, props.timeFormat)
  }
  
  // 默认格式化
  if (time instanceof Date) {
    return time.toLocaleDateString('zh-CN')
  }
  
  return time
}

function formatDate(date: Date, format: string): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  
  return format
    .replace('YYYY', String(date.getFullYear()))
    .replace('MM', pad(date.getMonth() + 1))
    .replace('DD', pad(date.getDate()))
    .replace('HH', pad(date.getHours()))
    .replace('mm', pad(date.getMinutes()))
    .replace('ss', pad(date.getSeconds()))
}
</script>

<style scoped>
.timeline {
  position: relative;
  padding: 0;
}

.timeline-item {
  position: relative;
  display: flex;
  padding-bottom: 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

/* 连接线 */
.timeline-line {
  position: absolute;
  width: 2px;
  background: #e8e8e8;
  top: 24px;
  bottom: 0;
}

/* 节点 */
.timeline-node {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: white;
  border: 2px solid var(--primary-color, #4B6EF5);
  border-radius: 50%;
  z-index: 1;
  color: var(--primary-color, #4B6EF5);
}

.timeline-item.is-active .timeline-node {
  background: var(--primary-color, #4B6EF5);
  color: white;
}

.timeline-item.is-pending .timeline-node {
  border-style: dashed;
  border-color: #ccc;
  color: #ccc;
}

.node-number {
  font-size: 12px;
  font-weight: 600;
}

/* 内容 */
.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-time {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.timeline-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.timeline-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.timeline-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.tag-default {
  background: #f0f0f0;
  color: #666;
}

.tag-primary {
  background: rgba(75, 110, 245, 0.1);
  color: var(--primary-color, #4B6EF5);
}

.tag-success {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.tag-warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.tag-danger {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.timeline-body {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.timeline-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
  font-size: 13px;
  color: #999;
}

/* 简约模式 */
.timeline-simple {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.timeline-desc {
  font-size: 13px;
  color: #666;
}

/* 模式：左侧 */
.timeline-left .timeline-item {
  flex-direction: row;
  gap: 16px;
}

.timeline-left .timeline-line {
  left: 11px;
}

/* 模式：右侧 */
.timeline-right .timeline-item {
  flex-direction: row-reverse;
  gap: 16px;
}

.timeline-right .timeline-line {
  right: 11px;
}

.timeline-right .timeline-time {
  text-align: right;
}

/* 模式：交替 */
.timeline-alternate .timeline-item {
  gap: 16px;
}

.timeline-alternate .timeline-item:nth-child(odd) {
  flex-direction: row;
}

.timeline-alternate .timeline-item:nth-child(even) {
  flex-direction: row-reverse;
}

.timeline-alternate .timeline-item:nth-child(even) .timeline-time {
  text-align: right;
}

.timeline-alternate .timeline-line {
  left: 11px;
}

/* 模式：居中 */
.timeline-center {
  padding-left: 50%;
}

.timeline-center .timeline-item {
  gap: 16px;
}

.timeline-center .timeline-node {
  position: absolute;
  left: -12px;
}

.timeline-center .timeline-line {
  left: -13px;
}

.timeline-center .timeline-item:nth-child(odd) {
  flex-direction: row;
  padding-left: 28px;
  transform: translateX(0);
}

.timeline-center .timeline-item:nth-child(even) {
  flex-direction: row;
  padding-right: 28px;
  transform: translateX(-100%);
  margin-left: -28px;
}

.timeline-center .timeline-item:nth-child(even) .timeline-time {
  text-align: right;
}

/* 尺寸 */
.timeline-small .timeline-node {
  width: 20px;
  height: 20px;
}

.timeline-small .timeline-line {
  top: 20px;
}

.timeline-small .timeline-card {
  padding: 12px;
}

.timeline-small .timeline-title {
  font-size: 14px;
}

.timeline-large .timeline-node {
  width: 32px;
  height: 32px;
}

.timeline-large .timeline-line {
  top: 32px;
}

.timeline-large .timeline-card {
  padding: 20px;
}

.timeline-large .timeline-title {
  font-size: 16px;
}
</style>
