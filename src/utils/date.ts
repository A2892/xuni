/**
 * 日期时间工具函数
 */

export type DateInput = Date | string | number

/**
 * 解析日期输入
 */
export const parseDate = (input: DateInput): Date => {
  if (input instanceof Date) return input
  if (typeof input === 'number') return new Date(input)
  return new Date(input)
}

/**
 * 格式化日期
 */
export const formatDate = (
  date: DateInput,
  format: string = 'YYYY-MM-DD'
): string => {
  const d = parseDate(date)
  
  const tokens: Record<string, () => string> = {
    'YYYY': () => String(d.getFullYear()),
    'YY': () => String(d.getFullYear()).slice(-2),
    'MM': () => String(d.getMonth() + 1).padStart(2, '0'),
    'M': () => String(d.getMonth() + 1),
    'DD': () => String(d.getDate()).padStart(2, '0'),
    'D': () => String(d.getDate()),
    'HH': () => String(d.getHours()).padStart(2, '0'),
    'H': () => String(d.getHours()),
    'hh': () => String(d.getHours() % 12 || 12).padStart(2, '0'),
    'h': () => String(d.getHours() % 12 || 12),
    'mm': () => String(d.getMinutes()).padStart(2, '0'),
    'm': () => String(d.getMinutes()),
    'ss': () => String(d.getSeconds()).padStart(2, '0'),
    's': () => String(d.getSeconds()),
    'SSS': () => String(d.getMilliseconds()).padStart(3, '0'),
    'A': () => d.getHours() < 12 ? 'AM' : 'PM',
    'a': () => d.getHours() < 12 ? 'am' : 'pm'
  }
  
  let result = format
  for (const [token, getter] of Object.entries(tokens)) {
    result = result.replace(new RegExp(token, 'g'), getter())
  }
  
  return result
}

/**
 * 相对时间格式化
 */
export const formatRelativeTime = (date: DateInput): string => {
  const d = parseDate(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (seconds < 5) return '刚刚'
  if (seconds < 60) return `${seconds}秒前`
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (weeks < 4) return `${weeks}周前`
  if (months < 12) return `${months}个月前`
  return `${years}年前`
}

/**
 * 获取日期范围
 */
export const getDateRange = (type: 'today' | 'week' | 'month' | 'year'): [Date, Date] => {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)
  
  switch (type) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      const day = start.getDay() || 7
      start.setDate(start.getDate() - day + 1)
      start.setHours(0, 0, 0, 0)
      end.setDate(end.getDate() + (7 - day))
      end.setHours(23, 59, 59, 999)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
  }
  
  return [start, end]
}

/**
 * 添加时间
 */
export const addTime = (
  date: DateInput,
  amount: number,
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'
): Date => {
  const d = new Date(parseDate(date))
  
  switch (unit) {
    case 'year':
      d.setFullYear(d.getFullYear() + amount)
      break
    case 'month':
      d.setMonth(d.getMonth() + amount)
      break
    case 'week':
      d.setDate(d.getDate() + amount * 7)
      break
    case 'day':
      d.setDate(d.getDate() + amount)
      break
    case 'hour':
      d.setHours(d.getHours() + amount)
      break
    case 'minute':
      d.setMinutes(d.getMinutes() + amount)
      break
    case 'second':
      d.setSeconds(d.getSeconds() + amount)
      break
  }
  
  return d
}

/**
 * 日期差异
 */
export const dateDiff = (
  date1: DateInput,
  date2: DateInput,
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' = 'day'
): number => {
  const d1 = parseDate(date1)
  const d2 = parseDate(date2)
  const diff = d1.getTime() - d2.getTime()
  
  switch (unit) {
    case 'year':
      return d1.getFullYear() - d2.getFullYear()
    case 'month':
      return (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth())
    case 'week':
      return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
    case 'day':
      return Math.floor(diff / (24 * 60 * 60 * 1000))
    case 'hour':
      return Math.floor(diff / (60 * 60 * 1000))
    case 'minute':
      return Math.floor(diff / (60 * 1000))
    case 'second':
      return Math.floor(diff / 1000)
  }
}

/**
 * 判断是否为同一天
 */
export const isSameDay = (date1: DateInput, date2: DateInput): boolean => {
  const d1 = parseDate(date1)
  const d2 = parseDate(date2)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/**
 * 判断是否为今天
 */
export const isToday = (date: DateInput): boolean => {
  return isSameDay(date, new Date())
}

/**
 * 判断是否为昨天
 */
export const isYesterday = (date: DateInput): boolean => {
  const yesterday = addTime(new Date(), -1, 'day')
  return isSameDay(date, yesterday)
}

/**
 * 判断是否为闰年
 */
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * 获取某月的天数
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * 获取星期几
 */
export const getDayOfWeek = (date: DateInput, locale: 'zh' | 'en' = 'zh'): string => {
  const d = parseDate(date)
  const dayIndex = d.getDay()
  
  const zhDays = ['日', '一', '二', '三', '四', '五', '六']
  const enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  if (locale === 'zh') {
    return `星期${zhDays[dayIndex]}`
  }
  return enDays[dayIndex]
}

/**
 * 获取月份名称
 */
export const getMonthName = (month: number, locale: 'zh' | 'en' = 'zh'): string => {
  const zhMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const enMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  return locale === 'zh' ? zhMonths[month] : enMonths[month]
}

/**
 * 获取季度
 */
export const getQuarter = (date: DateInput): number => {
  return Math.floor(parseDate(date).getMonth() / 3) + 1
}

/**
 * 获取年龄
 */
export const getAge = (birthDate: DateInput): number => {
  const birth = parseDate(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * 日期排序
 */
export const sortDates = (dates: DateInput[], order: 'asc' | 'desc' = 'asc'): Date[] => {
  return dates
    .map(parseDate)
    .sort((a, b) => order === 'asc' ? a.getTime() - b.getTime() : b.getTime() - a.getTime())
}

/**
 * 获取日期的开始时间
 */
export const startOf = (date: DateInput, unit: 'day' | 'week' | 'month' | 'year'): Date => {
  const d = new Date(parseDate(date))
  
  switch (unit) {
    case 'day':
      d.setHours(0, 0, 0, 0)
      break
    case 'week':
      const day = d.getDay() || 7
      d.setDate(d.getDate() - day + 1)
      d.setHours(0, 0, 0, 0)
      break
    case 'month':
      d.setDate(1)
      d.setHours(0, 0, 0, 0)
      break
    case 'year':
      d.setMonth(0, 1)
      d.setHours(0, 0, 0, 0)
      break
  }
  
  return d
}

/**
 * 获取日期的结束时间
 */
export const endOf = (date: DateInput, unit: 'day' | 'week' | 'month' | 'year'): Date => {
  const d = new Date(parseDate(date))
  
  switch (unit) {
    case 'day':
      d.setHours(23, 59, 59, 999)
      break
    case 'week':
      const day = d.getDay() || 7
      d.setDate(d.getDate() + (7 - day))
      d.setHours(23, 59, 59, 999)
      break
    case 'month':
      d.setMonth(d.getMonth() + 1, 0)
      d.setHours(23, 59, 59, 999)
      break
    case 'year':
      d.setMonth(11, 31)
      d.setHours(23, 59, 59, 999)
      break
  }
  
  return d
}

/**
 * 判断日期是否在范围内
 */
export const isDateInRange = (date: DateInput, start: DateInput, end: DateInput): boolean => {
  const d = parseDate(date).getTime()
  const s = parseDate(start).getTime()
  const e = parseDate(end).getTime()
  return d >= s && d <= e
}

/**
 * 生成日期范围数组
 */
export const generateDateRange = (start: DateInput, end: DateInput): Date[] => {
  const dates: Date[] = []
  const current = new Date(parseDate(start))
  const endDate = parseDate(end)
  
  while (current <= endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

/**
 * 日期转时间戳
 */
export const toTimestamp = (date: DateInput): number => {
  return parseDate(date).getTime()
}

/**
 * 时间戳转日期
 */
export const fromTimestamp = (timestamp: number): Date => {
  return new Date(timestamp)
}

export default {
  parseDate,
  formatDate,
  formatRelativeTime,
  getDateRange,
  addTime,
  dateDiff,
  isSameDay,
  isToday,
  isYesterday,
  isLeapYear,
  getDaysInMonth,
  getDayOfWeek,
  getMonthName,
  getQuarter,
  getAge,
  sortDates,
  startOf,
  endOf,
  isDateInRange,
  generateDateRange,
  toTimestamp,
  fromTimestamp
}
