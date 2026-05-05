<script setup lang="ts">
/**
 * 国际标准图标库组件
 * 基于 Lucide Icons (MIT License) 和 Material Design Icons 规范
 * 符合 WCAG 2.1 无障碍标准
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
  color?: string
  strokeWidth?: number
  class?: string
}>(), {
  size: 24,
  strokeWidth: 2
})

const iconSize = computed(() => typeof props.size === 'number' ? `${props.size}px` : props.size)
</script>

<template>
  <svg 
    :class="['icon-lib', props.class]" 
    :width="iconSize" 
    :height="iconSize"
    :style="{ color: color || 'currentColor' }"
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    :stroke-width="strokeWidth"
    stroke-linecap="round" 
    stroke-linejoin="round"
    role="img"
    :aria-label="name"
  >
    <!-- ============ 导航/通用图标 ============ -->
    
    <!-- 仪表盘 Dashboard -->
    <template v-if="name === 'dashboard'">
      <rect x="3" y="3" width="7" height="9" rx="1"/>
      <rect x="14" y="3" width="7" height="5" rx="1"/>
      <rect x="14" y="12" width="7" height="9" rx="1"/>
      <rect x="3" y="16" width="7" height="5" rx="1"/>
    </template>
    
    <!-- 主页 Home -->
    <template v-else-if="name === 'home'">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </template>
    
    <!-- 设置 Settings -->
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </template>
    
    <!-- 菜单 Menu -->
    <template v-else-if="name === 'menu'">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </template>
    
    <!-- 关闭 Close/X -->
    <template v-else-if="name === 'close' || name === 'x'">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </template>
    
    <!-- 返回 ArrowLeft -->
    <template v-else-if="name === 'arrow-left'">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </template>
    
    <!-- 前进 ArrowRight -->
    <template v-else-if="name === 'arrow-right'">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </template>
    
    <!-- 向上 ChevronUp -->
    <template v-else-if="name === 'chevron-up'">
      <polyline points="18 15 12 9 6 15"/>
    </template>
    
    <!-- 向下 ChevronDown -->
    <template v-else-if="name === 'chevron-down'">
      <polyline points="6 9 12 15 18 9"/>
    </template>
    
    <!-- 展开更多 MoreHorizontal -->
    <template v-else-if="name === 'more-horizontal'">
      <circle cx="12" cy="12" r="1"/>
      <circle cx="19" cy="12" r="1"/>
      <circle cx="5" cy="12" r="1"/>
    </template>
    
    <!-- 展开更多（垂直）MoreVertical -->
    <template v-else-if="name === 'more-vertical'">
      <circle cx="12" cy="12" r="1"/>
      <circle cx="12" cy="5" r="1"/>
      <circle cx="12" cy="19" r="1"/>
    </template>
    
    <!-- 搜索 Search -->
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </template>
    
    <!-- 筛选 Filter -->
    <template v-else-if="name === 'filter'">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </template>
    
    <!-- 刷新 Refresh -->
    <template v-else-if="name === 'refresh'">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </template>
    
    <!-- 退出 LogOut -->
    <template v-else-if="name === 'logout'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </template>
    
    <!-- 登录 LogIn -->
    <template v-else-if="name === 'login'">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </template>
    
    <!-- ============ 用户相关图标 ============ -->
    
    <!-- 用户 User -->
    <template v-else-if="name === 'user'">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </template>
    
    <!-- 用户组 Users -->
    <template v-else-if="name === 'users'">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </template>
    
    <!-- 用户添加 UserPlus -->
    <template v-else-if="name === 'user-plus'">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/>
      <line x1="23" y1="11" x2="17" y2="11"/>
    </template>
    
    <!-- 用户检查 UserCheck -->
    <template v-else-if="name === 'user-check'">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <polyline points="17 11 19 13 23 9"/>
    </template>
    
    <!-- 身份证 IdCard -->
    <template v-else-if="name === 'id-card'">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <circle cx="8" cy="15" r="2"/>
      <path d="M14 15h4"/>
      <path d="M14 18h2"/>
    </template>
    
    <!-- 护照 -->
    <template v-else-if="name === 'passport'">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <circle cx="12" cy="10" r="3"/>
      <path d="M8 18h8"/>
      <path d="M10 14h4"/>
    </template>
    
    <!-- ============ 文档相关图标 ============ -->
    
    <!-- 文件 File -->
    <template v-else-if="name === 'file'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </template>
    
    <!-- 文件文本 FileText -->
    <template v-else-if="name === 'file-text'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </template>
    
    <!-- 文件加号 FilePlus -->
    <template v-else-if="name === 'file-plus'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </template>
    
    <!-- 文件夹 Folder -->
    <template v-else-if="name === 'folder'">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </template>
    
    <!-- 文件夹打开 FolderOpen -->
    <template v-else-if="name === 'folder-open'">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1"/>
      <path d="M22 11l-4 8H6l-4-8h20z"/>
    </template>
    
    <!-- 复制 Copy -->
    <template v-else-if="name === 'copy'">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </template>
    
    <!-- 剪贴板 Clipboard -->
    <template v-else-if="name === 'clipboard'">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </template>
    
    <!-- 剪贴板检查 ClipboardCheck -->
    <template v-else-if="name === 'clipboard-check'">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <polyline points="9 14 11 16 15 12"/>
    </template>
    
    <!-- 模板 Layout -->
    <template v-else-if="name === 'layout'">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
    </template>
    
    <!-- 图片 Image -->
    <template v-else-if="name === 'image'">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </template>
    
    <!-- 相机 Camera -->
    <template v-else-if="name === 'camera'">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </template>
    
    <!-- ============ 教育相关图标 ============ -->
    
    <!-- 毕业帽 GraduationCap -->
    <template v-else-if="name === 'graduation-cap'">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </template>
    
    <!-- 书本 Book -->
    <template v-else-if="name === 'book'">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </template>
    
    <!-- 打开的书 BookOpen -->
    <template v-else-if="name === 'book-open'">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </template>
    
    <!-- 笔 Pen -->
    <template v-else-if="name === 'pen'">
      <path d="M12 19l7-7 3 3-7 7-3-3z"/>
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
      <path d="M2 2l7.586 7.586"/>
      <circle cx="11" cy="11" r="2"/>
    </template>
    
    <!-- 编辑 Edit -->
    <template v-else-if="name === 'edit'">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </template>
    
    <!-- 奖章 Award -->
    <template v-else-if="name === 'award'">
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </template>
    
    <!-- 证书 Certificate -->
    <template v-else-if="name === 'certificate'">
      <rect x="3" y="4" width="18" height="14" rx="2"/>
      <path d="M8 8h8"/>
      <path d="M8 12h4"/>
      <circle cx="16" cy="16" r="4" fill="currentColor" stroke="none"/>
      <path d="M14 20l2-1 2 1v-3"/>
    </template>
    
    <!-- 成绩单 Transcript -->
    <template v-else-if="name === 'transcript'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M8 13h2v4"/>
      <path d="M12 13h2v2"/>
      <path d="M16 13h0"/>
    </template>
    
    <!-- 日程/日历 Calendar -->
    <template v-else-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </template>
    
    <!-- 时钟 Clock -->
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </template>
    
    <!-- 学校 School -->
    <template v-else-if="name === 'school'">
      <path d="M3 21h18"/>
      <path d="M5 21V7l7-4 7 4v14"/>
      <path d="M9 21v-6h6v6"/>
      <path d="M10 10h4"/>
    </template>
    
    <!-- ============ 金融相关图标 ============ -->
    
    <!-- 银行 Bank -->
    <template v-else-if="name === 'bank'">
      <path d="M3 21h18"/>
      <path d="M3 10h18"/>
      <path d="M12 3l9 7H3l9-7z"/>
      <path d="M5 10v11"/>
      <path d="M9 10v11"/>
      <path d="M15 10v11"/>
      <path d="M19 10v11"/>
    </template>
    
    <!-- 美元 DollarSign -->
    <template v-else-if="name === 'dollar'">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </template>
    
    <!-- 人民币 Yuan -->
    <template v-else-if="name === 'yuan'">
      <path d="M12 1v22"/>
      <path d="M5 5l7 9"/>
      <path d="M19 5l-7 9"/>
      <path d="M5 12h14"/>
      <path d="M5 18h14"/>
    </template>
    
    <!-- 信用卡 CreditCard -->
    <template v-else-if="name === 'credit-card'">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </template>
    
    <!-- 钱包 Wallet -->
    <template v-else-if="name === 'wallet'">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
    </template>
    
    <!-- 收据 Receipt -->
    <template v-else-if="name === 'receipt'">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
      <path d="M8 10h8"/>
      <path d="M8 14h4"/>
    </template>
    
    <!-- 发票 Invoice -->
    <template v-else-if="name === 'invoice'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M8 13h2v3"/>
      <path d="M14 13h2"/>
      <path d="M8 9h8"/>
    </template>
    
    <!-- 股票 TrendingUp -->
    <template v-else-if="name === 'trending-up'">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </template>
    
    <!-- 股票下跌 TrendingDown -->
    <template v-else-if="name === 'trending-down'">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </template>
    
    <!-- 饼图 PieChart -->
    <template v-else-if="name === 'pie-chart'">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </template>
    
    <!-- 柱状图 BarChart -->
    <template v-else-if="name === 'bar-chart'">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </template>
    
    <!-- 折线图 LineChart -->
    <template v-else-if="name === 'line-chart'">
      <path d="M3 3v18h18"/>
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
    </template>
    
    <!-- 保险 Shield -->
    <template v-else-if="name === 'shield'">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </template>
    
    <!-- 保险检查 ShieldCheck -->
    <template v-else-if="name === 'shield-check'">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </template>
    
    <!-- 比特币 Bitcoin -->
    <template v-else-if="name === 'bitcoin'">
      <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"/>
    </template>
    
    <!-- ============ 交通旅行相关图标 ============ -->
    
    <!-- 飞机 Plane -->
    <template v-else-if="name === 'plane'">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
    </template>
    
    <!-- 汽车 Car -->
    <template v-else-if="name === 'car'">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
      <circle cx="6.5" cy="16.5" r="2.5"/>
      <circle cx="16.5" cy="16.5" r="2.5"/>
    </template>
    
    <!-- 酒店/床 Bed -->
    <template v-else-if="name === 'bed' || name === 'hotel'">
      <path d="M2 4v16"/>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
      <path d="M2 17h20"/>
      <path d="M6 8v9"/>
    </template>
    
    <!-- 建筑 Building -->
    <template v-else-if="name === 'building'">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/>
      <path d="M16 6h.01"/>
      <path d="M12 6h.01"/>
      <path d="M12 10h.01"/>
      <path d="M12 14h.01"/>
      <path d="M16 10h.01"/>
      <path d="M16 14h.01"/>
      <path d="M8 10h.01"/>
      <path d="M8 14h.01"/>
    </template>
    
    <!-- 地图标记 MapPin -->
    <template v-else-if="name === 'map-pin'">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </template>
    
    <!-- 指南针 Compass -->
    <template v-else-if="name === 'compass'">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </template>
    
    <!-- 行李箱 Briefcase -->
    <template v-else-if="name === 'briefcase'">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </template>
    
    <!-- ============ 工具生成相关图标 ============ -->
    
    <!-- 二维码 QrCode -->
    <template v-else-if="name === 'qr-code'">
      <rect x="3" y="3" width="5" height="5" rx="1"/>
      <rect x="16" y="3" width="5" height="5" rx="1"/>
      <rect x="3" y="16" width="5" height="5" rx="1"/>
      <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
      <path d="M21 21v.01"/>
      <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
      <path d="M3 12h.01"/>
      <path d="M12 3h.01"/>
      <path d="M12 16v.01"/>
      <path d="M16 12h1"/>
      <path d="M21 12v.01"/>
      <path d="M12 21v-1"/>
    </template>
    
    <!-- 条形码 Barcode -->
    <template v-else-if="name === 'barcode'">
      <path d="M3 5v14"/>
      <path d="M8 5v14"/>
      <path d="M12 5v14"/>
      <path d="M17 5v14"/>
      <path d="M21 5v14"/>
      <path d="M5 5v14"/>
      <path d="M15 5v14"/>
      <path d="M19 5v14"/>
    </template>
    
    <!-- 签名 Signature -->
    <template v-else-if="name === 'signature'">
      <path d="M2 18c3-3 6-1 8-1s4-2 5-2 2 1 4-1 3-2 3-2"/>
      <path d="M21 3l-7 7"/>
      <path d="M14 10l-2 2"/>
    </template>
    
    <!-- 水印 Droplet -->
    <template v-else-if="name === 'droplet'">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </template>
    
    <!-- 魔法棒 Wand -->
    <template v-else-if="name === 'wand'">
      <path d="M15 4V2"/>
      <path d="M15 16v-2"/>
      <path d="M8 9h2"/>
      <path d="M20 9h2"/>
      <path d="M17.8 11.8L19 13"/>
      <path d="M15 9h0"/>
      <path d="M17.8 6.2L19 5"/>
      <path d="M3 21l9-9"/>
      <path d="M12.2 6.2L11 5"/>
    </template>
    
    <!-- 合同 FileContract -->
    <template v-else-if="name === 'contract'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M12 18v-6"/>
      <path d="M8 18v-1"/>
      <path d="M16 18v-3"/>
    </template>
    
    <!-- 地址 Map -->
    <template v-else-if="name === 'map'">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </template>
    
    <!-- 随机/骰子 Dice -->
    <template v-else-if="name === 'dice'">
      <rect x="2" y="2" width="20" height="20" rx="4"/>
      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="7" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="17" r="1.5" fill="currentColor"/>
    </template>
    
    <!-- ============ 社交媒体相关图标 ============ -->
    
    <!-- 微信 WeChat -->
    <template v-else-if="name === 'wechat'">
      <path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.83 1.1 3.46 2.82 4.53l-.72 2.17 2.62-1.31c.85.26 1.77.41 2.78.41.17 0 .34 0 .5-.02a5.96 5.96 0 0 1-.5-2.28c0-3.04 2.91-5.5 6.5-5.5.17 0 .34 0 .5.02C15.77 5.75 12.91 4 9.5 4z"/>
      <path d="M22 13.5c0-2.76-2.69-5-6-5s-6 2.24-6 5 2.69 5 6 5c.62 0 1.21-.09 1.77-.25l2.03 1.02-.56-1.69C20.85 16.51 22 15.11 22 13.5z"/>
    </template>
    
    <!-- QQ -->
    <template v-else-if="name === 'qq'">
      <path d="M12 2C7.58 2 4 5.58 4 10c0 2.16.9 4.11 2.34 5.5-.1.55-.4 1.75-1.04 2.7.85-.15 2.05-.55 2.9-1.2.98.38 2.04.6 3.15.6h.15c.13 1.4.54 2.7 1.2 3.8-.46.35-.8.95-.8 1.6 0 .55.45 1 1 1h.2c.55 0 1-.45 1-1 0-.65-.34-1.25-.8-1.6.66-1.1 1.07-2.4 1.2-3.8h.15c1.11 0 2.17-.22 3.15-.6.85.65 2.05 1.05 2.9 1.2-.64-.95-.94-2.15-1.04-2.7C19.1 14.11 20 12.16 20 10c0-4.42-3.58-8-8-8z"/>
    </template>
    
    <!-- 邮件 Mail -->
    <template v-else-if="name === 'mail'">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </template>
    
    <!-- 电话 Phone -->
    <template v-else-if="name === 'phone'">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </template>
    
    <!-- 名片 Contact -->
    <template v-else-if="name === 'contact'">
      <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <circle cx="12" cy="10" r="2"/>
      <line x1="8" y1="2" x2="8" y2="4"/>
      <line x1="16" y1="2" x2="16" y2="4"/>
    </template>
    
    <!-- ============ 操作相关图标 ============ -->
    
    <!-- 下载 Download -->
    <template v-else-if="name === 'download'">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </template>
    
    <!-- 上传 Upload -->
    <template v-else-if="name === 'upload'">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </template>
    
    <!-- 打印 Printer -->
    <template v-else-if="name === 'printer'">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </template>
    
    <!-- 分享 Share -->
    <template v-else-if="name === 'share'">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </template>
    
    <!-- 发送 Send -->
    <template v-else-if="name === 'send'">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </template>
    
    <!-- 保存 Save -->
    <template v-else-if="name === 'save'">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </template>
    
    <!-- 删除 Trash -->
    <template v-else-if="name === 'trash'">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </template>
    
    <!-- 添加 Plus -->
    <template v-else-if="name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </template>
    
    <!-- 减少 Minus -->
    <template v-else-if="name === 'minus'">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </template>
    
    <!-- 复选 Check -->
    <template v-else-if="name === 'check'">
      <polyline points="20 6 9 17 4 12"/>
    </template>
    
    <!-- 圆形复选 CheckCircle -->
    <template v-else-if="name === 'check-circle'">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </template>
    
    <!-- 圆形叉号 XCircle -->
    <template v-else-if="name === 'x-circle'">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </template>
    
    <!-- 警告 AlertTriangle -->
    <template v-else-if="name === 'alert-triangle'">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </template>
    
    <!-- 信息 Info -->
    <template v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </template>
    
    <!-- 帮助 HelpCircle -->
    <template v-else-if="name === 'help-circle'">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </template>
    
    <!-- 眼睛 Eye -->
    <template v-else-if="name === 'eye'">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </template>
    
    <!-- 隐藏 EyeOff -->
    <template v-else-if="name === 'eye-off'">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </template>
    
    <!-- 锁定 Lock -->
    <template v-else-if="name === 'lock'">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </template>
    
    <!-- 解锁 Unlock -->
    <template v-else-if="name === 'unlock'">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </template>
    
    <!-- 星星 Star -->
    <template v-else-if="name === 'star'">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </template>
    
    <!-- 收藏 Heart -->
    <template v-else-if="name === 'heart'">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </template>
    
    <!-- 铃铛 Bell -->
    <template v-else-if="name === 'bell'">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </template>
    
    <!-- WiFi -->
    <template v-else-if="name === 'wifi'">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </template>
    
    <!-- 电池 Battery -->
    <template v-else-if="name === 'battery'">
      <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
      <line x1="23" y1="13" x2="23" y2="11"/>
    </template>
    
    <!-- 闪电 Zap -->
    <template v-else-if="name === 'zap'">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </template>
    
    <!-- 火焰 Flame -->
    <template v-else-if="name === 'flame'">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </template>
    
    <!-- 全球 Globe -->
    <template v-else-if="name === 'globe'">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </template>
    
    <!-- 链接 Link -->
    <template v-else-if="name === 'link'">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </template>
    
    <!-- 外部链接 ExternalLink -->
    <template v-else-if="name === 'external-link'">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </template>
    
    <!-- 加载 Loader -->
    <template v-else-if="name === 'loader'">
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </template>
    
    <!-- 默认方形 -->
    <template v-else>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
    </template>
  </svg>
</template>

<style scoped>
.icon-lib {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

/* 加载动画 */
.icon-lib.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
