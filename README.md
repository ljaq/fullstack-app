# Fullstack App

基于 Vite 8 + Hono + React 的全栈一体化 monorepo 项目，采用三层架构模式和依赖注入设计。

## 📚 文档

- [CLAUDE.md](CLAUDE.md) - Claude Code 工作指导
- [server/ARCHITECTURE.md](server/ARCHITECTURE.md) - 服务端架构详细说明

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

## 📚 文档

- [CLAUDE.md](CLAUDE.md) - Claude Code 工作指导
- [server/ARCHITECTURE.md](server/ARCHITECTURE.md) - 服务端架构详细说明

## 架构概览

这是一个使用 Vite 8 作为前后端统一工具链的**全栈一体化 monorepo**。

### 核心设计原则

1. **单一入口点**：根目录的 `app.ts` 作为 HTTP 入口，在开发过程中的单个进程内挂载 Hono 路由、多页 HTML 模板、静态资源和 `/api/*` 代理。

2. **双 HTTP 命名空间**：
   - `/app/*` — 来自 `server/routes/` 的自定义业务 API（自动扫描的文件路由）
   - `/api/*` — 代理到 `VITE_THIRD_API` 用于第三方服务

3. **端到端类型安全**：`app.ts` 导出 `AppType`，由 `api/index.ts` 使用以创建类型对齐的请求客户端。这意味着 `request.app.auth.login.post()` 精确对应后端路由 `/app/auth/login`。

4. **基于文件的路由**：
   - 后端：`server/routes/**/*.ts` → 通过 `vite-plugin-server-route` 生成 HTTP 路由
   - 前端：`client/pages/<page>/routes/**/*.tsx` → 通过 `vite-plugin-client-route` 生成 React Router 路由

### 目录结构

```
├── app.ts                          # HTTP 入口：路由、HTML、静态资源、代理
├── server/
│   ├── routes/                     # 基于文件的后端路由（基础路径：/app）
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

### 服务端架构特点

**三层架构模式：**
- **Controller（路由层）**：处理 HTTP 请求/响应，参数校验，调用 Service
- **Service（服务层）**：处理业务逻辑，事务管理，调用 Repository
- **Repository（数据层）**：封装数据访问，与数据库交互

**依赖注入容器：**
- 轻量级 DI 容器管理服务生命周期
- 降低耦合，提升可测试性
- 统一的服务注册和解析机制

**统一错误处理：**
- 自定义错误类型（NotFoundError、BusinessError 等）
- 全局错误处理中间件自动捕获并转换为 HTTP 响应
- 开发/生产环境不同的错误信息展示策略

### 架构优势

1. **清晰的分层架构** - 每层职责明确，易于理解和维护
2. **依赖注入** - 降低耦合，提升可测试性
3. **统一错误处理** - 错误处理一致且优雅
4. **类型安全** - 完整的 TypeScript 支持
5. **易于扩展** - 新增功能遵循相同模式即可
6. **测试友好** - 通过依赖注入，易于 mock 和测试

## 后端开发

### 三层架构开发指南

**创建新功能的步骤：**

1. **定义 Repository**（数据访问层）
```ts
// server/repositories/product.repository.ts
export class ProductRepository {
  async findById(id: number) {
    const repo = await this.getRepo()
    return repo.findOne({ where: { id } })
  }
}
```

2. **定义 Service**（业务逻辑层）
```ts
// server/services/product.service.ts
export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  async getProduct(id: number) {
    const product = await this.productRepo.findById(id)
    if (!product) {
      throw new NotFoundError('产品')
    }
    return product
  }
}
```

3. **注册服务**（依赖注入）
```ts
// server/container/register-services.ts
container.registerSingleton(ServiceTokens.ProductRepository, () =>
  new ProductRepository()
)
container.registerSingleton(ServiceTokens.ProductService, () => {
  const productRepo = container.resolve<ProductRepository>(
    ServiceTokens.ProductRepository
  )
  return new ProductService(productRepo)
})
```

4. **创建路由**（控制器层）
```ts
// server/routes/products/[id].ts
import { getService } from 'server/container/service-helpers'

export const GET = factory.createHandlers(async c => {
  const { id } = c.req.param()
  const service = getService()

  const product = await service.product.getProduct(Number(id))
  return c.json(product)
})
```

### 错误处理

```ts
import { NotFoundError, BusinessError, UnauthorizedError } from 'server/errors/app-error'

// 在 Service 中抛出错误
throw new NotFoundError('用户')
throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')
throw new UnauthorizedError('登录已过期')

// 错误会自动被全局错误处理中间件捕获并转换为适当的 HTTP 响应
```

### 文件路由约定

路由通过 `vite-plugin-server-route` 从 `server/routes/**/*.ts` **自动生成**。

**路由处理器模式：**
```ts
import { getService } from 'server/container/service-helpers'

export const POST = factory.createHandlers(
  requireAuth,
  zValidator('json', createBody),
  async c => {
    const data = c.req.valid('json')
    const service = getService()
    const result = await service.feature.action(data)
    return c.json(result)
  }
)
```

**中间件与认证：**
- `requireAuth` — 受保护路由中间件
- `requirePermission(code)` — 权限校验中间件
- `getCurrentUser(c)` — 获取已认证用户
- `setAuthCookie(c, { userId })` — 设置认证 Cookie

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

// 动态参数
await request.app.users.id({ id: '123' }).get()
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
