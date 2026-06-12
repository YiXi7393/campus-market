<template>
  <div class="audit-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        商品审核管理
      </h2>

      <el-table :data="productList" border>
        <el-table-column prop="id" label="商品ID" width="80" />
        <el-table-column prop="title" label="商品标题" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ¥ {{ row.price }}
          </template>
        </el-table-column>
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image
              style="width: 80px; height: 80px"
              :src="row.coverImageUrl"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.auditStatus === 'PENDING'
                  ? 'warning'
                  : row.auditStatus === 'APPROVED'
                  ? 'success'
                  : 'danger'
              "
            >
              {{
                row.auditStatus === 'PENDING'
                  ? '待审核'
                  : row.auditStatus === 'APPROVED'
                  ? '已通过'
                  : '已驳回'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="saleStatus" label="销售状态" width="100">
          <template #default="{ row }">
            <el-tag :type="
                row.saleStatus === 'ON_SHELF'
                  ? 'success'
                  : row.saleStatus === 'OFF_SHELF'
                  ? 'info'
                  : 'warning'
              ">
              {{
                row.saleStatus === 'ON_SHELF'
                  ? '上架中'
                  : row.saleStatus === 'OFF_SHELF'
                  ? '已下架'
                  : '已售出'
              }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button
              type="success"
              size="small"
              :disabled="row.auditStatus !== 'PENDING'"
              @click="handleAudit(row.id, 1)"
            >
              通过
            </el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="row.auditStatus !== 'PENDING'"
              @click="handleReject(row.id)"
            >
              驳回
            </el-button>
            <el-button
              type="warning"
              size="small"
              :disabled="row.saleStatus !== 'ON_SHELF'"
              @click="handleRemove(row.id)"
            >
              强制下架
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchProducts"
        style="margin-top: 20px; text-align: center"
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

const productList = ref([])
const total = ref(0)

const fetchProducts = async () => {
  try {
    const res = await request.get('/admin-api/products/audit', {
      params: query
    })
    productList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  }
}

const handleAudit = async (id, auditStatus, rejectReason = null) => {
  try {
    const data = { auditStatus }
    if (rejectReason) {
      data.rejectReason = rejectReason
    }
    await request.post(`/admin-api/products/${id}/audit`, data)
    ElMessage.success('审核成功')
    fetchProducts()
  } catch (error) {
    console.error(error)
  }
}

const handleReject = (id) => {
  ElMessageBox.prompt('请输入驳回原因', '驳回商品', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    if (!value) {
      ElMessage.warning('请填写驳回原因')
      return
    }
    handleAudit(id, 'REJECTED', value)
  }).catch(() => {})
}

const handleRemove = (id) => {
  ElMessageBox.prompt('请输入下架原因', '强制下架商品', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    if (!value) {
      ElMessage.warning('请填写下架原因')
      return
    }
    try {
      await request.post(`/admin-api/products/${id}/remove`, {
        reason: value
      })
      ElMessage.success('下架成功！')
      fetchProducts()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.audit-container {
  padding: 20px;
}
</style>