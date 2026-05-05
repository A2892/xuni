import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type VisaCaseStatus = 'draft' | 'collecting' | 'submitted' | 'interview' | 'approved' | 'rejected'
export type VisaPriority = 'low' | 'medium' | 'high'

export interface VisaCaseItem {
  id: string
  applicantName: string
  passportNumber: string
  destinationCountry: string
  visaType: string
  status: VisaCaseStatus
  priority: VisaPriority
  createdAt: string
  updatedAt: string
  targetDate: string
  notes: string
  assignee: string
  interviewDate?: string
}

export interface VisaChecklistTask {
  id: string
  caseId: string
  category: 'identity' | 'funding' | 'school' | 'travel' | 'other'
  title: string
  required: boolean
  completed: boolean
  dueDate: string
  owner: string
}

export interface VisaInterviewItem {
  id: string
  caseId: string
  title: string
  scheduledAt: string
  mode: 'online' | 'onsite'
  location: string
  status: 'todo' | 'done' | 'missed'
  reminderSent: boolean
}

export interface VisaTimelineItem {
  id: string
  caseId: string
  at: string
  type: 'system' | 'manual'
  title: string
  detail: string
}

const STORAGE_KEY = 'vsid:visa-workflow:v1'

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function todayPlus(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function normalizeDate(raw: string): string {
  if (!raw) return new Date().toISOString()
  if (raw.length === 10) return `${raw}T00:00:00.000Z`
  return raw
}

const seedCases: VisaCaseItem[] = [
  {
    id: 'case_seed_1',
    applicantName: '张三',
    passportNumber: 'E12345678',
    destinationCountry: '英国',
    visaType: '学生签证',
    status: 'collecting',
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    targetDate: todayPlus(15),
    notes: '准备 9 月入学，优先处理 CAS 与资金证明。',
    assignee: '顾问A',
    interviewDate: todayPlus(8)
  },
  {
    id: 'case_seed_2',
    applicantName: '李四',
    passportNumber: 'P99887766',
    destinationCountry: '美国',
    visaType: '旅游签证',
    status: 'submitted',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    targetDate: todayPlus(21),
    notes: '已提交 DS-160，等待面签时间。',
    assignee: '顾问B'
  }
]

const seedChecklist: VisaChecklistTask[] = [
  {
    id: 'task_seed_1',
    caseId: 'case_seed_1',
    category: 'identity',
    title: '护照首页扫描件',
    required: true,
    completed: true,
    dueDate: todayPlus(2),
    owner: '学生'
  },
  {
    id: 'task_seed_2',
    caseId: 'case_seed_1',
    category: 'school',
    title: 'CAS/录取通知书',
    required: true,
    completed: false,
    dueDate: todayPlus(5),
    owner: '顾问A'
  },
  {
    id: 'task_seed_3',
    caseId: 'case_seed_2',
    category: 'travel',
    title: '旅行行程说明',
    required: false,
    completed: false,
    dueDate: todayPlus(7),
    owner: '学生'
  }
]

const seedInterviews: VisaInterviewItem[] = [
  {
    id: 'interview_seed_1',
    caseId: 'case_seed_1',
    title: '学生签证面签',
    scheduledAt: `${todayPlus(8)}T10:30:00`,
    mode: 'onsite',
    location: '英国签证中心 - 上海',
    status: 'todo',
    reminderSent: false
  }
]

const seedTimeline: VisaTimelineItem[] = [
  {
    id: 'timeline_seed_1',
    caseId: 'case_seed_1',
    at: new Date().toISOString(),
    type: 'system',
    title: '创建签证案件',
    detail: '系统已初始化案件并分配给顾问A。'
  },
  {
    id: 'timeline_seed_2',
    caseId: 'case_seed_2',
    at: new Date().toISOString(),
    type: 'system',
    title: '提交申请材料',
    detail: '材料包已提交，等待签证中心反馈。'
  }
]

export const visaStatusLabelMap: Record<VisaCaseStatus, string> = {
  draft: '草稿',
  collecting: '收集材料',
  submitted: '已提交',
  interview: '面签阶段',
  approved: '已通过',
  rejected: '已拒签'
}

export const visaStatusOrder: VisaCaseStatus[] = [
  'draft',
  'collecting',
  'submitted',
  'interview',
  'approved',
  'rejected'
]

export const checklistCategoryLabelMap: Record<VisaChecklistTask['category'], string> = {
  identity: '身份材料',
  funding: '资金材料',
  school: '学校材料',
  travel: '行程材料',
  other: '其他材料'
}

export const useVisaWorkflowStore = defineStore('visaWorkflow', () => {
  const cases = ref<VisaCaseItem[]>([])
  const checklistTasks = ref<VisaChecklistTask[]>([])
  const interviews = ref<VisaInterviewItem[]>([])
  const timeline = ref<VisaTimelineItem[]>([])

  const casesByStatus = computed(() => {
    const summary: Record<VisaCaseStatus, number> = {
      draft: 0,
      collecting: 0,
      submitted: 0,
      interview: 0,
      approved: 0,
      rejected: 0
    }

    for (const item of cases.value) {
      summary[item.status] += 1
    }

    return summary
  })

  const urgentCases = computed(() => {
    const now = new Date().getTime()
    const limit = now + 7 * 24 * 60 * 60 * 1000
    return cases.value.filter((item) => {
      if (item.status === 'approved' || item.status === 'rejected') return false
      const target = new Date(item.targetDate).getTime()
      return Number.isFinite(target) && target >= now && target <= limit
    })
  })

  const upcomingInterviews = computed(() => {
    const now = new Date().getTime()
    return interviews.value
      .filter((item) => item.status === 'todo' && new Date(item.scheduledAt).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  })

  function persist(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cases: cases.value,
        checklistTasks: checklistTasks.value,
        interviews: interviews.value,
        timeline: timeline.value
      })
    )
  }

  function hydrate(): void {
    if (typeof window === 'undefined') return

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      cases.value = seedCases
      checklistTasks.value = seedChecklist
      interviews.value = seedInterviews
      timeline.value = seedTimeline
      persist()
      return
    }

    try {
      const parsed = JSON.parse(raw)
      cases.value = Array.isArray(parsed.cases) ? parsed.cases : seedCases
      checklistTasks.value = Array.isArray(parsed.checklistTasks) ? parsed.checklistTasks : seedChecklist
      interviews.value = Array.isArray(parsed.interviews) ? parsed.interviews : seedInterviews
      timeline.value = Array.isArray(parsed.timeline) ? parsed.timeline : seedTimeline
    } catch {
      cases.value = seedCases
      checklistTasks.value = seedChecklist
      interviews.value = seedInterviews
      timeline.value = seedTimeline
      persist()
    }
  }

  function addCase(input: Omit<VisaCaseItem, 'id' | 'createdAt' | 'updatedAt'>): void {
    const next: VisaCaseItem = {
      ...input,
      id: createId('case'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    cases.value.unshift(next)
    addTimelineEntry(next.id, 'manual', '新增签证案件', `已新增申请人 ${next.applicantName} 的签证案件。`)
  }

  function updateCaseStatus(caseId: string, nextStatus: VisaCaseStatus): void {
    const item = cases.value.find((c) => c.id === caseId)
    if (!item || item.status === nextStatus) return
    item.status = nextStatus
    item.updatedAt = new Date().toISOString()
    addTimelineEntry(caseId, 'system', '状态更新', `案件状态已更新为：${visaStatusLabelMap[nextStatus]}`)
  }

  function addChecklistTask(input: Omit<VisaChecklistTask, 'id'>): void {
    checklistTasks.value.unshift({
      ...input,
      id: createId('task')
    })
    addTimelineEntry(input.caseId, 'manual', '新增清单任务', input.title)
  }

  function toggleChecklistTask(taskId: string): void {
    const task = checklistTasks.value.find((entry) => entry.id === taskId)
    if (!task) return
    task.completed = !task.completed
    addTimelineEntry(
      task.caseId,
      'system',
      task.completed ? '完成材料' : '重新打开材料',
      `${task.title} 已${task.completed ? '完成' : '标记为未完成'}`
    )
  }

  function addInterview(input: Omit<VisaInterviewItem, 'id' | 'status' | 'reminderSent'>): void {
    interviews.value.unshift({
      ...input,
      id: createId('interview'),
      status: 'todo',
      reminderSent: false
    })
    addTimelineEntry(input.caseId, 'manual', '新增面签安排', `${input.title} - ${new Date(input.scheduledAt).toLocaleString()}`)
  }

  function markInterviewStatus(interviewId: string, nextStatus: VisaInterviewItem['status']): void {
    const item = interviews.value.find((entry) => entry.id === interviewId)
    if (!item) return
    item.status = nextStatus
    addTimelineEntry(item.caseId, 'system', '面签状态更新', `面签状态已更新为：${nextStatus}`)
  }

  function toggleInterviewReminder(interviewId: string): void {
    const item = interviews.value.find((entry) => entry.id === interviewId)
    if (!item) return
    item.reminderSent = !item.reminderSent
  }

  function addTimelineEntry(caseId: string, type: VisaTimelineItem['type'], title: string, detail: string): void {
    timeline.value.unshift({
      id: createId('timeline'),
      caseId,
      type,
      title,
      detail,
      at: new Date().toISOString()
    })
  }

  function addChecklistTemplate(caseId: string): void {
    const templates: Array<Omit<VisaChecklistTask, 'id'>> = [
      {
        caseId,
        category: 'identity',
        title: '身份证件/护照整本扫描',
        required: true,
        completed: false,
        dueDate: todayPlus(3),
        owner: '学生'
      },
      {
        caseId,
        category: 'funding',
        title: '近 6 个月银行流水',
        required: true,
        completed: false,
        dueDate: todayPlus(4),
        owner: '学生'
      },
      {
        caseId,
        category: 'school',
        title: '录取通知书/CAS',
        required: true,
        completed: false,
        dueDate: todayPlus(5),
        owner: '顾问'
      },
      {
        caseId,
        category: 'travel',
        title: '住宿与机票预订单',
        required: false,
        completed: false,
        dueDate: todayPlus(6),
        owner: '学生'
      }
    ]

    for (const item of templates) {
      addChecklistTask(item)
    }
  }

  function getCaseTimeline(caseId: string): VisaTimelineItem[] {
    return timeline.value
      .filter((entry) => entry.caseId === caseId)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  }

  function getCaseProgress(caseId: string): number {
    const tasks = checklistTasks.value.filter((task) => task.caseId === caseId)
    if (tasks.length === 0) return 0
    const done = tasks.filter((task) => task.completed).length
    return Math.round((done / tasks.length) * 100)
  }

  watch([cases, checklistTasks, interviews, timeline], () => persist(), { deep: true })

  hydrate()

  return {
    cases,
    checklistTasks,
    interviews,
    timeline,
    casesByStatus,
    urgentCases,
    upcomingInterviews,
    addCase,
    updateCaseStatus,
    addChecklistTask,
    toggleChecklistTask,
    addInterview,
    markInterviewStatus,
    toggleInterviewReminder,
    addTimelineEntry,
    addChecklistTemplate,
    getCaseTimeline,
    getCaseProgress,
    normalizeDate
  }
})
