import { createApp, h, ref, reactive } from 'vue'
import Toast from '@/components/Toast.vue'

export interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'
  closable?: boolean
  showProgress?: boolean
  icon?: string
}

interface ToastInstance {
  id: number
  options: ToastOptions
  close: () => void
}

// Toast 实例队列
const toasts = reactive<ToastInstance[]>([])
let toastId = 0

// 创建 Toast 容器
const createContainer = (position: string) => {
  const containerId = `toast-container-${position}`
  let container = document.getElementById(containerId)
  
  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    container.className = `toast-wrapper toast-wrapper--${position}`
    container.style.cssText = `
      position: fixed;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
      ${getPositionStyles(position)}
    `
    document.body.appendChild(container)
  }
  
  return container
}

const getPositionStyles = (position: string): string => {
  const styles: Record<string, string> = {
    'top-right': 'top: 1rem; right: 1rem; align-items: flex-end;',
    'top-left': 'top: 1rem; left: 1rem; align-items: flex-start;',
    'top-center': 'top: 1rem; left: 50%; transform: translateX(-50%); align-items: center;',
    'bottom-right': 'bottom: 1rem; right: 1rem; align-items: flex-end;',
    'bottom-left': 'bottom: 1rem; left: 1rem; align-items: flex-start;',
    'bottom-center': 'bottom: 1rem; left: 50%; transform: translateX(-50%); align-items: center;'
  }
  return styles[position] || styles['top-right']
}

// 显示 Toast
export const showToast = (options: ToastOptions | string): ToastInstance => {
  // 支持快捷调用 showToast('message')
  const opts: ToastOptions = typeof options === 'string' 
    ? { message: options }
    : options
    
  const position = opts.position || 'top-right'
  const container = createContainer(position)
  
  const id = ++toastId
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'pointer-events: all;'
  container.appendChild(wrapper)
  
  const close = () => {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
    }
    setTimeout(() => {
      app.unmount()
      wrapper.remove()
      // 清理空容器
      if (container.children.length === 0) {
        container.remove()
      }
    }, 300)
  }
  
  const app = createApp({
    render() {
      return h(Toast, {
        ...opts,
        onClose: close
      })
    }
  })
  
  app.mount(wrapper)
  
  const instance: ToastInstance = { id, options: opts, close }
  toasts.push(instance)
  
  return instance
}

// 快捷方法
export const toast = {
  show: showToast,
  
  info(message: string, options?: Partial<ToastOptions>) {
    return showToast({ ...options, message, type: 'info' })
  },
  
  success(message: string, options?: Partial<ToastOptions>) {
    return showToast({ ...options, message, type: 'success' })
  },
  
  warning(message: string, options?: Partial<ToastOptions>) {
    return showToast({ ...options, message, type: 'warning' })
  },
  
  error(message: string, options?: Partial<ToastOptions>) {
    return showToast({ ...options, message, type: 'error' })
  },
  
  // 清除所有 Toast
  clearAll() {
    toasts.forEach(t => t.close())
  }
}

// Vue 插件
export const ToastPlugin = {
  install(app: any) {
    app.config.globalProperties.$toast = toast
    app.provide('toast', toast)
  }
}

export default toast
