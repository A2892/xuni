<template>
  <div class="help-center">
    <!-- 头部 -->
    <div class="help-header">
      <h2>
        <IconLib name="help-circle" :size="24" />
        帮助中心
      </h2>
      <div class="header-search">
        <IconLib name="search" :size="18" class="search-icon" />
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索帮助文档..."
          class="search-input"
        />
      </div>
    </div>

    <!-- 快速入门卡片 -->
    <div class="quick-start">
      <div class="quick-card" v-for="card in quickCards" :key="card.id" @click="openCard(card)">
        <div class="card-icon" :style="{ backgroundColor: card.color }">
          <IconLib :name="card.icon" :size="24" />
        </div>
        <div class="card-content">
          <h3>{{ card.title }}</h3>
          <p>{{ card.description }}</p>
        </div>
        <IconLib name="chevron-right" :size="20" class="card-arrow" />
      </div>
    </div>

    <!-- FAQ 部分 -->
    <div class="faq-section">
      <h3 class="section-title">
        <IconLib name="help-circle" :size="20" />
        常见问题
      </h3>
      
      <div class="faq-list">
        <div 
          v-for="faq in filteredFaqs"
          :key="faq.id"
          class="faq-item"
          :class="{ 'is-expanded': expandedFaq === faq.id }"
        >
          <button class="faq-question" @click="toggleFaq(faq.id)">
            <span>{{ faq.question }}</span>
            <IconLib :name="expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'" :size="18" />
          </button>
          <transition name="expand">
            <div v-show="expandedFaq === faq.id" class="faq-answer">
              <p v-html="faq.answer"></p>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- 功能指南 -->
    <div class="guides-section">
      <h3 class="section-title">
        <IconLib name="book-open" :size="20" />
        功能指南
      </h3>
      
      <div class="guides-grid">
        <div v-for="guide in guides" :key="guide.id" class="guide-card" @click="openGuide(guide)">
          <div class="guide-icon">
            <IconLib :name="guide.icon" :size="24" />
          </div>
          <h4>{{ guide.title }}</h4>
          <p>{{ guide.description }}</p>
          <div class="guide-meta">
            <span class="read-time">
              <IconLib name="clock" :size="14" />
              {{ guide.readTime }}
            </span>
            <span class="guide-tag" :class="guide.level">{{ guide.levelText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频教程 -->
    <div class="videos-section">
      <h3 class="section-title">
        <IconLib name="play-circle" :size="20" />
        视频教程
      </h3>
      
      <div class="videos-grid">
        <div v-for="video in videos" :key="video.id" class="video-card" @click="playVideo(video)">
          <div class="video-thumbnail">
            <div class="thumbnail-placeholder" :style="{ backgroundColor: video.color }">
              <IconLib name="play" :size="32" />
            </div>
            <span class="video-duration">{{ video.duration }}</span>
          </div>
          <div class="video-info">
            <h4>{{ video.title }}</h4>
            <p>{{ video.views }} 次观看</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 联系支持 -->
    <div class="contact-section">
      <div class="contact-card">
        <div class="contact-icon">
          <IconLib name="message-circle" :size="28" />
        </div>
        <div class="contact-content">
          <h3>需要更多帮助？</h3>
          <p>如果您没有找到答案，可以联系我们的支持团队</p>
        </div>
        <button class="btn btn-primary">
          <IconLib name="mail" :size="18" />
          联系支持
        </button>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="version-info">
      <p>
        <span>版本 {{ version }}</span>
        <span class="divider">|</span>
        <a href="#">更新日志</a>
        <span class="divider">|</span>
        <a href="#">隐私政策</a>
        <span class="divider">|</span>
        <a href="#">使用条款</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

const version = '1.0.0'
const searchQuery = ref('')
const expandedFaq = ref<number | null>(null)

// 快速入门卡片
const quickCards = [
  {
    id: 1,
    title: '快速开始',
    description: '5分钟学会创建第一个文档',
    icon: 'zap',
    color: '#4B6EF5'
  },
  {
    id: 2,
    title: '模板使用',
    description: '了解如何选择和使用模板',
    icon: 'layout',
    color: '#10b981'
  },
  {
    id: 3,
    title: '批量导出',
    description: '掌握批量生成文档的技巧',
    icon: 'layers',
    color: '#6C5CE7'
  },
  {
    id: 4,
    title: '高级功能',
    description: '探索更多高级功能',
    icon: 'star',
    color: '#f59e0b'
  }
]

// FAQ 数据
const faqs = ref([
  {
    id: 1,
    question: '如何创建新的学生证？',
    answer: '点击左侧菜单的 <strong>"学生证"</strong> 选项，然后在表单中填写学生信息，选择模板后即可预览和导出。'
  },
  {
    id: 2,
    question: '支持哪些导出格式？',
    answer: '目前支持 <strong>PNG、JPG、PDF、SVG</strong> 四种格式导出。您可以在设置中配置默认导出格式。'
  },
  {
    id: 3,
    question: '如何批量生成文档？',
    answer: '进入 <strong>"批量生成"</strong> 页面，上传包含学生信息的 Excel 或 CSV 文件，系统会自动解析并批量生成文档。'
  },
  {
    id: 4,
    question: '照片上传有什么要求？',
    answer: '建议上传 <strong>证件照规格</strong> 的照片，尺寸不小于 300x400 像素，支持 JPG、PNG 格式，文件大小不超过 5MB。'
  },
  {
    id: 5,
    question: '如何自定义模板？',
    answer: '在模板库中选择一个模板，点击 <strong>"编辑"</strong> 按钮进入模板编辑器，可以调整布局、字体、颜色等元素。'
  },
  {
    id: 6,
    question: '数据会保存在哪里？',
    answer: '您的数据默认保存在 <strong>本地浏览器</strong> 中。如果启用了云同步，数据将安全存储在加密的云端服务器。'
  },
  {
    id: 7,
    question: '如何恢复误删的文档？',
    answer: '删除的文档会在 <strong>"回收站"</strong> 中保留 30 天，您可以在此期间恢复。超过 30 天将永久删除。'
  },
  {
    id: 8,
    question: '支持哪些语言？',
    answer: '目前支持 <strong>中文</strong> 和 <strong>英文</strong> 两种语言，可以在设置中切换。'
  }
])

// 功能指南
const guides = [
  {
    id: 1,
    title: '学生证生成指南',
    description: '详细了解如何创建专业的学生证',
    icon: 'id-badge',
    readTime: '3 分钟',
    level: 'beginner',
    levelText: '入门'
  },
  {
    id: 2,
    title: '模板编辑器使用',
    description: '学习如何自定义和编辑模板',
    icon: 'edit-3',
    readTime: '5 分钟',
    level: 'intermediate',
    levelText: '进阶'
  },
  {
    id: 3,
    title: '批量数据导入',
    description: '掌握 Excel/CSV 数据导入技巧',
    icon: 'upload',
    readTime: '4 分钟',
    level: 'intermediate',
    levelText: '进阶'
  },
  {
    id: 4,
    title: '高级导出设置',
    description: '了解各种导出格式和参数',
    icon: 'download',
    readTime: '3 分钟',
    level: 'advanced',
    levelText: '高级'
  },
  {
    id: 5,
    title: 'API 集成开发',
    description: '将服务集成到您的系统中',
    icon: 'code',
    readTime: '10 分钟',
    level: 'advanced',
    levelText: '高级'
  },
  {
    id: 6,
    title: '安全与隐私',
    description: '了解数据保护和安全措施',
    icon: 'shield',
    readTime: '2 分钟',
    level: 'beginner',
    levelText: '入门'
  }
]

// 视频教程
const videos = [
  {
    id: 1,
    title: '快速入门教程',
    duration: '5:32',
    views: '2.3k',
    color: '#4B6EF5'
  },
  {
    id: 2,
    title: '模板编辑详解',
    duration: '8:15',
    views: '1.8k',
    color: '#10b981'
  },
  {
    id: 3,
    title: '批量导出技巧',
    duration: '6:48',
    views: '1.2k',
    color: '#6C5CE7'
  },
  {
    id: 4,
    title: '高级功能演示',
    duration: '12:20',
    views: '856',
    color: '#f59e0b'
  }
]

// 过滤 FAQ
const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqs.value
  const query = searchQuery.value.toLowerCase()
  return faqs.value.filter(faq => 
    faq.question.toLowerCase().includes(query) ||
    faq.answer.toLowerCase().includes(query)
  )
})

// 方法
const toggleFaq = (id: number) => {
  expandedFaq.value = expandedFaq.value === id ? null : id
}

const openCard = (card: any) => {
  console.log('Open card:', card)
}

const openGuide = (guide: any) => {
  console.log('Open guide:', guide)
}

const playVideo = (video: any) => {
  console.log('Play video:', video)
}
</script>

<style scoped>
.help-center {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

/* 头部 */
.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.help-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
}

.header-search {
  position: relative;
  width: 320px;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-muted, #9ca3af);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  font-size: 0.9375rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

/* 快速入门卡片 */
.quick-start {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-card:hover {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  color: #fff;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-content h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.card-content p {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
}

.card-arrow {
  color: var(--text-color-muted, #9ca3af);
}

/* 分区标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.25rem;
  font-size: 1.125rem;
  font-weight: 600;
}

/* FAQ 部分 */
.faq-section {
  margin-bottom: 2.5rem;
}

.faq-list {
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
}

.faq-item {
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.faq-question:hover {
  background: var(--bg-color-secondary, #f9fafb);
}

.faq-item.is-expanded .faq-question {
  background: var(--bg-color-secondary, #f9fafb);
}

.faq-answer {
  padding: 0 1.25rem 1rem;
  overflow: hidden;
}

.faq-answer p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-color-secondary, #666);
}

/* 功能指南 */
.guides-section {
  margin-bottom: 2.5rem;
}

.guides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.guide-card {
  padding: 1.5rem;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.guide-card:hover {
  border-color: var(--primary-color, #4B6EF5);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.guide-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  background: var(--primary-color-light, #eff1ff);
  color: var(--primary-color, #4B6EF5);
  border-radius: 12px;
}

.guide-card h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.guide-card p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary, #666);
}

.guide-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.read-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-color-muted, #9ca3af);
}

.guide-tag {
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  border-radius: 4px;
}

.guide-tag.beginner {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.guide-tag.intermediate {
  background: rgba(75, 110, 245, 0.1);
  color: #4B6EF5;
}

.guide-tag.advanced {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

/* 视频教程 */
.videos-section {
  margin-bottom: 2.5rem;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.video-card {
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.video-thumbnail {
  position: relative;
  aspect-ratio: 16/9;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.video-card:hover .thumbnail-placeholder {
  transform: scale(1.05);
}

.video-duration {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 4px;
}

.video-info {
  padding: 0.875rem;
}

.video-info h4 {
  margin: 0;
  font-size: 0.9375rem;
}

.video-info p {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: var(--text-color-muted, #9ca3af);
}

/* 联系支持 */
.contact-section {
  margin-bottom: 2.5rem;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--primary-color, #4B6EF5) 0%, var(--secondary-color, #6C5CE7) 100%);
  border-radius: 16px;
  color: #fff;
}

.contact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  flex-shrink: 0;
}

.contact-content {
  flex: 1;
}

.contact-content h3 {
  margin: 0;
  font-size: 1.125rem;
}

.contact-content p {
  margin: 0.25rem 0 0;
  opacity: 0.8;
}

.contact-card .btn-primary {
  background: #fff;
  color: var(--primary-color, #4B6EF5);
  border-color: #fff;
}

.contact-card .btn-primary:hover {
  background: rgba(255, 255, 255, 0.9);
}

/* 版本信息 */
.version-info {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.version-info p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-color-muted, #9ca3af);
}

.version-info .divider {
  margin: 0 0.75rem;
}

.version-info a {
  color: var(--primary-color, #4B6EF5);
  text-decoration: none;
}

.version-info a:hover {
  text-decoration: underline;
}

/* 过渡动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-primary {
  background: var(--primary-color, #4B6EF5);
  border: 1px solid var(--primary-color, #4B6EF5);
  color: #fff;
}
</style>
