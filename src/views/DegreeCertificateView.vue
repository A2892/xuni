<template>
  <div class="degree-view">
    <div class="page-header">
      <h1>🎓 学位证书生成器</h1>
      <p class="description">生成专业的学位证书，支持学士、硕士、博士学位</p>
    </div>

    <div class="main-content">
      <!-- 左侧编辑面板 -->
      <div class="edit-panel">
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 学校信息 -->
          <div v-show="activeTab === 'school'" class="form-section">
            <h3>学校信息</h3>
            
            <div class="form-group">
              <label>选择学校模板</label>
              <div class="template-grid">
                <button 
                  v-for="school in schoolTemplates" 
                  :key="school.id"
                  :class="['template-btn', { active: store.data.schoolName === school.name }]"
                  @click="store.setSchoolTemplate(school.id)"
                >
                  <span class="school-icon">🏫</span>
                  <span class="school-name">{{ school.name }}</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>学校中文名称</label>
              <input type="text" v-model="store.data.schoolName" placeholder="输入学校名称" />
            </div>

            <div class="form-group">
              <label>学校英文名称</label>
              <input type="text" v-model="store.data.schoolNameEn" placeholder="School Name" />
            </div>

            <div class="form-group">
              <label>学位评定委员会主席</label>
              <input type="text" v-model="store.data.presidentName" placeholder="输入主席姓名" />
            </div>

            <div class="form-group">
              <label>学校Logo</label>
              <div class="upload-area" @click="handleLogoUpload">
                <input type="file" ref="logoInput" accept="image/*" @change="onLogoChange" hidden />
                <span v-if="!store.data.schoolLogo">点击上传Logo</span>
                <img v-else :src="store.data.schoolLogo" alt="logo" class="preview-img" />
              </div>
            </div>
          </div>

          <!-- 学生信息 -->
          <div v-show="activeTab === 'student'" class="form-section">
            <h3>学生信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>学生姓名</label>
                <input type="text" v-model="store.data.studentName" placeholder="输入姓名" />
              </div>
              <div class="form-group">
                <label>英文姓名</label>
                <input type="text" v-model="store.data.studentNameEn" placeholder="English Name" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>性别</label>
                <select v-model="store.data.gender">
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>
              <div class="form-group">
                <label>出生日期</label>
                <input type="date" v-model="store.data.birthDate" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>国籍</label>
                <input type="text" v-model="store.data.nationality" placeholder="中国" />
              </div>
              <div class="form-group">
                <label>身份证号</label>
                <input type="text" v-model="store.data.idNumber" placeholder="输入身份证号" />
              </div>
            </div>

            <div class="form-group">
              <label>学生照片</label>
              <div class="upload-area photo-upload" @click="handlePhotoUpload">
                <input type="file" ref="photoInput" accept="image/*" @change="onPhotoChange" hidden />
                <div v-if="!store.data.photo" class="upload-placeholder">
                  <span class="icon">📷</span>
                  <span>点击上传证件照</span>
                  <span class="tip">建议尺寸: 2寸证件照</span>
                </div>
                <img v-else :src="store.data.photo" alt="photo" class="preview-photo" />
              </div>
            </div>
          </div>

          <!-- 学位信息 -->
          <div v-show="activeTab === 'degree'" class="form-section">
            <h3>学位信息</h3>

            <div class="form-group">
              <label>学位类型</label>
              <div class="degree-options">
                <button 
                  v-for="type in degreeTypes" 
                  :key="type.id"
                  :class="['degree-btn', { active: store.data.degreeType === type.id }]"
                  @click="store.data.degreeType = type.id"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>学位门类</label>
              <div class="category-options">
                <button 
                  v-for="cat in degreeCategories" 
                  :key="cat.id"
                  :class="['category-btn', { active: store.data.degreeCategory === cat.label }]"
                  @click="store.data.degreeCategory = cat.label"
                >
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>专业名称</label>
                <input type="text" v-model="store.data.major" placeholder="输入专业名称" />
              </div>
              <div class="form-group">
                <label>专业英文名</label>
                <input type="text" v-model="store.data.majorEn" placeholder="Major in English" />
              </div>
            </div>

            <div class="form-group">
              <label>所在院系</label>
              <input type="text" v-model="store.data.department" placeholder="输入院系名称" />
            </div>

            <div class="form-group">
              <label>授予日期</label>
              <input type="date" v-model="store.data.conferDate" />
            </div>
          </div>

          <!-- 论文信息 -->
          <div v-show="activeTab === 'thesis'" class="form-section">
            <h3>论文信息 (可选)</h3>

            <div class="form-group">
              <label>论文标题</label>
              <input type="text" v-model="store.data.thesisTitle" placeholder="输入论文标题" />
            </div>

            <div class="form-group">
              <label>论文英文标题</label>
              <input type="text" v-model="store.data.thesisTitleEn" placeholder="Thesis Title in English" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>指导教师</label>
                <input type="text" v-model="store.data.advisor" placeholder="输入导师姓名" />
              </div>
              <div class="form-group">
                <label>答辩日期</label>
                <input type="date" v-model="store.data.defenseDate" />
              </div>
            </div>
          </div>

          <!-- 证书信息 -->
          <div v-show="activeTab === 'certificate'" class="form-section">
            <h3>证书信息</h3>

            <div class="form-group">
              <label>证书编号</label>
              <div class="input-with-btn">
                <input type="text" v-model="store.data.certificateNumber" placeholder="证书编号" />
                <button class="gen-btn" @click="store.generateCertificateNumber()">自动生成</button>
              </div>
            </div>

            <div class="form-group">
              <label>注册号</label>
              <div class="input-with-btn">
                <input type="text" v-model="store.data.registrationNumber" placeholder="注册号" />
                <button class="gen-btn" @click="store.generateRegistrationNumber()">自动生成</button>
              </div>
            </div>

            <div class="form-group">
              <label>颁发日期</label>
              <input type="date" v-model="store.data.issueDate" />
            </div>
          </div>

          <!-- 样式设置 -->
          <div v-show="activeTab === 'settings'" class="form-section">
            <h3>样式设置</h3>

            <div class="form-group">
              <label>选择模板</label>
              <div class="template-options">
                <button 
                  v-for="t in templates" 
                  :key="t.id"
                  :class="['template-option', { active: store.data.template === t.id }]"
                  @click="store.data.template = t.id"
                >
                  <span class="option-icon">{{ t.icon }}</span>
                  <span class="option-label">{{ t.label }}</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>边框样式</label>
              <div class="border-options">
                <button 
                  v-for="border in borderStyles" 
                  :key="border.id"
                  :class="['border-btn', border.id, { active: store.data.borderStyle === border.id }]"
                  @click="store.data.borderStyle = border.id"
                >
                  {{ border.label }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>显示选项</label>
              <div class="checkbox-group">
                <label class="checkbox">
                  <input type="checkbox" v-model="store.data.showPhoto" />
                  <span>显示照片</span>
                </label>
                <label class="checkbox">
                  <input type="checkbox" v-model="store.data.showSeal" />
                  <span>显示印章</span>
                </label>
                <label class="checkbox">
                  <input type="checkbox" v-model="store.data.showNationalEmblem" />
                  <span>显示国徽</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>📄 预览效果</h3>
          <div class="preview-actions">
            <button class="action-btn" @click="handleDownload">
              <span>📥</span> 下载
            </button>
            <button class="action-btn" @click="handlePrint">
              <span>🖨️</span> 打印
            </button>
          </div>
        </div>
        <div class="preview-container" ref="previewRef">
          <DegreeCertificatePreview />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDegreeCertificateStore, degreeTypes, degreeCategories } from '@/stores/degreeCertificate'
import DegreeCertificatePreview from '@/components/DegreeCertificatePreview.vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const store = useDegreeCertificateStore()

const activeTab = ref('school')
const logoInput = ref<HTMLInputElement>()
const photoInput = ref<HTMLInputElement>()
const previewRef = ref<HTMLElement>()

const tabs = [
  { id: 'school', label: '学校', icon: '🏫' },
  { id: 'student', label: '学生', icon: '👤' },
  { id: 'degree', label: '学位', icon: '🎓' },
  { id: 'thesis', label: '论文', icon: '📄' },
  { id: 'certificate', label: '证书', icon: '📜' },
  { id: 'settings', label: '样式', icon: '⚙️' },
]

const templates = [
  { id: 'official', label: '官方模板', icon: '🏛️' },
  { id: 'classic', label: '经典模板', icon: '📜' },
  { id: 'modern', label: '现代模板', icon: '✨' },
]

const borderStyles = [
  { id: 'red', label: '红色' },
  { id: 'gold', label: '金色' },
  { id: 'blue', label: '蓝色' },
]

const schoolTemplates = [
  { id: 'pku', name: '北京大学' },
  { id: 'thu', name: '清华大学' },
  { id: 'fdu', name: '复旦大学' },
  { id: 'sjtu', name: '上海交通大学' },
  { id: 'zju', name: '浙江大学' },
  { id: 'nju', name: '南京大学' },
]

const handleLogoUpload = () => {
  logoInput.value?.click()
}

const onLogoChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.data.schoolLogo = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handlePhotoUpload = () => {
  photoInput.value?.click()
}

const onPhotoChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.data.photo = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleDownload = async () => {
  if (!previewRef.value) return
  
  const canvas = await html2canvas(previewRef.value, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#fff'
  })
  
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })
  
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  const imgX = (pdfWidth - imgWidth * ratio) / 2
  const imgY = (pdfHeight - imgHeight * ratio) / 2
  
  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
  pdf.save(`学位证书_${store.data.studentName}_${Date.now()}.pdf`)
}

const handlePrint = () => {
  window.print()
}
</script>

<style scoped>
.degree-view {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  margin: 0 0 8px;
}

.page-header .description {
  color: #666;
  margin: 0;
}

.main-content {
  display: flex;
  gap: 24px;
}

.edit-panel {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}

.tabs {
  display: flex;
  background: #f8f9fa;
  padding: 8px;
  gap: 4px;
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  min-width: 60px;
  padding: 10px 6px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 11px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e9ecef;
}

.tab-btn.active {
  background: #11998e;
  color: #fff;
}

.tab-icon {
  font-size: 16px;
}

.tab-content {
  padding: 20px;
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}

.form-section h3 {
  font-size: 16px;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #11998e;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #11998e;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.template-btn {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.template-btn:hover {
  border-color: #11998e;
}

.template-btn.active {
  border-color: #11998e;
  background: #e8f5e9;
}

.school-icon {
  display: block;
  font-size: 20px;
  margin-bottom: 4px;
}

.school-name {
  font-size: 11px;
  color: #333;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #11998e;
}

.upload-area .preview-img {
  max-width: 100px;
  max-height: 100px;
}

.photo-upload {
  padding: 30px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #999;
}

.upload-placeholder .icon {
  font-size: 32px;
}

.upload-placeholder .tip {
  font-size: 11px;
  color: #bbb;
}

.preview-photo {
  max-width: 120px;
  max-height: 160px;
  border-radius: 4px;
}

.degree-options {
  display: flex;
  gap: 8px;
}

.degree-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.degree-btn:hover {
  border-color: #11998e;
}

.degree-btn.active {
  border-color: #11998e;
  background: #11998e;
  color: #fff;
}

.category-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.category-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.category-btn:hover {
  border-color: #11998e;
}

.category-btn.active {
  border-color: #11998e;
  background: #e8f5e9;
  color: #11998e;
}

.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn input {
  flex: 1;
}

.gen-btn {
  padding: 10px 16px;
  background: #11998e;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
}

.gen-btn:hover {
  background: #0d7d74;
}

.template-options {
  display: flex;
  gap: 10px;
}

.template-option {
  flex: 1;
  padding: 16px;
  border: 2px solid #ddd;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.template-option:hover {
  border-color: #11998e;
}

.template-option.active {
  border-color: #11998e;
  background: #e8f5e9;
}

.option-icon {
  display: block;
  font-size: 24px;
  margin-bottom: 6px;
}

.option-label {
  font-size: 13px;
  color: #333;
}

.border-options {
  display: flex;
  gap: 10px;
}

.border-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.border-btn.red { border-color: #8B0000; color: #8B0000; }
.border-btn.gold { border-color: #B8860B; color: #B8860B; }
.border-btn.blue { border-color: #1a237e; color: #1a237e; }

.border-btn.active {
  background: currentColor;
  color: #fff !important;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox input {
  width: 18px;
  height: 18px;
}

/* 预览面板 */
.preview-panel {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.preview-header h3 {
  font-size: 16px;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #11998e;
  color: #11998e;
}

.preview-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 500px;
  display: flex;
  justify-content: center;
  overflow: auto;
}

@media print {
  .edit-panel,
  .page-header,
  .preview-header {
    display: none !important;
  }
  
  .degree-view {
    padding: 0;
    background: #fff;
  }
  
  .preview-panel {
    box-shadow: none;
  }
  
  .preview-container {
    padding: 0;
    background: #fff;
  }
}
</style>
