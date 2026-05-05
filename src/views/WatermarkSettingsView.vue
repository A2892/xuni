<template>
  <div class="watermark-settings-page">
    <h2>水印设置（全局）</h2>

    <div class="toggle-section">
      <label class="toggle-label">
        <input type="checkbox" v-model="s.diagonalWatermarkEnabled" class="toggle-input">
        <span class="toggle-text">启用水印</span>
      </label>
    </div>

    <div class="hint-box">
      水印可以增强证书的安全性和正式性，您可以同时启用斜线和文字水印。
    </div>

    <!-- 斜线水印 -->
    <section class="form-group">
      <div class="subsection-header">
        <h4>斜线水印</h4>
        <label class="toggle-label-inline">
          <input type="checkbox" v-model="s.diagonalWatermarkEnabled" class="toggle-input">
        </label>
      </div>
      <p class="hint-text">绘制斜线看重复，不干扰主要内容</p>

      <div class="form-field">
        <label>线条宽度 ({{ s.diagonalLineWidth }}px)</label>
        <input type="range" v-model.number="s.diagonalLineWidth" min="10" max="50" step="1">
      </div>

      <div class="form-field">
        <label>线条间距 ({{ s.diagonalLineSpacing }}px)</label>
        <input type="range" v-model.number="s.diagonalLineSpacing" min="20" max="100" step="5">
        <p class="hint-text">线条间距由水平距离自动计算得出</p>
      </div>

      <div class="form-field">
        <label>斜线颜色</label>
        <div class="color-input">
          <input v-model="s.diagonalLineColor" type="color" />
          <input v-model="s.diagonalLineColor" type="text" />
        </div>
        <p class="hint-text">请不使用纯色或与纸张颜色同近的颜色</p>
      </div>

      <div class="form-field">
        <label>斜线不透明度 ({{ s.diagonalLineOpacity }}%)</label>
        <input type="range" v-model.number="s.diagonalLineOpacity" min="1" max="30" step="1">
      </div>

      <div class="form-field">
        <label>斜线角度 ({{ s.diagonalLineRotation }}°)</label>
        <div class="angle-slider">
          <span>左斜</span>
          <input type="range" v-model.number="s.diagonalLineRotation" min="-90" max="90" step="5">
          <span>右斜</span>
        </div>
      </div>
    </section>

    <!-- 文字水印 -->
    <section class="form-group">
      <div class="subsection-header">
        <h4>文字水印</h4>
        <label class="toggle-label-inline">
          <input type="checkbox" v-model="s.textWatermarkEnabled" class="toggle-input">
        </label>
      </div>
      <p class="hint-text">添加重复文字水印，增强辨识度</p>

      <div class="form-field">
        <label>水印文字</label>
        <input type="text" v-model="s.textWatermarkText" placeholder="OFFICIAL DOCUMENT">
      </div>

      <div class="form-field">
        <label>文字大小 ({{ s.textWatermarkSize }}px)</label>
        <input type="range" v-model.number="s.textWatermarkSize" min="8" max="32" step="1">
      </div>

      <div class="form-field">
        <label>水印字体</label>
        <select v-model="s.textWatermarkFontFamily">
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
          <input v-model="s.textWatermarkColor" type="color" />
          <input v-model="s.textWatermarkColor" type="text" />
        </div>
        <p class="hint-text">请不使用纯色或与纸张颜色同近的颜色</p>
      </div>

      <div class="form-field">
        <label>文字不透明度 ({{ s.textWatermarkOpacity }}%)</label>
        <input type="range" v-model.number="s.textWatermarkOpacity" min="1" max="30" step="1">
      </div>

      <div class="form-field">
        <label>文字角度 ({{ s.textWatermarkRotation }}°)</label>
        <div class="angle-slider">
          <span>左斜</span>
          <input type="range" v-model.number="s.textWatermarkRotation" min="-90" max="90" step="5">
          <span>右斜</span>
        </div>
      </div>
    </section>

    <!-- 全屏水印 -->
    <section class="form-group">
      <div class="subsection-header">
        <h4>全屏水印</h4>
        <label class="toggle-label-inline">
          <input type="checkbox" v-model="s.fullScreenWatermarkEnabled" class="toggle-input">
        </label>
      </div>
      <p class="hint-text">在整个证书上重复显示水印文字，增强视觉效果</p>

      <div class="form-field">
        <label>水印文字</label>
        <input type="text" v-model="s.fullScreenWatermarkText" placeholder="OFFICIAL DOCUMENT">
      </div>

      <div class="form-field">
        <label>文字大小 ({{ s.fullScreenWatermarkSize }}px)</label>
        <input type="range" v-model.number="s.fullScreenWatermarkSize" min="8" max="32" step="1">
      </div>

      <div class="form-field">
        <label>水印字体</label>
        <select v-model="s.fullScreenWatermarkFontFamily">
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
          <input v-model="s.fullScreenWatermarkColor" type="color" />
          <input v-model="s.fullScreenWatermarkColor" type="text" />
        </div>
        <p class="hint-text">请不使用纯色或与纸张颜色同近的颜色</p>
      </div>

      <div class="form-field">
        <label>文字不透明度 ({{ s.fullScreenWatermarkOpacity }}%)</label>
        <input type="range" v-model.number="s.fullScreenWatermarkOpacity" min="1" max="30" step="1">
      </div>

      <div class="form-field">
        <label>水印间距 ({{ s.fullScreenWatermarkSpacing }}px)</label>
        <input type="range" v-model.number="s.fullScreenWatermarkSpacing" min="100" max="400" step="10">
        <p class="hint-text">调节水印之间的水平和垂直间距</p>
      </div>
    </section>

    <!-- 水印应用提示 -->
    <div class="tips-section">
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
          <input type="checkbox" v-model="s.cornerPatternEnabled" class="toggle-input">
          <span class="toggle-text">启用装饰花纹</span>
        </label>
      </div>

      <div v-if="s.cornerPatternEnabled" class="form-row" style="display:flex;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <label>花纹类型</label>
          <select v-model="s.cornerPattern">
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
          <label>花纹颜色</label>
          <div class="color-input">
            <input v-model="s.cornerColor" type="color" />
            <input v-model="s.cornerColor" type="text" />
          </div>
        </div>
        <div style="min-width:160px;">
          <label>花纹不透明度 ({{ s.cornerOpacity }}%)</label>
          <input type="range" v-model.number="s.cornerOpacity" min="5" max="50" step="5">
        </div>
      </div>


    </section>

  </div>
</template>

<script setup lang="ts">
import { useWatermarkStore } from '@/stores/watermark'
const wm = useWatermarkStore()
const s = wm.settings
</script>

<style scoped>
/* 从 EnrollmentView 复制的水印相关样式，确保视觉与 Enrollment 一致 */
/* 斜线水印样式已移除 */

.text-watermark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}

.text-watermark::before {
  content: var(--watermark-text);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(var(--text-rotation));
  font-size: var(--text-size);
  color: var(--text-color);
  opacity: var(--text-opacity);
  font-family: var(--text-font);
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: 4px;
}

.fullscreen-watermark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  padding: 40px;
  gap: var(--watermark-spacing, 200px);
}

.watermark-item {
  transform: rotate(-30deg);
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: 2px;
  user-select: none;
}

.toggle-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
}

.toggle-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.toggle-text {
  color: #111827;
}

.hint-box {
  padding: 12px;
  background: #eff6ff;
  border-left: 3px solid #4b6ef5;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
  margin-bottom: 20px;
  line-height: 1.5;
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.subsection-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.toggle-label-inline {
  display: flex;
  align-items: center;
}

.angle-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.angle-slider span {
  font-size: 12px;
  color: #6b7280;
  min-width: 30px;
}

.angle-slider input[type="range"] {
  flex: 1;
}

.tips-section {
  margin-top: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.tips-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.tips-section li {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 8px;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  padding: 0;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4b6ef5;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4b6ef5;
  cursor: pointer;
  border: none;
}

.form-group { margin-bottom: 12px }
.form-field { display:flex; flex-direction:column; margin-bottom:12px }
.color-input { display:flex; gap:8px; align-items:center }
.checkbox-option { display:flex; align-items:center; gap:8px }

</style>
