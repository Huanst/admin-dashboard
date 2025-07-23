# 🔐 管理员账户信息

## 📋 默认管理员账户

根据项目的API文档和配置，以下是管理员账户信息：

### 🔑 登录凭据

| 字段 | 值 | 说明 |
|------|-----|------|
| **用户名** | `Huan` | 管理员用户名 |
| **密码** | `Huanst518` | 默认密码 |
| **角色** | `admin` | 管理员角色 |
| **邮箱** | `admin@example.com` | 管理员邮箱 |

### 🌐 登录地址

- **前端登录页面**: http://localhost:5178/login
- **API登录接口**: `POST http://localhost:5004/api/auth/login`

### 📝 登录请求示例

```json
{
  "username": "Huan",
  "password": "Huanst518"
}
```

### ✅ 登录成功响应

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "Huan",
      "email": "admin@example.com",
      "role": "admin",
      "avatar": "https://example.com/avatar.jpg",
      "created_at": "2024-01-01T00:00:00Z",
      "last_login": "2024-01-01T00:00:00Z"
    }
  }
}
```

## 🔧 使用说明

### 1. 前端登录
1. 打开浏览器访问: http://localhost:5178/login
2. 输入用户名: `Huan`
3. 输入密码: `Huanst518`
4. 点击"登录"按钮

### 2. API直接调用
```bash
curl -X POST http://localhost:5004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Huan",
    "password": "Huanst518"
  }'
```

### 3. JavaScript调用示例
```javascript
// 使用项目中的API
import { authAPI } from '@/api'

const login = async () => {
  try {
    const response = await authAPI.login({
      username: 'Huan',
      password: 'Huanst518'
    })
    console.log('登录成功:', response)
  } catch (error) {
    console.error('登录失败:', error)
  }
}
```

## 🛡️ 安全注意事项

### ⚠️ 重要提醒
1. **默认密码**: 这是开发环境的默认密码，生产环境中必须修改
2. **密码强度**: 建议使用更强的密码（包含大小写字母、数字、特殊字符）
3. **定期更换**: 建议定期更换管理员密码
4. **权限管理**: 确保只有授权人员知道管理员账户信息

### 🔒 密码修改建议
- 最小长度: 8个字符
- 包含大写字母
- 包含小写字母  
- 包含数字
- 包含特殊字符
- 避免使用常见密码

## 📊 管理员权限

管理员账户具有以下权限：

### 👥 用户管理
- ✅ 查看用户列表
- ✅ 查看用户详情
- ✅ 创建新用户
- ✅ 编辑用户信息
- ✅ 删除用户
- ✅ 批量删除用户

### 🖼️ 图片管理
- ✅ 查看图片列表
- ✅ 查看图片详情
- ✅ 删除图片
- ✅ 批量删除图片

### 🎨 图片生成
- ✅ 生成AI图片
- ✅ 查看生成历史

### 📁 文件上传
- ✅ 上传头像
- ✅ 上传其他文件

### 📈 数据统计
- ✅ 查看系统统计
- ✅ 查看用户增长趋势
- ✅ 查看图片生成趋势
- ✅ 查看热门提示词

### ⚙️ 系统设置
- ✅ 查看系统信息
- ✅ 管理系统配置
- ✅ 清理系统缓存

## 🔍 故障排除

### 登录失败常见原因
1. **用户名或密码错误**: 请确认输入正确
2. **后端服务未启动**: 确保API服务在 http://localhost:5004 运行
3. **网络连接问题**: 检查网络连接
4. **浏览器缓存**: 清除浏览器缓存后重试

### 检查后端服务
```bash
# 检查后端服务状态
curl http://localhost:5004/api/health

# 测试登录接口
curl -X POST http://localhost:5004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Huan","password":"Huanst518"}'
```

## 📞 技术支持

如果遇到登录问题，请检查：
1. 后端API服务是否正常运行
2. 数据库连接是否正常
3. 网络配置是否正确
4. 浏览器控制台是否有错误信息

---

**⚠️ 重要提醒：这些是开发环境的默认账户信息，生产环境中请务必修改默认密码！**