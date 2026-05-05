/**
 * 日志工具函数
 */

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

// 日志级别优先级
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4
}

// 日志条目
export interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: Date
  context?: string
  stack?: string
}

// 日志配置
export interface LoggerConfig {
  level: LogLevel
  prefix?: string
  timestamp?: boolean
  colorize?: boolean
  persist?: boolean
  maxEntries?: number
  onLog?: (entry: LogEntry) => void
}

// 默认配置
const defaultConfig: LoggerConfig = {
  level: 'info',
  prefix: '',
  timestamp: true,
  colorize: true,
  persist: false,
  maxEntries: 1000
}

// 颜色配置
const COLORS: Record<LogLevel, string> = {
  debug: '#9CA3AF',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
  silent: '#000000'
}

// 图标
const ICONS: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  silent: ''
}

/**
 * 创建日志记录器
 */
export function createLogger(config: Partial<LoggerConfig> = {}) {
  const mergedConfig: LoggerConfig = { ...defaultConfig, ...config }
  const entries: LogEntry[] = []
  
  function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[mergedConfig.level]
  }
  
  function formatMessage(level: LogLevel, message: string, data?: any): string {
    const parts: string[] = []
    
    if (mergedConfig.timestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }
    
    if (mergedConfig.prefix) {
      parts.push(`[${mergedConfig.prefix}]`)
    }
    
    parts.push(`[${level.toUpperCase()}]`)
    parts.push(message)
    
    return parts.join(' ')
  }
  
  function log(level: LogLevel, message: string, data?: any, context?: string) {
    if (!shouldLog(level)) return
    
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      context,
      stack: level === 'error' ? new Error().stack : undefined
    }
    
    // 存储日志
    if (mergedConfig.persist) {
      entries.push(entry)
      if (entries.length > (mergedConfig.maxEntries || 1000)) {
        entries.shift()
      }
    }
    
    // 回调
    if (mergedConfig.onLog) {
      mergedConfig.onLog(entry)
    }
    
    // 输出到控制台
    const formattedMessage = formatMessage(level, message, data)
    const consoleMethod = level === 'debug' ? 'log' : level
    
    if (mergedConfig.colorize && typeof window !== 'undefined') {
      const color = COLORS[level]
      const icon = ICONS[level]
      
      if (data !== undefined) {
        console[consoleMethod](
          `%c${icon} ${formattedMessage}`,
          `color: ${color}; font-weight: bold;`,
          data
        )
      } else {
        console[consoleMethod](
          `%c${icon} ${formattedMessage}`,
          `color: ${color}; font-weight: bold;`
        )
      }
    } else {
      if (data !== undefined) {
        console[consoleMethod](formattedMessage, data)
      } else {
        console[consoleMethod](formattedMessage)
      }
    }
  }
  
  return {
    debug: (message: string, data?: any, context?: string) => log('debug', message, data, context),
    info: (message: string, data?: any, context?: string) => log('info', message, data, context),
    warn: (message: string, data?: any, context?: string) => log('warn', message, data, context),
    error: (message: string, data?: any, context?: string) => log('error', message, data, context),
    
    /**
     * 设置日志级别
     */
    setLevel(level: LogLevel) {
      mergedConfig.level = level
    },
    
    /**
     * 获取当前日志级别
     */
    getLevel(): LogLevel {
      return mergedConfig.level
    },
    
    /**
     * 获取日志历史
     */
    getEntries(): LogEntry[] {
      return [...entries]
    },
    
    /**
     * 清空日志历史
     */
    clearEntries() {
      entries.length = 0
    },
    
    /**
     * 导出日志
     */
    exportLogs(): string {
      return JSON.stringify(entries, null, 2)
    },
    
    /**
     * 创建子日志记录器
     */
    child(childConfig: Partial<LoggerConfig>) {
      return createLogger({
        ...mergedConfig,
        ...childConfig
      })
    },
    
    /**
     * 计时开始
     */
    time(label: string) {
      console.time(label)
    },
    
    /**
     * 计时结束
     */
    timeEnd(label: string) {
      console.timeEnd(label)
    },
    
    /**
     * 分组开始
     */
    group(label: string, collapsed = false) {
      if (collapsed) {
        console.groupCollapsed(label)
      } else {
        console.group(label)
      }
    },
    
    /**
     * 分组结束
     */
    groupEnd() {
      console.groupEnd()
    },
    
    /**
     * 表格输出
     */
    table(data: any, columns?: string[]) {
      console.table(data, columns)
    },
    
    /**
     * 计数
     */
    count(label?: string) {
      console.count(label)
    },
    
    /**
     * 重置计数
     */
    countReset(label?: string) {
      console.countReset(label)
    },
    
    /**
     * 断言
     */
    assert(condition: boolean, message: string, ...data: any[]) {
      console.assert(condition, message, ...data)
    },
    
    /**
     * 追踪调用栈
     */
    trace(message?: string) {
      console.trace(message)
    },
    
    /**
     * 清空控制台
     */
    clear() {
      console.clear()
    }
  }
}

// 默认日志记录器
export const logger = createLogger()

/**
 * 性能日志
 */
export function createPerformanceLogger(name: string) {
  const marks: Map<string, number> = new Map()
  
  return {
    mark(label: string) {
      marks.set(label, performance.now())
      performance.mark(`${name}:${label}`)
    },
    
    measure(label: string, startMark: string, endMark?: string) {
      const end = endMark ? marks.get(endMark) : performance.now()
      const start = marks.get(startMark)
      
      if (start && end) {
        const duration = end - start
        logger.info(`[Performance] ${name}:${label}`, { duration: `${duration.toFixed(2)}ms` })
        
        try {
          performance.measure(
            `${name}:${label}`,
            `${name}:${startMark}`,
            endMark ? `${name}:${endMark}` : undefined
          )
        } catch {
          // 忽略 performance API 错误
        }
        
        return duration
      }
      
      return 0
    },
    
    clear() {
      marks.clear()
      try {
        performance.clearMarks()
        performance.clearMeasures()
      } catch {
        // 忽略
      }
    }
  }
}

/**
 * 错误日志增强
 */
export function setupErrorLogging(customLogger = logger) {
  // 全局错误处理
  window.addEventListener('error', (event) => {
    customLogger.error('Uncaught Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    })
  })
  
  // Promise 未捕获异常
  window.addEventListener('unhandledrejection', (event) => {
    customLogger.error('Unhandled Promise Rejection', {
      reason: event.reason
    })
  })
  
  // 资源加载错误
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement
    if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      customLogger.error('Resource Load Error', {
        tagName: target.tagName,
        src: (target as HTMLImageElement).src || (target as HTMLScriptElement).src || (target as HTMLLinkElement).href
      })
    }
  }, true)
}

/**
 * 网络请求日志
 */
export function createNetworkLogger(customLogger = logger) {
  return {
    request(config: { method: string; url: string; data?: any }) {
      customLogger.info(`[Request] ${config.method.toUpperCase()} ${config.url}`, config.data)
    },
    
    response(config: { method: string; url: string; status: number; data?: any; duration?: number }) {
      const level = config.status >= 400 ? 'error' : 'info'
      customLogger[level](
        `[Response] ${config.method.toUpperCase()} ${config.url} - ${config.status}`,
        {
          data: config.data,
          duration: config.duration ? `${config.duration}ms` : undefined
        }
      )
    },
    
    error(config: { method: string; url: string; error: any }) {
      customLogger.error(`[Network Error] ${config.method.toUpperCase()} ${config.url}`, config.error)
    }
  }
}

/**
 * 调试工具
 */
export const debug = {
  /**
   * 仅在开发环境输出
   */
  log(...args: any[]) {
    if (import.meta.env.DEV) {
      console.log(...args)
    }
  },
  
  /**
   * 带标签的调试输出
   */
  tagged(tag: string, ...args: any[]) {
    if (import.meta.env.DEV) {
      console.log(`[${tag}]`, ...args)
    }
  },
  
  /**
   * JSON 格式化输出
   */
  json(data: any, label?: string) {
    if (import.meta.env.DEV) {
      if (label) {
        console.log(label, JSON.stringify(data, null, 2))
      } else {
        console.log(JSON.stringify(data, null, 2))
      }
    }
  },
  
  /**
   * 高亮输出
   */
  highlight(message: string, color = '#00ff00') {
    if (import.meta.env.DEV) {
      console.log(
        `%c${message}`,
        `background: ${color}; color: black; padding: 2px 8px; border-radius: 4px;`
      )
    }
  },
  
  /**
   * 大字体输出
   */
  big(message: string) {
    if (import.meta.env.DEV) {
      console.log(
        `%c${message}`,
        'font-size: 24px; font-weight: bold; color: #4B6EF5;'
      )
    }
  },
  
  /**
   * 分隔线
   */
  separator(label?: string) {
    if (import.meta.env.DEV) {
      if (label) {
        console.log(`\n${'='.repeat(20)} ${label} ${'='.repeat(20)}\n`)
      } else {
        console.log('\n' + '='.repeat(50) + '\n')
      }
    }
  }
}

/**
 * 日志装饰器（用于类方法）
 */
export function LogMethod(level: LogLevel = 'debug') {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    
    descriptor.value = function (...args: any[]) {
      logger[level](`Calling ${propertyKey}`, { args })
      
      const startTime = performance.now()
      const result = originalMethod.apply(this, args)
      
      if (result instanceof Promise) {
        return result.then((res) => {
          const duration = performance.now() - startTime
          logger[level](`${propertyKey} completed`, { result: res, duration: `${duration.toFixed(2)}ms` })
          return res
        }).catch((err) => {
          logger.error(`${propertyKey} failed`, err)
          throw err
        })
      } else {
        const duration = performance.now() - startTime
        logger[level](`${propertyKey} completed`, { result, duration: `${duration.toFixed(2)}ms` })
        return result
      }
    }
    
    return descriptor
  }
}

/**
 * Vue 3 插件
 */
export const LoggerPlugin = {
  install(app: any, options: Partial<LoggerConfig> = {}) {
    const appLogger = createLogger(options)
    
    app.config.globalProperties.$logger = appLogger
    app.provide('logger', appLogger)
    
    // 错误处理
    app.config.errorHandler = (err: Error, vm: any, info: string) => {
      appLogger.error('Vue Error', { error: err.message, info, stack: err.stack })
    }
    
    // 警告处理
    app.config.warnHandler = (msg: string, vm: any, trace: string) => {
      appLogger.warn('Vue Warning', { message: msg, trace })
    }
  }
}
