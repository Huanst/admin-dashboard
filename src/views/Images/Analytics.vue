<template>
  <div class="images-analytics">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">图片生成分析</h2>
        <p class="page-description">分析图片生成趋势和用户行为数据</p>
      </div>
      <div class="header-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.key">
        <div class="stat-content">
          <div class="stat-info">
            <h3 class="stat-title">{{ stat.title }}</h3>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-change" :class="stat.changeType">
              <el-icon>
                <component :is="stat.changeType === 'increase' ? 'TrendCharts' : 'Bottom'" />
              </el-icon>
              <span>{{ stat.change }}</span>
            </div>
          </div>
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <el-icon :size="24">
              <component :is="stat.icon" />
            </el-icon>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 生成趋势图 -->
      <div class="chart-row">
        <el-card class="chart-card full-width" shadow="never">
          <template #header>
            <div class="chart-header">
              <h3>图片生成趋势</h3>
              <el-radio-group v-model="trendPeriod" size="small" @change="loadTrendData">
                <el-radio-button value="7d">7天</el-radio-button>
        <el-radio-button value="30d">30天</el-radio-button>
        <el-radio-button value="90d">90天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-content">
            <div ref="trendChart" class="chart"></div>
          </div>
        </el-card>
      </div>
      
      <!-- 分布图表 -->
      <div class="chart-row">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <h3>用户生成分布</h3>
          </template>
          <div class="chart-content">
            <div ref="userDistributionChart" class="chart"></div>
          </div>
        </el-card>
        
        <el-card class="chart-card" shadow="never">
          <template #header>
            <h3>时段分布</h3>
          </template>
          <div class="chart-content">
            <div ref="hourDistributionChart" class="chart"></div>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 热门提示词和数据表格 -->
    <div class="bottom-section">
      <!-- 热门提示词 -->
      <el-card class="popular-prompts" shadow="never">
        <template #header>
          <div class="card-header">
            <h3>热门提示词</h3>
            <el-button type="primary" link @click="exportPrompts">
              导出数据
            </el-button>
          </div>
        </template>
        <div class="prompts-list">
          <div 
            v-for="(prompt, index) in popularPrompts" 
            :key="prompt.id"
            class="prompt-item"
          >
            <div class="prompt-rank">{{ index + 1 }}</div>
            <div class="prompt-content">
              <div class="prompt-text">{{ prompt.text }}</div>
              <div class="prompt-meta">
                <span class="prompt-count">{{ prompt.count }}次使用</span>
                <span class="prompt-users">{{ prompt.userCount }}个用户</span>
              </div>
            </div>
            <div class="prompt-trend">
              <el-tag :type="prompt.trend > 0 ? 'success' : prompt.trend < 0 ? 'danger' : 'info'" size="small">
                {{ prompt.trend > 0 ? '+' : '' }}{{ prompt.trend }}%
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 最近生成记录 -->
      <el-card class="recent-generations" shadow="never">
        <template #header>
          <div class="card-header">
            <h3>最近生成记录</h3>
            <el-button type="primary" link @click="viewAllGenerations">
              查看全部
            </el-button>
          </div>
        </template>
        <div class="generations-list">
          <div 
            v-for="generation in recentGenerations" 
            :key="generation.id"
            class="generation-item"
          >
            <div class="generation-image">
              <el-image
                :src="generation.imageUrl"
                fit="cover"
                class="thumb-img"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="generation-info">
              <div class="generation-prompt">{{ generation.prompt }}</div>
              <div class="generation-meta">
                <span>用户: {{ generation.username || generation.userId }}</span>
                <span>{{ formatRelativeTime(generation.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '@/stores/theme'
import { dashboardAPI, imageAPI, analyticsAPI } from '@/utils/api'
import { formatRelativeTime, downloadFile } from '@/utils'
import {
  Refresh,
  TrendCharts,
  Bottom,
  Picture,
  Calendar,
  DataAnalysis
} from '@element-plus/icons-vue'
import type { ImageGeneration } from '@/types'

const router = useRouter()
const themeStore = useThemeStore()

// 图表引用
const trendChart = ref<HTMLElement>()
const userDistributionChart = ref<HTMLElement>()
const hourDistributionChart = ref<HTMLElement>()

// 图表实例
let trendChartInstance: echarts.ECharts | null = null
let userDistributionChartInstance: echarts.ECharts | null = null
let hourDistributionChartInstance: echarts.ECharts | null = null

// 响应式数据
const loading = ref(false)
const dateRange = ref<[string, string]>(['2024-01-01', '2024-12-31'])
const trendPeriod = ref('30d')

// 统计数据
const stats = ref([
  {
    key: 'totalImages',
    title: '总图片数',
    value: '0',
    change: '总计',
    changeType: 'increase',
    icon: 'Picture',
    color: '#409eff'
  },
  {
    key: 'todayImages',
    title: '今日生成',
    value: '0',
    change: '今日新增',
    changeType: 'increase',
    icon: 'TrendCharts',
    color: '#67c23a'
  },
  {
    key: 'weekImages',
    title: '本周生成',
    value: '0',
    change: '本周统计',
    changeType: 'increase',
    icon: 'Calendar',
    color: '#e6a23c'
  },
  {
    key: 'monthImages',
    title: '本月生成',
    value: '0',
    change: '本月统计',
    changeType: 'increase',
    icon: 'DataAnalysis',
    color: '#f56c6c'
  }
])

// 热门提示词
const popularPrompts = ref([
  {
    id: 1,
    text: '美丽的风景画，高清，4K',
    count: 156,
    userCount: 45,
    trend: 12
  },
  {
    id: 2,
    text: '可爱的小猫，卡通风格',
    count: 142,
    userCount: 38,
    trend: 8
  },
  {
    id: 3,
    text: '科幻城市，未来感',
    count: 128,
    userCount: 32,
    trend: -5
  },
  {
    id: 4,
    text: '抽象艺术，色彩丰富',
    count: 98,
    userCount: 28,
    trend: 15
  },
  {
    id: 5,
    text: '人物肖像，写实风格',
    count: 87,
    userCount: 25,
    trend: 3
  }
])

// 最近生成记录
const recentGenerations = ref<ImageGeneration[]>([])

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChart.value) return
  
  trendChartInstance = echarts.init(trendChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['生成数量', '成功数量', '失败数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['01-01', '01-02', '01-03', '01-04', '01-05', '01-06', '01-07']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '生成数量',
        type: 'line',
        smooth: true,
        data: [45, 62, 58, 78, 95, 112, 128],
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      },
      {
        name: '成功数量',
        type: 'line',
        smooth: true,
        data: [42, 58, 55, 72, 88, 105, 120],
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '失败数量',
        type: 'line',
        smooth: true,
        data: [3, 4, 3, 6, 7, 7, 8],
        itemStyle: {
          color: '#f56c6c'
        }
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}

// 初始化用户分布图表
const initUserDistributionChart = () => {
  if (!userDistributionChart.value) return
  
  userDistributionChartInstance = echarts.init(userDistributionChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '用户分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 335, name: '活跃用户' },
          { value: 310, name: '普通用户' },
          { value: 234, name: '新用户' },
          { value: 135, name: '沉默用户' }
        ]
      }
    ]
  }
  
  userDistributionChartInstance.setOption(option)
}

// 初始化时段分布图表
const initHourDistributionChart = () => {
  if (!hourDistributionChart.value) return
  
  hourDistributionChartInstance = echarts.init(hourDistributionChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '生成数量',
        type: 'bar',
        data: [12, 8, 6, 4, 3, 5, 8, 15, 25, 35, 42, 48, 52, 45, 38, 42, 48, 55, 48, 35, 28, 22, 18, 15],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#79bbff' }
          ])
        }
      }
    ]
  }
  
  hourDistributionChartInstance.setOption(option)
}

// 加载趋势数据
const loadTrendData = async () => {
  try {
    const response = await analyticsAPI.getTrends(trendPeriod.value)
    if (response.success && response.data) {
      // 更新趋势图表数据
      updateTrendChart(response.data.trends)
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error)
    ElMessage.error('加载趋势数据失败')
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await analyticsAPI.getStats()
    if (response.success && response.data) {
      // 更新统计数据
      updateStats(response.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 更新统计数据
const updateStats = (data) => {
  stats.value[0].value = data.total.images.toString()
  stats.value[1].value = data.today.images.toString()
  stats.value[2].value = data.week.images.toString()
  stats.value[3].value = data.month.images.toString()

  // 计算变化百分比（简化版本）
  const weekGrowth = data.week.images > 0 ? Math.round((data.week.images / 7) * 100) / 100 : 0
  const monthGrowth = data.month.images > 0 ? Math.round((data.month.images / 30) * 100) / 100 : 0

  stats.value[0].change = `总计 ${data.total.users} 用户`
  stats.value[1].change = `今日新增`
  stats.value[2].change = `周平均 ${weekGrowth}`
  stats.value[3].change = `月平均 ${monthGrowth}`
}

// 更新趋势图表
const updateTrendChart = (trendData) => {
  if (!trendChartInstance || !trendData) return

  const dates = trendData.map(item => item.date)
  const counts = trendData.map(item => item.count)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '生成数量',
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3
      },
      data: counts,
      itemStyle: {
        color: '#409eff'
      }
    }]
  }

  trendChartInstance.setOption(option)
}

// 加载最近生成记录
const loadRecentGenerations = async () => {
  try {
    const response = await imageAPI.getImages({ page: 1, pageSize: 10 })
    if (response.success && response.data) {
      recentGenerations.value = response.data.list || []
    }
  } catch (error) {
    console.error('加载最近生成记录失败:', error)
    ElMessage.error('加载最近生成记录失败')
  }
}

// 加载用户分析数据
const loadUserAnalytics = async () => {
  try {
    const response = await analyticsAPI.getUserAnalytics()
    if (response.success && response.data) {
      // 更新热门提示词（基于分类统计）
      if (response.data.categoryStats) {
        popularPrompts.value = response.data.categoryStats.map((category, index) => ({
          id: index + 1,
          text: category.category || '未分类',
          count: category.count,
          userCount: Math.floor(category.count / 2), // 估算用户数
          trend: Math.floor(Math.random() * 20) - 10 // 模拟趋势
        }))
      }
    }
  } catch (error) {
    console.error('加载用户分析数据失败:', error)
    ElMessage.error('加载用户分析数据失败')
  }
}

// 日期范围变化
const handleDateChange = () => {
  loadTrendData()
  loadStats()
}

// 刷新数据
const handleRefresh = () => {
  loadStats()
  loadTrendData()
  loadRecentGenerations()
  loadUserAnalytics()
}

// 导出提示词数据
const exportPrompts = async () => {
  try {
    const data = popularPrompts.value.map(prompt => ({
      排名: popularPrompts.value.indexOf(prompt) + 1,
      提示词: prompt.text,
      使用次数: prompt.count,
      用户数: prompt.userCount,
      趋势: `${prompt.trend > 0 ? '+' : ''}${prompt.trend}%`
    }))
    
    const csv = [Object.keys(data[0]).join(',')]
      .concat(data.map(row => Object.values(row).join(',')))
      .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    await downloadFile(URL.createObjectURL(blob), 'popular_prompts.csv')
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
    console.error('导出失败:', error)
  }
}

// 查看全部生成记录
const viewAllGenerations = () => {
  router.push('/images/list')
}

// 监听主题变化
watch(
  () => themeStore.isDark,
  () => {
    nextTick(() => {
      trendChartInstance?.dispose()
      userDistributionChartInstance?.dispose()
      hourDistributionChartInstance?.dispose()
      
      initTrendChart()
      initUserDistributionChart()
      initHourDistributionChart()
    })
  }
)

// 监听窗口大小变化
const handleResize = () => {
  trendChartInstance?.resize()
  userDistributionChartInstance?.resize()
  hourDistributionChartInstance?.resize()
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadTrendData(),
    loadRecentGenerations(),
    loadUserAnalytics()
  ])

  nextTick(() => {
    initTrendChart()
    initUserDistributionChart()
    initHourDistributionChart()
  })

  window.addEventListener('resize', handleResize)
})

// 清理
const cleanup = () => {
  trendChartInstance?.dispose()
  userDistributionChartInstance?.dispose()
  hourDistributionChartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
}

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<style scoped>
.images-analytics {
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
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--admin-padding-lg);
  margin-bottom: var(--admin-padding-xl);
}

.stat-card {
  background: var(--el-bg-color);
  border-radius: var(--admin-border-radius-lg);
  padding: var(--admin-padding-lg);
  box-shadow: var(--admin-box-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--admin-box-shadow-hover);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.stat-change.increase {
  color: var(--el-color-success);
}

.stat-change.decrease {
  color: var(--el-color-danger);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.charts-section {
  margin-bottom: var(--admin-padding-xl);
}

.chart-row {
  display: grid;
  gap: var(--admin-padding-lg);
  margin-bottom: var(--admin-padding-lg);
}

.chart-row:first-child {
  grid-template-columns: 1fr;
}

.chart-row:last-child {
  grid-template-columns: 1fr 1fr;
}

.chart-card {
  background: var(--el-bg-color);
  border-radius: var(--admin-border-radius-lg);
  overflow: hidden;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.chart-content {
  height: 300px;
  padding: var(--admin-padding-md);
}

.chart {
  width: 100%;
  height: 100%;
}

.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--admin-padding-lg);
}

.popular-prompts,
.recent-generations {
  background: var(--el-bg-color);
  border-radius: var(--admin-border-radius-lg);
  overflow: hidden;
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

.prompts-list,
.generations-list {
  padding: var(--admin-padding-md);
  max-height: 400px;
  overflow-y: auto;
}

.prompt-item {
  display: flex;
  align-items: center;
  gap: var(--admin-padding-md);
  padding: var(--admin-padding-md);
  border-radius: var(--admin-border-radius);
  transition: background-color 0.3s ease;
  margin-bottom: var(--admin-padding-sm);
}

.prompt-item:hover {
  background: var(--el-fill-color-light);
}

.prompt-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.prompt-content {
  flex: 1;
  min-width: 0;
}

.prompt-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prompt-meta {
  display: flex;
  gap: var(--admin-padding-md);
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.prompt-trend {
  flex-shrink: 0;
}

.generation-item {
  display: flex;
  gap: var(--admin-padding-md);
  padding: var(--admin-padding-md);
  border-radius: var(--admin-border-radius);
  transition: background-color 0.3s ease;
  margin-bottom: var(--admin-padding-sm);
}

.generation-item:hover {
  background: var(--el-fill-color-light);
}

.generation-image {
  flex-shrink: 0;
}

.thumb-img {
  width: 48px;
  height: 48px;
  border-radius: var(--admin-border-radius);
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--el-fill-color-light);
  border-radius: var(--admin-border-radius);
  color: var(--el-text-color-placeholder);
}

.generation-info {
  flex: 1;
  min-width: 0;
}

.generation-prompt {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.generation-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-row:last-child,
  .bottom-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .images-analytics {
    padding: var(--admin-padding-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--admin-padding-md);
  }
  
  .header-right {
    align-self: stretch;
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--admin-padding-md);
  }
  
  .chart-content {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>