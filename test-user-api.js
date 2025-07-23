const axios = require('axios');

async function testUserAPI() {
  try {
    console.log('🔍 测试用户管理 API...');
    
    // 1. 先登录获取令牌
    console.log('\n1. 管理员登录...');
    const loginResponse = await axios.post('http://localhost:5004/auth/login', {
      username: 'Huan',
      password: 'Huanst518'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ 登录成功');
      const token = loginResponse.data.data.token;
      console.log('Token:', token.substring(0, 20) + '...');
      
      // 2. 测试获取用户列表
      console.log('\n2. 获取用户列表...');
      const usersResponse = await axios.get('http://localhost:5004/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          page: 1,
          pageSize: 10
        }
      });
      
      if (usersResponse.data.success) {
        console.log('✅ 获取用户列表成功');
        console.log('用户数量:', usersResponse.data.data.total);
        console.log('用户列表:', usersResponse.data.data.list.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          status: u.status
        })));
      } else {
        console.log('❌ 获取用户列表失败:', usersResponse.data.message);
      }
      
    } else {
      console.log('❌ 登录失败:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testUserAPI();
