import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface BirthCertData {
  // 新生儿信息
  childName: string
  childNamePinyin: string
  gender: 'male' | 'female'
  birthDate: string
  birthTime: string
  birthWeight: number
  birthLength: number
  gestationalWeeks: number
  healthStatus: string
  
  // 出生地点
  birthPlace: string
  birthHospital: string
  birthCity: string
  birthProvince: string
  birthCountry: string
  
  // 父亲信息
  fatherName: string
  fatherNamePinyin: string
  fatherIdNumber: string
  fatherNationality: string
  fatherEthnicity: string
  fatherBirthDate: string
  fatherAddress: string
  
  // 母亲信息
  motherName: string
  motherNamePinyin: string
  motherIdNumber: string
  motherNationality: string
  motherEthnicity: string
  motherBirthDate: string
  motherAddress: string
  
  // 证书信息
  certificateNumber: string
  issueDate: string
  issuingAuthority: string
  
  // 设计选项
  template: 'china_standard' | 'international'
  showPhoto: boolean
  showFootprint: boolean
}

export const useBirthCertStore = defineStore('birthCert', () => {
  const generateCertNumber = () => {
    const prefix = 'B'
    const regionCode = '110105'  // 北京市朝阳区
    const year = new Date().getFullYear()
    const sequence = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
    return prefix + regionCode + year + sequence
  }

  const data = ref<BirthCertData>({
    childName: '张小明',
    childNamePinyin: 'ZHANG XIAOMING',
    gender: 'male',
    birthDate: new Date().toISOString().split('T')[0],
    birthTime: '08:30',
    birthWeight: 3.5,
    birthLength: 50,
    gestationalWeeks: 40,
    healthStatus: '健康',
    
    birthPlace: '北京市朝阳区',
    birthHospital: '北京协和医院',
    birthCity: '北京',
    birthProvince: '北京市',
    birthCountry: '中国',
    
    fatherName: '张三',
    fatherNamePinyin: 'ZHANG SAN',
    fatherIdNumber: '110105198801011234',
    fatherNationality: '中国',
    fatherEthnicity: '汉族',
    fatherBirthDate: '1988-01-01',
    fatherAddress: '北京市朝阳区建国路88号',
    
    motherName: '李四',
    motherNamePinyin: 'LI SI',
    motherIdNumber: '110105199003151234',
    motherNationality: '中国',
    motherEthnicity: '汉族',
    motherBirthDate: '1990-03-15',
    motherAddress: '北京市朝阳区建国路88号',
    
    certificateNumber: generateCertNumber(),
    issueDate: new Date().toISOString().split('T')[0],
    issuingAuthority: '北京市朝阳区卫生健康委员会',
    
    template: 'china_standard',
    showPhoto: false,
    showFootprint: true
  })

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  const formatDateEn = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  const getGenderText = (lang: 'zh' | 'en' = 'zh') => {
    const genders: Record<string, { zh: string; en: string }> = {
      male: { zh: '男', en: 'Male' },
      female: { zh: '女', en: 'Female' }
    }
    return genders[data.value.gender]?.[lang] || ''
  }

  const reset = () => {
    data.value = {
      childName: '张小明',
      childNamePinyin: 'ZHANG XIAOMING',
      gender: 'male',
      birthDate: new Date().toISOString().split('T')[0],
      birthTime: '08:30',
      birthWeight: 3.5,
      birthLength: 50,
      gestationalWeeks: 40,
      healthStatus: '健康',
      birthPlace: '北京市朝阳区',
      birthHospital: '北京协和医院',
      birthCity: '北京',
      birthProvince: '北京市',
      birthCountry: '中国',
      fatherName: '张三',
      fatherNamePinyin: 'ZHANG SAN',
      fatherIdNumber: '110105198801011234',
      fatherNationality: '中国',
      fatherEthnicity: '汉族',
      fatherBirthDate: '1988-01-01',
      fatherAddress: '北京市朝阳区建国路88号',
      motherName: '李四',
      motherNamePinyin: 'LI SI',
      motherIdNumber: '110105199003151234',
      motherNationality: '中国',
      motherEthnicity: '汉族',
      motherBirthDate: '1990-03-15',
      motherAddress: '北京市朝阳区建国路88号',
      certificateNumber: generateCertNumber(),
      issueDate: new Date().toISOString().split('T')[0],
      issuingAuthority: '北京市朝阳区卫生健康委员会',
      template: 'china_standard',
      showPhoto: false,
      showFootprint: true
    }
  }

  return {
    data,
    generateCertNumber,
    formatDate,
    formatDateEn,
    getGenderText,
    reset
  }
})
