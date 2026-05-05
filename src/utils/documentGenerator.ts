import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * 将HTML元素转换为PDF并下载
 * @param element - 要转换的HTML元素
 * @param filename - 下载的文件名
 */
export async function downloadAsPDF(element: HTMLElement, filename: string): Promise<void> {
  try {
    // 创建canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // 获取图片数据
    const imgData = canvas.toDataURL('image/png')
    
    // 计算PDF尺寸
    const imgWidth = 210 // A4宽度（mm）
    const pageHeight = 297 // A4高度（mm）
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    // 创建PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    let position = 0

    // 添加第一页
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 如果内容超过一页，添加更多页
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // 下载PDF
    pdf.save(filename)
  } catch (error) {
    console.error('生成PDF失败:', error)
    throw error
  }
}

export async function downloadAsPDFWithOptions(element: HTMLElement, filename: string, options?: { scale?: number; backgroundColor?: string }) {
  try {
    const scale = options?.scale || 4
    const backgroundColor = options?.backgroundColor ?? '#ffffff'

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidthMm = 210 // A4 width in mm
    const pageHeightMm = 297 // A4 height in mm
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

    pdf.save(filename)
  } catch (error) {
    console.error('生成PDF失败:', error)
    throw error
  }
}

/**
 * 将HTML元素转换为PNG并下载
 * @param element - 要转换的HTML元素
 * @param filename - 下载的文件名
 */
export async function downloadAsPNG(element: HTMLElement, filename: string): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // 转换为blob
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  } catch (error) {
    console.error('生成PNG失败:', error)
    throw error
  }
}

/**
 * 生成条形码SVG
 * @param text - 条形码文本
 * @returns SVG字符串
 */
export function generateBarcode(text: string): string {
  // 这里应该使用JsBarcode生成，但为了简化返回一个占位符
  return `<svg width="200" height="80"><text x="10" y="40">${text}</text></svg>`
}

/**
 * 生成二维码
 * @param text - 二维码内容
 * @returns 二维码图片URL
 */
export function generateQRCode(text: string): string {
  // 这里应该使用QR码库，暂时返回占位符
  return 'data:image/png;base64,placeholder'
}
