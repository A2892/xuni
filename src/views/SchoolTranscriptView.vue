<template>
  <div class="school-transcript-view">
    <div class="edit-panel">
      <div class="panel-header">
        <h2>📜 学校成绩单生成器</h2>
        <p class="subtitle">官方学业成绩证明</p>
      </div>

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

      <!-- 数据管理 - 放在顶部 -->
      <div class="data-management-section">
        <SaveLoadPanel 
          document-type="school_transcript" 
          :get-data="() => store.data" 
          :set-data="(data: any) => Object.assign(store.data, data)" 
        />
      </div>

      <!-- 学校信息 -->
      <div v-show="activeTab === 'school'" class="tab-content">
        <div class="form-section">
          <h3>🏫 学校信息</h3>
          <div class="form-group">
            <label>学校名称 (中文)</label>
            <input v-model="store.data.schoolName" type="text" />
          </div>
          <div class="form-group">
            <label>学校名称 (英文)</label>
            <input v-model="store.data.schoolNameEn" type="text" />
          </div>
          <div class="form-group">
            <label>学校地址</label>
            <input v-model="store.data.schoolAddress" type="text" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="store.data.schoolPhone" type="text" />
            </div>
            <div class="form-group">
              <label>学校网站</label>
              <input v-model="store.data.schoolWebsite" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>学校Logo</label>
            <div class="logo-actions">
              <PhotoSelector v-model="store.data.schoolLogo" />
              <span class="or-divider">或</span>
              <input type="file" accept="image/*" @change="handleLogoUpload" />
            </div>
          </div>
        </div>

        <div class="quick-fill">
          <h4>快速填充学校</h4>
          <div class="quick-btns">
            <button @click="store.setSchoolTemplate('pku')">北京大学</button>
            <button @click="store.setSchoolTemplate('thu')">清华大学</button>
            <button @click="store.setSchoolTemplate('fdu')">复旦大学</button>
            <button @click="store.setSchoolTemplate('sjtu')">上海交大</button>
          </div>
        </div>
      </div>

      <!-- 学生信息 -->
      <div v-show="activeTab === 'student'" class="tab-content">
        <div class="form-section">
          <h3>👤 学生信息</h3>
          
          <!-- 学生照片 -->
          <div class="photo-section">
            <div class="photo-row">
              <div class="photo-preview-box">
                <div v-if="store.data.studentPhoto" class="photo-preview">
                  <img 
                    :src="store.data.studentPhoto" 
                    alt="学生照片" 
                    @error="store.data.studentPhoto = ''"
                  />
                  <button class="btn-remove-photo" @click="store.data.studentPhoto = ''">×</button>
                </div>
                <div v-else class="photo-placeholder">
                  <span class="placeholder-icon">📷</span>
                  <span class="placeholder-text">学生照片</span>
                </div>
              </div>
              <div class="photo-controls">
                <PhotoSelector 
                  v-model="store.data.studentPhoto"
                  :student-id="store.data.studentId"
                  @photo-selected="handlePhotoSelected"
                />
                <div class="photo-actions">
                  <label class="btn-upload">
                    📤 本地上传
                    <input type="file" accept="image/*" @change="handlePhotoUpload" style="display: none" />
                  </label>
                  <button class="btn-library" @click="showPhotoLibrary = !showPhotoLibrary">
                    {{ showPhotoLibrary ? '关闭头像库' : '📚 头像库' }}
                  </button>
                </div>
              </div>
            </div>
            <div v-if="showPhotoLibrary" class="photo-library">
              <div v-for="(photo, index) in photoLibrary" :key="index" 
                   class="library-item" @click="selectPhoto(photo)">
                <img :src="photo" alt="头像" />
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>姓名 (中文)</label>
              <input v-model="store.data.studentName" type="text" />
            </div>
            <div class="form-group">
              <label>姓名 (英文)</label>
              <input v-model="store.data.studentNameEn" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>姓名字体</label>
            <select v-model="store.data.studentNameFont">
              <option value="SimSun">宋体 (SimSun)</option>
              <option value="SimHei">黑体 (SimHei)</option>
              <option value="KaiTi">楷体 (KaiTi)</option>
              <option value="FangSong">仿宋 (FangSong)</option>
              <option value="Microsoft YaHei">微软雅黑 (Microsoft YaHei)</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>学号</label>
              <input v-model="store.data.studentId" type="text" />
            </div>
            <div class="form-group">
              <label>性别</label>
              <select v-model="store.data.gender">
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>出生日期</label>
              <input v-model="store.data.birthDate" type="date" />
            </div>
            <div class="form-group">
              <label>身份证号</label>
              <input v-model="store.data.idNumber" type="text" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>🎓 学籍信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>学院 (中文)</label>
              <input v-model="store.data.faculty" type="text" />
            </div>
            <div class="form-group">
              <label>学院 (英文)</label>
              <input v-model="store.data.facultyEn" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>专业 (中文)</label>
              <input v-model="store.data.major" type="text" />
            </div>
            <div class="form-group">
              <label>专业 (英文)</label>
              <input v-model="store.data.majorEn" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>年级</label>
              <input v-model="store.data.grade" type="text" placeholder="2020级" />
            </div>
            <div class="form-group">
              <label>班级</label>
              <input v-model="store.data.classNo" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>入学日期</label>
              <input v-model="store.data.enrollmentDate" type="date" />
            </div>
            <div class="form-group">
              <label>预计毕业</label>
              <input v-model="store.data.expectedGraduation" type="date" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>学历层次</label>
              <select v-model="store.data.educationLevel">
                <option v-for="level in educationLevels" :key="level.value" :value="level.value">
                  {{ level.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>学习形式</label>
              <select v-model="store.data.studyMode">
                <option value="fulltime">全日制</option>
                <option value="parttime">非全日制</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 课程成绩 -->
      <div v-show="activeTab === 'courses'" class="tab-content">
        <div class="form-section">
          <div class="section-header">
            <h3>📚 课程成绩</h3>
            <div class="header-actions">
              <StudentDocumentPicker 
                button-text="从资料管理导入"
                title="从资料管理选择成绩数据"
                :accept="['xlsx', 'xls', 'csv', 'pdf', 'jpg', 'jpeg', 'png']"
                @select="handleDocumentSelect"
              />
              <button class="btn-template" @click="downloadCourseTemplate" title="下载Excel模板">
                📥 下载模板
              </button>
              <button class="btn-import" @click="triggerCourseImport" title="导入课程">
                📄 导入课程
              </button>
              <button class="btn-add" @click="store.addCourse()">+ 添加课程</button>
            </div>
            <input ref="courseFileInput" type="file" accept=".xlsx,.xls,.csv" style="display:none" @change="handleCourseImport" />
          </div>
          
          <!-- 导入提示 -->
          <div v-if="importMessage" class="import-message" :class="importMessageType">
            {{ importMessage }}
          </div>

          <div v-for="(course, index) in store.data.courses" :key="course.id" class="course-card">
            <div class="course-header">
              <span class="course-index">#{{ index + 1 }}</span>
              <button class="btn-remove" @click="store.removeCourse(course.id)">×</button>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>课程代码</label>
                <input v-model="course.code" type="text" placeholder="CS101" />
              </div>
              <div class="form-group">
                <label>学期</label>
                <input v-model="course.semester" type="text" placeholder="2020-2021-1" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>课程名称 (中文)</label>
                <input v-model="course.name" type="text" />
              </div>
              <div class="form-group">
                <label>课程名称 (英文)</label>
                <input v-model="course.nameEn" type="text" />
              </div>
            </div>
            <div class="form-row four-col">
              <div class="form-group">
                <label>学分</label>
                <input v-model.number="course.credits" type="number" />
              </div>
              <div class="form-group">
                <label>学时</label>
                <input v-model.number="course.hours" type="number" />
              </div>
              <div class="form-group">
                <label>成绩</label>
                <input 
                  v-model.number="course.score" 
                  type="number" 
                  @change="store.updateCourseScore(course, course.score)"
                />
              </div>
              <div class="form-group">
                <label>绩点</label>
                <input :value="course.gradePoint.toFixed(1)" type="text" disabled class="computed" />
              </div>
            </div>
            <div class="form-group">
              <label>课程类型</label>
              <select v-model="course.courseType">
                <option v-for="type in courseTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="store.data.courses.length === 0" class="empty-courses">
            <p>暂无课程，点击上方按钮添加</p>
          </div>
        </div>
      </div>

      <!-- 汇总信息 -->
      <div v-show="activeTab === 'summary'" class="tab-content">
        <div class="form-section">
          <h3>📊 成绩汇总</h3>
          <div class="summary-cards">
            <div class="summary-card">
              <span class="card-label">累计绩点</span>
              <span class="card-value highlight">{{ store.calculatedGPA.toFixed(2) }}</span>
            </div>
            <div class="summary-card">
              <span class="card-label">平均成绩</span>
              <span class="card-value">{{ store.calculatedAvgScore.toFixed(1) }}</span>
            </div>
            <div class="summary-card">
              <span class="card-label">已修学分</span>
              <span class="card-value">{{ store.calculatedEarnedCredits }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>应修总学分</label>
              <input v-model.number="store.data.totalCredits" type="number" />
            </div>
            <div class="form-group">
              <label>专业排名</label>
              <input v-model="store.data.ranking" type="text" placeholder="15/280" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📝 证明信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label>证明编号</label>
              <div class="input-with-btn">
                <input v-model="store.data.serialNumber" type="text" />
                <button @click="store.generateSerialNumber()">🎲</button>
              </div>
            </div>
            <div class="form-group">
              <label>发证日期</label>
              <input v-model="store.data.issueDate" type="date" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>签发人姓名</label>
              <input v-model="store.data.registrarName" type="text" />
            </div>
            <div class="form-group">
              <label>签发人职务</label>
              <input v-model="store.data.registrarTitle" type="text" />
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
                <input v-model="designSettings.watermarkText" type="text" placeholder="OFFICIAL" />
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
                  <label class="radio-item">
                    <input type="radio" v-model="designSettings.watermarkType" value="diagonal" />
                    <span>斜线水印</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>斜线宽度 ({{ designSettings.watermarkStripeWidth }}px)</label>
                <input type="range" v-model.number="designSettings.watermarkStripeWidth" min="1" max="80" />
              </div>
              <div class="form-group">
                <label>斜线间距 ({{ designSettings.watermarkStripeSpacing }}px)</label>
                <input type="range" v-model.number="designSettings.watermarkStripeSpacing" min="20" max="400" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>斜线颜色</label>
                <input v-model="designSettings.watermarkStripeColor" type="color" />
              </div>
              <div class="form-group">
                <label>斜线不透明度 ({{ designSettings.watermarkStripeOpacity }}%)</label>
                <input type="range" v-model.number="designSettings.watermarkStripeOpacity" min="1" max="100" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>斜线角度 ({{ designSettings.watermarkStripeRotation }}°)</label>
                <input type="range" v-model.number="designSettings.watermarkStripeRotation" min="-90" max="90" />
              </div>
              <div class="form-group">
                <label>覆盖选项</label>
                <div style="display:flex;gap:12px;flex-direction:column;">
                  <label><input type="checkbox" v-model="designSettings.watermarkOverlayDiagonal" /> 斜线覆盖文本</label>
                  <label><input type="checkbox" v-model="designSettings.watermarkOverlayFullscreen" /> 全屏覆盖文本</label>
                  <label><input type="checkbox" v-model="designSettings.watermarkOverlayText" /> 文字水印覆盖文本</label>
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
          <h3>🔖 印章设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.stampEnabled" />
              <span>启用印章</span>
            </label>
          </div>
          <div v-if="designSettings.stampEnabled" class="design-group">
            <div class="form-group">
              <label>印章来源</label>
              <div class="radio-group">
                <label><input type="radio" v-model="designSettings.stampSource" value="generate" /> 自动生成</label>
                <label><input type="radio" v-model="designSettings.stampSource" value="upload" /> 上传图片</label>
              </div>
            </div>
            <div v-if="designSettings.stampSource === 'upload'" class="form-group">
              <label>上传印章图片</label>
              <div class="logo-actions">
                <PhotoSelector v-model="designSettings.stampImage" />
                <span class="or-divider">或</span>
                <input type="file" accept="image/*" @change="handleStampUpload" />
              </div>
              <div v-if="designSettings.stampImage" class="image-preview">
                <img :src="designSettings.stampImage" alt="印章" style="max-width: 100px; max-height: 100px;" />
                <button @click="designSettings.stampImage = ''" class="btn-remove-sm">删除</button>
              </div>
            </div>
            <div v-else>
              <div class="form-row">
                <div class="form-group">
                  <label>印章类型</label>
                  <select v-model="designSettings.stampType">
                    <option value="official">学校公章</option>
                    <option value="academic">教务处章</option>
                    <option value="registrar">注册中心章</option>
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
        </div>

        <div class="form-section">
          <h3>✍️ 签章设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.signatureEnabled" />
              <span>启用签章</span>
            </label>
          </div>
          <div v-if="designSettings.signatureEnabled" class="design-group">
            <div class="form-group">
              <label>签章来源</label>
              <div class="radio-group">
                <label><input type="radio" v-model="designSettings.signatureSource" value="generate" /> 使用文字</label>
                <label><input type="radio" v-model="designSettings.signatureSource" value="upload" /> 上传图片</label>
              </div>
            </div>
            <div v-if="designSettings.signatureSource === 'upload'" class="form-group">
              <label>上传签章图片</label>
              <input type="file" accept="image/*" @change="handleSignatureUpload" />
              <div v-if="designSettings.signatureImage" class="image-preview">
                <img :src="designSettings.signatureImage" alt="签章" style="max-width: 150px; max-height: 60px;" />
                <button @click="designSettings.signatureImage = ''" class="btn-remove-sm">删除</button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>📱 扫码查验设置</h3>
          <div class="form-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="designSettings.qrCodeEnabled" />
              <span>启用扫码查验</span>
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
              <input type="checkbox" v-model="store.data.showSeal" />
              <span>显示学校公章</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showQRCode" />
              <span>显示验证二维码</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="store.data.showRanking" />
              <span>显示专业排名</span>
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
        <h3>成绩单预览</h3>
        <div class="preview-actions">
          <button class="btn-download" @click="showDownloadPanel = true">📥 导出</button>
        </div>
      </div>
      <div class="preview-container">
        <div ref="previewRef" class="preview-wrapper">
          <SchoolTranscriptPreview />
        </div>
      </div>
      <DownloadPanel
        :visible="showDownloadPanel"
        :preview-selector="'.preview-container .preview-wrapper'"
        :default-file-name="`Transcript_${store.data.studentId || Date.now()}`"
        :default-format="'png'"
        :default-quality="3"
        @close="showDownloadPanel = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSchoolTranscriptStore, courseTypes, educationLevels } from '@/stores/schoolTranscript'
import SchoolTranscriptPreview from '@/components/SchoolTranscriptPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import StudentDocumentPicker from '@/components/StudentDocumentPicker.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useSchoolTranscriptStore()
const activeTab = ref('school')
const previewRef = ref<HTMLElement | null>(null)
const courseFileInput = ref<HTMLInputElement | null>(null)
const showDownloadPanel = ref(false)
const importMessage = ref('')
const importMessageType = ref<'success' | 'error' | 'info'>('info')
const showPhotoLibrary = ref(false)

// 照片库
const photoLibrary = [
  '/photos/student1.jpg',
  '/photos/student2.jpg',
  '/photos/student3.jpg',
  '/photos/student4.jpg',
]

// 处理照片上传
const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.data.studentPhoto = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 从照片库选择照片
const selectPhoto = (photo: string) => {
  store.data.studentPhoto = photo
  showPhotoLibrary.value = false
}

// 处理照片选择（从PhotoSelector组件）
const handlePhotoSelected = (photo: any) => {
  // photo 可能是 MediaItem 对象或字符串
  if (typeof photo === 'string') {
    store.data.studentPhoto = photo
  } else if (photo && photo.url) {
    store.data.studentPhoto = photo.url
  }
}

// 使用 store 中的设计设置
const designSettings = store.designSettings

// 下载课程模板
const downloadCourseTemplate = async () => {
  const XLSX = await import('xlsx')
  const data = [
    ['课程代码', '课程名称(中文)', '课程名称(英文)', '学分', '学时', '成绩', '学期', '课程类型'],
    ['CS101', '计算机导论', 'Introduction to Computer Science', '3', '48', '92', '2020-2021-1', '必修'],
    ['MATH101', '高等数学', 'Advanced Mathematics', '4', '64', '88', '2020-2021-1', '必修'],
    ['ENG101', '大学英语', 'College English', '2', '32', '85', '2020-2021-1', '必修'],
    ['', '', '', '', '', '', '', ''],
    ['说明：'],
    ['1. 课程代码：必填，如 CS101'],
    ['2. 课程名称(中文)：必填'],
    ['3. 课程名称(英文)：选填'],
    ['4. 学分：必填，数字'],
    ['5. 学时：选填，数字'],
    ['6. 成绩：必填，数字（0-100）'],
    ['7. 学期：必填，格式如 2020-2021-1'],
    ['8. 课程类型：必修/选修/公共基础/专业核心/实践']
  ]
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 35 }, { wch: 8 },
    { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 12 }
  ]
  XLSX.utils.book_append_sheet(wb, ws, '课程成绩模板')
  XLSX.writeFile(wb, '国内成绩单课程导入模板.xlsx')
}

// 处理从资料管理选择的文档
async function handleDocumentSelect(document: any) {
  if (!document) return
  
  try {
    if (document.file_url) {
      importMessage.value = '正在解析文档...'
      importMessageType.value = 'info'
      
      // 下载并解析文件
      const response = await fetch(document.file_url)
      const blob = await response.blob()
      const file = new File([blob], document.file_name || 'document', { type: blob.type })
      
      // 模拟事件对象来复用现有的处理函数
      const fakeEvent = {
        target: { 
          files: [file],
          value: ''
        }
      } as unknown as Event
      
      await handleCourseImport(fakeEvent)
    } else {
      importMessage.value = '该文档没有可解析的文件'
      importMessageType.value = 'error'
    }
  } catch (e) {
    console.error('处理文档失败:', e)
    importMessage.value = '解析文档失败，请确保文件格式正确'
    importMessageType.value = 'error'
  }
}

// 触发课程导入
const triggerCourseImport = () => {
  courseFileInput.value?.click()
}

// 处理课程导入
const handleCourseImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    importMessage.value = '正在解析文件...'
    importMessageType.value = 'info'

    const XLSX = await import('xlsx')
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    // 跳过表头
    const dataRows = jsonData.slice(1).filter(row => row[0] && row[1] && row[5])
    
    const courseTypeMap: Record<string, string> = {
      '必修': 'required', '选修': 'elective', '公共基础': 'general',
      '专业核心': 'core', '实践': 'practice'
    }

    const importedCourses = dataRows.map((row, index) => ({
      id: Date.now() + index,
      code: String(row[0] || ''),
      name: String(row[1] || ''),
      nameEn: String(row[2] || ''),
      credits: Number(row[3]) || 3,
      hours: Number(row[4]) || 48,
      score: Number(row[5]) || 0,
      gradePoint: store.calculateGradePoint(Number(row[5]) || 0),
      semester: String(row[6] || ''),
      courseType: courseTypeMap[String(row[7])] || 'required'
    }))

    if (importedCourses.length > 0) {
      store.data.courses.push(...importedCourses)
      importMessage.value = `✅ 成功导入 ${importedCourses.length} 门课程！`
      importMessageType.value = 'success'
      setTimeout(() => { importMessage.value = '' }, 3000)
    } else {
      importMessage.value = '❌ 未能识别有效的课程数据'
      importMessageType.value = 'error'
    }
  } catch (error) {
    importMessage.value = '❌ 文件解析失败，请检查文件格式'
    importMessageType.value = 'error'
  }

  if (target) target.value = ''
}

const tabs = [
  { id: 'school', label: '学校', icon: '🏫' },
  { id: 'student', label: '学生', icon: '👤' },
  { id: 'courses', label: '课程', icon: '📚' },
  { id: 'summary', label: '汇总', icon: '📊' },
  { id: 'design', label: '设计', icon: '🎨' },
  { id: 'settings', label: '设置', icon: '⚙️' }
]

const templates = [
  { value: 'official', label: '官方风格', icon: '📜' },
  { value: 'modern', label: '现代风格', icon: '✨' },
  { value: 'bilingual', label: '双语风格', icon: '🌐' }
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
      store.data.schoolLogo = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 上传印章图片
const handleStampUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      designSettings.stampImage = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 上传签章图片
const handleSignatureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      designSettings.signatureImage = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 上传二维码图片
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
.school-transcript-view {
  display: flex;
  height: 100%;
  gap: 24px;
  padding: 24px;
  background: var(--bg-secondary);
}

.edit-panel {
  flex: 5.5;
  min-width: 0;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.panel-header h2 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

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
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 6px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--bg-primary);
}

.tab-btn.active {
  background: var(--bg-primary);
  color: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-icon {
  font-size: 1rem;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

/* 学生照片样式 */
.photo-section {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.photo-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.photo-preview-box {
  width: 100px;
  height: 130px;
  flex-shrink: 0;
}

.photo-preview {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--primary-color);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-photo {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.placeholder-icon {
  font-size: 24px;
  opacity: 0.6;
}

.placeholder-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.photo-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-upload, .btn-library {
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload:hover, .btn-library:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.photo-library {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.library-item {
  aspect-ratio: 3/4;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.library-item:hover {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.library-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.section-header h3 {
  margin: 0;
  padding: 0;
  border: 0;
}

.btn-add {
  padding: 8px 16px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-row.four-col {
  grid-template-columns: repeat(4, 1fr);
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.form-group input.computed {
  background: #f0f0f0;
  color: #666;
}

.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn input {
  flex: 1;
}

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
  flex-wrap: wrap;
}

.quick-btns button {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.quick-btns button:hover {
  border-color: var(--primary-color);
}

.course-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.course-index {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

.btn-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
}

.empty-courses {
  text-align: center;
  padding: 32px;
  color: var(--text-tertiary);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.card-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.card-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
}

.card-value.highlight {
  color: var(--primary-color);
}

.template-btns,
.language-btns {
  display: flex;
  gap: 10px;
}

.template-btn,
.lang-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.template-btn.active,
.lang-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  color: var(--primary-color);
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}

.radio-group input[type="radio"] {
  width: 16px;
  height: 16px;
  margin: 0;
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

.btn-reset:hover {
  background: #fee2e2;
  color: #dc2626;
}

.preview-panel {
  flex: 4.5;
  min-width: 0;
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

.preview-header h3 {
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

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
  align-items: flex-start;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  overflow: auto;
}

/* 导入功能样式 */
.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-template,
.btn-import {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-template:hover {
  background: #e0f2fe;
  border-color: #0ea5e9;
  color: #0ea5e9;
}

.btn-import:hover {
  background: #dcfce7;
  border-color: #22c55e;
  color: #22c55e;
}

.import-message {
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.import-message.success {
  background: #dcfce7;
  color: #166534;
}

.import-message.error {
  background: #fee2e2;
  color: #dc2626;
}

.import-message.info {
  background: #e0f2fe;
  color: #0369a1;
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

/* 签名控件样式 */
.signature-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group input {
  flex: 1;
}

.upload-option {
  background: var(--bg-secondary);
  padding: 8px;
  border-radius: 6px;
}

.toggle-label-small {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-bottom: 4px;
}

.mini-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.preview-small {
  position: relative;
  width: 60px;
  height: 30px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.preview-small img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-small button {
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.btn-icon:hover {
  background: var(--bg-secondary);
}
</style>
