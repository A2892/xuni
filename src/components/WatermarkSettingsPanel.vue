<template>
  <div class="watermark-panel">
    <div class="toggle-section">
      <label class="toggle-label">
        <input type="checkbox" v-model="enabled" class="toggle-input" />
        <span class="toggle-text">启用水印</span>
      </label>
    </div>

    <div class="hint-box">水印可以增强证书的安全性和正式性，您可以同时启用斜线和文字水印。</div>

    <!-- 斜线水印 -->
    <section class="form-group">
      <div class="subsection-header">
        <h4>斜线水印</h4>
        <label class="toggle-label-inline">
          <input type="checkbox" v-model="diagonalEnabled" class="toggle-input">
        </label>
      </div>

      <div class="form-field">
        <label>线条宽度 ({{ diagonalLineWidth }}px)</label>
        <input type="range" v-model.number="diagonalLineWidth" min="1" max="50" step="1">
      </div>

      <div class="form-field">
        <label>线条间距 ({{ diagonalLineSpacing }}px)</label>
        <input type="range" v-model.number="diagonalLineSpacing" min="10" max="400" step="5">
      </div>

      <div class="form-field">
        <label>斜线颜色</label>
        <div class="color-input">
          <input v-model="diagonalLineColor" type="color" />
          <input v-model="diagonalLineColor" type="text" />
        </div>
      </div>

      <div class="form-field">
        <label>斜线不透明度 ({{ diagonalLineOpacity }}%)</label>
        <input type="range" v-model.number="diagonalLineOpacity" min="1" max="100" step="1">
      </div>

      <div class="form-field">
        <label>斜线角度 ({{ diagonalLineRotation }}°)</label>
        <div class="angle-slider">
          <span>左斜</span>
            <input type="range" v-model.number="diagonalLineRotation" min="-90" max="90" step="5" @input="diagonalLineRotation = diagonalLineRotation">
          <span>右斜</span>
        </div>
      </div>

      <div class="form-field">
        <label>覆盖文本（斜线水印显示在内容上方）</label>
        <label class="toggle-label-inline">
          <input type="checkbox" v-model="diagonalOverlay" class="toggle-input" />
        </label>
      </div>

    </section> 

    <!-- 文字水印 -->
    <section class="form-group">
      <div class="subsection-header">
        <h4>文字水印</h4>
        <label class="toggle-label-inline">
          <input type="checkbox" v-model="textEnabled" class="toggle-input">
        </label>
      </div>

      <div class="form-field">
        <label>水印文字</label>
        <input type="text" v-model="text" />
      </div>

      <div class="form-field">
        <label>文字大小 ({{ textSize }}px)</label>
        <input type="range" v-model.number="textSize" min="8" max="200" step="1">
      </div>

      <div class="form-field">
        <label>水印字体</label>
        <select v-model="textFont">
          <option value="Times New Roman">Times New Roman</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Helvetica">Helvetica</option>
          <option value="'Allura', cursive">Allura (Script)</option>
        </select>
      </div>

      <div class="form-field">
        <label>文字颜色</label>
        <div class="color-input">
          <input v-model="textColor" type="color" />
          <input v-model="textColor" type="text" />
        </div>
      </div>

      <div class="form-field">
        <label>文字不透明度 ({{ textOpacity }}%)</label>
        <input type="range" v-model.number="textOpacity" min="1" max="100" step="1">
      </div>

      <div class="form-field">
        <label>文字角度 ({{ textRotation }}°)</label>
        <div class="angle-slider">
          <span>左斜</span>
            <input type="range" v-model.number="textRotation" min="-90" max="90" step="5" @input="textRotation = textRotation">
          <span>右斜</span>
        </div>
      </div>

      <div class="form-field">
        <label>覆盖文本（文字水印显示在内容上方）</label>
        <label class="toggle-label-inline">
          <input type="checkbox" v-model="textOverlay" class="toggle-input" />
        </label>
      </div>
    </section>

    <!-- 全屏水印 -->
    <section class="form-group">
      <div class="subsection-header">
        <h4>全屏水印</h4>
        <label class="toggle-label-inline">
          <input type="checkbox" v-model="fullEnabled" class="toggle-input">
        </label>
      </div>

      <div class="form-field">
        <label>水印文字</label>
        <input v-model="fullText" type="text" />
      </div>

      <div class="form-field">
        <label>文字大小 ({{ fullSize }}px)</label>
        <input type="range" v-model.number="fullSize" min="8" max="200" step="1">
      </div>

      <div class="form-field">
        <label>水印字体</label>
        <select v-model="fullFont">
          <option value="Times New Roman">Times New Roman</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Helvetica">Helvetica</option>
          <option value="'Allura', cursive">Allura (Script)</option>
          <option value="'Brush Script MT', cursive">Brush Script</option>
        </select>
      </div>

      <div class="form-field">
        <label>文字颜色</label>
        <div class="color-input">
          <input v-model="fullColor" type="color" />
          <input v-model="fullColor" type="text" />
        </div>
      </div>

      <div class="form-field">
        <label>文字不透明度 ({{ fullOpacity }}%)</label>
        <input type="range" v-model.number="fullOpacity" min="1" max="100" step="1">
      </div>

      <div class="form-field">
        <label>水印角度 ({{ fullRotation }}°)</label>
        <div class="angle-slider">
          <span>左斜</span>
          <input type="range" v-model.number="fullRotation" min="-90" max="90" step="1">
          <span>右斜</span>
        </div>
      </div>

      <div class="form-field">
        <label>水印间距 ({{ fullSpacing }}px)</label>
        <input type="range" v-model.number="fullSpacing" min="50" max="500" step="10">
      </div>
      <div class="form-field">
        <label>覆盖文本（全屏水印显示在内容上方）</label>
        <label class="toggle-label-inline">
          <input type="checkbox" v-model="fullOverlay" class="toggle-input" />
        </label>
      </div>
    </section>

    <div class="hint-box" style="margin-top:16px;">
      <h4>水印应用提示：</h4>
      <ul>
        <li>文字水印适合在较重要的证书上使用，增加权威性</li>
        <li>斜线水印适合作为背景元素，不干扰主要内容</li>
        <li>水印颜色建议选择与背景有区别的颜色，不要同视觉转线至-15%效果最佳</li>
        <li>调整水印角度可以优化水印覆盖效果，一般建议使用-30°至-45°</li>
        <li>两种水印可以同时使用，但注意不要让水印过多影响正文内容</li>
      </ul>
    </div>

    <!-- 角落花纹 + 覆盖开关 -->
    <section style="margin-top:16px;">
      <div class="toggle-section">
        <label class="toggle-label">
          <input type="checkbox" v-model="cornerEnabled" class="toggle-input">
          <span class="toggle-text">启用装饰花纹</span>
        </label>
      </div>

      <div v-if="cornerEnabled" class="form-row" style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
        <div style="flex:1;min-width:200px;">
          <label>花纹类型</label>
          <select v-model="cornerPattern">
            <option value="Corner Pattern">Corner Pattern</option>
            <option value="Elegant">Elegant</option>
            <option value="Classic">Classic</option>
            <option value="Minimal">Minimal</option>
            <option value="Filigree">Filigree</option>
            <option value="Geometric">Geometric</option>
            <option value="Ornate">Ornate</option>
          </select>
        </div>
        <div style="min-width:120px;">
          <label>花纹位置</label>
          <select v-model="cornerPosition">
            <option>All Positions</option>
            <option>Top Left</option>
            <option>Top Right</option>
            <option>Bottom Left</option>
            <option>Bottom Right</option>
          </select>
        </div>
        <div style="min-width:160px;">
          <label>花纹颜色</label>
          <div class="color-input">
            <input v-model="cornerColor" type="color" />
            <input v-model="cornerColor" type="text" />
          </div>
        </div>
        <div style="min-width:160px;">
          <label>花纹不透明度 ({{ cornerOpacity }}%)</label>
          <input type="range" v-model.number="cornerOpacity" min="5" max="50" step="5">
        </div>
      </div>

    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import { useWatermarkStore } from '@/stores/watermark'

const props = defineProps({
  model: { type: Object as PropType<Record<string, any>>, required: true }
})

// Helpers that read/write multiple legacy keys for compatibility
function read(keys: string[], fallback: any) {
  for (const k of keys) if (props.model[k] !== undefined) return props.model[k]
  return fallback
}

function write(keyVariants: string[], value: any) {
  // Only write to the canonical (first) key to avoid cross-writing legacy variants.
  const canonical = keyVariants[0]
  try {
    const wm = useWatermarkStore()
    // Always write to the provided model (page-specific settings or injected model)
    try { props.model[canonical] = value } catch (e) { /* ignore */ }
    // Only sync to the global watermark store when the edited model IS the global settings
    try {
      if (wm && wm.settings && props.model === wm.settings) {
        wm.settings[canonical] = value
      }
    } catch (e) { /* ignore */ }
  } catch (e) {
    // worst-case fallback: attempt to set the canonical on the model
    try { props.model[canonical] = value } catch (e) { /* ignore */ }
  }
}

// 调试记录已移除，直接使用 write()

const enabled = computed({
  get: () => read(['diagonalWatermarkEnabled','textWatermarkEnabled','watermarkEnabled','enableWatermark'], false),
  set: (v) => { write(['diagonalWatermarkEnabled','textWatermarkEnabled','watermarkEnabled','enableWatermark'], v) }
})

const diagonalEnabled = computed({
  get: () => read(['diagonalWatermarkEnabled','watermarkShowStripes'], false),
  set: (v) => { write(['diagonalWatermarkEnabled','watermarkShowStripes'], v) }
})

const diagonalLineWidth = computed({
  get: () => read(['diagonalLineWidth','watermarkStripeWidth','watermarkStripeWidth'], 20),
  set: (v) => { write(['diagonalLineWidth','watermarkStripeWidth'], v) }
})

const diagonalLineSpacing = computed({
  get: () => read(['diagonalLineSpacing','watermarkStripeSpacing','watermarkSpacingX'], 120),
  set: (v) => { write(['diagonalLineSpacing','watermarkStripeSpacing','watermarkSpacingX'], v) }
})

const diagonalLineColor = computed({
  get: () => read(['diagonalLineColor','watermarkColor'], '#000000'),
  set: (v) => { write(['diagonalLineColor'], v) }
})

const diagonalLineOpacity = computed({
  get: () => read(['diagonalLineOpacity','watermarkOpacity'], 10),
  set: (v) => { write(['diagonalLineOpacity'], v) }
})

const diagonalLineRotation = computed({
  get: () => read(['diagonalLineRotation','diagonalWatermarkRotation','diagonalRotate'], -30),
  set: (v) => { write(['diagonalLineRotation','diagonalWatermarkRotation','diagonalRotate'], v) }
})
// 全局 diagonalOverlay 已移除 — 页面级覆盖请在对应页面设置中控制

const diagonalOverlay = computed({
  // 支持多个兼容 key 名称，优先写入 canonical 'diagonalOverlay'
  get: () => read(['diagonalOverlay','watermarkOverlayDiagonal','watermarkOverlay'], false),
  set: (v) => write(['diagonalOverlay','watermarkOverlayDiagonal','watermarkOverlay'], v)
})

// text watermark (keep content separate from full-screen watermark)
const textEnabled = computed({
  get: () => read(['textWatermarkEnabled','watermarkShowText','watermarkEnabled','enableWatermark'], false),
  set: (v) => { write(['textWatermarkEnabled','watermarkShowText','watermarkEnabled','enableWatermark'], v) }
})

const text = computed({ get: () => read(['textWatermarkText'], ''), set: (v) => write(['textWatermarkText'], v) })
const textSize = computed({ get: () => read(['textWatermarkSize'], 48), set: (v) => write(['textWatermarkSize'], v) })
const textFont = computed({ get: () => read(['textWatermarkFontFamily'], 'Times New Roman'), set: (v) => write(['textWatermarkFontFamily'], v) })
const textColor = computed({ get: () => read(['textWatermarkColor'], '#000000'), set: (v) => write(['textWatermarkColor'], v) })
const textOpacity = computed({ get: () => read(['textWatermarkOpacity'], 10), set: (v) => write(['textWatermarkOpacity'], v) })
const textRotation = computed({
  get: () => read(['textWatermarkRotation','textWatermarkAngle'], -30),
  set: (v) => write(['textWatermarkRotation','textWatermarkAngle'], v)
})

// full screen
const fullEnabled = computed({ get: () => read(['fullScreenWatermarkEnabled','fullScreenWatermark','fullScreenWatermark'], false), set: (v) => write(['fullScreenWatermarkEnabled','fullScreenWatermark','fullScreenWatermark'], v) })
const fullText = computed({ get: () => read(['fullScreenWatermarkText'], ''), set: (v) => write(['fullScreenWatermarkText'], v) })
const fullSize = computed({ get: () => read(['fullScreenWatermarkSize'], 48), set: (v) => write(['fullScreenWatermarkSize'], v) })
const fullColor = computed({ get: () => read(['fullScreenWatermarkColor'], '#000000'), set: (v) => write(['fullScreenWatermarkColor'], v) })
const fullOpacity = computed({ get: () => read(['fullScreenWatermarkOpacity'], 10), set: (v) => write(['fullScreenWatermarkOpacity'], v) })
const fullSpacing = computed({ get: () => read(['fullScreenWatermarkSpacing'], 200), set: (v) => write(['fullScreenWatermarkSpacing'], v) })

const fullRotation = computed({
  get: () => read([
    'fullScreenWatermarkAngle',
    'fullScreenWatermarkRotation',
    'fullScreenWatermarkRotate'
  ], -30),
  set: (v) => write([
    'fullScreenWatermarkAngle',
    'fullScreenWatermarkRotation',
    'fullScreenWatermarkRotate'
  ], v)
})
const fullFont = computed({ get: () => read(['fullScreenWatermarkFontFamily','fullScreenWatermarkFont'], 'Times New Roman'), set: (v) => write(['fullScreenWatermarkFontFamily','fullScreenWatermarkFont'], v) })

// 覆盖开关：全屏与文字水印分别可设置为覆盖文本
const fullOverlay = computed({
  // Avoid mapping to the generic 'watermarkOverlay' key here to prevent
  // toggling the full-screen overlay from also toggling other overlay types.
  get: () => read(['fullScreenWatermarkOverlay','fullOverlay','watermarkOverlayFullscreen'], false),
  set: (v) => write(['fullScreenWatermarkOverlay','fullOverlay','watermarkOverlayFullscreen'], v)
})

const textOverlay = computed({
  // Keep text overlay keys scoped to text-related names; do not include
  // the global 'watermarkOverlay' key which would affect other watermark types.
  get: () => read(['textWatermarkOverlay','textOverlay','watermarkOverlayText'], false),
  set: (v) => write(['textWatermarkOverlay','textOverlay','watermarkOverlayText'], v)
})

// corner pattern (装饰花纹)
const cornerEnabled = computed({ get: () => read(['cornerPatternEnabled','cornerPatternEnabled'], false), set: (v) => write(['cornerPatternEnabled','cornerPatternEnabled'], v) })
const cornerPattern = computed({ get: () => read(['cornerPattern','cornerPattern'], 'Corner Pattern'), set: (v) => write(['cornerPattern','cornerPattern'], v) })
const cornerPosition = computed({ get: () => read(['cornerPosition','cornerPosition'], 'All Positions'), set: (v) => write(['cornerPosition','cornerPosition'], v) })
const cornerColor = computed({ get: () => read(['cornerColor','cornerColor'], '#1e40af'), set: (v) => write(['cornerColor','cornerColor'], v) })
const cornerOpacity = computed({ get: () => read(['cornerOpacity','cornerOpacity'], 15), set: (v) => write(['cornerOpacity','cornerOpacity'], v) })
const cornerSize = computed({ get: () => read(['cornerSize','cornerSize'], 30), set: (v) => write(['cornerSize','cornerSize'], v) })
const watermarkOverlayCorner = computed({ get: () => read(['cornerOverlay','watermarkOverlay'], false), set: (v) => write(['cornerOverlay','watermarkOverlay'], v) })

const overlay = computed({ get: () => read(['watermarkOverlay','watermarkOverlay','watermarkOverlay','watermarkOverlay'], false), set: (v) => write(['watermarkOverlay','watermarkOverlay','watermarkOverlay','watermarkOverlay'], v) })
</script>

<style scoped>
.watermark-panel { padding: 12px 0 }
.toggle-section { margin-bottom: 12px }
.toggle-label { display:flex; align-items:center; gap:12px }
.toggle-input { width:18px; height:18px }
.hint-box { padding:10px; background:#eff6ff; border-left:4px solid #4b6ef5; border-radius:4px; margin-bottom:12px }
.form-group { margin-bottom:12px }
.subsection-header { display:flex; justify-content:space-between; align-items:center }
.angle-slider { display:flex; gap:12px; align-items:center }
.color-input { display:flex; gap:8px; align-items:center }
.checkbox-option { display:flex; gap:8px; align-items:center }
input[type="range"] { width:100% }
</style>
