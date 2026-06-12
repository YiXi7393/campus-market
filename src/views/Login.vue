<template>
  <div class="login-container">
    <el-card class="login-box">
      <h2 style="text-align: center; margin-bottom: 20px;">
        校园二手市场
      </h2>

      <el-form :model="form" label-width="80px">
        <el-form-item label="邮箱">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="身份">
          <el-select
            v-model="form.role"
            placeholder="请选择身份"
            style="width: 100%"
          >
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            style="width: 100%"
            :loading="loading"
          >
            登 录
          </el-button>
        </el-form-item>

        <el-form-item>
          <div style="text-align: center; width: 100%;">
            <el-link type="primary" @click="goRegister">
              没有账号？点击注册
            </el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import request, { TokenStorage } from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
  role: 'user'
})

const handleLogin = async () => {
  if (!form.email || !form.password) {
    ElMessage.warning('请输入邮箱和密码')
    return
  }

  loading.value = true
  try {
    let res
    if (form.role === 'admin') {
      // 管理员登录
      res = await request.post('/admin-api/auth/login', {
        email: form.email,
        password: form.password
      })
      TokenStorage.setAdminToken(res.data.token)
      TokenStorage.setUserInfo({ ...res.data, isAdmin: true })
      ElMessage.success('管理员登录成功')
      router.push('/admin/audit')
    } else {
      // 普通用户登录
      res = await request.post('/api/auth/login', {
        email: form.email,
        password: form.password
      })
      TokenStorage.setUserToken(res.data.token)
      TokenStorage.setUserInfo({ ...res.data, isAdmin: false })
      ElMessage.success('登录成功')
      router.push('/home')
    }
  } catch (error) {
    console.error('登录失败', error)
    ElMessage.error(error.message || '邮箱或密码错误')
  } finally {
    loading.value = false
  }
}

const goRegister = () => {
  router.push('/register')
}

const goForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.login-box {
  width: 400px;
}
</style>