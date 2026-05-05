/**
 * 滚动工具函数
 */

export interface ScrollOptions {
  // 滚动行为
  behavior?: ScrollBehavior
  // 滚动偏移
  offset?: number
  // 滚动容器
  container?: HTMLElement | Window
}

/**
 * 获取滚动位置
 */
export function getScrollPosition(container: HTMLElement | Window = window): {
  x: number
  y: number
} {
  if (container === window) {
    return {
      x: window.scrollX || document.documentElement.scrollLeft,
      y: window.scrollY || document.documentElement.scrollTop
    }
  }
  
  const el = container as HTMLElement
  return {
    x: el.scrollLeft,
    y: el.scrollTop
  }
}

/**
 * 设置滚动位置
 */
export function setScrollPosition(
  x: number,
  y: number,
  options: ScrollOptions = {}
): void {
  const { behavior = 'auto', container = window } = options
  
  if (container === window) {
    window.scrollTo({ left: x, top: y, behavior })
  } else {
    (container as HTMLElement).scrollTo({ left: x, top: y, behavior })
  }
}

/**
 * 滚动到顶部
 */
export function scrollToTop(options: ScrollOptions = {}): void {
  const { behavior = 'smooth', container = window } = options
  setScrollPosition(0, 0, { behavior, container })
}

/**
 * 滚动到底部
 */
export function scrollToBottom(options: ScrollOptions = {}): void {
  const { behavior = 'smooth', container = window } = options
  
  let scrollHeight: number
  
  if (container === window) {
    scrollHeight = document.documentElement.scrollHeight
  } else {
    scrollHeight = (container as HTMLElement).scrollHeight
  }
  
  setScrollPosition(0, scrollHeight, { behavior, container })
}

/**
 * 滚动到元素
 */
export function scrollToElement(
  element: HTMLElement | string,
  options: ScrollOptions = {}
): void {
  const { behavior = 'smooth', offset = 0, container = window } = options
  
  const el = typeof element === 'string' 
    ? document.querySelector<HTMLElement>(element) 
    : element
  
  if (!el) return
  
  const rect = el.getBoundingClientRect()
  const currentScroll = getScrollPosition(container)
  
  let targetY: number
  
  if (container === window) {
    targetY = currentScroll.y + rect.top - offset
  } else {
    const containerRect = (container as HTMLElement).getBoundingClientRect()
    targetY = currentScroll.y + rect.top - containerRect.top - offset
  }
  
  setScrollPosition(currentScroll.x, targetY, { behavior, container })
}

/**
 * 滚动到锚点
 */
export function scrollToAnchor(
  anchor: string,
  options: ScrollOptions = {}
): void {
  const id = anchor.startsWith('#') ? anchor.slice(1) : anchor
  const el = document.getElementById(id)
  
  if (el) {
    scrollToElement(el, options)
  }
}

/**
 * 平滑滚动到指定位置
 */
export function smoothScrollTo(
  targetY: number,
  duration: number = 500,
  container: HTMLElement | Window = window
): Promise<void> {
  return new Promise(resolve => {
    const start = getScrollPosition(container).y
    const distance = targetY - start
    const startTime = performance.now()
    
    function easeInOutCubic(t: number): number {
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2
    }
    
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = easeInOutCubic(progress)
      
      const currentY = start + distance * easeProgress
      
      if (container === window) {
        window.scrollTo(0, currentY)
      } else {
        (container as HTMLElement).scrollTop = currentY
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        resolve()
      }
    }
    
    requestAnimationFrame(animate)
  })
}

/**
 * 获取滚动方向
 */
export function createScrollDirectionDetector(
  callback: (direction: 'up' | 'down') => void,
  threshold: number = 10
): { start: () => void; stop: () => void } {
  let lastScrollY = 0
  let ticking = false
  
  function handleScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const diff = currentScrollY - lastScrollY
        
        if (Math.abs(diff) > threshold) {
          callback(diff > 0 ? 'down' : 'up')
          lastScrollY = currentScrollY
        }
        
        ticking = false
      })
      
      ticking = true
    }
  }
  
  return {
    start() {
      lastScrollY = window.scrollY
      window.addEventListener('scroll', handleScroll, { passive: true })
    },
    stop() {
      window.removeEventListener('scroll', handleScroll)
    }
  }
}

/**
 * 监听滚动到底部
 */
export function onScrollToBottom(
  callback: () => void,
  options: {
    threshold?: number
    container?: HTMLElement | Window
  } = {}
): () => void {
  const { threshold = 100, container = window } = options
  
  function handleScroll() {
    let scrollTop: number
    let scrollHeight: number
    let clientHeight: number
    
    if (container === window) {
      scrollTop = window.scrollY
      scrollHeight = document.documentElement.scrollHeight
      clientHeight = window.innerHeight
    } else {
      const el = container as HTMLElement
      scrollTop = el.scrollTop
      scrollHeight = el.scrollHeight
      clientHeight = el.clientHeight
    }
    
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      callback()
    }
  }
  
  const target = container === window ? window : container
  target.addEventListener('scroll', handleScroll, { passive: true })
  
  return () => {
    target.removeEventListener('scroll', handleScroll)
  }
}

/**
 * 监听滚动到顶部
 */
export function onScrollToTop(
  callback: () => void,
  options: {
    threshold?: number
    container?: HTMLElement | Window
  } = {}
): () => void {
  const { threshold = 100, container = window } = options
  
  function handleScroll() {
    const scrollTop = container === window 
      ? window.scrollY 
      : (container as HTMLElement).scrollTop
    
    if (scrollTop < threshold) {
      callback()
    }
  }
  
  const target = container === window ? window : container
  target.addEventListener('scroll', handleScroll, { passive: true })
  
  return () => {
    target.removeEventListener('scroll', handleScroll)
  }
}

/**
 * 锁定滚动
 */
export function lockScroll(): () => void {
  const scrollY = window.scrollY
  const body = document.body
  const originalStyle = {
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    overflow: body.style.overflow
  }
  
  body.style.position = 'fixed'
  body.style.top = `-${scrollY}px`
  body.style.width = '100%'
  body.style.overflow = 'hidden'
  
  return () => {
    body.style.position = originalStyle.position
    body.style.top = originalStyle.top
    body.style.width = originalStyle.width
    body.style.overflow = originalStyle.overflow
    window.scrollTo(0, scrollY)
  }
}

/**
 * 获取元素在视口中的可见性
 */
export function getElementVisibility(element: HTMLElement): {
  visible: boolean
  ratio: number
  top: boolean
  bottom: boolean
  left: boolean
  right: boolean
} {
  const rect = element.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0)
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
  
  const visibleArea = Math.max(0, visibleWidth) * Math.max(0, visibleHeight)
  const totalArea = rect.width * rect.height
  
  const ratio = totalArea > 0 ? visibleArea / totalArea : 0
  
  return {
    visible: ratio > 0,
    ratio,
    top: rect.top >= 0,
    bottom: rect.bottom <= viewportHeight,
    left: rect.left >= 0,
    right: rect.right <= viewportWidth
  }
}

/**
 * 判断元素是否在视口中
 */
export function isElementInViewport(
  element: HTMLElement,
  threshold: number = 0
): boolean {
  const rect = element.getBoundingClientRect()
  
  return (
    rect.top < window.innerHeight + threshold &&
    rect.bottom > -threshold &&
    rect.left < window.innerWidth + threshold &&
    rect.right > -threshold
  )
}

/**
 * 使用 Intersection Observer 监听元素可见性
 */
export function observeVisibility(
  element: HTMLElement,
  callback: (isVisible: boolean, entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      callback(entry.isIntersecting, entry)
    })
  }, options)
  
  observer.observe(element)
  
  return () => {
    observer.disconnect()
  }
}

/**
 * 滚动进度
 */
export function getScrollProgress(container: HTMLElement | Window = window): number {
  if (container === window) {
    const scrollTop = window.scrollY
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    return scrollHeight > 0 ? scrollTop / scrollHeight : 0
  }
  
  const el = container as HTMLElement
  const scrollHeight = el.scrollHeight - el.clientHeight
  return scrollHeight > 0 ? el.scrollTop / scrollHeight : 0
}

/**
 * 监听滚动进度
 */
export function onScrollProgress(
  callback: (progress: number) => void,
  container: HTMLElement | Window = window
): () => void {
  let ticking = false
  
  function handleScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(getScrollProgress(container))
        ticking = false
      })
      ticking = true
    }
  }
  
  const target = container === window ? window : container
  target.addEventListener('scroll', handleScroll, { passive: true })
  
  // 立即调用一次
  callback(getScrollProgress(container))
  
  return () => {
    target.removeEventListener('scroll', handleScroll)
  }
}
