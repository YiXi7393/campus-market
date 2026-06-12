<template>
  <el-container class="layout-container">
    <el-header class="layout-header">
      <div class="header-content">
        <div class="logo">校园二手市场</div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSelect"
          class="header-menu"
        >
          <template v-if="!isAdmin">
            <el-menu-item index="/home">商品列表</el-menu-item>
            <el-menu-item index="/publish">发布商品</el-menu-item>
            <el-menu-item index="/my-products">我的商品</el-menu-item>
            <el-menu-item index="/orders">我的订单</el-menu-item>
            <el-sub-menu index="user-center">
              <template #title>个人中心</template>
              <el-menu-item index="/profile">我的资料</el-menu-item>
              <el-menu-item index="/favorites">我的收藏</el-menu-item>
              <el-menu-item index="/browse-history">浏览历史</el-menu-item>
              <el-menu-item index="/change-password">修改密码</el-menu-item>
            </el-sub-menu>
          </template>
          <template v-else>
            <el-menu-item index="/admin/audit">商品审核</el-menu-item>
            <el-menu-item index="/admin/users">用户管理</el-menu-item>
            <el-menu-item index="/admin/campus-verify">校园认证</el-menu-item>
            <el-menu-item index="/admin/reports">举报处理</el-menu-item>
          </template>
        </el-menu>
        <div class="user-info">
          <span>{{ userInfo?.nickname || '用户' }}</span>
          <el-button type="primary" link @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </el-header>
    <el-main class="layout-main">
      <slot />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { TokenStorage } from '@/utils/request'

const router = useRouter()
const route = useRoute()

const userInfo = computed(() => TokenStorage.getUserInfo())
const isAdmin = computed(() => userInfo.value?.isAdmin)

const activeMenu = computed(() => route.path)

const handleSelect = (path) => {
  router.push(path)
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    TokenStorage.clearAll()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.layout-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 60px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-right: 40px;
}

.header-menu {
  flex: 1;
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.layout-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
