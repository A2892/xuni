<template>
  <div class="delivery-preview" :class="[data.platform, { dark: data.darkMode }]">
    <div class="device-frame" :class="data.deviceType">
      <!-- 状态栏 -->
      <div class="status-bar">
        <div class="status-left">
          <span class="time">{{ data.showTime }}</span>
        </div>
        <div class="status-center">
          <div v-if="data.deviceType === 'iphone'" class="notch"></div>
        </div>
        <div class="status-right">
          <span class="battery">{{ data.showBattery }}%</span>
        </div>
      </div>

      <!-- 外卖订单 -->
      <template v-if="data.orderType === 'food'">
        <div class="food-order">
          <!-- 顶部导航 -->
          <div class="order-header" :class="data.platform">
            <button class="back-btn">‹</button>
            <span class="header-title">订单详情</span>
            <button class="more-btn">⋯</button>
          </div>

          <!-- 订单状态 -->
          <div class="order-status-card" :class="data.orderStatus">
            <div class="status-icon">
              <template v-if="data.orderStatus === 'completed'">✓</template>
              <template v-else-if="data.orderStatus === 'delivering'">🚴</template>
              <template v-else-if="data.orderStatus === 'confirmed'">👨‍🍳</template>
              <template v-else>⏳</template>
            </div>
            <div class="status-info">
              <h3>{{ getStatusText(data.orderStatus) }}</h3>
              <p>{{ data.deliveryTime }}</p>
            </div>
          </div>

          <!-- 骑手信息 -->
          <div v-if="data.orderStatus === 'delivering'" class="rider-card">
            <div class="rider-avatar">
              <img v-if="data.riderAvatar" :src="data.riderAvatar" />
              <span v-else>🚴</span>
            </div>
            <div class="rider-info">
              <span class="rider-name">{{ data.riderName }}</span>
              <span class="rider-vehicle">{{ data.vehicleInfo }}</span>
            </div>
            <button class="call-btn">📞 联系骑手</button>
          </div>

          <!-- 收货地址 -->
          <div class="address-card">
            <div class="address-icon">📍</div>
            <div class="address-info">
              <div class="address-header">
                <span class="receiver-name">{{ data.receiverName }}</span>
                <span class="receiver-phone">{{ data.receiverPhone }}</span>
              </div>
              <p class="address-text">{{ data.receiverAddress }}</p>
            </div>
          </div>

          <!-- 商家信息 -->
          <div class="merchant-card">
            <div class="merchant-logo">
              <img v-if="data.merchantLogo" :src="data.merchantLogo" />
              <span v-else>🏪</span>
            </div>
            <div class="merchant-info">
              <h4>{{ data.merchantName }}</h4>
              <div class="merchant-rating">
                <span class="stars">⭐ {{ data.merchantRating }}</span>
              </div>
            </div>
            <button class="shop-btn">进店</button>
          </div>

          <!-- 商品列表 -->
          <div class="items-card">
            <div v-for="item in data.items" :key="item.id" class="item-row">
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span v-if="item.specs" class="item-specs">{{ item.specs }}</span>
              </div>
              <div class="item-price">
                <span class="quantity">x{{ item.quantity }}</span>
                <span class="price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- 费用明细 -->
          <div class="price-card">
            <div class="price-row">
              <span>商品小计</span>
              <span>¥{{ data.subtotal.toFixed(2) }}</span>
            </div>
            <div class="price-row">
              <span>配送费</span>
              <span>¥{{ data.deliveryFee.toFixed(2) }}</span>
            </div>
            <div class="price-row">
              <span>打包费</span>
              <span>¥{{ data.packingFee.toFixed(2) }}</span>
            </div>
            <div v-if="data.couponDiscount > 0" class="price-row discount">
              <span>优惠券</span>
              <span>-¥{{ data.couponDiscount.toFixed(2) }}</span>
            </div>
            <div v-if="data.redpacketDiscount > 0" class="price-row discount">
              <span>红包</span>
              <span>-¥{{ data.redpacketDiscount.toFixed(2) }}</span>
            </div>
            <div class="price-row total">
              <span>实付款</span>
              <span class="total-amount">¥{{ data.totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 订单信息 -->
          <div class="order-info-card">
            <div class="info-row">
              <span class="label">订单编号</span>
              <span class="value">{{ data.orderId }}</span>
            </div>
            <div class="info-row">
              <span class="label">下单时间</span>
              <span class="value">{{ data.orderTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">支付方式</span>
              <span class="value">{{ getPaymentMethodText(data.paymentMethod) }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 快递订单 -->
      <template v-else-if="data.orderType === 'express'">
        <div class="express-order">
          <div class="order-header" :class="data.platform">
            <button class="back-btn">‹</button>
            <span class="header-title">物流详情</span>
            <button class="more-btn">⋯</button>
          </div>

          <!-- 快递状态 -->
          <div class="express-status-card">
            <div class="express-company">
              <span class="company-icon">📦</span>
              <span class="company-name">{{ data.expressCompany }}</span>
            </div>
            <div class="tracking-no">
              <span>运单号：{{ data.trackingNo }}</span>
              <button class="copy-btn">复制</button>
            </div>
            <div class="express-current-status">
              <span class="status-badge">{{ data.expressStatus }}</span>
            </div>
          </div>

          <!-- 物流轨迹 -->
          <div class="tracking-timeline">
            <div 
              v-for="(track, index) in data.trackingHistory" 
              :key="index"
              :class="['track-item', { active: index === 0 }]"
            >
              <div class="track-dot"></div>
              <div class="track-content">
                <div class="track-status">{{ track.status }}</div>
                <div class="track-meta">
                  <span class="track-time">{{ track.time }}</span>
                  <span class="track-location">{{ track.location }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 收发信息 -->
          <div class="address-cards">
            <div class="sender-card">
              <div class="card-label">寄件人</div>
              <div class="card-info">
                <span class="name">{{ data.merchantName }}</span>
                <span class="address">{{ data.merchantAddress }}</span>
              </div>
            </div>
            <div class="receiver-card">
              <div class="card-label">收件人</div>
              <div class="card-info">
                <span class="name">{{ data.receiverName }} {{ data.receiverPhone }}</span>
                <span class="address">{{ data.receiverAddress }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 打车订单 -->
      <template v-else-if="data.orderType === 'ride'">
        <div class="ride-order">
          <div class="order-header didi">
            <button class="back-btn">‹</button>
            <span class="header-title">行程详情</span>
            <button class="share-btn">分享</button>
          </div>

          <!-- 行程地图 -->
          <div class="trip-map">
            <div class="map-placeholder">
              <div class="route-line"></div>
              <div class="point start">起</div>
              <div class="point end">终</div>
            </div>
          </div>

          <!-- 行程信息 -->
          <div class="trip-info-card">
            <div class="trip-locations">
              <div class="location-item start">
                <span class="dot"></span>
                <span class="text">{{ data.pickupLocation }}</span>
              </div>
              <div class="location-item end">
                <span class="dot"></span>
                <span class="text">{{ data.dropoffLocation }}</span>
              </div>
            </div>

            <div class="trip-stats">
              <div class="stat-item">
                <span class="stat-value">{{ data.tripDistance }}</span>
                <span class="stat-label">总里程</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ data.tripDuration }}</span>
                <span class="stat-label">行程时长</span>
              </div>
            </div>
          </div>

          <!-- 司机信息 -->
          <div class="driver-card">
            <div class="driver-avatar">
              <img v-if="data.riderAvatar" :src="data.riderAvatar" />
              <span v-else>👨</span>
            </div>
            <div class="driver-info">
              <span class="driver-name">{{ data.riderName }}</span>
              <span class="car-info">{{ data.carType }} · {{ data.plateNumber }}</span>
            </div>
            <div class="driver-rating">
              <span class="stars">⭐ 4.9</span>
            </div>
          </div>

          <!-- 费用信息 -->
          <div class="ride-price-card">
            <div class="price-row">
              <span>车费</span>
              <span>¥{{ data.subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="data.couponDiscount > 0" class="price-row discount">
              <span>优惠</span>
              <span>-¥{{ data.couponDiscount.toFixed(2) }}</span>
            </div>
            <div class="price-row total">
              <span>实付</span>
              <span class="total-amount">¥{{ data.totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 订单信息 -->
          <div class="order-info-card">
            <div class="info-row">
              <span class="label">订单编号</span>
              <span class="value">{{ data.orderId }}</span>
            </div>
            <div class="info-row">
              <span class="label">行程时间</span>
              <span class="value">{{ data.orderTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">支付方式</span>
              <span class="value">{{ getPaymentMethodText(data.paymentMethod) }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 电商订单 -->
      <template v-else-if="data.orderType === 'shopping'">
        <div class="shopping-order">
          <div class="order-header" :class="data.platform">
            <button class="back-btn">‹</button>
            <span class="header-title">订单详情</span>
            <button class="service-btn">客服</button>
          </div>

          <!-- 订单状态 -->
          <div class="shopping-status-card" :class="data.orderStatus">
            <span class="status-text">{{ getStatusText(data.orderStatus) }}</span>
            <span class="status-desc">感谢您的购买</span>
          </div>

          <!-- 收货地址 -->
          <div class="address-card">
            <div class="address-icon">📍</div>
            <div class="address-info">
              <div class="address-header">
                <span class="receiver-name">{{ data.receiverName }}</span>
                <span class="receiver-phone">{{ data.receiverPhone }}</span>
              </div>
              <p class="address-text">{{ data.receiverAddress }}</p>
            </div>
          </div>

          <!-- 商品列表 -->
          <div class="shop-items-card">
            <div class="shop-header">
              <span class="shop-icon">🏪</span>
              <span class="shop-name">{{ data.merchantName }}</span>
            </div>
            <div v-for="item in data.items" :key="item.id" class="shop-item">
              <div class="item-image">📦</div>
              <div class="item-detail">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-specs">{{ item.specs }}</span>
                <div class="item-price-row">
                  <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>
            <div class="shop-total">
              <span>共{{ data.items.reduce((sum, i) => sum + i.quantity, 0) }}件商品</span>
              <span>合计: <strong>¥{{ data.totalAmount.toFixed(2) }}</strong></span>
            </div>
          </div>

          <!-- 订单信息 -->
          <div class="order-info-card">
            <div class="info-row">
              <span class="label">订单编号</span>
              <span class="value">{{ data.orderId }}</span>
            </div>
            <div class="info-row">
              <span class="label">下单时间</span>
              <span class="value">{{ data.orderTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">支付方式</span>
              <span class="value">{{ getPaymentMethodText(data.paymentMethod) }}</span>
            </div>
            <div class="info-row">
              <span class="label">支付时间</span>
              <span class="value">{{ data.payTime }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDeliveryOrderStore } from '@/stores/deliveryOrder'

const store = useDeliveryOrderStore()
const data = store.data

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付',
    confirmed: '商家已接单',
    delivering: '骑手配送中',
    completed: '订单已完成',
    cancelled: '订单已取消',
    refunded: '已退款'
  }
  return map[status] || status
}

const getPaymentMethodText = (method: string) => {
  const map: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    cash: '货到付款',
    card: '银行卡',
    balance: '余额支付'
  }
  return map[method] || method
}
</script>

<style scoped>
.delivery-preview {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.device-frame {
  width: 375px;
  background: #f5f5f5;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.device-frame.iphone {
  border: 8px solid #1a1a1a;
}

.device-frame.android {
  border: 6px solid #333;
  border-radius: 30px;
}

/* 状态栏 */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: white;
  font-size: 12px;
  font-weight: 600;
}

.dark .status-bar {
  background: #1a1a1a;
  color: white;
}

.notch {
  width: 100px;
  height: 25px;
  background: black;
  border-radius: 0 0 20px 20px;
}

/* 订单头部 */
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
}

.order-header.meituan {
  background: linear-gradient(135deg, #FFD100, #FFA500);
  color: #333;
}

.order-header.eleme {
  background: linear-gradient(135deg, #0097FF, #00C2FF);
  color: white;
}

.order-header.didi {
  background: linear-gradient(135deg, #FF6A00, #FF8C00);
  color: white;
}

.order-header.shunfeng {
  background: #000;
  color: white;
}

.order-header.jd {
  background: linear-gradient(135deg, #E4393C, #FF6B6B);
  color: white;
}

.back-btn, .more-btn, .share-btn, .service-btn {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

/* 订单状态卡片 */
.order-status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.order-status-card.pending {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.order-status-card.delivering {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.order-status-card.cancelled {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

.status-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.status-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
}

.status-info p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

/* 骑手卡片 */
.rider-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  margin: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.rider-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  overflow: hidden;
}

.rider-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rider-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rider-name {
  font-weight: 600;
  font-size: 15px;
}

.rider-vehicle {
  font-size: 12px;
  color: #666;
}

.call-btn {
  padding: 8px 12px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
}

/* 地址卡片 */
.address-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  margin: 12px;
  border-radius: 12px;
}

.address-icon {
  font-size: 20px;
}

.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.receiver-name {
  font-weight: 600;
}

.receiver-phone {
  color: #666;
}

.address-text {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* 商家卡片 */
.merchant-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  margin: 12px;
  border-radius: 12px;
}

.merchant-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  overflow: hidden;
}

.merchant-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.merchant-info {
  flex: 1;
}

.merchant-info h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
}

.merchant-rating {
  font-size: 12px;
  color: #f59e0b;
}

.shop-btn {
  padding: 6px 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
}

/* 商品列表 */
.items-card {
  background: white;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 14px;
}

.item-specs {
  font-size: 12px;
  color: #999;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity {
  color: #999;
  font-size: 13px;
}

.price {
  font-size: 14px;
}

/* 价格卡片 */
.price-card {
  background: white;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
}

.price-row.discount {
  color: #f59e0b;
}

.price-row.total {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  margin-top: 4px;
  color: #333;
  font-weight: 600;
}

.total-amount {
  font-size: 18px;
  color: #e4393c;
}

/* 订单信息卡片 */
.order-info-card {
  background: white;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.info-row .label {
  color: #999;
}

.info-row .value {
  color: #333;
}

/* 快递样式 */
.express-status-card {
  background: white;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

.express-company {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.company-icon {
  font-size: 24px;
}

.company-name {
  font-size: 16px;
  font-weight: 600;
}

.tracking-no {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.copy-btn {
  padding: 4px 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
}

.express-current-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 8px 24px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 20px;
  font-weight: 600;
}

/* 物流轨迹 */
.tracking-timeline {
  background: white;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

.track-item {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  position: relative;
}

.track-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 16px;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.track-item.active .track-dot {
  background: #22c55e;
}

.track-item.active::after {
  background: linear-gradient(to bottom, #22c55e 50%, #e5e7eb 50%);
}

.track-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  flex-shrink: 0;
  margin-top: 4px;
  z-index: 1;
}

.track-content {
  flex: 1;
}

.track-status {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.track-item.active .track-status {
  color: #22c55e;
}

.track-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

/* 地址卡片组 */
.address-cards {
  margin: 12px;
}

.sender-card, .receiver-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.card-info .name {
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.card-info .address {
  font-size: 13px;
  color: #666;
}

/* 打车样式 */
.trip-map {
  height: 150px;
  background: #e5e7eb;
  position: relative;
  overflow: hidden;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.route-line {
  width: 60%;
  height: 4px;
  background: linear-gradient(90deg, #22c55e, #3b82f6);
  border-radius: 2px;
}

.point {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
}

.point.start {
  left: 15%;
  background: #22c55e;
}

.point.end {
  right: 15%;
  background: #3b82f6;
}

.trip-info-card {
  background: white;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

.trip-locations {
  margin-bottom: 16px;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.location-item .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.location-item.start .dot {
  background: #22c55e;
}

.location-item.end .dot {
  background: #3b82f6;
}

.location-item .text {
  font-size: 14px;
}

.trip-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #ff6a00;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* 司机卡片 */
.driver-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  margin: 12px;
  border-radius: 12px;
}

.driver-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  overflow: hidden;
}

.driver-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.driver-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.driver-name {
  font-weight: 600;
  font-size: 16px;
}

.car-info {
  font-size: 13px;
  color: #666;
}

.driver-rating {
  font-size: 14px;
  color: #f59e0b;
}

.ride-price-card {
  background: white;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
}

/* 电商样式 */
.shopping-status-card {
  padding: 24px;
  text-align: center;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.shopping-status-card.pending {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.status-text {
  display: block;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.status-desc {
  font-size: 13px;
  opacity: 0.9;
}

.shop-items-card {
  background: white;
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.shop-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f8f8;
  border-bottom: 1px solid #f0f0f0;
}

.shop-name {
  font-weight: 600;
  font-size: 14px;
}

.shop-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.item-image {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.item-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-detail .item-name {
  font-size: 14px;
  font-weight: 500;
}

.item-detail .item-specs {
  font-size: 12px;
  color: #999;
}

.item-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-detail .item-price {
  color: #e4393c;
  font-weight: 600;
}

.item-detail .item-qty {
  color: #999;
  font-size: 13px;
}

.shop-total {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 14px;
}

.shop-total strong {
  color: #e4393c;
}
</style>
