<template>
  <div class="govuk-page-wrapper" ref="previewRef">
    <!-- 浏览器地址栏模拟 (可选) -->
    <div v-if="store.designSettings.showBrowserBar" class="browser-bar">
      <div class="browser-controls">
        <span class="browser-dot red"></span>
        <span class="browser-dot yellow"></span>
        <span class="browser-dot green"></span>
      </div>
      <div class="browser-address">
        <span class="lock-icon">🔒</span>
        <span class="url">www.gov.uk/view-prove-immigration-status</span>
      </div>
      <div class="browser-actions">
        <span>⋮</span>
      </div>
    </div>

    <!-- GOV.UK 页面内容 -->
    <div class="govuk-template">
      <!-- Skip link (隐藏但保持真实性) -->
      <a href="#main-content" class="govuk-skip-link">Skip to main content</a>

      <!-- GOV.UK 顶部导航 -->
      <header class="govuk-header" role="banner">
        <div class="govuk-header__container govuk-width-container">
          <div class="govuk-header__logo">
            <a href="#" class="govuk-header__link govuk-header__link--homepage">
              <span class="govuk-header__logotype">
                <svg aria-hidden="true" focusable="false" class="govuk-header__logotype-crown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 97" height="30" width="36">
                  <path fill="currentColor" fill-rule="evenodd" d="M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.6.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.6 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z"/>
                </svg>
                <span class="govuk-header__logotype-text">GOV.UK</span>
              </span>
            </a>
          </div>
        </div>
      </header>

      <!-- 蓝色服务条 -->
      <div class="govuk-service-header">
        <div class="govuk-width-container">
          <a href="#" class="govuk-service-header__link">View and prove your immigration status</a>
        </div>
      </div>

      <!-- 主要内容 -->
      <div class="govuk-width-container">
        <main class="govuk-main-wrapper" id="main-content" role="main">
          
          <!-- 成功面板 -->
          <div class="govuk-panel govuk-panel--confirmation">
            <h1 class="govuk-panel__title">Your immigration status</h1>
          </div>

          <!-- 用户信息卡片 -->
          <div class="govuk-grid-row">
            <div class="govuk-grid-column-two-thirds">
              
              <!-- 个人信息区 -->
              <div class="govuk-card govuk-card--profile">
                <div class="profile-content">
                  <div class="profile-photo" v-if="store.designSettings.showPhoto">
                    <img v-if="store.data.photo" :src="store.data.photo" :alt="`Photo of ${store.data.givenNames} ${store.data.surname}`" />
                    <div v-else class="photo-placeholder">
                      <svg viewBox="0 0 24 24" width="48" height="48">
                        <path fill="#b1b4b6" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="profile-details">
                    <h2 class="govuk-heading-l profile-name">{{ store.data.givenNames }} {{ store.data.surname }}</h2>
                    <p class="govuk-body"><span class="label">Date of birth:</span> <strong>{{ formatDateUK(store.data.dateOfBirth) }}</strong></p>
                    <p class="govuk-body"><span class="label">Nationality:</span> <strong>{{ store.data.nationality }}</strong></p>
                  </div>
                </div>
              </div>

              <!-- 移民身份 -->
              <h2 class="govuk-heading-m">Immigration status</h2>
              <dl class="govuk-summary-list">
                <div class="govuk-summary-list__row">
                  <dt class="govuk-summary-list__key">Status</dt>
                  <dd class="govuk-summary-list__value">
                    <strong class="govuk-tag" :class="statusTagClass">{{ getStatusText }}</strong>
                  </dd>
                </div>
                <div class="govuk-summary-list__row">
                  <dt class="govuk-summary-list__key">Immigration route</dt>
                  <dd class="govuk-summary-list__value">{{ store.data.visaCategory }}</dd>
                </div>
                <div class="govuk-summary-list__row">
                  <dt class="govuk-summary-list__key">Start date</dt>
                  <dd class="govuk-summary-list__value">{{ formatDateUK(store.data.validFrom) }}</dd>
                </div>
                <div class="govuk-summary-list__row">
                  <dt class="govuk-summary-list__key">Expiry date</dt>
                  <dd class="govuk-summary-list__value">{{ formatDateUK(store.data.validUntil) }}</dd>
                </div>
              </dl>

              <!-- 权限说明 -->
              <h2 class="govuk-heading-m govuk-!-margin-top-6">What you can and cannot do</h2>
              
              <h3 class="govuk-heading-s">Work</h3>
              <div class="govuk-inset-text" :class="{ 'govuk-inset-text--green': store.data.workAllowed, 'govuk-inset-text--red': !store.data.workAllowed }">
                <p class="govuk-body">
                  <strong v-if="store.data.workAllowed">You can work in the UK</strong>
                  <strong v-else>You cannot work in the UK</strong>
                </p>
                <p class="govuk-body govuk-!-margin-bottom-0" v-if="store.data.workAllowed && store.data.visaType === 'student'">
                  Work is limited to 20 hours per week during term time.
                </p>
              </div>

              <h3 class="govuk-heading-s">Study</h3>
              <div class="govuk-inset-text" :class="{ 'govuk-inset-text--green': store.data.studyAllowed, 'govuk-inset-text--red': !store.data.studyAllowed }">
                <p class="govuk-body govuk-!-margin-bottom-0">
                  <strong v-if="store.data.studyAllowed">You can study in the UK</strong>
                  <strong v-else>You cannot study in the UK</strong>
                </p>
              </div>

              <h3 class="govuk-heading-s">Access to public funds</h3>
              <div class="govuk-inset-text" :class="{ 'govuk-inset-text--green': store.data.publicFundsAllowed, 'govuk-inset-text--red': !store.data.publicFundsAllowed }">
                <p class="govuk-body govuk-!-margin-bottom-0">
                  <strong v-if="store.data.publicFundsAllowed">You can access public funds</strong>
                  <strong v-else>No recourse to public funds</strong>
                </p>
              </div>

              <!-- 担保人信息 -->
              <template v-if="store.data.visaType === 'student' || store.data.visaType === 'work'">
                <h2 class="govuk-heading-m govuk-!-margin-top-6">Sponsor details</h2>
                <dl class="govuk-summary-list">
                  <div class="govuk-summary-list__row">
                    <dt class="govuk-summary-list__key">Sponsor name</dt>
                    <dd class="govuk-summary-list__value">{{ store.data.sponsor }}</dd>
                  </div>
                  <div class="govuk-summary-list__row" v-if="store.data.sponsorLicenseNumber">
                    <dt class="govuk-summary-list__key">Sponsor licence number</dt>
                    <dd class="govuk-summary-list__value">{{ store.data.sponsorLicenseNumber }}</dd>
                  </div>
                  <div class="govuk-summary-list__row" v-if="store.data.courseTitle && store.data.visaType === 'student'">
                    <dt class="govuk-summary-list__key">Course of study</dt>
                    <dd class="govuk-summary-list__value">{{ store.data.courseTitle }}</dd>
                  </div>
                </dl>
              </template>

              <!-- 其他条件 -->
              <template v-if="store.data.conditions && store.data.conditions.length > 0 && store.data.conditions[0]">
                <h2 class="govuk-heading-m govuk-!-margin-top-6">Conditions</h2>
                <ul class="govuk-list govuk-list--bullet">
                  <li v-for="(condition, index) in store.data.conditions" :key="index" v-show="condition">
                    {{ condition }}
                  </li>
                </ul>
              </template>

              <!-- 分享码 -->
              <div class="govuk-!-margin-top-8" v-if="store.designSettings.showQRCode">
                <h2 class="govuk-heading-m">Prove your immigration status</h2>
                <p class="govuk-body">Use this share code to prove your immigration status to employers, landlords or other organisations.</p>
                
                <div class="share-code-panel">
                  <p class="share-code-label">Your share code is</p>
                  <p class="share-code-value">{{ store.data.shareCode }}</p>
                  <p class="share-code-info">This code will expire in <strong>90 days</strong></p>
                </div>

                <p class="govuk-body govuk-!-margin-top-4">
                  Give this code to the person checking your status. They will also need your date of birth: <strong>{{ formatDateUK(store.data.dateOfBirth) }}</strong>
                </p>
              </div>

              <!-- 护照信息 -->
              <details class="govuk-details govuk-!-margin-top-6">
                <summary class="govuk-details__summary">
                  <span class="govuk-details__summary-text">View your linked identity documents</span>
                </summary>
                <div class="govuk-details__text">
                  <dl class="govuk-summary-list govuk-summary-list--no-border">
                    <div class="govuk-summary-list__row">
                      <dt class="govuk-summary-list__key">Document type</dt>
                      <dd class="govuk-summary-list__value">Passport</dd>
                    </div>
                    <div class="govuk-summary-list__row">
                      <dt class="govuk-summary-list__key">Document number</dt>
                      <dd class="govuk-summary-list__value">{{ store.data.passportNumber }}</dd>
                    </div>
                    <div class="govuk-summary-list__row">
                      <dt class="govuk-summary-list__key">Country of issue</dt>
                      <dd class="govuk-summary-list__value">{{ store.data.nationality }}</dd>
                    </div>
                  </dl>
                </div>
              </details>

              <!-- 操作按钮 -->
              <div class="govuk-button-group govuk-!-margin-top-6">
                <button class="govuk-button" data-module="govuk-button">
                  Get a new share code
                </button>
                <a href="#" class="govuk-link">Update your details</a>
              </div>

            </div>
          </div>

        </main>
      </div>

      <!-- 页脚 -->
      <footer class="govuk-footer" role="contentinfo">
        <div class="govuk-width-container">
          <div class="govuk-footer__meta">
            <div class="govuk-footer__meta-item govuk-footer__meta-item--grow">
              <h2 class="govuk-visually-hidden">Support links</h2>
              <ul class="govuk-footer__inline-list">
                <li class="govuk-footer__inline-list-item">
                  <a class="govuk-footer__link" href="#">Help</a>
                </li>
                <li class="govuk-footer__inline-list-item">
                  <a class="govuk-footer__link" href="#">Privacy</a>
                </li>
                <li class="govuk-footer__inline-list-item">
                  <a class="govuk-footer__link" href="#">Cookies</a>
                </li>
                <li class="govuk-footer__inline-list-item">
                  <a class="govuk-footer__link" href="#">Accessibility statement</a>
                </li>
                <li class="govuk-footer__inline-list-item">
                  <a class="govuk-footer__link" href="#">Contact</a>
                </li>
                <li class="govuk-footer__inline-list-item">
                  <a class="govuk-footer__link" href="#">Terms and conditions</a>
                </li>
              </ul>
              <svg aria-hidden="true" focusable="false" class="govuk-footer__licence-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 483.2 195.7" height="17" width="41">
                <path fill="currentColor" d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145"/>
              </svg>
              <span class="govuk-footer__licence-description">
                All content is available under the
                <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</a>, except where otherwise stated
              </span>
            </div>
            <div class="govuk-footer__meta-item">
              <a class="govuk-footer__link govuk-footer__copyright-logo" href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">
                © Crown copyright
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUKEvisaStore } from '@/stores/ukEvisa'

const store = useUKEvisaStore()
const previewRef = ref<HTMLElement>()

// 格式化日期为英国格式
const formatDateUK = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// 获取状态文本
const getStatusText = computed(() => {
  switch (store.data.visaStatus) {
    case 'valid': return 'Permission to stay'
    case 'expired': return 'Expired'
    case 'cancelled': return 'Cancelled'
    default: return 'Unknown'
  }
})

// 获取状态标签类
const statusTagClass = computed(() => {
  switch (store.data.visaStatus) {
    case 'valid': return 'govuk-tag--green'
    case 'expired': return 'govuk-tag--red'
    case 'cancelled': return 'govuk-tag--orange'
    default: return 'govuk-tag--grey'
  }
})

// 暴露给父组件
defineExpose({
  previewRef
})
</script>

<style scoped>
/* 基础重置和字体 */
.govuk-page-wrapper {
  font-family: "GDS Transport", "nta", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.25;
  color: #0b0c0c;
  background: #ffffff;
}

/* 浏览器地址栏模拟 */
.browser-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #dee0e2;
  border-bottom: 1px solid #b1b4b6;
}

.browser-controls {
  display: flex;
  gap: 6px;
  margin-right: 12px;
}

.browser-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.browser-dot.red { background: #ff5f57; }
.browser-dot.yellow { background: #febc2e; }
.browser-dot.green { background: #28c840; }

.browser-address {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
}

.lock-icon {
  font-size: 12px;
}

.url {
  color: #0b0c0c;
}

.browser-actions {
  margin-left: 12px;
  font-size: 18px;
  color: #505a5f;
}

/* Skip link */
.govuk-skip-link {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Header */
.govuk-header {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.25;
  background-color: #0b0c0c;
  border-bottom: 10px solid #1d70b8;
}

.govuk-header__container {
  position: relative;
  margin-bottom: -10px;
  padding-top: 10px;
  border-bottom: 10px solid transparent;
}

.govuk-header__logotype {
  display: flex;
  align-items: center;
}

.govuk-header__logotype-crown {
  margin-right: 6px;
  fill: currentColor;
  vertical-align: top;
}

.govuk-header__link {
  text-decoration: none;
}

.govuk-header__link:link,
.govuk-header__link:visited {
  color: #ffffff;
}

.govuk-header__link--homepage {
  display: inline-block;
  margin-right: 10px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
}

.govuk-header__logotype-text {
  font-size: 30px;
  font-weight: 700;
}

/* Service Header */
.govuk-service-header {
  padding: 10px 0;
  background-color: #1d70b8;
  border-bottom: 1px solid transparent;
}

.govuk-service-header__link {
  display: inline-block;
  font-size: 19px;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
}

/* Container */
.govuk-width-container {
  max-width: 960px;
  margin: 0 15px;
}

@media (min-width: 641px) {
  .govuk-width-container {
    margin: 0 30px;
  }
}

@media (min-width: 1020px) {
  .govuk-width-container {
    margin: 0 auto;
  }
}

/* Main wrapper */
.govuk-main-wrapper {
  display: block;
  padding-top: 40px;
  padding-bottom: 40px;
}

/* Panel */
.govuk-panel {
  box-sizing: border-box;
  margin-bottom: 15px;
  padding: 35px;
  border: 5px solid transparent;
  text-align: center;
}

.govuk-panel--confirmation {
  color: #ffffff;
  background: #00703c;
}

.govuk-panel__title {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 32px;
  font-weight: 700;
}

@media (min-width: 641px) {
  .govuk-panel__title {
    font-size: 48px;
  }
}

/* Grid */
.govuk-grid-row {
  margin-right: -15px;
  margin-left: -15px;
}

.govuk-grid-row::after {
  content: "";
  display: block;
  clear: both;
}

.govuk-grid-column-two-thirds {
  box-sizing: border-box;
  width: 100%;
  padding: 0 15px;
}

@media (min-width: 641px) {
  .govuk-grid-column-two-thirds {
    width: 66.6666%;
    float: left;
  }
}

/* Profile Card */
.govuk-card--profile {
  padding: 20px;
  margin-bottom: 30px;
  background: #f3f2f1;
  border-left: 5px solid #1d70b8;
}

.profile-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.profile-photo {
  flex-shrink: 0;
  width: 120px;
  height: 150px;
  background: #ffffff;
  border: 1px solid #b1b4b6;
  overflow: hidden;
}

.profile-photo img {
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
  background: #f3f2f1;
}

.profile-details {
  flex: 1;
}

.profile-name {
  margin-top: 0;
  margin-bottom: 15px;
}

.profile-details .label {
  color: #505a5f;
}

/* Headings */
.govuk-heading-l {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.0416666667;
  margin-bottom: 20px;
  color: #0b0c0c;
}

@media (min-width: 641px) {
  .govuk-heading-l {
    font-size: 36px;
  }
}

.govuk-heading-m {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1111111111;
  margin-top: 0;
  margin-bottom: 15px;
  color: #0b0c0c;
}

@media (min-width: 641px) {
  .govuk-heading-m {
    font-size: 24px;
  }
}

.govuk-heading-s {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  margin-top: 25px;
  margin-bottom: 10px;
  color: #0b0c0c;
}

@media (min-width: 641px) {
  .govuk-heading-s {
    font-size: 19px;
  }
}

/* Body text */
.govuk-body {
  font-size: 16px;
  line-height: 1.25;
  margin-top: 0;
  margin-bottom: 15px;
  color: #0b0c0c;
}

@media (min-width: 641px) {
  .govuk-body {
    font-size: 19px;
    line-height: 1.3157894737;
  }
}

/* Summary List */
.govuk-summary-list {
  font-size: 16px;
  line-height: 1.25;
  margin: 0 0 20px;
  display: table;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

@media (min-width: 641px) {
  .govuk-summary-list {
    font-size: 19px;
    line-height: 1.3157894737;
  }
}

.govuk-summary-list__row {
  display: table-row;
  border-bottom: 1px solid #b1b4b6;
}

.govuk-summary-list__key {
  display: table-cell;
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 10px;
  font-weight: 700;
  width: 30%;
}

.govuk-summary-list__value {
  display: table-cell;
  padding-top: 10px;
  padding-bottom: 10px;
}

.govuk-summary-list--no-border .govuk-summary-list__row {
  border-bottom: none;
}

/* Tags */
.govuk-tag {
  display: inline-block;
  padding: 5px 8px 4px 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #ffffff;
  background-color: #1d70b8;
}

.govuk-tag--green {
  background-color: #00703c;
}

.govuk-tag--red {
  background-color: #d4351c;
}

.govuk-tag--orange {
  background-color: #f47738;
}

.govuk-tag--grey {
  background-color: #505a5f;
}

/* Inset text */
.govuk-inset-text {
  font-size: 16px;
  line-height: 1.25;
  padding: 15px;
  margin-top: 20px;
  margin-bottom: 20px;
  clear: both;
  border-left: 10px solid #b1b4b6;
}

@media (min-width: 641px) {
  .govuk-inset-text {
    font-size: 19px;
  }
}

.govuk-inset-text--green {
  border-left-color: #00703c;
  background-color: #e6f3ec;
}

.govuk-inset-text--red {
  border-left-color: #d4351c;
  background-color: #fbeeed;
}

/* List */
.govuk-list {
  font-size: 16px;
  line-height: 1.25;
  margin-top: 0;
  margin-bottom: 15px;
  padding-left: 0;
  list-style-type: none;
}

@media (min-width: 641px) {
  .govuk-list {
    font-size: 19px;
    line-height: 1.3157894737;
  }
}

.govuk-list--bullet {
  padding-left: 20px;
  list-style-type: disc;
}

.govuk-list--bullet > li {
  margin-bottom: 5px;
}

/* Share code panel */
.share-code-panel {
  padding: 20px;
  margin: 20px 0;
  text-align: center;
  background-color: #f3f2f1;
  border: 2px solid #0b0c0c;
}

.share-code-label {
  font-size: 16px;
  margin: 0 0 10px;
  color: #505a5f;
}

.share-code-value {
  font-size: 36px;
  font-weight: 700;
  font-family: "nta", monospace;
  letter-spacing: 5px;
  margin: 0 0 10px;
  color: #0b0c0c;
}

@media (min-width: 641px) {
  .share-code-value {
    font-size: 48px;
    letter-spacing: 8px;
  }
}

.share-code-info {
  font-size: 14px;
  margin: 0;
  color: #505a5f;
}

/* Details */
.govuk-details {
  font-size: 16px;
  line-height: 1.25;
  margin-bottom: 20px;
}

@media (min-width: 641px) {
  .govuk-details {
    font-size: 19px;
  }
}

.govuk-details__summary {
  display: inline-block;
  position: relative;
  margin-bottom: 5px;
  padding-left: 25px;
  color: #1d70b8;
  cursor: pointer;
}

.govuk-details__summary-text {
  text-decoration: underline;
}

.govuk-details__summary::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  display: block;
  width: 0;
  height: 0;
  border-style: solid;
  border-color: transparent;
  clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
  border-width: 7px 0 7px 12.124px;
  border-left-color: inherit;
}

.govuk-details[open] > .govuk-details__summary::before {
  clip-path: polygon(0% 0%, 50% 100%, 100% 0%);
  border-width: 12.124px 7px 0 7px;
  border-top-color: inherit;
}

.govuk-details__text {
  padding: 15px;
  padding-left: 20px;
  border-left: 5px solid #b1b4b6;
}

/* Button */
.govuk-button {
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.1875;
  box-sizing: border-box;
  display: inline-block;
  position: relative;
  width: 100%;
  margin-top: 0;
  margin-bottom: 22px;
  padding: 8px 10px 7px;
  border: 2px solid transparent;
  border-radius: 0;
  color: #ffffff;
  background-color: #00703c;
  box-shadow: 0 2px 0 #002d18;
  text-align: center;
  vertical-align: top;
  cursor: pointer;
  appearance: none;
}

@media (min-width: 641px) {
  .govuk-button {
    font-size: 19px;
    width: auto;
  }
}

.govuk-button:hover {
  background-color: #005a30;
}

/* Button group */
.govuk-button-group {
  margin-bottom: 5px;
}

.govuk-button-group > * {
  margin-bottom: 17px;
}

@media (min-width: 641px) {
  .govuk-button-group {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
  }

  .govuk-button-group > * {
    margin-right: 15px;
  }
}

/* Links */
.govuk-link {
  font-family: inherit;
  font-size: 16px;
  line-height: 1.25;
  color: #1d70b8;
  text-decoration: underline;
}

@media (min-width: 641px) {
  .govuk-link {
    font-size: 19px;
  }
}

.govuk-link:hover {
  color: #003078;
}

/* Footer */
.govuk-footer {
  font-size: 14px;
  line-height: 1.1428571429;
  padding-top: 25px;
  padding-bottom: 15px;
  border-top: 1px solid #b1b4b6;
  color: #0b0c0c;
  background: #f3f2f1;
}

@media (min-width: 641px) {
  .govuk-footer {
    font-size: 16px;
    line-height: 1.25;
  }
}

.govuk-footer__meta {
  display: flex;
  margin-right: -15px;
  margin-left: -15px;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
}

.govuk-footer__meta-item {
  margin-right: 15px;
  margin-bottom: 25px;
  margin-left: 15px;
}

.govuk-footer__meta-item--grow {
  flex: 1;
}

.govuk-footer__inline-list {
  margin-top: 0;
  margin-bottom: 15px;
  padding: 0;
}

.govuk-footer__inline-list-item {
  display: inline-block;
  margin-right: 15px;
  margin-bottom: 5px;
}

.govuk-footer__link {
  color: #0b0c0c;
  text-decoration: underline;
}

.govuk-footer__link:hover {
  color: rgba(11, 12, 12, 0.99);
}

.govuk-footer__licence-logo {
  display: inline-block;
  margin-right: 10px;
  vertical-align: top;
}

.govuk-footer__licence-description {
  display: inline-block;
}

.govuk-footer__copyright-logo {
  display: inline-block;
  min-width: 125px;
  padding-top: 112px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 132 97' width='125' height='102'%3E%3Cpath fill='%230b0c0c' fill-rule='evenodd' d='M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.6.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.6 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 50% 0%;
  background-size: 125px 102px;
  text-align: center;
  white-space: nowrap;
}

/* Utility classes */
.govuk-\!-margin-top-6 {
  margin-top: 30px !important;
}

.govuk-\!-margin-top-8 {
  margin-top: 50px !important;
}

.govuk-\!-margin-bottom-0 {
  margin-bottom: 0 !important;
}

.govuk-visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  clip-path: inset(50%) !important;
  border: 0 !important;
  white-space: nowrap !important;
}

/* Print styles */
@media print {
  .browser-bar {
    display: none;
  }
  
  .govuk-button-group {
    display: none;
  }
}
</style>
