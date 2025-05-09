## 开始
```bash
yarn install
yarn dev
```

## 构建
```bash
yarn build
yarn start:test 或 yarn start:prod
```

## 项目结构
```
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