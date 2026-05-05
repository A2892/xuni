import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAdminUser, createAdminUser } from '@/utils/cockroachdbService'

interface AdminUser {
  id: string
  username: string
  full_name?: string
  role: string
  status: string
  created_at: string
  updated_at: string
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const currentUser = ref<AdminUser | null>(null)
  const token = ref<string | null>(null)

  // 初始化：从 localStorage 恢复登录状态
  const init = () => {
    const savedToken = localStorage.getItem('admin_token')
    const savedUser = localStorage.getItem('admin_user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      currentUser.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    }
  }

  // 登录
  const login = async (username: string, password: string, remember: boolean = false) => {
    try {
      // 查询管理员用户
      const result = await getAdminUser(username)
      const user = result.data

      if (!user || user.password !== password || user.status !== 'active') {
        console.error('登录失败：用户名或密码错误')
        return false
      }

      // 生成简单的 token （生产环境应使用 JWT）
      const token_str = btoa(`${username}:${Date.now()}`)
      
      currentUser.value = user as AdminUser
      token.value = token_str
      isAuthenticated.value = true

      // 保存到 localStorage
      if (remember) {
        localStorage.setItem('admin_token', token_str)
        localStorage.setItem('admin_user', JSON.stringify(user))
      }

      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  // 登出
  const logout = () => {
    currentUser.value = null
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  // 注册
  const register = async (username: string, password: string, fullName: string) => {
    try {
      // 检查用户是否已存在
      const result = await getAdminUser(username)
      if (result.data) {
        console.error('用户已存在')
        return false
      }

      // 创建新用户
      await createAdminUser({
        username,
        password, // 生产环境应进行加密
        full_name: fullName,
        role: 'user',
        status: 'active'
      })

      return true
    } catch (error) {
      console.error('注册失败:', error)
      return false
    }
  }

  return {
    isAuthenticated,
    currentUser,
    token,
    init,
    login,
    logout,
    register
  }
})
