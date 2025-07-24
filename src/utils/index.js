import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

// 配置dayjs
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

/**
 * 格式化日期
 * @param {string|Date} date 日期
 * @param {string} format 格式
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  // 使用本地时区显示时间（浏览器会自动处理时区转换）
  return dayjs(date).format(format)
}

/**
 * 获取相对时间
 * @param {string|Date} date 日期
 * @returns {string} 相对时间字符串
 */
export const getRelativeTime = (date) => {
  // 统一处理时间格式，确保相同日期显示相同的相对时间
  const inputDate = dayjs(date)
  const now = dayjs()

  // 计算日期差异（只考虑日期，不考虑具体时间）
  const startOfInputDate = inputDate.startOf('day')
  const startOfToday = now.startOf('day')
  const daysDiff = startOfToday.diff(startOfInputDate, 'day')

  if (daysDiff === 0) {
    return '今天'
  } else if (daysDiff === 1) {
    return '1天前'
  } else if (daysDiff === 2) {
    return '2天前'
  } else if (daysDiff < 7) {
    return `${daysDiff}天前`
  } else if (daysDiff < 30) {
    const weeks = Math.floor(daysDiff / 7)
    return `${weeks}周前`
  } else if (daysDiff < 365) {
    const months = Math.floor(daysDiff / 30)
    return `${months}个月前`
  } else {
    const years = Math.floor(daysDiff / 365)
    return `${years}年前`
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 防抖函数
 * @param {Function} fn 要防抖的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 防抖后的函数
 */
export const debounce = (fn, delay) => {
  let timeoutId = null
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn 要节流的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 节流后的函数
 */
export const throttle = (fn, delay) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, delay)
    }
  }
}

/**
 * 深拷贝
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 生成随机ID
 * @param {number} length 长度
 * @returns {string} 随机ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 下载文件
 * @param {string} url 文件URL
 * @param {string} filename 文件名
 */
export const downloadFile = (url, filename) => {
  if (!url) {
    throw new Error('下载链接不能为空')
  }
  
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'download'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载文件失败:', error)
    throw new Error('下载文件失败')
  }
}

/**
 * 复制到剪贴板
 * @param {string} text 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
export const copyToClipboard = async (text) => {
  if (!text) {
    console.warn('复制内容不能为空')
    return false
  }
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    return false
  }
}