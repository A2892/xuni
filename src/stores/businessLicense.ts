import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface BusinessLicenseData {
  // 基本信息
  unifiedSocialCreditCode: string  // 统一社会信用代码
  companyName: string
  companyNameEn: string
  companyType: string
  legalRepresentative: string
  registeredCapital: number
  capitalCurrency: string
  paidInCapital: number
  establishmentDate: string
  businessTerm: string
  termEndDate: string
  
  // 注册地址
  registeredAddress: string
  businessScope: string
  
  // 审批信息
  registrationAuthority: string
  approvalDate: string
  
  // 设计选项
  template: 'standard' | 'simplified'
  showQRCode: boolean
  showWatermark: boolean
}

export const companyTypes = [
  '有限责任公司',
  '有限责任公司(自然人投资或控股)',
  '有限责任公司(法人独资)',
  '有限责任公司(自然人独资)',
  '股份有限公司',
  '股份有限公司(上市)',
  '个人独资企业',
  '合伙企业',
  '普通合伙企业',
  '有限合伙企业',
  '个体工商户',
  '外商投资企业',
  '中外合资经营企业',
  '中外合作经营企业',
  '外商独资企业'
]

export const useBusinessLicenseStore = defineStore('businessLicense', () => {
  // 生成统一社会信用代码
  const generateCreditCode = () => {
    const registrationType = '91'  // 企业
    const regionCode = '110105'    // 北京市朝阳区
    const orgCode = String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')
    const checkDigit = String(Math.floor(Math.random() * 10))
    return registrationType + regionCode + orgCode + checkDigit
  }

  const data = ref<BusinessLicenseData>({
    unifiedSocialCreditCode: generateCreditCode(),
    companyName: '北京创新科技有限公司',
    companyNameEn: 'Beijing Innovation Technology Co., Ltd.',
    companyType: '有限责任公司(自然人投资或控股)',
    legalRepresentative: '张三',
    registeredCapital: 1000000,
    capitalCurrency: 'CNY',
    paidInCapital: 500000,
    establishmentDate: '2020-01-15',
    businessTerm: '长期',
    termEndDate: '',
    
    registeredAddress: '北京市朝阳区建国路88号SOHO现代城A座2001室',
    businessScope: '技术开发、技术咨询、技术服务、技术推广；软件开发；计算机系统服务；数据处理；销售电子产品、计算机软件及辅助设备。（企业依法自主选择经营项目，开展经营活动；依法须经批准的项目，经相关部门批准后依批准的内容开展经营活动；不得从事本市产业政策禁止和限制类项目的经营活动。）',
    
    registrationAuthority: '北京市朝阳区市场监督管理局',
    approvalDate: '2020-01-15',
    
    template: 'standard',
    showQRCode: true,
    showWatermark: true
  })

  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = {
      CNY: '¥', USD: '$', EUR: '€'
    }
    return (symbols[data.value.capitalCurrency] || '') + amount.toLocaleString()
  }

  const formatCapitalInWords = (amount: number) => {
    const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿']
    
    if (amount === 0) return '零元整'
    
    const str = Math.floor(amount).toString()
    let result = ''
    
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
    return result + '元整'
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  const validateCreditCode = (code: string): boolean => {
    if (code.length !== 18) return false
    // 简单验证：检查前两位是否为有效的登记管理部门代码
    const validPrefixes = ['11', '12', '13', '91', '92', '93']
    return validPrefixes.includes(code.substring(0, 2))
  }

  const reset = () => {
    data.value = {
      unifiedSocialCreditCode: generateCreditCode(),
      companyName: '北京创新科技有限公司',
      companyNameEn: 'Beijing Innovation Technology Co., Ltd.',
      companyType: '有限责任公司(自然人投资或控股)',
      legalRepresentative: '张三',
      registeredCapital: 1000000,
      capitalCurrency: 'CNY',
      paidInCapital: 500000,
      establishmentDate: '2020-01-15',
      businessTerm: '长期',
      termEndDate: '',
      registeredAddress: '北京市朝阳区建国路88号SOHO现代城A座2001室',
      businessScope: '技术开发、技术咨询、技术服务、技术推广；软件开发；计算机系统服务；数据处理；销售电子产品、计算机软件及辅助设备。',
      registrationAuthority: '北京市朝阳区市场监督管理局',
      approvalDate: '2020-01-15',
      template: 'standard',
      showQRCode: true,
      showWatermark: true
    }
  }

  return {
    data,
    generateCreditCode,
    formatCurrency,
    formatCapitalInWords,
    formatDate,
    validateCreditCode,
    reset
  }
})
