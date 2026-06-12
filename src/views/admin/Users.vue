<template>
  <div class="admin-users-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        用户管理
      </h2>

      <el-form :inline="true" style="margin-bottom: 20px;">
        <el-form-item label="搜索">
          <el-input v-model="query.keyword" placeholder="搜索用户名/邮箱" clearable @clear="fetchUsers" @keyup.enter="fetchUsers" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchUsers">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="userList" border>
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              {{ row.nickname?.charAt(0) || '?' }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.banned ? 'danger' : 'success'">
              {{ row.banned ? '已封禁' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="校园认证" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.campusVerifyStatus === 'APPROVED'" type="success">已认证</el-tag>
            <el-tag v-else-if="row.campusVerifyStatus === 'PENDING'" type="warning">待审核</el-tag>
            <el-tag v-else type="info">未认证</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewDetail(row)">
              详情
            </el-button>
            <el-button 
              v-if="!row.banned" 
              type="danger" 
              size="small" 
              link 
              @click="handleBan(row.id)"
            >
              封禁
            </el-button>
            <el-button 
              v-else 
              type="success" 
              size="small" 
              link 
              @click="handleUnban(row.id)"
            >
              解封
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchUsers"
        style="margin-top: 20px; text-align: center;"
      />
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="用户详情" width="600px">
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentUser.studentNo || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ currentUser.major || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentUser.banned ? 'danger' : 'success'">
            {{ currentUser.banned ? '已封禁' : '正常' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="校园认证">
          <el-tag v-if="currentUser.campusVerifyStatus === 'APPROVED'" type="success">已认证</el-tag>
          <el-tag v-else-if="currentUser.campusVerifyStatus === 'PENDING'" type="warning">待审核</el-tag>
          <el-tag v-else type="info">未认证</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ formatTime(currentUser.createTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: ''
})
const userList = ref([])
const total = ref(0)
const showDetailDialog = ref(false)
const currentUser = ref(null)

const fetchUsers = async () => {
  try {
    const res = await request.get('/admin-api/users', { params: query })
    userList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取用户列表失败')
  }
}

const viewDetail = async (row) => {
  try {
    const res = await request.get(`/admin-api/users/${row.id}`)
    currentUser.value = res.data
    showDetailDialog.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('获取用户详情失败')
  }
}

const handleBan = (id) => {
  ElMessageBox.prompt('请输入封禁原因', '封禁用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    if (!value) {
      ElMessage.warning('请填写封禁原因')
      return
    }
    try {
      await request.post(`/admin-api/users/${id}/ban`, { reason: value })
      ElMessage.success('用户已封禁')
      fetchUsers()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleUnban = (id) => {
  ElMessageBox.prompt('请输入解封原因', '解封用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    try {
      await request.post(`/admin-api/users/${id}/unban`, { reason: value || '' })
      ElMessage.success('用户已解封')
      fetchUsers()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-users-container {
  padding: 20px;
}
</style>
