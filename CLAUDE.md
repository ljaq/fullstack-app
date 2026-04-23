# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 常用命令

```bash
# 开发
pnpm dev                    # 启动 Vite + Hono 开发服务器（开发模式）
pnpm dev:production         # 以生产模式启动开发服务器

# 构建
pnpm build                  # 清理并构建前端和后端
pnpm build:client           # 构建多页前端（输出到 build/public/）
pnpm build:server           # 构建服务端入口（输出到 build/app.js）

# 生产
pnpm start:test             # 在开发环境下运行生产构建
pnpm start:prod             # 在生产环境下运行生产构建

# 小程序（需要单独安装依赖）
cd mini-program && pnpm install
pnpm dev:mini               # 启动小程序 H5 开发
pnpm dev:mp-weixin          # 启动微信小程序开发

# 工具
pnpm generate               # 运行代码生成脚本
```

## 架构概览

这是一个使用 Vite 8 作为前后端统一工具链的**全栈一体化 monorepo**。

### 核心设计原则

1. **单一入口点**：根目录的 `app.ts` 作为 HTTP 入口，在开发过程中的单个进程内挂载 Hono 路由、多页 HTML 模板、静态资源和 `/api/*` 代理。

2. **双 HTTP 命名空间**：
   - `/jaq/*` — 来自 `server/routes/` 的自定义业务 API（自动扫描的文件路由）
   - `/api/*` — 代理到 `VITE_THIRD_API` 用于第三方服务

3. **端到端类型安全**：`app.ts` 导出 `AppType`，由 `api/index.ts` 使用以创建类型对齐的请求客户端。这意味着 `request.jaq.auth.login.post()` 精确对应后端路由 `/jaq/auth/login`。

4. **基于文件的路由**：
   - 后端：`server/routes/**/*.ts` → 通过 `vite-plugin-server-route` 生成 HTTP 路由
   - 前端：`client/pages/<page>/routes/**/*.tsx` → 通过 `vite-plugin-client-route` 生成 React Router 路由

### 服务端架构：三层模式 + 依赖注入

```
├── app.ts                          # HTTP 入口：路由、HTML、静态资源、代理
├── server/
│   ├── routes/                     # 基于文件的后端路由（基础路径：/jaq）
│   │   ├── **/xxx.schema.ts        # Zod 校验模式（排除在路由扫描之外）
│   │   └── **/xxx.snapshot.ts      # 开发 API 快照（排除在路由扫描之外）
│   │   └── **/xxx.ts               # 接口路由（控制器层）
│   ├── services/                   # 业务逻辑层（Service）
│   │   ├── auth.service.ts         # 认证服务
│   │   ├── user.service.ts         # 用户服务
│   │   └── role.service.ts         # 角色服务
│   ├── repositories/               # 数据访问层（Repository）
│   │   ├── user.repository.ts      # 用户数据访问
│   │   └── role.repository.ts      # 角色数据访问
│   ├── container/                  # 依赖注入容器
│   │   ├── container.ts            # DI 容器实现
│   │   ├── register-services.ts    # 服务注册
│   │   └── service-helpers.ts      # 服务访问辅助函数
│   ├── errors/                     # 错误处理
│   │   ├── app-error.ts            # 自定义错误类
│   │   └── error-handler.ts        # 全局错误处理中间件
│   ├── entities/                   # TypeORM 实体
│   ├── middleware/                 # 中间件
│   ├── db.ts                       # 数据库连接
│   └── utils/                      # 共享工具（auth、zod-validator 等）
├── client/
│   └── pages/                      # 多页应用（每个都是独立的 SPA）
│       └── <page>/                 # 例如：cms、login、404
│           ├── index.html          # 页面入口
│           ├── main.tsx            # React 启动文件
│           ├── App.tsx             # 根组件
│           └── routes/             # 基于文件的前端路由
├── api/                            # 类型安全的 API 客户端
│   ├── api.ts                      # URL 树（镜像后端结构）
│   └── index.ts                    # 用于请求链的 createApiProxy
├── types/                          # 共享的 TypeScript 类型
└── utils/                          # 共享工具
```

### 架构设计原则

**三层架构：**
- **Controller（路由层）**：处理 HTTP 请求/响应，参数校验，调用 Service
- **Service（服务层）**：处理业务逻辑，事务管理，调用 Repository
- **Repository（数据层）**：封装数据访问，与数据库交互

**依赖注入：**
- 使用轻量级 DI 容器管理服务生命周期
- 所有服务通过容器注册和解析
- 降低耦合，提升可测试性

**统一错误处理：**
- 自定义错误类型（NotFoundError、BusinessError 等）
- 全局错误处理中间件自动捕获并转换为 HTTP 响应
- 开发环境返回详细错误信息，生产环境隐藏敏感信息

## 后端开发

### 三层架构开发模式

**1. Repository 层（数据访问）**

```ts
// server/repositories/user.repository.ts
export class UserRepository {
  async findById(id: number): Promise<User | null> {
    const repo = await this.getRepo()
    return repo.findOne({ where: { id } })
  }

  async findByUsername(username: string): Promise<User | null> {
    const repo = await this.getRepo()
    return repo.findOne({ where: { username } })
  }

  // 更多数据访问方法...
}
```

**2. Service 层（业务逻辑）**

```ts
// server/services/user.service.ts
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private roleRepo: RoleRepository
  ) {}

  async createUser(input: CreateUserInput): Promise<UserView> {
    // 业务验证
    const exists = await this.userRepo.existsByUsername(input.username)
    if (exists) {
      throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')
    }

    // 创建用户
    const passwordHash = await hashPassword(input.password)
    const user = await this.userRepo.create({
      username: input.username,
      passwordHash,
      roles: input.roles || [],
    })

    return this.mapToView(user)
  }
}
```

**3. Controller 层（路由处理）**

```ts
// server/routes/users/index.ts
import { getService } from 'server/container/service-helpers'

export const POST = factory.createHandlers(
  requireAuth,
  zValidator('json', createBody),
  async c => {
    const { username, password, roles = [] } = c.req.valid('json')
    const service = getService()

    const user = await service.user.createUser({ username, password, roles })
    return c.json(user, 201)
  }
)
```

### 文件路由约定

路由通过 `vite-plugin-server-route` 从 `server/routes/**/*.ts` **自动生成**。请**不要**手动编辑 `_route.gen.ts`。

**路由处理器模式：**
```ts
// server/routes/feature/action.ts
import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { getService } from 'server/container/service-helpers'
import { actionBody } from './action.schema'

const factory = createFactory()

export const POST = factory.createHandlers(
  requireAuth,              // 可选：认证中间件
  zValidator('json', actionBody),  // 请求校验
  async c => {
    const data = c.req.valid('json')
    const service = getService()
    // 调用服务层处理业务逻辑
    const result = await service.feature.action(data)
    return c.json(result)
  }
)
```

**动态片段**：使用 `[id].ts` 表示 `/jaq/feature/:id`

**错误处理：**
```ts
import { NotFoundError, BusinessError } from 'server/errors/app-error'

// 在 Service 中抛出错误
throw new NotFoundError('用户')
throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')

// 错误会自动被全局错误处理中间件捕获并转换为适当的 HTTP 响应
```

**中间件与认证：**
- `requireAuth` — 受保护路由中间件（来自 `server/utils/auth.ts`）
- `requirePermission(code)` — 权限校验中间件
- `getCurrentUser(c)` — 获取已认证用户
- `setAuthCookie(c, { userId })` — 设置认证 Cookie
- `verifyPassword`、`hashPassword` — 密码工具

### 校验

在 `*.schema.ts` 文件中使用 Zod 校验模式配合 `server/utils/zod-validator`。校验失败会自动被错误处理中间件捕获。

## 前端开发

### 多页应用

`client/pages/<page>/` 中的每个页面都是独立的 SPA：
- 开发环境：通过 `http://localhost:PORT/<page>/*` 访问
- 生产环境：从 `build/public/` 提供服务

### 文件路由

前端路由通过 `vite-plugin-client-route` 从 `client/pages/<page>/routes/**/*.tsx` 生成。请**不要**手动编辑 `_route.gen.ts`。

**路由配置模式：**
```tsx
// routes/list/index.config.tsx
export const meta = { title: 'List', keepAlive: true }
export const loader = async () => { /* 数据加载 */ }
export const searchSchema = { /* form-render 模式 */ }
```

### API 客户端

使用类型安全的 `request` 代理进行链式 API 调用：
```ts
import { request } from 'api'

// 带 body 的 POST 请求
await request.jaq.auth.login.post({ body: { username, password } })

// 带 query 的 GET 请求
await request.jaq.roles.index.get({ query: { page: 1, pageSize: 10 } })

// 动态参数
await request.jaq.users.id({ id: '123' }).get()
```

**第三方 API**：使用 `authority` 命名空间（代理到 `/api/*`）：
```ts
await request.authority.login.post({ body: {...} })
```

**底层 Fetch**：对于非树形请求，使用 `api/fetch.ts` 中的 `Fetch`：
```ts
import { Fetch } from 'api'
await Fetch({ url: '/custom', method: 'POST', body: {...} })
```

## 环境变量

- 使用 `.env.${mode}` 文件（development、production 等）
- 服务器模式：`process.env.mode`（来自 NODE）
- 客户端模式：`import.meta.env.MODE`
- 关键变量：`VITE_PORT`、`VITE_THIRD_API`、`AUTH_SECRET`、`VITE_SSL_*`

## 路径别名

TypeScript 配置 `baseUrl: "."`，包含别名：`api`、`client`、`server`、`utils`、`types`、`core`。

## 小程序开发

### 架构设计

项目集成了基于 uni-app 的多端小程序支持，采用**平台适配器模式**实现代码复用：

```
mini-program/
├── src/
│   ├── pages/              # 页面
│   ├── components/         # 公共组件
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── manifest.json           # uni-app 应用配置
├── pages.json              # 页面路由配置
├── vite.config.ts          # Vite 配置
└── package.json            # 依赖配置
```

### 平台适配器

**API 层平台适配**（`/api/adapters/`）：
- **Web 适配器**：使用浏览器 API（localStorage、fetch、antd message）
- **小程序适配器**：使用 uni-app API（uni.getStorageSync、uni.request、uni.showToast）
- **条件编译**：通过 `#ifdef H5` / `#ifdef MP-WEIXIN` 自动选择适配器

**适配器接口**：
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

### API 调用

小程序中使用与 Web 端相同的 API 客户端，保持类型安全：

```vue
<script setup lang="ts">
import { request } from 'api'

// 完整类型提示
const login = async () => {
  const result = await request.jaq.auth.login.post({
    body: { username, password }
  })
  // 处理结果...
}
</script>
```

### 条件编译

使用 uni-app 的条件编译处理平台差异：

```vue
<template>
  <!-- #ifdef H5 -->
  <web-component />
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <mp-component />
  <!-- #endif -->
</template>

<script>
// #ifdef H5
import WebComponent from './web-component.vue'
// #endif

// #ifdef MP-WEIXIN
import MpComponent from './mp-component.vue'
// #endif
</script>
```

### 开发流程

1. **安装依赖**（首次运行）：
```bash
cd mini-program
pnpm install
```

2. **启动开发服务器**：
```bash
# H5 端开发
pnpm dev:mini

# 微信小程序开发
pnpm dev:mp-weixin
```

3. **构建生产版本**：
```bash
# H5 端构建
pnpm build:mini

# 微信小程序构建
pnpm build:mp-weixin
```

### 注意事项

1. **依赖管理**：mini-program 有独立的 `package.json`，需要单独安装依赖
2. **类型共享**：通过路径别名引用根目录的 `api`、`types`、`utils`
3. **代理配置**：开发环境自动代理 `/jaq` 和 `/api` 请求到后端服务（端口 3606）
4. **加密限制**：小程序环境的加密 API 有所限制，生产环境建议使用专门的加密库

