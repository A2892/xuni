<template>
  <div class="items-uploader">
    <!-- 上传区域 -->
    <div class="upload-section">
      <div class="upload-header">
        <h4>{{ title }}</h4>
        <div class="header-actions">
          <StudentDocumentPicker 
            v-if="showDocumentPicker"
            :button-text="documentPickerButtonText"
            :title="documentPickerTitle"
            :accept="['xlsx', 'xls', 'csv', 'pdf', 'docx', 'jpg', 'jpeg', 'png']"
            @select="handleDocumentSelect"
          />
          <button @click="downloadTemplate" class="btn-template">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载Excel模板
          </button>
        </div>
      </div>
      
      <div class="upload-area" 
           @drop.prevent="handleDrop" 
           @dragover.prevent="isDragging = true"
           @dragleave="isDragging = false"
           :class="{ dragging: isDragging }">
        <input type="file" ref="fileInputRef" @change="handleFileSelect" accept=".csv,.xlsx,.xls" class="hidden-input" />
        <div class="upload-content" @click="triggerFileInput">
          <div class="upload-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <p class="upload-text">点击或拖拽文件到此处</p>
          <p class="upload-hint">支持 CSV、Excel 文件</p>
        </div>
      </div>
      
      <!-- 上传状态 -->
      <div v-if="uploadStatus" class="upload-status" :class="uploadStatus.type">
        <span class="status-icon">{{ uploadStatus.type === 'success' ? '✓' : uploadStatus.type === 'error' ? '✕' : '⟳' }}</span>
        <span class="status-text">{{ uploadStatus.message }}</span>
      </div>
      
      <!-- 预览数据 -->
      <div v-if="previewData.length > 0" class="preview-section">
        <div class="preview-header">
          <span>识别到 {{ previewData.length }} 条数据</span>
          <div class="preview-actions">
            <button @click="clearPreview" class="btn-cancel">取消</button>
            <button @click="confirmImport" class="btn-confirm">确认导入</button>
          </div>
        </div>
        <div class="preview-table-wrapper">
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in previewData.slice(0, 5)" :key="index">
                <td v-for="col in columns" :key="col.key">{{ row[col.key] }}</td>
              </tr>
              <tr v-if="previewData.length > 5" class="more-row">
                <td :colspan="columns.length">... 还有 {{ previewData.length - 5 }} 条数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import StudentDocumentPicker from '@/components/StudentDocumentPicker.vue'

const props = defineProps<{
  type: 'invoice' | 'flight' | 'flightSegment' | 'utilityBill' | 'receipt'
  billType?: 'electricity' | 'water' | 'gas' | 'internet' | 'phone' | 'combined'
}>()

const emit = defineEmits(['import'])

const fileInputRef = ref<HTMLInputElement>()
const isDragging = ref(false)
const uploadStatus = ref<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null)
const previewData = ref<any[]>([])

// 是否显示资料库选择按钮
const showDocumentPicker = computed(() => {
  return ['invoice', 'utilityBill', 'flightSegment', 'receipt'].includes(props.type)
})

// 资料库选择按钮文本
const documentPickerButtonText = computed(() => {
  const texts: Record<string, string> = {
    invoice: '从资料管理导入',
    utilityBill: '从资料管理导入',
    flightSegment: '从资料管理导入',
    receipt: '从资料管理导入'
  }
  return texts[props.type] || '从资料管理导入'
})

// 资料库选择弹窗标题
const documentPickerTitle = computed(() => {
  const titles: Record<string, string> = {
    invoice: '从资料管理选择发票数据',
    utilityBill: '从资料管理选择账单数据',
    flightSegment: '从资料管理选择航班数据',
    receipt: '从资料管理选择收据数据'
  }
  return titles[props.type] || '从资料管理选择数据'
})

// 处理从资料管理选择的文档
async function handleDocumentSelect(document: any) {
  if (!document) return
  
  try {
    // 如果文档有 file_url，尝试解析文件内容
    if (document.file_url) {
      uploadStatus.value = { type: 'loading', message: '正在解析文档...' }
      
      // 尝试下载并解析文件
      const response = await fetch(document.file_url)
      const blob = await response.blob()
      const file = new File([blob], document.file_name || 'document', { type: blob.type })
      
      // 使用现有的文件处理逻辑
      await processFile(file)
    } else {
      uploadStatus.value = { type: 'error', message: '该文档没有可解析的文件' }
    }
  } catch (e) {
    console.error('处理文档失败:', e)
    uploadStatus.value = { type: 'error', message: '解析文档失败，请确保文件格式正确' }
  }
}

const title = computed(() => {
  if (props.type === 'invoice') return '批量导入项目'
  if (props.type === 'flight') return '批量导入乘客'
  if (props.type === 'flightSegment') return '批量导入航班信息'
  if (props.type === 'utilityBill') return '批量导入费用项目'
  if (props.type === 'receipt') return '批量导入商品'
  return '批量导入'
})

const columns = computed(() => {
  if (props.type === 'invoice') {
    return [
      { key: 'sku', label: 'SKU' },
      { key: 'description', label: '描述' },
      { key: 'category', label: '分类' },
      { key: 'unit', label: '单位' },
      { key: 'quantity', label: '数量' },
      { key: 'unitPrice', label: '单价' },
      { key: 'tax', label: '税率' },
      { key: 'discount', label: '折扣' },
      { key: 'notes', label: '备注' }
    ]
  }
  if (props.type === 'flight') {
    return [
      { key: 'firstName', label: '名' },
      { key: 'lastName', label: '姓' },
      { key: 'title', label: '称谓' },
      { key: 'dateOfBirth', label: '出生日期' },
      { key: 'passportNumber', label: '护照号' },
      { key: 'nationality', label: '国籍' }
    ]
  }
  if (props.type === 'flightSegment') {
    return [
      { key: 'flightNumber', label: '航班号' },
      { key: 'airline', label: '航空公司' },
      { key: 'departureCity', label: '出发城市' },
      { key: 'departureAirport', label: '出发机场' },
      { key: 'departureDate', label: '出发日期' },
      { key: 'departureTime', label: '出发时间' },
      { key: 'arrivalCity', label: '到达城市' },
      { key: 'arrivalAirport', label: '到达机场' }
    ]
  }
  if (props.type === 'utilityBill') {
    return [
      { key: 'description', label: '费用名称' },
      { key: 'usage', label: '用量' },
      { key: 'unit', label: '单位' },
      { key: 'rate', label: '单价' },
      { key: 'amount', label: '金额' }
    ]
  }
  if (props.type === 'receipt') {
    return [
      { key: 'name', label: '商品名称' },
      { key: 'nameEn', label: '英文名称' },
      { key: 'quantity', label: '数量' },
      { key: 'unitPrice', label: '单价' },
      { key: 'sku', label: 'SKU' },
      { key: 'category', label: '分类' },
      { key: 'notes', label: '备注' }
    ]
  }
  return []
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 下载模板 (xlsx格式)
const downloadTemplate = () => {
  let data: any[] = []
  let filename = ''
  
  if (props.type === 'invoice') {
    data = [
      { sku: 'SVC-001', description: '网站设计服务', category: '服务', unit: 'project', quantity: 1, unitPrice: 5000, tax: 13, discount: 0, notes: '包含3轮修改' },
      { sku: 'DES-001', description: 'Logo设计', category: '设计', unit: 'package', quantity: 1, unitPrice: 1500, tax: 13, discount: 10, notes: 'VIP折扣' },
      { sku: 'MKT-001', description: 'SEO优化', category: '营销', unit: 'service', quantity: 3, unitPrice: 800, tax: 13, discount: 0, notes: '' }
    ]
    filename = 'invoice_items_template.xlsx'
  } else if (props.type === 'flight') {
    data = [
      { firstName: 'JOHN', lastName: 'DOE', title: 'MR', dateOfBirth: '1985-06-15', passportNumber: 'G12345678', nationality: 'United States' },
      { firstName: 'JANE', lastName: 'DOE', title: 'MS', dateOfBirth: '1988-03-22', passportNumber: 'G87654321', nationality: 'United States' }
    ]
    filename = 'passenger_template.xlsx'
  } else if (props.type === 'flightSegment') {
    data = [
      { 
        flightNumber: 'CA123', airline: 'Air China', aircraft: 'Boeing 777-300ER',
        departureCity: 'Beijing', departureAirport: 'PEK', departureTerminal: 'T3', departureGate: 'G12',
        departureDate: '2026-02-15', departureTime: '08:30',
        arrivalCity: 'Los Angeles', arrivalAirport: 'LAX', arrivalTerminal: 'TBIT',
        arrivalDate: '2026-02-15', arrivalTime: '05:45',
        duration: '12h 15m', class: 'business', seatNumber: '5A', baggage: '2 x 32kg'
      },
      { 
        flightNumber: 'UA857', airline: 'United Airlines', aircraft: 'Boeing 787-9',
        departureCity: 'Los Angeles', departureAirport: 'LAX', departureTerminal: 'Terminal 7', departureGate: 'Gate 75',
        departureDate: '2026-02-20', departureTime: '10:30',
        arrivalCity: 'Tokyo', arrivalAirport: 'NRT', arrivalTerminal: 'Terminal 1',
        arrivalDate: '2026-02-21', arrivalTime: '14:45',
        duration: '11h 15m', class: 'economy', seatNumber: '32K', baggage: '1 x 23kg'
      }
    ]
    filename = 'flight_segment_template.xlsx'
  } else if (props.type === 'utilityBill') {
    const billType = props.billType || 'electricity'
    
    if (billType === 'electricity') {
      data = [
        { description: 'Electric Generation', usage: 850, unit: 'kWh', rate: 0.12543, amount: 106.62 },
        { description: 'Electric Distribution', usage: 850, unit: 'kWh', rate: 0.08234, amount: 69.99 },
        { description: 'Public Purpose Programs', usage: 850, unit: 'kWh', rate: 0.01245, amount: 10.58 },
        { description: 'Nuclear Decommissioning', usage: 850, unit: 'kWh', rate: 0.00123, amount: 1.05 }
      ]
      filename = 'electricity_bill_template.xlsx'
    } else if (billType === 'water') {
      data = [
        { description: 'Water Usage', usage: 3500, unit: 'gal', rate: 0.0065, amount: 22.75 },
        { description: 'Sewer Service', usage: 3500, unit: 'gal', rate: 0.0048, amount: 16.80 },
        { description: 'Water Infrastructure', usage: 1, unit: 'flat', rate: 8.50, amount: 8.50 }
      ]
      filename = 'water_bill_template.xlsx'
    } else if (billType === 'gas') {
      data = [
        { description: 'Gas Commodity', usage: 45, unit: 'therm', rate: 0.95, amount: 42.75 },
        { description: 'Gas Transportation', usage: 45, unit: 'therm', rate: 0.35, amount: 15.75 },
        { description: 'Customer Charge', usage: 1, unit: 'flat', rate: 12.50, amount: 12.50 }
      ]
      filename = 'gas_bill_template.xlsx'
    } else if (billType === 'internet') {
      data = [
        { description: 'Internet Service - Premium', usage: 1, unit: 'month', rate: 79.99, amount: 79.99 },
        { description: 'Equipment Rental', usage: 1, unit: 'month', rate: 10.00, amount: 10.00 },
        { description: 'WiFi Router Fee', usage: 1, unit: 'month', rate: 5.00, amount: 5.00 }
      ]
      filename = 'internet_bill_template.xlsx'
    } else if (billType === 'phone') {
      data = [
        { description: 'Monthly Plan', usage: 1, unit: 'month', rate: 45.00, amount: 45.00 },
        { description: 'Long Distance Calls', usage: 120, unit: 'min', rate: 0.05, amount: 6.00 },
        { description: 'International Calls', usage: 30, unit: 'min', rate: 0.25, amount: 7.50 }
      ]
      filename = 'phone_bill_template.xlsx'
    } else {
      data = [
        { description: 'Electric Service', usage: 850, unit: 'kWh', rate: 0.15, amount: 127.50 },
        { description: 'Water Service', usage: 3500, unit: 'gal', rate: 0.006, amount: 21.00 },
        { description: 'Gas Service', usage: 45, unit: 'therm', rate: 1.20, amount: 54.00 }
      ]
      filename = 'utility_bill_template.xlsx'
    }
  } else if (props.type === 'receipt') {
    data = [
      { name: '美式咖啡', nameEn: 'Americano', quantity: 2, unitPrice: 28.00, sku: 'CAFE-001', category: '咖啡', notes: '大杯/少冰' },
      { name: '拿铁', nameEn: 'Latte', quantity: 1, unitPrice: 32.00, sku: 'CAFE-002', category: '咖啡', notes: '燕麦奶' },
      { name: '提拉米苏蛋糕', nameEn: 'Tiramisu Cake', quantity: 1, unitPrice: 58.00, sku: 'FOOD-001', category: '甜品', notes: '' }
    ]
    filename = 'receipt_items_template.xlsx'
  }
  
  // 创建工作簿和工作表
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  
  // 设置列宽
  const colWidths = columns.value.map(col => ({ wch: Math.max(col.label.length * 2, 15) }))
  ws['!cols'] = colWidths
  
  // 下载文件
  XLSX.writeFile(wb, filename)
}

// 处理文件拖放
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0 && files[0]) {
    processFile(files[0])
  }
}

// 处理文件选择
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0 && input.files[0]) {
    processFile(input.files[0])
  }
}

// 处理文件
const processFile = async (file: File) => {
  uploadStatus.value = { type: 'loading', message: '正在解析文件...' }
  
  try {
    const fileName = file.name.toLowerCase()
    let rows: string[][] = []
    
    // 根据文件类型选择解析方式
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // 解析 Excel 文件
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]
      rows = jsonData
    } else {
      // 解析 CSV 文件
      const text = await file.text()
      rows = parseCSV(text)
    }
    
    if (rows.length < 2) {
      throw new Error('文件格式错误或无有效数据')
    }
    
    const headerRow = rows[0]
    if (!headerRow) throw new Error('文件缺少表头')
    const headers = headerRow.map(h => String(h).trim().toLowerCase())
    const data: any[] = []
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0 || row.every(cell => !String(cell).trim())) continue
      
      const item: any = {}
      if (props.type === 'invoice') {
        item.sku = String(row[headers.indexOf('sku')] || row[0] || '')
        item.description = String(row[headers.indexOf('description')] || row[1] || '')
        item.category = String(row[headers.indexOf('category')] || row[2] || '')
        item.unit = String(row[headers.indexOf('unit')] || row[3] || 'pcs')
        item.quantity = parseFloat(String(row[headers.indexOf('quantity')] || row[4] || '1')) || 1
        item.unitPrice = parseFloat(String(row[headers.indexOf('unitprice')] || row[5] || '0')) || 0
        item.tax = parseFloat(String(row[headers.indexOf('tax')] || row[6] || '0')) || 0
        item.discount = parseFloat(String(row[headers.indexOf('discount')] || row[7] || '0')) || 0
        item.notes = String(row[headers.indexOf('notes')] || row[8] || '')
      } else if (props.type === 'flight') {
        item.firstName = row[headers.indexOf('firstname')] || row[0] || ''
        item.lastName = row[headers.indexOf('lastname')] || row[1] || ''
        item.title = row[headers.indexOf('title')] || row[2] || 'MR'
        item.dateOfBirth = row[headers.indexOf('dateofbirth')] || row[3] || ''
        item.passportNumber = row[headers.indexOf('passportnumber')] || row[4] || ''
        item.nationality = row[headers.indexOf('nationality')] || row[5] || ''
      } else if (props.type === 'flightSegment') {
        item.flightNumber = String(row[headers.indexOf('flightnumber')] || row[0] || '')
        item.airline = String(row[headers.indexOf('airline')] || row[1] || '')
        item.aircraft = String(row[headers.indexOf('aircraft')] || row[2] || '')
        item.departureCity = String(row[headers.indexOf('departurecity')] || row[3] || '')
        item.departureAirport = String(row[headers.indexOf('departureairport')] || row[4] || '')
        item.departureTerminal = String(row[headers.indexOf('departureterminal')] || row[5] || '')
        item.departureGate = String(row[headers.indexOf('departuregate')] || row[6] || '')
        item.departureDate = String(row[headers.indexOf('departuredate')] || row[7] || '')
        item.departureTime = String(row[headers.indexOf('departuretime')] || row[8] || '')
        item.arrivalCity = String(row[headers.indexOf('arrivalcity')] || row[9] || '')
        item.arrivalAirport = String(row[headers.indexOf('arrivalairport')] || row[10] || '')
        item.arrivalTerminal = String(row[headers.indexOf('arrivalterminal')] || row[11] || '')
        item.arrivalDate = String(row[headers.indexOf('arrivaldate')] || row[12] || '')
        item.arrivalTime = String(row[headers.indexOf('arrivaltime')] || row[13] || '')
        item.duration = String(row[headers.indexOf('duration')] || row[14] || '')
        item.class = String(row[headers.indexOf('class')] || row[15] || 'economy')
        item.seatNumber = String(row[headers.indexOf('seatnumber')] || row[16] || '')
        item.baggage = String(row[headers.indexOf('baggage')] || row[17] || '1 x 23kg')
      } else if (props.type === 'utilityBill') {
        item.description = row[headers.indexOf('description')] || row[0] || ''
        item.usage = parseFloat(String(row[headers.indexOf('usage')] || row[1] || '0')) || 0
        item.unit = row[headers.indexOf('unit')] || row[2] || ''
        item.rate = parseFloat(String(row[headers.indexOf('rate')] || row[3] || '0')) || 0
        item.amount = parseFloat(String(row[headers.indexOf('amount')] || row[4] || '0')) || 0
      } else if (props.type === 'receipt') {
        item.name = String(row[headers.indexOf('name')] || row[0] || '')
        item.nameEn = String(row[headers.indexOf('nameen')] || row[1] || '')
        item.quantity = parseFloat(String(row[headers.indexOf('quantity')] || row[2] || '1')) || 1
        item.unitPrice = parseFloat(String(row[headers.indexOf('unitprice')] || row[3] || '0')) || 0
        item.sku = String(row[headers.indexOf('sku')] || row[4] || '')
        item.category = String(row[headers.indexOf('category')] || row[5] || '')
        item.notes = String(row[headers.indexOf('notes')] || row[6] || '')
      }
      
      data.push(item)
    }
    
    previewData.value = data
    uploadStatus.value = { type: 'success', message: `成功解析 ${data.length} 条数据` }
  } catch (error: any) {
    uploadStatus.value = { type: 'error', message: error.message || '解析失败' }
    previewData.value = []
  }
}

// 解析 CSV
const parseCSV = (text: string): string[][] => {
  const lines = text.split(/\r?\n/)
  return lines.map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  })
}

// 清除预览
const clearPreview = () => {
  previewData.value = []
  uploadStatus.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// 确认导入
const confirmImport = () => {
  emit('import', previewData.value)
  clearPreview()
  uploadStatus.value = { type: 'success', message: '导入成功！' }
  setTimeout(() => { uploadStatus.value = null }, 2000)
}
</script>

<style scoped>
.items-uploader {
  margin-bottom: 16px;
}

.upload-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.upload-header h4 {
  margin: 0;
  font-size: 14px;
  color: #374151;
}

.btn-template {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-template:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.upload-area:hover,
.upload-area.dragging {
  border-color: #2563eb;
  background: #eff6ff;
}

.hidden-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  color: #9ca3af;
}

.upload-text {
  margin: 0;
  font-size: 14px;
  color: #374151;
}

.upload-hint {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.upload-status.success {
  background: #d1fae5;
  color: #065f46;
}

.upload-status.error {
  background: #fee2e2;
  color: #991b1b;
}

.upload-status.loading {
  background: #dbeafe;
  color: #1e40af;
}

.preview-section {
  margin-top: 16px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  color: #374151;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.btn-cancel,
.btn-confirm {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.btn-confirm {
  background: #2563eb;
  border: none;
  color: white;
}

.btn-confirm:hover {
  background: #1d4ed8;
}

.preview-table-wrapper {
  overflow-x: auto;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.preview-table th,
.preview-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.preview-table th {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 500;
}

.more-row td {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
