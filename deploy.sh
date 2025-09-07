#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Fullstack App Docker Deploy  ${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_message "Docker 环境检查通过"
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  build          构建生产环境镜像"
    echo "  build:clean    清理缓存并构建生产环境镜像"
    echo "  build:test     构建测试环境镜像"
    echo "  dev            启动开发环境"
    echo "  test           启动测试环境"
    echo "  prod           启动生产环境"
    echo "  nginx          启动生产环境 + Nginx"
    echo "  stop           停止所有容器"
    echo "  restart        重启所有容器"
    echo "  logs           查看容器日志"
    echo "  clean          清理所有容器和镜像"
    echo "  help           显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 build        # 构建生产镜像"
    echo "  $0 build:clean  # 清理缓存并构建生产镜像"
    echo "  $0 build:test   # 构建测试镜像"
    echo "  $0 prod         # 启动生产环境"
    echo "  $0 test         # 启动测试环境"
    echo "  $0 dev          # 启动开发环境"
}

# 构建镜像
build_image() {
    print_message "开始构建生产环境镜像..."
    docker compose build app
    if [ $? -eq 0 ]; then
        print_message "镜像构建成功！"
    else
        print_error "镜像构建失败！"
        exit 1
    fi
}

# 清理构建缓存并构建镜像
build_image_clean() {
    print_message "清理构建缓存并构建生产环境镜像..."
    docker compose build --no-cache app
    if [ $? -eq 0 ]; then
        print_message "镜像构建成功！"
        # 清理悬空镜像
        print_message "清理悬空镜像..."
        docker image prune -f
    else
        print_error "镜像构建失败！"
        exit 1
    fi
}

# 构建测试环境镜像
build_test_image() {
    print_message "开始构建测试环境镜像..."
    docker compose build app-test
    if [ $? -eq 0 ]; then
        print_message "测试环境镜像构建成功！"
    else
        print_error "测试环境镜像构建失败！"
        exit 1
    fi
}

# 启动开发环境
start_dev() {
    print_message "启动开发环境..."
    docker compose --profile dev up -d app-dev
    print_message "开发环境已启动，访问地址: http://localhost:3606"
}

# 启动测试环境
start_test() {
    build_test_image
    print_message "启动测试环境..."
    docker compose up -d app-test
    print_message "测试环境已启动，访问地址: http://localhost:3607"
}

# 启动生产环境
start_prod() {
    build_image
    print_message "启动生产环境..."
    docker compose up -d app
    print_message "生产环境已启动，访问地址: http://localhost:3608"
}

# 启动生产环境 + Nginx
start_nginx() {
    print_message "启动生产环境 + Nginx..."
    docker compose --profile nginx up -d
    print_message "生产环境 + Nginx 已启动"
    print_message "HTTP 访问地址: http://localhost"
    print_message "HTTPS 访问地址: https://localhost (需要配置SSL证书)"
    print_message "注意: Nginx 代理到生产环境 (端口 3608)"
}

# 停止所有容器
stop_containers() {
    print_message "停止所有容器..."
    docker compose down
    print_message "所有容器已停止"
}

# 重启所有容器
restart_containers() {
    print_message "重启所有容器..."
    docker compose restart
    print_message "所有容器已重启"
}

# 查看容器日志
show_logs() {
    print_message "显示容器日志..."
    docker compose logs -f
}

# 清理所有容器和镜像
clean_all() {
    print_warning "这将删除所有相关的容器、镜像和网络，确定继续吗？(y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_message "清理所有容器、镜像和网络..."
        docker compose down --rmi all --volumes --remove-orphans
        docker system prune -f
        print_message "清理完成"
    else
        print_message "取消清理操作"
    fi
}

# 检查容器状态
check_status() {
    print_message "检查容器状态..."
    docker compose ps
}

# 主函数
main() {
    print_header
    
    # 检查 Docker 环境
    check_docker
    
    case "${1:-help}" in
        build)
            build_image
            ;;
        build:clean)
            build_image_clean
            ;;
        build:test)
            build_test_image
            ;;
        dev)
            start_dev
            ;;
        test)
            start_test
            ;;
        prod)
            start_prod
            ;;
        nginx)
            start_nginx
            ;;
        stop)
            stop_containers
            ;;
        restart)
            restart_containers
            ;;
        logs)
            show_logs
            ;;
        status)
            check_status
            ;;
        clean)
            clean_all
            ;;
        help|*)
            show_help
            ;;
    esac
}

# 执行主函数
main "$@" 