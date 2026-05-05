import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FlightSegment {
  id: string
  flightNumber: string
  airline: string
  airlineLogo: string
  aircraft: string
  departureAirport: string
  departureCity: string
  departureTime: string
  departureDate: string
  departureTerminal: string
  departureGate: string
  arrivalAirport: string
  arrivalCity: string
  arrivalTime: string
  arrivalDate: string
  arrivalTerminal: string
  duration: string
  class: 'economy' | 'premium-economy' | 'business' | 'first'
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  seatNumber: string
  meal: string
  baggage: string
  layoverDuration?: string
}

export interface Passenger {
  id: string
  firstName: string
  lastName: string
  title: string
  dateOfBirth: string
  passportNumber: string
  nationality: string
  frequentFlyerNumber: string
  seatPreference: string
  mealPreference: string
  specialAssistance: string
}

export const useFlightStore = defineStore('flight', () => {
  const bookingReference = ref('ABC123')
  const bookingDate = ref('2025-12-15')
  const ticketNumber = ref('016-2345678901')
  const eTicketNumber = ref('016-2345678901-02')
  const status = ref<'confirmed' | 'pending' | 'cancelled'>('confirmed')
  
  const passengers = ref<Passenger[]>([
    {
      id: '1',
      firstName: 'JAMES',
      lastName: 'WILSON',
      title: 'MR',
      dateOfBirth: '1985-06-15',
      passportNumber: 'US12345678',
      nationality: 'United States',
      frequentFlyerNumber: 'UA987654321',
      seatPreference: 'Window',
      mealPreference: 'Regular',
      specialAssistance: ''
    }
  ])
  
  const flights = ref<FlightSegment[]>([
    {
      id: '1',
      flightNumber: 'UA 857',
      airline: 'United Airlines',
      airlineLogo: '',
      aircraft: 'Boeing 777-300ER',
      departureAirport: 'SFO',
      departureCity: 'San Francisco',
      departureTime: '10:30',
      departureDate: '2026-02-15',
      departureTerminal: 'Terminal 3',
      departureGate: 'G92',
      arrivalAirport: 'NRT',
      arrivalCity: 'Tokyo Narita',
      arrivalTime: '14:45',
      arrivalDate: '2026-02-16',
      arrivalTerminal: 'Terminal 1',
      duration: '11h 15m',
      class: 'business',
      status: 'confirmed',
      seatNumber: '5A',
      meal: 'Asian Vegetarian',
      baggage: '2 x 32kg',
      layoverDuration: ''
    },
    {
      id: '2',
      flightNumber: 'NH 211',
      airline: 'All Nippon Airways',
      airlineLogo: '',
      aircraft: 'Boeing 787-9',
      departureAirport: 'NRT',
      departureCity: 'Tokyo Narita',
      departureTime: '17:30',
      departureDate: '2026-02-16',
      departureTerminal: 'Terminal 1',
      departureGate: 'Gate 42',
      arrivalAirport: 'SIN',
      arrivalCity: 'Singapore',
      arrivalTime: '23:55',
      arrivalDate: '2026-02-16',
      arrivalTerminal: 'Terminal 2',
      duration: '7h 25m',
      class: 'business',
      status: 'confirmed',
      seatNumber: '8K',
      meal: 'Regular',
      baggage: '2 x 32kg',
      layoverDuration: '2h 45m'
    }
  ])
  
  const contactInfo = ref({
    email: 'james.wilson@email.com',
    phone: '+1 (555) 123-4567',
    emergencyContact: 'Mary Wilson',
    emergencyPhone: '+1 (555) 987-6543'
  })
  
  const paymentInfo = ref({
    totalAmount: 4250.00,
    currency: 'USD',
    paymentMethod: 'Visa ****4567',
    paymentDate: '2025-12-15',
    paymentStatus: 'Paid',
    // 税费相关
    baseFare: 3500.00,
    taxes: 450.00,
    serviceFee: 150.00,
    surcharge: 150.00
  })
  
  // 支付完成信息
  const paymentCompleted = ref({
    isPaid: false,
    paidDate: '',
    confirmationNumber: '',
    payerName: '',
    paidAmount: 0,
    paymentMethod: ''
  })
  
  // 完成支付
  const completePayment = (method: string, payerName: string) => {
    paymentCompleted.value = {
      isPaid: true,
      paidDate: new Date().toISOString().split('T')[0],
      confirmationNumber: generatePaymentConfirmation(),
      payerName: payerName || passengers.value[0]?.firstName + ' ' + passengers.value[0]?.lastName || 'Guest',
      paidAmount: paymentInfo.value.totalAmount,
      paymentMethod: method
    }
    paymentInfo.value.paymentStatus = 'Paid'
  }
  
  // 重置支付状态
  const resetPayment = () => {
    paymentCompleted.value = {
      isPaid: false,
      paidDate: '',
      confirmationNumber: '',
      payerName: '',
      paidAmount: 0,
      paymentMethod: ''
    }
  }
  
  // 生成支付确认号
  const generatePaymentConfirmation = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'PAY-'
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) result += '-'
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  const settings = ref({
    template: 'airline' as 'airline' | 'modern' | 'minimal' | 'detailed',
    primaryColor: '#003366',
    secondaryColor: '#0066cc',
    airlineLogo: '',
    showBarcode: true,
    showQRCode: true,
    showMap: false,
    language: 'en'
  })

  // Computed
  const totalFlightDuration = computed(() => {
    let totalMinutes = 0
    flights.value.forEach(flight => {
      const [hours, mins] = flight.duration.replace('h', '').replace('m', '').split(' ')
      totalMinutes += parseInt(hours) * 60 + parseInt(mins || '0')
    })
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hours}h ${mins}m`
  })

  const tripType = computed(() => {
    if (flights.value.length === 1) return 'One Way'
    const first = flights.value[0]
    const last = flights.value[flights.value.length - 1]
    if (first.departureAirport === last.arrivalAirport) return 'Round Trip'
    return 'Multi-City'
  })

  const departureDate = computed(() => {
    if (flights.value.length > 0) {
      return flights.value[0].departureDate
    }
    return ''
  })

  const returnDate = computed(() => {
    if (flights.value.length > 1) {
      return flights.value[flights.value.length - 1].arrivalDate
    }
    return ''
  })

  // Actions
  const addPassenger = () => {
    passengers.value.push({
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      title: 'MR',
      dateOfBirth: '',
      passportNumber: '',
      nationality: '',
      frequentFlyerNumber: '',
      seatPreference: 'Any',
      mealPreference: 'Regular',
      specialAssistance: ''
    })
  }

  const removePassenger = (id: string) => {
    passengers.value = passengers.value.filter(p => p.id !== id)
  }

  const addFlight = () => {
    flights.value.push({
      id: Date.now().toString(),
      flightNumber: '',
      airline: '',
      airlineLogo: '',
      aircraft: '',
      departureAirport: '',
      departureCity: '',
      departureTime: '',
      departureDate: '',
      departureTerminal: '',
      departureGate: '',
      arrivalAirport: '',
      arrivalCity: '',
      arrivalTime: '',
      arrivalDate: '',
      arrivalTerminal: '',
      duration: '',
      class: 'economy',
      status: 'confirmed',
      seatNumber: '',
      meal: 'Regular',
      baggage: '1 x 23kg'
    })
  }

  const removeFlight = (id: string) => {
    flights.value = flights.value.filter(f => f.id !== id)
  }

  const generateBookingRef = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let ref = ''
    for (let i = 0; i < 6; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    bookingReference.value = ref
  }

  const formatCurrency = (amount: number) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CNY: '¥',
      JPY: '¥',
      SGD: 'S$'
    }
    return `${symbols[paymentInfo.value.currency] || paymentInfo.value.currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  // 设计设置
  const designSettings = ref({
    watermarkEnabled: false,
    watermarkText: 'E-TICKET',
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
    customQRImage: '',
    barcodeContent: ''
  })

  return {
    bookingReference,
    bookingDate,
    ticketNumber,
    eTicketNumber,
    status,
    passengers,
    flights,
    contactInfo,
    paymentInfo,
    paymentCompleted,
    settings,
    totalFlightDuration,
    tripType,
    departureDate,
    returnDate,
    designSettings,
    barcodeSettings,
    addPassenger,
    removePassenger,
    addFlight,
    removeFlight,
    generateBookingRef,
    formatCurrency,
    completePayment,
    resetPayment,
    generatePaymentConfirmation
  }
})
