/**
 * 学生数据服务 - 通过 HTTP API 调用
 * 使用后端 API 而不是直接连接数据库
 */

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : ''

// ==================== 响应类型 ====================

export interface StudentProfile {
  id?: string
  student_name: string
  student_id: string
  major?: string
  school?: string
  college?: string
  email?: string
  phone?: string
  enrollment_date?: string
  expected_graduation?: string
  photo_url?: string
  created_at?: string
  updated_at?: string
}

export interface StudentMedia {
  id: string
  student_id: string
  type: 'photo' | 'video'
  file_name: string
  file_size: number
  storage_path: string
  url: string
  created_at: string
  updated_at: string
}

export interface StudentDocument {
  id: string
  student_id: string
  document_type: string
  file_url: string
  created_at: string
  updated_at: string
}

// ==================== 通用 HTTP 方法 ====================

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' = 'GET',
  body?: any
): Promise<{ data: T | null; error: string | null }> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: null,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
      }
    }

    const result = await response.json()
    return {
      data: result.data || result,
      error: result.error || null
    }
  } catch (error: any) {
    console.error('API 请求失败:', error)
    return {
      data: null,
      error: error.message || '网络错误'
    }
  }
}

// ==================== 学生档案操作 ====================

/**
 * 获取所有学生档案
 */
export async function getAllStudentProfiles() {
  return apiCall<StudentProfile[]>('/api/student-profiles')
}

/**
 * 获取单个学生档案
 */
export async function getStudentProfile(studentId: string) {
  return apiCall<StudentProfile>(`/api/student-profiles/${studentId}`)
}

/**
 * 保存学生档案（创建或更新）
 */
export async function saveStudentProfile(data: StudentProfile) {
  return apiCall<StudentProfile>(
    '/api/student-profiles',
    'POST',
    data
  )
}

/**
 * 删除学生档案
 */
export async function deleteStudentProfile(studentId: string) {
  return apiCall<void>(
    `/api/student-profiles/${studentId}`,
    'DELETE'
  )
}

// ==================== 媒体文件操作 ====================

/**
 * 获取学生媒体文件
 */
export async function getStudentMedia(studentId: string) {
  return apiCall<StudentMedia[]>(`/api/student-media/${studentId}`)
}

/**
 * 创建媒体记录
 */
export async function createMediaRecord(data: any) {
  return apiCall<StudentMedia>(
    '/api/student-media',
    'POST',
    data
  )
}

/**
 * 删除媒体文件
 */
export async function deleteMediaFile(mediaId: string) {
  return apiCall<void>(
    `/api/student-media/${mediaId}`,
    'DELETE'
  )
}

// ==================== 文档操作 ====================

/**
 * 获取学生文档
 */
export async function getStudentDocuments(studentId: string) {
  return apiCall<StudentDocument[]>(`/api/student-documents/${studentId}`)
}

/**
 * 创建文档记录
 */
export async function createDocumentRecord(data: any) {
  return apiCall<StudentDocument>(
    '/api/student-documents',
    'POST',
    data
  )
}

/**
 * 删除文档
 */
export async function deleteDocument(docId: string) {
  return apiCall<void>(
    `/api/student-documents/${docId}`,
    'DELETE'
  )
}

// ==================== 已保存文档操作 ====================

/**
 * 获取已保存的文档
 */
export async function getSavedDocuments(userId?: string) {
  let url = '/api/saved-documents'
  if (userId) {
    url += `?user_id=${userId}`
  }
  return apiCall<any[]>(url)
}

/**
 * 保存文档
 */
export async function saveSavedDocument(data: any) {
  return apiCall(
    '/api/saved-documents',
    'POST',
    data
  )
}

/**
 * 删除已保存的文档
 */
export async function deleteSavedDocument(id: string) {
  return apiCall<void>(
    `/api/saved-documents/${id}`,
    'DELETE'
  )
}

// ==================== 管理员操作 ====================

/**
 * 获取管理员用户
 */
export async function getAdminUser(username: string) {
  return apiCall<any>(`/api/admin/user/${username}`)
}

/**
 * 获取所有管理员
 */
export async function getAllAdminUsers() {
  return apiCall<any[]>('/api/admin/users')
}

/**
 * 创建管理员用户
 */
export async function createAdminUser(data: any) {
  return apiCall<any>(
    '/api/admin/users',
    'POST',
    data
  )
}

/**
 * 更新管理员信息
 */
export async function updateAdminUser(id: string, data: any) {
  return apiCall<any>(
    `/api/admin/users/${id}`,
    'PUT',
    data
  )
}

/**
 * 更新管理员密码
 */
export async function updateAdminPassword(id: string, password: string) {
  return apiCall<any>(
    `/api/admin/users/${id}/password`,
    'PUT',
    { password }
  )
}

/**
 * 删除管理员
 */
export async function deleteAdminUser(id: string) {
  return apiCall<any>(
    `/api/admin/users/${id}`,
    'DELETE'
  )
}

/**
 * 管理员登录
 */
export async function adminLogin(username: string, password: string) {
  return apiCall<any>(
    '/api/admin/login',
    'POST',
    { username, password }
  )
}

// ==================== 数据统计 ====================

/**
 * 获取数据统计信息
 */
export async function getDataStats() {
  try {
    const result = await apiCall<any>('/api/stats')
    if (result.error) {
      console.error('获取统计数据失败:', result.error)
      return {
        student_profiles: 0,
        student_media: 0,
        student_documents: 0,
        saved_documents: 0
      }
    }
    return result.data || {
      student_profiles: 0,
      student_media: 0,
      student_documents: 0,
      saved_documents: 0
    }
  } catch (error: any) {
    console.error('获取统计数据异常:', error)
    return {
      student_profiles: 0,
      student_media: 0,
      student_documents: 0,
      saved_documents: 0
    }
  }
}

// ==================== 连接测试 ====================

/**
 * 测试后端连接
 */
export async function testConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    const data = await response.json()
    return {
      success: response.ok,
      status: data.status,
      message: data.database
    }
  } catch (error: any) {
    return {
      success: false,
      status: 'error',
      message: error.message
    }
  }
}

export default {
  getAllStudentProfiles,
  getStudentProfile,
  saveStudentProfile,
  deleteStudentProfile,
  getStudentMedia,
  createMediaRecord,
  deleteMediaFile,
  getStudentDocuments,
  createDocumentRecord,
  deleteDocument,
  getSavedDocuments,
  saveSavedDocument,
  deleteSavedDocument,
  getAdminUser,
  getAllAdminUsers,
  createAdminUser,
  updateAdminUser,
  updateAdminPassword,
  deleteAdminUser,
  adminLogin,
  getDataStats,
  testConnection
}
