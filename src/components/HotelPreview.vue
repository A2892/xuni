<template>
  <div class="hotel-preview" :class="[store.settings.template, `size-${previewSize}`]" :key="isPaid ? 'paid' : 'unpaid'">
    <!-- 支付完成后显示收据 -->
    <div v-if="isPaid" class="payment-receipt" :style="bookingStyle">
      <div class="receipt-letterhead" :style="{ background: receiptHeaderBackground }">
        <div class="hotel-brand">
          <img v-if="store.settings.showLogo && store.hotel.logo" :src="store.hotel.logo" class="logo" alt="Hotel Logo" />
          <div class="hotel-details">
            <h1>{{ store.hotel.name || 'Hotel Name' }}</h1>
            <div class="stars">
              <span v-for="i in store.hotel.stars" :key="i" class="star">★</span>
            </div>
          </div>
        </div>
        <div class="receipt-title-block">
          <div class="paid-badge">✓ PAID</div>
          <h2>PAYMENT RECEIPT</h2>
        </div>
      </div>
      
      <div class="receipt-confirmation">
        <span class="conf-label">Confirmation Number</span>
        <span class="conf-number">{{ store.payment.confirmationNumber }}</span>
      </div>
      
      <div class="receipt-details-grid">
        <div class="detail-section">
          <h3>Guest Information</h3>
          <div class="detail-row">
            <span class="label">Guest Name</span>
            <span class="value">{{ store.guest.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Room Type</span>
            <span class="value">{{ store.room.type }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Check-in</span>
            <span class="value">{{ store.reservation.checkIn }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Check-out</span>
            <span class="value">{{ store.reservation.checkOut }}</span>
          </div>
        </div>
        <div class="detail-section">
          <h3>Payment Details</h3>
          <div class="detail-row">
            <span class="label">Payment Date</span>
            <span class="value">{{ store.payment.paidDate }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Payment Method</span>
            <span class="value">{{ paymentLabels[store.payment.method] }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Paid By</span>
            <span class="value">{{ store.payment.payerName }}</span>
          </div>
        </div>
      </div>
      
      <div class="receipt-reference">
        <h3>Booking Reference</h3>
        <div class="ref-grid">
          <div class="ref-item">
            <span class="label">Booking Number</span>
            <span class="value">{{ store.confirmationNumber }}</span>
          </div>
          <div class="ref-item">
            <span class="label">Nights</span>
            <span class="value">{{ store.nights }}</span>
          </div>
        </div>
      </div>
      
      <div class="receipt-amount-box">
        <div class="amount-line">
          <span class="label">Room Charges ({{ store.nights }} nights)</span>
          <span class="value">{{ store.formatCurrency(store.totalRoomCharge) }}</span>
        </div>
        <div class="amount-line">
          <span class="label">Taxes & Fees</span>
          <span class="value">{{ store.formatCurrency(store.totalFees) }}</span>
        </div>
        <div class="amount-line total">
          <span class="label">Amount Paid</span>
          <span class="value highlight">{{ store.formatCurrency(store.payment.amountPaid) }}</span>
        </div>
        <div class="amount-line balance" v-if="store.totalAmount - store.payment.amountPaid === 0">
          <span class="label">Remaining Balance</span>
          <span class="value zero">$0.00</span>
        </div>
      </div>
      
      <div class="receipt-footer">
        <p class="thank-message">Thank you for staying with us!</p>
        <p class="contact-info">{{ store.hotel.name }} · {{ store.hotel.phone }} · {{ store.hotel.website }}</p>
        <p class="legal-text">Please keep this receipt for your records. For questions, contact customer service.</p>
      </div>
    </div>
    
    <!-- 正常预订确认视图 -->
    <div v-else class="booking" :style="bookingStyle">
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
        >{{ store.designSettings.watermarkText || 'CONFIRMED' }}</span>
      </div>
      <!-- Header -->
      <div class="header">
        <div class="hotel-brand">
          <img v-if="store.settings.showLogo && store.hotel.logo" :src="store.hotel.logo" class="logo" alt="Hotel Logo" />
          <div class="hotel-info">
            <h1>{{ store.hotel.name || 'Hotel Name' }}</h1>
            <div class="stars">
              <span v-for="i in store.hotel.stars" :key="i" class="star">★</span>
              <span v-for="i in (5 - store.hotel.stars)" :key="'e'+i" class="star empty">☆</span>
            </div>
          </div>
        </div>
        <div class="confirmation-info">
          <span class="conf-label">{{ t('confirmationNumber') }}</span>
          <span class="conf-number">{{ store.confirmationNumber }}</span>
          <span class="status-badge" :class="store.payment.status">{{ statusLabels[store.payment.status] }}</span>
        </div>
      </div>

      <!-- Booking Summary -->
      <div class="summary-strip" :style="summaryStripStyle">
        <div class="summary-item">
          <span class="sum-icon"><SvgIcon name="calendar" :size="18" /></span>
          <div class="sum-content">
            <span class="sum-label">{{ t('checkIn') }}</span>
            <span class="sum-value">{{ formatDate(store.reservation.checkIn) }}</span>
            <span class="sum-time">{{ t('from') }} 14:00</span>
          </div>
        </div>
        <div class="summary-divider">
          <span class="nights-badge" :style="nightsBadgeStyle">{{ store.nights }} {{ store.nights === 1 ? t('night') : t('nights') }}</span>
        </div>
        <div class="summary-item">
          <span class="sum-icon"><SvgIcon name="calendar" :size="18" /></span>
          <div class="sum-content">
            <span class="sum-label">{{ t('checkOut') }}</span>
            <span class="sum-value">{{ formatDate(store.reservation.checkOut) }}</span>
            <span class="sum-time">{{ t('until') }} 12:00</span>
          </div>
        </div>
        <div class="summary-item guests">
          <span class="sum-icon"><SvgIcon name="users" :size="18" /></span>
          <div class="sum-content">
            <span class="sum-label">{{ t('guests') }}</span>
            <span class="sum-value">{{ store.reservation.adults }} {{ store.reservation.adults > 1 ? t('adults') : t('adult') }}{{ store.reservation.children > 0 ? `, ${store.reservation.children} ${t('child')}` : '' }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Guest Info -->
        <div class="info-panel guest-panel">
          <div class="panel-header">
            <span class="panel-icon"><SvgIcon name="user" :size="16" /></span>
            <h3>{{ t('guestDetails') }}</h3>
          </div>
          <div class="panel-content">
            <p class="guest-name">{{ store.guest.name }}</p>
            <div class="guest-details">
              <div class="detail-row" v-if="store.guest.email">
                <span class="detail-icon"><SvgIcon name="mail" :size="12" /></span>
                <span class="detail-text">{{ store.guest.email }}</span>
              </div>
              <div class="detail-row" v-if="store.guest.phone">
                <span class="detail-icon"><SvgIcon name="phone" :size="12" /></span>
                <span class="detail-text">{{ store.guest.phone }}</span>
              </div>
              <div class="detail-row" v-if="store.guest.idNumber">
                <span class="detail-icon"><SvgIcon name="id-card" :size="12" /></span>
                <span class="detail-text">{{ store.guest.idNumber }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Room Info -->
        <div class="info-panel room-panel">
          <div class="panel-header">
            <span class="panel-icon"><SvgIcon name="bed" :size="16" /></span>
            <h3>{{ t('roomDetails') }}</h3>
          </div>
          <div class="panel-content">
            <p class="room-type">{{ roomTypeLabels[store.reservation.roomType] || store.reservation.roomType }}</p>
            <div class="room-details">
              <div class="room-feature">
                <span class="feature-label">{{ t('rooms') }}</span>
                <span class="feature-value">{{ store.reservation.roomCount }}</span>
              </div>
              <div class="room-feature" v-if="store.reservation.roomNumber">
                <span class="feature-label">{{ t('roomNo') }}</span>
                <span class="feature-value">{{ store.reservation.roomNumber }}</span>
              </div>
              <div class="room-feature">
                <span class="feature-label">{{ t('breakfast') }}</span>
                <span class="feature-value" :class="{ included: store.reservation.breakfastIncluded }">
                  {{ store.reservation.breakfastIncluded ? t('included') : t('notIncluded') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Special Requests -->
      <div v-if="store.guest.specialRequests" class="special-requests">
        <div class="request-header">
          <span class="request-icon"><SvgIcon name="note" :size="14" /></span>
          <span class="request-title">{{ t('specialRequests') }}</span>
        </div>
        <p class="request-text">{{ store.guest.specialRequests }}</p>
      </div>

      <!-- Pricing Section -->
      <div class="pricing-section">
        <div class="section-header">
          <span class="section-icon"><SvgIcon name="dollar" :size="16" /></span>
          <h3>{{ t('priceSummary') }}</h3>
        </div>
        <table class="price-table">
          <tbody>
            <tr>
              <td>{{ t('roomRate') }}</td>
              <td class="rate-details">{{ store.nights }} {{ store.nights === 1 ? t('night') : t('nights') }} × {{ store.formatCurrency(store.reservation.ratePerNight) }}</td>
              <td class="amount">{{ store.formatCurrency(store.totalRoomCharge) }}</td>
            </tr>
            <tr v-if="store.taxAmount > 0" class="fee-row">
              <td>{{ t('taxes') }}</td>
              <td class="rate-details">{{ store.fees.taxRate }}%</td>
              <td class="amount">{{ store.formatCurrency(store.taxAmount) }}</td>
            </tr>
            <tr v-if="store.serviceFeeAmount > 0" class="fee-row">
              <td>{{ t('serviceFee') }}</td>
              <td class="rate-details">{{ store.fees.serviceFeeRate }}%</td>
              <td class="amount">{{ store.formatCurrency(store.serviceFeeAmount) }}</td>
            </tr>
            <tr v-if="store.cityTaxAmount > 0" class="fee-row">
              <td>{{ t('cityTax') }}</td>
              <td class="rate-details">{{ store.formatCurrency(store.fees.cityTax) }}/{{ t('night') }}</td>
              <td class="amount">{{ store.formatCurrency(store.cityTaxAmount) }}</td>
            </tr>
            <tr v-if="store.resortFeeAmount > 0" class="fee-row">
              <td>{{ t('resortFee') }}</td>
              <td class="rate-details">{{ store.formatCurrency(store.fees.resortFee) }}/{{ t('night') }}</td>
              <td class="amount">{{ store.formatCurrency(store.resortFeeAmount) }}</td>
            </tr>
            <tr v-if="store.reservation.breakfastIncluded" class="included-row">
              <td>{{ t('breakfast') }}</td>
              <td class="rate-details">{{ t('complimentary') }}</td>
              <td class="amount included">{{ t('included') }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2">{{ t('totalAmount') }}</td>
              <td class="amount total">{{ store.formatCurrency(store.totalAmount) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Payment Status -->
      <div class="payment-status">
        <div class="payment-box" :class="store.payment.status">
          <div class="payment-info">
            <span class="payment-method">{{ paymentLabels[store.payment.method] }}</span>
            <span class="payment-detail">{{ getPaymentStatusText() }}</span>
          </div>
          <div class="payment-amounts">
            <div class="amount-row">
              <span class="amount-label">{{ t('paid') }}</span>
              <span class="amount-value">{{ store.formatCurrency(store.payment.amountPaid) }}</span>
            </div>
            <div class="amount-row" v-if="store.totalAmount - store.payment.amountPaid > 0 && store.payment.status !== 'fully_paid'">
              <span class="amount-label">{{ t('balanceDue') }}</span>
              <span class="amount-value due">{{ store.formatCurrency(store.totalAmount - store.payment.amountPaid) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Hotel Contact -->
      <div class="hotel-contact">
        <div class="section-header">
          <span class="section-icon"><SvgIcon name="building" :size="16" /></span>
          <h3>{{ t('hotelInfo') }}</h3>
        </div>
        <div class="contact-grid">
          <div class="contact-item">
            <span class="contact-icon"><SvgIcon name="location" :size="12" /></span>
            <span class="contact-text">{{ store.hotel.address }}</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon"><SvgIcon name="phone" :size="12" /></span>
            <span class="contact-text">{{ store.hotel.phone }}</span>
          </div>
          <div class="contact-item" v-if="store.hotel.email">
            <span class="contact-icon"><SvgIcon name="mail" :size="12" /></span>
            <span class="contact-text">{{ store.hotel.email }}</span>
          </div>
          <div class="contact-item" v-if="store.hotel.website">
            <span class="contact-icon"><SvgIcon name="globe" :size="12" /></span>
            <span class="contact-text">{{ store.hotel.website }}</span>
          </div>
        </div>
      </div>

      <!-- QR Code -->
      <div v-if="store.settings.showQR" class="qr-section">
        <!-- 自定义二维码图片 -->
        <template v-if="store.qrSettings.useCustomQR && store.qrSettings.customQRImage">
          <img :src="store.qrSettings.customQRImage" class="custom-qr-img" alt="QR Code" />
        </template>
        <!-- 真实二维码 -->
        <template v-else>
          <img :src="qrCodeUrl" class="real-qr-img" alt="QR Code" />
        </template>
        <span class="qr-text">{{ t('scanBooking') }}</span>
      </div>
      
      <!-- Barcode -->
      <div v-if="store.settings.showBarcode" class="barcode-section">
        <template v-if="store.barcodeSettings.useCustomBarcode && store.barcodeSettings.customBarcodeImage">
          <img :src="store.barcodeSettings.customBarcodeImage" class="custom-barcode-img" alt="Barcode" />
        </template>
        <template v-else>
          <svg ref="barcodeRef" class="barcode-svg"></svg>
        </template>
        <span class="barcode-text">{{ store.barcodeSettings.barcodeContent || store.confirmationNumber }}</span>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-policies">
          <div class="policy-item">
            <span class="policy-icon"><SvgIcon name="clock" :size="12" /></span>
            <span>{{ t('checkInTime') }}</span>
          </div>
          <div class="policy-item">
            <span class="policy-icon"><SvgIcon name="car" :size="12" /></span>
            <span>{{ t('freeParking') }}</span>
          </div>
          <div class="policy-item">
            <span class="policy-icon"><SvgIcon name="wifi" :size="12" /></span>
            <span>{{ t('freeWifi') }}</span>
          </div>
        </div>
        <div class="footer-message">
          <p>{{ t('thankYou') }} {{ store.hotel.name }}. {{ t('lookForward') }}</p>
        </div>
        <div class="footer-bottom">
          <span>{{ t('generatedOn') }} {{ new Date().toLocaleDateString(store.settings.language === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useHotelStore } from '@/stores/hotel'
import SvgIcon from '@/components/icons/SvgIcons.vue'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'
import JsBarcode from 'jsbarcode'
import { mix } from '@/utils/color'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useHotelStore()
const barcodeRef = ref<SVGElement>()

// 渲染条形码
const renderBarcode = () => {
  if (!barcodeRef.value || store.barcodeSettings.useCustomBarcode) return
  const content = store.barcodeSettings.barcodeContent || store.confirmationNumber
  if (!content) return
  try {
    JsBarcode(barcodeRef.value, content, {
      format: 'CODE128',
      width: 1.5,
      height: 40,
      displayValue: false,
      margin: 5,
      background: 'transparent'
    })
  } catch (e) {
    console.error('Barcode render error:', e)
  }
}

// 监听变化重新渲染条形码
watch([() => store.settings.showBarcode, () => store.barcodeSettings.useCustomBarcode, () => store.barcodeSettings.barcodeContent, () => store.confirmationNumber], () => {
  nextTick(() => {
    nextTick(() => {
      if (store.settings.showBarcode && !store.barcodeSettings.useCustomBarcode) {
        renderBarcode()
      }
    })
  })
}, { immediate: true })

onMounted(() => {
  setTimeout(() => {
    if (store.settings.showBarcode && !store.barcodeSettings.useCustomBarcode) {
      renderBarcode()
    }
  }, 100)
})

// 调试用 - 观察 isPaid 状态
const isPaid = computed(() => {
  console.log('[HotelPreview] isPaid:', store.payment.isPaid)
  return store.payment.isPaid
})

// 计算预订单样式
const bookingStyle = computed(() => ({
  '--primary': store.settings.primaryColor,
  fontFamily: store.designSettings.fontFamily,
  color: store.designSettings.textColor,
  border: store.designSettings.borderEnabled 
    ? `${store.designSettings.borderWidth}px ${store.designSettings.borderStyle} ${store.designSettings.borderColor}` 
    : '1px solid #e2e8f0'
}))

const headerBackground = computed(() => {
  const primary = store.settings.primaryColor || '#8B4513'
  const mixed = mix(primary, '#000000', 0.2)
  return `linear-gradient(135deg, ${primary}, ${mixed})`
})

const receiptHeaderBackground = computed(() => {
  // 保持与 CSS 中的默认收据页眉一致（浅绿渐变），便于导出时显示
  return 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
})

const summaryStripStyle = computed(() => {
  const tpl = store.settings.template
  if (tpl === 'luxury') return { background: '#1a1a2e', color: 'white' }
  if (tpl === 'modern') return { background: 'white', color: '#0f172a' }
  if (tpl === 'classic') return { background: '#fef7ed', color: '#1a1a2e' }
  if (tpl === 'minimal') return { background: 'white', color: '#0f172a' }
  // default
  return { background: '#f8fafc', color: '#0f172a' }
})

const nightsBadgeStyle = computed(() => {
  const tpl = store.settings.template
  if (tpl === 'luxury') return { background: '#c9a962', color: '#1a1a2e' }
  if (tpl === 'modern') return { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white' }
  if (tpl === 'classic') return { background: '#78350f', color: 'white' }
  if (tpl === 'minimal') return { background: 'var(--primary, #8B4513)', color: 'white' }
  // default
  return { background: 'var(--primary, #8B4513)', color: 'white' }
})

// 多语言翻译
const translations = {
  en: {
    confirmationNumber: 'Confirmation Number',
    confirmedPaid: 'Confirmed & Paid',
    pendingPayment: 'Pending Payment',
    partiallyPaid: 'Partially Paid',
    fullyPaid: 'Fully Paid',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    from: 'From',
    until: 'Until',
    night: 'Night',
    nights: 'Nights',
    guests: 'Guests',
    adult: 'Adult',
    adults: 'Adults',
    child: 'Child',
    guestDetails: 'Guest Details',
    roomDetails: 'Room Details',
    rooms: 'Rooms',
    roomNo: 'Room No.',
    breakfast: 'Breakfast',
    included: 'Included',
    notIncluded: 'Not Included',
    specialRequests: 'Special Requests',
    priceSummary: 'Price Summary',
    roomRate: 'Room Rate',
    complimentary: 'Complimentary',
    taxes: 'Taxes',
    serviceFee: 'Service Fee',
    cityTax: 'City Tax',
    resortFee: 'Resort Fee',
    totalAmount: 'Total Amount',
    paid: 'Paid',
    balanceDue: 'Balance Due',
    hotelInfo: 'Hotel Information',
    scanBooking: 'Scan for booking details',
    checkInTime: 'Check-in: 14:00 | Check-out: 12:00',
    freeParking: 'Free parking available',
    freeWifi: 'Complimentary WiFi',
    thankYou: 'Thank you for choosing',
    lookForward: 'We look forward to welcoming you!',
    generatedOn: 'Confirmation generated on',
    creditCard: 'Credit Card',
    debitCard: 'Debit Card',
    cash: 'Cash',
    bankTransfer: 'Bank Transfer',
    standardRoom: 'Standard Room',
    deluxeRoom: 'Deluxe Room',
    suite: 'Suite',
    executiveSuite: 'Executive Suite',
    presidentialSuite: 'Presidential Suite'
  },
  zh: {
    confirmationNumber: '预订确认号',
    confirmedPaid: '已确认并付款',
    pendingPayment: '待付款',
    partiallyPaid: '部分付款',
    fullyPaid: '全部支付',
    checkIn: '入住',
    checkOut: '退房',
    from: '从',
    until: '至',
    night: '晚',
    nights: '晚',
    guests: '住客',
    adult: '成人',
    adults: '成人',
    child: '儿童',
    guestDetails: '住客信息',
    roomDetails: '房间信息',
    rooms: '房间数',
    roomNo: '房号',
    breakfast: '早餐',
    included: '已包含',
    notIncluded: '不包含',
    specialRequests: '特殊要求',
    priceSummary: '价格明细',
    roomRate: '房费',
    complimentary: '赠送',
    taxes: '税费',
    serviceFee: '服务费',
    cityTax: '城市税',
    resortFee: '度假费',
    totalAmount: '总金额',
    paid: '已付',
    balanceDue: '待付余额',
    hotelInfo: '酒店信息',
    scanBooking: '扫码查看预订详情',
    checkInTime: '入住: 14:00 | 退房: 12:00',
    freeParking: '免费停车',
    freeWifi: '免费WiFi',
    thankYou: '感谢您选择',
    lookForward: '期待您的光临！',
    generatedOn: '预订确认生成于',
    creditCard: '信用卡',
    debitCard: '借记卡',
    cash: '现金',
    bankTransfer: '银行转账',
    standardRoom: '标准房',
    deluxeRoom: '豪华房',
    suite: '套房',
    executiveSuite: '行政套房',
    presidentialSuite: '总统套房'
  }
}

const t = (key: keyof typeof translations.en) => {
  const lang = store.settings.language as keyof typeof translations
  return translations[lang]?.[key] || translations.en[key]
}

const statusLabels = computed(() => ({
  paid: t('confirmedPaid'),
  pending: t('pendingPayment'),
  partial: t('partiallyPaid'),
  fully_paid: t('fullyPaid')
} as Record<string, string>))

// 获取支付状态文本
const getPaymentStatusText = () => {
  const status = store.payment.status
  if (status === 'fully_paid') return t('fullyPaid')
  if (status === 'paid') return t('confirmedPaid')
  if (status === 'partial') return t('partiallyPaid')
  return t('pendingPayment')
}

const roomTypeLabels = computed(() => ({
  standard: t('standardRoom'),
  deluxe: t('deluxeRoom'),
  suite: t('suite'),
  executive: t('executiveSuite'),
  presidential: t('presidentialSuite')
} as Record<string, string>))

const paymentLabels = computed(() => ({
  credit: t('creditCard'),
  debit: t('debitCard'),
  cash: t('cash'),
  bank: t('bankTransfer')
} as Record<string, string>))

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const locale = store.settings.language === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

// 生成真实二维码 URL
const qrCodeUrl = computed(() => {
  const bookingData = {
    type: 'hotel_booking',
    confirmationNumber: store.confirmationNumber,
    hotel: store.hotel.name,
    checkIn: store.reservation.checkIn,
    checkOut: store.reservation.checkOut,
    guest: store.guest.name,
    roomType: store.reservation.roomType,
    status: store.payment.status
  }
  const qrContent = `${window.location.origin}/hotel?booking=${encodeURIComponent(JSON.stringify(bookingData))}`
  const params = new URLSearchParams({
    data: qrContent,
    size: '80x80',
    ecc: 'M'
  })
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
})
</script>

<style scoped>
.hotel-preview { display: flex; justify-content: center; padding: 16px; }
.booking { width: 620px; background: white; font-family: 'Segoe UI', -apple-system, sans-serif; box-shadow: 0 1px 10px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; font-size: 12px; color: #1e293b; position: relative; overflow: hidden; }

/* 水印 */
.watermark-layer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 10; }
.watermark-text { font-weight: bold; white-space: nowrap; text-transform: uppercase; letter-spacing: 4px; }

/* 自定义二维码图片 */
.custom-qr-img { width: 80px; height: 80px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 4px; }
.real-qr-img { width: 80px; height: 80px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 4px; background: white; }

/* Header */
.header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 28px; background: v-bind(headerBackground); color: white; }
.hotel-brand { display: flex; align-items: center; gap: 14px; }
.logo { height: 50px; width: auto; }
.logo-placeholder { width: 50px; height: 50px; background: rgba(255,255,255,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; }
.hotel-info h1 { margin: 0; font-size: 18px; font-weight: 600; }
.stars { margin-top: 4px; }
.star { color: #fbbf24; font-size: 12px; }
.star.empty { opacity: 0.4; }
.confirmation-info { text-align: right; }
.conf-label { display: block; font-size: 10px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.3px; }
.conf-number { display: block; font-size: 18px; font-weight: 700; letter-spacing: 1px; font-family: 'SF Mono', 'Courier New', monospace; margin: 2px 0 6px; }
.status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: 500; background: rgba(255,255,255,0.2); }
.status-badge.paid { background: #22c55e; }
.status-badge.pending { background: #f59e0b; }
.status-badge.partial { background: #3b82f6; }

/* Summary Strip */
.summary-strip { display: flex; align-items: stretch; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.summary-item { flex: 1; display: flex; align-items: center; gap: 10px; padding: 14px 16px; }
.summary-item.guests { border-left: 1px solid #e2e8f0; }
.sum-icon { font-size: 18px; }
.sum-content { display: flex; flex-direction: column; }
.sum-label { font-size: 9px; text-transform: uppercase; color: #64748b; letter-spacing: 0.3px; }
.sum-value { font-size: 13px; font-weight: 600; color: #0f172a; }
.sum-time { font-size: 10px; color: #94a3b8; }
.summary-divider { display: flex; align-items: center; padding: 0 8px; }
.nights-badge { background: var(--primary, #8B4513); color: white; padding: 6px 14px; border-radius: 16px; font-size: 11px; font-weight: 600; white-space: nowrap; }

/* Content Grid */
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #e2e8f0; margin: 16px 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.info-panel { background: white; padding: 16px; }
.panel-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.panel-icon { font-size: 14px; }
.panel-header h3 { margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; color: var(--primary, #8B4513); font-weight: 600; }
.guest-name, .room-type { margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #0f172a; }
.guest-details { display: flex; flex-direction: column; gap: 6px; }
.detail-row { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #475569; }
.detail-icon { font-size: 12px; }
.room-details { display: flex; flex-wrap: wrap; gap: 12px; }
.room-feature { display: flex; flex-direction: column; }
.feature-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; }
.feature-value { font-size: 12px; font-weight: 600; color: #334155; }
.feature-value.included { color: #16a34a; }

/* Special Requests */
.special-requests { margin: 0 20px 16px; padding: 12px 14px; background: #fefce8; border-radius: 6px; border-left: 3px solid #eab308; }
.request-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.request-icon { font-size: 12px; }
.request-title { font-size: 11px; font-weight: 600; color: #854d0e; }
.request-text { margin: 0; font-size: 11px; color: #713f12; }

/* Pricing Section */
.pricing-section { margin: 0 20px 16px; }
.section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.section-icon { font-size: 14px; }
.section-header h3 { margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; color: #334155; font-weight: 600; }
.price-table { width: 100%; border-collapse: collapse; }
.price-table td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
.price-table .rate-details { color: #64748b; font-size: 11px; }
.price-table .amount { text-align: right; font-family: 'SF Mono', 'Courier New', monospace; font-weight: 500; }
.price-table .amount.included { color: #16a34a; font-family: inherit; font-style: italic; }
.total-row td { background: #f8fafc; font-weight: 600; border-top: 2px solid #e2e8f0; }
.total-row .amount.total { font-size: 16px; color: var(--primary, #8B4513); }

/* Payment Status */
.payment-status { margin: 0 20px 16px; }
.payment-box { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; }
.payment-box.pending { background: #fef3c7; border-color: #fde68a; }
.payment-box.partial { background: #eff6ff; border-color: #bfdbfe; }
.payment-method { font-size: 13px; font-weight: 600; color: #0f172a; }
.payment-detail { display: block; font-size: 11px; color: #64748b; margin-top: 2px; }
.payment-amounts { display: flex; gap: 20px; }
.amount-row { display: flex; flex-direction: column; align-items: flex-end; }
.amount-label { font-size: 9px; color: #64748b; text-transform: uppercase; }
.amount-value { font-size: 14px; font-weight: 700; color: #16a34a; font-family: 'SF Mono', 'Courier New', monospace; }
.amount-value.due { color: #dc2626; }

/* Hotel Contact */
.hotel-contact { margin: 0 20px 16px; padding: 14px; background: #f8fafc; border-radius: 8px; }
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.contact-item { display: flex; align-items: flex-start; gap: 8px; font-size: 11px; color: #475569; }
.contact-icon { font-size: 12px; flex-shrink: 0; }
.contact-text { line-height: 1.4; }

/* QR Section */
.qr-section { display: flex; flex-direction: column; align-items: center; padding: 16px; }
.qr-code { width: 72px; height: 72px; display: grid; grid-template-columns: repeat(8, 1fr); gap: 1px; background: white; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; }
.qr-cell { background: #f1f5f9; }
.qr-cell.filled { background: #1e293b; }
.qr-text { font-size: 10px; color: #94a3b8; margin-top: 6px; }

/* Barcode Section */
.barcode-section { display: flex; flex-direction: column; align-items: center; padding: 12px 16px; }
.barcode-svg { max-width: 180px; height: 50px; }
.custom-barcode-img { max-width: 180px; max-height: 50px; object-fit: contain; }
.barcode-text { font-size: 10px; color: #94a3b8; margin-top: 4px; font-family: 'SF Mono', 'Courier New', monospace; }

/* Footer */
.footer { padding: 16px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
.footer-policies { display: flex; justify-content: center; gap: 24px; margin-bottom: 12px; }
.policy-item { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #64748b; }
.policy-icon { font-size: 12px; }
.footer-message { text-align: center; margin-bottom: 12px; }
.footer-message p { margin: 0; font-size: 12px; color: #475569; font-style: italic; }
.footer-bottom { text-align: center; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; }

/* Template: Luxury - 奢华风格：金色边框，优雅衬线字体，精致设计 */
.hotel-preview.luxury .booking { 
  border: 2px solid #c9a962; 
  box-shadow: 0 8px 40px rgba(0,0,0,0.15);
  background: linear-gradient(180deg, #fefdfb 0%, #f9f7f4 100%);
}
.hotel-preview.luxury .header { 
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); 
  border-bottom: 4px solid #c9a962;
  padding: 32px;
}
.hotel-preview.luxury .hotel-info h1 { 
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 24px;
  letter-spacing: 2px;
}
.hotel-preview.luxury .logo-placeholder {
  background: linear-gradient(135deg, #c9a962, #b8956f);
  border-radius: 4px;
  font-family: 'Playfair Display', serif;
}
.hotel-preview.luxury .conf-number { 
  color: #c9a962;
  font-size: 20px;
}
.hotel-preview.luxury .star { color: #c9a962; }
.hotel-preview.luxury .status-badge { 
  background: #c9a962; 
  color: #1a1a2e;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.hotel-preview.luxury .summary-strip {
  background: #1a1a2e;
  color: white;
}
.hotel-preview.luxury .sum-label { color: #c9a962; }
.hotel-preview.luxury .sum-value { color: white; }
.hotel-preview.luxury .sum-time { color: rgba(255,255,255,0.6); }
.hotel-preview.luxury .nights-badge { 
  background: #c9a962; 
  color: #1a1a2e;
  font-weight: 700;
  text-transform: uppercase;
}
.hotel-preview.luxury .summary-item.guests { border-left: 1px solid rgba(255,255,255,0.2); }
.hotel-preview.luxury .content-grid { 
  background: transparent; 
  border: 1px solid #c9a962;
  margin: 24px 28px;
}
.hotel-preview.luxury .panel-header { border-bottom: 1px solid #e5d9c3; }
.hotel-preview.luxury .panel-header h3 { color: #1a1a2e; font-family: 'Georgia', serif; }
.hotel-preview.luxury .guest-name, .hotel-preview.luxury .room-type {
  font-family: 'Georgia', serif;
  font-size: 18px;
}
.hotel-preview.luxury .pricing-section { margin: 0 28px 20px; }
.hotel-preview.luxury .price-table .total-row td { background: #1a1a2e; color: white; }
.hotel-preview.luxury .total-row .amount.total { color: #c9a962; }
.hotel-preview.luxury .payment-box { 
  background: linear-gradient(135deg, #f0ede8, #e8e4dc);
  border: 1px solid #c9a962;
}
.hotel-preview.luxury .hotel-contact { 
  background: #1a1a2e; 
  color: white;
  margin: 0 28px 20px;
}
.hotel-preview.luxury .section-header h3 { color: #c9a962; }
.hotel-preview.luxury .contact-item { color: rgba(255,255,255,0.8); }
.hotel-preview.luxury .footer { 
  background: linear-gradient(180deg, #f9f7f4, #f0ede8);
  border-top: 2px solid #c9a962;
}
.hotel-preview.luxury .footer-message p { 
  color: #1a1a2e;
  font-family: 'Georgia', serif;
  font-style: normal;
}

/* Template: Modern - 现代风格：大胆色彩，无边框卡片，圆角设计 */
.hotel-preview.modern .booking { 
  border: none; 
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(37, 99, 235, 0.1);
}
.hotel-preview.modern .header { 
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #d946ef 100%);
  padding: 28px 32px;
  border-radius: 0;
}
.hotel-preview.modern .logo-placeholder {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}
.hotel-preview.modern .hotel-info h1 { 
  font-weight: 800;
  font-size: 22px;
}
.hotel-preview.modern .conf-number {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 12px;
  display: inline-block;
}
.hotel-preview.modern .status-badge {
  background: white;
  color: #3b82f6;
  border-radius: 20px;
  padding: 6px 16px;
  font-weight: 700;
}
.hotel-preview.modern .summary-strip {
  background: white;
  padding: 8px 20px;
  border-bottom: none;
}
.hotel-preview.modern .summary-item {
  background: #f8fafc;
  border-radius: 16px;
  margin: 8px;
  padding: 16px;
}
.hotel-preview.modern .summary-item.guests { border-left: none; }
.hotel-preview.modern .summary-divider { padding: 0; }
.hotel-preview.modern .nights-badge {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 24px;
  padding: 12px 24px;
  font-size: 14px;
}
.hotel-preview.modern .content-grid {
  background: white;
  border: none;
  gap: 16px;
  padding: 16px;
  margin: 0 20px 16px;
}
.hotel-preview.modern .info-panel {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  padding: 20px;
}
.hotel-preview.modern .panel-header {
  border-bottom: none;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hotel-preview.modern .panel-header h3 { 
  -webkit-text-fill-color: transparent;
  font-size: 13px;
}
.hotel-preview.modern .guest-name, .hotel-preview.modern .room-type {
  font-size: 20px;
  font-weight: 800;
}
.hotel-preview.modern .pricing-section {
  background: white;
  margin: 0 20px 16px;
  padding: 20px;
  border-radius: 20px;
}
.hotel-preview.modern .price-table .total-row td {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 12px;
}
.hotel-preview.modern .payment-box {
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
}
.hotel-preview.modern .hotel-contact {
  border-radius: 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}
.hotel-preview.modern .qr-code {
  border-radius: 16px;
  padding: 12px;
}
.hotel-preview.modern .footer {
  background: white;
  border-top: none;
  padding: 24px;
}
.hotel-preview.modern .footer-policies {
  background: #f8fafc;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 16px;
}

/* Template: Classic - 经典风格：传统布局，深褐色调，正式感 */
.hotel-preview.classic .booking {
  border: 3px double #78350f;
  background: #fffbf5;
}
.hotel-preview.classic .header { 
  background: linear-gradient(135deg, #78350f, #92400e, #a16207);
  padding: 24px 28px;
}
.hotel-preview.classic .logo-placeholder {
  background: #fffbf5;
  color: #78350f;
  border: 2px solid #78350f;
  font-family: 'Times New Roman', serif;
}
.hotel-preview.classic .hotel-info h1 {
  font-family: 'Times New Roman', serif;
  letter-spacing: 1px;
}
.hotel-preview.classic .summary-strip {
  background: #fef7ed;
  border-bottom: 2px solid #e7d5c4;
}
.hotel-preview.classic .nights-badge {
  background: #78350f;
  border: 2px solid #a16207;
}
.hotel-preview.classic .content-grid {
  border: 2px solid #e7d5c4;
  margin: 20px;
}
.hotel-preview.classic .panel-header h3 { 
  color: #78350f;
  font-family: 'Times New Roman', serif;
  letter-spacing: 1px;
}
.hotel-preview.classic .guest-name, .hotel-preview.classic .room-type {
  font-family: 'Times New Roman', serif;
}
.hotel-preview.classic .price-table { border: 1px solid #e7d5c4; }
.hotel-preview.classic .price-table td { border-bottom: 1px solid #e7d5c4; }
.hotel-preview.classic .total-row td { 
  background: #78350f; 
  color: white; 
}
.hotel-preview.classic .total-row .amount.total { color: #fcd34d; }
.hotel-preview.classic .payment-box {
  border: 2px solid #78350f;
  background: #fef7ed;
}
.hotel-preview.classic .hotel-contact {
  border: 2px solid #e7d5c4;
  background: #fef7ed;
}
.hotel-preview.classic .footer {
  background: #78350f;
  color: white;
  border-top: 3px solid #a16207;
}
.hotel-preview.classic .footer-message p { color: rgba(255,255,255,0.9); }
.hotel-preview.classic .policy-item { color: rgba(255,255,255,0.8); }
.hotel-preview.classic .footer-bottom { 
  color: rgba(255,255,255,0.6); 
  border-top: 1px solid rgba(255,255,255,0.2);
}

/* Template: Minimal - 极简风格：大量留白，细线条，单色调 */
.hotel-preview.minimal .booking { 
  box-shadow: none;
  border: 1px solid #e5e7eb;
  background: white;
}
.hotel-preview.minimal .header { 
  background: white; 
  color: #1f2937; 
  border-bottom: 1px solid #e5e7eb;
  padding: 40px 32px;
}
.hotel-preview.minimal .logo-placeholder {
  background: transparent;
  border: 2px solid #1f2937;
  color: #1f2937;
}
.hotel-preview.minimal .hotel-info h1 {
  font-weight: 300;
  font-size: 28px;
  letter-spacing: 4px;
  text-transform: uppercase;
}
.hotel-preview.minimal .star { color: #1f2937; font-size: 10px; }
.hotel-preview.minimal .star.empty { color: #d1d5db; }
.hotel-preview.minimal .conf-label { color: #6b7280; }
.hotel-preview.minimal .conf-number { 
  color: #1f2937;
  font-weight: 300;
  font-size: 24px;
  letter-spacing: 3px;
}
.hotel-preview.minimal .status-badge { 
  background: transparent;
  border: 1px solid #1f2937;
  color: #1f2937;
  border-radius: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 9px;
}
.hotel-preview.minimal .summary-strip {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 24px 32px;
}
.hotel-preview.minimal .summary-item {
  border-right: 1px solid #e5e7eb;
  padding: 0 24px;
}
.hotel-preview.minimal .summary-item.guests { border-left: none; border-right: none; }
.hotel-preview.minimal .summary-item:first-child { padding-left: 0; }
.hotel-preview.minimal .sum-label { 
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 8px;
}
.hotel-preview.minimal .sum-value { 
  font-weight: 300;
  font-size: 14px;
}
.hotel-preview.minimal .nights-badge {
  background: transparent;
  border: 1px solid #1f2937;
  color: #1f2937;
  border-radius: 0;
  font-weight: 300;
}
.hotel-preview.minimal .summary-divider { padding: 0 24px; }
.hotel-preview.minimal .content-grid {
  background: white;
  border: none;
  margin: 32px;
  gap: 32px;
  border-top: 1px solid #e5e7eb;
  padding-top: 32px;
}
.hotel-preview.minimal .info-panel {
  padding: 0;
}
.hotel-preview.minimal .panel-header {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 16px;
}
.hotel-preview.minimal .panel-header h3 {
  color: #9ca3af;
  font-weight: 400;
  letter-spacing: 3px;
  font-size: 10px;
}
.hotel-preview.minimal .guest-name, .hotel-preview.minimal .room-type {
  font-weight: 300;
  font-size: 18px;
  letter-spacing: 1px;
}
.hotel-preview.minimal .pricing-section {
  margin: 0 32px 32px;
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
}
.hotel-preview.minimal .section-header h3 {
  color: #9ca3af;
  font-weight: 400;
  letter-spacing: 3px;
  font-size: 10px;
}
.hotel-preview.minimal .price-table td {
  border-bottom: 1px solid #f3f4f6;
  padding: 16px 0;
}
.hotel-preview.minimal .total-row td {
  background: white;
  border-top: 1px solid #1f2937;
  border-bottom: none;
}
.hotel-preview.minimal .total-row .amount.total {
  color: #1f2937;
  font-weight: 400;
  font-size: 20px;
}
.hotel-preview.minimal .payment-box {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0;
}
.hotel-preview.minimal .hotel-contact {
  background: white;
  border-top: 1px solid #e5e7eb;
  border-radius: 0;
  margin: 0 32px 32px;
  padding: 24px 0 0 0;
}
.hotel-preview.minimal .qr-code {
  border: 1px solid #e5e7eb;
  border-radius: 0;
}
.hotel-preview.minimal .footer {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 32px;
}
.hotel-preview.minimal .footer-policies { margin-bottom: 24px; }
.hotel-preview.minimal .policy-item { 
  font-weight: 300;
  letter-spacing: 1px;
}
.hotel-preview.minimal .footer-message p {
  font-style: normal;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 11px;
}
.hotel-preview.minimal .footer-bottom {
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* ==================== 响应式预览尺寸 ==================== */

/* 手机尺寸 - 375px */
.hotel-preview.size-mobile .booking {
  width: 375px;
  font-size: 11px;
}

.size-mobile .header {
  padding: 16px;
  flex-direction: column;
  gap: 12px;
}

.size-mobile .hotel-brand {
  gap: 10px;
}

.size-mobile .logo, .size-mobile .logo-placeholder {
  width: 44px;
  height: 44px;
}

.size-mobile .hotel-info h1 {
  font-size: 16px;
}

.size-mobile .stars {
  font-size: 12px;
}

.size-mobile .confirmation-info {
  text-align: left;
  width: 100%;
}

.size-mobile .conf-label {
  font-size: 9px;
}

.size-mobile .conf-number {
  font-size: 18px;
  letter-spacing: 1px;
}

.size-mobile .status-badge {
  padding: 3px 10px;
  font-size: 9px;
}

.size-mobile .summary-strip {
  flex-direction: column;
  padding: 12px 16px;
  gap: 12px;
}

.size-mobile .summary-item {
  flex-direction: row;
  gap: 10px;
}

.size-mobile .summary-divider {
  width: 100%;
  height: auto;
  padding: 8px 0;
}

.size-mobile .nights-badge {
  font-size: 11px;
  padding: 4px 12px;
}

.size-mobile .sum-icon svg {
  width: 16px;
  height: 16px;
}

.size-mobile .sum-label {
  font-size: 9px;
}

.size-mobile .sum-value {
  font-size: 13px;
}

.size-mobile .sum-time {
  font-size: 9px;
}

.size-mobile .content-grid {
  flex-direction: column;
  padding: 12px 16px;
  gap: 12px;
}

.size-mobile .info-panel {
  padding: 12px;
}

.size-mobile .panel-header h3 {
  font-size: 11px;
}

.size-mobile .guest-name {
  font-size: 14px;
}

.size-mobile .detail-row {
  font-size: 11px;
}

.size-mobile .room-type {
  font-size: 14px;
}

.size-mobile .room-details {
  flex-direction: column;
  gap: 6px;
}

.size-mobile .room-feature {
  padding: 6px 0;
}

.size-mobile .feature-label {
  font-size: 9px;
}

.size-mobile .feature-value {
  font-size: 12px;
}

.size-mobile .special-requests {
  margin: 12px 16px;
  padding: 10px;
}

.size-mobile .request-title {
  font-size: 11px;
}

.size-mobile .request-text {
  font-size: 11px;
}

.size-mobile .pricing-section {
  margin: 0 16px 16px;
  padding: 12px;
}

.size-mobile .section-header h3 {
  font-size: 12px;
}

.size-mobile .price-table td {
  padding: 8px 4px;
  font-size: 11px;
}

.size-mobile .total-row .amount.total {
  font-size: 16px;
}

.size-mobile .payment-box {
  margin: 0 16px 16px;
  padding: 12px;
}

.size-mobile .payment-status h4 {
  font-size: 12px;
}

.size-mobile .status-value {
  font-size: 11px;
}

.size-mobile .hotel-contact {
  flex-direction: column;
  gap: 12px;
  margin: 0 16px 16px;
  padding: 12px;
}

.size-mobile .contact-item {
  font-size: 11px;
}

.size-mobile .qr-code {
  width: 80px;
  height: 80px;
}

.size-mobile .qr-label {
  font-size: 9px;
}

.size-mobile .footer {
  padding: 12px 16px;
}

.size-mobile .footer-policies {
  flex-direction: column;
  gap: 8px;
}

.size-mobile .policy-item {
  font-size: 10px;
}

.size-mobile .footer-message p {
  font-size: 11px;
}

.size-mobile .footer-bottom {
  font-size: 9px;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

/* 电脑尺寸 - 900px */
.hotel-preview.size-desktop .booking {
  width: 900px;
  font-size: 13px;
}

.size-desktop .header {
  padding: 28px 36px;
}

.size-desktop .logo, .size-desktop .logo-placeholder {
  width: 64px;
  height: 64px;
}

.size-desktop .hotel-info h1 {
  font-size: 26px;
}

.size-desktop .conf-number {
  font-size: 28px;
}

.size-desktop .summary-strip {
  padding: 20px 36px;
  gap: 24px;
}

.size-desktop .nights-badge {
  font-size: 13px;
  padding: 6px 18px;
}

.size-desktop .sum-value {
  font-size: 16px;
}

.size-desktop .content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 20px 36px;
  gap: 24px;
}

.size-desktop .info-panel {
  padding: 20px;
}

.size-desktop .guest-name {
  font-size: 18px;
}

.size-desktop .room-type {
  font-size: 18px;
}

.size-desktop .room-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.size-desktop .pricing-section {
  margin: 0 36px 24px;
  padding: 20px;
}

.size-desktop .price-table td {
  padding: 14px 8px;
  font-size: 14px;
}

.size-desktop .total-row .amount.total {
  font-size: 24px;
}

.size-desktop .payment-box {
  margin: 0 36px 24px;
  padding: 20px;
}

.size-desktop .hotel-contact {
  margin: 0 36px 24px;
  padding: 20px;
  gap: 24px;
}

.size-desktop .qr-code {
  width: 120px;
  height: 120px;
}

.size-desktop .footer {
  padding: 20px 36px;
}

.size-desktop .footer-policies {
  gap: 20px;
}

/* 原尺寸 */
.hotel-preview.size-original .booking {
  width: 560px;
}
</style>

<!-- 支付收据样式 - 非 scoped 以确保正确应用 -->
<style>
.hotel-preview .payment-receipt {
  width: 620px;
  background: white;
  font-family: 'Segoe UI', -apple-system, sans-serif;
  box-shadow: 0 1px 10px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
  font-size: 12px;
  line-height: 1.5;
  color: #1e293b;
  position: relative;
  overflow: hidden;
}

.hotel-preview .payment-receipt .receipt-letterhead {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-bottom: 3px solid #10b981;
}

.hotel-preview .payment-receipt .hotel-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hotel-preview .payment-receipt .hotel-brand .logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
}

.hotel-preview .payment-receipt .hotel-brand .logo-placeholder {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.hotel-preview .payment-receipt .hotel-details h1 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
}

.hotel-preview .payment-receipt .hotel-details .stars {
  color: #fbbf24;
  font-size: 12px;
}

.hotel-preview .payment-receipt .receipt-title-block {
  text-align: right;
}

.hotel-preview .payment-receipt .paid-badge {
  display: inline-block;
  background: #10b981;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
}

.hotel-preview .payment-receipt .receipt-title-block h2 {
  font-size: 14px;
  font-weight: 700;
  color: #10b981;
  margin: 0;
  letter-spacing: 1px;
}

.hotel-preview .payment-receipt .receipt-confirmation {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.hotel-preview .payment-receipt .receipt-confirmation .conf-label {
  display: block;
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.hotel-preview .payment-receipt .receipt-confirmation .conf-number {
  font-family: 'Consolas', monospace;
  font-size: 22px;
  font-weight: 700;
  color: #10b981;
  letter-spacing: 2px;
}

.hotel-preview .payment-receipt .receipt-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
}

.hotel-preview .payment-receipt .detail-section h3 {
  font-size: 10px;
  text-transform: uppercase;
  color: #10b981;
  letter-spacing: 1px;
  margin: 0 0 12px;
  font-weight: 600;
}

.hotel-preview .payment-receipt .detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
}

.hotel-preview .payment-receipt .detail-row .label {
  color: #64748b;
}

.hotel-preview .payment-receipt .detail-row .value {
  color: #1e293b;
  font-weight: 500;
}

.hotel-preview .payment-receipt .receipt-reference {
  padding: 20px 28px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.hotel-preview .payment-receipt .receipt-reference h3 {
  font-size: 10px;
  text-transform: uppercase;
  color: #10b981;
  letter-spacing: 1px;
  margin: 0 0 12px;
  font-weight: 600;
}

.hotel-preview .payment-receipt .ref-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.hotel-preview .payment-receipt .ref-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hotel-preview .payment-receipt .ref-item .label {
  font-size: 10px;
  color: #64748b;
}

.hotel-preview .payment-receipt .ref-item .value {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.hotel-preview .payment-receipt .receipt-amount-box {
  margin: 20px 28px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
}

.hotel-preview .payment-receipt .amount-line {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.hotel-preview .payment-receipt .amount-line:last-child {
  border-bottom: none;
}

.hotel-preview .payment-receipt .amount-line.total {
  padding-top: 12px;
  margin-top: 4px;
  border-top: 2px solid rgba(255,255,255,0.3);
  border-bottom: none;
}

.hotel-preview .payment-receipt .amount-line.total .label {
  font-weight: 600;
}

.hotel-preview .payment-receipt .amount-line.total .value.highlight {
  font-size: 20px;
  font-weight: 700;
}

.hotel-preview .payment-receipt .amount-line.balance .value.zero {
  color: rgba(255,255,255,0.8);
}

.hotel-preview .payment-receipt .receipt-footer {
  text-align: center;
  padding: 20px 28px;
  background: #f8fafc;
}

.hotel-preview .payment-receipt .receipt-footer .thank-message {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
  margin: 0 0 8px;
}

.hotel-preview .payment-receipt .receipt-footer .contact-info {
  font-size: 10px;
  color: #64748b;
  margin: 0 0 8px;
}

.hotel-preview .payment-receipt .receipt-footer .legal-text {
  font-size: 9px;
  color: #94a3b8;
  margin: 0;
}

/* 尺寸响应 */
.hotel-preview.size-mobile .payment-receipt {
  width: 375px !important;
  font-size: 10px !important;
}

.hotel-preview.size-mobile .payment-receipt .receipt-letterhead {
  padding: 16px 20px !important;
}

.hotel-preview.size-mobile .payment-receipt .hotel-brand .logo,
.hotel-preview.size-mobile .payment-receipt .hotel-brand .logo-placeholder {
  width: 36px !important;
  height: 36px !important;
  font-size: 18px !important;
}

.hotel-preview.size-mobile .payment-receipt .hotel-details h1 {
  font-size: 14px !important;
}

.hotel-preview.size-mobile .payment-receipt .receipt-confirmation .conf-number {
  font-size: 18px !important;
}

.hotel-preview.size-mobile .payment-receipt .receipt-details-grid {
  grid-template-columns: 1fr !important;
  gap: 16px !important;
  padding: 16px 20px !important;
}

.hotel-preview.size-mobile .payment-receipt .receipt-amount-box {
  margin: 16px 20px !important;
  padding: 16px !important;
}

.hotel-preview.size-iphone .payment-receipt {
  width: 390px !important;
  font-size: 11px !important;
}

.hotel-preview.size-desktop .payment-receipt {
  width: 900px !important;
  font-size: 14px !important;
}

.hotel-preview.size-desktop .payment-receipt .receipt-letterhead {
  padding: 32px 40px !important;
}

.hotel-preview.size-desktop .payment-receipt .hotel-brand .logo,
.hotel-preview.size-desktop .payment-receipt .hotel-brand .logo-placeholder {
  width: 60px !important;
  height: 60px !important;
  font-size: 28px !important;
}

.hotel-preview.size-desktop .payment-receipt .hotel-details h1 {
  font-size: 20px !important;
}

.hotel-preview.size-desktop .payment-receipt .receipt-confirmation .conf-number {
  font-size: 28px !important;
}

.hotel-preview.size-desktop .payment-receipt .receipt-details-grid {
  padding: 32px 40px !important;
}

.hotel-preview.size-desktop .payment-receipt .receipt-amount-box {
  margin: 24px 40px !important;
  padding: 24px !important;
}

.hotel-preview.size-desktop .payment-receipt .amount-line.total .value.highlight {
  font-size: 26px !important;
}

.hotel-preview.size-original .payment-receipt {
  width: 620px !important;
}
</style>
