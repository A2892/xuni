import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface DegreeCertificateData {
  // 学校信息
  schoolName: string
  schoolNameEn: string
  schoolLogo: string
  presidentName: string
  
  // 学生信息
  studentName: string
  studentNameEn: string
  gender: 'male' | 'female'
  birthDate: string
  nationality: string
  idNumber: string
  photo: string
  
  // 学位信息
  degreeType: 'bachelor' | 'master' | 'doctor'
  degreeCategory: string // 工学、理学、文学等
  major: string
  majorEn: string
  department: string
  
  // 证书信息
  certificateNumber: string
  registrationNumber: string
  approvalDate: string
  conferDate: string
  issueDate: string
  
  // 论文信息
  thesisTitle: string
  thesisTitleEn: string
  advisor: string
  defenseDate: string
  
  // 样式设置
  template: 'official' | 'classic' | 'modern'
  borderStyle: 'red' | 'gold' | 'blue'
  showPhoto: boolean
  showSeal: boolean
  showNationalEmblem: boolean
  showQRCode: boolean
}

export const degreeTypes = [
  { id: 'bachelor', label: '学士学位', labelEn: 'Bachelor\'s Degree' },
  { id: 'master', label: '硕士学位', labelEn: 'Master\'s Degree' },
  { id: 'doctor', label: '博士学位', labelEn: 'Doctoral Degree' }
]

export const degreeCategories = [
  { id: 'science', label: '理学', labelEn: 'Science' },
  { id: 'engineering', label: '工学', labelEn: 'Engineering' },
  { id: 'literature', label: '文学', labelEn: 'Arts' },
  { id: 'economics', label: '经济学', labelEn: 'Economics' },
  { id: 'management', label: '管理学', labelEn: 'Management' },
  { id: 'law', label: '法学', labelEn: 'Law' },
  { id: 'education', label: '教育学', labelEn: 'Education' },
  { id: 'medicine', label: '医学', labelEn: 'Medicine' },
  { id: 'agriculture', label: '农学', labelEn: 'Agriculture' },
  { id: 'philosophy', label: '哲学', labelEn: 'Philosophy' },
  { id: 'history', label: '历史学', labelEn: 'History' },
  { id: 'art', label: '艺术学', labelEn: 'Art' }
]

export const useDegreeCertificateStore = defineStore('degreeCertificate', () => {
  const data = reactive<DegreeCertificateData>({
    schoolName: '北京大学',
    schoolNameEn: 'Peking University',
    schoolLogo: '',
    presidentName: '郝平',
    
    studentName: '张三',
    studentNameEn: 'Zhang San',
    gender: 'male',
    birthDate: '1998-05-15',
    nationality: '中国',
    idNumber: '',
    photo: '',
    
    degreeType: 'bachelor',
    degreeCategory: '工学',
    major: '计算机科学与技术',
    majorEn: 'Computer Science and Technology',
    department: '信息科学技术学院',
    
    certificateNumber: '',
    registrationNumber: '',
    approvalDate: '',
    conferDate: '',
    issueDate: new Date().toISOString().split('T')[0],
    
    thesisTitle: '',
    thesisTitleEn: '',
    advisor: '',
    defenseDate: '',
    
    template: 'official',
    borderStyle: 'red',
    showPhoto: true,
    showSeal: true,
    showNationalEmblem: true,
    showQRCode: false
  })

  const setSchoolTemplate = (templateId: string) => {
    const templates: Record<string, Partial<DegreeCertificateData>> = {
      pku: {
        schoolName: '北京大学',
        schoolNameEn: 'Peking University',
        presidentName: '郝平'
      },
      thu: {
        schoolName: '清华大学',
        schoolNameEn: 'Tsinghua University',
        presidentName: '王希勤'
      },
      fdu: {
        schoolName: '复旦大学',
        schoolNameEn: 'Fudan University',
        presidentName: '金力'
      },
      sjtu: {
        schoolName: '上海交通大学',
        schoolNameEn: 'Shanghai Jiao Tong University',
        presidentName: '丁奎岭'
      },
      zju: {
        schoolName: '浙江大学',
        schoolNameEn: 'Zhejiang University',
        presidentName: '杜江峰'
      },
      nju: {
        schoolName: '南京大学',
        schoolNameEn: 'Nanjing University',
        presidentName: '谈哲敏'
      }
    }
    
    if (templates[templateId]) {
      Object.assign(data, templates[templateId])
    }
  }

  const generateCertificateNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 900000) + 100000
    data.certificateNumber = `${year}${random}`
  }

  const generateRegistrationNumber = () => {
    const year = new Date().getFullYear()
    const typeCode = data.degreeType === 'bachelor' ? '1' : data.degreeType === 'master' ? '2' : '3'
    const random = Math.floor(Math.random() * 90000000) + 10000000
    data.registrationNumber = `${typeCode}${year}${random}`
  }

  const getDegreeTypeText = () => {
    const type = degreeTypes.find(t => t.id === data.degreeType)
    return type?.label || '学士学位'
  }

  const getDegreeTypeTextEn = () => {
    const type = degreeTypes.find(t => t.id === data.degreeType)
    return type?.labelEn || 'Bachelor\'s Degree'
  }

  const getFullDegreeText = () => {
    return `${data.degreeCategory}${getDegreeTypeText()}`
  }

  const getFullDegreeTextEn = () => {
    const category = degreeCategories.find(c => c.label === data.degreeCategory)
    const typeEn = getDegreeTypeTextEn()
    return category ? `${typeEn} of ${category.labelEn}` : typeEn
  }

  return {
    data,
    setSchoolTemplate,
    generateCertificateNumber,
    generateRegistrationNumber,
    getDegreeTypeText,
    getDegreeTypeTextEn,
    getFullDegreeText,
    getFullDegreeTextEn
  }
})
