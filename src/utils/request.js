// src/utils/request.js
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'

// Token 存储工具
const TokenStorage = {
  USER_TOKEN_KEY: 'userToken',
  ADMIN_TOKEN_KEY: 'adminToken',
  USER_INFO_KEY: 'userInfo',

  // 获取用户 Token
  getUserToken() {
    return localStorage.getItem(this.USER_TOKEN_KEY)
  },

  // 设置用户 Token
  setUserToken(token) {
    localStorage.setItem(this.USER_TOKEN_KEY, token)
  },

  // 获取管理员 Token
  getAdminToken() {
    return localStorage.getItem(this.ADMIN_TOKEN_KEY)
  },

  // 设置管理员 Token
  setAdminToken(token) {
    localStorage.setItem(this.ADMIN_TOKEN_KEY, token)
  },

  // 获取用户信息
  getUserInfo() {
    const info = localStorage.getItem(this.USER_INFO_KEY)
    return info ? JSON.parse(info) : null
  },

  // 设置用户信息
  setUserInfo(info) {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(info))
  },

  // 清除所有 Token 和信息
  clearAll() {
    localStorage.removeItem(this.USER_TOKEN_KEY)
    localStorage.removeItem(this.ADMIN_TOKEN_KEY)
    localStorage.removeItem(this.USER_INFO_KEY)
  },

  // 判断是否是管理员接口
  isAdminApi(url) {
    return url.startsWith('/admin-api/')
  }
}

// 1. 创建 Axios 实例
const service = axios.create({
  baseURL: '/',
  timeout: 10000
})

// 2. 请求拦截器
service.interceptors.request.use(
  config => {
    let token
    if (TokenStorage.isAdminApi(config.url)) {
      token = TokenStorage.getAdminToken()
    } else {
      token = TokenStorage.getUserToken()
    }
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data

    if (res.code !== 1) {
      // 401 表示未授权
      if (res.code === 401) {
        ElMessageBox.confirm(
          '您的登录状态已过期，请重新登录',
          '系统提示',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          TokenStorage.clearAll()
          router.push('/login')
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error)
    if (!error.response || error.response.status !== 401) {
      ElMessage({
        message: error.message || '网络错误',
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export { service as default, TokenStorage }