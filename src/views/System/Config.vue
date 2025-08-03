<template>
  <div class="system-config">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">系统配置</h2>
        <p class="page-description">管理系统的各项配置参数</p>
      </div>
      <div class="header-right">
        <el-button @click="handleReset">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
      </div>
    </div>
    
    <!-- 配置表单 -->
    <div class="config-content">
      <el-row :gutter="24">
        <!-- 基础配置 -->
        <el-col :span="24">
          <el-card class="config-card" shadow="never">
            <template #header>
              <div class="card-header">
                <h3>基础配置</h3>
                <el-tag type="info">系统基本设置</el-tag>
              </div>
            </template>
            
            <el-form :model="config.basic" label-width="120px" class="config-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="系统名称">
                    <el-input v-model="config.basic.systemName" placeholder="请输入系统名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="系统版本">
                    <el-input v-model="config.basic.version" placeholder="请输入版本号" readonly />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="管理员邮箱">
                    <el-input v-model="config.basic.adminEmail" placeholder="请输入管理员邮箱" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="系统时区">
                    <el-select v-model="config.basic.timezone" placeholder="请选择时区">
                      <el-option label="Asia/Shanghai" value="Asia/Shanghai" />
                      <el-option label="UTC" value="UTC" />
                      <el-option label="America/New_York" value="America/New_York" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="系统描述">
                    <el-input
                      v-model="config.basic.description"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入系统描述"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </el-col>
        
        <!-- 图片生成配置 -->
        <el-col :span="24">
          <el-card class="config-card" shadow="never">
            <template #header>
              <div class="card-header">
                <h3>图片生成配置</h3>
                <el-tag type="primary">AI 图片生成相关设置</el-tag>
              </div>
            </template>
            
            <el-form :model="config.image" label-width="120px" class="config-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="API 地址">
                    <el-input v-model="config.image.apiUrl" placeholder="请输入 API 地址" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="API 密钥">
                    <el-input
                      v-model="config.image.apiKey"
                      type="password"
                      placeholder="请输入 API 密钥"
                      show-password
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="默认模型">
                    <el-select v-model="config.image.defaultModel" placeholder="请选择默认模型">
                      <el-option label="DALL-E 3" value="dall-e-3" />
                      <el-option label="DALL-E 2" value="dall-e-2" />
                      <el-option label="Stable Diffusion" value="stable-diffusion" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="默认尺寸">
                    <el-select v-model="config.image.defaultSize" placeholder="请选择默认尺寸">
                      <el-option label="1024x1024" value="1024x1024" />
                      <el-option label="1024x1792" value="1024x1792" />
                      <el-option label="1792x1024" value="1792x1024" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="请求超时">
                    <el-input-number
                      v-model="config.image.timeout"
                      :min="10"
                      :max="300"
                      :step="10"
                      controls-position="right"
                    />
                    <span class="form-unit">秒</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最大重试次数">
                    <el-input-number
                      v-model="config.image.maxRetries"
                      :min="0"
                      :max="10"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </el-col>
        
        <!-- 用户限制配置 -->
        <el-col :span="24">
          <el-card class="config-card" shadow="never">
            <template #header>
              <div class="card-header">
                <h3>用户限制配置</h3>
                <el-tag type="warning">用户使用限制设置</el-tag>
              </div>
            </template>
            
            <el-form :model="config.limits" label-width="120px" class="config-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="每日生成限制">
                    <el-input-number
                      v-model="config.limits.dailyLimit"
                      :min="1"
                      :max="1000"
                      controls-position="right"
                    />
                    <span class="form-unit">张/天</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="每小时限制">
                    <el-input-number
                      v-model="config.limits.hourlyLimit"
                      :min="1"
                      :max="100"
                      controls-position="right"
                    />
                    <span class="form-unit">张/小时</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="提示词最大长度">
                    <el-input-number
                      v-model="config.limits.maxPromptLength"
                      :min="10"
                      :max="2000"
                      :step="10"
                      controls-position="right"
                    />
                    <span class="form-unit">字符</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="图片保存天数">
                    <el-input-number
                      v-model="config.limits.imageRetentionDays"
                      :min="1"
                      :max="365"
                      controls-position="right"
                    />
                    <span class="form-unit">天</span>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="启用用户注册">
                    <el-switch
                      v-model="config.limits.allowRegistration"
                      active-text="允许"
                      inactive-text="禁止"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </el-col>
        
        <!-- 存储配置 -->
        <el-col :span="24">
          <el-card class="config-card" shadow="never">
            <template #header>
              <div class="card-header">
                <h3>存储配置</h3>
                <el-tag type="success">文件存储相关设置</el-tag>
              </div>
            </template>
            
            <el-form :model="config.storage" label-width="120px" class="config-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="存储类型">
                    <el-select v-model="config.storage.type" placeholder="请选择存储类型">
                      <el-option label="本地存储" value="local" />
                      <el-option label="阿里云 OSS" value="aliyun" />
                      <el-option label="腾讯云 COS" value="tencent" />
                      <el-option label="AWS S3" value="aws" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="存储路径">
                    <el-input v-model="config.storage.path" placeholder="请输入存储路径" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="访问域名">
                    <el-input v-model="config.storage.domain" placeholder="请输入访问域名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最大文件大小">
                    <el-input-number
                      v-model="config.storage.maxFileSize"
                      :min="1"
                      :max="100"
                      controls-position="right"
                    />
                    <span class="form-unit">MB</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </el-col>
        
        <!-- 安全配置 -->
        <el-col :span="24">
          <el-card class="config-card" shadow="never">
            <template #header>
              <div class="card-header">
                <h3>安全配置</h3>
                <el-tag type="danger">系统安全相关设置</el-tag>
              </div>
            </template>
            
            <el-form :model="config.security" label-width="120px" class="config-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="JWT 密钥">
                    <el-input
                      v-model="config.security.jwtSecret"
                      type="password"
                      placeholder="请输入 JWT 密钥"
                      show-password
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Token 有效期">
                    <el-input-number
                      v-model="config.security.tokenExpiry"
                      :min="1"
                      :max="168"
                      controls-position="right"
                    />
                    <span class="form-unit">小时</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="密码最小长度">
                    <el-input-number
                      v-model="config.security.minPasswordLength"
                      :min="6"
                      :max="20"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="登录失败限制">
                    <el-input-number
                      v-model="config.security.maxLoginAttempts"
                      :min="3"
                      :max="10"
                      controls-position="right"
                    />
                    <span class="form-unit">次</span>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="启用内容审核">
                    <el-switch
                      v-model="config.security.enableContentFilter"
                      active-text="启用"
                      inactive-text="禁用"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { systemAPI } from '@/utils/api'
import {
  RefreshLeft,
  Check
} from '@element-plus/icons-vue'

// 响应式数据
const saving = ref(false)

// 配置数据
const config = reactive({
  basic: {
    systemName: 'AI 图片生成系统',
    version: '1.0.0',
    adminEmail: 'admin@example.com',
    timezone: 'Asia/Shanghai',
    description: '基于 AI 的图片生成系统，支持多种模型和自定义提示词'
  },
  image: {
    apiUrl: 'https://api.openai.com/v1',
    apiKey: '',
    defaultModel: 'dall-e-3',
    defaultSize: '1024x1024',
    timeout: 60,
    maxRetries: 3
  },
  limits: {
    dailyLimit: 50,
    hourlyLimit: 10,
    maxPromptLength: 500,
    imageRetentionDays: 30,
    allowRegistration: true
  },
  storage: {
    type: 'local',
    path: '/uploads',
    domain: 'http://localhost:5004',
    maxFileSize: 10
  },
  security: {
    jwtSecret: '',
    tokenExpiry: 24,
    minPasswordLength: 8,
    maxLoginAttempts: 5,
    enableContentFilter: true
  }
})

// 原始配置（用于重置）
const originalConfig = ref({})

// 加载配置
const loadConfig = async () => {
  try {
    const response = await systemAPI.getConfig()
    if (response.success && response.data) {
      // 将后端配置映射到前端配置结构
      const backendConfig = response.data

      // 更新基础配置
      if (backendConfig.systemName) config.basic.systemName = backendConfig.systemName
      if (backendConfig.version) config.basic.version = backendConfig.version
      if (backendConfig.adminEmail) config.basic.adminEmail = backendConfig.adminEmail

      // 更新其他配置...
      originalConfig.value = JSON.parse(JSON.stringify(config))
    }
  } catch (error) {
    ElMessage.error('加载配置失败')
    console.error('加载配置失败:', error)
  }
}

// 保存配置
const handleSave = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要保存配置吗？部分配置可能需要重启系统才能生效。',
      '确认保存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    saving.value = true
    const response = await systemAPI.updateConfig(config)
    if (response.success) {
      ElMessage.success('配置保存成功')
      originalConfig.value = JSON.parse(JSON.stringify(config))
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('保存配置失败')
      console.error('保存配置失败:', error)
    }
  } finally {
    saving.value = false
  }
}

// 重置配置
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置配置吗？所有未保存的修改将丢失。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    Object.assign(config, originalConfig.value)
    ElMessage.success('配置已重置')
  } catch {
    // 用户取消操作
  }
}

// 初始化
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.system-config {
  padding: var(--admin-padding-lg);
  background: var(--el-bg-color-page);
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--admin-padding-lg);
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.header-right {
  display: flex;
  gap: var(--admin-padding-md);
}

.config-content {
  max-width: 1200px;
}

.config-card {
  margin-bottom: var(--admin-padding-lg);
  border-radius: var(--admin-border-radius-lg);
  overflow: hidden;
}

.config-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.config-form {
  padding: var(--admin-padding-md) 0;
}

.form-unit {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

:deep(.el-form-item) {
  margin-bottom: var(--admin-padding-lg);
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}

:deep(.el-card__header) {
  background: var(--el-fill-color-extra-light);
  border-bottom: 1px solid var(--el-border-color-light);
}

:deep(.el-card__body) {
  padding: var(--admin-padding-lg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-config {
    padding: var(--admin-padding-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--admin-padding-md);
  }
  
  .header-right {
    align-self: stretch;
  }
  
  .config-form {
    padding: var(--admin-padding-sm) 0;
  }
  
  :deep(.el-form-item) {
    margin-bottom: var(--admin-padding-md);
  }
  
  :deep(.el-card__body) {
    padding: var(--admin-padding-md);
  }
}

@media (max-width: 480px) {
  :deep(.el-col) {
    width: 100% !important;
  }
}
</style>