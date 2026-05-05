/**
 * Message 消息提示服务
 * 用于全局展示操作反馈信息
 */

import { createApp, h, reactive, TransitionGroup, defineComponent, ref } from 'vue'

// 消息类型
export type MessageType = 'success' | 'warning' | 'error' | 'info' | 'loading'

// 消息配置
export interface MessageOptions {
  // 消息内容
  content: string
  // 消息类型
  type?: MessageType
  // 显示时长 (ms), 0 表示不自动关闭
  duration?: number
  // 是否显示关闭按钮
  closable?: boolean
  // 是否显示图标
  showIcon?: boolean
  // 关闭回调
  onClose?: () => void
  // 唯一标识
  key?: string | number
}

// 消息实例
interface MessageInstance {
  id: number
  content: string
  type: MessageType
  duration: number
  closable: boolean
  showIcon: boolean
  onClose?: () => void
  key?: string | number
}

// 消息列表
const messages = reactive<MessageInstance[]>([])
let messageId = 0

// 创建消息容器
let messageContainer: HTMLElement | null = null
let appInstance: any = null

// 获取类型对应的图标
function getIconSvg(type: MessageType): string {
  const icons: Record<MessageType, string> = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    loading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>'
  }
  return icons[type]
}

// 消息组件
const MessageComponent = defineComponent({
  name: 'Message',
  props: {
    messages: {
      type: Array as () => MessageInstance[],
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const handleClose = (id: number) => {
      emit('close', id)
    }
    
    return () => h(
      TransitionGroup,
      {
        name: 'message',
        tag: 'div',
        class: 'message-container'
      },
      () => props.messages.map(msg => h(
        'div',
        {
          key: msg.id,
          class: ['message', `message--${msg.type}`]
        },
        [
          // 图标
          msg.showIcon && h('span', {
            class: ['message__icon', msg.type === 'loading' ? 'message__icon--loading' : ''],
            innerHTML: getIconSvg(msg.type)
          }),
          // 内容
          h('span', { class: 'message__content' }, msg.content),
          // 关闭按钮
          msg.closable && h('button', {
            class: 'message__close',
            onClick: () => handleClose(msg.id),
            innerHTML: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
          })
        ]
      ))
    )
  }
})

// 初始化消息容器
function initMessageContainer() {
  if (messageContainer) return
  
  messageContainer = document.createElement('div')
  messageContainer.id = 'message-root'
  document.body.appendChild(messageContainer)
  
  // 注入样式
  const style = document.createElement('style')
  style.textContent = `
    .message-container {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    }
    
    .message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.06);
      pointer-events: auto;
      max-width: 400px;
    }
    
    .message__icon {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
    }
    
    .message__icon svg {
      width: 100%;
      height: 100%;
    }
    
    .message__icon--loading svg {
      animation: message-spin 1s linear infinite;
    }
    
    @keyframes message-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .message__content {
      font-size: 14px;
      color: #303133;
      line-height: 1.5;
    }
    
    .message__close {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #909399;
      margin-left: 4px;
    }
    
    .message__close:hover {
      color: #606266;
    }
    
    .message__close svg {
      width: 100%;
      height: 100%;
    }
    
    /* 类型样式 */
    .message--success .message__icon {
      color: #67c23a;
    }
    
    .message--warning .message__icon {
      color: #e6a23c;
    }
    
    .message--error .message__icon {
      color: #f56c6c;
    }
    
    .message--info .message__icon {
      color: #909399;
    }
    
    .message--loading .message__icon {
      color: #4B6EF5;
    }
    
    /* 动画 */
    .message-enter-active,
    .message-leave-active {
      transition: all 0.3s ease;
    }
    
    .message-enter-from {
      opacity: 0;
      transform: translateY(-20px);
    }
    
    .message-leave-to {
      opacity: 0;
      transform: translateY(-20px);
    }
    
    .message-move {
      transition: transform 0.3s ease;
    }
  `
  document.head.appendChild(style)
  
  // 创建 Vue 应用
  appInstance = createApp({
    setup() {
      const handleClose = (id: number) => {
        close(id)
      }
      
      return () => h(MessageComponent, {
        messages,
        onClose: handleClose
      })
    }
  })
  
  appInstance.mount(messageContainer)
}

// 关闭消息
function close(id: number) {
  const index = messages.findIndex(m => m.id === id)
  if (index !== -1) {
    const msg = messages[index]
    msg.onClose?.()
    messages.splice(index, 1)
  }
}

// 创建消息
function createMessage(options: MessageOptions | string): () => void {
  initMessageContainer()
  
  const opts: MessageOptions = typeof options === 'string' 
    ? { content: options }
    : options
  
  const id = ++messageId
  
  // 如果有相同 key,先移除旧的
  if (opts.key !== undefined) {
    const existIndex = messages.findIndex(m => m.key === opts.key)
    if (existIndex !== -1) {
      messages.splice(existIndex, 1)
    }
  }
  
  const instance: MessageInstance = {
    id,
    content: opts.content,
    type: opts.type || 'info',
    duration: opts.duration ?? 3000,
    closable: opts.closable ?? false,
    showIcon: opts.showIcon ?? true,
    onClose: opts.onClose,
    key: opts.key
  }
  
  messages.push(instance)
  
  // 自动关闭
  if (instance.duration > 0) {
    setTimeout(() => {
      close(id)
    }, instance.duration)
  }
  
  // 返回关闭函数
  return () => close(id)
}

// 消息方法
export const message = {
  // 普通消息
  open: (options: MessageOptions | string) => createMessage(options),
  
  // 成功消息
  success: (content: string, duration?: number) => 
    createMessage({ content, type: 'success', duration }),
  
  // 警告消息
  warning: (content: string, duration?: number) => 
    createMessage({ content, type: 'warning', duration }),
  
  // 错误消息
  error: (content: string, duration?: number) => 
    createMessage({ content, type: 'error', duration }),
  
  // 信息消息
  info: (content: string, duration?: number) => 
    createMessage({ content, type: 'info', duration }),
  
  // 加载消息
  loading: (content: string, duration?: number) => 
    createMessage({ content, type: 'loading', duration: duration ?? 0, closable: true }),
  
  // 销毁所有消息
  destroyAll: () => {
    messages.splice(0, messages.length)
  },
  
  // 配置
  config: (options: { maxCount?: number; top?: number }) => {
    // 可扩展配置
  }
}

export default message
