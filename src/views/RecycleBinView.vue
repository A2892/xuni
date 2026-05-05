<template>
  <div class="recycle-bin-view">
    <div class="header">
      <div class="header-left">
        <h1>🗑️ 回收站</h1>
        <p class="subtitle">已删除的项目将在30天后自动清理</p>
      </div>
      <div class="header-actions">
        <button 
          v-if="hasExpiredItems" 
          @click="cleanupExpiredItems" 
          class="btn-cleanup"
        >
          🧹 清理过期项目
        </button>
        <button 
          v-if="selectedItems.length > 0" 
          @click="restoreSelected" 
          class="btn-restore"
        >
          ↩️ 恢复选中 ({{ selectedItems.length }})
        </button>
        <button 
          v-if="selectedItems.length > 0" 
          @click="permanentDeleteSelected" 
          class="btn-delete-permanent"
        >
          🗑️ 永久删除选中
        </button>
        <button 
          v-if="totalDeletedItems > 0" 
          @click="emptyRecycleBin" 
          class="btn-empty"
        >
          🗑️ 清空回收站
        </button>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="tabs">
      <button 
        :class="['tab', { active: activeTab === 'documents' }]"
        @click="activeTab = 'documents'"
      >
        📄 资料文档 ({{ deletedDocuments.length }})
      </button>
      <button 
        :class="['tab', { active: activeTab === 'media' }]"
        @click="activeTab = 'media'"
      >
        🖼️ 照片媒体 ({{ deletedMedia.length }})
      </button>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">总计删除项目：</span>
        <span class="stat-value">{{ totalDeletedItems }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">即将过期：</span>
        <span class="stat-value warning">{{ soonExpireCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已过期：</span>
        <span class="stat-value danger">{{ expiredCount }}</span>
      </div>
    </div>

    <!-- 资料文档标签页 -->
    <div v-if="activeTab === 'documents'" class="content-section">
      <div v-if="deletedDocuments.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>资料回收站为空</p>
      </div>
      <div v-else class="items-list">
        <div 
          v-for="doc in deletedDocuments" 
          :key="doc.id"
          :class="['item-card', { 
            selected: selectedItems.includes(doc.id),
            expired: isExpired(doc.deleted_at)
          }]"
          @click="toggleSelection(doc.id)"
        >
          <div class="item-checkbox">
            <input 
              type="checkbox" 
              :checked="selectedItems.includes(doc.id)"
              @click.stop="toggleSelection(doc.id)"
            />
          </div>
          <div class="item-icon">{{ getDocumentIcon(doc.document_name) }}</div>
          <div class="item-info">
            <h4>{{ doc.document_name }}</h4>
            <p class="item-meta">
              {{ doc.student_name }} · {{ doc.document_type }}
            </p>
            <p class="item-time">
              删除于: {{ formatDate(doc.deleted_at) }}
              <span :class="['expire-badge', getExpireStatus(doc.deleted_at).class]">
                {{ getExpireStatus(doc.deleted_at).text }}
              </span>
            </p>
          </div>
          <div class="item-actions">
            <button @click.stop="restoreItem(doc.id, 'document')" class="btn-restore-single">
              ↩️ 恢复
            </button>
            <button @click.stop="permanentDelete(doc.id, 'document')" class="btn-delete-single">
              🗑️ 永久删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 照片媒体标签页 -->
    <div v-if="activeTab === 'media'" class="content-section">
      <div v-if="deletedMedia.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>照片回收站为空</p>
      </div>
      <div v-else class="items-grid">
        <div 
          v-for="item in deletedMedia" 
          :key="item.id"
          :class="['media-card', { 
            selected: selectedItems.includes(item.id),
            expired: isExpired(item.deleted_at)
          }]"
          @click="toggleSelection(item.id)"
        >
          <div class="media-checkbox">
            <input 
              type="checkbox" 
              :checked="selectedItems.includes(item.id)"
              @click.stop="toggleSelection(item.id)"
            />
          </div>
          <div class="media-preview">
            <img v-if="item.type === 'photo'" :src="item.url" :alt="item.fileName" />
            <div v-else class="media-placeholder">
              {{ item.type === 'video' ? '🎥' : '📄' }}
            </div>
          </div>
          <div class="media-info">
            <h4>{{ item.fileName }}</h4>
            <p class="media-meta">{{ item.studentName || '未分配' }}</p>
            <p class="media-time">
              删除于: {{ formatDate(item.deleted_at) }}
            </p>
            <span :class="['expire-badge', getExpireStatus(item.deleted_at).class]">
              {{ getExpireStatus(item.deleted_at).text }}
            </span>
          </div>
          <div class="media-actions">
            <button @click.stop="restoreItem(item.id, 'media')" class="btn-restore-single">
              ↩️
            </button>
            <button @click.stop="permanentDelete(item.id, 'media')" class="btn-delete-single">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认对话框 -->
    <ConfirmDialog
      v-model:visible="showConfirmDialog"
      :type="confirmType"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="handleConfirm"
      @cancel="showConfirmDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useMediaStore } from '@/stores/media'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

interface DeletedDocument {
  id: string
  student_name: string
  document_type: string
  document_name: string
  file_url: string
  deleted_at: string
  storage_path?: string
}

interface DeletedMedia {
  id: string
  fileName: string
  type: string
  url: string
  studentName?: string
  deleted_at: string
  storage_path?: string
}

const mediaStore = useMediaStore()
const activeTab = ref<'documents' | 'media'>('documents')
const deletedDocuments = ref<DeletedDocument[]>([])
const deletedMedia = ref<DeletedMedia[]>([])
const selectedItems = ref<string[]>([])
const showConfirmDialog = ref(false)
const confirmType = ref<'warning' | 'danger'>('warning')
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref<() => void>(() => {})

// 计算属性
const totalDeletedItems = computed(() => deletedDocuments.value.length + deletedMedia.value.length)

const soonExpireCount = computed(() => {
  const all = [...deletedDocuments.value, ...deletedMedia.value]
  return all.filter(item => {
    const days = getDaysUntilExpire(item.deleted_at)
    return days > 0 && days <= 7
  }).length
})

const expiredCount = computed(() => {
  const all = [...deletedDocuments.value, ...deletedMedia.value]
  return all.filter(item => isExpired(item.deleted_at)).length
})

const hasExpiredItems = computed(() => expiredCount.value > 0)

// 加载已删除的资料
const loadDeletedDocuments = async () => {
  try {
    if (!supabase) return
    
    // 尝试加载有 deleted_at 字段的记录
    const { data, error } = await supabase
      .from('student_documents')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    
    // 如果查询失败（可能是列不存在），则返回空数组
    if (error) {
      console.warn('加载已删除文档失败，可能是 deleted_at 列不存在:', error.message)
      deletedDocuments.value = []
      return
    }
    
    deletedDocuments.value = data || []
  } catch (error) {
    console.error('加载已删除文档失败:', error)
    deletedDocuments.value = []
  }
}

// 加载已删除的媒体
const loadDeletedMedia = async () => {
  try {
    if (!supabase) return
    
    // 尝试加载有 deleted_at 字段的记录
    const { data, error } = await supabase
      .from('student_media')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    
    // 如果查询失败（可能是列不存在），则返回空数组
    if (error) {
      console.warn('加载已删除媒体失败，可能是 deleted_at 列不存在:', error.message)
      deletedMedia.value = []
      return
    }
    
    deletedMedia.value = (data || []).map(item => ({
      id: item.id,
      fileName: item.file_name,
      type: item.type,
      url: item.url,
      studentName: item.student_name,
      deleted_at: item.deleted_at,
      storage_path: item.storage_path
    }))
  } catch (error) {
    console.error('加载已删除媒体失败:', error)
    deletedMedia.value = []
  }
}

// 计算距离过期天数
const getDaysUntilExpire = (deletedAt: string): number => {
  const deleted = new Date(deletedAt)
  const expire = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const diffTime = expire.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 判断是否已过期
const isExpired = (deletedAt: string): boolean => {
  return getDaysUntilExpire(deletedAt) <= 0
}

// 获取过期状态
const getExpireStatus = (deletedAt: string) => {
  const days = getDaysUntilExpire(deletedAt)
  
  if (days <= 0) {
    return { text: '已过期', class: 'danger' }
  } else if (days <= 3) {
    return { text: `${days}天后过期`, class: 'danger' }
  } else if (days <= 7) {
    return { text: `${days}天后过期`, class: 'warning' }
  } else {
    return { text: `${days}天后过期`, class: 'normal' }
  }
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取文档图标
const getDocumentIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    xls: '📗',
    xlsx: '📗',
    ppt: '📙',
    pptx: '📙',
    txt: '📄',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    zip: '📦',
    rar: '📦'
  }
  return iconMap[ext || ''] || '📄'
}

// 切换选中
const toggleSelection = (id: string) => {
  const index = selectedItems.value.indexOf(id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(id)
  }
}

// 恢复单个项目
const restoreItem = async (id: string, type: 'document' | 'media') => {
  try {
    const table = type === 'document' ? 'student_documents' : 'student_media'
    
    const { error } = await supabase
      .from(table)
      .update({ deleted_at: null })
      .eq('id', id)
    
    if (error) throw error
    
    // 重新加载
    if (type === 'document') {
      await loadDeletedDocuments()
    } else {
      await loadDeletedMedia()
      mediaStore.isLoaded = false
      await mediaStore.loadMediaItems()
    }
    
    selectedItems.value = selectedItems.value.filter(i => i !== id)
    // 恢复成功提示
    alert('已恢复')
  } catch (error) {
    console.error('恢复失败:', error)
    alert('恢复失败，请重试')
  }
}

// 永久删除单个项目
const permanentDelete = (id: string, type: 'document' | 'media') => {
  confirmType.value = 'danger'
  confirmTitle.value = '确认永久删除'
  confirmMessage.value = '永久删除后将无法恢复，确定要继续吗？'
  confirmAction.value = () => executePermanentDelete(id, type)
  showConfirmDialog.value = true
}

const executePermanentDelete = async (id: string, type: 'document' | 'media') => {
  try {
    const table = type === 'document' ? 'student_documents' : 'student_media'
    
    // 获取存储路径
    let storagePath = ''
    if (type === 'document') {
      const doc = deletedDocuments.value.find(d => d.id === id)
      storagePath = doc?.storage_path || ''
    } else {
      const media = deletedMedia.value.find(m => m.id === id)
      storagePath = media?.storage_path || ''
    }
    
    // 从Storage删除文件
    if (storagePath && supabase) {
      const bucket = type === 'document' ? 'student-documents' : 'student-media'
      await supabase.storage.from(bucket).remove([storagePath])
    }
    
    // 从数据库删除记录
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    // 重新加载
    if (type === 'document') {
      await loadDeletedDocuments()
    } else {
      await loadDeletedMedia()
    }
    
    selectedItems.value = selectedItems.value.filter(i => i !== id)
    // 永久删除成功提示
    alert('已永久删除')
  } catch (error) {
    console.error('永久删除失败:', error)
    alert('删除失败，请重试')
  }
}


// 恢复选中项目
const restoreSelected = async () => {
  try {
    const docIds = selectedItems.value.filter(id => 
      deletedDocuments.value.some(d => d.id === id)
    )
    const mediaIds = selectedItems.value.filter(id => 
      deletedMedia.value.some(m => m.id === id)
    )
    
    // 恢复文档
    if (docIds.length > 0 && supabase) {
      await supabase
        .from('student_documents')
        .update({ deleted_at: null })
        .in('id', docIds)
    }
    
    // 恢复媒体
    if (mediaIds.length > 0 && supabase) {
      await supabase
        .from('student_media')
        .update({ deleted_at: null })
        .in('id', mediaIds)
    }
    
    // 重新加载
    await loadDeletedDocuments()
    await loadDeletedMedia()
    mediaStore.isLoaded = false
    await mediaStore.loadMediaItems()
    
    selectedItems.value = []
    // 恢复成功提示
    alert('已恢复选中项目')
  } catch (error) {
    console.error('批量恢复失败:', error)
    alert('恢复失败，请重试')
  }
}

// 永久删除选中项目
const permanentDeleteSelected = () => {
  confirmType.value = 'danger'
  confirmTitle.value = '确认永久删除'
  confirmMessage.value = `确定要永久删除选中的 ${selectedItems.value.length} 个项目吗？此操作无法撤销！`
  confirmAction.value = executePermanentDeleteSelected
  showConfirmDialog.value = true
}

const executePermanentDeleteSelected = async () => {
  try {
    const docIds = selectedItems.value.filter(id => 
      deletedDocuments.value.some(d => d.id === id)
    )
    const mediaIds = selectedItems.value.filter(id => 
      deletedMedia.value.some(m => m.id === id)
    )
    
    // 删除文档
    if (docIds.length > 0 && supabase) {
      // 获取storage paths
      const docs = deletedDocuments.value.filter(d => docIds.includes(d.id))
      const storagePaths = docs.map(d => d.storage_path).filter(Boolean) as string[]
      
      if (storagePaths.length > 0) {
        await supabase.storage.from('student-documents').remove(storagePaths)
      }
      
      await supabase
        .from('student_documents')
        .delete()
        .in('id', docIds)
    }
    
    // 删除媒体
    if (mediaIds.length > 0 && supabase) {
      const media = deletedMedia.value.filter(m => mediaIds.includes(m.id))
      const storagePaths = media.map(m => m.storage_path).filter(Boolean) as string[]
      
      if (storagePaths.length > 0) {
        await supabase.storage.from('student-media').remove(storagePaths)
      }
      
      await supabase
        .from('student_media')
        .delete()
        .in('id', mediaIds)
    }
    
    // 重新加载
    await loadDeletedDocuments()
    await loadDeletedMedia()
    selectedItems.value = []
    // 批量永久删除成功提示
    const deletedCount = docIds.length + mediaIds.length
    alert(`已永久删除 ${deletedCount} 个项目`)
  } catch (error) {
    console.error('批量删除失败:', error)
    alert('删除失败，请重试')
  }
}

// 清空回收站
const emptyRecycleBin = () => {
  confirmType.value = 'danger'
  confirmTitle.value = '确认清空回收站'
  confirmMessage.value = `确定要清空回收站吗？这将永久删除所有 ${totalDeletedItems.value} 个项目，此操作无法撤销！`
  confirmAction.value = executeEmptyRecycleBin
  showConfirmDialog.value = true
}

const executeEmptyRecycleBin = async () => {
  try {
    if (!supabase) return
    
    // 删除所有文档
    if (deletedDocuments.value.length > 0) {
      const storagePaths = deletedDocuments.value.map(d => d.storage_path).filter(Boolean) as string[]
      if (storagePaths.length > 0) {
        await supabase.storage.from('student-documents').remove(storagePaths)
      }
      
      await supabase
        .from('student_documents')
        .delete()
        .not('deleted_at', 'is', null)
    }
    
    // 删除所有媒体
    if (deletedMedia.value.length > 0) {
      const storagePaths = deletedMedia.value.map(m => m.storage_path).filter(Boolean) as string[]
      if (storagePaths.length > 0) {
        await supabase.storage.from('student-media').remove(storagePaths)
      }
      
      const { error: mediaDeleteError } = await supabase
        .from('student_media')
        .delete()
        .not('deleted_at', 'is', null)
      
      if (mediaDeleteError) {
        console.error('删除媒体记录失败:', mediaDeleteError)
        throw new Error(mediaDeleteError.message)
      }
    }
    
    // 重新加载
    await loadDeletedDocuments()
    await loadDeletedMedia()
    selectedItems.value = []
    // 清空成功提示
    alert('回收站已清空')
  } catch (error) {
    console.error('清空回收站失败:', error)
    alert('清空失败，请重试')
  }
}

// 清理过期项目
const cleanupExpiredItems = () => {
  confirmType.value = 'warning'
  confirmTitle.value = '清理过期项目'
  confirmMessage.value = `确定要清理 ${expiredCount.value} 个已过期的项目吗？`
  confirmAction.value = executeCleanupExpired
  showConfirmDialog.value = true
}

const executeCleanupExpired = async () => {
  try {
    if (!supabase) return
    
    const expireDate = new Date()
    expireDate.setDate(expireDate.getDate() - 30)
    
    // 清理过期文档
    const expiredDocs = deletedDocuments.value.filter(d => isExpired(d.deleted_at))
    if (expiredDocs.length > 0) {
      const storagePaths = expiredDocs.map(d => d.storage_path).filter(Boolean) as string[]
      if (storagePaths.length > 0) {
        await supabase.storage.from('student-documents').remove(storagePaths)
      }
      
      await supabase
        .from('student_documents')
        .delete()
        .lt('deleted_at', expireDate.toISOString())
        .not('deleted_at', 'is', null)
    }
    
    // 清理过期媒体
    const expiredMediaItems = deletedMedia.value.filter(m => isExpired(m.deleted_at))
    if (expiredMediaItems.length > 0) {
      const storagePaths = expiredMediaItems.map(m => m.storage_path).filter(Boolean) as string[]
      if (storagePaths.length > 0) {
        await supabase.storage.from('student-media').remove(storagePaths)
      }
      
      await supabase
        .from('student_media')
        .delete()
        .lt('deleted_at', expireDate.toISOString())
        .not('deleted_at', 'is', null)
    }
    
    // 重新加载
    await loadDeletedDocuments()
    await loadDeletedMedia()
    // 清理成功提示
    alert('已清理过期项目')
  } catch (error) {
    console.error('清理过期项目失败:', error)
    alert('清理失败，请重试')
  }
}

const handleConfirm = () => {
  showConfirmDialog.value = false
  confirmAction.value()
}

onMounted(async () => {
  await loadDeletedDocuments()
  await loadDeletedMedia()
})
</script>

<style scoped>
.recycle-bin-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.header-left h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-restore {
  background: #10b981;
  color: white;
}

.btn-restore:hover {
  background: #059669;
}

.btn-delete-permanent {
  background: #ef4444;
  color: white;
}

.btn-delete-permanent:hover {
  background: #dc2626;
}

.btn-empty {
  background: #6b7280;
  color: white;
}

.btn-empty:hover {
  background: #4b5563;
}

.btn-cleanup {
  background: #f59e0b;
  color: white;
}

.btn-cleanup:hover {
  background: #d97706;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
}

.tab {
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 12px 20px;
  font-size: 15px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #1f2937;
  background: #f3f4f6;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

.stats-bar {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
}

.stat-value {
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
}

.stat-value.warning {
  color: #f59e0b;
}

.stat-value.danger {
  color: #ef4444;
}

.content-section {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.item-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.item-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.item-card.expired {
  border-color: #ef4444;
  background: #fef2f2;
}

.item-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.item-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #6b7280;
}

.item-time {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 8px;
}

.expire-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.expire-badge.normal {
  background: #e0f2fe;
  color: #0369a1;
}

.expire-badge.warning {
  background: #fef3c7;
  color: #d97706;
}

.expire-badge.danger {
  background: #fee2e2;
  color: #dc2626;
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-restore-single,
.btn-delete-single {
  padding: 8px 12px;
  font-size: 13px;
}

.btn-restore-single {
  background: #10b981;
  color: white;
}

.btn-restore-single:hover {
  background: #059669;
}

.btn-delete-single {
  background: #ef4444;
  color: white;
}

.btn-delete-single:hover {
  background: #dc2626;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.media-card {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.media-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.media-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.media-card.expired {
  border-color: #ef4444;
}

.media-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
}

.media-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.media-preview {
  width: 100%;
  height: 200px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-placeholder {
  font-size: 64px;
}

.media-info {
  padding: 12px;
}

.media-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-meta {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #6b7280;
}

.media-time {
  margin: 0 0 8px 0;
  font-size: 11px;
  color: #9ca3af;
}

.media-actions {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
}

.media-actions button {
  flex: 1;
  padding: 6px;
  font-size: 12px;
}
</style>
