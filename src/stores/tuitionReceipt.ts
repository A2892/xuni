import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FeeItem {
  id: string
  category: string
  description: string
  amount: number
  semester?: string
}

export interface PaymentRecord {
  id: string
  date: string
  amount: number
  method: string
  reference: string
}

export const useTuitionReceiptStore = defineStore('tuitionReceipt', () => {
  // 学校信息
  const school = ref({
    name: 'University of Oxford',
    nameCn: '牛津大学',
    logo: '',
    address: 'University Offices, Wellington Square, Oxford OX1 2JD, UK',
    phone: '+44 1865 270000',
    email: 'finance@ox.ac.uk',
    website: 'www.ox.ac.uk',
    taxId: 'GB123456789'
  })

  // 学生信息
  const student = ref({
    id: '2024001234',
    name: 'John Smith',
    nameCn: '张三',
    programme: 'Bachelor of Computer Science',
    programmeCn: '计算机科学学士',
    faculty: 'Faculty of Engineering',
    facultyCn: '工程学院',
    yearLevel: '2',
    email: 'john.smith@student.ox.ac.uk',
    phone: '+44 7123 456789',
    photo: ''
  })

  // 收据信息
  const receipt = ref({
    number: 'TR-2026-001234',
    issueDate: new Date().toISOString().split('T')[0],
    academicYear: '2025-2026',
    semester: 'Spring',
    dueDate: '2026-02-01',
    status: 'paid' as 'paid' | 'pending' | 'overdue' | 'partial'
  })

  // 费用项目
  const feeItems = ref<FeeItem[]>([
    { id: '1', category: 'Tuition Fee', description: 'Undergraduate Tuition Fee - Spring 2026', amount: 15000, semester: 'Spring' },
    { id: '2', category: 'Registration Fee', description: 'Annual Registration Fee', amount: 500 },
    { id: '3', category: 'Technology Fee', description: 'IT Services & Lab Access', amount: 800 },
    { id: '4', category: 'Library Fee', description: 'Library Resources Access', amount: 200 },
    { id: '5', category: 'Student Activity Fee', description: 'Student Union & Activities', amount: 350 }
  ])

  // 支付记录
  const payments = ref<PaymentRecord[]>([
    { id: '1', date: '2026-01-02', amount: 16850, method: 'Bank Transfer', reference: 'BT-2026-78901' }
  ])

  // 折扣和奖学金
  const discounts = ref({
    scholarship: 0,
    scholarshipName: '',
    earlyPayment: 0,
    other: 0,
    otherDescription: ''
  })

  // 设置
  const settings = ref({
    template: 'modern',
    primaryColor: '#003d82',
    secondaryColor: '#d4af37',
    currency: 'GBP',
    currencySymbol: '£',
    language: 'en',
    showLogo: true,
    showQR: true,
    showBarcode: true,
    showPaymentHistory: true,
    showScholarship: true,
    // 二维码设置
    qrSource: 'generate' as 'generate' | 'upload',
    qrImage: '',
    qrContent: '',
    // 条形码设置
    barcodeSource: 'generate' as 'generate' | 'upload',
    barcodeImage: '',
    barcodeContent: ''
  })

  // 设计设置
  const designSettings = ref({
    watermarkEnabled: false,
    watermarkText: 'OFFICIAL',
    watermarkOpacity: 10,
    watermarkColor: '#003d82',
    watermarkType: 'center' as 'center' | 'fullscreen',
    borderEnabled: true,
    borderColor: '#003d82',
    borderWidth: 2,
    fontFamily: 'Arial, sans-serif',
    stampEnabled: true,
    stampType: 'official', // 'official' | 'financial' | 'custom'
    stampText: 'RECEIVED',
    stampColor: '#dc2626',
    stampRotation: -15,
    stampSource: 'generate' as 'generate' | 'upload',
    stampImage: '',
    // 页脚文字
    footerNoticeEn: 'This is an official tuition receipt issued by',
    footerNoticeCn: '本收据为官方出具的学费收据。',
    footerTaxLabel: 'Tax ID'
  })

  // 支付界面状态
  const paymentUI = ref({
    showPaymentModal: false,
    showSuccessModal: false,
    selectedPaymentMethod: 'bank_transfer',
    paymentAmount: 0,
    paymentReference: ''
  })

  // 语言翻译
  const translations = ref({
    en: {
      title: 'TUITION RECEIPT',
      subtitle: '',
      receiptNo: 'Receipt No',
      issueDate: 'Issue Date',
      academicYear: 'Academic Year',
      studentInfo: 'Student Information',
      studentId: 'Student ID',
      name: 'Name',
      programme: 'Programme',
      faculty: 'Faculty',
      yearLevel: 'Year Level',
      semester: 'Semester',
      feeDetails: 'Fee Details',
      category: 'Category',
      description: 'Description',
      amount: 'Amount',
      subtotal: 'Subtotal',
      scholarship: 'Scholarship',
      discount: 'Discount',
      totalDue: 'Total Due',
      paymentHistory: 'Payment History',
      date: 'Date',
      method: 'Method',
      reference: 'Reference',
      totalPaid: 'Total Paid',
      balance: 'Balance',
      status: 'Status',
      statusPaid: 'PAID ✓',
      statusPending: 'PENDING',
      statusOverdue: 'OVERDUE',
      statusPartial: 'PARTIAL'
    },
    zh: {
      title: '学费收据',
      subtitle: '',
      receiptNo: '收据编号',
      issueDate: '开具日期',
      academicYear: '学年',
      studentInfo: '学生信息',
      studentId: '学号',
      name: '姓名',
      programme: '专业',
      faculty: '学院',
      yearLevel: '年级',
      semester: '学期',
      feeDetails: '费用明细',
      category: '类别',
      description: '描述',
      amount: '金额',
      subtotal: '小计',
      scholarship: '奖学金',
      discount: '折扣',
      totalDue: '应付总额',
      paymentHistory: '支付记录',
      date: '日期',
      method: '方式',
      reference: '参考号',
      totalPaid: '已付金额',
      balance: '余额',
      status: '状态',
      statusPaid: '已支付 ✓',
      statusPending: '待支付',
      statusOverdue: '已逾期',
      statusPartial: '部分支付'
    }
  })

  // 计算属性
  const subtotal = computed(() => {
    return feeItems.value.reduce((sum, item) => sum + item.amount, 0)
  })

  const totalDiscounts = computed(() => {
    return discounts.value.scholarship + discounts.value.earlyPayment + discounts.value.other
  })

  const totalDue = computed(() => {
    return subtotal.value - totalDiscounts.value
  })

  const totalPaid = computed(() => {
    return payments.value.reduce((sum, p) => sum + p.amount, 0)
  })

  const balance = computed(() => {
    return totalDue.value - totalPaid.value
  })

  const formatCurrency = (amount: number) => {
    return `${settings.value.currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // 操作方法
  const addFeeItem = () => {
    feeItems.value.push({
      id: Date.now().toString(),
      category: 'Other Fee',
      description: '',
      amount: 0
    })
  }

  const removeFeeItem = (id: string) => {
    const index = feeItems.value.findIndex(item => item.id === id)
    if (index > -1) feeItems.value.splice(index, 1)
  }

  const addPayment = () => {
    payments.value.push({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      method: 'Bank Transfer',
      reference: ''
    })
  }

  const removePayment = (id: string) => {
    const index = payments.value.findIndex(p => p.id === id)
    if (index > -1) payments.value.splice(index, 1)
  }

  const generateReceiptNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 900000) + 100000
    receipt.value.number = `TR-${year}-${random}`
  }

  const reset = () => {
    school.value = {
      name: 'University of Oxford',
      nameCn: '牛津大学',
      logo: '',
      address: 'University Offices, Wellington Square, Oxford OX1 2JD, UK',
      phone: '+44 1865 270000',
      email: 'finance@ox.ac.uk',
      website: 'www.ox.ac.uk',
      taxId: 'GB123456789'
    }
    student.value = {
      id: '2024001234',
      name: 'John Smith',
      nameCn: '张三',
      programme: 'Bachelor of Computer Science',
      programmeCn: '计算机科学学士',
      faculty: 'Faculty of Engineering',
      facultyCn: '工程学院',
      yearLevel: '2',
      email: 'john.smith@student.ox.ac.uk',
      phone: '+44 7123 456789'
    }
    generateReceiptNumber()
  }

  const openPaymentModal = () => {
    paymentUI.value.showPaymentModal = true
    paymentUI.value.paymentAmount = balance.value
  }

  const processPayment = () => {
    addPayment()
    const lastPayment = payments.value[payments.value.length - 1]
    lastPayment.amount = paymentUI.value.paymentAmount
    lastPayment.method = paymentUI.value.selectedPaymentMethod
    lastPayment.reference = paymentUI.value.paymentReference || `PAY-${Date.now()}`
    
    paymentUI.value.showPaymentModal = false
    paymentUI.value.showSuccessModal = true
  }

  const t = (key: string) => {
    const lang = settings.value.language as 'en' | 'zh'
    return translations.value[lang][key] || key
  }

  return {
    school,
    student,
    receipt,
    feeItems,
    payments,
    discounts,
    settings,
    designSettings,
    paymentUI,
    translations,
    subtotal,
    totalDiscounts,
    totalDue,
    totalPaid,
    balance,
    formatCurrency,
    addFeeItem,
    removeFeeItem,
    addPayment,
    removePayment,
    generateReceiptNumber,
    openPaymentModal,
    processPayment,
    t,
    reset
  }
})
