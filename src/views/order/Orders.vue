<template>
  <div class="orders-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        我的订单
      </h2>

      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="8">
          <span style="display: inline-block; margin-right: 10px;">订单状态：</span>
          <el-select v-model="query.status" placeholder="请选择" clearable @change="handleSearch" style="width: 200px;">
            <el-option label="待确认" value="PENDING_CONFIRM" />
            <el-option label="交易中" value="IN_TRANSACTION" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <span style="display: inline-block; margin-right: 10px;">身份视角：</span>
          <el-select v-model="query.identityType" placeholder="请选择" clearable @change="handleSearch" style="width: 200px;">
            <el-option label="全部" value="ALL" />
            <el-option label="买家" value="BUYER" />
            <el-option label="卖家" value="SELLER" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>

      <el-table :data="orderList" border>
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column label="商品封面" width="120">
          <template #default="{ row }">
            <el-image
              style="width: 80px; height: 80px"
              :src="row.productCoverImageUrl"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="productTitle" label="商品标题" />
        <el-table-column prop="orderAmount" label="价格" width="100">
          <template #default="{ row }">
            ¥ {{ row.orderAmount }}
          </template>
        </el-table-column>
        <el-table-column label="对方" width="120">
          <template #default="{ row }">
            {{ row.sellerNickname || row.buyerNickname }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goDetail(row.id)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchOrders"
        style="margin-top: 20px; text-align: center"
      />
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  status: null,
  identityType: 'ALL'
})

const orderList = ref([])
const total = ref(0)

const statusText = (status) => {
  const map = {
    'PENDING_CONFIRM': '待确认',
    'IN_TRANSACTION': '交易中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return map[status] || status
}

const statusType = (status) => {
  const map = {
    'PENDING_CONFIRM': 'warning',
    'IN_TRANSACTION': 'primary',
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  }
  return map[status] || ''
}

const fetchOrders = async () => {
  try {
    const params = {
      pageNum: query.pageNum,
      pageSize: query.pageSize
    }
    if (query.status) params.status = query.status
    if (query.identityType) params.identityType = query.identityType

    const res = await request.get('/api/orders/mine', {
      params
    })
    orderList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  }
}

const handleSearch = () => {
  query.pageNum = 1
  fetchOrders()
}

const resetSearch = () => {
  query.status = null
  query.identityType = 'ALL'
  query.pageNum = 1
  fetchOrders()
}

const goDetail = (id) => {
  router.push(`/order/${id}`)
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-container {
  padding: 20px;
}
</style>
