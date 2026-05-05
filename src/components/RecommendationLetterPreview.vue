<template>
  <div class="recommendation-letter-preview" :class="[data.template, data.language]" :style="{
    fontFamily: designSettings.fontFamilyCN,
    '--border-color': designSettings.borderColor,
    '--border-width': designSettings.borderWidth + 'px',
    '--border-style': designSettings.borderStyle,
    '--stamp-color': designSettings.stampColor,
    '--stamp-rotation': designSettings.stampRotation + 'deg',
    '--watermark-color': designSettings.watermarkColor,
    '--watermark-opacity': designSettings.watermarkOpacity / 100
  }">
    <!-- 自定义水印 -->
    <div v-if="designSettings.watermarkEnabled" class="watermark-layer" :class="designSettings.watermarkType || 'center'">
      <template v-if="designSettings.watermarkType === 'fullscreen'">
        <span v-for="i in 20" :key="i" class="watermark-text" :style="{
          color: designSettings.watermarkColor,
          opacity: designSettings.watermarkOpacity / 100
        }">{{ designSettings.watermarkText }}</span>
      </template>
      <span v-else class="watermark-center" :style="{
        color: designSettings.watermarkColor,
        opacity: designSettings.watermarkOpacity / 100
      }">{{ designSettings.watermarkText }}</span>
    </div>
    
    <!-- 边框装饰 -->
    <div v-if="designSettings.borderEnabled" class="custom-border" :class="'border-' + designSettings.borderStyle"></div>
    
    <!-- 印章 -->
    <div v-if="designSettings.stampEnabled" class="custom-stamp" :style="{
      color: designSettings.stampColor,
      borderColor: designSettings.stampColor,
      transform: 'rotate(' + designSettings.stampRotation + 'deg)'
    }">
      <div class="stamp-inner">
        {{ designSettings.stampType === 'official' ? '院系公章' : 
           designSettings.stampType === 'academic' ? '教务处' : 
           designSettings.stampType === 'registrar' ? '推荐人印' : designSettings.stampText || '印章' }}
      </div>
    </div>
    
    <!-- 正式模板 -->
    <div v-if="data.template === 'formal'" class="template-formal">
      <div class="letterhead" v-if="data.showLetterhead">
        <div class="letterhead-content">
          <div class="logo-area" v-if="data.institutionLogo">
            <img :src="data.institutionLogo" alt="logo" />
          </div>
          <div class="institution-info">
            <h1>{{ data.institutionName }}</h1>
            <h2>{{ data.institutionNameEn }}</h2>
            <p class="dept">{{ data.departmentName }} | {{ data.departmentNameEn }}</p>
          </div>
        </div>
        <div class="letterhead-line"></div>
      </div>
      
      <div class="letter-meta">
        <p class="date">{{ data.issueDate }}</p>
        <p class="ref">Ref: {{ data.letterNumber }}</p>
      </div>
      
      <div class="letter-title">
        <h2 class="cn">推 荐 信</h2>
        <h3 class="en">Letter of Recommendation</h3>
      </div>
      
      <div class="letter-recipient">
        <p class="cn">致相关院校招生委员会：</p>
        <p class="en" v-if="data.language !== 'chinese'">To Whom It May Concern:</p>
      </div>
      
      <div class="letter-body">
        <p class="cn-para intro">
          本人{{ data.recommenderName }}，现任{{ data.institutionName }}{{ data.departmentName }}{{ data.recommenderTitle }}。
          作为{{ data.applicantName }}同学的{{ data.relationship }}，与其相识{{ data.yearsKnown }}年，
          现应其本人申请{{ data.targetInstitution }}{{ data.targetProgram }}项目之请，特撰写此推荐信。
        </p>
        
        <div class="en-para intro" v-if="data.language !== 'chinese'">
          <p>
            I am {{ data.recommenderNameEn }}, {{ data.recommenderTitleEn }} at {{ data.departmentNameEn }}, 
            {{ data.institutionNameEn }}. I have known {{ data.applicantNameEn }} for {{ data.yearsKnown }} years 
            as {{ data.relationship }}. I am pleased to recommend {{ data.applicantGender === 'male' ? 'him' : 'her' }} 
            for admission to the {{ data.targetProgram }} program at {{ data.targetInstitution }}.
          </p>
        </div>
        
        <div class="section">
          <h4>学术能力 / Academic Ability</h4>
          <p class="cn-para">{{ data.academicAbility }}</p>
        </div>
        
        <div class="section">
          <h4>科研能力 / Research Ability</h4>
          <p class="cn-para">{{ data.researchAbility }}</p>
        </div>
        
        <div class="section">
          <h4>个人品质 / Personal Qualities</h4>
          <p class="cn-para">{{ data.personalQualities }}</p>
        </div>
        
        <p class="cn-para conclusion">{{ data.recommendations }}</p>
        
        <div class="en-para conclusion" v-if="data.language !== 'chinese'">
          <p>
            In conclusion, I give my highest recommendation to {{ data.applicantNameEn }} without reservation. 
            {{ data.applicantGender === 'male' ? 'He' : 'She' }} would be an excellent addition to your program.
          </p>
        </div>
      </div>
      
      <div class="letter-closing">
        <p class="cn">此致<br>敬礼</p>
        <p class="en" v-if="data.language !== 'chinese'">Sincerely,</p>
      </div>
      
      <div class="signature-area" v-if="data.showSignature">
        <div class="signature-line"></div>
        <div class="recommender-info">
          <p class="name">{{ data.recommenderName }}</p>
          <p class="name-en">{{ data.recommenderNameEn }}</p>
          <p class="title">{{ data.recommenderTitle }}</p>
          <p class="dept">{{ data.departmentName }}</p>
          <p class="inst">{{ data.institutionName }}</p>
          <p class="contact">Email: {{ data.recommenderEmail }}</p>
          <p class="contact">Tel: {{ data.recommenderPhone }}</p>
        </div>
      </div>
    </div>
    
    <!-- 学术模板 -->
    <div v-else-if="data.template === 'academic'" class="template-academic">
      <div class="academic-header">
        <div class="logo-section" v-if="data.institutionLogo">
          <img :src="data.institutionLogo" alt="logo" />
        </div>
        <div class="header-text">
          <h1>{{ data.institutionName }}</h1>
          <h2>{{ data.institutionNameEn }}</h2>
          <div class="dept-badge">{{ data.departmentName }}</div>
        </div>
      </div>
      
      <div class="academic-title">
        <span class="title-cn">推荐信</span>
        <span class="title-en">LETTER OF RECOMMENDATION</span>
      </div>
      
      <div class="info-cards">
        <div class="info-card applicant">
          <h4>被推荐人 / Applicant</h4>
          <div class="info-row">
            <span class="label">姓名:</span>
            <span class="value">{{ data.applicantName }} ({{ data.applicantNameEn }})</span>
          </div>
          <div class="info-row">
            <span class="label">专业:</span>
            <span class="value">{{ data.applicantMajor }}</span>
          </div>
          <div class="info-row">
            <span class="label">GPA:</span>
            <span class="value highlight">{{ data.applicantGPA }}</span>
          </div>
        </div>
        
        <div class="info-card recommender">
          <h4>推荐人 / Recommender</h4>
          <div class="info-row">
            <span class="label">姓名:</span>
            <span class="value">{{ data.recommenderName }}</span>
          </div>
          <div class="info-row">
            <span class="label">职务:</span>
            <span class="value">{{ data.recommenderTitle }}</span>
          </div>
          <div class="info-row">
            <span class="label">关系:</span>
            <span class="value">{{ data.relationship }}</span>
          </div>
        </div>
      </div>
      
      <div class="content-sections">
        <div class="content-block">
          <div class="block-header">
            <span class="icon">📚</span>
            <span>学术能力评价</span>
          </div>
          <p>{{ data.academicAbility }}</p>
        </div>
        
        <div class="content-block">
          <div class="block-header">
            <span class="icon">🔬</span>
            <span>科研能力评价</span>
          </div>
          <p>{{ data.researchAbility }}</p>
        </div>
        
        <div class="content-block">
          <div class="block-header">
            <span class="icon">⭐</span>
            <span>综合素质评价</span>
          </div>
          <p>{{ data.personalQualities }}</p>
        </div>
      </div>
      
      <div class="recommendation-badge">
        <span class="badge-text">强烈推荐</span>
        <span class="badge-sub">Highly Recommended</span>
      </div>
      
      <div class="academic-footer">
        <div class="footer-signature" v-if="data.showSignature">
          <p class="sig-name">{{ data.recommenderName }}</p>
          <p class="sig-title">{{ data.recommenderTitle }}</p>
        </div>
        <div class="footer-date">
          <p>{{ data.issueDate }}</p>
          <p class="ref">{{ data.letterNumber }}</p>
        </div>
      </div>
    </div>
    
    <!-- 现代模板 -->
    <div v-else class="template-modern">
      <div class="modern-header">
        <div class="brand">
          <div class="logo" v-if="data.institutionLogo">
            <img :src="data.institutionLogo" alt="logo" />
          </div>
          <div>
            <h1>{{ data.institutionName }}</h1>
            <p>{{ data.departmentName }}</p>
          </div>
        </div>
        <div class="doc-type">
          <span class="type-badge">推荐信</span>
          <span class="type-date">{{ data.issueDate }}</span>
        </div>
      </div>
      
      <div class="modern-body">
        <div class="profile-section">
          <div class="profile-card">
            <div class="profile-icon">👤</div>
            <div class="profile-info">
              <h3>{{ data.applicantName }}</h3>
              <p>{{ data.applicantMajor }} | {{ data.applicantGrade }}</p>
              <span class="gpa-badge">GPA: {{ data.applicantGPA }}</span>
            </div>
          </div>
          
          <div class="arrow-icon">→</div>
          
          <div class="target-card">
            <div class="target-icon">🎯</div>
            <div class="target-info">
              <h3>{{ data.targetInstitution }}</h3>
              <p>{{ data.targetProgram }}</p>
            </div>
          </div>
        </div>
        
        <div class="evaluation-section">
          <div class="eval-item">
            <div class="eval-label">学术能力</div>
            <div class="eval-content">{{ data.academicAbility }}</div>
          </div>
          <div class="eval-item">
            <div class="eval-label">科研能力</div>
            <div class="eval-content">{{ data.researchAbility }}</div>
          </div>
          <div class="eval-item">
            <div class="eval-label">个人品质</div>
            <div class="eval-content">{{ data.personalQualities }}</div>
          </div>
        </div>
        
        <div class="verdict-section">
          <div class="verdict-icon">✓</div>
          <div class="verdict-text">{{ data.recommendations }}</div>
        </div>
      </div>
      
      <div class="modern-footer" v-if="data.showSignature">
        <div class="recommender-card">
          <div class="rec-avatar">{{ data.recommenderName[0] }}</div>
          <div class="rec-info">
            <h4>{{ data.recommenderName }}</h4>
            <p>{{ data.recommenderTitle }}</p>
            <p class="rec-contact">{{ data.recommenderEmail }}</p>
          </div>
        </div>
        <div class="ref-number">{{ data.letterNumber }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRecommendationLetterStore } from '@/stores/recommendationLetter'

const store = useRecommendationLetterStore()
const data = store.data
const designSettings = store.designSettings
</script>

<style scoped>
.recommendation-letter-preview {
  background: #fff;
  color: #333;
  font-family: 'SimSun', 'Songti SC', serif;
  position: relative;
}

/* 自定义水印 */
.watermark-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}

.watermark-layer.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.watermark-layer.fullscreen {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  gap: 30px;
  padding: 20px;
}

.watermark-center {
  font-size: 80px;
  font-weight: bold;
  transform: rotate(-30deg);
  white-space: nowrap;
  letter-spacing: 10px;
}

.watermark-text {
  font-size: 16px;
  font-weight: bold;
  transform: rotate(-30deg);
  white-space: nowrap;
}

/* 自定义边框 */
.custom-border {
  position: absolute;
  inset: 8px;
  pointer-events: none;
  z-index: 50;
}

.custom-border.border-solid {
  border: var(--border-width) solid var(--border-color);
}

.custom-border.border-double {
  border: var(--border-width) double var(--border-color);
}

.custom-border.border-dashed {
  border: var(--border-width) dashed var(--border-color);
}

.custom-border.border-ornate {
  border: var(--border-width) solid var(--border-color);
}

/* 自定义印章 */
.custom-stamp {
  position: absolute;
  bottom: 100px;
  right: 80px;
  width: 100px;
  height: 100px;
  border: 3px solid;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  font-weight: bold;
}

.custom-stamp .stamp-inner {
  text-align: center;
  font-size: 14px;
  line-height: 1.2;
}

/* 正式模板 */
.template-formal {
  padding: 50px;
  min-height: 900px;
}

.template-formal .letterhead {
  margin-bottom: 30px;
}

.template-formal .letterhead-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.template-formal .logo-area img {
  width: 70px;
  height: 70px;
}

.template-formal .institution-info h1 {
  font-size: 24px;
  color: #1a237e;
  margin: 0;
}

.template-formal .institution-info h2 {
  font-size: 14px;
  color: #555;
  margin: 4px 0;
  font-family: 'Times New Roman', serif;
}

.template-formal .institution-info .dept {
  font-size: 12px;
  color: #777;
  margin: 0;
}

.template-formal .letterhead-line {
  height: 2px;
  background: linear-gradient(90deg, #1a237e, #3949ab, transparent);
  margin-top: 15px;
}

.template-formal .letter-meta {
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-bottom: 30px;
}

.template-formal .letter-title {
  text-align: center;
  margin: 30px 0;
}

.template-formal .letter-title .cn {
  font-size: 26px;
  letter-spacing: 15px;
  color: #1a237e;
  margin: 0;
}

.template-formal .letter-title .en {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
  font-family: 'Times New Roman', serif;
  letter-spacing: 2px;
}

.template-formal .letter-recipient {
  margin: 25px 0;
}

.template-formal .letter-recipient .cn {
  font-size: 14px;
  margin: 0;
}

.template-formal .letter-recipient .en {
  font-size: 12px;
  color: #555;
  margin: 5px 0 0;
  font-family: 'Times New Roman', serif;
}

.template-formal .letter-body {
  line-height: 2;
  text-align: justify;
}

.template-formal .cn-para {
  font-size: 14px;
  text-indent: 2em;
  margin: 0 0 15px;
}

.template-formal .en-para {
  font-size: 12px;
  color: #555;
  margin: 0 0 15px;
  font-family: 'Times New Roman', serif;
}

.template-formal .section {
  margin: 20px 0;
}

.template-formal .section h4 {
  font-size: 13px;
  color: #1a237e;
  margin: 0 0 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e0e0e0;
}

.template-formal .letter-closing {
  margin: 40px 0 30px;
  text-align: right;
}

.template-formal .letter-closing .cn {
  font-size: 14px;
  margin: 0;
  line-height: 2;
}

.template-formal .letter-closing .en {
  font-size: 12px;
  color: #555;
  margin-top: 10px;
  font-family: 'Times New Roman', serif;
}

.template-formal .signature-area {
  text-align: right;
  margin-top: 40px;
}

.template-formal .signature-line {
  width: 200px;
  height: 1px;
  background: #333;
  margin-left: auto;
  margin-bottom: 15px;
}

.template-formal .recommender-info {
  font-size: 12px;
  line-height: 1.6;
}

.template-formal .recommender-info .name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.template-formal .recommender-info .name-en {
  font-size: 12px;
  color: #666;
  margin: 2px 0 8px;
  font-family: 'Times New Roman', serif;
}

.template-formal .recommender-info .contact {
  font-size: 11px;
  color: #888;
}

/* 学术模板 */
.template-academic {
  padding: 40px;
  min-height: 850px;
  background: linear-gradient(to bottom, #f8f9fa 0%, #fff 100px);
}

.template-academic .academic-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.template-academic .logo-section img {
  width: 60px;
  height: 60px;
}

.template-academic .header-text h1 {
  font-size: 22px;
  color: #1a237e;
  margin: 0;
}

.template-academic .header-text h2 {
  font-size: 12px;
  color: #666;
  margin: 4px 0;
}

.template-academic .dept-badge {
  display: inline-block;
  background: #e8eaf6;
  color: #3949ab;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  margin-top: 8px;
}

.template-academic .academic-title {
  text-align: center;
  margin: 30px 0;
  padding: 20px 0;
  border-top: 2px solid #1a237e;
  border-bottom: 2px solid #1a237e;
}

.template-academic .title-cn {
  display: block;
  font-size: 24px;
  letter-spacing: 12px;
  color: #1a237e;
}

.template-academic .title-en {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  letter-spacing: 4px;
}

.template-academic .info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.template-academic .info-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
}

.template-academic .info-card h4 {
  font-size: 12px;
  color: #1a237e;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8eaf6;
}

.template-academic .info-row {
  display: flex;
  font-size: 12px;
  margin: 6px 0;
}

.template-academic .info-row .label {
  color: #888;
  min-width: 50px;
}

.template-academic .info-row .value.highlight {
  color: #1a237e;
  font-weight: 600;
}

.template-academic .content-sections {
  margin: 25px 0;
}

.template-academic .content-block {
  background: #fff;
  border-left: 3px solid #3949ab;
  padding: 15px;
  margin-bottom: 15px;
}

.template-academic .block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 10px;
}

.template-academic .content-block p {
  font-size: 12px;
  line-height: 1.8;
  margin: 0;
  color: #444;
}

.template-academic .recommendation-badge {
  text-align: center;
  margin: 30px 0;
  padding: 20px;
  background: linear-gradient(135deg, #1a237e, #3949ab);
  border-radius: 8px;
  color: #fff;
}

.template-academic .badge-text {
  display: block;
  font-size: 20px;
  font-weight: 600;
}

.template-academic .badge-sub {
  font-size: 12px;
  opacity: 0.9;
}

.template-academic .academic-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.template-academic .footer-signature {
  text-align: left;
}

.template-academic .sig-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.template-academic .sig-title {
  font-size: 12px;
  color: #666;
  margin: 4px 0 0;
}

.template-academic .footer-date {
  text-align: right;
  font-size: 12px;
  color: #888;
}

/* 现代模板 */
.template-modern {
  padding: 30px;
  min-height: 800px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.template-modern .modern-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  color: #fff;
}

.template-modern .brand {
  display: flex;
  align-items: center;
  gap: 15px;
}

.template-modern .logo img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
}

.template-modern .brand h1 {
  font-size: 20px;
  margin: 0;
}

.template-modern .brand p {
  font-size: 12px;
  margin: 4px 0 0;
  opacity: 0.9;
}

.template-modern .doc-type {
  text-align: right;
}

.template-modern .type-badge {
  display: block;
  background: rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.template-modern .type-date {
  display: block;
  font-size: 11px;
  margin-top: 8px;
  opacity: 0.8;
}

.template-modern .modern-body {
  background: #fff;
  border-radius: 16px;
  padding: 25px;
  color: #333;
}

.template-modern .profile-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #eee;
}

.template-modern .profile-card,
.template-modern .target-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.template-modern .profile-icon,
.template-modern .target-icon {
  font-size: 30px;
}

.template-modern .profile-info h3,
.template-modern .target-info h3 {
  font-size: 16px;
  margin: 0;
}

.template-modern .profile-info p,
.template-modern .target-info p {
  font-size: 11px;
  color: #666;
  margin: 4px 0 0;
}

.template-modern .gpa-badge {
  display: inline-block;
  background: #667eea;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  margin-top: 6px;
}

.template-modern .arrow-icon {
  font-size: 24px;
  color: #667eea;
}

.template-modern .evaluation-section {
  margin-bottom: 20px;
}

.template-modern .eval-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
}

.template-modern .eval-label {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 8px;
}

.template-modern .eval-content {
  font-size: 13px;
  line-height: 1.7;
  color: #555;
}

.template-modern .verdict-section {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: #fff;
}

.template-modern .verdict-icon {
  font-size: 24px;
  background: rgba(255,255,255,0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.template-modern .verdict-text {
  font-size: 13px;
  line-height: 1.7;
}

.template-modern .modern-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #fff;
}

.template-modern .recommender-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-modern .rec-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.template-modern .rec-info h4 {
  font-size: 14px;
  margin: 0;
}

.template-modern .rec-info p {
  font-size: 11px;
  margin: 2px 0 0;
  opacity: 0.9;
}

.template-modern .ref-number {
  font-size: 10px;
  opacity: 0.7;
}
</style>
