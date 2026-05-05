import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface InsuranceData {
  // 保单基本信息
  policyNumber: string
  policyType: 'life' | 'health' | 'auto' | 'property' | 'travel' | 'accident'
  policyStatus: 'active' | 'expired' | 'pending' | 'cancelled'
  issueDate: string
  effectiveDate: string
  expiryDate: string
  
  // 保险公司信息
  insurerName: string
  insurerNameEn: string
  insurerLogo: string
  insurerAddress: string
  insurerPhone: string
  insurerEmail: string
  insurerLicense: string
  
  // 投保人信息
  holderName: string
  holderNameEn: string
  holderIdType: 'id_card' | 'passport'
  holderIdNumber: string
  holderBirthDate: string
  holderGender: 'male' | 'female'
  holderPhone: string
  holderEmail: string
  holderAddress: string
  holderOccupation: string
  
  // 被保险人信息（可与投保人相同）
  insuredSameAsHolder: boolean
  insuredName: string
  insuredIdNumber: string
  insuredBirthDate: string
  insuredRelation: string
  
  // 受益人信息
  beneficiaryName: string
  beneficiaryIdNumber: string
  beneficiaryRelation: string
  beneficiaryRatio: number
  
  // 保障内容
  coverage: {
    name: string
    amount: number
    deductible: number
    description: string
  }[]
  totalCoverage: number
  
  // 保费信息
  premium: number
  premiumPeriod: 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'single'
  currency: string
  paymentMethod: 'bank_transfer' | 'credit_card' | 'auto_debit'
  nextPaymentDate: string
  
  // 附加险
  riders: {
    name: string
    premium: number
    coverage: number
  }[]
  
  // 特殊条款
  waitingPeriod: number
  exclusions: string[]
  
  // 代理人信息
  agentName: string
  agentCode: string
  agentPhone: string
  
  // 设计
  template: 'standard' | 'premium' | 'digital'
  primaryColor: string
  showQRCode: boolean
}

export const policyTypes = {
  life: { zh: '人寿保险', en: 'Life Insurance', icon: '❤️' },
  health: { zh: '健康保险', en: 'Health Insurance', icon: '🏥' },
  auto: { zh: '汽车保险', en: 'Auto Insurance', icon: '🚗' },
  property: { zh: '财产保险', en: 'Property Insurance', icon: '🏠' },
  travel: { zh: '旅行保险', en: 'Travel Insurance', icon: '✈️' },
  accident: { zh: '意外保险', en: 'Accident Insurance', icon: '🛡️' }
}

export const useInsuranceStore = defineStore('insurance', () => {
  const data = ref<InsuranceData>({
    policyNumber: 'POL' + new Date().getFullYear() + String(Math.floor(Math.random() * 10000000)).padStart(7, '0'),
    policyType: 'health',
    policyStatus: 'active',
    issueDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    insurerName: '平安人寿保险股份有限公司',
    insurerNameEn: 'Ping An Life Insurance Company of China, Ltd.',
    insurerLogo: '',
    insurerAddress: '深圳市福田区益田路5033号平安金融中心',
    insurerPhone: '95511',
    insurerEmail: 'service@pingan.com',
    insurerLicense: '保监许可〔2004〕0001号',
    
    holderName: '张三',
    holderNameEn: 'Zhang San',
    holderIdType: 'id_card',
    holderIdNumber: '110101199001011234',
    holderBirthDate: '1990-01-01',
    holderGender: 'male',
    holderPhone: '13800138000',
    holderEmail: 'zhangsan@email.com',
    holderAddress: '北京市朝阳区建国路88号',
    holderOccupation: '软件工程师',
    
    insuredSameAsHolder: true,
    insuredName: '',
    insuredIdNumber: '',
    insuredBirthDate: '',
    insuredRelation: '',
    
    beneficiaryName: '张父',
    beneficiaryIdNumber: '110101196001011234',
    beneficiaryRelation: '父亲',
    beneficiaryRatio: 100,
    
    coverage: [
      { name: '身故/全残保障', amount: 500000, deductible: 0, description: '因疾病或意外导致身故或全残' },
      { name: '重大疾病保障', amount: 300000, deductible: 0, description: '确诊合同约定的重大疾病' },
      { name: '住院医疗保障', amount: 100000, deductible: 500, description: '因疾病或意外住院治疗费用' }
    ],
    totalCoverage: 900000,
    
    premium: 5680,
    premiumPeriod: 'annual',
    currency: 'CNY',
    paymentMethod: 'auto_debit',
    nextPaymentDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    riders: [
      { name: '意外伤害附加险', premium: 200, coverage: 100000 },
      { name: '住院津贴附加险', premium: 150, coverage: 200 }
    ],
    
    waitingPeriod: 90,
    exclusions: ['先天性疾病', '自伤或自杀', '战争或恐怖行为', '核辐射污染'],
    
    agentName: '李经理',
    agentCode: 'AG88888',
    agentPhone: '13900139000',
    
    template: 'standard',
    primaryColor: '#dc2626',
    showQRCode: true
  })

  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = {
      CNY: '¥', USD: '$', EUR: '€', GBP: '£'
    }
    return (symbols[data.value.currency] || '') + amount.toLocaleString()
  }

  const formatDate = (date: string, format: 'short' | 'long' = 'long') => {
    if (!date) return ''
    const d = new Date(date)
    if (format === 'short') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  const getTotalPremium = () => {
    const basePremium = data.value.premium
    const ridersPremium = data.value.riders.reduce((sum, r) => sum + r.premium, 0)
    return basePremium + ridersPremium
  }

  const getPolicyDuration = () => {
    const start = new Date(data.value.effectiveDate)
    const end = new Date(data.value.expiryDate)
    const years = end.getFullYear() - start.getFullYear()
    return years
  }

  const reset = () => {
    data.value = {
      policyNumber: 'POL' + new Date().getFullYear() + String(Math.floor(Math.random() * 10000000)).padStart(7, '0'),
      policyType: 'health',
      policyStatus: 'active',
      issueDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      insurerName: '平安人寿保险股份有限公司',
      insurerNameEn: 'Ping An Life Insurance Company of China, Ltd.',
      insurerLogo: '',
      insurerAddress: '深圳市福田区益田路5033号平安金融中心',
      insurerPhone: '95511',
      insurerEmail: 'service@pingan.com',
      insurerLicense: '保监许可〔2004〕0001号',
      holderName: '张三',
      holderNameEn: 'Zhang San',
      holderIdType: 'id_card',
      holderIdNumber: '110101199001011234',
      holderBirthDate: '1990-01-01',
      holderGender: 'male',
      holderPhone: '13800138000',
      holderEmail: 'zhangsan@email.com',
      holderAddress: '北京市朝阳区建国路88号',
      holderOccupation: '软件工程师',
      insuredSameAsHolder: true,
      insuredName: '',
      insuredIdNumber: '',
      insuredBirthDate: '',
      insuredRelation: '',
      beneficiaryName: '张父',
      beneficiaryIdNumber: '110101196001011234',
      beneficiaryRelation: '父亲',
      beneficiaryRatio: 100,
      coverage: [
        { name: '身故/全残保障', amount: 500000, deductible: 0, description: '因疾病或意外导致身故或全残' },
        { name: '重大疾病保障', amount: 300000, deductible: 0, description: '确诊合同约定的重大疾病' },
        { name: '住院医疗保障', amount: 100000, deductible: 500, description: '因疾病或意外住院治疗费用' }
      ],
      totalCoverage: 900000,
      premium: 5680,
      premiumPeriod: 'annual',
      currency: 'CNY',
      paymentMethod: 'auto_debit',
      nextPaymentDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      riders: [
        { name: '意外伤害附加险', premium: 200, coverage: 100000 },
        { name: '住院津贴附加险', premium: 150, coverage: 200 }
      ],
      waitingPeriod: 90,
      exclusions: ['先天性疾病', '自伤或自杀', '战争或恐怖行为', '核辐射污染'],
      agentName: '李经理',
      agentCode: 'AG88888',
      agentPhone: '13900139000',
      template: 'standard',
      primaryColor: '#dc2626',
      showQRCode: true
    }
  }

  return {
    data,
    formatCurrency,
    formatDate,
    getTotalPremium,
    getPolicyDuration,
    reset
  }
})
