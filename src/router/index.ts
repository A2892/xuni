import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'student-id',
          component: () => import('../views/StudentIDView.vue'),
        },
        {
          path: 'schedule',
          name: 'schedule',
          component: () => import('../views/ScheduleView.vue'),
        },
        {
          path: 'admission',
          name: 'admission',
          component: () => import('../views/AdmissionView.vue'),
        },
        {
          path: 'transcript',
          name: 'transcript',
          component: () => import('../views/TranscriptView.vue'),
        },
        {
          path: 'enrollment',
          name: 'enrollment',
          component: () => import('../views/EnrollmentView.vue'),
        },
        {
          path: 'student-photo',
          name: 'student-photo',
          component: () => import('../views/StudentPhotoView.vue'),
        },
        {
          path: 'student-profile',
          name: 'student-profile',
          component: () => import('../views/StudentProfileView.vue'),
        },
        {
          path: 'student-documents',
          name: 'student-documents',
          component: () => import('../views/StudentDocumentsView.vue'),
        },
        {
          path: 'admin-management',
          name: 'admin-management',
          component: () => import('../views/AdminManagementView.vue'),
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'academic-report',
          name: 'academic-report',
          component: () => import('../views/AcademicReportView.vue'),
        },
        {
          path: 'bank-statement',
          name: 'bank-statement',
          component: () => import('../views/BankStatementView.vue'),
        },
        // ====== 新增功能 ======
        {
          path: 'invoice',
          name: 'invoice',
          component: () => import('../views/InvoiceView.vue'),
        },
        {
          path: 'utility-bill',
          name: 'utility-bill',
          component: () => import('../views/UtilityBillView.vue'),
        },
        {
          path: 'flight',
          name: 'flight',
          component: () => import('../views/FlightView.vue'),
        },
        {
          path: 'hotel',
          name: 'hotel',
          component: () => import('../views/HotelView.vue'),
        },
        {
          path: 'receipt-generator',
          name: 'receipt-generator',
          component: () => import('../views/ReceiptGeneratorView.vue'),
        },
        {
          path: 'tuition-receipt',
          name: 'tuition-receipt',
          component: () => import('../views/TuitionReceiptView.vue'),
        },
        // 银行卡管理已移除
        {
          path: 'watermark-settings',
          name: 'watermark-settings',
          component: () => import('../views/WatermarkSettingsView.vue')
        },
        // ====== 签证生成 ======
        {
          path: 'visa-center',
          name: 'visa-center',
          component: () => import('../views/VisaCenterView.vue'),
        },
        {
          path: 'visa',
          name: 'visa',
          component: () => import('../views/VisaView.vue'),
        },
        {
          path: 'visa-checklist',
          name: 'visa-checklist',
          component: () => import('../views/VisaChecklistView.vue'),
        },
        {
          path: 'visa-interview',
          name: 'visa-interview',
          component: () => import('../views/VisaInterviewView.vue'),
        },
        {
          path: 'visa-progress',
          name: 'visa-progress',
          component: () => import('../views/VisaProgressView.vue'),
        },
        // ====== 国内版本 ======
        {
          path: 'cn-bill',
          name: 'cn-bill',
          component: () => import('../views/CNBillView.vue'),
        },
        {
          path: 'cn-hotel',
          name: 'cn-hotel',
          component: () => import('../views/CNHotelView.vue'),
        },
        {
          path: 'cn-code',
          name: 'cn-code',
          component: () => import('../views/CNCodeGeneratorView.vue'),
        },
        // ====== 学校生成功能 ======
        {
          path: 'school-transcript',
          name: 'school-transcript',
          component: () => import('../views/SchoolTranscriptView.vue'),
        },
        {
          path: 'enrollment-cert',
          name: 'enrollment-cert',
          component: () => import('../views/EnrollmentCertView.vue'),
        },
        {
          path: 'recommendation-letter',
          name: 'recommendation-letter',
          component: () => import('../views/RecommendationLetterView.vue'),
        },
        // ====== 回收站 ======
        {
          path: 'recycle-bin',
          name: 'recycle-bin',
          component: () => import('../views/RecycleBinView.vue'),
        },
        // ====== 学生管理（CockroachDB 迁移新增）======
        {
          path: 'student-list',
          name: 'student-list',
          component: () => import('../views/StudentListView.vue'),
        },
        {
          path: 'student-form',
          name: 'student-form',
          component: () => import('../views/StudentFormView.vue'),
        },
        {
          path: 'student-form/:studentId',
          name: 'student-form-edit',
          component: () => import('../views/StudentFormView.vue'),
        },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !authStore.checkAuth()) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && authStore.checkAuth()) {
    // 已登录但访问登录页，跳转到首页
    next('/')
  } else {
    next()
  }
})

export default router
