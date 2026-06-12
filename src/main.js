import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 引入路由配置
import pinia from './store'   // 引入状态管理

//  引入 Element Plus 及其样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

//  引入你封装的 Axios（即使现在是 Mock，保留结构也很重要）
import './utils/request'

const app = createApp(App)

//  注册插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')