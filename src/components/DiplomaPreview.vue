<template>
  <div class="diploma-preview" :class="[data.template, data.borderStyle]">
    <!-- 官方模板 -->
    <div v-if="data.template === 'official'" class="template-official">
      <div class="border-frame">
        <div class="inner-border">
          <!-- 国徽 -->
          <div class="national-emblem" v-if="data.showNationalEmblem">
            <div class="emblem-placeholder">🇨🇳</div>
          </div>
          
          <div class="header">
            <h1 class="title">普通高等学校毕业证书</h1>
          </div>
          
          <div class="content-area">
            <div class="photo-section" v-if="data.showPhoto">
              <div class="photo-frame">
                <img v-if="data.photo" :src="data.photo" alt="photo" />
                <div v-else class="photo-placeholder">照片</div>
              </div>
            </div>
            
            <div class="certificate-content">
              <p class="main-text">
                <span class="student-name">{{ data.studentName }}</span>，
                <span v-if="data.gender">{{ data.gender === 'male' ? '男' : '女' }}，</span>
                <span v-if="data.birthDate">{{ formatBirthDate(data.birthDate) }} 出生，</span>
                于<span class="highlight">{{ formatDate(data.enrollmentDate) }}</span>至
                <span class="highlight">{{ formatDate(data.graduationDate) }}</span>
                在<span class="school-name">{{ data.schoolName }}</span>
                <span class="highlight">{{ data.major }}</span>专业
                <span class="highlight">{{ store.getStudyModeText() }}</span>
                <span class="highlight">{{ store.getEducationLevelText() }}</span>学习，
                修完教学计划规定的全部课程，成绩合格，准予毕业。
              </p>
            </div>
          </div>
          
          <div class="certificate-info">
            <div class="info-row">
              <span>证书编号: <strong>{{ data.certificateNumber }}</strong></span>
            </div>
          </div>
          
          <div class="footer-section">
            <div class="school-seal" v-if="data.showSeal">
              <div class="seal-circle">
                <span>{{ data.schoolName }}</span>
              </div>
            </div>
            
            <div class="signature-area">
              <p class="school-label">校 长</p>
              <p class="signature-name">{{ data.presidentName }}</p>
            </div>
            
            <div class="date-area">
              <p>{{ formatDateChinese(data.issueDate) }}</p>
            </div>
          </div>
          
          <div class="registration-info">
            <p>注册号: {{ data.registrationNumber }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 经典模板 -->
    <div v-else-if="data.template === 'classic'" class="template-classic">
      <div class="classic-border">
        <div class="corner top-left"></div>
        <div class="corner top-right"></div>
        <div class="corner bottom-left"></div>
        <div class="corner bottom-right"></div>
        
        <div class="classic-header">
          <div class="logo-area" v-if="data.schoolLogo">
            <img :src="data.schoolLogo" alt="logo" />
          </div>
          <div class="school-title">
            <h1>{{ data.schoolName }}</h1>
            <h2>{{ data.schoolNameEn }}</h2>
          </div>
        </div>
        
        <div class="classic-title">
          <span class="title-cn">毕 业 证 书</span>
          <span class="title-en">DIPLOMA</span>
        </div>
        
        <div class="classic-content">
          <div class="photo-area" v-if="data.showPhoto && data.photo">
            <img :src="data.photo" alt="photo" />
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="label">姓名 Name:</span>
              <span class="value">{{ data.studentName }} ({{ data.studentNameEn }})</span>
            </div>
            <div class="info-item">
              <span class="label">性别 Gender:</span>
              <span class="value">{{ data.gender === 'male' ? '男 Male' : '女 Female' }}</span>
            </div>
            <div class="info-item">
              <span class="label">出生日期 Date of Birth:</span>
              <span class="value">{{ data.birthDate }}</span>
            </div>
            <div class="info-item">
              <span class="label">专业 Major:</span>
              <span class="value">{{ data.major }}</span>
            </div>
            <div class="info-item">
              <span class="label">学历层次 Level:</span>
              <span class="value">{{ store.getEducationLevelText() }}</span>
            </div>
            <div class="info-item">
              <span class="label">学习形式 Mode:</span>
              <span class="value">{{ store.getStudyModeText() }}</span>
            </div>
            <div class="info-item">
              <span class="label">学制 Duration:</span>
              <span class="value">{{ data.studyDuration }}</span>
            </div>
            <div class="info-item">
              <span class="label">毕业日期 Graduation:</span>
              <span class="value">{{ data.graduationDate }}</span>
            </div>
          </div>
        </div>
        
        <div class="classic-statement">
          <p>兹证明上述学生在本校完成规定学业，成绩合格，准予毕业。</p>
          <p class="en">This is to certify that the above-named student has completed the required curriculum and is hereby granted this diploma.</p>
        </div>
        
        <div class="classic-footer">
          <div class="cert-numbers">
            <p>证书编号: {{ data.certificateNumber }}</p>
            <p>注册号: {{ data.registrationNumber }}</p>
          </div>
          <div class="seal-signature">
            <div class="seal" v-if="data.showSeal">
              <span>{{ data.schoolName }}</span>
            </div>
            <div class="signature">
              <p>校长: {{ data.presidentName }}</p>
              <p>{{ data.issueDate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 现代模板 -->
    <div v-else class="template-modern">
      <div class="modern-card">
        <div class="modern-header">
          <div class="brand">
            <div class="logo" v-if="data.schoolLogo">
              <img :src="data.schoolLogo" alt="logo" />
            </div>
            <div class="brand-text">
              <h1>{{ data.schoolName }}</h1>
              <p>{{ data.schoolNameEn }}</p>
            </div>
          </div>
          <div class="diploma-badge">
            <span class="badge-icon">🎓</span>
            <span class="badge-text">DIPLOMA</span>
          </div>
        </div>
        
        <div class="graduate-info">
          <div class="photo-circle" v-if="data.showPhoto && data.photo">
            <img :src="data.photo" alt="photo" />
          </div>
          <div class="info-text">
            <h2 class="graduate-name">{{ data.studentName }}</h2>
            <p class="graduate-name-en">{{ data.studentNameEn }}</p>
            <div class="tags">
              <span class="tag">{{ data.major }}</span>
              <span class="tag">{{ store.getEducationLevelText() }}</span>
              <span class="tag highlight">{{ data.graduationDate }}</span>
            </div>
          </div>
        </div>
        
        <div class="achievement-section">
          <div class="achievement-text">
            <p>兹证明该生已完成本校{{ data.major }}专业{{ store.getEducationLevelText() }}学业，</p>
            <p>修完教学计划规定的全部课程，成绩合格，准予毕业。</p>
          </div>
        </div>
        
        <div class="modern-footer">
          <div class="cert-info">
            <span class="cert-number">No. {{ data.certificateNumber }}</span>
            <span class="reg-number">Reg. {{ data.registrationNumber }}</span>
          </div>
          <div class="issue-info">
            <p class="president">校长: {{ data.presidentName }}</p>
            <p class="date">{{ data.issueDate }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDiplomaStore } from '@/stores/diploma'

const store = useDiplomaStore()
const data = store.data

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

const formatBirthDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const formatDateChinese = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped>
.diploma-preview {
  background: #fff;
  font-family: 'SimSun', 'Songti SC', serif;
}

/* 官方模板 */
.template-official {
  padding: 20px;
}

.template-official .border-frame {
  border: 8px double #8B0000;
  padding: 5px;
}

.diploma-preview.gold .border-frame {
  border-color: #B8860B;
}

.diploma-preview.blue .border-frame {
  border-color: #1a237e;
}

.template-official .inner-border {
  border: 2px solid #8B0000;
  padding: 40px;
  min-height: 500px;
  position: relative;
}

.diploma-preview.gold .inner-border {
  border-color: #B8860B;
}

.diploma-preview.blue .inner-border {
  border-color: #1a237e;
}

.template-official .national-emblem {
  text-align: center;
  margin-bottom: 20px;
}

.template-official .emblem-placeholder {
  font-size: 50px;
}

.template-official .header {
  text-align: center;
  margin-bottom: 30px;
}

.template-official .title {
  font-size: 28px;
  letter-spacing: 8px;
  color: #8B0000;
  margin: 0;
}

.diploma-preview.gold .title {
  color: #B8860B;
}

.diploma-preview.blue .title {
  color: #1a237e;
}

.template-official .content-area {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.template-official .photo-section {
  flex-shrink: 0;
}

.template-official .photo-frame {
  width: 100px;
  height: 130px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.template-official .photo-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-official .photo-placeholder {
  color: #999;
  font-size: 12px;
}

.template-official .certificate-content {
  flex: 1;
}

.template-official .main-text {
  font-size: 16px;
  line-height: 2.5;
  text-indent: 2em;
  text-align: justify;
}

.template-official .student-name {
  font-size: 18px;
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.template-official .school-name {
  font-weight: bold;
}

.template-official .highlight {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.template-official .certificate-info {
  text-align: center;
  margin: 20px 0;
  font-size: 14px;
}

.template-official .footer-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 40px;
}

.template-official .school-seal .seal-circle {
  width: 100px;
  height: 100px;
  border: 3px solid #8B0000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B0000;
  font-size: 12px;
  text-align: center;
  transform: rotate(-15deg);
  padding: 10px;
}

.template-official .signature-area {
  text-align: center;
}

.template-official .school-label {
  font-size: 14px;
  margin: 0;
}

.template-official .signature-name {
  font-size: 18px;
  font-family: 'KaiTi', cursive;
  margin: 10px 0 0;
}

.template-official .date-area {
  text-align: right;
  font-size: 14px;
}

.template-official .registration-info {
  position: absolute;
  bottom: 10px;
  right: 20px;
  font-size: 12px;
  color: #666;
}

/* 经典模板 */
.template-classic {
  padding: 30px;
}

.template-classic .classic-border {
  border: 3px solid #B8860B;
  padding: 40px;
  position: relative;
  background: linear-gradient(to bottom, #fffef5 0%, #fff 100%);
}

.template-classic .corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #B8860B;
}

.template-classic .corner.top-left { top: 10px; left: 10px; border-right: 0; border-bottom: 0; }
.template-classic .corner.top-right { top: 10px; right: 10px; border-left: 0; border-bottom: 0; }
.template-classic .corner.bottom-left { bottom: 10px; left: 10px; border-right: 0; border-top: 0; }
.template-classic .corner.bottom-right { bottom: 10px; right: 10px; border-left: 0; border-top: 0; }

.template-classic .classic-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 25px;
}

.template-classic .logo-area img {
  width: 60px;
  height: 60px;
}

.template-classic .school-title h1 {
  font-size: 28px;
  color: #8B4513;
  margin: 0;
  letter-spacing: 4px;
}

.template-classic .school-title h2 {
  font-size: 14px;
  color: #666;
  margin: 5px 0 0;
  font-family: 'Times New Roman', serif;
}

.template-classic .classic-title {
  text-align: center;
  margin: 25px 0;
  padding: 15px 0;
  border-top: 2px solid #B8860B;
  border-bottom: 2px solid #B8860B;
}

.template-classic .title-cn {
  display: block;
  font-size: 26px;
  letter-spacing: 12px;
  color: #8B4513;
}

.template-classic .title-en {
  display: block;
  font-size: 14px;
  color: #666;
  margin-top: 8px;
  letter-spacing: 6px;
}

.template-classic .classic-content {
  display: flex;
  gap: 25px;
  margin-bottom: 25px;
}

.template-classic .photo-area {
  width: 90px;
  height: 120px;
  border: 1px solid #B8860B;
  overflow: hidden;
  flex-shrink: 0;
}

.template-classic .photo-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-classic .info-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.template-classic .info-item {
  font-size: 12px;
}

.template-classic .info-item .label {
  color: #888;
}

.template-classic .info-item .value {
  font-weight: 500;
  color: #333;
}

.template-classic .classic-statement {
  text-align: center;
  margin: 25px 0;
  padding: 15px;
  background: #f9f7f0;
  border-radius: 4px;
}

.template-classic .classic-statement p {
  margin: 5px 0;
  font-size: 13px;
}

.template-classic .classic-statement .en {
  font-size: 11px;
  color: #666;
  font-family: 'Times New Roman', serif;
}

.template-classic .classic-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.template-classic .cert-numbers {
  font-size: 11px;
  color: #666;
}

.template-classic .seal-signature {
  display: flex;
  gap: 30px;
  align-items: flex-end;
}

.template-classic .seal {
  width: 80px;
  height: 80px;
  border: 2px solid #8B4513;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B4513;
  font-size: 10px;
  text-align: center;
  padding: 5px;
  transform: rotate(-10deg);
}

.template-classic .signature {
  text-align: right;
  font-size: 12px;
}

/* 现代模板 */
.template-modern {
  padding: 20px;
}

.template-modern .modern-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  color: #fff;
  min-height: 450px;
}

.template-modern .modern-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
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

.template-modern .brand-text h1 {
  font-size: 22px;
  margin: 0;
}

.template-modern .brand-text p {
  font-size: 12px;
  margin: 4px 0 0;
  opacity: 0.9;
}

.template-modern .diploma-badge {
  background: rgba(255,255,255,0.2);
  padding: 12px 20px;
  border-radius: 12px;
  text-align: center;
}

.template-modern .badge-icon {
  display: block;
  font-size: 24px;
}

.template-modern .badge-text {
  font-size: 12px;
  letter-spacing: 2px;
}

.template-modern .graduate-info {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: #333;
  margin-bottom: 20px;
}

.template-modern .photo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.template-modern .photo-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-modern .graduate-name {
  font-size: 24px;
  margin: 0;
}

.template-modern .graduate-name-en {
  font-size: 14px;
  color: #666;
  margin: 4px 0 12px;
}

.template-modern .tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.template-modern .tag {
  background: #e8eaf6;
  color: #3949ab;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.template-modern .tag.highlight {
  background: #667eea;
  color: #fff;
}

.template-modern .achievement-section {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.template-modern .achievement-text p {
  margin: 5px 0;
  font-size: 14px;
  text-align: center;
}

.template-modern .modern-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.template-modern .cert-info {
  font-size: 11px;
  opacity: 0.8;
}

.template-modern .cert-number,
.template-modern .reg-number {
  display: block;
  margin: 3px 0;
}

.template-modern .issue-info {
  text-align: right;
  font-size: 12px;
}

.template-modern .president {
  margin: 0;
}

.template-modern .date {
  margin: 4px 0 0;
  opacity: 0.9;
}
</style>
