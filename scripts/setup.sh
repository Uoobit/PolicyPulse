#!/bin/bash

# PolicyPulse 环境初始化脚本
# 路径: /mnt/okcomputer/output/scripts/setup.sh

set -e

echo "🚀 PolicyPulse 环境初始化开始..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查依赖
 check_dependencies() {
    echo -e "${BLUE}检查系统依赖...${NC}"
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker 未安装${NC}"
        echo "请访问 https://docs.docker.com/get-docker/ 安装 Docker"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
        echo -e "${RED}错误: Docker Compose 未安装${NC}"
        echo "请访问 https://docs.docker.com/compose/install/ 安装 Docker Compose"
        exit 1
    fi
    
    # 检查 Git
    if ! command -v git &> /dev/null; then
        echo -e "${RED}错误: Git 未安装${NC}"
        echo "请使用包管理器安装 Git"
        exit 1
    fi
    
    echo -e "${GREEN}✓ 所有依赖检查通过${NC}"
}

# 创建环境文件
create_env_file() {
    echo -e "${BLUE}创建环境配置文件...${NC}"
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${YELLOW}请编辑 .env 文件，填入必要的配置信息${NC}"
        echo -e "${YELLOW}至少需要配置以下项目：${NC}"
        echo -e "${YELLOW}  - SECRET_KEY${NC}"
        echo -e "${YELLOW}  - OPENAI_API_KEY${NC}"
        echo -e "${YELLOW}  - MONGODB_URL${NC}"
        echo -e "${YELLOW}  - REDIS_URL${NC}"
    else
        echo -e "${GREEN}✓ .env 文件已存在${NC}"
    fi
}

# 创建必要目录
create_directories() {
    echo -e "${BLUE}创建必要目录...${NC}"
    
    mkdir -p backend/logs
    mkdir -p backend/data/sites_custom
    mkdir -p nginx/logs
    mkdir -p frontend/public/images
    
    echo -e "${GREEN}✓ 目录创建完成${NC}"
}

# 设置文件权限
set_permissions() {
    echo -e "${BLUE}设置文件权限...${NC}"
    
    chmod +x scripts/*.sh
    chmod -R 755 backend/
    chmod -R 755 frontend/
    
    echo -e "${GREEN}✓ 权限设置完成${NC}"
}

# 下载政府数据
download_gov_data() {
    echo -e "${BLUE}下载政府树形数据...${NC}"
    
    if [ ! -f backend/data/gov_tree.json ]; then
        echo -e "${YELLOW}请手动下载 gov_tree.json 文件到 backend/data/ 目录${NC}"
        echo -e "${YELLOW}文件包含五级政府结构，约4.2k节点${NC}"
    else
        echo -e "${GREEN}✓ 政府数据文件已存在${NC}"
    fi
}

# 创建自定义站点配置示例
create_site_configs() {
    echo -e "${BLUE}创建自定义站点配置示例...${NC}"
    
    cat > backend/data/sites_custom/10001.yml << 'EOF'
# 自定义站点配置示例
site_id: 10001
name: "示例政府网站"
url: "https://example.gov.cn"
crawl_config:
  delay: 3
  timeout: 30
  headers:
    User-Agent: "PolicyPulse-Bot/1.0"
selectors:
  title: "h1"
  content: ".content"
  date: ".publish-date"
  links: ".news-list a"
category: policy
region: "北京市"
EOF

    echo -e "${GREEN}✓ 站点配置示例创建完成${NC}"
}

# 主执行流程
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}     PolicyPulse 环境初始化脚本       ${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    check_dependencies
    create_env_file
    create_directories
    set_permissions
    download_gov_data
    create_site_configs
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}环境初始化完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${BLUE}下一步操作：${NC}"
    echo -e "${BLUE}1. 编辑 .env 文件，配置必要的环境变量${NC}"
    echo -e "${BLUE}2. 运行: docker-compose up -d 启动服务${NC}"
    echo -e "${BLUE}3. 访问: http://localhost 查看应用${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# 执行主函数
main "$@"