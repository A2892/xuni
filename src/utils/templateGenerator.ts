// Excel模板生成工具

/**
 * 生成成绩单Excel模板
 */
export async function downloadTranscriptTemplate() {
  const XLSX = await import('xlsx')
  
  // 创建工作表数据
  const data = [
    ['课程代码', '课程名称', '学分', '成绩', '学期', '学年'],
    ['CS101', 'Introduction to Computer Science', '3', 'A', 'Fall', '2022-2023'],
    ['MATH201', 'Calculus I', '4', 'B+', 'Fall', '2022-2023'],
    ['ENG105', 'Academic Writing', '3', 'A-', 'Fall', '2022-2023'],
    ['PHYS101', 'Physics for Scientists and Engineers', '4', 'B', 'Fall', '2022-2023'],
    ['', '', '', '', '', ''],
    ['说明：'],
    ['1. 课程代码：如 CS101, MATH201（必填）'],
    ['2. 课程名称：完整的课程名称（必填）'],
    ['3. 学分：数字，如 3, 4（必填）'],
    ['4. 成绩：A, A-, B+, B, B-, C+, C, C-, D, F 等（必填）'],
    ['5. 学期：Fall, Spring, Summer, Winter（必填）'],
    ['6. 学年：如 2022-2023, 2023-2024（必填）'],
    ['7. 填写完成后，保存并在系统中点击"导入文件"上传']
  ]
  
  // 创建工作簿
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)
  
  // 设置列宽
  ws['!cols'] = [
    { wch: 12 },  // 课程代码
    { wch: 40 },  // 课程名称
    { wch: 8 },   // 学分
    { wch: 8 },   // 成绩
    { wch: 10 },  // 学期
    { wch: 12 }   // 学年
  ]
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '成绩单模板')
  
  // 下载文件
  XLSX.writeFile(wb, '成绩单导入模板.xlsx')
}

/**
 * 生成课程表Excel模板
 */
export async function downloadScheduleTemplate() {
  const XLSX = await import('xlsx')
  
  // 创建工作表数据
  const data = [
    ['课程代码', '课程名称', '教师', '星期', '时间', '地点', '学分', '授课模式', '课程类型', '备注'],
    ['CS101', 'Introduction to Computer Science', 'Prof. John Smith', '周一', '09:00-10:30', 'SCI 101', '3', '线下', '讲座', 'Bring your laptop'],
    ['MATH201', 'Calculus II', 'Dr. Sarah Johnson', '周二', '11:00-12:30', 'MATH 305', '4', '线下', '讲座', ''],
    ['CS101L', 'Intro to CS Lab', 'TA Michael Brown', '周五', '14:00-16:00', 'SCI B12', '1', '线下', '实验', ''],
    ['ENG105', 'Academic Writing', 'Prof. Emily Davis', '周一,周三', '15:30-17:00', 'Online', '3', '线上', '研讨', 'Zoom link provided'],
    ['', '', '', '', '', '', '', '', '', ''],
    ['说明：'],
    ['1. 课程代码：如 CS101, MATH201（必填）'],
    ['2. 课程名称：完整的课程名称（必填）'],
    ['3. 教师：教师姓名，如 Prof. Smith（必填）'],
    ['4. 星期：周一/Monday/Mon, 周二/Tuesday/Tue, 多天用逗号分隔（必填）'],
    ['5. 时间：格式 HH:MM-HH:MM，如 09:00-10:30（必填）'],
    ['6. 地点：教室位置，如 SCI 101 或 Online（必填）'],
    ['7. 学分：数字，如 3, 4（必填）'],
    ['8. 授课模式：线下/线上/混合（选填，默认：线下）'],
    ['9. 课程类型：讲座/实验/研讨（选填，默认：讲座）'],
    ['10. 备注：其他说明信息（选填）'],
    ['11. 填写完成后，保存并在系统中点击"导入文件"上传']
  ]
  
  // 创建工作簿
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)
  
  // 设置列宽
  ws['!cols'] = [
    { wch: 12 },  // 课程代码
    { wch: 35 },  // 课程名称
    { wch: 20 },  // 教师
    { wch: 12 },  // 星期
    { wch: 15 },  // 时间
    { wch: 15 },  // 地点
    { wch: 8 },   // 学分
    { wch: 10 },  // 授课模式
    { wch: 10 },  // 课程类型
    { wch: 25 }   // 备注
  ]
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '课程表模板')
  
  // 下载文件
  XLSX.writeFile(wb, '课程表导入模板.xlsx')
}
