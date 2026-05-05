<template>
  <div class="save-load-panel">
    <div class="panel-header">
      <h3>💾 数据管理</h3>
    </div>
    
    <div class="panel-actions">
      <div class="save-section">
        <input 
          v-model="saveName" 
          type="text" 
          placeholder="输入保存名称" 
          class="save-input"
          @keyup.enter="handleSaveClick"
        />
        <button @click="handleSaveClick" class="action-btn save-btn" :disabled="!saveName || saving">
          {{ saving ? '保存中...' : currentId ? '更新' : '保存' }}
        </button>
      </div>

      <div class="load-section">
        <select v-model="selectedId" class="load-select" @change="handleSelectChange">
          <option value="">选择已保存的数据</option>
          <option v-for="doc in savedDocuments" :key="doc.id" :value="doc.id">
            {{ doc.name }} ({{ formatDate(doc.updated_at) }})
          </option>
        </select>
        <button @click="handleLoad" class="action-btn load-btn" :disabled="!selectedId || loading">
          {{ loading ? '加载中...' : '加载' }}
        </button>
        <button @click="showDeleteConfirm" class="action-btn delete-btn" :disabled="!selectedId" v-if="selectedId">
          删除
        </button>
      </div>
    </div>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>

    <!-- 更新确认对话框 -->
    <ConfirmDialog
      v-model:visible="showUpdateDialog"
      type="warning"
      title="确认更新"
      :message="`确定要更新「${saveName}」吗？这将覆盖原有的数据。`"
      confirm-text="确认更新"
      cancel-text="取消"
      @confirm="handleUpdateConfirmed"
      @cancel="showUpdateDialog = false"
    />

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:visible="showDeleteDialog"
      type="danger"
      title="确认删除"
      :message="`确定要删除「${selectedDocName}」吗？此操作不可恢复。`"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="handleDeleteConfirmed"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { saveData, updateData, getSavedDocuments, loadData, deleteData, type SavedData } from '@/utils/dataService'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps<{
  documentType: SavedData['document_type']
  getData: () => any
  setData: (data: any) => void
}>()

const saveName = ref('')
const selectedId = ref('')
const currentId = ref('')
const savedDocuments = ref<SavedData[]>([])
const saving = ref(false)
const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// 确认对话框状态
const showUpdateDialog = ref(false)
const showDeleteDialog = ref(false)

// 计算当前选中的文档名称
const selectedDocName = computed(() => {
  const doc = savedDocuments.value.find(d => d.id === selectedId.value)
  return doc?.name || ''
})

onMounted(async () => {
  await loadSavedList()
})

const loadSavedList = async () => {
  console.log('[SaveLoadPanel] 加载文档列表, 类型:', props.documentType)
  try {
    const result = await getSavedDocuments(props.documentType)
    console.log('[SaveLoadPanel] 获取结果:', result)
    if (result.success) {
      savedDocuments.value = result.data || []
      console.log('[SaveLoadPanel] 找到文档数量:', savedDocuments.value.length)
      return true
    } else {
      const msg = (result as any).message || '获取已保存列表失败'
      showMessage(msg, 'error')
      return false
    }
  } catch (err) {
    console.error('[SaveLoadPanel] 加载文档异常:', err)
    showMessage('获取已保存列表失败', 'error')
    savedDocuments.value = []
    return false
  }
} 

const handleSaveClick = () => {
  if (!saveName.value) {
    showMessage('请输入保存名称', 'error')
    return
  }

  // 如果是更新操作，显示确认对话框
  if (currentId.value) {
    showUpdateDialog.value = true
  } else {
    // 新保存直接执行
    handleSave()
  }
}

const handleUpdateConfirmed = () => {
  showUpdateDialog.value = false
  handleSave()
}

const handleSave = async () => {
  if (!saveName.value) {
    showMessage('请输入保存名称', 'error')
    return
  }

  saving.value = true
  const data = props.getData()
  console.log('[SaveLoadPanel] 开始保存, 名称:', saveName.value, '当前id:', currentId.value)

  try {
    // 添加超时机制，防止无限等待
    const savePromise = currentId.value
      ? updateData(currentId.value, saveName.value, data)
      : saveData(props.documentType, saveName.value, data)
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('保存超时，请检查网络连接')), 30000)
    )
    
    const result = await Promise.race([savePromise, timeoutPromise]) as any
    console.log('[SaveLoadPanel] 保存返回结果:', result)

    if (result && result.success) {
      showMessage(currentId.value ? '更新成功！' : '保存成功！', 'success')
      currentId.value = result.data?.id || currentId.value
      // 重新加载列表并自动选中新保存的文档
      const loaded = await loadSavedList()
      if (currentId.value) {
        // 确保 select 中选中刚刚保存的项
        selectedId.value = currentId.value
        saveName.value = saveName.value || (result.data?.name || '')
      }
    } else {
      const msg = (result && (result as any).message) || '保存失败，请重试'
      showMessage(msg, 'error')
      console.error('保存错误详情:', result)
    }
  } catch (error) {
    console.error('保存异常:', error)
    const errorMsg = (error as any).message || '保存失败，请重试'
    showMessage(errorMsg, 'error')
  } finally {
    saving.value = false
    console.log('[SaveLoadPanel] saving flag reset to false')
  }
}

const handleSelectChange = () => {
  if (selectedId.value) {
    const doc = savedDocuments.value.find(d => d.id === selectedId.value)
    if (doc) {
      saveName.value = doc.name
      currentId.value = doc.id || ''
    }
  }
}

const handleLoad = async () => {
  if (!selectedId.value) return

  loading.value = true
  try {
    const result = await loadData(selectedId.value)
    if (result.success && result.data) {
      props.setData(result.data.data)
      saveName.value = result.data.name
      currentId.value = result.data.id
      showMessage('加载成功！', 'success')
    } else {
      const msg = (result as any).message || '加载失败，请重试'
      showMessage(msg, 'error')
    }
  } catch (error) {
    showMessage('加载失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

const showDeleteConfirm = () => {
  if (!selectedId.value) return
  showDeleteDialog.value = true
}

const handleDeleteConfirmed = async () => {
  showDeleteDialog.value = false
  await handleDelete()
}

const handleDelete = async () => {
  if (!selectedId.value) return

  try {
    const result = await deleteData(selectedId.value)
    if (result.success) {
      showMessage('删除成功！', 'success')
      selectedId.value = ''
      saveName.value = ''
      currentId.value = ''
      await loadSavedList()
    } else {
      const msg = (result as any).message || '删除失败，请重试'
      showMessage(msg, 'error')
    }
  } catch (error) {
    showMessage('删除失败，请重试', 'error')
  }
}

const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const formatDate = (date: string | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.save-load-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
}

.panel-header {
  margin-bottom: 10px;
}

.panel-header h3 {
  color: white;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.save-section,
.load-section {
  display: flex;
  gap: 6px;
  align-items: center;
}

.save-input,
.load-select {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  color: #1f2937;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.save-input:focus,
.load-select:focus {
  outline: none;
  border-color: white;
  background: white;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.action-btn {
  padding: 7px 14px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  min-width: 65px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

.load-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  min-width: 65px;
}

.load-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  min-width: 55px;
}

.delete-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

.message {
  margin-top: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.message.success {
  background: rgba(16, 185, 129, 0.2);
  color: white;
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.message.error {
  background: rgba(239, 68, 68, 0.2);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.5);
}
</style>
