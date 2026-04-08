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

### 目录结构

```
├── app.ts                          # HTTP 入口：路由、HTML、静态资源、代理
├── server/
│   ├── routes/                     # 基于文件的后端路由（基础路径：/jaq）
│   │   ├── **/xxx.service.ts       # 领域逻辑（排除在路由扫描之外）
│   │   ├── **/xxx.schema.ts        # Zod 校验模式（排除在路由扫描之外）
│   │   └── **/xxx.snapshot.ts      # 开发 API 快照（排除在路由扫描之外）
│   │   └── **/xxx.ts               # 接口路由
│   ├── entities/                   # TypeORM 实体
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

## 后端开发

### 文件路由约定

路由通过 `vite-plugin-server-route` 从 `server/routes/**/*.ts` **自动生成**。请**不要**手动编辑 `_route.gen.ts`。

**路由处理器模式：**
```ts
// server/routes/feature/action.ts
import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { actionBody } from './action.schema'

const factory = createFactory()

export const POST = factory.createHandlers(
  requireAuth,              // 可选：认证中间件
  zValidator('json', actionBody),  // 请求校验
  async c => {
    const data = c.req.valid('json')
    // 调用服务层处理业务逻辑
    return c.json(result)
  }
)
```

**动态片段**：使用 `[id].ts` 表示 `/jaq/feature/:id`

**服务层**：将业务逻辑放在 `*.service.ts` 中（同目录、同前缀）。路由处理器应保持精简：认证、校验、调用服务、HTTP 响应。

**中间件与认证：**
- `requireAuth` — 受保护路由中间件（来自 `server/utils/auth.ts`）
- `getCurrentUser(c)` — 获取已认证用户
- `setAuthCookie(c, { userId })` — 设置认证 Cookie
- `verifyPassword`、`hashPassword` — 密码工具

### 校验

在 `*.schema.ts` 文件中使用 Zod 校验模式配合 `server/utils/zod-validator`。校验失败返回 `{ message, issues }` 结构供前端表单显示。

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
