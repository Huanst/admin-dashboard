import request, { adminRequest } from '@/utils/request'

/**
 * 仪表盘API
 * 基于后端实际的API路径
 */
export const dashboardAPI = {
  /**
   * 获取系统统计数据
   * @param {boolean} includeChanges - 是否包含变化数据 (默认: true)
   */
  getStats(includeChanges = true) {
    return adminRequest.get('/admin/dashboard/stats', {
      params: { includeChanges }
    })
  },

  /**
   * 获取用户增长趋势
   * @param {number} days - 天数 (默认: 7)
   */
  getUserGrowthTrend(days = 7) {
    return adminRequest.get('/admin/dashboard/user-growth', {
      params: { days }
    })
  },

  /**
   * 获取图片生成趋势
   * @param {number} days - 天数 (默认: 7)
   */
  getImageGenerationTrend(days = 7) {
    return adminRequest.get('/admin/dashboard/image-trends', {
      params: { days }
    })
  },

  /**
   * 获取热门提示词
   * @param {number} limit - 限制数量 (默认: 5)
   */
  getPopularPrompts(limit = 5) {
    return adminRequest.get('/admin/dashboard/popular-prompts', {
      params: { limit }
    })
  }
}

export default dashboardAPI