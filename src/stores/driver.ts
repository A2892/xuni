import { defineStore } from 'pinia'

export const useDriverStore = defineStore('driver', {
  state: () => ({
    templates: [
      { id: 'CA', name: 'California (加州)', color: '#d4af37', bgColor: '#fef3c7' },
      { id: 'NY', name: 'New York (纽约州)', color: '#1e40af', bgColor: '#dbeafe' },
      { id: 'TX', name: 'Texas (德州)', color: '#dc2626', bgColor: '#fee2e2' },
      { id: 'FL', name: 'Florida (佛罗里达州)', color: '#059669', bgColor: '#d1fae5' },
      { id: 'IL', name: 'Illinois (伊利诺伊州)', color: '#7c3aed', bgColor: '#ede9fe' },
      { id: 'PA', name: 'Pennsylvania (宾州)', color: '#ea580c', bgColor: '#fed7aa' },
      { id: 'OH', name: 'Ohio (俄亥俄州)', color: '#0891b2', bgColor: '#cffafe' },
      { id: 'GA', name: 'Georgia (佐治亚州)', color: '#be123c', bgColor: '#fecdd3' },
      { id: 'NC', name: 'North Carolina (北卡)', color: '#4f46e5', bgColor: '#e0e7ff' },
      { id: 'MI', name: 'Michigan (密歇根州)', color: '#0d9488', bgColor: '#ccfbf1' }
    ],

    selectedTemplate: 'CA',

    driverInfo: {
      fullName: 'John Smith',
      licenseNumber: 'K01-75-4269',
      dateOfBirth: '1990-04-23',
      issueDate: '2013-10-21',
      expiryDate: '2025-04-23',
      address: '123 NORTH STREET',
      city: 'HOLTON',
      zipCode: '66436',
      licenseClass: 'C',
      sex: 'M',
      height: '5-10',
      weight: '180 lb',
      eyeColor: 'BRN',
      restrictions: 'NONE',
      endorsements: 'NONE',
      isDonor: true,
      dd: '0294443152',
      customId: '817165491923108',
      portrait: ''
    }
  }),

  actions: {
    updateDriverInfo(payload: Partial<any>) {
      this.driverInfo = { ...this.driverInfo, ...payload }
    },

    setTemplate(id: string) {
      this.selectedTemplate = id
    }
  }
})
