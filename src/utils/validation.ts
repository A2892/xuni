/**
 * 表单验证工具库
 * 提供完整的表单验证规则和工具函数
 */

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  message?: string
  value?: any
  validator?: (value: any, formData?: any) => boolean | string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface FieldValidation {
  field: string
  rules: ValidationRule[]
}

// 预定义的验证规则
export const validators = {
  // 必填验证
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  },

  // 邮箱验证
  email: (value: string): boolean => {
    if (!value) return true // 空值由required规则处理
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return regex.test(value)
  },

  // 手机号验证（中国大陆）
  phone: (value: string): boolean => {
    if (!value) return true
    const regex = /^1[3-9]\d{9}$/
    return regex.test(value)
  },

  // 国际电话号码
  internationalPhone: (value: string): boolean => {
    if (!value) return true
    const regex = /^\+?[\d\s-]{10,}$/
    return regex.test(value)
  },

  // URL验证
  url: (value: string): boolean => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  // 身份证号验证
  idCard: (value: string): boolean => {
    if (!value) return true
    const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (!regex.test(value)) return false
    
    // 18位身份证校验
    if (value.length === 18) {
      const factors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
      const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
      let sum = 0
      for (let i = 0; i < 17; i++) {
        sum += parseInt(value[i]) * factors[i]
      }
      const checkCode = checkCodes[sum % 11]
      return value[17].toUpperCase() === checkCode
    }
    
    return true
  },

  // 银行卡号验证（Luhn算法）
  bankCard: (value: string): boolean => {
    if (!value) return true
    const cleaned = value.replace(/\s/g, '')
    if (!/^\d{13,19}$/.test(cleaned)) return false
    
    // Luhn算法
    let sum = 0
    let isEven = false
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    return sum % 10 === 0
  },

  // 最小值验证
  min: (value: number, minValue: number): boolean => {
    if (value === null || value === undefined || value === '') return true
    return Number(value) >= minValue
  },

  // 最大值验证
  max: (value: number, maxValue: number): boolean => {
    if (value === null || value === undefined || value === '') return true
    return Number(value) <= maxValue
  },

  // 最小长度验证
  minLength: (value: string, minLen: number): boolean => {
    if (!value) return true
    return value.length >= minLen
  },

  // 最大长度验证
  maxLength: (value: string, maxLen: number): boolean => {
    if (!value) return true
    return value.length <= maxLen
  },

  // 范围验证
  range: (value: number, min: number, max: number): boolean => {
    if (value === null || value === undefined || value === '') return true
    const num = Number(value)
    return num >= min && num <= max
  },

  // 数字验证
  numeric: (value: string): boolean => {
    if (!value) return true
    return /^-?\d+(\.\d+)?$/.test(value)
  },

  // 整数验证
  integer: (value: string): boolean => {
    if (!value) return true
    return /^-?\d+$/.test(value)
  },

  // 正数验证
  positive: (value: string | number): boolean => {
    if (value === null || value === undefined || value === '') return true
    return Number(value) > 0
  },

  // 字母验证
  alpha: (value: string): boolean => {
    if (!value) return true
    return /^[a-zA-Z]+$/.test(value)
  },

  // 字母数字验证
  alphanumeric: (value: string): boolean => {
    if (!value) return true
    return /^[a-zA-Z0-9]+$/.test(value)
  },

  // 日期验证
  date: (value: string): boolean => {
    if (!value) return true
    const date = new Date(value)
    return !isNaN(date.getTime())
  },

  // 日期范围验证
  dateRange: (value: string, minDate?: string, maxDate?: string): boolean => {
    if (!value) return true
    const date = new Date(value)
    if (isNaN(date.getTime())) return false
    
    if (minDate) {
      const min = new Date(minDate)
      if (date < min) return false
    }
    if (maxDate) {
      const max = new Date(maxDate)
      if (date > max) return false
    }
    return true
  },

  // 密码强度验证
  password: (value: string, strength: 'weak' | 'medium' | 'strong' = 'medium'): boolean => {
    if (!value) return true
    
    const hasLower = /[a-z]/.test(value)
    const hasUpper = /[A-Z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    const hasLength = value.length >= 8
    
    switch (strength) {
      case 'weak':
        return hasLength && (hasLower || hasUpper || hasNumber)
      case 'medium':
        return hasLength && ((hasLower && hasNumber) || (hasUpper && hasNumber))
      case 'strong':
        return hasLength && hasLower && hasUpper && hasNumber && hasSpecial
      default:
        return hasLength
    }
  },

  // 确认密码验证
  confirmPassword: (value: string, password: string): boolean => {
    return value === password
  },

  // 文件大小验证（MB）
  fileSize: (file: File, maxSizeMB: number): boolean => {
    if (!file) return true
    return file.size <= maxSizeMB * 1024 * 1024
  },

  // 文件类型验证
  fileType: (file: File, allowedTypes: string[]): boolean => {
    if (!file) return true
    return allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.includes(type)
    })
  },

  // 图片尺寸验证
  imageDimensions: async (
    file: File, 
    options: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number }
  ): Promise<boolean> => {
    if (!file || !file.type.startsWith('image/')) return true
    
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const { minWidth, maxWidth, minHeight, maxHeight } = options
        let valid = true
        
        if (minWidth && img.width < minWidth) valid = false
        if (maxWidth && img.width > maxWidth) valid = false
        if (minHeight && img.height < minHeight) valid = false
        if (maxHeight && img.height > maxHeight) valid = false
        
        URL.revokeObjectURL(img.src)
        resolve(valid)
      }
      img.onerror = () => resolve(false)
      img.src = URL.createObjectURL(file)
    })
  },

  // 正则表达式验证
  pattern: (value: string, regex: RegExp): boolean => {
    if (!value) return true
    return regex.test(value)
  },

  // 中文验证
  chinese: (value: string): boolean => {
    if (!value) return true
    return /^[\u4e00-\u9fa5]+$/.test(value)
  },

  // 英文名验证
  englishName: (value: string): boolean => {
    if (!value) return true
    return /^[a-zA-Z][a-zA-Z\s'-]*$/.test(value)
  },

  // 邮政编码验证（中国）
  postalCode: (value: string): boolean => {
    if (!value) return true
    return /^\d{6}$/.test(value)
  },

  // IPv4地址验证
  ipv4: (value: string): boolean => {
    if (!value) return true
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!regex.test(value)) return false
    
    const parts = value.split('.')
    return parts.every(part => {
      const num = parseInt(part)
      return num >= 0 && num <= 255
    })
  },

  // MAC地址验证
  macAddress: (value: string): boolean => {
    if (!value) return true
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value)
  },

  // 信用卡号验证
  creditCard: (value: string): boolean => {
    if (!value) return true
    const cleaned = value.replace(/[\s-]/g, '')
    return validators.bankCard(cleaned)
  },

  // 社会信用代码验证（中国企业）
  socialCreditCode: (value: string): boolean => {
    if (!value) return true
    return /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(value)
  },

  // 车牌号验证（中国）
  licensePlate: (value: string): boolean => {
    if (!value) return true
    // 支持普通车牌和新能源车牌
    return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/.test(value)
  }
}

// 默认错误消息
const defaultMessages: Record<string, string | ((value?: any) => string)> = {
  required: '此字段为必填项',
  email: '请输入有效的邮箱地址',
  phone: '请输入有效的手机号码',
  internationalPhone: '请输入有效的电话号码',
  url: '请输入有效的URL地址',
  idCard: '请输入有效的身份证号',
  bankCard: '请输入有效的银行卡号',
  min: (value) => `不能小于 ${value}`,
  max: (value) => `不能大于 ${value}`,
  minLength: (value) => `长度不能少于 ${value} 个字符`,
  maxLength: (value) => `长度不能超过 ${value} 个字符`,
  range: (min, max) => `请输入 ${min} 到 ${max} 之间的值`,
  numeric: '请输入有效的数字',
  integer: '请输入整数',
  positive: '请输入正数',
  alpha: '只能输入字母',
  alphanumeric: '只能输入字母和数字',
  date: '请输入有效的日期',
  password: '密码强度不够',
  confirmPassword: '两次输入的密码不一致',
  fileSize: (value) => `文件大小不能超过 ${value}MB`,
  fileType: '不支持的文件类型',
  pattern: '格式不正确',
  chinese: '请输入中文',
  englishName: '请输入有效的英文姓名',
  postalCode: '请输入有效的邮政编码',
  ipv4: '请输入有效的IP地址',
  macAddress: '请输入有效的MAC地址',
  creditCard: '请输入有效的信用卡号',
  socialCreditCode: '请输入有效的社会信用代码',
  licensePlate: '请输入有效的车牌号'
}

/**
 * 验证单个字段
 */
export function validateField(value: any, rules: ValidationRule[], formData?: any): ValidationResult {
  const errors: string[] = []
  
  for (const rule of rules) {
    let isValid = true
    let message = rule.message
    
    switch (rule.type) {
      case 'required':
        isValid = validators.required(value)
        message = message || (defaultMessages.required as string)
        break
        
      case 'email':
        isValid = validators.email(value)
        message = message || (defaultMessages.email as string)
        break
        
      case 'phone':
        isValid = validators.phone(value)
        message = message || (defaultMessages.phone as string)
        break
        
      case 'url':
        isValid = validators.url(value)
        message = message || (defaultMessages.url as string)
        break
        
      case 'min':
        isValid = validators.min(value, rule.value)
        message = message || (defaultMessages.min as (v: any) => string)(rule.value)
        break
        
      case 'max':
        isValid = validators.max(value, rule.value)
        message = message || (defaultMessages.max as (v: any) => string)(rule.value)
        break
        
      case 'minLength':
        isValid = validators.minLength(value, rule.value)
        message = message || (defaultMessages.minLength as (v: any) => string)(rule.value)
        break
        
      case 'maxLength':
        isValid = validators.maxLength(value, rule.value)
        message = message || (defaultMessages.maxLength as (v: any) => string)(rule.value)
        break
        
      case 'pattern':
        isValid = validators.pattern(value, rule.value)
        message = message || (defaultMessages.pattern as string)
        break
        
      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value, formData)
          if (typeof result === 'string') {
            isValid = false
            message = result
          } else {
            isValid = result
          }
        }
        break
    }
    
    if (!isValid && message) {
      errors.push(message)
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
  formData: Record<string, any>,
  validations: FieldValidation[]
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {}
  
  for (const validation of validations) {
    const value = formData[validation.field]
    results[validation.field] = validateField(value, validation.rules, formData)
  }
  
  return results
}

/**
 * 检查表单是否有效
 */
export function isFormValid(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).every(result => result.valid)
}

/**
 * 获取所有错误消息
 */
export function getAllErrors(results: Record<string, ValidationResult>): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  
  for (const [field, result] of Object.entries(results)) {
    if (!result.valid) {
      errors[field] = result.errors
    }
  }
  
  return errors
}

/**
 * 获取第一个错误消息
 */
export function getFirstError(results: Record<string, ValidationResult>): string | null {
  for (const result of Object.values(results)) {
    if (!result.valid && result.errors.length > 0) {
      return result.errors[0]
    }
  }
  return null
}

/**
 * 创建验证规则的快捷方法
 */
export const rules = {
  required: (message?: string): ValidationRule => ({
    type: 'required',
    message
  }),
  
  email: (message?: string): ValidationRule => ({
    type: 'email',
    message
  }),
  
  phone: (message?: string): ValidationRule => ({
    type: 'phone',
    message
  }),
  
  url: (message?: string): ValidationRule => ({
    type: 'url',
    message
  }),
  
  min: (value: number, message?: string): ValidationRule => ({
    type: 'min',
    value,
    message
  }),
  
  max: (value: number, message?: string): ValidationRule => ({
    type: 'max',
    value,
    message
  }),
  
  minLength: (value: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value,
    message
  }),
  
  maxLength: (value: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value,
    message
  }),
  
  pattern: (regex: RegExp, message?: string): ValidationRule => ({
    type: 'pattern',
    value: regex,
    message
  }),
  
  custom: (validator: (value: any, formData?: any) => boolean | string, message?: string): ValidationRule => ({
    type: 'custom',
    validator,
    message
  })
}

/**
 * 密码强度计算
 */
export function calculatePasswordStrength(password: string): {
  score: number
  level: 'weak' | 'medium' | 'strong' | 'very-strong'
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []
  
  if (!password) {
    return { score: 0, level: 'weak', feedback: ['请输入密码'] }
  }
  
  // 长度评分
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (password.length < 8) feedback.push('密码长度至少8位')
  
  // 小写字母
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('添加小写字母')
  
  // 大写字母
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('添加大写字母')
  
  // 数字
  if (/\d/.test(password)) score += 1
  else feedback.push('添加数字')
  
  // 特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2
  else feedback.push('添加特殊字符')
  
  // 确定强度级别
  let level: 'weak' | 'medium' | 'strong' | 'very-strong'
  if (score < 3) level = 'weak'
  else if (score < 5) level = 'medium'
  else if (score < 7) level = 'strong'
  else level = 'very-strong'
  
  return { score, level, feedback }
}
