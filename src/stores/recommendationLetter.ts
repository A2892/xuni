// 推荐信 Store
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface RecommendationLetterData {
  // 学校/机构信息
  institutionName: string
  institutionNameEn: string
  institutionLogo: string
  institutionAddress: string
  institutionPhone: string
  institutionEmail: string
  departmentName: string
  departmentNameEn: string
  
  // 推荐人信息
  recommenderName: string
  recommenderNameEn: string
  recommenderTitle: string
  recommenderTitleEn: string
  recommenderEmail: string
  recommenderPhone: string
  relationship: string  // 与被推荐人的关系
  yearsKnown: number
  
  // 被推荐人信息
  applicantName: string
  applicantNameEn: string
  applicantGender: 'male' | 'female'
  applicantId: string
  applicantMajor: string
  applicantMajorEn: string
  applicantGrade: string
  applicantGPA: string
  
  // 推荐内容
  purpose: 'graduate' | 'undergraduate' | 'job' | 'scholarship' | 'other'
  targetInstitution: string
  targetProgram: string
  letterContent: string
  academicAbility: string
  researchAbility: string
  personalQualities: string
  recommendations: string
  
  // 证明信息
  issueDate: string
  letterNumber: string
  
  // 显示设置
  template: 'formal' | 'academic' | 'modern'
  showLetterhead: boolean
  showSignature: boolean
  language: 'chinese' | 'english' | 'bilingual'
}

export const useRecommendationLetterStore = defineStore('recommendationLetter', () => {
  const data = reactive<RecommendationLetterData>({
    institutionName: '北京大学',
    institutionNameEn: 'Peking University',
    institutionLogo: '',
    institutionAddress: '北京市海淀区颐和园路5号',
    institutionPhone: '010-62751111',
    institutionEmail: 'admissions@pku.edu.cn',
    departmentName: '信息科学技术学院',
    departmentNameEn: 'School of EECS',
    
    recommenderName: '李教授',
    recommenderNameEn: 'Prof. Li Ming',
    recommenderTitle: '教授 / 博士生导师',
    recommenderTitleEn: 'Professor / Doctoral Supervisor',
    recommenderEmail: 'liming@pku.edu.cn',
    recommenderPhone: '010-62751234',
    relationship: '课程导师及毕业论文指导教师',
    yearsKnown: 3,
    
    applicantName: '张三',
    applicantNameEn: 'ZHANG San',
    applicantGender: 'male',
    applicantId: '2020312345',
    applicantMajor: '计算机科学与技术',
    applicantMajorEn: 'Computer Science',
    applicantGrade: '2020级',
    applicantGPA: '3.85/4.0',
    
    purpose: 'graduate',
    targetInstitution: 'Stanford University',
    targetProgram: 'M.S. in Computer Science',
    letterContent: '',
    academicAbility: '该生学习成绩优异，基础扎实，具有很强的学习能力和科研潜力。在本科期间选修了多门高难度课程，均取得了优异的成绩。',
    researchAbility: '该生参与了我指导的科研项目，表现出色。能够独立思考，善于发现问题并提出创新性的解决方案。',
    personalQualities: '该生为人诚恳，踏实认真，具有良好的团队协作精神。善于与人沟通，在团队中能够发挥积极的作用。',
    recommendations: '综上所述，我毫无保留地推荐该生申请贵校的研究生项目，相信他将成为一名优秀的研究生。',
    
    issueDate: new Date().toISOString().split('T')[0],
    letterNumber: `RL${Date.now().toString().slice(-8)}`,
    
    template: 'formal',
    showLetterhead: true,
    showSignature: true,
    language: 'bilingual'
  })

  // 设计设置
  const designSettings = reactive({
    watermarkEnabled: false,
    watermarkText: 'CONFIDENTIAL',
    watermarkOpacity: 10,
    watermarkColor: '#cccccc',
    watermarkType: 'center' as 'center' | 'fullscreen',
    borderEnabled: false,
    borderStyle: 'solid',
    borderColor: '#333333',
    borderWidth: 1,
    stampEnabled: true,
    stampType: 'official',
    stampColor: '#dc2626',
    stampRotation: -15,
    stampText: '',
    fontFamilyCN: "'SimSun', serif",
    fontFamilyEN: "'Times New Roman', serif",
    letterheadEnabled: true,
    showSignatureLine: true
  })
  
  const generateLetterNumber = () => {
    data.letterNumber = `RL${Date.now().toString().slice(-8)}`
  }
  
  const setPurposeTemplate = (purpose: string) => {
    const purposes: Record<string, Partial<RecommendationLetterData>> = {
      graduate: {
        purpose: 'graduate',
        recommendations: '综上所述，我毫无保留地推荐该生申请贵校的研究生项目，相信他将成为一名优秀的研究生。'
      },
      undergraduate: {
        purpose: 'undergraduate',
        recommendations: '我非常乐意推荐该生申请贵校的本科项目，他将是一名出色的学生。'
      },
      job: {
        purpose: 'job',
        recommendations: '我强烈推荐该生申请贵公司的职位，相信他会成为贵公司的优秀员工。'
      },
      scholarship: {
        purpose: 'scholarship',
        recommendations: '该生学术表现优异，我强烈推荐其申请此奖学金。'
      }
    }
    if (purposes[purpose]) {
      Object.assign(data, purposes[purpose])
    }
  }
  
  const setRecommenderTemplate = (type: string) => {
    const templates: Record<string, Partial<RecommendationLetterData>> = {
      professor: {
        recommenderTitle: '教授 / 博士生导师',
        recommenderTitleEn: 'Professor / Doctoral Supervisor',
        relationship: '课程导师及毕业论文指导教师'
      },
      advisor: {
        recommenderTitle: '副教授 / 研究生导师',
        recommenderTitleEn: 'Associate Professor',
        relationship: '学术导师'
      },
      employer: {
        recommenderTitle: '总经理',
        recommenderTitleEn: 'General Manager',
        relationship: '实习导师'
      }
    }
    if (templates[type]) {
      Object.assign(data, templates[type])
    }
  }
  
  const generateFullContent = () => {
    const content = `
      ${data.academicAbility}

      ${data.researchAbility}

      ${data.personalQualities}

      ${data.recommendations}
    `
    data.letterContent = content.trim()
  }
  
  const reset = () => {
    data.applicantName = '张三'
    data.applicantNameEn = 'ZHANG San'
    data.issueDate = new Date().toISOString().split('T')[0]
    generateLetterNumber()
  }
  
  return {
    data,
    designSettings,
    generateLetterNumber,
    setPurposeTemplate,
    setRecommenderTemplate,
    generateFullContent,
    reset
  }
})

export const recommendationPurposes = [
  { value: 'graduate', label: '研究生申请', labelEn: 'Graduate School' },
  { value: 'undergraduate', label: '本科申请', labelEn: 'Undergraduate' },
  { value: 'job', label: '求职就业', labelEn: 'Employment' },
  { value: 'scholarship', label: '奖学金申请', labelEn: 'Scholarship' },
  { value: 'other', label: '其他', labelEn: 'Other' }
]
