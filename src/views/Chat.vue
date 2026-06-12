<template>
  <div class="chat-container">
    <el-card>
      <h2 style="text-align: center; margin-bottom: 20px">
        在线咨询
      </h2>

      <div class="chat-list" v-if="!activeChat">
        <el-empty v-if="chatList.length === 0" description="暂无聊天记录" />

        <el-list v-else>
          <el-list-item v-for="chat in chatList" :key="chat.conversationId" @click="openChat(chat)">
            <el-row justify="space-between" align="middle" style="width: 100%;">
              <el-col :span="18">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <el-avatar :size="40" :src="chat.otherUserAvatar">
                    {{ chat.otherUserNickname?.charAt(0) || '?' }}
                  </el-avatar>
                  <div>
                    <div style="font-weight: bold;">{{ chat.otherUserNickname }}</div>
                    <div style="font-size: 12px; color: #999;">
                      商品: {{ chat.productTitle }}
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6" style="text-align: right;">
                <el-tag v-if="chat.unreadCount > 0" type="danger" size="small">
                  {{ chat.unreadCount }} 条新消息
                </el-tag>
              </el-col>
            </el-row>
          </el-list-item>
        </el-list>
      </div>

      <div class="chat-window" v-else>
        <div class="chat-header">
          <el-button text @click="activeChat = null">返回列表</el-button>
          <span style="margin-left: 10px;">
            与 {{ activeChat.otherUserNickname }} 聊天
          </span>
        </div>
        <div class="chat-messages" ref="messagesRef">
          <div v-if="messages.length === 0" style="text-align: center; color: #999; padding: 20px;">
            暂无消息，开始对话吧
          </div>
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['message', msg.isFromMe ? 'message-self' : 'message-other']"
          >
            <el-avatar :size="32" :src="msg.isFromMe ? myAvatar : activeChat.otherUserAvatar">
              {{ (msg.isFromMe ? myNickname : activeChat.otherUserNickname)?.charAt(0) || '?' }}
            </el-avatar>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.createTime) }}</div>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
          >
            <template #append>
              <el-button @click="sendMessage">发送</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <div v-if="!activeChat" style="margin-top: 20px; text-align: center;">
        <el-button type="primary" @click="startNewChat">发起新聊天</el-button>
      </div>
    </el-card>

    <!-- 选择商品对话框 -->
    <el-dialog v-model="showProductDialog" title="选择商品" width="80%">
      <el-input v-model="searchKeyword" placeholder="搜索商品名称" style="margin-bottom: 20px;">
        <template #append>
          <el-button @click="searchProducts">搜索</el-button>
        </template>
      </el-input>
      <el-row :gutter="20">
        <el-col v-for="product in productList" :key="product.id" :span="6">
          <el-card 
            :body-style="{ padding: '10px' }" 
            shadow="hover" 
            style="cursor: pointer; margin-bottom: 10px;"
            @click="selectProduct(product)"
          >
            <img :src="product.coverImageUrl" style="width: 100%; height: 100px; object-fit: cover;" />
            <div style="padding: 5px; text-align: center;">
              {{ product.title }}
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request, { TokenStorage } from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const chatList = ref([])
const activeChat = ref(null)
const messages = ref([])
const inputMessage = ref('')
const messagesRef = ref(null)
const showProductDialog = ref(false)
const searchKeyword = ref('')
const productList = ref([])

const userInfo = computed(() => TokenStorage.getUserInfo())
const myAvatar = computed(() => userInfo.value?.avatar || '')
const myNickname = computed(() => userInfo.value?.nickname || '我')

const fetchChatList = async () => {
  try {
    const res = await request.get('/api/conversations')
    chatList.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const openChat = async (chat) => {
  activeChat.value = chat
  await fetchMessages(chat.conversationId)
}

const fetchMessages = async (conversationId) => {
  try {
    const res = await request.get(`/api/conversations/${conversationId}/messages`)
    messages.value = res.data || []
    scrollToBottom()
  } catch (error) {
    console.error(error)
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || !activeChat.value) return

  try {
    await request.post(`/api/conversations/${activeChat.value.conversationId}/messages`, {
      content: inputMessage.value.trim()
    })
    messages.value.push({
      content: inputMessage.value.trim(),
      isFromMe: true,
      createTime: new Date().toISOString()
    })
    inputMessage.value = ''
    scrollToBottom()
  } catch (error) {
    console.error(error)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const startNewChat = () => {
  showProductDialog.value = true
  searchProducts()
}

const searchProducts = async () => {
  try {
    const res = await request.get('/api/products', {
      params: { keyword: searchKeyword.value, pageNum: 1, pageSize: 12 }
    })
    productList.value = res.data.records
  } catch (error) {
    console.error(error)
  }
}

const selectProduct = async (product) => {
  showProductDialog.value = false
  try {
    const res = await request.post(`/api/products/${product.id}/conversation`)
    activeChat.value = {
      conversationId: res.data.conversationId,
      otherUserId: res.data.sellerId,
      otherUserNickname: res.data.sellerNickname,
      otherUserAvatar: res.data.sellerAvatar,
      productTitle: product.title
    }
    messages.value = []
  } catch (error) {
    console.error(error)
    ElMessage.error('发起聊天失败')
  }
}

onMounted(() => {
  fetchChatList()
  // 如果有预设的商品ID，直接发起聊天
  if (route.params.productId) {
    selectProduct({ id: route.params.productId, title: '' })
  }
})
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 20px auto;
}
.chat-list {
  min-height: 400px;
}
.chat-window {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}
.chat-header {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 350px;
  max-height: 400px;
}
.message {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.message-self {
  flex-direction: row-reverse;
}
.message-self .message-content {
  align-items: flex-end;
}
.message-other .message-content {
  align-items: flex-start;
}
.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}
.message-text {
  background: #f0f2f5;
  padding: 10px 15px;
  border-radius: 10px;
  word-break: break-all;
}
.message-self .message-text {
  background: #409eff;
  color: white;
}
.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
.chat-input {
  padding: 10px;
  border-top: 1px solid #eee;
}
</style>
