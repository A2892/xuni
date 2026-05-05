/**
 * 本地存储封装 - 支持过期时间和序列化
 */

interface StorageItem<T> {
  value: T
  expire?: number
  timestamp: number
}

class Storage {
  private prefix: string
  private storage: globalThis.Storage

  constructor(type: 'local' | 'session' = 'local', prefix: string = 'vsid_') {
    this.storage = type === 'local' ? localStorage : sessionStorage
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param value 值
   * @param expire 过期时间（秒），不设置则永不过期
   */
  set<T>(key: string, value: T, expire?: number): void {
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now()
    }

    if (expire) {
      item.expire = expire * 1000
    }

    try {
      this.storage.setItem(this.getKey(key), JSON.stringify(item))
    } catch (error) {
      console.error('Storage set error:', error)
      // 存储满时尝试清理过期项
      this.clearExpired()
      try {
        this.storage.setItem(this.getKey(key), JSON.stringify(item))
      } catch {
        console.error('Storage is full')
      }
    }
  }

  /**
   * 获取存储项
   * @param key 键名
   * @param defaultValue 默认值
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    const raw = this.storage.getItem(this.getKey(key))
    
    if (!raw) return defaultValue

    try {
      const item: StorageItem<T> = JSON.parse(raw)
      
      // 检查是否过期
      if (item.expire && Date.now() - item.timestamp > item.expire) {
        this.remove(key)
        return defaultValue
      }

      return item.value
    } catch {
      return defaultValue
    }
  }

  /**
   * 删除存储项
   */
  remove(key: string): void {
    this.storage.removeItem(this.getKey(key))
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  /**
   * 清空所有带前缀的存储
   */
  clear(): void {
    const keys: string[] = []
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        keys.push(key)
      }
    }
    keys.forEach(key => this.storage.removeItem(key))
  }

  /**
   * 清理过期项
   */
  clearExpired(): void {
    for (let i = this.storage.length - 1; i >= 0; i--) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        const raw = this.storage.getItem(key)
        if (raw) {
          try {
            const item: StorageItem<any> = JSON.parse(raw)
            if (item.expire && Date.now() - item.timestamp > item.expire) {
              this.storage.removeItem(key)
            }
          } catch {
            // 无效数据，删除
            this.storage.removeItem(key)
          }
        }
      }
    }
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''))
      }
    }
    return keys
  }

  /**
   * 获取存储使用情况
   */
  getUsage(): { used: number; total: number; percentage: number } {
    let used = 0
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key) {
        used += (this.storage.getItem(key)?.length || 0) * 2 // UTF-16
      }
    }

    // 估算总容量（通常为 5MB）
    const total = 5 * 1024 * 1024

    return {
      used,
      total,
      percentage: (used / total) * 100
    }
  }
}

// 导出实例
export const localStorage = new Storage('local')
export const sessionStorage = new Storage('session')

// 特定用途的存储
export const userStorage = new Storage('local', 'vsid_user_')
export const cacheStorage = new Storage('local', 'vsid_cache_')
export const tempStorage = new Storage('session', 'vsid_temp_')

/**
 * 带压缩的存储（适用于大数据）
 */
export class CompressedStorage {
  private storage: Storage

  constructor(storage: Storage = localStorage) {
    this.storage = storage
  }

  async set<T>(key: string, value: T, expire?: number): Promise<void> {
    const json = JSON.stringify(value)
    
    // 只有大于 1KB 的数据才压缩
    if (json.length > 1024 && typeof CompressionStream !== 'undefined') {
      const compressed = await this.compress(json)
      this.storage.set(key, { compressed: true, data: compressed }, expire)
    } else {
      this.storage.set(key, { compressed: false, data: value }, expire)
    }
  }

  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const item = this.storage.get<{ compressed: boolean; data: any }>(key)
    
    if (!item) return defaultValue

    if (item.compressed && typeof DecompressionStream !== 'undefined') {
      const json = await this.decompress(item.data)
      return JSON.parse(json) as T
    }

    return item.data as T
  }

  private async compress(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const stream = new CompressionStream('gzip')
    const writer = stream.writable.getWriter()
    
    writer.write(encoder.encode(data))
    writer.close()

    const reader = stream.readable.getReader()
    const chunks: Uint8Array[] = []
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
    let offset = 0
    chunks.forEach(chunk => {
      compressed.set(chunk, offset)
      offset += chunk.length
    })

    return btoa(String.fromCharCode(...compressed))
  }

  private async decompress(data: string): Promise<string> {
    const binary = atob(data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    const stream = new DecompressionStream('gzip')
    const writer = stream.writable.getWriter()
    
    writer.write(bytes)
    writer.close()

    const reader = stream.readable.getReader()
    const chunks: Uint8Array[] = []
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const decoder = new TextDecoder()
    return chunks.map(chunk => decoder.decode(chunk)).join('')
  }
}

export const compressedStorage = new CompressedStorage()

export default localStorage
