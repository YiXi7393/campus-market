<template>
  <div class="admin-reports-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        举报处理
      </h2>

      <el-table :data="reportList" border>
        <el-table-column prop="id" label="举报ID" width="80" />
        <el-table-column label="举报类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getReportTypeTag(row.reportType)">
              {{ getReportTypeText(row.reportType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标ID" width="100">
          <template #default="{ row }">
            {{ row.targetId }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="举报原因" min-width="200" />
        <el-table-column label="举报人" width="120">
          <template #default="{ row }">
            {{ row.reporterNickname || '用户' + row.reporterId }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PENDING' ? 'warning' : row.status === 'HANDLED' ? 'success' : 'info'">
              {{ row.status === 'PENDING' ? '待处理' : row.status === 'HANDLED' ? '已处理' : '已忽略' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="举报时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewDetail(row)">
              详情
            </el-button>
            <el-dropdown v-if="row.status === 'PENDING'" @command="(cmd) => handleCommand(cmd, row)">
              <el-button type="warning" size="small" link>
                处理 <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="handle">处理</el-dropdown-item>
                  <el-dropdown-item command="ignore">忽略</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchReports"
        style="margin-top: 20px; text-align: center;"
      />
    </el-card>

    <!-- 举报详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="举报详情" width="600px">
      <el-descriptions :column="2" border v-if="currentReport">
        <el-descriptions-item label="举报ID">{{ currentReport.id }}</el-descriptions-item>
        <el-descriptions-item label="举报类型">
          <el-tag :type="getReportTypeTag(currentReport.reportType)">
            {{ getReportTypeText(currentReport.reportType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标ID">{{ currentReport.targetId }}</el-descriptions-item>
        <el-descriptions-item label="举报人">
          {{ currentReport.reporterNickname || '用户' + currentReport.reporterId }}
        </el-descriptions-item>
        <el-descriptions-item label="举报时间" :span="2">
          {{ formatTime(currentReport.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="举报原因" :span="2">
          {{ currentReport.reason }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentReport.status === 'PENDING' ? 'warning' : currentReport.status === 'HANDLED' ? 'success' : 'info'">
            {{ currentReport.status === 'PENDING' ? '待处理' : currentReport.status === 'HANDLED' ? '已处理' : '已忽略' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理备注" v-if="currentReport.handleNote">
          {{ currentReport.handleNote }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer v-if="currentReport && currentReport.status === 'PENDING'">
        <el-button @click="handleIgnore">忽略</el-button>
        <el-button type="warning" @click="handleReport">处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const query = reactive({
  pageNum: 1,
  pageSize: 10
})
const reportList = ref([])
const total = ref(0)
const showDetailDialog = ref(false)
const currentReport = ref(null)

const fetchReports = async () => {
  try {
    const res = await request.get('/admin-api/reports', { params: query })
    reportList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取举报列表失败')
  }
}

const getReportTypeText = (type) => {
  const map = { PRODUCT: '商品举报', USER: '用户举报', REVIEW: '评价举报' }
  return map[type] || type
}

const getReportTypeTag = (type) => {
  const map = { PRODUCT: 'danger', USER: 'warning', REVIEW: 'info' }
  return map[type] || ''
}

const viewDetail = async (row) => {
  try {
    const res = await request.get(`/admin-api/reports/${row.id}`)
    currentReport.value = res.data
    showDetailDialog.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('获取举报详情失败')
  }
}

const handleCommand = (cmd, row) => {
  if (cmd === 'handle') {
    handleReport()
  } else if (cmd === 'ignore') {
    handleIgnore()
  }
}

const handleReport = () => {
  ElMessageBox.prompt('请输入处理备注', '处理举报', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    try {
      await request.post(`/admin-api/reports/${currentReport.value.id}/handle`, {
        note: value || ''
      })
      ElMessage.success('举报已处理')
      showDetailDialog.value = false
      fetchReports()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleIgnore = async () => {
  try {
    await request.post(`/admin-api/reports/${currentReport.value.id}/handle`, {
      note: '忽略此举报'
    })
    ElMessage.success('举报已忽略')
    showDetailDialog.value = false
    fetchReports()
  } catch (error) {
    console.error(error)
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => {
  fetchReports()
})
</script>

<style scoped>
.admin-reports-container {
  padding: 20px;
}
</style>
