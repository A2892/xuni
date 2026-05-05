<template>
  <div class="visa-checklist-view">
    <section class="header-card">
      <div>
        <h1>📂 签证材料清单</h1>
        <p>按案件维护材料清单，实时查看完成率与截止时间。</p>
      </div>
      <div class="header-actions">
        <button class="btn-ghost" @click="router.push('/visa-center')">返回签证中心</button>
        <button class="btn-primary" @click="applyTemplate" :disabled="!selectedCaseId">一键添加常用清单</button>
      </div>
    </section>

    <section class="panel">
      <div class="case-row">
        <label>选择案件</label>
        <select v-model="selectedCaseId">
          <option value="">请选择案件</option>
          <option v-for="item in store.cases" :key="item.id" :value="item.id">
            {{ item.applicantName }} · {{ item.destinationCountry }} · {{ item.passportNumber }}
          </option>
        </select>
      </div>

      <div v-if="selectedCase" class="progress-box">
        <div class="progress-head">
          <strong>{{ selectedCase.applicantName }}</strong>
          <span>{{ progress }}% 已完成</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>

      <div class="new-task-row">
        <input v-model="newTask.title" type="text" placeholder="新增任务标题，例如：存款证明" />
        <select v-model="newTask.category">
          <option v-for="(label, key) in checklistCategoryLabelMap" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
        <input v-model="newTask.owner" type="text" placeholder="责任人" />
        <input v-model="newTask.dueDate" type="date" />
        <label class="required-check">
          <input v-model="newTask.required" type="checkbox" /> 必传
        </label>
        <button class="btn-primary" @click="addTask">添加任务</button>
      </div>
    </section>

    <section v-if="selectedCaseId" class="panel">
      <h2>任务分组</h2>
      <div v-if="groupedTasks.length === 0" class="empty-state">当前案件还没有任务</div>
      <div v-else class="groups">
        <div v-for="group in groupedTasks" :key="group.category" class="group-card">
          <h3>{{ checklistCategoryLabelMap[group.category] }} ({{ group.items.length }})</h3>
          <div class="task-list">
            <label v-for="task in group.items" :key="task.id" class="task-item">
              <input :checked="task.completed" type="checkbox" @change="store.toggleChecklistTask(task.id)" />
              <div class="task-main">
                <div class="task-line">
                  <strong :class="{ done: task.completed }">{{ task.title }}</strong>
                  <span class="tag" :class="task.required ? 'required' : 'optional'">
                    {{ task.required ? '必传' : '可选' }}
                  </span>
                </div>
                <div class="task-meta">
                  <span>责任人：{{ task.owner || '未指定' }}</span>
                  <span>截止：{{ task.dueDate || '-' }}</span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  checklistCategoryLabelMap,
  useVisaWorkflowStore,
  type VisaChecklistTask
} from '@/stores/visaWorkflow'

const store = useVisaWorkflowStore()
const router = useRouter()
const selectedCaseId = ref(store.cases[0]?.id || '')

const newTask = reactive({
  title: '',
  category: 'identity' as VisaChecklistTask['category'],
  owner: '',
  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  required: true
})

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

const selectedCase = computed(() => store.cases.find((item) => item.id === selectedCaseId.value))

const progress = computed(() => {
  if (!selectedCaseId.value) return 0
  return store.getCaseProgress(selectedCaseId.value)
})

const groupedTasks = computed(() => {
  const tasks = store.checklistTasks.filter((task) => task.caseId === selectedCaseId.value)
  const categories: VisaChecklistTask['category'][] = ['identity', 'funding', 'school', 'travel', 'other']

  return categories
    .map((category) => ({
      category,
      items: tasks
        .filter((task) => task.category === category)
        .sort((a, b) => Number(a.completed) - Number(b.completed))
    }))
    .filter((group) => group.items.length > 0)
})

function addTask(): void {
  if (!selectedCaseId.value) {
    window.alert('请先选择一个案件')
    return
  }

  if (!newTask.title.trim()) {
    window.alert('请填写任务标题')
    return
  }

  store.addChecklistTask({
    caseId: selectedCaseId.value,
    category: newTask.category,
    title: newTask.title.trim(),
    required: newTask.required,
    completed: false,
    dueDate: newTask.dueDate,
    owner: newTask.owner.trim() || '未指定'
  })

  newTask.title = ''
}

function applyTemplate(): void {
  if (!selectedCaseId.value) return
  store.addChecklistTemplate(selectedCaseId.value)
}
</script>

<style scoped>
.visa-checklist-view {
  padding: 20px;
  display: grid;
  gap: 16px;
}

.header-card,
.panel {
  background: #fff;
  border: 1px solid #dfebf7;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 18px rgba(13, 47, 91, 0.06);
}

.header-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  background: linear-gradient(120deg, #f8fdff 0%, #f4fbf8 100%);
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
.case-row,
.new-task-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.case-row label {
  font-weight: 600;
  color: #2f4f73;
}

input,
select,
button {
  border-radius: 10px;
}

input,
select {
  border: 1px solid #cddcec;
  padding: 10px;
  background: #fbfdff;
  color: #183153;
}

.new-task-row input[type='text'] {
  min-width: 240px;
}

.btn-primary,
.btn-ghost {
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
  padding: 9px 12px;
}

.btn-primary {
  background: #0f6dff;
  color: #fff;
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-ghost {
  background: #f1f6fd;
  color: #1e4f8a;
  border-color: #cddff6;
}

.progress-box {
  margin-top: 14px;
  border: 1px solid #dce8f5;
  border-radius: 12px;
  padding: 12px;
  background: #fbfdff;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  color: #1d4068;
  margin-bottom: 8px;
}

.progress-track {
  height: 10px;
  border-radius: 999px;
  background: #e5eef8;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1788ff 0%, #15b677 100%);
}

.groups {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.group-card {
  border: 1px solid #e2ecf7;
  border-radius: 12px;
  padding: 12px;
  background: #fcfeff;
}

.group-card h3 {
  margin: 0 0 10px;
  color: #1c446f;
}

.task-list {
  display: grid;
  gap: 8px;
}

.task-item {
  display: flex;
  gap: 10px;
  border: 1px solid #e4edf8;
  background: #fff;
  border-radius: 10px;
  padding: 8px;
}

.task-main {
  flex: 1;
}

.task-line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.task-line strong {
  color: #1f426a;
}

.task-line strong.done {
  text-decoration: line-through;
  color: #7b8ea4;
}

.task-meta {
  margin-top: 4px;
  color: #58708d;
  font-size: 12px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag {
  border-radius: 999px;
  font-size: 11px;
  padding: 2px 8px;
  font-weight: 700;
}

.tag.required {
  background: #fff0f0;
  color: #b93246;
}

.tag.optional {
  background: #eff5ff;
  color: #2f5cb2;
}

.required-check {
  color: #2f4f73;
  font-size: 13px;
}

.empty-state {
  color: #6783a2;
  text-align: center;
  padding: 24px;
}
</style>
