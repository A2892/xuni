<template>
  <div class="ticket-preview" :class="{ 'dark-mode': store.data.darkMode }">
    <!-- 设备外框 -->
    <div class="device-frame" :class="store.data.deviceType">
      <!-- 状态栏 -->
      <div class="status-bar">
        <span class="time">{{ store.data.showTime }}</span>
        <div class="status-icons">
          <span v-if="store.data.showWifi" class="wifi">📶</span>
          <span class="signal">{{ '▁▂▃▄'.slice(0, store.data.showSignal) }}</span>
          <span class="battery">{{ store.data.showBattery }}%🔋</span>
        </div>
      </div>

      <!-- 平台头部 -->
      <div class="platform-header" :style="{ background: getPlatformColor() }">
        <span class="back-btn">← 返回</span>
        <span class="header-title">{{ getHeaderTitle() }}</span>
        <span class="more-btn">⋮</span>
      </div>

      <!-- 火车票订单 -->
      <div v-if="store.data.ticketType === 'train'" class="ticket-content">
        <!-- 订单状态卡片 -->
        <div class="status-card">
          <div class="status-icon" :class="store.data.orderStatus">
            {{ getStatusIcon() }}
          </div>
          <div class="status-text">
            <span class="status-label">{{ getStatusLabel() }}</span>
            <span class="status-desc" v-if="store.data.orderStatus === 'paid'">请于发车前凭身份证取票</span>
          </div>
        </div>

        <!-- 车次信息卡片 -->
        <div class="train-card">
          <div class="train-header">
            <span class="train-no" :style="{ color: getTrainTypeColor() }">{{ store.data.trainNo }}</span>
            <span class="train-type">{{ getTrainTypeName() }}</span>
            <span class="train-duration">{{ store.data.duration }}</span>
          </div>

          <div class="route-info">
            <div class="station departure">
              <span class="station-time">{{ store.data.departureTime }}</span>
              <span class="station-name">{{ store.data.departureStation }}</span>
              <span class="station-date">{{ formatDate(store.data.departureDate) }}</span>
            </div>
            <div class="route-line">
              <span class="duration-badge">{{ store.data.duration }}</span>
              <div class="line">
                <span class="dot start"></span>
                <span class="dash"></span>
                <span class="arrow">→</span>
                <span class="dash"></span>
                <span class="dot end"></span>
              </div>
            </div>
            <div class="station arrival">
              <span class="station-time">{{ store.data.arrivalTime }}</span>
              <span class="station-name">{{ store.data.arrivalStation }}</span>
              <span class="station-date">{{ formatDate(store.data.arrivalDate) }}</span>
            </div>
          </div>

          <div class="seat-info">
            <span class="seat-type">{{ store.data.seatType }}</span>
            <span class="seat-detail">{{ store.data.carriage }}车 {{ store.data.seatNo }}号</span>
          </div>
        </div>

        <!-- 乘客信息 -->
        <div class="passenger-card">
          <div class="card-title">乘客信息</div>
          <div class="passenger-row">
            <span class="passenger-name">{{ store.data.passengerName }}</span>
            <span class="passenger-type">{{ store.data.passengerType }}</span>
          </div>
          <div class="passenger-id">
            <span>{{ store.data.idType }}：{{ store.data.idNumber }}</span>
          </div>
        </div>

        <!-- 取票信息 -->
        <div class="pickup-card" v-if="store.data.showQRCode || store.data.showBarcode">
          <div class="card-title">取票信息</div>
          <div class="pickup-content">
            <div class="ticket-no">
              <span class="label">取票号：</span>
              <span class="value">{{ store.data.ticketNo }}</span>
            </div>
            <div v-if="store.data.showQRCode" class="qr-code">
              <div class="qr-placeholder">📱</div>
              <span>扫码取票</span>
            </div>
            <div v-if="store.data.showBarcode" class="barcode">
              <div class="barcode-placeholder">|||||||||||||||</div>
            </div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="order-card">
          <div class="card-title">订单信息</div>
          <div class="order-row">
            <span class="label">订单编号</span>
            <span class="value">{{ store.data.orderNo }}</span>
          </div>
          <div class="order-row">
            <span class="label">下单时间</span>
            <span class="value">{{ store.data.paymentTime }}</span>
          </div>
          <div class="order-row">
            <span class="label">支付方式</span>
            <span class="value">{{ store.data.paymentMethod }}</span>
          </div>
        </div>

        <!-- 价格明细 -->
        <div class="price-card">
          <div class="card-title">费用明细</div>
          <div class="price-row">
            <span class="label">车票价格</span>
            <span class="value">¥{{ store.data.ticketPrice.toFixed(2) }}</span>
          </div>
          <div class="price-row" v-if="store.data.serviceFee > 0">
            <span class="label">服务费</span>
            <span class="value">¥{{ store.data.serviceFee.toFixed(2) }}</span>
          </div>
          <div class="price-row" v-if="store.data.insuranceFee > 0">
            <span class="label">保险费</span>
            <span class="value">¥{{ store.data.insuranceFee.toFixed(2) }}</span>
          </div>
          <div class="price-total">
            <span class="label">合计</span>
            <span class="value">¥{{ store.data.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 机票订单 -->
      <div v-else-if="store.data.ticketType === 'flight'" class="ticket-content flight-content">
        <!-- 订单状态 -->
        <div class="status-card flight">
          <div class="status-icon" :class="store.data.orderStatus">{{ getStatusIcon() }}</div>
          <span class="status-label">{{ getStatusLabel() }}</span>
        </div>

        <!-- 航班信息 -->
        <div class="flight-card">
          <div class="flight-header">
            <span class="flight-no">{{ store.data.trainNo }}</span>
            <span class="airline">{{ store.data.trainType }}</span>
          </div>

          <div class="flight-route">
            <div class="flight-city">
              <span class="city-time">{{ store.data.departureTime }}</span>
              <span class="city-name">{{ store.data.departureCity }}</span>
              <span class="terminal">{{ store.data.departureStation }}</span>
            </div>
            <div class="flight-line">
              <span class="plane-icon">✈️</span>
              <span class="flight-duration">{{ store.data.duration }}</span>
            </div>
            <div class="flight-city arrival">
              <span class="city-time">{{ store.data.arrivalTime }}</span>
              <span class="city-name">{{ store.data.arrivalCity }}</span>
              <span class="terminal">{{ store.data.arrivalStation }}</span>
            </div>
          </div>

          <div class="flight-date">
            <span>{{ formatDate(store.data.departureDate) }}</span>
            <span class="seat-class">{{ store.data.seatType }}</span>
          </div>
        </div>

        <!-- 乘客信息 -->
        <div class="passenger-card">
          <div class="card-title">乘机人</div>
          <div class="passenger-info">
            <span class="name">{{ store.data.passengerName }}</span>
            <span class="id">{{ store.data.idType }}：{{ store.data.idNumber }}</span>
          </div>
        </div>

        <!-- 价格 -->
        <div class="price-card">
          <div class="price-total">
            <span>实付金额</span>
            <span class="amount">¥{{ store.data.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 底部导航 -->
      <div class="bottom-nav">
        <div class="nav-item active">
          <span class="icon">🏠</span>
          <span class="label">首页</span>
        </div>
        <div class="nav-item">
          <span class="icon">🔍</span>
          <span class="label">搜索</span>
        </div>
        <div class="nav-item">
          <span class="icon">📋</span>
          <span class="label">订单</span>
        </div>
        <div class="nav-item">
          <span class="icon">👤</span>
          <span class="label">我的</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTicketStore, ticketPlatforms, trainTypes, orderStatuses } from '@/stores/ticket'

const store = useTicketStore()

function getPlatformColor() {
  const platform = ticketPlatforms.find(p => p.id === store.data.platform)
  return platform?.color || '#0066CC'
}

function getHeaderTitle() {
  if (store.data.ticketType === 'train') return '火车票订单'
  if (store.data.ticketType === 'flight') return '机票订单'
  if (store.data.ticketType === 'bus') return '汽车票订单'
  return '船票订单'
}

function getStatusIcon() {
  const icons: Record<string, string> = {
    unpaid: '💰',
    paid: '✓',
    completed: '✓',
    refunded: '↩',
    cancelled: '✕'
  }
  return icons[store.data.orderStatus] || '✓'
}

function getStatusLabel() {
  const status = orderStatuses.find(s => s.id === store.data.orderStatus)
  return status?.label || '已支付'
}

function getTrainTypeColor() {
  const type = trainTypes.find(t => t.id === store.data.trainType)
  return type?.color || '#0066CC'
}

function getTrainTypeName() {
  const trainNo = store.data.trainNo
  if (trainNo.startsWith('G')) return '高铁'
  if (trainNo.startsWith('D')) return '动车'
  if (trainNo.startsWith('C')) return '城际'
  if (trainNo.startsWith('Z')) return '直达'
  if (trainNo.startsWith('T')) return '特快'
  if (trainNo.startsWith('K')) return '快速'
  return '普通'
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  return `${month}月${day}日 ${weekDay}`
}
</script>

<style scoped>
.ticket-preview {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.device-frame {
  width: 375px;
  min-height: 812px;
  background: #f5f5f5;
  border-radius: 40px;
  padding: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.device-frame.iphone::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 30px;
  background: #000;
  border-radius: 20px;
  z-index: 10;
}

.dark-mode .device-frame {
  background: #1a1a1a;
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.dark-mode .status-bar {
  color: #fff;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 平台头部 */
.platform-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: white;
  font-weight: 600;
}

.back-btn, .more-btn {
  font-size: 14px;
  opacity: 0.9;
}

.header-title {
  font-size: 16px;
}

/* 内容区域 */
.ticket-content {
  padding: 12px;
  background: #f5f5f5;
  min-height: calc(100% - 150px);
}

.dark-mode .ticket-content {
  background: #1a1a1a;
}

/* 状态卡片 */
.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.dark-mode .status-card {
  background: #2d2d2d;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.status-icon.paid, .status-icon.completed {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.status-icon.unpaid {
  background: linear-gradient(135deg, #FF9800, #F57C00);
}

.status-icon.refunded {
  background: linear-gradient(135deg, #9E9E9E, #757575);
}

.status-icon.cancelled {
  background: linear-gradient(135deg, #F44336, #D32F2F);
}

.status-text {
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.dark-mode .status-label {
  color: #f1f5f9;
}

.status-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

/* 车次卡片 */
.train-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.dark-mode .train-card {
  background: #2d2d2d;
}

.train-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e2e8f0;
}

.train-no {
  font-size: 20px;
  font-weight: 700;
}

.train-type {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.train-duration {
  margin-left: auto;
  font-size: 12px;
  color: #64748b;
}

/* 路线信息 */
.route-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.station {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.station.departure {
  align-items: flex-start;
}

.station.arrival {
  align-items: flex-end;
}

.station-time {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .station-time {
  color: #f1f5f9;
}

.station-name {
  font-size: 14px;
  color: #475569;
  margin-top: 4px;
}

.station-date {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.route-line {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px;
}

.duration-badge {
  font-size: 10px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.line {
  display: flex;
  align-items: center;
  width: 100%;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0066CC;
}

.dash {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, #0066CC 50%, transparent 50%);
  background-size: 8px 2px;
}

.arrow {
  font-size: 12px;
  color: #0066CC;
  margin: 0 2px;
}

/* 座位信息 */
.seat-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
}

.seat-type {
  font-size: 14px;
  font-weight: 600;
  color: #0066CC;
  background: #EEF2FF;
  padding: 4px 12px;
  border-radius: 6px;
}

.seat-detail {
  font-size: 14px;
  color: #475569;
}

/* 乘客卡片 */
.passenger-card, .pickup-card, .order-card, .price-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.dark-mode .passenger-card,
.dark-mode .pickup-card,
.dark-mode .order-card,
.dark-mode .price-card {
  background: #2d2d2d;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.dark-mode .card-title {
  color: #f1f5f9;
}

.passenger-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.passenger-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.dark-mode .passenger-name {
  color: #f1f5f9;
}

.passenger-type {
  font-size: 11px;
  color: #0066CC;
  background: #EEF2FF;
  padding: 2px 6px;
  border-radius: 4px;
}

.passenger-id {
  font-size: 13px;
  color: #64748b;
  margin-top: 6px;
}

/* 取票信息 */
.pickup-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ticket-no {
  flex: 1;
}

.ticket-no .label {
  font-size: 12px;
  color: #64748b;
}

.ticket-no .value {
  font-size: 18px;
  font-weight: 700;
  color: #0066CC;
  font-family: monospace;
}

.qr-code, .barcode {
  text-align: center;
}

.qr-placeholder {
  font-size: 40px;
  margin-bottom: 4px;
}

.qr-code span {
  font-size: 10px;
  color: #64748b;
}

.barcode-placeholder {
  font-family: monospace;
  letter-spacing: 2px;
  font-size: 20px;
}

/* 订单信息 */
.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.order-row:last-child {
  border-bottom: none;
}

.order-row .label {
  font-size: 13px;
  color: #64748b;
}

.order-row .value {
  font-size: 13px;
  color: #1e293b;
  font-family: monospace;
}

.dark-mode .order-row .value {
  color: #f1f5f9;
}

/* 价格信息 */
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.price-row .label {
  font-size: 13px;
  color: #64748b;
}

.price-row .value {
  font-size: 14px;
  color: #1e293b;
}

.price-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.price-total .label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.price-total .value {
  font-size: 20px;
  font-weight: 700;
  color: #EF4444;
}

/* 航班样式 */
.flight-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.dark-mode .flight-card {
  background: #2d2d2d;
}

.flight-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.flight-no {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .flight-no {
  color: #f1f5f9;
}

.airline {
  font-size: 13px;
  color: #64748b;
}

.flight-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.flight-city {
  display: flex;
  flex-direction: column;
}

.flight-city.arrival {
  align-items: flex-end;
}

.city-time {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .city-time {
  color: #f1f5f9;
}

.city-name {
  font-size: 16px;
  font-weight: 600;
  color: #475569;
  margin-top: 4px;
}

.terminal {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.flight-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.plane-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.flight-duration {
  font-size: 11px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.flight-date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
  font-size: 13px;
  color: #64748b;
}

.seat-class {
  color: #0066CC;
  font-weight: 600;
}

/* 底部导航 */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  border-radius: 0 0 30px 30px;
}

.dark-mode .bottom-nav {
  background: #2d2d2d;
  border-color: #3d3d3d;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px;
  color: #94a3b8;
}

.nav-item.active {
  color: #0066CC;
}

.nav-item .icon {
  font-size: 20px;
}

.nav-item .label {
  font-size: 10px;
}
</style>
