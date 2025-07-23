/**
 * 登录问题诊断工具
 * 用于排查前端登录失败的原因
 */

/**
 * 检查后端API服务连接
 */
export const checkBackendConnection = async () => {
  console.log('🔍 开始检查后端连接...')
  
  const baseURL = 'http://localhost:5004'
  const results = {
    serverRunning: false,
    apiAccessible: false,
    loginEndpoint: false,
    corsEnabled: false
  }
  
  try {
    // 1. 检查服务器是否运行
    console.log('1️⃣ 检查服务器是否运行...')
    const healthResponse = await fetch(`${baseURL}/health`, {
      method: 'GET',
      mode: 'cors'
    })
    
    if (healthResponse.ok) {
      results.serverRunning = true
      console.log('✅ 服务器正在运行')
    } else {
      console.log('❌ 服务器响应异常:', healthResponse.status)
    }
  } catch (error) {
    console.log('❌ 服务器连接失败:', error.message)
  }
  
  try {
    // 2. 检查API基础路径
    console.log('2️⃣ 检查API基础路径...')
    const apiResponse = await fetch(`${baseURL}/api`, {
      method: 'GET',
      mode: 'cors'
    })
    
    results.apiAccessible = true
    console.log('✅ API路径可访问')
  } catch (error) {
    console.log('❌ API路径访问失败:', error.message)
  }
  
  try {
    // 3. 检查管理员登录接口
    console.log('3️⃣ 检查管理员登录接口...')
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      }),
      mode: 'cors'
    })
    
    results.loginEndpoint = true
    results.corsEnabled = true
    console.log('✅ 登录接口可访问 (状态码:', loginResponse.status, ')')
    
    if (loginResponse.status === 401) {
      console.log('ℹ️ 返回401是正常的，说明接口工作正常但凭据无效')
    }
  } catch (error) {
    console.log('❌ 登录接口访问失败:', error.message)
    if (error.message.includes('CORS')) {
      console.log('❌ CORS跨域问题')
    }
  }
  
  return results
}

/**
 * 测试管理员账户登录
 */
export const testAdminLogin = async () => {
  console.log('🔐 测试管理员账户登录...')
  
  const credentials = {
    username: 'Huan',
    password: 'Huanst518'
  }
  
  try {
    const response = await fetch('http://localhost:5004/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials),
      mode: 'cors'
    })
    
    const data = await response.json()
    
    console.log('📊 登录响应状态:', response.status)
    console.log('📊 登录响应数据:', data)
    
    if (response.ok) {
      console.log('✅ 管理员登录成功!')
      return { success: true, data }
    } else {
      console.log('❌ 管理员登录失败')
      console.log('错误信息:', data.message || '未知错误')
      return { success: false, error: data }
    }
  } catch (error) {
    console.log('❌ 登录请求失败:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 检查前端配置
 */
export const checkFrontendConfig = () => {
  console.log('⚙️ 检查前端配置...')
  
  // 检查API基础URL
  const baseURL = 'http://localhost:5004/api'
  console.log('📍 API基础URL:', baseURL)
  
  // 检查本地存储
  const token = localStorage.getItem('admin_token')
  const user = localStorage.getItem('admin_user')
  
  console.log('💾 本地存储状态:')
  console.log('  - Token:', token ? '存在' : '不存在')
  console.log('  - User:', user ? '存在' : '不存在')
  
  if (token) {
    console.log('🧹 建议清除旧的token重新登录')
    console.log('执行: localStorage.removeItem("admin_token")')
    console.log('执行: localStorage.removeItem("admin_user")')
  }
}

/**
 * 完整的登录诊断
 */
export const diagnoseLoginIssue = async () => {
  console.log('🚀 开始登录问题诊断...\n')
  
  // 1. 检查前端配置
  checkFrontendConfig()
  console.log('\n' + '='.repeat(50) + '\n')
  
  // 2. 检查后端连接
  const connectionResults = await checkBackendConnection()
  console.log('\n' + '='.repeat(50) + '\n')
  
  // 3. 测试管理员登录
  const loginResults = await testAdminLogin()
  console.log('\n' + '='.repeat(50) + '\n')
  
  // 4. 生成诊断报告
  console.log('📋 诊断报告:')
  
  if (!connectionResults.serverRunning) {
    console.log('❌ 主要问题: 后端服务器未运行')
    console.log('💡 解决方案: 启动后端服务器')
  } else if (!connectionResults.corsEnabled) {
    console.log('❌ 主要问题: CORS跨域配置问题')
    console.log('💡 解决方案: 检查后端CORS设置')
  } else if (!loginResults.success) {
    console.log('❌ 主要问题: 登录凭据或后端逻辑问题')
    console.log('💡 解决方案: 检查后端用户数据和认证逻辑')
  } else {
    console.log('✅ 所有检查通过，登录应该正常工作')
  }
  
  console.log('\n📞 如需进一步帮助，请提供后端服务器的日志信息')
  
  return {
    connection: connectionResults,
    login: loginResults
  }
}

/**
 * 在浏览器控制台中运行诊断
 */
if (typeof window !== 'undefined') {
  window.diagnoseLogin = diagnoseLoginIssue
  window.testAdminLogin = testAdminLogin
  window.checkBackend = checkBackendConnection
  
  console.log('🔧 登录诊断工具已加载!')
  console.log('运行 diagnoseLogin() 开始完整诊断')
  console.log('运行 testAdminLogin() 测试管理员登录')
  console.log('运行 checkBackend() 检查后端连接')
}

export default {
  checkBackendConnection,
  testAdminLogin,
  checkFrontendConfig,
  diagnoseLoginIssue
}