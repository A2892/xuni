import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface InvoiceItem {
  id: string
  sku: string           // 产品编号/SKU
  description: string   // 描述
  category: string      // 分类
  unit: string          // 单位
  quantity: number      // 数量
  unitPrice: number     // 单价
  tax: number           // 税率
  discount: number      // 折扣
  notes: string         // 备注
}

// 发票类型定义
export type InvoiceType = 'general' | 'retail' | 'luxury' | 'automotive' | 'real_estate' | 'restaurant' | 'medical' | 'education'

// 发票类型预设数据
export const invoiceTypePresets: Record<InvoiceType, {
  name: string
  icon: string
  defaultCompany: {
    name: string
    industry: string
    address: string
    city: string
    state: string
    zip: string
    country: string
    phone: string
    email: string
    website: string
    taxId: string
    bankName: string
    bankAccount: string
    bankRouting: string
    swiftCode: string
  }
  sampleItems: InvoiceItem[]
  taxRate: number
  notes: string
  terms: string
  primaryColor: string
}> = {
  general: {
    name: '通用发票',
    icon: '📄',
    defaultCompany: {
      name: 'Business Corp.',
      industry: 'General',
      address: '100 Corporate Plaza',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      phone: '+1 (555) 100-1000',
      email: 'info@businesscorp.com',
      website: 'www.businesscorp.com',
      taxId: 'US10-0001000',
      bankName: 'Bank of America',
      bankAccount: '****1000',
      bankRouting: '026009593',
      swiftCode: 'BOFAUS3N'
    },
    sampleItems: [
      { id: '1', sku: 'SVC-001', description: 'Professional Services', category: 'Services', unit: 'hour', quantity: 1, unitPrice: 500, tax: 10, discount: 0, notes: '' },
      { id: '2', sku: 'SVC-002', description: 'Consultation Fee', category: 'Services', unit: 'session', quantity: 2, unitPrice: 150, tax: 10, discount: 0, notes: '' }
    ],
    taxRate: 10,
    notes: 'Thank you for your business!',
    terms: '1. Payment due within 30 days.\n2. Late payments subject to 1.5% monthly interest.',
    primaryColor: '#2563eb'
  },
  retail: {
    name: '日常购物',
    icon: '🛒',
    defaultCompany: {
      name: 'SuperMart Store',
      industry: 'Retail',
      address: '888 Shopping Center Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'United States',
      phone: '+1 (555) 888-8888',
      email: 'service@supermart.com',
      website: 'www.supermart.com',
      taxId: 'US88-8888888',
      bankName: 'Wells Fargo',
      bankAccount: '****8888',
      bankRouting: '121000248',
      swiftCode: 'WFBIUS6S'
    },
    sampleItems: [
      { id: '1', sku: 'GRC-001', description: 'Groceries', category: 'Food', unit: 'lot', quantity: 1, unitPrice: 85.50, tax: 8, discount: 0, notes: '' },
      { id: '2', sku: 'HHI-002', description: 'Household Items', category: 'Home', unit: 'pcs', quantity: 3, unitPrice: 12.99, tax: 8, discount: 0, notes: '' },
      { id: '3', sku: 'PCP-003', description: 'Personal Care Products', category: 'Personal Care', unit: 'pcs', quantity: 2, unitPrice: 15.99, tax: 8, discount: 5, notes: 'Member discount' }
    ],
    taxRate: 8,
    notes: 'Thank you for shopping with us! Return policy: 30 days with receipt.',
    terms: '1. Returns accepted within 30 days with original receipt.\n2. Store credit for items without receipt.',
    primaryColor: '#10b981'
  },
  luxury: {
    name: '奢侈品',
    icon: '💎',
    defaultCompany: {
      name: 'Luxe Boutique',
      industry: 'Luxury Goods',
      address: '123 Business Avenue, Suite 500',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      email: 'billing@acmecorp.com',
      website: 'www.luxeboutique.com',
      taxId: 'US12-3456789',
      bankName: 'Chase Bank',
      bankAccount: '****4567',
      bankRouting: '021000021',
      swiftCode: 'CHASUS33'
    },
    sampleItems: [
      { id: '1', sku: 'LUX-001', description: 'Designer Handbag - Limited Edition', category: 'Accessories', unit: 'pcs', quantity: 1, unitPrice: 3500, tax: 12, discount: 0, notes: 'Limited Edition 2026' },
      { id: '2', sku: 'LUX-002', description: 'Swiss Watch - Chronograph', category: 'Watches', unit: 'pcs', quantity: 1, unitPrice: 8900, tax: 12, discount: 0, notes: 'Certificate included' },
      { id: '3', sku: 'LUX-003', description: 'Diamond Jewelry Set', category: 'Jewelry', unit: 'set', quantity: 1, unitPrice: 15000, tax: 12, discount: 5, notes: 'VIP discount' }
    ],
    taxRate: 12,
    notes: 'Certificate of authenticity included. Lifetime warranty on all items.',
    terms: '1. All items include certificate of authenticity.\n2. Lifetime warranty on manufacturing defects.\n3. Free worldwide shipping on orders over $5,000.',
    primaryColor: '#8b5cf6'
  },
  automotive: {
    name: '汽车购买',
    icon: '🚗',
    defaultCompany: {
      name: 'Premium Auto Sales',
      industry: 'Automotive',
      address: '5000 Auto Mall Drive',
      city: 'Detroit',
      state: 'MI',
      zip: '48201',
      country: 'United States',
      phone: '+1 (555) 500-5000',
      email: 'sales@premiumauto.com',
      website: 'www.premiumautosales.com',
      taxId: 'US50-0050000',
      bankName: 'PNC Bank',
      bankAccount: '****5000',
      bankRouting: '043000096',
      swiftCode: 'PNCCUS33'
    },
    sampleItems: [
      { id: '1', sku: 'VEH-2026-001', description: 'Vehicle - 2026 Model Sedan', category: 'Vehicle', unit: 'unit', quantity: 1, unitPrice: 45000, tax: 10, discount: 0, notes: 'VIN: 1HGBH41JXMN109186' },
      { id: '2', sku: 'WAR-5YR', description: 'Extended Warranty (5 years)', category: 'Warranty', unit: 'plan', quantity: 1, unitPrice: 2500, tax: 10, discount: 0, notes: '' },
      { id: '3', sku: 'DOC-REG', description: 'Registration & Documentation', category: 'Fees', unit: 'lot', quantity: 1, unitPrice: 350, tax: 0, discount: 0, notes: '' },
      { id: '4', sku: 'INS-1YR', description: 'First Year Insurance', category: 'Insurance', unit: 'year', quantity: 1, unitPrice: 1800, tax: 0, discount: 10, notes: 'New customer discount' }
    ],
    taxRate: 10,
    notes: 'Vehicle delivery within 7 business days. Full manufacturer warranty included.',
    terms: '1. Vehicle delivery within 7 business days.\n2. Full manufacturer warranty applies.\n3. Trade-in value as agreed upon signing.',
    primaryColor: '#dc2626'
  },
  real_estate: {
    name: '房地产',
    icon: '🏠',
    defaultCompany: {
      name: 'Elite Realty Group',
      industry: 'Real Estate',
      address: '1 Luxury Tower, Penthouse',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
      country: 'United States',
      phone: '+1 (555) 111-1111',
      email: 'contact@eliterealty.com',
      website: 'www.eliterealtygroup.com',
      taxId: 'US11-1111111',
      bankName: 'Citibank',
      bankAccount: '****1111',
      bankRouting: '021000089',
      swiftCode: 'CITIUS33'
    },
    sampleItems: [
      { id: '1', sku: 'PROP-3BR-001', description: 'Property Purchase - 3BR Apartment', category: 'Property', unit: 'unit', quantity: 1, unitPrice: 450000, tax: 0, discount: 0, notes: 'Lot #A-1234' },
      { id: '2', sku: 'LEGAL-DOC', description: 'Legal & Documentation Fees', category: 'Legal', unit: 'lot', quantity: 1, unitPrice: 5000, tax: 10, discount: 0, notes: '' },
      { id: '3', sku: 'INSP-001', description: 'Property Inspection', category: 'Services', unit: 'inspection', quantity: 1, unitPrice: 800, tax: 10, discount: 0, notes: '' },
      { id: '4', sku: 'COMM-3PCT', description: 'Agency Commission (3%)', category: 'Commission', unit: 'lot', quantity: 1, unitPrice: 13500, tax: 10, discount: 0, notes: '' }
    ],
    taxRate: 0,
    notes: 'Property transfer subject to local regulations. Title deed will be transferred within 30 days.',
    terms: '1. Property transfer subject to local regulations.\n2. Title deed transfer within 30 business days.\n3. Buyer responsible for closing costs.',
    primaryColor: '#0891b2'
  },
  restaurant: {
    name: '餐饮消费',
    icon: '🍽️',
    defaultCompany: {
      name: 'Fine Dining Restaurant',
      industry: 'Food & Beverage',
      address: '99 Gourmet Street',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'United States',
      phone: '+1 (555) 999-9999',
      email: 'reservations@finedining.com',
      website: 'www.finediningrestaurant.com',
      taxId: 'US99-9999999',
      bankName: 'US Bank',
      bankAccount: '****9999',
      bankRouting: '042000013',
      swiftCode: 'USBKUS44'
    },
    sampleItems: [
      { id: '1', sku: 'APP-001', description: 'Appetizer - Chef\'s Selection', category: 'Appetizer', unit: 'serving', quantity: 2, unitPrice: 18, tax: 8, discount: 0, notes: '' },
      { id: '2', sku: 'MAIN-002', description: 'Main Course - Grilled Steak', category: 'Main Course', unit: 'serving', quantity: 2, unitPrice: 45, tax: 8, discount: 0, notes: 'Medium rare' },
      { id: '3', sku: 'BEV-003', description: 'Wine - Premium Selection', category: 'Beverage', unit: 'bottle', quantity: 1, unitPrice: 85, tax: 8, discount: 0, notes: '2020 Vintage' },
      { id: '4', sku: 'DES-004', description: 'Dessert Platter', category: 'Dessert', unit: 'serving', quantity: 1, unitPrice: 28, tax: 8, discount: 0, notes: '' }
    ],
    taxRate: 8,
    notes: 'Service charge included. Thank you for dining with us!',
    terms: '1. Gratuity of 18% added for parties of 6 or more.\n2. All prices subject to applicable taxes.',
    primaryColor: '#f59e0b'
  },
  medical: {
    name: '医疗服务',
    icon: '🏥',
    defaultCompany: {
      name: 'City Medical Center',
      industry: 'Healthcare',
      address: '200 Healthcare Boulevard',
      city: 'Boston',
      state: 'MA',
      zip: '02101',
      country: 'United States',
      phone: '+1 (555) 200-2000',
      email: 'billing@citymedical.com',
      website: 'www.citymedicalcenter.com',
      taxId: 'US20-0020000',
      bankName: 'TD Bank',
      bankAccount: '****2000',
      bankRouting: '031101266',
      swiftCode: 'TDOMCATTTOR'
    },
    sampleItems: [
      { id: '1', sku: 'MED-CONS', description: 'Consultation Fee', category: 'Consultation', unit: 'visit', quantity: 1, unitPrice: 150, tax: 0, discount: 0, notes: 'Dr. Smith' },
      { id: '2', sku: 'LAB-BLOOD', description: 'Laboratory Tests - Blood Panel', category: 'Laboratory', unit: 'test', quantity: 1, unitPrice: 280, tax: 0, discount: 0, notes: 'Complete metabolic panel' },
      { id: '3', sku: 'IMG-XRAY', description: 'X-Ray Imaging', category: 'Imaging', unit: 'scan', quantity: 1, unitPrice: 350, tax: 0, discount: 0, notes: 'Chest X-Ray' },
      { id: '4', sku: 'RX-001', description: 'Prescription Medication', category: 'Pharmacy', unit: 'prescription', quantity: 1, unitPrice: 95, tax: 0, discount: 10, notes: 'Generic available' }
    ],
    taxRate: 0,
    notes: 'For insurance reimbursement, please provide this invoice to your insurance company.',
    terms: '1. Payment due upon receipt of invoice.\n2. Insurance claims must be filed within 90 days.\n3. Patient responsible for any co-pays or deductibles.',
    primaryColor: '#06b6d4'
  },
  education: {
    name: '教育培训',
    icon: '📚',
    defaultCompany: {
      name: 'Premier Academy',
      industry: 'Education',
      address: '300 Campus Drive',
      city: 'Cambridge',
      state: 'MA',
      zip: '02138',
      country: 'United States',
      phone: '+1 (555) 300-3000',
      email: 'admissions@premieracademy.edu',
      website: 'www.premieracademy.edu',
      taxId: 'US30-0030000',
      bankName: 'Santander Bank',
      bankAccount: '****3000',
      bankRouting: '231372691',
      swiftCode: 'SVRNUS33'
    },
    sampleItems: [
      { id: '1', sku: 'TUI-SPR-2026', description: 'Course Tuition - Spring Semester', category: 'Tuition', unit: 'semester', quantity: 1, unitPrice: 5000, tax: 0, discount: 0, notes: 'Spring 2026' },
      { id: '2', sku: 'MAT-BOOK', description: 'Study Materials & Textbooks', category: 'Materials', unit: 'set', quantity: 1, unitPrice: 450, tax: 5, discount: 0, notes: '' },
      { id: '3', sku: 'FEE-LAB', description: 'Laboratory Fee', category: 'Fees', unit: 'semester', quantity: 1, unitPrice: 200, tax: 0, discount: 0, notes: '' },
      { id: '4', sku: 'FEE-ACT', description: 'Student Activity Fee', category: 'Fees', unit: 'semester', quantity: 1, unitPrice: 150, tax: 0, discount: 0, notes: '' }
    ],
    taxRate: 0,
    notes: 'This invoice serves as proof of payment for educational expenses.',
    terms: '1. Tuition must be paid before start of semester.\n2. Refund policy: 100% before 1st week, 50% before 2nd week.\n3. Financial aid applied automatically if approved.',
    primaryColor: '#7c3aed'
  }
}

export interface InvoiceData {
  // Invoice Info
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  currency: string
  invoiceType: InvoiceType
  
  // Company Info (From)
  company: {
    name: string
    logo?: string
    address: string
    city: string
    state: string
    zip: string
    country: string
    phone: string
    email: string
    website: string
    taxId: string
    bankName: string
    bankAccount: string
    bankRouting: string
    swiftCode: string
  }
  
  // Client Info (To)
  client: {
    name: string
    company: string
    address: string
    city: string
    state: string
    zip: string
    country: string
    phone: string
    email: string
    taxId: string
  }
  
  // Items
  items: InvoiceItem[]
  
  // Additional
  notes: string
  terms: string
  
  // Settings
  settings: {
    template: 'modern' | 'classic' | 'minimal' | 'corporate' | 'creative'
    primaryColor: string
    showLogo: boolean
    showBankDetails: boolean
    showTaxBreakdown: boolean
    taxRate: number
    discountType: 'percentage' | 'fixed'
    discountValue: number
    language?: 'en' | 'zh'
    // 默认发票货币（用于模板/发票首选项）
    defaultInvoiceCurrency?: string
  }
}

// 支持的货币列表
export const currencyOptions = [
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'EUR', name: '欧元', symbol: '€' },
  { code: 'GBP', name: '英镑', symbol: '£' },
  { code: 'CNY', name: '人民币', symbol: '¥' },
  { code: 'JPY', name: '日元', symbol: '¥' },
  { code: 'HKD', name: '港币', symbol: 'HK$' },
  { code: 'TWD', name: '新台币', symbol: 'NT$' },
  { code: 'SGD', name: '新加坡元', symbol: 'S$' },
  { code: 'AUD', name: '澳元', symbol: 'A$' },
  { code: 'CAD', name: '加元', symbol: 'C$' },
  { code: 'CHF', name: '瑞士法郎', symbol: 'CHF' },
  { code: 'KRW', name: '韩元', symbol: '₩' },
  { code: 'INR', name: '印度卢比', symbol: '₹' },
  { code: 'RUB', name: '俄罗斯卢布', symbol: '₽' },
  { code: 'BRL', name: '巴西雷亚尔', symbol: 'R$' },
  { code: 'MXN', name: '墨西哥比索', symbol: 'MX$' },
  { code: 'THB', name: '泰铢', symbol: '฿' },
  { code: 'MYR', name: '马来西亚林吉特', symbol: 'RM' },
  { code: 'PHP', name: '菲律宾比索', symbol: '₱' },
  { code: 'IDR', name: '印尼盾', symbol: 'Rp' },
  { code: 'VND', name: '越南盾', symbol: '₫' },
  { code: 'AED', name: '阿联酋迪拉姆', symbol: 'د.إ' },
  { code: 'SAR', name: '沙特里亚尔', symbol: '﷼' },
  { code: 'NZD', name: '新西兰元', symbol: 'NZ$' },
  { code: 'SEK', name: '瑞典克朗', symbol: 'kr' },
  { code: 'NOK', name: '挪威克朗', symbol: 'kr' },
  { code: 'DKK', name: '丹麦克朗', symbol: 'kr' },
  { code: 'PLN', name: '波兰兹罗提', symbol: 'zł' },
  { code: 'ZAR', name: '南非兰特', symbol: 'R' },
  { code: 'TRY', name: '土耳其里拉', symbol: '₺' }
]

export const useInvoiceStore = defineStore('invoice', () => {
  const invoiceNumber = ref('INV-2026-0001')
  const invoiceDate = ref(new Date().toISOString().split('T')[0])
  const dueDate = ref(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const status = ref<'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'>('draft')
  const currency = ref('USD')
  const invoiceType = ref<InvoiceType>('general')

  const company = ref({
    name: 'Acme Corporation',
    logo: '',
    address: '123 Business Avenue, Suite 500',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567',
    email: 'billing@acmecorp.com',
    website: 'www.acmecorp.com',
    taxId: 'US12-3456789',
    bankName: 'Chase Bank',
    bankAccount: '****4567',
    bankRouting: '021000021',
    swiftCode: 'CHASUS33'
  })

  // 付款信息（可独立编辑）
  const paymentInfo = ref({
    bankName: 'Chase  Bank',
    accountNumber: '****4567',
    routingNumber: '021000021',
    swiftCode: 'CHASUS33',
    iban: '',
    paypalEmail: '',
    otherPaymentMethod: '',
    paymentNotes: ''
  })

  const client = ref({
    name: 'Jane Doe',
    company: 'Tech Innovations Inc.',
    address: '456 Innovation Drive',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'United States',
    phone: '+1 (555) 987-6543',
    email: 'jane.doe@techinnovations.com',
    taxId: 'US98-7654321'
  })

  const items = ref<InvoiceItem[]>([
    {
      id: '1',
      sku: 'WEB-DEV-001',
      description: 'Website Design & Development',
      category: 'Web Services',
      unit: 'project',
      quantity: 1,
      unitPrice: 5000,
      tax: 10,
      discount: 0,
      notes: 'Includes 3 rounds of revisions'
    },
    {
      id: '2',
      sku: 'LOGO-PKG-001',
      description: 'Logo Design Package',
      category: 'Design',
      unit: 'package',
      quantity: 1,
      unitPrice: 1500,
      tax: 10,
      discount: 0,
      notes: 'Full branding kit included'
    },
    {
      id: '3',
      sku: 'HOST-MON',
      description: 'Monthly Hosting (12 months)',
      category: 'Hosting',
      unit: 'month',
      quantity: 12,
      unitPrice: 50,
      tax: 10,
      discount: 10,
      notes: 'Annual contract discount'
    },
    {
      id: '4',
      sku: 'SEO-SVC-001',
      description: 'SEO Optimization Service',
      category: 'Marketing',
      unit: 'service',
      quantity: 1,
      unitPrice: 2000,
      tax: 10,
      discount: 0,
      notes: ''
    }
  ])

  const notes = ref('Thank you for your business! Payment is due within 30 days of invoice date.')
  const terms = ref('1. Payment must be made within 30 days.\n2. Late payments will incur a 1.5% monthly interest charge.\n3. All prices are in USD unless otherwise specified.')

  const settings = ref({
    template: 'modern' as const,
    primaryColor: '#2563eb',
    showLogo: true,
    showBankDetails: true,
    showTaxBreakdown: true,
    taxRate: 10,
    discountType: 'percentage' as const,
    discountValue: 0,
    language: 'en' as 'en' | 'zh',
    // 默认发票货币
    defaultInvoiceCurrency: 'USD'
  })

  // 设计设置
  const designSettings = ref({
    watermarkEnabled: false,
    watermarkText: 'INVOICE',
    watermarkColor: '#cccccc',
    watermarkOpacity: 15,
    watermarkSize: 48,
    watermarkAngle: -30,
    watermarkFontFamily: 'Arial',
    fontFamily: 'Arial, sans-serif',
    textColor: '#1f2937',
    borderEnabled: false,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderStyle: 'solid' as 'solid' | 'dashed' | 'dotted'
  })

  // 条形码/二维码设置
  const barcodeSettings = ref({
    showBarcode: true,
    showQRCode: true,
    useCustomBarcode: false,
    customBarcodeImage: '',
    customQRImage: '',
    barcodeContent: ''
  })

  // 支付完成信息
  const paymentCompleted = ref({
    isPaid: false,
    paidDate: '',
    confirmationNumber: '',
    payerName: '',
    paidAmount: 0,
    paymentMethod: ''
  })

  // 完成支付
  const completePayment = (method: string, payerName: string) => {
    paymentCompleted.value = {
      isPaid: true,
      paidDate: new Date().toISOString().split('T')[0],
      confirmationNumber: generatePaymentConfirmation(),
      payerName: payerName || client.value.name,
      paidAmount: total.value,
      paymentMethod: method
    }
    status.value = 'paid'
  }

  // 重置支付状态
  const resetPayment = () => {
    paymentCompleted.value = {
      isPaid: false,
      paidDate: '',
      confirmationNumber: '',
      payerName: '',
      paidAmount: 0,
      paymentMethod: ''
    }
    status.value = 'draft'
  }

  // 生成支付确认号
  const generatePaymentConfirmation = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'PAY-'
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) result += '-'
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Computed
  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice
      const discount = item.discount > 0 ? itemTotal * (item.discount / 100) : 0
      return sum + (itemTotal - discount)
    }, 0)
  })

  const taxTotal = computed(() => {
    return items.value.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice
      const discount = item.discount > 0 ? itemTotal * (item.discount / 100) : 0
      const taxable = itemTotal - discount
      return sum + (taxable * (item.tax / 100))
    }, 0)
  })

  const discountTotal = computed(() => {
    return items.value.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice
      return sum + (item.discount > 0 ? itemTotal * (item.discount / 100) : 0)
    }, 0)
  })

  const total = computed(() => subtotal.value + taxTotal.value)

  // Actions
  const addItem = () => {
    const itemCount = items.value.length + 1
    items.value.push({
      id: Date.now().toString(),
      sku: `ITEM-${itemCount.toString().padStart(3, '0')}`,
      description: '',
      category: '',
      unit: 'pcs',
      quantity: 1,
      unitPrice: 0,
      tax: settings.value.taxRate,
      discount: 0,
      notes: ''
    })
  }

  const removeItem = (id: string) => {
    items.value = items.value.filter(item => item.id !== id)
  }

  const duplicateItem = (id: string) => {
    const item = items.value.find(i => i.id === id)
    if (item) {
      items.value.push({
        ...item,
        id: Date.now().toString()
      })
    }
  }

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    invoiceNumber.value = `INV-${year}-${random}`
  }

  const formatCurrency = (amount: number) => {
    const currencyInfo = currencyOptions.find(c => c.code === currency.value)
    const symbol = currencyInfo?.symbol || currency.value
    // 对于日元、韩元、越南盾等无小数货币特殊处理
    const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'IDR']
    const decimals = noDecimalCurrencies.includes(currency.value) ? 0 : 2
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
  }

  // 应用发票类型预设
  const applyInvoiceTypePreset = (type: InvoiceType) => {
    const preset = invoiceTypePresets[type]
    if (preset) {
      invoiceType.value = type
      // 更新公司信息
      company.value.name = preset.defaultCompany.name
      company.value.address = preset.defaultCompany.address
      company.value.city = preset.defaultCompany.city
      company.value.state = preset.defaultCompany.state
      company.value.zip = preset.defaultCompany.zip
      company.value.country = preset.defaultCompany.country
      company.value.phone = preset.defaultCompany.phone
      company.value.email = preset.defaultCompany.email
      company.value.website = preset.defaultCompany.website
      company.value.taxId = preset.defaultCompany.taxId
      company.value.bankName = preset.defaultCompany.bankName
      company.value.bankAccount = preset.defaultCompany.bankAccount
      company.value.bankRouting = preset.defaultCompany.bankRouting
      company.value.swiftCode = preset.defaultCompany.swiftCode
      // 更新商品项目
      items.value = preset.sampleItems.map(item => ({ ...item, id: Date.now().toString() + Math.random() }))
      // 更新备注和条款
      notes.value = preset.notes
      terms.value = preset.terms
      // 更新设置
      settings.value.taxRate = preset.taxRate
      settings.value.primaryColor = preset.primaryColor
    }
  }

  // 从公司信息同步到付款信息
  const syncPaymentInfoFromCompany = () => {
    paymentInfo.value.bankName = company.value.bankName
    paymentInfo.value.accountNumber = company.value.bankAccount
    paymentInfo.value.routingNumber = company.value.bankRouting
    paymentInfo.value.swiftCode = company.value.swiftCode
  }

  return {
    invoiceNumber,
    invoiceDate,
    dueDate,
    status,
    currency,
    invoiceType,
    company,
    paymentInfo,
    client,
    items,
    notes,
    terms,
    settings,
    designSettings,
    barcodeSettings,
    paymentCompleted,
    subtotal,
    taxTotal,
    discountTotal,
    total,
    addItem,
    removeItem,
    duplicateItem,
    generateInvoiceNumber,
    formatCurrency,
    applyInvoiceTypePreset,
    syncPaymentInfoFromCompany,
    completePayment,
    resetPayment,
    generatePaymentConfirmation
  }
})
