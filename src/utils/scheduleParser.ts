// 课程表解析工具

export interface ParsedScheduleCourse {
  name: string
  code: string
  instructor: string
  location: string
  credits: number
  department: string
  classroom: string
  startTime: string
  endTime: string
  mode: string
  type: string
  days: string[]
  notes: string
}

/**
 * 从文本中解析课程表信息
 */
export function parseScheduleText(text: string): ParsedScheduleCourse[] {
  const courses: ParsedScheduleCourse[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  // 星期映射
  const dayMap: Record<string, string> = {
    '周一': 'monday', '星期一': 'monday', 'Monday': 'monday', 'Mon': 'monday',
    '周二': 'tuesday', '星期二': 'tuesday', 'Tuesday': 'tuesday', 'Tue': 'tuesday',
    '周三': 'wednesday', '星期三': 'wednesday', 'Wednesday': 'wednesday', 'Wed': 'wednesday',
    '周四': 'thursday', '星期四': 'thursday', 'Thursday': 'thursday', 'Thu': 'thursday',
    '周五': 'friday', '星期五': 'friday', 'Friday': 'friday', 'Fri': 'friday',
    '周六': 'saturday', '星期六': 'saturday', 'Saturday': 'saturday', 'Sat': 'saturday',
    '周日': 'sunday', '星期日': 'sunday', 'Sunday': 'sunday', 'Sun': 'sunday'
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 模式1: 课程代码 课程名称 教师 时间 地点
    // 例如: CS101 Introduction to Computer Science Prof. Smith Mon 9:00-10:30 SCI 101
    const pattern1 = /^([A-Z]{2,6}\d{3,4})\s+(.+?)\s+(Prof\.|Dr\.|TA\s+)?([A-Za-z\s]+?)\s+(Mon|Tue|Wed|Thu|Fri|Sat|Sun|周[一二三四五六日])\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s+(.+)$/i
    const match1 = line.match(pattern1)
    
    if (match1) {
      const [, code, name, title, instructor, day, startTime, endTime, location] = match1
      const days = [dayMap[day] || 'monday']
      
      courses.push({
        name: name.trim(),
        code: code.trim(),
        instructor: `${title || ''}${instructor}`.trim(),
        location: location.trim(),
        credits: 3,
        department: 'School of Computer Science',
        classroom: location.trim(),
        startTime,
        endTime,
        mode: 'Offline',
        type: 'Lecture',
        days,
        notes: ''
      })
      continue
    }
    
    // 模式2: 表格形式的课程信息
    // 课程代码\t课程名称\t教师\t星期\t时间\t地点
    const parts = line.split(/\t|,|\|/).map(p => p.trim())
    if (parts.length >= 5) {
      const code = parts[0].match(/[A-Z]{2,6}\d{3,4}/i)?.[0]
      if (code) {
        const name = parts[1] || parts[0].replace(code, '').trim()
        const instructor = parts[2] || 'TBA'
        const dayStr = parts[3] || 'Monday'
        const timeStr = parts[4] || '9:00-10:30'
        const location = parts[5] || 'TBA'
        
        // 解析时间
        const timeMatch = timeStr.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
        const startTime = timeMatch?.[1] || '9:00'
        const endTime = timeMatch?.[2] || '10:30'
        
        // 解析星期
        const days: string[] = []
        Object.entries(dayMap).forEach(([key, value]) => {
          if (dayStr.includes(key)) {
            days.push(value)
          }
        })
        if (days.length === 0) days.push('monday')
        
        courses.push({
          name,
          code,
          instructor,
          location,
          credits: 3,
          department: 'School of Computer Science',
          classroom: location,
          startTime,
          endTime,
          mode: 'Offline',
          type: 'Lecture',
          days,
          notes: ''
        })
      }
    }
  }
  
  return courses
}

/**
 * 从Excel数据解析课程表
 */
export function parseScheduleFromExcel(text: string): ParsedScheduleCourse[] {
  const courses: ParsedScheduleCourse[] = []
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  // 跳过表头
  let startIndex = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/课程代码|Course Code|课程名|Course Name/i)) {
      startIndex = i + 1
      break
    }
  }
  
  const dayMap: Record<string, string> = {
    '周一': 'monday', '星期一': 'monday', 'Monday': 'monday', 'Mon': 'monday', '1': 'monday',
    '周二': 'tuesday', '星期二': 'tuesday', 'Tuesday': 'tuesday', 'Tue': 'tuesday', '2': 'tuesday',
    '周三': 'wednesday', '星期三': 'wednesday', 'Wednesday': 'wednesday', 'Wed': 'wednesday', '3': 'wednesday',
    '周四': 'thursday', '星期四': 'thursday', 'Thursday': 'thursday', 'Thu': 'thursday', '4': 'thursday',
    '周五': 'friday', '星期五': 'friday', 'Friday': 'friday', 'Fri': 'friday', '5': 'friday',
    '周六': 'saturday', '星期六': 'saturday', 'Saturday': 'saturday', 'Sat': 'saturday', '6': 'saturday',
    '周日': 'sunday', '星期日': 'sunday', 'Sunday': 'sunday', 'Sun': 'sunday', '7': 'sunday'
  }
  
  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split('\t').map(p => p.trim())
    if (parts.length < 3) continue
    
    const code = parts[0]
    const name = parts[1]
    const instructor = parts[2] || 'TBA'
    const dayStr = parts[3] || 'Monday'
    const timeStr = parts[4] || '9:00-10:30'
    const location = parts[5] || 'TBA'
    
    if (!code.match(/[A-Z]{2,6}\d{3,4}/i)) continue
    
    // 解析时间
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
    const startTime = timeMatch?.[1] || '9:00'
    const endTime = timeMatch?.[2] || '10:30'
    
    // 解析星期
    const days: string[] = []
    Object.entries(dayMap).forEach(([key, value]) => {
      if (dayStr.includes(key)) {
        days.push(value)
      }
    })
    if (days.length === 0) days.push('monday')
    
    courses.push({
      name,
      code,
      instructor,
      location,
      credits: 3,
      department: 'School of Computer Science',
      classroom: location,
      startTime,
      endTime,
      mode: 'Offline',
      type: 'Lecture',
      days,
      notes: ''
    })
  }
  
  return courses
}
