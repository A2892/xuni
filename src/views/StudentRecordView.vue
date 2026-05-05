<template>
  <div class="student-record-view">
    <div class="view-container">
      <div class="content-grid">
        <!-- Left Form Panel -->
        <div class="form-panel">
          <div class="tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'basic' }]"
              @click="activeTab = 'basic'"
            >
              基本信息
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'education' }]"
              @click="activeTab = 'education'"
            >
              学业信息
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'honors' }]"
              @click="activeTab = 'honors'"
            >
              荣誉奖励
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'other' }]"
              @click="activeTab = 'other'"
            >
              其他信息
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'design' }]"
              @click="activeTab = 'design'"
            >
              设计选项
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'download' }]"
              @click="activeTab = 'download'"
            >
              下载
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'save' }]"
              @click="activeTab = 'save'"
            >
              保存/加载
            </button>
          </div>

          <!-- 基本信息 -->
          <div v-show="activeTab === 'basic'" class="form-section">
            <h3>基本信息</h3>
            <div class="form-group">
              <label>学校Logo</label>
              <div class="upload-area">
                <input type="file" accept="image/*" style="display: none" id="logo-upload" @change="handleLogoUpload" />
                <label for="logo-upload" class="upload-btn">🏫 上传学校Logo</label>
                <p v-if="logoPreview" class="upload-hint">已上传Logo</p>
              </div>
            </div>
            <div class="form-group">
              <label>大学名称（英文）*</label>
              <input type="text" v-model="universityName" placeholder="UNIVERSITY OF OXFORD" class="input-field" />
            </div>
            <div class="form-group">
              <label>姓名（中文）*</label>
              <input type="text" v-model="chineseName" placeholder="张三" class="input-field" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>英文名 *</label>
                <input type="text" v-model="englishFirstName" placeholder="John" class="input-field" />
              </div>
              <div class="form-group">
                <label>英文姓 *</label>
                <input type="text" v-model="englishLastName" placeholder="Smith" class="input-field" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>性别</label>
                <select v-model="gender" class="input-field">
                  <option value="Male">男</option>
                  <option value="Female">女</option>
                  <option value="Other">其他</option>
                </select>
              </div>
              <div class="form-group">
                <label>出生日期</label>
                <input type="date" v-model="birthDate" class="input-field" />
              </div>
            </div>
            <div class="form-group">
              <label>国籍</label>
              <input type="text" v-model="nationality" placeholder="中国" class="input-field" />
            </div>
            <div class="form-group">
              <label>出生地</label>
              <input type="text" v-model="birthPlace" placeholder="北京市" class="input-field" />
            </div>
            <div class="form-group">
              <label>护照/身份证号</label>
              <input type="text" v-model="idNumber" placeholder="110101200001011234" class="input-field" />
            </div>
            <div class="form-group">
              <label>民族</label>
              <input type="text" v-model="ethnicity" placeholder="汉族" class="input-field" />
            </div>
            <div class="form-group">
              <label>政治面貌</label>
              <select v-model="politicalStatus" class="input-field">
                <option>群众</option>
                <option>共青团员</option>
                <option>中共党员</option>
                <option>民主党派</option>
              </select>
            </div>
            <div class="form-group">
              <label>学生照片</label>
              <div class="upload-area">
                <input type="file" accept="image/*" style="display: none" id="photo-upload" @change="handlePhotoUpload" />
                <label for="photo-upload" class="upload-btn">📷 上传照片</label>
                <p v-if="photoPreview" class="upload-hint">已上传照片</p>
              </div>
            </div>
          </div>

          <!-- 学业信息 -->
          <div v-show="activeTab === 'education'" class="form-section">
            <h3>学业信息</h3>
            <div class="form-group">
              <label>学号</label>
              <input type="text" v-model="studentId" placeholder="2024001001" class="input-field" />
            </div>
            <div class="form-group">
              <label>学院</label>
              <input type="text" v-model="faculty" placeholder="工程学院" class="input-field" />
            </div>
            <div class="form-group">
              <label>系/专业</label>
              <input type="text" v-model="department" placeholder="计算机科学" class="input-field" />
            </div>
            <div class="form-group">
              <label>学位课程</label>
              <input type="text" v-model="programme" placeholder="计算机科学学士" class="input-field" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>学位级别</label>
                <select v-model="studyLevel" class="input-field">
                  <option>本科</option>
                  <option>硕士（授课型）</option>
                  <option>硕士（研究型）</option>
                  <option>博士</option>
                </select>
              </div>
              <div class="form-group">
                <label>年级</label>
                <select v-model="yearLevel" class="input-field">
                  <option>一年级</option>
                  <option>二年级</option>
                  <option>三年级</option>
                  <option>四年级</option>
                  <option>毕业班</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>入学日期</label>
                <input type="date" v-model="entryDate" class="input-field" />
              </div>
              <div class="form-group">
                <label>预计毕业</label>
                <input type="date" v-model="expectedGraduation" class="input-field" />
              </div>
            </div>
            <div class="form-group">
              <label>学习形式</label>
              <select v-model="studyMode" class="input-field">
                <option>全日制</option>
                <option>非全日制</option>
              </select>
            </div>
            <div class="form-group">
              <label>导师/辅导员</label>
              <input type="text" v-model="advisor" placeholder="李教授" class="input-field" />
            </div>
            <div class="form-group">
              <label>毕业学校</label>
              <input type="text" v-model="previousSchool" placeholder="某某中学" class="input-field" />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input type="tel" v-model="phone" placeholder="138****1234" class="input-field" />
            </div>
            <div class="form-group">
              <label>电子邮箱</label>
              <input type="email" v-model="email" placeholder="student@university.edu" class="input-field" />
            </div>
          </div>

          <!-- 荣誉奖励 -->
          <div v-show="activeTab === 'honors'" class="form-section">
            <h3>荣誉与奖励</h3>
            <div class="form-group">
              <label>奖学金记录</label>
              <textarea rows="4" v-model="scholarships" placeholder="2023-2024学年 国家奖学金&#10;2022-2023学年 校级一等奖学金&#10;2021-2022学年 企业奖学金" class="input-field"></textarea>
            </div>
            <div class="form-group">
              <label>荣誉称号</label>
              <textarea rows="3" v-model="honors" placeholder="2024年 优秀学生干部&#10;2023年 三好学生&#10;2022年 优秀团员" class="input-field"></textarea>
            </div>
            <div class="form-group">
              <label>竞赛获奖</label>
              <textarea rows="4" v-model="competitions" placeholder="2024年 全国大学生数学建模竞赛一等奖&#10;2023年 ACM程序设计大赛银奖&#10;2023年 英语演讲比赛二等奖" class="input-field"></textarea>
            </div>
            <div class="form-group">
              <label>学术成果</label>
              <textarea rows="3" v-model="academicAchievements" placeholder="发表论文、专利、项目等" class="input-field"></textarea>
            </div>

            <div class="subsection-title">任职情况</div>
            <div class="form-group">
              <label>校内任职</label>
              <textarea rows="3" v-model="campusPositions" placeholder="2023-2024 学生会主席&#10;2022-2023 班级学习委员&#10;2021-2022 社团技术部部长" class="input-field"></textarea>
            </div>
            <div class="form-group">
              <label>社会实践</label>
              <textarea rows="3" v-model="socialPractice" placeholder="2024年暑期 某某科技公司实习&#10;2023年暑期 支教志愿者&#10;2023年 社区志愿服务100小时" class="input-field"></textarea>
            </div>
          </div>

          <!-- 其他信息 -->
          <div v-show="activeTab === 'other'" class="form-section">
            <h3>其他信息</h3>
            
            <div class="subsection-title">个人介绍</div>
            <div class="form-group">
              <label>自我评价</label>
              <textarea rows="4" v-model="selfAssessment" placeholder="性格特点、兴趣爱好、特长等" class="input-field"></textarea>
            </div>
            <div class="form-group">
              <label>职业规划</label>
              <textarea rows="3" v-model="careerPlan" placeholder="未来发展方向和目标" class="input-field"></textarea>
            </div>

            <div class="subsection-title">技能专长</div>
            <div class="form-group">
              <label>专业技能</label>
              <textarea rows="3" v-model="technicalSkills" placeholder="编程语言：Python、Java、C++&#10;工具软件：Photoshop、AutoCAD&#10;其他技能：数据分析、机器学习" class="input-field"></textarea>
            </div>
            <div class="form-group">
              <label>语言能力</label>
              <textarea rows="2" v-model="languageSkills" placeholder="英语：CET-6（600分）雅思7.5&#10;日语：N2" class="input-field"></textarea>
            </div>
            <div class="form-group">
              <label>证书资格</label>
              <textarea rows="3" v-model="certifications" placeholder="驾驶证 C1&#10;计算机二级证书&#10;会计从业资格证" class="input-field"></textarea>
            </div>

            <div class="subsection-title">紧急联系人</div>
            <div class="form-group">
              <label>联系人姓名</label>
              <input type="text" v-model="emergencyName" placeholder="张父/李母" class="input-field" />
            </div>
            <div class="form-group">
              <label>关系</label>
              <input type="text" v-model="emergencyRelation" placeholder="父亲/母亲" class="input-field" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>联系电话</label>
                <input type="tel" v-model="emergencyPhone" placeholder="139****5678" class="input-field" />
              </div>
              <div class="form-group">
                <label>电子邮箱</label>
                <input type="email" v-model="emergencyEmail" placeholder="parent@email.com" class="input-field" />
              </div>
            </div>
            <div class="form-group">
              <label>家庭住址</label>
              <textarea rows="2" v-model="emergencyAddress" placeholder="北京市朝阳区某某街道某某小区" class="input-field"></textarea>
            </div>

            <div class="subsection-title">官印设置</div>
            <div class="form-group">
              <label>官印类别</label>
              <select v-model="sealType" class="input-field">
                <option value="">无</option>
                <option>All Packers</option>
                <option>Classic Seal</option>
                <option>Modern Emblem</option>
                <option>Traditional Crest</option>
                <option>Academic Shield</option>
                <option>University Seal</option>
                <option>Official Stamp</option>
              </select>
            </div>
            <div v-if="sealType" class="form-group">
              <label>官印文字</label>
              <input type="text" v-model="sealText" placeholder="请输入官印显示的文字" class="input-field" />
            </div>
            <div v-if="sealType" class="form-group">
              <label>上传官印图片</label>
              <div class="upload-area">
                <input type="file" accept="image/*" style="display: none" id="seal-upload" @change="handleSealUpload" />
                <label for="seal-upload" class="upload-btn">📜 上传官印</label>
                <p v-if="sealImage" class="upload-hint">已上传官印</p>
                <span class="upload-hint">推荐尺寸：100x100像素</span>
              </div>
            </div>

            <div class="subsection-title">档案信息</div>
            <div class="form-row">
              <div class="form-group">
                <label>档案编号</label>
                <input type="text" v-model="recordNumber" placeholder="SR-2024-0001" class="input-field" />
              </div>
              <div class="form-group">
                <label>签发日期</label>
                <input type="date" v-model="dateIssued" class="input-field" />
              </div>
            </div>
          </div>

          <!-- 设计选项 -->
          <div v-show="activeTab === 'design'" class="form-section">
            <h3>颜色和背景设置</h3>
            <div class="form-row">
              <div class="form-group">
                <label>标题颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.titleColor" class="input-field" />
                  <input type="text" v-model="designSettings.titleColor" class="input-field" />
                </div>
              </div>
              <div class="form-group">
                <label>文字颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.textColor" class="input-field" />
                  <input type="text" v-model="designSettings.textColor" class="input-field" />
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>背景颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.bgColor" class="input-field" />
                  <input type="text" v-model="designSettings.bgColor" class="input-field" />
                </div>
              </div>
              <div class="form-group">
                <label>表头颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.headerColor" class="input-field" />
                  <input type="text" v-model="designSettings.headerColor" class="input-field" />
                </div>
              </div>
            </div>

            <div class="subsection-title">字体设置</div>
            <div class="form-group">
              <label>字体</label>
              <select v-model="designSettings.fontFamily" class="input-field">
                <option>Arial</option>
                <option>Times New Roman</option>
                <option>Georgia</option>
                <option>Helvetica</option>
              </select>
            </div>

            <div class="subsection-title">边框设置</div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="designSettings.borderEnabled" />
                <span>启用边框</span>
              </label>
            </div>
            <div v-if="designSettings.borderEnabled" class="form-row">
              <div class="form-group">
                <label>边框颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.borderColor" class="input-field" />
                  <input type="text" v-model="designSettings.borderColor" class="input-field" />
                </div>
              </div>
              <div class="form-group">
                <label>边框宽度</label>
                <select v-model.number="designSettings.borderWidth" class="input-field">
                  <option :value="1">1px</option>
                  <option :value="2">2px</option>
                  <option :value="3">3px</option>
                  <option :value="4">4px</option>
                  <option :value="5">5px</option>
                </select>
              </div>
            </div>
            <div v-if="designSettings.borderEnabled" class="form-group">
              <label>边框样式</label>
              <select v-model="designSettings.borderStyle" class="input-field">
                <option value="solid">实线</option>
                <option value="dashed">虚线</option>
                <option value="dotted">点线</option>
                <option value="double">双线</option>
              </select>
            </div>

            <div class="subsection-title">水印设置</div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="designSettings.watermarkEnabled" />
                <span>启用水印</span>
              </label>
            </div>
            <div v-if="designSettings.watermarkEnabled" class="form-group">
              <label>水印文本</label>
              <input type="text" v-model="designSettings.watermarkText" placeholder="OFFICIAL DOCUMENT" class="input-field" />
            </div>
            <div v-if="designSettings.watermarkEnabled" class="form-row">
              <div class="form-group">
                <label>水印字体</label>
                <select v-model="designSettings.watermarkFontFamily" class="input-field">
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Georgia</option>
                  <option>Helvetica</option>
                </select>
              </div>
              <div class="form-group">
                <label>水印颜色</label>
                <div class="color-input">
                  <input type="color" v-model="designSettings.watermarkColor" class="input-field" />
                  <input type="text" v-model="designSettings.watermarkColor" class="input-field" />
                </div>
              </div>
            </div>
            <div v-if="designSettings.watermarkEnabled" class="form-group">
              <label>水印大小 ({{ designSettings.watermarkSize }}px)</label>
              <input type="range" min="20" max="120" v-model.number="designSettings.watermarkSize" class="input-field" />
            </div>
            <div v-if="designSettings.watermarkEnabled" class="form-group">
              <label>水印透明度 ({{ designSettings.watermarkOpacity }}%)</label>
              <input type="range" min="5" max="50" v-model.number="designSettings.watermarkOpacity" class="input-field" />
            </div>
            <div v-if="designSettings.watermarkEnabled" class="form-group">
              <label>水印角度 ({{ designSettings.watermarkAngle }}°)</label>
              <input type="range" min="-45" max="45" v-model.number="designSettings.watermarkAngle" class="input-field" />
            </div>
            <div v-if="designSettings.watermarkEnabled" class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="designSettings.fullScreenWatermark" />
                <span>全屏水印</span>
              </label>
            </div>
            <div v-if="designSettings.watermarkEnabled && designSettings.fullScreenWatermark" class="form-row">
              <div class="form-group">
                <label>水平间距 ({{ designSettings.watermarkSpacingX }}px)</label>
                <input type="range" min="50" max="200" v-model.number="designSettings.watermarkSpacingX" class="input-field" />
              </div>
              <div class="form-group">
                <label>垂直间距 ({{ designSettings.watermarkSpacingY }}px)</label>
                <input type="range" min="30" max="150" v-model.number="designSettings.watermarkSpacingY" class="input-field" />
              </div>
            </div>
          </div>

          <!-- 下载 -->
          <div v-show="activeTab === 'download'" class="form-section">
            <h3>导出格式</h3>
            <div class="form-group">
              <label>文件格式</label>
              <select v-model="designSettings.exportFormat" class="input-field">
                <option value="PNG">PNG图片</option>
                <option value="PDF">PDF文档</option>
              </select>
            </div>
            <div class="form-group">
              <label>导出质量</label>
              <select v-model="designSettings.exportQuality" class="input-field">
                <option>标准质量 (较小文件)</option>
                <option>高清质量</option>
                <option>超高清 (推荐)</option>
                <option>最高质量 (大文件)</option>
              </select>
            </div>
            <button class="btn-primary" @click="downloadRecord">⬇ 下载学生档案</button>
          </div>

          <!-- 保存/加载 -->
          <div v-show="activeTab === 'save'" class="form-section">
            <SaveLoadPanel 
              document-type="student-record"
              :get-data="getRecordData"
              :set-data="setRecordData"
            />
          </div>

          <button v-if="activeTab !== 'design' && activeTab !== 'download' && activeTab !== 'save'" class="btn-primary">生成学生档案</button>
        </div>

        <!-- Right Preview Panel -->
        <div class="preview-panel">
          <div 
            class="record-preview" 
            :style="{
              fontFamily: designSettings.fontFamily,
              color: designSettings.textColor,
              backgroundColor: designSettings.bgColor,
              border: designSettings.borderEnabled ? `${designSettings.borderWidth}px ${designSettings.borderStyle} ${designSettings.borderColor}` : 'none'
            }"
          >
            <!-- 水印 -->
            <div v-if="designSettings.watermarkEnabled" class="watermark-container" :class="{ 'fullscreen': designSettings.fullScreenWatermark }">
              <div 
                v-if="!designSettings.fullScreenWatermark"
                class="watermark-text"
                :style="{
                  fontSize: designSettings.watermarkSize + 'px',
                  color: designSettings.watermarkColor,
                  opacity: designSettings.watermarkOpacity / 100,
                  transform: `rotate(${designSettings.watermarkAngle}deg)`,
                  fontFamily: designSettings.watermarkFontFamily
                }"
              >
                {{ designSettings.watermarkText }}
              </div>
              <div 
                v-else
                class="watermark-repeat"
                :style="{
                  fontSize: designSettings.watermarkSize + 'px',
                  color: designSettings.watermarkColor,
                  opacity: designSettings.watermarkOpacity / 100,
                  '--spacing-x': designSettings.watermarkSpacingX + 'px',
                  '--spacing-y': designSettings.watermarkSpacingY + 'px',
                  transform: `rotate(${designSettings.watermarkAngle}deg)`,
                  fontFamily: designSettings.watermarkFontFamily
                }"
              >
                <span v-for="i in 50" :key="i" class="watermark-item">{{ designSettings.watermarkText }}</span>
              </div>
            </div>

            <!-- 页眉和照片整合布局 -->
            <div class="header-with-photo">
              <div class="university-header-compact" :style="{ borderBottomColor: designSettings.titleColor }">
                <div class="university-crest">
                  <img v-if="logoPreview" :src="logoPreview" alt="School Logo" class="uploaded-logo" />
                  <svg v-else viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                    <!-- Shield outline -->
                    <path d="M60 10 L95 25 L95 55 Q95 85 60 110 Q25 85 25 55 L25 25 Z" 
                          fill="#003d82" stroke="#d4af37" stroke-width="3"/>
                    <!-- Inner shield -->
                    <path d="M60 20 L85 30 L85 55 Q85 78 60 95 Q35 78 35 55 L35 30 Z" 
                          fill="#fff" opacity="0.15"/>
                    <!-- Book -->
                    <rect x="45" y="45" width="30" height="35" fill="#d4af37" rx="2"/>
                    <line x1="60" y1="45" x2="60" y2="80" stroke="#003d82" stroke-width="2"/>
                    <line x1="45" y1="55" x2="75" y2="55" stroke="#003d82" stroke-width="1" opacity="0.5"/>
                    <line x1="45" y1="62" x2="75" y2="62" stroke="#003d82" stroke-width="1" opacity="0.5"/>
                    <line x1="45" y1="69" x2="75" y2="69" stroke="#003d82" stroke-width="1" opacity="0.5"/>
                    <!-- Crown -->
                    <path d="M50 35 L55 40 L60 32 L65 40 L70 35 L70 43 L50 43 Z" 
                          fill="#d4af37" stroke="#003d82" stroke-width="1"/>
                    <!-- Stars -->
                    <text x="38" y="40" fill="#d4af37" font-size="8">★</text>
                    <text x="78" y="40" fill="#d4af37" font-size="8">★</text>
                  </svg>
                </div>
                <h2 class="university-name" :style="{ color: designSettings.titleColor }">{{ universityName }}</h2>
                <p class="document-type" :style="{ color: designSettings.textColor }">STUDENT RECORD</p>
              </div>

              <div class="photo-placeholder-compact">
                <img v-if="photoPreview" :src="photoPreview" alt="Student Photo" class="uploaded-photo" />
                <template v-else>
                  <span>📷</span>
                  <p>PHOTO</p>
                </template>
              </div>
            </div>

            <div class="record-section">
              <h3 class="section-title" :style="{ color: designSettings.titleColor, borderLeftColor: designSettings.titleColor }">I. PERSONAL INFORMATION</h3>
              <table class="info-table">
                <tr>
                  <td class="label">Full Name:</td>
                  <td class="value">{{ chineseName }} ({{ englishFirstName }} {{ englishLastName }})</td>
                  <td class="label">Gender:</td>
                  <td class="value">{{ gender }}</td>
                </tr>
                <tr>
                  <td class="label">Date of Birth:</td>
                  <td class="value">{{ formatDate(birthDate) }}</td>
                  <td class="label">Ethnicity:</td>
                  <td class="value">{{ ethnicity }}</td>
                </tr>
                <tr>
                  <td class="label">Nationality:</td>
                  <td class="value">{{ nationality }}</td>
                  <td class="label">Place of Birth:</td>
                  <td class="value">{{ birthPlace }}</td>
                </tr>
                <tr>
                  <td class="label">ID Number:</td>
                  <td class="value" colspan="3">{{ idNumber }}</td>
                </tr>
                <tr>
                  <td class="label">Political Status:</td>
                  <td class="value" colspan="3">{{ translatePolitical(politicalStatus) }}</td>
                </tr>
              </table>
            </div>

            <div class="record-section">
              <h3 class="section-title" :style="{ color: designSettings.titleColor, borderLeftColor: designSettings.titleColor }">II. ACADEMIC INFORMATION</h3>
              <table class="info-table">
                <tr>
                  <td class="label">Student ID:</td>
                  <td class="value">{{ studentId }}</td>
                  <td class="label">Entry Date:</td>
                  <td class="value">{{ formatDate(entryDate) }}</td>
                </tr>
                <tr>
                  <td class="label">Faculty:</td>
                  <td class="value">{{ faculty }}</td>
                  <td class="label">Department:</td>
                  <td class="value">{{ department }}</td>
                </tr>
                <tr>
                  <td class="label">Programme:</td>
                  <td class="value" colspan="3">{{ programme }}</td>
                </tr>
                <tr>
                  <td class="label">Level of Study:</td>
                  <td class="value">{{ translateStudyLevel(studyLevel) }}</td>
                  <td class="label">Year:</td>
                  <td class="value">{{ translateYearLevel(yearLevel) }}</td>
                </tr>
                <tr>
                  <td class="label">Mode of Study:</td>
                  <td class="value">{{ translateStudyMode(studyMode) }}</td>
                  <td class="label">Expected Graduation:</td>
                  <td class="value">{{ formatDate(expectedGraduation) }}</td>
                </tr>
                <tr>
                  <td class="label">Academic Advisor:</td>
                  <td class="value">{{ advisor }}</td>
                  <td class="label">Previous School:</td>
                  <td class="value">{{ previousSchool }}</td>
                </tr>
                <tr>
                  <td class="label">Mobile:</td>
                  <td class="value">{{ phone }}</td>
                  <td class="label">Email:</td>
                  <td class="value">{{ email }}</td>
                </tr>
              </table>
            </div>

            <div class="record-section">
              <h3 class="section-title" :style="{ color: designSettings.titleColor, borderLeftColor: designSettings.titleColor }">III. HONORS & AWARDS</h3>
              <table class="info-table">
                <tr v-if="scholarships">
                  <td class="label">Scholarships:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ scholarships }}</td>
                </tr>
                <tr v-if="honors">
                  <td class="label">Honorary Titles:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ honors }}</td>
                </tr>
                <tr v-if="competitions">
                  <td class="label">Competition Awards:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ competitions }}</td>
                </tr>
                <tr v-if="academicAchievements">
                  <td class="label">Academic Achievements:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ academicAchievements }}</td>
                </tr>
              </table>
            </div>

            <div class="record-section">
              <h3 class="section-title" :style="{ color: designSettings.titleColor, borderLeftColor: designSettings.titleColor }">IV. POSITIONS & ACTIVITIES</h3>
              <table class="info-table">
                <tr v-if="campusPositions">
                  <td class="label">Campus Positions:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ campusPositions }}</td>
                </tr>
                <tr v-if="socialPractice">
                  <td class="label">Social Practice:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ socialPractice }}</td>
                </tr>
              </table>
            </div>

            <div class="record-section">
              <h3 class="section-title" :style="{ color: designSettings.titleColor, borderLeftColor: designSettings.titleColor }">V. SKILLS & QUALIFICATIONS</h3>
              <table class="info-table">
                <tr v-if="technicalSkills">
                  <td class="label">Technical Skills:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ technicalSkills }}</td>
                </tr>
                <tr v-if="languageSkills">
                  <td class="label">Languages:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ languageSkills }}</td>
                </tr>
                <tr v-if="certifications">
                  <td class="label">Certifications:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ certifications }}</td>
                </tr>
              </table>
            </div>

            <div class="record-section" v-if="selfAssessment || careerPlan">
              <h3 class="section-title" :style="{ color: designSettings.titleColor, borderLeftColor: designSettings.titleColor }">VI. PERSONAL STATEMENT</h3>
              <table class="info-table">
                <tr v-if="selfAssessment">
                  <td class="label">Self-Assessment:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ selfAssessment }}</td>
                </tr>
                <tr v-if="careerPlan">
                  <td class="label">Career Goals:</td>
                  <td class="value" colspan="3" style="white-space: pre-line">{{ careerPlan }}</td>
                </tr>
              </table>
            </div>

            <div class="record-section">
              <h3 class="section-title" :style="{ color: designSettings.titleColor, borderLeftColor: designSettings.titleColor }">VII. EMERGENCY CONTACT</h3>
              <table class="info-table">
                <tr>
                  <td class="label">Name:</td>
                  <td class="value">{{ emergencyName }}</td>
                  <td class="label">Relationship:</td>
                  <td class="value">{{ emergencyRelation }}</td>
                </tr>
                <tr>
                  <td class="label">Phone:</td>
                  <td class="value">{{ emergencyPhone }}</td>
                  <td class="label">Email:</td>
                  <td class="value">{{ emergencyEmail }}</td>
                </tr>
                <tr>
                  <td class="label">Address:</td>
                  <td class="value" colspan="3">{{ emergencyAddress }}</td>
                </tr>
              </table>
            </div>

            <div class="record-footer">
              <p class="footer-text">Record Number: {{ recordNumber }}</p>
              <p class="footer-text">Date Issued: {{ formatDate(dateIssued) }}</p>
            </div>
            
            <div class="official-stamp" v-if="sealType && sealType !== '无'">
              <!-- 上传的官印图片优先显示 -->
              <img v-if="sealImage" :src="sealImage" class="uploaded-seal" alt="Official Seal" />
              <!-- All Packers -->
              <svg v-else-if="sealType === 'All Packers'" width="80" height="80" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="28" stroke="#8B4513" stroke-width="2" fill="none" opacity="0.3"/>
                <circle cx="30" cy="30" r="22" stroke="#8B4513" stroke-width="1.5" fill="none" opacity="0.3"/>
                <path d="M20 30 L40 30 M30 20 L30 40" stroke="#8B4513" stroke-width="1.5" opacity="0.3"/>
                <text x="30" y="52" font-size="6" text-anchor="middle" fill="#8B4513" opacity="0.3" font-weight="600">{{ sealText }}</text>
              </svg>
              <!-- Classic Seal -->
              <svg v-else-if="sealType === 'Classic Seal'" width="80" height="80" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="28" stroke="#B8860B" stroke-width="2" fill="none" opacity="0.4"/>
                <polygon points="30,10 35,25 50,25 38,35 43,50 30,40 17,50 22,35 10,25 25,25" stroke="#B8860B" fill="none" stroke-width="1.5" opacity="0.4"/>
                <text x="30" y="8" font-size="5" text-anchor="middle" fill="#B8860B" opacity="0.4" font-weight="600">{{ sealText }}</text>
              </svg>
              <!-- Modern Emblem -->
              <svg v-else-if="sealType === 'Modern Emblem'" width="80" height="80" viewBox="0 0 60 60">
                <rect x="8" y="8" width="44" height="44" rx="5" stroke="#4169E1" stroke-width="2" fill="none" opacity="0.3"/>
                <circle cx="30" cy="30" r="15" stroke="#4169E1" stroke-width="1.5" fill="none" opacity="0.3"/>
                <text x="30" y="33" font-size="6" text-anchor="middle" fill="#4169E1" opacity="0.3" font-weight="600">{{ sealText }}</text>
              </svg>
              <!-- Traditional Crest -->
              <svg v-else-if="sealType === 'Traditional Crest'" width="80" height="80" viewBox="0 0 60 60">
                <path d="M30,10 L45,25 L45,45 L30,55 L15,45 L15,25 Z" stroke="#8B0000" stroke-width="2" fill="none" opacity="0.3"/>
                <circle cx="30" cy="32" r="12" stroke="#8B0000" stroke-width="1.5" fill="none" opacity="0.3"/>
                <text x="30" y="35" font-size="5" text-anchor="middle" fill="#8B0000" opacity="0.3" font-weight="600">{{ sealText }}</text>
              </svg>
              <!-- Academic Shield -->
              <svg v-else-if="sealType === 'Academic Shield'" width="80" height="80" viewBox="0 0 60 60">
                <path d="M30,8 L48,18 L48,35 L30,52 L12,35 L12,18 Z" stroke="#2F4F4F" stroke-width="2" fill="none" opacity="0.3"/>
                <path d="M20 30 L28 38 L40 22" stroke="#2F4F4F" stroke-width="2" fill="none" opacity="0.3"/>
                <text x="30" y="48" font-size="5" text-anchor="middle" fill="#2F4F4F" opacity="0.3" font-weight="600">{{ sealText }}</text>
              </svg>
              <!-- University Seal -->
              <svg v-else-if="sealType === 'University Seal'" width="80" height="80" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="28" stroke="#000080" stroke-width="2.5" fill="none" opacity="0.3"/>
                <circle cx="30" cy="30" r="20" stroke="#000080" stroke-width="1" fill="none" opacity="0.3"/>
                <rect x="25" y="22" width="10" height="16" stroke="#000080" stroke-width="1" fill="none" opacity="0.3"/>
                <text x="30" y="50" font-size="5" text-anchor="middle" fill="#000080" opacity="0.3" font-weight="600">{{ sealText }}</text>
              </svg>
              <!-- Official Stamp -->
              <svg v-else width="80" height="80" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="25" stroke="#DC143C" stroke-width="3" fill="none" opacity="0.3"/>
                <text x="30" y="32" font-size="8" text-anchor="middle" fill="#DC143C" opacity="0.4" font-weight="700">{{ sealText }}</text>
                <text x="30" y="40" font-size="6" text-anchor="middle" fill="#DC143C" opacity="0.4" font-weight="600">STAMP</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'

const activeTab = ref('basic')
const logoPreview = ref('')
const photoPreview = ref('')

// 基本信息
const universityName = ref('UNIVERSITY OF OXFORD')
const chineseName = ref('张三')
const englishFirstName = ref('John')
const englishLastName = ref('Smith')
const gender = ref('Male')
const birthDate = ref('2000-01-01')
const nationality = ref('中国')
const birthPlace = ref('北京市')
const idNumber = ref('110101200001011234')
const ethnicity = ref('汉族')
const politicalStatus = ref('群众')

// 学业信息
const studentId = ref('2024001001')
const faculty = ref('工程学院')
const department = ref('计算机科学')
const programme = ref('计算机科学学士')
const studyLevel = ref('本科')
const yearLevel = ref('一年级')
const entryDate = ref('2024-09-01')
const expectedGraduation = ref('2028-06-30')
const studyMode = ref('全日制')
const advisor = ref('李教授')
const previousSchool = ref('某某中学')
const phone = ref('138****1234')
const email = ref('student@university.edu')

// 荣誉奖励
const scholarships = ref('2023-2024学年 国家奖学金\n2022-2023学年 校级一等奖学金')
const honors = ref('2024年 优秀学生干部\n2023年 三好学生')
const competitions = ref('2024年 全国大学生数学建模竞赛一等奖\n2023年 ACM程序设计大赛银奖')
const academicAchievements = ref('')
const campusPositions = ref('2023-2024 学生会主席\n2022-2023 班级学习委员')
const socialPractice = ref('2024年暑期 某某科技公司实习\n2023年暑期 支教志愿者')

// 其他信息
const selfAssessment = ref('')
const careerPlan = ref('')
const technicalSkills = ref('编程语言：Python、Java、C++')
const languageSkills = ref('英语：CET-6（600分）雅思7.5')
const certifications = ref('驾驶证 C1\n计算机二级证书')
const emergencyName = ref('张父')
const emergencyRelation = ref('父亲')
const emergencyPhone = ref('139****5678')
const emergencyEmail = ref('parent@email.com')
const emergencyAddress = ref('北京市朝阳区某某街道某某小区')

// 官印设置
const sealType = ref('')
const sealText = ref('OFFICIAL SEAL')
const sealImage = ref('')

// 档案信息
const recordNumber = ref('SR-2024-0001')
const dateIssued = ref('2024-12-30')

// 设计设置
const designSettings = ref({
  exportFormat: 'PNG',
  exportQuality: '超高清 (推荐)',
  
  // 颜色设置
  titleColor: '#003d82',
  textColor: '#2c3e50',
  bgColor: '#ffffff',
  headerColor: '#002960',
  
  // 字体设置
  fontFamily: 'Arial',
  
  // 边框设置
  borderEnabled: true,
  borderColor: '#003d82',
  borderStyle: 'solid',
  borderWidth: 3,
  
  // 水印设置
  watermarkEnabled: false,
  watermarkText: 'OFFICIAL DOCUMENT',
  watermarkColor: '#cccccc',
  watermarkSize: 60,
  watermarkOpacity: 15,
  watermarkAngle: -45,
  watermarkFontFamily: 'Arial',
  fullScreenWatermark: false,
  watermarkSpacingX: 100,
  watermarkSpacingY: 80
})

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string
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
      photoPreview.value = e.target?.result as string
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
      sealImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

const translateGender = (g: string) => {
  const map: Record<string, string> = { '男': 'Male', '女': 'Female', '其他': 'Other' }
  return map[g] || g
}

const translatePolitical = (p: string) => {
  const map: Record<string, string> = {
    '群众': 'Non-party Member',
    '共青团员': 'Communist Youth League Member',
    '中共党员': 'Communist Party Member',
    '民主党派': 'Democratic Party Member'
  }
  return map[p] || p
}

const translateStudyLevel = (l: string) => {
  const map: Record<string, string> = {
    '本科': 'Undergraduate',
    '硕士（授课型）': 'Master (Taught)',
    '硕士（研究型）': 'Master (Research)',
    '博士': 'Doctoral'
  }
  return map[l] || l
}

const translateYearLevel = (y: string) => {
  const map: Record<string, string> = {
    '一年级': 'First Year',
    '二年级': 'Second Year',
    '三年级': 'Third Year',
    '四年级': 'Fourth Year',
    '毕业班': 'Final Year'
  }
  return map[y] || y
}

const translateStudyMode = (m: string) => {
  const map: Record<string, string> = {
    '全日制': 'Full-time',
    '非全日制': 'Part-time'
  }
  return map[m] || m
}

const downloadRecord = async () => {
  const element = document.querySelector('.record-preview') as HTMLElement
  if (!element) return

  try {
    const qualitySettings = {
      '标准质量 (较小文件)': { scale: 2, quality: 0.85 },
      '高清质量': { scale: 3, quality: 0.92 },
      '超高清 (推荐)': { scale: 4, quality: 0.95 },
      '最高质量 (大文件)': { scale: 5, quality: 1.0 }
    }
    
    const settings = qualitySettings[designSettings.value.exportQuality as keyof typeof qualitySettings]
    const { default: html2canvas } = await import('html2canvas')

    const canvas = await html2canvas(element, {
      scale: settings.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    if (designSettings.value.exportFormat === 'PDF') {
      const { jsPDF } = await import('jspdf')
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pageWidth = 210 // A4 宽度 mm
      const pageHeight = 297 // A4 高度 mm
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // 如果图片高度小于等于一页，直接添加
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      } else {
        // 需要分页处理
        let heightLeft = imgHeight
        let position = 0
        
        // 添加第一页
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        
        // 添加后续页
        while (heightLeft > 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }
      }
      
      pdf.save(`${chineseName.value}_Student_Record.pdf`)
    } else {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${chineseName.value}_Student_Record.png`
          link.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/png', settings.quality)
    }
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败，请重试')
  }
}

// 保存/加载功能
const getRecordData = () => {
  return {
    // 基本信息
    universityName: universityName.value,
    chineseName: chineseName.value,
    englishFirstName: englishFirstName.value,
    englishLastName: englishLastName.value,
    gender: gender.value,
    birthDate: birthDate.value,
    nationality: nationality.value,
    birthPlace: birthPlace.value,
    idNumber: idNumber.value,
    ethnicity: ethnicity.value,
    politicalStatus: politicalStatus.value,
    logoPreview: logoPreview.value,
    photoPreview: photoPreview.value,
    
    // 学业信息
    studentId: studentId.value,
    faculty: faculty.value,
    department: department.value,
    programme: programme.value,
    studyLevel: studyLevel.value,
    yearLevel: yearLevel.value,
    entryDate: entryDate.value,
    expectedGraduation: expectedGraduation.value,
    studyMode: studyMode.value,
    advisor: advisor.value,
    previousSchool: previousSchool.value,
    phone: phone.value,
    email: email.value,
    
    // 荣誉奖励
    scholarships: scholarships.value,
    honors: honors.value,
    competitions: competitions.value,
    academicAchievements: academicAchievements.value,
    campusPositions: campusPositions.value,
    socialPractice: socialPractice.value,
    
    // 其他信息
    technicalSkills: technicalSkills.value,
    languageSkills: languageSkills.value,
    certifications: certifications.value,
    selfAssessment: selfAssessment.value,
    careerPlan: careerPlan.value,
    emergencyName: emergencyName.value,
    emergencyRelation: emergencyRelation.value,
    emergencyPhone: emergencyPhone.value,
    emergencyEmail: emergencyEmail.value,
    emergencyAddress: emergencyAddress.value,
    
    // 印章设置
    sealType: sealType.value,
    sealText: sealText.value,
    
    // 档案信息
    recordNumber: recordNumber.value,
    dateIssued: dateIssued.value,
    
    // 设计设置
    designSettings: designSettings.value
  }
}

const setRecordData = (data: any) => {
  if (!data) return
  
  // 基本信息
  if (data.universityName) universityName.value = data.universityName
  if (data.chineseName) chineseName.value = data.chineseName
  if (data.englishFirstName) englishFirstName.value = data.englishFirstName
  if (data.englishLastName) englishLastName.value = data.englishLastName
  if (data.gender) gender.value = data.gender
  if (data.birthDate) birthDate.value = data.birthDate
  if (data.nationality) nationality.value = data.nationality
  if (data.birthPlace) birthPlace.value = data.birthPlace
  if (data.idNumber) idNumber.value = data.idNumber
  if (data.ethnicity) ethnicity.value = data.ethnicity
  if (data.politicalStatus) politicalStatus.value = data.politicalStatus
  if (data.logoPreview) logoPreview.value = data.logoPreview
  if (data.photoPreview) photoPreview.value = data.photoPreview
  
  // 学业信息
  if (data.studentId) studentId.value = data.studentId
  if (data.faculty) faculty.value = data.faculty
  if (data.department) department.value = data.department
  if (data.programme) programme.value = data.programme
  if (data.studyLevel) studyLevel.value = data.studyLevel
  if (data.yearLevel) yearLevel.value = data.yearLevel
  if (data.entryDate) entryDate.value = data.entryDate
  if (data.expectedGraduation) expectedGraduation.value = data.expectedGraduation
  if (data.studyMode) studyMode.value = data.studyMode
  if (data.advisor) advisor.value = data.advisor
  if (data.previousSchool) previousSchool.value = data.previousSchool
  if (data.phone) phone.value = data.phone
  if (data.email) email.value = data.email
  
  // 荣誉奖励
  if (data.scholarships) scholarships.value = data.scholarships
  if (data.honors) honors.value = data.honors
  if (data.competitions) competitions.value = data.competitions
  if (data.academicAchievements) academicAchievements.value = data.academicAchievements
  if (data.campusPositions) campusPositions.value = data.campusPositions
  if (data.socialPractice) socialPractice.value = data.socialPractice
  
  // 其他信息
  if (data.technicalSkills) technicalSkills.value = data.technicalSkills
  if (data.languageSkills) languageSkills.value = data.languageSkills
  if (data.certifications) certifications.value = data.certifications
  if (data.selfAssessment) selfAssessment.value = data.selfAssessment
  if (data.careerPlan) careerPlan.value = data.careerPlan
  if (data.emergencyName) emergencyName.value = data.emergencyName
  if (data.emergencyRelation) emergencyRelation.value = data.emergencyRelation
  if (data.emergencyPhone) emergencyPhone.value = data.emergencyPhone
  if (data.emergencyEmail) emergencyEmail.value = data.emergencyEmail
  if (data.emergencyAddress) emergencyAddress.value = data.emergencyAddress
  
  // 印章设置
  if (data.sealType) sealType.value = data.sealType
  if (data.sealText) sealText.value = data.sealText
  
  // 档案信息
  if (data.recordNumber) recordNumber.value = data.recordNumber
  if (data.dateIssued) dateIssued.value = data.dateIssued
  
  // 设计设置
  if (data.designSettings) {
    Object.assign(designSettings.value, data.designSettings)
  }
}
</script>

<style scoped>
.student-record-view {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.view-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* page-header removed */

.content-grid {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: 24px;
}

.form-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: #003d82;
  background: #f8f9fa;
}

.tab-btn.active {
  color: #003d82;
  font-weight: 600;
  border-bottom-color: #003d82;
  background: #f0f4f8;
}

.form-section {
  padding: 24px;
  max-height: 600px;
  overflow-y: auto;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}

.input-field, textarea.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
  resize: vertical;
}

.input-field:focus, textarea.input-field:focus {
  outline: none;
  border-color: #003d82;
  box-shadow: 0 0 0 3px rgba(0, 61, 130, 0.1);
}

.subsection-title {
  font-size: 14px;
  font-weight: 700;
  color: #003d82;
  margin: 24px 0 16px 0;
  padding-top: 16px;
  border-top: 2px solid #eee;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.upload-area {
  margin-top: 8px;
}

.upload-btn {
  display: inline-block;
  padding: 10px 20px;
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-btn:hover {
  border-color: #003d82;
  color: #003d82;
  background: #f0f4f8;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  margin: 0 24px 24px 24px;
  width: calc(100% - 48px);
  background: linear-gradient(135deg, #003d82, #002147);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 61, 130, 0.4);
}

.preview-panel {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-height: 850px;
  overflow-y: auto;
}

.uploaded-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-hint {
  font-size: 12px;
  color: #27ae60;
  margin-top: 8px;
  margin-bottom: 0;
}

.uploaded-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record-preview {
  max-width: 850px;
  margin: 0 auto;
  padding: 80px 70px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04);
  position: relative;
}

/* 页眉和照片整合布局 */
.header-with-photo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 24px;
  border-bottom: 2px solid #003d82;
}

.university-header-compact {
  flex: 1;
  text-align: center;
  padding-right: 30px;
}

.university-crest {
  width: 70px;
  height: 70px;
  margin: 0 auto 16px auto;
}

.university-crest svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
}

.uploaded-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 6px 16px rgba(0, 61, 130, 0.3));
}

.university-name {
  font-size: 20px;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  font-weight: 400;
  letter-spacing: 6px;
  text-transform: uppercase;
  line-height: 1.4;
}

.document-type {
  font-size: 10px;
  color: #8a8a8a;
  font-weight: 400;
  letter-spacing: 3px;
  margin: 0;
  text-transform: uppercase;
}

.photo-placeholder-compact {
  width: 100px;
  height: 130px;
  border: 2px solid #003d82;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  flex-shrink: 0;
}

.photo-placeholder-compact .uploaded-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder-compact span {
  font-size: 28px;
  margin-bottom: 4px;
  opacity: 0.4;
}

.photo-placeholder-compact p {
  font-size: 9px;
  color: #999;
  margin: 0;
  letter-spacing: 1px;
}
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 400;
}

.record-section {
  margin-bottom: 48px;
  background: transparent;
  padding: 0;
  border: none;
  padding-bottom: 0;
  overflow: visible;
}

.section-title {
  font-size: 15px !important;
  font-weight: 600;
  margin: 0 0 24px 0;
  padding: 0 0 0 22px;
  background: transparent;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: block;
  position: relative;
  border-left-width: 4px;
  border-left-style: solid;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
  margin-top: 0;
}

.info-table tr {
  border: none;
  transition: none;
}

.info-table tr:hover {
  background-color: transparent;
}

.info-table tr:last-child {
  border-bottom: none;
}

.info-table td {
  padding: 12px 20px 12px 0;
  font-size: 13px;
  vertical-align: top;
  border-bottom: 1px solid #f2f2f2;
  line-height: 1.6;
}

.info-table tr:last-child td {
  border-bottom: none;
}

.info-table .label {
  font-weight: 600;
  width: 165px;
  white-space: nowrap;
  font-size: 12px;
  text-transform: none;
  background: transparent;
  border-right: none;
  letter-spacing: 0.3px;
  opacity: 0.7;
}

.info-table .value {
  font-size: 13px;
  font-weight: 400;
  line-height: 1.7;
  padding-left: 28px;
}

.record-footer {
  margin-top: 55px;
  padding-top: 24px;
  border-top: 1px solid #d8d8d8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-text {
  font-size: 9px;
  color: #9a9a9a;
  margin: 0;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.official-stamp {
  position: absolute;
  bottom: 110px;
  right: 110px;
  opacity: 0.15;
  transform: rotate(-15deg);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
}

.stamp-circle {
  width: 125px;
  height: 125px;
  border: 5px solid #c0392b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 水印样式 */
.watermark-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.watermark-container.fullscreen {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}

.watermark-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  white-space: nowrap;
  user-select: none;
}

.watermark-repeat {
  display: grid;
  width: 100%;
  height: 100%;
  gap: 0;
}

.watermark-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  white-space: nowrap;
  user-select: none;
}

/* 表单控件样式 */
.color-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input input[type="color"] {
  width: 50px;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.color-input input[type="text"] {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.stamp-text {
  font-size: 22px;
  font-weight: 900;
  color: #c0392b;
  letter-spacing: 3px;
  text-align: center;
  line-height: 1.5;
}

.uploaded-seal {
  width: 100px;
  height: 100px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

/* 滚动条样式 */
.form-section::-webkit-scrollbar,
.preview-panel::-webkit-scrollbar {
  width: 6px;
}

.form-section::-webkit-scrollbar-track,
.preview-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.form-section::-webkit-scrollbar-thumb,
.preview-panel::-webkit-scrollbar-thumb {
  background: #003d82;
  border-radius: 3px;
}

.form-section::-webkit-scrollbar-thumb:hover,
.preview-panel::-webkit-scrollbar-thumb:hover {
  background: #002147;
}
</style>
