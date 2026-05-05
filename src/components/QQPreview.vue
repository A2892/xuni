<template>
  <div class="qq-preview">
    <div class="phone-container" :class="{ 'dark-mode': settings.theme === 'dark' }">
      <!-- 状态栏 -->
      <div class="status-bar">
        <div class="status-left">
          <span class="signal">●●●●●</span>
          <span class="carrier">中国移动</span>
          <span class="network">5G</span>
        </div>
        <span class="time">{{ currentTime }}</span>
        <div class="status-right">
          <span class="battery-percent">100%</span>
          <span class="battery">🔋</span>
        </div>
      </div>

      <!-- 导航栏 -->
      <div class="nav-bar">
        <button class="nav-btn" @click="$emit('back')">
          <span>‹</span>
        </button>
        <div class="nav-title">
          <h3>{{ currentChat?.name || 'QQ' }}</h3>
          <p v-if="currentChat?.type === 'group'">
            ({{ currentChat.memberCount || 0 }})
          </p>
        </div>
        <button class="nav-btn">
          <span>≡</span>
        </button>
      </div>

      <!-- 聊天内容 -->
      <div class="chat-content" ref="chatContent">
        <div v-for="(message, index) in messages" :key="message.id" class="message-wrapper">
          <!-- 时间分隔 -->
          <div v-if="showTimeLabel(index)" class="time-label">
            {{ message.timestamp }}
          </div>

          <!-- 消息气泡 -->
          <div :class="['message-item', { 'self': message.isSelf }]">
            <!-- 头像 -->
            <div class="avatar">
              <img v-if="message.senderAvatar" :src="message.senderAvatar" alt="" />
              <span v-else class="avatar-placeholder">{{ message.sender.charAt(0) }}</span>
            </div>

            <!-- 消息内容 -->
            <div class="message-content">
              <!-- 发送者名称（群聊） -->
              <div v-if="currentChat?.type === 'group' && !message.isSelf" class="sender-name">
                {{ message.sender }}
              </div>

              <!-- 不同类型的消息 -->
              <div :class="['message-bubble', message.type]">
                <!-- 文字消息 -->
                <template v-if="message.type === 'text'">
                  {{ message.content }}
                </template>

                <!-- 图片消息 -->
                <template v-else-if="message.type === 'image'">
                  <img :src="message.imageUrl" alt="" class="message-image" />
                </template>

                <!-- 语音消息 -->
                <template v-else-if="message.type === 'voice'">
                  <div class="voice-message">
                    <span class="voice-icon">🎤</span>
                    <span class="voice-duration">{{ message.voiceDuration }}"</span>
                  </div>
                </template>

                <!-- 视频消息 -->
                <template v-else-if="message.type === 'video'">
                  <div class="video-message">
                    <img :src="message.imageUrl" alt="" class="video-thumbnail" />
                    <span class="play-icon">▶</span>
                  </div>
                </template>

                <!-- 位置消息 -->
                <template v-else-if="message.type === 'location'">
                  <div class="location-message">
                    <div class="location-icon">📍</div>
                    <div class="location-info">
                      <div class="location-name">{{ message.location?.name }}</div>
                      <div class="location-address">{{ message.location?.address }}</div>
                    </div>
                  </div>
                </template>

                <!-- 转账消息 -->
                <template v-else-if="message.type === 'transfer'">
                  <div class="transfer-message">
                    <div class="transfer-icon">💰</div>
                    <div class="transfer-info">
                      <div class="transfer-title">转账</div>
                      <div class="transfer-amount">¥{{ message.amount }}</div>
                    </div>
                  </div>
                </template>

                <!-- 红包消息 -->
                <template v-else-if="message.type === 'red_packet'">
                  <div class="redpacket-message">
                    <div class="redpacket-icon">🧧</div>
                    <div class="redpacket-info">
                      <div class="redpacket-title">{{ message.content || '恭喜发财，大吉大利' }}</div>
                      <div class="redpacket-subtitle">QQ红包</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入栏 -->
      <div class="input-bar">
        <button class="input-btn">🎤</button>
        <div class="input-field">
          <input type="text" placeholder="..." readonly />
        </div>
        <button class="input-btn">😊</button>
        <button class="input-btn">+</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { QQChat, QQSettings } from '@/stores/qq'

const props = defineProps<{
  currentChat: QQChat | undefined
  settings: QQSettings
}>()

const chatContent = ref<HTMLElement>()
const currentTime = ref('')

// 获取消息列表
const messages = computed(() => props.currentChat?.messages || [])

// 判断是否显示时间标签
const showTimeLabel = (index: number): boolean => {
  if (!props.settings.showTime) return false
  if (index === 0) return true
  
  // 每5条消息显示一次时间
  return index % 5 === 0
}

// 更新当前时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000) // 每分钟更新一次
  
  // 滚动到底部
  if (chatContent.value) {
    chatContent.value.scrollTop = chatContent.value.scrollHeight
  }
})
</script>

<style scoped>
.qq-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f5f5f5;
}

.phone-container {
  width: 390px;
  height: 844px;
  background: #f2f2f2;
  border-radius: 50px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 
              0 0 0 8px #2a2a2a,
              0 0 0 10px #1a1a1a,
              inset 0 0 0 2px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.phone-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 170px;
  height: 35px;
  background: #000;
  border-radius: 0 0 24px 24px;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.phone-container::after {
  content: '';
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 5px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  z-index: 100;
}

/* 状态栏 */
.status-bar {
  height: 48px;
  background: linear-gradient(to right, #12b7f5, #00a0e9);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 20px 5px;
  font-size: 15px;
  position: relative;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  padding-left: 5px;
}

.signal {
  font-size: 10px;
  letter-spacing: -2px;
  color: white;
}

.carrier {
  font-size: 15px;
  font-weight: 400;
}

.network {
  font-size: 15px;
  font-weight: 600;
}

.time {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 15px;
  font-weight: 600;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
}

.battery-percent {
  font-size: 15px;
  font-weight: 600;
}

.battery {
  font-size: 18px;
}

/* 导航栏 */
.nav-bar {
  height: 44px;
  background: linear-gradient(to right, #12b7f5, #00a0e9);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: none;
  color: white;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: white;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 300;
  line-height: 1;
}

.nav-title {
  flex: 1;
  text-align: center;
}

.nav-title h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: white;
}

.nav-title p {
  margin: 2px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

/* 聊天内容 */
.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 20px;
  background: #f2f2f2;
  margin-bottom: 8px;
}

.message-wrapper {
  margin-bottom: 15px;
}

.time-label {
  text-align: center;
  font-size: 12px;
  color: #b0b0b0;
  margin: 15px 0;
  font-weight: 400;
  background: rgba(0,0,0,0.05);
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.message-item.self {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 18px;
  color: #999;
  font-weight: bold;
}

.message-content {
  max-width: 65%;
  display: flex;
  flex-direction: column;
}

.message-item.self .message-content {
  align-items: flex-end;
}

.sender-name {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  padding: 0 5px;
}

.message-bubble {
  padding: 10px 12px;
  border-radius: 10px;
  word-wrap: break-word;
  font-size: 16px;
  line-height: 1.4;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.message-item:not(.self) .message-bubble {
  background: white;
  color: #000;
  border-top-left-radius: 2px;
}

.message-item.self .message-bubble {
  background: #12b7f5;
  color: white;
  border-top-right-radius: 2px;
}

/* 图片消息 */
.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  display: block;
}

/* 语音消息 */
.voice-message {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 60px;
}

.voice-icon {
  font-size: 18px;
}

.voice-duration {
  font-size: 14px;
}

/* 视频消息 */
.video-message {
  position: relative;
  max-width: 200px;
  max-height: 200px;
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  display: block;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 30px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 位置消息 */
.location-message {
  display: flex;
  gap: 10px;
  min-width: 200px;
  background: white;
  padding: 10px;
  border-radius: 8px;
}

.location-icon {
  font-size: 24px;
}

.location-info {
  flex: 1;
}

.location-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
  color: #000;
}

.location-address {
  font-size: 13px;
  color: #888;
}

/* 转账消息 */
.transfer-message {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 180px;
  background: #f7931e;
  color: white;
  padding: 12px;
  border-radius: 8px;
}

.transfer-icon {
  font-size: 30px;
}

.transfer-title {
  font-size: 14px;
  margin-bottom: 4px;
}

.transfer-amount {
  font-size: 20px;
  font-weight: bold;
}

/* 红包消息 */
.redpacket-message {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 200px;
  background: #d93b3b;
  color: white;
  padding: 15px;
  border-radius: 8px;
}

.redpacket-icon {
  font-size: 35px;
}

.redpacket-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.redpacket-subtitle {
  font-size: 12px;
  opacity: 0.9;
}

/* 输入栏 */
.input-bar {
  height: 50px;
  background: #f9f9f9;
  border-top: 0.5px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 8px;
}

.input-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f7f7f;
}

.input-field {
  flex: 1;
  height: 36px;
}

.input-field input {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  border-radius: 18px;
  padding: 0 15px;
  font-size: 15px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* 暗黑模式 */
.dark-mode {
  background: #1e1e1e;
}

.dark-mode .nav-bar {
  background: #2c2c2c;
  border-bottom-color: #3a3a3a;
}

.dark-mode .nav-title h3,
.dark-mode .nav-btn {
  color: #fff;
}

.dark-mode .chat-content {
  background: #1e1e1e;
}

.dark-mode .message-bubble {
  background: #3a3a3a;
  color: #fff;
}

.dark-mode .message-item.self .message-bubble {
  background: #12b7f5;
}

.dark-mode .input-bar {
  background: #2c2c2c;
  border-top-color: #3a3a3a;
}

/* 滚动条 */
.chat-content::-webkit-scrollbar {
  width: 0;
}
</style>