# 🚀 后端API实现需求清单

根据当前前端管理后台的功能，您需要在后端实现以下API接口：

## 📊 1. 仪表盘统计模块

### 1.1 获取统计数据
```
GET /admin/dashboard/stats
```
**功能**: 获取系统总体统计数据  
**返回数据格式**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,        // 总用户数
    "totalImages": 8960,       // 总图片数
    "todayImages": 156,        // 今日生成图片数
    "activeUsers": 89          // 活跃用户数
  }
}
```

### 1.2 获取用户增长趋势
```
GET /admin/dashboard/user-growth?days=7
```
**功能**: 获取指定天数内的用户增长趋势  
**参数**: 
- `days`: 天数 (默认7天)
- `period`: 时间周期 (可选: day, week, month)

**返回数据格式**:
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "count": 25
    },
    {
      "date": "2024-01-16", 
      "count": 32
    }
    // ... 更多数据
  ]
}
```

### 1.3 获取图片生成趋势
```
GET /admin/dashboard/image-trends?days=7
```
**功能**: 获取指定天数内的图片生成趋势  
**参数**: 
- `days`: 天数 (默认7天)
- `period`: 时间周期 (可选: day, week, month)

**返回数据格式**:
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "count": 156
    },
    {
      "date": "2024-01-16",
      "count": 189
    }
    // ... 更多数据
  ]
}
```

### 1.4 获取热门提示词
```
GET /admin/dashboard/popular-prompts?limit=5&days=7
```
**功能**: 获取热门提示词列表  
**参数**: 
- `limit`: 限制数量 (默认5)
- `days`: 统计天数 (默认7天)

**返回数据格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text": "美丽的风景画",
      "count": 156
    },
    {
      "id": 2,
      "text": "可爱的小猫",
      "count": 142
    }
    // ... 更多数据
  ]
}
```

## 👥 2. 用户管理模块

### 2.1 获取用户列表 (管理员)
```
GET /admin/users?page=1&pageSize=10&keyword=&status=&role=
```
**功能**: 获取用户列表 (管理员权限)  
**参数**: 
- `page`: 页码 (默认1)
- `pageSize`: 每页数量 (默认10)
- `keyword`: 搜索关键词 (可选)
- `status`: 用户状态筛选 (可选: active, inactive, banned)
- `role`: 角色筛选 (可选: user, admin)

**返回数据格式**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "username": "user001",
        "email": "user001@example.com",
        "avatar": "https://example.com/avatar1.jpg",
        "role": "user",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "lastLoginAt": "2024-01-16T09:15:00Z"
      }
      // ... 更多用户
    ],
    "total": 1250,
    "page": 1,
    "pageSize": 10,
    "totalPages": 125
  }
}
```

### 2.2 获取用户详情 (管理员)
```
GET /admin/users/{id}
```
**功能**: 获取指定用户的详细信息  

### 2.3 创建用户 (管理员)
```
POST /admin/users
```
**功能**: 创建新用户  
**请求体**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user",
  "status": "active"
}
```

### 2.4 更新用户 (管理员)
```
PUT /admin/users/{id}
```
**功能**: 更新用户信息  

### 2.5 删除用户 (管理员)
```
DELETE /admin/users/{id}
```
**功能**: 删除指定用户  

### 2.6 批量删除用户 (管理员)
```
POST /admin/users/batch-delete
```
**功能**: 批量删除用户  
**请求体**:
```json
{
  "userIds": [1, 2, 3, 4, 5]
}
```

## 🖼️ 3. 图片管理模块

### 3.1 获取图片列表 (管理员)
```
GET /admin/images?page=1&pageSize=10&keyword=&status=&userId=
```
**功能**: 获取图片列表 (管理员权限)  
**参数**: 
- `page`: 页码
- `pageSize`: 每页数量
- `keyword`: 搜索关键词
- `status`: 图片状态筛选
- `userId`: 用户ID筛选

**返回数据格式**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 123,
        "prompt": "美丽的风景画",
        "imageUrl": "https://example.com/image1.jpg",
        "model": "Kwai-Kolors/Kolors",
        "imageSize": "1280x1280",
        "status": "published",
        "createdAt": "2024-01-15T10:30:00Z",
        "user": {
          "id": 123,
          "username": "user001"
        }
      }
      // ... 更多图片
    ],
    "total": 8960,
    "page": 1,
    "pageSize": 10
  }
}
```

### 3.2 获取图片详情 (管理员)
```
GET /admin/images/{id}
```

### 3.3 删除图片 (管理员)
```
DELETE /admin/images/{id}
```

### 3.4 批量删除图片 (管理员)
```
POST /admin/images/batch-delete
```
**请求体**:
```json
{
  "imageIds": [1, 2, 3, 4, 5]
}
```

## 🎨 4. 图片生成模块

### 4.1 生成图片
```
POST /generate-image
```
**功能**: 生成图片  
**请求体**:
```json
{
  "prompt": "美丽的风景画",
  "model": "Kwai-Kolors/Kolors",
  "image_size": "1280x1280",
  "batch_size": 1
}
```

### 4.2 获取用户图片历史
```
GET /user/images?page=1&pageSize=10&keyword=
```
**功能**: 获取当前用户的图片生成历史  

## 🔐 5. 认证模块

### 5.1 管理员登录
```
POST /auth/login
```
**请求体**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**返回数据格式**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### 5.2 用户注册
```
POST /auth/register
```

### 5.3 获取用户信息
```
GET /user/profile
```

### 5.4 验证管理员令牌
```
POST /auth/validate-token
```

## ⚙️ 6. 系统管理模块

### 6.1 获取系统信息
```
GET /admin/system/info
```

### 6.2 获取系统配置
```
GET /admin/system/config
```

### 6.3 更新系统配置
```
PUT /admin/system/config
```

### 6.4 清理系统缓存
```
POST /admin/system/clear-cache
```

## 📁 7. 文件上传模块

### 7.1 上传头像
```
POST /upload/avatar
```
**Content-Type**: multipart/form-data  
**字段**: avatar (文件)

### 7.2 通用文件上传
```
POST /upload/file
```
**Content-Type**: multipart/form-data  
**字段**: 
- file (文件)
- type (文件类型: avatar, document, image)

## 🔧 通用响应格式

所有API接口都应该返回统一的响应格式：

### 成功响应
```json
{
  "success": true,
  "data": {}, // 具体数据
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

## 🔑 认证说明

- 管理员接口 (`/admin/*`) 需要管理员权限验证
- 普通用户接口需要用户登录验证
- 公开接口无需认证
- 使用 JWT Token 进行身份验证
- Token 应在请求头中携带: `Authorization: Bearer <token>`

## 📝 优先级建议

建议按以下优先级实现：

1. **高优先级** (仪表盘显示需要):
   - 仪表盘统计模块 (1.1-1.4)
   - 用户管理基础接口 (2.1, 2.2)
   - 认证模块 (5.1, 5.3)

2. **中优先级**:
   - 图片管理模块 (3.1-3.4)
   - 图片生成模块 (4.1, 4.2)

3. **低优先级**:
   - 系统管理模块 (6.1-6.4)
   - 文件上传模块 (7.1-7.2)

实现这些接口后，前端管理后台就能正常显示数据和提供完整的管理功能了！