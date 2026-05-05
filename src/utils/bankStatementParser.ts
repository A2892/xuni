import * as XLSX from 'xlsx'
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import type { BankTransaction } from '@/stores/bank'

// Set PDF.js worker
// Using unpkg as it reliably mirrors npm versions
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

export interface DetectedAccount {
  cardNumber: string
  cardType?: string
  transactions: BankTransaction[]
}

export const downloadTransactionTemplate = () => {
  const headers = [
    'Date (YYYY-MM-DD)',
    'Merchant',
    'Category',
    'Amount',
    'Currency',
    'Status',
    'Location',
    'Payment Method',
    'Description',
    'Card Type',
    'Card Number'
  ]
  
  const exampleRow = [
    '2024-01-15',
    'Starbucks',
    'Food & Dining',
    '-12.50',
    'USD',
    'completed',
    'New York, NY',
    'Visa ****1234',
    'Coffee',
    'Visa',
    '4111111111111111'
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions')
  XLSX.writeFile(wb, 'transaction_template.xlsx')
}

export const parseBankStatementFile = async (file: File): Promise<{ 
  transactions: BankTransaction[]
  detectedAccounts: DetectedAccount[] // 新增：检测到的多个账户
  detectedCardNumber?: string
  detectedCardType?: string 
}> => {
  const fileType = file.name.split('.').pop()?.toLowerCase()

  switch (fileType) {
    case 'xlsx':
    case 'xls':
      return parseExcel(file)
    case 'pdf':
      return parsePDF(file)
    case 'docx':
      return parseWord(file)
    case 'png':
    case 'jpg':
    case 'jpeg':
      return parseImage(file)
    default:
      throw new Error('Unsupported file format')
  }
}

const parseExcel = async (file: File): Promise<{ 
  transactions: BankTransaction[]
  detectedAccounts: DetectedAccount[]
  detectedCardNumber?: string
  detectedCardType?: string 
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        // Remove header row
        const rows = jsonData.slice(1)
        
        const transactions: BankTransaction[] = rows.map((row, index) => {
          if (!row || row.length === 0) return null
          return {
            id: `imported_${Date.now()}_${index}`,
            date: formatDate(row[0]),
            merchant: row[1] || 'Unknown Merchant',
            category: row[2] || 'Other',
            amount: parseFloat(row[3]) || 0,
            currency: row[4] || 'USD',
            status: (row[5] || 'completed').toLowerCase(),
            location: row[6] || '',
            paymentMethod: row[7] || '',
            description: row[8] || '',
            cardType: row[9] || '',
            cardNumber: row[10] || ''
          } as BankTransaction
        }).filter(t => t !== null) as BankTransaction[]

        // Try to detect card number and type from first non-empty row
        let detectedCardNumber: string | undefined
        let detectedCardType: string | undefined
        for (const r of rows) {
          if (!r || r.length === 0) continue
          const potentialNumber = String(r[10] || '').replace(/\s+/g, '')
          if (potentialNumber && /\d{13,19}/.test(potentialNumber)) {
            detectedCardNumber = potentialNumber
            detectedCardType = String(r[9] || '').trim() || undefined
            break
          }
        }

        // 新增：按卡号分组所有交易，检测多个账户
        const detectedAccounts = groupTransactionsByCard(transactions)

        resolve({ transactions, detectedAccounts, detectedCardNumber, detectedCardType })
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

const parsePDF = async (file: File): Promise<{ 
  transactions: BankTransaction[]
  detectedAccounts: DetectedAccount[]
  detectedCardNumber?: string
  detectedCardType?: string 
}> => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item: any) => item.str).join(' ')
    fullText += pageText + '\n'
  }

  return parseTextContent(fullText)
}

const parseWord = async (file: File): Promise<{ 
  transactions: BankTransaction[]
  detectedAccounts: DetectedAccount[]
  detectedCardNumber?: string
  detectedCardType?: string 
}> => {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return parseTextContent(result.value)
}

const parseImage = async (file: File): Promise<{ 
  transactions: BankTransaction[]
  detectedAccounts: DetectedAccount[]
  detectedCardNumber?: string
  detectedCardType?: string 
}> => {
  const result = await Tesseract.recognize(file, 'eng+chi_sim', {
    logger: m => console.log(m)
  })
  return parseTextContent(result.data.text)
}

// Helper to parse unstructured text using regex
const parseTextContent = (text: string): { 
  transactions: BankTransaction[]
  detectedAccounts: DetectedAccount[]
  detectedCardNumber?: string
  detectedCardType?: string 
} => {
  const transactions: BankTransaction[] = []
  const lines = text.split('\n')
  
  // Regex to find Date, Merchant (optional), Amount
  // Supports: 2024-01-01 or 01/01/2024
  // Amount: -100.00 or 100.00
  const dateRegex = /(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/
  const amountRegex = /(-?\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/
  
  let detectedCardNumber: string | undefined
  let detectedCardType: string | undefined

  lines.forEach((line, index) => {
    const dateMatch = line.match(dateRegex)
    const amountMatch = line.match(amountRegex)
    
    if (dateMatch && amountMatch) {
      const date = dateMatch[0]
      const amountStr = amountMatch[0].replace(/[$,]/g, '')
      const amount = parseFloat(amountStr)
      
      // Try to extract merchant/description by removing date and amount
      let description = line.replace(date, '').replace(amountMatch[0], '').trim()
      // Clean up extra spaces and common noise
      description = description.replace(/\s+/g, ' ').trim()
      
      if (description.length > 0) {
        transactions.push({
          id: `parsed_${Date.now()}_${index}`,
          date: formatDate(date),
          merchant: description,
          category: 'Other', // Default category
          amount: amount,
          currency: 'USD', // Default currency
          status: 'completed',
          location: 'Unknown',
          paymentMethod: 'Unknown',
          description: description
        })
      }
    }

    // Try to detect card number in the line (13-19 digits possibly with spaces or masked with ****)
    const cardNumMatch = line.match(/(?:\b|\D)(?:\*+\d{2,4}|\d[\d \-]{11,}\d)(?:\b|\D)/)
    if (cardNumMatch && !detectedCardNumber) {
      const cleaned = cardNumMatch[0].replace(/[^\d]/g, '')
      if (/\d{13,19}/.test(cleaned)) {
        detectedCardNumber = cleaned
      }
    }

    // Detect card type keywords - enhanced detection for specific card tiers
    if (!detectedCardType) {
      const lower = line.toLowerCase()
      // Visa variants
      if (lower.includes('visa infinite')) detectedCardType = 'visa_infinite'
      else if (lower.includes('visa signature')) detectedCardType = 'visa_signature'
      else if (lower.includes('visa platinum')) detectedCardType = 'visa_platinum'
      else if (lower.includes('visa gold')) detectedCardType = 'visa_gold'
      else if (lower.includes('visa debit')) detectedCardType = 'visa_debit'
      else if (lower.includes('visa')) detectedCardType = 'visa'
      // Mastercard variants
      else if (lower.includes('mastercard world elite') || lower.includes('mc world elite')) detectedCardType = 'mastercard_world_elite'
      else if (lower.includes('mastercard world') || lower.includes('mc world')) detectedCardType = 'mastercard_world'
      else if (lower.includes('mastercard platinum') || lower.includes('mc platinum')) detectedCardType = 'mastercard_platinum'
      else if (lower.includes('mastercard gold') || lower.includes('mc gold')) detectedCardType = 'mastercard_gold'
      else if (lower.includes('mastercard') || lower.includes('master card')) detectedCardType = 'mastercard'
      // Amex variants
      else if (lower.includes('centurion') || lower.includes('black card')) detectedCardType = 'amex_centurion'
      else if (lower.includes('amex platinum') || lower.includes('american express platinum')) detectedCardType = 'amex_platinum'
      else if (lower.includes('amex gold') || lower.includes('american express gold')) detectedCardType = 'amex_gold'
      else if (lower.includes('amex green') || lower.includes('american express green')) detectedCardType = 'amex_green'
      else if (lower.includes('american express') || lower.includes('amex')) detectedCardType = 'amex'
      // UnionPay variants
      else if (lower.includes('unionpay diamond') || lower.includes('银联钻石')) detectedCardType = 'unionpay_diamond'
      else if (lower.includes('unionpay platinum') || lower.includes('银联白金')) detectedCardType = 'unionpay_platinum'
      else if (lower.includes('unionpay') || lower.includes('银联')) detectedCardType = 'unionpay'
      // Other card networks
      else if (lower.includes('discover')) detectedCardType = 'discover'
      else if (lower.includes('diners') || lower.includes('diners club')) detectedCardType = 'diners'
      else if (lower.includes('jcb')) detectedCardType = 'jcb'
    }
  })
  
  // 按卡号分组
  const detectedAccounts = groupTransactionsByCard(transactions)
  
  return { transactions, detectedAccounts, detectedCardNumber, detectedCardType }
}

const formatDate = (rawDate: any): string => {
  if (!rawDate) return new Date().toISOString().split('T')[0]
  
  // Handle Excel serial date
  if (typeof rawDate === 'number') {
    const date = new Date(Math.round((rawDate - 25569) * 86400 * 1000))
    return date.toISOString().split('T')[0]
  }
  
  // Handle string dates
  const date = new Date(rawDate)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]
  }
  
  return rawDate
}
// 新增：按卡号分组交易，识别多个账户
const groupTransactionsByCard = (transactions: BankTransaction[]): DetectedAccount[] => {
  const cardMap = new Map<string, { cardType?: string; transactions: BankTransaction[] }>()

  transactions.forEach(transaction => {
    const cardNumber = transaction.cardNumber
    if (!cardNumber) return

    // 清理卡号（移除空格、星号等）
    const cleanedCard = cardNumber.replace(/[^\d]/g, '')
    if (!cleanedCard || cleanedCard.length < 4) return

    // 使用完整卡号或后4位作为分组键
    const cardKey = cleanedCard.length >= 13 ? cleanedCard : cleanedCard.slice(-4)

    if (!cardMap.has(cardKey)) {
      cardMap.set(cardKey, {
        cardType: transaction.cardType,
        transactions: []
      })
    }

    const group = cardMap.get(cardKey)!
    group.transactions.push(transaction)

    // 如果还没有cardType但当前交易有，更新它
    if (!group.cardType && transaction.cardType) {
      group.cardType = transaction.cardType
    }
  })

  const detectedAccounts: DetectedAccount[] = []
  cardMap.forEach((value, cardNumber) => {
    detectedAccounts.push({
      cardNumber,
      cardType: value.cardType,
      transactions: value.transactions
    })
  })

  return detectedAccounts
}