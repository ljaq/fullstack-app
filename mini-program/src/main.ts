import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'
// import { registerAuthRefresh } from 'api'
// 小程序可在此注册 401 静默刷新，例如微信登录换票：
// registerAuthRefresh(() => ensureWechatLogin())

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  return {
    app,
    Pinia,
  }
}
