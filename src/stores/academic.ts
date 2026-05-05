import { defineStore } from 'pinia'

export interface AcademicReportInfo {
  // 学校信息
  universityName: string
  universityAddress: string
  universityPhone: string
  universityWebsite: string
  universityLogo: string
  
  // 斜线水印（独立）
  diagonalWatermarkEnabled?: boolean
  diagonalLineWidth?: number
  diagonalLineSpacing?: number
  diagonalLineColor?: string
  diagonalLineOpacity?: number
  diagonalLineRotation?: number
  // 斜线覆盖：当为 true 时斜线渲染在内容之上（覆盖文本）
  diagonalOverlay?: boolean
  // 文字水印（独立）
  textWatermarkEnabled?: boolean
  textWatermarkText?: string
  textWatermarkSize?: number
  textWatermarkColor?: string
  textWatermarkOpacity?: number
  textWatermarkRotation?: number
  textWatermarkFontFamily?: string
  // 全屏水印额外字段
  fullScreenWatermarkAngle?: number
  fullScreenWatermarkFontFamily?: string
  // 学生信息
  studentName: string
  studentId: string
  program: string
  department: string
  academicYear: string
  reportDate: string
  studentPhoto: string
  
  // 学术表现
  currentGPA: string
  cumulativeGPA: string
  totalCredits: number
  completedCredits: number
  rank: string
  totalStudents: number
  // 斜线水印（独立）
  diagonalWatermarkEnabled: false,
  diagonalLineWidth: 20,
  diagonalLineSpacing: 40,
  diagonalLineColor: '#000000',
  diagonalLineOpacity: 5,
  diagonalLineRotation: -30,
  // 文字水印（独立）
  textWatermarkEnabled: false,
  textWatermarkText: 'OFFICIAL DOCUMENT',
  textWatermarkSize: 14,
  textWatermarkColor: '#000000',
  textWatermarkOpacity: 5,
  textWatermarkRotation: -30,
  textWatermarkFontFamily: 'Times New Roman',
  
  // 学术评价
  academicStanding: string
  performanceLevel: string
  fullScreenWatermarkAngle: -45,
  fullScreenWatermarkFontFamily: 'Arial',
  attendanceRate: string
  
  // 课程表现
  excellentCourses: Array<{
    courseCode?: string
    courseName: string
    grade: string
    credits: number
    semester: string
  }>
  
  improvementAreas: Array<{
    area: string
    recommendation: string
  }>
  
  // 学术荣誉与成就
  achievements: Array<{
    title: string
    date: string
    description: string
  }>
  
  // 教师评语
  advisorComments: string
  advisorName: string
  advisorTitle: string
  
  // 院长评语
  deanComments: string
  deanName: string
  deanTitle: string
  
  // 学期目标与建议
  goals: Array<{
    goal: string
    status: string
  }>
  
  recommendations: string
  
  // 签名与印章
  advisorSignature: string
  deanSignature: string
  sealImage: string
  
  // 设计选项
  reportStyle: string
  decorativeBorderStyle: string
  headerColor: string
  cardBackgroundColor: string
  accentColor: string
  primaryColor: string
  textColor: string
  fontFamily: string
  logoImage: string
  
  // 水印设置
  enableWatermark: boolean
  watermarkText: string
  watermarkOpacity: number
  watermarkRotation: number
  watermarkSize: number
  watermarkColor: string
  fullScreenWatermarkAngle?: number
  fullScreenWatermarkFontFamily?: string
  watermarkOverlay: boolean
  fullScreenWatermark: boolean
  watermarkSpacingX: number
  watermarkSpacingY: number
  watermarkFontFamily: string
  borderEnabled: boolean
  borderColor: string
  borderWidth: number
  borderStyle: string
  borderColor: string
  borderWidth: number
  
  // 条形码和二维码设置
  showBarcode: boolean
  barcodeSource: string
  barcodeImage: string
  barcodeContent: string
  showQR: boolean
  qrSource: string
  qrImage: string
  qrContent: string
}

export const useAcademicStore = defineStore('academic', {
  state: () => ({
    reportInfo: {
      // 学校信息
      universityName: 'International University',
      universityAddress: '123 University Avenue, Boston, MA 02138',
      universityPhone: '(617) 555-1234',
      universityWebsite: 'www.university.edu',
      universityLogo: '',
      
      // 学生信息
      studentName: 'Emily Johnson',
      studentId: '2023001001',
      program: 'Bachelor of Computer Science',
      department: 'School of Computer Science',
      academicYear: '2023-2024',
      reportDate: new Date().toISOString().split('T')[0],
      studentPhoto: '',
      
      // 学术表现
      currentGPA: '3.85',
      cumulativeGPA: '3.82',
      totalCredits: 120,
      completedCredits: 96,
      rank: '15',
      totalStudents: 280,
      
      // 学术评价
      academicStanding: 'Dean\'s List',
      performanceLevel: 'Excellent',
      attendanceRate: '98%',
      
      // 课程表现
      excellentCourses: [
        { courseCode: 'CS301', courseName: 'Advanced Algorithms', grade: 'A+', credits: 4, semester: 'Fall 2023' },
        { courseCode: 'CS210', courseName: 'Database Systems', grade: 'A', credits: 3, semester: 'Fall 2023' },
        { courseCode: 'CS240', courseName: 'Software Engineering', grade: 'A-', credits: 3, semester: 'Fall 2023' },
        { courseCode: 'CS401', courseName: 'Artificial Intelligence', grade: 'A', credits: 4, semester: 'Spring 2024' }
      ],
      
      improvementAreas: [
        {
          area: 'Time Management',
          recommendation: 'Consider using digital planning tools to better organize assignment deadlines and study sessions.'
        },
        {
          area: 'Technical Writing',
          recommendation: 'Enroll in the Technical Communication workshop offered by the Writing Center to enhance documentation skills.'
        }
      ],
      
      // 学术荣誉与成就
      achievements: [
        {
          title: 'Dean\'s List',
          date: 'Fall 2023, Spring 2024',
          description: 'Achieved GPA of 3.5 or higher for consecutive semesters'
        },
        {
          title: 'Programming Competition - 2nd Place',
          date: 'March 2024',
          description: 'Regional ACM ICPC Programming Competition'
        },
        {
          title: 'Research Assistant',
          date: 'January 2024 - Present',
          description: 'Working on machine learning projects under Dr. Sarah Chen'
        }
      ],
      
      // 教师评语
      advisorComments: 'Emily has demonstrated exceptional analytical abilities and a strong commitment to academic excellence. Her participation in class discussions is thoughtful and contributes significantly to the learning environment. She shows particular strength in algorithmic problem-solving and has been proactive in seeking research opportunities. I encourage her to continue exploring advanced topics in artificial intelligence and consider graduate studies in this field.',
      advisorName: 'Dr. Michael Chen',
      advisorTitle: 'Academic Advisor, Computer Science Department',
      
      // 院长评语
      deanComments: 'Ms. Johnson exemplifies the qualities we seek in our students: intellectual curiosity, academic rigor, and a collaborative spirit. Her consistent placement on the Dean\'s List and active engagement in research activities demonstrate her dedication to scholarly pursuits. We are confident that she will continue to excel and make meaningful contributions to the field of computer science.',
      deanName: 'Dr. Robert Anderson',
      deanTitle: 'Dean, School of Computer Science',
      
      // 学期目标与建议
      goals: [
        { goal: 'Complete senior thesis on machine learning applications', status: 'In Progress' },
        { goal: 'Maintain GPA above 3.8', status: 'On Track' },
        { goal: 'Present research at conference', status: 'Planned' },
        { goal: 'Complete internship at tech company', status: 'Completed' }
      ],
      
      recommendations: 'Continue to engage actively in research opportunities and consider applying for graduate programs in Computer Science with a focus on Artificial Intelligence. Explore leadership roles in student organizations to develop management and communication skills. Consider taking advanced elective courses in Machine Learning and Data Science to strengthen expertise in emerging technologies.',
      
      // 签名与印章
      advisorSignature: '',
      deanSignature: '',
      sealImage: '',
      
      // 设计选项
      reportStyle: 'Harvard Style',
      decorativeBorderStyle: 'Classic',
      headerColor: '#8B0000',
      cardBackgroundColor: '#f8f9fa',
      accentColor: '#C41E3A',
      primaryColor: '#2c3e50',
      textColor: '#212529',      fontFamily: 'Times New Roman',
      logoImage: '',
      
      // 水印设置
      enableWatermark: false,
      // 斜线水印（页面级独立）
      diagonalWatermarkEnabled: false,
      diagonalLineWidth: 20,
      diagonalLineSpacing: 40,
      diagonalLineColor: '#000000',
      diagonalLineOpacity: 5,
      diagonalLineRotation: -30,
      diagonalOverlay: false,
      // 文字水印（页面级独立）
      textWatermarkEnabled: false,
      textWatermarkText: 'OFFICIAL DOCUMENT',
      textWatermarkSize: 14,
      textWatermarkFontFamily: 'Times New Roman',
      textWatermarkColor: '#000000',
      textWatermarkOpacity: 5,
      textWatermarkRotation: -30,
      watermarkText: 'OFFICIAL',
      watermarkOpacity: 8,
      watermarkRotation: -30,
      watermarkSize: 48,
      watermarkColor: '#000000',
      watermarkOverlay: false,
      fullScreenWatermark: false,
      fullScreenWatermarkAngle: -45,
      fullScreenWatermarkFontFamily: 'Arial',
      watermarkSpacingX: 150,
      watermarkSpacingY: 100,
      watermarkFontFamily: 'Arial',
      borderEnabled: false,
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      
      // 条形码和二维码设置
      showBarcode: false,
      barcodeSource: 'generate',
      barcodeImage: '',
      barcodeContent: '',
      showQR: false,
      qrSource: 'generate',
      qrImage: '',
      qrContent: ''
    } as AcademicReportInfo
  }),
  
  actions: {
    // 从其他store自动提取数据
    importDataFromStores() {
      // 动态导入其他stores
      const studentStore = useStudentStore()
      
      // 提取学生基本信息
      if (studentStore.studentInfo) {
        this.reportInfo.studentName = studentStore.studentInfo.name || this.reportInfo.studentName
        this.reportInfo.studentId = studentStore.studentInfo.studentId || this.reportInfo.studentId
        this.reportInfo.program = studentStore.studentInfo.major || this.reportInfo.program
        this.reportInfo.department = studentStore.studentInfo.school || this.reportInfo.department
        this.reportInfo.academicYear = studentStore.studentInfo.academicYear || this.reportInfo.academicYear
      }
      
      // 从课程数据计算GPA和学分
      if (studentStore.courses && studentStore.courses.length > 0) {
        const courses = studentStore.courses
        
        // 计算总学分和已完成学分
        let totalCredits = 0
        let totalGradePoints = 0
        let excellentCourses: any[] = []
        
        courses.forEach(course => {
          const credits = course.credits || 0
          totalCredits += credits
          
          // 根据成绩计算绩点（简化版）
          let gradePoint = 0
          const grade = course.grade || ''
          
          if (grade.includes('A') || grade >= '90') {
            gradePoint = 4.0
            // 添加优秀课程
            if (excellentCourses.length < 5) {
              excellentCourses.push({
                courseCode: course.code || course.courseCode,
                courseName: course.name,
                grade: grade.toString(),
                credits: credits,
                semester: course.semester || this.reportInfo.academicYear
              })
            }
          } else if (grade.includes('B') || grade >= '80') {
            gradePoint = 3.0
          } else if (grade.includes('C') || grade >= '70') {
            gradePoint = 2.0
          } else if (grade.includes('D') || grade >= '60') {
            gradePoint = 1.0
          }
          
          totalGradePoints += gradePoint * credits
        })
        
        // 计算GPA
        const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00'
        
        this.reportInfo.totalCredits = totalCredits
        this.reportInfo.completedCredits = totalCredits
        this.reportInfo.currentGPA = gpa
        this.reportInfo.cumulativeGPA = gpa
        
        // 设置优秀课程
        if (excellentCourses.length > 0) {
          this.reportInfo.excellentCourses = excellentCourses
        }
        
        // 根据GPA设置学术评价
        const gpaNum = parseFloat(gpa)
        if (gpaNum >= 3.7) {
          this.reportInfo.academicStanding = '优秀 (Excellent)'
          this.reportInfo.performanceLevel = 'A'
        } else if (gpaNum >= 3.0) {
          this.reportInfo.academicStanding = '良好 (Good)'
          this.reportInfo.performanceLevel = 'B'
        } else if (gpaNum >= 2.0) {
          this.reportInfo.academicStanding = '及格 (Pass)'
          this.reportInfo.performanceLevel = 'C'
        } else {
          this.reportInfo.academicStanding = '需要改进 (Needs Improvement)'
          this.reportInfo.performanceLevel = 'D'
        }
      }
      
      // 从录取通知书提取信息
      if (studentStore.admissionLetter) {
        if (!this.reportInfo.studentName) {
          this.reportInfo.studentName = studentStore.admissionLetter.studentName
        }
        if (!this.reportInfo.program) {
          this.reportInfo.program = studentStore.admissionLetter.program
        }
        if (!this.reportInfo.department) {
          this.reportInfo.department = studentStore.admissionLetter.department
        }
      }
      
      // 设置报告日期为当前日期
      this.reportInfo.reportDate = new Date().toLocaleDateString('zh-CN')
    },
    
    updateReportInfo(data: Partial<AcademicReportInfo>) {
      this.reportInfo = { ...this.reportInfo, ...data }
    },
    
    addAchievement(achievement: { title: string; date: string; description: string }) {
      this.reportInfo.achievements.push(achievement)
    },
    
    removeAchievement(index: number) {
      this.reportInfo.achievements.splice(index, 1)
    },
    
    addExcellentCourse(course: { courseName: string; grade: string; credits: number; semester: string }) {
      this.reportInfo.excellentCourses.push(course)
    },
    
    removeExcellentCourse(index: number) {
      this.reportInfo.excellentCourses.splice(index, 1)
    },
    
    addGoal(goal: { goal: string; status: string }) {
      this.reportInfo.goals.push(goal)
    },
    
    removeGoal(index: number) {
      this.reportInfo.goals.splice(index, 1)
    },
    
    resetReport() {
      this.$reset()
    }
  }
})

// 导入studentStore供使用
import { useStudentStore } from './student'
