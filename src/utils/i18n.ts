import { ref, computed, watch } from 'vue'

export type Language = 'zh' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'ru' | 'ar' | 'pt'

// 支持的语言列表
export const supportedLanguages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' }
]

// 从localStorage读取保存的语言设置
const getSavedLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('preferred-language')
    if (saved && supportedLanguages.some(l => l.code === saved)) {
      return saved as Language
    }
    // 检测浏览器语言
    const browserLang = navigator.language.split('-')[0]
    const supported = supportedLanguages.find(l => l.code === browserLang)
    if (supported) return supported.code
  }
  return 'zh'
}

// 全局语言状态
export const currentLanguage = ref<Language>(getSavedLanguage())

// 监听语言变化，保存到localStorage
watch(currentLanguage, (newLang) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-language', newLang)
    // 设置HTML的lang属性
    document.documentElement.lang = newLang
    // RTL支持
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
  }
})

// 切换语言
export const toggleLanguage = () => {
  const currentIndex = supportedLanguages.findIndex(l => l.code === currentLanguage.value)
  const nextIndex = (currentIndex + 1) % supportedLanguages.length
  currentLanguage.value = supportedLanguages[nextIndex].code
}

export const setLanguage = (lang: Language) => {
  currentLanguage.value = lang
}

// 获取当前语言信息
export const getCurrentLanguageInfo = () => {
  return supportedLanguages.find(l => l.code === currentLanguage.value)
}

// 通用翻译字典 - 扩展多语言支持
type TranslationDict = Record<string, Partial<Record<Language, string>>>

export const translations: TranslationDict = {
  // 导航相关
  'nav.home': { 
    zh: '首页', 
    en: 'Home', 
    ja: 'ホーム', 
    ko: '홈', 
    es: 'Inicio', 
    fr: 'Accueil', 
    de: 'Startseite', 
    ru: 'Главная', 
    ar: 'الرئيسية', 
    pt: 'Início' 
  },
  'nav.studentId': { zh: '学生证', en: 'Student ID' },
  'nav.transcript': { zh: '成绩单', en: 'Transcript' },
  'nav.certificate': { zh: '证书', en: 'Certificate' },
  'nav.admissionLetter': { zh: '录取通知书', en: 'Admission Letter' },
  'nav.invoice': { zh: '发票', en: 'Invoice' },
  'nav.flight': { zh: '航班行程', en: 'Flight' },
  'nav.hotel': { zh: '酒店预订', en: 'Hotel' },
  'nav.utilityBill': { zh: '水电账单', en: 'Utility Bill' },
  'nav.passport': { zh: '护照', en: 'Passport' },
  'nav.driverLicense': { zh: '驾照', en: 'Driver License' },
  'nav.resume': { zh: '简历', en: 'Resume' },
  'nav.businessCard': { zh: '名片', en: 'Business Card' },
  'nav.wechat': { zh: '微信', en: 'WeChat' },
  'nav.qq': { zh: 'QQ', en: 'QQ' },
  'nav.medicalReport': { zh: '体检报告', en: 'Medical Report' },
  'nav.academicReport': { zh: '学术报告', en: 'Academic Report' },
  'nav.bankStatement': { zh: '银行账单', en: 'Bank Statement' },
  'nav.taxForm': { zh: '税单', en: 'Tax Form' },

  // 通用界面
  'common.preview': { zh: '预览', en: 'Preview' },
  'common.download': { zh: '下载', en: 'Download' },
  'common.export': { zh: '导出', en: 'Export' },
  'common.save': { zh: '保存', en: 'Save' },
  'common.cancel': { zh: '取消', en: 'Cancel' },
  'common.delete': { zh: '删除', en: 'Delete' },
  'common.edit': { zh: '编辑', en: 'Edit' },
  'common.add': { zh: '添加', en: 'Add' },
  'common.settings': { zh: '设置', en: 'Settings' },
  'common.email': { zh: '邮件', en: 'Email' },
  'common.language': { zh: '语言', en: 'Language' },
  'common.chinese': { zh: '中文', en: 'Chinese' },
  'common.english': { zh: '英文', en: 'English' },

  // 航班相关
  'flight.title': { zh: '航班行程单生成器', en: 'Flight Itinerary Generator' },
  'flight.subtitle': { zh: '创建航班行程确认单', en: 'Create flight itinerary confirmation' },
  'flight.bookingInfo': { zh: '预订信息', en: 'Booking Info' },
  'flight.passengerInfo': { zh: '乘客信息', en: 'Passenger Info' },
  'flight.flightInfo': { zh: '航班信息', en: 'Flight Info' },
  'flight.bookingReference': { zh: '预订编号', en: 'Booking Reference' },
  'flight.bookingDate': { zh: '预订日期', en: 'Booking Date' },
  'flight.ticketNumber': { zh: '机票号', en: 'Ticket Number' },
  'flight.eTicketNumber': { zh: '电子票号', en: 'E-Ticket Number' },
  'flight.status': { zh: '状态', en: 'Status' },
  'flight.confirmed': { zh: '已确认', en: 'Confirmed' },
  'flight.pending': { zh: '待确认', en: 'Pending' },
  'flight.cancelled': { zh: '已取消', en: 'Cancelled' },
  'flight.passenger': { zh: '乘客', en: 'Passenger' },
  'flight.firstName': { zh: '名', en: 'First Name' },
  'flight.lastName': { zh: '姓', en: 'Last Name' },
  'flight.title_mr': { zh: '先生', en: 'Mr.' },
  'flight.title_ms': { zh: '女士', en: 'Ms.' },
  'flight.title_mrs': { zh: '太太', en: 'Mrs.' },
  'flight.dateOfBirth': { zh: '出生日期', en: 'Date of Birth' },
  'flight.passportNumber': { zh: '护照号', en: 'Passport Number' },
  'flight.nationality': { zh: '国籍', en: 'Nationality' },
  'flight.seatPreference': { zh: '座位偏好', en: 'Seat Preference' },
  'flight.window': { zh: '靠窗', en: 'Window' },
  'flight.aisle': { zh: '靠过道', en: 'Aisle' },
  'flight.noPreference': { zh: '无偏好', en: 'No Preference' },
  'flight.flightNumber': { zh: '航班号', en: 'Flight Number' },
  'flight.airline': { zh: '航空公司', en: 'Airline' },
  'flight.departure': { zh: '出发', en: 'Departure' },
  'flight.arrival': { zh: '到达', en: 'Arrival' },
  'flight.duration': { zh: '飞行时间', en: 'Duration' },
  'flight.class': { zh: '舱位', en: 'Class' },
  'flight.economy': { zh: '经济舱', en: 'Economy' },
  'flight.business': { zh: '商务舱', en: 'Business' },
  'flight.first': { zh: '头等舱', en: 'First Class' },

  // 酒店相关
  'hotel.title': { zh: '酒店预订单生成器', en: 'Hotel Booking Generator' },
  'hotel.subtitle': { zh: '创建酒店预订确认单', en: 'Create hotel booking confirmation' },
  'hotel.hotelInfo': { zh: '酒店信息', en: 'Hotel Info' },
  'hotel.guestInfo': { zh: '客人信息', en: 'Guest Info' },
  'hotel.reservationDetails': { zh: '预订详情', en: 'Reservation Details' },
  'hotel.paymentInfo': { zh: '付款信息', en: 'Payment Info' },
  'hotel.hotelName': { zh: '酒店名称', en: 'Hotel Name' },
  'hotel.starRating': { zh: '星级', en: 'Star Rating' },
  'hotel.confirmationNumber': { zh: '确认编号', en: 'Confirmation Number' },
  'hotel.address': { zh: '地址', en: 'Address' },
  'hotel.phone': { zh: '联系电话', en: 'Phone' },
  'hotel.checkIn': { zh: '入住日期', en: 'Check-in Date' },
  'hotel.checkOut': { zh: '退房日期', en: 'Check-out Date' },
  'hotel.roomType': { zh: '房间类型', en: 'Room Type' },
  'hotel.nights': { zh: '晚', en: 'Night(s)' },
  'hotel.guests': { zh: '人数', en: 'Guests' },
  'hotel.totalAmount': { zh: '总金额', en: 'Total Amount' },

  // 账单相关
  'bill.title': { zh: '水电账单生成器', en: 'Utility Bill Generator' },
  'bill.subtitle': { zh: '创建公用事业账单', en: 'Create utility bills' },
  'bill.billInfo': { zh: '账单信息', en: 'Bill Info' },
  'bill.provider': { zh: '服务商', en: 'Provider' },
  'bill.customer': { zh: '客户信息', en: 'Customer Info' },
  'bill.usageCharges': { zh: '用量费用', en: 'Usage & Charges' },
  'bill.billType': { zh: '账单类型', en: 'Bill Type' },
  'bill.electricity': { zh: '电费', en: 'Electricity' },
  'bill.water': { zh: '水费', en: 'Water' },
  'bill.gas': { zh: '燃气费', en: 'Gas' },
  'bill.internet': { zh: '网络费', en: 'Internet' },
  'bill.phone': { zh: '电话费', en: 'Phone' },
  'bill.billNumber': { zh: '账单编号', en: 'Bill Number' },
  'bill.accountNumber': { zh: '账户编号', en: 'Account Number' },
  'bill.billDate': { zh: '账单日期', en: 'Bill Date' },
  'bill.dueDate': { zh: '截止日期', en: 'Due Date' },
  'bill.totalDue': { zh: '应付金额', en: 'Amount Due' },

  // 预览文档内容
  'preview.bookingConfirmation': { zh: '预订确认', en: 'Booking Confirmation' },
  'preview.flightItinerary': { zh: '航班行程单', en: 'Flight Itinerary' },
  'preview.hotelReservation': { zh: '酒店预订确认', en: 'Hotel Reservation Confirmation' },
  'preview.utilityStatement': { zh: '账单', en: 'Statement' },
  'preview.invoiceNumber': { zh: '发票编号', en: 'Invoice Number' },
  'preview.issueDate': { zh: '开票日期', en: 'Issue Date' },
  'preview.thankYou': { zh: '感谢您的使用', en: 'Thank you for your business' },

  // 航班更多字段
  'flight.mealPreference': { zh: '餐食偏好', en: 'Meal Preference' },
  'flight.mealRegular': { zh: '标准餐', en: 'Regular' },
  'flight.mealVegetarian': { zh: '素食', en: 'Vegetarian' },
  'flight.mealVegan': { zh: '纯素', en: 'Vegan' },
  'flight.mealHalal': { zh: '清真餐', en: 'Halal' },
  'flight.mealKosher': { zh: '犹太餐', en: 'Kosher' },
  'flight.mealAsianVeg': { zh: '亚洲素食', en: 'Asian Vegetarian' },
  'flight.frequentFlyer': { zh: '常旅客号', en: 'Frequent Flyer Number' },
  'flight.addPassenger': { zh: '+ 添加乘客', en: '+ Add Passenger' },
  'flight.segment': { zh: '航段', en: 'Flight Segment' },
  'flight.addSegment': { zh: '+ 添加航段', en: '+ Add Flight Segment' },
  'flight.aircraft': { zh: '机型', en: 'Aircraft' },
  'flight.premiumEconomy': { zh: '超级经济舱', en: 'Premium Economy' },
  'flight.departureInfo': { zh: '出发信息', en: 'Departure Info' },
  'flight.arrivalInfo': { zh: '到达信息', en: 'Arrival Info' },
  'flight.departureCity': { zh: '出发城市', en: 'Departure City' },
  'flight.arrivalCity': { zh: '到达城市', en: 'Arrival City' },
  'flight.airportCode': { zh: '机场代码', en: 'Airport Code' },
  'flight.terminal': { zh: '航站楼', en: 'Terminal' },
  'flight.gate': { zh: '登机口', en: 'Gate' },
  'flight.departureDate': { zh: '出发日期', en: 'Departure Date' },
  'flight.departureTime': { zh: '出发时间', en: 'Departure Time' },
  'flight.arrivalDate': { zh: '到达日期', en: 'Arrival Date' },
  'flight.arrivalTime': { zh: '到达时间', en: 'Arrival Time' },
  'flight.flightDuration': { zh: '飞行时长', en: 'Flight Duration' },
  'flight.seatNumber': { zh: '座位号', en: 'Seat Number' },
  'flight.baggage': { zh: '行李额', en: 'Baggage Allowance' },
  'flight.templateSelect': { zh: '模板选择', en: 'Template Selection' },
  'flight.colorSettings': { zh: '颜色设置', en: 'Color Settings' },
  'flight.primaryColor': { zh: '主色调', en: 'Primary Color' },
  'flight.secondaryColor': { zh: '次色调', en: 'Secondary Color' },
  'flight.airlineLogo': { zh: '航空公司Logo', en: 'Airline Logo' },
  'flight.displayOptions': { zh: '显示选项', en: 'Display Options' },
  'flight.showBarcode': { zh: '显示条形码', en: 'Show Barcode' },
  'flight.showQRCode': { zh: '显示二维码', en: 'Show QR Code' },
  'flight.paymentInfo': { zh: '付款信息', en: 'Payment Info' },
  'flight.totalAmount': { zh: '总金额', en: 'Total Amount' },
  'flight.currency': { zh: '货币', en: 'Currency' },
  'flight.paymentMethod': { zh: '付款方式', en: 'Payment Method' },
  'flight.paymentDate': { zh: '付款日期', en: 'Payment Date' },
  'flight.itineraryPreview': { zh: '行程单预览', en: 'Itinerary Preview' },
  'flight.sendEmail': { zh: '发送邮件', en: 'Send Email' },
  'flight.contactPhone': { zh: '联系电话', en: 'Contact Phone' },
  'flight.contactEmail': { zh: '邮箱', en: 'Email' },
  'flight.salutation': { zh: '称谓', en: 'Title' },

  // 酒店更多字段
  'hotel.guestName': { zh: '客人姓名', en: 'Guest Name' },
  'hotel.addGuest': { zh: '+ 添加客人', en: '+ Add Guest' },
  'hotel.roomCount': { zh: '房间数量', en: 'Number of Rooms' },
  'hotel.adultsCount': { zh: '成人', en: 'Adults' },
  'hotel.childrenCount': { zh: '儿童', en: 'Children' },
  'hotel.specialRequests': { zh: '特殊要求', en: 'Special Requests' },
  'hotel.pricePerNight': { zh: '每晚价格', en: 'Price Per Night' },
  'hotel.taxesFees': { zh: '税费', en: 'Taxes & Fees' },
  'hotel.reservationPreview': { zh: '预订确认预览', en: 'Reservation Preview' },
  'hotel.templateSelect': { zh: '模板选择', en: 'Template Selection' },
  'hotel.colorSettings': { zh: '颜色设置', en: 'Color Settings' },
  'hotel.displayOptions': { zh: '显示选项', en: 'Display Options' },
  'hotel.showQRCode': { zh: '显示二维码', en: 'Show QR Code' },
  'hotel.showBarcode': { zh: '显示条形码', en: 'Show Barcode' },
  'hotel.facilities': { zh: '酒店设施', en: 'Facilities' },
  'hotel.cancellationPolicy': { zh: '取消政策', en: 'Cancellation Policy' },
  'hotel.hotelLogo': { zh: '酒店Logo', en: 'Hotel Logo' },
  'hotel.website': { zh: '酒店网站', en: 'Website' },
  'hotel.idNumber': { zh: '证件号码', en: 'ID Number' },
  'hotel.specialRequestsPlaceholder': { zh: '如无烟房、高楼层等', en: 'e.g. non-smoking room, high floor' },
  'hotel.roomStandard': { zh: '标准间', en: 'Standard Room' },
  'hotel.roomDeluxe': { zh: '豪华间', en: 'Deluxe Room' },
  'hotel.roomSuite': { zh: '套房', en: 'Suite' },
  'hotel.roomExecutive': { zh: '行政套房', en: 'Executive Suite' },
  'hotel.roomPresidential': { zh: '总统套房', en: 'Presidential Suite' },
  'hotel.roomNumber': { zh: '房间号', en: 'Room Number' },
  'hotel.breakfastIncluded': { zh: '是否含早', en: 'Breakfast Included' },
  'hotel.withBreakfast': { zh: '含早餐', en: 'With Breakfast' },
  'hotel.withoutBreakfast': { zh: '不含早餐', en: 'Without Breakfast' },
  'hotel.paymentMethod': { zh: '支付方式', en: 'Payment Method' },
  'hotel.paymentStatus': { zh: '支付状态', en: 'Payment Status' },
  'hotel.creditCard': { zh: '信用卡', en: 'Credit Card' },
  'hotel.debitCard': { zh: '借记卡', en: 'Debit Card' },
  'hotel.cash': { zh: '现金', en: 'Cash' },
  'hotel.bankTransfer': { zh: '银行转账', en: 'Bank Transfer' },
  'hotel.paid': { zh: '已支付', en: 'Paid' },
  'hotel.paymentPending': { zh: '待支付', en: 'Pending' },
  'hotel.partiallyPaid': { zh: '部分支付', en: 'Partially Paid' },
  'hotel.amountPaid': { zh: '已付金额', en: 'Amount Paid' },
  'hotel.roomCharges': { zh: '住宿费用', en: 'Room Charges' },
  'hotel.primaryColor': { zh: '主色调', en: 'Primary Color' },
  'hotel.showLogo': { zh: '显示Logo', en: 'Show Logo' },
  'hotel.showPolicies': { zh: '显示政策', en: 'Show Policies' },
  'hotel.showAmenities': { zh: '显示设施', en: 'Show Amenities' },
  'hotel.templateLuxury': { zh: '奢华', en: 'Luxury' },
  'hotel.templateModern': { zh: '现代', en: 'Modern' },
  'hotel.templateClassic': { zh: '经典', en: 'Classic' },
  'hotel.templateMinimal': { zh: '简约', en: 'Minimal' },

  // 账单更多字段
  'bill.providerName': { zh: '服务商名称', en: 'Provider Name' },
  'bill.providerAddress': { zh: '服务商地址', en: 'Provider Address' },
  'bill.serviceAddress': { zh: '服务地址', en: 'Service Address' },
  'bill.customerName': { zh: '客户姓名', en: 'Customer Name' },
  'bill.customerAddress': { zh: '客户地址', en: 'Customer Address' },
  'bill.billingPeriod': { zh: '账单周期', en: 'Billing Period' },
  'bill.periodStart': { zh: '开始日期', en: 'Period Start' },
  'bill.periodEnd': { zh: '结束日期', en: 'Period End' },
  'bill.previousReading': { zh: '上期读数', en: 'Previous Reading' },
  'bill.currentReading': { zh: '本期读数', en: 'Current Reading' },
  'bill.usage': { zh: '用量', en: 'Usage' },
  'bill.unitPrice': { zh: '单价', en: 'Unit Price' },
  'bill.amount': { zh: '金额', en: 'Amount' },
  'bill.previousBalance': { zh: '前期余额', en: 'Previous Balance' },
  'bill.currentCharges': { zh: '本期费用', en: 'Current Charges' },
  'bill.billPreview': { zh: '账单预览', en: 'Bill Preview' },
  'bill.templateSelect': { zh: '模板选择', en: 'Template Selection' },
  'bill.displayOptions': { zh: '显示选项', en: 'Display Options' },
  'bill.providerTagline': { zh: '公司标语', en: 'Company Tagline' },
  'bill.providerLogo': { zh: '公司Logo', en: 'Company Logo' },
  'bill.customerService': { zh: '客服电话', en: 'Customer Service' },
  'bill.website': { zh: '网站', en: 'Website' },
  'bill.city': { zh: '城市', en: 'City' },
  'bill.zipCode': { zh: '邮编', en: 'ZIP Code' },
  'bill.customerPhone': { zh: '电话', en: 'Phone' },
  'bill.meterNumber': { zh: '电表编号', en: 'Meter Number' },
  'bill.chargeDetails': { zh: '费用明细', en: 'Charge Details' },
  'bill.chargeName': { zh: '费用名称', en: 'Charge Name' },
  'bill.unit': { zh: '单位', en: 'Unit' },
  'bill.addCharge': { zh: '+ 添加费用', en: '+ Add Charge' },
  'bill.taxes': { zh: '税费', en: 'Taxes' },
  'bill.serviceFees': { zh: '服务费', en: 'Service Fees' },
  'bill.primaryColor': { zh: '主色调', en: 'Primary Color' },
  'bill.currency': { zh: '货币', en: 'Currency' },
  'bill.showUsageChart': { zh: '显示用量图表', en: 'Show Usage Chart' },
  'bill.showPaymentOptions': { zh: '显示支付方式', en: 'Show Payment Options' },
  'bill.showBarcode': { zh: '显示条形码', en: 'Show Barcode' },
  'bill.showLateFee': { zh: '显示逾期提示', en: 'Show Late Fee Notice' },
  'bill.history': { zh: '历史账单', en: 'History' },
  'bill.payments': { zh: '已付款项', en: 'Payments Made' },
  'bill.lateFee': { zh: '逾期费用', en: 'Late Fee' },
  'bill.templateModern': { zh: '现代', en: 'Modern' },
  'bill.templateClassic': { zh: '经典', en: 'Classic' },
  'bill.templateUtility': { zh: '公用事业', en: 'Utility' },
  'bill.templateMinimal': { zh: '简约', en: 'Minimal' },
  'bill.billSubject': { zh: '账单', en: 'Bill' },

  // 证书相关
  'certificate.title': { zh: '证书生成器', en: 'Certificate Generator' },
  'certificate.subtitle': { zh: '创建专业证书和奖状', en: 'Create professional certificates and awards' },
  'certificate.info': { zh: '证书信息', en: 'Certificate Info' },
  'certificate.issuer': { zh: '颁发机构', en: 'Issuer' },
  'certificate.signature': { zh: '签名印章', en: 'Signature & Seal' },
  'certificate.design': { zh: '设计', en: 'Design' },
  'certificate.type': { zh: '证书类型', en: 'Certificate Type' },
  'certificate.typeAchievement': { zh: '成就证书', en: 'Achievement Certificate' },
  'certificate.typeCompletion': { zh: '结业证书', en: 'Completion Certificate' },
  'certificate.typeAppreciation': { zh: '感谢证书', en: 'Appreciation Certificate' },
  'certificate.typeParticipation': { zh: '参与证书', en: 'Participation Certificate' },
  'certificate.typeExcellence': { zh: '优秀证书', en: 'Excellence Certificate' },
  'certificate.typeGraduation': { zh: '毕业证书', en: 'Graduation Certificate' },
  'certificate.typeTraining': { zh: '培训证书', en: 'Training Certificate' },
  'certificate.typeMembership': { zh: '会员证书', en: 'Membership Certificate' },
  'certificate.certTitle': { zh: '证书标题', en: 'Certificate Title' },
  'certificate.certTitlePlaceholder': { zh: '荣誉证书', en: 'Certificate of Honor' },
  'certificate.recipientName': { zh: '接收人姓名', en: 'Recipient Name' },
  'certificate.content': { zh: '证书内容', en: 'Certificate Content' },
  'certificate.contentPlaceholder': { zh: '兹证明该同志...', en: 'This is to certify that...' },
  'certificate.issueDate': { zh: '颁发日期', en: 'Issue Date' },
  'certificate.certNumber': { zh: '证书编号', en: 'Certificate Number' },
  'certificate.orgName': { zh: '机构名称', en: 'Organization Name' },
  'certificate.orgLogo': { zh: '机构Logo', en: 'Organization Logo' },
  'certificate.orgAddress': { zh: '机构地址', en: 'Organization Address' },
  'certificate.orgWebsite': { zh: '机构网站', en: 'Organization Website' },
  'certificate.signatureList': { zh: '签名列表', en: 'Signature List' },
  'certificate.signatureName': { zh: '签名人', en: 'Signatory Name' },
  'certificate.signaturePosition': { zh: '职位', en: 'Position' },
  'certificate.signatureImage': { zh: '签名图片', en: 'Signature Image' },
  'certificate.deleteSignature': { zh: '删除此签名', en: 'Delete Signature' },
  'certificate.addSignature': { zh: '+ 添加签名', en: '+ Add Signature' },
  'certificate.sealImage': { zh: '印章图片', en: 'Seal Image' },
  'certificate.templateSelect': { zh: '模板选择', en: 'Template Selection' },
  'certificate.borderStyle': { zh: '边框样式', en: 'Border Style' },
  'certificate.primaryColor': { zh: '主色调', en: 'Primary Color' },
  'certificate.textColor': { zh: '文字颜色', en: 'Text Color' },
  'certificate.showLogo': { zh: '显示机构Logo', en: 'Show Organization Logo' },
  'certificate.showSeal': { zh: '显示印章', en: 'Show Seal' },
  'certificate.showNumber': { zh: '显示编号', en: 'Show Number' },
  'certificate.showQRCode': { zh: '显示二维码', en: 'Show QR Code' },
  'certificate.preview': { zh: '证书预览', en: 'Certificate Preview' }
}

// 翻译函数
export const t = (key: string): string => {
  const translation = translations[key]
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`)
    return key
  }
  return translation[currentLanguage.value]
}

// 组合式函数
export const useI18n = () => {
  return {
    currentLanguage,
    toggleLanguage,
    setLanguage,
    t: (key: string) => {
      const translation = translations[key]
      return translation ? translation[currentLanguage.value] : key
    },
    isZh: computed(() => currentLanguage.value === 'zh'),
    isEn: computed(() => currentLanguage.value === 'en')
  }
}
