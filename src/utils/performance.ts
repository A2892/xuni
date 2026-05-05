/**
 * 性能优化工具库
 * 提供防抖、节流、懒加载等常用优化方法
 */

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即执行
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  let isInvoked = false

  return function(this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)

    if (immediate && !isInvoked) {
      fn.apply(this, args)
      isInvoked = true
    }

    timer = setTimeout(() => {
      if (!immediate) {
        fn.apply(this, args)
      }
      isInvoked = false
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param interval 间隔时间（毫秒）
 * @param options 配置项
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 300,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options
  let lastTime = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (!lastTime && !leading) {
      lastTime = now
    }

    const remaining = interval - (now - lastTime)

    if (remaining <= 0 || remaining > interval) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      fn.apply(this, args)
    } else if (!timer && trailing) {
      timer = setTimeout(() => {
        lastTime = leading ? Date.now() : 0
        timer = null
        fn.apply(this, args)
      }, remaining)
    }
  }
}

/**
 * 图片懒加载指令
 */
export const lazyLoad = {
  mounted(el: HTMLImageElement, binding: { value: string }) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.src = binding.value
            el.classList.add('lazy-loaded')
            observer.unobserve(el)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )
    observer.observe(el)
  }
}

/**
 * 虚拟滚动助手
 */
export class VirtualScroll<T> {
  private items: T[]
  private itemHeight: number
  private containerHeight: number
  private overscan: number

  constructor(options: {
    items: T[]
    itemHeight: number
    containerHeight: number
    overscan?: number
  }) {
    this.items = options.items
    this.itemHeight = options.itemHeight
    this.containerHeight = options.containerHeight
    this.overscan = options.overscan ?? 3
  }

  getVisibleItems(scrollTop: number): {
    items: T[]
    startIndex: number
    endIndex: number
    offsetTop: number
    totalHeight: number
  } {
    const totalHeight = this.items.length * this.itemHeight
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight)
    
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / this.itemHeight) - this.overscan
    )
    const endIndex = Math.min(
      this.items.length,
      startIndex + visibleCount + this.overscan * 2
    )

    return {
      items: this.items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      offsetTop: startIndex * this.itemHeight,
      totalHeight
    }
  }

  updateItems(items: T[]) {
    this.items = items
  }
}

/**
 * 请求缓存
 */
class RequestCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private maxAge: number

  constructor(maxAge: number = 5 * 60 * 1000) {
    this.maxAge = maxAge
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }
}

export const requestCache = new RequestCache()

/**
 * 批量请求合并
 */
export class BatchRequest<T, R> {
  private queue: Array<{ key: T; resolve: (value: R) => void; reject: (error: any) => void }> = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private batchFn: (keys: T[]) => Promise<Map<T, R>>
  private delay: number

  constructor(batchFn: (keys: T[]) => Promise<Map<T, R>>, delay: number = 50) {
    this.batchFn = batchFn
    this.delay = delay
  }

  request(key: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject })

      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.delay)
      }
    })
  }

  private async flush(): Promise<void> {
    const currentQueue = [...this.queue]
    this.queue = []
    this.timer = null

    if (currentQueue.length === 0) return

    try {
      const keys = currentQueue.map((item) => item.key)
      const results = await this.batchFn(keys)

      currentQueue.forEach((item) => {
        const result = results.get(item.key)
        if (result !== undefined) {
          item.resolve(result)
        } else {
          item.reject(new Error(`No result for key: ${item.key}`))
        }
      })
    } catch (error) {
      currentQueue.forEach((item) => item.reject(error))
    }
  }
}

/**
 * 内存优化 - 对象池
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn?: (obj: T) => void
  private maxSize: number

  constructor(options: {
    create: () => T
    reset?: (obj: T) => void
    maxSize?: number
  }) {
    this.createFn = options.create
    this.resetFn = options.reset
    this.maxSize = options.maxSize ?? 100
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn?.(obj)
      this.pool.push(obj)
    }
  }

  clear(): void {
    this.pool = []
  }
}

/**
 * Web Worker 包装器
 */
export function createWorker<T, R>(fn: (data: T) => R): {
  run: (data: T) => Promise<R>
  terminate: () => void
} {
  const blob = new Blob(
    [`self.onmessage = function(e) { self.postMessage((${fn.toString()})(e.data)); }`],
    { type: 'application/javascript' }
  )
  const url = URL.createObjectURL(blob)
  const worker = new Worker(url)

  return {
    run(data: T): Promise<R> {
      return new Promise((resolve, reject) => {
        worker.onmessage = (e) => resolve(e.data)
        worker.onerror = (e) => reject(e)
        worker.postMessage(data)
      })
    },
    terminate() {
      worker.terminate()
      URL.revokeObjectURL(url)
    }
  }
}

/**
 * 性能监控
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number[]> = new Map()

  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark)
    const end = endMark ? this.marks.get(endMark) : performance.now()

    if (!start) {
      console.warn(`Start mark "${startMark}" not found`)
      return 0
    }

    const duration = (end ?? performance.now()) - start

    if (!this.measures.has(name)) {
      this.measures.set(name, [])
    }
    this.measures.get(name)!.push(duration)

    return duration
  }

  getAverage(name: string): number {
    const measurements = this.measures.get(name)
    if (!measurements || measurements.length === 0) return 0
    return measurements.reduce((a, b) => a + b, 0) / measurements.length
  }

  getReport(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const report: Record<string, { avg: number; min: number; max: number; count: number }> = {}

    this.measures.forEach((values, name) => {
      report[name] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      }
    })

    return report
  }

  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }
}

export const perfMonitor = new PerformanceMonitor()

/**
 * 空闲时执行
 */
export function runWhenIdle(callback: () => void, timeout?: number): number {
  if ('requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(callback, timeout ? { timeout } : undefined)
  }
  return setTimeout(callback, 1) as unknown as number
}

/**
 * 取消空闲任务
 */
export function cancelIdle(id: number): void {
  if ('cancelIdleCallback' in window) {
    (window as any).cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * 分片执行大任务
 */
export async function runInChunks<T>(
  items: T[],
  processor: (item: T, index: number) => void,
  chunkSize: number = 100,
  yieldInterval: number = 16
): Promise<void> {
  let index = 0

  while (index < items.length) {
    const chunk = items.slice(index, index + chunkSize)
    chunk.forEach((item, i) => processor(item, index + i))
    index += chunkSize

    if (index < items.length) {
      await new Promise((resolve) => setTimeout(resolve, yieldInterval))
    }
  }
}
