# 多阶段构建 - 构建阶段
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 生产阶段
FROM node:22-alpine AS production

# 安装生产依赖
WORKDIR /app
COPY package.json yarn.lock ./

# 从构建阶段复制构建产物
COPY --from=builder /app/build ./build

# 复制必要的配置文件
COPY .env.production ./.env

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S ljaq -u 1001

# 更改文件所有权
RUN chown -R ljaq:nodejs /app
USER ljaq

# 暴露端口
EXPOSE 3606

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3606/jaq/hello', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用
CMD ["node", "build/app.js"] 