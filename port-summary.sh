#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  端口配置总结                  ${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header

echo ""
print_message "环境端口分配:"
echo "  🟢 开发环境: http://localhost:3606"
echo "  🟡 测试环境: http://localhost:3607"
echo "  🔴 生产环境: http://localhost:3608"
echo ""

print_message "部署命令:"
echo "  ./deploy.sh dev     # 启动开发环境 (3606)"
echo "  ./deploy.sh test    # 启动测试环境 (3607)"
echo "  ./deploy.sh prod    # 启动生产环境 (3608)"
echo "  ./deploy.sh nginx   # 启动生产环境+Nginx (80/443)"
echo ""

print_message "容器名称:"
echo "  - 开发环境: fullstack-app-dev"
echo "  - 测试环境: fullstack-app-test"
echo "  - 生产环境: fullstack-app"
echo ""

print_message "环境变量配置:"
echo "  - 开发环境: 使用 .env.development"
echo "  - 测试环境: 使用 .env.development (但部署方式类似生产)"
echo "  - 生产环境: 使用 .env.production"
echo ""

print_message "API地址:"
echo "  - 开发/测试: http://47.93.55.131:5000"
echo "  - 生产环境: https://service.zhongboboye.com:4000"
echo ""

print_message "验证命令:"
echo "  ./test-env.sh       # 验证测试环境配置"
echo "  ./deploy.sh status  # 查看容器状态"
echo "  ./deploy.sh logs    # 查看容器日志" 