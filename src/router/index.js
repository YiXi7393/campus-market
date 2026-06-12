import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import Home from '../views/Home.vue'
import Publish from '../views/Publish.vue'
import Edit from '../views/Edit.vue'
import MyProducts from '../views/MyProducts.vue'
import Audit from '../views/admin/Audit.vue'
import Profile from '../views/profile/Profile.vue'
import ChangePassword from '../views/profile/ChangePassword.vue'
import ProductDetail from '../views/product/ProductDetail.vue'
import Orders from '../views/order/Orders.vue'
import OrderDetail from '../views/order/OrderDetail.vue'
import UserProfile from '../views/user/UserProfile.vue'
import Favorites from '../views/Favorites.vue'
import BrowseHistory from '../views/BrowseHistory.vue'
import Reports from '../views/Reports.vue'
import AdminUsers from '../views/admin/Users.vue'
import AdminReports from '../views/admin/Reports.vue'
import AdminCampusVerify from '../views/admin/CampusVerify.vue'
import Chat from '../views/Chat.vue'
import { TokenStorage } from '../utils/request'


// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, requiresAdmin: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, requiresAdmin: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresAuth: false, requiresAdmin: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: Publish,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/edit/:id',
    name: 'Edit',
    component: Edit,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/my-products',
    name: 'MyProducts',
    component: MyProducts,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  { 
    path: '/product/:id', 
    name: 'ProductDetail', 
    component: ProductDetail,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/browse-history',
    name: 'BrowseHistory',
    component: BrowseHistory,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/reports/:type?/:targetId?',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  {
    path: '/chat/:productId?',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: true, requiresAdmin: false, userOnly: true }
  },
  // 管理员路由
  {
    path: '/admin/audit',
    name: 'Audit',
    component: Audit,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: AdminReports,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/campus-verify',
    name: 'AdminCampusVerify',
    component: AdminCampusVerify,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userInfo = TokenStorage.getUserInfo()
  const userToken = TokenStorage.getUserToken()
  const adminToken = TokenStorage.getAdminToken()
  
  const isLoggedIn = !!(userInfo && userToken)
  const isAdminLoggedIn = !!adminToken

  if (to.meta.requiresAuth) {
    if (!isLoggedIn && !isAdminLoggedIn) {
      next('/login')
      return
    }
    if (to.meta.requiresAdmin && !isAdminLoggedIn) {
      next('/login')
      return
    }
    // 防止管理员访问普通用户页面
    if (to.meta.userOnly && isAdminLoggedIn && !isLoggedIn) {
      next('/login')
      return
    }
  }

  if (to.path === '/login' || to.path === '/register' || to.path === '/forgot-password') {
    if (isAdminLoggedIn) {
      next('/admin/audit')
      return
    }
    if (isLoggedIn) {
      next('/home')
      return
    }
  }

  next()
})

export default router
