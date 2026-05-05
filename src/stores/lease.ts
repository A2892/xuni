import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LeaseData {
  // 合同基本信息
  contractNumber: string
  contractDate: string
  startDate: string
  endDate: string
  contractType: 'residential' | 'commercial' | 'short-term'
  
  // 房东信息
  landlordName: string
  landlordIdType: 'id_card' | 'passport' | 'business_license'
  landlordIdNumber: string
  landlordPhone: string
  landlordAddress: string
  landlordBank: string
  landlordBankAccount: string
  
  // 租客信息
  tenantName: string
  tenantIdType: 'id_card' | 'passport'
  tenantIdNumber: string
  tenantPhone: string
  tenantEmail: string
  tenantEmergencyContact: string
  tenantEmergencyPhone: string
  
  // 房屋信息
  propertyAddress: string
  propertyType: 'apartment' | 'house' | 'studio' | 'villa' | 'office' | 'shop'
  propertyArea: number
  areaUnit: 'sqm' | 'sqft'
  roomCount: number
  bathroomCount: number
  floor: string
  buildingName: string
  parkingIncluded: boolean
  parkingSpaces: number
  furnished: 'fully' | 'partially' | 'unfurnished'
  
  // 租金信息
  monthlyRent: number
  currency: string
  paymentMethod: 'bank_transfer' | 'cash' | 'check' | 'alipay' | 'wechat'
  paymentDay: number
  deposit: number
  depositMonths: number
  
  // 费用明细
  utilities: {
    electricity: 'included' | 'tenant' | 'split'
    water: 'included' | 'tenant' | 'split'
    gas: 'included' | 'tenant' | 'split'
    internet: 'included' | 'tenant' | 'split'
    propertyFee: 'included' | 'tenant' | 'split'
  }
  
  // 特殊条款
  petsAllowed: boolean
  smokingAllowed: boolean
  sublettingAllowed: boolean
  earlyTerminationNotice: number
  renewalOption: boolean
  rentIncreaseRate: number
  
  // 附加说明
  additionalTerms: string
  inventoryList: string
  
  // 签名
  landlordSignature: string
  tenantSignature: string
  witnessName: string
  witnessSignature: string
  
  // 设计
  template: 'standard' | 'formal' | 'simple'
  language: 'zh' | 'en' | 'bilingual'
}

export const propertyTypes = {
  apartment: { zh: '公寓', en: 'Apartment' },
  house: { zh: '独栋住宅', en: 'House' },
  studio: { zh: '单间', en: 'Studio' },
  villa: { zh: '别墅', en: 'Villa' },
  office: { zh: '办公室', en: 'Office' },
  shop: { zh: '商铺', en: 'Shop' }
}

export const furnishedOptions = {
  fully: { zh: '精装修', en: 'Fully Furnished' },
  partially: { zh: '简装', en: 'Partially Furnished' },
  unfurnished: { zh: '毛坯', en: 'Unfurnished' }
}

export const useLeaseStore = defineStore('lease', () => {
  const data = ref<LeaseData>({
    contractNumber: 'LC' + new Date().getFullYear() + String(Math.floor(Math.random() * 100000)).padStart(5, '0'),
    contractDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contractType: 'residential',
    
    landlordName: '王建国',
    landlordIdType: 'id_card',
    landlordIdNumber: '110101198001011234',
    landlordPhone: '13800138001',
    landlordAddress: '北京市海淀区中关村大街1号',
    landlordBank: '中国工商银行北京分行',
    landlordBankAccount: '6222 **** **** 1234',
    
    tenantName: '李明',
    tenantIdType: 'id_card',
    tenantIdNumber: '310101199001011234',
    tenantPhone: '13900139001',
    tenantEmail: 'liming@email.com',
    tenantEmergencyContact: '李父',
    tenantEmergencyPhone: '13700137001',
    
    propertyAddress: '北京市朝阳区望京街道望京SOHO T1栋2801室',
    propertyType: 'apartment',
    propertyArea: 85,
    areaUnit: 'sqm',
    roomCount: 2,
    bathroomCount: 1,
    floor: '28',
    buildingName: '望京SOHO T1',
    parkingIncluded: false,
    parkingSpaces: 0,
    furnished: 'fully',
    
    monthlyRent: 8500,
    currency: 'CNY',
    paymentMethod: 'bank_transfer',
    paymentDay: 1,
    deposit: 17000,
    depositMonths: 2,
    
    utilities: {
      electricity: 'tenant',
      water: 'tenant',
      gas: 'tenant',
      internet: 'tenant',
      propertyFee: 'tenant'
    },
    
    petsAllowed: false,
    smokingAllowed: false,
    sublettingAllowed: false,
    earlyTerminationNotice: 30,
    renewalOption: true,
    rentIncreaseRate: 5,
    
    additionalTerms: '',
    inventoryList: '冰箱x1、洗衣机x1、空调x2、电视x1、沙发x1、床x2、书桌x1、衣柜x2',
    
    landlordSignature: '',
    tenantSignature: '',
    witnessName: '',
    witnessSignature: '',
    
    template: 'standard',
    language: 'zh'
  })

  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = {
      CNY: '¥', USD: '$', EUR: '€', GBP: '£'
    }
    return (symbols[data.value.currency] || '') + amount.toLocaleString()
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

  const getContractDuration = () => {
    const start = new Date(data.value.startDate)
    const end = new Date(data.value.endDate)
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    return months
  }

  const reset = () => {
    data.value = {
      contractNumber: 'LC' + new Date().getFullYear() + String(Math.floor(Math.random() * 100000)).padStart(5, '0'),
      contractDate: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contractType: 'residential',
      landlordName: '王建国',
      landlordIdType: 'id_card',
      landlordIdNumber: '110101198001011234',
      landlordPhone: '13800138001',
      landlordAddress: '北京市海淀区中关村大街1号',
      landlordBank: '中国工商银行北京分行',
      landlordBankAccount: '6222 **** **** 1234',
      tenantName: '李明',
      tenantIdType: 'id_card',
      tenantIdNumber: '310101199001011234',
      tenantPhone: '13900139001',
      tenantEmail: 'liming@email.com',
      tenantEmergencyContact: '李父',
      tenantEmergencyPhone: '13700137001',
      propertyAddress: '北京市朝阳区望京街道望京SOHO T1栋2801室',
      propertyType: 'apartment',
      propertyArea: 85,
      areaUnit: 'sqm',
      roomCount: 2,
      bathroomCount: 1,
      floor: '28',
      buildingName: '望京SOHO T1',
      parkingIncluded: false,
      parkingSpaces: 0,
      furnished: 'fully',
      monthlyRent: 8500,
      currency: 'CNY',
      paymentMethod: 'bank_transfer',
      paymentDay: 1,
      deposit: 17000,
      depositMonths: 2,
      utilities: {
        electricity: 'tenant',
        water: 'tenant',
        gas: 'tenant',
        internet: 'tenant',
        propertyFee: 'tenant'
      },
      petsAllowed: false,
      smokingAllowed: false,
      sublettingAllowed: false,
      earlyTerminationNotice: 30,
      renewalOption: true,
      rentIncreaseRate: 5,
      additionalTerms: '',
      inventoryList: '冰箱x1、洗衣机x1、空调x2、电视x1、沙发x1、床x2、书桌x1、衣柜x2',
      landlordSignature: '',
      tenantSignature: '',
      witnessName: '',
      witnessSignature: '',
      template: 'standard',
      language: 'zh'
    }
  }

  return {
    data,
    formatCurrency,
    formatDate,
    getContractDuration,
    reset
  }
})
