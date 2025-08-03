import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置NProgress
NProgress.configure({ showSpinner: false })

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/Layout/index.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '仪表盘',
          icon: 'DataBoard'
        }
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('@/views/Users/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'User'
        }
      },
      {
        path: '/test-api',
        name: 'TestAPI',
        component: () => import('@/views/TestAPI.vue'),
        meta: {
          title: 'API测试',
          icon: 'Setting'
        }
      },
      {
        path: '/users/create',
        name: 'UserCreate',
        component: () => import('@/views/users/Create.vue'),
        meta: {
          title: '创建用户',
          icon: 'User'
        }
      },
      {
        path: '/users/:id',
        name: 'UserDetail',
        component: () => import('@/views/users/Detail.vue'),
        meta: {
          title: '用户详情',
          icon: 'User'
        }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile/index.vue'),
        meta: {
          title: '个人资料',
          icon: 'User'
        }
      },
      {
        path: '/images/list',
        name: 'ImagesList',
        component: () => import('@/views/Images/List.vue'),
        meta: {
          title: '图片列表',
          icon: 'List'
        }
      },
      {
        path: '/images/analytics',
        name: 'ImagesAnalytics',
        component: () => import('@/views/Images/Analytics.vue'),
        meta: {
          title: '生成分析',
          icon: 'TrendCharts'
        }
      },
      {
        path: '/generate',
        name: 'Generate',
        component: () => import('@/views/Generate/index.vue'),
        meta: {
          title: 'AI图片生成',
          icon: 'PictureFilled'
        }
      },
      {
        path: '/system',
        name: 'System',
        component: () => import('@/views/System/index.vue'),
        meta: {
          title: '系统设置',
          icon: 'Setting'
        }
      },
      {
        path: '/system/config',
        name: 'SystemConfig',
        component: () => import('@/views/System/Config.vue'),
        meta: {
          title: '系统配置',
          icon: 'Tools'
        }
      },
      {
        path: '/system/logs',
        name: 'SystemLogs',
        component: () => import('@/views/System/Logs.vue'),
        meta: {
          title: '系统日志',
          icon: 'Document'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 后台管理系统`
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isLoggedIn) {
      // 尝试从token恢复登录状态
      const restored = await authStore.restoreFromStorage()
      if (!restored) {
        next('/login')
        return
      }
    }
  }
  
  // 如果已登录且访问登录页，重定向到首页
  if (to.path === '/login' && authStore.isLoggedIn) {
    next('/')
    return
  }
  
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router