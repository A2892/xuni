import { defineStore } from 'pinia'

export interface PropertyInfo {
  ownerName: string
  ownerIdCard: string
  certificateNumber: string
  propertyLocation: string
  propertyType: string
  propertyStructure: string
  totalFloors: number
  floor: number
  buildingArea: number
  landArea: number
  landUseType: string
  landUseYears: string
  registrationDate: string
  issueDate: string
  registrationAuthority: string
  remarks: string
}

export interface PropertySettings {
  showSeal: boolean
  sealUrl: string
  showQRCode: boolean
  certificateStyle: 'standard' | 'deluxe'
  watermarkText: string
  showWatermark: boolean
}

export const usePropertyStore = defineStore('property', {
  state: () => ({
    propertyInfo: {
      ownerName: 'John Doe',
      ownerIdCard: 'A12345678',
      certificateNumber: 'TITLE-2024-001',
      propertyLocation: '123 Oxford Street, London, W1D 1LP, UK',
      propertyType: 'Residential Apartment',
      propertyStructure: 'Concrete',
      totalFloors: 30,
      floor: 12,
      buildingArea: 120.5,
      landArea: 8.2,
      landUseType: 'Residential',
      landUseYears: '2024-01-15 to 2094-01-14',
      registrationDate: '2024-01-15',
      issueDate: '2024-01-16',
      registrationAuthority: 'HM Land Registry',
      remarks: ''
    } as PropertyInfo,
    
    settings: {
      showSeal: true,
      sealUrl: '',
      showQRCode: true,
      certificateStyle: 'standard',
      watermarkText: '中华人民共和国不动产权证书',
      showWatermark: true
    } as PropertySettings
  }),
  
  actions: {
    updatePropertyInfo(info: Partial<PropertyInfo>) {
      this.propertyInfo = { ...this.propertyInfo, ...info }
    },
    
    updateSettings(settings: Partial<PropertySettings>) {
      this.settings = { ...this.settings, ...settings }
    }
  }
})
