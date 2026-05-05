import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CNInvoiceItem {
  id: string
  name: string
  spec: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
  taxRate: number
  taxAmount: number
}

export interface CNInvoiceData {
  // 发票类型
  invoiceType: 'normal' | 'special' | 'electronic' | 'roll'
  
  // 发票基本信息
  invoiceCode: string
  invoiceNumber: string
  invoiceDate: string
  checkCode: string
  machineCode: string
  
  // 购买方信息
  buyerName: string
  buyerTaxNumber: string
  buyerAddress: string
  buyerPhone: string
  buyerBank: string
  buyerAccount: string
  
  // 销售方信息
  sellerName: string
  sellerTaxNumber: string
  sellerAddress: string
  sellerPhone: string
  sellerBank: string
  sellerAccount: string
  
  // 商品明细
  items: CNInvoiceItem[]
  
  // 金额信息
  totalAmount: number
  totalTax: number
  totalAmountInWords: string
  
  // 备注
  remarks: string
  
  // 开票人信息
  drawer: string
  reviewer: string
  payee: string
  
  // 设计选项
  template: 'standard' | 'electronic' | 'simplified'
  showQRCode: boolean
  showTaxDetails: boolean
}

export const invoiceTypes = {
  normal: { name: '增值税普通发票', color: '#0066cc' },
  special: { name: '增值税专用发票', color: '#cc0000' },
  electronic: { name: '电子发票', color: '#009900' },
  roll: { name: '卷式发票', color: '#666666' }
}

export const useCNInvoiceStore = defineStore('cnInvoice', () => {
  const data = ref<CNInvoiceData>({
    invoiceType: 'normal',
    invoiceCode: '011001900111',
    invoiceNumber: '00000001',
    invoiceDate: new Date().toISOString().split('T')[0],
    checkCode: '12345678901234567890',
    machineCode: '499000000001',
    
    buyerName: '北京科技有限公司',
    buyerTaxNumber: '91110108MA01XXXXX',
    buyerAddress: '北京市海淀区中关村大街1号',
    buyerPhone: '010-12345678',
    buyerBank: '中国工商银行北京分行',
    buyerAccount: '0200001234567890123',
    
    sellerName: '上海商贸有限公司',
    sellerTaxNumber: '91310115MA01XXXXX',
    sellerAddress: '上海市浦东新区陆家嘴金融中心',
    sellerPhone: '021-87654321',
    sellerBank: '中国建设银行上海分行',
    sellerAccount: '31001234567890123456',
    
    items: [
      {
        id: '1',
        name: '办公用品',
        spec: 'A4打印纸',
        unit: '箱',
        quantity: 10,
        unitPrice: 100,
        amount: 1000,
        taxRate: 13,
        taxAmount: 130
      }
    ],
    
    totalAmount: 1000,
    totalTax: 130,
    totalAmountInWords: '壹仟壹佰叁拾元整',
    
    remarks: '',
    
    drawer: '张三',
    reviewer: '李四',
    payee: '王五',
    
    template: 'standard',
    showQRCode: true,
    showTaxDetails: true
  })

  // 计算总金额
  const calculatedTotal = computed(() => {
    return data.value.items.reduce((sum, item) => sum + item.amount, 0)
  })

  // 计算总税额
  const calculatedTax = computed(() => {
    return data.value.items.reduce((sum, item) => sum + item.taxAmount, 0)
  })

  // 价税合计
  const totalWithTax = computed(() => {
    return calculatedTotal.value + calculatedTax.value
  })

  // 数字转中文大写
  const numberToChinese = (num: number): string => {
    const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    const units = ['', '拾', '佰', '仟']
    const bigUnits = ['', '万', '亿', '兆']
    
    if (num === 0) return '零元整'
    
    const intPart = Math.floor(num)
    const decPart = Math.round((num - intPart) * 100)
    
    let result = ''
    let unitIndex = 0
    let temp = intPart
    
    while (temp > 0) {
      const section = temp % 10000
      if (section > 0) {
        let sectionStr = ''
        let sectionTemp = section
        for (let i = 0; i < 4 && sectionTemp > 0; i++) {
          const digit = sectionTemp % 10
          if (digit > 0) {
            sectionStr = digits[digit] + units[i] + sectionStr
          } else if (sectionStr && !sectionStr.startsWith('零')) {
            sectionStr = '零' + sectionStr
          }
          sectionTemp = Math.floor(sectionTemp / 10)
        }
        result = sectionStr + bigUnits[unitIndex] + result
      }
      temp = Math.floor(temp / 10000)
      unitIndex++
    }
    
    result += '元'
    
    if (decPart > 0) {
      const jiao = Math.floor(decPart / 10)
      const fen = decPart % 10
      if (jiao > 0) result += digits[jiao] + '角'
      if (fen > 0) result += digits[fen] + '分'
    } else {
      result += '整'
    }
    
    return result
  }

  // 更新金额
  const updateTotals = () => {
    data.value.totalAmount = calculatedTotal.value
    data.value.totalTax = calculatedTax.value
    data.value.totalAmountInWords = numberToChinese(totalWithTax.value)
  }

  // 添加商品项
  const addItem = () => {
    data.value.items.push({
      id: Date.now().toString(),
      name: '',
      spec: '',
      unit: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      taxRate: 13,
      taxAmount: 0
    })
  }

  // 删除商品项
  const removeItem = (id: string) => {
    const index = data.value.items.findIndex(item => item.id === id)
    if (index > -1) {
      data.value.items.splice(index, 1)
      updateTotals()
    }
  }

  // 计算单项金额
  const calculateItemAmount = (item: CNInvoiceItem) => {
    item.amount = item.quantity * item.unitPrice
    item.taxAmount = item.amount * item.taxRate / 100
    updateTotals()
  }

  // 格式化日期
  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
  }

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return '¥' + amount.toFixed(2)
  }

  // 生成发票号码
  const generateInvoiceNumber = () => {
    data.value.invoiceNumber = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
  }

  // 生成校验码
  const generateCheckCode = () => {
    data.value.checkCode = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join('')
  }

  // 重置
  const reset = () => {
    data.value = {
      invoiceType: 'normal',
      invoiceCode: '011001900111',
      invoiceNumber: String(Math.floor(Math.random() * 100000000)).padStart(8, '0'),
      invoiceDate: new Date().toISOString().split('T')[0],
      checkCode: Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join(''),
      machineCode: '499000000001',
      
      buyerName: '',
      buyerTaxNumber: '',
      buyerAddress: '',
      buyerPhone: '',
      buyerBank: '',
      buyerAccount: '',
      
      sellerName: '',
      sellerTaxNumber: '',
      sellerAddress: '',
      sellerPhone: '',
      sellerBank: '',
      sellerAccount: '',
      
      items: [],
      
      totalAmount: 0,
      totalTax: 0,
      totalAmountInWords: '零元整',
      
      remarks: '',
      
      drawer: '',
      reviewer: '',
      payee: '',
      
      template: 'standard',
      showQRCode: true,
      showTaxDetails: true
    }
  }

  return {
    data,
    calculatedTotal,
    calculatedTax,
    totalWithTax,
    numberToChinese,
    updateTotals,
    addItem,
    removeItem,
    calculateItemAmount,
    formatDate,
    formatCurrency,
    generateInvoiceNumber,
    generateCheckCode,
    reset
  }
})
