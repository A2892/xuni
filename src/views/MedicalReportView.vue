<template>
  <div class="medical-report-view">
    <div class="view-content">
      <div class="edit-panel">
        <div class="panel-header">
          <h2>🏥 医疗报告生成器</h2>
          <p>创建专业医疗/体检报告</p>
        </div>
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab" :class="['tab', { active: activeTab === tab }]" @click="activeTab = tab">{{ tab }}</button>
        </div>
        <div class="tab-content">
          <div v-show="activeTab === '患者信息'" class="form-section">
            <div class="form-group">
              <label>姓名</label>
              <input v-model="store.patient.name" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>性别</label>
                <select v-model="store.patient.gender">
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>
              <div class="form-group">
                <label>年龄</label>
                <input v-model.number="store.patient.age" type="number" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>出生日期</label>
                <input v-model="store.patient.dateOfBirth" type="date" />
              </div>
              <div class="form-group">
                <label>血型</label>
                <select v-model="store.patient.bloodType">
                  <option value="A">A型</option>
                  <option value="B">B型</option>
                  <option value="AB">AB型</option>
                  <option value="O">O型</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>身份证号</label>
              <input v-model="store.patient.idNumber" type="text" />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="store.patient.phone" type="text" />
            </div>
            <div class="form-group">
              <label>地址</label>
              <textarea v-model="store.patient.address" rows="2"></textarea>
            </div>
          </div>
          <div v-show="activeTab === '医疗机构'" class="form-section">
            <div class="form-group">
              <label>医院名称</label>
              <input v-model="store.provider.name" type="text" />
            </div>
            <div class="form-group">
              <label>医院Logo</label>
              <input type="file" accept="image/*" @change="handleLogoUpload" />
              <div v-if="store.provider.logo" class="image-preview">
                <img :src="store.provider.logo" />
                <button @click="store.provider.logo = ''" class="btn-remove">删除</button>
              </div>
            </div>
            <div class="form-group">
              <label>科室</label>
              <input v-model="store.provider.department" type="text" />
            </div>
            <div class="form-group">
              <label>医院地址</label>
              <textarea v-model="store.provider.address" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>联系电话</label>
                <input v-model="store.provider.phone" type="text" />
              </div>
              <div class="form-group">
                <label>报告日期</label>
                <input v-model="store.reportDate" type="date" />
              </div>
            </div>
            <div class="form-group">
              <label>主治医师</label>
              <input v-model="store.provider.doctorName" type="text" />
            </div>
          </div>
          <div v-show="activeTab === '生命体征'" class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>身高 (cm)</label>
                <input v-model.number="store.vitalSigns.height" type="number" />
              </div>
              <div class="form-group">
                <label>体重 (kg)</label>
                <input v-model.number="store.vitalSigns.weight" type="number" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>血压 (收缩压)</label>
                <input v-model.number="store.vitalSigns.bloodPressure.systolic" type="number" />
              </div>
              <div class="form-group">
                <label>血压 (舒张压)</label>
                <input v-model.number="store.vitalSigns.bloodPressure.diastolic" type="number" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>心率 (次/分)</label>
                <input v-model.number="store.vitalSigns.heartRate" type="number" />
              </div>
              <div class="form-group">
                <label>体温 (°C)</label>
                <input v-model.number="store.vitalSigns.temperature" type="number" step="0.1" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>呼吸频率 (次/分)</label>
                <input v-model.number="store.vitalSigns.respiratoryRate" type="number" />
              </div>
              <div class="form-group">
                <label>血氧饱和度 (%)</label>
                <input v-model.number="store.vitalSigns.oxygenSaturation" type="number" />
              </div>
            </div>
            <div class="info-box">
              <strong>BMI: {{ store.bmi.toFixed(1) }}</strong>
              <span>{{ getBMICategory(store.bmi) }}</span>
            </div>
          </div>
          <div v-show="activeTab === '检验结果'" class="form-section">
            <h4>化验项目</h4>
            <div v-for="(result, index) in store.labResults" :key="index" class="lab-item">
              <div class="form-row">
                <div class="form-group">
                  <label>项目名称</label>
                  <input v-model="result.name" type="text" />
                </div>
                <div class="form-group">
                  <label>结果</label>
                  <input v-model="result.value" type="text" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>单位</label>
                  <input v-model="result.unit" type="text" />
                </div>
                <div class="form-group">
                  <label>参考范围</label>
                  <input v-model="result.referenceRange" type="text" />
                </div>
              </div>
              <div class="form-group">
                <label>状态</label>
                <select v-model="result.status">
                  <option value="normal">正常</option>
                  <option value="high">偏高</option>
                  <option value="low">偏低</option>
                  <option value="critical">危急</option>
                </select>
              </div>
              <button @click="store.labResults.splice(index, 1)" class="btn-remove-item">删除此项</button>
            </div>
            <button @click="addLabResult" class="btn-add">+ 添加检验项目</button>
          </div>
          <div v-show="activeTab === '诊断建议'" class="form-section">
            <h4>诊断</h4>
            <div v-for="(diag, index) in store.diagnoses" :key="index" class="item-row">
              <input v-model="diag.name" placeholder="诊断名称" style="flex: 2;" />
              <select v-model="diag.severity" style="flex: 1;">
                <option value="mild">轻度</option>
                <option value="moderate">中度</option>
                <option value="severe">重度</option>
              </select>
              <button @click="store.diagnoses.splice(index, 1)" class="btn-remove-sm">×</button>
            </div>
            <button @click="store.diagnoses.push({ code: '', name: '', severity: 'mild' })" class="btn-add">+ 添加诊断</button>
            <div class="form-group" style="margin-top: 20px;">
              <label>医师评估</label>
              <textarea v-model="store.assessment" rows="3" placeholder="综合评估意见..."></textarea>
            </div>
            <h4 style="margin-top: 20px;">建议</h4>
            <div v-for="(rec, index) in store.recommendations" :key="index" class="item-row">
              <input v-model="store.recommendations[index]" placeholder="建议内容" />
              <button @click="store.recommendations.splice(index, 1)" class="btn-remove-sm">×</button>
            </div>
            <button @click="store.recommendations.push('')" class="btn-add">+ 添加建议</button>
          </div>
          <div v-show="activeTab === '设置'" class="form-section">
            <h4>模板选择</h4>
            <div class="template-grid">
              <div v-for="t in ['hospital', 'clinic', 'lab']" :key="t" :class="['template-card', { active: store.settings.template === t }]" @click="store.settings.template = t">
                <span>{{ { hospital: '医院', clinic: '诊所', lab: '实验室' }[t] }}</span>
              </div>
            </div>
            <div class="form-row" style="margin-top: 16px;">
              <div class="form-group">
                <label>主色调</label>
                <input v-model="store.settings.primaryColor" type="color" />
              </div>
            </div>
            <div class="options-grid" style="margin-top: 16px;">
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showLogo" /> 显示Logo</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showVitals" /> 显示生命体征</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showLabResults" /> 显示化验结果</label>
            </div>
          </div>
          <!-- 数据管理 -->
          <div v-show="activeTab === '数据管理'" class="form-section">
            <SaveLoadPanel 
              document-type="medical_report"
              :get-data="() => store.$state"
              :set-data="(data: any) => store.$patch(data)"
            />
          </div>
        </div>
      </div>
      <div class="preview-panel">
        <div class="preview-toolbar">
          <span>医疗报告预览</span>
          <div class="toolbar-actions">
            <button @click="showEmailModal = true" class="btn-email">📧 发送邮件</button>
            <button @click="downloadPDF" class="btn-download">下载 PDF</button>
          </div>
        </div>
        <div class="preview-container">
          <MedicalReportPreview ref="previewRef" />
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`MedicalReport_${store.patient.name}`"
      :default-subject="`医疗报告 - ${store.patient.name}`"
      preview-selector=".medical-report-preview"
      @close="showEmailModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMedicalReportStore } from '@/stores/medicalReport'
import MedicalReportPreview from '@/components/MedicalReportPreview.vue'
import EmailModal from '@/components/EmailModal.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useMedicalReportStore()
const activeTab = ref('患者信息')
const tabs = ['患者信息', '医疗机构', '生命体征', '检验结果', '诊断建议', '设置', '数据管理']
const previewRef = ref()
const showEmailModal = ref(false)

const handleLogoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.provider.logo = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const addLabResult = () => {
  store.labResults.push({ name: '', value: '', unit: '', referenceRange: '', status: 'normal' })
}

const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return '体重过轻'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '超重'
  return '肥胖'
}

const downloadPDF = async () => {
  if (!previewRef.value?.$el) return
  const canvas = await html2canvas(previewRef.value.$el, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = pdf.internal.pageSize.getWidth()
  const h = (canvas.height * w) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, w, h)
  pdf.save(`MedicalReport_${store.patient.name}_${store.reportDate}.pdf`)
}
</script>

<style scoped>
.medical-report-view { height: 100%; display: flex; flex-direction: column; }
.view-content { flex: 1; display: flex; gap: 24px; padding: 24px; overflow: hidden; }
.edit-panel { width: 420px; min-width: 420px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; overflow: hidden; }
.panel-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.panel-header h2 { margin: 0 0 4px 0; font-size: 20px; }
.panel-header p { margin: 0; font-size: 13px; color: #6b7280; }
.tabs { display: flex; gap: 4px; padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; overflow-x: auto; }
.tab { padding: 8px 12px; border: none; background: transparent; color: #6b7280; font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; white-space: nowrap; }
.tab:hover { background: #e5e7eb; }
.tab.active { background: #2563eb; color: white; }
.tab-content { flex: 1; padding: 20px; overflow-y: auto; }
.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #374151; }
.form-group input, .form-group select, .form-group textarea { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
h4 { margin: 0 0 12px 0; font-size: 14px; color: #374151; }
.image-preview { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
.image-preview img { width: 80px; height: 50px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
.btn-remove { padding: 4px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
.info-box { padding: 12px 16px; background: #f0fdf4; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
.info-box span { font-size: 13px; color: #166534; }
.lab-item { padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px; }
.btn-remove-item { margin-top: 8px; padding: 6px 12px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 6px; font-size: 12px; cursor: pointer; width: 100%; }
.item-row { display: flex; gap: 8px; margin-bottom: 8px; }
.item-row input, .item-row select { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
.btn-remove-sm { width: 32px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 18px; }
.btn-add { padding: 10px; background: #eff6ff; color: #2563eb; border: 1px dashed #2563eb; border-radius: 8px; font-size: 13px; cursor: pointer; width: 100%; }
.template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.template-card { padding: 12px 8px; border: 2px solid #e5e7eb; border-radius: 8px; text-align: center; font-size: 12px; cursor: pointer; }
.template-card:hover { border-color: #2563eb; }
.template-card.active { border-color: #2563eb; background: #eff6ff; }
.options-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.checkbox-option { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
.preview-panel { flex: 1; display: flex; flex-direction: column; background: #f1f5f9; border-radius: 16px; overflow: hidden; }
.preview-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-bottom: 1px solid #e5e7eb; }
.preview-toolbar span { font-size: 14px; font-weight: 600; }
.btn-download { padding: 10px 20px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
.preview-container { flex: 1; padding: 24px; overflow: auto; display: flex; justify-content: center; align-items: flex-start; }
</style>
