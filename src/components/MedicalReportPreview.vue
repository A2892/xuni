<template>
  <div class="medical-report-preview" :class="store.settings.template">
    <div class="report" :style="{ '--primary': store.settings.primaryColor }">
      <!-- Header -->
      <div class="header">
        <div class="hospital-info">
          <img v-if="store.settings.showLogo && store.provider.logo" :src="store.provider.logo" class="logo" />
          <div class="hospital-text">
            <h2>{{ store.provider.name || '医疗机构名称' }}</h2>
            <p>{{ store.provider.department || '科室' }}</p>
            <p class="address">{{ store.provider.address }}</p>
          </div>
        </div>
        <div class="report-title">
          <h1>医疗检查报告</h1>
          <p>MEDICAL REPORT</p>
        </div>
      </div>

      <!-- Patient Info -->
      <div class="section patient-section">
        <div class="section-header">
          <h3>👤 患者信息</h3>
        </div>
        <div class="patient-grid">
          <div class="info-item">
            <span class="label">姓名</span>
            <span class="value">{{ store.patient.name || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别</span>
            <span class="value">{{ store.patient.gender === 'male' ? '男' : '女' }}</span>
          </div>
          <div class="info-item">
            <span class="label">年龄</span>
            <span class="value">{{ store.patient.age }} 岁</span>
          </div>
          <div class="info-item">
            <span class="label">血型</span>
            <span class="value">{{ store.patient.bloodType }}型</span>
          </div>
          <div class="info-item">
            <span class="label">身份证号</span>
            <span class="value">{{ store.patient.idNumber || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话</span>
            <span class="value">{{ store.patient.phone || '-' }}</span>
          </div>
          <div class="info-item full">
            <span class="label">地址</span>
            <span class="value">{{ store.patient.address || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Vital Signs -->
      <div v-if="store.settings.showVitals" class="section vitals-section">
        <div class="section-header">
          <h3>📊 生命体征</h3>
        </div>
        <div class="vitals-grid">
          <div class="vital-card">
            <span class="icon">📏</span>
            <div class="vital-info">
              <span class="label">身高</span>
              <span class="value">{{ store.vitalSigns.height }} cm</span>
            </div>
          </div>
          <div class="vital-card">
            <span class="icon">⚖️</span>
            <div class="vital-info">
              <span class="label">体重</span>
              <span class="value">{{ store.vitalSigns.weight }} kg</span>
            </div>
          </div>
          <div class="vital-card">
            <span class="icon">💓</span>
            <div class="vital-info">
              <span class="label">血压</span>
              <span class="value">{{ store.vitalSigns.bloodPressure.systolic }}/{{ store.vitalSigns.bloodPressure.diastolic }} mmHg</span>
            </div>
          </div>
          <div class="vital-card">
            <span class="icon">❤️</span>
            <div class="vital-info">
              <span class="label">心率</span>
              <span class="value">{{ store.vitalSigns.heartRate }} 次/分</span>
            </div>
          </div>
          <div class="vital-card">
            <span class="icon">🌡️</span>
            <div class="vital-info">
              <span class="label">体温</span>
              <span class="value">{{ store.vitalSigns.temperature }} °C</span>
            </div>
          </div>
          <div class="vital-card">
            <span class="icon">🫁</span>
            <div class="vital-info">
              <span class="label">血氧</span>
              <span class="value">{{ store.vitalSigns.oxygenSaturation }}%</span>
            </div>
          </div>
        </div>
        <div class="bmi-bar">
          <span>BMI: {{ store.bmi.toFixed(1) }}</span>
          <span class="bmi-category" :class="getBMIClass(store.bmi)">{{ getBMICategory(store.bmi) }}</span>
        </div>
      </div>

      <!-- Lab Results -->
      <div v-if="store.settings.showLabResults && store.labResults.length > 0" class="section lab-section">
        <div class="section-header">
          <h3>🔬 检验结果</h3>
        </div>
        <table class="lab-table">
          <thead>
            <tr>
              <th>检验项目</th>
              <th>结果</th>
              <th>单位</th>
              <th>参考范围</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in store.labResults" :key="result.name" :class="result.status">
              <td>{{ result.name }}</td>
              <td class="value">{{ result.value }}</td>
              <td>{{ result.unit }}</td>
              <td>{{ result.referenceRange }}</td>
              <td>
                <span class="status-badge" :class="result.status">{{ statusLabels[result.status] }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Diagnosis -->
      <div v-if="store.diagnoses.length > 0" class="section diagnosis-section">
        <div class="section-header">
          <h3>📋 诊断结果</h3>
        </div>
        <div class="diagnosis-list">
          <div v-for="diag in store.diagnoses" :key="diag.name" class="diagnosis-item">
            <span class="diag-name">{{ diag.name }}</span>
            <span class="severity-badge" :class="diag.severity">{{ severityLabels[diag.severity] }}</span>
          </div>
        </div>
      </div>

      <!-- Assessment -->
      <div v-if="store.assessment" class="section assessment-section">
        <div class="section-header">
          <h3>📝 医师评估</h3>
        </div>
        <p class="assessment-text">{{ store.assessment }}</p>
      </div>

      <!-- Recommendations -->
      <div v-if="store.recommendations.length > 0" class="section recommendations-section">
        <div class="section-header">
          <h3>💡 医嘱建议</h3>
        </div>
        <ul class="recommendations-list">
          <li v-for="(rec, index) in store.recommendations" :key="index">{{ rec }}</li>
        </ul>
      </div>

      <!-- Signature -->
      <div class="signature-section">
        <div class="sig-block">
          <span class="label">主治医师</span>
          <div class="sig-line">{{ store.provider.doctorName || '' }}</div>
        </div>
        <div class="sig-block">
          <span class="label">报告日期</span>
          <div class="sig-line">{{ store.reportDate }}</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>本报告仅对本次检查负责，如有疑问请及时咨询医生</p>
        <p class="contact">联系电话: {{ store.provider.phone }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMedicalReportStore } from '@/stores/medicalReport'
const store = useMedicalReportStore()

const statusLabels: Record<string, string> = {
  normal: '正常',
  high: '偏高',
  low: '偏低',
  critical: '危急'
}

const severityLabels: Record<string, string> = {
  mild: '轻度',
  moderate: '中度',
  severe: '重度'
}

const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return '体重过轻'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '超重'
  return '肥胖'
}

const getBMIClass = (bmi: number): string => {
  if (bmi < 18.5) return 'low'
  if (bmi < 24) return 'normal'
  if (bmi < 28) return 'high'
  return 'critical'
}
</script>

<style scoped>
.medical-report-preview { display: flex; justify-content: center; }
.report { width: 700px; background: white; font-family: 'Segoe UI', sans-serif; box-shadow: 0 4px 30px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }

/* Header */
.header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px; background: linear-gradient(135deg, var(--primary), #1e40af); color: white; }
.hospital-info { display: flex; gap: 16px; align-items: center; }
.logo { height: 60px; width: auto; }
.hospital-text h2 { margin: 0; font-size: 18px; }
.hospital-text p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; }
.hospital-text .address { font-size: 11px; opacity: 0.8; max-width: 200px; }
.report-title { text-align: right; }
.report-title h1 { margin: 0; font-size: 22px; }
.report-title p { margin: 4px 0 0 0; font-size: 11px; opacity: 0.8; letter-spacing: 2px; }

/* Section */
.section { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.section-header { margin-bottom: 16px; }
.section-header h3 { margin: 0; font-size: 15px; color: var(--primary); display: flex; align-items: center; gap: 8px; }

/* Patient Grid */
.patient-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.info-item { display: flex; flex-direction: column; padding: 8px 12px; background: #f9fafb; border-radius: 6px; }
.info-item.full { grid-column: span 4; }
.info-item .label { font-size: 11px; color: #6b7280; margin-bottom: 2px; }
.info-item .value { font-size: 14px; color: #1f2937; font-weight: 500; }

/* Vitals Grid */
.vitals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.vital-card { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f9fafb; border-radius: 8px; }
.vital-card .icon { font-size: 24px; }
.vital-info { display: flex; flex-direction: column; }
.vital-info .label { font-size: 11px; color: #6b7280; }
.vital-info .value { font-size: 16px; font-weight: 600; color: #1f2937; }
.bmi-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding: 12px 16px; background: #f0fdf4; border-radius: 8px; font-size: 14px; font-weight: 500; }
.bmi-category { padding: 4px 12px; border-radius: 20px; font-size: 12px; }
.bmi-category.normal { background: #dcfce7; color: #166534; }
.bmi-category.low { background: #fef3c7; color: #92400e; }
.bmi-category.high { background: #fee2e2; color: #991b1b; }
.bmi-category.critical { background: #fecaca; color: #7f1d1d; }

/* Lab Table */
.lab-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.lab-table th { text-align: left; padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 500; color: #374151; }
.lab-table td { padding: 10px 12px; border: 1px solid #e5e7eb; }
.lab-table .value { font-weight: 600; }
.lab-table tr.high .value { color: #dc2626; }
.lab-table tr.low .value { color: #2563eb; }
.lab-table tr.critical { background: #fef2f2; }
.lab-table tr.critical .value { color: #991b1b; font-weight: 700; }
.status-badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.status-badge.normal { background: #dcfce7; color: #166534; }
.status-badge.high { background: #fee2e2; color: #991b1b; }
.status-badge.low { background: #dbeafe; color: #1e40af; }
.status-badge.critical { background: #fecaca; color: #7f1d1d; }

/* Diagnosis */
.diagnosis-list { display: flex; flex-wrap: wrap; gap: 8px; }
.diagnosis-item { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f9fafb; border-radius: 8px; }
.diag-name { font-size: 14px; font-weight: 500; }
.severity-badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.severity-badge.mild { background: #fef3c7; color: #92400e; }
.severity-badge.moderate { background: #fed7aa; color: #9a3412; }
.severity-badge.severe { background: #fecaca; color: #7f1d1d; }

/* Assessment */
.assessment-text { margin: 0; font-size: 14px; color: #374151; line-height: 1.7; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid var(--primary); }

/* Recommendations */
.recommendations-list { margin: 0; padding-left: 20px; }
.recommendations-list li { font-size: 14px; color: #374151; margin-bottom: 8px; line-height: 1.6; }

/* Signature */
.signature-section { display: flex; justify-content: flex-end; gap: 40px; padding: 20px 24px; }
.sig-block { text-align: center; }
.sig-block .label { font-size: 12px; color: #6b7280; }
.sig-block .sig-line { min-width: 120px; border-bottom: 1px solid #374151; margin-top: 30px; padding-bottom: 4px; font-size: 14px; }

/* Footer */
.footer { padding: 16px 24px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb; }
.footer p { margin: 0 0 4px 0; font-size: 11px; color: #6b7280; }
.footer .contact { color: var(--primary); }

/* Template Variants */
.medical-report-preview.clinic .header { background: linear-gradient(135deg, #22c55e, #16a34a); }
.medical-report-preview.clinic .section-header h3 { color: #16a34a; }
.medical-report-preview.clinic .assessment-text { border-left-color: #16a34a; }

.medical-report-preview.lab .report { border: 1px solid #e5e7eb; box-shadow: none; }
.medical-report-preview.lab .header { background: white; color: #1f2937; border-bottom: 3px solid var(--primary); }
.medical-report-preview.lab .report-title h1 { color: var(--primary); }
.medical-report-preview.lab .report-title p { color: #6b7280; }
</style>
