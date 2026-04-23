<template>
  <view class="login-container">
    <view class="login-box">
      <view class="logo-section">
        <text class="logo-title">用户登录</text>
        <text class="logo-subtitle">欢迎回来</text>
      </view>

      <view class="form-section">
        <view class="form-item">
          <view class="form-label">用户名</view>
          <input
            v-model="formData.username"
            class="form-input"
            placeholder="请输入用户名"
            placeholder-class="placeholder"
          />
        </view>

        <view class="form-item">
          <view class="form-label">密码</view>
          <input
            v-model="formData.password"
            class="form-input"
            type="password"
            placeholder="请输入密码"
            placeholder-class="placeholder"
          />
        </view>

        <button class="login-btn" :disabled="loading" @click="handleLogin">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <view class="tips">
          <text class="tip-text">测试账号：admin / 123456</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { request } from 'api'

const formData = reactive({
  username: '',
  password: '',
})

const loading = ref(false)

const handleLogin = async () => {
  if (!formData.username || !formData.password) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none',
    })
    return
  }

  try {
    loading.value = true

    // 调用登录 API（示例）
    // const result = await request.app.auth.login.post({
    //   body: {
    //     username: formData.username,
    //     password: formData.password,
    //   },
    // })

    // 模拟登录成功
    setTimeout(() => {
      loading.value = false
      uni.showToast({
        title: '登录成功',
        icon: 'success',
      })

      // 保存 token（示例）
      // uni.setStorageSync('token', result.token)

      // 返回首页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }, 1000)
  } catch (error: any) {
    loading.value = false
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none',
    })
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-box {
  width: 100%;
  background: #ffffff;
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

.logo-section {
  text-align: center;
  margin-bottom: 60rpx;

  .logo-title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 10rpx;
  }

  .logo-subtitle {
    display: block;
    font-size: 28rpx;
    color: #999999;
  }
}

.form-section {
  .form-item {
    margin-bottom: 30rpx;

    .form-label {
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 15rpx;
      display: block;
    }

    .form-input {
      width: 100%;
      height: 88rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      padding: 0 30rpx;
      font-size: 28rpx;
      color: #333333;
      box-sizing: border-box;

      &.placeholder {
        color: #999999;
      }
    }
  }

  .login-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    margin-top: 20rpx;

    &:disabled {
      opacity: 0.6;
    }
  }

  .tips {
    text-align: center;
    margin-top: 40rpx;

    .tip-text {
      font-size: 24rpx;
      color: #999999;
    }
  }
}
</style>
