<template>
  <div class="api-status" v-if="showStatus">
    <el-alert
      :title="statusText"
      :type="statusType"
      :closable="true"
      @close="hideStatus"
      show-icon
    >
      <template #default>
        <div class="status-content">
          <p>{{ statusMessage }}</p>
          <div class="status-actions" v-if="!isConnected">
            <el-button size="small" @click="checkConnection">重新检测</el-button>
            <el-button size="small" type="primary" @click="showHelp">查看帮助</el-button>
          </div>
        </div>
      </template>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { healthAPI } from '@/api'

/**
 * API连接状态检测组件
 * 用于检测后端API服务是否可用
 */

const showStatus = ref(false)
const isConnected = ref(false)
const statusText = ref('')
const statusMessage = ref('')
const statusType = ref<'success' | 'warning' | 'error' | 'info'>('info')

/**
 * 检测API连接状态
 */
const checkConnection = async () => {
  try {
    // 使用健康检查接口
    await healthAPI.checkHealth()
    isConnected.value = true
    statusText.value = 'API连接正常'
    statusMessage.value = '后端服务运行正常，所有功能可用。'
    statusType.value = 'success'
    showStatus.value = true
    
    // 3秒后自动隐藏成功提示
    setTimeout(() => {
      showStatus.value = false
    }, 3000)
  } catch (error) {
    isConnected.value = false
    statusText.value = '后端服务未启动'
    statusMessage.value = '检测到后端API服务未启动，当前显示的是模拟数据。请启动后端服务以获取真实数据。'
    statusType.value = 'warning'
    showStatus.value = true
  }
}

/**
 * 显示帮助信息
 */
const showHelp = () => {
  ElMessage({
    message: '请确保后端服务在 http://localhost:5004 端口运行',
    type: 'info',
    duration: 5000
  })
}

/**
 * 隐藏状态提示
 */
const hideStatus = () => {
  showStatus.value = false
}

// 组件挂载时检测连接状态
onMounted(() => {
  // 延迟1秒检测，避免页面加载时的干扰
  setTimeout(checkConnection, 1000)
})
</script>

<style scoped>
.api-status {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.status-content {
  margin-top: 8px;
}

.status-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.status-actions .el-button {
  padding: 4px 12px;
}
</style>