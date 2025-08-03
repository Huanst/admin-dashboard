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
   * 获取系统日志
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.level - 日志级别
   * @param {string} params.type - 日志类型
   * @param {string} params.keyword - 关键词
   * @param {string} params.startTime - 开始时间
   * @param {string} params.endTime - 结束时间
   * @param {string} params.sortBy - 排序字段
   * @param {string} params.sortOrder - 排序方向
   */
  getLogs(params = {}) {
    return adminRequest.get('/admin/system/logs', { params })
  },

  /**
   * 导出系统日志
   * @param {Object} params - 查询参数
   */
  exportLogs(params = {}) {
    return adminRequest.get('/admin/system/logs/export', {
      params,
      responseType: 'blob'
    })
  },

  /**
   * 清空系统日志
   */
  clearLogs() {
    return adminRequest.delete('/admin/system/logs')
  },

  /**
   * 获取配置（别名方法）
   */
  getConfig() {
    return this.getSystemConfig()
  },

  /**
   * 更新配置（别名方法）
   */
  updateConfig(config) {
    return this.updateSystemConfig(config)
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