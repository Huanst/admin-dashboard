<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-message">
        <h2>页面不存在</h2>
        <p>抱歉，您访问的页面不存在或已被删除</p>
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上页
        </el-button>
      </div>
    </div>
    <div class="error-illustration">
      <svg viewBox="0 0 404 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#409EFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#67C23A;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- 404 数字 -->
        <text x="202" y="150" text-anchor="middle" font-size="120" font-weight="bold" fill="url(#gradient)" opacity="0.1">404</text>
        <!-- 搜索图标 -->
        <circle cx="150" cy="120" r="40" fill="none" stroke="#409EFF" stroke-width="4"/>
        <line x1="180" y1="150" x2="200" y2="170" stroke="#409EFF" stroke-width="4" stroke-linecap="round"/>
        <!-- 问号 -->
        <text x="280" y="140" font-size="60" fill="#E6A23C">?</text>
        <!-- 装饰元素 -->
        <circle cx="100" cy="80" r="3" fill="#67C23A" opacity="0.6"/>
        <circle cx="320" cy="90" r="4" fill="#F56C6C" opacity="0.6"/>
        <circle cx="80" cy="200" r="2" fill="#909399" opacity="0.6"/>
        <circle cx="340" cy="220" r="3" fill="#409EFF" opacity="0.6"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: var(--admin-padding-lg);
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--admin-padding-lg);
  line-height: 1;
}

.error-message {
  margin-bottom: var(--admin-padding-xl);
}

.error-message h2 {
  font-size: 2rem;
  color: var(--el-text-color-primary);
  margin-bottom: var(--admin-padding-md);
  font-weight: 600;
}

.error-message p {
  font-size: 1.1rem;
  color: var(--el-text-color-regular);
  margin: 0;
}

.error-actions {
  display: flex;
  gap: var(--admin-padding-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--admin-padding-xl);
}

.error-illustration {
  margin-top: var(--admin-padding-xl);
}

.error-illustration svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-message h2 {
    font-size: 1.5rem;
  }
  
  .error-message p {
    font-size: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .el-button {
    width: 200px;
  }
}

/* 暗色主题适配 */
.dark .not-found-container {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}
</style>