import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminLogin, getAdminUser, createAdminUser } from '@/utils/cockroachdbService'
import { setCurrentUser } from '@/lib/supabase'

interface AdminUser {
  id: string
  username: string
  full_name?: string
  role: string
  status: string
  created_at: string
  updated_at: string
}

/**
 * 认证存储 - 使用 CockroachDB
 * 迁移后使用 CockroachDB 而不是 Supabase
 */
export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const currentUser = ref<AdminUser | null>(null)
  const token = ref<string | null>(null)

  // 初始化：从 localStorage 恢复登录状态
  const init = () => {
    const savedToken = localStorage.getItem('admin_token')
    const savedUser = localStorage.getItem('admin_user')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        currentUser.value = JSON.parse(savedUser)
        isAuthenticated.value = true
        setCurrentUser(currentUser.value)
        console.log('✅ 从 localStorage 恢复用户会话:', currentUser.value?.username)
      } catch (error) {
        console.error('❌ 恢复会话失败:', error)
        logout()
      }
    }
  }

  // 登录 - 使用 CockroachDB 认证
  const login = async (username: string, password: string, remember: boolean = false) => {
    try {
      console.log('🔑 开始登录:', username)

      const result = await adminLogin(username, password)
      const user = result.data

      if (!user) {
        console.error('❌ 用户不存在或密码错误')
        return false
      }

      // 生成简单的 token （生产环境应使用 JWT）
      const newToken = btoa(`${username}:${Date.now()}`)
      
      currentUser.value = user as AdminUser
      token.value = newToken
      isAuthenticated.value = true
      setCurrentUser(user)

      console.log('✅ 登录成功:', username)

      // 保存到 localStorage
      if (remember) {
        localStorage.setItem('admin_token', newToken)
        localStorage.setItem('admin_user', JSON.stringify(user))
        console.log('💾 已保存会话信息到 localStorage')
      } else {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }

      return true
    } catch (error) {
      console.error('❌ 登录失败:', error)
      return false
    }
  }

  // 登出
  const logout = () => {
    console.log('🚪 用户登出')
    currentUser.value = null
    token.value = null
    isAuthenticated.value = false
    setCurrentUser(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_user')
  }

  // 检查登录状态
  const checkAuth = () => {
    const isValid = isAuthenticated.value && !!token.value
    return isValid
  }

  // 注册 - 使用 CockroachDB 创建新用户
  const register = async (username: string, password: string, fullName: string) => {
    try {
      console.log('📝 开始注册:', username)

      // 检查用户是否已存在
      const existingUser = await getAdminUser(username)
      if (existingUser.data) {
        console.error('❌ 用户已存在:', username)
        return false
      }

      // 创建新用户
      const result = await createAdminUser({
        username,
        password, // 生产环境应进行加密
        full_name: fullName,
        role: 'user',
        status: 'active'
      })

      if (result.success) {
        console.log('✅ 注册成功:', username)
        return true
      } else {
        console.error('❌ 注册失败:', result.error)
        return false
      }
    } catch (error) {
      console.error('❌ 注册异常:', error)
      return false
    }
  }

  // 初始化（在 store 创建时自动调用）
  init()

  return {
    isAuthenticated,
    currentUser,
    token,
    init,
    login,
    logout,
    checkAuth,
    register
  }
})
