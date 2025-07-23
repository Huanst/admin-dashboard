import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const isDark = ref(false)
  const sidebarCollapsed = ref(false)

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
    localStorage.setItem('admin_theme', isDark.value ? 'dark' : 'light')
  }

  // 应用主题
  const applyTheme = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('admin_theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = systemDark
    }
    
    applyTheme()
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('admin_theme')) {
        isDark.value = e.matches
        applyTheme()
      }
    })
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('admin_sidebar_collapsed', String(sidebarCollapsed.value))
  }

  // 初始化侧边栏状态
  const initSidebar = () => {
    const saved = localStorage.getItem('admin_sidebar_collapsed')
    if (saved !== null) {
      sidebarCollapsed.value = saved === 'true'
    }
  }

  return {
    // 状态
    isDark: readonly(isDark),
    sidebarCollapsed: readonly(sidebarCollapsed),
    
    // 方法
    toggleTheme,
    toggleSidebar,
    initTheme,
    initSidebar
  }
})