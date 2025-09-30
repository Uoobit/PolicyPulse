#!/bin/bash

# PolicyPulse 部署脚本
# 路径: /mnt/okcomputer/output/scripts/deploy.sh

set -e

echo "🚀 PolicyPulse 部署开始..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 部署环境
ENVIRONMENT=${1:-development}

echo -e "${BLUE}部署环境: ${ENVIRONMENT}${NC}"

# 检查环境文件
check_env_file() {
    if [ ! -f .env ]; then
        echo -e "${RED}错误: .env 文件不存在${NC}"
        echo -e "${YELLOW}请先运行: ./scripts/setup.sh${NC}"
        exit 1
    fi
    
    # 检查必要的环境变量
    source .env
    if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "your-super-secret-key-here-change-this-in-production" ]; then
        echo -e "${RED}错误: SECRET_KEY 未配置${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ 环境文件检查通过${NC}"
}

# 构建镜像
build_images() {
    echo -e "${BLUE}构建 Docker 镜像...${NC}"
    
    case $ENVIRONMENT in
        "development")
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
            ;;
        "production")
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
            ;;
        *)
            docker-compose build
            ;;
    esac
    
    echo -e "${GREEN}✓ 镜像构建完成${NC}"
}

# 启动服务
start_services() {
    echo -e "${BLUE}启动服务...${NC}"
    
    case $ENVIRONMENT in
        "development")
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
            ;;
        "production")
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            ;;
        *)
            docker-compose up -d
            ;;
    esac
    
    echo -e "${GREEN}✓ 服务启动完成${NC}"
}

# 等待服务就绪
wait_for_services() {
    echo -e "${BLUE}等待服务就绪...${NC}"
    
    # 等待 MongoDB
    echo -e "${YELLOW}等待 MongoDB 就绪...${NC}"
    while ! docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" &>/dev/null; do
        sleep 2
    done
    echo -e "${GREEN}✓ MongoDB 就绪${NC}"
    
    # 等待 Redis
    echo -e "${YELLOW}等待 Redis 就绪...${NC}"
    while ! docker-compose exec -T redis redis-cli ping &>/dev/null; do
        sleep 2
    done
    echo -e "${GREEN}✓ Redis 就绪${NC}"
    
    # 等待 API 服务
    echo -e "${YELLOW}等待 API 服务就绪...${NC}"
    while ! curl -f http://localhost:8000/health &>/dev/null; do
        sleep 2
    done
    echo -e "${GREEN}✓ API 服务就绪${NC}"
    
    # 等待前端服务
    echo -e "${YELLOW}等待前端服务就绪...${NC}"
    while ! curl -f http://localhost:3000 &>/dev/null; do
        sleep 2
    done
    echo -e "${GREEN}✓ 前端服务就绪${NC}"
}

# 显示服务状态
show_status() {
    echo -e "${BLUE}服务状态:${NC}"
    docker-compose ps
    
    echo -e "${BLUE}访问地址:${NC}"
    echo -e "${GREEN}  应用: http://localhost${NC}"
    echo -e "${GREEN}  API文档: http://localhost/docs${NC}"
    echo -e "${GREEN}  健康检查: http://localhost/health${NC}"
}

# 显示日志
tail_logs() {
    echo -e "${BLUE}显示最近日志...${NC}"
    docker-compose logs --tail=50 -f
}

# 清理旧的镜像和容器
cleanup() {
    echo -e "${BLUE}清理旧的镜像和容器...${NC}"
    
    # 删除停止的容器
    docker container prune -f
    
    # 删除 dangling 镜像
    docker image prune -f
    
    # 删除 dangling 卷
    docker volume prune -f
    
    echo -e "${GREEN}✓ 清理完成${NC}"
}

# 主执行流程
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}     PolicyPulse 部署脚本             ${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    check_env_file
    build_images
    start_services
    wait_for_services
    show_status
    
    # 可选操作
    case $2 in
        "logs")
            tail_logs
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo -e "${GREEN}========================================${NC}"
            echo -e "${GREEN}部署完成！${NC}"
            echo -e "${GREEN}========================================${NC}"
            echo -e "${BLUE}使用说明：${NC}"
            echo -e "${BLUE}  - 查看日志: ./scripts/deploy.sh ${ENVIRONMENT} logs${NC}"
            echo -e "${BLUE}  - 清理环境: ./scripts/deploy.sh ${ENVIRONMENT} cleanup${NC}"
            echo -e "${BLUE}  - 停止服务: docker-compose down${NC}"
            echo -e "${BLUE}  - 重启服务: docker-compose restart${NC}"
            ;;
    esac
}

# 执行主函数
main "$@"