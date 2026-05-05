import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface BusinessCardData {
  // Personal Info
  fullName: string
  title: string
  company: string
  department: string
  
  // Contact Info
  email: string
  phone: string
  mobile: string
  fax: string
  website: string
  address: string
  
  // Social Media
  linkedin: string
  twitter: string
  instagram: string
  wechat: string
  
  // Branding
  logo: string
  photo: string
  qrCode: string
  
  // Settings
  settings: {
    template: 'modern' | 'classic' | 'minimal' | 'creative' | 'luxury' | 'tech' | 'elegant' | 'bold'
    primaryColor: string
    secondaryColor: string
    textColor: string
    backgroundColor: string
    fontFamily: string
    orientation: 'horizontal' | 'vertical'
    showPhoto: boolean
    showLogo: boolean
    showQR: boolean
    cardSize: 'standard' | 'us' | 'eu' | 'square'
    borderRadius: number
    showSocialIcons: boolean
  }
}

export const useBusinessCardStore = defineStore('businessCard', () => {
  const fullName = ref('Alexandra Chen')
  const title = ref('Chief Marketing Officer')
  const company = ref('Innovate Global')
  const department = ref('Marketing & Communications')
  
  const email = ref('alexandra.chen@innovateglobal.com')
  const phone = ref('+1 (555) 234-5678')
  const mobile = ref('+1 (555) 876-5432')
  const fax = ref('+1 (555) 234-5679')
  const website = ref('www.innovateglobal.com')
  const address = ref('500 Innovation Blvd, Suite 200\nSan Francisco, CA 94105')
  
  const linkedin = ref('linkedin.com/in/alexandrachen')
  const twitter = ref('@alexchen_mkt')
  const instagram = ref('@innovateglobal')
  const wechat = ref('alexandrachen')
  
  const logo = ref('')
  const photo = ref('')
  const qrCode = ref('')
  
  const settings = ref({
    template: 'modern' as const,
    primaryColor: '#1a365d',
    secondaryColor: '#2b6cb0',
    textColor: '#1a202c',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    orientation: 'horizontal' as const,
    showPhoto: false,
    showLogo: true,
    showQR: true,
    cardSize: 'standard' as const,
    borderRadius: 8,
    showSocialIcons: true
  })

  const templates = [
    { id: 'modern', name: 'Modern', description: 'Clean and professional' },
    { id: 'classic', name: 'Classic', description: 'Traditional business style' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
    { id: 'creative', name: 'Creative', description: 'Bold and artistic' },
    { id: 'luxury', name: 'Luxury', description: 'Premium and sophisticated' },
    { id: 'tech', name: 'Tech', description: 'Modern technology style' },
    { id: 'elegant', name: 'Elegant', description: 'Refined and graceful' },
    { id: 'bold', name: 'Bold', description: 'Strong and impactful' }
  ]

  const colorPresets = [
    { primary: '#1a365d', secondary: '#2b6cb0', name: 'Navy Blue' },
    { primary: '#234e52', secondary: '#38b2ac', name: 'Teal' },
    { primary: '#742a2a', secondary: '#c53030', name: 'Burgundy' },
    { primary: '#1a202c', secondary: '#4a5568', name: 'Charcoal' },
    { primary: '#2d3748', secondary: '#667eea', name: 'Indigo' },
    { primary: '#22543d', secondary: '#38a169', name: 'Forest Green' },
    { primary: '#553c9a', secondary: '#805ad5', name: 'Purple' },
    { primary: '#b7791f', secondary: '#d69e2e', name: 'Gold' }
  ]

  const cardSizes = {
    standard: { width: '3.5in', height: '2in', label: 'Standard (3.5" x 2")' },
    us: { width: '3.5in', height: '2in', label: 'US (3.5" x 2")' },
    eu: { width: '85mm', height: '55mm', label: 'EU (85mm x 55mm)' },
    square: { width: '2.5in', height: '2.5in', label: 'Square (2.5" x 2.5")' }
  }

  return {
    fullName,
    title,
    company,
    department,
    email,
    phone,
    mobile,
    fax,
    website,
    address,
    linkedin,
    twitter,
    instagram,
    wechat,
    logo,
    photo,
    qrCode,
    settings,
    templates,
    colorPresets,
    cardSizes
  }
})
