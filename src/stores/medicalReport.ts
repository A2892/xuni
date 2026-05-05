import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMedicalReportStore = defineStore('medicalReport', () => {
  const reportDate = ref(new Date().toISOString().split('T')[0])
  
  // 患者信息 - 与 MedicalReportView 兼容
  const patient = ref({
    name: 'William Johnson',
    gender: 'male' as 'male' | 'female',
    age: 47,
    dateOfBirth: '1978-09-23',
    bloodType: 'A' as 'A' | 'B' | 'AB' | 'O',
    idNumber: '110101197809231234',
    phone: '+1 (555) 345-6789',
    address: '321 Health Avenue, Boston, MA 02101'
  })
  
  // 医疗机构信息 - 与 View 兼容
  const provider = ref({
    name: 'Boston Medical Center',
    logo: '',
    department: 'Internal Medicine',
    address: '725 Albany Street, Boston, MA 02118',
    phone: '+1 (617) 638-8000',
    doctorName: 'Dr. Elizabeth Chen'
  })
  
  // 生命体征 - 与 View 兼容
  const vitalSigns = ref({
    height: 175,
    weight: 72,
    bloodPressure: { systolic: 128, diastolic: 82 },
    heartRate: 72,
    temperature: 36.5,
    respiratoryRate: 16,
    oxygenSaturation: 98
  })
  
  // 检验结果 - 与 View 兼容
  const labResults = ref([
    { name: '血糖（空腹）', value: '5.6', unit: 'mmol/L', referenceRange: '3.9-6.1', status: 'normal' },
    { name: '总胆固醇', value: '5.0', unit: 'mmol/L', referenceRange: '<5.2', status: 'normal' },
    { name: '甘油三酯', value: '1.5', unit: 'mmol/L', referenceRange: '<1.7', status: 'normal' },
    { name: '血红蛋白', value: '145', unit: 'g/L', referenceRange: '130-175', status: 'normal' },
    { name: '白细胞', value: '6.5', unit: '×10^9/L', referenceRange: '4.0-10.0', status: 'normal' }
  ])
  
  // 诊断 - 与 View 兼容
  const diagnoses = ref([
    { code: 'Z00.00', name: '常规体检', severity: 'mild' }
  ])
  
  // 医师评估
  const assessment = ref('患者一般状况良好，各项指标正常，建议继续保持健康生活方式。')
  
  // 建议
  const recommendations = ref([
    '定期体检，每年一次',
    '保持均衡饮食',
    '适量运动，每周至少150分钟',
    '保证充足睡眠'
  ])
  
  const settings = ref({
    template: 'hospital' as 'hospital' | 'clinic' | 'lab',
    primaryColor: '#1e40af',
    showLogo: true,
    showVitals: true,
    showLabResults: true
  })

  // BMI 计算
  const bmi = computed(() => {
    const h = vitalSigns.value.height / 100
    return vitalSigns.value.weight / (h * h)
  })

  return {
    reportDate,
    patient,
    provider,
    vitalSigns,
    labResults,
    diagnoses,
    assessment,
    recommendations,
    settings,
    bmi
  }
})
