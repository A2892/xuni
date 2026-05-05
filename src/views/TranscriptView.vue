<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useWatermarkStore } from '@/stores/watermark'
import { useStudentStore } from '@/stores/student'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import EmailModal from '@/components/EmailModal.vue'
import PhotoSelector from '@/components/PhotoSelector.vue'
import StudentDocumentPicker from '@/components/StudentDocumentPicker.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import WatermarkSettingsPanel from '@/components/WatermarkSettingsPanel.vue'
import { parseFromClipboard, smartParseCourses, type ParsedCourse } from '@/utils/transcriptParser'
import { downloadTranscriptTemplate as downloadTemplate } from '@/utils/templateGenerator'
import type { MediaItem } from '@/types/media'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

const store = useStudentStore()
const activeSubTab = ref('成绩信息')
const subTabs = ['成绩信息', '设计选项', '水印设置', '预览']
const showEmailModal = ref(false)
const showDownloadPanel = ref(false)
const barcodeRef = ref<SVGElement>()
const qrCanvas = ref<HTMLCanvasElement>()

// 文件上传和解析
const fileInput = ref<HTMLInputElement>()
const parseMessage = ref('')
const parseMessageType = ref<'success' | 'error' | 'info'>('info')
const showParseResult = ref(false)

const showCourseModal = ref(false)
const editingIndex = ref<number | null>(null)
const courseForm = ref({
  code: '',
  name: '',
  credits: 3,
  grade: 'A',
  semester: 'Fall',
  year: '2023-2024',
  status: '已完成'
})

const courses = ref([
  { code: 'CS101', name: 'Introduction to Computer Science', credits: 3, grade: 'A', semester: 'Fall', year: '2022-2023', status: '已完成' },
  { code: 'MATH201', name: 'Calculus I', credits: 4, grade: 'B+', semester: 'Fall', year: '2022-2023', status: '已完成' },
  { code: 'ENG105', name: 'Academic Writing', credits: 3, grade: 'A-', semester: 'Fall', year: '2022-2023', status: '已完成' },
  { code: 'PHYS101', name: 'Physics for Scientists and Engineers', credits: 4, grade: 'B', semester: 'Fall', year: '2022-2023', status: '已完成' },
  { code: 'CS102', name: 'Data Structures and Algorithms', credits: 3, grade: 'A', semester: 'Spring', year: '2022-2023', status: '已完成' },
  { code: 'MATH202', name: 'Calculus II', credits: 4, grade: 'B+', semester: 'Spring', year: '2022-2023', status: '已完成' },
  { code: 'CS201', name: 'Computer Organization', credits: 3, grade: 'A-', semester: 'Spring', year: '2022-2023', status: '已完成' },
  { code: 'STAT201', name: 'Statistics for Computer Science', credits: 3, grade: 'B+', semester: 'Spring', year: '2022-2023', status: '已完成' },
  { code: 'CS210', name: 'Database Systems', credits: 3, grade: 'A', semester: 'Fall', year: '2023-2024', status: '已完成' },
  { code: 'CS220', name: 'Software Engineering', credits: 3, grade: 'A-', semester: 'Fall', year: '2023-2024', status: '已完成' },
  { code: 'CS230', name: 'Operating Systems', credits: 3, grade: 'B+', semester: 'Fall', year: '2023-2024', status: '已完成' },
  { code: 'CS240', name: 'Computer Networks', credits: 3, grade: 'In Progress', semester: 'Spring', year: '2023-2024', status: '进行中' }
])

const totalCredits = computed(() => {
  return courses.value.reduce((sum, course) => sum + course.credits, 0)
})

const completedCredits = computed(() => {
  return courses.value.filter(c => c.status === '已完成').reduce((sum, course) => sum + course.credits, 0)
})

const gpa = computed(() => {
  const gradePoints: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0
  }
  
  const completedCourses = courses.value.filter(c => c.status === '已完成')
  if (completedCourses.length === 0) return '0.00'
  
  const totalPoints = completedCourses.reduce((sum, course) => {
    return sum + (gradePoints[course.grade] || 0) * course.credits
  }, 0)

  const creditsEarned = completedCourses.reduce((sum, course) => sum + course.credits, 0)
  const gpaValue = creditsEarned === 0 ? 0 : totalPoints / creditsEarned
  return gpaValue.toFixed(2)
})

// 处理文件上传并解析课程信息
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target?.files?.[0]
  if (!file) return

  try {
    parseMessage.value = '正在解析文件，请稍候...'
    parseMessageType.value = 'info'
    showParseResult.value = true

    let text = ''
    const fileName = file.name.toLowerCase()
    const fileType = file.type

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileType.includes('spreadsheet')) {
      text = await extractTextFromExcel(file)
    } else if (fileName.endsWith('.docx') || fileType.includes('wordprocessing')) {
      text = await extractTextFromWord(file)
    } else if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp)$/i.test(fileName)) {
      parseMessage.value = '正在进行OCR识别，可能需要几秒钟...'
      text = await extractTextFromImage(file)
    } else {
      text = await readFileAsText(file)
    }

    // 使用智能解析器识别课程
    const parsedCourses = smartParseCourses(text)

    if (parsedCourses.length > 0) {
      // 添加解析的课程到列表
      courses.value.push(...parsedCourses)
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

  // 清空 input 以允许重复选择同一文件
  if (target) target.value = ''
}

// Excel解析
const extractTextFromExcel = async (file: File): Promise<string> => {
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
const extractTextFromWord = async (file: File): Promise<string> => {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

// 图片OCR
const extractTextFromImage = async (file: File): Promise<string> => {
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

// 读取文件为文本
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// 从剪贴板粘贴文本
const pasteFromClipboard = async () => {
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
    
    const parsedCourses = parseFromClipboard(text)
    
    if (parsedCourses.length > 0) {
      courses.value.push(...parsedCourses)
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
const handleDocumentSelect = async (doc: any) => {
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
const clearAllCourses = () => {
  if (confirm('确定要清空所有课程吗？此操作不可撤销。')) {
    courses.value = []
  }
}

// Download handled by DownloadPanel

const photoInput = ref<HTMLInputElement>()
const logoInput = ref<HTMLInputElement>()

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.updateStudentPhoto({ url: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

// 照片库选择
const handlePhotoSelected = (photo: MediaItem) => {
  store.updateStudentPhoto({ url: photo.url })
}

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.updateUniversityInfo({ logo: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

const triggerLogoUpload = () => {
  logoInput.value?.click()
}

// 设计选项
const designSettings = ref({
  exportFormat: 'PNG',
  exportQuality: '超高清 (推荐)',
  // 颜色和字体
  titleColor: '#1e40af',
  headerColor: '#e2e8f0',
  textColor: '#000000',
  accentColor: '#4f46e5',
  bgColor: '#ffffff',
  fontFamily: 'Times New Roman',
  
  // 水印设置
  watermarkEnabled: false,
  watermarkShowText: true,
  watermarkShowStripes: false,
  watermarkText: 'OFFICIAL TRANSCRIPT',
  fullScreenWatermarkText: 'OFFICIAL TRANSCRIPT',
  watermarkColor: '#cccccc',
  // 各类水印独立颜色（若未设置则回退到 watermarkColor）
  textWatermarkColor: '#cccccc',
  stripeWatermarkColor: '#cccccc',
  fullScreenWatermarkColor: '#cccccc',
  // 透明度拆分：斜线、文字、全屏分别独立控制
  watermarkStripeOpacity: 15,
  textWatermarkOpacity: 15,
  fullScreenWatermarkOpacity: 15,
  fullScreenWatermarkSpacing: 200,
  fullScreenWatermarkAngle: -45,
  fullScreenWatermarkFontFamily: 'Arial',
  // 拆分文字与全屏水印的大小，互不影响
  textWatermarkSize: 60,
  fullScreenWatermarkSize: 60,
  // 独立角度：斜线和文字不再共用同一角度
  stripeWatermarkAngle: -45,
  textWatermarkAngle: -45,
  watermarkAngle: -45,
  watermarkLetterSpacing: 2,
  watermarkLineHeight: 1.2,
  watermarkStripeWidth: 4,  // 斜线宽度
  watermarkStripeSpacing: 4,  // 斜线間距
  fullScreenWatermark: false,  // 全屏水印
  watermarkSpacingX: 80,  // 水平间距
  watermarkSpacingY: 40,  // 垂直间距
  watermarkFontFamily: 'Arial',  // 水印字体
  watermarkOverlay: false,
  // per-type overlay flags
  watermarkOverlayDiagonal: false,
  watermarkOverlayFullscreen: false,
  watermarkOverlayText: false,

  // 额外的资料文本水印（可与主文字水印及全屏水印同时显示）
  extraWatermarkEnabled: false,
  extraWatermarkText: 'SAMPLE DATA',
  extraWatermarkSize: 40,
  extraWatermarkColor: '#cccccc',
  extraWatermarkOpacity: 15,
  extraWatermarkAngle: -45,
  extraWatermarkFontFamily: 'Arial',
  extraWatermarkOverlay: false,

  // 官印设置
  sealType: '',
  sealText: 'OFFICIAL SEAL',
  sealImage: '',
  
  // 边框设置
  borderEnabled: true,
  borderColor: '#1e40af',
  borderStyle: 'solid',
  borderWidth: 3,
  
  // 显示选项
  showPhoto: true,
  showGradeScale: true,
  showGradePoints: true,
  showSemesterGPA: true,
  
  // 条形码和二维码设置
  showBarcode: true,
  barcodeSource: 'generate' as 'generate' | 'upload',
  barcodeImage: '',
  barcodeContent: '',
  showQR: true,
  qrSource: 'generate' as 'generate' | 'upload',
  qrImage: '',
  qrContent: '',
  
  // 签名设置
  signatureName: 'Dr. Jane Smith',
  signatureTitle: 'University Registrar',
  signatureSource: 'text' as 'text' | 'upload' | 'gallery',
  signatureImage: '',
  signatureFont: 'Brush Script MT',
  signatureFontSize: 28
})

// 斜线水印已移除：不再生成或应用 repeating-linear-gradient 条纹覆盖。

// 全局水印 store
const watermark = useWatermarkStore()

const textWatermarkStyle = computed(() => {
  if (!designSettings.value.watermarkEnabled || !designSettings.value.watermarkShowText) {
    return { display: 'none' as const }
  }
  
  return {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    minHeight: '100%',
    pointerEvents: 'none' as const,
    zIndex: designSettings.value.watermarkOverlayText ? 10 : 0,
    overflow: 'hidden' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const
  }
})

// 向后兼容：旧的 `watermarkColor` 仍然可用，但当用户在 UI 中改变它时
// 我们只将其应用到文字水印颜色（避免同时修改斜线/全屏的颜色）。
watch(
  () => designSettings.value.watermarkColor,
  (newColor, oldColor) => {
    // 如果用户刻意修改过 text/stripe/full colors，就不覆盖他们的选择。
    if (!designSettings.value.textWatermarkColor || designSettings.value.textWatermarkColor === oldColor) {
      designSettings.value.textWatermarkColor = newColor
    }
  }
)

const watermarkTextStyle = computed(() => {
  return {
    fontSize: `${designSettings.value.fullScreenWatermark ? designSettings.value.fullScreenWatermarkSize : designSettings.value.textWatermarkSize}px`,
    color: designSettings.value.fullScreenWatermark ? (designSettings.value.fullScreenWatermarkColor || designSettings.value.watermarkColor) : (designSettings.value.textWatermarkColor || designSettings.value.watermarkColor),
    opacity: designSettings.value.fullScreenWatermark ? designSettings.value.fullScreenWatermarkOpacity / 100 : designSettings.value.textWatermarkOpacity / 100,
    transform: `rotate(${designSettings.value.fullScreenWatermark ? designSettings.value.fullScreenWatermarkAngle : designSettings.value.textWatermarkAngle}deg)`,
    fontWeight: 'bold' as const,
    userSelect: 'none' as const,
    letterSpacing: `${designSettings.value.watermarkLetterSpacing}px`,
    lineHeight: designSettings.value.watermarkLineHeight,
    whiteSpace: 'pre-wrap' as const,
    textAlign: 'center' as const,
    maxWidth: designSettings.value.fullScreenWatermark ? 'none' : '80vw',
    fontFamily: designSettings.value.fullScreenWatermark ? designSettings.value.fullScreenWatermarkFontFamily : designSettings.value.watermarkFontFamily
  }
})

// 额外资料水印样式
const extraWatermarkOverlayStyle = computed(() => {
  const anyOverlay = designSettings.value.extraWatermarkOverlay
  return {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
    zIndex: anyOverlay ? 11 : 1.2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const extraWatermarkTextStyle = computed(() => {
  return {
    fontSize: `${designSettings.value.extraWatermarkSize}px`,
    color: designSettings.value.extraWatermarkColor || designSettings.value.watermarkColor,
    opacity: (designSettings.value.extraWatermarkOpacity || 15) / 100,
    transform: `rotate(${designSettings.value.extraWatermarkAngle}deg)`,
    fontWeight: 'bold' as const,
    userSelect: 'none' as const,
    letterSpacing: `${designSettings.value.watermarkLetterSpacing}px`,
    lineHeight: designSettings.value.watermarkLineHeight,
    whiteSpace: 'pre-wrap' as const,
    textAlign: 'center' as const,
    fontFamily: designSettings.value.extraWatermarkFontFamily || designSettings.value.watermarkFontFamily
  }
})

function hexToRgba(hex: string, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`
  const h = hex.replace('#','')
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r},${g},${b},${alpha})`
}

const fullScreenBackground = computed(() => {
  if (!designSettings.value.fullScreenWatermark) return {}
  const size = designSettings.value.fullScreenWatermarkSize || 60
  const cell = Math.max(40, size * 2)
  const gap = designSettings.value.fullScreenWatermarkSpacing || 200
  const bgSize = Math.max(40, cell + gap)
  const angle = designSettings.value.fullScreenWatermarkAngle || 0
  const fsColor = designSettings.value.fullScreenWatermarkColor || designSettings.value.watermarkColor || '#cccccc'
  const color = hexToRgba(fsColor, designSettings.value.fullScreenWatermarkOpacity / 100)

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${bgSize}' height='${bgSize}' viewBox='0 0 ${bgSize} ${bgSize}'>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='${size}' fill='${color}' transform='rotate(${angle}, ${bgSize/2}, ${bgSize/2})' font-family='${designSettings.value.fullScreenWatermarkFontFamily || 'Arial'}'>${designSettings.value.fullScreenWatermarkText || ''}</text>` +
    `</svg>`

  const encoded = encodeURIComponent(svg)
  return {
    backgroundImage: `url("data:image/svg+xml;utf8,${encoded}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: `${bgSize}px ${bgSize}px`,
    backgroundPosition: 'center'
    ,
    zIndex: designSettings.value.watermarkOverlayFullscreen ? 10 : 0
  }
})

const stripeBackgroundStyle = computed(() => {
  if (!designSettings.value.watermarkShowStripes || !designSettings.value.watermarkEnabled) return {}
  const angle = designSettings.value.stripeWatermarkAngle || designSettings.value.watermarkAngle || -45
  const width = Math.max(1, designSettings.value.watermarkStripeWidth || 4)
  const gap = Math.max(4, designSettings.value.watermarkStripeSpacing || 40)
  const stripeColor = designSettings.value.stripeWatermarkColor || designSettings.value.watermarkColor || '#cccccc'
  const color = hexToRgba(stripeColor, (designSettings.value.watermarkStripeOpacity || 15) / 100)

  // repeating-linear-gradient: color stripe then transparent gap
  const bg = `repeating-linear-gradient(${angle}deg, ${color} 0 ${width}px, transparent ${width}px ${width + gap}px)`

  return {
    backgroundImage: bg,
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto',
    zIndex: designSettings.value.watermarkOverlayDiagonal ? 10 : 0
  }
})

const transcriptPreviewRef = ref<HTMLElement | null>(null)

const transcriptStyle = computed(() => {
  const baseStyle = {
    fontFamily: designSettings.value.fontFamily,
    backgroundColor: designSettings.value.bgColor,
    color: designSettings.value.textColor
  }
  
  if (designSettings.value.borderEnabled) {
    return {
      ...baseStyle,
      border: `${designSettings.value.borderWidth}px ${designSettings.value.borderStyle} ${designSettings.value.borderColor}`
    }
  }
  
  return baseStyle
})

const contentLayerStyle = computed(() => {
  const anyOverlay = designSettings.value.watermarkOverlayDiagonal || designSettings.value.watermarkOverlayText || designSettings.value.watermarkOverlayFullscreen
  return {
    position: 'relative' as const,
    zIndex: anyOverlay ? 1 : 2
  }
})

// 全屏水印需要根据预览容器尺寸计算重复数量，确保填满整个区域
const fullScreenRepeatCount = ref(200)

function updateFullScreenRepeatCount() {
  const el = transcriptPreviewRef.value
  if (!el) return
  const w = el.clientWidth
  const h = el.clientHeight
  const size = designSettings.value.fullScreenWatermarkSize || 60
  const cell = Math.max(40, size * 2) // 更小的单元以便更多重复项填充
  const count = Math.ceil((w * h) / (cell * cell) * 3) // 更高乘数确保覆盖
  fullScreenRepeatCount.value = Math.max(300, Math.min(count, 10000))
}

let resizeHandler: () => void
onMounted(() => {
  nextTick(() => {
    updateFullScreenRepeatCount()
  })
  resizeHandler = () => updateFullScreenRepeatCount()
  window.addEventListener('resize', resizeHandler)
})

// 初始化：如果用户没有单独填写全屏水印文本，则在首次挂载时使用文字水印作为默认值，之后两者互不影响。
onMounted(() => {
  if (!designSettings.value.fullScreenWatermarkText) {
    designSettings.value.fullScreenWatermarkText = designSettings.value.watermarkText || ''
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
})

const titleLineStyle = computed(() => {
  return {
    height: '3px',
    background: designSettings.value.titleColor
  }
})

// 条形码和二维码渲染
const renderBarcode = () => {
  if (!barcodeRef.value) return
  if (designSettings.value.barcodeSource === 'upload' && designSettings.value.barcodeImage) return
  
  const content = designSettings.value.barcodeContent || store.studentInfo.studentId || '0000000000'
  try {
    JsBarcode(barcodeRef.value, content, {
      format: 'CODE128',
      width: 1.5,
      height: 40,
      displayValue: false,
      margin: 0
    })
  } catch (error) {
    console.error('Barcode generation failed:', error)
  }
}

const renderQRCode = async () => {
  if (!qrCanvas.value) return
  if (designSettings.value.qrSource === 'upload' && designSettings.value.qrImage) return
  
  const qrData = {
    type: 'transcript',
    studentId: store.studentInfo.studentId,
    studentName: store.studentInfo.name,
    university: store.universityInfo.name,
    gpa: gpa.value,
    issueDate: new Date().toISOString().split('T')[0]
  }
  
  try {
    await QRCode.toCanvas(qrCanvas.value, designSettings.value.qrContent || JSON.stringify(qrData), {
      width: 80,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (error) {
    console.error('QR Code generation failed:', error)
  }
}

onMounted(() => {
  nextTick(() => {
    if (designSettings.value.showBarcode) {
      renderBarcode()
    }
    if (designSettings.value.showQR) {
      renderQRCode()
    }
  })
})

// 监听标签页切换，确保预览页面渲染条形码和二维码
watch(
  () => activeSubTab.value,
  (newTab) => {
    if (newTab === '预览') {
      nextTick(() => {
        nextTick(() => {
          if (designSettings.value.showBarcode) {
            renderBarcode()
          }
          if (designSettings.value.showQR) {
            renderQRCode()
          }
        })
      })
    }
  }
)

watch(
  () => [
    designSettings.value.showBarcode,
    designSettings.value.showQR,
    designSettings.value.barcodeSource,
    designSettings.value.barcodeContent,
    designSettings.value.qrSource,
    designSettings.value.qrContent,
    store.studentInfo.studentId
  ],
  () => {
    nextTick(() => {
      nextTick(() => {
        if (designSettings.value.showBarcode) {
          renderBarcode()
        }
        if (designSettings.value.showQR) {
          renderQRCode()
        }
      })
    })
  },
  { deep: true }
)

// 当启用全屏水印时，确保文本水印和水印整体被启用，这样预览才会渲染全屏水印
watch(
  () => designSettings.value.fullScreenWatermark,
  (enabled) => {
    // 当启用全屏水印时，仅确保总体水印开关被启用，不自动更改“显示文本水印”状态。
    if (enabled) {
      designSettings.value.watermarkEnabled = true
    }
  }
)

// 条形码上传处理
const handleBarcodeUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      designSettings.value.barcodeImage = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 二维码上传处理
const handleQRUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      designSettings.value.qrImage = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 签名上传处理
const handleSignatureUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      designSettings.value.signatureImage = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 数据管理函数
const getTranscriptData = () => {
  return {
    courses: courses.value,
    designSettings: designSettings.value,
    universityInfo: store.universityInfo,
    studentInfo: store.studentInfo
  }
}

const setTranscriptData = (data: any) => {
  if (data.courses) courses.value = data.courses
  if (data.designSettings) designSettings.value = { ...designSettings.value, ...data.designSettings }
  if (data.universityInfo) store.updateUniversityInfo(data.universityInfo)
  if (data.studentInfo) store.updateStudentInfo(data.studentInfo)
}

// UI 操作: 触发文件选择框
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// 添加 / 编辑 课程的模态控制
const openAddCourse = () => {
  editingIndex.value = null
  const y = new Date().getFullYear()
  const defaultYear = `${y}-${y + 1}`
  courseForm.value = {
    code: '',
    name: '',
    credits: 3,
    grade: 'A',
    semester: 'Fall',
    year: defaultYear,
    status: '已完成'
  }
  showCourseModal.value = true
}

const openEditCourse = (index: number) => {
  const c = courses.value[index]
  if (!c) return
  editingIndex.value = index
  courseForm.value = { ...c }
  showCourseModal.value = true
}

const saveCourse = () => {
  const payload = { ...courseForm.value }
  if (editingIndex.value === null) {
    courses.value.push(payload)
  } else {
    courses.value[editingIndex.value] = payload
  }
  showCourseModal.value = false
}

const deleteCourse = (index: number) => {
  if (!confirm('确定删除这门课程吗？')) return
  courses.value.splice(index, 1)
}

// 按学年+学期分组，用于预览侧的渲染
const coursesBySemester = computed(() => {
  const map: Record<string, any[]> = {}
  courses.value.forEach(c => {
    const key = `${c.year} ${c.semester}`
    if (!map[key]) map[key] = []
    map[key].push(c)
  })
  return map
})

// 导出模板的包装调用（使用导入的 util）
const downloadTranscriptTemplate = () => {
  try {
    downloadTemplate()
  } catch (e) {
    console.error('下载模板失败', e)
  }
}

// 将成绩字母转换为绩点
const getGradePoints = (grade: string) => {
  const map: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0
  }
  return map[grade] ?? 0
}

// 计算给定学期课程的学期GPA（加权平均），返回字符串保留两位小数
const getSemesterGPA = (semesterCourses: any[]) => {
  if (!Array.isArray(semesterCourses) || semesterCourses.length === 0) return '0.00'
  const completed = semesterCourses.filter(c => c.status === '已完成')
  if (completed.length === 0) return '0.00'
  let totalPoints = 0
  let totalCredits = 0
  completed.forEach(c => {
    const pts = getGradePoints(c.grade) || 0
    const credits = Number(c.credits) || 0
    totalPoints += pts * credits
    totalCredits += credits
  })
  if (totalCredits === 0) return '0.00'
  const val = totalPoints / totalCredits
  return val.toFixed(2)
}

</script>

<template>
  <div class="transcript-page">
    <div class="sub-tabs">
      <button
        v-for="tab in subTabs"
        :key="tab"
        :class="['sub-tab', { active: activeSubTab === tab }]"
        @click="activeSubTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- 成绩信息 -->
    <div v-if="activeSubTab === '成绩信息'" class="info-content">
      <!-- 数据管理面板 -->
      <SaveLoadPanel 
        document-type="transcript"
        :get-data="getTranscriptData"
        :set-data="setTranscriptData"
      />
      
      <div class="info-section">
        <div class="section-header">
          <h2>大学信息</h2>
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>大学名称</label>
            <input v-model="store.universityInfo.name" type="text" placeholder="International University" />
          </div>
          <div class="form-field">
            <label>大学标志</label>
            <div class="logo-upload">
              <div class="logo-preview">
                <img v-if="store.universityInfo.logo" :src="store.universityInfo.logo" alt="Logo" />
                <button v-if="store.universityInfo.logo" class="btn-remove-overlay" @click="store.universityInfo.logo = ''" title="删除">✕</button>
                <svg v-else width="60" height="60" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="#4B6EF5" opacity="0.2"/>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#4B6EF5" stroke-width="2"/>
                  <text x="50" y="58" text-anchor="middle" font-size="24" fill="#4B6EF5" font-weight="bold">IU</text>
                </svg>
              </div>
              <input ref="logoInput" type="file" accept="image/*" style="display:none" @change="handleLogoUpload" />
              <div class="logo-actions">
                <PhotoSelector v-model="store.universityInfo.logo" />
                <span class="or-divider">或</span>
                <button class="upload-btn" @click="triggerLogoUpload">本地上传</button>
              </div>
              <p class="help-text">上传学校或组织的Logo</p>
            </div>
          </div>
          <div class="form-field full">
            <label>大学地址</label>
            <input v-model="store.universityInfo.address" type="text" placeholder="123 University Avenue, Boston, MA 02115" />
          </div>
          <div class="form-field">
            <label>联系电话</label>
            <input v-model="store.universityInfo.phone" type="text" placeholder="(617) 555-1234" />
          </div>
          <div class="form-field">
            <label>网站</label>
            <input v-model="store.universityInfo.website" type="text" placeholder="www.university.edu" />
          </div>
        </div>

        <!-- 水印渲染已移至预览容器，避免在设置面板显示 -->
      </div>

      <div class="info-section">
        <div class="section-header">
          <h2>学生信息</h2>
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>学生姓名</label>
            <input v-model="store.studentInfo.name" type="text" placeholder="Emily Johnson" />
          </div>
          <div class="form-field">
            <label>学生ID</label>
            <input v-model="store.studentInfo.studentId" type="text" placeholder="2023001001" />
          </div>
          <div class="form-field">
            <label>专业名称</label>
            <input v-model="store.studentInfo.major" type="text" placeholder="Computer Science" />
          </div>
          <div class="form-field">
            <label>院系名称</label>
            <input v-model="store.studentInfo.school" type="text" placeholder="School of Computer Science" />
          </div>
          <div class="form-field">
            <label>学位类型</label>
            <select v-model="store.studentInfo.degree">
              <option>Bachelor's Degree</option>
              <option>Master's Degree</option>
              <option>Doctoral Degree</option>
            </select>
          </div>
          <div class="form-field">
            <label>入学日期</label>
            <input v-model="store.studentInfo.enrollmentYear" type="date" value="2023-09-01" />
          </div>
          <div class="form-field">
            <label>毕业日期</label>
            <input type="date" placeholder="2026-06-30" value="2026-06-30" />
          </div>
          <div class="form-field">
            <label>学生照片</label>
            <PhotoSelector 
              v-model="store.studentPhoto.url"
              :student-id="store.studentInfo.studentId"
              @photo-selected="handlePhotoSelected"
            />
            <div class="photo-upload" style="margin-top: 10px;">
              <div class="photo-preview" style="position: relative;">
                <img v-if="store.studentPhoto.url" :src="store.studentPhoto.url" alt="Student" />
                <span v-else>👤</span>
                <button v-if="store.studentPhoto.url" @click="store.updateStudentPhoto({ url: '' })" class="btn-remove-overlay" title="删除照片">×</button>
              </div>
              <button class="upload-btn" @click="photoInput?.click()">本地上传</button>
              <input ref="photoInput" type="file" accept="image/*" style="display:none" @change="handlePhotoUpload" />
              <p class="help-text">从照片库选择或本地上传</p>
            </div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-header">
          <h2>课程和成绩信息</h2>
          <div class="header-actions">
            <button class="template-btn" @click="downloadTranscriptTemplate" title="下载Excel模板">
              📥 下载模板
            </button>
            <StudentDocumentPicker 
              button-text="从资料管理导入"
              title="从资料管理选择成绩单"
              :accept="['pdf', 'xlsx', 'xls', 'docx', 'jpg', 'jpeg', 'png']"
              @select="handleDocumentSelect"
            />
            <button class="import-btn" @click="triggerFileUpload" title="上传文件识别课程（支持PDF、图片、Excel、Word）">
              📄 导入文件
            </button>
            <button class="paste-btn" @click="pasteFromClipboard" title="从剪贴板粘贴成绩单文本">
              📋 粘贴文本
            </button>
            <button class="add-btn" @click="openAddCourse">+ 添加课程</button>
            <button class="clear-btn" @click="clearAllCourses" v-if="courses.length > 0" title="清空所有课程">
              🗑️ 清空
            </button>
          </div>
          <input ref="fileInput" type="file" accept=".pdf,.txt,.xlsx,.xls,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="display:none" @change="handleFileUpload" />
        </div>
        
        <!-- 解析结果提示 -->
        <div v-if="showParseResult" class="parse-message" :class="parseMessageType">
          {{ parseMessage }}
        </div>

        <div class="course-table">
          <table>
            <thead>
              <tr>
                <th>课程代码</th>
                <th>课程名称</th>
                <th>学分</th>
                <th>成绩</th>
                <th>学期</th>
                <th>学年</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(course, index) in courses" :key="index">
                <td>{{ course.code }}</td>
                <td>{{ course.name }}</td>
                <td>{{ course.credits }}</td>
                <td>{{ course.grade }}</td>
                <td>{{ course.semester }}</td>
                <td>{{ course.year }}</td>
                <td><span :class="['status', course.status]">{{ course.status }}</span></td>
                <td>
                  <button class="icon-btn" @click="openEditCourse(index)" title="编辑">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    </svg>
                  </button>
                  <button class="icon-btn" @click="deleteCourse(index)" title="删除">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-label">总学分</div>
            <div class="stat-value">{{ totalCredits }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">已完成学分</div>
            <div class="stat-value">{{ completedCredits }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">当前GPA</div>
            <div class="stat-value">{{ gpa }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设计选项 -->
    <div v-if="activeSubTab === '设计选项'" class="design-content">
      <div class="design-section">
        <h3>颜色和字体设置</h3>
        <div class="design-grid">
          <div class="design-field">
            <label>标题颜色</label>
            <div class="color-picker">
              <input type="color" v-model="designSettings.titleColor" />
              <input type="text" v-model="designSettings.titleColor" />
            </div>
          </div>
          <div class="design-field">
            <label>表头颜色</label>
            <div class="color-picker">
              <input type="color" v-model="designSettings.headerColor" />
              <input type="text" v-model="designSettings.headerColor" />
            </div>
          </div>
          <div class="design-field">
            <label>文字颜色</label>
            <div class="color-picker">
              <input type="color" v-model="designSettings.textColor" />
              <input type="text" v-model="designSettings.textColor" />
            </div>
          </div>
          <div class="design-field">
            <label>强调颜色</label>
            <div class="color-picker">
              <input type="color" v-model="designSettings.accentColor" />
              <input type="text" v-model="designSettings.accentColor" />
            </div>
          </div>
          <div class="design-field">
            <label>背景颜色</label>
            <div class="color-picker">
              <input type="color" v-model="designSettings.bgColor" />
              <input type="text" v-model="designSettings.bgColor" />
            </div>
          </div>
          <div class="design-field">
            <label>字体</label>
            <select v-model="designSettings.fontFamily">
              <option>Times New Roman</option>
              <option>Arial</option>
              <option>Helvetica</option>
              <option>Georgia</option>
            </select>
          </div>
        </div>
      </div>

      

      <div class="design-section">
        <h3>官印设置</h3>
        <div class="design-grid">
          <div class="design-field">
            <label>官印类别</label>
            <select v-model="designSettings.sealType">
              <option value="">无</option>
              <option>All Packers</option>
              <option>Classic Seal</option>
              <option>Modern Emblem</option>
              <option>Traditional Crest</option>
              <option>Academic Shield</option>
              <option>University Seal</option>
              <option>Official Stamp</option>
            </select>
          </div>
          <div class="design-field">
            <label>官印文字</label>
            <input type="text" v-model="designSettings.sealText" />
          </div>
          <div class="design-field full" v-if="designSettings.sealType">
            <label>上传官印图片</label>
            <div class="logo-upload">
              <div class="logo-preview">
                <img v-if="designSettings.sealImage" :src="designSettings.sealImage" alt="Seal" />
                <button v-if="designSettings.sealImage" class="btn-remove-overlay" @click="designSettings.sealImage = ''" title="删除">✕</button>
              </div>
              <div class="logo-actions">
                <PhotoSelector v-model="designSettings.sealImage" />
                <span class="or-divider">或</span>
                <label class="upload-btn-small">
                  本地上传
                  <input type="file" accept="image/*" @change="(e) => { const f=(e.target as HTMLInputElement).files?.[0]; if(f){ const r=new FileReader(); r.onload=(ev)=>designSettings.value.sealImage = ev.target?.result as string; r.readAsDataURL(f) } }" hidden />
                </label>
              </div>
              <span class="upload-hint">推荐尺寸：100x100像素</span>
            </div>
          </div>
        </div>
      </div>

      <div class="design-section">
        <h3>✍️ 签名设置</h3>
        <div class="design-grid">
          <div class="design-field">
            <label>签名来源</label>
            <select v-model="designSettings.signatureSource">
              <option value="text">输入文字</option>
              <option value="upload">本地上传</option>
              <option value="gallery">照片库选择</option>
            </select>
          </div>
          <div v-if="designSettings.signatureSource === 'text'" class="design-field">
            <label>签名字体</label>
            <select v-model="designSettings.signatureFont">
              <option value="Brush Script MT">Brush Script MT (手写体)</option>
              <option value="Lucida Handwriting">Lucida Handwriting</option>
              <option value="Segoe Script">Segoe Script</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Georgia">Georgia (正式)</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="KaiTi">楷体 (KaiTi)</option>
              <option value="FangSong">仿宋 (FangSong)</option>
            </select>
          </div>
          <div v-if="designSettings.signatureSource === 'text'" class="design-field full">
            <label>签名人姓名</label>
            <input type="text" v-model="designSettings.signatureName" placeholder="Dr. Jane Smith" />
          </div>
          <div v-if="designSettings.signatureSource === 'text'" class="design-field full">
            <label>签名人头衔</label>
            <input type="text" v-model="designSettings.signatureTitle" placeholder="University Registrar" />
          </div>
          <div v-if="designSettings.signatureSource === 'text'" class="design-field full">
            <label>字体大小 ({{ designSettings.signatureFontSize }}px)</label>
            <input type="range" min="16" max="48" v-model.number="designSettings.signatureFontSize" />
          </div>
          <div v-if="designSettings.signatureSource === 'upload'" class="design-field full">
            <label>上传签名图片</label>
            <div class="logo-upload">
              <div class="logo-preview">
                <img v-if="designSettings.signatureImage" :src="designSettings.signatureImage" alt="Signature" style="max-height: 60px;" />
                <button v-if="designSettings.signatureImage" class="btn-remove-overlay" @click="designSettings.signatureImage = ''" title="删除">✕</button>
              </div>
              <div class="logo-actions">
                <label class="upload-btn-small">
                  选择文件
                  <input type="file" accept="image/*" @change="handleSignatureUpload" hidden />
                </label>
              </div>
              <span class="upload-hint">推荐使用透明背景PNG图片</span>
            </div>
          </div>
          <div v-if="designSettings.signatureSource === 'gallery'" class="design-field full">
            <label>从照片库选择签名</label>
            <PhotoSelector v-model="designSettings.signatureImage" />
          </div>
        </div>
      </div>

      <div class="design-section">
        <h3>边框设置</h3>
        <div class="design-grid">
          <div class="design-field full">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.borderEnabled" />
              <span>启用边框</span>
            </label>
          </div>
          <div class="design-field">
            <label>边框颜色</label>
            <div class="color-picker">
              <input type="color" v-model="designSettings.borderColor" />
              <input type="text" v-model="designSettings.borderColor" />
            </div>
          </div>
          <div class="design-field">
            <label>边框样式</label>
            <select v-model="designSettings.borderStyle">
              <option value="solid">Solid (实线)</option>
              <option value="dashed">Dashed (虚线)</option>
              <option value="dotted">Dotted (点线)</option>
              <option value="double">Double (双线)</option>
              <option value="groove">Groove (凹槽)</option>
              <option value="ridge">Ridge (凸起)</option>
              <option value="inset">Inset (内陷)</option>
              <option value="outset">Outset (外凸)</option>
            </select>
          </div>
          <div class="design-field full">
            <label>边框宽度 ({{ designSettings.borderWidth }}px)</label>
            <input type="range" min="1" max="10" v-model.number="designSettings.borderWidth" />
          </div>
        </div>
      </div>

      <div class="design-section">
        <h3>条形码和二维码设置</h3>
        <div class="design-grid">
          <!-- 条形码设置 -->
          <div class="design-field full">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.showBarcode" />
              <span>显示条形码</span>
            </label>
          </div>
          
          <template v-if="designSettings.showBarcode">
            <div class="design-field full">
              <label>条形码来源</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="designSettings.barcodeSource" value="generate" />
                  <span>自动生成</span>
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="designSettings.barcodeSource" value="upload" />
                  <span>本地上传</span>
                </label>
              </div>
            </div>

            <div v-if="designSettings.barcodeSource === 'generate'" class="design-field full">
              <label>条形码内容 (默认使用学号)</label>
              <input type="text" v-model="designSettings.barcodeContent" :placeholder="store.studentInfo.studentId || '请输入内容'" />
            </div>

            <div v-if="designSettings.barcodeSource === 'upload'" class="design-field full">
              <label>上传条形码图片</label>
              <div class="logo-upload">
                <div class="logo-preview" v-if="designSettings.barcodeImage">
                  <img :src="designSettings.barcodeImage" alt="Barcode" />
                  <button class="btn-remove-overlay" @click="designSettings.barcodeImage = ''">✕</button>
                </div>
                <div class="logo-actions">
                  <label class="upload-btn-small">
                    选择图片
                    <input type="file" accept="image/*" @change="(e) => { const f=(e.target as HTMLInputElement).files?.[0]; if(f){ const r=new FileReader(); r.onload=(ev)=>designSettings.barcodeImage = ev.target?.result as string; r.readAsDataURL(f) } }" hidden />
                  </label>
                </div>
              </div>
            </div>
          </template>

          <!-- 二维码设置 -->
          <div class="design-field full" style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 1rem;">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.showQR" />
              <span>显示二维码</span>
            </label>
          </div>

          <template v-if="designSettings.showQR">
            <div class="design-field full">
              <label>二维码来源</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="designSettings.qrSource" value="generate" />
                  <span>自动生成</span>
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="designSettings.qrSource" value="upload" />
                  <span>本地上传</span>
                </label>
              </div>
            </div>

            <div v-if="designSettings.qrSource === 'generate'" class="design-field full">
              <label>二维码内容 (默认使用验证链接)</label>
              <input type="text" v-model="designSettings.qrContent" placeholder="https://verification.edu/..." />
            </div>

            <div v-if="designSettings.qrSource === 'upload'" class="design-field full">
              <label>上传二维码图片</label>
              <div class="logo-upload">
                <div class="logo-preview" v-if="designSettings.qrImage">
                  <img :src="designSettings.qrImage" alt="QR Code" />
                  <button class="btn-remove-overlay" @click="designSettings.qrImage = ''">✕</button>
                </div>
                <div class="logo-actions">
                  <label class="upload-btn-small">
                    选择图片
                    <input type="file" accept="image/*" @change="(e) => { const f=(e.target as HTMLInputElement).files?.[0]; if(f){ const r=new FileReader(); r.onload=(ev)=>designSettings.qrImage = ev.target?.result as string; r.readAsDataURL(f) } }" hidden />
                  </label>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="design-section">
        <h3>显示选项</h3>
        <div class="design-grid">
          <div class="design-field full">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.showPhoto" />
              <span>显示学生照片</span>
            </label>
          </div>
          <div class="design-field full">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.showGradeScale" />
              <span>显示成绩等级说明</span>
            </label>
          </div>
          <div class="design-field full">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.showGradePoints" />
              <span>显示绩点</span>
            </label>
          </div>
          <div class="design-field full">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.showSemesterGPA" />
              <span>显示学期GPA</span>
            </label>
          </div>
        </div>
      </div>

    </div>

    <!-- 水印设置（独立子菜单，与课程表一致的 UI，绑定到本地 designSettings） -->
    <div v-if="activeSubTab === '水印设置'" class="design-content">
      <div class="design-section">
        <h3>水印设置</h3>
        <div class="design-grid">
          <div class="design-field full">
            <label class="toggle-label">
              <input type="checkbox" v-model="designSettings.watermarkEnabled" />
              <span>启用水印</span>
            </label>
          </div>
        </div>

        <div v-if="designSettings.watermarkEnabled" class="design-section">
          <h3>斜线水印</h3>
          <div class="design-grid">
            <div class="design-field full">
              <label class="toggle-label">
                <input type="checkbox" v-model="designSettings.watermarkShowStripes" />
                <span>显示斜线水印</span>
              </label>
            </div>

            <div v-if="designSettings.watermarkShowStripes" class="design-field full">
              <label>线条宽度 ({{ designSettings.watermarkStripeWidth }}px)</label>
              <input type="range" v-model.number="designSettings.watermarkStripeWidth" min="1" max="50" step="1" />
            </div>

            <div v-if="designSettings.watermarkShowStripes" class="design-field full">
              <label>线条间距 ({{ designSettings.watermarkStripeSpacing }}px)</label>
              <input type="range" v-model.number="designSettings.watermarkStripeSpacing" min="20" max="200" step="5" />
            </div>

            <div v-if="designSettings.watermarkShowStripes" class="design-field">
              <label>斜线颜色</label>
              <div class="color-picker">
                <input type="color" v-model="designSettings.stripeWatermarkColor" />
                <input type="text" v-model="designSettings.stripeWatermarkColor" />
              </div>
            </div>

            <div v-if="designSettings.watermarkShowStripes" class="design-field full">
              <label>斜线透明度 ({{ designSettings.watermarkStripeOpacity }}%)</label>
              <input type="range" min="1" max="100" v-model.number="designSettings.watermarkStripeOpacity" />
            </div>

            <div v-if="designSettings.watermarkShowStripes" class="design-field full">
              <label>斜线角度 ({{ designSettings.stripeWatermarkAngle }}°)</label>
              <input type="range" min="-90" max="90" v-model.number="designSettings.stripeWatermarkAngle" />
            </div>
            <div v-if="designSettings.watermarkShowStripes" class="design-field full">
              <label>覆盖文本（斜线水印显示在内容上方）</label>
              <label class="toggle-label">
                <input type="checkbox" v-model="designSettings.watermarkOverlayDiagonal" />
              </label>
            </div>
          </div>
        </div>

        <div class="design-section">
          <h3>文字水印</h3>
          <div class="design-grid">
            <div class="design-field full">
              <label class="toggle-label">
                <input type="checkbox" v-model="designSettings.watermarkShowText" />
                <span>显示文本水印</span>
              </label>
            </div>

            <!-- 全屏 水印 开关已移至下方的“全屏水印”面板 -->

            <div v-if="designSettings.watermarkShowText" class="design-field full">
              <label>水印文本</label>
              <input type="text" v-model="designSettings.watermarkText" placeholder="OFFICIAL TRANSCRIPT" />
            </div>

            <div class="design-field full">
              <label class="toggle-label">
                <input type="checkbox" v-model="designSettings.extraWatermarkEnabled" />
                <span>显示资料文本水印</span>
              </label>
            </div>

            <div v-if="designSettings.extraWatermarkEnabled" class="design-field full">
              <label>资料水印文本</label>
              <input type="text" v-model="designSettings.extraWatermarkText" placeholder="SAMPLE DATA" />
            </div>

            <div v-if="designSettings.extraWatermarkEnabled" class="design-field">
              <label>资料文字大小 ({{ designSettings.extraWatermarkSize }}px)</label>
              <input type="range" v-model.number="designSettings.extraWatermarkSize" min="8" max="200" step="1" />
            </div>

            <div v-if="designSettings.extraWatermarkEnabled" class="design-field">
              <label>资料文字颜色</label>
              <div class="color-picker">
                <input type="color" v-model="designSettings.extraWatermarkColor" />
                <input type="text" v-model="designSettings.extraWatermarkColor" />
              </div>
            </div>

            <div v-if="designSettings.extraWatermarkEnabled" class="design-field full">
              <label>资料文字角度 ({{ designSettings.extraWatermarkAngle }}°)</label>
              <input type="range" min="-90" max="90" v-model.number="designSettings.extraWatermarkAngle" />
            </div>

            <div v-if="designSettings.watermarkShowText" class="design-field">
              <label>文字大小 ({{ designSettings.textWatermarkSize }}px)</label>
              <input type="range" v-model.number="designSettings.textWatermarkSize" min="8" max="200" step="1" />
            </div>

            <div v-if="designSettings.watermarkShowText" class="design-field">
              <label>水印字体</label>
              <select v-model="designSettings.watermarkFontFamily">
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Helvetica">Helvetica</option>
                <option value="'Allura', cursive">Allura (Script)</option>
              </select>
            </div>

            <div v-if="designSettings.watermarkShowText" class="design-field">
              <label>文字颜色</label>
              <div class="color-picker">
                <input type="color" v-model="designSettings.textWatermarkColor" />
                <input type="text" v-model="designSettings.textWatermarkColor" />
              </div>
            </div>

            <div v-if="designSettings.watermarkShowText" class="design-field full">
              <label>文字不透明度 ({{ designSettings.textWatermarkOpacity }}%)</label>
              <input type="range" min="1" max="100" v-model.number="designSettings.textWatermarkOpacity" />
            </div>

            <div v-if="designSettings.watermarkShowText" class="design-field full">
              <label>文字角度 ({{ designSettings.textWatermarkAngle }}°)</label>
              <input type="range" min="-90" max="90" v-model.number="designSettings.textWatermarkAngle" />
            </div>
            <div v-if="designSettings.watermarkShowText" class="design-field full">
              <label>覆盖文本（文字水印显示在内容上方）</label>
              <label class="toggle-label">
                <input type="checkbox" v-model="designSettings.watermarkOverlayText" />
              </label>
            </div>
          </div>
        </div>

        <div class="design-section">
          <h3>全屏水印</h3>
          <div class="design-grid">
            <div class="design-field full">
              <label class="toggle-label">
                <input type="checkbox" v-model="designSettings.fullScreenWatermark" />
                <span>启用全屏水印</span>
              </label>
            </div>
            <div class="design-field full">
              <label>水印文字</label>
              <input v-model="designSettings.fullScreenWatermarkText" type="text" placeholder="OFFICIAL TRANSCRIPT" />
            </div>
            <div class="design-field">
              <label>文字大小 ({{ designSettings.fullScreenWatermarkSize }}px)</label>
              <input type="range" v-model.number="designSettings.fullScreenWatermarkSize" min="8" max="200" step="1" />
            </div>
            <div class="design-field">
              <label>文字颜色</label>
              <div class="color-picker">
                <input type="color" v-model="designSettings.fullScreenWatermarkColor" />
                <input type="text" v-model="designSettings.fullScreenWatermarkColor" />
              </div>
              <div style="margin-top:8px">
                <label>覆盖文本（全屏水印显示在内容上方）</label>
                <label class="toggle-label">
                  <input type="checkbox" v-model="designSettings.watermarkOverlayFullscreen" />
                </label>
              </div>
            </div>
            <div class="design-field full">
              <label>文字不透明度 ({{ designSettings.fullScreenWatermarkOpacity }}%)</label>
              <input type="range" v-model.number="designSettings.fullScreenWatermarkOpacity" min="1" max="100" step="1" />
            </div>
            <div class="design-field full">
              <label>水印间距 ({{ designSettings.fullScreenWatermarkSpacing }}px)</label>
              <input type="range" v-model.number="designSettings.fullScreenWatermarkSpacing" min="50" max="500" step="10" />
            </div>
            <div class="design-field full">
              <label>水印角度 ({{ designSettings.fullScreenWatermarkAngle }}°)</label>
              <input type="range" v-model.number="designSettings.fullScreenWatermarkAngle" min="-90" max="90" step="1" />
            </div>
            <div class="design-field full">
              <label>水印字体</label>
              <select v-model="designSettings.fullScreenWatermarkFontFamily">
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Helvetica">Helvetica</option>
                <option value="'Allura', cursive">Allura (Script)</option>
              </select>
            </div>
          </div>
        </div>

        <div style="margin-top:12px;">

        </div>
      </div>
    </div>

    <!-- 预览 -->
    <div v-if="activeSubTab === '预览'" class="preview-content">
      <div class="preview-controls">
        <div class="controls-wrapper">
          <button class="email-btn" @click="showEmailModal = true">📧 发送邮件</button>
          <button class="download-btn" @click="showDownloadPanel = true">📥 导出</button>
        </div>
      </div>

      <div class="transcript-preview" ref="transcriptPreviewRef" :style="transcriptStyle">
        <!-- 水印层：仅在预览容器内渲染（从设置面板移动） -->
        <div v-if="designSettings.watermarkShowStripes && designSettings.watermarkEnabled" class="watermark-stripes" :style="stripeBackgroundStyle"></div>
        <div v-if="designSettings.fullScreenWatermark" class="watermark-bg" :style="fullScreenBackground"></div>
        <div v-if="designSettings.extraWatermarkEnabled" class="watermark-text-overlay extra" :style="extraWatermarkOverlayStyle">
          <div class="watermark-text" :style="extraWatermarkTextStyle">{{ designSettings.extraWatermarkText }}</div>
        </div>

        <!-- 全屏文字水印（独立渲染，可与中央文字水印同时显示） -->
        <div v-if="designSettings.fullScreenWatermark" class="watermark-text-overlay fullscreen" :style="{
          ...textWatermarkStyle,
          '--cell-size': designSettings.fullScreenWatermark ? (designSettings.fullScreenWatermarkSize * 3) + 'px' : 'auto',
          '--gap': designSettings.fullScreenWatermark ? designSettings.fullScreenWatermarkSpacing + 'px' : '0'
        }">
          <div class="watermark-full-grid">
            <div v-for="i in fullScreenRepeatCount" :key="i" class="watermark-repeat" :style="watermarkTextStyle">
              {{ designSettings.fullScreenWatermarkText }}
            </div>
          </div>
        </div>

        <!-- 常规中央文字水印（可单独显示或与全屏水印同时显示） -->
        <div v-if="designSettings.watermarkShowText" class="watermark-text-overlay" :style="textWatermarkStyle">
          <div class="watermark-text" :style="watermarkTextStyle">
            {{ designSettings.watermarkText }}
          </div>
        </div>

        <div class="content-layer" :style="contentLayerStyle">

        <div class="transcript-header">
          <div class="university-logo">
            <img v-if="store.universityInfo.logo" :src="store.universityInfo.logo" alt="University Logo" />
            <svg v-else width="80" height="80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" :fill="designSettings.titleColor" opacity="0.2"/>
              <circle cx="50" cy="50" r="35" fill="none" :stroke="designSettings.titleColor" stroke-width="2"/>
              <text x="50" y="58" text-anchor="middle" font-size="24" :fill="designSettings.titleColor" font-weight="bold">IU</text>
            </svg>
          </div>
          <div class="university-info">
            <h1 :style="{ color: designSettings.titleColor }">{{ store.universityInfo.name || 'International University' }}</h1>
            <p>{{ store.universityInfo.address || '123 University Avenue, Boston, MA 02115' }}</p>
            <p>{{ store.universityInfo.phone || '(617) 555-1234' }} | {{ store.universityInfo.website || 'www.university.edu' }}</p>
          </div>
          <div v-if="designSettings.showPhoto" class="student-photo-preview">
            <img v-if="store.studentPhoto.url" :src="store.studentPhoto.url" alt="Student" />
            <div v-else class="photo-placeholder"></div>
          </div>
        </div>

        <div class="transcript-title">
          <h2 :style="{ color: designSettings.titleColor }">OFFICIAL ACADEMIC TRANSCRIPT</h2>
          <div class="title-line" :style="titleLineStyle"></div>
        </div>

        <div class="student-info-preview" :style="{ background: designSettings.headerColor }">
          <div class="info-row">
            <div class="info-item">
              <strong :style="{ color: designSettings.titleColor }">Student Name:</strong> {{ store.studentInfo.name || 'Emily Johnson' }}
            </div>
            <div class="info-item">
              <strong :style="{ color: designSettings.titleColor }">Degree:</strong> {{ store.studentInfo.degree || "Bachelor's Degree" }}
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <strong :style="{ color: designSettings.titleColor }">Student ID:</strong> {{ store.studentInfo.studentId || '2023001001' }}
            </div>
            <div class="info-item">
              <strong :style="{ color: designSettings.titleColor }">Enrollment Date:</strong> {{ store.studentInfo.enrollmentYear || '2023-09-01' }}
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <strong :style="{ color: designSettings.titleColor }">Program:</strong> {{ store.studentInfo.major || 'Computer Science' }}
            </div>
            <div class="info-item">
              <strong :style="{ color: designSettings.titleColor }">Expected Graduation:</strong> 2026-06-30
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <strong :style="{ color: designSettings.titleColor }">Department:</strong> {{ store.studentInfo.school || 'School of Computer Science' }}
            </div>
            <div class="info-item">
              <strong :style="{ color: designSettings.titleColor }">Current GPA:</strong> {{ gpa }}
            </div>
          </div>
        </div>

        <div v-if="designSettings.showGradeScale" class="grading-scale" :style="{ background: designSettings.headerColor }">
          <h3 :style="{ color: designSettings.titleColor }">Grading Scale</h3>
          <div class="scale-grid">
            <span>A+ / A = 4.0</span>
            <span>A- = 3.7</span>
            <span>B+ = 3.3</span>
            <span>B = 3.0</span>
            <span>B- = 2.7</span>
            <span>C+ = 2.3</span>
            <span>C = 2.0</span>
            <span>C- = 1.7</span>
            <span>D+ = 1.3</span>
            <span>D = 1.0</span>
            <span>F = 0.0</span>
            <span>P/NP = Not in GPA</span>
          </div>
        </div>

        <div class="semester-courses">
          <div v-for="(semesterCourses, semesterKey) in coursesBySemester" :key="semesterKey" class="semester-block">
            <div class="semester-header" :style="{ background: designSettings.headerColor }">
              <h3 :style="{ color: designSettings.titleColor }">{{ semesterKey }}</h3>
              <span v-if="designSettings.showSemesterGPA" class="semester-gpa" :style="{ color: designSettings.titleColor }">
                Semester GPA: {{ getSemesterGPA(semesterCourses) }}
              </span>
            </div>
            <table class="preview-table">
              <thead :style="{ background: designSettings.headerColor }">
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Grade</th>
                  <th v-if="designSettings.showGradePoints">Grade Points</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="course in semesterCourses" :key="course.code">
                  <td>{{ course.code }}</td>
                  <td>{{ course.name }}</td>
                  <td>{{ course.credits }}</td>
                  <td>{{ course.grade }}</td>
                  <td v-if="designSettings.showGradePoints">{{ getGradePoints(course.grade) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="summary-section" :style="{ background: designSettings.headerColor }">
          <div class="summary-item">
            <strong :style="{ color: designSettings.titleColor }">Total Credits</strong>
            <span>{{ totalCredits }}</span>
          </div>
          <div class="summary-item">
            <strong :style="{ color: designSettings.titleColor }">Completed Credits</strong>
            <span>{{ completedCredits }}</span>
          </div>
          <div class="summary-item">
            <strong :style="{ color: designSettings.titleColor }">Cumulative GPA</strong>
            <span>{{ gpa }}</span>
          </div>
        </div>

        <div class="transcript-footer">
          <div class="footer-left">
            <p><strong :style="{ color: designSettings.titleColor }">Issue Date:</strong> 2025-12-25</p>
            <!-- 条形码 -->
            <div v-if="designSettings.showBarcode" class="barcode-section">
              <img v-if="designSettings.barcodeSource === 'upload' && designSettings.barcodeImage" 
                   :src="designSettings.barcodeImage" 
                   class="custom-barcode-img" 
                   alt="Barcode" />
              <template v-else>
                <svg ref="barcodeRef" class="barcode-svg"></svg>
                <span class="barcode-text">{{ designSettings.barcodeContent || store.studentInfo.studentId }}</span>
              </template>
            </div>
          </div>
          <div class="footer-center">
            <!-- 二维码 -->
            <div v-if="designSettings.showQR" class="qr-section">
              <img v-if="designSettings.qrSource === 'upload' && designSettings.qrImage" 
                   :src="designSettings.qrImage" 
                   class="custom-qr-img" 
                   alt="QR Code" />
              <template v-else>
                <canvas ref="qrCanvas" width="80" height="80" class="qr-canvas"></canvas>
              </template>
              <span class="qr-text">Scan to Verify</span>
            </div>
          </div>
          <div class="footer-right">
            <!-- 签名区域 -->
            <div class="signature-area">
              <img v-if="(designSettings.signatureSource === 'upload' || designSettings.signatureSource === 'gallery') && designSettings.signatureImage" 
                   :src="designSettings.signatureImage" 
                   class="signature-image" 
                   alt="Signature" />
              <p v-else class="signature-name" :style="{ fontFamily: designSettings.signatureFont, fontSize: designSettings.signatureFontSize + 'px' }">{{ designSettings.signatureName }}</p>
            </div>
            <div class="signature-line"></div>
            <p class="signature-title">{{ designSettings.signatureTitle }}</p>
            <div class="signature-seal" v-if="designSettings.sealType || designSettings.sealImage">
              <img v-if="designSettings.sealImage" :src="designSettings.sealImage" class="uploaded-seal" alt="Official Seal" />
              <svg v-else-if="designSettings.sealType === 'All Packers'" width="60" height="60" viewBox="0 0 60 60">
                <text x="30" y="52" font-size="6" text-anchor="middle" fill="#8B4513" opacity="0.3" font-weight="600">{{ designSettings.sealText || 'OFFICIAL SEAL' }}</text>
              </svg>
              <svg v-else-if="designSettings.sealType === 'Classic Seal'" width="60" height="60" viewBox="0 0 60 60">
                <text x="30" y="8" font-size="5" text-anchor="middle" fill="#B8860B" opacity="0.4" font-weight="600">{{ designSettings.sealText || 'CLASSIC' }}</text>
              </svg>
              <svg v-else-if="designSettings.sealType === 'University Seal'" width="60" height="60" viewBox="0 0 60 60">
                <text x="30" y="50" font-size="5" text-anchor="middle" fill="#000080" opacity="0.3" font-weight="600">{{ designSettings.sealText || 'UNIVERSITY' }}</text>
              </svg>
            </div>
          </div>
        </div>

        <div class="divider-line"></div>

        <div class="verification-note">
          <p>This transcript is not valid without the university seal and signature of the registrar.</p>
          <p>For verification, please contact the Office of the Registrar at {{ store.universityInfo.phone || '(617) 555-1234' }}.</p>
        </div>
        </div>
      </div>
    </div>

    <!-- 课程编辑模态框 -->
    <div v-if="showCourseModal" class="modal-overlay" @click="showCourseModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="close-btn" @click="showCourseModal = false">✕</button>
        </div>
        <div class="form-grid-modal">
          <div class="form-field">
            <label>课程代码</label>
            <input v-model="courseForm.code" type="text" placeholder="CS101" />
          </div>
          <div class="form-field">
            <label>学分</label>
            <input v-model.number="courseForm.credits" type="number" min="1" max="6" />
          </div>
          <div class="form-field full">
            <label>课程名称</label>
            <input v-model="courseForm.name" type="text" placeholder="Introduction to Computer Science" />
          </div>
          <div class="form-field">
            <label>学期</label>
            <select v-model="courseForm.semester">
              <option>Fall</option>
              <option>Spring</option>
              <option>Summer</option>
              <option>Winter</option>
            </select>
          </div>
          <div class="form-field">
            <label>学年</label>
            <input v-model="courseForm.year" type="text" placeholder="2022-2023" />
          </div>
          <div class="form-field">
            <label>成绩</label>
            <select v-model="courseForm.grade">
              <option>A+</option>
              <option>A</option>
              <option>A-</option>
              <option>B+</option>
              <option>B</option>
              <option>B-</option>
              <option>C+</option>
              <option>C</option>
              <option>C-</option>
              <option>D+</option>
              <option>D</option>
              <option>F</option>
              <option>In Progress</option>
            </select>
          </div>
          <div class="form-field">
            <label>状态</label>
            <div class="toggle-field">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  :checked="courseForm.status === '已完成'"
                  @change="courseForm.status = ($event.target as HTMLInputElement).checked ? '已完成' : '进行中'"
                />
                <span class="toggle-slider"></span>
              </label>
              <span class="toggle-text">{{ courseForm.status }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showCourseModal = false">取消</button>
          <button class="save-btn" @click="saveCourse">保存</button>
        </div>
      </div>
    </div>
    
    <DownloadPanel
      :visible="showDownloadPanel"
      :preview-selector="'.transcript-preview'"
      :default-file-name="`Transcript_${store.studentInfo.studentId || Date.now()}`"
      :default-format="'png'"
      :default-quality="3"
      @close="showDownloadPanel = false"
    />

    <!-- 邮件发送弹窗 -->
    <EmailModal
      :visible="showEmailModal"
      :document-name="`Transcript_${store.studentInfo.name}`"
      :default-subject="`成绩单 - ${store.studentInfo.name}`"
      preview-selector=".transcript-preview"
      @close="showEmailModal = false"
    />
  </div>
</template>

<style scoped>
.transcript-page {
  width: 100%;
}

.sub-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
}

.sub-tab {
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.sub-tab.active {
  color: #4B6EF5;
  border-bottom-color: #4B6EF5;
}

.preview-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
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
  display: inline-flex;
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.download-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.add-btn:hover {
  background: #3B5ED8;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.form-field input,
.form-field select {
  padding: 10px 12px;
  border: 1px solid #DDD;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #4B6EF5;
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

.logo-upload,
.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-preview,
.photo-preview {
  width: 80px;
  height: 80px;
  background: #F8F9FA;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #DDD;
  overflow: hidden;
  font-size: 32px;
}

.logo-preview img,
.photo-preview img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.upload-btn {
  background: #4B6EF5;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.help-text {
  font-size: 11px;
  color: #999;
  text-align: center;
}

.course-table {
  margin-top: 16px;
  overflow-x: auto;
}

.course-table table {
  width: 100%;
  border-collapse: collapse;
}

.course-table th {
  background: #F8F9FA;
  padding: 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #E0E0E0;
}

.course-table td {
  padding: 12px;
  font-size: 13px;
  color: #333;
  text-align: center;
  border-bottom: 1px solid #F0F0F0;
}

.course-table tr:hover {
  background: #FAFAFA;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.已完成 {
  background: #E8F5E9;
  color: #2E7D32;
}

.status.进行中 {
  background: #FFF3E0;
  color: #F57C00;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  margin: 0 2px;
}

.icon-btn:hover {
  opacity: 0.7;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.stat-card {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2C3E50;
}

/* 设计选项 */
.design-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.design-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.design-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2C3E50;
  margin: 0 0 16px 0;
}

.design-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.design-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.design-field.full {
  grid-column: 1 / -1;
}

.design-field label {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.design-field input,
.design-field select {
  padding: 10px 12px;
  border: 1px solid #DDD;
  border-radius: 6px;
  font-size: 14px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker input[type="color"] {
  width: 50px;
  height: 38px;
  border: 1px solid #DDD;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.color-picker input[type="text"] {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #DDD;
  border-radius: 6px;
  font-size: 13px;
  font-family: monospace;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.toggle-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* 预览 */
.preview-content {
  background: #F5F5F5;
  border-radius: 8px;
  padding: 24px;
}

.preview-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.format-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.format-selector select {
  padding: 8px 12px;
  border: 1px solid #DDD;
  border-radius: 6px;
}

.download-btn {
  background: #4B6EF5;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.download-btn:hover {
  background: #3B5ED8;
}

.transcript-preview {
  position: relative;
  background: white;
  padding: 60px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Times New Roman', serif;
  overflow: hidden;
}

.transcript-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.university-logo {
  flex-shrink: 0;
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.university-logo img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.university-info {
  flex: 1;
  text-align: center;
}

.university-info h1 {
  color: #1e40af;
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: bold;
}

.university-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #333;
}

.student-photo-preview {
  width: 100px;
  height: 120px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.student-photo-preview img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.photo-placeholder {
  font-size: 48px;
}

.transcript-title {
  text-align: center;
  margin-bottom: 20px;
}

.transcript-title h2 {
  color: #1e40af;
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  letter-spacing: 2px;
}

.title-line {
  height: 3px;
  background: #1e40af;
  width: 100%;
  margin-top: 8px;
}

.student-info-preview {
  margin-bottom: 20px;
  padding: 20px;
  background: #F8F9FA;
  border-radius: 4px;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  font-size: 13px;
}

.info-item strong {
  color: #1e40af;
  font-weight: bold;
}

.grading-scale {
  margin-bottom: 30px;
  padding: 15px;
  background: #F8F9FA;
  border-radius: 4px;
}

.grading-scale h3 {
  font-size: 14px;
  font-weight: bold;
  color: #1e40af;
  margin: 0 0 10px 0;
}

.scale-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  font-size: 11px;
}

.semester-courses {
  margin-bottom: 30px;
}

.semester-block {
  margin-bottom: 30px;
}

.semester-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px 15px;
  background: #e2e8f0;
  border-radius: 4px;
}

.semester-header h3 {
  font-size: 16px;
  color: #1e40af;
  margin: 0;
  font-weight: bold;
}

.semester-gpa {
  font-size: 14px;
  font-weight: bold;
  color: #1e40af;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-bottom: 20px;
}

.preview-table thead {
  background: #F8F9FA;
}

.preview-table th {
  padding: 10px;
  text-align: left;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #DDD;
}

.preview-table td {
  padding: 10px;
  border-bottom: 1px solid #EEE;
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 30px 0;
  padding: 20px;
  background: #F8F9FA;
  border-radius: 4px;
}

.summary-item {
  text-align: center;
}

.summary-item strong {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.summary-item span {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #1e40af;
}

.transcript-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 40px;
  padding-bottom: 20px;
}

.footer-left p {
  margin: 0;
  font-size: 14px;
}

.footer-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-right {
  text-align: right;
}

/* 条形码样式 */
.barcode-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 12px;
}

.barcode-svg {
  max-width: 150px;
  height: 40px;
}

.custom-barcode-img {
  max-width: 150px;
  max-height: 50px;
  object-fit: contain;
}

.barcode-text {
  font-size: 10px;
  color: #666;
  font-family: 'SF Mono', 'Courier New', monospace;
  margin-top: 2px;
}

/* 二维码样式 */
.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-canvas {
  width: 80px;
  height: 80px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.custom-qr-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.qr-text {
  font-size: 9px;
  color: #666;
  margin-top: 4px;
}

.signature-name {
  font-family: 'Allura', 'Great Vibes', 'Snell Roundhand', 'Brush Script MT', cursive;
  font-size: 22px;
  font-weight: 400;
  margin: 0 0 2px 0;
  color: #111827;
  line-height: 1;
}

.signature-title {
  font-size: 15px;
  font-weight: 800;
  margin: 8px 0 0 0;
  color: #111827;
}

.footer-right .signature-line {
  border-top: 1px solid #111827;
  margin: 4px 0 8px;
}

.footer-right .signature-image {
  max-width: 180px;
  max-height: 60px;
  object-fit: contain;
  margin: 8px 0;
}

.footer-right .signature-text {
  font-weight: 400;
  margin: 8px 0 0 0;
  color: #111827;
}

.divider-line {
  width: 100%;
  height: 1px;
  background: #333;
  margin: 20px 0;
}

.verification-note {
  text-align: center;
  font-size: 12px;
  color: #000;
  line-height: 1.6;
}

.verification-note p {
  margin: 4px 0;
}

/* 模态框 */
.modal-overlay {
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

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2C3E50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.form-grid-modal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.toggle-field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.toggle-slider:before {
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

.toggle-switch input:checked + .toggle-slider {
  background-color: #4B6EF5;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-text {
  font-size: 14px;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn {
  background: #E0E0E0;
  color: #666;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn {
  background: #4B6EF5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover {
  background: #3B5ED8;
}

.watermark-stripes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

/* 限定水印定位到预览容器，避免影响设置面板 */
.transcript-preview {
  position: relative;
}

.watermark-text-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.watermark-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1.5;
  background-repeat: repeat;
}

.content-layer {
  position: relative;
  z-index: 1; /* ensure content sits above non-overlay watermarks (which use z-index:0) */
}

/* 全屏水印使用换行的 flex 布局，gap 由 JS 控制（fullScreenWatermarkSpacing） */
.watermark-text-overlay.fullscreen {
  /* 使用自适应网格填充：单元格最小尺寸由 --cell-size 提供 */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--cell-size, 180px), 1fr));
  grid-auto-rows: var(--cell-size, 180px); /* 固定行高，避免底部留白 */
  justify-items: center;
  align-items: center;
  align-content: start; /* 从顶部开始填充 */
  padding: 20px;
  gap: var(--gap, 40px);
}

.watermark-text {
  font-size: 60px;
  color: #cccccc;
  opacity: 0.15;
  font-weight: bold;
  user-select: none;
  letter-spacing: 2px;
  line-height: 1.2;
  white-space: pre-wrap;
  text-align: center;
  max-width: none;
}

.watermark-repeat {
  position: relative;
  max-width: none;
  white-space: nowrap;
}

.watermark-full-grid {
  width: 100%;
  height: 100%;
  display: contents; /* children participate in the grid defined on the parent */
}

/* 导入和操作按钮样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-actions {
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
</style>
