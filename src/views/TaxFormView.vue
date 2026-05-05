<template>
  <div class="tax-form-view">
    <div class="view-content">
      <div class="edit-panel">
        <div class="panel-header">
          <h2>📋 税务表单生成器</h2>
          <p>创建个人税务表单</p>
        </div>
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab" :class="['tab', { active: activeTab === tab }]" @click="activeTab = tab">{{ tab }}</button>
        </div>
        <div class="tab-content">
          <div v-show="activeTab === '纳税人信息'" class="form-section">
            <div class="form-group">
              <label>姓名</label>
              <input v-model="store.taxpayer.name" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>身份证号</label>
                <input v-model="store.taxpayer.idNumber" type="text" />
              </div>
              <div class="form-group">
                <label>纳税人识别号</label>
                <input v-model="store.taxpayer.taxId" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>地址</label>
              <textarea v-model="store.taxpayer.address" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>电话</label>
                <input v-model="store.taxpayer.phone" type="text" />
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input v-model="store.taxpayer.email" type="email" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>婚姻状况</label>
                <select v-model="store.taxpayer.filingStatus">
                  <option value="single">单身</option>
                  <option value="married">已婚</option>
                  <option value="head">户主</option>
                </select>
              </div>
              <div class="form-group">
                <label>税务年度</label>
                <input v-model="store.taxYear" type="text" placeholder="2024" />
              </div>
            </div>
          </div>
          <div v-show="activeTab === '收入'" class="form-section">
            <h4>收入来源</h4>
            <div v-for="(income, index) in store.incomes" :key="index" class="item-row">
              <select v-model="income.type" style="flex: 1;">
                <option value="salary">工资薪金</option>
                <option value="bonus">年终奖</option>
                <option value="business">经营所得</option>
                <option value="rental">租金收入</option>
                <option value="investment">投资收益</option>
                <option value="other">其他收入</option>
              </select>
              <input v-model="income.source" placeholder="来源" style="flex: 1.5;" />
              <input v-model.number="income.amount" type="number" placeholder="金额" />
              <button @click="store.incomes.splice(index, 1)" class="btn-remove-sm">×</button>
            </div>
            <button @click="store.incomes.push({ type: 'salary', source: '', amount: 0, taxWithheld: 0 })" class="btn-add">+ 添加收入</button>
            <div class="summary-box" style="margin-top: 16px;">
              <strong>总收入: ¥{{ store.totalIncome.toFixed(2) }}</strong>
            </div>
          </div>
          <div v-show="activeTab === '扣除'" class="form-section">
            <h4>专项扣除</h4>
            <div v-for="(ded, index) in store.deductions" :key="index" class="item-row">
              <select v-model="ded.type" style="flex: 1;">
                <option value="social">社保</option>
                <option value="housing">住房公积金</option>
                <option value="education">子女教育</option>
                <option value="continuing">继续教育</option>
                <option value="medical">大病医疗</option>
                <option value="mortgage">住房贷款利息</option>
                <option value="rent">住房租金</option>
                <option value="elderly">赡养老人</option>
                <option value="childcare">婴幼儿照护</option>
              </select>
              <input v-model.number="ded.amount" type="number" placeholder="金额" />
              <button @click="store.deductions.splice(index, 1)" class="btn-remove-sm">×</button>
            </div>
            <button @click="store.deductions.push({ type: 'social', description: '', amount: 0 })" class="btn-add">+ 添加扣除</button>
            <div class="summary-box" style="margin-top: 16px;">
              <strong>总扣除: ¥{{ store.totalDeductions.toFixed(2) }}</strong>
            </div>
          </div>
          <div v-show="activeTab === '税额计算'" class="form-section">
            <div class="calc-summary">
              <div class="calc-row">
                <span>总收入</span>
                <strong>¥{{ store.totalIncome.toFixed(2) }}</strong>
              </div>
              <div class="calc-row">
                <span>基本扣除 (60,000)</span>
                <strong>-¥60,000.00</strong>
              </div>
              <div class="calc-row">
                <span>专项扣除</span>
                <strong>-¥{{ store.totalDeductions.toFixed(2) }}</strong>
              </div>
              <div class="calc-row highlight">
                <span>应纳税所得额</span>
                <strong>¥{{ store.taxableIncome.toFixed(2) }}</strong>
              </div>
              <div class="calc-row">
                <span>应纳税额</span>
                <strong>¥{{ store.calculateTax.toFixed(2) }}</strong>
              </div>
              <div class="calc-row">
                <span>已预缴税额</span>
                <input v-model.number="store.payments.withheld" type="number" style="width: 120px; text-align: right;" />
              </div>
              <div class="calc-row final" :class="{ refund: store.refundOrOwed < 0 }">
                <span>{{ store.refundOrOwed >= 0 ? '应补税额' : '应退税额' }}</span>
                <strong>¥{{ Math.abs(store.refundOrOwed).toFixed(2) }}</strong>
              </div>
            </div>
          </div>
          <div v-show="activeTab === '设置'" class="form-section">
            <h4>模板选择</h4>
            <div class="template-grid">
              <div v-for="t in ['official', 'modern', 'simple']" :key="t" :class="['template-card', { active: store.settings.template === t }]" @click="store.settings.template = t">
                <span>{{ { official: '官方', modern: '现代', simple: '简洁' }[t] }}</span>
              </div>
            </div>
            <div class="form-row" style="margin-top: 16px;">
              <div class="form-group">
                <label>主色调</label>
                <input v-model="store.settings.primaryColor" type="color" />
              </div>
            </div>
            <div class="options-grid" style="margin-top: 16px;">
              <label class="checkbox-option"><input type="checkbox" v-model="store.settings.showDetailedCalc" /> 显示详细计算</label>
            </div>
          </div>
          <!-- 数据管理 -->
          <div v-show="activeTab === '数据管理'" class="form-section">
            <SaveLoadPanel 
              document-type="tax_form"
              :get-data="() => store.$state"
              :set-data="(data: any) => store.$patch(data)"
            />
          </div>
        </div>
      </div>
      <div class="preview-panel">
        <div class="preview-toolbar">
          <span>税务表单预览</span>
          <div class="toolbar-actions">
            <button @click="showEmailModal = true" class="btn-email">📧 发送邮件</button>
            <button @click="downloadPDF" class="btn-download">下载 PDF</button>
          </div>
        </div>
        <div class="preview-container">
          <TaxFormPreview ref="previewRef" />
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`TaxForm_${store.taxYear}`"
      :default-subject="`税务表单 - ${store.taxYear}年度`"
      preview-selector=".tax-form-preview"
      @close="showEmailModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaxFormStore } from '@/stores/taxForm'
import TaxFormPreview from '@/components/TaxFormPreview.vue'
import EmailModal from '@/components/EmailModal.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useTaxFormStore()
const activeTab = ref('纳税人信息')
const tabs = ['纳税人信息', '收入', '扣除', '税额计算', '设置', '数据管理']
const previewRef = ref()
const showEmailModal = ref(false)

const downloadPDF = async () => {
  if (!previewRef.value?.$el) return
  const canvas = await html2canvas(previewRef.value.$el, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = pdf.internal.pageSize.getWidth()
  const h = (canvas.height * w) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, w, h)
  pdf.save(`TaxForm_${store.taxpayer.name}_${store.taxYear}.pdf`)
}
</script>

<style scoped>
.tax-form-view { height: 100%; display: flex; flex-direction: column; }
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
.item-row { display: flex; gap: 8px; margin-bottom: 8px; }
.item-row input, .item-row select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
.btn-remove-sm { width: 32px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 18px; }
.btn-add { padding: 10px; background: #eff6ff; color: #2563eb; border: 1px dashed #2563eb; border-radius: 8px; font-size: 13px; cursor: pointer; width: 100%; }
.summary-box { padding: 12px 16px; background: #f0fdf4; border-radius: 8px; }
.calc-summary { background: #f9fafb; border-radius: 12px; padding: 20px; }
.calc-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
.calc-row:last-child { border-bottom: none; }
.calc-row.highlight { background: #eff6ff; margin: 8px -12px; padding: 12px; border-radius: 8px; border: none; }
.calc-row.final { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; margin: 12px -12px -12px -12px; padding: 16px; border-radius: 0 0 8px 8px; border: none; font-size: 16px; }
.calc-row.final.refund { background: linear-gradient(135deg, #22c55e, #16a34a); }
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
