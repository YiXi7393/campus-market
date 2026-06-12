<template>
  <div class="user-profile-container">
    <el-page-header @back="goBack" title="返回" />
    
    <el-card v-loading="loading" style="margin-top: 20px;">
      <div class="profile-header">
        <el-avatar :size="100" :src="profile.avatarUrl">
          {{ profile.nickname ? profile.nickname.charAt(0) : 'U' }}
        </el-avatar>
        <div class="profile-info">
          <h2>{{ profile.nickname }}</h2>
          <div style="margin-top: 10px;">
            <el-tag v-if="profile.campusVerifyStatus === 'APPROVED'" type="success">
              已校园认证
            </el-tag>
            <el-tag v-else type="info">
              未认证
            </el-tag>
          </div>
          <p style="margin-top: 10px; color: #666;">
            专业：{{ profile.major || '未填写' }}
          </p>
        </div>
      </div>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <h3 style="margin: 0;">用户评价</h3>
      </template>
      
      <div v-if="reviewsLoading" style="text-align: center; padding: 20px;">
        <el-icon class="is-loading" style="font-size: 24px;">
          <loading />
        </el-icon>
        <p style="margin-top: 10px;">加载中...</p>
      </div>
      
      <div v-else-if="reviews.length === 0">
        <el-empty description="暂无评价" />
      </div>
      
      <div v-else>
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-header">
            <el-avatar :size="40" :src="review.reviewerAvatarUrl">
              {{ review.reviewerNickname ? review.reviewerNickname.charAt(0) : 'U' }}
            </el-avatar>
            <div class="reviewer-info">
              <span class="reviewer-name">{{ review.reviewerNickname }}</span>
              <el-rate v-model="review.score" disabled show-score style="margin-left: 10px;" />
            </div>
            <span style="color: #999; font-size: 14px;">{{ review.createTime }}</span>
          </div>
          <div class="review-content">{{ review.content }}</div>
          <div class="review-product" @click="goToProduct(review.productId)" style="cursor: pointer;">
            <el-image :src="review.productCoverImageUrl" style="width: 60px; height: 60px; margin-right: 10px;" fit="cover" />
            <span style="color: #409eff;">{{ review.productTitle }}</span>
          </div>
        </div>
        
        <el-pagination
          v-if="total > 0"
          v-model:current-page="reviewPage"
          :page-size="10"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchReviews"
          style="margin-top: 20px; text-align: center;"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const reviewsLoading = ref(false)

const profile = ref({
  id: null,
  username: '',
  nickname: '',
  avatarUrl: '',
  major: '',
  campusVerifyStatus: ''
})

const reviews = ref([])
const reviewPage = ref(1)
const total = ref(0)

const fetchProfile = async () => {
  const userId = route.params.id
  if (!userId) {
    ElMessage.error('用户ID不存在')
    router.push('/home')
    return
  }

  loading.value = true
  try {
    const res = await request.get(`/api/users/${userId}/profile`)
    profile.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchReviews = async () => {
  const userId = route.params.id
  if (!userId) return

  reviewsLoading.value = true
  try {
    const res = await request.get(`/api/users/${userId}/reviews`, {
      params: {
        pageNum: reviewPage.value,
        pageSize: 10
      }
    })
    reviews.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    reviewsLoading.value = false
  }
}

const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchProfile()
  fetchReviews()
})
</script>

<style scoped>
.user-profile-container {
  max-width: 800px;
  margin: 20px auto;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.profile-info {
  margin-left: 20px;
  flex: 1;
}

.profile-info h2 {
  margin: 0;
  font-size: 24px;
}

.review-item {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reviewer-info {
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 10px;
}

.reviewer-name {
  font-weight: bold;
}

.review-content {
  margin-top: 10px;
  color: #333;
  line-height: 1.6;
}

.review-product {
  margin-top: 15px;
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
