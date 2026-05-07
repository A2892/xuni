/**
 * HTTP 请求封装
 * 基于 fetch 的现代化请求库
 */

import { toast } from './toast'

// 请求配置
interface RequestConfig extends RequestInit {
  baseURL?: string
  timeout?: number
  params?: Record<string, any>
  data?: any
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer'
  showError?: boolean
  showLoading?: boolean
  retries?: number
  retryDelay?: number
}

// 响应结构
interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
}

// 请求拦截器
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>

// 响应拦截器
type ResponseInterceptor = (response: Response, data: any) => any | Promise<any>

// 错误拦截器
type ErrorInterceptor = (error: HttpError) => any | Promise<any>

// HTTP 错误
export class HttpError extends Error {
  status: number
  statusText: string
  url: string
  data: any

  constructor(response: Response, data?: any) {
    super(response.statusText || `HTTP Error: ${response.status}`)
    this.name = 'HttpError'
    this.status = response.status
    this.statusText = response.statusText
    this.url = response.url
    this.data = data
  }
}

// HTTP 客户端
class HttpClient {
  private baseURL: string
  private defaultConfig: RequestConfig
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  constructor(config: RequestConfig = {}) {
    this.baseURL = config.baseURL || ''
    this.defaultConfig = {
      timeout: 30000,
      responseType: 'json',
      showError: true,
      retries: 0,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    }
  }

  // 添加请求拦截器
  useRequest(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  // 添加响应拦截器
  useResponse(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  // 添加错误拦截器
  useError(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  // 构建 URL
  private buildURL(url: string, params?: Record<string, any>): string {
    let fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        fullURL += (fullURL.includes('?') ? '&' : '?') + queryString
      }
    }

    return fullURL
  }

  // 执行请求
  private async executeRequest(url: string, config: RequestConfig): Promise<Response> {
    const controller = new AbortController()
    const timeout = config.timeout || this.defaultConfig.timeout!

    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // 重试逻辑
  private async retryRequest(
    url: string,
    config: RequestConfig,
    retries: number,
    delay: number
  ): Promise<Response> {
    try {
      return await this.executeRequest(url, config)
    } catch (error) {
      if (retries > 0 && (error as Error).name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.retryRequest(url, config, retries - 1, delay * 2)
      }
      throw error
    }
  }

  // 核心请求方法
  async request<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    // 合并配置
    let mergedConfig: RequestConfig = {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...this.defaultConfig.headers,
        ...config.headers
      }
    }

    // 执行请求拦截器
    for (const interceptor of this.requestInterceptors) {
      mergedConfig = await interceptor(mergedConfig)
    }

    // 处理请求体
    if (mergedConfig.data) {
      if (mergedConfig.data instanceof FormData) {
        delete (mergedConfig.headers as Record<string, string>)['Content-Type']
        mergedConfig.body = mergedConfig.data
      } else if (typeof mergedConfig.data === 'object') {
        mergedConfig.body = JSON.stringify(mergedConfig.data)
      } else {
        mergedConfig.body = mergedConfig.data
      }
    }

    // 构建完整 URL
    const fullURL = this.buildURL(url, mergedConfig.params)

    try {
      // 执行请求（带重试）
      const response = await this.retryRequest(
        fullURL,
        mergedConfig,
        mergedConfig.retries || 0,
        mergedConfig.retryDelay || 1000
      )

      // 解析响应
      let data: any
      const responseType = mergedConfig.responseType || 'json'

      switch (responseType) {
        case 'json':
          data = await response.json().catch(() => null)
          break
        case 'text':
          data = await response.text()
          break
        case 'blob':
          data = await response.blob()
          break
        case 'arrayBuffer':
          data = await response.arrayBuffer()
          break
        default:
          data = await response.json().catch(() => null)
      }

      // 检查响应状态
      if (!response.ok) {
        throw new HttpError(response, data)
      }

      // 执行响应拦截器
      for (const interceptor of this.responseInterceptors) {
        data = await interceptor(response, data)
      }

      return data as T
    } catch (error) {
      // 处理错误
      let httpError: HttpError

      if (error instanceof HttpError) {
        httpError = error
      } else if ((error as Error).name === 'AbortError') {
        httpError = new HttpError(
          { status: 408, statusText: '请求超时', url: fullURL } as Response
        )
      } else {
        httpError = new HttpError(
          { status: 0, statusText: (error as Error).message, url: fullURL } as Response
        )
      }

      // 执行错误拦截器
      for (const interceptor of this.errorInterceptors) {
        try {
          const result = await interceptor(httpError)
          if (result !== undefined) return result
        } catch {
          // 忽略拦截器错误
        }
      }

      // 显示错误提示
      if (mergedConfig.showError) {
        const message = this.getErrorMessage(httpError)
        toast.error(message)
      }

      throw httpError
    }
  }

  // 获取错误消息
  private getErrorMessage(error: HttpError): string {
    const messages: Record<number, string> = {
      0: '网络连接失败，请检查网络',
      400: '请求参数错误',
      401: '登录已过期，请重新登录',
      403: '没有操作权限',
      404: '请求的资源不存在',
      408: '请求超时，请稍后重试',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
      504: '网关超时'
    }

    return error.data?.message || messages[error.status] || `请求失败 (${error.status})`
  }

  // 快捷方法
  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'POST', data })
  }

  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PUT', data })
  }

  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PATCH', data })
  }

  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }

  // 上传文件
  upload<T = any>(url: string, file: File | FormData, config?: RequestConfig): Promise<T> {
    const formData = file instanceof FormData ? file : new FormData()
    if (file instanceof File) {
      formData.append('file', file)
    }
    return this.post<T>(url, formData, config)
  }

  // 下载文件
  async download(url: string, filename?: string, config?: RequestConfig): Promise<void> {
    const blob = await this.request<Blob>(url, {
      ...config,
      method: 'GET',
      responseType: 'blob'
    })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename || 'download'
    link.click()
    URL.revokeObjectURL(link.href)
  }
}

// 创建默认实例
export const http = new HttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000
})

// 添加默认拦截器
http.useRequest(async (config) => {
  // 添加 token
  const token = localStorage.getItem('vsid_token')
  if (token) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  return config
})

http.useResponse(async (response, data) => {
  // 处理统一响应格式
  if (data && typeof data === 'object' && 'code' in data) {
    if (data.code !== 0 && data.code !== 200) {
      throw new HttpError(
        { status: data.code, statusText: data.message, url: response.url } as Response,
        data
      )
    }
    return data.data
  }
  return data
})

http.useError(async (error) => {
  // 处理 401 错误
  if (error.status === 401) {
    localStorage.removeItem('vsid_token')
    window.location.href = '/login'
  }
  return undefined
})

export { HttpClient, HttpError }
export type { RequestConfig, ApiResponse }
export default http
