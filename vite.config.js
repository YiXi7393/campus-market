import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: 'localhost',
    port: 5173,        // 前端端口（默认就是这个）
    open: true,        // 启动后自动打开浏览器
    proxy: {
      // 代理 /api 开头的请求到远程后端
      '/api': {
        target: 'http://139.159.150.134:8086',
        changeOrigin: true,
      },
      // 代理 /admin-api 开头的请求到远程后端
      '/admin-api': {
        target: 'http://139.159.150.134:8086',
        changeOrigin: true,
      }
    }
  }
})