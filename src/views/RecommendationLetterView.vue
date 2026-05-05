<template>
  <div class="recommendation-letter-view">
    <div class="edit-panel">
      <div class="panel-header">
        <h2>✉️ 推荐信生成器</h2>
        <p class="subtitle">学术/就业推荐信</p>
      </div>

      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- 数据管理 - 放在顶部 -->
      <div class="data-management-section">
        <SaveLoadPanel 
          document-type="recommendation_letter" 
          :get-data="() => store.data" 
          :set-data="(data: any) => Object.assign(store.data, data)" 
        />
      </div>

      <!-- 机构信息 -->
      <div v-show="activeTab === 'institution'" class="tab-content">
        <div class="form-section">
          <h3>🏫 机构信息</h3>
          <div class="form-group">
            <label>机构名称 (中文)</label>
            <input v-model="store.data.institutionName" type="text" />
          </div>
          <div class="form-group">
            <label>机构名称 (英文)</label>
            <input v-model="store.data.institutionNameEn" type="text" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>院系 (中文)</label>
              <input v-model="store.data.departmentName" type="text" />
            </div>
            <div class="form-group">
              <label>院系 (英文)</label>
              <input v-model="store.data.departmentNameEn" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>机构地址</label>
            <input v-model="store.data.institutionAddress" type="text" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>电话</label>
              <input v-model="store.data.institutionPhone" type="text" />
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="store.data.institutionEmail" type="email" />
            </div>
          </div>
          <div class="form-group">
            <label>机构Logo</label>
            <div class="logo-actions">
              <PhotoSelector v-model="store.data.institutionLogo" />
              <span class="or-divider">或</span>
              <input type="file" accept="image/*" @change="handleLogoUpload" />
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐人信息 -->
      <div v-show="activeTab === 'recommender'" class="tab-content">
        <div class="form-section">
          <h3>👨‍🏫 推荐人信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>姓名 (中文)</label>
              <input v-model="store.data.recommenderName" type="text" />
            </div>
            <div class="form-group">
              <label>姓名 (英文)</label>
              <input v-model="store.data.recommenderNameEn" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>职务 (中文)</label>
              <input v-model="store.data.recommenderTitle" type="text" />
            </div>
            <div class="form-group">
              <label>职务 (英文)</label>
              <input v-model="store.data.recommenderTitleEn" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="store.data.recommenderEmail" type="email" />
            </div>
            <div class="form-group">
              <label>电话</label>
              <input v-model="store.data.recommenderPhone" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>与被推荐人的关系</label>
            <input v-model="store.data.relationship" type="text" placeholder="如：课程导师、实习导师等" />
          </div>
          <div class="form-group">
            <label>认识年数</label>
            <input v-model.number="store.data.yearsKnown" type="number" min="1" />
          </div>
        </div>

        <div class="quick-fill">
          <h4>快速填充身份</h4>
          <div class="quick-btns">
            <button @click="store.setRecommenderTemplate('professor')">教授</button>
            <button @click="store.setRecommenderTemplate('advisor')">副教授</button>
            <button @click="store.setRecommenderTemplate('employer')">企业导师</button>
          </div>
        </div>
      </div>

      <!-- 被推荐人 -->
      <div v-show="activeTab === 'applicant'" class="tab-content">
        <div class="form-section">
          <h3>👤 被推荐人信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>姓名 (中文)</label>
              <input v-model="store.data.applicantName" type="text" />
            </div>
            <div class="form-group">
              <label>姓名 (英文)</label>
              <input v-model="store.data.applicantNameEn" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>性别</label>
              <select v-model="store.data.applicantGender">
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div class="form-group">
              <label>学号</label>
              <input v-model="store.data.applicantId" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>专业 (中文)</label>
              <input v-model="store.data.applicantMajor" type="text" />
            </div>
            <div class="form-group">
              <label>专业 (英文)</label>
              <input v-model="store.data.applicantMajorEn" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>年级</label>
              <input v-model="store.data.applicantGrade" type="text" />
            </div>
            <div class="form-group">
              <label>GPA</label>
              <input v-model="store.data.applicantGPA" type="text" placeholder="3.85/4.0" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🎯 申请目标</h3>
          <div class="purpose-btns">
            <button 
              v-for="purpose in recommendationPurposes" 
              :key="purpose.value"
              :class="['purpose-btn', { active: store.data.purpose === purpose.value }]"
              @click="store.setPurposeTemplate(purpose.value)"
            >
              {{ purpose.label }}
            </button>
          </div>
          <div class="form-group">
            <label>目标院校/公司</label>
            <input v-model="store.data.targetInstitution" type="text" />
          </div>
          <div class="form-group">
            <label>目标项目/职位</label>
            <input v-model="store.data.targetProgram" type="text" />
          </div>
        </div>
      </div>

      <!-- 推荐内容 -->
      <div v-show="activeTab === 'content'" class="tab-content">
        <div class="form-section">
          <h3>📝 推荐内容</h3>
          <div class="form-group">
            <label>学术能力评价</label>
            <textarea v-model="store.data.academicAbility" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>科研能力评价</label>
            <textarea v-model="store.data.researchAbility" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>个人品质评价</label>
            <textarea v-model="store.data.personalQualities" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>推荐结语</label>
            <textarea v-model="store.data.recommendations" rows="2"></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>📄 信函信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>信函编号</label>
              <div class="input-with-btn">
                <input v-model="store.data.letterNumber" type="text" />
                <button @click="store.generateLetterNumber()">🎲</button>
              </div>
            </div>
            <div class="form-group">
              <label>开具日期</label>
              <input v-model="store.data.issueDate" type="date" />
            </div>
          </div>
        </div>
      </div>

      <!-- 设计 -->
      <div v-show="activeTab === 'design'" class="tab-content">
        <div class="form-section">
          <h3>🎨 水印设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.watermarkEnabled" />
              <span>启用水印</span>
            </label>
          </div>
          <div v-if="designSettings.watermarkEnabled" class="design-group">
            <div class="form-row">
              <div class="form-group">
                <label>水印文字</label>
                <input v-model="designSettings.watermarkText" type="text" placeholder="CONFIDENTIAL" />
              </div>
              <div class="form-group">
                <label>透明度 (%)</label>
                <input v-model.number="designSettings.watermarkOpacity" type="range" min="1" max="30" />
                <span class="range-value">{{ designSettings.watermarkOpacity }}%</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>水印颜色</label>
                <input v-model="designSettings.watermarkColor" type="color" />
              </div>
              <div class="form-group">
                <label>水印类型</label>
                <div class="radio-group horizontal">
                  <label class="radio-item">
                    <input type="radio" v-model="designSettings.watermarkType" value="center" />
                    <span>居中水印</span>
                  </label>
                  <label class="radio-item">
                    <input type="radio" v-model="designSettings.watermarkType" value="fullscreen" />
                    <span>全屏水印</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🖼️ 边框设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.borderEnabled" />
              <span>启用边框</span>
            </label>
          </div>
          <div v-if="designSettings.borderEnabled" class="design-group">
            <div class="form-row">
              <div class="form-group">
                <label>边框样式</label>
                <select v-model="designSettings.borderStyle">
                  <option value="solid">实线</option>
                  <option value="double">双线</option>
                  <option value="dashed">虚线</option>
                  <option value="ornate">花纹边框</option>
                </select>
              </div>
              <div class="form-group">
                <label>边框颜色</label>
                <input v-model="designSettings.borderColor" type="color" />
              </div>
            </div>
            <div class="form-group">
              <label>边框宽度 (px)</label>
              <input v-model.number="designSettings.borderWidth" type="range" min="1" max="10" />
              <span class="range-value">{{ designSettings.borderWidth }}px</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🔖 印章/签名设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.stampEnabled" />
              <span>启用印章</span>
            </label>
          </div>
          <div v-if="designSettings.stampEnabled" class="design-group">
            <div class="form-row">
              <div class="form-group">
                <label>印章类型</label>
                <select v-model="designSettings.stampType">
                  <option value="official">机构公章</option>
                  <option value="personal">个人签章</option>
                  <option value="department">部门章</option>
                </select>
              </div>
              <div class="form-group">
                <label>印章颜色</label>
                <input v-model="designSettings.stampColor" type="color" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>旋转角度</label>
                <input v-model.number="designSettings.stampRotation" type="range" min="-30" max="30" />
                <span class="range-value">{{ designSettings.stampRotation }}°</span>
              </div>
              <div class="form-group">
                <label>印章文字</label>
                <input v-model="designSettings.stampText" type="text" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📱 二维码设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.qrCodeEnabled" />
              <span>启用扫码验证</span>
            </label>
          </div>
          <div v-if="designSettings.qrCodeEnabled" class="design-group">
            <div class="form-group">
              <label>二维码来源</label>
              <div class="radio-group">
                <label><input type="radio" v-model="designSettings.qrCodeSource" value="generate" /> 自动生成</label>
                <label><input type="radio" v-model="designSettings.qrCodeSource" value="upload" /> 上传图片</label>
              </div>
            </div>
            <div v-if="designSettings.qrCodeSource === 'upload'" class="form-group">
              <label>上传二维码图片</label>
              <div class="logo-actions">
                <PhotoSelector v-model="designSettings.qrCodeImage" />
                <span class="or-divider">或</span>
                <input type="file" accept="image/*" @change="handleQRCodeUpload" />
              </div>
              <div v-if="designSettings.qrCodeImage" class="image-preview">
                <img :src="designSettings.qrCodeImage" alt="二维码" style="max-width: 100px; max-height: 100px;" />
                <button @click="designSettings.qrCodeImage = ''" class="btn-remove-sm">删除</button>
              </div>
            </div>
            <div v-else class="form-group">
              <label>二维码内容 (留空自动生成验证链接)</label>
              <input v-model="designSettings.qrCodeContent" type="text" placeholder="https://verify.edu.cn/..." />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>✒️ 字体设置</h3>
          <div class="form-row">
            <div class="form-group">
              <label>中文字体</label>
              <select v-model="designSettings.fontFamilyCN">
                <option value="'SimSun', serif">宋体</option>
                <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                <option value="'SimHei', sans-serif">黑体</option>
                <option value="'KaiTi', serif">楷体</option>
                <option value="'FangSong', serif">仿宋</option>
              </select>
            </div>
            <div class="form-group">
              <label>英文字体</label>
              <select v-model="designSettings.fontFamilyEN">
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Helvetica Neue', sans-serif">Helvetica</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📄 信纸设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.letterheadEnabled" />
              <span>显示抬头信纸</span>
            </label>
          </div>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.showSignatureLine" />
              <span>显示签名线</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 设置 -->
      <div v-show="activeTab === 'settings'" class="tab-content">
        <div class="form-section">
          <h3>🎨 模板样式</h3>
          <div class="template-btns">
            <button 
              v-for="template in templates" 
              :key="template.value"
              :class="['template-btn', { active: store.data.template === template.value }]"
              @click="store.data.template = template.value"
            >
              {{ template.icon }} {{ template.label }}
            </button>
          </div>
        </div>

        <div class="form-section">
          <h3>🌐 语言设置</h3>
          <div class="language-btns">
            <button 
              v-for="lang in languages" 
              :key="lang.value"
              :class="['lang-btn', { active: store.data.language === lang.value }]"
              @click="store.data.language = lang.value"
            >
              {{ lang.label }}
            </button>
          </div>
        </div>

        <div class="form-section">
          <h3>⚙️ 显示设置</h3>
          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showLetterhead" />
              <span>显示机构信头</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showSignature" />
              <span>显示签名区域</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <button class="btn-reset" @click="store.reset()">重置为默认值</button>
        </div>
      </div>
    </div>

    <div class="preview-panel">
      <div class="preview-header">
        <h3>推荐信预览</h3>
        <div class="preview-actions">
          <button class="btn-download" @click="showDownloadPanel = true">📥 导出</button>
        </div>
      </div>
      <div class="preview-container">
        <div ref="previewRef" class="preview-wrapper">
          <RecommendationLetterPreview />
        </div>
      </div>
      <DownloadPanel
        :visible="showDownloadPanel"
        :preview-selector="'.preview-container .preview-wrapper'"
        :default-file-name="`Recommendation_${store.data.applicantName || Date.now()}`"
        @close="showDownloadPanel = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRecommendationLetterStore, recommendationPurposes } from '@/stores/recommendationLetter'
import RecommendationLetterPreview from '@/components/RecommendationLetterPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useRecommendationLetterStore()
const activeTab = ref('institution')
const previewRef = ref<HTMLElement | null>(null)
const showDownloadPanel = ref(false)

// 使用 store 中的设计设置
const designSettings = store.designSettings

const tabs = [
  { id: 'institution', label: '机构', icon: '🏫' },
  { id: 'recommender', label: '推荐人', icon: '👨‍🏫' },
  { id: 'applicant', label: '被推荐人', icon: '👤' },
  { id: 'content', label: '内容', icon: '📝' },
  { id: 'design', label: '设计', icon: '🎨' },
  { id: 'settings', label: '设置', icon: '⚙️' }
]

const templates = [
  { value: 'formal', label: '正式风格', icon: '📜' },
  { value: 'academic', label: '学术风格', icon: '🎓' },
  { value: 'modern', label: '现代风格', icon: '✨' }
]

const languages = [
  { value: 'chinese', label: '中文' },
  { value: 'english', label: '英文' },
  { value: 'bilingual', label: '中英双语' }
]

const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.data.institutionLogo = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const handleQRCodeUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      designSettings.qrCodeImage = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}


</script>

<style scoped>
.recommendation-letter-view {
  display: flex;
  height: 100%;
  gap: 24px;
  padding: 24px;
  background: var(--bg-secondary);
}

.edit-panel {
  width: 420px;
  flex-shrink: 0;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.panel-header h2 { margin: 0 0 4px 0; font-size: 1.5rem; }
.subtitle { margin: 0; font-size: 0.875rem; color: var(--text-secondary); }

.tabs {
  display: flex;
  gap: 6px;
  margin: 20px 0;
  padding: 4px;
  background: var(--bg-secondary);
  border-radius: 12px;
  flex-wrap: wrap;
}

.data-management-section {
  margin: 0 20px 16px;
}

.tab-btn {
  flex: 1;
  min-width: 70px;
  padding: 10px 8px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.tab-btn:hover { background: var(--bg-primary); }
.tab-btn.active {
  background: var(--bg-primary);
  color: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-section { margin-bottom: 24px; }
.form-section h3 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-group { margin-bottom: 12px; }
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn input { flex: 1; }
.input-with-btn button {
  padding: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
}

.quick-fill {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.quick-fill h4 {
  margin: 0 0 10px 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.quick-btns {
  display: flex;
  gap: 8px;
}

.quick-btns button {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.quick-btns button:hover { border-color: var(--primary-color); }

.purpose-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.purpose-btn {
  padding: 8px 14px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.purpose-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  color: var(--primary-color);
}

.template-btns, .language-btns { display: flex; gap: 10px; }
.template-btn, .lang-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.template-btn.active, .lang-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  color: var(--primary-color);
}

.toggle-group { display: flex; flex-direction: column; gap: 12px; }
.toggle-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.toggle-item input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
}

.btn-reset {
  width: 100%;
  padding: 12px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
}

.btn-reset:hover { background: #fee2e2; color: #dc2626; }

.preview-panel {
  flex: 1;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-header h3 { margin: 0; }
.preview-actions { display: flex; gap: 10px; }
.btn-download {
  padding: 10px 16px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  overflow: auto;
}

/* 设计功能样式 */
.design-group {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-top: 8px;
}

.range-value {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-left: 8px;
}

input[type="range"] {
  width: 100%;
  accent-color: var(--primary-color);
}

input[type="color"] {
  width: 100%;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
}
</style>
