<template>
  <div class="profile-container">
    <div class="page-header">
      <h1>个人资料</h1>
      <p class="page-description">管理您的个人信息和账户设置</p>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else class="profile-content">
      <el-row :gutter="24">
        <!-- 左侧：头像和基本信息 -->
        <el-col :span="8">
          <el-card class="profile-card">
            <div class="profile-avatar-section">
              <div class="avatar-container">
                <el-avatar :size="120" :src="getImageUrl(userInfo.avatar_url)">
                  <el-icon size="60"><User /></el-icon>
                </el-avatar>
                <div class="avatar-overlay">
                  <el-button
                    type="primary"
                    :icon="Camera"
                    circle
                    size="small"
                    @click="handleAvatarUpload"
                  />
                </div>
              </div>
              <h3 class="profile-name">{{ userInfo.username }}</h3>
              <el-tag :type="userInfo.role === 'admin' ? 'danger' : 'primary'" class="role-tag">
                {{ userInfo.role === 'admin' ? '管理员' : '用户' }}
              </el-tag>
            </div>
            
            <div class="profile-info">
              <div class="info-item">
                <span class="info-label">用户ID</span>
                <span class="info-value">{{ userInfo.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">注册时间</span>
                <span class="info-value">{{ formatDate(userInfo.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后登录</span>
                <span class="info-value">{{ formatDate(userInfo.last_login) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：编辑表单 -->
        <el-col :span="16">
          <el-card class="edit-card">
            <template #header>
              <div class="card-header">
                <span>编辑资料</span>
              </div>
            </template>

            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
              class="profile-form"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="profileForm.username"
                  placeholder="请输入用户名"
                  :disabled="saving"
                />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="profileForm.email"
                  type="email"
                  placeholder="请输入邮箱"
                  :disabled="saving"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  @click="saveProfile"
                  :loading="saving"
                  :icon="Check"
                >
                  保存修改
                </el-button>
                <el-button @click="resetForm" :disabled="saving">
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 修改密码卡片 -->
          <el-card class="password-card" style="margin-top: 24px;">
            <template #header>
              <div class="card-header">
                <span>修改密码</span>
              </div>
            </template>

            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
              class="password-form"
            >
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  show-password
                  :disabled="changingPassword"
                />
              </el-form-item>

              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                  :disabled="changingPassword"
                />
              </el-form-item>

              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                  :disabled="changingPassword"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  @click="changePassword"
                  :loading="changingPassword"
                  :icon="Lock"
                >
                  修改密码
                </el-button>
                <el-button @click="resetPasswordForm" :disabled="changingPassword">
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="avatarDialogVisible"
      title="更换头像"
      width="400px"
      :before-close="handleAvatarDialogClose"
    >
      <el-upload
        ref="avatarUploadRef"
        class="avatar-uploader"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :on-error="handleAvatarError"
        :before-upload="beforeAvatarUpload"
        accept="image/*"
        drag
      >
        <div class="upload-content">
          <el-icon class="upload-icon"><Plus /></el-icon>
          <div class="upload-text">点击或拖拽上传头像</div>
          <div class="upload-hint">支持 JPG、PNG 格式，文件大小不超过 2MB</div>
        </div>
      </el-upload>
      
      <template #footer>
        <el-button @click="avatarDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, 
  Camera, 
  Check, 
  Lock, 
  Plus 
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api/auth'
import { formatDate } from '@/utils'

const authStore = useAuthStore()

// 响应式数据
const loading = ref(true)
const saving = ref(false)
const changingPassword = ref(false)
const avatarDialogVisible = ref(false)
const userInfo = ref({})

// 表单引用
const profileFormRef = ref(null)
const passwordFormRef = ref(null)
const avatarUploadRef = ref(null)

// 个人资料表单
const profileForm = reactive({
  username: '',
  email: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 计算属性
const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL}/user/avatar`
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${authStore.token}`
  }
})

// 方法
const getImageUrl = (url) => {
  if (!url) return ''
  // 检查是否为完整的URL（包括http和https）
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // 对于相对路径，添加服务器前缀
  const serverUrl = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:5004'
  return `${serverUrl}${url}`
}

const loadUserInfo = async () => {
  try {
    loading.value = true
    const response = await authAPI.getUserInfo()
    
    if (response.success && response.data) {
      userInfo.value = response.data.user || response.data
      
      // 填充表单
      profileForm.username = userInfo.value.username || ''
      profileForm.email = userInfo.value.email || ''
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()
    saving.value = true

    const updateData = {
      username: profileForm.username,
      email: profileForm.email
    }

    const response = await authAPI.updateProfile(updateData)

    if (response.success) {
      ElMessage.success('个人资料更新成功')

      // 重新加载用户信息
      await loadUserInfo()
      // 更新store中的用户信息
      await authStore.getUserInfo()
    } else {
      throw new Error(response.message || '更新失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新个人资料失败:', error)
      ElMessage.error(error.message || '更新个人资料失败')
    }
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  profileForm.username = userInfo.value.username || ''
  profileForm.email = userInfo.value.email || ''
}

const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true

    const passwordData = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }

    const response = await authAPI.changePassword(passwordData)

    if (response.success) {
      ElMessage.success('密码修改成功')
      resetPasswordForm()
    } else {
      throw new Error(response.message || '修改失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改密码失败:', error)
      ElMessage.error(error.message || '修改密码失败')
    }
  } finally {
    changingPassword.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

const handleAvatarUpload = () => {
  avatarDialogVisible.value = true
}

const handleAvatarDialogClose = () => {
  avatarDialogVisible.value = false
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = (response) => {
  if (response.success) {
    ElMessage.success('头像上传成功')
    avatarDialogVisible.value = false
    // 重新加载用户信息
    loadUserInfo()
    // 更新store中的用户信息
    authStore.getUserInfo()
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

const handleAvatarError = (error) => {
  console.error('头像上传失败:', error)
  ElMessage.error('头像上传失败')
}

// 生命周期
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.loading-container {
  background: white;
  padding: 24px;
  border-radius: 8px;
}

.profile-content {
  max-width: 1200px;
}

.profile-card {
  text-align: center;
}

.profile-avatar-section {
  padding: 24px 0;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-name {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.role-tag {
  margin-bottom: 24px;
}

.profile-info {
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #909399;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.profile-form,
.password-form {
  max-width: 400px;
}

.avatar-uploader {
  width: 100%;
}

.upload-content {
  padding: 40px 20px;
  text-align: center;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.upload-content:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  color: #606266;
  font-size: 16px;
  margin-bottom: 8px;
}

.upload-hint {
  color: #909399;
  font-size: 12px;
}
</style>
