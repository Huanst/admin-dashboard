import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

/**
 * 创建axios实例
 * 基于新的API文档配置
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5004/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加认证token
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 统一处理响应数据和错误
 */
request.interceptors.response.use(
  (response) => {
    const { data } = response
    
    // 直接返回响应数据，保持API文档中的格式
    // API文档中的成功响应格式：{ success: true, data: {...}, message: "..." }
    return data
  },
  (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      // 根据API文档中的错误码处理
      switch (status) {
        case 400:
          ElMessage.error(data?.message || '请求参数错误')
          break
        case 401:
          // 未授权，清除登录状态并跳转到登录页
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/login')
          ElMessage.error(data?.message || '未授权，请重新登录')
          break
        case 403:
          ElMessage.error(data?.message || '权限不足')
          break
        case 404:
          ElMessage.error(data?.message || '资源不存在')
          break
        case 409:
          ElMessage.error(data?.message || '资源冲突')
          break
        case 413:
          ElMessage.error(data?.message || '文件过大')
          break
        case 415:
          ElMessage.error(data?.message || '不支持的文件类型')
          break
        case 500:
          ElMessage.error(data?.message || '服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

/**
 * 创建管理员专用axios实例
 * 用于访问不带 /api 前缀的管理员接口
 */
const adminRequest = axios.create({
  baseURL: import.meta.env.VITE_API_SERVER_URL || 'http://localhost:5004',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 管理员请求拦截器
adminRequest.interceptors.request.use(
  (config) => {
    // 添加认证token
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
  },
  (error) => {
    console.error('管理员请求错误:', error)
    return Promise.reject(error)
  }
)

// 管理员响应拦截器（复用相同的错误处理逻辑）
adminRequest.interceptors.response.use(
  (response) => {
    const { data } = response
    return data
  },
  (error) => {
    console.error('管理员响应错误:', error)

    if (error.response) {
      const { status, data } = error.response

      // 根据API文档中的错误码处理
      switch (status) {
        case 400:
          ElMessage.error(data?.message || '请求参数错误')
          break
        case 401:
          // 未授权，清除登录状态并跳转到登录页
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/login')
          ElMessage.error(data?.message || '未授权，请重新登录')
          break
        case 403:
          ElMessage.error(data?.message || '权限不足')
          break
        case 404:
          ElMessage.error(data?.message || '资源不存在')
          break
        case 409:
          ElMessage.error(data?.message || '资源冲突')
          break
        case 413:
          ElMessage.error(data?.message || '文件过大')
          break
        case 415:
          ElMessage.error(data?.message || '不支持的文件类型')
          break
        case 500:
          ElMessage.error(data?.message || '服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export { adminRequest }
export default request