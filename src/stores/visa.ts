import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type VisaTypeKey = 'tourist' | 'business' | 'student' | 'work' | 'transit' | 'immigrant'

export interface VisaTypeOption {
  key: VisaTypeKey
  code: string
  name: string
  icon: string
  purpose: string
  annotation: string
  entryType: 'single' | 'double' | 'multiple'
  duration: string
}

export interface VisaData {
  // 签证类型
  visaType: VisaTypeKey
  visaClass: string
  entryType: 'single' | 'double' | 'multiple'
  
  // 签证信息
  visaNumber: string
  controlNumber: string
  issuingCountry: string
  issuingPost: string
  
  // 持有人信息
  surname: string
  givenNames: string
  nationality: string
  passportNumber: string
  dateOfBirth: string
  sex: 'M' | 'F'
  photo: string
  
  // 有效期
  issueDate: string
  expiryDate: string
  validFrom: string
  duration: string
  
  // 附加信息
  purpose: string
  annotation: string
  
  // 设计选项
  template: 'us' | 'uk' | 'schengen' | 'canada' | 'australia' | 'japan' | 'china'
  showMRZ: boolean
  showBarcode: boolean
  showHologram: boolean
  qrCodeImage: string
  qrCodeText: string
  stampImage: string
  signatureText: string
  signatureImage: string
}

export interface VisaDesignSettings {
  watermarkEnabled: boolean
  watermarkText: string
  watermarkOpacity: number
  borderEnabled: boolean
  borderStyle: 'solid' | 'double' | 'guilloche'
  borderWidth: number
  fontFamily: string
  stampEnabled: boolean
  stampRotation: number
  securityPatternEnabled: boolean
  hologramEffect: boolean
}

export interface VisaSettings {
  language: 'en' | 'zh'
  showQRCode: boolean
  showSecurityFeatures: boolean
}

export const visaTemplates = {
  us: { name: '美国签证', color: '#003366', accent: '#b8860b' },
  uk: { name: '英国签证', color: '#9e1b34', accent: '#cfaa3c' },
  schengen: { name: '申根签证', color: '#003399', accent: '#fcd116' },
  canada: { name: '加拿大签证', color: '#ff0000', accent: '#ffffff' },
  australia: { name: '澳大利亚签证', color: '#00008b', accent: '#c8a951' },
  japan: { name: '日本签证', color: '#bc002d', accent: '#c9a227' },
  china: { name: '中国签证', color: '#de2910', accent: '#ffde00' }
}

export const visaTypeOptionsByTemplate: Record<VisaData['template'], VisaTypeOption[]> = {
  us: [
    { key: 'tourist', code: 'B-2', name: '旅游签证', icon: '🏖️', purpose: 'TOURISM', annotation: 'MULTIPLE ENTRY', entryType: 'multiple', duration: '6 MONTHS' },
    { key: 'business', code: 'B-1', name: '商务签证', icon: '💼', purpose: 'BUSINESS', annotation: 'MULTIPLE ENTRY', entryType: 'multiple', duration: '6 MONTHS' },
    { key: 'student', code: 'F-1', name: '学生签证', icon: '🎓', purpose: 'STUDY', annotation: 'STUDENT', entryType: 'multiple', duration: '5 YEARS' },
    { key: 'work', code: 'H-1B', name: '工作签证', icon: '👔', purpose: 'WORK', annotation: 'EMPLOYMENT', entryType: 'multiple', duration: '3 YEARS' },
    { key: 'transit', code: 'C-1', name: '过境签证', icon: '✈️', purpose: 'TRANSIT', annotation: 'SINGLE ENTRY', entryType: 'single', duration: '1 MONTH' },
    { key: 'immigrant', code: 'IR-1', name: '配偶/移民签证', icon: '🏠', purpose: 'IMMIGRATION', annotation: 'PERMANENT RESIDENT', entryType: 'multiple', duration: '10 YEARS' }
  ],
  uk: [
    { key: 'tourist', code: 'Standard Visitor', name: '访问签证', icon: '🏖️', purpose: 'VISIT', annotation: 'STANDARD VISITOR', entryType: 'multiple', duration: '6 MONTHS' },
    { key: 'business', code: 'Business Visitor', name: '商务访问', icon: '💼', purpose: 'BUSINESS', annotation: 'BUSINESS VISITOR', entryType: 'multiple', duration: '6 MONTHS' },
    { key: 'student', code: 'Student Visa', name: '学生签证', icon: '🎓', purpose: 'STUDY', annotation: 'STUDENT', entryType: 'multiple', duration: '5 YEARS' },
    { key: 'work', code: 'Skilled Worker', name: '工作签证', icon: '👔', purpose: 'WORK', annotation: 'SKILLED WORKER', entryType: 'multiple', duration: '5 YEARS' },
    { key: 'transit', code: 'Transit', name: '过境签证', icon: '✈️', purpose: 'TRANSIT', annotation: 'TRANSIT', entryType: 'single', duration: '48 HOURS' },
    { key: 'immigrant', code: 'Family Visa', name: '家庭团聚', icon: '🏠', purpose: 'SETTLEMENT', annotation: 'FAMILY', entryType: 'multiple', duration: '5 YEARS' }
  ],
  schengen: [
    { key: 'tourist', code: 'C-90', name: '短期申根签证', icon: '🏖️', purpose: 'TOURISM', annotation: 'SCHENGEN VISA', entryType: 'multiple', duration: '90 DAYS' },
    { key: 'business', code: 'C-90', name: '商务申根签证', icon: '💼', purpose: 'BUSINESS', annotation: 'SCHENGEN VISA', entryType: 'multiple', duration: '90 DAYS' },
    { key: 'student', code: 'D', name: '学习签证', icon: '🎓', purpose: 'STUDY', annotation: 'NATIONAL VISA', entryType: 'single', duration: '1 YEAR' },
    { key: 'work', code: 'D', name: '工作签证', icon: '👔', purpose: 'WORK', annotation: 'NATIONAL VISA', entryType: 'single', duration: '1 YEAR' },
    { key: 'transit', code: 'C-1', name: '过境签证', icon: '✈️', purpose: 'TRANSIT', annotation: 'TRANSIT', entryType: 'single', duration: '5 DAYS' },
    { key: 'immigrant', code: 'D', name: '长期居留签证', icon: '🏠', purpose: 'SETTLEMENT', annotation: 'D NATIONAL VISA', entryType: 'single', duration: '1 YEAR' }
  ],
  canada: [
    { key: 'tourist', code: 'Visitor', name: '访客签证', icon: '🏖️', purpose: 'TOURISM', annotation: 'VISITOR', entryType: 'multiple', duration: '6 MONTHS' },
    { key: 'business', code: 'Business', name: '商务签证', icon: '💼', purpose: 'BUSINESS', annotation: 'BUSINESS', entryType: 'multiple', duration: '6 MONTHS' },
    { key: 'student', code: 'Study', name: '学生签证', icon: '🎓', purpose: 'STUDY', annotation: 'STUDY', entryType: 'multiple', duration: '5 YEARS' },
    { key: 'work', code: 'Work', name: '工作签证', icon: '👔', purpose: 'WORK', annotation: 'WORK', entryType: 'multiple', duration: '4 YEARS' },
    { key: 'transit', code: 'Transit', name: '过境签证', icon: '✈️', purpose: 'TRANSIT', annotation: 'TRANSIT', entryType: 'single', duration: '48 HOURS' },
    { key: 'immigrant', code: 'Permanent Resident', name: '永久居民', icon: '🏠', purpose: 'IMMIGRATION', annotation: 'PERMANENT RESIDENT', entryType: 'multiple', duration: '10 YEARS' }
  ],
  australia: [
    { key: 'tourist', code: 'Visitor 600', name: '旅游签证', icon: '🏖️', purpose: 'TOURISM', annotation: 'Visitor 600', entryType: 'single', duration: '3 MONTHS' },
    { key: 'business', code: 'Business 600', name: '商务签证', icon: '💼', purpose: 'BUSINESS', annotation: 'Business 600', entryType: 'single', duration: '3 MONTHS' },
    { key: 'student', code: 'Student 500', name: '学生签证', icon: '🎓', purpose: 'STUDY', annotation: 'Student 500', entryType: 'multiple', duration: '5 YEARS' },
    { key: 'work', code: 'Temporary Work 482', name: '工作签证', icon: '👔', purpose: 'WORK', annotation: 'Temporary Work', entryType: 'multiple', duration: '4 YEARS' },
    { key: 'transit', code: 'Transit 771', name: '过境签证', icon: '✈️', purpose: 'TRANSIT', annotation: 'Transit 771', entryType: 'single', duration: '72 HOURS' },
    { key: 'immigrant', code: 'Permanent Resident', name: '永久居民', icon: '🏠', purpose: 'IMMIGRATION', annotation: 'Permanent Resident', entryType: 'multiple', duration: '10 YEARS' }
  ],
  japan: [
    { key: 'tourist', code: 'Short-term', name: '旅游签证', icon: '🏖️', purpose: 'TOURISM', annotation: 'SHORT-TERM VISA', entryType: 'single', duration: '90 DAYS' },
    { key: 'business', code: 'Business', name: '商务签证', icon: '💼', purpose: 'BUSINESS', annotation: 'BUSINESS VISA', entryType: 'single', duration: '90 DAYS' },
    { key: 'student', code: 'Student', name: '学生签证', icon: '🎓', purpose: 'STUDY', annotation: 'STUDENT VISA', entryType: 'multiple', duration: '1 YEAR' },
    { key: 'work', code: 'Work', name: '工作签证', icon: '👔', purpose: 'WORK', annotation: 'WORK VISA', entryType: 'multiple', duration: '3 YEARS' },
    { key: 'transit', code: 'Transit', name: '过境签证', icon: '✈️', purpose: 'TRANSIT', annotation: 'TRANSIT VISA', entryType: 'single', duration: '15 DAYS' },
    { key: 'immigrant', code: 'Permanent Resident', name: '永久居民', icon: '🏠', purpose: 'IMMIGRATION', annotation: 'PERMANENT RESIDENT', entryType: 'multiple', duration: '10 YEARS' }
  ],
  china: [
    { key: 'tourist', code: 'L', name: '旅游签证', icon: '🏖️', purpose: 'TOURISM', annotation: 'L VISA', entryType: 'single', duration: '3 MONTHS' },
    { key: 'business', code: 'M', name: '商务签证', icon: '💼', purpose: 'BUSINESS', annotation: 'M VISA', entryType: 'multiple', duration: '6 MONTHS' },
    { key: 'student', code: 'X', name: '学生签证', icon: '🎓', purpose: 'STUDY', annotation: 'X VISA', entryType: 'multiple', duration: '1 YEAR' },
    { key: 'work', code: 'Z', name: '工作签证', icon: '👔', purpose: 'WORK', annotation: 'Z VISA', entryType: 'single', duration: '1 YEAR' },
    { key: 'transit', code: 'G', name: '过境签证', icon: '✈️', purpose: 'TRANSIT', annotation: 'G VISA', entryType: 'single', duration: '7 DAYS' },
    { key: 'immigrant', code: 'D', name: '团聚签证', icon: '🏠', purpose: 'SETTLEMENT', annotation: 'D VISA', entryType: 'multiple', duration: '5 YEARS' }
  ]
}

const defaultVisaTemplateInfo: Record<VisaData['template'], { issuingCountry: string; issuingPost: string; visaType: VisaTypeKey }> = {
  us: { issuingCountry: 'UNITED STATES', issuingPost: 'BEIJING', visaType: 'tourist' },
  uk: { issuingCountry: 'UNITED KINGDOM', issuingPost: 'LONDON', visaType: 'tourist' },
  schengen: { issuingCountry: 'SCHENGEN', issuingPost: 'BERLIN', visaType: 'tourist' },
  canada: { issuingCountry: 'CANADA', issuingPost: 'TORONTO', visaType: 'tourist' },
  australia: { issuingCountry: 'AUSTRALIA', issuingPost: 'SYDNEY', visaType: 'tourist' },
  japan: { issuingCountry: 'JAPAN', issuingPost: 'TOKYO', visaType: 'tourist' },
  china: { issuingCountry: 'CHINA', issuingPost: 'BEIJING', visaType: 'tourist' }
}

export const useVisaStore = defineStore('visa', () => {
  const data = ref<VisaData>({
    visaType: 'tourist',
    visaClass: 'B-2',
    entryType: 'multiple',
    visaNumber: 'VN12345678',
    controlNumber: '2024' + Math.random().toString().slice(2, 12),
    issuingCountry: 'UNITED STATES',
    issuingPost: 'BEIJING',
    surname: 'ZHANG',
    givenNames: 'SAN',
    nationality: 'CHINA',
    passportNumber: 'E12345678',
    dateOfBirth: '1990-01-15',
    sex: 'M',
    photo: '',
    issueDate: new Date().toISOString().split('T')[0] || '',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    validFrom: new Date().toISOString().split('T')[0] || '',
    duration: '6 MONTHS',
    purpose: 'TOURISM',
    annotation: 'MULTIPLE ENTRY',
    template: 'us',
    showMRZ: true,
    showBarcode: true,
    showHologram: true,
    qrCodeImage: '',
    qrCodeText: 'https://visa.example.com/verify',
    stampImage: '',
    signatureText: 'AUTHORIZED SIGNATORY',
    signatureImage: ''
  })

  // 设计设置
  const designSettings = ref<VisaDesignSettings>({
    watermarkEnabled: false,
    watermarkText: 'SPECIMEN',
    watermarkOpacity: 12,
    borderEnabled: true,
    borderStyle: 'guilloche',
    borderWidth: 3,
    fontFamily: 'Arial, sans-serif',
    stampEnabled: true,
    stampRotation: -15,
    securityPatternEnabled: true,
    hologramEffect: true
  })

  // 语言和其他设置
  const settings = ref<VisaSettings>({
    language: 'en',
    showQRCode: true,
    showSecurityFeatures: true
  })

  // 翻译
  const translations = ref({
    en: {
      surname: 'Surname',
      givenNames: 'Given Names',
      nationality: 'Nationality',
      dateOfBirth: 'Date of Birth',
      sex: 'Sex',
      passportNumber: 'Passport Number',
      issueDate: 'Issue Date',
      expiryDate: 'Expiration Date',
      validFrom: 'Valid From',
      validUntil: 'Valid Until',
      entries: 'Entries',
      category: 'Category',
      purpose: 'Purpose',
      annotation: 'Annotation',
      remarks: 'Remarks',
      placeOfIssue: 'Place of Issue',
      visaNumber: 'Visa Number',
      controlNumber: 'Control Number',
      duration: 'Duration of Stay'
    },
    zh: {
      surname: '姓氏',
      givenNames: '名字',
      nationality: '国籍',
      dateOfBirth: '出生日期',
      sex: '性别',
      passportNumber: '护照号码',
      issueDate: '签发日期',
      expiryDate: '有效期至',
      validFrom: '有效期从',
      validUntil: '有效期至',
      entries: '入境次数',
      category: '签证类别',
      purpose: '目的',
      annotation: '备注',
      remarks: '备注',
      placeOfIssue: '签发地点',
      visaNumber: '签证号码',
      controlNumber: '控制号码',
      duration: '停留期限'
    }
  })

  const t = (key: string) => {
    const lang = settings.value.language
    return translations.value[lang][key as keyof typeof translations.value.en] || key
  }

  const createRandomDigits = (length: number) => {
    return Math.random().toString().slice(2, 2 + length).padEnd(length, '0')
  }

  const generateVisaNumber = (template: VisaData['template'] = data.value.template) => {
    switch (template) {
      case 'us': return `V${createRandomDigits(8)}`
      case 'uk': return `UK${createRandomDigits(10)}`
      case 'schengen': return `S${createRandomDigits(7)}`
      case 'canada': return `CA${createRandomDigits(7)}`
      case 'australia': return `AU${createRandomDigits(8)}`
      case 'japan': return `JP${createRandomDigits(8)}`
      case 'china': return `${['L', 'M', 'X', 'Z', 'G', 'D'][Math.floor(Math.random() * 6)]}${createRandomDigits(7)}`
      default: return `VN${createRandomDigits(8)}`
    }
  }

  const generateControlNumber = (template: VisaData['template'] = data.value.template) => {
    const year = new Date().getFullYear().toString().slice(2)
    return `${year}${createRandomDigits(11)}`
  }

  const findVisaTypeOption = (template: VisaData['template'], key: string) => {
    const options = visaTypeOptionsByTemplate[template] || visaTypeOptionsByTemplate['us']
    return (options.find((item) => item.key === key) || options[0])!
  }

  const currentVisaTypeName = computed(() => {
    return findVisaTypeOption(data.value.template, data.value.visaType).name
  })

  const currentVisaTypeOption = computed(() => {
    return findVisaTypeOption(data.value.template, data.value.visaType)
  })

  const selectVisaType = (key: VisaTypeKey) => {
    const option = findVisaTypeOption(data.value.template, key)
    data.value.visaType = option.key
    data.value.visaClass = option.code
    data.value.purpose = option.purpose
    data.value.annotation = option.annotation
    data.value.entryType = option.entryType
    data.value.duration = option.duration
  }

  const selectTemplate = (template: VisaData['template']) => {
    const templateInfo = defaultVisaTemplateInfo[template]
    const option = findVisaTypeOption(template, data.value.visaType)

    data.value.template = template
    data.value.issuingCountry = templateInfo.issuingCountry
    data.value.issuingPost = templateInfo.issuingPost
    data.value.visaType = option.key
    data.value.visaClass = option.code
    data.value.purpose = option.purpose
    data.value.annotation = option.annotation
    data.value.entryType = option.entryType
    data.value.duration = option.duration
    data.value.visaNumber = generateVisaNumber(template)
    data.value.controlNumber = generateControlNumber(template)
  }

  const generateMRZ = computed(() => {
    const v = data.value
    const type = 'V<' + v.issuingCountry.substring(0, 3)
    const name = (v.surname + '<<' + v.givenNames.replace(/ /g, '<')).padEnd(39, '<').substring(0, 39)
    const line1 = (type + name).substring(0, 44)

    const passport = v.passportNumber.padEnd(9, '<').substring(0, 9)
    const nat = v.nationality.substring(0, 3).padEnd(3, '<')
    const dob = v.dateOfBirth.replace(/-/g, '').substring(2, 8).padEnd(6, '<')
    const sex = v.sex
    const exp = v.expiryDate.replace(/-/g, '').substring(2, 8).padEnd(6, '<')
    const line2 = `${passport}<${nat}${dob}${sex}${exp}<<<<<<<<<<<<<<0`.substring(0, 44)

    return { line1, line2 }
  })

  const formatDate = (date: string, format: 'full' | 'short' = 'full') => {
    if (!date) return ''
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return date
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    if (format === 'short') {
      return `${String(d.getDate()).padStart(2, '0')}${months[d.getMonth()]}${d.getFullYear()}`
    }
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  const reset = () => {
    const template: VisaData['template'] = 'us'
    const defaultInfo = defaultVisaTemplateInfo[template]
    const option = findVisaTypeOption(template, 'tourist')

    data.value = {
      visaType: option.key,
      visaClass: option.code,
      entryType: option.entryType,
      visaNumber: generateVisaNumber(template),
      controlNumber: generateControlNumber(template),
      issuingCountry: defaultInfo.issuingCountry,
      issuingPost: defaultInfo.issuingPost,
      surname: 'ZHANG',
      givenNames: 'SAN',
      nationality: 'CHINA',
      passportNumber: 'E12345678',
      dateOfBirth: '1990-01-15',
      sex: 'M',
      photo: '',
      issueDate: new Date().toISOString().split('T')[0] || '',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
      validFrom: new Date().toISOString().split('T')[0] || '',
      duration: option.duration,
      purpose: option.purpose,
      annotation: option.annotation,
      template,
      showMRZ: true,
      showBarcode: true,
      showHologram: true,
      qrCodeImage: '',
      qrCodeText: 'https://visa.example.com/verify',
      stampImage: '',
      signatureText: 'AUTHORIZED SIGNATORY',
      signatureImage: ''
    }
  }

  return {
    data,
    designSettings,
    settings,
    translations,
    generateMRZ,
    formatDate,
    t,
    currentVisaTypeName,
    currentVisaTypeOption,
    selectVisaType,
    selectTemplate,
    generateVisaNumber,
    generateControlNumber,
    reset
  }
})
