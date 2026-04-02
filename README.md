# Fullstack App

单仓库、**Vite 一体化**的全栈应用：开发时用同一套工具链启动 Hono 后端与多页 React 前端；构建时分别产出静态资源与 Node 可执行入口。前后端共享 TypeScript 类型，降低接口契约漂移成本。

---

## 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 构建与开发服务器 | **Vite 8**、`@hono/vite-dev-server`、`@hono/vite-build` | 开发入口为根目录 `app.ts`；HMR 与 Node 侧构建由 Hono 官方插件承接 |
| 后端框架 | **Hono 4**、`@hono/node-server`、`@hono/zod-validator` | 轻量、边缘友好；与 Vite 插件链集成顺畅 |
| 数据访问 | **TypeORM**、**SQLite**（`dev.db` / `prod.db`） | 实体在 `server/entities/`；开发期可 `synchronize`（以项目配置为准） |
| 校验 | **Zod** | 路由入参校验；配合项目封装的 `zValidator` |
| 前端框架 | **React 18**、**React Router 7** | 多页应用，每页独立 SPA |
| UI 与数据 | **Ant Design 6**、**@tanstack/react-query** | 列表/表单与服务端状态管理 |
| 认证 | **JWT**（`jsonwebtoken`）、**bcryptjs**、Cookie | 详见 `server/utils/auth.ts` |

---

## 架构特点

### 1. 单进程开发体验

- 根 **`app.ts`** 挂载：生成的 Hono 路由、多页 HTML（开发态模板编译）、静态资源，以及 **`/api/*` 第三方代理**。
- 无需单独起两个终端跑「前端 dev server + 后端进程」：由 Vite + Hono dev server 统一拉起（具体行为见 `vite/config/plugins.ts`）。

### 2. 双命名空间 HTTP

| 前缀 | 用途 |
|------|------|
| **`/jaq/*`** | 自建业务 API，由 `server/routes` 文件路由生成，与前端 `api/api.ts` 中的路径树一致 |
| **`/api/*`** | 代理到环境变量 **`VITE_THIRD_API`** 指向的第三方网关，与本地业务接口隔离 |

这样可以在同一域名下混用「自有后端」与「外部系统」，前端用 `request` 树形 API 时也能区分两类路径。

### 3. 类型贯穿前后端

- `app.ts` 导出 **`export type AppType = typeof routes`**。
- `api/index.ts` 用 **`createApiProxy<AppType, typeof api>(api)`** 将 Hono 路由类型与 `api/api.ts` 中的 URL 树关联，链式调用 **`request.jaq.*`** 时方法名、路径与后端对齐，减少手写 URL 与拼写错误。

### 4. 构建拆分：`client` / `server` 两种 mode

- **`pnpm build:client`**（`mode=client`）：多页入口来自 `client/pages/<页名>/index.html`，产物在 **`build/public/`**。
- **`pnpm build:server`**（`mode=server`）：打包 **`app.ts`** 为 Node 入口（如 **`build/app.js`**），配合 `pnpm start:prod` 等脚本运行。

生产环境下，根路径由服务端静态服务 **`build/public`**，与开发时的多页路由约定一致。

---

## 目录约定

| 路径 | 职责 |
|------|------|
| **`app.ts`** | HTTP 总入口：路由挂载、HTML、静态、`/api` 代理 |
| **`server/routes/`** | **文件即路由**；动态段用 `[id].ts` 等；生成 **`_route.gen.ts`（勿手改）** |
| **`server/routes/**/xxx.service.ts`** | 与路由同目录同名 stem：领域逻辑、数据库访问；**不参与** URL 扫描 |
| **`server/routes/**/xxx.schema.ts`** | Zod  schema，供 `zValidator`；**不参与** URL 扫描 |
| **`server/routes/**/xxx.snapshot.ts`** | 开发态 API 快照配置；**不参与** URL 扫描 |
| **`server/entities/`** | TypeORM 实体 |
| **`client/pages/<应用名>/`** | 多页之一：`index.html`、`main.tsx`、`App.tsx` |
| **`client/pages/<应用名>/routes/`** | 前端文件路由；生成 **`_route.gen.ts`**；可配 **`*.config.tsx`**（`meta`、`loader` 等） |
| **`api/`** | `request` / `Fetch`、与后端对齐的 URL 描述 |
| **`types/`**、**`utils/`** | 共享类型与工具 |

TypeScript **`baseUrl` 为项目根目录**，常用别名与 `tsconfig`/`vite` 一致（如 `api`、`client`、`server`、`types`、`utils` 等），便于跨层引用。

---

## 开发范式

### 后端：文件路由 + 薄 Handler

1. **扫描规则**：`vite-plugin-server-route` 扫描 `server/routes`，**`baseRoute` 为 `/jaq`**；排除 `*.service.ts`、`*.schema.ts`、`*.snapshot.ts`。
2. **导出约定**：每个路由文件导出大写 HTTP 方法名 **`GET` / `POST` / `PUT` / `DELETE`**，与 Hono 习惯一致。
3. **典型流水线**：`createFactory()` → **`requireAuth`**（若需）→ **`zValidator('json' | 'param', schema)`** → 异步 handler → **`c.json`**。
4. **职责拆分**：路由文件只做鉴权、校验、调用 **`*.service.ts`**、返回 HTTP 状态与 JSON；复杂查询与事务放在 service。
5. **错误与校验**：校验失败使用项目统一的 `zValidator` 响应结构（如 `message` + `issues`），便于表单展示；业务错误用 `return c.json({ message: '...' }, 4xx)`。

### 前端：多页 SPA + 文件路由

1. **`client/pages` 下每个子目录** 是一套独立 SPA；开发时访问 **`/<页名>/*`** 由 `app.ts` 返回对应 `index.html`（经 `compileHtml` 注入环境变量）。
2. **`vite-plugin-client-route`** 扫描各页的 `routes/`，生成懒加载路由表；同路径可有 **`*.config.tsx`** 导出 `meta`、`loader`、`searchSchema` 等，与 React Router 的 `RouteObject` 融合。
3. **数据请求**：页面统一 **`import { request } from 'api'`**；分页等 query 字段与后端 `c.req.query()` 约定一致（如 `page`、`pageSize`）。

### API 客户端

- **链式调用**：路径与 `api/api.ts` 的嵌套对象一致，HTTP 方法为小写 **`.get` / `.post` / `.put` / `.delete`**。
- **传参**：`.post({ body })`、`.get({ query })`、动态段 **`.params({ id })`**。
- **与 `Fetch` 区分**：`request` 走类型安全的树；`Fetch` 用于非树形或一次性完整 `RequestConfig`。
- **运行时**：默认 `credentials: 'include'`、JSON、`Authorization`（如 localStorage token）；**401** 可触发跳转登录（可按需配置）。

### 开发快照（可选）

- 启用 **`vite-plugin-api-dev-snapshot`**（可通过环境变量如 **`VITE_API_DEV_SNAPSHOT`** 关闭）时，可为接口录制/回放快照，便于无后端或稳定联调（详见插件与 `*.snapshot.ts`）。

---

## 环境变量

- 使用 **`.env.${mode}`** 形式；`app.ts` 中根据是否服务端构建加载 **`process.env.mode`** 或 **`import.meta.env.MODE`** 对应文件。
- 常见项：**`VITE_PORT`**、**`VITE_THIRD_API`**、**`AUTH_SECRET`**、HTTPS 相关 **`VITE_SSL_*`**（若启用）等；远程库脚本可能使用 **`TURSO_*`**。

请以仓库内示例或部署文档为准补全具体键名。

---

## 常用脚本

| 命令 | 说明 |
|------|------|
| **`pnpm dev`** | 开发：Vite + Hono dev server（`--host` 可按需访问局域网） |
| **`pnpm build`** | 先 `build:client` 再 `build:server`，清空 `build/` 后全量构建 |
| **`pnpm start:test` / `pnpm start:prod`** | 使用 **`build/app.js`** 启动（配合 **`mode`** 环境变量） |
| **`pnpm seed`** | 种子数据（`tsx scripts/seed.ts`） |
| **`pnpm db:init`** | 与 Turso / libsql 相关的初始化脚本（需配置对应环境变量） |
| **`pnpm generate`** | 项目内代码生成（见 `scripts/generate.mjs`） |

---

## 架构优势小结

1. **一套工具链**：开发、类型检查、构建路径统一，降低心智负担。  
2. **约定优于配置**：前后端均为「文件系统路由 + 生成器」，新增接口或页面多半是加文件而非中央注册表。  
3. **端到端类型**：`AppType` + `api` 树减少前后端契约错误。  
4. **清晰分层**：`schema` / `service` / 路由职责分明，便于测试与复用。  
5. **多页隔离**：不同子应用（如 `cms` 与其他页）可独立演进、独立构建入口，适合中大型后台或多场景前台。
