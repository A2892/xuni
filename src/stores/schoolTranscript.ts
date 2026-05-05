// 学校官方成绩单 Store
import { defineStore } from 'pinia'
import { reactive, computed, ref } from 'vue'

export interface SchoolCourse {
  id: string
  code: string           // 课程代码
  name: string           // 课程名称
  nameEn: string         // 英文名
  credits: number        // 学分
  hours: number          // 学时
  score: number          // 成绩
  gradePoint: number     // 绩点
  semester: string       // 学期
  courseType: 'required' | 'elective' | 'general' | 'practical'  // 课程类型
}

export interface SchoolTranscriptData {
  // 学校信息
  schoolName: string
  schoolNameEn: string
  schoolLogo: string
  schoolAddress: string
  schoolPhone: string
  schoolWebsite: string
  
  // 学生信息
  studentName: string
  studentNameEn: string
  studentId: string
  studentPhoto: string
  gender: 'male' | 'female'
  birthDate: string
  idNumber: string
  
  // 学籍信息
  faculty: string
  facultyEn: string
  major: string
  majorEn: string
  grade: string
  classNo: string
  enrollmentDate: string
  expectedGraduation: string
  educationLevel: 'undergraduate' | 'master' | 'phd'
  studyMode: 'fulltime' | 'parttime'
  
  // 样式设置
  studentNameFont?: string
  
  // 成绩列表
  courses: SchoolCourse[]
  
  // 汇总信息
  totalCredits: number
  earnedCredits: number
  gpa: number
  averageScore: number
  ranking: string
  
  // 证明信息
  issueDate: string
  serialNumber: string
  registrarName: string
  registrarTitle: string
  
  // 显示设置
  template: 'official' | 'modern' | 'bilingual'
  showSeal: boolean
  showQRCode: boolean
  showRanking: boolean
  language: 'chinese' | 'english' | 'bilingual'
}

export const useSchoolTranscriptStore = defineStore('schoolTranscript', () => {
  const data = reactive<SchoolTranscriptData>({
    schoolName: '北京大学',
    schoolNameEn: 'Peking University',
    schoolLogo: '',
    schoolAddress: '北京市海淀区颐和园路5号',
    schoolPhone: '010-62751111',
    schoolWebsite: 'www.pku.edu.cn',
    
    studentName: '张三',
    studentNameEn: 'ZHANG SAN',
    studentNameFont: 'SimSun',
    studentId: '2020312345',
    studentPhoto: '',
    gender: 'male',
    birthDate: '2002-05-15',
    idNumber: '110101200205150011',
    
    faculty: '信息科学技术学院',
    facultyEn: 'School of Electronics Engineering and Computer Science',
    major: '计算机科学与技术',
    majorEn: 'Computer Science and Technology',
    grade: '2020级',
    classNo: '2班',
    enrollmentDate: '2020-09-01',
    expectedGraduation: '2024-07-01',
    educationLevel: 'undergraduate',
    studyMode: 'fulltime',
    
    courses: [
      { id: '1', code: 'CS101', name: '计算机导论', nameEn: 'Introduction to Computer Science', credits: 3, hours: 48, score: 92, gradePoint: 4.0, semester: '2020-2021-1', courseType: 'required' },
      { id: '2', code: 'MATH101', name: '高等数学', nameEn: 'Advanced Mathematics', credits: 5, hours: 80, score: 88, gradePoint: 3.7, semester: '2020-2021-1', courseType: 'required' },
      { id: '3', code: 'ENG101', name: '大学英语', nameEn: 'College English', credits: 3, hours: 48, score: 90, gradePoint: 3.9, semester: '2020-2021-1', courseType: 'required' },
      { id: '4', code: 'CS201', name: '数据结构', nameEn: 'Data Structures', credits: 4, hours: 64, score: 95, gradePoint: 4.0, semester: '2020-2021-2', courseType: 'required' },
      { id: '5', code: 'CS202', name: '操作系统', nameEn: 'Operating Systems', credits: 4, hours: 64, score: 87, gradePoint: 3.6, semester: '2021-2022-1', courseType: 'required' }
    ],
    
    totalCredits: 150,
    earnedCredits: 120,
    gpa: 3.85,
    averageScore: 89.5,
    ranking: '15/280',
    
    issueDate: new Date().toISOString().split('T')[0],
    serialNumber: `PKU${Date.now().toString().slice(-10)}`,
    registrarName: '王教务',
    registrarTitle: '教务处处长',
    
    template: 'official',
    showSeal: true,
    showQRCode: true,
    showRanking: true,
    language: 'bilingual'
  })

  // 设计设置
  const designSettings = reactive({
    watermarkEnabled: false,
    watermarkText: 'OFFICIAL',
    watermarkOpacity: 10,
    watermarkColor: '#cccccc',
    watermarkType: 'center' as 'center' | 'fullscreen' | 'diagonal',
    // 斜线水印参数
    watermarkStripeWidth: 20,
    watermarkStripeSpacing: 120,
    watermarkStripeColor: '#cccccc',
    watermarkStripeOpacity: 10,
    watermarkStripeRotation: -30,
    // 覆盖选项
    watermarkOverlayDiagonal: false,
    watermarkOverlayFullscreen: false,
    watermarkOverlayText: false,
    borderEnabled: true,
    borderStyle: 'double',
    borderColor: '#8b0000',
    borderWidth: 3,
    stampEnabled: true,
    stampType: 'official',
    stampColor: '#dc2626',
    stampRotation: -15,
    stampText: '',
    stampImage: '',
    stampSource: 'generate' as 'generate' | 'upload',
    signatureEnabled: true,
    signatureImage: '',
    signatureSource: 'generate' as 'generate' | 'upload',
    qrCodeEnabled: true,
    qrCodeImage: '',
    qrCodeSource: 'generate' as 'generate' | 'upload',
    qrCodeContent: '',
    fontFamilyCN: "'SimSun', serif",
    fontFamilyEN: "'Times New Roman', serif"
  })
  
  // 计算属性
  const calculatedGPA = computed(() => {
    if (data.courses.length === 0) return 0
    const totalPoints = data.courses.reduce((sum, c) => sum + c.gradePoint * c.credits, 0)
    const totalCredits = data.courses.reduce((sum, c) => sum + c.credits, 0)
    return totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0
  })
  
  const calculatedAvgScore = computed(() => {
    if (data.courses.length === 0) return 0
    return +(data.courses.reduce((sum, c) => sum + c.score, 0) / data.courses.length).toFixed(1)
  })
  
  const calculatedEarnedCredits = computed(() => {
    return data.courses.reduce((sum, c) => sum + c.credits, 0)
  })
  
  // 方法
  const addCourse = () => {
    data.courses.push({
      id: Date.now().toString(),
      code: '',
      name: '',
      nameEn: '',
      credits: 3,
      hours: 48,
      score: 0,
      gradePoint: 0,
      semester: '',
      courseType: 'required'
    })
  }
  
  const removeCourse = (id: string) => {
    const idx = data.courses.findIndex(c => c.id === id)
    if (idx > -1) data.courses.splice(idx, 1)
  }
  
  const calculateGradePoint = (score: number): number => {
    if (score >= 90) return 4.0
    if (score >= 85) return 3.7
    if (score >= 82) return 3.3
    if (score >= 78) return 3.0
    if (score >= 75) return 2.7
    if (score >= 72) return 2.3
    if (score >= 68) return 2.0
    if (score >= 64) return 1.5
    if (score >= 60) return 1.0
    return 0
  }
  
  const updateCourseScore = (course: SchoolCourse, score: number) => {
    course.score = score
    course.gradePoint = calculateGradePoint(score)
  }
  
  const generateSerialNumber = () => {
    const prefix = data.schoolName.includes('北京') ? 'PKU' : 'UNI'
    data.serialNumber = `${prefix}${Date.now().toString().slice(-10)}`
  }
  
  const setSchoolTemplate = (school: string) => {
    const templates: Record<string, Partial<SchoolTranscriptData>> = {
      pku: {
        schoolName: '北京大学',
        schoolNameEn: 'Peking University',
        schoolAddress: '北京市海淀区颐和园路5号',
        schoolPhone: '010-62751111'
      },
      thu: {
        schoolName: '清华大学',
        schoolNameEn: 'Tsinghua University',
        schoolAddress: '北京市海淀区清华园1号',
        schoolPhone: '010-62785001'
      },
      fdu: {
        schoolName: '复旦大学',
        schoolNameEn: 'Fudan University',
        schoolAddress: '上海市杨浦区邯郸路220号',
        schoolPhone: '021-65642222'
      },
      sjtu: {
        schoolName: '上海交通大学',
        schoolNameEn: 'Shanghai Jiao Tong University',
        schoolAddress: '上海市闵行区东川路800号',
        schoolPhone: '021-54740000'
      }
    }
    if (templates[school]) {
      Object.assign(data, templates[school])
    }
  }
  
  const updateTotals = () => {
    data.gpa = calculatedGPA.value
    data.averageScore = calculatedAvgScore.value
    data.earnedCredits = calculatedEarnedCredits.value
  }
  
  const reset = () => {
    Object.assign(data, {
      schoolName: '北京大学',
      schoolNameEn: 'Peking University',
      studentName: '张三',
      studentNameEn: 'ZHANG SAN',
      studentId: '2020312345',
      courses: [],
      issueDate: new Date().toISOString().split('T')[0]
    })
  }
  
  return {
    data,
    designSettings,
    calculatedGPA,
    calculatedAvgScore,
    calculatedEarnedCredits,
    addCourse,
    removeCourse,
    calculateGradePoint,
    updateCourseScore,
    generateSerialNumber,
    setSchoolTemplate,
    updateTotals,
    reset
  }
})

// 课程类型
export const courseTypes = [
  { value: 'required', label: '必修课', labelEn: 'Required' },
  { value: 'elective', label: '选修课', labelEn: 'Elective' },
  { value: 'general', label: '通识课', labelEn: 'General' },
  { value: 'practical', label: '实践课', labelEn: 'Practical' }
]

// 学历层次
export const educationLevels = [
  { value: 'undergraduate', label: '本科', labelEn: 'Undergraduate' },
  { value: 'master', label: '硕士', labelEn: 'Master' },
  { value: 'phd', label: '博士', labelEn: 'Ph.D.' }
]
