<template>
  <div class="header">
    <!-- 左侧区域 -->
    <div class="header-left">
      <!-- 折叠按钮 -->
      <el-button
        class="collapse-btn"
        :icon="themeStore.sidebarCollapsed ? 'Expand' : 'Fold'"
        @click="themeStore.toggleSidebar"
      />
      
      <!-- 面包屑导航 -->
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item
          v-for="item in breadcrumbList"
          :key="item.path"
          :to="item.path === route.path ? undefined : item.path"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 右侧区域 -->
    <div class="header-right">
      <!-- 主题切换 -->
      <el-tooltip content="切换主题" placement="bottom">
        <el-button
          class="theme-btn"
          :icon="themeStore.isDark ? 'Sunny' : 'Moon'"
          circle
          @click="themeStore.toggleTheme"
        />
      </el-tooltip>
      
      <!-- 全屏切换 -->
      <el-tooltip content="全屏" placement="bottom">
        <el-button
          class="fullscreen-btn"
          :icon="isFullscreen ? 'Aim' : 'FullScreen'"
          circle
          @click="toggleFullscreen"
        />
      </el-tooltip>
      
      <!-- 用户信息 -->
      <el-dropdown class="user-dropdown" @command="handleCommand">
        <div class="user-info">
          <el-avatar
            :size="32"
            :src="authStore.user?.avatar"
            class="user-avatar"
          >
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="user-name">{{ authStore.user?.username || '管理员' }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人资料
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              账户设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import {
  Expand,
  Fold,
  Sunny,
  Moon,
  FullScreen,
  Aim,
  User,
  ArrowDown,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// 全屏状态
const isFullscreen = ref(false)

// 面包屑导航
const breadcrumbList = computed(() => {
  const path = route.path
  const breadcrumbs = [{ title: '首页', path: '/dashboard' }]
  
  if (path.startsWith('/users')) {
    breadcrumbs.push({ title: '用户管理', path: '/users' })
    if (path === '/users/list') {
      breadcrumbs.push({ title: '用户列表', path: '/users/list' })
    }
  } else if (path.startsWith('/images')) {
    breadcrumbs.push({ title: '图片管理', path: '/images' })
    if (path === '/images/list') {
      breadcrumbs.push({ title: '图片列表', path: '/images/list' })
    } else if (path === '/images/analytics') {
      breadcrumbs.push({ title: '生成分析', path: '/images/analytics' })
    }
  } else if (path.startsWith('/system')) {
    breadcrumbs.push({ title: '系统设置', path: '/system' })
    if (path === '/system/config') {
      breadcrumbs.push({ title: '系统配置', path: '/system/config' })
    } else if (path === '/system/logs') {
      breadcrumbs.push({ title: '系统日志', path: '/system/logs' })
    }
  }
  
  return breadcrumbs
})

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      // 跳转到个人资料页面
      break
    case 'settings':
      // 跳转到账户设置页面
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await authStore.logout()
        router.push('/login')
      } catch {
        // 用户取消操作
      }
      break
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--admin-padding-lg);
  background: var(--el-bg-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--admin-padding-lg);
}

.collapse-btn {
  border: none;
  background: transparent;
  color: var(--el-text-color-regular);
}

.collapse-btn:hover {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.breadcrumb {
  font-size: 14px;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--admin-padding-md);
}

.theme-btn,
.fullscreen-btn {
  border: none;
  background: transparent;
  color: var(--el-text-color-regular);
}

.theme-btn:hover,
.fullscreen-btn:hover {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--admin-padding-sm);
  padding: var(--admin-padding-sm) var(--admin-padding-md);
  border-radius: var(--admin-border-radius);
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background: var(--el-fill-color-light);
}

.user-avatar {
  flex-shrink: 0;
}

.user-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 12px;
  color: var(--el-text-color-regular);
  transition: transform 0.3s ease;
}

.user-dropdown.is-active .dropdown-icon {
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 var(--admin-padding-md);
  }
  
  .header-left {
    gap: var(--admin-padding-md);
  }
  
  .breadcrumb {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .header-right {
    gap: var(--admin-padding-sm);
  }
}
</style>