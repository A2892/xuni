/**
 * 图片处理工具函数
 */

/**
 * 压缩图片
 * @param file 图片文件
 * @param options 压缩选项
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    type?: string
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    type = 'image/jpeg'
  } = options
  
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
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为 Blob
      canvas.toBlob(
        (blob) => {
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
 * 图片转 Base64
 */
export function imageToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Base64 转 Blob
 */
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,')
  const type = parts[0].split(':')[1]
  const raw = atob(parts[1])
  const rawLength = raw.length
  const array = new Uint8Array(rawLength)
  
  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i)
  }
  
  return new Blob([array], { type })
}

/**
 * URL 转 Blob
 */
export async function urlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  return response.blob()
}

/**
 * 获取图片尺寸
 */
export function getImageSize(src: string | File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    const url = typeof src === 'string' ? src : URL.createObjectURL(src)
    
    img.onload = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    
    img.onerror = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * 裁剪图片
 */
export async function cropImage(
  src: string | File,
  options: {
    x: number
    y: number
    width: number
    height: number
    outputWidth?: number
    outputHeight?: number
    type?: string
    quality?: number
  }
): Promise<Blob> {
  const {
    x, y, width, height,
    outputWidth = width,
    outputHeight = height,
    type = 'image/jpeg',
    quality = 0.9
  } = options
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = typeof src === 'string' ? src : URL.createObjectURL(src)
    
    img.onload = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      
      const canvas = document.createElement('canvas')
      canvas.width = outputWidth
      canvas.height = outputHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(
        img,
        x, y, width, height,
        0, 0, outputWidth, outputHeight
      )
      
      canvas.toBlob(
        (blob) => {
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
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * 旋转图片
 */
export async function rotateImage(
  src: string | File,
  degrees: number,
  options: { type?: string; quality?: number } = {}
): Promise<Blob> {
  const { type = 'image/jpeg', quality = 0.9 } = options
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = typeof src === 'string' ? src : URL.createObjectURL(src)
    
    img.onload = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      
      const { width, height } = img
      const radians = (degrees * Math.PI) / 180
      
      // 计算旋转后的尺寸
      const sin = Math.abs(Math.sin(radians))
      const cos = Math.abs(Math.cos(radians))
      const newWidth = Math.round(width * cos + height * sin)
      const newHeight = Math.round(width * sin + height * cos)
      
      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      // 移动原点到中心，旋转，再移回
      ctx.translate(newWidth / 2, newHeight / 2)
      ctx.rotate(radians)
      ctx.drawImage(img, -width / 2, -height / 2)
      
      canvas.toBlob(
        (blob) => {
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
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * 翻转图片
 */
export async function flipImage(
  src: string | File,
  direction: 'horizontal' | 'vertical',
  options: { type?: string; quality?: number } = {}
): Promise<Blob> {
  const { type = 'image/jpeg', quality = 0.9 } = options
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = typeof src === 'string' ? src : URL.createObjectURL(src)
    
    img.onload = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      
      const { width, height } = img
      
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      if (direction === 'horizontal') {
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
      } else {
        ctx.translate(0, height)
        ctx.scale(1, -1)
      }
      
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to flip image'))
          }
        },
        type,
        quality
      )
    }
    
    img.onerror = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * 调整图片亮度/对比度/饱和度
 */
export async function adjustImage(
  src: string | File,
  options: {
    brightness?: number  // -100 到 100
    contrast?: number    // -100 到 100
    saturation?: number  // -100 到 100
    type?: string
    quality?: number
  }
): Promise<Blob> {
  const {
    brightness = 0,
    contrast = 0,
    saturation = 0,
    type = 'image/jpeg',
    quality = 0.9
  } = options
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = typeof src === 'string' ? src : URL.createObjectURL(src)
    
    img.onload = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      // 应用 CSS filter
      const filters: string[] = []
      
      if (brightness !== 0) {
        filters.push(`brightness(${100 + brightness}%)`)
      }
      if (contrast !== 0) {
        filters.push(`contrast(${100 + contrast}%)`)
      }
      if (saturation !== 0) {
        filters.push(`saturate(${100 + saturation}%)`)
      }
      
      ctx.filter = filters.join(' ') || 'none'
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to adjust image'))
          }
        },
        type,
        quality
      )
    }
    
    img.onerror = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * 图片灰度化
 */
export async function grayscaleImage(
  src: string | File,
  options: { type?: string; quality?: number } = {}
): Promise<Blob> {
  return adjustImage(src, { saturation: -100, ...options })
}

/**
 * 添加水印
 */
export async function addWatermark(
  src: string | File,
  watermark: string | { text: string; x?: number; y?: number; font?: string; color?: string; opacity?: number },
  options: { type?: string; quality?: number } = {}
): Promise<Blob> {
  const { type = 'image/jpeg', quality = 0.9 } = options
  
  const config = typeof watermark === 'string' 
    ? { text: watermark }
    : watermark
  
  const {
    text,
    x = 20,
    y,
    font = '24px Arial',
    color = 'rgba(255, 255, 255, 0.5)',
    opacity = 1
  } = config
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = typeof src === 'string' ? src : URL.createObjectURL(src)
    
    img.onload = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0)
      
      ctx.globalAlpha = opacity
      ctx.font = font
      ctx.fillStyle = color
      ctx.fillText(text, x, y || img.height - 20)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to add watermark'))
          }
        },
        type,
        quality
      )
    }
    
    img.onerror = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * 检查图片是否有效
 */
export function isValidImage(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  return validTypes.includes(file.type)
}

/**
 * 获取图片文件类型
 */
export function getImageType(file: File): string | null {
  const match = file.type.match(/image\/(\w+)/)
  return match ? match[1] : null
}

export default {
  compressImage,
  imageToBase64,
  base64ToBlob,
  urlToBlob,
  getImageSize,
  cropImage,
  rotateImage,
  flipImage,
  adjustImage,
  grayscaleImage,
  addWatermark,
  isValidImage,
  getImageType
}
