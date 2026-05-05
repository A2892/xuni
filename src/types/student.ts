export interface StudentDocument {
  id: string
  student_id: string
  student_name: string
  document_type: 'student_id' | 'enrollment' | 'transcript' | 'degree' | 'diploma' | 'scholarship' | 'recommendation' | 'internship' | 'admission' | 'other'
  document_name: string
  file_url?: string
  file_size?: number
  folder_id?: string // 文件夹ID，用于子文件夹分类
  thumbnail_url?: string
  data?: any // 存储文档的数据（如果是在线生成的）
  status: 'draft' | 'completed' | 'archived'
  tags?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface StudentProfile {
  id: string
  student_id: string
  student_name: string
  email?: string
  phone?: string
  photo_url?: string
  major?: string
  school?: string
  enrollment_date?: string
  expected_graduation?: string
  documents: StudentDocument[]
  created_at: string
  updated_at: string
}

export const DOCUMENT_TYPE_LABELS: Record<StudentDocument['document_type'], string> = {
  student_id: '学生证',
  enrollment: '在读证明',
  transcript: '成绩单',
  degree: '学位证',
  diploma: '毕业证',
  scholarship: '奖学金证明',
  recommendation: '推荐信',
  internship: '实习证明',
  admission: '录取通知书',
  other: '其他文档'
}
