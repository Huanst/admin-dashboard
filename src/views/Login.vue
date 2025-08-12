<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="login-title">后台管理系统</h1>
        <p class="login-subtitle">欢迎登录管理后台</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="authStore.loading"
            @click="handleLogin"
          >
            {{ authStore.loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <div class="theme-toggle">
          <el-button
            :icon="themeStore.isDark ? 'Sunny' : 'Moon'"
            circle
            @click="themeStore.toggleTheme"
          />
        </div>
      </div>
    </div>
    
    <!-- 闪烁星星背景 -->
    <div class="stars-background" ref="starsBackground">
      <!-- 随机位置的星星层 -->
      <div class="stars-layer random-stars-1" ref="starsLayer1"></div>
      <div class="stars-layer random-stars-2" ref="starsLayer2"></div>
      <div class="stars-layer random-stars-3" ref="starsLayer3"></div>
      <div class="stars-layer random-stars-4" ref="starsLayer4"></div>
      
      <!-- 精密复杂的金牛座星座 -->
      <div class="constellation taurus-constellation">
        <!-- 主要亮星 -->
        <div class="star star-aldebaran" data-name="毕宿五"></div>
        <div class="star star-elnath" data-name="五车五"></div>
        <div class="star star-zeta" data-name="天关"></div>
        <div class="star star-lambda" data-name="天廪一"></div>
        <div class="star star-gamma" data-name="天廪二"></div>
        <div class="star star-delta" data-name="天廪三"></div>
        <div class="star star-epsilon" data-name="天廪四"></div>
        
        <!-- 昴宿星团（七姐妹星团）-->
        <div class="star-cluster pleiades">
          <div class="star star-alcyone" data-name="昴宿六"></div>
          <div class="star star-atlas" data-name="昴宿一"></div>
          <div class="star star-electra" data-name="昴宿三"></div>
          <div class="star star-maia" data-name="昴宿四"></div>
          <div class="star star-merope" data-name="昴宿二"></div>
          <div class="star star-taygeta" data-name="昴宿五"></div>
          <div class="star star-pleione" data-name="昴宿增一"></div>
          <div class="star star-celaeno" data-name="昴宿七"></div>
          <div class="star star-sterope" data-name="昴宿八"></div>
        </div>
        
        <!-- 毕宿星团 -->
        <div class="star-cluster hyades">
          <div class="star star-theta1" data-name="毕宿一"></div>
          <div class="star star-theta2" data-name="毕宿二"></div>
          <div class="star star-gamma-hyades" data-name="毕宿三"></div>
          <div class="star star-delta-hyades" data-name="毕宿四"></div>
          <div class="star star-epsilon-hyades" data-name="毕宿六"></div>
        </div>
        
        <!-- 次要星星 -->
        <div class="star star-kappa" data-name="天廪五"></div>
        <div class="star star-upsilon" data-name="天廪六"></div>
        <div class="star star-nu" data-name="天廪七"></div>
        <div class="star star-xi" data-name="天廪八"></div>
        <div class="star star-omicron" data-name="天廪九"></div>
        
        <!-- 星座连线 -->
        <svg class="constellation-lines" viewBox="0 0 500 400">
          <!-- 主体轮廓 -->
          <path d="M 120 180 L 180 120 L 260 140 L 340 130 L 400 150 L 380 200 L 320 220 L 260 200 L 180 220 L 120 180" 
                stroke="rgba(255,255,255,0.4)" stroke-width="1.5" fill="none"/>
          <!-- 昴宿星团连线 -->
          <path d="M 350 80 L 360 85 L 370 82 L 375 90 L 365 95 L 355 92 L 350 80" 
                stroke="rgba(135,206,250,0.6)" stroke-width="1" fill="none"/>
          <!-- 毕宿星团连线 -->
          <path d="M 180 220 L 190 225 L 200 220 L 195 230 L 185 235 L 180 220" 
                stroke="rgba(255,165,0,0.5)" stroke-width="1" fill="none"/>
          <!-- 牛角 -->
          <path d="M 180 120 L 160 100 M 180 120 L 200 105" 
                stroke="rgba(255,255,255,0.5)" stroke-width="2" fill="none"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import type { LoginCredentials } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 星空背景引用
const starsBackground = ref<HTMLElement>()
const starsLayer1 = ref<HTMLElement>()
const starsLayer2 = ref<HTMLElement>()
const starsLayer3 = ref<HTMLElement>()
const starsLayer4 = ref<HTMLElement>()

// 登录表单数据
const loginForm = reactive<LoginCredentials>({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
}

/**
 * 生成随机星星位置的CSS背景
 * @param count - 星星数量
 * @returns CSS背景字符串
 */
const generateRandomStars = (count: number): string => {
  const stars = []
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100
    const y = Math.random() * 100
    const size = Math.random() * 2 + 1 // 1-3px
    const opacity = Math.random() * 0.5 + 0.5 // 0.5-1
    stars.push(`radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(255,255,255,${opacity}), transparent)`)
  }
  return stars.join(', ')
}

/**
 * 更新星星层的随机位置
 */
const updateStarsPositions = () => {
  if (starsLayer1.value) {
    starsLayer1.value.style.backgroundImage = generateRandomStars(15)
  }
  if (starsLayer2.value) {
    starsLayer2.value.style.backgroundImage = generateRandomStars(12)
  }
  if (starsLayer3.value) {
    starsLayer3.value.style.backgroundImage = generateRandomStars(18)
  }
  if (starsLayer4.value) {
    starsLayer4.value.style.backgroundImage = generateRandomStars(10)
  }
}

/**
 * 初始化星空效果
 */
const initStarField = () => {
  updateStarsPositions()
  
  // 为每个星星层设置智能位置更新
  const layers = [
    { ref: starsLayer1, duration: 3000, count: 15 },
    { ref: starsLayer2, duration: 4000, count: 12 },
    { ref: starsLayer3, duration: 5000, count: 18 },
    { ref: starsLayer4, duration: 3500, count: 10 }
  ]
  
  layers.forEach((layer, index) => {
    setInterval(() => {
      // 在星星最暗的时候（动画周期的0%和100%时）更新位置
      if (layer.ref.value) {
        // 先让星星完全暗淡
        layer.ref.value.style.opacity = '0'
        
        // 在暗淡期间更新位置
        setTimeout(() => {
          layer.ref.value!.style.backgroundImage = generateRandomStars(layer.count)
          // 恢复正常动画
          layer.ref.value!.style.opacity = ''
        }, 100) // 100ms的暗淡期用于位置切换
      }
    }, layer.duration)
  })
}

// 组件挂载后初始化星空
import { onMounted } from 'vue'
onMounted(() => {
  initStarField()
})

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  const result = await authStore.login(loginForm)
  if (result.success) {
    router.push('/')
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-box {
  position: relative;
  z-index: 10;
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

html.dark .login-box {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

html.dark .login-title {
  color: #ffffff;
}

.login-subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

html.dark .login-subtitle {
  color: #bdc3c7;
}

.login-form {
  margin-bottom: 24px;
}

.login-form .el-form-item {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.4);
}

.login-footer {
  display: flex;
  justify-content: center;
}

.theme-toggle {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.theme-toggle:hover {
  opacity: 1;
}

/* 闪烁星星背景 */
.stars-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 随机位置的星星层 */
.random-stars-1,
.random-stars-2,
.random-stars-3,
.random-stars-4 {
  background-repeat: no-repeat;
  background-size: 100% 100%;
  transition: opacity 0.1s ease;
}

.random-stars-1 {
  animation: sparkle 3s ease-in-out infinite;
}

.random-stars-2 {
  animation: sparkle 4s ease-in-out infinite reverse;
}

.random-stars-3 {
  animation: sparkle 5s ease-in-out infinite;
}

.random-stars-4 {
  animation: sparkle 3.5s ease-in-out infinite reverse;
}

@keyframes sparkle {
  0% {
    opacity: 0.2;
  }
  25% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  75% {
    opacity: 0.6;
  }
  100% {
    opacity: 0.2;
  }
}

/* 精密复杂的金牛座星座样式 */
.constellation {
  position: absolute;
  top: 8%;
  right: 10%;
  width: 500px;
  height: 400px;
  opacity: 0.8;
}

.constellation-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  animation: starTwinkle 2s ease-in-out infinite;
}

/* 主要亮星 */
.star-aldebaran {
  width: 5px;
  height: 5px;
  top: 180px;
  left: 120px;
  background: #ff6b35; /* 橙红色，毕宿五 */
  animation-delay: 0s;
}

.star-elnath {
  width: 4px;
  height: 4px;
  top: 120px;
  left: 180px;
  background: #87ceeb; /* 蓝白色，五车五 */
  animation-delay: 0.3s;
}

.star-zeta {
  width: 3px;
  height: 3px;
  top: 140px;
  left: 260px;
  background: #ffd700; /* 金色，天关 */
  animation-delay: 0.6s;
}

.star-lambda {
  width: 3px;
  height: 3px;
  top: 130px;
  left: 340px;
  animation-delay: 0.9s;
}

.star-gamma {
  width: 3px;
  height: 3px;
  top: 150px;
  left: 400px;
  animation-delay: 1.2s;
}

.star-delta {
  width: 3px;
  height: 3px;
  top: 200px;
  left: 380px;
  animation-delay: 1.5s;
}

.star-epsilon {
  width: 3px;
  height: 3px;
  top: 200px;
  left: 320px;
  animation-delay: 1.8s;
}

/* 昴宿星团（七姐妹星团）*/
.star-cluster.pleiades {
  position: absolute;
  top: 60px;
  right: 50px;
  width: 80px;
  height: 60px;
}

.pleiades .star {
  background: #87ceeb;
  box-shadow: 0 0 15px rgba(135, 206, 250, 0.9);
}

.star-alcyone {
  width: 3px;
  height: 3px;
  top: 25px;
  left: 35px;
  animation-delay: 0.1s;
}

.star-atlas {
  width: 2px;
  height: 2px;
  top: 20px;
  left: 25px;
  animation-delay: 0.2s;
}

.star-electra {
  width: 2px;
  height: 2px;
  top: 15px;
  left: 45px;
  animation-delay: 0.3s;
}

.star-maia {
  width: 2px;
  height: 2px;
  top: 30px;
  left: 50px;
  animation-delay: 0.4s;
}

.star-merope {
  width: 2px;
  height: 2px;
  top: 35px;
  left: 40px;
  animation-delay: 0.5s;
}

.star-taygeta {
  width: 2px;
  height: 2px;
  top: 40px;
  left: 30px;
  animation-delay: 0.6s;
}

.star-pleione {
  width: 1px;
  height: 1px;
  top: 10px;
  left: 35px;
  animation-delay: 0.7s;
}

.star-celaeno {
  width: 1px;
  height: 1px;
  top: 45px;
  left: 55px;
  animation-delay: 0.8s;
}

.star-sterope {
  width: 1px;
  height: 1px;
  top: 50px;
  left: 20px;
  animation-delay: 0.9s;
}

/* 毕宿星团 */
.star-cluster.hyades {
  position: absolute;
  top: 200px;
  left: 150px;
  width: 100px;
  height: 80px;
}

.hyades .star {
  background: #ffa500;
  box-shadow: 0 0 12px rgba(255, 165, 0, 0.8);
}

.star-theta1 {
  width: 2px;
  height: 2px;
  top: 20px;
  left: 30px;
  animation-delay: 2.1s;
}

.star-theta2 {
  width: 2px;
  height: 2px;
  top: 25px;
  left: 35px;
  animation-delay: 2.2s;
}

.star-gamma-hyades {
  width: 2px;
  height: 2px;
  top: 15px;
  left: 50px;
  animation-delay: 2.3s;
}

.star-delta-hyades {
  width: 2px;
  height: 2px;
  top: 30px;
  left: 60px;
  animation-delay: 2.4s;
}

.star-epsilon-hyades {
  width: 2px;
  height: 2px;
  top: 40px;
  left: 45px;
  animation-delay: 2.5s;
}

/* 次要星星 */
.star-kappa {
  width: 2px;
  height: 2px;
  top: 170px;
  left: 280px;
  animation-delay: 3.0s;
}

.star-upsilon {
  width: 2px;
  height: 2px;
  top: 190px;
  left: 300px;
  animation-delay: 3.1s;
}

.star-nu {
  width: 2px;
  height: 2px;
  top: 160px;
  left: 200px;
  animation-delay: 3.2s;
}

.star-xi {
  width: 2px;
  height: 2px;
  top: 210px;
  left: 240px;
  animation-delay: 3.3s;
}

.star-omicron {
  width: 2px;
  height: 2px;
  top: 220px;
  left: 280px;
  animation-delay: 3.4s;
}

@keyframes starTwinkle {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  25% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
  75% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-box {
    width: 90%;
    padding: 24px;
  }
  
  .login-title {
    font-size: 24px;
  }
}
</style>