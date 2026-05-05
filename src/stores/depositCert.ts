import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface DepositCertData {
  // 银行信息
  bankName: string
  bankNameEn: string
  bankLogo: string
  branchName: string
  branchCode: string
  bankAddress: string
  bankPhone: string
  swiftCode: string
  
  // 存款人信息
  accountHolderName: string
  accountHolderNameEn: string
  idType: 'id_card' | 'passport' | 'other'
  idNumber: string
  accountNumber: string
  accountType: 'savings' | 'current' | 'fixed' | 'certificate'
  
  // 存款信息
  currency: string
  balance: number
  balanceDate: string
  averageBalance: number
  averageBalancePeriod: string
  
  // 定期存款信息
  isFixedDeposit: boolean
  depositDate: string
  maturityDate: string
  interestRate: number
  
  // 证明信息
  certificateNumber: string
  issueDate: string
  purpose: 'visa' | 'loan' | 'investment' | 'proof' | 'custom'
  customPurpose: string
  recipientName: string
  validityPeriod: number
  
  // 签发人信息
  issuerName: string
  issuerTitle: string
  issuerSignature: string
  
  // 设计选项
  template: 'formal' | 'simple' | 'bilingual'
  language: 'zh' | 'en' | 'bilingual'
  showSeal: boolean
  showLogo: boolean
  primaryColor: string
}

export const bankOptions = [
  { name: '中国工商银行', nameEn: 'Industrial and Commercial Bank of China', swift: 'ICBKCNBJ' },
  { name: '中国建设银行', nameEn: 'China Construction Bank', swift: 'PCBCCNBJ' },
  { name: '中国农业银行', nameEn: 'Agricultural Bank of China', swift: 'ABOCCNBJ' },
  { name: '中国银行', nameEn: 'Bank of China', swift: 'BKCHCNBJ' },
  { name: '交通银行', nameEn: 'Bank of Communications', swift: 'COMMCNSH' },
  { name: '招商银行', nameEn: 'China Merchants Bank', swift: 'CMBCCNBS' },
  { name: '中信银行', nameEn: 'China CITIC Bank', swift: 'CLOPCNBT' },
  { name: '浦发银行', nameEn: 'Shanghai Pudong Development Bank', swift: 'SPDBCNSH' },
  { name: '民生银行', nameEn: 'China Minsheng Bank', swift: 'MSBCCNBJ' },
  { name: '兴业银行', nameEn: 'Industrial Bank', swift: 'FJIBCNBA' }
]

export const useDepositCertStore = defineStore('depositCert', () => {
  const data = ref<DepositCertData>({
    bankName: '中国工商银行',
    bankNameEn: 'Industrial and Commercial Bank of China',
    bankLogo: '',
    branchName: '北京市朝阳支行',
    branchCode: '0200',
    bankAddress: '北京市朝阳区建国路88号',
    bankPhone: '010-95588',
    swiftCode: 'ICBKCNBJBJM',
    
    accountHolderName: '张三',
    accountHolderNameEn: 'ZHANG SAN',
    idType: 'id_card',
    idNumber: '110105199001011234',
    accountNumber: '6222 **** **** **** 1234',
    accountType: 'savings',
    
    currency: 'CNY',
    balance: 500000.00,
    balanceDate: new Date().toISOString().split('T')[0],
    averageBalance: 480000.00,
    averageBalancePeriod: '近六个月',
    
    isFixedDeposit: false,
    depositDate: '',
    maturityDate: '',
    interestRate: 0,
    
    certificateNumber: 'DC' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
    issueDate: new Date().toISOString().split('T')[0],
    purpose: 'visa',
    customPurpose: '',
    recipientName: '签证申请机构',
    validityPeriod: 30,
    
    issuerName: '李经理',
    issuerTitle: '客户经理',
    issuerSignature: '',
    
    template: 'formal',
    language: 'bilingual',
    showSeal: true,
    showLogo: true,
    primaryColor: '#dc2626'
  })

  const formatCurrency = (amount: number, showSymbol = true) => {
    const symbols: Record<string, string> = {
      CNY: '¥', USD: '$', EUR: '€', GBP: '£', JPY: '¥', HKD: 'HK$', AUD: 'A$'
    }
    const symbol = showSymbol ? (symbols[data.value.currency] || '') : ''
    return symbol + amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatCurrencyInWords = (amount: number) => {
    const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿']
    
    const intPart = Math.floor(amount)
    const decPart = Math.round((amount - intPart) * 100)
    
    if (intPart === 0 && decPart === 0) return '零元整'
    
    let result = ''
    const str = intPart.toString()
    
    for (let i = 0; i < str.length; i++) {
      const digit = parseInt(str[i])
      const unitIndex = str.length - 1 - i
      
      if (digit !== 0) {
        result += digits[digit] + units[unitIndex]
      } else if (result && !result.endsWith('零')) {
        result += '零'
      }
    }
    
    result = result.replace(/零+$/, '')
    result += '元'
    
    if (decPart > 0) {
      const jiao = Math.floor(decPart / 10)
      const fen = decPart % 10
      if (jiao > 0) result += digits[jiao] + '角'
      if (fen > 0) result += digits[fen] + '分'
    } else {
      result += '整'
    }
    
    return result
  }

  const formatDate = (date: string, lang: 'zh' | 'en' = 'zh') => {
    if (!date) return ''
    const d = new Date(date)
    if (lang === 'zh') {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    }
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  const getValidUntilDate = () => {
    const issueDate = new Date(data.value.issueDate)
    issueDate.setDate(issueDate.getDate() + data.value.validityPeriod)
    return issueDate.toISOString().split('T')[0]
  }

  const getPurposeText = (lang: 'zh' | 'en' = 'zh') => {
    const purposes: Record<string, { zh: string; en: string }> = {
      visa: { zh: '签证申请', en: 'Visa Application' },
      loan: { zh: '贷款申请', en: 'Loan Application' },
      investment: { zh: '投资证明', en: 'Investment Proof' },
      proof: { zh: '资金证明', en: 'Fund Verification' },
      custom: { zh: data.value.customPurpose, en: data.value.customPurpose }
    }
    return purposes[data.value.purpose]?.[lang] || ''
  }

  const reset = () => {
    data.value = {
      bankName: '中国工商银行',
      bankNameEn: 'Industrial and Commercial Bank of China',
      bankLogo: '',
      branchName: '北京市朝阳支行',
      branchCode: '0200',
      bankAddress: '北京市朝阳区建国路88号',
      bankPhone: '010-95588',
      swiftCode: 'ICBKCNBJBJM',
      accountHolderName: '张三',
      accountHolderNameEn: 'ZHANG SAN',
      idType: 'id_card',
      idNumber: '110105199001011234',
      accountNumber: '6222 **** **** **** 1234',
      accountType: 'savings',
      currency: 'CNY',
      balance: 500000.00,
      balanceDate: new Date().toISOString().split('T')[0],
      averageBalance: 480000.00,
      averageBalancePeriod: '近六个月',
      isFixedDeposit: false,
      depositDate: '',
      maturityDate: '',
      interestRate: 0,
      certificateNumber: 'DC' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
      issueDate: new Date().toISOString().split('T')[0],
      purpose: 'visa',
      customPurpose: '',
      recipientName: '签证申请机构',
      validityPeriod: 30,
      issuerName: '李经理',
      issuerTitle: '客户经理',
      issuerSignature: '',
      template: 'formal',
      language: 'bilingual',
      showSeal: true,
      showLogo: true,
      primaryColor: '#dc2626'
    }
  }

  return {
    data,
    formatCurrency,
    formatCurrencyInWords,
    formatDate,
    getValidUntilDate,
    getPurposeText,
    reset
  }
})
