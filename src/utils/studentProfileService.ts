import { supabase } from '@/lib/supabase'
import type { StudentDocument, StudentProfile } from '@/types/student'

/**
 * 创建或更新学生档案
 */
export async function saveStudentProfile(profile: Partial<StudentProfile>): Promise<{ success: boolean; data?: StudentProfile; error?: any }> {
  if (!supabase) {
    return {
      success: false,
      error: new Error('Supabase未配置')
    }
  }

  try {
    const profileData = {
      student_id: profile.student_id,
      student_name: profile.student_name,
      email: profile.email,
      phone: profile.phone,
      photo_url: profile.photo_url,
      major: profile.major,
      school: profile.school,
      enrollment_date: profile.enrollment_date,
      expected_graduation: profile.expected_graduation,
      updated_at: new Date().toISOString()
    }

    // 检查是否已存在
    const { data: existing } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('student_id', profile.student_id)
      .single()

    let result
    if (existing) {
      // 更新
      result = await supabase
        .from('student_profiles')
        .update(profileData)
        .eq('student_id', profile.student_id)
        .select()
        .single()
    } else {
      // 创建
      result = await supabase
        .from('student_profiles')
        .insert({ ...profileData, created_at: new Date().toISOString() })
        .select()
        .single()
    }

    if (result.error) throw result.error

    return { success: true, data: result.data as StudentProfile }
  } catch (error) {
    console.error('保存学生档案失败:', error)
    return { success: false, error }
  }
}

/**
 * 获取学生档案
 */
export async function getStudentProfile(studentId: string): Promise<StudentProfile | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('student_id', studentId)
      .single()

    if (error) throw error
    return data as StudentProfile
  } catch (error) {
    console.error('获取学生档案失败:', error)
    return null
  }
}

/**
 * 获取所有学生档案（用于下拉选择）
 */
export async function getStudentProfiles(): Promise<{ success: boolean; data?: StudentProfile[]; error?: any }> {
  if (!supabase) {
    return { success: false, data: [], error: new Error('Supabase未配置') }
  }

  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .order('student_name', { ascending: true })

    if (error) throw error
    
    return { 
      success: true, 
      data: data as StudentProfile[] 
    }
  } catch (error) {
    console.error('获取学生档案列表失败:', error)
    return { 
      success: false, 
      data: [], 
      error 
    }
  }
}

/**
 * 获取所有学生档案（旧接口，保持兼容性）
 */
export async function getAllStudentProfiles(): Promise<StudentProfile[]> {
  const result = await getStudentProfiles()
  return result.data || []
}

/**
 * 保存学生文档
 */
export async function saveStudentDocument(doc: Partial<StudentDocument>): Promise<{ success: boolean; data?: StudentDocument; error?: any }> {
  if (!supabase) {
    return {
      success: false,
      error: new Error('Supabase未配置')
    }
  }

  try {
    const docData: Record<string, any> = {
      student_id: doc.student_id,
      student_name: doc.student_name,
      document_type: doc.document_type,
      document_name: doc.document_name,
      file_url: doc.file_url,
      file_size: doc.file_size,
      thumbnail_url: doc.thumbnail_url,
      data: doc.data,
      status: doc.status || 'draft',
      tags: doc.tags || [],
      notes: doc.notes,
      updated_at: new Date().toISOString()
    }
    
    // 支持 folder_id 字段
    if (doc.folder_id !== undefined) {
      docData.folder_id = doc.folder_id
    }

    let result
    if (doc.id) {
      // 更新
      result = await supabase
        .from('student_documents')
        .update(docData)
        .eq('id', doc.id)
        .select()
        .single()
    } else {
      // 创建
      result = await supabase
        .from('student_documents')
        .insert({ ...docData, created_at: new Date().toISOString() })
        .select()
        .single()
    }

    if (result.error) throw result.error

    return { success: true, data: result.data as StudentDocument }
  } catch (error) {
    console.error('保存学生文档失败:', error)
    return { success: false, error }
  }
}

/**
 * 获取学生的所有文档
 */
export async function getStudentDocuments(studentId: string): Promise<StudentDocument[]> {
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('student_documents')
      .select('*')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data as StudentDocument[]
  } catch (error) {
    console.error('获取学生文档失败:', error)
    return []
  }
}

/**
 * 删除学生文档（软删除，移到回收站）
 */
export async function deleteStudentDocument(id: string): Promise<{ success: boolean; error?: any }> {
  if (!supabase) {
    return {
      success: false,
      error: new Error('Supabase未配置')
    }
  }

  try {
    // 尝试软删除：设置 deleted_at 字段
    const { error: softDeleteError } = await supabase
      .from('student_documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    // 如果软删除失败（可能是因为列不存在），尝试直接删除
    if (softDeleteError) {
      console.warn('软删除失败，尝试直接删除:', softDeleteError.message)
      
      const { error: hardDeleteError } = await supabase
        .from('student_documents')
        .delete()
        .eq('id', id)
      
      if (hardDeleteError) throw hardDeleteError
    }

    return { success: true }
  } catch (error) {
    console.error('删除学生文档失败:', error)
    return { success: false, error }
  }
}

/**
 * 上传文档文件到 Storage
 */
export async function uploadDocumentFile(file: File, studentId: string, documentType: string): Promise<{ success: boolean; url?: string; error?: any }> {
  if (!supabase) {
    return {
      success: false,
      error: new Error('Supabase未配置')
    }
  }

  try {
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${studentId}_${documentType}_${timestamp}.${fileExt}`
    const storagePath = `documents/${studentId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('student-media')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('student-media')
      .getPublicUrl(storagePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('上传文档文件失败:', error)
    return { success: false, error }
  }
}
