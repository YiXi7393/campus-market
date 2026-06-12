<template>
  <div class="forgot-password-container">
    <el-card class="forgot-box">
      <h2 style="text-align: center; margin-bottom: 20px;">
        找回密码
      </h2>

      <el-steps :active="step" align-center style="margin-bottom: 30px;">
        <el-step title="验证邮箱" />
        <el-step title="设置新密码" />
        <el-step title="完成" />
      </el-steps>

      <!-- 步骤1: 验证邮箱 -->
      <div v-if="step === 0">
        <el-form :model="step1Form" label-width="100px">
          <el-form-item label="邮箱">
            <el-input v-model="step1Form.email" placeholder="请输入注册邮箱">
              <template #append>
                <el-button @click="sendCode" :disabled="countdown > 0 || !step1Form.email">
                  {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="验证码">
            <el-input v-model="step1Form.code" placeholder="请输入验证码" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="verifyCode" style="width: 100%">
              下一步
            </el-button>
          </el-form-item>

          <el-form-item>
            <div style="text-align: center; width: 100%;">
              <el-link type="primary" @click="goLogin">
                想起密码了？点击登录
              </el-link>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 设置新密码 -->
      <div v-if="step === 1">
        <el-form :model="step2Form" label-width="100px" :rules="rules" ref="step2FormRef">
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="step2Form.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="step2Form.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="resetPassword" style="width: 100%" :loading="loading">
              确认重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3: 完成 -->
      <div v-if="step === 2" style="text-align: center;">
        <el-result
          icon="success"
          title="密码重置成功"
          sub-title="请使用新密码登录"
        >
          <template #extra>
            <el-button type="primary" @click="goLogin">返回登录</el-button>
          </template>
        </el-result>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const step = ref(0)
const countdown = ref(0)
const step2FormRef = ref(null)
let countdownTimer = null

const step1Form = reactive({
  email: '',
  code: ''
})

const step2Form = reactive({
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== step2Form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const sendCode = async () => {
  if (!step1Form.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  try {
    await request.post('/api/auth/forgot-password/code', { email: step1Form.email })
    ElMessage.success('验证码已发送')
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
      }
    }, 1000)
  } catch (error) {
    console.error(error)
  }
}

const verifyCode = () => {
  if (!step1Form.email || !step1Form.code) {
    ElMessage.warning('请填写完整信息')
    return
  }
  // 验证码验证由后端完成，这里直接进入下一步
  step.value = 1
}

const resetPassword = async () => {
  await step2FormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await request.post('/api/auth/forgot-password/reset', {
        email: step1Form.email,
        code: step1Form.code,
        newPassword: step2Form.newPassword,
        confirmPassword: step2Form.confirmPassword
      })
      step.value = 2
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}

const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}
.forgot-box {
  width: 450px;
}
</style>
