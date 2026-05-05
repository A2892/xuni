/**
 * 异步任务队列管理
 */

interface QueueTask<T = any> {
  id: string
  fn: () => Promise<T>
  priority: number
  resolve: (value: T) => void
  reject: (error: any) => void
  retries: number
  maxRetries: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: number
  startedAt?: number
  completedAt?: number
  error?: any
  result?: T
}

interface QueueOptions {
  concurrency?: number
  maxRetries?: number
  retryDelay?: number
  timeout?: number
  onTaskStart?: (task: QueueTask) => void
  onTaskComplete?: (task: QueueTask) => void
  onTaskError?: (task: QueueTask, error: any) => void
  onQueueEmpty?: () => void
}

/**
 * 创建异步任务队列
 */
export function createAsyncQueue(options: QueueOptions = {}) {
  const {
    concurrency = 3,
    maxRetries = 0,
    retryDelay = 1000,
    timeout = 0,
    onTaskStart,
    onTaskComplete,
    onTaskError,
    onQueueEmpty
  } = options
  
  const queue: QueueTask[] = []
  const running: Set<string> = new Set()
  let taskIdCounter = 0
  let isPaused = false
  
  function generateId(): string {
    return `task_${Date.now()}_${++taskIdCounter}`
  }
  
  async function processNext() {
    if (isPaused) return
    if (running.size >= concurrency) return
    
    // 按优先级排序，取优先级最高的任务
    queue.sort((a, b) => b.priority - a.priority)
    
    const task = queue.find(t => t.status === 'pending')
    if (!task) {
      if (running.size === 0 && onQueueEmpty) {
        onQueueEmpty()
      }
      return
    }
    
    task.status = 'running'
    task.startedAt = Date.now()
    running.add(task.id)
    
    if (onTaskStart) {
      onTaskStart(task)
    }
    
    try {
      let result: any
      
      if (timeout > 0) {
        result = await Promise.race([
          task.fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Task timeout')), timeout)
          )
        ])
      } else {
        result = await task.fn()
      }
      
      task.status = 'completed'
      task.completedAt = Date.now()
      task.result = result
      task.resolve(result)
      
      if (onTaskComplete) {
        onTaskComplete(task)
      }
    } catch (error) {
      task.error = error
      task.retries++
      
      if (task.retries < task.maxRetries) {
        // 重试
        task.status = 'pending'
        setTimeout(() => processNext(), retryDelay)
      } else {
        task.status = 'failed'
        task.completedAt = Date.now()
        task.reject(error)
        
        if (onTaskError) {
          onTaskError(task, error)
        }
      }
    } finally {
      running.delete(task.id)
      
      // 移除已完成的任务
      const index = queue.findIndex(t => t.id === task.id)
      if (index !== -1 && task.status !== 'pending') {
        queue.splice(index, 1)
      }
      
      // 继续处理下一个任务
      processNext()
    }
  }
  
  return {
    /**
     * 添加任务到队列
     */
    add<T>(fn: () => Promise<T>, priority: number = 0): Promise<T> {
      return new Promise((resolve, reject) => {
        const task: QueueTask<T> = {
          id: generateId(),
          fn,
          priority,
          resolve,
          reject,
          retries: 0,
          maxRetries: maxRetries,
          status: 'pending',
          createdAt: Date.now()
        }
        
        queue.push(task)
        processNext()
      })
    },
    
    /**
     * 批量添加任务
     */
    addAll<T>(tasks: Array<{ fn: () => Promise<T>; priority?: number }>): Promise<T[]> {
      return Promise.all(
        tasks.map(t => this.add(t.fn, t.priority || 0))
      )
    },
    
    /**
     * 暂停队列
     */
    pause() {
      isPaused = true
    },
    
    /**
     * 恢复队列
     */
    resume() {
      isPaused = false
      // 启动多个并发任务
      for (let i = 0; i < concurrency; i++) {
        processNext()
      }
    },
    
    /**
     * 清空队列
     */
    clear() {
      queue.forEach(task => {
        if (task.status === 'pending') {
          task.reject(new Error('Queue cleared'))
        }
      })
      queue.length = 0
    },
    
    /**
     * 获取队列状态
     */
    getStatus() {
      return {
        pending: queue.filter(t => t.status === 'pending').length,
        running: running.size,
        total: queue.length,
        isPaused
      }
    },
    
    /**
     * 获取所有任务
     */
    getTasks() {
      return [...queue]
    }
  }
}

/**
 * 节流队列 - 限制请求频率
 */
export function createThrottleQueue(
  interval: number = 1000,
  maxRequests: number = 10
) {
  const timestamps: number[] = []
  const pendingQueue: Array<{ resolve: () => void }> = []
  
  function cleanup() {
    const now = Date.now()
    const cutoff = now - interval
    
    while (timestamps.length > 0 && timestamps[0] < cutoff) {
      timestamps.shift()
    }
  }
  
  function processQueue() {
    cleanup()
    
    while (pendingQueue.length > 0 && timestamps.length < maxRequests) {
      const item = pendingQueue.shift()
      if (item) {
        timestamps.push(Date.now())
        item.resolve()
      }
    }
    
    if (pendingQueue.length > 0) {
      const waitTime = timestamps[0] + interval - Date.now()
      setTimeout(processQueue, Math.max(0, waitTime))
    }
  }
  
  return {
    /**
     * 等待执行许可
     */
    acquire(): Promise<void> {
      cleanup()
      
      if (timestamps.length < maxRequests) {
        timestamps.push(Date.now())
        return Promise.resolve()
      }
      
      return new Promise(resolve => {
        pendingQueue.push({ resolve })
        processQueue()
      })
    },
    
    /**
     * 包装异步函数
     */
    wrap<T extends (...args: any[]) => Promise<any>>(fn: T): T {
      return (async (...args: any[]) => {
        await this.acquire()
        return fn(...args)
      }) as T
    },
    
    /**
     * 获取状态
     */
    getStatus() {
      cleanup()
      return {
        currentRequests: timestamps.length,
        maxRequests,
        pending: pendingQueue.length
      }
    }
  }
}

/**
 * 优先级队列
 */
export class PriorityQueue<T> {
  private items: Array<{ value: T; priority: number }> = []
  
  enqueue(value: T, priority: number = 0) {
    const item = { value, priority }
    let added = false
    
    for (let i = 0; i < this.items.length; i++) {
      if (priority > this.items[i].priority) {
        this.items.splice(i, 0, item)
        added = true
        break
      }
    }
    
    if (!added) {
      this.items.push(item)
    }
  }
  
  dequeue(): T | undefined {
    return this.items.shift()?.value
  }
  
  peek(): T | undefined {
    return this.items[0]?.value
  }
  
  isEmpty(): boolean {
    return this.items.length === 0
  }
  
  size(): number {
    return this.items.length
  }
  
  clear() {
    this.items = []
  }
  
  toArray(): T[] {
    return this.items.map(item => item.value)
  }
}

/**
 * 批处理器
 */
export function createBatcher<T, R>(
  batchFn: (items: T[]) => Promise<R[]>,
  options: {
    maxSize?: number
    maxWait?: number
    cacheKey?: (item: T) => string
  } = {}
) {
  const { maxSize = 10, maxWait = 50, cacheKey } = options
  
  let batch: T[] = []
  let resolvers: Array<{ resolve: (value: R) => void; reject: (error: any) => void }> = []
  let timer: ReturnType<typeof setTimeout> | null = null
  const cache = new Map<string, R>()
  
  async function flush() {
    if (batch.length === 0) return
    
    const currentBatch = batch
    const currentResolvers = resolvers
    batch = []
    resolvers = []
    timer = null
    
    try {
      const results = await batchFn(currentBatch)
      
      results.forEach((result, index) => {
        if (cacheKey) {
          const key = cacheKey(currentBatch[index])
          cache.set(key, result)
        }
        currentResolvers[index].resolve(result)
      })
    } catch (error) {
      currentResolvers.forEach(r => r.reject(error))
    }
  }
  
  function schedule() {
    if (timer) return
    timer = setTimeout(flush, maxWait)
  }
  
  return {
    /**
     * 添加项目到批次
     */
    add(item: T): Promise<R> {
      // 检查缓存
      if (cacheKey) {
        const key = cacheKey(item)
        if (cache.has(key)) {
          return Promise.resolve(cache.get(key)!)
        }
      }
      
      return new Promise((resolve, reject) => {
        batch.push(item)
        resolvers.push({ resolve, reject })
        
        if (batch.length >= maxSize) {
          flush()
        } else {
          schedule()
        }
      })
    },
    
    /**
     * 立即处理当前批次
     */
    flush,
    
    /**
     * 清除缓存
     */
    clearCache() {
      cache.clear()
    },
    
    /**
     * 获取状态
     */
    getStatus() {
      return {
        pending: batch.length,
        cacheSize: cache.size
      }
    }
  }
}

/**
 * 重试工具
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    backoff?: 'fixed' | 'exponential' | 'linear'
    maxDelay?: number
    shouldRetry?: (error: any, attempt: number) => boolean
    onRetry?: (error: any, attempt: number) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 'exponential',
    maxDelay = 30000,
    shouldRetry = () => true,
    onRetry
  } = options
  
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries || !shouldRetry(error, attempt)) {
        throw error
      }
      
      if (onRetry) {
        onRetry(error, attempt)
      }
      
      let waitTime: number
      switch (backoff) {
        case 'exponential':
          waitTime = Math.min(delay * Math.pow(2, attempt), maxDelay)
          break
        case 'linear':
          waitTime = Math.min(delay * (attempt + 1), maxDelay)
          break
        default:
          waitTime = delay
      }
      
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw lastError
}

/**
 * 并发限制器
 */
export async function concurrent<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  limit: number = 5
): Promise<R[]> {
  const results: R[] = []
  let index = 0
  
  async function worker() {
    while (index < items.length) {
      const currentIndex = index++
      results[currentIndex] = await fn(items[currentIndex], currentIndex)
    }
  }
  
  const workers = Array(Math.min(limit, items.length)).fill(null).map(worker)
  await Promise.all(workers)
  
  return results
}

/**
 * 串行执行
 */
export async function serial<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i++) {
    results.push(await fn(items[i], i))
  }
  
  return results
}

/**
 * 条件等待
 */
export function waitUntil(
  condition: () => boolean,
  options: {
    interval?: number
    timeout?: number
  } = {}
): Promise<void> {
  const { interval = 100, timeout = 10000 } = options
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      if (condition()) {
        resolve()
        return
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error('Wait timeout'))
        return
      }
      
      setTimeout(check, interval)
    }
    
    check()
  })
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 超时包装
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), ms)
    )
  ])
}
