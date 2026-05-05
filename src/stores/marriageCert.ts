import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MarriageCertData {
  // 证书基本信息
  certificateNumber: string
  registrationDate: string
  registrationOffice: string
  registrationOfficer: string
  certificateType: 'marriage' | 'divorce'
  
  // 丈夫信息
  husbandName: string
  husbandIdNumber: string
  husbandNationality: string
  husbandBirthDate: string
  husbandPhoto: string
  
  // 妻子信息
  wifeName: string
  wifeIdNumber: string
  wifeNationality: string
  wifeBirthDate: string
  wifePhoto: string
  
  // 设计选项
  template: 'china_2004' | 'china_2022'
  showPhotos: boolean
  showQRCode: boolean
}

export const useMarriageCertStore = defineStore('marriageCert', () => {
  const data = ref<MarriageCertData>({
    certificateNumber: 'J' + new Date().getFullYear() + '11010500' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
    registrationDate: new Date().toISOString().split('T')[0],
    registrationOffice: '北京市朝阳区民政局婚姻登记处',
    registrationOfficer: '王登记员',
    certificateType: 'marriage',
    
    husbandName: '张三',
    husbandIdNumber: '110105199001011234',
    husbandNationality: '中国',
    husbandBirthDate: '1990-01-01',
    husbandPhoto: '',
    
    wifeName: '李四',
    wifeIdNumber: '110105199203151234',
    wifeNationality: '中国',
    wifeBirthDate: '1992-03-15',
    wifePhoto: '',
    
    template: 'china_2004',
    showPhotos: true,
    showQRCode: true
  })

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  const getAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const reset = () => {
    data.value = {
      certificateNumber: 'J' + new Date().getFullYear() + '11010500' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
      registrationDate: new Date().toISOString().split('T')[0],
      registrationOffice: '北京市朝阳区民政局婚姻登记处',
      registrationOfficer: '王登记员',
      certificateType: 'marriage',
      husbandName: '张三',
      husbandIdNumber: '110105199001011234',
      husbandNationality: '中国',
      husbandBirthDate: '1990-01-01',
      husbandPhoto: '',
      wifeName: '李四',
      wifeIdNumber: '110105199203151234',
      wifeNationality: '中国',
      wifeBirthDate: '1992-03-15',
      wifePhoto: '',
      template: 'china_2004',
      showPhotos: true,
      showQRCode: true
    }
  }

  return {
    data,
    formatDate,
    getAge,
    reset
  }
})
