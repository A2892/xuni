/**
 * 随机生成工具函数
 */

/**
 * 生成随机整数
 * @param min 最小值 (包含)
 * @param max 最大值 (包含)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成随机浮点数
 * @param min 最小值
 * @param max 最大值
 * @param decimals 小数位数
 */
export function randomFloat(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * 生成随机布尔值
 */
export function randomBool(): boolean {
  return Math.random() < 0.5
}

/**
 * 根据概率返回布尔值
 * @param probability 概率 (0-1)
 */
export function randomProbability(probability: number): boolean {
  return Math.random() < probability
}

/**
 * 从数组中随机选择一个元素
 */
export function randomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[randomInt(0, array.length - 1)]
}

/**
 * 从数组中随机选择多个元素
 */
export function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffle([...array])
  return shuffled.slice(0, Math.min(count, array.length))
}

/**
 * 数组洗牌 (Fisher-Yates)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 生成随机字符串
 * @param length 长度
 * @param charset 字符集
 */
export function randomString(
  length: number,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * 生成随机字母字符串
 */
export function randomLetters(length: number, uppercase: boolean = false): string {
  const charset = uppercase
    ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    : 'abcdefghijklmnopqrstuvwxyz'
  return randomString(length, charset)
}

/**
 * 生成随机数字字符串
 */
export function randomDigits(length: number): string {
  return randomString(length, '0123456789')
}

/**
 * 生成随机十六进制字符串
 */
export function randomHex(length: number): string {
  return randomString(length, '0123456789abcdef')
}

/**
 * 生成 UUID v4
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成短 ID
 */
export function shortId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const timestamp = Date.now().toString(36)
  const randomPart = randomString(Math.max(0, length - timestamp.length), chars)
  return (timestamp + randomPart).slice(-length)
}

/**
 * 生成 NanoID 风格的 ID
 */
export function nanoId(length: number = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
  return randomString(length, chars)
}

/**
 * 生成随机颜色 (HEX)
 */
export function randomColor(): string {
  return '#' + randomHex(6)
}

/**
 * 生成随机 RGB 颜色
 */
export function randomRgb(): { r: number; g: number; b: number } {
  return {
    r: randomInt(0, 255),
    g: randomInt(0, 255),
    b: randomInt(0, 255)
  }
}

/**
 * 生成随机 HSL 颜色
 */
export function randomHsl(): { h: number; s: number; l: number } {
  return {
    h: randomInt(0, 360),
    s: randomInt(30, 100),
    l: randomInt(30, 70)
  }
}

/**
 * 生成好看的随机颜色 (柔和色)
 */
export function randomPrettyColor(): string {
  const hsl = randomHsl()
  const h = hsl.h
  const s = randomInt(50, 80) // 中等饱和度
  const l = randomInt(45, 65) // 中等亮度
  return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * 生成随机日期
 * @param start 开始日期
 * @param end 结束日期
 */
export function randomDate(start: Date = new Date(2000, 0, 1), end: Date = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/**
 * 生成随机时间戳
 */
export function randomTimestamp(start?: number, end?: number): number {
  const s = start ?? Date.now() - 365 * 24 * 60 * 60 * 1000
  const e = end ?? Date.now()
  return randomInt(s, e)
}

/**
 * 生成随机 IP 地址
 */
export function randomIp(): string {
  return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`
}

/**
 * 生成随机 MAC 地址
 */
export function randomMac(): string {
  const parts: string[] = []
  for (let i = 0; i < 6; i++) {
    parts.push(randomInt(0, 255).toString(16).padStart(2, '0'))
  }
  return parts.join(':').toUpperCase()
}

/**
 * 生成随机邮箱
 */
export function randomEmail(domain?: string): string {
  const domains = domain ? [domain] : ['gmail.com', 'qq.com', '163.com', 'outlook.com']
  const user = randomLetters(randomInt(5, 10))
  const selectedDomain = randomItem(domains)
  return `${user}@${selectedDomain}`
}

/**
 * 生成随机手机号 (中国)
 */
export function randomPhone(): string {
  const prefixes = ['130', '131', '132', '133', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '166', '175', '176', '177', '178', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '198', '199']
  const prefix = randomItem(prefixes)
  return prefix + randomDigits(8)
}

/**
 * 生成随机中文名
 */
export function randomChineseName(): string {
  const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗', '郑', '梁', '谢', '宋', '唐']
  const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋', '艳', '勇', '军', '杰', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '华', '梅', '鹏']
  
  const surname = randomItem(surnames) || '张'
  const nameLength = randomBool() ? 1 : 2
  let name = ''
  for (let i = 0; i < nameLength; i++) {
    name += randomItem(names) || '伟'
  }
  
  return surname + name
}

/**
 * 生成随机英文名
 */
export function randomEnglishName(): string {
  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
  
  return `${randomItem(firstNames)} ${randomItem(lastNames)}`
}

/**
 * 生成随机地址 (简化)
 */
export function randomAddress(): string {
  const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '湖北省', '湖南省', '山东省', '河南省']
  const cities = ['市辖区', '深圳市', '广州市', '杭州市', '南京市', '成都市', '武汉市', '长沙市', '青岛市', '郑州市']
  const districts = ['朝阳区', '海淀区', '浦东新区', '南山区', '江干区', '玄武区', '武侯区', '洪山区', '岳麓区', '崂山区']
  const streets = ['中山路', '解放路', '人民路', '建设路', '文化路', '长安街', '南京路', '淮海路', '天河路', '北京路']
  
  return `${randomItem(provinces)}${randomItem(cities)}${randomItem(districts)}${randomItem(streets)}${randomInt(1, 999)}号`
}

/**
 * 生成随机 Lorem Ipsum 文本
 */
export function randomLorem(words: number = 50): string {
  const vocabulary = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ]
  
  const result: string[] = []
  for (let i = 0; i < words; i++) {
    result.push(randomItem(vocabulary) || 'lorem')
  }
  
  // 首字母大写
  result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1)
  
  return result.join(' ') + '.'
}

/**
 * 加权随机选择
 * @param items 选项
 * @param weights 权重
 */
export function weightedRandom<T>(items: T[], weights: number[]): T | undefined {
  if (items.length === 0 || items.length !== weights.length) return undefined
  
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return items[i]
    }
  }
  
  return items[items.length - 1]
}

/**
 * 高斯(正态)分布随机数
 */
export function randomGaussian(mean: number = 0, stdDev: number = 1): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return num * stdDev + mean
}

export default {
  randomInt,
  randomFloat,
  randomBool,
  randomProbability,
  randomItem,
  randomItems,
  shuffle,
  randomString,
  randomLetters,
  randomDigits,
  randomHex,
  uuid,
  shortId,
  nanoId,
  randomColor,
  randomRgb,
  randomHsl,
  randomPrettyColor,
  randomDate,
  randomTimestamp,
  randomIp,
  randomMac,
  randomEmail,
  randomPhone,
  randomChineseName,
  randomEnglishName,
  randomAddress,
  randomLorem,
  weightedRandom,
  randomGaussian
}
