import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface OrderItem {
  id: string
  name: string
  specs: string
  quantity: number
  price: number
  originalPrice?: number
}

export interface DeliveryOrderData {
  // 平台
  platform: 'meituan' | 'eleme' | 'didi' | 'shunfeng' | 'cainiao' | 'jd' | 'kuaishou' | 'douyin'
  orderType: 'food' | 'express' | 'ride' | 'shopping'
  
  // 订单信息
  orderId: string
  orderTime: string
  payTime: string
  orderStatus: 'pending' | 'confirmed' | 'delivering' | 'completed' | 'cancelled' | 'refunded'
  
  // 商家信息
  merchantName: string
  merchantLogo: string
  merchantAddress: string
  merchantPhone: string
  merchantRating: number
  
  // 收货信息
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  deliveryTime: string
  deliveryDistance: string
  
  // 骑手/司机信息
  riderName: string
  riderPhone: string
  riderAvatar: string
  vehicleInfo: string
  plateNumber: string
  
  // 商品/服务
  items: OrderItem[]
  
  // 费用明细
  subtotal: number
  deliveryFee: number
  packingFee: number
  discount: number
  couponDiscount: number
  redpacketDiscount: number
  totalAmount: number
  paymentMethod: 'wechat' | 'alipay' | 'cash' | 'card' | 'balance'
  
  // 快递信息
  trackingNo: string
  expressCompany: string
  weight: string
  expressStatus: string
  trackingHistory: { time: string, status: string, location: string }[]
  
  // 打车信息
  pickupLocation: string
  dropoffLocation: string
  tripDistance: string
  tripDuration: string
  tripRoute: string
  carType: string
  
  // 设备设置
  deviceType: 'iphone' | 'android'
  showTime: string
  showBattery: number
  darkMode: boolean
}

export const deliveryPlatforms = [
  { id: 'meituan', label: '美团外卖', icon: '🟡', color: '#FFD100', type: 'food' },
  { id: 'eleme', label: '饿了么', icon: '🔵', color: '#0097FF', type: 'food' },
  { id: 'didi', label: '滴滴出行', icon: '🟠', color: '#FF6A00', type: 'ride' },
  { id: 'shunfeng', label: '顺丰速运', icon: '⚫', color: '#000000', type: 'express' },
  { id: 'cainiao', label: '菜鸟裹裹', icon: '🟤', color: '#FF6A00', type: 'express' },
  { id: 'jd', label: '京东快递', icon: '🔴', color: '#E4393C', type: 'express' },
  { id: 'kuaishou', label: '快手小店', icon: '🟠', color: '#FF4906', type: 'shopping' },
  { id: 'douyin', label: '抖音商城', icon: '⚫', color: '#000000', type: 'shopping' }
]

export const orderStatuses = [
  { id: 'pending', label: '待支付', color: '#f59e0b' },
  { id: 'confirmed', label: '已确认', color: '#3b82f6' },
  { id: 'delivering', label: '配送中', color: '#8b5cf6' },
  { id: 'completed', label: '已完成', color: '#22c55e' },
  { id: 'cancelled', label: '已取消', color: '#94a3b8' },
  { id: 'refunded', label: '已退款', color: '#ef4444' }
]

export const paymentMethods = [
  { id: 'wechat', label: '微信支付', icon: '💚' },
  { id: 'alipay', label: '支付宝', icon: '💙' },
  { id: 'cash', label: '货到付款', icon: '💵' },
  { id: 'card', label: '银行卡', icon: '💳' },
  { id: 'balance', label: '余额支付', icon: '👛' }
]

export const expressCompanies = [
  { id: 'sf', label: '顺丰速运' },
  { id: 'yt', label: '圆通快递' },
  { id: 'zt', label: '中通快递' },
  { id: 'yd', label: '韵达快递' },
  { id: 'st', label: '申通快递' },
  { id: 'jd', label: '京东快递' },
  { id: 'ems', label: '中国邮政EMS' },
  { id: 'db', label: '德邦快递' }
]

export const useDeliveryOrderStore = defineStore('deliveryOrder', () => {
  const data = ref<DeliveryOrderData>({
    platform: 'meituan',
    orderType: 'food',
    
    orderId: generateOrderId(),
    orderTime: new Date().toLocaleString('zh-CN'),
    payTime: new Date().toLocaleString('zh-CN'),
    orderStatus: 'completed',
    
    merchantName: '肯德基(朝阳门店)',
    merchantLogo: '',
    merchantAddress: '北京市朝阳区朝阳门外大街26号',
    merchantPhone: '400-880-3823',
    merchantRating: 4.8,
    
    receiverName: '张三',
    receiverPhone: '138****8888',
    receiverAddress: '北京市朝阳区望京SOHO T1 1801',
    deliveryTime: '预计 30 分钟送达',
    deliveryDistance: '2.5km',
    
    riderName: '李师傅',
    riderPhone: '139****6666',
    riderAvatar: '',
    vehicleInfo: '电动车',
    plateNumber: '京A88888',
    
    items: [
      { id: '1', name: '香辣鸡腿堡', specs: '单点', quantity: 1, price: 22.00 },
      { id: '2', name: '薯条(大)', specs: '大份', quantity: 1, price: 12.00 },
      { id: '3', name: '可乐(中)', specs: '中杯 无糖', quantity: 2, price: 8.00 }
    ],
    
    subtotal: 50.00,
    deliveryFee: 5.00,
    packingFee: 2.00,
    discount: 0,
    couponDiscount: 10.00,
    redpacketDiscount: 2.00,
    totalAmount: 45.00,
    paymentMethod: 'wechat',
    
    trackingNo: generateTrackingNo(),
    expressCompany: '顺丰速运',
    weight: '0.5kg',
    expressStatus: '已签收',
    trackingHistory: [
      { time: '2025-01-15 10:30', status: '快件已签收', location: '北京市朝阳区' },
      { time: '2025-01-15 08:20', status: '快件正在派送', location: '北京市朝阳区' },
      { time: '2025-01-14 22:00', status: '快件到达', location: '北京转运中心' }
    ],
    
    pickupLocation: '北京西站',
    dropoffLocation: '北京首都国际机场T3航站楼',
    tripDistance: '35.2km',
    tripDuration: '约45分钟',
    tripRoute: '西二环 → 机场高速',
    carType: '舒适型',
    
    deviceType: 'iphone',
    showTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    showBattery: 85,
    darkMode: false
  })

  function generateOrderId() {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `MT${timestamp.slice(-8)}${random}`
  }

  function generateTrackingNo() {
    const prefix = 'SF'
    const numbers = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('')
    return `${prefix}${numbers}`
  }

  const addItem = () => {
    data.value.items.push({
      id: `item_${Date.now()}`,
      name: '新商品',
      specs: '',
      quantity: 1,
      price: 0
    })
    recalculateTotal()
  }

  const removeItem = (id: string) => {
    const index = data.value.items.findIndex(item => item.id === id)
    if (index > -1) {
      data.value.items.splice(index, 1)
      recalculateTotal()
    }
  }

  const recalculateTotal = () => {
    data.value.subtotal = data.value.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    data.value.totalAmount = data.value.subtotal + data.value.deliveryFee + data.value.packingFee 
      - data.value.discount - data.value.couponDiscount - data.value.redpacketDiscount
    if (data.value.totalAmount < 0) data.value.totalAmount = 0
  }

  const addTrackingHistory = () => {
    data.value.trackingHistory.unshift({
      time: new Date().toLocaleString('zh-CN'),
      status: '快件状态更新',
      location: '北京市'
    })
  }

  const removeTrackingHistory = (index: number) => {
    data.value.trackingHistory.splice(index, 1)
  }

  const setPlatformDefaults = (platform: DeliveryOrderData['platform']) => {
    data.value.platform = platform
    const platformInfo = deliveryPlatforms.find(p => p.id === platform)
    if (platformInfo) {
      data.value.orderType = platformInfo.type as any
    }
    
    // 重新生成订单号
    const prefixes: Record<string, string> = {
      meituan: 'MT',
      eleme: 'EL',
      didi: 'DD',
      shunfeng: 'SF',
      cainiao: 'CN',
      jd: 'JD',
      kuaishou: 'KS',
      douyin: 'DY'
    }
    data.value.orderId = `${prefixes[platform]}${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  }

  const reset = () => {
    data.value = {
      platform: 'meituan',
      orderType: 'food',
      orderId: generateOrderId(),
      orderTime: new Date().toLocaleString('zh-CN'),
      payTime: new Date().toLocaleString('zh-CN'),
      orderStatus: 'completed',
      merchantName: '肯德基(朝阳门店)',
      merchantLogo: '',
      merchantAddress: '北京市朝阳区朝阳门外大街26号',
      merchantPhone: '400-880-3823',
      merchantRating: 4.8,
      receiverName: '张三',
      receiverPhone: '138****8888',
      receiverAddress: '北京市朝阳区望京SOHO T1 1801',
      deliveryTime: '预计 30 分钟送达',
      deliveryDistance: '2.5km',
      riderName: '李师傅',
      riderPhone: '139****6666',
      riderAvatar: '',
      vehicleInfo: '电动车',
      plateNumber: '京A88888',
      items: [
        { id: '1', name: '香辣鸡腿堡', specs: '单点', quantity: 1, price: 22.00 }
      ],
      subtotal: 22.00,
      deliveryFee: 5.00,
      packingFee: 2.00,
      discount: 0,
      couponDiscount: 0,
      redpacketDiscount: 0,
      totalAmount: 29.00,
      paymentMethod: 'wechat',
      trackingNo: generateTrackingNo(),
      expressCompany: '顺丰速运',
      weight: '0.5kg',
      expressStatus: '已签收',
      trackingHistory: [],
      pickupLocation: '',
      dropoffLocation: '',
      tripDistance: '',
      tripDuration: '',
      tripRoute: '',
      carType: '舒适型',
      deviceType: 'iphone',
      showTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      showBattery: 85,
      darkMode: false
    }
  }

  return {
    data,
    addItem,
    removeItem,
    recalculateTotal,
    addTrackingHistory,
    removeTrackingHistory,
    setPlatformDefaults,
    generateOrderId,
    generateTrackingNo,
    reset
  }
})
