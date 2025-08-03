<template>
  <div class="system-logs">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">系统日志</h2>
        <p class="page-description">查看系统运行日志和操作记录</p>
      </div>
      <div class="header-right">
        <el-button @click="handleRefresh" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button @click="handleExport" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出日志
        </el-button>
        <el-button type="danger" @click="handleClearLogs">
          <el-icon><Delete /></el-icon>
          清空日志
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filters" inline class="filter-form">
        <el-form-item label="日志级别">
          <el-select v-model="filters.level" placeholder="全部级别" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="错误" value="error" />
            <el-option label="警告" value="warning" />
            <el-option label="信息" value="info" />
            <el-option label="调试" value="debug" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日志类型">
          <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 140px">
            <el-option label="全部" value="" />
            <el-option label="系统" value="system" />
            <el-option label="用户操作" value="user" />
            <el-option label="API调用" value="api" />
            <el-option label="数据库" value="database" />
            <el-option label="文件操作" value="file" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 350px"
          />
        </el-form-item>
        
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索日志内容"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleResetFilters">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card error">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.error }}</div>
              <div class="stat-label">错误日志</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card warning">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.warning }}</div>
              <div class="stat-label">警告日志</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card info">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><InfoFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.info }}</div>
              <div class="stat-label">信息日志</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card total">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总日志数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日志列表 -->
    <el-card class="logs-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>日志记录</span>
          <el-tag type="info">共 {{ pagination.total }} 条记录</el-tag>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="logs"
        stripe
        class="logs-table"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="timestamp" label="时间" width="180" sortable="custom">
          <template #default="{ row }">
            <div class="timestamp">
              <el-icon><Clock /></el-icon>
              {{ formatDate(row.timestamp) }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="level" label="级别" width="80">
          <template #default="{ row }">
            <el-tag
              :type="getLevelType(row.level)"
              size="small"
              class="level-tag"
            >
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getTypeColor(row.type)"
              size="small"
              plain
            >
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="message" label="日志内容" min-width="300">
          <template #default="{ row }">
            <div class="log-message">
              <div class="message-text">{{ row.message }}</div>
              <div v-if="row.details" class="message-details">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="showLogDetails(row)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="user" label="用户" width="120">
          <template #default="{ row }">
            <div v-if="row.user" class="user-info">
              <el-avatar :size="24" :src="row.user.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ row.user.username }}</span>
            </div>
            <span v-else class="system-user">系统</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="ip" label="IP地址" width="130">
          <template #default="{ row }">
            <code class="ip-address">{{ row.ip || '-' }}</code>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="showLogDetails(row)"
            >
              详情
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
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="800px"
      :before-close="handleDetailClose"
    >
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="时间">
            {{ formatDate(currentLog.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="级别">
            <el-tag :type="getLevelType(currentLog.level)">
              {{ getLevelText(currentLog.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getTypeColor(currentLog.type)" plain>
              {{ getTypeText(currentLog.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            {{ currentLog.user?.username || '系统' }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ currentLog.ip || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理">
            {{ currentLog.userAgent || '-' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="log-content">
          <h4>日志内容</h4>
          <div class="message-content">{{ currentLog.message }}</div>
        </div>
        
        <div v-if="currentLog.details" class="log-details">
          <h4>详细信息</h4>
          <el-input
            v-model="currentLog.details"
            type="textarea"
            :rows="8"
            readonly
            class="details-textarea"
          />
        </div>
        
        <div v-if="currentLog.stack" class="log-stack">
          <h4>堆栈信息</h4>
          <el-input
            v-model="currentLog.stack"
            type="textarea"
            :rows="10"
            readonly
            class="stack-textarea"
          />
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Download,
  Delete,
  Search,
  RefreshLeft,
  Warning,
  WarningFilled,
  InfoFilled,
  Document,
  Clock,
  User
} from '@element-plus/icons-vue'
import { systemAPI } from '@/api/system'
import { formatDate } from '@/utils'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const detailDialogVisible = ref(false)
const currentLog = ref(null)

// 筛选条件
const filters = reactive({
  level: '',
  type: '',
  dateRange: [],
  keyword: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 排序信息
const sortInfo = reactive({
  prop: 'timestamp',
  order: 'descending'
})

// 日志数据
const logs = ref([])

// 统计数据
const stats = reactive({
  error: 0,
  warning: 0,
  info: 0,
  total: 0
})

// 计算属性
const searchParams = computed(() => {
  const params = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortBy: sortInfo.prop,
    sortOrder: sortInfo.order === 'ascending' ? 'asc' : 'desc'
  }
  
  if (filters.level) params.level = filters.level
  if (filters.type) params.type = filters.type
  if (filters.keyword) params.keyword = filters.keyword
  if (filters.dateRange && filters.dateRange.length === 2) {
    params.startTime = filters.dateRange[0]
    params.endTime = filters.dateRange[1]
  }
  
  return params
})

// 方法
const getLevelType = (level) => {
  const types = {
    error: 'danger',
    warning: 'warning',
    info: 'info',
    debug: 'success'
  }
  return types[level] || 'info'
}

const getLevelText = (level) => {
  const texts = {
    error: '错误',
    warning: '警告',
    info: '信息',
    debug: '调试'
  }
  return texts[level] || level
}

const getTypeColor = (type) => {
  const colors = {
    system: 'primary',
    user: 'success',
    api: 'warning',
    database: 'danger',
    file: 'info'
  }
  return colors[type] || 'info'
}

const getTypeText = (type) => {
  const texts = {
    system: '系统',
    user: '用户操作',
    api: 'API调用',
    database: '数据库',
    file: '文件操作'
  }
  return texts[type] || type
}

const loadLogs = async () => {
  try {
    loading.value = true
    const response = await systemAPI.getLogs(searchParams.value)
    
    if (response.success && response.data) {
      logs.value = response.data.logs || []
      pagination.total = response.data.total || 0
      
      // 更新统计数据
      if (response.data.stats) {
        Object.assign(stats, response.data.stats)
      }
    }
  } catch (error) {
    console.error('加载日志失败:', error)
    ElMessage.error('加载日志失败')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadLogs()
}

const handleSearch = () => {
  pagination.page = 1
  loadLogs()
}

const handleResetFilters = () => {
  Object.assign(filters, {
    level: '',
    type: '',
    dateRange: [],
    keyword: ''
  })
  pagination.page = 1
  loadLogs()
}

const handleSortChange = ({ prop, order }) => {
  sortInfo.prop = prop
  sortInfo.order = order
  loadLogs()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  loadLogs()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadLogs()
}

const handleExport = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要导出当前筛选条件下的日志吗？',
      '确认导出',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    exporting.value = true
    const response = await systemAPI.exportLogs(searchParams.value)
    
    if (response.success) {
      // 创建下载链接
      const blob = new Blob([response.data], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `system-logs-${new Date().toISOString().slice(0, 10)}.txt`
      link.click()
      window.URL.revokeObjectURL(url)
      
      ElMessage.success('日志导出成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('导出日志失败:', error)
      ElMessage.error('导出日志失败')
    }
  } finally {
    exporting.value = false
  }
}

const handleClearLogs = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有日志吗？此操作不可恢复！',
      '危险操作',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const response = await systemAPI.clearLogs()
    if (response.success) {
      ElMessage.success('日志清空成功')
      loadLogs()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空日志失败:', error)
      ElMessage.error('清空日志失败')
    }
  }
}

const showLogDetails = (log) => {
  currentLog.value = log
  detailDialogVisible.value = true
}

const handleDetailClose = () => {
  detailDialogVisible.value = false
  currentLog.value = null
}

// 生命周期
onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.system-logs {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left h2 {
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

.header-right {
  display: flex;
  gap: 12px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-form {
  margin: 0;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-card.error .stat-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-card.warning .stat-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-card.info .stat-icon {
  background: #f0f9ff;
  color: #409eff;
}

.stat-card.total .stat-icon {
  background: #f5f7fa;
  color: #909399;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.logs-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.logs-table {
  margin-bottom: 16px;
}

.timestamp {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.level-tag {
  font-weight: 600;
}

.log-message {
  line-height: 1.5;
}

.message-text {
  margin-bottom: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 12px;
}

.system-user {
  color: #909399;
  font-style: italic;
}

.ip-address {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.log-detail {
  max-height: 600px;
  overflow-y: auto;
}

.log-content,
.log-details,
.log-stack {
  margin-top: 24px;
}

.log-content h4,
.log-details h4,
.log-stack h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
}

.message-content {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #409eff;
  line-height: 1.6;
}

.details-textarea,
.stack-textarea {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}
</style>
