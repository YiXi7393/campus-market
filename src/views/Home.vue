<template>
  <div class="home-container">
    <el-row justify="space-between" align="middle" style="margin-bottom: 20px">
      <h2 style="margin: 0">商品浏览</h2>
      <el-button type="primary" @click="goPublish">发布商品</el-button>
    </el-row>

    <el-card style="margin-bottom: 20px;">
      <el-row :gutter="20" style="margin-bottom: 15px;">
        <el-col :span="8">
          <el-input v-model="query.keyword" placeholder="请输入商品名称搜索" clearable @clear="handleSearch" @keyup.enter="handleSearch" />
        </el-col>
        <el-col :span="6">
          <el-select v-model="query.categoryId" placeholder="请选择分类" clearable @change="handleSearch">
            <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-col>
      </el-row>

      <!-- 高级筛选 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <span style="display: inline-block; margin-right: 10px;">价格区间:</span>
          <el-input-number
            v-model="query.minPrice"
            :min="0"
            :precision="2"
            placeholder="最低价"
            style="width: 120px; margin-right: 10px;"
            @change="handleSearch"
          />
          <span>-</span>
          <el-input-number
            v-model="query.maxPrice"
            :min="0"
            :precision="2"
            placeholder="最高价"
            style="width: 120px; margin-left: 10px;"
            @change="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <span style="display: inline-block; margin-right: 10px;">成色:</span>
          <el-select v-model="query.conditionLevel" placeholder="请选择成色" clearable @change="handleSearch" style="width: 150px;">
            <el-option label="近乎全新" :value="1" />
            <el-option label="成色较好" :value="2" />
            <el-option label="有明显使用痕迹" :value="3" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20">
      <el-col v-for="product in productList" :key="product.id" :span="6">
        <el-card 
          :body-style="{ padding: '10px' }" 
          shadow="hover" 
          style="cursor: pointer;"
          @click="goDetail(product.id)"
        >
          <img :src="product.coverImageUrl" class="product-image" />
          <div style="padding: 10px;">
            <h4>{{ product.title }}</h4>
            <p style="color: red; font-size: 18px;">
              ¥ {{ product.price }}
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-pagination
      v-model:current-page="query.pageNum"
      v-model:page-size="query.pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="handlePageChange"
      style="margin-top: 20px; text-align: center;"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()

const query = ref({ keyword: '', categoryId: null, minPrice: null, maxPrice: null, conditionLevel: null, pageNum: 1, pageSize: 8 })
const productList = ref([])
const categoryList = ref([])
const total = ref(0)

const goDetail = (id) => {
  router.push(`/product/${id}`)
}

const goPublish = () => {
  router.push('/publish')
}

const fetchProducts = async () => {
  try {
    const res = await request.get('/api/products', { params: query.value })
    productList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取商品失败')
  }
}

const fetchCategories = async () => {
  try {
    const res = await request.get('/api/categories')
    categoryList.value = res.data
  } catch (e) {
    console.error(e)
    ElMessage.error('获取分类失败')
  }
}

const handleSearch = () => {
  query.value.pageNum = 1
  fetchProducts()
}

const handlePageChange = (page) => {
  query.value.pageNum = page
  fetchProducts()
}

const resetSearch = () => {
  query.value = {
    keyword: '',
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    conditionLevel: null,
    pageNum: 1,
    pageSize: 8
  }
  fetchProducts()
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.home-container { padding: 20px; }
.product-image { width: 100%; height: 180px; object-fit: cover; }
</style>