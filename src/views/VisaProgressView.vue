<template>
  <div class="visa-progress-view">
    <section class="header-card">
      <div>
        <h1>📈 签证进度追踪</h1>
        <p>可视化案件状态分布、时间线记录与阶段推进。</p>
      </div>
      <div class="header-actions">
        <button class="btn-ghost" @click="router.push('/visa-center')">返回签证中心</button>
        <button class="btn-ghost" @click="router.push('/visa-interview')">前往面签安排</button>
      </div>
    </section>

    <section class="panel board-panel">
      <h2>状态看板</h2>
      <div class="status-board">
        <article v-for="status in visaStatusOrder" :key="status" class="status-col">
          <header>
            <h3>{{ visaStatusLabelMap[status] }}</h3>
            <span>{{ casesByStatus[status].length }}</span>
          </header>
          <div class="cards">
            <div v-for="item in casesByStatus[status]" :key="item.id" class="mini-card">
              <strong>{{ item.applicantName }}</strong>
              <p>{{ item.destinationCountry }} · {{ item.visaType }}</p>
              <small>截止 {{ item.targetDate }}</small>
            </div>
            <div v-if="casesByStatus[status].length === 0" class="mini-empty">暂无</div>
          </div>
        </article>
      </div>
    </section>

    <section class="panel chart-panel">
      <h2>状态占比</h2>
      <div v-for="status in visaStatusOrder" :key="`bar_${status}`" class="bar-row">
        <span>{{ visaStatusLabelMap[status] }}</span>
        <div class="bar-track">
          <div class="bar-fill" :style="{ width: `${getStatusPercent(status)}%` }"></div>
        </div>
        <strong>{{ getStatusPercent(status) }}%</strong>
      </div>
    </section>

    <section class="panel timeline-panel">
      <div class="timeline-header">
        <h2>案件时间线</h2>
        <select v-model="selectedCaseId">
          <option value="">请选择案件</option>
          <option v-for="item in store.cases" :key="item.id" :value="item.id">
            {{ item.applicantName }} · {{ item.destinationCountry }}
          </option>
        </select>
      </div>

      <div class="note-row">
        <input v-model="newNote" type="text" placeholder="记录新的进展说明" />
        <button class="btn-primary" @click="addManualNote">写入时间线</button>
      </div>

      <div v-if="selectedTimeline.length === 0" class="empty-state">该案件暂无时间线记录</div>
      <div v-else class="timeline-list">
        <article v-for="entry in selectedTimeline" :key="entry.id" class="timeline-item">
          <div class="dot" :class="entry.type"></div>
          <div class="content">
            <h3>{{ entry.title }}</h3>
            <p>{{ entry.detail }}</p>
            <small>{{ formatDateTime(entry.at) }}</small>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  useVisaWorkflowStore,
  visaStatusLabelMap,
  visaStatusOrder,
  type VisaCaseStatus
} from '@/stores/visaWorkflow'

const store = useVisaWorkflowStore()
const router = useRouter()

const selectedCaseId = ref(store.cases[0]?.id || '')
const newNote = ref('')

watch(
  () => store.cases,
  (value) => {
    if (!selectedCaseId.value && value.length > 0) {
      const firstCase = value[0]
      if (firstCase) {
        selectedCaseId.value = firstCase.id
      }
    }
  },
  { deep: true }
)

const casesByStatus = computed(() => {
  const result: Record<VisaCaseStatus, typeof store.cases> = {
    draft: [],
    collecting: [],
    submitted: [],
    interview: [],
    approved: [],
    rejected: []
  }

  for (const item of store.cases) {
    result[item.status].push(item)
  }

  return result
})

const selectedTimeline = computed(() => {
  if (!selectedCaseId.value) return []
  return store.getCaseTimeline(selectedCaseId.value)
})

function getStatusPercent(status: VisaCaseStatus): number {
  const total = store.cases.length
  if (total === 0) return 0
  return Math.round((casesByStatus.value[status].length / total) * 100)
}

function addManualNote(): void {
  if (!selectedCaseId.value) {
    window.alert('请先选择一个案件')
    return
  }

  if (!newNote.value.trim()) {
    window.alert('请填写进展内容')
    return
  }

  store.addTimelineEntry(selectedCaseId.value, 'manual', '人工更新进展', newNote.value.trim())
  newNote.value = ''
}

function formatDateTime(raw: string): string {
  const date = new Date(raw)
  if (!Number.isFinite(date.getTime())) return raw
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.visa-progress-view {
  padding: 20px;
  display: grid;
  gap: 16px;
}

.header-card,
.panel {
  border-radius: 14px;
  background: #fff;
  border: 1px solid #dfebf7;
  box-shadow: 0 8px 18px rgba(13, 47, 91, 0.06);
}

.header-card {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  background: linear-gradient(120deg, #f6fcff 0%, #f8fff9 100%);
}

.header-card h1 {
  margin: 0;
  color: #183153;
}

.header-card p {
  margin: 6px 0 0;
  color: #4e6681;
}

.header-actions,
.note-row,
.timeline-header {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.panel {
  padding: 16px;
}

h2 {
  margin-top: 0;
  color: #183153;
}

.btn-primary,
.btn-ghost {
  border-radius: 10px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 9px 12px;
}

.btn-primary {
  background: #0f6dff;
  color: #fff;
}

.btn-ghost {
  background: #f1f6fd;
  border-color: #cddff6;
  color: #1e4f8a;
}

.status-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.status-col {
  border: 1px solid #e2ebf6;
  border-radius: 12px;
  background: #fbfdff;
  padding: 10px;
}

.status-col header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-col h3 {
  margin: 0;
  font-size: 14px;
  color: #2d4f74;
}

.status-col header span {
  border-radius: 999px;
  background: #e8f0fc;
  color: #214f87;
  font-weight: 700;
  font-size: 12px;
  padding: 2px 8px;
}

.cards {
  display: grid;
  gap: 6px;
}

.mini-card {
  border: 1px solid #dde9f7;
  border-radius: 10px;
  background: #fff;
  padding: 8px;
}

.mini-card strong {
  color: #1f426a;
}

.mini-card p,
.mini-card small {
  margin: 4px 0 0;
  color: #5f7793;
}

.mini-empty {
  color: #8da3ba;
  font-size: 13px;
  padding: 8px 0;
}

.bar-row {
  display: grid;
  grid-template-columns: 84px 1fr 44px;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.bar-row span {
  color: #2c4c70;
  font-size: 13px;
}

.bar-track {
  height: 10px;
  border-radius: 999px;
  background: #e6eef8;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1788ff 0%, #15b677 100%);
}

.bar-row strong {
  color: #2b4b6f;
}

.timeline-header {
  justify-content: space-between;
}

.timeline-header select,
.note-row input {
  border: 1px solid #cddcec;
  border-radius: 10px;
  padding: 10px;
  background: #fbfdff;
  color: #183153;
}

.note-row input {
  flex: 1;
  min-width: 240px;
}

.timeline-list {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.timeline-item {
  display: flex;
  gap: 10px;
  border: 1px solid #e2ebf7;
  border-radius: 12px;
  padding: 10px;
  background: #fcfeff;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-top: 6px;
  flex-shrink: 0;
}

.dot.system {
  background: #2f6ee4;
}

.dot.manual {
  background: #16a06b;
}

.content h3 {
  margin: 0;
  color: #173659;
  font-size: 14px;
}

.content p {
  margin: 5px 0;
  color: #4e6682;
}

.content small {
  color: #6e85a0;
}

.empty-state {
  text-align: center;
  color: #6783a2;
  padding: 24px;
}
</style>
