/**
 * 深拷贝工具
 */

// 判断类型
function getType(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1)
}

// 判断是否是对象
function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object'
}

// 判断是否是数组
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

// 判断是否是 Date
function isDate(value: unknown): value is Date {
  return getType(value) === 'Date'
}

// 判断是否是 RegExp
function isRegExp(value: unknown): value is RegExp {
  return getType(value) === 'RegExp'
}

// 判断是否是 Map
function isMap(value: unknown): value is Map<unknown, unknown> {
  return getType(value) === 'Map'
}

// 判断是否是 Set
function isSet(value: unknown): value is Set<unknown> {
  return getType(value) === 'Set'
}

// 判断是否是 Symbol
function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol'
}

// 判断是否是函数
function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

/**
 * 深拷贝
 * 支持循环引用、Date、RegExp、Map、Set、Symbol
 */
export function deepClone<T>(source: T, cache = new WeakMap()): T {
  // 基本类型直接返回
  if (!isObject(source)) {
    return source
  }
  
  // 处理循环引用
  if (cache.has(source as object)) {
    return cache.get(source as object)
  }
  
  // 处理日期
  if (isDate(source)) {
    return new Date(source.getTime()) as unknown as T
  }
  
  // 处理正则
  if (isRegExp(source)) {
    return new RegExp(source.source, source.flags) as unknown as T
  }
  
  // 处理 Map
  if (isMap(source)) {
    const map = new Map()
    cache.set(source, map)
    source.forEach((value, key) => {
      map.set(deepClone(key, cache), deepClone(value, cache))
    })
    return map as unknown as T
  }
  
  // 处理 Set
  if (isSet(source)) {
    const set = new Set()
    cache.set(source, set)
    source.forEach(value => {
      set.add(deepClone(value, cache))
    })
    return set as unknown as T
  }
  
  // 处理数组和对象
  const target = isArray(source) ? [] : {} as T
  cache.set(source as object, target)
  
  // 复制 Symbol 键
  const symbolKeys = Object.getOwnPropertySymbols(source)
  symbolKeys.forEach(symKey => {
    (target as any)[symKey] = deepClone((source as any)[symKey], cache)
  })
  
  // 复制普通键
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      (target as any)[key] = deepClone((source as any)[key], cache)
    }
  }
  
  return target
}

/**
 * 浅拷贝
 */
export function shallowClone<T>(source: T): T {
  if (!isObject(source)) {
    return source
  }
  
  if (isArray(source)) {
    return [...source] as unknown as T
  }
  
  if (isDate(source)) {
    return new Date(source.getTime()) as unknown as T
  }
  
  if (isMap(source)) {
    return new Map(source) as unknown as T
  }
  
  if (isSet(source)) {
    return new Set(source) as unknown as T
  }
  
  return { ...source }
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends object>(...sources: Partial<T>[]): T {
  const target = {} as T
  
  for (const source of sources) {
    if (!isObject(source)) continue
    
    for (const key of Object.keys(source) as (keyof T)[]) {
      const sourceValue = source[key]
      const targetValue = target[key]
      
      if (isObject(sourceValue) && isObject(targetValue)) {
        target[key] = deepMerge(
          targetValue as object,
          sourceValue as object
        ) as T[keyof T]
      } else if (isObject(sourceValue)) {
        target[key] = deepClone(sourceValue) as T[keyof T]
      } else {
        target[key] = sourceValue as T[keyof T]
      }
    }
  }
  
  return target
}

/**
 * 对象比较
 * 深度比较两个值是否相等
 */
export function isEqual(a: unknown, b: unknown): boolean {
  // 严格相等
  if (a === b) return true
  
  // null 或 undefined
  if (a == null || b == null) return a === b
  
  // 类型不同
  const typeA = getType(a)
  const typeB = getType(b)
  if (typeA !== typeB) return false
  
  // 日期比较
  if (isDate(a) && isDate(b)) {
    return a.getTime() === b.getTime()
  }
  
  // 正则比较
  if (isRegExp(a) && isRegExp(b)) {
    return a.source === b.source && a.flags === b.flags
  }
  
  // 数组比较
  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => isEqual(item, b[index]))
  }
  
  // Map 比较
  if (isMap(a) && isMap(b)) {
    if (a.size !== b.size) return false
    for (const [key, value] of a) {
      if (!b.has(key) || !isEqual(value, b.get(key))) {
        return false
      }
    }
    return true
  }
  
  // Set 比较
  if (isSet(a) && isSet(b)) {
    if (a.size !== b.size) return false
    for (const value of a) {
      let found = false
      for (const bValue of b) {
        if (isEqual(value, bValue)) {
          found = true
          break
        }
      }
      if (!found) return false
    }
    return true
  }
  
  // 对象比较
  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a as object)
    const keysB = Object.keys(b as object)
    
    if (keysA.length !== keysB.length) return false
    
    return keysA.every(key => {
      return Object.prototype.hasOwnProperty.call(b, key) &&
             isEqual((a as any)[key], (b as any)[key])
    })
  }
  
  return false
}

/**
 * 获取对象差异
 */
export function diff<T extends object>(original: T, updated: T): Partial<T> {
  const result: Partial<T> = {}
  
  const allKeys = new Set([
    ...Object.keys(original),
    ...Object.keys(updated)
  ]) as Set<keyof T>
  
  for (const key of allKeys) {
    if (!isEqual(original[key], updated[key])) {
      result[key] = updated[key]
    }
  }
  
  return result
}

/**
 * 对象路径获取
 */
export function get<T = any>(
  obj: object,
  path: string | string[],
  defaultValue?: T
): T {
  const keys = Array.isArray(path) ? path : path.split('.')
  let result: any = obj
  
  for (const key of keys) {
    if (result == null) {
      return defaultValue as T
    }
    result = result[key]
  }
  
  return result === undefined ? defaultValue as T : result
}

/**
 * 对象路径设置
 */
export function set<T extends object>(
  obj: T,
  path: string | string[],
  value: any
): T {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current: any = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
  return obj
}

/**
 * 对象路径删除
 */
export function unset<T extends object>(
  obj: T,
  path: string | string[]
): boolean {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current: any = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (current == null || typeof current !== 'object') {
      return false
    }
    current = current[keys[i]]
  }
  
  if (current == null || typeof current !== 'object') {
    return false
  }
  
  return delete current[keys[keys.length - 1]]
}

/**
 * 判断对象路径是否存在
 */
export function has(obj: object, path: string | string[]): boolean {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current: any = obj
  
  for (const key of keys) {
    if (current == null || !Object.prototype.hasOwnProperty.call(current, key)) {
      return false
    }
    current = current[key]
  }
  
  return true
}

/**
 * 选择对象的部分属性
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * 排除对象的部分属性
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result
}

/**
 * 对象展平
 */
export function flatten(
  obj: object,
  prefix: string = '',
  separator: string = '.'
): Record<string, any> {
  const result: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}${separator}${key}` : key
    
    if (isObject(value) && !isArray(value) && !isDate(value)) {
      Object.assign(result, flatten(value, newKey, separator))
    } else {
      result[newKey] = value
    }
  }
  
  return result
}

/**
 * 对象反展平
 */
export function unflatten(
  obj: Record<string, any>,
  separator: string = '.'
): object {
  const result: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split(separator)
    let current = result
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (current[k] == null) {
        current[k] = /^\d+$/.test(keys[i + 1]) ? [] : {}
      }
      current = current[k]
    }
    
    current[keys[keys.length - 1]] = value
  }
  
  return result
}
