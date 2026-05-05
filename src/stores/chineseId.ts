import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ChineseIdData {
  // 基本信息
  name: string
  gender: 'male' | 'female'
  ethnicity: string
  birthDate: string
  address: string
  idNumber: string
  
  // 签发信息
  issuingAuthority: string
  issueDate: string
  expiryDate: string
  validPeriod: '10年' | '20年' | '长期'
  
  // 照片
  photo: string
  
  // 设计选项
  cardVersion: '2004' | '2022'  // 身份证版本
  showMRZ: boolean
}

export const ethnicityOptions = [
  '汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族', 
  '布依族', '朝鲜族', '满族', '侗族', '瑶族', '白族', '土家族', '哈尼族',
  '哈萨克族', '傣族', '黎族', '僳僳族', '佤族', '畲族', '高山族', '拉祜族',
  '水族', '东乡族', '纳西族', '景颇族', '柯尔克孜族', '土族', '达斡尔族',
  '仫佬族', '羌族', '布朗族', '撒拉族', '毛南族', '仡佬族', '锡伯族',
  '阿昌族', '普米族', '塔吉克族', '怒族', '乌孜别克族', '俄罗斯族',
  '鄂温克族', '德昂族', '保安族', '裕固族', '京族', '塔塔尔族',
  '独龙族', '鄂伦春族', '赫哲族', '门巴族', '珞巴族', '基诺族'
]

export const provinceOptions = [
  { code: '11', name: '北京市' },
  { code: '12', name: '天津市' },
  { code: '13', name: '河北省' },
  { code: '14', name: '山西省' },
  { code: '15', name: '内蒙古自治区' },
  { code: '21', name: '辽宁省' },
  { code: '22', name: '吉林省' },
  { code: '23', name: '黑龙江省' },
  { code: '31', name: '上海市' },
  { code: '32', name: '江苏省' },
  { code: '33', name: '浙江省' },
  { code: '34', name: '安徽省' },
  { code: '35', name: '福建省' },
  { code: '36', name: '江西省' },
  { code: '37', name: '山东省' },
  { code: '41', name: '河南省' },
  { code: '42', name: '湖北省' },
  { code: '43', name: '湖南省' },
  { code: '44', name: '广东省' },
  { code: '45', name: '广西壮族自治区' },
  { code: '46', name: '海南省' },
  { code: '50', name: '重庆市' },
  { code: '51', name: '四川省' },
  { code: '52', name: '贵州省' },
  { code: '53', name: '云南省' },
  { code: '54', name: '西藏自治区' },
  { code: '61', name: '陕西省' },
  { code: '62', name: '甘肃省' },
  { code: '63', name: '青海省' },
  { code: '64', name: '宁夏回族自治区' },
  { code: '65', name: '新疆维吾尔自治区' },
  { code: '71', name: '台湾省' },
  { code: '81', name: '香港特别行政区' },
  { code: '82', name: '澳门特别行政区' }
]

export const useChineseIdStore = defineStore('chineseId', () => {
  const data = ref<ChineseIdData>({
    name: '张三',
    gender: 'male',
    ethnicity: '汉族',
    birthDate: '1990-01-15',
    address: '北京市朝阳区建国路88号院1号楼101室',
    idNumber: '110105199001151234',
    
    issuingAuthority: '北京市公安局朝阳分局',
    issueDate: '2020-01-15',
    expiryDate: '2040-01-15',
    validPeriod: '20年',
    
    photo: '',
    
    cardVersion: '2004',
    showMRZ: false
  })

  // 验证身份证号码
  const validateIdNumber = (idNumber: string): boolean => {
    if (idNumber.length !== 18) return false
    
    // 加权因子
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    // 校验码对应值
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(idNumber[i]) * weights[i]
    }
    
    const checkCode = checkCodes[sum % 11]
    return idNumber[17].toUpperCase() === checkCode
  }

  // 从身份证号提取信息
  const extractInfoFromId = (idNumber: string) => {
    if (idNumber.length !== 18) return null
    
    const year = idNumber.substring(6, 10)
    const month = idNumber.substring(10, 12)
    const day = idNumber.substring(12, 14)
    const genderCode = parseInt(idNumber[16])
    
    return {
      birthDate: `${year}-${month}-${day}`,
      gender: genderCode % 2 === 1 ? 'male' : 'female' as 'male' | 'female',
      provinceCode: idNumber.substring(0, 2)
    }
  }

  // 生成身份证号码
  const generateIdNumber = (provinceCode: string, birthDate: string, gender: 'male' | 'female'): string => {
    const cityCode = provinceCode + '01'  // 默认市级代码
    const districtCode = cityCode + '05'  // 默认区级代码
    
    const datePart = birthDate.replace(/-/g, '')
    const sequenceBase = Math.floor(Math.random() * 999) + 1
    // 确保性别位正确（男性奇数，女性偶数）
    let sequence = sequenceBase
    if (gender === 'male' && sequence % 2 === 0) sequence++
    if (gender === 'female' && sequence % 2 === 1) sequence++
    const sequenceStr = String(sequence).padStart(3, '0')
    
    const base17 = districtCode + datePart + sequenceStr
    
    // 计算校验码
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(base17[i]) * weights[i]
    }
    
    const checkCode = checkCodes[sum % 11]
    return base17 + checkCode
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  const formatDateShort = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  const getAge = () => {
    const birth = new Date(data.value.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const reset = () => {
    data.value = {
      name: '张三',
      gender: 'male',
      ethnicity: '汉族',
      birthDate: '1990-01-15',
      address: '北京市朝阳区建国路88号院1号楼101室',
      idNumber: '110105199001151234',
      issuingAuthority: '北京市公安局朝阳分局',
      issueDate: '2020-01-15',
      expiryDate: '2040-01-15',
      validPeriod: '20年',
      photo: '',
      cardVersion: '2004',
      showMRZ: false
    }
  }

  return {
    data,
    validateIdNumber,
    extractInfoFromId,
    generateIdNumber,
    formatDate,
    formatDateShort,
    getAge,
    reset
  }
})
