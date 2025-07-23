# 🚀 Admin Dashboard 快速启动指南

## 📋 修复完成确认

✅ **所有 API 连接问题已修复完成！**

### 修复的问题:
1. ✅ 端口配置不匹配 (5004 → 5002)
2. ✅ 管理员登录 API 路径错误 (/api/auth/login → /auth/login)
3. ✅ 缺少管理员专用请求实例
4. ✅ API 路径映射错误
5. ✅ 诊断工具配置过时

## 🔧 启动步骤

### 1. 启动后端服务
```bash
cd backend
npm install  # 如果还没安装依赖
npm start    # 或 node server.js
```

**确认后端启动成功:**
- 控制台显示: `服务器运行在端口 5002`
- 访问: http://localhost:5002/api/health 返回 "OK"

### 2. 启动前端服务
```bash
cd admin-dashboard
npm install  # 如果还没安装依赖
npm run dev
```

**确认前端启动成功:**
- 控制台显示: `Local: http://localhost:5177/`
- 浏览器自动打开管理后台

### 3. 登录测试
**管理员凭据:**
```
用户名: Huan
密码: Huanst518
```

## 🧪 验证工具

### 1. API 连接测试 (推荐)
```bash
node admin-dashboard/api-connection-test.js
```

### 2. 可视化诊断页面
```bash
open admin-dashboard/login-diagnosis.html
```

### 3. 快速登录测试
```bash
node admin-dashboard/quick-login-test.js
```

## 📊 API 架构说明

### 请求实例分工
```
request (http://localhost:5002/api)
├── 仪表盘数据 (/api/dashboard/*)
├── 图片生成 (/api/generate-image)
└── 用户资料 (/api/user/profile)

adminRequest (http://localhost:5002)
├── 管理员认证 (/auth/*)
├── 用户管理 (/admin/users/*)
├── 图片管理 (/admin/images/*)
└── 系统设置 (/admin/system/*)
```

### 权限验证
```
/api/* → authenticateToken (普通用户权限)
/admin/* → authenticateAdmin (管理员权限)
/auth/* → authenticateAdmin (管理员权限)
```

## 🔍 故障排除

### 问题 1: 后端连接失败
**症状:** 前端显示网络错误
**解决:**
1. 确认后端服务在端口 5002 运行
2. 检查防火墙设置
3. 运行: `curl http://localhost:5002/api/health`

### 问题 2: 登录失败
**症状:** 用户名密码正确但登录失败
**解决:**
1. 确认使用管理员凭据 (Huan/Huanst518)
2. 检查后端数据库连接
3. 查看后端控制台错误日志

### 问题 3: 权限不足
**症状:** 登录成功但无法访问管理功能
**解决:**
1. 确认用户在 `admins` 表中而非 `users` 表
2. 检查用户状态为 'active'
3. 验证 JWT 令牌有效性

## 📁 重要文件说明

### 配置文件
- `src/utils/request.js` - API 请求配置
- `vite.config.js` - 开发服务器代理配置

### API 模块
- `src/api/auth.js` - 认证相关 API
- `src/api/user.js` - 用户管理 API
- `src/api/dashboard.js` - 仪表盘 API
- `src/api/system.js` - 系统设置 API

### 测试工具
- `api-connection-test.js` - 自动化连接测试
- `login-diagnosis.html` - 可视化诊断工具
- `quick-login-test.js` - 快速登录测试

## 🎯 下一步建议

### 开发环境优化
1. 配置环境变量管理 API 地址
2. 添加 API 响应缓存机制
3. 集成自动化测试到开发流程

### 生产环境准备
1. 配置 HTTPS 和域名
2. 设置 API 限流和安全策略
3. 配置日志监控和告警

### 功能扩展
1. 添加更多管理功能模块
2. 优化用户体验和界面设计
3. 增加数据可视化图表

## 📞 技术支持

如果遇到问题，请检查:
1. 📄 `API_FIX_SUMMARY.md` - 详细修复说明
2. 📄 `CHANGELOG.md` - 更新历史记录
3. 🧪 运行测试工具进行诊断

---

**状态**: ✅ 修复完成，可以正常使用  
**最后更新**: 2025-07-18  
**版本**: v1.1.0 (API 连接修复版)
