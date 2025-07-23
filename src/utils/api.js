import request, { adminRequest } from './request'

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

/**
 * 用户管理API
 * 基于API文档 2. 用户管理模块
 */
export const userAPI = {
  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码 (默认: 1)
   * @param {number} params.pageSize - 每页数量 (默认: 10)
   * @param {string} params.keyword - 搜索关键词 (可选)
   * @param {string} params.status - 用户状态筛选 (可选: active, inactive, banned)
   * @param {string} params.role - 角色筛选 (可选: user, admin)
   */
  getUsers(params) {
    return adminRequest.get('/admin/users', { params })
  },

  /**
   * 获取用户详情
   * @param {number} id - 用户ID
   */
  getUserDetail(id) {
    return adminRequest.get(`/admin/users/${id}`)
  },

  /**
   * 创建用户
   * @param {Object} data - 用户信息
   * @param {string} data.username - 用户名
   * @param {string} data.email - 邮箱
   * @param {string} data.password - 密码
   * @param {string} data.role - 角色
   * @param {string} data.status - 状态
   */
  createUser(data) {
    return adminRequest.post('/admin/users', data)
  },

  /**
   * 更新用户
   * @param {number} id - 用户ID
   * @param {Object} data - 更新数据
   */
  updateUser(id, data) {
    return adminRequest.put(`/admin/users/${id}`, data)
  },

  /**
   * 删除用户
   * @param {number} id - 用户ID
   */
  deleteUser(id) {
    return adminRequest.delete(`/admin/users/${id}`)
  },

  /**
   * 批量删除用户
   * @param {Array<number>} userIds - 用户ID数组
   */
  batchDeleteUsers(userIds) {
    return adminRequest.post('/admin/users/batch-delete', { userIds })
  }
}

/**
 * 图片管理API
 * 基于API文档 3. 图片管理模块
 */
export const imageAPI = {
  /**
   * 获取图片列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码 (默认: 1)
   * @param {number} params.pageSize - 每页数量 (默认: 10)
   * @param {string} params.keyword - 搜索关键词 (可选)
   * @param {string} params.status - 图片状态筛选 (可选: published, draft, deleted)
   * @param {number} params.userId - 用户ID筛选 (可选)
   */
  getImages(params) {
    return adminRequest.get('/admin/images', { params })
  },

  /**
   * 获取图片列表（别名方法，保持一致性）
   */
  getImageList(params) {
    return this.getImages(params)
  },

  /**
   * 获取图片详情
   * @param {number} id - 图片ID
   */
  getImageDetail(id) {
    return adminRequest.get(`/admin/images/${id}`)
  },

  /**
   * 删除图片
   * @param {number} id - 图片ID
   */
  deleteImage(id) {
    return adminRequest.delete(`/admin/images/${id}`)
  },

  /**
   * 批量删除图片
   * @param {Array<number>} imageIds - 图片ID数组
   */
  batchDeleteImages(imageIds) {
    return adminRequest.post('/admin/images/batch-delete', { imageIds })
  }
}

/**
 * 生成分析API
 * 基于API文档 生成分析模块
 */
export const analyticsAPI = {
  /**
   * 获取生成统计数据
   */
  getStats() {
    return adminRequest.get('/admin/analytics/stats')
  },

  /**
   * 获取生成趋势数据
   * @param {string} period - 时间周期 (24h, 7d, 30d)
   */
  getTrends(period = '7d') {
    return adminRequest.get('/admin/analytics/trends', { params: { period } })
  },

  /**
   * 获取用户生成行为分析
   */
  getUserAnalytics() {
    return adminRequest.get('/admin/analytics/users')
  }
}

/**
 * 仪表盘API
 * 基于后端实际的API路径
 */
export const dashboardAPI = {
  /**
   * 获取系统统计数据
   */
  getStats() {
    return request.get('/api/dashboard/stats')
  },

  /**
   * 获取用户增长趋势
   * @param {number} days - 天数 (默认: 7)
   */
  getUserGrowthTrend(days = 7) {
    return request.get('/api/dashboard/user-growth-trend', { params: { days } })
  },

  /**
   * 获取图片生成趋势
   * @param {number} days - 天数 (默认: 7)
   */
  getImageGenerationTrend(days = 7) {
    return request.get('/api/dashboard/image-generation-trend', { params: { days } })
  },

  /**
   * 获取热门提示词
   * @param {number} limit - 限制数量 (默认: 5)
   */
  getPopularPrompts(limit = 5) {
    return request.get('/api/dashboard/popular-prompts', { params: { limit } })
  }
}

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

/**
 * 图片生成API
 * 基于API文档 5. 图片生成模块
 */
export const generateAPI = {
  /**
   * 生成图片
   * @param {Object} data - 生成参数
   * @param {string} data.prompt - 提示词
   * @param {string} data.model - 模型 (默认: Kwai-Kolors/Kolors)
   * @param {string} data.image_size - 图片尺寸 (默认: 1280x1280)
   * @param {number} data.batch_size - 批次大小 (默认: 1)
   */
  generateImage(data) {
    return request.post('/api/generate-image', {
      model: 'Kwai-Kolors/Kolors',
      image_size: '1280x1280',
      batch_size: 1,
      ...data
    })
  },

  /**
   * 获取生成历史
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码 (默认: 1)
   * @param {number} params.pageSize - 每页数量 (默认: 10)
   */
  getGenerationHistory(params) {
    return request.get('/api/user/generations', { params })
  }
}

/**
 * 文件上传API
 * 基于API文档 6. 文件上传模块
 */
export const uploadAPI = {
  /**
   * 上传头像
   * @param {File} file - 头像文件 (支持 jpg, png, gif, webp, svg)
   */
  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    return request.post('/api/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}