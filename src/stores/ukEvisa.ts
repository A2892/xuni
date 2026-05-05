import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UKEvisaData {
  // 个人信息
  surname: string
  givenNames: string
  nationality: string
  dateOfBirth: string
  sex: 'M' | 'F'
  photo: string
  
  // 签证信息
  visaType: 'work' | 'student' | 'family' | 'visit' | 'settlement'
  visaCategory: string
  visaStatus: 'valid' | 'expired' | 'cancelled'
  
  // 护照信息
  passportNumber: string
  passportType: string
  passportCountry: string
  
  // 有效期信息
  issueDate: string
  expiryDate: string
  validFrom: string
  validUntil: string
  
  // 生物识别信息
  biometricNumber: string
  biometricDate: string
  
  // 工作/学习信息（条件性）
  sponsor: string
  sponsorLicenseNumber: string
  courseTitle: string
  employerName: string
  
  // 居住和其他信息
  ukAddress: string
  ukPostcode: string
  
  // 限制和条件
  workAllowed: boolean
  studyAllowed: boolean
  publicFundsAllowed: boolean
  conditions: string[]
  remarks: string
  
  // 电子签证特定信息
  shareCode: string
  evisaNumber: string
  qrCode: string
}

export interface UKEvisaDesignSettings {
  showPhoto: boolean
  showQRCode: boolean
  showWatermark: boolean
  watermarkText: string
  watermarkOpacity: number
  backgroundColor: string
  accentColor: string
  fontSize: number
  showBiometric: boolean
  showConditions: boolean
}

export const visaTypeOptions = {
  work: { name: '工作签证', code: 'Skilled Worker', icon: '💼' },
  student: { name: '学生签证', code: 'Student', icon: '🎓' },
  family: { name: '家庭签证', code: 'Family', icon: '👨‍👩‍👧' },
  visit: { name: '访问签证', code: 'Visit', icon: '✈️' },
  settlement: { name: '定居签证', code: 'Settlement', icon: '🏡' }
}

export const useUKEvisaStore = defineStore('ukEvisa', () => {
  const data = ref<UKEvisaData>({
    // 个人信息
    surname: 'ZHANG',
    givenNames: 'SAN',
    nationality: 'China',
    dateOfBirth: '1995-03-15',
    sex: 'M',
    photo: '',
    
    // 签证信息
    visaType: 'student',
    visaCategory: 'Student',
    visaStatus: 'valid',
    
    // 护照信息
    passportNumber: 'E12345678',
    passportType: 'P',
    passportCountry: 'CHN',
    
    // 有效期信息
    issueDate: '2024-01-15',
    expiryDate: '2026-01-14',
    validFrom: '2024-01-15',
    validUntil: '2026-01-14',
    
    // 生物识别信息
    biometricNumber: 'BIO123456789UK',
    biometricDate: '2024-01-10',
    
    // 工作/学习信息
    sponsor: 'University of London',
    sponsorLicenseNumber: 'SPONSOR12345',
    courseTitle: 'MSc Computer Science',
    employerName: '',
    
    // 居住信息
    ukAddress: '123 London Road, London',
    ukPostcode: 'SW1A 1AA',
    
    // 限制和条件
    workAllowed: true,
    studyAllowed: true,
    publicFundsAllowed: false,
    conditions: [
      'Work limited to 20 hours per week during term time',
      'Full-time work allowed during vacation periods',
      'Study with a licensed sponsor only'
    ],
    remarks: 'Valid for multiple entries',
    
    // 电子签证特定信息
    shareCode: 'ABC123DEF456',
    evisaNumber: 'UK-2024-123456789',
    qrCode: ''
  })

  const designSettings = ref<UKEvisaDesignSettings>({
    showPhoto: true,
    showQRCode: true,
    showWatermark: false,
    watermarkText: 'SPECIMEN',
    watermarkOpacity: 10,
    backgroundColor: '#ffffff',
    accentColor: '#9e1b34',
    fontSize: 14,
    showBiometric: true,
    showConditions: true
  })

  // 格式化日期
  const formatDate = (date: string, format: 'full' | 'short' = 'full') => {
    if (!date) return ''
    const d = new Date(date)
    if (format === 'short') {
      return d.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    }
    return d.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // 生成分享码（模拟）
  const generateShareCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    data.value.shareCode = code
  }

  // 生成电子签证号码
  const generateEvisaNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 1000000000)
    data.value.evisaNumber = `UK-${year}-${random.toString().padStart(9, '0')}`
  }

  // 获取签证状态标签
  const getStatusLabel = computed(() => {
    switch (data.value.visaStatus) {
      case 'valid': return '有效'
      case 'expired': return '已过期'
      case 'cancelled': return '已取消'
      default: return '未知'
    }
  })

  // 获取签证状态颜色
  const getStatusColor = computed(() => {
    switch (data.value.visaStatus) {
      case 'valid': return '#10b981'
      case 'expired': return '#ef4444'
      case 'cancelled': return '#f59e0b'
      default: return '#6b7280'
    }
  })

  // 计算剩余天数
  const getDaysRemaining = computed(() => {
    const today = new Date()
    const expiry = new Date(data.value.expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  })

  // 重置数据
  const resetData = () => {
    data.value = {
      surname: 'ZHANG',
      givenNames: 'SAN',
      nationality: 'China',
      dateOfBirth: '1995-03-15',
      sex: 'M',
      photo: '',
      visaType: 'student',
      visaCategory: 'Student',
      visaStatus: 'valid',
      passportNumber: 'E12345678',
      passportType: 'P',
      passportCountry: 'CHN',
      issueDate: '2024-01-15',
      expiryDate: '2026-01-14',
      validFrom: '2024-01-15',
      validUntil: '2026-01-14',
      biometricNumber: 'BIO123456789UK',
      biometricDate: '2024-01-10',
      sponsor: 'University of London',
      sponsorLicenseNumber: 'SPONSOR12345',
      courseTitle: 'MSc Computer Science',
      employerName: '',
      ukAddress: '123 London Road, London',
      ukPostcode: 'SW1A 1AA',
      workAllowed: true,
      studyAllowed: true,
      publicFundsAllowed: false,
      conditions: [
        'Work limited to 20 hours per week during term time',
        'Full-time work allowed during vacation periods',
        'Study with a licensed sponsor only'
      ],
      remarks: 'Valid for multiple entries',
      shareCode: 'ABC123DEF456',
      evisaNumber: 'UK-2024-123456789',
      qrCode: ''
    }
  }

  return {
    data,
    designSettings,
    formatDate,
    generateShareCode,
    generateEvisaNumber,
    getStatusLabel,
    getStatusColor,
    getDaysRemaining,
    resetData
  }
})
