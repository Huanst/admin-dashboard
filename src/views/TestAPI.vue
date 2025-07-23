<template>
  <div class="test-api">
    <h2>API测试页面</h2>
    
    <div class="test-section">
      <h3>认证状态</h3>
      <p>Token: {{ authStore.token ? '已获取' : '未获取' }}</p>
      <p>用户: {{ authStore.user ? authStore.user.username : '未登录' }}</p>
      <p>登录状态: {{ authStore.isLoggedIn ? '已登录' : '未登录' }}</p>
    </div>
    
    <div class="test-section">
      <h3>用户列表API测试</h3>
      <el-button @click="testUserAPI" :loading="loading">测试用户列表API</el-button>
      
      <div v-if="apiResult" class="api-result">
        <h4>API响应结果:</h4>
        <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
      </div>
      
      <div v-if="apiError" class="api-error">
        <h4>API错误:</h4>
        <pre>{{ JSON.stringify(apiError, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userAPI } from '@/utils/api'

const authStore = useAuthStore()
const loading = ref(false)
const apiResult = ref(null)
const apiError = ref(null)

const testUserAPI = async () => {
  loading.value = true
  apiResult.value = null
  apiError.value = null
  
  try {
    console.log('开始测试用户列表API...')
    console.log('当前token:', authStore.token)
    
    const params = {
      page: 1,
      pageSize: 10
    }
    
    console.log('请求参数:', params)
    
    const response = await userAPI.getUsers(params)
    console.log('API响应:', response)
    
    apiResult.value = response
  } catch (error) {
    console.error('API测试失败:', error)
    apiError.value = {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-api {
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.api-result, .api-error {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.api-result {
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
}

.api-error {
  background-color: #fef2f2;
  border: 1px solid #ef4444;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 12px;
}
</style>
