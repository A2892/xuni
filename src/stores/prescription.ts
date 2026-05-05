import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface PrescriptionData {
  // 医院信息
  hospitalName: string
  hospitalNameEn: string
  hospitalLogo: string
  hospitalAddress: string
  hospitalPhone: string
  hospitalLevel: '三甲' | '三乙' | '二甲' | '二乙' | '一级' | '社区'
  department: string
  
  // 处方基本信息
  prescriptionNumber: string
  prescriptionDate: string
  prescriptionType: 'western' | 'chinese' | 'mixed'
  isEmergency: boolean
  
  // 患者信息
  patientName: string
  patientGender: 'male' | 'female'
  patientAge: number
  patientIdNumber: string
  patientPhone: string
  patientAddress: string
  medicalRecordNumber: string
  insuranceType: 'medical_insurance' | 'self_pay' | 'commercial'
  insuranceNumber: string
  
  // 诊断信息
  diagnosis: string[]
  chiefComplaint: string
  allergies: string[]
  
  // 药品信息
  medications: {
    name: string
    nameEn: string
    specification: string
    dosage: string
    frequency: string
    duration: string
    quantity: number
    unit: string
    route: string
    instructions: string
    isPrescription: boolean
  }[]
  
  // 医嘱
  doctorAdvice: string
  dietAdvice: string
  followUpDate: string
  
  // 医生信息
  doctorName: string
  doctorTitle: string
  doctorLicense: string
  doctorSignature: string
  doctorDepartment: string
  
  // 药师审核
  pharmacistName: string
  pharmacistSignature: string
  dispensingDate: string
  
  // 费用
  showCost: boolean
  totalCost: number
  insuranceCover: number
  selfPay: number
  
  // 设计
  template: 'standard' | 'hospital' | 'clinic'
  primaryColor: string
  showBarcode: boolean
  showWatermark: boolean
}

export const frequencyOptions = [
  { value: 'qd', label: '每日一次 (qd)' },
  { value: 'bid', label: '每日两次 (bid)' },
  { value: 'tid', label: '每日三次 (tid)' },
  { value: 'qid', label: '每日四次 (qid)' },
  { value: 'qn', label: '每晚一次 (qn)' },
  { value: 'qod', label: '隔日一次 (qod)' },
  { value: 'qw', label: '每周一次 (qw)' },
  { value: 'prn', label: '必要时 (prn)' }
]

export const routeOptions = [
  { value: 'po', label: '口服 (po)' },
  { value: 'iv', label: '静脉注射 (iv)' },
  { value: 'im', label: '肌肉注射 (im)' },
  { value: 'sc', label: '皮下注射 (sc)' },
  { value: 'external', label: '外用' },
  { value: 'inhalation', label: '吸入' },
  { value: 'sublingual', label: '舌下含服' },
  { value: 'rectal', label: '直肠给药' }
]

export const usePrescriptionStore = defineStore('prescription', () => {
  const data = ref<PrescriptionData>({
    hospitalName: '北京协和医院',
    hospitalNameEn: 'Peking Union Medical College Hospital',
    hospitalLogo: '',
    hospitalAddress: '北京市东城区帅府园1号',
    hospitalPhone: '010-69156114',
    hospitalLevel: '三甲',
    department: '内科',
    
    prescriptionNumber: 'RX' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
    prescriptionDate: new Date().toISOString().split('T')[0],
    prescriptionType: 'western',
    isEmergency: false,
    
    patientName: '张三',
    patientGender: 'male',
    patientAge: 35,
    patientIdNumber: '110101198901011234',
    patientPhone: '13800138000',
    patientAddress: '北京市朝阳区',
    medicalRecordNumber: 'MR' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
    insuranceType: 'medical_insurance',
    insuranceNumber: 'YB110101199001011234',
    
    diagnosis: ['急性上呼吸道感染', '咽炎'],
    chiefComplaint: '咳嗽、咽痛3天',
    allergies: ['青霉素'],
    
    medications: [
      {
        name: '阿莫西林胶囊',
        nameEn: 'Amoxicillin Capsules',
        specification: '0.5g*24粒/盒',
        dosage: '0.5g',
        frequency: 'tid',
        duration: '7天',
        quantity: 2,
        unit: '盒',
        route: 'po',
        instructions: '饭后服用',
        isPrescription: true
      },
      {
        name: '布洛芬缓释胶囊',
        nameEn: 'Ibuprofen Sustained Release Capsules',
        specification: '0.3g*20粒/盒',
        dosage: '0.3g',
        frequency: 'bid',
        duration: '3天',
        quantity: 1,
        unit: '盒',
        route: 'po',
        instructions: '饭后服用，发热时服用',
        isPrescription: true
      },
      {
        name: '复方甘草片',
        nameEn: 'Compound Licorice Tablets',
        specification: '100片/瓶',
        dosage: '3片',
        frequency: 'tid',
        duration: '7天',
        quantity: 1,
        unit: '瓶',
        route: 'po',
        instructions: '含服',
        isPrescription: false
      }
    ],
    
    doctorAdvice: '多饮水，注意休息，避免受凉',
    dietAdvice: '清淡饮食，忌辛辣刺激',
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    doctorName: '李医生',
    doctorTitle: '主任医师',
    doctorLicense: '110108000001234',
    doctorSignature: '',
    doctorDepartment: '呼吸内科',
    
    pharmacistName: '王药师',
    pharmacistSignature: '',
    dispensingDate: new Date().toISOString().split('T')[0],
    
    showCost: true,
    totalCost: 156.50,
    insuranceCover: 125.20,
    selfPay: 31.30,
    
    template: 'hospital',
    primaryColor: '#059669',
    showBarcode: true,
    showWatermark: true
  })

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  const getFrequencyLabel = (value: string) => {
    const option = frequencyOptions.find(o => o.value === value)
    return option ? option.label : value
  }

  const getRouteLabel = (value: string) => {
    const option = routeOptions.find(o => o.value === value)
    return option ? option.label : value
  }

  const calculateTotalCost = () => {
    // 模拟计算总费用
    return data.value.medications.reduce((sum, med) => {
      const basePrice = Math.floor(Math.random() * 50) + 10
      return sum + basePrice * med.quantity
    }, 0)
  }

  const reset = () => {
    data.value = {
      hospitalName: '北京协和医院',
      hospitalNameEn: 'Peking Union Medical College Hospital',
      hospitalLogo: '',
      hospitalAddress: '北京市东城区帅府园1号',
      hospitalPhone: '010-69156114',
      hospitalLevel: '三甲',
      department: '内科',
      prescriptionNumber: 'RX' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
      prescriptionDate: new Date().toISOString().split('T')[0],
      prescriptionType: 'western',
      isEmergency: false,
      patientName: '张三',
      patientGender: 'male',
      patientAge: 35,
      patientIdNumber: '110101198901011234',
      patientPhone: '13800138000',
      patientAddress: '北京市朝阳区',
      medicalRecordNumber: 'MR' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
      insuranceType: 'medical_insurance',
      insuranceNumber: 'YB110101199001011234',
      diagnosis: ['急性上呼吸道感染', '咽炎'],
      chiefComplaint: '咳嗽、咽痛3天',
      allergies: ['青霉素'],
      medications: [
        {
          name: '阿莫西林胶囊',
          nameEn: 'Amoxicillin Capsules',
          specification: '0.5g*24粒/盒',
          dosage: '0.5g',
          frequency: 'tid',
          duration: '7天',
          quantity: 2,
          unit: '盒',
          route: 'po',
          instructions: '饭后服用',
          isPrescription: true
        }
      ],
      doctorAdvice: '多饮水，注意休息，避免受凉',
      dietAdvice: '清淡饮食，忌辛辣刺激',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      doctorName: '李医生',
      doctorTitle: '主任医师',
      doctorLicense: '110108000001234',
      doctorSignature: '',
      doctorDepartment: '呼吸内科',
      pharmacistName: '王药师',
      pharmacistSignature: '',
      dispensingDate: new Date().toISOString().split('T')[0],
      showCost: true,
      totalCost: 156.50,
      insuranceCover: 125.20,
      selfPay: 31.30,
      template: 'hospital',
      primaryColor: '#059669',
      showBarcode: true,
      showWatermark: true
    }
  }

  return {
    data,
    formatDate,
    getFrequencyLabel,
    getRouteLabel,
    calculateTotalCost,
    reset
  }
})
