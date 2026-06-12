<template>
  <div class="order-detail-container">
    <el-page-header @back="goBack" title="返回订单列表" />

    <el-card v-loading="loading" style="margin-top: 20px;">
      <h2 style="text-align: center; margin-bottom: 20px">
        订单详情
      </h2>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单号">
          {{ order.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="商品">
          <div style="display: flex; align-items: center;">
            <el-image :src="order.productCoverImageUrl" style="width: 80px; height: 80px; margin-right: 10px;" fit="cover" />
            <span>{{ order.productTitle }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span style="color: #f56c6c; font-size: 18px; font-weight: bold;">¥ {{ order.orderAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="买家">
          {{ order.buyerNickname }}
        </el-descriptions-item>
        <el-descriptions-item label="卖家">
          {{ order.sellerNickname }}
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="statusType(order.status)">
            {{ statusText(order.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ order.createTime }}
        </el-descriptions-item>
        <el-descriptions-item v-if="order.confirmedTime" label="确认时间">
          {{ order.confirmedTime }}
        </el-descriptions-item>
        <el-descriptions-item v-if="order.completedTime" label="完成时间">
          {{ order.completedTime }}
        </el-descriptions-item>
        <el-descriptions-item v-if="order.cancelReason" label="取消原因">
          {{ order.cancelReason }}
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px; display: flex; gap: 10px;">
        <el-button
          type="success"
          v-if="order.canConfirm"
          @click="handleConfirm"
        >
          确认订单
        </el-button>
        <el-button
          type="primary"
          v-if="order.canComplete"
          @click="handleComplete"
        >
          完成订单
        </el-button>
        <el-button
          type="danger"
          v-if="order.canCancel"
          @click="handleCancel"
        >
          取消订单
        </el-button>
      </div>
    </el-card>

    <!-- 评价区域 -->
    <el-card v-if="order.status === 'COMPLETED'" style="margin-top: 20px;">
      <h3 style="margin-bottom: 20px;">
        {{ review ? '订单评价' : '评价订单' }}
      </h3>
      
      <!-- 已评价时显示评价内容 -->
      <div v-if="review">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="评分">
            <el-rate v-model="review.score" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="评价内容">
            {{ review.content }}
          </el-descriptions-item>
          <el-descriptions-item label="评价时间">
            {{ review.createTime }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 未评价且可评价时显示评价表单 -->
      <div v-else-if="order.canReview">
        <el-form :model="reviewForm" label-width="80px">
          <el-form-item label="评分">
            <el-rate v-model="reviewForm.score" />
          </el-form-item>
          <el-form-item label="评价内容">
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入评价内容"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmitReview" :loading="submittingReview">
              提交评价
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submittingReview = ref(false)

const order = ref({
  id: null,
  orderNo: '',
  productId: null,
  productTitle: '',
  productCoverImageUrl: '',
  buyerId: null,
  buyerNickname: '',
  sellerId: null,
  sellerNickname: '',
  orderAmount: 0,
  status: '',
  createTime: '',
  confirmedTime: null,
  completedTime: null,
  cancelReason: null,
  canConfirm: false,
  canCancel: false,
  canComplete: false,
  canReview: false
})

const review = ref(null)
const reviewForm = reactive({
  score: 5,
  content: ''
})

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

const fetchDetail = async () => {
  const orderId = route.params.id
  if (!orderId) {
    ElMessage.error('订单ID不存在')
    router.push('/orders')
    return
  }

  loading.value = true
  try {
    const res = await request.get(`/api/orders/${orderId}`)
    order.value = res.data
    if (order.value.status === 'COMPLETED') {
      fetchReview()
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchReview = async () => {
  try {
    const res = await request.get(`/api/orders/${order.value.id}/reviews`)
    if (res.data.records && res.data.records.length > 0) {
      review.value = res.data.records[0]
    }
  } catch (error) {
    console.error(error)
  }
}

const handleSubmitReview = async () => {
  if (!reviewForm.content.trim()) {
    ElMessage.warning('请输入评价内容')
    return
  }
  if (!reviewForm.score) {
    ElMessage.warning('请选择评分')
    return
  }

  submittingReview.value = true
  try {
    await request.post('/api/reviews', {
      orderId: order.value.id,
      score: reviewForm.score,
      content: reviewForm.content
    })
    ElMessage.success('评价成功！')
    fetchDetail()
  } catch (error) {
    console.error(error)
  } finally {
    submittingReview.value = false
  }
}

const handleConfirm = async () => {
  try {
    await request.post(`/api/orders/${order.value.id}/confirm`)
    ElMessage.success('确认成功！')
    fetchDetail()
  } catch (error) {
    console.error(error)
  }
}

const handleComplete = async () => {
  try {
    await ElMessageBox.confirm('确认订单已完成？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.post(`/api/orders/${order.value.id}/complete`)
    ElMessage.success('订单已完成！')
    fetchDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleCancel = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '请输入取消原因'
    })
    await request.post(`/api/orders/${order.value.id}/cancel`, null, {
      params: { remark: value }
    })
    ElMessage.success('订单已取消！')
    fetchDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const goBack = () => {
  router.push('/orders')
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.order-detail-container {
  max-width: 800px;
  margin: 20px auto;
}
</style>
