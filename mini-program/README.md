# mini-program 使用指南

## 快速开始

### 1. 启动开发服务器

**H5 端（推荐用于开发测试）：**
```bash
cd mini-program
pnpm dev:h5
# 访问 http://localhost:3607/
```

**微信小程序端：**
```bash
cd mini-program
pnpm dev:mp-weixin
# 使用微信开发者工具打开 dist/dev/mp-weixin 目录
```

### 2. 项目结构

```
mini-program/
├── src/
│   ├── pages/           # 页面
│   │   ├── index/      # 首页
│   │   └── login/      # 登录页
│   ├── components/     # 公共组件
│   ├── utils/          # 工具函数
│   ├── store/          # 状态管理
│   ├── manifest.json   # 应用配置
│   ├── pages.json      # 页面路由配置
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── vite.config.ts      # Vite 配置
└── package.json        # 依赖配置
```

### 3. API 调用

使用与 Web 端相同的 API 客户端：

```vue
<script setup lang="ts">
import { request } from 'api'

// 完整类型提示
const fetchData = async () => {
  const result = await request.jaq.auth.me.get()
  console.log(result)
}
</script>
```

### 4. 平台适配器

所有平台相关的 API 已自动适配：

```ts
import { platformAdapter } from 'api/adapters'

// 存储操作（自动适配平台）
platformAdapter.storage.getItem('token')
platformAdapter.storage.setItem('user', JSON.stringify(data))

// 消息提示（自动适配平台）
platformAdapter.message.error('操作失败')
platformAdapter.message.success('操作成功')

// 路由跳转（自动适配平台）
platformAdapter.router.push('/pages/detail/index')
```

## 依赖说明

本项目使用以下核心依赖：
- `@dcloudio/*` - uni-app 核心包（版本：3.0.0-alpha-5000820260420001）
- `vue` - Vue 3 框架
- `vite` - 构建工具

所有依赖已安装完成 ✅

## 常见问题

### Q: 微信小程序开发时报错？
A: 确保已在 `src/manifest.json` 中配置正确的 `appid`，或留空使用测试号。

### Q: API 请求失败？
A: 检查后端服务是否运行（`pnpm dev`），开发环境会自动代理 `/jaq` 和 `/api` 请求。

### Q: 类型提示不工作？
A: 确保 TypeScript 服务已启动，在 VS Code 中使用 `Cmd+Shift+P` -> `TypeScript: Restart TS Server`

## 开发建议

1. **优先使用 H5 端开发**：调试更方便，支持 Chrome DevTools
2. **使用条件编译**：针对不同平台使用 `#ifdef` 进行条件编译
3. **复用 API 层**：所有 API 调用应通过 `request` 进行，保持类型安全
4. **使用平台适配器**：不要直接使用 `localStorage`、`uni.getStorageSync` 等平台特定 API

## 下一步

- 查看 `/MINI_PROGRAM_INTEGRATION.md` 了解完整的架构设计
- 查看 `/CLAUDE.md` 的"小程序开发"章节了解详细用法
- 开始开发你的小程序页面！
