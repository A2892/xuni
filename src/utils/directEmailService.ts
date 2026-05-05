import emailjs from '@emailjs/browser'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// EmailJS 配置 - 用户需要在 EmailJS 网站注册并获取这些值
// 访问 https://www.emailjs.com/ 创建免费账户
const EMAILJS_CONFIG = {
  serviceId: localStorage.getItem('emailjs_service_id') || '',
  templateId: localStorage.getItem('emailjs_template_id') || '',
  publicKey: localStorage.getItem('emailjs_public_key') || ''
}

export interface DirectEmailOptions {
  to: string
  subject: string
  body?: string
  format: 'PDF' | 'PNG' | 'JPEG'
  quality: 'standard' | 'high' | 'ultra' | 'max'
}

export interface QualitySettings {
  scale: number
  quality: number
  label: string
}

export const qualityPresets: Record<string, QualitySettings> = {
  'standard': { scale: 2, quality: 0.85, label: '标准质量' },
  'high': { scale: 3, quality: 0.92, label: '高清质量' },
  'ultra': { scale: 4, quality: 0.95, label: '超高清' },
  'max': { scale: 5, quality: 1.0, label: '最高质量' }
}

/**
 * 检查 EmailJS 是否已配置
 */
export function isEmailJSConfigured(): boolean {
  return !!(EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId && EMAILJS_CONFIG.publicKey)
}

/**
 * 保存 EmailJS 配置
 */
export function saveEmailJSConfig(serviceId: string, templateId: string, publicKey: string): void {
  localStorage.setItem('emailjs_service_id', serviceId)
  localStorage.setItem('emailjs_template_id', templateId)
  localStorage.setItem('emailjs_public_key', publicKey)
  
  // 更新运行时配置
  EMAILJS_CONFIG.serviceId = serviceId
  EMAILJS_CONFIG.templateId = templateId
  EMAILJS_CONFIG.publicKey = publicKey
}

/**
 * 获取当前 EmailJS 配置
 */
export function getEmailJSConfig() {
  return {
    serviceId: EMAILJS_CONFIG.serviceId,
    templateId: EMAILJS_CONFIG.templateId,
    publicKey: EMAILJS_CONFIG.publicKey
  }
}

/**
 * 初始化 EmailJS
 */
export function initEmailJS(): void {
  if (EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey)
  }
}

/**
 * 将 HTML 元素转换为 Base64 图片
 */
export async function elementToBase64(
  element: HTMLElement,
  format: 'PNG' | 'JPEG',
  quality: string = 'ultra'
): Promise<string> {
  const settings = qualityPresets[quality] ?? qualityPresets['ultra']
  
  const canvas = await html2canvas(element, {
    scale: settings!.scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff'
  })

  const mimeType = format === 'PNG' ? 'image/png' : 'image/jpeg'
  return canvas.toDataURL(mimeType, settings!.quality)
}

/**
 * 将 HTML 元素转换为 PDF 的 Base64
 */
export async function elementToPDFBase64(
  element: HTMLElement,
  quality: string = 'ultra'
): Promise<string> {
  const settings = qualityPresets[quality] ?? qualityPresets['ultra']
  
  const canvas = await html2canvas(element, {
    scale: settings!.scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff'
  })

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

  return pdf.output('datauristring')
}

/**
 * 直接发送邮件（使用 EmailJS）
 */
export async function sendEmailDirect(
  element: HTMLElement,
  filename: string,
  options: DirectEmailOptions
): Promise<{ success: boolean; message: string }> {
  if (!isEmailJSConfigured()) {
    return {
      success: false,
      message: 'EmailJS 未配置。请先在设置中配置 EmailJS 凭据。'
    }
  }

  try {
    // 生成附件内容
    let attachmentData: string
    if (options.format === 'PDF') {
      attachmentData = await elementToPDFBase64(element, options.quality)
    } else {
      attachmentData = await elementToBase64(element, options.format, options.quality)
    }

    // 准备邮件参数
    const templateParams = {
      to_email: options.to,
      subject: options.subject,
      message: options.body || `请查收附件：${filename}`,
      attachment: attachmentData,
      attachment_name: `${filename}.${options.format.toLowerCase()}`
    }

    // 发送邮件
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    )

    if (response.status === 200) {
      return {
        success: true,
        message: '邮件发送成功！'
      }
    } else {
      return {
        success: false,
        message: `发送失败：${response.text}`
      }
    }
  } catch (error: any) {
    console.error('邮件发送错误:', error)
    return {
      success: false,
      message: `发送失败：${error?.text || error?.message || '未知错误'}`
    }
  }
}

/**
 * 通过 Web Share API 分享（如果支持）
 */
export async function shareViaWebShare(
  element: HTMLElement,
  filename: string,
  options: DirectEmailOptions
): Promise<boolean> {
  if (!navigator.share || !navigator.canShare) {
    return false
  }

  try {
    const settings = qualityPresets[options.quality] ?? qualityPresets['ultra']
    
    const canvas = await html2canvas(element, {
      scale: settings!.scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('无法生成图片')),
        options.format === 'PNG' ? 'image/png' : 'image/jpeg',
        settings!.quality
      )
    })

    const file = new File([blob], `${filename}.${options.format.toLowerCase()}`, {
      type: options.format === 'PNG' ? 'image/png' : 'image/jpeg'
    })

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: options.subject,
        text: options.body,
        files: [file]
      })
      return true
    }
  } catch (error) {
    console.error('分享失败:', error)
  }

  return false
}

/**
 * 下载文件并使用 mailto 打开邮件客户端
 */
export async function downloadAndMailto(
  element: HTMLElement,
  filename: string,
  options: DirectEmailOptions
): Promise<void> {
  const settings = qualityPresets[options.quality] ?? qualityPresets['ultra']
  
  const canvas = await html2canvas(element, {
    scale: settings!.scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff'
  })

  let blob: Blob
  let ext: string

  if (options.format === 'PDF') {
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

    blob = pdf.output('blob')
    ext = 'pdf'
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('无法生成图片')),
        options.format === 'PNG' ? 'image/png' : 'image/jpeg',
        settings!.quality
      )
    })
    ext = options.format.toLowerCase()
  }

  // 下载文件
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.${ext}`
  link.click()
  URL.revokeObjectURL(url)

  // 打开邮件客户端
  const subject = encodeURIComponent(options.subject)
  const body = encodeURIComponent(
    (options.body || '') +
    `\n\n---\n附件：${filename}.${ext}\n提示：由于浏览器限制，附件已单独下载，请将其添加到邮件中。`
  )

  window.location.href = `mailto:${options.to}?subject=${subject}&body=${body}`
}

/**
 * 格式化文件大小
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
    const settings = qualityPresets[quality] ?? qualityPresets['ultra']
    
    const canvas = await html2canvas(element, {
      scale: Math.min(settings!.scale, 2), // 使用较低缩放来快速预估
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('无法生成图片')),
        format === 'PNG' ? 'image/png' : 'image/jpeg',
        settings!.quality
      )
    })

    // 根据实际缩放比例调整预估大小
    const scaleFactor = Math.pow(settings!.scale / 2, 2)
    const estimatedBytes = blob.size * scaleFactor
    
    return formatFileSize(estimatedBytes)
  } catch {
    return '未知'
  }
}
