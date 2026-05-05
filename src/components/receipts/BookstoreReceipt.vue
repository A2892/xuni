<template>
  <div class="bookstore-receipt" :class="`size-${previewSize}`">
    <div class="receipt-paper">
      <!-- 书店头部 - 文艺风格 -->
      <div class="bookstore-header">
        <div class="header-decoration">📚 ═══════════════ 📚</div>
        <h1>{{ store.data.merchantName || '博雅书店' }}</h1>
        <p class="store-motto">{{ store.data.branchName || '阅读点亮生活' }}</p>
        <div class="header-decoration">════════════════════</div>
      </div>

      <div class="store-info">
        <p>{{ store.data.merchantAddress || '北京市海淀区中关村大街88号' }}</p>
        <p>电话: {{ store.data.merchantPhone || '010-82828282' }}</p>
      </div>

      <div class="chapter-divider">
        <span>第 {{ chapterNumber }} 章</span>
      </div>

      <!-- 交易信息 -->
      <div class="transaction-info">
        <div class="info-row">
          <span class="label">单据号:</span>
          <span>{{ store.data.receiptNumber }}</span>
        </div>
        <div class="info-row">
          <span class="label">日期:</span>
          <span>{{ store.data.date }} {{ store.data.time }}</span>
        </div>
        <div class="info-row">
          <span class="label">收银员:</span>
          <span>{{ store.data.cashier }}</span>
        </div>
      </div>

      <div class="book-divider">
        ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
      </div>

      <!-- 图书明细 -->
      <div class="books-section">
        <div class="section-title">📖 购书清单</div>
        <div v-for="(item, index) in store.data.items" :key="item.id" class="book-item">
          <div class="book-index">{{ index + 1 }}.</div>
          <div class="book-info">
            <div class="book-title">《{{ item.name }}》</div>
            <div v-if="item.notes" class="book-author">{{ item.notes }}</div>
            <div class="book-meta">
              <span v-if="item.sku" class="isbn">ISBN: {{ item.sku }}</span>
              <span v-if="item.category" class="category">{{ item.category }}</span>
            </div>
          </div>
          <div class="book-price-info">
            <div v-if="item.originalPrice && item.originalPrice > item.unitPrice" class="original-price">
              {{ store.formatCurrency(item.originalPrice) }}
            </div>
            <div class="current-price">{{ store.formatCurrency(item.unitPrice) }}</div>
            <div v-if="item.quantity > 1" class="qty">×{{ item.quantity }}</div>
          </div>
        </div>
      </div>

      <div class="double-wave">
        ～～～～～～～～～～～～～～～～
      </div>

      <!-- 金额汇总 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>图书数量:</span>
          <span>{{ totalBooks }} 本</span>
        </div>
        <div class="summary-row">
          <span>码洋合计:</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="summary-row discount">
          <span>会员折扣:</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div class="summary-row total">
          <span>实付金额:</span>
          <span class="total-amount">{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <div class="book-divider">
        ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
      </div>

      <!-- 支付信息 -->
      <div class="payment-section">
        <div class="payment-row">
          <span>支付方式:</span>
          <span>{{ store.data.paymentMethod }}</span>
        </div>
      </div>

      <!-- 会员信息 -->
      <div v-if="store.data.membershipId" class="member-section">
        <div class="member-card">
          <div class="card-icon">📚</div>
          <div class="card-info">
            <span class="member-name">{{ store.data.membershipLevel || '书友会员' }}</span>
            <span class="member-id">{{ store.data.membershipId }}</span>
          </div>
          <div class="card-points">
            <span v-if="store.data.pointsEarned">+{{ store.data.pointsEarned }}积分</span>
          </div>
        </div>
      </div>

      <div class="quote-section">
        <p class="quote-text">"{{ randomQuote }}"</p>
      </div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <div class="barcode-section">
          <div class="barcode">*{{ store.data.receiptNumber }}*</div>
        </div>
        <p class="footer-message">{{ store.data.footerMessage || '阅读使人充实，思考使人深邃' }}</p>
        <div class="footer-decoration">
          📖 ═══ 谢谢惠顾 ═══ 📖
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReceiptStore } from '@/stores/receipt'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'

withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useReceiptStore()

const totalBooks = computed(() => {
  return store.data.items.reduce((sum, item) => sum + item.quantity, 0)
})

const chapterNumber = computed(() => {
  return Math.floor(Math.random() * 99) + 1
})

const quotes = [
  '书籍是人类进步的阶梯',
  '读书破万卷，下笔如有神',
  '书中自有黄金屋',
  '腹有诗书气自华'
]

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
</script>

<style scoped>
.bookstore-receipt {
  font-family: 'Noto Serif SC', 'SimSun', serif;
}

.receipt-paper {
  width: 300px;
  background: #fffef8;
  padding: 24px 20px;
  box-shadow: 0 4px 20px rgba(139, 90, 43, 0.15);
  border: 1px solid #e8dcc8;
  position: relative;
}

.receipt-paper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50' y='50' font-size='60' fill='%23f5efe6' text-anchor='middle' dominant-baseline='middle'%3E📖%3C/text%3E%3C/svg%3E");
  opacity: 0.1;
  pointer-events: none;
}

.bookstore-header {
  text-align: center;
  margin-bottom: 16px;
  position: relative;
}

.header-decoration {
  font-size: 10px;
  color: #8b5a2b;
  letter-spacing: 1px;
}

.bookstore-header h1 {
  font-size: 22px;
  margin: 8px 0;
  color: #5d3a1a;
  font-weight: 600;
}

.store-motto {
  font-size: 12px;
  color: #8b5a2b;
  margin: 4px 0 8px;
  font-style: italic;
}

.store-info {
  text-align: center;
  font-size: 11px;
  color: #888;
  margin-bottom: 12px;
}

.store-info p {
  margin: 3px 0;
}

.chapter-divider {
  text-align: center;
  margin: 16px 0;
  position: relative;
}

.chapter-divider::before,
.chapter-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #8b5a2b, transparent);
}

.chapter-divider::before { left: 0; }
.chapter-divider::after { right: 0; }

.chapter-divider span {
  background: #fffef8;
  padding: 0 12px;
  font-size: 11px;
  color: #8b5a2b;
  font-style: italic;
}

.transaction-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin: 4px 0;
  color: #666;
}

.info-row .label {
  color: #8b5a2b;
}

.book-divider {
  text-align: center;
  color: #d4c4a8;
  font-size: 10px;
  margin: 12px 0;
  letter-spacing: -1px;
}

.books-section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #5d3a1a;
  margin-bottom: 12px;
}

.book-item {
  display: flex;
  gap: 8px;
  padding: 10px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #e8dcc8;
}

.book-index {
  font-size: 12px;
  color: #8b5a2b;
  font-weight: 600;
  min-width: 20px;
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.book-author {
  font-size: 11px;
  color: #666;
  font-style: italic;
}

.book-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.isbn {
  font-size: 9px;
  color: #999;
  font-family: monospace;
}

.category {
  font-size: 9px;
  padding: 1px 6px;
  background: #f5efe6;
  border-radius: 3px;
  color: #8b5a2b;
}

.book-price-info {
  text-align: right;
  min-width: 60px;
}

.original-price {
  font-size: 10px;
  color: #999;
  text-decoration: line-through;
}

.current-price {
  font-size: 13px;
  font-weight: 600;
  color: #5d3a1a;
}

.qty {
  font-size: 10px;
  color: #888;
}

.double-wave {
  text-align: center;
  color: #d4c4a8;
  font-size: 10px;
  margin: 12px 0;
}

.summary-section {
  margin-bottom: 12px;
  padding: 12px;
  background: #f9f6f0;
  border-radius: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 5px 0;
  color: #555;
}

.summary-row.discount {
  color: #c0392b;
}

.summary-row.total {
  font-size: 15px;
  font-weight: 700;
  color: #5d3a1a;
  padding-top: 8px;
  border-top: 1px dashed #d4c4a8;
  margin-top: 8px;
}

.total-amount {
  font-size: 18px;
}

.payment-section {
  margin-bottom: 10px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
}

.member-section {
  margin-bottom: 12px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #f5efe6, #fffef8);
  border: 1px solid #d4c4a8;
  border-radius: 8px;
}

.card-icon {
  font-size: 20px;
}

.card-info {
  flex: 1;
}

.member-name {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #5d3a1a;
}

.member-id {
  display: block;
  font-size: 10px;
  color: #999;
}

.card-points {
  font-size: 12px;
  color: #8b5a2b;
  font-weight: 600;
}

.quote-section {
  text-align: center;
  padding: 12px;
  margin-bottom: 12px;
}

.quote-text {
  font-size: 11px;
  color: #8b5a2b;
  font-style: italic;
  margin: 0;
}

.receipt-footer {
  text-align: center;
  position: relative;
}

.barcode-section {
  margin-bottom: 8px;
}

.barcode {
  font-family: 'Libre Barcode 39', 'Courier New', monospace;
  font-size: 26px;
}

.footer-message {
  font-size: 11px;
  color: #8b5a2b;
  margin: 8px 0;
}

.footer-decoration {
  font-size: 10px;
  color: #d4c4a8;
  margin-top: 8px;
}
</style>
