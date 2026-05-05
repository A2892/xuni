import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SocialSecurityData {
  // 参保人信息
  name: string
  idNumber: string
  socialSecurityNumber: string
  gender: 'male' | 'female'
  birthDate: string
  nationality: string
  phone: string
  address: string
  photo: string
  
  // 参保单位信息
  employerName: string
  employerCode: string
  employerAddress: string
  
  // 参保状态
  insuranceStatus: 'active' | 'suspended' | 'terminated'
  firstParticipationDate: string
  currentStartDate: string
  
  // 缴费记录
  paymentRecords: {
    month: string
    pensionBase: number
    pensionPersonal: number
    pensionEmployer: number
    medicalBase: number
    medicalPersonal: number
    medicalEmployer: number
    unemploymentBase: number
    unemploymentPersonal: number
    unemploymentEmployer: number
    injuryBase: number
    injuryEmployer: number
    maternityBase: number
    maternityEmployer: number
    housingBase: number
    housingPersonal: number
    housingEmployer: number
    status: 'paid' | 'pending' | 'arrears'
  }[]
  
  // 账户信息
  pensionAccountBalance: number
  medicalAccountBalance: number
  housingAccountBalance: number
  
  // 证明信息
  certificateNumber: string
  issueDate: string
  issuingAuthority: string
  purpose: 'general' | 'visa' | 'loan' | 'rental' | 'custom'
  customPurpose: string
  
  // 设计选项
  template: 'certificate' | 'statement' | 'card'
  showQRCode: boolean
  showSeal: boolean
}

export const useSocialSecurityStore = defineStore('socialSecurity', () => {
  // 生成过去12个月的缴费记录
  const generatePaymentRecords = () => {
    const records = []
    const baseAmount = 10000
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      records.push({
        month: monthStr,
        pensionBase: baseAmount,
        pensionPersonal: baseAmount * 0.08,
        pensionEmployer: baseAmount * 0.16,
        medicalBase: baseAmount,
        medicalPersonal: baseAmount * 0.02 + 3,
        medicalEmployer: baseAmount * 0.10,
        unemploymentBase: baseAmount,
        unemploymentPersonal: baseAmount * 0.005,
        unemploymentEmployer: baseAmount * 0.005,
        injuryBase: baseAmount,
        injuryEmployer: baseAmount * 0.004,
        maternityBase: baseAmount,
        maternityEmployer: baseAmount * 0.008,
        housingBase: baseAmount,
        housingPersonal: baseAmount * 0.12,
        housingEmployer: baseAmount * 0.12,
        status: 'paid' as const
      })
    }
    
    return records
  }

  const data = ref<SocialSecurityData>({
    name: '张三',
    idNumber: '110105199001011234',
    socialSecurityNumber: '11010519900101123401',
    gender: 'male',
    birthDate: '1990-01-01',
    nationality: '中国',
    phone: '13800138000',
    address: '北京市朝阳区建国路88号',
    photo: '',
    
    employerName: '北京科技创新有限公司',
    employerCode: '91110105MA01XXXX',
    employerAddress: '北京市朝阳区建国路88号SOHO现代城A座',
    
    insuranceStatus: 'active',
    firstParticipationDate: '2015-07-01',
    currentStartDate: '2020-03-01',
    
    paymentRecords: generatePaymentRecords(),
    
    pensionAccountBalance: 125680.50,
    medicalAccountBalance: 8960.30,
    housingAccountBalance: 186720.00,
    
    certificateNumber: 'SB' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
    issueDate: new Date().toISOString().split('T')[0],
    issuingAuthority: '北京市社会保险基金管理中心',
    purpose: 'general',
    customPurpose: '',
    
    template: 'certificate',
    showQRCode: true,
    showSeal: true
  })

  const formatCurrency = (amount: number) => {
    return '¥' + amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  const getTotalContributionMonths = () => {
    const start = new Date(data.value.firstParticipationDate)
    const now = new Date()
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    return months
  }

  const getMonthlyTotalPersonal = (record: SocialSecurityData['paymentRecords'][0]) => {
    return record.pensionPersonal + record.medicalPersonal + record.unemploymentPersonal + record.housingPersonal
  }

  const getMonthlyTotalEmployer = (record: SocialSecurityData['paymentRecords'][0]) => {
    return record.pensionEmployer + record.medicalEmployer + record.unemploymentEmployer + 
           record.injuryEmployer + record.maternityEmployer + record.housingEmployer
  }

  const getYearlyTotal = () => {
    return data.value.paymentRecords.reduce((sum, record) => {
      return sum + getMonthlyTotalPersonal(record) + getMonthlyTotalEmployer(record)
    }, 0)
  }

  const reset = () => {
    data.value = {
      name: '张三',
      idNumber: '110105199001011234',
      socialSecurityNumber: '11010519900101123401',
      gender: 'male',
      birthDate: '1990-01-01',
      nationality: '中国',
      phone: '13800138000',
      address: '北京市朝阳区建国路88号',
      photo: '',
      employerName: '北京科技创新有限公司',
      employerCode: '91110105MA01XXXX',
      employerAddress: '北京市朝阳区建国路88号SOHO现代城A座',
      insuranceStatus: 'active',
      firstParticipationDate: '2015-07-01',
      currentStartDate: '2020-03-01',
      paymentRecords: generatePaymentRecords(),
      pensionAccountBalance: 125680.50,
      medicalAccountBalance: 8960.30,
      housingAccountBalance: 186720.00,
      certificateNumber: 'SB' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
      issueDate: new Date().toISOString().split('T')[0],
      issuingAuthority: '北京市社会保险基金管理中心',
      purpose: 'general',
      customPurpose: '',
      template: 'certificate',
      showQRCode: true,
      showSeal: true
    }
  }

  return {
    data,
    formatCurrency,
    formatDate,
    getTotalContributionMonths,
    getMonthlyTotalPersonal,
    getMonthlyTotalEmployer,
    getYearlyTotal,
    generatePaymentRecords,
    reset
  }
})
