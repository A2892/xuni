import { defineStore } from 'pinia'

export interface BankTransaction {
  id: string
  date: string
  time?: string // 交易时间
  merchant: string
  category: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed'
  location: string
  paymentMethod: string
  description?: string
  code?: string // Transaction Code e.g. POS, ATM
  balanceAfter?: number // Running balance
  transactionType?: 'debit' | 'credit' | 'transfer' | 'fee' | 'interest' | 'refund' // 交易类型
  channel?: 'atm' | 'pos' | 'online' | 'mobile' | 'branch' | 'wire' // 交易渠道
  referenceNumber?: string // 交易参考号
  counterpartyAccount?: string // 对方账户
  counterpartyName?: string // 对方名称
  notes?: string // 备注
  fee?: number // 手续费
  exchangeRate?: number // 汇率（如果是外币交易）
  cardType?: string // 卡类型
  cardNumber?: string // 卡号
}

export interface BankCardInfo {
  cardNumber: string
  cardHolder: string
  cardHolderPhoto?: string
  bank: string
  branch?: string
  bankAddress?: string
  bankPhone?: string
  bankWebsite?: string
  accountType?: string
  status?: string
  iban?: string
  swift?: string
  cardType: 'visa' | 'visa_infinite' | 'visa_signature' | 'visa_platinum' | 'visa_gold' | 'visa_debit' | 'mastercard' | 'mastercard_world_elite' | 'mastercard_world' | 'mastercard_platinum' | 'mastercard_gold' | 'amex' | 'amex_centurion' | 'amex_platinum' | 'amex_gold' | 'amex_green' | 'unionpay' | 'unionpay_diamond' | 'unionpay_platinum' | 'discover' | 'diners' | 'jcb'
  expiryDate: string
  billingAddress: string
  currency: string
  openingBalance?: number
  closingBalance?: number
  interestEarned?: number
  interestYTD?: number
  availableBalance?: number // 可用余额
  creditLimit?: number // 信用额度（信用卡）
  minimumPayment?: number // 最低还款额
  paymentDueDate?: string // 还款到期日
  overdraftLimit?: number // 透支额度
  accountNumber?: string // 完整账号
  routingNumber?: string // 路由号码（美国）
  sortCode?: string // 排序代码（英国）
  customerID?: string // 客户ID
}

export interface StatementSettings {
  statementPeriod: string
  periodType: 'monthly' | 'yearly' | 'custom'
  customStartDate: string
  customEndDate: string
  showLogo: boolean
  logoUrl: string
  showWatermark: boolean
  watermarkText: string
  watermarkFont: string
  // 兼容 WatermarkSettingsPanel 的斜线/文字/全屏字段
  diagonalWatermarkEnabled?: boolean
  diagonalLineWidth?: number
  diagonalLineSpacing?: number
  diagonalLineColor?: string
  diagonalLineOpacity?: number
  diagonalLineRotation?: number
  // 斜线覆盖：当为 true 时斜线渲染在内容之上（覆盖文本）
  diagonalOverlay?: boolean

  textWatermarkEnabled?: boolean
  textWatermarkText?: string
  textWatermarkSize?: number
  textWatermarkFontFamily?: string
  textWatermarkColor?: string
  textWatermarkOpacity?: number
  textWatermarkRotation?: number

  fullScreenWatermarkAngle?: number
  fullScreenWatermarkFontFamily?: string
  fullScreenWatermark: boolean
  watermarkOpacity: number
  watermarkRotation: number
  watermarkSize: number
  watermarkColor: string
  // 全屏间距（兼容名）
  fullScreenWatermarkSpacing?: number
  watermarkSpacingX: number
  watermarkSpacingY: number
  // 花纹/角落装饰
  cornerPatternEnabled?: boolean
  cornerPattern?: string
  cornerPosition?: string
  cornerColor?: string
  cornerOpacity?: number
  cornerSize?: number
  cornerOverlay?: boolean
  includeSummary: boolean
  dateFormat: string
  language: 'en' | 'zh'
  theme: string
  bankMessage: string
  // Design Options
  fontFamily: string
  primaryColor: string
  secondaryColor: string
  fontSize: number
  lineHeight: number
  showBorder: boolean
  borderColor: string
  borderWidth: number
  borderStyle: string
  showCharts: boolean
  // New Display Options
  showTransactionTime: boolean // 显示交易时间
  showBalanceAfter: boolean // 显示每笔交易后余额
  showTransactionDetails: boolean // 显示交易详情
  showCategoryIcons: boolean // 显示分类图标
  showMonthlyStatistics: boolean // 显示月度统计
  groupByDate: boolean // 按日期分组
  showReferenceNumber: boolean // 显示参考号
  highlightLargeTransactions: boolean // 高亮大额交易
  largeTransactionThreshold: number // 大额交易阈值
  footerText: string // 页脚文字
  footerContact: string // 页脚联系信息

  // Barcode & QR Code
  showBarcode: boolean
  barcodeSource: 'generated' | 'upload'
  barcodeImage: string
  barcodeContent: string
  showQR: boolean
  qrSource: 'generated' | 'upload'
  qrImage: string
  qrContent: string
}

export const useBankStore = defineStore('bank', {
  state: () => ({
    viewMode: 'single' as 'single' | 'consolidated' | 'report', // 单个账户、汇总视图或报告视图
    accounts: [] as Array<{
      id: string
      cardInfo: BankCardInfo
      transactions: BankTransaction[]
    }>,
    currentAccountId: 'default' as string,
    cardInfo: {
      cardNumber: '4532 **** **** 1234',
      cardHolder: 'ZHANG SAN',
      cardHolderPhoto: '',
      bank: 'Chase Bank',
      branch: 'New York Main Branch',
      bankAddress: '270 Park Avenue, New York, NY 10017',
      bankPhone: '1-800-935-9935',
      bankWebsite: 'www.chase.com',
      accountType: 'Checking Account',
      status: 'Active',
      iban: 'US12 3456 7890 1234 5678',
      swift: 'CHASUS33',
      cardType: 'visa',
      expiryDate: '12/2025',
      billingAddress: '123 Main St, New York, NY 10001, USA',
      currency: 'USD',
      openingBalance: 5000.00,
      closingBalance: 4250.00,
      interestEarned: 12.50,
      interestYTD: 145.20,
      availableBalance: 4250.00,
      accountNumber: '1234567890',
      routingNumber: '021000021',
      customerID: 'CUS-2024-001'
    } as BankCardInfo,
    
    transactions: [
      {
        id: '1',
        date: '2024-01-15',
        time: '14:32:15',
        merchant: 'Amazon.com',
        category: 'Shopping',
        amount: -89.99,
        currency: 'USD',
        status: 'completed',
        location: 'Online',
        paymentMethod: 'Visa ****1234',
        description: 'Electronics - Wireless Headphones',
        code: 'POS',
        transactionType: 'debit',
        channel: 'online',
        referenceNumber: 'TXN20240115143215',
        balanceAfter: 4910.01,
        cardType: 'Visa',
        cardNumber: '1234'
      },
      {
        id: '2',
        date: '2024-01-14',
        time: '08:15:22',
        merchant: 'Starbucks',
        category: 'Food & Dining',
        amount: -12.50,
        currency: 'USD',
        status: 'completed',
        location: 'New York, NY',
        paymentMethod: 'Visa ****1234',
        code: 'POS',
        transactionType: 'debit',
        channel: 'pos',
        referenceNumber: 'TXN20240114081522',
        balanceAfter: 5000.00,
        cardType: 'Visa',
        cardNumber: '1234'
      },
      {
        id: '3',
        date: '2024-01-13',
        time: '19:45:30',
        merchant: 'Uber',
        category: 'Transportation',
        amount: -25.30,
        currency: 'USD',
        status: 'completed',
        location: 'New York, NY',
        paymentMethod: 'Visa ****1234',
        transactionType: 'debit',
        channel: 'mobile',
        referenceNumber: 'TXN20240113194530',
        balanceAfter: 5012.50,
        cardType: 'Visa',
        cardNumber: '1234'
      },
      {
        id: '4',
        date: '2024-01-12',
        time: '11:20:45',
        merchant: 'Apple Store',
        category: 'Shopping',
        amount: -999.00,
        currency: 'USD',
        status: 'completed',
        location: 'Online',
        paymentMethod: 'Visa ****1234',
        description: 'iPhone 15 Pro',
        transactionType: 'debit',
        channel: 'online',
        referenceNumber: 'TXN20240112112045',
        balanceAfter: 5037.80,
        cardType: 'Visa',
        cardNumber: '1234'
      },
      {
        id: '5',
        date: '2024-01-10',
        time: '00:05:10',
        merchant: 'Netflix',
        category: 'Entertainment',
        amount: -15.99,
        currency: 'USD',
        status: 'completed',
        location: 'Online',
        paymentMethod: 'Visa ****1234',
        description: 'Monthly Subscription',
        transactionType: 'debit',
        channel: 'online',
        referenceNumber: 'TXN20240110000510',
        balanceAfter: 6036.80,
        cardType: 'Visa',
        cardNumber: '1234'
      },
      {
        id: '6',
        date: '2024-01-08',
        time: '09:30:00',
        merchant: 'Salary Deposit',
        category: 'Income',
        amount: 3500.00,
        currency: 'USD',
        status: 'completed',
        location: 'Wire Transfer',
        paymentMethod: 'Direct Deposit',
        description: 'Monthly Salary',
        transactionType: 'credit',
        channel: 'wire',
        referenceNumber: 'TXN20240108093000',
        counterpartyName: 'ABC Corporation',
        counterpartyAccount: '****5678',
        balanceAfter: 6052.79,
        cardNumber: '1234'
      },
      {
        id: '7',
        date: '2024-01-05',
        time: '16:20:30',
        merchant: 'ATM Withdrawal',
        category: 'Cash Withdrawal',
        amount: -200.00,
        currency: 'USD',
        status: 'completed',
        location: 'Chase ATM - 5th Ave',
        paymentMethod: 'ATM',
        code: 'ATM',
        transactionType: 'debit',
        channel: 'atm',
        referenceNumber: 'TXN20240105162030',
        fee: 2.50,
        balanceAfter: 2552.79,
        cardType: 'Visa',
        cardNumber: '1234'
      },
      {
        id: '8',
        date: '2024-01-03',
        time: '10:15:00',
        merchant: 'Interest Credit',
        category: 'Interest',
        amount: 12.50,
        currency: 'USD',
        status: 'completed',
        location: 'Auto',
        paymentMethod: 'Auto',
        description: 'Monthly Interest',
        transactionType: 'interest',
        channel: 'online',
        referenceNumber: 'INT20240103',
        balanceAfter: 2755.29,
        cardNumber: '1234'
      }
    ] as BankTransaction[],
    
    settings: {
      statementPeriod: '2024-01',
      periodType: 'monthly',
      customStartDate: '2024-01-01',
      customEndDate: '2024-01-31',
      showLogo: true,
      logoUrl: '',
      showWatermark: true,
      watermarkText: 'OFFICIAL STATEMENT',
      watermarkFont: 'Arial',
      // 兼容 WatermarkSettingsPanel 的默认水印字段
      diagonalWatermarkEnabled: false,
      diagonalLineWidth: 20,
      diagonalLineSpacing: 40,
      diagonalLineColor: '#000000',
      diagonalLineOpacity: 5,
      diagonalLineRotation: -30,
      diagonalOverlay: false,

      textWatermarkEnabled: false,
      textWatermarkText: 'OFFICIAL DOCUMENT',
      textWatermarkSize: 14,
      textWatermarkFontFamily: 'Times New Roman',
      textWatermarkColor: '#000000',
      textWatermarkOpacity: 5,
      textWatermarkRotation: -30,

      fullScreenWatermarkText: 'OFFICIAL STATEMENT',
      fullScreenWatermarkSize: 24,
      fullScreenWatermarkColor: '#000000',
      fullScreenWatermarkOpacity: 15,
      fullScreenWatermarkSpacing: 200,

      // 角落花纹默认
      cornerPatternEnabled: false,
      cornerPattern: 'Corner Pattern',
      cornerPosition: 'All Positions',
      cornerColor: '#1e40af',
      cornerOpacity: 15,
      cornerSize: 30,
      cornerOverlay: false,
      fullScreenWatermarkAngle: -45,
      fullScreenWatermarkFontFamily: 'Arial',
      watermarkOverlay: false,
      fullScreenWatermark: false,
      watermarkOpacity: 15,
      watermarkRotation: -45,
      watermarkSize: 24,
      watermarkColor: '#000000',
      watermarkSpacingX: 200,
      watermarkSpacingY: 200,
      includeSummary: true,
      dateFormat: 'MM/DD/YYYY',
      language: 'en',
      theme: 'professional',
      bankMessage: 'IMPORTANT: Please review your statement for accuracy. Report any errors within 30 days.',
      fontFamily: 'Arial',
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      fontSize: 14,
      lineHeight: 1.5,
      showBorder: false,
      borderColor: '#000000',
      borderWidth: 1,
      borderStyle: 'solid',
      showCharts: true,
      showTransactionTime: true,
      showBalanceAfter: true,
      showTransactionDetails: true,
      showCategoryIcons: true,
      showMonthlyStatistics: true,
      groupByDate: true,
      showReferenceNumber: true,
      highlightLargeTransactions: true,
      largeTransactionThreshold: 500,
      footerText: 'This is an official bank statement. Please keep it for your records.',
      footerContact: 'For inquiries, please contact customer service at 1-800-XXX-XXXX',
      
      // Barcode & QR Code
      showBarcode: false,
      barcodeSource: 'generated',
      barcodeImage: '',
      barcodeContent: '',
      showQR: false,
      qrSource: 'generated',
      qrImage: '',
      qrContent: '',
      
      consolidatedDisplayMode: 'detail' as 'summary' | 'detail' // 汇总对账单显示模式
    } as StatementSettings
  }),
  
  getters: {
    // 获取当前账户的交易（根据卡号筛选）
    currentAccountTransactions(): BankTransaction[] {
      if (this.viewMode === 'consolidated') return this.transactions
      
      // 单个账户模式：只返回匹配当前卡号的交易
      const currentCard = this.cardInfo.cardNumber.replace(/[^\d]/g, '')
      const currentLast4 = currentCard.slice(-4)
      
      // 如果当前卡号无效，返回空数组
      if (!currentCard || currentCard.length === 0) return []
      
      return this.transactions.filter(t => {
        // 没有卡号信息的交易不显示（单个账户模式下）
        if (!t.cardNumber) return false
        
        const transCard = t.cardNumber.replace(/[^\d]/g, '')
        const transLast4 = transCard.slice(-4)
        
        // 完全匹配
        if (currentCard === transCard) return true
        
        // 匹配后4位
        if (currentLast4 && transLast4 && currentLast4 === transLast4) return true
        
        // 交易卡号只有4位数的情况
        if (transCard.length === 4 && transCard === currentLast4) return true
        
        return false
      })
    },
    
    totalSpent(): number {
      return this.currentAccountTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    },
    
    totalIncome(): number {
      return this.currentAccountTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)
    },
    
    balance(): number {
      return this.currentAccountTransactions.reduce((sum, t) => sum + t.amount, 0)
    },
    
    transactionsByCategory(): Record<string, number> {
      const result: Record<string, number> = {}
      this.currentAccountTransactions.forEach(t => {
        if (t.amount < 0) {
          result[t.category] = (result[t.category] || 0) + Math.abs(t.amount)
        }
      })
      return result
    },
    
    // 新增：按交易类型统计
    transactionsByType(): Record<string, { count: number; amount: number }> {
      const result: Record<string, { count: number; amount: number }> = {}
      this.currentAccountTransactions.forEach(t => {
        const type = t.transactionType || 'other'
        if (!result[type]) {
          result[type] = { count: 0, amount: 0 }
        }
        result[type].count++
        result[type].amount += Math.abs(t.amount)
      })
      return result
    },
    
    // 新增：按渠道统计
    transactionsByChannel(): Record<string, number> {
      const result: Record<string, number> = {}
      this.currentAccountTransactions.forEach(t => {
        const channel = t.channel || 'unknown'
        result[channel] = (result[channel] || 0) + 1
      })
      return result
    },
    
    // 新增：总手续费
    totalFees(): number {
      return this.currentAccountTransactions
        .filter(t => t.fee)
        .reduce((sum, t) => sum + (t.fee || 0), 0)
    },
    
    // 新增：交易笔数统计
    transactionCount(): { total: number; debit: number; credit: number } {
      return {
        total: this.currentAccountTransactions.length,
        debit: this.currentAccountTransactions.filter(t => t.amount < 0).length,
        credit: this.currentAccountTransactions.filter(t => t.amount > 0).length
      }
    },
    
    // 新增：平均交易额
    averageTransaction(): { debit: number; credit: number } {
      const debits = this.currentAccountTransactions.filter(t => t.amount < 0)
      const credits = this.currentAccountTransactions.filter(t => t.amount > 0)
      return {
        debit: debits.length > 0 ? debits.reduce((sum, t) => sum + Math.abs(t.amount), 0) / debits.length : 0,
        credit: credits.length > 0 ? credits.reduce((sum, t) => sum + t.amount, 0) / credits.length : 0
      }
    },

    // 计算期末余额：期初余额 + 收入 + 利息 - 支出
    calculatedClosingBalance(): number {
      const openingBalance = this.cardInfo.openingBalance || 0
      const totalIncome = this.totalIncome // 收入
      const interest = this.cardInfo.interestEarned || 0 // 利息
      const totalSpent = this.totalSpent // 支出
      return openingBalance + totalIncome + interest - totalSpent
    },
    
    // 新增：最大单笔交易
    largestTransactions(): { debit: BankTransaction | null; credit: BankTransaction | null } {
      const debits = this.currentAccountTransactions.filter(t => t.amount < 0)
      const credits = this.currentAccountTransactions.filter(t => t.amount > 0)
      return {
        debit: debits.length > 0 ? debits.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max) : null,
        credit: credits.length > 0 ? credits.reduce((max, t) => t.amount > max.amount ? t : max) : null
      }
    },
    
    // 汇总统计
    consolidatedBalance(): number {
      if (this.viewMode === 'single') return this.balance
      let total = this.balance // 当前账户
      this.accounts.forEach(acc => {
        total += acc.transactions.reduce((sum, t) => sum + t.amount, 0)
      })
      return total
    },
    
    consolidatedByBank(): Array<{
      bank: string
      totalBalance: number
      accountCount: number
      totalTransactions: number
      totalSpent: number
      totalIncome: number
    }> {
      const bankStats = new Map<string, any>()
      
      // 添加当前账户
      const currentBank = this.cardInfo.bank
      bankStats.set(currentBank, {
        bank: currentBank,
        totalBalance: this.balance,
        accountCount: 1,
        totalTransactions: this.transactions.length,
        totalSpent: this.totalSpent,
        totalIncome: this.totalIncome
      })
      
      // 添加其他账户
      this.accounts.forEach(acc => {
        const bank = acc.cardInfo.bank
        const balance = acc.transactions.reduce((sum, t) => sum + t.amount, 0)
        const spent = acc.transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
        const income = acc.transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
        
        if (bankStats.has(bank)) {
          const existing = bankStats.get(bank)
          existing.totalBalance += balance
          existing.accountCount += 1
          existing.totalTransactions += acc.transactions.length
          existing.totalSpent += spent
          existing.totalIncome += income
        } else {
          bankStats.set(bank, {
            bank,
            totalBalance: balance,
            accountCount: 1,
            totalTransactions: acc.transactions.length,
            totalSpent: spent,
            totalIncome: income
          })
        }
      })
      
      return Array.from(bankStats.values())
    },
    
    allTransactions(): BankTransaction[] {
      if (this.viewMode === 'single') return this.transactions
      const all = [...this.transactions]
      this.accounts.forEach(acc => {
        all.push(...acc.transactions)
      })
      return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  },
  
  actions: {
    setViewMode(mode: 'single' | 'consolidated' | 'report') {
      this.viewMode = mode
    },
    
    addAccount(cardInfo: BankCardInfo, transactions: BankTransaction[] = []) {
      this.accounts.push({
        id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        cardInfo,
        transactions
      })
    },
    
    removeAccount(accountId: string) {
      const index = this.accounts.findIndex(acc => acc.id === accountId)
      if (index !== -1) {
        this.accounts.splice(index, 1)
      }
    },
    
    switchAccount(accountId: string) {
      const accountIndex = this.accounts.findIndex(acc => acc.id === accountId)
      if (accountIndex === -1) return
      
      const account = this.accounts[accountIndex]
      
      // 保存当前主账户到 accounts 列表（如果有交易的话）
      if (this.transactions.length > 0 || this.cardInfo.cardNumber) {
        const oldMainAccount = {
          id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          cardInfo: { ...this.cardInfo },
          transactions: [...this.transactions]
        }
        this.accounts.push(oldMainAccount)
      }
      
      // 将选中的账户设为主账户
      this.currentAccountId = accountId
      this.cardInfo = { ...account.cardInfo }
      this.transactions = [...account.transactions]
      
      // 从 accounts 列表中移除已切换为主账户的账户
      this.accounts.splice(accountIndex, 1)
    },
    
    addTransaction(transaction: Omit<BankTransaction, 'id'>) {
      const newTransaction: BankTransaction = {
        ...transaction,
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      }
      
      // 如果交易没有cardNumber，自动添加当前卡的后4位
      if (!newTransaction.cardNumber && this.viewMode === 'single') {
        const currentCard = this.cardInfo.cardNumber.replace(/[^\d]/g, '')
        newTransaction.cardNumber = currentCard.slice(-4)
      }
      
      // 如果交易没有cardType，自动添加当前卡类型
      if (!newTransaction.cardType && this.viewMode === 'single') {
        newTransaction.cardType = this.cardInfo.cardType
      }
      
      this.transactions.unshift(newTransaction)
    },
    
    removeTransaction(id: string) {
      const index = this.transactions.findIndex(t => t.id === id)
      if (index !== -1) {
        this.transactions.splice(index, 1)
      }
    },
    
    clearAllTransactions() {
      this.transactions = []
    },
    
    updateCardInfo(info: Partial<BankCardInfo>, syncToOtherAccounts: boolean = true) {
      this.cardInfo = { ...this.cardInfo, ...info }
      
      // 同步共享字段到其他账户
      if (syncToOtherAccounts && this.accounts.length > 0) {
        // 定义需要同步的共享字段（这些字段在所有账户之间应该保持一致）
        const sharedFields: (keyof BankCardInfo)[] = [
          'cardHolder',
          'cardHolderPhoto',
          'bank',
          'branch',
          'bankAddress',
          'bankPhone',
          'bankWebsite',
          'billingAddress',
          'currency',
          'customerID'
        ]
        
        // 提取需要同步的字段
        const sharedUpdates: Partial<BankCardInfo> = {}
        for (const field of sharedFields) {
          if (field in info) {
            sharedUpdates[field] = info[field] as any
          }
        }
        
        // 如果有共享字段被更新，同步到其他账户
        if (Object.keys(sharedUpdates).length > 0) {
          this.accounts.forEach(acc => {
            acc.cardInfo = { ...acc.cardInfo, ...sharedUpdates }
          })
        }
      }
    },
    
    updateSettings(settings: Partial<StatementSettings>) {
      this.settings = { ...this.settings, ...settings }
    },

    // 从保存的数据中计算上期期末余额作为本期期初余额
    // yearMonth 格式: 'YYYY-MM' (如 '2024-01')
    // savedDocuments: 从数据库加载的已保存文档列表
    calculateOpeningBalanceFromHistory(
      yearMonth: string, 
      savedDocuments: Array<{ name: string; data: any; updated_at?: string }>
    ): { 
      found: boolean; 
      openingBalance: number; 
      previousPeriod: string;
      previousClosingBalance: number;
      source: 'previous_month' | 'previous_year' | 'not_found'
    } {
      const [year, month] = yearMonth.split('-').map(Number)
      
      // 计算上个月
      const prevMonth = month === 1 ? 12 : month - 1
      const prevMonthYear = month === 1 ? year - 1 : year
      const prevMonthKey = `${prevMonthYear}-${String(prevMonth).padStart(2, '0')}`
      
      // 计算上一年同期
      const prevYearKey = `${year - 1}-${String(month).padStart(2, '0')}`
      
      // 当前账户的卡号后4位用于匹配
      const currentCardLast4 = this.cardInfo.cardNumber.replace(/[^\d]/g, '').slice(-4)
      
      // 遍历已保存的文档，查找匹配的上期数据
      for (const doc of savedDocuments) {
        if (!doc.data) continue
        
        const docData = doc.data
        const docCardInfo = docData.cardInfo || {}
        const docSettings = docData.settings || {}
        
        // 检查卡号是否匹配（后4位）
        const docCardLast4 = (docCardInfo.cardNumber || '').replace(/[^\d]/g, '').slice(-4)
        if (docCardLast4 !== currentCardLast4) continue
        
        // 获取文档的账单期间
        const docPeriod = docSettings.statementPeriod || ''
        
        // 优先匹配上个月的数据
        if (docPeriod === prevMonthKey) {
          // 计算该文档的期末余额
          const openingBalance = docCardInfo.openingBalance || 0
          const interest = docCardInfo.interestEarned || 0
          const transactions = docData.transactions || []
          const income = transactions
            .filter((t: any) => t.amount > 0)
            .reduce((sum: number, t: any) => sum + t.amount, 0)
          const spent = transactions
            .filter((t: any) => t.amount < 0)
            .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
          
          const closingBalance = openingBalance + income + interest - spent
          
          return {
            found: true,
            openingBalance: closingBalance,
            previousPeriod: prevMonthKey,
            previousClosingBalance: closingBalance,
            source: 'previous_month'
          }
        }
      }
      
      // 如果是1月份，尝试查找去年12月的数据
      if (month === 1) {
        for (const doc of savedDocuments) {
          if (!doc.data) continue
          
          const docData = doc.data
          const docCardInfo = docData.cardInfo || {}
          const docSettings = docData.settings || {}
          
          const docCardLast4 = (docCardInfo.cardNumber || '').replace(/[^\d]/g, '').slice(-4)
          if (docCardLast4 !== currentCardLast4) continue
          
          const docPeriod = docSettings.statementPeriod || ''
          
          // 匹配去年12月
          if (docPeriod === prevMonthKey) {
            const openingBalance = docCardInfo.openingBalance || 0
            const interest = docCardInfo.interestEarned || 0
            const transactions = docData.transactions || []
            const income = transactions
              .filter((t: any) => t.amount > 0)
              .reduce((sum: number, t: any) => sum + t.amount, 0)
            const spent = transactions
              .filter((t: any) => t.amount < 0)
              .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
            
            const closingBalance = openingBalance + income + interest - spent
            
            return {
              found: true,
              openingBalance: closingBalance,
              previousPeriod: prevMonthKey,
              previousClosingBalance: closingBalance,
              source: 'previous_year'
            }
          }
        }
      }
      
      // 如果找不到上个月，尝试查找去年同期的数据作为参考
      for (const doc of savedDocuments) {
        if (!doc.data) continue
        
        const docData = doc.data
        const docCardInfo = docData.cardInfo || {}
        const docSettings = docData.settings || {}
        
        const docCardLast4 = (docCardInfo.cardNumber || '').replace(/[^\d]/g, '').slice(-4)
        if (docCardLast4 !== currentCardLast4) continue
        
        const docPeriod = docSettings.statementPeriod || ''
        
        // 匹配去年同期
        if (docPeriod === prevYearKey) {
          const closingBalance = docCardInfo.closingBalance || docCardInfo.openingBalance || 0
          
          return {
            found: true,
            openingBalance: closingBalance,
            previousPeriod: prevYearKey,
            previousClosingBalance: closingBalance,
            source: 'previous_year'
          }
        }
      }
      
      return {
        found: false,
        openingBalance: 0,
        previousPeriod: '',
        previousClosingBalance: 0,
        source: 'not_found'
      }
    },

    // 自动填充期初余额（基于历史数据）
    async autoFillOpeningBalance(savedDocuments: Array<{ name: string; data: any; updated_at?: string }>): Promise<{
      success: boolean;
      message: string;
      previousPeriod?: string;
      amount?: number;
    }> {
      const currentPeriod = this.settings.statementPeriod
      if (!currentPeriod) {
        return { success: false, message: '请先设置账单期间' }
      }

      const result = this.calculateOpeningBalanceFromHistory(currentPeriod, savedDocuments)
      
      if (result.found) {
        this.cardInfo.openingBalance = result.openingBalance
        
        const sourceText = result.source === 'previous_month' ? '上月期末余额' : '去年同期余额'
        return {
          success: true,
          message: `已自动填充期初余额：基于${result.previousPeriod}的${sourceText} ¥${result.openingBalance.toFixed(2)}`,
          previousPeriod: result.previousPeriod,
          amount: result.openingBalance
        }
      }
      
      return {
        success: false,
        message: `未找到同一卡号的历史数据，请手动输入期初余额。建议先保存上期对账单。`
      }
    }
  }
})
