<template>
  <div class="batch-generator-panel">
    <h3 class="panel-title">🔄 批量生成</h3>
    
    <div class="generator-options">
      <!-- 生成数量 -->
      <div class="option-group">
        <label>生成数量</label>
        <div class="quantity-input">
          <button @click="quantity = Math.max(1, quantity - 1)" class="qty-btn">-</button>
          <input v-model.number="quantity" type="number" min="1" max="100" />
          <button @click="quantity = Math.min(100, quantity + 1)" class="qty-btn">+</button>
        </div>
        <small class="hint">最多100条</small>
      </div>

      <!-- 数据变化选项 -->
      <div class="option-group">
        <label>数据变化规则</label>
        <div class="variation-options">
          <label class="checkbox-option">
            <input type="checkbox" v-model="variations.date" />
            <span>日期递增</span>
          </label>
          <label class="checkbox-option">
            <input type="checkbox" v-model="variations.number" />
            <span>编号递增</span>
          </label>
          <label class="checkbox-option">
            <input type="checkbox" v-model="variations.amount" />
            <span>金额随机波动</span>
          </label>
          <label class="checkbox-option">
            <input type="checkbox" v-model="variations.name" />
            <span>姓名随机</span>
          </label>
        </div>
      </div>

      <!-- 日期范围 -->
      <div v-if="variations.date" class="option-group">
        <label>日期范围</label>
        <div class="date-range">
          <input v-model="dateRange.start" type="date" />
          <span>至</span>
          <input v-model="dateRange.end" type="date" />
        </div>
      </div>

      <!-- 金额波动 -->
      <div v-if="variations.amount" class="option-group">
        <label>金额波动范围 (%)</label>
        <div class="range-slider">
          <input 
            v-model.number="amountVariation" 
            type="range" 
            min="0" 
            max="50" 
            step="5"
          />
          <span class="range-value">± {{ amountVariation }}%</span>
        </div>
      </div>

      <!-- 输出格式 -->
      <div class="option-group">
        <label>输出格式</label>
        <select v-model="outputFormat">
          <option value="images">独立图片 (ZIP)</option>
          <option value="pdf">合并PDF</option>
          <option value="json">JSON数据</option>
          <option value="excel">Excel表格</option>
        </select>
      </div>

      <!-- 生成按钮 -->
      <div class="action-buttons">
        <button 
          @click="handleGenerate" 
          class="btn-generate"
          :disabled="isGenerating"
        >
          <span v-if="isGenerating">
            ⏳ 生成中... {{ progress }}/{{ quantity }}
          </span>
          <span v-else>🚀 开始批量生成</span>
        </button>
        <button 
          v-if="isGenerating" 
          @click="cancelGeneration" 
          class="btn-cancel"
        >
          取消
        </button>
      </div>

      <!-- 进度条 -->
      <div v-if="isGenerating" class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- 预览区域 -->
    <div v-if="previewData.length > 0" class="preview-section">
      <h4>预览数据 (前3条)</h4>
      <div class="preview-list">
        <div v-for="(item, index) in previewData.slice(0, 3)" :key="index" class="preview-item">
          <span class="preview-index">#{{ index + 1 }}</span>
          <span class="preview-content">{{ item.summary }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  dataGenerator: (index: number, options: any) => any
  renderPreview?: (data: any) => Promise<Blob>
}>()

const emit = defineEmits(['generate-complete', 'generate-error'])

const quantity = ref(5)
const variations = ref({
  date: true,
  number: true,
  amount: false,
  name: false
})
const dateRange = ref({
  start: new Date().toISOString().split('T')[0],
  end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
})
const amountVariation = ref(10)
const outputFormat = ref('images')
const isGenerating = ref(false)
const progress = ref(0)
const previewData = ref<any[]>([])
const shouldCancel = ref(false)

const progressPercent = computed(() => {
  return Math.round((progress.value / quantity.value) * 100)
})

// 随机中文姓名生成
const generateRandomName = () => {
  const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '朱', '马', '胡', '郭', '林', '何', '高', '梁']
  const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋', '艳', '勇', '军', '杰', '涛', '明', '超', '秀兰', '霞', '平']
  return surnames[Math.floor(Math.random() * surnames.length)] + 
         names[Math.floor(Math.random() * names.length)] +
         (Math.random() > 0.5 ? names[Math.floor(Math.random() * names.length)] : '')
}

// 生成日期
const generateDate = (index: number) => {
  const start = new Date(dateRange.value.start).getTime()
  const end = new Date(dateRange.value.end).getTime()
  const step = (end - start) / (quantity.value - 1 || 1)
  return new Date(start + step * index).toISOString().split('T')[0]
}

// 金额波动
const applyAmountVariation = (amount: number) => {
  const factor = 1 + (Math.random() * 2 - 1) * (amountVariation.value / 100)
  return Math.round(amount * factor * 100) / 100
}

const handleGenerate = async () => {
  isGenerating.value = true
  progress.value = 0
  shouldCancel.value = false
  previewData.value = []

  try {
    const results: any[] = []

    for (let i = 0; i < quantity.value; i++) {
      if (shouldCancel.value) break

      const options = {
        index: i,
        date: variations.value.date ? generateDate(i) : undefined,
        number: variations.value.number ? `${String(i + 1).padStart(4, '0')}` : undefined,
        name: variations.value.name ? generateRandomName() : undefined,
        amountFactor: variations.value.amount ? (1 + (Math.random() * 2 - 1) * (amountVariation.value / 100)) : 1
      }

      const data = props.dataGenerator(i, options)
      results.push(data)

      // 预览数据
      if (i < 3) {
        previewData.value.push({
          summary: data.summary || `项目 #${i + 1}`,
          data
        })
      }

      progress.value = i + 1

      // 避免阻塞 UI
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // 根据输出格式处理
    if (outputFormat.value === 'json') {
      downloadJSON(results)
    } else if (outputFormat.value === 'excel') {
      downloadExcel(results)
    }

    emit('generate-complete', results)
  } catch (error) {
    console.error('Batch generation failed:', error)
    emit('generate-error', error)
  } finally {
    isGenerating.value = false
  }
}

const cancelGeneration = () => {
  shouldCancel.value = true
}

const downloadJSON = (data: any[]) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `batch_export_${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const downloadExcel = (data: any[]) => {
  // 简单的 CSV 导出
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `batch_export_${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.batch-generator-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.generator-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-group > label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.quantity-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: #e9ecef;
}

.quantity-input input {
  width: 80px;
  text-align: center;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
}

.hint {
  font-size: 11px;
  color: #999;
}

.variation-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.checkbox-option:hover {
  background: #e9ecef;
}

.checkbox-option input {
  accent-color: #667eea;
}

.checkbox-option span {
  font-size: 13px;
  color: #333;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-range input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
}

.date-range span {
  color: #999;
}

.range-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-slider input {
  flex: 1;
  accent-color: #667eea;
}

.range-value {
  min-width: 60px;
  text-align: right;
  font-size: 13px;
  font-weight: 500;
  color: #667eea;
}

.option-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
  background: white;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-generate {
  flex: 1;
  padding: 14px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-generate:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 14px 20px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #fee;
  color: #c00;
  border-color: #fcc;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.preview-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.preview-section h4 {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin: 0 0 12px 0;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
}

.preview-index {
  font-weight: 600;
  color: #667eea;
}

.preview-content {
  color: #333;
}
</style>
