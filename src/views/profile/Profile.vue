<template>
  <div class="profile-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        个人中心
      </h2>

      <el-form :model="form" label-width="100px">
        <el-form-item label="头像">
          <div style="display: flex; align-items: center; gap: 20px;">
            <el-avatar :size="80" :src="form.avatar">
              {{ form.nickname?.charAt(0) || '?' }}
            </el-avatar>
            <el-upload
              action="#"
              :auto-upload="true"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
            >
              <el-button type="primary" size="small">上传头像</el-button>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>

        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>

        <el-form-item label="学号">
          <el-input v-model="form.studentNo" />
        </el-form-item>

        <el-form-item label="专业">
          <el-input v-model="form.major" />
        </el-form-item>

        <el-form-item label="学生认证">
          <el-tag
            :type="
              form.campusVerifyStatus === 1 ? 'success' : 'warning'
            "
          >
            {{
              form.campusVerifyStatus === 1
                ? '已认证'
                : '未认证'
            }}
          </el-tag>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleUpdate" :loading="loading">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import request, { TokenStorage } from '@/utils/request'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const uploadingAvatar = ref(false)
const form = reactive({
  id: null,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  studentNo: '',
  major: '',
  avatar: '',
  campusVerifyStatus: 0
})

const fetchCurrentUser = async () => {
  try {
    const res = await request.get('/api/user/me')
    Object.assign(form, res.data)
  } catch (error) {
    console.error(error)
  }
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

const handleAvatarUpload = async (options) => {
  const { file } = options
  uploadingAvatar.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request.post('/api/user/avatar/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.avatar = res.data
    // 更新 localStorage 中的头像
    const currentUserInfo = TokenStorage.getUserInfo()
    if (currentUserInfo) {
      TokenStorage.setUserInfo({
        ...currentUserInfo,
        avatar: res.data
      })
    }
    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('头像上传失败')
  } finally {
    uploadingAvatar.value = false
  }
}

const handleUpdate = async () => {
  loading.value = true
  try {
    await request.put('/api/user/profile', {
      nickname: form.nickname,
      email: form.email,
      phone: form.phone,
      major: form.major
    })
    // 同步更新 localStorage 中的用户信息
    const currentUserInfo = TokenStorage.getUserInfo()
    if (currentUserInfo) {
      TokenStorage.setUserInfo({
        ...currentUserInfo,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        major: form.major,
        avatar: form.avatar
      })
    }
    ElMessage.success('信息更新成功')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCurrentUser()
})
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 20px auto;
}
</style>
