/**
 * 响应式断点工具
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

// 默认断点配置
export const defaultBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
}

export type BreakpointKey = keyof typeof defaultBreakpoints

/**
 * 获取当前断点
 */
export function getCurrentBreakpoint(
  breakpoints: Record<string, number> = defaultBreakpoints
): string {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0
  const entries = Object.entries(breakpoints).sort((a, b) => b[1] - a[1])
  
  for (const [key, value] of entries) {
    if (width >= value) {
      return key
    }
  }
  
  return entries[entries.length - 1][0]
}

/**
 * 检查是否匹配断点
 */
export function matchBreakpoint(
  breakpoint: BreakpointKey,
  breakpoints: Record<string, number> = defaultBreakpoints
): boolean {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0
  return width >= (breakpoints[breakpoint] || 0)
}

/**
 * 检查是否在断点范围内
 */
export function inBreakpointRange(
  min: BreakpointKey,
  max: BreakpointKey,
  breakpoints: Record<string, number> = defaultBreakpoints
): boolean {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0
  const minValue = breakpoints[min] || 0
  const maxValue = breakpoints[max] || Infinity
  
  const keys = Object.keys(breakpoints)
  const maxIndex = keys.indexOf(max)
  const nextKey = keys[maxIndex + 1]
  const nextValue = nextKey ? breakpoints[nextKey] : Infinity
  
  return width >= minValue && width < nextValue
}

/**
 * 媒体查询匹配
 */
export function matchMedia(query: string): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

/**
 * 生成媒体查询字符串
 */
export function generateMediaQuery(
  breakpoint: BreakpointKey,
  type: 'up' | 'down' | 'only' = 'up',
  breakpoints: Record<string, number> = defaultBreakpoints
): string {
  const keys = Object.keys(breakpoints)
  const index = keys.indexOf(breakpoint)
  const value = breakpoints[breakpoint]
  
  switch (type) {
    case 'up':
      return `(min-width: ${value}px)`
    case 'down':
      return `(max-width: ${value - 0.02}px)`
    case 'only': {
      const nextKey = keys[index + 1]
      const nextValue = nextKey ? breakpoints[nextKey] : null
      
      if (nextValue) {
        return `(min-width: ${value}px) and (max-width: ${nextValue - 0.02}px)`
      }
      return `(min-width: ${value}px)`
    }
    default:
      return ''
  }
}

/**
 * 响应式断点 Hook
 */
export function useBreakpoint(
  breakpoints: Record<string, number> = defaultBreakpoints
) {
  const current = ref(getCurrentBreakpoint(breakpoints))
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
  const height = ref(typeof window !== 'undefined' ? window.innerHeight : 0)
  
  // 便捷的断点判断
  const xs = computed(() => matchBreakpoint('xs', breakpoints))
  const sm = computed(() => matchBreakpoint('sm', breakpoints))
  const md = computed(() => matchBreakpoint('md', breakpoints))
  const lg = computed(() => matchBreakpoint('lg', breakpoints))
  const xl = computed(() => matchBreakpoint('xl', breakpoints))
  const xxl = computed(() => matchBreakpoint('xxl', breakpoints))
  
  // 设备类型判断
  const isMobile = computed(() => !md.value)
  const isTablet = computed(() => md.value && !lg.value)
  const isDesktop = computed(() => lg.value)
  
  function updateSize() {
    width.value = window.innerWidth
    height.value = window.innerHeight
    current.value = getCurrentBreakpoint(breakpoints)
  }
  
  onMounted(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })
  
  return {
    current,
    width,
    height,
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
    isMobile,
    isTablet,
    isDesktop,
    match: (bp: BreakpointKey) => matchBreakpoint(bp, breakpoints),
    inRange: (min: BreakpointKey, max: BreakpointKey) => inBreakpointRange(min, max, breakpoints)
  }
}

/**
 * 媒体查询 Hook
 */
export function useMediaQuery(query: string) {
  const matches = ref(matchMedia(query))
  
  function handleChange(e: MediaQueryListEvent) {
    matches.value = e.matches
  }
  
  onMounted(() => {
    const mql = window.matchMedia(query)
    matches.value = mql.matches
    
    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange)
    } else {
      // 兼容旧版浏览器
      mql.addListener(handleChange)
    }
  })
  
  onUnmounted(() => {
    const mql = window.matchMedia(query)
    
    if (mql.removeEventListener) {
      mql.removeEventListener('change', handleChange)
    } else {
      mql.removeListener(handleChange)
    }
  })
  
  return matches
}

/**
 * 偏好设置检测
 */
export function usePreferences() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const prefersLight = useMediaQuery('(prefers-color-scheme: light)')
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)')
  
  return {
    prefersReducedMotion,
    prefersDark,
    prefersLight,
    prefersHighContrast
  }
}

/**
 * 元素尺寸观察 Hook
 */
export function useElementSize(target: () => HTMLElement | null) {
  const width = ref(0)
  const height = ref(0)
  
  let observer: ResizeObserver | null = null
  
  function updateSize(element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    width.value = rect.width
    height.value = rect.height
  }
  
  onMounted(() => {
    const element = target()
    if (!element) return
    
    updateSize(element)
    
    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          width.value = entry.contentRect.width
          height.value = entry.contentRect.height
        }
      }
    })
    
    observer.observe(element)
  })
  
  onUnmounted(() => {
    observer?.disconnect()
  })
  
  return { width, height }
}

/**
 * 窗口尺寸 Hook
 */
export function useWindowSize() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
  const height = ref(typeof window !== 'undefined' ? window.innerHeight : 0)
  
  function updateSize() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }
  
  onMounted(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })
  
  return { width, height }
}

/**
 * 响应式值选择器
 */
export function responsiveValue<T>(
  values: Partial<Record<BreakpointKey, T>>,
  defaultValue: T,
  breakpoints: Record<string, number> = defaultBreakpoints
): T {
  const current = getCurrentBreakpoint(breakpoints)
  const keys = Object.keys(breakpoints) as BreakpointKey[]
  const currentIndex = keys.indexOf(current as BreakpointKey)
  
  // 从当前断点向下查找
  for (let i = currentIndex; i >= 0; i--) {
    const key = keys[i]
    if (values[key] !== undefined) {
      return values[key]!
    }
  }
  
  return defaultValue
}

/**
 * 响应式值 Hook
 */
export function useResponsiveValue<T>(
  values: Partial<Record<BreakpointKey, T>>,
  defaultValue: T,
  breakpoints: Record<string, number> = defaultBreakpoints
) {
  const { current } = useBreakpoint(breakpoints)
  
  return computed(() => {
    const keys = Object.keys(breakpoints) as BreakpointKey[]
    const currentIndex = keys.indexOf(current.value as BreakpointKey)
    
    for (let i = currentIndex; i >= 0; i--) {
      const key = keys[i]
      if (values[key] !== undefined) {
        return values[key]!
      }
    }
    
    return defaultValue
  })
}

/**
 * 网格列数计算
 */
export function getGridColumns(
  columns: number | Partial<Record<BreakpointKey, number>>,
  breakpoints: Record<string, number> = defaultBreakpoints
): number {
  if (typeof columns === 'number') {
    return columns
  }
  
  return responsiveValue(columns, 1, breakpoints)
}

/**
 * 间距计算
 */
export function getSpacing(
  spacing: number | string | Partial<Record<BreakpointKey, number | string>>,
  breakpoints: Record<string, number> = defaultBreakpoints
): string {
  if (typeof spacing === 'number') {
    return `${spacing}px`
  }
  
  if (typeof spacing === 'string') {
    return spacing
  }
  
  const value = responsiveValue(spacing, 0, breakpoints)
  return typeof value === 'number' ? `${value}px` : value
}
