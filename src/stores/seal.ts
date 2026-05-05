import { defineStore } from 'pinia'
import type { OfficialSeal } from '@/types'

export const useSealStore = defineStore('seal', {
  state: () => ({
    sealInfo: {
      organizationName: '某某大学',
      sealNumber: 'NO.123456789',
      sealType: '行政章',
      sealShape: 'circular',
      sealSize: 200,
      outerDiameter: 200,
      innerDiameter: 180,
      starSize: 30,
      borderWidth: 3,
      borderColor: '#D32F2F',
      textColor: '#D32F2F',
      starColor: '#D32F2F',
      fontSize: 18,
      bottomText: '',
      showStar: true,
      showSerialNumber: true,
      textArrangement: 'circular',
      fontFamily: '宋体',
      rotationAngle: 0,
      enableEmbossEffect: true,
      enableTexture: true,
      textureOpacity: 20,
      inkEffect: 'normal'
    } as OfficialSeal,
    
    presetSeals: [
      {
        name: '大学行政章',
        organizationName: '某某大学',
        sealType: '行政章',
        bottomText: '',
        showStar: true,
        borderColor: '#D32F2F',
        textColor: '#D32F2F',
        starColor: '#D32F2F'
      },
      {
        name: '学院公章',
        organizationName: '某某学院',
        sealType: '公章',
        bottomText: '',
        showStar: true,
        borderColor: '#D32F2F',
        textColor: '#D32F2F',
        starColor: '#D32F2F'
      },
      {
        name: '财务专用章',
        organizationName: '某某大学财务处',
        sealType: '财务专用章',
        bottomText: '财务专用章',
        showStar: false,
        borderColor: '#D32F2F',
        textColor: '#D32F2F',
        starColor: '#D32F2F'
      },
      {
        name: '合同专用章',
        organizationName: '某某大学',
        sealType: '合同专用章',
        bottomText: '合同专用章',
        showStar: false,
        borderColor: '#D32F2F',
        textColor: '#D32F2F',
        starColor: '#D32F2F'
      },
      {
        name: 'Oxford University',
        organizationName: 'UNIVERSITY OF OXFORD',
        sealType: 'Official Seal',
        bottomText: 'DOMINUS ILLUMINATIO MEA',
        showStar: false,
        borderColor: '#002147',
        textColor: '#002147',
        starColor: '#002147'
      },
      {
        name: 'Cambridge University',
        organizationName: 'UNIVERSITY OF CAMBRIDGE',
        sealType: 'Official Seal',
        bottomText: 'HINC LUCEM ET POCULA SACRA',
        showStar: false,
        borderColor: '#A3C1AD',
        textColor: '#A3C1AD',
        starColor: '#A3C1AD'
      },
      {
        name: 'Imperial College',
        organizationName: 'IMPERIAL COLLEGE LONDON',
        sealType: 'Official Seal',
        bottomText: 'SCIENTIA IMPERII DECUS ET TUTAMEN',
        showStar: false,
        borderColor: '#003E74',
        textColor: '#003E74',
        starColor: '#003E74'
      },
      {
        name: 'UCL',
        organizationName: 'UNIVERSITY COLLEGE LONDON',
        sealType: 'Official Seal',
        bottomText: 'LET ALL COME WHO BY MERIT DESERVE',
        showStar: false,
        borderColor: '#500778',
        textColor: '#500778',
        starColor: '#500778'
      },
      {
        name: 'Edinburgh University',
        organizationName: 'UNIVERSITY OF EDINBURGH',
        sealType: 'Official Seal',
        bottomText: 'FOUNDED 1583',
        showStar: false,
        borderColor: '#C41230',
        textColor: '#C41230',
        starColor: '#C41230'
      },
      {
        name: 'Manchester University',
        organizationName: 'THE UNIVERSITY OF MANCHESTER',
        sealType: 'Official Seal',
        bottomText: 'KNOWLEDGE • WISDOM • HUMANITY',
        showStar: false,
        borderColor: '#660099',
        textColor: '#660099',
        starColor: '#660099'
      }
    ]
  }),

  actions: {
    updateSealInfo(updates: Partial<OfficialSeal>) {
      this.sealInfo = { ...this.sealInfo, ...updates }
    },

    applyPreset(preset: any) {
      this.sealInfo = {
        ...this.sealInfo,
        organizationName: preset.organizationName,
        sealType: preset.sealType,
        bottomText: preset.bottomText,
        showStar: preset.showStar
      }
    },

    resetToDefault() {
      this.sealInfo = {
        organizationName: '某某大学',
        sealNumber: 'NO.123456789',
        sealType: '行政章',
        sealShape: 'circular',
        sealSize: 200,
        outerDiameter: 200,
        innerDiameter: 180,
        starSize: 30,
        borderWidth: 3,
        borderColor: '#D32F2F',
        textColor: '#D32F2F',
        starColor: '#D32F2F',
        fontSize: 18,
        bottomText: '',
        showStar: true,
        showSerialNumber: true,
        textArrangement: 'circular',
        fontFamily: '宋体',
        rotationAngle: 0,
        enableEmbossEffect: true,
        enableTexture: true,
        textureOpacity: 20,
        inkEffect: 'normal'
      }
    }
  }
})
