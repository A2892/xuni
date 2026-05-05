import { defineStore } from 'pinia'

export interface VehicleInfo {
  ownerName: string
  ownerIdCard: string
  plateNumber: string
  vehicleType: string
  brand: string
  model: string
  vin: string
  engineNumber: string
  registerDate: string
  issueDate: string
  useCharacter: string
  vehicleColor: string
  fuelType: string
  displacement: string
  power: string
  seats: number
  grossMass: number
  unloadedMass: number
  approvedLoad: number
  overallDimension: string
  registrationAuthority: string
  remarks: string
}

export interface VehicleSettings {
  showSeal: boolean
  sealUrl: string
  showPhoto: boolean
  vehiclePhotoUrl: string
  certificateStyle: 'standard' | 'deluxe'
  watermarkText: string
  showWatermark: boolean
}

export const useVehicleStore = defineStore('vehicle', {
  state: () => ({
    vehicleInfo: {
      ownerName: 'Jane Smith',
      ownerIdCard: 'B98765432',
      plateNumber: 'AB12 CDE',
      vehicleType: 'Passenger Car',
      brand: 'Tesla',
      model: 'Model 3 Long Range',
      vin: 'LRW3E7FS8PC012345',
      engineNumber: 'Electric',
      registerDate: '2024-01-20',
      issueDate: '2024-01-21',
      useCharacter: '非营运',
      vehicleColor: '珍珠白',
      fuelType: '纯电动',
      displacement: '',
      power: '202kW',
      seats: 5,
      grossMass: 2170,
      unloadedMass: 1847,
      approvedLoad: 323,
      overallDimension: '4720×1850×1445',
      registrationAuthority: '北京市公安局公安交通管理局车辆管理所',
      remarks: ''
    } as VehicleInfo,
    
    settings: {
      showSeal: true,
      sealUrl: '',
      showPhoto: true,
      vehiclePhotoUrl: '',
      certificateStyle: 'standard',
      watermarkText: '中华人民共和国机动车登记证书',
      showWatermark: true
    } as VehicleSettings
  }),
  
  actions: {
    updateVehicleInfo(info: Partial<VehicleInfo>) {
      this.vehicleInfo = { ...this.vehicleInfo, ...info }
    },
    
    updateSettings(settings: Partial<VehicleSettings>) {
      this.settings = { ...this.settings, ...settings }
    }
  }
})
