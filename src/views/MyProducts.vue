<template>
  <div class="my-products-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">我的商品</h2>

      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="8">
          <span style="display: inline-block; margin-right: 10px;">审核状态：</span>
          <el-select v-model="query.auditStatus" placeholder="请选择" clearable @change="handleSearch" style="width: 200px;">
            <el-option label="待审核" value="PENDING" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已驳回" value="REJECTED" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <span style="display: inline-block; margin-right: 10px;">销售状态：</span>
          <el-select v-model="query.saleStatus" placeholder="请选择" clearable @change="handleSearch" style="width: 200px;">
            <el-option label="上架中" value="ON_SHELF" />
            <el-option label="已下架" value="OFF_SHELF" />
            <el-option label="已售出" value="SOLD" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>

      <el-table :data="productList" border>
        <el-table-column prop="id" label="商品ID" width="80" />
        <el-table-column prop="title" label="商品标题" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">¥ {{ row.price }}</template>
        </el-table-column>
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image style="width: 80px; height: 80px" :src="row.coverImageUrl" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="auditStatusType(row.auditStatus)">
              {{ auditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="saleStatus" label="销售状态" width="100">
          <template #default="{ row }">
            <el-tag :type="saleStatusType(row.saleStatus)">
              {{ saleStatusText(row.saleStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)" :disabled="row.auditStatus !== 'APPROVED' || row.saleStatus !== 'ON_SHELF'">编辑</el-button>
            <el-button type="warning" size="small" @click="handleOffShelf(row)" :disabled="row.saleStatus !== 'ON_SHELF'">下架</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize" :total="total" layout="prev, pager, next" @current-change="fetchProducts" style="margin-top: 20px; text-align: center" />
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  auditStatus: null,
  saleStatus: null
})

const productList = ref([])
const total = ref(0)

const auditStatusText = (status) => {
  const map = { 'PENDING': '待审核', 'APPROVED': '已通过', 'REJECTED': '已驳回' }
  return map[status] || status
}

const auditStatusType = (status) => {
  const map = { 'PENDING': 'warning', 'APPROVED': 'success', 'REJECTED': 'danger' }
  return map[status] || ''
}

const saleStatusText = (status) => {
  const map = { 'ON_SHELF': '上架中', 'OFF_SHELF': '已下架', 'SOLD': '已售出' }
  return map[status] || status
}

const saleStatusType = (status) => {
  const map = { 'ON_SHELF': 'success', 'OFF_SHELF': 'info', 'SOLD': 'warning' }
  return map[status] || ''
}

const fetchProducts = async () => {
  try {
    const params = { pageNum: query.pageNum, pageSize: query.pageSize }
    if (query.auditStatus) params.auditStatus = query.auditStatus
    if (query.saleStatus) params.saleStatus = query.saleStatus
    const res = await request.get('/api/products/me', { params })
    productList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  }
}

const handleSearch = () => {
  query.pageNum = 1
  fetchProducts()
}

const resetSearch = () => {
  query.auditStatus = null
  query.saleStatus = null
  query.pageNum = 1
  fetchProducts()
}

const handleEdit = (row) => {
  router.push(`/edit/${row.id}`)
}

const handleOffShelf = async (row) => {
  try {
    await ElMessageBox.confirm('确认下架此商品？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    await request.post(`/api/products/${row.id}/off-shelf`)
    ElMessage.success('下架成功')
    fetchProducts()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

onMounted(() => {
  fetchProducts()
})
</script>