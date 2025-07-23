import request from '@/utils/request'

/**
 * 健康检查API
 * 基于API文档 1. 系统基础接口
 */
export const healthAPI = {
  /**
   * 系统健康检查
   * 用途：检查服务器运行状态
   * 认证：无需认证
   */
  checkHealth() {
    return request.get('/health')
  },

  /**
   * 获取测试用户列表
   * 用于开发和测试环境
   */
  getTestUsers() {
    return request.get('/api/test-users')
  },

  /**
   * 创建测试用户
   * 用于开发和测试环境
   */
  createTestUsers() {
    return request.post('/api/create-test-users')
  }
}

export default healthAPI