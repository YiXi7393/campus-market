<template>
  <div class="reports-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        举报内容
      </h2>

      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="举报类型" prop="reportType">
          <el-select v-model="form.reportType" placeholder="请选择举报类型" style="width: 100%;">
            <el-option label="商品举报" value="PRODUCT" />
            <el-option label="用户举报" value="USER" />
            <el-option label="评价举报" value="REVIEW" />
          </el-select>
        </el-form-item>

        <el-form-item label="目标ID" prop="targetId">
          <el-input v-model="form.targetId" placeholder="请输入被举报内容的ID" />
        </el-form-item>

        <el-form-item label="举报原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细描述举报原因"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading" style="width: 100%;">
            提交举报
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button @click="goBack" style="width: 100%;">
            返回
          </el-button>
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

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  reportType: 'PRODUCT',
  targetId: '',
  reason: ''
})

const rules = {
  reportType: [{ required: true, message: '请选择举报类型', trigger: 'change' }],
  targetId: [
    { required: true, message: '请输入目标ID', trigger: 'blur' },
    { type: 'number', message: '目标ID必须是数字', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入举报原因', trigger: 'blur' },
    { min: 10, message: '举报原因至少10个字', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await request.post('/api/reports', {
        reportType: form.reportType,
        targetId: Number(form.targetId),
        reason: form.reason
      })
      ElMessage.success('举报已提交，感谢您的反馈')
      router.back()
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  // 如果路由参数有预设的类型和ID
  if (route.params.type) {
    form.reportType = route.params.type
  }
  if (route.params.targetId) {
    form.targetId = route.params.targetId
  }
})
</script>

<style scoped>
.reports-container {
  max-width: 600px;
  margin: 20px auto;
}
</style>
