<template>
  <div class="images-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">图片管理</h2>
        <p class="page-description">管理系统中的所有生成图片</p>
      </div>
      <div class="header-right">
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
          <el-form-item label="搜索关键词">
            <el-input
              v-model="searchForm.search"
              placeholder="搜索标题或提示词"
              clearable
              @keyup.enter="handleSearch"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select
              v-model="searchForm.category"
              placeholder="选择分类"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="现实主义" value="realistic" />
              <el-option label="卡通" value="cartoon" />
              <el-option label="抽象" value="abstract" />
              <el-option label="艺术" value="artistic" />
            </el-select>
          </el-form-item>
          <el-form-item label="生成时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              clearable
              style="width: 240px"
            />
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
              :disabled="selectedImages.length === 0"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除 ({{ selectedImages.length }})
            </el-button>
          </div>
          <div class="toolbar-right">
            <el-tooltip content="切换视图">
              <el-button-group>
                <el-button
                  :type="viewMode === 'table' ? 'primary' : 'default'"
                  @click="viewMode = 'table'"
                >
                  <el-icon><List /></el-icon>
                </el-button>
                <el-button
                  :type="viewMode === 'grid' ? 'primary' : 'default'"
                  @click="viewMode = 'grid'"
                >
                  <el-icon><Grid /></el-icon>
                </el-button>
              </el-button-group>
            </el-tooltip>
          </div>
        </div>
        
        <!-- 表格视图 -->
        <el-table
          v-if="viewMode === 'table'"
          v-loading="loading"
          :data="imageList"
          @selection-change="handleSelectionChange"
          stripe
          border
          :height="600"
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" align="center" />
          
          <el-table-column label="图片预览" width="120" align="center">
            <template #default="{ row }">
              <div class="image-preview" @click="previewImage(row)">
                <el-image
                  :src="getImageUrl(row.url || row.thumbnail)"
                  :preview-src-list="[getImageUrl(row.url || row.thumbnail)]"
                  fit="cover"
                  class="preview-img"
                  :preview-teleported="true"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="图片ID" prop="id" width="100" align="center" />
          
          <el-table-column label="用户信息" min-width="150">
            <template #default="{ row }">
              <div class="user-info">
                <div class="user-id">ID: {{ row.user?.id || row.user_id || '未知' }}</div>
                <div class="username">{{ row.user?.username || row.username || '未知用户' }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="标题" min-width="180">
            <template #default="{ row }">
              <el-tooltip :content="row.title" placement="top">
                <div class="title-text">{{ row.title || '无标题' }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          
          <el-table-column label="提示词" min-width="200">
            <template #default="{ row }">
              <el-tooltip :content="row.prompt" placement="top">
                <div class="prompt-text">{{ row.prompt || '无提示词' }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          
          <el-table-column label="分类" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getCategoryType(row.category)">
                {{ getCategoryLabel(row.category) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="图片尺寸" width="120" align="center">
            <template #default="{ row }">
              <div class="image-size">
                {{ (row.width > 0 && row.height > 0) ? `${row.width}×${row.height}` : '未知尺寸' }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="文件大小" width="100" align="center">
            <template #default="{ row }">
              <div class="file-size">
                {{ row.size ? formatFileSize(row.size) : '未知大小' }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="生成时间" width="180" align="center">
            <template #default="{ row }">
              <div class="time-info">
                <div>{{ formatDate(row.created_at) }}</div>
                <div class="relative-time">{{ getRelativeTime(row.created_at) }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                link
                @click="downloadImage(row)"
              >
                下载
              </el-button>
              <el-button
                type="danger"
                size="small"
                link
                @click="deleteImage(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 网格视图 -->
        <div v-else class="grid-view" v-loading="loading">
          <div class="image-grid">
            <div
              v-for="image in imageList"
              :key="image.id"
              class="image-card"
              :class="{ selected: selectedImages.some(item => item.id === image.id) }"
            >
              <!-- 选择框 -->
              <div class="card-checkbox">
                <el-checkbox
                  :model-value="selectedImages.some(item => item.id === image.id)"
                  @change="toggleImageSelection(image)"
                />
              </div>
              
              <!-- 图片 -->
              <div class="card-image">
                <el-image
                  :src="getImageUrl(image.url || image.thumbnail)"
                  :preview-src-list="[getImageUrl(image.url || image.thumbnail)]"
                  :preview-teleported="true"
                  fit="cover"
                  class="grid-img"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              
              <!-- 信息 -->
              <div class="card-info" @click="handleCardClick(image)" title="点击查看3D效果">
                <div class="card-title">{{ image.title || `ID: ${image.id}` }}</div>
                <div class="card-user">用户: {{ image.user?.username || image.username || image.user?.id || image.user_id || '未知' }}</div>
                <div class="card-prompt">{{ image.prompt || '无提示词' }}</div>
                <div class="card-meta">
                  <span class="card-category">{{ getCategoryLabel(image.category) }}</span>
                  <span class="card-size">{{ (image.width > 0 && image.height > 0) ? `${image.width}×${image.height}` : '未知尺寸' }}</span>
                </div>
                <div class="card-time">{{ getRelativeTime(image.created_at) }}</div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="card-actions">
                <el-button size="small" @click="downloadImage(image)">
                  <el-icon><Download /></el-icon>
                </el-button>
                <el-button size="small" type="danger" @click="deleteImage(image)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[12, 24, 48, 96]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { imageAPI } from '@/utils/api'
import { formatDate, getRelativeTime, formatFileSize } from '@/utils'
import {
  Refresh,
  Search,
  RefreshLeft,
  Delete,
  List,
  Grid,
  Picture,
  Download
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const imageList = ref([])
const selectedImages = ref([])
const viewMode = ref('table')

// 搜索表单
const searchForm = reactive({
  search: '',
  category: '',
  dateRange: null
})

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 24,
  total: 0
})

/**
 * 获取完整的图片URL
 * @param {string} url - 相对URL路径
 * @returns {string} 完整的图片URL
 */
const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const serverUrl = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:5004'
  return `${serverUrl}${url}`
}



/**
 * 获取分类标签
 * @param {string} category - 分类值
 * @returns {string} 分类标签
 */
const getCategoryLabel = (category) => {
  const categoryMap = {
    realistic: '现实主义',
    cartoon: '卡通',
    abstract: '抽象',
    artistic: '艺术'
  }
  return categoryMap[category] || category || '未分类'
}

/**
 * 获取分类标签类型
 * @param {string} category - 分类值
 * @returns {string} Element Plus 标签类型
 */
const getCategoryType = (category) => {
  const typeMap = {
    realistic: 'primary',
    cartoon: 'success',
    abstract: 'warning',
    artistic: 'danger'
  }
  return typeMap[category] || 'info'
}

/**
 * 下载文件
 * @param {string} url - 文件URL
 * @param {string} filename - 文件名
 */
const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('下载失败:', error)
    throw error
  }
}

// 加载图片列表
const loadImageList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.pageSize,
      search: searchForm.search || undefined,
      category: searchForm.category || undefined
    }

    // 添加日期范围参数
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    console.log('前端调用图片列表API，参数:', params)
    const response = await imageAPI.getImages(params)
    console.log('前端收到图片列表响应:', response)

    if (response.success && response.data) {
      imageList.value = response.data.list || response.data.images || []
      pagination.total = response.data.pagination?.total || response.data.total || 0
      console.log('前端处理后的图片列表:', imageList.value)

      // 调试：检查第一条数据的详细信息
      if (imageList.value.length > 0) {
        const firstImage = imageList.value[0];
        console.log('第一条图片数据详情:', {
          id: firstImage.id,
          width: firstImage.width,
          height: firstImage.height,
          size: firstImage.size,
          created_at: firstImage.created_at,
          widthType: typeof firstImage.width,
          heightType: typeof firstImage.height,
          sizeType: typeof firstImage.size,
          formatDate: formatDate(firstImage.created_at),
          formatFileSize: formatFileSize(firstImage.size)
        });
      }
    } else {
      ElMessage.error(response.message || '加载图片列表失败')
    }
  } catch (error) {
    ElMessage.error('加载图片列表失败')
    console.error('加载图片列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadImageList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    search: '',
    category: '',
    dateRange: null
  })
  pagination.page = 1
  loadImageList()
}

// 刷新
const handleRefresh = () => {
  loadImageList()
}

// 选择变化（表格模式）
const handleSelectionChange = (selection) => {
  selectedImages.value = selection
}

// 切换图片选择（网格模式）
const toggleImageSelection = (image) => {
  const index = selectedImages.value.findIndex(item => item.id === image.id)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(image)
  }
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  loadImageList()
}

// 当前页变化
const handleCurrentChange = (page) => {
  pagination.page = page
  loadImageList()
}

// 预览图片
const previewImage = (image) => {
  // Element Plus 的 el-image 组件会自动处理预览
}

// 下载图片
const downloadImage = async (image) => {
  try {
    const imageUrl = getImageUrl(image.url || image.thumbnail)
    if (imageUrl) {
      await downloadFile(imageUrl, `image_${image.id}.png`)
      ElMessage.success('下载成功')
    } else {
      ElMessage.error('图片链接不存在')
    }
  } catch (error) {
    ElMessage.error('下载失败')
    console.error('下载图片失败:', error)
  }
}

// 删除图片
const deleteImage = async (image) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除图片 "${image.title || `ID: ${image.id}`}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await imageAPI.deleteImage(image.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadImageList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除图片失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedImages.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedImages.value.length} 张图片吗？此操作不可恢复！`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const imageIds = selectedImages.value.map(image => image.id)
    const response = await imageAPI.batchDeleteImages(imageIds)
    if (response.success) {
      ElMessage.success('批量删除成功')
      selectedImages.value = []
      loadImageList()
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除失败:', error)
    }
  }
}

// 初始化
onMounted(() => {
  loadImageList()
})
</script>

<style scoped>
.images-list {
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
  overflow: hidden;
}

/* 表格滚动条样式 */
.el-table .el-table__body-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.el-table .el-table__body-wrapper::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.el-table .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: var(--el-fill-color-dark);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.el-table .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--el-color-primary);
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

/* 表格视图样式 */
.image-preview {
  cursor: pointer;
}

.preview-img {
  width: 80px;
  height: 80px;
  border-radius: var(--admin-border-radius);
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--el-fill-color-light);
  border-radius: var(--admin-border-radius);
  color: var(--el-text-color-placeholder);
}

.user-info {
  text-align: left;
}

.user-id {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 2px;
}

.username {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.prompt-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

.image-size,
.file-size {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.time-info {
  text-align: center;
}

.relative-time {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 2px;
}

/* 网格视图样式 */
.grid-view {
  height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--admin-padding-lg);
  margin-bottom: var(--admin-padding-lg);
}

/* 自定义滚动条样式 */
.grid-view::-webkit-scrollbar {
  width: 8px;
}

.grid-view::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.grid-view::-webkit-scrollbar-thumb {
  background: var(--el-fill-color-dark);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.grid-view::-webkit-scrollbar-thumb:hover {
  background: var(--el-color-primary);
}

.image-card {
  position: relative;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--admin-border-radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--admin-box-shadow-hover);
}

.image-card.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.card-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.grid-img {
  width: 100%;
  height: 100%;
}

.card-info {
  padding: var(--admin-padding-md);
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.3s ease;
  cursor: pointer;
  border-radius: 0 0 var(--admin-border-radius-lg) var(--admin-border-radius-lg);
}

.card-info:hover {
  background: rgba(64, 158, 255, 0.05);
}

.card-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.card-user {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.card-prompt {
  font-size: 13px;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.card-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-card:hover .card-actions {
  opacity: 1;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--admin-padding-lg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .images-list {
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

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--admin-padding-md);
  }

  .grid-view {
    height: 500px;
    padding-right: 4px;
  }

  .el-table {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .image-grid {
    grid-template-columns: 1fr;
  }

  .grid-view {
    height: 450px;
    padding-right: 2px;
  }

  /* 移动端滚动条更细 */
  .grid-view::-webkit-scrollbar {
    width: 4px;
  }

  .el-table .el-table__body-wrapper::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
}
</style>