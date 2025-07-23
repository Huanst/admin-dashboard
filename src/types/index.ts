/**
 * 用户类型定义
 */
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  role?: 'user' | 'admin'
  status: 'active' | 'inactive' | 'banned'
  imageCount: number
  createdAt: string
  updatedAt?: string
  lastLoginAt?: string | null
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  timestamp?: string
}

/**
 * 用户列表响应数据
 */
export interface UserListResponse {
  list: User[]
  total: number
  page: number
  pageSize: number
}

/**
 * 图片类型定义
 */
export interface Image {
  id: number
  title: string
  url: string
  thumbnail?: string
  category?: string
  prompt: string
  size?: number
  width?: number
  height?: number
  format?: string
  status: 'published' | 'draft' | 'deleted'
  userId?: number
  username?: string
  email?: string
  createdAt: string
  updatedAt?: string
}

/**
 * 图片列表响应数据
 */
export interface ImageListResponse {
  list: Image[]
  total: number
  page: number
  pageSize: number
}

/**
 * 仪表板统计数据
 */
export interface DashboardStats {
  totalUsers: number
  totalImages: number
  todayImages: number
  activeUsers: number
}

/**
 * 系统配置
 */
export interface SystemConfig {
  basic: {
    systemName: string
    version: string
    adminEmail: string
    timezone: string
    description: string
  }
  image: {
    apiUrl: string
    apiKey: string
    defaultModel: string
    defaultSize: string
    timeout: number
    maxRetries: number
  }
  limits: {
    dailyLimit: number
    hourlyLimit: number
    maxPromptLength: number
    imageRetentionDays: number
    allowRegistration: boolean
  }
  storage: {
    type: string
    path: string
    domain: string
    maxFileSize: number
  }
  security: {
    jwtSecret: string
    tokenExpiry: number
    minPasswordLength: number
    maxLoginAttempts: number
    enableContentFilter: boolean
  }
}
