/**
 * 数字格式化工具函数
 */

/**
 * 格式化数字（添加千分位分隔符）
 */
export const formatNumber = (num: number, options?: {
  decimals?: number
  separator?: string
  decimalPoint?: string
}): string => {
  const { decimals = 0, separator = ',', decimalPoint = '.' } = options || {}
  
  const fixed = num.toFixed(decimals)
  const [integer, decimal] = fixed.split('.')
  
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  
  return decimal ? `${formattedInteger}${decimalPoint}${decimal}` : formattedInteger
}

/**
 * 格式化货币
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'CNY',
  locale: string = 'zh-CN'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * 格式化百分比
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  return (value * 100).toFixed(decimals) + '%'
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * 格式化大数字（简化显示）
 */
export const formatCompact = (num: number, locale: string = 'zh-CN'): string => {
  if (Math.abs(num) < 10000) {
    return String(num)
  }
  
  if (locale === 'zh-CN') {
    if (Math.abs(num) >= 100000000) {
      return (num / 100000000).toFixed(1) + '亿'
    }
    if (Math.abs(num) >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
  }
  
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(num)
}

/**
 * 格式化时长（秒转可读格式）
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.floor(seconds)}秒`
  }
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  if (secs > 0 && hours === 0) parts.push(`${secs}秒`)
  
  return parts.join('')
}

/**
 * 格式化时长（用于媒体播放器）
 */
export const formatMediaDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}

/**
 * 解析格式化的数字
 */
export const parseFormattedNumber = (str: string): number => {
  return parseFloat(str.replace(/[^\d.-]/g, ''))
}

/**
 * 四舍五入到指定小数位
 */
export const round = (num: number, decimals: number = 0): number => {
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}

/**
 * 向下取整到指定小数位
 */
export const floor = (num: number, decimals: number = 0): number => {
  const factor = Math.pow(10, decimals)
  return Math.floor(num * factor) / factor
}

/**
 * 向上取整到指定小数位
 */
export const ceil = (num: number, decimals: number = 0): number => {
  const factor = Math.pow(10, decimals)
  return Math.ceil(num * factor) / factor
}

/**
 * 限制数值在范围内
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max)
}

/**
 * 判断是否在范围内
 */
export const inRange = (num: number, min: number, max: number): boolean => {
  return num >= min && num <= max
}

/**
 * 随机整数
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 随机浮点数
 */
export const randomFloat = (min: number, max: number, decimals: number = 2): number => {
  return round(Math.random() * (max - min) + min, decimals)
}

/**
 * 数值映射
 */
export const mapRange = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number => {
  return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin
}

/**
 * 计算进度百分比
 */
export const progress = (current: number, total: number): number => {
  if (total === 0) return 0
  return clamp(current / total, 0, 1)
}

/**
 * 序数词（英文）
 */
export const ordinal = (num: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = num % 100
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

/**
 * 中文数字
 */
export const toChineseNumber = (num: number): string => {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千']
  const bigUnits = ['', '万', '亿', '兆']
  
  if (num === 0) return digits[0]
  
  let result = ''
  let unitIndex = 0
  let bigUnitIndex = 0
  
  while (num > 0) {
    const section = num % 10000
    if (section > 0) {
      let sectionStr = ''
      let localUnit = 0
      let tempSection = section
      
      while (tempSection > 0) {
        const digit = tempSection % 10
        if (digit > 0) {
          sectionStr = digits[digit] + units[localUnit] + sectionStr
        } else if (sectionStr && !sectionStr.startsWith(digits[0])) {
          sectionStr = digits[0] + sectionStr
        }
        tempSection = Math.floor(tempSection / 10)
        localUnit++
      }
      
      result = sectionStr + bigUnits[bigUnitIndex] + result
    }
    
    num = Math.floor(num / 10000)
    bigUnitIndex++
  }
  
  // 清理连续的零
  result = result.replace(/零+/g, '零').replace(/零$/, '')
  
  // 处理 "一十" 开头的情况
  if (result.startsWith('一十')) {
    result = result.substring(1)
  }
  
  return result
}

/**
 * 转换为罗马数字
 */
export const toRoman = (num: number): string => {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
  const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
  
  let result = ''
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += numerals[i]
      num -= values[i]
    }
  }
  return result
}

/**
 * 阿拉伯数字转为带圈数字
 */
export const toCircledNumber = (num: number): string => {
  if (num < 1 || num > 50) return String(num)
  
  if (num <= 20) {
    return String.fromCharCode(0x2460 + num - 1) // ① - ⑳
  }
  if (num <= 35) {
    return String.fromCharCode(0x3251 + num - 21) // ㉑ - ㉟
  }
  return String.fromCharCode(0x32B1 + num - 36) // ㊱ - ㊿
}

/**
 * 数字补零
 */
export const padZero = (num: number, length: number): string => {
  return String(num).padStart(length, '0')
}

/**
 * 精确加法（避免浮点数精度问题）
 */
export const add = (a: number, b: number): number => {
  const precision = Math.max(
    (String(a).split('.')[1] || '').length,
    (String(b).split('.')[1] || '').length
  )
  const factor = Math.pow(10, precision)
  return (Math.round(a * factor) + Math.round(b * factor)) / factor
}

/**
 * 精确减法
 */
export const subtract = (a: number, b: number): number => {
  return add(a, -b)
}

/**
 * 精确乘法
 */
export const multiply = (a: number, b: number): number => {
  const aStr = String(a)
  const bStr = String(b)
  const aDecimals = (aStr.split('.')[1] || '').length
  const bDecimals = (bStr.split('.')[1] || '').length
  
  const aInt = Number(aStr.replace('.', ''))
  const bInt = Number(bStr.replace('.', ''))
  
  return (aInt * bInt) / Math.pow(10, aDecimals + bDecimals)
}

/**
 * 精确除法
 */
export const divide = (a: number, b: number, decimals: number = 10): number => {
  if (b === 0) throw new Error('Division by zero')
  return round(a / b, decimals)
}

/**
 * 判断是否为有效数字
 */
export const isValidNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * 判断是否为整数
 */
export const isInteger = (num: number): boolean => {
  return Number.isInteger(num)
}

/**
 * 判断是否为正数
 */
export const isPositive = (num: number): boolean => {
  return num > 0
}

/**
 * 判断是否为负数
 */
export const isNegative = (num: number): boolean => {
  return num < 0
}

/**
 * 判断是否为偶数
 */
export const isEven = (num: number): boolean => {
  return num % 2 === 0
}

/**
 * 判断是否为奇数
 */
export const isOdd = (num: number): boolean => {
  return num % 2 !== 0
}

export default {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  formatCompact,
  formatDuration,
  formatMediaDuration,
  parseFormattedNumber,
  round,
  floor,
  ceil,
  clamp,
  inRange,
  randomInt,
  randomFloat,
  mapRange,
  progress,
  ordinal,
  toChineseNumber,
  toRoman,
  toCircledNumber,
  padZero,
  add,
  subtract,
  multiply,
  divide,
  isValidNumber,
  isInteger,
  isPositive,
  isNegative,
  isEven,
  isOdd
}
