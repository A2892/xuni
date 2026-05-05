import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaxFormStore = defineStore('taxForm', () => {
  const taxYear = ref('2025')
  
  // 纳税人信息 - 与 TaxFormView 兼容
  const taxpayer = ref({
    name: 'David Thompson',
    idNumber: '110101199005152345',
    taxId: 'TAX2025001234',
    address: '123 Main Street, Apt 4B, Austin, TX 78701',
    phone: '+1 (555) 234-5678',
    email: 'david.thompson@email.com',
    filingStatus: 'single' as 'single' | 'married' | 'head'
  })
  
  // 收入 - 与 View 兼容
  const incomes = ref([
    { type: 'salary', source: 'TechCorp Inc.', amount: 145000, taxWithheld: 29000 },
    { type: 'bonus', source: '年终奖', amount: 25000, taxWithheld: 5000 },
    { type: 'investment', source: '股票分红', amount: 3500, taxWithheld: 350 }
  ])
  
  // 扣除项目 - 与 View 兼容
  const deductions = ref([
    { type: 'social', description: '社会保险', amount: 12000 },
    { type: 'housing', description: '住房公积金', amount: 24000 },
    { type: 'education', description: '子女教育', amount: 12000 },
    { type: 'mortgage', description: '房贷利息', amount: 12000 }
  ])
  
  // 预缴税款
  const payments = ref({
    withheld: 34350
  })
  
  const settings = ref({
    template: 'official' as 'official' | 'modern' | 'simple',
    primaryColor: '#1a365d',
    showDetailedCalc: true
  })

  // Computed
  const totalIncome = computed(() => {
    return incomes.value.reduce((sum, inc) => sum + inc.amount, 0)
  })

  const totalDeductions = computed(() => {
    return deductions.value.reduce((sum, ded) => sum + ded.amount, 0)
  })

  // 应纳税所得额 = 总收入 - 60000基本扣除 - 专项扣除
  const taxableIncome = computed(() => {
    return Math.max(0, totalIncome.value - 60000 - totalDeductions.value)
  })

  // 计算税额（累进税率）
  const calculateTax = computed(() => {
    const income = taxableIncome.value
    let tax = 0
    
    // 中国个人所得税累进税率
    if (income <= 36000) {
      tax = income * 0.03
    } else if (income <= 144000) {
      tax = income * 0.1 - 2520
    } else if (income <= 300000) {
      tax = income * 0.2 - 16920
    } else if (income <= 420000) {
      tax = income * 0.25 - 31920
    } else if (income <= 660000) {
      tax = income * 0.3 - 52920
    } else if (income <= 960000) {
      tax = income * 0.35 - 85920
    } else {
      tax = income * 0.45 - 181920
    }
    
    return Math.max(0, Math.round(tax * 100) / 100)
  })

  // 应退/应补税额
  const refundOrOwed = computed(() => {
    return calculateTax.value - payments.value.withheld
  })

  return {
    taxYear,
    taxpayer,
    incomes,
    deductions,
    payments,
    settings,
    totalIncome,
    totalDeductions,
    taxableIncome,
    calculateTax,
    refundOrOwed
  }
})
