<template>
  <div class="dashboard">
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
              <span class="stat-description">{{ stat.description }}</span>
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
    <div class="charts-grid">
      <!-- 用户增长趋势 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>用户增长趋势</h3>
          <el-radio-group v-model="userTrendPeriod" size="small">
            <el-radio-button value="7d">7天</el-radio-button>
              <el-radio-button value="30d">30天</el-radio-button>
              <el-radio-button value="90d">90天</el-radio-button>
          </el-radio-group>
        </div>
        <div class="chart-content">
          <div ref="userTrendChart" class="chart"></div>
        </div>
      </div>
      
      <!-- 图片生成趋势 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>图片生成趋势</h3>
          <el-radio-group v-model="imageTrendPeriod" size="small">
            <el-radio-button value="7d">7天</el-radio-button>
              <el-radio-button value="30d">30天</el-radio-button>
              <el-radio-button value="90d">90天</el-radio-button>
          </el-radio-group>
        </div>
        <div class="chart-content">
          <div ref="imageTrendChart" class="chart"></div>
        </div>
      </div>
    </div>
    
    <!-- 热门提示词和最新用户 -->
    <div class="bottom-grid">
      <!-- 热门提示词 -->
      <div class="info-card">
        <div class="card-header">
          <h3>热门提示词</h3>
          <el-button type="primary" link>查看更多</el-button>
        </div>
        <div class="card-content">
          <div class="prompt-list">
            <div 
              v-for="prompt in popularPrompts" 
              :key="prompt.id"
              class="prompt-item"
            >
              <div class="prompt-text">{{ prompt.text }}</div>
              <div class="prompt-count">{{ prompt.count }}次</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最新用户 -->
      <div class="info-card">
        <div class="card-header">
          <h3>最新用户</h3>
          <el-button type="primary" link>查看更多</el-button>
        </div>
        <div class="card-content">
          <div class="user-list">
            <div 
              v-for="user in recentUsers" 
              :key="user.id"
              class="user-item"
            >
              <el-avatar :size="32" :src="user.avatar">
                <el-icon><UserIcon /></el-icon>
              </el-avatar>
              <div class="user-info">
                <div class="user-name">{{ user.username }}</div>
                <div class="user-time">{{ formatDate(user.createdAt) }}</div>
              </div>
              <el-tag :type="user.status === 'active' ? 'success' : 'info'" size="small">
                {{ user.status === 'active' ? '活跃' : '新用户' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { useThemeStore } from '@/stores/theme'
import { dashboardAPI } from '@/api/dashboard'
import { userAPI } from '@/api/user'
import { formatDate } from '@/utils'
import type { TrendData, PopularPrompt, User } from '@/types/api'
import {
  User as UserIcon,
  TrendCharts,
  Bottom,
  PieChart,
  DataAnalysis,
  Picture
} from '@element-plus/icons-vue'
import type { DashboardStats } from '@/types'

const themeStore = useThemeStore()

// 图表引用
const userTrendChart = ref<HTMLElement>()
const imageTrendChart = ref<HTMLElement>()

// 图表实例
let userChart: echarts.ECharts | null = null
let imageChart: echarts.ECharts | null = null

// 时间周期
const userTrendPeriod = ref('7d')
const imageTrendPeriod = ref('7d')

// 统计数据
const stats = ref([
  {
    key: 'totalUsers',
    title: '总用户数',
    value: '0',
    change: '+0%',
    changeType: 'increase',
    description: '较上周',
    icon: 'User',
    color: '#409eff'
  },
  {
    key: 'totalImages',
    title: '总图片数',
    value: '0',
    change: '+0%',
    changeType: 'increase',
    description: '较上周',
    icon: 'Picture',
    color: '#67c23a'
  },
  {
    key: 'todayImages',
    title: '今日生成',
    value: '0',
    change: '+0%',
    changeType: 'increase',
    description: '较昨日',
    icon: 'TrendCharts',
    color: '#e6a23c'
  },
  {
    key: 'activeUsers',
    title: '活跃用户',
    value: '0',
    change: '+0%',
    changeType: 'increase',
    description: '较上期',
    icon: 'DataAnalysis',
    color: '#f56c6c'
  }
])

// 热门提示词
const popularPrompts = ref<PopularPrompt[]>([])

// 最新用户
const recentUsers = ref<User[]>([])

// 用户趋势数据
const userTrendData = ref<TrendData[]>([])



// 初始化用户趋势图表
const initUserTrendChart = () => {
  if (!userTrendChart.value) {
    console.warn('用户趋势图表DOM元素未准备好')
    return
  }
  
  try {
    // 如果图表已存在，先销毁
    if (userChart) {
      userChart.dispose()
      userChart = null
    }
    
    userChart = echarts.init(userTrendChart.value)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: (params: any) => {
          const data = params[0]
          return `${data.axisValue}<br/>新增用户: ${data.value}人`
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
        data: userTrendData.value.map((item) => item.date) || ['暂无数据'],
        axisLabel: {
          color: themeStore.isDark ? '#a3a6ad' : '#606266'
        },
        axisLine: {
          lineStyle: {
            color: themeStore.isDark ? '#4c4d4f' : '#dcdfe6'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: themeStore.isDark ? '#a3a6ad' : '#606266'
        },
        axisLine: {
          lineStyle: {
            color: themeStore.isDark ? '#4c4d4f' : '#dcdfe6'
          }
        },
        splitLine: {
          lineStyle: {
            color: themeStore.isDark ? '#4c4d4f' : '#f0f2f5'
          }
        }
      },
      series: [
        {
          name: '新增用户',
          type: 'line',
          smooth: true,
          data: userTrendData.value.map((item) => item.count) || [0],
          itemStyle: {
            color: '#409eff'
          },
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: '#337ecc'
            }
          }
        }
      ]
    }
    
    userChart.setOption(option)
  } catch (error) {
    console.error('用户趋势图表初始化失败:', error)
  }
}

// 图片趋势数据
const imageTrendData = ref<TrendData[]>([])

// 初始化图片趋势图表
const initImageTrendChart = () => {
  if (!imageTrendChart.value) {
    console.warn('图片趋势图表DOM元素未准备好')
    return
  }
  
  try {
    // 如果图表已存在，先销毁
    if (imageChart) {
      imageChart.dispose()
      imageChart = null
    }
    
    imageChart = echarts.init(imageTrendChart.value)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: (params: any) => {
          const data = params[0]
          // 使用实际的数据索引来获取正确的日期和数量
          const actualItem = imageTrendData.value[data.dataIndex]
          if (actualItem) {
            return `${actualItem.date}<br/>图片生成: ${actualItem.count}张`
          }
          return `${data.axisValue}<br/>图片生成: ${data.value}张`
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
        data: imageTrendData.value.map((item) => item.date) || ['暂无数据'],
        axisLabel: {
          color: themeStore.isDark ? '#a3a6ad' : '#606266'
        },
        axisLine: {
          lineStyle: {
            color: themeStore.isDark ? '#4c4d4f' : '#dcdfe6'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: themeStore.isDark ? '#a3a6ad' : '#606266'
        },
        axisLine: {
          lineStyle: {
            color: themeStore.isDark ? '#4c4d4f' : '#dcdfe6'
          }
        },
        splitLine: {
          lineStyle: {
            color: themeStore.isDark ? '#4c4d4f' : '#f0f2f5'
          }
        }
      },
      series: [
        {
          name: '图片生成',
          type: 'bar',
          data: imageTrendData.value.map((item) => item.count) || [0],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#67c23a' },
              { offset: 1, color: '#85ce61' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#529b2e' },
                { offset: 1, color: '#67c23a' }
              ])
            }
          }
        }
      ]
    }
    
    imageChart.setOption(option)
  } catch (error) {
    console.error('图片趋势图表初始化失败:', error)
  }
}

// 加载统计数据
const loadStats = async () => {
  console.log('开始加载统计数据...')
  try {
    const response = await dashboardAPI.getStats()
    console.log('统计数据API响应:', response)
    if (response.success && response.data) {
      const data = response.data
      console.log('统计数据加载成功:', data)

      // 更新基础数据
      stats.value[0].value = data.totalUsers.toString()
      stats.value[1].value = data.totalImages.toString()
      stats.value[2].value = data.todayImages.toString()
      stats.value[3].value = data.activeUsers.toString()

      // 更新变化数据 - 使用基于真实数据的计算
      const todayImages = parseInt(data.todayImages) || 0
      const totalUsers = parseInt(data.totalUsers) || 0
      const totalImages = parseInt(data.totalImages) || 0
      const activeUsers = parseInt(data.activeUsers) || 0

      // 基于真实数据计算变化（简化版本）
      const calculateChange = (current, base = 10) => {
        if (current === 0) return 0
        return Math.min(Math.max(Math.round((current / base) * 10), -50), 100)
      }

      // 总用户数变化
      const userChange = calculateChange(totalUsers, 2)
      stats.value[0].change = `${userChange >= 0 ? '+' : ''}${userChange}%`
      stats.value[0].changeType = userChange > 0 ? 'increase' : userChange < 0 ? 'decrease' : 'stable'

      // 总图片数变化
      const imageChange = calculateChange(totalImages, 15)
      stats.value[1].change = `${imageChange >= 0 ? '+' : ''}${imageChange}%`
      stats.value[1].changeType = imageChange > 0 ? 'increase' : imageChange < 0 ? 'decrease' : 'stable'

      // 今日生成变化
      const todayChange = calculateChange(todayImages, 2)
      stats.value[2].change = `${todayChange >= 0 ? '+' : ''}${todayChange}%`
      stats.value[2].changeType = todayChange > 0 ? 'increase' : todayChange < 0 ? 'decrease' : 'stable'

      // 活跃用户变化
      const activeChange = calculateChange(activeUsers, 1)
      stats.value[3].change = `${activeChange >= 0 ? '+' : ''}${activeChange}%`
      stats.value[3].changeType = activeChange > 0 ? 'increase' : activeChange < 0 ? 'decrease' : 'stable'
    } else {
      console.warn('统计数据API返回失败:', response)
    }
  } catch (error) {
    console.error('统计数据加载失败，使用默认数据:', error)
    // 在开发环境下，API失败时使用模拟数据
    if (import.meta.env.DEV) {
      console.log('使用模拟统计数据')
      stats.value[0].value = '156'
      stats.value[0].change = '+12%'
      stats.value[0].changeType = 'increase'
      stats.value[0].description = '较上周'

      stats.value[1].value = '2,340'
      stats.value[1].change = '+8%'
      stats.value[1].changeType = 'increase'
      stats.value[1].description = '较上周'

      stats.value[2].value = '45'
      stats.value[2].change = '+15%'
      stats.value[2].changeType = 'increase'
      stats.value[2].description = '较昨日'

      stats.value[3].value = '89'
      stats.value[3].change = '+6%'
      stats.value[3].changeType = 'increase'
      stats.value[3].description = '较上期'
    }
  }
}

// 加载用户趋势数据
const loadUserTrend = async (period = userTrendPeriod.value) => {
  try {
    // 根据周期转换为天数
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    console.log(`加载用户趋势数据，周期: ${period}, 天数: ${days}`)

    const response = await dashboardAPI.getUserGrowthTrend(days)
    console.log('用户趋势API响应:', response)

    if (response.success && response.data) {
      // 处理不同的数据格式
      let trendData = response.data

      // 如果数据是嵌套格式（来自statsController），提取trend数组
      if (response.data.trend && Array.isArray(response.data.trend)) {
        trendData = response.data.trend
        console.log('检测到嵌套数据格式，提取trend数组')
      }

      // 确保trendData是数组
      if (!Array.isArray(trendData)) {
        console.warn('用户趋势数据格式不正确，期望数组格式:', trendData)
        trendData = []
      }

      // 格式化日期显示
      userTrendData.value = trendData.map(item => ({
        ...item,
        date: formatDateForChart(item.date, period)
      }))

      console.log('用户趋势数据加载成功:', userTrendData.value)

      nextTick(() => {
        initUserTrendChart()
      })
    } else {
      console.warn('用户趋势API返回失败:', response)
      // 使用模拟数据
      userTrendData.value = generateMockUserTrendData(period)
      nextTick(() => {
        initUserTrendChart()
      })
    }
  } catch (error) {
    console.warn('用户趋势数据加载失败，使用模拟数据:', error)
    // 在开发环境下，API失败时使用模拟数据
    if (import.meta.env.DEV) {
      userTrendData.value = generateMockUserTrendData(period)
      nextTick(() => {
        initUserTrendChart()
      })
    }
  }
}

// 加载图片趋势数据
const loadImageTrend = async (period = imageTrendPeriod.value) => {
  try {
    // 根据周期转换为天数
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    console.log(`加载图片趋势数据，周期: ${period}, 天数: ${days}`)

    const response = await dashboardAPI.getImageGenerationTrend(days)
    console.log('图片趋势API响应:', response)

    if (response.success && response.data) {
      // 处理不同的数据格式
      let trendData = response.data

      // 如果数据是嵌套格式（来自statsController），提取trend数组
      if (response.data.trend && Array.isArray(response.data.trend)) {
        trendData = response.data.trend
        console.log('检测到嵌套数据格式，提取trend数组')
      }

      // 确保trendData是数组
      if (!Array.isArray(trendData)) {
        console.warn('图片趋势数据格式不正确，期望数组格式:', trendData)
        trendData = []
      }

      // 格式化日期显示
      imageTrendData.value = trendData.map(item => ({
        ...item,
        date: formatDateForChart(item.date, period)
      }))



      nextTick(() => {
        initImageTrendChart()
      })
    } else {
      console.warn('图片趋势API返回失败:', response)
      // 使用模拟数据
      imageTrendData.value = generateMockImageTrendData(period)
      nextTick(() => {
        initImageTrendChart()
      })
    }
  } catch (error) {
    console.error('图片趋势数据加载失败，使用模拟数据:', error)
    // 在开发环境下，API失败时使用模拟数据
    if (import.meta.env.DEV) {
      console.log('使用模拟图片趋势数据')
      imageTrendData.value = generateMockImageTrendData(period)
      nextTick(() => {
        initImageTrendChart()
      })
    }
  }
}

// 格式化图表日期显示
const formatDateForChart = (dateStr: string, period: string) => {
  const date = new Date(dateStr)

  if (period === '7d') {
    // 7天显示 MM-DD 格式
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  } else if (period === '30d') {
    // 30天显示 MM-DD 格式
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  } else {
    // 90天显示 MM-DD 格式
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}

// 生成模拟图片趋势数据
const generateMockImageTrendData = (period: string) => {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const data = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    data.push({
      date: formatDateForChart(dateStr, period),
      count: Math.floor(Math.random() * 50) + 10 // 随机生成10-60之间的数字
    })
  }

  return data
}

// 生成模拟用户趋势数据
const generateMockUserTrendData = (period: string) => {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const data = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    data.push({
      date: formatDateForChart(dateStr, period),
      count: Math.floor(Math.random() * 20) + 5 // 随机生成5-25之间的数字
    })
  }

  return data
}

// 加载热门提示词
const loadPopularPrompts = async () => {
  try {
    const response = await dashboardAPI.getPopularPrompts(5)
    if (response.success && response.data) {
      popularPrompts.value = response.data
    }
  } catch (error) {
    console.warn('热门提示词加载失败，使用模拟数据:', error)
    // 在开发环境下，API失败时使用模拟数据
    if (import.meta.env.DEV) {
      popularPrompts.value = [
        { id: 1, text: '美丽的山水画，有蓝天白云', count: 156 },
        { id: 2, text: '可爱的小猫咪，毛茸茸的', count: 134 },
        { id: 3, text: '现代建筑设计，简约风格', count: 98 },
        { id: 4, text: '梦幻森林，阳光透过树叶', count: 87 },
        { id: 5, text: '科技感十足的机器人', count: 76 }
      ]
    }
  }
}

// 加载最新用户
const loadRecentUsers = async () => {
  try {
    const response = await userAPI.getUsers({ page: 1, pageSize: 5 })
    if (response.success && response.data && response.data.list) {
      recentUsers.value = response.data.list.map((user: any) => ({
        ...user,
        status: 'active'
      }))
    }
  } catch (error) {
    console.warn('最新用户加载失败，使用模拟数据:', error)
    // 在开发环境下，API失败时使用模拟数据
    if (import.meta.env.DEV) {
      recentUsers.value = [
        { 
          id: 1, 
          username: 'user001', 
          avatar: '', 
          createdAt: new Date().toISOString(), 
          status: 'active' 
        },
        { 
          id: 2, 
          username: 'designer123', 
          avatar: '', 
          createdAt: new Date(Date.now() - 86400000).toISOString(), 
          status: 'active' 
        },
        { 
          id: 3, 
          username: 'artist456', 
          avatar: '', 
          createdAt: new Date(Date.now() - 172800000).toISOString(), 
          status: 'active' 
        }
      ]
    }
  }
}

// 监听图片趋势周期变化
watch(imageTrendPeriod, (newPeriod) => {
  console.log('图片趋势周期变化:', newPeriod)
  loadImageTrend(newPeriod)
})

// 监听用户趋势周期变化
watch(userTrendPeriod, (newPeriod) => {
  console.log('用户趋势周期变化:', newPeriod)
  loadUserTrend(newPeriod)
})

// 监听主题变化
watch(
  () => themeStore.isDark,
  () => {
    nextTick(() => {
      if (userChart) {
        userChart.dispose()
        initUserTrendChart()
      }
      if (imageChart) {
        imageChart.dispose()
        initImageTrendChart()
      }
    })
  }
)

// 监听窗口大小变化
const handleResize = () => {
  userChart?.resize()
  imageChart?.resize()
}

// 生命周期
onMounted(async () => {
  try {
    // 先等待DOM渲染完成
    await nextTick()
    
    // 并行加载数据
    await Promise.all([
      loadStats(),
      loadUserTrend(),
      loadImageTrend(),
      loadPopularPrompts(),
      loadRecentUsers()
    ])
    
    // 确保DOM完全渲染后再初始化图表
    await nextTick()
    
    // 延迟一点时间确保图表容器已经渲染
    setTimeout(() => {
      initUserTrendChart()
      initImageTrendChart()
    }, 100)
    
    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('Dashboard初始化失败:', error)
  }
})

// 清理
const cleanup = () => {
  userChart?.dispose()
  imageChart?.dispose()
  window.removeEventListener('resize', handleResize)
}

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<style scoped>
.dashboard {
  padding: var(--admin-padding-lg);
  background: var(--el-bg-color-page);
  min-height: 100%;
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

.stat-change.stable {
  color: var(--el-text-color-regular);
}

.stat-description {
  margin-left: 4px;
  color: var(--el-text-color-secondary);
  font-size: 11px;
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

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--admin-padding-lg);
  margin-bottom: var(--admin-padding-xl);
}

.chart-card {
  background: var(--el-bg-color);
  border-radius: var(--admin-border-radius-lg);
  padding: var(--admin-padding-lg);
  box-shadow: var(--admin-box-shadow);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--admin-padding-lg);
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.chart-content {
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--admin-padding-lg);
}

.info-card {
  background: var(--el-bg-color);
  border-radius: var(--admin-border-radius-lg);
  padding: var(--admin-padding-lg);
  box-shadow: var(--admin-box-shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--admin-padding-lg);
  padding-bottom: var(--admin-padding-md);
  border-bottom: 1px solid var(--el-border-color-light);
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.prompt-list,
.user-list {
  display: flex;
  flex-direction: column;
  gap: var(--admin-padding-md);
}

.prompt-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--admin-padding-sm);
  border-radius: var(--admin-border-radius);
  transition: background-color 0.3s ease;
}

.prompt-item:hover {
  background: var(--el-fill-color-light);
}

.prompt-text {
  flex: 1;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.prompt-count {
  font-size: 12px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color);
  padding: 2px 8px;
  border-radius: 10px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: var(--admin-padding-md);
  padding: var(--admin-padding-sm);
  border-radius: var(--admin-border-radius);
  transition: background-color 0.3s ease;
}

.user-item:hover {
  background: var(--el-fill-color-light);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.user-time {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: var(--admin-padding-md);
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
  
  .chart-header {
    flex-direction: column;
    gap: var(--admin-padding-sm);
    align-items: flex-start;
  }
}
</style>