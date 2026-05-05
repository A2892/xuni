/**
 * 函数节流与防抖工具
 */

/**
 * 防抖函数
 * 在事件被触发后，等待一段时间后再执行回调
 * 如果在等待期间再次触发，则重新计时
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  options: {
    // 是否在第一次调用时立即执行
    leading?: boolean
    // 是否在延迟结束后执行
    trailing?: boolean
    // 最大等待时间
    maxWait?: number
  } = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true, maxWait } = options
  
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastCallTime: number | null = null
  let lastInvokeTime = 0
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null
  let result: ReturnType<T>
  
  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs
    const thisArg = lastThis
    
    lastArgs = null
    lastThis = null
    lastInvokeTime = time
    result = func.apply(thisArg, args!)
    return result
  }
  
  function leadingEdge(time: number): ReturnType<T> {
    lastInvokeTime = time
    timeoutId = setTimeout(timerExpired, wait)
    return leading ? invokeFunc(time) : result
  }
  
  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime || 0)
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall
    
    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }
  
  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime || 0)
    const timeSinceLastInvoke = time - lastInvokeTime
    
    return (
      lastCallTime === null ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    )
  }
  
  function timerExpired(): void {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time))
  }
  
  function trailingEdge(time: number): ReturnType<T> | undefined {
    timeoutId = null
    
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = null
    lastThis = null
    return result
  }
  
  function cancel(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    lastInvokeTime = 0
    lastArgs = null
    lastCallTime = null
    lastThis = null
    timeoutId = null
  }
  
  function flush(): ReturnType<T> | undefined {
    if (timeoutId === null) {
      return result
    }
    return trailingEdge(Date.now())
  }
  
  function debounced(this: any, ...args: Parameters<T>): ReturnType<T> {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)
    
    lastArgs = args
    lastThis = this
    lastCallTime = time
    
    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime)
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, wait)
    }
    return result
  }
  
  debounced.cancel = cancel
  debounced.flush = flush
  
  return debounced as T & { cancel: () => void; flush: () => void }
}

/**
 * 节流函数
 * 在指定时间间隔内，最多执行一次回调
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  options: {
    // 是否在第一次调用时立即执行
    leading?: boolean
    // 是否在节流结束后执行
    trailing?: boolean
  } = {}
): T & { cancel: () => void } {
  const { leading = true, trailing = true } = options
  
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null
  let lastInvokeTime = 0
  let result: ReturnType<T>
  
  function invokeFunc(): ReturnType<T> {
    const args = lastArgs
    const thisArg = lastThis
    
    lastArgs = null
    lastThis = null
    lastInvokeTime = Date.now()
    result = func.apply(thisArg, args!)
    return result
  }
  
  function startTimer(): void {
    timeoutId = setTimeout(() => {
      timeoutId = null
      if (trailing && lastArgs) {
        invokeFunc()
        startTimer()
      }
    }, wait)
  }
  
  function cancel(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastArgs = null
    lastThis = null
  }
  
  function throttled(this: any, ...args: Parameters<T>): ReturnType<T> {
    const now = Date.now()
    const timeSinceLastInvoke = now - lastInvokeTime
    
    lastArgs = args
    lastThis = this
    
    if (timeSinceLastInvoke >= wait) {
      if (leading) {
        return invokeFunc()
      }
      lastInvokeTime = now
    }
    
    if (timeoutId === null) {
      startTimer()
    }
    
    return result
  }
  
  throttled.cancel = cancel
  
  return throttled as T & { cancel: () => void }
}

/**
 * 只执行一次的函数
 */
export function once<T extends (...args: any[]) => any>(func: T): T {
  let called = false
  let result: ReturnType<T>
  
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true
      result = func.apply(this, args)
    }
    return result
  } as T
}

/**
 * 记忆化函数
 * 缓存函数的计算结果
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T & { cache: Map<string, ReturnType<T>>; clear: () => void } {
  const cache = new Map<string, ReturnType<T>>()
  
  function memoized(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = func.apply(this, args)
    cache.set(key, result)
    return result
  }
  
  memoized.cache = cache
  memoized.clear = () => cache.clear()
  
  return memoized as T & { cache: Map<string, ReturnType<T>>; clear: () => void }
}

/**
 * 延迟执行函数
 */
export function defer<T extends (...args: any[]) => any>(
  func: T,
  ...args: Parameters<T>
): ReturnType<typeof setTimeout> {
  return setTimeout(() => func(...args), 0)
}

/**
 * 延迟指定时间后执行函数
 */
export function delay<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  ...args: Parameters<T>
): ReturnType<typeof setTimeout> {
  return setTimeout(() => func(...args), wait)
}

/**
 * 函数柯里化
 */
export function curry<T extends (...args: any[]) => any>(func: T): any {
  const arity = func.length
  
  return function curried(...args: any[]): any {
    if (args.length >= arity) {
      return func(...args)
    }
    return (...moreArgs: any[]) => curried(...args, ...moreArgs)
  }
}

/**
 * 函数组合 (从右到左)
 */
export function compose<T>(...funcs: Array<(arg: T) => T>): (arg: T) => T {
  if (funcs.length === 0) {
    return (arg: T) => arg
  }
  
  if (funcs.length === 1) {
    return funcs[0]
  }
  
  return funcs.reduce((a, b) => (arg: T) => a(b(arg)))
}

/**
 * 函数管道 (从左到右)
 */
export function pipe<T>(...funcs: Array<(arg: T) => T>): (arg: T) => T {
  if (funcs.length === 0) {
    return (arg: T) => arg
  }
  
  if (funcs.length === 1) {
    return funcs[0]
  }
  
  return funcs.reduce((a, b) => (arg: T) => b(a(arg)))
}

/**
 * 在函数执行前后添加钩子
 */
export function wrap<T extends (...args: any[]) => any>(
  func: T,
  options: {
    before?: (...args: Parameters<T>) => void
    after?: (result: ReturnType<T>, ...args: Parameters<T>) => void
  }
): T {
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    options.before?.(...args)
    const result = func.apply(this, args)
    options.after?.(result, ...args)
    return result
  } as T
}

/**
 * 创建节流的 RAF (requestAnimationFrame) 函数
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): T & { cancel: () => void } {
  let rafId: number | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null
  
  function throttled(this: any, ...args: Parameters<T>): void {
    lastArgs = args
    lastThis = this
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        rafId = null
        func.apply(lastThis, lastArgs!)
      })
    }
  }
  
  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
  
  return throttled as T & { cancel: () => void }
}

/**
 * 限制函数在指定时间内最多执行 N 次
 */
export function rateLimit<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  interval: number
): T & { getRemainingCalls: () => number } {
  const calls: number[] = []
  
  function rateLimited(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now()
    
    // 清理过期的调用记录
    while (calls.length > 0 && calls[0] <= now - interval) {
      calls.shift()
    }
    
    if (calls.length < limit) {
      calls.push(now)
      return func.apply(this, args)
    }
    
    return undefined
  }
  
  rateLimited.getRemainingCalls = () => {
    const now = Date.now()
    while (calls.length > 0 && calls[0] <= now - interval) {
      calls.shift()
    }
    return Math.max(0, limit - calls.length)
  }
  
  return rateLimited as T & { getRemainingCalls: () => number }
}

/**
 * 创建可重试的函数
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  func: T,
  options: {
    maxRetries?: number
    delay?: number
    backoff?: 'linear' | 'exponential'
    onRetry?: (error: Error, attempt: number) => void
  } = {}
): T {
  const { maxRetries = 3, delay = 1000, backoff = 'linear', onRetry } = options
  
  return async function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await func.apply(this, args)
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxRetries) {
          onRetry?.(lastError, attempt + 1)
          
          const waitTime = backoff === 'exponential'
            ? delay * Math.pow(2, attempt)
            : delay * (attempt + 1)
          
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }
    
    throw lastError!
  } as T
}
