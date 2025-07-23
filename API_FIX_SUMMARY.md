# 🔧 Admin Dashboard API 修复摘要

## 📋 修复概述

本次修复解决了 admin-dashboard 项目与 backend/server.js API 之间的连接问题，主要包括端口不匹配和 API 路径错误两个核心问题。

## 🐛 发现的问题

### 1. 端口配置不匹配
- **Backend 服务器端口**: `5002` (server.js 第25行)
- **Admin-dashboard 配置端口**: `5004` (request.js 和 vite.config.js)
- **影响**: 前端无法连接到后端服务

### 2. 登录 API 路径错误
- **Admin-dashboard 调用**: `/api/auth/login` (普通用户登录接口)
- **应该调用**: `/auth/login` (管理员专用登录接口)
- **影响**: 管理员无法正常登录

### 3. API 请求实例配置问题
- 所有 API 都使用同一个 request 实例
- 缺少针对管理员 API 的专用请求实例
- **影响**: 管理员功能无法正常使用

## ✅ 修复内容

### 1. 端口配置统一 (5004 → 5002)

#### 修改的文件:
- `src/utils/request.js` - 第11行
- `vite.config.js` - 第44行
- `src/utils/login-diagnosis.js` - 第12行
- `src/utils/api-validation.js` - 第27行
- `quick-login-test.js` - 第14行
- `login-diagnosis.html` - 多处

#### 修改内容:
```javascript
// 修改前
baseURL: 'http://localhost:5004/api'
target: 'http://localhost:5004'

// 修改后
baseURL: 'http://localhost:5002/api'
target: 'http://localhost:5002'
```

### 2. 创建管理员专用请求实例

#### 新增内容 (src/utils/request.js):
```javascript
// 管理员专用axios实例
const adminRequest = axios.create({
  baseURL: 'http://localhost:5002',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 3. 修复管理员登录 API 路径

#### 修改的文件:
- `src/api/auth.js` - 第26行
- `src/utils/api.js` - 第26行

#### 修改内容:
```javascript
// 修改前
login(credentials) {
  return request.post('/api/auth/login', credentials)
}

// 修改后
login(credentials) {
  return adminRequest.post('/auth/login', credentials)
}
```

### 4. 更新所有管理员 API 调用

#### 受影响的模块:
- **用户管理** (`/admin/users/*`) - 使用 `adminRequest`
- **图片管理** (`/admin/images/*`) - 使用 `adminRequest`
- **系统设置** (`/admin/system/*`) - 使用 `adminRequest`
- **认证模块** (`/auth/*`) - 使用 `adminRequest`

#### 仪表盘 API 路径修正:
```javascript
// 修改前
getStats() {
  return request.get('/admin/system/info')
}

// 修改后
getStats() {
  return request.get('/api/dashboard/stats')
}
```

## 🔗 API 路径映射

### 前端请求实例 → 后端路径
```
request (http://localhost:5002/api)
├── /api/dashboard/stats
├── /api/dashboard/user-growth-trend
├── /api/dashboard/image-generation-trend
├── /api/dashboard/popular-prompts
├── /api/generate-image
└── /api/user/profile

adminRequest (http://localhost:5002)
├── /auth/login
├── /auth/validate-token
├── /admin/users/*
├── /admin/images/*
└── /admin/system/*
```

### 后端中间件对应
```
/api/* → authenticateToken (普通用户权限)
/admin/* → authenticateAdmin (管理员权限)
/auth/* → authenticateAdmin (管理员权限)
```

## 🧪 测试验证

### 创建的测试工具:
1. **config-verification.js** - 配置验证脚本
2. **api-connection-test.js** - API 连接测试脚本

### 更新的诊断工具:
1. **login-diagnosis.js** - 登录问题诊断
2. **login-diagnosis.html** - 可视化诊断页面
3. **quick-login-test.js** - 快速登录测试

## 🚀 启动指南

### 1. 启动后端服务
```bash
cd backend
npm start
# 确保服务运行在端口 5002
```

### 2. 启动前端服务
```bash
cd admin-dashboard
npm run dev
# 前端将运行在端口 5177，代理到 5002
```

### 3. 验证连接
```bash
# 运行 API 连接测试
node admin-dashboard/api-connection-test.js

# 或访问诊断页面
open admin-dashboard/login-diagnosis.html
```

## 📝 管理员凭据

```
用户名: Huan
密码: Huanst518
```

## ⚠️ 注意事项

1. **端口冲突**: 确保端口 5002 没有被其他服务占用
2. **CORS 配置**: 后端已配置允许 localhost:5177 的跨域请求
3. **令牌存储**: 管理员令牌存储在 localStorage 中，键名为 `admin_token`
4. **权限验证**: 所有管理员 API 都需要有效的 JWT 令牌

## 🎯 修复验证清单

- [x] 端口配置统一为 5002
- [x] 管理员登录使用 `/auth/login`
- [x] 创建 adminRequest 实例
- [x] 更新所有管理员 API 调用
- [x] 修正仪表盘 API 路径
- [x] 更新诊断和测试工具
- [x] 创建测试脚本
- [x] 更新相关文档

## 🔄 后续建议

1. **环境变量**: 考虑将 API 地址配置为环境变量
2. **错误处理**: 增强 API 错误处理和用户提示
3. **自动化测试**: 集成 API 连接测试到 CI/CD 流程
4. **监控**: 添加 API 健康检查和监控

---

**修复完成时间**: 2025-07-18  
**修复状态**: ✅ 完成  
**测试状态**: ⏳ 待后端服务启动后验证
