<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWeChatStore } from '@/stores/wechat'
import { useQQStore } from '@/stores/qq'
import WeChatPreview from '@/components/WeChatPreview.vue'
import QQPreview from '@/components/QQPreview.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'

const wechatStore = useWeChatStore()
const qqStore = useQQStore()
const platform = ref<'wechat' | 'qq'>('wechat')

// 获取当前平台的store
const activeStore = computed(() => platform.value === 'wechat' ? wechatStore : qqStore)

// 新消息表单
const newMessage = ref({
  type: 'text' as 'text' | 'image' | 'voice' | 'video' | 'location' | 'transfer' | 'red_packet',
  content: '',
  isSelf: false,
  timestamp: new Date().toISOString()
})

// 添加消息
const addMessage = () => {
  if (!newMessage.value.content && newMessage.value.type !== 'transfer' && newMessage.value.type !== 'red_packet') {
    return
  }
  
  activeStore.value.addMessage({ ...newMessage.value })
  
  // 重置表单
  newMessage.value = {
    type: 'text',
    content: '',
    isSelf: false,
    timestamp: new Date().toISOString()
  }
}

// 删除消息
const deleteMessage = (index: number) => {
  activeStore.value.deleteMessage(index)
}

// 移动消息
const moveMessage = (index: number, direction: 'up' | 'down') => {
  if (direction === 'up' && index > 0) {
    const temp = activeStore.value.messages[index]
    activeStore.value.messages.splice(index, 1)
    activeStore.value.messages.splice(index - 1, 0, temp)
  } else if (direction === 'down' && index < activeStore.value.messages.length - 1) {
    const temp = activeStore.value.messages[index]
    activeStore.value.messages.splice(index, 1)
    activeStore.value.messages.splice(index + 1, 0, temp)
  }
}

// 清空所有消息
const clearAll = () => {
  if (confirm('确定要清空所有消息吗？')) {
    activeStore.value.clearMessages()
  }
}

// 导出为PDF
const exportToPDF = async () => {
  const selector = platform.value === 'wechat' ? '.wechat-preview-container' : '.qq-preview-container'
  const preview = document.querySelector(selector) as HTMLElement
  if (!preview) return

  try {
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const canvas = await html2canvas(preview, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f7f7f7'
    })

    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const fileName = platform.value === 'wechat' ? '微信聊天记录' : 'QQ聊天记录'
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`${fileName}-${Date.now()}.pdf`)
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  }
}

// 消息类型选项
const messageTypes = [
  { value: 'text', label: '文本消息' },
  { value: 'image', label: '图片消息' },
  { value: 'voice', label: '语音消息' },
  { value: 'video', label: '视频消息' },
  { value: 'location', label: '位置消息' },
  { value: 'transfer', label: '转账消息' },
  { value: 'red_packet', label: '红包消息' }
]
</script>

<template>
  <div class="wechat-view">
    <div class="view-header">
      <div class="platform-switcher">
        <button 
          :class="['platform-btn', { active: platform === 'wechat' }]"
          @click="platform = 'wechat'"
        >
          微信
        </button>
        <button 
          :class="['platform-btn', { active: platform === 'qq' }]"
          @click="platform = 'qq'"
        >
          QQ
        </button>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 左侧编辑区 -->
      <div class="edit-panel">
        <div class="panel-header">
          <h2>编辑{{ platform === 'wechat' ? '微信' : 'QQ' }}聊天记录</h2>
          <button @click="clearAll" class="btn-clear">清空所有</button>
        </div>

        <!-- 聊天设置 -->
        <div class="chat-settings">
          <h3>聊天设置</h3>
          <div class="form-group">
            <label>聊天名称</label>
            <input v-model="activeStore.chatName" type="text" placeholder="好友昵称或群聊名称" />
          </div>
          <div class="form-group">
            <label>聊天类型</label>
            <select v-model="activeStore.chatType">
              <option value="private">私聊</option>
              <option value="group">群聊</option>
            </select>
          </div>
        </div>

        <!-- 添加消息 -->
        <div class="add-message">
          <h3>添加消息</h3>
          <div class="form-group">
            <label>消息类型</label>
            <select v-model="newMessage.type">
              <option v-for="type in messageTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>发送者</label>
            <div class="radio-group">
              <label>
                <input type="radio" :value="false" v-model="newMessage.isSelf" />
                对方
              </label>
              <label>
                <input type="radio" :value="true" v-model="newMessage.isSelf" />
                自己
              </label>
            </div>
          </div>

          <!-- 根据消息类型显示不同输入 -->
          <div class="form-group" v-if="newMessage.type === 'text'">
            <label>消息内容</label>
            <textarea v-model="newMessage.content" placeholder="输入文字消息" rows="3"></textarea>
          </div>

          <div class="form-group" v-else-if="newMessage.type === 'image'">
            <label>图片URL</label>
            <input v-model="newMessage.content" type="text" placeholder="输入图片链接" />
          </div>

          <div class="form-group" v-else-if="newMessage.type === 'voice'">
            <label>语音时长（秒）</label>
            <input v-model.number="newMessage.content" type="number" placeholder="如: 5" />
          </div>

          <div class="form-group" v-else-if="newMessage.type === 'video'">
            <label>视频封面URL</label>
            <input v-model="newMessage.content" type="text" placeholder="输入视频封面链接" />
          </div>

          <div class="form-group" v-else-if="newMessage.type === 'location'">
            <label>位置信息（格式：地名|详细地址）</label>
            <input v-model="newMessage.content" type="text" placeholder="天安门|北京市东城区" />
          </div>

          <div class="form-group" v-else-if="newMessage.type === 'transfer'">
            <label>转账金额</label>
            <input v-model.number="newMessage.content" type="number" placeholder="如: 520.00" step="0.01" />
          </div>

          <div class="form-group" v-else-if="newMessage.type === 'red_packet'">
            <label>红包祝福语</label>
            <input v-model="newMessage.content" type="text" placeholder="恭喜发财，大吉大利" />
          </div>

          <div class="form-group">
            <label>时间</label>
            <input v-model="newMessage.timestamp" type="datetime-local" />
          </div>

          <button @click="addMessage" class="btn-add">添加消息</button>
        </div>

        <!-- 消息列表 -->
        <div class="message-list">
          <h3>消息列表（{{ activeStore.messages.length }}条）</h3>
          <div class="messages">
            <div v-for="(msg, index) in activeStore.messages" :key="index" class="message-item">
              <div class="message-info">
                <span class="message-type">{{ messageTypes.find(t => t.value === msg.type)?.label }}</span>
                <span class="message-sender">{{ msg.isSelf ? '自己' : '对方' }}</span>
              </div>
              <div class="message-content">
                {{ msg.content || (msg.type === 'transfer' ? '¥' + msg.content : msg.type) }}
              </div>
              <div class="message-actions">
                <button @click="moveMessage(index, 'up')" :disabled="index === 0">↑</button>
                <button @click="moveMessage(index, 'down')" :disabled="index === activeStore.messages.length - 1">↓</button>
                <button @click="deleteMessage(index)" class="btn-delete">删除</button>
              </div>
            </div>
            <div v-if="activeStore.messages.length === 0" class="empty-state">
              暂无消息，请添加消息
            </div>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="data-management">
          <h3>数据管理</h3>
          <SaveLoadPanel 
            :document-type="platform === 'wechat' ? 'wechat' : 'qq'"
            :get-data="() => activeStore.$state"
            :set-data="(data: any) => activeStore.$patch(data)"
          />
        </div>
      </div>

      <!-- 右侧预览区 -->
      <div class="preview-panel">
        <div class="panel-header">
          <h2>实时预览</h2>
          <button @click="exportToPDF" class="btn-export">导出PDF</button>
        </div>
        <div v-if="platform === 'wechat'" class="preview-container wechat-preview-container">
          <WeChatPreview 
            :current-chat="{ 
              name: wechatStore.chatName, 
              type: wechatStore.chatType,
              messages: wechatStore.messages 
            }"
            :settings="wechatStore.settings"
          />
        </div>
        <div v-else class="preview-container qq-preview-container">
          <QQPreview 
            :current-chat="{ 
              name: qqStore.chatName, 
              type: qqStore.chatType,
              messages: qqStore.messages 
            }"
            :settings="qqStore.settings"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wechat-view {
  padding: 2rem;
  max-width: 1800px;
  margin: 0 auto;
}

.view-header {
  text-align: center;
  margin-bottom: 2rem;
}

.type-switcher {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.platform-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.platform-btn:hover {
  border-color: #d1d5db;
  color: #374151;
}

.platform-btn.active {
  background: #07c160;
  border-color: #07c160;
  color: white;
}

.platform-btn.active.qq {
  background: #12b7f5;
  border-color: #12b7f5;
}

.view-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.edit-panel,
.preview-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.chat-settings,
.add-message,
.message-list {
  margin-bottom: 2rem;
}

.chat-settings h3,
.add-message h3,
.message-list h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #07c160;
  box-shadow: 0 0 0 3px rgba(7, 193, 96, 0.1);
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.btn-add,
.btn-export,
.btn-clear {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add {
  width: 100%;
  background: #07c160;
  color: white;
  border: none;
}

.btn-add:hover {
  background: #06ad56;
}

.btn-export {
  background: #1890ff;
  color: white;
  border: none;
}

.btn-export:hover {
  background: #1677d0;
}

.btn-clear {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.btn-clear:hover {
  background: #e8e8e8;
}

.messages {
  max-height: 400px;
  overflow-y: auto;
}

.message-item {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.message-info {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}

.message-type {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.message-sender {
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.message-content {
  font-size: 0.875rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
  overflow-wrap: break-word;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
}

.message-actions button {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.message-actions button:hover:not(:disabled) {
  background: #f3f4f6;
}

.message-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-delete {
  color: #dc2626;
}

.btn-delete:hover {
  background: #fee2e2 !important;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.preview-container {
  background: #f7f7f7;
  border-radius: 8px;
  padding: 2rem;
  min-height: 600px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
