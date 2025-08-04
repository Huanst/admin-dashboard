# 跨域问题解决指南

## 🔍 问题分析

您的项目存在跨域问题，原因如下：

- **前端地址**: `https://admin-dashboard.huanst.cn` <mcreference link="https://admin-dashboard.huanst.cn" index="1">1</mcreference>
- **API 地址**: `https://huanst.cn/api` <mcreference link="https://huanst.cn/api" index="0">0</mcreference>
- **问题**: 前端配置指向本地开发环境，而不是生产环境 API

## ✅ 已修复的问题

### 1. 前端环境配置
已更新 `.env` 文件：
```bash
# 生产环境配置
NODE_ENV=production

# API 配置 - 指向您的后端服务
VITE_API_BASE_URL=https://huanst.cn/api
VITE_API_SERVER_URL=https://huanst.cn
```

### 2. GitHub Actions 构建配置
已在构建步骤中添加生产环境变量：
```yaml
env:
  NODE_ENV: production
  VITE_API_BASE_URL: https://huanst.cn/api
  VITE_API_SERVER_URL: https://huanst.cn
  VITE_APP_TITLE: 管理员仪表盘
```

### 3. 后端 CORS 配置验证
后端 `.env.production` 已正确配置：
```bash
CORS_ORIGIN=https://huanst.cn,https://www.huanst.cn,https://admin-dashboard.huanst.cn
```

## 🚀 部署步骤

### 1. 提交并推送更改
```bash
git add .
git commit -m "修复跨域问题：更新前端 API 配置为生产环境"
git push origin main
```

### 2. 等待自动部署完成
GitHub Actions 将自动：
- 使用生产环境变量构建项目
- 部署到服务器
- 确保 API 调用指向正确的后端地址

### 3. 验证修复结果
部署完成后，访问 `https://admin-dashboard.huanst.cn` 应该能够：
- ✅ 正常加载页面
- ✅ 成功调用 API
- ✅ 无跨域错误

## 🔧 本地开发配置

如果需要本地开发，创建 `.env.local` 文件：
```bash
# 本地开发环境配置
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5004/api
VITE_API_SERVER_URL=http://localhost:5004
VITE_APP_TITLE=管理员仪表盘（开发）
```

## 📋 CORS 配置说明

### 后端 CORS 配置
位置：`backend/server.js`
```javascript
app.use(cors({
  origin: function (origin, callback) {
    const corsOrigin = process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS;
    let allowedOrigins = [];
    
    if (corsOrigin) {
      allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
    }
    
    // 默认允许的域名
    if (allowedOrigins.length === 0) {
      allowedOrigins = ['https://huanst.cn', 'https://www.huanst.cn', 'https://admin-dashboard.huanst.cn'];
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 环境变量配置
- **开发环境** (`backend/.env.development`):
  ```bash
  CORS_ORIGIN=http://localhost:5174,http://localhost:5175,http://localhost:5178,http://localhost:3000,https://huanst.cn
  ```

- **生产环境** (`backend/.env.production`):
  ```bash
  CORS_ORIGIN=https://huanst.cn,https://www.huanst.cn,https://admin-dashboard.huanst.cn
  ```

## 🐛 故障排除

### 1. 如果仍有跨域错误
检查浏览器控制台是否显示：
```
Access to fetch at 'https://huanst.cn/api/...' from origin 'https://admin-dashboard.huanst.cn' has been blocked by CORS policy
```

**解决方案**：
1. 确认后端服务正在运行
2. 检查后端 CORS 配置是否包含前端域名
3. 重启后端服务

### 2. API 请求失败
**检查项**：
- [ ] 前端 `.env` 文件配置正确
- [ ] GitHub Actions 构建使用了正确的环境变量
- [ ] 后端服务正常运行
- [ ] 网络连接正常

### 3. 开发环境问题
如果本地开发时遇到跨域问题：
1. 确保后端运行在 `http://localhost:5004`
2. 使用 `.env.local` 文件配置本地环境变量
3. 重启前端开发服务器

## 📞 技术支持

如果问题仍然存在，请检查：
1. 浏览器开发者工具的 Network 标签
2. 后端服务器日志
3. GitHub Actions 构建日志

## 🎉 预期结果

修复完成后，您应该看到：
- ✅ 前端页面正常加载
- ✅ API 请求成功响应
- ✅ 无 CORS 相关错误
- ✅ 用户可以正常登录和使用系统功能