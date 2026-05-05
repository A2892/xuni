/**
 * HTTP 请求工具函数
 */

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestOptions {
  method?: RequestMethod
  headers?: Record<string, string>
  body?: any
  timeout?: number
  params?: Record<string, any>
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer'
  withCredentials?: boolean
  onUploadProgress?: (progress: number) => void
  onDownloadProgress?: (progress: number) => void
  signal?: AbortSignal
}

interface RequestConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  interceptors?: {
    request?: (config: RequestOptions & { url: string }) => RequestOptions & { url: string }
    response?: (response: any) => any
    error?: (error: Error) => any
  }
}

// 默认配置
let defaultConfig: RequestConfig = {
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
}

/**
 * 设置默认配置
 */
export function setDefaultConfig(config: Partial<RequestConfig>): void {
  defaultConfig = { ...defaultConfig, ...config }
}

/**
 * 构建 URL 参数
 */
function buildQueryString(params: Record<string, any>): string {
  const parts: string[] = []
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    
    if (Array.isArray(value)) {
      value.forEach(v => {
        parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`)
      })
    } else if (typeof value === 'object') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`)
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  })
  
  return parts.join('&')
}

/**
 * 发送请求
 */
async function request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  let fullUrl = url.startsWith('http') ? url : `${defaultConfig.baseURL}${url}`
  
  // 处理 URL 参数
  if (options.params) {
    const queryString = buildQueryString(options.params)
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
  }
  
  // 合并配置
  const config = {
    url: fullUrl,
    method: options.method || 'GET',
    headers: { ...defaultConfig.headers, ...options.headers },
    body: options.body,
    timeout: options.timeout ?? defaultConfig.timeout,
    responseType: options.responseType || 'json',
    credentials: options.withCredentials ? 'include' : 'same-origin'
  }
  
  // 请求拦截器
  const interceptedConfig = defaultConfig.interceptors?.request?.(config) || config
  
  // 处理请求体
  let body: BodyInit | undefined
  if (interceptedConfig.body !== undefined) {
    if (interceptedConfig.body instanceof FormData ||
        interceptedConfig.body instanceof Blob ||
        interceptedConfig.body instanceof URLSearchParams) {
      body = interceptedConfig.body
      // FormData 不需要设置 Content-Type
      if (interceptedConfig.body instanceof FormData) {
        delete interceptedConfig.headers['Content-Type']
      }
    } else if (typeof interceptedConfig.body === 'object') {
      body = JSON.stringify(interceptedConfig.body)
    } else {
      body = String(interceptedConfig.body)
    }
  }
  
  // 超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), interceptedConfig.timeout)
  
  try {
    const response = await fetch(interceptedConfig.url, {
      method: interceptedConfig.method,
      headers: interceptedConfig.headers,
      body: interceptedConfig.method !== 'GET' ? body : undefined,
      credentials: interceptedConfig.credentials as RequestCredentials,
      signal: options.signal || controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const error = new Error(`HTTP Error: ${response.status} ${response.statusText}`)
      ;(error as any).status = response.status
      ;(error as any).response = response
      throw error
    }
    
    // 解析响应
    let data: any
    switch (interceptedConfig.responseType) {
      case 'blob':
        data = await response.blob()
        break
      case 'arrayBuffer':
        data = await response.arrayBuffer()
        break
      case 'text':
        data = await response.text()
        break
      default:
        data = await response.json()
    }
    
    // 响应拦截器
    return defaultConfig.interceptors?.response?.(data) ?? data
    
  } catch (error) {
    clearTimeout(timeoutId)
    
    // 错误拦截器
    if (defaultConfig.interceptors?.error) {
      return defaultConfig.interceptors.error(error as Error)
    }
    throw error
  }
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
  return request<T>(url, { ...options, method: 'GET', params })
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
  return request<T>(url, { ...options, method: 'POST', body: data })
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
  return request<T>(url, { ...options, method: 'PUT', body: data })
}

/**
 * PATCH 请求
 */
export function patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
  return request<T>(url, { ...options, method: 'PATCH', body: data })
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
  return request<T>(url, { ...options, method: 'DELETE', params })
}

/**
 * 上传文件
 */
export async function upload<T = any>(
  url: string,
  file: File | File[],
  options?: {
    fieldName?: string
    data?: Record<string, any>
    onProgress?: (progress: number) => void
  } & RequestOptions
): Promise<T> {
  const formData = new FormData()
  const fieldName = options?.fieldName || 'file'
  
  if (Array.isArray(file)) {
    file.forEach((f, index) => {
      formData.append(`${fieldName}[${index}]`, f)
    })
  } else {
    formData.append(fieldName, file)
  }
  
  // 添加额外数据
  if (options?.data) {
    Object.entries(options.data).forEach(([key, value]) => {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
    })
  }
  
  return post<T>(url, formData, options)
}

/**
 * 下载文件
 */
export async function download(url: string, filename?: string, options?: RequestOptions): Promise<void> {
  const blob = await request<Blob>(url, {
    ...options,
    method: 'GET',
    responseType: 'blob'
  })
  
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

/**
 * 并发请求
 */
export function all<T extends readonly unknown[] | []>(
  requests: T
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  return Promise.all(requests) as any
}

/**
 * 竞速请求
 */
export function race<T>(requests: Promise<T>[]): Promise<T> {
  return Promise.race(requests)
}

/**
 * 重试请求
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: {
    retries?: number
    delay?: number
    backoff?: number
    shouldRetry?: (error: Error, attempt: number) => boolean
  }
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = () => true
  } = options || {}
  
  let lastError: Error
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i === retries - 1 || !shouldRetry(lastError, i)) {
        throw lastError
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, i)))
    }
  }
  
  throw lastError!
}

/**
 * 创建请求实例
 */
export function createInstance(config: RequestConfig) {
  const instanceConfig = { ...defaultConfig, ...config }
  
  return {
    get: <T = any>(url: string, params?: Record<string, any>, options?: RequestOptions) =>
      request<T>(url, { ...options, method: 'GET', params }),
    post: <T = any>(url: string, data?: any, options?: RequestOptions) =>
      request<T>(url, { ...options, method: 'POST', body: data }),
    put: <T = any>(url: string, data?: any, options?: RequestOptions) =>
      request<T>(url, { ...options, method: 'PUT', body: data }),
    patch: <T = any>(url: string, data?: any, options?: RequestOptions) =>
      request<T>(url, { ...options, method: 'PATCH', body: data }),
    delete: <T = any>(url: string, params?: Record<string, any>, options?: RequestOptions) =>
      request<T>(url, { ...options, method: 'DELETE', params }),
    upload,
    download,
    setConfig: (newConfig: Partial<RequestConfig>) => {
      Object.assign(instanceConfig, newConfig)
    }
  }
}

export default {
  request,
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  download,
  all,
  race,
  retry,
  createInstance,
  setDefaultConfig
}
