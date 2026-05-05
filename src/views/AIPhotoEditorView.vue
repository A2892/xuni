<template>
  <div class="ai-photo-editor">
    <div class="editor-container">
      <!-- 左侧：工作区 -->
      <div class="workspace">
        <!-- 图片上传/显示区域 -->
        <div class="image-area">
          <div v-if="!currentImage" class="upload-zone" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
            <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display: none" />
            <div class="upload-content">
              <div class="upload-icon">🖼️</div>
              <h3>上传照片开始编辑</h3>
              <p>点击上传或拖拽图片到此处</p>
              <p class="upload-hint">支持 JPG, PNG, WebP 格式</p>
            </div>
          </div>
          
          <div v-else class="image-display">
            <div class="image-toolbar">
              <button @click="triggerUpload" class="tool-btn" title="上传新图片">
                <span>📁</span> 上传
              </button>
              <button @click="resetToOriginal" class="tool-btn" title="恢复原图">
                <span>↩️</span> 原图
              </button>
              <button @click="undoEdit" :disabled="historyIndex <= 0" class="tool-btn" title="撤销">
                <span>⬅️</span> 撤销
              </button>
              <button @click="redoEdit" :disabled="historyIndex >= editHistory.length - 1" class="tool-btn" title="重做">
                <span>➡️</span> 重做
              </button>
              <div class="toolbar-divider"></div>
              <button @click="downloadImage" class="tool-btn primary" title="下载图片">
                <span>💾</span> 下载
              </button>
            </div>
            
            <div class="image-wrapper">
              <img :src="currentImage" alt="编辑中的图片" ref="imageRef" />
              <div v-if="isProcessing" class="processing-overlay">
                <div class="processing-spinner"></div>
                <p>{{ processingText }}</p>
              </div>
            </div>
            
            <div class="image-info">
              <span>📐 {{ imageInfo.width }} × {{ imageInfo.height }}</span>
              <span>📄 {{ imageInfo.size }}</span>
              <span v-if="editHistory.length > 1">✏️ {{ editHistory.length - 1 }} 次编辑</span>
            </div>
          </div>
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display: none" />
        </div>
      </div>
      
      <!-- 右侧：AI对话和工具面板 -->
      <div class="side-panel">
        <!-- AI对话区域 -->
        <div class="chat-section">
          <div class="section-header">
            <h3>🤖 AI 图片编辑助手</h3>
          </div>
          
          <div class="chat-messages" ref="chatContainer">
            <div v-for="(msg, index) in chatMessages" :key="index" :class="['chat-message', msg.role]">
              <div class="message-avatar">
                {{ msg.role === 'user' ? '👤' : '🤖' }}
              </div>
              <div class="message-content">
                <div class="message-text">{{ msg.content }}</div>
                <img v-if="msg.image" :src="msg.image" class="message-image" />
                <div v-if="msg.timestamp" class="message-time">{{ formatTime(msg.timestamp) }}</div>
              </div>
            </div>
            
            <div v-if="isTyping" class="chat-message assistant">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="chat-input-area">
            <textarea 
              v-model="userInput" 
              placeholder="描述您想要的修改效果..."
              @keydown.enter.exact.prevent="sendMessage"
              :disabled="!currentImage || isProcessing"
              rows="2"
            ></textarea>
            <button 
              @click="sendMessage" 
              :disabled="!userInput.trim() || !currentImage || isProcessing"
              class="send-btn"
            >
              发送
            </button>
          </div>
        </div>
        
        <!-- 快速编辑工具 -->
        <div class="tools-section">
          <div class="section-header">
            <h3>⚡ 快捷编辑</h3>
          </div>
          
          <div class="quick-tools">
            <div class="tool-category">
              <h4>🎨 基础调整</h4>
              <div class="tool-grid">
                <button @click="applyQuickEdit('enhance')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">✨</span>
                  <span class="tool-name">智能增强</span>
                </button>
                <button @click="applyQuickEdit('brighten')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">☀️</span>
                  <span class="tool-name">提亮</span>
                </button>
                <button @click="applyQuickEdit('contrast')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">🔲</span>
                  <span class="tool-name">对比度</span>
                </button>
                <button @click="applyQuickEdit('sharpen')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">🔍</span>
                  <span class="tool-name">锐化</span>
                </button>
              </div>
            </div>
            
            <div class="tool-category">
              <h4>🖌️ 风格滤镜</h4>
              <div class="tool-grid">
                <button @click="applyQuickEdit('vintage')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">📷</span>
                  <span class="tool-name">复古</span>
                </button>
                <button @click="applyQuickEdit('bw')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">⬛</span>
                  <span class="tool-name">黑白</span>
                </button>
                <button @click="applyQuickEdit('warm')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">🔥</span>
                  <span class="tool-name">暖色调</span>
                </button>
                <button @click="applyQuickEdit('cool')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">❄️</span>
                  <span class="tool-name">冷色调</span>
                </button>
              </div>
            </div>
            
            <div class="tool-category">
              <h4>🪄 AI 功能</h4>
              <div class="tool-grid">
                <button @click="applyQuickEdit('remove_bg')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">🎭</span>
                  <span class="tool-name">去背景</span>
                </button>
                <button @click="applyQuickEdit('face_enhance')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">👤</span>
                  <span class="tool-name">美颜</span>
                </button>
                <button @click="applyQuickEdit('upscale')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">📐</span>
                  <span class="tool-name">超分辨率</span>
                </button>
                <button @click="applyQuickEdit('denoise')" :disabled="!currentImage || isProcessing" class="quick-tool-btn">
                  <span class="tool-icon">🔇</span>
                  <span class="tool-name">降噪</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 手动调整滑块 -->
        <div class="adjustments-section">
          <div class="section-header">
            <h3>🎚️ 手动调整</h3>
            <button @click="resetAdjustments" class="reset-btn">重置</button>
          </div>
          
          <div class="adjustment-sliders">
            <div class="slider-group">
              <label>
                <span>亮度</span>
                <span class="slider-value">{{ adjustments.brightness }}%</span>
              </label>
              <input type="range" v-model.number="adjustments.brightness" min="0" max="200" @change="applyAdjustments" :disabled="!currentImage" />
            </div>
            <div class="slider-group">
              <label>
                <span>对比度</span>
                <span class="slider-value">{{ adjustments.contrast }}%</span>
              </label>
              <input type="range" v-model.number="adjustments.contrast" min="0" max="200" @change="applyAdjustments" :disabled="!currentImage" />
            </div>
            <div class="slider-group">
              <label>
                <span>饱和度</span>
                <span class="slider-value">{{ adjustments.saturation }}%</span>
              </label>
              <input type="range" v-model.number="adjustments.saturation" min="0" max="200" @change="applyAdjustments" :disabled="!currentImage" />
            </div>
            <div class="slider-group">
              <label>
                <span>色相</span>
                <span class="slider-value">{{ adjustments.hue }}°</span>
              </label>
              <input type="range" v-model.number="adjustments.hue" min="0" max="360" @change="applyAdjustments" :disabled="!currentImage" />
            </div>
            <div class="slider-group">
              <label>
                <span>模糊</span>
                <span class="slider-value">{{ adjustments.blur }}px</span>
              </label>
              <input type="range" v-model.number="adjustments.blur" min="0" max="20" @change="applyAdjustments" :disabled="!currentImage" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- API 设置弹窗 -->
    <div v-if="showApiSettings" class="modal-overlay" @click.self="showApiSettings = false">
      <div class="modal-content">
        <h3>🔑 API 设置</h3>
        <p class="modal-desc">配置 AI 图片编辑服务的 API 密钥</p>
        
        <div class="form-group">
          <label>API 提供商</label>
          <select v-model="apiProvider">
            <option value="openai">OpenAI (DALL-E)</option>
            <option value="stability">Stability AI</option>
            <option value="replicate">Replicate</option>
            <option value="local">本地处理（无需API）</option>
          </select>
        </div>
        
        <div v-if="apiProvider !== 'local'" class="form-group">
          <label>API Key</label>
          <input type="password" v-model="apiKey" placeholder="输入您的 API 密钥" />
        </div>
        
        <div class="modal-actions">
          <button @click="showApiSettings = false" class="btn-secondary">取消</button>
          <button @click="saveApiSettings" class="btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  image?: string
  timestamp: Date
}

interface ImageInfo {
  width: number
  height: number
  size: string
}

// 状态
const currentImage = ref<string | null>(null)
const originalImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const chatContainer = ref<HTMLDivElement | null>(null)

const isProcessing = ref(false)
const processingText = ref('处理中...')
const isTyping = ref(false)

const userInput = ref('')
const chatMessages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: '你好！我是 AI 图片编辑助手。上传一张图片后，你可以告诉我想要做什么修改，比如：\n\n• "把背景换成蓝天白云"\n• "让照片看起来更明亮"\n• "去除图片中的文字"\n• "将图片风格改成油画效果"',
    timestamp: new Date()
  }
])

const imageInfo = reactive<ImageInfo>({
  width: 0,
  height: 0,
  size: '0 KB'
})

// 编辑历史
const editHistory = ref<string[]>([])
const historyIndex = ref(-1)

// 调整参数
const adjustments = reactive({
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0
})

// API 设置
const showApiSettings = ref(false)
const apiProvider = ref('local')
const apiKey = ref('')

// 文件上传
const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    loadImage(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    loadImage(files[0])
  }
}

const loadImage = (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    currentImage.value = result
    originalImage.value = result
    
    // 初始化历史记录
    editHistory.value = [result]
    historyIndex.value = 0
    
    // 重置调整参数
    resetAdjustments()
    
    // 获取图片信息
    const img = new Image()
    img.onload = () => {
      imageInfo.width = img.width
      imageInfo.height = img.height
    }
    img.src = result
    
    // 计算文件大小
    const sizeInKB = file.size / 1024
    imageInfo.size = sizeInKB > 1024 
      ? `${(sizeInKB / 1024).toFixed(2)} MB`
      : `${sizeInKB.toFixed(2)} KB`
    
    // 添加聊天消息
    addChatMessage('assistant', '图片已上传成功！现在你可以告诉我想要进行什么修改，或者使用右侧的快捷工具。')
  }
  reader.readAsDataURL(file)
}

// 编辑历史管理
const addToHistory = (imageData: string) => {
  // 如果不是在历史末尾，删除后面的记录
  if (historyIndex.value < editHistory.value.length - 1) {
    editHistory.value = editHistory.value.slice(0, historyIndex.value + 1)
  }
  editHistory.value.push(imageData)
  historyIndex.value = editHistory.value.length - 1
}

const undoEdit = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    currentImage.value = editHistory.value[historyIndex.value] || null
  }
}

const redoEdit = () => {
  if (historyIndex.value < editHistory.value.length - 1) {
    historyIndex.value++
    currentImage.value = editHistory.value[historyIndex.value] || null
  }
}

const resetToOriginal = () => {
  if (originalImage.value) {
    currentImage.value = originalImage.value
    editHistory.value = [originalImage.value]
    historyIndex.value = 0
    resetAdjustments()
    addChatMessage('assistant', '已恢复到原始图片。')
  }
}

// 聊天功能
const addChatMessage = (role: 'user' | 'assistant', content: string, image?: string) => {
  chatMessages.value.push({
    role,
    content,
    image,
    timestamp: new Date()
  })
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const sendMessage = async () => {
  if (!userInput.value.trim() || !currentImage.value || isProcessing.value) return
  
  const message = userInput.value.trim()
  userInput.value = ''
  
  addChatMessage('user', message)
  
  isTyping.value = true
  await processAIEdit(message)
  isTyping.value = false
}

// AI 编辑处理
const processAIEdit = async (prompt: string) => {
  isProcessing.value = true
  processingText.value = '正在分析您的需求...'
  
  try {
    // 模拟 AI 处理（实际项目中这里会调用真实的 AI API）
    await new Promise(resolve => setTimeout(resolve, 1000))
    processingText.value = '正在生成编辑效果...'
    
    // 根据提示词应用相应的效果
    const lowerPrompt = prompt.toLowerCase()
    let editApplied = false
    let responseMessage = ''
    
    if (lowerPrompt.includes('背景') || lowerPrompt.includes('去除背景') || lowerPrompt.includes('抠图')) {
      await applyEffect('remove_bg')
      responseMessage = '我已经帮您处理了背景。由于使用本地处理模式，这是一个模拟效果。配置 API 后可以获得更好的效果。'
      editApplied = true
    } else if (lowerPrompt.includes('明亮') || lowerPrompt.includes('亮度') || lowerPrompt.includes('提亮')) {
      await applyEffect('brighten')
      responseMessage = '我已经提高了图片的亮度，让它看起来更明亮了。'
      editApplied = true
    } else if (lowerPrompt.includes('美颜') || lowerPrompt.includes('美化') || lowerPrompt.includes('皮肤')) {
      await applyEffect('face_enhance')
      responseMessage = '我已经对图片进行了美颜处理，让肤色看起来更均匀自然。'
      editApplied = true
    } else if (lowerPrompt.includes('复古') || lowerPrompt.includes('怀旧')) {
      await applyEffect('vintage')
      responseMessage = '我已经为图片添加了复古怀旧的效果。'
      editApplied = true
    } else if (lowerPrompt.includes('黑白') || lowerPrompt.includes('灰度')) {
      await applyEffect('bw')
      responseMessage = '我已经将图片转换为黑白效果。'
      editApplied = true
    } else if (lowerPrompt.includes('锐化') || lowerPrompt.includes('清晰')) {
      await applyEffect('sharpen')
      responseMessage = '我已经对图片进行了锐化处理，让细节更加清晰。'
      editApplied = true
    } else if (lowerPrompt.includes('对比度')) {
      await applyEffect('contrast')
      responseMessage = '我已经增强了图片的对比度。'
      editApplied = true
    } else if (lowerPrompt.includes('暖') || lowerPrompt.includes('温暖')) {
      await applyEffect('warm')
      responseMessage = '我已经为图片添加了暖色调效果。'
      editApplied = true
    } else if (lowerPrompt.includes('冷') || lowerPrompt.includes('蓝色调')) {
      await applyEffect('cool')
      responseMessage = '我已经为图片添加了冷色调效果。'
      editApplied = true
    } else if (lowerPrompt.includes('模糊') || lowerPrompt.includes('虚化')) {
      await applyEffect('blur_bg')
      responseMessage = '我已经对图片进行了模糊处理。'
      editApplied = true
    } else if (lowerPrompt.includes('增强') || lowerPrompt.includes('优化')) {
      await applyEffect('enhance')
      responseMessage = '我已经对图片进行了智能增强，提升了整体质量。'
      editApplied = true
    } else if (lowerPrompt.includes('放大') || lowerPrompt.includes('高清') || lowerPrompt.includes('分辨率')) {
      await applyEffect('upscale')
      responseMessage = '我已经提升了图片的分辨率。在本地模式下这是模拟效果，配置 AI API 后可以获得真正的超分辨率效果。'
      editApplied = true
    } else if (lowerPrompt.includes('降噪') || lowerPrompt.includes('去噪')) {
      await applyEffect('denoise')
      responseMessage = '我已经对图片进行了降噪处理。'
      editApplied = true
    }
    
    if (!editApplied) {
      responseMessage = `我理解您想要"${prompt}"。目前本地处理模式支持以下编辑：\n\n• 亮度调整\n• 对比度调整\n• 美颜/美化\n• 复古效果\n• 黑白效果\n• 锐化处理\n• 暖色调/冷色调\n• 背景处理\n• 降噪\n\n您也可以使用右侧的快捷工具或手动调整滑块。如需更高级的 AI 编辑功能，请配置 AI API。`
    }
    
    addChatMessage('assistant', responseMessage)
    
  } catch (error) {
    addChatMessage('assistant', '抱歉，处理过程中出现了错误。请稍后重试。')
  } finally {
    isProcessing.value = false
  }
}

// 快捷编辑
const applyQuickEdit = async (effect: string) => {
  if (!currentImage.value || isProcessing.value) return
  
  const effectNames: Record<string, string> = {
    'enhance': '智能增强',
    'brighten': '提亮',
    'contrast': '增强对比度',
    'sharpen': '锐化',
    'vintage': '复古效果',
    'bw': '黑白效果',
    'warm': '暖色调',
    'cool': '冷色调',
    'remove_bg': '去背景',
    'face_enhance': '美颜',
    'upscale': '超分辨率',
    'denoise': '降噪'
  }
  
  isProcessing.value = true
  processingText.value = `正在应用${effectNames[effect]}...`
  
  try {
    await applyEffect(effect)
    addChatMessage('assistant', `已应用${effectNames[effect]}效果。`)
  } catch (error) {
    addChatMessage('assistant', '处理过程中出现错误，请重试。')
  } finally {
    isProcessing.value = false
  }
}

// 应用效果
const applyEffect = async (effect: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!currentImage.value) {
      resolve()
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      if (!ctx) {
        resolve()
        return
      }
      
      // 绘制原图
      ctx.drawImage(img, 0, 0)
      
      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data as unknown as number[]
      
      switch (effect) {
        case 'enhance':
          // 自动增强：轻微提亮 + 增加对比度 + 轻微饱和度
          for (let i = 0; i < data.length; i += 4) {
            // 提亮
            data[i] = Math.min(255, (data[i] || 0) * 1.1)
            data[i + 1] = Math.min(255, (data[i + 1] || 0) * 1.1)
            data[i + 2] = Math.min(255, (data[i + 2] || 0) * 1.1)
            
            // 对比度
            const factor = 1.15
            data[i] = Math.min(255, Math.max(0, ((data[i] || 0) - 128) * factor + 128))
            data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] || 0) - 128) * factor + 128))
            data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] || 0) - 128) * factor + 128))
          }
          break
          
        case 'brighten':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, (data[i] || 0) + 30)
            data[i + 1] = Math.min(255, (data[i + 1] || 0) + 30)
            data[i + 2] = Math.min(255, (data[i + 2] || 0) + 30)
          }
          break
          
        case 'contrast':
          const contrastFactor = 1.3
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, ((data[i] || 0) - 128) * contrastFactor + 128))
            data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] || 0) - 128) * contrastFactor + 128))
            data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] || 0) - 128) * contrastFactor + 128))
          }
          break
          
        case 'sharpen':
          // 简单锐化效果（使用卷积）
          const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]
          applyConvolution(imageData, sharpenKernel, canvas.width, canvas.height)
          break
          
        case 'vintage':
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i] || 0, g = data[i + 1] || 0, b = data[i + 2] || 0
            data[i] = Math.min(255, r * 0.9 + 30)
            data[i + 1] = Math.min(255, g * 0.7 + 20)
            data[i + 2] = Math.min(255, b * 0.5 + 10)
          }
          break
          
        case 'bw':
          for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] || 0) * 0.299 + (data[i + 1] || 0) * 0.587 + (data[i + 2] || 0) * 0.114
            data[i] = data[i + 1] = data[i + 2] = gray
          }
          break
          
        case 'warm':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, (data[i] || 0) + 20)
            data[i + 1] = Math.min(255, (data[i + 1] || 0) + 10)
            data[i + 2] = Math.max(0, (data[i + 2] || 0) - 10)
          }
          break
          
        case 'cool':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, (data[i] || 0) - 10)
            data[i + 1] = Math.min(255, (data[i + 1] || 0) + 5)
            data[i + 2] = Math.min(255, (data[i + 2] || 0) + 20)
          }
          break
          
        case 'remove_bg':
          // 模拟去背景（实际需要 AI API）
          // 这里用简单的白色背景替换来演示
          for (let i = 0; i < data.length; i += 4) {
            const brightness = ((data[i] || 0) + (data[i + 1] || 0) + (data[i + 2] || 0)) / 3
            if (brightness > 240) {
              data[i + 3] = 0 // 设置透明
            }
          }
          break
          
        case 'face_enhance':
          // 模拟美颜效果（柔化 + 提亮）
          for (let i = 0; i < data.length; i += 4) {
            // 轻微提亮
            data[i] = Math.min(255, (data[i] || 0) * 1.05 + 5)
            data[i + 1] = Math.min(255, (data[i + 1] || 0) * 1.05 + 5)
            data[i + 2] = Math.min(255, (data[i + 2] || 0) * 1.05 + 5)
          }
          // 应用轻微模糊
          const blurKernel = [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9]
          applyConvolution(imageData, blurKernel, canvas.width, canvas.height)
          break
          
        case 'upscale':
          // 模拟超分辨率（实际需要 AI API）
          // 这里只是轻微锐化来模拟
          const upscaleKernel = [0, -0.5, 0, -0.5, 3, -0.5, 0, -0.5, 0]
          applyConvolution(imageData, upscaleKernel, canvas.width, canvas.height)
          break
          
        case 'denoise':
          // 降噪（使用均值滤波）
          const denoiseKernel = [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9]
          applyConvolution(imageData, denoiseKernel, canvas.width, canvas.height)
          break
          
        case 'blur_bg':
          // 模糊效果
          const blurKernel2 = [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16]
          applyConvolution(imageData, blurKernel2, canvas.width, canvas.height)
          break
      }
      
      ctx.putImageData(imageData, 0, 0)
      
      const newImage = canvas.toDataURL('image/png')
      currentImage.value = newImage
      addToHistory(newImage)
      
      resolve()
    }
    
    img.src = currentImage.value
  })
}

// 卷积处理
const applyConvolution = (imageData: ImageData, kernel: number[], width: number, height: number) => {
  const data = imageData.data
  const copy = new Uint8ClampedArray(data)
  const kSize = 3
  const kHalf = Math.floor(kSize / 2)
  
  for (let y = kHalf; y < height - kHalf; y++) {
    for (let x = kHalf; x < width - kHalf; x++) {
      let r = 0, g = 0, b = 0
      
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const idx = ((y + ky - kHalf) * width + (x + kx - kHalf)) * 4
          const kVal = kernel[ky * kSize + kx] || 0
          r += (copy[idx] || 0) * kVal
          g += (copy[idx + 1] || 0) * kVal
          b += (copy[idx + 2] || 0) * kVal
        }
      }
      
      const i = (y * width + x) * 4
      data[i] = Math.min(255, Math.max(0, r))
      data[i + 1] = Math.min(255, Math.max(0, g))
      data[i + 2] = Math.min(255, Math.max(0, b))
    }
  }
}

// 手动调整
const applyAdjustments = () => {
  if (!originalImage.value) return
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    
    if (!ctx) return
    
    // 应用滤镜
    ctx.filter = `
      brightness(${adjustments.brightness}%)
      contrast(${adjustments.contrast}%)
      saturate(${adjustments.saturation}%)
      hue-rotate(${adjustments.hue}deg)
      blur(${adjustments.blur}px)
    `
    
    ctx.drawImage(img, 0, 0)
    currentImage.value = canvas.toDataURL('image/png')
  }
  
  // 使用历史记录中的当前图片作为基础
  img.src = historyIndex.value > 0 ? (editHistory.value[historyIndex.value] || originalImage.value!) : originalImage.value!
}

const resetAdjustments = () => {
  adjustments.brightness = 100
  adjustments.contrast = 100
  adjustments.saturation = 100
  adjustments.hue = 0
  adjustments.blur = 0
}

// 下载图片
const downloadImage = () => {
  if (!currentImage.value) return
  
  const link = document.createElement('a')
  link.download = `ai-edited-${Date.now()}.png`
  link.href = currentImage.value
  link.click()
}

// API 设置
const saveApiSettings = () => {
  localStorage.setItem('ai_photo_api_provider', apiProvider.value)
  if (apiKey.value) {
    localStorage.setItem('ai_photo_api_key', apiKey.value)
  }
  showApiSettings.value = false
  addChatMessage('assistant', 'API 设置已保存。')
}

// 初始化
onMounted(() => {
  const savedProvider = localStorage.getItem('ai_photo_api_provider')
  const savedKey = localStorage.getItem('ai_photo_api_key')
  if (savedProvider) apiProvider.value = savedProvider
  if (savedKey) apiKey.value = savedKey
})
</script>

<style scoped>
.ai-photo-editor {
  height: 100%;
  background: #f5f7fa;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  height: calc(100vh - 180px);
  padding: 20px;
}

/* 工作区 */
.workspace {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-area {
  flex: 1;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 上传区域 */
.upload-zone {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px dashed #dee2e6;
  border-radius: 16px;
  margin: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.02);
}

.upload-content {
  text-align: center;
  padding: 40px;
}

.upload-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.upload-content h3 {
  font-size: 20px;
  color: #212529;
  margin: 0 0 8px 0;
}

.upload-content p {
  color: #6c757d;
  margin: 0;
}

.upload-hint {
  font-size: 12px;
  color: #adb5bd;
  margin-top: 12px !important;
}

/* 图片显示区域 */
.image-display {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 13px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tool-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.tool-btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #dee2e6;
  margin: 0 8px;
}

.image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #1a1a2e;
  position: relative;
  overflow: auto;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.processing-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255,255,255,0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.processing-overlay p {
  color: white;
  font-size: 14px;
}

.image-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-size: 12px;
  color: #6c757d;
}

/* 侧边栏 */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.section-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

/* 聊天区域 */
.chat-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  max-height: 350px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  display: flex;
  gap: 10px;
  max-width: 90%;
}

.chat-message.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.chat-message.assistant {
  align-self: flex-start;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-text {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.chat-message.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-message.assistant .message-text {
  background: #f0f2f5;
  color: #212529;
  border-bottom-left-radius: 4px;
}

.message-image {
  max-width: 200px;
  border-radius: 8px;
  margin-top: 8px;
}

.message-time {
  font-size: 10px;
  color: #adb5bd;
  padding: 0 8px;
}

.chat-message.user .message-time {
  text-align: right;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #adb5bd;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e9ecef;
}

.chat-input-area textarea {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  font-size: 13px;
  resize: none;
  font-family: inherit;
}

.chat-input-area textarea:focus {
  outline: none;
  border-color: #667eea;
}

.send-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 快捷工具 */
.tools-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.quick-tools {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-category h4 {
  font-size: 12px;
  color: #6c757d;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.quick-tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-tool-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #667eea;
  transform: translateY(-2px);
}

.quick-tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tool-icon {
  font-size: 20px;
}

.tool-name {
  font-size: 10px;
  color: #495057;
  text-align: center;
}

/* 手动调整 */
.adjustments-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.reset-btn {
  padding: 4px 12px;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 12px;
  color: #6c757d;
  cursor: pointer;
}

.reset-btn:hover {
  background: #f8f9fa;
}

.adjustment-sliders {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-group label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #495057;
}

.slider-value {
  color: #667eea;
  font-weight: 600;
}

.slider-group input[type="range"] {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e9ecef;
  border-radius: 3px;
  outline: none;
}

.slider-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.slider-group input[type="range"]:disabled {
  opacity: 0.5;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #212529;
}

.modal-desc {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  padding: 10px 24px;
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

/* 响应式 */
@media (max-width: 1200px) {
  .editor-container {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .side-panel {
    max-height: none;
  }
  
  .chat-section {
    max-height: 300px;
  }
}
</style>
