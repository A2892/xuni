// 在读证明 Store
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface EnrollmentCertData {
  // 学校信息
  schoolName: string
  schoolNameEn: string
  schoolLogo: string
  schoolAddress: string
  schoolPhone: string
  schoolCode: string
  
  // 学生信息
  studentName: string
  studentNameEn: string
  studentId: string
  gender: 'male' | 'female'
  birthDate: string
  idNumber: string
  nationality: string
  photo: string
  
  // 学籍信息
  faculty: string
  facultyEn: string
  major: string
  majorEn: string
  grade: string
  classNo: string
  enrollmentDate: string
  expectedGraduation: string
  educationLevel: 'undergraduate' | 'master' | 'phd'
  studyMode: 'fulltime' | 'parttime'
  studentStatus: 'enrolled' | 'suspended' | 'exchange'
  
  // 样式设置
  studentNameFont?: string
  
  // 证明信息
  purpose: string
  customContent: string
  issueDate: string
  validUntil: string
  serialNumber: string
  registrarName: string
  registrarTitle: string
  
  // 显示设置
  template: 'official' | 'modern' | 'bilingual'
  showSeal: boolean
  showQRCode: boolean
  showPhoto: boolean
  language: 'chinese' | 'english' | 'bilingual'
}

export const useEnrollmentCertStore = defineStore('enrollmentCert', () => {
  const data = reactive<EnrollmentCertData>({
    schoolName: '北京大学',
    schoolNameEn: 'Peking University',
    schoolLogo: '',
    schoolAddress: '北京市海淀区颐和园路5号',
    schoolPhone: '010-62751111',
    schoolCode: '10001',
    
    studentName: '张三',
    studentNameEn: 'ZHANG SAN',
    studentNameFont: 'SimSun',
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
    grade: '2020级',
    classNo: '2班',
    enrollmentDate: '2020-09-01',
    expectedGraduation: '2024-07-01',
    educationLevel: 'undergraduate',
    studyMode: 'fulltime',
    studentStatus: 'enrolled',
    
    purpose: '办理出国签证',
    customContent: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    serialNumber: `ZM${Date.now().toString().slice(-10)}`,
    registrarName: '王教务',
    registrarTitle: '教务处处长',
    
    template: 'official',
    showSeal: true,
    showQRCode: true,
    showPhoto: true,
    language: 'bilingual'
  })

  // 设计设置
  const designSettings = reactive({
    watermarkEnabled: false,
    watermarkText: 'OFFICIAL',
    watermarkOpacity: 10,
    watermarkColor: '#cccccc',
    watermarkType: 'center' as 'center' | 'fullscreen',
    borderEnabled: true,
    borderStyle: 'double',
    borderColor: '#8b0000',
    borderWidth: 3,
    stampEnabled: true,
    stampType: 'official',
    stampColor: '#dc2626',
    stampRotation: -15,
    stampText: '',
    stampImage: '',
    stampSource: 'generate' as 'generate' | 'upload',
    signatureEnabled: true,
    signatureImage: '',
    signatureSource: 'generate' as 'generate' | 'upload' | 'gallery',
    signatureFont: 'Brush Script MT, cursive',
    signatureFontSize: 24,
    // 二维码设置
    qrCodeEnabled: true,
    qrCodeImage: '',
    qrCodeSource: 'generate' as 'generate' | 'upload',
    qrCodeContent: '',
    // 条形码设置
    barcodeEnabled: false,
    barcodeImage: '',
    barcodeSource: 'generate' as 'generate' | 'upload',
    barcodeContent: '',
    // 字体设置
    fontFamilyCN: "'SimSun', serif",
    fontFamilyEN: "'Times New Roman', serif"
  })
  
  const generateSerialNumber = () => {
    data.serialNumber = `ZM${Date.now().toString().slice(-10)}`
  }
  
  const setSchoolTemplate = (school: string) => {
    const templates: Record<string, Partial<EnrollmentCertData>> = {
      pku: {
        schoolName: '北京大学',
        schoolNameEn: 'Peking University',
        schoolAddress: '北京市海淀区颐和园路5号',
        schoolCode: '10001'
      },
      thu: {
        schoolName: '清华大学',
        schoolNameEn: 'Tsinghua University',
        schoolAddress: '北京市海淀区清华园1号',
        schoolCode: '10003'
      },
      fdu: {
        schoolName: '复旦大学',
        schoolNameEn: 'Fudan University',
        schoolAddress: '上海市杨浦区邯郸路220号',
        schoolCode: '10246'
      }
    }
    if (templates[school]) {
      Object.assign(data, templates[school])
    }
  }
  
  const setPurposeTemplate = (purpose: string) => {
    const purposes: Record<string, string> = {
      visa: '办理出国签证',
      work: '求职就业',
      loan: '申请助学贷款',
      travel: '购买学生票/旅游优惠',
      other: '其他用途'
    }
    data.purpose = purposes[purpose] || purpose
  }
  
  const reset = () => {
    data.studentName = '张三'
    data.studentNameEn = 'ZHANG SAN'
    data.studentId = '2020312345'
    data.issueDate = new Date().toISOString().split('T')[0]
    generateSerialNumber()
  }
  
  return {
    data,
    designSettings,
    generateSerialNumber,
    setSchoolTemplate,
    setPurposeTemplate,
    reset
  }
})

export const educationLevels = [
  { value: 'undergraduate', label: '本科', labelEn: 'Undergraduate' },
  { value: 'master', label: '硕士研究生', labelEn: 'Master' },
  { value: 'phd', label: '博士研究生', labelEn: 'Ph.D.' }
]

export const studentStatuses = [
  { value: 'enrolled', label: '在读', labelEn: 'Enrolled' },
  { value: 'suspended', label: '休学', labelEn: 'Suspended' },
  { value: 'exchange', label: '交换', labelEn: 'Exchange' }
]
