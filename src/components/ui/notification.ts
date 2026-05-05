/**
 * Notification 通知服务
 * 用于全局展示通知提醒信息
 */

import { createApp, h, reactive, TransitionGroup, defineComponent } from 'vue'

// 通知类型
export type NotificationType = 'success' | 'warning' | 'error' | 'info'

// 通知位置
export type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

// 通知配置
export interface NotificationOptions {
  // 标题
  title: string
  // 内容
  content?: string
  // 类型
  type?: NotificationType
  // 显示时长 (ms), 0 表示不自动关闭
  duration?: number
  // 是否显示关闭按钮
  closable?: boolean
  // 是否显示图标
  showIcon?: boolean
  // 位置
  placement?: NotificationPlacement
  // 关闭回调
  onClose?: () => void
  // 点击回调
  onClick?: () => void
  // 唯一标识
  key?: string | number
  // 自定义底部
  footer?: string
}

// 通知实例
interface NotificationInstance {
  id: number
  title: string
  content?: string
  type: NotificationType
  duration: number
  closable: boolean
  showIcon: boolean
  placement: NotificationPlacement
  onClose?: () => void
  onClick?: () => void
  key?: string | number
  footer?: string
}

// 通知列表 (按位置分组)
const notifications: Record<NotificationPlacement, NotificationInstance[]> = reactive({
  topLeft: [],
  topRight: [],
  bottomLeft: [],
  bottomRight: []
})

let notificationId = 0

// 容器实例
const containers: Record<NotificationPlacement, HTMLElement | null> = {
  topLeft: null,
  topRight: null,
  bottomLeft: null,
  bottomRight: null
}

const appInstances: Record<NotificationPlacement, any> = {
  topLeft: null,
  topRight: null,
  bottomLeft: null,
  bottomRight: null
}

// 获取类型对应的图标
function getIconSvg(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  }
  return icons[type]
}

// 通知组件
const NotificationComponent = defineComponent({
  name: 'Notification',
  props: {
    notifications: {
      type: Array as () => NotificationInstance[],
      required: true
    },
    placement: {
      type: String as () => NotificationPlacement,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const handleClose = (id: number) => {
      emit('close', id)
    }
    
    const handleClick = (item: NotificationInstance) => {
      item.onClick?.()
    }
    
    return () => h(
      TransitionGroup,
      {
        name: 'notification',
        tag: 'div',
        class: ['notification-container', `notification-container--${props.placement}`]
      },
      () => props.notifications.map(item => h(
        'div',
        {
          key: item.id,
          class: ['notification', `notification--${item.type}`],
          onClick: () => handleClick(item)
        },
        [
          // 图标
          item.showIcon && h('span', {
            class: 'notification__icon',
            innerHTML: getIconSvg(item.type)
          }),
          // 内容区域
          h('div', { class: 'notification__content' }, [
            h('div', { class: 'notification__title' }, item.title),
            item.content && h('div', { class: 'notification__description' }, item.content),
            item.footer && h('div', { class: 'notification__footer' }, item.footer)
          ]),
          // 关闭按钮
          item.closable && h('button', {
            class: 'notification__close',
            onClick: (e: Event) => {
              e.stopPropagation()
              handleClose(item.id)
            },
            innerHTML: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
          })
        ]
      ))
    )
  }
})

// 初始化通知容器
function initContainer(placement: NotificationPlacement) {
  if (containers[placement]) return
  
  const container = document.createElement('div')
  container.id = `notification-${placement}`
  document.body.appendChild(container)
  containers[placement] = container
  
  // 注入样式 (只注入一次)
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style')
    style.id = 'notification-styles'
    style.textContent = `
      .notification-container {
        position: fixed;
        z-index: 9998;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
        max-height: calc(100vh - 40px);
        overflow: hidden;
      }
      
      .notification-container--topLeft {
        top: 20px;
        left: 20px;
      }
      
      .notification-container--topRight {
        top: 20px;
        right: 20px;
      }
      
      .notification-container--bottomLeft {
        bottom: 20px;
        left: 20px;
        flex-direction: column-reverse;
      }
      
      .notification-container--bottomRight {
        bottom: 20px;
        right: 20px;
        flex-direction: column-reverse;
      }
      
      .notification {
        display: flex;
        gap: 12px;
        width: 360px;
        padding: 16px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.06);
        pointer-events: auto;
        cursor: pointer;
        transition: box-shadow 0.2s;
      }
      
      .notification:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
      }
      
      .notification__icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        margin-top: 2px;
      }
      
      .notification__icon svg {
        width: 100%;
        height: 100%;
      }
      
      .notification__content {
        flex: 1;
        min-width: 0;
      }
      
      .notification__title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        line-height: 1.5;
        margin-bottom: 4px;
      }
      
      .notification__description {
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
      }
      
      .notification__footer {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #e4e7ed;
        font-size: 12px;
        color: #909399;
      }
      
      .notification__close {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        color: #909399;
        transition: color 0.2s;
      }
      
      .notification__close:hover {
        color: #606266;
      }
      
      .notification__close svg {
        width: 100%;
        height: 100%;
      }
      
      /* 类型样式 */
      .notification--success .notification__icon {
        color: #67c23a;
      }
      
      .notification--warning .notification__icon {
        color: #e6a23c;
      }
      
      .notification--error .notification__icon {
        color: #f56c6c;
      }
      
      .notification--info .notification__icon {
        color: #909399;
      }
      
      /* 动画 */
      .notification-enter-active,
      .notification-leave-active {
        transition: all 0.3s ease;
      }
      
      .notification-container--topLeft .notification-enter-from,
      .notification-container--bottomLeft .notification-enter-from {
        opacity: 0;
        transform: translateX(-100%);
      }
      
      .notification-container--topRight .notification-enter-from,
      .notification-container--bottomRight .notification-enter-from {
        opacity: 0;
        transform: translateX(100%);
      }
      
      .notification-leave-to {
        opacity: 0;
        transform: translateX(100%);
      }
      
      .notification-container--topLeft .notification-leave-to,
      .notification-container--bottomLeft .notification-leave-to {
        transform: translateX(-100%);
      }
      
      .notification-move {
        transition: transform 0.3s ease;
      }
    `
    document.head.appendChild(style)
  }
  
  // 创建 Vue 应用
  appInstances[placement] = createApp({
    setup() {
      const handleClose = (id: number) => {
        close(id, placement)
      }
      
      return () => h(NotificationComponent, {
        notifications: notifications[placement],
        placement,
        onClose: handleClose
      })
    }
  })
  
  appInstances[placement].mount(container)
}

// 关闭通知
function close(id: number, placement?: NotificationPlacement) {
  const placements = placement ? [placement] : Object.keys(notifications) as NotificationPlacement[]
  
  for (const p of placements) {
    const index = notifications[p].findIndex(n => n.id === id)
    if (index !== -1) {
      const item = notifications[p][index]
      item.onClose?.()
      notifications[p].splice(index, 1)
      break
    }
  }
}

// 创建通知
function createNotification(options: NotificationOptions): () => void {
  const placement = options.placement || 'topRight'
  initContainer(placement)
  
  const id = ++notificationId
  
  // 如果有相同 key,先移除旧的
  if (options.key !== undefined) {
    for (const p of Object.keys(notifications) as NotificationPlacement[]) {
      const existIndex = notifications[p].findIndex(n => n.key === options.key)
      if (existIndex !== -1) {
        notifications[p].splice(existIndex, 1)
        break
      }
    }
  }
  
  const instance: NotificationInstance = {
    id,
    title: options.title,
    content: options.content,
    type: options.type || 'info',
    duration: options.duration ?? 4500,
    closable: options.closable ?? true,
    showIcon: options.showIcon ?? true,
    placement,
    onClose: options.onClose,
    onClick: options.onClick,
    key: options.key,
    footer: options.footer
  }
  
  notifications[placement].push(instance)
  
  // 自动关闭
  if (instance.duration > 0) {
    setTimeout(() => {
      close(id, placement)
    }, instance.duration)
  }
  
  // 返回关闭函数
  return () => close(id, placement)
}

// 通知方法
export const notification = {
  // 打开通知
  open: (options: NotificationOptions) => createNotification(options),
  
  // 成功通知
  success: (options: Omit<NotificationOptions, 'type'>) => 
    createNotification({ ...options, type: 'success' }),
  
  // 警告通知
  warning: (options: Omit<NotificationOptions, 'type'>) => 
    createNotification({ ...options, type: 'warning' }),
  
  // 错误通知
  error: (options: Omit<NotificationOptions, 'type'>) => 
    createNotification({ ...options, type: 'error' }),
  
  // 信息通知
  info: (options: Omit<NotificationOptions, 'type'>) => 
    createNotification({ ...options, type: 'info' }),
  
  // 关闭通知
  close: (key: string | number) => {
    for (const p of Object.keys(notifications) as NotificationPlacement[]) {
      const index = notifications[p].findIndex(n => n.key === key)
      if (index !== -1) {
        const item = notifications[p][index]
        item.onClose?.()
        notifications[p].splice(index, 1)
        break
      }
    }
  },
  
  // 销毁所有通知
  destroyAll: () => {
    for (const p of Object.keys(notifications) as NotificationPlacement[]) {
      notifications[p].splice(0, notifications[p].length)
    }
  },
  
  // 配置
  config: (options: { placement?: NotificationPlacement; duration?: number }) => {
    // 可扩展配置
  }
}

export default notification
