<template>
  <div id="app">
    <router-view />
    <!-- API连接状态检测 -->
    <ApiStatus />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import ApiStatus from '@/components/ApiStatus.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()

// 应用初始化
onMounted(async () => {
  // 初始化主题
  themeStore.initTheme()
  
  // 尝试从本地存储恢复登录状态
  await authStore.restoreFromStorage()
})
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--el-bg-color-page);
}

::-webkit-scrollbar-thumb {
  background: var(--el-border-color-light);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color);
}
</style>