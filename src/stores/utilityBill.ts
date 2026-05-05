import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { sharedCurrencies } from '@/lib/currencies'

// 账单类型预设配置
export const billTypePresets = {
  electricity: {
    name: '电费账单',
    icon: '🔌',
    providerName: 'Pacific Gas & Electric',
    tagline: 'Delivering clean, safe, reliable energy',
    primaryColor: '#0066cc',
    accentColor: '#ffc107',
    unit: 'kWh',
    charges: [
      { description: 'Electric Generation', usage: 850, unit: 'kWh', rate: 0.12543 },
      { description: 'Electric Distribution', usage: 850, unit: 'kWh', rate: 0.08234 },
      { description: 'Public Purpose Programs', usage: 850, unit: 'kWh', rate: 0.01245 },
      { description: 'Nuclear Decommissioning', usage: 850, unit: 'kWh', rate: 0.00123 }
    ]
  },
  water: {
    name: '水费账单',
    icon: '�',
    providerName: 'City Water Department',
    tagline: 'Pure Water, Better Life',
    primaryColor: '#0891b2',
    accentColor: '#06b6d4',
    unit: 'gal',
    charges: [
      { description: 'Water Usage', usage: 3500, unit: 'gal', rate: 0.0065 },
      { description: 'Sewer Service', usage: 3500, unit: 'gal', rate: 0.0048 },
      { description: 'Water Infrastructure', usage: 1, unit: 'flat', rate: 8.50 }
    ]
  },
  gas: {
    name: '燃气账单',
    icon: '🔥',
    providerName: 'Natural Gas Company',
    tagline: 'Safe & Reliable Natural Gas',
    primaryColor: '#ea580c',
    accentColor: '#f97316',
    unit: 'therm',
    charges: [
      { description: 'Gas Commodity', usage: 45, unit: 'therm', rate: 0.95 },
      { description: 'Gas Transportation', usage: 45, unit: 'therm', rate: 0.35 },
      { description: 'Customer Charge', usage: 1, unit: 'flat', rate: 12.50 }
    ]
  },
  internet: {
    name: '网络账单',
    icon: '📶',
    providerName: 'FastNet Communications',
    tagline: 'High-Speed Internet Solutions',
    primaryColor: '#7c3aed',
    accentColor: '#8b5cf6',
    unit: 'GB',
    charges: [
      { description: 'Internet Service - Premium', usage: 1, unit: 'month', rate: 79.99 },
      { description: 'Equipment Rental', usage: 1, unit: 'month', rate: 10.00 },
      { description: 'WiFi Router Fee', usage: 1, unit: 'month', rate: 5.00 }
    ]
  },
  phone: {
    name: '电话账单',
    icon: '☎️',
    providerName: 'TeleCom Services',
    tagline: 'Stay Connected, Stay Close',
    primaryColor: '#059669',
    accentColor: '#10b981',
    unit: 'min',
    charges: [
      { description: 'Monthly Plan', usage: 1, unit: 'month', rate: 45.00 },
      { description: 'Long Distance Calls', usage: 120, unit: 'min', rate: 0.05 },
      { description: 'International Calls', usage: 30, unit: 'min', rate: 0.25 }
    ]
  },
  combined: {
    name: '综合账单',
    icon: '�',
    providerName: 'Utility Services Inc.',
    tagline: 'All Your Utilities, One Bill',
    primaryColor: '#4f46e5',
    accentColor: '#6366f1',
    unit: 'unit',
    charges: [
      { description: 'Electric Service', usage: 850, unit: 'kWh', rate: 0.15 },
      { description: 'Water Service', usage: 3500, unit: 'gal', rate: 0.006 },
      { description: 'Gas Service', usage: 45, unit: 'therm', rate: 1.20 }
    ]
  }
}

export type BillType = keyof typeof billTypePresets

export interface UtilityCharge {
  id: string
  description: string
  usage: number
  unit: string
  rate: number
  amount: number
}

export interface UtilityBillData {
  // Bill Info
  billNumber: string
  billDate: string
  dueDate: string
  billPeriod: {
    startDate: string
    endDate: string
  }
  billType: 'electricity' | 'gas' | 'water' | 'internet' | 'phone' | 'combined'
  status: 'unpaid' | 'paid' | 'overdue' | 'partial'
  
  // Provider Info
  provider: {
    name: string
    logo: string
    address: string
    phone: string
    email: string
    website: string
    accountNumber: string
    customerServiceNumber: string
  }
  
  // Customer Info
  customer: {
    name: string
    accountNumber: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    email: string
    meterNumber: string
  }
  
  // Charges
  charges: UtilityCharge[]
  
  // Previous Bill
  previousBalance: number
  payments: number
  adjustments: number
  
  // Taxes and Fees
  taxes: number
  serviceFees: number
  
  // Usage History (for chart) — month is 1-12
  usageHistory: Array<{
    month: number
    usage: number
  }>
  
  // Settings
  settings: {
    template: 'modern' | 'classic' | 'utility' | 'minimal'
    primaryColor: string
    showUsageChart: boolean
    showPaymentHistory: boolean
    currency: string
  }
}

export const useUtilityBillStore = defineStore('utilityBill', () => {
  const billNumber = ref('ELEC-2026-010001')
  const billDate = ref('2026-01-05')
  const dueDate = ref('2026-01-25')
  const billPeriod = ref({
    startDate: '2025-12-01',
    endDate: '2025-12-31'
  })
  const billType = ref<'electricity' | 'gas' | 'water' | 'internet' | 'phone' | 'combined'>('electricity')
  const status = ref<'unpaid' | 'paid' | 'overdue' | 'partial'>('unpaid')
  
  const provider = ref({
    name: 'Pacific Gas & Electric',
    logo: '',
    tagline: 'Delivering clean, safe, reliable energy',
    address: '77 Beale Street, San Francisco, CA 94105',
    phone: '1-800-743-5000',
    email: 'customer.service@pge.com',
    website: 'www.pge.com',
    accountNumber: 'PGE-8912345678',
    customerServiceNumber: '1-800-743-5000'
  })
  
  const customer = ref({
    name: 'Robert Anderson',
    accountNumber: '8912345678',
    address: '456 Oak Street, Apt 12B',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    phone: '+1 (415) 555-1234',
    email: 'robert.anderson@email.com',
    meterNumber: 'MTR-2024-89123'
  })
  
  const charges = ref<UtilityCharge[]>([
    { id: '1', description: 'Electric Generation', usage: 850, unit: 'kWh', rate: 0.12543, amount: 106.62 },
    { id: '2', description: 'Electric Distribution', usage: 850, unit: 'kWh', rate: 0.08234, amount: 69.99 },
    { id: '3', description: 'Public Purpose Programs', usage: 850, unit: 'kWh', rate: 0.01245, amount: 10.58 },
    { id: '4', description: 'Nuclear Decommissioning', usage: 850, unit: 'kWh', rate: 0.00123, amount: 1.05 },
    { id: '5', description: 'Competition Transition Charge', usage: 850, unit: 'kWh', rate: 0.00089, amount: 0.76 }
  ])
  
  const previousBalance = ref(0)
  const payments = ref(0)
  const adjustments = ref(0)
  
  const taxRate = ref(8.5) // 税率百分比
  const serviceFees = ref(12.50)
  
  // 税费自动计算
  const taxes = computed(() => {
    const subtotal = charges.value.reduce((sum, c) => sum + c.amount, 0)
    return Number((subtotal * taxRate.value / 100).toFixed(2))
  })
  
  const usageHistory = ref([
    { month: 7, usage: 720 },
    { month: 8, usage: 890 },
    { month: 9, usage: 780 },
    { month: 10, usage: 650 },
    { month: 11, usage: 720 },
    { month: 12, usage: 850 }
  ])
  
  // 支付完成信息
  const paymentCompleted = ref({
    isPaid: false,
    paidDate: '',
    paidAmount: 0,
    paymentMethod: 'credit_card' as 'credit_card' | 'bank_transfer' | 'online' | 'cash' | 'check',
    confirmationNumber: '',
    payerName: ''
  })
  
  const settings = ref({
    template: 'utility' as 'modern' | 'classic' | 'utility' | 'minimal',
    primaryColor: '#0066cc',
    accentColor: '#10b981',
    showUsageChart: true,
    showPaymentHistory: true,
    showPaymentOptions: true,
    showBarcode: true,
    showQRCode: true,
    showLateFee: true,
    currency: 'USD',
    language: 'en' as 'en' | 'zh'
  })
  
  const lateFee = ref(15)

  // 手动覆盖的总用量（null 表示未覆盖，使用自动计算值）
  const manualTotalUsage = ref<number | null>(null)

  // Computed
  const currentCharges = computed(() => {
    return charges.value.reduce((sum, c) => sum + c.amount, 0)
  })

  const totalTaxesAndFees = computed(() => {
    return taxes.value + serviceFees.value
  })
  
  // 监听 charges 变化，自动计算每项金额
  watch(charges, (newCharges) => {
    newCharges.forEach(charge => {
      // 强制把 usage 转为数字，避免字符串或空值导致计算问题
      charge.usage = Number(charge.usage) || 0
      if (charge.usage && charge.rate) {
        charge.amount = Number((charge.usage * charge.rate).toFixed(2))
      } else {
        charge.amount = Number(charge.amount) || 0
      }
    })
  }, { deep: true })

  const totalAmountDue = computed(() => {
    return previousBalance.value - payments.value + adjustments.value + currentCharges.value + totalTaxesAndFees.value
  })

  const totalUsage = computed(() => {
    const preset = billTypePresets[billType.value]
    if (!preset) return 0
    // 对电费做更宽松的匹配：包含 kWh（大小写不敏感）或中文'度'
    const unitKeywords = billType.value === 'electricity'
      ? ['kwh', '度', (preset.unit || '').toString().toLowerCase()]
      : [(preset.unit || '').toString().toLowerCase()]

    const total = charges.value.reduce((sum, c) => {
      const u = (c.unit || '').toString().toLowerCase()
      const matched = unitKeywords.some(k => k && u.includes(k))
      const usageNum = Number(c.usage)
      return matched && Number.isFinite(usageNum) ? sum + usageNum : sum
    }, 0)
    // 返回整数（对 kWh 来说通常是整数）
    return Math.round(total)
  })

  const averageUsage = computed(() => {
    if (usageHistory.value.length === 0) return 0
    return Math.round(usageHistory.value.reduce((sum, m) => sum + m.usage, 0) / usageHistory.value.length)
  })

  // Actions
  const addCharge = () => {
    charges.value.push({
      id: Date.now().toString(),
      description: '',
      usage: 0,
      unit: 'kWh',
      rate: 0,
      amount: 0
    })
  }
  
  // 用量历史管理
  const addUsageMonth = () => {
    const lastMonthNum = usageHistory.value[usageHistory.value.length - 1]?.month || 12
    const nextMonthNum = (Number(lastMonthNum) % 12) + 1
    usageHistory.value.push({ month: nextMonthNum, usage: 0 })
  }
  
  const removeUsageMonth = (index: number) => {
    usageHistory.value.splice(index, 1)
  }
  
  // 生成支付确认号
  const generateConfirmationNumber = () => {
    const prefix = 'PAY'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }
  
  // 完成支付
  const completePayment = (method: string = 'credit_card') => {
    paymentCompleted.value.isPaid = true
    paymentCompleted.value.paidDate = new Date().toISOString().split('T')[0]
    paymentCompleted.value.paidAmount = totalAmountDue.value
    paymentCompleted.value.paymentMethod = method as any
    paymentCompleted.value.confirmationNumber = generateConfirmationNumber()
    paymentCompleted.value.payerName = customer.value.name
    status.value = 'paid'
  }
  
  // 重置支付状态
  const resetPayment = () => {
    paymentCompleted.value.isPaid = false
    paymentCompleted.value.paidDate = ''
    paymentCompleted.value.paidAmount = 0
    paymentCompleted.value.confirmationNumber = ''
    paymentCompleted.value.payerName = ''
    status.value = 'unpaid'
  }

  const removeCharge = (id: string) => {
    charges.value = charges.value.filter(c => c.id !== id)
  }

  const updateChargeAmount = (id: string) => {
    const charge = charges.value.find(c => c.id === id)
    if (charge) {
      charge.amount = Number((charge.usage * charge.rate).toFixed(2))
    }
  }

  const generateBillNumber = () => {
    const prefix = billType.value.toUpperCase().substring(0, 4)
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
    billNumber.value = `${prefix}-${year}-${random}`
  }

  const formatCurrency = (amount: number) => {
    const code = settings.value.currency
    const found = sharedCurrencies.find(c => c.code === code)
    const symbol = found?.symbol || code || '$'
    return `${symbol}${amount.toFixed(2)}`
  }

  // 应用账单类型预设
  const applyBillTypePreset = (type: BillType) => {
    const preset = billTypePresets[type]
    if (!preset) return
    
    billType.value = type
    provider.value.name = preset.providerName
    provider.value.tagline = preset.tagline
    settings.value.primaryColor = preset.primaryColor
    settings.value.accentColor = preset.accentColor
    
    // 更新账单号前缀
    generateBillNumber()
    
    // 更新费用项目
    charges.value = preset.charges.map((c, i) => ({
      id: (i + 1).toString(),
      description: c.description,
      usage: c.usage,
      unit: c.unit,
      rate: c.rate,
      amount: Number((c.usage * c.rate).toFixed(2))
    }))
  }

  // 设计设置
  const designSettings = ref({
    watermarkEnabled: false,
    watermarkText: 'OFFICIAL',
    watermarkColor: '#cccccc',
    watermarkOpacity: 15,
    watermarkSize: 48,
    watermarkAngle: -30,
    watermarkFontFamily: 'Arial',
    fontFamily: 'Arial, sans-serif',
    textColor: '#1f2937',
    borderEnabled: false,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderStyle: 'solid'
  })

  // 条形码/二维码设置
  const barcodeSettings = ref({
    useCustomBarcode: false,
    customBarcodeImage: '',
    barcodeContent: '',
    useCustomQR: false,
    customQRImage: ''
  })

  return {
    billNumber,
    billDate,
    dueDate,
    billPeriod,
    billType,
    status,
    provider,
    customer,
    charges,
    previousBalance,
    payments,
    adjustments,
    taxRate,
    taxes,
    serviceFees,
    usageHistory,
    settings,
    lateFee,
    currentCharges,
    totalTaxesAndFees,
    totalAmountDue,
    totalUsage,
    averageUsage,
    manualTotalUsage,
    designSettings,
    barcodeSettings,
    paymentCompleted,
    addCharge,
    removeCharge,
    updateChargeAmount,
    generateBillNumber,
    formatCurrency,
    applyBillTypePreset,
    addUsageMonth,
    removeUsageMonth,
    completePayment,
    resetPayment,
    generateConfirmationNumber
  }
})
