<template>
  <div class="system-logs">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">系统日志</h2>
        <p class="page-description">查看系统运行日志和操作记录</p>
      </div>
      <div class="header-right">
        <el-button 
          :type="isRealTimeMode ? 'success' : 'default'"
          @click="toggleRealTimeMode"
        >
          <el-icon><Clock /></el-icon>
          {{ isRealTimeMode ? '实时监听中' : '实时监听' }}
        </el-button>
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
      <template #header>
        <div class="filter-header">
          <span>筛选条件</span>
          <el-button
            type="primary"
            link
            size="small"
            @click="toggleAdvancedFilters"
          >
            {{ showAdvancedFilters ? '简单筛选' : '高级筛选' }}
          </el-button>
        </div>
      </template>
      
      <el-form :model="filters" inline class="filter-form">
        <!-- 基础筛选 -->
        <div class="basic-filters">
          <el-form-item label="日志级别">
            <el-select v-model="filters.level" placeholder="全部级别" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="错误" value="error">
                <div class="level-option error">
                  <el-icon><Warning /></el-icon>
                  <span>错误</span>
                </div>
              </el-option>
              <el-option label="警告" value="warning">
                <div class="level-option warning">
                  <el-icon><WarningFilled /></el-icon>
                  <span>警告</span>
                </div>
              </el-option>
              <el-option label="信息" value="info">
                <div class="level-option info">
                  <el-icon><InfoFilled /></el-icon>
                  <span>信息</span>
                </div>
              </el-option>
              <el-option label="调试" value="debug">
                <div class="level-option debug">
                  <el-icon><Document /></el-icon>
                  <span>调试</span>
                </div>
              </el-option>
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
          
          <el-form-item label="关键词">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索日志内容"
              style="width: 200px"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
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
        </div>

        <!-- 高级筛选 -->
        <div v-show="showAdvancedFilters" class="advanced-filters">
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
          
          <el-form-item label="快速时间">
            <el-button-group>
              <el-button size="small" @click="setQuickTimeRange('1h')">1小时</el-button>
              <el-button size="small" @click="setQuickTimeRange('24h')">24小时</el-button>
              <el-button size="small" @click="setQuickTimeRange('7d')">7天</el-button>
              <el-button size="small" @click="setQuickTimeRange('30d')">30天</el-button>
            </el-button-group>
          </el-form-item>
          
          <el-form-item label="IP地址">
            <el-input
              v-model="filters.ip"
              placeholder="筛选IP地址"
              style="width: 150px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="用户名">
            <el-input
              v-model="filters.username"
              placeholder="筛选用户"
              style="width: 120px"
              clearable
            />
          </el-form-item>
        </div>
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
              <div class="message-text" :class="{ 'message-highlight': isHighlighted(row.message) }">
                <span v-if="filters.keyword" v-html="highlightKeyword(row.message)"></span>
                <span v-else>{{ row.message }}</span>
              </div>
              <div v-if="row.details || row.stack" class="message-actions">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="showLogDetails(row)"
                >
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
                <el-button
                  v-if="row.level === 'error'"
                  type="danger"
                  link
                  size="small"
                  @click="copyLogToClipboard(row)"
                >
                  <el-icon><DocumentCopy /></el-icon>
                  复制
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
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
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
  User,
  View,
  DocumentCopy
} from '@element-plus/icons-vue'
import { systemAPI } from '@/utils/api'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const detailDialogVisible = ref(false)
const currentLog = ref(null)
const showAdvancedFilters = ref(false)

// 筛选条件
const filters = reactive({
  level: '',
  type: '',
  dateRange: [],
  keyword: '',
  ip: '',
  username: ''
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
  if (filters.ip) params.ip = filters.ip
  if (filters.username) params.username = filters.username
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

// 日期格式化函数
const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const loadLogs = async () => {
  try {
    loading.value = true
    const response = await systemAPI.getSystemLogs(searchParams.value)
    
    if (response.success && response.data) {
      logs.value = response.data.logs || []
      pagination.total = response.data.total || 0
      
      // 更新统计数据
      if (response.data.stats) {
        Object.assign(stats, response.data.stats)
      } else {
        // 如果没有统计数据，从日志数据中计算
        calculateStats()
      }
    } else {
      // 如果API调用失败，使用模拟数据
      loadMockLogs()
    }
  } catch (error) {
    console.error('加载日志失败:', error)
    ElMessage.warning('使用模拟数据展示')
    loadMockLogs()
  } finally {
    loading.value = false
  }
}

// 从日志数据计算统计信息
const calculateStats = () => {
  const totalLogs = logs.value
  stats.error = totalLogs.filter(log => log.level === 'error').length
  stats.warning = totalLogs.filter(log => log.level === 'warning').length
  stats.info = totalLogs.filter(log => log.level === 'info').length
  stats.total = totalLogs.length
}

// 模拟日志数据
const loadMockLogs = () => {
  const mockLogs = generateMockLogs()
  logs.value = mockLogs.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
  pagination.total = mockLogs.length
  calculateStats()
}

// 生成模拟日志数据
const generateMockLogs = () => {
  const levels = ['error', 'warning', 'info', 'debug']
  const types = ['system', 'user', 'api', 'database', 'file']
  const messages = {
    error: [
      '数据库连接失败',
      '文件上传错误',
      'API调用超时',
      '用户认证失败',
      '系统内存不足',
      '图片生成失败',
      '网络连接中断'
    ],
    warning: [
      '磁盘空间不足',
      '缓存清理失败',
      '配置文件格式错误',
      '第三方服务响应慢',
      '用户权限不足',
      'API调用频率过高',
      '临时文件清理'
    ],
    info: [
      '用户登录成功',
      '系统启动完成',
      '定时任务执行',
      '配置更新成功',
      '数据备份完成',
      '图片生成成功',
      '用户注册完成'
    ],
    debug: [
      'SQL查询执行',
      '缓存命中',
      '请求处理完成',
      '文件读取成功',
      '任务队列处理',
      'API响应时间记录',
      '系统性能监控'
    ]
  }

  const users = [
    { username: 'admin', avatar: '/uploads/admin-avatar.jpg' },
    { username: 'user1', avatar: '/uploads/user1-avatar.jpg' },
    { username: 'user2', avatar: '/uploads/user2-avatar.jpg' },
    null // 系统日志
  ]

  const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '127.0.0.1', '203.119.123.45']

  const mockLogs = []
  const now = new Date()

  for (let i = 0; i < 500; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const messageList = messages[level]
    const message = messageList[Math.floor(Math.random() * messageList.length)]
    const user = users[Math.floor(Math.random() * users.length)]
    const ip = ips[Math.floor(Math.random() * ips.length)]

    // 生成过去7天内的随机时间
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)

    const log = {
      id: i + 1,
      timestamp: timestamp.toISOString(),
      level,
      type,
      message,
      user,
      ip,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    // 为错误日志添加详细信息和堆栈
    if (level === 'error') {
      log.details = JSON.stringify({
        errorCode: 'E' + Math.floor(Math.random() * 9999).toString().padStart(4, '0'),
        module: type,
        function: 'processRequest',
        line: Math.floor(Math.random() * 1000) + 1
      }, null, 2)

      log.stack = `Error: ${message}
    at processRequest (/app/src/${type}.js:${Math.floor(Math.random() * 100) + 1}:${Math.floor(Math.random() * 50) + 1})
    at handleRequest (/app/src/router.js:${Math.floor(Math.random() * 100) + 1}:${Math.floor(Math.random() * 50) + 1})
    at Server.app (/app/server.js:${Math.floor(Math.random() * 100) + 1}:${Math.floor(Math.random() * 50) + 1})`
    }

    mockLogs.push(log)
  }

  // 按时间倒序排列
  mockLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return mockLogs
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
    keyword: '',
    ip: '',
    username: ''
  })
  pagination.page = 1
  loadLogs()
}

// 切换高级筛选
const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

// 快速设置时间范围
const setQuickTimeRange = (range) => {
  const now = new Date()
  const start = new Date()
  
  switch (range) {
    case '1h':
      start.setHours(now.getHours() - 1)
      break
    case '24h':
      start.setDate(now.getDate() - 1)
      break
    case '7d':
      start.setDate(now.getDate() - 7)
      break
    case '30d':
      start.setDate(now.getDate() - 30)
      break
  }
  
  filters.dateRange = [
    start.toISOString().slice(0, 19).replace('T', ' '),
    now.toISOString().slice(0, 19).replace('T', ' ')
  ]
  
  handleSearch()
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
    
    try {
      const response = await systemAPI.exportSystemLogs(searchParams.value)
      
      if (response.success && response.data) {
        // 创建下载链接
        const blob = new Blob([response.data], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `system-logs-${new Date().toISOString().slice(0, 10)}.txt`
        link.click()
        window.URL.revokeObjectURL(url)
        
        ElMessage.success('日志导出成功')
      } else {
        throw new Error('导出失败')
      }
    } catch (apiError) {
      // 如果API失败，导出当前显示的日志
      exportCurrentLogs()
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

// 导出当前显示的日志
const exportCurrentLogs = () => {
  const logText = logs.value.map(log => {
    let text = `[${formatDate(log.timestamp)}] [${getLevelText(log.level).toUpperCase()}] [${getTypeText(log.type)}] ${log.message}`
    if (log.user) {
      text += ` - 用户: ${log.user.username}`
    }
    if (log.ip) {
      text += ` - IP: ${log.ip}`
    }
    if (log.details) {
      text += `\n详细信息: ${log.details}`
    }
    if (log.stack) {
      text += `\n堆栈信息:\n${log.stack}`
    }
    return text
  }).join('\n\n')

  const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `system-logs-${new Date().toISOString().slice(0, 10)}.txt`
  link.click()
  window.URL.revokeObjectURL(url)
  
  ElMessage.success('日志导出成功')
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
    
    try {
      const response = await systemAPI.clearSystemLogs()
      if (response.success) {
        ElMessage.success('日志清空成功')
        loadLogs()
      } else {
        throw new Error('清空失败')
      }
    } catch (apiError) {
      // 如果API失败，清空当前显示的日志
      logs.value = []
      pagination.total = 0
      stats.error = 0
      stats.warning = 0
      stats.info = 0
      stats.total = 0
      ElMessage.success('当前日志已清空')
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

// 高亮关键词
const highlightKeyword = (text) => {
  if (!filters.keyword || !text) return text
  const keyword = filters.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark class="keyword-highlight">$1</mark>')
}

// 检查是否包含关键词
const isHighlighted = (text) => {
  return filters.keyword && text && text.toLowerCase().includes(filters.keyword.toLowerCase())
}

// 复制日志到剪贴板
const copyLogToClipboard = async (log) => {
  try {
    let text = `[${formatDate(log.timestamp)}] [${getLevelText(log.level).toUpperCase()}] ${log.message}`
    if (log.details) {
      text += `\n详细信息: ${log.details}`
    }
    if (log.stack) {
      text += `\n堆栈信息:\n${log.stack}`
    }
    
    await navigator.clipboard.writeText(text)
    ElMessage.success('日志已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 实时监听日志（模拟）
const isRealTimeMode = ref(false)
let realTimeInterval = null

const toggleRealTimeMode = () => {
  isRealTimeMode.value = !isRealTimeMode.value
  
  if (isRealTimeMode.value) {
    startRealTimeUpdates()
    ElMessage.info('已开启实时监听')
  } else {
    stopRealTimeUpdates()
    ElMessage.info('已关闭实时监听')
  }
}

const startRealTimeUpdates = () => {
  realTimeInterval = setInterval(() => {
    // 模拟新日志
    if (Math.random() > 0.7) {
      addMockLogEntry()
    }
  }, 5000) // 每5秒检查一次
}

const stopRealTimeUpdates = () => {
  if (realTimeInterval) {
    clearInterval(realTimeInterval)
    realTimeInterval = null
  }
}

const addMockLogEntry = () => {
  const levels = ['info', 'warning', 'error']
  const types = ['system', 'user', 'api']
  const messages = [
    '用户登录成功',
    '文件上传完成',
    'API调用异常',
    '数据库连接超时',
    '缓存更新完成'
  ]
  
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    type: types[Math.floor(Math.random() * types.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    user: Math.random() > 0.5 ? { username: 'user' + Math.floor(Math.random() * 100), avatar: '' } : null,
    ip: '192.168.1.' + Math.floor(Math.random() * 255)
  }
  
  logs.value.unshift(newLog)
  pagination.total += 1
  
  // 限制显示的日志数量
  if (logs.value.length > pagination.pageSize) {
    logs.value.pop()
  }
  
  // 更新统计
  calculateStats()
}

// 生命周期
onMounted(() => {
  loadLogs()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopRealTimeUpdates()
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

/* 新增样式 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.basic-filters,
.advanced-filters {
  margin-top: 16px;
}

.advanced-filters {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.level-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-option.error {
  color: #f56c6c;
}

.level-option.warning {
  color: #e6a23c;
}

.level-option.info {
  color: #409eff;
}

.level-option.debug {
  color: #67c23a;
}

.message-highlight {
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  padding-left: 8px;
}

:deep(.keyword-highlight) {
  background: #ffeb3b;
  color: #333;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 600;
}

.message-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.log-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.log-detail .el-descriptions {
  margin-bottom: 20px;
}

/* 实时监听动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(67, 194, 58, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(67, 194, 58, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(67, 194, 58, 0);
  }
}

.header-right .el-button--success {
  animation: pulse 2s infinite;
}

/* 表格行高亮 */
:deep(.el-table__row:hover) {
  background: #f5f7fa !important;
}

:deep(.el-table__row.error-row) {
  background: #fef0f0 !important;
}

:deep(.el-table__row.warning-row) {
  background: #fdf6ec !important;
}

/* 统计卡片hover效果 */
.stat-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .system-logs {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .filter-form {
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .stats-row .el-col {
    margin-bottom: 16px;
  }
  
  .logs-table {
    font-size: 12px;
  }
  
  .timestamp {
    font-size: 10px;
  }
}
</style>
