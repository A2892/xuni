<template>
  <div class="resume-view">
    <div class="view-content">
      <!-- 左侧：编辑面板 -->
      <div class="edit-panel">
        <div class="panel-header">
          <h2>📝 简历生成器</h2>
          <p>创建专业的个人简历</p>
        </div>
        
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="['tab', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 个人信息 -->
          <div v-show="activeTab === '个人信息'" class="form-section">
            <div class="form-group">
              <label>照片</label>
              <input type="file" accept="image/*" @change="handlePhotoUpload" />
              <div v-if="store.personalInfo.photo" class="photo-preview">
                <img :src="store.personalInfo.photo" alt="Photo" />
                <button @click="store.personalInfo.photo = ''" class="btn-remove">删除</button>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>姓名</label>
                <input v-model="store.personalInfo.fullName" type="text" placeholder="John Smith" />
              </div>
              <div class="form-group">
                <label>职位</label>
                <input v-model="store.personalInfo.title" type="text" placeholder="Software Engineer" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>邮箱</label>
                <input v-model="store.personalInfo.email" type="email" placeholder="email@example.com" />
              </div>
              <div class="form-group">
                <label>电话</label>
                <input v-model="store.personalInfo.phone" type="tel" placeholder="+1 (555) 123-4567" />
              </div>
            </div>
            <div class="form-group">
              <label>地址</label>
              <input v-model="store.personalInfo.location" type="text" placeholder="City, State" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>个人网站</label>
                <input v-model="store.personalInfo.website" type="text" placeholder="www.yoursite.com" />
              </div>
              <div class="form-group">
                <label>LinkedIn</label>
                <input v-model="store.personalInfo.linkedin" type="text" placeholder="linkedin.com/in/username" />
              </div>
            </div>
            <div class="form-group">
              <label>GitHub</label>
              <input v-model="store.personalInfo.github" type="text" placeholder="github.com/username" />
            </div>
            <div class="form-group">
              <label>个人简介</label>
              <textarea v-model="store.personalInfo.summary" rows="4" placeholder="简要描述您的专业背景和技能..."></textarea>
            </div>
          </div>

          <!-- 工作经历 -->
          <div v-show="activeTab === '工作经历'" class="form-section">
            <div v-for="(exp, index) in store.experience" :key="exp.id" class="item-card">
              <div class="item-header">
                <h4>经历 {{ index + 1 }}</h4>
                <button @click="store.removeExperience(exp.id)" class="btn-remove-item">删除</button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>公司名称</label>
                  <input v-model="exp.company" type="text" placeholder="Company Name" />
                </div>
                <div class="form-group">
                  <label>职位</label>
                  <input v-model="exp.position" type="text" placeholder="Job Title" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>地点</label>
                  <input v-model="exp.location" type="text" placeholder="City, State" />
                </div>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="exp.current" /> 目前在职
                  </label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>开始日期</label>
                  <input v-model="exp.startDate" type="month" />
                </div>
                <div class="form-group">
                  <label>结束日期</label>
                  <input v-model="exp.endDate" type="month" :disabled="exp.current" />
                </div>
              </div>
              <div class="form-group">
                <label>工作描述</label>
                <textarea v-model="exp.description" rows="2" placeholder="描述您的职责..."></textarea>
              </div>
              <div class="form-group">
                <label>主要成就</label>
                <div v-for="(ach, achIndex) in exp.achievements" :key="achIndex" class="achievement-input">
                  <input v-model="exp.achievements[achIndex]" type="text" placeholder="描述一项成就..." />
                  <button @click="exp.achievements.splice(achIndex, 1)" class="btn-remove-small">×</button>
                </div>
                <button @click="exp.achievements.push('')" class="btn-add-small">+ 添加成就</button>
              </div>
            </div>
            <button @click="store.addExperience" class="btn-add-item">+ 添加工作经历</button>
          </div>

          <!-- 教育背景 -->
          <div v-show="activeTab === '教育背景'" class="form-section">
            <div v-for="(edu, index) in store.education" :key="edu.id" class="item-card">
              <div class="item-header">
                <h4>教育 {{ index + 1 }}</h4>
                <button @click="store.removeEducation(edu.id)" class="btn-remove-item">删除</button>
              </div>
              <div class="form-group">
                <label>学校名称</label>
                <input v-model="edu.school" type="text" placeholder="University Name" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>学位</label>
                  <select v-model="edu.degree">
                    <option value="">选择学位</option>
                    <option value="High School Diploma">高中文凭</option>
                    <option value="Associate Degree">副学士</option>
                    <option value="Bachelor of Arts">文学学士 (BA)</option>
                    <option value="Bachelor of Science">理学学士 (BS)</option>
                    <option value="Master of Arts">文学硕士 (MA)</option>
                    <option value="Master of Science">理学硕士 (MS)</option>
                    <option value="Master of Business Administration">工商管理硕士 (MBA)</option>
                    <option value="Doctor of Philosophy">哲学博士 (PhD)</option>
                    <option value="Doctor of Medicine">医学博士 (MD)</option>
                    <option value="Juris Doctor">法学博士 (JD)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>专业</label>
                  <input v-model="edu.field" type="text" placeholder="Computer Science" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>开始日期</label>
                  <input v-model="edu.startDate" type="month" />
                </div>
                <div class="form-group">
                  <label>结束日期</label>
                  <input v-model="edu.endDate" type="month" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>GPA</label>
                  <input v-model="edu.gpa" type="text" placeholder="3.8/4.0" />
                </div>
              </div>
              <div class="form-group">
                <label>备注</label>
                <textarea v-model="edu.description" rows="2" placeholder="相关课程、荣誉等..."></textarea>
              </div>
            </div>
            <button @click="store.addEducation" class="btn-add-item">+ 添加教育经历</button>
          </div>

          <!-- 技能 -->
          <div v-show="activeTab === '技能'" class="form-section">
            <div class="skills-grid">
              <div v-for="skill in store.skills" :key="skill.id" class="skill-item">
                <div class="skill-header">
                  <input v-model="skill.name" type="text" placeholder="技能名称" class="skill-name-input" />
                  <button @click="store.removeSkill(skill.id)" class="btn-remove-small">×</button>
                </div>
                <div class="skill-details">
                  <select v-model="skill.category" class="skill-category">
                    <option value="Programming">编程语言</option>
                    <option value="Frontend">前端开发</option>
                    <option value="Backend">后端开发</option>
                    <option value="Database">数据库</option>
                    <option value="Cloud">云服务</option>
                    <option value="DevOps">DevOps</option>
                    <option value="API">API</option>
                    <option value="Design">设计</option>
                    <option value="Management">管理</option>
                    <option value="Other">其他</option>
                  </select>
                  <div class="skill-level">
                    <span>熟练度:</span>
                    <div class="level-stars">
                      <button 
                        v-for="level in 5" 
                        :key="level"
                        :class="['star', { active: skill.level >= level }]"
                        @click="skill.level = level"
                      >★</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button @click="store.addSkill" class="btn-add-item">+ 添加技能</button>
          </div>

          <!-- 项目 -->
          <div v-show="activeTab === '项目'" class="form-section">
            <div v-for="(project, index) in store.projects" :key="project.id" class="item-card">
              <div class="item-header">
                <h4>项目 {{ index + 1 }}</h4>
                <button @click="store.removeProject(project.id)" class="btn-remove-item">删除</button>
              </div>
              <div class="form-group">
                <label>项目名称</label>
                <input v-model="project.name" type="text" placeholder="Project Name" />
              </div>
              <div class="form-group">
                <label>项目描述</label>
                <textarea v-model="project.description" rows="3" placeholder="描述项目内容和您的贡献..."></textarea>
              </div>
              <div class="form-group">
                <label>技术栈 (用逗号分隔)</label>
                <input 
                  :value="project.technologies.join(', ')" 
                  @input="project.technologies = ($event.target as HTMLInputElement).value.split(',').map(t => t.trim())"
                  type="text" 
                  placeholder="React, Node.js, PostgreSQL" 
                />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>项目链接</label>
                  <input v-model="project.link" type="text" placeholder="github.com/..." />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>开始日期</label>
                  <input v-model="project.startDate" type="month" />
                </div>
                <div class="form-group">
                  <label>结束日期</label>
                  <input v-model="project.endDate" type="month" />
                </div>
              </div>
            </div>
            <button @click="store.addProject" class="btn-add-item">+ 添加项目</button>
          </div>

          <!-- 证书 & 语言 -->
          <div v-show="activeTab === '证书'" class="form-section">
            <h4>专业证书</h4>
            <div v-for="cert in store.certificates" :key="cert.id" class="mini-item">
              <div class="form-row">
                <div class="form-group flex-2">
                  <input v-model="cert.name" type="text" placeholder="证书名称" />
                </div>
                <div class="form-group flex-1">
                  <input v-model="cert.issuer" type="text" placeholder="颁发机构" />
                </div>
                <div class="form-group flex-1">
                  <input v-model="cert.date" type="month" />
                </div>
                <button @click="store.removeCertificate(cert.id)" class="btn-remove-small">×</button>
              </div>
            </div>
            <button @click="store.addCertificate" class="btn-add-small">+ 添加证书</button>

            <h4 style="margin-top: 24px;">语言能力</h4>
            <div v-for="lang in store.languages" :key="lang.id" class="mini-item">
              <div class="form-row">
                <div class="form-group flex-1">
                  <input v-model="lang.name" type="text" placeholder="语言" />
                </div>
                <div class="form-group flex-1">
                  <select v-model="lang.level">
                    <option value="Native">母语</option>
                    <option value="Fluent">流利</option>
                    <option value="Advanced">高级</option>
                    <option value="Intermediate">中级</option>
                    <option value="Basic">基础</option>
                  </select>
                </div>
                <button @click="store.removeLanguage(lang.id)" class="btn-remove-small">×</button>
              </div>
            </div>
            <button @click="store.addLanguage" class="btn-add-small">+ 添加语言</button>
          </div>

          <!-- 设置 -->
          <div v-show="activeTab === '设置'" class="form-section">
            <h4>模板选择</h4>
            <div class="template-grid">
              <div 
                v-for="template in templates"
                :key="template.id"
                :class="['template-card', { active: store.settings.template === template.id }]"
                @click="store.settings.template = template.id"
              >
                <div class="template-preview" :style="{ background: template.color }">
                  <span>{{ template.name }}</span>
                </div>
                <p>{{ template.description }}</p>
              </div>
            </div>

            <h4 style="margin-top: 24px;">颜色设置</h4>
            <div class="form-row">
              <div class="form-group">
                <label>主题色</label>
                <div class="color-input-wrapper">
                  <input v-model="store.settings.primaryColor" type="color" />
                  <input v-model="store.settings.primaryColor" type="text" />
                </div>
              </div>
              <div class="form-group">
                <label>副色</label>
                <div class="color-input-wrapper">
                  <input v-model="store.settings.secondaryColor" type="color" />
                  <input v-model="store.settings.secondaryColor" type="text" />
                </div>
              </div>
            </div>

            <h4 style="margin-top: 24px;">显示选项</h4>
            <div class="options-grid">
              <label class="checkbox-option">
                <input type="checkbox" v-model="store.settings.showPhoto" />
                <span>显示照片</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="store.settings.showIcons" />
                <span>显示图标</span>
              </label>
            </div>

            <h4 style="margin-top: 24px;">字体大小</h4>
            <div class="font-size-options">
              <label :class="['size-option', { active: store.settings.fontSize === 'small' }]">
                <input type="radio" v-model="store.settings.fontSize" value="small" />
                <span>小</span>
              </label>
              <label :class="['size-option', { active: store.settings.fontSize === 'medium' }]">
                <input type="radio" v-model="store.settings.fontSize" value="medium" />
                <span>中</span>
              </label>
              <label :class="['size-option', { active: store.settings.fontSize === 'large' }]">
                <input type="radio" v-model="store.settings.fontSize" value="large" />
                <span>大</span>
              </label>
            </div>
          </div>

          <!-- 数据管理 -->
          <div v-show="activeTab === '数据管理'" class="form-section">
            <SaveLoadPanel 
              document-type="resume"
              :get-data="() => store.$state"
              :set-data="(data: any) => store.$patch(data)"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：预览 -->
      <div class="preview-panel">
        <div class="preview-toolbar">
          <span>简历预览</span>
          <div class="toolbar-actions">
            <button @click="downloadResume" class="btn-download" :disabled="isExporting">
              {{ isExporting ? '生成中...' : '下载 PDF' }}
            </button>
          </div>
        </div>
        <div class="preview-container">
          <ResumePreview ref="previewRef" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResumeStore } from '@/stores/resume'
import ResumePreview from '@/components/ResumePreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useResumeStore()
const activeTab = ref('个人信息')
const tabs = ['个人信息', '工作经历', '教育背景', '技能', '项目', '证书', '设置', '数据管理']
const previewRef = ref()
const isExporting = ref(false)

const templates = [
  { id: 'modern', name: 'Modern', description: '现代简洁风格', color: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'classic', name: 'Classic', description: '传统专业风格', color: 'linear-gradient(135deg, #1a365d, #2c5282)' },
  { id: 'minimal', name: 'Minimal', description: '极简清爽风格', color: 'linear-gradient(135deg, #718096, #4a5568)' },
  { id: 'creative', name: 'Creative', description: '创意设计风格', color: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'executive', name: 'Executive', description: '高管商务风格', color: 'linear-gradient(135deg, #232526, #414345)' }
]

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.personalInfo.photo = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const downloadResume = async () => {
  if (!previewRef.value?.$el) return
  
  isExporting.value = true
  try {
    const element = previewRef.value.$el
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 0
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save(`${store.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`)
  } catch (error) {
    console.error('Export failed:', error)
    alert('导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
.resume-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-content {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  overflow: hidden;
}

.edit-panel {
  width: 420px;
  min-width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #1f2937;
}

.panel-header p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
}

.tab {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab:hover {
  background: #e5e7eb;
  color: #374151;
}

.tab.active {
  background: #2563eb;
  color: white;
}

.tab-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.form-row .flex-1 {
  flex: 1;
}

.form-row .flex-2 {
  flex: 2;
}

.photo-preview {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.photo-preview img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.item-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.item-header h4 {
  margin: 0;
  font-size: 14px;
  color: #374151;
}

.btn-remove-item {
  padding: 4px 12px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-remove-item:hover {
  background: #fecaca;
}

.btn-add-item {
  width: 100%;
  padding: 12px;
  border: 2px dashed #d1d5db;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-item:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

.achievement-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.achievement-input input {
  flex: 1;
}

.btn-remove-small,
.btn-add-small {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove-small {
  background: #fee2e2;
  color: #dc2626;
}

.btn-add-small {
  background: #e0e7ff;
  color: #4338ca;
}

.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
}

.skill-header {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.skill-name-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.skill-details {
  display: flex;
  gap: 12px;
  align-items: center;
}

.skill-category {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
}

.skill-level {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.level-stars {
  display: flex;
  gap: 2px;
}

.star {
  background: none;
  border: none;
  font-size: 16px;
  color: #d1d5db;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.star.active {
  color: #f59e0b;
}

.mini-item {
  margin-bottom: 12px;
}

.mini-item .form-row {
  align-items: center;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.template-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #2563eb;
}

.template-card.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.template-preview {
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.template-card p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.color-input-wrapper {
  display: flex;
  gap: 8px;
}

.color-input-wrapper input[type="color"] {
  width: 40px;
  height: 40px;
  padding: 2px;
  border-radius: 8px;
  cursor: pointer;
}

.color-input-wrapper input[type="text"] {
  flex: 1;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  margin-top: 24px;
}

.font-size-options {
  display: flex;
  gap: 8px;
}

.size-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.size-option:hover {
  border-color: #2563eb;
}

.size-option.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.size-option input {
  display: none;
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
  border-radius: 16px;
  overflow: hidden;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.preview-toolbar span {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.btn-download {
  padding: 10px 20px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preview-container {
  flex: 1;
  padding: 24px;
  overflow: auto;
  display: flex;
  justify-content: center;
}

.btn-remove {
  padding: 4px 12px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
</style>
