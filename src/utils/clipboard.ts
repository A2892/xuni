/**
 * 剪贴板工具函数
 */

/**
 * 复制文本到剪贴板
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // 降级方案
    return copyTextFallback(text)
  } catch (error) {
    console.error('复制失败:', error)
    return copyTextFallback(text)
  }
}

/**
 * 降级复制方案
 */
function copyTextFallback(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)
  
  try {
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)
    const success = document.execCommand('copy')
    return success
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

/**
 * 读取剪贴板文本
 */
export async function readText(): Promise<string | null> {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText()
    }
    return null
  } catch (error) {
    console.error('读取剪贴板失败:', error)
    return null
  }
}

/**
 * 复制 HTML 到剪贴板
 */
export async function copyHTML(html: string, fallbackText?: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      const blob = new Blob([html], { type: 'text/html' })
      const textBlob = new Blob([fallbackText || stripHTML(html)], { type: 'text/plain' })
      
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': textBlob
        })
      ])
      return true
    }
    
    // 降级为纯文本复制
    return copyText(fallbackText || stripHTML(html))
  } catch (error) {
    console.error('复制 HTML 失败:', error)
    return false
  }
}

/**
 * 去除 HTML 标签
 */
function stripHTML(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * 复制图片到剪贴板
 */
export async function copyImage(imageUrl: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      console.error('浏览器不支持复制图片')
      return false
    }
    
    // 获取图片 Blob
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    // 确保是 PNG 格式（剪贴板要求）
    let pngBlob = blob
    if (blob.type !== 'image/png') {
      pngBlob = await convertToPNG(blob)
    }
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': pngBlob
      })
    ])
    
    return true
  } catch (error) {
    console.error('复制图片失败:', error)
    return false
  }
}

/**
 * 将图片转换为 PNG
 */
async function convertToPNG(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法创建 canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          resolve(pngBlob)
        } else {
          reject(new Error('转换 PNG 失败'))
        }
      }, 'image/png')
    }
    
    img.onerror = () => reject(new Error('加载图片失败'))
    img.src = URL.createObjectURL(blob)
  })
}

/**
 * 从 Canvas 复制图片
 */
export async function copyCanvas(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false)
          return
        }
        
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ])
          resolve(true)
        } catch {
          resolve(false)
        }
      }, 'image/png')
    })
  } catch (error) {
    console.error('复制 Canvas 失败:', error)
    return false
  }
}

/**
 * 读取剪贴板图片
 */
export async function readImage(): Promise<Blob | null> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      return null
    }
    
    const items = await navigator.clipboard.read()
    
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          return await item.getType(type)
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('读取剪贴板图片失败:', error)
    return null
  }
}

/**
 * 监听粘贴事件
 */
export function onPaste(
  handler: (data: ClipboardData) => void,
  options: {
    element?: HTMLElement
    preventDefault?: boolean
  } = {}
): () => void {
  const { element = document, preventDefault = true } = options
  
  const handlePaste = async (e: ClipboardEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }
    
    const data: ClipboardData = {
      text: null,
      html: null,
      files: [],
      items: []
    }
    
    if (e.clipboardData) {
      // 获取文本
      data.text = e.clipboardData.getData('text/plain') || null
      data.html = e.clipboardData.getData('text/html') || null
      
      // 获取文件
      if (e.clipboardData.files.length > 0) {
        data.files = Array.from(e.clipboardData.files)
      }
      
      // 获取所有项
      if (e.clipboardData.items) {
        data.items = Array.from(e.clipboardData.items)
      }
    }
    
    handler(data)
  }
  
  element.addEventListener('paste', handlePaste as EventListener)
  
  return () => {
    element.removeEventListener('paste', handlePaste as EventListener)
  }
}

/**
 * 剪贴板数据类型
 */
export interface ClipboardData {
  text: string | null
  html: string | null
  files: File[]
  items: DataTransferItem[]
}

/**
 * 复制 JSON 数据
 */
export async function copyJSON(data: any, pretty = false): Promise<boolean> {
  const text = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
  return copyText(text)
}

/**
 * 读取剪贴板并尝试解析为 JSON
 */
export async function readJSON<T = any>(): Promise<T | null> {
  const text = await readText()
  if (!text) return null
  
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * 复制表格数据（TSV 格式，可粘贴到 Excel）
 */
export function copyTableData(data: (string | number)[][]): Promise<boolean> {
  const tsv = data.map(row => row.join('\t')).join('\n')
  return copyText(tsv)
}

/**
 * 复制带格式的文本（支持 Markdown）
 */
export async function copyRichText(markdown: string): Promise<boolean> {
  // 简单的 Markdown 转 HTML
  const html = markdownToHTML(markdown)
  return copyHTML(html, markdown)
}

/**
 * 简单的 Markdown 转 HTML
 */
function markdownToHTML(markdown: string): string {
  return markdown
    // 标题
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 加粗
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 代码
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // 链接
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    // 换行
    .replace(/\n/g, '<br>')
}

/**
 * 检查剪贴板 API 是否可用
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText)
}

/**
 * 检查是否支持复制图片
 */
export function isImageCopySupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.write)
}

/**
 * 检查是否支持读取剪贴板
 */
export function isReadSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.read)
}

/**
 * 创建复制按钮功能
 */
export function createCopyButton(
  button: HTMLElement,
  getText: () => string,
  options: {
    successText?: string
    errorText?: string
    duration?: number
    onSuccess?: () => void
    onError?: (error: Error) => void
  } = {}
): () => void {
  const {
    successText = '已复制',
    errorText = '复制失败',
    duration = 2000,
    onSuccess,
    onError
  } = options
  
  const originalText = button.textContent
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  const handleClick = async () => {
    const text = getText()
    const success = await copyText(text)
    
    if (success) {
      button.textContent = successText
      button.classList.add('copy-success')
      onSuccess?.()
    } else {
      button.textContent = errorText
      button.classList.add('copy-error')
      onError?.(new Error('复制失败'))
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      button.textContent = originalText
      button.classList.remove('copy-success', 'copy-error')
    }, duration)
  }
  
  button.addEventListener('click', handleClick)
  
  return () => {
    button.removeEventListener('click', handleClick)
    if (timeout) clearTimeout(timeout)
  }
}

/**
 * Vue 3 Composable: useClipboard
 */
export function useClipboard() {
  return {
    copy: copyText,
    read: readText,
    copyHTML,
    copyImage,
    copyCanvas,
    readImage,
    copyJSON,
    readJSON,
    copyTableData,
    copyRichText,
    onPaste,
    isSupported: isClipboardSupported(),
    isImageCopySupported: isImageCopySupported(),
    isReadSupported: isReadSupported()
  }
}
