<template>
  <div class="users-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">用户管理</h2>
        <p class="page-description">管理系统中的所有用户信息</p>
      </div>
      <div class="header-right">
        <el-button type="success" @click="createUser">
          <el-icon><Plus /></el-icon>
          创建用户
        </el-button>
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-card shadow="never">
        <el-form :model="searchForm" inline>
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input
              v-model="searchForm.email"
              placeholder="请输入邮箱"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="活跃" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <!-- 数据表格 -->
    <div class="table-section">
      <el-card shadow="never">
        <!-- 表格工具栏 -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <el-button
              type="danger"
              :disabled="selectedUsers.length === 0"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除 ({{ selectedUsers.length }})
            </el-button>
          </div>
          <div class="toolbar-right">
            <el-tooltip content="密度">
              <el-dropdown @command="handleDensityChange">
                <el-button circle>
                  <el-icon><Operation /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="large">宽松</el-dropdown-item>
                    <el-dropdown-item command="default">默认</el-dropdown-item>
                    <el-dropdown-item command="small">紧凑</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-tooltip>
          </div>
        </div>
        
        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="userList"
          :size="tableSize"
          @selection-change="handleSelectionChange"
          stripe
          border
        >
          <el-table-column type="selection" width="55" align="center" />
          
          <el-table-column label="用户信息" min-width="200">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar :size="32" :src="getImageUrl(row.avatar)">
                  <el-icon><UserIcon /></el-icon>
                </el-avatar>
                <div class="user-details">
                  <div class="username">{{ row.username }}</div>
                  <div class="email">{{ row.email }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="用户ID" prop="id" width="100" align="center" />
          
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                {{ row.status === 'active' ? '活跃' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="图片数量" prop="imageCount" width="100" align="center">
            <template #default="{ row }">
              <el-link type="primary" @click="viewUserImages(row.id)">
                {{ row.imageCount || 0 }}
              </el-link>
            </template>
          </el-table-column>
          
          <el-table-column label="注册时间" width="180" align="center">
            <template #default="{ row }">
              <div class="time-info">
                <div>{{ formatDate(row.createdAt) }}</div>
                <div class="relative-time">{{ getRelativeTime(row.createdAt) }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="最后登录" width="180" align="center">
            <template #default="{ row }">
              <div class="time-info" v-if="row.lastLoginAt">
                <div>{{ formatDate(row.lastLoginAt) }}</div>
                <div class="relative-time">{{ getRelativeTime(row.lastLoginAt) }}</div>
              </div>
              <span v-else class="no-data">从未登录</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="250" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="info"
                size="small"
                @click="viewUserDetail(row)"
              >
                详情
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="toggleUserStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteUser(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
    
    <!-- 用户详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="600px"
      :before-close="handleDetailClose"
    >
      <div v-if="currentUser" class="user-detail">
        <div class="detail-header">
          <el-avatar :size="64" :src="getImageUrl(currentUser.avatar)">
            <el-icon><UserIcon /></el-icon>
          </el-avatar>
          <div class="user-basic">
            <h3>{{ currentUser.username }}</h3>
            <p>{{ currentUser.email }}</p>
            <el-tag :type="currentUser.status === 'active' ? 'success' : 'danger'">
              {{ currentUser.status === 'active' ? '活跃用户' : '已禁用' }}
            </el-tag>
          </div>
        </div>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 'active' ? 'success' : 'danger'">
              {{ currentUser.status === 'active' ? '活跃' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="图片数量">{{ currentUser.imageCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">
            <div class="time-display">
              <div>{{ formatDate(currentUser.createdAt) }}</div>
              <div class="time-relative">{{ getRelativeTime(currentUser.createdAt) }}</div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录">
            <div class="time-display">
              <div>{{ currentUser.lastLoginAt ? formatDate(currentUser.lastLoginAt) : '从未登录' }}</div>
              <div v-if="currentUser.lastLoginAt" class="time-relative">{{ getRelativeTime(currentUser.lastLoginAt) }}</div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="currentUser?.id && viewUserImages(currentUser.id)">
          查看图片
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { userAPI } from '@/utils/api'
import { formatDate, getRelativeTime } from '@/utils'
import {
  Refresh,
  Search,
  RefreshLeft,
  Delete,
  Operation,
  User as UserIcon
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const userList = ref([])
const selectedUsers = ref([])
const tableSize = ref('default')
const detailDialogVisible = ref(false)
const currentUser = ref(null)

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  status: ''
})

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    // 构建查询参数，过滤掉空值
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    
    // 只添加非空的搜索参数
    if (searchForm.username && searchForm.username.trim()) {
      params.username = searchForm.username.trim()
    }
    if (searchForm.email && searchForm.email.trim()) {
      params.email = searchForm.email.trim()
    }
    if (searchForm.status) {
      params.status = searchForm.status
    }

    console.log('前端发送搜索请求，参数:', params)
    console.log('搜索表单数据:', searchForm)
    
    const response = await userAPI.getUsers(params)
    console.log('后端API响应:', response)
    
    if (response.success && response.data) {
      // 映射字段名以匹配模板
      userList.value = (response.data.list || []).map(user => ({
        ...user,
        createdAt: user.created_at,
        lastLoginAt: user.last_login
      }))
      pagination.total = response.data.total || 0
      console.log('用户列表原始数据:', response.data.list)
      console.log('映射后的用户列表:', userList.value)
      console.log('总数:', pagination.total)
      
      // 如果搜索结果为空，显示提示
      if (userList.value.length === 0 && (params.username || params.email || params.status)) {
        ElMessage.info('没有找到符合条件的用户')
      }
    } else {
      console.log('API返回失败状态:', response)
      ElMessage.error(response.message || '获取用户列表失败')
      userList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败，请检查网络连接')
    userList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  console.log('🔍 开始搜索，搜索表单数据:', searchForm)
  pagination.page = 1
  loadUserList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    email: '',
    status: ''
  })
  pagination.page = 1
  loadUserList()
}

// 刷新
const handleRefresh = () => {
  loadUserList()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 改变表格密度
const handleDensityChange = (command) => {
  tableSize.value = command
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  loadUserList()
}

// 当前页变化
const handleCurrentChange = (page) => {
  pagination.page = page
  loadUserList()
}

// 查看用户详情
const viewUserDetail = (user) => {
  router.push(`/users/${user.id}`)
}

// 关闭详情弹窗
const handleDetailClose = () => {
  detailDialogVisible.value = false
  currentUser.value = null
}

// 查看用户图片
const viewUserImages = (userId) => {
  router.push(`/images/list?userId=${userId}`)
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  const action = user.status === 'active' ? '禁用' : '启用'
  const newStatus = user.status === 'active' ? 'disabled' : 'active'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.username}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userAPI.updateUser(user.id, { status: newStatus })
    user.status = newStatus
    ElMessage.success(`${action}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
      console.error('切换用户状态失败:', error)
    }
  }
}

// 删除用户
const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userAPI.deleteUser(user.id)
    ElMessage.success('删除成功')
    loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除用户失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复！`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const userIds = selectedUsers.value.map(user => user.id)
    await userAPI.batchDeleteUsers(userIds)
    ElMessage.success('批量删除成功')
    selectedUsers.value = []
    loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除失败:', error)
    }
  }
}

// 获取完整的图片URL
const getImageUrl = (url) => {
  if (!url) return ''
  // 检查是否为完整的URL（包括http和https）
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // 对于相对路径，添加服务器前缀
  const serverUrl = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:5004'
  return `${serverUrl}${url}`
}

// 初始化
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.users-list {
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

.search-section {
  margin-bottom: var(--admin-padding-lg);
}

.table-section {
  background: var(--el-bg-color);
  border-radius: var(--admin-border-radius-lg);
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--admin-padding-md);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: var(--admin-padding-sm);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--admin-padding-md);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.email {
  font-size: 12px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-info {
  text-align: center;
}

.relative-time {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 2px;
}

.no-data {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--admin-padding-lg);
}

.user-detail {
  padding: var(--admin-padding-md);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--admin-padding-lg);
  margin-bottom: var(--admin-padding-xl);
  padding-bottom: var(--admin-padding-lg);
  border-bottom: 1px solid var(--el-border-color-light);
}

.user-basic h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: var(--el-text-color-primary);
}

.user-basic p {
  margin: 0 0 8px 0;
  color: var(--el-text-color-regular);
}

/* 时间显示样式 */
.time-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-relative {
  color: var(--el-text-color-regular);
  font-size: 0.875rem;
}

/* 表格中的时间显示 */
.time-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.relative-time {
  color: var(--el-text-color-regular);
  font-size: 0.75rem;
}

.no-data {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .users-list {
    padding: var(--admin-padding-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--admin-padding-md);
  }
  
  .header-right {
    align-self: stretch;
  }
  
  .table-toolbar {
    flex-direction: column;
    gap: var(--admin-padding-md);
    align-items: stretch;
  }
  
  .detail-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>