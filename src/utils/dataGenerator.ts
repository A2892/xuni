// 高级 AI 数据生成工具
// 提供多种数据生成能力

import type { BankTransaction } from '@/stores/bank'

// 随机数据生成器
export const RandomGenerator = {
  // 随机整数
  int(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  // 随机浮点数
  float(min: number, max: number, decimals: number = 2): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
  },

  // 随机选择
  pick<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  },

  // 随机选择多个
  pickMultiple<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  },

  // 加权随机选择
  weightedPick<T>(items: { value: T; weight: number }[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight
    for (const item of items) {
      random -= item.weight
      if (random <= 0) return item.value
    }
    return items[items.length - 1].value
  },

  // 随机布尔值
  boolean(probability: number = 0.5): boolean {
    return Math.random() < probability
  },

  // 随机日期
  date(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  },

  // 随机时间字符串
  time(): string {
    const hours = this.int(0, 23).toString().padStart(2, '0')
    const minutes = this.int(0, 59).toString().padStart(2, '0')
    const seconds = this.int(0, 59).toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }
}

// 中国姓名生成
export const ChineseNameGenerator = {
  surnames: ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '朱', '马', '胡', '郭', '林', '何', '高', '梁', '郑', '罗', '宋', '谢', '唐', '韩', '曹', '许', '邓', '萧', '冯', '曾', '程', '蔡', '彭', '潘', '袁', '董', '余', '苏', '叶', '吕', '魏', '蒋', '田', '杜', '丁', '沈', '姜', '范'],
  
  maleNames: ['伟', '强', '磊', '军', '勇', '杰', '涛', '明', '超', '华', '刚', '志', '斌', '鹏', '波', '亮', '辉', '峰', '健', '龙', '飞', '宇', '航', '博', '浩', '泽', '俊', '晨', '阳', '睿', '翔', '轩', '逸', '昊', '然', '鑫', '源', '锋', '建', '国'],
  
  femaleNames: ['芳', '娜', '秀英', '敏', '静', '丽', '艳', '霞', '秀兰', '桂英', '玉兰', '婷', '雪', '梅', '萍', '红', '玲', '燕', '彩', '春', '菊', '兰', '凤', '洁', '琳', '素', '云', '莲', '真', '环', '雅', '倩', '琪', '璐', '瑶', '欣', '蕾', '晨', '露', '莹'],

  generate(gender?: 'male' | 'female'): string {
    const surname = RandomGenerator.pick(this.surnames)
    const names = gender === 'female' ? this.femaleNames : 
                  gender === 'male' ? this.maleNames :
                  RandomGenerator.boolean() ? this.maleNames : this.femaleNames
    const name1 = RandomGenerator.pick(names)
    const name2 = RandomGenerator.boolean(0.6) ? RandomGenerator.pick(names) : ''
    return surname + name1 + name2
  }
}

// 英文姓名生成
export const EnglishNameGenerator = {
  firstNames: {
    male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle']
  },
  lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'],

  generate(gender?: 'male' | 'female'): string {
    const isMale = gender === 'male' || (gender !== 'female' && RandomGenerator.boolean())
    const firstName = RandomGenerator.pick(isMale ? this.firstNames.male : this.firstNames.female)
    const lastName = RandomGenerator.pick(this.lastNames)
    return `${firstName} ${lastName}`
  }
}

// 地址生成
export const AddressGenerator = {
  // 中国地址
  china: {
    provinces: ['北京市', '上海市', '广东省', '浙江省', '江苏省', '山东省', '河南省', '四川省', '湖北省', '湖南省', '福建省', '安徽省', '河北省', '陕西省', '辽宁省'],
    cities: {
      '北京市': ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '石景山区', '通州区', '大兴区'],
      '上海市': ['浦东新区', '黄浦区', '徐汇区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区'],
      '广东省': ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '东莞市', '中山市', '惠州市'],
      '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '台州市'],
      '江苏省': ['南京市', '苏州市', '无锡市', '常州市', '南通市', '扬州市', '徐州市', '镇江市']
    },
    roads: ['人民路', '中山路', '解放路', '建设路', '和平路', '文化路', '科技路', '创业路', '幸福路', '光明路', '长安街', '复兴路', '朝阳路', '望京街', '国贸路'],
    
    generate(): string {
      const province = RandomGenerator.pick(this.provinces)
      const cityList = this.cities[province] || ['市区']
      const city = RandomGenerator.pick(cityList)
      const road = RandomGenerator.pick(this.roads)
      const number = RandomGenerator.int(1, 999)
      const building = RandomGenerator.boolean(0.7) ? `${RandomGenerator.int(1, 50)}号楼` : ''
      const unit = RandomGenerator.boolean(0.5) ? `${RandomGenerator.int(1, 8)}单元` : ''
      const room = RandomGenerator.boolean(0.5) ? `${RandomGenerator.int(101, 2505)}室` : ''
      
      return `${province}${city}${road}${number}号${building}${unit}${room}`.trim()
    }
  },

  // 美国地址
  usa: {
    states: ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'],
    cities: {
      'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'],
      'NY': ['New York', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
      'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth']
    },
    streets: ['Main St', 'Oak Ave', 'Park Blvd', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Ave', 'Lincoln Blvd', 'Broadway'],
    
    generate(): string {
      const state = RandomGenerator.pick(this.states)
      const cityList = this.cities[state] || ['City']
      const city = RandomGenerator.pick(cityList)
      const street = RandomGenerator.pick(this.streets)
      const number = RandomGenerator.int(1, 9999)
      const zip = RandomGenerator.int(10000, 99999)
      
      return `${number} ${street}, ${city}, ${state} ${zip}`
    }
  }
}

// 银行交易生成
export const BankTransactionGenerator = {
  merchants: {
    'Shopping': ['Amazon.com', '淘宝', '京东商城', 'Apple Store', '苏宁易购', '天猫超市', '拼多多', 'Walmart', 'Target', 'Best Buy'],
    'Food & Dining': ['星巴克', '肯德基', '麦当劳', '海底捞', '西贝莜面村', '瑞幸咖啡', '美团外卖', '饿了么', 'Starbucks', "McDonald's"],
    'Transportation': ['滴滴出行', 'Uber', '高德打车', '中国石化', '中国石油', 'Shell', '高速过路费', '地铁充值', '公交卡充值'],
    'Entertainment': ['Netflix', '爱奇艺', '腾讯视频', 'Spotify', '优酷会员', 'Apple Music', '电影院', 'Steam', '网易云音乐'],
    'Utilities': ['国家电网', '自来水公司', '燃气费', '物业费', '中国移动', '中国联通', '中国电信', '宽带费'],
    'Income': ['工资收入', '奖金', '投资收益', '红包', '退款', '利息收入', '兼职收入', '稿费'],
    'Transfer': ['支付宝转账', '微信转账', '银行转账', '跨行转账']
  },

  generateTransaction(options: {
    date?: string
    category?: string
    minAmount?: number
    maxAmount?: number
    isIncome?: boolean
    cardNumber?: string
  } = {}): Omit<BankTransaction, 'id'> {
    const categories = Object.keys(this.merchants)
    const category = options.category || RandomGenerator.pick(categories)
    const merchantList = this.merchants[category] || this.merchants['Shopping']
    const merchant = RandomGenerator.pick(merchantList)

    const isIncome = options.isIncome ?? (category === 'Income')
    const baseMin = options.minAmount ?? (isIncome ? 100 : 5)
    const baseMax = options.maxAmount ?? (isIncome ? 20000 : 2000)
    const amount = RandomGenerator.float(baseMin, baseMax) * (isIncome ? 1 : -1)

    const transactionTypes: Array<'debit' | 'credit' | 'transfer'> = isIncome ? ['credit'] : ['debit', 'transfer']
    const channels: Array<'atm' | 'pos' | 'online' | 'mobile' | 'branch' | 'wire'> = ['online', 'mobile', 'pos']

    return {
      date: options.date || new Date().toISOString().split('T')[0],
      time: RandomGenerator.time(),
      merchant,
      category,
      amount: parseFloat(amount.toFixed(2)),
      currency: 'CNY',
      status: 'completed',
      location: isIncome ? '自动' : RandomGenerator.pick(['北京', '上海', '广州', '深圳', 'Online']),
      paymentMethod: 'Visa ****' + (options.cardNumber?.slice(-4) || '1234'),
      transactionType: RandomGenerator.pick(transactionTypes),
      channel: RandomGenerator.pick(channels),
      referenceNumber: `TXN${Date.now()}${RandomGenerator.int(1000, 9999)}`,
      cardNumber: options.cardNumber?.slice(-4) || '1234'
    }
  },

  generateMultiple(count: number, options: {
    startDate?: string
    endDate?: string
    cardNumber?: string
    includeIncome?: boolean
    incomeRatio?: number
  } = {}): Omit<BankTransaction, 'id'>[] {
    const transactions: Omit<BankTransaction, 'id'>[] = []
    const start = options.startDate ? new Date(options.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = options.endDate ? new Date(options.endDate) : new Date()

    for (let i = 0; i < count; i++) {
      const date = RandomGenerator.date(start, end)
      const isIncome = options.includeIncome && RandomGenerator.boolean(options.incomeRatio || 0.15)
      
      transactions.push(this.generateTransaction({
        date: date.toISOString().split('T')[0],
        cardNumber: options.cardNumber,
        isIncome
      }))
    }

    // 按日期排序
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}

// 电话号码生成
export const PhoneGenerator = {
  china(): string {
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '170', '176', '177', '178', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189']
    const prefix = RandomGenerator.pick(prefixes)
    const suffix = RandomGenerator.int(10000000, 99999999).toString()
    return prefix + suffix
  },

  usa(): string {
    const areaCode = RandomGenerator.int(200, 999).toString()
    const prefix = RandomGenerator.int(200, 999).toString()
    const line = RandomGenerator.int(1000, 9999).toString()
    return `+1 (${areaCode}) ${prefix}-${line}`
  }
}

// 邮箱生成
export const EmailGenerator = {
  domains: ['gmail.com', 'outlook.com', 'yahoo.com', 'qq.com', '163.com', '126.com', 'hotmail.com', 'icloud.com'],
  
  generate(name?: string): string {
    const baseName = name?.toLowerCase().replace(/\s+/g, '.') || 
                     ChineseNameGenerator.generate().toLowerCase() + RandomGenerator.int(10, 999)
    const domain = RandomGenerator.pick(this.domains)
    // 如果是中文名，生成拼音风格
    const sanitized = baseName.replace(/[^\w.]/g, '') || 'user' + RandomGenerator.int(1000, 9999)
    return `${sanitized}@${domain}`
  }
}

// 身份证号生成（仅用于测试，符合格式但非真实）
export const IDCardGenerator = {
  areaCodes: ['110101', '310101', '440103', '330102', '320102', '370102', '410102', '510104'],
  
  generate(): string {
    const areaCode = RandomGenerator.pick(this.areaCodes)
    const year = RandomGenerator.int(1960, 2005)
    const month = RandomGenerator.int(1, 12).toString().padStart(2, '0')
    const day = RandomGenerator.int(1, 28).toString().padStart(2, '0')
    const seq = RandomGenerator.int(100, 999).toString()
    const base = `${areaCode}${year}${month}${day}${seq}`
    
    // 计算校验位
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(base[i]) * weights[i]
    }
    const checkCode = checkCodes[sum % 11]
    
    return base + checkCode
  }
}

// 银行卡号生成（测试用，符合 Luhn 算法）
export const BankCardGenerator = {
  prefixes: {
    visa: ['4'],
    mastercard: ['51', '52', '53', '54', '55'],
    unionpay: ['62'],
    amex: ['34', '37']
  },

  generate(type: 'visa' | 'mastercard' | 'unionpay' | 'amex' = 'visa'): string {
    const prefix = RandomGenerator.pick(this.prefixes[type])
    const length = type === 'amex' ? 15 : 16
    let number = prefix
    
    // 生成随机数字
    while (number.length < length - 1) {
      number += RandomGenerator.int(0, 9).toString()
    }
    
    // 计算 Luhn 校验位
    let sum = 0
    let isEven = true
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
    
    return number + checkDigit.toString()
  },

  format(number: string): string {
    return number.replace(/(.{4})/g, '$1 ').trim()
  }
}

// 公司名生成
export const CompanyNameGenerator = {
  prefixes: ['华', '中', '东', '西', '南', '北', '新', '大', '国', '环', '盛', '恒', '信', '达', '科', '创', '智', '云', '天', '海'],
  middles: ['瑞', '祥', '泰', '和', '安', '康', '宏', '业', '兴', '盛', '源', '通', '达', '辉', '腾', '飞', '翔', '龙', '鹏', '益'],
  suffixes: ['科技', '信息', '网络', '电子', '软件', '互联网', '数据', '智能', '通信', '集团', '实业', '投资', '贸易', '商务', '咨询', '服务', '传媒', '文化', '教育', '医疗'],
  types: ['有限公司', '股份有限公司', '集团有限公司'],

  generate(): string {
    const prefix = RandomGenerator.pick(this.prefixes)
    const middle = RandomGenerator.pick(this.middles)
    const suffix = RandomGenerator.pick(this.suffixes)
    const type = RandomGenerator.pick(this.types)
    return `${prefix}${middle}${suffix}${type}`
  }
}

// 导出统一的生成器
export const DataGenerator = {
  random: RandomGenerator,
  chineseName: ChineseNameGenerator,
  englishName: EnglishNameGenerator,
  address: AddressGenerator,
  bankTransaction: BankTransactionGenerator,
  phone: PhoneGenerator,
  email: EmailGenerator,
  idCard: IDCardGenerator,
  bankCard: BankCardGenerator,
  company: CompanyNameGenerator
}

export default DataGenerator
