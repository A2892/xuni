<template>
  <div class="ai-assist-panel">
    <div class="ai-header" @click="toggleExpanded">
      <div class="ai-title">
        <span class="ai-icon">🤖</span>
        <span>AI 智能填写助手</span>
      </div>
      <span class="expand-icon">{{ expanded ? '▼' : '▶' }}</span>
    </div>
    
    <div v-show="expanded" class="ai-content">
      <div class="ai-description">
        <p>输入关键词，AI将自动生成符合要求的数据</p>
      </div>
      
      <div class="ai-input-group">
        <textarea 
          v-model="prompt" 
          class="ai-textarea"
          :placeholder="placeholderText"
          rows="3"
        ></textarea>
      </div>
      
      <div class="ai-options">
        <div class="option-row">
          <label class="option-label">数据数量</label>
          <select v-model="dataCount" class="option-select">
            <option :value="5">5条</option>
            <option :value="10">10条</option>
            <option :value="20">20条</option>
            <option :value="30">30条</option>
            <option :value="50">50条</option>
          </select>
        </div>
        
        <div class="option-row" v-if="showDateRange">
          <label class="option-label">日期范围</label>
          <div class="date-inputs">
            <input type="date" v-model="startDate" class="date-input" />
            <span>至</span>
            <input type="date" v-model="endDate" class="date-input" />
          </div>
        </div>
      </div>
      
      <div class="ai-presets" v-if="presets.length > 0">
        <span class="presets-label">快捷指令：</span>
        <div class="preset-tags">
          <button 
            v-for="preset in presets" 
            :key="preset.label"
            class="preset-tag"
            @click="usePreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>
      
      <div class="ai-actions">
        <button 
          class="btn-generate"
          :class="{ loading: generating }"
          :disabled="generating"
          @click="handleGenerate"
        >
          <span v-if="generating">
            <span class="spinner"></span>
            生成中...
          </span>
          <span v-else>✨ 一键生成</span>
        </button>
        <button 
          class="btn-clear"
          @click="clearData"
          :disabled="generating"
        >
          🗑️ 清空数据
        </button>
      </div>
      
      <div v-if="lastGenerated" class="ai-result">
        <span class="result-icon">✅</span>
        <span>已生成 {{ lastGenerated }} 条数据</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  type: string
  showDateRange?: boolean
  presets?: Array<{ label: string; prompt: string; count?: number }>
}>()

const emit = defineEmits<{
  (e: 'generate', data: { prompt: string; count: number; startDate: string; endDate: string }): void
  (e: 'clear'): void
}>()

const expanded = ref(true)
const prompt = ref('')
const dataCount = ref(20)
const startDate = ref('')
const endDate = ref('')
const generating = ref(false)
const lastGenerated = ref<number | null>(null)

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const placeholderText = computed(() => {
  switch (props.type) {
    case 'bank_statement':
      return '例如：生成12月的日常消费流水、包含工资收入和购物消费...'
    case 'invoice':
      return '例如：生成一张软件开发服务发票...'
    case 'payslip':
      return '例如：生成2024年12月的工资单...'
    case 'tax':
      return '例如：生成2024年度个人所得税申报表...'
    case 'medical':
      return '例如：生成一份体检报告...'
    case 'resume':
      return '例如：生成一份前端工程师简历...'
    case 'flight':
      return '例如：生成北京到上海的航班信息...'
    case 'hotel':
      return '例如：生成上海五星级酒店预订信息...'
    default:
      return '输入关键词描述您需要生成的内容...'
  }
})

const presets = computed(() => {
  const defaultPresets: Record<string, Array<{ label: string; prompt: string; count?: number }>> = {
    bank_statement: [
      { label: '12月日常流水', prompt: '12月 日常消费 包含工资收入 餐饮 购物 交通', count: 30 },
      { label: '季度汇总', prompt: '第四季度 10月到12月 日常消费 工资', count: 50 },
      { label: '购物消费', prompt: '本月 购物消费 电商 商场', count: 15 },
      { label: '工资入账', prompt: '本月 工资 奖金 收入', count: 5 }
    ],
    invoice: [
      { label: '咨询服务', prompt: '技术咨询服务费' },
      { label: '软件开发', prompt: '软件开发项目费用' },
      { label: '设备采购', prompt: '办公设备采购' }
    ],
    payslip: [
      { label: '12月工资', prompt: '2024年12月 工资单' },
      { label: '年终奖', prompt: '年终奖 奖金' }
    ],
    flight: [
      { label: '国内航班', prompt: '北京 上海 经济舱' },
      { label: '国际航班', prompt: '北京 洛杉矶 商务舱' }
    ],
    hotel: [
      { label: '商务出差', prompt: '上海 五星级 商务' },
      { label: '度假旅游', prompt: '三亚 度假村 海景房' }
    ]
  }
  
  return props.presets || defaultPresets[props.type] || []
})

const usePreset = (preset: { label: string; prompt: string; count?: number }) => {
  prompt.value = preset.prompt
  if (preset.count) {
    dataCount.value = preset.count
  }
}

const handleGenerate = async () => {
  if (!prompt.value.trim()) {
    alert('请输入关键词描述')
    return
  }
  
  generating.value = true
  lastGenerated.value = null
  
  // 模拟生成延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  emit('generate', {
    prompt: prompt.value,
    count: dataCount.value,
    startDate: startDate.value,
    endDate: endDate.value
  })
  
  lastGenerated.value = dataCount.value
  generating.value = false
}

const clearData = () => {
  if (confirm('确定要清空所有数据吗？')) {
    emit('clear')
    lastGenerated.value = null
  }
}

// 初始化日期
const initDates = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  startDate.value = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  endDate.value = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
}

initDates()
</script>

<style scoped>
.ai-assist-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  color: white;
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.ai-icon {
  font-size: 18px;
}

.expand-icon {
  font-size: 12px;
  transition: transform 0.2s;
}

.ai-content {
  background: white;
  padding: 16px;
}

.ai-description {
  color: #666;
  font-size: 13px;
  margin-bottom: 12px;
}

.ai-description p {
  margin: 0;
}

.ai-input-group {
  margin-bottom: 12px;
}

.ai-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s;
  font-family: inherit;
}

.ai-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.ai-textarea::placeholder {
  color: #999;
}

.ai-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.option-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: white;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
}

.ai-presets {
  margin-bottom: 12px;
}

.presets-label {
  font-size: 12px;
  color: #888;
  display: block;
  margin-bottom: 8px;
}

.preset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-tag {
  padding: 6px 12px;
  background: #f0f4ff;
  border: 1px solid #d0daff;
  border-radius: 20px;
  font-size: 12px;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-tag:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.ai-actions {
  display: flex;
  gap: 10px;
}

.btn-generate {
  flex: 1;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-generate:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-generate.loading {
  background: #888;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-clear {
  padding: 12px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover:not(:disabled) {
  background: #ff4757;
  color: white;
  border-color: #ff4757;
}

.ai-result {
  margin-top: 12px;
  padding: 10px 14px;
  background: #e8f5e9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #2e7d32;
}

.result-icon {
  font-size: 16px;
}
</style>
