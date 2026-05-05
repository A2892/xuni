<template>
  <div class="edoc-view">
    <div class="page-header">
      <h1>🪪 电子证件生成器</h1>
      <p class="description">生成健康码、核酸检测、行程卡、身份证、护照等电子证件</p>
    </div>

    <div class="main-content">
      <!-- 左侧编辑面板 -->
      <div class="edit-panel">
        <!-- 证件类型选择 -->
        <div class="doc-type-selector">
          <button 
            v-for="doc in docTypes" 
            :key="doc.id"
            :class="['doc-btn', { active: store.data.docType === doc.id }]"
            @click="store.setDocTypeDefaults(doc.id as any)"
          >
            <span class="doc-icon">{{ doc.icon }}</span>
            <span class="doc-label">{{ doc.label }}</span>
          </button>
        </div>

        <div class="tabs">
          <button 
            v-for="tab in currentTabs" 
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 健康码信息 -->
          <div v-show="activeTab === 'health'" class="form-section">
            <h3>🟢 健康码信息</h3>
            
            <div class="form-group">
              <label>健康码颜色</label>
              <div class="color-options">
                <button 
                  :class="['color-btn green', { active: store.data.healthCodeColor === 'green' }]"
                  @click="store.data.healthCodeColor = 'green'"
                >🟢 绿码</button>
                <button 
                  :class="['color-btn yellow', { active: store.data.healthCodeColor === 'yellow' }]"
                  @click="store.data.healthCodeColor = 'yellow'"
                >🟡 黄码</button>
                <button 
                  :class="['color-btn red', { active: store.data.healthCodeColor === 'red' }]"
                  @click="store.data.healthCodeColor = 'red'"
                >🔴 红码</button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>所在城市</label>
                <input type="text" v-model="store.data.healthCodeCity" />
              </div>
              <div class="form-group">
                <label>所在区域</label>
                <input type="text" v-model="store.data.healthCodeArea" />
              </div>
            </div>

            <div class="form-group">
              <label>更新时间</label>
              <div class="input-with-btn">
                <input type="text" v-model="store.data.lastUpdateTime" />
                <button @click="store.refreshTime()">🔄</button>
              </div>
            </div>
          </div>

          <!-- 核酸检测 -->
          <div v-show="activeTab === 'nucleic'" class="form-section">
            <h3>🧪 核酸检测</h3>
            
            <div class="form-group">
              <label>检测结果</label>
              <div class="result-options">
                <button 
                  :class="['result-btn negative', { active: store.data.nucleicTestResult === 'negative' }]"
                  @click="store.data.nucleicTestResult = 'negative'"
                >阴性 (-)</button>
                <button 
                  :class="['result-btn positive', { active: store.data.nucleicTestResult === 'positive' }]"
                  @click="store.data.nucleicTestResult = 'positive'"
                >阳性 (+)</button>
              </div>
            </div>

            <div class="form-group">
              <label>检测机构</label>
              <input type="text" v-model="store.data.nucleicTestOrg" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>采样时间</label>
                <input type="text" v-model="store.data.nucleicSampleTime" />
              </div>
              <div class="form-group">
                <label>报告时间</label>
                <input type="text" v-model="store.data.nucleicReportTime" />
              </div>
            </div>

            <div class="form-group">
              <label>距今时间（小时）</label>
              <input type="text" v-model="store.data.nucleicHours" />
            </div>
          </div>

          <!-- 疫苗接种 -->
          <div v-show="activeTab === 'vaccine'" class="form-section">
            <h3>💉 疫苗接种</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>接种剂次</label>
                <select v-model.number="store.data.vaccineDoses">
                  <option :value="1">1剂</option>
                  <option :value="2">2剂</option>
                  <option :value="3">3剂</option>
                </select>
              </div>
              <div class="form-group">
                <label>疫苗类型</label>
                <select v-model="store.data.vaccineType">
                  <option v-for="v in vaccineTypes" :key="v" :value="v">{{ v }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>第一剂日期</label>
              <input type="date" v-model="store.data.vaccineDate1" />
            </div>

            <div class="form-group" v-if="store.data.vaccineDoses >= 2">
              <label>第二剂日期</label>
              <input type="date" v-model="store.data.vaccineDate2" />
            </div>

            <div class="form-group" v-if="store.data.vaccineDoses >= 3">
              <label>第三剂日期（加强针）</label>
              <input type="date" v-model="store.data.vaccineDate3" />
            </div>

            <div class="form-group">
              <label>接种单位</label>
              <input type="text" v-model="store.data.vaccineOrg" />
            </div>
          </div>

          <!-- 行程卡 -->
          <div v-show="activeTab === 'travel'" class="form-section">
            <h3>📍 行程卡信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>手机号</label>
                <input type="text" v-model="store.data.travelPhone" placeholder="138****8888" />
              </div>
              <div class="form-group">
                <label>天数</label>
                <input type="number" v-model.number="store.data.travelDays" />
              </div>
            </div>

            <div class="form-group">
              <label>途经城市</label>
              <div class="city-tags">
                <span v-for="(city, index) in store.data.travelCities" :key="index" class="city-tag">
                  {{ city }}
                  <button class="remove-btn" @click="store.removeTravelCity(index)">×</button>
                </span>
              </div>
              <div class="add-city">
                <input type="text" v-model="newCity" placeholder="输入城市名称" @keyup.enter="addCity" />
                <button @click="addCity">添加</button>
              </div>
            </div>

            <div class="form-group">
              <label>更新时间</label>
              <div class="input-with-btn">
                <input type="text" v-model="store.data.travelUpdateTime" />
                <button @click="store.refreshTime()">🔄</button>
              </div>
            </div>
          </div>

          <!-- 身份证 -->
          <div v-show="activeTab === 'id'" class="form-section">
            <h3>🪪 身份证信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>姓名</label>
                <input type="text" v-model="store.data.idName" />
              </div>
              <div class="form-group">
                <label>性别</label>
                <select v-model="store.data.idGender">
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>民族</label>
                <input type="text" v-model="store.data.idNation" />
              </div>
              <div class="form-group">
                <label>出生日期</label>
                <input type="date" v-model="store.data.idBirthDate" />
              </div>
            </div>

            <div class="form-group">
              <label>住址</label>
              <input type="text" v-model="store.data.idAddress" />
            </div>

            <div class="form-group">
              <label>公民身份号码</label>
              <input type="text" v-model="store.data.idNumber" />
            </div>

            <div class="form-group">
              <label>签发机关</label>
              <input type="text" v-model="store.data.idAuthority" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>有效期起</label>
                <input type="date" v-model="store.data.idValidStart" />
              </div>
              <div class="form-group">
                <label>有效期至</label>
                <input type="date" v-model="store.data.idValidEnd" />
              </div>
            </div>
          </div>

          <!-- 护照 -->
          <div v-show="activeTab === 'passport'" class="form-section">
            <h3>🛂 护照信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>英文姓名</label>
                <input type="text" v-model="store.data.passportName" placeholder="ZHANG MING" />
              </div>
              <div class="form-group">
                <label>中文姓名</label>
                <input type="text" v-model="store.data.passportNameCN" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>性别</label>
                <select v-model="store.data.passportGender">
                  <option value="M">M (男)</option>
                  <option value="F">F (女)</option>
                </select>
              </div>
              <div class="form-group">
                <label>护照号码</label>
                <input type="text" v-model="store.data.passportNumber" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>出生日期</label>
                <input type="text" v-model="store.data.passportBirthDate" placeholder="15 MAY 1990" />
              </div>
              <div class="form-group">
                <label>出生地点</label>
                <input type="text" v-model="store.data.passportBirthPlace" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>签发日期</label>
                <input type="text" v-model="store.data.passportIssueDate" placeholder="01 JAN 2020" />
              </div>
              <div class="form-group">
                <label>有效期至</label>
                <input type="text" v-model="store.data.passportExpiryDate" placeholder="01 JAN 2030" />
              </div>
            </div>

            <div class="form-group">
              <label>签发机关</label>
              <input type="text" v-model="store.data.passportAuthority" />
            </div>
          </div>

          <!-- 驾驶证 -->
          <div v-show="activeTab === 'driver'" class="form-section">
            <h3>🚗 驾驶证信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>姓名</label>
                <input type="text" v-model="store.data.driverName" />
              </div>
              <div class="form-group">
                <label>性别</label>
                <select v-model="store.data.driverGender">
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>国籍</label>
                <input type="text" v-model="store.data.driverNationality" />
              </div>
              <div class="form-group">
                <label>出生日期</label>
                <input type="date" v-model="store.data.driverBirthDate" />
              </div>
            </div>

            <div class="form-group">
              <label>住址</label>
              <input type="text" v-model="store.data.driverAddress" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>准驾车型</label>
                <select v-model="store.data.driverClass">
                  <option v-for="c in driverClasses" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>有效期（年）</label>
                <select v-model.number="store.data.driverValidYears">
                  <option :value="6">6年</option>
                  <option :value="10">10年</option>
                  <option :value="99">长期</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>初次领证日期</label>
                <input type="date" v-model="store.data.driverIssueDate" />
              </div>
              <div class="form-group">
                <label>有效期起</label>
                <input type="date" v-model="store.data.driverValidStart" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>证号</label>
                <input type="text" v-model="store.data.driverNumber" />
              </div>
              <div class="form-group">
                <label>档案编号</label>
                <input type="text" v-model="store.data.driverFileNo" />
              </div>
            </div>
          </div>

          <!-- 头像上传 -->
          <div v-show="activeTab === 'photo'" class="form-section">
            <h3>📷 证件照</h3>
            
            <div class="photo-upload">
              <div class="photo-preview">
                <img v-if="store.data.avatarUrl" :src="store.data.avatarUrl" alt="证件照" />
                <div v-else class="photo-placeholder">点击上传证件照</div>
              </div>
              <input type="file" accept="image/*" @change="handlePhotoUpload" ref="photoInput" hidden />
              <button class="upload-btn" @click="$refs.photoInput.click()">选择照片</button>
              <button v-if="store.data.avatarUrl" class="clear-btn" @click="store.data.avatarUrl = ''">清除照片</button>
            </div>

            <p class="photo-tips">建议上传标准证件照，白色或蓝色背景</p>
          </div>

          <!-- 设备设置 -->
          <div v-show="activeTab === 'settings'" class="form-section">
            <h3>⚙️ 设备设置</h3>
            
            <div class="form-group">
              <label>设备类型</label>
              <div class="device-options">
                <button 
                  :class="['device-btn', { active: store.data.deviceType === 'iphone' }]"
                  @click="store.data.deviceType = 'iphone'"
                >📱 iPhone</button>
                <button 
                  :class="['device-btn', { active: store.data.deviceType === 'android' }]"
                  @click="store.data.deviceType = 'android'"
                >🤖 Android</button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>显示时间</label>
                <input type="text" v-model="store.data.showTime" />
              </div>
              <div class="form-group">
                <label>电量 (%)</label>
                <input type="number" v-model.number="store.data.showBattery" min="0" max="100" />
              </div>
            </div>

            <div class="toggle-group">
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.showWifi" />
                <span>显示WiFi图标</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.darkMode" />
                <span>深色模式</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.showQRCode" />
                <span>显示二维码</span>
              </label>
            </div>

            <div class="form-group">
              <label>导出质量</label>
              <select v-model="exportQuality">
                <option value="1">标准 (1x)</option>
                <option value="2">高清 (2x)</option>
                <option value="3">超清 (3x)</option>
              </select>
            </div>

            <button class="btn-reset" @click="store.reset()">重置所有设置</button>
          </div>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>实时预览</h3>
          <div class="preview-actions">
            <button class="btn-download" @click="downloadImage">📥 下载图片</button>
            <button class="btn-download secondary" @click="downloadPDF">📄 下载PDF</button>
          </div>
        </div>
        <div class="preview-container">
          <div ref="previewRef" class="preview-wrapper">
            <EDocPreview />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEDocStore, docTypes, vaccineTypes, driverClasses } from '@/stores/edoc'
import EDocPreview from '@/components/EDocPreview.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useEDocStore()
const activeTab = ref('health')
const previewRef = ref<HTMLElement | null>(null)
const exportQuality = ref('2')
const newCity = ref('')

const currentTabs = computed(() => {
  const tabs = []
  
  if (store.data.docType === 'health-code') {
    tabs.push({ id: 'health', label: '🟢 健康码' })
  } else if (store.data.docType === 'nucleic-acid') {
    tabs.push({ id: 'nucleic', label: '🧪 核酸' })
  } else if (store.data.docType === 'vaccine') {
    tabs.push({ id: 'vaccine', label: '💉 疫苗' })
  } else if (store.data.docType === 'travel-card') {
    tabs.push({ id: 'travel', label: '📍 行程' })
  } else if (store.data.docType === 'id-card') {
    tabs.push({ id: 'id', label: '🪪 身份证' })
    tabs.push({ id: 'photo', label: '📷 照片' })
  } else if (store.data.docType === 'passport') {
    tabs.push({ id: 'passport', label: '🛂 护照' })
    tabs.push({ id: 'photo', label: '📷 照片' })
  } else if (store.data.docType === 'driver-license') {
    tabs.push({ id: 'driver', label: '🚗 驾驶证' })
    tabs.push({ id: 'photo', label: '📷 照片' })
  }
  
  tabs.push({ id: 'settings', label: '⚙️ 设置' })
  
  return tabs
})

function addCity() {
  if (newCity.value.trim()) {
    store.addTravelCity(newCity.value.trim())
    newCity.value = ''
  }
}

function handlePhotoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.data.avatarUrl = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const downloadImage = async () => {
  if (!previewRef.value) return
  const scale = parseInt(exportQuality.value)
  const canvas = await html2canvas(previewRef.value, {
    scale,
    useCORS: true,
    backgroundColor: null
  })
  const link = document.createElement('a')
  link.download = `edoc-${store.data.docType}-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const downloadPDF = async () => {
  if (!previewRef.value) return
  const scale = parseInt(exportQuality.value)
  const canvas = await html2canvas(previewRef.value, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`edoc-${store.data.docType}-${Date.now()}.pdf`)
}
</script>

<style scoped>
.edoc-view {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.75rem;
  margin: 0 0 8px 0;
  color: #1e293b;
}

.description {
  color: #64748b;
  margin: 0;
}

.main-content {
  display: flex;
  gap: 24px;
}

.edit-panel {
  width: 480px;
  flex-shrink: 0;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-height: calc(100vh - 150px);
  overflow-y: auto;
}

.preview-panel {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

/* 证件类型选择器 */
.doc-type-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.doc-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.doc-btn:hover {
  border-color: #4B6EF5;
}

.doc-btn.active {
  border-color: #4B6EF5;
  background: #EEF2FF;
}

.doc-icon {
  font-size: 24px;
}

.doc-label {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #334155;
}

.tab-btn.active {
  background: white;
  color: #4B6EF5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 表单样式 */
.form-section {
  margin-bottom: 20px;
}

.form-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  flex: 1;
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 4px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4B6EF5;
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn input {
  flex: 1;
}

.input-with-btn button {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

/* 颜色选项 */
.color-options, .result-options {
  display: flex;
  gap: 8px;
}

.color-btn, .result-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.color-btn.green.active {
  border-color: #22c55e;
  background: #dcfce7;
  color: #16a34a;
}

.color-btn.yellow.active {
  border-color: #facc15;
  background: #fef9c3;
  color: #ca8a04;
}

.color-btn.red.active {
  border-color: #ef4444;
  background: #fee2e2;
  color: #dc2626;
}

.result-btn.negative.active {
  border-color: #22c55e;
  background: #dcfce7;
  color: #16a34a;
}

.result-btn.positive.active {
  border-color: #ef4444;
  background: #fee2e2;
  color: #dc2626;
}

/* 城市标签 */
.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.city-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 13px;
}

.remove-btn {
  width: 16px;
  height: 16px;
  border: none;
  background: #e2e8f0;
  color: #64748b;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}

.add-city {
  display: flex;
  gap: 8px;
}

.add-city input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.add-city button {
  padding: 8px 16px;
  border: none;
  background: #4B6EF5;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

/* 照片上传 */
.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.photo-preview {
  width: 120px;
  height: 160px;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}

.upload-btn, .clear-btn {
  padding: 8px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.upload-btn {
  background: #4B6EF5;
  color: white;
}

.clear-btn {
  background: #f1f5f9;
  color: #64748b;
}

.photo-tips {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}

/* 设备选项 */
.device-options {
  display: flex;
  gap: 8px;
}

.device-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.device-btn.active {
  border-color: #4B6EF5;
  background: #EEF2FF;
  color: #4B6EF5;
}

/* 开关组 */
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.toggle-item span {
  font-size: 13px;
}

/* 重置按钮 */
.btn-reset {
  width: 100%;
  padding: 12px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 16px;
}

.btn-reset:hover {
  background: #e2e8f0;
}

/* 预览区 */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.btn-download {
  padding: 8px 16px;
  border: none;
  background: linear-gradient(135deg, #4B6EF5, #6C5CE7);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-download:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
}

.btn-download.secondary {
  background: white;
  color: #4B6EF5;
  border: 1px solid #4B6EF5;
}

.preview-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  overflow-y: auto;
}
</style>
