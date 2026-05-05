import { supabase } from '@/lib/supabase'

export interface SavedData {
  id?: string
  user_id?: string
  document_type: 
    // 学生类
    | 'transcript' 
    | 'admission' 
    | 'schedule' 
    | 'enrollment' 
    | 'student_id' 
    | 'driver' 
    | 'student-record' 
    | 'academic_report' 
    | 'school_transcript'
    | 'enrollment_cert'
    | 'recommendation_letter'
    // 金融类
    | 'bank_statement'
    | 'stock_statement'
    | 'stock'
    | 'fund_statement'
    | 'fund'
    | 'insurance'
    | 'loan_statement'
    | 'loan'
    | 'wealth_report'
    | 'wealth'
    | 'budget_report'
    | 'budget'
    | 'credit_card'
    | 'income_certificate'
    | 'income'
    | 'expense_report'
    | 'expense'
    | 'crypto_portfolio'
    | 'crypto'
    // 文档类
    | 'invoice'
    | 'certificate'
    | 'utility_bill'
    | 'cn_bill'
    | 'flight'
    | 'hotel'
    | 'cn_hotel'
    | 'passport'
    | 'visa'
    | 'payslip'
    | 'resume'
    | 'medical_report'
    | 'tax_form'
    // 社交类
    | 'wechat'
    | 'qq'
    | 'business_card'
    | 'official_seal'
    // 工具类
    | 'qrcode'
    | 'barcode'
    | 'signature'
    | 'watermark'
    | 'avatar'
    | 'receipt'
    | 'contract'
    | 'certificate_gen'
    | 'address'
    | 'fake_data'
  name: string
  data: any
  created_at?: string
  updated_at?: string
}

// 保存数据到 Supabase
export async function saveData(documentType: SavedData['document_type'], name: string, data: any) {
  console.log('[saveData] 开始保存:', { documentType, name })
  
  // 如果Supabase未配置，返回错误
  if (!supabase) {
    console.error('[saveData] Supabase未配置')
    return { 
      success: false,
      error: new Error('Supabase未配置。请在项目根目录创建 .env 并设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。'),
      message: 'Supabase未配置。请在项目根目录创建 .env 并设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。'
    }
  }

  try {
    // 尝试获取当前用户（若已登录）并将 user_id 记录到表中，兼容 RLS
    let userId: string | null = null
    try {
      console.log('[saveData] 获取用户信息...')
      const userRes = await supabase.auth.getUser()
      userId = (userRes.data && (userRes.data as any).user && (userRes.data as any).user.id) || null
      console.log('[saveData] 用户ID:', userId)
    } catch (e) {
      // ignore - if auth not configured or no user, proceed without user_id
      console.log('[saveData] 未登录或认证失败，继续无用户保存')
      userId = null
    }

    const insertPayload: any = {
      document_type: documentType,
      name: name,
      data: data,
      updated_at: new Date().toISOString()
    }

    if (userId) insertPayload.user_id = userId

    console.log('[saveData] 插入数据到 saved_documents...')
    // 首先正常尝试插入
    try {
      const { data: savedData, error } = await supabase
        .from('saved_documents')
        .insert(insertPayload)
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('[saveData] 保存成功:', savedData)
      return { success: true, data: savedData }
    } catch (err: any) {
      console.error('[saveData] 插入失败:', err)
      const msg = (err && err.message) || String(err)

      // 如果是 document_type 的 check constraint 导致的失败
      if (msg.includes('violates check constraint') || msg.includes('document_type')) {
        console.error('[saveData] document_type 检查约束失败。请在 Supabase 中运行 scripts/add_receipt_type.sql 来添加新的文档类型')
        return { 
          success: false, 
          error: err, 
          message: `文档类型 "${documentType}" 未被数据库支持。请联系管理员更新数据库约束。` 
        }
      }

      throw err
    }
  } catch (error) {
    console.error('[saveData] 保存失败:', error)
    const message = (error && (error as any).message) || String(error)
    return { success: false, error, message }
  }
}

// 更新已保存的数据
export async function updateData(id: string, name: string, data: any) {
  if (!supabase) {
    return { success: false, error: new Error('Supabase未配置'), message: 'Supabase未配置。请在项目根目录创建 .env 并设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。' }
  }

  try {
    // 如果有登录用户，确保更新带有 user_id（RLS 需要）
    let userId: string | null = null
    try {
      const userRes = await supabase.auth.getUser()
      userId = (userRes.data && (userRes.data as any).user && (userRes.data as any).user.id) || null
    } catch (e) {
      userId = null
    }

    const updatePayload: any = {
      name: name,
      data: data,
      updated_at: new Date().toISOString()
    }

    if (userId) updatePayload.user_id = userId

    const { data: updatedData, error } = await supabase
      .from('saved_documents')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data: updatedData }
  } catch (error) {
    console.error('更新失败:', error)
    const message = (error && (error as any).message) || String(error)
    return { success: false, error, message }
  }
}

// 获取所有已保存的文档列表
export async function getSavedDocuments(documentType?: SavedData['document_type']) {
  if (!supabase) {
    return { success: false, error: new Error('Supabase未配置'), message: 'Supabase未配置。请在项目根目录创建 .env 并设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。', data: [] }
  }

  try {
    // CockroachDB 迁移后不需要按 user_id 过滤（单管理员系统，且历史数据 user_id 为 null）
    let query = supabase.from('saved_documents').select('*').order('updated_at', { ascending: false })

    if (documentType) {
      query = query.eq('document_type', documentType)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('获取数据失败:', error)
    const message = (error && (error as any).message) || String(error)
    return { success: false, error, message, data: [] }
  }
}

// 加载特定文档
export async function loadData(id: string) {
  if (!supabase) {
    return { success: false, error: new Error('Supabase未配置'), message: 'Supabase未配置。请在项目根目录创建 .env 并设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。' }
  }

  try {
    const { data, error } = await supabase
      .from('saved_documents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('加载数据失败:', error)
    const message = (error && (error as any).message) || String(error)
    return { success: false, error, message }
  }
}

// 删除文档
export async function deleteData(id: string) {
  if (!supabase) {
    return { success: false, error: new Error('Supabase未配置'), message: 'Supabase未配置。请在项目根目录创建 .env 并设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。' }
  }

  try {
    const { error } = await supabase
      .from('saved_documents')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('删除失败:', error)
    const message = (error && (error as any).message) || String(error)
    return { success: false, error, message }
  }
}
