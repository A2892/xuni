<template>
  <div class="flight-preview" :class="[store.settings.template, `size-${previewSize}`]">
    <!-- 支付完成后显示收据 -->
    <div v-if="store.paymentCompleted.isPaid" class="payment-receipt" :style="itineraryStyle">
      <div class="receipt-letterhead">
        <div class="airline-brand">
          <div class="airline-logo" v-if="store.settings.airlineLogo && store.settings.airlineLogo.trim()">
            <img :src="store.settings.airlineLogo" alt="Airline" @error="($event.target as HTMLImageElement).parentElement!.style.display = 'none'" />
          </div>
          <div class="airline-info">
            <h1>{{ store.flights[0]?.airline || 'Airline' }}</h1>
            <p class="subtitle">{{ t('eTicket') }}</p>
          </div>
        </div>
        <div class="receipt-title-block">
          <div class="paid-badge">✓ PAID</div>
          <h2>PAYMENT RECEIPT</h2>
        </div>
      </div>
      
      <div class="receipt-confirmation">
        <span class="conf-label">Confirmation Number</span>
        <span class="conf-number">{{ store.paymentCompleted.confirmationNumber }}</span>
      </div>
      
      <div class="receipt-details-grid">
        <div class="detail-section">
          <h3>Booking Information</h3>
          <div class="detail-row">
            <span class="label">Booking Reference</span>
            <span class="value">{{ store.bookingReference }}</span>
          </div>
          <div class="detail-row">
            <span class="label">E-Ticket Number</span>
            <span class="value">{{ store.eTicketNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Passengers</span>
            <span class="value">{{ store.passengers.map(p => `${p.title} ${p.lastName}/${p.firstName}`).join(', ') }}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>Payment Details</h3>
          <div class="detail-row">
            <span class="label">Payment Date</span>
            <span class="value">{{ formatDate(store.paymentCompleted.paidDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Payment Method</span>
            <span class="value">{{ getPaymentMethodLabel(store.paymentCompleted.paymentMethod) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Paid By</span>
            <span class="value">{{ store.paymentCompleted.payerName }}</span>
          </div>
        </div>
      </div>
      
      <div class="receipt-flight-summary">
        <h3>Flight Summary</h3>
        <div v-for="(flight, index) in store.flights" :key="index" class="flight-summary-item">
          <div class="flight-route">
            <span class="flight-num">{{ flight.flightNumber }}</span>
            <span class="route">{{ flight.departureCity }} ({{ flight.departureAirport }}) → {{ flight.arrivalCity }} ({{ flight.arrivalAirport }})</span>
          </div>
          <div class="flight-date">{{ formatDate(flight.departureDate) }} {{ flight.departureTime }}</div>
        </div>
      </div>
      
      <div class="receipt-amount-box">
        <div class="amount-row">
          <span>Base Fare</span>
          <span>{{ store.formatCurrency(store.paymentInfo.baseFare) }}</span>
        </div>
        <div class="amount-row">
          <span>Taxes & Fees</span>
          <span>{{ store.formatCurrency(store.paymentInfo.taxes) }}</span>
        </div>
        <div class="amount-row">
          <span>Service Fee</span>
          <span>{{ store.formatCurrency(store.paymentInfo.serviceFee) }}</span>
        </div>
        <div class="amount-row">
          <span>Fuel Surcharge</span>
          <span>{{ store.formatCurrency(store.paymentInfo.surcharge) }}</span>
        </div>
        <div class="amount-row total">
          <span>Total Amount Paid</span>
          <span class="paid-amount">{{ store.formatCurrency(store.paymentCompleted.paidAmount) }}</span>
        </div>
      </div>
      
      <div class="receipt-footer">
        <p class="thank-you">Thank you for choosing {{ store.flights[0]?.airline }}!</p>
        <p class="footer-info">This is your official payment receipt. Please keep for your records.</p>
        <p class="footer-note">For assistance, contact us at {{ store.contactInfo.email }}</p>
      </div>
    </div>
    
    <!-- 未支付时显示行程单 -->
    <div v-else class="itinerary" :style="itineraryStyle">
      <!-- 水印 -->
      <div v-if="store.designSettings.watermarkEnabled" class="watermark-layer">
        <span 
          class="watermark-text"
          :style="{
            color: store.designSettings.watermarkColor,
            opacity: store.designSettings.watermarkOpacity / 100,
            fontSize: store.designSettings.watermarkSize + 'px',
            transform: `rotate(${store.designSettings.watermarkAngle}deg)`,
            fontFamily: store.designSettings.watermarkFontFamily
          }"
        >{{ store.designSettings.watermarkText || 'E-TICKET' }}</span>
      </div>
      <!-- Header -->
      <div class="header">
        <div class="airline-brand">
          <div class="airline-logo" v-if="store.settings.airlineLogo && store.settings.airlineLogo.trim()">
            <img :src="store.settings.airlineLogo" alt="Airline" @error="($event.target as HTMLImageElement).parentElement!.style.display = 'none'" />
          </div>
          <div class="airline-info">
            <h1>{{ store.flights[0]?.airline || 'Airline' }}</h1>
            <p class="subtitle">{{ t('eTicket') }}</p>
          </div>
        </div>
        <div class="booking-reference">
          <span class="ref-label">{{ t('bookingRef') }}</span>
          <span class="ref-code">{{ store.bookingReference }}</span>
          <span class="status-badge" :class="store.status">{{ statusLabels[store.status] }}</span>
        </div>
      </div>

      <!-- Passenger Section -->
      <div class="section passenger-section">
        <div class="section-title">
          <span class="title-icon"><SvgIcon name="user" :size="16" /></span>
          <h2>{{ t('passengerDetails') }}</h2>
        </div>
        <div class="passengers-grid">
          <div v-for="(passenger, index) in store.passengers" :key="index" class="passenger-card">
            <div class="passenger-main">
              <span class="passenger-number">{{ index + 1 }}</span>
              <div class="passenger-name">
                <span class="title">{{ passenger.title }}</span>
                <span class="name">{{ passenger.lastName }}/{{ passenger.firstName }}</span>
              </div>
            </div>
            <div class="passenger-details">
              <div class="detail-item">
                <span class="label">{{ t('passport') }}</span>
                <span class="value">{{ passenger.passportNumber || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">{{ t('nationality') }}</span>
                <span class="value">{{ passenger.nationality || '—' }}</span>
              </div>
              <div class="detail-item" v-if="passenger.frequentFlyerNumber">
                <span class="label">{{ t('ffn') }}</span>
                <span class="value">{{ passenger.frequentFlyerNumber }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Flight Segments -->
      <div class="section flights-section">
        <div class="section-title">
          <span class="title-icon"><SvgIcon name="plane" :size="16" /></span>
          <h2>{{ t('flightItinerary') }}</h2>
          <span class="trip-type">{{ store.tripType }}</span>
        </div>
        
        <div v-for="(flight, index) in store.flights" :key="index" class="flight-segment">
          <div class="segment-header">
            <div class="flight-info">
              <span class="flight-number">{{ flight.flightNumber }}</span>
              <span class="separator">·</span>
              <span class="airline-name">{{ flight.airline }}</span>
              <span class="separator">·</span>
              <span class="aircraft">{{ flight.aircraft }}</span>
            </div>
            <div class="flight-class">
              <span class="class-badge" :class="flight.class">{{ classLabels[flight.class] }}</span>
            </div>
          </div>
          
          <div class="route-display">
            <div class="departure">
              <span class="time">{{ flight.departureTime || '00:00' }}</span>
              <span class="date">{{ formatDate(flight.departureDate) }}</span>
              <span class="city">{{ flight.departureCity }}</span>
              <span class="airport-code">{{ flight.departureAirport }}</span>
              <span class="terminal">{{ flight.departureTerminal || '' }}</span>
            </div>
            
            <div class="route-visual">
              <div class="route-line">
                <div class="dot start"></div>
                <div class="line"></div>
                <div class="plane-icon">✈</div>
                <div class="line"></div>
                <div class="dot end"></div>
              </div>
              <span class="duration">{{ flight.duration || '—' }}</span>
            </div>
            
            <div class="arrival">
              <span class="time">{{ flight.arrivalTime || '00:00' }}</span>
              <span class="date">{{ formatDate(flight.arrivalDate) }}</span>
              <span class="city">{{ flight.arrivalCity }}</span>
              <span class="airport-code">{{ flight.arrivalAirport }}</span>
              <span class="terminal">{{ flight.arrivalTerminal || '' }}</span>
            </div>
          </div>
          
          <div class="segment-footer">
            <div class="footer-item" v-if="flight.seatNumber">
              <span class="footer-label">{{ t('seat') }}</span>
              <span class="footer-value">{{ flight.seatNumber }}</span>
            </div>
            <div class="footer-item" v-if="flight.baggage">
              <span class="footer-label">{{ t('baggage') }}</span>
              <span class="footer-value">{{ flight.baggage }}</span>
            </div>
            <div class="footer-item" v-if="flight.meal">
              <span class="footer-label">{{ t('meal') }}</span>
              <span class="footer-value">{{ flight.meal }}</span>
            </div>
            <div class="footer-item" v-if="flight.departureGate">
              <span class="footer-label">{{ t('gate') }}</span>
              <span class="footer-value">{{ flight.departureGate }}</span>
            </div>
          </div>
          
          <div v-if="flight.layoverDuration && index < store.flights.length - 1" class="layover-notice">
            <span class="layover-icon"><SvgIcon name="clock" :size="12" /></span>
            <span>{{ t('layover') }}: {{ flight.layoverDuration }} in {{ flight.arrivalCity }}</span>
          </div>
        </div>
      </div>

      <!-- Payment & Contact -->
      <div class="section info-grid">
        <div class="info-card contact-card">
          <h3><SvgIcon name="phone" :size="14" /> {{ t('contactInfo') }}</h3>
          <div class="info-rows">
            <div class="info-row">
              <span class="info-label">{{ t('phone') }}</span>
              <span class="info-value">{{ store.contactInfo.phone }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('email') }}</span>
              <span class="info-value">{{ store.contactInfo.email }}</span>
            </div>
            <div class="info-row" v-if="store.contactInfo.emergencyContact">
              <span class="info-label">{{ t('emergency') }}</span>
              <span class="info-value">{{ store.contactInfo.emergencyContact }} ({{ store.contactInfo.emergencyPhone }})</span>
            </div>
          </div>
        </div>
        
        <div class="info-card payment-card">
          <h3><SvgIcon name="receipt" :size="14" /> {{ t('paymentSummary') }}</h3>
          <div class="info-rows">
            <div class="info-row">
              <span class="info-label">{{ t('method') }}</span>
              <span class="info-value">{{ store.paymentInfo.paymentMethod }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('date') }}</span>
              <span class="info-value">{{ store.paymentInfo.paymentDate }}</span>
            </div>
            <div class="info-row total">
              <span class="info-label">{{ t('totalPaid') }}</span>
              <span class="info-value">{{ store.formatCurrency(store.paymentInfo.totalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ticket Numbers -->
      <div class="section ticket-section">
        <div class="ticket-info">
          <div class="ticket-item">
            <span class="ticket-label">{{ t('ticketNumber') }}</span>
            <span class="ticket-value">{{ store.ticketNumber }}</span>
          </div>
          <div class="ticket-item">
            <span class="ticket-label">{{ t('eTicketNum') }}</span>
            <span class="ticket-value">{{ store.eTicketNumber }}</span>
          </div>
          <div class="ticket-item">
            <span class="ticket-label">{{ t('issueDate') }}</span>
            <span class="ticket-value">{{ store.bookingDate }}</span>
          </div>
        </div>
      </div>

      <!-- Codes Section -->
      <div v-if="store.settings.showBarcode || store.settings.showQRCode" class="section codes-section">
        <div v-if="store.settings.showBarcode" class="barcode-container">
          <!-- 自定义条形码图片 -->
          <template v-if="store.barcodeSettings.useCustomBarcode && store.barcodeSettings.customBarcodeImage">
            <img :src="store.barcodeSettings.customBarcodeImage" class="custom-barcode-img" alt="Barcode" />
          </template>
          <!-- 默认条形码 -->
          <template v-else>
            <div class="barcode">
              <div v-for="i in 50" :key="i" class="bar" :style="{ width: `${Math.random() * 2.5 + 1}px` }"></div>
            </div>
          </template>
          <span class="barcode-text">{{ store.barcodeSettings.barcodeContent || store.bookingReference }}</span>
        </div>
        <div v-if="store.settings.showQRCode" class="qr-container">
          <!-- 自定义二维码图片 -->
          <template v-if="store.barcodeSettings.useCustomBarcode && store.barcodeSettings.customQRImage">
            <img :src="store.barcodeSettings.customQRImage" class="custom-qr-img" alt="QR Code" />
          </template>
          <!-- 真实二维码 -->
          <template v-else>
            <img :src="qrCodeUrl" class="real-qr-img" alt="QR Code" />
          </template>
          <span class="qr-text">{{ t('scanMobile') }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-notice">
          <p class="main-notice">{{ t('arrivalNotice') }}</p>
          <p class="sub-notice">{{ t('notBoardingPass') }}</p>
        </div>
        <div class="footer-bottom">
          <span>{{ t('generatedOn') }} {{ new Date().toLocaleDateString(store.settings.language === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
          <span>{{ store.flights[0]?.airline }} - {{ t('journeyBegins') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFlightStore } from '@/stores/flight'
import SvgIcon from '@/components/icons/SvgIcons.vue'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useFlightStore()

// 计算行程单样式
const itineraryStyle = computed(() => ({
  '--primary': store.settings.primaryColor,
  '--secondary': store.settings.secondaryColor,
  fontFamily: store.designSettings.fontFamily,
  color: store.designSettings.textColor,
  border: store.designSettings.borderEnabled 
    ? `${store.designSettings.borderWidth}px ${store.designSettings.borderStyle} ${store.designSettings.borderColor}` 
    : '1px solid #e2e8f0'
}))

const segmentHeaderBackground = computed(() => {
  const primary = store.settings.primaryColor || '#003366'
  const secondary = store.settings.secondaryColor || '#0055a4'
  return `linear-gradient(90deg, ${primary}, ${secondary})`
})

// 多语言翻译
const translations = {
  en: {
    eTicket: 'Electronic Ticket Itinerary / Receipt',
    bookingRef: 'Booking Reference',
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    passengerDetails: 'Passenger Details',
    passport: 'Passport',
    nationality: 'Nationality',
    ffn: 'FFN',
    flightItinerary: 'Flight Itinerary',
    economy: 'Economy',
    premiumEconomy: 'Premium Economy',
    business: 'Business',
    firstClass: 'First Class',
    seat: 'Seat',
    baggage: 'Baggage',
    meal: 'Meal',
    gate: 'Gate',
    layover: 'Layover',
    contactInfo: 'Contact Information',
    phone: 'Phone',
    email: 'Email',
    emergency: 'Emergency',
    paymentSummary: 'Payment Summary',
    method: 'Method',
    date: 'Date',
    totalPaid: 'Total Paid',
    ticketNumber: 'Ticket Number',
    eTicketNum: 'E-Ticket',
    issueDate: 'Issue Date',
    scanMobile: 'Scan for mobile boarding pass',
    arrivalNotice: 'Please arrive at the airport at least 2 hours before departure for domestic flights and 3 hours for international flights.',
    notBoardingPass: 'This itinerary receipt is not a boarding pass. Please check in online or at the airport to receive your boarding pass.',
    generatedOn: 'Generated on',
    journeyBegins: 'Your journey begins with us'
  },
  zh: {
    eTicket: '电子客票行程单 / 收据',
    bookingRef: '预订编号',
    confirmed: '已确认',
    pending: '待处理',
    cancelled: '已取消',
    passengerDetails: '旅客信息',
    passport: '护照',
    nationality: '国籍',
    ffn: '常旅客号',
    flightItinerary: '航班行程',
    economy: '经济舱',
    premiumEconomy: '超级经济舱',
    business: '商务舱',
    firstClass: '头等舱',
    seat: '座位',
    baggage: '行李',
    meal: '餐食',
    gate: '登机口',
    layover: '中转',
    contactInfo: '联系信息',
    phone: '电话',
    email: '邮箱',
    emergency: '紧急联系人',
    paymentSummary: '付款信息',
    method: '付款方式',
    date: '日期',
    totalPaid: '已付金额',
    ticketNumber: '票号',
    eTicketNum: '电子票号',
    issueDate: '出票日期',
    scanMobile: '扫码获取电子登机牌',
    arrivalNotice: '国内航班请提前2小时到达机场，国际航班请提前3小时到达机场。',
    notBoardingPass: '此行程单不能作为登机凭证，请通过网上值机或机场值机获取登机牌。',
    generatedOn: '生成日期',
    journeyBegins: '愿您旅途愉快'
  }
}

const t = (key: keyof typeof translations.en) => {
  const lang = store.settings.language as keyof typeof translations
  return translations[lang]?.[key] || translations.en[key]
}

const statusLabels = computed(() => ({
  confirmed: t('confirmed'),
  pending: t('pending'),
  cancelled: t('cancelled')
}))

const classLabels = computed(() => ({
  economy: t('economy'),
  'premium-economy': t('premiumEconomy'),
  business: t('business'),
  first: t('firstClass')
}))

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const locale = store.settings.language === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })
}

const getPaymentMethodLabel = (method: string) => {
  const methods: Record<string, string> = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    alipay: 'Alipay',
    wechat: 'WeChat Pay',
    bank_transfer: 'Bank Transfer'
  }
  return methods[method] || method
}

// 生成真实二维码 URL
const qrCodeUrl = computed(() => {
  const flightData = {
    type: 'flight_itinerary',
    bookingRef: store.bookingReference,
    ticketNumber: store.ticketNumber,
    passenger: store.passengers[0]?.lastName + '/' + store.passengers[0]?.firstName,
    flights: store.flights.map(f => ({
      flight: f.flightNumber,
      route: `${f.departureAirport}-${f.arrivalAirport}`,
      date: f.departureDate
    }))
  }
  const qrContent = `${window.location.origin}/flight?booking=${encodeURIComponent(JSON.stringify(flightData))}`
  const params = new URLSearchParams({
    data: qrContent,
    size: '80x80',
    ecc: 'M'
  })
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
})
</script>

<style scoped>
.flight-preview { width: 100%; display: flex; justify-content: center; padding: 16px; }
.itinerary { width: 620px; background: white; font-family: 'Segoe UI', -apple-system, sans-serif; box-shadow: 0 1px 10px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; font-size: 12px; color: #1e293b; position: relative; overflow: hidden; }

/* 水印 */
.watermark-layer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 10; }
.watermark-text { font-weight: bold; white-space: nowrap; text-transform: uppercase; letter-spacing: 4px; }

/* 自定义条形码/二维码图片 */
.custom-barcode-img { max-width: 200px; max-height: 60px; object-fit: contain; }
.custom-qr-img { width: 80px; height: 80px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 4px; }
.real-qr-img { width: 80px; height: 80px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 4px; background: white; }

/* Header */
.header { display: flex; justify-content: space-between; align-items: center; padding: 24px 28px; background: linear-gradient(135deg, var(--primary, #003366), var(--secondary, #0055a4)); color: white; }
.airline-brand { display: flex; align-items: center; gap: 14px; }
.airline-logo { width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.airline-logo img { width: 100%; height: 100%; object-fit: contain; }
.logo-text { font-size: 18px; font-weight: 700; }
.airline-info h1 { margin: 0; font-size: 18px; font-weight: 600; }
.airline-info .subtitle { margin: 2px 0 0; font-size: 10px; opacity: 0.85; letter-spacing: 0.3px; }
.booking-reference { text-align: right; }
.ref-label { display: block; font-size: 10px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.3px; }
.ref-code { display: block; font-size: 22px; font-weight: 700; letter-spacing: 2px; font-family: 'SF Mono', 'Courier New', monospace; margin: 2px 0 6px; }
.status-badge { display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 10px; font-weight: 500; background: rgba(255,255,255,0.2); }
.status-badge.confirmed { background: #22c55e; }
.status-badge.pending { background: #f59e0b; }
.status-badge.cancelled { background: #ef4444; }

/* Section */
.section { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; }
.section:last-child { border-bottom: none; }
.section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.title-icon { font-size: 14px; }
.section-title h2 { margin: 0; font-size: 12px; font-weight: 600; color: #334155; text-transform: uppercase; letter-spacing: 0.3px; }
.trip-type { margin-left: auto; font-size: 10px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 8px; }

/* Passengers */
.passengers-grid { display: flex; flex-direction: column; gap: 10px; }
.passenger-card { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: #f8fafc; border-radius: 6px; border-left: 3px solid var(--primary, #003366); }
.passenger-main { display: flex; align-items: center; gap: 12px; }
.passenger-number { width: 22px; height: 22px; background: var(--primary, #003366); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; }
.passenger-name .title { font-size: 10px; color: #64748b; margin-right: 4px; }
.passenger-name .name { font-size: 14px; font-weight: 600; color: #0f172a; }
.passenger-details { display: flex; gap: 16px; }
.detail-item { display: flex; flex-direction: column; }
.detail-item .label { font-size: 9px; color: #94a3b8; text-transform: uppercase; }
.detail-item .value { font-size: 11px; color: #334155; font-weight: 500; }

/* Flight Segment */
.flight-segment { background: #f8fafc; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
.flight-segment:last-child { margin-bottom: 0; }
.segment-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: v-bind(segmentHeaderBackground); color: white; }
.flight-info { display: flex; align-items: center; gap: 6px; font-size: 11px; }
.flight-number { font-weight: 700; font-size: 13px; }
.separator { opacity: 0.5; }
.airline-name, .aircraft { opacity: 0.9; }
.class-badge { padding: 3px 10px; background: rgba(255,255,255,0.2); border-radius: 10px; font-size: 10px; font-weight: 500; }
.class-badge.business { background: #a855f7; }
.class-badge.first { background: #f59e0b; }

.route-display { display: flex; justify-content: space-between; align-items: center; padding: 20px 14px; }
.departure, .arrival { flex: 0 0 140px; }
.arrival { text-align: right; }
.departure .time, .arrival .time { display: block; font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1; }
.departure .date, .arrival .date { display: block; font-size: 11px; color: #64748b; margin: 4px 0; }
.departure .city, .arrival .city { display: block; font-size: 13px; font-weight: 600; color: #334155; }
.departure .airport-code, .arrival .airport-code { display: block; font-size: 18px; font-weight: 700; color: var(--primary, #003366); margin-top: 2px; }
.departure .terminal, .arrival .terminal { display: block; font-size: 10px; color: #94a3b8; }

.route-visual { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 0 16px; }
.route-line { display: flex; align-items: center; width: 100%; }
.dot { width: 8px; height: 8px; border-radius: 50%; border: 2px solid var(--primary, #003366); background: white; }
.dot.end { background: var(--primary, #003366); }
.line { flex: 1; height: 2px; background: linear-gradient(90deg, var(--primary, #003366), #94a3b8, var(--primary, #003366)); }
.plane-icon { font-size: 16px; margin: 0 6px; color: var(--primary, #003366); }
.duration { font-size: 11px; color: #64748b; margin-top: 6px; background: white; padding: 2px 8px; border-radius: 8px; }

.segment-footer { display: flex; gap: 16px; padding: 10px 14px; background: white; border-top: 1px dashed #e2e8f0; }
.footer-item { display: flex; flex-direction: column; }
.footer-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; }
.footer-value { font-size: 11px; font-weight: 600; color: #334155; }

.layover-notice { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #fef3c7; font-size: 11px; color: #92400e; }
.layover-icon { font-size: 12px; }

/* Info Grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-card { background: #f8fafc; border-radius: 6px; padding: 14px; }
.info-card h3 { margin: 0 0 10px; font-size: 11px; color: #334155; }
.info-rows { display: flex; flex-direction: column; gap: 6px; }
.info-row { display: flex; justify-content: space-between; }
.info-row.total { padding-top: 8px; margin-top: 4px; border-top: 1px solid #e2e8f0; }
.info-label { font-size: 11px; color: #64748b; }
.info-value { font-size: 11px; font-weight: 500; color: #334155; }
.info-row.total .info-value { font-size: 14px; font-weight: 700; color: var(--primary, #003366); }

/* Ticket Section */
.ticket-section { background: #f8fafc; }
.ticket-info { display: flex; justify-content: space-around; }
.ticket-item { text-align: center; }
.ticket-label { display: block; font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; }
.ticket-value { display: block; font-size: 12px; font-weight: 600; color: #334155; font-family: 'SF Mono', 'Courier New', monospace; margin-top: 2px; }

/* Codes Section */
.codes-section { display: flex; justify-content: center; gap: 40px; align-items: center; }
.barcode-container, .qr-container { text-align: center; }
.barcode { display: flex; align-items: flex-end; height: 36px; gap: 1px; }
.bar { background: #1e293b; height: 100%; }
.barcode-text { display: block; font-size: 10px; color: #64748b; font-family: 'SF Mono', 'Courier New', monospace; margin-top: 4px; }
.qr-code { width: 64px; height: 64px; display: grid; grid-template-columns: repeat(8, 1fr); gap: 1px; background: white; padding: 4px; border: 1px solid #e2e8f0; }
.qr-cell { background: #f1f5f9; }
.qr-cell.filled { background: #1e293b; }
.qr-text { display: block; font-size: 9px; color: #94a3b8; margin-top: 4px; }

/* Footer */
.footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
.footer-notice { margin-bottom: 12px; }
.main-notice { margin: 0 0 4px; font-size: 11px; color: #334155; }
.sub-notice { margin: 0; font-size: 10px; color: #64748b; }
.footer-bottom { display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; padding-top: 10px; border-top: 1px solid #e2e8f0; }

/* Template: Minimal */
.flight-preview.minimal .itinerary { box-shadow: none; }
.flight-preview.minimal .header { background: white; color: #1e293b; border-bottom: 3px solid var(--primary, #003366); }
.flight-preview.minimal .ref-code { color: var(--primary, #003366); }
.flight-preview.minimal .status-badge { color: white; }

/* Template: Modern */
.flight-preview.modern .header { background: linear-gradient(135deg, #1e293b, #334155); }
.flight-preview.modern .segment-header { background: linear-gradient(90deg, #1e293b, #475569); }

/* Payment Receipt Styles */
.payment-receipt { width: 620px; background: white; font-family: 'Segoe UI', -apple-system, sans-serif; box-shadow: 0 1px 10px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; font-size: 12px; color: #1e293b; }
.receipt-letterhead { display: flex; justify-content: space-between; align-items: center; padding: 24px 28px; background: linear-gradient(135deg, var(--primary, #003366), var(--secondary, #0055a4)); color: white; }
.receipt-title-block { text-align: right; }
.receipt-title-block .paid-badge { background: #22c55e; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 8px; }
.receipt-title-block h2 { margin: 0; font-size: 16px; font-weight: 600; opacity: 0.95; }

.receipt-confirmation { background: #f0fdf4; padding: 20px; text-align: center; border-bottom: 1px solid #dcfce7; }
.receipt-confirmation .conf-label { display: block; font-size: 11px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.receipt-confirmation .conf-number { font-size: 20px; font-weight: 700; color: #15803d; font-family: 'SF Mono', 'Courier New', monospace; letter-spacing: 1px; }

.receipt-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #f1f5f9; }
.receipt-details-grid .detail-section { background: white; padding: 20px; }
.receipt-details-grid h3 { margin: 0 0 14px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.receipt-details-grid .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f8fafc; font-size: 12px; }
.receipt-details-grid .detail-row:last-child { border-bottom: none; }
.receipt-details-grid .detail-row .label { color: #64748b; }
.receipt-details-grid .detail-row .value { color: #1e293b; font-weight: 500; text-align: right; max-width: 60%; }

.receipt-flight-summary { padding: 20px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.receipt-flight-summary h3 { margin: 0 0 14px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; }
.flight-summary-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: white; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid var(--primary, #003366); }
.flight-summary-item:last-child { margin-bottom: 0; }
.flight-route { display: flex; flex-direction: column; gap: 2px; }
.flight-route .flight-num { font-weight: 600; color: var(--primary, #003366); font-size: 13px; }
.flight-route .route { font-size: 12px; color: #64748b; }
.flight-date { font-size: 11px; color: #94a3b8; text-align: right; }

.receipt-amount-box { padding: 20px 24px; background: white; }
.receipt-amount-box .amount-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9; }
.receipt-amount-box .amount-row:last-child { border-bottom: none; }
.receipt-amount-box .amount-row.total { color: #1e293b; font-weight: 600; border-top: 2px solid #e2e8f0; margin-top: 8px; padding-top: 16px; font-size: 15px; }
.receipt-amount-box .paid-amount { color: #22c55e; font-weight: 700; font-size: 18px; }

.receipt-footer { padding: 20px 24px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
.receipt-footer .thank-you { font-size: 14px; font-weight: 600; color: var(--primary, #003366); margin: 0 0 8px 0; }
.receipt-footer .footer-info { font-size: 11px; color: #64748b; margin: 0 0 4px 0; }
.receipt-footer .footer-note { font-size: 10px; color: #94a3b8; margin: 0; }

/* ==================== 响应式预览尺寸 ==================== */

/* 手机尺寸 - 375px */
.flight-preview.size-mobile .itinerary,
.flight-preview.size-mobile .payment-receipt {
  width: 375px;
  font-size: 11px;
}

.size-mobile .header {
  padding: 14px 16px;
  flex-direction: column;
  gap: 10px;
}

.size-mobile .airline-brand {
  gap: 10px;
}

.size-mobile .airline-logo {
  width: 36px;
  height: 36px;
}

.size-mobile .airline-logo img {
  max-height: 32px;
}

.size-mobile .logo-text {
  font-size: 14px;
}

.size-mobile .airline-info h1 {
  font-size: 16px;
}

.size-mobile .airline-info .subtitle {
  font-size: 9px;
}

.size-mobile .booking-reference {
  text-align: left;
  width: 100%;
}

.size-mobile .ref-label {
  font-size: 9px;
}

.size-mobile .ref-code {
  font-size: 18px;
  letter-spacing: 2px;
}

.size-mobile .status-badge {
  padding: 3px 10px;
  font-size: 9px;
}

.size-mobile .section {
  padding: 12px 16px;
}

.size-mobile .section-title h2 {
  font-size: 11px;
}

.size-mobile .passengers-grid {
  gap: 8px;
}

.size-mobile .passenger-card {
  flex-direction: column;
  padding: 10px;
}

.size-mobile .passenger-main {
  gap: 8px;
  margin-bottom: 8px;
}

.size-mobile .passenger-number {
  width: 24px;
  height: 24px;
  font-size: 11px;
}

.size-mobile .passenger-name .name {
  font-size: 14px;
}

.size-mobile .passenger-details {
  flex-direction: column;
  gap: 4px;
}

.size-mobile .detail-item {
  font-size: 10px;
}

/* 手机尺寸航班段 */
.size-mobile .segment-header {
  padding: 8px 12px;
}

.size-mobile .segment-header .segment-number {
  font-size: 10px;
}

.size-mobile .flight-card {
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.size-mobile .airport-info {
  text-align: center;
}

.size-mobile .airport-code {
  font-size: 24px;
}

.size-mobile .airport-city {
  font-size: 12px;
}

.size-mobile .airport-name {
  font-size: 9px;
}

.size-mobile .datetime .date {
  font-size: 11px;
}

.size-mobile .datetime .time {
  font-size: 20px;
}

.size-mobile .flight-path {
  flex-direction: column;
  gap: 8px;
  padding: 10px 0;
  align-items: center;
}

.size-mobile .path-line {
  width: 2px;
  height: 30px;
  margin: 0 auto;
  background: #ddd;
  border: none;
}

.size-mobile .flight-info {
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.size-mobile .flight-number {
  font-size: 12px;
  padding: 4px 10px;
}

.size-mobile .duration {
  font-size: 10px;
}

.size-mobile .aircraft {
  font-size: 9px;
}

.size-mobile .ticket-details {
  flex-direction: column;
  gap: 8px;
}

.size-mobile .ticket-info {
  justify-content: space-around;
}

.size-mobile .ticket-label {
  font-size: 8px;
}

.size-mobile .ticket-value {
  font-size: 11px;
}

.size-mobile .codes-section {
  gap: 20px;
}

.size-mobile .barcode {
  height: 28px;
}

.size-mobile .qr-code {
  width: 50px;
  height: 50px;
}

.size-mobile .footer {
  padding: 12px 16px;
}

.size-mobile .main-notice {
  font-size: 10px;
}

.size-mobile .sub-notice {
  font-size: 9px;
}

/* 手机尺寸收据 */
.size-mobile .receipt-letterhead {
  padding: 16px;
  flex-direction: column;
  gap: 12px;
}

.size-mobile .receipt-title-block {
  text-align: center;
}

.size-mobile .receipt-title-block h2 {
  font-size: 14px;
}

.size-mobile .receipt-confirmation {
  padding: 14px;
}

.size-mobile .receipt-confirmation .conf-number {
  font-size: 18px;
}

.size-mobile .receipt-details-grid {
  grid-template-columns: 1fr;
}

.size-mobile .receipt-details-grid .detail-section {
  padding: 14px;
}

.size-mobile .receipt-details-grid h3 {
  font-size: 10px;
}

.size-mobile .receipt-details-grid .detail-row {
  font-size: 11px;
}

.size-mobile .receipt-flight-summary {
  padding: 14px 16px;
}

.size-mobile .flight-summary-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 8px 12px;
}

.size-mobile .flight-route {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.size-mobile .flight-route .flight-num {
  font-size: 12px;
  font-weight: 600;
}

.size-mobile .flight-route .route {
  font-size: 11px;
  white-space: normal;
  line-height: 1.4;
}

.size-mobile .flight-date {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.size-mobile .receipt-amount-box {
  padding: 14px 16px;
}

.size-mobile .receipt-amount-box .amount-row {
  font-size: 12px;
}

.size-mobile .receipt-amount-box .amount-row.total {
  font-size: 14px;
}

.size-mobile .receipt-amount-box .paid-amount {
  font-size: 16px;
}

.size-mobile .receipt-footer {
  padding: 14px 16px;
}

.size-mobile .receipt-footer .thank-you {
  font-size: 13px;
}

/* 电脑尺寸 - 900px */
.flight-preview.size-desktop .itinerary,
.flight-preview.size-desktop .payment-receipt {
  width: 900px;
  font-size: 13px;
}

.size-desktop .header {
  padding: 24px 32px;
}

.size-desktop .airline-logo {
  width: 56px;
  height: 56px;
}

.size-desktop .airline-info h1 {
  font-size: 26px;
}

.size-desktop .ref-code {
  font-size: 28px;
}

.size-desktop .section {
  padding: 20px 32px;
}

.size-desktop .passengers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.size-desktop .passenger-card {
  padding: 18px;
}

.size-desktop .passenger-name .name {
  font-size: 17px;
}

.size-desktop .flight-card {
  padding: 24px 32px;
}

.size-desktop .airport-code {
  font-size: 40px;
}

.size-desktop .datetime .time {
  font-size: 28px;
}

.size-desktop .ticket-info {
  gap: 24px;
}

.size-desktop .ticket-value {
  font-size: 14px;
}

.size-desktop .qr-code {
  width: 80px;
  height: 80px;
}

.size-desktop .footer {
  padding: 20px 32px;
}

.size-desktop .receipt-letterhead {
  padding: 28px 36px;
}

.size-desktop .receipt-title-block h2 {
  font-size: 18px;
}

.size-desktop .receipt-confirmation .conf-number {
  font-size: 24px;
}

.size-desktop .receipt-details-grid .detail-section {
  padding: 24px;
}

.size-desktop .receipt-details-grid .detail-row {
  font-size: 14px;
}

.size-desktop .receipt-amount-box {
  padding: 24px 32px;
}

.size-desktop .receipt-amount-box .amount-row.total {
  font-size: 18px;
}

.size-desktop .receipt-amount-box .paid-amount {
  font-size: 22px;
}

/* 原尺寸 */
.flight-preview.size-original .itinerary,
.flight-preview.size-original .payment-receipt {
  width: 620px;
}
</style>
