// AI 辅助填写工具
import type { BankTransaction } from '@/stores/bank'

// AI生成配置接口
export interface AIGenerateConfig {
  type: string
  keywords?: string
  dateRange?: {
    start: string
    end: string
  }
  count?: number
  customPrompt?: string
}

// 生成随机金额
export const generateRandomAmount = (min: number, max: number, isExpense: boolean = true): number => {
  const amount = Math.random() * (max - min) + min
  return Number((isExpense ? -amount : amount).toFixed(2))
}

// 生成随机日期
export const generateRandomDate = (year: number, month: number): string => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const day = Math.floor(Math.random() * daysInMonth) + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// 生成随机时间
export const generateRandomTime = (): string => {
  const hours = Math.floor(Math.random() * 24)
  const minutes = Math.floor(Math.random() * 60)
  const seconds = Math.floor(Math.random() * 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 商户分类配置
export const merchantCategories = {
  shopping: {
    name: '购物',
    merchants: ['Amazon.com', 'Apple Store', 'Best Buy', 'Walmart', 'Target', 'Costco', 'IKEA', '淘宝', '京东', '拼多多', 'eBay'],
    amountRange: [20, 2000]
  },
  food: {
    name: '餐饮',
    merchants: ['Starbucks', 'McDonald\'s', 'KFC', 'Subway', 'Pizza Hut', '海底捞', '外婆家', '星巴克', '美团外卖', '饿了么'],
    amountRange: [10, 200]
  },
  transportation: {
    name: '交通',
    merchants: ['Uber', 'Lyft', 'DiDi', '滴滴出行', 'Shell Gas', 'BP Gas', '中石化', '中石油', '高铁', '地铁'],
    amountRange: [5, 500]
  },
  entertainment: {
    name: '娱乐',
    merchants: ['Netflix', 'Spotify', 'Disney+', 'Apple Music', 'YouTube Premium', '爱奇艺', '腾讯视频', '优酷'],
    amountRange: [10, 100]
  },
  utilities: {
    name: '水电费',
    merchants: ['Electric Company', 'Water Services', 'Gas Company', '国家电网', '自来水公司', '燃气公司'],
    amountRange: [50, 500]
  },
  healthcare: {
    name: '医疗',
    merchants: ['CVS Pharmacy', 'Walgreens', 'Hospital', '医院', '药店', '诊所'],
    amountRange: [20, 1000]
  },
  education: {
    name: '教育',
    merchants: ['University', 'College', 'Online Course', 'Coursera', 'Udemy', '培训机构'],
    amountRange: [100, 5000]
  },
  income: {
    name: '收入',
    merchants: ['Salary Deposit', 'Freelance Payment', 'Investment Return', '工资', '兼职收入', '投资收益'],
    amountRange: [1000, 50000],
    isIncome: true
  },
  transfer: {
    name: '转账',
    merchants: ['Bank Transfer', 'Wire Transfer', '转账', '汇款'],
    amountRange: [100, 10000]
  }
}

// 根据关键词生成银行对账单数据
export const generateBankStatementData = (config: AIGenerateConfig): BankTransaction[] => {
  const transactions: BankTransaction[] = []
  const { keywords = '', dateRange, count = 20 } = config
  
  // 解析日期范围
  let year = new Date().getFullYear()
  let month = new Date().getMonth() + 1
  
  if (dateRange?.start) {
    const startDate = new Date(dateRange.start)
    year = startDate.getFullYear()
    month = startDate.getMonth() + 1
  } else if (keywords) {
    // 从关键词中提取月份信息
    const monthMatch = keywords.match(/(\d{1,2})月/)
    if (monthMatch && monthMatch[1]) {
      month = parseInt(monthMatch[1])
    }
    const yearMatch = keywords.match(/(\d{4})年?/)
    if (yearMatch && yearMatch[1]) {
      year = parseInt(yearMatch[1])
    }
  }
  
  // 根据关键词确定主要分类
  let selectedCategories: string[] = Object.keys(merchantCategories)
  const keywordsLower = keywords.toLowerCase()
  
  if (keywordsLower.includes('购物') || keywordsLower.includes('shopping')) {
    selectedCategories = ['shopping', 'income']
  } else if (keywordsLower.includes('餐饮') || keywordsLower.includes('food')) {
    selectedCategories = ['food', 'income']
  } else if (keywordsLower.includes('日常') || keywordsLower.includes('daily')) {
    selectedCategories = ['food', 'transportation', 'utilities', 'income']
  } else if (keywordsLower.includes('工资') || keywordsLower.includes('salary')) {
    selectedCategories = ['income', 'shopping', 'food']
  }
  
  // 生成交易记录
  for (let i = 0; i < count; i++) {
    const categoryKey = selectedCategories[Math.floor(Math.random() * selectedCategories.length)]
    const category = merchantCategories[categoryKey as keyof typeof merchantCategories]
    const merchant = category.merchants[Math.floor(Math.random() * category.merchants.length)] || 'Unknown'
    const isIncome = 'isIncome' in category && category.isIncome
    
    const amount = generateRandomAmount(
      category.amountRange[0] || 10,
      category.amountRange[1] || 1000,
      !isIncome
    )
    
    const transaction: BankTransaction = {
      id: `ai_${Date.now()}_${i}`,
      date: generateRandomDate(year, month),
      time: generateRandomTime(),
      merchant,
      category: category.name,
      amount,
      currency: 'USD',
      status: 'completed',
      location: isIncome ? 'Wire Transfer' : 'Online',
      paymentMethod: 'Visa ****1234',
      transactionType: isIncome ? 'credit' : 'debit',
      channel: isIncome ? 'wire' : 'online',
      referenceNumber: `TXN${year}${String(month).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`,
      cardNumber: '1234'
    }
    
    transactions.push(transaction)
  }
  
  // 按日期排序
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// 生成发票数据
export const generateInvoiceData = (keywords: string = '') => {
  const now = new Date()
  const invoiceNumber = `INV-${now.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
  
  const items = [
    { description: '专业服务费', quantity: 1, unitPrice: 5000 },
    { description: '技术咨询费', quantity: 2, unitPrice: 2000 },
    { description: '软件授权费', quantity: 1, unitPrice: 3000 },
  ]
  
  return {
    invoiceNumber,
    issueDate: now.toISOString().split('T')[0],
    dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items,
    subtotal: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    taxRate: 0.13,
    notes: '感谢您的惠顾！'
  }
}

// 生成工资单数据
export const generatePayslipData = (keywords: string = '') => {
  const now = new Date()
  let month = now.getMonth() + 1
  let year = now.getFullYear()
  
  // 从关键词提取月份
  const monthMatch = keywords.match(/(\d{1,2})月/)
  if (monthMatch) {
    month = parseInt(monthMatch[1])
  }
  const yearMatch = keywords.match(/(\d{4})年?/)
  if (yearMatch) {
    year = parseInt(yearMatch[1])
  }
  
  const baseSalary = 15000 + Math.floor(Math.random() * 10000)
  const bonus = Math.floor(Math.random() * 3000)
  const allowance = 2000 + Math.floor(Math.random() * 1000)
  
  const socialInsurance = Math.floor(baseSalary * 0.105)
  const housingFund = Math.floor(baseSalary * 0.12)
  const tax = Math.floor((baseSalary + bonus + allowance - socialInsurance - housingFund - 5000) * 0.1)
  
  return {
    employeeName: '张三',
    employeeId: 'EMP' + String(Math.floor(Math.random() * 10000)).padStart(5, '0'),
    department: '技术部',
    position: '高级工程师',
    payPeriod: `${year}年${month}月`,
    payDate: new Date(year, month, 10).toISOString().split('T')[0],
    earnings: {
      baseSalary,
      bonus,
      allowance,
      overtime: Math.floor(Math.random() * 2000),
    },
    deductions: {
      socialInsurance,
      housingFund,
      tax,
    },
    netPay: baseSalary + bonus + allowance - socialInsurance - housingFund - tax
  }
}

// 生成税务表单数据
export const generateTaxFormData = (keywords: string = '') => {
  const now = new Date()
  const taxYear = now.getFullYear() - 1
  
  const annualIncome = 180000 + Math.floor(Math.random() * 120000)
  const deductions = Math.floor(annualIncome * 0.15)
  const taxableIncome = annualIncome - deductions
  const taxAmount = Math.floor(taxableIncome * 0.2)
  
  return {
    taxYear,
    filingDate: now.toISOString().split('T')[0],
    taxpayerName: '张三',
    taxpayerId: '110101199001011234',
    annualIncome,
    deductions,
    taxableIncome,
    taxAmount,
    refundAmount: Math.floor(Math.random() * 5000),
  }
}

// 生成医疗报告数据
export const generateMedicalReportData = (keywords: string = '') => {
  const now = new Date()
  
  return {
    patientName: '张三',
    patientId: 'P' + String(Math.floor(Math.random() * 100000)).padStart(6, '0'),
    dateOfBirth: '1990-01-01',
    examDate: now.toISOString().split('T')[0],
    reportDate: now.toISOString().split('T')[0],
    doctor: '李医生',
    department: '内科',
    examType: '常规体检',
    results: {
      bloodPressure: `${110 + Math.floor(Math.random() * 30)}/${70 + Math.floor(Math.random() * 20)} mmHg`,
      heartRate: `${60 + Math.floor(Math.random() * 30)} bpm`,
      temperature: `${36 + Math.random() * 1}.${Math.floor(Math.random() * 10)}°C`,
      weight: `${60 + Math.floor(Math.random() * 30)} kg`,
      height: `${160 + Math.floor(Math.random() * 30)} cm`,
    },
    conclusion: '各项指标正常，建议保持良好生活习惯。',
    recommendations: '定期复查，注意休息，均衡饮食。'
  }
}

// 生成简历数据
export const generateResumeData = (keywords: string = '') => {
  const skills = ['JavaScript', 'TypeScript', 'Vue.js', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker']
  const selectedSkills = skills.sort(() => Math.random() - 0.5).slice(0, 5 + Math.floor(Math.random() * 3))
  
  return {
    personalInfo: {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '138-0000-0000',
      location: '北京市',
      linkedin: 'linkedin.com/in/zhangsan',
      github: 'github.com/zhangsan'
    },
    summary: '具有5年以上全栈开发经验的软件工程师，专注于Web应用开发和云服务架构设计。',
    experience: [
      {
        company: 'ABC科技有限公司',
        position: '高级软件工程师',
        period: '2021-至今',
        description: '负责核心产品的技术架构设计和开发工作'
      },
      {
        company: 'XYZ互联网公司',
        position: '软件工程师',
        period: '2019-2021',
        description: '参与多个项目的前端和后端开发'
      }
    ],
    education: [
      {
        school: '清华大学',
        degree: '计算机科学与技术 硕士',
        period: '2017-2019'
      },
      {
        school: '北京大学',
        degree: '软件工程 学士',
        period: '2013-2017'
      }
    ],
    skills: selectedSkills,
    languages: ['中文（母语）', '英语（流利）']
  }
}

// 生成航班数据
export const generateFlightData = (keywords: string = '') => {
  const airlines = ['中国国航', '东方航空', '南方航空', '海南航空', '国泰航空', 'United Airlines', 'Delta', 'American Airlines']
  const airports = [
    { code: 'PEK', name: '北京首都国际机场', city: '北京' },
    { code: 'SHA', name: '上海虹桥国际机场', city: '上海' },
    { code: 'CAN', name: '广州白云国际机场', city: '广州' },
    { code: 'SZX', name: '深圳宝安国际机场', city: '深圳' },
    { code: 'HKG', name: '香港国际机场', city: '香港' },
    { code: 'LAX', name: '洛杉矶国际机场', city: '洛杉矶' },
    { code: 'JFK', name: '纽约肯尼迪国际机场', city: '纽约' }
  ]
  
  const departure = airports[Math.floor(Math.random() * airports.length)]
  let arrival = airports[Math.floor(Math.random() * airports.length)]
  while (arrival.code === departure.code) {
    arrival = airports[Math.floor(Math.random() * airports.length)]
  }
  
  const now = new Date()
  const departureDate = new Date(now.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
  
  return {
    airline: airlines[Math.floor(Math.random() * airlines.length)],
    flightNumber: `${['CA', 'MU', 'CZ', 'HU', 'UA', 'DL'][Math.floor(Math.random() * 6)]}${Math.floor(Math.random() * 9000) + 1000}`,
    departure: {
      airport: departure.name,
      code: departure.code,
      city: departure.city,
      date: departureDate.toISOString().split('T')[0],
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
    },
    arrival: {
      airport: arrival.name,
      code: arrival.code,
      city: arrival.city,
      date: departureDate.toISOString().split('T')[0],
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
    },
    passenger: {
      name: '张三',
      passportNumber: 'E12345678'
    },
    seat: `${Math.floor(Math.random() * 30) + 1}${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}`,
    class: ['经济舱', '商务舱', '头等舱'][Math.floor(Math.random() * 3)],
    price: 1000 + Math.floor(Math.random() * 5000),
    bookingRef: String(Math.random().toString(36).substring(2, 8)).toUpperCase()
  }
}

// 生成酒店数据
export const generateHotelData = (keywords: string = '') => {
  const hotels = [
    { name: '北京王府井希尔顿酒店', city: '北京', stars: 5 },
    { name: '上海浦东丽思卡尔顿酒店', city: '上海', stars: 5 },
    { name: '广州四季酒店', city: '广州', stars: 5 },
    { name: '深圳华侨城洲际酒店', city: '深圳', stars: 5 },
    { name: '杭州西湖国宾馆', city: '杭州', stars: 5 },
    { name: 'Marriott Hotel Los Angeles', city: 'Los Angeles', stars: 4 },
    { name: 'The Plaza New York', city: 'New York', stars: 5 }
  ]
  
  const hotel = hotels[Math.floor(Math.random() * hotels.length)]
  const now = new Date()
  const checkIn = new Date(now.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
  const nights = 1 + Math.floor(Math.random() * 5)
  const checkOut = new Date(checkIn.getTime() + nights * 24 * 60 * 60 * 1000)
  
  const roomTypes = ['标准间', '豪华间', '行政套房', '总统套房']
  const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)]
  const pricePerNight = 500 + Math.floor(Math.random() * 2000)
  
  return {
    hotelName: hotel.name,
    city: hotel.city,
    stars: hotel.stars,
    address: `${hotel.city}市中心商业区`,
    checkIn: checkIn.toISOString().split('T')[0],
    checkOut: checkOut.toISOString().split('T')[0],
    nights,
    roomType,
    roomNumber: String(Math.floor(Math.random() * 20) + 10) + String(Math.floor(Math.random() * 20) + 1).padStart(2, '0'),
    guest: {
      name: '张三',
      phone: '138-0000-0000',
      email: 'zhangsan@example.com'
    },
    pricePerNight,
    totalPrice: pricePerNight * nights,
    confirmationNumber: String(Math.random().toString(36).substring(2, 10)).toUpperCase(),
    amenities: ['免费WiFi', '健身房', '游泳池', '早餐'],
  }
}

// 根据数据库中的历史数据计算期初余额
export const calculateOpeningBalance = (
  currentPeriod: { year: number; month: number },
  historicalData: Array<{ period: string; closingBalance: number }>
): number => {
  // 计算上一个月
  let prevMonth = currentPeriod.month - 1
  let prevYear = currentPeriod.year
  if (prevMonth === 0) {
    prevMonth = 12
    prevYear -= 1
  }
  
  const prevPeriod = `${prevYear}-${String(prevMonth).padStart(2, '0')}`
  
  // 查找上个月的期末余额
  const prevData = historicalData.find(d => d.period === prevPeriod)
  
  if (prevData) {
    return prevData.closingBalance
  }
  
  // 如果没有找到上个月的数据，尝试找同一年的任何数据
  const sameYearData = historicalData.filter(d => d.period.startsWith(`${prevYear}-`))
  if (sameYearData.length > 0) {
    // 使用最近的数据
    const sorted = sameYearData.sort((a, b) => b.period.localeCompare(a.period))
    return sorted[0].closingBalance
  }
  
  // 如果当前是新年，查找去年12月的数据
  if (currentPeriod.month === 1) {
    const lastYearDec = `${currentPeriod.year - 1}-12`
    const lastYearData = historicalData.find(d => d.period === lastYearDec)
    if (lastYearData) {
      return lastYearData.closingBalance
    }
    
    // 查找去年的任何数据
    const prevYearData = historicalData.filter(d => d.period.startsWith(`${currentPeriod.year - 1}-`))
    if (prevYearData.length > 0) {
      const sorted = prevYearData.sort((a, b) => b.period.localeCompare(a.period))
      return sorted[0].closingBalance
    }
  }
  
  // 默认返回0
  return 0
}

// 保证数据连贯性 - 计算年初余额
export const calculateYearStartBalance = (
  year: number,
  historicalData: Array<{ period: string; closingBalance: number }>
): number => {
  // 查找上一年12月的期末余额
  const prevYearDec = `${year - 1}-12`
  const prevData = historicalData.find(d => d.period === prevYearDec)
  
  if (prevData) {
    return prevData.closingBalance
  }
  
  // 如果没有，查找上一年最后一条数据
  const prevYearData = historicalData.filter(d => d.period.startsWith(`${year - 1}-`))
  if (prevYearData.length > 0) {
    const sorted = prevYearData.sort((a, b) => b.period.localeCompare(a.period))
    return sorted[0].closingBalance
  }
  
  return 0
}

export default {
  generateBankStatementData,
  generateInvoiceData,
  generatePayslipData,
  generateTaxFormData,
  generateMedicalReportData,
  generateResumeData,
  generateFlightData,
  generateHotelData,
  calculateOpeningBalance,
  calculateYearStartBalance
}

// ============================================
// 智能数据分析和建议功能
// ============================================

// 分析交易模式
export interface TransactionPattern {
  topCategories: Array<{ category: string; amount: number; count: number }>
  avgDailySpending: number
  avgMonthlySpending: number
  largestExpense: { merchant: string; amount: number; date: string }
  incomeVsExpense: { income: number; expense: number; netSavings: number }
  spendingTrend: 'increasing' | 'decreasing' | 'stable'
  anomalies: Array<{ date: string; merchant: string; amount: number; reason: string }>
}

export const analyzeTransactions = (transactions: BankTransaction[]): TransactionPattern => {
  if (!transactions || transactions.length === 0) {
    return {
      topCategories: [],
      avgDailySpending: 0,
      avgMonthlySpending: 0,
      largestExpense: { merchant: '', amount: 0, date: '' },
      incomeVsExpense: { income: 0, expense: 0, netSavings: 0 },
      spendingTrend: 'stable',
      anomalies: []
    }
  }

  // 按分类统计
  const categoryStats: Record<string, { amount: number; count: number }> = {}
  let totalIncome = 0
  let totalExpense = 0
  let largestExpense = { merchant: '', amount: 0, date: '' }
  
  transactions.forEach(t => {
    if (t.amount > 0) {
      totalIncome += t.amount
    } else {
      totalExpense += Math.abs(t.amount)
      if (Math.abs(t.amount) > largestExpense.amount) {
        largestExpense = { merchant: t.merchant, amount: Math.abs(t.amount), date: t.date }
      }
    }
    
    if (!categoryStats[t.category]) {
      categoryStats[t.category] = { amount: 0, count: 0 }
    }
    categoryStats[t.category].amount += Math.abs(t.amount)
    categoryStats[t.category].count++
  })

  // 排序获取 top 分类
  const topCategories = Object.entries(categoryStats)
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // 计算日均和月均支出
  const dates = [...new Set(transactions.map(t => t.date))].sort()
  const dayCount = dates.length || 1
  const monthCount = Math.ceil(dayCount / 30) || 1

  // 异常检测（支出超过平均值3倍）
  const avgExpense = totalExpense / transactions.filter(t => t.amount < 0).length || 0
  const anomalies = transactions
    .filter(t => t.amount < 0 && Math.abs(t.amount) > avgExpense * 3)
    .map(t => ({
      date: t.date,
      merchant: t.merchant,
      amount: Math.abs(t.amount),
      reason: '支出金额异常偏高'
    }))

  return {
    topCategories,
    avgDailySpending: totalExpense / dayCount,
    avgMonthlySpending: totalExpense / monthCount,
    largestExpense,
    incomeVsExpense: {
      income: totalIncome,
      expense: totalExpense,
      netSavings: totalIncome - totalExpense
    },
    spendingTrend: 'stable',
    anomalies
  }
}

// 智能关键词解析
export interface ParsedKeywords {
  dates: { year?: number; month?: number; startDate?: string; endDate?: string }
  amounts: { min?: number; max?: number }
  categories: string[]
  merchants: string[]
  personInfo: { name?: string; gender?: string; age?: number }
  locationInfo: { city?: string; country?: string; address?: string }
  transactionCount: number
  language: 'zh' | 'en'
  specialInstructions: string[]
}

export const parseKeywords = (keywords: string): ParsedKeywords => {
  const result: ParsedKeywords = {
    dates: {},
    amounts: {},
    categories: [],
    merchants: [],
    personInfo: {},
    locationInfo: {},
    transactionCount: 20,
    language: /[\u4e00-\u9fa5]/.test(keywords) ? 'zh' : 'en',
    specialInstructions: []
  }

  // 解析年份
  const yearMatch = keywords.match(/(\d{4})年?/)
  if (yearMatch) {
    result.dates.year = parseInt(yearMatch[1])
  }

  // 解析月份
  const monthMatch = keywords.match(/(\d{1,2})月/)
  if (monthMatch) {
    result.dates.month = parseInt(monthMatch[1])
  }

  // 解析日期范围
  const dateRangeMatch = keywords.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s*[到至-]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/)
  if (dateRangeMatch) {
    result.dates.startDate = dateRangeMatch[1].replace(/\//g, '-')
    result.dates.endDate = dateRangeMatch[2].replace(/\//g, '-')
  }

  // 解析金额范围
  const amountMatch = keywords.match(/(\d+)\s*[到至-]\s*(\d+)\s*[元块美]?/)
  if (amountMatch) {
    result.amounts.min = parseInt(amountMatch[1])
    result.amounts.max = parseInt(amountMatch[2])
  }

  // 解析数量
  const countMatch = keywords.match(/(\d+)\s*[条笔个]/)
  if (countMatch) {
    result.transactionCount = parseInt(countMatch[1])
  }

  // 解析分类关键词
  const categoryKeywords: Record<string, string[]> = {
    shopping: ['购物', '网购', '买东西', 'shopping', '消费'],
    food: ['餐饮', '吃饭', '外卖', '餐厅', 'food', 'restaurant'],
    transportation: ['交通', '出行', '打车', '加油', 'transportation'],
    entertainment: ['娱乐', '电影', '游戏', 'entertainment'],
    utilities: ['水电', '缴费', '账单', 'utilities'],
    income: ['工资', '收入', '奖金', 'salary', 'income']
  }

  for (const [category, kws] of Object.entries(categoryKeywords)) {
    if (kws.some(kw => keywords.toLowerCase().includes(kw))) {
      result.categories.push(category)
    }
  }

  // 解析姓名
  const nameMatch = keywords.match(/(?:姓名|叫|名字)[：:是为]?\s*([^\s,，。]+)/)
  if (nameMatch) {
    result.personInfo.name = nameMatch[1]
  }

  // 解析城市
  const cityMatch = keywords.match(/(?:城市|地点|位置)[：:是为]?\s*([^\s,，。]+)/)
  if (cityMatch) {
    result.locationInfo.city = cityMatch[1]
  }

  // 特殊指令
  if (keywords.includes('真实') || keywords.includes('realistic')) {
    result.specialInstructions.push('realistic')
  }
  if (keywords.includes('高端') || keywords.includes('luxury')) {
    result.specialInstructions.push('luxury')
  }
  if (keywords.includes('节省') || keywords.includes('省钱') || keywords.includes('frugal')) {
    result.specialInstructions.push('frugal')
  }

  return result
}

// 智能建议生成器
export const generateSmartSuggestions = (context: {
  documentType: string
  currentData?: any
  userPreferences?: string[]
}): string[] => {
  const suggestions: string[] = []
  const { documentType, currentData } = context

  switch (documentType) {
    case 'bank_statement':
      suggestions.push(
        '生成日常消费记录（餐饮+交通+购物）',
        '生成月度工资入账记录',
        '生成高端消费场景（奢侈品+高档餐厅）',
        '生成学生消费模式（小额+高频）',
        '生成商务差旅报销记录'
      )
      break
    case 'invoice':
      suggestions.push(
        '生成办公用品采购发票',
        '生成软件服务订阅发票',
        '生成培训服务费发票',
        '生成咨询服务费发票',
        '生成设备采购发票'
      )
      break
    case 'flight':
      suggestions.push(
        '北京-上海 商务舱',
        '上海-深圳 经济舱',
        '北京-纽约 国际航班',
        '广州-成都 公务出行',
        '香港-东京 旅游行程'
      )
      break
    case 'hotel':
      suggestions.push(
        '五星级商务酒店预订',
        '经济型连锁酒店',
        '度假村套房预订',
        '民宿短租预订',
        '长住公寓月租'
      )
      break
    case 'resume':
      suggestions.push(
        '互联网产品经理简历',
        '软件工程师简历',
        '金融分析师简历',
        '市场营销经理简历',
        '人力资源专员简历'
      )
      break
    default:
      suggestions.push(
        '使用默认模板快速生成',
        '自定义关键词生成',
        '导入已有数据'
      )
  }

  return suggestions
}

// 数据质量检查
export interface DataQualityReport {
  score: number // 0-100
  issues: Array<{ field: string; issue: string; severity: 'high' | 'medium' | 'low' }>
  suggestions: string[]
}

export const checkDataQuality = (data: any, documentType: string): DataQualityReport => {
  const issues: DataQualityReport['issues'] = []
  const suggestions: string[] = []
  let score = 100

  // 通用检查
  if (!data || Object.keys(data).length === 0) {
    return {
      score: 0,
      issues: [{ field: 'data', issue: '数据为空', severity: 'high' }],
      suggestions: ['请填写必要的数据字段']
    }
  }

  // 根据文档类型进行特定检查
  switch (documentType) {
    case 'bank_statement':
      if (!data.cardInfo?.cardNumber) {
        issues.push({ field: 'cardNumber', issue: '缺少卡号', severity: 'high' })
        score -= 20
      }
      if (!data.cardInfo?.cardHolder) {
        issues.push({ field: 'cardHolder', issue: '缺少持卡人姓名', severity: 'high' })
        score -= 15
      }
      if (!data.transactions || data.transactions.length === 0) {
        issues.push({ field: 'transactions', issue: '没有交易记录', severity: 'medium' })
        score -= 10
        suggestions.push('建议添加一些交易记录使对账单更真实')
      }
      break
      
    case 'invoice':
      if (!data.invoiceNumber) {
        issues.push({ field: 'invoiceNumber', issue: '缺少发票号码', severity: 'high' })
        score -= 20
      }
      if (!data.items || data.items.length === 0) {
        issues.push({ field: 'items', issue: '没有发票项目', severity: 'high' })
        score -= 20
      }
      break
      
    case 'flight':
      if (!data.passengerName) {
        issues.push({ field: 'passengerName', issue: '缺少乘客姓名', severity: 'high' })
        score -= 20
      }
      if (!data.flightNumber) {
        issues.push({ field: 'flightNumber', issue: '缺少航班号', severity: 'high' })
        score -= 15
      }
      break
  }

  // 通用建议
  if (score < 60) {
    suggestions.push('数据完整性较低，建议补充关键字段')
  }
  if (score >= 60 && score < 80) {
    suggestions.push('数据基本完整，可以考虑添加更多细节')
  }
  if (score >= 80) {
    suggestions.push('数据质量良好，可以导出使用')
  }

  return { score: Math.max(0, score), issues, suggestions }
}
