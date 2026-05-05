/**
 * 动画工具函数 - 动画和过渡效果
 */

// ==================== 缓动函数 ====================

export type EasingFunction = (t: number) => number

export const easings = {
  // 线性
  linear: (t: number) => t,
  
  // 缓入
  easeInQuad: (t: number) => t * t,
  easeInCubic: (t: number) => t * t * t,
  easeInQuart: (t: number) => t * t * t * t,
  easeInQuint: (t: number) => t * t * t * t * t,
  easeInSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  easeInCirc: (t: number) => 1 - Math.sqrt(1 - t * t),
  easeInBack: (t: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return c3 * t * t * t - c1 * t * t
  },
  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
  },
  easeInBounce: (t: number) => 1 - easings.easeOutBounce(1 - t),
  
  // 缓出
  easeOutQuad: (t: number) => t * (2 - t),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeOutQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeOutCirc: (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  easeOutBack: (t: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
  easeOutBounce: (t: number) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  },
  
  // 缓入缓出
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  easeInOutQuint: (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInOutExpo: (t: number) =>
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  easeInOutCirc: (t: number) =>
    t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  easeInOutBack: (t: number) => {
    const c1 = 1.70158
    const c2 = c1 * 1.525
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
  },
  easeInOutElastic: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5
    return t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
  },
  easeInOutBounce: (t: number) =>
    t < 0.5 ? (1 - easings.easeOutBounce(1 - 2 * t)) / 2 : (1 + easings.easeOutBounce(2 * t - 1)) / 2
}

// ==================== 基础动画 ====================

export interface AnimationOptions {
  duration?: number
  easing?: EasingFunction | keyof typeof easings
  delay?: number
  onUpdate?: (value: number) => void
  onComplete?: () => void
}

export interface AnimationController {
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
  reverse: () => void
  progress: () => number
}

/**
 * 创建动画
 */
export function animate(
  from: number,
  to: number,
  options: AnimationOptions = {}
): AnimationController {
  const {
    duration = 300,
    easing = 'easeOutQuad',
    delay = 0,
    onUpdate,
    onComplete
  } = options

  const easingFn = typeof easing === 'function' ? easing : easings[easing]
  
  let startTime: number | null = null
  let pausedAt: number | null = null
  let animationId: number | null = null
  let currentProgress = 0
  let isReversed = false
  
  const tick = (timestamp: number) => {
    if (startTime === null) startTime = timestamp
    
    const elapsed = timestamp - startTime
    currentProgress = Math.min(elapsed / duration, 1)
    
    const easedProgress = isReversed ? easingFn(1 - currentProgress) : easingFn(currentProgress)
    const currentValue = from + (to - from) * easedProgress
    
    onUpdate?.(currentValue)
    
    if (currentProgress < 1) {
      animationId = requestAnimationFrame(tick)
    } else {
      animationId = null
      onComplete?.()
    }
  }
  
  return {
    start: () => {
      if (delay > 0) {
        setTimeout(() => {
          animationId = requestAnimationFrame(tick)
        }, delay)
      } else {
        animationId = requestAnimationFrame(tick)
      }
    },
    stop: () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
      startTime = null
      currentProgress = 0
    },
    pause: () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
        animationId = null
        pausedAt = currentProgress * duration
      }
    },
    resume: () => {
      if (pausedAt !== null) {
        startTime = null
        animationId = requestAnimationFrame((timestamp) => {
          startTime = timestamp - pausedAt!
          pausedAt = null
          tick(timestamp)
        })
      }
    },
    reverse: () => {
      isReversed = !isReversed
    },
    progress: () => currentProgress
  }
}

/**
 * 数值动画
 */
export function animateValue(
  element: HTMLElement,
  property: string,
  from: number,
  to: number,
  options: AnimationOptions & { unit?: string } = {}
): AnimationController {
  const { unit = '', ...animOptions } = options
  
  return animate(from, to, {
    ...animOptions,
    onUpdate: (value) => {
      element.style.setProperty(property, `${value}${unit}`)
      options.onUpdate?.(value)
    }
  })
}

/**
 * 颜色动画
 */
export function animateColor(
  element: HTMLElement,
  property: string,
  fromColor: string,
  toColor: string,
  options: AnimationOptions = {}
): AnimationController {
  const parseColor = (color: string): [number, number, number] => {
    const hex = color.replace('#', '')
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ]
  }
  
  const [r1, g1, b1] = parseColor(fromColor)
  const [r2, g2, b2] = parseColor(toColor)
  
  return animate(0, 1, {
    ...options,
    onUpdate: (progress) => {
      const r = Math.round(r1 + (r2 - r1) * progress)
      const g = Math.round(g1 + (g2 - g1) * progress)
      const b = Math.round(b1 + (b2 - b1) * progress)
      element.style.setProperty(property, `rgb(${r}, ${g}, ${b})`)
      options.onUpdate?.(progress)
    }
  })
}

// ==================== 预设动画 ====================

/**
 * 淡入
 */
export function fadeIn(
  element: HTMLElement,
  options: AnimationOptions = {}
): AnimationController {
  element.style.opacity = '0'
  element.style.display = ''
  
  return animate(0, 1, {
    ...options,
    onUpdate: (value) => {
      element.style.opacity = String(value)
      options.onUpdate?.(value)
    }
  })
}

/**
 * 淡出
 */
export function fadeOut(
  element: HTMLElement,
  options: AnimationOptions = {}
): AnimationController {
  return animate(1, 0, {
    ...options,
    onUpdate: (value) => {
      element.style.opacity = String(value)
      options.onUpdate?.(value)
    },
    onComplete: () => {
      element.style.display = 'none'
      options.onComplete?.()
    }
  })
}

/**
 * 滑入
 */
export function slideIn(
  element: HTMLElement,
  direction: 'up' | 'down' | 'left' | 'right' = 'down',
  options: AnimationOptions = {}
): AnimationController {
  const distance = 50
  let prop: string
  let from: number
  
  switch (direction) {
    case 'up':
      prop = 'translateY'
      from = distance
      break
    case 'down':
      prop = 'translateY'
      from = -distance
      break
    case 'left':
      prop = 'translateX'
      from = distance
      break
    case 'right':
      prop = 'translateX'
      from = -distance
      break
  }
  
  element.style.opacity = '0'
  element.style.transform = `${prop}(${from}px)`
  element.style.display = ''
  
  return animate(0, 1, {
    ...options,
    onUpdate: (progress) => {
      element.style.opacity = String(progress)
      element.style.transform = `${prop}(${from * (1 - progress)}px)`
      options.onUpdate?.(progress)
    }
  })
}

/**
 * 滑出
 */
export function slideOut(
  element: HTMLElement,
  direction: 'up' | 'down' | 'left' | 'right' = 'down',
  options: AnimationOptions = {}
): AnimationController {
  const distance = 50
  let prop: string
  let to: number
  
  switch (direction) {
    case 'up':
      prop = 'translateY'
      to = -distance
      break
    case 'down':
      prop = 'translateY'
      to = distance
      break
    case 'left':
      prop = 'translateX'
      to = -distance
      break
    case 'right':
      prop = 'translateX'
      to = distance
      break
  }
  
  return animate(0, 1, {
    ...options,
    onUpdate: (progress) => {
      element.style.opacity = String(1 - progress)
      element.style.transform = `${prop}(${to * progress}px)`
      options.onUpdate?.(progress)
    },
    onComplete: () => {
      element.style.display = 'none'
      options.onComplete?.()
    }
  })
}

/**
 * 缩放
 */
export function scale(
  element: HTMLElement,
  from: number,
  to: number,
  options: AnimationOptions = {}
): AnimationController {
  element.style.transform = `scale(${from})`
  
  return animate(from, to, {
    ...options,
    onUpdate: (value) => {
      element.style.transform = `scale(${value})`
      options.onUpdate?.(value)
    }
  })
}

/**
 * 旋转
 */
export function rotate(
  element: HTMLElement,
  from: number,
  to: number,
  options: AnimationOptions = {}
): AnimationController {
  element.style.transform = `rotate(${from}deg)`
  
  return animate(from, to, {
    ...options,
    onUpdate: (value) => {
      element.style.transform = `rotate(${value}deg)`
      options.onUpdate?.(value)
    }
  })
}

/**
 * 弹跳效果
 */
export function bounce(
  element: HTMLElement,
  options: AnimationOptions = {}
): AnimationController {
  return animate(0, 1, {
    duration: 600,
    easing: 'easeOutBounce',
    ...options,
    onUpdate: (progress) => {
      element.style.transform = `translateY(${-30 * (1 - progress)}px)`
      options.onUpdate?.(progress)
    }
  })
}

/**
 * 脉冲效果
 */
export function pulse(
  element: HTMLElement,
  options: AnimationOptions & { times?: number } = {}
): AnimationController {
  const { times = 3, ...animOptions } = options
  let count = 0
  
  const controller = animate(0, 1, {
    duration: 300,
    ...animOptions,
    onUpdate: (progress) => {
      const scale = 1 + Math.sin(progress * Math.PI) * 0.1
      element.style.transform = `scale(${scale})`
      options.onUpdate?.(progress)
    },
    onComplete: () => {
      count++
      if (count < times) {
        controller.start()
      } else {
        element.style.transform = ''
        options.onComplete?.()
      }
    }
  })
  
  return controller
}

/**
 * 抖动效果
 */
export function shake(
  element: HTMLElement,
  options: AnimationOptions & { intensity?: number } = {}
): AnimationController {
  const { intensity = 10, ...animOptions } = options
  
  return animate(0, 1, {
    duration: 500,
    ...animOptions,
    onUpdate: (progress) => {
      const x = Math.sin(progress * Math.PI * 8) * intensity * (1 - progress)
      element.style.transform = `translateX(${x}px)`
      options.onUpdate?.(progress)
    },
    onComplete: () => {
      element.style.transform = ''
      options.onComplete?.()
    }
  })
}

// ==================== 滚动动画 ====================

/**
 * 平滑滚动到指定位置
 */
export function smoothScrollTo(
  target: number | HTMLElement,
  options: AnimationOptions & { container?: HTMLElement } = {}
): AnimationController {
  const { container = document.documentElement, ...animOptions } = options
  
  const targetY = typeof target === 'number'
    ? target
    : target.getBoundingClientRect().top + container.scrollTop
  
  const startY = container.scrollTop
  
  return animate(startY, targetY, {
    duration: 500,
    easing: 'easeInOutQuad',
    ...animOptions,
    onUpdate: (value) => {
      container.scrollTop = value
      options.onUpdate?.(value)
    }
  })
}

/**
 * 滚动到顶部
 */
export function scrollToTop(
  options: AnimationOptions & { container?: HTMLElement } = {}
): AnimationController {
  return smoothScrollTo(0, options)
}

/**
 * 滚动到底部
 */
export function scrollToBottom(
  options: AnimationOptions & { container?: HTMLElement } = {}
): AnimationController {
  const container = options.container || document.documentElement
  const targetY = container.scrollHeight - container.clientHeight
  return smoothScrollTo(targetY, options)
}

// ==================== 动画队列 ====================

export interface AnimationSequence {
  add: (animation: () => AnimationController) => AnimationSequence
  play: () => Promise<void>
  stop: () => void
}

/**
 * 创建动画序列
 */
export function sequence(): AnimationSequence {
  const animations: (() => AnimationController)[] = []
  let currentController: AnimationController | null = null
  let isStopped = false
  
  return {
    add: (animation) => {
      animations.push(animation)
      return {
        add: (a) => sequence().add(a),
        play: async () => {},
        stop: () => {}
      }
    },
    play: async () => {
      isStopped = false
      for (const createAnimation of animations) {
        if (isStopped) break
        
        await new Promise<void>((resolve) => {
          const controller = createAnimation()
          currentController = controller
          
          const originalOnComplete = (controller as any).options?.onComplete
          ;(controller as any).onComplete = () => {
            originalOnComplete?.()
            resolve()
          }
          
          controller.start()
        })
      }
    },
    stop: () => {
      isStopped = true
      currentController?.stop()
    }
  }
}

/**
 * 并行执行多个动画
 */
export function parallel(
  animations: (() => AnimationController)[]
): Promise<void[]> {
  return Promise.all(
    animations.map((createAnimation) => {
      return new Promise<void>((resolve) => {
        const controller = createAnimation()
        
        // 包装 onComplete
        const originalTick = (controller as any).tick
        ;(controller as any).tick = (timestamp: number) => {
          originalTick(timestamp)
          if ((controller as any).currentProgress >= 1) {
            resolve()
          }
        }
        
        controller.start()
      })
    })
  )
}

// ==================== 数字计数动画 ====================

/**
 * 数字计数器动画
 */
export function countUp(
  element: HTMLElement,
  endValue: number,
  options: AnimationOptions & {
    startValue?: number
    decimals?: number
    prefix?: string
    suffix?: string
    separator?: string
  } = {}
): AnimationController {
  const {
    startValue = 0,
    decimals = 0,
    prefix = '',
    suffix = '',
    separator = ',',
    ...animOptions
  } = options
  
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals)
    const parts = fixed.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return prefix + parts.join('.') + suffix
  }
  
  return animate(startValue, endValue, {
    duration: 2000,
    easing: 'easeOutQuart',
    ...animOptions,
    onUpdate: (value) => {
      element.textContent = formatNumber(value)
      options.onUpdate?.(value)
    }
  })
}

// ==================== 打字机效果 ====================

/**
 * 打字机效果
 */
export function typewriter(
  element: HTMLElement,
  text: string,
  options: {
    speed?: number
    delay?: number
    cursor?: boolean
    onComplete?: () => void
  } = {}
): { start: () => void; stop: () => void } {
  const { speed = 50, delay = 0, cursor = true, onComplete } = options
  
  let index = 0
  let timerId: number | null = null
  let cursorElement: HTMLElement | null = null
  
  if (cursor) {
    cursorElement = document.createElement('span')
    cursorElement.textContent = '|'
    cursorElement.style.animation = 'blink 1s infinite'
    
    // 添加闪烁动画样式
    const style = document.createElement('style')
    style.textContent = `
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }
  
  const type = () => {
    if (index < text.length) {
      element.textContent = text.substring(0, index + 1)
      if (cursorElement) {
        element.appendChild(cursorElement)
      }
      index++
      timerId = window.setTimeout(type, speed)
    } else {
      if (cursorElement) {
        setTimeout(() => {
          cursorElement?.remove()
        }, 1000)
      }
      onComplete?.()
    }
  }
  
  return {
    start: () => {
      element.textContent = ''
      index = 0
      setTimeout(type, delay)
    },
    stop: () => {
      if (timerId !== null) {
        clearTimeout(timerId)
        timerId = null
      }
    }
  }
}

// ==================== 粒子效果 ====================

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
}

/**
 * 创建粒子效果
 */
export function createParticles(
  container: HTMLElement,
  options: {
    count?: number
    colors?: string[]
    minSize?: number
    maxSize?: number
    duration?: number
  } = {}
): { start: () => void; stop: () => void } {
  const {
    count = 50,
    colors = ['#4B6EF5', '#6C5CE7', '#00D9FF', '#FFD93D'],
    minSize = 4,
    maxSize = 12,
    duration = 2000
  } = options
  
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let particles: Particle[] = []
  let animationId: number | null = null
  
  const createParticle = (x: number, y: number): Particle => ({
    x,
    y,
    vx: (Math.random() - 0.5) * 10,
    vy: (Math.random() - 0.5) * 10,
    size: Math.random() * (maxSize - minSize) + minSize,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1
  })
  
  const update = () => {
    if (!ctx || !canvas) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    particles = particles.filter((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.1 // 重力
      p.life -= 0.02
      
      if (p.life <= 0) return false
      
      ctx!.beginPath()
      ctx!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      ctx!.fillStyle = p.color
      ctx!.globalAlpha = p.life
      ctx!.fill()
      
      return true
    })
    
    if (particles.length > 0) {
      animationId = requestAnimationFrame(update)
    } else {
      canvas?.remove()
    }
  }
  
  return {
    start: () => {
      canvas = document.createElement('canvas')
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.pointerEvents = 'none'
      container.style.position = 'relative'
      container.appendChild(canvas)
      
      ctx = canvas.getContext('2d')
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(centerX, centerY))
      }
      
      update()
      
      setTimeout(() => {
        particles = []
      }, duration)
    },
    stop: () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
      }
      canvas?.remove()
      particles = []
    }
  }
}

export default {
  easings,
  animate,
  animateValue,
  animateColor,
  fadeIn,
  fadeOut,
  slideIn,
  slideOut,
  scale,
  rotate,
  bounce,
  pulse,
  shake,
  smoothScrollTo,
  scrollToTop,
  scrollToBottom,
  sequence,
  parallel,
  countUp,
  typewriter,
  createParticles
}
