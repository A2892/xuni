/**
 * Canvas 绘图工具函数
 */

/**
 * 创建 Canvas
 */
export function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
} {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  return { canvas, ctx }
}

/**
 * 清除 Canvas
 */
export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

/**
 * 绘制圆角矩形
 */
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | number[]
): void {
  let radii: number[]
  
  if (typeof radius === 'number') {
    radii = [radius, radius, radius, radius]
  } else {
    radii = [...radius]
    while (radii.length < 4) {
      radii.push(radii[radii.length - 1] || 0)
    }
  }
  
  const [tl, tr, br, bl] = radii
  
  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + width - tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr)
  ctx.lineTo(x + width, y + height - br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height)
  ctx.lineTo(x + bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl)
  ctx.lineTo(x, y + tl)
  ctx.quadraticCurveTo(x, y, x + tl, y)
  ctx.closePath()
}

/**
 * 绘制圆形
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.closePath()
}

/**
 * 绘制椭圆
 */
export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number
): void {
  ctx.beginPath()
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2)
  ctx.closePath()
}

/**
 * 绘制线条
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

/**
 * 绘制多边形
 */
export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: [number, number][]
): void {
  if (points.length < 3) return
  
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1])
  }
  
  ctx.closePath()
}

/**
 * 绘制正多边形
 */
export function drawRegularPolygon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  sides: number,
  rotation = -Math.PI / 2
): void {
  if (sides < 3) return
  
  const angle = (Math.PI * 2) / sides
  const points: [number, number][] = []
  
  for (let i = 0; i < sides; i++) {
    const px = x + radius * Math.cos(rotation + angle * i)
    const py = y + radius * Math.sin(rotation + angle * i)
    points.push([px, py])
  }
  
  drawPolygon(ctx, points)
}

/**
 * 绘制星形
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  points: number,
  rotation = -Math.PI / 2
): void {
  const step = Math.PI / points
  const coords: [number, number][] = []
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = rotation + step * i
    coords.push([
      x + radius * Math.cos(angle),
      y + radius * Math.sin(angle)
    ])
  }
  
  drawPolygon(ctx, coords)
}

/**
 * 绘制贝塞尔曲线
 */
export function drawBezierCurve(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  cp1x: number,
  cp1y: number,
  cp2x: number,
  cp2y: number,
  endX: number,
  endY: number
): void {
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)
  ctx.stroke()
}

/**
 * 绘制二次曲线
 */
export function drawQuadraticCurve(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  cpx: number,
  cpy: number,
  endX: number,
  endY: number
): void {
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.quadraticCurveTo(cpx, cpy, endX, endY)
  ctx.stroke()
}

/**
 * 绘制箭头
 */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  arrowSize = 10
): void {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  
  // 画线
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  
  // 画箭头
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(
    x2 - arrowSize * Math.cos(angle - Math.PI / 6),
    y2 - arrowSize * Math.sin(angle - Math.PI / 6)
  )
  ctx.lineTo(
    x2 - arrowSize * Math.cos(angle + Math.PI / 6),
    y2 - arrowSize * Math.sin(angle + Math.PI / 6)
  )
  ctx.closePath()
  ctx.fill()
}

/**
 * 绘制文字
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options?: {
    font?: string
    color?: string
    align?: CanvasTextAlign
    baseline?: CanvasTextBaseline
    maxWidth?: number
  }
): void {
  if (options?.font) ctx.font = options.font
  if (options?.color) ctx.fillStyle = options.color
  if (options?.align) ctx.textAlign = options.align
  if (options?.baseline) ctx.textBaseline = options.baseline
  
  if (options?.maxWidth) {
    ctx.fillText(text, x, y, options.maxWidth)
  } else {
    ctx.fillText(text, x, y)
  }
}

/**
 * 绘制多行文字
 */
export function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split('')
  let line = ''
  let currentY = y
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line = words[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  
  ctx.fillText(line, x, currentY)
}

/**
 * 绘制图片
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  x: number,
  y: number,
  width?: number,
  height?: number
): void {
  if (width !== undefined && height !== undefined) {
    ctx.drawImage(image, x, y, width, height)
  } else {
    ctx.drawImage(image, x, y)
  }
}

/**
 * 绘制圆形图片
 */
export function drawCircularImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  x: number,
  y: number,
  radius: number
): void {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(image, x, y, radius * 2, radius * 2)
  ctx.restore()
}

/**
 * 绘制圆角图片
 */
export function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.save()
  drawRoundRect(ctx, x, y, width, height, radius)
  ctx.clip()
  ctx.drawImage(image, x, y, width, height)
  ctx.restore()
}

/**
 * 创建线性渐变
 */
export function createLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: [number, string][]
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  stops.forEach(([offset, color]) => {
    gradient.addColorStop(offset, color)
  })
  return gradient
}

/**
 * 创建径向渐变
 */
export function createRadialGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
  stops: [number, string][]
): CanvasGradient {
  const gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1)
  stops.forEach(([offset, color]) => {
    gradient.addColorStop(offset, color)
  })
  return gradient
}

/**
 * Canvas 转 Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      type,
      quality
    )
  })
}

/**
 * Canvas 转 DataURL
 */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality?: number
): string {
  return canvas.toDataURL(type, quality)
}

/**
 * 加载图片
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

export default {
  createCanvas,
  clearCanvas,
  drawRoundRect,
  drawCircle,
  drawEllipse,
  drawLine,
  drawPolygon,
  drawRegularPolygon,
  drawStar,
  drawBezierCurve,
  drawQuadraticCurve,
  drawArrow,
  drawText,
  drawMultilineText,
  drawImage,
  drawCircularImage,
  drawRoundedImage,
  createLinearGradient,
  createRadialGradient,
  canvasToBlob,
  canvasToDataURL,
  loadImage
}
