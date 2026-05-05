/**
 * Supabase 兼容代理层
 * 将所有 Supabase API 调用转发到 CockroachDB 后端 API
 * 所有现有代码无需修改，supabase.from(...).select(...).eq(...) 等链式调用全部兼容
 */

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : ''

// ==================== 当前用户管理 ====================

let _currentUser: { id: string; email?: string; [key: string]: any } | null = null

/**
 * 设置当前登录用户（由 auth store 在登录时调用）
 */
export function setCurrentUser(user: { id: string; username?: string; [key: string]: any } | null) {
  if (user) {
    _currentUser = {
      id: user.id,
      email: user.username ? `${user.username}@local` : undefined,
      ...user
    }
  } else {
    _currentUser = null
  }
}

// ==================== 查询构建器 ====================

interface FilterSpec {
  type: string
  column: string
  operator: string
  value: any
}

interface OrderSpec {
  column: string
  ascending: boolean
}

class QueryBuilder {
  private _table: string
  private _operation: 'select' | 'insert' | 'update' | 'delete'
  private _selectColumns: string
  private _filters: FilterSpec[]
  private _orderSpecs: OrderSpec[]
  private _limitCount: number | null
  private _isSingle: boolean
  private _maybeSingle: boolean
  private _payload: any
  private _returnData: boolean

  constructor(table: string) {
    this._table = table
    this._operation = 'select'
    this._selectColumns = '*'
    this._filters = []
    this._orderSpecs = []
    this._limitCount = null
    this._isSingle = false
    this._maybeSingle = false
    this._payload = null
    this._returnData = false
  }

  select(columns: string = '*'): QueryBuilder {
    if (this._operation === 'insert' || this._operation === 'update' || this._operation === 'delete') {
      this._returnData = true
      this._selectColumns = columns
    } else {
      this._operation = 'select'
      this._selectColumns = columns
    }
    return this
  }

  insert(data: any): QueryBuilder {
    this._operation = 'insert'
    this._payload = data
    return this
  }

  update(data: any): QueryBuilder {
    this._operation = 'update'
    this._payload = data
    return this
  }

  delete(): QueryBuilder {
    this._operation = 'delete'
    return this
  }

  eq(column: string, value: any): QueryBuilder {
    this._filters.push({ type: 'eq', column, operator: '=', value })
    return this
  }

  neq(column: string, value: any): QueryBuilder {
    this._filters.push({ type: 'neq', column, operator: '!=', value })
    return this
  }

  is(column: string, value: any): QueryBuilder {
    this._filters.push({ type: 'is', column, operator: 'is', value })
    return this
  }

  not(column: string, operator: string, value: any): QueryBuilder {
    this._filters.push({ type: 'not', column, operator, value })
    return this
  }

  in(column: string, values: any[]): QueryBuilder {
    this._filters.push({ type: 'in', column, operator: 'in', value: values })
    return this
  }

  lt(column: string, value: any): QueryBuilder {
    this._filters.push({ type: 'lt', column, operator: '<', value })
    return this
  }

  lte(column: string, value: any): QueryBuilder {
    this._filters.push({ type: 'lte', column, operator: '<=', value })
    return this
  }

  gt(column: string, value: any): QueryBuilder {
    this._filters.push({ type: 'gt', column, operator: '>', value })
    return this
  }

  gte(column: string, value: any): QueryBuilder {
    this._filters.push({ type: 'gte', column, operator: '>=', value })
    return this
  }

  like(column: string, value: string): QueryBuilder {
    this._filters.push({ type: 'like', column, operator: 'like', value })
    return this
  }

  ilike(column: string, value: string): QueryBuilder {
    this._filters.push({ type: 'ilike', column, operator: 'ilike', value })
    return this
  }

  or(expression: string): QueryBuilder {
    this._filters.push({ type: 'or', column: '', operator: 'or', value: expression })
    return this
  }

  order(column: string, options: { ascending?: boolean } = {}): QueryBuilder {
    this._orderSpecs.push({ column, ascending: options.ascending ?? true })
    return this
  }

  limit(count: number): QueryBuilder {
    this._limitCount = count
    return this
  }

  single(): QueryBuilder {
    this._isSingle = true
    return this
  }

  /**
   * 类似 single() 但 0 行时返回 null 而不是错误
   * 兼容 Supabase 的 maybeSingle() 行为
   */
  maybeSingle(): QueryBuilder {
    this._isSingle = true
    this._maybeSingle = true
    return this
  }

  // 使对象可 await
  then(
    resolve: (value: { data: any; error: any }) => any,
    reject?: (reason: any) => any
  ): Promise<any> {
    return this._execute().then(resolve, reject)
  }

  private async _execute(): Promise<{ data: any; error: any }> {
    try {
      const response = await fetch(`${API_BASE}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: this._table,
          operation: this._operation,
          select: this._selectColumns,
          data: this._payload,
          filters: this._filters,
          options: {
            order: this._orderSpecs.length > 0 ? this._orderSpecs : undefined,
            limit: this._limitCount
          },
          returnData: this._returnData || this._isSingle
        })
      })

      const result = await response.json()

      if (!result.success) {
        // 保留 error code（如 23505 = unique_violation）以兼容 Supabase 错误检查
        const errorMsg = result.error || '查询失败'
        const errorCode = result.code || (typeof errorMsg === 'string' && errorMsg.match(/\b(\d{5})\b/)?.[1]) || undefined
        return { data: null, error: { message: errorMsg, code: errorCode } }
      }

      if (this._isSingle) {
        const singleData = Array.isArray(result.data) ? result.data[0] || null : result.data
        if ((singleData === null || singleData === undefined) && !this._maybeSingle) {
          // 兼容 Supabase .single() 行为：0 行时返回错误（maybeSingle 则返回 null）
          return { data: null, error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116', details: 'Results contain 0 rows' } }
        }
        return { data: singleData ?? null, error: null }
      }

      return { data: result.data, error: null }
    } catch (error: any) {
      console.error('API 查询失败:', error)
      return { data: null, error: { message: error.message || '网络请求失败' } }
    }
  }
}

// ==================== Storage 代理 ====================

class StorageBucket {
  private _bucket: string

  constructor(bucket: string) {
    this._bucket = bucket
  }

  async upload(
    path: string,
    file: Blob | File | ArrayBuffer,
    options?: { contentType?: string; upsert?: boolean }
  ): Promise<{ data: any; error: any }> {
    try {
      const response = await fetch(`${API_BASE}/api/storage/${this._bucket}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': options?.contentType || 'application/octet-stream',
          'x-file-path': path
        },
        body: file
      })
      const result = await response.json()
      if (!result.success) {
        return { data: null, error: { message: result.error } }
      }
      return { data: result.data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  getPublicUrl(path: string): { data: { publicUrl: string } } {
    const publicUrl = `${API_BASE}/api/storage/${this._bucket}/file?path=${encodeURIComponent(path)}`
    return { data: { publicUrl } }
  }

  async remove(paths: string[]): Promise<{ data: any; error: any }> {
    try {
      const response = await fetch(`${API_BASE}/api/storage/${this._bucket}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths })
      })
      const result = await response.json()
      if (!result.success) {
        return { data: null, error: { message: result.error } }
      }
      return { data: result.data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }
}

class StorageProxy {
  from(bucket: string): StorageBucket {
    return new StorageBucket(bucket)
  }
}

// ==================== Auth 代理 ====================

class AuthProxy {
  async getUser(): Promise<{ data: { user: any }; error: any }> {
    return {
      data: { user: _currentUser },
      error: _currentUser ? null : { message: '未登录' }
    }
  }

  // 兼容其他可能的 auth 方法调用
  async getSession(): Promise<{ data: { session: any }; error: any }> {
    return {
      data: { session: _currentUser ? { user: _currentUser } : null },
      error: null
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // 无操作 - CockroachDB 不支持实时 auth 事件
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
}

// ==================== Supabase 兼容客户端 ====================

class SupabaseProxy {
  storage = new StorageProxy()
  auth = new AuthProxy()

  from(table: string): QueryBuilder {
    return new QueryBuilder(table)
  }

  async rpc(functionName: string, params: any = {}): Promise<{ data: any; error: any }> {
    try {
      const response = await fetch(`${API_BASE}/api/rpc/${functionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      const result = await response.json()
      if (!result.success) {
        return { data: null, error: { message: result.error } }
      }
      return { data: result.data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }
}

// 导出单例 - 所有现有代码 import { supabase } from '@/lib/supabase' 自动使用此代理
export const supabase = new SupabaseProxy()
