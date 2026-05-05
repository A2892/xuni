<template>
  <div class="social-screenshot-view">
    <div class="page-header">
      <h1>💬 社交截图生成器</h1>
      <p class="description">生成微信、QQ、微博、抖音等社交平台聊天截图</p>
    </div>

    <div class="main-content">
      <!-- 左侧编辑面板 -->
      <div class="edit-panel">
        <!-- 平台选择 -->
        <div class="platform-selector">
          <button 
            v-for="platform in socialPlatforms" 
            :key="platform.id"
            :class="['platform-btn', { active: store.data.platform === platform.id }]"
            :style="{ '--platform-color': platform.color }"
            @click="store.setPlatformDefaults(platform.id as any)"
          >
            <span class="platform-icon">{{ platform.icon }}</span>
            <span class="platform-name">{{ platform.label }}</span>
          </button>
        </div>

        <!-- 模式选择 -->
        <div class="mode-selector">
          <button 
            v-for="mode in chatModes"
            :key="mode.id"
            :class="['mode-btn', { active: store.data.chatMode === mode.id }]"
            @click="store.data.chatMode = mode.id as any"
          >
            {{ mode.icon }} {{ mode.label }}
          </button>
        </div>

        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 聊天消息 -->
          <div v-show="activeTab === 'messages'" class="form-section">
            <div class="section-header">
              <h3>💬 聊天消息</h3>
              <div class="add-message-btns">
                <button @click="addMessage('text', 'self')">+ 我的消息</button>
                <button @click="addMessage('text', 'other')">+ 对方消息</button>
              </div>
            </div>

            <div v-for="(msg, index) in store.data.messages" :key="msg.id" class="message-card">
              <div class="message-header">
                <span class="msg-index">#{{ index + 1 }}</span>
                <span :class="['sender-tag', msg.sender]">{{ msg.sender === 'self' ? '我' : '对方' }}</span>
                <button class="btn-remove" @click="store.removeMessage(msg.id)">×</button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>消息类型</label>
                  <select v-model="msg.type">
                    <option v-for="type in messageTypes" :key="type.id" :value="type.id">
                      {{ type.icon }} {{ type.label }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>发送时间</label>
                  <input type="text" v-model="msg.time" placeholder="10:30" />
                </div>
              </div>

              <!-- 文字消息 -->
              <div v-if="msg.type === 'text'" class="form-group">
                <label>消息内容</label>
                <textarea v-model="msg.content" rows="2" placeholder="输入消息内容"></textarea>
              </div>

              <!-- 语音消息 -->
              <div v-else-if="msg.type === 'voice'" class="form-group">
                <label>语音时长 (秒)</label>
                <input type="number" v-model.number="msg.voiceDuration" min="1" max="60" />
              </div>

              <!-- 表情消息 -->
              <div v-else-if="msg.type === 'emoji'" class="form-group">
                <label>表情</label>
                <input type="text" v-model="msg.content" placeholder="😊" />
              </div>

              <!-- 转账消息 -->
              <div v-else-if="msg.type === 'transfer'" class="form-row">
                <div class="form-group">
                  <label>转账金额</label>
                  <input type="number" v-model.number="msg.transferAmount" step="0.01" />
                </div>
                <div class="form-group">
                  <label>转账说明</label>
                  <input type="text" v-model="msg.transferNote" placeholder="转账" />
                </div>
              </div>

              <!-- 红包消息 -->
              <div v-else-if="msg.type === 'redpacket'" class="form-row">
                <div class="form-group">
                  <label>红包金额</label>
                  <input type="number" v-model.number="msg.redpacketAmount" step="0.01" />
                </div>
                <div class="form-group">
                  <label>祝福语</label>
                  <input type="text" v-model="msg.redpacketMessage" placeholder="恭喜发财" />
                </div>
              </div>

              <!-- 位置消息 -->
              <div v-else-if="msg.type === 'location'" class="form-row">
                <div class="form-group">
                  <label>地点名称</label>
                  <input type="text" v-model="msg.location!.name" placeholder="北京天安门" />
                </div>
                <div class="form-group">
                  <label>详细地址</label>
                  <input type="text" v-model="msg.location!.address" placeholder="北京市东城区" />
                </div>
              </div>

              <!-- 图片消息 -->
              <div v-else-if="msg.type === 'image'" class="form-group">
                <label>图片</label>
                <input type="file" accept="image/*" @change="(e) => handleMessageImage(e, msg)" />
              </div>
            </div>

            <div v-if="store.data.messages.length === 0" class="empty-state">
              <p>暂无消息，点击上方按钮添加</p>
            </div>
          </div>

          <!-- 用户信息 -->
          <div v-show="activeTab === 'users'" class="form-section">
            <h3>👥 用户信息</h3>
            
            <div class="user-card">
              <h4>对方信息</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>昵称</label>
                  <input type="text" v-model="store.data.otherName" />
                </div>
                <div class="form-group">
                  <label>备注名</label>
                  <input type="text" v-model="store.data.otherNote" />
                </div>
              </div>
              <div class="form-group">
                <label>头像</label>
                <input type="file" accept="image/*" @change="handleOtherAvatar" />
              </div>
              <div class="form-group">
                <label>个性签名</label>
                <input type="text" v-model="store.data.otherSignature" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>性别</label>
                  <select v-model="store.data.otherGender">
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="unknown">未知</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>在线状态</label>
                  <select v-model="store.data.otherStatus">
                    <option value="online">在线</option>
                    <option value="offline">离线</option>
                    <option value="busy">忙碌</option>
                    <option value="away">离开</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="user-card">
              <h4>我的信息</h4>
              <div class="form-group">
                <label>昵称</label>
                <input type="text" v-model="store.data.selfName" />
              </div>
              <div class="form-group">
                <label>头像</label>
                <input type="file" accept="image/*" @change="handleSelfAvatar" />
              </div>
            </div>

            <div v-if="store.data.chatMode === 'group'" class="user-card">
              <h4>群聊信息</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>群名称</label>
                  <input type="text" v-model="store.data.groupName" />
                </div>
                <div class="form-group">
                  <label>成员数量</label>
                  <input type="number" v-model.number="store.data.groupMemberCount" />
                </div>
              </div>
            </div>
          </div>

          <!-- 朋友圈/动态 -->
          <div v-show="activeTab === 'moments'" class="form-section">
            <h3>📸 朋友圈/动态</h3>
            
            <div class="form-group">
              <label>动态内容</label>
              <textarea v-model="store.data.momentContent" rows="3" placeholder="分享新鲜事..."></textarea>
            </div>

            <div class="form-group">
              <label>图片 (最多9张)</label>
              <input type="file" accept="image/*" multiple @change="handleMomentImages" />
              <div v-if="store.data.momentImages.length > 0" class="image-preview-grid">
                <div v-for="(img, i) in store.data.momentImages" :key="i" class="image-preview">
                  <img :src="img" />
                  <button class="remove-img" @click="store.removeMomentImage(i)">×</button>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>发布时间</label>
                <input type="text" v-model="store.data.momentTime" placeholder="2小时前" />
              </div>
              <div class="form-group">
                <label>位置</label>
                <input type="text" v-model="store.data.momentLocation" placeholder="北京市朝阳区" />
              </div>
            </div>

            <div class="form-group">
              <label>点赞数</label>
              <input type="number" v-model.number="store.data.momentLikes" min="0" />
            </div>

            <div class="comments-editor">
              <h4>评论列表</h4>
              <div v-for="(comment, i) in store.data.momentComments" :key="i" class="comment-item">
                <input type="text" v-model="comment.name" placeholder="用户名" style="width: 80px;" />
                <input type="text" v-model="comment.content" placeholder="评论内容" style="flex: 1;" />
                <button @click="store.removeMomentComment(i)">×</button>
              </div>
              <button class="btn-add-comment" @click="store.addMomentComment('用户', '评论内容')">
                + 添加评论
              </button>
            </div>
          </div>

          <!-- 设备设置 -->
          <div v-show="activeTab === 'settings'" class="form-section">
            <h3>📱 设备设置</h3>

            <div class="form-group">
              <label>设备类型</label>
              <div class="device-options">
                <button 
                  :class="['device-btn', { active: store.data.deviceType === 'iphone' }]"
                  @click="store.data.deviceType = 'iphone'"
                >
                  📱 iPhone
                </button>
                <button 
                  :class="['device-btn', { active: store.data.deviceType === 'android' }]"
                  @click="store.data.deviceType = 'android'"
                >
                  🤖 Android
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>显示时间</label>
                <input type="text" v-model="store.data.showTime" placeholder="10:30" />
              </div>
              <div class="form-group">
                <label>电量 (%)</label>
                <input type="number" v-model.number="store.data.showBattery" min="0" max="100" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>信号强度 (1-4)</label>
                <input type="number" v-model.number="store.data.showSignal" min="1" max="4" />
              </div>
            </div>

            <div class="toggle-group">
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.showWifi" />
                <span>显示WiFi图标</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.showStatusBar" />
                <span>显示状态栏</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.showInputBar" />
                <span>显示输入栏</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" v-model="store.data.darkMode" />
                <span>深色模式</span>
              </label>
            </div>

            <div class="form-group">
              <label>输入框文字</label>
              <input type="text" v-model="store.data.inputText" placeholder="输入框中显示的文字" />
            </div>

            <div class="form-section">
              <h3>📥 导出设置</h3>
              <div class="form-group">
                <label>导出质量</label>
                <select v-model="exportQuality">
                  <option value="1">标准 (1x)</option>
                  <option value="2">高清 (2x)</option>
                  <option value="3">超清 (3x)</option>
                </select>
              </div>
            </div>

            <button class="btn-reset" @click="store.reset()">重置所有设置</button>
          </div>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>实时预览</h3>
          <div class="preview-actions">
            <button class="btn-download" @click="downloadImage">📥 下载图片</button>
            <button class="btn-download secondary" @click="downloadPDF">📄 下载PDF</button>
          </div>
        </div>
        <div class="preview-container">
          <div ref="previewRef" class="preview-wrapper">
            <SocialScreenshotPreview />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSocialScreenshotStore, socialPlatforms, chatModes, messageTypes } from '@/stores/socialScreenshot'
import SocialScreenshotPreview from '@/components/SocialScreenshotPreview.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = useSocialScreenshotStore()
const activeTab = ref('messages')
const previewRef = ref<HTMLElement | null>(null)
const exportQuality = ref('2')

const tabs = [
  { id: 'messages', label: '💬 消息' },
  { id: 'users', label: '👥 用户' },
  { id: 'moments', label: '📸 动态' },
  { id: 'settings', label: '⚙️ 设置' }
]

const addMessage = (type: string, sender: string) => {
  store.addMessage(type as any, sender as any)
}

const handleOtherAvatar = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.data.otherAvatar = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const handleSelfAvatar = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.data.selfAvatar = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const handleMessageImage = (e: Event, msg: any) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      msg.imageUrl = ev.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const handleMomentImages = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    Array.from(input.files).slice(0, 9 - store.data.momentImages.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        store.addMomentImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    })
  }
}

const downloadImage = async () => {
  if (!previewRef.value) return
  const scale = parseInt(exportQuality.value)
  const canvas = await html2canvas(previewRef.value, {
    scale,
    useCORS: true,
    backgroundColor: null
  })
  const link = document.createElement('a')
  link.download = `social-${store.data.platform}-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const downloadPDF = async () => {
  if (!previewRef.value) return
  const scale = parseInt(exportQuality.value)
  const canvas = await html2canvas(previewRef.value, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`social-${store.data.platform}-${Date.now()}.pdf`)
}
</script>

<style scoped>
.social-screenshot-view {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.75rem;
  margin: 0 0 8px 0;
  color: #1e293b;
}

.description {
  color: #64748b;
  margin: 0;
}

.main-content {
  display: flex;
  gap: 24px;
}

.edit-panel {
  width: 480px;
  flex-shrink: 0;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-height: calc(100vh - 150px);
  overflow-y: auto;
}

.preview-panel {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

/* 平台选择器 */
.platform-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.platform-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.platform-btn:hover {
  border-color: var(--platform-color);
  background: color-mix(in srgb, var(--platform-color) 10%, white);
}

.platform-btn.active {
  border-color: var(--platform-color);
  background: color-mix(in srgb, var(--platform-color) 15%, white);
}

.platform-icon {
  font-size: 24px;
}

.platform-name {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}

/* 模式选择器 */
.mode-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.mode-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: #4B6EF5;
}

.mode-btn.active {
  border-color: #4B6EF5;
  background: #EEF2FF;
  color: #4B6EF5;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
}

.tab-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #334155;
}

.tab-btn.active {
  background: white;
  color: #4B6EF5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 表单 */
.form-section {
  margin-bottom: 20px;
}

.form-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
}

.add-message-btns {
  display: flex;
  gap: 8px;
}

.add-message-btns button {
  padding: 6px 12px;
  border: 1px dashed #4B6EF5;
  border-radius: 6px;
  background: white;
  color: #4B6EF5;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-message-btns button:hover {
  background: #EEF2FF;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  flex: 1;
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4B6EF5;
  box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1);
}

/* 消息卡片 */
.message-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.msg-index {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

.sender-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.sender-tag.self {
  background: #DCFCE7;
  color: #16A34A;
}

.sender-tag.other {
  background: #DBEAFE;
  color: #2563EB;
}

.btn-remove {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
}

/* 用户卡片 */
.user-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.user-card h4 {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 12px 0;
}

/* 开关组 */
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.toggle-item span {
  font-size: 13px;
  color: #475569;
}

/* 设备选项 */
.device-options {
  display: flex;
  gap: 8px;
}

.device-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.device-btn.active {
  border-color: #4B6EF5;
  background: #EEF2FF;
  color: #4B6EF5;
}

/* 评论编辑器 */
.comments-editor {
  margin-top: 16px;
}

.comments-editor h4 {
  font-size: 13px;
  margin: 0 0 8px 0;
}

.comments-editor .comment-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.comments-editor .comment-item input {
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
}

.comments-editor .comment-item button {
  padding: 6px 10px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
}

.btn-add-comment {
  width: 100%;
  padding: 8px;
  border: 1px dashed #4B6EF5;
  border-radius: 6px;
  background: white;
  color: #4B6EF5;
  cursor: pointer;
  font-size: 12px;
}

/* 图片预览 */
.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-img {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 32px;
  color: #94a3b8;
}

/* 重置按钮 */
.btn-reset {
  width: 100%;
  padding: 12px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  margin-top: 16px;
}

.btn-reset:hover {
  background: #e2e8f0;
  color: #475569;
}

/* 预览区 */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.btn-download {
  padding: 8px 16px;
  border: none;
  background: linear-gradient(135deg, #4B6EF5, #6C5CE7);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-download:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(75, 110, 245, 0.3);
}

.btn-download.secondary {
  background: white;
  color: #4B6EF5;
  border: 1px solid #4B6EF5;
}

.preview-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  overflow-y: auto;
}

.preview-wrapper {
  transform-origin: top center;
}
</style>
