/**
 * 批量生成工具
 * 支持批量生成各种类型的虚拟数据
 */

import { faker } from '@faker-js/faker/locale/zh_CN'

// 批量生成配置
export interface BatchGenerateConfig {
  count: number
  type: 'student' | 'bank' | 'invoice' | 'person' | 'company' | 'address' | 'transaction'
  locale?: 'zh_CN' | 'en' | 'ja'
  template?: Record<string, any>
}

// 生成随机中文姓名
export function generateChineseName(): string {
  const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '高', '罗', '郑', '梁', '谢', '宋', '唐', '许', '邓', '冯', '韩', '曹']
  const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '丹', '萍', '鑫', '亮', '宇', '峰', '浩', '晨', '阳', '思', '雨', '欣', '婷', '佳', '乐', '雪', '琳', '璐', '凯', '翔', '龙', '博', '泽', '俊', '文', '豪']
  
  const surname = surnames[Math.floor(Math.random() * surnames.length)]
  const nameLength = Math.random() > 0.3 ? 2 : 1
  let name = ''
  for (let i = 0; i < nameLength; i++) {
    name += names[Math.floor(Math.random() * names.length)]
  }
  return surname + name
}

// 生成随机英文姓名
export function generateEnglishName(): string {
  return faker.person.fullName()
}

// 生成随机手机号
export function generatePhone(locale: string = 'zh_CN'): string {
  if (locale === 'zh_CN') {
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '185', '186', '187', '188', '189']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
    return prefix + suffix
  }
  return faker.phone.number()
}

// 生成随机身份证号
export function generateIDCard(): string {
  const areaCodes = ['110000', '120000', '130000', '140000', '150000', '210000', '220000', '230000', '310000', '320000', '330000', '340000', '350000', '360000', '370000', '410000', '420000', '430000', '440000', '450000', '460000', '500000', '510000', '520000', '530000', '540000', '610000', '620000', '630000', '640000', '650000']
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)].slice(0, 6)
  
  // 生成生日 (1960-2005)
  const year = 1960 + Math.floor(Math.random() * 45)
  const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')
  const day = (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')
  
  const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  const base = areaCode + year + month + day + sequence
  
  // 计算校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(base[i]) * weights[i]
  }
  const checkCode = checkCodes[sum % 11]
  
  return base + checkCode
}

// 生成随机银行卡号
export function generateBankCard(type: 'visa' | 'mastercard' | 'unionpay' = 'unionpay'): string {
  let prefix = ''
  let length = 16
  
  switch (type) {
    case 'visa':
      prefix = '4'
      break
    case 'mastercard':
      prefix = '5' + Math.floor(Math.random() * 5 + 1)
      break
    case 'unionpay':
      prefix = '62'
      length = 19
      break
  }
  
  const remainingLength = length - prefix.length - 1
  let number = prefix
  for (let i = 0; i < remainingLength; i++) {
    number += Math.floor(Math.random() * 10)
  }
  
  // Luhn算法计算校验位
  let sum = 0
  let isEven = false
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i])
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }
  const checkDigit = (10 - (sum % 10)) % 10
  
  return number + checkDigit
}

// 生成随机邮箱
export function generateEmail(name?: string): string {
  const domains = ['gmail.com', 'qq.com', '163.com', 'outlook.com', 'yahoo.com', 'hotmail.com', '126.com', 'sina.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  const username = name ? name.toLowerCase().replace(/\s/g, '.') : faker.internet.userName()
  return `${username}@${domain}`
}

// 生成随机地址
export function generateAddress(locale: string = 'zh_CN'): string {
  if (locale === 'zh_CN') {
    const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '湖北省', '河南省', '山东省', '陕西省']
    const cities = ['朝阳区', '海淀区', '浦东新区', '天河区', '南京市', '杭州市', '成都市', '武汉市', '郑州市', '青岛市', '西安市']
    const streets = ['中山路', '解放路', '人民路', '建设路', '文化路', '科技大道', '创新街', '和平路', '胜利街', '幸福路']
    
    const province = provinces[Math.floor(Math.random() * provinces.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const street = streets[Math.floor(Math.random() * streets.length)]
    const number = Math.floor(Math.random() * 500) + 1
    const building = Math.floor(Math.random() * 30) + 1
    const room = Math.floor(Math.random() * 20) + 1
    
    return `${province}${city}${street}${number}号${building}栋${room}室`
  }
  return faker.location.streetAddress(true)
}

// 生成随机公司名
export function generateCompanyName(locale: string = 'zh_CN'): string {
  if (locale === 'zh_CN') {
    const prefixes = ['华', '中', '东', '西', '南', '北', '金', '银', '鑫', '恒', '盛', '隆', '瑞', '祥', '泰', '安', '信', '达', '通', '联']
    const middles = ['科', '创', '智', '云', '数', '新', '高', '远', '宏', '大', '和', '正', '长', '永', '万', '富', '利']
    const suffixes = ['科技', '网络', '信息', '电子', '软件', '数据', '智能', '通讯', '传媒', '商贸', '实业', '集团', '控股', '投资']
    const types = ['有限公司', '股份有限公司', '集团有限公司']
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const middle = middles[Math.floor(Math.random() * middles.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    
    return `${prefix}${middle}${suffix}${type}`
  }
  return faker.company.name()
}

// 生成随机金额
export function generateAmount(min: number = 10, max: number = 10000, decimals: number = 2): number {
  const amount = Math.random() * (max - min) + min
  return Number(amount.toFixed(decimals))
}

// 生成随机日期
export function generateDate(startYear: number = 2020, endYear: number = 2026): string {
  const start = new Date(startYear, 0, 1)
  const end = new Date(endYear, 11, 31)
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().slice(0, 10)
}

// 生成学生信息
export interface StudentData {
  name: string
  studentId: string
  gender: string
  birthDate: string
  idCard: string
  phone: string
  email: string
  address: string
  major: string
  grade: string
  class: string
  enrollmentDate: string
}

export function generateStudent(): StudentData {
  const gender = Math.random() > 0.5 ? '男' : '女'
  const name = generateChineseName()
  const majors = ['计算机科学与技术', '软件工程', '电子信息工程', '机械工程', '土木工程', '金融学', '会计学', '市场营销', '工商管理', '法学', '英语', '汉语言文学', '数学与应用数学', '物理学', '化学', '生物科学', '医学', '护理学', '建筑学', '艺术设计']
  
  return {
    name,
    studentId: '202' + Math.floor(Math.random() * 5) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0'),
    gender,
    birthDate: generateDate(1998, 2006),
    idCard: generateIDCard(),
    phone: generatePhone(),
    email: generateEmail(name),
    address: generateAddress(),
    major: majors[Math.floor(Math.random() * majors.length)],
    grade: '202' + Math.floor(Math.random() * 5) + '级',
    class: Math.floor(Math.random() * 10 + 1) + '班',
    enrollmentDate: generateDate(2020, 2024)
  }
}

// 生成交易记录
export interface TransactionData {
  id: string
  date: string
  time: string
  merchant: string
  category: string
  amount: number
  type: 'debit' | 'credit'
  status: string
  description: string
}

export function generateTransaction(): TransactionData {
  const merchants = ['星巴克', '麦当劳', '肯德基', '沃尔玛', '家乐福', '淘宝', '京东', '拼多多', '美团', '饿了么', '滴滴出行', '中国石化', '中国电信', '国家电网', 'Apple Store', '华为商城', '优衣库', '盒马鲜生', '瑞幸咖啡', '喜茶']
  const categories = ['餐饮', '购物', '交通', '娱乐', '生活缴费', '转账', '工资', '理财', '退款', '其他']
  const isCredit = Math.random() > 0.7
  
  return {
    id: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
    date: generateDate(2024, 2026),
    time: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    merchant: isCredit ? '工资转入' : merchants[Math.floor(Math.random() * merchants.length)],
    category: isCredit ? '收入' : categories[Math.floor(Math.random() * categories.length)],
    amount: isCredit ? generateAmount(3000, 30000) : generateAmount(5, 2000),
    type: isCredit ? 'credit' : 'debit',
    status: 'completed',
    description: isCredit ? '月薪发放' : '消费支出'
  }
}

// 批量生成数据
export function batchGenerate<T>(generator: () => T, count: number): T[] {
  const results: T[] = []
  for (let i = 0; i < count; i++) {
    results.push(generator())
  }
  return results
}

// 生成发票数据
export interface InvoiceData {
  invoiceNo: string
  invoiceCode: string
  date: string
  buyer: string
  buyerTaxId: string
  seller: string
  sellerTaxId: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    amount: number
    taxRate: string
    tax: number
  }>
  totalAmount: number
  totalTax: number
  grandTotal: number
}

export function generateInvoice(): InvoiceData {
  const itemNames = ['办公用品', '电脑设备', '打印服务', '软件服务', '咨询服务', '培训费用', '会议费用', '差旅费', '通讯费', '物流费用']
  const itemCount = Math.floor(Math.random() * 5) + 1
  
  const items = []
  let totalAmount = 0
  let totalTax = 0
  
  for (let i = 0; i < itemCount; i++) {
    const quantity = Math.floor(Math.random() * 10) + 1
    const unitPrice = generateAmount(100, 5000)
    const amount = quantity * unitPrice
    const taxRate = Math.random() > 0.5 ? '13%' : '6%'
    const tax = amount * (taxRate === '13%' ? 0.13 : 0.06)
    
    items.push({
      name: itemNames[Math.floor(Math.random() * itemNames.length)],
      quantity,
      unitPrice,
      amount,
      taxRate,
      tax
    })
    
    totalAmount += amount
    totalTax += tax
  }
  
  return {
    invoiceNo: Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
    invoiceCode: '0' + Math.floor(Math.random() * 10000000000).toString().padStart(11, '0'),
    date: generateDate(2024, 2026),
    buyer: generateCompanyName(),
    buyerTaxId: '91' + Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0'),
    seller: generateCompanyName(),
    sellerTaxId: '91' + Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0'),
    items,
    totalAmount,
    totalTax,
    grandTotal: totalAmount + totalTax
  }
}
