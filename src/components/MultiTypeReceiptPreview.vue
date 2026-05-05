<template>
  <component 
    :is="receiptComponent" 
    :preview-size="previewSize"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReceiptStore, type ReceiptType } from '@/stores/receipt'
import type { PreviewSize } from '@/components/PreviewSizeSelector.vue'

// 收据组件
import LuxuryMallReceipt from './receipts/LuxuryMallReceipt.vue'
import LuxuryRestaurantReceipt from './receipts/LuxuryRestaurantReceipt.vue'
import SupermarketReceipt from './receipts/SupermarketReceipt.vue'
import CasualRestaurantReceipt from './receipts/CasualRestaurantReceipt.vue'
import CafeReceipt from './receipts/CafeReceipt.vue'
import HotelReceipt from './receipts/HotelReceipt.vue'
import GeneralReceipt from './receipts/GeneralReceipt.vue'
import CinemaReceipt from './receipts/CinemaReceipt.vue'
import GasStationReceipt from './receipts/GasStationReceipt.vue'
import PharmacyReceipt from './receipts/PharmacyReceipt.vue'
import BeautySalonReceipt from './receipts/BeautySalonReceipt.vue'
import GymReceipt from './receipts/GymReceipt.vue'
import ParkingReceipt from './receipts/ParkingReceipt.vue'
import BookstoreReceipt from './receipts/BookstoreReceipt.vue'
import ElectronicsReceipt from './receipts/ElectronicsReceipt.vue'
import LaundryReceipt from './receipts/LaundryReceipt.vue'

const props = withDefaults(defineProps<{
  previewSize?: PreviewSize
}>(), {
  previewSize: 'original'
})

const store = useReceiptStore()

const componentMap: Record<ReceiptType, any> = {
  'luxury-mall': LuxuryMallReceipt,
  'luxury-restaurant': LuxuryRestaurantReceipt,
  'supermarket': SupermarketReceipt,
  'casual-restaurant': CasualRestaurantReceipt,
  'cafe': CafeReceipt,
  'hotel': HotelReceipt,
  'general': GeneralReceipt,
  'cinema': CinemaReceipt,
  'gas-station': GasStationReceipt,
  'pharmacy': PharmacyReceipt,
  'beauty-salon': BeautySalonReceipt,
  'gym': GymReceipt,
  'parking': ParkingReceipt,
  'bookstore': BookstoreReceipt,
  'electronics': ElectronicsReceipt,
  'laundry': LaundryReceipt
}

const receiptComponent = computed(() => {
  return componentMap[store.data.receiptType] || GeneralReceipt
})
</script>
