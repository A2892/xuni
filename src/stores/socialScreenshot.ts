import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ChatMessage {
  id: string
  sender: 'self' | 'other'
  type: 'text' | 'image' | 'voice' | 'emoji' | 'video' | 'location' | 'transfer' | 'redpacket'
  content: string
  time: string
  status?: 'sending' | 'sent' | 'read' | 'failed'
  voiceDuration?: number
  transferAmount?: number
  transferNote?: string
  redpacketAmount?: number
  redpacketMessage?: string
  imageUrl?: string
  location?: {
    name: string
    address: string
  }
}

export interface SocialData {
  // 平台
  platform: 'wechat' | 'qq' | 'weibo' | 'douyin' | 'xiaohongshu' | 'telegram' | 'whatsapp' | 'line' | 'kakaotalk'
  
  // 聊天界面
  chatMode: 'single' | 'group' | 'moments' | 'profile'
  
  // 对方信息
  otherName: string
  otherAvatar: string
  otherNote: string
  otherSignature: string
  otherGender: 'male' | 'female' | 'unknown'
  otherStatus: 'online' | 'offline' | 'busy' | 'away'
  otherLastSeen: string
  
  // 自己信息
  selfName: string
  selfAvatar: string
  selfSignature: string
  
  // 群聊信息
  groupName: string
  groupAvatar: string
  groupMemberCount: number
  groupMembers: { name: string, avatar: string }[]
  
  // 聊天消息
  messages: ChatMessage[]
  
  // 朋友圈/动态
  momentContent: string
  momentImages: string[]
  momentTime: string
  momentLikes: number
  momentComments: { name: string, content: string, avatar: string }[]
  momentLocation: string
  
  // 设备设置
  deviceType: 'iphone' | 'android'
  showTime: string
  showBattery: number
  showSignal: number
  showWifi: boolean
  darkMode: boolean
  
  // 显示设置
  showInputBar: boolean
  showStatusBar: boolean
  inputText: string
}

export const socialPlatforms = [
  { id: 'wechat', label: '微信', icon: '💬', color: '#07C160' },
  { id: 'qq', label: 'QQ', icon: '🐧', color: '#12B7F5' },
  { id: 'weibo', label: '微博', icon: '🌐', color: '#E6162D' },
  { id: 'douyin', label: '抖音', icon: '🎵', color: '#000000' },
  { id: 'xiaohongshu', label: '小红书', icon: '📕', color: '#FF2442' },
  { id: 'telegram', label: 'Telegram', icon: '✈️', color: '#0088CC' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '📱', color: '#25D366' },
  { id: 'line', label: 'LINE', icon: '💚', color: '#00B900' },
  { id: 'kakaotalk', label: 'KakaoTalk', icon: '💛', color: '#FFE812' }
]

export const chatModes = [
  { id: 'single', label: '私聊', icon: '👤' },
  { id: 'group', label: '群聊', icon: '👥' },
  { id: 'moments', label: '动态/朋友圈', icon: '📸' },
  { id: 'profile', label: '个人资料', icon: '📋' }
]

export const messageTypes = [
  { id: 'text', label: '文字', icon: '💬' },
  { id: 'image', label: '图片', icon: '🖼️' },
  { id: 'voice', label: '语音', icon: '🎤' },
  { id: 'emoji', label: '表情', icon: '😊' },
  { id: 'video', label: '视频', icon: '🎬' },
  { id: 'location', label: '位置', icon: '📍' },
  { id: 'transfer', label: '转账', icon: '💰' },
  { id: 'redpacket', label: '红包', icon: '🧧' }
]

export const useSocialScreenshotStore = defineStore('socialScreenshot', () => {
  const data = ref<SocialData>({
    platform: 'wechat',
    chatMode: 'single',
    
    otherName: '张三',
    otherAvatar: '',
    otherNote: '',
    otherSignature: '今天天气不错',
    otherGender: 'male',
    otherStatus: 'online',
    otherLastSeen: '刚刚',
    
    selfName: '我',
    selfAvatar: '',
    selfSignature: '',
    
    groupName: '同学群',
    groupAvatar: '',
    groupMemberCount: 50,
    groupMembers: [],
    
    messages: [
      { id: '1', sender: 'other', type: 'text', content: '你好，在吗？', time: '10:30', status: 'read' },
      { id: '2', sender: 'self', type: 'text', content: '在的，什么事？', time: '10:31', status: 'read' },
      { id: '3', sender: 'other', type: 'text', content: '明天有空吗？一起吃个饭', time: '10:32', status: 'read' },
      { id: '4', sender: 'self', type: 'text', content: '好的，几点？', time: '10:33', status: 'sent' }
    ],
    
    momentContent: '今天是个好日子！',
    momentImages: [],
    momentTime: '2小时前',
    momentLikes: 128,
    momentComments: [],
    momentLocation: '北京市朝阳区',
    
    deviceType: 'iphone',
    showTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    showBattery: 85,
    showSignal: 4,
    showWifi: true,
    darkMode: false,
    
    showInputBar: true,
    showStatusBar: true,
    inputText: ''
  })

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addMessage = (type: ChatMessage['type'] = 'text', sender: ChatMessage['sender'] = 'self', content: string = '') => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      sender,
      type,
      content: content || (type === 'text' ? '新消息' : ''),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: sender === 'self' ? 'sent' : 'read'
    }

    if (type === 'voice') {
      newMessage.voiceDuration = Math.floor(Math.random() * 30) + 5
    } else if (type === 'transfer') {
      newMessage.transferAmount = 100
      newMessage.transferNote = '转账'
    } else if (type === 'redpacket') {
      newMessage.redpacketAmount = 88
      newMessage.redpacketMessage = '恭喜发财，大吉大利'
    } else if (type === 'location') {
      newMessage.location = {
        name: '北京天安门',
        address: '北京市东城区长安街'
      }
    }

    data.value.messages.push(newMessage)
    return newMessage.id
  }

  const removeMessage = (id: string) => {
    const index = data.value.messages.findIndex(m => m.id === id)
    if (index > -1) {
      data.value.messages.splice(index, 1)
    }
  }

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    const message = data.value.messages.find(m => m.id === id)
    if (message) {
      Object.assign(message, updates)
    }
  }

  const clearMessages = () => {
    data.value.messages = []
  }

  const addMomentComment = (name: string, content: string, avatar: string = '') => {
    data.value.momentComments.push({ name, content, avatar })
  }

  const removeMomentComment = (index: number) => {
    data.value.momentComments.splice(index, 1)
  }

  const addMomentImage = (url: string) => {
    data.value.momentImages.push(url)
  }

  const removeMomentImage = (index: number) => {
    data.value.momentImages.splice(index, 1)
  }

  const setPlatformDefaults = (platform: SocialData['platform']) => {
    data.value.platform = platform
    
    // 根据平台设置默认样式
    switch (platform) {
      case 'wechat':
        data.value.darkMode = false
        break
      case 'qq':
        data.value.darkMode = false
        break
      case 'telegram':
        data.value.darkMode = true
        break
      case 'douyin':
        data.value.darkMode = true
        break
      default:
        data.value.darkMode = false
    }
  }

  const reset = () => {
    data.value = {
      platform: 'wechat',
      chatMode: 'single',
      
      otherName: '张三',
      otherAvatar: '',
      otherNote: '',
      otherSignature: '今天天气不错',
      otherGender: 'male',
      otherStatus: 'online',
      otherLastSeen: '刚刚',
      
      selfName: '我',
      selfAvatar: '',
      selfSignature: '',
      
      groupName: '同学群',
      groupAvatar: '',
      groupMemberCount: 50,
      groupMembers: [],
      
      messages: [
        { id: '1', sender: 'other', type: 'text', content: '你好，在吗？', time: '10:30', status: 'read' },
        { id: '2', sender: 'self', type: 'text', content: '在的，什么事？', time: '10:31', status: 'read' }
      ],
      
      momentContent: '今天是个好日子！',
      momentImages: [],
      momentTime: '2小时前',
      momentLikes: 128,
      momentComments: [],
      momentLocation: '北京市朝阳区',
      
      deviceType: 'iphone',
      showTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      showBattery: 85,
      showSignal: 4,
      showWifi: true,
      darkMode: false,
      
      showInputBar: true,
      showStatusBar: true,
      inputText: ''
    }
  }

  return {
    data,
    addMessage,
    removeMessage,
    updateMessage,
    clearMessages,
    addMomentComment,
    removeMomentComment,
    addMomentImage,
    removeMomentImage,
    setPlatformDefaults,
    reset
  }
})
