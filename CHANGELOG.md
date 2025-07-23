# API更新日志

## 📅 2025-07-18 - API 连接修复
### 🔧 修复内容
- **端口配置**: 统一端口从 5004 修正为 5002，与后端服务保持一致
- **管理员登录**: 修正登录 API 路径从 `/api/auth/login` 改为 `/auth/login`
- **请求实例**: 新增 `adminRequest` 实例处理管理员专用 API
- **API 路径**: 修正所有管理员 API 路径映射
- **诊断工具**: 更新所有测试和诊断工具的配置

### 🆕 新增功能
- 创建 `adminRequest` 专用请求实例
- 新增 `api-connection-test.js` 连接测试脚本
- 新增 `API_FIX_SUMMARY.md` 修复摘要文档

## 📅 2024年1月 - 基于新的API文档进行全面重构

## 🔄 主要变更

### 1. 基础配置更新
- **API基础地址**: 从 `/api` 更新为 `http://localhost:5002/api`
- **响应格式**: 统一为 `{ success: boolean, data: any, message: string }` 格式
- **错误处理**: 增加了更多错误码的处理（400, 409, 413, 415等）

### 2. 新增API模块

#### 📁 `/src/api/` 目录结构
```
src/api/
├── index.js           # 统一导出文件 ✨ 新增
├── auth.js            # 认证API ✨ 新增
├── user.js            # 用户管理API 🔄 重构
├── image.js           # 图片管理API ✨ 新增
├── generate.js        # 图片生成API ✨ 新增
├── upload.js          # 文件上传API ✨ 新增
├── dashboard.js       # 仪表盘API 🔄 重构
└── system.js          # 系统设置API ✨ 新增
```

### 3. API接口变更

#### 认证模块 (auth.js)
- ✨ 新增 `register()` - 用户注册
- 🔄 更新 `login()` - 适配新的响应格式
- 🔄 更新 `getUserInfo()` - 使用 `/user/profile` 接口
- ❌ 移除 `validateToken()` - 通过getUserInfo验证

#### 用户管理模块 (user.js)
- 🔄 更新接口路径：`/api/users` → `/admin/users`
- ✨ 新增 `createUser()` - 创建用户
- ✨ 新增 `updateUser()` - 更新用户
- ✨ 新增 `batchDeleteUsers()` - 批量删除用户
- 🔄 更新参数格式：`ids` → `userIds`

#### 图片管理模块 (image.js) ✨ 全新模块
- ✨ 新增 `getImages()` - 获取图片列表
- ✨ 新增 `getImageDetail()` - 获取图片详情
- ✨ 新增 `deleteImage()` - 删除图片
- ✨ 新增 `batchDeleteImages()` - 批量删除图片

#### 图片生成模块 (generate.js) ✨ 全新模块
- ✨ 新增 `generateImage()` - 生成图片
- ✨ 新增 `getGenerationHistory()` - 获取生成历史

#### 文件上传模块 (upload.js) ✨ 全新模块
- ✨ 新增 `uploadAvatar()` - 上传头像
- ✨ 新增 `uploadFile()` - 通用文件上传

#### 仪表盘模块 (dashboard.js)
- 🔄 更新 `getStats()` - 使用 `/admin/system/info` 接口
- 🔄 保持其他接口不变

#### 系统设置模块 (system.js) ✨ 全新模块
- ✨ 新增 `getSystemInfo()` - 获取系统信息
- ✨ 新增 `getSystemConfig()` - 获取系统配置
- ✨ 新增 `updateSystemConfig()` - 更新系统配置
- ✨ 新增 `clearCache()` - 清理系统缓存

### 4. 状态管理更新

#### 认证Store (auth.js)
- 🔄 更新导入路径：`@/utils/api` → `@/api/auth`
- 🔄 更新登录响应处理：适配新的数据结构
- 🔄 更新错误处理：支持更多错误码
- ❌ 移除 `validateToken()` 方法
- 🔄 更新 `restoreFromStorage()` - 通过getUserInfo验证token

### 5. 工具文件更新

#### 请求工具 (request.js)
- 🔄 更新baseURL：`/api` → `http://localhost:5004/api`
- 🔄 简化响应拦截器：直接返回响应数据
- 🔄 增强错误处理：支持更多HTTP状态码

#### API工具 (api.js)
- 🔄 保留原有接口，确保向后兼容
- ✨ 新增图片生成和文件上传API
- 🔄 更新所有接口的注释和参数说明

### 6. 新增文档和工具

#### 📚 文档
- ✨ `API_USAGE_GUIDE.md` - 详细的API使用指南
- ✨ `CHANGELOG.md` - 本更新日志

#### 🔧 工具
- ✨ `api-test.js` - API测试工具
- ✨ `api/index.js` - 统一导出文件

## 🚀 使用方式

### 新的导入方式（推荐）
```javascript
// 按需导入
import { userAPI, authAPI } from '@/api'

// 导入所有API
import api from '@/api'
```

### 兼容性导入方式
```javascript
// 保持向后兼容
import { userAPI } from '@/utils/api'
```

## 🔧 迁移指南

### 1. 更新导入语句
```javascript
// 旧方式
import { authAPI } from '@/utils/api'

// 新方式
import { authAPI } from '@/api'
```

### 2. 更新API调用
```javascript
// 批量删除用户 - 参数名变更
// 旧方式
userAPI.batchDeleteUsers([1, 2, 3])

// 新方式
userAPI.batchDeleteUsers([1, 2, 3]) // 内部已更新为userIds
```

### 3. 更新错误处理
```javascript
// 新增的错误码处理
try {
  await api.upload.uploadAvatar(file)
} catch (error) {
  if (error.response?.status === 413) {
    // 文件过大
  } else if (error.response?.status === 415) {
    // 不支持的文件类型
  }
}
```

## ⚠️ 注意事项

1. **向后兼容**: 保留了 `/src/utils/api.js` 文件，确保现有代码不会中断
2. **新功能**: 图片生成、文件上传等新功能需要使用新的API模块
3. **认证**: 所有管理员接口（/admin/*）需要admin角色权限
4. **测试**: 使用 `api-test.js` 工具验证API配置

## 🎯 下一步计划

1. 添加TypeScript类型定义
2. 实现API缓存机制
3. 添加请求重试机制
4. 优化错误处理和用户提示