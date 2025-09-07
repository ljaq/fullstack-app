## 开始

### 本地开发
```bash
yarn install
yarn dev
```

### node 部署
```bash
## 安装依赖
yarn install
yarn build

# 测试环境
yarn start:test

# 生产环境
yarn start:prod
```

### Docker 部署
```bash
# 测试环境
./deploy.sh test

# 生产环境
./deploy.sh prod

# 停止所有容器
./deploy.sh stop

# 重启所有容器
./deploy.sh restart

# 查看帮助
./deploy.sh help
```