<template>
  <div class="sidebar">
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <div class="logo-content">
        <el-icon class="logo-icon" :size="32">
          <Management />
        </el-icon>
        <transition name="fade">
          <span v-show="!themeStore.sidebarCollapsed" class="logo-text">
            管理后台
          </span>
        </transition>
      </div>
    </div>
    
    <!-- 菜单区域 -->
    <div class="sidebar-menu">
      <el-menu
        :default-active="activeMenu"
        :collapse="themeStore.sidebarCollapsed"
        :unique-opened="true"
        router
        class="sidebar-menu-el"
      >
        <!-- 仪表盘 -->
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <!-- 用户管理 -->
        <el-sub-menu index="/users">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/users/list">
            <el-icon><List /></el-icon>
            <template #title>用户列表</template>
          </el-menu-item>
        </el-sub-menu>
        
        <!-- 图片管理 -->
        <el-sub-menu index="/images">
          <template #title>
            <el-icon><Picture /></el-icon>
            <span>图片管理</span>
          </template>
          <el-menu-item index="/images/list">
            <el-icon><List /></el-icon>
            <template #title>图片列表</template>
          </el-menu-item>
          <el-menu-item index="/images/analytics">
            <el-icon><TrendCharts /></el-icon>
            <template #title>生成分析</template>
          </el-menu-item>
        </el-sub-menu>
        
        <!-- AI图片生成 -->
        <el-menu-item index="/generate">
          <el-icon><PictureFilled /></el-icon>
          <template #title>AI图片生成</template>
        </el-menu-item>
        
        <!-- 系统设置 -->
        <el-sub-menu index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/system/config">
            <el-icon><Tools /></el-icon>
            <template #title>系统配置</template>
          </el-menu-item>
          <el-menu-item index="/system/logs">
            <el-icon><Document /></el-icon>
            <template #title>系统日志</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import {
  Management,
  DataBoard,
  User,
  Picture,
  PictureFilled,
  Setting,
  List,
  TrendCharts,
  Tools,
  Document
} from '@element-plus/icons-vue'

const route = useRoute()
const themeStore = useThemeStore()

// 当前激活的菜单项
const activeMenu = computed(() => {
  const path = route.path
  
  // 根据路径匹配对应的菜单项
  if (path.startsWith('/users')) {
    return '/users/list'
  } else if (path.startsWith('/images')) {
    if (path.includes('analytics')) {
      return '/images/analytics'
    }
    return '/images/list'
  } else if (path.startsWith('/system')) {
    if (path.includes('logs')) {
      return '/system/logs'
    }
    return '/system/config'
  }
  
  return '/dashboard'
})
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.sidebar-logo {
  height: var(--admin-header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 var(--admin-padding-md);
}

.logo-content {
  display: flex;
  align-items: center;
  gap: var(--admin-padding-sm);
}

.logo-icon {
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  overflow: hidden;
}

.sidebar-menu-el {
  border: none;
  height: 100%;
  overflow-y: auto;
}

.sidebar-menu-el:not(.el-menu--collapse) {
  width: var(--admin-sidebar-width);
}

/* 菜单项样式优化 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  padding: 0 var(--admin-padding-lg) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

:deep(.el-menu-item.is-active)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--el-color-primary);
}

:deep(.el-sub-menu .el-menu-item) {
  padding-left: calc(var(--admin-padding-lg) + 24px) !important;
  background-color: transparent;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9);
}

/* 折叠状态下的样式 */
:deep(.el-menu--collapse) {
  width: var(--admin-sidebar-collapsed-width);
}

:deep(.el-menu--collapse .el-menu-item),
:deep(.el-menu--collapse .el-sub-menu__title) {
  padding: 0 calc((var(--admin-sidebar-collapsed-width) - 24px) / 2) !important;
  justify-content: center;
}

/* 滚动条样式 */
.sidebar-menu-el::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu-el::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu-el::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 2px;
}

.sidebar-menu-el::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>