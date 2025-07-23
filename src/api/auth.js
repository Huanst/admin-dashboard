import request, { adminRequest } from '@/utils/request'

/**
 * 认证相关API
 * 基于API文档 1. 认证模块
 */
export const authAPI = {
  /**
   * 用户注册
   * @param {Object} data - 注册信息
   * @param {string} data.username - 用户名
   * @param {string} data.email - 邮箱
   * @param {string} data.password - 密码
   */
  register(data) {
    return request.post('/auth/register', data)
  },

  /**
   * 管理员登录（使用管理员专用接口）
   * @param {Object} credentials - 登录凭据
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   */
  login(credentials) {
    return adminRequest.post('/auth/login', credentials)
  },

  /**
   * 获取管理员信息
   */
  getUserInfo() {
    return adminRequest.get('/auth/profile')
  },

  /**
   * 验证管理员令牌
   */
  validateToken() {
    return adminRequest.post('/auth/validate-token')
  }
}

export default authAPI