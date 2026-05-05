<template>
  <div class="cn-code-view">
    <div class="header">
      <h1>二维码 / 条形码 生成器</h1>
      <p class="subtitle">生成用于国内使用的二维码与条形码，支持下载为 PNG 或 SVG。</p>
    </div>

    <div class="tabs">
      <button :class="['tab', { active: activeTab === 'qrcode' }]" @click="activeTab = 'qrcode'">📷 二维码</button>
      <button :class="['tab', { active: activeTab === 'barcode' }]" @click="activeTab = 'barcode'">🔢 条形码</button>
    </div>

    <div class="panel">
      <div class="controls">
        <label>内容</label>
        <input v-model="content" placeholder="输入要编码的文本（必填）" />

        <div v-if="activeTab === 'qrcode'" class="qrcode-controls">
          <label>尺寸 (px)</label>
          <input type="number" v-model.number="size" min="64" max="2048" />

          <label>边距</label>
          <input type="number" v-model.number="margin" min="0" max="50" />

          <label>容错级别</label>
          <select v-model="ecLevel">
            <option value="L">L (7%)</option>
            <option value="M">M (15%)</option>
            <option value="Q">Q (25%)</option>
            <option value="H">H (30%)</option>
          </select>

          <label>前景色</label>
          <input type="color" v-model="fgColor" />

          <label>背景色</label>
          <input type="color" v-model="bgColor" />

          <label>Logo (可选，支持 PNG/JPG)</label>
          <input type="file" accept="image/*" @change="handleLogoUpload" />

          <label>导出清晰度倍率</label>
          <input type="number" v-model.number="exportScale" min="1" max="6" />

          <label>Logo 位置</label>
          <select v-model="logoPosition">
            <option value="center">居中</option>
            <option value="top-left">左上</option>
            <option value="top-right">右上</option>
            <option value="bottom-left">左下</option>
            <option value="bottom-right">右下</option>
          </select>

          <label>Logo 内边距 (px)</label>
          <input type="number" v-model.number="logoPadding" min="0" max="50" />

          <label><input type="checkbox" v-model="logoWhiteBg" /> 在 Logo 后添加白色底以增强可读性</label>

          <hr />

          <label><input type="checkbox" v-model="enableGradient" /> 启用前景渐变</label>
          <div v-if="enableGradient">
            <label>渐变起始色</label>
            <input type="color" v-model="gradientStart" />
            <label>渐变结束色</label>
            <input type="color" v-model="gradientEnd" />
            <label>渐变方向</label>
            <select v-model="gradientDirection">
              <option value="vertical">垂直</option>
              <option value="horizontal">水平</option>
            </select>
          </div>

          <div v-if="contrastWarning" class="warning-note">⚠️ 色彩对比可能不足，二维码识别可能受影响：{{ contrastWarning }}</div>

          <label>预设</label>
          <select v-model="selectedPreset" @change="applyPreset">
            <option value="">— 选择预设 —</option>
            <option v-for="p in presets" :key="p.name" :value="p.name">{{ p.name }}</option>
          </select>

          <div class="preset-actions">
            <input v-model="newPresetName" placeholder="保存当前配置为预设名称" />
            <button @click="savePreset" :disabled="!newPresetName">保存预设</button>
            <button @click="exportPresets">导出预设</button>
            <input type="file" accept="application/json" @change="importPresets" />
          </div>

          <div class="control-actions">
            <button @click="generateQRCode" :disabled="loading || !content">生成二维码</button>
            <button @click="copyQRCode" :disabled="!generatedDataUrl">复制到剪贴板</button>
          </div>
        </div>

        <div v-else class="barcode-controls">
          <SaveLoadPanel document-type="barcode" :get-data="getBarcodeData" :set-data="setBarcodeData" />
          <label>类型</label>
          <select v-model="barcodeFormat">
            <option value="CODE128">CODE128</option>
            <option value="EAN13">EAN13</option>
            <option value="CODE39">CODE39</option>
          </select>

          <label>宽度 (每条线宽度)</label>
          <input type="number" v-model.number="barcodeWidth" min="1" max="10" />

          <label>高度 (px)</label>
          <input type="number" v-model.number="barcodeHeight" min="20" max="400" />

          <label>显示文字字号</label>
          <input type="number" v-model.number="barcodeFontSize" min="8" max="36" />

          <label><input type="checkbox" v-model="autoFillEAN13" /> EAN13 自动补齐校验位（当输入 12 位数字时自动补齐）</label>

          <div class="control-actions">
            <button @click="generateBarcode" :disabled="loading || !content">生成条形码</button>
            <button @click="downloadBarcodePng" :disabled="!generatedSvg">下载 PNG</button>
          </div>
        </div>

        <div class="batch-section">
          <h3>批量生成</h3>
          <label>CSV 文件（第一行为表头，包含要编码的列）</label>
          <input type="file" accept=".csv,text/csv" @change="handleCsvFile" />

          <div v-if="parsedRows && parsedRows.length">
            <p>解析到 {{ parsedRows.length }} 行（不含表头）</p>
            <label>选择内容列</label>
            <select v-model="contentColumn">
              <option v-for="(h,i) in parsedHeaders" :key="i" :value="h">{{ h }}</option>
            </select>
            <label>文件名前缀</label>
            <input v-model="batchPrefix" placeholder="例如: school_qr" />
            <div class="control-actions">
              <button @click="startBatchGenerate" :disabled="isBatching || !contentColumn">开始批量生成并打包 ZIP</button>
              <button @click="cancelBatch" v-if="isBatching">取消</button>
            </div>
            <div v-if="isBatching">进度: {{ batchProgress }} / {{ parsedRows.length }}</div>
          </div>
        </div>

        <div class="download-actions" v-if="generatedDataUrl || generatedSvg">
          <template v-if="activeTab === 'qrcode'">
            <button v-if="generatedDataUrl" @click="downloadDataUrl('qrcode.png')">下载 高清 PNG</button>
            <button v-if="generatedSvg" @click="downloadSvgFromDataUrl('qrcode.svg', generatedSvg)">下载 SVG</button>
          </template>
          <template v-else>
            <button v-if="generatedSvg" @click="downloadSvg('barcode.svg')">下载 SVG</button>
            <button v-if="generatedSvg" @click="downloadBarcodePng">下载 PNG</button>
          </template>
        </div>
      </div>

      <div class="preview">
        <canvas ref="qrCanvas" style="display:none"></canvas>
        <div v-if="loading" class="preview-loading">生成中…</div>

        <div v-if="activeTab === 'qrcode' && generatedDataUrl" class="preview-content">
          <img :src="generatedDataUrl" alt="二维码预览" />
        </div>

        <div v-if="activeTab === 'barcode' && generatedSvg" class="preview-content">
          <div ref="svgContainer" v-html="generatedSvg"></div>
        </div>

        <div v-if="!generatedDataUrl && !generatedSvg && !loading" class="preview-empty">请先填写内容并点击生成</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import JSZip from 'jszip'
import Papa from 'papaparse' 
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'


const activeTab = ref<'qrcode' | 'barcode'>('qrcode')
const content = ref('')
const size = ref(300)
const margin = ref(4)
const ecLevel = ref<'L'|'M'|'Q'|'H'>('M')

const barcodeFormat = ref<'CODE128'|'EAN13'|'CODE39'>('CODE128')
const barcodeWidth = ref(2)
const barcodeHeight = ref(100)

const generatedDataUrl = ref<string>('') // for QR PNG
const generatedSvg = ref<string>('') // for SVG content (barcode or qr svg)
const svgContainer = ref<HTMLElement | null>(null)
const loading = ref(false)

// 高级选项
const fgColor = ref<string>('#000000')
const bgColor = ref<string>('#ffffff')
const logoFile = ref<File | null>(null)
const logoDataUrl = ref<string>('')
const exportScale = ref<number>(3)
const qrCanvas = ref<HTMLCanvasElement | null>(null)

// logo / position
const logoPosition = ref<'center'|'top-left'|'top-right'|'bottom-left'|'bottom-right'>('center')
const logoPadding = ref<number>(6)
const logoWhiteBg = ref<boolean>(true)

// gradient
const enableGradient = ref<boolean>(false)
const gradientStart = ref<string>('#000000')
const gradientEnd = ref<string>('#333333')
const gradientDirection = ref<'vertical'|'horizontal'>('vertical')

// presets
const presets = ref<{ name: string; config: any }[]>( (() => {
  try {
    const raw = localStorage.getItem('cn_code_presets')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
})() )
const selectedPreset = ref<string>('')
const newPresetName = ref<string>('')

const contrastWarning = ref<string>('')

const resetContrastWarning = () => { contrastWarning.value = '' }

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '')
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

const luminance = (r:number,g:number,b:number) => {
  const srgb = [r,g,b].map(v => v/255).map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4))
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2]
}

const contrastRatio = (hex1:string, hex2:string) => {
  const a = luminance(...Object.values(hexToRgb(hex1)))
  const b = luminance(...Object.values(hexToRgb(hex2)))
  const L1 = Math.max(a,b)
  const L2 = Math.min(a,b)
  return (L1 + 0.05) / (L2 + 0.05)
}

const savePresetsToStorage = () => {
  try { localStorage.setItem('cn_code_presets', JSON.stringify(presets.value)) } catch(e){}
}

const savePreset = () => {
  const cfg = {
    size: size.value,
    margin: margin.value,
    ecLevel: ecLevel.value,
    fgColor: fgColor.value,
    bgColor: bgColor.value,
    enableGradient: enableGradient.value,
    gradientStart: gradientStart.value,
    gradientEnd: gradientEnd.value,
    gradientDirection: gradientDirection.value,
    logoPosition: logoPosition.value,
    logoPadding: logoPadding.value,
    logoWhiteBg: logoWhiteBg.value,
    exportScale: exportScale.value
  }
  presets.value.push({ name: newPresetName.value, config: cfg })
  newPresetName.value = ''
  savePresetsToStorage()
}

const applyPreset = () => {
  const preset = presets.value.find(p => p.name === selectedPreset.value)
  if (!preset) return
  const c = preset.config
  size.value = c.size || size.value
  margin.value = c.margin || margin.value
  ecLevel.value = c.ecLevel || ecLevel.value
  fgColor.value = c.fgColor || fgColor.value
  bgColor.value = c.bgColor || bgColor.value
  enableGradient.value = c.enableGradient || enableGradient.value
  gradientStart.value = c.gradientStart || gradientStart.value
  gradientEnd.value = c.gradientEnd || gradientEnd.value
  gradientDirection.value = c.gradientDirection || gradientDirection.value
  logoPosition.value = c.logoPosition || logoPosition.value
  logoPadding.value = c.logoPadding || logoPadding.value
  logoWhiteBg.value = c.logoWhiteBg !== undefined ? c.logoWhiteBg : logoWhiteBg.value
  exportScale.value = c.exportScale || exportScale.value
}

const exportPresets = () => {
  const blob = new Blob([JSON.stringify(presets.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cn-code-presets.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const importPresets = (e: Event) => {
  const f = (e.target as HTMLInputElement)?.files?.[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const arr = JSON.parse(String(reader.result || ''))
      if (Array.isArray(arr)) {
        presets.value = arr
        savePresetsToStorage()
        alert('导入完成')
      }
    } catch (e) {
      alert('导入失败，文件格式不正确')
    }
  }
  reader.readAsText(f, 'utf-8')
}

const deletePreset = (name:string) => {
  presets.value = presets.value.filter(p => p.name !== name)
  savePresetsToStorage()
}

const updateContrastWarning = () => {
  resetContrastWarning()
  if (enableGradient.value) {
    const avg = (hexToRgb(gradientStart.value).r + hexToRgb(gradientStart.value).g + hexToRgb(gradientStart.value).b + hexToRgb(gradientEnd.value).r + hexToRgb(gradientEnd.value).g + hexToRgb(gradientEnd.value).b) / 6
    const avgHex = '#'+(((1<<24)+ (Math.round(avg)<<16) + (Math.round(avg)<<8) + Math.round(avg)).toString(16).slice(1))
    const cr = contrastRatio(avgHex, bgColor.value)
    if (cr < 3) contrastWarning.value = `对比度过低 (${cr.toFixed(2)})`
  } else {
    const cr = contrastRatio(fgColor.value, bgColor.value)
    if (cr < 3) contrastWarning.value = `对比度过低 (${cr.toFixed(2)})`
  }
}

watch([fgColor, bgColor, enableGradient, gradientStart, gradientEnd], () => updateContrastWarning())

// barcode advanced
const autoFillEAN13 = ref<boolean>(true)
const barcodeFontSize = ref<number>(14)

// 数据管理（条形码）——与 StudentID 的 SaveLoadPanel 逻辑保持一致
const getBarcodeData = () => ({
  content: content.value,
  barcodeFormat: barcodeFormat.value,
  barcodeWidth: barcodeWidth.value,
  barcodeHeight: barcodeHeight.value,
  barcodeFontSize: barcodeFontSize.value,
  autoFillEAN13: autoFillEAN13.value
})

const setBarcodeData = (data: any) => {
  if (data.content !== undefined) content.value = data.content
  if (data.barcodeFormat) barcodeFormat.value = data.barcodeFormat
  if (data.barcodeWidth !== undefined) barcodeWidth.value = data.barcodeWidth
  if (data.barcodeHeight !== undefined) barcodeHeight.value = data.barcodeHeight
  if (data.barcodeFontSize !== undefined) barcodeFontSize.value = data.barcodeFontSize
  if (data.autoFillEAN13 !== undefined) autoFillEAN13.value = data.autoFillEAN13
}

const handleLogoUpload = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0] || null
  logoFile.value = file
  if (!file) {
    logoDataUrl.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    logoDataUrl.value = String(reader.result)
  }
  reader.readAsDataURL(file)
}

const generateQRCode = async () => {
  if (!content.value) return
  loading.value = true
  generatedDataUrl.value = ''
  generatedSvg.value = ''

  try {
    await nextTick()
    const scale = exportScale.value || 1
    const finalSize = Math.max(64, size.value) * scale

    // 临时 canvas 生成纯黑色模块、透明背景的二维码，用于 mask
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = finalSize
    maskCanvas.height = finalSize

    await QRCode.toCanvas(maskCanvas, content.value, {
      width: finalSize,
      margin: (margin.value || 0) * scale,
      errorCorrectionLevel: ecLevel.value,
      color: { dark: '#000000', light: 'rgba(0,0,0,0)' }
    })

    // 目标 canvas
    const canvas = qrCanvas.value || document.createElement('canvas')
    canvas.width = finalSize
    canvas.height = finalSize
    const ctx = canvas.getContext('2d')!

    // 背景填充
    ctx.fillStyle = bgColor.value
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制前景：如果启用了渐变，则先绘制渐变到目标，然后用 mask 做裁切
    if (enableGradient.value) {
      let grad: CanvasGradient
      if (gradientDirection.value === 'vertical') {
        grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      } else {
        grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
      }
      grad.addColorStop(0, gradientStart.value)
      grad.addColorStop(1, gradientEnd.value)
      ctx.fillStyle = grad as any
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // mask: destination-in 保留已绘制区域与 mask 的相交部分
      ctx.globalCompositeOperation = 'destination-in'
      ctx.drawImage(maskCanvas, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    } else {
      // 直接绘制二维码，背景保持 bgColor
      await QRCode.toCanvas(canvas, content.value, {
        width: finalSize,
        margin: (margin.value || 0) * scale,
        errorCorrectionLevel: ecLevel.value,
        color: { dark: fgColor.value, light: bgColor.value }
      })
    }

    // 如果没有使用渐变，但我们 used mask earlier? ensure if we used mask path we have generated the QR onto canvas.
    // 叠加 Logo (按位置)
    if (logoDataUrl.value) {
      await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const logoSize = finalSize * 0.18
          const pad = Math.max(2, logoPadding.value)
          let x = (finalSize - logoSize) / 2
          let y = (finalSize - logoSize) / 2
          switch (logoPosition.value) {
            case 'top-left': x = pad; y = pad; break
            case 'top-right': x = finalSize - logoSize - pad; y = pad; break
            case 'bottom-left': x = pad; y = finalSize - logoSize - pad; break
            case 'bottom-right': x = finalSize - logoSize - pad; y = finalSize - logoSize - pad; break
            case 'center': default: break
          }

          if (logoWhiteBg.value) {
            ctx.fillStyle = '#fff'
            const bbPad = Math.max(4, pad)
            ctx.fillRect(x - bbPad/2, y - bbPad/2, logoSize + bbPad, logoSize + bbPad)
          }

          ctx.drawImage(img, x, y, logoSize, logoSize)
          resolve(null)
        }
        img.onerror = () => resolve(null)
        img.src = logoDataUrl.value
      })
    }

    generatedDataUrl.value = canvas.toDataURL('image/png')

    // 生成 SVG（保留普通 SVG 生成方式）
    let svgStr = await QRCode.toString(content.value, { type: 'svg', width: size.value, margin: margin.value, errorCorrectionLevel: ecLevel.value })
    // 嵌入 logo 到 SVG（居中或近似定位）
    if (logoDataUrl.value) {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(svgStr, 'image/svg+xml')
        const svgEl = doc.documentElement
        const logoSize = size.value * 0.18
        let x = (size.value - logoSize) / 2
        let y = (size.value - logoSize) / 2
        if (logoPosition.value === 'top-left') { x = logoPadding.value; y = logoPadding.value }
        if (logoPosition.value === 'top-right') { x = size.value - logoSize - logoPadding.value; y = logoPadding.value }
        if (logoPosition.value === 'bottom-left') { x = logoPadding.value; y = size.value - logoSize - logoPadding.value }
        if (logoPosition.value === 'bottom-right') { x = size.value - logoSize - logoPadding.value; y = size.value - logoSize - logoPadding.value }
        const imgEl = doc.createElementNS('http://www.w3.org/2000/svg', 'image')
        imgEl.setAttribute('href', logoDataUrl.value)
        imgEl.setAttribute('x', String(x))
        imgEl.setAttribute('y', String(y))
        imgEl.setAttribute('width', String(logoSize))
        imgEl.setAttribute('height', String(logoSize))
        if (logoWhiteBg.value) {
          const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect')
          rect.setAttribute('x', String(x - 4))
          rect.setAttribute('y', String(y - 4))
          rect.setAttribute('width', String(logoSize + 8))
          rect.setAttribute('height', String(logoSize + 8))
          rect.setAttribute('fill', '#fff')
          svgEl.appendChild(rect)
        }
        svgEl.appendChild(imgEl)
        svgStr = new XMLSerializer().serializeToString(svgEl)
      } catch (e) {
        console.warn('嵌入 logo 到 SVG 失败', e)
      }
    }

    generatedSvg.value = svgStr
  } catch (e) {
    console.error('生成二维码失败', e)
    alert('生成二维码失败，请检查输入')
  } finally {
    loading.value = false
  }
}

const computeEAN13Checksum = (digits12: string) => {
  const digits = digits12.split('').map(d => parseInt(d, 10))
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3)
  }
  const mod10 = sum % 10
  return mod10 === 0 ? '0' : String(10 - mod10)
}

const generateBarcode = async () => {
  if (!content.value) return

  let barContent = content.value
  if (barcodeFormat.value === 'EAN13') {
    if (/^\d{12}$/.test(barContent) && autoFillEAN13.value) {
      barContent = barContent + computeEAN13Checksum(barContent)
    }
    if (!/^\d{13}$/.test(barContent)) {
      alert('EAN13 条码要求 13 位数字（或启用自动补齐）')
      return
    }
  }

  loading.value = true
  generatedDataUrl.value = ''
  generatedSvg.value = ''
  try {
    await nextTick()
    if (svgContainer.value) {
      svgContainer.value.innerHTML = ''
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      svgContainer.value.appendChild(svg)
      JsBarcode(svg as any, barContent, {
        format: barcodeFormat.value,
        width: barcodeWidth.value,
        height: barcodeHeight.value,
        displayValue: true,
        fontSize: barcodeFontSize.value
      })
      generatedSvg.value = (svg.outerHTML as string)
    }
  } catch (e) {
    console.error('生成条形码失败', e)
    alert('生成条形码失败，请检查输入与格式')
  } finally {
    loading.value = false
  }
}

// 复制 PNG 到剪贴板
const copyQRCode = async () => {
  if (!generatedDataUrl.value || !('clipboard' in navigator)) return
  try {
    const res = await fetch(generatedDataUrl.value)
    const blob = await res.blob()
    // @ts-ignore clipboard api
    await (navigator as any).clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    alert('已复制到剪贴板')
  } catch (e) {
    console.error('复制失败', e)
    alert('复制失败，请在支持的浏览器中重试')
  }
}

const downloadDataUrl = (filename: string) => {
  if (!generatedDataUrl.value) return
  const a = document.createElement('a')
  a.href = generatedDataUrl.value
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const downloadSvg = (filename: string) => {
  if (!generatedSvg.value) return
  const blob = new Blob([generatedSvg.value], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const downloadSvgFromDataUrl = (filename: string, svgStr: string) => {
  if (!svgStr) return
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 将 SVG 下载为 PNG（可设置 scale）
const downloadSvgAsPngWithScale = (filename: string, scale = 2) => {
  if (!generatedSvg.value) return
  const svg = generatedSvg.value
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = (img.width || size.value) * scale
    canvas.height = (img.height || size.value) * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const pngUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = pngUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  img.onerror = () => {
    alert('SVG 转 PNG 失败')
    URL.revokeObjectURL(url)
  }
  img.src = url
}

const downloadBarcodePng = () => {
  downloadSvgAsPngWithScale('barcode.png', 3)
}

// ========== 批量生成功能 ==========
const parsedRows = ref<any[]>([])
const parsedHeaders = ref<string[]>([])
const contentColumn = ref<string>('')
const batchPrefix = ref<string>('codes')
const batchProgress = ref<number>(0)
const isBatching = ref<boolean>(false)
let _batchAbort = { aborted: false }

const handleCsvFile = (e: Event) => {
  const f = (e.target as HTMLInputElement)?.files?.[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result || '')
    const res = Papa.parse(text, { header: true, skipEmptyLines: true })
    parsedRows.value = res.data as any[]
    parsedHeaders.value = (res.meta.fields || []) as string[]
    contentColumn.value = parsedHeaders.value[0] || ''
  }
  reader.readAsText(f, 'utf-8')
}

const generateQRCodeFor = async (text: string, opt?: {size?:number,margin?:number,fg?:string,bg?:string,logo?:string,scale?:number}) => {
  const s = opt?.size || size.value
  const scale = opt?.scale || exportScale.value || 1
  const finalSize = s * scale
  const canvas = document.createElement('canvas')
  canvas.width = finalSize
  canvas.height = finalSize
  await QRCode.toCanvas(canvas, text, {
    width: finalSize,
    margin: (opt?.margin ?? margin.value) * scale,
    errorCorrectionLevel: ecLevel.value,
    color: { dark: opt?.fg || fgColor.value, light: opt?.bg || bgColor.value }
  })
  if (opt?.logo) {
    await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(null)
        const logoSize = finalSize * 0.18
        const x = (finalSize - logoSize) / 2
        const y = (finalSize - logoSize) / 2
        const pad = Math.max(4, logoSize * 0.08)
        ctx.fillStyle = '#fff'
        ctx.fillRect(x - pad / 2, y - pad / 2, logoSize + pad, logoSize + pad)
        ctx.drawImage(img, x, y, logoSize, logoSize)
        resolve(null)
      }
      img.onerror = () => resolve(null)
      img.src = opt.logo
    })
  }
  const pngDataUrl = canvas.toDataURL('image/png')
  const svgStr = await QRCode.toString(text, { type: 'svg', width: s, margin: opt?.margin ?? margin.value, errorCorrectionLevel: ecLevel.value })
  return { pngDataUrl, svgStr }
}

const startBatchGenerate = async () => {
  if (!parsedRows.value.length || !contentColumn.value) return
  isBatching.value = true
  _batchAbort.aborted = false
  batchProgress.value = 0
  const zip = new JSZip()
  for (let i = 0; i < parsedRows.value.length; i++) {
    if (_batchAbort.aborted) break
    const row = parsedRows.value[i]
    const text = String(row[contentColumn.value] || '')
    if (!text) { batchProgress.value++ ; continue }
    try {
      const { pngDataUrl, svgStr } = await generateQRCodeFor(text, { size: size.value, margin: margin.value, fg: fgColor.value, bg: bgColor.value, logo: logoDataUrl.value || undefined, scale: exportScale.value })
      // png
      const res = await fetch(pngDataUrl)
      const buffer = await res.arrayBuffer()
      zip.file(`${batchPrefix.value}_${i+1}.png`, buffer)
      // svg
      zip.file(`${batchPrefix.value}_${i+1}.svg`, svgStr)
    } catch (e) {
      console.warn('第', i+1, '行生成失败', e)
    }
    batchProgress.value = i + 1
  }

  try {
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${batchPrefix.value}_batch.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('打包 ZIP 失败', e)
    alert('打包失败')
  }

  isBatching.value = false
}

const cancelBatch = () => {
  _batchAbort.aborted = true
}
</script>

<style scoped>
.cn-code-view {
  max-width: 1000px;
  margin: 20px auto;
  padding: 16px;
}
.header h1 {
  margin: 0 0 6px 0;
}
.subtitle {
  color: #6b7280;
  margin: 0 0 12px 0;
}
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.tab {
  padding: 8px 14px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
}
.tab.active {
  background: #3b82f6;
  color: white;
}
.panel {
  display: flex;
  gap: 20px;
}
.controls {
  width: 40%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.controls input, .controls select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}
.controls button {
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  background: #4b6ef5;
  color: white;
  cursor: pointer;
}
.preview {
  width: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.preview img { max-width: 100%; height: auto; }
.preview-empty { color: #9ca3af; }
.preview-loading { color: #6b7280; }
.preview-content { display: flex; align-items: center; justify-content: center; }
.download-actions { display: flex; gap: 8px; margin-top: 6px; }
.control-actions { display: flex; gap: 8px; }
.controls input[type="file"] { padding: 6px 8px; }
.controls input[type="color"] { width: 48%; padding: 6px; height: 38px; }
.controls select { height: 38px; }
.batch-section { border: 1px dashed #e5e7eb; padding: 12px; border-radius: 6px; margin-bottom: 8px; }
.batch-section h3 { margin: 0 0 6px 0; font-size: 14px; }
.batch-section input[type="file"] { padding: 6px; }
.warning-note { padding: 8px; background: #fff7ed; border: 1px solid #fef3c7; border-radius: 6px; color: #92400e; }
.preset-actions { display: flex; gap: 8px; margin-top: 6px; align-items: center }
.preset-actions input { flex: 1 }
.preset-list { margin-top: 8px; display:flex; gap:6px; flex-wrap:wrap }
.preset-chip { padding:6px 8px; background:#f3f4f6; border-radius:6px; display:inline-flex; gap:6px; align-items:center }
.preset-chip button { background:transparent; border:none; cursor:pointer }

</style>
