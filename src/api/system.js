import { adminRequest } from '@/utils/request'

/**
 * 系统设置API
 * 基于API文档 4. 系统设置模块
 */
export const systemAPI = {
  /**
   * 获取系统信息
   */
  getSystemInfo() {
    return adminRequest.get('/admin/system/info')
  },

  /**
   * 获取系统配置
   */
  getSystemConfig() {
    return adminRequest.get('/admin/system/config')
  },

  /**
   * 更新系统配置
   * @param {Object} config - 配置数据
   * @param {string} config.siteName - 网站名称
   * @param {string} config.siteDescription - 网站描述
   * @param {number} config.maxFileSize - 最大文件大小
   * @param {Array<string>} config.allowedFormats - 允许的文件格式
   * @param {boolean} config.enableRegistration - 是否启用注册
   * @param {boolean} config.enableEmailVerification - 是否启用邮箱验证
   * @param {string} config.defaultUserRole - 默认用户角色
   */
  updateSystemConfig(config) {
    return adminRequest.put('/admin/system/config', config)
  },

  /**
   * 清理系统缓存
   * @param {Array<string>} cacheTypes - 缓存类型数组 (可选: temp, logs, thumbnails)
   */
  clearCache(cacheTypes = ['temp', 'logs', 'thumbnails']) {
    return adminRequest.post('/admin/system/clear-cache', { cacheTypes })
  }
}

export default systemAPI