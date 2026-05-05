<template>
  <div class="tax-form-preview" :class="store.settings.template">
    <div class="tax-form" :style="{ '--primary': store.settings.primaryColor }">
      <!-- Header -->
      <div class="header">
        <div class="gov-logo">🏛️</div>
        <div class="title-block">
          <h1>个人所得税年度汇算申报表</h1>
          <p>税务年度: {{ store.taxYear }}</p>
        </div>
        <div class="form-number">
          <span>表单编号</span>
          <strong>TAX-{{ store.taxYear }}-001</strong>
        </div>
      </div>

      <!-- Taxpayer Info -->
      <div class="section">
        <div class="section-header">
          <span class="section-number">1</span>
          <h3>纳税人基本信息</h3>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">姓名</span>
            <span class="value">{{ store.taxpayer.name || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">身份证号</span>
            <span class="value">{{ store.taxpayer.idNumber || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">纳税人识别号</span>
            <span class="value">{{ store.taxpayer.taxId || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">婚姻状况</span>
            <span class="value">{{ filingStatusLabels[store.taxpayer.filingStatus] }}</span>
          </div>
          <div class="info-item full">
            <span class="label">通讯地址</span>
            <span class="value">{{ store.taxpayer.address || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话</span>
            <span class="value">{{ store.taxpayer.phone || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">电子邮箱</span>
            <span class="value">{{ store.taxpayer.email || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Income Section -->
      <div class="section">
        <div class="section-header">
          <span class="section-number">2</span>
          <h3>收入情况</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>收入类型</th>
              <th>收入来源</th>
              <th class="amount">金额 (元)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="income in store.incomes" :key="income.source">
              <td>{{ incomeTypeLabels[income.type] }}</td>
              <td>{{ income.source || '-' }}</td>
              <td class="amount">{{ income.amount.toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2"><strong>收入合计</strong></td>
              <td class="amount"><strong>{{ store.totalIncome.toFixed(2) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Deductions Section -->
      <div class="section">
        <div class="section-header">
          <span class="section-number">3</span>
          <h3>扣除项目</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>扣除类型</th>
              <th class="amount">金额 (元)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>基本减除费用</td>
              <td class="amount">60,000.00</td>
            </tr>
            <tr v-for="ded in store.deductions" :key="ded.type">
              <td>{{ deductionTypeLabels[ded.type] }}</td>
              <td class="amount">{{ ded.amount.toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>扣除合计</strong></td>
              <td class="amount"><strong>{{ (60000 + store.totalDeductions).toFixed(2) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Tax Calculation -->
      <div class="section">
        <div class="section-header">
          <span class="section-number">4</span>
          <h3>税款计算</h3>
        </div>
        <div class="calc-table">
          <div class="calc-row">
            <span>收入总额</span>
            <span class="amount">{{ store.totalIncome.toFixed(2) }}</span>
          </div>
          <div class="calc-row">
            <span>减：扣除合计</span>
            <span class="amount">-{{ (60000 + store.totalDeductions).toFixed(2) }}</span>
          </div>
          <div class="calc-row highlight">
            <span>应纳税所得额</span>
            <span class="amount">{{ store.taxableIncome.toFixed(2) }}</span>
          </div>
          <div class="calc-row">
            <span>适用税率</span>
            <span class="amount">{{ getTaxRate(store.taxableIncome) }}%</span>
          </div>
          <div class="calc-row">
            <span>应纳税额</span>
            <span class="amount">{{ store.calculateTax.toFixed(2) }}</span>
          </div>
          <div class="calc-row">
            <span>减：已预缴税额</span>
            <span class="amount">-{{ store.payments.withheld.toFixed(2) }}</span>
          </div>
          <div class="calc-row final" :class="{ refund: store.refundOrOwed < 0 }">
            <span>{{ store.refundOrOwed >= 0 ? '应补缴税额' : '应退还税额' }}</span>
            <span class="amount">{{ Math.abs(store.refundOrOwed).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Declaration -->
      <div class="declaration">
        <p>本人郑重声明：以上填报内容真实、准确、完整，愿意承担由此产生的法律责任。</p>
        <div class="signature-area">
          <div class="sig-block">
            <span class="label">纳税人签名</span>
            <div class="sig-line"></div>
          </div>
          <div class="sig-block">
            <span class="label">日期</span>
            <div class="sig-line"></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>本表一式两份，一份纳税人留存，一份报送税务机关</p>
        <p class="note">如有疑问，请拨打税务服务热线 12366</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaxFormStore } from '@/stores/taxForm'
const store = useTaxFormStore()

const filingStatusLabels: Record<string, string> = {
  single: '单身',
  married: '已婚',
  head: '户主'
}

const incomeTypeLabels: Record<string, string> = {
  salary: '工资薪金',
  bonus: '年终奖',
  business: '经营所得',
  rental: '租金收入',
  investment: '投资收益',
  other: '其他收入'
}

const deductionTypeLabels: Record<string, string> = {
  social: '社会保险',
  housing: '住房公积金',
  education: '子女教育',
  continuing: '继续教育',
  medical: '大病医疗',
  mortgage: '住房贷款利息',
  rent: '住房租金',
  elderly: '赡养老人',
  childcare: '婴幼儿照护'
}

const getTaxRate = (taxableIncome: number): number => {
  if (taxableIncome <= 36000) return 3
  if (taxableIncome <= 144000) return 10
  if (taxableIncome <= 300000) return 20
  if (taxableIncome <= 420000) return 25
  if (taxableIncome <= 660000) return 30
  if (taxableIncome <= 960000) return 35
  return 45
}
</script>

<style scoped>
.tax-form-preview { display: flex; justify-content: center; }
.tax-form { width: 700px; background: white; font-family: 'SimSun', 'Segoe UI', sans-serif; box-shadow: 0 4px 30px rgba(0,0,0,0.1); border: 1px solid #d1d5db; }

/* Header */
.header { display: flex; align-items: center; gap: 20px; padding: 24px; border-bottom: 2px solid var(--primary); }
.gov-logo { font-size: 48px; }
.title-block { flex: 1; }
.title-block h1 { margin: 0; font-size: 22px; color: #1f2937; }
.title-block p { margin: 4px 0 0 0; font-size: 14px; color: #6b7280; }
.form-number { text-align: right; }
.form-number span { display: block; font-size: 11px; color: #6b7280; }
.form-number strong { font-size: 14px; color: var(--primary); font-family: 'Courier New', monospace; }

/* Section */
.section { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.section-number { width: 28px; height: 28px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; }
.section-header h3 { margin: 0; font-size: 16px; color: #1f2937; }

/* Info Grid */
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.info-item { display: flex; flex-direction: column; padding: 8px 12px; background: #f9fafb; border-radius: 6px; }
.info-item.full { grid-column: span 2; }
.info-item .label { font-size: 11px; color: #6b7280; margin-bottom: 2px; }
.info-item .value { font-size: 14px; color: #1f2937; }

/* Data Table */
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { text-align: left; padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 500; color: #374151; }
.data-table td { padding: 10px 12px; border: 1px solid #e5e7eb; }
.data-table .amount { text-align: right; font-family: 'Courier New', monospace; }
.data-table tfoot td { background: #f9fafb; }

/* Calc Table */
.calc-table { background: #f9fafb; border-radius: 8px; padding: 16px; }
.calc-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
.calc-row:last-child { border-bottom: none; }
.calc-row .amount { font-family: 'Courier New', monospace; font-weight: 500; }
.calc-row.highlight { background: white; margin: 8px -8px; padding: 12px 8px; border-radius: 6px; border: none; }
.calc-row.final { background: var(--primary); color: white; margin: 12px -16px -16px -16px; padding: 14px 16px; border-radius: 0 0 8px 8px; border: none; font-size: 16px; font-weight: 600; }
.calc-row.final.refund { background: #22c55e; }

/* Declaration */
.declaration { padding: 20px 24px; background: #fffbeb; border-bottom: 1px solid #fde68a; }
.declaration p { margin: 0 0 16px 0; font-size: 13px; color: #78350f; }
.signature-area { display: flex; gap: 40px; }
.sig-block { flex: 1; }
.sig-block .label { font-size: 12px; color: #92400e; }
.sig-line { border-bottom: 1px solid #92400e; margin-top: 40px; }

/* Footer */
.footer { padding: 16px 24px; text-align: center; }
.footer p { margin: 0 0 4px 0; font-size: 11px; color: #6b7280; }
.footer .note { color: #9ca3af; }

/* Template Variants */
.tax-form-preview.modern .tax-form { border: none; border-radius: 12px; overflow: hidden; }
.tax-form-preview.modern .header { background: linear-gradient(135deg, var(--primary), #1e40af); color: white; border-bottom: none; }
.tax-form-preview.modern .title-block h1 { color: white; }
.tax-form-preview.modern .title-block p { color: rgba(255,255,255,0.8); }
.tax-form-preview.modern .form-number span { color: rgba(255,255,255,0.7); }
.tax-form-preview.modern .form-number strong { color: white; }

.tax-form-preview.simple .tax-form { box-shadow: none; }
.tax-form-preview.simple .header { padding: 20px 24px; }
.tax-form-preview.simple .gov-logo { font-size: 36px; }
.tax-form-preview.simple .title-block h1 { font-size: 18px; }
.tax-form-preview.simple .section-number { width: 24px; height: 24px; font-size: 12px; }
</style>
