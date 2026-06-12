<template>
  <div class="browse-history-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        浏览历史
      </h2>

      <div style="text-align: right; margin-bottom: 20px;">
        <el-button type="danger" @click="handleClearHistory" :loading="clearing">
          清空历史
        </el-button>
      </div>

      <el-empty v-if="productList.length === 0" description="暂无浏览记录" />

      <el-row :gutter="20" v-else>
        <el-col v-for="product in productList" :key="product.id" :span="6">
          <el-card 
            :body-style="{ padding: '10px' }" 
            shadow="hover" 
            style="cursor: pointer; margin-bottom: 20px;"
            @click="goDetail(product.id)"
          >
            <img :src="product.coverImageUrl" class="product-image" />
            <div style="padding: 10px;">
              <h4>{{ product.title }}</h4>
              <p style="color: red; font-size: 18px;">¥ {{ product.price }}</p>
              <p style="font-size: 12px; color: #999;">
                浏览于 {{ formatTime(product.browseTime) }}
              </p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-pagination
        v-if="total > 0"
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchBrowseHistory"
        style="margin-top: 20px; text-align: center;"
      />
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
  pageSize: 12
})
const productList = ref([])
const total = ref(0)
const clearing = ref(false)

const fetchBrowseHistory = async () => {
  try {
    const res = await request.get('/api/products/browse-history', { params: query })
    productList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取浏览历史失败')
  }
}

const goDetail = (id) => {
  router.push(`/product/${id}`)
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString()
}

const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有浏览历史吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    clearing.value = true
    await request.delete('/api/products/browse-history')
    ElMessage.success('浏览历史已清空')
    productList.value = []
    total.value = 0
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  } finally {
    clearing.value = false
  }
}

onMounted(() => {
  fetchBrowseHistory()
})
</script>

<style scoped>
.browse-history-container {
  padding: 20px;
}
.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
</style>
