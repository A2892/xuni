import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useWatermarkStore = defineStore('watermark', () => {
  const settings = reactive({
    // 文字水印设置
    textWatermarkEnabled: false,
    textWatermarkText: 'OFFICIAL DOCUMENT',
    textWatermarkSize: 14,
    textWatermarkColor: '#000000',
    textWatermarkOpacity: 5,
    textWatermarkRotation: -30,
    textWatermarkFontFamily: 'Times New Roman',

    // 全屏水印设置
    fullScreenWatermarkEnabled: false,
    fullScreenWatermarkText: 'OFFICIAL DOCUMENT',
    fullScreenWatermarkSize: 14,
    fullScreenWatermarkColor: '#000000',
    fullScreenWatermarkAngle: -45,
    fullScreenWatermarkOpacity: 5,
    fullScreenWatermarkSpacing: 200,
    fullScreenWatermarkFontFamily: 'Times New Roman',

    // 花纹
    cornerPatternEnabled: false,
    cornerPattern: 'Corner Pattern',
    cornerPosition: 'All Positions',
    cornerColor: '#1e40af',
    cornerOpacity: 15,
    cornerSize: 30,

    // 覆盖选项
    watermarkOverlay: false,
    // per-type overlay flags
    watermarkOverlayFullscreen: false,
    watermarkOverlayText: false,
    // legacy alias for compatibility
    // legacy alias for compatibility removed: diagonalOverlay
  })

  return {
    settings
  }
})
