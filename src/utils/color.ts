/**
 * 颜色处理工具函数
 */

/**
 * HEX 转 RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

/**
 * RGB 转 HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * RGB 转 HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * HSL 转 RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

/**
 * HEX 转 HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsl(rgb.r, rgb.g, rgb.b)
}

/**
 * HSL 转 HEX
 */
export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

/**
 * RGB 转 HSV
 */
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  }
}

/**
 * HSV 转 RGB
 */
export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  v /= 100

  let r = 0, g = 0, b = 0

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break
    case 1: r = q; g = v; b = p; break
    case 2: r = p; g = v; b = t; break
    case 3: r = p; g = q; b = v; break
    case 4: r = t; g = p; b = v; break
    case 5: r = v; g = p; b = q; break
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

/**
 * 解析颜色字符串
 */
export function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
  // HEX
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color)
    return rgb ? { ...rgb, a: 1 } : null
  }
  
  // RGB/RGBA
  const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/)
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
    }
  }
  
  // HSL/HSLA
  const hslaMatch = color.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)/)
  if (hslaMatch) {
    const rgb = hslToRgb(
      parseInt(hslaMatch[1]),
      parseInt(hslaMatch[2]),
      parseInt(hslaMatch[3])
    )
    return {
      ...rgb,
      a: hslaMatch[4] ? parseFloat(hslaMatch[4]) : 1
    }
  }
  
  return null
}

/**
 * 颜色转 RGBA 字符串
 */
export function toRgba(r: number, g: number, b: number, a: number = 1): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/**
 * 颜色转 HSLA 字符串
 */
export function toHsla(h: number, s: number, l: number, a: number = 1): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`
}

/**
 * 调整颜色亮度
 */
export function lighten(color: string, amount: number): string {
  const hsl = hexToHsl(color)
  if (!hsl) return color
  
  return hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + amount))
}

/**
 * 降低颜色亮度
 */
export function darken(color: string, amount: number): string {
  const hsl = hexToHsl(color)
  if (!hsl) return color
  
  return hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - amount))
}

/**
 * 调整颜色饱和度
 */
export function saturate(color: string, amount: number): string {
  const hsl = hexToHsl(color)
  if (!hsl) return color
  
  return hslToHex(hsl.h, Math.min(100, hsl.s + amount), hsl.l)
}

/**
 * 降低颜色饱和度
 */
export function desaturate(color: string, amount: number): string {
  const hsl = hexToHsl(color)
  if (!hsl) return color
  
  return hslToHex(hsl.h, Math.max(0, hsl.s - amount), hsl.l)
}

/**
 * 调整颜色透明度
 */
export function opacity(color: string, alpha: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  
  return toRgba(rgb.r, rgb.g, rgb.b, Math.max(0, Math.min(1, alpha)))
}

/**
 * 混合两个颜色
 */
export function mix(color1: string, color2: string, weight: number = 0.5): string {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return color1
  
  const w = Math.max(0, Math.min(1, weight))
  
  return rgbToHex(
    Math.round(rgb1.r * (1 - w) + rgb2.r * w),
    Math.round(rgb1.g * (1 - w) + rgb2.g * w),
    Math.round(rgb1.b * (1 - w) + rgb2.b * w)
  )
}

/**
 * 获取互补色
 */
export function complement(color: string): string {
  const hsl = hexToHsl(color)
  if (!hsl) return color
  
  return hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
}

/**
 * 获取类似色（相邻色）
 */
export function analogous(color: string, angle: number = 30): [string, string, string] {
  const hsl = hexToHsl(color)
  if (!hsl) return [color, color, color]
  
  return [
    hslToHex((hsl.h - angle + 360) % 360, hsl.s, hsl.l),
    color,
    hslToHex((hsl.h + angle) % 360, hsl.s, hsl.l)
  ]
}

/**
 * 获取三角色
 */
export function triadic(color: string): [string, string, string] {
  const hsl = hexToHsl(color)
  if (!hsl) return [color, color, color]
  
  return [
    color,
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
  ]
}

/**
 * 获取分裂互补色
 */
export function splitComplement(color: string): [string, string, string] {
  const hsl = hexToHsl(color)
  if (!hsl) return [color, color, color]
  
  return [
    color,
    hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l)
  ]
}

/**
 * 生成渐变色数组
 */
export function generateGradient(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const colors: string[] = []
  
  for (let i = 0; i < steps; i++) {
    colors.push(mix(startColor, endColor, i / (steps - 1)))
  }
  
  return colors
}

/**
 * 生成色阶
 */
export function generateShades(color: string, count: number = 9): string[] {
  const hsl = hexToHsl(color)
  if (!hsl) return Array(count).fill(color)
  
  const shades: string[] = []
  const lightnessStep = 100 / (count + 1)
  
  for (let i = count; i >= 1; i--) {
    shades.push(hslToHex(hsl.h, hsl.s, i * lightnessStep))
  }
  
  return shades
}

/**
 * 计算颜色亮度（感知亮度）
 */
export function luminance(color: string): number {
  const rgb = hexToRgb(color)
  if (!rgb) return 0
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * 计算两个颜色的对比度
 */
export function contrast(color1: string, color2: string): number {
  const l1 = luminance(color1)
  const l2 = luminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 判断颜色是否为深色
 */
export function isDark(color: string): boolean {
  return luminance(color) < 0.5
}

/**
 * 判断颜色是否为浅色
 */
export function isLight(color: string): boolean {
  return !isDark(color)
}

/**
 * 获取最佳前景色（黑色或白色）
 */
export function getContrastColor(background: string): string {
  return isDark(background) ? '#ffffff' : '#000000'
}

/**
 * 检查颜色是否满足 WCAG 对比度要求
 */
export function meetsContrastRatio(
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA',
  large: boolean = false
): boolean {
  const ratio = contrast(color1, color2)
  
  if (level === 'AAA') {
    return large ? ratio >= 4.5 : ratio >= 7
  }
  return large ? ratio >= 3 : ratio >= 4.5
}

/**
 * 随机生成颜色
 */
export function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

/**
 * 随机生成柔和的颜色
 */
export function randomSoftColor(): string {
  const h = Math.floor(Math.random() * 360)
  const s = Math.floor(Math.random() * 30) + 30 // 30-60%
  const l = Math.floor(Math.random() * 20) + 60 // 60-80%
  return hslToHex(h, s, l)
}

/**
 * 随机生成鲜艳的颜色
 */
export function randomVibrantColor(): string {
  const h = Math.floor(Math.random() * 360)
  const s = Math.floor(Math.random() * 20) + 80 // 80-100%
  const l = Math.floor(Math.random() * 20) + 40 // 40-60%
  return hslToHex(h, s, l)
}

/**
 * 颜色名称映射
 */
export const namedColors: Record<string, string> = {
  red: '#ff0000',
  orange: '#ffa500',
  yellow: '#ffff00',
  green: '#008000',
  blue: '#0000ff',
  purple: '#800080',
  pink: '#ffc0cb',
  brown: '#a52a2a',
  gray: '#808080',
  black: '#000000',
  white: '#ffffff',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  lime: '#00ff00',
  teal: '#008080',
  navy: '#000080',
  maroon: '#800000',
  olive: '#808000',
  silver: '#c0c0c0',
  coral: '#ff7f50',
  salmon: '#fa8072',
  gold: '#ffd700',
  indigo: '#4b0082',
  violet: '#ee82ee',
  aqua: '#00ffff'
}

/**
 * 获取命名颜色的 HEX 值
 */
export function getNamedColor(name: string): string | null {
  return namedColors[name.toLowerCase()] || null
}

/**
 * 验证颜色格式
 */
export function isValidColor(color: string): boolean {
  // 检查 HEX
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) return true
  // 检查 RGB/RGBA
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) return true
  // 检查 HSL/HSLA
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)) return true
  // 检查命名颜色
  if (namedColors[color.toLowerCase()]) return true
  
  return false
}

export default {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  rgbToHsv,
  hsvToRgb,
  parseColor,
  toRgba,
  toHsla,
  lighten,
  darken,
  saturate,
  desaturate,
  opacity,
  mix,
  complement,
  analogous,
  triadic,
  splitComplement,
  generateGradient,
  generateShades,
  luminance,
  contrast,
  isDark,
  isLight,
  getContrastColor,
  meetsContrastRatio,
  randomColor,
  randomSoftColor,
  randomVibrantColor,
  namedColors,
  getNamedColor,
  isValidColor
}
