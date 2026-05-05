import { defineStore } from 'pinia'

export interface QQMessage {
  id?: string
  type: 'text' | 'image' | 'voice' | 'video' | 'location' | 'transfer' | 'red_packet'
  content: string
  isSelf: boolean
  timestamp: string
  sender?: string
  senderAvatar?: string
  imageUrl?: string
  voiceDuration?: number
  amount?: number
  location?: { name: string; address: string }
}

export interface QQSettings {
  deviceModel: string
  qqVersion: string
  showTime: boolean
  theme: 'light' | 'dark'
  fontSize: number
  showQQNumber: boolean
}

export const useQQStore = defineStore('qq', {
  state: () => ({
    chatName: 'QQ好友',
    chatType: 'private' as 'private' | 'group',
    
    messages: [
      {
        id: '1',
        isSelf: false,
        content: '你好啊',
        timestamp: '2024-01-15 14:30',
        type: 'text'
      },
      {
        id: '2',
        isSelf: true,
        content: '你好！',
        timestamp: '2024-01-15 14:31',
        type: 'text'
      }
    ] as QQMessage[],
    
    settings: {
      deviceModel: 'Android',
      qqVersion: '8.9.88',
      showTime: true,
      theme: 'light',
      fontSize: 16,
      showQQNumber: false
    } as QQSettings
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
    
    updateSettings(settings: Partial<QQSettings>) {
      this.settings = { ...this.settings, ...settings }
    }
  }
})
