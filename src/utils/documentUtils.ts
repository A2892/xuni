import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { supabase } from '@/lib/supabase'

export interface DownloadOptions {
  quality: 1 | 2 | 3
  format: 'png' | 'jpg' | 'webp'
  filename: string
  backgroundColor?: string
}

export interface PDFOptions {
  quality: 1 | 2 | 3
  orientation: 'portrait' | 'landscape'
  format: 'a4' | 'a3' | 'letter'
  filename: string
  title?: string
}

/**
 * 将 DOM 元素导出为图片
 */
export async function downloadAsImage(
  element: HTMLElement,
  options: DownloadOptions
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: options.quality,
    useCORS: true,
    backgroundColor: options.backgroundColor || null,
    logging: false
  })
  
  const mimeType = options.format === 'jpg' ? 'image/jpeg' : 
                   options.format === 'webp' ? 'image/webp' : 'image/png'
  
  const link = document.createElement('a')
  link.download = `${options.filename}.${options.format}`
  link.href = canvas.toDataURL(mimeType, options.format === 'jpg' ? 0.92 : undefined)
  link.click()
}

/**
 * 将 DOM 元素导出为 PDF
 */
export async function downloadAsPDF(
  element: HTMLElement,
  options: PDFOptions
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: options.quality,
    useCORS: true,
    backgroundColor: '#fff',
    logging: false
  })
  
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: options.format
  })
  
  // 添加标题
  if (options.title) {
    pdf.setFontSize(16)
    pdf.text(options.title, 15, 15)
  }
  
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 40) / imgHeight)
  const imgX = (pdfWidth - imgWidth * ratio) / 2
  const imgY = options.title ? 25 : 10
  
  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
  pdf.save(`${options.filename}.pdf`)
}

/**
 * 将数据保存到 Supabase 数据库
 */
export async function saveToDatabase(
  tableName: string,
  data: Record<string, any>,
  imageElement?: HTMLElement
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    // 如果提供了元素，先生成缩略图
    let thumbnailUrl = ''
    if (imageElement) {
      const canvas = await html2canvas(imageElement, {
        scale: 0.5,
        useCORS: true,
        backgroundColor: '#fff',
        logging: false
      })
      thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7)
    }
    
    const saveData = {
      ...data,
      thumbnail: thumbnailUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([saveData])
      .select()
      .single()
    
    if (error) {
      console.error('Database save error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, id: result.id }
  } catch (err: any) {
    console.error('Save error:', err)
    return { success: false, error: err.message || '保存失败' }
  }
}

/**
 * 从数据库加载数据
 */
export async function loadFromDatabase(
  tableName: string,
  filters?: Record<string, any>,
  options?: { limit?: number; orderBy?: string; ascending?: boolean }
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    let query = supabase.from(tableName).select('*')
    
    // 应用过滤条件
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    // 排序
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false })
    }
    
    // 限制数量
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const { data, error } = await query
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || '加载失败' }
  }
}

/**
 * 删除数据库记录
 */
export async function deleteFromDatabase(
  tableName: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || '删除失败' }
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 生成唯一 ID
 */
export function generateUniqueId(prefix = ''): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * 复制图片到剪贴板
 */
export async function copyImageToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff'
    })
    
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            resolve(true)
          } catch {
            resolve(false)
          }
        } else {
          resolve(false)
        }
      }, 'image/png')
    })
  } catch {
    return false
  }
}
