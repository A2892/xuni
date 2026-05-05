/**
 * 设备检测工具函数
 */

/**
 * 用户代理信息
 */
const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : ''

/**
 * 检测是否为移动设备
 */
export function isMobile(): boolean {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
}

/**
 * 检测是否为平板设备
 */
export function isTablet(): boolean {
  return /ipad|android(?!.*mobile)/i.test(ua)
}

/**
 * 检测是否为桌面设备
 */
export function isDesktop(): boolean {
  return !isMobile() && !isTablet()
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 操作系统类型
 */
export type OSType = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown'

/**
 * 获取操作系统类型
 */
export function getOS(): OSType {
  if (/windows|win32|win64/i.test(ua)) return 'windows'
  if (/macintosh|mac os x/i.test(ua)) return 'macos'
  if (/linux/i.test(ua) && !/android/i.test(ua)) return 'linux'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'unknown'
}

/**
 * 浏览器类型
 */
export type BrowserType = 
  | 'chrome' 
  | 'firefox' 
  | 'safari' 
  | 'edge' 
  | 'opera' 
  | 'ie' 
  | 'wechat'
  | 'qq'
  | 'weibo'
  | 'unknown'

/**
 * 获取浏览器类型
 */
export function getBrowser(): BrowserType {
  // 微信浏览器
  if (/micromessenger/i.test(ua)) return 'wechat'
  // QQ 浏览器
  if (/qq/i.test(ua) && !/mqqbrowser/i.test(ua)) return 'qq'
  // 微博
  if (/weibo/i.test(ua)) return 'weibo'
  // Edge (新版基于 Chromium)
  if (/edg/i.test(ua)) return 'edge'
  // Opera
  if (/opr|opera/i.test(ua)) return 'opera'
  // Chrome
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'chrome'
  // Firefox
  if (/firefox/i.test(ua)) return 'firefox'
  // Safari
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'safari'
  // IE
  if (/msie|trident/i.test(ua)) return 'ie'
  
  return 'unknown'
}

/**
 * 获取浏览器版本
 */
export function getBrowserVersion(): string {
  const browser = getBrowser()
  let match: RegExpMatchArray | null = null
  
  switch (browser) {
    case 'chrome':
      match = ua.match(/chrome\/(\d+(\.\d+)?)/i)
      break
    case 'firefox':
      match = ua.match(/firefox\/(\d+(\.\d+)?)/i)
      break
    case 'safari':
      match = ua.match(/version\/(\d+(\.\d+)?)/i)
      break
    case 'edge':
      match = ua.match(/edg\/(\d+(\.\d+)?)/i)
      break
    case 'opera':
      match = ua.match(/opr\/(\d+(\.\d+)?)/i)
      break
    case 'ie':
      match = ua.match(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      break
  }
  
  return match ? match[1] : 'unknown'
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  os: OSType
  browser: BrowserType
  browserVersion: string
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  language: string
  languages: readonly string[]
  online: boolean
  cookieEnabled: boolean
  doNotTrack: boolean
  colorDepth: number
  orientation: 'portrait' | 'landscape'
}

/**
 * 获取完整设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      os: 'unknown',
      browser: 'unknown',
      browserVersion: 'unknown',
      screenWidth: 0,
      screenHeight: 0,
      pixelRatio: 1,
      language: 'en',
      languages: ['en'],
      online: true,
      cookieEnabled: true,
      doNotTrack: false,
      colorDepth: 24,
      orientation: 'landscape'
    }
  }
  
  return {
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    isTouchDevice: isTouchDevice(),
    os: getOS(),
    browser: getBrowser(),
    browserVersion: getBrowserVersion(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    language: navigator.language,
    languages: navigator.languages,
    online: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',
    colorDepth: window.screen.colorDepth,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  }
}

/**
 * 检测是否为 iOS
 */
export function isIOS(): boolean {
  return getOS() === 'ios'
}

/**
 * 检测是否为 Android
 */
export function isAndroid(): boolean {
  return getOS() === 'android'
}

/**
 * 检测是否为 Windows
 */
export function isWindows(): boolean {
  return getOS() === 'windows'
}

/**
 * 检测是否为 macOS
 */
export function isMacOS(): boolean {
  return getOS() === 'macos'
}

/**
 * 检测是否为 Linux
 */
export function isLinux(): boolean {
  return getOS() === 'linux'
}

/**
 * 检测是否为微信浏览器
 */
export function isWechat(): boolean {
  return getBrowser() === 'wechat'
}

/**
 * 检测是否支持 WebP
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * 检测是否支持 AVIF
 */
export function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image()
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2)
    }
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgADlAgIGkyCR/wAABAAACvcA=='
  })
}

/**
 * 检测是否支持 Service Worker
 */
export function supportsServiceWorker(): boolean {
  return 'serviceWorker' in navigator
}

/**
 * 检测是否支持 PWA
 */
export function supportsPWA(): boolean {
  return supportsServiceWorker() && 'BeforeInstallPromptEvent' in window
}

/**
 * 检测是否支持通知
 */
export function supportsNotifications(): boolean {
  return 'Notification' in window
}

/**
 * 检测是否支持地理位置
 */
export function supportsGeolocation(): boolean {
  return 'geolocation' in navigator
}

/**
 * 检测是否支持本地存储
 */
export function supportsLocalStorage(): boolean {
  try {
    const key = '__test__'
    localStorage.setItem(key, key)
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * 检测是否支持 IndexedDB
 */
export function supportsIndexedDB(): boolean {
  return 'indexedDB' in window
}

/**
 * 检测是否支持 WebGL
 */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * 检测是否支持 WebGL2
 */
export function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'))
  } catch {
    return false
  }
}

/**
 * 检测是否支持 WebRTC
 */
export function supportsWebRTC(): boolean {
  return !!(
    window.RTCPeerConnection ||
    (window as any).mozRTCPeerConnection ||
    (window as any).webkitRTCPeerConnection
  )
}

/**
 * 检测是否支持 Web Workers
 */
export function supportsWebWorkers(): boolean {
  return typeof Worker !== 'undefined'
}

/**
 * 检测是否支持 SharedArrayBuffer
 */
export function supportsSharedArrayBuffer(): boolean {
  return typeof SharedArrayBuffer !== 'undefined'
}

/**
 * 检测是否为 Retina/高 DPI 显示屏
 */
export function isRetina(): boolean {
  if (typeof window === 'undefined') return false
  return window.devicePixelRatio > 1
}

/**
 * 获取屏幕类型
 */
export type ScreenType = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'large'

export function getScreenType(): ScreenType {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  
  if (width < 576) return 'mobile'
  if (width < 768) return 'tablet'
  if (width < 992) return 'laptop'
  if (width < 1200) return 'desktop'
  return 'large'
}

/**
 * 监听网络状态变化
 */
export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

/**
 * 监听屏幕方向变化
 */
export function onOrientationChange(
  callback: (orientation: 'portrait' | 'landscape') => void
): () => void {
  const handleChange = () => {
    callback(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
  }
  
  window.addEventListener('resize', handleChange)
  window.addEventListener('orientationchange', handleChange)
  
  return () => {
    window.removeEventListener('resize', handleChange)
    window.removeEventListener('orientationchange', handleChange)
  }
}

/**
 * 获取电池信息（如果支持）
 */
export interface BatteryInfo {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
}

export async function getBatteryInfo(): Promise<BatteryInfo | null> {
  try {
    if (!('getBattery' in navigator)) return null
    
    const battery = await (navigator as any).getBattery()
    return {
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
      level: battery.level
    }
  } catch {
    return null
  }
}

/**
 * 获取网络信息（如果支持）
 */
export interface NetworkInfo {
  type: string
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

export function getNetworkInfo(): NetworkInfo | null {
  const connection = (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection
  
  if (!connection) return null
  
  return {
    type: connection.type || 'unknown',
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false
  }
}

/**
 * 获取内存信息（如果支持）
 */
export interface MemoryInfo {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

export function getMemoryInfo(): MemoryInfo | null {
  const memory = (performance as any).memory
  
  if (!memory) return null
  
  return {
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    totalJSHeapSize: memory.totalJSHeapSize,
    usedJSHeapSize: memory.usedJSHeapSize
  }
}

/**
 * 检测是否处于暗色模式
 */
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * 监听暗色模式变化
 */
export function onDarkModeChange(callback: (isDark: boolean) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handler = (e: MediaQueryListEvent) => callback(e.matches)
  
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  } else {
    // 兼容旧版本
    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }
}

/**
 * 检测是否处于减少动画模式
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Vue 3 Composable: useDevice
 */
export function useDevice() {
  return {
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    isTouchDevice: isTouchDevice(),
    os: getOS(),
    browser: getBrowser(),
    browserVersion: getBrowserVersion(),
    screenType: getScreenType(),
    isRetina: isRetina(),
    isDarkMode: isDarkMode(),
    prefersReducedMotion: prefersReducedMotion(),
    getDeviceInfo,
    onNetworkChange,
    onOrientationChange,
    onDarkModeChange
  }
}
