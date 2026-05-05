<template>
  <div class="cinema-receipt" :class="`size-${previewSize}`">
    <div class="ticket-paper">
      <!-- 左侧主票根 -->
      <div class="main-ticket">
        <!-- 电影院LOGO区 -->
        <div class="cinema-header">
          <div class="cinema-logo">🎬</div>
          <div class="cinema-info">
            <h1>{{ store.data.merchantName || '星光国际影城' }}</h1>
            <p>{{ store.data.branchName || 'IMAX旗舰店' }}</p>
          </div>
        </div>

        <!-- 电影信息 -->
        <div class="movie-section">
          <div class="movie-poster">
            <div class="poster-placeholder">🎞️</div>
          </div>
          <div class="movie-details">
            <h2 class="movie-title">{{ store.data.items[0]?.name || '电影名称' }}</h2>
            <p class="movie-type">{{ store.data.items[0]?.category || '3D/IMAX' }}</p>
          </div>
        </div>

        <!-- 场次信息 -->
        <div class="show-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">日期</span>
              <span class="value">{{ store.data.date }}</span>
            </div>
            <div class="info-item">
              <span class="label">场次</span>
              <span class="value">{{ store.data.time }}</span>
            </div>
            <div class="info-item">
              <span class="label">影厅</span>
              <span class="value">{{ store.data.roomNumber || '3号厅' }}</span>
            </div>
            <div class="info-item">
              <span class="label">座位</span>
              <span class="value seat-number">{{ store.data.tableNumber || '8排15座' }}</span>
            </div>
          </div>
        </div>

        <!-- 价格信息 -->
        <div class="price-section">
          <div class="price-row">
            <span>票价</span>
            <span class="price">{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
          </div>
          <div v-if="store.data.discount > 0" class="price-row discount">
            <span>优惠</span>
            <span>-{{ store.formatCurrency(store.data.discount) }}</span>
          </div>
        </div>

        <!-- 消费明细（爆米花饮料等） -->
        <div v-if="store.data.items.length > 1" class="snacks-section">
          <div class="section-title">🍿 卖品</div>
          <div v-for="(item, index) in store.data.items.slice(1)" :key="index" class="snack-item">
            <span>{{ item.name }} x{{ item.quantity }}</span>
            <span>{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
          </div>
        </div>

        <div class="dashed-divider"></div>

        <!-- 总计 -->
        <div class="total-section">
          <span>合计支付</span>
          <span class="total-amount">{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>

        <!-- 支付方式 -->
        <div class="payment-info">
          <span>{{ store.data.paymentMethod }}</span>
          <span>{{ store.data.receiptNumber }}</span>
        </div>

        <!-- 温馨提示 -->
        <div class="notice-section">
          <p>📢 请提前15分钟入场检票</p>
          <p>🚫 影厅内禁止吸烟、拍照录像</p>
        </div>

        <!-- 条形码 -->
        <div class="barcode-section">
          <div class="barcode">
            ||| || ||| | || ||| || | ||
          </div>
          <span>{{ store.data.receiptNumber }}</span>
        </div>
      </div>

      <!-- 右侧副券 -->
      <div class="stub-divider">
        <div class="perforation"></div>
      </div>
      <div class="ticket-stub">
        <div class="stub-header">🎬</div>
        <div class="stub-info">
          <p class="stub-title">{{ (store.data.items[0]?.name || '电影').substring(0, 6) }}</p>
          <p>{{ store.data.date }}</p>
          <p>{{ store.data.time }}</p>
          <p class="seat">{{ store.data.tableNumber || '8排15座' }}</p>
        </div>
        <div class="stub-code">存根</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReceiptStore } from '@/stores/receipt'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'

withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useReceiptStore()
</script>

<style scoped>
.cinema-receipt {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.ticket-paper {
  display: flex;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.main-ticket {
  width: 280px;
  padding: 20px;
  color: #fff;
}

.cinema-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.cinema-logo {
  font-size: 32px;
  background: linear-gradient(135deg, #f39c12, #e74c3c);
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cinema-info h1 {
  font-size: 16px;
  margin: 0;
  color: #f39c12;
}

.cinema-info p {
  font-size: 11px;
  margin: 4px 0 0;
  color: #aaa;
}

.movie-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.poster-placeholder {
  width: 60px;
  height: 80px;
  background: linear-gradient(135deg, #2d3436, #636e72);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.movie-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #fff;
}

.movie-type {
  font-size: 12px;
  color: #f39c12;
  margin: 0;
  padding: 2px 8px;
  background: rgba(243, 156, 18, 0.2);
  border-radius: 4px;
  display: inline-block;
}

.show-info {
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.info-item {
  background: rgba(255,255,255,0.08);
  padding: 10px;
  border-radius: 6px;
}

.info-item .label {
  display: block;
  font-size: 10px;
  color: #888;
  margin-bottom: 4px;
}

.info-item .value {
  font-size: 14px;
  font-weight: 600;
}

.seat-number {
  color: #f39c12;
}

.price-section {
  margin-bottom: 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin: 6px 0;
}

.price-row .price {
  font-weight: 600;
}

.price-row.discount {
  color: #2ecc71;
}

.snacks-section {
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
}

.section-title {
  font-size: 12px;
  color: #f39c12;
  margin-bottom: 8px;
}

.snack-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #ccc;
  margin: 4px 0;
}

.dashed-divider {
  border-top: 1px dashed rgba(255,255,255,0.3);
  margin: 12px 0;
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.total-section span:first-child {
  font-size: 14px;
}

.total-amount {
  font-size: 22px;
  font-weight: 700;
  color: #f39c12;
}

.payment-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #888;
  margin-bottom: 12px;
}

.notice-section {
  font-size: 10px;
  color: #888;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(255,255,255,0.03);
  border-radius: 4px;
}

.notice-section p {
  margin: 4px 0;
}

.barcode-section {
  text-align: center;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.barcode {
  font-family: 'Libre Barcode 39', monospace;
  font-size: 36px;
  color: #fff;
  letter-spacing: 2px;
}

.barcode-section span {
  display: block;
  font-size: 10px;
  color: #666;
  margin-top: 4px;
}

/* 副券分隔线 */
.stub-divider {
  width: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  position: relative;
}

.perforation {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 4px,
    rgba(255,255,255,0.2) 4px,
    rgba(255,255,255,0.2) 8px
  );
}

/* 副券 */
.ticket-stub {
  width: 60px;
  padding: 12px 8px;
  background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
  text-align: center;
  color: #fff;
}

.stub-header {
  font-size: 20px;
  margin-bottom: 12px;
}

.stub-info {
  font-size: 9px;
  color: #aaa;
}

.stub-info p {
  margin: 4px 0;
}

.stub-title {
  font-size: 10px;
  font-weight: 600;
  color: #fff;
}

.stub-info .seat {
  font-size: 11px;
  color: #f39c12;
  font-weight: 600;
  margin-top: 8px;
}

.stub-code {
  margin-top: 12px;
  font-size: 10px;
  color: #666;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 2px;
}
</style>
