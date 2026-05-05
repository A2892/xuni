import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TrainTicketData {
  // 平台信息
  platform: 'ctrip' | '12306' | 'meituan' | 'qunar' | 'tongcheng' | 'zhixing'
  ticketType: 'train' | 'flight' | 'bus' | 'ferry'
  
  // 出发到达
  departureStation: string
  arrivalStation: string
  departureCity: string
  arrivalCity: string
  departureTime: string
  arrivalTime: string
  departureDate: string
  arrivalDate: string
  
  // 车次/航班信息
  trainNo: string  // 车次号或航班号
  trainType: string  // 高铁/动车/特快/普快 或 航空公司
  seatType: string  // 座位类型
  seatNo: string  // 座位号
  carriage: string  // 车厢号
  duration: string  // 行程时长
  distance: string  // 公里数
  
  // 乘客信息
  passengerName: string
  idType: string
  idNumber: string
  passengerType: string  // 成人/儿童/学生
  phone: string
  
  // 订单信息
  orderNo: string
  ticketNo: string  // 取票号
  ticketPrice: number
  serviceFee: number
  insuranceFee: number
  totalPrice: number
  paymentMethod: string
  paymentTime: string
  orderStatus: 'unpaid' | 'paid' | 'completed' | 'refunded' | 'cancelled'
  
  // 显示设置
  deviceType: 'iphone' | 'android'
  showTime: string
  showBattery: number
  showSignal: number
  showWifi: boolean
  darkMode: boolean
  showQRCode: boolean
  showBarcode: boolean
}

export const ticketPlatforms = [
  { id: 'ctrip', name: '携程旅行', icon: '🟠', color: '#FF6633' },
  { id: '12306', name: '铁路12306', icon: '🔵', color: '#0066CC' },
  { id: 'meituan', name: '美团旅行', icon: '🟡', color: '#FFD100' },
  { id: 'qunar', name: '去哪儿', icon: '🟢', color: '#00A8E8' },
  { id: 'tongcheng', name: '同程旅行', icon: '🔴', color: '#FF5722' },
  { id: 'zhixing', name: '智行火车票', icon: '🟣', color: '#6C5CE7' }
]

export const ticketTypes = [
  { id: 'train', label: '火车票', icon: '🚄' },
  { id: 'flight', label: '机票', icon: '✈️' },
  { id: 'bus', label: '汽车票', icon: '🚌' },
  { id: 'ferry', label: '船票', icon: '🚢' }
]

export const trainTypes = [
  { id: 'G', name: '高铁', color: '#FF6633' },
  { id: 'D', name: '动车', color: '#00A8E8' },
  { id: 'C', name: '城际', color: '#6C5CE7' },
  { id: 'Z', name: '直达', color: '#0066CC' },
  { id: 'T', name: '特快', color: '#FF5722' },
  { id: 'K', name: '快速', color: '#4CAF50' },
  { id: 'L', name: '临客', color: '#9E9E9E' }
]

export const seatTypes = [
  { id: 'business', name: '商务座', price: 1.8 },
  { id: 'first', name: '一等座', price: 1.5 },
  { id: 'second', name: '二等座', price: 1.0 },
  { id: 'soft-sleeper', name: '软卧', price: 1.3 },
  { id: 'hard-sleeper', name: '硬卧', price: 0.9 },
  { id: 'hard-seat', name: '硬座', price: 0.5 },
  { id: 'no-seat', name: '无座', price: 0.4 }
]

export const orderStatuses = [
  { id: 'unpaid', label: '待支付', color: '#FF9800' },
  { id: 'paid', label: '已支付', color: '#4CAF50' },
  { id: 'completed', label: '已完成', color: '#2196F3' },
  { id: 'refunded', label: '已退款', color: '#9E9E9E' },
  { id: 'cancelled', label: '已取消', color: '#F44336' }
]

export const useTicketStore = defineStore('ticket', () => {
  const data = ref<TrainTicketData>({
    platform: '12306',
    ticketType: 'train',
    
    departureStation: '北京南站',
    arrivalStation: '上海虹桥站',
    departureCity: '北京',
    arrivalCity: '上海',
    departureTime: '08:00',
    arrivalTime: '12:35',
    departureDate: '2025-02-15',
    arrivalDate: '2025-02-15',
    
    trainNo: 'G1',
    trainType: 'G',
    seatType: '二等座',
    seatNo: '05A',
    carriage: '08',
    duration: '4小时35分',
    distance: '1318公里',
    
    passengerName: '张*明',
    idType: '身份证',
    idNumber: '110***********1234',
    passengerType: '成人',
    phone: '138****8888',
    
    orderNo: generateOrderNo(),
    ticketNo: generateTicketNo(),
    ticketPrice: 553,
    serviceFee: 5,
    insuranceFee: 0,
    totalPrice: 558,
    paymentMethod: '微信支付',
    paymentTime: '2025-02-14 18:30:00',
    orderStatus: 'paid',
    
    deviceType: 'iphone',
    showTime: '09:41',
    showBattery: 85,
    showSignal: 4,
    showWifi: true,
    darkMode: false,
    showQRCode: true,
    showBarcode: true
  })

  function generateOrderNo(): string {
    const now = new Date()
    const dateStr = now.toISOString().slice(0,10).replace(/-/g, '')
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
    return `E${dateStr}${random}`
  }

  function generateTicketNo(): string {
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
    return random
  }

  function refreshOrderNo() {
    data.value.orderNo = generateOrderNo()
  }

  function refreshTicketNo() {
    data.value.ticketNo = generateTicketNo()
  }

  function recalculateTotal() {
    data.value.totalPrice = data.value.ticketPrice + data.value.serviceFee + data.value.insuranceFee
  }

  function setPlatformDefaults(platform: TrainTicketData['platform']) {
    data.value.platform = platform
    
    const colors: Record<string, string> = {
      'ctrip': '#FF6633',
      '12306': '#0066CC',
      'meituan': '#FFD100',
      'qunar': '#00A8E8',
      'tongcheng': '#FF5722',
      'zhixing': '#6C5CE7'
    }
  }

  function setTicketTypeDefaults(ticketType: TrainTicketData['ticketType']) {
    data.value.ticketType = ticketType
    
    if (ticketType === 'train') {
      data.value.trainNo = 'G1'
      data.value.trainType = 'G'
      data.value.seatType = '二等座'
      data.value.departureStation = '北京南站'
      data.value.arrivalStation = '上海虹桥站'
    } else if (ticketType === 'flight') {
      data.value.trainNo = 'MU5107'
      data.value.trainType = '东方航空'
      data.value.seatType = '经济舱'
      data.value.departureStation = '北京首都T3'
      data.value.arrivalStation = '上海虹桥T2'
      data.value.ticketPrice = 1280
      recalculateTotal()
    } else if (ticketType === 'bus') {
      data.value.trainNo = 'K001'
      data.value.trainType = '豪华大巴'
      data.value.seatType = '普通座'
      data.value.departureStation = '北京六里桥站'
      data.value.arrivalStation = '天津西站'
      data.value.ticketPrice = 78
      recalculateTotal()
    } else if (ticketType === 'ferry') {
      data.value.trainNo = 'H001'
      data.value.trainType = '客轮'
      data.value.seatType = '二等舱'
      data.value.departureStation = '上海吴淞口'
      data.value.arrivalStation = '大连港'
      data.value.ticketPrice = 420
      recalculateTotal()
    }
  }

  function reset() {
    data.value = {
      platform: '12306',
      ticketType: 'train',
      departureStation: '北京南站',
      arrivalStation: '上海虹桥站',
      departureCity: '北京',
      arrivalCity: '上海',
      departureTime: '08:00',
      arrivalTime: '12:35',
      departureDate: '2025-02-15',
      arrivalDate: '2025-02-15',
      trainNo: 'G1',
      trainType: 'G',
      seatType: '二等座',
      seatNo: '05A',
      carriage: '08',
      duration: '4小时35分',
      distance: '1318公里',
      passengerName: '张*明',
      idType: '身份证',
      idNumber: '110***********1234',
      passengerType: '成人',
      phone: '138****8888',
      orderNo: generateOrderNo(),
      ticketNo: generateTicketNo(),
      ticketPrice: 553,
      serviceFee: 5,
      insuranceFee: 0,
      totalPrice: 558,
      paymentMethod: '微信支付',
      paymentTime: '2025-02-14 18:30:00',
      orderStatus: 'paid',
      deviceType: 'iphone',
      showTime: '09:41',
      showBattery: 85,
      showSignal: 4,
      showWifi: true,
      darkMode: false,
      showQRCode: true,
      showBarcode: true
    }
  }

  return {
    data,
    generateOrderNo,
    generateTicketNo,
    refreshOrderNo,
    refreshTicketNo,
    recalculateTotal,
    setPlatformDefaults,
    setTicketTypeDefaults,
    reset
  }
})

export { generateOrderNo }
function generateOrderNo(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0,10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
  return `E${dateStr}${random}`
}

function generateTicketNo(): string {
  const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  return random
}
