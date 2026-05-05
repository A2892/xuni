/**
 * 数据导出工具
 * 支持导出为 JSON, CSV, Excel 格式
 */

// 将对象数组转换为CSV字符串
export function arrayToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) return ''
  
  // 获取所有键作为表头
  const keys = headers || Object.keys(data[0])
  
  // 创建表头行
  const headerRow = keys.map(key => `"${key}"`).join(',')
  
  // 创建数据行
  const dataRows = data.map(item => {
    return keys.map(key => {
      const value = item[key]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`
      return value
    }).join(',')
  })
  
  return [headerRow, ...dataRows].join('\n')
}

// 下载文件
export function downloadFile(content: string | Blob, filename: string, mimeType?: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 导出为JSON
export function exportToJSON(data: any, filename: string = 'export.json') {
  const jsonString = JSON.stringify(data, null, 2)
  downloadFile(jsonString, filename, 'application/json')
}

// 导出为CSV
export function exportToCSV(data: any[], filename: string = 'export.csv', headers?: string[]) {
  const csvString = '\uFEFF' + arrayToCSV(data, headers) // 添加BOM以支持中文
  downloadFile(csvString, filename, 'text/csv;charset=utf-8')
}

// 导出为纯文本
export function exportToText(text: string, filename: string = 'export.txt') {
  downloadFile(text, filename, 'text/plain;charset=utf-8')
}

// 格式化日期为文件名安全的字符串
export function formatDateForFilename(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

// 生成唯一文件名
export function generateFilename(prefix: string, extension: string, includeDate: boolean = true): string {
  const date = includeDate ? `_${formatDateForFilename()}` : ''
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}${date}_${random}.${extension}`
}

// 批量导出文档
export interface ExportOptions {
  format: 'json' | 'csv' | 'txt'
  includeMetadata?: boolean
  flattenData?: boolean
}

export function exportDocuments(documents: any[], options: ExportOptions = { format: 'json' }) {
  const { format, includeMetadata = true, flattenData = false } = options
  const timestamp = formatDateForFilename()
  
  let exportData = documents
  
  if (!includeMetadata) {
    exportData = documents.map(doc => doc.data || doc)
  }
  
  if (flattenData && format === 'csv') {
    // 扁平化嵌套数据以便CSV导出
    exportData = documents.map(doc => flattenObject(doc))
  }
  
  switch (format) {
    case 'json':
      exportToJSON(exportData, `documents_${timestamp}.json`)
      break
    case 'csv':
      exportToCSV(Array.isArray(exportData) ? exportData : [exportData], `documents_${timestamp}.csv`)
      break
    case 'txt':
      exportToText(JSON.stringify(exportData, null, 2), `documents_${timestamp}.txt`)
      break
  }
}

// 扁平化嵌套对象
export function flattenObject(obj: any, prefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {}
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]
      
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(result, flattenObject(value, newKey))
      } else if (Array.isArray(value)) {
        result[newKey] = JSON.stringify(value)
      } else {
        result[newKey] = value
      }
    }
  }
  
  return result
}

// 数据统计
export interface DataStats {
  totalDocuments: number
  byType: Record<string, number>
  byDate: Record<string, number>
  recentActivity: {
    lastDay: number
    lastWeek: number
    lastMonth: number
  }
}

export function calculateStats(documents: Array<{ document_type: string; created_at?: string; updated_at?: string }>): DataStats {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const byType: Record<string, number> = {}
  const byDate: Record<string, number> = {}
  let lastDay = 0, lastWeek = 0, lastMonth = 0
  
  documents.forEach(doc => {
    // 按类型统计
    byType[doc.document_type] = (byType[doc.document_type] || 0) + 1
    
    // 按日期统计
    const date = doc.updated_at || doc.created_at
    if (date) {
      const dateKey = date.slice(0, 10)
      byDate[dateKey] = (byDate[dateKey] || 0) + 1
      
      const docDate = new Date(date)
      if (docDate >= oneDayAgo) lastDay++
      if (docDate >= oneWeekAgo) lastWeek++
      if (docDate >= oneMonthAgo) lastMonth++
    }
  })
  
  return {
    totalDocuments: documents.length,
    byType,
    byDate,
    recentActivity: { lastDay, lastWeek, lastMonth }
  }
}

// 数据验证
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateData(data: any, schema: Record<string, { required?: boolean; type?: string; minLength?: number; maxLength?: number }>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]
    
    // 检查必填字段
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`字段 "${field}" 是必填项`)
      continue
    }
    
    if (value !== undefined && value !== null) {
      // 检查类型
      if (rules.type && typeof value !== rules.type) {
        errors.push(`字段 "${field}" 类型应为 ${rules.type}`)
      }
      
      // 检查长度
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`字段 "${field}" 长度不能小于 ${rules.minLength}`)
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          warnings.push(`字段 "${field}" 长度超过建议值 ${rules.maxLength}`)
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
