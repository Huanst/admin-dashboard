<template>
  <div class="generate-form">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">AI图片生成</h2>
        <p class="page-description">使用AI技术生成高质量图片</p>
      </div>
    </div>

    <div class="generate-container">
      <!-- 生成表单 -->
      <div class="form-section">
        <el-card shadow="never" class="form-card">
          <template #header>
            <div class="card-header">
              <span>生成配置</span>
            </div>
          </template>
          
          <el-form
            ref="generateFormRef"
            :model="generateForm"
            :rules="generateRules"
            label-width="120px"
            class="generate-form-content"
          >
            <el-form-item label="图片描述" prop="prompt">
              <el-input
                v-model="generateForm.prompt"
                type="textarea"
                :rows="4"
                placeholder="请输入图片描述，例如：一幅美丽的山水画，有蓝天白云和清澈的湖水"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="图片尺寸" prop="image_size">
                  <el-select v-model="generateForm.image_size" placeholder="选择图片尺寸">
                    <el-option label="1024x1024 (正方形)" value="1024x1024" />
                    <el-option label="1280x1280 (大正方形)" value="1280x1280" />
                    <el-option label="1024x768 (横向)" value="1024x768" />
                    <el-option label="768x1024 (纵向)" value="768x1024" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="AI模型" prop="model">
                  <el-select v-model="generateForm.model" placeholder="选择AI模型">
                    <el-option label="FLUX.1-schnell (快速)" value="black-forest-labs/FLUX.1-schnell" />
                    <el-option label="Kolors (高质量)" value="Kwai-Kolors/Kolors" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="生成数量" prop="batch_size">
                  <el-input-number
                    v-model="generateForm.batch_size"
                    :min="1"
                    :max="4"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="随机种子">
                  <el-input-number
                    v-model="generateForm.seed"
                    :min="0"
                    :max="999999999"
                    controls-position="right"
                    placeholder="留空随机生成"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="generating"
                @click="handleGenerate"
                class="generate-btn"
              >
                <el-icon v-if="!generating"><Picture /></el-icon>
                {{ generating ? '生成中...' : '开始生成' }}
              </el-button>
              <el-button size="large" @click="handleReset">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 生成结果 -->
      <div class="result-section">
        <el-card shadow="never" class="result-card">
          <template #header>
            <div class="card-header">
              <span>生成结果</span>
              <el-button
                v-if="generatedImages.length > 0"
                type="text"
                @click="clearResults"
              >
                清空
              </el-button>
            </div>
          </template>

          <div v-if="generating" class="generating-status">
            <el-skeleton :rows="3" animated />
            <div class="progress-info">
              <el-progress :percentage="progress" :show-text="false" />
              <p>{{ progressText }}</p>
            </div>
          </div>

          <div v-else-if="generatedImages.length === 0" class="empty-result">
            <el-empty description="暂无生成结果">
              <template #image>
                <el-icon size="60" color="#dcdfe6"><Picture /></el-icon>
              </template>
            </el-empty>
          </div>

          <div v-else class="image-grid">
            <div
              v-for="(image, index) in generatedImages"
              :key="index"
              class="image-item"
            >
              <div class="image-wrapper">
                <el-image
                  :src="image.url"
                  :preview-src-list="[image.url]"
                  fit="cover"
                  class="generated-image"
                  :loading="'lazy'"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>加载失败</span>
                    </div>
                  </template>
                </el-image>
                <div class="image-overlay">
                  <el-button-group>
                    <el-button
                      type="primary"
                      size="small"
                      @click="downloadImage(image)"
                    >
                      <el-icon><Download /></el-icon>
                    </el-button>
                    <el-button
                      type="info"
                      size="small"
                      @click="copyImageUrl(image.url)"
                    >
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </el-button-group>
                </div>
              </div>
              <div class="image-info">
                <p class="image-prompt">{{ image.prompt }}</p>
                <div class="image-meta">
                  <span>{{ image.size }}</span>
                  <span>{{ image.model }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 生成历史 -->
    <div class="history-section">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>生成历史</span>
            <el-button type="text" @click="loadHistory">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>

        <div v-loading="historyLoading">
          <div v-if="historyList.length === 0" class="empty-history">
            <el-empty description="暂无生成历史" />
          </div>
          <div v-else class="history-grid">
            <div
              v-for="item in historyList"
              :key="item.id"
              class="history-item"
              @click="viewHistoryDetail(item)"
            >
              <el-image
                :src="item.thumbnail || item.url"
                fit="cover"
                class="history-image"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="history-info">
                <p class="history-prompt">{{ item.prompt }}</p>
                <p class="history-time">{{ formatDate(item.created_at) }}</p>
              </div>
            </div>
          </div>

          <div v-if="historyList.length > 0" class="history-pagination">
            <el-pagination
              v-model:current-page="historyPagination.page"
              v-model:page-size="historyPagination.pageSize"
              :total="historyPagination.total"
              :page-sizes="[12, 24, 48]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleHistorySizeChange"
              @current-change="handleHistoryCurrentChange"
            />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { generateAPI } from '@/api'
import { formatDate } from '@/utils'

// 表单引用
const generateFormRef = ref<FormInstance>()

// 生成表单数据
const generateForm = reactive({
  prompt: '',
  image_size: '1024x1024',
  model: 'black-forest-labs/FLUX.1-schnell',
  batch_size: 1,
  seed: null as number | null
})

// 表单验证规则
const generateRules: FormRules = {
  prompt: [
    { required: true, message: '请输入图片描述', trigger: 'blur' },
    { min: 5, max: 500, message: '描述长度应为5-500个字符', trigger: 'blur' }
  ],
  image_size: [
    { required: true, message: '请选择图片尺寸', trigger: 'change' }
  ],
  model: [
    { required: true, message: '请选择AI模型', trigger: 'change' }
  ],
  batch_size: [
    { required: true, message: '请设置生成数量', trigger: 'change' }
  ]
}

// 生成状态
const generating = ref(false)
const progress = ref(0)
const progressText = ref('')

// 生成结果
const generatedImages = ref<any[]>([])

// 历史记录
const historyLoading = ref(false)
const historyList = ref<any[]>([])
const historyPagination = reactive({
  page: 1,
  pageSize: 12,
  total: 0
})

// 处理生成
const handleGenerate = async () => {
  if (!generateFormRef.value) return
  
  const valid = await generateFormRef.value.validate().catch(() => false)
  if (!valid) return

  generating.value = true
  progress.value = 0
  progressText.value = '准备生成...'

  try {
    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 10
        if (progress.value < 30) {
          progressText.value = '正在处理提示词...'
        } else if (progress.value < 60) {
          progressText.value = 'AI模型生成中...'
        } else {
          progressText.value = '图片渲染中...'
        }
      }
    }, 500)

    const response = await generateAPI.generateImage(generateForm)
    
    clearInterval(progressInterval)
    progress.value = 100
    progressText.value = '生成完成！'

    if (response.status === 'success') {
      // 处理生成结果
      const newImages = Array.isArray(response.data) ? response.data : [response.data]
      generatedImages.value.unshift(...newImages.map(img => ({
        ...img,
        prompt: generateForm.prompt,
        size: generateForm.image_size,
        model: generateForm.model
      })))
      
      ElMessage.success(`成功生成 ${newImages.length} 张图片`)
      
      // 刷新历史记录
      loadHistory()
    } else {
      throw new Error(response.message || '生成失败')
    }
  } catch (error: any) {
    console.error('生成图片失败:', error)
    ElMessage.error(error.message || '生成失败，请稍后重试')
  } finally {
    generating.value = false
    setTimeout(() => {
      progress.value = 0
      progressText.value = ''
    }, 2000)
  }
}

// 重置表单
const handleReset = () => {
  generateFormRef.value?.resetFields()
  generateForm.seed = null
}

// 清空结果
const clearResults = () => {
  generatedImages.value = []
}

// 下载图片
const downloadImage = (image: any) => {
  const link = document.createElement('a')
  link.href = image.url
  link.download = `generated-${Date.now()}.png`
  link.click()
}

// 复制图片链接
const copyImageUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('图片链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 加载历史记录
const loadHistory = async () => {
  historyLoading.value = true
  try {
    const response = await generateAPI.getGenerationHistory({
      page: historyPagination.page,
      pageSize: historyPagination.pageSize
    })
    
    if (response.status === 'success') {
      historyList.value = response.data.list || []
      historyPagination.total = response.data.total || 0
    }
  } catch (error: any) {
    console.error('加载历史记录失败:', error)
    ElMessage.error('加载历史记录失败')
  } finally {
    historyLoading.value = false
  }
}

// 查看历史详情
const viewHistoryDetail = (item: any) => {
  // 将历史记录添加到当前结果中
  const existingIndex = generatedImages.value.findIndex(img => img.id === item.id)
  if (existingIndex === -1) {
    generatedImages.value.unshift({
      ...item,
      prompt: item.prompt,
      size: item.image_size || '1024x1024',
      model: item.model || 'unknown'
    })
  }
}

// 历史分页处理
const handleHistorySizeChange = (size: number) => {
  historyPagination.pageSize = size
  historyPagination.page = 1
  loadHistory()
}

const handleHistoryCurrentChange = (page: number) => {
  historyPagination.page = page
  loadHistory()
}

// 组件挂载时加载历史记录
onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.generate-form {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.page-description {
  color: var(--el-text-color-regular);
  margin: 0;
}

.generate-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-card,
.result-card {
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.generate-form-content {
  padding: 0;
}

.generate-btn {
  width: 200px;
}

.generating-status {
  text-align: center;
  padding: 40px 20px;
}

.progress-info {
  margin-top: 20px;
}

.progress-info p {
  margin-top: 10px;
  color: var(--el-text-color-regular);
}

.empty-result {
  padding: 40px 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  position: relative;
  aspect-ratio: 1;
}

.generated-image {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-info {
  padding: 12px;
}

.image-prompt {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.image-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-placeholder);
}

.history-section {
  margin-top: 24px;
}

.empty-history {
  padding: 40px 20px;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.history-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
}

.history-image {
  width: 100%;
  aspect-ratio: 1;
}

.history-info {
  padding: 8px;
}

.history-prompt {
  font-size: 11px;
  color: var(--el-text-color-regular);
  margin: 0 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-time {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  margin: 0;
}

.history-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .generate-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .history-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>