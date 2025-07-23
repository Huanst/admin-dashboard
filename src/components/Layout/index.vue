<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside 
      class="layout-sidebar"
      :class="{ 'is-collapsed': themeStore.sidebarCollapsed }"
    >
      <Sidebar />
    </aside>
    
    <!-- 主内容区域 -->
    <div class="layout-main">
      <!-- 顶部导航栏 -->
      <header class="layout-header">
        <Header />
      </header>
      
      <!-- 内容区域 -->
      <main class="layout-content">
        <div class="content-wrapper">
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const themeStore = useThemeStore()

// 初始化侧边栏状态
onMounted(() => {
  themeStore.initSidebar()
})
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.layout-sidebar {
  width: var(--admin-sidebar-width);
  height: 100%;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s ease;
  flex-shrink: 0;
  z-index: 1000;
}

.layout-sidebar.is-collapsed {
  width: var(--admin-sidebar-collapsed-width);
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  height: var(--admin-header-height);
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
  z-index: 999;
}

.layout-content {
  flex: 1;
  overflow: hidden;
  background: var(--el-bg-color-page);
}

.content-wrapper {
  height: 100%;
  padding: var(--admin-padding-lg);
  overflow: auto;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .layout-sidebar:not(.is-collapsed) {
    transform: translateX(0);
  }
  
  .layout-main {
    width: 100%;
  }
  
  .content-wrapper {
    padding: var(--admin-padding-md);
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: var(--admin-padding-sm);
  }
}
</style>