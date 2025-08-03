<template>
  <div class="system-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
      <p class="page-description">管理系统配置和查看系统运行状态</p>
    </div>

    <!-- 设置模块卡片 -->
    <div class="settings-grid">
      <!-- 系统配置 -->
      <el-card
        class="setting-card config-card"
        shadow="hover"
        @click="navigateToConfig"
      >
        <div class="card-content">
          <div class="card-icon">
            <el-icon size="48"><Tools /></el-icon>
          </div>
          <div class="card-info">
            <h3 class="card-title">系统配置</h3>
            <p class="card-description">
              配置系统基本信息、文件上传设置、用户注册设置等核心参数
            </p>
            <div class="card-features">
              <el-tag size="small" type="primary">基础配置</el-tag>
              <el-tag size="small" type="success">文件设置</el-tag>
              <el-tag size="small" type="warning">用户设置</el-tag>
            </div>
          </div>
          <div class="card-action">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </el-card>

      <!-- 系统日志 -->
      <el-card
        class="setting-card logs-card"
        shadow="hover"
        @click="navigateToLogs"
      >
        <div class="card-content">
          <div class="card-icon">
            <el-icon size="48"><Document /></el-icon>
          </div>
          <div class="card-info">
            <h3 class="card-title">系统日志</h3>
            <p class="card-description">
              查看系统运行日志、错误记录、用户操作记录等详细信息
            </p>
            <div class="card-features">
              <el-tag size="small" type="danger">错误日志</el-tag>
              <el-tag size="small" type="warning">警告日志</el-tag>
              <el-tag size="small" type="info">操作记录</el-tag>
            </div>
          </div>
          <div class="card-action">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快速状态概览 -->
    <el-card class="status-overview" shadow="never">
      <template #header>
        <div class="card-header">
          <span>系统状态概览</span>
          <el-button type="primary" link @click="refreshStatus">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-row :gutter="24">
        <el-col :span="6">
          <div class="status-item">
            <div class="status-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">系统状态</div>
              <div class="status-value">正常运行</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="status-item">
            <div class="status-icon info">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">运行时间</div>
              <div class="status-value">{{ systemUptime }}</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="status-item">
            <div class="status-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">今日错误</div>
              <div class="status-value">{{ todayErrors }}</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="status-item">
            <div class="status-icon primary">
              <el-icon><User /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">在线用户</div>
              <div class="status-value">{{ onlineUsers }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Tools,
  Document,
  ArrowRight,
  Refresh,
  CircleCheck,
  Clock,
  Warning,
  User
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const systemUptime = ref('2天 14小时 32分钟')
const todayErrors = ref('3')
const onlineUsers = ref('12')

// 导航方法
const navigateToConfig = () => {
  router.push('/system/config')
}

const navigateToLogs = () => {
  router.push('/system/logs')
}

const refreshStatus = () => {
  ElMessage.success('状态已刷新')
  // 这里可以添加实际的状态刷新逻辑
}

// 生命周期
onMounted(() => {
  // 可以在这里加载系统状态数据
})
</script>

<style scoped>
.system-settings {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 16px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.setting-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.setting-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.config-card:hover {
  border-color: #409eff;
}

.logs-card:hover {
  border-color: #67c23a;
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 8px;
}

.card-icon {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.config-card .card-icon {
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
  color: white;
}

.logs-card .card-icon {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

.card-info {
  flex: 1;
}

.card-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.card-description {
  margin: 0 0 16px 0;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card-action {
  flex-shrink: 0;
  color: #c0c4cc;
  font-size: 20px;
  transition: all 0.3s ease;
}

.setting-card:hover .card-action {
  color: #409eff;
  transform: translateX(4px);
}

.status-overview {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.status-item:hover {
  background: #f0f9ff;
  transform: translateY(-2px);
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.status-icon.success {
  background: #f0f9ff;
  color: #67c23a;
}

.status-icon.info {
  background: #f0f9ff;
  color: #409eff;
}

.status-icon.warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-icon.primary {
  background: #f5f7fa;
  color: #909399;
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.status-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .card-content {
    flex-direction: column;
    text-align: center;
  }

  .card-action {
    align-self: center;
  }
}
</style>