import { defineStore } from 'pinia'
import type { PassportInfo } from '@/types'

export const usePassportStore = defineStore('passport', {
  state: () => ({
    passportInfo: {
      country: 'GERMANY',
      passportType: 'P',
      passportNumber: 'C01X0006H',
      surname: 'MUSTERMANN',
      givenNames: 'ERIKA',
      nationality: 'DEUTSCH',
      dateOfBirth: '12.08.1964',
      sex: 'F',
      placeOfBirth: 'BERLIN',
      dateOfIssue: '01.08.2020',
      dateOfExpiry: '31.07.2030',
      authority: 'BUNDESDRUCKEREI GMBH',
      photo: '',
      signature: ''
    } as PassportInfo
  }),

  actions: {
    updatePassportInfo(updates: Partial<PassportInfo>) {
      this.passportInfo = { ...this.passportInfo, ...updates }
    },

    resetToDefault() {
      this.passportInfo = {
        country: 'GERMANY',
        passportType: 'P',
        passportNumber: 'C01X0006H',
        surname: 'MUSTERMANN',
        givenNames: 'ERIKA',
        nationality: 'DEUTSCH',
        dateOfBirth: '12.08.1964',
        sex: 'F',
        placeOfBirth: 'BERLIN',
        dateOfIssue: '01.08.2020',
        dateOfExpiry: '31.07.2030',
        authority: 'BUNDESDRUCKEREI GMBH',
        photo: '',
        signature: ''
      }
    }
  }
})
