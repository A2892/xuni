<script setup lang="ts">
import { computed } from 'vue'
import { usePassportStore } from '@/stores/passport'

const store = usePassportStore()

// MRZ (Machine Readable Zone) 计算
const generateMRZ = computed(() => {
  const line1 = `P<D<<${store.passportInfo.surname}<<${store.passportInfo.givenNames.replace(/ /g, '<')}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`
  const line2 = `${store.passportInfo.passportNumber}<<<<D${store.passportInfo.dateOfBirth.replace(/\./g, '')}${store.passportInfo.sex}${store.passportInfo.dateOfExpiry.replace(/\./g, '')}<<<<<<<<<<<<<<<0`
  return {
    line1: line1.substring(0, 44),
    line2: line2.substring(0, 44)
  }
})

// 生成芯片图标
const chipIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='10' y='10' width='80' height='80' fill='%23FFD700' rx='5'/%3E%3Crect x='20' y='20' width='60' height='60' fill='%23333' rx='3'/%3E%3Cline x1='35' y1='20' x2='35' y2='80' stroke='%23FFD700' stroke-width='2'/%3E%3Cline x1='50' y1='20' x2='50' y2='80' stroke='%23FFD700' stroke-width='2'/%3E%3Cline x1='65' y1='20' x2='65' y2='80' stroke='%23FFD700' stroke-width='2'/%3E%3Cline x1='20' y1='35' x2='80' y2='35' stroke='%23FFD700' stroke-width='2'/%3E%3Cline x1='20' y1='50' x2='80' y2='50' stroke='%23FFD700' stroke-width='2'/%3E%3Cline x1='20' y1='65' x2='80' y2='65' stroke='%23FFD700' stroke-width='2'/%3E%3C/svg%3E`
</script>

<template>
  <div class="passport-preview-container">
    <div class="passport-wrapper">
      <!-- 德国护照 -->
      <div class="german-passport">
        <!-- 护照纹理背景 -->
        <div class="passport-texture"></div>
        
        <!-- 水印层 -->
        <div class="watermark-layer">
          <div class="watermark-text">REISEPASS</div>
          <div class="watermark-text">DEUTSCHLAND</div>
          <div class="watermark-text">REISEPASS</div>
        </div>

        <!-- 顶部：德国国徽和标题 -->
        <div class="passport-header-section">
          <div class="top-header">
            <div class="german-eagle-emblem">
              <svg viewBox="0 0 120 140" class="eagle-svg">
                <defs>
                  <radialGradient id="goldGradient">
                    <stop offset="0%" style="stop-color:#FFD700"/>
                    <stop offset="100%" style="stop-color:#B8860B"/>
                  </radialGradient>
                </defs>
                <!-- 德国国徽 -->
                <circle cx="60" cy="60" r="50" fill="url(#goldGradient)" opacity="0.3"/>
                <path d="M60 30 L50 45 L60 50 L70 45 Z" fill="#000"/>
                <ellipse cx="60" cy="65" rx="25" ry="35" fill="#000"/>
                <path d="M40 65 L35 75 L40 85 L45 75 Z M80 65 L75 75 L80 85 L85 75 Z" fill="#000"/>
                <path d="M50 95 L45 105 L50 110 L55 105 Z M70 95 L65 105 L70 110 L75 105 Z" fill="#000"/>
                <circle cx="55" cy="58" r="3" fill="#FFD700"/>
                <circle cx="65" cy="58" r="3" fill="#FFD700"/>
              </svg>
            </div>
          </div>
          
          <div class="header-titles">
            <div class="eu-label">EUROPÄISCHE UNION</div>
            <div class="country-label">BUNDESREPUBLIK DEUTSCHLAND</div>
            <div class="passport-type-label">REISEPASS / PASSPORT</div>
          </div>

          <!-- 电子芯片标识 -->
          <div class="chip-indicator">
            <img :src="chipIcon" alt="chip" class="chip-icon">
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="passport-main-content">
          <!-- 左侧：照片和签名 -->
          <div class="photo-signature-section">
            <!-- 照片区域 -->
            <div class="photo-container">
              <div class="photo-frame-outer">
                <div class="photo-frame-inner">
                  <img 
                    v-if="store.passportInfo.photo" 
                    :src="store.passportInfo.photo" 
                    alt="Photo"
                    class="passport-photo-img"
                  />
                  <div v-else class="photo-placeholder-box">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <span>照片</span>
                  </div>
                </div>
                <!-- 全息图效果 -->
                <div class="hologram-overlay"></div>
              </div>
            </div>

            <!-- 签名区域 -->
            <div class="signature-container">
              <div class="signature-label">Unterschrift des Passinhabers / Holder's signature</div>
              <div class="signature-box-area">
                <img 
                  v-if="store.passportInfo.signature" 
                  :src="store.passportInfo.signature" 
                  alt="Signature"
                  class="signature-image"
                />
                <div v-else class="signature-placeholder">
                  <span>签名区</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：个人信息 -->
          <div class="info-section">
            <div class="info-field">
              <span class="field-label">Type / Type</span>
              <span class="field-value type-value">{{ store.passportInfo.passportType }}</span>
            </div>

            <div class="info-field">
              <span class="field-label">Code / Code</span>
              <span class="field-value">D</span>
            </div>

            <div class="info-field passport-no-field">
              <span class="field-label">Pass-Nr. / Passport No.</span>
              <span class="field-value passport-no">{{ store.passportInfo.passportNumber }}</span>
            </div>

            <div class="info-field">
              <span class="field-label">Name / Surname</span>
              <span class="field-value name-value">{{ store.passportInfo.surname }}</span>
            </div>

            <div class="info-field">
              <span class="field-label">Vornamen / Given names</span>
              <span class="field-value name-value">{{ store.passportInfo.givenNames }}</span>
            </div>

            <div class="info-field">
              <span class="field-label">Staatsangehörigkeit / Nationality</span>
              <span class="field-value">{{ store.passportInfo.nationality }}</span>
            </div>

            <div class="info-field">
              <span class="field-label">Geburtsdatum / Date of birth</span>
              <span class="field-value">{{ store.passportInfo.dateOfBirth }}</span>
            </div>

            <div class="info-field">
              <span class="field-label">Geschlecht / Sex</span>
              <span class="field-value">{{ store.passportInfo.sex }}</span>
            </div>

            <div class="info-field">
              <span class="field-label">Geburtsort / Place of birth</span>
              <span class="field-value">{{ store.passportInfo.placeOfBirth }}</span>
            </div>

            <div class="info-field">
              <span class="field-label">Ausstellungsdatum / Date of issue</span>
              <span class="field-value">{{ store.passportInfo.dateOfIssue }}</span>
            </div>

            <div class="info-field expiry-field">
              <span class="field-label">Gültig bis / Date of expiry</span>
              <span class="field-value expiry-value">{{ store.passportInfo.dateOfExpiry }}</span>
            </div>

            <div class="info-field">
              <span class="field-label">Ausstellende Behörde / Authority</span>
              <span class="field-value authority-value">{{ store.passportInfo.authority }}</span>
            </div>
          </div>
        </div>

        <!-- MRZ区域（机器可读区） -->
        <div class="mrz-zone">
          <div class="mrz-background"></div>
          <div class="mrz-content">
            <div class="mrz-line-text">{{ generateMRZ.line1 }}</div>
            <div class="mrz-line-text">{{ generateMRZ.line2 }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.passport-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 700px;
}

.passport-wrapper {
  transform: perspective(1500px) rotateY(-3deg) rotateX(2deg);
  transition: transform 0.5s ease;
  filter: drop-shadow(0 25px 50px rgba(0,0,0,0.4));
}

.passport-wrapper:hover {
  transform: perspective(1500px) rotateY(0deg) rotateX(0deg);
}

.german-passport {
  width: 480px;
  min-height: 680px;
  background: linear-gradient(145deg, #8B1538 0%, #6B0F2A 50%, #8B1538 100%);
  border-radius: 8px;
  padding: 35px 30px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    inset 0 0 50px rgba(0,0,0,0.3),
    0 0 0 1px rgba(139,21,56,0.8);
}

/* 护照纹理 */
.passport-texture {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255,255,255,0.02) 2px,
      rgba(255,255,255,0.02) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(255,255,255,0.02) 2px,
      rgba(255,255,255,0.02) 4px
    );
  pointer-events: none;
}

/* 水印层 */
.watermark-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  opacity: 0.03;
  pointer-events: none;
  z-index: 1;
}

.watermark-text {
  font-size: 48px;
  font-weight: 900;
  color: #FFD700;
  letter-spacing: 8px;
  transform: rotate(-15deg);
}

/* 顶部区域 */
.passport-header-section {
  text-align: center;
  margin-bottom: 25px;
  position: relative;
  z-index: 2;
}

.top-header {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.german-eagle-emblem {
  width: 90px;
  height: 105px;
}

.eagle-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
}

.header-titles {
  color: #FFD700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.eu-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.country-label {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.2px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.passport-type-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.chip-indicator {
  position: absolute;
  top: 10px;
  left: 30px;
  width: 45px;
  height: 45px;
  opacity: 0.7;
}

.chip-icon {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

/* 主内容区 */
.passport-main-content {
  background: rgba(255, 255, 255, 0.97);
  border-radius: 8px;
  padding: 22px 20px;
  margin-bottom: 18px;
  display: grid;
  grid-template-columns: 145px 1fr;
  gap: 20px;
  position: relative;
  z-index: 2;
  box-shadow: 
    inset 0 1px 3px rgba(0,0,0,0.1),
    0 2px 8px rgba(0,0,0,0.15);
}

/* 照片签名区 */
.photo-signature-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-container {
  position: relative;
}

.photo-frame-outer {
  width: 145px;
  height: 185px;
  background: #fff;
  border: 2px solid #333;
  padding: 3px;
  position: relative;
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.2),
    inset 0 0 10px rgba(0,0,0,0.1);
}

.photo-frame-inner {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.passport-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.photo-placeholder-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #999;
  font-size: 13px;
}

/* 全息图效果 */
.hologram-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(255,0,255,0.1) 25%,
    rgba(0,255,255,0.1) 50%,
    rgba(255,255,0,0.1) 75%,
    transparent 100%
  );
  pointer-events: none;
  animation: hologram 3s ease-in-out infinite;
}

@keyframes hologram {
  0%, 100% { opacity: 0.3; transform: translateX(0); }
  50% { opacity: 0.6; transform: translateX(10px); }
}

.signature-container {
  margin-top: 8px;
}

.signature-label {
  font-size: 7px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.signature-box-area {
  width: 145px;
  height: 50px;
  border: 1px solid #999;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.signature-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.signature-placeholder {
  color: #ccc;
  font-size: 11px;
}

/* 信息区域 */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  font-size: 8px;
  color: #666;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.field-value {
  font-size: 12px;
  color: #000;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.type-value {
  font-size: 14px;
  font-weight: 800;
}

.name-value {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.passport-no-field {
  background: rgba(200, 16, 46, 0.08);
  padding: 6px 8px;
  border-radius: 4px;
  margin: 4px -8px;
}

.passport-no {
  color: #C8102E;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.expiry-field {
  background: rgba(255, 215, 0, 0.1);
  padding: 6px 8px;
  border-radius: 4px;
  margin: 4px -8px;
}

.expiry-value {
  color: #C8102E;
  font-weight: 800;
}

.authority-value {
  font-size: 10px;
  color: #555;
}

/* MRZ区域 */
.mrz-zone {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  padding: 14px 16px;
  position: relative;
  z-index: 2;
  box-shadow: 
    inset 0 1px 3px rgba(0,0,0,0.1),
    0 2px 6px rgba(0,0,0,0.15);
}

.mrz-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0.03) 0px,
    rgba(0,0,0,0.03) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
}

.mrz-content {
  position: relative;
}

.mrz-line-text {
  font-family: 'OCR-B', 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #000;
  line-height: 1.6;
  word-break: break-all;
  text-shadow: 0.5px 0.5px 0px rgba(0,0,0,0.1);
}
</style>
