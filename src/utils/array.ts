/**
 * 数组工具函数
 */

/**
 * 数组去重
 */
export const unique = <T>(arr: T[]): T[] => {
  return [...new Set(arr)]
}

/**
 * 根据对象属性去重
 */
export const uniqueBy = <T>(arr: T[], key: keyof T | ((item: T) => any)): T[] => {
  const seen = new Set()
  return arr.filter(item => {
    const k = typeof key === 'function' ? key(item) : item[key]
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/**
 * 数组分组
 */
export const groupBy = <T>(arr: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> => {
  return arr.reduce((groups, item) => {
    const k = typeof key === 'function' ? key(item) : String(item[key])
    if (!groups[k]) groups[k] = []
    groups[k].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 数组分块
 */
export const chunk = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * 数组扁平化
 */
export const flatten = <T>(arr: (T | T[])[]): T[] => {
  return arr.flat(Infinity) as T[]
}

/**
 * 深度扁平化
 */
export const flattenDeep = <T>(arr: any[], depth: number = Infinity): T[] => {
  return arr.flat(depth) as T[]
}

/**
 * 数组差集
 */
export const difference = <T>(arr1: T[], arr2: T[]): T[] => {
  const set = new Set(arr2)
  return arr1.filter(item => !set.has(item))
}

/**
 * 数组交集
 */
export const intersection = <T>(arr1: T[], arr2: T[]): T[] => {
  const set = new Set(arr2)
  return arr1.filter(item => set.has(item))
}

/**
 * 数组并集
 */
export const union = <T>(...arrays: T[][]): T[] => {
  return unique(arrays.flat())
}

/**
 * 数组随机排序
 */
export const shuffle = <T>(arr: T[]): T[] => {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 随机取样
 */
export const sample = <T>(arr: T[], count: number = 1): T[] => {
  return shuffle(arr).slice(0, count)
}

/**
 * 获取第一个元素
 */
export const first = <T>(arr: T[]): T | undefined => arr[0]

/**
 * 获取最后一个元素
 */
export const last = <T>(arr: T[]): T | undefined => arr[arr.length - 1]

/**
 * 数组求和
 */
export const sum = (arr: number[]): number => {
  return arr.reduce((acc, val) => acc + val, 0)
}

/**
 * 根据属性求和
 */
export const sumBy = <T>(arr: T[], key: keyof T | ((item: T) => number)): number => {
  return arr.reduce((acc, item) => {
    const val = typeof key === 'function' ? key(item) : Number(item[key])
    return acc + val
  }, 0)
}

/**
 * 数组平均值
 */
export const average = (arr: number[]): number => {
  return arr.length > 0 ? sum(arr) / arr.length : 0
}

/**
 * 数组最大值
 */
export const max = (arr: number[]): number => {
  return Math.max(...arr)
}

/**
 * 根据属性获取最大值
 */
export const maxBy = <T>(arr: T[], key: keyof T | ((item: T) => number)): T | undefined => {
  if (arr.length === 0) return undefined
  return arr.reduce((max, item) => {
    const maxVal = typeof key === 'function' ? key(max) : Number(max[key])
    const itemVal = typeof key === 'function' ? key(item) : Number(item[key])
    return itemVal > maxVal ? item : max
  })
}

/**
 * 数组最小值
 */
export const min = (arr: number[]): number => {
  return Math.min(...arr)
}

/**
 * 根据属性获取最小值
 */
export const minBy = <T>(arr: T[], key: keyof T | ((item: T) => number)): T | undefined => {
  if (arr.length === 0) return undefined
  return arr.reduce((min, item) => {
    const minVal = typeof key === 'function' ? key(min) : Number(min[key])
    const itemVal = typeof key === 'function' ? key(item) : Number(item[key])
    return itemVal < minVal ? item : min
  })
}

/**
 * 多属性排序
 */
export const orderBy = <T>(
  arr: T[],
  keys: (keyof T)[],
  orders: ('asc' | 'desc')[] = []
): T[] => {
  return [...arr].sort((a, b) => {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const order = orders[i] || 'asc'
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
    }
    return 0
  })
}

/**
 * 按属性计数
 */
export const countBy = <T>(arr: T[], key: keyof T | ((item: T) => string)): Record<string, number> => {
  return arr.reduce((counts, item) => {
    const k = typeof key === 'function' ? key(item) : String(item[key])
    counts[k] = (counts[k] || 0) + 1
    return counts
  }, {} as Record<string, number>)
}

/**
 * 查找元素索引（支持条件函数）
 */
export const findIndex = <T>(arr: T[], predicate: (item: T, index: number) => boolean): number => {
  return arr.findIndex(predicate)
}

/**
 * 移除元素
 */
export const remove = <T>(arr: T[], predicate: (item: T) => boolean): T[] => {
  return arr.filter(item => !predicate(item))
}

/**
 * 移动元素
 */
export const move = <T>(arr: T[], from: number, to: number): T[] => {
  const result = [...arr]
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}

/**
 * 交换元素
 */
export const swap = <T>(arr: T[], i: number, j: number): T[] => {
  const result = [...arr]
  ;[result[i], result[j]] = [result[j], result[i]]
  return result
}

/**
 * 填充数组
 */
export const fill = <T>(length: number, value: T | ((index: number) => T)): T[] => {
  return Array.from({ length }, (_, i) => (typeof value === 'function' ? (value as Function)(i) : value))
}

/**
 * 生成范围数组
 */
export const range = (start: number, end: number, step: number = 1): number[] => {
  const result: number[] = []
  for (let i = start; i < end; i += step) {
    result.push(i)
  }
  return result
}

/**
 * 数组转对象
 */
export const keyBy = <T>(arr: T[], key: keyof T | ((item: T) => string)): Record<string, T> => {
  return arr.reduce((obj, item) => {
    const k = typeof key === 'function' ? key(item) : String(item[key])
    obj[k] = item
    return obj
  }, {} as Record<string, T>)
}

/**
 * 压缩数组（移除 falsy 值）
 */
export const compact = <T>(arr: (T | null | undefined | false | 0 | '')[]): T[] => {
  return arr.filter(Boolean) as T[]
}

/**
 * 分区
 */
export const partition = <T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  const pass: T[] = []
  const fail: T[] = []
  arr.forEach(item => {
    ;(predicate(item) ? pass : fail).push(item)
  })
  return [pass, fail]
}

/**
 * 拉链合并
 */
export const zip = <T, U>(arr1: T[], arr2: U[]): [T, U][] => {
  const length = Math.min(arr1.length, arr2.length)
  return Array.from({ length }, (_, i) => [arr1[i], arr2[i]])
}

/**
 * 拆分拉链
 */
export const unzip = <T, U>(arr: [T, U][]): [T[], U[]] => {
  return arr.reduce(
    ([arr1, arr2], [a, b]) => {
      arr1.push(a)
      arr2.push(b)
      return [arr1, arr2]
    },
    [[] as T[], [] as U[]]
  )
}

/**
 * 滑动窗口
 */
export const slidingWindow = <T>(arr: T[], size: number): T[][] => {
  if (size > arr.length) return []
  const windows: T[][] = []
  for (let i = 0; i <= arr.length - size; i++) {
    windows.push(arr.slice(i, i + size))
  }
  return windows
}

/**
 * 获取所有排列组合
 */
export const permutations = <T>(arr: T[]): T[][] => {
  if (arr.length <= 1) return [arr]
  
  const result: T[][] = []
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
    const perms = permutations(rest)
    for (const perm of perms) {
      result.push([arr[i], ...perm])
    }
  }
  return result
}

/**
 * 获取所有组合
 */
export const combinations = <T>(arr: T[], size: number): T[][] => {
  if (size > arr.length) return []
  if (size === arr.length) return [arr]
  if (size === 1) return arr.map(item => [item])
  
  const result: T[][] = []
  for (let i = 0; i <= arr.length - size; i++) {
    const first = arr[i]
    const rest = combinations(arr.slice(i + 1), size - 1)
    for (const comb of rest) {
      result.push([first, ...comb])
    }
  }
  return result
}

export default {
  unique,
  uniqueBy,
  groupBy,
  chunk,
  flatten,
  flattenDeep,
  difference,
  intersection,
  union,
  shuffle,
  sample,
  first,
  last,
  sum,
  sumBy,
  average,
  max,
  maxBy,
  min,
  minBy,
  orderBy,
  countBy,
  findIndex,
  remove,
  move,
  swap,
  fill,
  range,
  keyBy,
  compact,
  partition,
  zip,
  unzip,
  slidingWindow,
  permutations,
  combinations
}
