<template>
  <div class="social-preview" :class="[data.platform, { dark: data.darkMode }]">
    <!-- 设备外框 -->
    <div class="device-frame" :class="data.deviceType">
      <!-- 状态栏 -->
      <div v-if="data.showStatusBar" class="status-bar">
        <div class="status-left">
          <span class="time">{{ data.showTime }}</span>
        </div>
        <div class="status-center">
          <div v-if="data.deviceType === 'iphone'" class="notch"></div>
        </div>
        <div class="status-right">
          <div class="signal-bars">
            <span v-for="i in 4" :key="i" :class="{ active: i <= data.showSignal }"></span>
          </div>
          <span v-if="data.showWifi" class="wifi-icon">📶</span>
          <span class="battery">{{ data.showBattery }}%</span>
        </div>
      </div>

      <!-- 聊天界面 -->
      <template v-if="data.chatMode === 'single' || data.chatMode === 'group'">
        <!-- 导航栏 -->
        <div class="chat-header">
          <button class="back-btn">‹</button>
          <div class="header-center">
            <span class="chat-title">{{ data.chatMode === 'group' ? data.groupName : data.otherName }}</span>
            <span v-if="data.chatMode === 'group'" class="member-count">({{ data.groupMemberCount }})</span>
          </div>
          <button class="more-btn">⋯</button>
        </div>

        <!-- 消息列表 -->
        <div class="messages-container">
          <div 
            v-for="msg in data.messages" 
            :key="msg.id"
            :class="['message-item', msg.sender, msg.type]"
          >
            <!-- 头像 -->
            <div class="avatar-wrap">
              <img 
                v-if="msg.sender === 'other' && data.otherAvatar" 
                :src="data.otherAvatar" 
                class="avatar"
              />
              <div v-else-if="msg.sender === 'other'" class="avatar default">👤</div>
              <img 
                v-if="msg.sender === 'self' && data.selfAvatar" 
                :src="data.selfAvatar" 
                class="avatar"
              />
              <div v-else-if="msg.sender === 'self'" class="avatar default">👤</div>
            </div>

            <!-- 消息内容 -->
            <div class="message-content">
              <!-- 文字消息 -->
              <div v-if="msg.type === 'text'" class="bubble text">
                {{ msg.content }}
              </div>

              <!-- 图片消息 -->
              <div v-else-if="msg.type === 'image'" class="bubble image">
                <img v-if="msg.imageUrl" :src="msg.imageUrl" alt="图片" />
                <div v-else class="image-placeholder">🖼️ 图片</div>
              </div>

              <!-- 语音消息 -->
              <div v-else-if="msg.type === 'voice'" class="bubble voice">
                <span class="voice-icon">🎤</span>
                <div class="voice-waves">
                  <span v-for="i in 5" :key="i"></span>
                </div>
                <span class="voice-duration">{{ msg.voiceDuration }}"</span>
              </div>

              <!-- 表情消息 -->
              <div v-else-if="msg.type === 'emoji'" class="emoji-msg">
                {{ msg.content }}
              </div>

              <!-- 转账消息 -->
              <div v-else-if="msg.type === 'transfer'" class="bubble transfer">
                <div class="transfer-icon">💰</div>
                <div class="transfer-info">
                  <span class="transfer-amount">¥{{ msg.transferAmount?.toFixed(2) }}</span>
                  <span class="transfer-note">{{ msg.transferNote || '转账' }}</span>
                </div>
                <div class="transfer-label">微信转账</div>
              </div>

              <!-- 红包消息 -->
              <div v-else-if="msg.type === 'redpacket'" class="bubble redpacket">
                <div class="redpacket-icon">🧧</div>
                <div class="redpacket-info">
                  <span class="redpacket-message">{{ msg.redpacketMessage || '恭喜发财' }}</span>
                </div>
                <div class="redpacket-label">微信红包</div>
              </div>

              <!-- 位置消息 -->
              <div v-else-if="msg.type === 'location'" class="bubble location">
                <div class="location-map">📍</div>
                <div class="location-info">
                  <span class="location-name">{{ msg.location?.name }}</span>
                  <span class="location-address">{{ msg.location?.address }}</span>
                </div>
              </div>

              <!-- 消息时间 -->
              <span class="message-time">{{ msg.time }}</span>
            </div>
          </div>
        </div>

        <!-- 输入栏 -->
        <div v-if="data.showInputBar" class="input-bar">
          <button class="voice-btn">🎤</button>
          <div class="input-field">
            <span v-if="data.inputText">{{ data.inputText }}</span>
            <span v-else class="placeholder">输入消息...</span>
          </div>
          <button class="emoji-btn">😊</button>
          <button class="more-btn">+</button>
        </div>
      </template>

      <!-- 朋友圈/动态界面 -->
      <template v-else-if="data.chatMode === 'moments'">
        <div class="moments-header">
          <button class="back-btn">‹</button>
          <span class="moments-title">朋友圈</span>
          <button class="camera-btn">📷</button>
        </div>

        <div class="moments-content">
          <!-- 用户信息 -->
          <div class="moment-user">
            <img 
              v-if="data.selfAvatar" 
              :src="data.selfAvatar" 
              class="moment-avatar"
            />
            <div v-else class="moment-avatar default">👤</div>
            <span class="moment-name">{{ data.selfName }}</span>
          </div>

          <!-- 动态内容 -->
          <div class="moment-body">
            <p class="moment-text">{{ data.momentContent }}</p>
            
            <!-- 图片网格 -->
            <div v-if="data.momentImages.length > 0" class="moment-images" :class="`grid-${Math.min(data.momentImages.length, 9)}`">
              <img 
                v-for="(img, i) in data.momentImages.slice(0, 9)" 
                :key="i" 
                :src="img" 
                class="moment-img"
              />
            </div>

            <!-- 位置和时间 -->
            <div class="moment-meta">
              <span class="moment-time">{{ data.momentTime }}</span>
              <span v-if="data.momentLocation" class="moment-location">📍 {{ data.momentLocation }}</span>
            </div>

            <!-- 互动区域 -->
            <div class="moment-actions">
              <div class="likes-section" v-if="data.momentLikes > 0">
                <span class="like-icon">❤️</span>
                <span class="like-count">{{ data.momentLikes }}人喜欢</span>
              </div>
              
              <div class="comments-section">
                <div 
                  v-for="(comment, i) in data.momentComments" 
                  :key="i"
                  class="comment-item"
                >
                  <span class="comment-name">{{ comment.name }}:</span>
                  <span class="comment-content">{{ comment.content }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 个人资料界面 -->
      <template v-else-if="data.chatMode === 'profile'">
        <div class="profile-header">
          <button class="back-btn">‹</button>
          <span class="profile-title">个人资料</span>
          <button class="more-btn">⋯</button>
        </div>

        <div class="profile-content">
          <div class="profile-card">
            <img 
              v-if="data.otherAvatar" 
              :src="data.otherAvatar" 
              class="profile-avatar"
            />
            <div v-else class="profile-avatar default">👤</div>
            
            <div class="profile-info">
              <h3 class="profile-name">{{ data.otherName }}</h3>
              <p class="profile-signature">{{ data.otherSignature }}</p>
            </div>
          </div>

          <div class="profile-details">
            <div class="detail-row">
              <span class="detail-label">备注名</span>
              <span class="detail-value">{{ data.otherNote || '无' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">性别</span>
              <span class="detail-value">{{ data.otherGender === 'male' ? '男' : data.otherGender === 'female' ? '女' : '未知' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">在线状态</span>
              <span class="detail-value status" :class="data.otherStatus">
                {{ data.otherStatus === 'online' ? '在线' : data.otherStatus === 'offline' ? '离线' : data.otherStatus === 'busy' ? '忙碌' : '离开' }}
              </span>
            </div>
          </div>

          <div class="profile-actions">
            <button class="action-btn message">发消息</button>
            <button class="action-btn video">视频通话</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSocialScreenshotStore } from '@/stores/socialScreenshot'

const store = useSocialScreenshotStore()
const data = store.data
</script>

<style scoped>
.social-preview {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.device-frame {
  width: 375px;
  background: #ededed;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.device-frame.iphone {
  border: 8px solid #1a1a1a;
}

.device-frame.android {
  border: 6px solid #333;
  border-radius: 30px;
}

/* 状态栏 */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: white;
  font-size: 12px;
  font-weight: 600;
}

.dark .status-bar {
  background: #1a1a1a;
  color: white;
}

.status-left .time {
  font-weight: 600;
}

.status-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.notch {
  width: 100px;
  height: 25px;
  background: black;
  border-radius: 0 0 20px 20px;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.signal-bars {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  height: 10px;
}

.signal-bars span {
  width: 3px;
  background: #ccc;
  border-radius: 1px;
}

.signal-bars span:nth-child(1) { height: 4px; }
.signal-bars span:nth-child(2) { height: 6px; }
.signal-bars span:nth-child(3) { height: 8px; }
.signal-bars span:nth-child(4) { height: 10px; }

.signal-bars span.active {
  background: currentColor;
}

.dark .signal-bars span.active {
  background: white;
}

.battery {
  font-size: 11px;
}

/* 聊天头部 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #ededed;
  border-bottom: 1px solid #d6d6d6;
}

.dark .chat-header {
  background: #1a1a1a;
  border-color: #333;
  color: white;
}

.wechat .chat-header {
  background: #ededed;
}

.back-btn, .more-btn {
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .back-btn, .dark .more-btn {
  color: white;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
}

.member-count {
  font-size: 12px;
  color: #666;
}

/* 消息容器 */
.messages-container {
  min-height: 400px;
  max-height: 500px;
  padding: 16px;
  overflow-y: auto;
  background: #ededed;
}

.dark .messages-container {
  background: #111;
}

.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.message-item.self {
  flex-direction: row-reverse;
}

.avatar-wrap .avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.avatar.default {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ccc;
  font-size: 20px;
}

.message-content {
  max-width: 65%;
  display: flex;
  flex-direction: column;
}

.message-item.self .message-content {
  align-items: flex-end;
}

/* 消息气泡 */
.bubble {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.4;
  position: relative;
}

.bubble.text {
  background: white;
  color: #333;
}

.self .bubble.text {
  background: #95ec69;
}

.dark .bubble.text {
  background: #262626;
  color: white;
}

.dark .self .bubble.text {
  background: #07c160;
}

/* 语音消息 */
.bubble.voice {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  background: white;
}

.self .bubble.voice {
  background: #95ec69;
  flex-direction: row-reverse;
}

.voice-waves {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 20px;
}

.voice-waves span {
  width: 2px;
  background: #999;
  border-radius: 1px;
  animation: wave 1s infinite ease-in-out;
}

.voice-waves span:nth-child(1) { height: 6px; animation-delay: 0s; }
.voice-waves span:nth-child(2) { height: 10px; animation-delay: 0.1s; }
.voice-waves span:nth-child(3) { height: 14px; animation-delay: 0.2s; }
.voice-waves span:nth-child(4) { height: 10px; animation-delay: 0.3s; }
.voice-waves span:nth-child(5) { height: 6px; animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.5); }
}

.voice-duration {
  font-size: 12px;
  color: #666;
}

/* 转账消息 */
.bubble.transfer {
  display: flex;
  flex-direction: column;
  background: #fa9d3b;
  color: white;
  min-width: 200px;
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
}

.transfer-icon {
  font-size: 24px;
  padding: 12px;
}

.transfer-info {
  padding: 0 12px 8px;
}

.transfer-amount {
  font-size: 20px;
  font-weight: 600;
  display: block;
}

.transfer-note {
  font-size: 12px;
  opacity: 0.9;
}

.transfer-label {
  background: rgba(0, 0, 0, 0.1);
  padding: 6px 12px;
  font-size: 11px;
}

/* 红包消息 */
.bubble.redpacket {
  display: flex;
  flex-direction: column;
  background: #fa4949;
  color: white;
  min-width: 200px;
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
}

.redpacket-icon {
  font-size: 32px;
  padding: 12px;
  text-align: center;
}

.redpacket-info {
  padding: 0 12px 8px;
}

.redpacket-message {
  font-size: 14px;
}

.redpacket-label {
  background: rgba(0, 0, 0, 0.1);
  padding: 6px 12px;
  font-size: 11px;
}

/* 位置消息 */
.bubble.location {
  display: flex;
  gap: 8px;
  background: white;
  min-width: 200px;
}

.location-map {
  font-size: 32px;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.location-name {
  font-weight: 600;
  font-size: 14px;
}

.location-address {
  font-size: 12px;
  color: #666;
}

/* 表情消息 */
.emoji-msg {
  font-size: 60px;
  line-height: 1;
}

/* 图片消息 */
.bubble.image {
  padding: 0;
  overflow: hidden;
}

.bubble.image img {
  max-width: 180px;
  max-height: 180px;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 120px;
  height: 120px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #999;
}

.message-time {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
}

/* 输入栏 */
.input-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f7f7f7;
  border-top: 1px solid #d6d6d6;
}

.dark .input-bar {
  background: #1a1a1a;
  border-color: #333;
}

.input-bar button {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.input-field {
  flex: 1;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  min-height: 36px;
}

.dark .input-field {
  background: #262626;
  color: white;
}

.input-field .placeholder {
  color: #999;
}

/* 朋友圈 */
.moments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: white;
  border-bottom: 1px solid #e6e6e6;
}

.moments-title {
  font-size: 17px;
  font-weight: 600;
}

.camera-btn {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.moments-content {
  padding: 16px;
  background: white;
}

.moment-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.moment-avatar {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  object-fit: cover;
}

.moment-avatar.default {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ccc;
  font-size: 24px;
}

.moment-name {
  font-weight: 600;
  font-size: 15px;
  color: #576b95;
}

.moment-body {
  padding-left: 56px;
}

.moment-text {
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.moment-images {
  display: grid;
  gap: 4px;
  margin-bottom: 8px;
}

.moment-images.grid-1 { grid-template-columns: 1fr; max-width: 200px; }
.moment-images.grid-2 { grid-template-columns: repeat(2, 1fr); max-width: 200px; }
.moment-images.grid-3 { grid-template-columns: repeat(3, 1fr); }
.moment-images.grid-4 { grid-template-columns: repeat(2, 1fr); max-width: 200px; }
.moment-images.grid-5,
.moment-images.grid-6 { grid-template-columns: repeat(3, 1fr); }
.moment-images.grid-7,
.moment-images.grid-8,
.moment-images.grid-9 { grid-template-columns: repeat(3, 1fr); }

.moment-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 2px;
}

.moment-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.moment-actions {
  background: #f7f7f7;
  padding: 8px;
  border-radius: 4px;
}

.likes-section {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 8px;
  font-size: 13px;
}

.like-icon {
  font-size: 12px;
}

.like-count {
  color: #576b95;
}

.comment-item {
  font-size: 13px;
  line-height: 1.6;
}

.comment-name {
  color: #576b95;
  font-weight: 500;
}

/* 个人资料 */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: white;
  border-bottom: 1px solid #e6e6e6;
}

.profile-title {
  font-size: 17px;
  font-weight: 600;
}

.profile-content {
  background: #f5f5f5;
  min-height: 500px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  background: white;
  margin-bottom: 12px;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
}

.profile-avatar.default {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ccc;
  font-size: 32px;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.profile-signature {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.profile-details {
  background: white;
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #333;
}

.detail-value {
  color: #999;
}

.detail-value.status.online { color: #07c160; }
.detail-value.status.offline { color: #999; }
.detail-value.status.busy { color: #fa5151; }
.detail-value.status.away { color: #fa9d3b; }

.profile-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn.message {
  background: #07c160;
  color: white;
}

.action-btn.video {
  background: white;
  color: #333;
  border: 1px solid #e6e6e6;
}

/* 平台特定样式 */
.qq .chat-header {
  background: linear-gradient(135deg, #12b7f5, #0095ff);
  color: white;
  border-bottom: none;
}

.qq .messages-container {
  background: #f5f5f5;
}

.telegram .chat-header {
  background: #232e3c;
  color: white;
}

.telegram .messages-container {
  background: #17212b;
}

.telegram .bubble.text {
  background: #2b5278;
  color: white;
}

.telegram .self .bubble.text {
  background: #2b5278;
}

.whatsapp .chat-header {
  background: #075e54;
  color: white;
}

.whatsapp .messages-container {
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQElEQVQoU2NkYGD4z0AFwEiJOhBTORgYGBj+///PgNMQkGKQIeRpwGkiqjTgNARsAtoasFuBwweE7KNEHQADAAAJGAdvcWHBqAAAAABJRU5ErkJggg==');
  background-color: #e5ddd5;
}

.whatsapp .bubble.text {
  background: white;
}

.whatsapp .self .bubble.text {
  background: #dcf8c6;
}

.line .chat-header {
  background: #00b900;
  color: white;
}

.line .self .bubble.text {
  background: #00b900;
  color: white;
}

.kakaotalk .chat-header {
  background: #ffe812;
  color: #3a1d1d;
}

.kakaotalk .self .bubble.text {
  background: #ffe812;
  color: #3a1d1d;
}
</style>
