<template>
  <div class="template-manager">
    <div class="manager-header">
      <h3 class="title">
        <span class="icon">📋</span>
        模板管理
      </h3>
      <button @click="showCreateModal = true" class="btn-create">
        + 新建模板
      </button>
    </div>

    <!-- 模板分类 -->
    <div class="template-categories">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        :class="['category-btn', { active: selectedCategory === cat.id }]"
        @click="selectedCategory = cat.id"
      >
        {{ cat.icon }} {{ cat.name }} ({{ getTemplateCount(cat.id) }})
      </button>
    </div>

    <!-- 模板列表 -->
    <div class="template-grid">
      <div 
        v-for="template in filteredTemplates" 
        :key="template.id"
        class="template-card"
        :class="{ selected: selectedTemplate?.id === template.id }"
        @click="selectTemplate(template)"
      >
        <div class="template-preview">
          <div class="preview-placeholder" :style="{ background: template.color || '#667eea' }">
            {{ template.name.charAt(0) }}
          </div>
        </div>
        <div class="template-info">
          <h4 class="template-name">{{ template.name }}</h4>
          <p class="template-desc">{{ template.description || '暂无描述' }}</p>
          <div class="template-meta">
            <span class="meta-item">{{ formatDate(template.updatedAt) }}</span>
            <span v-if="template.isDefault" class="default-badge">默认</span>
          </div>
        </div>
        <div class="template-actions">
          <button @click.stop="applyTemplate(template)" class="action-btn apply">
            应用
          </button>
          <button @click.stop="editTemplate(template)" class="action-btn edit">
            编辑
          </button>
          <button @click.stop="deleteTemplate(template)" class="action-btn delete" v-if="!template.isDefault">
            删除
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredTemplates.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无模板</p>
        <button @click="showCreateModal = true" class="btn-create-first">创建第一个模板</button>
      </div>
    </div>

    <!-- 创建/编辑模板弹窗 -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ editingTemplate ? '编辑模板' : '新建模板' }}</h3>
        
        <div class="form-group">
          <label>模板名称</label>
          <input v-model="templateForm.name" type="text" placeholder="输入模板名称" />
        </div>

        <div class="form-group">
          <label>模板描述</label>
          <textarea v-model="templateForm.description" placeholder="输入模板描述" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>所属分类</label>
          <select v-model="templateForm.category">
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>主题色</label>
          <div class="color-options">
            <button 
              v-for="color in colorOptions" 
              :key="color"
              class="color-btn"
              :class="{ active: templateForm.color === color }"
              :style="{ background: color }"
              @click="templateForm.color = color"
            ></button>
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="templateForm.isDefault" />
            设为默认模板
          </label>
        </div>

        <div class="modal-actions">
          <button @click="closeModal" class="btn-cancel">取消</button>
          <button @click="saveTemplate" class="btn-save">
            {{ editingTemplate ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:visible="showDeleteConfirmDialog"
      type="danger"
      title="确认删除模板"
      :message="`确定要删除模板「${templateToDelete?.name}」吗？`"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="handleDeleteConfirmed"
      @cancel="showDeleteConfirmDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

interface Template {
  id: string
  name: string
  description?: string
  category: string
  data: any
  color?: string
  isDefault?: boolean
  createdAt: Date
  updatedAt: Date
}

const props = withDefaults(defineProps<{
  documentType: string
  getCurrentData: () => any
}>(), {
  documentType: 'default'
})

const emit = defineEmits(['apply-template', 'template-saved', 'template-deleted'])

const categories = [
  { id: 'all', name: '全部', icon: '📁' },
  { id: 'personal', name: '个人', icon: '👤' },
  { id: 'business', name: '商务', icon: '💼' },
  { id: 'official', name: '官方', icon: '🏛️' },
  { id: 'custom', name: '自定义', icon: '⚙️' }
]

const colorOptions = [
  '#667eea', '#764ba2', '#11998e', '#38ef7d',
  '#ee0979', '#ff6a00', '#4facfe', '#00f2fe',
  '#f093fb', '#f5576c', '#fa709a', '#fee140'
]

const selectedCategory = ref('all')
const selectedTemplate = ref<Template | null>(null)
const showCreateModal = ref(false)
const editingTemplate = ref<Template | null>(null)
const showDeleteConfirmDialog = ref(false)
const templateToDelete = ref<Template | null>(null)

const templateForm = ref({
  name: '',
  description: '',
  category: 'custom',
  color: '#667eea',
  isDefault: false
})

// 模拟模板数据
const templates = ref<Template[]>([
  {
    id: '1',
    name: '标准模板',
    description: '适用于大多数场景的通用模板',
    category: 'official',
    data: {},
    color: '#667eea',
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: '简约风格',
    description: '简洁清爽的设计风格',
    category: 'personal',
    data: {},
    color: '#11998e',
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-06-15')
  },
  {
    id: '3',
    name: '商务正式',
    description: '适用于正式商务场合',
    category: 'business',
    data: {},
    color: '#764ba2',
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-12-01')
  }
])

const filteredTemplates = computed(() => {
  if (selectedCategory.value === 'all') {
    return templates.value
  }
  return templates.value.filter(t => t.category === selectedCategory.value)
})

const getTemplateCount = (categoryId: string) => {
  if (categoryId === 'all') return templates.value.length
  return templates.value.filter(t => t.category === categoryId).length
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const selectTemplate = (template: Template) => {
  selectedTemplate.value = template
}

const applyTemplate = (template: Template) => {
  emit('apply-template', template.data)
  alert(`已应用模板: ${template.name}`)
}

const editTemplate = (template: Template) => {
  editingTemplate.value = template
  templateForm.value = {
    name: template.name,
    description: template.description || '',
    category: template.category,
    color: template.color || '#667eea',
    isDefault: template.isDefault || false
  }
  showCreateModal.value = true
}

const deleteTemplate = (template: Template) => {
  templateToDelete.value = template
  showDeleteConfirmDialog.value = true
}

const handleDeleteConfirmed = () => {
  showDeleteConfirmDialog.value = false
  if (templateToDelete.value) {
    const index = templates.value.findIndex(t => t.id === templateToDelete.value!.id)
    if (index !== -1) {
      templates.value.splice(index, 1)
      emit('template-deleted', templateToDelete.value.id)
    }
    templateToDelete.value = null
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingTemplate.value = null
  templateForm.value = {
    name: '',
    description: '',
    category: 'custom',
    color: '#667eea',
    isDefault: false
  }
}

const saveTemplate = () => {
  if (!templateForm.value.name.trim()) {
    alert('请输入模板名称')
    return
  }

  const now = new Date()

  if (editingTemplate.value) {
    // 编辑模式
    const index = templates.value.findIndex(t => t.id === editingTemplate.value!.id)
    if (index !== -1) {
      templates.value[index] = {
        ...templates.value[index],
        ...templateForm.value,
        updatedAt: now
      }
    }
  } else {
    // 创建模式
    const newTemplate: Template = {
      id: `template_${Date.now()}`,
      ...templateForm.value,
      data: props.getCurrentData(),
      createdAt: now,
      updatedAt: now
    }
    templates.value.push(newTemplate)
  }

  // 如果设为默认，取消其他默认
  if (templateForm.value.isDefault) {
    templates.value.forEach(t => {
      if (t.id !== editingTemplate.value?.id) {
        t.isDefault = false
      }
    })
  }

  emit('template-saved', templateForm.value)
  closeModal()
}
</script>

<style scoped>
.template-manager {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.icon {
  font-size: 20px;
}

.btn-create {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.template-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.category-btn {
  padding: 6px 14px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: #e9ecef;
}

.category-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.template-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  background: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.template-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
}

.template-preview {
  margin-bottom: 12px;
}

.preview-placeholder {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: 700;
}

.template-info {
  margin-bottom: 12px;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.template-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.meta-item {
  font-size: 11px;
  color: #999;
}

.default-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 4px;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.apply {
  background: #667eea;
  color: white;
  border: none;
}

.action-btn.apply:hover {
  background: #5a6fd6;
}

.action-btn.edit {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.action-btn.edit:hover {
  background: #e9ecef;
}

.action-btn.delete {
  background: #fee;
  color: #c00;
  border: 1px solid #fcc;
}

.action-btn.delete:hover {
  background: #fdd;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  color: #999;
  margin: 0 0 16px 0;
}

.btn-create-first {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin-bottom: 6px;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #333;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #333;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-save {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
