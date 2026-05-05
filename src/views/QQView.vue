<template>
  <div class="qq-view">
    <div class="view-content">
      <!-- 左侧编辑面板 -->
      <div class="edit-panel">
        <div class="tabs">
          <button
            v-for="tab in mainTabs"
            :key="tab"
            :class="['tab', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 聊天信息 -->
          <div v-show="activeTab === '聊天信息'" class="form-section">
            <div class="form-group">
              <label>我的QQ号</label>
              <input v-model="qqStore.chatInfo.myQQ" type="text" placeholder="1234567890" />
            </div>
            <div class="form-group">
              <label>我的昵称</label>
              <input v-model="qqStore.chatInfo.myNickname" type="text" placeholder="我" />
            </div>
            <div class="form-group">
              <label>对方QQ号</label>
              <input v-model="qqStore.chatInfo.otherQQ" type="text" placeholder="9876543210" />
            </div>
            <div class="form-group">
              <label>对方昵称</label>
              <input v-model="qqStore.chatInfo.otherNickname" type="text" placeholder="好友" />
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="qqStore.chatInfo.isGroupChat" type="checkbox" />
                群聊模式
              </label>
            </div>
            <div v-if="qqStore.chatInfo.isGroupChat" class="form-group">
              <label>群名称</label>
              <input v-model="qqStore.chatInfo.groupName" type="text" placeholder="好友群" />
            </div>
          </div>

          <!-- 消息记录 -->
          <div v-show="activeTab === '消息记录'" class="form-section">
            <div class="messages-list">
              <div v-for="(message, index) in qqStore.messages" :key="message.id" class="message-item">
                <div class="message-header">
                  <span class="message-number">消息 #{{ index + 1 }}</span>
                  <button @click="qqStore.removeMessage(message.id)" class="btn-remove">删除</button>
                </div>
                <div class="form-group">
                  <label>发送者</label>
                  <select v-model="message.sender">
                    <option value="me">我</option>
                    <option value="other">对方</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>消息内容</label>
                  <textarea v-model="message.content" rows="3" placeholder="输入消息内容"></textarea>
                </div>
                <div class="form-group">
                  <label>时间</label>
                  <input v-model="message.timestamp" type="text" placeholder="2024-01-15 14:30" />
                </div>
              </div>
            </div>
            <button @click="addMessage" class="btn-add">+ 添加消息</button>
          </div>

          <!-- 设置 -->
          <div v-show="activeTab === '设置'" class="form-section">
            <div class="form-group">
              <label>设备型号</label>
              <select v-model="qqStore.settings.deviceModel">
                <option value="Android">Android</option>
                <option value="iPhone">iPhone</option>
              </select>
            </div>
            <div class="form-group">
              <label>QQ版本</label>
              <input v-model="qqStore.settings.qqVersion" type="text" placeholder="8.9.88" />
            </div>
            <div class="form-group">
              <label>主题</label>
              <select v-model="qqStore.settings.theme">
                <option value="light">浅色</option>
                <option value="dark">深色</option>
              </select>
            </div>
            <div class="form-group">
              <label>字体大小</label>
              <input v-model.number="qqStore.settings.fontSize" type="number" min="12" max="24" />
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="qqStore.settings.showTime" type="checkbox" />
                显示时间
              </label>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="qqStore.settings.showQQNumber" type="checkbox" />
                显示QQ号
              </label>
            </div>
          </div>

          <!-- 数据管理 -->
          <div v-show="activeTab === '数据管理'" class="form-section">
            <SaveLoadPanel 
              document-type="qq"
              :get-data="() => qqStore.$state"
              :set-data="(data: any) => qqStore.$patch(data)"
            />
          </div>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>📱 预览</h3>
          <div class="preview-actions">
            <button @click="exportImage" class="btn-export">导出图片</button>
          </div>
        </div>
        <div class="qq-preview" :class="`theme-${qqStore.settings.theme}`" ref="previewRef">
          <div class="qq-header">
            <div class="header-left">
              <span class="back-btn">←</span>
              <div class="chat-title">
                <div class="chat-name">{{ qqStore.chatInfo.isGroupChat ? qqStore.chatInfo.groupName : qqStore.chatInfo.otherNickname }}</div>
                <div v-if="qqStore.settings.showQQNumber" class="chat-subtitle">
                  {{ qqStore.chatInfo.isGroupChat ? `群号:${qqStore.chatInfo.otherQQ}` : qqStore.chatInfo.otherQQ }}
                </div>
              </div>
            </div>
            <div class="header-right">⋮</div>
          </div>
          <div class="qq-messages" :style="{ fontSize: qqStore.settings.fontSize + 'px' }">
            <div v-for="message in qqStore.messages" :key="message.id" :class="['message-bubble', message.sender]">
              <div v-if="qqStore.settings.showTime" class="message-time">{{ message.timestamp }}</div>
              <div class="message-content-wrapper">
                <div v-if="message.sender === 'other'" class="avatar">{{ qqStore.chatInfo.otherNickname.charAt(0) }}</div>
                <div class="message-content">{{ message.content }}</div>
                <div v-if="message.sender === 'me'" class="avatar">{{ qqStore.chatInfo.myNickname.charAt(0) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQQStore } from '@/stores/qq'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import html2canvas from 'html2canvas'

const qqStore = useQQStore()
const activeTab = ref('聊天信息')
const mainTabs = ['聊天信息', '消息记录', '设置', '数据管理']
const previewRef = ref()

const addMessage = () => {
  qqStore.addMessage({
    sender: 'me',
    content: '新消息',
    timestamp: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').slice(0, -3),
    type: 'text'
  })
}

const exportImage = async () => {
  const element = previewRef.value
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: qqStore.settings.theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
      logging: false
    })
    
    const link = document.createElement('a')
    link.download = `qq-chat-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  }
}
</script>

<style scoped>
.qq-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.view-content {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

.edit-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tab {
  padding: 15px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
  flex: 1;
}

.tab.active {
  background: white;
  color: #667eea;
  border-bottom-color: #667eea;
}

.form-section {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.messages-list {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.message-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.btn-remove {
  padding: 4px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.btn-add {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.preview-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.btn-export {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.qq-preview {
  max-width: 400px;
  margin: 0 auto;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.theme-light {
  background: white;
}

.theme-dark {
  background: #1a1a1a;
}

.qq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #12b7f5;
  color: white;
}

.theme-dark .qq-header {
  background: #2a2a2a;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-name {
  font-weight: 600;
  font-size: 16px;
}

.chat-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

.qq-messages {
  padding: 20px;
  min-height: 500px;
  max-height: 600px;
  overflow-y: auto;
}

.theme-dark .qq-messages {
  background: #1a1a1a;
}

.message-bubble {
  margin-bottom: 20px;
}

.message-time {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.message-content-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.message-bubble.me .message-content-wrapper {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.message-content {
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 70%;
  word-wrap: break-word;
}

.message-bubble.other .message-content {
  background: white;
  color: #333;
}

.theme-dark .message-bubble.other .message-content {
  background: #2a2a2a;
  color: white;
}

.message-bubble.me .message-content {
  background: #12b7f5;
  color: white;
}
</style>
