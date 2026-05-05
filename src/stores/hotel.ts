import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sharedCurrencies } from '@/lib/currencies'

export const useHotelStore = defineStore('hotel', () => {
  const confirmationNumber = ref('HTL2026010001')
  
  // Hotel Info - 与 HotelView 和 HotelPreview 兼容
  const hotel = ref({
    name: 'The Grand Hyatt Singapore',
    stars: 5,
    logo: '',
    address: '10 Scotts Road, Singapore 228211',
    phone: '+65 6738 1234',
    email: 'singapore.grand@hyatt.com',
    website: 'www.hyatt.com/grand-hyatt-singapore'
  })
  
  // Guest Info - 与 View 兼容
  const guest = ref({
    name: 'Jennifer Martinez',
    phone: '+1 (555) 456-7890',
    email: 'jennifer.martinez@email.com',
    idNumber: 'G1234567890',
    address: '789 Palm Avenue, Miami, FL 33101, USA',
    specialRequests: 'High floor, quiet room preferred'
  })
  
  // Reservation Details - 与 View 兼容
  const reservation = ref({
    checkIn: '2026-02-20',
    checkOut: '2026-02-25',
    roomType: 'suite',
    roomCount: 1,
    roomNumber: '1201',
    adults: 2,
    children: 0,
    ratePerNight: 450,
    breakfastIncluded: true
  })
  
  // Payment - 与 View 兼容
  const payment = ref({
    method: 'credit',
    status: 'paid' as 'paid' | 'pending' | 'partial' | 'fully_paid',
    amountPaid: 2250,
    currency: 'CNY',
    // 新增支付完成信息
    isPaid: false,
    paidDate: '',
    confirmationNumber: '',
    payerName: ''
  })
  
  // 税费和服务费
  const fees = ref({
    taxRate: 10, // 税率百分比
    serviceFeeRate: 10, // 服务费率百分比
    cityTax: 5, // 城市税（固定金额/晚）
    resortFee: 0 // 度假费
  })
  
  const settings = ref({
    template: 'luxury' as 'luxury' | 'modern' | 'classic' | 'minimal',
    primaryColor: '#8B4513',
    showLogo: true,
    showQR: true,
    showBarcode: true,
    showPolicies: true,
    showAmenities: true,
    language: 'en' as 'en' | 'zh'
  })

  const formatCurrency = (amount: number, currencyCode?: string) => {
    const code = currencyCode || payment.value.currency || 'CNY'
    const cur = sharedCurrencies.find(c => c.code === code)
    const symbol = cur?.symbol || '¥'
    return `${symbol}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  }

  // Computed
  const nights = computed(() => {
    const checkIn = new Date(reservation.value.checkIn)
    const checkOut = new Date(reservation.value.checkOut)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  })

  const totalRoomCharge = computed(() => {
    return nights.value * reservation.value.ratePerNight * reservation.value.roomCount
  })

  // 税费计算
  const taxAmount = computed(() => {
    return Number((totalRoomCharge.value * fees.value.taxRate / 100).toFixed(2))
  })

  // 服务费计算
  const serviceFeeAmount = computed(() => {
    return Number((totalRoomCharge.value * fees.value.serviceFeeRate / 100).toFixed(2))
  })

  // 城市税计算
  const cityTaxAmount = computed(() => {
    return fees.value.cityTax * nights.value * reservation.value.roomCount
  })

  // 度假费
  const resortFeeAmount = computed(() => {
    return fees.value.resortFee * nights.value
  })

  // 总费用
  const totalFees = computed(() => {
    return taxAmount.value + serviceFeeAmount.value + cityTaxAmount.value + resortFeeAmount.value
  })

  const totalAmount = computed(() => {
    return totalRoomCharge.value + totalFees.value
  })

  // 生成支付确认号
  const generatePaymentConfirmation = () => {
    const prefix = 'PAY'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  // 完成支付
  const completePayment = () => {
    payment.value.isPaid = true
    payment.value.paidDate = new Date().toISOString().split('T')[0]
    payment.value.confirmationNumber = generatePaymentConfirmation()
    payment.value.payerName = guest.value.name
    payment.value.amountPaid = totalAmount.value
    payment.value.status = 'fully_paid'
  }

  // 重置支付状态
  const resetPayment = () => {
    payment.value.isPaid = false
    payment.value.paidDate = ''
    payment.value.confirmationNumber = ''
    payment.value.payerName = ''
    payment.value.status = 'pending'
  }

  // 设计设置
  const designSettings = ref({
    watermarkEnabled: false,
    watermarkText: 'CONFIRMED',
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

  // 二维码设置
  const qrSettings = ref({
    useCustomQR: false,
    customQRImage: '',
    qrContent: ''
  })

  // 条形码设置
  const barcodeSettings = ref({
    useCustomBarcode: false,
    customBarcodeImage: '',
    barcodeContent: ''
  })

  return {
    confirmationNumber,
    hotel,
    guest,
    reservation,
    payment,
    fees,
    settings,
    nights,
    totalRoomCharge,
    taxAmount,
    serviceFeeAmount,
    cityTaxAmount,
    resortFeeAmount,
    totalFees,
    totalAmount,
    designSettings,
    qrSettings,
    barcodeSettings,
    formatCurrency,
    completePayment,
    resetPayment,
    generatePaymentConfirmation
  }
})
