/**
 * 事件工具函数 - 事件处理和事件总线
 */

// ==================== 事件总线 ====================

type EventHandler = (...args: any[]) => void

export function createEventBus() {
  const events = new Map<string, Set<EventHandler>>()
  
  return {
    /**
     * 监听事件
     */
    on(event: string, handler: EventHandler): () => void {
      if (!events.has(event)) {
        events.set(event, new Set())
      }
      events.get(event)!.add(handler)
      
      // 返回取消监听函数
      return () => {
        events.get(event)?.delete(handler)
      }
    },
    
    /**
     * 监听一次事件
     */
    once(event: string, handler: EventHandler): () => void {
      const onceHandler: EventHandler = (...args) => {
        handler(...args)
        events.get(event)?.delete(onceHandler)
      }
      return this.on(event, onceHandler)
    },
    
    /**
     * 触发事件
     */
    emit(event: string, ...args: any[]): void {
      events.get(event)?.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error)
        }
      })
    },
    
    /**
     * 移除事件监听
     */
    off(event: string, handler?: EventHandler): void {
      if (handler) {
        events.get(event)?.delete(handler)
      } else {
        events.delete(event)
      }
    },
    
    /**
     * 移除所有事件监听
     */
    clear(): void {
      events.clear()
    },
    
    /**
     * 获取事件监听器数量
     */
    listenerCount(event: string): number {
      return events.get(event)?.size || 0
    }
  }
}

// 全局事件总线实例
export const eventBus = createEventBus()

// ==================== DOM 事件工具 ====================

/**
 * 添加事件监听器，返回移除函数
 */
export function addEventListener<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  listener: (ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void
export function addEventListener<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  listener: (ev: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void
export function addEventListener<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  listener: (ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void
export function addEventListener(
  target: EventTarget,
  type: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
): () => void {
  target.addEventListener(type, listener, options)
  return () => target.removeEventListener(type, listener, options)
}

/**
 * 事件委托
 */
export function delegate<T extends HTMLElement = HTMLElement>(
  parent: HTMLElement,
  selector: string,
  type: string,
  handler: (event: Event, target: T) => void
): () => void {
  const listener = (event: Event) => {
    const target = event.target as HTMLElement
    const delegateTarget = target.closest<T>(selector)
    
    if (delegateTarget && parent.contains(delegateTarget)) {
      handler(event, delegateTarget)
    }
  }
  
  parent.addEventListener(type, listener)
  return () => parent.removeEventListener(type, listener)
}

/**
 * 创建可取消的事件监听
 */
export function createEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  let isActive = true
  
  const wrappedListener = ((ev: HTMLElementEventMap[K]) => {
    if (isActive) {
      listener(ev)
    }
  }) as EventListener
  
  element.addEventListener(type, wrappedListener, options)
  
  return {
    pause: () => { isActive = false },
    resume: () => { isActive = true },
    remove: () => element.removeEventListener(type, wrappedListener, options)
  }
}

// ==================== 事件工具函数 ====================

/**
 * 阻止默认行为
 */
export function preventDefault(event: Event): void {
  event.preventDefault()
}

/**
 * 阻止事件冒泡
 */
export function stopPropagation(event: Event): void {
  event.stopPropagation()
}

/**
 * 阻止默认行为和冒泡
 */
export function stopEvent(event: Event): void {
  event.preventDefault()
  event.stopPropagation()
}

/**
 * 获取事件坐标（支持鼠标和触摸事件）
 */
export function getEventCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if ('touches' in event) {
    const touch = event.touches[0] || event.changedTouches[0]
    return { x: touch.clientX, y: touch.clientY }
  }
  return { x: event.clientX, y: event.clientY }
}

/**
 * 判断是否为触摸事件
 */
export function isTouchEvent(event: Event): event is TouchEvent {
  return 'touches' in event
}

/**
 * 判断是否为鼠标事件
 */
export function isMouseEvent(event: Event): event is MouseEvent {
  return 'clientX' in event && !('touches' in event)
}

/**
 * 判断是否为键盘事件
 */
export function isKeyboardEvent(event: Event): event is KeyboardEvent {
  return 'key' in event
}

// ==================== 键盘事件工具 ====================

export type KeyModifier = 'ctrl' | 'alt' | 'shift' | 'meta'

export interface KeyBinding {
  key: string
  modifiers?: KeyModifier[]
  handler: (event: KeyboardEvent) => void
}

/**
 * 检查按键是否匹配
 */
export function matchKey(
  event: KeyboardEvent,
  key: string,
  modifiers: KeyModifier[] = []
): boolean {
  // 检查按键
  if (event.key.toLowerCase() !== key.toLowerCase()) {
    return false
  }
  
  // 检查修饰键
  const hasCtrl = modifiers.includes('ctrl')
  const hasAlt = modifiers.includes('alt')
  const hasShift = modifiers.includes('shift')
  const hasMeta = modifiers.includes('meta')
  
  return (
    event.ctrlKey === hasCtrl &&
    event.altKey === hasAlt &&
    event.shiftKey === hasShift &&
    event.metaKey === hasMeta
  )
}

/**
 * 创建键盘快捷键监听器
 */
export function createHotkey(
  bindings: KeyBinding[],
  options: { preventDefault?: boolean } = {}
): () => void {
  const { preventDefault: preventDef = true } = options
  
  const handler = (event: KeyboardEvent) => {
    for (const binding of bindings) {
      if (matchKey(event, binding.key, binding.modifiers)) {
        if (preventDef) {
          event.preventDefault()
        }
        binding.handler(event)
        break
      }
    }
  }
  
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}

/**
 * 解析快捷键字符串
 */
export function parseHotkey(hotkey: string): { key: string; modifiers: KeyModifier[] } {
  const parts = hotkey.toLowerCase().split('+').map(p => p.trim())
  const modifiers: KeyModifier[] = []
  let key = ''
  
  for (const part of parts) {
    if (part === 'ctrl' || part === 'control') {
      modifiers.push('ctrl')
    } else if (part === 'alt' || part === 'option') {
      modifiers.push('alt')
    } else if (part === 'shift') {
      modifiers.push('shift')
    } else if (part === 'meta' || part === 'cmd' || part === 'command') {
      modifiers.push('meta')
    } else {
      key = part
    }
  }
  
  return { key, modifiers }
}

/**
 * 从字符串创建快捷键绑定
 */
export function hotkey(
  combo: string,
  handler: (event: KeyboardEvent) => void
): KeyBinding {
  const { key, modifiers } = parseHotkey(combo)
  return { key, modifiers, handler }
}

// ==================== 鼠标事件工具 ====================

/**
 * 创建拖拽处理器
 */
export function createDragHandler(options: {
  onStart?: (event: MouseEvent | TouchEvent, pos: { x: number; y: number }) => void
  onMove?: (event: MouseEvent | TouchEvent, pos: { x: number; y: number }, delta: { x: number; y: number }) => void
  onEnd?: (event: MouseEvent | TouchEvent, pos: { x: number; y: number }) => void
  threshold?: number
}) {
  const { onStart, onMove, onEnd, threshold = 0 } = options
  
  let isDragging = false
  let startPos = { x: 0, y: 0 }
  let lastPos = { x: 0, y: 0 }
  
  function handleStart(event: MouseEvent | TouchEvent) {
    const pos = getEventCoordinates(event)
    startPos = { ...pos }
    lastPos = { ...pos }
    isDragging = false
    
    if (isTouchEvent(event)) {
      document.addEventListener('touchmove', handleMove, { passive: false })
      document.addEventListener('touchend', handleEnd)
    } else {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleEnd)
    }
  }
  
  function handleMove(event: MouseEvent | TouchEvent) {
    const pos = getEventCoordinates(event)
    
    if (!isDragging) {
      const distance = Math.sqrt(
        Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
      )
      
      if (distance >= threshold) {
        isDragging = true
        onStart?.(event, startPos)
      } else {
        return
      }
    }
    
    const delta = {
      x: pos.x - lastPos.x,
      y: pos.y - lastPos.y
    }
    
    lastPos = { ...pos }
    onMove?.(event, pos, delta)
  }
  
  function handleEnd(event: MouseEvent | TouchEvent) {
    if (isDragging) {
      const pos = getEventCoordinates(event)
      onEnd?.(event, pos)
    }
    
    isDragging = false
    
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }
  
  return handleStart
}

/**
 * 创建双击处理器
 */
export function createDoubleClickHandler(
  handler: (event: MouseEvent) => void,
  delay: number = 300
) {
  let lastClick = 0
  let clickTimeout: number | null = null
  
  return (event: MouseEvent) => {
    const now = Date.now()
    
    if (now - lastClick < delay) {
      if (clickTimeout !== null) {
        clearTimeout(clickTimeout)
        clickTimeout = null
      }
      handler(event)
    }
    
    lastClick = now
  }
}

/**
 * 创建长按处理器
 */
export function createLongPressHandler(
  handler: (event: MouseEvent | TouchEvent) => void,
  duration: number = 500
) {
  let pressTimer: number | null = null
  let triggered = false
  
  const start = (event: MouseEvent | TouchEvent) => {
    triggered = false
    pressTimer = window.setTimeout(() => {
      triggered = true
      handler(event)
    }, duration)
  }
  
  const cancel = () => {
    if (pressTimer !== null) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
  }
  
  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    wasTriggered: () => triggered
  }
}

// ==================== 滚动事件工具 ====================

/**
 * 创建滚动处理器（带节流）
 */
export function createScrollHandler(
  handler: (event: Event, info: {
    scrollTop: number
    scrollLeft: number
    scrollHeight: number
    scrollWidth: number
    clientHeight: number
    clientWidth: number
    isAtTop: boolean
    isAtBottom: boolean
    isAtLeft: boolean
    isAtRight: boolean
    direction: 'up' | 'down' | 'left' | 'right' | null
  }) => void,
  throttle: number = 100
) {
  let lastScrollTop = 0
  let lastScrollLeft = 0
  let lastTime = 0
  
  return (event: Event) => {
    const now = Date.now()
    if (now - lastTime < throttle) return
    lastTime = now
    
    const target = event.target as HTMLElement
    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth
    } = target
    
    let direction: 'up' | 'down' | 'left' | 'right' | null = null
    if (scrollTop > lastScrollTop) direction = 'down'
    else if (scrollTop < lastScrollTop) direction = 'up'
    else if (scrollLeft > lastScrollLeft) direction = 'right'
    else if (scrollLeft < lastScrollLeft) direction = 'left'
    
    lastScrollTop = scrollTop
    lastScrollLeft = scrollLeft
    
    handler(event, {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
      isAtTop: scrollTop === 0,
      isAtBottom: scrollTop + clientHeight >= scrollHeight,
      isAtLeft: scrollLeft === 0,
      isAtRight: scrollLeft + clientWidth >= scrollWidth,
      direction
    })
  }
}

/**
 * 监听元素可见性变化
 */
export function onVisibilityChange(
  element: HTMLElement,
  callback: (isVisible: boolean, entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      callback(entry.isIntersecting, entry)
    })
  }, options)
  
  observer.observe(element)
  
  return () => observer.disconnect()
}

/**
 * 监听元素大小变化
 */
export function onResize(
  element: HTMLElement,
  callback: (entry: ResizeObserverEntry) => void
): () => void {
  const observer = new ResizeObserver((entries) => {
    entries.forEach(entry => callback(entry))
  })
  
  observer.observe(element)
  
  return () => observer.disconnect()
}

export default {
  createEventBus,
  eventBus,
  addEventListener,
  delegate,
  createEventListener,
  preventDefault,
  stopPropagation,
  stopEvent,
  getEventCoordinates,
  isTouchEvent,
  isMouseEvent,
  isKeyboardEvent,
  matchKey,
  createHotkey,
  parseHotkey,
  hotkey,
  createDragHandler,
  createDoubleClickHandler,
  createLongPressHandler,
  createScrollHandler,
  onVisibilityChange,
  onResize
}
