import request from '@/utils/request'

/**
 * 仪表盘API
 * 基于后端实际的API路径
 */
export const dashboardAPI = {
  /**
   * 获取系统统计数据
   */
  getStats() {
    return request.get('/dashboard/stats')
  },

  /**
   * 获取用户增长趋势
   * @param {number} days - 天数 (默认: 7)
   */
  getUserGrowthTrend(days = 7) {
    return request.get('/dashboard/user-growth-trend', {
      params: { days }
    })
  },

  /**
   * 获取图片生成趋势
   * @param {number} days - 天数 (默认: 7)
   */
  getImageGenerationTrend(days = 7) {
    return request.get('/dashboard/image-generation-trend', {
      params: { days }
    })
  },

  /**
   * 获取热门提示词
   * @param {number} limit - 限制数量 (默认: 5)
   */
  getPopularPrompts(limit = 5) {
    return request.get('/dashboard/popular-prompts', {
      params: { limit }
    })
  }
}

export default dashboardAPI