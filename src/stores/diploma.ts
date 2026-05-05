// 毕业证 Store
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface DiplomaData {
  // 学校信息
  schoolName: string
  schoolNameEn: string
  schoolLogo: string
  schoolType: 'university' | 'college' | 'vocational'
  
  // 学生信息
  studentName: string
  studentNameEn: string
  studentId: string
  gender: 'male' | 'female'
  birthDate: string
  idNumber: string
  nationality: string
  photo: string
  
  // 学历信息
  faculty: string
  facultyEn: string
  major: string
  majorEn: string
  educationLevel: 'undergraduate' | 'master' | 'phd' | 'college' | 'vocational'
  studyMode: 'fulltime' | 'parttime' | 'correspondence'
  studyDuration: string
  enrollmentDate: string
  graduationDate: string
  
  // 证书信息
  certificateNumber: string
  registrationNumber: string
  issueDate: string
  
  // 签名信息
  presidentName: string
  
  // 显示设置
  template: 'official' | 'classic' | 'modern'
  showSeal: boolean
  showPhoto: boolean
  showNationalEmblem: boolean
  language: 'chinese' | 'english' | 'bilingual'
  borderStyle: 'gold' | 'red' | 'blue' | 'classic'
}

export const useDiplomaStore = defineStore('diploma', () => {
  const data = reactive<DiplomaData>({
    schoolName: '北京大学',
    schoolNameEn: 'Peking University',
    schoolLogo: '',
    schoolType: 'university',
    
    studentName: '张三',
    studentNameEn: 'ZHANG SAN',
    studentId: '2020312345',
    gender: 'male',
    birthDate: '2002-05-15',
    idNumber: '110101200205150011',
    nationality: '中国',
    photo: '',
    
    faculty: '信息科学技术学院',
    facultyEn: 'School of EECS',
    major: '计算机科学与技术',
    majorEn: 'Computer Science',
    educationLevel: 'undergraduate',
    studyMode: 'fulltime',
    studyDuration: '四年',
    enrollmentDate: '2020-09-01',
    graduationDate: '2024-07-01',
    
    certificateNumber: `1000120240012345`,
    registrationNumber: `2024101234567`,
    issueDate: new Date().toISOString().split('T')[0],
    
    presidentName: '校长签名',
    
    template: 'official',
    showSeal: true,
    showPhoto: true,
    showNationalEmblem: true,
    language: 'chinese',
    borderStyle: 'red'
  })
  
  const generateCertificateNumber = () => {
    const schoolCode = '10001'
    const year = new Date().getFullYear()
    const seq = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
    data.certificateNumber = `${schoolCode}${year}${seq}`
  }
  
  const generateRegistrationNumber = () => {
    const year = new Date().getFullYear()
    const seq = Math.floor(Math.random() * 10000000).toString().padStart(7, '0')
    data.registrationNumber = `${year}${seq}`
  }
  
  const setSchoolTemplate = (school: string) => {
    const templates: Record<string, Partial<DiplomaData>> = {
      pku: {
        schoolName: '北京大学',
        schoolNameEn: 'Peking University',
        presidentName: '龚旗煌'
      },
      thu: {
        schoolName: '清华大学',
        schoolNameEn: 'Tsinghua University',
        presidentName: '李路明'
      },
      fdu: {
        schoolName: '复旦大学',
        schoolNameEn: 'Fudan University',
        presidentName: '金力'
      }
    }
    if (templates[school]) {
      Object.assign(data, templates[school])
    }
  }
  
  const getEducationLevelText = () => {
    const levels: Record<string, string> = {
      undergraduate: '本科',
      master: '硕士研究生',
      phd: '博士研究生',
      college: '大专',
      vocational: '高职'
    }
    return levels[data.educationLevel] || '本科'
  }
  
  const getStudyModeText = () => {
    const modes: Record<string, string> = {
      fulltime: '全日制',
      parttime: '非全日制',
      correspondence: '函授'
    }
    return modes[data.studyMode] || '全日制'
  }
  
  const reset = () => {
    data.studentName = '张三'
    data.studentNameEn = 'ZHANG SAN'
    data.issueDate = new Date().toISOString().split('T')[0]
    generateCertificateNumber()
    generateRegistrationNumber()
  }
  
  return {
    data,
    generateCertificateNumber,
    generateRegistrationNumber,
    setSchoolTemplate,
    getEducationLevelText,
    getStudyModeText,
    reset
  }
})

export const educationLevels = [
  { value: 'undergraduate', label: '本科' },
  { value: 'master', label: '硕士研究生' },
  { value: 'phd', label: '博士研究生' },
  { value: 'college', label: '大专' },
  { value: 'vocational', label: '高职' }
]

export const studyModes = [
  { value: 'fulltime', label: '全日制' },
  { value: 'parttime', label: '非全日制' },
  { value: 'correspondence', label: '函授' }
]
