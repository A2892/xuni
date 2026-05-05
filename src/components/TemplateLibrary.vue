<template>
  <div class="template-library">
    <!-- 头部 -->
    <div class="library-header">
      <div class="header-info">
        <h2>
          <IconLib name="layout" :size="24" />
          模板库
        </h2>
        <p>管理和自定义文档模板</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          <IconLib name="plus" :size="18" />
          创建模板
        </button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-bar">
      <div class="search-box">
        <IconLib name="search" :size="18" class="search-icon" />
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索模板..."
          class="search-input"
        />
      </div>
      <div class="filter-tabs">
        <button 
          v-for="cat in categories"
          :key="cat.value"
          class="filter-tab"
          :class="{ 'is-active': activeCategory === cat.value }"
          @click="activeCategory = cat.value"
        >
          <IconLib :name="cat.icon" :size="16" />
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- 模板列表 -->
    <div class="template-grid">
      <div 
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        :class="{ 'is-default': template.isDefault }"
      >
        <!-- 预览图 -->
        <div class="template-preview">
          <div class="preview-placeholder" :style="{ backgroundColor: template.color }">
            <IconLib :name="template.icon" :size="32" />
          </div>
          <div class="preview-overlay">
            <button class="preview-btn" @click="selectTemplate(template)">
              <IconLib name="check" :size="18" />
              使用
            </button>
            <button class="preview-btn" @click="editTemplate(template)">
              <IconLib name="edit" :size="18" />
              编辑
            </button>
          </div>
          <span v-if="template.isDefault" class="default-badge">默认</span>
        </div>

        <!-- 信息 -->
        <div class="template-info">
          <h3>{{ template.name }}</h3>
          <p class="template-desc">{{ template.description }}</p>
          <div class="template-meta">
            <span class="meta-item">
              <IconLib name="file" :size="14" />
              {{ template.type }}
            </span>
            <span class="meta-item">
              <IconLib name="calendar" :size="14" />
              {{ formatDate(template.updatedAt) }}
            </span>
          </div>
        </div>

        <!-- 操作菜单 -->
        <div class="template-actions">
          <button 
            class="action-btn"
            :class="{ 'is-favorite': template.isFavorite }"
            @click="toggleFavorite(template)"
            title="收藏"
          >
            <IconLib :name="template.isFavorite ? 'star' : 'star'" :size="18" />
          </button>
          <button class="action-btn" @click="duplicateTemplate(template)" title="复制">
            <IconLib name="copy" :size="18" />
          </button>
          <button 
            v-if="!template.isDefault"
            class="action-btn action-btn--danger" 
            @click="deleteTemplate(template)"
            title="删除"
          >
            <IconLib name="trash" :size="18" />
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredTemplates.length === 0" class="empty-state">
        <IconLib name="inbox" :size="48" />
        <h3>暂无模板</h3>
        <p>点击上方按钮创建新模板</p>
      </div>
    </div>

    <!-- 创建模板弹窗 -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <h3>创建新模板</h3>
              <button class="close-btn" @click="showCreateModal = false">
                <IconLib name="x" :size="20" />
              </button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label>模板名称</label>
                <input v-model="newTemplate.name" type="text" class="form-input" placeholder="输入模板名称" />
              </div>
              
              <div class="form-group">
                <label>文档类型</label>
                <select v-model="newTemplate.type" class="form-select">
                  <option value="">选择类型</option>
                  <option v-for="type in documentTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>描述</label>
                <textarea v-model="newTemplate.description" class="form-textarea" placeholder="简要描述模板用途"></textarea>
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn btn-outline" @click="showCreateModal = false">取消</button>
              <button class="btn btn-primary" @click="createTemplate">创建</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

interface Template {
  id: string
  name: string
  type: string
  description: string
  icon: string
  color: string
  isDefault: boolean
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

// 分类
const categories = [
  { value: 'all', label: '全部', icon: 'grid' },
  { value: 'student-id', label: '学生证', icon: 'id-badge' },
  { value: 'transcript', label: '成绩单', icon: 'clipboard-list' },
  { value: 'enrollment', label: '在读证明', icon: 'file-check' },
  { value: 'certificate', label: '证书', icon: 'award' }
]

// 文档类型
const documentTypes = [
  { value: 'student-id', label: '学生证' },
  { value: 'transcript', label: '成绩单' },
  { value: 'enrollment', label: '在读证明' },
  { value: 'certificate', label: '证书' },
  { value: 'admission', label: '录取通知书' }
]

const emit = defineEmits<{
  select: [template: Template]
}>()

// 状态
const searchQuery = ref('')
const activeCategory = ref('all')
const showCreateModal = ref(false)

const newTemplate = ref({
  name: '',
  type: '',
  description: ''
})

// 模拟模板数据
const templates = ref<Template[]>([
  {
    id: '1',
    name: '标准学生证',
    type: 'student-id',
    description: '适用于大多数学校的标准学生证模板',
    icon: 'id-badge',
    color: '#4B6EF5',
    isDefault: true,
    isFavorite: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: '横版成绩单',
    type: 'transcript',
    description: '横向布局的成绩单模板',
    icon: 'clipboard-list',
    color: '#10b981',
    isDefault: false,
    isFavorite: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: '精美在读证明',
    type: 'enrollment',
    description: '设计精美的在读证明模板',
    icon: 'file-check',
    color: '#6C5CE7',
    isDefault: false,
    isFavorite: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '4',
    name: '荣誉证书',
    type: 'certificate',
    description: '适用于各类荣誉证书',
    icon: 'award',
    color: '#f59e0b',
    isDefault: true,
    isFavorite: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-28')
  }
])

// 筛选模板
const filteredTemplates = computed(() => {
  return templates.value.filter(t => {
    const matchesCategory = activeCategory.value === 'all' || t.type === activeCategory.value
    const matchesSearch = !searchQuery.value || 
      t.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

// 方法
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const selectTemplate = (template: Template) => {
  emit('select', template)
}

const editTemplate = (template: Template) => {
  console.log('Edit:', template)
}

const toggleFavorite = (template: Template) => {
  template.isFavorite = !template.isFavorite
}

const duplicateTemplate = (template: Template) => {
  const newT: Template = {
    ...template,
    id: Date.now().toString(),
    name: `${template.name} (副本)`,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  templates.value.push(newT)
}

const deleteTemplate = (template: Template) => {
  const index = templates.value.findIndex(t => t.id === template.id)
  if (index > -1) {
    templates.value.splice(index, 1)
  }
}

const createTemplate = () => {
  const docType = documentTypes.find(d => d.value === newTemplate.value.type)
  const category = categories.find(c => c.value === newTemplate.value.type)
  
  const newT: Template = {
    id: Date.now().toString(),
    name: newTemplate.value.name,
    type: newTemplate.value.type,
    description: newTemplate.value.description,
    icon: category?.icon || 'file',
    color: '#999',
    isDefault: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  templates.value.push(newT)
  showCreateModal.value = false
  newTemplate.value = { name: '', type: '', description: '' }
}
</script>

<style scoped>
.template-library {
  padding: 2rem;
}

/* 头部 */
.library-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.library-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
}

.library-header p {
  margin: 0.5rem 0 0;
  color: var(--text-color-secondary, #666);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-muted, #9ca3af);
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  font-size: 0.9375rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  outline: none;
}

.search-input:focus {
  border-color: var(--primary-color, #4B6EF5);
}

.filter-tabs {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-color-secondary, #f3f4f6);
  padding: 0.25rem;
  border-radius: 8px;
  overflow-x: auto;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.5);
}

.filter-tab.is-active {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 模板网格 */
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.template-card {
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.template-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 预览图 */
.template-preview {
  position: relative;
  aspect-ratio: 3/2;
  overflow: hidden;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
}

.preview-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.template-card:hover .preview-overlay {
  opacity: 1;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: var(--primary-color, #4B6EF5);
  color: #fff;
}

.default-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  background: var(--primary-color, #4B6EF5);
  color: #fff;
  border-radius: 4px;
}

/* 信息区 */
.template-info {
  padding: 1rem;
}

.template-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.template-desc {
  margin: 0.5rem 0;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
  line-height: 1.4;
}

.template-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-color-muted, #9ca3af);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 操作按钮 */
.template-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-color-muted, #9ca3af);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-color-secondary, #f3f4f6);
  color: var(--text-color-primary, #333);
}

.action-btn.is-favorite {
  color: #f59e0b;
}

.action-btn--danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  color: var(--text-color-muted, #9ca3af);
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
}

.empty-state p {
  margin: 0;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
}

.modal-content {
  width: 90%;
  max-width: 480px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: 0.9375rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  outline: none;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--primary-color, #4B6EF5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color, #4B6EF5);
  border: 1px solid var(--primary-color, #4B6EF5);
  color: #fff;
}

.btn-primary:hover {
  background: var(--primary-color-dark, #3a5ce4);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-color-primary, #333);
}

.btn-outline:hover {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}
</style>
