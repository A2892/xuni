import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CNHotelCharge {
  id: string
  date: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  category: 'room' | 'food' | 'service' | 'other'
}

export interface CNHotelData {
  // 酒店信息
  hotelName: string
  hotelNameEn: string
  hotelStar: number
  hotelAddress: string
  hotelPhone: string
  hotelFax: string
  hotelEmail: string
  hotelWebsite: string
  
  // 预订信息
  confirmationNumber: string
  reservationNumber: string
  folioNumber: string
  
  // 客人信息
  guestName: string
  guestNameEn: string
  guestPhone: string
  guestEmail: string
  guestIdType: 'id_card' | 'passport' | 'other'
  guestIdNumber: string
  guestCompany: string
  
  // 入住信息
  checkInDate: string
  checkOutDate: string
  checkInTime: string
  checkOutTime: string
  roomType: string
  roomNumber: string
  nights: number
  guests: number
  
  // 费用明细
  charges: CNHotelCharge[]
  
  // 金额信息
  roomTotal: number
  serviceCharge: number
  serviceChargeRate: number
  taxes: number
  taxRate: number
  deposit: number
  totalAmount: number
  paidAmount: number
  balance: number
  
  // 支付信息
  paymentMethod: string
  paymentStatus: 'unpaid' | 'partial' | 'paid'
  
  // 备注
  remarks: string
  specialRequests: string
  
  // 设计选项
  template: 'luxury' | 'business' | 'minimal'
  showLogo: boolean
  showQRCode: boolean
  showBarcode: boolean
}

export const roomTypes = [
  { value: 'standard_single', label: '标准单人房', labelEn: 'Standard Single' },
  { value: 'standard_double', label: '标准双人房', labelEn: 'Standard Double' },
  { value: 'deluxe_single', label: '豪华单人房', labelEn: 'Deluxe Single' },
  { value: 'deluxe_double', label: '豪华双人房', labelEn: 'Deluxe Double' },
  { value: 'executive_suite', label: '行政套房', labelEn: 'Executive Suite' },
  { value: 'presidential_suite', label: '总统套房', labelEn: 'Presidential Suite' },
  { value: 'family_room', label: '家庭房', labelEn: 'Family Room' }
]

export const chargeCategories = {
  room: { name: '房费', icon: '🏠', color: '#4caf50' },
  food: { name: '餐饮', icon: '🍴', color: '#ff9800' },
  service: { name: '服务', icon: '🔔', color: '#2196f3' },
  other: { name: '其他', icon: '📁', color: '#9c27b0' }
}

export const useCNHotelStore = defineStore('cnHotel', () => {
  const data = ref<CNHotelData>({
    hotelName: '北京国际大酒店',
    hotelNameEn: 'BEIJING INTERNATIONAL HOTEL',
    hotelStar: 5,
    hotelAddress: '北京市东城区建国门内大街9号',
    hotelPhone: '010-65126688',
    hotelFax: '010-65126699',
    hotelEmail: 'info@beijinghotel.com',
    hotelWebsite: 'www.beijinghotel.com',
    
    confirmationNumber: 'CNF' + Date.now().toString().slice(-8),
    reservationNumber: 'RES' + Math.random().toString().slice(2, 10),
    folioNumber: 'FOL' + Math.random().toString().slice(2, 8),
    
    guestName: '张三',
    guestNameEn: 'ZHANG SAN',
    guestPhone: '138****1234',
    guestEmail: 'zhangsan@email.com',
    guestIdType: 'id_card',
    guestIdNumber: '110101********1234',
    guestCompany: '北京科技有限公司',
    
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    roomType: '豪华双人房',
    roomNumber: '1808',
    nights: 2,
    guests: 2,
    
    charges: [
      {
        id: '1',
        date: new Date().toISOString().split('T')[0],
        description: '豪华双人房',
        quantity: 2,
        unitPrice: 888,
        amount: 1776,
        category: 'room'
      },
      {
        id: '2',
        date: new Date().toISOString().split('T')[0],
        description: '客房早餐',
        quantity: 2,
        unitPrice: 128,
        amount: 256,
        category: 'food'
      }
    ],
    
    roomTotal: 1776,
    serviceCharge: 0,
    serviceChargeRate: 10,
    taxes: 0,
    taxRate: 6,
    deposit: 500,
    totalAmount: 2032,
    paidAmount: 500,
    balance: 1532,
    
    paymentMethod: '微信支付',
    paymentStatus: 'partial',
    
    remarks: '',
    specialRequests: '',
    
    template: 'luxury',
    showLogo: true,
    showQRCode: true,
    showBarcode: true
  })

  // 计算房费总计
  const calculatedRoomTotal = computed(() => {
    return data.value.charges
      .filter(c => c.category === 'room')
      .reduce((sum, c) => sum + c.amount, 0)
  })

  // 计算所有费用总计
  const calculatedSubtotal = computed(() => {
    return data.value.charges.reduce((sum, c) => sum + c.amount, 0)
  })

  // 计算服务费
  const calculatedServiceCharge = computed(() => {
    return calculatedSubtotal.value * data.value.serviceChargeRate / 100
  })

  // 计算税费
  const calculatedTaxes = computed(() => {
    return (calculatedSubtotal.value + calculatedServiceCharge.value) * data.value.taxRate / 100
  })

  // 计算总金额
  const calculatedTotal = computed(() => {
    return calculatedSubtotal.value + calculatedServiceCharge.value + calculatedTaxes.value
  })

  // 计算余额
  const calculatedBalance = computed(() => {
    return calculatedTotal.value - data.value.paidAmount
  })

  // 计算入住天数
  const calculatedNights = computed(() => {
    if (!data.value.checkInDate || !data.value.checkOutDate) return 0
    const checkIn = new Date(data.value.checkInDate)
    const checkOut = new Date(data.value.checkOutDate)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000))
  })

  // 更新金额
  const updateTotals = () => {
    data.value.roomTotal = calculatedRoomTotal.value
    data.value.serviceCharge = calculatedServiceCharge.value
    data.value.taxes = calculatedTaxes.value
    data.value.totalAmount = calculatedTotal.value
    data.value.balance = calculatedBalance.value
    data.value.nights = calculatedNights.value
  }

  // 添加费用项
  const addCharge = (category: 'room' | 'food' | 'service' | 'other' = 'other') => {
    data.value.charges.push({
      id: Date.now().toString(),
      date: data.value.checkInDate,
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      category
    })
  }

  // 删除费用项
  const removeCharge = (id: string) => {
    const index = data.value.charges.findIndex(c => c.id === id)
    if (index > -1) {
      data.value.charges.splice(index, 1)
      updateTotals()
    }
  }

  // 计算单项金额
  const calculateChargeAmount = (charge: CNHotelCharge) => {
    charge.amount = charge.quantity * charge.unitPrice
    updateTotals()
  }

  // 格式化日期
  const formatDate = (date: string, format: 'full' | 'short' = 'full') => {
    if (!date) return ''
    const d = new Date(date)
    if (format === 'short') {
      return `${d.getMonth() + 1}月${d.getDate()}日`
    }
    return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
  }

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return '¥' + amount.toFixed(2)
  }

  // 生成确认号
  const generateConfirmationNumber = () => {
    data.value.confirmationNumber = 'CNF' + Date.now().toString().slice(-8)
  }

  // 生成预订号
  const generateReservationNumber = () => {
    data.value.reservationNumber = 'RES' + Math.random().toString().slice(2, 10)
  }

  // 生成账单号
  const generateFolioNumber = () => {
    data.value.folioNumber = 'FOL' + Math.random().toString().slice(2, 8)
  }

  // 预设酒店模板
  const setHotelTemplate = (type: string) => {
    const templates: Record<string, any> = {
      luxury: {
        hotelName: '北京国际大酒店',
        hotelNameEn: 'BEIJING INTERNATIONAL HOTEL',
        hotelStar: 5,
        hotelAddress: '北京市东城区建国门内大街9号',
        hotelPhone: '010-65126688'
      },
      business: {
        hotelName: '上海商务酒店',
        hotelNameEn: 'SHANGHAI BUSINESS HOTEL',
        hotelStar: 4,
        hotelAddress: '上海市浦东新区陆家嘴环路1000号',
        hotelPhone: '021-58889999'
      },
      resort: {
        hotelName: '三亚湾度假酒店',
        hotelNameEn: 'SANYA BAY RESORT',
        hotelStar: 5,
        hotelAddress: '海南省三亚市三亚湾路168号',
        hotelPhone: '0898-88886666'
      }
    }
    Object.assign(data.value, templates[type])
  }

  // 重置
  const reset = () => {
    data.value = {
      hotelName: '',
      hotelNameEn: '',
      hotelStar: 5,
      hotelAddress: '',
      hotelPhone: '',
      hotelFax: '',
      hotelEmail: '',
      hotelWebsite: '',
      
      confirmationNumber: 'CNF' + Date.now().toString().slice(-8),
      reservationNumber: 'RES' + Math.random().toString().slice(2, 10),
      folioNumber: 'FOL' + Math.random().toString().slice(2, 8),
      
      guestName: '',
      guestNameEn: '',
      guestPhone: '',
      guestEmail: '',
      guestIdType: 'id_card',
      guestIdNumber: '',
      guestCompany: '',
      
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkInTime: '14:00',
      checkOutTime: '12:00',
      roomType: '',
      roomNumber: '',
      nights: 1,
      guests: 1,
      
      charges: [],
      
      roomTotal: 0,
      serviceCharge: 0,
      serviceChargeRate: 10,
      taxes: 0,
      taxRate: 6,
      deposit: 0,
      totalAmount: 0,
      paidAmount: 0,
      balance: 0,
      
      paymentMethod: '',
      paymentStatus: 'unpaid',
      
      remarks: '',
      specialRequests: '',
      
      template: 'luxury',
      showLogo: true,
      showQRCode: true
    }
  }

  // 设计设置
  const designSettings = ref({
    watermarkEnabled: false,
    watermarkText: 'PAID',
    watermarkOpacity: 10,
    watermarkType: 'center' as 'center' | 'fullscreen',
    borderEnabled: true,
    borderColor: '#1a365d',
    borderWidth: 2,
    qrCodeSource: 'generate' as 'generate' | 'upload',
    qrCodeContent: '',
    qrCodeImage: '',
    barcodeSource: 'generate' as 'generate' | 'upload',
    barcodeContent: '',
    barcodeImage: '',
    stampEnabled: false,
    stampSource: 'generate' as 'generate' | 'upload',
    stampText: '已结清',
    stampColor: '#22c55e',
    stampImage: ''
  })

  return {
    data,
    designSettings,
    calculatedRoomTotal,
    calculatedSubtotal,
    calculatedServiceCharge,
    calculatedTaxes,
    calculatedTotal,
    calculatedBalance,
    calculatedNights,
    updateTotals,
    addCharge,
    removeCharge,
    calculateChargeAmount,
    formatDate,
    formatCurrency,
    generateConfirmationNumber,
    generateReservationNumber,
    generateFolioNumber,
    setHotelTemplate,
    reset
  }
})
