<template>
  <div class="admin-campus-verify-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        校园认证审核
      </h2>

      <el-table :data="verifyList" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" width="200">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 10px;">
              <el-avatar :size="40" :src="row.userAvatar">
                {{ row.userNickname?.charAt(0) || '?' }}
              </el-avatar>
              <div>
                <div>{{ row.userNickname }}</div>
                <div style="font-size: 12px; color: #999;">{{ row.userEmail }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column label="认证图片" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.verifyImageUrl"
              style="width: 60px; height: 60px"
              :src="row.verifyImageUrl"
              fit="cover"
              :preview-src-list="[row.verifyImageUrl]"
            />
            <span v-else>未上传</span>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.submitTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PENDING' ? 'warning' : row.status === 'APPROVED' ? 'success' : 'danger'">
              {{ row.status === 'PENDING' ? '待审核' : row.status === 'APPROVED' ? '已通过' : '已驳回' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'PENDING'"
              type="success"
              size="small"
              @click="handleApprove(row.id)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              type="danger"
              size="small"
              @click="handleReject(row.id)"
            >
              驳回
            </el-button>
            <span v-else style="color: #999;">
              {{ row.handleTime ? '已处理' : '' }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchVerifyList"
        style="margin-top: 20px; text-align: center;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const query = reactive({
  pageNum: 1,
  pageSize: 10
})
const verifyList = ref([])
const total = ref(0)

const fetchVerifyList = async () => {
  try {
    const res = await request.get('/admin-api/users/campus-verify/page', { params: query })
    verifyList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取认证列表失败')
  }
}

const handleApprove = async (id) => {
  try {
    await request.put(`/admin-api/users/${id}/campus-verify`, {
      status: 'APPROVED'
    })
    ElMessage.success('认证已通过')
    fetchVerifyList()
  } catch (error) {
    console.error(error)
  }
}

const handleReject = (id) => {
  ElMessageBox.prompt('请输入驳回原因', '驳回认证', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    try {
      await request.put(`/admin-api/users/${id}/campus-verify`, {
        status: 'REJECTED',
        rejectReason: value || '信息不符'
      })
      ElMessage.success('认证已驳回')
      fetchVerifyList()
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
  fetchVerifyList()
})
</script>

<style scoped>
.admin-campus-verify-container {
  padding: 20px;
}
</style>
