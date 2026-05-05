<template>
  <div class="iphone-frame-wrapper">
    <div class="iphone-frame" :class="[`model-${model}`, { 'show-frame': showFrame }]">
      <!-- 状态栏 -->
      <div v-if="showStatusBar" class="status-bar">
        <div class="status-left">
          <span class="time">{{ currentTime }}</span>
        </div>
        <div class="status-center">
          <div class="dynamic-island"></div>
        </div>
        <div class="status-right">
          <div class="signal-bars">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </div>
          <span class="carrier">5G</span>
          <div class="wifi-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.4 16.4 10.6 16 12 16s2.6.4 3.5 1.1l1.4-1.4C15.6 14.6 13.9 14 12 14s-3.6.6-4.9 1.7zm-2.8-2.8l1.4 1.4C7.4 13 9.6 12 12 12s4.6 1 6.3 2.3l1.4-1.4C17.7 11.1 15 10 12 10s-5.7 1.1-7.7 2.9zm-2.8-2.8l1.4 1.4C5.3 9.9 8.4 8.5 12 8.5s6.7 1.4 9.1 3.1l1.4-1.4C19.8 8 16.1 6.5 12 6.5S4.2 8 1.5 10.1z"/>
            </svg>
          </div>
          <div class="battery">
            <div class="battery-body">
              <div class="battery-level" :style="{ width: batteryLevel + '%' }"></div>
            </div>
            <div class="battery-head"></div>
          </div>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="iphone-content">
        <slot></slot>
      </div>
      
      <!-- 底部指示器 -->
      <div v-if="showHomeIndicator" class="home-indicator"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  model?: 'iphone-17-pro' | 'iphone-16-pro' | 'iphone-15-pro'
  showStatusBar?: boolean
  showFrame?: boolean
  showHomeIndicator?: boolean
  batteryLevel?: number
}>(), {
  model: 'iphone-17-pro',
  showStatusBar: true,
  showFrame: false,
  showHomeIndicator: true,
  batteryLevel: 85
})

const currentTime = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

let timer: number | null = null

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.iphone-frame-wrapper {
  display: inline-block;
  background: transparent;
}

.iphone-frame {
  position: relative;
  background: #fff;
  overflow: hidden;
}

/* iPhone 17 Pro - 393 x 852 (逻辑分辨率) */
.iphone-frame.model-iphone-17-pro {
  width: 393px;
  border-radius: 47px;
  box-shadow: 0 0 0 12px #1a1a1a, 0 0 0 14px #333, 0 25px 60px rgba(0,0,0,0.5);
}

.iphone-frame.model-iphone-16-pro {
  width: 393px;
  border-radius: 47px;
  box-shadow: 0 0 0 12px #1a1a1a, 0 0 0 14px #333, 0 25px 60px rgba(0,0,0,0.5);
}

.iphone-frame.model-iphone-15-pro {
  width: 393px;
  border-radius: 47px;
  box-shadow: 0 0 0 12px #1a1a1a, 0 0 0 14px #333, 0 25px 60px rgba(0,0,0,0.5);
}

/* 显示边框模式 */
.iphone-frame.show-frame {
  border: 12px solid #1a1a1a;
  box-shadow: 0 0 0 2px #333, 0 20px 60px rgba(0,0,0,0.3);
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px 10px;
  background: #fff;
  position: relative;
  z-index: 10;
  height: 54px;
  box-sizing: border-box;
}

.status-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.time {
  font-size: 17px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  letter-spacing: -0.4px;
}

.status-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.dynamic-island {
  width: 126px;
  height: 37px;
  background: #000;
  border-radius: 20px;
}

.status-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.signal-bars {
  display: flex;
  align-items: flex-end;
  gap: 1.5px;
  height: 12px;
}

.signal-bars .bar {
  width: 3px;
  background: #000;
  border-radius: 1px;
}

.signal-bars .bar:nth-child(1) { height: 4px; }
.signal-bars .bar:nth-child(2) { height: 6px; }
.signal-bars .bar:nth-child(3) { height: 9px; }
.signal-bars .bar:nth-child(4) { height: 12px; }

.carrier {
  font-size: 14px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
}

.wifi-icon {
  width: 17px;
  height: 12px;
}

.wifi-icon svg {
  width: 100%;
  height: 100%;
}

.battery {
  display: flex;
  align-items: center;
}

.battery-body {
  width: 25px;
  height: 12px;
  border: 1.5px solid #000;
  border-radius: 3px;
  padding: 1.5px;
  position: relative;
}

.battery-level {
  height: 100%;
  background: #000;
  border-radius: 1px;
  transition: width 0.3s;
}

.battery-head {
  width: 2px;
  height: 5px;
  background: #000;
  border-radius: 0 2px 2px 0;
  margin-left: 1px;
}

/* 内容区域 */
.iphone-content {
  min-height: 200px;
  background: #fff;
}

/* 底部指示器 */
.home-indicator {
  width: 134px;
  height: 5px;
  background: #000;
  border-radius: 3px;
  margin: 8px auto 8px;
}
</style>
