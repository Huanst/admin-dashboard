import { adminRequest } from '@/utils/request'

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
  getImages(params = {}) {
    return adminRequest.get('/admin/images', { params })
  },

  /**
   * 获取图片列表（别名方法，保持一致性）
   */
  getImageList(params = {}) {
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

export default imageAPI