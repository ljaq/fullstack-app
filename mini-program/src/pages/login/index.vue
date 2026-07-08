<template>
  <view class="login-page">
    <view class="title">登录</view>
    <wd-input v-model="username" label="用户名" placeholder="请输入用户名" clearable />
    <wd-input v-model="password" label="密码" placeholder="请输入密码" show-password clearable />
    <wd-button type="primary" block :loading="loading" @click="handleLogin">登录</wd-button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { request } from 'api'
import { STORAGES } from 'utils/constant'
import { useUserStore } from 'stores/user'

const username = ref('')
const password = ref('')
const loading = ref(false)
const userStore = useUserStore()

async function handleLogin() {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = (await request.app.auth.login.post({
      body: { username: username.value, password: password.value },
    })) as {
      token: string
      id: number
      username: string
      roles: string[]
      roleNames: string[]
      pages: string[]
      buttons: string[]
    }
    uni.setStorageSync(STORAGES.TOKEN, res.token)
    userStore.setUser({
      id: res.id,
      username: res.username,
      roles: res.roles,
      roleNames: res.roleNames,
      pages: res.pages,
      buttons: res.buttons,
    })
    uni.showToast({ title: '登录成功', icon: 'success' })
    uni.switchTab({ url: '/pages/home/index' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '登录失败'
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  padding: 48rpx 32rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 600;
  margin-bottom: 48rpx;
}
</style>
