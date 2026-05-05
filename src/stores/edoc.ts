import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface EDocData {
  // 文档类型
  docType: 'health-code' | 'nucleic-acid' | 'vaccine' | 'travel-card' | 'id-card' | 'passport' | 'driver-license'
  
  // 健康码信息
  healthCodeColor: 'green' | 'yellow' | 'red'
  healthCodeCity: string
  healthCodeArea: string
  lastUpdateTime: string
  validUntil: string
  
  // 核酸信息
  nucleicTestResult: 'negative' | 'positive'
  nucleicTestTime: string
  nucleicTestOrg: string
  nucleicSampleTime: string
  nucleicReportTime: string
  nucleicHours: string
  
  // 疫苗信息
  vaccineDoses: number
  vaccineType: string
  vaccineDate1: string
  vaccineDate2: string
  vaccineDate3: string
  vaccineOrg: string
  
  // 行程卡信息
  travelPhone: string
  travelCities: string[]
  travelUpdateTime: string
  travelDays: number
  
  // 身份证信息
  idName: string
  idGender: string
  idNation: string
  idBirthDate: string
  idAddress: string
  idNumber: string
  idAuthority: string
  idValidStart: string
  idValidEnd: string
  
  // 护照信息
  passportName: string
  passportNameCN: string
  passportGender: string
  passportBirthDate: string
  passportBirthPlace: string
  passportNumber: string
  passportIssueDate: string
  passportExpiryDate: string
  passportAuthority: string
  passportType: string
  passportNationality: string
  
  // 驾照信息
  driverName: string
  driverGender: string
  driverNationality: string
  driverAddress: string
  driverBirthDate: string
  driverIssueDate: string
  driverClass: string
  driverValidStart: string
  driverValidYears: number
  driverNumber: string
  driverFileNo: string
  
  // 头像
  avatarUrl: string
  
  // 显示设置
  deviceType: 'iphone' | 'android'
  showTime: string
  showBattery: number
  showSignal: number
  showWifi: boolean
  darkMode: boolean
  showQRCode: boolean
}

export const docTypes = [
  { id: 'health-code', label: '健康码', icon: '🟢' },
  { id: 'nucleic-acid', label: '核酸检测', icon: '🧪' },
  { id: 'vaccine', label: '疫苗接种', icon: '💉' },
  { id: 'travel-card', label: '行程卡', icon: '📍' },
  { id: 'id-card', label: '身份证', icon: '🪪' },
  { id: 'passport', label: '护照', icon: '🛂' },
  { id: 'driver-license', label: '驾驶证', icon: '🚗' }
]

export const vaccineTypes = [
  '北京科兴中维',
  '北京生物',
  '武汉生物',
  '长春生物',
  '康希诺',
  '智飞生物',
  '深圳康泰',
  '辉瑞-BioNTech',
  '莫德纳',
  '阿斯利康'
]

export const driverClasses = [
  { id: 'C1', name: 'C1 - 小型汽车' },
  { id: 'C2', name: 'C2 - 小型自动挡' },
  { id: 'A1', name: 'A1 - 大型客车' },
  { id: 'A2', name: 'A2 - 牵引车' },
  { id: 'A3', name: 'A3 - 城市公交' },
  { id: 'B1', name: 'B1 - 中型客车' },
  { id: 'B2', name: 'B2 - 大型货车' },
  { id: 'D', name: 'D - 摩托车' },
  { id: 'E', name: 'E - 轻便摩托车' }
]

export const useEDocStore = defineStore('edoc', () => {
  const data = ref<EDocData>({
    docType: 'health-code',
    
    // 健康码
    healthCodeColor: 'green',
    healthCodeCity: '北京市',
    healthCodeArea: '朝阳区',
    lastUpdateTime: getCurrentTime(),
    validUntil: '',
    
    // 核酸
    nucleicTestResult: 'negative',
    nucleicTestTime: getCurrentTime(),
    nucleicTestOrg: '北京协和医院',
    nucleicSampleTime: getTimeHoursAgo(24),
    nucleicReportTime: getTimeHoursAgo(18),
    nucleicHours: '24',
    
    // 疫苗
    vaccineDoses: 3,
    vaccineType: '北京科兴中维',
    vaccineDate1: '2021-06-15',
    vaccineDate2: '2021-07-15',
    vaccineDate3: '2022-01-15',
    vaccineOrg: '北京市朝阳区卫生服务中心',
    
    // 行程卡
    travelPhone: '138****8888',
    travelCities: ['北京市', '上海市', '深圳市'],
    travelUpdateTime: getCurrentTime(),
    travelDays: 14,
    
    // 身份证
    idName: '张明',
    idGender: '男',
    idNation: '汉',
    idBirthDate: '1990-05-15',
    idAddress: '北京市朝阳区建国路88号',
    idNumber: '110105199005151234',
    idAuthority: '北京市公安局朝阳分局',
    idValidStart: '2020-01-01',
    idValidEnd: '2040-01-01',
    
    // 护照
    passportName: 'ZHANG MING',
    passportNameCN: '张明',
    passportGender: 'M',
    passportBirthDate: '15 MAY 1990',
    passportBirthPlace: 'BEIJING',
    passportNumber: 'E12345678',
    passportIssueDate: '01 JAN 2020',
    passportExpiryDate: '01 JAN 2030',
    passportAuthority: '北京市出入境管理局',
    passportType: 'P',
    passportNationality: 'CHINESE',
    
    // 驾照
    driverName: '张明',
    driverGender: '男',
    driverNationality: '中国',
    driverAddress: '北京市朝阳区建国路88号',
    driverBirthDate: '1990-05-15',
    driverIssueDate: '2015-06-20',
    driverClass: 'C1',
    driverValidStart: '2021-06-20',
    driverValidYears: 6,
    driverNumber: '110105199005151234',
    driverFileNo: '110105678901234',
    
    avatarUrl: '',
    
    deviceType: 'iphone',
    showTime: '09:41',
    showBattery: 85,
    showSignal: 4,
    showWifi: true,
    darkMode: false,
    showQRCode: true
  })

  function getCurrentTime(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  function getTimeHoursAgo(hours: number): string {
    const now = new Date()
    now.setHours(now.getHours() - hours)
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const h = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${h}:${minutes}`
  }

  function refreshTime() {
    data.value.lastUpdateTime = getCurrentTime()
    data.value.travelUpdateTime = getCurrentTime()
  }

  function addTravelCity(city: string) {
    if (!data.value.travelCities.includes(city)) {
      data.value.travelCities.push(city)
    }
  }

  function removeTravelCity(index: number) {
    data.value.travelCities.splice(index, 1)
  }

  function setDocTypeDefaults(docType: EDocData['docType']) {
    data.value.docType = docType
    refreshTime()
  }

  function reset() {
    data.value = {
      docType: 'health-code',
      healthCodeColor: 'green',
      healthCodeCity: '北京市',
      healthCodeArea: '朝阳区',
      lastUpdateTime: getCurrentTime(),
      validUntil: '',
      nucleicTestResult: 'negative',
      nucleicTestTime: getCurrentTime(),
      nucleicTestOrg: '北京协和医院',
      nucleicSampleTime: getTimeHoursAgo(24),
      nucleicReportTime: getTimeHoursAgo(18),
      nucleicHours: '24',
      vaccineDoses: 3,
      vaccineType: '北京科兴中维',
      vaccineDate1: '2021-06-15',
      vaccineDate2: '2021-07-15',
      vaccineDate3: '2022-01-15',
      vaccineOrg: '北京市朝阳区卫生服务中心',
      travelPhone: '138****8888',
      travelCities: ['北京市', '上海市', '深圳市'],
      travelUpdateTime: getCurrentTime(),
      travelDays: 14,
      idName: '张明',
      idGender: '男',
      idNation: '汉',
      idBirthDate: '1990-05-15',
      idAddress: '北京市朝阳区建国路88号',
      idNumber: '110105199005151234',
      idAuthority: '北京市公安局朝阳分局',
      idValidStart: '2020-01-01',
      idValidEnd: '2040-01-01',
      passportName: 'ZHANG MING',
      passportNameCN: '张明',
      passportGender: 'M',
      passportBirthDate: '15 MAY 1990',
      passportBirthPlace: 'BEIJING',
      passportNumber: 'E12345678',
      passportIssueDate: '01 JAN 2020',
      passportExpiryDate: '01 JAN 2030',
      passportAuthority: '北京市出入境管理局',
      passportType: 'P',
      passportNationality: 'CHINESE',
      driverName: '张明',
      driverGender: '男',
      driverNationality: '中国',
      driverAddress: '北京市朝阳区建国路88号',
      driverBirthDate: '1990-05-15',
      driverIssueDate: '2015-06-20',
      driverClass: 'C1',
      driverValidStart: '2021-06-20',
      driverValidYears: 6,
      driverNumber: '110105199005151234',
      driverFileNo: '110105678901234',
      avatarUrl: '',
      deviceType: 'iphone',
      showTime: '09:41',
      showBattery: 85,
      showSignal: 4,
      showWifi: true,
      darkMode: false,
      showQRCode: true
    }
  }

  return {
    data,
    getCurrentTime,
    getTimeHoursAgo,
    refreshTime,
    addTravelCity,
    removeTravelCity,
    setDocTypeDefaults,
    reset
  }
})
