<template>
  <div class="resume-preview" :class="[store.settings.template, store.settings.fontSize]" :style="cssVars">
    <!-- Modern Template -->
    <template v-if="store.settings.template === 'modern'">
      <div class="modern-resume">
        <div class="sidebar">
          <div v-if="store.settings.showPhoto && store.personalInfo.photo" class="photo-section">
            <img :src="store.personalInfo.photo" alt="Photo" class="profile-photo" />
          </div>
          <div class="contact-section">
            <h3>Contact</h3>
            <div class="contact-item" v-if="store.personalInfo.email">
              <span class="icon" v-if="store.settings.showIcons">✉️</span>
              <span>{{ store.personalInfo.email }}</span>
            </div>
            <div class="contact-item" v-if="store.personalInfo.phone">
              <span class="icon" v-if="store.settings.showIcons">📱</span>
              <span>{{ store.personalInfo.phone }}</span>
            </div>
            <div class="contact-item" v-if="store.personalInfo.location">
              <span class="icon" v-if="store.settings.showIcons">📍</span>
              <span>{{ store.personalInfo.location }}</span>
            </div>
            <div class="contact-item" v-if="store.personalInfo.website">
              <span class="icon" v-if="store.settings.showIcons">🌐</span>
              <span>{{ store.personalInfo.website }}</span>
            </div>
            <div class="contact-item" v-if="store.personalInfo.linkedin">
              <span class="icon" v-if="store.settings.showIcons">💼</span>
              <span>{{ store.personalInfo.linkedin }}</span>
            </div>
            <div class="contact-item" v-if="store.personalInfo.github">
              <span class="icon" v-if="store.settings.showIcons">💻</span>
              <span>{{ store.personalInfo.github }}</span>
            </div>
          </div>
          <div v-if="store.skills.length > 0" class="skills-section">
            <h3>Skills</h3>
            <div v-for="(skills, category) in store.skillsByCategory" :key="category" class="skill-category">
              <h4>{{ category }}</h4>
              <div v-for="skill in skills" :key="skill.id" class="skill-item">
                <span class="skill-name">{{ skill.name }}</span>
                <div class="skill-bar">
                  <div class="skill-fill" :style="{ width: `${skill.level * 20}%` }"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="store.languages.length > 0" class="languages-section">
            <h3>Languages</h3>
            <div v-for="lang in store.languages" :key="lang.id" class="language-item">
              <span class="lang-name">{{ lang.name }}</span>
              <span class="lang-level">{{ lang.level }}</span>
            </div>
          </div>
        </div>
        <div class="main-content">
          <div class="header-section">
            <h1>{{ store.personalInfo.fullName }}</h1>
            <h2>{{ store.personalInfo.title }}</h2>
          </div>
          <div v-if="store.personalInfo.summary" class="summary-section">
            <h3>Professional Summary</h3>
            <p>{{ store.personalInfo.summary }}</p>
          </div>
          <div v-if="store.experience.length > 0" class="experience-section">
            <h3>Experience</h3>
            <div v-for="exp in store.experience" :key="exp.id" class="experience-item">
              <div class="exp-header">
                <div class="exp-title">
                  <h4>{{ exp.position }}</h4>
                  <span class="company">{{ exp.company }}{{ exp.location ? `, ${exp.location}` : '' }}</span>
                </div>
                <span class="exp-date">{{ formatDate(exp.startDate) }} - {{ exp.current ? 'Present' : formatDate(exp.endDate) }}</span>
              </div>
              <p v-if="exp.description" class="exp-desc">{{ exp.description }}</p>
              <ul v-if="exp.achievements.length > 0" class="achievements">
                <li v-for="(ach, index) in exp.achievements.filter(a => a)" :key="index">{{ ach }}</li>
              </ul>
            </div>
          </div>
          <div v-if="store.education.length > 0" class="education-section">
            <h3>Education</h3>
            <div v-for="edu in store.education" :key="edu.id" class="education-item">
              <div class="edu-header">
                <div class="edu-title">
                  <h4>{{ edu.degree }} in {{ edu.field }}</h4>
                  <span class="school">{{ edu.school }}</span>
                </div>
                <span class="edu-date">{{ formatDate(edu.startDate) }} - {{ formatDate(edu.endDate) }}</span>
              </div>
              <p v-if="edu.gpa" class="gpa">GPA: {{ edu.gpa }}</p>
              <p v-if="edu.description" class="edu-desc">{{ edu.description }}</p>
            </div>
          </div>
          <div v-if="store.projects.length > 0" class="projects-section">
            <h3>Projects</h3>
            <div v-for="project in store.projects" :key="project.id" class="project-item">
              <div class="project-header">
                <h4>{{ project.name }}</h4>
                <span class="project-date">{{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}</span>
              </div>
              <p>{{ project.description }}</p>
              <div v-if="project.technologies.length > 0" class="tech-tags">
                <span v-for="tech in project.technologies" :key="tech" class="tech-tag">{{ tech }}</span>
              </div>
              <a v-if="project.link" :href="project.link" class="project-link">{{ project.link }}</a>
            </div>
          </div>
          <div v-if="store.certificates.length > 0" class="certificates-section">
            <h3>Certifications</h3>
            <div v-for="cert in store.certificates" :key="cert.id" class="cert-item">
              <span class="cert-name">{{ cert.name }}</span>
              <span class="cert-issuer">{{ cert.issuer }} · {{ formatDate(cert.date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Classic Template -->
    <template v-else-if="store.settings.template === 'classic'">
      <div class="classic-resume">
        <div class="classic-header">
          <div class="name-section">
            <h1>{{ store.personalInfo.fullName }}</h1>
            <h2>{{ store.personalInfo.title }}</h2>
          </div>
          <div class="contact-row">
            <span v-if="store.personalInfo.email">{{ store.personalInfo.email }}</span>
            <span v-if="store.personalInfo.phone">{{ store.personalInfo.phone }}</span>
            <span v-if="store.personalInfo.location">{{ store.personalInfo.location }}</span>
            <span v-if="store.personalInfo.linkedin">{{ store.personalInfo.linkedin }}</span>
          </div>
        </div>
        <div class="classic-body">
          <section v-if="store.personalInfo.summary" class="section">
            <h3>Professional Summary</h3>
            <div class="section-content">
              <p>{{ store.personalInfo.summary }}</p>
            </div>
          </section>
          <section v-if="store.experience.length > 0" class="section">
            <h3>Professional Experience</h3>
            <div class="section-content">
              <div v-for="exp in store.experience" :key="exp.id" class="classic-exp">
                <div class="classic-exp-header">
                  <div>
                    <strong>{{ exp.position }}</strong>
                    <span class="company-name">{{ exp.company }}, {{ exp.location }}</span>
                  </div>
                  <span class="date">{{ formatDate(exp.startDate) }} – {{ exp.current ? 'Present' : formatDate(exp.endDate) }}</span>
                </div>
                <ul>
                  <li v-for="(ach, index) in exp.achievements.filter(a => a)" :key="index">{{ ach }}</li>
                </ul>
              </div>
            </div>
          </section>
          <section v-if="store.education.length > 0" class="section">
            <h3>Education</h3>
            <div class="section-content">
              <div v-for="edu in store.education" :key="edu.id" class="classic-edu">
                <div class="classic-edu-header">
                  <div>
                    <strong>{{ edu.school }}</strong>
                    <span>{{ edu.degree }} in {{ edu.field }}</span>
                  </div>
                  <span class="date">{{ formatDate(edu.endDate) }}</span>
                </div>
                <p v-if="edu.gpa">GPA: {{ edu.gpa }}</p>
              </div>
            </div>
          </section>
          <section v-if="store.skills.length > 0" class="section">
            <h3>Skills</h3>
            <div class="section-content">
              <div v-for="(skills, category) in store.skillsByCategory" :key="category" class="skills-row">
                <strong>{{ category }}:</strong>
                <span>{{ skills.map(s => s.name).join(', ') }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>

    <!-- Minimal Template -->
    <template v-else-if="store.settings.template === 'minimal'">
      <div class="minimal-resume">
        <header>
          <h1>{{ store.personalInfo.fullName }}</h1>
          <p class="title">{{ store.personalInfo.title }}</p>
          <p class="contact">
            {{ [store.personalInfo.email, store.personalInfo.phone, store.personalInfo.location].filter(Boolean).join(' | ') }}
          </p>
        </header>
        <section v-if="store.personalInfo.summary">
          <p class="summary">{{ store.personalInfo.summary }}</p>
        </section>
        <section v-if="store.experience.length > 0">
          <h2>Experience</h2>
          <div v-for="exp in store.experience" :key="exp.id" class="minimal-item">
            <div class="minimal-header">
              <strong>{{ exp.position }}</strong> at {{ exp.company }}
              <span>{{ formatDate(exp.startDate) }} - {{ exp.current ? 'Present' : formatDate(exp.endDate) }}</span>
            </div>
            <ul>
              <li v-for="(ach, index) in exp.achievements.filter(a => a)" :key="index">{{ ach }}</li>
            </ul>
          </div>
        </section>
        <section v-if="store.education.length > 0">
          <h2>Education</h2>
          <div v-for="edu in store.education" :key="edu.id" class="minimal-item">
            <div class="minimal-header">
              <strong>{{ edu.degree }}</strong> in {{ edu.field }}, {{ edu.school }}
              <span>{{ formatDate(edu.endDate) }}</span>
            </div>
          </div>
        </section>
        <section v-if="store.skills.length > 0">
          <h2>Skills</h2>
          <p class="skills-line">{{ store.skills.map(s => s.name).join(' • ') }}</p>
        </section>
      </div>
    </template>

    <!-- Creative Template -->
    <template v-else-if="store.settings.template === 'creative'">
      <div class="creative-resume">
        <div class="creative-header">
          <div v-if="store.settings.showPhoto && store.personalInfo.photo" class="creative-photo">
            <img :src="store.personalInfo.photo" alt="Photo" />
          </div>
          <div class="creative-intro">
            <h1>{{ store.personalInfo.fullName }}</h1>
            <p class="tagline">{{ store.personalInfo.title }}</p>
            <p class="summary">{{ store.personalInfo.summary }}</p>
          </div>
        </div>
        <div class="creative-body">
          <div class="creative-main">
            <section v-if="store.experience.length > 0">
              <h2>💼 Experience</h2>
              <div v-for="exp in store.experience" :key="exp.id" class="creative-exp">
                <div class="timeline-dot"></div>
                <div class="exp-content">
                  <h3>{{ exp.position }}</h3>
                  <p class="meta">{{ exp.company }} | {{ formatDate(exp.startDate) }} - {{ exp.current ? 'Present' : formatDate(exp.endDate) }}</p>
                  <ul>
                    <li v-for="(ach, index) in exp.achievements.filter(a => a)" :key="index">{{ ach }}</li>
                  </ul>
                </div>
              </div>
            </section>
            <section v-if="store.projects.length > 0">
              <h2>🚀 Projects</h2>
              <div v-for="project in store.projects" :key="project.id" class="creative-project">
                <h3>{{ project.name }}</h3>
                <p>{{ project.description }}</p>
                <div class="tags">
                  <span v-for="tech in project.technologies" :key="tech">{{ tech }}</span>
                </div>
              </div>
            </section>
          </div>
          <div class="creative-sidebar">
            <section>
              <h2>📧 Contact</h2>
              <p v-if="store.personalInfo.email">{{ store.personalInfo.email }}</p>
              <p v-if="store.personalInfo.phone">{{ store.personalInfo.phone }}</p>
              <p v-if="store.personalInfo.location">{{ store.personalInfo.location }}</p>
              <p v-if="store.personalInfo.linkedin">{{ store.personalInfo.linkedin }}</p>
            </section>
            <section v-if="store.skills.length > 0">
              <h2>⚡ Skills</h2>
              <div class="creative-skills">
                <span v-for="skill in store.skills" :key="skill.id" class="skill-bubble">{{ skill.name }}</span>
              </div>
            </section>
            <section v-if="store.education.length > 0">
              <h2>🎓 Education</h2>
              <div v-for="edu in store.education" :key="edu.id" class="creative-edu">
                <h4>{{ edu.degree }}</h4>
                <p>{{ edu.school }}</p>
                <p class="year">{{ formatDate(edu.endDate) }}</p>
              </div>
            </section>
            <section v-if="store.languages.length > 0">
              <h2>🌍 Languages</h2>
              <div v-for="lang in store.languages" :key="lang.id" class="lang-item">
                {{ lang.name }} - {{ lang.level }}
              </div>
            </section>
          </div>
        </div>
      </div>
    </template>

    <!-- Executive Template -->
    <template v-else>
      <div class="executive-resume">
        <header class="exec-header">
          <h1>{{ store.personalInfo.fullName }}</h1>
          <h2>{{ store.personalInfo.title }}</h2>
          <div class="exec-contact">
            <span v-if="store.personalInfo.email">{{ store.personalInfo.email }}</span>
            <span v-if="store.personalInfo.phone">{{ store.personalInfo.phone }}</span>
            <span v-if="store.personalInfo.location">{{ store.personalInfo.location }}</span>
          </div>
        </header>
        <div class="exec-body">
          <section v-if="store.personalInfo.summary" class="exec-section">
            <h3>Executive Summary</h3>
            <p>{{ store.personalInfo.summary }}</p>
          </section>
          <section v-if="store.experience.length > 0" class="exec-section">
            <h3>Professional Experience</h3>
            <div v-for="exp in store.experience" :key="exp.id" class="exec-exp">
              <div class="exec-exp-header">
                <h4>{{ exp.position }}</h4>
                <span class="company">{{ exp.company }}</span>
                <span class="date">{{ formatDate(exp.startDate) }} - {{ exp.current ? 'Present' : formatDate(exp.endDate) }}</span>
              </div>
              <ul>
                <li v-for="(ach, index) in exp.achievements.filter(a => a)" :key="index">{{ ach }}</li>
              </ul>
            </div>
          </section>
          <div class="exec-columns">
            <section v-if="store.education.length > 0" class="exec-section">
              <h3>Education</h3>
              <div v-for="edu in store.education" :key="edu.id" class="exec-edu">
                <strong>{{ edu.degree }}</strong>
                <p>{{ edu.school }}</p>
                <p class="year">{{ formatDate(edu.endDate) }}</p>
              </div>
            </section>
            <section v-if="store.skills.length > 0" class="exec-section">
              <h3>Core Competencies</h3>
              <div class="exec-skills">
                <span v-for="skill in store.skills" :key="skill.id">{{ skill.name }}</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'

const store = useResumeStore()

const cssVars = computed(() => ({
  '--primary-color': store.settings.primaryColor,
  '--secondary-color': store.settings.secondaryColor
}))

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month) - 1]} ${year}`
}
</script>

<style scoped>
.resume-preview {
  width: 210mm;
  min-height: 297mm;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  font-family: 'Inter', sans-serif;
}

.resume-preview.small { font-size: 11px; }
.resume-preview.medium { font-size: 12px; }
.resume-preview.large { font-size: 13px; }

/* Modern Template */
.modern-resume {
  display: flex;
  min-height: 297mm;
}

.sidebar {
  width: 75mm;
  background: var(--primary-color);
  color: white;
  padding: 30px 20px;
}

.profile-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255,255,255,0.3);
  margin-bottom: 24px;
}

.sidebar h3 {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(255,255,255,0.3);
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 11px;
  word-break: break-word;
}

.contact-item .icon {
  flex-shrink: 0;
}

.skills-section, .languages-section {
  margin-top: 24px;
}

.skill-category h4 {
  font-size: 11px;
  margin: 12px 0 8px 0;
  opacity: 0.9;
}

.skill-item {
  margin-bottom: 8px;
}

.skill-name {
  font-size: 11px;
  display: block;
  margin-bottom: 4px;
}

.skill-bar {
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
}

.skill-fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.3s;
}

.language-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 6px;
}

.main-content {
  flex: 1;
  padding: 30px;
}

.header-section h1 {
  font-size: 28px;
  color: var(--primary-color);
  margin: 0 0 4px 0;
}

.header-section h2 {
  font-size: 16px;
  font-weight: 400;
  color: #6b7280;
  margin: 0;
}

.main-content h3 {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--primary-color);
  margin: 24px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-color);
}

.summary-section p {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.experience-item, .education-item, .project-item {
  margin-bottom: 16px;
}

.exp-header, .edu-header, .project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.exp-title h4, .edu-title h4, .project-header h4 {
  font-size: 14px;
  margin: 0;
  color: #1f2937;
}

.company, .school {
  font-size: 12px;
  color: #6b7280;
}

.exp-date, .edu-date, .project-date {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}

.exp-desc, .edu-desc, .gpa {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0;
}

.achievements {
  margin: 8px 0 0 0;
  padding-left: 18px;
}

.achievements li {
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 4px;
  line-height: 1.5;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tech-tag {
  padding: 2px 8px;
  background: #e0e7ff;
  color: var(--primary-color);
  font-size: 10px;
  border-radius: 4px;
}

.project-link {
  font-size: 11px;
  color: var(--primary-color);
  text-decoration: none;
}

.cert-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.cert-name {
  font-size: 12px;
  color: #1f2937;
}

.cert-issuer {
  font-size: 11px;
  color: #6b7280;
}

/* Classic Template */
.classic-resume {
  padding: 40px;
}

.classic-header {
  text-align: center;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 20px;
  margin-bottom: 24px;
}

.classic-header h1 {
  font-size: 32px;
  color: var(--primary-color);
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.classic-header h2 {
  font-size: 16px;
  font-weight: 400;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.contact-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #4b5563;
}

.classic-body .section {
  margin-bottom: 20px;
}

.classic-body h3 {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--primary-color);
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 6px;
  margin: 0 0 12px 0;
}

.classic-exp, .classic-edu {
  margin-bottom: 16px;
}

.classic-exp-header, .classic-edu-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.company-name {
  color: #6b7280;
  margin-left: 8px;
}

.date {
  color: #9ca3af;
  font-size: 11px;
}

.classic-body ul {
  margin: 0;
  padding-left: 18px;
}

.classic-body li {
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 4px;
  line-height: 1.5;
}

.skills-row {
  margin-bottom: 8px;
  font-size: 12px;
}

.skills-row strong {
  color: var(--primary-color);
}

/* Minimal Template */
.minimal-resume {
  padding: 50px;
}

.minimal-resume header {
  margin-bottom: 30px;
}

.minimal-resume h1 {
  font-size: 36px;
  font-weight: 300;
  margin: 0;
  color: #1f2937;
}

.minimal-resume .title {
  font-size: 16px;
  color: var(--primary-color);
  margin: 4px 0;
}

.minimal-resume .contact {
  font-size: 12px;
  color: #6b7280;
  margin: 8px 0 0 0;
}

.minimal-resume .summary {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
}

.minimal-resume section {
  margin-bottom: 24px;
}

.minimal-resume h2 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--primary-color);
  margin: 0 0 12px 0;
}

.minimal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.minimal-resume ul {
  margin: 4px 0 0 0;
  padding-left: 16px;
}

.minimal-resume li {
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 2px;
}

.skills-line {
  font-size: 12px;
  color: #4b5563;
  margin: 0;
}

/* Creative Template */
.creative-resume {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  min-height: 297mm;
}

.creative-header {
  display: flex;
  gap: 24px;
  padding: 40px;
  color: white;
}

.creative-photo img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255,255,255,0.5);
}

.creative-intro h1 {
  font-size: 36px;
  margin: 0;
}

.creative-intro .tagline {
  font-size: 18px;
  opacity: 0.9;
  margin: 4px 0 16px 0;
}

.creative-intro .summary {
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.85;
  margin: 0;
}

.creative-body {
  display: flex;
  background: white;
  margin: 0 20px 20px 20px;
  border-radius: 16px;
  overflow: hidden;
}

.creative-main {
  flex: 2;
  padding: 30px;
}

.creative-main h2 {
  font-size: 16px;
  color: var(--primary-color);
  margin: 0 0 16px 0;
}

.creative-exp {
  position: relative;
  padding-left: 24px;
  margin-bottom: 20px;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 6px;
  width: 10px;
  height: 10px;
  background: var(--primary-color);
  border-radius: 50%;
}

.creative-exp h3 {
  font-size: 14px;
  margin: 0;
  color: #1f2937;
}

.creative-exp .meta {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 8px 0;
}

.creative-exp ul {
  margin: 0;
  padding-left: 16px;
}

.creative-exp li {
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 4px;
}

.creative-project {
  margin-bottom: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.creative-project h3 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.creative-project p {
  font-size: 12px;
  color: #4b5563;
  margin: 0 0 8px 0;
}

.creative-project .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.creative-project .tags span {
  padding: 2px 8px;
  background: var(--primary-color);
  color: white;
  font-size: 10px;
  border-radius: 20px;
}

.creative-sidebar {
  flex: 1;
  background: #f9fafb;
  padding: 30px;
}

.creative-sidebar section {
  margin-bottom: 24px;
}

.creative-sidebar h2 {
  font-size: 14px;
  color: var(--primary-color);
  margin: 0 0 12px 0;
}

.creative-sidebar p {
  font-size: 12px;
  color: #4b5563;
  margin: 4px 0;
}

.creative-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-bubble {
  padding: 4px 10px;
  background: white;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  font-size: 11px;
  border-radius: 20px;
}

.creative-edu h4 {
  font-size: 13px;
  margin: 0;
  color: #1f2937;
}

.creative-edu p {
  margin: 2px 0;
}

.creative-edu .year {
  color: #9ca3af;
  font-size: 11px;
}

.lang-item {
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 4px;
}

/* Executive Template */
.executive-resume {
  background: white;
}

.exec-header {
  background: var(--primary-color);
  color: white;
  padding: 50px 40px;
  text-align: center;
}

.exec-header h1 {
  font-size: 36px;
  margin: 0;
  font-weight: 300;
  letter-spacing: 2px;
}

.exec-header h2 {
  font-size: 16px;
  font-weight: 400;
  margin: 8px 0 20px 0;
  opacity: 0.9;
}

.exec-contact {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 12px;
  opacity: 0.85;
}

.exec-body {
  padding: 40px;
}

.exec-section {
  margin-bottom: 28px;
}

.exec-section h3 {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--primary-color);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-color);
}

.exec-section > p {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
}

.exec-exp {
  margin-bottom: 20px;
}

.exec-exp-header h4 {
  font-size: 15px;
  margin: 0;
  color: #1f2937;
}

.exec-exp-header .company {
  font-size: 13px;
  color: #6b7280;
  margin-left: 8px;
}

.exec-exp-header .date {
  font-size: 12px;
  color: #9ca3af;
  float: right;
}

.exec-exp ul {
  margin: 12px 0 0 0;
  padding-left: 20px;
}

.exec-exp li {
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 6px;
  line-height: 1.6;
}

.exec-columns {
  display: flex;
  gap: 40px;
}

.exec-columns .exec-section {
  flex: 1;
}

.exec-edu {
  margin-bottom: 12px;
}

.exec-edu strong {
  font-size: 13px;
  color: #1f2937;
}

.exec-edu p {
  font-size: 12px;
  color: #6b7280;
  margin: 2px 0;
}

.exec-edu .year {
  color: #9ca3af;
}

.exec-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.exec-skills span {
  padding: 6px 12px;
  background: #f3f4f6;
  color: #374151;
  font-size: 11px;
  border-radius: 4px;
}
</style>
