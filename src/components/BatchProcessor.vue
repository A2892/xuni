<template>
  <div class="batch-processor">
    <!-- 标题区域 -->
    <div class="processor-header">
      <div class="header-info">
        <h2 class="processor-title">
          <IconLib name="layers" :size="24" />
          批量文档处理
        </h2>
        <p class="processor-desc">批量生成学生证、成绩单、在读证明等文档</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="showHistory = true">
          <IconLib name="clock" :size="18" />
          处理历史
        </button>
        <button class="btn btn-primary" @click="showSettings = true">
          <IconLib name="settings" :size="18" />
          设置
        </button>
      </div>
    </div>

    <!-- 步骤指示器 -->
    <div class="step-indicator">
      <div 
        v-for="(step, index) in steps" 
        :key="step.key"
        class="step-item"
        :class="{ 'is-active': currentStep === index, 'is-completed': currentStep > index }"
      >
        <div class="step-number">
          <IconLib v-if="currentStep > index" name="check" :size="16" />
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span class="step-label">{{ step.label }}</span>
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1: 选择文档类型 -->
      <div v-if="currentStep === 0" class="step-panel">
        <h3 class="panel-title">选择要生成的文档类型</h3>
        <div class="doc-type-grid">
          <div 
            v-for="doc in documentTypes"
            :key="doc.type"
            class="doc-type-card"
            :class="{ 'is-selected': selectedTypes.includes(doc.type) }"
            @click="toggleDocType(doc.type)"
          >
            <div class="doc-icon">
              <IconLib :name="doc.icon" :size="28" />
            </div>
            <div class="doc-info">
              <h4>{{ doc.name }}</h4>
              <p>{{ doc.description }}</p>
            </div>
            <div class="doc-check">
              <IconLib v-if="selectedTypes.includes(doc.type)" name="check-circle" :size="20" />
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤2: 上传数据 -->
      <div v-if="currentStep === 1" class="step-panel">
        <h3 class="panel-title">上传学生数据</h3>
        
        <div class="upload-area" :class="{ 'is-drag-over': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleFileDrop"
        >
          <IconLib name="upload-cloud" :size="48" class="upload-icon" />
          <p class="upload-text">拖拽文件到此处，或点击上传</p>
          <p class="upload-hint">支持 Excel (.xlsx, .xls) 或 CSV 文件</p>
          <input type="file" ref="fileInput" accept=".xlsx,.xls,.csv" @change="handleFileSelect" hidden />
          <button class="btn btn-outline" @click="$refs.fileInput.click()">
            <IconLib name="file-plus" :size="18" />
            选择文件
          </button>
        </div>

        <div v-if="uploadedFile" class="uploaded-file">
          <div class="file-info">
            <IconLib name="file-spreadsheet" :size="24" />
            <div class="file-details">
              <span class="file-name">{{ uploadedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(uploadedFile.size) }}</span>
            </div>
          </div>
          <button class="btn btn-icon" @click="removeFile">
            <IconLib name="x" :size="18" />
          </button>
        </div>

        <div class="template-section">
          <h4>下载模板</h4>
          <div class="template-list">
            <button 
              v-for="doc in selectedDocTypes" 
              :key="doc.type"
              class="template-btn"
              @click="downloadTemplate(doc.type)"
            >
              <IconLib name="download" :size="16" />
              {{ doc.name }}模板
            </button>
          </div>
        </div>
      </div>

      <!-- 步骤3: 数据预览 -->
      <div v-if="currentStep === 2" class="step-panel">
        <h3 class="panel-title">数据预览</h3>
        
        <div class="preview-toolbar">
          <div class="toolbar-info">
            共 <strong>{{ previewData.length }}</strong> 条数据
          </div>
          <div class="toolbar-actions">
            <button class="btn btn-sm btn-outline" @click="validateData">
              <IconLib name="check-circle" :size="16" />
              验证数据
            </button>
            <button class="btn btn-sm btn-outline" @click="editMode = !editMode">
              <IconLib :name="editMode ? 'eye' : 'edit'" :size="16" />
              {{ editMode ? '预览' : '编辑' }}
            </button>
          </div>
        </div>

        <div class="data-preview-table">
          <table>
            <thead>
              <tr>
                <th class="row-select">
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
                </th>
                <th v-for="col in previewColumns" :key="col.key">{{ col.label }}</th>
                <th class="row-status">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(row, index) in previewData" 
                :key="index"
                :class="{ 'has-error': row._hasError }"
              >
                <td class="row-select">
                  <input type="checkbox" v-model="selectedRows" :value="index" />
                </td>
                <td v-for="col in previewColumns" :key="col.key">
                  <input 
                    v-if="editMode" 
                    v-model="row[col.key]" 
                    class="edit-input"
                  />
                  <span v-else>{{ row[col.key] }}</span>
                </td>
                <td class="row-status">
                  <span v-if="row._hasError" class="status-badge status-error">
                    <IconLib name="alert-circle" :size="14" />
                    {{ row._errorMsg }}
                  </span>
                  <span v-else class="status-badge status-success">
                    <IconLib name="check" :size="14" />
                    正常
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 步骤4: 生成处理 -->
      <div v-if="currentStep === 3" class="step-panel">
        <h3 class="panel-title">生成文档</h3>

        <div class="generation-options">
          <div class="option-group">
            <label>输出格式</label>
            <div class="option-buttons">
              <button 
                v-for="format in outputFormats"
                :key="format.value"
                class="option-btn"
                :class="{ 'is-active': selectedFormat === format.value }"
                @click="selectedFormat = format.value"
              >
                <IconLib :name="format.icon" :size="18" />
                {{ format.label }}
              </button>
            </div>
          </div>

          <div class="option-group">
            <label>文件命名规则</label>
            <select v-model="namingRule" class="option-select">
              <option value="name">学生姓名</option>
              <option value="id">学号</option>
              <option value="name_id">姓名_学号</option>
              <option value="type_name">文档类型_姓名</option>
            </select>
          </div>

          <div class="option-group">
            <label>打包方式</label>
            <div class="option-buttons">
              <button 
                class="option-btn"
                :class="{ 'is-active': packMode === 'single' }"
                @click="packMode = 'single'"
              >
                单独文件
              </button>
              <button 
                class="option-btn"
                :class="{ 'is-active': packMode === 'zip' }"
                @click="packMode = 'zip'"
              >
                打包 ZIP
              </button>
            </div>
          </div>
        </div>

        <!-- 处理进度 -->
        <div v-if="isProcessing" class="processing-status">
          <div class="progress-header">
            <span class="progress-title">正在处理...</span>
            <span class="progress-text">{{ processedCount }} / {{ totalCount }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <div class="progress-detail">
            当前: {{ currentProcessing }}
          </div>
        </div>

        <!-- 处理结果 -->
        <div v-if="processResult" class="process-result">
          <div class="result-summary" :class="processResult.hasErrors ? 'has-errors' : 'success'">
            <IconLib :name="processResult.hasErrors ? 'alert-triangle' : 'check-circle'" :size="24" />
            <div class="result-info">
              <h4>处理完成</h4>
              <p>成功 {{ processResult.successCount }} 个，失败 {{ processResult.failCount }} 个</p>
            </div>
          </div>
          <button class="btn btn-primary btn-lg" @click="downloadResults">
            <IconLib name="download" :size="20" />
            下载全部
          </button>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="processor-footer">
      <button 
        v-if="currentStep > 0"
        class="btn btn-outline"
        @click="prevStep"
      >
        <IconLib name="arrow-left" :size="18" />
        上一步
      </button>
      <div class="footer-spacer"></div>
      <button 
        v-if="currentStep < steps.length - 1"
        class="btn btn-primary"
        :disabled="!canNextStep"
        @click="nextStep"
      >
        下一步
        <IconLib name="arrow-right" :size="18" />
      </button>
      <button 
        v-else
        class="btn btn-primary btn-lg"
        :disabled="isProcessing"
        @click="startProcessing"
      >
        <IconLib name="play" :size="20" />
        开始生成
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLib from './icons/IconLibrary.vue'

// 步骤定义
const steps = [
  { key: 'type', label: '选择类型' },
  { key: 'upload', label: '上传数据' },
  { key: 'preview', label: '数据预览' },
  { key: 'generate', label: '生成处理' }
]

// 文档类型
const documentTypes = [
  { type: 'student-id', name: '学生证', icon: 'id-badge', description: '包含照片、姓名、学号等信息' },
  { type: 'transcript', name: '成绩单', icon: 'clipboard-list', description: '学期成绩详细记录' },
  { type: 'enrollment', name: '在读证明', icon: 'file-check', description: '证明学生在校就读状态' },
  { type: 'admission', name: '录取通知书', icon: 'mail', description: '大学录取通知' },
  { type: 'schedule', name: '课程表', icon: 'calendar', description: '学期课程安排' },
  { type: 'academic-report', name: '学业报告', icon: 'file-text', description: '综合学业评估报告' }
]

// 输出格式
const outputFormats = [
  { value: 'pdf', label: 'PDF', icon: 'file-text' },
  { value: 'png', label: 'PNG', icon: 'image' },
  { value: 'jpg', label: 'JPG', icon: 'image' }
]

// 状态
const currentStep = ref(0)
const selectedTypes = ref<string[]>([])
const uploadedFile = ref<File | null>(null)
const isDragOver = ref(false)
const previewData = ref<any[]>([])
const previewColumns = ref<{ key: string; label: string }[]>([])
const selectedRows = ref<number[]>([])
const selectAll = ref(false)
const editMode = ref(false)
const selectedFormat = ref('pdf')
const namingRule = ref('name_id')
const packMode = ref('zip')
const isProcessing = ref(false)
const processedCount = ref(0)
const totalCount = ref(0)
const currentProcessing = ref('')
const processResult = ref<{ hasErrors: boolean; successCount: number; failCount: number } | null>(null)
const showHistory = ref(false)
const showSettings = ref(false)

// 计算属性
const selectedDocTypes = computed(() => 
  documentTypes.filter(d => selectedTypes.value.includes(d.type))
)

const progress = computed(() => 
  totalCount.value > 0 ? (processedCount.value / totalCount.value) * 100 : 0
)

const canNextStep = computed(() => {
  switch (currentStep.value) {
    case 0: return selectedTypes.value.length > 0
    case 1: return uploadedFile.value !== null
    case 2: return selectedRows.value.length > 0 || selectAll.value
    default: return true
  }
})

// 方法
const toggleDocType = (type: string) => {
  const index = selectedTypes.value.indexOf(type)
  if (index === -1) {
    selectedTypes.value.push(type)
  } else {
    selectedTypes.value.splice(index, 1)
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    uploadedFile.value = files[0]
    parseFile(files[0])
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    uploadedFile.value = files[0]
    parseFile(files[0])
  }
}

const parseFile = async (file: File) => {
  // 模拟解析文件
  previewColumns.value = [
    { key: 'name', label: '姓名' },
    { key: 'studentId', label: '学号' },
    { key: 'major', label: '专业' },
    { key: 'grade', label: '年级' },
    { key: 'class', label: '班级' }
  ]
  
  previewData.value = [
    { name: '张三', studentId: '2024001', major: '计算机科学', grade: '2024级', class: '1班' },
    { name: '李四', studentId: '2024002', major: '软件工程', grade: '2024级', class: '2班' },
    { name: '王五', studentId: '2024003', major: '数据科学', grade: '2024级', class: '1班' }
  ]
}

const removeFile = () => {
  uploadedFile.value = null
  previewData.value = []
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const downloadTemplate = (type: string) => {
  // 下载模板逻辑
  console.log('Download template:', type)
}

const validateData = () => {
  // 数据验证逻辑
  previewData.value.forEach(row => {
    row._hasError = !row.name || !row.studentId
    row._errorMsg = !row.name ? '缺少姓名' : !row.studentId ? '缺少学号' : ''
  })
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedRows.value = previewData.value.map((_, i) => i)
  } else {
    selectedRows.value = []
  }
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) currentStep.value++
}

const startProcessing = async () => {
  isProcessing.value = true
  processedCount.value = 0
  totalCount.value = selectedRows.value.length * selectedTypes.value.length
  
  // 模拟处理
  for (let i = 0; i < selectedRows.value.length; i++) {
    for (const type of selectedTypes.value) {
      currentProcessing.value = `${previewData.value[selectedRows.value[i]].name} - ${documentTypes.find(d => d.type === type)?.name}`
      await new Promise(resolve => setTimeout(resolve, 500))
      processedCount.value++
    }
  }
  
  isProcessing.value = false
  processResult.value = {
    hasErrors: false,
    successCount: processedCount.value,
    failCount: 0
  }
}

const downloadResults = () => {
  // 下载结果逻辑
  console.log('Download results')
}
</script>

<style scoped>
.batch-processor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 头部 */
.processor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.processor-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color-primary, #333);
}

.processor-desc {
  margin: 0.5rem 0 0;
  color: var(--text-color-secondary, #666);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-color-secondary, #f9fafb);
  border-radius: 12px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-muted, #9ca3af);
}

.step-item.is-active {
  color: var(--primary-color, #4B6EF5);
}

.step-item.is-completed {
  color: var(--success-color, #10b981);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: currentColor;
  color: #fff;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
}

.step-item.is-active .step-number,
.step-item.is-completed .step-number {
  background: currentColor;
}

.step-label {
  font-weight: 500;
}

/* 步骤内容 */
.step-content {
  min-height: 400px;
  margin-bottom: 2rem;
}

.step-panel {
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 1.5rem;
}

.panel-title {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  color: var(--text-color-primary, #333);
}

/* 文档类型网格 */
.doc-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.doc-type-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.doc-type-card:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.doc-type-card.is-selected {
  border-color: var(--primary-color, #4B6EF5);
  background: var(--primary-color-light, #e8edfd);
}

.doc-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 10px;
  color: var(--primary-color, #4B6EF5);
}

.doc-info h4 {
  margin: 0;
  font-size: 1rem;
}

.doc-info p {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #666);
}

.doc-check {
  margin-left: auto;
  color: var(--primary-color, #4B6EF5);
}

/* 上传区域 */
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  border: 2px dashed var(--border-color, #d1d5db);
  border-radius: 12px;
  background: var(--bg-color-secondary, #f9fafb);
  text-align: center;
  transition: all 0.2s ease;
}

.upload-area.is-drag-over {
  border-color: var(--primary-color, #4B6EF5);
  background: var(--primary-color-light, #e8edfd);
}

.upload-icon {
  color: var(--text-color-muted, #9ca3af);
}

.upload-text {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color-primary, #333);
}

.upload-hint {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-muted, #9ca3af);
}

/* 已上传文件 */
.uploaded-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin-top: 1rem;
  background: var(--bg-color-secondary, #f3f4f6);
  border-radius: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-name {
  font-weight: 500;
}

.file-size {
  color: var(--text-color-muted, #9ca3af);
  font-size: 0.875rem;
}

/* 模板下载 */
.template-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.template-section h4 {
  margin: 0 0 1rem;
  font-size: 0.9375rem;
}

.template-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.template-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-btn:hover {
  border-color: var(--primary-color, #4B6EF5);
  color: var(--primary-color, #4B6EF5);
}

/* 数据预览表格 */
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.data-preview-table {
  overflow: auto;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
}

.data-preview-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-preview-table th,
.data-preview-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.data-preview-table th {
  background: var(--bg-color-secondary, #f9fafb);
  font-weight: 600;
}

.data-preview-table tr.has-error {
  background: rgba(239, 68, 68, 0.05);
}

.row-select {
  width: 40px;
  text-align: center;
}

.row-status {
  width: 120px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
}

.status-success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.edit-input {
  width: 100%;
  padding: 0.375rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
}

/* 生成选项 */
.generation-options {
  display: grid;
  gap: 1.5rem;
}

.option-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color-primary, #333);
}

.option-buttons {
  display: flex;
  gap: 0.5rem;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  background: #fff;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  border-color: var(--primary-color, #4B6EF5);
}

.option-btn.is-active {
  background: var(--primary-color, #4B6EF5);
  border-color: var(--primary-color, #4B6EF5);
  color: #fff;
}

.option-select {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: #fff;
  min-width: 200px;
}

/* 处理状态 */
.processing-status {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-color-secondary, #f9fafb);
  border-radius: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.progress-title {
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: var(--border-color, #e5e7eb);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color, #4B6EF5);
  transition: width 0.3s ease;
}

.progress-detail {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary, #666);
}

/* 处理结果 */
.process-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 2rem;
  background: var(--bg-color-secondary, #f9fafb);
  border-radius: 12px;
}

.result-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.result-summary.success {
  color: var(--success-color, #10b981);
}

.result-summary.has-errors {
  color: var(--warning-color, #f59e0b);
}

.result-info h4 {
  margin: 0;
  font-size: 1.125rem;
}

.result-info p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  opacity: 0.8;
}

/* 底部操作栏 */
.processor-footer {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.footer-spacer {
  flex: 1;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.btn-primary:hover:not(:disabled) {
  background: var(--primary-color-dark, #3a5ce4);
}

.btn-secondary {
  background: var(--bg-color-secondary, #f3f4f6);
  border: 1px solid var(--bg-color-secondary, #f3f4f6);
  color: var(--text-color-primary, #333);
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

.btn-lg {
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-icon {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-color-muted, #9ca3af);
}

.btn-icon:hover {
  color: var(--text-color-primary, #333);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
