<template>
  <div class="detail-container">
    <el-page-header @back="goBack" title="返回商品列表" />

    <el-card v-loading="loading" style="margin-top: 20px">
      <el-carousel height="350px" indicator-position="outside" v-if="product.images && product.images.length > 0">
        <el-carousel-item v-for="(img, index) in product.images" :key="index">
          <img :src="img.imageUrl" style="width: 100%; height: 100%; object-fit: contain; background-color: #f5f5f5;" />
        </el-carousel-item>
      </el-carousel>
      <div v-else-if="product.coverImageUrl" style="height: 350px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">
        <img :src="product.coverImageUrl" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
      </div>
      <div v-else style="height: 350px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">
        <span style="color: #999;">暂无图片</span>
      </div>

      <div style="margin-top: 20px; padding: 0 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h2 style="font-size: 24px; font-weight: bold; flex: 1;">{{ product.title }}</h2>
          <div style="display: flex; gap: 10px;">
            <el-button
              :type="product.favorited ? 'danger' : 'default'"
              @click="handleToggleFavorite"
              :icon="product.favorited ? 'StarFilled' : 'Star'"
            >
              {{ product.favorited ? '已收藏' : '收藏' }}
            </el-button>
            <el-button type="warning" @click="handleReport">
              举报
            </el-button>
          </div>
        </div>
        
        <p style="color: #f56c6c; font-size: 28px; font-weight: bold; margin: 15px 0;">
          ¥ {{ product.price }}
        </p>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="卖家">
            <div style="display: flex; align-items: center; cursor: pointer;" @click="goToSellerProfile">
              <el-avatar :size="32" :src="product.sellerAvatarUrl" />
              <span style="margin-left: 10px; color: #409eff;">{{ product.sellerNickname }}</span>
              <el-tag v-if="product.sellerCampusVerifyStatus === 'APPROVED'" type="success" style="margin-left: 10px;">
                已认证
              </el-tag>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="商品分类">
            {{ product.categoryName }}
          </el-descriptions-item>
          <el-descriptions-item label="商品成色">
            {{ conditionText(product.conditionLevel) }}
          </el-descriptions-item>
          <el-descriptions-item label="商品描述">
            {{ product.description || '暂无详细描述' }}
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px; display: flex; gap: 10px;">
          <el-button 
            type="primary" 
            size="large" 
            style="flex: 1;"
            :disabled="!product.canOrder"
            @click="handleOrder"
          >
            立即购买
          </el-button>
          <el-button 
            type="success" 
            size="large"
            :disabled="!product.canOrder"
            @click="handleChat"
          >
            联系卖家
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

const product = ref({
  id: null,
  title: '',
  description: '',
  price: 0,
  categoryName: '',
  conditionLevel: 1,
  coverImageUrl: '',
  images: [],
  sellerId: null,
  sellerNickname: '',
  sellerAvatarUrl: '',
  sellerCampusVerifyStatus: '',
  canOrder: false,
  favorited: false
})

const conditionText = (level) => {
  const map = {
    1: '近乎全新',
    2: '成色较好',
    3: '有明显使用痕迹'
  }
  return map[level] || '未知'
}

const fetchDetail = async () => {
  const productId = route.params.id
  if (!productId) {
    ElMessage.error('商品ID不存在')
    router.push('/home')
    return
  }

  loading.value = true
  try {
    const res = await request.get(`/api/products/${productId}`)
    product.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleOrder = async () => {
  try {
    await ElMessageBox.confirm('确认购买此商品？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await request.post('/api/orders', null, {
      params: { productId: product.value.id }
    })
    ElMessage.success('下单成功！')
    router.push(`/order/${res.data}`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleToggleFavorite = async () => {
  try {
    if (product.value.favorited) {
      await request.delete(`/api/products/${product.value.id}/favorite`)
      product.value.favorited = false
      ElMessage.success('已取消收藏')
    } else {
      await request.post(`/api/products/${product.value.id}/favorite`)
      product.value.favorited = true
      ElMessage.success('已添加收藏')
    }
  } catch (error) {
    console.error(error)
  }
}

const handleReport = () => {
  router.push(`/reports/PRODUCT/${product.value.id}`)
}

const handleChat = () => {
  router.push(`/chat/${product.value.id}`)
}

const goBack = () => {
  router.back()
}

const goToSellerProfile = () => {
  if (product.value.sellerId) {
    router.push(`/user/${product.value.sellerId}`)
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.detail-container {
  max-width: 900px;
  margin: 20px auto;
}
</style>
