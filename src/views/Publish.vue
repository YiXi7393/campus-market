<template>
  <div class="publish-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        发布商品
      </h2>

      <el-form :model="form" label-width="100px" ref="formRef">
        <el-form-item label="商品标题" required>
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

        <el-form-item label="价格" required>
          <el-input-number
            v-model="form.price"
            :precision="2"
            :min="0"
            placeholder="请输入价格"
          />
        </el-form-item>

        <el-form-item label="分类" required>
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

        <el-form-item label="商品图片" required>
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :limit="5"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
            accept="image/*"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
            style="width: 100%"
          >
            提交发布
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  title: '',
  description: '',
  price: 0,
  categoryId: null,
  conditionLevel: 1,
  imageUrls: []
})

const imageFiles = ref([])
const imageFileList = ref([])
const categoryList = ref([])

const fetchCategories = async () => {
  try {
    const res = await request.get('/api/categories')
    categoryList.value = res.data
  } catch (e) {
    console.error(e)
    ElMessage.error('获取分类失败')
  }
}

const handleImageChange = (file) => {
  imageFiles.value.push(file.raw)
  imageFileList.value.push(file)
}

const handleImageRemove = (file) => {
  const index = imageFiles.value.findIndex(f => f.name === file.name)
  if (index > -1) {
    imageFiles.value.splice(index, 1)
    imageFileList.value.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!form.title || !form.price || !form.categoryId || imageFiles.value.length === 0) {
    ElMessage.warning('请填写完整商品信息并上传图片')
    return
  }

  loading.value = true
  try {
    const uploadedUrls = []
    for (const file of imageFiles.value) {
      const imgFormData = new FormData()
      imgFormData.append('file', file)
      const imgRes = await request.post('/api/products/images/upload', imgFormData)
      uploadedUrls.push(imgRes.data)
    }
    form.imageUrls = uploadedUrls

    await request.post('/api/products', {
      title: form.title,
      description: form.description,
      price: form.price,
      categoryId: form.categoryId,
      conditionLevel: form.conditionLevel,
      imageUrls: form.imageUrls
    })

    ElMessage.success('发布成功，等待审核')
    router.push('/home')
  } catch (error) {
    console.error('发布失败', error)
    ElMessage.error(error.message || '发布失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.publish-container {
  max-width: 800px;
  margin: 20px auto;
}
</style>
