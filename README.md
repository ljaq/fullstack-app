## 开始

### 本地开发
```bash
yarn install
yarn dev
```

### Docker 一键部署
```bash
# 安装 Docker (macOS)
./install-docker.sh

# 开发环境部署
./deploy.sh dev

# 测试环境部署
./deploy.sh test

# 生产环境部署
./deploy.sh prod

# 查看部署帮助
./deploy.sh help
```

## 构建

### 本地构建
```bash
yarn build
yarn start:test 或 yarn start:prod
```

### Docker 构建
```bash
./deploy.sh build
```

## 🐳 Docker 部署

本项目提供了完整的 Docker 部署方案，包括：

- **生产环境**: 多阶段构建，优化镜像大小
- **开发环境**: 支持热重载，便于开发调试
- **Nginx 反向代理**: 支持负载均衡和 SSL
- **一键部署脚本**: 简化部署流程

详细说明请查看 [DOCKER_README.md](./DOCKER_README.md)

## 项目结构
├─ .env.dev
├─ .env.prod
├─ .env.test
├─ .prettierrc
├─ README.md
├─ app.ts
├─ client
│  ├─ api
│  │  ├─ api.ts
│  │  ├─ index.ts
│  │  ├─ serverApi.ts
│  │  ├─ types.ts
│  │  └─ utils.ts
│  ├─ assets
│  │  └─ react.svg
│  ├─ components
│  ├─ env.d.ts
│  ├─ hooks
│  ├─ modals
│  │  ├─ CommonConfirmModal
│  │  └─ PreviewModal
│  ├─ pages
│  │  ├─ cms
│  │  │  ├─ App.tsx
│  │  │  ├─ index.html
│  │  │  ├─ index.less
│  │  │  ├─ main.tsx
│  │  │  └─ routes
│  │  └─ login
│  │     ├─ App.tsx
│  │     ├─ index.html
│  │     ├─ index.less
│  │     ├─ main.tsx
│  │     └─ routes
│  ├─ utils
│  └─ vite-env.d.ts
├─ commitlint.config.js
├─ package.json
├─ proxy.ts
├─ public
│  └─ vite.svg
├─ scripts
│  └─ generateServerApi.ts
├─ server
│  ├─ controllers
│  │  └─ token.controller.ts
│  └─ services
│     └─ token.service.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ tsconfig.server.json
├─ utils
│  └─ index.ts
├─ vite.config.ts
└─ yarn.lock
```