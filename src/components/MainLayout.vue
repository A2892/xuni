<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('学生证')
const openSubmenu = ref('')
const showLogoutDialog = ref(false)

// 基础功能标签
const baseTabs = ['📊 仪表盘', '学生证', '在读证明', '课程表', '录取通知书', '成绩单', '学业报告', '银行对账单', '学生照片', '资料管理', '发票', '账单', '航班', '酒店', '🧾 收据']

// 学校生成子菜单
const schoolMenuItems = [
  { label: '学费收据', route: '/tuition-receipt', icon: '💰' },
  { label: '签证中心', route: '/visa-center', icon: '🛂' },
  { label: '签证生成', route: '/visa', icon: '🪪' },
  { label: '签证清单', route: '/visa-checklist', icon: '📂' },
  { label: '面签安排', route: '/visa-interview', icon: '🎙️' },
  { label: '进度追踪', route: '/visa-progress', icon: '📈' },
  { label: '国内成绩单', route: '/school-transcript', icon: '📊' },
  { label: '国内在读证明', route: '/enrollment-cert', icon: '📋' },
  { label: '国内推荐信', route: '/recommendation-letter', icon: '✉️' }
]

// 国内生成子菜单
const domesticMenuItems = [
  { label: '水电账单', route: '/cn-bill', icon: '⚡' },
  { label: '酒店账单', route: '/cn-hotel', icon: '⌂' },
  { label: '二维码/条形码', route: '/cn-code', icon: '🔢' }
]



const routeMap: Record<string, string> = {
  '/': '学生证',
  '/dashboard': '📊 仪表盘',
  '/enrollment': '在读证明',
  '/schedule': '课程表',
  '/admission': '录取通知书',
  '/transcript': '成绩单',
  '/academic-report': '学业报告',
  '/bank-statement': '银行对账单',
  '/student-photo': '学生照片',
  '/student-profile': '资料管理',
  '/recycle-bin': '🗑️ 回收站',
  '/admin-management': '账号管理',
  '/invoice': '发票',
  '/utility-bill': '账单',
  '/flight': '航班',
  '/hotel': '酒店',
  '/receipt-generator': '🧾 收据',
  '/tuition-receipt': '🏫 学校生成',
  '/visa-center': '🏫 学校生成',
  '/visa': '🏫 学校生成',
  '/visa-checklist': '🏫 学校生成',
  '/visa-interview': '🏫 学校生成',
  '/visa-progress': '🏫 学校生成',
  '/school-transcript': '🏫 学校生成',
  '/enrollment-cert': '🏫 学校生成',
  '/recommendation-letter': '🏫 学校生成',
  '/cn-invoice': '🇨🇳 国内生成',
  '/cn-bill': '🇨🇳 国内生成',
  '/cn-hotel': '🇨🇳 国内生成',
  '/cn-code': '🇨🇳 国内生成'
}

const isGeneratorRoute = (path: string) => false

onMounted(() => {
  activeTab.value = routeMap[route.path] || '学生证'
})

watch(() => route.path, (newPath) => {
  activeTab.value = routeMap[newPath] || '学生证'
})

const navigateTo = (tab: string) => {
  activeTab.value = tab
  openSubmenu.value = ''
  const routes: Record<string, string> = {
    '📊 仪表盘': '/dashboard',
    '学生证': '/',
    '在读证明': '/enrollment',
    '课程表': '/schedule',
    '录取通知书': '/admission',
    '成绩单': '/transcript',
    '学业报告': '/academic-report',
    '银行对账单': '/bank-statement',
    '学生照片': '/student-photo',
    '资料管理': '/student-profile',
    '🗑️ 回收站': '/recycle-bin',
    '账号管理': '/admin-management',
    '发票': '/invoice',
    '账单': '/utility-bill',
    '航班': '/flight',
    '酒店': '/hotel',
    '🧾 收据': '/receipt-generator'
  }
  // 银行卡管理已移除
  const path = routes[tab]
  if (path) {
    router.push(path)
  }
}

const navigateToSub = (routePath: string) => {
  router.push(routePath)
  openSubmenu.value = ''
}

const toggleSubmenu = (menu: string) => {
  openSubmenu.value = openSubmenu.value === menu ? '' : menu
}

const handleLogout = () => {
  showLogoutDialog.value = true
}

const handleLogoutConfirmed = () => {
  showLogoutDialog.value = false
  authStore.logout()
  router.push('/login')
}

const isMenuActive = (items: { route: string }[]) => {
  return items.some(item => route.path === item.route)
}
</script>

<template>
  <div class="main-layout">
    <header class="top-header">
      <div class="header-left">
        <svg class="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="white" opacity="0.9"/>
          <path d="M6 12L10 16L18 8" stroke="#4B6EF5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">VSID - Student ID Generator</span>
      </div>
      <div class="header-right">
        <span class="user-info">👤 {{ authStore.currentUser?.full_name || authStore.currentUser?.username }}</span>
        <button class="btn-logout" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <nav class="tab-navigation">
      <!-- 基础功能 -->
      <button
        v-for="tab in baseTabs"
        :key="tab"
        :class="['tab-item', { active: activeTab === tab }]"
        @click="navigateTo(tab)"
      >
        {{ tab }}
      </button>
      
      <!-- 学校生成子菜单 -->
      <div class="submenu-container" @mouseleave="openSubmenu = ''">
        <button
          :class="['tab-item has-submenu', { active: isMenuActive(schoolMenuItems) }]"
          @mouseenter="openSubmenu = 'school'"
          @click="toggleSubmenu('school')"
        >
          🏫 学校生成 ▾
        </button>
        <div v-show="openSubmenu === 'school'" class="submenu-dropdown">
          <button 
            v-for="item in schoolMenuItems" 
            :key="item.route"
            :class="['submenu-item', { active: route.path === item.route }]"
            @click="navigateToSub(item.route)"
          >
            {{ item.icon }} {{ item.label }}
          </button>
        </div>
      </div>
      
      <!-- 国内生成子菜单 -->
      <div class="submenu-container" @mouseleave="openSubmenu = ''">
        <button
          :class="['tab-item has-submenu', { active: isMenuActive(domesticMenuItems) }]"
          @mouseenter="openSubmenu = 'domestic'"
          @click="toggleSubmenu('domestic')"
        >
          🇨🇳 国内生成 ▾
        </button>
        <div v-show="openSubmenu === 'domestic'" class="submenu-dropdown">
          <button 
            v-for="item in domesticMenuItems" 
            :key="item.route"
            :class="['submenu-item', { active: route.path === item.route }]"
            @click="navigateToSub(item.route)"
          >
            {{ item.icon }} {{ item.label }}
          </button>
        </div>
      </div>
      
      <!-- 回收站 -->
      <button
        :class="['tab-item', { active: activeTab === '🗑️ 回收站' }]"
        @click="navigateTo('🗑️ 回收站')"
      >
        🗑️ 回收站
      </button>
      
      <!-- 账号管理 -->
      <button
        :class="['tab-item', { active: activeTab === '账号管理' }]"
        @click="navigateTo('账号管理')"
      >
        账号管理
      </button>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="footer">
      <p>© 2025 Virtual Student ID Generator. 保留所有权利.</p>
      <p>Made with ❤️ by Condev</p>
    </footer>

    <!-- 退出登录确认对话框 -->
    <ConfirmDialog
      v-model:visible="showLogoutDialog"
      type="warning"
      title="确认退出"
      message="确定要退出登录吗？"
      confirm-text="确认退出"
      cancel-text="取消"
      @confirm="handleLogoutConfirmed"
      @cancel="showLogoutDialog = false"
    />
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.top-header {
  background: linear-gradient(135deg, #4B6EF5 0%, #6C5CE7 100%);
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  box-shadow: 0 6px 20px rgba(75,110,245,0.06);
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  flex-shrink: 0;
}

.logo-text {
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.generate-btn {
  background: linear-gradient(90deg,#6C5CE7,#4B6EF5);
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
  white-space: nowrap;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(75,110,245,0.12);
}

.tab-navigation {
  background-color: white;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  display: flex;
  flex-wrap: wrap;
  padding: 10px 20px;
  gap: 6px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.tab-item {
  background: #f5f7fa;
  border: 1px solid #e8ecf1;
  padding: 6px 12px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.18s ease;
  font-weight: 600;
  white-space: nowrap;
  border-radius: 6px;
  flex-shrink: 0;
}

.tab-item:hover {
  color: #4B6EF5;
  background: #eef2ff;
  border-color: #c7d2fe;
}

.tab-item.active {
  color: #fff;
  background: linear-gradient(90deg,#6C5CE7,#4B6EF5);
  box-shadow: 0 4px 12px rgba(75,110,245,0.25);
  border-bottom-color: transparent;
  border-color: transparent;
}

/* 子菜单容器 */
.submenu-container {
  position: relative;
  flex-shrink: 0;
}

.tab-item.has-submenu {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 子菜单下拉框 */
.submenu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 1000;
  min-width: 160px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.submenu-item {
  background: none;
  border: none;
  padding: 10px 16px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  transition: all 0.15s ease;
  font-weight: 500;
  white-space: nowrap;
}

.submenu-item:hover {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  color: #4B6EF5;
}

.submenu-item.active {
  background: linear-gradient(90deg, #6C5CE7, #4B6EF5);
  color: white;
}

.main-content {
  flex: 1;
  padding: 24px;
  width: 100%;
}

.footer {
  background-color: white;
  border-top: 1px solid #E0E0E0;
  padding: 20px 24px;
  text-align: center;
  font-size: 12px;
  color: #7F8C8D;
  width: 100%;
}

.footer p {
  margin: 4px 0;
}
</style>
