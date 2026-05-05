/**
 * 文件处理工具函数
 */

/**
 * 文件类型映射
 */
export const mimeTypes: Record<string, string> = {
  // 图片
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  
  // 视频
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  
  // 音频
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  flac: 'audio/flac',
  aac: 'audio/aac',
  
  // 文档
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // 文本
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  json: 'application/json',
  xml: 'application/xml',
  csv: 'text/csv',
  md: 'text/markdown',
  
  // 压缩包
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip'
}

/**
 * 获取文件扩展名
 */
export function getExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

/**
 * 获取文件名（不含扩展名）
 */
export function getBaseName(filename: string): string {
  const parts = filename.split('.')
  if (parts.length > 1) {
    parts.pop()
  }
  return parts.join('.')
}

/**
 * 获取 MIME 类型
 */
export function getMimeType(filename: string): string {
  const ext = getExtension(filename)
  return mimeTypes[ext] || 'application/octet-stream'
}

/**
 * 判断是否为图片
 */
export function isImage(filename: string): boolean {
  const ext = getExtension(filename)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp'].includes(ext)
}

/**
 * 判断是否为视频
 */
export function isVideo(filename: string): boolean {
  const ext = getExtension(filename)
  return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)
}

/**
 * 判断是否为音频
 */
export function isAudio(filename: string): boolean {
  const ext = getExtension(filename)
  return ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)
}

/**
 * 判断是否为文档
 */
export function isDocument(filename: string): boolean {
  const ext = getExtension(filename)
  return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)
}

/**
 * 判断是否为压缩包
 */
export function isArchive(filename: string): boolean {
  const ext = getExtension(filename)
  return ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)
}

/**
 * 判断是否为代码文件
 */
export function isCode(filename: string): boolean {
  const ext = getExtension(filename)
  return ['js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'java', 'c', 'cpp', 'go', 'rs', 'rb', 'php', 'swift', 'kt'].includes(ext)
}

/**
 * 获取文件类型
 */
export function getFileType(filename: string): string {
  if (isImage(filename)) return 'image'
  if (isVideo(filename)) return 'video'
  if (isAudio(filename)) return 'audio'
  if (isDocument(filename)) return 'document'
  if (isArchive(filename)) return 'archive'
  if (isCode(filename)) return 'code'
  return 'other'
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * 解析文件大小字符串为字节数
 */
export function parseFileSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    tb: 1024 * 1024 * 1024 * 1024
  }
  
  const match = size.toLowerCase().match(/^([\d.]+)\s*(b|kb|mb|gb|tb)?$/)
  if (!match) return 0
  
  const value = parseFloat(match[1])
  const unit = match[2] || 'b'
  
  return Math.round(value * units[unit])
}

/**
 * 读取文件为文本
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

/**
 * 读取文件为 Data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * 读取文件为 ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 读取图片尺寸
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * 压缩图片
 */
export function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    type?: string
  } = {}
): Promise<Blob> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, type = 'image/jpeg' } = options
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      let { width, height } = img
      
      // 计算缩放比例
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      
      // 创建 canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        type,
        quality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * 裁剪图片
 */
export function cropImage(
  file: File,
  crop: { x: number; y: number; width: number; height: number },
  options: { type?: string; quality?: number } = {}
): Promise<Blob> {
  const { type = 'image/jpeg', quality = 0.9 } = options
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      const canvas = document.createElement('canvas')
      canvas.width = crop.width
      canvas.height = crop.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(
        img,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, crop.width, crop.height
      )
      
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to crop image'))
          }
        },
        type,
        quality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * 旋转图片
 */
export function rotateImage(
  file: File,
  degrees: number,
  options: { type?: string; quality?: number } = {}
): Promise<Blob> {
  const { type = 'image/jpeg', quality = 0.9 } = options
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      const radians = (degrees * Math.PI) / 180
      const sin = Math.abs(Math.sin(radians))
      const cos = Math.abs(Math.cos(radians))
      
      const canvas = document.createElement('canvas')
      canvas.width = img.width * cos + img.height * sin
      canvas.height = img.width * sin + img.height * cos
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(radians)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to rotate image'))
          }
        },
        type,
        quality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * 创建文件下载
 */
export function downloadFile(
  content: string | Blob | ArrayBuffer,
  filename: string,
  mimeType?: string
): void {
  let blob: Blob
  
  if (content instanceof Blob) {
    blob = content
  } else if (content instanceof ArrayBuffer) {
    blob = new Blob([content], { type: mimeType || 'application/octet-stream' })
  } else {
    blob = new Blob([content], { type: mimeType || 'text/plain' })
  }
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 下载 Canvas 为图片
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  type: string = 'image/png',
  quality: number = 0.92
): void {
  canvas.toBlob(
    blob => {
      if (blob) {
        downloadFile(blob, filename)
      }
    },
    type,
    quality
  )
}

/**
 * 将 Base64 转换为 Blob
 */
export function base64ToBlob(base64: string, mimeType?: string): Blob {
  const parts = base64.split(',')
  const contentType = mimeType || parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream'
  const raw = atob(parts[1] || parts[0])
  const array = new Uint8Array(raw.length)
  
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i)
  }
  
  return new Blob([array], { type: contentType })
}

/**
 * 将 Blob 转换为 Base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * 验证文件类型
 */
export function validateFileType(file: File, accept: string): boolean {
  const accepts = accept.split(',').map(s => s.trim())
  const fileExt = '.' + getExtension(file.name)
  const fileMime = file.type
  
  return accepts.some(accept => {
    if (accept.startsWith('.')) {
      // 扩展名匹配
      return fileExt.toLowerCase() === accept.toLowerCase()
    } else if (accept.endsWith('/*')) {
      // MIME 类型通配符匹配
      const prefix = accept.slice(0, -2)
      return fileMime.startsWith(prefix)
    } else {
      // 精确 MIME 类型匹配
      return fileMime === accept
    }
  })
}

/**
 * 验证文件大小
 */
export function validateFileSize(file: File, maxSize: number | string): boolean {
  const max = typeof maxSize === 'string' ? parseFileSize(maxSize) : maxSize
  return file.size <= max
}

/**
 * 生成唯一文件名
 */
export function generateUniqueFilename(filename: string): string {
  const ext = getExtension(filename)
  const base = getBaseName(filename)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  
  return ext ? `${base}_${timestamp}_${random}.${ext}` : `${base}_${timestamp}_${random}`
}

/**
 * 安全化文件名
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // 替换非法字符
    .replace(/^\.+/, '') // 移除开头的点
    .replace(/\.+$/, '') // 移除结尾的点
    .trim()
}

/**
 * 选择文件
 */
export function selectFile(options: {
  accept?: string
  multiple?: boolean
} = {}): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = options.accept || '*'
    input.multiple = options.multiple || false
    input.style.display = 'none'
    
    input.onchange = () => {
      const files = Array.from(input.files || [])
      document.body.removeChild(input)
      resolve(files)
    }
    
    input.oncancel = () => {
      document.body.removeChild(input)
      resolve([])
    }
    
    document.body.appendChild(input)
    input.click()
  })
}

/**
 * 计算文件 MD5（简化版，基于内容取样）
 */
export async function getFileHash(file: File): Promise<string> {
  const buffer = await readFileAsArrayBuffer(file)
  const array = new Uint8Array(buffer)
  
  // 简单哈希算法
  let hash = 0
  for (let i = 0; i < array.length; i++) {
    hash = ((hash << 5) - hash + array[i]) | 0
  }
  
  return Math.abs(hash).toString(16).padStart(8, '0')
}

export default {
  mimeTypes,
  getExtension,
  getBaseName,
  getMimeType,
  isImage,
  isVideo,
  isAudio,
  isDocument,
  isArchive,
  isCode,
  getFileType,
  formatFileSize,
  parseFileSize,
  readFileAsText,
  readFileAsDataURL,
  readFileAsArrayBuffer,
  getImageDimensions,
  compressImage,
  cropImage,
  rotateImage,
  downloadFile,
  downloadCanvas,
  base64ToBlob,
  blobToBase64,
  validateFileType,
  validateFileSize,
  generateUniqueFilename,
  sanitizeFilename,
  selectFile,
  getFileHash
}
