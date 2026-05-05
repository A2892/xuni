/**
 * 对象操作工具函数
 */

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (obj instanceof Map) {
    const clonedMap = new Map()
    obj.forEach((value, key) => {
      clonedMap.set(deepClone(key), deepClone(value))
    })
    return clonedMap as unknown as T
  }

  if (obj instanceof Set) {
    const clonedSet = new Set()
    obj.forEach(value => {
      clonedSet.add(deepClone(value))
    })
    return clonedSet as unknown as T
  }

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  
  const source = sources.shift()
  if (!source) return target

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        target[key] = deepMerge(
          { ...targetValue } as any,
          sourceValue as any
        )
      } else if (sourceValue !== undefined) {
        target[key] = sourceValue as any
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断是否为普通对象
 */
export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * 判断对象是否为空
 */
export function isEmpty(obj: unknown): boolean {
  if (obj === null || obj === undefined) return true
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0
  if (isPlainObject(obj)) return Object.keys(obj).length === 0
  return false
}

/**
 * 获取嵌套对象的值
 */
export function get<T = any>(
  obj: Record<string, any>,
  path: string | string[],
  defaultValue?: T
): T {
  const keys = Array.isArray(path) ? path : path.split('.')
  let result: any = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue as T
    }
    result = result[key]
  }

  return result === undefined ? defaultValue as T : result
}

/**
 * 设置嵌套对象的值
 */
export function set<T extends Record<string, any>>(
  obj: T,
  path: string | string[],
  value: any
): T {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current: any = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || !isPlainObject(current[key])) {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
  return obj
}

/**
 * 删除嵌套对象的属性
 */
export function unset(obj: Record<string, any>, path: string | string[]): boolean {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current: any = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current)) {
      return false
    }
    current = current[key]
  }

  const lastKey = keys[keys.length - 1]
  if (lastKey in current) {
    delete current[lastKey]
    return true
  }
  return false
}

/**
 * 判断对象是否包含指定路径
 */
export function has(obj: Record<string, any>, path: string | string[]): boolean {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current: any = obj

  for (const key of keys) {
    if (!isPlainObject(current) || !(key in current)) {
      return false
    }
    current = current[key]
  }

  return true
}

/**
 * 选取对象的指定属性
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * 排除对象的指定属性
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>
  keys.forEach(key => {
    delete (result as any)[key]
  })
  return result
}

/**
 * 根据条件选取对象属性
 */
export function pickBy<T extends Record<string, any>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result: Partial<T> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (predicate(obj[key], key)) {
        result[key] = obj[key]
      }
    }
  }
  return result
}

/**
 * 根据条件排除对象属性
 */
export function omitBy<T extends Record<string, any>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  return pickBy(obj, (value, key) => !predicate(value, key))
}

/**
 * 映射对象的键
 */
export function mapKeys<T extends Record<string, any>>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => string
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[fn(key, obj[key])] = obj[key]
    }
  }
  return result
}

/**
 * 映射对象的值
 */
export function mapValues<T extends Record<string, any>, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = fn(obj[key], key)
    }
  }
  return result
}

/**
 * 对象转数组
 */
export function entries<T extends Record<string, any>>(
  obj: T
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

/**
 * 数组转对象
 */
export function fromEntries<K extends string | number | symbol, V>(
  entries: [K, V][]
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>
}

/**
 * 获取对象所有键（包括嵌套）
 */
export function getAllKeys(
  obj: Record<string, any>,
  prefix = ''
): string[] {
  const keys: string[] = []
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.push(fullKey)
      
      if (isPlainObject(obj[key])) {
        keys.push(...getAllKeys(obj[key], fullKey))
      }
    }
  }
  
  return keys
}

/**
 * 扁平化对象
 */
export function flatten(
  obj: Record<string, any>,
  prefix = ''
): Record<string, any> {
  const result: Record<string, any> = {}
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      
      if (isPlainObject(obj[key])) {
        Object.assign(result, flatten(obj[key], fullKey))
      } else {
        result[fullKey] = obj[key]
      }
    }
  }
  
  return result
}

/**
 * 展开扁平化对象
 */
export function unflatten(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      set(result, key, obj[key])
    }
  }
  
  return result
}

/**
 * 比较两个对象是否相等（深度比较）
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (typeof a !== typeof b) return false
  
  if (a === null || b === null) return a === b
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => isEqual(item, b[index]))
  }
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }
  
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    for (const [key, value] of a) {
      if (!b.has(key) || !isEqual(value, b.get(key))) return false
    }
    return true
  }
  
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false
    for (const value of a) {
      if (!b.has(value)) return false
    }
    return true
  }
  
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) return false
    
    return keysA.every(key => isEqual(a[key], b[key]))
  }
  
  return false
}

/**
 * 获取两个对象的差异
 */
export function diff(
  original: Record<string, any>,
  updated: Record<string, any>
): { added: Record<string, any>; removed: string[]; changed: Record<string, { old: any; new: any }> } {
  const added: Record<string, any> = {}
  const removed: string[] = []
  const changed: Record<string, { old: any; new: any }> = {}

  // 检查新增和修改
  for (const key in updated) {
    if (Object.prototype.hasOwnProperty.call(updated, key)) {
      if (!(key in original)) {
        added[key] = updated[key]
      } else if (!isEqual(original[key], updated[key])) {
        changed[key] = { old: original[key], new: updated[key] }
      }
    }
  }

  // 检查删除
  for (const key in original) {
    if (Object.prototype.hasOwnProperty.call(original, key)) {
      if (!(key in updated)) {
        removed.push(key)
      }
    }
  }

  return { added, removed, changed }
}

/**
 * 冻结对象（深度）
 */
export function deepFreeze<T extends Record<string, any>>(obj: T): Readonly<T> {
  Object.freeze(obj)
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (isPlainObject(value) || Array.isArray(value)) {
        deepFreeze(value)
      }
    }
  }
  
  return obj
}

/**
 * 创建响应式代理
 */
export function createReactive<T extends Record<string, any>>(
  target: T,
  onChange?: (key: keyof T, value: any, oldValue: any) => void
): T {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop as keyof T]
      const result = Reflect.set(obj, prop, value)
      if (onChange && oldValue !== value) {
        onChange(prop as keyof T, value, oldValue)
      }
      return result
    }
  })
}

/**
 * 将对象转换为查询字符串
 */
export function toQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams()
  
  function addParams(key: string, value: any) {
    if (value === null || value === undefined) return
    
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, String(v)))
    } else if (isPlainObject(value)) {
      for (const k in value) {
        if (Object.prototype.hasOwnProperty.call(value, k)) {
          addParams(`${key}[${k}]`, value[k])
        }
      }
    } else {
      params.append(key, String(value))
    }
  }
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      addParams(key, obj[key])
    }
  }
  
  return params.toString()
}

/**
 * 解析查询字符串为对象
 */
export function parseQueryString(query: string): Record<string, any> {
  const params = new URLSearchParams(query)
  const result: Record<string, any> = {}
  
  params.forEach((value, key) => {
    // 处理数组形式 key[]
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2)
      if (!result[arrayKey]) {
        result[arrayKey] = []
      }
      result[arrayKey].push(value)
    }
    // 处理嵌套形式 key[nested]
    else if (key.includes('[') && key.includes(']')) {
      const match = key.match(/^([^[]+)\[([^\]]+)\]$/)
      if (match) {
        const [, parentKey, childKey] = match
        if (!result[parentKey]) {
          result[parentKey] = {}
        }
        result[parentKey][childKey] = value
      }
    }
    // 处理普通键值
    else {
      result[key] = value
    }
  })
  
  return result
}

/**
 * 反转对象的键值
 */
export function invert<T extends Record<string, string | number>>(obj: T): Record<string, keyof T> {
  const result: Record<string, keyof T> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[String(obj[key])] = key
    }
  }
  return result
}

/**
 * 按键排序对象
 */
export function sortKeys<T extends Record<string, any>>(
  obj: T,
  compareFn?: (a: string, b: string) => number
): T {
  const sorted: any = {}
  const keys = Object.keys(obj).sort(compareFn)
  
  for (const key of keys) {
    sorted[key] = obj[key]
  }
  
  return sorted
}

/**
 * 获取对象的类型
 */
export function typeOf(value: any): string {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

/**
 * 检查对象是否包含循环引用
 */
export function hasCircularReference(obj: any, seen = new WeakSet()): boolean {
  if (obj === null || typeof obj !== 'object') {
    return false
  }
  
  if (seen.has(obj)) {
    return true
  }
  
  seen.add(obj)
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (hasCircularReference(obj[key], seen)) {
        return true
      }
    }
  }
  
  return false
}

export default {
  deepClone,
  deepMerge,
  isPlainObject,
  isEmpty,
  get,
  set,
  unset,
  has,
  pick,
  omit,
  pickBy,
  omitBy,
  mapKeys,
  mapValues,
  entries,
  fromEntries,
  getAllKeys,
  flatten,
  unflatten,
  isEqual,
  diff,
  deepFreeze,
  createReactive,
  toQueryString,
  parseQueryString,
  invert,
  sortKeys,
  typeOf,
  hasCircularReference
}
