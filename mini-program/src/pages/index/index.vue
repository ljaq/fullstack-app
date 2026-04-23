<template>
  <view class="container">
    <view class="header">
      <text class="title">欢迎使用小程序</text>
    </view>

    <view class="content">
      <view class="info-card">
        <text class="info-text">这是一个基于 uni-app 的全栈小程序</text>
        <text class="info-text">复用现有 API 请求层</text>
      </view>

      <view class="button-group">
        <button class="btn-primary" @click="testAdapter">测试适配器</button>
        <button class="btn-secondary" @click="goToLogin">前往登录</button>
      </view>

      <view v-if="apiResult" class="result-card">
        <text class="result-title">API 响应：</text>
        <text class="result-text">{{ apiResult }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { request } from 'api'

const apiResult = ref('')

// 测试平台适配器
const testAdapter = () => {
  try {
    void request.app.auth.me.get()
  } catch (error: any) {
    apiResult.value = `适配器错误: ${error.message || error}\n\n${error.stack || ''}`
  }
}

// 前往登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/src/pages/login/index',
  })
}
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  padding-top: 80rpx;

  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
  }
}

.content {
  .info-card {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 40rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);

    .info-text {
      display: block;
      font-size: 28rpx;
      color: #333333;
      line-height: 1.8;
      margin-bottom: 10rpx;
    }
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    margin-bottom: 40rpx;

    button {
      height: 88rpx;
      border-radius: 44rpx;
      font-size: 32rpx;
      font-weight: bold;
      border: none;

      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
      }

      &.btn-secondary {
        background: #ffffff;
        color: #667eea;
      }
    }
  }

  .result-card {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 40rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);

    .result-title {
      display: block;
      font-size: 28rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 20rpx;
    }

    .result-text {
      display: block;
      font-size: 24rpx;
      color: #666666;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>
