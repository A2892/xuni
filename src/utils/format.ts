/**
 * 格式化工具函数
 */

/**
 * 格式化数字
 */
export function formatNumber(
  value: number,
  options: {
    decimals?: number
    decimalSeparator?: string
    thousandSeparator?: string
    prefix?: string
    suffix?: string
  } = {}
): string {
  const {
    decimals = 0,
    decimalSeparator = '.',
    thousandSeparator = ',',
    prefix = '',
    suffix = ''
  } = options
  
  const fixed = value.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  
  // 添加千分位分隔符
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
  
  let result = formattedInt
  if (decPart) {
    result += decimalSeparator + decPart
  }
  
  return prefix + result + suffix
}

/**
 * 格式化货币
 */
export function formatCurrency(
  value: number,
  currency: string = 'CNY',
  locale: string = 'zh-CN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value)
}

/**
 * 格式化人民币
 */
export function formatRMB(value: number, decimals: number = 2): string {
  return formatNumber(value, {
    decimals,
    prefix: '¥'
  })
}

/**
 * 格式化美元
 */
export function formatUSD(value: number, decimals: number = 2): string {
  return formatNumber(value, {
    decimals,
    prefix: '$'
  })
}

/**
 * 格式化百分比
 */
export function formatPercent(
  value: number,
  decimals: number = 0,
  multiply: boolean = true
): string {
  const percent = multiply ? value * 100 : value
  return formatNumber(percent, { decimals }) + '%'
}

/**
 * 简化大数字
 */
export function formatCompactNumber(
  value: number,
  locale: string = 'zh-CN'
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value)
}

/**
 * 中文数字简化（万/亿）
 */
export function formatChineseNumber(value: number, decimals: number = 1): string {
  if (Math.abs(value) >= 100000000) {
    return formatNumber(value / 100000000, { decimals }) + '亿'
  }
  if (Math.abs(value) >= 10000) {
    return formatNumber(value / 10000, { decimals }) + '万'
  }
  return formatNumber(value)
}

/**
 * 英文数字简化（K/M/B）
 */
export function formatEnglishNumber(value: number, decimals: number = 1): string {
  if (Math.abs(value) >= 1000000000) {
    return formatNumber(value / 1000000000, { decimals }) + 'B'
  }
  if (Math.abs(value) >= 1000000) {
    return formatNumber(value / 1000000, { decimals }) + 'M'
  }
  if (Math.abs(value) >= 1000) {
    return formatNumber(value / 1000, { decimals }) + 'K'
  }
  return formatNumber(value)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(
  bytes: number,
  decimals: number = 2,
  si: boolean = true
): string {
  if (bytes === 0) return '0 B'
  
  const k = si ? 1000 : 1024
  const units = si
    ? ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    : ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)
  
  return formatNumber(size, { decimals }) + ' ' + units[i]
}

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | string | number,
  format: string = 'YYYY-MM-DD'
): string {
  const d = date instanceof Date ? date : new Date(date)
  
  if (isNaN(d.getTime())) return ''
  
  const pad = (n: number, len: number = 2) => String(n).padStart(len, '0')
  
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const seconds = d.getSeconds()
  const milliseconds = d.getMilliseconds()
  
  return format
    .replace('YYYY', String(year))
    .replace('YY', String(year).slice(-2))
    .replace('MM', pad(month))
    .replace('M', String(month))
    .replace('DD', pad(day))
    .replace('D', String(day))
    .replace('HH', pad(hours))
    .replace('H', String(hours))
    .replace('hh', pad(hours % 12 || 12))
    .replace('h', String(hours % 12 || 12))
    .replace('mm', pad(minutes))
    .replace('m', String(minutes))
    .replace('ss', pad(seconds))
    .replace('s', String(seconds))
    .replace('SSS', pad(milliseconds, 3))
    .replace('A', hours < 12 ? 'AM' : 'PM')
    .replace('a', hours < 12 ? 'am' : 'pm')
}

/**
 * 相对时间
 */
export function formatRelativeTime(
  date: Date | string | number,
  baseDate: Date = new Date()
): string {
  const d = date instanceof Date ? date : new Date(date)
  const diff = baseDate.getTime() - d.getTime()
  const absDiff = Math.abs(diff)
  
  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  const isFuture = diff < 0
  
  let text = ''
  if (years > 0) {
    text = `${years}年`
  } else if (months > 0) {
    text = `${months}个月`
  } else if (days > 0) {
    text = `${days}天`
  } else if (hours > 0) {
    text = `${hours}小时`
  } else if (minutes > 0) {
    text = `${minutes}分钟`
  } else if (seconds > 10) {
    text = `${seconds}秒`
  } else {
    return '刚刚'
  }
  
  return isFuture ? `${text}后` : `${text}前`
}

/**
 * 格式化持续时间
 */
export function formatDuration(
  seconds: number,
  options: {
    format?: 'short' | 'long' | 'clock'
    showZero?: boolean
  } = {}
): string {
  const { format = 'short', showZero = false } = options
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (format === 'clock') {
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }
  
  const parts: string[] = []
  
  if (hours > 0 || showZero) {
    parts.push(format === 'long' ? `${hours}小时` : `${hours}h`)
  }
  if (minutes > 0 || showZero || hours > 0) {
    parts.push(format === 'long' ? `${minutes}分钟` : `${minutes}m`)
  }
  if (secs > 0 || showZero || parts.length === 0) {
    parts.push(format === 'long' ? `${secs}秒` : `${secs}s`)
  }
  
  return parts.join(' ')
}

/**
 * 格式化手机号
 */
export function formatPhone(phone: string, separator: string = ' '): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}${separator}${cleaned.slice(3, 7)}${separator}${cleaned.slice(7)}`
  }
  
  return phone
}

/**
 * 脱敏手机号
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}****${cleaned.slice(7)}`
  }
  
  return phone
}

/**
 * 格式化银行卡号
 */
export function formatBankCard(card: string, separator: string = ' '): string {
  const cleaned = card.replace(/\D/g, '')
  return cleaned.replace(/(\d{4})(?=\d)/g, `$1${separator}`)
}

/**
 * 脱敏银行卡号
 */
export function maskBankCard(card: string): string {
  const cleaned = card.replace(/\D/g, '')
  
  if (cleaned.length >= 8) {
    return `${cleaned.slice(0, 4)} **** **** ${cleaned.slice(-4)}`
  }
  
  return card
}

/**
 * 脱敏身份证号
 */
export function maskIdCard(idCard: string): string {
  if (idCard.length === 18) {
    return `${idCard.slice(0, 6)}********${idCard.slice(-4)}`
  }
  if (idCard.length === 15) {
    return `${idCard.slice(0, 6)}******${idCard.slice(-3)}`
  }
  return idCard
}

/**
 * 脱敏邮箱
 */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!domain) return email
  
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`
  }
  
  return `${name[0]}${'*'.repeat(Math.min(name.length - 2, 4))}${name.slice(-1)}@${domain}`
}

/**
 * 脱敏姓名
 */
export function maskName(name: string): string {
  if (name.length <= 1) return name
  if (name.length === 2) return `${name[0]}*`
  return `${name[0]}${'*'.repeat(name.length - 2)}${name.slice(-1)}`
}

/**
 * 格式化地址
 */
export function formatAddress(
  province: string,
  city: string,
  district: string,
  detail: string
): string {
  const parts = [province, city, district, detail].filter(Boolean)
  return parts.join('')
}

/**
 * 截断文本
 */
export function truncate(
  text: string,
  length: number,
  suffix: string = '...'
): string {
  if (text.length <= length) return text
  return text.slice(0, length - suffix.length) + suffix
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 每个单词首字母大写
 */
export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  })
}

/**
 * 驼峰转短横线
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * 短横线/下划线转驼峰
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^./, (char) => char.toLowerCase())
}

/**
 * 驼峰转下划线
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

/**
 * 序数词
 */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/**
 * 中文序数词
 */
export function chineseOrdinal(n: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千']
  
  if (n < 0 || n > 9999) return String(n)
  if (n === 0) return digits[0]
  
  let result = ''
  let strNum = String(n)
  
  for (let i = 0; i < strNum.length; i++) {
    const digit = parseInt(strNum[i])
    const unit = units[strNum.length - i - 1]
    
    if (digit !== 0) {
      // 十几的情况省略"一"
      if (!(strNum.length === 2 && i === 0 && digit === 1)) {
        result += digits[digit]
      }
      result += unit
    } else if (result && !result.endsWith(digits[0])) {
      result += digits[0]
    }
  }
  
  // 去除末尾的零
  result = result.replace(/零+$/, '')
  
  return '第' + result
}

/**
 * 格式化列表
 */
export function formatList(
  items: string[],
  options: {
    conjunction?: string
    serial?: boolean
    limit?: number
    moreText?: string
  } = {}
): string {
  const {
    conjunction = '和',
    serial = false,
    limit = 0,
    moreText = '等'
  } = options
  
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  
  let list = items
  let hasMore = false
  
  if (limit > 0 && items.length > limit) {
    list = items.slice(0, limit)
    hasMore = true
  }
  
  if (list.length === 2) {
    const result = list.join(conjunction)
    return hasMore ? result + moreText : result
  }
  
  const last = list.pop()
  const result = list.join('、') + (serial ? '、' : '') + conjunction + last
  return hasMore ? result + moreText : result
}

/**
 * 格式化范围
 */
export function formatRange(
  min: number,
  max: number,
  options: {
    separator?: string
    prefix?: string
    suffix?: string
  } = {}
): string {
  const { separator = ' - ', prefix = '', suffix = '' } = options
  
  if (min === max) {
    return prefix + formatNumber(min) + suffix
  }
  
  return prefix + formatNumber(min) + separator + formatNumber(max) + suffix
}
