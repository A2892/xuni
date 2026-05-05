// 类型定义
export interface UniversityInfo {
  name: string
  address: string
  website: string
  phone: string
  email: string
  logo?: string
  signature?: string
  // 背面可编辑字段
  backsideTitle?: string
  termsOfUse?: string
  lostCardInfo?: string
  accessPrivileges?: string
  backsideLogo?: string
  backsideLogoOpacity?: number
}

export interface StudentInfo {
  name: string
  studentId: string
  major: string
  school?: string
  degree?: string
  enrollmentYear?: string
  enrollmentDate: string
  expectedGraduation: string
  expiryDate?: string
  academicYear?: string
  term?: string
}

export interface StudentPhoto {
  url: string
  sticker?: string
  logo?: string
  watermark?: string
  opacity: number
}

export interface IDCardStyle {
  template: string
  pattern: string
  color: string
  cornerPattern: string
  stickers: string[]
  cardOrientation?: string
  cardStyle?: string
  cardColor?: string
  textColor?: string
  barcodeType?: string
  enableRealisticEffect?: boolean
  enableWatermark?: boolean
  watermarkText?: string
  watermarkColor?: string
  watermarkSize?: number
  watermarkRotation?: number
  watermarkOpacity?: number
  enableBackside?: boolean
  backgroundOpacity?: number
  // 背景图片
  backgroundImage?: string
}

export interface Course {
  code: string
  name: string
  instructor: string
  location: string
  time: string
  day: string
  credits: number
  grade?: string
  semester: string
}

export interface Transcript {
  courses: Course[]
  totalCredits: number
  completedCredits: number
  gpa: number
}

export interface AdmissionLetter {
  universityName: string
  studentName: string
  program: string
  major: string
  department: string
  degreeType: string
  admissionDate: string
  startDate: string
  duration: string
  scholarship: string
  dean: string
  deanTitle: string
  signatureDate: string
  sealType: string
  sealText: string
  sealImage: string
  letterTitle: string
  greeting: string
  bodyText: string
  congratulations: string
  nextSteps: string
}

export interface OfficialSeal {
  organizationName: string
  sealNumber: string
  sealType: string
  sealShape: 'circular' | 'ellipse' | 'square'
  sealSize: number
  outerDiameter: number
  innerDiameter: number
  starSize: number
  borderWidth: number
  borderColor: string
  textColor: string
  starColor: string
  fontSize: number
  bottomText: string
  showStar: boolean
  showSerialNumber: boolean
  textArrangement: 'circular' | 'horizontal'
  fontFamily: string
  rotationAngle: number
  enableEmbossEffect: boolean
  enableTexture: boolean
  textureOpacity: number
  inkEffect: 'normal' | 'stamp' | 'faded'
}

export interface PassportInfo {
  country: string
  passportType: string
  passportNumber: string
  surname: string
  givenNames: string
  nationality: string
  dateOfBirth: string
  sex: string
  placeOfBirth: string
  dateOfIssue: string
  dateOfExpiry: string
  authority: string
  photo: string
  signature: string
}

export interface AcademicReportInfo {
  studentName: string
  studentId: string
  program: string
  department: string
  academicYear: string
  reportDate: string
  currentGPA: string
  cumulativeGPA: string
  totalCredits: number
  completedCredits: number
  rank: string
  totalStudents: number
  academicStanding: string
  performanceLevel: string
  attendanceRate: string
  excellentCourses: Array<{
    courseName: string
    grade: string
    credits: number
    semester: string
  }>
  improvementAreas: Array<{
    area: string
    recommendation: string
  }>
  achievements: Array<{
    title: string
    date: string
    description: string
  }>
  advisorComments: string
  advisorName: string
  advisorTitle: string
  deanComments: string
  deanName: string
  deanTitle: string
  goals: Array<{
    goal: string
    status: string
  }>
  recommendations: string
  advisorSignature: string
  deanSignature: string
  sealImage: string
  reportStyle: string
  borderStyle: string
  headerColor: string
  accentColor: string
  fontFamily: string
  logoImage: string
  enableWatermark: boolean
  watermarkText: string
  watermarkOpacity: number
  watermarkRotation: number
  watermarkSize: number
  watermarkColor: string
}
