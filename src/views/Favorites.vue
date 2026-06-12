<template>
  <div class="favorites-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        我的收藏
      </h2>

      <el-empty v-if="productList.length === 0" description="暂无收藏商品" />

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
              <el-button type="danger" size="small" @click.stop="handleCancelFavorite(product.id)">
                取消收藏
              </el-button>
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
        @current-change="fetchFavorites"
        style="margin-top: 20px; text-align: center;"
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
  pageSize: 12
})
const productList = ref([])
const total = ref(0)

const fetchFavorites = async () => {
  try {
    const res = await request.get('/api/products/favorites', { params: query })
    productList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取收藏列表失败')
  }
}

const goDetail = (id) => {
  router.push(`/product/${id}`)
}

const handleCancelFavorite = async (id) => {
  try {
    await request.delete(`/api/products/${id}/favorite`)
    ElMessage.success('已取消收藏')
    fetchFavorites()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
.favorites-container {
  padding: 20px;
}
.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
</style>
