# 后台管理系统 API 需求文档

## 项目概述

本文档描述了后台管理系统前端所需的所有 API 接口，包括认证、用户管理、图片管理、仪表盘统计和系统设置等模块。

## 通用规范

### 基础信息
- **基础URL**: `/api` 或 `/admin`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: Bearer Token

### 统一响应格式
```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "code": 200,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 错误响应格式
```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息",
  "code": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### HTTP 状态码规范
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权/认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 1. 认证模块 (Authentication)

### 1.1 用户登录
- **接口**: `POST /auth/login`
- **描述**: 管理员登录接口
- **请求参数示例:**
```json
{
  "username": "Huan",
  "password": "Huanst518"
}
```
- **响应数据**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "avatar": "https://example.com/avatar.jpg",
      "created_at": "2024-01-01T00:00:00Z",
      "last_login": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 1.2 Token 验证
- **接口**: `POST /auth/validate-token`
- **描述**: 验证当前 token 是否有效
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### 1.3 获取用户信息
- **接口**: `GET /user/profile`
- **描述**: 获取当前登录用户的详细信息
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "avatar": "https://example.com/avatar.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T00:00:00Z",
    "permissions": ["user:read", "user:write", "image:read", "image:write"]
  }
}
```

---

## 2. 用户管理模块 (User Management)

### 2.1 获取用户列表
- **接口**: `GET /admin/users` 或 `GET /api/users`
- **描述**: 分页获取用户列表
- **请求参数**:
```
page: 1 (页码，默认1)
pageSize: 10 (每页数量，默认10)
keyword: "" (搜索关键词，可选)
status: "" (用户状态筛选，可选)
role: "" (角色筛选，可选)
```
- **响应数据**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "username": "user1",
        "email": "user1@example.com",
        "role": "user",
        "status": "active",
        "avatar": "https://example.com/avatar1.jpg",
        "created_at": "2024-01-01T00:00:00Z",
        "last_login": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 2.2 获取用户详情
- **接口**: `GET /admin/users/{id}` 或 `GET /api/users/{id}`
- **描述**: 根据用户ID获取详细信息
- **路径参数**: `id` (用户ID)
- **响应数据**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user1",
    "email": "user1@example.com",
    "role": "user",
    "status": "active",
    "avatar": "https://example.com/avatar1.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T00:00:00Z",
    "profile": {
      "nickname": "用户昵称",
      "phone": "13800138000",
      "gender": "male",
      "birthday": "1990-01-01"
    }
  }
}
```

### 2.3 创建用户
- **接口**: `POST /api/users`
- **描述**: 创建新用户
- **请求参数**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "123456",
  "role": "user",
  "status": "active"
}
```
- **响应数据**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2.4 更新用户
- **接口**: `PUT /api/users/{id}`
- **描述**: 更新用户信息
- **路径参数**: `id` (用户ID)
- **请求参数**:
```json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "role": "admin",
  "status": "inactive"
}
```

### 2.5 删除用户
- **接口**: `DELETE /api/users/{id}` 或 `DELETE /admin/users/{id}`
- **描述**: 删除指定用户
- **路径参数**: `id` (用户ID)

### 2.6 批量删除用户
- **接口**: `POST /admin/users/batch-delete`
- **描述**: 批量删除用户
- **请求参数**:
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

---

## 3. 图片管理模块 (Image Management)

### 3.1 获取图片列表
- **接口**: `GET /admin/images`
- **描述**: 分页获取图片列表
- **请求参数**:
```
page: 1 (页码，默认1)
pageSize: 10 (每页数量，默认10)
keyword: "" (搜索关键词，可选)
category: "" (分类筛选，可选)
status: "" (状态筛选，可选)
```
- **响应数据**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "图片标题",
        "url": "https://example.com/image1.jpg",
        "thumbnail": "https://example.com/thumb1.jpg",
        "category": "风景",
        "tags": ["自然", "山水"],
        "size": 1024000,
        "width": 1920,
        "height": 1080,
        "format": "jpg",
        "prompt": "生成提示词",
        "user_id": 1,
        "username": "user1",
        "status": "published",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 500,
    "page": 1,
    "pageSize": 10,
    "totalPages": 50
  }
}
```

### 3.2 获取图片详情
- **接口**: `GET /admin/images/{id}`
- **描述**: 根据图片ID获取详细信息
- **路径参数**: `id` (图片ID)

### 3.3 删除图片
- **接口**: `DELETE /admin/images/{id}`
- **描述**: 删除指定图片
- **路径参数**: `id` (图片ID)

### 3.4 批量删除图片
- **接口**: `POST /admin/images/batch-delete`
- **描述**: 批量删除图片
- **请求参数**:
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

---

## 4. 仪表盘统计模块 (Dashboard)

### 4.1 获取统计数据
- **接口**: `GET /admin/dashboard/stats` 或 `GET /api/dashboard/stats`
- **描述**: 获取系统总体统计数据
- **响应数据**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalImages": 5680,
    "todayUsers": 45,
    "todayImages": 128,
    "activeUsers": 892,
    "storageUsed": "2.5GB",
    "storageTotal": "10GB"
  }
}
```

### 4.2 获取用户增长趋势
- **接口**: `GET /admin/dashboard/user-growth` 或 `GET /api/dashboard/user-growth-trend`
- **描述**: 获取用户增长趋势数据
- **请求参数**:
```
days: 7 (天数，默认7天)
```
- **响应数据**:
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "count": 25,
      "total": 1200
    },
    {
      "date": "2024-01-02",
      "count": 30,
      "total": 1230
    }
  ]
}
```

### 4.3 获取图片生成趋势
- **接口**: `GET /admin/dashboard/image-trend` 或 `GET /api/dashboard/image-generation-trend`
- **描述**: 获取图片生成趋势数据
- **请求参数**:
```
days: 7 (天数，默认7天)
```
- **响应数据**:
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "count": 120,
      "total": 5500
    },
    {
      "date": "2024-01-02",
      "count": 135,
      "total": 5635
    }
  ]
}
```

### 4.4 获取热门提示词
- **接口**: `GET /admin/dashboard/popular-prompts` 或 `GET /api/dashboard/popular-prompts`
- **描述**: 获取热门提示词列表
- **请求参数**:
```
limit: 5 (返回数量，默认5条)
```
- **响应数据**:
```json
{
  "success": true,
  "data": [
    {
      "prompt": "美丽的风景画",
      "count": 156,
      "category": "风景"
    },
    {
      "prompt": "可爱的小猫",
      "count": 142,
      "category": "动物"
    }
  ]
}
```

---

## 5. 系统设置模块 (System Settings)

### 5.1 获取系统信息
- **接口**: `GET /admin/system/info`
- **描述**: 获取系统基本信息
- **响应数据**:
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "environment": "production",
    "uptime": "15天 3小时 25分钟",
    "serverTime": "2024-01-01T00:00:00Z",
    "database": {
      "type": "MySQL",
      "version": "8.0.25",
      "status": "connected"
    },
    "redis": {
      "version": "6.2.6",
      "status": "connected"
    }
  }
}
```

### 5.2 获取系统配置
- **接口**: `GET /admin/system/config`
- **描述**: 获取系统配置信息
- **响应数据**:
```json
{
  "success": true,
  "data": {
    "siteName": "AI图片生成平台",
    "siteDescription": "专业的AI图片生成服务",
    "maxFileSize": 10485760,
    "allowedFormats": ["jpg", "png", "gif"],
    "enableRegistration": true,
    "enableEmailVerification": false,
    "defaultUserRole": "user"
  }
}
```

### 5.3 更新系统配置
- **接口**: `PUT /admin/system/config`
- **描述**: 更新系统配置
- **请求参数**:
```json
{
  "siteName": "新的网站名称",
  "siteDescription": "新的网站描述",
  "maxFileSize": 20971520,
  "enableRegistration": false
}
```

### 5.4 清理系统缓存
- **接口**: `POST /admin/system/clear-cache`
- **描述**: 清理系统缓存
- **响应数据**:
```json
{
  "success": true,
  "message": "缓存清理成功"
}
```

---

## 6. 权限和安全

### 6.1 权限控制
- 所有 `/admin/*` 接口需要管理员权限
- 所有接口都需要有效的 Bearer Token
- Token 应在请求头中携带：`Authorization: Bearer {token}`

### 6.2 请求频率限制
- 登录接口：每分钟最多 5 次尝试
- 其他接口：每分钟最多 100 次请求

### 6.3 数据验证
- 所有输入数据需要进行格式验证
- 敏感操作需要二次确认
- 文件上传需要类型和大小验证

---

## 7. 开发建议

### 7.1 数据库设计建议
- 用户表：users (id, username, email, password_hash, role, status, created_at, updated_at)
- 图片表：images (id, title, url, thumbnail, user_id, prompt, category, tags, size, width, height, format, status, created_at)
- 系统配置表：system_configs (key, value, description, type)

### 7.2 技术栈建议
- 后端框架：Node.js (Express/Koa) 或 Python (Django/FastAPI) 或 Java (Spring Boot)
- 数据库：MySQL 或 PostgreSQL
- 缓存：Redis
- 文件存储：本地存储 或 云存储 (OSS/S3)

### 7.3 部署建议
- 使用 Docker 容器化部署
- 配置 Nginx 反向代理
- 启用 HTTPS
- 配置日志收集和监控

---

## 8. 测试用例

### 8.1 认证测试
- 正确用户名密码登录
- 错误用户名密码登录
- Token 过期处理
- 无权限访问处理

### 8.2 用户管理测试
- 用户列表分页查询
- 用户搜索功能
- 用户创建、更新、删除
- 批量操作

### 8.3 图片管理测试
- 图片列表查询和筛选
- 图片详情查看
- 图片删除和批量删除

### 8.4 统计数据测试
- 各种统计数据的准确性
- 趋势数据的时间范围
- 热门数据的排序

---

## 联系信息

如有任何问题或需要进一步澄清，请联系前端开发团队。

**文档版本**: v1.0  
**最后更新**: 2024-01-01  
**维护人员**: 前端开发团队