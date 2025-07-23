# API使用指南

基于更新后的API文档，本项目已重新组织了所有API接口。以下是详细的使用指南：

## 📁 项目结构

```
src/
├── api/                    # API模块目录
│   ├── index.js           # 统一导出文件
│   ├── auth.js            # 认证相关API
│   ├── user.js            # 用户管理API
│   ├── image.js           # 图片管理API
│   ├── generate.js        # 图片生成API
│   ├── upload.js          # 文件上传API
│   ├── dashboard.js       # 仪表盘API
│   └── system.js          # 系统设置API
├── utils/
│   ├── request.js         # axios配置
│   └── api.js             # 兼容性API（保留）
└── stores/
    └── auth.js            # 认证状态管理
```

## 🔧 基础配置

### API基础地址
- **开发环境**: `http://localhost:5004/api`
- **认证方式**: Bearer Token (JWT)
- **内容类型**: `application/json`

### 请求拦截器
自动添加认证token到请求头：
```javascript
Authorization: Bearer {your_jwt_token}
```

## 📖 API使用方法

### 1. 认证模块

```javascript
import { authAPI } from '@/api'

// 用户注册
const registerResult = await authAPI.register({
  username: 'testuser',
  email: 'test@example.com',
  password: '123456'
})

// 用户登录
const loginResult = await authAPI.login({
  username: 'admin',
  password: 'admin123'
})

// 获取用户信息
const userInfo = await authAPI.getUserInfo()
```

### 2. 用户管理模块

```javascript
import { userAPI } from '@/api'

// 获取用户列表（支持分页和筛选）
const users = await userAPI.getUsers({
  page: 1,
  pageSize: 10,
  keyword: 'test',
  status: 'active',
  role: 'user'
})

// 获取用户详情
const userDetail = await userAPI.getUserDetail(1)

// 创建用户
const newUser = await userAPI.createUser({
  username: 'newuser',
  email: 'newuser@example.com',
  password: '123456',
  role: 'user',
  status: 'active'
})

// 更新用户
const updatedUser = await userAPI.updateUser(1, {
  username: 'updateduser',
  email: 'updated@example.com'
})

// 删除用户
await userAPI.deleteUser(1)

// 批量删除用户
await userAPI.batchDeleteUsers([1, 2, 3])
```

### 3. 图片管理模块

```javascript
import { imageAPI } from '@/api'

// 获取图片列表
const images = await imageAPI.getImages({
  page: 1,
  pageSize: 10,
  keyword: 'landscape',
  status: 'published',
  userId: 1
})

// 获取图片详情
const imageDetail = await imageAPI.getImageDetail(1)

// 删除图片
await imageAPI.deleteImage(1)

// 批量删除图片
await imageAPI.batchDeleteImages([1, 2, 3])
```

### 4. 图片生成模块

```javascript
import { generateAPI } from '@/api'

// 生成图片
const generateResult = await generateAPI.generateImage({
  prompt: 'a beautiful landscape with mountains and rivers',
  model: 'Kwai-Kolors/Kolors',
  image_size: '1280x1280',
  batch_size: 1
})

// 获取生成历史
const history = await generateAPI.getGenerationHistory({
  page: 1,
  pageSize: 10
})
```

### 5. 文件上传模块

```javascript
import { uploadAPI } from '@/api'

// 上传头像
const avatarResult = await uploadAPI.uploadAvatar(file)

// 通用文件上传
const fileResult = await uploadAPI.uploadFile(file, 'image')
```

### 6. 仪表盘模块

```javascript
import { dashboardAPI } from '@/api'

// 获取系统统计数据
const stats = await dashboardAPI.getStats()

// 获取用户增长趋势
const userTrend = await dashboardAPI.getUserGrowthTrend(30)

// 获取图片生成趋势
const imageTrend = await dashboardAPI.getImageGenerationTrend(30)

// 获取热门提示词
const popularPrompts = await dashboardAPI.getPopularPrompts(10)
```

### 7. 系统设置模块

```javascript
import { systemAPI } from '@/api'

// 获取系统信息
const systemInfo = await systemAPI.getSystemInfo()

// 获取系统配置
const config = await systemAPI.getSystemConfig()

// 更新系统配置
await systemAPI.updateSystemConfig({
  siteName: '新的网站名称',
  siteDescription: '新的网站描述',
  maxFileSize: 20971520,
  allowedFormats: ['jpg', 'png', 'gif', 'webp', 'svg'],
  enableRegistration: false,
  enableEmailVerification: true
})

// 清理系统缓存
await systemAPI.clearCache(['temp', 'logs', 'thumbnails'])
```

## 🎯 在Vue组件中使用

### 组合式API示例

```vue
<template>
  <div>
    <el-table :data="users" :loading="loading">
      <!-- 表格内容 -->
    </el-table>
    
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      @current-change="fetchUsers"
      @size-change="fetchUsers"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { userAPI } from '@/api'
import { ElMessage } from 'element-plus'

// 响应式数据
const users = ref([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await userAPI.getUsers({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    
    if (response.success) {
      users.value = response.data.users
      Object.assign(pagination, response.data.pagination)
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 删除用户
const deleteUser = async (id) => {
  try {
    const response = await userAPI.deleteUser(id)
    if (response.success) {
      ElMessage.success('删除成功')
      await fetchUsers() // 重新获取列表
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
```

### 认证状态管理示例

```vue
<script setup>
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'

const authStore = useAuthStore()
const loginForm = ref({
  username: '',
  password: ''
})

// 登录
const handleLogin = async () => {
  const result = await authStore.login(loginForm.value)
  if (result.success) {
    // 登录成功，跳转到仪表盘
    router.push('/dashboard')
  }
}

// 登出
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
```

## 🔄 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误描述",
  "code": 400,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "details": "详细错误信息（可选）"
}
```

## 🚨 错误处理

项目已配置统一的错误处理机制：

- **400**: 请求参数错误
- **401**: 未授权（自动跳转登录页）
- **403**: 权限不足
- **404**: 资源不存在
- **409**: 资源冲突
- **413**: 文件过大
- **415**: 不支持的文件类型
- **500**: 服务器内部错误

## 📝 注意事项

1. **认证Token**: 大部分API需要有效的JWT token
2. **权限控制**: 管理员接口（/admin/*）需要admin角色权限
3. **文件上传**: 支持的文件格式和大小限制请参考系统配置
4. **分页参数**: 所有列表接口都支持分页，建议合理设置pageSize
5. **CORS**: 开发环境已配置CORS，生产环境请根据实际域名调整

## 🔧 开发建议

1. 使用TypeScript可以获得更好的类型提示
2. 建议使用组合式API进行状态管理
3. 合理使用loading状态提升用户体验
4. 及时处理错误并给用户友好的提示
5. 使用防抖和节流优化频繁的API调用