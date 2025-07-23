<template>
  <div class="user-detail-container">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <h1>用户详情</h1>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="editUser" :icon="Edit">编辑用户</el-button>
        <el-button type="danger" @click="deleteUser" :icon="Delete">删除用户</el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="user" class="user-detail-content">
      <!-- 基本信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        <div class="user-basic-info">
          <div class="avatar-section">
            <el-avatar :size="120" :src="user.avatar">
              <el-icon size="60"><UserIcon /></el-icon>
            </el-avatar>
            <div class="status-badge">
              <el-tag :type="user.status === 'active' ? 'success' : user.status === 'disabled' ? 'danger' : 'warning'" class="status-badge">
                {{ getStatusText(user.status) }}
              </el-tag>
            </div>
          </div>
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <label>用户名</label>
                <span>{{ user.username }}</span>
              </div>
              <div class="info-item">
                <label>邮箱</label>
                <span>{{ user.email }}</span>
              </div>
              <div class="info-item">
                <label>手机号</label>
                <span>{{ user.email || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>用户ID</label>
                <span>{{ user.id }}</span>
              </div>
              <div class="info-item">
                <label>注册时间</label>
                <span>{{ formatDate(user.createdAt) }}</span>
              </div>
              <div class="info-item">
                <label>最后登录</label>
                <span>{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录' }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 统计信息卡片 -->
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>使用统计</span>
          </div>
        </template>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ user.stats?.totalImages || 0 }}</div>
            <div class="stat-label">生成图片总数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ user.stats?.todayImages || 0 }}</div>
            <div class="stat-label">今日生成</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ user.stats?.totalTokens || 0 }}</div>
            <div class="stat-label">消耗积分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ user.stats?.remainingTokens || 0 }}</div>
            <div class="stat-label">剩余积分</div>
          </div>
        </div>
      </el-card>

      <!-- 最近活动 -->
      <el-card class="activity-card">
        <template #header>
          <div class="card-header">
            <span>最近活动</span>
            <el-button text @click="refreshActivity">刷新</el-button>
          </div>
        </template>
        <div class="activity-list">
          <div v-if="activities.length === 0" class="empty-state">
            <el-empty description="暂无活动记录" />
          </div>
          <div v-else>
            <div v-for="activity in activities" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <el-icon :color="getActivityColor(activity.type)">
                  <component :is="getActivityIcon(activity.type)" />
                </el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
                <div class="activity-time">{{ formatDate(activity.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div v-else class="error-state">
      <el-result icon="warning" title="用户不存在" sub-title="该用户可能已被删除或不存在">
        <template #extra>
          <el-button type="primary" @click="goBack">返回用户列表</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Delete, User as UserIcon, Picture, Setting } from '@element-plus/icons-vue'
import { userAPI } from '@/utils/api'
import { formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const user = ref(null)
const activities = ref([])

const userId = Number(route.params.id)

const goBack = () => {
  router.go(-1)
}

const getStatusText = (status) => {
  const statusMap = {
    active: '正常',
    disabled: '已禁用',
    inactive: '未激活'
  }
  return statusMap[status] || status
}

const getActivityIcon = (type) => {
  const iconMap = {
    login: UserIcon,
    generate: Picture,
    setting: Setting
  }
  return iconMap[type] || Setting
}

const getActivityColor = (type) => {
  const colorMap = {
    login: '#67C23A',
    generate: '#409EFF',
    setting: '#E6A23C'
  }
  return colorMap[type] || '#909399'
}

const loadUserDetail = async () => {
  try {
    loading.value = true
    const response = await userAPI.getUserDetail(userId)
    user.value = response.data
    
    // 模拟活动数据
    activities.value = [
      {
        id: 1,
        type: 'login',
        title: '用户登录',
        description: '从 192.168.1.100 登录系统',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        type: 'generate',
        title: '生成图片',
        description: '使用提示词"美丽的风景"生成了一张图片',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  } catch (error) {
    console.error('加载用户详情失败:', error)
    ElMessage.error('加载用户详情失败')
  } finally {
    loading.value = false
  }
}

const editUser = () => {
  ElMessage.info('编辑功能开发中...')
}

const deleteUser = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.value?.username}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userAPI.deleteUser(userId)
    ElMessage.success('删除成功')
    router.push('/users')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }
}

const refreshActivity = () => {
  ElMessage.success('活动记录已刷新')
  loadUserDetail()
}

onMounted(() => {
  if (userId) {
    loadUserDetail()
  } else {
    ElMessage.error('用户ID无效')
    router.push('/users')
  }
})
</script>

<style scoped>
.user-detail-container {
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

.header-right {
  display: flex;
  gap: var(--admin-padding-sm);
}

.loading-container {
  padding: var(--admin-padding-xl);
}

.user-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--admin-padding-lg);
}

.info-card .user-basic-info {
  display: flex;
  gap: var(--admin-padding-xl);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--admin-padding-md);
}

.status-badge {
  margin-top: var(--admin-padding-sm);
}

.info-section {
  flex: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--admin-padding-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--admin-padding-xs);
}

.info-item label {
  font-size: 0.875rem;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.info-item span {
  font-size: 1rem;
  color: var(--el-text-color-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--admin-padding-lg);
}

.stat-item {
  text-align: center;
  padding: var(--admin-padding-lg);
  background: var(--el-fill-color-light);
  border-radius: var(--admin-border-radius-md);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: var(--admin-padding-xs);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--el-text-color-regular);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  gap: var(--admin-padding-md);
  padding: var(--admin-padding-md);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: var(--admin-padding-xs);
}

.activity-desc {
  font-size: 0.875rem;
  color: var(--el-text-color-regular);
  margin-bottom: var(--admin-padding-xs);
}

.activity-time {
  font-size: 0.75rem;
  color: var(--el-text-color-placeholder);
}

.empty-state {
  padding: var(--admin-padding-xl);
}

.error-state {
  padding: var(--admin-padding-xl);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--admin-padding-md);
    align-items: stretch;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .user-basic-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>