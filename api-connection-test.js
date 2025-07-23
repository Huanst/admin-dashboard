#!/usr/bin/env node

/**
 * API 连接测试脚本
 * 验证 admin-dashboard 与 backend API 的连接是否正常
 */

const https = require('https');
const http = require('http');

// 测试配置
const TEST_CONFIG = {
  backend: {
    host: 'localhost',
    port: 5004,
    protocol: 'http'
  },
  admin: {
    username: 'Huan',
    password: 'Huanst518'
  }
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP 请求工具
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https' ? https : http;
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonBody,
            raw: body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 测试函数
async function testHealthCheck() {
  log('\n🔍 1. 测试后端健康检查...', 'cyan');
  
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.backend.host,
      port: TEST_CONFIG.backend.port,
      path: '/api/health',
      method: 'GET',
      protocol: TEST_CONFIG.backend.protocol
    });
    
    if (response.status === 200) {
      log('✅ 后端服务正常运行', 'green');
      return true;
    } else {
      log(`❌ 后端服务异常 (状态码: ${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 后端服务连接失败: ${error.message}`, 'red');
    return false;
  }
}

async function testAdminLogin() {
  log('\n🔐 2. 测试管理员登录...', 'cyan');
  
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.backend.host,
      port: TEST_CONFIG.backend.port,
      path: '/auth/login',
      method: 'POST',
      protocol: TEST_CONFIG.backend.protocol,
      headers: {
        'Content-Type': 'application/json'
      }
    }, TEST_CONFIG.admin);
    
    log(`   状态码: ${response.status}`, 'yellow');
    
    if (response.status === 200 && response.data.success) {
      log('✅ 管理员登录成功', 'green');
      log(`   用户: ${response.data.data.user.username}`, 'blue');
      log(`   角色: ${response.data.data.user.role}`, 'blue');
      return response.data.data.token;
    } else {
      log(`❌ 管理员登录失败: ${response.data?.message || '未知错误'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ 登录请求失败: ${error.message}`, 'red');
    return null;
  }
}

async function testTokenValidation(token) {
  log('\n🎫 3. 测试令牌验证...', 'cyan');
  
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.backend.host,
      port: TEST_CONFIG.backend.port,
      path: '/auth/validate-token',
      method: 'POST',
      protocol: TEST_CONFIG.backend.protocol,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200 && response.data.success) {
      log('✅ 令牌验证成功', 'green');
      return true;
    } else {
      log(`❌ 令牌验证失败: ${response.data?.message || '未知错误'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 令牌验证请求失败: ${error.message}`, 'red');
    return false;
  }
}

async function testDashboardAPI(token) {
  log('\n📊 4. 测试仪表盘 API...', 'cyan');
  
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.backend.host,
      port: TEST_CONFIG.backend.port,
      path: '/api/dashboard/stats',
      method: 'GET',
      protocol: TEST_CONFIG.backend.protocol,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      log('✅ 仪表盘 API 正常', 'green');
      log(`   总用户数: ${response.data.data.totalUsers}`, 'blue');
      log(`   总图片数: ${response.data.data.totalImages}`, 'blue');
      return true;
    } else {
      log(`❌ 仪表盘 API 失败: ${response.data?.message || '未知错误'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 仪表盘 API 请求失败: ${error.message}`, 'red');
    return false;
  }
}

// 主测试函数
async function runTests() {
  log('🚀 开始 API 连接测试...', 'magenta');
  log(`📍 测试目标: ${TEST_CONFIG.backend.protocol}://${TEST_CONFIG.backend.host}:${TEST_CONFIG.backend.port}`, 'blue');
  
  const results = {
    health: false,
    login: false,
    token: false,
    dashboard: false
  };
  
  // 1. 健康检查
  results.health = await testHealthCheck();
  
  if (!results.health) {
    log('\n❌ 后端服务不可用，停止测试', 'red');
    return results;
  }
  
  // 2. 管理员登录
  const token = await testAdminLogin();
  results.login = !!token;
  
  if (!token) {
    log('\n❌ 登录失败，停止后续测试', 'red');
    return results;
  }
  
  // 3. 令牌验证
  results.token = await testTokenValidation(token);
  
  // 4. 仪表盘 API
  if (results.token) {
    results.dashboard = await testDashboardAPI(token);
  }
  
  // 输出测试结果
  log('\n📋 测试结果汇总:', 'magenta');
  log(`   后端健康检查: ${results.health ? '✅' : '❌'}`, results.health ? 'green' : 'red');
  log(`   管理员登录: ${results.login ? '✅' : '❌'}`, results.login ? 'green' : 'red');
  log(`   令牌验证: ${results.token ? '✅' : '❌'}`, results.token ? 'green' : 'red');
  log(`   仪表盘 API: ${results.dashboard ? '✅' : '❌'}`, results.dashboard ? 'green' : 'red');
  
  const allPassed = Object.values(results).every(r => r);
  log(`\n🎯 总体结果: ${allPassed ? '全部通过' : '存在问题'}`, allPassed ? 'green' : 'red');
  
  if (allPassed) {
    log('\n🎉 恭喜！admin-dashboard 与 backend API 连接正常！', 'green');
  } else {
    log('\n⚠️  请检查失败的测试项目并修复相关问题', 'yellow');
  }
  
  return results;
}

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    log(`\n💥 测试过程中发生错误: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, TEST_CONFIG };
