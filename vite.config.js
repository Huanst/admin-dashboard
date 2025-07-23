import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          'element-plus': [
            'ElMessage',
            'ElMessageBox',
            'ElNotification',
            'ElLoading'
          ]
        }
      ],
      dts: false
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src')
    }
  },
  server: {
    port: 5177,
    host: '0.0.0.0',
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false
      },
      '/admin': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist', // 保留输出目录配置
    sourcemap: false, // 保留 sourcemap 配置
    rollupOptions: {
      output: {
        // 使用函数形式的 manualChunks
        manualChunks(id) {
          // 将 node_modules 中的模块分到不同的 chunk
          if (id.includes('node_modules')) {
            // element-plus 单独分包
            if (id.includes('element-plus')) {
              return 'element-plus';
            }
            // 将其他大型库（如 echarts）也单独分包
            if (id.includes('echarts')) {
              return 'echarts';
            }
            // 剩下的 node_modules 放入 vendor 包
            return 'vendor';
          }
        }
      }
    }
  }
})