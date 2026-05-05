// 成绩单解析工具

export interface ParsedCourse {
  code: string
  name: string
  credits: number
  grade: string
  semester: string
  year: string
  status: string
}

/**
 * 从PDF文本中提取课程信息
 */
export function parseTranscriptText(text: string): ParsedCourse[] {
  const courses: ParsedCourse[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  // 常见的学期模式
  const semesterPattern = /(Fall|Spring|Summer|Winter)\s*(\d{4})-?(\d{4})?/gi
  const semesterPatterns = [
    /Fall\s+(\d{4})-(\d{4})/i,
    /Spring\s+(\d{4})-(\d{4})/i,
    /Summer\s+(\d{4})-(\d{4})/i,
    /Winter\s+(\d{4})-(\d{4})/i,
  ]
  
  let currentSemester = 'Fall'
  let currentYear = '2023-2024'
  
  // 遍历每一行
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 检测学期信息
    for (const pattern of semesterPatterns) {
      const match = line.match(pattern)
      if (match) {
        currentSemester = match[0].split(' ')[0]
        currentYear = `${match[1]}-${match[2]}`
        break
      }
    }
    
    // 尝试匹配课程行
    // 模式1: 课程代码 课程名称 学分 成绩
    const pattern1 = /^([A-Z]{2,6}\d{3,4})\s+(.+?)\s+(\d+)\s+([A-F][+-]?|A|B|C|D|F)\s+/i
    const match1 = line.match(pattern1)
    if (match1) {
      courses.push({
        code: match1[1],
        name: match1[2].trim(),
        credits: parseInt(match1[3]),
        grade: match1[4],
        semester: currentSemester,
        year: currentYear,
        status: '已完成'
      })
      continue
    }
    
    // 模式2: 表格形式 - 代码在一列，名称在另一列
    const codeMatch = line.match(/^([A-Z]{2,6}\d{3,4})$/i)
    if (codeMatch && i + 1 < lines.length) {
      const nextLine = lines[i + 1]
      // 查找学分和成绩
      let credits = 3
      let grade = 'A'
      
      // 向后查找几行寻找学分和成绩
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const testLine = lines[j]
        const creditsMatch = testLine.match(/\b(\d+)\b/)
        const gradeMatch = testLine.match(/\b([A-F][+-]?)\b/i)
        
        if (creditsMatch && !testLine.match(/^\d{4}$/)) {
          credits = parseInt(creditsMatch[1])
        }
        if (gradeMatch) {
          grade = gradeMatch[1]
        }
      }
      
      courses.push({
        code: codeMatch[1],
        name: nextLine,
        credits: credits,
        grade: grade,
        semester: currentSemester,
        year: currentYear,
        status: '已完成'
      })
    }
  }
  
  return courses
}

/**
 * 从图片文本中智能解析课程
 */
export function smartParseCourses(text: string): ParsedCourse[] {
  const courses: ParsedCourse[] = []
  
  // 按行分割
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  let currentSemester = 'Fall'
  let currentYear = '2022-2023'
  let currentGPA = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 检测学期标题
    if (line.match(/Fall\s+\d{4}-\d{4}/i)) {
      const match = line.match(/(Fall|Spring|Summer)\s+(\d{4})-(\d{4})/i)
      if (match) {
        currentSemester = match[1]
        currentYear = `${match[2]}-${match[3]}`
      }
      
      // 提取GPA
      const gpaMatch = line.match(/GPA[:\s]*([0-9.]+)/i)
      if (gpaMatch) {
        currentGPA = gpaMatch[1]
      }
      continue
    }
    
    if (line.match(/Spring\s+\d{4}-\d{4}/i)) {
      const match = line.match(/(Fall|Spring|Summer)\s+(\d{4})-(\d{4})/i)
      if (match) {
        currentSemester = match[1]
        currentYear = `${match[2]}-${match[3]}`
      }
      const gpaMatch = line.match(/GPA[:\s]*([0-9.]+)/i)
      if (gpaMatch) {
        currentGPA = gpaMatch[1]
      }
      continue
    }
    
    if (line.match(/Summer\s+\d{4}-\d{4}/i)) {
      const match = line.match(/(Fall|Spring|Summer)\s+(\d{4})-(\d{4})/i)
      if (match) {
        currentSemester = match[1]
        currentYear = `${match[2]}-${match[3]}`
      }
      const gpaMatch = line.match(/GPA[:\s]*([0-9.]+)/i)
      if (gpaMatch) {
        currentGPA = gpaMatch[1]
      }
      continue
    }
    
    // 匹配课程行: 代码 课程名 学分 成绩 分数
    // 例如: CS101 Introduction to Economics 3 A 4.0
    const coursePattern = /^([A-Z]{2,6}\d{2,4})\s+(.+?)\s+(\d+)\s+([A-F][+-]?)\s+([0-9.]+)$/i
    const match = line.match(coursePattern)
    
    if (match) {
      courses.push({
        code: match[1],
        name: match[2].trim(),
        credits: parseInt(match[3]),
        grade: match[4],
        semester: currentSemester,
        year: currentYear,
        status: '已完成'
      })
    }
  }
  
  return courses
}

/**
 * 从文件读取文本（支持PDF、图片OCR、Excel、Word）
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type
  const fileName = file.name.toLowerCase()
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    // PDF处理
    return await extractTextFromPDF(file)
  } else if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
    // 图片OCR处理
    return await extractTextFromImage(file)
  } else if (fileType.includes('spreadsheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    // Excel处理
    return await extractTextFromExcel(file)
  } else if (fileType.includes('wordprocessing') || fileName.endsWith('.docx')) {
    // Word处理
    return await extractTextFromWord(file)
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    // 纯文本
    return await readAsText(file)
  }
  
  throw new Error('不支持的文件类型')
}

/**
 * 读取文本文件
 */
async function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

/**
 * 从PDF提取文本
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // 简化版：读取文件并尝试提取文本
  // 注意：完整的PDF解析需要pdf.js库
  const arrayBuffer = await file.arrayBuffer()
  const text = new TextDecoder().decode(arrayBuffer)
  
  // 基础文本提取（PDF内嵌文本）
  const textMatch = text.match(/BT\s*(.+?)\s*ET/gs)
  if (textMatch) {
    return textMatch.map(t => t.replace(/BT|ET|Tf|Td|Tj|\(|\)|\\|[0-9.]+\s+/g, ' ')).join('\n')
  }
  
  return text
}

/**
 * 从图片提取文本（OCR）
 */
async function extractTextFromImage(file: File): Promise<string> {
  try {
    // 动态导入 Tesseract.js
    const Tesseract = await import('tesseract.js')
    
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR进度: ${Math.round(m.progress * 100)}%`)
        }
      }
    })
    
    return text
  } catch (error) {
    console.error('OCR识别失败:', error)
    // 如果OCR失败，返回提示信息
    return '图片OCR识别失败。请确保图片清晰，或尝试复制文本后使用"粘贴文本"功能。'
  }
}

/**
 * 从Excel提取文本
 */
async function extractTextFromExcel(file: File): Promise<string> {
  try {
    // 动态导入 xlsx
    const XLSX = await import('xlsx')
    
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    
    let allText = ''
    
    // 遍历所有工作表
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
      
      // 将每行转换为文本
      jsonData.forEach(row => {
        if (row && row.length > 0) {
          allText += row.join('\t') + '\n'
        }
      })
    })
    
    return allText
  } catch (error) {
    console.error('Excel解析失败:', error)
    throw new Error('Excel文件解析失败，请检查文件格式')
  }
}

/**
 * 从Word文档提取文本
 */
async function extractTextFromWord(file: File): Promise<string> {
  try {
    // 动态导入 mammoth
    const mammoth = await import('mammoth')
    
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    
    return result.value
  } catch (error) {
    console.error('Word解析失败:', error)
    throw new Error('Word文档解析失败，请检查文件格式')
  }
}

/**
 * 从剪贴板文本解析课程
 */
export function parseFromClipboard(text: string): ParsedCourse[] {
  // 先尝试智能解析
  const smartResult = smartParseCourses(text)
  if (smartResult.length > 0) {
    return smartResult
  }
  
  // 如果智能解析失败，使用通用解析
  return parseTranscriptText(text)
}
