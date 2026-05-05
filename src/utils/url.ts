/**
 * URL 处理工具函数
 */

/**
 * 解析 URL 查询参数
 */
export function parseQueryString(queryString: string): Record<string, string> {
  if (!queryString) return {}
  
  const query = queryString.startsWith('?') ? queryString.slice(1) : queryString
  const params: Record<string, string> = {}
  
  query.split('&').forEach(part => {
    const [key, value] = part.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  })
  
  return params
}

/**
 * 将对象序列化为查询字符串
 */
export function stringifyQuery(params: Record<string, any>): string {
  const parts: string[] = []
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    
    if (Array.isArray(value)) {
      value.forEach(v => {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
      })
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    }
  })
  
  return parts.join('&')
}

/**
 * 获取 URL 参数
 */
export function getQueryParam(url: string, key: string): string | null {
  const queryString = url.split('?')[1]
  if (!queryString) return null
  
  const params = parseQueryString(queryString)
  return params[key] ?? null
}

/**
 * 设置 URL 参数
 */
export function setQueryParam(url: string, key: string, value: string): string {
  const [base, queryString] = url.split('?')
  const params = parseQueryString(queryString || '')
  params[key] = value
  
  const newQuery = stringifyQuery(params)
  return newQuery ? `${base}?${newQuery}` : base
}

/**
 * 删除 URL 参数
 */
export function removeQueryParam(url: string, key: string): string {
  const [base, queryString] = url.split('?')
  if (!queryString) return url
  
  const params = parseQueryString(queryString)
  delete params[key]
  
  const newQuery = stringifyQuery(params)
  return newQuery ? `${base}?${newQuery}` : base
}

/**
 * 合并 URL 参数
 */
export function mergeQueryParams(
  url: string, 
  newParams: Record<string, any>
): string {
  const [base, queryString] = url.split('?')
  const params = { ...parseQueryString(queryString || ''), ...newParams }
  
  // 移除值为 null 或 undefined 的参数
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === undefined) {
      delete params[key]
    }
  })
  
  const newQuery = stringifyQuery(params)
  return newQuery ? `${base}?${newQuery}` : base
}

/**
 * 解析 URL
 */
export function parseUrl(url: string): {
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  params: Record<string, string>
} {
  try {
    const urlObj = new URL(url)
    return {
      protocol: urlObj.protocol,
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      params: parseQueryString(urlObj.search)
    }
  } catch {
    // 处理相对 URL
    const [pathAndQuery, hash = ''] = url.split('#')
    const [pathname, search = ''] = pathAndQuery.split('?')
    
    return {
      protocol: '',
      host: '',
      hostname: '',
      port: '',
      pathname,
      search: search ? `?${search}` : '',
      hash: hash ? `#${hash}` : '',
      params: parseQueryString(search)
    }
  }
}

/**
 * 构建 URL
 */
export function buildUrl(
  base: string,
  path?: string,
  params?: Record<string, any>
): string {
  let url = base
  
  // 添加路径
  if (path) {
    url = url.endsWith('/') ? url.slice(0, -1) : url
    path = path.startsWith('/') ? path : `/${path}`
    url += path
  }
  
  // 添加参数
  if (params && Object.keys(params).length > 0) {
    const query = stringifyQuery(params)
    url += url.includes('?') ? `&${query}` : `?${query}`
  }
  
  return url
}

/**
 * 判断是否为绝对 URL
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url)
}

/**
 * 判断是否为相对 URL
 */
export function isRelativeUrl(url: string): boolean {
  return !isAbsoluteUrl(url)
}

/**
 * 判断是否为同源 URL
 */
export function isSameOrigin(url1: string, url2: string): boolean {
  try {
    const a = new URL(url1)
    const b = new URL(url2)
    return a.origin === b.origin
  } catch {
    return false
  }
}

/**
 * 获取 URL 的域名
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

/**
 * 获取 URL 的路径
 */
export function getPathname(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url.split('?')[0].split('#')[0]
  }
}

/**
 * 获取文件扩展名
 */
export function getExtension(url: string): string {
  const pathname = getPathname(url)
  const match = pathname.match(/\.([^./?#]+)(?:[?#]|$)/)
  return match ? match[1].toLowerCase() : ''
}

/**
 * 获取文件名
 */
export function getFilename(url: string): string {
  const pathname = getPathname(url)
  const parts = pathname.split('/')
  return parts[parts.length - 1] || ''
}

/**
 * URL 安全的 Base64 编码
 */
export function urlSafeBase64Encode(str: string): string {
  const base64 = btoa(unescape(encodeURIComponent(str)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * URL 安全的 Base64 解码
 */
export function urlSafeBase64Decode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) {
    base64 += '='.repeat(4 - pad)
  }
  return decodeURIComponent(escape(atob(base64)))
}

/**
 * 添加协议
 */
export function ensureProtocol(url: string, defaultProtocol: string = 'https'): string {
  if (!url) return url
  
  if (url.startsWith('//')) {
    return `${defaultProtocol}:${url}`
  }
  
  if (!isAbsoluteUrl(url)) {
    return `${defaultProtocol}://${url}`
  }
  
  return url
}

/**
 * 规范化 URL
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // 移除默认端口
    if (
      (urlObj.protocol === 'http:' && urlObj.port === '80') ||
      (urlObj.protocol === 'https:' && urlObj.port === '443')
    ) {
      urlObj.port = ''
    }
    
    // 规范化路径
    urlObj.pathname = urlObj.pathname.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
    
    // 排序查询参数
    urlObj.searchParams.sort()
    
    // 移除 hash
    urlObj.hash = ''
    
    return urlObj.toString()
  } catch {
    return url
  }
}

/**
 * 加入路径
 */
export function joinPath(...paths: string[]): string {
  return paths
    .filter(Boolean)
    .map((path, index) => {
      if (index === 0) {
        return path.replace(/\/+$/, '')
      }
      return path.replace(/^\/+|\/+$/g, '')
    })
    .join('/')
}

/**
 * 解析 Hash
 */
export function parseHash(hash: string): { path: string; params: Record<string, string> } {
  if (!hash || hash === '#') {
    return { path: '', params: {} }
  }
  
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash
  const [path, query] = cleanHash.split('?')
  
  return {
    path: path || '',
    params: parseQueryString(query || '')
  }
}

/**
 * 判断 URL 是否为图片
 */
export function isImageUrl(url: string): boolean {
  const ext = getExtension(url)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'].includes(ext)
}

/**
 * 判断 URL 是否为视频
 */
export function isVideoUrl(url: string): boolean {
  const ext = getExtension(url)
  return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'm4v'].includes(ext)
}

/**
 * 判断 URL 是否为音频
 */
export function isAudioUrl(url: string): boolean {
  const ext = getExtension(url)
  return ['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma', 'm4a'].includes(ext)
}

/**
 * 判断 URL 是否为文档
 */
export function isDocumentUrl(url: string): boolean {
  const ext = getExtension(url)
  return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'].includes(ext)
}
