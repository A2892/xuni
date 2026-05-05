<template>
  <div class="payslip-view">
    <div class="view-content">
      <div class="edit-panel">
        <div class="panel-header">
          <h2>💰 工资单生成器</h2>
          <p>创建专业工资条</p>
        </div>
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab" :class="['tab', { active: activeTab === tab }]" @click="activeTab = tab">{{ tab }}</button>
        </div>
        <div class="tab-content">
          <div v-show="activeTab === '员工信息'" class="form-section">
            <div class="form-group">
              <label>员工姓名</label>
              <input v-model="store.employee.name" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>员工编号</label>
                <input v-model="store.employee.employeeNumber" type="text" />
              </div>
              <div class="form-group">
                <label>部门</label>
                <input v-model="store.employee.department" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>职位</label>
              <input v-model="store.employee.position" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>入职日期</label>
                <input v-model="store.employee.joinDate" type="date" />
              </div>
              <div class="form-group">
                <label>银行账户</label>
                <input v-model="store.employee.bankAccount" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>银行名称</label>
              <input v-model="store.employee.bankName" type="text" />
            </div>
          </div>
          <div v-show="activeTab === '公司信息'" class="form-section">
            <div class="form-group">
              <label>公司名称</label>
              <input v-model="store.company.name" type="text" />
            </div>
            <div class="form-group">
              <label>公司Logo</label>
              <input type="file" accept="image/*" @change="handleLogoUpload" />
              <div v-if="store.company.logo" class="image-preview">
                <img :src="store.company.logo" />
                <button @click="store.company.logo = ''" class="btn-remove">删除</button>
              </div>
            </div>
            <div class="form-group">
              <label>公司地址</label>
              <textarea v-model="store.company.address" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>联系电话</label>
                <input v-model="store.company.phone" type="text" />
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input v-model="store.company.email" type="email" />
              </div>
            </div>
          </div>
          <div v-show="activeTab === '工资周期'" class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>开始日期</label>
                <input v-model="store.payPeriod.startDate" type="date" />
              </div>
              <div class="form-group">
                <label>结束日期</label>
                <input v-model="store.payPeriod.endDate" type="date" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>发薪日期</label>
                <input v-model="store.payPeriod.payDate" type="date" />
              </div>
              <div class="form-group">
                <label>周期类型</label>
                <select v-model="store.payPeriod.periodType">
                  <option value="monthly">月薪</option>
                  <option value="bi-weekly">双周薪</option>
                  <option value="weekly">周薪</option>
                </select>
              </div>
            </div>
          </div>
          <div v-show="activeTab === '收入'" class="form-section">
            <div class="form-group">
              <label>基本工资</label>
              <input v-model.number="store.earnings.baseSalary" type="number" />
            </div>
            <h4>津贴补贴</h4>
            <div v-for="(allowance, index) in store.earnings.allowances" :key="index" class="item-row">
              <input v-model="allowance.name" placeholder="项目名称" />
              <input v-model.number="allowance.amount" type="number" placeholder="金额" />
              <button @click="store.earnings.allowances.splice(index, 1)" class="btn-remove-sm">×</button>
            </div>
            <button @click="store.addAllowance()" class="btn-add">+ 添加津贴</button>
            <div class="form-row" style="margin-top: 16px;">
              <div class="form-group">
                <label>加班时数</label>
                <input v-model.number="store.earnings.overtimeHours" type="number" />
              </div>
              <div class="form-group">
                <label>奖金</label>
                <input v-model.number="store.earnings.bonus" type="number" />
              </div>
            </div>
            <div class="form-group">
              <label>佣金</label>
              <input v-model.number="store.earnings.commission" type="number" />
            </div>
            <div class="summary-box">
              <strong>总收入: ¥{{ store.grossEarnings.toFixed(2) }}</strong>
            </div>
          </div>
          <div v-show="activeTab === '扣款'" class="form-section">
            <h4>扣款项目</h4>
            <div v-for="(ded, index) in store.deductions" :key="index" class="item-row">
              <input v-model="ded.name" placeholder="项目名称" />
              <input v-model.number="ded.amount" type="number" placeholder="金额" />
              <button @click="store.deductions.splice(index, 1)" class="btn-remove-sm">×</button>
            </div>
            <button @click="store.addDeduction()" class="btn-add">+ 添加扣款</button>
            <div class="summary-box" style="margin-top: 16px;">
              <strong>总扣款: ¥{{ store.totalDeductions.toFixed(2) }}</strong>
            </div>
            <div class="summary-box highlight">
              <strong>实发工资: ¥{{ store.netPay.toFixed(2) }}</strong>
            </div>
          </div>
          <div v-show="activeTab === '设置'" class="form-section">
            <h4>模板选择</h4>
            <div class="template-grid">
              <div v-for="t in ['modern', 'classic', 'minimal', 'corporate'] as const" :key="t" :class="['template-card', { active: store.settings.template === t }]" @click="store.settings.template = t">
                <span>{{ { modern: '现代', classic: '经典', minimal: '简约', corporate: '企业' }[t] }}</span>
              </div>
            </div>
            <div class="form-row" style="margin-top: 16px;">
              <div class="form-group">
                <label>主色调</label>
                <input v-model="store.settings.primaryColor" type="color" />
              </div>
              <div class="form-group">
                <label>货币符号</label>
                <input v-model="store.settings.currency" type="text" />
              </div>
            </div>
            <div class="options-grid" style="margin-top: 16px;">
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showYTD" /> 显示年度累计</label>
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showBankDetails" /> 显示银行信息</label>
            </div>
          </div>
          <!-- 数据管理 -->
          <div v-show="activeTab === '数据管理'" class="form-section">
            <SaveLoadPanel 
              document-type="payslip"
              :get-data="() => store.$state"
              :set-data="(data: any) => store.$patch(data)"
            />
          </div>
        </div>
      </div>
      <div class="preview-panel">
        <div class="preview-toolbar">
          <span>工资单预览</span>
          <div class="toolbar-actions">
            <button @click="showEmailModal = true" class="btn-email">📧 发送邮件</button>
            <button @click="downloadPDF" class="btn-download">下载 PDF</button>
          </div>
        </div>
        <div class="preview-container">
          <PayslipPreview ref="previewRef" />
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`Payslip_${store.employee.name}`"
      :default-subject="`工资单 - ${store.employee.name}`"
      preview-selector=".payslip-preview"
      @close="showEmailModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePayslipStore } from '@/stores/payslip'
import PayslipPreview from '@/components/PayslipPreview.vue'
import EmailModal from '@/components/EmailModal.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = usePayslipStore()
const activeTab = ref('员工信息')
const tabs = ['员工信息', '公司信息', '工资周期', '收入', '扣款', '设置', '数据管理']
const previewRef = ref()
const showEmailModal = ref(false)

const handleLogoUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => { store.company.logo = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

const downloadPDF = async () => {
  if (!previewRef.value?.$el) return
  const canvas = await html2canvas(previewRef.value.$el, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = pdf.internal.pageSize.getWidth()
  const h = (canvas.height * w) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, w, h)
  pdf.save(`Payslip_${store.employee.name}_${store.payPeriod.payDate}.pdf`)
}
</script>

<style scoped>
.payslip-view { height: 100%; display: flex; flex-direction: column; }
.view-content { flex: 1; display: flex; gap: 24px; padding: 24px; overflow: hidden; }
.edit-panel { width: 400px; min-width: 400px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; overflow: hidden; }
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
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
h4 { margin: 0 0 12px 0; font-size: 14px; color: #374151; }
.image-preview { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
.image-preview img { width: 80px; height: 50px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
.btn-remove { padding: 4px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
.item-row { display: flex; gap: 8px; margin-bottom: 8px; }
.item-row input { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
.item-row input:first-child { flex: 2; }
.btn-remove-sm { width: 32px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 18px; }
.btn-add { padding: 10px; background: #eff6ff; color: #2563eb; border: 1px dashed #2563eb; border-radius: 8px; font-size: 13px; cursor: pointer; width: 100%; }
.summary-box { padding: 12px 16px; background: #f0fdf4; border-radius: 8px; margin-top: 8px; }
.summary-box.highlight { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; }
.template-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
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
