<template>
  <div class="user-detail-container">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <h1>用户详情</h1>
      </div>
      <div class="header-right">
        <el-button @click="viewUserImages" :icon="Picture">查看图片</el-button>
        <el-button
          :type="user?.status === 'active' ? 'warning' : 'success'"
          @click="toggleUserStatus"
          :icon="Setting"
        >
          {{ user?.status === 'active' ? '禁用用户' : '启用用户' }}
        </el-button>
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
            <el-avatar :size="120" :src="getImageUrl(user.avatar)">
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
                <span>{{ user.profile?.phone || '未设置' }}</span>
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
            <div class="stat-value">{{ user.stats?.weekImages || 0 }}</div>
            <div class="stat-label">本周生成</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ user.stats?.totalTokens || 0 }}</div>
            <div class="stat-label">累计积分</div>
          </div>
        </div>
      </el-card>

      <!-- 用户图片 -->
      <el-card class="images-card">
        <template #header>
          <div class="card-header">
            <span>用户图片</span>
            <div class="header-actions">
              <el-button text @click="refreshImages">刷新</el-button>
              <el-button text @click="viewAllImages">查看全部</el-button>
            </div>
          </div>
        </template>
        <div class="images-content">
          <div v-if="loadingImages" class="loading-state">
            <el-skeleton :rows="2" animated />
          </div>
          <div v-else-if="userImages.length === 0" class="empty-state">
            <el-empty description="该用户暂无图片" />
          </div>
          <div v-else class="images-grid">
            <div
              v-for="image in userImages"
              :key="image.id"
              class="image-item"
              @click="previewImage(image)"
            >
              <el-image
                :src="getImageUrl(image.url || image.thumbnail)"
                :preview-src-list="[getImageUrl(image.url || image.thumbnail)]"
                :preview-teleported="true"
                fit="cover"
                class="image-thumbnail"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="image-info">
                <div class="image-title">{{ image.title || '无标题' }}</div>
                <div class="image-time">{{ formatDate(image.created_at) }}</div>
              </div>
            </div>
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
          <div class="error-actions">
            <el-button @click="goBack">返回上一页</el-button>
            <el-button type="primary" @click="goToUserList">查看用户列表</el-button>
            <el-button type="success" @click="refreshPage">重新加载</el-button>
          </div>
        </template>
      </el-result>
    </div>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="未激活" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Delete, User as UserIcon, Picture, Setting } from '@element-plus/icons-vue'
import { userAPI, imageAPI } from '@/utils/api'
import { formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const user = ref(null)
const activities = ref([])
const userImages = ref([])
const loadingImages = ref(false)

// 编辑用户相关
const editDialogVisible = ref(false)
const saving = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  username: '',
  email: '',
  phone: '',
  status: '',
  role: ''
})

const editRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 改进用户ID验证逻辑
const userId = route.params.id
const numericUserId = parseInt(userId, 10)
const isValidUserId = userId && !isNaN(numericUserId) && numericUserId > 0

const goBack = () => {
  router.go(-1)
}

// 跳转到用户列表
const goToUserList = () => {
  router.push('/users')
}

// 刷新页面
const refreshPage = () => {
  if (isValidUserId) {
    loadUserDetail()
  } else {
    location.reload()
  }
}

// 获取完整的图片URL
const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:5004${url}`
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

    // 并行加载用户详情、活动记录和用户图片
    const [userResponse, activitiesResponse, imagesResponse] = await Promise.all([
      userAPI.getUserDetail(numericUserId),
      userAPI.getUserActivities(numericUserId, { page: 1, limit: 10 }),
      imageAPI.getImages({ userId: numericUserId, page: 1, pageSize: 16 })
    ])

    const userData = userResponse.data
    user.value = {
      ...userData,
      // 格式化字段名以匹配模板
      createdAt: userData.created_at,
      lastLoginAt: userData.last_login,
      stats: {
        totalImages: userData.image_count || 0,
        todayImages: userData.today_images || 0,
        weekImages: userData.week_images || 0,
        totalTokens: userData.total_points || 0,
        remainingTokens: userData.user_points || 0
      }
    }

    // 格式化活动数据
    activities.value = activitiesResponse.data.activities.map(activity => ({
      id: activity.activity_id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      createdAt: activity.created_at
    }))

    // 格式化图片数据
    if (imagesResponse.data && imagesResponse.data.list) {
      userImages.value = imagesResponse.data.list
    }

  } catch (error) {
    console.error('加载用户详情失败:', error)

    // 根据错误类型显示不同的消息
    if (error.response?.status === 404) {
      // 404错误不显示错误消息，让页面显示"用户不存在"
      console.log('用户不存在，显示错误页面')
    } else {
      ElMessage.error('加载用户详情失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const editUser = () => {
  if (!user.value) return

  // 填充编辑表单
  editForm.username = user.value.username
  editForm.email = user.value.email
  editForm.phone = user.value.profile?.phone || ''
  editForm.status = user.value.status
  editForm.role = user.value.role || 'user'

  editDialogVisible.value = true
}

// 保存用户信息
const saveUser = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    saving.value = true

    const updateData = {
      username: editForm.username,
      email: editForm.email,
      status: editForm.status,
      role: editForm.role,
      profile: {
        phone: editForm.phone
      }
    }

    await userAPI.updateUser(numericUserId, updateData)
    ElMessage.success('用户信息更新成功')
    editDialogVisible.value = false

    // 重新加载用户详情
    await loadUserDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新用户信息失败:', error)
      ElMessage.error('更新用户信息失败')
    }
  } finally {
    saving.value = false
  }
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
    
    await userAPI.deleteUser(numericUserId)
    ElMessage.success('删除成功')
    router.push('/users')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }
}

// 切换用户状态
const toggleUserStatus = async () => {
  if (!user.value) return

  const action = user.value.status === 'active' ? '禁用' : '启用'
  const newStatus = user.value.status === 'active' ? 'disabled' : 'active'

  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.value.username}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await userAPI.updateUser(numericUserId, { status: newStatus })
    user.value.status = newStatus
    ElMessage.success(`${action}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
      console.error('切换用户状态失败:', error)
    }
  }
}

// 查看用户图片
const viewUserImages = () => {
  router.push(`/images/list?userId=${numericUserId}`)
}

// 查看全部图片
const viewAllImages = () => {
  router.push(`/images/list?userId=${numericUserId}`)
}

// 刷新图片列表
const refreshImages = async () => {
  try {
    loadingImages.value = true
    const response = await imageAPI.getImages({ userId: numericUserId, page: 1, pageSize: 16 })
    if (response.data && response.data.list) {
      userImages.value = response.data.list
    }
    ElMessage.success('图片列表已刷新')
  } catch (error) {
    console.error('刷新图片列表失败:', error)
    ElMessage.error('刷新图片列表失败')
  } finally {
    loadingImages.value = false
  }
}

// 预览图片
const previewImage = (image) => {
  // Element Plus 的 el-image 组件会自动处理预览
}

const refreshActivity = async () => {
  try {
    const activitiesResponse = await userAPI.getUserActivities(numericUserId, { page: 1, limit: 10 })
    activities.value = activitiesResponse.data.activities.map(activity => ({
      id: activity.activity_id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      createdAt: activity.created_at
    }))
    ElMessage.success('活动记录已刷新')
  } catch (error) {
    console.error('刷新活动记录失败:', error)
    ElMessage.error('刷新活动记录失败')
  }
}

onMounted(() => {
  console.log('路由参数 userId:', userId, '转换后的数字ID:', numericUserId, '是否有效:', isValidUserId)

  if (isValidUserId) {
    loadUserDetail()
  } else {
    console.error('无效的用户ID:', userId, '转换后:', numericUserId)
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

.header-actions {
  display: flex;
  gap: var(--admin-padding-sm);
}

/* 用户图片样式 */
.images-content {
  min-height: 200px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--admin-padding-md);
}

.image-item {
  cursor: pointer;
  border-radius: var(--admin-border-radius-md);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--admin-box-shadow-hover);
}

.image-thumbnail {
  width: 100%;
  height: 120px;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
}

.image-info {
  padding: var(--admin-padding-sm);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-top: none;
}

.image-title {
  font-size: 0.875rem;
  color: var(--el-text-color-primary);
  margin-bottom: var(--admin-padding-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-time {
  font-size: 0.75rem;
  color: var(--el-text-color-placeholder);
}

.loading-state {
  padding: var(--admin-padding-lg);
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

.error-actions {
  display: flex;
  gap: var(--admin-padding-md);
  justify-content: center;
  flex-wrap: wrap;
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