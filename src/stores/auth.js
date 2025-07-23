import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { authAPI } from '@/api/auth'
import { ElMessage } from 'element-plus'

/**
 * 认证状态管理
 * 基于新的API文档格式
 */
export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(null)
  const user = ref(null)
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   */
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await authAPI.login(credentials)
      
      if (response.success && response.data) {
        // 根据API文档，登录成功返回的数据结构
        const { token: authToken, ...userData } = response.data
        
        // 更新状态
        token.value = authToken
        user.value = userData
        
        // 存储到本地
        localStorage.setItem('admin_token', authToken)
        localStorage.setItem('admin_user', JSON.stringify(userData))
        
        ElMessage.success(response.message || '登录成功')
        return { success: true, data: userData }
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      let errorMessage = '登录失败，请重试'
      
      if (error.response) {
        const { status, data } = error.response
        
        // 根据API文档中的错误码处理
        switch (status) {
          case 400:
            errorMessage = data?.message || '请求参数错误'
            break
          case 401:
            errorMessage = data?.message || '用户名或密码错误'
            break
          case 404:
            errorMessage = data?.message || '用户不存在'
            break
          case 500:
            errorMessage = data?.message || '服务器内部错误'
            break
          default:
            errorMessage = data?.message || errorMessage
        }
      } else if (error.request) {
        errorMessage = '无法连接到服务器'
      }
      
      ElMessage.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户登出
   */
  const logout = () => {
    token.value = null
    user.value = null
    
    // 清除本地存储
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    
    ElMessage.info('已退出登录')
  }

  /**
   * 从本地存储恢复状态
   */
  const restoreFromStorage = async () => {
    const storedToken = localStorage.getItem('admin_token')
    const storedUser = localStorage.getItem('admin_user')
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        
        // 验证token是否仍然有效，通过获取用户信息来验证
        const userInfo = await getUserInfo()
        return !!userInfo
      } catch (error) {
        logout()
        return false
      }
    }
    
    return false
  }

  /**
   * 获取用户信息
   */
  const getUserInfo = async () => {
    try {
      const response = await authAPI.getUserInfo()
      
      if (response.success && response.data) {
        user.value = response.data
        localStorage.setItem('admin_user', JSON.stringify(response.data))
        return response.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，可能token已过期
      if (error.response?.status === 401) {
        logout()
      }
    }
    return null
  }

  return {
    // 状态
    token: readonly(token),
    user: readonly(user),
    loading: readonly(loading),
    
    // 计算属性
    isLoggedIn,
    
    // 方法
    login,
    logout,
    restoreFromStorage,
    getUserInfo
  }
})