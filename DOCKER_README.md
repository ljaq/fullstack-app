# Docker 一键部署指南

本项目提供了完整的 Docker 部署方案，支持开发环境和生产环境的一键部署。

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存

## 🚀 快速开始

### 1. 开发环境部署

```bash
# 启动开发环境（支持热重载）
./deploy.sh dev
```

访问地址: http://localhost:3606

### 2. 测试环境部署

```bash
# 构建并启动测试环境
./deploy.sh build:test
./deploy.sh test

# 或者直接启动（会自动构建）
./deploy.sh test
```

访问地址: http://localhost:3607

### 3. 生产环境部署

```bash
# 构建并启动生产环境
./deploy.sh build
./deploy.sh prod

# 或者直接启动（会自动构建）
./deploy.sh prod
```

访问地址: http://localhost:3608

### 4. 生产环境 + Nginx 部署

```bash
# 启动生产环境 + Nginx 反向代理
./deploy.sh nginx
```

访问地址: 
- HTTP: http://localhost
- HTTPS: https://localhost (需要配置SSL证书)

## 📁 文件结构

```
├── Dockerfile              # 生产环境 Dockerfile
├── Dockerfile.dev          # 开发环境 Dockerfile
├── Dockerfile.test         # 测试环境 Dockerfile
├── docker-compose.yml      # Docker Compose 配置
├── docker-compose.override.yml  # 本地环境覆盖配置
├── nginx.conf              # Nginx 配置文件
├── deploy.sh               # 一键部署脚本
├── .dockerignore           # Docker 忽略文件
└── DOCKER_README.md        # 本文档
```

## 🛠️ 部署脚本使用

```bash
# 查看所有可用命令
./deploy.sh help

# 启动开发环境
./deploy.sh dev

# 构建测试镜像
./deploy.sh build:test

# 启动测试环境
./deploy.sh test

# 构建生产镜像
./deploy.sh build

# 启动生产环境
./deploy.sh prod

# 启动生产环境 + Nginx
./deploy.sh nginx

# 停止所有容器
./deploy.sh stop

# 重启所有容器
./deploy.sh restart

# 查看容器日志
./deploy.sh logs

# 查看容器状态
./deploy.sh status

# 清理所有容器和镜像
./deploy.sh clean
```

## 🔧 环境配置

### 环境变量

项目支持以下环境变量：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | Node.js 环境 | production |
| `VITE_ENVIRONMENT` | Vite 环境 | production |
| `VITE_PORT` | 应用端口 | 3606 |
| `VITE_THIRD_API` | 第三方API地址 | https://service.zhongboboye.com:4000 |
| `mode` | 运行模式 | production |

**测试环境特殊配置:**
- 使用 `.env.development` 的环境变量
- `NODE_ENV=development`
- `VITE_ENVIRONMENT=development`
- `VITE_THIRD_API=http://47.93.55.131:5000`

### 自定义环境变量

1. 创建 `.env` 文件：
```bash
cp .env.production .env
```

2. 修改 `docker-compose.yml` 中的环境变量：
```yaml
environment:
  - VITE_THIRD_API=your-api-url
```

## 🔒 SSL 证书配置

如需启用 HTTPS，请按以下步骤操作：

1. 将 SSL 证书文件放入 `ssl/` 目录：
```bash
mkdir ssl
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

2. 修改 `nginx.conf` 中的 SSL 配置：
```nginx
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

3. 启动带 Nginx 的服务：
```bash
./deploy.sh nginx
```

## 📊 监控和日志

### 查看容器状态
```bash
./deploy.sh status
```

### 查看实时日志
```bash
./deploy.sh logs
```

### 查看特定容器日志
```bash
docker-compose logs -f app
docker-compose logs -f app-test
docker-compose logs -f nginx
```

## 🔄 更新部署

### 代码更新后重新部署
```bash
# 停止现有容器
./deploy.sh stop

# 重新构建并启动
./deploy.sh build
./deploy.sh prod
```

### 仅重启应用（不重新构建）
```bash
./deploy.sh restart
```

## 🧹 清理资源

### 清理所有容器和镜像
```bash
./deploy.sh clean
```

### 手动清理
```bash
# 停止并删除容器
docker-compose down

# 删除镜像
docker-compose down --rmi all

# 删除卷
docker-compose down --volumes

# 清理未使用的资源
docker system prune -f
```

## 🐛 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   lsof -i :3606
   
   # 修改 docker-compose.yml 中的端口映射
   ports:
     - "3607:3606"  # 改为其他端口
   ```

2. **构建失败**
   ```bash
   # 清理缓存重新构建
   docker system prune -f
   ./deploy.sh build
   ```

3. **容器启动失败**
   ```bash
   # 查看详细日志
   docker-compose logs app
   
   # 检查环境变量
   docker-compose config
   ```

4. **内存不足**
   ```bash
   # 增加 Docker 内存限制
   # 在 Docker Desktop 设置中调整内存限制
   ```

### 健康检查

应用包含健康检查端点：
- 健康检查: http://localhost:3606/jaq/hello

### 调试模式

开发环境支持调试：
```bash
# 进入容器调试
docker-compose exec app-dev sh

# 查看实时日志
docker-compose logs -f app-dev
```

## 📈 性能优化

### 镜像优化
- 使用多阶段构建减少镜像大小
- 使用 Alpine Linux 基础镜像
- 排除不必要的文件（.dockerignore）

### 运行时优化
- 启用 Nginx 缓存
- 配置 Gzip 压缩
- 使用非 root 用户运行

### 监控建议
- 定期检查容器资源使用情况
- 监控应用日志
- 设置日志轮转

## 🤝 贡献

如需修改部署配置，请：

1. 修改相应的配置文件
2. 测试部署脚本
3. 更新本文档
4. 提交 Pull Request

## 📞 支持

如遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查容器日志
3. 提交 Issue 并附上详细错误信息 