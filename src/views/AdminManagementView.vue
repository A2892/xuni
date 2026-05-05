<template>
  <div class="admin-management">
    <div class="page-header">
      <h1>👤 管理员账号管理</h1>
      <p>管理系统管理员账号</p>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索管理员..."
          class="search-input"
        />
      </div>
      <button class="btn-primary" @click="showCreateDialog = true">
        ➕ 新建管理员
      </button>
    </div>

    <div v-if="filteredAdmins.length > 0" class="admins-grid">
      <div
        v-for="admin in filteredAdmins"
        :key="admin.id"
        class="admin-card"
      >
        <div class="admin-avatar">
          <span class="avatar-icon">👤</span>
        </div>
        <div class="admin-info">
          <h3>{{ admin.full_name || admin.username }}</h3>
          <p class="admin-username">@{{ admin.username }}</p>
          <div class="admin-meta">
            <span class="meta-item">
              <span class="meta-label">角色:</span>
              <span class="meta-value">{{ admin.role }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">状态:</span>
              <span :class="['status-badge', admin.status]">
                {{ admin.status === 'active' ? '正常' : '禁用' }}
              </span>
            </span>
          </div>
          <p class="admin-date">创建于 {{ formatDate(admin.created_at) }}</p>
        </div>
        <div class="admin-actions">
          <button
            class="btn-edit"
            @click="showEditDialog(admin)"
          >
            ✏️ 编辑
          </button>
          <button
            class="btn-password"
            @click="showPasswordDialog(admin)"
          >
            🔑 改密
          </button>
          <button
            v-if="admin.username !== 'admin' && admin.id !== currentUser?.id"
            class="btn-danger"
            @click="confirmDelete(admin)"
          >
            🗑️ 删除
          </button>
          <span v-else-if="admin.id === currentUser?.id" class="protected-label">当前账号</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">👥</div>
      <p>没有找到管理员</p>
    </div>

    <!-- 新建管理员对话框 -->
    <div v-if="showCreateDialog" class="modal-overlay" @click="closeCreateDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建管理员账号</h3>
          <button class="close-btn" @click="closeCreateDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名 *</label>
            <input
              v-model="newAdmin.username"
              type="text"
              placeholder="请输入用户名"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>密码 *</label>
            <input
              v-model="newAdmin.password"
              type="password"
              placeholder="请输入密码"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>姓名</label>
            <input
              v-model="newAdmin.full_name"
              type="text"
              placeholder="请输入姓名（可选）"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeCreateDialog">取消</button>
          <button
            class="confirm-btn"
            @click="createAdmin"
            :disabled="!newAdmin.username || !newAdmin.password"
          >
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑管理员对话框 -->
    <div v-if="showEditDialogFlag" class="modal-overlay" @click="closeEditDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑账号信息</h3>
          <button class="close-btn" @click="closeEditDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input
              v-model="editingAdmin.username"
              type="text"
              disabled
              class="form-input"
            />
            <small class="form-hint">用户名不可修改</small>
          </div>
          <div class="form-group">
            <label>姓名</label>
            <input
              v-model="editingAdmin.full_name"
              type="text"
              placeholder="请输入姓名"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input
              v-model="editingAdmin.email"
              type="email"
              placeholder="请输入邮箱（可选）"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeEditDialog">取消</button>
          <button class="confirm-btn" @click="updateAdmin">保存</button>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <div v-if="showPasswordDialogFlag" class="modal-overlay" @click="closePasswordDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>修改密码</h3>
          <button class="close-btn" @click="closePasswordDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input
              :value="passwordAdmin.username"
              type="text"
              disabled
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>新密码 *</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>确认密码 *</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closePasswordDialog">取消</button>
          <button
            class="confirm-btn"
            @click="updatePassword"
            :disabled="!passwordForm.newPassword || !passwordForm.confirmPassword"
          >
            修改密码
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:visible="showDeleteConfirmDialog"
      type="danger"
      title="确认删除管理员"
      :message="`确定要删除管理员「${adminToDelete?.username}」吗？此操作不可恢复！`"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="handleDeleteConfirmed"
      @cancel="showDeleteConfirmDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

interface AdminUser {
  id: string
  username: string
  full_name?: string
  role: string
  status: string
  created_at: string
}

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentUser)

const admins = ref<AdminUser[]>([])
const searchQuery = ref('')
const showCreateDialog = ref(false)
const showEditDialogFlag = ref(false)
const showPasswordDialogFlag = ref(false)
const showDeleteConfirmDialog = ref(false)
const adminToDelete = ref<AdminUser | null>(null)
const newAdmin = ref({
  username: '',
  password: '',
  full_name: ''
})
const editingAdmin = ref({
  id: '',
  username: '',
  full_name: '',
  email: ''
})
const passwordAdmin = ref({
  id: '',
  username: ''
})
const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

const filteredAdmins = computed(() => {
  if (!searchQuery.value) return admins.value
  
  const query = searchQuery.value.toLowerCase()
  return admins.value.filter(admin =>
    admin.username.toLowerCase().includes(query) ||
    admin.full_name?.toLowerCase().includes(query)
  )
})

// 加载管理员列表
const loadAdmins = async () => {
  try {
    if (!supabase) {
      console.error('Supabase未配置')
      return
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    admins.value = data || []
  } catch (error) {
    console.error('加载管理员列表失败:', error)
    alert('加载管理员列表失败，请重试')
  }
}

// 创建管理员
const createAdmin = async () => {
  if (!newAdmin.value.username || !newAdmin.value.password) {
    alert('请填写用户名和密码')
    return
  }

  try {
    if (!supabase) {
      alert('Supabase未配置')
      return
    }

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        username: newAdmin.value.username,
        password: newAdmin.value.password,
        full_name: newAdmin.value.full_name || null,
        role: 'admin',
        status: 'active'
      })
      .select()

    if (error) {
      if (error.code === '23505') {
        alert('用户名已存在')
      } else {
        throw error
      }
      return
    }

    alert('✅ 管理员账号创建成功！')
    closeCreateDialog()
    await loadAdmins()
  } catch (error) {
    console.error('创建管理员失败:', error)
    alert('创建管理员失败，请重试')
  }
}

// 删除管理员
const confirmDelete = (admin: AdminUser) => {
  adminToDelete.value = admin
  showDeleteConfirmDialog.value = true
}

const handleDeleteConfirmed = () => {
  showDeleteConfirmDialog.value = false
  if (adminToDelete.value) {
    deleteAdmin(adminToDelete.value.id)
    adminToDelete.value = null
  }
}

const deleteAdmin = async (id: string) => {
  try {
    if (!supabase) {
      alert('Supabase未配置')
      return
    }

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)

    if (error) throw error

    alert('✅ 管理员账号已删除')
    await loadAdmins()
  } catch (error) {
    console.error('删除管理员失败:', error)
    alert('删除管理员失败，请重试')
  }
}

// 关闭对话框
const closeCreateDialog = () => {
  showCreateDialog.value = false
  newAdmin.value = {
    username: '',
    password: '',
    full_name: ''
  }
}

// 显示编辑对话框
const showEditDialog = (admin: AdminUser) => {
  editingAdmin.value = {
    id: admin.id,
    username: admin.username,
    full_name: admin.full_name || '',
    email: (admin as any).email || ''
  }
  showEditDialogFlag.value = true
}

// 关闭编辑对话框
const closeEditDialog = () => {
  showEditDialogFlag.value = false
  editingAdmin.value = {
    id: '',
    username: '',
    full_name: '',
    email: ''
  }
}

// 更新管理员信息
const updateAdmin = async () => {
  try {
    if (!supabase) {
      alert('Supabase未配置')
      return
    }

    const { error } = await supabase
      .from('admin_users')
      .update({
        full_name: editingAdmin.value.full_name || null,
        email: editingAdmin.value.email || null
      })
      .eq('id', editingAdmin.value.id)

    if (error) throw error

    alert('✅ 账号信息更新成功！')
    closeEditDialog()
    await loadAdmins()
    
    // 如果修改的是当前用户，更新authStore
    if (editingAdmin.value.id === currentUser.value?.id) {
      authStore.currentUser = {
        ...authStore.currentUser!,
        full_name: editingAdmin.value.full_name
      }
    }
  } catch (error) {
    console.error('更新管理员信息失败:', error)
    alert('更新管理员信息失败，请重试')
  }
}

// 显示修改密码对话框
const showPasswordDialog = (admin: AdminUser) => {
  passwordAdmin.value = {
    id: admin.id,
    username: admin.username
  }
  passwordForm.value = {
    newPassword: '',
    confirmPassword: ''
  }
  showPasswordDialogFlag.value = true
}

// 关闭修改密码对话框
const closePasswordDialog = () => {
  showPasswordDialogFlag.value = false
  passwordAdmin.value = {
    id: '',
    username: ''
  }
  passwordForm.value = {
    newPassword: '',
    confirmPassword: ''
  }
}

// 修改密码
const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    alert('密码长度不能少于6位')
    return
  }

  try {
    if (!supabase) {
      alert('Supabase未配置')
      return
    }

    const { error } = await supabase
      .from('admin_users')
      .update({
        password: passwordForm.value.newPassword
      })
      .eq('id', passwordAdmin.value.id)

    if (error) throw error

    alert('✅ 密码修改成功！')
    closePasswordDialog()
    
    // 如果修改的是当前用户密码，提示重新登录
    if (passwordAdmin.value.id === currentUser.value?.id) {
      if (confirm('密码已修改，需要重新登录。是否立即退出？')) {
        authStore.logout()
        window.location.href = '/login'
      }
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    alert('修改密码失败，请重试')
  }
}

// 格式化日期
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

onMounted(() => {
  loadAdmins()
})
</script>

<style scoped>
.admin-management {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.admins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.admin-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  display: flex;
  gap: 16px;
}

.admin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.admin-avatar {
  flex-shrink: 0;
}

.avatar-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}

.admin-info {
  flex: 1;
  min-width: 0;
}

.admin-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-username {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #999;
}

.admin-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.meta-label {
  color: #999;
}

.meta-value {
  color: #666;
  font-weight: 500;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}

.admin-date {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.admin-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.btn-edit {
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-edit:hover {
  background: #1976D2;
}

.btn-password {
  padding: 8px 16px;
  background: #FF9800;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-password:hover {
  background: #F57C00;
}

.btn-danger {
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-danger:hover {
  background: #d32f2f;
}

.protected-label {
  padding: 8px 16px;
  background: #f5f5f5;
  color: #999;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

/* 模态框样式 */
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
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .admins-grid {
    grid-template-columns: 1fr;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
}
</style>
