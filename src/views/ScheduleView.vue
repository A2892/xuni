<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWatermarkStore } from '@/stores/watermark'
import { useStudentStore } from '@/stores/student'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import EmailModal from '@/components/EmailModal.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import StudentDocumentPicker from '@/components/StudentDocumentPicker.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import { parseScheduleText, parseScheduleFromExcel, type ParsedScheduleCourse } from '@/utils/scheduleParser'
import { downloadScheduleTemplate } from '@/utils/templateGenerator'
import type { MediaItem } from '@/types/media'

const store = useStudentStore()
const showEmailModal = ref(false)

// 文件上传和解析
const fileInput = ref<HTMLInputElement>()
const parseMessage = ref('')
const parseMessageType = ref<'success' | 'error' | 'info'>('info')
const showParseResult = ref(false)

// 标签页
const activeTab = ref<'info' | 'design' | 'preview' | 'watermark'>('info')
// 子标签状态
const activeSubTab = ref<'info' | 'design' | 'preview'>('info')
const previewMode = ref<'week' | 'table'>('week')

// 导出选项
const showDownloadPanel = ref(false)

// 课程颜色选项
const courseColors = [
  { name: 'Blue', value: '#4B6EF5' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' }
]

// 课程类型
const courseTypes = [
  { value: 'Lecture', label: '讲座' },
  { value: 'Lab', label: '实验' },
  { value: 'Seminar', label: '研讨' },
  { value: 'Offline', label: '线下' }
]

// 授课模式
const teachingModes = [
  { value: 'Offline', label: '线下' },
  { value: 'Online', label: '线上' },
  { value: 'Hybrid', label: '混合' }
]

// 中文转英文的映射函数
function translateToEnglish(text: string, type: 'courseType' | 'teachingMode'): string {
  if (type === 'courseType') {
    const map: Record<string, string> = {
      'Lecture': 'Lecture',
      'Lab': 'Lab',
      'Seminar': 'Seminar',
      'Offline': 'Offline',
      '讲座': 'Lecture',
      '实验': 'Lab',
      '研讨': 'Seminar',
      '线下': 'Offline'
    }
    return map[text] || text
  } else {
    const map: Record<string, string> = {
      'Offline': 'Offline',
      'Online': 'Online',
      'Hybrid': 'Hybrid',
      '线下': 'Offline',
      '线上': 'Online',
      '混合': 'Hybrid'
    }
    return map[text] || text
  }
}

// 英文转中文的映射函数
function translateToChinese(text: string, type: 'courseType' | 'teachingMode'): string {
  if (type === 'courseType') {
    const map: Record<string, string> = {
      'Lecture': '讲座',
      'Lab': '实验',
      'Seminar': '研讨',
      'Offline': '线下',
      '讲座': '讲座',
      '实验': '实验',
      '研讨': '研讨',
      '线下': '线下'
    }
    return map[text] || text
  } else {
    const map: Record<string, string> = {
      'Offline': '线下',
      'Online': '线上',
      'Hybrid': '混合',
      '线下': '线下',
      '线上': '线上',
      '混合': '混合'
    }
    return map[text] || text
  }
}

// 课程数据
const courses = ref([
  {
    id: 1,
    name: 'Introduction to Computer Science',
    code: 'CS101',
    instructor: 'Prof. John Smith',
    location: 'SCI 101',
    credits: 3,
    department: 'School of Computer Science',
    classroom: 'SCI 101',
    building: '',
    startTime: '09:00',
    endTime: '10:30',
    mode: 'Offline',
    type: 'Lecture',
    color: '#4B6EF5',
    days: ['monday', 'wednesday'],
    notes: 'Bring your laptop to every class'
  },
  {
    id: 2,
    name: 'Calculus II',
    code: 'MATH201',
    instructor: 'Dr. Sarah Johnson',
    location: 'MATH 305',
    credits: 4,
    department: 'School of Mathematics',
    classroom: 'MATH 305',
    building: '',
    startTime: '11:00',
    endTime: '12:30',
    mode: 'Offline',
    type: 'Lecture',
    color: '#10B981',
    days: ['tuesday', 'thursday'],
    notes: ''
  },
  {
    id: 3,
    name: 'Intro to CS Lab',
    code: 'CS101L',
    instructor: 'TA Michael Brown',
    location: 'SCI B12',
    credits: 1,
    department: 'School of Computer Science',
    classroom: 'SCI B12',
    building: '',
    startTime: '14:00',
    endTime: '16:00',
    mode: 'Offline',
    type: 'Lab',
    color: '#4B6EF5',
    days: ['friday'],
    notes: ''
  },
  {
    id: 4,
    name: 'Academic Writing',
    code: 'ENG105',
    instructor: 'Prof. Emily Davis',
    location: 'Online',
    credits: 3,
    department: 'School of English',
    classroom: 'Online',
    building: '',
    startTime: '15:30',
    endTime: '17:00',
    mode: 'Online',
    type: 'Seminar',
    color: '#EF4444',
    days: ['monday', 'wednesday'],
    notes: 'Zoom link will be provided in the course portal'
  }
])

// 编辑中的课程
const editingCourse = ref<any>(null)
const showCourseDialog = ref(false)

// 设计选项
const designOptions = ref({
  startTime: '8:00',
  endTime: '20:00',
  headerColor: '#1e40af',
  tableHeaderColor: '#e2e8f0',
  textColor: '#000000',
  borderColor: '#cbd5e1',
  backgroundColor: '#ffffff',
  font: 'Arial',
  watermarkEnabled: true,
  watermarkText: 'OFFICIAL SCHEDULE',
  watermarkColor: '#000000',
  watermarkOpacity: 15,
  watermarkSize: 60,
  watermarkRotation: -30,
  fullScreenWatermark: false,
  fullScreenWatermarkAngle: -45,
  watermarkSpacingX: 80,
  watermarkSpacingY: 40,
  watermarkFontFamily: 'Arial',
  watermarkOverlay: false
})

// Ensure designOptions has watermark-related defaults and keep in sync with global store
const watermark = useWatermarkStore()

// populate missing keys from global watermark store
const ensureKeys = () => {
  const keysWithDefaults: Record<string, any> = {
    diagonalWatermarkEnabled: false,
    diagonalLineWidth: 20,
    diagonalLineSpacing: 40,
    diagonalLineColor: '#000000',
    diagonalLineOpacity: 5,
    diagonalLineRotation: -30,

    textWatermarkEnabled: watermark.settings.textWatermarkEnabled ?? false,
    textWatermarkText: watermark.settings.textWatermarkText ?? 'OFFICIAL DOCUMENT',
    textWatermarkSize: watermark.settings.textWatermarkSize ?? 14,
    textWatermarkColor: watermark.settings.textWatermarkColor ?? '#000000',
    textWatermarkOpacity: watermark.settings.textWatermarkOpacity ?? 5,
    textWatermarkRotation: watermark.settings.textWatermarkRotation ?? -30,
    textWatermarkFontFamily: watermark.settings.textWatermarkFontFamily ?? 'Times New Roman',

    fullScreenWatermarkEnabled: watermark.settings.fullScreenWatermarkEnabled ?? false,
    fullScreenWatermarkText: watermark.settings.fullScreenWatermarkText ?? 'OFFICIAL DOCUMENT',
    fullScreenWatermarkSize: watermark.settings.fullScreenWatermarkSize ?? 14,
    fullScreenWatermarkColor: watermark.settings.fullScreenWatermarkColor ?? '#000000',
    fullScreenWatermarkOpacity: watermark.settings.fullScreenWatermarkOpacity ?? 5,
    fullScreenWatermarkAngle: watermark.settings.fullScreenWatermarkAngle ?? -45,
    fullScreenWatermarkSpacing: watermark.settings.fullScreenWatermarkSpacing ?? 200,
    fullScreenWatermarkFontFamily: watermark.settings.fullScreenWatermarkFontFamily ?? 'Times New Roman',

    watermarkOverlay: watermark.settings.watermarkOverlay ?? false
  }

  for (const k in keysWithDefaults) {
    if (designOptions.value[k] === undefined) designOptions.value[k] = keysWithDefaults[k]
  }

  // ensure per-type overlay flags exist
  if (designOptions.value.watermarkOverlayDiagonal === undefined) designOptions.value.watermarkOverlayDiagonal = false
  if (designOptions.value.watermarkOverlayFullscreen === undefined) designOptions.value.watermarkOverlayFullscreen = watermark.settings.watermarkOverlayFullscreen ?? false
  if (designOptions.value.watermarkOverlayText === undefined) designOptions.value.watermarkOverlayText = watermark.settings.watermarkOverlayText ?? false
}

ensureKeys()

// 唯一 pattern id，避免多个实例冲突
const diagPatternId = ref('diag-' + Math.random().toString(36).slice(2, 8))

let __syncingWatermark = false
watch(
  designOptions,
  (nv) => {
    if (__syncingWatermark) return
    __syncingWatermark = true
    try {
      const keys = Object.keys(watermark.settings)
      for (const k of keys) {
        // 不将页面级斜线设置同步到全局 store
        if (k.startsWith('diagonal')) continue
        if (nv[k] !== undefined) watermark.settings[k] = nv[k]
      }
    } finally { __syncingWatermark = false }
  }, { deep: true }
)

watch(
  () => watermark.settings,
  (nv) => {
    if (__syncingWatermark) return
    __syncingWatermark = true
    try {
      for (const k in nv) {
        // 不从全局 store 覆盖页面级斜线设置
        if (k.startsWith('diagonal')) continue
        if (nv[k] !== undefined) designOptions.value[k] = nv[k]
      }
    } finally { __syncingWatermark = false }
  }, { deep: true }
)

// 全局路由（全局水印 store 已在上方初始化）
const router = useRouter()

function goToWatermarkPage() {
  activeTab.value = 'watermark'
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// NOTE: preview uses `watermark.settings.*` directly for enabled flags

// 显示选项
const displayOptions = ref({
  showWeekend: false,
  showInstructor: true,
  showLocation: true,
  showCredits: true,
  showCourseType: true,
  showNotes: true,
  timeFormat: '12'
})

// 生成时间槽
const timeSlots = computed(() => {
  const slots = []
  const start = parseInt(designOptions.value.startTime.split(':')[0])
  const end = parseInt(designOptions.value.endTime.split(':')[0])
  
  for (let hour = start; hour <= end; hour++) {
    slots.push(`${hour}:00`)
  }
  return slots
})

// 生成课程表网格
const scheduleGrid = computed(() => {
  const grid: any[] = []
  
  timeSlots.value.forEach(time => {
    const row: any = { time }
    const timeHour = parseInt(time.split(':')[0])
    
    ;['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
      const coursesInSlot = courses.value.filter(course => {
        if (!course.days.includes(day)) return false
        
        const courseStartHour = parseInt(course.startTime.split(':')[0])
        const courseEndHour = parseInt(course.endTime.split(':')[0])
        
        return timeHour >= courseStartHour && timeHour < courseEndHour
      })
      
      row[day] = coursesInSlot.length > 0 ? coursesInSlot[0] : null
    })
    
    // 计算这一行应该占据的行数（基于课程持续时间）
    let maxRowSpan = 1
    ;['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
      if (row[day]) {
        const courseStartHour = parseInt(row[day].startTime.split(':')[0])
        if (timeHour === courseStartHour) {
          const courseEndHour = parseInt(row[day].endTime.split(':')[0])
          const duration = courseEndHour - courseStartHour
          maxRowSpan = Math.max(maxRowSpan, duration)
        }
      }
    })
    row.rowSpan = maxRowSpan
    
    grid.push(row)
  })
  
  return grid
})

// 检查一行是否为空（根据当前显示设置）
function isEmptyRow(slot: any) {
  const daysToCheck = displayOptions.value.showWeekend 
    ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  
  // 检查这个时间段是否被任何课程占用
  const timeHour = parseInt(slot.time.split(':')[0])
  
  for (const course of courses.value) {
    const courseStartHour = parseInt(course.startTime.split(':')[0])
    const courseEndHour = parseInt(course.endTime.split(':')[0])
    
    // 如果当前时间在某个课程的时间范围内，并且这个课程在当前显示的某一天
    if (timeHour >= courseStartHour && timeHour < courseEndHour) {
      for (const day of daysToCheck) {
        if (course.days.includes(day)) {
          return false // 不是空行
        }
      }
    }
  }
  
  return true // 是空行
}

// 添加/编辑课程
function addCourse() {
  editingCourse.value = {
    id: Date.now(),
    name: '',
    code: '',
    instructor: '',
    location: '',
    credits: 3,
    department: '',
    classroom: '',
    building: '',
    startTime: '09:00',
    endTime: '10:30',
    mode: '线下',
    type: '讲座',
    color: '#4B6EF5',
    days: [],
    notes: ''
  }
  showCourseDialog.value = true
}

// 触发文件上传
function triggerFileUpload() {
  fileInput.value?.click()
}

// 处理文件上传
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  try {
    parseMessage.value = '正在解析文件，请稍候...'
    parseMessageType.value = 'info'
    showParseResult.value = true
    
    let text = ''
    const fileName = file.name.toLowerCase()
    const fileType = file.type
    
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileType.includes('spreadsheet')) {
      // Excel文件
      text = await extractTextFromExcel(file)
    } else if (fileName.endsWith('.docx') || fileType.includes('wordprocessing')) {
      // Word文件
      text = await extractTextFromWord(file)
    } else if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp)$/i.test(fileName)) {
      // 图片文件 - OCR
      parseMessage.value = '正在进行OCR识别，可能需要几秒钟...'
      text = await extractTextFromImage(file)
    } else {
      // 其他文件（PDF、TXT等）
      text = await readFileAsText(file)
    }
    
    // 解析课程信息
    const parsedCourses = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') 
      ? parseScheduleFromExcel(text) 
      : parseScheduleText(text)
    
    if (parsedCourses.length > 0) {
      // 添加解析的课程到列表
      parsedCourses.forEach((course) => {
        courses.value.push({
          id: Date.now() + Math.random(),
          ...course,
          color: '#4B6EF5'
        })
      })
      parseMessage.value = `✅ 成功识别 ${parsedCourses.length} 门课程！`
      parseMessageType.value = 'success'
      
      setTimeout(() => {
        showParseResult.value = false
      }, 3000)
    } else {
      parseMessage.value = '❌ 未能识别到课程信息，请尝试粘贴文本或手动添加'
      parseMessageType.value = 'error'
    }
  } catch (error) {
    console.error('文件解析失败:', error)
    parseMessage.value = `❌ ${error instanceof Error ? error.message : '文件解析失败'}`
    parseMessageType.value = 'error'
  }
  
  if (target) target.value = ''
}

// 从剪贴板粘贴
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    if (!text) {
      parseMessage.value = '❌ 剪贴板为空'
      parseMessageType.value = 'error'
      showParseResult.value = true
      return
    }
    
    parseMessage.value = '正在解析文本...'
    parseMessageType.value = 'info'
    showParseResult.value = true
    
    const parsedCourses = parseScheduleText(text)
    
    if (parsedCourses.length > 0) {
      parsedCourses.forEach(course => {
        courses.value.push({
          id: Date.now() + Math.random(),
          ...course,
          color: '#4B6EF5'
        })
      })
      parseMessage.value = `✅ 成功识别 ${parsedCourses.length} 门课程！`
      parseMessageType.value = 'success'
      
      setTimeout(() => {
        showParseResult.value = false
      }, 3000)
    } else {
      parseMessage.value = '❌ 未能识别到课程信息，请检查文本格式'
      parseMessageType.value = 'error'
    }
  } catch (error) {
    console.error('粘贴失败:', error)
    parseMessage.value = '❌ 无法读取剪贴板，请手动输入'
    parseMessageType.value = 'error'
  }
}

// 从资料管理选择文档导入
async function handleDocumentSelect(doc: any) {
  if (!doc.file_url) {
    parseMessage.value = '❌ 文档链接无效'
    parseMessageType.value = 'error'
    showParseResult.value = true
    return
  }
  
  try {
    parseMessage.value = '正在从资料管理导入文档...'
    parseMessageType.value = 'info'
    showParseResult.value = true
    
    // 获取文件
    const response = await fetch(doc.file_url)
    const blob = await response.blob()
    const file = new File([blob], doc.document_name, { type: blob.type })
    
    // 模拟文件上传事件
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    
    const mockEvent = {
      target: { files: dataTransfer.files, value: '' }
    } as unknown as Event
    
    await handleFileUpload(mockEvent)
  } catch (error) {
    console.error('从资料管理导入失败:', error)
    parseMessage.value = '❌ 导入失败，请重试'
    parseMessageType.value = 'error'
  }
}

// 清空所有课程
function clearAllCourses() {
  if (confirm('确定要清空所有课程吗？此操作不可撤销。')) {
    courses.value = []
  }
}

// 读取文件为文本
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// Excel解析
async function extractTextFromExcel(file: File): Promise<string> {
  const XLSX = await import('xlsx')
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  
  let allText = ''
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    jsonData.forEach(row => {
      if (row && row.length > 0) {
        allText += row.join('\t') + '\n'
      }
    })
  })
  return allText
}

// Word解析
async function extractTextFromWord(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

// 图片OCR
async function extractTextFromImage(file: File): Promise<string> {
  const Tesseract = await import('tesseract.js')
  const { data: { text } } = await Tesseract.recognize(file, 'eng', {
    logger: (m: any) => {
      if (m.status === 'recognizing text') {
        parseMessage.value = `OCR识别中: ${Math.round(m.progress * 100)}%`
      }
    }
  })
  return text
}

function editCourse(course: any) {
  editingCourse.value = { ...course }
  showCourseDialog.value = true
}

function saveCourse() {
  if (!editingCourse.value) return
  
  const index = courses.value.findIndex(c => c.id === editingCourse.value.id)
  if (index >= 0) {
    courses.value[index] = { ...editingCourse.value }
  } else {
    courses.value.push({ ...editingCourse.value })
  }
  
  closeDialog()
}

function deleteCourse(id: number) {
  courses.value = courses.value.filter(c => c.id !== id)
}

function closeDialog() {
  showCourseDialog.value = false
  editingCourse.value = null
}

function formatTime(time: string) {
  if (!time) return ''
  const [hour, minute] = time.split(':')
  
  if (displayOptions.value.timeFormat === '24') {
    return `${hour}:${minute}`
  }

  const h = parseInt(hour)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h)
  return `${displayHour}:${minute} ${period}`
}

function formatDays(days: string[]) {
  const dayMap: any = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  }
  return days.map(d => dayMap[d]).join(', ')
}

import { downloadAsPDFWithOptions } from '@/utils/documentGenerator'



// 数据管理函数
const getScheduleData = () => {
  return {
    courses: courses.value,
    designOptions: designOptions.value,
    displayOptions: displayOptions.value,
    universityInfo: store.universityInfo,
    studentInfo: store.studentInfo
  }
}

const setScheduleData = (data: any) => {
  if (data.courses) courses.value = data.courses
  if (data.designOptions) designOptions.value = { ...designOptions.value, ...data.designOptions }
  if (data.displayOptions) displayOptions.value = { ...displayOptions.value, ...data.displayOptions }
  if (data.universityInfo) store.updateUniversityInfo(data.universityInfo)
}

// 当用户点击下载时，使用统一的导出面板
function downloadSchedule() {
  showDownloadPanel.value = true
}

// 处理Logo上传
function handleLogoUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: any) => {
    const file = e.target?.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const logoUrl = event.target.result as string
          store.updateUniversityInfo({ logo: logoUrl })
          console.log('Logo uploaded successfully')
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 学生照片上传
const studentPhotoInput = ref<HTMLInputElement | null>(null)

function triggerStudentPhotoUpload() {
  studentPhotoInput.value?.click()
}

function handleStudentPhotoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        store.updateStudentPhoto({ url: e.target.result as string })
      }
    }
    reader.readAsDataURL(file)
  }
}

// 照片库选择
const handlePhotoSelected = (photo: MediaItem) => {
  store.updateStudentPhoto({ url: photo.url })
}

</script>

<template>
  <div class="schedule-page">
    <!-- 标签导航 -->
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'info' }" 
        @click="activeTab = 'info'"
      >
        课程信息
      </button>
      <button 
        :class="{ active: activeTab === 'design' }" 
        @click="activeTab = 'design'"
      >
        设计选项
      </button>
      <button
        :class="{ active: activeTab === 'design' }"
        @click="goToWatermarkPage"
      >
        水印设置
      </button>
      <button 
        :class="{ active: activeTab === 'preview' }" 
        @click="activeTab = 'preview'"
      >
        预览
      </button>
    </div>

    <!-- 课程信息标签页 -->
    <div v-if="activeTab === 'info'" class="tab-content">
      <!-- 数据管理面板 -->
      <SaveLoadPanel 
        document-type="schedule"
        :get-data="getScheduleData"
        :set-data="setScheduleData"
      />
      
      <!-- 课程信息内容 -->
      <div class="info-content">
        <div class="section">
          <h3>基本信息</h3>
          <div class="form-grid-compact">
            <div class="form-group">
              <label>学校名称</label>
              <input v-model="store.universityInfo.name" type="text" />
            </div>
            <div class="form-group">
              <label>学校标志</label>
              <div class="logo-upload-inline">
                <div class="logo-preview-small">
                  <img v-if="store.universityInfo.logo" :src="store.universityInfo.logo" alt="School Logo" />
                  <button v-if="store.universityInfo.logo" class="btn-remove-overlay" @click="store.updateUniversityInfo({ logo: '' })" title="删除">✕</button>
                  <div v-else class="logo-placeholder-small">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="2" fill="#E5E7EB"/>
                    </svg>
                  </div>
                </div>
                <div class="logo-actions">
                  <PhotoSelector v-model="store.universityInfo.logo" />
                  <span class="or-divider">或</span>
                  <button class="logo-btn-inline" type="button" @click="handleLogoUpload">本地上传</button>
                </div>
                <span class="logo-hint-inline">上传学校或组织的Logo</span>
              </div>
            </div>
            <div class="form-group">
              <label>院系/学院</label>
              <input v-model="store.studentInfo.school" type="text" />
            </div>
            <div class="form-group">
              <label>学生姓名</label>
              <input v-model="store.studentInfo.name" type="text" />
            </div>
            <div class="form-group">
              <label>学号</label>
              <input v-model="store.studentInfo.studentId" type="text" />
            </div>
            <div class="form-group">
              <label>学生照片</label>
              <PhotoSelector 
                v-model="store.studentPhoto.url"
                :student-id="store.studentInfo.studentId"
                @photo-selected="handlePhotoSelected"
              />
              <div class="photo-actions" style="margin-top: 10px;">
                <div class="logo-upload-inline">
                  <div class="logo-preview-small" style="width: 60px; height: 75px; position: relative;">
                    <img v-if="store.studentPhoto.url" :src="store.studentPhoto.url" alt="Student Photo" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;" />
                    <div v-else class="logo-placeholder-small" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 24px;">📷</span>
                    </div>
                    <button v-if="store.studentPhoto.url" @click="store.updateStudentPhoto({ url: '' })" class="btn-remove-overlay" title="删除照片">×</button>
                  </div>
                  <button class="logo-btn-inline" type="button" @click="triggerStudentPhotoUpload">本地上传</button>
                  <input ref="studentPhotoInput" type="file" accept="image/*" style="display: none;" @change="handleStudentPhotoUpload" />
                  <span class="logo-hint-inline">从照片库选择或本地上传</span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>专业</label>
              <input v-model="store.studentInfo.major" type="text" />
            </div>
            <div class="form-group">
              <label>学年</label>
              <input v-model="store.studentInfo.academicYear" type="text" />
            </div>
            <div class="form-group">
              <label>学期</label>
              <input v-model="store.studentInfo.term" type="text" />
            </div>
            <div class="form-group">
              <label>课程表标题</label>
              <input value="Course Schedule" type="text" />
            </div>
            <div class="form-group">
              <label>时间格式</label>
              <select v-model="displayOptions.timeFormat">
                <option value="12">12-hour (AM/PM)</option>
                <option value="24">24-hour</option>
              </select>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>显示选项</h3>
          <div class="display-options-grid">
            <div class="option-row">
              <span class="option-label">显示周末</span>
              <div class="toggle-switch">
                <input type="checkbox" v-model="displayOptions.showWeekend" />
                <span class="slider"></span>
              </div>
            </div>
            <div class="option-row">
              <span class="option-label">显示教师</span>
              <div class="toggle-switch">
                <input type="checkbox" v-model="displayOptions.showInstructor" />
                <span class="slider"></span>
              </div>
            </div>
            <div class="option-row">
              <span class="option-label">显示地点</span>
              <div class="toggle-switch">
                <input type="checkbox" v-model="displayOptions.showLocation" />
                <span class="slider"></span>
              </div>
            </div>
            <div class="option-row">
              <span class="option-label">显示课程类型</span>
              <div class="toggle-switch">
                <input type="checkbox" v-model="displayOptions.showCourseType" />
                <span class="slider"></span>
              </div>
            </div>
            <div class="option-row">
              <span class="option-label">显示学分</span>
              <div class="toggle-switch">
                <input type="checkbox" v-model="displayOptions.showCredits" />
                <span class="slider"></span>
              </div>
            </div>
            <div class="option-row">
              <span class="option-label">显示备注</span>
              <div class="toggle-switch">
                <input type="checkbox" v-model="displayOptions.showNotes" />
                <span class="slider"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h3>课程信息</h3>
            <div class="header-actions">
              <button class="template-btn" @click="downloadScheduleTemplate" title="下载Excel模板">
                📥 下载模板
              </button>
              <StudentDocumentPicker 
                button-text="从资料管理导入"
                title="从资料管理选择课程表"
                :accept="['pdf', 'xlsx', 'xls', 'docx', 'jpg', 'jpeg', 'png']"
                @select="handleDocumentSelect"
              />
              <button class="import-btn" @click="triggerFileUpload" title="上传文件识别课程（支持PDF、图片、Excel、Word）">
                📄 导入文件
              </button>
              <button class="paste-btn" @click="pasteFromClipboard" title="从剪贴板粘贴课程表文本">
                📋 粘贴文本
              </button>
              <button class="add-btn" @click="addCourse">+ 添加课程</button>
              <button class="clear-btn" @click="clearAllCourses" v-if="courses.length > 0" title="清空所有课程">
                🗑️ 清空
              </button>
            </div>
            <input ref="fileInput" type="file" accept=".pdf,.txt,.xlsx,.xls,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*" style="display:none" @change="handleFileUpload" />
          </div>
          
          <!-- 解析结果提示 -->
          <div v-if="showParseResult" class="parse-message" :class="parseMessageType">
            {{ parseMessage }}
          </div>

          <div class="course-list">
            <div v-for="course in courses" :key="course.id" class="course-item">
              <div class="course-icon">📚</div>
              <div class="course-details">
                <h4>{{ course.name }}</h4>
                <p class="course-code">{{ course.code }}</p>
                <div class="course-meta">
                  <span class="meta-item">👨‍🏫 {{ course.instructor }}</span>
                  <span class="meta-item">📍 {{ course.location }}</span>
                </div>
                <div class="course-meta">
                  <span class="meta-item">📅 {{ formatDays(course.days) }} {{ formatTime(course.startTime) }} - {{ formatTime(course.endTime) }}</span>
                </div>
                <div class="course-tags">
                  <span class="tag" :style="{ backgroundColor: course.color }">{{ translateToChinese(course.type, 'courseType') }}</span>
                  <span class="tag" style="background-color: #F59E0B;">{{ translateToChinese(course.mode, 'teachingMode') }}</span>
                  <span class="tag" style="background-color: #8B5CF6;">{{ course.credits }} 学分</span>
                </div>
                <p v-if="course.notes" class="course-notes">备注：{{ course.notes }}</p>
              </div>
              <div class="course-actions">
                <button class="icon-btn" @click="editCourse(course)">✏️</button>
                <button class="icon-btn" @click="deleteCourse(course.id)">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设计选项标签页 -->
    <div v-if="activeTab === 'design'" class="tab-content">
      <div class="info-content">
        <div class="section">
          <h3>时间设置</h3>
          <div class="form-grid-compact">
            <div class="form-group">
              <label>开始时间</label>
              <select v-model="designOptions.startTime">
                <option v-for="h in 24" :key="h" :value="`${h-1}:00`">{{ h-1 }}:00</option>
              </select>
            </div>
            <div class="form-group">
              <label>结束时间</label>
              <select v-model="designOptions.endTime">
                <option v-for="h in 24" :key="h" :value="`${h-1}:00`">{{ h-1 }}:00</option>
              </select>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>设计选项</h3>
          <div class="form-grid-compact">
            <div class="form-group">
              <label>标题颜色</label>
              <div class="color-input">
                <div class="color-preview" :style="{ backgroundColor: designOptions.headerColor }"></div>
                <input v-model="designOptions.headerColor" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>表头颜色</label>
              <div class="color-input">
                <div class="color-preview" :style="{ backgroundColor: designOptions.tableHeaderColor }"></div>
                <input v-model="designOptions.tableHeaderColor" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>文字颜色</label>
              <div class="color-input">
                <div class="color-preview" :style="{ backgroundColor: designOptions.textColor }"></div>
                <input v-model="designOptions.textColor" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>边框颜色</label>
              <div class="color-input">
                <div class="color-preview" :style="{ backgroundColor: designOptions.borderColor }"></div>
                <input v-model="designOptions.borderColor" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>背景颜色</label>
              <div class="color-input">
                <div class="color-preview" :style="{ backgroundColor: designOptions.backgroundColor }"></div>
                <input v-model="designOptions.backgroundColor" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>字体</label>
              <select v-model="designOptions.font">
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>
          </div>
      </div>

        

      </div>
    </div>

    <!-- 水印设置标签页（与 Enrollment 完全一致的 UI/布局/控件，绑定到 local `designOptions`） -->
    <div v-if="activeTab === 'watermark'" class="tab-content">
      <div class="info-content">
        <div class="section">
          <h3>设计选项</h3>

          <!-- 设计标签（保持 Enrollment 的子标签结构） -->
          <div class="design-tabs">
            <button :class="{ active: true }">水印设置</button>
          </div>

          <div class="toggle-section">
            <label class="toggle-label">
              <input type="checkbox" v-model="designOptions.watermarkEnabled" class="toggle-input">
              <span class="toggle-text">启用水印</span>
            </label>
          </div>

          <div class="hint-box">水印可以增强证书的安全性和正式性，您可以同时启用斜线和文字水印。</div>

          <!-- 斜线水印 -->
          <section class="form-group">
            <div class="subsection-header">
              <h4>斜线水印</h4>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designOptions.diagonalWatermarkEnabled" class="toggle-input">
              </label>
            </div>
            <p class="hint-text">绘制斜线看重复，不干扰主要内容</p>

            <div class="form-field">
              <label>线条宽度 ({{ designOptions.diagonalLineWidth }}px)</label>
              <input type="range" v-model.number="designOptions.diagonalLineWidth" min="1" max="50" step="1">
            </div>

            <div class="form-field">
              <label>线条间距 ({{ designOptions.diagonalLineSpacing }}px)</label>
              <input type="range" v-model.number="designOptions.diagonalLineSpacing" min="20" max="100" step="5">
              <p class="hint-text">线条间距由水平距离自动计算得出</p>
            </div>

            <div class="form-field">
              <label>斜线颜色</label>
              <div class="color-input">
                <input v-model="designOptions.diagonalLineColor" type="color" />
                <input v-model="designOptions.diagonalLineColor" type="text" />
              </div>
              <p class="hint-text">请不使用纯色或与纸张颜色同近的颜色</p>
            </div>

            <div class="form-field">
              <label>斜线不透明度 ({{ designOptions.diagonalLineOpacity }}%)</label>
              <input type="range" v-model.number="designOptions.diagonalLineOpacity" min="1" max="30" step="1">
            </div>

            <div class="form-field">
              <label>斜线角度 ({{ designOptions.diagonalLineRotation }}°)</label>
              <div class="angle-slider">
                <span>左斜</span>
                <input type="range" v-model.number="designOptions.diagonalLineRotation" min="-90" max="90" step="5">
                <span>右斜</span>
              </div>
            </div>
            <div class="form-field">
              <label>覆盖文本（斜线水印显示在内容上方）</label>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designOptions.watermarkOverlayDiagonal" class="toggle-input" />
              </label>
            </div>
          </section>

          <!-- 文字水印 -->
          <section class="form-group">
            <div class="subsection-header">
              <h4>文字水印</h4>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designOptions.textWatermarkEnabled" class="toggle-input">
              </label>
            </div>
            <p class="hint-text">添加重复文字水印，增强辨识度</p>

            <div class="form-field">
              <label>水印文字</label>
              <input type="text" v-model="designOptions.textWatermarkText" placeholder="OFFICIAL DOCUMENT">
            </div>

            <div class="form-field">
              <label>文字大小 ({{ designOptions.textWatermarkSize }}px)</label>
              <input type="range" v-model.number="designOptions.textWatermarkSize" min="8" max="32" step="1">
            </div>

            <div class="form-field">
              <label>水印字体</label>
              <select v-model="designOptions.textWatermarkFontFamily">
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Helvetica">Helvetica</option>
                <option value="'Allura', cursive">Allura (Script)</option>
                <option value="'Brush Script MT', cursive">Brush Script</option>
              </select>
            </div>

            <div class="form-field">
              <label>文字颜色</label>
              <div class="color-input">
                <input v-model="designOptions.textWatermarkColor" type="color" />
                <input v-model="designOptions.textWatermarkColor" type="text" />
              </div>
              <p class="hint-text">请不使用纯色或与纸张颜色同近的颜色</p>
            </div>

            <div class="form-field">
              <label>文字不透明度 ({{ designOptions.textWatermarkOpacity }}%)</label>
              <input type="range" v-model.number="designOptions.textWatermarkOpacity" min="1" max="30" step="1">
            </div>

            <div class="form-field">
              <label>文字角度 ({{ designOptions.textWatermarkRotation }}°)</label>
              <div class="angle-slider">
                <span>左斜</span>
                <input type="range" v-model.number="designOptions.textWatermarkRotation" min="-90" max="90" step="5">
                <span>右斜</span>
              </div>
            </div>
            <div class="form-field">
              <label>覆盖文本（文字水印显示在内容上方）</label>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designOptions.watermarkOverlayText" class="toggle-input" />
              </label>
            </div>
          </section>

          <!-- 全屏水印 -->
          <section class="form-group">
            <div class="subsection-header">
              <h4>全屏水印</h4>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designOptions.fullScreenWatermarkEnabled" class="toggle-input">
              </label>
            </div>
            <p class="hint-text">在整个证书上重复显示水印文字，增强视觉效果</p>

            <div class="form-field">
              <label>水印文字</label>
              <input v-model="designOptions.fullScreenWatermarkText" type="text" placeholder="OFFICIAL DOCUMENT">
            </div>

            <div class="form-field">
              <label>文字大小 ({{ designOptions.fullScreenWatermarkSize }}px)</label>
              <input type="range" v-model.number="designOptions.fullScreenWatermarkSize" min="8" max="32" step="1">
            </div>

            <div class="form-field">
              <label>水印字体</label>
              <select v-model="designOptions.fullScreenWatermarkFontFamily">
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Helvetica">Helvetica</option>
                <option value="'Allura', cursive">Allura (Script)</option>
                <option value="'Brush Script MT', cursive">Brush Script</option>
              </select>
            </div>

            <div class="form-field">
              <label>文字颜色</label>
              <div class="color-input">
                <input v-model="designOptions.fullScreenWatermarkColor" type="color" />
                <input v-model="designOptions.fullScreenWatermarkColor" type="text" />
              </div>
              <p class="hint-text">请不使用纯色或与纸张颜色同近的颜色</p>
            </div>

            <div class="form-field">
              <label>文字不透明度 ({{ designOptions.fullScreenWatermarkOpacity }}%)</label>
              <input type="range" v-model.number="designOptions.fullScreenWatermarkOpacity" min="1" max="30" step="1">
            </div>

            <div class="form-field">
              <label>水印角度 ({{ designOptions.fullScreenWatermarkAngle }}°)</label>
              <div class="angle-slider">
                <span>左斜</span>
                <input type="range" v-model.number="designOptions.fullScreenWatermarkAngle" min="-90" max="90" step="1">
                <span>右斜</span>
              </div>
            </div>

            <div class="form-field">
              <label>水印间距 ({{ designOptions.fullScreenWatermarkSpacing }}px)</label>
              <input type="range" v-model.number="designOptions.fullScreenWatermarkSpacing" min="100" max="400" step="10">
              <p class="hint-text">调节水印之间的水平和垂直间距</p>
            </div>
            <div class="form-field">
              <label>覆盖文本（全屏水印显示在内容上方）</label>
              <label class="toggle-label-inline">
                <input type="checkbox" v-model="designOptions.watermarkOverlayFullscreen" class="toggle-input" />
              </label>
            </div>
          </section>

          <!-- 水印应用提示 -->
          <div class="tips-section">
            <h4>水印应用提示：</h4>
            <ul>
              <li>文字水印适合在较重要的证书上使用，增加权威性</li>
              <li>斜线水印适合作为背景元素，不干扰主要内容</li>
              <li>水印颜色建议选择与背景有区别的颜色，不要同视觉转线至-15%效果最佳</li>
              <li>调整水印角度可以优化水印覆盖效果，一般建议使用-30°至-45°</li>
              <li>两种水印可以同时使用，但注意不要让水印过多影响正文内容</li>
            </ul>
          </div>

          <!-- 花纹设置 -->
          <div class="toggle-section" style="margin-top:12px;">
            <label class="toggle-label">
              <input type="checkbox" v-model="designOptions.cornerPatternEnabled" class="toggle-input">
              <span class="toggle-text">启用装饰花纹</span>
            </label>
          </div>

          <div v-if="designOptions.cornerPatternEnabled" class="form-grid" style="margin-top:12px;">
            <div class="form-group">
              <label>花纹类型</label>
              <select v-model="designOptions.cornerPattern">
                <option value="Corner Pattern">Corner Pattern</option>
                <option value="Elegant">Elegant</option>
                <option value="Classic">Classic</option>
                <option value="Minimal">Minimal</option>
                <option value="Filigree">Filigree</option>
                <option value="Geometric">Geometric</option>
                <option value="Ornate">Ornate</option>
              </select>
            </div>
            <div class="form-group">
              <label>花纹位置</label>
              <select v-model="designOptions.cornerPosition">
                <option value="All Positions">All Positions</option>
                <option value="Top Corners">Top Corners</option>
                <option value="Bottom Corners">Bottom Corners</option>
              </select>
            </div>
            <div class="form-group">
              <label>花纹颜色</label>
              <div class="color-input">
                <input v-model="designOptions.cornerColor" type="color" />
                <input v-model="designOptions.cornerColor" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>花纹不透明度 ({{ designOptions.cornerOpacity }}%)</label>
              <input type="range" v-model.number="designOptions.cornerOpacity" min="5" max="50" step="5">
            </div>
          </div>

          <div style="margin-top:12px;">

          </div>
        </div>
      </div>
    </div>

    <!-- 预览标签页 -->
    <div v-if="activeTab === 'preview'" class="tab-content">
      <div class="info-content">
        <div class="preview-header">
          <h2>课程表预览</h2>
          <div class="preview-tabs">
            <button :class="{ active: previewMode === 'week' }" @click="previewMode = 'week'">
              周视图
            </button>
            <button :class="{ active: previewMode === 'table' }" @click="previewMode = 'table'">
              表格视图
            </button>
          </div>
        </div>

        <!-- 周视图预览 -->
        <div v-if="previewMode === 'week'" class="preview-container">
          <div class="schedule-preview" :style="{ position: 'relative' }">
            <!-- 水印 -->
            <div v-if="designOptions.watermarkEnabled" class="watermark-overlay" :class="{ 'fullscreen': designOptions.fullScreenWatermarkEnabled || designOptions.fullScreenWatermark }
            " :style="{
              zIndex: ((designOptions.diagonalWatermarkEnabled && designOptions.watermarkOverlayDiagonal) || (designOptions.fullScreenWatermarkEnabled && designOptions.watermarkOverlayFullscreen) || (designOptions.textWatermarkEnabled && designOptions.watermarkOverlayText)) ? 10 : 1,
              columnGap: (designOptions.fullScreenWatermarkEnabled ? (designOptions.fullScreenWatermarkSpacing || designOptions.watermarkSpacingX) : (designOptions.fullScreenWatermark ? designOptions.watermarkSpacingX : '0')) + 'px',
              rowGap: (designOptions.fullScreenWatermarkEnabled ? (designOptions.fullScreenWatermarkSpacing || designOptions.watermarkSpacingY) : (designOptions.fullScreenWatermark ? designOptions.watermarkSpacingY : '0')) + 'px'
            }"> 
              <svg v-if="designOptions.diagonalWatermarkEnabled"
                :style="{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: (designOptions.watermarkOverlayDiagonal ? 100 : 50),
                  mixBlendMode: (designOptions.watermarkOverlayDiagonal ? 'normal' : 'multiply')
                }"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern :id="diagPatternId" patternUnits="userSpaceOnUse" :width="Number(designOptions.diagonalLineSpacing || designOptions.watermarkSpacingX || 40)" :height="Number(designOptions.diagonalLineSpacing || designOptions.watermarkSpacingY || 40)" :patternTransform="`translate(${(designOptions.diagonalLineSpacing||designOptions.watermarkSpacingX||40)/2} ${(designOptions.diagonalLineSpacing||designOptions.watermarkSpacingY||40)/2}) rotate(${designOptions.diagonalLineRotation||designOptions.watermarkRotation||-30}) translate(${-(designOptions.diagonalLineSpacing||designOptions.watermarkSpacingX||40)/2} ${-(designOptions.diagonalLineSpacing||designOptions.watermarkSpacingY||40)/2})`">
                    <rect :x="((designOptions.diagonalLineSpacing||designOptions.watermarkSpacingX||40) - (designOptions.diagonalLineWidth||20))/2" :y="-(designOptions.diagonalLineSpacing||designOptions.watermarkSpacingY||40)" :width="designOptions.diagonalLineWidth||20" :height="(designOptions.diagonalLineSpacing||designOptions.watermarkSpacingY||40)*3" :fill="designOptions.diagonalLineColor || designOptions.watermarkColor || '#000'" :fill-opacity="(designOptions.diagonalLineOpacity||designOptions.watermarkOpacity||5)/100" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" :fill="`url(#${diagPatternId})`" />
              </svg>

              <!-- 全屏文字水印 -->
              <template v-if="designOptions.fullScreenWatermarkEnabled || designOptions.fullScreenWatermark">
                <div v-for="i in 50" :key="i" class="watermark-item" :style="{
                  color: (designOptions.fullScreenWatermarkColor || designOptions.watermarkColor),
                  opacity: ((designOptions.fullScreenWatermarkOpacity !== undefined ? designOptions.fullScreenWatermarkOpacity : designOptions.watermarkOpacity) || 0) / 100,
                  fontSize: ((designOptions.fullScreenWatermarkSize !== undefined ? designOptions.fullScreenWatermarkSize : designOptions.watermarkSize) || 24) + 'px',
                  transform: `rotate(${(designOptions.fullScreenWatermarkRotation !== undefined ? designOptions.fullScreenWatermarkRotation : (designOptions.textWatermarkRotation !== undefined ? designOptions.textWatermarkRotation : designOptions.watermarkRotation || -30))}deg)`,
                  fontWeight: '700',
                  letterSpacing: '2px',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  fontFamily: (designOptions.fullScreenWatermarkFontFamily || designOptions.watermarkFontFamily || designOptions.textWatermarkFontFamily)
                }">
                  {{ designOptions.fullScreenWatermarkText || designOptions.watermarkText || designOptions.textWatermarkText }}
                </div>
              </template>

              <!-- 居中单一文字水印 (独立渲染，允许与全屏同时存在) -->
              <div v-if="designOptions.textWatermarkEnabled || designOptions.textWatermarkText || designOptions.watermarkText" class="watermark-center" :style="{
                color: (designOptions.textWatermarkColor || designOptions.watermarkColor),
                opacity: ((designOptions.textWatermarkOpacity !== undefined ? designOptions.textWatermarkOpacity : designOptions.watermarkOpacity) || 0) / 100,
                fontSize: ((designOptions.textWatermarkSize !== undefined ? designOptions.textWatermarkSize : designOptions.watermarkSize) || 48) + 'px',
                transform: `rotate(${(designOptions.textWatermarkRotation !== undefined ? designOptions.textWatermarkRotation : (designOptions.watermarkRotation || -30))}deg)`,
                fontWeight: '700',
                letterSpacing: '2px',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                fontFamily: (designOptions.textWatermarkFontFamily || designOptions.watermarkFontFamily),
                zIndex: designOptions.watermarkOverlayText ? 10 : 1
              }">
                {{ designOptions.textWatermarkText || designOptions.watermarkText }}
              </div>
            </div>
            <div class="schedule-header">
              <div class="header-left">
                <div class="header-logo">
                  <img v-if="store.universityInfo.logo" :src="store.universityInfo.logo" alt="University Logo" class="university-logo-img" />
                  <svg v-else width="50" height="50" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#4B6EF5" opacity="0.2"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#4B6EF5" stroke-width="2"/>
                    <text x="50" y="58" text-anchor="middle" font-size="24" fill="#4B6EF5" font-weight="bold">IU</text>
                  </svg>
                  <div class="header-title">
                    <h1>{{ store.universityInfo.name || 'International University' }}</h1>
                  </div>
                </div>
                <div class="header-content">
                  <p><strong style="font-weight: 700;">University:</strong> {{ store.universityInfo.name }}</p>
                  <p><strong style="font-weight: 700;">Student:</strong> {{ store.studentInfo.name }} ({{ store.studentInfo.studentId }})</p>
                  <p><strong style="font-weight: 700;">Department/Major:</strong> {{ store.studentInfo.school }} / {{ store.studentInfo.major }}</p>
                  <p><strong style="font-weight: 700;">Term:</strong> {{ store.studentInfo.term }} - {{ store.studentInfo.academicYear }}</p>
                </div>
              </div>
              <div v-if="store.studentPhoto.url" class="student-photo-box">
                <img :src="store.studentPhoto.url" alt="Student Photo" />
              </div>
            </div>

            <table class="schedule-table">
            <thead>
              <tr style="background-color: #e2e8f0;">
                <th style="width: 120px;">Time / Day</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th v-if="displayOptions.showWeekend">Saturday</th>
                <th v-if="displayOptions.showWeekend">Sunday</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(slot, index) in scheduleGrid" :key="index" 
                  :class="{ 'empty-row': isEmptyRow(slot) }">
                <td class="time-cell">{{ formatTime(slot.time + ':00') }}</td>
                <td v-for="day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']" :key="day">
                  <div v-if="slot[day]" class="course-block" :style="{ backgroundColor: slot[day].color }">
                    <div class="course-name">{{ slot[day].name }}</div>
                    <div class="course-details">{{ slot[day].code }} | {{ slot[day].instructor }} | {{ slot[day].location }} | {{ translateToEnglish(slot[day].type, 'courseType') }}</div>
                  </div>
                </td>
                <td v-if="displayOptions.showWeekend" v-for="day in ['saturday', 'sunday']" :key="day">
                  <div v-if="slot[day]" class="course-block" :style="{ backgroundColor: slot[day].color }">
                    <div class="course-name">{{ slot[day].name }}</div>
                    <div class="course-details">{{ slot[day].code }} | {{ slot[day].instructor }} | {{ slot[day].location }} | {{ translateToEnglish(slot[day].type, 'courseType') }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="schedule-legend">
            <h3>Course Legend</h3>
            <div class="legend-grid">
              <div v-for="course in courses" :key="course.id" class="legend-item">
                <span class="legend-color" :style="{ backgroundColor: course.color }"></span>
                <span>{{ course.code }}: {{ course.name }} ({{ course.credits }} Credits)</span>
              </div>
            </div>

            <div v-if="displayOptions.showNotes && courses.some(c => c.notes)" class="notes">
              <h4>Notes</h4>
              <ul>
                <li v-for="course in courses.filter(c => c.notes)" :key="course.id">
                  {{ course.code }}: {{ course.notes }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="download-section">
          <div class="controls-wrapper">
            <button class="email-btn" @click="showEmailModal = true">📧 发送邮件</button>
            <button class="download-btn" @click="downloadSchedule">📥 导出</button>
          </div>
        </div>
      </div>

      <!-- 表格视图预览 -->
      <div v-else class="preview-container">
        <div class="list-view">
          <div class="schedule-header">
            <div class="header-left">
              <div class="header-logo">
                <img v-if="store.universityInfo.logo" :src="store.universityInfo.logo" alt="University Logo" class="university-logo-img" />
                <svg v-else width="50" height="50" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="#4B6EF5" opacity="0.2"/>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#4B6EF5" stroke-width="2"/>
                  <text x="50" y="58" text-anchor="middle" font-size="24" fill="#4B6EF5" font-weight="bold">IU</text>
                </svg>
                <div class="header-title">
                  <h1>{{ store.universityInfo.name || 'International University' }}</h1>
                </div>
              </div>
              <div class="header-content">
                <p><strong style="font-weight: 700;">University:</strong> {{ store.universityInfo.name }}</p>
                <p><strong style="font-weight: 700;">Student:</strong> {{ store.studentInfo.name }} ({{ store.studentInfo.studentId }})</p>
                <p><strong style="font-weight: 700;">Department/Major:</strong> {{ store.studentInfo.school }} / {{ store.studentInfo.major }}</p>
                <p><strong style="font-weight: 700;">Term:</strong> Fall 2023 - 2023-2024</p>
              </div>
            </div>
            <div v-if="store.studentPhoto.url" class="student-photo-box">
              <img :src="store.studentPhoto.url" alt="Student Photo" />
            </div>
          </div>

          <div class="courses-card-list">
            <div v-for="course in courses" :key="course.id" class="course-card-full" :style="{ backgroundColor: course.color }">
              <div class="course-card-header">
                <div class="course-title-section">
                  <h3>{{ course.name }}</h3>
                  <p class="course-code-white">{{ course.code }}</p>
                </div>
                <div class="course-days-time">
                  <div class="days-display">{{ formatDays(course.days) }}</div>
                  <div class="time-display">{{ formatTime(course.startTime) }} - {{ formatTime(course.endTime) }}</div>
                </div>
              </div>
              <div class="course-card-body">
                <div class="course-info-left">
                  <p><strong>Instructor:</strong> {{ course.instructor }}</p>
                  <p><strong>Type:</strong> {{ translateToEnglish(course.type, 'courseType') }}</p>
                  <p v-if="course.notes"><strong>Notes:</strong> {{ course.notes }}</p>
                </div>
                <div class="course-info-right">
                  <p><strong>Location:</strong> {{ course.location }}</p>
                  <p><strong>Credits:</strong> {{ course.credits }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="download-section">
          <div class="controls-wrapper">
            <button class="email-btn" @click="showEmailModal = true">📧 发送邮件</button>
            <button class="download-btn" @click="downloadSchedule">📥 下载</button>
          </div>
        </div>
      </div>
    </div>
    </div>

    <DownloadPanel
      :visible="showDownloadPanel"
      :preview-selector="'.schedule-preview, .list-view'"
      :default-file-name="`Schedule_${store.studentInfo.name || Date.now()}`"
      :default-format="'png'"
      :default-quality="3"
      @close="showDownloadPanel = false"
    />

    <!-- 课程编辑对话框 -->
    <div v-if="showCourseDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ editingCourse.id && courses.find(c => c.id === editingCourse.id) ? '编辑课程' : '添加课程' }}</h3>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        
        <div class="dialog-content">
          <div class="form-grid">
            <div class="form-group">
              <label>课程名称</label>
              <input v-model="editingCourse.name" type="text" placeholder="输入课程名称" />
            </div>
            <div class="form-group">
              <label>课程代码</label>
              <input v-model="editingCourse.code" type="text" placeholder="输入课程代码" />
            </div>
            <div class="form-group">
              <label>授课教师</label>
              <input v-model="editingCourse.instructor" type="text" placeholder="输入授课教师" />
            </div>
            <div class="form-group">
              <label>学分</label>
              <input v-model.number="editingCourse.credits" type="number" min="0" max="10" />
            </div>
            <div class="form-group">
              <label>教学楼</label>
              <input v-model="editingCourse.department" type="text" placeholder="输入教学楼" />
            </div>
            <div class="form-group">
              <label>教室</label>
              <input v-model="editingCourse.classroom" type="text" placeholder="输入教室" />
            </div>
            <div class="form-group">
              <label>其他地点信息</label>
              <input v-model="editingCourse.building" type="text" placeholder="输入其他地点信息" />
            </div>
            <div class="form-group">
              <label>开始时间</label>
              <input v-model="editingCourse.startTime" type="time" />
            </div>
            <div class="form-group">
              <label>结束时间</label>
              <input v-model="editingCourse.endTime" type="time" />
            </div>
            <div class="form-group">
              <label>授课模式</label>
              <select v-model="editingCourse.mode">
                <option v-for="mode in teachingModes" :key="mode.value" :value="mode.value">
                  {{ mode.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>课程类型</label>
              <select v-model="editingCourse.type">
                <option v-for="type in courseTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>课程颜色</label>
              <select v-model="editingCourse.color">
                <option v-for="color in courseColors" :key="color.value" :value="color.value">
                  🔵 {{ color.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group full-width">
            <label>上课日期</label>
            <div class="days-selector">
              <label class="day-checkbox">
                <input type="checkbox" value="monday" v-model="editingCourse.days" />
                周一
              </label>
              <label class="day-checkbox">
                <input type="checkbox" value="tuesday" v-model="editingCourse.days" />
                周二
              </label>
              <label class="day-checkbox">
                <input type="checkbox" value="wednesday" v-model="editingCourse.days" />
                周三
              </label>
              <label class="day-checkbox">
                <input type="checkbox" value="thursday" v-model="editingCourse.days" />
                周四
              </label>
              <label class="day-checkbox">
                <input type="checkbox" value="friday" v-model="editingCourse.days" />
                周五
              </label>
              <label class="day-checkbox">
                <input type="checkbox" value="saturday" v-model="editingCourse.days" />
                周六
              </label>
              <label class="day-checkbox">
                <input type="checkbox" value="sunday" v-model="editingCourse.days" />
                周日
              </label>
            </div>
          </div>

          <div class="form-group full-width">
            <label>备注</label>
            <textarea v-model="editingCourse.notes" rows="3" placeholder="输入课程备注信息"></textarea>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeDialog">取消</button>
          <button class="save-btn" @click="saveCourse">保存课程</button>
        </div>
      </div>
    </div>
    
    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`Schedule_${store.studentInfo.name}`"
      :default-subject="`课程表 - ${store.studentInfo.name}`"
      preview-selector=".schedule-grid, .list-view"
      @close="showEmailModal = false"
    />
  </div>
</template>

<style scoped>
.schedule-page {
  padding: 0;
  max-width: 100%;
  margin: 0;
}

/* 标签导航 */
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #E5E7EB;
  margin-bottom: 0;
  background: white;
  padding: 0 24px;
}

.tabs button {
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: #6B7280;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s;
}

.tabs button.active {
  color: #4B6EF5;
  border-bottom-color: #4B6EF5;
}

.tabs button:hover {
  color: #4B6EF5;
}

/* 子标签 */
.sub-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  background: #F3F4F6;
  border-radius: 8px;
  padding: 4px;
  width: fit-content;
}

.sub-tabs button {
  padding: 10px 24px;
  border: none;
  background: transparent;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
  white-space: nowrap;
}

.sub-tabs button.active {
  background: white;
  color: #1F2937;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 内容区域 */
.tab-content {
  background: #F9FAFB;
  padding: 24px;
  min-height: calc(100vh - 200px);
}

.info-content {
  max-width: 100%;
  margin: 0 auto;
}

/* 章节 */
.section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid #E5E7EB;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin-bottom: 0;
}

/* 紧凑表单网格 - 改为单列布局 */
.form-grid-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.toggle-grid-compact {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

/* 章节 */
.section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid #E5E7EB;
}

.section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin-bottom: 0;
}

/* 表单网格 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4B6EF5;
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

/* 颜色输入 */
.color-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
}

.color-preview {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #D1D5DB;
  flex-shrink: 0;
}

.color-input input {
  flex: 1;
  border: none;
  padding: 0;
  font-family: 'Monaco', 'Courier New', monospace;
}

.color-input input:focus {
  outline: none;
  box-shadow: none;
}

/* 上传框 */
.logo-upload-inline {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
}

.logo-preview-small {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-preview-small img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-placeholder-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.logo-btn-inline {
  padding: 8px 20px;
  background: #1F2937;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  flex-shrink: 0;
}

.logo-btn-inline:hover {
  background: #111827;
}

.logo-hint-inline {
  font-size: 12px;
  color: #9CA3AF;
  flex: 1;
}

.logo-upload-container {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
}

.logo-preview-box {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #E5E7EB;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-preview-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.logo-upload-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  flex: 1;
}

.logo-upload-btn {
  padding: 12px 24px;
  background: #1F2937;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
  width: fit-content;
}

.logo-upload-btn:hover {
  background: #111827;
}

.logo-upload-hint {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
}

.upload-box-inline {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  background: white;
}

.upload-box-inline.has-image {
  background: #F9FAFB;
}

.logo-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #E5E7EB;
  background: white;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 20px;
  border: 2px dashed #D1D5DB;
  border-radius: 6px;
  background: #F9FAFB;
}

.upload-btn {
  padding: 8px 16px;
  background: #1F2937;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.upload-btn:hover {
  background: #111827;
}

.upload-hint {
  font-size: 12px;
  color: #9CA3AF;
  margin: 0;
}

/* 显示选项网格 */
.display-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
  padding: 0;
}

.option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.option-label {
  font-size: 15px;
  color: #1F2937;
  font-weight: 400;
}

/* 切换开关网格 */
.toggle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #F9FAFB;
  border-radius: 6px;
}

.toggle-item label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

/* 切换开关 */
.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
  margin: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #D1D5DB;
  transition: 0.4s;
  border-radius: 24px;
  pointer-events: none;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4B6EF5;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* 按钮 */
.add-btn {
  padding: 8px 16px;
  background: #4B6EF5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.add-btn:hover {
  background: #3B5EE5;
}

/* 课程列表 */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: #F9FAFB;
  transition: all 0.3s;
}

.course-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.course-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.course-details {
  flex: 1;
}

.course-details h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 4px 0;
}

.course-code {
  font-size: 13px;
  color: #6B7280;
  margin: 0 0 8px 0;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.meta-item {
  font-size: 13px;
  color: #4B5563;
}

.course-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.tag {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.course-notes {
  font-size: 12px;
  color: #6B7280;
  margin-top: 8px;
  font-style: italic;
}

.course-actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.icon-btn {
  background: white;
  border: 1px solid #E5E7EB;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s;
}

.icon-btn:hover {
  background: #F3F4F6;
}

/* 预览 */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.preview-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
}

.preview-tabs {
  display: flex;
  gap: 8px;
}

.preview-tabs button {
  padding: 8px 16px;
  border: 1px solid #D1D5DB;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.preview-tabs button.active {
  background: #4B6EF5;
  color: white;
  border-color: #4B6EF5;
}

.preview-container {
  background: #F9FAFB;
  border-radius: 8px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.schedule-preview {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

/* 水印样式 */
.watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.watermark-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
  margin-left: -50%;
  margin-top: -10px;
}

.watermark-overlay.fullscreen {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(10, 1fr);
  padding: 20px;
  align-items: center;
  justify-items: center;
}

.watermark-item {
  transform-origin: center;
}

.schedule-header,
.schedule-table,
.schedule-legend {
  position: relative;
  z-index: 1;
}

.schedule-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: none;
  position: relative;
}

.header-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 0;
}

.university-logo-img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.header-title {
  margin-bottom: 0;
}

.header-title h1 {
  font-size: 24px;
  font-weight: 700;
  color: #2563EB;
  margin: 0;
}

.student-photo-box {
  width: 120px;
  height: 150px;
  overflow: hidden;
  background: transparent;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 15px;
}

.student-photo-box img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.header-content {
  width: 100%;
  text-align: center;
}

.header-content p {
  font-size: 14px;
  color: #1F2937;
  margin: 2px 0;
  font-weight: 500;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
}

.schedule-table thead {
  background: #E2E8F0;
}

.schedule-table th {
  padding: 12px;
  text-align: center;
  font-weight: 700;
  font-size: 15px;
  color: #1F2937;
  border: 1px solid #CBD5E1;
}

.schedule-table td {
  padding: 8px;
  border: 1px solid #E5E7EB;
  height: 80px;
  vertical-align: middle;
}

.schedule-table tr.empty-row td {
  height: 40px;
  padding: 4px 8px;
}

.time-cell {
  font-weight: 700;
  color: #1F2937;
  font-size: 15px;
  background: #F9FAFB;
  text-align: center;
  vertical-align: middle;
}

.course-block {
  padding: 10px;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 2px;
}

.course-details {
  font-size: 11px;
  opacity: 0.95;
  line-height: 1.4;
}

.schedule-legend {
  background: #F9FAFB;
  padding: 20px;
  border-radius: 8px;
}

.schedule-legend h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 12px 0;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #4B5563;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.notes h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin: 16px 0 8px 0;
}

.notes ul {
  padding-left: 20px;
  margin: 0;
}

.notes li {
  font-size: 13px;
  color: #4B5563;
  margin-bottom: 4px;
}

.download-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.controls-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.format-selectors.pretty {
  display: flex;
  gap: 8px;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
}

.pretty-select {
  appearance: none;
  -webkit-appearance: none;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: #0f172a;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.pretty-select.format-type {
  min-width: 100px;
}

.pretty-select:not(.format-type) {
  min-width: 180px;
}

.pretty-select:hover {
  border-color: #94a3b8;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.pretty-select:focus {
  outline: none;
  border-color: #4B6EF5;
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.email-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.email-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.download-btn {
  background: linear-gradient(180deg,#1f2937,#111827);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.download-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* 列表视图 */
.list-view {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.list-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #E5E7EB;
}

.list-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #2563EB;
  margin: 0 0 12px 0;
}

.list-header p {
  font-size: 13px;
  color: #4B5563;
  margin: 4px 0;
}

.list-header-simple {
  text-align: center;
  margin-bottom: 20px;
  padding: 12px 0;
}

.university-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.university-name {
  font-size: 24px;
  color: #2563EB;
  font-weight: 700;
}

.list-header-simple p {
  font-size: 14px;
  color: #1F2937;
  margin: 4px 0;
  font-weight: 400;
}

.list-header-simple strong {
  font-weight: 700;
}

.courses-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-card-full {
  border-radius: 12px;
  overflow: hidden;
  padding: 16px 20px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.course-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.course-title-section h3 {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
}

.course-code-white {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.course-days-time {
  text-align: right;
}

.days-display {
  font-size: 15px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.time-display {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
}

.course-card-body {
  display: flex;
  gap: 24px;
}

.course-info-left,
.course-info-right {
  flex: 1;
}

.course-card-body p {
  font-size: 13px;
  color: white;
  margin: 5px 0;
  line-height: 1.4;
}

.course-card-body strong {
  font-weight: 600;
}

.courses-grid {
  display: grid;
  gap: 16px;
}

.course-card-preview {
  display: flex;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: all 0.3s;
}

.course-card-preview:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-color-bar {
  width: 6px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  padding: 16px;
}

.card-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 4px 0;
}

.card-code {
  font-size: 13px;
  font-weight: 600;
  color: #4B5563;
  margin: 0 0 12px 0;
}

.card-meta p {
  font-size: 13px;
  color: #6B7280;
  margin: 6px 0;
}

.card-notes {
  font-size: 12px;
  color: #6B7280;
  margin-top: 12px;
  font-style: italic;
  padding-top: 12px;
  border-top: 1px solid #E5E7EB;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.dialog-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #9CA3AF;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #F3F4F6;
  color: #1F2937;
}

.dialog-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.days-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.day-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.day-checkbox:hover {
  border-color: #4B6EF5;
  background: #F0F4FF;
}

.day-checkbox input[type="checkbox"] {
  cursor: pointer;
}

.day-checkbox input[type="checkbox"]:checked {
  accent-color: #4B6EF5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #E5E7EB;
}

.cancel-btn {
  padding: 10px 20px;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #F3F4F6;
}

.save-btn {
  padding: 10px 20px;
  background: #1F2937;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.save-btn:hover {
  background: #111827;
}

/* 导入和操作按钮样式 */
.section-header .header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.template-btn, .import-btn, .paste-btn, .clear-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.template-btn {
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  color: white;
}

.template-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(54, 209, 220, 0.4);
}

.import-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.import-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.paste-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.paste-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.clear-btn {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #333;
}

.clear-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(250, 112, 154, 0.4);
}

/* 解析结果提示 */
.parse-message {
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.parse-message.success {
  background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
  color: #155724;
  border: 1px solid #c3e6cb;
}

.parse-message.error {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.parse-message.info {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #004085;
  border: 1px solid #b8daff;
}

/* 水印样式（从 Enrollment 复制，确保视觉一致） */
.diagonal-watermark { display: none; }

.text-watermark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}

.text-watermark::before {
  content: var(--watermark-text);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(var(--text-rotation));
  font-size: var(--text-size);
  color: var(--text-color);
  opacity: var(--text-opacity);
  font-family: var(--text-font);
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: 4px;
}

.fullscreen-watermark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  padding: 40px;
  gap: var(--watermark-spacing, 200px);
}

.watermark-item {
  transform: rotate(-30deg);
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: 2px;
  user-select: none;
}

.toggle-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
}

.toggle-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.toggle-text {
  color: #111827;
}

.hint-box {
  padding: 12px;
  background: #eff6ff;
  border-left: 3px solid #4b6ef5;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
  margin-bottom: 20px;
  line-height: 1.5;
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.subsection-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.toggle-label-inline {
  display: flex;
  align-items: center;
}

.angle-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.angle-slider span {
  font-size: 12px;
  color: #6b7280;
  min-width: 30px;
}

.angle-slider input[type="range"] {
  flex: 1;
}

.tips-section {
  margin-top: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.tips-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.tips-section li {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 8px;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  padding: 0;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4b6ef5;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4b6ef5;
  cursor: pointer;
  border: none;
}

.form-group { margin-bottom: 12px }
.form-field { display:flex; flex-direction:column; margin-bottom:12px }
.color-input { display:flex; gap:8px; align-items:center }
.checkbox-option { display:flex; align-items:center; gap:8px }
</style>
