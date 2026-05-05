import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sharedCurrencies } from '@/lib/currencies'

export type ReceiptType = 'luxury-mall' | 'luxury-restaurant' | 'general' | 'supermarket' | 'casual-restaurant' | 'cafe' | 'hotel' | 'cinema' | 'gas-station' | 'pharmacy' | 'beauty-salon' | 'gym' | 'parking' | 'bookstore' | 'electronics' | 'laundry'

// 货币配置
export interface CurrencyOption {
  code: string
  symbol: string
  name: string
  nameCn: string
}

export const currencyOptions: CurrencyOption[] = sharedCurrencies.map(c => ({ code: c.code, symbol: c.symbol, name: c.name, nameCn: c.nameCn }))

// 支付方式配置
export interface PaymentMethodOption {
  value: string
  label: string
  icon: string
  showCardInput?: boolean
  cardTypes?: string[]
}

export const paymentMethodOptions: PaymentMethodOption[] = [
  { value: '现金', label: '现金', icon: '💵' },
  { value: '支付宝', label: '支付宝', icon: '📱' },
  { value: '微信支付', label: '微信支付', icon: '💬' },
  { value: 'Apple Pay', label: 'Apple Pay', icon: '🍎' },
  { value: 'Google Pay', label: 'Google Pay', icon: '🔵' },
  { value: 'Samsung Pay', label: 'Samsung Pay', icon: '📲' },
  { value: '银联卡', label: '银联卡', icon: '💳', showCardInput: true, cardTypes: ['UnionPay'] },
  { value: 'Visa', label: 'Visa', icon: '💳', showCardInput: true, cardTypes: ['Visa'] },
  { value: 'MasterCard', label: 'MasterCard', icon: '💳', showCardInput: true, cardTypes: ['MasterCard'] },
  { value: 'American Express', label: 'American Express', icon: '💳', showCardInput: true, cardTypes: ['Amex'] },
  { value: 'JCB', label: 'JCB', icon: '💳', showCardInput: true, cardTypes: ['JCB'] },
  { value: 'Diners Club', label: 'Diners Club', icon: '💳', showCardInput: true, cardTypes: ['Diners'] },
  { value: 'Discover', label: 'Discover', icon: '💳', showCardInput: true, cardTypes: ['Discover'] },
  { value: '会员储值', label: '会员储值', icon: '🎫' },
  { value: 'PayPal', label: 'PayPal', icon: '🅿️' },
  { value: '银行转账', label: '银行转账', icon: '🏦' },
  { value: '其他', label: '其他', icon: '💰' }
]

// 设计设置
export interface ReceiptDesignSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
  headerStyle: 'simple' | 'elegant' | 'modern' | 'classic'
  fontFamily: string
  fontSize: number
  showLogo: boolean
  showBorder: boolean
  borderWidth: number
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double'
  showShadow: boolean
  roundedCorners: number
  paperStyle: 'white' | 'cream' | 'thermal' | 'premium'
}

export interface ReceiptItem {
  id: string
  name: string
  nameEn?: string
  sku?: string
  quantity: number
  unit: string
  unitPrice: number
  originalPrice?: number
  discount?: number
  category?: string
  notes?: string
  date?: string
}

export interface ReceiptData {
  // 收据类型
  receiptType: ReceiptType
  
  // 商户信息
  merchantName: string
  merchantNameEn?: string
  merchantAddress: string
  merchantPhone: string
  merchantEmail?: string
  merchantWebsite?: string
  merchantTaxId?: string
  merchantLogo?: string
  branchName?: string
  
  // 交易信息
  receiptNumber: string
  orderNumber?: string
  tableNumber?: string
  transactionId?: string
  date: string
  time: string
  cashier: string
  cashierId?: string
  terminal?: string
  
  // 客户信息
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  membershipId?: string
  membershipLevel?: string
  memberPoints?: number
  pointsEarned?: number
  
  // 商品明细
  items: ReceiptItem[]
  
  // 金额信息
  subtotal: number
  discount: number
  discountType?: string
  discountCode?: string
  taxRate: number
  taxAmount: number
  serviceFee?: number
  serviceChargeRate?: number
  deliveryFee?: number
  packagingFee?: number
  tip?: number
  grandTotal: number
  
  // 支付信息
  paymentMethod: string
  cardType?: string
  cardLast4?: string
  approvalCode?: string
  cashReceived?: number
  change?: number
  
  // 其他
  currency: string
  currencySymbol: string
  language: string
  notes?: string
  footerMessage?: string
  returnPolicy?: string
  warrantyInfo?: string
  
  // 餐厅特有
  guestCount?: number
  cuisineType?: string
  rating?: number
  specialRequests?: string
  
  // 酒店特有
  roomNumber?: string
  roomType?: string
  checkInDate?: string
  checkOutDate?: string
  nights?: number
  
  // 咖啡厅特有
  orderType?: string
  pickupNumber?: string
  wifiName?: string
  wifiPassword?: string
  
  // 超市特有
  terminalId?: string
  slogan?: string
  
  // 营业信息
  businessHours?: string

  // 签名信息
  signatureType: 'text' | 'image'
  signatureText: string
  signatureFont: string
  signatureImage: string
}

// 收据类型配置
export const receiptTypeConfigs: Record<ReceiptType, {
  name: string
  icon: string
  description: string
  defaultFooter: string
  features: string[]
}> = {
  'luxury-mall': {
    name: '高端商场',
    icon: '🏬',
    description: '奢侈品专柜、高端百货',
    defaultFooter: '感谢您选择我们的品牌。本店提供7天无理由退换货服务（特殊商品除外）。如需售后服务，请携带此收据至顾客服务中心。',
    features: ['双语显示', '品牌Logo', 'VIP积分', '退换货政策', '授权码']
  },
  'luxury-restaurant': {
    name: '高端餐厅',
    icon: '🍽️',
    description: '米其林餐厅、高档西餐',
    defaultFooter: '感谢您的光临，期待再次为您服务。如您对用餐体验有任何建议，请扫描下方二维码告诉我们。',
    features: ['服务费', '餐位号', '服务员', '双语菜名', '小费选项']
  },
  'general': {
    name: '通用收据',
    icon: '📄',
    description: '标准商业收据',
    defaultFooter: '感谢您的惠顾！保留此收据作为购买凭证。',
    features: ['基本信息', '商品明细', '支付详情']
  },
  'supermarket': {
    name: '超市',
    icon: '🛒',
    description: '连锁超市、便利店',
    defaultFooter: '感谢光临！会员积分已入账。退换货请于7日内凭此小票办理。服务热线：400-xxx-xxxx',
    features: ['条形码', '会员积分', '促销标识', '收银台号']
  },
  'casual-restaurant': {
    name: '普通餐厅',
    icon: '🍜',
    description: '快餐、中式餐厅、小吃店',
    defaultFooter: '谢谢惠顾，欢迎再次光临！',
    features: ['桌号', '取餐号', '堂食/外带']
  },
  'cafe': {
    name: '咖啡厅',
    icon: '☕',
    description: '咖啡店、奶茶店、甜品店',
    defaultFooter: 'Thank you for visiting! See you next time! 欢迎再次光临！',
    features: ['取杯号', '定制选项', '会员优惠', '双语']
  },
  'hotel': {
    name: '酒店账单',
    icon: '🏨',
    description: '酒店、民宿结账单',
    defaultFooter: '感谢您的入住，期待再次为您服务。如有任何问题，请联系前台。',
    features: ['房间号', '入住日期', '明细分类', '签名栏']
  },
  'cinema': {
    name: '电影院',
    icon: '🎬',
    description: '电影票、爆米花饮料',
    defaultFooter: '感谢观影，祝您观影愉快！请保留此票根。',
    features: ['影片名称', '座位号', '场次时间', '票价']
  },
  'gas-station': {
    name: '加油站',
    icon: '⛽',
    description: '加油小票、洗车服务',
    defaultFooter: '一路平安！本站提供24小时服务。',
    features: ['油品类型', '加油升数', '单价', '车牌号']
  },
  'pharmacy': {
    name: '药店',
    icon: '💊',
    description: '药店、医疗用品',
    defaultFooter: '请按说明书服用药品。如有不适请及时就医。',
    features: ['药品名称', '规格', '用法用量', '医保标识']
  },
  'beauty-salon': {
    name: '美容美发',
    icon: '💇',
    description: '美容院、美发店、SPA',
    defaultFooter: '感谢您的光临，期待再次为您服务！',
    features: ['服务项目', '技师', '会员卡', '下次预约']
  },
  'gym': {
    name: '健身房',
    icon: '🏋️',
    description: '健身中心、运动馆',
    defaultFooter: '坚持锻炼，保持健康！期待您的下次到来。',
    features: ['会员信息', '课程名称', '教练', '有效期']
  },
  'parking': {
    name: '停车场',
    icon: '🅿️',
    description: '停车缴费单',
    defaultFooter: '感谢使用，驾驶安全！',
    features: ['车牌号', '入场时间', '出场时间', '停车时长']
  },
  'bookstore': {
    name: '书店',
    icon: '📚',
    description: '书店、文具店',
    defaultFooter: '阅读点亮生活，感谢您的购买！',
    features: ['书名', 'ISBN', '会员折扣', '积分']
  },
  'electronics': {
    name: '数码电器',
    icon: '📱',
    description: '数码产品、家电商城',
    defaultFooter: '感谢购买！请保留此收据作为保修凭证。保修期内如有问题，请携带此票据联系客服。',
    features: ['产品序列号', '保修期', '售后电话', '延保服务']
  },
  'laundry': {
    name: '洗衣店',
    icon: '🧺',
    description: '干洗店、洗衣房',
    defaultFooter: '请凭此单取衣，过期未取将收取保管费。',
    features: ['取衣单号', '预计取衣时间', '衣物数量', '特殊要求']
  }
}

export const useReceiptStore = defineStore('receipt', () => {
  const data = ref<ReceiptData>({
    receiptType: 'general',
    merchantName: '示例商店',
    merchantNameEn: 'Sample Store',
    merchantAddress: '北京市朝阳区xxx街道xxx号',
    merchantPhone: '010-12345678',
    receiptNumber: generateReceiptNumber(),
    date: new Date().toISOString().split('T')[0] as string,
    time: new Date().toTimeString().slice(0, 5),
    cashier: '001',
    items: [],
    subtotal: 0,
    discount: 0,
    taxRate: 0,
    taxAmount: 0,
    serviceFee: 0,
    grandTotal: 0,
    paymentMethod: '微信支付',
    currency: 'CNY',
    currencySymbol: '¥',
    language: 'zh',
    signatureType: 'text',
    signatureText: '',
    signatureFont: 'Dancing Script',
    signatureImage: ''
  })

  // 设计设置
  const designSettings = ref<ReceiptDesignSettings>({
    primaryColor: '#2c3e50',
    secondaryColor: '#34495e',
    accentColor: '#3498db',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderColor: '#e0e0e0',
    headerStyle: 'simple',
    fontFamily: 'system-ui',
    fontSize: 13,
    showLogo: true,
    showBorder: false,
    borderWidth: 1,
    borderStyle: 'solid',
    showShadow: true,
    roundedCorners: 8,
    paperStyle: 'white'
  })

  // 条形码设置
  const barcodeSettings = ref({
    showBarcode: false,
    useCustomBarcode: false,
    customBarcodeImage: '',
    barcodeContent: ''
  })

  // 设置货币
  function setCurrency(code: string) {
    const found = sharedCurrencies.find(c => c.code === code)
    if (found) {
      data.value.currency = found.code
      data.value.currencySymbol = found.symbol
    } else {
      data.value.currency = code
      data.value.currencySymbol = code
    }
  }

  // 1. 小计
  const calculatedSubtotal = computed(() => {
    const items = data.value.items || []
    if (items.length === 0) return 0
    const total = items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0
      const price = Number(item.unitPrice) || 0
      return sum + (qty * price)
    }, 0)
    return Math.round(total * 100) / 100
  })

  // 2. 税费 (基于折后)
  const calculatedTaxAmount = computed(() => {
    const sub = calculatedSubtotal.value
    if (sub === 0) return 0
    const rate = Number(data.value.taxRate) || 0
    if (rate <= 0) return 0
    const discount = Number(data.value.discount) || 0
    const tax = Math.max(0, sub - discount) * rate / 100
    return Math.round(tax * 100) / 100
  })

  // 3. 服务费 (基于折前)
  const calculatedServiceFee = computed(() => {
    const sub = calculatedSubtotal.value
    if (sub === 0) return 0
    const rate = Number(data.value.serviceChargeRate) || 0
    if (rate > 0) {
      const fee = sub * rate / 100
      return Math.round(fee * 100) / 100
    }
    return Math.round((Number(data.value.serviceFee) || 0) * 100) / 100
  })

  // 4. 最终合计 (唯一真相来源)
  const calculatedGrandTotal = computed(() => {
    // 1. 基础小计 (分) - 必须基于 items
    const items = data.value.items || []
    let subCents = 0
    items.forEach(item => {
      subCents += Math.round((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * 100)
    })
    
    // 2. 优惠 (分)
    const discCents = Math.round((Number(data.value.discount) || 0) * 100)
    
    // 3. 服务费 (分)
    const srvRate = Number(data.value.serviceChargeRate) || 0
    let srvCents = 0
    if (srvRate > 0) {
      // 有百分比费率时，基于小计计算
      srvCents = Math.round(subCents * srvRate / 100)
    } else {
      // 否则使用固定金额
      srvCents = Math.round((Number(data.value.serviceFee) || 0) * 100)
    }
    
    // 4. 税费 (分)
    const taxRate = Number(data.value.taxRate) || 0
    let taxCents = 0
    if (taxRate > 0) {
      taxCents = Math.round((subCents - discCents) * taxRate / 100)
    }
    
    // 5. 附加费 (分)
    const delCents = Math.round((Number(data.value.deliveryFee) || 0) * 100)
    const packCents = Math.round((Number(data.value.packagingFee) || 0) * 100)
    const tipCents = Math.round((Number(data.value.tip) || 0) * 100)
    
    // 最终合计
    const totalCents = subCents - discCents + srvCents + taxCents + delCents + packCents + tipCents
    
    // 极其重要的调试输出
    if (totalCents !== 0) {
      console.log(`[TOTAL_DEBUG] Sub:${subCents} Disc:${discCents} Srv:${srvCents} Tax:${taxCents} Extra:${delCents+packCents+tipCents} => ${totalCents}`)
    }
    
    return Math.max(0, totalCents / 100)
  })

  // 方法
  function generateReceiptNumber() {
    const prefix = 'RC'
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}${timestamp}${random}`
  }

  function addItem(item?: Partial<ReceiptItem>) {
    const newItem: ReceiptItem = {
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      name: item?.name || '',
      quantity: Number(item?.quantity) || 1,
      unit: item?.unit || '件',
      unitPrice: Number(item?.unitPrice) || 0,
      ...item
    }
    // 强制替换数组引用，确保触发深度监听
    data.value.items = [...data.value.items, newItem]
  }

  function removeItem(id: string) {
    data.value.items = data.value.items.filter(item => item.id !== id)
  }

  function updateItem(id: string, updates: Partial<ReceiptItem>) {
    data.value.items = data.value.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
  }

  function updateTotals() {
    // 强制触发一次 grandTotal 的重新计算 (虽然它是 computed 的)
  }

  function setType(type: ReceiptType) {
    // 1. 先重置基础类型
    data.value.receiptType = type
    const config = receiptTypeConfigs[type]
    data.value.footerMessage = config.defaultFooter
    
    // 2. 彻底替换 items 引用，杀掉任何隐藏数据
    data.value.items = []
    
    // 3. 重置所有金额字段
    data.value.subtotal = 0
    data.value.discount = 0
    data.value.taxRate = 0
    data.value.taxAmount = 0
    data.value.serviceFee = 0
    data.value.deliveryFee = 0
    data.value.packagingFee = 0
    data.value.tip = 0
    data.value.grandTotal = 0
    data.value.serviceChargeRate = undefined

    // 4. 应用模板默认设置
    switch (type) {
      case 'luxury-mall':
        data.value.language = 'dual'
        break
      case 'luxury-restaurant':
        data.value.serviceChargeRate = 10
        break
      case 'supermarket':
        data.value.taxRate = 0
        break
      case 'cafe':
        data.value.language = 'dual'
        break
    }
  }

  function formatCurrency(amount: number): string {
    const code = data.value.currency
    const found = sharedCurrencies.find(c => c.code === code)
    const symbol = found?.symbol || data.value.currencySymbol || code || '$'
    return `${symbol}${amount.toFixed(2)}`
  }

  function resetReceipt() {
    data.value = {
      receiptType: 'general',
      merchantName: '示例商店',
      merchantNameEn: 'Sample Store',
      merchantAddress: '北京市朝阳区xxx街道xxx号',
      merchantPhone: '010-12345678',
      receiptNumber: generateReceiptNumber(),
      date: new Date().toISOString().split('T')[0] as string,
      time: new Date().toTimeString().slice(0, 5),
      cashier: '001',
      items: [],
      subtotal: 0,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      serviceFee: 0,
      deliveryFee: 0,
      packagingFee: 0,
      tip: 0,
      grandTotal: 0,
      paymentMethod: '微信支付',
      currency: 'CNY',
      currencySymbol: '¥',
      language: 'zh',
      signatureType: 'text',
      signatureText: '',
      signatureFont: 'Dancing Script',
      signatureImage: ''
    }
  }

  return {
    data,
    designSettings,
    barcodeSettings,
    calculatedSubtotal,
    calculatedTaxAmount,
    calculatedServiceFee,
    calculatedGrandTotal,
    setCurrency,
    addItem,
    removeItem,
    updateItem,
    updateTotals,
    setType,
    formatCurrency,
    resetReceipt
  }
})
