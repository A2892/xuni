<template>
  <div class="academic-report-view">
    <div class="view-content">
      <!-- 左侧：编辑面板 -->
      <div class="edit-panel">
        <div class="tabs">
          <button
            v-for="tab in mainTabs"
            :key="tab"
            :class="['tab', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 报告信息标签页 -->
          <div v-show="activeTab === '报告信息'" class="form-section">
            <h3 class="section-title">学校信息</h3>
            <div class="form-group">
              <label>学校名称</label>
              <input v-model="academicStore.reportInfo.universityName" type="text" />
            </div>
            <div class="form-group">
              <label>学校Logo</label>
              <div class="logo-upload-section">
                <div class="logo-preview-box">
                  <img v-if="academicStore.reportInfo.universityLogo" :src="academicStore.reportInfo.universityLogo" alt="University Logo" />
                  <button v-if="academicStore.reportInfo.universityLogo" class="btn-remove-overlay" @click="academicStore.updateReportInfo({ universityLogo: '' })" title="删除">✕</button>
                  <svg v-else width="60" height="60" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#4B6EF5" opacity="0.2"></circle>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#4B6EF5" stroke-width="2"></circle>
                    <text x="50" y="58" text-anchor="middle" font-size="24" fill="#4B6EF5" font-weight="bold">IU</text>
                  </svg>
                </div>
                <div class="logo-actions">
                  <PhotoSelector v-model="academicStore.reportInfo.universityLogo" />
                  <span class="or-divider">或</span>
                  <input type="file" @change="handleUniversityLogoUpload" accept="image/*" />
                </div>
                <p class="help-text">上传学校或组织的Logo</p>
              </div>
            </div>
            <div class="form-group">
              <label>学校地址</label>
              <input v-model="academicStore.reportInfo.universityAddress" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>联系电话</label>
                <input v-model="academicStore.reportInfo.universityPhone" type="text" />
              </div>
              <div class="form-group">
                <label>网站</label>
                <input v-model="academicStore.reportInfo.universityWebsite" type="text" />
              </div>
            </div>
            
            <h3 class="section-title">学生信息</h3>
            <div class="form-group">
              <label>学生姓名</label>
              <input v-model="academicStore.reportInfo.studentName" type="text" />
            </div>
            <div class="form-group">
              <label>学号</label>
              <input v-model="academicStore.reportInfo.studentId" type="text" />
            </div>
            <div class="form-group">
              <label>专业</label>
              <input v-model="academicStore.reportInfo.program" type="text" />
            </div>
            <div class="form-group">
              <label>院系</label>
              <input v-model="academicStore.reportInfo.department" type="text" />
            </div>
            <div class="form-group">
              <label>学年</label>
              <input v-model="academicStore.reportInfo.academicYear" type="text" />
            </div>
            <div class="form-group">
              <label>报告日期</label>
              <input v-model="academicStore.reportInfo.reportDate" type="date" />
            </div>
            
            <h3 class="section-title">学生照片</h3>
            <div class="form-group">
              <label>从照片库选择</label>
              <PhotoSelector 
                v-model="academicStore.reportInfo.studentPhoto"
                :student-id="academicStore.reportInfo.studentId"
                @photo-selected="handlePhotoSelected"
              />
            </div>
            <div class="form-group" style="margin-top: 15px;">
              <label>或者上传新照片</label>
              <input type="file" @change="handlePhotoUpload" accept="image/*" />
              <div v-if="academicStore.reportInfo.studentPhoto" class="photo-preview" style="margin-top: 10px; position: relative; display: inline-block;">
                <img :src="academicStore.reportInfo.studentPhoto" alt="学生照片" style="max-width: 150px; max-height: 150px; object-fit: contain; border: 2px solid #ddd; border-radius: 4px; padding: 4px;" />
                <button @click="academicStore.updateReportInfo({ studentPhoto: '' })" class="btn-remove-overlay" title="删除照片">×</button>
              </div>
            </div>

            <h3 class="section-title">学术表现</h3>
            <div class="form-row">
              <div class="form-group">
                <label>当前学期GPA</label>
                <input v-model="academicStore.reportInfo.currentGPA" type="text" />
              </div>
              <div class="form-group">
                <label>累计GPA</label>
                <input v-model="academicStore.reportInfo.cumulativeGPA" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>已完成学分</label>
                <input v-model.number="academicStore.reportInfo.completedCredits" type="number" />
              </div>
              <div class="form-group">
                <label>总学分</label>
                <input v-model.number="academicStore.reportInfo.totalCredits" type="number" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>班级排名</label>
                <input v-model="academicStore.reportInfo.rank" type="text" />
              </div>
              <div class="form-group">
                <label>班级总人数</label>
                <input v-model.number="academicStore.reportInfo.totalStudents" type="number" />
              </div>
            </div>
            <div class="form-group">
              <label>学术地位</label>
              <input v-model="academicStore.reportInfo.academicStanding" type="text" placeholder="例如: Dean's List" />
            </div>
            <div class="form-group">
              <label>表现等级</label>
              <select v-model="academicStore.reportInfo.performanceLevel">
                <option>Excellent</option>
                <option>Outstanding</option>
                <option>Good</option>
                <option>Satisfactory</option>
                <option>Needs Improvement</option>
              </select>
            </div>
            <div class="form-group">
              <label>出勤率</label>
              <input v-model="academicStore.reportInfo.attendanceRate" type="text" placeholder="例如: 98%" />
            </div>
          </div>

          <!-- 课程与成就标签页 -->
          <div v-show="activeTab === '课程与成就'" class="form-section">
            <h3 class="section-title">优秀课程表现</h3>
            
            <!-- 导入和模板下载按钮 -->
            <div class="import-buttons" style="margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
              <button @click="importFromTranscript" class="btn-import" style="background: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
                📄 从成绩单导入A+课程
              </button>
              <label class="btn-import" style="background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; display: inline-block;">
                📤 上传Excel导入
                <input type="file" @change="handleCourseFileUpload" accept=".xlsx,.xls,.csv" style="display: none;" />
              </label>
              <button @click="downloadCourseTemplate" class="btn-import" style="background: #8b5cf6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
                📥 下载模板
              </button>
            </div>
            
            <div class="course-list">
              <div v-for="(course, index) in academicStore.reportInfo.excellentCourses" :key="index" class="course-item">
                <div class="course-info">
                  <input v-model="course.courseCode" type="text" placeholder="课程代码 (如: CS101)" style="max-width: 150px;" />
                  <input v-model="course.courseName" type="text" placeholder="课程名称" />
                  <input v-model="course.semester" type="text" placeholder="学期" />
                  <input v-model.number="course.credits" type="number" placeholder="学分" />
                  <input v-model="course.grade" type="text" placeholder="成绩" />
                </div>
                <button @click="academicStore.removeExcellentCourse(index)" class="btn-remove">删除</button>
              </div>
            </div>
            <button @click="addExcellentCourse" class="btn-add">+ 添加课程</button>

            <h3 class="section-title">学术荣誉与成就</h3>
            
            <!-- 导入和模板下载按钮 -->
            <div class="import-buttons" style="margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
              <label class="btn-import" style="background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; display: inline-block;">
                📤 上传Excel导入
                <input type="file" @change="handleAchievementFileUpload" accept=".xlsx,.xls,.csv" style="display: none;" />
              </label>
              <button @click="downloadAchievementTemplate" class="btn-import" style="background: #8b5cf6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
                📥 下载模板
              </button>
            </div>
            
            <div class="achievement-list">
              <div v-for="(achievement, index) in academicStore.reportInfo.achievements" :key="index" class="achievement-item">
                <div class="achievement-info">
                  <input v-model="achievement.title" type="text" placeholder="荣誉/成就标题" />
                  <input v-model="achievement.date" type="text" placeholder="日期" />
                  <textarea v-model="achievement.description" placeholder="描述" rows="2"></textarea>
                </div>
                <button @click="academicStore.removeAchievement(index)" class="btn-remove">删除</button>
              </div>
            </div>
            <button @click="addAchievement" class="btn-add">+ 添加成就</button>

            <h3 class="section-title">学期目标</h3>
            <div class="goal-list">
              <div v-for="(goal, index) in academicStore.reportInfo.goals" :key="index" class="goal-item">
                <div class="goal-info">
                  <input v-model="goal.goal" type="text" placeholder="目标" />
                  <select v-model="goal.status">
                    <option>Completed</option>
                    <option>In Progress</option>
                    <option>On Track</option>
                    <option>Planned</option>
                    <option>At Risk</option>
                    <option>Overdue</option>
                  </select>
                </div>
                <button @click="academicStore.removeGoal(index)" class="btn-remove">删除</button>
              </div>
            </div>
            <button @click="addGoal" class="btn-add">+ 添加目标</button>
          </div>

          <!-- 评语与建议标签页 -->
          <div v-show="activeTab === '评语与建议'" class="form-section">
            <h3 class="section-title">导师评语</h3>
            <div class="form-group">
              <label>评语内容</label>
              <textarea v-model="academicStore.reportInfo.advisorComments" rows="6"></textarea>
            </div>
            <div class="form-group">
              <label>导师姓名</label>
              <input v-model="academicStore.reportInfo.advisorName" type="text" />
            </div>
            <div class="form-group">
              <label>导师职称</label>
              <input v-model="academicStore.reportInfo.advisorTitle" type="text" />
            </div>
            <div class="form-group">
              <label>导师签名</label>
              <div class="logo-actions">
                <PhotoSelector v-model="academicStore.reportInfo.advisorSignature" />
                <span class="or-divider">或</span>
                <input type="file" @change="handleAdvisorSignatureUpload" accept="image/*" />
              </div>
            </div>

            <h3 class="section-title">院长评语</h3>
            <div class="form-group">
              <label>评语内容</label>
              <textarea v-model="academicStore.reportInfo.deanComments" rows="6"></textarea>
            </div>
            <div class="form-group">
              <label>院长姓名</label>
              <input v-model="academicStore.reportInfo.deanName" type="text" />
            </div>
            <div class="form-group">
              <label>院长职称</label>
              <input v-model="academicStore.reportInfo.deanTitle" type="text" />
            </div>
            <div class="form-group">
              <label>院长签名</label>
              <div class="logo-actions">
                <PhotoSelector v-model="academicStore.reportInfo.deanSignature" />
                <span class="or-divider">或</span>
                <input type="file" @change="handleDeanSignatureUpload" accept="image/*" />
              </div>
            </div>

            <h3 class="section-title">改进建议</h3>
            <div class="improvement-list">
              <div v-for="(item, index) in academicStore.reportInfo.improvementAreas" :key="index" class="improvement-item">
                <div class="improvement-info">
                  <input v-model="item.area" type="text" placeholder="改进领域" />
                  <textarea v-model="item.recommendation" placeholder="建议" rows="2"></textarea>
                </div>
                <button @click="removeImprovementArea(index)" class="btn-remove">删除</button>
              </div>
            </div>
            <button @click="addImprovementArea" class="btn-add">+ 添加改进建议</button>

            <h3 class="section-title">综合建议</h3>
            <div class="form-group">
              <textarea v-model="academicStore.reportInfo.recommendations" rows="6"></textarea>
            </div>
          </div>

          <!-- 设计选项标签页 -->
          <div v-show="activeTab === '设计选项'" class="form-section">
            <h3 class="section-title">样式设置</h3>
            <div class="form-group">
              <label>报告风格</label>
              <select v-model="academicStore.reportInfo.reportStyle">
                <option>Harvard Style</option>
                <option>Oxford Style</option>
                <option>MIT Style</option>
                <option>Stanford Style</option>
                <option>Cambridge Style</option>
              </select>
            </div>
            <div class="form-group">
              <label>边框样式</label>
              <select v-model="academicStore.reportInfo.decorativeBorderStyle">
                <option>Classic</option>
                <option>Modern</option>
                <option>Elegant</option>
                <option>Minimal</option>
              </select>
            </div>
            <div class="form-group">
              <label>字体</label>
              <select v-model="academicStore.reportInfo.fontFamily">
                <option>Times New Roman</option>
                <option>Georgia</option>
                <option>Garamond</option>
                <option>Arial</option>
                <option>Helvetica</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>主题色 (页眉)</label>
                <input v-model="academicStore.reportInfo.headerColor" type="color" />
              </div>
              <div class="form-group">
                <label>卡片背景色</label>
                <input v-model="academicStore.reportInfo.cardBackgroundColor" type="color" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>强调色</label>
                <input v-model="academicStore.reportInfo.accentColor" type="color" />
              </div>
              <div class="form-group">
                <label>主颜色</label>
                <input v-model="academicStore.reportInfo.primaryColor" type="color" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>字体颜色</label>
                <input v-model="academicStore.reportInfo.textColor" type="color" />
              </div>
            </div>

            <h3 class="section-title">Logo与印章</h3>
            <div class="form-group">
              <label>学校Logo</label>
              <div class="logo-actions">
                <PhotoSelector v-model="academicStore.reportInfo.schoolLogo" />
                <span class="or-divider">或</span>
                <input type="file" @change="handleLogoUpload" accept="image/*" />
              </div>
              <div v-if="academicStore.reportInfo.schoolLogo" class="image-preview" style="margin-top: 8px;">
                <img :src="academicStore.reportInfo.schoolLogo" alt="Logo" style="max-width: 100px; max-height: 100px;" />
                <button class="btn-remove-sm" @click="academicStore.updateReportInfo({ schoolLogo: '' })">删除</button>
              </div>
            </div>
            <div class="form-group">
              <label>官方印章</label>
              <div class="logo-actions">
                <PhotoSelector v-model="academicStore.reportInfo.sealImage" />
                <span class="or-divider">或</span>
                <input type="file" @change="handleSealUpload" accept="image/*" />
              </div>
              <div v-if="academicStore.reportInfo.sealImage" class="image-preview" style="margin-top: 8px;">
                <img :src="academicStore.reportInfo.sealImage" alt="Seal" style="max-width: 100px; max-height: 100px;" />
                <button class="btn-remove-sm" @click="academicStore.updateReportInfo({ sealImage: '' })">删除</button>
              </div>
            </div>

            <!-- 水印设置 已移到独立子菜单 -->

            <h3 class="section-title">边框设置</h3>
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="academicStore.reportInfo.borderEnabled" type="checkbox" />
                <span>启用边框</span>
              </label>
            </div>
            <template v-if="academicStore.reportInfo.borderEnabled">
              <div class="form-group">
                <label>边框样式</label>
                <select v-model="academicStore.reportInfo.borderStyle">
                  <option value="solid">实线 (Solid)</option>
                  <option value="dashed">虚线 (Dashed)</option>
                  <option value="dotted">点线 (Dotted)</option>
                  <option value="double">双线 (Double)</option>
                </select>
              </div>
              <div class="form-group">
                <label>边框颜色</label>
                <input v-model="academicStore.reportInfo.borderColor" type="color" />
              </div>
              <div class="form-group">
                <label>边框宽度: {{ academicStore.reportInfo.borderWidth }}px</label>
                <input v-model.number="academicStore.reportInfo.borderWidth" type="range" min="1" max="10" />
              </div>
            </template>

            <h3 class="section-title">条形码与二维码</h3>
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="academicStore.reportInfo.showBarcode" type="checkbox" />
                <span>显示条形码</span>
              </label>
            </div>
            <template v-if="academicStore.reportInfo.showBarcode">
              <div class="form-group">
                <label>条形码来源</label>
                <div class="radio-group">
                  <label><input type="radio" v-model="academicStore.reportInfo.barcodeSource" value="generate" /> 自动生成</label>
                  <label><input type="radio" v-model="academicStore.reportInfo.barcodeSource" value="upload" /> 上传图片</label>
                </div>
              </div>
              <template v-if="academicStore.reportInfo.barcodeSource === 'upload'">
                <div class="form-group">
                  <label>上传条形码图片</label>
                  <div class="logo-actions">
                    <PhotoSelector v-model="academicStore.reportInfo.barcodeImage" />
                    <span class="or-divider">或</span>
                    <input type="file" accept="image/*" @change="handleBarcodeUpload" />
                  </div>
                </div>
                <div v-if="academicStore.reportInfo.barcodeImage" class="form-group">
                  <img :src="academicStore.reportInfo.barcodeImage" alt="条形码" style="max-width: 150px; max-height: 60px;" />
                  <button @click="academicStore.reportInfo.barcodeImage = ''" class="btn-small">删除</button>
                </div>
              </template>
              <div v-else class="form-group">
                <label>条形码内容 (留空使用学号)</label>
                <input v-model="academicStore.reportInfo.barcodeContent" type="text" placeholder="自动使用学号" />
              </div>
            </template>

            <div class="form-group" style="margin-top: 16px;">
              <label class="checkbox-label">
                <input v-model="academicStore.reportInfo.showQR" type="checkbox" />
                <span>显示二维码</span>
              </label>
            </div>
            <template v-if="academicStore.reportInfo.showQR">
              <div class="form-group">
                <label>二维码来源</label>
                <div class="radio-group">
                  <label><input type="radio" v-model="academicStore.reportInfo.qrSource" value="generate" /> 自动生成</label>
                  <label><input type="radio" v-model="academicStore.reportInfo.qrSource" value="upload" /> 上传图片</label>
                </div>
              </div>
              <template v-if="academicStore.reportInfo.qrSource === 'upload'">
                <div class="form-group">
                  <label>上传二维码图片</label>
                  <div class="logo-actions">
                    <PhotoSelector v-model="academicStore.reportInfo.qrImage" />
                    <span class="or-divider">或</span>
                    <input type="file" accept="image/*" @change="handleQRUpload" />
                  </div>
                </div>
                <div v-if="academicStore.reportInfo.qrImage" class="form-group">
                  <img :src="academicStore.reportInfo.qrImage" alt="二维码" style="max-width: 100px; max-height: 100px;" />
                  <button @click="academicStore.reportInfo.qrImage = ''" class="btn-small">删除</button>
                </div>
              </template>
              <div v-else class="form-group">
                <label>二维码内容 (留空自动生成验证信息)</label>
                <input v-model="academicStore.reportInfo.qrContent" type="text" placeholder="自动生成包含学生信息的验证数据" />
              </div>
            </template>
          </div>

          <!-- 数据管理标签页 -->
          <!-- 水印设置标签页 -->
          <div v-show="activeTab === '水印设置'" class="form-section">
            <h3 class="section-title">水印设置</h3>
            <div class="form-group">
              <WatermarkSettingsPanel :model="academicStore.reportInfo" />
            </div>
          </div>

          <div v-show="activeTab === '数据管理'" class="form-section">
            <div class="data-management-header">
              <button @click="importFromExistingData" class="btn-import-data">
                📥 从现有数据导入
              </button>
              <p class="import-hint">点击上方按钮从成绩单和其他页面自动导入数据</p>
            </div>
            <SaveLoadPanel 
              document-type="academic_report" 
              :get-data="getReportData"
              :set-data="loadReportData"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：预览和导出面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h2 class="preview-title">预览</h2>
          <div class="export-controls">
            <button @click="showEmailModal = true" class="btn-email">📧 发送邮件</button>
            <button @click="showDownloadPanel = true" class="btn-download">📥 导出</button>
          </div>

          <DownloadPanel
            :visible="showDownloadPanel"
            :preview-selector="'.preview-container .report-container'"
            :default-file-name="`AcademicReport_${academicStore.reportInfo.studentName || Date.now()}`"
            :default-format="'png'"
            :default-quality="3"
            @close="showDownloadPanel = false"
          />
        </div>
        <div class="preview-container">
          <AcademicReportPreview />
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`AcademicReport_${academicStore.reportInfo.studentName}`"
      :default-subject="`学业报告 - ${academicStore.reportInfo.studentName}`"
      preview-selector=".academic-report-preview"
      @close="showEmailModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAcademicStore } from '@/stores/academic'
import { useStudentStore } from '@/stores/student'
import AcademicReportPreview from '@/components/AcademicReportPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import EmailModal from '@/components/EmailModal.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import WatermarkSettingsPanel from '@/components/WatermarkSettingsPanel.vue'
import { downloadAsPDFWithOptions } from '@/utils/documentGenerator'
import type { MediaItem } from '@/types/media'

const academicStore = useAcademicStore()
const studentStore = useStudentStore()
const activeTab = ref('报告信息')
const showDownloadPanel = ref(false)
const showEmailModal = ref(false)

const mainTabs = ['报告信息', '课程与成就', '评语与建议', '设计选项', '水印设置', '数据管理']

// 从现有数据导入
const importFromExistingData = () => {
  if (confirm('确定要从成绩单和其他页面导入数据吗？\n当前数据将被覆盖！')) {
    academicStore.importDataFromStores()
    alert('✅ 数据导入成功！\n\n已自动从以下页面提取数据：\n- 学生基本信息\n- 成绩单课程数据\n- GPA自动计算\n- 优秀课程识别')
  }
}

// 文件上传处理
const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      academicStore.updateReportInfo({ logoImage: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

const handleSealUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      academicStore.updateReportInfo({ sealImage: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

const handleAdvisorSignatureUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      academicStore.updateReportInfo({ advisorSignature: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

const handleDeanSignatureUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      academicStore.updateReportInfo({ deanSignature: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      academicStore.updateReportInfo({ studentPhoto: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

const handlePhotoSelected = (photo: MediaItem) => {
  academicStore.updateReportInfo({ studentPhoto: photo.url })
}

const handleUniversityLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      academicStore.updateReportInfo({ universityLogo: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

const handleBarcodeUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      academicStore.updateReportInfo({ barcodeImage: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

const handleQRUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      academicStore.updateReportInfo({ qrImage: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

// 添加/删除项目
const addExcellentCourse = () => {
  academicStore.addExcellentCourse({
    courseCode: '',
    courseName: '',
    grade: 'A',
    credits: 3,
    semester: 'Fall 2024'
  })
}

// 从成绩单导入A+课程
const importFromTranscript = () => {
  try {
    // 直接从student store获取课程数据
    if (!studentStore.courses || studentStore.courses.length === 0) {
      alert('成绩单中没有找到课程数据，请先在成绩单页面添加课程')
      return
    }
    
    // 筛选A或A+课程
    const excellentCourses = studentStore.courses.filter((course: any) => {
      const grade = String(course.grade || '').toUpperCase()
      return grade === 'A+' || grade === 'A' || grade.startsWith('A')
    })
    
    if (excellentCourses.length === 0) {
      alert('成绩单中没有找到A或A+课程')
      return
    }
    
    // 清空现有课程并添加优秀课程
    academicStore.reportInfo.excellentCourses = excellentCourses.map((course: any) => ({
      courseCode: course.code || course.courseCode || '',
      courseName: course.name || course.courseName || '',
      grade: course.grade || 'A',
      credits: course.credits || 3,
      semester: course.semester || academicStore.reportInfo.academicYear
    }))
    
    alert(`✅ 已成功导入 ${excellentCourses.length} 门优秀课程！`)
  } catch (error) {
    console.error('导入失败:', error)
    alert('导入失败，请检查成绩单数据')
  }
}

// 处理Excel/CSV文件上传
const handleCourseFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const XLSX = await import('xlsx')
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        
        // 解析课程数据
        const courses = jsonData.map((row: any) => ({
          courseCode: row['课程代码'] || row['Course Code'] || row['courseCode'] || '',
          courseName: row['课程名称'] || row['Course Name'] || row['courseName'] || '',
          semester: row['学期'] || row['Semester'] || row['semester'] || 'Fall 2024',
          credits: Number(row['学分'] || row['Credits'] || row['credits']) || 3,
          grade: row['成绩'] || row['Grade'] || row['grade'] || 'A+'
        })).filter(course => course.courseName) // 过滤空课程
        
        if (courses.length === 0) {
          alert('文件中没有找到有效的课程数据')
          return
        }
        
        academicStore.reportInfo.excellentCourses = courses
        alert(`成功导入${courses.length}门课程`)
      } catch (error) {
        console.error('解析文件失败:', error)
        alert('文件格式错误，请使用提供的模板')
      }
    }
    
    reader.readAsBinaryString(file)
  } catch (error) {
    console.error('读取文件失败:', error)
    alert('读取文件失败')
  }
  
  // 清空input以允许重复上传同一文件
  input.value = ''
}

// 下载课程模板
const downloadCourseTemplate = async () => {
  try {
    const XLSX = await import('xlsx')
    
    // 创建模板数据
    const templateData = [
      {
        '课程代码': 'MATH301',
        '课程名称': 'Advanced Mathematics',
        '学期': 'Fall 2023',
        '学分': 4,
        '成绩': 'A+'
      },
      {
        '课程代码': 'CS201',
        '课程名称': 'Computer Science',
        '学期': 'Spring 2024',
        '学分': 3,
        '成绩': 'A'
      },
      {
        '课程名称': 'English Literature',
        '学期': 'Fall 2023',
        '学分': 3,
        '成绩': 'A+'
      }
    ]
    
    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '优秀课程')
    
    // 设置列宽
    worksheet['!cols'] = [
      { wch: 30 }, // 课程名称
      { wch: 15 }, // 学期
      { wch: 10 }, // 学分
      { wch: 10 }  // 成绩
    ]
    
    // 下载文件
    XLSX.writeFile(workbook, '优秀课程导入模板.xlsx')
  } catch (error) {
    console.error('下载模板失败:', error)
    alert('下载模板失败')
  }
}

// 处理成就Excel/CSV文件上传
const handleAchievementFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const XLSX = await import('xlsx')
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        
        // 解析成就数据
        const achievements = jsonData.map((row: any) => ({
          title: row['标题'] || row['Title'] || row['title'] || row['荣誉名称'] || '',
          date: row['日期'] || row['Date'] || row['date'] || row['获得日期'] || '',
          description: row['描述'] || row['Description'] || row['description'] || row['详细说明'] || ''
        })).filter(achievement => achievement.title) // 过滤空成就
        
        if (achievements.length === 0) {
          alert('文件中没有找到有效的成就数据')
          return
        }
        
        academicStore.reportInfo.achievements = achievements
        alert(`成功导入${achievements.length}项学术荣誉与成就`)
      } catch (error) {
        console.error('解析文件失败:', error)
        alert('文件格式错误，请使用提供的模板')
      }
    }
    
    reader.readAsBinaryString(file)
  } catch (error) {
    console.error('读取文件失败:', error)
    alert('读取文件失败')
  }
  
  // 清空input以允许重复上传同一文件
  input.value = ''
}

// 下载成就模板
const downloadAchievementTemplate = async () => {
  try {
    const XLSX = await import('xlsx')
    
    // 创建模板数据
    const templateData = [
      {
        '标题': "Dean's List",
        '日期': '2023-12-15',
        '描述': 'Achieved Dean\'s List for exceptional academic performance with GPA above 3.8'
      },
      {
        '标题': 'Academic Excellence Award',
        '日期': '2024-05-20',
        '描述': 'Received university-wide recognition for outstanding academic achievements'
      },
      {
        '标题': 'Research Paper Publication',
        '日期': '2024-03-10',
        '描述': 'Published research paper in International Journal of Computer Science'
      },
      {
        '标题': 'Scholarship Recipient',
        '日期': '2023-09-01',
        '描述': 'Awarded merit-based scholarship for academic excellence'
      }
    ]
    
    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '学术荣誉')
    
    // 设置列宽
    worksheet['!cols'] = [
      { wch: 30 }, // 标题
      { wch: 15 }, // 日期
      { wch: 60 }  // 描述
    ]
    
    // 下载文件
    XLSX.writeFile(workbook, '学术荣誉与成就导入模板.xlsx')
  } catch (error) {
    console.error('下载模板失败:', error)
    alert('下载模板失败')
  }
}

const addAchievement = () => {
  academicStore.addAchievement({
    title: '',
    date: new Date().toISOString().split('T')[0] || '',
    description: ''
  })
}

const addGoal = () => {
  academicStore.addGoal({
    goal: '',
    status: 'Planned'
  })
}

const addImprovementArea = () => {
  if (!academicStore.reportInfo.improvementAreas) {
    academicStore.reportInfo.improvementAreas = []
  }
  academicStore.reportInfo.improvementAreas.push({
    area: '',
    recommendation: ''
  })
}

const removeImprovementArea = (index: number) => {
  academicStore.reportInfo.improvementAreas.splice(index, 1)
}

function downloadReport() {
  showDownloadPanel.value = true
}

// 数据管理
const getReportData = () => {
  return {
    reportInfo: academicStore.reportInfo
  }
}

const loadReportData = (data: any) => {
  if (data.reportInfo) {
    academicStore.updateReportInfo(data.reportInfo)
  }
}
</script>

<style scoped>
.academic-report-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.view-content {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

/* 数据管理 */
.data-management-header {
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  text-align: center;
}

.btn-import-data {
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  width: 100%;
  max-width: 300px;
}

.btn-import-data:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.import-hint {
  margin: 12px 0 0 0;
  font-size: 13px;
  color: #6c757d;
  line-height: 1.5;
}

/* 编辑面板 */
.edit-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
}

.tabs {
  display: flex;
  flex-direction: row;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
}

.tab {
  padding: 15px 20px;
  background: none;
  border: none;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab:hover {
  background: #e9ecef;
}

.tab.active {
  background: white;
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  /* 全部显示，无滚动 */
}

.form-section {
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 20px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.section-title:first-child {
  margin-top: 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  font-weight: 500;
  color: #495057;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="date"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

/* Logo上传区域 */
.logo-upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logo-preview-box {
  width: 100px;
  height: 100px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f9f9f9;
}

.logo-preview-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.help-text {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 列表项样式 */
.course-list,
.achievement-list,
.goal-list,
.improvement-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.course-item,
.achievement-item,
.goal-item,
.improvement-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.course-info,
.achievement-info,
.goal-info,
.improvement-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.course-info input,
.goal-info input {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
}

.achievement-info input,
.improvement-info input {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
}

.achievement-info textarea,
.improvement-info textarea {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  resize: vertical;
  font-family: inherit;
}

.btn-remove {
  padding: 6px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s ease;
}

.btn-remove:hover {
  background: #c82333;
}

.btn-add {
  width: 100%;
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-add:hover {
  background: #5568d3;
}

/* 照片预览 */
.photo-preview {
  margin-top: 12px;
}

.photo-preview img {
  max-width: 150px;
  max-height: 180px;
  border-radius: 6px;
  border: 2px solid #dee2e6;
  object-fit: cover;
}

/* 预览面板 */
.preview-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
}

.preview-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.export-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.quality-select,
.format-select {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.quality-select option,
.format-select option {
  color: #212529;
}

.btn-email {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-email:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-email .icon {
  font-size: 16px;
}

.btn-download {
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-download .icon {
  font-size: 16px;
}

.preview-container {
  /* 全部显示，无滚动 */
  background: #f5f5f5;
}

/* 滚动条样式 */
.tab-content::-webkit-scrollbar,
.preview-container::-webkit-scrollbar {
  width: 8px;
}

.tab-content::-webkit-scrollbar-track,
.preview-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tab-content::-webkit-scrollbar-thumb,
.preview-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.tab-content::-webkit-scrollbar-thumb:hover,
.preview-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@media (max-width: 1400px) {
  .view-content {
    grid-template-columns: 350px 1fr;
  }
}

@media (max-width: 1200px) {
  .view-content {
    grid-template-columns: 1fr;
  }
  
  .preview-panel {
    order: -1;
  }
}
</style>
