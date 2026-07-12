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

# 小程序（子包；首次：cd mini-program && pnpm install）
cd mini-program && pnpm dev:h5  # H5
pnpm dev:mp-weixin              # 微信：在仓库根目录执行（脚本会进入 mini-program）

# 工具
pnpm generate               # 运行代码生成脚本
pnpm test                   # 运行 node:test 单元测试
```

## 服务器部署

```bash
# 构建并启动
pnpm build
pnpm start:prod             # 生产环境（.env.production）
pnpm start:test             # 测试环境（.env.development）

# PM2 一键部署（需已安装 pnpm 与 pm2）
bash scripts/server-deploy.sh fullstack-app-prod start:prod
bash scripts/server-deploy.sh fullstack-app-dev start:test
```

## 架构概览

这是一个使用 Vite 8 作为前后端统一工具链的**全栈一体化 monorepo**。

### 核心设计原则

1. **单一入口点**：根目录的 `app.ts` 作为 HTTP 入口，在开发过程中的单个进程内挂载 Hono 路由、多页 HTML 模板、静态资源和 `/api/*` 代理。

2. **双 HTTP 命名空间**：
   - `/app/*` — 来自 `server/routes/` 的自定义业务 API（自动扫描的文件路由）
   - `/api/*` — 代理到 `VITE_THIRD_API` 用于第三方服务

3. **端到端类型安全**：`api/app-type.ts` 从 `server/routes/_route.gen` 导出 `AppType`（避免 `import type` 时拉入整份 `app.ts`），`api/index.ts` 用其创建与 Hono 路由一致的请求客户端。例如 `request.app.auth.login.post()` 对应 `/app/auth/login`。

4. **基于文件的路由**：
   - 后端：`server/routes/**/*.ts` → 通过 `vite-plugin-server-route` 生成 HTTP 路由
   - 前端：`client/pages/<page>/routes/**/*.tsx` → 通过 `vite-plugin-client-route` 生成 React Router 路由

### 服务端架构：Route → Service → TypeORM

约定以 **`server/ARCHITECTURE.md`** 为准：**业务逻辑**在 `server/services/`（导出模块单例）；`server/routes/**` 仅处理 HTTP、Zod 与 Service 调用，**不在路由目录下新增业务 `*.service.ts`**（构建仍会排除 `**/*.service.ts` 以防误扫成路由）。

```
├── app.ts                          # HTTP 入口：路由、HTML、静态资源、代理
├── server/
│   ├── routes/                     # 基于文件的后端路由（基础路径：/app）
│   │   **/xxx.types.ts             # Typia 校验类型（排除路由扫描）
│   │   **/xxx.snapshot.ts         # 开发 API 快照（排除）
│   │   **/xxx.ts                  # 控制器：鉴权、校验、调用 Service、响应
│   ├── services/                   # 业务逻辑层（export const xxxService）
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── role.service.ts
│   ├── db/                         # 数据访问辅助
│   │   ├── entities.ts             # 实体自动发现
│   │   ├── get-repo.ts             # getRepo(Entity)
│   │   └── query-helpers.ts        # paginate、existsBy 等
│   ├── errors/
│   │   ├── app-error.ts
│   │   └── error-handler.ts
│   ├── entities/                   # TypeORM EntitySchema
│   ├── middleware/
│   ├── db.ts                       # DataSource 连接
│   └── utils/                      # auth、password、validate 等
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

**两层业务架构（详见 `server/ARCHITECTURE.md`）：**
- **Controller（路由层）**：`server/routes/**` 处理 HTTP、Typia 校验、直接 import Service 单例
- **Service（服务层）**：`server/services/` 业务逻辑 + `getRepo()` 数据访问

**Service 模块单例：**
- 每个 Service 文件 `export const xxxService = new XxxService()`
- 路由 `import { userService } from 'server/services/user.service'`

**统一错误处理：**
- 自定义错误类型（NotFoundError、BusinessError 等）
- `app.onError(appOnError)` 自动捕获并转换为 HTTP JSON 响应
- 开发环境返回详细错误信息，生产环境隐藏敏感信息

## 后端开发

### 开发模式

**1. Service 层（业务逻辑 + 数据访问）**

```ts
// server/services/user.service.ts
import { getRepo } from 'server/db/get-repo'
import { existsBy } from 'server/db/query-helpers'
import { hashPassword } from 'server/utils/password'
import { UserEntity } from 'server/entities/User'
import { BusinessError } from 'server/errors/app-error'

class UserService {
  async createUser(input: CreateUserInput): Promise<UserView> {
    const userRepo = await getRepo(UserEntity)
    const exists = await existsBy(userRepo, 'username', input.username)
    if (exists) {
      throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')
    }

    const passwordHash = await hashPassword(input.password)
    const user = await userRepo.save(
      userRepo.create({ username: input.username, passwordHash, roles: input.roles || [] }),
    )
    return this.mapToView(user)
  }
}

export const userService = new UserService()
```

**2. Controller 层（路由处理）**

```ts
// server/routes/users/index.ts
import { userService } from 'server/services/user.service'

export const POST = factory.createHandlers(
  requireAuth,
  validate('json', createBody),
  async c => {
    const { username, password, roles = [] } = c.req.valid('json')
    const user = await userService.createUser({ username, password, roles })
    return c.json(user, 201)
  }
)
```

### 文件路由约定

路由通过 `vite-plugin-server-route` 从 `server/routes/**/*.ts` **自动生成**；`**/*.types.ts`、`**/*.snapshot.ts` 等被排除。请**不要**手动编辑 `_route.gen.ts`。

**路由处理器模式：**
```ts
// server/routes/feature/action.ts
import { validate } from 'server/utils/validate'
import { createFactory } from 'hono/factory'
import { productService } from 'server/services/product.service'
import { actionBody } from './action.types'

const factory = createFactory()

export const POST = factory.createHandlers(
  requireAuth,
  validate('json', actionBody),
  async c => {
    const data = c.req.valid('json')
    const result = await productService.action(data)
    return c.json(result)
  }
)
```

**动态片段**：使用 `[id].ts` 表示 `/app/feature/:id`

**错误处理：**
```ts
import { NotFoundError, BusinessError } from 'server/errors/app-error'

// 在 Service 中抛出错误
throw new NotFoundError('用户')
throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')

// 错误会自动被 app.onError(appOnError) 捕获并转换为适当的 HTTP 响应
```

**中间件与认证：**
- `requireAuth` — 受保护路由中间件（来自 `server/utils/auth.ts`）
- `requireAdmin` — 管理员角色校验（`roles` 含 `admin`）
- `requirePermission(code)` — 权限校验中间件
- `getCurrentUser(c)` — 获取已认证用户
- `signAuthToken` — 签发 JWT；客户端以 `Authorization: Bearer <token>` 传递（不设 Cookie）
- `verifyPassword`、`hashPassword` — 密码工具

### 校验

在 `*.types.ts` 文件中使用 Typia 接口 + `typia.createValidate()`，配合 `server/utils/validate` 中间件。校验失败会自动被错误处理中间件捕获。

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
await request.app.auth.login.post({ body: { username, password } })

// 带 query 的 GET 请求
await request.app.roles.index.get({ query: { page: 1, pageSize: 10 } })

// 动态参数（以 _ 前缀标识，如 ._id）
await request.app.users._id.get({ params: { id: '123' } })
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

主工程 Vite 使用 `tsconfigPaths`（见 `vite/config/shared.ts`），与 `tsconfig.app.json` / `tsconfig.node.json` 的 `baseUrl`、`paths` 一致；`mini-program` 子包在自有 `tsconfig` 与 `mini-program/vite.config.ts` 的 `alias` 中映射根目录的 `api`、`server`、`types` 等。

## 小程序开发

### 架构设计

项目集成了基于 uni-app 的多端小程序支持，采用**平台适配器模式**实现代码复用：

```
mini-program/
├── pages.config.ts         # 页面与 tabBar 等（defineUniPages，@uni-helper/vite-plugin-uni-pages）
├── src/
│   ├── pages/              # 页面
│   ├── pages.json          # 由插件根据 pages.config 等生成/维护
│   ├── components/         # 公共组件
│   ├── manifest.json        # uni-app 应用配置
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口
├── vite.config.ts          # Vite 5（与根目录 Vite 8 独立）
└── package.json
```

### 平台适配器

**API 层平台适配**（根目录 `api/adapters/`，子包中可通过别名指向入口）：
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
  const result = await request.app.auth.login.post({
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
cd mini-program
pnpm dev:h5           # H5
pnpm dev:mp-weixin    # 微信小程序
```

3. **构建生产版本**：
```bash
cd mini-program
pnpm build:h5         # H5
pnpm build:mp-weixin  # 微信小程序
```

或从仓库根目录使用 `pnpm dev:mp-weixin` / `pnpm build:mp-weixin`（脚本会进入 `mini-program`）。

### 注意事项

1. **依赖管理**：mini-program 有独立的 `package.json`，需要单独安装依赖
2. **类型共享**：通过路径别名引用根目录的 `api`、`types`、`utils`
3. **代理配置**：开发环境自动代理 `/app` 和 `/api` 请求到后端服务（端口 3606）
4. **加密限制**：小程序环境的加密 API 有所限制，生产环境建议使用专门的加密库

