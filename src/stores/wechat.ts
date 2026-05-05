import { defineStore } from 'pinia'

export interface WeChatMessage {
  id: string
  type: 'text' | 'image' | 'voice' | 'video' | 'location' | 'transfer' | 'red_packet'
  content: string
  sender: string
  senderAvatar: string
  timestamp: string
  isSelf: boolean
  isRead: boolean
  imageUrl?: string
  voiceDuration?: number
  amount?: number
  location?: { name: string; address: string }
}

export interface WeChatChat {
  id: string
  type: 'private' | 'group'
  name: string
  avatar: string
  lastMessage: string
  lastTime: string
  unreadCount: number
  messages: WeChatMessage[]
  memberCount?: number
  members?: Array<{ name: string; avatar: string }>
}

export interface WeChatSettings {
  userName: string
  wechatId: string
  avatarUrl: string
  phoneNumber: string
  theme: 'light' | 'dark'
  showTime: boolean
  enableNotifications: boolean
}

export const useWeChatStore = defineStore('wechat', {
  state: () => ({
    // 简化版：用于单个聊天记录生成
    chatName: '好友昵称',
    chatType: 'private' as 'private' | 'group',
    messages: [] as Array<{
      id?: string
      type: 'text' | 'image' | 'voice' | 'video' | 'location' | 'transfer' | 'red_packet'
      content: string
      isSelf: boolean
      timestamp: string
      sender?: string
    }>,
    
    settings: {
      userName: '张三',
      wechatId: 'zhangsan123',
      avatarUrl: '',
      phoneNumber: '138****5678',
      theme: 'light',
      showTime: true,
      enableNotifications: true
    } as WeChatSettings
  }),
  
  actions: {
    addMessage(message: any) {
      this.messages.push({
        id: `msg_${Date.now()}`,
        ...message
      })
    },
    
    deleteMessage(index: number) {
      this.messages.splice(index, 1)
    },
    
    clearMessages() {
      this.messages = []
    },
    
    updateSettings(settings: Partial<WeChatSettings>) {
      this.settings = { ...this.settings, ...settings }
    }
  }
})
