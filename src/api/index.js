/**
 * API模块统一导出
 * 基于更新后的API文档重新组织
 */

// 导入所有API模块
import { authAPI } from './auth'
import { userAPI } from './user'
import { imageAPI } from './image'
import { uploadAPI } from './upload'
import { dashboardAPI } from './dashboard'
import { systemAPI } from './system'
import { healthAPI } from './health'

// 统一导出所有API
export {
  authAPI,
  userAPI,
  imageAPI,
  uploadAPI,
  dashboardAPI,
  systemAPI,
  healthAPI
}

// 默认导出一个包含所有API的对象
export default {
  auth: authAPI,
  user: userAPI,
  image: imageAPI,
  upload: uploadAPI,
  dashboard: dashboardAPI,
  system: systemAPI,
  health: healthAPI
}

/**
 * 使用示例：
 * 
 * // 方式1：按需导入
 * import { userAPI, authAPI, healthAPI } from '@/api'
 * 
 * // 方式2：导入所有API
 * import api from '@/api'
 * api.user.getUsers()
 * api.health.checkHealth()
 * 
 * // 方式3：从utils/api.js导入（保持向后兼容）
 * import { userAPI } from '@/utils/api'
 */