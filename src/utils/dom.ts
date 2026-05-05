/**
 * DOM 操作工具函数
 */

/**
 * 获取元素
 */
export function getElement(selector: string | Element): Element | null {
  if (typeof selector === 'string') {
    return document.querySelector(selector)
  }
  return selector
}

/**
 * 获取所有匹配元素
 */
export function getElements(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector))
}

/**
 * 创建元素
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    className?: string
    id?: string
    textContent?: string
    innerHTML?: string
    attributes?: Record<string, string>
    styles?: Partial<CSSStyleDeclaration>
    children?: (Element | string)[]
  }
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)

  if (options) {
    if (options.className) el.className = options.className
    if (options.id) el.id = options.id
    if (options.textContent) el.textContent = options.textContent
    if (options.innerHTML) el.innerHTML = options.innerHTML
    
    if (options.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        el.setAttribute(key, value)
      }
    }
    
    if (options.styles) {
      Object.assign(el.style, options.styles)
    }
    
    if (options.children) {
      options.children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child))
        } else {
          el.appendChild(child)
        }
      })
    }
  }

  return el
}

/**
 * 添加类名
 */
export function addClass(el: Element, ...classNames: string[]): void {
  el.classList.add(...classNames)
}

/**
 * 移除类名
 */
export function removeClass(el: Element, ...classNames: string[]): void {
  el.classList.remove(...classNames)
}

/**
 * 切换类名
 */
export function toggleClass(el: Element, className: string, force?: boolean): boolean {
  return el.classList.toggle(className, force)
}

/**
 * 是否包含类名
 */
export function hasClass(el: Element, className: string): boolean {
  return el.classList.contains(className)
}

/**
 * 设置属性
 */
export function setAttr(el: Element, name: string, value: string): void {
  el.setAttribute(name, value)
}

/**
 * 获取属性
 */
export function getAttr(el: Element, name: string): string | null {
  return el.getAttribute(name)
}

/**
 * 移除属性
 */
export function removeAttr(el: Element, name: string): void {
  el.removeAttribute(name)
}

/**
 * 设置样式
 */
export function setStyle(
  el: HTMLElement,
  styles: Partial<CSSStyleDeclaration> | string,
  value?: string
): void {
  if (typeof styles === 'string' && value !== undefined) {
    el.style.setProperty(styles, value)
  } else if (typeof styles === 'object') {
    Object.assign(el.style, styles)
  }
}

/**
 * 获取计算样式
 */
export function getStyle(el: Element, property?: string): CSSStyleDeclaration | string {
  const styles = window.getComputedStyle(el)
  if (property) {
    return styles.getPropertyValue(property)
  }
  return styles
}

/**
 * 获取元素尺寸
 */
export function getSize(el: Element): { width: number; height: number } {
  const rect = el.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height
  }
}

/**
 * 获取元素位置
 */
export function getPosition(el: Element): { top: number; left: number; right: number; bottom: number } {
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    right: rect.right + window.scrollX,
    bottom: rect.bottom + window.scrollY
  }
}

/**
 * 获取元素相对视口的位置
 */
export function getViewportPosition(el: Element): DOMRect {
  return el.getBoundingClientRect()
}

/**
 * 获取滚动位置
 */
export function getScrollPosition(el?: Element | Window): { x: number; y: number } {
  if (!el || el === window) {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    }
  }
  const element = el as Element
  return {
    x: element.scrollLeft,
    y: element.scrollTop
  }
}

/**
 * 设置滚动位置
 */
export function setScrollPosition(
  el: Element | Window,
  x: number,
  y: number,
  smooth: boolean = false
): void {
  const options: ScrollToOptions = {
    left: x,
    top: y,
    behavior: smooth ? 'smooth' : 'auto'
  }
  el.scrollTo(options)
}

/**
 * 滚动到元素
 */
export function scrollToElement(
  el: Element,
  options?: {
    behavior?: ScrollBehavior
    block?: ScrollLogicalPosition
    inline?: ScrollLogicalPosition
  }
): void {
  el.scrollIntoView({
    behavior: options?.behavior || 'smooth',
    block: options?.block || 'start',
    inline: options?.inline || 'nearest'
  })
}

/**
 * 滚动到顶部
 */
export function scrollToTop(el?: Element | Window, smooth: boolean = true): void {
  setScrollPosition(el || window, 0, 0, smooth)
}

/**
 * 滚动到底部
 */
export function scrollToBottom(el?: Element | Window, smooth: boolean = true): void {
  if (!el || el === window) {
    const height = document.documentElement.scrollHeight
    setScrollPosition(window, 0, height, smooth)
  } else {
    const element = el as Element
    setScrollPosition(element, 0, element.scrollHeight, smooth)
  }
}

/**
 * 判断元素是否在视口内
 */
export function isInViewport(el: Element, threshold: number = 0): boolean {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= -threshold &&
    rect.left >= -threshold &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + threshold
  )
}

/**
 * 判断元素是否部分可见
 */
export function isPartiallyVisible(el: Element): boolean {
  const rect = el.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth

  const vertInView = rect.top <= windowHeight && rect.bottom >= 0
  const horInView = rect.left <= windowWidth && rect.right >= 0

  return vertInView && horInView
}

/**
 * 获取父元素
 */
export function getParent(el: Element): Element | null {
  return el.parentElement
}

/**
 * 获取所有父元素
 */
export function getParents(el: Element, selector?: string): Element[] {
  const parents: Element[] = []
  let current = el.parentElement

  while (current) {
    if (!selector || current.matches(selector)) {
      parents.push(current)
    }
    current = current.parentElement
  }

  return parents
}

/**
 * 获取最近的匹配祖先元素
 */
export function closest(el: Element, selector: string): Element | null {
  return el.closest(selector)
}

/**
 * 获取子元素
 */
export function getChildren(el: Element, selector?: string): Element[] {
  if (selector) {
    return Array.from(el.querySelectorAll(`:scope > ${selector}`))
  }
  return Array.from(el.children)
}

/**
 * 获取兄弟元素
 */
export function getSiblings(el: Element): Element[] {
  if (!el.parentElement) return []
  return Array.from(el.parentElement.children).filter(child => child !== el)
}

/**
 * 获取上一个兄弟元素
 */
export function getPreviousSibling(el: Element, selector?: string): Element | null {
  let sibling = el.previousElementSibling

  if (!selector) return sibling

  while (sibling) {
    if (sibling.matches(selector)) return sibling
    sibling = sibling.previousElementSibling
  }

  return null
}

/**
 * 获取下一个兄弟元素
 */
export function getNextSibling(el: Element, selector?: string): Element | null {
  let sibling = el.nextElementSibling

  if (!selector) return sibling

  while (sibling) {
    if (sibling.matches(selector)) return sibling
    sibling = sibling.nextElementSibling
  }

  return null
}

/**
 * 插入元素到指定位置
 */
export function insertElement(
  parent: Element,
  el: Element,
  position: 'first' | 'last' | 'before' | 'after',
  reference?: Element
): void {
  switch (position) {
    case 'first':
      parent.insertBefore(el, parent.firstChild)
      break
    case 'last':
      parent.appendChild(el)
      break
    case 'before':
      if (reference) {
        reference.parentElement?.insertBefore(el, reference)
      }
      break
    case 'after':
      if (reference) {
        reference.parentElement?.insertBefore(el, reference.nextSibling)
      }
      break
  }
}

/**
 * 移除元素
 */
export function removeElement(el: Element): void {
  el.remove()
}

/**
 * 替换元素
 */
export function replaceElement(oldEl: Element, newEl: Element): void {
  oldEl.replaceWith(newEl)
}

/**
 * 克隆元素
 */
export function cloneElement<T extends Element>(el: T, deep: boolean = true): T {
  return el.cloneNode(deep) as T
}

/**
 * 清空元素内容
 */
export function clearElement(el: Element): void {
  el.innerHTML = ''
}

/**
 * 显示元素
 */
export function showElement(el: HTMLElement, display: string = 'block'): void {
  el.style.display = display
}

/**
 * 隐藏元素
 */
export function hideElement(el: HTMLElement): void {
  el.style.display = 'none'
}

/**
 * 切换元素显示状态
 */
export function toggleElement(el: HTMLElement, display: string = 'block'): void {
  if (el.style.display === 'none') {
    el.style.display = display
  } else {
    el.style.display = 'none'
  }
}

/**
 * 判断元素是否可见
 */
export function isVisible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
}

/**
 * 获取焦点元素
 */
export function getFocusedElement(): Element | null {
  return document.activeElement
}

/**
 * 设置焦点
 */
export function focus(el: HTMLElement): void {
  el.focus()
}

/**
 * 移除焦点
 */
export function blur(el: HTMLElement): void {
  el.blur()
}

/**
 * 获取文档滚动高度
 */
export function getDocumentHeight(): number {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  )
}

/**
 * 获取视口尺寸
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight
  }
}

/**
 * 添加事件监听
 */
export function on<K extends keyof HTMLElementEventMap>(
  el: Element | Window | Document,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  el.addEventListener(event, handler as EventListener, options)
  return () => el.removeEventListener(event, handler as EventListener, options)
}

/**
 * 移除事件监听
 */
export function off<K extends keyof HTMLElementEventMap>(
  el: Element | Window | Document,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: boolean | EventListenerOptions
): void {
  el.removeEventListener(event, handler as EventListener, options)
}

/**
 * 一次性事件监听
 */
export function once<K extends keyof HTMLElementEventMap>(
  el: Element | Window | Document,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void
): void {
  const wrapper = (e: Event) => {
    handler(e as HTMLElementEventMap[K])
    el.removeEventListener(event, wrapper)
  }
  el.addEventListener(event, wrapper)
}

/**
 * 委托事件
 */
export function delegate<K extends keyof HTMLElementEventMap>(
  parent: Element,
  selector: string,
  event: K,
  handler: (e: HTMLElementEventMap[K], target: Element) => void
): () => void {
  const wrapper = (e: Event) => {
    const target = (e.target as Element).closest(selector)
    if (target && parent.contains(target)) {
      handler(e as HTMLElementEventMap[K], target)
    }
  }
  parent.addEventListener(event, wrapper)
  return () => parent.removeEventListener(event, wrapper)
}

/**
 * 触发事件
 */
export function trigger(el: Element, eventName: string, detail?: any): void {
  const event = new CustomEvent(eventName, {
    bubbles: true,
    cancelable: true,
    detail
  })
  el.dispatchEvent(event)
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // 降级方案
    const textarea = createElement('textarea', {
      styles: {
        position: 'fixed',
        opacity: '0'
      }
    })
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  } catch {
    return false
  }
}

/**
 * 从剪贴板读取文本
 */
export async function readFromClipboard(): Promise<string> {
  try {
    if (navigator.clipboard) {
      return await navigator.clipboard.readText()
    }
    return ''
  } catch {
    return ''
  }
}

/**
 * 获取选中文本
 */
export function getSelectedText(): string {
  const selection = window.getSelection()
  return selection ? selection.toString() : ''
}

/**
 * 下载文件
 */
export function downloadFile(url: string, filename: string): void {
  const link = createElement('a', {
    attributes: {
      href: url,
      download: filename
    }
  })
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 打印元素
 */
export function printElement(el: Element): void {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>打印</title>
          <style>
            body { margin: 0; padding: 20px; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }
}

export default {
  getElement,
  getElements,
  createElement,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setAttr,
  getAttr,
  removeAttr,
  setStyle,
  getStyle,
  getSize,
  getPosition,
  getViewportPosition,
  getScrollPosition,
  setScrollPosition,
  scrollToElement,
  scrollToTop,
  scrollToBottom,
  isInViewport,
  isPartiallyVisible,
  getParent,
  getParents,
  closest,
  getChildren,
  getSiblings,
  getPreviousSibling,
  getNextSibling,
  insertElement,
  removeElement,
  replaceElement,
  cloneElement,
  clearElement,
  showElement,
  hideElement,
  toggleElement,
  isVisible,
  getFocusedElement,
  focus,
  blur,
  getDocumentHeight,
  getViewportSize,
  on,
  off,
  once,
  delegate,
  trigger,
  copyToClipboard,
  readFromClipboard,
  getSelectedText,
  downloadFile,
  printElement
}
