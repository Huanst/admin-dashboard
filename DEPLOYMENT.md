# 部署指南

## 环境配置

本项目使用环境变量来管理不同环境下的配置。

### 环境变量文件

- `.env` - 默认环境配置（开发环境）
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env.example` - 环境变量模板

### 主要环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_BASE_URL` | API基础URL（带/api前缀） | `https://api.example.com/api` |
| `VITE_API_SERVER_URL` | 服务器URL（不带前缀） | `https://api.example.com` |
| `VITE_APP_TITLE` | 应用标题 | `管理员仪表盘` |
| `VITE_APP_PORT` | 开发服务器端口 | `5178` |

## 构建命令

### 开发环境
```bash
# 启动开发服务器
npm run dev

# 构建开发版本
npm run build:dev
```

### 生产环境
```bash
# 构建生产版本
npm run build
```

## 部署步骤

### 1. 配置生产环境变量

编辑 `.env.production` 文件，设置您的生产环境API地址：

```env
NODE_ENV=production
VITE_API_BASE_URL=https://your-production-domain.com/api
VITE_API_SERVER_URL=https://your-production-domain.com
VITE_APP_TITLE=管理员仪表盘
```

### 2. 构建生产版本

```bash
npm run build
```

### 3. 部署构建文件

将 `dist` 目录中的文件部署到您的Web服务器。

## 注意事项

1. **环境变量必须以 `VITE_` 开头**才能在前端代码中使用
2. **生产环境请使用HTTPS**确保安全性
3. **确保后端API支持CORS**，允许前端域名访问
4. **检查防火墙设置**，确保API端口可访问

## 故障排除

### API连接失败
1. 检查 `.env.production` 中的URL是否正确
2. 确认后端服务是否正常运行
3. 检查网络连接和防火墙设置

### 构建失败
1. 确保Node.js版本 >= 18.0.0
2. 删除 `node_modules` 和 `package-lock.json`，重新安装依赖
3. 检查环境变量格式是否正确
