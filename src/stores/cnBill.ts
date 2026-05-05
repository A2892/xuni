import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CNBillItem {
  id: string
  name: string
  period: string
  previousReading: number
  currentReading: number
  usage: number
  unit?: string // 单位，例如 kWh / 度 / 天 / 固定金额
  unitPrice: number
  amount: number
}

export interface CNBillData {
  // 账单类型
  billType: 'electricity' | 'water' | 'gas' | 'property' | 'phone' | 'internet'
  
  // 账单基本信息
  billNumber: string
  billMonth: string
  issueDate: string
  dueDate: string
  
  // 用户信息
  userName: string
  userNumber: string
  userAddress: string
  userPhone: string
  
  // 供应商信息
  providerName: string
  providerAddress: string
  providerPhone: string
  providerHotline: string
  
  // 账单明细
  items: CNBillItem[]
  
  // 金额信息
  subtotal: number
  previousBalance: number
  lateFee: number
  adjustment: number
  totalAmount: number
  
  // 缴费信息
  paymentStatus: 'unpaid' | 'paid' | 'overdue'
  paymentMethod: string
  paymentDeadline: string
  
  // 备注
  remarks: string
  
  // 设计选项
  template: 'standard' | 'modern' | 'minimal'
  showBarcode: boolean
  showQRCode: boolean
  showUsageChart: boolean
}

export const billTypes = {
  electricity: { name: '电费账单', icon: '⚡', unit: '度', color: '#ffa500' },
  water: { name: '水费账单', icon: 'ƒ', unit: '吨', color: '#00bcd4' },
  gas: { name: '燃气账单', icon: '♨', unit: '立方米', color: '#ff5722' },
  property: { name: '物业费账单', icon: '⌂', unit: '元/月', color: '#4caf50' },
  phone: { name: '话费账单', icon: '☎', unit: '分钟', color: '#2196f3' },
  internet: { name: '宽带账单', icon: '⊞', unit: 'GB', color: '#9c27b0' }
}

export const useCNBillStore = defineStore('cnBill', () => {
  const data = ref<CNBillData>({
    billType: 'electricity',
    billNumber: 'DL2024010001',
    billMonth: new Date().toISOString().slice(0, 7),
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    userName: '张三',
    userNumber: '100012345678',
    userAddress: '北京市海淀区中关村大街1号院2号楼3单元401室',
    userPhone: '138****1234',
    
    providerName: '国家电网有限公司北京供电公司',
    providerAddress: '北京市西城区前门西大街41号',
    providerPhone: '010-95598',
    providerHotline: '95598',
    
    items: [
      {
        id: '1',
        name: '峰时电量',
        period: '2024-01',
        previousReading: 1000,
        currentReading: 1200,
        usage: 200,
        unit: 'kWh',
        unitPrice: 0.5483,
        amount: 109.66
      },
      {
        id: '2',
        name: '谷时电量',
        period: '2024-01',
        previousReading: 500,
        currentReading: 600,
        usage: 100,
        unit: 'kWh',
        unitPrice: 0.3483,
        amount: 34.83
      }
    ],
    
    subtotal: 144.49,
    previousBalance: 0,
    lateFee: 0,
    adjustment: 0,
    totalAmount: 144.49,
    
    paymentStatus: 'unpaid',
    paymentMethod: '',
    paymentDeadline: '',
    
    remarks: '',
    
    template: 'standard',
    showBarcode: true,
    showQRCode: true,
    showUsageChart: true
  })

  // 计算小计
  const calculatedSubtotal = computed(() => {
    return data.value.items.reduce((sum, item) => sum + item.amount, 0)
  })

  // 计算总金额
  const calculatedTotal = computed(() => {
    return calculatedSubtotal.value + data.value.previousBalance + data.value.lateFee + data.value.adjustment
  })

  // 计算总用量（只累加与账单类型相关的用量单位，比如电费以 kWh/度 为单位）
  const totalUsage = computed(() => {
    const billUnit = billTypes[data.value.billType]?.unit || ''
    // 对于电费模板，兼容 kWh（英文）和度（中文）两种表示
    const expectedUnits = data.value.billType === 'electricity' ? ['kWh', '度', billUnit] : [billUnit]
    return data.value.items.reduce((sum, item) => {
      const u = (item.unit || '').toString()
      if (expectedUnits.includes(u)) return sum + (item.usage || 0)
      return sum
    }, 0)
  })

  // 更新金额
  const updateTotals = () => {
    data.value.subtotal = calculatedSubtotal.value
    data.value.totalAmount = calculatedTotal.value
  }

  // 添加项目
  const addItem = () => {
    data.value.items.push({
      id: Date.now().toString(),
      name: '',
      period: data.value.billMonth,
      previousReading: 0,
      currentReading: 0,
      usage: 0,
      unit: data.value.billType === 'electricity' ? 'kWh' : billTypes[data.value.billType]?.unit || '',
      unitPrice: 0,
      amount: 0
    })
  }

  // 删除项目
  const removeItem = (id: string) => {
    const index = data.value.items.findIndex(item => item.id === id)
    if (index > -1) {
      data.value.items.splice(index, 1)
      updateTotals()
    }
  }

  // 计算单项金额
  const calculateItemAmount = (item: CNBillItem) => {
    // 如果提供了读数则计算用量，否则保留手工输入的用量（用于天数/固定费用等）
    if ((item.currentReading || 0) !== 0 || (item.previousReading || 0) !== 0) {
      item.usage = item.currentReading - item.previousReading
    }
    item.amount = (item.usage || 0) * (item.unitPrice || 0)
    updateTotals()
  }

  // 格式化日期
  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
  }

  // 格式化月份
  const formatMonth = (month: string) => {
    if (!month) return ''
    const [year, m] = month.split('-')
    return `${year}年${m}月`
  }

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return '¥' + amount.toFixed(2)
  }

  // 生成账单号码
  const generateBillNumber = () => {
    const prefix = {
      electricity: 'DL',
      water: 'SW',
      gas: 'RQ',
      property: 'WY',
      phone: 'HF',
      internet: 'KD'
    }
    data.value.billNumber = prefix[data.value.billType] + 
      new Date().getFullYear() + 
      String(new Date().getMonth() + 1).padStart(2, '0') + 
      String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  }

  // 根据账单类型设置供应商信息
  const setProviderByType = () => {
    const providers: Record<string, any> = {
      electricity: {
        providerName: '国家电网有限公司',
        providerAddress: '北京市西城区前门西大街41号',
        providerPhone: '010-95598',
        providerHotline: '95598'
      },
      water: {
        providerName: '北京市自来水集团',
        providerAddress: '北京市东城区东直门内大街56号',
        providerPhone: '010-96116',
        providerHotline: '96116'
      },
      gas: {
        providerName: '北京市燃气集团',
        providerAddress: '北京市西城区西直门南大街68号',
        providerPhone: '010-96777',
        providerHotline: '96777'
      },
      property: {
        providerName: '万科物业服务有限公司',
        providerAddress: '深圳市福田区梅林路63号',
        providerPhone: '400-888-0000',
        providerHotline: '400-888-0000'
      },
      phone: {
        providerName: '中国移动通信集团',
        providerAddress: '北京市西城区金融大街29号',
        providerPhone: '10086',
        providerHotline: '10086'
      },
      internet: {
        providerName: '中国电信股份有限公司',
        providerAddress: '北京市西城区金融大街31号',
        providerPhone: '10000',
        providerHotline: '10000'
      }
    }
    Object.assign(data.value, providers[data.value.billType])
    generateBillNumber()
  }

  // 重置
  const reset = () => {
    data.value = {
      billType: 'electricity',
      billNumber: 'DL' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + '0001',
      billMonth: new Date().toISOString().slice(0, 7),
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      
      userName: '',
      userNumber: '',
      userAddress: '',
      userPhone: '',
      
      providerName: '国家电网有限公司',
      providerAddress: '',
      providerPhone: '',
      providerHotline: '95598',
      
      items: [],
      
      subtotal: 0,
      previousBalance: 0,
      lateFee: 0,
      adjustment: 0,
      totalAmount: 0,
      
      paymentStatus: 'unpaid',
      paymentMethod: '',
      paymentDeadline: '',
      
      remarks: '',
      
      template: 'standard',
      showBarcode: true,
      showUsageChart: true
    }
  }

  // 设计设置
  const designSettings = ref({
    watermarkEnabled: false,
    watermarkText: 'PAID',
    watermarkOpacity: 10,
    watermarkType: 'center' as 'center' | 'fullscreen',
    borderEnabled: true,
    borderColor: '#e5e5e5',
    borderWidth: 1,
    qrCodeSource: 'generate' as 'generate' | 'upload',
    qrCodeContent: '',
    qrCodeImage: '',
    barcodeSource: 'generate' as 'generate' | 'upload',
    barcodeContent: '',
    barcodeImage: '',
    stampEnabled: false,
    stampSource: 'generate' as 'generate' | 'upload',
    stampText: '已缴费',
    stampColor: '#22c55e',
    stampImage: ''
  })

  return {
    data,
    designSettings,
    calculatedSubtotal,
    calculatedTotal,
    totalUsage,
    updateTotals,
    addItem,
    removeItem,
    calculateItemAmount,
    formatDate,
    formatMonth,
    formatCurrency,
    generateBillNumber,
    setProviderByType,
    reset
  }
})
