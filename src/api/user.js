import { adminRequest } from '@/utils/request'

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
  getUsers(params = {}) {
    return adminRequest.get('/admin/users', { params })
  },

  /**
   * 获取用户详情
   * @param {number} id - 用户ID
   */
  getUserById(id) {
    return adminRequest.get(`/admin/users/${id}`)
  },

  /**
   * 获取用户详情（别名）
   * @param {number} id - 用户ID
   */
  getUserDetail(id) {
    return this.getUserById(id)
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
  },

  /**
   * 获取用户活动记录
   * @param {number} id - 用户ID
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码 (默认: 1)
   * @param {number} params.limit - 每页数量 (默认: 10)
   */
  getUserActivities(id, params = {}) {
    return adminRequest.get(`/api/users/${id}/activities`, { params })
  }
}

export default userAPI