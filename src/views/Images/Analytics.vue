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
      <div class="stat-card" v-for="stat in stats" :key="stat.key" v-loading="loading">
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
        <el-card class="chart-card full-width" shadow="never" v-loading="loading">
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
            <div v-if="!trendChartInstance" class="chart-placeholder">
              <el-empty description="正在加载图表数据..." :image-size="80" />
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 分布图表 -->
      <div class="chart-row">
        <el-card class="chart-card" shadow="never" v-loading="loading">
          <template #header>
            <h3>用户生成分布</h3>
          </template>
          <div class="chart-content">
            <div ref="userDistributionChart" class="chart"></div>
            <div v-if="!userDistributionChartInstance" class="chart-placeholder">
              <el-empty description="正在加载用户分布数据..." :image-size="60" />
            </div>
          </div>
        </el-card>
        
        <el-card class="chart-card" shadow="never" v-loading="loading">
          <template #header>
            <h3>时段分布</h3>
          </template>
          <div class="chart-content">
            <div ref="hourDistributionChart" class="chart"></div>
            <div v-if="!hourDistributionChartInstance" class="chart-placeholder">
              <el-empty description="正在加载时段分布数据..." :image-size="60" />
            </div>
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

      <!-- 热门词汇统计 -->
      <el-card class="popular-words" shadow="never">
        <template #header>
          <div class="card-header">
            <h3>热门词汇统计</h3>
            <div class="header-controls">
              <el-select v-model="wordsConfig.days" size="small" style="width: 80px; margin-right: 8px;" @change="loadPopularWords">
                <el-option label="7天" :value="7" />
                <el-option label="30天" :value="30" />
                <el-option label="90天" :value="90" />
              </el-select>
              <el-button type="primary" link @click="exportWords">
                导出数据
              </el-button>
            </div>
          </div>
        </template>
        <div class="words-list" v-loading="wordsLoading">
          <div 
            v-for="(word, index) in popularWords" 
            :key="word.id"
            class="word-item"
          >
            <div class="word-rank">{{ index + 1 }}</div>
            <div class="word-content">
              <div class="word-text">{{ word.word }}</div>
              <div class="word-count">{{ word.count }}次</div>
            </div>
            <div class="word-badge">
              <el-tag 
                :type="index < 3 ? 'danger' : index < 10 ? 'warning' : 'info'" 
                size="small"
                effect="plain"
              >
                TOP {{ index + 1 }}
              </el-tag>
            </div>
          </div>
          <div v-if="popularWords.length === 0 && !wordsLoading" class="empty-words">
            <el-empty description="暂无词汇数据" :image-size="60">
              <template #description>
                <p>暂无热门词汇数据</p>
                <el-button type="primary" size="small" @click="loadPopularWords">重新加载</el-button>
              </template>
            </el-empty>
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
                lazy
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
                <span>{{ getRelativeTime(generation.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div v-if="recentGenerations.length === 0" class="empty-generations">
            <el-empty description="暂无最近生成记录" :image-size="60">
              <template #description>
                <p>暂无最近生成记录</p>
                <el-button type="primary" size="small" @click="loadRecentGenerations">重新加载</el-button>
              </template>
            </el-empty>
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
import { getRelativeTime, downloadFile } from '@/utils'
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
// 设置默认日期范围为最近7天
const today = new Date()
const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
const dateRange = ref<[string, string]>([
  sevenDaysAgo.toISOString().split('T')[0],
  today.toISOString().split('T')[0]
])
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

// 热门词汇统计
const popularWords = ref([])
const wordsLoading = ref(false)
const wordsConfig = reactive({
  days: 7,
  limit: 20,
  minLength: 2
})

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
        data: [] // 初始化为空数组，等待数据加载
      }
    ]
  }
  
  userDistributionChartInstance.setOption(option)
}

// 更新用户分布图表
const updateUserDistributionChart = (data) => {
  if (!userDistributionChartInstance || !data) return

  const formattedData = data.map(item => ({
    value: item.value,
    name: item.name,
    itemStyle: { color: item.color }
  }))

  userDistributionChartInstance.setOption({
    series: [{
      data: formattedData
    }]
  })
}

// 加载用户分布数据
const loadUserDistribution = async () => {
  try {
    const response = await analyticsAPI.getUserDistribution()
    if (response.success && response.data) {
      updateUserDistributionChart(response.data)
    } else {
      console.error('用户分布API返回失败:', response)
    }
  } catch (error) {
    console.error('用户分布数据加载失败:', error)
  }
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
      },
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>${data.seriesName}: ${data.value}`
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
        data: Array.from({ length: 24 }, () => 0), // 初始化为0，等待真实数据
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

// 更新时段分布图表
const updateHourDistributionChart = (hourData) => {
  if (!hourDistributionChartInstance || !hourData) return

  const counts = hourData.map(item => item.count)
  const labels = hourData.map(item => item.hourLabel)

  const option = {
    xAxis: {
      data: labels
    },
    series: [{
      name: '生成数量',
      type: 'bar',
      data: counts,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#79bbff' }
        ])
      }
    }]
  }

  hourDistributionChartInstance.setOption(option)
}

// 加载趋势数据
const loadTrendData = async () => {
  try {
    const response = await analyticsAPI.getTrends(trendPeriod.value)
    if (response.success && response.data) {
      // 更新趋势图表数据 - response.data直接是趋势数组
      updateTrendChart(response.data)
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error)
    ElMessage.error('加载趋势数据失败: ' + error.message)
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
    ElMessage.error('加载统计数据失败: ' + error.message)
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

  stats.value[0].change = `总计 ${data.total.users || data.total.activeUsers || 0} 用户`
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
      recentGenerations.value = (response.data.list || response.data.images || []).map(item => ({
        ...item,
        imageUrl: item.url || item.imageUrl || item.file_path || '',
        prompt: item.prompt || '无提示词',
        username: item.username || `用户${item.userId || item.user_id || '未知'}`,
        createdAt: item.created_at || item.createdAt || new Date()
      }))
    }
  } catch (error) {
    console.error('加载最近生成记录失败:', error)
    ElMessage.error('加载最近生成记录失败: ' + error.message)
  }
}

// 加载热门提示词数据
const loadPopularPrompts = async () => {
  try {
    const response = await analyticsAPI.getPopularPrompts(10) // 获取前10个热门提示词
    if (response.success && response.data) {
      // 处理数据结构 - response.data可能是数组或包含prompts字段的对象
      const promptsData = Array.isArray(response.data) ? response.data : (response.data.prompts || [])
      popularPrompts.value = promptsData.map((prompt, index) => ({
        id: index + 1,
        text: prompt.text || prompt.prompt,
        count: prompt.count,
        userCount: prompt.userCount || 0, 
        trend: prompt.trend || 0 
      }))
    } else {
      console.error('获取热门提示词失败:', response.message)
      ElMessage.error('获取热门提示词失败: ' + (response.message || '未知错误'))
    }
  } catch (error) {
    console.error('加载热门提示词失败:', error)
    ElMessage.error('加载热门提示词失败: ' + error.message)
  }
}

// 加载用户分析数据
const loadUserAnalytics = async () => {
  try {
    const response = await analyticsAPI.getUserAnalytics()
    if (response.success && response.data) {
      // 这里可以处理其他用户分析数据，但热门提示词已经单独处理
      console.log('用户分析数据:', response.data)
    }
  } catch (error) {
    console.error('加载用户分析数据失败:', error)
    // 不显示错误消息，因为这不是关键功能
  }
}

// 加载时段分布数据
const loadHourDistribution = async () => {
  try {
    const days = 7 // 默认统计最近7天
    const response = await analyticsAPI.getHourDistribution(days)

    if (response.success && response.data) {
      updateHourDistributionChart(response.data)
    } else {
      console.error('时段分布API返回失败:', response)
      ElMessage.error('获取时段分布数据失败: ' + (response.message || '未知错误'))
    }
  } catch (error) {
    console.error('加载时段分布数据失败:', error)
    ElMessage.error('加载时段分布数据失败: ' + error.message)
  }
}

// 日期范围变化
const handleDateChange = () => {
  loadTrendData()
  loadStats()
  loadHourDistribution()
}

// 刷新数据
const handleRefresh = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadStats(),
      loadTrendData(),
      loadRecentGenerations(),
      loadPopularPrompts(),
      loadUserDistribution(),
      loadUserAnalytics(),
      loadHourDistribution(),
      loadPopularWords()
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('刷新数据失败: ' + error.message)
  } finally {
    loading.value = false
  }
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

// 加载热门词汇统计
const loadPopularWords = async () => {
  wordsLoading.value = true
  try {
    const response = await dashboardAPI.getPopularWords({
      limit: wordsConfig.limit,
      days: wordsConfig.days,
      minLength: wordsConfig.minLength
    })
    
    if (response.success && response.data) {
      // 处理数据结构 - response.data可能是数组或包含words字段的对象
      const wordsData = Array.isArray(response.data) ? response.data : (response.data.words || [])
      popularWords.value = wordsData.map((word, index) => ({
        id: index + 1,
        word: word.word,
        count: word.count
      }))
    } else {
      console.error('获取热门词汇失败:', response.message)
      ElMessage.error('获取热门词汇失败: ' + (response.message || '未知错误'))
    }
  } catch (error) {
    console.error('加载热门词汇失败:', error)
    ElMessage.error('加载热门词汇失败: ' + error.message)
  } finally {
    wordsLoading.value = false
  }
}

// 导出词汇数据
const exportWords = async () => {
  try {
    const data = popularWords.value.map(word => ({
      排名: word.id,
      词汇: word.word,
      出现次数: word.count
    }))
    
    const csv = [Object.keys(data[0]).join(',')]
      .concat(data.map(row => Object.values(row).join(',')))
      .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    await downloadFile(URL.createObjectURL(blob), 'popular_words.csv')
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
  loading.value = true
  try {
    // 先初始化图表
    await nextTick()
    console.log('开始初始化图表...')
    initTrendChart()
    initUserDistributionChart()
    initHourDistributionChart()
    console.log('图表初始化完成，hourDistributionChartInstance存在:', !!hourDistributionChartInstance)

    // 然后加载数据
    await Promise.all([
      loadStats(),
      loadTrendData(),
      loadRecentGenerations(),
      loadPopularPrompts(),
      loadUserDistribution(), // 加载用户分布
      loadUserAnalytics(),
      loadHourDistribution(),
      loadPopularWords()
    ])
  } catch (error) {
    console.error('页面初始化失败:', error)
    ElMessage.error('页面初始化失败: ' + error.message)
  } finally {
    loading.value = false
  }

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
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--admin-padding-lg);
}

.popular-prompts,
.popular-words,
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

.header-controls {
  display: flex;
  align-items: center;
}

.prompts-list,
.words-list,
.generations-list {
  padding: var(--admin-padding-md);
  max-height: 400px;
  overflow-y: auto;
}

.word-item {
  display: flex;
  align-items: center;
  gap: var(--admin-padding-md);
  padding: var(--admin-padding-md);
  border-radius: var(--admin-border-radius);
  transition: background-color 0.3s ease;
  margin-bottom: var(--admin-padding-sm);
}

.word-item:hover {
  background: var(--el-fill-color-light);
}

.word-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-color-success);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.word-content {
  flex: 1;
  min-width: 0;
}

.word-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  font-weight: 500;
}

.word-count {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.word-badge {
  flex-shrink: 0;
}

.empty-words,
.empty-generations {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  padding: var(--admin-padding-lg);
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
  .chart-row:last-child {
    grid-template-columns: 1fr;
  }
  
  .bottom-section {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 900px) {
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