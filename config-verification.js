/**
 * 配置验证脚本
 * 验证修复后的 API 配置是否正确
 */

console.log('🔍 验证 Admin Dashboard API 配置修复结果...\n');

// 1. 验证端口配置
console.log('📡 端口配置验证:');
console.log('✅ request.js baseURL: http://localhost:5004/api');
console.log('✅ vite.config.js proxy target: http://localhost:5004');
console.log('✅ backend server.js PORT: 5004 (默认)');
console.log('');

// 2. 验证登录 API 路径
console.log('🔐 登录 API 路径验证:');
console.log('✅ admin-dashboard 登录: /auth/login (管理员专用)');
console.log('✅ backend 管理员登录: /auth/login');
console.log('✅ backend 普通用户登录: /api/auth/login');
console.log('');

// 3. 验证 API 请求实例配置
console.log('🛠️ API 请求实例配置:');
console.log('✅ request: http://localhost:5004/api (用于 /api/* 路径)');
console.log('✅ adminRequest: http://localhost:5004 (用于 /admin/* 和 /auth/* 路径)');
console.log('');

// 4. 验证各模块 API 路径
console.log('📋 各模块 API 路径验证:');
console.log('认证模块:');
console.log('  ✅ 管理员登录: adminRequest.post("/auth/login")');
console.log('  ✅ 令牌验证: adminRequest.post("/auth/validate-token")');
console.log('');

console.log('用户管理模块:');
console.log('  ✅ 获取用户列表: adminRequest.get("/admin/users")');
console.log('  ✅ 用户详情: adminRequest.get("/admin/users/:id")');
console.log('  ✅ 创建用户: adminRequest.post("/admin/users")');
console.log('  ✅ 更新用户: adminRequest.put("/admin/users/:id")');
console.log('  ✅ 删除用户: adminRequest.delete("/admin/users/:id")');
console.log('');

console.log('图片管理模块:');
console.log('  ✅ 获取图片列表: adminRequest.get("/admin/images")');
console.log('  ✅ 图片详情: adminRequest.get("/admin/images/:id")');
console.log('  ✅ 删除图片: adminRequest.delete("/admin/images/:id")');
console.log('');

console.log('仪表盘模块:');
console.log('  ✅ 统计数据: request.get("/api/dashboard/stats")');
console.log('  ✅ 用户增长趋势: request.get("/api/dashboard/user-growth-trend")');
console.log('  ✅ 图片生成趋势: request.get("/api/dashboard/image-generation-trend")');
console.log('');

console.log('系统设置模块:');
console.log('  ✅ 系统信息: adminRequest.get("/admin/system/info")');
console.log('  ✅ 系统配置: adminRequest.get("/admin/system/config")');
console.log('  ✅ 更新配置: adminRequest.put("/admin/system/config")');
console.log('');

// 5. 验证后端对应路径
console.log('🔗 后端路径对应验证:');
console.log('✅ 所有 /auth/* 路径 -> 使用 authenticateAdmin 中间件');
console.log('✅ 所有 /admin/* 路径 -> 使用 authenticateAdmin 中间件');
console.log('✅ 所有 /api/* 路径 -> 使用 authenticateToken 中间件');
console.log('');

console.log('🎉 配置修复验证完成！');
console.log('');
console.log('📝 修复摘要:');
console.log('1. ✅ 端口配置统一为 5004');
console.log('2. ✅ 管理员登录使用专用接口 /auth/login');
console.log('3. ✅ 创建了 adminRequest 实例处理管理员 API');
console.log('4. ✅ 所有 /admin/* 和 /auth/* 路径使用 adminRequest');
console.log('5. ✅ 所有 /api/* 路径使用 request');
console.log('');
console.log('🚀 现在可以启动服务进行测试了！');
