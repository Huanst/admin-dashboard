import request from '@/utils/request'

/**
 * 文件上传API
 * 基于API文档 5. 文件上传接口
 */
export const uploadAPI = {
  /**
   * 上传头像
   * @param {FormData} formData - 包含头像文件的表单数据
   */
  uploadAvatar(formData) {
    return request.post('/api/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 上传头像（兼容接口）
   * @param {FormData} formData - 包含头像文件的表单数据
   */
  uploadAvatarLegacy(formData) {
    return request.post('/api/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 通用文件上传
   * @param {FormData} formData - 包含文件的表单数据
   * @param {Function} onProgress - 上传进度回调
   */
  uploadFile(formData, onProgress) {
    return request.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    })
  },

  /**
   * 上传文件（通用接口）
   * @param {FormData} formData - 包含文件的表单数据
   * @param {Function} onProgress - 上传进度回调
   */
  uploadFileGeneric(formData, onProgress) {
    return request.post('/api/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    })
  }
}

export default uploadAPI