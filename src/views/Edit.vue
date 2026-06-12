<template>
  <div class="edit-container">
    <el-page-header @back="goBack" title="返回我的商品" />
    <el-card style="margin-top: 20px;">
      <h2 style="text-align: center; margin-bottom: 20px">
        编辑商品
      </h2>

      <el-form :model="form" label-width="100px">
        <el-form-item label="商品标题">
          <el-input v-model="form.title" placeholder="请输入商品标题" />
        </el-form-item>

        <el-form-item label="商品描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
          />
        </el-form-item>

        <el-form-item label="价格">
          <el-input-number
            v-model="form.price"
            :precision="2"
            :min="0"
            placeholder="请输入价格"
          />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="成色">
          <el-select v-model="form.conditionLevel">
            <el-option label="近乎全新" :value="1" />
            <el-option label="成色较好" :value="2" />
            <el-option label="有明显使用痕迹" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="商品图片">
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :limit="5"
            :file-list="imageFileList"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
            accept="image/*"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleUpdate" :loading="loading">
            保存修改
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

const form = reactive({
  id: null,
  title: '',
  description: '',
  price: 0,
  categoryId: null,
  conditionLevel: 1,
  imageUrls: []
})

const categoryList = ref([])
const imageFiles = ref([])
const imageFileList = ref([])

const fetchCategories = async () => {
  try {
    const res = await request.get('/api/categories')
    categoryList.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const fetchProduct = async () => {
  try {
    const res = await request.get(`/api/products/${route.params.id}`)
    const product = res.data
    Object.assign(form, {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      conditionLevel: product.conditionLevel,
      imageUrls: product.images ? product.images.map(img => img.imageUrl) : []
    })
    // 初始化图片列表
    imageFileList.value = form.imageUrls.map((url, index) => ({
      name: `image-${index}`,
      url: url,
      isExisting: true
    }))
  } catch (e) {
    console.error(e)
  }
}

const handleImageChange = (file) => {
  if (!file.isExisting) {
    imageFiles.value.push(file.raw)
    imageFileList.value.push(file)
  }
}

const handleImageRemove = (file) => {
  const index = imageFiles.value.findIndex(f => f.name === file.name)
  if (index > -1) {
    imageFiles.value.splice(index, 1)
  }
  const fileListIndex = imageFileList.value.findIndex(f => f.name === file.name)
  if (fileListIndex > -1) {
    imageFileList.value.splice(fileListIndex, 1)
  }
}

const handleUpdate = async () => {
  loading.value = true
  try {
    let finalImageUrls = []
    // 先处理已存在的图片
    finalImageUrls = imageFileList.value
      .filter(file => file.isExisting)
      .map(file => file.url)
    // 再处理新上传的图片
    if (imageFiles.value.length > 0) {
      for (const file of imageFiles.value) {
        const imgFormData = new FormData()
        imgFormData.append('file', file)
        const imgRes = await request.post('/api/products/images/upload', imgFormData)
        finalImageUrls.push(imgRes.data)
      }
    }
    form.imageUrls = finalImageUrls

    await request.put(`/api/products/${form.id}`, {
      title: form.title,
      description: form.description,
      price: form.price,
      categoryId: form.categoryId,
      conditionLevel: form.conditionLevel,
      imageUrls: form.imageUrls
    })
    
    ElMessage.success('修改成功，等待审核')
    router.push('/my-products')
  } catch (error) {
    console.error('修改失败', error)
    ElMessage.error(error.message || '修改失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/my-products')
}

onMounted(() => {
  fetchCategories()
  fetchProduct()
})
</script>

<style scoped>
.edit-container {
  max-width: 800px;
  margin: 20px auto;
}
</style>
