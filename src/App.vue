<template>
  <div id="app">
    <template v-if="['/login', '/register', '/forgot-password'].includes($route.path)">
      <router-view />
    </template>
    <template v-else>
      <Layout>
        <router-view />
      </Layout>
    </template>
  </div>
</template>

<script setup>
import Layout from './components/Layout.vue'
</script>

<style>
/* 全局基础样式，确保页面边距正常 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
body {
  margin: 0; /* 移除浏览器默认边距 */
}
</style>