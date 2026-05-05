<template>
  <div class="general-receipt" :class="`size-${previewSize}`" :style="receiptStyle">
    <div class="receipt-paper" :class="`paper-${store.designSettings.paperStyle}`" :style="paperStyle">
      <!-- 商户头部 -->
      <div class="merchant-header" :style="headerStyle">
        <div v-if="store.data.merchantLogo && store.designSettings.showLogo" class="merchant-logo">
          <img :src="store.data.merchantLogo" alt="Logo" />
        </div>
        <h1 class="merchant-name">{{ store.data.merchantName }}</h1>
        <p class="merchant-address">{{ store.data.merchantAddress }}</p>
        <p class="merchant-phone">电话: {{ store.data.merchantPhone }}</p>
      </div>

      <div class="divider-line"></div>

      <!-- 收据信息 -->
      <div class="receipt-info">
        <div class="info-row">
          <span class="label">收据编号:</span>
          <span class="value">{{ store.data.receiptNumber }}</span>
        </div>
        <div class="info-row">
          <span class="label">日期:</span>
          <span class="value">{{ store.data.date }}</span>
        </div>
        <div class="info-row">
          <span class="label">时间:</span>
          <span class="value">{{ store.data.time }}</span>
        </div>
        <div class="info-row">
          <span class="label">收银员:</span>
          <span class="value">{{ store.data.cashier }}</span>
        </div>
      </div>

      <div class="divider-double" :style="{ borderColor: store.designSettings.primaryColor }"></div>

      <!-- 商品明细 -->
      <div class="items-section">
        <div class="items-header" :style="{ background: store.designSettings.primaryColor, color: '#fff' }">
          <span class="col-name">商品</span>
          <span class="col-qty">数量</span>
          <span class="col-price">单价</span>
          <span class="col-total">金额</span>
        </div>
        <div class="divider-thin"></div>
        
        <div v-for="item in store.data.items" :key="item.id" class="item-row">
          <span class="col-name">{{ item.name }}</span>
          <span class="col-qty">{{ item.quantity }}</span>
          <span class="col-price">{{ store.formatCurrency(item.unitPrice) }}</span>
          <span class="col-total">{{ store.formatCurrency(item.unitPrice * item.quantity) }}</span>
        </div>
      </div>

      <div class="divider-double" :style="{ borderColor: store.designSettings.primaryColor }"></div>

      <!-- 金额汇总 -->
      <div class="totals-section">
        <div class="total-row">
          <span>小计:</span>
          <span>{{ store.formatCurrency(store.calculatedSubtotal) }}</span>
        </div>
        <div v-if="store.data.discount > 0" class="total-row discount">
          <span>优惠:</span>
          <span>-{{ store.formatCurrency(store.data.discount) }}</span>
        </div>
        <div v-if="store.data.taxRate > 0" class="total-row">
          <span>税费 ({{ store.data.taxRate }}%):</span>
          <span>{{ store.formatCurrency(store.calculatedTaxAmount) }}</span>
        </div>
        <div class="total-row grand-total" :style="{ color: store.designSettings.accentColor }">
          <span>合计:</span>
          <span>{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
      </div>

      <div class="divider-line"></div>

      <!-- 支付信息 -->
      <div class="payment-section">
        <div class="payment-row">
          <span>支付方式:</span>
          <span>{{ store.data.paymentMethod }}</span>
        </div>
        <div v-if="store.data.cardType" class="payment-row">
          <span>卡类型:</span>
          <span>{{ store.data.cardType }}</span>
        </div>
        <div class="payment-row">
          <span>支付金额:</span>
          <span>{{ store.formatCurrency(store.calculatedGrandTotal) }}</span>
        </div>
        <div v-if="store.data.cardLast4" class="payment-row">
          <span>卡号:</span>
          <span>**** {{ store.data.cardLast4 }}</span>
        </div>
        <div v-if="store.data.approvalCode" class="payment-row">
          <span>授权码:</span>
          <span>{{ store.data.approvalCode }}</span>
        </div>
      </div>

      <!-- 签名区域 -->
      <div v-if="store.data.signatureType === 'text' && store.data.signatureText" class="signature-section">
        <div class="signature-line"></div>
        <div class="signature-text" :style="{ fontFamily: store.data.signatureFont }">{{ store.data.signatureText }}</div>
        <div class="signature-label">宾客签名 Guest Signature</div>
      </div>
      <div v-else-if="store.data.signatureType === 'image' && store.data.signatureImage" class="signature-section">
        <div class="signature-line"></div>
        <div class="signature-image">
          <img :src="store.data.signatureImage" alt="Signature" />
        </div>
        <div class="signature-label">宾客签名 Guest Signature</div>
      </div>

      <div class="divider-line"></div>

      <!-- 页脚 -->
      <div class="receipt-footer">
        <p class="footer-message">{{ store.data.footerMessage || '感谢您的惠顾!' }}</p>
        
        <div v-if="store.data.returnPolicy" class="return-policy">
          <p>{{ store.data.returnPolicy }}</p>
        </div>

        <!-- 条形码区域 -->
        <div v-if="store.barcodeSettings.showBarcode" class="barcode-section">
          <template v-if="store.barcodeSettings.useCustomBarcode && store.barcodeSettings.customBarcodeImage">
            <img :src="store.barcodeSettings.customBarcodeImage" alt="条形码" class="custom-barcode-img" />
          </template>
          <template v-else>
            <svg ref="barcodeRef" class="barcode-svg"></svg>
          </template>
          <span class="barcode-number">{{ store.barcodeSettings.barcodeContent || store.data.receiptNumber }}</span>
        </div>

        <p class="thank-you">* 谢谢光临 Thank You *</p>
      </div>

      <!-- 撕纸效果 -->
      <div class="tear-edge"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useReceiptStore } from '@/stores/receipt'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'
import JsBarcode from 'jsbarcode'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useReceiptStore()
const barcodeRef = ref<SVGElement>()

// 条形码内容
const barcodeContent = computed(() => {
  return store.barcodeSettings.barcodeContent || store.data.receiptNumber
})

// 渲染条形码
const renderBarcode = () => {
  if (!barcodeRef.value || store.barcodeSettings.useCustomBarcode) return
  try {
    JsBarcode(barcodeRef.value, barcodeContent.value, {
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

// 监听变化重新渲染
watch([barcodeContent, () => store.barcodeSettings.showBarcode, () => store.barcodeSettings.useCustomBarcode], () => {
  nextTick(() => {
    if (store.barcodeSettings.showBarcode && !store.barcodeSettings.useCustomBarcode) {
      renderBarcode()
    }
  })
}, { immediate: true })

onMounted(() => {
  nextTick(() => {
    renderBarcode()
  })
})

// 计算样式
const receiptStyle = computed(() => ({
  fontFamily: store.designSettings.fontFamily,
  fontSize: `${store.designSettings.fontSize}px`,
  color: store.designSettings.textColor,
  '--primary-color': store.designSettings.primaryColor,
  '--secondary-color': store.designSettings.secondaryColor,
  '--accent-color': store.designSettings.accentColor
}))

const paperStyle = computed(() => ({
  backgroundColor: store.designSettings.backgroundColor,
  borderRadius: `${store.designSettings.roundedCorners}px`,
  border: store.designSettings.showBorder 
    ? `${store.designSettings.borderWidth}px ${store.designSettings.borderStyle} ${store.designSettings.borderColor}` 
    : 'none',
  boxShadow: store.designSettings.showShadow ? '0 4px 20px rgba(0,0,0,0.1)' : 'none'
}))

const headerStyle = computed(() => ({
  borderBottom: `2px solid ${store.designSettings.primaryColor}`
}))
</script>

<style scoped>
.general-receipt {
  width: 300px;
  font-family: 'Courier New', 'SimHei', monospace;
}

.receipt-paper {
  background: #fff;
  padding: 20px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  position: relative;
}

.merchant-header {
  text-align: center;
  margin-bottom: 16px;
}

.merchant-logo img {
  max-height: 60px;
  margin-bottom: 10px;
}

.merchant-name {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  letter-spacing: 1px;
}

.merchant-address, .merchant-phone {
  font-size: 11px;
  color: #666;
  margin: 4px 0;
}

.divider-line {
  border-bottom: 1px dashed #ccc;
  margin: 12px 0;
}

.divider-double {
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  height: 4px;
  margin: 12px 0;
}

.divider-thin {
  border-bottom: 1px dotted #ddd;
  margin: 6px 0;
}

.receipt-info {
  margin: 12px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  padding: 3px 0;
}

.info-row .label {
  color: #666;
}

.info-row .value {
  color: #333;
}

.items-section {
  margin: 12px 0;
}

.items-header {
  display: grid;
  grid-template-columns: 1fr 50px 60px 60px;
  font-size: 10px;
  font-weight: bold;
  color: #666;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr 50px 60px 60px;
  font-size: 11px;
  padding: 8px 0;
  border-bottom: 1px dotted #eee;
}

.item-row:last-child {
  border-bottom: none;
}

.col-name {
  padding-right: 8px;
}

.col-qty, .col-price, .col-total {
  text-align: right;
}

.totals-section {
  margin: 12px 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 4px 0;
}

.total-row.discount {
  color: #e74c3c;
}

.total-row.grand-total {
  font-size: 16px;
  font-weight: bold;
  border-top: 1px dashed #333;
  margin-top: 8px;
  padding-top: 10px;
}

.payment-section {
  margin: 12px 0;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  padding: 3px 0;
}

.receipt-footer {
  text-align: center;
  margin-top: 16px;
}

.footer-message {
  font-size: 11px;
  color: #666;
  margin: 0 0 10px;
}

.return-policy {
  font-size: 10px;
  color: #888;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  margin: 10px 0;
}

.return-policy p {
  margin: 0;
}

.barcode-section {
  margin: 16px 0;
}

.barcode {
  font-family: 'Libre Barcode 39', monospace;
  font-size: 36px;
  letter-spacing: -3px;
  line-height: 1;
}

.barcode-svg {
  max-width: 100%;
  height: auto;
}

.custom-barcode-img {
  max-width: 100%;
  max-height: 60px;
  object-fit: contain;
}

.barcode-number {
  font-size: 10px;
  color: #666;
  display: block;
  margin-top: 4px;
}

.thank-you {
  font-size: 12px;
  font-weight: bold;
  margin: 12px 0 0;
  letter-spacing: 1px;
}

.tear-edge {
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(135deg, #fff 25%, transparent 25%),
              linear-gradient(225deg, #fff 25%, transparent 25%);
  background-size: 8px 8px;
}

/* 手机尺寸 */
.general-receipt.size-mobile {
  width: 280px;
}

.size-mobile .receipt-paper {
  padding: 16px 12px;
}

.size-mobile .merchant-name {
  font-size: 18px;
}

.size-mobile .items-header,
.size-mobile .item-row {
  grid-template-columns: 1fr 40px 50px 50px;
  font-size: 10px;
}

/* 电脑尺寸 */
.general-receipt.size-desktop {
  width: 380px;
}

.size-desktop .receipt-paper {
  padding: 28px 24px;
}

.size-desktop .merchant-name {
  font-size: 24px;
}

.size-desktop .item-row {
  font-size: 13px;
}

.size-desktop .total-row.grand-total {
  font-size: 18px;
}

/* 纸张风格 */
.paper-white {
  background: #ffffff;
}

.paper-cream {
  background: #faf8f5;
}

.paper-thermal {
  background: linear-gradient(to bottom, #fefefe 0%, #f5f5f5 100%);
}

.paper-premium {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%);
  border: 1px solid #e0e0e0;
}

/* 签名样式 */
.signature-section {
  margin: 20px 0;
  text-align: center;
  position: relative;
}

.signature-line {
  width: 80%;
  height: 1px;
  background: #000;
  margin: 0 auto 10px;
}

.signature-text {
  font-size: 24px;
  line-height: 1.2;
  margin-bottom: 4px;
  transform: rotate(-2deg);
}

.signature-image img {
  max-height: 60px;
  max-width: 80%;
}

.signature-label {
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* iPhone尺寸 */
.general-receipt.size-iphone {
  width: 320px;
}

.size-iphone .receipt-paper {
  padding: 18px 14px;
}

.size-iphone .merchant-name {
  font-size: 19px;
}
</style>
