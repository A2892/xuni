/**
 * 验证工具函数 - 表单验证和数据校验
 */

// ==================== 基础类型验证 ====================

/**
 * 判断是否为空值
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 判断是否为非空值
 */
export function isNotEmpty(value: any): boolean {
  return !isEmpty(value)
}

/**
 * 判断是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * 判断是否为整数
 */
export function isInteger(value: any): boolean {
  return isNumber(value) && Number.isInteger(value)
}

/**
 * 判断是否为正数
 */
export function isPositive(value: any): boolean {
  return isNumber(value) && value > 0
}

/**
 * 判断是否为负数
 */
export function isNegative(value: any): boolean {
  return isNumber(value) && value < 0
}

/**
 * 判断是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string'
}

/**
 * 判断是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 判断是否为数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

/**
 * 判断是否为对象
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 判断是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

/**
 * 判断是否为日期
 */
export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

// ==================== 字符串验证 ====================

/**
 * 验证邮箱格式
 */
export function isEmail(value: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(value)
}

/**
 * 验证手机号（中国大陆）
 */
export function isMobilePhone(value: string): boolean {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(value)
}

/**
 * 验证电话号码
 */
export function isPhone(value: string): boolean {
  const regex = /^(\d{3,4}-?)?\d{7,8}$/
  return regex.test(value)
}

/**
 * 验证身份证号（中国大陆）
 */
export function isIdCard(value: string): boolean {
  // 15位或18位身份证
  const regex15 = /^[1-9]\d{5}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}$/
  const regex18 = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  
  if (value.length === 15) return regex15.test(value)
  if (value.length === 18) {
    if (!regex18.test(value)) return false
    // 校验码验证
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const codes = '10X98765432'
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(value[i]) * weights[i]
    }
    return codes[sum % 11] === value[17].toUpperCase()
  }
  return false
}

/**
 * 验证 URL
 */
export function isUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * 验证 IP 地址（IPv4）
 */
export function isIPv4(value: string): boolean {
  const regex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
  return regex.test(value)
}

/**
 * 验证 IP 地址（IPv6）
 */
export function isIPv6(value: string): boolean {
  const regex = /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:(([\da-fA-F]{1,4}:){0,5}[\da-fA-F]{1,4})?::(([\da-fA-F]{1,4}:){0,5}[\da-fA-F]{1,4})?$/
  return regex.test(value)
}

/**
 * 验证邮政编码（中国大陆）
 */
export function isPostalCode(value: string): boolean {
  const regex = /^[1-9]\d{5}$/
  return regex.test(value)
}

/**
 * 验证车牌号（中国大陆）
 */
export function isPlateNumber(value: string): boolean {
  // 普通车牌和新能源车牌
  const regex = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/
  return regex.test(value)
}

/**
 * 验证银行卡号
 */
export function isBankCard(value: string): boolean {
  // 使用 Luhn 算法验证
  const digits = value.replace(/\s/g, '')
  if (!/^\d{16,19}$/.test(digits)) return false
  
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let digit = parseInt(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

/**
 * 验证中文字符
 */
export function isChinese(value: string): boolean {
  const regex = /^[\u4e00-\u9fa5]+$/
  return regex.test(value)
}

/**
 * 验证只包含字母
 */
export function isAlpha(value: string): boolean {
  const regex = /^[a-zA-Z]+$/
  return regex.test(value)
}

/**
 * 验证只包含字母和数字
 */
export function isAlphanumeric(value: string): boolean {
  const regex = /^[a-zA-Z0-9]+$/
  return regex.test(value)
}

/**
 * 验证 Hex 颜色
 */
export function isHexColor(value: string): boolean {
  const regex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
  return regex.test(value)
}

/**
 * 验证 JSON 字符串
 */
export function isJSON(value: string): boolean {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

/**
 * 验证 Base64 字符串
 */
export function isBase64(value: string): boolean {
  try {
    return btoa(atob(value)) === value
  } catch {
    return false
  }
}

// ==================== 密码强度验证 ====================

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong'

/**
 * 检测密码强度
 */
export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0
  
  // 长度
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  
  // 包含小写字母
  if (/[a-z]/.test(password)) score += 1
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) score += 1
  
  // 包含数字
  if (/\d/.test(password)) score += 1
  
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2
  
  // 返回强度等级
  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  if (score <= 6) return 'strong'
  return 'very-strong'
}

/**
 * 验证密码是否符合要求
 */
export function validatePassword(
  password: string,
  options?: {
    minLength?: number
    maxLength?: number
    requireLowercase?: boolean
    requireUppercase?: boolean
    requireNumber?: boolean
    requireSpecial?: boolean
  }
): { valid: boolean; errors: string[] } {
  const {
    minLength = 8,
    maxLength = 32,
    requireLowercase = true,
    requireUppercase = true,
    requireNumber = true,
    requireSpecial = false
  } = options || {}
  
  const errors: string[] = []
  
  if (password.length < minLength) {
    errors.push(`密码长度不能少于 ${minLength} 位`)
  }
  
  if (password.length > maxLength) {
    errors.push(`密码长度不能超过 ${maxLength} 位`)
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母')
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母')
  }
  
  if (requireNumber && !/\d/.test(password)) {
    errors.push('密码必须包含数字')
  }
  
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含特殊字符')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// ==================== 范围验证 ====================

/**
 * 验证数字范围
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * 验证字符串长度范围
 */
export function lengthInRange(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max
}

/**
 * 验证日期范围
 */
export function dateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate
}

/**
 * 验证是否在数组中
 */
export function isIn<T>(value: T, list: T[]): boolean {
  return list.includes(value)
}

// ==================== 表单验证器 ====================

export interface ValidationRule {
  type: string
  message?: string
  [key: string]: any
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string[]>
  firstError?: string
}

/**
 * 验证单个字段
 */
export function validateField(
  value: any,
  rules: ValidationRule[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const rule of rules) {
    let isValid = true
    
    switch (rule.type) {
      case 'required':
        isValid = isNotEmpty(value)
        break
      case 'email':
        isValid = isEmpty(value) || isEmail(value)
        break
      case 'phone':
        isValid = isEmpty(value) || isMobilePhone(value)
        break
      case 'idCard':
        isValid = isEmpty(value) || isIdCard(value)
        break
      case 'url':
        isValid = isEmpty(value) || isUrl(value)
        break
      case 'min':
        isValid = isEmpty(value) || (isNumber(value) ? value >= rule.value : value.length >= rule.value)
        break
      case 'max':
        isValid = isEmpty(value) || (isNumber(value) ? value <= rule.value : value.length <= rule.value)
        break
      case 'minLength':
        isValid = isEmpty(value) || value.length >= rule.value
        break
      case 'maxLength':
        isValid = isEmpty(value) || value.length <= rule.value
        break
      case 'pattern':
        isValid = isEmpty(value) || new RegExp(rule.value).test(value)
        break
      case 'custom':
        isValid = rule.validator ? rule.validator(value) : true
        break
    }
    
    if (!isValid) {
      errors.push(rule.message || `${rule.type} validation failed`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证整个表单
 */
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): ValidationResult {
  const errors: Record<string, string[]> = {}
  let firstError: string | undefined
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const result = validateField(data[field], fieldRules)
    if (!result.valid) {
      errors[field] = result.errors
      if (!firstError && result.errors.length > 0) {
        firstError = result.errors[0]
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    firstError
  }
}

/**
 * 创建验证器实例
 */
export function createValidator(rules: Record<string, ValidationRule[]>) {
  return {
    validate: (data: Record<string, any>) => validateForm(data, rules),
    validateField: (field: string, value: any) => {
      const fieldRules = rules[field]
      return fieldRules ? validateField(value, fieldRules) : { valid: true, errors: [] }
    }
  }
}

// ==================== 常用验证规则 ====================

export const rules = {
  required: (message = '此字段为必填项'): ValidationRule => ({
    type: 'required',
    message
  }),
  
  email: (message = '请输入有效的邮箱地址'): ValidationRule => ({
    type: 'email',
    message
  }),
  
  phone: (message = '请输入有效的手机号码'): ValidationRule => ({
    type: 'phone',
    message
  }),
  
  idCard: (message = '请输入有效的身份证号码'): ValidationRule => ({
    type: 'idCard',
    message
  }),
  
  url: (message = '请输入有效的 URL'): ValidationRule => ({
    type: 'url',
    message
  }),
  
  min: (value: number, message?: string): ValidationRule => ({
    type: 'min',
    value,
    message: message || `最小值为 ${value}`
  }),
  
  max: (value: number, message?: string): ValidationRule => ({
    type: 'max',
    value,
    message: message || `最大值为 ${value}`
  }),
  
  minLength: (length: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value: length,
    message: message || `长度不能少于 ${length} 个字符`
  }),
  
  maxLength: (length: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value: length,
    message: message || `长度不能超过 ${length} 个字符`
  }),
  
  pattern: (pattern: string | RegExp, message = '格式不正确'): ValidationRule => ({
    type: 'pattern',
    value: pattern instanceof RegExp ? pattern.source : pattern,
    message
  }),
  
  custom: (validator: (value: any) => boolean, message = '验证失败'): ValidationRule => ({
    type: 'custom',
    validator,
    message
  })
}

export default {
  // 基础类型
  isEmpty,
  isNotEmpty,
  isNumber,
  isInteger,
  isPositive,
  isNegative,
  isString,
  isBoolean,
  isArray,
  isObject,
  isFunction,
  isDate,
  
  // 字符串验证
  isEmail,
  isMobilePhone,
  isPhone,
  isIdCard,
  isUrl,
  isIPv4,
  isIPv6,
  isPostalCode,
  isPlateNumber,
  isBankCard,
  isChinese,
  isAlpha,
  isAlphanumeric,
  isHexColor,
  isJSON,
  isBase64,
  
  // 密码
  getPasswordStrength,
  validatePassword,
  
  // 范围
  inRange,
  lengthInRange,
  dateInRange,
  isIn,
  
  // 表单验证
  validateField,
  validateForm,
  createValidator,
  rules
}
