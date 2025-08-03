<template>
  <div class="user-create-container">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <h1>创建用户</h1>
      </div>
    </div>

    <el-card class="create-form-card">
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
        size="large"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="createForm.username"
                placeholder="请输入用户名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="createForm.email"
                placeholder="请输入邮箱地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="createForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="createForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="createForm.status" placeholder="请选择用户状态">
                <el-option label="正常" value="active" />
                <el-option label="禁用" value="disabled" />
                <el-option label="未激活" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="createForm.role" placeholder="请选择用户角色">
                <el-option label="普通用户" value="user" />
                <el-option label="管理员" value="admin" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="createUser" :loading="creating" size="large">
            创建用户
          </el-button>
          <el-button @click="resetForm" size="large">重置</el-button>
          <el-button @click="goBack" size="large">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { userAPI } from '@/utils/api'

const router = useRouter()

const creating = ref(false)
const createFormRef = ref(null)

const createForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  status: 'active',
  role: 'user',
  remark: ''
})

// 自定义验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== createForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const createRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ]
}

const goBack = () => {
  router.go(-1)
}

const resetForm = () => {
  if (createFormRef.value) {
    createFormRef.value.resetFields()
  }
}

const createUser = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    creating.value = true

    const userData = {
      username: createForm.username,
      email: createForm.email,
      password: createForm.password,
      status: createForm.status,
      role: createForm.role,
      remark: createForm.remark
    }

    await userAPI.createUser(userData)
    ElMessage.success('用户创建成功')
    router.push('/users')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('创建用户失败:', error)
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('创建用户失败，请稍后重试')
      }
    }
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.user-create-container {
  padding: var(--admin-padding-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--admin-padding-lg);
  padding-bottom: var(--admin-padding-md);
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--admin-padding-md);
}

.header-left h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--el-text-color-primary);
}

.create-form-card {
  max-width: 800px;
  margin: 0 auto;
}

.create-form-card :deep(.el-card__body) {
  padding: var(--admin-padding-xl);
}

.el-form-item {
  margin-bottom: var(--admin-padding-lg);
}

.el-input,
.el-select {
  width: 100%;
}

@media (max-width: 768px) {
  .user-create-container {
    padding: var(--admin-padding-md);
  }
  
  .create-form-card {
    max-width: 100%;
  }
  
  .el-col {
    margin-bottom: var(--admin-padding-md);
  }
}
</style>