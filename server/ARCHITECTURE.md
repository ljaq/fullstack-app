# 服务端架构说明

## 架构概览

本服务端采用 **Route → Service → TypeORM** 两层业务架构：

```
┌─────────────────┐
│   Controllers   │  ← 路由处理器（HTTP、Zod 校验）
├─────────────────┤
│    Services     │  ← 业务逻辑 + 数据访问（getRepo）
├─────────────────┤
│   Database      │  ← TypeORM + SQLite
└─────────────────┘
```

## 目录结构

```
server/
├── db/                    # 数据库辅助
│   ├── data-source.ts     # DataSource 连接与 getDataSource()
│   ├── entities.ts        # 实体注册表（新增实体后在此添加）
│   ├── get-repo.ts        # getRepo(Entity)
│   └── query-helpers.ts   # paginate、existsBy
├── errors/
├── services/              # 导出模块单例（authService 等）
├── routes/
├── entities/
├── middleware/
└── utils/                 # auth、jwt、password、validate
```

## 核心概念

### Service 模块单例

```typescript
import { userService } from 'server/services/user.service'
const user = await userService.getUserById(id)
```

### 数据访问

```typescript
import { getRepo } from 'server/db/get-repo'
import { UserEntity } from 'server/entities/User'

const userRepo = await getRepo(UserEntity)
```

### 实体注册

在 [`server/db/entities.ts`](entities.ts) 显式注册实体。新增实体后追加一行即可。

> 不使用 `import.meta.glob`：`api-dev-snapshot` 插件会在 Vite 配置打包阶段加载数据库模块，`import.meta.glob` 在 Node 直跑时会报错。

### 新增功能（3 步）

1. `server/entities/product.ts` — EntitySchema
2. `server/services/product.service.ts` — `export const productService`
3. `server/routes/products/...` — 路由 + types

## 注意事项

- 密码工具：`server/utils/password.ts`；JWT 签发：`server/utils/jwt.ts`（供 dev-snapshot 使用，避免配置打包拉入 Service）
- `getCurrentUser` 通过动态 import 加载 `authService`，避免 Vite 配置阶段静态依赖链
- 错误在 Service 层抛出，由 `app.onError(appOnError)` 统一处理
