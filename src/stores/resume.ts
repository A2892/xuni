import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa?: string
  description?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  achievements: string[]
}

export interface Skill {
  id: string
  name: string
  level: number // 1-5
  category: string
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  link?: string
  startDate: string
  endDate: string
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
  link?: string
}

export interface Language {
  id: string
  name: string
  level: string // Native, Fluent, Advanced, Intermediate, Basic
}

export interface ResumeData {
  // Personal Info
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    website?: string
    linkedin?: string
    github?: string
    summary: string
    photo?: string
    title: string
  }
  // Sections
  education: Education[]
  experience: Experience[]
  skills: Skill[]
  projects: Project[]
  certificates: Certificate[]
  languages: Language[]
  // Settings
  settings: {
    template: 'modern' | 'classic' | 'minimal' | 'creative' | 'executive'
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    fontSize: 'small' | 'medium' | 'large'
    showPhoto: boolean
    showIcons: boolean
    sectionOrder: string[]
  }
}

export const useResumeStore = defineStore('resume', () => {
  const personalInfo = ref({
    fullName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    website: 'www.johnsmith.com',
    linkedin: 'linkedin.com/in/johnsmith',
    github: 'github.com/johnsmith',
    summary: 'Experienced software engineer with 5+ years of expertise in full-stack development. Passionate about creating scalable applications and mentoring junior developers. Strong background in React, Node.js, and cloud technologies.',
    photo: '',
    title: 'Senior Software Engineer'
  })

  const education = ref<Education[]>([
    {
      id: '1',
      school: 'Massachusetts Institute of Technology',
      degree: 'Master of Science',
      field: 'Computer Science',
      startDate: '2016-09',
      endDate: '2018-06',
      gpa: '3.9/4.0',
      description: 'Focus on Machine Learning and Distributed Systems'
    },
    {
      id: '2',
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2012-09',
      endDate: '2016-05',
      gpa: '3.8/4.0',
      description: ''
    }
  ])

  const experience = ref<Experience[]>([
    {
      id: '1',
      company: 'Google',
      position: 'Senior Software Engineer',
      location: 'Mountain View, CA',
      startDate: '2020-03',
      endDate: '',
      current: true,
      description: 'Lead developer for cloud infrastructure team',
      achievements: [
        'Led a team of 5 engineers to deliver a new microservices architecture, reducing system latency by 40%',
        'Designed and implemented real-time data processing pipeline handling 1M+ events per second',
        'Mentored 3 junior engineers and conducted 50+ technical interviews'
      ]
    },
    {
      id: '2',
      company: 'Amazon',
      position: 'Software Development Engineer',
      location: 'Seattle, WA',
      startDate: '2018-07',
      endDate: '2020-02',
      current: false,
      description: 'Full-stack developer for AWS services',
      achievements: [
        'Developed key features for AWS Lambda, serving millions of customers globally',
        'Reduced deployment time by 60% through CI/CD pipeline optimization',
        'Collaborated with product team to define and prioritize feature roadmap'
      ]
    }
  ])

  const skills = ref<Skill[]>([
    { id: '1', name: 'JavaScript/TypeScript', level: 5, category: 'Programming' },
    { id: '2', name: 'Python', level: 5, category: 'Programming' },
    { id: '3', name: 'React', level: 5, category: 'Frontend' },
    { id: '4', name: 'Vue.js', level: 4, category: 'Frontend' },
    { id: '5', name: 'Node.js', level: 5, category: 'Backend' },
    { id: '6', name: 'PostgreSQL', level: 4, category: 'Database' },
    { id: '7', name: 'AWS', level: 4, category: 'Cloud' },
    { id: '8', name: 'Docker', level: 4, category: 'DevOps' },
    { id: '9', name: 'Kubernetes', level: 3, category: 'DevOps' },
    { id: '10', name: 'GraphQL', level: 4, category: 'API' }
  ])

  const projects = ref<Project[]>([
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Built a scalable e-commerce platform with real-time inventory management and payment processing',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe'],
      link: 'github.com/johnsmith/ecommerce',
      startDate: '2022-01',
      endDate: '2022-06'
    },
    {
      id: '2',
      name: 'AI Chat Application',
      description: 'Developed an AI-powered chat application using OpenAI GPT API with real-time messaging',
      technologies: ['Vue.js', 'Python', 'FastAPI', 'WebSocket', 'OpenAI'],
      link: 'github.com/johnsmith/ai-chat',
      startDate: '2023-03',
      endDate: '2023-05'
    }
  ])

  const certificates = ref<Certificate[]>([
    { id: '1', name: 'AWS Solutions Architect Professional', issuer: 'Amazon Web Services', date: '2023-01', link: '' },
    { id: '2', name: 'Google Cloud Professional Developer', issuer: 'Google Cloud', date: '2022-06', link: '' },
    { id: '3', name: 'Certified Kubernetes Administrator', issuer: 'CNCF', date: '2021-11', link: '' }
  ])

  const languages = ref<Language[]>([
    { id: '1', name: 'English', level: 'Native' },
    { id: '2', name: 'Spanish', level: 'Fluent' },
    { id: '3', name: 'Mandarin', level: 'Intermediate' }
  ])

  const settings = ref({
    template: 'modern' as const,
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    fontFamily: 'Inter',
    fontSize: 'medium' as const,
    showPhoto: true,
    showIcons: true,
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certificates', 'languages']
  })

  // Actions
  const addEducation = () => {
    education.value.push({
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: ''
    })
  }

  const removeEducation = (id: string) => {
    education.value = education.value.filter(e => e.id !== id)
  }

  const addExperience = () => {
    experience.value.push({
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: ['']
    })
  }

  const removeExperience = (id: string) => {
    experience.value = experience.value.filter(e => e.id !== id)
  }

  const addSkill = () => {
    skills.value.push({
      id: Date.now().toString(),
      name: '',
      level: 3,
      category: 'Other'
    })
  }

  const removeSkill = (id: string) => {
    skills.value = skills.value.filter(s => s.id !== id)
  }

  const addProject = () => {
    projects.value.push({
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      link: '',
      startDate: '',
      endDate: ''
    })
  }

  const removeProject = (id: string) => {
    projects.value = projects.value.filter(p => p.id !== id)
  }

  const addCertificate = () => {
    certificates.value.push({
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      link: ''
    })
  }

  const removeCertificate = (id: string) => {
    certificates.value = certificates.value.filter(c => c.id !== id)
  }

  const addLanguage = () => {
    languages.value.push({
      id: Date.now().toString(),
      name: '',
      level: 'Intermediate'
    })
  }

  const removeLanguage = (id: string) => {
    languages.value = languages.value.filter(l => l.id !== id)
  }

  // Computed
  const skillsByCategory = computed(() => {
    const categories = new Map<string, Skill[]>()
    skills.value.forEach(skill => {
      if (!categories.has(skill.category)) {
        categories.set(skill.category, [])
      }
      categories.get(skill.category)!.push(skill)
    })
    return categories
  })

  return {
    personalInfo,
    education,
    experience,
    skills,
    projects,
    certificates,
    languages,
    settings,
    skillsByCategory,
    addEducation,
    removeEducation,
    addExperience,
    removeExperience,
    addSkill,
    removeSkill,
    addProject,
    removeProject,
    addCertificate,
    removeCertificate,
    addLanguage,
    removeLanguage
  }
})
