import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface EmailOptions {
  to: string
  subject: string
  body?: string
  format: 'PDF' | 'PNG' | 'JPEG'
  quality: 'standard' | 'high' | 'ultra' | 'max'
}

export interface QualitySettings {
  scale: number
  quality: number
  maxSize: number
  label: string
}

export const qualityPresets: Record<string, QualitySettings> = {
  'standard': { scale: 2, quality: 0.85, maxSize: 2, label: '标准质量 (较小文件)' },
  'high': { scale: 3, quality: 0.92, maxSize: 5, label: '高清质量' },
  'ultra': { scale: 4, quality: 0.95, maxSize: 8, label: '超高清 (推荐)' },
  'max': { scale: 5, quality: 1.0, maxSize: 10, label: '最高质量 (大文件)' }
}

/**
 * 将HTML元素转换为Blob
 */
export async function elementToBlob(
  element: HTMLElement, 
  format: 'PDF' | 'PNG' | 'JPEG',
  quality: string = 'ultra'
): Promise<Blob> {
  const settings = qualityPresets[quality] ?? qualityPresets['ultra']
  
  // 等待所有图片加载完成
  const images = element.getElementsByTagName('img')
  await Promise.all(
    Array.from(images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve // 即使加载失败也继续
      })
    })
  )
  
  const canvas = await html2canvas(element, {
    scale: settings!.scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  })

  if (format === 'PDF') {
    const imgData = canvas.toDataURL('image/png')
    const imgWidthMm = 210
    const pageHeightMm = 297
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width
    let heightLeft = imgHeightMm

    const pdf = new jsPDF('p', 'mm', 'a4')
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm)
    heightLeft -= pageHeightMm

    while (heightLeft > 0) {
      position = heightLeft - imgHeightMm
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm)
      heightLeft -= pageHeightMm
    }

    return pdf.output('blob')
  } else {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成图片'))
          }
        },
        format === 'PNG' ? 'image/png' : 'image/jpeg',
        settings!.quality
      )
    })
  }
}

/**
 * 将Blob转换为Base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      const result = base64.split(',')[1] // 移除 data:xxx;base64, 前缀
      resolve(result ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 通过mailto发送邮件（附件作为提示）
 */
export function sendViaMailto(options: EmailOptions, filename: string): void {
  const subject = encodeURIComponent(options.subject)
  const body = encodeURIComponent(
    (options.body || '') + 
    `\n\n---\n附件: ${filename}\n提示: 由于浏览器限制，附件已单独下载，请将其添加到邮件中。`
  )
  
  window.open(`mailto:${options.to}?subject=${subject}&body=${body}`)
}

/**
 * 下载文件并打开邮件客户端
 */
export async function downloadAndEmail(
  element: HTMLElement,
  filename: string,
  options: EmailOptions
): Promise<void> {
  // 生成文件
  const blob = await elementToBlob(element, options.format, options.quality)
  
  // 下载文件
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  
  const ext = options.format.toLowerCase()
  const fullFilename = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`
  link.download = fullFilename
  link.click()
  URL.revokeObjectURL(url)
  
  // 打开邮件客户端
  sendViaMailto(options, fullFilename)
}

/**
 * 复制图片到剪贴板（用于粘贴到邮件）
 */
export async function copyImageToClipboard(element: HTMLElement, quality: string = 'ultra'): Promise<boolean> {
  try {
    const blob = await elementToBlob(element, 'PNG', quality)
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    return true
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    return false
  }
}

/**
 * 获取文件大小描述
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * 预估文件大小
 */
export async function estimateFileSize(
  element: HTMLElement,
  format: 'PDF' | 'PNG' | 'JPEG',
  quality: string
): Promise<string> {
  try {
    const blob = await elementToBlob(element, format, quality)
    return formatFileSize(blob.size)
  } catch {
    return '未知'
  }
}
