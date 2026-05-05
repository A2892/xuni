import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'

export type PaymentPlatform = 'wechat' | 'alipay' | 'apple-pay' | 'visa' | 'mastercard' | 'unionpay' | 'paypal'
export type PaymentStatus = 'success' | 'pending' | 'failed'
export type PaymentType = 'transfer' | 'payment' | 'refund' | 'redpacket'

export interface PaymentData {
  // 支付平台
  platform: PaymentPlatform
  
  // 支付信息
  amount: number
  currency: string
  paymentType: PaymentType
  status: PaymentStatus
  
  // 收款方信息
  receiverName: string
  receiverAccount: string
  receiverAvatar: string
  receiverBank: string
  
  // 付款方信息
  senderName: string
  senderAccount: string
  senderAvatar: string
  senderBank: string
  
  // 交易信息
  transactionId: string
  orderNumber: string
  remarks: string
  paymentTime: string
  
  // 微信/支付宝特有
  redpacketMessage: string
  serviceFee: number
  
  // 银行卡特有
  cardNumber: string
  cardType: string
  authCode: string
  merchantName: string
  merchantId: string
  terminalId: string
  
  // 显示设置
  showTransactionId: boolean
  showServiceFee: boolean
  showRemarks: boolean
  batteryLevel: number
  signalStrength: number
  wifiEnabled: boolean
  currentTime: string
  
  // 模板设置
  template: 'default' | 'dark' | 'light'
  deviceType: 'iphone' | 'android' | 'ipad'
}

export const paymentPlatforms = [
  { id: 'wechat', label: '微信支付', icon: '💚', color: '#07C160' },
  { id: 'alipay', label: '支付宝', icon: '💙', color: '#1677FF' },
  { id: 'apple-pay', label: 'Apple Pay', icon: '🍎', color: '#000000' },
  { id: 'visa', label: 'Visa', icon: '💳', color: '#1A1F71' },
  { id: 'mastercard', label: 'Mastercard', icon: '🔴', color: '#EB001B' },
  { id: 'unionpay', label: '银联', icon: '🏦', color: '#E21836' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️', color: '#003087' }
]

export const paymentTypes = [
  { id: 'transfer', label: '转账', labelEn: 'Transfer' },
  { id: 'payment', label: '付款', labelEn: 'Payment' },
  { id: 'refund', label: '退款', labelEn: 'Refund' },
  { id: 'redpacket', label: '红包', labelEn: 'Red Packet' }
]

export const currencies = [
  { id: 'CNY', label: '人民币 ¥', symbol: '¥' },
  { id: 'USD', label: '美元 $', symbol: '$' },
  { id: 'EUR', label: '欧元 €', symbol: '€' },
  { id: 'GBP', label: '英镑 £', symbol: '£' },
  { id: 'JPY', label: '日元 ¥', symbol: '¥' },
  { id: 'HKD', label: '港币 HK$', symbol: 'HK$' },
  { id: 'AUD', label: '澳元 A$', symbol: 'A$' },
  { id: 'CAD', label: '加元 C$', symbol: 'C$' }
]

export const usePaymentScreenshotStore = defineStore('paymentScreenshot', () => {
  const data = reactive<PaymentData>({
    platform: 'wechat',
    amount: 1000.00,
    currency: 'CNY',
    paymentType: 'transfer',
    status: 'success',
    
    receiverName: '张三',
    receiverAccount: '',
    receiverAvatar: '',
    receiverBank: '',
    
    senderName: '李四',
    senderAccount: '',
    senderAvatar: '',
    senderBank: '',
    
    transactionId: '',
    orderNumber: '',
    remarks: '转账',
    paymentTime: new Date().toLocaleString('zh-CN'),
    
    redpacketMessage: '恭喜发财，大吉大利',
    serviceFee: 0,
    
    cardNumber: '**** **** **** 1234',
    cardType: 'credit',
    authCode: '',
    merchantName: '',
    merchantId: '',
    terminalId: '',
    
    showTransactionId: true,
    showServiceFee: false,
    showRemarks: true,
    batteryLevel: 85,
    signalStrength: 4,
    wifiEnabled: true,
    currentTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    
    template: 'default',
    deviceType: 'iphone'
  })

  const generateTransactionId = () => {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    switch (data.platform) {
      case 'wechat':
        data.transactionId = `420000${timestamp}${random}`
        break
      case 'alipay':
        data.transactionId = `20${new Date().getFullYear()}${timestamp.slice(-10)}${random}`
        break
      case 'apple-pay':
        data.transactionId = `AP${timestamp}${random}`
        break
      case 'visa':
      case 'mastercard':
        data.transactionId = `${random}${timestamp.slice(-8)}`
        break
      case 'unionpay':
        data.transactionId = `62${timestamp}${random.slice(0, 4)}`
        break
      case 'paypal':
        data.transactionId = `PP-${random}-${timestamp.slice(-6)}`
        break
    }
  }

  const generateOrderNumber = () => {
    const date = new Date()
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const random = Math.floor(Math.random() * 9000000000) + 1000000000
    data.orderNumber = `${dateStr}${random}`
  }

  const generateAuthCode = () => {
    data.authCode = Math.floor(Math.random() * 900000 + 100000).toString()
  }

  const formatAmount = computed(() => {
    const curr = currencies.find(c => c.id === data.currency)
    const symbol = curr?.symbol || '¥'
    return `${symbol}${data.amount.toFixed(2)}`
  })

  const platformInfo = computed(() => {
    return paymentPlatforms.find(p => p.id === data.platform)
  })

  const setCurrentTime = () => {
    data.currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    data.paymentTime = new Date().toLocaleString('zh-CN')
  }

  const setPlatformDefaults = (platform: PaymentPlatform) => {
    data.platform = platform
    generateTransactionId()
    generateOrderNumber()
    
    // 设置平台特定默认值
    switch (platform) {
      case 'wechat':
        data.template = 'default'
        break
      case 'alipay':
        data.template = 'light'
        break
      case 'apple-pay':
        data.template = 'dark'
        break
      default:
        data.template = 'default'
    }
  }

  // 初始化
  generateTransactionId()
  generateOrderNumber()

  return {
    data,
    generateTransactionId,
    generateOrderNumber,
    generateAuthCode,
    formatAmount,
    platformInfo,
    setCurrentTime,
    setPlatformDefaults
  }
})
