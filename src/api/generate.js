import request from '@/utils/request'

/**
 * 图片生成API
 * 基于API文档 4. 图片生成与管理
 */
export const generateAPI = {
  /**
   * 生成图片（新版API，支持游客）
   * @param {Object} data - 生成参数
   * @param {string} data.prompt - 图片描述（必填）
   * @param {number} data.width - 宽度（可选，默认1024）
   * @param {number} data.height - 高度（可选，默认1024）
   * @param {number} data.num_inference_steps - 推理步数（可选，默认20）
   * @param {number} data.guidance_scale - 引导比例（可选，默认7.5）
   * @param {number} data.seed - 随机种子（可选）
   * @param {string} data.model - AI模型（可选，默认black-forest-labs/FLUX.1-schnell）
   */
  generateImage(data) {
    return request.post('/api/generate-image', {
      width: 1024,
      height: 1024,
      num_inference_steps: 20,
      guidance_scale: 7.5,
      model: 'black-forest-labs/FLUX.1-schnell',
      ...data
    })
  },

  /**
   * 生成图片（旧版接口，保持兼容）
   * @param {Object} data - 生成参数
   */
  generateImageLegacy(data) {
    return request.post('/api/generate-image', {
      width: 1024,
      height: 1024,
      num_inference_steps: 20,
      guidance_scale: 7.5,
      model: 'black-forest-labs/FLUX.1-schnell',
      ...data
    })
  },

  /**
   * 获取用户图片历史（旧版接口）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码（默认：1）
   * @param {number} params.pageSize - 每页数量（默认：10，最大：50）
   * @param {string} params.category - 分类筛选（可选）
   */
  getUserImages(params = {}) {
    return request.get('/api/user/images', { params })
  },

  /**
   * 获取用户生成记录（新版API）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码（默认：1）
   * @param {number} params.pageSize - 每页数量（默认：10）
   */
  getUserGenerations(params = {}) {
    return request.get('/api/user/generations', { params })
  },

  /**
   * 获取生成历史（别名方法，保持向后兼容）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码 (默认: 1)
   * @param {number} params.pageSize - 每页数量 (默认: 10)
   */
  getGenerationHistory(params = {}) {
    return this.getUserImages(params)
  }
}

export default generateAPI