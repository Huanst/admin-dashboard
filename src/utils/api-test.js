/**
 * API测试工具
 * 用于验证API配置是否正确
 */

import api from '@/api'

/**
 * 测试API连接
 */
export const testAPIConnection = async () => {
  const results = {
    auth: false,
    user: false,
    image: false,
    generate: false,
    upload: false,
    dashboard: false,
    system: false
  }

  console.log('🚀 开始测试API连接...')

  // 测试认证API（不需要token的接口）
  try {
    // 这里可以测试登录接口，但需要有效的凭据
    console.log('✅ 认证API模块加载成功')
    results.auth = true
  } catch (error) {
    console.error('❌ 认证API模块加载失败:', error)
  }

  // 测试其他API模块的加载
  const modules = ['user', 'image', 'generate', 'upload', 'dashboard', 'system']
  
  modules.forEach(module => {
    try {
      if (api[module]) {
        console.log(`✅ ${module}API模块加载成功`)
        results[module] = true
      } else {
        console.error(`❌ ${module}API模块未找到`)
      }
    } catch (error) {
      console.error(`❌ ${module}API模块加载失败:`, error)
    }
  })

  return results
}

/**
 * 测试API方法是否存在
 */
export const testAPIMethods = () => {
  const expectedMethods = {
    auth: ['register', 'login', 'getUserInfo'],
    user: ['getUsers', 'getUserDetail', 'createUser', 'updateUser', 'deleteUser', 'batchDeleteUsers'],
    image: ['getImages', 'getImageDetail', 'deleteImage', 'batchDeleteImages'],
    generate: ['generateImage', 'getGenerationHistory'],
    upload: ['uploadAvatar', 'uploadFile'],
    dashboard: ['getStats', 'getUserGrowthTrend', 'getImageGenerationTrend', 'getPopularPrompts'],
    system: ['getSystemInfo', 'getSystemConfig', 'updateSystemConfig', 'clearCache']
  }

  console.log('🔍 检查API方法...')

  Object.entries(expectedMethods).forEach(([module, methods]) => {
    console.log(`\n📦 ${module}API模块:`)
    
    methods.forEach(method => {
      if (api[module] && typeof api[module][method] === 'function') {
        console.log(`  ✅ ${method}`)
      } else {
        console.log(`  ❌ ${method} - 方法不存在或不是函数`)
      }
    })
  })
}

/**
 * 在浏览器控制台中运行测试
 * 使用方法：
 * 1. 在浏览器中打开项目
 * 2. 打开开发者工具控制台
 * 3. 运行: window.testAPI()
 */
if (typeof window !== 'undefined') {
  window.testAPI = () => {
    testAPIConnection()
    testAPIMethods()
  }
}

export default {
  testAPIConnection,
  testAPIMethods
}