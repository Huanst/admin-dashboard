/**
 * 快速登录测试脚本
 * 使用正确的管理员凭据测试登录功能
 */

// 管理员凭据
const ADMIN_CREDENTIALS = {
  username: 'Huan',
  password: 'Huanst518'
};

// API配置
const API_CONFIG = {
  baseURL: 'http://localhost:5004',
  loginEndpoint: '/auth/login'
};

/**
 * 测试登录功能
 */
async function testLogin() {
  console.log('🚀 开始测试登录功能...\n');
  
  try {
    console.log('📝 使用凭据:');
    console.log(`   用户名: ${ADMIN_CREDENTIALS.username}`);
    console.log(`   密码: ${ADMIN_CREDENTIALS.password}`);
    console.log(`   API地址: ${API_CONFIG.baseURL}${API_CONFIG.loginEndpoint}\n`);
    
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.loginEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ADMIN_CREDENTIALS),
      mode: 'cors'
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('📊 响应数据:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ 登录成功！');
      
      // 保存token到本地存储
      if (data.data && data.data.token) {
        localStorage.setItem('admin_token', data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        console.log('💾 Token已保存到本地存储');
      }
      
      return { success: true, data };
    } else {
      console.log('\n❌ 登录失败');
      console.log(`错误信息: ${data.message || '未知错误'}`);
      
      // 分析错误原因
      if (response.status === 401) {
        console.log('\n🔍 可能的原因:');
        console.log('1. 用户名或密码错误');
        console.log('2. 账户不存在');
        console.log('3. 账户被禁用');
        console.log('4. 后端认证逻辑问题');
      } else if (response.status === 404) {
        console.log('\n🔍 可能的原因:');
        console.log('1. 登录接口路径错误');
        console.log('2. 后端路由配置问题');
      } else if (response.status === 500) {
        console.log('\n🔍 可能的原因:');
        console.log('1. 后端服务器内部错误');
        console.log('2. 数据库连接问题');
      }
      
      return { success: false, error: data };
    }
  } catch (error) {
    console.log('\n❌ 请求失败');
    console.log(`错误信息: ${error.message}`);
    
    if (error.message.includes('CORS')) {
      console.log('\n🔍 CORS跨域问题:');
      console.log('1. 检查后端CORS配置');
      console.log('2. 确保允许localhost:5178访问');
    } else if (error.message.includes('fetch')) {
      console.log('\n🔍 网络连接问题:');
      console.log('1. 检查后端服务是否启动');
      console.log('2. 检查端口5004是否可用');
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * 检查当前登录状态
 */
function checkLoginStatus() {
  console.log('🔍 检查当前登录状态...\n');
  
  const token = localStorage.getItem('admin_token');
  const user = localStorage.getItem('admin_user');
  
  if (token && user) {
    console.log('✅ 已登录');
    console.log(`Token: ${token.substring(0, 20)}...`);
    console.log(`用户信息: ${user}`);
  } else {
    console.log('❌ 未登录');
  }
}

/**
 * 清除登录状态
 */
function clearLoginStatus() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  sessionStorage.clear();
  console.log('🧹 登录状态已清除');
}

/**
 * 在浏览器环境中暴露函数
 */
if (typeof window !== 'undefined') {
  window.testLogin = testLogin;
  window.checkLoginStatus = checkLoginStatus;
  window.clearLoginStatus = clearLoginStatus;
  
  console.log('🔧 快速登录测试工具已加载！');
  console.log('可用命令:');
  console.log('- testLogin() - 测试登录');
  console.log('- checkLoginStatus() - 检查登录状态');
  console.log('- clearLoginStatus() - 清除登录状态');
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testLogin,
    checkLoginStatus,
    clearLoginStatus,
    ADMIN_CREDENTIALS,
    API_CONFIG
  };
}