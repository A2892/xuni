<template>
  <div class="changelog-view">
    <!-- 头部 -->
    <div class="changelog-header">
      <div class="header-content">
        <h1 class="title">更新日志</h1>
        <p class="subtitle">了解产品的最新功能和改进</p>
      </div>
      <div class="header-actions">
        <button 
          class="subscribe-btn"
          :class="{ subscribed }"
          @click="handleSubscribe"
        >
          <IconLib :name="subscribed ? 'bell-off' : 'bell'" :size="16" />
          {{ subscribed ? '取消订阅' : '订阅更新' }}
        </button>
      </div>
    </div>

    <!-- 过滤器 -->
    <div class="changelog-filters">
      <div class="filter-tabs">
        <button 
          v-for="tab in filterTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: activeFilter === tab.value }"
          @click="activeFilter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="search-box">
        <IconLib name="search" :size="16" />
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索更新..."
        />
      </div>
    </div>

    <!-- 版本列表 -->
    <div class="changelog-list">
      <div 
        v-for="release in filteredReleases"
        :key="release.version"
        class="release-item"
      >
        <!-- 版本头 -->
        <div class="release-header">
          <div class="version-info">
            <span class="version-badge" :class="release.type">
              {{ release.version }}
            </span>
            <span class="release-type" :class="release.type">
              {{ getReleaseTypeLabel(release.type) }}
            </span>
            <span v-if="release.isLatest" class="latest-badge">最新</span>
          </div>
          <div class="release-meta">
            <span class="release-date">{{ formatDate(release.date) }}</span>
            <button 
              class="expand-btn"
              @click="toggleExpand(release.version)"
            >
              <IconLib 
                :name="expandedVersions.includes(release.version) ? 'chevron-up' : 'chevron-down'" 
                :size="16" 
              />
            </button>
          </div>
        </div>

        <!-- 版本标题和描述 -->
        <div class="release-summary">
          <h3 class="release-title">{{ release.title }}</h3>
          <p class="release-description" v-if="release.description">
            {{ release.description }}
          </p>
        </div>

        <!-- 变更列表 -->
        <Transition name="collapse">
          <div class="release-changes" v-show="expandedVersions.includes(release.version)">
            <!-- 新功能 -->
            <div class="change-group" v-if="release.features && release.features.length">
              <h4 class="group-title">
                <IconLib name="zap" :size="16" class="icon-feature" />
                新功能
              </h4>
              <ul class="change-list">
                <li v-for="(feature, i) in release.features" :key="i" class="change-item feature">
                  <IconLib name="plus" :size="14" />
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>

            <!-- 改进 -->
            <div class="change-group" v-if="release.improvements && release.improvements.length">
              <h4 class="group-title">
                <IconLib name="trending-up" :size="16" class="icon-improvement" />
                改进
              </h4>
              <ul class="change-list">
                <li v-for="(improvement, i) in release.improvements" :key="i" class="change-item improvement">
                  <IconLib name="arrow-right" :size="14" />
                  <span>{{ improvement }}</span>
                </li>
              </ul>
            </div>

            <!-- 修复 -->
            <div class="change-group" v-if="release.fixes && release.fixes.length">
              <h4 class="group-title">
                <IconLib name="tool" :size="16" class="icon-fix" />
                修复
              </h4>
              <ul class="change-list">
                <li v-for="(fix, i) in release.fixes" :key="i" class="change-item fix">
                  <IconLib name="check" :size="14" />
                  <span>{{ fix }}</span>
                </li>
              </ul>
            </div>

            <!-- 其他变更 -->
            <div class="change-group" v-if="release.others && release.others.length">
              <h4 class="group-title">
                <IconLib name="info" :size="16" class="icon-other" />
                其他
              </h4>
              <ul class="change-list">
                <li v-for="(other, i) in release.others" :key="i" class="change-item other">
                  <IconLib name="circle" :size="10" />
                  <span>{{ other }}</span>
                </li>
              </ul>
            </div>

            <!-- 相关链接 -->
            <div class="release-links" v-if="release.links && release.links.length">
              <a 
                v-for="link in release.links"
                :key="link.url"
                :href="link.url"
                class="release-link"
                target="_blank"
              >
                <IconLib :name="getLinkIcon(link.type)" :size="14" />
                {{ link.label }}
                <IconLib name="external-link" :size="12" />
              </a>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="filteredReleases.length === 0">
        <IconLib name="inbox" :size="48" />
        <h3>没有找到更新记录</h3>
        <p>尝试调整筛选条件或搜索关键词</p>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more" v-if="hasMore">
      <button class="load-more-btn" @click="loadMore">
        <IconLib name="refresh-cw" :size="16" v-if="loading" class="spin" />
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface ReleaseLink {
  label: string
  url: string
  type: 'docs' | 'github' | 'video' | 'blog'
}

interface Release {
  version: string
  title: string
  description?: string
  date: string | Date
  type: 'major' | 'minor' | 'patch' | 'beta'
  isLatest?: boolean
  features?: string[]
  improvements?: string[]
  fixes?: string[]
  others?: string[]
  links?: ReleaseLink[]
}

const props = withDefaults(defineProps<{
  releases?: Release[]
  hasMore?: boolean
  loading?: boolean
}>(), {
  releases: () => [],
  hasMore: false,
  loading: false
})

const emit = defineEmits<{
  'load-more': []
  'subscribe': [subscribed: boolean]
}>()

const searchQuery = ref('')
const activeFilter = ref('all')
const expandedVersions = ref<string[]>([])
const subscribed = ref(false)

// 过滤标签
const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '主要版本', value: 'major' },
  { label: '次要版本', value: 'minor' },
  { label: '补丁', value: 'patch' },
  { label: '测试版', value: 'beta' }
]

// 默认数据
const defaultReleases: Release[] = [
  {
    version: 'v2.0.0',
    title: '全新 2.0 版本发布',
    description: '全面升级的用户界面，新增多项核心功能，性能大幅提升。',
    date: new Date('2024-01-15'),
    type: 'major',
    isLatest: true,
    features: [
      '全新设计的用户界面，更现代更美观',
      '支持深色模式，保护您的眼睛',
      '新增批量处理功能，效率提升10倍',
      '支持导出多种格式（PNG、PDF、SVG）',
      '新增模板库，100+精美模板随心选'
    ],
    improvements: [
      '优化图片处理算法，加载速度提升50%',
      '改进表单验证逻辑，体验更流畅',
      '重构代码架构，性能更稳定'
    ],
    fixes: [
      '修复Safari浏览器兼容性问题',
      '修复大文件上传偶尔失败的问题',
      '修复日期选择器在特定情况下的显示错误'
    ],
    links: [
      { label: '升级指南', url: '#', type: 'docs' },
      { label: '完整更新日志', url: '#', type: 'github' }
    ]
  },
  {
    version: 'v1.5.0',
    title: '新增AI智能助手',
    description: '集成AI能力，让证件生成更智能。',
    date: new Date('2023-12-20'),
    type: 'minor',
    features: [
      'AI智能识别功能，自动填充表单',
      '智能推荐模板，根据内容匹配最佳模板',
      '新增语音输入功能'
    ],
    improvements: [
      '优化移动端适配',
      '提升整体响应速度'
    ],
    fixes: [
      '修复打印时部分内容缺失的问题',
      '修复偶发的自动保存失败'
    ]
  },
  {
    version: 'v1.4.2',
    title: '稳定性修复',
    date: new Date('2023-11-30'),
    type: 'patch',
    fixes: [
      '修复图片上传后偶尔无法显示的问题',
      '修复特殊字符导致的渲染错误',
      '修复退出登录后缓存未清除的问题'
    ],
    others: [
      '更新第三方依赖库',
      '优化错误提示信息'
    ]
  }
]

// 合并数据
const allReleases = computed(() => {
  return props.releases.length > 0 ? props.releases : defaultReleases
})

// 自动展开最新版本
if (allReleases.value.length > 0) {
  expandedVersions.value.push(allReleases.value[0].version)
}

// 过滤后的版本列表
const filteredReleases = computed(() => {
  let result = allReleases.value

  // 按类型过滤
  if (activeFilter.value !== 'all') {
    result = result.filter(r => r.type === activeFilter.value)
  }

  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(r => {
      return (
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.version.toLowerCase().includes(query) ||
        r.features?.some(f => f.toLowerCase().includes(query)) ||
        r.improvements?.some(i => i.toLowerCase().includes(query)) ||
        r.fixes?.some(f => f.toLowerCase().includes(query))
      )
    })
  }

  return result
})

// 获取版本类型标签
const getReleaseTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    major: '主要版本',
    minor: '功能更新',
    patch: '修复补丁',
    beta: '测试版'
  }
  return labels[type] || type
}

// 格式化日期
const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取链接图标
const getLinkIcon = (type: string): string => {
  const icons: Record<string, string> = {
    docs: 'book',
    github: 'github',
    video: 'play-circle',
    blog: 'file-text'
  }
  return icons[type] || 'link'
}

// 切换展开/收起
const toggleExpand = (version: string) => {
  const index = expandedVersions.value.indexOf(version)
  if (index > -1) {
    expandedVersions.value.splice(index, 1)
  } else {
    expandedVersions.value.push(version)
  }
}

// 订阅更新
const handleSubscribe = () => {
  subscribed.value = !subscribed.value
  emit('subscribe', subscribed.value)
}

// 加载更多
const loadMore = () => {
  emit('load-more')
}
</script>

<style scoped>
.changelog-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 头部 */
.changelog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  margin: 0.5rem 0 0;
  color: var(--text-color-secondary, #666);
}

.subscribe-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--primary-color, #4B6EF5);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subscribe-btn:hover {
  background: var(--primary-color-dark, #3b5bd5);
}

.subscribe-btn.subscribed {
  background: var(--bg-color-secondary, #f3f4f6);
  color: var(--text-color, #333);
}

/* 过滤器 */
.changelog-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.filter-tab {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-color-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  background: var(--bg-color-secondary, #f3f4f6);
}

.filter-tab.active {
  background: var(--primary-color-light, #eff1ff);
  color: var(--primary-color, #4B6EF5);
  font-weight: 500;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 8px;
  color: var(--text-color-secondary, #666);
}

.search-box input {
  width: 150px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
}

/* 版本列表 */
.changelog-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.release-item {
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
}

/* 版本头 */
.release-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--bg-color-secondary, #f9fafb);
}

.version-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.version-badge {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: ui-monospace, monospace;
  border-radius: 6px;
}

.version-badge.major {
  background: rgba(75, 110, 245, 0.1);
  color: #4B6EF5;
}

.version-badge.minor {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.version-badge.patch {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.version-badge.beta {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.release-type {
  font-size: 0.75rem;
  font-weight: 500;
}

.release-type.major { color: #4B6EF5; }
.release-type.minor { color: #10b981; }
.release-type.patch { color: #f59e0b; }
.release-type.beta { color: #8b5cf6; }

.latest-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  background: var(--primary-color, #4B6EF5);
  color: #fff;
  border-radius: 4px;
}

.release-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.release-date {
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

/* 版本摘要 */
.release-summary {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.release-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.release-description {
  margin: 0.5rem 0 0;
  color: var(--text-color-secondary, #666);
  line-height: 1.6;
}

/* 变更列表 */
.release-changes {
  padding: 1rem 1.25rem;
}

.change-group {
  margin-bottom: 1.25rem;
}

.change-group:last-child {
  margin-bottom: 0;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.icon-feature { color: #4B6EF5; }
.icon-improvement { color: #10b981; }
.icon-fix { color: #f59e0b; }
.icon-other { color: #6b7280; }

.change-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.change-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.change-item.feature { color: #4B6EF5; }
.change-item.improvement { color: #10b981; }
.change-item.fix { color: #f59e0b; }
.change-item.other { color: #6b7280; }

.change-item span {
  color: var(--text-color, #333);
}

/* 相关链接 */
.release-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.release-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 6px;
  color: var(--text-color, #333);
  text-decoration: none;
  transition: all 0.2s ease;
}

.release-link:hover {
  background: var(--primary-color-light, #eff1ff);
  color: var(--primary-color, #4B6EF5);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--text-color-secondary, #666);
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  font-weight: 600;
  color: var(--text-color, #333);
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background: var(--border-color, #e5e7eb);
}

/* 动画 */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式 */
@media (max-width: 640px) {
  .changelog-header {
    flex-direction: column;
    gap: 1rem;
  }

  .changelog-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-tabs {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .search-box input {
    width: 100%;
  }

  .release-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .release-meta {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
