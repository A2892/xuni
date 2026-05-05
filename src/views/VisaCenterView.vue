<template>
  <div class="visa-center-view">
    <section class="hero-card">
      <div class="hero-text">
        <h1>🛂 签证中心</h1>
        <p>集中管理签证案件、材料进度与面签安排，支持一站式协作。</p>
      </div>
      <div class="hero-actions">
        <button class="btn-primary" @click="showAddForm = !showAddForm">
          {{ showAddForm ? '收起新建' : '新增案件' }}
        </button>
        <button class="btn-ghost" @click="router.push('/visa')">签证生成器</button>
      </div>
    </section>

    <section v-if="showAddForm" class="panel add-panel">
      <h2>新增签证案件</h2>
      <div class="form-grid">
        <input v-model="newCase.applicantName" type="text" placeholder="申请人姓名" />
        <input v-model="newCase.passportNumber" type="text" placeholder="护照号" />
        <input v-model="newCase.destinationCountry" type="text" placeholder="目的国（如 英国）" />
        <input v-model="newCase.visaType" type="text" placeholder="签证类型（如 学生签证）" />
        <input v-model="newCase.assignee" type="text" placeholder="负责人（如 顾问A）" />
        <input v-model="newCase.targetDate" type="date" />
        <select v-model="newCase.priority">
          <option value="low">低优先级</option>
          <option value="medium">中优先级</option>
          <option value="high">高优先级</option>
        </select>
        <select v-model="newCase.status">
          <option v-for="status in visaStatusOrder" :key="status" :value="status">
            {{ visaStatusLabelMap[status] }}
          </option>
        </select>
      </div>
      <textarea v-model="newCase.notes" rows="2" placeholder="备注（可选）"></textarea>
      <div class="panel-actions">
        <button class="btn-primary" @click="handleCreateCase">保存案件</button>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <h3>总案件</h3>
        <p>{{ store.cases.length }}</p>
      </article>
      <article class="stat-card">
        <h3>进行中</h3>
        <p>{{ inProgressCount }}</p>
      </article>
      <article class="stat-card warning">
        <h3>7天内紧急</h3>
        <p>{{ store.urgentCases.length }}</p>
      </article>
      <article class="stat-card success">
        <h3>待面签</h3>
        <p>{{ store.upcomingInterviews.length }}</p>
      </article>
    </section>

    <section class="panel filters-panel">
      <div class="filters-row">
        <input v-model="query" type="text" placeholder="搜索姓名/护照/国家/签证类型" />
        <select v-model="statusFilter">
          <option value="all">全部状态</option>
          <option v-for="status in visaStatusOrder" :key="status" :value="status">
            {{ visaStatusLabelMap[status] }}
          </option>
        </select>
      </div>
      <div class="quick-links">
        <button class="btn-ghost" @click="router.push('/visa-checklist')">材料清单</button>
        <button class="btn-ghost" @click="router.push('/visa-interview')">面签安排</button>
        <button class="btn-ghost" @click="router.push('/visa-progress')">进度追踪</button>
      </div>
    </section>

    <section class="panel list-panel">
      <h2>案件列表</h2>
      <div v-if="filteredCases.length === 0" class="empty-state">暂无匹配案件</div>
      <div v-else class="case-list">
        <article v-for="item in filteredCases" :key="item.id" class="case-card">
          <div class="case-top">
            <div>
              <h3>{{ item.applicantName }}</h3>
              <p>{{ item.passportNumber }} · {{ item.destinationCountry }} · {{ item.visaType }}</p>
            </div>
            <span class="status-badge" :class="item.status">{{ visaStatusLabelMap[item.status] }}</span>
          </div>

          <div class="meta-grid">
            <span>负责人：{{ item.assignee || '未分配' }}</span>
            <span>优先级：{{ priorityLabel[item.priority] }}</span>
            <span>目标日期：{{ item.targetDate }}</span>
            <span>材料完成：{{ store.getCaseProgress(item.id) }}%</span>
          </div>

          <div class="case-foot">
            <span class="days" :class="{ danger: getDaysLeft(item.targetDate) <= 7 }">
              距截止 {{ getDaysLeft(item.targetDate) }} 天
            </span>
            <div class="actions">
              <button class="btn-link" @click="advanceCaseStatus(item.id)">推进状态</button>
              <button class="btn-link" @click="store.addTimelineEntry(item.id, 'manual', '人工备注', '已从签证中心页面补充跟进记录')">
                记一条进展
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useVisaWorkflowStore,
  visaStatusLabelMap,
  visaStatusOrder,
  type VisaCaseStatus,
  type VisaPriority
} from '@/stores/visaWorkflow'

const router = useRouter()
const store = useVisaWorkflowStore()

const showAddForm = ref(false)
const query = ref('')
const statusFilter = ref<'all' | VisaCaseStatus>('all')

const priorityLabel: Record<VisaPriority, string> = {
  low: '低',
  medium: '中',
  high: '高'
}

const newCase = reactive({
  applicantName: '',
  passportNumber: '',
  destinationCountry: '英国',
  visaType: '学生签证',
  status: 'draft' as VisaCaseStatus,
  priority: 'medium' as VisaPriority,
  targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  notes: '',
  assignee: ''
})

const inProgressCount = computed(() => {
  return store.cases.filter((item) => ['collecting', 'submitted', 'interview'].includes(item.status)).length
})

const filteredCases = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return store.cases.filter((item) => {
    const byStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    const byQuery =
      !keyword ||
      item.applicantName.toLowerCase().includes(keyword) ||
      item.passportNumber.toLowerCase().includes(keyword) ||
      item.destinationCountry.toLowerCase().includes(keyword) ||
      item.visaType.toLowerCase().includes(keyword)
    return byStatus && byQuery
  })
})

function handleCreateCase(): void {
  if (!newCase.applicantName.trim() || !newCase.passportNumber.trim()) {
    window.alert('请先填写申请人姓名和护照号')
    return
  }

  store.addCase({
    applicantName: newCase.applicantName.trim(),
    passportNumber: newCase.passportNumber.trim().toUpperCase(),
    destinationCountry: newCase.destinationCountry.trim() || '英国',
    visaType: newCase.visaType.trim() || '学生签证',
    status: newCase.status,
    priority: newCase.priority,
    targetDate: newCase.targetDate,
    notes: newCase.notes.trim(),
    assignee: newCase.assignee.trim()
  })

  newCase.applicantName = ''
  newCase.passportNumber = ''
  newCase.notes = ''
  showAddForm.value = false
}

function getDaysLeft(targetDate: string): number {
  const target = new Date(targetDate).getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  const diff = target - now
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

function advanceCaseStatus(caseId: string): void {
  const item = store.cases.find((entry) => entry.id === caseId)
  if (!item) return
  if (item.status === 'approved' || item.status === 'rejected') return

  const currentIndex = visaStatusOrder.indexOf(item.status)
  const nextIndex = Math.min(currentIndex + 1, visaStatusOrder.indexOf('approved'))
  const nextStatus = visaStatusOrder[nextIndex]
  if (nextStatus && nextStatus !== item.status) {
    store.updateCaseStatus(caseId, nextStatus)
  }
}
</script>

<style scoped>
.visa-center-view {
  padding: 20px;
  display: grid;
  gap: 16px;
}

.hero-card,
.panel,
.stat-card {
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e6edf5;
  box-shadow: 0 8px 20px rgba(10, 39, 78, 0.06);
}

.hero-card {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(120deg, #f4f9ff 0%, #eef7f4 100%);
}

.hero-text h1 {
  margin: 0;
  font-size: 24px;
  color: #183153;
}

.hero-text p {
  margin: 8px 0 0;
  color: #45617f;
}

.hero-actions,
.quick-links,
.panel-actions,
.actions,
.filters-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-ghost,
.btn-link {
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: #0f6dff;
  color: #fff;
  padding: 10px 14px;
}

.btn-ghost {
  background: #f1f6fd;
  color: #1e4f8a;
  border-color: #cddff6;
  padding: 10px 14px;
}

.btn-link {
  background: #f7fbff;
  color: #25548f;
  border-color: #d5e5f7;
  padding: 7px 10px;
}

.panel {
  padding: 16px;
}

.add-panel .form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #cddcec;
  border-radius: 10px;
  padding: 10px;
  background: #fbfdff;
  color: #183153;
  box-sizing: border-box;
}

.stats-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.stat-card {
  padding: 14px;
}

.stat-card h3 {
  margin: 0;
  color: #4b6480;
  font-size: 13px;
  font-weight: 600;
}

.stat-card p {
  margin: 8px 0 0;
  font-size: 30px;
  color: #12345a;
  font-weight: 700;
}

.stat-card.warning {
  background: #fff9ee;
}

.stat-card.success {
  background: #effcf5;
}

.case-list {
  display: grid;
  gap: 10px;
}

.case-card {
  border: 1px solid #dfebf8;
  border-radius: 12px;
  padding: 12px;
  background: #fbfdff;
}

.case-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: start;
}

.case-top h3 {
  margin: 0;
  color: #173659;
}

.case-top p {
  margin: 5px 0 0;
  color: #4e6682;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.draft { background: #ecf2f7; color: #475a71; }
.status-badge.collecting { background: #eef4ff; color: #2d55b7; }
.status-badge.submitted { background: #fff4db; color: #9d6200; }
.status-badge.interview { background: #f1edff; color: #5c3fb1; }
.status-badge.approved { background: #e9f9ef; color: #1f7f45; }
.status-badge.rejected { background: #ffecef; color: #b12947; }

.meta-grid {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 6px;
  color: #45617f;
  font-size: 13px;
}

.case-foot {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.days {
  color: #1f5e95;
  font-weight: 600;
}

.days.danger {
  color: #c03524;
}

.empty-state {
  text-align: center;
  color: #63809f;
  padding: 24px;
}

@media (max-width: 900px) {
  .hero-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
