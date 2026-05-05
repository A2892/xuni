<template>
  <div class="visa-interview-view">
    <section class="header-card">
      <div>
        <h1>🎙️ 签证面签安排</h1>
        <p>管理预约时间、地点与提醒，避免错过关键节点。</p>
      </div>
      <div class="header-actions">
        <button class="btn-ghost" @click="router.push('/visa-center')">返回签证中心</button>
        <button class="btn-ghost" @click="router.push('/visa-progress')">查看进度追踪</button>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <h3>待面签</h3>
        <p>{{ todoCount }}</p>
      </article>
      <article class="stat-card success">
        <h3>已完成</h3>
        <p>{{ doneCount }}</p>
      </article>
      <article class="stat-card warning">
        <h3>未发送提醒</h3>
        <p>{{ pendingReminderCount }}</p>
      </article>
    </section>

    <section class="panel">
      <h2>新增面签安排</h2>
      <div class="form-grid">
        <select v-model="newInterview.caseId">
          <option value="">选择案件</option>
          <option v-for="item in store.cases" :key="item.id" :value="item.id">
            {{ item.applicantName }} · {{ item.destinationCountry }}
          </option>
        </select>
        <input v-model="newInterview.title" type="text" placeholder="面签标题（如 B1/B2 面签）" />
        <input v-model="newInterview.scheduledAt" type="datetime-local" />
        <select v-model="newInterview.mode">
          <option value="onsite">线下面签</option>
          <option value="online">线上视频</option>
        </select>
        <input v-model="newInterview.location" type="text" placeholder="地点/链接" />
        <button class="btn-primary" @click="addInterview">保存</button>
      </div>
    </section>

    <section class="panel">
      <h2>面签列表</h2>
      <div v-if="sortedInterviews.length === 0" class="empty-state">暂无面签安排</div>
      <div v-else class="interview-list">
        <article v-for="item in sortedInterviews" :key="item.id" class="interview-card">
          <div class="interview-top">
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ getCaseTitle(item.caseId) }}</p>
            </div>
            <span class="status-badge" :class="item.status">{{ statusLabel[item.status] }}</span>
          </div>

          <div class="meta">
            <span>时间：{{ formatDateTime(item.scheduledAt) }}</span>
            <span>方式：{{ item.mode === 'onsite' ? '线下' : '线上' }}</span>
            <span>地点：{{ item.location || '-' }}</span>
            <span>提醒：{{ item.reminderSent ? '已发送' : '未发送' }}</span>
          </div>

          <div class="actions">
            <button class="btn-link" @click="store.markInterviewStatus(item.id, 'done')">标记完成</button>
            <button class="btn-link" @click="store.markInterviewStatus(item.id, 'missed')">标记缺席</button>
            <button class="btn-link" @click="store.toggleInterviewReminder(item.id)">
              {{ item.reminderSent ? '取消提醒' : '发送提醒' }}
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useVisaWorkflowStore } from '@/stores/visaWorkflow'

const store = useVisaWorkflowStore()
const router = useRouter()

const statusLabel = {
  todo: '待进行',
  done: '已完成',
  missed: '已错过'
}

const newInterview = reactive({
  caseId: store.cases[0]?.id || '',
  title: '签证面签',
  scheduledAt: '',
  mode: 'onsite' as 'online' | 'onsite',
  location: ''
})

const sortedInterviews = computed(() => {
  return [...store.interviews].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
})

const todoCount = computed(() => store.interviews.filter((item) => item.status === 'todo').length)
const doneCount = computed(() => store.interviews.filter((item) => item.status === 'done').length)
const pendingReminderCount = computed(() => store.interviews.filter((item) => !item.reminderSent).length)

function getCaseTitle(caseId: string): string {
  const item = store.cases.find((entry) => entry.id === caseId)
  if (!item) return '未知案件'
  return `${item.applicantName} · ${item.destinationCountry} · ${item.visaType}`
}

function addInterview(): void {
  if (!newInterview.caseId || !newInterview.scheduledAt || !newInterview.title.trim()) {
    window.alert('请填写案件、标题和时间')
    return
  }

  store.addInterview({
    caseId: newInterview.caseId,
    title: newInterview.title.trim(),
    scheduledAt: new Date(newInterview.scheduledAt).toISOString(),
    mode: newInterview.mode,
    location: newInterview.location.trim()
  })

  newInterview.scheduledAt = ''
  newInterview.location = ''
}

function formatDateTime(raw: string): string {
  if (!raw) return '-'
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
.visa-interview-view {
  padding: 20px;
  display: grid;
  gap: 16px;
}

.header-card,
.panel,
.stat-card {
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
  background: linear-gradient(120deg, #f6fdff 0%, #f8fff6 100%);
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
.actions,
.form-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-ghost,
.btn-link {
  border-radius: 10px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background: #0f6dff;
  color: #fff;
  padding: 9px 12px;
}

.btn-ghost {
  background: #f1f6fd;
  border-color: #cddff6;
  color: #1e4f8a;
  padding: 9px 12px;
}

.btn-link {
  background: #f7fbff;
  border-color: #d5e5f7;
  color: #25548f;
  padding: 7px 10px;
}

.panel {
  padding: 16px;
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
  background: #fffaf0;
}

.stat-card.success {
  background: #effcf5;
}

.form-grid {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
  align-items: center;
}

input,
select {
  border: 1px solid #cddcec;
  border-radius: 10px;
  padding: 10px;
  background: #fbfdff;
  color: #183153;
}

.interview-list {
  display: grid;
  gap: 10px;
}

.interview-card {
  border: 1px solid #e0ebf8;
  border-radius: 12px;
  padding: 12px;
  background: #fbfdff;
}

.interview-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: start;
}

.interview-top h3 {
  margin: 0;
  color: #173659;
}

.interview-top p {
  margin: 6px 0 0;
  color: #4e6682;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.todo { background: #eef4ff; color: #2d55b7; }
.status-badge.done { background: #e9f9ef; color: #1f7f45; }
.status-badge.missed { background: #ffecef; color: #b12947; }

.meta {
  margin-top: 8px;
  display: grid;
  gap: 6px;
  color: #45617f;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  color: #6783a2;
  padding: 24px;
}
</style>
