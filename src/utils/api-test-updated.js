/**
 * API接口测试工具
 * 基于更新后的API文档进行测试
 */

import { authAPI } from '@/api/auth'
import { userAPI } from '@/api/user'
import { imageAPI } from '@/api/image'
import { generateAPI } from '@/api/generate'
import { dashboardAPI } from '@/api/dashboard'
import { systemAPI } from '@/api/system'
import { uploadAPI } from '@/api/upload'

/**
 * API测试类
 */
export class APITester {
  constructor() {
    this.results = []
  }

  /**
   * 记录测试结果
   * @param {string} apiName - API名称
   * @param {boolean} success - 是否成功
   * @param {any} data - 返回数据
   * @param {Error} error - 错误信息
   */
  logResult(apiName, success, data = null, error = null) {
    this.results.push({
      apiName,
      success,
      data,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    })
    
    console.log(`[API测试] ${apiName}: ${success ? '✅ 成功' : '❌ 失败'}`, {
      data,
      error
    })
  }

  /**
   * 测试认证API
   */
  async testAuthAPI() {
    console.log('🔐 开始测试认证API...')
    
    // 测试登录
    try {
      const loginResult = await authAPI.login({
        username: 'admin',
        password: 'admin123'
      })
      this.logResult('认证-登录', true, loginResult)
    } catch (error) {
      this.logResult('认证-登录', false, null, error)
    }

    // 测试获取用户信息
    try {
      const userInfo = await authAPI.getUserInfo()
      this.logResult('认证-获取用户信息', true, userInfo)
    } catch (error) {
      this.logResult('认证-获取用户信息', false, null, error)
    }
  }

  /**
   * 测试用户管理API
   */
  async testUserAPI() {
    console.log('👥 开始测试用户管理API...')
    
    // 测试获取用户列表
    try {
      const users = await userAPI.getUsers({ page: 1, pageSize: 10 })
      this.logResult('用户管理-获取用户列表', true, users)
    } catch (error) {
      this.logResult('用户管理-获取用户列表', false, null, error)
    }

    // 测试获取用户详情
    try {
      const userDetail = await userAPI.getUserById(1)
      this.logResult('用户管理-获取用户详情', true, userDetail)
    } catch (error) {
      this.logResult('用户管理-获取用户详情', false, null, error)
    }
  }

  /**
   * 测试图片管理API
   */
  async testImageAPI() {
    console.log('🖼️ 开始测试图片管理API...')
    
    // 测试获取图片列表
    try {
      const images = await imageAPI.getImages({ page: 1, pageSize: 10 })
      this.logResult('图片管理-获取图片列表', true, images)
    } catch (error) {
      this.logResult('图片管理-获取图片列表', false, null, error)
    }

    // 测试获取用户图片
    try {
      const userImages = await imageAPI.getUserImages({ page: 1, pageSize: 10 })
      this.logResult('图片管理-获取用户图片', true, userImages)
    } catch (error) {
      this.logResult('图片管理-获取用户图片', false, null, error)
    }
  }

  /**
   * 测试图片生成API
   */
  async testGenerateAPI() {
    console.log('🎨 开始测试图片生成API...')
    
    // 测试生成图片
    try {
      const generateResult = await generateAPI.generateImage({
        prompt: 'a beautiful sunset over the ocean',
        width: 512,
        height: 512
      })
      this.logResult('图片生成-生成图片', true, generateResult)
    } catch (error) {
      this.logResult('图片生成-生成图片', false, null, error)
    }

    // 测试获取生成历史
    try {
      const history = await generateAPI.getUserImages({ page: 1, pageSize: 10 })
      this.logResult('图片生成-获取生成历史', true, history)
    } catch (error) {
      this.logResult('图片生成-获取生成历史', false, null, error)
    }
  }

  /**
   * 测试仪表板API
   */
  async testDashboardAPI() {
    console.log('📊 开始测试仪表板API...')
    
    // 测试获取统计数据
    try {
      const stats = await dashboardAPI.getStats()
      this.logResult('仪表板-获取统计数据', true, stats)
    } catch (error) {
      this.logResult('仪表板-获取统计数据', false, null, error)
    }

    // 测试获取用户增长趋势
    try {
      const userGrowth = await dashboardAPI.getUserGrowthTrend(7)
      this.logResult('仪表板-获取用户增长趋势', true, userGrowth)
    } catch (error) {
      this.logResult('仪表板-获取用户增长趋势', false, null, error)
    }

    // 测试获取图片生成趋势
    try {
      const imageTrends = await dashboardAPI.getImageGenerationTrend(7)
      this.logResult('仪表板-获取图片生成趋势', true, imageTrends)
    } catch (error) {
      this.logResult('仪表板-获取图片生成趋势', false, null, error)
    }

    // 测试获取热门提示词
    try {
      const popularPrompts = await dashboardAPI.getPopularPrompts(10)
      this.logResult('仪表板-获取热门提示词', true, popularPrompts)
    } catch (error) {
      this.logResult('仪表板-获取热门提示词', false, null, error)
    }
  }

  /**
   * 测试系统管理API
   */
  async testSystemAPI() {
    console.log('⚙️ 开始测试系统管理API...')
    
    // 测试获取系统信息
    try {
      const systemInfo = await systemAPI.getSystemInfo()
      this.logResult('系统管理-获取系统信息', true, systemInfo)
    } catch (error) {
      this.logResult('系统管理-获取系统信息', false, null, error)
    }

    // 测试获取系统配置
    try {
      const systemConfig = await systemAPI.getSystemConfig()
      this.logResult('系统管理-获取系统配置', true, systemConfig)
    } catch (error) {
      this.logResult('系统管理-获取系统配置', false, null, error)
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始运行API测试...')
    this.results = []
    
    await this.testAuthAPI()
    await this.testUserAPI()
    await this.testImageAPI()
    await this.testGenerateAPI()
    await this.testDashboardAPI()
    await this.testSystemAPI()
    
    this.printSummary()
  }

  /**
   * 打印测试摘要
   */
  printSummary() {
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = total - successful
    
    console.log('\n📋 API测试摘要:')
    console.log(`总计: ${total} 个接口`)
    console.log(`成功: ${successful} 个 ✅`)
    console.log(`失败: ${failed} 个 ❌`)
    console.log(`成功率: ${((successful / total) * 100).toFixed(1)}%`)
    
    if (failed > 0) {
      console.log('\n❌ 失败的接口:')
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`- ${r.apiName}: ${r.error}`)
        })
    }
    
    return {
      total,
      successful,
      failed,
      successRate: (successful / total) * 100,
      results: this.results
    }
  }

  /**
   * 获取测试结果
   */
  getResults() {
    return this.results
  }
}

// 导出测试实例
export const apiTester = new APITester()

// 在浏览器控制台中可以直接调用的测试函数
if (typeof window !== 'undefined') {
  window.testAPI = () => apiTester.runAllTests()
  window.apiTester = apiTester
}

export default APITester