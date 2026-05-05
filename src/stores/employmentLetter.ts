import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface EmploymentLetterData {
  // 公司信息
  companyName: string
  companyNameEn: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyWebsite: string
  companyLogo: string
  registrationNumber: string
  
  // 员工信息
  employeeName: string
  employeeNameEn: string
  employeeId: string
  department: string
  position: string
  positionEn: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern'
  startDate: string
  endDate: string
  
  // 薪资信息
  showSalary: boolean
  salary: number
  salaryPeriod: 'monthly' | 'annual'
  currency: string
  
  // 信函信息
  letterDate: string
  letterNumber: string
  purpose: 'visa' | 'bank' | 'rental' | 'general' | 'custom'
  customPurpose: string
  recipientName: string
  recipientAddress: string
  
  // 签名
  signerName: string
  signerTitle: string
  signerSignature: string
  companySeal: string
  
  // 设计
  template: 'formal' | 'modern' | 'minimal' | 'corporate'
  primaryColor: string
  showLetterhead: boolean
  showSeal: boolean
  language: 'zh' | 'en' | 'bilingual'
}

export const purposeOptions = {
  visa: { name: '签证申请', nameEn: 'Visa Application' },
  bank: { name: '银行开户/贷款', nameEn: 'Bank Account/Loan' },
  rental: { name: '租房申请', nameEn: 'Rental Application' },
  general: { name: '通用证明', nameEn: 'General Purpose' },
  custom: { name: '自定义', nameEn: 'Custom' }
}

export const useEmploymentLetterStore = defineStore('employmentLetter', () => {
  const data = ref<EmploymentLetterData>({
    companyName: '科技创新有限公司',
    companyNameEn: 'Tech Innovation Co., Ltd.',
    companyAddress: '北京市朝阳区建国路88号SOHO现代城A座2001室',
    companyPhone: '+86 10 8888 8888',
    companyEmail: 'hr@techinnovation.com',
    companyWebsite: 'www.techinnovation.com',
    companyLogo: '',
    registrationNumber: '91110105MA01XXXX',
    
    employeeName: '张三',
    employeeNameEn: 'Zhang San',
    employeeId: 'EMP2024001',
    department: '技术研发部',
    position: '高级软件工程师',
    positionEn: 'Senior Software Engineer',
    employmentType: 'full-time',
    startDate: '2020-03-15',
    endDate: '',
    
    showSalary: true,
    salary: 25000,
    salaryPeriod: 'monthly',
    currency: 'CNY',
    
    letterDate: new Date().toISOString().split('T')[0],
    letterNumber: 'EL' + new Date().getFullYear() + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
    purpose: 'visa',
    customPurpose: '',
    recipientName: '签证官/相关部门',
    recipientAddress: '',
    
    signerName: '李华',
    signerTitle: '人力资源总监',
    signerSignature: '',
    companySeal: '',
    
    template: 'formal',
    primaryColor: '#1e40af',
    showLetterhead: true,
    showSeal: true,
    language: 'bilingual'
  })

  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = {
      CNY: '¥', USD: '$', EUR: '€', GBP: '£', JPY: '¥'
    }
    return (symbols[data.value.currency] || '') + amount.toLocaleString()
  }

  const formatDate = (date: string, lang: 'zh' | 'en' = 'zh') => {
    if (!date) return lang === 'zh' ? '至今' : 'Present'
    const d = new Date(date)
    if (lang === 'zh') {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    }
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  const getEmploymentTypeText = (type: string, lang: 'zh' | 'en' = 'zh') => {
    const types: Record<string, { zh: string; en: string }> = {
      'full-time': { zh: '全职', en: 'Full-time' },
      'part-time': { zh: '兼职', en: 'Part-time' },
      'contract': { zh: '合同工', en: 'Contract' },
      'intern': { zh: '实习生', en: 'Intern' }
    }
    return types[type]?.[lang] || type
  }

  const reset = () => {
    data.value = {
      companyName: '科技创新有限公司',
      companyNameEn: 'Tech Innovation Co., Ltd.',
      companyAddress: '北京市朝阳区建国路88号SOHO现代城A座2001室',
      companyPhone: '+86 10 8888 8888',
      companyEmail: 'hr@techinnovation.com',
      companyWebsite: 'www.techinnovation.com',
      companyLogo: '',
      registrationNumber: '91110105MA01XXXX',
      employeeName: '张三',
      employeeNameEn: 'Zhang San',
      employeeId: 'EMP2024001',
      department: '技术研发部',
      position: '高级软件工程师',
      positionEn: 'Senior Software Engineer',
      employmentType: 'full-time',
      startDate: '2020-03-15',
      endDate: '',
      showSalary: true,
      salary: 25000,
      salaryPeriod: 'monthly',
      currency: 'CNY',
      letterDate: new Date().toISOString().split('T')[0],
      letterNumber: 'EL' + new Date().getFullYear() + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
      purpose: 'visa',
      customPurpose: '',
      recipientName: '签证官/相关部门',
      recipientAddress: '',
      signerName: '李华',
      signerTitle: '人力资源总监',
      signerSignature: '',
      companySeal: '',
      template: 'formal',
      primaryColor: '#1e40af',
      showLetterhead: true,
      showSeal: true,
      language: 'bilingual'
    }
  }

  return {
    data,
    formatCurrency,
    formatDate,
    getEmploymentTypeText,
    reset
  }
})
