<template>
  <div class="anchor" :class="{ 'anchor--fixed': affix }">
    <!-- 指示器线 -->
    <div class="anchor__ink">
      <span 
        class="anchor__ink-ball" 
        :style="{ top: `${inkTop}px` }"
      ></span>
    </div>
    
    <!-- 链接列表 -->
    <div class="anchor__links">
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        class="anchor__link"
        :class="{ 
          'anchor__link--active': activeLink === link.href,
          [`anchor__link--level-${link.level || 1}`]: true
        }"
        @click.prevent="handleClick(link)"
      >
        {{ link.title }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface AnchorLink {
  // 链接地址
  href: string
  // 链接文字
  title: string
  // 层级
  level?: number
}

interface Props {
  // 链接列表
  links?: AnchorLink[]
  // 是否固定
  affix?: boolean
  // 滚动偏移量
  offsetTop?: number
  // 滚动容器
  container?: string | HTMLElement
  // 距离顶部多少触发
  targetOffset?: number
}

const props = withDefaults(defineProps<Props>(), {
  links: () => [],
  affix: true,
  offsetTop: 0,
  targetOffset: 0
})

const emit = defineEmits<{
  (e: 'click', link: AnchorLink): void
  (e: 'change', currentActiveLink: string): void
}>()

const activeLink = ref('')
const inkTop = ref(0)

// 获取滚动容器
function getContainer(): HTMLElement | Window {
  if (!props.container) return window
  
  if (typeof props.container === 'string') {
    return document.querySelector(props.container) || window
  }
  
  return props.container
}

// 获取滚动位置
function getScrollTop(): number {
  const container = getContainer()
  if (container === window) {
    return document.documentElement.scrollTop || document.body.scrollTop
  }
  return (container as HTMLElement).scrollTop
}

// 滚动到目标
function scrollToTarget(href: string) {
  const target = document.querySelector(href)
  if (!target) return
  
  const container = getContainer()
  const targetRect = target.getBoundingClientRect()
  
  let scrollTop: number
  if (container === window) {
    scrollTop = targetRect.top + getScrollTop() - props.offsetTop
    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    })
  } else {
    const containerRect = (container as HTMLElement).getBoundingClientRect()
    scrollTop = targetRect.top - containerRect.top + (container as HTMLElement).scrollTop - props.offsetTop
    ;(container as HTMLElement).scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    })
  }
}

// 更新指示器位置
function updateInkPosition() {
  nextTick(() => {
    const activeEl = document.querySelector('.anchor__link--active')
    if (activeEl) {
      const linkContainer = document.querySelector('.anchor__links')
      if (linkContainer) {
        const containerRect = linkContainer.getBoundingClientRect()
        const activeRect = activeEl.getBoundingClientRect()
        inkTop.value = activeRect.top - containerRect.top + activeRect.height / 2
      }
    }
  })
}

// 滚动监听
function handleScroll() {
  const scrollTop = getScrollTop()
  const container = getContainer()
  
  let current = ''
  
  for (const link of props.links) {
    const target = document.querySelector(link.href)
    if (!target) continue
    
    const targetRect = target.getBoundingClientRect()
    let top: number
    
    if (container === window) {
      top = targetRect.top
    } else {
      const containerRect = (container as HTMLElement).getBoundingClientRect()
      top = targetRect.top - containerRect.top
    }
    
    if (top <= props.offsetTop + props.targetOffset + 5) {
      current = link.href
    }
  }
  
  if (current && current !== activeLink.value) {
    activeLink.value = current
    emit('change', current)
    updateInkPosition()
  }
}

// 点击链接
function handleClick(link: AnchorLink) {
  emit('click', link)
  activeLink.value = link.href
  scrollToTarget(link.href)
  updateInkPosition()
}

onMounted(() => {
  const container = getContainer()
  
  if (container === window) {
    window.addEventListener('scroll', handleScroll, { passive: true })
  } else {
    (container as HTMLElement).addEventListener('scroll', handleScroll, { passive: true })
  }
  
  // 初始检查
  handleScroll()
})

onUnmounted(() => {
  const container = getContainer()
  
  if (container === window) {
    window.removeEventListener('scroll', handleScroll)
  } else {
    (container as HTMLElement).removeEventListener('scroll', handleScroll)
  }
})

// 暴露方法
defineExpose({
  scrollTo: scrollToTarget
})
</script>

<style scoped>
.anchor {
  position: relative;
  display: inline-flex;
}

.anchor--fixed {
  position: fixed;
}

.anchor__ink {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color, #e4e7ed);
}

.anchor__ink-ball {
  position: absolute;
  left: -3px;
  width: 8px;
  height: 8px;
  background: var(--primary-color, #4B6EF5);
  border-radius: 50%;
  transform: translateY(-50%);
  transition: top 0.2s ease;
}

.anchor__links {
  display: flex;
  flex-direction: column;
  padding-left: 16px;
}

.anchor__link {
  display: block;
  padding: 4px 0;
  font-size: 14px;
  color: var(--text-secondary, #606266);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.anchor__link:hover {
  color: var(--primary-color, #4B6EF5);
}

.anchor__link--active {
  color: var(--primary-color, #4B6EF5);
  font-weight: 500;
}

/* 层级缩进 */
.anchor__link--level-2 {
  padding-left: 12px;
  font-size: 13px;
}

.anchor__link--level-3 {
  padding-left: 24px;
  font-size: 12px;
}

.anchor__link--level-4 {
  padding-left: 36px;
  font-size: 12px;
}
</style>
