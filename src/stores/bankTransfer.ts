import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface BankTransferData {
  // 银行选择
  bank: 'icbc' | 'ccb' | 'abc' | 'boc' | 'cmb' | 'bocom' | 'citic' | 'spdb' | 'ceb' | 'pab' | 'cib'
  transferType: 'transfer' | 'receipt' | 'balance' | 'bill'
  
  // 转账信息
  amount: number
  currency: string
  status: 'success' | 'pending' | 'failed' | 'processing'
  
  // 收款方
  receiverName: string
  receiverBank: string
  receiverAccount: string
  receiverAccountMasked: string
  
  // 付款方
  senderName: string
  senderBank: string
  senderAccount: string
  senderAccountMasked: string
  
  // 交易信息
  transactionId: string
  orderNo: string
  transactionTime: string
  remarks: string
  transferChannel: string
  fee: number
  
  // 余额信息
  balanceAmount: number
  availableAmount: number
  frozenAmount: number
  
  // 账单信息
  billMonth: string
  billItems: { date: string, description: string, amount: number, type: 'income' | 'expense', balance: number }[]
  
  // 设备设置
  deviceType: 'iphone' | 'android'
  showTime: string
  showBattery: number
  showSignal: number
  showWifi: boolean
  darkMode: boolean
  
  // 显示设置
  showTransactionId: boolean
  showFee: boolean
  showRemarks: boolean
}

export const banks = [
  { id: 'icbc', label: '工商银行', icon: '🏦', color: '#C41E3A', shortName: '工行' },
  { id: 'ccb', label: '建设银行', icon: '🏗️', color: '#003399', shortName: '建行' },
  { id: 'abc', label: '农业银行', icon: '🌾', color: '#00A651', shortName: '农行' },
  { id: 'boc', label: '中国银行', icon: '🏛️', color: '#C8102E', shortName: '中行' },
  { id: 'cmb', label: '招商银行', icon: '🌸', color: '#C8102E', shortName: '招行' },
  { id: 'bocom', label: '交通银行', icon: '🚢', color: '#0066B3', shortName: '交行' },
  { id: 'citic', label: '中信银行', icon: '💼', color: '#C8102E', shortName: '中信' },
  { id: 'spdb', label: '浦发银行', icon: '🌊', color: '#003DA5', shortName: '浦发' },
  { id: 'ceb', label: '光大银行', icon: '☀️', color: '#7B3F00', shortName: '光大' },
  { id: 'pab', label: '平安银行', icon: '🛡️', color: '#FF6600', shortName: '平安' },
  { id: 'cib', label: '兴业银行', icon: '🌿', color: '#003DA5', shortName: '兴业' }
]

export const transferTypes = [
  { id: 'transfer', label: '转账成功', icon: '✓' },
  { id: 'receipt', label: '收款记录', icon: '📥' },
  { id: 'balance', label: '余额查询', icon: '💰' },
  { id: 'bill', label: '账单明细', icon: '📋' }
]

export const currencies = [
  { id: 'CNY', label: '人民币 ¥', symbol: '¥' },
  { id: 'USD', label: '美元 $', symbol: '$' },
  { id: 'EUR', label: '欧元 €', symbol: '€' },
  { id: 'HKD', label: '港币 HK$', symbol: 'HK$' },
  { id: 'JPY', label: '日元 ¥', symbol: '¥' }
]

export const useBankTransferStore = defineStore('bankTransfer', () => {
  const data = ref<BankTransferData>({
    bank: 'cmb',
    transferType: 'transfer',
    
    amount: 5000.00,
    currency: 'CNY',
    status: 'success',
    
    receiverName: '张*三',
    receiverBank: '招商银行',
    receiverAccount: '6225 **** **** 8888',
    receiverAccountMasked: '6225****8888',
    
    senderName: '李*四',
    senderBank: '招商银行',
    senderAccount: '6225 **** **** 6666',
    senderAccountMasked: '6225****6666',
    
    transactionId: generateTransactionId(),
    orderNo: generateOrderNo(),
    transactionTime: new Date().toLocaleString('zh-CN'),
    remarks: '转账',
    transferChannel: '手机银行',
    fee: 0,
    
    balanceAmount: 125680.50,
    availableAmount: 125680.50,
    frozenAmount: 0,
    
    billMonth: new Date().toISOString().slice(0, 7),
    billItems: [
      { date: '01-15 10:30', description: '工资收入', amount: 15000, type: 'income', balance: 125680.50 },
      { date: '01-14 15:20', description: '网上消费', amount: 299, type: 'expense', balance: 110680.50 },
      { date: '01-13 09:45', description: '转账收入', amount: 5000, type: 'income', balance: 110979.50 }
    ],
    
    deviceType: 'iphone',
    showTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    showBattery: 85,
    showSignal: 4,
    showWifi: true,
    darkMode: false,
    
    showTransactionId: true,
    showFee: true,
    showRemarks: true
  })

  function generateTransactionId() {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substr(2, 8).toUpperCase()
    return `${timestamp.slice(-10)}${random}`
  }

  function generateOrderNo() {
    const date = new Date()
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    return `${dateStr}${random}`
  }

  const refreshTransactionId = () => {
    data.value.transactionId = generateTransactionId()
    data.value.orderNo = generateOrderNo()
  }

  const addBillItem = () => {
    data.value.billItems.unshift({
      date: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      description: '新交易',
      amount: 0,
      type: 'expense',
      balance: data.value.balanceAmount
    })
  }

  const removeBillItem = (index: number) => {
    data.value.billItems.splice(index, 1)
  }

  const setBankDefaults = (bankId: BankTransferData['bank']) => {
    data.value.bank = bankId
    const bankInfo = banks.find(b => b.id === bankId)
    if (bankInfo) {
      data.value.senderBank = bankInfo.label
    }
  }

  const reset = () => {
    data.value = {
      bank: 'cmb',
      transferType: 'transfer',
      amount: 5000.00,
      currency: 'CNY',
      status: 'success',
      receiverName: '张*三',
      receiverBank: '招商银行',
      receiverAccount: '6225 **** **** 8888',
      receiverAccountMasked: '6225****8888',
      senderName: '李*四',
      senderBank: '招商银行',
      senderAccount: '6225 **** **** 6666',
      senderAccountMasked: '6225****6666',
      transactionId: generateTransactionId(),
      orderNo: generateOrderNo(),
      transactionTime: new Date().toLocaleString('zh-CN'),
      remarks: '转账',
      transferChannel: '手机银行',
      fee: 0,
      balanceAmount: 125680.50,
      availableAmount: 125680.50,
      frozenAmount: 0,
      billMonth: new Date().toISOString().slice(0, 7),
      billItems: [],
      deviceType: 'iphone',
      showTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      showBattery: 85,
      showSignal: 4,
      showWifi: true,
      darkMode: false,
      showTransactionId: true,
      showFee: true,
      showRemarks: true
    }
  }

  return {
    data,
    generateTransactionId,
    generateOrderNo,
    refreshTransactionId,
    addBillItem,
    removeBillItem,
    setBankDefaults,
    reset
  }
})
