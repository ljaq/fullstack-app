# 服务端架构说明

## 🏗️ 架构概览

本服务端采用经典的三层架构模式：

```
┌─────────────────┐
│   Controllers   │  ← 路由处理器（处理 HTTP 请求/响应）
├─────────────────┤
│    Services     │  ← 业务逻辑层（处理业务规则）
├─────────────────┤
│  Repositories   │  ← 数据访问层（封装数据库操作）
├─────────────────┤
│   Database      │  ← 数据库
└─────────────────┘
```

## 📁 目录结构

```
server/
├── container/              # 依赖注入容器
│   ├── container.ts       # 容器实现
│   ├── register-services.ts  # 服务注册
│   └── service-helpers.ts    # 服务访问辅助函数
├── errors/                # 错误处理
│   ├── app-error.ts      # 自定义错误类
│   └── error-handler.ts  # 错误处理中间件
├── repositories/          # 数据访问层
│   ├── user.repository.ts
│   └── role.repository.ts
├── services/              # 业务逻辑层
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── role.service.ts
├── routes/                # 路由控制器（轻量级）
├── entities/              # TypeORM 实体
├── middleware/            # 中间件
└── utils/                 # 工具函数
```

## 🔧 核心概念

### 1. 依赖注入容器

使用依赖注入容器管理服务生命周期：

```typescript
import { getService } from 'server/container/service-helpers'

// 在路由中使用
const service = getService()
const user = await service.user.getUserById(id)
```

### 2. 统一错误处理

使用自定义错误类和全局错误处理中间件：

```typescript
import { NotFoundError, BusinessError } from 'server/errors/app-error'

// 在 Service 中抛出错误
throw new NotFoundError('用户')
throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')

// 错误会自动被错误处理中间件捕获并转换为适当的 HTTP 响应
```

### 3. Repository 层

封装所有数据访问逻辑：

```typescript
export class UserRepository {
  async findById(id: number): Promise<User | null> {
    const repo = await this.getRepo()
    return repo.findOne({ where: { id } })
  }

  async findByUsername(username: string): Promise<User | null> {
    const repo = await this.getRepo()
    return repo.findOne({ where: { username } })
  }
}
```

### 4. Service 层

处理业务逻辑，使用 Repository 进行数据访问：

```typescript
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

### 5. 路由控制器

路由处理器变得非常简洁：

```typescript
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

## 🎯 使用指南

### 创建新的功能模块

1. **创建 Repository**（在 `server/repositories/`）

```typescript
// server/repositories/product.repository.ts
export class ProductRepository {
  async findById(id: number) {
    const repo = await this.getRepo()
    return repo.findOne({ where: { id } })
  }

  // ... 其他数据访问方法
}
```

2. **创建 Service**（在 `server/services/`）

```typescript
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

  // ... 其他业务逻辑方法
}
```

3. **注册服务**（在 `server/container/register-services.ts`）

```typescript
export function registerServices() {
  // 注册 Repository
  container.registerSingleton(ServiceTokens.ProductRepository, () =>
    new ProductRepository()
  )

  // 注册 Service
  container.registerSingleton(ServiceTokens.ProductService, () => {
    const productRepo = container.resolve<ProductRepository>(
      ServiceTokens.ProductRepository
    )
    return new ProductService(productRepo)
  })
}
```

4. **添加 Service Token**（在 `server/container/container.ts`）

```typescript
export const ServiceTokens = {
  // ... 现有 tokens
  ProductService: Symbol('ProductService'),
} as const
```

5. **创建路由**（在 `server/routes/`）

```typescript
import { getService } from 'server/container/service-helpers'

export const GET = factory.createHandlers(async c => {
  const { id } = c.req.param()
  const service = getService()

  const product = await service.product.getProduct(Number(id))
  return c.json(product)
})
```

## 🔍 错误类型

可用的错误类型：

- `UnauthorizedError` (401) - 认证失败
- `ForbiddenError` (403) - 权限不足
- `NotFoundError` (404) - 资源未找到
- `ValidationError` (400) - 验证错误
- `BusinessError` (400) - 业务逻辑错误
- `InternalServerError` (500) - 服务器内部错误

## 🚀 优势

1. **清晰的分层架构** - 每层职责明确
2. **依赖注入** - 降低耦合，便于测试
3. **统一错误处理** - 错误处理一致且优雅
4. **类型安全** - 完整的 TypeScript 支持
5. **易于维护** - 代码组织清晰，便于扩展
6. **测试友好** - 通过依赖注入，易于 mock 和测试

## 📝 注意事项

1. **避免循环依赖** - Service 层不应该导入路由层
2. **错误处理** - 在 Service 层抛出错误，不在路由层手动构造错误响应
3. **数据验证** - 使用 Zod schema 在路由层验证输入
4. **事务处理** - 如需事务，在 Service 层处理

## 🔄 迁移指南

现有的 `*.service.ts` 文件仍然可以使用，但建议逐步迁移到新的架构：

1. 将静态方法转换为类方法
2. 将 `return { success: boolean, ... }` 改为抛出错误
3. 移除文件到 `server/services/` 目录
4. 更新路由以使用新的服务层
