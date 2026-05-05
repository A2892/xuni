<template>
  <div class="documents-gallery">
    <!-- 文件夹列表视图 -->
    <div v-if="!selectedFolder">
      <div class="gallery-header">
        <div class="header-left">
          <h2>📁 学生档案管理</h2>
          <div class="stats">
            <span class="stat-item">
              <span class="stat-icon">👤</span>
              <span>{{ studentFolders.length }} 个学生</span>
            </span>
            <span class="stat-item">
              <span class="stat-icon">📄</span>
              <span>{{ totalDocuments }} 份文档</span>
            </span>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="new-student-btn" @click="showNewStudentDialog = true">
            ➕ 新建学生档案
          </button>
          <button class="trash-btn" @click="showTrashView = true" v-if="deletedDocuments.length > 0">
            🗑️ 回收站 ({{ deletedDocuments.length }})
          </button>
        </div>
      </div>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="搜索学生姓名、学号..."
        class="search-input"
        @input="handleSearch"
      />
    </div>
    
    <!-- 新建学生对话框 -->
    <div v-if="showNewStudentDialog" class="modal-overlay" @click="closeNewStudentDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建学生档案</h3>
          <button class="close-btn" @click="closeNewStudentDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>学生姓名 *</label>
            <input 
              v-model="newStudent.name" 
              type="text" 
              placeholder="请输入学生姓名"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>学号</label>
            <input 
              v-model="newStudent.id" 
              type="text" 
              placeholder="请输入学号（可选）"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeNewStudentDialog">取消</button>
          <button class="confirm-btn" @click="createNewStudent" :disabled="!newStudent.name.trim()">
            创建
          </button>
        </div>
      </div>
    </div>

      <!-- 学生文件夹列表 -->
      <div v-if="studentFolders.length > 0" class="student-folders">
        <div 
          v-for="folder in studentFolders" 
          :key="folder.studentId" 
          class="student-folder"
          :class="{ 'drag-over': draggedFolder === folder.studentName }"
          @drop.prevent="handleDrop($event, folder)"
          @dragover.prevent="handleDragOver($event, folder)"
          @dragleave="handleDragLeave"
        >
          <div class="folder-header" @click="openFolder(folder)">
            <div class="folder-title">
              <h3>📁 {{ folder.studentName }}</h3>
            </div>
            <div class="folder-actions">
              <button 
                class="edit-folder-btn" 
                @click.stop="openEditDialog(folder)" 
                title="编辑学生信息"
              >
                ✏️
              </button>
              <button 
                class="delete-folder-btn" 
                @click.stop="deleteStudentFolder(folder)" 
                title="删除学生档案"
              >
                🗑️
              </button>
            </div>
            <div class="folder-stats">
              <span class="folder-stat">📄 {{ folder.documents.length }} 份文档</span>
              <span class="folder-stat">💾 {{ formatFileSize(folder.totalSize) }}</span>
            </div>
          </div>
          
          <!-- 拖拽提示区域 -->
          <div v-if="draggedFolder === folder.studentName" class="drop-zone-indicator">
            <div class="drop-zone-content">
              📤 松开鼠标上传到 {{ folder.studentName }} 的档案
            </div>
          </div>
          
          <!-- 上传进度显示 -->
          <div v-if="uploadingFolders[folder.studentName]" class="upload-progress-bar">
            <div class="progress-fill" :style="{ width: uploadingFolders[folder.studentName] + '%' }"></div>
            <span class="progress-text">上传中... {{ uploadingFolders[folder.studentName] }}%</span>
          </div>
          
          <!-- 文档预览 -->
          <div class="documents-preview" @click="openFolder(folder)">
            <div v-if="folder.documents.length > 0" class="document-count">
              点击查看文档
            </div>
            <div v-else class="empty-hint">
              拖拽文档到这里上传
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!showTrashView" class="empty-state">
        <div class="empty-icon">📁</div>
        <p>还没有学生档案</p>
        <p class="empty-hint">点击"新建学生档案"开始</p>
      </div>

      <!-- 回收站视图 -->
      <div v-if="showTrashView" class="trash-view">
        <div class="trash-header">
          <button class="back-btn" @click="showTrashView = false">← 返回</button>
          <h2>🗑️ 回收站</h2>
          <span class="trash-count">{{ deletedDocuments.length }} 个文档</span>
          <button v-if="deletedDocuments.length > 0" class="empty-trash-btn" @click="handleEmptyTrash">
            🗑️ 清空回收站
          </button>
        </div>
        <div class="trash-hint">
          <p>💡 删除的文档将保留 30 天，过期后自动永久删除。您可以随时恢复或彻底删除。</p>
        </div>
        <div v-if="deletedDocuments.length === 0" class="trash-empty">
          <div class="empty-icon">✨</div>
          <p>回收站是空的</p>
        </div>
        <div v-else class="trash-items">
          <div 
            v-for="doc in deletedDocuments" 
            :key="doc.id"
            class="trash-card"
          >
            <div class="trash-thumbnail">
              <img v-if="isImage(doc.file_name || doc.document_name)" :src="doc.file_url" :alt="doc.file_name" />
              <div v-else class="doc-icon-box">
                <span class="doc-icon">{{ getDocumentIcon(doc.file_name || doc.document_name) }}</span>
              </div>
            </div>
            <div class="trash-info">
              <p class="trash-filename" :title="doc.file_name">{{ doc.file_name || doc.document_name }}</p>
              <p class="trash-meta">
                来自: {{ doc.student_name }}
              </p>
              <p class="trash-date">
                删除于: {{ formatDate(doc.deleted_at) }}
                <span class="expire-hint">({{ getDaysUntilExpire(doc.deleted_at) }})</span>
              </p>
            </div>
            <div class="trash-actions">
              <button class="action-btn restore-btn" @click="handleRestoreDocument(doc)" title="恢复">
                ♻️ 恢复
              </button>
              <button class="action-btn delete-btn" @click="handlePermanentDeleteDocument(doc)" title="彻底删除">
                ❌ 删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件夹详情视图 -->
    <div v-else class="folder-detail">
      <div class="detail-header">
        <button class="back-btn" @click="closeFolder">
          ← 返回
        </button>
        <div class="detail-title">
          <h2>📁 {{ selectedFolder.studentName }}</h2>
        </div>
        <div class="detail-actions">
          <input
            ref="fileInput"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar,.7z,.mp3,.wav,.mp4,.avi,.mov"
            style="display: none"
            @change="handleFileSelect"
          />
          <button class="new-folder-btn" @click="showNewSubfolderDialog = true">
            📁 新建文件夹
          </button>
          <button class="upload-btn" @click="$refs.fileInput.click()">
            📤 上传文档
          </button>
        </div>
      </div>

      <!-- 面包屑导航 -->
      <div class="subfolder-breadcrumb">
        <span 
          class="breadcrumb-item"
          :class="{ active: !currentSubfolderId }"
          @click="navigateToFolderRoot"
        >
          🏠 根目录
        </span>
        <template v-for="(folder, index) in subfolderBreadcrumbs" :key="folder.id">
          <span class="breadcrumb-separator">›</span>
          <span 
            class="breadcrumb-item"
            :class="{ active: index === subfolderBreadcrumbs.length - 1 }"
            @click="navigateToSubfolder(folder)"
          >
            {{ folder.name }}
          </span>
        </template>
      </div>

      <!-- 拖拽上传区域 -->
      <div
        class="detail-drop-zone"
        :class="{ 'drag-over': isDraggingInDetail }"
        @drop="handleDetailDrop"
        @dragover="handleDetailDragOver"
        @dragleave="handleDetailDragLeave"
      >
        <div v-if="isDraggingInDetail" class="drop-hint">
          📤 松开鼠标上传文档
        </div>

        <!-- 上传进度 -->
        <div v-if="detailUploadProgress > 0 && detailUploadProgress < 100" class="upload-progress-bar">
          <div class="progress-fill" :style="{ width: detailUploadProgress + '%' }"></div>
          <span class="progress-text">上传中... {{ detailUploadProgress }}%</span>
        </div>

        <!-- 子文件夹列表 -->
        <div v-if="currentSubfolders.length > 0" class="subfolders-section">
          <h4 class="section-title">📁 文件夹</h4>
          <div class="subfolders-grid">
            <div 
              v-for="folder in currentSubfolders" 
              :key="folder.id"
              class="subfolder-card"
              :class="{ 'drop-target': dragOverFolderId === folder.id }"
              @click="enterSubfolder(folder)"
              @dragover.prevent="handleFolderDragOver(folder.id)"
              @dragleave="handleFolderDragLeave"
              @drop.prevent="handleDropToFolder($event, folder)"
            >
              <div class="subfolder-icon">📂</div>
              <div class="subfolder-info">
                <h5>{{ folder.name }}</h5>
                <p>{{ getSubfolderItemCount(folder.id) }} 个项目</p>
                <span v-if="draggingDocument && dragOverFolderId === folder.id" class="drop-hint-text">
                  松开移动到此文件夹
                </span>
              </div>
              <div class="subfolder-actions-inline" @click.stop>
                <button class="mini-action-btn" @click="renameSubfolder(folder)" title="重命名">✏️</button>
                <button class="mini-action-btn" @click.stop="showSubfolderMenu(folder, $event)">⋮</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 文档列表 -->
        <div v-if="currentDocuments.length > 0" class="documents-section">
          <div class="section-header">
            <h4 class="section-title">📄 文件</h4>
            <div class="selection-actions">
              <button class="batch-action-btn secondary" @click="selectAllDocuments">☑️ 全选</button>
              <template v-if="selectedDocuments.length > 0">
                <span class="selection-count">已选择 {{ selectedDocuments.length }} 个</span>
                <button class="batch-action-btn move" @click="openBatchMoveDialog">📁 移动选中</button>
                <button class="batch-action-btn" @click="deleteSelectedDocuments">🗑️ 删除选中</button>
                <button class="batch-action-btn secondary" @click="clearDocSelection">取消选择</button>
              </template>
            </div>
          </div>
          <div class="detail-documents-list">
            <div
              v-for="doc in currentDocuments"
              :key="doc.id"
              class="detail-document-card"
              :class="{ selected: selectedDocuments.includes(doc.id) }"
              draggable="true"
              @click.exact="toggleDocSelection(doc.id)"
              @click.shift="shiftSelectDoc(doc.id)"
              @dragstart="handleDocDragStart($event, doc)"
              @dragend="handleDocDragEnd"
            >
            <div class="doc-select-checkbox" @click.stop="toggleDocSelection(doc.id)">
              <input type="checkbox" :checked="selectedDocuments.includes(doc.id)" />
            </div>
            <div class="document-icon-large">
              {{ getDocumentIcon(doc.document_name) }}
            </div>
            <div class="document-info-detail">
              <h4 class="document-name-detail" :title="doc.document_name">
                {{ doc.document_name }}
              </h4>
              <p class="document-meta-detail">
                {{ doc.document_type }} · {{ formatFileSize(doc.file_size) }}
              </p>
              <p class="document-date">
                上传于 {{ formatDate(doc.created_at) }}
              </p>
            </div>
            <div class="document-actions-detail">
              <button
                class="action-btn-detail rename"
                @click.stop="renameDocument(doc)"
                title="重命名"
              >
                ✏️ 重命名
              </button>
              <button
                class="action-btn-detail move"
                @click.stop="openMoveDialog(doc)"
                title="移动"
              >
                📁 移动
              </button>
              <button
                class="action-btn-detail preview"
                @click.stop="previewDocument(doc)"
                title="预览"
              >
                👁️ 预览
              </button>
              <a
                :href="doc.file_url"
                target="_blank"
                class="action-btn-detail download"
                title="下载"
                @click.stop
              >
                ⬇️ 下载
              </a>
              <button
                class="action-btn-detail delete"
                @click.stop="deleteDocument(doc.id)"
                title="删除"
              >
                🗑️ 删除
              </button>
            </div>
          </div>
        </div>
        </div>

        <!-- 空状态 -->
        <div v-if="currentSubfolders.length === 0 && currentDocuments.length === 0" class="detail-empty">
          <div class="empty-icon-large">📄</div>
          <p>此文件夹为空</p>
          <p class="empty-hint">点击"新建文件夹"创建子文件夹，或点击"上传文档"上传文件</p>
        </div>
      </div>
    </div>

    <!-- 新建子文件夹对话框 -->
    <div v-if="showNewSubfolderDialog" class="modal-overlay" @click="showNewSubfolderDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建文件夹</h3>
          <button class="close-btn" @click="showNewSubfolderDialog = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>文件夹名称 *</label>
            <input 
              v-model="newSubfolderName" 
              type="text" 
              placeholder="请输入文件夹名称"
              class="form-input"
              @keyup.enter="createSubfolder"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showNewSubfolderDialog = false">取消</button>
          <button class="confirm-btn" @click="createSubfolder" :disabled="!newSubfolderName.trim()">
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 移动文件对话框 -->
    <div v-if="showMoveDialog" class="modal-overlay move-dialog" @click="closeMoveDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>📁 移动文件到...</h3>
          <button class="close-btn" @click="closeMoveDialog">✕</button>
        </div>
        <div class="modal-body">
          <p class="move-file-name">
            {{ isBatchMove ? `已选择 ${selectedDocuments.length} 个文件` : `文件: ${movingDocument?.document_name}` }}
          </p>
          <div class="folder-options">
            <label 
              v-for="target in getAvailableMoveTargets()" 
              :key="target.id || 'root'"
              class="folder-option"
              :class="{ selected: selectedMoveTarget === target.id }"
            >
              <input 
                type="radio" 
                :value="target.id" 
                v-model="selectedMoveTarget"
                name="moveTarget"
              />
              <span class="folder-name">{{ target.name }}</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeMoveDialog">取消</button>
          <button class="confirm-btn" @click="confirmMove">确定移动</button>
        </div>
      </div>
    </div>

    <!-- 子文件夹菜单 -->
    <div 
      v-if="subfolderMenuVisible" 
      class="subfolder-menu"
      :style="{ top: subfolderMenuPosition.y + 'px', left: subfolderMenuPosition.x + 'px' }"
      @click.stop
    >
      <button @click="renameSelectedSubfolder">✏️ 重命名</button>
      <button @click="deleteSelectedSubfolder" class="danger">🗑️ 删除</button>
    </div>

    <!-- 编辑学生档案对话框 -->
    <div v-if="showEditStudentDialog" class="modal-overlay" @click="closeEditStudentDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑学生信息</h3>
          <button class="close-btn" @click="closeEditStudentDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>学生姓名 *</label>
            <input 
              v-model="editStudentForm.name" 
              type="text" 
              placeholder="请输入学生姓名"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>学号</label>
            <input 
              v-model="editStudentForm.id" 
              type="text" 
              placeholder="请输入学号（可选）"
              class="form-input"
            />
          </div>
          <div class="form-hint">
            💡 修改后，该学生的所有文档信息都会同步更新
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeEditStudentDialog">取消</button>
          <button class="confirm-btn" @click="saveEditStudent" :disabled="!editStudentForm.name.trim()">
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 重命名对话框 -->
    <div v-if="showRenameDialog" class="modal-overlay" @click="closeRenameDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ renameType === 'folder' ? '重命名文件夹' : '重命名文件' }}</h3>
          <button class="close-btn" @click="closeRenameDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>新名称</label>
            <input 
              v-model="renameNewName" 
              type="text" 
              placeholder="请输入新名称"
              class="form-input"
              @keyup.enter="confirmRename"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeRenameDialog">取消</button>
          <button class="confirm-btn" @click="confirmRename" :disabled="!renameNewName.trim()">
            确定
          </button>
        </div>
      </div>
    </div>

    <!-- 文档预览模态框 -->
    <div v-if="previewingDocument" class="preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <div class="preview-header">
          <h3>{{ previewingDocument.document_name }}</h3>
          <button class="close-btn" @click="closePreview">✕</button>
        </div>
        <div class="preview-body">
          <!-- PDF预览 -->
          <div v-if="isPDF(previewingDocument.document_name)" style="width: 100%; height: 100%; display: flex; flex-direction: column;">
            <iframe
              :src="`https://docs.google.com/viewer?url=${encodeURIComponent(previewingDocument.file_url)}&embedded=true`"
              class="preview-iframe"
              style="flex: 1; border: none;"
              frameborder="0"
            ></iframe>
            <div style="padding: 10px; text-align: center; background: white; border-top: 1px solid #eee; display: flex; gap: 16px; justify-content: center;">
              <a 
                :href="previewingDocument.file_url" 
                target="_blank" 
                class="download-link"
                style="color: #3498db; text-decoration: none; font-weight: 500;"
              >
                📥 下载 PDF
              </a>
              <a 
                :href="previewingDocument.file_url" 
                target="_blank" 
                class="download-link"
                style="color: #27ae60; text-decoration: none; font-weight: 500;"
              >
                🔗 新窗口打开
              </a>
            </div>
          </div>
          
          <!-- 图片预览 -->
          <img
            v-else-if="isImage(previewingDocument.document_name)"
            :src="previewingDocument.file_url"
            class="preview-image"
            :alt="previewingDocument.document_name"
          />
          
          <!-- 文本预览 -->
          <iframe
            v-else-if="isTextFile(previewingDocument.document_name)"
            :src="previewingDocument.file_url"
            class="preview-iframe"
          ></iframe>
          
          <!-- 其他文件类型 -->
          <div v-else class="preview-unsupported">
            <p>📄 该文件类型不支持在线预览</p>
            <a
              :href="previewingDocument.file_url"
              target="_blank"
              class="download-link"
            >
              点击下载查看
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:visible="showDeleteDocDialog"
      type="danger"
      title="确认删除文档"
      message="确定要删除这份文档吗？此操作不可恢复。"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="handleDeleteDocConfirmed"
      @cancel="showDeleteDocDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { saveStudentProfile } from '@/utils/studentProfileService'
import { 
  getStudentDocuments, 
  saveStudentDocument, 
  deleteStudentDocument 
} from '@/utils/studentProfileService'
import { supabase } from '@/lib/supabase'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

interface StudentDocument {
  id: string
  student_name?: string
  student_id: string
  document_type: string
  document_name: string
  file_name?: string
  file_url: string
  file_size?: number
  created_at: string
  folder_id?: string
  deleted_at?: string
  status?: string
}

interface StudentFolder {
  studentName: string
  studentId: string
  documents: StudentDocument[]
  totalSize: number
}

interface DocSubfolder {
  id: string
  name: string
  parentId: string | null
  studentId: string
  createdAt: string
}

const searchQuery = ref('')
const draggedFolder = ref<string | null>(null)
const uploadingFolders = ref<Record<string, number>>({})
const showNewStudentDialog = ref(false)
const newStudent = ref({ name: '', id: '' })
const allDocuments = ref<StudentDocument[]>([])
const selectedFolder = ref<StudentFolder | null>(null)
const isDraggingInDetail = ref(false)
const detailUploadProgress = ref(0)
const previewingDocument = ref<StudentDocument | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const showDeleteDocDialog = ref(false)
const documentToDelete = ref('')

// 子文件夹相关
const allSubfolders = ref<DocSubfolder[]>([])
const currentSubfolderId = ref<string | null>(null)
const showNewSubfolderDialog = ref(false)
const newSubfolderName = ref('')
const subfolderMenuVisible = ref(false)
const subfolderMenuPosition = ref({ x: 0, y: 0 })
const selectedSubfolderForMenu = ref<DocSubfolder | null>(null)

// 拖拽移动相关
const draggingDocument = ref<StudentDocument | null>(null)
const dragOverFolderId = ref<string | null>(null)
const showMoveDialog = ref(false)
const movingDocument = ref<StudentDocument | null>(null)
const selectedMoveTarget = ref<string | null>(null)
const isBatchMove = ref(false)

// 多选相关
const selectedDocuments = ref<string[]>([])
const lastSelectedDocIndex = ref<number>(-1)

// 重命名相关
const showRenameDialog = ref(false)
const renameType = ref<'folder' | 'document'>('folder')
const renamingItem = ref<DocSubfolder | StudentDocument | null>(null)
const renameNewName = ref('')

// 编辑学生档案相关
const showEditStudentDialog = ref(false)
const editingStudent = ref<StudentFolder | null>(null)
const editStudentForm = ref({ name: '', id: '' })

// 回收站相关
const showTrashView = ref(false)
const deletedDocuments = ref<StudentDocument[]>([]
)

// 学生档案列表（从 student_profiles 表加载）
interface StudentProfile {
  id: string
  student_id: string
  student_name: string
}
const studentProfiles = ref<StudentProfile[]>([])

// 加载所有文档
onMounted(async () => {
  await loadDocuments()
  await loadStudentProfiles()
  await loadDeletedDocuments()
  loadSubfolders()
  cleanupExpiredDocuments()
  document.addEventListener('click', handleClickOutsideMenu)
})

const loadDocuments = async () => {
  // 从数据库加载所有学生文档
  try {
    if (!supabase) {
      console.warn('Supabase未配置')
      return
    }

    // 尝试加载未删除的文档
    let { data, error } = await supabase
      .from('student_documents')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // 如果出错（可能是因为 deleted_at 列不存在），则降级加载所有文档
    if (error) {
      console.warn('加载文档出错，尝试降级加载:', error)
      const result = await supabase
        .from('student_documents')
        .select('*')
        .order('created_at', { ascending: false })
      
      data = result.data
      error = result.error
    }

    if (error) throw error
    
    // 将 file_size 从字符串转换为数字
    allDocuments.value = (data || []).map(doc => ({
      ...doc,
      file_size: typeof doc.file_size === 'string' ? parseInt(doc.file_size) : (doc.file_size || 0)
    }))
  } catch (error) {
    console.error('加载文档失败:', error)
  }
}

// 加载学生档案列表
const loadStudentProfiles = async () => {
  try {
    if (!supabase) return
    
    const { data, error } = await supabase
      .from('student_profiles')
      .select('id, student_id, student_name')
      .order('student_name', { ascending: true })
    
    if (error) throw error
    
    studentProfiles.value = data || []
  } catch (error) {
    console.error('加载学生档案失败:', error)
  }
}

// 加载已删除的文档
const loadDeletedDocuments = async () => {
  try {
    if (!supabase) return
    
    const { data, error } = await supabase
      .from('student_documents')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    
    if (error) throw error
    
    deletedDocuments.value = data || []
  } catch (error) {
    console.error('加载回收站失败:', error)
  }
}

// 清理过期文档（30天后自动删除）
const cleanupExpiredDocuments = async () => {
  try {
    if (!supabase) return
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // 获取过期文档
    const { data: expiredDocs, error: selectError } = await supabase
      .from('student_documents')
      .select('id, file_url')
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo.toISOString())
    
    if (selectError) throw selectError
    
    if (expiredDocs && expiredDocs.length > 0) {
      // 从存储中删除文件
      for (const doc of expiredDocs) {
        try {
          const fileName = doc.file_url?.split('/').pop()
          if (fileName) {
            await supabase.storage.from('documents').remove([`student_docs/${fileName}`])
          }
        } catch (e) {
          console.error('删除存储文件失败:', e)
        }
      }
      
      // 从数据库中删除
      const { error: deleteError } = await supabase
        .from('student_documents')
        .delete()
        .in('id', expiredDocs.map(d => d.id))
      
      if (deleteError) throw deleteError
      
      console.log(`已清理 ${expiredDocs.length} 个过期文档`)
    }
  } catch (error) {
    console.error('清理过期文档失败:', error)
  }
}

// 恢复文档
const handleRestoreDocument = async (doc: StudentDocument) => {
  try {
    if (!supabase) return
    
    const { error } = await supabase
      .from('student_documents')
      .update({ 
        deleted_at: null,
        status: 'active'
      })
      .eq('id', doc.id)
    
    if (error) throw error
    
    // 刷新列表
    await loadDocuments()
    await loadDeletedDocuments()
    alert('✅ 已恢复文档')
  } catch (error) {
    console.error('恢复文档失败:', error)
    alert('恢复失败，请重试')
  }
}

// 彻底删除文档
const handlePermanentDeleteDocument = async (doc: StudentDocument) => {
  const docName = doc.file_name || doc.document_name
  if (!confirm(`确定要彻底删除 "${docName}" 吗？\n\n此操作不可恢复！`)) return
  
  try {
    if (!supabase) return
    
    // 从存储中删除文件
    try {
      const fileName = doc.file_url?.split('/').pop()
      if (fileName) {
        await supabase.storage.from('documents').remove([`student_docs/${fileName}`])
      }
    } catch (e) {
      console.error('删除存储文件失败:', e)
    }
    
    // 从数据库中删除
    const { error } = await supabase
      .from('student_documents')
      .delete()
      .eq('id', doc.id)
    
    if (error) throw error
    
    await loadDeletedDocuments()
    alert('✅ 已彻底删除')
  } catch (error) {
    console.error('删除文档失败:', error)
    alert('删除失败，请重试')
  }
}

// 清空回收站
const handleEmptyTrash = async () => {
  if (!confirm(`确定要清空回收站吗？\n\n这将永久删除 ${deletedDocuments.value.length} 个文档，此操作不可恢复！`)) return
  
  try {
    if (!supabase) return
    
    // 从存储中删除所有文件
    for (const doc of deletedDocuments.value) {
      try {
        const fileName = doc.file_url?.split('/').pop()
        if (fileName) {
          await supabase.storage.from('documents').remove([`student_docs/${fileName}`])
        }
      } catch (e) {
        console.error('删除存储文件失败:', e)
      }
    }
    
    // 从数据库中删除
    const { error } = await supabase
      .from('student_documents')
      .delete()
      .not('deleted_at', 'is', null)
    
    if (error) throw error
    
    deletedDocuments.value = []
    alert('✅ 回收站已清空')
  } catch (error) {
    console.error('清空回收站失败:', error)
    alert('清空失败，请重试')
  }
}

// 计算文档过期天数
const getDaysUntilExpire = (deletedAt: string): string => {
  const deleteDate = new Date(deletedAt)
  const expireDate = new Date(deleteDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  
  if (daysLeft <= 0) return '即将删除'
  if (daysLeft === 1) return '1 天后过期'
  return `${daysLeft} 天后过期`
}

// 加载子文件夹
const loadSubfolders = () => {
  try {
    const saved = localStorage.getItem('studentDocSubfolders')
    if (saved) {
      allSubfolders.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载子文件夹失败:', e)
  }
}

// 如果 localStorage 中没有子文件夹数据，但数据库文档包含 folder_id，则基于文档记录生成回退的子文件夹（避免用户本地数据丢失导致文件夹消失）
const ensureSubfoldersFromDocs = () => {
  try {
    if ((!allSubfolders.value || allSubfolders.value.length === 0) && allDocuments.value.length > 0) {
      const map = new Map<string, any>()
      allDocuments.value.forEach(doc => {
        const fid = doc.folder_id || null
        if (fid) {
          if (!map.has(fid)) {
            map.set(fid, {
              id: fid,
              name: `子文件夹 ${fid.slice(0, 8)}`,
              parentId: null,
              studentId: doc.student_id,
              createdAt: new Date().toISOString()
            })
          }
        }
      })

      if (map.size > 0) {
        allSubfolders.value = Array.from(map.values())
        saveSubfolders()
        console.log('基于文档记录生成子文件夹回退:', allSubfolders.value.length)
      }
    }
  } catch (e) {
    console.error('ensureSubfoldersFromDocs failed', e)
  }
}

// 保存子文件夹
const saveSubfolders = () => {
  localStorage.setItem('studentDocSubfolders', JSON.stringify(allSubfolders.value))
}

// 点击外部关闭菜单
const handleClickOutsideMenu = () => {
  if (subfolderMenuVisible.value) {
    subfolderMenuVisible.value = false
    selectedSubfolderForMenu.value = null
  }
}

// 按学生分组
const studentFolders = computed(() => {
  const folderMap = new Map<string, StudentFolder>()
  
  // 首先添加所有学生档案（包括空的）
  studentProfiles.value.forEach(profile => {
    if (!folderMap.has(profile.student_id)) {
      folderMap.set(profile.student_id, {
        studentName: profile.student_name,
        studentId: profile.student_id,
        documents: [],
        totalSize: 0
      })
    }
  })
  
  // 然后添加文档到对应的学生文件夹
  allDocuments.value.forEach(doc => {
    const key = doc.student_id
    if (!folderMap.has(key)) {
      folderMap.set(key, {
        studentName: doc.student_name || doc.student_id,
        studentId: doc.student_id,
        documents: [],
        totalSize: 0
      })
    }
    
    const folder = folderMap.get(key)!
    folder.documents.push(doc)
    folder.totalSize += doc.file_size || 0
  })
  
  return Array.from(folderMap.values())
    .sort((a, b) => a.studentName.localeCompare(b.studentName, 'zh-CN'))
})

const totalDocuments = computed(() => allDocuments.value.length)

// 检查是否是自动生成的ID（不应该显示给用户）
const isAutoGeneratedId = (id: string): boolean => {
  if (!id) return true
  // 自动生成的ID通常以 STU 开头或者是很长的数字
  if (id.startsWith('STU')) return true
  // 如果是纯数字且长度超过10位，可能是时间戳生成的ID
  if (/^\d{10,}$/.test(id)) return true
  return false
}

const handleSearch = () => {
  // TODO: 实现搜索功能
}

// 新建学生
const closeNewStudentDialog = () => {
  showNewStudentDialog.value = false
  newStudent.value = { name: '', id: '' }
}

const createNewStudent = async () => {
  if (!newStudent.value.name.trim()) {
    alert('请输入学生姓名')
    return
  }
  
  try {
    const studentId = newStudent.value.id || `STU${Date.now()}`
    
    const result = await saveStudentProfile({
      student_name: newStudent.value.name,
      student_id: studentId
    })
    
    if (result.success) {
      alert(`✅ 学生档案 "${newStudent.value.name}" 创建成功！\n现在可以拖拽文档到文件夹中上传了。`)
      closeNewStudentDialog()
      await loadStudentProfiles()
      await loadDocuments()
    } else {
      alert('创建失败: ' + (result.error?.message || result.error))
    }
  } catch (error) {
    console.error('创建学生档案失败:', error)
    alert('创建失败，请重试')
  }
}

// 编辑学生信息
const openEditDialog = (folder: StudentFolder) => {
  editingStudent.value = folder
  editStudentForm.value = {
    name: folder.studentName,
    id: folder.studentId
  }
  showEditStudentDialog.value = true
}

const closeEditStudentDialog = () => {
  showEditStudentDialog.value = false
  editingStudent.value = null
  editStudentForm.value = { name: '', id: '' }
}

const saveEditStudent = async () => {
  if (!editStudentForm.value.name.trim() || !editingStudent.value) {
    alert('请输入学生姓名')
    return
  }
  
  try {
    const oldStudentId = editingStudent.value.studentId
    const newStudentId = editStudentForm.value.id || oldStudentId
    const newStudentName = editStudentForm.value.name.trim()
    
    // 更新 student_profiles 表
    const { error: profileError } = await supabase
      .from('student_profiles')
      .update({
        student_name: newStudentName,
        student_id: newStudentId
      })
      .eq('student_id', oldStudentId)
    
    if (profileError) {
      console.warn('更新学生档案失败:', profileError)
    }
    
    // 更新数据库中该学生的所有文档
    const { error } = await supabase
      .from('student_documents')
      .update({
        student_name: newStudentName,
        student_id: newStudentId
      })
      .eq('student_id', oldStudentId)
    
    if (error) throw error
    
    // 更新本地数据
    allDocuments.value.forEach(doc => {
      if (doc.student_id === oldStudentId) {
        doc.student_name = newStudentName
        doc.student_id = newStudentId
      }
    })
    
    // 更新本地学生档案列表
    studentProfiles.value.forEach(profile => {
      if (profile.student_id === oldStudentId) {
        profile.student_name = newStudentName
        profile.student_id = newStudentId
      }
    })
    
    // 更新子文件夹
    allSubfolders.value.forEach(folder => {
      if (folder.studentId === oldStudentId) {
        folder.studentId = newStudentId
      }
    })
    saveSubfolders()
    
    alert('✅ 学生信息更新成功！')
    closeEditStudentDialog()
    await loadStudentProfiles()
    await loadDocuments()
  } catch (error) {
    console.error('更新学生信息失败:', error)
    alert('更新失败，请重试')
  }
}

// 删除学生档案（及其所有文档）
const deleteStudentFolder = async (folder: StudentFolder) => {
  const confirmDelete = confirm(
    `确定要删除学生档案 "${folder.studentName}" 及其所有文档吗？\n\n这些文档将移到回收站，30天后自动删除。`
  )
  if (!confirmDelete) return
  
  try {
    // 将该学生的所有文档标记为已删除
    const { error } = await supabase
      .from('student_documents')
      .update({ 
        deleted_at: new Date().toISOString(),
        status: 'deleted'
      })
      .eq('student_id', folder.studentId)
    
    if (error) throw error
    
    // 删除 student_profiles 表中的记录
    const { error: profileError } = await supabase
      .from('student_profiles')
      .delete()
      .eq('student_id', folder.studentId)
    
    if (profileError) {
      console.warn('删除学生档案记录失败:', profileError)
    }
    
    // 从本地移除
    allDocuments.value = allDocuments.value.filter(doc => doc.student_id !== folder.studentId)
    studentProfiles.value = studentProfiles.value.filter(p => p.student_id !== folder.studentId)
    
    // 删除相关的子文件夹
    allSubfolders.value = allSubfolders.value.filter(f => f.studentId !== folder.studentId)
    saveSubfolders()
    
    alert('✅ 已将学生档案移至回收站')
    await loadStudentProfiles()
    await loadDocuments()
  } catch (error) {
    console.error('删除学生档案失败:', error)
    alert('删除失败，请重试')
  }
}

// 打开文件夹详情
const openFolder = (folder: StudentFolder) => {
  selectedFolder.value = folder
}

// 关闭文件夹详情
const closeFolder = () => {
  selectedFolder.value = null
  currentSubfolderId.value = null
  detailUploadProgress.value = 0
}

// 详情页文件选择
const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0 || !selectedFolder.value) return
  
  await uploadFilesToFolder(files, selectedFolder.value)
  input.value = '' // 清空input以便再次选择相同文件
}

// 详情页拖拽处理
const handleDetailDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  isDraggingInDetail.value = true
}

const handleDetailDragLeave = (event: DragEvent) => {
  // 只在离开整个拖拽区域时才设置为false
  const target = event.target as HTMLElement
  if (target.classList.contains('detail-drop-zone')) {
    isDraggingInDetail.value = false
  }
}

const handleDetailDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDraggingInDetail.value = false
  
  const files = event.dataTransfer?.files
  if (!files || files.length === 0 || !selectedFolder.value) return
  
  await uploadFilesToFolder(files, selectedFolder.value)
}

// 统一的文件上传逻辑
const uploadFilesToFolder = async (files: FileList, folder: StudentFolder) => {
  detailUploadProgress.value = 1
  
  try {
    if (!supabase) {
      alert('Supabase未配置，请先完成数据库设置')
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // 清理文件名：移除特殊字符，保留扩展名
      const cleanFileName = file.name
        .replace(/[^\w\s.-]/g, '_')  // 替换特殊字符为下划线
        .replace(/\s+/g, '_')        // 替换空格为下划线
        .replace(/_+/g, '_')         // 合并多个下划线
      
      // 1. 上传文件到 Storage
      const fileName = `${folder.studentId}/${Date.now()}_${cleanFileName}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(fileName, file)

      if (uploadError) {
        console.error('存储桶错误:', uploadError)
        throw uploadError
      }

      // 2. 获取文件URL
      const { data: urlData } = supabase.storage
        .from('student-documents')
        .getPublicUrl(fileName)

      // 3. 保存到数据库（包含folder_id）
      const docData: any = {
        student_name: folder.studentName,
        student_id: folder.studentId,
        document_type: getDocumentType(file.name),
        document_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size
      }
      
      // 如果在子文件夹中，添加folder_id
      if (currentSubfolderId.value) {
        docData.folder_id = currentSubfolderId.value
      }
      
      const result = await saveStudentDocument(docData)

      if (!result.success) {
        console.error('保存文档记录失败:', result.error)
        alert(`文件 ${file.name} 上传失败: ${result.error}`)
      }
      
      // 更新进度
      detailUploadProgress.value = Math.round(((i + 1) / files.length) * 100)
    }
    
    // 上传完成，重新加载
    await loadDocuments()
    
    // 更新当前选中的文件夹数据
    if (selectedFolder.value) {
      const updatedFolder = studentFolders.value.find(
        f => f.studentId === selectedFolder.value!.studentId
      )
      if (updatedFolder) {
        selectedFolder.value = updatedFolder
      }
    }
    
    setTimeout(() => {
      detailUploadProgress.value = 0
    }, 1000)
    
  } catch (error) {
    console.error('批量上传失败:', error)
    alert('上传过程中发生错误: ' + (error as any).message)
    detailUploadProgress.value = 0
  }
}

// 预览文档
const previewDocument = (doc: StudentDocument) => {
  previewingDocument.value = doc
}

// 关闭预览
const closePreview = () => {
  previewingDocument.value = null
}

// 文件类型判断
const isPDF = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.pdf')
}

const isImage = (fileName: string): boolean => {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  return imageExts.some(ext => fileName.toLowerCase().endsWith(ext))
}

const isTextFile = (fileName: string): boolean => {
  const textExts = ['.txt', '.md', '.json', '.xml', '.csv']
  return textExts.some(ext => fileName.toLowerCase().endsWith(ext))
}

// 拖拽处理
const handleDragOver = (event: DragEvent, folder: StudentFolder) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  draggedFolder.value = folder.studentName
}

const handleDragLeave = () => {
  draggedFolder.value = null
}

const handleDrop = async (event: DragEvent, folder: StudentFolder) => {
  event.preventDefault()
  draggedFolder.value = null
  
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return
  
  const studentId = folder.studentId
  
  // 开始上传
  uploadingFolders.value[folder.studentName] = 0
  
  try {
    if (!supabase) {
      alert('Supabase未配置，请先完成数据库设置')
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // 清理文件名：移除特殊字符，保留扩展名
      const cleanFileName = file.name
        .replace(/[^\w\s.-]/g, '_')  // 替换特殊字符为下划线
        .replace(/\s+/g, '_')        // 替换空格为下划线
        .replace(/_+/g, '_')         // 合并多个下划线
      
      // 1. 上传文件到 Storage
      const fileName = `${studentId}/${Date.now()}_${cleanFileName}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(fileName, file)

      if (uploadError) {
        console.error('存储桶错误:', uploadError)
        throw uploadError
      }

      // 2. 获取文件URL
      const { data: urlData } = supabase.storage
        .from('student-documents')
        .getPublicUrl(fileName)

      // 3. 保存到数据库
      const result = await saveStudentDocument({
        student_name: folder.studentName,
        student_id: studentId,
        document_type: getDocumentType(file.name),
        document_name: file.name,  // 保存原始文件名到数据库
        file_url: urlData.publicUrl,
        file_size: file.size
      })

      if (!result.success) {
        console.error('保存文档记录失败:', result.error)
        alert(`文件 ${file.name} 上传失败: ${result.error}`)
      }
      
      // 更新进度
      uploadingFolders.value[folder.studentName] = Math.round(((i + 1) / files.length) * 100)
    }
    
    // 上传完成，重新加载
    await loadDocuments()
    
    setTimeout(() => {
      delete uploadingFolders.value[folder.studentName]
    }, 1000)
    
  } catch (error) {
    console.error('批量上传失败:', error)
    alert('上传过程中发生错误: ' + (error as any).message)
    delete uploadingFolders.value[folder.studentName]
  }
}

// 删除文档
const deleteDocument = async (id: string) => {
  documentToDelete.value = id
  showDeleteDocDialog.value = true
}

const handleDeleteDocConfirmed = async () => {
  showDeleteDocDialog.value = false
  if (!documentToDelete.value) return
  
  try {
    const result = await deleteStudentDocument(documentToDelete.value)
    if (result.success) {
      await loadDocuments()
      alert('✅ 已删除，文件已移至回收站')
    } else {
      const errorMsg = result.error?.message || (typeof result.error === 'string' ? result.error : '未知错误')
      alert('删除失败: ' + errorMsg)
    }
  } catch (error) {
    console.error('删除文档失败:', error)
    alert('删除失败，请重试')
  }
  documentToDelete.value = ''
}

// 工具函数
const getDocumentIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'xls': '📗',
    'xlsx': '📗',
    'ppt': '📙',
    'pptx': '📙',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'txt': '📝',
    'zip': '📦',
    'rar': '📦',
    '7z': '📦',
    'mp3': '🎵',
    'wav': '🎵',
    'mp4': '🎬',
    'avi': '🎬',
    'mov': '🎬'
  }
  return iconMap[ext || ''] || '📄'
}

const getDocumentType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    'pdf': 'PDF文档',
    'doc': 'Word文档',
    'docx': 'Word文档',
    'xls': 'Excel表格',
    'xlsx': 'Excel表格',
    'ppt': 'PPT演示',
    'pptx': 'PPT演示',
    'jpg': '图片',
    'jpeg': '图片',
    'png': '图片',
    'gif': '图片',
    'txt': '文本文档',
    'mp3': '音频',
    'wav': '音频',
    'mp4': '视频',
    'avi': '视频',
    'mov': '视频',
    'zip': '压缩包',
    'rar': '压缩包',
    '7z': '压缩包'
  }
  return typeMap[ext || ''] || '其他文档'
}

// 子文件夹相关计算属性
const currentSubfolders = computed(() => {
  if (!selectedFolder.value) return []
  return allSubfolders.value.filter(f => 
    f.studentId === selectedFolder.value!.studentId && 
    f.parentId === currentSubfolderId.value
  )
})

const currentDocuments = computed(() => {
  if (!selectedFolder.value) return []
  return selectedFolder.value.documents.filter(doc => 
    (doc.folder_id || null) === currentSubfolderId.value
  )
})

const subfolderBreadcrumbs = computed(() => {
  const breadcrumbs: DocSubfolder[] = []
  let currentId = currentSubfolderId.value
  
  while (currentId) {
    const folder = allSubfolders.value.find(f => f.id === currentId)
    if (folder) {
      breadcrumbs.unshift(folder)
      currentId = folder.parentId
    } else {
      break
    }
  }
  
  return breadcrumbs
})

// 子文件夹操作函数
const navigateToFolderRoot = () => {
  currentSubfolderId.value = null
}

const navigateToSubfolder = (folder: DocSubfolder) => {
  currentSubfolderId.value = folder.id
}

const enterSubfolder = (folder: DocSubfolder) => {
  currentSubfolderId.value = folder.id
}

const createSubfolder = () => {
  if (!newSubfolderName.value.trim() || !selectedFolder.value) return
  
  const newFolder: DocSubfolder = {
    id: `subfolder_${Date.now()}`,
    name: newSubfolderName.value.trim(),
    parentId: currentSubfolderId.value,
    studentId: selectedFolder.value.studentId,
    createdAt: new Date().toISOString()
  }
  
  allSubfolders.value.push(newFolder)
  saveSubfolders()
  
  newSubfolderName.value = ''
  showNewSubfolderDialog.value = false
}

const showSubfolderMenu = (folder: DocSubfolder, event: MouseEvent) => {
  selectedSubfolderForMenu.value = folder
  subfolderMenuPosition.value = { x: event.clientX, y: event.clientY }
  subfolderMenuVisible.value = true
}

const renameSelectedSubfolder = () => {
  if (!selectedSubfolderForMenu.value) return
  
  const newName = prompt('请输入新名称', selectedSubfolderForMenu.value.name)
  if (newName && newName.trim()) {
    selectedSubfolderForMenu.value.name = newName.trim()
    saveSubfolders()
  }
  subfolderMenuVisible.value = false
  selectedSubfolderForMenu.value = null
}

const deleteSelectedSubfolder = async () => {
  if (!selectedSubfolderForMenu.value) return
  
  if (confirm(`确定要删除文件夹"${selectedSubfolderForMenu.value.name}"及其中的所有文件吗？\n\n文件将移到回收站，30天后自动删除。`)) {
    try {
      const deleteRecursive = async (folderId: string) => {
        // 递归删除子文件夹
        const subFolders = allSubfolders.value.filter(f => f.parentId === folderId)
        for (const sf of subFolders) {
          await deleteRecursive(sf.id)
        }
        
        // 将该文件夹内的文档移到回收站（软删除）
        const docsInFolder = allDocuments.value.filter(d => d.folder_id === folderId)
        for (const doc of docsInFolder) {
          await deleteStudentDocument(doc.id)
        }
        
        // 从本地数组中移除文件夹
        const index = allSubfolders.value.findIndex(f => f.id === folderId)
        if (index !== -1) {
          allSubfolders.value.splice(index, 1)
        }
      }
      
      await deleteRecursive(selectedSubfolderForMenu.value.id)
      saveSubfolders()
      await loadDocuments()
      alert('✅ 文件夹已删除，文件已移至回收站')
    } catch (error) {
      console.error('删除文件夹失败:', error)
      alert('删除失败，请重试')
    }
  }
  subfolderMenuVisible.value = false
  selectedSubfolderForMenu.value = null
}

const getSubfolderItemCount = (folderId: string): number => {
  const docs = allDocuments.value.filter(d => d.folder_id === folderId).length
  const subfolders = allSubfolders.value.filter(f => f.parentId === folderId).length
  return docs + subfolders
}

const formatFileSize = (bytes: number | string | undefined | null): string => {
  // 处理字符串类型的 bytes
  const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes
  
  if (numBytes === undefined || numBytes === null || isNaN(numBytes)) return '未知大小'
  if (numBytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(numBytes) / Math.log(k))
  return Math.round(numBytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ========== 拖拽移动相关函数 ==========
const handleDocDragStart = (event: DragEvent, doc: StudentDocument) => {
  draggingDocument.value = doc
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', doc.id)
  }
}

const handleDocDragEnd = () => {
  draggingDocument.value = null
  dragOverFolderId.value = null
}

const handleFolderDragOver = (folderId: string) => {
  if (draggingDocument.value) {
    dragOverFolderId.value = folderId
  }
}

const handleFolderDragLeave = () => {
  dragOverFolderId.value = null
}

const handleDropToFolder = async (event: DragEvent, folder: DocSubfolder) => {
  event.preventDefault()
  dragOverFolderId.value = null
  
  // 如果是拖拽文档项目
  if (draggingDocument.value) {
    const doc = draggingDocument.value
    await moveDocumentToFolder(doc, folder.id)
    draggingDocument.value = null
    return
  }
}

const moveDocumentToFolder = async (doc: StudentDocument, targetFolderId: string | null) => {
  try {
    if (!supabase) {
      console.warn('Supabase未配置')
      return
    }
    
    // 更新数据库中的 folder_id
    const { error } = await supabase
      .from('student_documents')
      .update({ folder_id: targetFolderId })
      .eq('id', doc.id)
    
    if (error) throw error
    
    // 更新本地数据
    const index = allDocuments.value.findIndex(d => d.id === doc.id)
    if (index !== -1) {
      allDocuments.value[index] = { ...doc, folder_id: targetFolderId || undefined }
    }
    
  } catch (error) {
    console.error('移动文档失败:', error)
    alert('移动失败，请重试')
  }
}

// ========== 移动对话框相关函数 ==========
const openMoveDialog = (doc: StudentDocument) => {
  isBatchMove.value = false
  movingDocument.value = doc
  selectedMoveTarget.value = doc.folder_id || null
  showMoveDialog.value = true
}

// 打开批量移动对话框
const openBatchMoveDialog = () => {
  if (selectedDocuments.value.length === 0) return
  isBatchMove.value = true
  movingDocument.value = null
  selectedMoveTarget.value = currentSubfolderId.value
  showMoveDialog.value = true
}

const closeMoveDialog = () => {
  showMoveDialog.value = false
  movingDocument.value = null
  selectedMoveTarget.value = null
  isBatchMove.value = false
}

const confirmMove = async () => {
  if (isBatchMove.value) {
    // 批量移动选中的文件
    await batchMoveDocuments()
  } else if (movingDocument.value) {
    // 单个文件移动
    await moveDocumentToFolder(movingDocument.value, selectedMoveTarget.value)
  }
  closeMoveDialog()
}

// 批量移动文档
const batchMoveDocuments = async () => {
  if (selectedDocuments.value.length === 0) return
  
  try {
    for (const docId of selectedDocuments.value) {
      const doc = allDocuments.value.find(d => d.id === docId)
      if (doc) {
        await moveDocumentToFolder(doc, selectedMoveTarget.value)
      }
    }
    alert(`成功移动 ${selectedDocuments.value.length} 个文件`)
    clearDocSelection()
  } catch (error) {
    console.error('批量移动文档失败:', error)
    alert('移动失败，请重试')
  }
}

const getAvailableMoveTargets = (): (DocSubfolder | { id: null; name: string })[] => {
  if (!selectedFolder.value) return []
  
  // 获取当前学生的所有文件夹
  const studentFolders = allSubfolders.value.filter(f => 
    f.studentId === selectedFolder.value!.studentId
  )
  
  // 添加根目录选项
  return [
    { id: null, name: '📁 根目录 (不在任何文件夹中)' },
    ...studentFolders.map(f => ({ ...f, name: `📂 ${f.name}` }))
  ]
}

// ========== 多选相关函数 ==========
const toggleDocSelection = (docId: string) => {
  const index = selectedDocuments.value.indexOf(docId)
  if (index === -1) {
    selectedDocuments.value.push(docId)
  } else {
    selectedDocuments.value.splice(index, 1)
  }
  lastSelectedDocIndex.value = currentDocuments.value.findIndex(d => d.id === docId)
}

const shiftSelectDoc = (docId: string) => {
  const currentIndex = currentDocuments.value.findIndex(d => d.id === docId)
  
  if (lastSelectedDocIndex.value === -1) {
    toggleDocSelection(docId)
    return
  }
  
  const start = Math.min(lastSelectedDocIndex.value, currentIndex)
  const end = Math.max(lastSelectedDocIndex.value, currentIndex)
  
  for (let i = start; i <= end; i++) {
    if (!selectedDocuments.value.includes(currentDocuments.value[i].id)) {
      selectedDocuments.value.push(currentDocuments.value[i].id)
    }
  }
}

const clearDocSelection = () => {
  selectedDocuments.value = []
  lastSelectedDocIndex.value = -1
}

// 全选当前文件夹的文档
const selectAllDocuments = () => {
  selectedDocuments.value = currentDocuments.value.map(doc => doc.id)
}

const deleteSelectedDocuments = async () => {
  if (selectedDocuments.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedDocuments.value.length} 个文件吗？`)) return
  
  for (const id of selectedDocuments.value) {
    await deleteDocument(id)
  }
  selectedDocuments.value = []
}

// ========== 重命名相关函数 ==========
const renameSubfolder = (folder: DocSubfolder) => {
  renameType.value = 'folder'
  renamingItem.value = folder
  renameNewName.value = folder.name
  showRenameDialog.value = true
}

const renameDocument = (doc: StudentDocument) => {
  renameType.value = 'document'
  renamingItem.value = doc
  // 去掉扩展名显示
  const lastDot = doc.document_name.lastIndexOf('.')
  renameNewName.value = lastDot > 0 ? doc.document_name.substring(0, lastDot) : doc.document_name
  showRenameDialog.value = true
}

const closeRenameDialog = () => {
  showRenameDialog.value = false
  renamingItem.value = null
  renameNewName.value = ''
}

const confirmRename = async () => {
  if (!renamingItem.value || !renameNewName.value.trim()) return
  
  if (renameType.value === 'folder') {
    const folder = renamingItem.value as DocSubfolder
    folder.name = renameNewName.value.trim()
    saveSubfolders()
  } else {
    const doc = renamingItem.value as StudentDocument
    // 保留原扩展名
    const lastDot = doc.document_name.lastIndexOf('.')
    const ext = lastDot > 0 ? doc.document_name.substring(lastDot) : ''
    const newFileName = renameNewName.value.trim() + ext
    
    // 更新数据库
    try {
      if (supabase) {
        const { error } = await supabase
          .from('student_documents')
          .update({ document_name: newFileName })
          .eq('id', doc.id)
        
        if (error) throw error
        
        // 更新本地数据
        const index = allDocuments.value.findIndex(d => d.id === doc.id)
        if (index !== -1) {
          allDocuments.value[index] = { ...allDocuments.value[index], document_name: newFileName }
        }
      }
    } catch (error) {
      console.error('重命名失败:', error)
      alert('重命名失败，请重试')
    }
  }
  
  closeRenameDialog()
}
</script>

<style scoped>
.documents-gallery {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #333;
}

.stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
}

.stat-icon {
  font-size: 16px;
}

.new-student-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #42b983, #35a372);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.new-student-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.4);
}

.search-bar {
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

/* 模态框样式（复用MediaGallery的样式） */
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.confirm-btn {
  background: linear-gradient(135deg, #42b983, #35a372);
  color: white;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.4);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 文件夹样式 */
.student-folders {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.student-folder {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
}

.student-folder:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 2px solid #42b983;
}

.student-folder.drag-over {
  border: 3px dashed #42b983;
  background: #f0fdf7;
  box-shadow: 0 4px 16px rgba(66, 185, 131, 0.2);
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  flex-wrap: wrap;
}

.folder-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  overflow: visible;
}

.folder-title h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
  white-space: nowrap;
}

.folder-student-id {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.folder-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}

.edit-folder-btn {
  padding: 6px 10px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.edit-folder-btn:hover {
  background: #f0f0f0;
  border-color: #42b983;
  color: #42b983;
}

.folder-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.folder-stat {
  padding: 6px 12px;
  background: #f8f8f8;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.drop-zone-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(66, 185, 131, 0.1);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
  pointer-events: none;
}

.drop-zone-content {
  background: white;
  padding: 24px 48px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #42b983;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.documents-preview {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}

.document-count {
  color: #42b983;
  font-weight: 600;
}

/* 文件夹详情视图 */
.folder-detail {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-height: 70vh;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.back-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.detail-title {
  flex: 1;
  min-width: 200px;
}

.detail-title h2 {
  margin: 0 0 6px 0;
  font-size: 24px;
  color: #333;
}

.detail-student-id {
  font-size: 14px;
  color: #999;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 4px;
}

.upload-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #42b983, #35a372);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.4);
}

.new-folder-btn {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #666;
  border: 1px dashed #d0d0d0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.new-folder-btn:hover {
  background: #e8e8e8;
  border-color: #42b983;
  color: #42b983;
}

/* 面包屑导航 */
.subfolder-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  margin-bottom: 16px;
}

.subfolder-breadcrumb .breadcrumb-item {
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.subfolder-breadcrumb .breadcrumb-item:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.subfolder-breadcrumb .breadcrumb-item.active {
  color: #42b983;
  font-weight: 600;
  cursor: default;
}

.subfolder-breadcrumb .breadcrumb-item.active:hover {
  background: transparent;
}

.subfolder-breadcrumb .breadcrumb-separator {
  color: #9ca3af;
  font-size: 14px;
}

/* 子文件夹网格 */
.subfolders-section,
.documents-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.subfolders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.subfolder-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.subfolder-card:hover {
  background: #fef9c3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(253, 224, 71, 0.3);
}

.subfolder-icon {
  font-size: 32px;
}

.subfolder-info h5 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #1f2937;
}

.subfolder-info p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.subfolder-menu-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.subfolder-card:hover .subfolder-menu-btn {
  opacity: 1;
}

.subfolder-menu-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* 子文件夹菜单 */
.subfolder-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 1100;
  min-width: 120px;
}

.subfolder-menu button {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  border-radius: 6px;
  transition: background 0.2s;
}

.subfolder-menu button:hover {
  background: #f3f4f6;
}

.subfolder-menu button.danger {
  color: #ef4444;
}

.subfolder-menu button.danger:hover {
  background: #fef2f2;
}

.detail-drop-zone {
  min-height: 500px;
  border: 3px dashed #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s;
  position: relative;
}

.detail-drop-zone.drag-over {
  border-color: #42b983;
  background: rgba(66, 185, 131, 0.05);
}

.drop-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: #42b983;
  font-weight: 600;
  text-align: center;
  pointer-events: none;
  z-index: 10;
}

.detail-documents-list {
  display: grid;
  gap: 16px;
}

.detail-document-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  padding-left: 48px; /* 为checkbox留出空间 */
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.detail-document-card:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.document-icon-large {
  font-size: 36px;
  min-width: 50px;
  text-align: center;
}

.document-info-detail {
  flex: 1;
  min-width: 0;
}

.document-name-detail {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-meta-detail {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #666;
}

.document-date {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.document-actions-detail {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn-detail {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  white-space: nowrap;
}

.action-btn-detail.preview {
  background: #42b983;
  color: white;
}

.action-btn-detail.preview:hover {
  background: #35a372;
}

.action-btn-detail.download {
  background: #4a90e2;
  color: white;
}

.action-btn-detail.download:hover {
  background: #357abd;
}

.action-btn-detail.delete {
  background: #f56c6c;
  color: white;
}

.action-btn-detail.delete:hover {
  background: #e64545;
}

.detail-empty {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon-large {
  font-size: 80px;
  margin-bottom: 20px;
}

.detail-empty p {
  margin: 8px 0;
  font-size: 16px;
}

/* 文档预览模态框 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.preview-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.preview-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  padding-right: 20px;
}

.preview-body {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f5f5f5;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
  background: white;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.preview-unsupported {
  text-align: center;
  padding: 40px;
}

.preview-unsupported p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.download-link {
  display: inline-block;
  padding: 12px 24px;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.download-link:hover {
  background: #35a372;
  transform: translateY(-2px);
}

.upload-progress-bar {
  position: relative;
  height: 32px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #42b983, #35a372);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-size: 13px;
  font-weight: 600;
  z-index: 1;
}

.documents-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.document-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
  transition: all 0.2s;
}

.document-card:hover {
  background: #f0f0f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.document-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-meta {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.document-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
}

.action-btn:hover {
  background: #f0f0f0;
  border-color: #42b983;
}

.action-btn.delete:hover {
  border-color: #ff4444;
  color: #ff4444;
}

.empty-folder {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-hint {
  margin-top: 10px;
  font-size: 14px;
  color: #bbb;
}

@media (max-width: 768px) {
  .gallery-header {
    flex-direction: column;
  }
  
  .student-folders {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-actions {
    width: 100%;
  }
  
  .upload-btn {
    width: 100%;
  }
  
  .document-actions-detail {
    flex-direction: column;
    width: 100%;
  }
  
  .action-btn-detail {
    width: 100%;
    justify-content: center;
  }
}

/* ========== 拖拽移动相关样式 ========== */
.detail-document-card[draggable="true"] {
  cursor: grab;
}

.detail-document-card[draggable="true"]:active {
  cursor: grabbing;
}

/* 文件夹拖放目标 */
.subfolder-card.drop-target {
  background: linear-gradient(135deg, #42b983, #35a372) !important;
  color: white !important;
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(66, 185, 131, 0.4);
}

.subfolder-card.drop-target .subfolder-icon,
.subfolder-card.drop-target .subfolder-info h5,
.subfolder-card.drop-target .subfolder-info p {
  color: white !important;
}

.drop-hint-text {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 4px;
  display: block;
}

/* 移动按钮 */
.action-btn-detail.move {
  background: linear-gradient(135deg, #42b983, #35a372);
  color: white;
  border-color: #42b983;
}

.action-btn-detail.move:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.4);
}

/* 移动对话框样式 */
.move-dialog .modal-content {
  max-width: 400px;
}

.move-file-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.folder-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.folder-option:hover {
  border-color: #42b983;
  background: #f0fdf7;
}

.folder-option.selected {
  border-color: #42b983;
  background: linear-gradient(135deg, rgba(66, 185, 131, 0.1), rgba(53, 163, 114, 0.1));
}

.folder-option input[type="radio"] {
  accent-color: #42b983;
}

.folder-option .folder-name {
  flex: 1;
  font-size: 14px;
}

/* ========== 多选相关样式 ========== */
.detail-document-card.selected {
  border: 2px solid #42b983;
  background: rgba(66, 185, 131, 0.05);
}

.doc-select-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  opacity: 0;
  transition: opacity 0.2s;
}

.detail-document-card:hover .doc-select-checkbox,
.detail-document-card.selected .doc-select-checkbox {
  opacity: 1;
}

.doc-select-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #42b983;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selection-count {
  font-size: 13px;
  color: #42b983;
  font-weight: 500;
}

.batch-action-btn {
  padding: 6px 12px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.batch-action-btn:hover {
  background: #cc0000;
}

.batch-action-btn.secondary {
  background: #f0f0f0;
  color: #666;
}

.batch-action-btn.secondary:hover {
  background: #e0e0e0;
}

/* ========== 内联操作按钮 ========== */
.subfolder-actions-inline {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.subfolder-card:hover .subfolder-actions-inline {
  opacity: 1;
}

.mini-action-btn {
  background: white;
  border: 1px solid #ddd;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.mini-action-btn:hover {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

/* 重命名按钮 */
.action-btn-detail.rename {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  color: white;
  border-color: #ffc107;
}

.action-btn-detail.rename:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.4);
}

/* ========== 回收站样式 ========== */
.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.trash-btn {
  padding: 8px 16px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.trash-btn:hover {
  background: #ee5a5a;
}

.trash-view {
  padding: 20px;
}

.trash-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.trash-header h2 {
  margin: 0;
  font-size: 20px;
}

.trash-count {
  color: #666;
  font-size: 14px;
}

.empty-trash-btn {
  margin-left: auto;
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.empty-trash-btn:hover {
  background: #c82333;
}

.trash-hint {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.trash-hint p {
  margin: 0;
  color: #856404;
  font-size: 14px;
}

.trash-empty {
  padding: 60px 20px;
  text-align: center;
}

.trash-empty .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.trash-empty p {
  color: #666;
  font-size: 16px;
}

.trash-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.trash-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #eee;
}

.trash-thumbnail {
  position: relative;
  height: 120px;
  background: #f5f5f5;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trash-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
}

.doc-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.doc-icon {
  font-size: 48px;
  opacity: 0.5;
}

.trash-info {
  padding: 12px;
}

.trash-filename {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trash-meta {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #666;
}

.trash-date {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.expire-hint {
  color: #e74c3c;
  font-weight: 500;
}

.trash-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
}

.trash-actions .restore-btn {
  flex: 1;
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.trash-actions .restore-btn:hover {
  background: #218838;
}

.trash-actions .delete-btn {
  flex: 1;
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.trash-actions .delete-btn:hover {
  background: #c82333;
}

/* 删除按钮样式 */
.delete-folder-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.2s;
}

.delete-folder-btn:hover {
  opacity: 1;
  background: rgba(220, 53, 69, 0.1);
}
</style>
