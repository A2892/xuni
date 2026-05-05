<template>
  <div class="edoc-preview" :class="{ 'dark-mode': store.data.darkMode }">
    <!-- 设备外框 -->
    <div class="device-frame" :class="store.data.deviceType">
      <!-- 状态栏 -->
      <div class="status-bar">
        <span class="time">{{ store.data.showTime }}</span>
        <div class="status-icons">
          <span v-if="store.data.showWifi" class="wifi">📶</span>
          <span class="signal">{{ '▁▂▃▄'.slice(0, store.data.showSignal) }}</span>
          <span class="battery">{{ store.data.showBattery }}%🔋</span>
        </div>
      </div>

      <!-- 健康码 -->
      <div v-if="store.data.docType === 'health-code'" class="doc-content health-code">
        <div class="health-header">
          <span class="header-title">{{ store.data.healthCodeCity }}健康宝</span>
        </div>
        
        <div class="code-card" :class="store.data.healthCodeColor">
          <div class="code-status">
            <span v-if="store.data.healthCodeColor === 'green'" class="status-icon">✓</span>
            <span v-else-if="store.data.healthCodeColor === 'yellow'" class="status-icon">!</span>
            <span v-else class="status-icon">✕</span>
            <span class="status-text">{{ getHealthStatus() }}</span>
          </div>
          
          <div v-if="store.data.showQRCode" class="qr-code">
            <div class="qr-placeholder">
              <div class="qr-grid">
                <div v-for="i in 25" :key="i" :class="['qr-cell', { filled: Math.random() > 0.5 }]"></div>
              </div>
            </div>
          </div>
          
          <div class="user-info">
            <span class="user-name">{{ store.data.idName }}</span>
            <span class="user-area">{{ store.data.healthCodeCity }} {{ store.data.healthCodeArea }}</span>
          </div>
          
          <div class="update-time">
            <span>更新于 {{ store.data.lastUpdateTime }}</span>
          </div>
        </div>

        <div class="health-tips">
          <span class="tip-text">请配合防疫工作，主动出示健康码</span>
        </div>
      </div>

      <!-- 核酸检测 -->
      <div v-else-if="store.data.docType === 'nucleic-acid'" class="doc-content nucleic-test">
        <div class="nucleic-header">
          <span class="header-title">核酸检测结果</span>
        </div>
        
        <div class="result-card" :class="store.data.nucleicTestResult">
          <div class="result-badge">
            <span class="result-icon">{{ store.data.nucleicTestResult === 'negative' ? '阴性' : '阳性' }}</span>
            <span class="result-label">{{ store.data.nucleicTestResult === 'negative' ? '(-) Negative' : '(+) Positive' }}</span>
          </div>
          
          <div class="result-details">
            <div class="detail-row">
              <span class="label">姓名</span>
              <span class="value">{{ store.data.idName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">检测机构</span>
              <span class="value">{{ store.data.nucleicTestOrg }}</span>
            </div>
            <div class="detail-row">
              <span class="label">采样时间</span>
              <span class="value">{{ store.data.nucleicSampleTime }}</span>
            </div>
            <div class="detail-row">
              <span class="label">报告时间</span>
              <span class="value">{{ store.data.nucleicReportTime }}</span>
            </div>
            <div class="detail-row highlight">
              <span class="label">距今</span>
              <span class="value time">{{ store.data.nucleicHours }}小时内</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 疫苗接种 -->
      <div v-else-if="store.data.docType === 'vaccine'" class="doc-content vaccine">
        <div class="vaccine-header">
          <span class="header-title">新冠疫苗接种记录</span>
        </div>
        
        <div class="vaccine-card">
          <div class="doses-badge">
            <span class="doses-icon">💉</span>
            <span class="doses-count">已接种 {{ store.data.vaccineDoses }} 剂</span>
          </div>
          
          <div class="vaccine-records">
            <div v-if="store.data.vaccineDoses >= 1" class="record-item">
              <span class="record-dose">第1剂</span>
              <span class="record-date">{{ store.data.vaccineDate1 }}</span>
              <span class="record-type">{{ store.data.vaccineType }}</span>
            </div>
            <div v-if="store.data.vaccineDoses >= 2" class="record-item">
              <span class="record-dose">第2剂</span>
              <span class="record-date">{{ store.data.vaccineDate2 }}</span>
              <span class="record-type">{{ store.data.vaccineType }}</span>
            </div>
            <div v-if="store.data.vaccineDoses >= 3" class="record-item">
              <span class="record-dose">第3剂 (加强针)</span>
              <span class="record-date">{{ store.data.vaccineDate3 }}</span>
              <span class="record-type">{{ store.data.vaccineType }}</span>
            </div>
          </div>
          
          <div class="vaccine-org">
            <span class="label">接种单位：</span>
            <span class="value">{{ store.data.vaccineOrg }}</span>
          </div>
        </div>
      </div>

      <!-- 行程卡 -->
      <div v-else-if="store.data.docType === 'travel-card'" class="doc-content travel-card">
        <div class="travel-header">
          <span class="header-title">通信行程卡</span>
        </div>
        
        <div class="travel-card-inner green">
          <div class="travel-status">
            <span class="status-badge">绿色行程卡</span>
          </div>
          
          <div class="travel-phone">
            <span>手机号：{{ store.data.travelPhone }}</span>
          </div>
          
          <div class="travel-cities">
            <span class="cities-label">您于前{{ store.data.travelDays }}天内到达或途经：</span>
            <div class="cities-list">
              <span v-for="(city, index) in store.data.travelCities" :key="index" class="city-tag">{{ city }}</span>
            </div>
          </div>
          
          <div class="travel-tips">
            <span class="tip-text">结果包含您在前14天内到访的国家（地区）与停留满4小时的国内城市</span>
          </div>
          
          <div class="update-time">
            <span>更新于 {{ store.data.travelUpdateTime }}</span>
          </div>
        </div>
      </div>

      <!-- 身份证 -->
      <div v-else-if="store.data.docType === 'id-card'" class="doc-content id-card">
        <div class="id-card-front">
          <div class="id-header">中华人民共和国居民身份证</div>
          <div class="id-body">
            <div class="id-info">
              <div class="info-row">
                <span class="label">姓名</span>
                <span class="value name">{{ store.data.idName }}</span>
              </div>
              <div class="info-row">
                <span class="label">性别</span>
                <span class="value">{{ store.data.idGender }}</span>
                <span class="label" style="margin-left: 20px;">民族</span>
                <span class="value">{{ store.data.idNation }}</span>
              </div>
              <div class="info-row">
                <span class="label">出生</span>
                <span class="value">{{ formatIdDate(store.data.idBirthDate) }}</span>
              </div>
              <div class="info-row address">
                <span class="label">住址</span>
                <span class="value">{{ store.data.idAddress }}</span>
              </div>
              <div class="info-row">
                <span class="label">公民身份号码</span>
                <span class="value id-number">{{ store.data.idNumber }}</span>
              </div>
            </div>
            <div class="id-photo">
              <div v-if="store.data.avatarUrl" class="avatar">
                <img :src="store.data.avatarUrl" alt="证件照" />
              </div>
              <div v-else class="avatar-placeholder">证件照</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 护照 -->
      <div v-else-if="store.data.docType === 'passport'" class="doc-content passport">
        <div class="passport-card">
          <div class="passport-header">
            <span class="country">中华人民共和国</span>
            <span class="country-en">PEOPLE'S REPUBLIC OF CHINA</span>
            <span class="doc-type">护照 PASSPORT</span>
          </div>
          <div class="passport-body">
            <div class="passport-photo">
              <div v-if="store.data.avatarUrl" class="avatar">
                <img :src="store.data.avatarUrl" alt="证件照" />
              </div>
              <div v-else class="avatar-placeholder">PHOTO</div>
            </div>
            <div class="passport-info">
              <div class="info-row">
                <span class="label">Type/类型</span>
                <span class="value">{{ store.data.passportType }}</span>
              </div>
              <div class="info-row">
                <span class="label">Country Code/国家码</span>
                <span class="value">CHN</span>
              </div>
              <div class="info-row">
                <span class="label">Passport No./护照号码</span>
                <span class="value">{{ store.data.passportNumber }}</span>
              </div>
              <div class="info-row">
                <span class="label">Surname/姓</span>
                <span class="value">{{ store.data.passportName.split(' ')[0] }}</span>
              </div>
              <div class="info-row">
                <span class="label">Given Names/名</span>
                <span class="value">{{ store.data.passportName.split(' ').slice(1).join(' ') }}</span>
              </div>
              <div class="info-row">
                <span class="label">Nationality/国籍</span>
                <span class="value">{{ store.data.passportNationality }}</span>
              </div>
              <div class="info-row">
                <span class="label">Sex/性别</span>
                <span class="value">{{ store.data.passportGender }}</span>
              </div>
              <div class="info-row">
                <span class="label">Date of Birth/出生日期</span>
                <span class="value">{{ store.data.passportBirthDate }}</span>
              </div>
              <div class="info-row">
                <span class="label">Date of Issue/签发日期</span>
                <span class="value">{{ store.data.passportIssueDate }}</span>
              </div>
              <div class="info-row">
                <span class="label">Date of Expiry/有效期至</span>
                <span class="value">{{ store.data.passportExpiryDate }}</span>
              </div>
            </div>
          </div>
          <div class="passport-mrz">
            <div class="mrz-line">P&lt;CHN{{ store.data.passportName.replace(' ', '&lt;&lt;') }}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
            <div class="mrz-line">{{ store.data.passportNumber }}&lt;CHN{{ store.data.passportBirthDate.replace(/ /g, '').slice(0, 10) }}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
          </div>
        </div>
      </div>

      <!-- 驾驶证 -->
      <div v-else-if="store.data.docType === 'driver-license'" class="doc-content driver-license">
        <div class="license-card">
          <div class="license-header">
            <span class="title">中华人民共和国</span>
            <span class="subtitle">机动车驾驶证</span>
          </div>
          <div class="license-body">
            <div class="license-photo">
              <div v-if="store.data.avatarUrl" class="avatar">
                <img :src="store.data.avatarUrl" alt="证件照" />
              </div>
              <div v-else class="avatar-placeholder">证件照</div>
            </div>
            <div class="license-info">
              <div class="info-row">
                <span class="label">姓名</span>
                <span class="value">{{ store.data.driverName }}</span>
              </div>
              <div class="info-row">
                <span class="label">性别</span>
                <span class="value">{{ store.data.driverGender }}</span>
              </div>
              <div class="info-row">
                <span class="label">国籍</span>
                <span class="value">{{ store.data.driverNationality }}</span>
              </div>
              <div class="info-row">
                <span class="label">住址</span>
                <span class="value small">{{ store.data.driverAddress }}</span>
              </div>
              <div class="info-row">
                <span class="label">出生日期</span>
                <span class="value">{{ store.data.driverBirthDate }}</span>
              </div>
              <div class="info-row">
                <span class="label">初次领证日期</span>
                <span class="value">{{ store.data.driverIssueDate }}</span>
              </div>
              <div class="info-row">
                <span class="label">准驾车型</span>
                <span class="value highlight">{{ store.data.driverClass }}</span>
              </div>
              <div class="info-row">
                <span class="label">有效期限</span>
                <span class="value">{{ store.data.driverValidStart }} 至 {{ getDriverValidEnd() }}</span>
              </div>
            </div>
          </div>
          <div class="license-footer">
            <span class="driver-number">证号：{{ store.data.driverNumber }}</span>
            <span class="file-no">档案编号：{{ store.data.driverFileNo }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEDocStore } from '@/stores/edoc'

const store = useEDocStore()

function getHealthStatus() {
  const statuses = {
    green: '未见异常',
    yellow: '请注意防护',
    red: '存在风险'
  }
  return statuses[store.data.healthCodeColor]
}

function formatIdDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function getDriverValidEnd() {
  if (!store.data.driverValidStart) return ''
  const date = new Date(store.data.driverValidStart)
  date.setFullYear(date.getFullYear() + store.data.driverValidYears)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.edoc-preview {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.device-frame {
  width: 375px;
  min-height: 750px;
  background: #f5f5f5;
  border-radius: 40px;
  padding: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.device-frame.iphone::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 30px;
  background: #000;
  border-radius: 20px;
  z-index: 10;
}

.dark-mode .device-frame {
  background: #1a1a1a;
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.dark-mode .status-bar {
  color: #fff;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 健康码样式 */
.health-code .health-header {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.code-card {
  margin: 16px;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.code-card.green {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.code-card.yellow {
  background: linear-gradient(135deg, #facc15, #eab308);
  color: #1e293b;
}

.code-card.red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.code-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.status-text {
  font-size: 24px;
  font-weight: 700;
}

.qr-code {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.qr-placeholder {
  width: 160px;
  height: 160px;
  background: white;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  width: 100%;
  height: 100%;
}

.qr-cell {
  background: #f0f0f0;
  border-radius: 2px;
}

.qr-cell.filled {
  background: #1a1a1a;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
}

.user-area {
  font-size: 14px;
  opacity: 0.9;
}

.update-time {
  font-size: 12px;
  opacity: 0.8;
}

.health-tips {
  text-align: center;
  padding: 16px;
}

.tip-text {
  font-size: 12px;
  color: #64748b;
}

/* 核酸检测样式 */
.nucleic-test .nucleic-header {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.result-card {
  margin: 16px;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.dark-mode .result-card {
  background: #2d2d2d;
}

.result-badge {
  padding: 24px;
  text-align: center;
}

.result-card.negative .result-badge {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.result-card.positive .result-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.result-icon {
  display: block;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 4px;
}

.result-label {
  font-size: 14px;
  opacity: 0.9;
}

.result-details {
  padding: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #64748b;
  font-size: 13px;
}

.detail-row .value {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.dark-mode .detail-row .value {
  color: #f1f5f9;
}

.detail-row.highlight .value.time {
  color: #22c55e;
  font-weight: 600;
}

/* 疫苗接种样式 */
.vaccine .vaccine-header {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
}

.vaccine-card {
  margin: 16px;
  border-radius: 16px;
  background: white;
  padding: 20px;
}

.dark-mode .vaccine-card {
  background: #2d2d2d;
}

.doses-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border-radius: 12px;
  margin-bottom: 16px;
}

.doses-icon {
  font-size: 24px;
}

.doses-count {
  font-size: 18px;
  font-weight: 600;
}

.vaccine-records {
  margin-bottom: 16px;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
}

.dark-mode .record-item {
  background: #3d3d3d;
}

.record-dose {
  font-weight: 600;
  color: #6d28d9;
  min-width: 100px;
}

.record-date {
  flex: 1;
  color: #475569;
  font-size: 13px;
}

.dark-mode .record-date {
  color: #94a3b8;
}

.record-type {
  font-size: 12px;
  color: #94a3b8;
}

.vaccine-org {
  font-size: 12px;
  color: #64748b;
}

/* 行程卡样式 */
.travel-card .travel-header {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.travel-card-inner {
  margin: 16px;
  border-radius: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.travel-status {
  text-align: center;
  margin-bottom: 16px;
}

.status-badge {
  display: inline-block;
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-weight: 600;
}

.travel-phone {
  text-align: center;
  margin-bottom: 16px;
  font-size: 14px;
}

.travel-cities {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.cities-label {
  display: block;
  font-size: 12px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.cities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.city-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
}

.travel-tips {
  margin-bottom: 16px;
}

.travel-tips .tip-text {
  font-size: 10px;
  opacity: 0.7;
  color: white;
}

/* 身份证样式 */
.id-card-front {
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  padding: 16px;
  aspect-ratio: 1.586;
}

.id-header {
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.id-body {
  display: flex;
  gap: 16px;
}

.id-info {
  flex: 1;
}

.id-info .info-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.id-info .label {
  font-size: 10px;
  color: #64748b;
  min-width: 45px;
}

.id-info .value {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.id-info .value.name {
  font-size: 16px;
}

.id-info .value.id-number {
  font-family: monospace;
  letter-spacing: 1px;
}

.id-info .info-row.address {
  flex-wrap: wrap;
}

.id-info .info-row.address .value {
  font-size: 10px;
  line-height: 1.4;
}

.id-photo {
  width: 70px;
  flex-shrink: 0;
}

.avatar, .avatar-placeholder {
  width: 70px;
  height: 90px;
  background: #e2e8f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 10px;
  color: #64748b;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 护照样式 */
.passport-card {
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  padding: 16px;
}

.passport-header {
  text-align: center;
  color: #fef3c7;
  margin-bottom: 16px;
}

.passport-header .country {
  display: block;
  font-size: 12px;
  font-weight: 600;
}

.passport-header .country-en {
  display: block;
  font-size: 9px;
  margin-bottom: 4px;
}

.passport-header .doc-type {
  font-size: 14px;
  font-weight: 700;
}

.passport-body {
  display: flex;
  gap: 12px;
  background: white;
  border-radius: 8px;
  padding: 12px;
}

.passport-photo {
  width: 60px;
  flex-shrink: 0;
}

.passport-photo .avatar,
.passport-photo .avatar-placeholder {
  width: 60px;
  height: 75px;
}

.passport-info {
  flex: 1;
}

.passport-info .info-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;
}

.passport-info .label {
  font-size: 7px;
  color: #64748b;
}

.passport-info .value {
  font-size: 10px;
  font-weight: 600;
  color: #1e293b;
}

.passport-mrz {
  margin-top: 12px;
  background: white;
  border-radius: 4px;
  padding: 8px;
  font-family: monospace;
}

.mrz-line {
  font-size: 8px;
  letter-spacing: 1px;
  color: #1e293b;
  word-break: break-all;
}

/* 驾驶证样式 */
.license-card {
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  padding: 16px;
}

.license-header {
  text-align: center;
  margin-bottom: 12px;
}

.license-header .title {
  display: block;
  font-size: 12px;
  color: #dc2626;
  font-weight: 600;
}

.license-header .subtitle {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.license-body {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.license-photo {
  width: 70px;
  flex-shrink: 0;
}

.license-photo .avatar,
.license-photo .avatar-placeholder {
  width: 70px;
  height: 90px;
}

.license-info {
  flex: 1;
}

.license-info .info-row {
  display: flex;
  margin-bottom: 4px;
}

.license-info .label {
  font-size: 9px;
  color: #64748b;
  min-width: 65px;
}

.license-info .value {
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
}

.license-info .value.small {
  font-size: 9px;
}

.license-info .value.highlight {
  color: #dc2626;
  font-size: 14px;
}

.license-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 9px;
  color: #475569;
  font-family: monospace;
}
</style>
