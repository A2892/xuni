/**
 * 字符串工具函数
 */

/**
 * 驼峰转短横线
 */
export const kebabCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 短横线转驼峰
 */
export const camelCase = (str: string): string => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 首字母大写的驼峰
 */
export const pascalCase = (str: string): string => {
  const camel = camelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * 蛇形命名
 */
export const snakeCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

/**
 * 首字母大写
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 标题化
 */
export const titleCase = (str: string): string => {
  return str.replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * 截断字符串
 */
export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}

/**
 * 填充字符串
 */
export const pad = (str: string, length: number, char: string = ' ', position: 'left' | 'right' | 'both' = 'left'): string => {
  const padLength = length - str.length
  if (padLength <= 0) return str
  
  const padding = char.repeat(Math.ceil(padLength / char.length)).slice(0, padLength)
  
  switch (position) {
    case 'left':
      return padding + str
    case 'right':
      return str + padding
    case 'both':
      const half = Math.floor(padLength / 2)
      return char.repeat(half) + str + char.repeat(padLength - half)
  }
}

/**
 * 去除空白字符
 */
export const trim = (str: string, chars?: string): string => {
  if (!chars) return str.trim()
  const regex = new RegExp(`^[${chars}]+|[${chars}]+$`, 'g')
  return str.replace(regex, '')
}

/**
 * 重复字符串
 */
export const repeat = (str: string, count: number): string => {
  return str.repeat(count)
}

/**
 * 反转字符串
 */
export const reverse = (str: string): string => {
  return str.split('').reverse().join('')
}

/**
 * 转义 HTML
 */
export const escapeHtml = (str: string): string => {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return str.replace(/[&<>"']/g, char => escapeMap[char])
}

/**
 * 反转义 HTML
 */
export const unescapeHtml = (str: string): string => {
  const unescapeMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'"
  }
  return str.replace(/&(amp|lt|gt|quot|#039);/g, match => unescapeMap[match])
}

/**
 * 转义正则表达式
 */
export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 生成随机字符串
 */
export const randomString = (length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string => {
  return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('')
}

/**
 * 生成 UUID
 */
export const uuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 生成短 ID
 */
export const shortId = (length: number = 8): string => {
  return randomString(length, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
}

/**
 * 字符串模板替换
 */
export const template = (str: string, data: Record<string, any>): string => {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''))
}

/**
 * 计算字符串字节长度
 */
export const byteLength = (str: string): number => {
  return new Blob([str]).size
}

/**
 * 按字节截断
 */
export const truncateBytes = (str: string, maxBytes: number, suffix: string = '...'): string => {
  const encoder = new TextEncoder()
  const encoded = encoder.encode(str)
  
  if (encoded.length <= maxBytes) return str
  
  const suffixBytes = encoder.encode(suffix).length
  const targetBytes = maxBytes - suffixBytes
  
  let bytes = 0
  let i = 0
  for (; i < str.length && bytes < targetBytes; i++) {
    const char = str.charAt(i)
    bytes += encoder.encode(char).length
  }
  
  return str.slice(0, i) + suffix
}

/**
 * 统计字符数
 */
export const count = (str: string, char: string): number => {
  return (str.match(new RegExp(escapeRegExp(char), 'g')) || []).length
}

/**
 * 统计词频
 */
export const wordCount = (str: string): number => {
  const words = str.trim().split(/\s+/)
  return words[0] === '' ? 0 : words.length
}

/**
 * 提取数字
 */
export const extractNumbers = (str: string): number[] => {
  const matches = str.match(/-?\d+\.?\d*/g)
  return matches ? matches.map(Number) : []
}

/**
 * 检查是否为数字字符串
 */
export const isNumeric = (str: string): boolean => {
  return !isNaN(parseFloat(str)) && isFinite(Number(str))
}

/**
 * 检查是否为邮箱
 */
export const isEmail = (str: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
}

/**
 * 检查是否为手机号（中国）
 */
export const isMobilePhone = (str: string): boolean => {
  return /^1[3-9]\d{9}$/.test(str)
}

/**
 * 检查是否为身份证号（中国）
 */
export const isIdCard = (str: string): boolean => {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(str)
}

/**
 * 检查是否为 URL
 */
export const isUrl = (str: string): boolean => {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

/**
 * 检查是否包含中文
 */
export const hasChinese = (str: string): boolean => {
  return /[\u4e00-\u9fa5]/.test(str)
}

/**
 * 格式化手机号
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
}

/**
 * 隐藏手机号中间四位
 */
export const maskPhone = (phone: string): string => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 隐藏邮箱
 */
export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@')
  const maskedName = name.length > 2 
    ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
    : name[0] + '*'
  return `${maskedName}@${domain}`
}

/**
 * 提取文件扩展名
 */
export const getExtension = (filename: string): string => {
  const index = filename.lastIndexOf('.')
  return index > 0 ? filename.slice(index + 1).toLowerCase() : ''
}

/**
 * 获取不带扩展名的文件名
 */
export const getBasename = (filename: string): string => {
  const index = filename.lastIndexOf('.')
  return index > 0 ? filename.slice(0, index) : filename
}

/**
 * 高亮搜索关键词
 */
export const highlight = (text: string, keyword: string, tag: string = 'mark'): string => {
  if (!keyword) return text
  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
  return text.replace(regex, `<${tag}>$1</${tag}>`)
}

/**
 * 清除 HTML 标签
 */
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 转换换行符为 <br>
 */
export const nl2br = (str: string): string => {
  return str.replace(/\n/g, '<br>')
}

/**
 * 相似度计算（Levenshtein 距离）
 */
export const similarity = (str1: string, str2: string): number => {
  const len1 = str1.length
  const len2 = str2.length
  
  if (len1 === 0) return len2 === 0 ? 1 : 0
  if (len2 === 0) return 0
  
  const matrix: number[][] = []
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  
  const distance = matrix[len1][len2]
  return 1 - distance / Math.max(len1, len2)
}

export default {
  kebabCase,
  camelCase,
  pascalCase,
  snakeCase,
  capitalize,
  titleCase,
  truncate,
  pad,
  trim,
  repeat,
  reverse,
  escapeHtml,
  unescapeHtml,
  escapeRegExp,
  randomString,
  uuid,
  shortId,
  template,
  byteLength,
  truncateBytes,
  count,
  wordCount,
  extractNumbers,
  isNumeric,
  isEmail,
  isMobilePhone,
  isIdCard,
  isUrl,
  hasChinese,
  formatPhone,
  maskPhone,
  maskEmail,
  getExtension,
  getBasename,
  highlight,
  stripHtml,
  nl2br,
  similarity
}
