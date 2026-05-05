/**
 * 模板管理系统
 * 支持保存、加载、分享模板
 */

import { supabase } from '@/lib/supabase'

export interface Template {
  id?: string
  user_id?: string
  name: string
  description?: string
  category: string
  document_type: string
  data: any
  is_public: boolean
  tags: string[]
  use_count: number
  rating: number
  created_at?: string
  updated_at?: string
}

export interface TemplateCategory {
  id: string
  name: string
  icon: string
  description: string
  templates: Template[]
}

// 预设模板分类
export const templateCategories: TemplateCategory[] = [
  {
    id: 'student',
    name: '学生证件',
    icon: '🎓',
    description: '学生证、在读证明、成绩单等',
    templates: []
  },
  {
    id: 'finance',
    name: '金融财务',
    icon: '💰',
    description: '银行对账单、发票、股票持仓等',
    templates: []
  },
  {
    id: 'travel',
    name: '出行住宿',
    icon: '✈️',
    description: '机票行程单、酒店预订、护照等',
    templates: []
  },
  {
    id: 'business',
    name: '商务办公',
    icon: '💼',
    description: '名片、合同、证书等',
    templates: []
  },
  {
    id: 'social',
    name: '社交媒体',
    icon: '📱',
    description: '微信、QQ聊天记录等',
    templates: []
  },
  {
    id: 'other',
    name: '其他模板',
    icon: '📄',
    description: '其他类型的模板',
    templates: []
  }
]

// 内置默认模板
export const defaultTemplates: Omit<Template, 'id' | 'user_id'>[] = [
  {
    name: '标准学生证',
    description: '常见大学学生证模板',
    category: 'student',
    document_type: 'student_id',
    data: {
      universityName: '清华大学',
      universityNameEn: 'Tsinghua University',
      studentName: '张三',
      studentId: '2024010001',
      department: '计算机科学与技术系',
      major: '计算机科学与技术',
      grade: '2024级',
      validUntil: '2028-07-01',
      issueDate: '2024-09-01'
    },
    is_public: true,
    tags: ['学生证', '大学', '标准'],
    use_count: 0,
    rating: 5
  },
  {
    name: '中国银行对账单',
    description: '中国银行月度对账单模板',
    category: 'finance',
    document_type: 'bank_statement',
    data: {
      cardInfo: {
        bank: '中国银行',
        cardType: 'visa',
        currency: 'CNY',
        accountType: '个人储蓄账户'
      },
      settings: {
        language: 'zh',
        showLogo: true,
        theme: 'professional'
      }
    },
    is_public: true,
    tags: ['银行', '中国银行', '对账单'],
    use_count: 0,
    rating: 5
  },
  {
    name: '增值税普通发票',
    description: '标准增值税普通发票模板',
    category: 'finance',
    document_type: 'invoice',
    data: {
      invoiceType: 'normal',
      taxRate: '13%',
      currency: 'CNY'
    },
    is_public: true,
    tags: ['发票', '增值税', '普通发票'],
    use_count: 0,
    rating: 5
  },
  {
    name: '国航机票行程单',
    description: '中国国际航空公司电子行程单',
    category: 'travel',
    document_type: 'flight',
    data: {
      airline: 'Air China',
      airlineCode: 'CA',
      ticketType: 'economy'
    },
    is_public: true,
    tags: ['机票', '国航', '行程单'],
    use_count: 0,
    rating: 5
  },
  {
    name: '希尔顿酒店确认函',
    description: '希尔顿酒店预订确认模板',
    category: 'travel',
    document_type: 'hotel',
    data: {
      hotelChain: 'Hilton',
      roomType: 'Deluxe King',
      currency: 'USD'
    },
    is_public: true,
    tags: ['酒店', '希尔顿', '预订'],
    use_count: 0,
    rating: 5
  },
  {
    name: '专业简历模板',
    description: '现代化专业简历设计',
    category: 'business',
    document_type: 'resume',
    data: {
      style: 'modern',
      sections: ['基本信息', '工作经历', '教育背景', '技能特长', '项目经验']
    },
    is_public: true,
    tags: ['简历', '求职', '专业'],
    use_count: 0,
    rating: 5
  }
]

// 保存模板
export async function saveTemplate(template: Omit<Template, 'id' | 'use_count' | 'rating'>): Promise<{ success: boolean; data?: Template; message?: string }> {
  if (!supabase) {
    // 本地存储
    const templates = getLocalTemplates()
    const newTemplate: Template = {
      ...template,
      id: `local_${Date.now()}`,
      use_count: 0,
      rating: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    templates.push(newTemplate)
    localStorage.setItem('vsid_templates', JSON.stringify(templates))
    return { success: true, data: newTemplate }
  }

  try {
    let userId: string | null = null
    try {
      const userRes = await supabase.auth.getUser()
      userId = userRes.data?.user?.id || null
    } catch (e) {
      userId = null
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        ...template,
        user_id: userId,
        use_count: 0,
        rating: 0
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('保存模板失败:', error)
    return { success: false, message: (error as any).message }
  }
}

// 获取本地模板
export function getLocalTemplates(): Template[] {
  try {
    const stored = localStorage.getItem('vsid_templates')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// 获取模板列表
export async function getTemplates(options?: { 
  category?: string; 
  document_type?: string; 
  search?: string;
  is_public?: boolean;
  user_only?: boolean;
}): Promise<{ success: boolean; data: Template[]; message?: string }> {
  // 合并默认模板和本地模板
  let templates: Template[] = [...defaultTemplates.map((t, i) => ({ ...t, id: `default_${i}` }))]
  templates.push(...getLocalTemplates())

  if (!supabase) {
    // 仅使用本地数据
    if (options?.category) {
      templates = templates.filter(t => t.category === options.category)
    }
    if (options?.document_type) {
      templates = templates.filter(t => t.document_type === options.document_type)
    }
    if (options?.search) {
      const search = options.search.toLowerCase()
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search) ||
        t.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }
    return { success: true, data: templates }
  }

  try {
    let query = supabase.from('templates').select('*')
    
    if (options?.category) {
      query = query.eq('category', options.category)
    }
    if (options?.document_type) {
      query = query.eq('document_type', options.document_type)
    }
    if (options?.is_public !== undefined) {
      query = query.eq('is_public', options.is_public)
    }
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    const { data, error } = await query.order('use_count', { ascending: false })

    if (error) throw error
    
    // 合并数据库模板和本地模板
    const dbTemplates = data || []
    return { success: true, data: [...templates, ...dbTemplates] }
  } catch (error) {
    console.error('获取模板失败:', error)
    return { success: true, data: templates, message: (error as any).message }
  }
}

// 使用模板（增加使用计数）
export async function useTemplate(templateId: string): Promise<Template | null> {
  if (templateId.startsWith('default_')) {
    const index = parseInt(templateId.replace('default_', ''))
    return defaultTemplates[index] as Template
  }

  if (templateId.startsWith('local_')) {
    const templates = getLocalTemplates()
    return templates.find(t => t.id === templateId) || null
  }

  if (!supabase) return null

  try {
    // 增加使用次数
    await supabase.rpc('increment_template_use', { template_id: templateId })
    
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('使用模板失败:', error)
    return null
  }
}

// 删除模板
export async function deleteTemplate(templateId: string): Promise<{ success: boolean; message?: string }> {
  if (templateId.startsWith('local_')) {
    const templates = getLocalTemplates().filter(t => t.id !== templateId)
    localStorage.setItem('vsid_templates', JSON.stringify(templates))
    return { success: true }
  }

  if (!supabase) {
    return { success: false, message: '无法删除此模板' }
  }

  try {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('删除模板失败:', error)
    return { success: false, message: (error as any).message }
  }
}

// 评价模板
export async function rateTemplate(templateId: string, rating: number): Promise<{ success: boolean }> {
  if (!supabase || templateId.startsWith('default_') || templateId.startsWith('local_')) {
    return { success: false }
  }

  try {
    await supabase.rpc('rate_template', { template_id: templateId, new_rating: rating })
    return { success: true }
  } catch (error) {
    console.error('评价模板失败:', error)
    return { success: false }
  }
}

// 导出模板
export function exportTemplate(template: Template): string {
  return JSON.stringify({
    name: template.name,
    description: template.description,
    category: template.category,
    document_type: template.document_type,
    data: template.data,
    tags: template.tags,
    exported_at: new Date().toISOString()
  }, null, 2)
}

// 导入模板
export function importTemplate(jsonString: string): Omit<Template, 'id' | 'user_id' | 'use_count' | 'rating'> | null {
  try {
    const parsed = JSON.parse(jsonString)
    if (!parsed.name || !parsed.document_type || !parsed.data) {
      throw new Error('模板格式不正确')
    }
    return {
      name: parsed.name,
      description: parsed.description || '',
      category: parsed.category || 'other',
      document_type: parsed.document_type,
      data: parsed.data,
      is_public: false,
      tags: parsed.tags || []
    }
  } catch (error) {
    console.error('导入模板失败:', error)
    return null
  }
}
