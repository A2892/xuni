<template>
  <div class="visa-preview" :class="[`template-${store.data.template}`]" :style="{ fontFamily: store.designSettings.fontFamily }">
    <!-- 美国签证模板 -->
    <div v-if="store.data.template === 'us'" class="visa-us">
      <!-- 安全图案背景 -->
      <div v-if="store.designSettings.securityPatternEnabled" class="security-pattern"></div>
      
      <!-- 水印 -->
      <div v-if="store.designSettings.watermarkEnabled" class="watermark" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
        {{ store.designSettings.watermarkText }}
      </div>

      <!-- 头部 -->
      <div class="visa-header">
        <div class="header-left">
          <svg class="us-seal" viewBox="0 0 100 100" width="80" height="80">
            <!-- 复杂的美国安全印章效果 -->
            <circle cx="50" cy="50" r="48" fill="#1b365d" stroke="#c0a062" stroke-width="1.5"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#c0a062" stroke-width="0.5" stroke-dasharray="2 2"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#c0a062" stroke-width="1"/>
            
            <!-- 增加星型/雄鹰占位图案 -->
            <path d="M50 20 L56 36 L74 36 L61 46 L66 63 L50 53 L34 63 L39 46 L26 36 L44 36 Z" fill="#c0a062"/>
            
            <circle cx="50" cy="50" r="16" fill="#1b365d" stroke="#c0a062" stroke-width="0.5"/>
            
            <!-- 环绕文字模拟 -->
            <path id="curve" d="M 20 50 A 30 30 0 1 1 80 50" fill="transparent"/>
            <text font-size="6" fill="#c0a062" font-family="'Times New Roman', Times, serif" font-weight="bold" letter-spacing="1.5">
              <textPath href="#curve" startOffset="50%" text-anchor="middle">DEPARTMENT OF STATE</textPath>
            </text>
            <path id="curve-bottom" d="M 25 55 A 25 25 0 0 0 75 55" fill="transparent"/>
            <text font-size="5" fill="#c0a062" font-family="'Times New Roman', Times, serif">
              <textPath href="#curve-bottom" startOffset="50%" text-anchor="middle">UNITED STATES OF AMERICA</textPath>
            </text>
          </svg>
        </div>
        <div class="header-center">
          <div class="visa-title">UNITED STATES OF AMERICA</div>
          <div class="visa-subtitle">NONIMMIGRANT VISA</div>
        </div>
        <div class="header-right">
          <!-- 签发地点移至头部右上方 -->
          <div class="issuing-post">{{ store.data.issuingPost }}</div>
          <div class="visa-type-badge">{{ store.data.visaClass }}</div>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="visa-body">
        <div class="photo-section">
          <div class="photo-frame">
            <img v-if="store.data.photo" :src="store.data.photo" alt="Photo" class="visa-photo" />
            <div v-else class="photo-placeholder">
              <span class="placeholder-text">PHOTO</span>
            </div>
            <!-- 高仿星号特征 -->
            <div class="usa-stars">***</div>
          </div>
          <!-- 全息图效果 -->
          <div v-if="store.designSettings.hologramEffect" class="hologram-overlay"></div>
        </div>

        <div class="info-section">
          <!-- 控制号码移动到表格内部右上 -->
          <div class="us-control-number">{{ store.data.controlNumber }}</div>

          <div class="info-row">
            <div class="info-label">Surname</div>
            <div class="info-value">{{ store.data.surname }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Given Names</div>
            <div class="info-value">{{ store.data.givenNames }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Nationality</div>
            <div class="info-value">{{ store.data.nationality }}</div>
          </div>
          <div class="info-row-double">
            <div class="info-col">
              <div class="info-label">Date of Birth</div>
              <div class="info-value">{{ store.formatDate(store.data.dateOfBirth) }}</div>
            </div>
            <div class="info-col">
              <div class="info-label">Sex</div>
              <div class="info-value">{{ store.data.sex }}</div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">Passport Number</div>
            <div class="info-value">{{ store.data.passportNumber }}</div>
          </div>
          <div class="info-row-double">
            <div class="info-col">
              <div class="info-label">Issue Date</div>
              <div class="info-value">{{ store.formatDate(store.data.issueDate) }}</div>
            </div>
            <div class="info-col">
              <div class="info-label">Expiration Date</div>
              <div class="info-value">{{ store.formatDate(store.data.expiryDate) }}</div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">Entries</div>
            <div class="info-value">{{ store.data.entryType.toUpperCase() }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Annotation</div>
            <div class="info-value annotation">{{ store.data.annotation }}</div>
          </div>
        </div>
      </div>

      <!-- 签证号码 -->
      <div v-if="store.data.showBarcode" class="visa-number-section">
        <div class="visa-number-text">{{ store.data.visaNumber }}</div>
        <div class="barcode" style="margin-top:2px;">
          <div v-for="i in 50" :key="i" class="barcode-bar" 
               :style="{ width: Math.random() > 0.5 ? '2px' : '1px' }"></div>
        </div>
      </div>

      <!-- MRZ区域 -->
      <div v-if="store.data.showMRZ" class="mrz-section">
        <div class="mrz-line">{{ store.generateMRZ.line1 }}</div>
        <div class="mrz-line">{{ store.generateMRZ.line2 }}</div>
      </div>

    </div>

    <!-- 英国签证模板 -->
    <div v-else-if="store.data.template === 'uk'" class="visa-uk">
      <div v-if="store.designSettings.securityPatternEnabled" class="security-pattern uk-pattern"></div>
      <div v-if="store.designSettings.watermarkEnabled" class="watermark" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
        {{ store.designSettings.watermarkText }}
      </div>
      
      <div class="uk-header">
        <div class="uk-crest">
          <svg viewBox="0 0 60 70" width="50" height="58">
            <rect x="5" y="10" width="50" height="55" fill="#9e1b34" stroke="#cfaa3c" stroke-width="2" rx="3"/>
            <path d="M15 25 L30 15 L45 25 L45 50 L30 60 L15 50 Z" fill="#cfaa3c"/>
            <circle cx="30" cy="38" r="10" fill="#9e1b34"/>
            <path d="M26 35 L30 28 L34 35 L30 42 Z" fill="#cfaa3c"/>
            <text x="30" y="8" text-anchor="middle" fill="#cfaa3c" font-size="6" font-weight="bold">ER</text>
          </svg>
        </div>
        <div class="uk-title">
          <div class="title-main">UNITED KINGDOM</div>
          <div class="title-sub">ENTRY CLEARANCE</div>
        </div>
      </div>

      <div class="uk-body">
        <div class="uk-photo-section">
          <div class="uk-photo-frame">
            <img v-if="store.data.photo" :src="store.data.photo" alt="Photo" class="visa-photo" />
            <div v-else class="photo-placeholder">PHOTO</div>
          </div>
        </div>

        <div class="uk-info-section">
          <div class="uk-info-grid">
            <div class="uk-info-item">
              <span class="uk-label">Name:</span>
              <span class="uk-value">{{ store.data.surname }}, {{ store.data.givenNames }}</span>
            </div>
            <div class="uk-info-item">
              <span class="uk-label">Nationality:</span>
              <span class="uk-value">{{ store.data.nationality }}</span>
            </div>
            <div class="uk-info-item">
              <span class="uk-label">Date of Birth:</span>
              <span class="uk-value">{{ store.formatDate(store.data.dateOfBirth) }}</span>
            </div>
            <div class="uk-info-item">
              <span class="uk-label">Passport No:</span>
              <span class="uk-value">{{ store.data.passportNumber }}</span>
            </div>
            <div class="uk-info-item">
              <span class="uk-label">Valid From:</span>
              <span class="uk-value">{{ store.formatDate(store.data.validFrom) }}</span>
            </div>
            <div class="uk-info-item">
              <span class="uk-label">Valid Until:</span>
              <span class="uk-value">{{ store.formatDate(store.data.expiryDate) }}</span>
            </div>
            <div class="uk-info-item">
              <span class="uk-label">Entries:</span>
              <span class="uk-value">{{ store.data.entryType.toUpperCase() }}</span>
            </div>
            <div class="uk-info-item">
              <span class="uk-label">Category:</span>
              <span class="uk-value">{{ store.data.visaClass }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="uk-remarks">
        <span class="uk-label">Remarks:</span>
        <span class="uk-value">{{ store.data.annotation }}</span>
      </div>

      <div v-if="store.data.showMRZ" class="mrz-section uk-mrz">
        <div class="mrz-line">{{ store.generateMRZ.line1 }}</div>
        <div class="mrz-line">{{ store.generateMRZ.line2 }}</div>
      </div>
    </div>

    <!-- 申根签证模板 -->
    <div v-else-if="store.data.template === 'schengen'" class="visa-schengen">
      <div v-if="store.designSettings.securityPatternEnabled" class="security-pattern schengen-pattern"></div>
      <div v-if="store.designSettings.watermarkEnabled" class="watermark" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
        {{ store.designSettings.watermarkText }}
      </div>
      
      <div class="schengen-header">
        <div class="schengen-flag">
          <svg viewBox="0 0 60 40" width="45" height="30">
            <rect width="60" height="40" fill="#003399"/>
            <g fill="#fcd116">
              <polygon points="30,5 31.5,9.5 36,9.5 32.5,12.5 34,17 30,14 26,17 27.5,12.5 24,9.5 28.5,9.5"/>
              <polygon points="17,8 18,11 21,11 18.5,13 19.5,16 17,14 14.5,16 15.5,13 13,11 16,11"/>
              <polygon points="43,8 44,11 47,11 44.5,13 45.5,16 43,14 40.5,16 41.5,13 39,11 42,11"/>
              <polygon points="12,18 13,21 16,21 13.5,23 14.5,26 12,24 9.5,26 10.5,23 8,21 11,21"/>
              <polygon points="48,18 49,21 52,21 49.5,23 50.5,26 48,24 45.5,26 46.5,23 44,21 47,21"/>
              <polygon points="14,30 15,33 18,33 15.5,35 16.5,38 14,36 11.5,38 12.5,35 10,33 13,33"/>
              <polygon points="46,30 47,33 50,33 47.5,35 48.5,38 46,36 43.5,38 44.5,35 42,33 45,33"/>
            </g>
          </svg>
        </div>
        <div class="schengen-title">
          <div class="country-name">SCHENGEN</div>
          <div class="visa-text">VISA</div>
        </div>
        <div class="schengen-stars">
          <svg viewBox="0 0 40 40" width="35" height="35">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#003399" stroke-width="1"/>
            <g fill="#fcd116">
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(0,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(30,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(60,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(90,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(120,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(150,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(180,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(210,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(240,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(270,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(300,20,20)"/>
              <polygon points="20,5 20.8,7.5 23.5,7.5 21.3,9.2 22.1,11.7 20,10 17.9,11.7 18.7,9.2 16.5,7.5 19.2,7.5" transform="rotate(330,20,20)"/>
            </g>
          </svg>
        </div>
      </div>

      <div class="schengen-body">
        <div class="schengen-left">
          <div class="schengen-info-row">
            <span class="s-label">1. VALID FOR</span>
            <span class="s-value">SCHENGEN STATES</span>
          </div>
          <div class="schengen-info-row">
            <span class="s-label">2. FROM</span>
            <span class="s-value">{{ store.formatDate(store.data.validFrom, 'short') }}</span>
            <span class="s-label">UNTIL</span>
            <span class="s-value">{{ store.formatDate(store.data.expiryDate, 'short') }}</span>
          </div>
          <div class="schengen-info-row">
            <span class="s-label">3. TYPE OF VISA</span>
            <span class="s-value">{{ store.data.visaClass }}</span>
            <span class="s-label">4. NUMBER OF ENTRIES</span>
            <span class="s-value">{{ store.data.entryType.toUpperCase() }}</span>
          </div>
          <div class="schengen-info-row">
            <span class="s-label">5. DURATION OF STAY</span>
            <span class="s-value">{{ store.data.duration }}</span>
          </div>
          <div class="schengen-info-row">
            <span class="s-label">6. ISSUED IN</span>
            <span class="s-value">{{ store.data.issuingPost }}</span>
            <span class="s-label">ON</span>
            <span class="s-value">{{ store.formatDate(store.data.issueDate, 'short') }}</span>
          </div>
          <div class="schengen-info-row">
            <span class="s-label">7. PASSPORT NUMBER</span>
            <span class="s-value">{{ store.data.passportNumber }}</span>
          </div>
          <div class="schengen-info-row">
            <span class="s-label">8. SURNAME, NAME</span>
            <span class="s-value">{{ store.data.surname }}, {{ store.data.givenNames }}</span>
          </div>
          <div class="schengen-info-row">
            <span class="s-label">9. REMARKS</span>
            <span class="s-value">{{ store.data.annotation }}</span>
          </div>
        </div>

        <div class="schengen-right">
          <div class="schengen-photo-frame">
            <img v-if="store.data.photo" :src="store.data.photo" alt="Photo" class="visa-photo" />
            <div v-else class="photo-placeholder">PHOTO</div>
          </div>
          <div class="visa-number-display">{{ store.data.visaNumber }}</div>
        </div>
      </div>

      <div v-if="store.data.showMRZ" class="mrz-section schengen-mrz">
        <div class="mrz-line">{{ store.generateMRZ.line1 }}</div>
        <div class="mrz-line">{{ store.generateMRZ.line2 }}</div>
      </div>
    </div>

    <!-- 中国签证模板 -->
    <div v-else-if="store.data.template === 'china'" class="visa-china">
      <div v-if="store.designSettings.securityPatternEnabled" class="security-pattern china-pattern"></div>
      <div v-if="store.designSettings.watermarkEnabled" class="watermark" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
        {{ store.designSettings.watermarkText }}
      </div>
      
      <div class="china-header">
        <div class="china-emblem">
          <svg viewBox="0 0 60 60" width="50" height="50">
            <circle cx="30" cy="30" r="28" fill="#de2910"/>
            <polygon points="30,8 32,18 42,18 34,24 37,34 30,28 23,34 26,24 18,18 28,18" fill="#ffde00"/>
            <polygon points="42,12 43,16 47,16 44,18 45,22 42,20 39,22 40,18 37,16 41,16" fill="#ffde00"/>
            <polygon points="48,20 49,24 53,24 50,26 51,30 48,28 45,30 46,26 43,24 47,24" fill="#ffde00"/>
            <polygon points="48,32 49,36 53,36 50,38 51,42 48,40 45,42 46,38 43,36 47,36" fill="#ffde00"/>
            <polygon points="42,42 43,46 47,46 44,48 45,52 42,50 39,52 40,48 37,46 41,46" fill="#ffde00"/>
          </svg>
        </div>
        <div class="china-title">
          <div class="title-cn">中华人民共和国</div>
          <div class="title-en">PEOPLE'S REPUBLIC OF CHINA</div>
          <div class="visa-cn">签 证</div>
          <div class="visa-en">VISA</div>
        </div>
      </div>

      <div class="china-body">
        <div class="china-photo-section">
          <div class="china-photo-frame">
            <img v-if="store.data.photo" :src="store.data.photo" alt="Photo" class="visa-photo" />
            <div v-else class="photo-placeholder">照片<br/>PHOTO</div>
          </div>
        </div>

        <div class="china-info-section">
          <div class="china-info-row">
            <span class="china-label">姓名 Name</span>
            <span class="china-value">{{ store.data.surname }} {{ store.data.givenNames }}</span>
          </div>
          <div class="china-info-row">
            <span class="china-label">性别 Sex</span>
            <span class="china-value">{{ store.data.sex === 'M' ? '男 M' : '女 F' }}</span>
          </div>
          <div class="china-info-row">
            <span class="china-label">出生日期 Date of Birth</span>
            <span class="china-value">{{ store.formatDate(store.data.dateOfBirth) }}</span>
          </div>
          <div class="china-info-row">
            <span class="china-label">国籍 Nationality</span>
            <span class="china-value">{{ store.data.nationality }}</span>
          </div>
          <div class="china-info-row">
            <span class="china-label">护照号码 Passport No.</span>
            <span class="china-value">{{ store.data.passportNumber }}</span>
          </div>
          <div class="china-info-row">
            <span class="china-label">签证种类 Category</span>
            <span class="china-value">{{ store.data.visaClass }}</span>
          </div>
          <div class="china-info-row">
            <span class="china-label">入境次数 Entries</span>
            <span class="china-value">{{ store.data.entryType === 'single' ? '一次' : store.data.entryType === 'double' ? '两次' : '多次' }} {{ store.data.entryType.toUpperCase() }}</span>
          </div>
          <div class="china-info-row">
            <span class="china-label">有效期自 Enter Before</span>
            <span class="china-value">{{ store.formatDate(store.data.expiryDate) }}</span>
          </div>
          <div class="china-info-row">
            <span class="china-label">签发日期 Issue Date</span>
            <span class="china-value">{{ store.formatDate(store.data.issueDate) }}</span>
          </div>
          <div class="china-info-row">
            <span class="china-label">签发地点 Place of Issue</span>
            <span class="china-value">{{ store.data.issuingPost }}</span>
          </div>
        </div>
      </div>

      <div class="china-visa-number">
        签证号码 Visa No.: {{ store.data.visaNumber }}
      </div>

      <div v-if="store.data.showMRZ" class="mrz-section china-mrz">
        <div class="mrz-line">{{ store.generateMRZ.line1 }}</div>
        <div class="mrz-line">{{ store.generateMRZ.line2 }}</div>
      </div>
    </div>

    <!-- 日本签证模板 -->
    <div v-else-if="store.data.template === 'japan'" class="visa-japan">
      <div v-if="store.designSettings.securityPatternEnabled" class="security-pattern japan-pattern"></div>
      <div v-if="store.designSettings.watermarkEnabled" class="watermark" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
        {{ store.designSettings.watermarkText }}
      </div>
      
      <div class="japan-header">
        <div class="japan-flag">
          <svg viewBox="0 0 60 40" width="40" height="27">
            <rect width="60" height="40" fill="white" stroke="#ccc" stroke-width="0.5"/>
            <circle cx="30" cy="20" r="12" fill="#bc002d"/>
          </svg>
        </div>
        <div class="japan-title">
          <div class="title-jp">日本国査証</div>
          <div class="title-en">JAPAN VISA</div>
        </div>
        <div class="japan-emblem">
          <svg class="chrysanthemum" viewBox="0 0 50 50" width="40" height="40">
            <circle cx="25" cy="25" r="23" fill="#bc002d" opacity="0.1"/>
            <g fill="#c9a227">
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(0,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(22.5,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(45,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(67.5,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(90,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(112.5,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(135,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(157.5,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(180,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(202.5,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(225,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(247.5,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(270,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(292.5,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(315,25,25)"/>
              <ellipse cx="25" cy="10" rx="3" ry="8" transform="rotate(337.5,25,25)"/>
            </g>
            <circle cx="25" cy="25" r="6" fill="#c9a227"/>
          </svg>
        </div>
      </div>

      <div class="japan-body">
        <div class="japan-photo-section">
          <div class="japan-photo-frame">
            <img v-if="store.data.photo" :src="store.data.photo" alt="Photo" class="visa-photo" />
            <div v-else class="photo-placeholder">写真</div>
          </div>
        </div>

        <div class="japan-info-section">
          <div class="japan-info-row">
            <span class="japan-label">氏名 Name</span>
            <span class="japan-value">{{ store.data.surname }} {{ store.data.givenNames }}</span>
          </div>
          <div class="japan-info-row">
            <span class="japan-label">国籍 Nationality</span>
            <span class="japan-value">{{ store.data.nationality }}</span>
          </div>
          <div class="japan-info-row">
            <span class="japan-label">生年月日 Date of Birth</span>
            <span class="japan-value">{{ store.formatDate(store.data.dateOfBirth) }}</span>
          </div>
          <div class="japan-info-row">
            <span class="japan-label">性別 Sex</span>
            <span class="japan-value">{{ store.data.sex }}</span>
          </div>
          <div class="japan-info-row">
            <span class="japan-label">旅券番号 Passport No.</span>
            <span class="japan-value">{{ store.data.passportNumber }}</span>
          </div>
          <div class="japan-info-row">
            <span class="japan-label">査証の種類 Status</span>
            <span class="japan-value">{{ store.data.visaClass }}</span>
          </div>
          <div class="japan-info-row">
            <span class="japan-label">入国回数 Entries</span>
            <span class="japan-value">{{ store.data.entryType.toUpperCase() }}</span>
          </div>
          <div class="japan-info-row">
            <span class="japan-label">有効期限 Valid Until</span>
            <span class="japan-value">{{ store.formatDate(store.data.expiryDate) }}</span>
          </div>
          <div class="japan-info-row">
            <span class="japan-label">発給日 Issue Date</span>
            <span class="japan-value">{{ store.formatDate(store.data.issueDate) }}</span>
          </div>
          <div class="japan-info-row">
            <span class="japan-label">発給地 Place of Issue</span>
            <span class="japan-value">{{ store.data.issuingPost }}</span>
          </div>
        </div>
      </div>

      <div class="japan-visa-number">
        査証番号 Visa No. {{ store.data.visaNumber }}
      </div>

      <div v-if="store.data.showMRZ" class="mrz-section japan-mrz">
        <div class="mrz-line">{{ store.generateMRZ.line1 }}</div>
        <div class="mrz-line">{{ store.generateMRZ.line2 }}</div>
      </div>
    </div>

    <!-- 加拿大签证模板 -->
    <div v-else-if="store.data.template === 'canada'" class="visa-canada">
      <div v-if="store.designSettings.securityPatternEnabled" class="security-pattern canada-pattern"></div>
      <div v-if="store.designSettings.watermarkEnabled" class="watermark" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
        {{ store.designSettings.watermarkText }}
      </div>
      
      <div class="canada-header">
        <div class="canada-flag">
          <svg viewBox="0 0 60 30" width="50" height="25">
            <rect width="15" height="30" fill="#ff0000"/>
            <rect x="15" width="30" height="30" fill="white"/>
            <rect x="45" width="15" height="30" fill="#ff0000"/>
            <path d="M30,5 L31,10 L36,10 L32,13 L34,18 L30,15 L26,18 L28,13 L24,10 L29,10 Z" fill="#ff0000"/>
          </svg>
        </div>
        <div class="canada-title">
          <div class="title-en">CANADA</div>
          <div class="title-fr">CANADA</div>
          <div class="visa-text">VISA</div>
        </div>
        <div class="maple-leaf">
          <svg viewBox="0 0 40 40" width="35" height="35">
            <path d="M20,2 L22,12 L30,8 L26,14 L36,16 L28,20 L32,26 L24,24 L24,32 L20,26 L16,32 L16,24 L8,26 L12,20 L4,16 L14,14 L10,8 L18,12 Z" fill="#ff0000"/>
          </svg>
        </div>
      </div>

      <div class="canada-body">
        <div class="canada-photo-section">
          <div class="canada-photo-frame">
            <img v-if="store.data.photo" :src="store.data.photo" alt="Photo" class="visa-photo" />
            <div v-else class="photo-placeholder">PHOTO</div>
          </div>
        </div>

        <div class="canada-info-section">
          <div class="canada-info-row">
            <span class="canada-label">Surname / Nom</span>
            <span class="canada-value">{{ store.data.surname }}</span>
          </div>
          <div class="canada-info-row">
            <span class="canada-label">Given Names / Prénoms</span>
            <span class="canada-value">{{ store.data.givenNames }}</span>
          </div>
          <div class="canada-info-row">
            <span class="canada-label">Nationality / Nationalité</span>
            <span class="canada-value">{{ store.data.nationality }}</span>
          </div>
          <div class="canada-info-row">
            <span class="canada-label">Date of Birth / Date de naissance</span>
            <span class="canada-value">{{ store.formatDate(store.data.dateOfBirth) }}</span>
          </div>
          <div class="canada-info-row">
            <span class="canada-label">Sex / Sexe</span>
            <span class="canada-value">{{ store.data.sex }}</span>
          </div>
          <div class="canada-info-row">
            <span class="canada-label">Passport No. / N° de passeport</span>
            <span class="canada-value">{{ store.data.passportNumber }}</span>
          </div>
          <div class="canada-info-row">
            <span class="canada-label">Category / Catégorie</span>
            <span class="canada-value">{{ store.data.visaClass }}</span>
          </div>
          <div class="canada-info-row">
            <span class="canada-label">Valid / Valide</span>
            <span class="canada-value">{{ store.formatDate(store.data.validFrom) }} - {{ store.formatDate(store.data.expiryDate) }}</span>
          </div>
        </div>
      </div>

      <div class="canada-visa-number">
        {{ store.data.visaNumber }}
      </div>

      <div v-if="store.data.showMRZ" class="mrz-section canada-mrz">
        <div class="mrz-line">{{ store.generateMRZ.line1 }}</div>
        <div class="mrz-line">{{ store.generateMRZ.line2 }}</div>
      </div>
    </div>

    <!-- 澳大利亚签证模板 -->
    <div v-else-if="store.data.template === 'australia'" class="visa-australia">
      <div v-if="store.designSettings.securityPatternEnabled" class="security-pattern aus-pattern"></div>
      <div v-if="store.designSettings.watermarkEnabled" class="watermark" :style="{ opacity: store.designSettings.watermarkOpacity / 100 }">
        {{ store.designSettings.watermarkText }}
      </div>
      
      <div class="aus-header">
        <div class="aus-coat">
          <svg viewBox="0 0 80 60" width="60" height="45">
            <rect x="5" y="5" width="70" height="50" fill="#00008b" stroke="#c8a951" stroke-width="2" rx="3"/>
            <polygon points="25,15 26,18 29,18 27,20 28,23 25,21 22,23 23,20 21,18 24,18" fill="#fff"/>
            <polygon points="55,15 56,18 59,18 57,20 58,23 55,21 52,23 53,20 51,18 54,18" fill="#fff"/>
            <polygon points="40,20 41,23 44,23 42,25 43,28 40,26 37,28 38,25 36,23 39,23" fill="#fff"/>
            <polygon points="30,35 31,38 34,38 32,40 33,43 30,41 27,43 28,40 26,38 29,38" fill="#fff"/>
            <polygon points="50,35 51,38 54,38 52,40 53,43 50,41 47,43 48,40 46,38 49,38" fill="#fff"/>
            <polygon points="40,45 41,48 44,48 42,50 43,53 40,51 37,53 38,50 36,48 39,48" fill="#fff"/>
            <text x="40" y="12" text-anchor="middle" fill="#c8a951" font-size="6" font-weight="bold">AUSTRALIA</text>
          </svg>
        </div>
        <div class="aus-title">
          <div class="title-main">AUSTRALIAN</div>
          <div class="title-sub">VISA</div>
        </div>
      </div>

      <div class="aus-body">
        <div class="aus-photo-section">
          <div class="aus-photo-frame">
            <img v-if="store.data.photo" :src="store.data.photo" alt="Photo" class="visa-photo" />
            <div v-else class="photo-placeholder">PHOTO</div>
          </div>
        </div>

        <div class="aus-info-section">
          <div class="aus-info-row">
            <span class="aus-label">Family Name</span>
            <span class="aus-value">{{ store.data.surname }}</span>
          </div>
          <div class="aus-info-row">
            <span class="aus-label">Given Names</span>
            <span class="aus-value">{{ store.data.givenNames }}</span>
          </div>
          <div class="aus-info-row">
            <span class="aus-label">Nationality</span>
            <span class="aus-value">{{ store.data.nationality }}</span>
          </div>
          <div class="aus-info-row">
            <span class="aus-label">Date of Birth</span>
            <span class="aus-value">{{ store.formatDate(store.data.dateOfBirth) }}</span>
          </div>
          <div class="aus-info-row">
            <span class="aus-label">Passport Number</span>
            <span class="aus-value">{{ store.data.passportNumber }}</span>
          </div>
          <div class="aus-info-row">
            <span class="aus-label">Visa Subclass</span>
            <span class="aus-value">{{ store.data.visaClass }}</span>
          </div>
          <div class="aus-info-row">
            <span class="aus-label">Grant Date</span>
            <span class="aus-value">{{ store.formatDate(store.data.issueDate) }}</span>
          </div>
          <div class="aus-info-row">
            <span class="aus-label">Must Not Arrive After</span>
            <span class="aus-value">{{ store.formatDate(store.data.expiryDate) }}</span>
          </div>
        </div>
      </div>

      <div class="aus-grant-number">
        Grant Number: {{ store.data.visaNumber }}
      </div>

      <div v-if="store.data.showMRZ" class="mrz-section aus-mrz">
        <div class="mrz-line">{{ store.generateMRZ.line1 }}</div>
        <div class="mrz-line">{{ store.generateMRZ.line2 }}</div>
      </div>

      <div v-if="store.settings.showQRCode || store.designSettings.stampEnabled || store.data.signatureText || store.data.signatureImage" class="visa-extra-panel">
        <div class="visa-extra-row">
          <div v-if="store.settings.showQRCode" class="visa-qr-block">
            <img v-if="store.data.qrCodeImage" :src="store.data.qrCodeImage" alt="QR Code" />
            <div v-else class="qr-placeholder">{{ store.data.qrCodeText || 'VERIFY AT' }}</div>
          </div>
          <div v-if="store.designSettings.stampEnabled" class="visa-stamp-block">
            <img v-if="store.data.stampImage" :src="store.data.stampImage" alt="Stamp" class="stamp-image" />
            <div v-else class="stamp-placeholder">OFFICIAL STAMP</div>
          </div>
          <div v-if="store.data.signatureText || store.data.signatureImage" class="visa-signature-block">
            <img v-if="store.data.signatureImage" :src="store.data.signatureImage" alt="Signature" class="signature-image" />
            <div v-else class="signature-text">{{ store.data.signatureText }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVisaStore } from '@/stores/visa'

const store = useVisaStore()
</script>

<style scoped>
.visa-preview {
  font-family: 'Arial', sans-serif;
  width: 500px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 安全图案和水印 */
.security-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px),
    repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px);
  z-index: 1;
}

.uk-pattern { background-color: rgba(158, 27, 52, 0.03); }
.schengen-pattern { background-color: rgba(0, 51, 153, 0.03); }
.china-pattern { background-color: rgba(222, 41, 16, 0.03); }
.japan-pattern { background-color: rgba(188, 0, 45, 0.03); }
.canada-pattern { background-color: rgba(255, 0, 0, 0.03); }
.aus-pattern { background-color: rgba(0, 0, 139, 0.03); }

.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 60px;
  font-weight: bold;
  color: #000;
  pointer-events: none;
  white-space: nowrap;
  z-index: 2;
  letter-spacing: 10px;
}

/* 美国签证样式 */
.visa-us {
  /* 高度仿真的美国签证背景纹理，淡蓝色与淡粉色网底过渡 */
  background: repeating-linear-gradient(45deg, rgba(162, 217, 206, 0.2), rgba(162, 217, 206, 0.2) 2px, rgba(230, 176, 170, 0.2) 2px, rgba(230, 176, 170, 0.2) 4px), linear-gradient(135deg, #eaf2f8 0%, #fdf2e9 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.05);
}

.visa-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 51, 102, 0.15);
}

.header-left .us-seal {
  width: 80px;
  height: 80px;
  opacity: 0.85;
}

.header-center {
  flex: 1;
  text-align: center;
  position: relative;
}

.visa-title {
  font-size: 24px;
  font-family: "Times New Roman", Times, serif;
  font-weight: 700;
  color: #003366;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.visa-subtitle {
  font-size: 14px;
  font-family: inherit;
  color: #555;
  margin-top: 4px;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.issuing-post {
  font-family: inherit;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1px;
  color: #333;
}

.header-right .visa-type-badge {
  background: transparent;
  color: #c0392b;
  padding: 4px 8px;
  border: 2px solid #c0392b;
  border-radius: 2px;
  font-weight: 900;
  font-size: 20px;
  font-family: "Courier New", Courier, monospace;
}

.visa-body {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.usa-stars {
  font-family: monospace;
  font-weight: bold;
  text-align: center;
  letter-spacing: 4px;
  margin-top: 4px;
  font-size: 14px;
}

.us-control-number {
  position: absolute;
  top: 85px;
  right: 24px;
  font-family: "Courier New", Courier, monospace;
  color: #c0392b;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
}

.photo-section {
  position: relative;
  width: 120px;
  flex-shrink: 0;
}

.photo-frame {
  width: 120px;
  height: 150px;
  background: #fff;
  border: 2px solid #003366;
  overflow: hidden;
}

.visa-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
  font-size: 12px;
}

.hologram-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 30%,
    rgba(255, 255, 100, 0.2) 40%,
    rgba(100, 255, 255, 0.2) 50%,
    rgba(255, 100, 255, 0.2) 60%,
    rgba(255, 255, 255, 0.4) 70%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
  mix-blend-mode: overlay;
}

.info-section {
  flex: 1;
}

.info-row {
  margin-bottom: 6px;
}

.info-row-double {
  display: flex;
  gap: 16px;
  margin-bottom: 6px;
}

.info-col {
  flex: 1;
}

.info-label {
  font-size: 7px;
  color: #555;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.info-value {
  font-size: 13px;
  font-weight: 700;
  font-family: 'OCR-B', "Courier New", Courier, monospace;
  color: #111;
}

.info-value.annotation {
  font-size: 11px;
}

.visa-number-section {
  position: absolute;
  right: 24px;
  bottom: 85px;
  text-align: right;
}

.visa-number-text {
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  font-weight: bold;
  color: #c0392b;
  margin-bottom: 2px;
  letter-spacing: 1px;
}

.barcode-section {
  padding: 8px 0;
  display: flex;
  justify-content: flex-end;
}

.barcode {
  display: flex;
  justify-content: flex-end;
  gap: 1px;
  height: 25px;
}

.barcode-bar {
  background: #333;
  height: 100%;
}

.mrz-section {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 8px 4px;
  border-radius: 4px;
  margin-top: 16px;
}

.mrz-line {
  font-size: 16px;
  font-weight: bold;
  font-family: 'OCR-B', "Courier New", Courier, monospace;
  letter-spacing: 2px;
  color: #000;
  white-space: pre;
}

/* 英国签证样式 */
.visa-uk {
  background: linear-gradient(to bottom, #fff, #f8f8f8);
  padding: 16px;
  border-left: 4px solid #9e1b34;
}

.uk-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #9e1b34;
}

.crest-icon {
  font-size: 32px;
}

.uk-title .title-main {
  font-size: 20px;
  font-weight: bold;
  color: #9e1b34;
}

.uk-title .title-sub {
  font-size: 12px;
  color: #666;
}

.uk-body {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.uk-photo-frame {
  width: 100px;
  height: 130px;
  background: #fff;
  border: 2px solid #9e1b34;
  overflow: hidden;
}

.uk-info-section {
  flex: 1;
}

.uk-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.uk-info-item {
  font-size: 11px;
}

.uk-label {
  color: #666;
}

.uk-value {
  font-weight: 600;
  color: #000;
  display: block;
}

.uk-remarks {
  padding: 8px 0;
  border-top: 1px solid #ddd;
  font-size: 11px;
}

.uk-mrz {
  margin-top: 12px;
}

/* 申根签证样式 */
.visa-schengen {
  background: linear-gradient(135deg, #003399 0%, #003399 30%, #fff 30%, #fff 100%);
  padding: 16px;
  min-height: 320px;
}

.schengen-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
}

.schengen-flag {
  font-size: 28px;
}

.schengen-title .country-name {
  font-size: 18px;
  font-weight: bold;
  color: #003399;
}

.schengen-title .visa-text {
  font-size: 12px;
  color: #666;
}

.schengen-stars {
  margin-left: auto;
  color: #fcd116;
}

.star {
  font-size: 10px;
}

.schengen-body {
  display: flex;
  gap: 16px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-radius: 4px;
}

.schengen-left {
  flex: 1;
}

.schengen-info-row {
  margin-bottom: 4px;
  font-size: 10px;
}

.s-label {
  color: #003399;
  font-weight: 500;
}

.s-value {
  color: #000;
  margin-left: 4px;
}

.schengen-right {
  width: 100px;
}

.schengen-photo-frame {
  width: 100px;
  height: 130px;
  background: #fff;
  border: 2px solid #003399;
  overflow: hidden;
}

.visa-number-display {
  margin-top: 8px;
  font-size: 10px;
  text-align: center;
  font-weight: bold;
}

.schengen-mrz {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.95);
}

/* 中国签证样式 */
.visa-china {
  background: linear-gradient(to bottom, #fff, #fff5f5);
  padding: 16px;
  border-top: 4px solid #de2910;
}

.china-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  text-align: center;
}

.china-emblem {
  font-size: 40px;
}

.china-title {
  flex: 1;
}

.title-cn {
  font-size: 18px;
  font-weight: bold;
  color: #de2910;
}

.title-en {
  font-size: 10px;
  color: #333;
}

.visa-cn {
  font-size: 24px;
  font-weight: bold;
  color: #de2910;
  margin-top: 4px;
}

.visa-en {
  font-size: 12px;
  color: #666;
}

.china-body {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.china-photo-frame {
  width: 100px;
  height: 130px;
  background: #fff;
  border: 2px solid #de2910;
  overflow: hidden;
}

.china-info-section {
  flex: 1;
}

.china-info-row {
  margin-bottom: 4px;
  font-size: 10px;
}

.china-label {
  color: #de2910;
  font-weight: 500;
  display: block;
  font-size: 9px;
}

.china-value {
  color: #000;
  font-weight: 600;
}

.china-visa-number {
  padding: 8px;
  text-align: center;
  border-top: 1px solid #de2910;
  font-size: 12px;
  color: #de2910;
  font-weight: bold;
}

.china-mrz {
  margin-top: 12px;
}

/* 日本签证样式 */
.visa-japan {
  background: linear-gradient(to bottom, #fff, #fff5f5);
  padding: 16px;
  border-left: 4px solid #bc002d;
}

.japan-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #bc002d;
}

.japan-flag {
  font-size: 28px;
}

.japan-title .title-jp {
  font-size: 20px;
  font-weight: bold;
  color: #bc002d;
}

.japan-title .title-en {
  font-size: 12px;
  color: #666;
}

.chrysanthemum {
  font-size: 32px;
  margin-left: auto;
}

.japan-body {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.japan-photo-frame {
  width: 100px;
  height: 130px;
  background: #fff;
  border: 2px solid #bc002d;
  overflow: hidden;
}

.japan-info-section {
  flex: 1;
}

.japan-info-row {
  margin-bottom: 4px;
  font-size: 10px;
}

.japan-label {
  color: #bc002d;
  font-weight: 500;
  display: block;
  font-size: 9px;
}

.japan-value {
  color: #000;
  font-weight: 600;
}

.japan-visa-number {
  padding: 8px;
  text-align: center;
  border-top: 1px solid #bc002d;
  font-size: 12px;
  font-weight: bold;
}

.japan-mrz {
  margin-top: 12px;
}

/* 加拿大签证样式 */
.visa-canada {
  background: linear-gradient(to bottom, #fff, #fff);
  padding: 16px;
  border-top: 4px solid #ff0000;
}

.canada-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ff0000;
}

.canada-flag {
  font-size: 28px;
}

.canada-title .title-en {
  font-size: 20px;
  font-weight: bold;
  color: #ff0000;
}

.canada-title .title-fr {
  font-size: 10px;
  color: #666;
}

.canada-title .visa-text {
  font-size: 14px;
  color: #333;
  font-weight: bold;
}

.maple-leaf {
  font-size: 32px;
  margin-left: auto;
  color: #ff0000;
}

.canada-body {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.canada-photo-frame {
  width: 100px;
  height: 130px;
  background: #fff;
  border: 2px solid #ff0000;
  overflow: hidden;
}

.canada-info-section {
  flex: 1;
}

.canada-info-row {
  margin-bottom: 4px;
  font-size: 10px;
}

.canada-label {
  color: #ff0000;
  font-weight: 500;
  display: block;
  font-size: 9px;
}

.canada-value {
  color: #000;
  font-weight: 600;
}

.canada-visa-number {
  padding: 8px;
  text-align: center;
  border-top: 1px solid #ff0000;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
}

.canada-mrz {
  margin-top: 12px;
}

/* 澳大利亚签证样式 */
.visa-australia {
  background: linear-gradient(to bottom, #00008b, #000066);
  padding: 16px;
  color: #fff;
}

.aus-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #c8a951;
}

.aus-coat {
  font-size: 32px;
}

.aus-title .title-main {
  font-size: 20px;
  font-weight: bold;
  color: #c8a951;
}

.aus-title .title-sub {
  font-size: 14px;
  color: #fff;
}

.aus-body {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 4px;
}

.aus-photo-frame {
  width: 100px;
  height: 130px;
  background: #fff;
  border: 2px solid #c8a951;
  overflow: hidden;
}

.aus-info-section {
  flex: 1;
}

.aus-info-row {
  margin-bottom: 4px;
  font-size: 10px;
}

.aus-label {
  color: #c8a951;
  font-weight: 500;
  display: block;
  font-size: 9px;
}

.aus-value {
  color: #fff;
  font-weight: 600;
}

.aus-grant-number {
  padding: 8px;
  text-align: center;
  border-top: 1px solid #c8a951;
  font-size: 12px;
  color: #c8a951;
  font-weight: bold;
}

.aus-mrz {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.95);
}

.aus-mrz .mrz-line {
  color: #000;
}
</style>
