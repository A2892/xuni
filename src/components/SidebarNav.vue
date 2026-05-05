<template>
  <aside class="sidebar" :class="{ 'is-collapsed': collapsed }">
    <!-- Logo区域 -->
    <div class="sidebar-header">
      <div class="logo-wrapper" @click="$emit('toggle')">
        <div class="logo-icon">
          <IconLib name="graduation-cap" :size="collapsed ? 24 : 28" />
        </div>
        <transition name="fade">
          <span v-if="!collapsed" class="logo-text">VSID</span>
        </transition>
      </div>
      <button 
        v-if="!collapsed"
        type="button" 
        class="collapse-btn"
        @click="$emit('toggle')"
      >
        <IconLib name="chevron-left" :size="18" />
      </button>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div v-if="!collapsed" class="nav-section-title">主要功能</div>
        
        <router-link 
          v-for="item in mainNavItems"
          :key="item.route"
          :to="item.route"
          class="nav-item"
          :class="{ 'is-active': isActive(item.route) }"
        >
          <div class="nav-icon">
            <IconLib :name="item.icon" :size="20" />
          </div>
          <transition name="fade">
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </transition>
          <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </div>
      
      <div class="nav-section">
        <div v-if="!collapsed" class="nav-section-title">文档生成</div>
        
        <router-link 
          v-for="item in docNavItems"
          :key="item.route"
          :to="item.route"
          class="nav-item"
          :class="{ 'is-active': isActive(item.route) }"
        >
          <div class="nav-icon">
            <IconLib :name="item.icon" :size="20" />
          </div>
          <transition name="fade">
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </transition>
        </router-link>
      </div>
      
      <!-- 财务汇总折叠组 -->
      <div class="nav-section">
        <button 
          class="nav-group-header"
          :class="{ 'is-open': openGroup === 'finance' }"
          @click="toggleGroup('finance')"
        >
          <div class="nav-icon">
            <IconLib name="wallet" :size="20" />
          </div>
          <transition name="fade">
            <span v-if="!collapsed" class="nav-label">财务汇总</span>
          </transition>
          <IconLib 
            v-if="!collapsed" 
            :name="openGroup === 'finance' ? 'chevron-down' : 'chevron-right'" 
            :size="16" 
            class="nav-arrow"
          />
        </button>
        
        <transition name="collapse">
          <div v-if="(openGroup === 'finance' || collapsed) && !collapsed" class="nav-group-items">
            <router-link 
              v-for="item in financeNavItems"
              :key="item.route"
              :to="item.route"
              class="nav-item nav-sub-item"
              :class="{ 'is-active': isActive(item.route) }"
            >
              <span class="nav-label">{{ item.label }}</span>
            </router-link>
          </div>
        </transition>
      </div>
      
      <!-- 工具折叠组 -->
      <div class="nav-section">
        <button 
          class="nav-group-header"
          :class="{ 'is-open': openGroup === 'tools' }"
          @click="toggleGroup('tools')"
        >
          <div class="nav-icon">
            <IconLib name="tool" :size="20" />
          </div>
          <transition name="fade">
            <span v-if="!collapsed" class="nav-label">生成工具</span>
          </transition>
          <IconLib 
            v-if="!collapsed" 
            :name="openGroup === 'tools' ? 'chevron-down' : 'chevron-right'" 
            :size="16" 
            class="nav-arrow"
          />
        </button>
        
        <transition name="collapse">
          <div v-if="(openGroup === 'tools' || collapsed) && !collapsed" class="nav-group-items">
            <router-link 
              v-for="item in toolsNavItems"
              :key="item.route"
              :to="item.route"
              class="nav-item nav-sub-item"
              :class="{ 'is-active': isActive(item.route) }"
            >
              <span class="nav-label">{{ item.label }}</span>
            </router-link>
          </div>
        </transition>
      </div>
    </nav>
    
    <!-- 底部用户信息 -->
    <div class="sidebar-footer">
      <div class="user-avatar">
        <IconLib name="user" :size="20" />
      </div>
      <transition name="fade">
        <div v-if="!collapsed" class="user-info">
          <div class="user-name">{{ userName || '用户' }}</div>
          <div class="user-role">{{ userRole || '管理员' }}</div>
        </div>
      </transition>
      <button 
        v-if="!collapsed"
        type="button" 
        class="settings-btn"
        title="设置"
        @click="$emit('settings')"
      >
        <IconLib name="settings" :size="18" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import IconLib from './icons/IconLibrary.vue'

interface NavItem {
  label: string
  route: string
  icon: string
  badge?: string | number
}

interface Props {
  collapsed?: boolean
  userName?: string
  userRole?: string
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

defineEmits<{
  toggle: []
  settings: []
}>()

const route = useRoute()
const openGroup = ref<string>('')

// 主要导航项
const mainNavItems: NavItem[] = [
  { label: '仪表盘', route: '/dashboard', icon: 'layout-dashboard' },
  { label: '学生证', route: '/', icon: 'id-badge' },
  { label: '在读证明', route: '/enrollment', icon: 'file-check' },
  { label: '课程表', route: '/schedule', icon: 'calendar' },
  { label: '录取通知', route: '/admission', icon: 'mail' },
  { label: '成绩单', route: '/transcript', icon: 'clipboard-list' }
]

// 文档生成导航项
const docNavItems: NavItem[] = [
  { label: '学业报告', route: '/academic-report', icon: 'file-text' },
  { label: '银行对账', route: '/bank-statement', icon: 'credit-card' },
  { label: '发票', route: '/invoice', icon: 'receipt' },
  { label: '证书', route: '/certificate', icon: 'award' },
  { label: '航班', route: '/flight', icon: 'plane' },
  { label: '酒店', route: '/hotel', icon: 'building' }
]

// 财务汇总导航项
const financeNavItems: NavItem[] = [
  { label: '股票持仓', route: '/stock-statement', icon: 'trending-up' },
  { label: '基金持仓', route: '/fund-statement', icon: 'pie-chart' },
  { label: '保险资产', route: '/insurance', icon: 'shield' },
  { label: '贷款报表', route: '/loan-statement', icon: 'file-minus' },
  { label: '净值报告', route: '/wealth-report', icon: 'bar-chart' },
    { label: '信用卡', route: '/credit-card', icon: 'credit-card' }
]

// 工具导航项
const toolsNavItems: NavItem[] = [
  { label: '二维码', route: '/qrcode-generator', icon: 'qr-code' },
  { label: '条形码', route: '/barcode-generator', icon: 'barcode' },
  { label: '签名生成', route: '/signature-generator', icon: 'pen-tool' },
  { label: '水印生成', route: '/watermark-generator', icon: 'droplet' },
  { label: '头像生成', route: '/avatar-generator', icon: 'user-circle' }
]

// 检查是否激活
const isActive = (path: string) => {
  return route.path === path
}

// 切换折叠组
const toggleGroup = (group: string) => {
  if (props.collapsed) return
  openGroup.value = openGroup.value === group ? '' : group
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a1f36 0%, #252b45 100%);
  color: #fff;
  transition: width 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar.is-collapsed {
  width: 72px;
}

/* 头部 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color, #4B6EF5), var(--secondary-color, #6C5CE7));
  border-radius: 10px;
  color: #fff;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* 导航区域 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.75rem;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-section-title {
  padding: 0 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.4);
}

/* 导航项 */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item.is-active {
  background: linear-gradient(90deg, rgba(75, 110, 245, 0.2), rgba(108, 92, 231, 0.1));
  color: #fff;
}

.nav-item.is-active .nav-icon {
  color: var(--primary-color, #4B6EF5);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  background: var(--primary-color, #4B6EF5);
  border-radius: 10px;
}

/* 折叠组 */
.nav-group-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-group-header:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-group-header.is-open {
  color: #fff;
}

.nav-arrow {
  margin-left: auto;
  opacity: 0.5;
}

.nav-group-items {
  padding-left: 2.5rem;
  overflow: hidden;
}

.nav-sub-item {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

/* 底部用户区 */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

/* 滚动条 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
